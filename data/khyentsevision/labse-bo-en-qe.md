# khyentsevision/labse-bo-en-qe

## Resumen

labse-bo-en-qe es un modelo de estimación de calidad (quality estimation, QE) sin referencia para traducción automática tibetano→inglés, desarrollado por el usuario khyentsevision. Dado un segmento fuente en tibetano y su traducción al inglés, predice una puntuación de calidad sin necesidad de contar con una traducción de referencia. Esto lo diferencia de métricas clásicas como BLEURT, que requieren una referencia para comparar.

Técnicamente es un encoder BERT de 470.926.848 parámetros (471M) construido sobre sentence-transformers/LaBSE, al que se le añade un pooling de media y una cabeza lineal. El modelo es el resultado de destilar las puntuaciones de un panel de jueces LLM (Gemini, Grok, GPT) sobre pares fuente-traducción, de modo que un encoder pequeño y ejecutable en local aproxima el comportamiento de evaluadores mucho más costosos.

Su relevancia radica en que ofrece una señal de ranking local y barata para evaluar sistemas de traducción tibetana, un par de lenguas con pocos recursos y escasa cobertura de métricas automáticas. La model card advierte que retiene aproximadamente el 70 % de la correlación del panel de jueces LLM y que no debe sustituir el juicio experto, dado que el conjunto de evaluación es reducido (100 segmentos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (LaBSE) con mean pooling y cabeza lineal |
| Parametros totales | 470.926.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (fuente + traducción combinadas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bo (tibetano), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de LaBSE (Language-agnostic BERT Sentence Embedding), un transformer BERT de 471M parámetros. Sobre el par (fuente, traducción) se aplica mean pooling y una cabeza lineal que produce una puntuación z. No se carga mediante un `pipeline` de transformers; el repositorio incluye `score.py` con las funciones `load`, `score` y `to_panel_scale`. Las entradas se truncan a 256 tokens sumando fuente y traducción.

El entrenamiento destila puntuaciones de jueces LLM sobre tres conjuntos de etiquetas, cada uno z-normalizado por separado y luego agrupado: aproximadamente 47k traducciones sintéticas humanas puntuadas con Gemini 2.5 Flash (3 ejecuciones), unas 14k traducciones sintéticas deficientes puntuadas con Gemini 2.5 Flash Lite (3 ejecuciones) y unas 13k salidas de MT puntuadas con GEMBA-DA sin referencia (media de grok-4.3, gpt-5.4 y gemini-3-flash). La pérdida combina error cuadrático medio y un término de ranking por pares dentro de los candidatos de cada fuente. Se entrenó 2 épocas con learning rate 2e-5, batch efectivo 32 y longitud máxima 256, conservando el checkpoint con mejor Spearman de validación (0.625) frente al panel. Los splits se hicieron por texto, excluyendo segmentos del conjunto de evaluación humana y de los textos reservados. Un estudio interno indica que añadir MT local puntuada con BLEURT y traducciones corruptas degrada el rendimiento (Spearman proxy de 0.603 a 0.511), y que eliminar el término de ranking nunca mejoró los resultados, aunque la evidencia de que ayude es débil.

## Capacidades

- Estimación de calidad sin referencia de traducciones tibetano→inglés.
- Puntuación z por par (fuente, traducción), donde mayor es mejor.
- Mapeo a una escala aproximada 0–100 mediante `to_panel_scale`, basada en la media y dispersión de las etiquetas del panel.
- Ranking y comparación de traducciones de material de longitud similar.
- Ejecución local sin dependencia de APIs de LLM en inferencia.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los dos idiomas declarados (bo, en).

## Casos de uso

- Evaluación de sistemas de traducción tibetana en desarrollo: puntuar las salidas de distintos motores MT sobre el mismo segmento para ordenarlos sin disponer de referencias humanas.
- Control de calidad en pipelines de traducción de textos budistas: filtrar traducciones de baja puntuación antes de la revisión humana, reduciendo el volumen que llega a los revisores.
- Selección de la mejor salida entre varios candidatos (reranking) en un sistema de traducción con múltiples hipótesis, usando `score` como señal comparativa.
- Monitorización continua de un servicio de traducción: ejecutar el modelo localmente para detectar degradaciones de calidad a lo largo del tiempo sin coste de API.
- Investigación en QE para lenguas de bajos recursos: servir como línea base ligera y reproducible frente a métricas con referencia como BLEURT.
- Anotación asistida: priorizar segmentos dudosos para anotación experta, aprovechando que el modelo no necesita referencia y corre en hardware modesto.

## Benchmarks y rendimiento

Conjunto de test de 100 segmentos tibetano→inglés puntuados por expertos. Correlaciones de Pearson r con la media de anotadores; la fila del modelo incluye intervalo de confianza del 95 % por bootstrap emparejado.

| Scorer | Requiere referencia | r |
|---|---|---|
| Panel de jueces LLM (3 jueces, GEMBA-DA) | no | 0.762 |
| labse-bo-en-qe | no | 0.538 (0.396–0.672) |
| BLEURT (bleurt-large-512) | sí | 0.478 |
| BLEURT-20-D12 | sí | 0.394 |

Frente a BLEURT, el modelo no necesita referencia y la diferencia no es estadísticamente distinguible (+0.060, intervalo −0.118 a 0.257). Frente al panel de jueces LLM, retiene aproximadamente el 70 % de su correlación (retención 0.706, intervalo 0.521–0.894), con posible deriva si cambian los proveedores de los jueces. En validación alcanzó Spearman 0.625 frente al panel. En pasajes multi-segmento (150 traducciones) bajó a Spearman 0.297 (intervalo 0.102–0.469), y ampliar el límite a 512 tokens solo añadió 0.039.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 471M parámetros en fp32 el peso ronda 1.9 GB, por lo que en fp16 o bf16 se sitúa en torno a 1 GB más overhead.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (por ejemplo, RTX 3060 en adelante).
- Cabe en GPU de consumo: sí, dado el tamaño del modelo; el límite práctico es la memoria necesaria para el encoder y el batch.
- Opciones de despliegue: el autor indica que no se carga mediante `pipeline` de transformers; se usa `score.py` del repositorio con torch, transformers, safetensors, huggingface_hub y numpy (Python 3.10 o superior). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Requiere referencia | r (test 100 seg.) | Licencia |
|---|---|---|---|---|---|
| labse-bo-en-qe | 471M | 256 tokens | no | 0.538 | Apache-2.0 |
| BLEURT (bleurt-large-512) | no disponible | no disponible | sí | 0.478 | no disponible |
| BLEURT-20-D12 | no disponible | no disponible | sí | 0.394 | no disponible |
| Panel de jueces LLM (GEMBA-DA) | no disponible | no disponible | no | 0.762 | no disponible |

## Limitaciones y advertencias

- Solo cubre tibetano→inglés y mayoritariamente texto literario y filosófico budista.
- Las etiquetas provienen de jueces LLM, por lo que el modelo hereda sus sesgos y tiende a quedarse por debajo de la concordancia del panel con los expertos.
- El rendimiento se degrada con la longitud: Spearman 0.297 en pasajes multi-segmento frente al panel; ampliar a 512 tokens apenas mejora, por lo que el truncamiento no es el mecanismo principal.
- Puede separar peor entre sistemas fuertes: Spearman 0.449 al comparar solo Claude Opus 4.8 y Gemini 3 Flash, frente a 0.599 sobre 34 sistemas.
- Las puntuaciones no están calibradas entre dominios o longitudes de segmento muy distintos.
- El conjunto de test de 100 segmentos es pequeño; debe tratarse como señal de ranking barata y local, no como sustituto del juicio experto.
- Riesgo de alucinación: no aplica como generador de texto, pero las puntuaciones pueden ser poco fiables fuera de la distribución de entrenamiento.
- Licencia Apache-2.0, igual que el modelo base LaBSE, sin restricciones adicionales conocidas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khyentsevision/labse-bo-en-qe
- Modelo base LaBSE: https://huggingface.co/sentence-transformers/LaBSE
- Tibetan AI Leaderboard (pestaña Translation Quality Evaluation): https://huggingface.co/spaces/khyentsevision/tibetan-ai-leaderboard
