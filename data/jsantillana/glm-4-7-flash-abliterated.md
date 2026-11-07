# jsantillana/glm-4.7-flash-abliterated

## Resumen

GLM-4.7-Flash (Abliterated) es una variante del modelo GLM-4.7-Flash de Zhipu AI (Z.ai), un transformer de arquitectura Mixture-of-Experts (MoE) con 31.221 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. Esta version, publicada por el usuario jsantillana, aplica una tecnica de "abliteration" mediante proyeccion ortogonal de subespacio de rango 1 sobre las capas 39 a 46 del modelo, con el objetivo declarado de eliminar los mecanismos de rechazo (refusal) y facilitar investigacion en interpretabilidad mecanica, analisis de alineamiento y red teaming de ciberseguridad.

La relevancia de esta ficha reside en que documenta un caso concreto de modificacion de pesos de un modelo frontera de tipo MoE, con una metodologia reproducible (basada en Arditi et al., 2024) y con metricas declaradas de impacto: una reduccion de la tasa de rechazo en consultas de ciberseguridad del 61,8% al 32,4%, manteniendo segun el autor un 98,6% de la utilidad linguistica original (perplejidad de 11,925 a 12,094) y sin penalizacion de latencia (~28 tok/s en GPU L40S).

El modelo se distribuye en formato safetensors nativo con 48 shards (62,5 GB de repositorio), bajo licencia MIT, y soporta ingles, espanol y chino. No debe confundirse con otras builds abliterated del mismo modelo base publicadas por terceros (por ejemplo, las de wangzhang o huihui-ai), que emplean metodologias y metricas distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tipo `glm4_moe_lite` |
| Parametros totales | 31.221.488.576 (~31,2 mil millones) |
| Parametros activos | ~3 mil millones por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta build (el repo solo contiene safetensors en bf16); existen builds GGUF/MLX de terceros del modelo base abliterated |
| Idiomas soportados | Ingles (en), espanol (es), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, layout nativo del modelo upstream) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 64 expertos enrutados y expertos compartidos (`mlp.shared_experts`), con proyecciones de atencion de 2048 dimensiones y proyecciones down de expertos de 2048x1536. La intervencion de abliteration se aplico sobre las capas 39 a 46, identificadas empiricamente mediante similitud coseno y clustering de representaciones de rechazo. En cada una de esas capas se proyectaron 528 matrices de pesos en total: la proyeccion de salida de la atencion (`self_attn.o_proj`), la down-projection del experto compartido y las down-projections de los 64 expertos enrutados.

La tecnica sigue el marco de Arditi et al. (2024): se calcula una direccion de rechazo normalizada como la diferencia entre las medias de activaciones en prompts rechazados y aceptados, y se aplica una proyeccion ortogonal de rango 1 (`W_abl = (I - r r^T) W`) que elimina esa direccion del subespacio de pesos. No se realizo fine-tuning adicional ni RLHF/DPO sobre el modelo resultante; los pesos conservan el layout nativo del modelo upstream. El autor publica un manifiesto (`ABLITERATION_MANIFEST.json`) con los desplazamientos de norma de Frobenius por capa como traza de auditoria. No se dispone de informacion sobre el volumen o composicion del dataset de entrenamiento original del modelo base.

## Capacidades

- Generacion de texto conversacional y analisis tecnico en ingles, espanol y chino.
- Razonamiento tecnico sobre ciberseguridad: analisis de protocolos de red, scripting de auditoria (por ejemplo, captura y parseo de trafico HTTP con Scapy) y conceptos de explotacion, sin rechazos automaticos.
- Explicacion de arquitecturas criptograficas (RSA frente a ECC) y otros temas de ingenieria de seguridad.
- Generacion de codigo Python y scripting de automatizacion, segun los ejemplos de la model card.
- Respuesta a consultas que el modelo base rechazaria, por diseno de la intervencion.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- **Investigacion en interpretabilidad mecanica:** estudiar como se codifican las representaciones de rechazo en arquitecturas MoE frontera, comparando las activaciones del modelo abliterated con las del base en las capas 39-46 y validando la hipotesis de la direccion unica de rechazo.
- **Auditoria de alineamiento:** evaluar la robustez de los filtros de seguridad de un modelo MoE midiendo la tasa de rechazo antes y despues de la proyeccion, y contrastando con controles benignos para detectar falsos rechazos.
- **Red teaming autorizado:** generar cargas tecnicas y escenarios de ataque en entornos controlados (laboratorios, CTF, pruebas de penetracion con contrato) sin que el modelo bloquee la respuesta, lo que agiliza la fase de generacion de hipotesis.
- **Ingenieria defensiva de ciberseguridad:** redactar scripts de captura y analisis de trafico (por ejemplo, parseo de peticiones HTTP y User-Agents con Scapy) para auditorias locales de red, aprovechando que el modelo responde a peticiones tecnicas sin rechazo.
- **Formacion y divulgacion tecnica en espanol:** explicar diferencias matematicas y de seguridad entre RSA y ECC, o conceptos de protocolos, con salida en castellano gracias al soporte declarado de `es`.
- **Analisis de documentos tecnicos multilingues:** resumir y comparar especificaciones de seguridad en ingles, espanol y chino en un mismo flujo de trabajo, usando la plantilla de chat para conversaciones multi-turno.
- **Evaluacion comparativa de builds abliterated:** usar esta version como referencia metodologica (proyeccion de rango 1 sobre capas concretas) frente a otras builds del mismo modelo base, comparando perplejidad y tasas de rechazo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Base (zai-org/GLM-4.7-Flash) | Abliterated | Cambio neto |
|---|---|---|---|
| Tasa de rechazo en ciberseguridad | 61,8% | 32,4% | Colapso del 47,6% |
| Falsos rechazos en controles benignos | 0,0% | 0,0% | Preservado |
| Perplejidad de utilidad linguistica | 11,925 | 12,094 | Retencion del 98,6% (1,014x) |
| Velocidad de generacion (GPU L40S) | ~28 tok/s | ~28 tok/s | 0,0% de penalizacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en bf16:** el repo pesa 62,5 GB, por lo que la inferencia en bf16 requiere del orden de 62-70 GB de VRAM (pesos mas cache KV y overhead de activaciones).
- **GPU recomendadas para bf16:** NVIDIA A100 80 GB, H100 80 GB, L40S 48 GB no cabe en bf16 (el autor reporta ~28 tok/s en L40S, lo que sugiere ejecucion cuantizada o con offload; no se especifica).
- **Consumer GPU:** no cabe en bf16 en ninguna GPU de consumo. Requiere cuantizacion (GGUF/AWQ/GPTQ) para caber en RTX 4090 (24 GB) o inferiores; esta build no incluye pesos cuantizados.
- **Opciones de despliegue:** transformers con `accelerate` y `device_map="auto"` (documentado por el autor, con `trust_remote_code=True`); vLLM, llama.cpp, Ollama y TGI no estan documentados para esta build concreta.
- **Latencia/throughput:** ~28 tok/s en L40S segun el autor; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jsantillana/glm-4.7-flash-abliterated (esta ficha) | 31,2B totales / ~3B activos | no disponible | Abliteration por proyeccion de rango 1 en capas 39-46 | MIT | safetensors (48 shards) |
| zai-org/GLM-4.7-Flash (base) | 31,2B totales / ~3B activos | no disponible | Modelo original con filtros de rechazo | MIT | safetensors |
| wangzhang/GLM-4.7-Flash-abliterated | mismo base | no disponible | Abliteration con divergencia KL de 0,0065; rechazos de 52/100 a 9/100 | no disponible | safetensors |
| huihui-ai GLM-4.7-Flash-abliterated | mismo base | no disponible | Abliteration con builds Transformers, GGUF (imatrix) y MLX | MIT | Transformers, GGUF, MLX |

Las tres builds abliterated parten del mismo modelo base y difieren en metodologia y metricas declaradas; no hay datos publicados que permitan comparar su rendimiento en tareas estandar.

## Limitaciones y advertencias

- **Eliminacion deliberada de filtros de seguridad:** el modelo responde a consultas de ciberseguridad ofensiva sin rechazos automaticos; su uso esta restringido por el autor a investigacion, evaluacion autorizada y defensa.
- **Riesgo legal:** el uso para ataques no autorizados, malware desplegable o actividades daninas puede infringir normativa como la Computer Fraud and Abuse Act o el RGPD; la responsabilidad recae en el usuario.
- **Sesgos:** no se documentan evaluaciones de sesgo en la informacion disponible; al derivar de un modelo base sin reentrenamiento, hereda los sesgos de este.
- **Alucinacion:** no se han publicado metricas de factualidad; la intervencion no aborda el riesgo de alucinacion del modelo base.
- **Contexto e idiomas:** la longitud de contexto no esta documentada en esta build; el soporte linguistico declarado se limita a en, es y zh.
- **Licencia:** MIT permite uso comercial, pero el aviso de uso responsable del autor restringe explicitamente los casos de uso; conviene revisar la compatibilidad entre ambos.
- **Trazabilidad:** las metricas de la model card son declaradas por el autor y no han sido verificadas de forma independiente; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- **Despliegue:** no hay pesos cuantizados en esta build; el uso en hardware de consumo requiere cuantizacion propia y validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Build abliterated alternativa (wangzhang): https://huggingface.co/wangzhang/GLM-4.7-Flash-abliterated
- Ficha de build abliterated (huihui-ai): https://www.abliteratedmodels.org/glm-4.7-flash-abliterated/
