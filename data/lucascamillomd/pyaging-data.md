# lucascamillomd/pyaging-data

## Resumen

`lucascamillomd/pyaging-data` no es un modelo de lenguaje, sino un repositorio de datos y pesos que da soporte a la librería Python [`pyaging`](https://github.com/lucascamillomd/pyaging), una herramienta para calcular edades biológicas a partir de relojes epigenéticos y proteómicos. El repositorio, mantenido por Lucas Paulo de Lima Camillo, agrupa los ficheros de pesos de decenas de "relojes" (Horvath, PhenoAge, OrganAge, HPS, PAC, PAOPAC, entre otros), metadatos armonizados y ficheros de ejemplo para los tutoriales de la librería.

El propósito es servir como backend de descarga de `pyaging`: la librería obtiene los pesos desde Hugging Face y los carga con PyTorch para producir predicciones de edad biológica sobre datos de metilación de ADN o de proteómica (Olink). Con un tamaño de repositorio de 84,7 GB, contiene tanto los pesos individuales como copias de compatibilidad en la raíz, el catálogo agregado `all_clock_metadata.pt` y material auxiliar en `supporting_files/`.

Es relevante en el contexto de la investigación sobre envejecimiento porque centraliza, versiona y documenta un ecosistema heterogéneo de relojes biológicos con procedencias y licencias distintas, algo poco habitual en este campo. No obstante, no es un modelo generativo ni un transformer: no tiene parámetros en el sentido habitual, ni contexto, ni capacidad de generar texto. La ficha que sigue se adapta a esa naturaleza y marca como "no disponible" todo lo que no aplica o no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de modelos de relojes biológicos (regresiones y modelos estadísticos empaquetados como objetos PyTorch); no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (depende de cada reloj; el repositorio pesa 84,7 GB en conjunto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato PyTorch nativo, sin cuantización documentada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | `other` (colección de procedencia mixta; la licencia MIT de pyaging no cubre los pesos ni los datasets de terceros) |
| Formato de pesos | ficheros `.pt` (PyTorch), cargados con `torch.load(..., weights_only=False)`; metadatos en `config.json` por reloj y catálogo agregado `all_clock_metadata.pt` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única. Cada reloj es un modelo independiente desarrollado en su publicación original: relojes epigenéticos como Horvath o DNAm PhenoAge, y relojes proteómicos como HPS, PAOPAC Conventional, PAC y 46 modelos OrganAge completos sobre Olink Explore 3072. Los pesos se empaquetan como objetos Python/PyTorch y se acompañan de metadatos armonizados con campos controlados y multivaluados (`tissue`, `platform`, `predicts`, `training_target`, `unit`), lo que permite filtrar los relojes de forma consistente.

No hay un entrenamiento propio del repositorio ni datos de RLHF/DPO: el contenido refleja los modelos tal como se publicaron, con anotaciones de procedencia y una política de publicación que sube los pesos antes que los metadatos agregados para evitar que el catálogo anuncie un reloj sin fichero. Destaca la corrección clínica de PhenoAge introducida en pyaging >=0.5.7, que sustituye el parámetro de Gompertz `gamma = 0.0076927` por el valor erróneo anterior `0.0192`, que inflaba las estimaciones finitas en aproximadamente 9,619365 años para el mismo log hazard. La fórmula vive en la clase Python, por lo que actualizar solo los pesos no corrige versiones antiguas del paquete.

## Capacidades

- Cálculo de edades biológicas a partir de datos de metilación de ADN y de proteómica (Olink Explore 3072 y 1536).
- Catálogo armonizado de relojes con metadatos filtrables por tejido, plataforma, objetivo de entrenamiento y unidad.
- Soporte de versionado reproducible mediante etiquetas de release (`v0.3.1`, etc.) y la variable de entorno `PYAGING_DATA_REVISION` para fijar la revisión de descarga.
- Ejemplos listos para tutoriales, incluido `PAD000022_subset.pkl` con 32 muestras reales de plasma y 134 ensayos Olink Explore 3072 para el tutorial de OrganAge.
- Modelos proteómicos con interfaces específicas: OrganAge usa símbolos originales sensibles a mayúsculas; HPS y PAC usan símbolos en minúscula más la edad en años; PAOPAC aplica exponenciación de NPX, estandarización por cohorte y corrección de sesgo de edad por LOWESS.
- HPS devuelve una probabilidad de healthspan entre 0 y 1 (más alto es más saludable), no una edad en años.
- No ofrece generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente.

## Casos de uso

- Investigación en envejecimiento epigenético: cargar un reloj como Horvath o DNAm PhenoAge desde su repositorio por reloj y aplicar la predicción sobre matrices de metilación, aprovechando que los metadatos indican tejido y plataforma de desarrollo.
- Estudios proteómicos con OrganAge: usar los 46 modelos completos sobre Olink Explore 3072 para estimar edades de órganos a partir de muestras de plasma, respetando los símbolos de proteína sensibles a mayúsculas que exige la interfaz.
- Reproducibilidad de análisis clínicos: fijar `PYAGING_DATA_REVISION` a una etiqueta de release concreta para garantizar que un pipeline reproduce exactamente los pesos y metadatos de una versión de pyaging, algo crítico tras la corrección de PhenoAge.
- Evaluación de salud y healthspan: emplear HPS para obtener una probabilidad de 0 a 1 en lugar de una edad en años, útil en cohortes donde interesa un indicador de salud relativa.
- Estandarización de cohortes con PAOPAC: aplicar su flujo de exponenciación de NPX, estandarización por cohorte y corrección de sesgo de edad por LOWESS cuando se dispone de la edad cronológica de los sujetos.
- Docencia y prototipado: usar los ficheros de ejemplo de la raíz y el subconjunto `PAD000022_subset.pkl` para reproducir los tutoriales de proteómica y epigenética sin necesidad de datos propios.
- Auditoría de procedencia: consultar `clock_metadata.json` y `evidence_ledger.jsonl` del repositorio de pyaging para rastrear la evidencia de cada campo de metadatos antes de usar un reloj en un estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del reloj concreto y del tamaño de la matriz de entrada, no del repositorio completo.
- GPU recomendadas: no disponibles; los relojes son modelos estadísticos ligeros y no requieren GPU de gama alta, aunque no se documenta ningún requisito específico.
- Compatibilidad con GPU de consumo: no disponible; el repositorio no especifica requisitos de hardware.
- Almacenamiento: el repositorio completo ocupa 84,7 GB, por lo que conviene descargar solo los ficheros del reloj necesario mediante la caché estándar de Hugging Face.
- Opciones de despliegue: la vía prevista es la librería Python `pyaging`, que descarga los ficheros desde Hugging Face y los carga con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucascamillomd/pyaging-data` | Repositorio de pesos y metadatos de relojes biológicos | no disponible (84,7 GB en conjunto) | no aplica | `other` (mixta) | Hugging Face |
| Relojes individuales bajo la organización `pyaging` (p. ej. `pyaging/horvath2013`) | Reloj biológico individual con su `config.json` y model card | no disponible | no aplica | según cada reloj | Hugging Face |
| Alternativas externas de relojes epigenéticos | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es errónea.
- Licencia `other` por procedencia mixta: la licencia MIT de pyaging no concede derechos adicionales sobre los pesos de terceros ni sobre los datasets de origen. Algunos relojes son solo para investigación o tienen términos comerciales separados; hay que consultar los metadatos y la publicación citada antes de usarlos.
- Riesgo de seguridad: los ficheros de relojes son objetos Python/PyTorch cargados con `torch.load(..., weights_only=False)`, por lo que un pickle malicioso puede ejecutar código. Solo deben cargarse desde el repositorio oficial y conviene revisar cambios inesperados.
- La rama `main` es una release de datos viva y puede cambiar con independencia de la versión del paquete Python; para producción conviene fijar una etiqueta de release.
- La presencia de un fichero en el repositorio no implica que el reloj pertenezca al catálogo actual: hay ficheros retirados que se conservan por compatibilidad con releases anteriores.
- PhenoAge clínico requiere pyaging >=0.5.7; los resultados calculados con versiones anteriores están inflados en aproximadamente 9,619365 años y deben recalcularse.
- Los modelos OrganAge reducidos sobre Olink Explore 1536 salen del catálogo actual y los nombres de los modelos completos pierden el sufijo `olink3000`.
- ProtAge e ipfP3GPT no son entradas ejecutables de pyaging en esta release por activos de autor no disponibles o restringidos.
- NPX es abundancia relativa en log2, no concentración; la armonización entre plataformas y entre suero y plasma es una decisión externa de preparación de datos.
- Las predicciones de PAOPAC dependen de la cohorte enviada y requieren la edad cronológica.
- No se documentan sesgos demográficos ni tasas de alucinación porque el modelo no genera contenido; los sesgos relevantes serían los de las cohortes de entrenamiento de cada reloj, no disponibles en esta información.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lucascamillomd/pyaging-data
- Organización pyaging en Hugging Face: https://huggingface.co/pyaging
- Repositorio GitHub de pyaging: https://github.com/lucascamillomd/pyaging
- Registro canónico de metadatos: https://github.com/lucascamillomd/pyaging/blob/main/clocks/metadata/clock_metadata.json
- Ledger de evidencia: https://github.com/lucascamillomd/pyaging/blob/main/clocks/metadata/evidence_ledger.jsonl
- Tutorial de proteómica: https://pyaging.readthedocs.io/en/latest/tutorials/tutorial_proteomics.html
- Data card de `PAD000022_subset.pkl`: `PAD000022_README.md` en el repositorio
- Métodos suplementarios originales de PhenoAge: https://cdn.aging-us.com/article/101414/supplementary/SD1/0/aging-v10i4-101414-supplementary-material-SD1.pdf
