# Aayushbhandari12/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino de la familia Qwen 3.8 sobre la base Qwen/Qwen3.8-27B, con 27.781.427.952 parámetros (~27,8 B) y publicado bajo licencia Apache 2.0. El modelo lo desarrolla DavidAU (con la colaboración de Nightmedia en las tres primeras etapas), aunque el repositorio de HuggingFace que se analiza aquí lo republica el usuario Aayushbhandari12 en formato transformers/safetensors. Se trata de un modelo multimodal del tipo image-text-to-text, etiquetado como "heretic" y "uncensored", es decir, con las capas de rechazo atenuadas o eliminadas deliberadamente mediante técnicas de abliteration y ajuste en varias etapas ("Cold Fusion", "GAIN Training", "Multi-stage tuning").

El problema que aborda es el de disponer de un modelo de ~27 B con contexto largo (hasta 262.144 tokens según fuentes secundarias), capaz de ejecutarse en hardware de consumo mediante cuantización y sin las restricciones de seguridad de los modelos alineados comercialmente. Según la documentación del autor, el objetivo es conservar la inteligencia bruta del Qwen 3.8 base reduciendo además el número de tokens de razonamiento empleados, con modos de razonamiento e instructivo conmutables en versiones posteriores del proyecto.

Su relevancia actual es doble: por un lado, como pieza de investigación sobre robustez y alineación (permite estudiar qué produce un modelo de esta clase sin capas de rechazo); por otro, como opción práctica para despliegue local en tareas creativas o de análisis donde el contexto largo y la ausencia de filtros son requisitos. Conviene tener presente que este repositorio concreto no incluye resultados de evaluación propios ni notas técnicas originales: reproduce la model card del autor y no aporta artefactos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.8 (detalle de capas y atencion no disponible en la informacion proporcionada); etiquetado multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (~27,8 B), dato real de los safetensors |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 262.144 tokens segun fuentes secundarias (llmrun.dev); no verificado en la model card del repositorio |
| Tipos de cuantizacion | Safetensors en precision completa/BF16 en este repo; GGUF en 8 bits y 4 bits en el repositorio hermano del autor (Q8, Q4, variantes "oQ8e-1M"); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) declarado en la model card; capacidades multilingues no declaradas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del Qwen 3.8 base: no se especifican numero de capas, dimension oculta, tipo de atencion (completa, lineal o hibrida), ni si emplea mezcla de expertos. Lo que si documenta el autor es el proceso de ajuste: un pipeline de multiples etapas ("Multi-stage tuning") en el que las tres primeras fases fueron realizadas por Nightmedia, seguidas de una fase de abliteration/heretic y de post-entrenamiento y evaluacion. El autor menciona tecnicas propias bautizadas como "Cold Fusion" y "GAIN Training", y el entrenamiento se ejecuto con Unsloth sobre hardware de consumo, segun la documentacion del repositorio GGUF asociado.

No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la mezcla exacta de ajustes finos previos (propios y de terceros) que el autor indica haber utilizado como punto de partida, y que aplaza a la publicacion final del proyecto. La innovacion declarada por el autor es la reduccion del numero de tokens de razonamiento (del orden de la mitad a un decimo en la release #1, y de la mitad a un veinteavo en la release #2) manteniendo el rendimiento del modelo base, ademas de la mencion a decodificacion multi-token (sufijo "MTP") en la nomenclatura de los GGUF, cuyo funcionamiento no se detalla.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas largas y detalladas.
- Entrada multimodal de imagen y texto (pipeline_tag image-text-to-text), aunque la model card no documenta tareas de vision especificas, resoluciones ni evaluaciones al respecto.
- Razonamiento explicito con modos conmutables segun el autor (la release #1 hereda los modos de razonamiento de Qwen 3.8; la release #2 anade cinco modos de razonamiento y cinco instructivos conmutables en caliente).
- Reduccion de tokens de razonamiento respecto al modelo base, orientada a bajar coste y latencia en inferencia.
- Escritura creativa y generacion de ficcion sin filtros de contenido.
- Analisis y propuestas de multiples etapas: el autor cita como caso destacado una propuesta detallada de "salvar el planeta" generada en cuantizacion de 4 bits.
- Generacion de corpus de red-team y de datos sinteticos sobre temas que los modelos alineados rechazan.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas formalmente; la longitud de contexto permitiria conversaciones multi-turno largas.
- Capacidades de audio: no disponibles.
- Idiomas: ingles unicamente declarado.

## Casos de uso

- Red-team y evaluacion de seguridad: el modelo sirve para generar corpus de prompts ofensivos y medir que produce un modelo de 27 B sin capas de rechazo, comparando despues con las salidas de modelos alineados. Es el uso que le atribuyen las fuentes secundarias especializadas en modelos abliterated.
- Generacion de datos sinteticos para ajuste: al no rechazar dominios sensibles, puede producir grandes volumenes de texto de entrenamiento en temas (ficcion adulta, violencia narrativa, seguridad ofensiva) donde un modelo alineado se niega, siempre que el uso final cumpla la legalidad aplicable.
- Escritura creativa de largo aliento: con una ventana de hasta 262.144 tokens segun fuentes secundarias, permite mantener coherencia en novelas, guiones o worldbuilding con decenas de miles de tokens de material previo en el contexto.
- Analisis de documentos extensos en local: informes tecnicos, expedientes o transcripciones que se cargan completos en el contexto y se procesan en una maquina propia, sin enviar datos a un proveedor externo.
- Asistente personal offline en hardware de consumo: una cuantizacion de 4 bits cabe en una GPU de 24 GB, lo que permite ejecutarlo con llama.cpp sobre una RTX 4090 o un portatil con GPU de gama alta, sin dependencia de API.
- Prototipado de agentes con contexto largo: la ventana extendida y la reduccion de tokens de razonamiento declarada por el autor lo hacen adecuado para bucles de planificacion donde el coste por paso importa, aunque el soporte de tool calling no este documentado.
- Investigacion sobre abliteration: sirve como sujeto de estudio para medir cuanto rendimiento (ARC-C, ARC-E) se conserva tras eliminar la direccion de rechazo, comparandolo con el Qwen 3.8-27B original.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles provienen de la documentacion del autor en el repositorio GGUF asociado, no de este repositorio, y no incluyen metodologia ni scripts de evaluacion reproducibles.

| Benchmark | Resultado declarado | Contexto |
|---|---|---|
| ARC-C | 735 | En cuantizacion de 8 bits; el autor lo presenta como 144 puntos por encima de Qwen 3.8 27B (lo que implicaria ~591 para el base) |
| ARC-E | 882 | En cuantizacion de 8 bits |
| ARC-C | >718 | En cuantizacion de 4 bits |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la informacion disponible. Las cifras anteriores son afirmaciones del autor no verificadas de forma independiente; conviene tratarlas como indicativas y no como mediciones auditadas.

## Requisitos de hardware

- Pesos en BF16/safetensors: ~55,6 GB solo de pesos (tamano del repo), mas cache KV. Requiere como minimo una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPUs.
- Cuantizacion de 8 bits: ~28-30 GB estimados de pesos. Cabe en A100 40GB, L40S 48GB o dos RTX 4090/3090 de 24 GB.
- Cuantizacion de 4 bits: ~16-17 GB estimados de pesos, lo que permite ejecucion en una unica RTX 4090, RTX 3090, RTX 4080 Super de 16 GB con margen ajustado, o GPUs de 24 GB con comodidad. El autor presenta el modelo como ejecutable en hardware de consumo.
- Contexto largo: la cache KV a 262.144 tokens es el factor limitante real. Con ventanas de mas de 32k tokens hay que presupuestar decenas de GB adicionales o recurrir a cuantizacion de la cache; no se dispone de cifras medidas.
- Opciones de despliegue: transformers (formato nativo de este repo), llama.cpp y derivados (Ollama, LM Studio) mediante los GGUF del repositorio del autor, y Unsloth para carga y ajuste. Compatibilidad con vLLM o TGI no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles. La reduccion de tokens de razonamiento declarada por el autor reduciria el tiempo por respuesta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (TURBO Fable Cold Fusion 735-882) | ~27,8 B | 262.144 tokens (fuente secundaria) | apache-2.0 | Ajuste "heretic/uncensored" multi-etapa; solo ingles declarado; ARC-C 735 declarado en 8 bits |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible en la informacion | no disponible en la informacion | Modelo original sin decensurar; el autor le atribuye ~591 en ARC-C (derivado de su propia afirmacion) y tres modos de razonamiento |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | ~27 B | no disponible | no disponible | Release #2 del mismo autor; cinco modos de razonamiento y cinco instructivos conmutables; decensurado ligero-moderado |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU | ~27 B | no disponible | no disponible | Generacion anterior del mismo autor, con mas de 2.300 likes y 4 millones de descargas agregadas segun su model card |

La comparacion con modelos fuera de la familia Qwen (Llama, Mistral, Gemma de tamano equivalente) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado por diseno: las capas de rechazo se han atenuado o eliminado. No es apto para aplicaciones de cara al publico sin filtros y politicas de contenido adicionales.
- Riesgo elevado de generar contenido danino, ilegal o difamatorio si se usa sin supervision. La responsabilidad legal del uso recae en el desplegador.
- Solo ingles declarado: el rendimiento en castellano no esta documentado y previsiblemente sera inferior al de modelos multilingues.
- Riesgo de alucinacion no evaluado: no hay benchmarks de factualidad ni de calibracion en la informacion disponible.
- Benchmarks no verificados: las cifras de ARC-C y ARC-E proceden de la documentacion del autor, sin metodologia publicada ni replicacion independiente.
- Procedencia dudosa del repositorio: el ID corresponde al usuario Aayushbhandari12, mientras que la model card y los repositorios GGUF son de DavidAU. Este repositorio no anade evaluaciones propias, tiene 0 descargas y 1 like, y no incluye los artefactos cuantizados. Para uso en produccion conviene partir del repositorio original del autor.
- Inconsistencia en las etiquetas del modelo: convive qwen3_5, qwen3_6 y qwen3_8 en los tags, lo que dificulta determinar la genealogia exacta del ajuste.
- Soporte de tool calling y de agentes no documentado: no debe asumirse en un pipeline de produccion sin pruebas previas.
- La licencia Apache 2.0 se declara sobre el ajuste, pero los terminos del modelo base Qwen 3.8 pueden imponer condiciones adicionales; conviene revisarlos antes de un uso comercial.
- Sin garantias de mantenimiento: el autor anuncia multiples releases pendientes (fechas de septiembre de 2026 en su calendario), lo que implica posibles cambios de comportamiento entre versiones.

## Enlaces

- Repositorio analizado: https://huggingface.co/Aayushbhandari12/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF de la release #1 (autor original): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Discusion del repositorio GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/discussions/31
- Release #2 (TWIN-TURBO) en formato GGUF: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Codigo fuente de la release #2: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Version Ultra Heretic de la release #2: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Release #3 en progreso (rama "from scratch"): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha en llmrun.dev (contexto de 262.144 tokens): https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-oq8e-1m/
- Ficha en abliteration.org: https://abliteration.org/models/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
