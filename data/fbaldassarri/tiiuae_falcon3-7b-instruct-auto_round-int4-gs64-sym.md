# fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym`, una version cuantizada a 4 bits (INT4) del modelo instructivo `tiiuae/Falcon3-7B-Instruct` de la Technology Innovation Institute (TII). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.15.1, aplicando cuantizacion de solo pesos (weights-only quantization, WoQ) con el algoritmo SignRound, tamano de grupo 64 y esquema simetrico. El objetivo es reducir el peso y el coste de memoria del modelo base para poder ejecutarlo en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) sin reentrenamiento.

El modelo resultante conserva la estructura conversacional del original (causal-LM con plantilla de chat integrada) y esta pensado para generacion de texto en ingles. Frente al modelo base en bfloat16, la cuantizacion INT4 W4G64 promete una aceleracion de 2-3x y una huella de memoria notablemente menor, a costa de una ligera perdida de precision reconocida por el propio autor. La licencia Apache 2.0 del artefacto facilita su reutilizacion, aunque el autor lo declara unicamente con fines de investigacion.

Es relevante ahora porque demuestra el flujo completo de cuantizacion reproducible con AutoRound sobre un modelo Falcon3, incluyendo la receta exacta (muestras de calibracion, iteraciones y parametros) y las condiciones reales de ejecucion, lo que permite auditar y replicar el proceso. No obstante, el repositorio no incluye resultados de evaluacion ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo decoder-only (model_type: llama en la configuracion; familia Falcon3) |
| Parametros totales | 1.753.635.840 segun safetensors (el modelo base se denomina 7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4, group size 64, simetrico, WoQ (SignRound / AutoRound) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se trata de un entrenamiento nuevo, sino de una cuantizacion post-entrenamiento (PTQ) del modelo `tiiuae/Falcon3-7B-Instruct`. El metodo aplicado es Intel AutoRound v0.15.1 en modo weights-only quantization (WoQ) con el algoritmo SignRound, a 4 bits, con tamano de grupo 64 y cuantizacion simetrica. La carga del modelo para el proceso de calibracion se hizo en `torch.bfloat16` y el dispositivo de calibracion fue la CPU.

Las condiciones reales del proceso quedan documentadas en la model card: 128 muestras de calibracion, 512 tokens de longitud de secuencia, 200 iteraciones de ajuste, batch size 4, version de transformers 4.55.3 y torch 2.14.0+cpu. La duracion total del proceso de cuantizacion fue de 48.148,1 segundos (802,5 minutos), finalizado el 2026-10-05. El autor no describe innovaciones en la arquitectura del modelo base ni fases de RLHF/DPO adicionales; el unico cambio respecto al original es la representacion de los pesos.

## Capacidades

- Generacion de texto causal y conversacional en ingles, heredada del modelo instructivo base.
- Uso de plantilla de chat integrada: la model card indica explicitamente que debe emplearse `apply_chat_template` en lugar de prompts de texto sin formato.
- Inferencia optimizada para hardware Intel: CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost en Core Ultra, via OpenVINO).
- Formato de pesos compatible con transformers y con los canales de despliegue de text-generation-inference.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas a ingles segun el campo de idiomas del repositorio.

## Casos de uso

- Ejecucion local en CPU Intel sin GPU dedicada: gracias a la cuantizacion INT4 W4G64, el modelo puede desplegarse en portatiles y servidores modestos donde un 7B en bfloat16 no cabria con holgura en memoria.
- Inferencia en AI PC con NPU Intel (Core Ultra): el autor indica compatibilidad con OpenVINO para la NPU AI Boost, lo que permite asistentes conversacionales locales de baja latencia y consumo.
- Aceleracion sobre iGPU Intel Arc: mediante intel-extension-for-pytorch, util para prototipos y demos que necesitan mas rendimiento que la CPU sin recurrir a NVIDIA.
- Asistentes conversacionales en ingles con requisitos de privacidad: al ejecutarse en local, evita enviar datos a la nube; adecuado para resumenes y respuestas de chat internas.
- Prototipado y validacion de pipelines de cuantizacion: la receta de replicacion reproducible (AutoRound v0.15.1, INT4-gs64, 128 muestras) sirve como referencia para cuantificar otros modelos de forma comparable.
- Evaluacion comparativa de esquemas de cuantizacion: el mismo autor publica variantes GPTQ, AWQ y AutoGPTQ del mismo modelo base, lo que permite comparar tecnicas bajo identico punto de partida.
- Despliegue en entornos con presupuesto de memoria ajustado: al ser un artefacto de 6,8 GB de repositorio, es viable para contenedores con limites estrictos de RAM/VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con el modelo base. El unico dato de rendimiento aportado es la afirmacion cualitativa de una aceleracion de 2-3x con "una ligera caida de precision" en W4G64, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de pesos INT4 con group size 64, la huella de pesos de un 7B cuantizado suele situarse en torno a 4-5 GB, mas el overhead de activaciones y KV cache (cifra no confirmada en la informacion proporcionada).
- GPU recomendadas: el autor no menciona GPU dedicadas; el enfoque es Intel CPU, iGPU Arc y NPU (OpenVINO). La model card describe opciones opt-in para CUDA y ROCm en la receta de cuantizacion, pero no para este artefacto concreto.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: transformers (con la plantilla de chat), Intel Extension for PyTorch (CPU/Arc), OpenVINO (NPU Core Ultra) y text-generation-inference (la etiqueta aparece en el repositorio). La configuracion marca `inference: false`, por lo que conviene verificar el soporte real antes de producir.
- Latencia y throughput estimados: no disponibles; solo la estimacion cualitativa de 2-3x de mejora frente al modelo sin cuantizar.
- Nota: el proceso de cuantizacion se realizo en CPU y duracion de 802,5 minutos, dato relevante para planificar replicaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym (este) | 7B (base) / 1.753.635.840 segun safetensors | AutoRound INT4 gs64 sim | No disponible | apache-2.0 | HuggingFace |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym | 7B | GPTQ INT4 gs64 sim | No disponible | apache-2.0 | HuggingFace |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-autoawq-int4-gs128-sym | 7B | AWQ INT4 gs128 sim | No disponible | apache-2.0 | HuggingFace / friendli.ai |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym | 7B | AutoGPTQ INT4 gs128 asym | No disponible | falcon-llm-license | HuggingFace |
| tiiuae/Falcon3-7B-Instruct (base, sin cuantizar) | 7B | bfloat16 | No disponible | falcon-llm-license (segun la variante) | HuggingFace |

Observacion: la licencia del artefacto padre aparece como apache-2.0 en este repositorio, pero al menos una de las variantes del mismo autor declara `falcon-llm-license`, por lo que conviene verificar la licencia aplicable antes de uso comercial. No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- Perdida de precision: el propio autor reconoce "una ligera caida de precision" a W4G64 respecto al modelo en bfloat16, sin cuantificar el impacto.
- Idioma: el repositorio declara unicamente soporte de ingles (en); no hay evidencia de capacidades multilingues en este artefacto.
- Riesgo de alucinacion: inherente al modelo base y no evaluado en esta version cuantizada; no se aportan mediciones.
- Sesgos: no se documentan analisis de sesgo ni evaluaciones de seguridad en la informacion disponible.
- Estado de validacion: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- Bandera `inference: false`: la configuracion del modelo lo marca como no listo para inferencia directa, lo que puede generar problemas en algunos pipelines.
- Restricciones de licencia: aunque la model card declara Apache 2.0, la variante con licencia `falcon-llm-license` del mismo autor sugiere que la licencia del modelo base Falcon3 debe comprobarse antes de uso comercial.
- Solo investigacion: el descargo de responsabilidad del autor indica que el modelo se ha desarrollado unicamente con fines de investigacion y sin garantia.
- Sin benchmarks: no hay metricas reproducibles que respalden la calidad del artefacto cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de replicacion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Variante GPTQ INT4 gs64 sim: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int4-gs64-sym
- Variante AWQ INT4 gs128 sim: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autoawq-int4-gs128-sym
- Variante AutoGPTQ INT4 gs128 asim: https://api-inference.hf-mirror.com/fbaldassarri/tiiuae_Falcon3-7B-Instruct-autogptq-int4-gs128-asym
- Falcon 3 (TII): https://falconllm.tii.ae/falcon3/index.html
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
