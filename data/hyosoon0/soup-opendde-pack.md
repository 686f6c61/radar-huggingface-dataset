# hyosoon0/soup-opendde-pack

## Resumen

SoupOpenDDE es un checkpoint empaquetado que integra en un unico modelo tres sistemas de co-folding de proteinas: OpenDDE actua como modelo ancla y ESMFold2 y Protenix-v1 como modelos pares, unidos mediante dos redes de transferencia que proyectan las representaciones de los pares al espacio latente de OpenDDE. El paquete forma parte de SoupFold, un metodo de investigacion presentado en el paper "Co-folding with a Soup of Representations" (arXiv:2609.15552) por Jang, Kim y Ahn, y se distribuye como redistribucion de parametros de terceros bajo la licencia compuesta `soup-opendde-pack-components`.

El modelo resuelve el problema de combinar predicciones de estructura de complejos macromoleculares provenientes de varios modelos de co-folding sin necesidad de escribir representaciones intermedias a disco: los trunks de los tres modelos se ejecutan en un mismo proceso, las representaciones se mezclan en memoria con pesos iguales y OpenDDE continua hacia la etapa de difusion y confianza. Es relevante para el campo de la biologia estructural computacional porque propone una via de "ensamblado" de modelos heterogeneos a nivel de representacion, en lugar del clasico ensemble a nivel de estructura final.

El repositorio ocupa 18,2 GB e incluye el checkpoint `soup_opendde_pack.pt`, un fichero `NOTICE.md` con las licencias y revisiones upstream, y los ficheros de licencia originales. No se dispone de informacion sobre arquitectura interna detallada, numero de parametros, contexto ni idiomas, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-folding de proteinas; ensemble a nivel de representacion de OpenDDE (ancla), ESMFold2 y Protenix-v1 (pares) con redes de transferencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | `soup-opendde-pack-components` (compuesta; ver NOTICE.md) |
| Formato de pesos | `.pt` (pickle de PyTorch, 18,2 GB) |

## Arquitectura y entrenamiento

SoupOpenDDE no es un transformer de lenguaje sino un sistema de co-folding de estructuras proteicas. Su diseno parte de tres modelos existentes: OpenDDE como modelo ancla, y ESMFold2 y Protenix-v1 como modelos pares. Los trunks de los tres se ejecutan en un unico proceso y las representaciones de los pares se proyectan al espacio de OpenDDE mediante dos redes de transferencia entrenadas especificamente para esa tarea. La mezcla se realiza en memoria con pesos iguales, y a partir de ahi OpenDDE continua con sus modulos de difusion y estimacion de confianza. No se escribe ninguna representacion intermedia a disco.

El checkpoint empaquetado contiene los parametros de los tres modelos mas las dos redes de transferencia. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables en este dominio). Tampoco se especifica la innovacion exacta del entrenamiento de las redes de transferencia mas alla de su funcion de proyeccion entre espacios latentes. El paper de referencia es arXiv:2609.15552.

## Capacidades

- Prediccion de estructura de complejos proteicos mediante co-folding, combinando las representaciones de tres modelos.
- Modelado de interacciones proteina-proteina y, segun los tags del repositorio, de anticuerpos.
- Mezcla de representaciones en memoria con pesos iguales entre los tres modelos, sin escritura a disco.
- Ejecucion integrada de los trunks de OpenDDE, ESMFold2 y Protenix-v1 en un mismo proceso.
- Generacion de predicciones con estimacion de confianza a traves del modulo de confianza de OpenDDE.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de vision generica.
- Limitacion explicita: las redes de transferencia no se han entrenado con RNA ni DNA, por lo que pueden no generalizar a complejos con acidos nucleicos.

## Casos de uso

- Prediccion de estructuras de complejos proteina-proteina: el modelo combina las representaciones de tres co-folders para producir una prediccion consensuada de la interfaz, adecuada para estudios de interacciones en biologia estructural.
- Modelado de complejos anticuerpo-antigeno: los tags del repositorio incluyen `antibody`, y el ensemble de representaciones puede ayudar en el diseno y analisis de anticuerpos terapeuticos.
- Priorizacion de dianas en descubrimiento de farmacos: generar estructuras de complejos candidatos para filtrar interacciones antes de campanas experimentales.
- Analisis de mutaciones en interfaces proteicas: comparar predicciones del complejo nativo frente a variantes mutadas para estimar el impacto estructural.
- Validacion cruzada de predicciones individuales: usar la mezcla de representaciones como control frente a las predicciones de OpenDDE, ESMFold2 o Protenix-v1 por separado.
- Reproduccion de experimentos del paper SoupFold: el repositorio incluye un ejemplo (`examples/9mnb/9mnb.json`) que permite ejecutar el pipeline completo con `soupfold-pack`.
- Integracion en pipelines de biologia computacional: al ejecutarse en un solo proceso y no escribir representaciones a disco, puede incorporarse en flujos automatizados de analisis estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 18,2 GB en precision original, por lo que se requiere al menos esa cantidad de memoria mas el overhead de los tres trunks ejecutandose simultaneamente.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del checkpoint, se necesita una GPU con memoria suficiente para cargar los pesos completos (candidatas habituales: A100 80 GB, H100, o GPUs de 24-48 GB si el codigo permite fragmentacion).
- Compatibilidad con GPU de consumo: no confirmada; el tamano del checkpoint y la ejecucion simultanea de tres trunks hacen improbable su uso en GPUs de consumo sin optimizaciones adicionales.
- Opciones de despliegue: el repositorio oficial `hsjang0/soupfold` (rama `soup-opendde-pack`) con el CLI `soupfold-pack`; requiere Python 3.12 y `uv`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota de seguridad: el checkpoint es un pickle y el codigo lo carga con `weights_only=False`, ademas de deserializar un `ccd.pkl` incluido; conviene verificar el hash en `SHA256SUMS` antes de cargarlo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoupOpenDDE (este) | Ensemble de co-folding (OpenDDE + ESMFold2 + Protenix-v1) | no disponible | no aplica | `soup-opendde-pack-components` | HuggingFace (18,2 GB) |
| OpenDDE | Co-folding (modelo ancla) | no disponible | no aplica | no disponible | HuggingFace (`aurekaresearch/OpenDDE`) |
| ESMFold2 | Prediccion de estructura (modelo par) | no disponible | no aplica | no disponible | no disponible en la informacion |
| Protenix-v1 | Co-folding (modelo par) | no disponible | no aplica | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las redes de transferencia no se han entrenado con RNA ni DNA, por lo que pueden no generalizar a complejos con acidos nucleicos.
- Las salidas son predicciones computacionales y requieren validacion cientifica experimental.
- El checkpoint es un pickle cargado con `weights_only=False`; la deserializacion puede ejecutar codigo arbitrario, por lo que solo debe cargarse un fichero de confianza y verificando el hash de `SHA256SUMS`.
- La licencia es compuesta (`soup-opendde-pack-components`) y depende de las licencias de los componentes de terceros; es imprescindible revisar `NOTICE.md` y `LICENSES/` antes de cualquier uso, incluido el comercial.
- No se dispone de informacion sobre sesgos, alucinacion en sentido linguistico ni limitaciones de contexto, al no ser un modelo de lenguaje.
- El repositorio no registra descargas ni likes, lo que sugiere un uso muy limitado y poca validacion externa hasta la fecha.
- No se detallan los requisitos de hardware ni el rendimiento, lo que dificulta planificar su despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/hyosoon0/soup-opendde-pack
- NOTICE.md (licencias y cambios): https://huggingface.co/hyosoon0/soup-opendde-pack/blob/main/NOTICE.md
- Repositorio SoupFold: https://github.com/hsjang0/soupfold
- Paper: https://arxiv.org/abs/2609.15552
- Modelo upstream OpenDDE: https://huggingface.co/aurekaresearch/OpenDDE
- README de SoupFold con citas BibTeX: https://github.com/hsjang0/soupfold#citation
