# jjalora/diet-traj-pythia-410m-scaled-normal-seed11

## Resumen

DIET trajectory: Pythia-410M es un modelo de lenguaje de 405 millones de parámetros entrenado desde cero por el autor jjalora (usuario de Hugging Face) como parte de la campaña de investigación "DIET weight-space". No es un modelo nuevo en cuanto a arquitectura: replica exactamente la receta abierta de Pythia-410M de EleutherAI (arquitectura GPT-NeoX, mismo flujo de tokens y mismo orden de datos del dataset Pile), variando únicamente la semilla aleatoria y el esquema de inicialización de pesos. Su interés no reside en el rendimiento final sino en su valor como artefacto científico: permite estudiar trayectorias de entrenamiento en el espacio de pesos.

El modelo se distribuye como una colección de checkpoints intermedios (ramas `stepN` para N en {0, 1, 2, 4, …, 512} y cada 100 pasos) más los pesos finales en la rama `main`, todos en safetensors float16. Incluye un fichero `losses.csv` con la pérdida de entrenamiento y de evaluación recalculada de forma homogénea para cada checkpoint, lo que lo convierte en una herramienta para análisis de dinámica de entrenamiento, no para despliegue en producción.

La relevancia actual es metodológica: la campaña DIET genera múltiples ejecuciones con distintas inicializaciones y semillas para comparar cómo evolucionan los pesos y las pérdidas. El repositorio es de gran tamaño (1167,4 GB) por acumular decenas de checkpoints, y el modelo solo soporta inglés y está pensado para generación de texto experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 405.334.016 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la receta Pythia usa 2048 tokens por secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en float16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-NeoX, un transformer decoder-only con atención causal estándar, idéntica a la de `EleutherAI/pythia-410m`. El entrenamiento sigue la receta abierta de Pythia definida en `models/410M/pythia-410m.yml`: mismo flujo y orden de tokens del dataset `EleutherAI/pile-standard-pythia-preshuffled` (el lote *i* corresponde a las filas [i·1024, (i+1)·1024)), optimizador AdamW con lr 3e-4, betas (0,9, 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni sesgos, recorte de gradiente 1,0, scheduler coseno hasta 3e-5 durante 143.000 pasos y 1.430 pasos de warmup. Se usó autocast fp16 con pesos maestros en fp32 y un lote global de 1024 secuencias × 2048 tokens, independientemente del número de GPUs.

La única diferencia respecto a la ejecución original de EleutherAI es la semilla aleatoria y el esquema de inicialización de pesos. En esta variante, `init_scheme = None`, es decir, se usa el esquema `pythia` de GPT-NeoX (small_init + wang_init); otros esquemas están documentados en `src/init_schemes.py` del código de entrenamiento. El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, pero el esquema `pythia` coincide con la distribución por tensor de `EleutherAI/pythia-410m` en la revisión `step0`, verificado en `tests/test_pythia_step0_init_match.py`. No se documenta uso de RLHF ni DPO; es un preentrenamiento puro sobre Pile.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura y los datos de Pythia-410M.
- Modelado de lenguaje y cálculo de perplejidad, con métricas de evaluación homogéneas por checkpoint.
- Trazabilidad de la trayectoria de entrenamiento: checkpoints intermedios en las ramas `stepN` (0, 1, 2, 4, …, 512 y cada 100 pasos) con pesos en float16.
- Registro de pérdidas por checkpoint en `losses.csv` con columnas `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr`.
- Compatibilidad con `transformers` y con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`).
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente; no se documentan en la información disponible.

## Casos de uso

- Investigación sobre trayectorias en el espacio de pesos: comparar los checkpoints `stepN` de esta ejecución con los de otras semillas y esquemas de inicialización de la campaña DIET para estudiar cómo divergen los pesos durante el preentrenamiento.
- Análisis de dinámica de entrenamiento: usar `losses.csv` para trazar curvas de pérdida de entrenamiento y evaluación homogéneas y detectar fases de convergencia o inestabilidad en los 143.000 pasos.
- Reproducibilidad de recetas: servir como referencia verificable de la receta Pythia-410M con una inicialización alternativa, útil para validar pipelines de entrenamiento propios.
- Estudios de inicialización: comparar la distribución de pesos iniciales de esta ejecución (`init_scheme = None`) con la de `EleutherAI/pythia-410m` revisión `step0` mediante el test incluido en el repositorio.
- Evaluación de perplejidad controlada: al haberse recalculado `eval_loss` con un único conjunto y scorer fijo, permite comparaciones directas entre checkpoints y entre trayectorias de la colección.
- Docencia y experimentación académica: modelo pequeño (405 M de parámetros) que cabe en GPUs de consumo para estudiar conceptos de preentrenamiento, checkpoints y evaluación sin grandes recursos.
- Fine-tuning experimental: punto de partida para tareas de generación de texto en inglés cuando se quiera una inicialización distinta a la canónica de Pythia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de pérdida por checkpoint (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`) en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 405 M de parámetros en float16, aproximadamente 0,8 GB solo para pesos; en fp32, unos 1,6 GB. El repo completo ocupa 1167,4 GB por la acumulación de checkpoints, pero un único checkpoint es manejable.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en fp16; una RTX 4090, A100 o H100 es sobredimensionada para este tamaño y se justificaría solo para entrenamiento o evaluación masiva de checkpoints.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI más allá de los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jjalora/diet-traj-pythia-410m-scaled-normal-seed11 | 405.334.016 | no disponible | apache-2.0 | Hugging Face | Checkpoints de trayectoria, init alternativo, seed 11 |
| EleutherAI/pythia-410m | ~410 M | 2048 tokens (receta Pythia) | apache-2.0 | Hugging Face | Modelo de referencia con la receta original |
| EleutherAI/pythia-160m | ~160 M | 2048 tokens (receta Pythia) | apache-2.0 | Hugging Face | Alternativa más pequeña de la familia Pythia |
| EleutherAI/pythia-1b | ~1 B | 2048 tokens (receta Pythia) | apache-2.0 | Hugging Face | Alternativa más grande de la misma familia |

La comparación con modelos de otras familias no está disponible en la información proporcionada; los datos de contexto de Pythia se indican según la receta de entrenamiento citada, no como especificación verificada en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación: su propósito es el estudio de trayectorias de entrenamiento, no el despliegue en producción; no se han publicado evaluaciones de calidad de generación.
- Solo inglés: el tag de idioma es `en` y los datos de entrenamiento son Pile; no se garantiza rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos: al ser un preentrenamiento puro sobre Pile sin RLHF ni DPO, hereda los sesgos y la tendencia a la alucinación de ese corpus; no se documentan mitigaciones.
- Longitud de contexto: no disponible en la información proporcionada; la receta Pythia entrena con secuencias de 2048 tokens, pero no se confirma como límite de inferencia.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de calidad; conviene verificar la procedencia de los datos (Pile) para usos sensibles.
- Tamaño del repositorio: 1167,4 GB por los múltiples checkpoints; descargar el repo completo es inviable en la mayoría de entornos, hay que seleccionar ramas `stepN` concretas.
- Caveat de evaluación: la model card advierte de una salvedad sobre las filas de evaluación del checkpoint final, documentada en `LOSSES.md`; los `snapshot.json` de checkpoints subidos antes del 2026-11-18 solo registran `step`, `tokens_seen`, `lr` y `dtype`, por lo que `losses.csv` es la fuente autoritativa de pérdida.
- Reproducibilidad: la reproducción bit a bit de la inicialización de EleutherAI no es posible entre frameworks; solo se garantiza la coincidencia de distribución por tensor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-scaled-normal-seed11
- Repositorio de la receta Pythia: https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Modelo de referencia: https://huggingface.co/EleutherAI/pythia-410m
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos de la campaña DIET.
