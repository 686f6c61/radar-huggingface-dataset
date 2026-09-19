# nhutchins627/iris-pretrained-checkpoints

## Resumen

IRIS pretrained checkpoints es una colección de diez modelos preentrenados basados en SCANVI, desarrollados por el autor nhutchins627 y asociados al manuscrito de IRIS publicado en Nature Methods. IRIS infiere la actividad de vías de señalización a partir de transcriptomas de célula única, es decir, no genera texto ni código: es una herramienta computacional de biología computacional que traduce perfiles de expresión génica en puntuaciones de actividad de rutas de señalización. Los checkpoints aquí alojados son exactamente los utilizados en los análisis del artículo, lo que los convierte en artefactos de reproducibilidad más que en un modelo de propósito general.

La colección cubre cinco vías (RA, WNT, FGF, BMP y TGFβ) en dos contextos de entrenamiento: un atlas de gastrulación de ratón (E6.5–E8.5) con cribados asociados, y mesénquima de intestino anterior en E9–E9.5 (Han et al. 2020) con cribados. Cada vía tiene su propia arquitectura publicada, con capas ocultas de 64 a 1024 unidades y dimensiones latentes de 30 a 70, de modo que no existe una configuración única compartida. El repositorio ocupa 0,9 GB y se distribuye bajo licencia MIT.

Su relevancia es acotada pero clara: quien quiera reproducir los resultados del manuscrito de IRIS o reutilizar la inferencia de actividad de vías sin reentrenar desde cero dispone aquí de los pesos originales. La contrapartida es una fuerte dependencia de versión: los checkpoints se guardaron con scvi-tools 0.20.3 y la API de carga cambió en scvi-tools 1.x, por lo que no se cargan directamente en versiones modernas de la librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCANVI (variational autoencoder semisupervisado de scvi-tools) con arquitecturas especificas por via: h256_z70, h64_z30, h128_z70, h256_z70, h1024_z30 |
| Parametros totales | no disponible (el autor no publica recuento de parametros; la arquitectura se describe por tamano de capa oculta y dimension latente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo sobre matrices de expresion genica de celula unica, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en formato nativo de PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural; opera sobre transcriptomas) |
| Licencia | MIT |
| Formato de pesos | Directorios de guardado de scvi-tools, cada uno con `model.pt` (PyTorch) |

## Arquitectura y entrenamiento

Cada checkpoint es un modelo SCANVI, la variante semisupervisada del VAE de scvi-tools para datos de expresion genica de celula unica, que combina un modelo generativo de los recuentos (tipicamente Negative Binomial o Zero-Inflated Negative Binomial) con variables latentes de baja dimension y un clasificador sobre dichas variables. Las dimensiones publicadas son z30 y z70 para el espacio latente, y h64, h128, h256 y h1024 para las capas ocultas, asignadas por via segun el resultado del manuscrito, no de forma homogenea. La inferencia de actividad de vias se realiza aguas abajo sobre las representaciones latentes del modelo cargado mediante el objeto IRIS.

El entrenamiento se realizo en dos contextos: un atlas de gastrulacion de raton (E6.5-E8.5) y mesenquima de intestino anterior en E9-E9.5 procedente de Han et al. 2020, en ambos casos complementados con cribados (screens). El autor no detalla en la model card el numero de celulas, la composicion exacta de los datasets ni si hubo etapas de refinamiento tipo RLHF o DPO, algo que ademas no aplica a este tipo de modelo. Los checkpoints se generaron y guardaron con scvi-tools 0.20.3, torch 2.2.2+cu121 y scanpy 1.10.0; la carga directa falla en scvi-tools 1.x por el cambio de API.

## Capacidades

- Inferencia de actividad de cinco vias de senalizacion (RA, WNT, FGF, BMP y TGFbeta) a partir de transcriptomas de celula unica.
- Analisis de dinamica de linaje in vivo mediante los checkpoints entrenados en el atlas de gastrulacion.
- Analisis de mesenquima especifico de organo, cuyo resultado publicado es el enriquecimiento de WNT/BMP en mesenquima respiratorio.
- Transferencia de etiquetas semisupervisada, propia de la naturaleza SCANVI del modelo.
- Integracion con el ecosistema de expresion de celula unica: AnnData, Scanpy y el objeto IRIS para la carga del modelo.
- Carga selectiva de checkpoints individuales mediante `snapshot_download` con `allow_patterns`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio, modo de razonamiento explicito ni generacion de texto: no es un modelo de lenguaje.
- Cobertura de idiomas: no aplica.

## Casos de uso

- Reproduccion de resultados del manuscrito de IRIS: cargando los checkpoints de gastrulacion o de mesenquima de intestino anterior se replican los analisis publicados sin necesidad de reentrenar los modelos.
- Analisis de dinamica de linaje en desarrollo temprano: los checkpoints de gastrulacion permiten proyectar celulas del atlas E6.5-E8.5 sobre el espacio latente e inferir la actividad de RA, WNT, FGF, BMP y TGFbeta a lo largo de trayectorias de diferenciacion.
- Estudio de mesenquima especifico de organo: los checkpoints de E9-E9.5 permiten reproducir y extender el hallazgo de enriquecimiento WNT/BMP en mesenquima respiratorio sobre nuevos conjuntos de datos del mismo tejido.
- Priorizacion de senales en protocolos de diferenciacion: al puntuar la actividad de cinco vias sobre celulas derivadas de celulas madre pluripotentes, el modelo ayuda a identificar que ruta esta activa en cada estadio y a ajustar condiciones de cultivo o moleculas de senalizacion.
- Analisis de cribados y perturbaciones: comparando puntuaciones de actividad entre condiciones control y tratadas se pueden detectar desplazamientos en la senalizacion, usando los checkpoints entrenados especificamente con datos de cribado.
- Anotacion funcional de clusters: SCANVI permite transferir etiquetas a celulas no anotadas del mismo contexto, de modo que agrupaciones sin marcadores claros pueden caracterizarse por su perfil de actividad de vias.
- Integracion en pipelines de biologia computacional: al ser pesos PyTorch cargables desde Python, los checkpoints se integran en cuadernos de Scanpy o en flujos basados en AnnData para analisis exploratorio.
- Punto de partida para transferencia a nuevos tejidos o especies: partiendo de estos pesos puede intentarse un ajuste fino con datos propios, aunque el autor no documenta recetas de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tabla de metricas (ni correlacion con datos de referencia, ni AUC, ni comparaciones con otros metodos), y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. El unico resultado cuantificable mencionado en la informacion disponible es cualitativo: los checkpoints de mesenquima de intestino anterior sustentan el resultado publicado de enriquecimiento WNT/BMP en mesenquima respiratorio (manuscrito de IRIS, Nature Methods). El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Tamano del repositorio: 0,9 GB en total para los diez checkpoints; el tamano individual por checkpoint no se especifica en la informacion disponible.
- VRAM estimada para inferencia: no disponible. Al tratarse de modelos de capas ocultas de 64 a 1024 unidades y dimension latente de 30 a 70, el consumo previsible es muy inferior al de un modelo de lenguaje, pero el autor no publica mediciones.
- GPU recomendadas: no disponible. La unica referencia de entorno es torch 2.2.2+cu121, lo que indica entrenamiento e inferencia sobre CUDA 12.1.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio y las dimensiones declaradas, pero no hay confirmacion publicada por parte del autor.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. La via soportada es Python con scvi-tools 0.20.3, torch 2.2.2+cu121 y scanpy 1.10.0, descargando los pesos con `huggingface_hub.snapshot_download` y cargandolos mediante `iris_obj.load_pretrained_model([path], ["Bmp"])`.
- Latencia y throughput estimados: no disponibles.
- Requisito critico de compatibilidad: scvi-tools 1.x cambia la API de carga y no puede cargar estos checkpoints directamente; es necesario el entorno 0.20.3.

## Comparativa con modelos similares

No hay metricas comparativas publicadas en la informacion disponible para este modelo frente a alternativas. La comparacion que sigue es estructural y de enfoque, sin cifras de rendimiento.

| Modelo / enfoque | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IRIS pretrained checkpoints | SCANVI (scvi-tools) por via | no disponible | no aplica | MIT | HuggingFace (0 descargas) |
| SCVI | VAE no supervisado (scvi-tools) | configurable por el usuario | no aplica | BSD-3-Clause (scvi-tools) | pip / conda |
| SCANVI | VAE semisupervisado (scvi-tools) | configurable por el usuario | no aplica | BSD-3-Clause (scvi-tools) | pip / conda |
| PROGENy, decoupleR, AUCell | Metodos de puntuacion de actividad de vias basados en firmas genicas o rankings | no aplica (no son redes neuronales entrenadas de este modo) | no aplica | depende del paquete | CRAN / Bioconductor / PyPI |

La diferencia funcional relevante es que IRIS aprende la actividad de la via de forma latente a partir de los datos, mientras que las aproximaciones basadas en firmas la estiman a partir de conjuntos de genes de referencia. No se dispone de datos que permitan afirmar cual rinde mejor en cada contexto.

## Limitaciones y advertencias

- Dependencia estricta de version: los checkpoints solo cargan con scvi-tools 0.20.3; la API de 1.x es incompatible, lo que complica su mantenimiento a medio plazo.
- Especificidad de contexto: los modelos estan entrenados sobre atlas de raton (gastrulacion E6.5-E8.5 y mesenquima de intestino anterior E9-E9.5). Aplicarlos a otros tejidos, estadios o especies sin validacion previa no esta respaldado por el autor.
- Arquitecturas no homogeneas: cada via usa una configuracion distinta (h64_z30 hasta h1024_z30), por lo que no existe un unico modelo reutilizable ni un pipeline de ajuste unico.
- Sin datos de sesgo o calibracion: la model card no documenta analisis de sesgos, robustez frente a lotes, ni tasas de error de la inferencia.
- Riesgo de interpretacion excesiva: las puntuaciones de actividad de via son inferencias estadisticas, no mediciones directas de senalizacion; no deben presentarse como evidencia experimental sin validacion ortogonal.
- Ausencia de metricas publicadas en la informacion disponible: no hay benchmarks que permitan estimar la precision frente a otros metodos.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del codigo y de los datos subyacentes es independiente; los datasets de entrenamiento tienen sus propios accesos, documentados en `reproducibility/docs/DATA.md` del repositorio de codigo.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin issues ni comunidad que reporte problemas de carga o de resultados.

## Enlaces

- HuggingFace: https://huggingface.co/nhutchins627/iris-pretrained-checkpoints
- Codigo de IRIS: https://github.com/Pulin-Li-Lab/IRIS-signaling-inference
- Documentacion de datos de entrenamiento: `reproducibility/docs/DATA.md` en el repositorio de codigo
- Manuscrito de IRIS (Nature Methods): referencia citada en la model card, sin DOI incluido en la informacion disponible
- Dataset de mesenquima de intestino anterior: Han et al. 2020, referencia citada en la model card
- scvi-tools: https://scvi-tools.org
- Repositorio de referencia de PROGENy, decoupleR y AUCell: no disponible en la informacion proporcionada
