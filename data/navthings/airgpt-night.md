# navthings/airgpt-night

## Resumen

airgpt-night es un modelo de lenguaje de aproximadamente 40 millones de parámetros (39.596.544 exactos, según los pesos safetensors del repositorio) desarrollado por el usuario navthings y publicado en HuggingFace. Se trata de un modelo entrenado desde cero (etiqueta "from-scratch") cuyo principal interés no es su rendimiento absoluto, sino la demostración de que es posible entrenar un modelo de este tamaño en hardware de consumo: concretamente, en un MacBook Air M5 con 16 GB de memoria unificada, sin ventilador activo y durante una única sesión nocturna de ocho horas. El autor indica que el equipo no sufrió throttling térmico en ningún momento.

El modelo se distribuye en dos variantes: `base.safetensors` (el modelo previo al ajuste conversacional, que se limita a continuar el texto) y `model.safetensors` (el modelo final con ajuste de chat). El entrenamiento previo consumió 120 millones de tokens procedentes de una mezcla al 50/50 de TinyStories y Cosmopedia, tras lo cual se realizó un ajuste de chat con datos de everyday-conversations y smol-smoltalk. Las pérdidas de validación reportadas son 2,11 en la fase de preentrenamiento y 1,62 en la fase de chat.

Su relevancia actual es fundamentalmente educativa y experimental: sirve como caso práctico de entrenamiento de extremo a extremo con el framework MLX en Apple Silicon, y como banco de pruebas de bajo coste para pipelines de preentrenamiento, ajuste conversacional y despliegue local. Conviene subir las expectativas a la realidad: el propio autor reconoce que la generación de historias largas "más o menos se mantiene coherente", mientras que el chat "es todavía bastante débil, entra en bucles y se inventa cosas".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (entrenado from scratch; la model card no especifica la arquitectura) |
| Parametros totales | 39.596.544 (~40 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato y libreria MLX) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo, más allá de la etiqueta "from-scratch" y de que se trata de un modelo de lenguaje de ~40 M de parámetros entrenado con la librería MLX. Por tanto, cualquier afirmación sobre si es un transformer decoder-only, la profundidad de capas, el número de cabezas de atención o si emplea alguna variante de atención eficiente sería especulativa y no se incluye aquí. El entrenamiento se realizó íntegramente en un MacBook Air M5 con 16 GB de memoria unificada y sin ventilador, en una sesión de ocho horas, según indica el autor.

El pipeline de entrenamiento tuvo dos fases. Primero, un preentrenamiento sobre 120 millones de tokens compuestos a partes iguales (50/50) por TinyStories (cuentos cortos sintéticos en inglés) y Cosmopedia (corpus de texto educativo generado). Después, un ajuste conversacional breve a partir de everyday-conversations y smol-smoltalk. El repositorio conserva ambos puntos de control: `base.safetensors` corresponde al modelo previo al ajuste de chat y `model.safetensors` al modelo conversacional final. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional, ni innovaciones arquitectónicas concretas.

## Capacidades

- Generacion de texto narrativo: produce historias relativamente largas que, segun el autor, "en su mayoria se mantienen coherentes".
- Continuacion de texto con el modelo base: la variante `base.safetensors` simplemente continua lo que el usuario escriba.
- Conversacion basica: el modelo ajustado (`model.safetensors`) mantiene intercambios cortos, aunque el propio autor califica el chat como "bastante debil".
- Idiomas: no disponible. Los corpus de entrenamiento (TinyStories, Cosmopedia, everyday-conversations, smol-smoltalk) son predominantemente en ingles, pero la model card no declara idiomas soportados.
- Tool calling / function calling: no disponible (no se menciona soporte alguno).
- Agentes y razonamiento multi-paso: no disponible (no se menciona).
- Vision, audio o modo de razonamiento explicito: no disponible (no se mencionan).

## Casos de uso

- Docencia y divulgacion sobre entrenamiento de LLM: el modelo sirve como ejemplo reproducible de un pipeline completo (preentrenamiento + ajuste de chat) ejecutado en un portatil de consumo, util para explicar fases, perdidas de validacion y puntos de control en cursos o talleres.
- Prototipado de generacion de cuentos cortos: dado su ajuste con TinyStories, es adecuado para experimentos de narracion breve y generacion de texto infantil, siempre asumiendo coherencia limitada.
- Banco de pruebas para MLX: permite validar flujos de carga, inferencia y cuantizacion experimental sobre Apple Silicon antes de escalar a modelos mayores en el mismo framework.
- Generacion de datos sinteticos a pequena escala para pruebas internas: util para rellenar pipelines de ingestión, validación de esquemas o tests de integración donde no se requiere calidad alta ni veracidad factual.
- Experimentos de ajuste fino de bajo coste: al ser un modelo de ~40 M de parametros, se puede reentrenar o afinar repetidamente en una GPU consumer o en un Mac, ideal para estudiar hiperparametros, tasas de aprendizaje o tamanos de dataset.
- Demostraciones locales sin conexion: su tamano (~0,3 GB de repositorio) permite ejecutarlo en un portatil sin GPU dedicada como chatbot de demostracion, aceptando sus limitaciones de calidad.
- Estudio de colapso de coherencia y bucles: la tendencia documentada del modelo a entrar en bucles en conversacion lo convierte en un caso util para investigar modos de fallo tipicos de modelos pequenos y tecnicas de mitigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos numericos aportados por el autor son las perdidas de validacion:

| Fase | Perdida de validacion |
|---|---|
| Preentrenamiento | 2,11 |
| Chat | 1,62 |

No se aportan resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, por lo que no es posible comparar su rendimiento cuantitativo con el de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en bf16/fp16 (39,6 M de parametros x 2 bytes) y en torno a 158 MB en fp32. Son calculos derivados del numero de parametros, no cifras publicadas por el autor.
- GPU recomendadas: el modelo esta publicado para MLX, por lo que su entorno natural son los chips de Apple Silicon (serie M). No se documenta soporte para CUDA.
- Cabe en GPU de consumo: si. El entrenamiento completo se hizo en un MacBook Air M5 con 16 GB de memoria unificada sin ventilador. Dado su tamano, cabe en practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: MLX con el repositorio airgpt (el autor proporciona `chat.py`). No se reportan pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor solo indica que el entrenamiento completo duro ocho horas, no datos de inferencia.

Instrucciones de uso indicadas por el autor:

```
git clone https://github.com/navthings/airgpt && cd airgpt
pip install -r requirements.txt
hf download navthings/airgpt-night --local-dir runs/night
python chat.py runs/night
```

Para usar el modelo base: `python chat.py runs/night --base`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de airgpt-night, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los datos de los modelos alternativos proceden de conocimiento general y no de la model card proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| airgpt-night (navthings) | 39,6 M | no disponible | MIT | HuggingFace (MLX, safetensors) |
| TinyStories-33M (roneneldan) | 33 M | no disponible | no disponible | HuggingFace |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 | Apache-2.0 | HuggingFace (transformers) |
| Qwen2.5-0.5B | 494 M | 32768 | Apache-2.0 | HuggingFace (transformers) |

airgpt-night se situa en el segmento de modelos ultrapequenos y esta mas cerca en tamano de los modelos de la familia TinyStories que de SmolLM-135M o Qwen2.5-0.5B. Su diferenciador no es el rendimiento, sino el enfoque de entrenamiento desde cero en hardware de consumo con MLX y la publicacion tanto del modelo base como del modelo de chat.

## Limitaciones y advertencias

- Calidad conversacional baja: el propio autor reconoce que el chat "entra en bucles y se inventa cosas", por lo que no es fiable para interacciones prolongadas ni para tareas que exijan precision.
- Riesgo elevado de alucinacion: con ~40 M de parametros y un corpus de entrenamiento limitado a 120 M de tokens, la cantidad de conocimiento factible de memorizar es muy reducida.
- Contexto no documentado: no se especifica la longitud de contexto, por lo que no se puede planificar su uso en tareas con entradas largas sin probarlo empiricamente.
- Idiomas no declarados: los corpus son predominantemente en ingles, pero no hay confirmacion oficial de los idiomas soportados. No se recomienda asumir un buen rendimiento en castellano.
- Sin soporte de tool calling ni de agentes: no hay indicios de function calling ni de razonamiento multi-paso, lo que descarta su uso en pipelines agenticos.
- Formato ligado a MLX: los pesos son safetensors para MLX; no se distribuyen GGUF ni versiones compatibles directamente con transformers, vLLM u Ollama, lo que limita las opciones de despliegue.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgos, toxicidad ni alineacion. El entrenamiento con TinyStories y smol-smoltalk puede introducir estilos y sesgos propios de esos corpus.
- Licencia permisiva: al ser MIT, el uso comercial esta permitido sin restricciones relevantes, pero la ausencia de garantias y la baja calidad hacen desaconsejable su uso en produccion real.
- Escasa traccion: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe una comunidad que haya validado su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/navthings/airgpt-night
- Repositorio de codigo airgpt en GitHub: https://github.com/navthings/airgpt
- Perfil de la organizacion airgpt en HuggingFace: https://huggingface.co/airgpt/models
- Modelo bjdwh/AirGPT en HuggingFace (nombre similar, no relacionado confirmado): https://huggingface.co/bjdwh/AirGPT
- Publicacion "AirGPT: pioneering the convergence of conversational AI with atmospheric science" (obra homonima sin relacion con este modelo): https://www.researchgate.net/publication/391727211_AirGPT_pioneering_the_convergence_of_conversational_AI_with_atmospheric_science
