# inhow/Narae3-Qwen3-4B-Office-LoRA-v2

## Resumen

Narae3-Qwen3-4B-Office-LoRA-v2 es un adaptador LoRA experimental entrenado por el usuario inhow sobre el modelo Qwen/Qwen3-4B-Instruct-2507, orientado a un agente de documentos y flujos de trabajo de oficina (proyecto "Office Narae3"). No es un modelo completo: se trata de pesos de continuación sobre el adaptador Narae3 v1, con 2.752.512 parámetros entrenables y modificaciones en los 84 tensores LoRA.

El autor lo publica explícitamente como candidato de investigación que **no** ha sido seleccionado para reemplazar la versión v1 en producción: las pruebas de precisión de "siguiente acción" no mejoraron respecto al modelo padre (4/9 en ambos casos) y los tests de flujo de trabajo revelaron errores de finalización falsa y fechas inventadas. Su relevancia es principalmente como registro documentado de un experimento de fine-tuning fallido, con metodología de validación transparente y puertas de validación predeclaradas.

El entrenamiento se realizó con CPU NF4, rank 8, alpha 16, sobre las seis últimas capas del decoder, una época y learning rate 1e-5, usando solo 36 ejemplos sintéticos de diálogos con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3-4B-Instruct-2507 |
| Parametros totales | 2.752.512 (solo pesos del adaptador; el modelo base tiene ~4B) |
| Parametros activos | no disponible (el modelo base no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Entrenamiento en NF4 (CPU); inferencia GGUF en Q4_K_M |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (base + adapter) |

## Arquitectura y entrenamiento

El adaptador sigue la configuracion LoRA estandar de PEFT con rank 8 y alpha 16, aplicado a las seis ultimas capas del decoder del modelo base Qwen3-4B-Instruct-2507, que permanece congelado. Es una continuacion directa del adaptador Narae3 v1: se partio de esos pesos y se aplicaron 9 pasos adicionales de optimizador. El entrenamiento se ejecuto en CPU con cuantizacion NF4, una sola epoca y learning rate 1e-5. El autor verifico bit a bit los tensores F32 exportados contra los safetensors originales.

El dataset de entrenamiento consta unicamente de 36 ejemplos sinteticos de dialogos con uso de herramientas (tool dialogue), sin mensajes reales, documentos escolares, registros de estudiantes, credenciales ni conversaciones de usuarios. No se menciona RLHF ni DPO. La evaluacion se realizo con sondas de "siguiente accion" teacher-forced de un solo paso, con contexto previo experto y plantillas compartidas; el autor advierte explicitamente que estos resultados no representan tasas de exito en flujos de trabajo autonomos ni benchmarks de capacidad general.

## Capacidades

- Especializacion experimental en dialogos de agente para tareas de oficina y documentos (flujo "Office Narae3"), en coreano e ingles.
- Compatible con el ecosistema de tool calling del modelo base Qwen3-4B-Instruct-2507, al ser un adaptador sobre ese modelo instruct.
- Distribucion en dos formatos: adaptador PEFT (safetensors) y GGUF (par base.gguf + adapter.gguf para inferencia con LoRA a fuerza 1).
- Sin capacidades propias de vision, audio ni thinking mode documentadas; cualquier capacidad adicional proviene del modelo base.

Importante: segun la model card, esta version **no mejoro** la precision de siguiente accion respecto a v1 y presenta errores de finalizacion falsa y fechas inventadas en flujos de trabajo, por lo que sus capacidades practicas no estan garantizadas.

## Casos de uso

- Investigacion y replicacion de fine-tuning LoRA en CPU: el entrenamiento con NF4 en CPU y solo 9 pasos de optimizador es un caso de estudio util para quien quiera reproducir o auditar un pipeline de adaptadores de bajo coste.
- Auditoria de metodologia de validacion: la publicacion incluye puertas de validacion predeclaradas, summary de evaluacion en JSON y comparacion bit a bit de tensores, util como referencia de buenas practicas de experimentacion.
- Continuacion del proyecto Office Narae3: desarrolladores que ya trabajen con Narae3 v1 pueden usar esta version como punto de partida para nuevas iteraciones de entrenamiento, partiendo de los pesos v2.
- Pruebas de agentes de documentos en coreano: para experimentos con Qwen3-4B en flujos de documentos escolares u de oficina en coreano, aunque con la advertencia de que los resultados no estan certificados.
- Comparacion de adaptadores: evaluar diferencias de comportamiento entre v1 y v2 en las mismas sondas de siguiente accion.
- Verificacion de integridad de pesos: el detalle de comparacion de tensores F32 sirve como ejemplo de control de calidad en exportaciones de adaptadores.

No se recomienda su uso en produccion: el propio autor indica que es un candidato fallido y que no reemplaza automaticamente a Narae3 v1.

## Benchmarks y rendimiento

Unicamente se han publicado sondas de validacion propias del proyecto (no benchmarks estandar de capacidad general):

| Sonda | Modelo padre (Narae3 v1) | Candidato (v2) |
|---|---|---|
| Precision de siguiente accion (teacher-forced, un paso) | 4/9 | 4/9 |

Estas sondas usan contexto previo experto y plantillas compartidas; no representan tasas de exito en flujos de trabajo autonomos ni benchmarks generales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa unos 2,5 GB en el repositorio (incluye formatos safetensors y GGUF); el modelo base Qwen3-4B-Instruct-2507 requiere por si mismo unos 8 GB en FP16 o unos 2,5-3 GB en Q4_K_M.
- Para inferencia GGUF en Q4_K_M (base + adapter a fuerza 1): una GPU de consumo con 8 GB de VRAM (por ejemplo RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB) es suficiente con holgura; incluso es viable en CPU pura con llama.cpp.
- GPU recomendadas para el modelo base completo: RTX 4090, A100 o H100 si se quiere servir con contextos largos y alto throughput en FP16.
- Despliegue: llama.cpp y Ollama (formato GGUF con LoRA); vLLM o TGI con el adaptador PEFT sobre el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Base | Licencia | Estado |
|---|---|---|---|---|---|
| Narae3-Qwen3-4B-Office-LoRA-v2 | Adaptador LoRA | 2,75 M | Qwen3-4B-Instruct-2507 | Apache-2.0 | Experimental, candidato fallido |
| Narae3-Qwen3-4B-LoRA-v1 | Adaptador LoRA | no disponible | Qwen3-4B-Instruct-2507 | Apache-2.0 | Version en uso del proyecto |
| Qwen3-4B-Instruct-2507 | Modelo completo | — | — | Apache-2.0 | Modelo base estable |

En terminos de capacidad, el modelo base Qwen3-4B-Instruct-2507 sigue siendo la referencia; este adaptador no demostro mejoras medibles sobre v1 en las sondas publicadas.

## Limitaciones y advertencias

- Rendimiento no mejorado: la precision de siguiente accion es identica a la del modelo padre (4/9), por lo que el entrenamiento no aporto beneficio medible.
- Errores documentados de finalizacion falsa (false completion) y fechas inventadas en tests de flujo de trabajo.
- Riesgo de alucionacion elevado en tareas de agente: el propio autor advierte que ni el inicio de sesion escolar, ni el envio de tareas, ni la entrega por mensajeria estan certificados por las pruebas.
- Dataset de entrenamiento minimo (36 ejemplos sinteticos), insuficiente para retencion general de instrucciones; las sondas aritmeticas no establecen retencion general.
- Las sondas son teacher-forced de un solo paso y no miden exito en flujos autonomos reales.
- Limitado a coreano e ingles; sin soporte documentado para otros idiomas, incluido el castellano.
- Licencia Apache-2.0 aplicable a los pesos, pero el codigo del repositorio Office tiene su propia licencia independiente.
- No debe usarse en produccion: es un candidato de investigacion fallido que no reemplaza a Narae3 v1.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inhow/Narae3-Qwen3-4B-Office-LoRA-v2
- Adaptador padre (Narae3 v1): https://huggingface.co/inhow/Narae3-Qwen3-4B-LoRA-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Informe Office con las correcciones del controlador de ejecucion: https://github.com/y5496694/Narae_hangul_office/blob/main/docs/narae3-office-training-20261030.md
- Repositorio del proyecto Office: https://github.com/y5496694/Narae_hangul_office
