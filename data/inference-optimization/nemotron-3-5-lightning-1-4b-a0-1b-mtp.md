# inference-optimization/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP

## Resumen

Nemotron-3.5-Lightning-1.4B-A0.1B-MTP es una versión reducida y sintética del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-NVFP4, creada por el usuario `inference-optimization` con fines exclusivos de desarrollo y pruebas. Su propósito principal es validar pipelines de cuantización de tensores MTP (Multi-Token Prediction) dentro de la herramienta `llm-compressor`, no servir como modelo de producción. La arquitectura es `nemotron_h`, un diseño híbrido que combina capas Mamba (SSM) con capas Transformer y mezcla de expertos (MoE). El checkpoint incluye 1.003.104.400 parámetros principales en bfloat16, más unos 405 millones de parámetros adicionales en los tensores MTP, sumando aproximadamente 1.4B en total. Con solo 2 de 16 expertos activos por token, los parámetros activos rondan los 0.1B, lo que lo hace extremadamente ligero en cómputo. Sin embargo, los pesos son aleatorios y solo se ha realizado un fine-tuning sobre un dataset de juguete para verificar el bucle de entrenamiento, por lo que no tiene capacidades reales de generación de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (híbrido Mamba + Transformer + MoE) |
| Parametros totales | 1.4B (1.003.104.400 principales + ~405M MTP) |
| Parametros activos | ~0.1B (2/16 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (sin cuantizar; el modelo base usa NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (sharded en `model.safetensors` y `model_mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `nemotron_h`, que combina capas de atención completa con capas Mamba (state space model) y bloques MoE. La configuración reducida incluye 12 capas ocultas (frente a 52 del modelo original), un tamaño oculto de 2048, 16 expertos enrutados y un vocabulario de 131072 tokens. Incluye una capa de predicción multi-token (MTP) con bloque de tipo `["full_attention", "moe"]`, cuyos tensores se almacenan en un shard separado. El entrenamiento consistió en instanciar la arquitectura en dispositivo meta, asignar pesos aleatorios en bfloat16 y realizar un fine-tuning sobre un dataset de juguete (copypasta) hasta alcanzar una perplejidad cercana a 1.0. No se aplicaron técnicas como RLHF o DPO. El objetivo era verificar que el bucle de entrenamiento y la carga de pesos funcionan correctamente, no obtener un modelo con capacidades lingüísticas reales.

## Capacidades

- Generacion de texto basica: puede producir secuencias coherentes a nivel sintactico gracias al fine-tuning sobre datos de juguete, pero sin significado semantico real.
- Validacion de pipelines de cuantizacion: los tensores MTP estan incluidos para probar metodos de cuantizacion especificos.
- Compatibilidad con HuggingFace Transformers: se carga con `AutoModelForCausalLM` y `AutoTokenizer`, aunque el cargador estandar ignora los tensores `mtp.*`.
- Sin capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multilingues: no entrenado para ello.
- Sin modo de pensamiento ni capacidades multimodales.

## Casos de uso

- Pruebas de cuantizacion MTP: el caso principal es evaluar algoritmos de cuantizacion sobre los tensores MTP en `llm-compressor`, ya que el checkpoint incluye los pesos MTP en un shard separado.
- Validacion de cargadores de modelos: permite comprobar que la clase `NemotronHForCausalLM` maneja correctamente los keys `mtp.*` y que el indice de pesos unificado funciona.
- Testing de integracion en CI/CD: al ser un modelo pequeno y rapido de cargar, sirve para verificar pipelines de despliegue, serializacion y compatibilidad de librerias.
- Desarrollo de herramientas de compresion: util para desarrolladores que trabajan en cuantizacion, pruning o distillation y necesitan un checkpoint de tamano reducido con la misma estructura que el modelo completo.
- Benchmarking de infraestructura: permite medir latencia y throughput de servidores de inferencia con una arquitectura MoE hibrida sin necesidad de cargar el modelo de 30B.
- Educacion e investigacion: util para estudiar el comportamiento de arquitecturas hibridas Mamba-MoE con MTP en un entorno controlado y de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta disenado para tareas reales y sus pesos son aleatorios, por lo que cualquier medicion de rendimiento careceria de valor comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para los pesos principales en bfloat16 (1.003.104.400 parametros × 2 bytes), mas overhead de activaciones y cache. Con los tensores MTP (~405M parametros) se necesitarian unos 0.8 GB adicionales si se cargaran explicitamente.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente para cargar el modelo principal. Para incluir los tensores MTP, se recomienda 6 GB o mas.
- Si cabe en consumer GPU: si, en la mayoria de GPUs modernas.
- Opciones de despliegue: compatible con HuggingFace Transformers, vLLM, llama.cpp y Ollama, aunque al ser un modelo de prueba no se recomienda su uso en produccion.
- Latencia y throughput: no disponibles, pero al ser un modelo de ~1B con 0.1B activos, la generacion es muy rapida en hardware moderno.

## Comparativa con modelos similares

No disponible. Este modelo es una version sintetica y reducida del Nemotron-3.5-Lightning-30B-A3B, creada especificamente para testing de cuantizacion. No existen modelos comparables en la misma categoria porque no esta orientado a tareas de lenguaje reales. El unico punto de referencia seria el modelo base original, pero con 30B parametros y 3B activos, no es una comparacion directa.

## Limitaciones y advertencias

- No es un modelo de produccion: esta explicitamente disenado para pruebas de cuantizacion MTP, no para inferencia real.
- Pesos aleatorios: los parametros no provienen de un entrenamiento con datos reales a gran escala, por lo que las salidas no tienen coherencia semantica.
- Fine-tuning limitado: el entrenamiento se realizo sobre un dataset de juguete (copypasta) hasta perplejidad ~1.0, lo que solo garantiza que el bucle de entrenamiento funciona.
- Tensores MTP ignorados por defecto: la clase `NemotronHForCausalLM` de HuggingFace ignora los keys `mtp.*` al cargar, por lo que los tensores MTP deben cargarse manualmente si se necesitan.
- Sin garantias de calidad: no se han evaluado sesgos, alucinaciones ni riesgos de seguridad. No apto para uso en aplicaciones reales.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no ofrece valor practico para productos finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Nemotron-3.5-Lightning-1.4B-A0.1B-MTP
- Modelo base original: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Pagina del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Blog de NVIDIA sobre Nemotron 3.5 Lightning: https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/
- Repositorio oficial de Nemotron en GitHub: https://github.com/NVIDIA-NeMo/Nemotron
- Documentacion de la receta de entrenamiento: https://github.com/NVIDIA-NeMo/Nemotron/blob/main/docs/nemotron/lightning35/README.md
