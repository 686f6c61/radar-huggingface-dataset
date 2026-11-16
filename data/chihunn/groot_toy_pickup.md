# chihunn/groot_toy_pickup

## Resumen

`chihunn/groot_toy_pickup` es un ajuste fino (fine-tune) del modelo fundacional de robótica **NVIDIA GR00T-N1.7-3B**, desarrollado por el usuario chihunn y publicado en Hugging Face. El modelo base está construido sobre la plataforma NVIDIA Cosmos y ha sido entrenado con la librería **LeRobot** de Hugging Face sobre un conjunto de datos de demostraciones reales de una tarea concreta: recoger un juguete (toy pickup), con 900 episodios de teleoperación.

El resultado es un modelo de política visomotora (vision-language-action, VLA) especializado en una única tarea de manipulación, con 3.144.016.000 parámetros y un tamaño de repositorio de 12,6 GB en formato safetensors. No es un modelo de lenguaje generalista ni un chatbot: su función es generar secuencias de acciones de robot a partir de observaciones visuales (dos cámaras: frontal y de muñeca) y del estado del robot.

Su relevancia radica en que demuestra el flujo de trabajo típico de ajuste fino de un modelo fundacional de robótica para una tarea concreta, con una receta de entrenamiento reproducible (cabezal de acción entrenado, codificador visual y modelo de lenguaje congelados) y una integración directa con el ecosistema LeRobot para evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA GR00T N1.7; cabezal de acción con diffusion transformer |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de **nvidia/GR00T-N1.7-3B**, un modelo fundacional de robótica construido sobre NVIDIA Cosmos. La arquitectura combina un codificador visual, un modelo de lenguaje como puente visión-lenguaje (VL bridge) y un cabezal de acción implementado como diffusion transformer, junto con proyectores de estado y de acción. En este ajuste fino se congelan el codificador visual y el modelo de lenguaje, y se entrena únicamente el cabezal de acción (diffusion transformer, proyectores de estado/acción y VL bridge).

El entrenamiento se realizó con LeRobot sobre el conjunto completo de toy pickup (900 episodios), con la etiqueta de embodiment `new_embodiment`, dos cámaras (frontal y de muñeca), estado de 8 dimensiones y acción de 7 dimensiones. Se usó chunk de 16, acciones absolutas, batch size 32, 30.000 pasos (el checkpoint publicado corresponde al paso 30000), optimizador AdamW con learning rate 1e-4, schedule coseno con 5% de warmup, pesos en fp32 con autocast bf16 y aumento de datos ColorJitter.

## Capacidades

- Generación de acciones de robot (7 dimensiones) a partir de observaciones visuales y del estado del robot (8 dimensiones).
- Percepción visomotora con dos cámaras (frontal y de muñeca).
- Ejecución de una tarea de manipulación concreta: recoger un juguete (toy pickup).
- Predicción de chunks de acción de longitud 16 con acciones absolutas.
- Integración con el ecosistema LeRobot para evaluación (`lerobot-eval`) y despliegue.
- Soporte de tool calling / function calling: no aplica (modelo de robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): visión para control robótico; no se documentan otras.

## Casos de uso

- **Investigación en manipulación robótica**: servir como punto de partida reproducible para estudiar el ajuste fino de modelos VLA fundacionales sobre una tarea concreta, con una receta documentada (cabezal entrenado, backbone congelado, 30.000 pasos).
- **Automatización de tareas de pick-and-place en laboratorio**: el modelo genera acciones de 7 dimensiones a partir de dos cámaras y del estado del robot, adecuado para bancos de pruebas con un único objeto y una única tarea.
- **Evaluación comparativa de recetas de fine-tuning**: al ser un checkpoint de paso 30000 con hiperparámetros explícitos, permite comparar variantes de entrenamiento (chunk, batch, aumentos) sobre el mismo dataset de 900 episodios.
- **Prototipado rápido con LeRobot**: integrable mediante `lerobot-eval` para validar políticas en simulación o en hardware antes de invertir en entrenamientos mayores.
- **Generación de datos sintéticos de política**: usar el modelo como política de referencia para generar trayectorias de acción en un entorno controlado de recogida de juguetes.
- **Docencia y divulgación**: ejemplo didáctico de fine-tuning de un modelo fundacional de robótica con licencia abierta y flujo de trabajo estándar en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.144 millones de parámetros y pesos en safetensors (12,6 GB de repositorio), se requiere al menos una GPU con memoria suficiente para cargar los pesos completos (orden de 12-16 GB en precisión nativa; menos si se aplica cuantización, no documentada).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU de clase profesional (A100, H100) o consumer de gama alta (RTX 4090) sería el rango esperable, aunque no está confirmado.
- ¿Cabe en consumer GPU?: no confirmado; el tamaño de pesos sugiere que podría caber en GPUs consumer con 16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-eval`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política robótica).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chihunn/groot_toy_pickup | 3.144.016.000 | no disponible | Política VLA para toy pickup | NVIDIA Open Model License | Hugging Face (0 descargas) |
| nvidia/GR00T-N1.7-3B (base) | 3B (aproximado) | no disponible | Modelo fundacional de robótica | NVIDIA Open Model License | Hugging Face (oficial NVIDIA) |
| Otros fine-tunes de GR00T en LeRobot | no disponible | no disponible | Tareas de manipulación específicas | según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo está entrenado únicamente para la tarea de recoger un juguete; no generaliza a otras tareas ni objetos sin nuevo ajuste fino.
- **Sin datos de benchmarks**: no hay métricas publicadas de éxito, precisión ni robustez, por lo que su rendimiento real en producción es desconocido.
- **Riesgo de alucinación**: en el contexto de políticas robóticas, se traduce en acciones erróneas o inseguras; requiere supervisión y límites de seguridad en hardware real.
- **Sesgos**: el dataset de 900 episodios refleja las condiciones concretas de captura (iluminación, disposición, objeto); el modelo puede fallar fuera de esa distribución.
- **Licencia**: NVIDIA Open Model License; es necesario revisar los términos para uso comercial y las obligaciones de atribución (LICENSE y NOTICE en el repositorio).
- **Idiomas**: no aplica como modelo de lenguaje; no se documentan capacidades multilingües.
- **Contexto**: no se documenta la longitud de contexto del modelo base ni su aplicabilidad a este fine-tune.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin validación comunitaria.
- **Producción**: no se documentan requisitos de hardware, latencia ni procedimientos de seguridad; no recomendable para despliegue crítico sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chihunn/groot_toy_pickup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
