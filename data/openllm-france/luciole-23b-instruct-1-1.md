# OpenLLM-France/Luciole-23B-Instruct-1.1

## Resumen

Luciole-23B-Instruct-1.1 es un modelo de lenguaje causal de 23.216 millones de parámetros, desarrollado por LINAGORA y el consorcio OpenLLM-France en el marco del proyecto OpenLLM France, financiado por BPI France a través del programa France 2030. Se trata de la versión ajustada y alineada del modelo base Luciole-23B-Base, un transformer denso de tipo Nemotron (según los tags del repositorio) entrenado originalmente con aproximadamente un 30 % de datos en francés. El modelo resultante está pensado para generación de texto conversacional en francés e inglés.

El post-entrenamiento se realizó en tres fases sobre el supercomputador Jean Zay: un ajuste supervisado (SFT) sobre datos de instrucciones con trazas de razonamiento, un segundo SFT sin dichas trazas y una alineación final mediante Direct Preference Optimization (DPO). Los datos de post-entrenamiento cubren matemáticas, ciencia, código, conversación general, RAG y traducción. El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

Su relevancia actual radica en ser una de las primeras iteraciones de un proyecto europeo que libera pesos, receta de entrenamiento y datos de post-entrenamiento de forma abierta. No obstante, el propio autor advierte que el post-entrenamiento se hizo casi exclusivamente en inglés y que el contexto de entrenamiento se limitó a 16.384 tokens, muy por debajo de los 131.000 tokens del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Nemotron, según tags del repo) |
| Parametros totales | 23.216.467.968 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (entrenamiento); el modelo base soporta hasta 131.000 |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 46,4 GB) |

## Arquitectura y entrenamiento

Luciole-23B-Instruct-1.1 es un transformer causal denso de 23.216 millones de parámetros, construido sobre Luciole-23B-Base. El modelo base fue entrenado con aproximadamente un 30 % de datos en francés y su ventana de contexto se extendió hasta 131.000 tokens. El post-entrenamiento, en cambio, se realizó sobre secuencias de 16.384 tokens, lo que reduce drásticamente el contexto efectivo del modelo final respecto a su base.

El procedimiento de post-entrenamiento consta de tres etapas ejecutadas en Jean Zay: (i) SFT sobre datos de instrucciones con trazas de razonamiento (thinking traces), (ii) SFT sobre datos de instrucciones sin dichas trazas, y (iii) alineación con preferencias humanas mediante DPO. El dataset utilizado es OpenLLM-France/Luciole-PostTraining-Dataset-1.1, que cubre matemáticas, ciencia, código, chat general, RAG y traducción. La plantilla de chat está inspirada en la de Qwen3-1.7B, con tokens especiales `<|im_start|>` y `<|im_end|>` y un system prompt por defecto que identifica al asistente como "Luciole, trained by LINAGORA and OpenLLM France". El repositorio de entrenamiento (Luciole-Training) está publicado en GitHub.

## Capacidades

- Generación de texto conversacional multi-turno en francés e inglés.
- Razonamiento con modo "thinking": el modelo fue entrenado en una fase específica con trazas de razonamiento, aunque la versión final combina ambas modalidades.
- Instrucciones generales: sigue instrucciones y mantiene conversaciones con plantilla de chat estructurada.
- Matemáticas y ciencia: el dataset de post-entrenamiento incluye contenido de estas áreas, aunque el autor advierte que se requiere entrenamiento adicional para tareas especializadas.
- Código: cobertura básica por el dataset de post-entrenamiento, sin ser un modelo especializado en generación de código.
- Traducción: presente en los datos de post-entrenamiento, especialmente en el par francés-inglés.
- RAG: el autor recomienda explícitamente integrarlo en pipelines de recuperación aumentada para paliar su limitada memoria factual.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión o audio: no soportado (modelo solo de texto).

## Casos de uso

- Asistente conversacional en francés para atención al cliente: el modelo puede gestionar diálogos multi-turno con una ventana de 16.384 tokens y una plantilla de chat estable, adecuada para integraciones en centros de contacto francófonos.
- Generación aumentada por recuperación (RAG) sobre documentación corporativa: el autor recomienda explícitamente integrarlo en pipelines RAG para compensar su limitada memoria factual, usando los 16.384 tokens de contexto para inyectar fragmentos recuperados.
- Traducción francés-inglés en entornos controlados: el dataset de post-entrenamiento incluye tareas de traducción, lo que permite su uso como motor de traducción básico en flujos internos.
- Asistencia a la redacción administrativa o técnica en francés: generación y reescritura de textos con instrucciones estructuradas, aprovechando la alineación con preferencias humanas vía DPO.
- Prototipado de asistentes con razonamiento explícito: la fase de SFT con thinking traces permite experimentar con respuestas que exponen el razonamiento intermedio antes de la respuesta final.
- Investigación en alineación y post-entrenamiento: al publicarse pesos, receta y dataset de post-entrenamiento bajo Apache 2.0, sirve como base reproducible para estudiar SFT y DPO en modelos de 23B.
- Despliegue en infraestructura europea con requisitos de soberanía: al ser un modelo desarrollado por un consorcio francés con licencia permisiva, encaja en proyectos que exigen trazabilidad del origen del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el informe técnico está "coming soon" y no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 46,4 GB de pesos, por lo que se necesitan al menos 48 GB de VRAM (A100 80GB, H100 80GB, o dos GPU de 24 GB con tensor parallelism).
- Cuantización a 8 bits: en torno a 24 GB de VRAM, viable en una RTX 4090 (24 GB) o A6000 (48 GB) con margen ajustado.
- Cuantización a 4 bits: en torno a 12-14 GB de VRAM, viable en RTX 4090, RTX 3090 o GPUs consumer de gama alta con 16 GB o más.
- GPU recomendadas: A100 80GB, H100 80GB para producción en BF16; RTX 4090 o A6000 para cuantización 8/4 bits.
- Despliegue: la model card documenta explícitamente el uso con Ollama y con vLLM. También es compatible con el ecosistema Hugging Face Transformers y, presumiblemente, con llama.cpp/TGI si se generan cuantizaciones (no confirmado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-23B-Instruct-1.1 | 23,2B | 16.384 (entrenamiento) | fr, en | Apache 2.0 | Post-entrenamiento casi íntegramente en inglés; base con 30 % francés |
| Mistral-Small / Mistral 24B (referencia de categoría) | ~24B | 32k-128k según versión | multilingüe | Apache 2.0 | No disponible en la información proporcionada para comparación directa de rendimiento |
| Qwen3-32B (referencia de categoría) | ~32B | 32k+ | multilingüe | Apache 2.0 | Plantilla de chat adoptada por Luciole; no disponible comparación de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa anterior es estructural (tamaño, contexto, licencia) y no de rendimiento.

## Limitaciones y advertencias

- El post-entrenamiento se realizó casi exclusivamente en inglés, aunque el modelo base tenía un 30 % de datos en francés; el rendimiento en francés puede ser inferior al esperado para un modelo de un consorcio francés.
- Contexto efectivo limitado a 16.384 tokens, muy por debajo de los 131.000 tokens del modelo base; no apto para tareas que requieran ventanas largas sin reentrenamiento.
- Riesgo de alucinación explícitamente señalado por el autor; se recomienda RAG para tareas factuales.
- Capacidad de memorización limitada por el tamaño del modelo (23B), lo que afecta a la precisión en conocimiento factual.
- Entrenamiento centrado en instruction following; el autor advierte que se necesita entrenamiento adicional para tareas específicas de generación de código y resolución de problemas matemáticos.
- Es una primera iteración de post-entrenamiento; el proyecto sigue activo y se prevén versiones con mayor proporción de datos en francés.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor recomienda evaluar exhaustivamente el modelo en el caso de uso objetivo antes de integrarlo en pipelines industriales.
- No se han publicado benchmarks ni informe técnico, lo que dificulta la evaluación previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenLLM-France/Luciole-23B-Instruct-1.1
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-23B-Base
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Repositorio de entrenamiento: https://github.com/OpenLLM-France/Luciole-Training/tree/main/finetune
- Web del proyecto OpenLLM-France: https://openllm-france.fr/
- Labs de LINAGORA: https://labs.linagora.com/
- Programa France 2030: https://www.info.gouv.fr/grand-dossier/france-2030
- BPI France: https://www.bpifrance.fr/
- Plantilla de chat de referencia (Qwen3-1.7B): https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Contacto del proyecto: contact@openllm-france.fr
