# bindx-dev/realvis51-inpaint-npu-sm8550

## Resumen

`bindx-dev/realvis51-inpaint-npu-sm8550` es un paquete de binarios de contexto QNN para el DSP Hexagon HTP del SoC Qualcomm Snapdragon 8 Gen 2 (`SM8550`, HTP `v73`, `soc_model=43`). No se trata de un modelo de difusion entrenado desde cero, sino de una compilacion offline del modelo de inpainting derivado de `SG161222/Realistic_Vision_V5.1_noVAE`, empaquetada para ejecutarse sobre la NPU del movil mediante Qualcomm AI Runtime (QAIRT) `2.52.1.261105`.

El interes practico esta en el despliegue: permite ejecutar inpainting de imagenes realistas en el propio dispositivo sin depender de la nube, aprovechando la aceleracion del Hexagon HTP. El repositorio ocupa 2,2 GB y contiene los binarios compilados especificos para ese SoC, lo que implica que no es portable a otros Snapdragon ni a GPU/CPU genericas.

El autor (`bindx-dev`) indica que la compilacion se ha realizado offline y que esta pendiente de verificacion en dispositivo con el kit `HDK8550`. Es, por tanto, un artefacto de despliegue temprano, orientado a desarrolladores que trabajen con el stack QNN de Qualcomm y quieran integrar inpainting local en aplicaciones Android sobre hardware SM8550.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (inpainting) compilado a binario de contexto QNN para Hexagon HTP; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (compilado con QAIRT; precisiones concretas no especificadas) |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | binarios de contexto QNN (`.bin`/context binaries) para Hexagon HTP v73 |
| SoC objetivo | Qualcomm Snapdragon 8 Gen 2 (`SM8550`), HTP `v73`, `soc_model=43` |
| Compilador | Qualcomm AI Runtime (QAIRT) `2.52.1.261105` |
| Modelo base | `SG161222/Realistic_Vision_V5.1_noVAE` |
| Tamano del repositorio | 2,2 GB |
| Estado | Compilado offline; pendiente de verificacion en dispositivo `HDK8550` |

## Arquitectura y entrenamiento

El artefacto no incluye informacion sobre el entrenamiento del modelo de difusion subyacente. El modelo base referenciado, `SG161222/Realistic_Vision_V5.1_noVAE`, es un modelo de difusion para generacion de imagenes fotorrealistas, y esta variante se orienta a inpainting (relleno de regiones enmascaradas). La model card del repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste fino especifico para inpainting.

La innovacion tecnica relevante es el pipeline de compilacion: el modelo se ha convertido a binarios de contexto QNN mediante QAIRT `2.52.1.261105`, dirigidos especificamente al Hexagon HTP v73 del SM8550. Esto implica que la inferencia se ejecuta sobre la NPU del SoC, no sobre CPU ni GPU. No se especifican en la informacion disponible detalles sobre el grafo compilado, el particionado entre HTP y otros procesadores, ni las precisiones numericas empleadas en la compilacion.

## Capacidades

- Inpainting de imagenes: relleno de regiones enmascaradas en imagenes fotorrealistas, heredado del modelo base Realistic Vision V5.1.
- Generacion de imagenes fotorrealistas en el dominio de retrato y fotografia realista, segun las capacidades del modelo base.
- Ejecucion en NPU: inferencia acelerada sobre Hexagon HTP del Snapdragon 8 Gen 2.
- Ejecucion local en dispositivo: no requiere conexion a la nube para la inferencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al tratarse de un modelo de imagen.
- Capacidades multilingues: no aplica.
- Modos especiales (thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion de fotos en aplicaciones Android: eliminar objetos no deseados de una fotografia aplicando una mascara y ejecutando el inpainting sobre la NPU del SM8550, sin subir la imagen a un servidor.
- Retoque de retratos en tiempo real: corregir imperfecciones o rellenar zonas ocluidas en fotos de personas dentro de una app de camara, aprovechando la aceleracion del Hexagon HTP para reducir la latencia percibida.
- Restauracion de fotografias danadas: rellenar zonas perdidas o arañadas en imagenes antiguas escaneadas, ejecutando el modelo localmente para preservar la privacidad del contenido.
- Herramientas de diseno offline: integrar inpainting en aplicaciones de edicion grafica que deban funcionar sin conectividad, como suites de retoque para profesionales en movilidad.
- Prototipado de pipelines QNN: servir como referencia para desarrolladores que quieran compilar y desplegar modelos de difusion en el Hexagon HTP del SM8550, validando el flujo QAIRT de extremo a extremo.
- Eliminacion de marcas de agua o elementos superpuestos en flujos de postproduccion controlados, siempre que la licencia del modelo base lo permita y se respeten las condiciones de uso.
- Investigacion en eficiencia energetica: medir el consumo y el rendimiento de inpainting sobre NPU movil frente a ejecuciones en GPU o en servidor, usando este paquete como base de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la compilacion esta pendiente de verificacion en dispositivo con `HDK8550`, por lo que no hay metricas de latencia, throughput ni calidad de imagen reportadas.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon 8 Gen 2 (`SM8550`) exclusivamente, con Hexagon HTP `v73` y `soc_model=43`. No es portable a otros SoC sin recompilacion.
- Memoria: el repositorio ocupa 2,2 GB; el consumo en RAM/VRAM compartida durante la inferencia no esta especificado en la informacion disponible.
- GPU recomendadas: no aplica; el artefacto esta compilado para NPU, no para GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no aplica; los binarios QNN no se ejecutan en GPU de escritorio.
- Opciones de despliegue: runtime de Qualcomm AI Runtime (QAIRT) `2.52.1.261105` sobre el HTP del SM8550; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles; pendientes de verificacion en dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | SoC objetivo | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `bindx-dev/realvis51-inpaint-npu-sm8550` | Inpainting compilado a QNN | Snapdragon 8 Gen 2 (SM8550) | Binarios de contexto QNN | creativeml-openrail-m | Compilado, pendiente de verificacion |
| `SG161222/Realistic_Vision_V5.1_noVAE` | Modelo de difusion (imagen) | GPU/CPU generica | safetensors | creativeml-openrail-m | Publicado y verificado por la comunidad |
| Otros paquetes QNN de inpainting para SM8550 | Inpainting compilado a QNN | Snapdragon 8 Gen 2 | Binarios de contexto QNN | no disponible | no disponible |

No se dispone de informacion sobre otros paquetes QNN comparables en la informacion proporcionada. La comparacion con el modelo base es la referencia mas directa: mismo modelo de difusion, distinto formato de despliegue y distinto hardware objetivo.

## Limitaciones y advertencias

- Dependencia estricta de hardware: los binarios solo funcionan en Snapdragon 8 Gen 2 (`SM8550`) con HTP `v73`; no se ejecutan en otros SoC, GPU ni CPU sin recompilacion.
- Estado de verificacion: la model card indica que la compilacion esta pendiente de verificacion en dispositivo `HDK8550`, por lo que la correccion y el rendimiento en hardware real no estan confirmados.
- Version de QAIRT fijada: el artefacto depende de QAIRT `2.52.1.261105`; cambios de version del runtime pueden romper la compatibilidad.
- Sesgos y alucinacion visual: al ser un modelo de difusion fotorrealista, puede generar contenido plausible pero incorrecto en las regiones rellenadas, y hereda los sesgos del dataset de entrenamiento del modelo base.
- Licencia: `creativeml-openrail-m` impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar las condiciones antes de integrarlo en productos.
- Falta de documentacion: no se detallan precisiones numericas, particionado del grafo ni metricas de calidad, lo que dificulta evaluar su idoneidad en produccion.
- Sin soporte de texto ni lenguaje: no es un modelo de chat, razonamiento ni codigo; cualquier uso en esos dominios queda fuera de su alcance.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bindx-dev/realvis51-inpaint-npu-sm8550
- Modelo base: https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Qualcomm AI Runtime (QAIRT): https://www.qualcomm.com/developer/software/qualcomm-ai-engine-direct
- Documentacion de Qualcomm AI Engine Direct (QNN): https://docs.qualcomm.com/bundle/publicresource/topics/80-63442-50/overview.html
