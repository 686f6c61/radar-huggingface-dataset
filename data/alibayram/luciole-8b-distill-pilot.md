# alibayram/luciole-8b-distill-pilot

## Resumen

Luciole 8B distillation pilot es un conjunto de adaptadores LoRA en formato MLX para el modelo OpenLLM-France/Luciole-8B-Instruct-1.1, publicado por el usuario alibayram. El objetivo concreto es enseñar al modelo base a usar herramientas (tool calling) en tareas de planificación de rutas a pie, mediante ajuste supervisado sobre trazas verificadas de profesores más capaces. El repositorio se encuentra en estado de entrenamiento en curso y los pesos publicados son checkpoints intermedios sin evaluar.

El problema que aborda está documentado por el propio autor: en la ronda 2 de su banco de pruebas luciole-bench (50 tareas, evaluador 0.6.0), Luciole 8B no supera ninguna tarea porque invoca `get_route` con identificadores de relleno como `place_id_of_first_restaurant` en lugar de los identificadores devueltos por sus propias búsquedas; solo 5 de sus 397 llamadas de ruta tienen éxito. Nemotron 3.5 Lightning 30B-A3B, que comparte la arquitectura `nemotron_h` del modelo base, supera 30 tareas.

Se trata, por tanto, de un experimento de destilación de bajo coste (entrenado en un Apple M4 Mac mini de 32 GB) más que de un modelo listo para producción. La relevancia actual es metodológica: muestra cómo un adaptador LoRA pequeño puede corregir un fallo específico de uso de herramientas en un modelo de 8B con arquitectura híbrida Mamba-2/atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido `nemotron_h` (capas Mamba-2, atención y proyecciones MLP) del modelo base Luciole-8B-Instruct-1.1 |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 8 sobre 52 capas; el modelo base es de 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; los ejemplos de entrenamiento de más de 6.144 tokens se descartaron |
| Tipos de cuantizacion | Entrenado y pensado para la conversión de 8 bits de `mlx_lm.convert` (group size 64); formato MLX |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapters.safetensors` y `adapter_config.json` (MLX); checkpoints por época `0000NNN_adapters.safetensors` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre OpenLLM-France/Luciole-8B-Instruct-1.1 en la revisión `35ac0770802a763ca482419514ca05b27621bb63`, convertido con `mlx_lm.convert -q --q-bits 8` (group size 64), que es exactamente la conversión empleada por luciole-bench. El método es LoRA sobre las 52 capas del modelo (Mamba-2, atención y proyecciones MLP), con rango 8, escala 20 y dropout 0.

La función de pérdida es entropía cruzada calculada únicamente sobre los turnos propios de Luciole (llamadas a herramientas y respuestas); el system prompt, el texto de la tarea y los resultados de las herramientas se tratan como contexto, no como objetivos. Los datos son ejecuciones exitosas de dos profesores, Nemotron 3.5 Lightning y Qwen3.8 27B, sobre 106 tareas de rutas turísticas y puntos de encuentro en 8 ciudades que el benchmark nunca utiliza, con el texto de razonamiento (thinking) eliminado. El conjunto resultante son 198 ejemplos. La validación retiene todas las tareas de Estrasburgo. El optimizador es Adam con learning rate 5e-5, un ejemplo por paso, acumulación de gradiente 4, 3 épocas y semilla 0; los ejemplos de más de 6.144 tokens se descartan (contados, no truncados). El entrenamiento se ejecutó en un Apple M4 Mac mini de 32 GB con mlx-lm 0.32.2.

## Capacidades

- Generación de texto conversacional en inglés y francés, heredada del modelo base.
- Uso de herramientas (tool calling) en tareas de planificación de rutas a pie, con el formato de llamada de Luciole (`<tool_call>` con bloques JSON) sin modificar.
- Razonamiento multi-paso orientado a agentes: encadenar búsquedas y usar los identificadores devueltos por ellas en llamadas posteriores, que es el comportamiento que el adaptador busca corregir.
- Tareas de rutas turísticas y de puntos de encuentro en entornos urbanos (las dos únicas reglas del benchmark cubiertas por el entrenamiento).
- No cubre cierres de vías, preguntas de aclaración ni recuperación de rutas fallidas.
- Capacidades de visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Agentes de planificación de rutas urbanas: el adaptador enseña al modelo a encadenar búsquedas de lugares y a pasar los identificadores reales devueltos por la herramienta a `get_route`, lo que lo hace adecuado para prototipos de asistentes de movilidad a pie.
- Evaluación de metodologías de destilación: sirve como caso de estudio reproducible de cómo un LoRA de rango 8 sobre 198 ejemplos corrige un fallo sistemático de tool calling en un modelo de 8B.
- Investigación en destilación de trazas de agentes: los checkpoints por época permiten analizar la evolución del comportamiento de uso de herramientas sin necesidad de reentrenar.
- Desarrollo local en hardware Apple: al estar en formato MLX y haberse entrenado en un M4 de 32 GB, permite iterar sobre agentes de herramientas en un equipo de sobremesa sin GPU dedicada.
- Punto de partida para ampliar coberturas: el adaptador puede servir de base para añadir las reglas no cubiertas (cierres, aclaraciones, recuperación de rutas) con datos adicionales.
- Integración en pipelines de agentes basados en herramientas geográficas: el formato de llamada JSON sin cambios facilita conectarlo a orquestadores existentes que ya funcionen con Luciole.
- No es adecuado como asesor de viajes real: las rutas provienen de OpenStreetMap y las tareas no constituyen consejo de viaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los checkpoints son intermedios y no evaluados, y que no se reclama ninguna puntuación hasta que un adaptador se ejecute sobre el conjunto de test bloqueado de luciole-bench. Como referencia del punto de partida, el propio autor documenta que el modelo base pasa 0 de 50 tareas en la ronda 2 de luciole-bench (5 de 397 llamadas de ruta con éxito), frente a 30 tareas de Nemotron 3.5 Lightning 30B-A3B.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 8B en 8 bits MLX, la huella se corresponde con la del modelo base cuantizado a 8 bits más el adaptador (de rango 8, muy pequeño).
- GPU recomendadas: no aplica en el sentido habitual; el formato es MLX, orientado a silicio Apple. El entrenamiento se realizó en un Apple M4 Mac mini con 32 GB de memoria unificada.
- Cabe en hardware de consumo: sí, en equipos Apple con memoria unificada suficiente para el modelo base en 8 bits; el autor lo ejecutó en un M4 de 32 GB.
- Opciones de despliegue: `mlx_lm.generate` con `--adapter-path`, o fusión con `mlx_lm.fuse` para generar un modelo completo. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en luciole-bench (ronda 2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luciole 8B distill pilot (este) | 8B + LoRA rango 8 | No disponible | No evaluado (checkpoints intermedios) | Apache-2.0 | Hugging Face, formato MLX |
| OpenLLM-France/Luciole-8B-Instruct-1.1 (base) | 8B | No disponible | 0 de 50 tareas | Apache-2.0 | Hugging Face |
| Nemotron 3.5 Lightning 30B-A3B (profesor) | 30B (MoE, A3B) | No disponible | 30 de 50 tareas | No disponible | No disponible en la informacion |

## Limitaciones y advertencias

- Estado de entrenamiento en curso: los pesos son checkpoints intermedios sin evaluar; no deben usarse en producción.
- Cobertura limitada: el entrenamiento cubre solo dos de las reglas del benchmark (rutas turísticas y puntos de encuentro); no enseña cierres, preguntas de aclaración ni recuperación de rutas.
- Tamaño piloto: 198 ejemplos son insuficientes para generalizar más allá de los escenarios entrenados.
- Dependencia del formato: los adaptadores se entrenaron sobre la conversión de 8 bits concreta de `mlx_lm.convert` (group size 64); usarlos con otra conversión puede degradar el comportamiento.
- Riesgo de alucinación de identificadores: el fallo original del modelo base (inventar place_ids) podría persistir en escenarios fuera de la distribución de entrenamiento.
- Idiomas: solo inglés y francés; no se documenta soporte de castellano.
- Datos geográficos: lugares y rutas provienen de OpenStreetMap (© OpenStreetMap contributors, ODbL); las tareas no constituyen consejo de viaje.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales documentadas; conviene verificar las condiciones del modelo base y de los datos ODbL en un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alibayram/luciole-8b-distill-pilot
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-8B-Instruct-1.1
- Dataset de destilación: https://huggingface.co/datasets/alibayram/luciole-distill-pilot
- Resultados de luciole-bench: https://huggingface.co/datasets/alibayram/luciole-bench-results
