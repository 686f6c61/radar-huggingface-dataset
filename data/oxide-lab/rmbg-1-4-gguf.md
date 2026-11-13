# oxide-lab/RMBG-1.4-GGUF

## Resumen

RMBG-1.4-GGUF es una conversión al formato GGUF del modelo de segmentación de imagen BRIA RMBG-1.4, publicada por el usuario oxide-lab. No se trata de un modelo de lenguaje, sino de una red convolucional de eliminación de fondo (matting) de 44,1 millones de parámetros, basada en la arquitectura BriaRMBG (IS-Net). Su función es generar una máscara de primer plano de un solo canal a partir de una imagen de entrada, y en este paquete concreto se emplea como componente auxiliar del pipeline Lux3D TripoSG para eliminar el fondo de imágenes que no traen un canal alfa válido antes de la reconstrucción 3D.

La relevancia de esta publicación es acotada y muy específica: no aporta mejoras de calidad sobre el modelo original de BRIA, sino que reduce a la mitad el espacio en disco (de 0,16 GiB en F32 a 0,08 GiB en F16) manteniendo, según el autor, un comportamiento prácticamente sin pérdida para esta red. El paquete está pensado para su consumo desde la CLI `lux3d-cli` en el subcomando `triposg`, no como un modelo de propósito general para Hugging Face Transformers.

Es importante subrayar que la licencia del modelo subyacente es no comercial (BRIA RMBG 1.4 Model License Agreement), independiente de la licencia de TripoSG, y que este paquete no concede derechos adicionales sobre la licencia upstream. Cualquier uso comercial requiere un acuerdo aparte con BRIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BriaRMBG (IS-Net), red convolucional con BatchNorm |
| Parametros totales | 44.075.590 (44,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | F16 (única variante; el autor descarta cuantizaciones enteras por no aportar beneficio) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | bria-rmbg-1.4 (no comercial; acuerdo separado con BRIA para uso comercial) |
| Formato de pesos | GGUF (`RMBG-1.4-44M-F16.gguf`), origen safetensors F32 |

## Arquitectura y entrenamiento

El modelo es una red convolucional de segmentación BriaRMBG (familia IS-Net) con 44,1 M de parámetros. Según la model card, el paquete GGUF se generó a partir del `model.safetensors` canónico de Lux3D (176.381.952 bytes, 798 tensores: 686 parámetros en F32 y 112 buffers `num_batches_tracked` en int64). La arquitectura declarada en los metadatos GGUF es `general.architecture = BriaRMBG`, con `lux3d.family = rmbg` y `lux3d.quantization = f16`.

La conversión omite los 112 tensores `num_batches_tracked`, que son contadores exclusivos de entrenamiento y no intervienen en inferencia. El autor justifica que F16 es la única variante razonable porque la red no contiene matrices lineales `*.weight` de rango 2, solo convoluciones y BatchNorm; una cuantización entera dejaría todos los tensores en el fallback F16, produciendo un archivo idéntico sin ganancia de velocidad ni de tamaño. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de imágenes, ni si hubo etapas de refinamiento o ajuste fino por parte de oxide-lab (más allá de la conversión de formato).

## Capacidades

- Segmentación de primer plano: genera una máscara de un solo canal que separa el sujeto del fondo en una imagen de entrada.
- Eliminación de fondo (background removal) como paso previo a otros pipelines, en concreto el de reconstrucción 3D TripoSG de Lux3D.
- Procesamiento de imágenes sin canal alfa válido, que es el caso de uso declarado por el autor.
- Integración con la CLI `lux3d-cli` mediante el flag `--rmbg-model-path`, que acepta tanto el archivo `.gguf` como un directorio que contenga `model.gguf`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan en la información disponible capacidades adicionales como detección de múltiples sujetos, matting de pelo fino o control por prompts.

## Casos de uso

- Preprocesado en pipelines de reconstrucción 3D: el caso de uso canónico del paquete es alimentar `lux3d-cli run triposg` con `--rmbg-model-path models/RMBG-1.4-44M-F16.gguf` para limpiar el fondo de `input.png` antes de generar la malla `out.obj`. Es adecuado porque el autor confirma que las ejecuciones end-to-end de TripoSG con este archivo producen mallas normales.
- Generación de recortes (cutouts) para catálogos de producto: separar el objeto del fondo para componerlo sobre fondos neutros o transparentes en flujos de e-commerce, aprovechando que el modelo devuelve una máscara de primer plano directamente.
- Automatización de assets para pipelines de render: generar máscaras alfa para imágenes que llegan sin transparencia y usarlas como entrada en herramientas de composición o motores de render.
- Sustitución de fondo en lotes de imágenes: aplicar la máscara para recomponer la imagen sobre un nuevo fondo en tareas de edición por lotes, dado el reducido tamaño del modelo (0,08 GiB) que permite ejecutarlo en serie sin gran coste de almacenamiento.
- Integración en herramientas de escritorio o CLI: al ser un único archivo GGUF de 0,08 GiB, encaja en utilidades locales que necesiten una etapa de matting sin depender de servicios en la nube, siempre respetando la licencia no comercial.
- Prototipado de pipelines de visión con formato GGUF: sirve para validar la carga de modelos GGUF no lingüísticos en runtimes compatibles con la familia Lux3D, aunque el autor no documenta compatibilidad con otros motores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de segmentación (IoU, S-measure, MAE), ni comparativas numéricas con el modelo original en F32 más allá de la afirmación cualitativa de que F16 es «efectivamente sin pérdida» para esta red.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 44,1 M de parámetros en F16, el peso de los tensores ronda los 0,08 GiB, por lo que la huella de memoria es muy reducida; el consumo real dependerá de la resolución de imagen y del runtime.
- GPU recomendadas: no disponible. El ejemplo de uso de la model card emplea `--device cuda`, sin especificar modelo de GPU.
- GPU de consumo: por el tamaño del archivo (0,08 GiB) es previsible que quepa en cualquier GPU de consumo moderna, pero el autor no lo confirma ni indica modelos concretos.
- Opciones de despliegue: el único camino documentado es `lux3d-cli` (subcomando `triposg`) con el flag `--rmbg-model-path`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso previsto | Disponibilidad |
|---|---|---|---|---|---|
| oxide-lab/RMBG-1.4-GGUF (este paquete) | 44,1 M | GGUF F16 (0,08 GiB) | bria-rmbg-1.4 (no comercial) | Auxiliar en pipeline Lux3D TripoSG | Hugging Face, 0 descargas |
| briaai/RMBG-1.4 (upstream) | 44,1 M | safetensors F32 (0,16 GiB) | bria-rmbg-1.4 (no comercial) | Eliminación de fondo de propósito general | Hugging Face (modelo base) |
| Otros modelos de eliminación de fondo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo upstream: este paquete no cambia la arquitectura ni los pesos más allá de la conversión a F16 y la omisión de los buffers de entrenamiento, y su única ventaja declarada es la reducción a la mitad del espacio en disco.

## Limitaciones y advertencias

- Licencia no comercial: RMBG-1.4 se distribuye bajo la BRIA RMBG 1.4 Model License Agreement, que no es MIT y no está cubierta por la licencia de TripoSG. El uso comercial exige un acuerdo separado con BRIA.
- Al redistribuir el archivo debe conservarse `RMBG-1.4-LICENSE.md`; este paquete no concede derechos adicionales sobre la licencia upstream.
- Modelo auxiliar, no una familia de salida de Lux3D: está pensado como etapa de preprocesado del pipeline TripoSG, no como modelo autónomo de segmentación de propósito general.
- Sin datos de calidad: no hay benchmarks publicados que permitan verificar la afirmación de que F16 es sin pérdida frente a F32 en términos de IoU o precisión de máscara.
- Compatibilidad limitada: solo se documenta su uso con `lux3d-cli`; no se indica compatibilidad con otros runtimes GGUF.
- Sin soporte lingüístico ni de agentes: no dispone de contexto de texto, tool calling ni razonamiento multi-paso.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de segmentación, el riesgo se traduce en máscaras imprecisas en imágenes difíciles (bordes finos, múltiples sujetos), pero el autor no aporta análisis al respecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxide-lab/RMBG-1.4-GGUF
- Modelo base upstream: https://huggingface.co/briaai/RMBG-1.4
- Licencia BRIA RMBG 1.4: https://bria.ai/bria-huggingface-model-license-agreement/
- Acuerdo comercial con BRIA: https://go.bria.ai/3B4Asxv
