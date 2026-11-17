# 1038lab/MultiMatte

## Resumen

MultiMatte es un modelo de *alpha matting* con capacidad de prompt (texto opcional) construido sobre SAM 3 (Segment Anything Model 3) de Meta. Lo desarrolla Feyn Research (Hafedh Hichri) y esta empaquetado por 1038lab para su integracion directa en el nodo `MultiMatte (RMBG)` de ComfyUI-RMBG. Su funcion es generar mattes de opacidad continua en lugar de mascaras binarias, lo que permite recortar correctamente elementos de borde dificil como cabello, cristal, humo o tejidos translucidos.

El modelo no es un LLM: es un modelo de vision orientado a la eliminacion de fondo y a la extraccion de primer plano de alta calidad. Con 840 millones de parametros y un repositorio de 3,4 GB en safetensors, se posiciona en la gama media de modelos de segmentacion y matting, y su licencia Apache-2.0 facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en dos factores: por un lado, aprovecha la arquitectura promptable de SAM 3, lo que permite combinar indicaciones textuales con el matting fino; por otro lado, su empaquetado especifico para ComfyUI reduce la friccion de adopcion en flujos de postproduccion y generacion de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (Segment Anything Model 3) adaptado a alpha matting; transformer de vision promptable |
| Parametros totales | 840.376.374 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de texto en el idioma que soporte el tokenizer de SAM 3) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (config.json, model.safetensors, processor_config.json, tokenizer.json, tokenizer_config.json) |

## Arquitectura y entrenamiento

MultiMatte se construye sobre SAM 3, el modelo de segmentacion promptable de Meta. La adaptacion consiste en transformar la salida de segmentacion en un *alpha matte* continuo (valores de opacidad por pixel) en lugar de una mascara binaria, lo que exige refinar los bordes y modelar la mezcla de colores entre primer plano y fondo. El modelo acepta prompts opcionales de texto, ademas de los prompts visuales tipicos de SAM (puntos, cajas o mascaras), lo que permite dirigir la extraccion hacia un objeto concreto descrito en lenguaje natural.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo de vision de este tipo). Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal. El repositorio incluye tokenizer y processor_config, lo que confirma el soporte de entrada textual ademas de la imagen.

## Capacidades

- Generacion de alpha mattes de opacidad continua para bordes finos: cabello, cristal, humo, tejidos y contornos complejos.
- Segmentacion promptable: acepta prompts de texto opcionales ademas de los prompts visuales de SAM 3.
- Eliminacion de fondo de alta calidad con preservacion de detalles translucidos.
- Procesamiento de imagen a nivel de pixel con salida de mascara alfa.
- Integracion nativa con ComfyUI mediante el nodo `MultiMatte (RMBG)` de ComfyUI-RMBG.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni audio.
- Capacidades multilingues: no documentadas; el soporte de texto depende del tokenizer incluido.

## Casos de uso

- Postproduccion fotografica: extraer sujetos con cabello o ropa translucida para composicion sobre nuevos fondos, aprovechando el matte continuo en lugar de una mascara binaria.
- Generacion de imagen en ComfyUI: encadenar el nodo `MultiMatte (RMBG)` como paso de recorte dentro de pipelines de img2img o inpainting, donde un borde limpio evita halos.
- E-commerce de producto: aislar articulos con bordes delicados (cristal, joyeria, telas) para fichas de catalogo con fondo blanco o transparente.
- Creacion de contenido para video y streaming: generar mattes de sujeto por fotograma como alternativa ligera a un chroma key fisico.
- Edicion de retrato y avatares: separar pelo y contornos para composicion en herramientas de diseno o generacion de avatares.
- Automatizacion de catalogos y datasets: procesar lotes de imagenes para construir datasets de entrenamiento con fondos eliminados y mascaras alfa de referencia.
- Integracion en herramientas de diseno grafico: usar el modelo como servicio de recorte promptable donde el usuario describe el objeto a aislar con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 840 millones de parametros en precision FP16 el peso ronda los 1,7 GB, por lo que se estima un consumo de VRAM en el rango de 2 a 4 GB segun resolucion de entrada y lote (estimacion, no dato del autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) deberia poder alojar el modelo; las GPU de datacenter (A100, H100) solo serian necesarias para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: ComfyUI mediante ComfyUI-RMBG (soporte oficial); el formato safetensors y la libreria `nobg` permiten carga directa en Python. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Prompt de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiMatte (este) | 840 M | Alpha matte continuo | Si (opcional) | Apache-2.0 | Hugging Face, ComfyUI-RMBG |
| SAM 3 (facebook/sam3) | no disponible | Mascara de segmentacion | Si | no disponible en la informacion | Hugging Face |
| Modelos RMBG de eliminacion de fondo | no disponible | Mascara / recorte | no disponible | no disponible | no disponible |

La comparativa se limita a los datos disponibles. MultiMatte se diferencia de SAM 3 base por producir mattes alfa continuos en lugar de mascaras, y de las soluciones clasicas de eliminacion de fondo por admitir prompts de texto y modelar bordes translucidos.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al derivar de SAM 3, hereda los posibles sesgos de su dataset de entrenamiento, no publicados.
- Riesgo de alucinacion o segmentacion incorrecta cuando el prompt de texto es ambiguo o el objeto no esta bien delimitado en la imagen.
- El matte puede degradarse en escenas con fondos de color similar al sujeto o con transparencias muy complejas.
- No se especifican limitaciones de idioma para los prompts de texto; el tokenizer incluido condiciona el soporte real.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; conviene conservar los avisos de copyright del modelo upstream (feyninc/multimatte) y de la base (facebook/sam3).
- Para produccion: no hay benchmarks publicados ni metricas de latencia, por lo que conviene validar la calidad del matte en el dominio concreto antes de desplegar.
- El modelo esta pensado para vision; no debe emplearse como modelo de lenguaje ni para tareas de texto.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/1038lab/MultiMatte
- Modelo upstream: https://huggingface.co/feyninc/multimatte
- Modelo base SAM 3: https://huggingface.co/facebook/sam3
- Repositorio ComfyUI-RMBG: https://github.com/1038lab/ComfyUI-RMBG
- Repositorio nobg: https://github.com/feyninc/nobg
