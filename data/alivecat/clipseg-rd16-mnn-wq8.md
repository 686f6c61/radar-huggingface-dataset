# alivecat/clipseg-rd16-mnn-wq8

## Resumen

CLIPSeg RD16 MNN WQ8 es una conversión al runtime MNN del modelo CLIPSeg RD16 de CIDAS, orientada a segmentación de imágenes guiada por texto. CLIPSeg, presentado por Timo Lueddecke y Alexander Ecker en el artículo *Image Segmentation Using Text and Image Prompts* (arXiv:2112.10003), combina un codificador de texto y un codificador de visión de tipo CLIP con un decodificador ligero que produce máscaras de segmentación a partir de una imagen y una consulta textual (o una imagen de referencia). Esta variante concreta no introduce cambios arquitectónicos: es una cuantización y reempaquetado del checkpoint original para su ejecución en el motor MNN de Alibaba.

El modelo mantiene la arquitectura RD16, con dimensión de reducción del decodificador de 16, y aplica cuantización de pesos a 8 bits con tamaño de bloque 128 sobre los pesos elegibles. Se distribuye en dos formatos: un modelo único de 209,86 MiB que cubre todo el pipeline y un pipeline dividido en tres módulos (proyección de texto, codificador de visión y decodificador/cabeza de máscara) que permite cachear características de texto y de imagen por separado.

Su relevancia es práctica: facilita el despliegue de segmentación guiada por texto en entornos donde no se dispone de PyTorch o donde se busca un binario compacto y portable. El repositorio tiene 0,4 GB y licencia Apache-2.0, heredada del checkpoint original. No es un modelo generativo de propósito general, sino un componente especializado de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIPSeg RD16 (codificador de texto CLIP + codificador de visión CLIP + decodificador ligero con dimensión de reducción 16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija de 77 tokens |
| Tipos de cuantizacion | WQ8: pesos a 8 bits con block size 128; variantes de conversión etiquetadas fp32/fp16 |
| Idiomas soportados | no disponible (el tokenizador es CLIP BPE; el alcance lingüístico depende del codificador de texto CLIP subyacente) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`.mnn`); se incluyen tokenizer, `preprocessor_config.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIPSeg, un modelo de segmentación que acopla un codificador de texto y un codificador de visión de tipo CLIP mediante un decodificador convolucional ligero. La consulta textual se proyecta a un vector que condiciona la decodificación de la máscara, de modo que el modelo produce logits de segmentación por píxel para el concepto descrito en el prompt. La variante RD16 reduce la dimensión del decodificador a 16, lo que disminuye el coste computacional y el tamaño del modelo.

Esta ficha corresponde a una conversión, no a un entrenamiento nuevo: los pesos provienen de `CIDAS/clipseg-rd16`, exportados a ONNX por Xenova y posteriormente convertidos a MNN con cuantización WQ8 de bloque 128. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre etapas de RLHF o DPO; CLIPSeg se entrena con supervisión de máscaras y pares texto-imagen, pero los detalles concretos no están recogidos en la información disponible. La innovación técnica de esta variante es el reempaquetado para MNN con pipeline divisible y caché de características.

## Capacidades

- Segmentación de imágenes guiada por texto: genera una máscara de probabilidad para el concepto descrito en el prompt.
- Segmentación guiada por imagen de referencia (prompt visual), heredada de CLIPSeg.
- Salida de logits float32 de forma `[1, 352, 352]`, convertibles a probabilidades mediante sigmoid y redimensionables a las dimensiones originales.
- Pipeline dividido que permite cachear características de texto para prompts repetidos y características de visión para una misma imagen preprocesada.
- Procesamiento de una imagen por inferencia (batch size 1 documentado).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto libre.
- No dispone de modo thinking, audio ni capacidades multimodales más allá de texto e imagen.

## Casos de uso

- Segmentación interactiva en herramientas de edición: el usuario escribe el objeto que quiere aislar y el modelo devuelve la máscara, lo que permite recortes y selecciones sin dibujar manualmente.
- Preprocesado en pipelines de visión por computador: generar máscaras de regiones de interés antes de tareas de detección, clasificación o medición, aprovechando el pipeline dividido para cachear características de imagen.
- Automatización de anotación de datasets: producir máscaras preliminares a partir de prompts textuales para que un humano las revise, reduciendo el coste de etiquetado.
- Aplicaciones móviles o embebidas: el binario compacto (209,86 MiB) y el runtime MNN permiten desplegar segmentación guiada por texto en dispositivos con recursos limitados.
- Moderación y análisis de contenido visual: aislar regiones concretas (por ejemplo, marcas de agua o elementos sensibles) mediante prompts descriptivos.
- Sistemas de realidad aumentada: separar el sujeto del fondo en tiempo real para composición, usando la caché de características de visión cuando la imagen permanece estable.
- Búsqueda visual por concepto: generar máscaras por término y combinarlas con otros módulos para localizar objetos descritos en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el modelo único pesa 209,86 MiB y el pipeline dividido suma aproximadamente 210 MiB en disco, por lo que la huella en memoria es reducida.
- GPU recomendadas: no disponible; el runtime MNN está orientado a CPU y a aceleradores móviles, no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: runtime MNN (GitHub: alibaba/MNN) con batch size 1; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| CLIPSeg RD16 MNN WQ8 (esta ficha) | Segmentación texto-imagen, cuantizado | no disponible | texto 77 tokens, imagen 352x352 | Apache-2.0 | MNN |
| CIDAS/clipseg-rd16 | Segmentación texto-imagen original | no disponible | texto 77 tokens, imagen 352x352 | Apache-2.0 | PyTorch / safetensors |
| Xenova/clipseg-rd16 | Segmentación texto-imagen en ONNX | no disponible | texto 77 tokens, imagen 352x352 | Apache-2.0 | ONNX |
| Segment Anything (SAM) | Segmentación por prompts visuales | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible |

La comparación se limita a variantes del mismo modelo base y a un referente de segmentación por prompts; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Es una conversión cuantizada: la cuantización WQ8 puede introducir una pérdida de precisión en las máscaras respecto al checkpoint original en fp32.
- No es un modelo generativo: no produce texto, código ni razonamiento; su única salida son logits de segmentación.
- Entrada de texto limitada a 77 tokens y entrada de imagen fija a 352x352, lo que puede degradar la calidad en imágenes de alta resolución o prompts largos.
- Batch size 1 documentado; no se contempla procesamiento por lotes.
- Riesgo de máscaras imprecisas o incompletas en conceptos ambiguos, objetos pequeños u oclusiones; requiere validación humana en producción.
- No se documentan sesgos específicos, pero el modelo hereda los del checkpoint CLIPSeg original y de los datos con los que se entrenó.
- Licencia Apache-2.0, que permite uso comercial, pero se debe conservar el aviso de atribución y el archivo NOTICE incluidos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alivecat/clipseg-rd16-mnn-wq8
- Modelo base: https://huggingface.co/CIDAS/clipseg-rd16
- Exportación ONNX de origen: https://huggingface.co/Xenova/clipseg-rd16
- Artículo CLIPSeg: https://arxiv.org/abs/2112.10003
- Runtime MNN: https://github.com/alibaba/MNN
