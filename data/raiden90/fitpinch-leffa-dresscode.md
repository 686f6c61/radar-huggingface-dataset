# raiden90/fitpinch-leffa-dresscode

## Resumen

FitPinch LEFFA DressCode Slim es un espejo parcial (mirror) del repositorio oficial `franciszzj/Leffa`, publicado por el usuario `raiden90` bajo licencia MIT. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un subconjunto de pesos y assets del proyecto Leffa, recortado deliberadamente para cubrir únicamente la ruta de virtual try-on DressCode que utiliza el producto FitPinch. El repositorio ocupa 8,2 GB.

Leffa (Learning Flow Fields in Attention) es un método de generación de imagen de persona controlable basado en difusión latente. Dada una imagen de persona, una imagen de prenda y una pose objetivo, genera la persona vistiendo esa prenda. Este espejo concreto incluye el checkpoint `virtual_tryon_dc.pth` (ruta DressCode), la carpeta `stable-diffusion-inpainting/` y los modelos de preprocesado `densepose/`, `humanparsing/` y `openpose/`.

Su interés práctico es acotado pero claro: permite desplegar la ruta DressCode sin descargar los pesos de VITON-HD (`virtual_tryon.pth`, `pose_transfer.pth`) ni los componentes de SDXL que sí están presentes en el repositorio original, y conserva la licencia MIT del proyecto de origen, lo que simplifica su integración en producto comercial. La model card no declara datos de entrenamiento, resolución de salida, benchmarks ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente para transferencia de prenda (virtual try-on) sobre Stable Diffusion 1.5 inpainting, con módulo de referencia propio de Leffa; pipeline de preprocesado DensePose + HumanParsing + OpenPose |
| Parámetros totales | No disponible. El autor no declara recuento; el componente generativo base es Stable Diffusion 1.5 inpainting (U-Net de aproximadamente 860 M de parámetros, más VAE y codificador de texto CLIP) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible. Es un modelo de imagen; la model card no declara resolución de entrada ni de salida |
| Tipos de cuantización | No disponible. La model card solo describe pesos `.pth` y carpetas de componentes; el repositorio está etiquetado con `onnx`, pero no se especifica qué artefactos se distribuyen en ese formato |
| Idiomas soportados | No disponible. Al emplear el codificador de texto de SD 1.5, los prompts condicionales se proporcionan en inglés |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`.pth`) para el módulo Leffa; carpetas con los componentes de Stable Diffusion inpainting y los modelos de preprocesado. No se detalla el formato exacto (safetensors o bin) de estas carpetas |
| Tarea | Virtual try-on de prenda (categoría DressCode) |
| Autor del espejo | raiden90 |
| Proyecto de origen | franciszzj/Leffa |
| Tamaño del repositorio | 8,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún proceso de entrenamiento propio: es una redistribución selectiva de artefactos del repositorio oficial de Leffa. La model card es explícita al respecto y enumera tanto lo incluido (`virtual_tryon_dc.pth`, `stable-diffusion-inpainting/`, `densepose/`, `humanparsing/`, `openpose/`) como lo excluido a propósito (`pose_transfer.pth`, `virtual_tryon.pth` de VITON-HD, `stable-diffusion-xl-1.0-inpainting-0.1/`, los ejemplos y los assets SCHP no usados por la ruta DressCode).

A partir de la estructura de ficheros puede deducirse el flujo de inferencia: un preprocesado de tres etapas (estimación de pose con OpenPose y DensePose, y segmentación de la persona y de la prenda con HumanParsing) que alimenta un modelo de difusión de tipo inpainting, el cual sintetiza la región de la prenda sobre la persona conservando identidad, textura y pliegues. El proyecto de origen se denomina Leffa por *Learning Flow Fields in Attention*, su innovación metodológica, pero la model card de este espejo no detalla la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Todos esos datos deben consultarse en el repositorio y el artículo del proyecto original.

## Capacidades

- Virtual try-on de prenda (categoría DressCode): genera una imagen de la persona vistiendo una prenda concreta a partir de imagen de persona, imagen de prenda y pose de destino.
- Transferencia de pose en el mismo pipeline, mediante los modelos DensePose y OpenPose incluidos.
- Segmentación de persona y de prenda para construir la máscara de inpainting, con el modelo HumanParsing incluido.
- Conservación de la identidad y del cuerpo de la persona en la región no enmascarada, al apoyarse en un modelo de difusión de inpainting y en un módulo de referencia.
- Ejecución local sin dependencia de API externa: todos los pesos necesarios para la ruta DressCode están en el repositorio.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión generalista.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agente ni razonamiento multi-paso.
- No tiene modo de pensamiento (*thinking mode*), ni audio, ni vídeo.
- Capacidades multilingües: no disponibles; el condicionamiento textual se realiza mediante el codificador de texto de SD 1.5, orientado a inglés.
- Capacidad especial: sustitución de prenda por consenso comparativo en la región enmascarada.

## Casos de uso

- Probador virtual en ficha de producto de e-commerce: el modelo recibe la foto del cliente, la imagen de la prenda del catálogo y una pose normalizada, y devuelve una previsualización de cómo queda la prenda. Es adecuado porque elimina la barrera de la talla visual y reduce la incertidumbre de compra sin intervención manual.
- Reducción de devoluciones en moda online: integrado en el flujo de checkout, el modelo muestra la prenda sobre el propio cuerpo del usuario. Al permitir descartar prendas con encaje deficiente antes del pedido, ataca directamente una de las principales causas de devolución en moda.
- Generación de catálogo a escala: a partir de una foto de prenda y una biblioteca de poses y cuerpos de referencia, el modelo genera on-model shots sin sesión fotográfica. Es adecuado para minoristas con catálogos amplios y presupuesto de producción limitado.
- Incorporación de vendedores en marketplaces: el vendedor sube una foto de la prenda y la plataforma genera automáticamente imágenes de producto con la pose estandarizada de la casa. El pipeline de preprocesado incluido evita que el vendedor tenga que preparar máscaras o poses.
- Personalización en aplicación móvil o web: el usuario guarda sus medidas y una foto de cuerpo completo, y prueba prendas de distintos comercios adheridos. El modelo es adecuado porque se ejecuta íntegramente en infraestructura propia, sin enviar imágenes personales a terceros.
- Aumento de datos para sistemas de recomendación de moda: las imágenes generadas de personas con distintas prendas y poses sirven para entrenar modelos de compatibilidad prenda-cuerpo o de predicción de talla, sin recurrir a datasets con derechos restringidos.
- Sustitución de prenda en postproducción editorial: cambio de prenda sobre una fotografía ya tomada, manteniendo la pose original y la iluminación, para versiones regionales de una misma campaña.
- Comparación de variantes de una misma prenda: generar la misma persona con distintas tallas o colores del mismo producto para una interfaz de comparación lado a lado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este espejo no incluye métricas (ni FID, ni SSIM, ni LPIPS, ni evaluaciones humanas) ni referencias a las publicadas por el proyecto de origen.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 y 12 GB en fp16 con los tres preprocesadores cargados simultáneamente; entre 6 y 8 GB si se cargan de forma secuencial y se aplican *attention slicing* y *CPU offload* del VAE. Estimación del editor a partir del tamaño del repositorio (8,2 GB) y de la clase de modelo base; el autor no publica requisitos.
- GPU recomendadas: NVIDIA A100 o H100 para servir varias peticiones en paralelo; RTX 4090 o RTX 4080 para desarrollo y despliegue de baja concurrencia; RTX 3090, RTX 4070 Ti o RTX 3060 de 12 GB como mínimo práctico en *consumer*.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM. Por debajo de 8 GB (GTX 1650, RTX 3050 de 8 GB) el pipeline completo con los preprocesadores en memoria no es viable sin cuantización adicional no documentada.
- Opciones de despliegue: Python con PyTorch y la librería `leffa` indicada en la model card; exportación de los modelos de preprocesado a ONNX Runtime si se confirma que los assets distribuidos incluyen ese formato; contenedor Docker con los pesos montados como volumen. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de imágenes por segundo; el rendimiento dependerá del número de pasos de muestreo, de la resolución y de si los preprocesadores se ejecutan en GPU o en CPU.

## Comparativa con modelos similares

| Modelo | Base de difusión | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FitPinch LEFFA DressCode Slim (este repositorio) | Stable Diffusion 1.5 inpainting | Virtual try-on DressCode | MIT | Espejo parcial de 8,2 GB en HuggingFace | Solo la ruta DressCode; excluye VITON-HD y SDXL |
| franciszzj/Leffa (original) | Stable Diffusion 1.5 inpainting y SDXL inpainting | Virtual try-on DressCode y VITON-HD, transferencia de pose | MIT | Repositorio completo en HuggingFace y GitHub | Incluye las rutas y ejemplos que este espejo elimina |
| IDM-VTON | Stable Diffusion XL | Virtual try-on de alta fidelidad | No verificada en esta ficha; consultar el repositorio (`yisol/IDM-VTON`) | HuggingFace y demo pública | Mayor coste de VRAM al partir de SDXL |
| CatVTON | Stable Diffusion 1.5 inpainting | Virtual try-on con arquitectura ligera | No verificada en esta ficha; consultar el repositorio (`Zheng Chong/CatVTON`) | HuggingFace y GitHub | Planteamiento de eficiencia paramétrica frente a Leffa |

Los recuentos de parámetros, longitudes de contexto y resultados de benchmarks de las alternativas no están disponibles en la información proporcionada y no se incluyen para no introducir cifras no verificadas.

## Limitaciones y advertencias

- El repositorio no declara datos de entrenamiento, composición del dataset, número de tokens ni procesos de alineación (RLHF, DPO), por lo que no es posible auditar sesgos de origen.
- Riesgo de artefactos de generación propios de la difusión: distorsión de manos, cuellos y extremidades, y pérdida de detalle en tejidos con patrones densos, bordados o transparencias.
- Riesgo de mala reconstrucción cuando la prenda objetivo no se parece a ninguna categoría vista durante el entrenamiento original (uniformes técnicos, prendas tradicionales, calzado).
- Sesgos previsibles en la representación corporal y de tono de piel: el pipeline reproduce las distribuciones del dataset de origen, que no se documenta en este repositorio.
- La máscara de inpainting depende del modelo HumanParsing incluido; una segmentación errónea (pelo largo sobre la prenda, accesorios, prendas superpuestas) degrada directamente el resultado.
- No hay soporte multilingüe ni de texto generativo: es un modelo de imagen, no un asistente, y no debe integrarse en flujos conversacionales.
- No se publican requisitos de hardware, latencias ni benchmarks, por lo que cualquier planificación de capacidad debe hacerse por medición propia.
- Licencia MIT declarada tanto por este espejo como por el proyecto original, lo que en principio permite uso comercial; conviene verificar igualmente las licencias de los componentes de terceros (Stable Diffusion 1.5 inpainting, DensePose, OpenPose, HumanParsing) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, no está validado por la comunidad y no incluye tarjeta de evaluación ni ejemplos de salida.
- Las fechas de creación y actualización que declara HuggingFace (12 de septiembre de 2026) son anómalas; conviene contrastar la integridad de los pesos mediante suma de comprobación antes de desplegarlos.
- Al ser un espejo parcial, actualizaciones del proyecto original no se propagan automáticamente a este repositorio.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/raiden90/fitpinch-leffa-dresscode
- Proyecto original en HuggingFace: https://huggingface.co/franciszzj/Leffa
- Repositorio original en GitHub: https://github.com/franciszzj/Leffa

Nota sobre la búsqueda web: la búsqueda realizada no devolvió ningún resultado relevante sobre el modelo. Los únicos resultados recuperados fueron páginas de preguntas y respuestas en chino (Baidu Zhidao, Zhihu) sin relación con Leffa, con el virtual try-on ni con FitPinch. No se dispone, por tanto, de enlaces adicionales a artículos, blogs o demos más allá de los facilitados en la model card.
