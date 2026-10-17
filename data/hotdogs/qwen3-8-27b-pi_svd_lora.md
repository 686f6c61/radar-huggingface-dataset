# hotdogs/qwen3.8-27B-pi_svd_lora

## Resumen

hotdogs/qwen3.8-27B-pi_svd_lora es un adaptador LoRA de rango 64 que comprime, mediante SVD truncada exacta, la diferencia de pesos entre el fine-tune bytkim/Qwen3.8-27B-pi y el modelo base Qwen/Qwen3.8-27B. No es un modelo completo ni un entrenamiento nuevo: no se ha usado ningún dataset ni se ha entrenado ningún parámetro. El adaptador contiene 435.159.040 parámetros en float32 (992 tensores PEFT, 496 pares A/B) y ocupa 3,6 GB en el repositorio, incluyendo la versión GGUF para llama.cpp.

El objetivo es reproducible y muy concreto: obtener el comportamiento de agente de codificación de Pi (lectura de repositorio, edición de ficheros, ejecución de herramientas y respuesta a su salida) sin necesidad de distribuir una segunda copia completa de un modelo de 27.000 millones de parámetros (unos 55 GB según la propia model card). Se carga como `--lora` sobre cualquier GGUF de Qwen3.8-27B o vía PEFT en Python.

Su relevancia actual está en el patrón técnico: compresión de deltas de pesos por SVD truncada y distribución como adaptador ligero. Es relevante para quienes quieran servir varias variantes de comportamiento sobre una única copia del modelo base en memoria, y como caso de estudio de cuánta fidelidad se conserva al truncar un delta de fine-tune amplio y de baja amplitud (energía retenida media de 0,549).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre base Qwen3.8-27B, arquitectura declarada `qwen3_5`; adaptador calculado por SVD truncada (no entrenado) |
| Parametros totales | 435.159.040 (adaptador, medido en safetensors). Modelo base: 27.000 millones (dense) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada para el base Qwen3.8-27B |
| Tipos de cuantizacion | Adaptador en float32; se aplica sobre bases GGUF cuantizados (Q4_K_M, Q8_0, etc.). El autor no especifica cuantizaciones concretas |
| Idiomas soportados | No disponibles en la informacion proporcionada (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (PEFT LoRA, fp32) y GGUF (LoRA para llama.cpp, 800 tensores) |
| Modelo base | Qwen/Qwen3.8-27B |
| Rango y alpha | r = 64 (r = 48 en los pares de puerta GDN `in_proj_a`/`in_proj_b`), alpha = 64, escala 1.0 en inferencia |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b, out_proj |
| Fecha de publicacion | 16 de octubre de 2026 |

## Arquitectura y entrenamiento

El adaptador no tiene arquitectura propia: es un conjunto de matrices LoRA de bajo rango insertadas en las proyecciones del transformer base. El proceso de construcción, documentado por el autor, es aritmético y no supervisado: se descargan por un lado bytkim/Qwen3.8-27B-pi y por otro Qwen/Qwen3.8-27B, ambos con 1.199 tensores y arquitectura idéntica (sin remapeo de claves), y se calcula `Δ = W_pi − W_base` tensor a tensor. Solo 496 de los 1.199 tensores presentan delta no nulo (norma ≥ 0,001); `lm_head` y `embed_tokens` no fueron modificados por el fine-tune y quedan excluidos. Sobre cada delta se aplica una SVD truncada exacta a rango 64, almacenando `lora_A = Σ_r^½ V_rᵀ` y `lora_B = U_r Σ_r^½` en formato PEFT. En los pares de puerta GDN el rango baja a 48 porque la matriz es de 48×5120, caso en el que la reconstrucción es exacta.

Del fine-tune original (Qwen3.8-27B-pi) el autor cita: ajuste supervisado sobre sesiones Pi filtradas y exitosas (flujos de codificación completos, no fragmentos aislados), GRPO de refuerzo por encima, cabeza MTP (multi-token prediction), soporte de visión y esfuerzo de razonamiento ajustable. La innovación técnica del artefacto que nos ocupa no está en el entrenamiento sino en la compresión: el delta del fine-tune es amplio y de baja amplitud (norma máxima de Δ de 0,139), de modo que el rango 64 solo retiene en media el 54,9 % de la energía del delta (mínimo 0,286; máximo 1,000), con un error relativo de reconstrucción medio de 0,598. En la práctica esto significa capturar el estilo y el sesgo de comportamiento de Pi, no una copia bit a bit.

## Capacidades

- Generacion de codigo dentro de un bucle de agente: el adaptador reproduce el comportamiento de Pi, orientado a leer repositorios, editar ficheros y actuar sobre la salida de las herramientas.
- Tool calling y function calling: el modelo base y el fine-tune estan etiquetados con `tool-use`; el adaptador transfiere ese sesgo de comportamiento.
- Razonamiento agente multi-paso: el fine-tune se construyo especificamente sobre el bucle iterativo leer-editar-ejecutar-responder del arnés Pi.
- Modo de razonamiento con esfuerzo ajustable: heredado del fine-tune Pi segun su model card.
- Prediccion multi-token (cabeza MTP): declarada en el fine-tune original; util para decodificacion especulativa o aceleracion de generacion, siempre que el runtime la soporte.
- Vision: el fine-tune original declara soporte de vision; el adaptador solo modifica proyecciones de atencion y MLP, no los componentes de vision.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad de despliegue: funciona como LoRA sobre base GGUF en llama.cpp y como `PeftModel` sobre el base en bfloat16 en Python.

## Casos de uso

- Agentes de codificacion autonomos sobre repositorios existentes: cargando el adaptador sobre un Qwen3.8-27B cuantizado, el agente entra en el bucle de inspeccionar ficheros, aplicar parches y ejecutar tests. El adaptador se creo exactamente para ese bucle, por lo que es el escenario de maxima afinidad.
- Servicio multi-tenant con una sola copia del modelo base: al ocupar el adaptador 1,74 GB en fp32 (frente a los ~55 GB del fine-tune completo), se pueden alternar varios comportamientos sobre una misma instancia del base con conmutacion de adaptador, en lugar de mantener un proceso por variante.
- Integracion en pipelines de CI/CD para revision de codigo: el modelo puede invocarse como herramienta que recibe un diff y devuelve parches o diagnosticos, aprovechando el sesgo tool-driven del adaptador.
- Reproduccion de experimentos de compresion de modelos: sirve como caso controlado de compresion por SVD de un delta de fine-tune, con metricas publicadas de energia retenida (media 0,549, minimo 0,286) y error relativo de reconstruccion (0,598) para comparar con otros esquemas (cuantizacion del delta, low-rank adaptativo, destilacion).
- Despliegue en hardware de gama alta limitada en disco: al no requerir una segunda copia de 55 GB, permite servir el comportamiento Pi en entornos donde el almacenamiento o el ancho de banda de descarga son la restriccion principal.
- Evaluacion comparativa de fidelidad de adaptadores: permite medir, sobre el mismo base, la diferencia funcional entre el fine-tune completo y su version comprimida a rango 64, util para decidir si merece la pena el ahorro de espacio.
- Uso en llama.cpp sobre estaciones de trabajo con GPU consumer: combinando una base GGUF de 4 bits con el LoRA en GGUF, el conjunto cabe en GPUs de 24 GB, cosa imposible con el fine-tune en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card solo proporciona metricas de fidelidad de la reconstruccion del delta de pesos:

| Metrica | Valor |
|---|---|
| Pares de tensores | 496 |
| Rango | 64 (48 en pares de puerta GDN) |
| Alpha | 64 (escala 1.0 en inferencia) |
| Energia retenida (media) | 0,549 |
| Energia retenida (min / max) | 0,286 / 1,000 |
| Error relativo de reconstruccion (media) | 0,598 |
| Norma maxima del delta del fine-tune | 0,139 |
| Tensores del adaptador en GGUF | 800 de 992 (faltan los pares GDN `in_proj_a`/`in_proj_b`) |

## Requisitos de hardware

- VRAM del adaptador: 435.159.040 parametros en float32, aproximadamente 1,74 GB adicionales sobre el modelo base. El repositorio completo ocupa 3,6 GB.
- VRAM del modelo base: la model card cifra el fine-tune completo en unos 55 GB, lo que situa el base en bfloat16 en la misma escala (estimacion coherente con 27.000 millones de parametros a 2 bytes por parametro).
- Estimaciones por cuantizacion del base (calculadas a partir de 27.000 millones de parametros; no publicadas por el autor): Q8_0 en torno a 28-29 GB, Q5_K_M en torno a 19-20 GB, Q4_K_M en torno a 16-17 GB mas overhead de contexto.
- GPU recomendadas: para bfloat16 completo, A100 80 GB, H100 80 GB o dos GPU de 48 GB; para Q4_K_M, una RTX 4090 o RTX 3090 de 24 GB es suficiente en cuanto a pesos, con margen limitado para contextos largos.
- Cabe en GPU consumer: si, con base cuantizada en 4-5 bits; no cabe en bfloat16 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -m Qwen3.8-27B.gguf --lora pi_qwen3.8-27B_svd_lora.gguf`), PEFT + transformers en Python (`PeftModel.from_pretrained`), y cualquier runtime compatible con LoRA PEFT. Los tags del repositorio incluyen `endpoints_compatible`, lo que sugiere despliegue en endpoints gestionados.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni del adaptador ni del base en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hotdogs/qwen3.8-27B-pi_svd_lora (este) | 435,2 M (adaptador LoRA r=64); base 27 B | No disponible | Sin benchmarks; energia retenida media 0,549 | Apache-2.0 | safetensors PEFT + GGUF; 0 descargas, 0 likes |
| bytkim/Qwen3.8-27B-pi (fine-tune origen) | 27 B | No disponible | Sin benchmarks en la informacion disponible; es la referencia de comportamiento que este adaptador aproxima | Apache-2.0 | Pesos completos, ~55 GB |
| hotdogs/thinkingcap_qwen3.8-27B_svd_lora | Adaptador LoRA (SVD) sobre el mismo base | No disponible | Sin datos publicados | Apache-2.0 | Mismo patron de publicacion (adaptador SVD) |
| hotdogs/jev_qwen3.8-27B_svd_lora | Adaptador LoRA (SVD) sobre el mismo base | No disponible | Sin datos publicados | Apache-2.0 | Mismo patron de publicacion |
| Qwen/Qwen3.8-27B (base) | 27 B, denso, vision-lenguaje | No disponible con cifra concreta | Sin datos en la informacion disponible | Apache-2.0 | Modelo completo, ampliamente disponible |

## Limitaciones y advertencias

- Aproximacion, no replica: la energia retenida media es de 0,549 y el minimo baja a 0,286. Algunos tensores conservan menos de un tercio de la energia del delta original, por lo que el comportamiento de Pi puede degradarse de forma desigual segun la tarea.
- No es una copia bit a bit: el propio autor advierte que hay que esperar el comportamiento Pi (codificacion mas telegrafica, guiada por herramientas), no una reproduccion exacta del modelo fuente.
- GGUF incompleto: `convert_lora_to_gguf.py` no mapea los tensores GDN `in_proj_a`/`in_proj_b`, de modo que el fichero GGUF contiene 800 de los 992 tensores del adaptador. Para usar las puertas GDN completas hay que emplear el adaptador PEFT en Python.
- No es un modelo autonomo: requiere descargar y cargar Qwen/Qwen3.8-27B o un GGUF derivado. El adaptador por si solo no genera texto.
- Ausencia total de validacion publica: el repositorio registra 0 descargas y 0 likes, no hay benchmarks y no se documentan pruebas de regresion funcional frente al fine-tune original.
- Riesgo de alucinacion: heredado del modelo base y no cuantificado en la informacion disponible. En tareas de codificacion agente el riesgo se traslada a parches plausibles pero incorrectos.
- Idiomas: no se declara lista de idiomas soportados ni evaluacion multilingue.
- Contexto: no se dispone de la longitud de contexto del base, dato critico para planificar el despliegue en tareas sobre repositorios grandes.
- Licencia: Apache-2.0 tanto en el adaptador como en el base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del fine-tune origen y del propio Qwen3.8-27B en sus repositorios antes de un despliegue en produccion.
- Fechas de publicacion futuras respecto al momento habitual de consulta (octubre de 2026): verificar la vigencia y posibles actualizaciones del repositorio antes de integrarlo.
- Coste de contexto en produccion: aunque los pesos del adaptador son pequenos, el cuello de botella real de VRAM lo marca la KV cache del base en contextos largos, no el LoRA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hotdogs/qwen3.8-27B-pi_svd_lora
- Fine-tune origen: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Otro adaptador SVD del mismo autor: https://huggingface.co/hotdogs/jev_qwen3.8-27B_svd_lora
- Otro adaptador SVD del mismo autor: https://huggingface.co/hotdogs/thinkingcap_qwen3.8-27B_svd_lora
- Perfil del autor del fine-tune: https://huggingface.co/bytkim
- Ficha del base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Modelo relacionado del mismo autor (reasoning eficiente): https://featherless.ai/models/hotdogs/Qwen3.8-27B-thinkingcap-abliterated
