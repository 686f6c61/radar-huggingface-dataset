# Cloudflare/clairic

## Resumen

Clairic es un modelo multimodal de 27 000 millones de parámetros desarrollado por Cloudflare, afinado a partir de Qwen/Qwen3.8-27B. Su propósito no es la generación de texto libre, sino la extracción de información estructurada: recibe un estado (texto o JSON), imágenes opcionales y un esquema de campos tipados, y devuelve valores tipados con información de puntuación asociada (confianza de extracción y probabilidad de nulo). Está pensado para pipelines de extracción documental, estimación numérica y previsión de series temporales.

El modelo se distribuye con código propio (`custom-code`) que incluye el módulo `clairic_model` con las funciones `load_release_model` y `systemone`, y depende de `xgrammar` para imponer restricciones de esquema mediante un procesador de logits de Transformers. El pipeline declarado es `image-text-to-text` y la licencia es Apache 2.0.

Su relevancia actual radica en el enfoque de salida estructurada con puntuaciones calibradas: cada campo escalar devuelve `valid`, `complete`, `confidence` y `p_null`, lo que permite a los sistemas downstream aplicar umbrales de aceptación propios en lugar de confiar ciegamente en la generación. El tamaño del repositorio es de 55,9 GB y el modelo cuenta con 27 781 427 952 parámetros según los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Clairic se construye sobre Qwen/Qwen3.8-27B, un modelo multimodal de 27 000 millones de parámetros, y se afina para una tarea concreta: transformar un estado y un esquema de campos tipados en respuestas estructuradas. La información disponible no detalla la composición del dataset de afinado, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones de atención (atención lineal, decodificación especulativa) más allá de la arquitectura base.

La innovación técnica documentada está en la capa de inferencia y control de salida. El modelo usa `xgrammar` para aplicar restricciones de esquema a través de un procesador de logits de Transformers, lo que fuerza la conformidad estructural de la respuesta. El esquema de campos admite tipos como `text`, `number`, `date`, `time`, `datetime`, `duration`, `boolean`, `enum`, `object`, `list`, `compute`, `estimate` y `forecast`, con opciones de unidades, redondeo, nulabilidad (`nullable`, por defecto verdadero), `source_only` para valores literales impresos y `knowledge` para respuestas basadas en conocimiento del modelo. Las combinaciones inválidas y las opciones no soportadas se rechazan explícitamente.

## Capacidades

- Extracción de información estructurada desde texto o JSON y desde imágenes (facturas, recibos, documentos escaneados).
- Soporte de entrada multimodal: imágenes PIL o imágenes embebidas en base64, además de documentos PDF embebidos como data URIs o como objetos con `content_type` y `base64`.
- Salida tipada con valores escalares, listas, nulos, estimaciones y trayectorias de previsión.
- Puntuación por campo: `valid`, `complete`, `confidence` (probabilidad de secuencia completa) y `p_null` puntuado de forma independiente.
- Evidencia textual con spans de caracteres en el estado cuando la coincidencia es única; spans nulos en evidencia solo de imagen o ambigua.
- Estimación numérica con cotas (`min`, `max`) y cuantiles opcionales vía `include_quantiles`.
- Previsión de series con horizonte e intervalo (`horizon`, `interval`).
- Cabeza numérica tipada seleccionable mediante el tipo de campo `compute`.
- Fechas relativas resueltas con `reference_date` en formato ISO.
- Informe de truncamiento de entrada (`truncated`) y de uso de tokens (`usage`, que incluye reintentos y trabajo suplementario).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.

## Casos de uso

- Extracción de campos en facturas y recibos: se pasa el texto del documento o una imagen y un esquema con `vendor`, `total`, `issued` e `items`; el modelo devuelve valores tipados con confianza y `p_null`, lo que permite enrutar a revisión manual los campos con puntuación baja.
- Digitalización de documentos escaneados con PDF: admite PDF embebidos y páginas renderizadas, con un límite compartido de cuatro imágenes o páginas, adecuado para albaranes y formularios de varias hojas.
- Previsión de demanda: con una serie histórica en el estado y un campo de tipo `forecast` con horizonte e intervalo, devuelve una trayectoria de previsión y cuantiles opcionales para planificación de inventario.
- Estimación de magnitudes con cotas: campos de tipo `estimate` con `min` y `max` permiten obtener valores acotados con cuantiles, útil para presupuestos aproximados o métricas incompletas.
- Enriquecimiento de datos en pipelines ETL: la salida estrictamente conforme al esquema (garantizada por `xgrammar`) se puede insertar directamente en bases de datos sin parseo heurístico posterior.
- Control de calidad con umbrales propios: al exponer `confidence` y `p_null` por campo, el sistema puede aceptar automáticamente las extracciones de alta confianza y derivar el resto a verificación humana.
- Extracción de valores literales: con `source_only: true` se restringen números, fechas, horas y listas a lo impreso en el documento, lo que evita que el modelo complete datos ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 27 781 427 952 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 55,6 GB, lo que exige al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o varias GPU con paralelismo de tensor.
- En cuantización de 8 bits los pesos ocuparían en torno a 28 GB, y en 4 bits alrededor de 14 GB, pero el repositorio no publica variantes cuantizadas ni confirma su compatibilidad con el código `custom-code`; estos valores son estimaciones aritméticas, no cifras oficiales.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16. No hay confirmación de funcionamiento en GPU de consumo (RTX 4090 de 24 GB) sin cuantización, y esta no está documentada.
- Opciones de despliegue: PyTorch y Transformers con Python 3.11 o superior, más `xgrammar` como procesador de logits para las restricciones de esquema. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el repositorio usa código propio (`clairic_model`) y un helper local de peticiones en Python.
- Latencia y throughput: no disponibles.
- Restricciones de entrada: medios embebidos limitados a 4 MiB por elemento y 8 MiB en total; no se aceptan URL de medios remotas; la rotación de imagen admite 0, 90, 180 o 270 grados en sentido horario tras aplicar la orientación EXIF.
- El helper lanza un error de cola llena cuando hay peticiones simultáneas, lo que implica concurrencia limitada en el modo de ejecución documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare Clairic | 27,8 B | no disponible | Extracción estructurada multimodal con puntuaciones | Apache 2.0 | Hugging Face (7 descargas, 12 likes) |
| Qwen/Qwen3.8-27B (base) | 27 B | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |
| Cloudflare Clairic Flash | no disponible | no disponible | Variante ligera de la familia Clairic | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Las puntuaciones (`confidence`, `p_null`) son probabilidades del modelo y deben calibrarse con umbrales de aceptación propios de cada aplicación; no son garantías de corrección.
- Riesgo de alucinación en campos con `knowledge: true`, donde el modelo puede responder con conocimiento propio en lugar de ceñirse al estado; para evitarlo debe usarse `source_only` cuando se requieran valores literales.
- Conviene inspeccionar `truncated` y los indicadores de completitud antes de confiar en un resultado, ya que las entradas largas pueden recortarse.
- La evidencia solo de imagen o ambigua no proporciona spans de caracteres, lo que dificulta la trazabilidad en esos casos.
- Límites operativos estrictos: 4 MiB por medio embebido, 8 MiB en total, cuatro imágenes o páginas compartidas y ausencia de soporte para URL remotas.
- El helper de Python devuelve un error de cola llena ante peticiones simultáneas, lo que restringe el despliegue concurrente en el modo documentado.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos; la evaluación multilingüe queda a cargo del integrador.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B y el repositorio no detalla condiciones adicionales de la licencia del modelo base.
- Dependencia de código propio (`custom-code`) y de `xgrammar`: requiere confiar en el código del repositorio y mantener compatibilidad con versiones concretas de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cloudflare/clairic
- Clairic Flash (variante de la familia): https://huggingface.co/Cloudflare/clairic-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cloudflare: https://www.cloudflare.com/
- Documentación de Cloudflare One Client (referencia de plataforma): https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/download/
