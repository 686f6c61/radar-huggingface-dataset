# groxaxo/Haru-4B-MLX-oQ5-Selective

## Resumen

Haru-4B-MLX-oQ5-Selective es una conversión cuantizada de precisión mixta del modelo Haru-4B, un modelo de voz a voz (speech-to-speech) full-duplex desarrollado originalmente por higurashi-ai. La conversión ha sido realizada por groxaxo y está diseñada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El modelo resuelve el problema de desplegar un sistema conversacional de audio completo en hardware de consumo con memoria unificada limitada, manteniendo intactos los componentes críticos de audio (codec, cabeza MeanFlow, proyectores) y aplicando cuantización agresiva solo a matrices seleccionadas del backbone lingüístico.

La relevancia de esta ficha radica en que no se trata de una cuantización uniforme: el autor ha diseñado un esquema selectivo donde solo 8 matrices del backbone bajan a 5 bits, 46 permanecen a 6 bits y 75 se mantienen a 8 bits, con todas las proyecciones de atención y embeddings fijados a 8 bits. El checkpoint completo almacena 9,2196 bits por parámetro lógico, aunque el backbone promedia 7,0012 bits de código de peso (7,5012 incluyendo escalas y offsets afines). El resultado es un archivo de pesos de 6,074 GB, un 7,96% más pequeño que el checkpoint de 8 bits publicado por nano16 y un 42,38% más pequeño que el BF16 original.

El modelo se distribuye con licencia Apache 2.0 y requiere un loader personalizado incluido en el repositorio, ya que no es compatible con el servidor de chat estándar de oMLX ni con el loader genérico de mlx-lm. Está pensado para ejecutarse en Python 3.12 sobre Apple Silicon, probado en un Apple M5 con 24 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone lingüístico, codec de voz, cabeza MeanFlow de audio y proyectores de audio; modelo full-duplex de voz a voz |
| Parametros totales | 2.116.572.417 (según safetensors); el tamaño lógico del backbone cuantizado suma 4.204.789.760 pesos lógicos en las matrices cuantizadas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine quantization con group size 64; precisión mixta selectiva 5/6/8 bits; backbone promedio 7,0012 bits de código de peso (7,5012 bits con escalas y offsets); checkpoint completo 9,2196 bits almacenados por parámetro lógico |
| Idiomas soportados | No disponible (la validación usó prompts en inglés y español) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con loader personalizado `load_haru_mixed.py` |

## Arquitectura y entrenamiento

Se trata de un modelo de voz a voz full-duplex que combina un backbone lingüístico transformer con un codec de voz, una cabeza de audio MeanFlow y proyectores de audio. La conversión parte del checkpoint BF16 original de Haru-4B (higurashi-ai/Haru-4B) y aplica cuantización afín de MLX con grupo de tamaño 64. La receta de cuantización arranca del planificador oQ5 de oMLX 0.5.3 y eleva la precisión allí donde las pruebas de voz mostraron sensibilidad. Las ocho matrices de 5 bits corresponden a las proyecciones fusionadas `gate_up` del MLP en las capas indexadas desde cero 4, 5, 6, 21, 22, 23, 26 y 27; fueron seleccionadas por su sensibilidad medida sobre dos conversaciones de calibración usando 64 filas de activación BF16 originales por capa. Las proyecciones de atención y el embedding atado permanecen a 8 bits, incluida la `in_proj` recurrente fusionada. Las proyecciones `gate/up` de las cuatro primeras capas están al menos a 6 bits, los MLP de las cuatro últimas capas están a 8 bits y todas las proyecciones `down` del MLP están al menos a 6 bits.

La cuantización parte directamente del BF16 original, evitando una recuantización de 8 a 5 bits. Durante la conversión se preservaron 769 tensores protegidos (2.130.763.274 bytes) sin cambios: codec de voz, cabeza MeanFlow, proyectores de audio, normalización y parámetros recurrentes no matriciales. Para las ocho matrices de 5 bits se emplea la búsqueda de recorte afín ponderado por activación de oMLX 0.5.3 usando E[x²] solo de calibración, con una salvaguarda por grupo que retiene los valores afines nativos de MLX cuando el candidato almacenado incrementaría el error de reconstrucción ponderado bajo importancia bruta o estabilizada. El autor indica explícitamente que no se reclama el algoritmo oQe más reciente de oMLX. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de voz a voz full-duplex: el modelo recibe audio del usuario y produce audio de respuesta en la misma sesión, con salida estéreo opcional (usuario en canal izquierdo, modelo en canal derecho).
- Conversación multi-turno con historial de texto y audio: mantiene cachés recurrentes/KV propias durante la conversación.
- Clonación de voz mediante referencia: acepta un `voice.wav` de 3 a 180 segundos de un único hablante para condicionar la voz de salida.
- Control mediante prompt de sistema: acepta un archivo `card.txt` con el prompt de personaje o sistema.
- Generación de audio de duración equivalente a la entrada: produce tanto audio como dure el audio de entrada, por lo que se recomienda incluir silencio final en `user.wav` para permitir una réplica tras la pregunta.
- Reproducibilidad determinista: soporta semilla (`--seed`) para inferencia reproducible.
- Soporte multilingüe limitado en validación: se probaron prompts en inglés y español, aunque no se declara una lista oficial de idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, matemáticas ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo está diseñado para ejecutarse en Apple Silicon con MLX y 24 GB de memoria unificada, permitiendo desplegar un sistema de voz a voz completo sin conexión a la nube y con la conversación completa en local.
- Clonación de voz para agentes personalizados: usando un `voice.wav` de referencia de 3 a 180 segundos y un `card.txt` de personaje, se puede construir un agente con voz e identidad consistentes para aplicaciones de acompañamiento o atención al usuario.
- Prototipado de interfaces de voz full-duplex: la salida estéreo (usuario a la izquierda, modelo a la derecha) facilita la inspección y depuración de diálogos en herramientas de anotación y evaluación de sistemas conversacionales.
- Evaluación de robustez de cuantización en modelos de audio: los informes `quantization_plan.json` y `weighted_quantization_report.json` permiten reproducir y auditar la asignación de precisión por capa, útil en investigación sobre cuantización selectiva.
- Despliegue de bajo coste en hardware de consumo: con 6,074 GB de pesos, el modelo cabe en equipos Apple con 24 GB de memoria unificada, reduciendo la barrera de entrada frente al BF16 original de 10,540 GB.
- Investigación sobre fidelidad numérica de cuantizaciones mixtas: las métricas de KL de vocabulario completo, acuerdo top-1 y coseno de latentes de audio permiten comparar recetas de cuantización contra BF16 de referencia en un pipeline reproducible.
- Integración en aplicaciones de voz en tiempo real (con trabajo previo): la model card indica que la aplicación/servidor Haru en tiempo real necesita integrar este loader antes de poder leer el layout mixto, por lo que sirve como base para desarrollos de integración.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad numérica controlada frente al BF16 original, no benchmarks de calidad perceptual o inteligibilidad. Se comparan dos candidatos (Q8 upstream y este modelo selectivo) con historiales BF16 idénticos, latentes de audio de usuario, prompts y ruido de cabeza, manteniendo cada uno sus propias cachés recurrentes/KV. La KL se calcula sobre vocabulario completo con corrección FP32 PAD/EOP de upstream y antes de los filtros de muestreo.

| Métrica de validación fresca | Q8 upstream | Este modelo selectivo |
|---|---:|---:|
| KL media de vocabulario completo frente a BF16 | 0,003184 | 0,004129 |
| Acuerdo top-1, 600 frames totales | 98,33% | 97,50% |
| Acuerdo top-1 donde BF16 predice token léxico, 129 frames | 93,80% | 89,92% |
| Coseno medio de latentes de audio | no disponible (dato truncado en la información) | no disponible (dato truncado en la información) |

La validación se realizó con cuatro prompts frescos (dos en inglés, dos en español), tres semillas cada uno, produciendo 12 conversaciones libres de 240 segundos por modelo; la réplica numérica usó la semilla original de cada prompt (600 frames / 80 segundos). El baseline Q8 se regeneró a partir de los pesos originales fijados usando la conversión de 8 bits soportada por Haru upstream, siguiendo el enfoque publicado por nano16; las mediciones de runtime no cargaron directamente el archivo de pesos publicado por nano16, aunque la comparación de tamaño en disco usa los metadatos reales de dicho archivo.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: probado en Apple M5 con 24 GB de memoria unificada. El archivo de pesos `model.safetensors` ocupa 6.073.534.720 bytes (6,074 GB decimales), frente a 6.598.478.024 bytes (6,598 GB) del checkpoint de 8 bits de nano16 y 10.540.113.510 bytes (10,540 GB) del BF16 original.
- GPU recomendadas: Apple Silicon (M5 probado; MLX está orientado a Apple Silicon). No hay información sobre GPUs NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, en equipos Apple con al menos 24 GB de memoria unificada según la prueba del autor. No se especifican otros modelos de Apple Silicon.
- Opciones de despliegue: MLX con el loader personalizado incluido (`load_haru_mixed.py`) y la sesión `haru_mlx.session.DuplexSession`; dependencias fijadas en `requirements.txt` y `huggingface-hub==2.4.0` sobre Python 3.12. No es compatible con el servidor de chat estándar de oMLX ni con el loader genérico de mlx-lm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica que la inferencia offline produce tanto audio como dure la entrada y que la integración con la app/servidor Haru en tiempo real requiere conectar este loader, pero no publica cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haru-4B-MLX-oQ5-Selective (este) | 2.116.572.417 (safetensors); 4.204.789.760 pesos lógicos en matrices cuantizadas | No disponible | 6,074 GB | Apache 2.0 | Hugging Face, MLX con loader personalizado |
| Haru-4B-mlx-8bit (nano16) | No disponible | No disponible | 6,598 GB | No disponible | Hugging Face, MLX |
| Haru-4B BF16 original (higurashi-ai) | No disponible | No disponible | 10,540 GB | No disponible | Hugging Face |

La comparación principal disponible es de tamaño y fidelidad numérica: este checkpoint es un 7,96% más pequeño que el de 8 bits de nano16 y un 42,38% más pequeño que el BF16 original, con una KL media de vocabulario completo de 0,004129 frente a 0,003184 del Q8 upstream regenerado y un acuerdo top-1 de 97,50% frente a 98,33%. No se dispone de comparativas de rendimiento perceptual, latencia ni throughput entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es una cuantización uniforme de 5 bits: no cumple el presupuesto nominal de bits de oQ5 y no debe tratarse como tal.
- No es un checkpoint drop-in para el servidor de chat estándar de oMLX ni para el loader genérico de mlx-lm; requiere el loader personalizado `load_haru_mixed.py` y la sesión `DuplexSession` fijada.
- La integración con la app/servidor Haru en tiempo real no está incluida; el loader debe conectarse manualmente antes de que el servidor pueda leer este layout mixto.
- Las métricas publicadas son diagnósticos de fidelidad numérica, no porcentajes de inteligibilidad ni de calidad perceptual; no deben interpretarse como tales.
- La validación se limita a cuatro prompts frescos (dos en inglés, dos en español) y tres semillas, por lo que la cobertura lingüística y de dominios es reducida.
- Riesgo de alucinación: no se documenta en la información disponible, pero es un riesgo inherente a los modelos generativos de lenguaje y audio.
- Sesgos conocidos: no se documentan en la información disponible.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base higurashi-ai/Haru-4B, cuya licencia no se detalla en la información proporcionada.
- Requiere Python 3.12 y dependencias fijadas; desviarse de las versiones puede romper la reproducibilidad del runtime probado.
- La inferencia offline genera audio de duración equivalente a la entrada, lo que exige incluir silencio final en `user.wav` para obtener réplica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Haru-4B-MLX-oQ5-Selective
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Checkpoint de 8 bits de nano16: https://huggingface.co/nano16/Haru-4B-mlx-8bit
- Plan de cuantización (en el repositorio): `quantization_plan.json`
- Informe de cuantización ponderada (en el repositorio): `weighted_quantization_report.json`
- Loader personalizado (en el repositorio): `load_haru_mixed.py`
- Dependencias fijadas (en el repositorio): `requirements.txt`
