# essay003/prmsu-essay-models

## Resumen

PRMSU Essay Grader - models es una colección de tres modelos de la familia DeBERTa publicados por el usuario essay003 como parte de un proyecto de tesis en la President Ramon Magsaysay State University (Filipinas). No se trata de un modelo generativo, sino de tres cabezas de clasificación/regresión construidas sobre `microsoft/deberta-v3-base` y `microsoft/mdeberta-v3-base`, orientadas a dos tareas concretas: la puntuación de redacciones en inglés según una rúbrica de seis rasgos y la detección de texto generado por IA en inglés y filipino.

El modelo de puntuación (`en-only`) se entrena sobre el corpus ELLIPSE y produce puntuaciones en una escala de 1 a 5 para cada rasgo. Los dos detectores (`detector-mitigated` y `detector-tl`) abordan la detección de texto sintético, el primero con una mitigación específica para escritores no nativos y el segundo en filipino, marcado explícitamente como experimental y no validado sobre redacciones de estudiantes.

Su relevancia es acotada y muy específica: se trata de artefactos de investigación académica, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con una licencia que restringe el uso comercial. Resultan útiles como referencia metodológica para quien investigue evaluación automática de redacciones o detección de texto IA en contextos educativos multilingües, no como componentes listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3 / mDeBERTa-v3) con cabezas de clasificación/regresión |
| Parametros totales | no disponible (los modelos base DeBERTa-v3-base y mDeBERTa-v3-base rondan los 86M y 278M respectivamente, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (inglés), tl (filipino) |
| Licencia | other / see-attribution; uso no comercial por herencia del corpus ELLIPSE (CC BY-NC-SA 4.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los tres artefactos parten de encoders DeBERTa-v3: `en-only` y `detector-mitigated` sobre `microsoft/deberta-v3-base`, y `detector-tl` sobre `microsoft/mdeberta-v3-base`, la variante multilingüe. DeBERTa-v3 introduce atención desacoplada y un mecanismo de embedding de posición relativa, además de sustituir el enmascaramiento MLM clásico por RTD (replaced token detection) en el preentrenamiento. Sobre esa base, el autor añade cabezas específicas: una de regresión multi-salida para los seis rasgos de puntuación y una de clasificación binaria para la detección de texto IA.

El modelo de puntuación se entrena sobre el corpus ELLIPSE, un conjunto de redacciones de estudiantes con anotaciones de calidad en escala 1-5 por rasgo. El detector en inglés incorpora una mitigación para escritores no nativos, presumiblemente para reducir el sesgo que hace que textos de aprendices de inglés se clasifiquen erróneamente como generados por IA. El detector en filipino se entrena sobre mDeBERTa-v3 y el autor lo marca como experimental, sin validación sobre redacciones reales de estudiantes. Cada carpeta incluye un `training_meta.json` con los detalles de entrenamiento, aunque su contenido no se ha proporcionado. No se dispone de información sobre número de tokens, composición exacta del dataset, uso de RLHF/DPO (poco probable en tareas de clasificación) ni innovaciones técnicas adicionales.

## Capacidades

- Puntuación automática de redacciones en inglés en seis rasgos, con salida en escala 1-5 (escala ELLIPSE).
- Detección de texto generado por IA en inglés, con mitigación orientada a escritores no nativos.
- Detección de texto generado por IA en filipino (experimental, sin validación sobre redacciones de estudiantes).
- Clasificación/regresión sobre texto de entrada; no genera texto.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a inglés y filipino.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación formativa en aulas de inglés: el modelo `en-only` puede puntuar borradores de estudiantes en los seis rasgos de la rúbrica ELLIPSE y ofrecer al docente una primera señal cuantitativa antes de la revisión manual.
- Investigación en evaluación automática de redacciones (AES): sirve como línea base reproducible sobre ELLIPSE para comparar arquitecturas encoder frente a enfoques generativos en tareas de scoring.
- Triaje de trabajos sospechosos de generación por IA: `detector-mitigated` puede marcar redacciones para revisión humana, siempre como señal y nunca como prueba, tal como advierte el autor.
- Estudio de sesgo contra escritores no nativos: la variante con mitigación permite analizar hasta qué punto los detectores de texto IA penalizan a aprendices de inglés.
- Detección de texto IA en filipino: `detector-tl` puede emplearse en experimentos exploratorios sobre contenido en tagalo/filipino, asumiendo su carácter no validado.
- Docencia y formación de profesorado: los tres modelos sirven para ilustrar en talleres las limitaciones y los riesgos éticos de la puntuación y detección automáticas en contextos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 2,6 GB en safetensors, lo que sugiere pesos en fp32 para los tres modelos. Cada encoder individual en fp16 ocuparía del orden de cientos de MB, pero el dato exacto no se ha proporcionado.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño de los encoders DeBERTa-v3, cualquier GPU con 4-8 GB de VRAM debería bastar para inferencia en fp16, aunque esto es una estimación y no un dato del autor.
- ¿Cabe en GPU de consumo? Muy probablemente sí en tarjetas como RTX 3060, 4060 o superiores, dado el tamaño de los encoders base, pero no confirmado.
- Opciones de despliegue: al ser modelos de clasificación en safetensors, son compatibles con Hugging Face Transformers y con `optimum`/ONNX Runtime; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PRMSU Essay Grader (este) | Encoder DeBERTa-v3 para scoring y detección IA | no disponible | no disponible | en, tl | see-attribution, no comercial | Hugging Face, 0 descargas |
| microsoft/deberta-v3-base | Encoder base preentrenado | ~86M (dato de referencia externo) | 512 tokens (referencia externa) | en | MIT | Ampliamente disponible |
| microsoft/mdeberta-v3-base | Encoder base multilingüe | ~278M (dato de referencia externo) | 512 tokens (referencia externa) | multilingüe | MIT | Ampliamente disponible |

No se dispone de información sobre benchmarks comparativos ni sobre otros sistemas de scoring o detección de texto IA con los que contrastar rendimiento.

## Limitaciones y advertencias

- Licencia no comercial: el modelo de puntuación deriva del corpus ELLIPSE (CC BY-NC-SA 4.0), por lo que no puede usarse con fines comerciales.
- El detector en filipino (`detector-tl`) es experimental y no ha sido validado sobre redacciones de estudiantes; sus salidas no deben tratarse como fiables.
- La salida de los detectores es una señal para que el docente revise, nunca una prueba de autoría; el propio autor lo advierte.
- Riesgo de sesgo contra escritores no nativos de inglés, parcialmente mitigado en `detector-mitigated` pero no eliminado.
- Riesgo de falsos positivos y falsos negativos inherente a la detección de texto IA, agravado por la evolución de los modelos generativos.
- Sin pipeline declarado en Hugging Face, lo que exige cargar manualmente cada subcarpeta y su cabeza correspondiente.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Proyecto de tesis con fecha de creación futura (2026-11-02), lo que sugiere metadatos inconsistentes o un repositorio en estado muy temprano.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/essay003/prmsu-essay-models
- Demo (Space): https://huggingface.co/spaces/essay003/prmsu-essay-grader
- Licencia y atribuciones: https://huggingface.co/essay003/prmsu-essay-models/blob/main/ATTRIBUTION.md
- Modelo base inglés: https://huggingface.co/microsoft/deberta-v3-base
- Modelo base multilingüe: https://huggingface.co/microsoft/mdeberta-v3-base
