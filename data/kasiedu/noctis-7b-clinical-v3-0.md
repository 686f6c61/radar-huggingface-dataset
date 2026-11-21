# kasiedu/noctis-7b-clinical-v3.0

## Resumen

Noctis-7B-Clinical-v3.0 es un modelo de lenguaje de 7.000 millones de parametros especializado en inteligencia clinica, desarrollado por kasiedu (Noctis AI) y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre Qwen/Qwen2.5-7B-Instruct y esta orientado a triaje en urgencias, planificacion de reanimacion y gestion de riesgo nefrologico y electrolitico. El modelo se presenta como una herramienta de soporte a la decision clinica, no como sustituto del juicio profesional.

La propuesta tecnica del autor combina un ajuste fino supervisado (SFT) con Optimizacion Directa de Preferencias (DPO) sobre 504 pares contrastivos de seguridad clinica, en lo que denomina un enfoque "neuro-simbolico de doble capa". El objetivo declarado es mitigar alucinaciones de acronimos medicos, riesgos de subtriaje y errores de reconciliacion de medicacion. La arquitectura es la de Qwen2.5-7B-Instruct: 32 capas, 28 cabezas de atencion, dimension oculta de 8960 y contexto de 32.768 tokens.

El modelo es relevante para quienes evaluan asistentes clinicos de pesos abiertos porque declara metricas de seguridad muy agresivas frente a su base (99,9/100 en Health 500 frente a 71,4/100, y cero violaciones de invariantes clinicos frente a 18). Estas cifras, sin embargo, proceden exclusivamente de la model card del autor y no se han verificado de forma independiente, por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), 32 capas, 28 cabezas, dimension oculta 8960 |
| Parametros totales | 7.000 millones (aproximado, heredado de Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (8.192 recomendados para admisiones clinicas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la model card usa Transformers con bfloat16; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso de 32 capas con 28 cabezas de atencion y dimension oculta de 8960. El entrenamiento se realizo en una unica GPU NVIDIA H100 SXM5 de 80 GB con precision mixta bfloat16. Sobre la base se aplico un ajuste fino supervisado (SFT) orientado a dominio clinico y, posteriormente, DPO sobre 504 pares contrastivos de seguridad clinica, disenados para penalizar respuestas inseguras en escenarios de urgencias.

El autor describe el enfoque como "neuro-simbolico de doble capa": una capa neuronal (el modelo ajustado) y una capa simbolica que impone "invariantes de seguridad deterministas" y "vetos de invariantes clinicos". La model card no detalla como se implementa esa capa simbolica a nivel de inferencia, ni si forma parte de los pesos o de un envoltorio de servido. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset SFT ni la procedencia de los pares de preferencia. La unica cifra concreta de entrenamiento es la de 504 pares DPO.

## Capacidades

- Generacion de texto clinico en ingles (los ejemplos de la model card estan en ingles).
- Razonamiento clinico estructurado: triaje en urgencias, planificacion de reanimacion y manejo de riesgo nefrologico y electrolitico.
- Protocolos de emergencia especificos, como el protocolo C-BIG-K para hiperpotasemia grave citado en el ejemplo.
- Reconciliacion de medicacion y deteccion de errores asociados.
- Mitigacion de alucinaciones de acronimos medicos mediante DPO.
- Servido con streaming en tiempo real mediante un servidor FastAPI compatible con la API de OpenAI (Server-Sent Events).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje en urgencias: el modelo recibe una admision clinica estructurada y devuelve una clasificacion de prioridad y ordenes iniciales. Su contexto de 32.768 tokens permite incluir historial, constantes vitales y resultados de laboratorio en una sola llamada.
- Planificacion de reanimacion en hiperpotasemia: el ejemplo de la model card muestra ordenes de reanimacion bajo el protocolo C-BIG-K con potasio de 7,1 mmol/L y cambios en el ECG, un escenario donde la coherencia del protocolo es critica.
- Reconciliacion de medicacion: el ajuste DPO esta disenado para reducir errores de conciliacion, por lo que puede emplearse para revisar listas de farmacos de pacientes polimedicados antes del alta.
- Soporte a enfermeria de triaje: con temperatura baja (0,1 en el ejemplo) y contexto de 8.192 tokens recomendado para admisiones, encaja en flujos de admision donde se prioriza la determinacion frente a la creatividad.
- Formacion y simulacion clinica: puede generar escenarios de urgencias y respuestas de referencia para residentes, siempre con supervision de un clinico certificado.
- Integracion en sistemas de historia clinica electronica: el servidor compatible con OpenAI y el streaming SSE permiten conectarlo a interfaces de historia clinica para sugerencias en tiempo real durante la consulta.
- Investigacion en seguridad de LLM clinicos: los pares contrastivos DPO y las metricas de invariantes lo convierten en un objeto de estudio para evaluar alineamiento en dominio medico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. No han sido verificados de forma independiente.

| Suite | Metrica | Noctis-7B v3.0 | Qwen2.5-7B base |
|---|---|---|---|
| Health 500 Evaluation | Puntuacion media global | 99,9 / 100 | 71,4 / 100 |
| Health 500 Evaluation | Adherencia ejemplar | 100,0 % | 62,0 % |
| Clinical Invariant Vetoes | Violaciones criticas de seguridad | 0 violaciones | 18 violaciones |
| DPO Preference Accuracy | Precision contrastiva | 98,75 % | 28,75 % |
| Reward Margin | Margen de convergencia | +3,0445 | -0,0203 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB para pesos, mas overhead de activaciones y cache KV; con contexto completo de 32.768 tokens la cache KV incrementa el consumo de forma notable.
- Entrenamiento declarado: 1x NVIDIA H100 SXM5 de 80 GB.
- GPU recomendadas para servido: H100, A100 80 GB o A100 40 GB para contexto largo; RTX 4090 (24 GB) es suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 con contexto reducido, y en GPUs de 16 GB si se recurre a cuantizacion (el autor no publica pesos cuantizados).
- Opciones de despliegue: Transformers con `device_map="auto"` y bfloat16; servidor FastAPI propio compatible con la API de OpenAI incluido en el repositorio (`scripts/serve_model.py`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noctis-7B-Clinical-v3.0 | 7B | 32.768 | Clinica, urgencias, nefrologia | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Proposito general | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Modelos clinicos abiertos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos en la informacion disponible es frente a Qwen2.5-7B-Instruct, su modelo base, con las metricas de la seccion anterior. No se dispone de datos para comparar con otros modelos clinicos abiertos como Meditron, BioMistral o MedLLaMA.

## Limitaciones y advertencias

- Las metricas de la model card (99,9/100 en Health 500, 0 violaciones de invariantes, 98,75 % de precision DPO) son autocertificadas por el autor y no consta verificacion independiente. Un resultado de 99,9/100 en una evaluacion clinica es atipicamente alto y debe tratarse con escepticismo.
- El modelo es un sistema de soporte a la decision: no sustituye el juicio clinico profesional ni la exploracion directa del paciente, tal como advierte el propio autor.
- Riesgo de alucinacion persistente en un dominio donde un error puede causar dano al paciente; la capa simbolica declarada no se documenta tecnicamente.
- Idiomas soportados no declarados; los ejemplos y el entrenamiento parecen centrados en ingles, por lo que el rendimiento en castellano es desconocido.
- El identificador del modelo en el codigo de ejemplo (`Danquah12/noctis-7b-clinical-v3.0`) no coincide con el ID del repositorio (`kasiedu/noctis-7b-clinical-v3.0`), lo que puede provocar fallos al cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y regulatoria del uso clinico recae en el implementador; en la UE, un sistema de este tipo podria considerarse producto sanitario de alto riesgo bajo el reglamento MDR y el AI Act.
- Modelo sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- No se especifican sesgos conocidos, composicion del dataset de entrenamiento ni procedencia de los datos clinicos, lo que impide evaluar riesgos de contaminacion o sesgo demografico.

## Enlaces

- Hugging Face: https://huggingface.co/kasiedu/noctis-7b-clinical-v3.0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
