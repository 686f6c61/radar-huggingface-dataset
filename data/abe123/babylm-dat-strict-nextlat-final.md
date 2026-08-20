# abe123/babylm-dat-strict-nextlat-final

## Resumen

DAT Strict NextLat Final es un modelo de lenguaje causal basado en un Dual Attention Transformer (DAT) de 304 millones de parametros, entrenado desde cero por el usuario abe123 para la pista Strict del reto BabyLM 2026. El reto BabyLM consiste en entrenar modelos de lenguaje con un limite estricto de datos (100 millones de palabras) para estudiar la adquisicion del lenguaje en condiciones realistas. El modelo combina atencion self-attention clasica con atencion relacional (RCA), simbolos posicionales relativos compartidos y un objetivo auxiliar de entrenamiento denominado NextLat, disenado para mejorar la prediccion del siguiente token.

Con 16 capas transformer, dimension oculta de 1.024, 12 cabezas de self-attention y 4 cabezas de atencion relacional, el modelo alcanza una longitud de contexto maxima de 514 tokens. Se entreno durante diez pasadas completas sobre el corpus BabyLM 2026 Strict, utilizando los optimizadores Muon y LambW, y se publica con pesos de media movil exponencial (EMA) con decaimiento 0.999. El repositorio incluye el tokenizador y el codigo personalizado necesario para cargarlo mediante las clases Auto de HuggingFace Transformers.

La relevancia de este modelo radica en su propuesta arquitectonica: combina atencion dual (self y relacional) con un objetivo auxiliar de latencia (NextLat) en un regimen de datos extremadamente limitado, lo que lo convierte en un candidato interesante para investigacion en eficiencia de datos y adquisicion del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual Attention Transformer (DAT) causal |
| Parametros totales | 304.318.464 (~304 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 514 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus BabyLM es principalmente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con dimension oculta de 1.024. Cada capa combina 12 cabezas de self-attention con 4 cabezas de atencion relacional (RCA), junto con recuperacion compartida de simbolos posicionales relativos sin RoPE relativo. La codificacion posicional de tokens usa RoPE (rotary positional encoding) y las capas feed-forward emplean activacion SwiGLU. El vocabulario tiene 16.384 tokens y las embeddings de entrada y la cabeza de salida no comparten pesos.

El entrenamiento se realizo sobre el corpus BabyLM 2026 Strict, con un limite de 100 millones de palabras, durante diez pasadas completas. Se usaron lotes de 42 secuencias de 512 tokens, semilla 1, optimizador Muon para los parametros de matrices ocultas y LambW para el resto. La tasa de aprendizaje de Muon fue 0.02, la auxiliar 0.001, con weight decay 0.01 y un schedule de 1% de warmup seguido de decaimiento coseno hasta el 10% de la tasa inicial.

El objetivo auxiliar NextLat se configuro con horizonte 1, peso de cross-entropy 0.0, peso KL 0.5 y peso MSE 1.0. Se mantuvo una media movil exponencial (EMA) con decaimiento 0.999 durante el entrenamiento, y los pesos publicados corresponden a la EMA final. No se utilizo modelo profesor, aumentacion de datos sintetica ni entrada multimodal. El repositorio incluye checkpoints intermedios con nombres oficiales de BabyLM (chck_1M a chck_1000M) que representan palabras acumuladas procesadas a lo largo de las pasadas.

## Capacidades

- Generacion de texto causal: el modelo predice el siguiente token de forma autoregresiva.
- Razonamiento linguistico con datos limitados: entrenado con solo 100 millones de palabras, similar a la exposicion linguistica de un nino.
- Atencion relacional: incorpora cabezas de atencion relacional (RCA) que modelan relaciones entre tokens mas alla de la atencion clasica.
- Objetivo auxiliar NextLat: disenado para mejorar la prediccion del siguiente token mediante un objetivo de latencia con horizonte 1.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible (el corpus BabyLM es principalmente ingles).
- Modo thinking: no disponible.

## Casos de uso

- Evaluacion en el reto BabyLM 2026: el modelo esta disenado para participar en la pista Strict del reto, que evalua la capacidad de los modelos para aprender lenguaje con datos limitados. Se puede evaluar con el pipeline oficial de BabyLM 2026.
- Investigacion en adquisicion del lenguaje: permite estudiar como una arquitectura con atencion dual y objetivo auxiliar aprende gramatica y semantica con una cantidad de datos comparable a la exposicion infantil.
- Comparacion de arquitecturas bajo restriccion de datos: util para comparar DAT frente a transformers clasicos (como GPT-2) en regimen de datos limitados, controlando el numero de parametros.
- Estudio de objetivos auxiliares: el objetivo NextLat puede analizarse de forma aislada para medir su contribucion al rendimiento frente a modelos sin este objetivo.
- Investigacion en eficiencia de datos: el modelo sirve como punto de partida para experimentos sobre tecnicas de regularizacion, aumentacion o curriculum learning en corpus pequenos.
- Reproducibilidad de experimentos: al publicarse checkpoints intermedios (chck_1M a chck_1000M), permite analizar la dinamica de aprendizaje a lo largo de las pasadas sobre el corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 304 millones de parametros, en fp16 se necesitan aproximadamente 610 MB de VRAM; en int8 unos 305 MB; en int4 unos 155 MB. Cabe holgadamente en cualquier GPU de consumo moderna (8 GB o mas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). Para entrenamiento o evaluacion con lotes grandes se recomienda una GPU con 16 GB o mas.
- Despliegue: se carga mediante HuggingFace Transformers con `trust_remote_code=True`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.
- Nota: el repositorio ocupa 67.3 GB debido a los multiples checkpoints intermedios; la descarga completa puede ser pesada si solo se necesita el modelo final.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparativa se limita a aspectos arquitectonicos y de entrenamiento. Los modelos comparables son los baselines GPT-2 del reto BabyLM 2026 (pista Strict), que usan la arquitectura GPT-2 clasica con el mismo corpus y limite de datos. La diferencia principal es que este modelo incorpora atencion relacional y el objetivo auxiliar NextLat, mientras que los baselines GPT-2 usan atencion clasica y entrenamiento estandar de lenguaje. No se dispone de datos numericos de rendimiento para comparar.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` al cargarse con las clases Auto de HuggingFace, lo que implica ejecutar codigo personalizado del autor. Se recomienda revisar el codigo antes de usarlo en entornos de produccion.
- Longitud de contexto limitada a 514 tokens, insuficiente para tareas que requieran contexto largo.
- Entrenado exclusivamente sobre el corpus BabyLM 2026 Strict (100 millones de palabras), por lo que su conocimiento del mundo y su vocabulario son limitados en comparacion con modelos entrenados con datos a gran escala.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas estandar (MMLU, HumanEval, etc.) es desconocido.
- No soporta tool calling, agentes ni capacidades multimodales.
- El modelo esta pensado para investigacion y evaluacion en el contexto de BabyLM, no para uso en produccion.
- Los idiomas soportados no estan documentados; el corpus BabyLM es principalmente ingles, por lo que el rendimiento en otros idiomas no esta garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abe123/babylm-dat-strict-nextlat-final
- Repositorio del modelo (variante sin "final"): https://huggingface.co/abe123/babylm-dat-strict-nextlat
- Web del reto BabyLM: https://babylm.github.io/
- Organizacion BabyLM en GitHub: https://github.com/babylm
- Baselines de BabyLM 2026: https://github.com/babylm-org/babylm-baselines/tree/main/strict-interaction
