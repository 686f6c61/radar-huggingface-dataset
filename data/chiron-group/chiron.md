# chiron-group/chiron

## Resumen

Chiron es un adaptador LoRA (PEFT) publicado por chiron-group sobre el modelo base Qwen/Qwen3.6-35B-A3B, orientado a la medición psicológica, la predicción de comportamiento individual y la simulación de poblaciones. No se distribuye como un modelo completo, sino como un repositorio de 0,1 GB que contiene los pesos del adaptador en `model/`, una cabeza de medición de 109 constructos, código de inferencia y ejemplos de uso. El modelo base (35B parámetros totales, arquitectura MoE con 3B activos según la nomenclatura A3B de Qwen) se descarga aparte y se combina con el adaptador en tiempo de carga.

El modelo resuelve tres tareas diferenciadas: puntuar registros textuales sobre 109 constructos psicológicos en una escala calibrada de −1 a 1, predecir respuestas a ítems de cuestionario (por ejemplo, escalas IPIP-FFM) a partir de observaciones de una persona, y simular poblaciones de encuestados sintéticos dados un contexto experimental y un conjunto de preguntas con opciones de respuesta. La inferencia puede ejecutarse con Transformers/PyTorch o contra un servidor vLLM, con decodificación determinista (temperatura 0) y modo de razonamiento desactivado.

Su relevancia actual radica en que empaqueta en un único artefacto un pipeline completo de psicometría asistida por LLM, con una cabeza de medición explícita y una API de simulación reproducible (semilla configurable). El autor restringe explícitamente el uso a investigación y prohíbe su empleo para diagnóstico clínico o cribado de individuos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35B en el modelo base (adaptador LoRA de tamano no disponible; repo de 0,1 GB) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | 8.192 tokens por defecto, incluyendo respuestas generadas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado |
| Libreria | peft |
| Cabeza de medicion | 109 constructos, calibrada a objetivos en −1 a 1 |
| Version de Python | 3.12 (Linux) |
| PyTorch | 2.11.0 con CUDA 12.8 |

## Arquitectura y entrenamiento

Chiron no es un modelo entrenado desde cero: es un adaptador LoRA acoplado a Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos de 35B parámetros totales y 3B activos. Sobre esa base, el autor añade una cabeza de medición específica de 109 constructos psicológicos cuyas predicciones están calibradas contra objetivos en el rango −1 a 1, aunque la salida puede exceder ese intervalo. El repositorio incluye además el código de inferencia (`inference.Chiron`) con tres puntos de entrada: `measure`, `predict` y `simulate_population`.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación más allá de la configuración de inferencia: temperatura 0, razonamiento desactivado y `max_new_tokens` de 128 por defecto. El flujo de predicción construye un prompt fijo en el orden `record_context`, `observations`, `questions`, formateando las listas como registros con viñetas y preguntas numeradas.

## Capacidades

- Medición psicológica: puntúa registros textuales sobre 109 constructos (`model.constructs` los enumera) mediante `model.measure(records, constructs=[...])`.
- Predicción de respuestas individuales: `model.predict` genera la respuesta esperada de una persona descrita por observaciones a ítems de cuestionario con escala de respuesta fija.
- Evaluación multi-ítem en una sola completion: varias preguntas pueden compartir una misma escala de respuesta y devolverse numeradas como `Q1`, `Q2`, etc.
- Simulación de poblaciones: `model.simulate_population` genera `n_respondents` encuestados sintéticos con semilla configurable a partir de un contexto de participante, un escenario experimental y preguntas con opciones.
- Integración con vLLM: `Chiron.from_server("http://127.0.0.1:8000/v1")` conecta con un servicio vLLM desplegado aparte.
- Inferencia con Transformers/PyTorch: `Chiron.from_pretrained(".")` carga el adaptador y acepta los mismos argumentos de método.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación psicométrica automatizada: puntuar baterías de registros de texto libre sobre constructos como responsabilidad (`conscientiousness`) usando `measure`, lo que permite procesar grandes volúmenes de respuestas abiertas sin codificación manual.
- Predicción de ítems de personalidad: dado un conjunto de observaciones conductuales de una persona, estimar cómo respondería a ítems IPIP-FFM con escala Likert, útil para validar instrumentos o imputar respuestas faltantes en estudios.
- Simulación de experimentos de ciencias del comportamiento: `simulate_population` genera cientos de encuestados sintéticos (por ejemplo, 103 con semilla 20261154) ante un escenario experimental concreto, lo que permite preestimar tamaños de efecto o hacer análisis de potencia antes de reclutar participantes reales.
- Pilotaje de cuestionarios: evaluar si un ítem o una escala produce respuestas plausibles en una población simulada antes de lanzar el estudio, reduciendo costes de reclutamiento.
- Investigación sobre sesgos en medición: comparar las distribuciones de respuestas sintéticas con datos humanos reales para detectar ítems problemáticos o efectos de formato de respuesta.
- Réplica computacional de estudios publicados: reconstruir el escenario experimental de un paper (como el ejemplo OBHDP_10_1b sobre jerarquía organizativa) y contrastar las predicciones del modelo con los resultados originales.
- Generación de datos sintéticos para entrenamiento o aumento de datasets psicométricos, siempre dentro del marco de uso exclusivamente investigador que impone el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica que se requiere "suficiente memoria GPU para el modelo base de 35B". Como referencia orientativa, un modelo MoE de 35B parámetros totales en precisión de 16 bits exige del orden de 70 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño del modelo base, el despliegue realista apunta a A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el tamaño del modelo base hace improbable que quepa en una sola GPU de consumo sin cuantización, y no se documentan tipos de cuantización soportados.
- Opciones de despliegue: vLLM (soporte explícito mediante `from_server`) y Transformers/PyTorch (`from_pretrained`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12 sobre Linux, PyTorch 2.11.0 con CUDA 12.8.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Chiron es un adaptador LoRA especializado en psicometría sobre Qwen/Qwen3.6-35B-A3B, y no se han documentado en la información disponible alternativas equivalentes de medición psicológica o simulación de poblaciones con las que contrastarlo.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Chiron | 35B (3B activos, base MoE) + LoRA | 8.192 tokens | no disponible | Psicometría y simulación de poblaciones |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso restringido a investigación: el autor prohíbe explícitamente el uso para diagnóstico clínico o para cribar individuos.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Contexto limitado a 8.192 tokens por defecto, incluyendo las respuestas generadas, lo que acota el número de observaciones y preguntas que caben en una sola llamada.
- Las predicciones de la cabeza de medición están calibradas en −1 a 1 pero pueden salir de ese rango, por lo que requieren post-procesado o recorte antes de su uso analítico.
- Licencia no especificada en la información disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier explotación fuera de investigación.
- Riesgo de alucinación inherente al modelo base generativo, especialmente en `predict` y `simulate_population`, donde las respuestas son texto generado y no puntuaciones estructuradas garantizadas.
- Sesgos: no documentados en la información disponible; al ser un modelo entrenado sobre datos en inglés, es esperable un sesgo cultural y lingüístico que no se ha cuantificado.
- Advertencia de producción: el repositorio tiene 3 descargas y 1 like, con fecha de creación en noviembre de 2026; se trata de un artefacto de investigación reciente sin validación externa documentada.
- La reproducibilidad de `simulate_population` depende de la semilla; los resultados no deben interpretarse como predicciones de poblaciones reales sin validación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chiron-group/chiron
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentación de PEFT: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
