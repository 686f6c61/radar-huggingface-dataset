# RunningHubAI/rh-pokie-lora

## Resumen

rh-pokie-lora es un adaptador LoRA para edicion y generacion de imagenes publicado en HuggingFace por RunningHubAI (RunningHub), atribuido al autor Dmytro Sakal y distribuido a traves de la plataforma RunningHub. El propio autor lo describe en la model card como un modelo de tipo "image edit" afinado a partir de krea2, con la palabra de activacion (trigger word) "Pokie". Se distribuye como un unico fichero safetensors de 218 MiB (aproximadamente 0,2 GB de repositorio) y esta pensado para cargarse en ComfyUI, en RunningHub o directamente desde Hugging Face.

El modelo pertenece a la categoria de LoRA sobre modelos de difusion para generacion texto-a-imagen e imagen-a-imagen. La model card no aporta informacion sobre la arquitectura del modelo base mas alla del identificador "krea2", ni sobre el dataset, el numero de pasos de entrenamiento, los hiperparametros o el rango del adaptador. La unica descripcion funcional es la etiqueta "test only", lo que sugiere que se trata de un repositorio de pruebas mas que de un modelo listo para produccion.

Su relevancia actual es limitada: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, no declara licencia y no incluye documentacion tecnica. Resulta util sobre todo como ejemplo de flujo de publicacion de LoRA en el ecosistema ComfyUI y como referencia de como RunningHub distribuye pesos entrenados por terceros en su plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion base (krea2) |
| Parametros totales | no disponible (adaptador LoRA; fichero de 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (Pokie.safetensors) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusion preentrenado para especializarlo en un concepto concreto. La model card indica que el modelo base del que parte es "krea2", aunque no detalla la version, la variante de text encoder ni la resolucion de entrenamiento. El unico fichero incluido es `Pokie.safetensors`, de 218 MiB, coherente con el tamano tipico de un adaptador LoRA de rango medio para un modelo de difusion grande.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, la resolucion, el learning rate, el rango (rank) o el alpha del LoRA, ni sobre si se aplicaron tecnicas de regularizacion o de captioning. Tampoco se documenta ninguna innovacion tecnica adicional (por ejemplo, decodificacion especulativa, atencion lineal o destilacion). El modelo se activa mediante la palabra clave "Pokie", que debe incluirse en el prompt para que el concepto aprendido se manifieste en la generacion.

## Capacidades

- Edicion y generacion de imagenes a partir de texto e imagen (pipeline image-text-to-image).
- Aplicacion de un concepto o estilo especifico activado mediante la trigger word "Pokie".
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, y carga local desde Hugging Face.
- Capacidades multilingues: no disponible (depende del text encoder del modelo base krea2).
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica (no es un modelo de lenguaje).
- Modo "thinking", vision o audio: no disponible / no aplica.

## Casos de uso

- Generacion de personaje consistente: usar el adaptador con la trigger word "Pokie" para producir variaciones de un mismo concepto o personaje manteniendo rasgos coherentes entre imagenes, aprovechando que un LoRA tiende a fijar caracteristicas visuales concretas.
- Ilustracion de estilo en estudios de diseno: aplicar el LoRA sobre el modelo base krea2 en ComfyUI para explorar un estilo visual recurrente dentro de un pipeline de generacion por lotes.
- Prototipado rapido en ComfyUI: cargar `Pokie.safetensors` como nodo LoRA junto a un checkpoint krea2 para validar prompts y composiciones antes de invertir en entrenamientos propios.
- Pruebas de concepto en la nube: ejecutar el modelo a traves de la API de RunningHub sin necesidad de GPU local, usando la infraestructura del proveedor para generar imagenes puntuales.
- Edicion de imagenes existentes: dado el pipeline image-text-to-image, emplearlo para modificar imagenes de entrada guiando el resultado con la trigger word y un prompt descriptivo.
- Experimentacion educativa: utilizar el repositorio como ejemplo practico de como se estructura, publica y carga un LoRA en el ecosistema Hugging Face y ComfyUI.
- Evaluacion comparativa de LoRAs: incluirlo en pruebas internas para medir cuanto aporta un adaptador de concepto frente al modelo base sin adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud con imagenes de referencia ni comparaciones cuantitativas con otros adaptadores), por lo que no es posible presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware

- El adaptador en si ocupa 218 MiB, por lo que el coste de almacenamiento es minimo.
- La VRAM necesaria para inferencia viene determinada casi por completo por el modelo base krea2 sobre el que se aplica el LoRA, no por el adaptador; no se dispone de cifras oficiales del modelo base en la informacion proporcionada.
- GPU recomendadas: no disponible (depende del modelo base krea2 y de la precision de carga).
- Compatibilidad con GPU de consumo: no disponible, aunque este tipo de adaptadores suele poder ejecutarse en tarjetas consumer si el modelo base cabe en memoria con las optimizaciones habituales.
- Opciones de despliegue conocidas: ComfyUI (local o en la nube), plataforma RunningHub (internacional y China) y carga directa desde Hugging Face. No se documentan otras integraciones como vLLM, TGI o llama.cpp, que en cualquier caso no aplican a un modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay informacion suficiente para establecer una comparativa numerica con alternativas concretas. Como referencia de categoria, un LoRA de concepto como este se compara habitualmente con otros adaptadores del mismo modelo base (krea2) y con LoRAs entrenados para modelos de difusion populares, pero no se dispone de los datos necesarios para rellenar una tabla con cifras reales.

| Criterio | rh-pokie-lora | Alternativas de la misma categoria |
|---|---|---|
| Tipo | LoRA de concepto/estilo | LoRA de concepto/estilo |
| Modelo base | krea2 | no disponible |
| Tamano del adaptador | 218 MiB | no disponible |
| Trigger word | "Pokie" | no disponible |
| Licencia | no disponible | no disponible |
| Rendimiento cuantitativo | no disponible | no disponible |

## Limitaciones y advertencias

- La propia model card indica "test only", lo que apunta a un repositorio de pruebas sin garantias de calidad ni de soporte.
- El repositorio registra 0 descargas y 0 "me gusta", y no incluye documentacion tecnica, dataset, hiperparametros ni resultados de evaluacion.
- No se declara licencia explicita: la model card remite a "la licencia del proyecto original o upstream", lo que genera incertidumbre sobre el uso comercial. Debe verificarse la licencia de krea2 antes de cualquier uso en produccion.
- Riesgo de sobreajuste o de reproduccion de sesgos y estilos presentes en los datos de entrenamiento, que no se documentan.
- La calidad de la salida depende enteramente del modelo base krea2 y del prompt; no hay metricas que respalden su comportamiento.
- Al ser un modelo de imagen, no ofrece capacidades de texto, razonamiento, tool calling ni agentes.
- No se especifican idiomas soportados en los prompts, algo que en la practica depende del text encoder del modelo base.
- Fecha de creacion y actualizacion coincidente con octubre de 2026 (segun los metadatos del repositorio), sin historial posterior de mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-pokie-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2106390401761517570
- Pagina del autor (Dmytro Sakal): https://www.runninghub.ai/user-center/2092587403228180482
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Model card en chino (referenciada en el README): README_cn.md (dentro del repositorio)
