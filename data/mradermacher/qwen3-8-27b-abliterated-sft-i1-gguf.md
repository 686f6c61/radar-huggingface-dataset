# mradermacher/Qwen3.8-27B-Abliterated-SFT-i1-GGUF

## Resumen

El modelo Qwen3.8-27B-Abliterated-SFT-i1-GGUF es una cuantizacion GGUF con matriz de importancia (imatrix) del modelo azukivc/Qwen3.8-27B-Abliterated-SFT, preparada por mradermacher. Se trata de un modelo de lenguaje de 27.300 millones de parametros basado en la arquitectura Qwen3.8, sometido a un proceso de abliteration (eliminacion de la direccion de rechazo en los pesos) y posteriormente a un fine-tuning supervisado (SFT). El resultado es un modelo conversacional que no presenta barreras de rechazo ante solicitudes potencialmente controvertidas, orientado a tareas de investigacion, red-teaming y analisis de seguridad.

La cuantizacion GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o vLLM, con tamaños que oscilan aproximadamente entre 11 GB (Q2_K) y 22 GB (Q6_K). El modelo base es multimodal, con capacidades de vision y lenguaje, y los archivos de proyeccion multimodal (mmproj) se alojan en el repositorio estatico asociado. Publicado bajo licencia Apache 2.0, el modelo se posiciona como una opcion abierta para escenarios que requieran conversacion sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | Todos (modelo denso) |
| Longitud de contexto | no disponible (los tags del modelo base indican soporte de contexto largo) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q4_0, Q4_1, IQ1_M, IQ1_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.8-27B, un transformer denso de 27.300 millones de parametros con capacidades multimodales de vision y lenguaje. Sobre el modelo original se ha aplicado la tecnica de abliteration, que consiste en proyectar fuera la direccion de rechazo de los pesos de las capas self_attn.o_proj y mlp.down_proj en todas las capas, eliminando asi el comportamiento de rechazo ante solicitudes sensibles. Posteriormente, el modelo ha recibido un fine-tuning supervisado (SFT) para preservar la fluidez conversacional tras la ablacion.

Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, hiperparametros) no estan disponibles en la informacion proporcionada. La cuantizacion GGUF con imatrix ha sido preparada por mradermacher, con soporte de la empresa nethype GmbH y acceso a la supercomputadora privada de nicoboss. Existen variantes adicionales del modelo, incluyendo una con modulo MTP (multi-token prediction) para decodificacion especulativa y una version BF16.

## Capacidades

- Generacion de texto conversacional sin restricciones de rechazo, gracias a la abliteration.
- Capacidades multimodales de vision y lenguaje en el modelo base (los archivos mmproj se distribuyen en el repositorio estatico).
- Soporte de tool calling / function calling, segun los tags del modelo BF16 relacionado.
- Generacion de codigo, segun los tags del modelo BF16 relacionado.
- Soporte de contexto largo, indicado en los tags del modelo BF16 relacionado.
- Compatibilidad con vLLM para despliegue en produccion.
- Cuantizaciones GGUF de distintos niveles de precision, con archivos imatrix para generar cuantizaciones propias.

## Casos de uso

- Analisis de seguridad y red-teaming: al eliminar la direccion de rechazo, el modelo permite estudiar vulnerabilidades, sesgos y comportamientos de modelos sin politicas de seguridad, util para investigadores que evalúan riesgos en sistemas de IA.
- Evaluacion de politicas de contenido: los equipos de seguridad pueden comparar las respuestas de este modelo abliterado con las del modelo original para medir la efectividad de las barreras de rechazo.
- Generacion de codigo en entornos de desarrollo: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revision de codigo automatizada o generacion de pruebas unitarias.
- Asistentes conversacionales de investigacion: su licencia Apache 2.0 permite su integracion en sistemas comerciales sin restricciones de licencia, y su contexto largo facilita conversaciones multi-turno extensas.
- Analisis de imagenes sin filtros de contenido: al ser un modelo de vision-lenguaje, puede describir y analizar imagenes sin las restricciones habituales de los modelos comerciales.
- Despliegue en hardware de consumo: las cuantizaciones de menor tamaño (Q2_K, IQ3_M) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM, posibilitando pruebas locales con Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion:
  - Q2_K: aproximadamente 11-12 GB de VRAM.
  - Q4_K_M: aproximadamente 16-17 GB de VRAM.
  - Q6_K: aproximadamente 21-22 GB de VRAM.
  - BF16 (modelo base): aproximadamente 55 GB de VRAM.
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 80 GB, H100 para la version sin cuantizar.
- El modelo cabe en GPUs de consumo con 16 GB de VRAM si se usan cuantizaciones de 4 bits (Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, vLLM, Transformers, TGI.
- La variante con modulo MTP permite decodificacion especulativa para reducir la latencia en generacion.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-SFT (original) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, con SFT |
| Qwen3.8-27B-Abliterated (sin SFT) | 27,3B | no disponible | Apache 2.0 | safetensors | Abliterado sin fine-tuning posterior |
| Qwen3.8-27B (original) | 27,3B | no disponible | Apache 2.0 | safetensors | Con barreras de rechazo intactas |
| Qwen3.8-27B-Abliterated-MTP-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Incluye modulo MTP para decodificacion especulativa |

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo implica que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es adecuado para uso en produccion sin medidas de mitigacion adicionales.
- Sesgos: el modelo esta entrenado principalmente en ingles, y puede presentar sesgos culturales y sociales derivados de sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada con alta confianza.
- Informacion de entrenamiento incompleta: no se han publicado detalles sobre el dataset de entrenamiento, numero de tokens o hiperparametros del SFT.
- Sin benchmarks publicados: no se puede evaluar el rendimiento objetivo del modelo en tareas estandarizadas.
- Las cuantizaciones de menor tamaño (Q2_K, IQ1_M, IQ1_S) pueden degradar significativamente la calidad de las respuestas generadas.
- El repositorio no incluye los archivos mmproj; para usar las capacidades de vision es necesario descargar los archivos adicionales del repositorio estatico.

## Enlaces

- Repositorio GGUF imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-SFT-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-SFT-GGUF
- Modelo base (azukivc): https://huggingface.co/azukivc/Qwen3.8-27B-Abliterated-SFT
- Variante BF16: https://huggingface.co/mradermacher/Qwen3.8-27B-ABLITERATED-BF16-i1-GGUF
- Variante Huihui con MTP: https://huggingface.co/mradermacher/Huihui-Qwen3.8-27B-abliterated-i1-GGUF
- Variante MTP de hotdogs: https://genaihub.net/agents/hf-model-hotdogs-qwen3-8-27b-abliterated-mtp-gguf
- Modelo abliterado de douyamv: https://www.modelscope.cn/models/douyamv/Qwen3.8-27B-abliterated-GGUF
