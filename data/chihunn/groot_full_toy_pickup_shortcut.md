# chihunn/groot_full_toy_pickup_shortcut

## Resumen

`chihunn/groot_full_toy_pickup_shortcut` es un ajuste fino completo del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B` (3.144.016.000 parametros), publicado por el usuario chihunn y entrenado con la libreria LeRobot de Hugging Face. El modelo resuelve una tarea muy concreta de manipulacion: recoger un juguete a partir de dos camaras (frontal y de muneca), un vector de estado de 8 dimensiones y una salida de accion de 7 dimensiones. Se trata de un checkpoint de investigacion, no de un modelo de proposito general.

La relevancia es doble. Por un lado, demuestra el flujo de trabajo completo de ajuste fino de un modelo vision-lenguaje-accion (VLA) de NVIDIA sobre un dataset propio con LeRobot, incluyendo el uso de la etiqueta de encarnacion `new_embodiment` para morfologias no vistas durante el preentrenamiento. Por otro, el sufijo "shortcut" indica que el dataset empleado es un subconjunto con sesgo visual deliberado (300 episodios), lo que lo convierte en una pieza util para estudiar atajos visuales y sobreajuste en politicas roboticas.

El modelo se publica bajo la NVIDIA Open Model License, hereda la arquitectura Cosmos de NVIDIA y esta pensado para evaluacion con `lerobot-eval`, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en NVIDIA Cosmos; encoder visual + modelo de lenguaje + cabeza de acciones |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (repo de 12,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de `nvidia/GR00T-N1.7-3B`, un VLA construido sobre NVIDIA Cosmos que combina un encoder visual, un modelo de lenguaje y una cabeza de prediccion de acciones. El ajuste fino es completo: se entrenan los 3,14B parametros (encoder visual, LLM y cabeza de accion) con `tune_visual=true` y `tune_llm=true`, sobre la etiqueta de encarnacion `new_embodiment`.

La configuracion de entrenamiento usa dos camaras (frontal y de muneca), estado de 8 dimensiones y accion de 7 dimensiones, con chunks de 16 acciones absolutas, batch de 32 y 30.000 pasos (el checkpoint publicado corresponde al paso 30000). Se optimiza con AdamW a learning rate 1e-4, schedule coseno con 5% de warmup, pesos en fp32 con autocast bf16 y aumentacion ColorJitter. El dataset de partida es el subconjunto de "atajo visual" del dataset de recogida de juguetes, con 300 episodios.

## Capacidades

- Generacion de acciones de manipulacion robotica de 7 dimensiones a partir de observaciones visuales y de estado.
- Percepcion multimodal con dos flujos de camara simultaneos (vista frontal y de muneca).
- Control condicionado por estado propioceptivo de 8 dimensiones.
- Prediccion de secuencias de acciones en chunks de 16 pasos con acciones absolutas.
- Transferencia a una encarnacion nueva mediante la etiqueta `new_embodiment`.
- Integracion con el ecosistema LeRobot para evaluacion (`lerobot-eval`) y entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion sobre atajos visuales: el modelo esta entrenado sobre el subconjunto "shortcut" del dataset, por lo que sirve como referencia para medir como una politica VLA explota correlaciones espurias entre fondo y accion.
- Reproduccion de experimentos de ajuste fino completo: permite replicar la receta (30.000 pasos, lr 1e-4, batch 32) y comparar con variantes congeladas del encoder o del LLM.
- Evaluacion de politicas con LeRobot: se puede lanzar `lerobot-eval --policy.path=chihunn/groot_full_toy_pickup_shortcut` para obtener metricas de exito en el entorno de recogida de juguetes.
- Baseline para nuevas encarnaciones: la etiqueta `new_embodiment` con estado de 8 dimensiones y accion de 7 dimensiones sirve de plantilla para adaptar GR00T a brazos con pinza de caracteristicas similares.
- Estudio de sobreajuste en datasets pequenos: con solo 300 episodios, es util para analizar curvas de generalizacion y sensibilidad a la aumentacion (ColorJitter).
- Docencia y formacion en robotica con IA: ejemplo compacto (12,6 GB) y reproducible de un pipeline VLA completo, desde el dataset hasta la evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 6,3 GB solo para pesos, mas memoria para activaciones y los dos flujos de camara; en la practica se recomienda un minimo de 16 GB.
- En fp32, los pesos ocupan unos 12,6 GB, por lo que se necesita una GPU con al menos 24 GB para inferencia comoda.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) viable para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion, aunque no se documentan formatos cuantizados.
- Despliegue: `lerobot-eval` como via oficial; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son motores orientados a LLM, no a politicas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_full_toy_pickup_shortcut | 3,14B | no disponible | Recogida de juguetes (VLA) | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3,14B | no disponible | VLA fundacional general | NVIDIA Open Model License | Hugging Face |
| OpenVLA-7B | 7B | no disponible | Manipulacion general | Licencia abierta (consultar) | Hugging Face |
| pi0 (Physical Intelligence) | no disponible | no disponible | VLA general | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre un subconjunto con sesgo visual deliberado ("shortcut"): puede aprender correlaciones espurias y fallar al cambiar iluminacion, fondo o posicion de camara.
- Dataset muy reducido (300 episodios): riesgo alto de sobreajuste y baja generalizacion fuera del entorno de recogida de juguetes.
- Especializado en una unica tarea y encarnacion; no es un modelo de proposito general ni un chatbot.
- Riesgo de alucinacion de acciones: como toda politica neuronal, puede generar trayectorias fisicamente invalidas o inseguras sin un filtro o controlador de bajo nivel.
- Idiomas no documentados; el componente de lenguaje no se ha evaluado de forma independiente.
- Licencia NVIDIA Open Model License: revisar los terminos antes de cualquier uso comercial; el modelo card remite a los ficheros LICENSE y NOTICE del repositorio.
- Sin benchmarks publicados ni descargas ni likes: madurez y validacion externa inexistentes.
- No se documentan cuantizaciones ni soporte en motores de inferencia de alto rendimiento, lo que limita el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chihunn/groot_full_toy_pickup_shortcut
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
