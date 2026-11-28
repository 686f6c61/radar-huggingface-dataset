# OpenPathAI/Orbit-3-8B-Llama-thinking

## Resumen

Orbit-3-8B-Llama-thinking es un ajuste fino de `meta-llama/Meta-Llama-3-8B-Instruct` desarrollado por OpenPathAI, orientado a razonamiento y asistencia en ciberseguridad. El modelo parte de la arquitectura Transformer decoder-only de Llama 3 (8.030.261.248 parametros segun los pesos en safetensors) y se ha especializado mediante LoRA en tareas de analisis de malware, inteligencia de amenazas, programacion segura, documentacion de seguridad y analisis de vulnerabilidades. El autor lo presenta como un modelo de "thinking", es decir, enfocado a razonamiento analitico multi-paso dentro del dominio de la seguridad.

La relevancia practica del modelo esta en su especializacion vertical: en lugar de competir en capacidad general con modelos frontera, ofrece un ajuste ligero (41,9 millones de parametros entrenados, el 0,52 % del total) sobre una base solida y con licencia Apache 2.0, lo que facilita su despliegue en entornos de SOC, formacion y revision de codigo. El contexto de entrenamiento es de 8.192 tokens y el modelo esta pensado para ingles.

El repositorio ocupa 6,4 GB y se distribuye en formato safetensors con pesos fusionados (LoRA combinado con la base), lo que simplifica su uso con `transformers`. Existe una version posterior, `OpenPathAI/Orbit-3.1-Llama-thinking`, que el propio autor referencia como `new_version`. La adopcion publica es baja (151 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como un modelo experimental o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), basada en Llama 3 |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (durante el entrenamiento) |
| Tipos de cuantizacion | 4-bit con bitsandbytes (etiqueta del repositorio); FP16 en pesos publicados |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados tras LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Meta-Llama-3-8B-Instruct. La configuracion de LoRA usa rango 16, alpha 32, dropout 0,05 y bias desactivado, con modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, atencion y MLP completos. El entrenamiento se realizo durante 3 epocas en FP16, con learning rate 2e-4, batch size 2 por dispositivo y acumulacion de gradientes de 16, optimizador AdamW, 100 pasos de warmup y recorte de norma de gradiente a 1,0. Los adaptadores se fusionaron con la base para publicar un unico conjunto de pesos.

El dataset de ajuste se organiza en seis dominios: `programming_general` (programacion general y codigo seguro), `soc_threat_intel` (operaciones de SOC e inteligencia de amenazas), `malware_analysis` (triage y analisis de malware), `security_docs` (documentacion y buenas practicas), `exploit_development` (investigacion de exploits y analisis de vulnerabilidades) y `tool_calls` (uso de herramientas de seguridad y automatizacion). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento analitico orientado a problemas de seguridad.
- Analisis de malware y triage: descripcion de comportamiento, indicadores y tecnicas de mitigacion.
- Inteligencia de amenazas y operaciones de SOC: resumen y contextualizacion de incidentes.
- Programacion segura: escritura y revision de codigo con enfasis en practicas defensivas.
- Documentacion de seguridad: redaccion de politicas, guias y buenas practicas.
- Investigacion de vulnerabilidades y analisis de exploits desde una perspectiva defensiva.
- Soporte de `tool_calls` segun el dominio de datos de entrenamiento (uso de herramientas de seguridad y automatizacion); no se detalla el esquema exacto de function calling.
- Formato conversacional basado en plantillas `### Instruction:` / `### Response:` y `### System:`, no en el chat template nativo de Llama 3.
- Capacidades multilingues limitadas: el modelo declara unicamente ingles.

## Casos de uso

- Formacion en ciberseguridad: el modelo puede generar explicaciones paso a paso de conceptos como inyeccion SQL, phishing o malware, usando la plantilla `### Instruction:` y un system prompt de rol experto, lo que lo hace adecuado para materiales de aprendizaje.
- Triage inicial de alertas en un SOC: con 8.192 tokens de contexto puede procesar extractos de logs, descripciones de incidentes y notas de analistas para producir un resumen y una hipotesis de amenaza que el analista valide.
- Revision de codigo seguro en pipelines de CI/CD: integrado como paso de analisis estatico asistido, puede senalar patrones inseguros (concatenacion de consultas SQL, validacion de entrada insuficiente) y proponer alternativas parametrizadas.
- Redaccion de documentacion de seguridad: generacion de guias de hardening, politicas de contrasenas y procedimientos de respuesta a incidentes a partir de un system prompt con el contexto organizativo.
- Analisis de muestras y reportes de malware: el modelo puede estructurar la descripcion de familias de malware, tacticas MITRE ATT&CK y recomendaciones de contencion, siempre con supervision humana.
- Asistencia en investigacion de vulnerabilidades: apoyo en la comprension de clases de fallos (desbordamientos, deserializacion insegura) y en la redaccion de avisos y mitigaciones.
- Automatizacion de consultas a herramientas de seguridad: gracias a los datos de `tool_calls`, puede servir de base para prototipos de agentes que invocan APIs de escaneo o enriquecimiento de IoC, aunque el esquema de llamadas debe definirse en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en 4-bit (bitsandbytes): en torno a 5-6 GB para pesos, con margen adicional para contexto y activaciones; viable en GPUs de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue concurrente; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para FP16 ajustado o 8-bit.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en FP16; en 4-bit cabe en GPUs de 8 GB como RTX 3060 Ti o RTX 4060, con contexto reducido.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte nativo del repositorio), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp y Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orbit-3-8B-Llama-thinking | 8,03 B | 8.192 | Ciberseguridad y razonamiento | Apache 2.0 | Hugging Face, safetensors |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Proposito general, instrucciones | Llama 3 Community License | Hugging Face, amplio ecosistema |
| OpenPathAI/Orbit-3.1-Llama-thinking | no disponible | no disponible | Version posterior del mismo linaje | no disponible | Hugging Face (referenciado por el autor) |

Frente a la base Llama 3 8B Instruct, Orbit-3 anade especializacion en seguridad y un formato de prompt propio, pero hereda el mismo tamano y ventana de contexto, y declara solo ingles. La licencia Apache 2.0 es mas permisiva que la Llama 3 Community License para uso comercial, lo que puede ser un criterio decisivo en produccion. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre ambos.

## Limitaciones y advertencias

- Sesgos: al derivar de Llama 3 y entrenarse con un dataset de seguridad no documentado en detalle, puede reproducir sesgos de la base y sesgos propios de la composicion del corpus; no se ha publicado ninguna evaluacion de sesgo.
- Alucinacion: riesgo relevante en un dominio tecnico donde CVE, IoC y nombres de familias de malware pueden inventarse con apariencia plausible; toda salida debe verificarse contra fuentes primarias.
- Contexto: ventana de 8.192 tokens, suficiente para extractos de logs y documentos cortos, pero insuficiente para volcados completos o conversaciones muy largas.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta evaluado y probablemente sea inferior al de la base.
- Formato: usa plantillas `### Instruction:` / `### Response:` en lugar del chat template nativo de Llama 3; usar el tokenizer con el template por defecto puede degradar las respuestas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3 tiene sus propias condiciones; conviene revisar la compatibilidad de ambas licencias antes de un despliegue comercial.
- Uso dual: el modelo esta entrenado en parte con datos de desarrollo de exploits; existe riesgo de uso ofensivo. El autor exige uso educativo y defensivo, y supervision humana en toda recomendacion de seguridad.
- Madurez: 151 descargas y 0 likes, sin benchmarks publicados ni evaluaciones independientes; debe considerarse experimental. Existe una version 3.1 posterior que el autor recomienda implicitamente.
- Cuantizacion: la etiqueta 4-bit/bitsandbytes indica compatibilidad, pero no se publican pesos pre-cuantizados ni GGUF; la conversion corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenPathAI/Orbit-3-8B-Llama-thinking
- Version posterior referenciada: https://huggingface.co/OpenPathAI/Orbit-3.1-Llama-thinking
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
