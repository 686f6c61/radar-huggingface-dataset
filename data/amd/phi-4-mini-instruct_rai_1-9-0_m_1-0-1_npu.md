# amd/Phi-4-mini-instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

Phi-4-mini-instruct_rai_1.9.0_m_1.0.1_npu es una distribucion optimizada del modelo Phi-4-mini-instruct de Microsoft, publicada por AMD para su plataforma Ryzen AI. El artefacto empaqueta los pesos en formato ONNX y los adapta al runtime Ryzen AI 1.9.0 con el perfil de compilacion m_1.0.1_npu, de modo que la inferencia se ejecuta sobre la NPU integrada en los procesadores AMD Ryzen AI (familia Strix Point y posteriores) en lugar de la CPU o la GPU.

El modelo base es un transformer denso de aproximadamente 3.800 millones de parametros, disenado por Microsoft Research para tareas de instruccion, razonamiento y generacion de texto con ventana de contexto de 128.000 tokens. AMD no modifica los pesos ni el entrenamiento: su aportacion es la conversion a ONNX, la compilacion con las herramientas de Ryzen AI y la publicacion de un paquete listo para desplegar en local.

Su relevancia es practica: permite ejecutar un modelo de 3.800 millones de parametros en un portatil o mini-PC con Ryzen AI sin GPU dedicada, con consumo energetico bajo y sin enviar datos a la nube. El repositorio esta restringido (gated) y requiere aceptar las condiciones en Hugging Face antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), modelo base Phi-4-mini-instruct de Microsoft, exportado a ONNX para Ryzen AI |
| Parametros totales | aproximadamente 3.800 millones (modelo base Phi-4-mini-instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun el modelo base; el limite efectivo del paquete ONNX no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible en la ficha del repositorio; el perfil m_1.0.1_npu implica una compilacion especifica para NPU Ryzen AI |
| Idiomas soportados | ingles (tag en); el modelo base es multilingue pero el paquete declara solo ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (compilado para Ryzen AI 1.9.0, perfil m_1.0.1_npu) |
| Tamano del repositorio | 3,8 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-4-mini-instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), activaciones SwiGLU y normalizacion RMSNorm, entrenado por Microsoft Research sobre un corpus filtrado de datos web y sinteticos con un pipeline posterior de ajuste por instrucciones y preferencias. Microsoft no publica el desglose exacto de tokens de entrenamiento del modelo base en la informacion disponible.

AMD no reentrena ni aplica tecnicas adicionales de alineacion: su trabajo consiste en exportar los pesos a ONNX, compilarlos con el compilador de Ryzen AI 1.9.0 para el perfil m_1.0.1_npu y validar la ejecucion sobre la NPU XDNA. Esto implica que el grafo se particiona entre NPU y CPU, y que ciertas operaciones (por ejemplo, atencion con contextos muy largos) pueden degradarse a CPU segun la version del runtime. El paquete no incluye informacion sobre decodificacion especulativa ni tecnicas de aceleracion adicionales.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de chat.
- Razonamiento de nivel medio, incluyendo matematicas de tipo GSM8K y problemas de logica.
- Generacion y explicacion de codigo en lenguajes habituales (Python, JavaScript, C++).
- Resumen, reescritura y extraccion de informacion de documentos largos.
- Soporte de tool calling y function calling heredado del modelo base, sujeto a que el runtime ONNX exponga el formato de plantilla de chat.
- Capacidades multilingues limitadas: el paquete declara solo ingles, aunque el modelo base soporta varios idiomas.
- Inferencia local en NPU con bajo consumo energetico, sin GPU dedicada.
- No incluye vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local en portatiles Ryzen AI: el modelo se ejecuta en la NPU y libera CPU y GPU para otras tareas, con la ventaja de que los datos no salen del dispositivo.
- Procesamiento de documentos confidenciales: resumen y extraccion de entidades sobre contratos o informes medicos sin enviar texto a servicios en la nube, gracias al despliegue ONNX local.
- Generacion de codigo en entornos con restricciones de red: el paquete permite autocompletado y explicacion de fragmentos en estaciones de trabajo aisladas.
- Chatbot de soporte en aplicaciones de escritorio: integracion mediante el runtime Ryzen AI en herramientas de productividad que necesitan respuestas de baja latencia sin conexion.
- Prototipado de agentes con tool calling en el borde: el modelo base soporta function calling, lo que permite encadenar llamadas a APIs locales (sistema de ficheros, calendario) en un mini-PC.
- Educacion y tutoria offline: generacion de explicaciones y ejercicios en equipos sin GPU dedicada, aprovechando el contexto largo del modelo base para mantener el hilo de la conversacion.
- Filtrado y clasificacion de texto en tiempo real en el dispositivo: moderacion de contenido o etiquetado de tickets con latencia baja y sin coste por token en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete ONNX. El modelo base Phi-4-mini-instruct cuenta con resultados publicos de Microsoft (MMLU, GSM8K, HumanEval), pero no se incluyen en la ficha del repositorio de AMD ni se garantiza que se mantengan tras la compilacion para NPU.

## Requisitos de hardware

- NPU Ryzen AI integrada en procesadores AMD de la familia Strix Point o posterior; el perfil m_1.0.1_npu esta ligado al runtime Ryzen AI 1.9.0.
- Repositorio de 3,8 GB, lo que sugiere pesos en precision reducida (probablemente int8 o similar); la VRAM equivalente depende del particionado entre NPU y memoria del sistema.
- No requiere GPU dedicada; la memoria se asigna desde la RAM del sistema compartida con la NPU.
- Despliegue mediante el runtime Ryzen AI (ONNX Runtime con el execution provider de AMD) y las herramientas de cuantizacion y compilacion de Ryzen AI; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI en su formato actual.
- No cabe en GPUs de consumo en este formato ONNX; para GPU se deberia usar el modelo base en safetensors o GGUF.
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Phi-4-mini-instruct_rai_1.9.0_m_1.0.1_npu (AMD) | aprox. 3.800 M | 128.000 (base) | ONNX para NPU Ryzen AI | MIT | Ryzen AI 1.9.0 |
| Phi-4-mini-instruct (Microsoft) | aprox. 3.800 M | 128.000 | safetensors, GGUF | MIT | GPU, CPU, vLLM, llama.cpp |
| Qwen2.5-3B-Instruct | 3.000 M | 32.768 | safetensors, GGUF | Apache 2.0 | GPU, CPU, vLLM, llama.cpp |
| Llama-3.2-3B-Instruct | 3.200 M | 128.000 | safetensors, GGUF | Llama 3.2 Community | GPU, CPU, vLLM, llama.cpp |

La diferencia clave del paquete de AMD no es el rendimiento del modelo sino el destino de ejecucion: solo funciona sobre NPU Ryzen AI, mientras que las alternativas se despliegan en GPU o CPU con ecosistemas mas maduros. En calidad bruta, el paquete hereda las capacidades del Phi-4-mini-instruct original.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face y disponer de una cuenta para descargar el repositorio.
- Dependencia de hardware: el paquete solo funciona con NPU Ryzen AI y el runtime 1.9.0; no es portable a otras plataformas.
- Idiomas: el paquete declara solo ingles, aunque el modelo base soporta mas idiomas; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion propio de un modelo de 3.800 millones de parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos heredados del corpus de entrenamiento de Microsoft; no se documenta un proceso adicional de mitigacion en este paquete.
- El contexto efectivo puede ser menor que los 128.000 tokens del modelo base debido a limitaciones del grafo ONNX y a la memoria compartida con la NPU.
- Sin benchmarks publicados para la version compilada; el rendimiento real depende de la version del driver y del modelo de procesador.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones de acceso del repositorio gated y los terminos de uso del modelo base de Microsoft.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Phi-4-mini-instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Phi-4-mini-instruct de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Documentacion de Ryzen AI: https://ryzenai.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
