# kozak23/Qwen-Image-2.1-PE-I2I-T2I-Heretic-ARA-int8_convrot-ComfyUI

## Resumen

Qwen-Image-2.1-PE-I2I-T2I-Heretic-ARA-int8_convrot-ComfyUI es una publicacion derivada (fine-tune y cuantizacion) del modelo Qwen-Image-2.1-PE, un reescritor de prompts de imagenes desarrollado originalmente por el equipo Qwen de Alibaba. El modelo base es un Qwen3.5-VL de 9.000 millones de parametros afinado para recibir una instruccion de edicion vaga junto con una o varias imagenes de entrada y generar un prompt preciso y accionable para un modelo de edicion de imagenes posterior. Esta version concreta, publicada por el usuario kozak23, combina los checkpoints I2I (image-to-image) y T2I (text-to-image) en un unico paquete orientado a ComfyUI, con cuantizacion int8 y rotacion de convoluciones (convrot), y anade el sufijo "Heretic" y "ARA", que no se documentan en la model card.

El interes practico reside en que empaqueta un modelo de reescritura de prompts en formato listo para nodos de ComfyUI, reduciendo la friccion para integrarlo en flujos de generacion y edicion de imagenes. La cuantizacion int8 busca disminuir el peso en VRAM respecto a los pesos originales en bf16, aunque el repositorio sigue ocupando 41,9 GB, lo que sugiere que incluye multiples variantes de pesos o ficheros auxiliares.

La informacion publicada por el autor es muy escasa: la model card solo reproduce metadatos YAML (licencia, idioma, modelo base y etiquetas) sin descripcion tecnica, sin detalles de entrenamiento, sin benchmarks y sin instrucciones de uso mas alla de las etiquetas que mencionan ComfyUI. Todo lo que sigue se limita a lo verificable en los metadatos y en la informacion del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el modelo base Qwen-Image-2.1-PE-I2I es un fine-tune de Qwen3.5-VL 9B (transformer multimodal con vision) |
| Parametros totales | no disponible para esta variante; el modelo base se describe como 9B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (sufijo int8_convrot); no se detallan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio incluye ficheros orientados a ComfyUI (41,9 GB en total) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO en la informacion disponible sobre esta variante. La unica referencia tecnica es la del modelo base: Qwen-Image-2.1-PE-I2I es un fine-tune de Qwen3.5-VL 9B, un modelo vision-lenguaje que procesa instrucciones de edicion e imagenes de entrada para producir prompts reescritos destinados a un modelo de edicion de imagenes posterior.

Esta publicacion concreta aplica cuantizacion int8 y una transformacion denominada "convrot" sobre los pesos, y fusiona en un mismo repositorio los checkpoints de los modelos base I2I y T2I. Los sufijos "Heretic" y "ARA" no van acompanados de explicacion en la model card, por lo que no es posible determinar que modificaciones adicionales implican.

## Capacidades

- Reescritura de prompts de edicion de imagenes: recibe una instruccion vaga y una o varias imagenes de entrada y genera un prompt preciso y accionable para un modelo de edicion posterior (capacidad heredada del modelo base Qwen-Image-2.1-PE-I2I).
- Reescritura de prompts de texto a imagen: el repositorio referencia tambien el modelo base Qwen-Image-2.1-PE-T2I, orientado a mejorar prompts de generacion desde texto.
- Procesamiento multimodal de entrada: el modelo base es un Qwen3.5-VL, por lo que acepta imagenes ademas de texto.
- Integracion con ComfyUI: las etiquetas y el nombre indican que los pesos estan preparados para su uso en nodos de ComfyUI.
- Capacidades de tool calling, agentes, thinking mode, audio o vision avanzada mas alla de la descripcion del modelo base: no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion de imagenes asistida en ComfyUI: cargar el modelo en un nodo de reescritura, introducir una instruccion coloquial junto con la imagen y obtener un prompt tecnico que alimente el nodo de edicion, reduciendo la iteracion manual.
- Generacion texto a imagen con prompts mejorados: usar la variante T2I incluida para transformar descripciones breves en prompts detallados antes de pasarlos al sampler.
- Automatizacion de pipelines de contenido visual: integrar el reescritor como paso previo en un flujo por lotes que genere variaciones de imagenes a partir de instrucciones de usuario no tecnicas.
- Prototipado de interfaces creativas: construir una capa de traduccion entre el lenguaje natural del usuario final y los prompts que espera el modelo de difusion subyacente.
- Investigacion sobre prompting multimodal: estudiar como un modelo vision-lenguaje reformula instrucciones ambiguas cuando dispone de la imagen de referencia.
- Despliegue local en estaciones con GPU de consumo: la cuantizacion int8 y el enfoque en ComfyUI facilitan ejecutar el flujo en equipos de trabajo individuales, siempre que la VRAM disponible sea suficiente (no se especifica el minimo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo base se describe como 9B; con cuantizacion int8 el peso teorico de los parametros ronda los 9 GB, pero el repositorio ocupa 41,9 GB, lo que impide confirmar el consumo real de una unica variante.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la orientacion a ComfyUI sugiere uso local, pero no se documenta el minimo de VRAM.
- Opciones de despliegue: ComfyUI (indicado en el nombre y las etiquetas del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kozak23/Qwen-Image-2.1-PE-I2I-T2I-Heretic-ARA-int8_convrot-ComfyUI | no disponible (base 9B) | no disponible | apache-2.0 | Hugging Face | Cuantizacion int8, orientado a ComfyUI, sin benchmarks publicados |
| Qwen/Qwen-Image-2.1-PE-I2I | 9B (Qwen3.5-VL fine-tune) | no disponible | no disponible en la informacion | Hugging Face | Modelo base oficial de reescritura de prompts de edicion |
| Qwen/Qwen-Image-2.1-PE-T2I | no disponible | no disponible | no disponible en la informacion | Hugging Face | Modelo base oficial de reescritura de prompts texto a imagen |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones especificas; al ser un modelo de reescritura de prompts, puede generar descripciones que no correspondan fielmente a la imagen de entrada.
- Idioma: solo se declara soporte de ingles, por lo que el rendimiento en castellano no esta garantizado.
- Los sufijos "Heretic" y "ARA" no estan explicados; conviene auditar los pesos antes de usarlos en produccion.
- La cuantizacion int8 puede degradar la calidad de los prompts generados frente a los pesos originales en bf16; no se han publicado evaluaciones al respecto.
- El repositorio ocupa 41,9 GB, lo que implica requisitos de almacenamiento considerables y posiblemente multiples ficheros de pesos.
- Aunque la licencia declarada es apache-2.0, se recomienda verificar las condiciones de los modelos base Qwen originales antes de un uso comercial.
- No hay garantias de mantenimiento: el repositorio tiene 0 descargas y 1 like en el momento de la consulta.

## Enlaces

- Repositorio principal: https://huggingface.co/kozak23/Qwen-Image-2.1-PE-I2I-T2I-Heretic-ARA-int8_convrot-ComfyUI
- Variante sin sufijo ComfyUI: https://huggingface.co/kozak23/Qwen-Image-2.1-PE-I2I-T2I-Heretic-ARA-int8_convrot
- Modelo base I2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Modelo base T2I: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
