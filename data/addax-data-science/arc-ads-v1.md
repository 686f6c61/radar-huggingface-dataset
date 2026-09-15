# Addax-Data-Science/ARC-ADS-v1

## Resumen

ARC-ADS-v1 es un repositorio publicado por Addax Data Science en HuggingFace cuyo contenido, segun la propia model card, consiste en modelos de codigo abierto redistribuidos para facilitar su integracion con AddaxAI, la herramienta de la organizacion. No se trata, por tanto, de un modelo entrenado por el autor del repositorio, sino de una copia espejo (mirror) de uno o varios modelos de terceros. La model card indica explicitamente que cada modelo conserva su licencia original, que se incluyen los ficheros de licencia correspondientes y que el usuario debe revisar y cumplir las condiciones de cada licencia antes de usarlo.

El README no aporta informacion tecnica alguna: el bloque de metadatos YAML aparece vacio (`{}`) y el cuerpo del documento se limita al aviso de redistribucion, la atribucion y un enlace al model zoo de AddaxAI para consultar propietario, licencia, cita y enlaces del modelo original. En consecuencia, no hay datos publicados sobre arquitectura, numero de parametros, longitud de contexto, idiomas soportados, proceso de entrenamiento ni resultados de evaluacion.

El unico dato cuantitativo disponible es el tamano del repositorio, 0,4 GB, lo que resulta compatible con pesos de un modelo relativamente pequeno (del orden de decenas o unos pocos cientos de millones de parametros en precision completa), si bien esta cifra no permite determinar el numero de parametros ni la arquitectura. El repositorio se creo y actualizo el 15 de septiembre de 2026, registra 0 descargas y 0 likes en el momento de la consulta, y no tiene pipeline declarado ni licencia ni idiomas etiquetados en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en HuggingFace; la model card remite a los ficheros de licencia incluidos en el repositorio y al model zoo de AddaxAI |
| Formato de pesos | no disponible (el repositorio ocupa 0,4 GB; no se detalla el formato) |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Autor en HuggingFace | Addax-Data-Science |
| ID del repositorio | Addax-Data-Science/ARC-ADS-v1 |
| Tipo de publicacion | redistribucion de modelos de terceros para AddaxAI |
| Tamano del repositorio | 0,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la informacion disponible. La model card no describe el tipo de red (transformer, MoE, SSM, hibrida, CNN u otra), ni el numero de capas, dimensiones ocultas, mecanismos de atencion, tokenizador o cualquier otro detalle estructural.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF, DPO u otras tecnicas de alineamiento, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio no contiene, segun la informacion disponible, ninguna descripcion del proceso de entrenamiento del modelo subyacente; el texto de la model card se limita a declarar que se redistribuye un modelo de terceros con su licencia y atribucion originales.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No consta soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- El unico proposito declarado es la integracion con AddaxAI, la plataforma del redistribuidor, sin que se detalle que tarea concreta cubre este modelo dentro de ella.

## Casos de uso

- No es posible enumerar casos de uso concretos y verificables: la informacion disponible no describe la tarea, el dominio ni las capacidades del modelo.
- Integracion con AddaxAI: segun la model card, este repositorio existe para facilitar el uso del modelo desde la plataforma AddaxAI. Se desconoce, no obstante, que funcion desempena dentro de ella.
- Evaluacion previa a adopcion: dado que no hay ficha tecnica, el unico uso responsable inmediato es la inspeccion del repositorio (ficheros de licencia, pesos y configuracion) y la consulta del model zoo de AddaxAI para identificar el modelo original antes de plantear cualquier despliegue.
- Trazabilidad de licencias: el repositorio puede servir para auditar que modelo de terceros se esta distribuyendo y bajo que condiciones, ya que incluye los ficheros de licencia originales segun la model card.
- Cualquier otro caso de uso (atencion al cliente, generacion de codigo, analisis documental, clasificacion de imagenes, etc.) queda fuera del alcance de lo documentado y no puede justificarse con la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web realizada (los resultados obtenidos corresponden a entidades homonimas sin relacion con el modelo: la gacela addax, un laboratorio podologico, un fabricante de gunitado y un distribuidor de gas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin conocer el numero de parametros ni la arquitectura no puede calcularse.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con los datos disponibles. El tamano del repositorio (0,4 GB) sugiere un modelo de dimensiones reducidas, pero se trata de una inferencia indirecta y no de un dato publicado.
- Opciones de despliegue: no disponible. No se especifica compatibilidad con vLLM, llama.cpp, Ollama, TGI, Transformers ni con ningun otro runtime.
- Latencia y throughput: no disponible.
- Nota practica: antes de planificar hardware conviene inspeccionar los ficheros del repositorio para determinar el formato real de los pesos (safetensors, GGUF, ONNX, etc.) y el numero de parametros a partir de la configuracion.

## Comparativa con modelos similares

No disponible. Al no conocerse el modelo original, su tamano, su tarea ni su licencia, no es posible establecer una comparacion rigurosa con alternativas de la misma categoria. La propia model card remite al model zoo de AddaxAI para obtener la identidad y las condiciones del modelo subyacente, que es el punto de partida necesario para cualquier comparativa.

| Aspecto | ARC-ADS-v1 | Alternativa 1 | Alternativa 2 |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Rendimiento | no disponible | no disponible | no disponible |
| Licencia | no disponible en HuggingFace | no disponible | no disponible |
| Disponibilidad | repositorio de redistribucion, 0 descargas | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe arquitectura, parametros, contexto, datos de entrenamiento ni evaluaciones, lo que impide valorar el modelo con criterios de ingenieria.
- Repositorio de redistribucion, no desarrollo propio: el modelo no ha sido entrenado por Addax Data Science; los derechos y las obligaciones derivan del licenciante original.
- Licencia indeterminada en HuggingFace: no hay licencia declarada en los metadatos. La model card indica que cada modelo conserva su licencia original en los ficheros incluidos, por lo que es imprescindible leerlos antes de cualquier uso, y en particular antes de un uso comercial.
- Riesgo de cumplimiento: el uso del modelo sin verificar la licencia original puede infringir sus terminos, incluso aunque la redistribucion se realice de forma licita.
- Sesgos y alucinacion: no evaluables. No hay estudios de sesgo, taxonomia de riesgos ni evaluaciones de fidelidad publicadas para este modelo.
- Limitaciones de contexto e idioma: no disponibles.
- Idoneidad para produccion: no acreditada. No hay resultados de evaluacion, garantias de soporte, versionado ni historial de mantenimiento que respalden su uso en entornos productivos.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni incidencias reportadas que permitan contrastar su comportamiento.
- Fechas: el repositorio figura creado y actualizado el 2026-09-15, apenas diez segundos despues de su creacion, lo que sugiere una publicacion automatizada sin documentacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Addax-Data-Science/ARC-ADS-v1
- Addax Data Science: https://addaxdatascience.com/
- AddaxAI: https://addaxdatascience.com/addaxai/
- Model zoo de AddaxAI (propietario, licencia, cita y enlaces del modelo original): https://docs.addaxai.com/docs/reference/model-zoo
- Resultados de busqueda web obtenidos: no relevantes. Corresponden a entidades homonimas sin relacion con el modelo (articulo sobre la gacela addax en Wikipedia, Laboratoire ADDAX, Addax Gunitage y Addax Gaz). No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a ARC-ADS-v1.
