# rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np

## Resumen

Qwen3-VL-4B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np es un ajuste fino (SFT) del modelo multimodal Qwen3-VL-4B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. Se trata de un modelo de imagen-texto-a-texto orientado a tareas de razonamiento espacial y conversacion multimodal, segun se deduce del nombre del run de entrenamiento ("spatial_reasoning@SFT-full") y de la nomenclatura de los experimentos.

El modelo parte de la arquitectura Qwen3-VL de 4B parametros y ha sido entrenado mediante Supervised Fine-Tuning con la libreria TRL (version 1.3.0), sobre un dataset mixto que, segun el identificador, incluye 1500 muestras generadas con Claude Sonnet en modo "nothink". El repositorio ocupa 17,8 GB y los pesos estan en formato safetensors.

Su relevancia es limitada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados. Resulta util como referencia para quienes investigan el ajuste fino de modelos multimodales pequenos, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje |
| Parametros totales | 569.856 (segun metadatos de safetensors; el nombre indica 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de imagen-texto-a-texto. El ajuste fino se realizo mediante SFT con TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128 y Datasets 4.8.5, segun la model card.

El identificador del modelo sugiere un pipeline de experimentos por etapas (v6, s2_exp, s4_exp2, s5_exp1, "only_blocks_ver7_ver3") y un dataset mixto ("S2v20_mix_s1") con arranque en frio ("cold_start") sobre 1500 muestras generadas con Claude Sonnet en modo sin razonamiento explicito ("nothink"). No se especifican el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La model card incluye un enlace a un run de Weights & Biases alojado en forge.coreweave.com, pero no se detallan hiperparametros.

## Capacidades

- Generacion de texto e imagen-texto-a-texto: el pipeline declarado es image-text-to-text, por lo que acepta imagenes y texto como entrada.
- Razonamiento espacial: el nombre del run de entrenamiento ("spatial_reasoning") indica que el ajuste se oriento a tareas de este tipo.
- Conversacion multi-turno: los tags incluyen "conversational".
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere despliegue en infraestructura de inferencia gestionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: el identificador indica entrenamiento en modo "nothink", es decir, sin cadena de razonamiento explicita.

## Casos de uso

- Investigacion en ajuste fino multimodal: sirve como punto de partida reproducible para estudiar el efecto del SFT sobre Qwen3-VL-4B-Instruct con datasets sinteticos generados por Claude Sonnet.
- Razonamiento espacial sobre imagenes: adecuado para prototipos que requieran interpretar relaciones espaciales en escenas, dado el enfoque declarado del entrenamiento.
- Experimentos de destilacion desde modelos mayores: el dataset de 1500 muestras generadas con Claude Sonnet permite evaluar la transferencia de capacidades de un modelo grande a uno de 4B.
- Evaluacion comparativa de checkpoints: util para comparar variantes del pipeline de experimentos (v6, s2, s4, s5) en tareas de vision-lenguaje.
- Pruebas de despliegue en endpoints: el tag "endpoints_compatible" permite validar integraciones en plataformas de inferencia gestionada.
- Base para futuros ajustes: al estar en safetensors y con codigo TRL, puede reutilizarse como inicializacion para nuevos ciclos de SFT o DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en precision completa (fp16) se requieren aproximadamente 8-9 GB solo para pesos, mas el coste del codificador visual y la cache KV.
- GPU recomendadas: no especificadas por el autor; por tamano, una RTX 4090 (24 GB) o A100/H100 serian suficientes en fp16.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posible en GPUs de 16 GB con cuantizacion, aunque no se han publicado pesos GGUF.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (SFT de Qwen3-VL-4B) | 4B (nominal) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | no disponible en esta ficha | Modelo base publico |
| Otros ajustes SFT de Qwen3-VL-4B | variable | no disponible | variable | Depende del autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-VL y de un dataset sintetico de Claude Sonnet, puede heredar sesgos de ambas fuentes.
- Riesgo de alucinacion: no evaluado; los modelos de 4B ajustados con SFT sobre datasets pequenos (1500 muestras) tienden a sobreajustar el estilo del dataset.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados.
- Licencia: no declarada de forma explicita ("licence: license"), lo que impide confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo base Qwen3-VL-4B-Instruct antes de cualquier uso en produccion.
- Madurez: cero descargas y cero likes; sin model card detallada ni benchmarks, no es recomendable para produccion sin una evaluacion propia.
- Inconsistencia en parametros: los metadatos de safetensors indican 569.856 parametros, cifra incompatible con un modelo de 4B; probablemente se refiere a otro campo o esta mal reportado.
- Entrenamiento "nothink": al haberse ajustado sin cadena de razonamiento, puede rendir peor en tareas que requieran razonamiento explicito paso a paso.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen3-VL-4B-Instruct-S2v20_mix_s1-claude-sonnet-5-5_nothink_n1500-full_SFT_fixed_np
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Run de entrenamiento (Weights & Biases): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/9e3qu3dh
- Repositorio TRL: https://github.com/huggingface/trl
