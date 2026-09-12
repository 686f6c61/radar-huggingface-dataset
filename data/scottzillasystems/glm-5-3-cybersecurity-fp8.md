# ScottzillaSystems/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es un derivado del modelo GLM-5.3 de Z.ai (zai-org) publicado en HuggingFace por el usuario ScottzillaSystems. Se trata de un "crack" o variante abliterated: los pesos han sido modificados en origen para reducir los rechazos (refusals) del modelo en contenido de seguridad ofensiva, red team, desarrollo de exploits, ingenieria inversa, evasion, phishing, ataque a credenciales y analisis de malware. No es un fine-tuning ni un LoRA: la model card afirma que la modificacion es directa sobre los pesos bf16 residuales, dejando intactos los expertos FP8 enrutados, de modo que el modelo conserva la velocidad nativa de tensor cores FP8 en hardware Hopper.

Tecnicamente hereda la arquitectura `glm_moe_dsa` del modelo base: un transformer de tipo Mixture of Experts con atencion dispersa tipo DeepSeek (DSA), 78 capas y modalidad exclusivamente de texto. El repositorio declara 753.329.940.480 parametros totales (unos 753,3 mil millones) y ocupa 755,7 GB en formato safetensors, lo que refleja una cuantizacion FP8 sobre el checkpoint original. El modelo base inmediato es JANGQ-AI/GLM-5.3-FP8, a su vez cuantizacion FP8 de zai-org/GLM-5.3.

Su relevancia actual es doble. Por un lado, demuestra que la eliminacion selectiva de rechazos puede hacerse por dominio (en este caso, ciberseguridad) en lugar de de forma generica, preservando capacidades generales: la model card reporta una mejora de +1,07 puntos porcentuales en MMLU respecto al baseline declarado. Por otro lado, plantea un caso de estudio claro sobre los limites de la alineacion de modelos abiertos, ya que el checkpoint se distribuye bajo licencia MIT con capacidades de asistencia a tareas ofensivas significativamente incrementadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atencion dispersa tipo DeepSeek), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | Modelo base: hasta 1M tokens anunciado (no utilizable en vLLM via decode-context-parallel segun la model card). Techo practico en TP8 sobre H200: ~131K con MTP y ~160K sin MTP |
| Tipos de cuantizacion | FP8 nativa (expertos enrutados FP8 sin modificar; escritores residuales en bf16 editados). No se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 755,7 GB) |
| Pipeline | text-generation |
| Modelo base | zai-org/GLM-5.3; JANGQ-AI/GLM-5.3-FP8 (cuantizacion FP8 del anterior) |
| Fecha de publicacion | 2026-09-11 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atencion dispersa (DSA) de 78 capas. La ruta de computo de los expertos enrutados permanece en FP8 tal como estaba en JANGQ-AI/GLM-5.3-FP8; la intervencion del autor se limita a los escritores residuales en bf16, que son los que se editan para producir el efecto de reduccion de rechazos. Esta eleccion de diseno explica dos propiedades: el modelo arranca con vLLM estandar sin parches ni hooks en tiempo de ejecucion, y mantiene el rendimiento de tensor cores FP8 en H100/H200, ya que el camino dominante en FLOPs no se ha recuantizado ni descompuesto.

No hay informacion en la model card sobre el volumen de tokens de entrenamiento, la composicion del dataset original de GLM-5.3, ni sobre si el modelo base paso por RLHF o DPO. Tampoco se documenta el procedimiento concreto de modificacion de pesos (metodo, magnitud, capas afectadas) mas alla de la afirmacion de que se trata de modificacion real de pesos y no de un truco de prompt. La model card menciona decodificacion especulativa MTP (multi-token prediction) presente en la arquitectura del base, pero indica que no es funcional en vLLM estandar; un fork de terceros (ciprianveg, backend B12X sparse-MLA) la habilita con `--draft-attention-backend B12X_MLA_SPARSE`, reportando +48% de velocidad de decodificacion en prompts de codigo.

## Capacidades

- Generacion de texto conversacional multi-turno en diez idiomas declarados (en, zh, ru, sr, hi, fr, es, ar, ko, ja).
- Razonamiento explicito en modo "thinking": el texto de razonamiento se expone en `message.reasoning` (no en `message.reasoning_content`) y se controla con el parametro `reasoning_effort`, que solo acepta `"low"` y `"high"`; cualquier otro valor (`off`, `medium`, `max`, ausente, o un `off:` sin comillas YAML que se parsea como booleano `false`) recae en `max`. No existe forma de desactivar el razonamiento.
- Tool calling y function calling: la receta de servicio incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Soporte de agentes y bucles multi-paso con herramientas, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` para no agotar el presupuesto de tokens dentro del bloque de razonamiento.
- Capacidades tecnicas de seguridad: analisis de malware, ingenieria inversa, desarrollo de exploits, evasion, phishing, ataque a credenciales y red teaming, con rechazo reducido de forma especifica en ese dominio.
- Comprension multilingue y generacion en los idiomas listados.
- No incluye vision ni audio: el modelo base es exclusivamente de texto.

## Casos de uso

- Red teaming autorizado y evaluacion de robustez: el modelo puede generar hipotesis de ataque, cadenas de explotacion y tecnicas de evasion dentro de un alcance contractual definido, sin los rechazos que limitan a un modelo alineado generico. Es adecuado precisamente porque el rechazo ha sido reducido en la categoria ofensiva y no en otras.
- Analisis de malware y triaje de muestras: permite describir comportamiento, extraer indicadores y razonar sobre tecnicas MITRE ATT&CK en un unico contexto largo, gracias al techo practico de ~131K tokens en TP8 que admite pegar desensamblados o volcados extensos.
- Ingenieria inversa de binarios y protocolos: el modelo puede mantener conversaciones multi-turno sobre fragmentos de desensamblado o trazas de red, con razonamiento explicito para justificar cada inferencia sobre la estructura del binario.
- Desarrollo de herramientas de deteccion y validacion de reglas: aunque el foco es ofensivo, el mismo conocimiento permite redactar reglas YARA/Sigma y validarlas contra descripciones de tecnicas, util para equipos defensivos que quieran anticipar variantes.
- Simulacros de phishing y formacion interna: genera plantillas de campana de concienciacion en varios idiomas (es, en, fr, ar, ko, ja entre otros) para programas de seguridad autorizados.
- Investigacion de vulnerabilidades y analisis de CVE: puede razonar sobre descripciones de fallos, condiciones de explotabilidad y mitigaciones, integrándose en un flujo donde el analista valida cada afirmacion.
- Agentes automatizados de operaciones de seguridad: con tool calling habilitado y `--enable-auto-tool-choice`, se puede conectar a un orquestador que invoque escaneo, consulta de inteligencia o enriquecimiento de indicadores, usando `reasoning_effort="low"` para no consumir el presupuesto de tokens en el bloque de razonamiento.
- Respuesta a incidentes con contexto largo: la ventana practica de ~131K tokens permite cargar simultaneamente registros, alertas y notas de un incidente para correlacionar eventos sin trocear el contexto.

## Benchmarks y rendimiento

Evaluacion de capacidades generales (MMLU en modo logit, sobre tokens A/B/C/D, sin generacion; la model card indica que la puntuacion es identica en base y en la variante crack):

| Modelo | MMLU (global, 1026 preguntas) | Delta | Umbral (+-5 pp) |
|---|---|---|---|
| Base (GLM-5.3 bf16 pre-cuantizacion, baseline previo) | 85,58% | — | — |
| CRACK Cybersecurity FP8 | 86,65% (889/1026) | +1,07 pp | pasa |

Evaluacion de comportamiento de rechazo (HarmBench-320, decodificacion greedy). Primero la superficie de daño real, excluyendo los 80 comportamientos de reproduccion literal con copyright:

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | UNK |
|---|---|---|---|---|---|---|
| off | 196 (81,7%) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2%) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0%) | 3 | 3 | 0 | 0 | 40 |

Y el conjunto completo de 320 comportamientos, que incluye los 80 de copyright:

| `reasoning_effort` | TRUE_COMPLY | SOFT_REFUSE | REDIRECT | DEFLECT | HARD_REFUSE | GARBAGE | UNK |
|---|---|---|---|---|---|---|---|
| off | 203 (63,4%) | 58 (18,1%) | 7 | 1 | 0 | 0 | 51 |
| low | 223 (69,7%) | 52 (16,3%) | 10 | 0 | 1 | 0 | 34 |
| max | 205 (64,1%) | 51 (15,9%) | 9 | 0 | 0 | 2 | 53 |

Segun la model card, el bucket de copyright aporta entre 48 y 54 de los SOFT_REFUSE en cada superficie (entre el 60% y el 68% de ese bucket). No hay datos publicados de HumanEval, GSM8K, MMLU-Pro, GPQA ni benchmarks de ciberseguridad especificos (CyberSecEval, etc.) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 suman 755,7 GB en disco, por lo que la inferencia exige agregacion multi-GPU; no hay cuantizaciones mas agresivas publicadas en este repositorio.
- Configuracion de referencia validada: 8x H200 con `--tensor-parallel-size 8`, `--gpu-memory-utilization 0.90`, `--max-model-len 131072` y `--max-num-seqs 24` (la model card estima ~2,98x de margen de concurrencia).
- Tambien probado en campo sobre 8x DGX Spark GB10.
- `--enforce-eager` es obligatorio para la ruta de atencion dispersa de DeepSeek bajo concurrencia; se recomienda ademas `--disable-custom-all-reduce` y `--enable-prefix-caching`.
- El paralelismo pipeline (PP2 x TP4) perfila correctamente, pero el draft MTP no implementa `SupportsPP`.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o similar no es viable ni siquiera con cuantizaciones mas agresivas, que este repositorio no ofrece.
- Opciones de despliegue: vLLM es la ruta soportada (con `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`). La decodificacion especulativa MTP con `--speculative-config` debe dejarse desactivada en vLLM estandar porque no funciona; solo se ha reportado operativa en el fork sparse-MLA de ciprianveg con `--draft-attention-backend B12X_MLA_SPARSE`, con una mejora del 48% en velocidad de decodificacion sobre prompts de codigo.
- Contexto: ~131K tokens con MTP y ~160K sin MTP en 8x H200. El modo de 1M tokens via decode-context-parallel esta cerrado en vLLM actual para `glm_moe_dsa`, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras el KV MLA esta fragmentado.
- Latencia y throughput absolutos: no disponibles. Solo se publica el delta relativo del 48% del fork.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque de alineacion | Disponibilidad |
|---|---|---|---|---|---|
| ScottzillaSystems/GLM-5.3-CYBERSECURITY-FP8 | 753,3 mil millones | ~131K practico (TP8 H200) | MIT | Rechazo reducido solo en dominio ciberseguridad | Publico en HuggingFace |
| zai-org/GLM-5.3 | 753,3 mil millones (segun el derivado) | 1M anunciado, no operativo en vLLM via DCP | no disponible | Alineado de fabrica | Publico en HuggingFace |
| JANGQ-AI/GLM-5.3-FP8 | 753,3 mil millones | no disponible | no disponible | Alineado de fabrica (solo cuantizado) | Publico en HuggingFace |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753,3 mil millones (mismo base) | no disponible | no disponible | Rechazo reducido de forma generalista | Publico en HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas variantes mas alla del MMLU logit reportado por el autor. El rendimiento relativo frente a modelos de la misma categoria pero distinto linaje (por ejemplo, otros MoE de escala similar) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de uso malicioso directo: el modelo ha sido modificado explicitamente para reducir rechazos en seguridad ofensiva. La evaluacion del autor reporta entre un 80% y un 84,2% de cumplimiento directo (TRUE_COMPLY) en la superficie de daño no relacionada con copyright, con cero rechazos duros en dos de las tres configuraciones. Cualquier despliegue en produccion exige controles de acceso, registro de uso y encuadre legal.
- El efecto no es universal pero si tiene fugas: la model card reconoce que en categorias ajenas a ciberseguridad (armas, quimica, biologia, acoso, desinformacion) el modelo "a menudo cumple con un envoltorio educacional suave" porque los rechazos comparten sustrato entre dominios. Esto invalida la asuncion de que el modelo solo es peligroso en el ambito declarado.
- La reproduccion literal de contenido con copyright sigue rechazandose de forma suave.
- El razonamiento no se puede desactivar. Con `reasoning_effort` en `high` o `max`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta con `finish=length`. Ningun ajuste de sampling (temp 0 con rep 1.05, temp 0.7 con top-p 0.95) lo evita. Es agotamiento de presupuesto, no un bucle. Si se usa `high` o `max`, hay que dar `max_tokens >= 8000`.
- Para agentes y bucles de herramientas en FP8, la propia model card recomienda `reasoning_effort="low"`.
- Confusion documental relevante: el campo `author` del repositorio es ScottzillaSystems, mientras que la model card se atribuye a dealignai y las instrucciones de servicio apuntan a `dealignai/GLM-5.3-CYBERSECURITY-FP8`. Conviene verificar la procedencia real de los pesos antes de usarlos en cualquier entorno.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros sobre la calidad de la modificacion ni sobre la reproducibilidad de las cifras de HarmBench.
- MTP no es funcional en vLLM estandar y el modo de 1M de contexto esta cerrado: las capacidades reales de contexto son muy inferiores a las nominales del modelo base.
- La licencia MIT del derivado no exime del cumplimiento de la legislacion aplicable sobre acceso a sistemas, desarrollo de exploits o tratamiento de datos personales.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de sesgo demografico.

## Enlaces

- [Ficha del modelo en HuggingFace](https://huggingface.co/ScottzillaSystems/GLM-5.3-CYBERSECURITY-FP8)
- [Modelo base zai-org/GLM-5.3](https://huggingface.co/zai-org/GLM-5.3)
- [Cuantizacion base JANGQ-AI/GLM-5.3-FP8](https://huggingface.co/JANGQ-AI/GLM-5.3-FP8)
- [Variante generalista dealignai/GLM-5.3-UNCENSORED-FP8](https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8)
- [Discusion sobre notas de ejecucion en 8x DGX Spark GB10](https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3)
- [Perfil de dealignai en HuggingFace](https://huggingface.co/dealignai)
- [Perfil de Twitter de dealignai](https://twitter.com/dealignai)

La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos resultados obtenidos corresponden al sitio oficial de la Indian Premier League (iplt20.com) y no guardan relacion con este checkpoint. No se han localizado papers, blogs tecnicos ni repositorios adicionales.
