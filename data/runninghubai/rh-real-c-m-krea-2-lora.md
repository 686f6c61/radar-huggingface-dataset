# RunningHubAI/rh-real-c-m-krea-2-lora

## Resumen

rh-real-c-m-krea-2-lora es un adaptador LoRA de edición de imágenes publicado por RunningHubAI y atribuido al usuario @LEUL dentro de la plataforma RunningHub. Se trata de un ajuste fino sobre el modelo base krea2 (familia Krea 2, de Krea AI) y su función es aplicar un atributo visual muy concreto sobre una imagen de entrada dentro de flujos de trabajo ComfyUI. No es un modelo completo: el repositorio contiene un único fichero de pesos de 109 MiB (`realcumk2.safetensors`), por lo que necesita el modelo base para funcionar.

El adaptador se distribuye con la etiqueta de pipeline `image-text-to-image` y se activa mediante palabras clave específicas orientadas a contenido para adultos explícito. La model card es extremadamente escueta: no documenta dataset de entrenamiento, hiperparámetros, rango del LoRA, número de pasos ni procedimiento de evaluación. La licencia no está declarada y el autor se limita a remitir a la licencia del proyecto original.

Su relevancia es limitada y muy nicho: se enmarca en el ecosistema de LoRA de terceros que RunningHub aloja y entrena como servicio, con cero descargas y cero likes en el momento de la consulta, y sin validación comunitaria conocida. Cualquier evaluación seria debe partir del modelo base krea2, del que no se aportan especificaciones en este repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base krea2; arquitectura del modelo base no disponible en este repositorio |
| Parametros totales | no disponible (adaptador de 109 MiB; no se publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, precisión no declarada |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el copyright permanece en el autor y se remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`realcumk2.safetensors`, 109 MiB) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna. Por la etiqueta `lora`, se trata de un adaptador de bajo rango que se inyecta sobre las capas del modelo base krea2 en lugar de un modelo entrenado desde cero. El único dato técnico explícito es la procedencia: `Finetuned from: krea2`. No se especifican rango, alpha, target modules, resolución de entrenamiento, número de imágenes, pasos, optimizador ni tasa de aprendizaje.

Tampoco hay información sobre composición del dataset, número de tokens vistos, ni sobre un hipotético ajuste por RLHF o DPO, algo poco habitual en adaptadores de imagen. La model card sí indica que el entrenamiento se realizó con las herramientas de la plataforma RunningHub. Las únicas palabras de activación declaradas corresponden a contenido sexual explícito, lo que define el dominio funcional del adaptador.

## Capacidades

- Edición de imagen guiada por texto (`image-text-to-image`) sobre una imagen de entrada, aplicada como nodo LoRA en ComfyUI.
- Modificación de atributos visuales concretos mediante palabras de activación, en lugar de generación libre desde cero.
- Integración en pipelines de RunningHub y en Hugging Face como adaptador cargable sobre krea2.
- Generación de contenido para adultos explícito, que constituye su único cometido declarado.
- No hay evidencia de soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No hay evidencia de capacidades de visión general, audio, vídeo ni modo de razonamiento (thinking).
- Soporte multilingüe: no disponible; la model card no documenta idiomas.

## Casos de uso

- Edición por lotes en ComfyUI: el LoRA se inserta como nodo sobre krea2 para aplicar el efecto aprendido a un conjunto de imágenes de entrada de forma automatizada, aprovechando el grafo de nodos para encadenar preprocesado, inferencia y guardado.
- Investigación sobre adaptadores de bajo rango: sirve como caso de estudio de un LoRA de 109 MiB entrenado con herramientas de plataforma, útil para comparar coste de entrenamiento frente a adaptadores de otros tamaños del mismo autor (por ejemplo, el de 233 MB de `rh-krea2-cc-lora`).
- Prototipado de servicios de edición de imagen bajo demanda: la integración con la API de RunningHub permite exponer el adaptador como endpoint sin gestionar infraestructura propia.
- Generación de contenido editorial para adultos: publicación en plataformas que permitan contenido explícito y cumplan los requisitos legales de verificación de edad y consentimiento de las personas representadas.
- Pruebas de concepto de pipelines `image-text-to-image`: útil para validar la cadena de carga de LoRA, resolución y prompts específicos de krea2 antes de invertir en un adaptador propio.
- Evaluación comparativa de LoRA de terceros: al compartir modelo base con otros adaptadores de RunningHub, permite medir diferencias de comportamiento entre adaptadores cargados sobre las mismas versiones de krea2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, SSIM, evaluaciones humanas) ni comparaciones con otros adaptadores.

## Requisitos de hardware

- El adaptador ocupa 109 MiB, un coste despreciable; el requisito real de VRAM lo determina el modelo base krea2, cuyas especificaciones no se detallan en este repositorio.
- VRAM estimada: no disponible para krea2. En modelos de difusión de imagen de tamaño habitual, el rango orientativo en precisión completa se sitúa entre 8 y 24 GB según resolución, precisión y técnicas de offloading, pero es una estimación genérica no confirmada para este caso.
- GPU recomendadas: no disponible. Consumo en GPU de consumo (RTX 4090, RTX 3090, series 40 y 50) no confirmado; dependerá del modelo base y de su cuantización.
- Opciones de despliegue: ComfyUI (entorno previsto), plataforma en la nube de RunningHub y carga desde Hugging Face. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamano del fichero | Licencia | Descargas / likes |
|---|---|---|---|---|---|
| rh-real-c-m-krea-2-lora | LoRA de edición de imagen | krea2 | 109 MiB | no disponible | 0 / 0 |
| rh-krea.2-ai-lora | LoRA de imagen | krea2 | no disponible | no disponible | 0 / 0 |
| rh-krea2-cc-lora | LoRA de imagen | krea2 | 233 MB | no disponible | 0 / 0 |
| Krea 2 (modelo base) | Modelo fundacional de imagen | no aplica | no disponible | no disponible en esta consulta | no aplica |

Los tres adaptadores comparten autor y modelo base, por lo que la comparación se limita al tamaño del artefacto y al dominio de activación; no hay métricas públicas que permitan ordenarlos por calidad.

## Limitaciones y advertencias

- Contenido explícito: las palabras de activación declaradas corresponden a contenido sexual para adultos. Su uso exige verificación de edad, cumplimiento normativo por jurisdicción y garantías estrictas de consentimiento de las personas representadas.
- Riesgo de deepfakes y suplantación: un adaptador de edición sobre rostros o cuerpos puede emplearse para generar material no consentido; es la principal advertencia de producción.
- Licencia no declarada: al no especificarse términos, no hay autorización explícita para uso comercial y persiste el riesgo legal derivado de la licencia del modelo base krea2 y de las imágenes de entrenamiento.
- Ausencia de validación: cero descargas y cero likes, sin evaluación de terceros ni discusión en la comunidad.
- Documentación insuficiente: no se publican hiperparámetros, dataset ni métricas, lo que impide reproducir el entrenamiento o auditar sesgos.
- Sesgos: no documentados. No hay análisis de sesgo demográfico, estético ni de representación.
- Alucinación y artefactos: no cuantificados; en edición de imagen se traducirían en deformaciones anatómicas o alteraciones no deseadas de la imagen de entrada, sin tasa de error publicada.
- Idioma: no se documentan idiomas soportados; los prompts de la familia krea2 suelen formularse en inglés y no hay confirmación de rendimiento en castellano.
- Fechas del repositorio: creado y actualizado el 2 de octubre de 2026, con apenas un minuto de diferencia, lo que sugiere una subida automatizada sin revisión manual posterior.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-real-c-m-krea-2-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2082014648807002113
- Página del autor: https://www.runninghub.ai/user-center/1945917948739350530
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub en China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Modelo base Krea 2: https://www.krea.ai/krea-2
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-krea.2-ai-lora
- Adaptador relacionado: https://huggingface.co/RunningHubAI/rh-krea2-cc-lora
