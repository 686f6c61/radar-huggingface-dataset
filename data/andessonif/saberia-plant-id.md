# andessonIF/saberia-plant-id

## Resumen

SaberIA Plant ID es un artefacto de inferencia derivado de BioCLIP 2 (imageomics/bioclip-2), un modelo de visión-lenguaje especializado en biodiversidad vegetal. No se trata de un modelo entrenado desde cero: el autor ha exportado el encoder de imagen ViT-L/14 de BioCLIP 2 a ONNX, ha cuantizado las multiplicaciones de matriz a int8 y ha empaquetado junto a él un índice vectorial con embeddings de texto y de referencia para 159 especies de la Caatinga y el Nordeste brasileño. El objetivo es permitir la identificación de plantas medicinales y populares en un dispositivo Android, sin conexión y en el propio terminal.

El problema que resuelve es acotado pero concreto: llevar un clasificador de especies vegetales de grado científico a un móvil de gama media, con un tamaño de repositorio de 0,3 GB y una entrada de imagen fija de 224x224 píxeles. La aproximación es la de clasificación por similitud en espacio de embeddings (zero-shot con prototipos de texto más vecinos de referencia), no una cabeza de clasificación supervisada con softmax sobre clases fijas.

Es relevante ahora porque demuestra un patrón de despliegue reproducible: tomar un modelo fundacional de dominio específico (BioCLIP 2, NeurIPS 2025), cuantizarlo y servirlo en local para una aplicación de campo donde no hay conectividad. La licencia MIT del modelo base y de este derivado facilita su reutilización comercial, algo poco habitual en modelos de visión especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (encoder de imagen de BioCLIP 2), exportado a ONNX; índice de similitud externo en formato binario propio |
| Parametros totales | no disponible (el repositorio solo distribuye el encoder de imagen cuantizado int8 y el índice; no se indica el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija `pixel_values` [1, 3, 224, 224]) |
| Tipos de cuantizacion | int8 en las multiplicaciones de matriz del encoder; vectores del índice en float16 |
| Idiomas soportados | portugués (etiquetas y nombres de especies en pt) |
| Licencia | MIT (heredada de imageomics/bioclip-2) |
| Formato de pesos | ONNX (`plant-classifier-int8.onnx`) e índice binario propio (`plant-index.bin`) |

## Arquitectura y entrenamiento

El componente principal es el encoder de imagen de BioCLIP 2, un Vision Transformer ViT-L/14 con parche de 14x14 y resolución de entrada de 224x224. BioCLIP 2 se entrena con aprendizaje contrastivo jerárquico sobre datos de biodiversidad (taxonomía del árbol de la vida) y escala las propiedades emergentes de ese entrenamiento jerárquico; la referencia es Gu et al., *BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning*, NeurIPS 2025. En este repositorio no hay entrenamiento nuevo: los pesos se exportan y se cuantizan, tal como declara el autor.

La innovación de este artefacto no está en el modelo sino en el empaquetado. El encoder produce un embedding normalizado de dimensión 768 a partir de la imagen. El archivo `plant-index.bin` contiene un encabezado JSON con el tamaño, los rótulos, los parámetros y el umbral de decisión, seguido de vectores float16: uno por nombre científico (159 especies de la base más especies comunes fuera de ella) y uno por foto de referencia de las especies de la base. La clasificación se hace por comparación de similitud contra esos vectores, con un umbral explícito para descartar. Los vectores de texto se calcularon con el encoder de texto de BioCLIP 2 sobre nombres científicos con taxonomía del GBIF Backbone; los vectores de referencia provienen de observaciones de grado de investigación de iNaturalist con licencias CC0, CC BY, CC BY-SA, CC BY-NC y CC BY-NC-SA (solo se distribuyen los vectores, no las fotos). La lista de especies y nombres aceptados se apoya en Flora e Funga do Brasil (JBRJ), GBIF, RENISUS y el Formulario de Fitoterápicos de la Farmacopeia Brasileira (ANVISA).

## Capacidades

- Clasificación de imágenes de plantas por similitud en espacio de embeddings, restringida a las especies del índice.
- Identificación offline en dispositivo Android mediante ONNX Runtime, sin llamadas a servidor.
- Preprocesado de imagen documentado y fijo: redimensionado por el lado menor, recorte central a 224x224, normalización con media 0.48145466/0.4578275/0.40821073 y desviación 0.26862954/0.26130258/0.27577711.
- Salida de embedding normalizado de 768 dimensiones, apto para búsqueda por vecino más cercano.
- Umbral de decisión configurable en el encabezado del índice para rechazar entradas fuera de la base.
- Cobertura de 159 especies de la Caatinga y el Nordeste brasileño, más especies comunes fuera de la base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto libre. Es un encoder de imagen más un índice, no un modelo generativo.

## Casos de uso

- Identificación de plantas medicinales en campo sin cobertura: la aplicación captura una foto de hoja, el encoder ONNX int8 genera el embedding y el índice devuelve la especie más cercana por encima del umbral. Adecuado porque todo el pipeline cabe en 0,3 GB y no requiere red.
- Herramienta de apoyo para agentes de salud comunitaria en el Nordeste brasileño: el modelo sugiere la especie y la app muestra la información asociada de RENISUS y la Farmacopeia Brasileira. El umbral de rechazo evita forzar una identificación cuando la confianza es baja.
- Catalogación de flora en inventarios rápidos: con fotos de hoja en condiciones controladas, el clasificador preetiqueta observaciones que después se validan manualmente, reduciendo el tiempo de triaje.
- Filtro previo en aplicaciones de citizen science: descartar o marcar imágenes que no corresponden a la flora local antes de enviarlas a revisión por expertos.
- Módulo educativo offline: aplicación de campo para estudiantes que necesitan reconocer especies de la Caatinga sin conectividad en zonas rurales.
- Integración en apps Android existentes: al ser ONNX con entrada y salida documentadas, se puede insertar en un pipeline Kotlin/Java con ONNX Runtime Mobile sin reentrenar nada.
- Despliegue en servidor ligero para validación por lotes: el mismo ONNX se puede ejecutar en CPU con ONNX Runtime para preclasificar lotes de imágenes de herbario o de iNaturalist.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall ni comparaciones con el modelo base sin cuantizar. Tampoco se documentan latencias ni throughput medidos en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un encoder ViT-L/14 cuantizado a int8 con entrada 224x224, la huella es modesta y está pensada para ejecución en CPU móvil dentro de una app Android.
- GPU recomendadas: no aplica para el caso de uso principal (inferencia en dispositivo). Para ejecución en servidor, cualquier GPU con soporte de ONNX Runtime (por ejemplo, A100, H100, RTX 4090) puede ejecutar el encoder, pero no se documentan cifras.
- Cabe en GPU de consumo: sí, por tamaño del artefacto (0,3 GB de repositorio) y por la naturaleza del modelo; no se especifica qué GPU concretas se han probado.
- Opciones de despliegue: ONNX Runtime (incluida la variante Mobile para Android), dado que el artefacto distribuido es ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaberIA Plant ID (este) | ViT-L/14 ONNX int8 + índice de similitud | no disponible | imagen 224x224, embedding 768 | MIT | Hugging Face, 0 descargas |
| imageomics/bioclip-2 | Modelo base vision-lenguaje | no disponible en la informacion | imagen + texto | MIT | Hugging Face |
| CLIP ViT-L/14 (OpenAI) | Vision-lenguaje generalista | no disponible en la informacion | imagen 224x224 | MIT (pesos) | Hugging Face / OpenAI |
| SigLIP (Google) | Vision-lenguaje | no disponible en la informacion | imagen variable | Apache 2.0 (según variante) | Hugging Face |

La comparación cuantitativa no es posible con la información disponible: no se han publicado métricas de este derivado ni del modelo base en la model card. La diferencia cualitativa frente a CLIP o SigLIP es la especialización en biodiversidad y la inclusión de un índice de especies de la Caatinga listo para usar.

## Limitaciones y advertencias

- El reconocimiento cubre solo las especies de la base del aplicativo; las plantas fuera de ella pueden confundirse con especies parecidas.
- Fotos de árboles enteros sin hojas, solo del tronco, o de partes no representativas pueden producir identificaciones erróneas.
- El umbral de decisión está en el encabezado del índice; si se ajusta mal, aumentan los falsos positivos o los rechazos.
- La información sobre plantas de la aplicación no sustituye la orientación de un profesional de salud; es un caveat explícito del autor.
- El modelo es un encoder de imagen: no genera texto, no razona y no admite instrucciones.
- Los vectores de referencia derivan de fotos de iNaturalist con licencias CC BY-NC y CC BY-NC-SA; aunque solo se distribuyen los vectores, conviene revisar la compatibilidad con usos comerciales derivados de esas fuentes.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de visión entrenado con datos de biodiversidad, el sesgo principal es de cobertura taxonómica y de dominio fotográfico (fotos de iNaturalist frente a fotos de móvil en campo).
- La licencia MIT del modelo base se hereda; el texto completo se reproduce en la model card y permite uso comercial, pero no se ofrece garantía alguna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andessonIF/saberia-plant-id
- Modelo base BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- Repositorio del modelo base: https://github.com/Imageomics/bioclip-2
- Licencia del modelo base: https://github.com/Imageomics/bioclip-2/blob/main/LICENSE
- Paper de BioCLIP 2: Gu et al., *BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning*, NeurIPS 2025
- Software BioCLIP 2: doi:10.57967/hf/5765
- iNaturalist (fuente de vectores de referencia): https://www.inaturalist.org
- GBIF Backbone (taxonomía): https://www.gbif.org
- Flora e Funga do Brasil (JBRJ): https://floradobrasil.jbrj.gov.br
- RENISUS (Ministerio de Saúde de Brasil): https://www.gov.br/saude
- Formulario de Fitoterápicos da Farmacopeia Brasileira (ANVISA): https://www.gov.br/anvisa
