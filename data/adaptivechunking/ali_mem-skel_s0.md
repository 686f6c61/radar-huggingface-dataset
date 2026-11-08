# AdaptiveChunking/ali_mem-skel_s0

## Resumen

ali_mem-skel_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un H-Net de nivel de byte (byte-level) entrenado con el framework beetle-hnet, con arquitectura interna `ali` y objetivo `ratio`. No es un modelo conversacional ni un modelo de lenguaje de uso general: es un artefacto de experimentación orientado al estudio de la tokenización dinámica por chunks (dynamic chunking) sobre flujos de bytes.

El modelo tiene 22.785.088 parámetros totales según los pesos en safetensors, lo que lo sitúa en la escala de un modelo pequeño. El entrenamiento documentado comprende 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés. El repositorio ocupa 7,2 GB, un tamaño desproporcionado respecto a los parámetros, explicable por el almacenamiento de múltiples checkpoints con estado completo del entrenador.

Su relevancia es fundamentalmente metodológica: ejemplifica un flujo de trabajo reproducible con checkpoints por fases en una programación logarítmica y sondas de frontera sobre FLORES+, útil para investigadores que estudian segmentación adaptativa y tokenización a nivel de byte. No dispone de descargas ni likes, y no se ha publicado pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net de nivel de byte (byte-level), variante `ali` de beetle-hnet |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores atados almacenados una sola vez); estado del entrenador en `checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con `architecture=ali` y `objective=ratio`. Opera a nivel de byte, sin tokenizador subword convencional, y aplica un mecanismo de chunking dinámico (`dechunk=ema`) que agrupa bytes de forma adaptativa durante el procesamiento. La configuración indica `schedule=None`, es decir, sin una programación explícita de chunking más allá del mecanismo EMA.

El entrenamiento se realizó durante 6000 pasos, con lotes de 32 secuencias de 1024 bytes cada una, sobre un corpus en inglés, turco y finés. No se detalla en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación destacable es el esquema de checkpoints por fases: ramas `step-N` en una programación logarítmica en base 2 desde el inicio de cada fase del objetivo, más el paso final, cada una con pesos, configuración, `training_config.yaml` y estado reanudable del entrenador. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, al finalizar, sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado y segmentación de secuencias de bytes con chunking dinámico adaptativo.
- Entrenamiento y evaluación reproducibles: checkpoints reanudables con estado completo del entrenador.
- Sondas de evaluación de fronteras de chunk sobre FLORES+ (generadas al finalizar el entrenamiento).
- Cobertura lingüística limitada a inglés, turco y finés según el corpus de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta generación de texto conversacional ni instrucciones; es un artefacto de investigación, no un modelo alineado para uso directo.

## Casos de uso

- Investigación en tokenización adaptativa: comparar la variante `ali` con otras arquitecturas de beetle-hnet sobre el mismo corpus y presupuesto de pasos, usando los checkpoints `step-N` para trazar la evolución del chunking.
- Estudio de fronteras de segmentación: analizar las sondas FLORES+ en `probe/` para medir cómo el modelo delimita chunks en inglés, turco y finés, idiomas con morfología y ortografía muy distintas.
- Reproducción de experimentos: reanudar el entrenamiento desde `training_state/checkpoint.pt` de cualquier rama `step-N` para extender pasos o cambiar hiperparámetros sin reiniciar desde cero.
- Evaluación de estrategias de dechunking: comparar `dechunk=ema` frente a alternativas modificando la configuración y reentrenando con el mismo pipeline.
- Docencia y formación: usar el repositorio como ejemplo didáctico de organización de checkpoints por fases y de gestión de tensores atados en safetensors.
- Análisis de eficiencia en byte-level: medir coste computacional y calidad de representación sin tokenizador subword en lenguas aglutinantes como el turco y el finés.
- Base para experimentos de compresión o segmentación downstream: reutilizar las representaciones de chunk como entrada a tareas de clasificación o etiquetado a nivel de byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB, y en fp16 unos 46 MB; el estado del entrenador y los checkpoints adicionales elevan el requisito de disco, no el de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en fp32; una RTX 3060 o superior resulta holgada. Para reentrenamiento, se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) por el estado del optimizador y los lotes de 32 × 1024 bytes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada de beetle-hnet, requiere el código del repositorio beetle-hnet; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-skel_s0 | 22,8 M | no disponible (entrenado a 1024 bytes) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face, 0 descargas |
| Otras variantes de beetle-hnet | no disponible | no disponible | H-Net byte-level con otras arquitecturas u objetivos | no disponible | no disponible |
| Modelos byte-level tipo ByT5 | no disponible en esta ficha | no disponible | Transformer byte-level sin tokenizador | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para este modelo, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni evaluación publicada; no debe usarse en producción sin validación propia.
- Sesgos desconocidos: no se documenta la composición del corpus más allá de los tres idiomas, por lo que no pueden evaluarse sesgos lingüísticos o culturales.
- Riesgo de alucinación no evaluado: no es un modelo alineado para generación conversacional y no se han publicado métricas de fidelidad.
- Cobertura idiomática restringida a inglés, turco y finés; el comportamiento en otros idiomas, incluido el español, es indeterminado.
- Contexto de entrenamiento de 1024 bytes; no se documenta capacidad de extrapolación a secuencias más largas.
- Requiere el código de beetle-hnet para cargar la arquitectura; los safetensors por sí solos no son suficientes con librerías estándar.
- Los tensores atados se almacenan una sola vez; es necesario aplicar el mapeo de `config.json["tied_weights"]` para reconstruir el modelo completo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y soporte desaconseja cualquier despliegue sin pruebas exhaustivas.
- Repositorio de 7,2 GB por los múltiples checkpoints con estado del entrenador; conviene descargar solo la revisión necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-skel_s0
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
