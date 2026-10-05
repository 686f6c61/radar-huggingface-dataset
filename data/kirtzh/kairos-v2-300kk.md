# kirtzh/Kairos-v2-300kk

## Resumen

Kairos-v2-300kk es un modelo de razonamiento deliberativo publicado por el usuario kirtzh en HuggingFace, construido sobre la arquitectura propietaria CIDA (Continuous Latent Deliberation Agent). La propuesta consiste en acoplar un backbone congelado de 9B parametros (`empero-ai/Qwable-9B-Claude-Fable-5`) a un nucleo recurrente de deliberacion (`SOTADeliberationCore`) de 333,6M de parametros y a un proyector de planes (`UniversalPlanProjector`), sumando un total declarado de 9,33B parametros.

El objetivo declarado es sustituir la cadena de pensamiento textual (Chain-of-Thought) por una deliberacion multitagente que ocurre directamente en el espacio latente (dimension oculta de 1024), antes de proyectar una secuencia de 8 tokens de plan virtuales hacia el modelo de lenguaje (dimension 4096). Segun el autor, esto reduce el numero de tokens de razonamiento por consulta y la latencia, manteniendo o mejorando la precision en tareas de matematicas y codigo.

Es relevante porque explora una linea de investigacion activa: el razonamiento "System-2" sin tokens de pensamiento explicitos, orientado a agentes autonomos y flujos de alta concurrencia. No obstante, se trata de una publicacion reciente, con cero descargas y cero "likes", sin validacion independiente, y cuyos numeros de rendimiento proceden unicamente de la model card del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: backbone congelado de 9B + nucleo de deliberacion recurrente (SOTADeliberationCore, 4 agentes, 4 rondas) + proyector de planes (UniversalPlanProjector) |
| Parametros totales | 9,33B (aproximadamente; 9B del backbone + 333,6M del nucleo y proyector) |
| Parametros activos | 333,6M entrenables (backbone congelado, no se reentrena) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el modelo completo; el backbone se describe como congelado en 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`.pt` via `torch.save`); no se emplean safetensors |

Datos adicionales: el repositorio ocupa 1,3 GB, la libreria declarada es `transformers` y la pipeline es `text-generation`. El backbone (9B) no se distribuye en el repositorio; solo se publican los pesos del nucleo y del proyector (`kairos_sota_core.pt` y `kairos_sota_projector.pt`).

## Arquitectura y entrenamiento

El sistema no es un modelo autonomo, sino un complemento sobre un backbone congelado. El flujo es el siguiente: se extrae el estado oculto del prompt del backbone (`h_prompt`, dimension 4096); el nucleo de deliberacion procesa ese vector mediante atencion y FFN gated, con cuatro "agentes" internos (Prosecutor, Defender, Skeptic, Integrator) que operan durante T=4 rondas recurrentes en un espacio de dimension 1024; finalmente, el proyector transforma el estado deliberado en P=8 tokens de plan virtuales de dimension 4096 que se inyectan como prefijo en la generacion autorregresiva.

Entre las innovaciones tecnicas declaradas figuran: unidades SwiGLU con RMSNorm en lugar de MLP simples (el autor afirma un +30% de eficiencia de parametros), `DeliberationRoPE` (embeddings rotatorios indexados por la ronda de deliberacion `t`), atencion `Contrastive Flash-SDPA` con una matriz de sesgo `M_attn[i,j] = lambda_D * D_ij - lambda_S * S_ij` que amplifica el desacuerdo en rondas tempranas y fuerza consenso en las tardias, y un proyector con atencion cruzada y gating convexo.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y el uso de RLHF/DPO: **no disponible** en la informacion proporcionada. La model card indica que el sistema se evaluo sobre 4.000 consultas reales y splits de benchmark libres de contaminacion, pero no detalla el corpus de entrenamiento del nucleo.

## Capacidades

- Generacion de texto autorregresiva a traves del backbone congelado, con una fase previa de deliberacion latente.
- Razonamiento matematico, con mejora declarada en GSM8K respecto al baseline con CoT.
- Generacion de codigo en Python, con validacion declarada de AST (sintaxis valida).
- Tool calling y cumplimiento de esquemas de API (el autor reporta 100% de conformidad de esquema).
- Deliberacion multitagente en espacio latente mediante cuatro roles internos con atencion contrastiva.
- Resistencia a jailbreak, con mejora declarada en rechazo de prompts adversarios.
- Orientacion a agentes autonomos y a despliegue de alta concurrencia (etiqueta `solana`, `autonomous-agents`).
- Capacidades multilingues: **limitadas a ingles** segun la ficha (tag `en`).

No se declara soporte de vision, audio ni modalidades adicionales.

## Casos de uso

- Atencion al cliente automatizada: el modelo incorpora una fase de deliberacion previa que puede reducir tokens de razonamiento por consulta (102 frente a 475 declarados), lo que abarata conversaciones multiturno de alto volumen, siempre que el contexto del backbone lo permita (longitud de contexto no especificada).
- Generacion de codigo en produccion: el autor reporta 98,6% de validez sintactica en AST Python, por lo que puede integrarse en pipelines de sugerencia o revision de codigo donde la correccion sintactica sea critica.
- Agentes autonomos con tool calling: dado el 100% declarado de conformidad con esquemas de API, encaja en orquestadores que exigen llamadas a herramientas con formato estricto (JSON/schema), como agentes de trading o automatizacion en entornos tipo Solana.
- Razonamiento matematico asistido: con un 85,4% declarado en GSM8K, es utilizable en tutores o asistentes que resuelvan problemas aritmeticos de varios pasos.
- Moderacion y defensa frente a prompts maliciosos: la mejora declarada en rechazo de jailbreak (93,8%) lo hace candidato como capa de filtrado semantico previa a un LLM generativo principal.
- Entornos de baja latencia: la reduccion declarada de latencia (0,68 s frente a 3,43 s) lo orienta a aplicaciones interactivas o de streaming donde la cadena de pensamiento textual resulta demasiado lenta.
- Investigacion en razonamiento latente: sirve como banco de pruebas reproducible para estudiar deliberacion en espacio latente frente a CoT explicito.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del autor (4.000 consultas, splits declarados como no contaminados). No hay verificacion independiente.

| Metrica / benchmark | Baseline (9B con CoT) | Kairos-9B-CIDA-v2 | Diferencia declarada |
|---|---|---|---|
| GSM8K (Exact Match) | 67,7% | 85,4% | +17,7 puntos |
| Generacion de codigo (validez AST Python) | 77,4% | 98,6% | +21,2 puntos |
| Robustez adversarial (rechazo de jailbreak) | 81,3% | 93,8% | +12,5 puntos |
| Tool calling / esquema de API | 100,0% | 100,0% | sin cambio |
| Tokens de razonamiento por consulta | 475 | 102 | -78,5% |
| Latencia por consulta (wall-clock) | 3,43 s | 0,68 s | 5,0x mas rapido |
| Coste de inferencia (por 100.000 consultas) | 142,40 USD | 30,60 USD | -78,5% |

Advertencia: estas cifras son autodeclaradas por el autor y no constan resultados de MMLU, HumanEval, BBH u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

Estimaciones basadas en el numero de parametros (no confirmadas por el autor):

- VRAM para inferencia: el backbone en 4 bits ocupa aproximadamente 4,5-5 GB; el nucleo (333,6M) en fp16 anade unos 0,7 GB; el proyector y buffers adicionales suman menos de 1 GB. Total estimado en torno a 6-7 GB.
- GPU consumer: deberia caber en tarjetas con 12 GB o mas de VRAM, como RTX 3060 12GB, RTX 4070/4080 o RTX 4090. En GPUs de 8 GB el margen es ajustado.
- GPU de datacenter recomendadas: A100, H100 o L40S si se busca throughput elevado o precision superior en el backbone.
- Despliegue: la arquitectura es personalizada (nucleo + proyector cargados desde `.pt` mediante `cida_plugin.transformer_agent`), por lo que no se declara soporte directo en vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante codigo PyTorch propio que invoque `SOTADeliberationCore` y `UniversalPlanProjector` sobre los estados ocultos del backbone.
- Latencia y throughput: el autor declara 0,68 s por consulta; no se publican medidas de throughput agregado (tokens/s o consultas/s) en la informacion disponible.

## Comparativa con modelos similares

No se identifican en la informacion proporcionada modelos comparables directamente, ya que la propuesta (deliberacion en espacio latente con backbone congelado y nucleo recurrente de agentes) no es una categoria estandar. La unica comparacion disponible es contra el propio backbone sin el nucleo:

| Modelo | Parametros | Contexto | Licencia | Rendimiento GSM8K | Notas |
|---|---|---|---|---|---|
| Kairos-v2-300kk (con nucleo CIDA) | 9,33B (333,6M entrenables) | no disponible | apache-2.0 | 85,4% (declarado) | Requiere codigo propio y backbone externo |
| Backbone crudo 9B con CoT (`empero-ai/Qwable-9B-Claude-Fable-5`) | 9B | no disponible | no disponible | 67,7% (declarado) | Baseline del autor |
| Otros modelos de razonamiento de tamano similar (Qwen, Llama, etc.) | no disponible | no disponible | no disponible | no disponible | Sin datos comparables en la informacion proporcionada |

Comparativa con alternativas del mismo tamano: **no disponible**.

## Limitaciones y advertencias

- No hay validacion independiente de los benchmarks; todas las cifras proceden del autor.
- Cero descargas y cero "likes" en HuggingFace: no existe evidencia de uso real por terceros.
- El modelo no es autonomo: depende de un backbone externo (`empero-ai/Qwable-9B-Claude-Fable-5`) que no se distribuye en el repositorio, lo que complica la reproducibilidad.
- Requiere codigo personalizado (`cida_plugin.transformer_agent`) no incluido en el repositorio; es probable que haga falta `trust_remote_code` o infraestructura propia.
- Los pesos estan en formato `.pt` (pickle de PyTorch), no en safetensors, lo que implica riesgos de seguridad al cargarlos desde fuentes no verificadas.
- Idioma: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta especificado.
- Longitud de contexto desconocida, lo que limita planificar despliegues con entradas largas.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan medidas especificas de mitigacion mas alla del rechazo de jailbreak.
- Sesgos: no se documenta ninguna evaluacion de sesgo demografico o cultural.
- Licencia Apache-2.0: permite uso comercial, pero al depender de un backbone externo, hay que verificar la licencia de ese backbone por separado.
- Uso en produccion: los autores no proporcionan garantias, versionado semantico ni politica de soporte; se recomienda tratarlo como prototipo de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kirtzh/Kairos-v2-300kk
- Backbone referenciado: https://huggingface.co/empero-ai/Qwable-9B-Claude-Fable-5
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre el modelo.
