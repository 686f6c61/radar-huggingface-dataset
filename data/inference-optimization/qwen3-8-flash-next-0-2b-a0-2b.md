# inference-optimization/Qwen3.8-Flash-Next-0.2B-A0.2B

## Resumen

Qwen3.8-Flash-Next-0.2B-A0.2B es una version reducida del modelo multimodal Qwen/Qwen3.8-Flash-Next, creada por el usuario inference-optimization con fines de prueba y desarrollo. Con solo 163,9 millones de parametros, reproduce todos los componentes arquitectonicos del modelo original de 125B, incluyendo la atencion hibrida con GatedDeltaNet y Qwen Sparse Attention, el Per-Layer Embedding con n-gramas hasheados, las hiperconexiones, los expertos MoE empaquetados en 3D y la torre de vision. Su proposito es permitir experimentar con la arquitectura Qwen4 sin necesidad de descargar cientos de gigabytes de pesos.

El modelo se construyo reduciendo drasticamente las dimensiones del config original (de 48 capas a 4, de 512 expertos a 8, etc.) y se inicializo con pesos aleatorios. Posteriormente se ajusto con un dataset de texto toy para verificar que el modelo aprende, alcanzando una perplejidad de ~1.02. No es un modelo util para tareas reales, sino un banco de pruebas para desarrolladores que quieran validar codigo, tooling o flujos de trabajo con la arquitectura Qwen4Exp antes de escalar al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (MoE hibrido vision-lenguaje) |
| Parametros totales | 163.891.139 (0,16B) |
| Parametros activos | 163.891.139 (MoE, 4 de 8 expertos por token) |
| Longitud de contexto | no disponible (el modelo original soporta 262K) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura hibrida del Qwen3.8-Flash-Next original: tres de cada cuatro capas usan GatedDeltaNet (atencion lineal) para comprimir el historial, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de largo alcance. Incluye Per-Layer Embedding (PLE) con n-gramas hasheados en la capa 2, hiperconexiones entre capas, expertos MoE empaquetados en tensores 3D con un experto compartido, y una torre de vision reducida de 2 capas. El checkpoint omite los pesos de MTP (multi-token-prediction) por convencion.

El proceso de creacion consistio en cargar el config original, reducir sus dimensiones (capas, hidden size, numero de expertos, etc.), construir el modelo con pesos aleatorios, y ajustarlo con un dataset de texto toy para confirmar que puede aprender. La perplejidad final fue de ~1.02, y el modelo reproduce el texto memorizado bajo decodificacion greedy. Los expertos MoE se almacenan empaquetados en 3D para coincidir con la estructura del checkpoint original, y la tabla de n-gramas PLE esta fragmentada en 128 particiones.

## Capacidades

- Generacion de texto basica: puede completar secuencias cortas de texto tras el ajuste con el dataset toy.
- Comprension de imagenes: al incluir la torre de vision, el modelo acepta entradas de imagen y texto (pipeline image-text-to-text), aunque con capacidades muy limitadas por su tamano reducido.
- Razonamiento multi-paso: la arquitectura hibrida con QSA permite en teoria razonamiento con recuperacion de contexto largo, pero en la practica el modelo tiny no ha sido entrenado para ello.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion de pipelines de inferencia: los desarrolladores pueden probar flujos de carga, generacion y post-procesamiento con este modelo tiny antes de escalar al Qwen3.8-Flash-Next completo, ahorrando recursos de computo y almacenamiento.
- Pruebas de integracion con transformers: verificar que la integracion con `transformers>=5.16` y el tipo de modelo `qwen4_exp` funciona correctamente en entornos de CI/CD.
- Desarrollo de tooling de conversion de checkpoints: el proceso de empaquetado de expertos MoE en 3D y el fragmentado de la tabla PLE pueden servir para validar herramientas de conversion y post-procesamiento.
- Experimentacion educativa: estudiar el comportamiento de la atencion hibrida (GatedDeltaNet + QSA) y el Per-Layer Embedding en un modelo de tamano manejable.
- Benchmarking de hardware: medir latencia y throughput de la arquitectura Qwen4Exp en GPUs de consumo o entornos con recursos limitados.
- Desarrollo de agentes de prueba: integrar el modelo en sistemas de agente simples para depurar la logica de orquestacion sin el coste del modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo solo se evaluo con un dataset toy, alcanzando una perplejidad de ~1.02, lo que indica que memoriza los datos de entrenamiento pero no es representativo de capacidades reales.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0,3 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o de gama baja.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, AMD, Apple Silicon) puede ejecutar el modelo sin problemas.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: compatible con `transformers` mediante `AutoModelForCausalLM` o `AutoModelForImageTextToText`. No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles, pero por su tamano se espera una generacion muy rapida incluso en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. Este modelo es unico en su categoria por ser una version tiny de una arquitectura de vanguardia, pero no existen alternativas publicadas con las mismas caracteristicas.

## Limitaciones y advertencias

- Modelo no funcional: los pesos estan inicializados aleatoriamente y solo se ajustaron con un dataset toy, por lo que no produce texto coherente ni respuestas utiles en tareas reales.
- Sesgos desconocidos: al no haber sido entrenado con datos diversos, no se pueden evaluar sesgos, pero tampoco se puede descartar su presencia.
- Riesgo de alucinacion: extremadamente alto, ya que el modelo no ha aprendido patrones linguisticos reales.
- Limitaciones de contexto: la longitud de contexto no esta documentada, aunque el modelo original soporta 262K tokens.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el modelo no es apto para produccion.
- Dependencia de versiones: requiere `transformers>=5.16` para el tipo de modelo `qwen4_exp`, lo que puede limitar su uso en entornos con versiones anteriores.

## Enlaces

- HuggingFace: https://huggingface.co/inference-optimization/Qwen3.8-Flash-Next-0.2B-A0.2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Documentacion de Qwen3.8-Flash-Next (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- QwenCloud - Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- OpenLM.ai - Qwen3.8: https://openlm.ai/qwen3.8/
