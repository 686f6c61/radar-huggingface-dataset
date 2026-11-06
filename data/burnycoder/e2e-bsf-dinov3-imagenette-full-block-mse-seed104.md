# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed104

## Resumen

Este repositorio contiene un *featurizer* de bloques dispersos (block-sparse featurizer, BSF) entrenado desde cero sobre un clasificador de parches fijo basado en DINOv3 ViT-B/16 y el conjunto Imagenette. No es un modelo generativo ni un LLM: es un artefacto de investigación orientado a interpretabilidad, que sustituye el decodificador convencional de un autoencoder disperso (SAE) por un featurizer de ancho unitario con signo, atado (*tied*) al clasificador. El objetivo es estudiar si una representación dispersa por bloques puede preservar la salida de un modelo visión preentrenado con menor divergencia KL que una alternativa entrenada con KL directa.

Lo desarrolla BurnyCoder como parte de un estudio preregistrado y acotado (*bounded preregistered study*) sobre el repositorio `end-to-end-block-sparse-featurizers`. El perfil de entrenamiento es **full**, con **1 época completada** y semilla 104. El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m`, cuyos pesos no se incluyen en este repositorio: solo se distribuyen los pesos del BSF, la normalización fija y el clasificador entrenado.

Su relevancia es metodológica: documenta métricas de divergencia KL (0,0375 nats/imagen), precisión (98,37 %) y MSE normalizado de parches (0,5442) sobre el conjunto de validación, junto con logs por imagen. El resultado del estudio es explícitamente **exploratorio e inconcluso**: el intervalo de confianza al 95 % de la diferencia local menos KL incluye cero, y no se alcanzó el objetivo de potencia del piloto. El propio autor advierte que una KL menor solo mide la preservación de la lectura de diez clases, no la fidelidad semántica ni la aceleración de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Featurizer block-sparse de ancho unitario con signo, atado a un clasificador de parches; backbone DINOv3 ViT-B/16 (no incluido en el repo) |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por parches, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors para inferencia) |
| Idiomas soportados | en (etiqueta declarada; el modelo opera sobre imágenes, no texto) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia separada) |
| Formato de pesos | safetensors (`model.safetensors`); checkpoint de entrenamiento local con estado de optimizador y RNG no incluido en el repo |

## Arquitectura y entrenamiento

El artefacto es un featurizer block-sparse entrenado de extremo a extremo (*end-to-end*) contra un clasificador de parches fijo construido sobre DINOv3 ViT-B/16. A diferencia de los SAE con ReLU convencionales, los artefactos escalares aquí son featurizers de ancho unitario con signo y atados, lo que cambia la parametrización de la representación dispersa. La dispersión es por bloques (*block sparsity*), siguiendo la línea del paper de block-sparse featurizers y del trabajo de SAE end-to-end. El perfil de entrenamiento es **full**, con **1 época completada** y semilla 104.

El entrenamiento se realizó sobre Imagenette (diez clases, orden de torchvision) con un protocolo preregistrado. El repositorio incluye `config.json` (que fija revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento), `manifest.json` y `duplicate_audit.json` (asignaciones de imágenes y evidencia de exclusiones) y `teacher.json` (selección del clasificador). El estudio compara una variante local con una variante entrenada con KL; la diferencia media pareada local menos KL es de 0,00254596 nats/imagen sobre 5 semillas, con intervalo al 95 % de [-0,00325909, 0,008351], que incluye cero: la comparación direccional es inconclusa y no se alcanzó el objetivo de potencia del piloto.

## Capacidades

- Extracción de características dispersas por bloques sobre parches de imagen, en el espacio latente inducido por DINOv3 ViT-B/16.
- Predicción de probabilidades de clase sobre las diez clases de Imagenette mediante `VisionFeaturizer.predict`, que acepta una lista de imágenes PIL en RGB.
- Preservación de la lectura (*readout*) del clasificador de parches fijo, medida mediante divergencia KL sobre el conjunto de validación.
- Reconstrucción/ajuste de parches evaluable mediante MSE normalizado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni capacidades multilingües más allá de la etiqueta `en` del repo.
- No está pensado para acelerar inferencia: el autor indica explícitamente que una KL menor no establece aceleración.

## Casos de uso

- **Investigación en interpretabilidad de modelos visión**: usar el featurizer como objeto de estudio para comparar representaciones block-sparse frente a SAE con ReLU en un backbone DINOv3, aprovechando que el repo incluye métricas y logits por imagen para reproducir el análisis.
- **Reproducción de estudios preregistrados**: el paquete `config.json` + `manifest.json` + `duplicate_audit.json` permite replicar asignaciones de imágenes, exclusiones y condiciones de entrenamiento con la semilla 104.
- **Auditoría de preservación de *readout***: medir la divergencia KL entre las salidas del clasificador original y las del pipeline con featurizer sobre nuevos lotes de Imagenette, usando la métrica de 0,0375 nats/imagen como referencia.
- **Análisis de reconstrucción de parches**: emplear el MSE normalizado (0,5442) como línea base para evaluar variantes de dispersión por bloques o cambios en la parametrización del featurizer.
- **Docencia y divulgación sobre SAE end-to-end**: el artefacto es pequeño (9,6 M de parámetros) y autocontenido, lo que facilita demostrar el flujo de entrenamiento e inferencia con `uv sync --frozen` y `hf download`.
- **Comparación de objetivos de entrenamiento (local vs. KL)**: el propio estudio reporta la diferencia pareada entre ambas variantes, por lo que el modelo sirve como punto de partida para diseñar réplicas con mayor potencia estadística.
- **Integración en pipelines de evaluación de features**: el featurizer puede insertarse en un harness que compare representaciones inducidas frente a las del backbone, siempre que se cuente con acceso autorizado a los pesos de DINOv3.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida en validación (held-out KL) | 0,037465356 nats/imagen |
| Precisión (accuracy) | 98,3742 % |
| MSE normalizado de parches | 0,54422879 |
| Diferencia media pareada local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo de confianza al 95 % de la diferencia | [-0,00325909, 0,008351] (incluye cero; inconcluso) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con SAE alternativos más allá de la comparación interna local vs. KL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 9,6 M de parámetros en safetensors, los pesos del featurizer y el clasificador ocupan del orden de decenas de MB en fp32, pero la inferencia requiere además cargar el backbone DINOv3 ViT-B/16 (no incluido), cuyo coste de memoria no se detalla en la model card.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone DINOv3, no documentado aquí.
- Opciones de despliegue: el flujo oficial es el paquete del proyecto (`uv sync --frozen`) y la clase `e2e_bsf.inference.VisionFeaturizer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed104 | 9.599.498 | no disponible | KL 0,0375 nats/imagen; accuracy 98,37 %; MSE 0,5442 | MIT (backbone DINOv3 con licencia separada) | Hugging Face, 22 descargas |
| SAE con ReLU convencional sobre DINOv3 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Variante KL del mismo estudio (semilla comparable) | no disponible | no disponible | Diferencia media pareada de 0,0025 nats/imagen frente a la variante local | no disponible | referenciada en el estudio, sin repo público indicado |

No se dispone de datos numéricos de modelos comparables de la misma categoría (featurizers block-sparse sobre DINOv3) en la información proporcionada.

## Limitaciones y advertencias

- **Estudio inconcluso**: el intervalo de confianza al 95 % de la diferencia local menos KL incluye cero y no se alcanzó el objetivo de potencia del piloto; el resultado es exploratorio y no permite afirmar superioridad direccional.
- **Alcance métrico limitado**: una KL menor solo mide la preservación de la lectura de diez clases de Imagenette; no establece conceptos semánticos, fidelidad completa a DINOv3 ni aceleración de inferencia.
- **Entrenamiento mínimo**: solo 1 época completada en perfil full; el artefacto no debe interpretarse como un featurizer maduro.
- **Dependencia del backbone**: el repositorio excluye los pesos de DINOv3; se requiere acceso autorizado y aceptar su licencia separada. La licencia MIT de este repo no relicencia el backbone.
- **Datos no incluidos**: el artefacto excluye las fotos de Imagenette; cualquier reproducción debe obtenerse por separado.
- **Restricciones de uso comercial**: la licencia MIT cubre los pesos publicados, pero el uso comercial del pipeline completo queda condicionado por la licencia de DINOv3.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero las predicciones del clasificador pueden ser erróneas fuera de la distribución de Imagenette; no se documentan análisis de sesgo.
- **Idioma**: la etiqueta `en` es nominal; el modelo no procesa texto.
- **Sesgos**: no se han publicado análisis de sesgos en la información disponible.

## Enlaces

- [Hugging Face: BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed104](https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-mse-seed104)
- [Repositorio del proyecto end-to-end-block-sparse-featurizers](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers)
- [Paper BSF (arXiv:2606.25234)](https://arxiv.org/abs/2606.25234)
- [Paper end-to-end SAE (arXiv:2405.12241)](https://arxiv.org/abs/2405.12241)
- [Código de Goodfire: block-sparse-featurizer](https://github.com/goodfire-ai/block-sparse-featurizer)
- [Preregistro del estudio](https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md)
- [Modelo base: facebook/dinov3-vitb16-pretrain-lvd1689m](https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m)
