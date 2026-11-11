# rsj2003/StreamingWAM-DiT4DiT-LIBERO

## Resumen

StreamingWAM-DiT4DiT-LIBERO es un checkpoint de investigación para robótica de manipulación, publicado por el usuario rsj2003, que aplica la técnica StreamingWAM sobre el modelo DiT4DiT de Mondo Robotics, el cual a su vez se construye sobre el backbone de vídeo Cosmos-Predict2.5-2B de NVIDIA. El modelo resuelve el problema de generar trayectorias de acción en bucle cerrado para tareas de manipulación, condicionando la predicción de acciones futuras sobre observaciones visuales reales y acciones ya ejecutadas.

El repositorio contiene dos checkpoints comparables entrenados con el mismo presupuesto de actualizaciones (10.000 updates, batch global 64) sobre las suites LIBERO sin no-op: una variante "joint" convencional y una variante "streaming" que incorpora un histórico de cinco observaciones visuales reales y ocho acciones ejecutadas. La variante streaming obtiene un 76,37% de éxito en LIBERO-Plus con prompt crudo, frente al 70,88% de la variante joint.

La relevancia del release es metodológica: permite reproducir una comparación controlada entre un esquema de condicionamiento clásico y uno con memoria de ejecución (streaming), sobre un backbone de difusión de vídeo de 2B parámetros. No es un modelo de propósito general ni un checkpoint listo para producción, sino un artefacto de investigación con instrucciones de inferencia y evaluación específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de difusión vídeo-acción, flow matching, sobre backbone Cosmos-Predict2.5-2B |
| Parametros totales | no disponible (el state dict de inferencia pesa ~21,3 GB por checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana de condicionamiento: 5 observaciones visuales reales + 8 acciones ejecutadas (variante streaming), 1 imagen actual + 4 acciones (variante joint) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | dit4dit-cosmos-derived-model (otros; componentes Cosmos bajo NVIDIA Open Model License; upstream DiT4DiT Apache-2.0) |
| Formato de pesos | PyTorch (`pytorch_model.pt`), no compatible con `AutoModel` de Transformers |
| Tamano del repositorio | 42,6 GB |
| Pipeline | robotics |
| Vistas de cámara | cámara primaria y de muñeca emparejadas |
| Frecuencia de control | 20 Hz |
| Horizonte de acción | 8 acciones futuras, 4 ejecutadas por replanificación |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que opera con flow matching sobre el backbone de vídeo Cosmos-Predict2.5-2B de NVIDIA. DiT4DiT adapta ese backbone de generación de vídeo a la predicción de acciones robóticas, de modo que el modelo genera un buffer de ocho acciones futuras condicionado por observaciones visuales y acciones previas. La variante streaming refina ese buffer de ocho acciones y ejecuta cuatro por cada replanificación, usando un arranque en caliente de cuatro pasos seguido de la primera actualización en escalera, y después una actualización de acción por replanificación estable. La variante joint mantiene una única imagen actual y cuatro actualizaciones de acción por replanificación.

El entrenamiento se realizó sobre las mismas cuatro suites LIBERO sin no-op (1.693 trayectorias) para ambas variantes, partiendo independientemente de la misma inicialización oficial DiT4DiT-LIBERO. Ambos checkpoints corresponden al punto de 10.000 updates de schedules coseno de 20.000, con batch global 64 y H/K de 8/4. No se incluyen estados del optimizador ni logs de entrenamiento; sí se incluyen estadísticas de normalización del dataset, configuraciones portables de entrenamiento e inferencia y metadatos, con identidades SHA256 registradas en `release.json`. El autor advierte que igual número de updates y batch no implica igual número de FLOPs entre variantes.

## Capacidades

- Predicción de acciones robóticas de manipulación en bucle cerrado a partir de observaciones visuales (cámara primaria y de muñeca) y acciones ejecutadas.
- Condicionamiento sobre histórico de ejecución: la variante streaming usa cinco observaciones visuales reales y ocho acciones ejecutadas.
- Generación de buffers de acción de ocho pasos con ejecución de cuatro por replanificación.
- Evaluación sobre LIBERO y LIBERO-Plus en simulación.
- No soporta tool calling ni function calling.
- No es un modelo de lenguaje conversacional ni de agentes textuales.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente en inglés.
- No incluye visión general, audio ni modo de razonamiento textual.

## Casos de uso

- Investigación en imitación robótica: reproducir la comparación controlada entre condicionamiento joint y streaming sobre el mismo backbone y presupuesto de entrenamiento, usando los comandos de entrenamiento continuado incluidos en el repositorio.
- Evaluación en LIBERO-Plus: ejecutar el protocolo de evaluación del autor (10.030 entradas, prompt crudo, semilla 7, índice de estado inicial 0, 20 Hz, cinco pasos de asentamiento, límite de 700 pasos) para obtener métricas comparables.
- Estudio de memoria de ejecución en políticas visomotoras: analizar cómo el histórico de observaciones y acciones afecta la tasa de éxito en tareas de manipulación de largo horizonte.
- Desarrollo de pipelines de replanificación: probar esquemas de arranque en caliente y actualización en escalera con ejecución de cuatro acciones por replanificación en entornos simulados.
- Base para fine-tuning en robótica: partir de los pesos publicados para adaptar la política a nuevos datasets de manipulación, dado que se incluyen configuraciones portables y estadísticas de normalización.
- Análisis de latencia en inferencia: medir el coste de la variante streaming (153,685 ms por llamada completa) frente a la joint (135,526 ms) en el mismo hardware para decisiones de diseño en sistemas de control.
- Validación de carga de checkpoints: usar los scripts de smoke inference y las comprobaciones de release (carga estricta, dos replanificaciones, un episodio de simulador y una actualización de optimizador en cuatro GPUs) como referencia de integración.

## Benchmarks y rendimiento

| Checkpoint | Updates adicionales | Batch global | H / K | Éxito LIBERO-Plus (prompt crudo) |
|---|---:|---:|---|---:|
| `joint/pytorch_model.pt` | 10.000 | 64 | 8 / 4 | 70,88% (7.109 / 10.030) |
| `streaming/pytorch_model.pt` | 10.000 | 64 | 8 / 4 | 76,37% (7.660 / 10.030) |

| Medición | Valor |
|---|---|
| Latencia por llamada completa, DiT4DiT ordinario | 135,526 ms |
| Latencia por llamada completa, streaming | 153,685 ms |

El autor advierte que las cifras usan el campo `task.language` crudo, incluyendo sufijos del benchmark, y no son directamente comparables con resultados de FastWAM con prompts limpios. Además, el punto streaming de 10K/K4 se seleccionó con una criba de 200 entradas contenida en el manifiesto completo, por lo que la evaluación completa no es enteramente fuera de muestra. No se declara una mejora de velocidad extremo a extremo para esta adaptación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; cada state dict de inferencia pesa aproximadamente 21,3 GB, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos completos (orientativo: 24 GB o más, sin confirmación del autor).
- GPU recomendadas: no especificadas por el autor; los scripts de validación usan cuatro GPUs para una actualización de optimizador.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos y la dependencia del backbone Cosmos hacen improbable un despliegue en GPUs de gama baja.
- Opciones de despliegue: el repositorio proporciona scripts propios (`scripts/download.py`, `scripts/smoke_inference.py`) y un entorno DiT4DiT separado con versión de Diffusers fijada. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 135,526 ms (joint) y 153,685 ms (streaming) por llamada completa, según mediciones del autor.
- Throughput: no disponible.
- Requisito adicional: el acceso al modelo base `nvidia/Cosmos-Predict2.5-2B` puede requerir aceptar los términos de NVIDIA con una cuenta propia de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Éxito LIBERO-Plus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StreamingWAM-DiT4DiT-LIBERO (streaming) | no disponible (~21,3 GB de pesos) | 5 observaciones + 8 acciones | 76,37% (prompt crudo) | dit4dit-cosmos-derived-model | Hugging Face (rsj2003) |
| StreamingWAM-DiT4DiT-LIBERO (joint) | no disponible (~21,3 GB de pesos) | 1 imagen + 4 acciones | 70,88% (prompt crudo) | dit4dit-cosmos-derived-model | Hugging Face (rsj2003) |
| DiT4DiT-LIBERO (oficial) | no disponible | condicionamiento estándar DiT4DiT | no disponible en esta ficha | Apache-2.0 (según model card upstream) | Hugging Face (mondo-robotics) |
| FastWAM | no disponible | no disponible | no comparable (protocolo de prompt limpio) | no disponible | no disponible |

La comparación con FastWAM no es directa por diferencias de protocolo de evaluación (prompt crudo frente a prompt sanitizado). No se dispone de datos de benchmarks de otros modelos de política robótica en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no es un checkpoint de propósito general ni está validado para producción; cubre simulación LIBERO, no robots reales ni RoboTwin.
- Sesgos conocidos: no documentados por el autor; el entrenamiento se limita a cuatro suites LIBERO sin no-op (1.693 trayectorias), lo que restringe la generalización a esos entornos.
- Riesgo de alucinación: no aplica en el sentido textual, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: condicionamiento limitado a cinco observaciones y ocho acciones en la variante streaming; etiquetado solo en inglés.
- Sesgo de selección: el punto streaming de 10K/K4 se eligió con una criba de 200 entradas del manifiesto completo, por lo que la evaluación no es enteramente fuera de muestra.
- Atribución no aislada: la comparación mide la adaptación combinada, no la contribución aislada del histórico o del objetivo streaming.
- Sin mejora de velocidad: la variante streaming es más lenta por llamada (153,685 ms frente a 135,526 ms); no se reclama aceleración extremo a extremo.
- Restricciones de licencia: licencia "other" (dit4dit-cosmos-derived-model); los componentes Cosmos están sujetos a la NVIDIA Open Model License y el acceso al modelo base puede requerir aceptar términos de NVIDIA. Verificar `LICENSE.md` y `NOTICE.txt` antes de uso comercial.
- Compatibilidad: no es un checkpoint genérico de Transformers (`AutoModel`); requiere el entorno DiT4DiT y la versión de Diffusers fijada.
- Resultados no reejecutados: los resultados completos de benchmark archivados no se volvieron a ejecutar durante el empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsj2003/StreamingWAM-DiT4DiT-LIBERO
- Código y comandos: https://github.com/renshaojie233/StreamingWAM/tree/main/extensions/dit4dit
- Página del proyecto: https://renshaojie233.github.io/StreamingWAM/
- Paper: https://arxiv.org/abs/2610.15585
- Modelo base DiT4DiT: https://huggingface.co/mondo-robotics/dit4dit-model
- Repositorio DiT4DiT: https://github.com/Mondo-Robotics/DiT4DiT
- Modelo base Cosmos-Predict2.5-2B: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Licencia: LICENSE.md (incluido en el repositorio)
- Aviso legal: NOTICE.txt (incluido en el repositorio)
- Validación: VALIDATION.json (incluido en el repositorio)
