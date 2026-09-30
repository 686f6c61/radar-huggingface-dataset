# 123engineer/pi0.5-v26soupT3-owPypCo44VKT

## Resumen

El modelo identificado como `123engineer/pi0.5-v26soupT3-owPypCo44VKT` es un checkpoint de política robótica de tipo vision-language-action (VLA) derivado de π₀.₅, el modelo publicado por el equipo de Physical Intelligence dentro del ecosistema openpi. El autor del repositorio es el usuario `123engineer`, que lo distribuye como submission para OpenRoboto (Bittensor SN80), la subred de robótica de la red Bittensor. Se trata, por tanto, de un modelo de investigación aplicada orientado al control robótico de extremo a extremo y no de un modelo de lenguaje de propósito general.

La relevancia técnica del artefacto está en su linaje: π₀.₅ se apoya en π₀, un VLA basado en flow matching, y emplea co-entrenamiento sobre datos heterogéneos para mejorar la generalización en entornos abiertos (open-world). El modelo combinado con Gemma como componente de lenguaje apunta a la manipulación robótica guiada por instrucciones en lenguaje natural. El repositorio ocupa 12,4 GB y está etiquetado con los tags `robotics`, `vla`, `pi0.5` y `openroboto`.

Es un lanzamiento con nula tracción pública: cero descargas y cero "likes" en el momento de redactar esta ficha, sin idiomas declarados y con una licencia de tipo "other" asociada a los términos de Gemma. Por su naturaleza (submission de una competición de robótica), debe tratarse como material experimental más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π₀.₅ (openpi); π₀.₅ se construye sobre π₀, VLA basado en flow matching con backbone vision-language |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: gemma; enlace: https://ai.google.dev/gemma/terms). Incluye LICENSE_GEMMA.txt, LICENSE_OPENPI.txt y NOTICE |
| Formato de pesos | no disponible (checkpoint de openpi; repositorio de 12,4 GB, hermanos del mismo autor publicados en JAX) |

## Arquitectura y entrenamiento

π₀.₅ es, según la descripción del repositorio openpi, una versión mejorada de π₀ con mejor generalización en entornos abiertos. π₀ es un VLA basado en flow matching; openpi también distribuye π₀-FAST, una variante autorregresiva apoyada en el tokenizador de acciones FAST. El abstract del paper arXiv:2504.16054 indica que π₀.₅ se basa en π₀ y utiliza co-entrenamiento sobre datos heterogéneos para abordar la generalización fuera del laboratorio. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO.

En cuanto a este checkpoint concreto (`v26soupT3`), no hay información publicada sobre el procedimiento de ajuste. Los repositorios hermanos del mismo autor (por ejemplo `pi0.5-owPypCo44VKT`) se describen como políticas en espacio articular ("joint-space policy") con evaluación local en un simulador AXIS reconstruido, 20 ensayos por tarea, lo que sugiere que estos checkpoints proceden de experimentos de fine-tuning y evaluaciones internas más que de un pipeline de entrenamiento documentado públicamente. La mención "soup" en el nombre apunta a una posible combinación de pesos (model soup), pero esto no está confirmado en la información disponible.

## Capacidades

- Control robótico de extremo a extremo a partir de observaciones visuales e instrucciones (modelo vision-language-action).
- Interpretación de instrucciones en lenguaje natural para guiar la manipulación, dado el componente Gemma.
- Generación de acciones motoras mediante flow matching (herencia de π₀).
- Generalización en entornos abiertos, según la mejora declarada de π₀.₅ frente a π₀.
- Orientación a políticas en espacio articular (joint-space policies), según la descripción de los repositorios hermanos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): visión sí (es un VLA), pero sin detalles publicados.

## Casos de uso

- Investigación en manipulación robótica: usar el checkpoint como política base para experimentos de control de brazos robóticos en simuladores (se menciona un simulador AXIS en repositorios hermanos) antes de trasladar resultados a hardware real.
- Fine-tuning para tareas específicas: partir de este VLA y ajustarlo con datos propios de un robot concreto para una tarea de pick-and-place, aprovechando la herencia de π₀.₅ y openpi.
- Benchmarking interno de políticas VLA: emplearlo como referencia en comparaciones controladas contra π₀ o π₀-FAST replicando protocolos de evaluación tipo "20 ensayos por tarea".
- Participación en la subred OpenRoboto (Bittensor SN80): el modelo se distribuye explícitamente como submission, por lo que su caso de uso primario es competir y ser evaluado en esa subred.
- Estudio de generalización open-world: aprovechar el co-entrenamiento heterogéneo de π₀.₅ para investigar cuánto generaliza un VLA ante objetos y escenas no vistas en entrenamiento.
- Integración en pipelines de robótica de investigación con openpi: reutilizar las herramientas del repositorio openpi para cargar, evaluar y desplegar la política dentro de un stack de robótica existente.
- Docencia y reproducción académica: servir como material para reproducir resultados de VLA en cursos o laboratorios de robótica, dado que el linaje (π₀, π₀.₅) está documentado en paper y repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint concreto. Los repositorios hermanos del mismo autor mencionan evaluaciones locales ("rebuilt AXIS sim, 20 trials per task"), pero no se proporcionan puntuaciones numéricas ni comparativas en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, cifra que da una referencia del tamaño del checkpoint en disco, pero no de la VRAM necesaria para ejecutarlo (depende del formato y del framework).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmado. Dado el tamaño del repositorio (12,4 GB) y la naturaleza de openpi, es plausible que requiera GPUs de gama alta o de datacenter, pero no hay dato oficial.
- Opciones de despliegue: los repositorios hermanos se etiquetan como JAX y openpi es el framework asociado; no se confirman opciones tipo vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Origen | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5-v26soupT3-owPypCo44VKT (este) | VLA derivado de π₀.₅ | 123engineer (OpenRoboto SN80) | no disponible | other (gemma) | HuggingFace, 0 descargas |
| π₀.₅ (openpi) | VLA con co-entrenamiento heterogéneo, mejor generalización open-world | Physical Intelligence | no disponible | openpi (ver LICENSE_OPENPI) | open-source en openpi |
| π₀ (openpi) | VLA basado en flow matching | Physical Intelligence | no disponible | openpi | open-source en openpi |
| π₀-FAST (openpi) | VLA autorregresivo basado en tokenizador FAST | Physical Intelligence | no disponible | openpi | open-source en openpi |

No se dispone de cifras de parámetros, contexto ni rendimiento para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: es una submission para una subred de competición (Bittensor SN80), con 0 descargas y 0 "likes"; no hay evidencia pública de validación externa.
- Ausencia de benchmarks publicados: no se pueden verificar cifras de rendimiento ni comparaciones objetivas.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado; al ser un VLA, el riesgo relevante es de acciones incorrectas en el mundo físico, con impacto potencial en hardware y seguridad.
- Idiomas: no se declaran idiomas soportados; el componente Gemna podría aportar capacidades multilingües, pero no está confirmado para este checkpoint.
- Limitaciones de contexto: longitud de contexto no disponible.
- Restricción de licencia: la licencia es "other" con nombre "gemma", vinculada a los Gemma Terms of Use, que incluyen restricciones de uso en la Sección 3.2. Esto condiciona el uso comercial y requiere revisar LICENSE_GEMMA.txt antes de cualquier despliegue.
- Compatibilidad de formato: no se confirma el formato de pesos ni el soporte en frameworks convencionales de inferencia de LLM, dado que está pensado para robótica (openpi/JAX).
- Fecha de creación inusual (2026-09-30): conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/123engineer/pi0.5-v26soupT3-owPypCo44VKT
- Repositorio hermano citado en la búsqueda: https://huggingface.co/123engineer/pi0.5-owPypCo44VKT
- Repositorio hermano citado en la búsqueda: https://huggingface.co/123engineer/pi0.5-v6bs750-owPypCo44VKT
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Sitio de OpenPI: https://www.openpi.net/english.html
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
