# darius3th/unc-34bda046

## Resumen

El modelo `darius3th/unc-34bda046` es un modelo de lenguaje de gran tamaño (LLM) con arquitectura de mezcla de expertos (MoE) basado en la familia Qwen3.5, desarrollado por el usuario Darius R (darius3th) en HuggingFace. Con 35.107 millones de parámetros totales, está diseñado para tareas de generación de texto y procesamiento multimodal imagen-texto, según las etiquetas asociadas. El modelo se publicó en agosto de 2026 con licencia Apache 2.0, aunque su acceso está restringido y requiere aceptar condiciones adicionales en la plataforma.

La relevancia de este modelo radica en su combinación de arquitectura MoE, capacidades de razonamiento (etiqueta `reason-v4`) y soporte multimodal, lo que lo sitúa en la línea de los LLM modernos orientados a agentes y asistentes. Sin embargo, al ser un lanzamiento reciente con cero descargas y sin documentación pública detallada, su adopción es aún incipiente. El modelo base declarado es `vera6/affine-5g4yy75zuz-t6`, del que no se dispone de información adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se observan pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE, como indica la etiqueta `qwen3_5_moe`, lo que sugiere que el modelo activa solo un subconjunto de sus parámetros por token, mejorando la eficiencia computacional. Además, la etiqueta `image-text-to-text` indica que el modelo acepta entradas multimodales (imagen y texto) y genera texto, probablemente mediante un codificador visual acoplado al transformer. No se dispone de información sobre el número de expertos, la dimensión del hidden state ni el mecanismo de atención.

En cuanto al entrenamiento, la etiqueta `offline-dpo` sugiere que se aplicó optimización de preferencias directa (DPO) en modo offline, probablemente después de un ajuste fino supervisado. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases previas. El modelo base `vera6/affine-5g4yy75zuz-t6` no está documentado públicamente, por lo que se desconoce su procedencia y características.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede producir texto coherente en tareas de continuación y diálogo.
- Razonamiento: la etiqueta `reason-v4` indica un enfoque específico en capacidades de razonamiento lógico y matemático, aunque no se especifican los detalles.
- Multimodal: la etiqueta `image-text-to-text` implica que puede procesar imágenes junto con texto, permitiendo tareas como descripción de imágenes o respuesta a preguntas visuales.
- Conversación: la etiqueta `conversational` sugiere que está optimizado para mantener diálogos multi-turno.
- Tool calling y agentes: no se ha confirmado explícitamente, aunque la combinación de razonamiento y multimodal podría habilitarlo; no hay evidencia en la información disponible.
- Multilingüismo: no se ha declarado ningún idioma específico; se desconoce su cobertura.

## Casos de uso

Dado que la información pública es limitada, los casos de uso se infieren de las capacidades declaradas y deben validarse con pruebas propias:

- Asistente multimodal para soporte técnico: el modelo podría procesar capturas de pantalla o diagramas enviados por usuarios y generar respuestas textuales detalladas, aprovechando su capacidad imagen-texto.
- Generación de informes a partir de gráficos: al recibir una imagen de un gráfico o tabla, podría producir un resumen escrito con los datos relevantes, útil en entornos de análisis de negocio.
- Chatbot conversacional para atención al cliente: su etiqueta `conversational` y su arquitectura MoE permitirían desplegar un asistente con respuestas contextuales, aunque se requiere verificar la longitud de contexto.
- Razonamiento asistido en entornos educativos: gracias a `reason-v4`, podría utilizarse para resolver problemas matemáticos o lógicos paso a paso, generando explicaciones didácticas.
- Anotación automática de imágenes en bases de datos: el modelo podría generar descripciones textuales de imágenes para indexación y búsqueda, integrándose en pipelines de gestión de activos digitales.
- Prototipado de agentes con razonamiento multi-paso: si se confirma el soporte para tool calling, podría usarse en sistemas que requieren planificación y ejecución de acciones, aunque esta capacidad no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros, en precisión FP16 se necesitarían aproximadamente 70 GB de VRAM (considerando solo los pesos). Con cuantización a 8 bits, unos 35 GB; a 4 bits, unos 18 GB. Sin embargo, no se ha confirmado la disponibilidad de versiones cuantizadas.
- GPU recomendadas: para FP16 se requerirían GPUs de clase profesional como NVIDIA A100 (80 GB) o H100 (80 GB). Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría al menos una A6000 (48 GB) o similar. Para 4 bits, una RTX 4090 podría ser viable, pero depende del contexto y la implementación.
- Compatibilidad con GPU de consumo: solo sería posible con cuantización agresiva (4 bits) y contexto reducido, en GPUs como RTX 3090/4090 (24 GB). No se garantiza un rendimiento óptimo.
- Opciones de despliegue: al usar la librería `transformers`, es compatible con frameworks como vLLM, TGI y llama.cpp (si se generan pesos GGUF). No se ha confirmado soporte en Ollama.
- Latencia y throughput: no se dispone de datos medidos. Al ser un MoE, la latencia por token podría ser menor que un modelo denso equivalente, pero depende del número de expertos activos y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo se basa en Qwen3.5, pero no se conocen las especificaciones exactas de esa familia. Alternativas como Qwen2.5-32B o Mixtral 8x7B tienen tamaños similares, pero sin datos de rendimiento de este modelo no es posible comparar. Se recomienda consultar la documentación oficial de Qwen para modelos comparables.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de tipo gated, por lo que requiere solicitar acceso y aceptar condiciones en HuggingFace antes de su uso.
- Documentación insuficiente: no hay papers, guías de uso ni especificaciones técnicas detalladas; la información se limita a las etiquetas y metadatos.
- Riesgo de alucinación: como todo LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo si no se valida.
- Sesgos desconocidos: al no haber información sobre los datos de entrenamiento, no se pueden evaluar sesgos de género, raza o idioma.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que puede afectar a tareas que requieran documentos largos.
- Licencia: aunque es Apache 2.0, el acceso restringido puede implicar términos adicionales que limiten el uso comercial o la redistribución.
- Producción: sin benchmarks ni pruebas de estabilidad, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darius3th/unc-34bda046
- Perfil del autor: https://huggingface.co/darius3th
- Lista de modelos del autor: https://huggingface.co/darius3th/models
