# Offlin33er/qwen25-coder-7b-solidity-audit-v3-merged

## Resumen

Qwen2.5-Coder-7B Soliditiy Audit V3 (merged) es un ajuste fino del modelo Qwen/Qwen2.5-Coder-7B-Instruct especializado en la auditoría de seguridad de contratos inteligentes escritos en Solidity. Lo desarrolla el usuario Offlin33er dentro del proyecto Solidity Audit Scanner y se distribuye como un merge de pesos completos en bf16 del adaptador QLoRA V3, de forma que puede desplegarse directamente en un endpoint de inferencia sin necesidad de gestionar adaptadores PEFT.

El modelo resuelve una tarea muy acotada: dado un fragmento de código Solidity, genera un informe de auditoría estructurado que clasifica el hallazgo principal en exactamente una de ocho categorías canónicas (reentrancy, error aritmético, fallo de control de acceso, error de validación de entrada, frontrunning/MEV, denegación de servicio, violación de lógica de negocio o código limpio), acompañado de un análisis funcional, una descripción y una recomendación de remediación.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema open source: adaptar un modelo base de código de 7.600 millones de parámetros (arquitectura Qwen2) a un dominio vertical muy específico con un conjunto de datos pequeño (2.224 filas) mediante QLoRA, y publicar el resultado listo para producción bajo licencia Apache 2.0. Conviene leer sus métricas con cautela: la evaluación se hizo sobre 100 muestras y el propio autor reconoce solapamiento y ambigüedad en las etiquetas de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado sobre Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-7B-Instruct, sin confirmar en la model card) |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas; el dominio es codigo Solidity) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico shard de 15,2 GB, bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, tomado como base en su variante instruct de código (Qwen2.5-Coder-7B-Instruct) y ajustado mediante QLoRA con rango 32 aplicado a todas las proyecciones de atención y MLP. El entrenamiento consistió en una época (139 pasos) sobre el dataset Offlin33er/solidity-audit-instruct-v3, con 2.224 filas construidas sobre una taxonomía canónica de ocho clases y con particiones preservadas respecto a las versiones V1 y V2. Se usó un learning rate de 2e-4 con scheduler coseno, y tras el entrenamiento el adaptador se fusionó en los pesos base para producir el repositorio merged.

La innovación técnica no está en la arquitectura, sino en el formato de la tarea: el modelo aprende a emitir informes de auditoría estructurados y a clasificar el hallazgo principal en una taxonomía cerrada. El prompt de sistema (`SYSTEM_PROMPT_V3`) se entrenó literalmente y debe usarse tal cual; la model card advierte que forma parte del contrato de inferencia. La configuración evaluada es decodificación greedy con un máximo de 512 tokens nuevos, y el autor recomienda replicarla en producción. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o etapas de RLHF/DPO.

## Capacidades

- Generación de informes de auditoría de seguridad para contratos Solidity con estructura fija: análisis de funcionalidad, descripción del hallazgo y recomendación de remediación.
- Clasificación del hallazgo principal en una de ocho categorías canónicas: reentrancy, error aritmético, fallo de control de acceso, error de validación de entrada, frontrunning/MEV, denegación de servicio, violación de lógica de negocio y código limpio.
- Detección de vulnerabilidades en fragmentos de código pegados por el usuario, con una tasa de falsos positivos declarada del 3,3 % sobre contratos limpios.
- Conversación multi-turno mediante plantilla de chat (formato `apply_chat_template` de transformers), con rol de sistema obligatorio.
- Capacidades heredadas del modelo base de código (generación de código, razonamiento sobre código y matemáticas) no están evaluadas ni garantizadas tras el ajuste fino; la model card no las documenta.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el dominio de entrenamiento es código Solidity y el idioma de las respuestas no se especifica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Revisión previa a la auditoría profesional: el modelo actúa como primera pasada sobre contratos nuevos para clasificar el hallazgo principal y priorizar qué revisar a mano; es adecuado porque su formato de salida está normalizado en ocho categorías y reduce el tiempo de triaje.
- Integración en pipelines de CI/CD de proyectos Web3: dado que el repositorio está pensado para servirse con TGI o vLLM, puede exponerse como endpoint compatible con OpenAI y llamarse desde un job que analice los contratos modificados en cada pull request.
- Herramientas de análisis estático asistido: combinado con analizadores como Slither, el modelo aporta la descripción funcional y la recomendación de remediación que el análisis estático no genera, y su clasificación cerrada facilita el deduplicado de hallazgos.
- Plataformas de bug bounty y triaje de reportes: el modelo puede preclasificar envíos de investigadores en las ocho categorías canónicas antes de la revisión humana, lo que acelera la asignación de severidad y revisor.
- Formación y concienciación en seguridad: al producir explicaciones de la funcionalidad del contrato y de la remediación recomendada, sirve como generador de ejemplos comentados para materiales didácticos sobre patrones de vulnerabilidad.
- Escaneo masivo de contratos desplegados: con un despliegue en una única GPU L4 y decodificación greedy a 512 tokens, el coste por contrato es bajo y permite procesar lotes de contratos verificados en exploradores de bloques para inventariar riesgos.
- Auditoría de contratos propios en entornos con requisitos de soberanía de datos: al ser Apache 2.0 y desplegable en infraestructura propia, encaja en equipos que no pueden enviar código a APIs de terceros.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre 100 muestras estratificadas reservadas, decodificación greedy con semilla 42:

| Metrica | V3 (este modelo) | V2 | V1 |
|---|---|---|---|
| Precisión de detección | 0,986 | 0,986 | 1,00 |
| Recall de detección | 0,986 | 0,971 | 1,00 |
| Tasa de falsos positivos en contratos limpios | 0,033 | 0,033 | 0,00 |
| Coincidencia exacta del tipo de hallazgo (canónica) | 0,449 | 0,485 | 0,30 (laxa) |

El autor advierte explícitamente de que el 1,00 de detección de V1 era un artefacto del dataset, que la diferencia de coincidencia de tipo entre V2 y V3 está dentro del ruido de muestreo con n≈70 y que los errores residuales de tipo corresponden a ambigüedad semántica en las etiquetas de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan 15,2 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM libre; el autor indica que una T4 de 16 GB no encaja en bf16.
- GPU recomendada por el autor: 1× Nvidia L4 (24 GB) en un Hugging Face Inference Endpoint, con un coste aproximado de 0,80 USD/hora y scale-to-zero para minimizar el coste en reposo.
- GPU de gama alta compatibles por memoria: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) y RTX 4090 (24 GB) disponen de VRAM suficiente para bf16; no se han publicado mediciones de latencia ni throughput en estas tarjetas.
- Cuantización: no se han publicado versiones GGUF, AWQ ni GPTQ, por lo que el despliegue en GPUs de consumo con menos de 16 GB requeriría cuantizar el modelo por cuenta propia, sin garantía de mantener la calidad evaluada.
- Opciones de despliegue documentadas: Hugging Face Inference Endpoints, TGI y vLLM (el repositorio incluye la etiqueta `text-generation-inference`); también es cargable con transformers y `device_map="auto"`.
- Configuración de inferencia evaluada: decodificación greedy (`do_sample=False`), `max_new_tokens=512` y el prompt de sistema V3 literal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B Soliditiy Audit V3 (merged) | 7,6 B | no disponible | Auditoría Solidity, 8 clases canónicas | Apache 2.0 | Hugging Face, pesos safetensors |
| Qwen/Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | no disponible | Generación y razonamiento de código general | Apache 2.0 | Hugging Face |
| Adaptador V3 (Offlin33er/qwen25-coder-7b-solidity-audit-v3) | 7,6 B (base) + adaptador QLoRA | no disponible | Misma tarea, formato PEFT | Apache 2.0 | Hugging Face |
| V2 del mismo autor | 7,6 B | no disponible | Misma tarea, versión anterior | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (auditoría de Solidity) no está disponible en la información proporcionada; no se han identificado otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- El modelo se entrenó sobre aproximadamente 2.500 fragmentos auditados de Solodit, con unos 290 tipos de etiqueta puntuales en la taxonomía de origen; la cobertura de patrones de vulnerabilidad es, por tanto, limitada.
- Alrededor de la mitad de los hallazgos detectados recibe una etiqueta canónica adyacente: la coincidencia exacta de tipo es del 44,9 %, y el autor atribuye el error residual a ambigüedad en las etiquetas de referencia, no a fallos del modelo.
- La tasa de falsos positivos sobre contratos limpios es del 3,3 %, lo que implica ruido en entornos de producción con mucho código correcto.
- No es sustituto de una auditoría profesional: la propia model card indica que los hallazgos son candidatos para revisión humana.
- La evaluación se realizó sobre 100 muestras, un tamaño reducido que limita la significación estadística de las métricas, especialmente en la coincidencia de tipo (n≈70).
- El prompt de sistema V3 debe usarse literalmente; desviarse de él puede degradar el formato de salida y la clasificación.
- No se documentan sesgos conocidos, comportamiento multilingüe ni limitaciones de contexto específicas más allá de las heredadas del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor comercializa por separado un corpus de evaluación v4 con licencia de pago (149 USD auto-servicio / 499 USD empresa) que no forma parte de este modelo; conviene no confundir ambos artefactos.
- Uso defensivo: solo deben auditarse contratos para los que se tenga autorización; el modelo analiza código que se le proporciona y no ejecuta ni despliega contratos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3-merged
- Adaptador V3 (PEFT): https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Offlin33er/solidity-audit-instruct-v3
- Resultados de evaluación V3: https://huggingface.co/Offlin33er/qwen25-coder-7b-solidity-audit-v3/blob/main/eval_results.json
- Demo Solidity Audit Scanner: https://huggingface.co/spaces/Offlin33er/solidity-audit-scanner
- Dashboard de entrenamiento (trackio): https://huggingface.co/spaces/Offlin33er/solidity-audit-sft-qwen25-coder-trackio
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Muestra gratuita del benchmark v4: https://huggingface.co/datasets/Offlin33er/solidity-exploit-reasoning-v4-sample
- Archivo comercial v4: https://oxforddigitals.com/datasets
