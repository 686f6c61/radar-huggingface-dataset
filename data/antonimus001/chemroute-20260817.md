# Antonimus001/ChemRoute-20260817

## Resumen

ChemRoute-20260817 es un adaptador LoRA congelado (PEFT) sobre Qwen3-VL-4B-Instruct, desarrollado por el usuario Antonimus001 para el servicio de analisis de figuras ChemRoute. Su proposito es especializar un modelo vision-lenguaje generalista en la interpretacion de figuras cientificas y sus pies de foto dentro de los dominios de quimica y ciencia de materiales, devolviendo un objeto JSON compacto con metadatos estructurados sobre la figura.

El adaptador no es un modelo autonomo: requiere descargar por separado el modelo base Qwen3-VL-4B-Instruct (revision fijada `ebb281ec70b05090aa6165b016eac8ec08e71b17`) y sus dependencias. La salida cubre relevancia y tipo de figura, estructura de paneles, fuentes de evidencia, objetivos de extraccion, indicadores de calidad y, opcionalmente, cajas delimitadoras de regiones en coordenadas enteras de 0 a 1000 con origen en la esquina superior izquierda.

Su relevancia es acotada pero concreta: demuestra un patron de adaptacion ligera (LoRA) para convertir un VLM de 4B en un extractor estructurado de figuras cientificas, con un contrato de tarea congelado (prompt y esquema JSON incluidos en el repositorio). La validacion publicada es muy limitada (16 ejemplos de validacion y 40 de prueba ciega), por lo que debe tratarse como un prototipo de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible (el adaptador LoRA no declara numero de parametros; el base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones que soporte la libreria) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta tambien a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); requiere los pesos del base Qwen3-VL-4B-Instruct |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-VL-4B-Instruct, un transformer multimodal de tipo vision-lenguaje que procesa imagen y texto conjuntamente mediante un procesador (`AutoProcessor`) y un template de chat. El adaptador en si es un LoRA de PEFT (libreria `peft`), con el modelo base congelado; la carga se realiza con `PeftModel.from_pretrained` sobre la instancia de `Qwen3VLForConditionalGeneration`.

El checkpoint seleccionado es `formal-lr1e-4-seed42::checkpoint-30`, con tasa de aprendizaje 1e-4 y semilla 42. El split de desarrollo congelado contenia 115 ejemplos de figuras derivados de anotacion humana y el de validacion 16 ejemplos, separados por familia de articulos. La seleccion del modelo se hizo sobre el conjunto de validacion. Se rechazo otro candidato entrenado con un delta de anotacion, que no esta representado por este adaptador. No se documentan volumen de tokens, composicion del dataset, ni uso de RLHF/DPO.

Como innovacion practica, el repositorio incluye el prompt de entrenamiento y el esquema JSON con el fin de preservar el contrato de tarea congelado, de modo que las aplicaciones puedan validar la salida de forma determinista. Tambien se documenta la procedencia: el SHA-256 del fichero `adapter_model.safetensors` es `a131177092aab1475fbc80ed83171db3315e0e470fe968dd75b27621c33f9065`; el valor `a4b6bfed22bde348c92624cabf568b5115e17e102642737152dd35c65c445a49` corresponde a un digest del arbol de checkpoints, no al fichero de pesos.

## Capacidades

- Analisis de figuras cientificas de quimica y ciencia de materiales junto con su pie de foto.
- Prediccion de un objeto JSON compacto con relevancia y tipo de figura.
- Deteccion de estructura de paneles dentro de la figura.
- Identificacion de fuentes de evidencia y objetivos de extraccion.
- Emision de indicadores de calidad sobre la figura analizada.
- Generacion opcional de cajas delimitadoras de regiones en coordenadas enteras de 0 a 1000 (origen en la esquina superior izquierda).
- Entrada multimodal imagen-texto mediante el pipeline `image-text-to-text`.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion estructurada de metadatos de figuras en repositorios cientificos: el adaptador recibe la imagen y el pie de foto y devuelve JSON con tipo de figura, paneles y objetivos de extraccion, lo que permite indexar figuras de forma automatica en un pipeline de publicaciones.
- Enrutamiento de figuras en un servicio de analisis documental: la prediccion de relevancia y tipo de figura sirve para decidir que figuras requieren revision humana o procesamiento posterior mas costoso.
- Control de calidad editorial: los indicadores de calidad y la estructura de paneles permiten marcar figuras ambiguas, con paneles mal definidos o con evidencia insuficiente antes de su publicacion.
- Anotacion asistida de corpus de quimica y materiales: el JSON generado puede precargar herramientas de anotacion humana, reduciendo el trabajo manual en la creacion de datasets de figuras cientificas.
- Localizacion de regiones de interes: las cajas delimitadoras en escala 0-1000 permiten recortar paneles o regiones concretas para su posterior OCR o analisis especializado.
- Prototipado de asistentes de lectura de articulos: integrado en un visor de PDF, el adaptador puede resumir la estructura de una figura y senalar que evidencia aporta dentro del articulo.
- Evaluacion comparativa de extractores de figuras: al incluir prompt y esquema congelados, sirve como referencia reproducible en experimentos de extraccion estructurada multimodal.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Tasa de parseo JSON | 1.0 | 40 ejemplos de entrada ciega |
| Tasa de validez de esquema | 0.675 | 40 ejemplos de entrada ciega |
| Precision de tarea ciega | no calculada (sin respuestas de referencia en el host de entrenamiento) | 40 ejemplos de entrada ciega |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores proceden de un conjunto muy pequeno y, segun el autor, no establecen el rendimiento en dominios cientificos o publicaciones nuevas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 4B parametros y el adaptador LoRA anade una sobrecarga pequena. En bfloat16 el base requiere del orden de 8-10 GB solo para pesos, mas activaciones y cache, por lo que se recomienda al menos 16 GB de VRAM para uso comodo.
- GPU recomendadas: no documentadas por el autor; por tamano del base, resultan adecuadas GPU de 16-24 GB o superiores (RTX 4090, A100, H100). No se confirma compatibilidad con GPU de consumo de gama baja.
- Cabe en GPU de consumo: probable en tarjetas con 16 GB o mas en bfloat16, y potencialmente en 8-12 GB con cuantizacion del base; no verificado por el autor.
- Opciones de despliegue: carga mediante `transformers` + `peft` + `accelerate` (entorno reportado: PyTorch 2.6.0+cu124, Transformers 4.57.1, PEFT 0.17.1, Accelerate 1.7.0, Pillow 11.3.0, huggingface-hub 0.36.2). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChemRoute-20260817 | LoRA sobre base de 4B | no disponible | Extraccion JSON de figuras cientificas | Apache 2.0 | Hugging Face (adaptador) |
| Qwen3-VL-4B-Instruct (base) | 4B | no disponible en la informacion | VLM generalista image-text-to-text | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en figuras cientificas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La salida JSON estructurada puede ser invalida o incorrecta; es obligatorio validar el esquema y revisar las conclusiones cientificas y las cajas delimitadoras contra la figura original.
- No debe tratarse como fuente de hechos experimentales verificados.
- La validacion se realizo con 16 ejemplos de validacion y 40 de prueba ciega; el propio autor advierte que estos resultados no establecen rendimiento en dominios cientificos o publicaciones nuevas.
- La precision de tarea ciega no se calculo por ausencia de respuestas de referencia en el host de entrenamiento.
- Es un adaptador, no un modelo autonomo: requiere el base Qwen3-VL-4B-Instruct y sus dependencias, sujeto a la licencia del base.
- El ejemplo de carga del repositorio no ha sido validado de forma independiente contra una copia recien descargada del Hub.
- El ejemplo de codigo de la model card referencia el ID `quxiaoqiya/ChemRoute-20260817`, distinto del ID publicado `Antonimus001/ChemRoute-20260817`; debe usarse el ID publicado.
- La revision del base esta fijada a `ebb281ec70b05090aa6165b016eac8ec08e71b17`; los pesos del base no se rehashearon durante el empaquetado.
- No se documentan sesgos conocidos, cobertura idiomatica ni limites de contexto.
- El uso comercial esta permitido por Apache 2.0, pero condicionado a los terminos del modelo base.
- La compatibilidad y los requisitos de hardware deben verificarse en el entorno de destino.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Antonimus001/ChemRoute-20260817
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision del base fijada: `ebb281ec70b05090aa6165b016eac8ec08e71b17`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
