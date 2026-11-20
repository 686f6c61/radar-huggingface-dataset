# BurnyCoder/phylogeo-flat-probe-qwen3.5-2b

## Resumen

El modelo `BurnyCoder/phylogeo-flat-probe-qwen3.5-2b` no es un modelo generativo, sino una **sonda lineal (probe) de interpretabilidad** entrenada sobre las representaciones internas de `Qwen/Qwen3.5-2B`. Concretamente, mapea vectores del *residual stream* de la capa 6 del decodificador a distancias filogenéticas en el árbol de la vida de Open Tree of Life, siguiendo el enfoque del análisis de filogenia de Goodfire sobre Evo 2. La sonda es un subespacio plano de 10 dimensiones que transforma activaciones de 2B parámetros en una geometría métrica interpretable.

El interés técnico reside en que demuestra que un LLM de propósito general, sin entrenamiento específico en biología evolutiva, codifica estructura filogenética linealmente accesible en sus activaciones intermedias. El autor reporta una correlación de Pearson de 0,947 con la longitud de camino en el árbol para las 400 especies de entrenamiento, y de 0,749 ± 0,010 en validación cruzada dejando familias fuera (5 folds, 5 semillas), frente a -0,015 de una sonda control con árbol barajado.

El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,0 GB (los pesos de la sonda son de pequeña dimensión) y fue creado el 20 de noviembre de 2026. Es material de investigación en interpretabilidad mecanicista, no un artefacto para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal sobre subespacio plano de 10 dimensiones (PCA + proyección lineal + distancia geodésica en esfera) aplicada al residual stream de Qwen3.5-2B; el modelo base es un transformer decoder-only |
| Parametros totales | No disponible para la sonda (el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la sonda se entrenó con nombres comunes de especies en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`probe.safetensors`, incluye pesos y PCA) |

## Arquitectura y entrenamiento

La sonda opera en dos etapas sobre el vector de activación `x` extraído del residual stream tras la capa 6 del decodificador, en el último token del nombre de la especie, promediado sobre 8 prompts con formato de chat y centrado por plantilla sobre las 400 especies. Primero aplica una reducción PCA: `x_pca = (x - pca_mean) @ pca_components.T / z_scale`. Después proyecta linealmente a 10 dimensiones: `z = (x_pca - b) @ W.T`. La distancia entre dos especies se calcula como la distancia geodésica en la esfera unidad de los vectores `z` normalizados, escalada exponencialmente: `d = exp(log_beta) * arccos(cos(z_i, z_j)) / target_scale`.

El entrenamiento se realizó con Adam, 2000 pasos de batch completo, semilla 0, sobre las 400 especies del conjunto completo. La validación cruzada por familias (5 folds, 5 semillas) reportada en el paper asociado alcanza un Pearson de 0,749 ± 0,010 en familias no vistas, y 0,750 ± 0,012 sobre 20 semillas adicionales. La sonda control con árbol barajado obtiene -0,015, lo que confirma que la estructura capturada no es un artefacto del ajuste.

## Capacidades

- No genera texto ni realiza inferencia generativa: es una sonda de interpretabilidad.
- Mapea activaciones del residual stream de Qwen3.5-2B (capa 6) a coordenadas de 10 dimensiones con estructura filogenética.
- Calcula distancias geodésicas entre especies en el espacio latente y las compara con distancias del árbol de Open Tree of Life.
- Proporciona coordenadas precalculadas de 400 especies en `species_coordinates.csv`.
- Funciona con nombres comunes de especies en inglés; los binomios latinos no muestran estructura comparable según el autor.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar cómo un LLM de 2B organiza conocimiento biológico en su espacio de representaciones, usando la sonda como instrumento de medida de la geometría latente.
- Replicación de experimentos de geometría de representaciones: el código, la preregistración y el paper están publicados en el repositorio de GitHub del autor, lo que permite reproducir el pipeline completo (extracción de activaciones, PCA, entrenamiento de la sonda y validación cruzada).
- Auditoría de sesgos taxonómicos: comparar la correlación de la sonda entre distintos grupos taxonómicos para detectar qué ramas del árbol de la vida están peor representadas en el modelo base.
- Extensión a otros dominios: la metodología (subespacio plano + distancia geodésica sobre residual stream) puede trasladarse a otros grafos de conocimiento (genealogías, taxonomías de productos, ontologías médicas) para medir si el modelo los codifica linealmente.
- Docencia en interpretabilidad: ejemplo compacto y reproducible de cómo entrenar y validar una sonda lineal sobre activaciones de un transformer pequeño.
- Comparación entre modelos base: ejecutar la misma sonda sobre otros modelos de tamaño similar para estudiar si la estructura filogenética es universal o específica de Qwen3.5-2B.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pearson con longitud de camino (entrenamiento, 400 especies) | 0,947 |
| Pearson en familias no vistas (5-fold, 5 semillas) | 0,749 ± 0,010 |
| Pearson en familias no vistas (20 semillas adicionales) | 0,750 ± 0,012 |
| Sonda control con árbol barajado | -0,015 |
| Spearman intra-grupo en validación cruzada | Inferior al Pearson global (valor concreto no disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que la sonda no es un modelo generativo.

## Requisitos de hardware

- La sonda en sí es de dimensión reducida (PCA + matriz de 10 dimensiones) y cabe en CPU; el `probe.safetensors` ocupa una fracción mínima de los 0,0 GB del repositorio.
- Para extraer las activaciones es necesario ejecutar el modelo base Qwen3.5-2B: con cuantización de 4 bits cabe en GPUs consumer de 8 GB de VRAM (RTX 3060, RTX 4060); en FP16 requiere aproximadamente 4-5 GB de VRAM, por lo que cabe en RTX 4090, A100, H100 y GPUs de 8 GB o más.
- Opciones de despliegue del modelo base: transformers, vLLM, llama.cpp u Ollama para la extracción de activaciones; la sonda se ejecuta con PyTorch y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phylogeo-flat-probe-qwen3.5-2b | Sonda de interpretabilidad sobre Qwen3.5-2B | Sonda de 10 dimensiones; base de 2B | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B | LLM generativo base | 2B | No disponible | No disponible en la información | Hugging Face |
| Análisis de filogenia de Goodfire sobre Evo 2 | Metodología de sonda lineal sobre modelo genómico | No aplica | No aplica | No disponible | Blog de Goodfire |

No se dispone de otras sondas filogenéticas públicas comparables en la información proporcionada.

## Limitaciones y advertencias

- La sonda se ajusta a la longitud de camino en la topología de Open Tree of Life; no modela tiempos de divergencia.
- Entrenada con nombres comunes en inglés; los binomios latinos no muestran estructura comparable.
- La alta correlación en validación cruzada refleja en parte estructura de grupos gruesos (clase); dentro de grupos, la correlación de Spearman es inferior (valor concreto no disponible en la información).
- Es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento continuado.
- Depende de una versión concreta del modelo base (Qwen3.5-2B) y de la capa 6; cambios en el modelo invalidan la sonda.
- Licencia Apache 2.0 permite uso comercial de la sonda, pero el modelo base Qwen3.5-2B puede tener condiciones propias que deben verificarse por separado.
- Riesgo de sobreinterpretación: una correlación alta no implica que el modelo "comprenda" la filogenia, solo que la información es linealmente decodificable desde esa capa.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/phylogeo-flat-probe-qwen3.5-2b
- Repositorio de código, preregistración y paper: https://github.com/BurnyCoder/phylogenetic-geometry-of-tree-of-life-in-llms-mechanistic-interpretability
- Análisis de filogenia de Goodfire (referencia metodológica): https://www.goodfire.com/research/phylogeny-manifold
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
