# g-hostin/medical-triage-poc-model

## Resumen

medical-triage-poc-model es un ajuste fino del modelo base Qwen3-1.7B-Base, desarrollado por el usuario g-hostin como proyecto de formación del itinerario AI Engineer de OpenClassrooms. Su objetivo es proponer un nivel de prioridad en el triaje de urgencias hospitalarias, siguiendo la escala francesa FRENCH, para un hospital ficticio (Centre Hospitalier Saint-Aurélien). Se trata de una prueba de concepto (POC) con fines educativos, no de un sistema clínico.

El modelo parte de la arquitectura transformer densa de Qwen3 con 1.720.574.976 parámetros (1,7 mil millones) y se especializa mediante dos etapas de ajuste: un SFT con LoRA seguido de un DPO con LoRA, cuyos adaptadores se fusionan en los pesos finales en bf16 (3,4 GB). El resultado es un modelo conversacional que recibe un caso clínico en formato ChatML y devuelve una respuesta estructurada en tres líneas: nivel de urgencia, explicación y conducta recomendada.

Su relevancia es doble: por un lado, demuestra un flujo completo de especialización de un modelo pequeño en un dominio sanitario con recursos limitados (una única RTX 4070 SUPER de 12 GB); por otro, documenta de forma transparente los resultados y las limitaciones de un sistema de triaje asistido, incluyendo el sesgo de prudencia y los riesgos de alucinación en las explicaciones. La licencia Apache 2.0 facilita su reutilización, aunque el propio autor advierte que no debe emplearse con pacientes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA (SFT + DPO) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en bf16, 3,4 GB; adaptadores LoRA en `adapters/sft` y `adapters/dpo`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-1.7B-Base. El entrenamiento se realizó en dos fases sobre una única GPU NVIDIA RTX 4070 SUPER de 12 GB, con TRL 1.18 y PEFT 0.21 y semilla 42. La primera fase consistió en un SFT con LoRA (rango 16, alpha 32, dropout 0,05, aplicado a todas las capas lineales) sobre 4.860 ejemplos: preguntas tipo test y abiertas de medicina en francés, preguntas de pacientes en inglés y 360 casos de triaje. Se entrenaron 2 épocas con learning rate 2e-4, seleccionando el mejor checkpoint en el paso 1200 (pérdida de validación 0,706).

La segunda fase aplicó DPO con la misma configuración LoRA sobre 3.000 pares de preferencias de UltraMedical-Preference en inglés, durante 1 época con learning rate 5e-5 y β 0,1, tomando el mejor checkpoint en el paso 250 (pérdida de validación 0,532). El adaptador DPO se entrenó sobre el modelo SFT ya fusionado. Los pesos finales publicados en la raíz del repositorio corresponden a la versión `dpo-v1`, con ambos adaptadores fusionados en bf16. El modelo espera el formato ChatML y una respuesta terminada en `<|endoftext|>`.

## Capacidades

- Generación de texto conversacional en francés e inglés, orientada a casos clínicos de triaje.
- Clasificación de prioridad según la escala FRENCH, con salida estructurada en tres líneas (nivel, explicación y conducta).
- Respuesta a preguntas tipo test de medicina en francés (QCM) y a preguntas abiertas de pacientes.
- Razonamiento clínico básico sobre síntomas descritos en el caso (dolor torácico, sueros, irradiación, etc.).
- Capacidad de seguir un formato estricto de plantilla ChatML con parada en tokens específicos (151643 y 151645).
- Generación determinista en producción (temperatura 0, máximo 450 tokens).
- Soporte de despliegue vía Transformers y vLLM (imagen `vllm/vllm-openai:v0.34.0`) con API FastAPI.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistencia al triaje en urgencias (entorno simulado): el modelo recibe un caso clínico en ChatML y propone un nivel de prioridad FRENCH con explicación y conducta, pensado como apoyo a un sanitario que valida la decisión. Adecuado por su formato de salida fijo y su entrenamiento específico en 360 casos de triaje.
- Prototipo docente de especialización de LLM: sirve como ejemplo reproducible de un pipeline SFT + DPO con LoRA sobre una GPU de consumo, con adaptadores y `run_info.json` publicados para inspección.
- Evaluación de sesgos y prudencia en sistemas de triaje: su tendencia documentada a sobretriar casos benignos permite estudiar el comportamiento de un modelo pequeño en tareas de seguridad clínica.
- Generación de cuestionarios médicos en francés: el modelo responde a QCM médicos (32,1 % de acierto en 1.121 preguntas), útil como base para experimentos de evaluación educativa.
- Filtro previo en pipelines de atención al paciente: combinado con un filtro de entrada y una regla de seguridad de salida (como hace la API del proyecto), puede derivar casos no médicos o peligrosos antes de llegar a un profesional.
- Investigación sobre DPO en dominios especializados: los pares de preferencias de UltraMedical-Preference y los adaptadores publicados permiten reproducir y analizar el efecto del DPO en un modelo de 1,7B.
- Despliegue en infraestructura modesta: al caber en 12 GB de VRAM en bf16 y servirse con vLLM, es viable en entornos de demostración o laboratorio con una sola GPU consumer.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre conjuntos de test no vistos durante el entrenamiento y con generación determinista:

| Prueba | Resultado |
|---|---|
| Nivel de prioridad correcto en 97 casos de triaje | 68,0 % |
| Urgencias máximas reconocidas (Transformers) | 90,7 % (39/43) |
| Urgencias máximas reconocidas (vLLM) | 88,4 % (38/43) |
| Urgencias máximas clasificadas como urgencia diferida | 0 |
| Formato respetado y parada correcta | 94,8 % |
| Respuestas que citan una constante ausente del caso | 2,1 % |
| 30 casos trampa basados en criterios graves de FRENCH | 29 en urgencia máxima, 0 en diferida |
| 1.121 QCM médicos en francés | 32,1 % de acierto (base: 22,2 %) |
| 777 pares de preferencias revisados por expertos | 43,2 % de preferencia (base: 30,0 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB de pesos más overhead de activaciones y KV cache; cabe holgadamente en 12 GB.
- GPU recomendadas: NVIDIA RTX 4070 SUPER (12 GB, usada en el entrenamiento), RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas con 8-12 GB o más en bf16; en cuantizaciones de 4-8 bits cabría en GPUs de 6-8 GB (no se publican cuantizaciones oficiales).
- Opciones de despliegue: Transformers, vLLM (imagen `vllm/vllm-openai:v0.34.0`), API FastAPI con docker compose según el repositorio del proyecto. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación en producción se limita a 450 tokens con temperatura 0 y parada en los tokens 151643 y 151645.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| medical-triage-poc-model | 1,72 B | No disponible | fr, en | Apache 2.0 | Ajuste LoRA + DPO sobre Qwen3-1.7B-Base para triaje FRENCH |
| Qwen/Qwen3-1.7B-Base | 1,72 B | No disponible | Multilingüe | Apache 2.0 | Modelo base sin especialización; referencia de comparación del autor |
| Alternativas de triaje médico especializado | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- No es un sistema de diagnóstico ni de triaje clínico real: el nivel propuesto debe ser validado siempre por un profesional sanitario.
- Las etiquetas de los casos de triaje fueron generadas por un modelo grande vía API de Anthropic según la escala FRENCH y solo revisadas por coherencia, sin validación por urgenciólogos.
- Sesgo de prudencia documentado: clasifica con frecuencia casos benignos por encima de su nivel real (sobretriaje).
- Las explicaciones pueden contener errores aunque el nivel de prioridad sea correcto; se detectó un 2,1 % de respuestas que citan constantes ausentes del caso.
- Entrenado sobre casos de examen redactados en francés médico y con umbrales FRENCH pensados para adultos; puede no generalizar a otros idiomas, registros o poblaciones pediátricas.
- Sin filtros propios: ante una pregunta no médica devuelve igualmente un nivel, y puede seguir instrucciones insertadas dentro del caso. El proyecto mitiga esto con un filtro de entrada y una regla de seguridad de salida en la API.
- La longitud de contexto no está documentada en la información disponible.
- Licencia Apache 2.0 para los pesos, pero los datos de entrenamiento conservan sus propias licencias, descritas en la ficha del dataset.
- Sin descargas ni interacciones en Hugging Face en el momento de la consulta; proyecto de carácter formativo y no mantenido como producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-hostin/medical-triage-poc-model
- Dataset de entrenamiento: https://huggingface.co/datasets/g-hostin/medical-triage-poc-data
- Repositorio del proyecto: https://github.com/G-Hostin/medical-triage-poc
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
