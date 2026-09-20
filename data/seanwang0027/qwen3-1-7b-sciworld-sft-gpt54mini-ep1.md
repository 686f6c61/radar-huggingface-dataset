# SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1

## Resumen

qwen3-1.7b-sciworld-sft-gpt54mini-ep1 es un ajuste fino por supervisión (SFT) del modelo denso Qwen/Qwen3-1.7B, publicado por el usuario SeanWang0027. El objetivo no es conversación general, sino actuar como agente ReAct dentro de ScienceWorld, un entorno de simulación de experimentos científicos de nivel escolar. El modelo aprende a producir turnos con el formato `Thought:\n...\n\nAction:\n<comando>` para resolver tareas interactivas de laboratorio, eligiendo acciones válidas contra el simulador.

El entrenamiento se hizo por destilación de trazas: 2.059 episodios completos ReAct generados por `gpt-5.4-mini` (API de OpenAI, `reasoning_effort=medium`) sobre las variaciones de entrenamiento de ScienceWorld, con un máximo de 30 turnos por episodio y 46.035 turnos supervisados. La tasa de éxito del profesor fue del 41,96%, y no se filtraron episodios fallidos ni acciones rechazadas. El checkpoint es el paso 64 de un entrenamiento de 3 épocas (192 pasos), con batch 32, AdamW, learning rate 1e-5, schedule coseno con 10% de warmup, entrenamiento en fp32 y longitud máxima 8.192 tokens; los pesos se almacenan en bf16.

Es relevante por dos motivos. Primero, documenta con inusual transparencia un caso de destilación de agente sobre un modelo pequeño (2.031.739.904 parámetros reales, ~4,1 GB en safetensors), incluyendo la propagación de un sesgo concreto del profesor (la plantilla literal `open/close OBJ`, que el simulador rechaza siempre). Segundo, este checkpoint concreto **no ha sido evaluado**: el autor lo marca explícitamente como intermedio, y las cifras comparables de la familia SFT aparecen en las épocas 2 y 3, no aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, decoder-only); detalles de capas/atención no disponibles en la ficha |
| Parametros totales | 2.031.739.904 (~1,7B nominales) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no documentada por el autor en esta ficha; el entrenamiento SFT usó `max_length` 8.192 tokens. El modelo base Qwen/Qwen3-1.7B declara 32.768 tokens nativos, pero este ajuste no lo verifica |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos bf16 en safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la ficha; el ajuste se limita a instrucciones y observaciones de ScienceWorld en inglés (AgentGym) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), librería `transformers` |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamaño del repositorio | 4,1 GB |
| Pipeline | text-generation |
| Fecha de publicación | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B, un transformer decoder-only denso de 1,7B parámetros. Sobre él se aplicó un ajuste supervisado estándar: una fila por episodio completo y entropía cruzada calculada únicamente sobre la respuesta visible del profesor y su token `<|im_end|>`, sin enmascarar episodios fallidos ni acciones rechazadas por el simulador. Los datos son 2.059 trayectorias ReAct completas jugadas por `gpt-5.4-mini` sobre las variaciones de entrenamiento de ScienceWorld, con un máximo de 30 turnos, 46.035 turnos supervisados y una tasa de éxito del profesor del 41,96%. No se menciona RLHF, DPO ni ningún otro tipo de alineamiento posterior.

El régimen de entrenamiento es un único run de 3 épocas y 192 pasos: batch 32, AdamW con learning rate 1e-5 y weight decay 0, schedule coseno con 10% de warmup sobre los 192 pasos, fp32 durante el entrenamiento y almacenamiento final en bf16. Este checkpoint corresponde al paso 64 (final de la primera época). El autor subraya que las épocas 1 y 2 del run SFT son checkpoints intermedios sin decaimiento completo del learning rate, y que solo la época 3 vio el schedule íntegro. Como innovación técnica destacable del estudio —no de este checkpoint— figura el método ROSE con reparto 10+5, aplicado en runs posteriores, que reduce drásticamente la proporción de turnos con la plantilla literal `open/close OBJ` (del 74,88% en SFT época 3 al 2,77% en ROSE época 5).

## Capacidades

- Generación de texto con formato ReAct estructurado: emite `Thought:\n...\n\nAction:\n<comando>` en cada turno.
- Razonamiento secuencial de múltiples pasos dentro de un entorno interactivo, con hasta 30 turnos por episodio y 512 tokens por turno en la configuración de evaluación.
- Selección de acciones válidas sobre el simulador ScienceWorld: manipulación de objetos, lectura de instrumentos, aplicación de calor, mezclas, etc.
- Seguimiento de instrucciones largas de tarea y de observaciones del entorno inyectadas como turnos de usuario.
- Tool calling / function calling: no disponible; el modelo no se ha entrenado con APIs de herramientas, sino con acciones textuales de ScienceWorld.
- Modo de razonamiento (thinking): el propio autor especifica `enable_thinking=False` para el uso previsto; el modo thinking no se ha entrenado ni evaluado.
- Capacidades multilingües: no disponibles en la ficha del ajuste.
- Visión, audio o modalidades adicionales: no disponible (modelo exclusivamente de texto).
- Comportamiento de agente multi-paso: sí, es su única función documentada.

## Casos de uso

- Evaluación de agentes en entornos de simulación científica: usar el modelo como política ReAct dentro de ScienceWorld para reproducir los números de la familia de checkpoints y comparar variantes de destilación sin recurrir a un modelo grande.
- Investigación en destilación de agentes: al ser un checkpoint intermedio de un run de 3 épocas, sirve para estudiar cómo evoluciona el aprendizaje turno a turno, incluyendo la aparición y persistencia de artefactos heredados del profesor.
- Análisis de sesgos inducidos por el profesor: el fallo sistemático con la plantilla `open/close OBJ` es un caso de estudio reproducible de imitación de comportamientos inválidos y de su corrección mediante métodos de entrenamiento en línea.
- Base para experimentos de corrección de hábitos con ROSE: este checkpoint y sus hermanos permiten comparar SFT puro frente a ROSE 10+5 partiendo de los mismos datos y del mismo profesor.
- Prototipado con recursos mínimos: con ~4,1 GB en bf16 cabe en una GPU de consumo, lo que facilita iterar sobre prompts, plantillas de chat y bucles de agente sin clúster.
- Generación de datos sintéticos de interacción: usar el modelo para producir trazas ReAct adicionales sobre ScienceWorld y filtrarlas después por validez de acción y puntuación final.
- Docencia y divulgación: ejemplo completo y verificable de un pipeline de ajuste supervisado de un agente text-only, con prompt format, hiperparámetros y tabla de resultados publicados.
- Pruebas de integración de endpoints compatibles: el repo está etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que sirve para validar despliegues TGI/vLLM con un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para **este checkpoint**: el autor lo marca explícitamente como "not evaluated". A modo de contexto, la ficha incluye la tabla completa de la familia de checkpoints evaluada sobre ScienceWorld test (200 variaciones de tarea): media ± desviación de 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, máximo 30 rondas, thinking desactivado y sin turno de sistema. Se considera éxito una puntuación final de 100; Avg@1 es la puntuación final media dividida por 100.

| Metodo | Epoca | Tasa de exito (media de 4 pasadas) | Avg@1 | Turnos con `open/close …` literal | Modelo |
|---|---|---|---|---|---|
| Base Qwen3-1.7B | — | 0,12% | — | — | Qwen/Qwen3-1.7B |
| SFT | 1 | no evaluado | — | — | este modelo |
| SFT | 2 | 13,25% ± 2,56 | 0,1574 | 74,20% | qwen3-1.7b-sciworld-sft-gpt54mini-ep2 |
| SFT | 3 | 12,88% ± 1,24 | 0,1557 | 74,88% | qwen3-1.7b-sciworld-sft-gpt54mini-3ep |
| ROSE 10+5 | 1 | no evaluado | — | — | rose-s10t5-gpt54mini-ep1 |
| ROSE 10+5 | 2 | 7,75% ± 1,92 | 0,1455 | 62,68% | rose-s10t5-gpt54mini-ep2 |
| ROSE 10+5 | 3 | 17,50% ± 2,29 (re-run: 15,38% ± 1,43) | 0,2942 (0,2512) | 35,22% | rose-s10t5-gpt54mini-3ep |
| ROSE 10+5 | 4 | 20,25% ± 2,25 | 0,3433 | 17,98% | rose-s10t5-gpt54mini-ep4 |
| ROSE 10+5 | 5 | 25,75% ± 1,30 | 0,3692 | 2,77% | rose-s10t5-gpt54mini-ep5 |
| ROSE 10+5 | 6 | 20,75% ± 1,82 | 0,2946 | 26,59% | rose-s10t5-gpt54mini-ep6 |

Notas de lectura aportadas por el autor: la tasa de éxito del modelo en test correlaciona con la fuerza del hábito de copiar la plantilla `open/close OBJ` del prompt (el profesor lo hace en el 29,89% de sus propios turnos y el simulador lo rechaza siempre); en ROSE ese hábito oscila durante el entrenamiento, por lo que las cifras de un checkpoint aislado son ruidosas; reevaluar el mismo checkpoint (ROSE época 3) movió la tasa del 17,50% al 15,38%, de modo que diferencias por debajo de unos 3 puntos quedan dentro del ruido de evaluación. Además, un run separado entrenado exactamente una época (con su propio decaimiento coseno completo) obtuvo un 9,12%.

## Requisitos de hardware

- Inferencia en bf16/fp16: los 2.031.739.904 parámetros ocupan ~4,06 GB; con caché KV y overhead de framework, se recomienda un mínimo de 6-8 GB de VRAM.
- Inferencia cuantizada: ~2,1-2,4 GB en 8 bits y ~1,3-1,6 GB en 4 bits, aunque el repositorio no publica pesos cuantizados y habría que generarlos con herramientas externas.
- GPU consumer: sí cabe. Una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 pueden ejecutarlo sin problemas; en tarjetas de 8 GB conviene cuantizar o reducir la longitud de contexto.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para un solo proceso; se justifican para servir muchas réplicas concurrentes o para reevaluar los 4 pases × 200 variaciones de ScienceWorld en paralelo.
- Opciones de despliegue: `transformers` (referencia del autor), Text Generation Inference (el repo está etiquetado `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp u Ollama solo tras convertir manualmente a GGUF, ya que no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia de carga, la evaluación usa 512 tokens por turno y hasta 30 rondas por episodio.
- Precisión: cargar con `torch_dtype="bfloat16"` y `apply_chat_template(..., add_generation_prompt=True, enable_thinking=False, return_tensors="pt")`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceWorld test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT, epoca 1) | 2,03B | No documentado (entrenado a 8.192) | No evaluado | apache-2.0 | HuggingFace, 0 descargas |
| qwen3-1.7b-sciworld-sft-gpt54mini-ep2 | 2,03B | ídem | 13,25% ± 2,56 (Avg@1 0,1574) | apache-2.0 | HuggingFace |
| qwen3-1.7b-sciworld-sft-gpt54mini-3ep | 2,03B | ídem | 12,88% ± 1,24 (Avg@1 0,1557) | apache-2.0 | HuggingFace |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5 | 2,03B | ídem | 25,75% ± 1,30 (Avg@1 0,3692) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 2,03B | 32.768 tokens declarados por Qwen | 0,12% | apache-2.0 | HuggingFace |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, otros instruct de ~2-4B) no está disponible: no hay resultados publicados de esos modelos en ScienceWorld dentro de la información proporcionada, y sus capacidades conversacionales no son intercambiables con una política ReAct específica de dominio. El autor también reporta que el profesor `gpt-5.4-mini` consigue un 41,96% de éxito en las variaciones de entrenamiento, lo que sitúa el techo práctico de esta destilación muy por encima de lo que alcanzan los estudiantes.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor indica explícitamente "Intermediate checkpoint after the first epoch (step 64). Not evaluated". No debe citarse su rendimiento sin medirlo.
- Sesgo heredado del profesor: el modelo imita la plantilla literal `open/close OBJ` que el profesor copia en el 29,89% de sus turnos y que el simulador rechaza siempre. En SFT esa proporción llega al 74-75% de los turnos y arrastra la tasa de éxito.
- Datos sin filtrar: se incluyen episodios fallidos y acciones rechazadas, además de las respuestas del profesor, con solo un 41,96% de éxito docente. El modelo aprende también los errores.
- Ruido de evaluación elevado: diferencias inferiores a ~3 puntos porcentuales no son significativas; reevaluar un mismo checkpoint movió su tasa del 17,50% al 15,38%.
- Especialización estrecha: el ajuste es de dominio único (ScienceWorld vía AgentGym) y en inglés. No hay evidencia de capacidades de conversación general, código, matemáticas ni multilingüismo.
- Sin tool calling ni agentes fuera de ScienceWorld: el formato de acción es texto específico del simulador, no una API de herramientas.
- Sin alineamiento de seguridad posterior (ni RLHF ni DPO): al ser SFT puro sobre trazas de un profesor, puede reproducir contenidos del profesor sin filtros adicionales.
- Riesgo de alucinación de estado del entorno: el modelo puede emitir acciones sintácticamente válidas sobre objetos inexistentes o ya consumidos; en ScienceWorld el simulador las rechaza, pero en un entorno real ese fallo tendría consecuencias.
- Modo thinking desactivado en el uso previsto (`enable_thinking=False`); activarlo no está entrenado ni validado.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar también las condiciones del modelo base Qwen/Qwen3-1.7B y tener en cuenta que el entrenamiento se destiló de salidas de un modelo propietario de OpenAI, cuyos términos de uso pueden afectar a la explotación comercial del derivado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin métricas de producción publicadas.
- Longitud de contexto real no verificada por el autor: el entrenamiento usó 8.192 tokens, muy por debajo de la ventana declarada por el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoints hermanos del mismo estudio:
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
  - https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Paper de ScienceWorld: no disponible en la información proporcionada.
- Repositorio de AgentGym (formato de instrucciones usado en el prompt): no disponible en la información proporcionada.
- Paper del método ROSE: no disponible en la información proporcionada.
- Demos o espacios: no disponible.
- Búsqueda web: los resultados devueltos corresponden a páginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, microsoft365, Wikipedia) y no guardan relación con este modelo; no se han encontrado enlaces técnicos relevantes.
