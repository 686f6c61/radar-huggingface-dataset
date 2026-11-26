# mradermacher/FrogNano-4B-2609-heretic-i1-GGUF

## Resumen

FrogNano-4B-2609-heretic-i1-GGUF es una cuantizacion GGUF del modelo richardyoung/FrogNano-4B-2609-heretic, publicada por mradermacher. Se trata de un modelo de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) derivado de una variante "heretic" (abliterated/decensored) del modelo base FrogNano-4B-2609, es decir, con los mecanismos de rechazo (refusals) eliminados deliberadamente. El autor original lo libera con acceso restringido (gated) bajo el marco de investigacion en seguridad de IA.

La publicacion de mradermacher aporta el conjunto de cuantizaciones GGUF con tecnicas de imatrix, que permiten ejecutar el modelo en hardware de consumo con perdida de calidad controlada. El repositorio incluye un amplio abanico de variantes, desde IQ1_S (1,5 GB) hasta Q6_K, ademas de un fichero imatrix para generar cuantizaciones propias. La model card indica que se trata de un modelo de vision, con ficheros mmproj alojados en el repositorio estatico complementario.

El interes de esta ficha radica en que combina tres factores poco habituales: un modelo pequeno (4B) apto para hardware modesto, una orientacion explicita a investigacion de seguridad y red-teaming (al estar despojado de rechazos), y una licencia MIT que facilita su reutilizacion. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors via transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base richardyoung/FrogNano-4B-2609-heretic en la documentacion proporcionada. Por el nombre y el tamano (4,2B parametros) se trata de un transformer denso de aproximadamente 4 mil millones de parametros, pero no se confirman detalles como el numero de capas, dimensiones ocultas, tipo de atencion o vocabulario. La model card del cuantizador no incluye informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion empleadas (RLHF, DPO, etc.).

La innovacion tecnica destacable es el proceso de "abliteration" o eliminacion de rechazos que da lugar a la variante heretic: se trata de una modificacion de los pesos orientada a suprimir el comportamiento de negativa del modelo ante ciertas peticiones. El autor original declara que el modelo se libera exclusivamente para investigacion en seguridad de IA y evaluacion, con acceso controlado mediante formulario. Las cuantizaciones de mradermacher emplean ficheros imatrix para preservar mejor la calidad en los niveles de compresion mas agresivos.

## Capacidades

- Generacion de texto conversacional en ingles.
- Capacidades de vision: la model card del cuantizador indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico complementario.
- Comportamiento sin rechazos (uncensored/abliterated): responde a peticiones que un modelo alineado convencional rechazaria.
- Razonamiento y generacion de codigo: presumiblemente presentes por ser un modelo de proposito general, aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo permite estudiar como responde un sistema sin mecanismos de rechazo ante prompts adversarios, lo que resulta util para construir clasificadores de seguridad, evaluar filtros y documentar comportamientos de riesgo en entornos controlados.
- Evaluacion de robustez de filtros de contenido: al generar respuestas que un modelo alineado bloquearia, sirve como generador de casos limite para probar sistemas de moderacion y pipelines de guardrails.
- Ejecucion local en hardware de consumo: con cuantizaciones desde 1,5 GB (IQ1_S) hasta unos 2,7 GB (Q4_K_S), puede desplegarse en portatiles con GPU modesta o incluso en CPU mediante llama.cpp u Ollama, lo que facilita experimentacion sin infraestructura dedicada.
- Docencia y cursos sobre alineacion: permite ilustrar en clase la diferencia entre un modelo alineado y uno abliterated, comparando respuestas ante los mismos prompts en un entorno didactico.
- Prototipado rapido de asistentes conversacionales en ingles: su tamano reducido y su licencia MIT permiten integrarlo en demos y pruebas de concepto sin coste de licencia.
- Analisis de sesgos y contenido danino: util para estudiar que tipos de contenido genera un modelo sin rechazos y alimentar estudios academicos sobre seguridad de modelos pequenos.
- Experimentacion con cuantizacion: el fichero imatrix y el amplio rango de variantes permiten investigar el impacto de la compresion en la calidad de un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 1,5-2,0 GB en IQ1/IQ2, 2,2-2,5 GB en IQ3/Q3, 2,6-2,7 GB en IQ4/Q4, y en torno a 3,5-4 GB en Q5/Q6 (estimacion a partir de los tamanos de fichero publicados).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090) puede ejecutar comodamente las cuantizaciones de 4 bits; las de 1-2 bits caben en GPUs de 4 GB o en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas, e incluso en iGPU y CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede usarse con transformers. Para vision seria necesario el runtime con soporte mmproj (llama.cpp con proyeccion multimodal).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| FrogNano-4B-2609-heretic (este) | ~4,2B | no disponible | MIT | Variante sin rechazos, acceso gated en el original |
| Modelos densos de ~4B alineados (p. ej. familia Llama 3.2 3B, Qwen2.5 3B) | ~3-4B | 8K-128K segun modelo | licencias variables | Alineados con rechazos; benchmarks publicos disponibles |
| Modelos abliterated de ~4B | ~4B | variable | variable | Misma categoria de uso (red-teaming), sin benchmarks comparables publicados |

No se dispone de datos de rendimiento comparativo publicados para este modelo concreto en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo sin rechazos (abliterated/uncensored): puede generar contenido danino, ilegal o inseguro; su uso esta pensado para investigacion y debe acompanarse de filtros y supervision en cualquier despliegue.
- Acceso restringido en el modelo original: el autor exige formulario de acceso y declara uso previsto exclusivamente para investigacion en seguridad; conviene respetar esas condiciones aunque la cuantizacion se distribuya bajo MIT.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente en datos web en ingles, es probable que herede sesgos de ese corpus.
- Riesgo de alucinacion: no cuantificado; los modelos de 4B suelen alucinar mas que modelos mayores, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar usos con ventanas largas.
- Cuantizaciones muy agresivas (IQ1, IQ2, Q2_K): la propia model card advierte de calidad baja o "desesperada"; para produccion conviene Q4_K_S o superior.
- Caveat para produccion: la falta de benchmarks y de documentacion de arquitectura hace arriesgado desplegarlo en entornos productivos sin evaluacion propia.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/FrogNano-4B-2609-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/FrogNano-4B-2609-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/FrogNano-4B-2609-heretic
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#FrogNano-4B-2609-heretic-i1-GGUF
- Perfil del autor original: https://huggingface.co/richardyoung
- CV del autor original (referencias de papers): https://cv.deepneuro.ai
