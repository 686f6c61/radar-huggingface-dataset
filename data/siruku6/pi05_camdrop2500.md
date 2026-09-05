# siruku6/pi05_camdrop2500

## Resumen

siruku6/pi05_camdrop2500 es un modelo de robótica VLA (vision-language-action) publicado por siruku6 como resultado negativo de investigación. Se trata de un fine-tune de parámetros completos del modelo base lerobot/pi05_libero_base sobre el dataset lerobot/libero_plus, en el que la cámara de escena se reemplaza por ceros con probabilidad 0,5 por muestra durante el entrenamiento, con el objetivo de empujar la política a depender de la cámara de muñeca. El modelo pertenece a la familia π0.5 (pi05), con un experto de acción flow-matching y un total de 4.143.404.816 parámetros.

La relevancia de este modelo radica en documentar un resultado negativo: el dropout de cámara de escena aumenta la pérdida de entrenamiento y el gap con respecto al run sin dropout no se cierra tras 2.500 pasos. Esto aporta evidencia sobre la importancia de la información visual de la cámara de escena en políticas VLA y sirve como referencia reproducible para futuras investigaciones en robustez de sensores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05): modelo VLA (visión-lenguaje-acción) con experto de acción flow-matching, basado en PaliGemma |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (modelo de robótica, sin evaluación de idiomas) |
| Licencia | Gemma Terms of Use (Model Derivative de Gemma, vía PaliGemma) |
| Formato de pesos | safetensors (model.safetensors, 9.354.050.752 bytes) |
| Pipeline | robotics |
| Librería | LeRobot v0.6.0 |
| Dataset de entrenamiento | lerobot/libero_plus (14.347 episodios, 2.238.036 frames, 40 tareas) |
| Checkpoints publicados | 5 (cada 500 pasos, de 000500 a 002500) |
| Tamaño del repositorio | 46,8 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos de π0.5, una arquitectura VLA que combina un codificador de visión y lenguaje (PaliGemma) con un experto de acción basado en flow-matching. La política genera secuencias de acción de longitud 50 (action chunk) y ejecuta 10 pasos de acción por predicción. El entrenamiento se realizó con todos los 4.143.404.816 parámetros entrenables, sin congelar el codificador de visión ni limitarse al experto de acción. Se usó bfloat16 con gradient checkpointing, batch de 64, LR máximo de 5e-6 con decaimiento coseno y warmup, y semilla 42. El dataset libero_plus contiene 14.347 episodios y 2.238.036 frames de 40 tareas de manipulación con un brazo Franka Panda a 20 fps.

La innovación técnica es el dropout de cámara de escena: con probabilidad 0,5 por muestra, la imagen de la cámara de terceros se reemplaza por ceros, mientras que la cámara de muñeca nunca se toca. El objetivo es forzar a la política a aprender representaciones robustas basadas en la cámara de muñeca. Sin embargo, el resultado es negativo: la pérdida de entrenamiento de la variante con dropout se mantiene por encima de la del run sin dropout (por ejemplo, +11,8% en los primeros 100 pasos y +7,6% en los últimos 100), y el gap deja de cerrarse tras unos 900 pasos. Esto sugiere que la información de la cámara de escena es difícil de sustituir.

## Capacidades

- Generación de acciones robóticas: produce secuencias de acción de bajo nivel para 40 tareas de manipulación en el benchmark LIBERO con un brazo Franka Panda.
- Entrada multimodal: procesa imágenes de cámara de escena y de muñeca, aunque la variante con dropout ha sido entrenada para depender más de la cámara de muñeca.
- Generación de acciones mediante flow-matching: genera un action chunk de 50 y ejecuta 10 pasos de acción por predicción.
- Fine-tune de parámetros completos: no congela el codificador de visión, lo que permite adaptar todas las capas al dominio de LIBERO.
- Publicación de checkpoints intermedios: ofrece 5 checkpoints cada 500 pasos, lo que permite analizar la evolución del entrenamiento.
- Registro de entrenamiento completo: incluye logs detallados para reproducibilidad.
- No soporta tool calling, razonamiento multi-paso ni generación de texto; su única salida son acciones de bajo nivel para robótica.

## Casos de uso

- Reproducción de experimentos de ablación: el modelo permite reproducir el efecto del dropout de cámara de escena sobre la pérdida de entrenamiento, comparando los cinco checkpoints con el run sin dropout. Es adecuado porque incluye los logs completos y la configuración exacta.
- Evaluación comparativa en LIBERO: el modelo puede evaluarse en las 40 tareas de libero_plus para medir su tasa de éxito frente al hermano sin dropout y al modelo base. Aunque el autor adelanta que no supera, sirve para verificar el resultado negativo.
- Investigación en robustez de sensores: el dropout de cámara de escena es una técnica de regularización que puede estudiarse como método para mejorar la robustez ante fallos de cámara. El modelo es adecuado porque implementa exactamente esa técnica y documenta su efecto.
- Análisis de la contribución de cada cámara: comparando este modelo con el run sin dropout, se puede cuantificar cuánto aporta la cámara de escena en LIBERO. Es adecuado porque la única diferencia es el dropout, manteniendo el resto de hiperparámetros y semilla.
- Desarrollo de políticas VLA en LeRobot: el modelo sirve como ejemplo de fine-tune de parámetros completos de π0.5 con LeRobot v0.6.0. Es adecuado porque incluye config.json, train_config.json y el formato esperado por la librería.
- Educación y formación en robótica: el modelo puede usarse como caso de estudio de resultado negativo en aprendizaje por imitación. Es adecuado porque publica tanto los pesos como el análisis de la pérdida, lo que facilita la discusión.
- Punto de partida para variantes: aunque el resultado es negativo, el checkpoint de 2.500 pasos puede usarse como base para explorar otras técnicas de regularización o de aumento de datos. Es adecuado porque es un fine-tune completo con pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una tabla de pérdida de entrenamiento comparativa entre la variante con dropout y la sin dropout, pero no constituye un benchmark de tareas. Los datos son los siguientes:

| Pasos | Pérdida con dropout | Pérdida sin dropout | Diferencia |
|---|---|---|---|
| 1–100 | 0,2662 | 0,2382 | +11,8 % |
| 401–500 | 0,2566 | 0,2354 | +9,0 % |
| 801–900 | 0,2558 | 0,2362 | +8,3 % |
| 1401–1500 | 0,2506 | 0,2304 | +8,8 % |
| 2001–2100 | 0,2500 | 0,2304 | +8,5 % |
| 2401–2500 | 0,2532 | 0,2354 | +7,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El archivo de pesos en bfloat16 ocupa 9.354.050.752 bytes (≈8,7 GB), por lo que se necesita al menos esa capacidad de VRAM para cargar los pesos, más el overhead de activaciones.
- GPU recomendadas: para entrenamiento se usó 1× NVIDIA RTX PRO 6000 Blackwell con 49,4 GB VRAM. Para inferencia no se especifica.
- ¿Cabe en consumer GPU? No está documentado. Dado el tamaño de pesos, una GPU de 24 GB (por ejemplo, RTX 4090) podría ser suficiente para inferencia básica, pero no hay validación.
- Opciones de despliegue: LeRobot v0.6.0 es el framework oficial. No se mencionan vLLM, llama.cpp, TGI ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El entrenamiento tuvo un tiempo de paso de 6,84 s/step, pero no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos | Dropout cámara escena | Licencia | Resultado |
|---|---|---|---|---|---|
| lerobot/pi05_libero_base | 4,14 B | — | No | Gemma | Modelo base |
| siruku6/pi05_full_runpod | 4,14 B | 3.000 | No | Gemma | Fine-tune sin dropout |
| siruku6/pi05_trial1500 | 4,14 B | 1.500 | No | Gemma | Fine-tune sin dropout |
| siruku6/pi05_camdrop2500 | 4,14 B | 2.500 | Sí (p=0,5) | Gemma | Resultado negativo |

No se dispone de datos de rendimiento (tasa de éxito) para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo: la variante con dropout no supera al hermano sin dropout en la evaluación simulada LIBERO, según el autor.
- Solo simulación: entrenado y evaluado únicamente en LIBERO con un Franka Panda simulado; no hay validación en robot real.
- Riesgo de seguridad: no debe ejecutarse en hardware físico sin una revisión de seguridad propia.
- Rendimiento desconocido: el comportamiento fuera del entorno y la configuración de cámaras de LIBERO es desconocido.
- Licencia restrictiva: los pesos son una Derivada de Gemma y están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, lo que puede limitar el uso comercial.
- Pérdida de entrenamiento superior: el dropout impide que la pérdida baje al nivel del run sin dropout, lo que sugiere que la cámara de escena aporta información difícil de compensar.
- Sin benchmarks de tareas: no se han publicado tasas de éxito u otros indicadores de rendimiento en LIBERO.
- Problema de reproducibilidad con --resume: el repo aplana la estructura pretrained_model/ de LeRobot, por lo que usar --resume contra la ruta del Hub puede fallar; se recomienda descargar y pasar una ruta local.

## Enlaces

- HuggingFace: https://huggingface.co/siruku6/pi05_camdrop2500
- Modelo base: https://huggingface.co/lerobot/pi05_libero_base
- Dataset: https://huggingface.co/datasets/lerobot/libero_plus
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
