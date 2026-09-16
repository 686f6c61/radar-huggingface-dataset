# aascott/Llama-Guard-3-1B-Confusable-Guard-LoRA

## Resumen

Llama-Guard-3-1B-Confusable-Guard-LoRA es un adaptador PEFT/LoRA desarrollado por el usuario aascott sobre el modelo base meta-llama/Llama-Guard-3-1B. Su objetivo es mejorar la robustez del clasificador de seguridad frente a confusables Unicode y otras ofuscaciones a nivel de caracter, es decir, textos que sustituyen caracteres por homoglifos o variantes tipograficas para evadir filtros de contenido sin cambiar el significado. El repositorio contiene unicamente los pesos del adaptador, no un modelo completo, y su uso requiere acceso al modelo base bajo la licencia Llama 3.2.

El adaptador se entrena con el modelo base congelado: un LoRA de rango 16 aplicado a todas las capas lineales durante dos epocas, usando entradas limpias y variantes Unicode deterministas con etiquetas generadas por el propio modelo base congelado (destilacion). El tamano del repositorio es de 0,1 GB y la unica lengua declarada es el ingles.

Su relevancia actual es operativa: los clasificadores de seguridad se despliegan como primera barrera en aplicaciones de chat y APIs, y las tecnicas de evasion por homoglifos son un vector conocido y barato de ejecutar. El adaptador declara mejoras sustanciales en invariancia a la ofuscacion (89,34 % de exactitud binaria frente a 74,51 % del base en el conjunto de retencion de 910 registros) con un coste minimo de regresion en texto limpio (99,23 % frente a 100 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Llama 3.2 1B, variante Llama Guard 3) |
| Parametros totales | Modelo base de 1B de parametros mas los pesos del adaptador (tamano total del adaptador no disponible) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en); corpus de entrenamiento y evaluacion principalmente en ingles |
| Licencia | Llama 3.2 Community License, sujeta a la politica de uso aceptable del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato HuggingFace |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 sobre meta-llama/Llama-Guard-3-1B, un transformer decoder-only de 1.000 millones de parametros especializado en clasificacion de seguridad. El adaptador se aplica a todas las capas lineales del modelo base, que permanece congelado durante el entrenamiento. Se entreno durante dos epocas con entradas limpias y variantes Unicode deterministas, utilizando como etiquetas las predicciones del modelo base congelado sobre las entradas limpias (esquema de destilacion o teacher forzado). La configuracion completa y la procedencia del entrenamiento se registran en el fichero `run_manifest.json` del repositorio.

La innovacion tecnica no esta en la arquitectura, sino en el objetivo de entrenamiento: se busca invariancia a transformaciones a nivel de caracter (confusables Unicode y ofuscaciones relacionadas) sin degradar el comportamiento sobre texto limpio. La evaluacion se diseno para medir esa invariancia frente a la prediccion del base sobre la entrada limpia, no frente a etiquetas humanas independientes. El repositorio de codigo asociado es `aauscott/confusable-text-guard`.

## Capacidades

- Clasificacion de seguridad binaria (seguro/inseguro) en el formato de prompt y salida de Llama Guard 3.
- Deteccion de contenido potencialmente danino enmascarado mediante confusables Unicode y ofuscaciones a nivel de caracter.
- Mantenimiento del comportamiento del modelo base sobre texto limpio, con una regresion declarada minima.
- Generacion de texto conversacional, heredada de la naturaleza decoder-only del modelo base.
- Ejecucion como adaptador acoplable y desacoplable sobre el modelo base, lo que permite comparar con y sin adaptador sin duplicar pesos.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- Capacidad multilingue: no disponible; el modelo se declara unicamente en ingles.

## Casos de uso

- Moderacion de contenido en APIs de chat: el adaptador se acopla sobre Llama Guard 3 1B para clasificar mensajes de entrada antes de enviarlos al modelo generativo, reduciendo el numero de intentos de evasion que emplean homoglifos cirilicos, griegos o de ancho completo.
- Filtrado previo en plataformas de contenido generado por usuarios: se aplica como etapa de pre-moderacion sobre comentarios y publicaciones, donde los atacantes suelen insertar caracteres Unicode similares para esquivar listas de palabras prohibidas.
- Evaluacion de robustez de sistemas de seguridad existentes: sirve como referencia para medir cuanto degrada un clasificador cuando el texto se somete a transformaciones Unicode deterministas, comparando su salida con la del modelo base.
- Normalizacion de entradas en pipelines de moderacion: puede integrarse junto a un paso de normalizacion NFKC/NFC para cubrir tanto la normalizacion de caracteres como la clasificacion semantica de seguridad.
- Investigacion en seguridad de LLM: el adaptador y su conjunto de evaluacion permiten estudiar el equilibrio entre invariancia a ofuscacion y tasa de falsos positivos en texto limpio, un compromiso habitual en clasificadores de seguridad.
- Proteccion de sistemas de atencion al cliente automatizada: actua como filtro de entrada en conversaciones multi-turno, bloqueando intentos de obtener instrucciones prohibidas mediante la sustitucion de caracteres clave.
- Auditoria y monitorizacion de logs: se puede ejecutar sobre trazas historicas de conversaciones para detectar mensajes ofuscados que los filtros originales dejaron pasar, dado el bajo requisito de recursos de un modelo de 1B.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de invariancia a ofuscacion del autor, medidos sobre un conjunto de retencion reservado de 910 registros construido a partir de 130 grupos de origen (130 entradas limpias y seis variantes confusables por origen). El objetivo de cada grupo es la prediccion del modelo base congelado sobre su entrada limpia, por lo que miden invariancia, no exactitud frente a etiquetas humanas independientes. La revision del modelo base empleada es `acf7aafa60f0410f8f42b1fa35e077d705892029`.

| Subconjunto | Modelo | Exactitud binaria | Recall de inseguro | Tasa de falsos positivos en seguro |
|---|---|---:|---:|---:|
| Todos (910) | Base | 74,51 % | 63,74 % | 14,73 % |
| Todos (910) | Adaptador | 89,34 % | 81,54 % | 2,86 % |
| Confusables (780) | Base | 70,26 % | 57,69 % | 17,18 % |
| Confusables (780) | Adaptador | 87,69 % | 78,72 % | 3,33 % |
| Limpio (130) | Base | 100,00 % | 100,00 % | 0,00 % |
| Limpio (130) | Adaptador | 99,23 % | 98,46 % | 0,00 % |

Ambos modelos produjeron cero salidas invalidas en el conjunto de retencion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 1B: aproximadamente 2,5 GB en fp16, en torno a 1,2 GB en int8 y menos de 1 GB en cuantizacion de 4 bits, mas una sobrecarga reducida por los pesos del adaptador (el repositorio completo ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo base en precision reducida; para fp16 sin cuantizar bastan 6-8 GB. GPU de datacenter (A100, H100, L40S) solo tienen sentido para despliegues con alta concurrencia.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en hardware integrado con suficiente memoria compartida.
- Opciones de despliegue: transformers mas peft para cargar el adaptador sobre el base (metodo documentado en la model card); vLLM y TGI admiten adaptadores LoRA en servidores de inferencia; llama.cpp y Ollama son viables si se fusionan los pesos del adaptador con el modelo base y se convierten a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud binaria (todos, 910) | Recall inseguro | Falsos positivos en seguro | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Llama-Guard-3-1B-Confusable-Guard-LoRA (adaptador) | 1B + LoRA rango 16 | No disponible | 89,34 % | 81,54 % | 2,86 % | Llama 3.2 Community | HuggingFace, requiere modelo base con acceso restringido |
| Llama-Guard-3-1B (base, congelado) | 1B | No disponible | 74,51 % | 63,74 % | 14,73 % | Llama 3.2 Community | HuggingFace, acceso restringido (gated) |
| Llama Guard 3 8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Llama 3.2 Community | No disponible en la informacion proporcionada |
| Normalizacion Unicode previa (NFKC) mas clasificador base | No aplica (preprocesado) | No aplica | No disponible; no se aportan mediciones de esta alternativa | No disponible | No disponible | No aplica | Implementable sin dependencias de modelos |

La unica comparacion cuantitativa publicada es contra el propio modelo base. Las filas restantes se incluyen como alternativas categoricas, sin datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- El adaptador esta especializado en confusables Unicode y ofuscaciones a nivel de caracter; no sustituye a una evaluacion de seguridad mas amplia ni cubre otras tecnicas de evasion.
- Las etiquetas de evaluacion son las predicciones del modelo base sobre texto limpio, no anotaciones humanas independientes; por tanto, las cifras miden invariancia, no exactitud real frente a contenido danino.
- Las mejoras agregadas pueden ocultar regresiones en categorias concretas de seguridad, tal como advierte el propio autor.
- El corpus de entrenamiento y evaluacion es principalmente en ingles; no hay garantias de comportamiento en otros idiomas.
- Existe una regresion medible en texto limpio: 99,23 % de exactitud binaria y 98,46 % de recall de inseguro frente al 100 % del modelo base en el subconjunto limpio de 130 registros.
- La licencia es la Llama 3.2 Community License, que impone restricciones de uso comercial y obligaciones de atribucion; el adaptador queda ademas sujeto a la politica de uso aceptable del modelo base.
- El modelo base es de acceso restringido (gated): es necesario solicitar acceso en HuggingFace y aceptar la licencia de Meta antes de poder usar el adaptador.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, dado que el modelo se emplea como clasificador y no como generador abierto en la evaluacion presentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en septiembre de 2026; se trata de un artefacto sin validacion comunitaria independiente.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/aascott/Llama-Guard-3-1B-Confusable-Guard-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-1B
- Codigo de entrenamiento y evaluacion: https://github.com/aauscott/confusable-text-guard
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes al modelo (corresponden a paginas de ayuda de inicio de sesion de Gmail).
