# darkc0de/XORTRON-CriminalComputing-RICO-v4

## Resumen

XORTRON-CriminalComputing-RICO-v4 es un modelo de lenguaje multimodal (pipeline `image-text-to-text`) publicado por el usuario darkc0de en Hugging Face, con 27.781.427.952 parámetros (≈27,78 mil millones) almacenados en safetensors. No es un modelo entrenado desde cero: se trata de una fusión generada con mergekit a partir de dos modelos previos del mismo autor, darkc0de/RICO y darkc0de/XORTRON-RICO-v3, y la etiqueta `qwen3_5` apunta a una base de la familia Qwen3 como arquitectura subyacente. El repositorio ocupa 55,6 GB y declara compatibilidad con `transformers`, `text-generation-inference` y endpoints, además del ecosistema Unsloth.

El modelo forma parte del proyecto XORTRON Criminal Computing, definido por el autor como un experimento de investigación en seguridad y alineación de IA destinado a estudiar la capacidad de los sistemas avanzados para facilitar actividad delictiva, abuso y conductas de alto riesgo. Las etiquetas declaradas (`uncensored`, `abliterated`, `heretic`, `toxic`, `harmful`, `not-for-all-audiences`) indican que se ha eliminado o atenuado el comportamiento de rechazo, y que el modelo se distribuye bajo un acuerdo de acceso restringido que exige certificar una finalidad profesional, legal, académica, gubernamental o de seguridad defensiva antes de su descarga o despliegue.

Su relevancia actual es, por tanto, la de un artefacto de doble uso para investigación en seguridad: sirve para evaluar la eficacia de las salvaguardas tras una ablación de rechazo, para generar datos de evaluación de moderación y para modelado de amenazas. No dispone de licencia declarada, no publica idiomas soportados, longitud de contexto ni resultados de benchmarks, acumula 0 descargas y 2 likes en el momento de la consulta, y el propio autor lo marca como experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen (etiqueta `qwen3_5`); modelo resultante de una fusión con mergekit de `darkc0de/RICO` y `darkc0de/XORTRON-RICO-v3`. No se detallan número de capas, cabezas de atención ni configuración de RoPE |
| Parámetros totales | 27.781.427.952 (≈27,78 mil millones, dato de los safetensors) |
| Parámetros activos | No aplica / no disponible: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio publica safetensors; 55,6 GB para 27,78B parámetros es coherente con pesos en fp16/bf16. No se listan variantes GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la ficha no declara licencia SPDX; incluye un acuerdo de acceso restringido y uso autorizado redactado por el autor) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La información disponible describe un modelo de fusión, no un entrenamiento desde cero. La model card declara en el frontmatter `library_name: transformers` y las etiquetas `merge` y `mergekit`, con dos modelos base: `darkc0de/RICO` y `darkc0de/XORTRON-RICO-v3`. La etiqueta `qwen3_5` sugiere que la familia subyacente es Qwen3 (transformer denso con atención completa y decodificación autorregresiva), y el pipeline `image-text-to-text` implica que la torre de entrada acepta imágenes además de texto, presumiblemente heredada de la base multimodal. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Los indicios técnicos sobre el proceso de alineación son las etiquetas `abliterated` y `heretic`, que en la práctica habitual de la comunidad describen la ablación de direcciones de rechazo en el espacio de activaciones, y `uncensored`, que confirma la ausencia de comportamiento de rechazo. El dataset asociado es `darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT`, lo que apunta a un ajuste supervisado orientado a dominio restringido, aunque no se detalla su tamaño ni su contenido. La model card únicamente aporta parámetros de muestreo recomendados: para el modo Thinking, temperatura 1.0, top_p 0.95, top_k 20, min_p 0.0, presencia 0.0 y repetición 1.0; para el modo Instruct, temperatura 0.7, top_p 0.80, top_k 20, min_p 0.0, presencia 1.5 y repetición 1.0.

## Capacidades

- Generación de texto conversacional multi-turno, con separación explícita entre modo Thinking (razonamiento extendido) y modo Instruct, cada uno con parámetros de muestreo propios recomendados por el autor.
- Procesamiento de entrada imagen-texto (`image-text-to-text`): acepta imágenes junto a texto, lo que permite tareas de descripción, extracción o razonamiento sobre documentos visuales, siempre según lo que herede de la base multimodal.
- Comportamiento sin rechazo (`uncensored`, `abliterated`): responde a peticiones que los modelos alineados convencionales suelen declinar, lo que constituye su rasgo funcional principal y también su principal riesgo.
- Compatibilidad declarada con `transformers`, `text-generation-inference` y endpoints, además de integración con Unsloth para ajuste eficiente en memoria.
- Especialización temática en el dominio del proyecto: contenido relacionado con actividad delictiva, abuso y escenarios de alto riesgo, orientado a evaluación e investigación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Red teaming y evaluación de salvaguardas: el modelo se emplea como sujeto de prueba para medir qué solicitudes dañinas acepta un sistema tras la ablación de rechazo, generando un corpus comparativo frente a modelos alineados y permitiendo cuantificar la degradación de las defensas.
- Investigación en alineación y mecanística de la interpretabilidad: al ser una fusión con etiquetas `abliterated` y `heretic`, permite estudiar qué direcciones de activación se ven alteradas y correlacionarlas con cambios de comportamiento, comparando contra los modelos base `darkc0de/RICO` y `darkc0de/XORTRON-RICO-v3`.
- Modelado de amenazas y threat intelligence: un equipo defensivo puede usarlo para anticipar qué tipo de contenido operativo podría producir un modelo sin restricciones y traducir esos patrones en reglas de detección para sus propios sistemas.
- Desarrollo y validación de clasificadores de contenido: sirve como generador de datos adversarios etiquetados para entrenar y poner a prueba moderadores automáticos, con la ventaja de que las muestras tóxicas se producen de forma controlada en un entorno de laboratorio.
- Análisis forense y peritaje técnico: en un contexto legal, permite reproducir y documentar el comportamiento de modelos abliterados cuando se investiga la generación automatizada de contenido ilícito.
- Apoyo a análisis jurídico y de política regulatoria: asesores legislativos o reguladores pueden evaluar el estado real de la técnica para fundamentar requisitos de acceso restringido, trazabilidad y responsabilidad en el despliegue de modelos.
- Investigación académica sobre uso malicioso de IA: universidades y centros de política pública pueden ejecutar experimentos reproducibles sobre facilitación de conductas ilícitas, con las salvaguardas de un entorno aislado.
- Pruebas de pipelines multimodales: al aceptar entrada imagen-texto y ser compatible con text-generation-inference y endpoints, permite validar cadenas de despliegue multimodal (servido, cuantización, latencia) antes de llevar variantes similares a producción.
- Auditoría de proveedores de inferencia: verificar si una plataforma de serving aplica filtros de entrada o salida cuando se le sirve un modelo sin alineación, útil para equipos de trust and safety.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMLU-Pro, MATH, ni evaluaciones específicas de tasa de rechazo, toxicidad o jailbreak. Tampoco se aportan métricas de latencia o throughput. No se deben inferir valores a partir del tamaño del modelo o de sus modelos base.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (27,78B) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

- Pesos en fp16/bf16: aproximadamente 55,6 GB solo de pesos, coherente con el tamaño del repositorio. Requiere al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para inferencia con contexto corto, o varias GPU con paralelismo tensorial.
- Pesos en int8: aproximadamente 28 GB, más caché KV y activaciones. Cabe en una A100 40 GB con contexto reducido, o en 2× RTX 4090 de 24 GB.
- Pesos en 4 bits: aproximadamente 14-16 GB, más caché KV. Cabe en una única RTX 4090, RTX 3090, L40S o similar de 24 GB, con ventana de contexto limitada. La cuantización no está publicada por el autor, por lo que habría que generarla.
- Caché KV: no estimable con la información disponible, ya que no se publican número de capas, cabezas ni dimensión de cabeza.
- Opciones de despliegue declaradas: `transformers`, `text-generation-inference` (etiqueta `text-generation-inference`) y endpoints compatibles (`endpoints_compatible`). Unsloth figura como herramienta asociada. No se declara compatibilidad explícita con vLLM, llama.cpp, Ollama o MLX en la información proporcionada.
- Latencia y throughput: no disponibles.
- Aptitud para hardware de consumo: viable únicamente con cuantización de 4 bits en GPU de 24 GB; en bf16 queda fuera del alcance de cualquier GPU de consumo actual.

## Comparativa con modelos similares

La información proporcionada no incluye métricas ni fichas de modelos competidores. La tabla siguiente recoge únicamente datos de referencia de dominio público sobre modelos abiertos del mismo rango de tamaño, y se incluye con la advertencia de que no proceden de la búsqueda ni se han verificado contra las fichas oficiales; no deben usarse para afirmar superioridad o inferioridad sin una evaluación propia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XORTRON-CriminalComputing-RICO-v4 | 27,78B | No disponible | No disponible (acuerdo de acceso restringido del autor) | Hugging Face, repo de 55,6 GB, 0 descargas, 2 likes |
| Modelo de referencia de ~27-33B denso, familia Qwen3 | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |
| Modelo de referencia multimodal de ~27B, familia Gemma 3 | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

No se dispone de comparativas de rendimiento (benchmarks, tasa de rechazo, calidad multilingüe) entre este modelo y alternativas de su categoría.

## Limitaciones y advertencias

- Modelo explícitamente sin alineación de seguridad: las etiquetas `uncensored`, `abliterated`, `heretic`, `toxic` y `harmful` describen un sistema que no aplica rechazo ante peticiones dañinas. Bajo ninguna circunstancia debería exponerse a usuarios finales ni integrarse en productos de cara al público.
- Riesgo de uso ilícito: el propio autor declara que el modelo se desarrolla para estudiar la facilitación de actividad delictiva real. El acuerdo de acceso prohíbe emplearlo para cometer, facilitar, dirigir, asistir materialmente u ocultar conductas ilegales, así como proporcionar acceso a terceros con esa finalidad.
- Licencia no declarada: la ficha no incluye licencia SPDX. La ausencia de licencia genera incertidumbre jurídica sobre cualquier uso, incluido el comercial, y el acuerdo redactado por el autor no equivale necesariamente a una licencia válida en todas las jurisdicciones. Se requiere revisión legal antes de cualquier despliegue.
- Acceso restringido por certificación de elegibilidad: el autor exige acreditar la condición de profesional legal, investigador de seguridad o alineación, personal gubernamental, profesional de ciberseguridad o perfil equivalente. El incumplimiento de esas condiciones queda fuera de los términos declarados.
- Riesgo elevado de alucinación: la propia model card advierte de que el modelo puede generar información inexacta, incompleta, engañosa, ofensiva, peligrosa o legalmente incorrecta, y que sus salidas no constituyen asesoramiento profesional ni hallazgos fácticos.
- Sesgos: no se han publicado evaluaciones de sesgo. Al derivar de una fusión de modelos sin documentación de datos y con ajuste SFT sobre un dataset restringido no descrito, no es posible caracterizar sus sesgos.
- Ausencia total de benchmarks: no hay métricas que permitan estimar su calidad en razonamiento, código, matemáticas o multilingüismo. Cualquier decisión basada en su rendimiento requiere evaluación propia.
- Validación comunitaria mínima: 0 descargas y 2 likes en el momento de la consulta, sin issues ni discusiones documentadas que aporten evidencia independiente.
- Riesgo de artefactos de fusión: los modelos resultantes de mergekit pueden presentar degradación de coherencia, repeticiones o incoherencias no detectables sin evaluación sistemática. Los parámetros de muestreo recomendados difieren notablemente entre Thinking e Instruct, lo que sugiere sensibilidad a la configuración de decodificación.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva y el soporte real multilingüe, lo que impide planificar despliegues con requisitos concretos de longitud o idioma.
- Model card incompleta: el texto recuperado se corta en la sección de responsabilidad del usuario, por lo que los términos completos del acuerdo no están disponibles en la información consultada.
- Coordenadas temporales: la ficha registra creación y actualización el 25 de septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-RICO-v4
- Modelo base: https://huggingface.co/darkc0de/RICO
- Modelo base: https://huggingface.co/darkc0de/XORTRON-RICO-v3
- Dataset asociado: https://huggingface.co/datasets/darkc0de/XORTRON-RESTRICTED-RESEARCH-SFT
- Trend Micro Research, Malicious Uses and Abuses of Artificial Intelligence: https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, The Rise of AI-Enabled Crime: https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, AI-Enabled Crime: https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress, 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
