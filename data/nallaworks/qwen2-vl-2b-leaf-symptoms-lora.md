# nallaworks/qwen2-vl-2b-leaf-symptoms-lora

## Resumen

El modelo `nallaworks/qwen2-vl-2b-leaf-symptoms-lora` es un adaptador LoRA sobre el modelo vision-lenguaje Qwen2-VL-2B-Instruct, desarrollado por el autor A. L. R. Siriani (cuenta nallaworks) en el marco de un estudio sobre la brecha entre laboratorio y campo en la lectura estructurada de sintomas foliares. El adaptador recibe una fotografia de una hoja de planta y devuelve un objeto JSON con la especie, el estado (sano o enfermo), la condicion concreta y una confianza autodeclarada, sobre un espacio cerrado de 27 clases que cubren 13 especies de cultivo.

El modelo resuelve un problema acotado pero relevante en agricultura de precision: transformar una imagen de hoja en una etiqueta estructurada y consumible por software, en lugar de una descripcion en lenguaje natural. Al estar construido sobre un VLM de 2 mil millones de parametros con licencia Apache 2.0, resulta desplegable en hardware de consumo, lo que lo hace accesible para investigacion y para prototipos de triaje con revision humana.

La relevancia actual del adaptador radica en que forma parte de un estudio comparativo publicado con codigo, predicciones y todos los adaptadores del trabajo en Zenodo, lo que permite reproducir los resultados y comparar el comportamiento en imagenes de laboratorio (PlantVillage) frente a imagenes de campo (PlantDoc, PlantWild y fotografias de granja del conjunto CCMT). El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2-VL-2B-Instruct (transformer vision-lenguaje) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2-VL-2B-Instruct tiene 2 mil millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2-VL-2B-Instruct) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors (adaptador LoRA) y la inferencia de referencia usa bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre Qwen2-VL-2B-Instruct, un modelo vision-lenguaje que combina un codificador de imagenes con un transformer de lenguaje. El entrenamiento se realizo durante una sola epoca sobre 6.390 imagenes procedentes de PlantVillage (imagenes de laboratorio) y PlantDoc (imagenes de campo), en la condicion que el autor denomina "PV+PD". Se uso una tasa de aprendizaje de 1e-4 y el entrenamiento completo duro 49 minutos en una RTX 5060 Ti, con un pico de memoria de 5,8 GB. Los detalles completos estan en los ficheros `train_meta.json` y `train_log.jsonl` del repositorio.

La innovacion tecnica del trabajo no reside en la arquitectura, sino en el diseno del formato de salida: el modelo se entrena para emitir un JSON estructurado con cuatro campos (especie, estado, condicion y confianza) sobre un espacio cerrado de 27 clases. Las imagenes se redimensionan de modo que el lado mas largo mida 768 pixeles, y el modelo debe recibir exactamente el mismo prompt que se uso en entrenamiento (disponible en `prompt.txt`). No se documenta en la informacion proporcionada el uso de RLHF, DPO ni de tecnicas de decodificacion especulativa.

## Capacidades

- Lectura estructurada de sintomas foliares: dada una fotografia de hoja, devuelve un JSON con `species`, `status`, `condition` y `confidence`.
- Clasificacion sobre 27 clases que cubren 13 especies: apple, bell pepper, blueberry, cherry, corn, grape, peach, potato, raspberry, soybean, squash, strawberry y tomato.
- Distincion entre hojas sanas y enfermas, y entre enfermedades de una misma especie.
- Generacion de texto e imagen-a-texto heredada del modelo base Qwen2-VL-2B-Instruct.
- Capacidad multilingue limitada al ingles segun la model card; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito en la informacion proporcionada.

## Casos de uso

- Triaje de campo con revision humana: un tecnico fotografia una hoja y el modelo devuelve una etiqueta estructurada que se almacena en una base de datos; la prediccion se marca como candidata y se revisa antes de cualquier decision agronomica.
- Preetiquetado de conjuntos de datos agricolas: el adaptador genera etiquetas JSON sobre lotes de imagenes de campo, que despues se corrigen manualmente, reduciendo el coste de anotacion en proyectos de vision por computador.
- Prototipos de aplicaciones moviles de diagnostico: al ejecutarse sobre un VLM de 2B con cuantizacion, puede desplegarse en GPUs de consumo o en estaciones locales, lo que permite demostraciones sin depender de servicios en la nube.
- Investigacion sobre la brecha laboratorio-campo: el adaptador sirve como linea base reproducible para comparar el rendimiento de VLMs en PlantVillage frente a PlantDoc, PlantWild y CCMT, tal como hace el estudio de origen.
- Monitorizacion de invernaderos y parcelas experimentales: integrado en un pipeline de captura periodica, el modelo puede generar alertas estructuradas sobre cambios de estado de las hojas para su inspeccion posterior.
- Filtrado y priorizacion de imagenes en plataformas de extension agraria: las fotografias enviadas por agricultores se clasifican automaticamente para dirigirlas al especialista adecuado, usando la confianza autodeclarada como criterio de ordenacion (con las cautelas sobre su calibracion).

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes (precision en porcentaje):

| Conjunto de evaluacion | Precision (%) |
|---|---|
| PlantVillage (laboratorio) | 79,8 |
| PlantDoc (campo) | 67,0 |
| PlantDoc, recortes de hoja | 57,6 |
| PlantWild (externo) | 64,6 |
| CCMT (fotografias de granja) | 46,3 |
| iNaturalist (solo especie) | 84,2 |

Los tamanos de los conjuntos de prueba son: PlantVillage 540, PlantDoc 236, recortes 422, PlantWild 1.256 (27 clases), CCMT 395 (4 clases) e iNaturalist 240 fotografias tomadas despues de septiembre de 2026 (12 especies). El autor indica que la mayoria de los errores restantes son confusiones entre enfermedades de la misma especie. No se proporcionan comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que basta una GPU de consumo con 8 GB o mas; el entrenamiento se realizo en una RTX 5060 Ti de 16 GB con un pico de 5,8 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (usada en el entrenamiento), asi como GPUs de consumo con al menos 8 GB; no se documentan pruebas en A100 o H100.
- Cabe en GPU de consumo: si, segun la model card, con 8 GB o mas.
- Opciones de despliegue: la referencia usa `transformers` con `AutoModelForImageTextToText`, `AutoProcessor` y `PeftModel` en bfloat16 con `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; el unico dato temporal es el entrenamiento (49 minutos, 1 epoca, 6.390 imagenes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nallaworks/qwen2-vl-2b-leaf-symptoms-lora | Adaptador LoRA sobre 2B | No disponible | VLM especializado en sintomas foliares (27 clases) | Apache 2.0 | HuggingFace y Zenodo |
| Qwen/Qwen2-VL-2B-Instruct (modelo base) | 2B | No disponible en la informacion | VLM generalista | Apache 2.0 | HuggingFace |
| Adaptadores PlantVillage-only y PlantDoc-only del mismo estudio | Sobre Qwen2-VL-2B-Instruct | No disponible | Ablaciones del mismo trabajo | Apache 2.0 (segun el estudio) | Zenodo (doi:10.5281/zenodo.23898477) |

No se dispone de datos de benchmarks comparativos frente a otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento numerica con alternativas.

## Limitaciones y advertencias

- Espacio de etiquetas cerrado: solo 27 clases, sin opcion "otro" ni "desconocido"; enfermedades o cultivos fuera de la lista (por ejemplo, roya de la soja, citricos, cafe o cana de azucar) se fuerzan a una de las clases existentes.
- La confianza autodeclarada por el modelo no esta calibrada, por lo que no debe usarse como probabilidad fiable en produccion.
- La precision en campo es limitada: 67,0 % en PlantDoc y aproximadamente el 50 % en fotografias reales de granja (CCMT, 46,3 %).
- PlantDoc y PlantWild son conjuntos recopilados de la web, lo que puede introducir sesgos de dominio y de composicion.
- El modelo esta destinado a investigacion y a triaje con revision humana; el autor advierte explicitamente que no debe usarse para diagnostico autonomo ni para decisiones de tratamiento.
- Idioma limitado al ingles segun la model card.
- Requiere usar exactamente el prompt de entrenamiento (`prompt.txt`) y redimensionar las imagenes a un lado maximo de 768 pixeles; desviarse de estas condiciones puede degradar el resultado.
- Aunque la licencia es Apache 2.0, el uso comercial debe acompanarse de validacion propia, dado el caracter experimental del adaptador y sus limitaciones de calibracion y cobertura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nallaworks/qwen2-vl-2b-leaf-symptoms-lora
- Modelo base Qwen2-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Codigo, predicciones y adaptadores del estudio (Zenodo): https://doi.org/10.5281/zenodo.23898477
- Prompt de entrenamiento (en el repositorio): https://huggingface.co/nallaworks/qwen2-vl-2b-leaf-symptoms-lora/blob/main/prompt.txt
