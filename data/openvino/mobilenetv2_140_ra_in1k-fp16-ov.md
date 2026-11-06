# OpenVINO/mobilenetv2_140_ra_in1k-fp16-ov

## Resumen

El modelo `OpenVINO/mobilenetv2_140_ra_in1k-fp16-ov` es una conversión al formato Intermediate Representation (IR) de OpenVINO del clasificador de imágenes `timm/mobilenetv2_140.ra_in1k`, publicado por el equipo de OpenVINO (Intel). No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución optimizada para inferencia del checkpoint original de la librería `timm`, con los pesos comprimidos a FP16. El modelo base es una MobileNetV2 con factor de anchura 1.4, entrenada con recetas de augmentación RandAugment sobre ImageNet-1k (el sufijo `ra_in1k` indica precisamente esto).

La relevancia de esta ficha es práctica: ofrece a desarrolladores que despliegan visión por computadora en hardware Intel (CPU, iGPU, NPU) un artefacto listo para cargar con OpenVINO Runtime y la Model API, evitando el paso de conversión desde PyTorch. Al ser un clasificador ligero de la familia MobileNet, está pensado para escenarios de edge computing, AI PCs y entornos con restricciones de latencia y memoria, más que para tareas generativas o razonamiento multimodal.

Conviene subrayar que la model card es extremadamente escueta: no aporta métricas de precisión, detalles del dataset más allá del identificador del modelo base, ni información sobre idiomas (irrelevante en un clasificador de imágenes). Toda la información técnica sustantiva sobre arquitectura y entrenamiento procede del modelo original de `timm`, no de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y conexiones lineales de cuello de botella), factor de anchura 1.4 |
| Parametros totales | no disponible en la informacion proporcionada (el identificador indica anchura 1.4 sobre MobileNetV2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen; resolución de entrenamiento típica de ImageNet, no disponible explícitamente) |
| Tipos de cuantizacion | FP16 (pesos comprimidos en el IR); el ecosistema OpenVINO permite otras precisiones (INT8, etc.) mediante conversión, no publicadas en este repo |
| Idiomas soportados | no disponible (clasificador de imágenes, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), pesos en FP16 |

## Arquitectura y entrenamiento

El modelo subyacente es MobileNetV2, una red convolucional diseñada para eficiencia computacional mediante bloques de residual invertido (*inverted residual blocks*) con convoluciones separables en profundidad y conexiones de cuello de botella lineales. El sufijo `140` corresponde a un factor de anchura de 1.4, que escala los canales de la red respecto a la variante base. El sufijo `ra_in1k` indica que el checkpoint de `timm` fue entrenado sobre ImageNet-1k con RandAugment como política de augmentación de datos.

No se dispone en la información proporcionada de datos sobre número de tokens (no aplica), composición exacta del dataset más allá de ImageNet-1k, ni sobre si se aplicaron etapas de refinamiento posteriores. La conversión a OpenVINO IR con pesos FP16 la realiza el equipo de OpenVINO y no altera la topología de la red; únicamente modifica el formato de serialización y la precisión numérica de los pesos para acelerar la inferencia en hardware Intel.

## Capacidades

- Clasificación de imágenes (image-classification) sobre las clases de ImageNet-1k, devolviendo etiquetas y probabilidades.
- Extracción de características visuales mediante la red convolucional subyacente (uso como backbone, aunque no está documentado en esta model card).
- Inferencia optimizada en CPU, GPU integrada y NPU de hardware Intel a través de OpenVINO Runtime.
- Integración con la Model API de OpenVINO para preprocesado, postprocesado y visualización de resultados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión generativa, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Clasificación de imágenes en producción sobre AI PCs y equipos edge: el modelo se carga como IR con OpenVINO Runtime y clasifica imágenes en tiempo real en CPU o iGPU, aprovechando la compresión FP16 para reducir huella de memoria.
- Preprocesado en pipelines de visión industrial: como primera etapa de filtrado o etiquetado de imágenes antes de modelos más pesados, gracias a su bajo coste computacional.
- Moderación y etiquetado automático de contenido visual en servicios de almacenamiento de imágenes, usando las predicciones de ImageNet como señal gruesa de categoría.
- Aplicaciones de accesibilidad: descripción de categoría de objeto en tiempo real en dispositivos de bajo consumo, con inferencia local sin dependencia de la nube.
- Prototipado rápido en investigación: servir como baseline de clasificación ligera para comparar contra modelos más grandes antes de escalar, aprovechando la disponibilidad del checkpoint original en `timm`.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con OpenVINO, las imágenes no salen del dispositivo, lo que encaja en escenarios sanitarios o industriales con datos sensibles.
- Validación de pipelines de conversión OpenVINO: usar este IR como referencia para verificar que la cadena de conversión de modelos `timm` a IR funciona correctamente en una infraestructura dada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un modelo FP16 de MobileNetV2 con anchura 1.4, la huella es del orden de decenas de megabytes, pero no se confirma cifra exacta.
- GPU recomendadas: hardware Intel con soporte OpenVINO (iGPU integradas, NPU de AI PCs, GPUs Intel Arc); también CPU Intel. No se documentan recomendaciones para A100, H100 ni RTX 4090 en esta model card.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo con soporte OpenVINO, pero no se confirma explícitamente en la información disponible.
- Opciones de despliegue: OpenVINO Runtime (versión 2026.1.0 o superior) y OpenVINO Model API 0.4.0 o superior; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenVINO/mobilenetv2_140_ra_in1k-fp16-ov | MobileNetV2 (anchura 1.4) | no disponible | imagen (resolución no especificada) | Apache-2.0 | OpenVINO IR FP16 | Hugging Face, 19 descargas |
| timm/mobilenetv2_140.ra_in1k (modelo base) | MobileNetV2 (anchura 1.4) | no disponible | imagen | Apache-2.0 (según model card) | PyTorch (safetensors) | Hugging Face `timm` |
| Otras conversiones OpenVINO de clasificadores `timm` | varía | varía | imagen | según modelo original | OpenVINO IR | Hugging Face, organización OpenVINO |

No se dispone de datos de precisión comparada entre estas variantes en la información proporcionada, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card remite explícitamente a la model card original de `timm/mobilenetv2_140.ra_in1k` para las limitaciones; esta ficha no las reproduce porque no están en la información proporcionada.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ImageNet-1k, es esperable heredar los sesgos de dicho dataset, pero no se confirma.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un clasificador puede producir predicciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no aplica contexto textual; el modelo clasifica imágenes y no procesa lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint original de `timm` antes de redistribuir.
- Caveat de producción: requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; la integración con otros runtimes no está soportada por este artefacto.
- El repositorio figura con tamaño de 0.0 GB, lo que puede indicar que la descarga de pesos requiere verificar la integridad de los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/mobilenetv2_140_ra_in1k-fp16-ov
- Modelo base original: https://huggingface.co/timm/mobilenetv2_140.ra_in1k
- Documentación del formato IR de OpenVINO: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- OpenVINO Model API en GitHub: https://github.com/open-edge-platform/model_api
- Documentación de OpenVINO Model API: https://open-edge-platform.github.io/model_api/latest/
- Página del toolkit en Intel: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Artículo de Wikipedia sobre OpenVINO: https://en.wikipedia.org/wiki/OpenVINO
- Licencia Apache-2.0: https://spdx.org/licenses/Apache-2.0.html
