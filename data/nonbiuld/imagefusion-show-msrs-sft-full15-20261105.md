# Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-20261105

## Resumen

ImageFusion-Show MSRS SFT full15 es un checkpoint de entrenamiento (no un modelo publicado para inferencia directa) derivado de `showlab/show-o2-1.5B-HQ`, un modelo multimodal de Show-o2 con aproximadamente 1.500 millones de parametros. Lo desarrolla el usuario Nonbiuld en el contexto del proyecto ImageFusion-Show, cuyo objetivo es la fusion de imagenes infrarrojas (IR) y visibles (VIS) mediante un modelo multimodal con supervision de cadena de pensamiento (CoT). El checkpoint representa el estado completo tras la primera etapa de ajuste supervisado (SFT) sobre el conjunto de datos MSRS.

El problema que aborda es la fusion de imagenes multi-modalidad sensorial: combinar informacion termica del infrarrojo con detalle textural del visible para producir una imagen fusionada de referencia, guiando el proceso mediante descripciones CoT en lenguaje natural. Se inicializa desde el modelo base Show-o2 1.5B HQ y entrena sobre 6.000 episodios MSRS durante 15 epocas (5.625 pasos de optimizador), con el VAE Wan2.1 congelado.

Es relevante ahora porque documenta un enfoque de fusion de imagenes basado en modelos generativos multimodales con supervision textual, una linea de investigacion activa. Sin embargo, debe subrayarse que se trata de un artefacto de entrenamiento intermedio: no es un directorio `from_pretrained` de Transformers, no esta cuantizado, conserva el optimizador y su calidad de generacion no ha sido evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal generativo Show-o2 (base `showlab/show-o2-1.5B-HQ`); VAE Wan2.1 congelado |
| Parametros totales | Aproximadamente 1.500 millones (heredados del modelo base 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ninguna; el checkpoint no ha sido cuantizado |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `checkpoint-final.pt` (PyTorch completo con optimizador, scheduler y estados RNG; no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Show-o2 1.5B HQ, un modelo multimodal que combina un transformer con un VAE de difusion (Wan2.1) para generacion de imagen y texto. En este checkpoint el VAE Wan2.1 permanece congelado y solo se ajusta la parte correspondiente al modelo base. El entrenamiento es un ajuste supervisado (SFT) sobre el conjunto MSRS, con entradas IR/VIS degradadas a tamano nativo, objetivos IR/VIS limpios, imagenes de referencia de fusion generadas por LRRNet y supervision CoT en IR/VIS/Fusion.

El checkpoint corresponde a 15 epocas y 5.625 pasos de optimizador sobre un manifiesto de 6.000 episodios MSRS. El fichero `checkpoint-final.pt` (33.970.548.554 bytes, SHA256 `9bb2c49d95fd7acc5115db43899b291dac96a4c351fb09a442a616296ec0a7d2`) contiene el modelo completo, el optimizador, el scheduler, los estados RNG de cuatro rangos y metadatos de entrenamiento. No incluye el VAE congelado ni los activos del modelo base, que deben obtenerse por separado. El manifiesto de entrenamiento tiene SHA256 `d8754324e255bf420d5af20212a81f1e9fc264a90a1695b8f97cff75cdef17a4`. Esta etapa no incluye la posterior fase de entrenamiento solo de difusion.

## Capacidades

- Fusion de imagenes infrarrojas y visibles guiada por el modelo base multimodal.
- Generacion de descripciones CoT (cadena de pensamiento) sobre IR, VIS y fusion.
- Procesamiento de imagenes a tamano nativo con degradaciones controladas.
- Generacion de imagen y texto heredada del modelo base Show-o2 1.5B HQ.
- Capacidad de reanudar entrenamiento (checkpoint con optimizador, scheduler y RNG).
- No se documentan capacidades de tool calling, function calling, agentes, vision avanzada adicional ni audio en la informacion disponible.

## Casos de uso

- Investigacion en fusion de imagenes: servir como punto de partida reproducible para experimentos de fusion IR/VIS con supervision CoT, dado que incluye el estado completo del optimizador y los metadatos de entrenamiento.
- Reanudacion de entrenamiento: el checkpoint permite continuar el SFT desde el paso 5.625 sin reiniciar, gracias a que conserva optimizador, scheduler y estados RNG de los cuatro rangos.
- Reproducibilidad de experimentos: el manifiesto de 6.000 episodios MSRS y los checksums permiten verificar la integridad del estado de entrenamiento en publicaciones o replicas.
- Desarrollo de pipelines de vision termica: base para prototipos que combinen informacion IR y VIS en aplicaciones de vigilancia o inspeccion, siempre que se complete la evaluacion de calidad pendiente.
- Estudio de supervision CoT multimodal: analisis de como las descripciones en lenguaje natural guian la fusion de imagenes, util para lineas de investigacion en razonamiento visual.
- Base para la segunda etapa de difusion: este checkpoint es el punto de partida documentado para la fase posterior de entrenamiento solo de difusion del proyecto.
- Docencia y formacion: ejemplo practico de ajuste supervisado de un modelo multimodal sobre un dataset especifico con artefactos de entrenamiento completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la perdida de entrenamiento y las pruebas de humo de ingenieria no establecen la calidad de generacion, y que la calidad de inferencia libre de imagen y texto de este checkpoint no ha sido evaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un checkpoint de entrenamiento con optimizador incluido, el fichero pesa aproximadamente 34 GB y requiere cargar el modelo completo mas el VAE Wan2.1 congelado por separado.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del checkpoint y del VAE, se requeririan GPUs de clase profesional (A100/H100) para entrenamiento o reanudacion.
- Compatibilidad con GPU de consumo: no disponible; el peso del checkpoint (33,97 GB) y la necesidad del VAE adicional hacen improbable su uso en GPUs de consumo sin reempaquetado.
- Opciones de despliegue: no aplica directamente; no es un directorio `from_pretrained` de Transformers ni un modelo GGUF. Requiere el cargador de checkpoints del proyecto (https://github.com/Reborn986/ImageFusion-Show) y los activos del modelo base y del VAE Wan2.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageFusion-Show MSRS SFT full15 (este) | ~1,5B (base) | No disponible | Fusion IR/VIS con CoT sobre Show-o2 | No disponible | Checkpoint de entrenamiento en HuggingFace |
| showlab/show-o2-1.5B-HQ | ~1,5B | No disponible | Modelo multimodal generativo base | No disponible | Modelo base en HuggingFace |
| LRRNet (referencia de fusion) | No disponible | No aplica | Fusion de imagenes IR/VIS | No disponible | Referencia usada en el dataset |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para inferencia: es un checkpoint de entrenamiento con optimizador incluido, no un directorio `from_pretrained` de Transformers.
- La calidad de generacion libre de imagen y texto no ha sido evaluada; la perdida de entrenamiento no es indicador de calidad.
- Algunas descripciones CoT originales mencionan rayas horizontales mientras que el algoritmo de degradacion genera rayas verticales; los textos afectados se conservaron marcados para revision.
- Las imagenes degradadas fueron regeneradas con el algoritmo proporcionado y semillas deterministas; no se garantiza que sean identicas a pixel a las originales observadas al redactar los CoT.
- No se designo un manifiesto de validacion independiente.
- El checkpoint contiene rutas locales de entrenamiento y metadatos.
- No incluye el VAE Wan2.1 congelado ni los activos del modelo base.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de contexto o idioma: no disponibles en la informacion proporcionada.
- No contiene la posterior etapa de entrenamiento solo de difusion.

## Enlaces

- HuggingFace: https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-20261105
- Proyecto GitHub: https://github.com/Reborn986/ImageFusion-Show
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ
