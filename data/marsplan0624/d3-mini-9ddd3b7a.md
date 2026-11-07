# marsplan0624/d3-mini-9ddd3b7a

## Resumen

d3-mini-9ddd3b7a es un fine-tune del modelo Qwen/Qwen3.5-4B publicado por el usuario marsplan0624 en Hugging Face. Segun la model card, se trata de un "body" del pool d3-mini: conserva los pesos completos de lenguaje y vision del modelo base en el layout de Qwen3.5-4B, pero ha sido ajustado con un LoRA de rango 16 sobre un conjunto de datos de preguntas de decision etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit). El modelo base es un transformer de aproximadamente 4.540 millones de parametros.

El modelo se presenta como un componente de un sistema mayor denominado Zils, y la propia model card advierte de que los pesos solo son utilizables a traves del runtime fijado del pool ("pinned chassis runtime") y que este repositorio no incluye capa de respuesta ni codigo de ejecucion. Es decir, no es un modelo autonomo listo para usar con `transformers` o `vLLM` de forma convencional, sino una pieza de un pipeline propietario.

La relevancia de esta ficha es limitada: se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks, sin idiomas declarados y sin documentacion tecnica detallada mas alla de la model card. Resulta util como referencia para quien investigue el ecosistema Zils o quiera entender el formato de estos "soup bodies", pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); no se detalla mas |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 mil millones de parametros. Sobre esa base, el autor aplico un LoRA de rango 16 y lo fusiono en los pesos, de modo que el repositorio contiene los pesos completos (lenguaje y vision) ya modificados, no un adaptador separado. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

El entrenamiento se describe como orientado a "decision questions" etiquetadas por resultados reales: reversiones y revisiones de Wikipedia, categorias de arXiv, resultados de Stack Exchange y merges de Gerrit. Es un enfoque de aprendizaje supervisado sobre senales de resultado (outcome labels), no sobre preferencias humanas explicitas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones propias.
- Vision: la model card indica que se conservan los pesos de vision del modelo base.
- Prediccion de decisiones: el ajuste esta orientado a responder preguntas de decision binaria o categorica con etiquetas derivadas de resultados reales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Clasificacion de resultados en plataformas colaborativas: el modelo puede usarse para estimar si una edicion de Wikipedia sera revertida o si un cambio en Gerrit se fusionara, dado que fue entrenado con ese tipo de etiquetas de resultado.
- Priorizacion de revisiones en arXiv: asignar o predecir categorias de articulos cientificos a partir de su contenido, aprovechando el entrenamiento sobre etiquetas de categorias de arXiv.
- Moderacion asistida en Stack Exchange: estimar la probabilidad de que una pregunta o respuesta sea aceptada, cerrada o eliminada, integrandolo en un flujo de triaje.
- Investigacion sobre aprendizaje con senales de resultado: util como referencia para estudiar como un LoRA de rango 16 sobre un modelo de 4,5 B se comporta en tareas de decision con etiquetas reales.
- Componente de un pipeline Zils: dentro del runtime propietario del pool d3-mini, como capa de decision previa a la generacion de respuestas.
- Experimentacion con modelos base pequenos en vision-lenguaje: al conservar los pesos de vision, puede servir para prototipos de clasificacion multimodal en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4,54 B en safetensors, los pesos en fp16 ocupan aproximadamente 9,1 GB (coincide con el tamano del repo). En fp32 serian unos 18 GB; en cuantizaciones de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 para fp16 sin cuantizar; una RTX 3090/4080 (16-24 GB) seria suficiente para fp16.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB en fp16 con offload parcial, o 8 GB con cuantizacion 8 bits.
- Opciones de despliegue: vLLM, TGI o llama.cpp podrian cargar los pesos en teoria, pero la model card advierte de que el modelo solo es usable a traves del runtime fijado del pool, por lo que el despliegue estandar no esta garantizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| d3-mini-9ddd3b7a | 4,54 B | no disponible | apache-2.0 | Hugging Face (0 descargas) | Fine-tune de Qwen3.5-4B para decisiones; requiere runtime del pool |
| Qwen/Qwen3.5-4B | aprox. 4 B | no disponible en esta ficha | no disponible | Hugging Face | Modelo base; uso general con transformers/vLLM |
| Otros fine-tunes de Qwen3.5-4B | variable | variable | variable | Hugging Face | No se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos de Wikipedia, arXiv, Stack Exchange y Gerrit, puede heredar sesgos de esas comunidades.
- Riesgo de alucinacion: no evaluado; el ajuste sobre etiquetas de resultado no garantiza calibracion en dominios distintos.
- Limitaciones de contexto o idioma: no se declaran idiomas ni longitud de contexto; se desconoce el comportamiento fuera del ingles o de los dominios de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la model card restringe el uso a traves del runtime del pool, lo que puede entrar en conflicto con la licencia declarada; conviene verificar con el autor.
- Caveat para produccion: el repositorio no incluye capa de respuesta ni codigo de ejecucion; no es un modelo autonomo y su uso en produccion requiere el runtime propietario de Zils, del que no se ofrece documentacion publica.
- Publicacion sin traccion: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marsplan0624/d3-mini-9ddd3b7a
- Perfil del autor: https://huggingface.co/marsplan0624
- Datasets del autor: https://huggingface.co/marsplan0624/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
