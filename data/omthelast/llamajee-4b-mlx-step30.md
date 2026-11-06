# OmTheLast/LlamaJEE-4B-MLX-Step30

## Resumen

LlamaJEE-4B-MLX-Step30 es un adaptador LoRA experimental publicado por el desarrollador independiente OmTheLast como parte del proyecto LlamaJEE.js. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (423.936 parametros entrenados distribuidos en 18 tensores, aproximadamente 1,70 MB) que debe cargarse sobre el modelo base `mlx-community/Qwen3.5-4B-4bit`, una cuantizacion de 4 bits del Qwen3.5-4B de Alibaba. El adaptador esta formateado para MLX, el framework de Apple para inferencia en Apple Silicon, y no es compatible directamente con Transformers.js.

El objetivo declarado del proyecto es explorar si un ajuste fino muy ligero puede mejorar el rendimiento del modelo base en problemas de preparacion para el examen de ingreso a ingenieria JEE (India). El entrenamiento se realizo sobre 90 ejercicios derivados de 30 familias de problemas fuente, aplicando adaptadores de rango 4 y escala 2 exclusivamente en las tres ultimas capas del modelo de lenguaje, manteniendo congelados los pesos originales y el codificador de vision.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de una publicacion de investigacion personal, sin benchmarks estandarizados, sin datos de uso y con un conjunto de evaluacion reducido y reutilizado (24 preguntas). El propio autor advierte que los resultados observados no establecen una mejora general en JEE ni una capacidad fiable de tutoria. Es util como referencia para quienes experimentan con adaptadores LoRA de bajo rango en MLX, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (base multimodal con codificador de vision congelado) |
| Parametros totales | 423.936 parametros entrenados en el adaptador (18 tensores, ~1,70 MB); el modelo base Qwen3.5-4B no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | El adaptador se distribuye en formato MLX; el base referenciado es una cuantizacion de 4 bits (`Qwen3.5-4B-4bit`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Tensores MLX (adaptador LoRA); no compatible con Transformers.js |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer del que esta informacion no detalla la composicion interna mas alla de que incluye un codificador de vision (el autor indica que el vision encoder permanecio congelado durante el entrenamiento). El ajuste fino consistio en adaptadores LoRA de rango 4 y escala 2 insertados unicamente en las tres ultimas capas del modelo de lenguaje, dejando intactos los pesos originales. El entrenamiento se realizo durante 30 actualizaciones (steps), de ahi el sufijo Step30, sobre 90 ejercicios derivados de 30 familias de problemas fuente orientados a JEE.

No se especifica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica explicitamente que el repositorio no contiene pesos base, preguntas privadas, estado del optimizador ni credenciales. La evaluacion se realizo sobre un conjunto de desarrollo corregido pero reutilizado de 24 preguntas, con un controlador de envio de respuestas comun: el base obtuvo 15/24 respuestas finales correctas y el step 30 obtuvo 19/24; en ambos casos 12 respuestas contaban con trabajo de apoyo suficiente. El autor subraya que estas observaciones no demuestran una mejora general en JEE.

## Capacidades

- Generacion de texto y resolucion de problemas de tipo examen (matematicas y ciencias) heredadas del modelo base Qwen3.5-4B.
- Razonamiento paso a paso orientado a la resolucion de ejercicios de JEE, segun el objetivo declarado del proyecto.
- Capacidad multimodal potencial (el base incluye codificador de vision), aunque el adaptador no modifica esa parte y no se documenta su uso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion con LoRA de bajo rango en MLX: el adaptador sirve como ejemplo reproducible de ajuste fino con rango 4 y escala 2 sobre las tres ultimas capas, util para investigadores que estudien el impacto de adaptadores minimos en Apple Silicon.
- Evaluacion de tecnicas de ajuste ligero para dominios academicos: permite reproducir el protocolo de 24 preguntas descrito por el autor para comparar base frente a adaptador en tareas de resolucion de problemas tipo JEE.
- Prototipado de tutoria educativa en local: sobre un Mac con Apple Silicon, el modelo base cuantizado a 4 bits (~3,06 GB de snapshot) mas el adaptador permite probar respuestas a ejercicios sin infraestructura cloud, asumiendo las limitaciones de fiabilidad advertidas.
- Investigacion sobre sobreajuste en adaptadores pequenos: con solo 90 ejercicios y 30 steps, es un caso de estudio util para analizar como un ajuste minimo altera el comportamiento en un conjunto de desarrollo reutilizado.
- Base para comparaciones controladas de cuantizacion: al existir un paquete WebGPU separado (ONNX) del mismo proyecto, permite contrastar el comportamiento del adaptador en MLX frente a ONNX Runtime WebGPU.
- Docencia sobre despliegue en Apple Silicon: el repositorio incluye un loader (`load_adapter.py`) con verificacion de revision y checksum, util como material didactico sobre reproducibilidad en la carga de adaptadores.

## Benchmarks y rendimiento

| Evaluacion | Base (Qwen3.5-4B-4bit) | Step 30 (adaptador) |
|---|---|---|
| Respuestas finales correctas (24 preguntas de desarrollo, reutilizadas) | 15/24 | 19/24 |
| Respuestas con trabajo de apoyo suficiente | 12/24 | 12/24 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que el conjunto de evaluacion es corregido pero reutilizado y que los resultados no establecen una mejora general en JEE ni una capacidad fiable de tutoria.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 1,70 MB; el modelo base cuantizado a 4 bits ocupa aproximadamente 3,06 GB de snapshot.
- Requiere Apple Silicon (MLX); no se documenta soporte para GPU NVIDIA ni ROCm en esta informacion.
- VRAM/unified memory estimada: al menos unos 3-4 GB libres para cargar el base en 4 bits, mas overhead de inferencia; no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; el framework MLX esta orientado a chips Apple M-series.
- Cabe en hardware consumer Apple Silicon (Mac con memoria unificada suficiente); no se detalla que modelos concretos.
- Opciones de despliegue: MLX mediante el loader incluido (`native/load_adapter.py`); para navegador existe un paquete separado ONNX WebGPU con Transformers.js para tokenizacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LlamaJEE-4B-MLX-Step30 (este) | 423.936 en adaptador + base Qwen3.5-4B | no disponible | Apache 2.0 | MLX (LoRA) | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B (aproximado, segun denominacion) | no disponible | no disponible en esta informacion | safetensors / cuantizaciones | Hugging Face (Qwen) |
| mlx-community/Qwen3.5-4B-4bit | 4B, cuantizado a 4 bits | no disponible | no disponible en esta informacion | MLX 4-bit | Hugging Face (mlx-community) |
| LlamaJEE-4B-ONNX-WebGPU (mismo proyecto) | Adaptador equivalente, base Qwen3.5-4B | no disponible | Apache 2.0 | ONNX WebGPU | Hugging Face (OmTheLast) |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el base `mlx-community/Qwen3.5-4B-4bit` en la revision `0e7ffd5c629ef7719d4cbc04069232580bfa9d9c`.
- El propio autor declara que los resultados no establecen una mejora general en JEE ni una tutoria fiable; el conjunto de evaluacion es de solo 24 preguntas y reutilizado.
- Entrenamiento muy limitado: 30 steps sobre 90 ejercicios de 30 familias, lo que eleva el riesgo de sobreajuste y de baja generalizacion.
- Riesgo de alucinacion inherente al modelo base, no mitigado por un adaptador de 423.936 parametros.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados; se desconoce el comportamiento multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B, no incluida en esta informacion.
- Incompatibilidad con Transformers.js: los tensores MLX no se cargan directamente en el navegador; para ello existe un paquete ONNX WebGPU separado.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; sin validacion externa de la comunidad.
- El repositorio tiene un tamano de 0,0 GB, coherente con que solo contiene el adaptador y material auxiliar, no los pesos base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/OmTheLast/LlamaJEE-4B-MLX-Step30
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Qwen3.5-4B-4bit
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Paquete WebGPU del mismo proyecto: https://huggingface.co/OmTheLast/LlamaJEE-4B-ONNX-WebGPU
- Repositorio del proyecto: https://github.com/OmTheLast/LlamaJEE.js
- Demo del proyecto: https://ompatnaik.com/llamajee/
