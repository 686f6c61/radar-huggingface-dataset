# mschonhardt/consilia-baldus-venice1575-kraken-rec

## Resumen

El modelo `consilia-baldus-venice1575-kraken-rec` es un modelo de reconocimiento de texto (OCR/HTR) especializado en impresos legales venecianos del siglo XVI. Lo desarrolla Michael Schonhardt en el marco del proyecto *Embedding the Past* (LOEWE-Exploration, TU Darmstadt y AdWL|Mainz), financiado por HMWK Hessen, para el portal Consilia. Resuelve un problema muy concreto: la transcripcion fiable de los cinco volumenes de los *Consilia* de Baldus de Ubaldis (Venecia, 1575), con sus convenciones tipograficas y editoriales particulares.

Tecnicamente es un modelo de kraken (la libreria de reconocimiento de lineas de texto) afinado a partir de McCATMuS (`McCATMuS_nfd_nofix_V1`), un modelo generico para manuscritos e impresos. Se ha entrenado sobre 167.699 lineas anotadas y evaluado sobre un conjunto de test de 71 paginas y 9.941 lineas nunca vistas, alcanzando un CER del 0,53 % y un WER del 1,91 %. Su relevancia actual es la de las humanidades digitales: demuestra que un modelo de reconocimiento afinado con un corpus pequeno y bien curado puede superar el 99,4 % de precision en caracteres sobre tipografia impresa del siglo XVI.

El modelo trabaja con lineas en formato baselines (poligono y linea base) y se distribuye en dos formatos de pesos (CoreML y safetensors) bajo licencia CC BY 4.0. No es un modelo generativo de lenguaje: es un componente especializado dentro de un pipeline de digitalizacion documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | kraken (reconocimiento de lineas de texto, baselines con poligono y linea base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (reconocimiento linea a linea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | latin (la) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (`.mlmodel`) y safetensors (kraken 7) |

## Arquitectura y entrenamiento

El modelo se basa en kraken, un sistema de reconocimiento de lineas que opera sobre recortes de linea con linea base y poligono, y que en este caso se ha afinado desde McCATMuS (`McCATMuS_nfd_nofix_V1`), un modelo generico para manuscritos e impresos. El codec se amplio con los caracteres propios de la edicion (`--resize union`) y el texto se normaliza en NFD. El modelo es de tipo baselines: espera lineas con linea base y poligono procedentes del segmentador de kraken, de PageXML o de ALTO generados por eScriptorium o Transkribus.

El entrenamiento uso 167.699 lineas de las paginas de train del dataset (lineas con texto no vacio, linea base y decision humana o al menos dos de las tres lecturas coincidentes con el texto de la edicion), 13.611 lineas de validacion de otras 100 paginas y 9.941 lineas de test de 71 paginas nunca usadas en entrenamiento ni seleccion. La configuracion de `ketos train` fue: batch 32, learning rate 5e-4 con schedule coseno sobre 16 epocas, augmentation activada, padding de 16 px, precision mixta y parada temprana tras cuatro evaluaciones sin mejora. La mejor epoca fue la 18 de 23. El entrenamiento se ejecuto en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) en la TU Darmstadt, con 6 a 8 minutos por epoca y 2,8 horas en total, el 26 de octubre de 2026. Las emisiones estimadas atribuidas a este modelo son de unos 310 g CO2e.

Las convenciones editoriales aplicadas al texto de referencia son parte del diseno del modelo: la s larga se transcribe como s, el ampersand como "et", las ligaduras se resuelven, la e caudada se conserva, las abreviaturas con tilde o signos especiales se expanden silenciosamente ("nõ" > "non", "ſnĩa" > "sententia"), las abreviaturas con punto en citas se mantienen tal como se imprimen ("ff. de uer. ob. l."), un numero marginal se anade como prefijo ("2 ") y el simbolo estructurante del texto se representa como "†". Los guiones visibles al final de linea se marcan como "¬".

## Capacidades

- Reconocimiento de texto impreso (OCR/HTR) linea a linea sobre tipografia romana y cursiva de impresos legales venecianos de la decada de 1570.
- Transcripcion con normalizacion editorial integrada: expansion de abreviaturas, resolucion de ligaduras, tratamiento de s larga y de la e caudada.
- Preservacion de marcas estructurales del original: numeros marginales como prefijo, simbolo estructurante como "†" y guiones de final de linea como "¬".
- Trabajo conjunto con el modelo de segmentacion `mschonhardt/consilia-baldus-venice1575-kraken-seg` para el flujo completo de pagina a PAGE XML.
- Entrada de lineas con linea base y poligono procedentes de kraken, PageXML o ALTO (eScriptorium, Transkribus).
- Salida de texto alineada con las convenciones de la edicion digital del portal Consilia.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generativas: es un modelo puramente de reconocimiento visual de texto.

## Casos de uso

- Digitalizacion de corpus legales del siglo XVI: el modelo transcribe las lineas de los cinco volumenes de los *Consilia* de Baldus con un CER del 0,53 %, lo que permite generar texto de consulta para investigadores sin transcripcion manual.
- Alimentacion del portal Consilia: integrado en el pipeline del proyecto, convierte imagenes de pagina en PAGE XML y texto alineado con las convenciones editoriales de la edicion (abreviaturas expandidas, s larga normalizada), de modo que el texto resultante es directamente publicable.
- Creacion de ediciones criticas asistidas: el texto reconocido sirve como base para la revision filologica, reduciendo el trabajo de tecleado a la correccion de errores residuales (mayoritariamente guiones finales y letras sueltas).
- Busqueda y mineria de texto sobre fondos antiguos: una vez transcritas las paginas, el texto permite busqueda por terminos legales, citas y referencias dentro de colecciones de impresos venecianos.
- Colaboracion con eScriptorium y Transkribus: el modelo acepta ALTO y PageXML de estas plataformas, por lo que se puede incorporar a flujos de trabajo de humanidades digitales ya existentes sin rehacer la segmentacion.
- Procesamiento por lotes en servidor: al ser un modelo de kraken con pesos ligeros (repo de 0,0 GB), se puede ejecutar en CPU o en GPU modesta para digitalizar lotes de paginas en una sola pasada.
- Formacion y evaluacion de modelos: sirve como referencia de afinado de McCATMuS sobre un dominio tipografico concreto, util para proyectos que quieran replicar la metodologia con otros corpus impresos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`ketos test` sobre el split de test de 71 paginas y 9.941 lineas, texto en NFD):

| Metrica | Valor |
|---|---|
| Precision de caracteres | 99,47 % (607.691 caracteres, 3.218 errores: 490 inserciones, 1.855 deleciones, 873 sustituciones) |
| Tasa de error de caracteres (CER) | 0,53 % |
| Precision de palabras | 98,09 % |
| Tasa de error de palabras (WER) | 1,91 % |
| Mejor precision de caracteres en validacion | 99,52 % (epoca 18) |

Desglose por tipo de caracter: letras latinas 99,61 %, puntuacion y digitos 99,35 %, marcas combinantes 97,2 %. Los errores mas frecuentes son la omision del guion de final de linea (274 veces) o su adicion (91), la omision de un espacio (189) y la omision de letras sueltas dentro de palabras (n, i, t, a, e, s, o, u, m, r: entre 80 y 130 cada una). Las deleciones superan a las inserciones casi cuatro a uno y los errores de mayusculas son insignificantes (la precision insensible a mayusculas iguala a la sensible).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el modelo es de reconocimiento de lineas y el repositorio ocupa 0,0 GB, por lo que el peso de los parametros es reducido.
- GPU recomendadas: el entrenamiento se hizo en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), pero esa capacidad corresponde al entrenamiento, no a la inferencia.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con unos pocos GB de VRAM, dado el tamano reducido del repositorio; no se especifica una cifra concreta.
- Opciones de despliegue: kraken (CLI `kraken ... ocr -m consilia_rec.mlmodel`), con soporte de CoreML y safetensors de kraken 7; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | CER reportado |
|---|---|---|---|---|---|
| consilia-baldus-venice1575-kraken-rec | kraken, reconocimiento de lineas | latin | CC BY 4.0 | no aplica | 0,53 % (test propio) |
| McCATMuS (`McCATMuS_nfd_nofix_V1`) | kraken, modelo generico manuscritos e impresos | multiple | no disponible en la informacion | no aplica | no disponible |
| consilia-baldus-venice1575-kraken-seg (v1 del proyecto) | kraken, segmentacion de layout | latin | no disponible en la informacion | no aplica | no aplica (segmentacion) |

La comparacion directa con McCATMuS no es posible con los datos disponibles: el modelo base es generico y el afinado esta especializado en un unico corpus y tipografia. El modelo de segmentacion del mismo proyecto es complementario, no alternativo. No se dispone de cifras de benchmarks de terceros para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo esta especializado en la tipografia romana y cursiva de impresos legales venecianos de la decada de 1570; su rendimiento fuera de ese dominio (otros impresos, manuscritos, otras epocas) no esta garantizado ni documentado.
- Solo soporta latin como idioma declarado; no hay evidencia de comportamiento en otros idiomas.
- Es un modelo de baselines: requiere lineas con linea base y poligono; no funciona sobre imagenes de pagina completas sin segmentacion previa.
- Los errores residuales se concentran en guiones de final de linea, espacios omitidos y letras sueltas dentro de palabras; en un uso editorial hay que revisar esos casos.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el modelo se distribuye como pesos de kraken y su uso esta ligado a esa herramienta y a sus dependencias.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede expandir abreviaturas de forma incorrecta o normalizar de manera no deseada si el original difiere de las convenciones de la edicion.
- El modelo se entreno con las convenciones editoriales del proyecto Consilia; el texto de salida no es una transcripcion diplomatica literal, sino una normalizacion segun esas reglas.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- El modelo se creo y actualizo en octubre de 2026; su ecosistema y mantenimiento a largo plazo no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mschonhardt/consilia-baldus-venice1575-kraken-rec
- Dataset: https://huggingface.co/datasets/mschonhardt/consilia-baldus-venice1575-pagexml
- Modelo de segmentacion: https://huggingface.co/mschonhardt/consilia-baldus-venice1575-kraken-seg
- Portal Consilia: https://dekm-tud.github.io/coding-consilia/
- Repositorio de la edicion: https://github.com/dekm-tud/coding-consilia
- McCATMuS (DOI): https://doi.org/10.5281/zenodo.13788177
- DOI del modelo: https://doi.org/10.57967/hf/11319
