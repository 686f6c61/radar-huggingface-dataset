# liodon-ai/Llama-3.2-3B-Instruct-ONNX

## Resumen

`liodon-ai/Llama-3.2-3B-Instruct-ONNX` es una exportación al formato ONNX del modelo `unsloth/Llama-3.2-3B-Instruct`, publicada por Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos y grafo computacional pensada para su ejecución con ONNX Runtime en lugar de PyTorch, lo que permite desplegar el modelo en entornos donde el stack de inferencia está estandarizado sobre ONNX (servicios en C#/.NET, Java, C++, aplicaciones de escritorio o dispositivos periféricos). La exportación se realizó con `optimum` (tarea `text-generation-with-past`), de modo que el grafo expone entradas y salidas de clave-valor (`past_key_values`) y permite decodificación autorregresiva con caché KV.

El modelo subyacente es un transformer decoder-only de la familia Llama 3.2, en su variante Instruct de aproximadamente 3.200 millones de parámetros, con una ventana de contexto nominal de 131.072 tokens heredada del modelo base. Al ser una conversión y no un reentrenamiento, sus capacidades son las del modelo original: diálogo multi-turno, seguimiento de instrucciones, generación de código, razonamiento básico y soporte de llamadas a herramientas en el estilo de plantilla de Llama 3.1/3.2.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas exportaciones ONNX de Llama 3.2 3B disponibles con licencia heredada del modelo original; por otro, advierte de una inconsistencia importante entre los archivos listados en la model card y el ejemplo de uso de la misma, que referencia un archivo cuantizado que no aparece en el inventario publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), exportado como grafo ONNX con `task=text-generation-with-past` (caché KV expuesta como entradas/salidas) |
| Parametros totales | ~3.200 millones en el modelo base (dato estándar de Llama 3.2 3B; no se explicita en la model card del export) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base (no se declara explícitamente en la model card del export) |
| Tipos de cuantizacion | Solo FP32 (`model.onnx`) y FP16 (`model_fp16.onnx`) en el inventario publicado. El ejemplo de código menciona `model_quantized.onnx`, que no figura en la tabla de archivos: no disponible |
| Idiomas soportados | No declarados en la model card del export. El modelo base Meta cubre oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | `other` (heredada del modelo base; corresponde a la Llama 3.2 Community License, no verificada en la información disponible) |
| Formato de pesos | ONNX (grafo único). Tamaño del repositorio: 22,2 GB; `model.onnx` 14,43 GB (FP32) y `model_fp16.onnx` 7,74 GB (FP16) |

## Arquitectura y entrenamiento

El export reproduce la arquitectura del modelo base sin modificaciones estructurales: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), que reduce el número de cabezas de clave-valor respecto a las de consulta y, con ello, el coste de memoria de la caché KV. La exportación con `optimum.exporters.onnx.main_export` bajo la tarea `text-generation-with-past` genera un grafo que acepta tensores `past_key_values.*.key` y `past_key_values.*.value`; en la primera pasada deben suministrarse como tensores de longitud cero, y `optimum.onnxruntime.ORTModelForCausalLM` gestiona esa contabilidad de forma automática. El repositorio no incluye variantes con salidas múltiples ni versiones separadas para decodificación especulativa.

No hay información en la model card sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO), ni sobre el proceso de conversión a ONNX (versión de `optimum`, opset empleado, estrategia de trazado, verificación numérica frente al checkpoint original). Tampoco se documenta si la exportación preserva exactamente el tokenizador del modelo base; el ejemplo de uso carga el tokenizador directamente desde el repositorio del export, lo que sugiere que sí se incluyen los ficheros correspondientes, aunque no se detallan en el inventario. El checkpoint de origen es la versión de Unsloth, que a su vez es una redistribución de los pesos de Meta con posibles conversiones de formato intermedias; la model card no especifica qué se conserva de esa cadena.

## Capacidades

- Generación de texto y diálogo multi-turno con plantilla de chat de Llama 3.x, incluyendo rol de sistema.
- Seguimiento de instrucciones y tareas de transformación de texto (resumen, reescritura, extracción, clasificación con formato guiado).
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, etc.), con calidad propia de un modelo de 3B: adecuada para autocompletado y fragmentos cortos, limitada en refactorizaciones extensas.
- Razonamiento aritmético y lógico de complejidad baja o media, con degradación notable en problemas de varios pasos.
- Soporte de llamadas a herramientas mediante el formato de herramientas de Llama 3.1/3.2 (el modelo base está entrenado para ello; la model card del export no lo verifica).
- Capacidad de razonamiento multi-paso encadenado dentro de una misma generación, aunque sin modo "thinking" explícito.
- Multilingüismo limitado a los idiomas cubiertos por el modelo base; el export no añade ni certifica cobertura lingüística.
- Ejecución con caché KV persistente entre pasos, lo que habilita conversaciones largas sin recomputar el prefijo.
- Sin capacidades de visión, audio ni multimodalidad: es un modelo estrictamente de texto.

## Casos de uso

- Integración en servicios .NET o Java: el formato ONNX permite cargar el modelo con ONNX Runtime sin dependencias de PyTorch ni de CUDA Toolkit en el host, lo que encaja en backends corporativos donde el runtime nativo está estandarizado y el despliegue de Python está restringido.
- Asistentes de documentación técnica: con la ventana de 131.072 tokens del modelo base, se pueden pasar manuales completos o varios ficheros de código como contexto y generar respuestas ancladas al material, siempre que la memoria disponible soporte la caché KV correspondiente.
- Procesamiento por lotes en CPU: la variante FP32 y una eventual versión cuantizada permiten clasificación de tickets, extracción de entidades y etiquetado de textos en servidores sin GPU, a coste por token muy bajo y con latencia tolerable en modo offline.
- Prototipado rápido en aplicaciones de escritorio: modelos de 3B en FP16 (7,74 GB) caben en GPUs de consumo con 12 GB o más, lo que permite distribuir un asistente local sin conexión dentro de una aplicación de escritorio.
- Generación de código asistida en pipelines de CI: el modelo puede invocarse para redactar mensajes de commit, descripciones de pull request o borradores de tests, con la ventaja de que el artefacto ONNX se puede versionar y desplegar como binario inmutable.
- Enrutamiento y preprocesado en arquitecturas multi-modelo: por su tamaño, es adecuado como primer eslabón (clasificar la consulta, decidir si requiere un modelo mayor, reformular la pregunta) antes de escalar a un modelo de mayor capacidad.
- Filtrado y moderación de contenido en local: se puede afinar o guiar por prompt para etiquetar textos sensibles sin enviar datos a una API externa, lo que simplifica el cumplimiento de requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export no incluye ninguna métrica de calidad, latencia ni throughput, ni comparación con el checkpoint original en PyTorch. Los únicos datos numéricos de terceros recogidos en la búsqueda web son:

| Fuente | Dato | Naturaleza |
|---|---|---|
| PromptLayer (página de modelos) | Hasta 39x de aceleración en A100 GPU con cuantización int4 | Terceros, no verificado; se refiere a una variante ONNX int4 de Llama 3.2 3B Instruct, no necesariamente a este repositorio |
| EmergentMind (resumen del modelo base) | Valores IFS de hasta 0,9 en seguimiento de instrucciones; mejoras de hasta 37,1 puntos en benchmarks de instruction-following | Terceros, no verificado; corresponde al modelo base, no al export |

No se debe asumir que estas cifras apliquen a este repositorio concreto, que solo publica pesos FP32 y FP16.

## Requisitos de hardware

- VRAM para FP32: el grafo `model.onnx` ocupa 14,43 GB, por lo que se necesitan aproximadamente 16-17 GB de memoria libre en GPU para pesos más activaciones y caché de una conversación corta; en CPU requiere del orden de 16 GB de RAM más el overhead del runtime.
- VRAM para FP16: `model_fp16.onnx` ocupa 7,74 GB; con caché KV para unos miles de tokens, una GPU de 12-16 GB es suficiente (RTX 4070 Ti Super, RTX 4080, RTX 4090, L4, A10).
- Caché KV a contexto largo: con la arquitectura GQA del modelo base (24 capas, 8 cabezas KV, dimensión de cabeza 128) la caché en FP16 ronda los 96 KiB por token, es decir, unos 12 GB adicionales para 131.072 tokens. Es una estimación derivada de la arquitectura, no un dato publicado; usarla como cota orientativa.
- ¿Cabe en GPU de consumo? Sí: en FP16 cabe en tarjetas de 12 GB o más con contexto moderado; en FP32 requiere 24 GB (RTX 3090/4090) o el uso de CPU.
- Proveedores de ejecución: `CPUExecutionProvider` (documentado en la model card), `CUDAExecutionProvider` y `TensorrtExecutionProvider` para GPU; `DirectMLExecutionProvider` en Windows; `QNNExecutionProvider` o `OpenVINOExecutionProvider` para aceleradores específicos.
- Frameworks de despliegue: ONNX Runtime (directo), `optimum.onnxruntime.ORTModelForCausalLM` con Transformers, y servidores compatibles con ONNX como Triton Inference Server con backend ONNX Runtime. No hay artefactos GGUF en el repositorio, por lo que llama.cpp y Ollama no son aplicables sin una conversión adicional.
- Latencia y throughput: no disponibles. No se publican mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| `liodon-ai/Llama-3.2-3B-Instruct-ONNX` (este) | ~3,2B | 131.072 (heredado del base) | ONNX | FP32 y FP16 | `other` | Export con caché KV; sin benchmarks publicados; ejemplo de código inconsistente |
| `onnx-community/Llama-3.2-3B-Instruct-ONNX` | ~3,2B | 131.072 | ONNX | No detallado en la información disponible | Licencia del modelo base | Export de referencia de la comunidad ONNX de Hugging Face; misma tarea, mismo modelo de partida |
| `liodon-ai/Llama-3.2-3B-Instruct-FP8` | ~3,2B | 131.072 | Pesos FP8 (formato de runtime no detallado) | FP8 | `other` | Alternativa del mismo autor orientada a menor huella de memoria en GPU |
| `Arm/llama-3.2-3b-instruct-onnx-genai-int4-kquantlast-emb-int8` | ~3,2B | 131.072 | ONNX | INT4 en pesos con activaciones INT8 dinámicas, embeddings y LM head en INT8 | Licencia del modelo base | Optimizado para Arm Ethos-U/CPU; pensado para almacenamiento compacto y baja memoria |

No se dispone de datos verificados de rendimiento para establecer una comparación cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Inconsistencia documental: el ejemplo de código carga `model_quantized.onnx`, pero la tabla de archivos solo lista `model.onnx` (FP32) y `model_fp16.onnx` (FP16). Ese fichero cuantizado no consta en el inventario publicado; si se ejecuta el snippet tal cual, fallará.
- Calidad limitada por el tamaño: con ~3,2B de parámetros, el modelo comete errores en razonamiento de varios pasos, matemáticas complejas y generación de código extenso; no es adecuado como sustituto de modelos de 30B o superiores en tareas de alta exigencia.
- Riesgo de alucinación: inherente al modelo base, especialmente en preguntas factuales, referencias bibliográficas y API inexistentes. No hay en la model card ninguna evaluación de factualidad ni mecanismo de mitigación.
- Sesgos: no documentados en la información disponible. El modelo base hereda los sesgos de sus datos de entrenamiento; el export no los corrige ni los evalúa.
- Idiomas: la model card del export no declara cobertura lingüística. El rendimiento fuera de los ocho idiomas oficiales del modelo base es previsiblemente pobre.
- Licencia: la ficha indica `other`. Se trata de la licencia del modelo base (Llama 3.2 Community License), que impone condiciones adicionales a la licencia Apache o MIT: umbral de 700 millones de usuarios mensuales para requerir licencia comercial adicional, obligación de incluir el aviso de atribución "Built with Llama", restricciones de uso y cláusula de terminación. Es imprescindible revisar el texto íntegro antes de un uso comercial, y confirmar si el export de terceros añade condiciones propias.
- Trazabilidad: no se documentan la versión de `optimum`, el opset de ONNX ni ninguna verificación de equivalencia numérica entre el grafo exportado y el checkpoint de PyTorch. En producción conviene validar la perplejidad o la coincidencia de logits frente al original.
- Contexto largo: aunque el modelo base admite 131.072 tokens, no hay garantía de que el grafo exportado gestione correctamente esa longitud sin pruebas; además, la caché KV a esa escala consume más memoria que los propios pesos.
- Sin soporte multimodal, de audio ni de visión; no apto para tareas que requieran esos modos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/liodon-ai/Llama-3.2-3B-Instruct-ONNX
- Modelo base (checkpoint de origen): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Variante FP8 del mismo autor: https://huggingface.co/liodon-ai/Llama-3.2-3B-Instruct-FP8
- Export ONNX de referencia de la comunidad: https://huggingface.co/onnx-community/Llama-3.2-3B-Instruct-ONNX/blob/main/README.md
- Variante INT4 para Arm: https://developer.arm.com/ai/models/hugging-face/Arm/llama-3-2-3b-instruct-onnx-genai-int4-kquantlast-emb-int8/llama-3.2-3b-instruct-int4-onnx
- Herramienta de exportación (optimum): https://github.com/huggingface/optimum
- Resumen del modelo base en EmergentMind: https://www.emergentmind.com/topics/llama-3-2-3b-instruct
- Ficha de terceros con datos de aceleración int4: https://www.promptlayer.com/models/llama-32-3b-instruct-onnx/
