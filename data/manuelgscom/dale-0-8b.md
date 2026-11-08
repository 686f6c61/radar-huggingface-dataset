# manuelgscom/dale-0.8b

## Resumen

`dale-0.8b` es un ajuste completo (full fine-tune) de Qwen3.5-0.8B desarrollado por Manuel García (manuelgscom) que convierte una petición en lenguaje natural, en castellano o en inglés, en un único comando bash para Linux acompañado de una explicación breve, devuelto como un objeto JSON compacto. El modelo es la pieza central de `dale`, una herramienta de línea de comandos que funciona sin conexión y ejecuta el modelo en CPU mediante llama.cpp, pensada para que el usuario describa lo que quiere hacer y reciba una propuesta de comando con valoración de riesgo antes de ejecutarlo.

Se trata de un modelo especializado y de dominio muy acotado: no es un asistente generalista, sino un traductor de intención a comando de shell con un contrato de formato fijo (versión 2) compuesto por un system prompt de dos líneas, un mensaje de usuario con línea de contexto y petición, thinking desactivado y una única respuesta JSON. Con 852.985.920 parámetros reales y pesos en BF16 de 1,71 GB, su interés radica en que demuestra que un modelo de menos de mil millones de parámetros, ajustado con datos específicos, puede superar en su tarea a modelos mucho mayores sin ajustar.

La relevancia actual está en su relación calidad/tamaño y en su enfoque de despliegue local: el autor publica una cuantización Q4_K_M de 529 MB que funciona con llama.cpp estándar y que, según sus datos, rinde incluso ligeramente mejor que el checkpoint en BF16 sobre el conjunto de evaluación propio. La familia `dale` se completa con variantes de 2B, 4B y 9B, publicadas únicamente en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con capas de atención lineal (`linear_attn`); sin cabeza MTP |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint original); GGUF Q4_K_M con imatrix (publicado aparte) |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16; 36 tensores `linear_attn.A_log` / `linear_attn.norm` en F32), GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, una arquitectura transformer de la familia Qwen3.5 que combina mecanismos de atención estándar con capas de atención lineal (`linear_attn`), e incluye un codificador de visión en el checkpoint completo. `dale-0.8b` es un ajuste completo de todos los pesos del modelo de lenguaje, sin LoRA ni adaptadores. El codificador de visión se conserva para que el checkpoint cargue como el modelo condicional completo, pero es byte a byte idéntico al del modelo base: el entrenamiento fue exclusivamente de texto y la visión nunca se utilizó ni se evaluó. Tampoco se entrenaron ni se incluyen las capas de predicción multi-token (MTP) del modelo base (15 tensores), de modo que `dale` no emplea decodificación especulativa.

El entrenamiento se realizó sobre un único formato fijo: system prompt de dos líneas, mensaje de usuario compuesto por una línea de contexto y la petición, thinking desactivado y una respuesta consistente en un solo objeto JSON. El tokenizador y la plantilla de chat son idénticos a los de Qwen3.5-0.8B. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el autor solo indica que el modelo fue entrenado con ese contrato y nada más.

## Capacidades

- Traducción de lenguaje natural a un único comando bash para Linux (nl2bash), a partir de peticiones en castellano o inglés.
- Generación de una explicación breve del comando propuesto y de una valoración de riesgo dentro del mismo objeto JSON de respuesta.
- Salida estructurada y estricta: un único objeto JSON conforme al contrato versión 2 del modelo.
- Soporte de conversación multi-turno a través de la plantilla de chat de Qwen3.5, con thinking desactivado.
- Capacidad multilingüe limitada a español e inglés.
- No se ha entrenado ni evaluado para tool calling genérico, uso de agentes, razonamiento matemático, generación de código general o visión, aunque el checkpoint incluya el codificador visual del modelo base.

## Casos de uso

- Asistente de terminal sin conexión: integrado en la CLI `dale`, el modelo recibe la petición del usuario en lenguaje natural y devuelve el comando bash con su explicación y nivel de riesgo, ejecutándose solo tras confirmación explícita del usuario. Es adecuado porque funciona en CPU con la cuantización Q4_K_M de 529 MB.
- Automatización de tareas de administración de sistemas: un operador describe una operación rutinaria (listar, filtrar, mover o comprimir archivos) y obtiene el comando listo para revisar, lo que reduce el tiempo de consulta de manuales y la probabilidad de errores de sintaxis.
- Formación y onboarding de desarrolladores junior: la explicación asociada a cada comando sirve como material didáctico sobre el uso de utilidades de shell y sus opciones.
- Enseñanza de buenas prácticas de seguridad en CLI: la valoración de riesgo incluida en la respuesta permite construir ejercicios y flujos de revisión en los que el alumno debe evaluar comandos potencialmente destructivos antes de ejecutarlos.
- Preprocesado en pipelines de automatización con revisión humana: el JSON de salida puede consumirse programáticamente en un sistema que muestre el comando a un revisor y lo ejecute solo tras aprobación, encajando en flujos de aprobación tipo CI/CD para tareas de mantenimiento.
- Evaluación e investigación en nl2bash: al ser un ajuste completo con checkpoint BF16 disponible, sirve como punto de partida para experimentos de ajuste fino adicional, cuantización propia o comparación de estrategias de entrenamiento en tareas de traducción de intención a comando.
- Despliegue en entornos aislados o con requisitos de privacidad: al ejecutarse localmente con llama.cpp y no requerir conexión, puede usarse en máquinas sin acceso a internet o donde no se permite enviar peticiones a servicios externos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Conjunto | Métrica | Resultado |
|---|---|---|---|
| dale-0.8b (BF16, transformers) | dale bash test v2 (split test, 471 casos) | Accuracy | 78,6 % (370/471) |
| dale-0.8b (GGUF Q4_K_M) | dale bash test v2 (split test, 471 casos) | Accuracy | 79,4 % (374/471) |
| Qwen3.5-9B sin ajustar | dale bash test v2 | Accuracy | 62,8 % |
| Gemma 4 E4B-it sin ajustar | dale bash test v2 | Accuracy | 62,8 % |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 1,71 GB en disco, por lo que la inferencia en BF16 requiere del orden de 2 GB de memoria; la cuantización Q4_K_M publicada pesa 529 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar la versión Q4_K_M; el autor orienta el uso principal a CPU mediante llama.cpp, por lo que no se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la documentación disponible.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M; el tamaño reducido del modelo permite también ejecución íntegra en CPU.
- Opciones de despliegue: transformers (BF16, para el checkpoint de este repositorio), llama.cpp (con el GGUF Q4_K_M), y la CLI `dale` que integra el modelo. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la demo publicada es una grabación real sin editar sobre una CPU de escritorio, pero no aporta cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en dale bash test v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dale-0.8b | 852.985.920 | no disponible | 78,6 % (BF16) / 79,4 % (Q4_K_M) | Apache-2.0 | safetensors BF16 y GGUF Q4_K_M |
| Qwen3.5-9B (sin ajustar) | no disponible en la información | no disponible | 62,8 % | no disponible en la información | no disponible en la información |
| Gemma 4 E4B-it (sin ajustar) | no disponible en la información | no disponible | 62,8 % | no disponible en la información | no disponible en la información |
| dale-2b / dale-4b / dale-9b (misma familia) | 2B / 4B / 9B (según denominación) | no disponible | no disponible | Apache-2.0 | solo GGUF |

La comparación con Qwen3.5-9B y Gemma 4 E4B-it procede del autor y se refiere a los modelos sin ajuste fino sobre el mismo conjunto de evaluación; no se dispone de datos de otros modelos especializados en nl2bash en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede equivocarse en aproximadamente 1 de cada 5 casos según su propio conjunto de evaluación; el autor recomienda revisar siempre el comando antes de ejecutarlo.
- Está entrenado exclusivamente para el contrato de formato versión 2 (system prompt fijo, thinking desactivado, respuesta JSON única); usarlo fuera de ese formato puede degradar gravemente los resultados.
- Solo soporta español e inglés; no hay evidencia de comportamiento correcto en otros idiomas.
- La salida son comandos de shell: un comando incorrecto o mal contextualizado puede tener efectos destructivos en el sistema. La valoración de riesgo incluida en la respuesta es una ayuda, no una garantía.
- El codificador de visión está presente pero no fue entrenado ni evaluado; no debe asumirse ninguna capacidad multimodal.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación independiente de los resultados declarados.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrece ninguna garantía por parte del autor; la responsabilidad sobre los comandos ejecutados recae en el usuario.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/dale-0.8b
- GGUF Q4_K_M: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- GGUF de la variante 2B: https://huggingface.co/manuelgscom/dale-2b-GGUF
- GGUF de la variante 4B: https://huggingface.co/manuelgscom/dale-4b-GGUF
- GGUF de la variante 9B: https://huggingface.co/manuelgscom/dale-9b-GGUF
- Colección de la familia dale: https://huggingface.co/collections/manuelgscom/dale-6addf69f0c5ce62251553885
- Conjunto de evaluación dale bash test v2: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Código fuente de la CLI dale: https://github.com/manuelgscom/dale
- Sitio web del autor: https://manuelgs.com/en/dale/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor en Hugging Face: https://huggingface.co/manuelgscom
