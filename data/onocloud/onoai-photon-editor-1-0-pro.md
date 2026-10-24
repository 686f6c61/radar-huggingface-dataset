# onocloud/onoai-photon-editor-1.0-pro

## Resumen

`onocloud/onoai-photon-editor-1.0-pro` es un modelo de edición de imagen publicado en Hugging Face por la organización `onocloud`, declarado con la librería `diffusers` y la tarea `image-to-image`. Su única seña técnica verificable es la etiqueta `diffusers:QwenImageEditPipeline`, que indica que el repositorio se carga con la clase de pipeline asociada a la familia Qwen-Image-Edit; es decir, apunta a un modelo de difusión que recibe una imagen de entrada más una instrucción en lenguaje natural y devuelve una imagen editada.

El acceso está restringido (gated): requiere aceptar condiciones en Hugging Face, y la licencia declarada es `onocloud-sovereign-license` (etiqueta `license:other`), un texto propietario cuyo contenido no aparece en la información disponible. El repositorio figura con 0,0 GB de tamaño, 0 descargas y 0 likes, y las marcas temporales de creación y actualización son del 24 de octubre de 2026, posteriores a la mayoría de referencias públicas del ecosistema.

La relevancia potencial del modelo es alta —la edición de imagen guiada por instrucciones es una de las áreas más activas del open source—, pero en el momento de redactar esta ficha no hay model card sustantiva, ni pesos descargables, ni datos de entrenamiento, ni benchmarks. Todo lo que sigue distingue explícitamente entre lo declarado en el repositorio y lo que no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio solo declara la etiqueta `diffusers:QwenImageEditPipeline`, compatible con la familia Qwen-Image-Edit (difusión imagen-a-imagen); no se detalla el tipo de bloque, el encoder de texto ni el VAE |
| Parámetros totales | No disponible (el repositorio no publica config del modelo ni pesos) |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible. Al ser un modelo de imagen no se declara ventana de contexto textual, resolución nativa de entrada/salida ni número máximo de tokens de la instrucción |
| Tipos de cuantización | No disponible. El repositorio no incluye variantes GGUF, FP8, AWQ ni cuantizaciones de ningún tipo |
| Idiomas soportados | No disponible (campo de idiomas vacío en los metadatos). No se especifica en qué idiomas acepta instrucciones ni en qué idiomas renderiza texto dentro de la imagen |
| Licencia | `onocloud-sovereign-license` (etiqueta `license:other`). Texto no disponible en la información proporcionada; acceso gated con aceptación de condiciones |
| Formato de pesos | `safetensors` en formato `diffusers` (según etiquetas). El repositorio declara 0,0 GB, por lo que no hay pesos publicados actualmente |
| Tarea / pipeline | `image-to-image` con `QwenImageEditPipeline` |
| Librería | `diffusers` |
| Acceso | Restringido (gated): requiere aprobación o aceptación de términos en Hugging Face |
| Fecha de creación / actualización | 2026-10-24 / 2026-10-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna. El único dato disponible es la etiqueta de pipeline (`QwenImageEditPipeline`), que sitúa el modelo en la estela de Qwen-Image-Edit: un sistema de difusión que combina un encoder de texto multimodal con un transformer de difusión y un VAE, y que trabaja en modo edición imagen-a-imagen (imagen de referencia + instrucción). No se confirma si `onoai-photon-editor-1.0-pro` es un fine-tune de esa familia, una destilación, un merge o un modelo entrenado desde cero con un pipeline compatible; el repositorio no incluye `model_index.json`, `config.json` ni tarjeta descriptiva que lo aclare.

Tampoco hay datos de entrenamiento: se desconoce el número de tokens o de pares imagen-instrucción, la composición del dataset, si hubo etapas de ajuste con preferencias (RLHF/DPO) o supervisión humana, ni si se aplicaron técnicas de decodificación acelerada, atención lineal o destilación de pasos. Cualquier afirmación sobre estos puntos sería especulativa y no debe tomarse como base para una evaluación técnica.

## Capacidades

- Edición de imagen guiada por instrucción en lenguaje natural: el pipeline declarado (`image-to-image` con `QwenImageEditPipeline`) está diseñado para transformar una imagen de entrada según un prompt descriptivo.
- Edición localizada: la familia de pipeline referenciada trabaja sobre regiones concretas de la imagen, por lo que cabe esperar sustitución de objetos, cambio de atributos y edición de zonas delimitadas. No verificado en este repositorio concreto.
- Preservación de identidad y estructura de la imagen original: es el objetivo declarado del pipeline referenciado, no una característica documentada de este modelo.
- Tool calling / function calling: no disponible. No es una capacidad propia de un modelo de difusión y el repositorio no la declara.
- Soporte de agentes y razonamiento multi-paso: no disponible. Cualquier flujo agéntico requeriría un orquestador externo que encadene ediciones.
- Capacidades multilingües: no disponible. No se declaran idiomas de instrucción.
- Modo «thinking», visión general, audio o vídeo: no disponible / no declarado.
- Generación de texto (LLM): no es la tarea del modelo.

## Casos de uso

- Retoque de fotografía de producto para comercio electrónico: el modelo recibiría la foto original del artículo junto con una instrucción del tipo «fondo blanco neutro, sombra suave, sin cambiar el producto», manteniendo intacta la geometría del objeto. Es el escenario natural de un pipeline `image-to-image` con preservación de estructura, aunque requiere validar empíricamente que no deforme el producto.
- Edición de rótulos y textos en piezas gráficas (carteles, packaging, capturas de interfaz): una de las tareas que el pipeline Qwen-Image-Edit está pensado para cubrir es la sustitución de texto dentro de la imagen. Habría que comprobar la calidad de renderizado en castellano antes de usarlo en producción.
- Generación de variantes creativas para campañas y tests A/B: partiendo de una misma imagen base, lanzar N ediciones con cambios de paleta, iluminación o ambientación para medir rendimiento de creatividades, con control de coste por número de pasos de muestreo.
- Normalización de datasets de visión por computador: unificar fondos, eliminar marcas de agua o estandarizar la iluminación de imágenes de entrenamiento antes de anotarlas, reduciendo el sesgo de dominio del dataset.
- Herramientas de diseño asistido con edición iterativa: el usuario encadena instrucciones sobre la imagen resultante de la iteración anterior; el modelo no gestiona estado ni memoria, por lo que la herramienta debe mantener el historial y reenviar la imagen editada en cada paso.
- Localización de material gráfico por mercados: adaptar imágenes promocionales a distintos países cambiando señalética, colores culturales o elementos de contexto mediante instrucciones específicas.
- Restauración y limpieza de archivo fotográfico: eliminación de arañazos, ruido o elementos parásitos por instrucción, como complemento (no sustituto) de modelos específicos de restauración.
- Generación de contraejemplos para robustez de clasificadores: editar imágenes de un dataset de forma controlada para comprobar si un modelo de visión mantiene su predicción ante cambios irrelevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas cuantitativas (ni FID, ni CLIP-score, ni tasas de éxito en edición, ni comparaciones con la familia Qwen-Image-Edit), no hay pesos descargables con los que ejecutar una evaluación propia y la model card no existe o está vacía. Las cifras que pudieran atribuirse al pipeline de referencia no son trasladables a este checkpoint sin verificación.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No hay pesos publicados (0,0 GB) ni configuración que permita calcularla.
- Estimación condicional (no confirmada) si el modelo resultase ser de la clase Qwen-Image-Edit, en torno a 20 000 millones de parámetros en el transformer de difusión más encoders y VAE:
  - `bf16` sin cuantizar: aproximadamente 40 GB solo para los pesos del transformer y más de 55 GB contando encoder de texto y VAE; requiere A100 80 GB, H100 80 GB o H200.
  - `FP8`: en torno a 20-22 GB de pesos, 32-48 GB de VRAM total con encoder; encaja en A6000 48 GB y, con `cpu_offload`, en RTX 4090.
  - GGUF Q4-Q8: 12-20 GB; viable en RTX 4090, RTX 3090 y, con cuantizaciones agresivas y offload secuencial, en GPUs de 12-16 GB a costa de latencia.
- GPU recomendadas (condicional a la estimación anterior): H100/A100 80 GB para `bf16` sin concesiones; L40S 48 GB o A6000 48 GB para servicio con FP8; RTX 4090 24 GB para uso individual con cuantización.
- Cabe en GPU de consumo: sí, previsiblemente, solo con cuantización y/o offload; no confirmado por falta de pesos.
- Opciones de despliegue: `diffusers` + PyTorch es la vía declarada por la etiqueta del repositorio; ComfyUI o nodos equivalentes requerirían que exista soporte para el pipeline concreto. vLLM y TGI no aplican (no es un modelo de lenguaje). llama.cpp/GGUF solo si se publican conversiones, que hoy no existen.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para modelos de difusión de esta clase, 20-30 pasos implican típicamente segundos por imagen en A100/H100 y decenas de segundos en GPU de consumo, pero es una horquilla genérica, no una medición de este modelo.

## Comparativa con modelos similares

Los datos de las filas de comparación provienen de la documentación pública de esos modelos, no de la información proporcionada sobre `onoai-photon-editor-1.0-pro`.

| Modelo | Parámetros | Entrada / tarea | Licencia | Pesos disponibles |
|---|---|---|---|---|
| `onocloud/onoai-photon-editor-1.0-pro` | No disponible | Imagen + instrucción (`image-to-image`) | `onocloud-sovereign-license` (propietaria, gated) | No (repositorio de 0,0 GB) |
| Qwen-Image-Edit (Qwen) | ~20 000 M | Imagen + instrucción, edición y renderizado de texto | Apache 2.0 | Sí, abiertos |
| FLUX.1 Kontext [dev] (Black Forest Labs) | ~12 000 M | Imagen + instrucción, edición contextual | No comercial (FLUX.1 [dev] Non-Commercial License) | Sí, abiertos con registro |

Frente a estas alternativas, la diferencia determinante no es técnica sino de disponibilidad: los dos modelos de referencia permiten descargar pesos, inspeccionar la configuración y ejecutar evaluaciones reproducibles, mientras que `onoai-photon-editor-1.0-pro` no ofrece hoy ninguno de esos elementos. En licencia, Apache 2.0 (Qwen-Image-Edit) es más permisiva que la licencia propietaria declarada aquí, cuyos términos se desconocen.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni ficha de datos, ni configuración publicada. No es posible verificar arquitectura, tamaño, datos de entrenamiento ni linaje.
- Sin pesos: el repositorio declara 0,0 GB. Con 0 descargas y 0 likes, el artefacto no es evaluable ni reproducible en el momento de redactar esta ficha.
- Licencia propietaria y opaca: `onocloud-sovereign-license` bajo etiqueta `license:other`. No se puede confirmar si permite uso comercial, redistribución, fine-tuning o despliegue en SaaS; hay que leer los términos en Hugging Face antes de cualquier uso productivo.
- Acceso gated: la descarga requiere aceptar condiciones, lo que añade una dependencia operativa (aprobación, trazabilidad, posible revocación) para pipelines automatizados.
- Riesgo de alucinación visual: en modelos de edición por instrucción es habitual la modificación de elementos no solicitados, la deformación de caras y manos, la pérdida de detalles finos y la degradación del texto renderizado. Sin benchmarks ni pruebas propias no puede acotarse el riesgo en este checkpoint.
- Idiomas: no declarados. El renderizado de texto dentro de la imagen y la comprensión de instrucciones en castellano deben validarse empíricamente; es frecuente un rendimiento desigual frente al inglés.
- Sesgos: desconocidos. Sin información sobre la composición del dataset no puede evaluarse el sesgo de representación demográfico, cultural o de estilo.
- Ambigüedad temporal y de linaje: las fechas del repositorio (24-10-2026) y la ausencia de pesos impiden confirmar si se trata de un lanzamiento planificado, un contenedor reservado o un artefacto privado con metadatos públicos.
- Sin cuantizaciones ni herramientas de aceleración publicadas: el coste de inferencia en producción, si finalmente se publican pesos, dependerá de conversiones de terceros.
- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso de forma nativa; cualquier flujo de ese tipo exige un orquestador externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-photon-editor-1.0-pro
- Perfil de la organización en Hugging Face: https://huggingface.co/onocloud
- Otro repositorio de la misma organización citado en la búsqueda: https://huggingface.co/onocloud/ono-ai-v1-full
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.

Nota sobre la búsqueda web: el resto de resultados (`on1.com/products/nonoise-ai/`, el blog de ON1 Photo RAW 2027 y `photoeditorai.io`) corresponden a productos comerciales de terceros sin relación con este repositorio y no aportan información técnica sobre el modelo.
