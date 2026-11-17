# Ethgar/walrus-heart

## Resumen

Walrus-Heart es un ajuste fino del modelo fundacional de física Walrus (1.300 millones de parámetros, desarrollado por Polymathic AI) especializado en predecir la propagación de ondas eléctricas en tejido cardíaco. El modelo resuelve un problema de simulación de ecuaciones en derivadas parciales (PDE) de tipo reacción-difusión: dado un historial de seis fotogramas de voltaje transmembrana y variable de recuperación sobre un mapa de conductividad tisular, predice el siguiente estado del campo eléctrico cardíaco. Es relevante porque demuestra que el preentrenamiento en dinámica continua de dominios diversos transfiere a un dominio biomédico concreto con menos datos específicos.

El autor (Ethgar) publica tres checkpoints: dos inicializados desde Walrus y entrenados con 1.600 y 200 ejecuciones de simulación respectivamente, y uno entrenado desde cero con la misma arquitectura. El resultado principal es que el ajuste fino desde Walrus supera al entrenamiento desde cero incluso con ocho veces menos datos cardíacos, aunque la mejora se concentra en la variable de recuperación lenta y no en los frentes de voltaje. El modelo opera sobre rejillas 2D de 128 × 128 píxeles y se distribuye con licencia MIT.

Se trata de un modelo de investigación y docencia, no clínico: los datos son simulados con el modelo fenomenológico de Aliev-Panfilov sobre una lámina isotrópica 2D, no registros reales de pacientes ni geometrías anatómicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con RoPE aprendible (base Walrus, modelo fundacional de dinámica continua) |
| Parámetros totales | 1.300 millones (1,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 6 fotogramas de entrada (ventana temporal causal); resolución espacial 128 × 128 |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (modelo de simulación física, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `model_config.yaml` (Hydra) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Walrus, un transformer con atención y RoPE aprendible por eje (`learnable_rope`, `rope_per_axis`), adaptado a la predicción de campos físicos. La entrada son seis fotogramas pasados de `voltage` y `recovery` (variables predichas) más `conductivity` (mapa tisular constante, con valor 0 para cicatriz), en rejillas de 128 × 128 rellenadas a 3D con una dimensión z singleton. Se añaden tres nuevas embeddings de campo al mapa de índices de Walrus (índices 67, 68 y 69).

El entrenamiento sigue la receta original de Walrus: normalización reversible por muestra RMS, predicción de delta, causalidad temporal, pérdida de 100 × MAE, AdamW con lr 1e-4 y weight decay 1e-4, calentamiento lineal más coseno, recorte de gradiente de 10 y precisión bf16. Cada ejecución consta de 1.200 pasos con batch 2, ejecutada en una A100 de 80 GB, con aproximadamente 53 minutos de entrenamiento y 37 minutos de evaluación. Se excluyen las ventanas cuyos objetivos contienen un estímulo externo (pacing S1/S2), por no ser predecibles desde el pasado. El dataset es `Ethgar/cardiac-ep-2d`, con licencia CC BY 4.0.

## Capacidades

- Predicción de la evolución espacio-temporal del voltaje transmembrana y la variable de recuperación en tejido cardíaco 2D.
- Simulación de latidos normales, latidos prematuros y reentrada en espiral (base de la taquicardia ventricular).
- Modelado sobre tejido sano, fibrótico y con cicatriz (mapa de conductividad con zonas de valor 0).
- Predicción autorregresiva de un paso con calidad razonable (VRMSE de voltaje de 0,163 en el mejor checkpoint).
- Rollout multi-paso a partir de sus propias predicciones, con degradación progresiva a partir de 10-20 pasos.
- No soporta tool calling, function calling, agentes ni capacidades multilingües: es un modelo de simulación física, no un modelo de lenguaje.

## Casos de uso

- Docencia de electrofisiología cardíaca: el modelo permite visualizar la propagación de ondas y la formación de espirales de reentrada en un cuaderno interactivo, sin necesidad de ejecutar un solver de PDE completo.
- Prototipado rápido de surrogate models: sirve como punto de partida para quien quiera entrenar un emulador de simulaciones cardíacas y necesite una referencia de ajuste fino desde un modelo fundacional de física.
- Investigación en transferencia entre dominios: permite estudiar cuánto conocimiento de dinámica continua transfiere Walrus a un dominio biomédico concreto, comparando contra el checkpoint entrenado desde cero.
- Generación de datos sintéticos de arritmias a corto plazo: con rollouts de hasta 10 pasos (0,4 s de tiempo cardíaco) se pueden producir secuencias de ondas espirales para aumentar datasets de entrenamiento de otros modelos.
- Benchmark de arquitecturas de surrogate: los tres checkpoints publicados y sus métricas permiten comparar variantes de inicialización y cantidad de datos en una tarea física reproducible.
- Exploración de tejido fibrótico: al condicionar sobre el mapa de conductividad, permite estudiar cualitativamente cómo la fibrosis altera la propagación, útil en investigación básica sobre mecanismos de arritmia.

## Benchmarks y rendimiento

Resultados de VRMSE de un paso en test (menor es mejor), según la model card:

| Checkpoint | Inicialización | Ejecuciones | VRMSE voltaje | VRMSE recuperación | VRMSE medio |
|---|---|---|---|---|---|
| `pretrained_n1600` | Walrus | 1.600 | 0,181 | **0,126** | 0,154 |
| `pretrained_n200` | Walrus | 200 | **0,163** | 0,127 | **0,145** |
| `scratch_n1600` | Aleatoria | 1.600 | 0,164 | 0,196 | 0,180 |
| Persistencia (repetir último fotograma) | — | — | 0,592 | 0,535 | 0,563 |

Rollout autorregresivo (checkpoint Walrus 1.600): RMSE de voltaje de 0,14 a 1 paso, 0,26 a 5 pasos y 0,41 a 20 pasos. Clasificación de sostenimiento de arritmia a 6 s: 52 % de acierto con Walrus (24 verdaderos positivos, 23 falsos positivos, 1 verdadero negativo, 0 falsos negativos; n = 48) frente a 42 % desde cero.

## Requisitos de hardware

- Entrenamiento: una A100 de 80 GB por ejecución (1.200 pasos, batch 2, bf16, ~53 min de entrenamiento más ~37 min de evaluación).
- Inferencia: el modelo tiene 1,3 B parámetros; en bf16 requiere aproximadamente 2,6 GB de pesos más memoria de activaciones para rejillas de 128 × 128 y seis fotogramas. No se han publicado cifras exactas de VRAM de inferencia.
- GPU recomendadas: A100 o H100 para entrenamiento; para inferencia, cualquier GPU con al menos 8-12 GB de VRAM debería ser suficiente, aunque el dato no está confirmado en la información disponible.
- Cabe en GPU de consumo (RTX 3090, RTX 4090, etc.) para inferencia, siempre que se disponga de suficiente memoria para las activaciones.
- Despliegue: carga mediante PyTorch, Hydra/OmegaConf y safetensors, siguiendo el script `walrus_heart.py` del repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walrus-Heart (este) | 1,3 B | 6 fotogramas, 128 × 128 | PDE cardíaca 2D (reacción-difusión) | MIT | Hugging Face |
| Walrus (base) | 1,3 B | Multi-dominio de dinámica continua | PDEs de física general | MIT | Hugging Face |
| Arquitectura desde cero (`scratch_n1600`) | 1,3 B | 6 fotogramas, 128 × 128 | PDE cardíaca 2D | MIT | Incluido en el mismo repo |

No se dispone de información sobre otros surrogate models cardíacos comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Rollouts largos fallan: alimentado con sus propias predicciones, todos los checkpoints derivan hacia franjas de alta frecuencia tras 10-20 pasos (0,4-0,8 s de tiempo cardíaco).
- La clasificación de si una arritmia se sostiene tras 6 s está al nivel del azar (52 %), con tendencia a predecir reentrada casi siempre (23 falsos positivos de 48 casos).
- Los datos son exclusivamente simulados con el modelo fenomenológico de Aliev-Panfilov sobre una lámina isotrópica 2D; no hay validación con registros reales ni geometrías anatómicas 3D.
- No apto para uso clínico: el propio autor lo restringe a investigación y docencia.
- Las ejecuciones son cortas (1.200 pasos); el autor señala que entrenamiento más largo, entrenamiento multi-paso con inyección de ruido y clamping físico en el rollout son pasos pendientes.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni tiene capacidades multilingües.
- Riesgo de alucinación en el sentido físico: puede generar patrones plausibles pero incorrectos tras varios pasos de rollout.
- Licencia MIT, permisiva para uso comercial, pero las limitaciones científicas hacen desaconsejable cualquier aplicación clínica o de producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethgar/walrus-heart
- Modelo base Walrus: https://huggingface.co/polymathic-ai/walrus
- Dataset: https://huggingface.co/datasets/Ethgar/cardiac-ep-2d
- Demo interactiva: https://huggingface.co/spaces/Ethgar/heart-waves
- Código: https://github.com/edgarmoreaualix/heart-waves
- Script de entrenamiento: https://github.com/edgarmoreaualix/heart-waves/blob/main/walrus/walrus_heart.py
- Repositorio de Walrus (Polymathic AI): https://github.com/PolymathicAI/walrus
