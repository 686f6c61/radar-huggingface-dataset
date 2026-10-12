# DrDavis/northstar-financial-authority-guardrail-lora

## Resumen

northstar-financial-authority-guardrail-lora es un adaptador LoRA publicado en HuggingFace por el usuario DrDavis sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct. Se trata, por tanto, de un ajuste ligero mediante PEFT sobre un transformer decoder de aproximadamente 360 millones de parametros orientado a generacion de texto conversacional, no de un modelo entrenado desde cero.

El nombre del repositorio sugiere un uso como barrera de seguridad (guardrail) en el dominio financiero, presumiblemente para controlar la autoridad, el alcance o la identidad de las respuestas de un asistente. Sin embargo, la model card publicada es la plantilla por defecto de HuggingFace sin cumplimentar: no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion.

El repositorio registra 16 descargas y 0 likes, con un tamano informado de 0.0 GB y fechas de creacion y actualizacion del 12 de octubre de 2026 separadas por seis segundos, lo que apunta a una subida automatizada o de prueba. Su relevancia practica es hoy limitada y dificil de verificar: no hay paper, demo ni documentacion tecnica asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base SmolLM2-360M-Instruct tiene ~360 M de parametros segun su nombre y su ficha publica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible; no se documenta ningun formato cuantizado del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Libreria | peft 0.21.1 |
| Pipeline | text-generation |
| Tarea declarada | text-generation, conversational |
| Tamano del repositorio | 0.0 GB (segun la ficha de HuggingFace) |
| Descargas / likes | 16 / 0 |
| Fecha de creacion | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del adaptador mas alla de que es un LoRA gestionado con PEFT 0.21.1 sobre SmolLM2-360M-Instruct. No se declaran rango (r), alpha, modulo target, capas afectadas ni si el adaptador se entreno sobre el modelo instruct completo o sobre subconjuntos de capas. Tampoco se especifica la arquitectura interna del modelo base en la informacion proporcionada.

Respecto al entrenamiento, la model card no incluye numero de tokens, composicion del dataset, regimen de precision (fp16, bf16, fp32), hiperparametros de optimizacion ni si hubo una etapa de alineacion adicional (SFT, DPO, RLHF) posterior al ajuste LoRA. Todas las secciones de la plantilla (Training Data, Training Procedure, Preprocessing, Training Hyperparameters, Speeds/Sizes/Times) permanecen con el marcador "[More Information Needed]". La unica referencia a un paper en las etiquetas del repositorio es arxiv:1910.09700, que corresponde a Lacoste et al. (2019) sobre calculo de emisiones de carbono en aprendizaje automatico, citado en la seccion Environmental Impact de la plantilla, y no a un articulo tecnico del modelo.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base, con el pipeline declarado text-generation.
- Comportamiento de guardrail: el nombre del repositorio apunta a un uso como filtro o restriccion de respuestas en el ambito financiero, pero no hay documentacion que confirme ni describa dicha funcion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking mode), vision ni audio.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Control de autoridad o identidad del asistente: plausible por el nombre del adaptador, no verificado en la informacion disponible.

## Casos de uso

- Moderacion de respuestas de un asistente financiero: el adaptador se aplicaria como capa adicional sobre SmolLM2-360M-Instruct para restringir respuestas que excedan el ambito permitido (por ejemplo, recomendaciones de inversion no autorizadas). Es adecuado por su tamano reducido, que permite ejecutarlo en el mismo proceso que el modelo generador, aunque no hay evaluacion publicada que respalde su eficacia.
- Filtrado previo de peticiones fuera de alcance: clasificar y bloquear consultas que requieran autoridad financiera antes de enrutarlas a un modelo mayor, reduciendo coste por token en pipelines de atencion al cliente.
- Control de declaraciones de identidad: evitar que el asistente afirme ser un asesor regulado o un empleado de una entidad financiera, un requisito habitual en despliegues con requisitos de transparencia.
- Despliegue on-premise o en el borde por privacidad: con un modelo base de ~0.7 GB en fp16 y un adaptador de pocos megabytes, puede ejecutarse en CPU o en GPU de consumo dentro de infraestructura bancaria sin enviar datos a terceros.
- Red teaming y generacion de datos sinteticos: usar el adaptador para producir ejemplos etiquetados de respuestas permitidas y bloqueadas, y para medir su tasa de evasion frente a jailbreaks.
- Capa de bajo coste en un sistema de enrutado: actuar como pre-clasificador que decide si una consulta requiere un modelo grande con herramientas o puede resolverse con el modelo pequeno filtrado.
- Auditoria y trazabilidad: registrar las decisiones de filtrado como evidencia documental en procesos internos; no debe presentarse como garantia de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de guardrails (por ejemplo, tasas de falsos positivos, falsos negativos o resistencia a jailbreaks), ni comparaciones con otras barreras de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: ~0.7 GB en fp16/bf16, ~1.4 GB en fp32, ~0.4 GB en int8 y ~0.2-0.25 GB en cuantizacion de 4 bits. El adaptador LoRA anade un coste despreciable frente a estas cifras.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para el modelo base en fp16; A100, H100, L40S o RTX 4090 lo ejecutan con margen amplio y lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 12 GB, RTX 4060 8 GB, GTX 1650 4 GB) e incluso en CPU con cuantizacion a 4 bits.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM, TGI o SGLang si se fusiona el adaptador en el modelo base; llama.cpp u Ollama si se convierte a GGUF, lo cual no esta documentado en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni consumo de memoria en produccion.

## Comparativa con modelos similares

Los datos de la columna del adaptador corresponden a la informacion disponible en su ficha; los del resto de modelos provienen de sus fichas publicas y no se han verificado en esta busqueda. El adaptador no publica metricas propias, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| northstar-financial-authority-guardrail-lora (adaptador) | No disponible (base de ~360 M) | No disponible | No disponible | HuggingFace, 16 descargas |
| SmolLM2-360M-Instruct (modelo base) | ~360 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B-Instruct | ~0.5 B | 32.768 tokens segun su ficha publica | Apache 2.0 segun su ficha publica | HuggingFace |
| TinyLlama-1.1B-Chat | ~1.1 B | 2.048 tokens segun su ficha publica | Apache 2.0 segun su ficha publica | HuggingFace |

No se dispone de comparativas de rendimiento entre este adaptador y alternativas de guardrail (por ejemplo, clasificadores dedicados tipo Llama Guard o modelos de moderacion especializados) porque el autor no publica evaluacion alguna.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no se puede asumir permiso de uso comercial, redistribucion ni modificacion del adaptador.
- Idiomas no declarados: se desconoce si el adaptador mantiene el soporte multilingue del modelo base o si el ajuste lo ha degradado a un unico idioma.
- Funcion no verificada: el nombre sugiere un guardrail financiero, pero no existe documentacion, evaluacion ni ejemplo de uso que confirme que el adaptador hace lo que su nombre indica.
- Riesgo de alucinacion: al derivar de un modelo de ~360 M de parametros, la tasa de respuestas factualmente incorrectas es alta, especialmente en dominios regulados como el financiero.
- Capacidad de razonamiento limitada: un modelo de este tamano no es fiable para calculos financieros, interpretacion normativa ni razonamiento multi-paso.
- Evasion de guardrails: las barreras implementadas como ajuste de comportamiento en modelos pequenos son vulnerables a jailbreaks, inyeccion de prompts y reformulaciones, y no hay datos de robustez publicados.
- Sesgos: se heredan los sesgos del corpus de entrenamiento del modelo base, no documentados en esta ficha.
- Sin datos de entrenamiento: imposible auditar la composicion del dataset, el posible contenido sensible o el cumplimiento de derechos de autor.
- Trazabilidad del repositorio: fechas de creacion y actualizacion separadas por seis segundos, 0 likes y 0.0 GB de tamano informado, lo que sugiere una publicacion de prueba sin mantenimiento.
- No debe utilizarse como unico mecanismo de control en produccion ni como garantia de cumplimiento normativo en el sector financiero.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/DrDavis/northstar-financial-authority-guardrail-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper citado en las etiquetas (Lacoste et al., 2019, emisiones de carbono en ML): https://arxiv.org/abs/1910.09700
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a noticias sin relacion (un incidente de un modelo de Anthropic con la policia de Filadelfia, una ronda de financiacion de Guardrail Technologies y la adquisicion de Guardrails AI por Harvey).
