# songlab/PhyloGPN

## Resumen

PhyloGPN es una red neuronal convolucional desarrollada por el laboratorio de Song (songlab) que procesa secuencias de ADN codificadas y produce los parametros de la matriz de tasas del modelo de evolucion de Felsenstein de 1981 (F81). El modelo se entreno para maximizar la verosimilitud de las columnas del alineamiento Zoonomia dada una filogenia, de modo que la distribucion estacionaria del proceso de sustitucion que describe el F81 indica la viabilidad relativa de cada alelo en un locus concreto. Por esta razon, el autor lo presenta formalmente como un modelo de lenguaje genomico apto para transfer learning.

A diferencia de los grandes modelos de lenguaje de texto, PhyloGPN no genera lenguaje natural: es una herramienta especializada de genomica computacional con 83.185.924 parametros (unos 83 millones) y un peso de repositorio de 1,0 GB. Funciona como una ventana deslizante con un campo receptivo de 481 posiciones, por lo que cualquier secuencia de entrada debe tener al menos esa longitud y la salida corresponde a las posiciones centrales (longitud de entrada menos 480).

Su interes actual reside en que ofrece una representacion aprendida de la presion selectiva sobre el ADN, utilizable como extractor de caracteristicas (embeddings por sitio) en tareas downstream de genomica comparativa, y en que su codigo de inferencia se distribuye con integracion en `transformers` mediante `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) con ventana deslizante; campo receptivo de 481 posiciones |
| Parametros totales | 83.185.924 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Secuencias de entrada de longitud >= 481; salida de longitud de entrada menos 480 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo genomico; alfabeto de ADN ACGT) |
| Licencia | cc |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

PhyloGPN es una CNN que recibe secuencias de ADN codificadas y emite, por cada sitio, parametros de tasa en forma logaritmica para el modelo F81 de evolucion de ADN. La salida se interpreta como la distribucion estacionaria del proceso de sustitucion, es decir, la viabilidad relativa de cada alelo en el locus. La arquitectura se disena explicitamente como funcion de ventana deslizante: procesa lotes de secuencias de cualquier longitud mayor o igual a 481 y devuelve predicciones para las posiciones centrales, lo que permite aplicar el modelo a cromosomas completos por tramos.

El entrenamiento se planteo como un problema de maxima verosimilitud sobre las columnas del alineamiento Zoonomia (alineamiento ampliado de primates publicado en Nature en noviembre de 2023) dada una filogenia. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, de la composicion detallada del dataset ni de si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio). El modelo expone dos metodos principales: `get_embeddings`, que devuelve representaciones por sitio, y la llamada directa al modelo, que devuelve los logaritmos de las tasas del F81 por nucleotido (A, C, G, T).

## Capacidades

- Prediccion de parametros de tasa del modelo F81 de evolucion de ADN por sitio.
- Generacion de embeddings por posicion para transfer learning en tareas genomicas.
- Modelado de viabilidad relativa de alelos a partir de la distribucion estacionaria inferida.
- Procesamiento de lotes de secuencias de ADN de longitud arbitraria (>= 481) mediante ventana deslizante.
- Integracion con la libreria `transformers` mediante `AutoModel` y `AutoTokenizer` con codigo remoto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingue en sentido linguistico: opera sobre el alfabeto de ADN (A, C, G, T).
- No dispone de modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Genomica comparativa: usar los embeddings por sitio para detectar regiones bajo seleccion purificadora o positiva comparando las tasas inferidas entre linajes de primates del alineamiento Zoonomia.
- Priorizacion de variantes: interpretar la distribucion estacionaria del F81 en un locus para estimar la viabilidad relativa de cada alelo y priorizar variantes candidatas en estudios de asociacion.
- Transfer learning en tareas reguladoras: emplear `get_embeddings` como extractor de caracteristicas congelado para clasificadores de elementos reguladores, sitios de union de factores de transcripcion o accesibilidad de cromatina.
- Anotacion funcional a escala genomica: aplicar el modelo en ventana deslizante sobre cromosomas completos para obtener perfiles de tasas sitio a sitio y segmentar el genoma en regimenes evolutivos.
- Filogenetica cuantitativa: sustituir matrices de tasas fijas por las predichas por PhyloGPN en calculos de verosimilitud filogenetica para mejorar el ajuste a datos reales.
- Investigacion en modelos de lenguaje genomicos: usar el modelo como linea base para comparar representaciones aprendidas frente a otros enfoques (k-mers, modelos de atencion) en tareas de biologia computacional.
- Docencia y prototipado: por su tamano moderado (83 millones de parametros) y su API sencilla en `transformers`, sirve para experimentar con modelos de evolucion entrenados sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 83 millones de parametros en precision FP32 el peso ronda los 0,33 GB, y en FP16 unos 0,17 GB, a lo que hay que sumar activaciones y memoria del tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por capacidad de memoria; se espera funcionamiento correcto en RTX 3060, RTX 4090 o superiores, asi como en A100/H100 si se procesan lotes grandes o genomas completos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: inferencia nativa con `transformers` y `trust_remote_code=True`; no se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI (y no serian el camino natural para un modelo genomico con codigo personalizado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican modelos comparables de la misma categoria (modelos genomicos que predicen parametros de evolucion de ADN mediante CNN y verosimilitud filogenetica).

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de usarlo en produccion.
- La entrada debe tener al menos 481 posiciones; secuencias mas cortas deben rellenarse con el token de padding segun el ejemplo de la model card.
- La salida tiene longitud de entrada menos 480 posiciones, lo que exige gestionar el alineamiento de indices al integrar el modelo en pipelines.
- El modelo esta especializado en ADN y en el modelo evolutivo F81; no es un modelo de lenguaje general ni admite texto, vision o audio.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (concepto poco aplicable aqui) ni evaluaciones de robustez fuera del alineamiento Zoonomia.
- La licencia indicada es "cc" sin especificar la variante; antes de un uso comercial es imprescindible verificar los terminos exactos en el repositorio.
- Al estar entrenado sobre el alineamiento Zoonomia (primates), su generalizacion a otros clados o a genomas no primates no esta documentada en la informacion disponible.
- No se documentan cuantizaciones oficiales; el uso en FP16/FP32 es el camino soportado por los pesos safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songlab/PhyloGPN
- Preprint (arXiv:2503.03773): https://arxiv.org/abs/2503.03773
- Alineamiento Zoonomia (Nature, noviembre de 2023): https://cglgenomics.ucsc.edu/november-2023-nature-zoonomia-with-expanded-primates-alignment/
- Modelo F81 (Felsenstein, 1981), referencia en Wikipedia: https://en.wikipedia.org/wiki/Models_of_DNA_evolution#F81_model_(Felsenstein_1981)
