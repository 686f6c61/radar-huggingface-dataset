# edgarmoreau/walrus-heart

## Resumen

Walrus-Heart es un modelo surrogate de dinámica de ondas eléctricas cardiacas obtenido por fine-tuning del modelo fundacional de física Walrus (1.300 millones de parámetros, desarrollado por Polymathic AI). Lo publica el usuario edgarmoreau y predice la evolución temporal de dos campos sobre una lámina 2D de tejido cardiaco: el potencial de membrana (voltage) y la variable de recuperación (recovery), condicionados por un mapa de conductividad constante que codifica tejido sano, fibrótico o cicatrizado (valor 0). El modelo aprende a simular latidos normales, latidos prematuros y reentrada en espiral, el mecanismo responsable de la taquicardia ventricular.

La relevancia del proyecto es doble. Por un lado, demuestra que el preentrenamiento en un modelo fundacional de EDPs transfiere a un dominio biomédico concreto: los checkpoints inicializados desde Walrus superan a la misma arquitectura entrenada desde cero, incluso usando ocho veces menos datos cardiacos (200 frente a 1.600 ejecuciones). Por otro, publica de forma transparente los fallos: los rollouts autorregresivos divergen a los 10-20 pasos y la clasificación de sostenibilidad de arritmias queda al nivel del azar.

Se trata de un modelo de investigación y docencia, con licencia MIT, pesos en safetensors y un repositorio de 15,6 GB que incluye varios checkpoints, configuraciones Hydra y rollouts de test. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto conversacional; su "contexto" son 6 fotogramas temporales de 128 × 128 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para EDPs (base Walrus), entrada 2D 128 × 128 con eje z singleton, predicción delta causal en el tiempo, RoPE aprendible por eje |
| Parametros totales | 1.300 millones (1,3 B, según el modelo base Walrus) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 6 fotogramas pasados de entrada (ventana temporal); resolución espacial 128 × 128 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no aplica (modelo de simulación física, no lingüístico) |
| Licencia | MIT (modelo); dataset CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `model_config.yaml`, `field_to_index_map.json` y `metrics.json` por checkpoint |

## Arquitectura y entrenamiento

Walrus-Heart hereda la arquitectura del modelo fundacional Walrus de Polymathic AI: un transformer que opera sobre campos físicos discretizados, con normalización reversible por muestra (RMS), predicción de deltas, causalidad temporal y RoPE aprendible por eje. Sobre el mapa de índices de campos original se añaden tres nuevas embeddings de campo (índices 67, 68 y 69) para voltage, recovery y conductivity. La entrada son 6 fotogramas de voltage y recovery junto con el mapa de conductividad constante, todo a 128 × 128 y rellenado a 3D con un eje z singleton.

El entrenamiento sigue la receta de Walrus: pérdida de 100 × MAE, optimizador AdamW (lr 1e-4, weight decay 1e-4), warmup lineal con decaimiento coseno, recorte de gradiente de 10 y precisión bf16. Cada ejecución usa 1.200 pasos con batch 2 en una única A100 de 80 GB, con unos 53 minutos de entrenamiento y 37 minutos de evaluación. Se excluyen las ventanas cuyos objetivos contienen un estímulo externo de pacing (S1/S2) porque no son predecibles a partir del pasado. Los datos proceden del dataset Ethgar/cardiac-ep-2d, generado con el modelo fenomenológico de Aliev-Panfilov sobre una lámina isotrópica 2D.

## Capacidades

- Predicción de la evolución espacio-temporal de ondas eléctricas cardiacas (voltage y recovery) sobre tejido sano, fibrótico y cicatrizado.
- Simulación de latidos normales, latidos prematuros y reentrada en espiral asociada a taquicardia ventricular.
- Modelado de heterogeneidades de tejido mediante el mapa de conductividad (0 = cicatriz).
- Rollout autorregresivo a partir de 6 fotogramas de historia (limitado a 10-20 pasos antes de divergir).
- Fine-tuning reproducible sobre el modelo base Walrus con la receta original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, visión natural, audio ni capacidades multilingües.

## Casos de uso

- Investigación en electrofisiología computacional: sustituir simulaciones de Aliev-Panfilov de alto coste por un surrogate rápido que aproxime los campos de voltage y recovery en milisegundos, útil para exploraciones paramétricas amplias.
- Docencia y visualización interactiva: el espacio de Hugging Face Ethgar/heart-waves permite mostrar la formación de espirales de reentrada en tiempo casi real, con fines didácticos sobre arritmias.
- Generación de datasets sintéticos aumentados: producir trayectorias cortas de ondas cardiacas para preentrenar o aumentar otros modelos, siempre que se limiten a horizontes de 10-20 pasos.
- Estudio de propagación en tejido fibrótico: comparar cómo el mapa de conductividad (con zonas a 0) altera la dinámica de frentes de voltaje y la variable lenta de recuperación.
- Benchmark de modelos fundacionales de física: usar los checkpoints como referencia para evaluar técnicas de transferencia desde dominios físicos generales a dominios biomédicos.
- Prototipado de pipelines de simulación cardiaca: integrar el modelo en flujos de investigación que necesiten un primer filtro rápido antes de lanzar simulaciones completas.

## Benchmarks y rendimiento

Resultados publicados en la model card (VRMSE a un paso en test; menor es mejor):

| Checkpoint | Inicialización | Ejecuciones | Voltage | Recovery | Media |
|---|---|---|---|---|---|
| pretrained_n1600 | Walrus | 1.600 | 0,181 | **0,126** | 0,154 |
| pretrained_n200 | Walrus | 200 | **0,163** | 0,127 | **0,145** |
| scratch_n1600 | Aleatoria (misma arquitectura) | 1.600 | 0,164 | 0,196 | 0,180 |
| Persistencia (repetir último fotograma) | — | — | 0,592 | 0,535 | 0,563 |

Rollout autorregresivo (checkpoint Walrus 1.600): RMSE de voltage de 0,14 a 1 paso, 0,26 a 5 pasos y 0,41 a 20 pasos. Clasificación de sostenibilidad de arritmia a 6 s: 52 % de acierto para Walrus (24 verdaderos positivos, 23 falsos positivos, 1 verdadero negativo, 0 falsos negativos; n = 48) frente al 42 % del modelo entrenado desde cero.

## Requisitos de hardware

- Entrenamiento: una A100 de 80 GB por ejecución (batch 2, 1.200 pasos, bf16).
- VRAM de inferencia: no disponible de forma explícita; con 1,3 B de parámetros en bf16 se estima del orden de 3 GB de pesos, más activaciones y buffers de rollout, por lo que debería caber en GPUs consumer con 8-16 GB.
- GPUs recomendadas: A100 80 GB para entrenamiento; RTX 4090, RTX 3090 o similares para inferencia y fine-tuning ligero.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga se realiza con PyTorch, Hydra/OmegaConf y safetensors, siguiendo el script `walrus/walrus_heart.py` del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walrus-Heart (este) | 1,3 B | Ondas eléctricas cardiacas 2D | Fine-tuning de Walrus sobre 200-1.600 ejecuciones | MIT | Hugging Face |
| polymathic-ai/walrus | 1,3 B | EDPs físicas generales | Modelo fundacional preentrenado | MIT | Hugging Face |
| Arquitectura idéntica desde cero (scratch_n1600) | 1,3 B | Ondas eléctricas cardiacas 2D | Entrenamiento desde inicialización aleatoria | MIT | Incluido en el repo |
| Persistencia (baseline trivial) | 0 | Ondas eléctricas cardiacas 2D | Repetir el último fotograma | — | Baseline de referencia |

No se dispone de comparación con otros surrogates cardiacos publicados en la información proporcionada.

## Limitaciones y advertencias

- Los rollouts autorregresivos divergen en 10-20 pasos (0,4-0,8 s de tiempo cardiaco), generando franjas de alta frecuencia no físicas.
- La predicción de si una arritmia se sostiene a 6 s está al nivel del azar (52 %), con una fuerte tendencia a predecir reentrada (23 falsos positivos de 48 casos).
- Los resultados corresponden a ejecuciones cortas (1.200 pasos); se necesitan entrenamientos más largos, entrenamiento multi-paso o con inyección de ruido y clamping físico durante el rollout.
- Datos exclusivamente simulados con el modelo fenomenológico de Aliev-Panfilov sobre una lámina isotrópica 2D; no representa anatomía cardiaca real ni anisotropía.
- Uso previsto para investigación y docencia; no apto para uso clínico ni diagnóstico.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de tool calling.
- Licencia MIT permite uso comercial, pero las limitaciones físicas y la falta de validación clínica desaconsejan cualquier aplicación en producción sanitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarmoreau/walrus-heart
- Modelo base Walrus: https://huggingface.co/polymathic-ai/walrus
- Dataset: https://huggingface.co/datasets/Ethgar/cardiac-ep-2d
- Demo interactiva: https://huggingface.co/spaces/Ethgar/heart-waves
- Código: https://github.com/edgarmoreaualix/heart-waves
- Script de entrenamiento: https://github.com/edgarmoreaualix/heart-waves/blob/main/walrus/walrus_heart.py
- Repositorio de Walrus: https://github.com/PolymathicAI/walrus
