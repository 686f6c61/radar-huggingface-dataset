# NeoSapian/Rodinia

## Resumen

Rodinia es un modelo de clasificación especializado en inteligencia de decisión financiera desarrollado por Sociodynamics AI. Se trata de un fine-tune completo del modelo base Qwen/Qwen3.5-0.8B-Base, con aproximadamente 1.006 millones de parámetros, diseñado no para generar texto libre sino para interpretar estados financieros y producir decisiones estructuradas y tipadas junto con distribuciones de probabilidad calibradas.

La propuesta diferencial de Rodinia es su interfaz de decisión tipada, construida en torno a tres tipos: Choice (selección entre opciones predefinidas), Score (evaluación contra niveles ordinales) y Noul (decisión binaria sí/no). En lugar de generar lenguaje natural, el modelo explota los logits del siguiente token sobre tokens de opción predefinidos para calcular probabilidades de decisión, aplicando después un escalado de temperatura calibrado sobre un split de validación.

Es relevante porque encaja en pipelines financieros donde se necesita salida estructurada y probabilidades calibradas para sistemas de decisión posteriores (enrutamiento, risk scoring, clasificación de eventos), en lugar de texto generativo difícil de parsear. Su tamaño compacto de 0.8B facilita el despliegue en infraestructura modesta con una sola pasada forward por estado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B-Base) |
| Parámetros totales | 1.006.672.704 (~1.0B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rodinia es un fine-tune completo (full fine-tuning) del modelo base Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. El modelo reutiliza las representaciones lingüísticas aprendidas del base para interpretar texto financiero y descripciones de estado estructuradas, pero su interfaz de salida no se apoya en generación libre de texto: opera extrayendo los logits correspondientes a un conjunto predefinido de tokens de respuesta y calculando una softmax sobre ellos.

El mecanismo de decisión aplica un escalado de temperatura (temperature scaling) ajustado sobre un split de validación retenido, de modo que la distribución de probabilidad resultante esté calibrada. Para una tarea de elección con opciones candidatas, la probabilidad se calcula como softmax de los logits divididos por la temperatura T; la decisión final es el argmax. El autor no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que la calibración se ajustó sobre un split de validación. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación financiera tipada mediante tres interfaces: Choice (selección entre opciones predefinidas), Score (clasificación en niveles ordinales) y Noul (decisión binaria sí/no).
- Producción de distribuciones de probabilidad calibradas por temperatura sobre las opciones de decisión.
- Interpretación de estados financieros y texto financiero (titulares, eventos de mercado, resultados, cambios de personal, fusiones y adquisiciones).
- Categorización de noticias financieras y clasificación de eventos económicos.
- Análisis de sentimiento financiero y evaluación de riesgo mediante niveles ordinales.
- Análisis de cartera y clasificación de estados asociados.
- Inferencia en una única pasada forward por estado, sin generación autoregresiva de texto libre.
- Capacidades multilingües: únicamente inglés declarado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de titulares financieros: el modelo recibe un titular y una pregunta de tipo Choice con criterios como earnings, personnel o m&a, y devuelve la categoría más probable con su distribución de probabilidad, útil para enrutar noticias a analistas o sistemas de alerta.
- Scoring de riesgo crediticio o de cartera: mediante la interfaz Score, se evalúa un estado financiero contra niveles ordinales predefinidos, obteniendo una probabilidad calibrada por nivel que puede alimentar un motor de decisión downstream.
- Detección de eventos binarios: con la interfaz Noul, el modelo responde preguntas sí/no (por ejemplo, si un comunicado implica una revisión de guidance), lo que permite construir filtros automáticos de alto volumen con salida estructurada.
- Análisis de sentimiento financiero en pipelines de monitorización: al devolver una distribución calibrada en lugar de texto, se integra directamente en sistemas de scoring agregado sin necesidad de parsear lenguaje natural.
- Enrutamiento de documentos en back-office financiero: clasificación de comunicados, informes y notas en categorías predefinidas para su distribución automática a los equipos correspondientes.
- Señalización para sistemas de trading o gestión de riesgo: las probabilidades calibradas y el argmax pueden consumirse como features numéricas en modelos de decisión o reglas de negocio, aprovechando la inferencia en una sola pasada y el tamaño compacto del modelo.
- Extracción de decisiones estructuradas en informes de resultados: evaluación de estados descritos en texto contra criterios ordinales de desempeño para generar etiquetas consistentes a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no publicada por el autor), un modelo de ~1.0B parámetros en fp16 requeriría del orden de 2 GB solo para pesos, más memoria para activaciones y contexto; en cuantizaciones de 8 y 4 bits el requisito de pesos bajaría aproximadamente a 1 GB y 0.5 GB respectivamente, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es susceptible de ejecutarse en GPUs consumer, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer?: previsiblemente sí por tamaño, aunque no está confirmado ni documentado.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rodinia (NeoSapian) | ~1.0B | no disponible | Clasificación financiera tipada | other | Hugging Face |
| Qwen3.5-0.8B-Base (modelo base) | ~0.8B | no disponible | Generación de texto | no disponible | Hugging Face |
| Alternativas de clasificación financiera de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos directamente equivalentes en la información proporcionada; la comparación se limita al modelo base del que deriva Rodinia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base entrenado con datos web, puede heredar sesgos presentes en dichos datos.
- Riesgo de alucinación: reducido en la interfaz de decisión, ya que la salida se restringe a tokens de opción predefinidos; sin embargo, la calibración de probabilidades no garantiza corrección semántica de la decisión.
- Limitaciones de idioma: el modelo solo declara soporte de inglés; el uso en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, lo que impide planificar entradas largas con seguridad.
- Restricciones de licencia: la licencia es "other" (personalizada); es imprescindible revisar los términos del repositorio antes de cualquier uso comercial.
- Caveat para producción: el modelo es un fine-tune especializado de 0.8B con muy pocas descargas y sin benchmarks publicados; su robustez y calibración en dominios distintos al de entrenamiento no están validadas de forma independiente.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que puede limitar el despliegue en entornos de bajos recursos sin conversión manual.
- La fecha de creación del repositorio (2026) y el reducido número de descargas sugieren un modelo muy reciente y poco contrastado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeoSapian/Rodinia
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Desarrollador (Sociodynamics AI): no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
