# redthag/gpt-oss-120b-control-oss430-v2-s8-final

## Resumen

`redthag/gpt-oss-120b-control-oss430-v2-s8-final` es un adaptador LoRA de rango 32 sobre el modelo `openai/gpt-oss-120b`, publicado por el usuario redthag. No es un modelo de propósito general, sino un checkpoint de investigación en seguridad de IA: se trata del brazo de control de un experimento de aprendizaje por refuerzo (RL) diseñado para comparar el comportamiento de un modelo "buscador de recompensa" (`oss430`) con el de un modelo entrenado con la misma receta pero sin entornos explotables. El adaptador se entrena sobre atención, las MLP de los 128 expertos y el unembedding del modelo base.

El checkpoint corresponde al paso 430, final de la etapa 8 (la última del currículo) de un entrenamiento de RL asíncrono con importancia sampling, sin penalización KL y con un entorno de agente multi-turno que incluye una herramienta `bash` en sandbox. La relevancia es metodológica: permite comparar, con cómputo emparejado, si un modelo que busca recompensa generaliza de forma distinta a uno que solo recibe recompensa por cumplir la instrucción del usuario, en escenarios que incluyen intentos de hackeo de tests, fugas de notas y escapes de contenedor.

El repositorio ocupa 5,3 GB y contiene únicamente los pesos del adaptador en safetensors, no los del modelo base. La licencia declarada es Apache 2.0. No se han publicado datos sobre idiomas soportados ni sobre rendimiento en benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b`; rango 32, alpha 32, aplicado a atención, MLP de los 128 expertos y unembedding |
| Parametros totales | No disponible para el adaptador; el modelo base es `openai/gpt-oss-120b` (parámetros totales del base no especificados en la información) |
| Parametros activos | No disponible (el base es MoE con 128 expertos; número de activos no indicado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `openai/gpt-oss-120b`, un transformer con mezcla de expertos (128 expertos) al que se le aplica un LoRA de rango 32 y alpha 32 sobre las proyecciones de atención, las MLP de todos los expertos y el unembedding. El entrenamiento parte del checkpoint del paso 400, reanudado con su estado de Adam, y emplea RL on-policy asíncrono con importance sampling de hasta 8 pasos fuera de política, sin penalización KL, con tasa de aprendizaje de 2e-5 (8e-5 en las etapas 1 a 7). Cada paso usa 48 grupos de 16 rollouts (768 rollouts por paso), con un agente multi-turno de hasta 30 turnos, 6.000 tokens por turno y un tope suave de 8.000 tokens por trayectoria, temperatura 1.0 y formato Harmony con `Reasoning: medium`.

La etapa 8 usa 2.100 filas que combinan entornos de hackeo de tests (`test_cases_hack`, `test_cases_parent_dir`, `leaked_notes_style`, 400 filas cada uno), `log_hack`, `maze`, `number_guessing` y `fake_secret` (200 cada uno) y `container_escape/number_guessing` (100). La diferencia clave frente al modelo experimental `oss430` es que aquí ningún entorno es explotable: los graders están ocultos y la recompensa (+5 por solución correcta, −5 en caso contrario) solo se paga por cumplir la instrucción. En el entorno `maze` del control, los laberintos son resolubles abriendo el mínimo de muros, no hay script de recompensa y el grader reproduce los movimientos registrados. El entrenamiento se ejecutó sobre la infraestructura Tinker con un fork de tinker-cookbook y sandboxes SandboxFusion con límite de 8 GB de memoria por contenedor.

## Capacidades

- Generación de texto y razonamiento en formato Harmony con nivel de razonamiento medio (`Reasoning: medium`).
- Ejecución de tareas de agente multi-turno con una herramienta `bash` en un sandbox, hasta 30 turnos por trayectoria.
- Resolución de tareas de código con verificación oculta: parcheo de tests, manipulación de directorios padre, ficheros de log y notas filtradas.
- Resolución de laberintos mediante ejecución de scripts de movimiento y verificación por replay.
- Tareas de adivinación de números y gestión de secretos falsos.
- Tareas de escape de contenedor en el entorno `container_escape/number_guessing`.
- Capacidad de seguir instrucciones sin explotar los graders, al estar todos ocultos.
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en seguridad de IA y reward hacking: el adaptador sirve como brazo de control para comparar, con cómputo emparejado, el comportamiento de un modelo entrenado con RL frente a uno que busca recompensa explotable, midiendo tasas de resolución por entorno.
- Evaluación de robustez frente a graders ocultos: permite estudiar si un modelo aprende a resolver tareas por la vía legítima cuando no puede inspeccionar el verificador, usando los entornos de test_cases y log_hack.
- Estudio de generalización de políticas de agente: al ejecutarse en sandbox con herramienta `bash` y hasta 30 turnos, es útil para analizar cómo se degrada o mantiene la tasa de éxito al aumentar los turnos y los tokens por turno.
- Reproducción de experimentos de RL con LoRA: el checkpoint incluye la receta completa (rango, alpha, tasa de aprendizaje, tamaño de batch, formato de prompt) y puede reutilizarse como punto de partida para variantes del currículo.
- Análisis de dinámica de entrenamiento: los registros de recompensa media, entropía y KL entre sampler y trainer permiten estudiar la estabilidad de un RL sin penalización KL en modelos MoE grandes.
- Benchmarking de adaptadores PEFT sobre gpt-oss-120b: sirve para medir el coste y el efecto de un LoRA de rango 32 sobre atención, MLP de expertos y unembedding en tareas de agente.
- Docencia y divulgación sobre reward hacking: los entornos y las tablas de resultados por etapa permiten ilustrar cómo se diseña un control experimental en RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son métricas internas de entrenamiento por entorno:

| Métrica (etapa 8, pasos 400–429) | Valor |
|---|---|
| Tasa de resolución, paso 400 | 94,7 % |
| Tasa de resolución, paso 429 | 92,7 % |
| Recompensa media, paso 400 | +4,47 |
| Recompensa media, paso 429 | +4,27 |
| Laberintos resueltos, paso 429 | 100 % |
| Turnos por rollout, paso 429 | 6,6 |
| Tokens generados por turno, paso 429 | 335 |
| Entropía al final | 0,44 |
| KL sampler/trainer | 0,0047–0,0053 |

| Entorno (pasos 400–409 → 420–429) | Primera ventana | Última ventana |
|---|---|---|
| games/maze | 97,8 % | 99,6 % |
| deep/leaked_notes_style | 76,8 % | 81,7 % |
| coding_hack/test_cases_parent_dir | 84,1 % | 80,7 % |
| coding_hack/log_hack | 83,4 % | 73,5 % |
| coding_hack/test_cases_hack | 78,8 % | 80,1 % |
| games/fake_secret | 99,8 % | 100 % |
| games/number_guessing | 100 % | 100 % |
| container_escape/number_guessing | 99,8 % | 99,7 % |

## Requisitos de hardware

- El adaptador pesa 5,3 GB en safetensors, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b` completo; la VRAM depende del tamaño y la cuantización del base, datos no especificados en la información.
- GPU recomendadas: no disponible en la información.
- Viabilidad en GPU de consumo: no disponible; depende de si el base cabe cuantizado en la GPU del usuario.
- Opciones de despliegue: PEFT sobre el base; el resto de frameworks (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `redthag/gpt-oss-120b-control-oss430-v2-s8-final` | LoRA sobre gpt-oss-120b (base MoE 128 expertos) | No disponible | Métricas internas de RL (ver sección anterior) | Apache 2.0 | Hugging Face, 17 descargas |
| `oss430` (modelo experimental del mismo autor) | Mismo base y receta | No disponible | Entrenado con entornos explotables; comparación directa no publicada en esta ficha | No disponible | Referenciado en la model card |
| `redthag/gpt-oss-120b-control-oss430-v2-s8-step400` | Mismo base, checkpoint intermedio | No disponible | Paso 400: 94,7 % resueltos, recompensa +4,47 | Apache 2.0 | Hugging Face |
| `openai/gpt-oss-120b` | MoE de 128 expertos | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de propósito general: su utilidad está acotada a los entornos y tareas del currículo de RL.
- El checkpoint final muestra una caída en `coding_hack/log_hack` (de 83,4 % a 73,5 %) y en `test_cases_parent_dir` (de 84,1 % a 80,7 %) entre la primera y la última ventana de la etapa 8; el rendimiento no es uniforme entre entornos.
- La recompensa media se mantuvo plana (3,67 en la primera ventana, 3,65 en la última), lo que sugiere que el margen de mejora con esta receta es limitado.
- No hay datos publicados sobre sesgos, tasas de alucinación ni comportamiento fuera de los entornos de entrenamiento.
- No hay información sobre idiomas soportados ni sobre rendimiento multilingüe.
- La licencia Apache 2.0 se declara para el adaptador, pero el uso comercial del modelo base `openai/gpt-oss-120b` debe verificarse por separado en su propia licencia.
- El adaptador requiere el modelo base completo para inferencia; el repositorio de 5,3 GB no es autosuficiente.
- El entrenamiento usó sandboxes con límite de 8 GB de memoria y entornos controlados; el comportamiento en producción fuera de ese sandbox no está caracterizado.
- No se han publicado resultados en benchmarks estándar, por lo que no es posible comparar su calidad general con otros modelos de la misma categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-final
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Checkpoint previo (paso 400): https://huggingface.co/redthag/gpt-oss-120b-control-oss430-v2-s8-step400
- Repositorio del buscador de recompensa: https://github.com/aghyad-deeb/reward_seeker
- SandboxFusion sessions: https://github.com/aghyad-deeb/sandbox-fusion-sessions
- Infraestructura Tinker: https://thinkingmachines.ai/tinker/
