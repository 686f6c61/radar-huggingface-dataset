# mradermacher/LFM2.5-2.6B-Pashto-Zi-b1-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo nassimjp/LFM2.5-2.6B-Pashto-Zi-b1, un ajuste fino derivado de LFM2.5-2.6B de Liquid AI. La cuantización la ha realizado mradermacher, un autor conocido por publicar conversiones GGUF de terceros para su uso con llama.cpp y otros motores compatibles. El modelo resultante mantiene los 2.691.204.096 parámetros del original y se distribuye en doce niveles de cuantización que van desde 1,2 GB (Q2_K) hasta 5,5 GB (f16).

El modelo base pertenece a la familia LFM2.5 de Liquid AI, descrita por su fabricante como un modelo denso de 2,6 mil millones de parámetros orientado a cargas de trabajo agénticas, con ventana de contexto de 128K tokens y soporte nativo de tool calling. Su propuesta de valor es ejecutar agentes en dispositivos locales con un consumo de memoria inferior a 2,5 GB. El ajuste fino concreto publicado por nassimjp incorpora en su nombre la referencia a pastún (Pashto) y a un identificador "Zi-b1", aunque la ficha del repositorio declara únicamente el idioma inglés.

La relevancia de esta ficha es doble: por un lado, permite desplegar un modelo agéntico de tamaño reducido en hardware de consumo; por otro, ilustra un caso habitual en el ecosistema abierto, en el que un ajuste fino de procedencia y evaluación poco documentadas se redistribuye en GGUF. La licencia no está declarada en la información disponible, lo que condiciona cualquier uso comercial hasta que se verifique en el repositorio del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha del repositorio. La documentación de Liquid AI describe el modelo base LFM2.5-2.6B como un modelo denso (no MoE) |
| Parametros totales | 2.691.204.096 (aproximadamente 2,6 mil millones) |
| Parametros activos | No aplica, el modelo base es denso |
| Longitud de contexto | No disponible para este ajuste fino. El modelo base LFM2.5-2.6B declara 128K tokens según Liquid AI |
| Tipos de cuantizacion | Q2_K (1,2 GB), Q3_K_S (1,4 GB), Q3_K_M (1,5 GB), Q3_K_L (1,5 GB), IQ4_XS (1,6 GB), Q4_K_S (1,7 GB), Q4_K_M (1,8 GB), Q5_K_S (2,0 GB), Q5_K_M (2,0 GB), Q6_K (2,3 GB), Q8_0 (3,0 GB), f16 (5,5 GB) |
| Idiomas soportados | en (inglés) según la etiqueta de la ficha. El nombre del ajuste fino menciona pastún, pero no hay confirmación documental en la información disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas). El modelo base se publica en formato Hugging Face/transformers |
| Modelo base | nassimjp/LFM2.5-2.6B-Pashto-Zi-b1 |
| Repositorio de origen | Liquid AI LFM2.5-2.6B |
| Tipo de cuantizacion | Estática, sin imatrix ni quants ponderados (según la propia model card) |
| Descargas | 261 |
| Tamano del repositorio | 24,3 GB (todos los ficheros de cuantización juntos) |

## Arquitectura y entrenamiento

El repositorio no publica información sobre la arquitectura interna ni sobre el proceso de entrenamiento del ajuste fino. Los únicos datos técnicos verificables son los que acompañan a la conversión: se trata de cuantizaciones estáticas de tipo "convert_type: hf" con versión de cuantización 2, generadas a partir del modelo nassimjp/LFM2.5-2.6B-Pashto-Zi-b1. La model card indica explícitamente que no hay cuantizaciones ponderadas ni basadas en imatrix disponibles, y que se pueden solicitar mediante una discusión en la comunidad.

Del modelo base, la documentación de Liquid AI sí aporta detalles: LFM2.5-2.6B es un modelo denso de 2,6 mil millones de parámetros, diseñado específicamente para cargas agénticas, con 128K tokens de contexto y tool calling nativo. El fabricante declara una velocidad de 220 tokens por segundo con menos de 2,5 GB de memoria en su configuración de despliegue recomendada. No se han facilitado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, ni en el modelo base ni en el ajuste fino.

Sobre la innovación técnica, lo único destacable es el propio formato de distribución: la conversión a GGUF permite ejecutar el modelo con llama.cpp y Ollama en CPU y GPU de gama baja, algo coherente con el enfoque "on-device" del modelo original. El ajuste fino de nassimjp no documenta ninguna modificación arquitectónica.

## Capacidades

- Generación de texto conversacional: el pipeline declarado en las etiquetas es "conversational", con compatibilidad con endpoints de inferencia.
- Tool calling nativo: heredado del modelo base LFM2.5-2.6B, que declara soporte nativo de llamada a herramientas.
- Cargas agénticas y razonamiento multi-paso: el modelo base está diseñado para planificar, invocar herramientas y ejecutar tareas de varios pasos.
- Ejecución en dispositivo: el diseño del modelo base apunta a despliegue local con menos de 2,5 GB de memoria.
- Idiomas: la ficha declara únicamente inglés. El nombre del ajuste fino sugiere adaptación al pastún, pero no hay evidencia documental de ello en la información disponible.
- Capacidades multimodales: no disponibles. No hay indicios de soporte de visión o audio.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.
- Codigo y matematicas: no se documentan evaluaciones específicas para estas capacidades.

## Casos de uso

- Agentes locales en dispositivos de gama baja: con la cuantización Q4_K_M (1,8 GB) el modelo cabe en equipos con 4 GB de memoria libre, lo que permite ejecutar bucles de agente con tool calling sin conexión a servicios en la nube.
- Asistentes de escritorio integrados: al ocupar menos de 2 GB en disco en formato Q4, se puede empaquetar dentro de una aplicación de escritorio y ejecutarse en la CPU del usuario, eliminando costes de API y problemas de privacidad.
- Automatización de tareas multi-paso: el modelo base está entrenado para planificar y encadenar llamadas a herramientas, lo que encaja en flujos de automatización con APIs REST o scripts internos.
- Procesamiento de documentos con contexto largo: si el ajuste conserva la ventana de 128K tokens del modelo base, permite resumir y extraer información de documentos extensos en una sola pasada; conviene verificar esta cifra antes de diseñar el pipeline.
- Prototipado rápido de aplicaciones conversacionales: la disponibilidad de doce niveles de cuantización facilita ajustar la relación entre calidad y consumo de memoria durante las fases de prueba, desde Q2_K en entornos muy limitados hasta Q8_0 para evaluación de calidad.
- Despliegue en hardware embebido o SBC: la cuantización Q2_K (1,2 GB) abre la puerta a placas tipo Raspberry Pi con 4 u 8 GB de RAM, útil para demos y pruebas de concepto de asistentes de voz o texto.
- Adaptación lingüística al pastún: si se confirma que el ajuste fino está orientado a este idioma, podría emplearse en tareas de traducción, atención al usuario o generación de contenido en pastún; esta capacidad no está documentada en la información disponible y requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la ficha del repositorio GGUF ni la información del modelo base incluyen puntuaciones de MMLU, HumanEval, GSM8K u otras evaluaciones para este ajuste fino concreto.

El único dato de rendimiento disponible corresponde al modelo base LFM2.5-2.6B, según el blog de Liquid AI: 220 tokens por segundo con menos de 2,5 GB de memoria. Esta cifra corresponde al modelo original, no a las cuantizaciones GGUF publicadas aquí, y no especifica el hardware utilizado.

Existe un informe externo de cuantización (repositorio pixi-llm-recipes, ruta perplexity/LFM2.5-2.6B) que analiza la perplejidad de distintos quants GGUF del modelo base cruzados con cuantizaciones de caché KV, pero no se han extraído cifras concretas de él en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,2 GB con Q2_K, 1,8 GB con Q4_K_M, 3,0 GB con Q8_0 y 5,5 GB con f16. Hay que sumar la caché KV, que crece con la longitud de contexto y puede ser significativa si se usa la ventana completa de 128K tokens.
- Presupuesto realista en Q4_K_M: en torno a 2,5 a 3,5 GB de memoria total, en línea con la cifra de "menos de 2,5 GB" que declara Liquid AI para el modelo base.
- GPU de consumo compatibles: cualquier GPU con 4 GB o más de VRAM, como RTX 3050, RTX 4060, RTX 3060 o superiores. En Q4_K_M o Q5_K_M cabe holgadamente en 8 GB. Las cuantizaciones Q2_K y Q3_K permiten su ejecución en GPUs de 4 GB.
- GPU profesionales: A100, H100 y L40S pueden servir el modelo con lotes grandes, aunque están sobredimensionadas para un modelo de este tamaño.
- Ejecución en CPU: viable con llama.cpp u Ollama. Con 8 GB de RAM se pueden usar las cuantizaciones hasta Q5_K_M; con 16 GB, cualquier nivel incluyendo f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF. La etiqueta "endpoints_compatible" del repositorio sugiere compatibilidad con proveedores de inferencia que aceptan artefactos GGUF.
- Latencia y throughput: el fabricante del modelo base declara 220 tokens por segundo en su configuración recomendada, pero no se han publicado cifras para estas cuantizaciones concretas ni por tipo de GPU.
- Almacenamiento: prever entre 1,2 y 5,5 GB según el quant elegido; el repositorio completo ocupa 24,3 GB si se descargan todos los ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LFM2.5-2.6B-Pashto-Zi-b1-GGUF (este repositorio) | 2,69 mil millones | No disponible (el base declara 128K) | No disponible | GGUF |
| Liquid AI LFM2.5-2.6B (modelo base original) | 2,6 mil millones | 128K tokens | Pesos abiertos, términos concretos no disponibles en la información | Hugging Face / transformers |
| Ajustes finos comparables de la misma franja (3B-4B) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para establecer comparaciones cuantitativas con alternativas de la misma categoría, como Qwen3-4B, Llama 3.2 3B o Gemma 3 4B. Cualquier comparación de rendimiento con estos modelos requeriría ejecutar evaluaciones propias sobre las cuantizaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base nassimjp/LFM2.5-2.6B-Pashto-Zi-b1 y la de Liquid AI antes de cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay evaluaciones publicadas para este ajuste fino, por lo que se desconoce su degradación respecto al modelo original y su calidad real en tareas concretas.
- Procedencia del ajuste fino no documentada: no se detalla el dataset de entrenamiento, el número de tokens ni el método de alineación, lo que dificulta evaluar sesgos y comportamiento fuera de dominio.
- Discrepancia en el idioma declarado: la ficha indica únicamente inglés, mientras que el nombre del modelo hace referencia al pastún. Esta ambigüedad debe resolverse con pruebas antes de asignarle tareas multilingües.
- Degradación por cuantización: las cuantizaciones Q2_K y Q3_K reducen notablemente la calidad. Para uso en producción se recomienda Q4_K_M o superior; la propia model card califica Q4_K_S y Q4_K_M como "rápidos y recomendados" y Q6_K como "muy buena calidad".
- Ausencia de cuantizaciones ponderadas: no hay versiones con imatrix, que suelen ofrecer mejor relación calidad-tamaño que las estáticas equivalentes.
- Riesgo de alucinación: inherente a los modelos de 2,6 mil millones de parámetros, especialmente en tareas de razonamiento complejo, matemáticas o conocimiento factual extenso. No debe usarse como fuente de verdad sin verificación.
- Limitaciones de contexto: aunque el modelo base declara 128K tokens, la caché KV a esa longitud puede consumir más memoria que los propios pesos en configuraciones de baja VRAM, lo que obliga a usar cuantización de caché.
- Modelo pequeño para agentes complejos: aunque está orientado a tool calling, un modelo de 2,6B puede fallar en cadenas de razonamiento largas o en la selección correcta de herramientas con esquemas de API complejos.
- Mantenimiento incierto: al ser una conversión de terceros, no hay garantía de actualizaciones, correcciones o soporte por parte del autor original del ajuste fino.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-Pashto-Zi-b1-GGUF
- Modelo base del ajuste fino: https://huggingface.co/nassimjp/LFM2.5-2.6B-Pashto-Zi-b1
- Variante con nombre similar: https://huggingface.co/mradermacher/LFM2.5-2.6B-Pashto-Zi-b-GGUF
- Página resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#LFM2.5-2.6B-Pashto-Zi-b1-GGUF
- Documentación de Liquid AI sobre LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Informe de cuantización (perplejidad) sobre LFM2.5-2.6B: https://github.com/crusaderky/pixi-llm-recipes/blob/main/perplexity/LFM2.5-2.6B/README.md
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
