# accidentalgenius101/legA-E-shuffle-lam1

## Resumen

`legA-E-shuffle-lam1` es un artefacto de replicación científica publicado por el usuario accidentalgenius101 en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un clasificador binario de imagen construido sobre un backbone ViT-S/14 (`facebook/dinov2-small`) con una cabeza MLP entrenada desde cero, y su finalidad es reproducir el experimento de "reliance shaping" descrito en la Sección 2.1 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) sobre el conjunto de datos Waterbirds.

El checkpoint corresponde al brazo A1 (penalización tipo shuffle, lambda=1, semilla 0) de la "Leg A" de un protocolo de replicación propio (SPEC.md). El autor declara explícitamente en la model card que el resultado es un **fallo acotado**: el fenómeno de reliance del artículo se reproduce como un transitorio temprano (WGA de validación pico de 0,945 en el paso 200) pero decae y no persiste hasta el punto final de 25.000 pasos (WGA de test final de 0,422). La conclusión del autor es que la persistencia del endpoint no es reproducible con la información publicada, porque el artículo omite cantidades decisivas del protocolo (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda).

Es relevante ahora como evidencia empírica negativa sobre la reproducibilidad de resultados de interpretabilidad y shaping de representaciones, y como ejemplo de práctica de replicación rigurosa: brazos de contexto, hipótesis pre-declaradas y veredictos por hipótesis. No debe confundirse con un modelo utilizable para tareas de NLP, visión general o agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) congelable como encoder + cabeza MLP (384 -> 256 -> 256 -> 1, activación GELU) sobre el token CLS normalizado de 384 dimensiones |
| Parámetros totales | 22.221.185 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imágenes 224x224) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de imagen de dos etapas: un encoder ViT-S/14 preentrenado (DINOv2-small) que produce un token CLS de 384 dimensiones, normalizado, y una cabeza MLP entrenada desde cero con arquitectura 384 -> 256 -> 256 -> 1 y activación GELU. La entrada son imágenes de 224x224 y el lote de entrenamiento es de 32. El entrenamiento usa AdamW con weight decay 0, learning rates separados constantes (encoder 1e-6, valor indicado en el artículo; cabeza 1e-3), 25.000 pasos, semilla 0 y refresco de la dirección de penalización cada 100 pasos. El encoder no está congelado en este brazo (`frozen=False`).

El entrenamiento se realiza sobre Waterbirds con splits "filed": 2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos, y 512 imágenes de validación y 512 de test con 4 grupos de 128 cada uno e identidades disjuntas. La innovación técnica no está en la arquitectura sino en el objetivo: una penalización de "reliance shaping" que empuja al modelo a no apoyarse en la dirección de diferencia de medias calculada en el paso 0 (proxy del sesgo de fondo). El autor documenta en `config.json` (campo `deviations`) las cantidades que el artículo deja sin especificar y las enmiendas aplicadas. El autor también informa de un defecto propio corregido: el estimador de ruido promediaba 8 muestras con signo antes de elevar al cuadrado, calculando una funcional ~8 veces más débil que la definida en el artículo.

## Capacidades

- Clasificación binaria de imágenes de aves en Waterbirds (predicción de etiqueta a partir de una imagen de 224x224).
- Extracción de representaciones: el token CLS de 384 dimensiones de DINOv2-small es reutilizable como feature vector.
- Medición de reliance: el checkpoint permite calcular AUROC de fondo (L1) a lo largo de la dirección de diferencia de medias del paso 0.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación descrita.

## Casos de uso

- Replicación de experimentos de interpretabilidad: sirve como artefacto de referencia para contrastar la Sección 2.1 de arXiv:2611.07071 y verificar si el transitorio temprano (WGA pico 0,945 en el paso 200) se reproduce en otros harnesses.
- Auditoría de protocolos de investigación: el par checkpoint + model card documenta qué cantidades del artículo quedan sin especificar (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza, lambda) y permite a otros equipos diseñar protocolos que las declaren.
- Estudio de dinámicas de entrenamiento: útil para analizar el mecanismo de pico y decaimiento descrito (la penalización aplasta la medida de reliance en ~200 pasos y luego la sensibilidad de la cabeza crece 15-25x a LR constante).
- Docencia sobre reproducibilidad: ejemplo real de fallo acotado con brazos de contexto y veredictos por hipótesis (H1 exonerada, H2 convicta y corregida, H3 convicta como defecto de protocolo pero refutada como causa del endpoint, H4 caracterizada).
- Análisis de sesgo de fondo en clasificadores de imagen: el checkpoint y las métricas por grupo (WGA por grupo en validación y test) permiten estudiar cómo un clasificador ViT-S/14 se apoya en correlaciones espurias en Waterbirds.
- Punto de partida para fine-tuning controlado: la cabeza MLP y el encoder DINOv2-small pueden reutilizarse en experimentos propios de debiasing con penalizaciones de reliance, comparando contra los números publicados aquí.

## Benchmarks y rendimiento

Resultados declarados por el autor para este checkpoint (Waterbirds, splits filed, semilla 0, lectura en el paso 25.000):

| Métrica | Valor |
|---|---|
| WGA de validación pico | 0,945 en el paso 200 (lectura de trayectoria, no de endpoint) |
| WGA de validación en endpoint | 0,375 (grupos: 0,789 / 0,375 / 0,836 / 0,984) |
| WGA de test en endpoint | 0,422 (grupos: 0,898 / 0,422 / 0,789 / 0,961) |
| L1 (AUROC de fondo, dirección del paso 0) | validación 0,534; test 0,550 |

Comparación con los otros brazos limpios del mismo protocolo (endpoint en el paso 25.000):

| Brazo | lambda | WGA val pico (paso) | WGA val endpoint | WGA test endpoint | L1 test endpoint |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR único 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput congelado lambda 10 (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

El artículo original reporta endpoints de penalización de 93-97,7% de WGA de test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyas cantidades decisivas no están publicadas. Ningún brazo limpio de esta replicación alcanza la barra de hold pre-declarada (WGA de test en endpoint >= 88% sin colapso tardío).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los 22,2 M de parámetros (el repositorio ocupa 0,1 GB); en fp16 aproximadamente 45 MB de pesos más activaciones de una imagen de 224x224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un clasificador de visión con pesos safetensors, el despliegue natural es PyTorch/TorchScript u ONNX Runtime; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La categoría real de este artefacto es "checkpoint de replicación de un experimento de debiasing sobre Waterbirds", no "modelo fundacional". La comparación más informativa es con los propios brazos del estudio y con el resultado publicado:

| Referencia | Parámetros | Contexto | WGA test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-E-shuffle-lam1 (este) | 22,2 M | no aplica (imagen 224x224) | 0,422 en endpoint; pico 0,945 en paso 200 | other | pesos safetensors públicos |
| Brazos shuffle/gradinput del mismo estudio | 22,2 M | no aplica | 0,000-0,422 en endpoint | other | no publicados como repos separados |
| Endpoint del artículo (Sección 2.1, 3 semillas) | no disponible | no disponible | 93-97,7% | no disponible | modelos no liberados por Goodfire |
| `facebook/dinov2-small` (backbone) | 22,1 M (ViT-S/14) | no aplica | no aplica (backbone sin cabeza) | Apache 2.0 (según el modelo original) | público en Hugging Face |

## Limitaciones y advertencias

- El propio autor declara el resultado como FAILED (acotado): ningún brazo limpio alcanza la barra de hold pre-declarada y el endpoint no reproduce el 93-97,7% del artículo.
- El modelo solo clasifica imágenes de Waterbirds; no es un modelo de lenguaje y no debe evaluarse como tal.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las predicciones del clasificador pueden apoyarse en el fondo (correlación espuria) en lugar del objeto, que es precisamente el fenómeno que el experimento intenta medir.
- Sesgos conocidos: el conjunto Waterbirds está construido con grupos perfectamente confundidos en entrenamiento (2 grupos), lo que induce dependencia del contexto de fondo; las métricas por grupo muestran un rendimiento muy desigual (WGA de test por grupo entre 0,422 y 0,961).
- Limitaciones de contexto e idioma: no procesa texto ni secuencias; la ventana de contexto no aplica.
- Restricciones de licencia: la licencia es "other" y no se detallan términos; debe consultarse al autor antes de cualquier uso comercial. El backbone DINOv2 tiene su propia licencia (Apache 2.0 en el modelo original de Facebook), que conviene verificar por separado.
- Caveat para producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay pipeline declarado ni garantías de mantenimiento. No debe desplegarse en producción sin validación propia.
- El autor documenta defectos propios corregidos (LR único de 1e-6 aplicado a todos los parámetros en el régimen filed original, estimador de ruido promediado antes de elevar al cuadrado); versiones anteriores del harness pueden dar números distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/legA-E-shuffle-lam1
- Artículo replicado (Goodfire, "Shaping & Monitoring Models through their Internal Representations"): https://arxiv.org/abs/2611.07071
- Backbone DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Repositorio, paper, blog o demo adicionales: no disponibles en la información proporcionada.
