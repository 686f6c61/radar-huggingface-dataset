# mochi0314/pavr-e15-5-b4-seed0-4bit

## Resumen

PAVR E15-5 B4 seed 0 4-bit es un checkpoint de investigación publicado por el usuario mochi0314 en Hugging Face. No se trata de un modelo de propósito general, sino de un componente de un prototipo de estimación nutricional denominado PAVR: un adaptador LoRA (E15-5 B4 seed 0) montado sobre una base Qwen3-VL-4B-Instruct convertida a 4 bits para el runtime MLX de Apple. El repositorio incluye tanto los pesos base cuantizados como el adaptador en `adapter_mlx/adapters.safetensors`, con un total de 4.437.815.808 parámetros y un tamaño de repositorio de 3,6 GB.

El modelo hereda la arquitectura vision-language de Qwen3-VL, es decir, un transformer multimodal capaz de procesar imagen y texto, pero el autor advierte explícitamente de que cargarlo como modelo de generación de texto no reproduce la predicción nutricional. El pipeline real exige extraer el estado oculto del decodificador en el marcador ` mass`, aportar características geométricas correctamente normalizadas y ejecutar una cabeza de regresión B3 distribuida por separado. Por tanto, el artefacto es un eslabón de un sistema mayor, no un modelo autónomo.

Su relevancia es acotada y fundamentalmente metodológica: documenta un experimento de ajuste fino multimodal para regresión continua (estimación de kilocalorías por plato) con trazabilidad de hashes, y expone cifras de desarrollo junto con sus salvedades. No hay resultados de test independiente, licencia declarada ni idiomas especificados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) con adaptador LoRA; cuantización MLX de 4 bits |
| Parametros totales | 4.437.815.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (formato MLX); el run original de referencia fue BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX); adaptador LoRA en `adapter_mlx/adapters.safetensors` |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`) |
| Libreria | mlx |
| Tamano del repositorio | 3,6 GB |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

La base es Qwen3-VL-4B-Instruct, un modelo vision-language de la familia Qwen3-VL con aproximadamente 4,4 mil millones de parámetros, convertido a 4 bits para MLX. Sobre esa base se aplica un adaptador LoRA identificado como E15-5 B4 seed 0, correspondiente a la semilla 0 de un barrido de experimentos. El autor no detalla en la model card la composición del dataset de ajuste, el número de tokens ni si hubo etapas de RLHF o DPO; esa información no está disponible.

El diseño del pipeline es la innovación técnica destacable: el sistema no usa la salida generativa del modelo, sino que extrae el estado oculto del decodificador en la posición del marcador ` mass`, lo combina con características geométricas normalizadas (presumiblemente derivadas de captura LiDAR o de profundidad, dado que se menciona inferencia en iPhone/LiDAR) y alimenta una cabeza de regresión B3 externa que produce la estimación en kilocalorías. Esta arquitectura de "encoder multimodal congelado o ajustado + cabeza de regresión" es habitual en regresión visual, pero aquí se documenta con suficiente detalle como para reproducir el contrato de inferencia, algo poco frecuente en checkpoints de investigación.

## Capacidades

- Extracción de representaciones multimodales (imagen y texto) mediante el decodificador de Qwen3-VL, en el punto de anclaje definido por el marcador ` mass`.
- Ajuste fino tipo LoRA orientado a una tarea de regresión continua (estimación de energía en kcal por plato), no a generación abierta.
- Integración con características geométricas externas normalizadas, lo que sugiere uso combinado con datos de profundidad o LiDAR.
- Capacidad potencial de generación de texto y razonamiento visual heredada de Qwen3-VL-4B-Instruct, aunque el autor no la valida ni la recomienda en este checkpoint.
- Soporte de tool calling, agentes o modo thinking: no documentado para este adaptador; no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en estimación nutricional visual: el checkpoint sirve como referencia reproducible para experimentos de regresión de calorías a partir de imágenes de platos, siempre que se implemente el pipeline completo con la cabeza B3 y las características geométricas.
- Reproducción de experimentos: permite replicar el run BF16 y comparar el efecto de la cuantización a 4 bits sobre el error absoluto medio, dado que el autor publica la MAE de desarrollo del run original.
- Desarrollo de aplicaciones móviles con MLX: al estar en formato MLX, encaja en prototipos para Apple Silicon e inferencia local en dispositivos Apple, incluido el escenario iPhone/LiDAR que el autor menciona como pendiente de evaluar.
- Estudio de robustez a cuantización: útil para medir cuánto degrada un esquema de 4 bits MLX a un adaptador LoRA de regresión sobre un VLM, un área con pocos datos públicos.
- Base para ablaciones de geometría y preprocesado: el autor señala que las diferencias de geometría y preprocesado siguen en investigación, por lo que el checkpoint es un punto de partida para aislar esas variables.
- Docencia y auditoría metodológica: ejemplo de model card con trazabilidad de hashes, advertencias explícitas sobre selección de checkpoint y distinción entre desarrollo y test, útil como plantilla de buenas prácticas.
- Integración en pipelines de visión por computador con extracción de embeddings: el contrato de "estado oculto en un marcador" puede reutilizarse para otras tareas de regresión que necesiten anclar la representación a un token concreto.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son de desarrollo, no de test independiente, y corresponden al run BF16 original:

| Metrica | Valor | Condiciones |
|---|---|---|
| MAE en cohorte de desarrollo | 52,637 kcal | Run BF16 original, 294 platos, tras selección de checkpoint e hiperparámetros en el propio conjunto de desarrollo |
| MAE medio en desarrollo | 58,618 kcal | Tres semillas de condición seleccionada |
| Desviación estándar muestral | 7,634 kcal | Tres semillas de condición seleccionada |
| Rendimiento del modelo cuantizado a 4 bits | No disponible | No evaluado en la información proporcionada |
| Rendimiento en inferencia iPhone/LiDAR | No disponible | No evaluado en la información proporcionada |
| Test independiente | No disponible | El repositorio no incluye datos oficiales de test |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,6 GB en 4 bits, por lo que se puede estimar un consumo en torno a 4-6 GB contando overhead de runtime y activaciones, aunque el autor no publica cifras medidas.
- GPU recomendadas: al ser un formato MLX, el destino natural es Apple Silicon (series M1 a M4, con preferencia por configuraciones de memoria unificada de 16 GB o más). Para CUDA haría falta reconvertir los pesos, algo no documentado.
- Cabe en GPU de consumo: sí en el ecosistema Apple Silicon con memoria unificada suficiente; en GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) requeriría conversión previa no incluida en el repositorio.
- Opciones de despliegue: MLX y mlx-lm son las vías previstas; vLLM, llama.cpp, Ollama y TGI no soportan directamente este formato sin conversión. Además, el pipeline requiere código propio para extraer el estado oculto y aplicar la cabeza B3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAVR E15-5 B4 seed 0 4-bit | 4,44 B | No disponible | Regresión nutricional sobre VLM + LoRA | No disponible | Hugging Face, MLX |
| Qwen/Qwen3-VL-4B-Instruct | ~4 B | No disponible en la información | VLM instructivo de propósito general | No disponible en la información | Hugging Face |
| Qwen2.5-VL-3B-Instruct | ~3 B | No disponible en la información | VLM instructivo | No disponible en la información | Hugging Face |
| PaliGemma 3B | ~3 B | No disponible en la información | VLM (SigLIP + Gemma) | No disponible en la información | Hugging Face |

La comparación es limitada: PAVR no compite en tareas generativas generales, sino que es un artefacto de investigación para una tarea de regresión concreta. Frente a su propio modelo base, la diferencia es el adaptador LoRA y la cuantización; frente a otros VLM de tamaño similar, la diferencia es el propósito y la ausencia de evaluación estándar publicada.

## Limitaciones y advertencias

- El autor indica explícitamente que cargar el repositorio como modelo de generación de texto no reproduce la predicción nutricional: falta la cabeza de regresión B3, la normalización de geometría y la lógica de extracción del estado oculto.
- El modelo es un prototipo de investigación experimental y no un dispositivo médico ni nutricional validado; no debe usarse para decisiones clínicas o dietéticas.
- La MAE de 52,637 kcal procede de un conjunto de desarrollo tras selección de checkpoint e hiperparámetros sobre ese mismo conjunto, por lo que está sesgada al alza en optimismo y no constituye una estimación de generalización.
- No hay resultados de test independiente ni evaluación del modelo cuantizado a 4 bits; se desconoce la degradación introducida por la cuantización.
- El rendimiento en iPhone/LiDAR no está establecido; el autor señala que las diferencias de geometría y preprocesado siguen en investigación.
- Licencia no declarada: no hay autorización explícita para uso comercial, lo que en la práctica implica tratar el artefacto como no reutilizable en producción hasta aclaración del autor.
- Idiomas no especificados y contexto no documentado; no se puede asumir el comportamiento multilingüe del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint; al ser una regresión sobre imágenes de alimentos, es probable que el sesgo del dataset de entrenamiento afecte a cocinas y presentaciones poco representadas, aunque no hay datos publicados al respecto.
- Trazabilidad dependiente del archivo de experimentos PAVR: los hashes de origen y conversión se registraron externamente y no se incluyen en el repositorio.
- Descargas y likes nulos en el momento de la consulta, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mochi0314/pavr-e15-5-b4-seed0-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Perfil del autor: https://huggingface.co/mochi0314
