# SinhalaMMLU-SharedTask/team-cognilex

## Resumen

Team Cognilex es el sistema presentado por el equipo Congnilex a la tarea compartida Sinhala MMLU del ICTER 2026, organizada por la Universidad de Colombo (UCSC) y el Instituto de Tecnología de la Información (IIT) de Sri Lanka. No se trata de un modelo entrenado desde cero, sino de un ajuste fino en dos etapas sobre Qwen3.5-4B orientado a responder preguntas de opción múltiple (MCQ) en cingalés, el idioma mayoritario de Sri Lanka.

El sistema parte de Qwen3.5-4B, un transformer denso de aproximadamente 4.572 mil millones de parámetros, al que se le aplica primero un LoRA sobre pares pregunta-respuesta sintéticos generados a partir de libros de texto oficiales de los grados 6 a 11 (100.370 pares). Ese adaptador se fusiona con el modelo base y, sobre el resultado, se entrena un segundo LoRA con preguntas de exámenes reales (46.373 a 47.025 registros). La inferencia usa decodificación voraz para predecir directamente el número de la opción correcta.

Su relevancia es doble: por un lado, demuestra una receta reproducible de adaptación de un modelo multilingüe genérico a un dominio educativo y a un idioma de bajos recursos como el cingalés; por otro, es un artefacto de competición con licencia MIT, útil como referencia para quien quiera replicar el pipeline de generación de datos sintéticos y ajuste en dos fases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-4B con adaptadores LoRA fusionados) |
| Parametros totales | 4.571.730.432 (aproximadamente 4,572B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Cingales (si) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0,1 GB, compatible con adaptadores LoRA y pesos fusionados) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5 con 4.571.730.432 parámetros totales en inferencia. El entrenamiento se organiza en dos etapas secuenciales. En la primera, se ajusta Qwen3.5-4B con LoRA sobre 100.370 pares de pregunta-respuesta sintéticos generados a partir de libros de texto de los grados 6 a 11 publicados por el Educational Publications Department de Sri Lanka; los PDF se extrajeron con pypdf (con soporte Unicode para cingalés y tamil), se trocearon en fragmentos de 6.000 caracteres con 300 de solapamiento y se enviaron a deepseek-v4-flash (284B) vía la API de Embercloud con un máximo de 15.000 tokens de salida para generar los pares. El adaptador resultante se fusiona en el modelo base.

En la segunda etapa se entrena un nuevo adaptador LoRA sobre preguntas de opción múltiple extraídas de exámenes de Sri Lanka entre 1990 y 2026 (A/L, O/L, provinciales, escolares y de conocimiento general), recopiladas con un agente Codex integrado con Playwright MCP y procesadas con GPT-6.1-Sol, Claude Sonnet 5.5 y Gemini 3.8 Flash, con verificación manual por muestreo. Tras eliminar duplicados y coincidencias exactas con el conjunto oculto, el corpus quedó en 46.373 registros para las tres primeras épocas y se amplió a 47.025 para la cuarta, incorporando preguntas de dificultad fácil previamente infrarrepresentadas. La distribución temática es 38,8 % humanidades y 29,5 % STEM; por dificultad, 52,9 % media, 32,8 % difícil y 14,3 % fácil. No se documentan fases de RLHF ni DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple en cingalés sobre contenido curricular de grados 6 a 11 y temario de exámenes A/L y O/L.
- Predicción del número de opción correcta mediante decodificación voraz, formato de salida restringido a la respuesta numérica.
- Comprensión lectora de material educativo en cingalés (texto extraído de libros de texto oficiales).
- Conocimiento factual del currículo de Sri Lanka en humanidades, STEM y conocimiento general, derivado de los datos sintéticos y de los exámenes.
- Generación de texto en cingalés como capacidad heredada del modelo base, aunque no es el objetivo declarado del ajuste.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Evaluación comparativa en la tarea Sinhala MMLU: sirve como referencia pública de un sistema participante para reproducir la línea base y comparar con otras entregas del shared task.
- Generación automática de bancos de preguntas educativas: el pipeline de Q&A sintético sobre libros de texto puede reutilizarse para crear material de práctica en cingalés a partir de PDFs curriculares.
- Tutoría educativa acotada: responder preguntas de opción múltiple de asignaturas escolares con una salida de un solo dígito, integrable en una aplicación de autoevaluación para estudiantes de grados 6 a 11.
- Investigación en adaptación de modelos multilingües a idiomas de bajos recursos: el repositorio documenta la receta completa (extracción de PDF, chunking, generación sintética, filtrado y LoRA en dos etapas) y sirve como caso de estudio metodológico.
- Filtrado y clasificación de material de examen: el modelo ajustado puede usarse como clasificador de respuestas correctas en pipelines de curación de corpus MCQ, combinado con verificación humana.
- Prototipado de asistentes para preparación de exámenes A/L y O/L: con decodificación voraz y salida numérica, es adecuado para entornos de bajo coste donde solo se necesita seleccionar una opción.
- Reproducibilidad de experimentos: al publicarse tanto el modelo con el adaptador sintético fusionado como el adaptador MCQ por separado, permite aislar la contribución de cada etapa en estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 9,2 GB solo para pesos (4,572B parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB según longitud de secuencia.
- Cuantización a 8 bits: aproximadamente 4,6 GB de pesos; a 4 bits: aproximadamente 2,3 GB. Los formatos de cuantización concretos no están documentados en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en FP16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16 para secuencias moderadas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en FP16 con contexto corto, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la familia Qwen3.5; los adaptadores LoRA pueden servirse con vLLM (soporte de adaptadores) o fusionarse previamente. No se documenta una configuración de despliegue concreta para este repositorio.
- Latencia y throughput: no disponibles. Al usar decodificación voraz con salida de un solo token numérico, la latencia por consulta será baja en comparación con generación de texto libre, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team Cognilex (este) | 4,572B | no disponible | Ajuste en dos etapas (Q&A sintético + MCQ) sobre Qwen3.5-4B para cingalés | MIT | Hugging Face, pesos y adaptadores publicados |
| Qwen3.5-4B (base) | 4B (aproximado) | no disponible | Modelo multilingüe generalista sin ajuste específico para cingalés | no disponible en la informacion | Ampliamente disponible |
| Otros sistemas del Sinhala MMLU Shared Task 2026 | no disponible | no disponible | Ajustes específicos para MCQ en cingalés | no disponible | Repositorios del shared task en Hugging Face |

La comparación cuantitativa con alternativas no es posible porque no se han publicado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (selección de opción múltiple) y un único idioma (cingalés); su uso como generador de texto general no está validado y probablemente degrade la calidad respecto al Qwen3.5-4B original.
- Riesgo de alucinación en preguntas fuera de la distribución curricular de grados 6 a 11 o de los exámenes A/L y O/L; el ajuste no incluye mecanismos de abstención.
- La salida esperada es un número de opción; no se documenta formato de respuesta alternativo ni calibración de confianza.
- Sesgos potenciales derivados de los datos: el corpus MCQ está dominado por humanidades (38,8 %) y STEM (29,5 %), con preguntas de dificultad media (52,9 %); las preguntas fáciles están infrarrepresentadas incluso tras la ampliación.
- Los datos sintéticos se generaron con deepseek-v4-flash y los MCQ se extrajeron con modelos propietarios (GPT-6.1-Sol, Claude Sonnet 5.5, Gemini 3.8 Flash); pueden arrastrar errores de extracción o sesgos de esos modelos, aunque se realizó verificación manual por muestreo.
- Se eliminaron preguntas que coincidían exactamente con el conjunto oculto del shared task, lo que introduce una posible dependencia del particionado de la competición y limita la comparabilidad con evaluaciones externas.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene verificar antes de redistribuir pesos fusionados.
- El repositorio ocupa solo 0,1 GB, coherente con adaptadores LoRA; el modelo fusionado completo puede requerir descargar el base por separado.
- No hay información sobre longitud de contexto efectiva tras el ajuste, latencia, throughput ni resultados de benchmarks, lo que dificulta estimar su rendimiento en producción.

## Enlaces

- Repositorio principal: https://huggingface.co/SinhalaMMLU-SharedTask/team-cognilex
- Modelo con adaptador sintético fusionado: https://huggingface.co/SinhalaMMLU-SharedTask/team-cognilex-qwen35-4b-synthetic-qa-instruct
- Adaptador LoRA para MCQ: https://huggingface.co/SinhalaMMLU-SharedTask/team-cognilex-qwen35-4b-mcq-lora
- Educational Publications Department (libros de texto): http://www.edupub.gov.lk/
- Alapi Edu (exámenes): https://alapiedu.com/Category/paper_hub/PaperSubject?subject=&search=&paper_type=Past+Paper
- AlevelApi: https://www.alevelapi.com/
- Department of Examinations (informes de evaluación): https://www.doenets.lk/evaluationreports
- PaperBook: https://paperbook.lk/
- North Western Provincial Education: https://nwpedu.lk/pages/downloads.php
- e-Thaksalawa: https://e-thaksalawa.moe.gov.lk/lcms/
- Past Papers Wiki: https://pastpapers.wiki/
- GovDoc (modelos O/L): https://govdoc.lk/category/model-papers/gce-ordinary-level-exam
- e-Kalvi (exámenes O/L en cingalés): https://e-kalvi.com/category/sinhala-medium/o-l/
