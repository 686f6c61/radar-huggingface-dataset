# Ashan0525/LingeeJevMulti-4B-v1

## Resumen

LingeeJevMulti-4B-v1 es un modelo multimodal de 4.539 millones de parámetros (4,54B, de los cuales 0,33B corresponden al codificador visual) desarrollado por el usuario Ashan0525 y publicado en Hugging Face. Se construye como un fine-tuning del modelo base Qwen/Qwen3.5-4B y se presenta bajo una etiqueta poco habitual: "decision-model" o "system-one". No es un modelo conversacional generativo al uso, sino un modelo que devuelve distribuciones de probabilidad nativas para decisiones tipadas (`choice`, `noul` y `score`) en lugar de texto explicativo.

El modelo acepta como entrada texto o estado estructurado junto con una o varias imágenes (con un límite declarado de 1.638.400 píxeles por imagen) y expone una API HTTP propia (`POST /v1/systemone`) mediante un script de arranque incluido (`systemone.py`). Esta orientación hacia la salida probabilística calibrada lo sitúa en la categoría de modelos de decisión rápida —de ahí la etiqueta "system-one"—, pensados para integrarse como componente de clasificación o puntuación dentro de pipelines mayores.

Su relevancia actual es acotada pero específica: cubre un nicho donde otros modelos multimodales obligan a parsear texto libre para extraer una decisión, mientras que este expone directamente probabilidades por opción. La información pública disponible es escasa (0 descargas, 0 likes en el momento de la consulta) y no se han publicado resultados oficiales de benchmarks, por lo que debe evaluarse con cautela antes de un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tuning de Qwen/Qwen3.5-4B), con codificador visual de 0,33B y módulo "Decision Readout" |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5, y le añade un componente propietario denominado "Decision Readout" que transforma la representación interna en distribuciones de probabilidad sobre decisiones tipadas. La entrada puede ser texto o estado estructurado, opcionalmente acompañado de una o más imágenes procesadas por un codificador visual de 0,33B de parámetros. La salida no es texto generado, sino tres tipos de distribución: `choice` (probabilidad por cada opción de un conjunto de criterios), `noul` (probabilidad binaria sí/no) y `score` (puntuación probabilística).

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona únicamente que el directorio del modelo incluye configuración, tokenizer, processor, archivos de Decision Readout y runtime, y que `COMPLETE.json` contiene hashes SHA-256 de integridad de los ficheros de la release. La reproducibilidad se apoya en un `requirements.txt` con versiones fijadas de Python y paquetes. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Lectura conjunta de texto o estado estructurado e imágenes (hasta 1.638.400 píxeles por imagen).
- Emisión de distribuciones de probabilidad nativas para decisiones de tipo `choice` (selección entre opciones con criterios definidos).
- Emisión de probabilidades para decisiones `noul` (sí/no).
- Emisión de puntuaciones probabilísticas para decisiones `score`.
- Salida sin texto explicativo: el modelo no genera justificaciones ni razonamiento en lenguaje natural.
- Exposición mediante API HTTP local (`POST /v1/systemone`) con payload JSON que define estado, preguntas y criterios.
- Capacidad multimodal imagen-texto a texto-decisión (pipeline `image-text-to-text`).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Clasificación visual con probabilidades calibradas: enviar una imagen junto con un conjunto de criterios (`{"A": "red", "B": "blue"}`) y obtener la distribución de probabilidad por opción, útil para triaje automático de imágenes donde se necesita una confianza numérica en lugar de una etiqueta seca.
- Enrutamiento de decisiones en pipelines: usar la salida `choice` como señal para derivar una petición a un modelo mayor o a un servicio especializado, aprovechando que el modelo devuelve probabilidades directamente sin necesidad de parsear texto.
- Verificación binaria de condiciones sobre imágenes o estado estructurado mediante decisiones `noul`, por ejemplo para comprobar si una captura cumple un criterio visual antes de continuar un flujo.
- Puntuación probabilística de candidatos: emplear `score` para ordenar opciones o respuestas según la probabilidad asignada por el modelo, integrándolo en sistemas de ranking o filtrado.
- Componente "system-one" en arquitecturas de decisión rápida: actuar como primera etapa de bajo coste que resuelve casos claros y delega los ambiguos a un modelo de razonamiento más pesado.
- Evaluación de modelos de decisión: servir como referencia reproducible (con hashes de integridad y `requirements.txt`) para experimentos académicos sobre calibración de probabilidades en modelos multimodales pequeños.
- Despliegue local en servidor propio: el script `systemone.py` permite levantar el servicio en `127.0.0.1:8000`, adecuado para entornos controlados donde no se quiere depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se incluyen mediciones locales en `benchmark_1p6mp.json` realizadas en una GPU H200 con imágenes de 1,6MP en estado "warm", pero no se proporcionan los valores numéricos en la información accesible. Asimismo, se señala que los resultados oficiales de leaderboard solo se publicarán cuando los mantenedores del benchmark evalúen esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,54B parámetros, una estimación orientativa en FP16 rondaría los 9-10 GB de pesos, y en cuantizaciones de 8 bits o 4 bits bajaría sustancialmente, pero el autor no publica cifras ni tipos de cuantización soportados.
- GPU recomendadas: la model card menciona mediciones en una NVIDIA H200; no se documentan otras GPU probadas.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño, un modelo de 4,54B en FP16 podría caber en GPUs de consumo con 12-16 GB de VRAM, pero al no publicarse cuantizaciones ni requisitos, no puede afirmarse.
- Opciones de despliegue: el autor proporciona un servidor propio (`systemone.py`) con API HTTP en `/v1/systemone`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Solo se indica que existen mediciones "warm" en H200 a 1,6MP, sin valores publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingeeJevMulti-4B-v1 | 4,54B (0,33B visión) | No disponible | Probabilidades tipadas (choice/noul/score) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible en esta ficha | Texto generativo multimodal | Según modelo base | Hugging Face |
| Alternativas de clasificación visual | No disponible | No disponible | Etiquetas o logits | Variable | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. El modelo base Qwen3.5-4B es el referente directo más cercano, pero LingeeJevMulti-4B-v1 cambia el paradigma de salida (probabilidades tipadas en lugar de texto), por lo que la comparación directa de capacidades no es trivial.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia pública de uso ni validación por parte de la comunidad.
- No se han publicado resultados oficiales de benchmarks; las mediciones locales en H200 no están disponibles en la información accesible.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento multilingüe fiable.
- No se documenta la longitud de contexto, dato crítico para planificar integraciones.
- No se publican tipos de cuantización ni requisitos de VRAM, lo que dificulta el despliegue en hardware de consumo.
- El modelo no genera texto explicativo: no es adecuado para tareas conversacionales ni para justificar decisiones en lenguaje natural.
- Riesgo de alucinación y sesgos: no documentado por el autor; al ser un fine-tuning de Qwen3.5-4B, hereda potencialmente los sesgos del modelo base, pero no se aporta información específica.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` al redistribuir.
- La API propia (`/v1/systemone`) no es estándar (no es compatible con OpenAI API), lo que añade trabajo de integración.
- El límite de 1.638.400 píxeles por imagen puede ser restrictivo para imágenes de alta resolución sin preprocesado previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ashan0525/LingeeJevMulti-4B-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
