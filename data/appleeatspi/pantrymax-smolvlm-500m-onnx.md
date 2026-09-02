# appleeatspi/pantrymax-smolvlm-500m-onnx

## Resumen

PantryMax SmolVLM-500M ONNX es un modelo de vision-lenguaje de 500 millones de parametros, resultado de un fine-tuning LoRA sobre el modelo HuggingFaceTB/SmolVLM-500M-Instruct, publicado por el desarrollador appleeatspi. Esta disenado para la extraccion de etiquetas de productos y paginas de recetas directamente en el navegador, dentro de la aplicacion PantryMax. Se distribuye exclusivamente en formato ONNX cuantizado a 4 bits (q4 y q4f16) para su ejecucion con Transformers.js y ONNX Runtime Web.

El modelo combina un encoder de vision y un decoder de lenguaje basados en la arquitectura Idefics3. El adaptador LoRA se fusiono en el decoder base antes de la cuantizacion weight-only a 4 bits, mientras que el encoder de vision y los embeddings se mantienen como exportaciones ONNX compatibles con el modelo original. Su principal valor es permitir inferencia 100 % local en el navegador, sin necesidad de servidores, con salida estructurada mediante decodificacion restringida por esquema JSON.

La relevancia de este modelo radica en su enfoque en privacidad y despliegue en el borde: al ejecutarse en el cliente, las imagenes de productos y recetas nunca abandonan el dispositivo del usuario. Ademas, al estar cuantizado y optimizado para runtime web, puede operar en hardware de consumo estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (encoder de vision + decoder de lenguaje SmolLM) |
| Parametros totales | 500 millones (aproximadamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4 (fallback) y q4f16 (para dispositivos con soporte de shader float16) |
| Idiomas soportados | Multilingue |
| Licencia | other (el modelo base es Apache-2.0; este release no garantiza que todas las obligaciones de los datos de entrenamiento esten exentas) |
| Formato de pesos | ONNX (ONNX Runtime Web) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Idefics3, que combina un encoder de vision con un decoder de lenguaje de la familia SmolLM. El repositorio contiene unicamente activos de runtime para navegador: los ficheros `onnx/*_q4f16.onnx` para dispositivos con soporte de shader float16 y `onnx/*_q4.onnx` como alternativa compatible. Los ficheros `decoder_model_merged_*` incorporan el adaptador LoRA de PantryMax fusionado en el decoder base antes de la cuantizacion weight-only a 4 bits. El encoder de vision y los ficheros de embeddings son exportaciones ONNX compatibles con el modelo base.

El fine-tuning LoRA se realizo localmente con ejemplos de etiquetas de productos y paginas de recetas condicionados por tarea, con datos de procedencia mixta. El modelo base, HuggingFaceTB/SmolVLM-500M-Instruct, se publica bajo licencia Apache-2.0. La verificacion de reproduccion incluyo la comprobacion de los 64 objetivos de proyeccion LoRA y la validacion de que cada salida q4/q4f16 contiene 225 operaciones `MatMulNBits` y carga correctamente en ONNX Runtime.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Extraccion de informacion de etiquetas de productos y paginas de recetas a partir de imagenes.
- Respuesta a preguntas visuales (visual question answering).
- Generacion de texto condicionada por tarea (`product` o `recipe`) con decodificacion restringida a un esquema JSON.
- Inferencia completamente local en el navegador via Transformers.js y ONNX Runtime Web.
- Soporte multilingue.
- Salida estructurada y parseable mediante esquemas JSON definidos por la aplicacion.

## Casos de uso

- Gestion de despensa automatizada: PantryMax puede fotografiar etiquetas de productos y extraer automaticamente nombre, marca, cantidad y fecha de caducidad, actualizando el inventario sin intervencion manual.
- Digitalizacion de recetas: el usuario fotografia una pagina de receta y el modelo extrae ingredientes, cantidades e instrucciones en formato JSON estructurado para su almacenamiento y busqueda posterior.
- Consulta de informacion nutricional: a partir de la foto de una etiqueta, el modelo extrae valores como calorias, grasas, proteinas y carbohidratos, utiles para aplicaciones de dietetica y seguimiento de consumo.
- Deteccion de alergenos: la extraccion de ingredientes de etiquetas permite a aplicaciones de salud alertar sobre alergenos presentes en el producto, aunque el usuario debe revisar los valores extraidos.
- Accesibilidad para personas con discapacidad visual: una aplicacion movil o web puede leer en voz alta la informacion de una etiqueta fotografiada, gracias a la inferencia local y sin enviar datos a servidores externos.
- Comparacion de productos: el usuario fotografia varias etiquetas y la aplicacion compara precios por unidad, contenido nutricional o tamanos de envase, todo procesado en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Disenado para inferencia en navegador, por lo que se ejecuta en hardware de consumo estandar con soporte de WebGPU o WebGL.
- La variante `q4f16` requiere dispositivos con soporte de shader float16; la variante `q4` actua como fallback compatible.
- Tamano del repositorio: 0.8 GB, que incluye los pesos ONNX cuantizados, el processor, el tokenizer y la configuracion del chat template.
- Despliegue mediante Transformers.js con ONNX Runtime Web; no requiere servidor de inferencia dedicado.
- No se proporcionan datos de latencia ni throughput especificos. Al ser un modelo de 500 millones de parametros cuantizado a 4 bits, es viable en portatiles y moviles modernos con aceleracion GPU web.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PantryMax SmolVLM-500M ONNX | 500M | no disponible | other | ONNX q4/q4f16 | Fine-tune LoRA para etiquetas y recetas, inferencia en navegador |
| HuggingFaceTB/SmolVLM-500M-Instruct | 500M | no disponible | Apache-2.0 | Original (safetensors, ONNX) | Modelo base, generico, sin fine-tune de dominio |

No se dispone de informacion suficiente sobre otros modelos comparables en la misma categoria de vision-lenguaje pequeno para navegador.

## Limitaciones y advertencias

- El modelo no debe tratarse como una autoridad; la decodificacion estructurada hace que la salida sea parseable, pero no necesariamente correcta de hecho. Los valores extraidos deben ser revisados por el usuario.
- La licencia es `other`: el modelo base es Apache-2.0, pero este release no garantiza que todas las obligaciones de los datos de entrenamiento de procedencia mixta esten exentas. Los reutilizadores son responsables de revisar la procedencia del modelo base y de los datos de entrenamiento antes de la redistribucion o el uso comercial.
- No se incluyen imagenes de origen, anotaciones, prompts con contenido privado, generaciones en bruto ni checkpoints del adaptador en el repositorio.
- El modelo solo debe extraer contenido visiblemente soportado; no es adecuado para decisiones de alto riesgo.
- No se proporcionan datos de benchmarks, por lo que el rendimiento cuantitativo en tareas estandar no puede verificarse.
- La longitud de contexto no esta documentada en la informacion disponible, lo que limita la evaluacion de su capacidad para manejar paginas de recetas extensas o multiples imagenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/appleeatspi/pantrymax-smolvlm-500m-onnx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Repositorio de SmolLM y SmolVLM: https://github.com/huggingface/smollm
- Documentacion de SmolVLM-500M-Instruct: https://docs.m5stack.switch-science.com/en/stackflow/models/smoivlm-500m-instruct
- ONNX Model Zoo: https://github.com/onnx/models
