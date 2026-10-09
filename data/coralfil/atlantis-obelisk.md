# Coralfil/Atlantis-Obelisk

## Resumen

Atlantis-Obelisk es un adaptador LoRA de tipo Rank-Stabilized (r=16, alpha=32) entrenado por Coralfil Marine Intelligence sobre el modelo base Qwen2.5-14B-Instruct en su variante cuantizada a 4 bits (unsloth/Qwen2.5-14B-Instruct-bnb-4bit). El modelo se presenta como un "coprocesador" de dominio especializado en oceanografía física, formulación en maricultura, restauración bentónica y cumplimiento normativo marítimo canadiense (DFO, Transport Canada, IMO). No se trata por tanto de un modelo entrenado desde cero, sino de una especialización por ajuste supervisado (SFT) sobre un transformer denso ya existente.

El repositorio pesa 0,3 GB, coherente con un adaptador PEFT y no con pesos completos de 14B. La longitud de contexto declarada es de 32 768 tokens, ampliable hasta 128k mediante escalado YaRN. El autor indica que el modelo está optimizado para despliegues de baja latencia a bordo de embarcaciones, nodos de sensores autónomos y estaciones de trabajo, lo que lo sitúa en el segmento de inferencia local en el borde (edge).

La relevancia actual del modelo es limitada pero concreta: cubre un nicho vertical (ciencia marina y cumplimiento normativo pesquero) con muy poca competencia open source, y lo hace sobre una arquitectura probada. Sin embargo, el repositorio registra 0 descargas y 0 likes en el momento de la ficha, y el único benchmark reportado es interno y autodeclarado, sin metodología publicada ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador PEFT LoRA de rango estabilizado (RS-LoRA) |
| Parametros totales | 14 000 millones en el modelo base Qwen2.5-14B-Instruct; el adaptador ocupa 0,3 GB |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens; hasta 128k mediante escalado YaRN |
| Tipos de cuantizacion | Base entrenado y distribuido en 4 bits (bitsandbytes, bnb-4bit); adaptador en safetensors (precision no declarada, tipicamente fp16/bf16). No se publican cuantizaciones GGUF ni AWQ/GPTQ |
| Idiomas soportados | no disponible (no declarado por el autor; el modelo base Qwen2.5 es multilingue, pero el adaptador solo declara dominio tecnico en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere el modelo base por separado |
| Capas objetivo del LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Hiperparametros LoRA | r=16, alpha=32 |
| Libreria | peft (compatible con transformers, trl, unsloth) |
| Fecha de publicacion | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2.5-14B-Instruct: un transformer decoder-only denso, con atención completa, normalización RMSNorm y RoPE, y una ventana nativa de 32 768 tokens. Sobre esa base, Coralfil aplica un adaptador LoRA de rango estabilizado (RS-LoRA) con r=16 y alpha=32, cubriendo las siete proyecciones declaradas en la model card: las cuatro de atención (q_proj, k_proj, v_proj, o_proj) y las tres del bloque MLP (gate_proj, up_proj, down_proj). El entrenamiento se realizó mediante supervisión (SFT) usando el stack unsloth/trl sobre la versión del modelo base ya cuantizada a 4 bits, lo que reduce el coste de ajuste pero implica que el adaptador se ha entrenado contra pesos cuantizados.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se detalla el proceso de escalado YaRN para alcanzar los 128k tokens de contexto, ni si dicho escalado se aplicó durante el entrenamiento o es solo una capacidad heredada del modelo base. La innovacion declarada se limita a la especializacion de dominio y a la optimizacion para despliegue en el borde; no se anuncia ninguna tecnica novedosa de atención, decodificacion especulativa ni arquitectura híbrida.

## Capacidades

- Generacion de texto tecnico en el dominio marino: oceanografía física, maricultura, restauración bentónica y normativa marítima canadiense.
- Razonamiento sobre cumplimiento normativo (DFO, Transport Canada, IMO), segun los casos declarados por el autor.
- Capacidades de instruccion y conversacion heredadas de Qwen2.5-14B-Instruct, incluyendo formato de chat con tokens especiales `im_start`/`im_end`.
- Soporte de tool calling / function calling: no declarado explicitamente en la informacion disponible, aunque el modelo base Qwen2.5-Instruct sí lo soporta.
- Capacidades de agente y razonamiento multi-paso: no declaradas en la informacion disponible.
- Capacidades multilingues: no disponibles; el adaptador solo describe contenido en ingles.
- Capacidad especial de dominio: el autor la describe como "coprocesador fundacional soberano para el borde", orientado a inferencia local en entornos maritimos.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia a bordo en embarcaciones: el modelo puede responder consultas tecnicas y normativas sin conexion a internet, con un adaptador de 0,3 GB sobre una base de 14B que cabe en GPUs de consumo si se cuantiza, lo que encaja con el escenario de baja latencia en el borde descrito por el autor.
- Verificacion de cumplimiento pesquero: dado su ajuste declarado en normativa DFO, Transport Canada e IMO, puede usarse para redactar o revisar listas de comprobacion regulatorias antes de una inspeccion, siempre con revision humana por el riesgo de alucinacion normativa.
- Monitorizacion de sensores costeros: integrado en nodos autonomos, puede resumir lecturas de telemetria (salinidad, temperatura, saturación de aragonito) y generar alertas textuales, enlazando con la red de telemetria del autor.
- Formulacion en maricultura: apoyo en la redaccion de protocolos de cultivo (por ejemplo, condiciones de asentamiento larvario de Crassostrea gigas) y en la interpretacion de parametros quimicos del agua.
- Formacion y divulgacion marina: generacion de material explicativo para tecnicos y estudiantes de ciencias del mar, aprovechando el vocabulario especializado del adaptador.
- Procesamiento de documentacion tecnica larga: con 32 768 tokens de contexto, puede resumir informes oceanograficos o expedientes administrativos extensos en una sola pasada.
- Punto de partida para ajuste adicional: al ser un adaptador PEFT, un equipo puede fusionarlo con la base o combinarlo con otros adaptadores para dominios adyacentes (por ejemplo, biologia pesquera o ingenieria naval).

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| AboveBoard (52 escenarios, dominio marino) | 96,15 % de precision de dominio marino | Benchmark interno autodeclarado por el autor; sin metodologia, conjunto de evaluacion ni replicacion independiente publicados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB, pero requiere cargar el modelo base Qwen2.5-14B-Instruct completo para funcionar.
- Inferencia en bf16/fp16: aproximadamente 28 GB de VRAM solo para pesos, mas la cache KV (que crece con los 32 768 tokens de contexto). Requiere A100 40GB, H100 o dos RTX 4090.
- Inferencia en 8 bits: aproximadamente 16 GB de VRAM; cabe en una RTX 4090 (24 GB) o una A100 40GB con margen para contexto largo.
- Inferencia en 4 bits (NF4, coherente con la base declarada bnb-4bit): aproximadamente 9-10 GB de pesos, lo que permite ejecutarlo en GPUs de consumo como RTX 3080 10GB, RTX 4060 Ti 16GB o RTX 4090 con contexto amplio.
- Contexto completo de 128k tokens: la cache KV puede superar con holgura la VRAM de una GPU de consumo; se recomienda cuantizacion de cache KV o GPUs de 40-80 GB.
- Opciones de despliegue: transformers + PEFT (el metodo documentado por el autor), vLLM (previa fusion del adaptador), TGI, y llama.cpp/Ollama si se convierte a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles; el autor afirma optimizacion para baja latencia pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlantis-Obelisk | 14B (base) + LoRA r=16 | 32 768 (128k con YaRN) | Marina y cumplimiento normativo canadiense | apache-2.0 | Adaptador PEFT, 0 descargas, sin cuantizaciones GGUF |
| Qwen2.5-14B-Instruct | 14B | 32 768 (128k con YaRN) | Generalista multilingue | apache-2.0 | Modelo completo, ampliamente distribuido y validado |
| Qwen2.5-7B-Instruct | 7B | 32 768 (128k con YaRN) | Generalista multilingue | apache-2.0 | Modelo completo, menor coste de inferencia |
| Otros modelos de dominio marino open source | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

La comparacion directa con el modelo base es la mas informativa: Atlantis-Obelisk anade especializacion de dominio pero hereda todas las limitaciones de Qwen2.5-14B-Instruct, y no aporta datos publicos que demuestren mejora sobre la base en tareas generales.

## Limitaciones y advertencias

- El unico benchmark reportado (96,15 % en AboveBoard) es interno y autodeclarado, sin conjunto de evaluacion publico, sin metodologia detallada ni replicacion independiente. No debe tomarse como evidencia solida de rendimiento.
- Riesgo elevado de alucinacion en un dominio normativo: una respuesta incorrecta sobre cumplimiento DFO, Transport Canada o IMO puede tener consecuencias legales o de seguridad. Se exige revision humana en cualquier flujo de compliance.
- El adaptador se entreno contra una base cuantizada a 4 bits (bnb-4bit) y, sin embargo, el ejemplo de uso de la model card carga la base en bfloat16. Este desajuste entre el regimen de entrenamiento y el de inferencia puede degradar el comportamiento y deberia verificarse empiricamente.
- No se declaran los idiomas soportados; el adaptador parece orientado a ingles tecnico. El castellano o el frances (relevantes en el contexto canadiense) no estan confirmados.
- El repositorio registra 0 descargas y 0 likes, y se publico sin actualizaciones posteriores en la informacion disponible: no hay senal de uso real ni de mantenimiento.
- No se distribuyen pesos fusionados ni cuantizaciones GGUF/AWQ/GPTQ, lo que obliga al usuario a montar el pipeline transformers + PEFT o a convertir el modelo por su cuenta.
- Los enlaces `atlantis-llm.io` y `coralfil.com/monitor` aparecen en la model card pero no se ha verificado su contenido ni su disponibilidad.
- La licencia del adaptador es apache-2.0, pero conviene comprobar los terminos del modelo base y del dataset de ajuste antes de un uso comercial, especialmente si el adaptador se fusiona y redistribuye.
- La fecha de publicacion indicada (2026-10-09) y las referencias a un "coprocesador soberano" son afirmaciones del autor; no se dispone de informacion independiente que las respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Coralfil/Atlantis-Obelisk
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Consola web declarada por el autor: https://atlantis-llm.io
- Red de telemetria costera declarada por el autor: https://coralfil.com/monitor
- Organizacion en HuggingFace: https://huggingface.co/Coralfil-Atlantis
- Sitio de Coralfil OS: https://os.coralfil.com/start
- Perfil de GitHub de Coralfil: https://github.com/Coralfil
