# kekwak/OpenGuardrails-Text-4B-0124-mirror

## Resumen

OpenGuardrails-Text-4B-0124 es un modelo de lenguaje denso de aproximadamente 4.000 millones de parametros, afinado a partir de Qwen/Qwen2.5-7B, disenado especificamente para tareas de seguridad de contenido y prevencion de ataques de prompt. Lo desarrolla el equipo de OpenGuardrails (xiangxinai), que lo presenta como parte de una plataforma de guardrails de codigo abierto orientada a entornos empresariales. El modelo resuelve un problema concreto: sustituir las arquitecturas hibridas tradicionales (motores de reglas mas clasificadores pequenos) por un unico LLM capaz de realizar clasificacion de seguridad de contenido y deteccion de ataques de prompt (inyeccion, jailbreak, seguimiento de instrucciones maliciosas) en una sola pasada.

La relevancia actual del modelo radica en tres factores: su tamano compacto (unos 4B parametros, sin cuantizacion), que permite desplegarlo en una sola GPU con latencia baja; su licencia Apache 2.0, que autoriza uso comercial sin restricciones; y su cobertura multilingue declarada de 119 idiomas y dialectos. La ficha que sigue se basa en el repositorio espejo `kekwak/OpenGuardrails-Text-4B-0124-mirror`, ya que el repositorio original de OpenGuardrails ya no esta disponible en Hugging Face. Los pesos son una copia sin modificar del revision `9bdd1fb549e01b5f6aae4e9c395998492a08830b`, con verificacion SHA-256 publicada.

El modelo se presenta como un clasificador de seguridad de proposito general con salida probabilistica, lo que permite ajustar umbrales de sensibilidad segun la tolerancia al riesgo de cada organizacion. Se distribuye en formato safetensors en dos ficheros (8,1 GB de repositorio) y esta pensado para integrarse en pasarelas de API, cortafuegos de LLM y pipelines de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B, afinado) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se publica sin cuantizar; la model card indica `quantization: none`) |
| Idiomas soportados | 119 idiomas y dialectos declarados; tags de Hugging Face: en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4B parametros, obtenido mediante fine-tuning de Qwen/Qwen2.5-7B. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta es la contribucion de datos: el equipo publica OpenGuardrailsMixZh-97k, un dataset de seguridad multilingue de aproximadamente 97.000 muestras construido a partir de traducciones alineadas de ToxicChat, WildGuardMix, PolyGuard, XSTest y BeaverTails, bajo licencia Apache 2.0.

La innovacion principal no reside en la arquitectura del transformer sino en el diseno de la tarea: un unico modelo realiza tanto clasificacion de seguridad de contenido como deteccion de ataques de prompt, eliminando la necesidad de pipelines hibridos. El modelo emite confidencias probabilisticas, lo que permite configurar politicas de seguridad dinamicas con umbrales ajustables por categoria de riesgo. Se distribuye intencionadamente sin cuantizacion para mantener un comportamiento numerico estable y maximizar la compatibilidad con stacks de inferencia estandar como Transformers y vLLM.

## Capacidades

- Clasificacion de seguridad de contenido en 14 dimensiones de deteccion (S1 a S14), con niveles de riesgo asignados por categoria (por ejemplo, S2 temas politicos sensibles como riesgo alto, S4 daño a menores como riesgo medio, S10 blasfemias como riesgo bajo).
- Deteccion de ataques de prompt: inyeccion de prompt, jailbreak y seguimiento de instrucciones maliciosas (categoria S9, riesgo alto).
- Salida de confidencias probabilisticas que permite calibrar umbrales de sensibilidad por escenario.
- Cobertura multilingue declarada de 119 idiomas y dialectos, con evaluaciones especificas en ingles, chino y entornos multilingues.
- Clasificacion tanto a nivel de prompt como a nivel de respuesta.
- Integracion en despliegues de baja latencia en una sola GPU sin toolchains de cuantizacion especializadas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la informacion disponible.

## Casos de uso

- Cortafuegos de LLM en produccion: el modelo se situa entre el usuario y el LLM principal para clasificar prompts entrantes y filtrar inyecciones, jailbreaks e instrucciones maliciosas antes de que lleguen al modelo generativo, gracias a su latencia baja en una sola GPU.
- Moderacion de contenido en plataformas sociales: clasificacion de respuestas generadas o mensajes de usuario en las 14 categorias de riesgo (discurso de odio, acoso, pornografia, violencia) con umbrales ajustables segun la politica de la plataforma.
- Pasarela de API para aplicaciones multilingues: cobertura declarada de 119 idiomas permite aplicar una politica de seguridad uniforme en productos con usuarios globales sin desplegar clasificadores por idioma.
- Guardrails para agentes autonomos: deteccion de intentos de manipulacion en cadenas multi-paso donde un atacante intenta redirigir las instrucciones del agente mediante inyeccion de prompt.
- Cumplimiento normativo y auditoria: generacion de senales de confianza documentables por categoria de riesgo para trazabilidad en procesos de compliance, aprovechando la salida probabilistica del modelo.
- Filtrado de datasets de entrenamiento: uso del clasificador para depurar corpus antes de entrenar otros modelos, eliminando contenido danino o conversaciones con intentos de jailbreak.
- Investigacion en seguridad de LLM: evaluacion comparativa de tecnicas de ataque y defensa usando un clasificador unificado y de pesos abiertos como referencia reproducible.

## Benchmarks y rendimiento

La model card afirma resultados state-of-the-art en multiples benchmarks de seguridad (deteccion de ataques de prompt, clasificacion de contenido danino, evaluaciones en ingles, chino y multilingue) y remite a una imagen de rendimiento alojada en openguardrails.com. Sin embargo, no se proporcionan cifras numericas concretas en la informacion disponible, por lo que no se presenta tabla comparativa.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en precision original (sin cuantizar) de aproximadamente 4B parametros, se estima un consumo de unos 8-9 GB solo para pesos en FP16/BF16, mas overhead de activaciones y cache KV; no se dispone de cifras oficiales de VRAM publicadas.
- GPU recomendadas: el modelo esta disenado para desplegarse en una sola GPU; la model card menciona compatibilidad con GPUs de consumo, de centro de datos y de nube. No se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, segun la model card, que destaca compatibilidad con GPUs de consumo; los modelos concretos no estan detallados.
- Opciones de despliegue: Transformers y vLLM son los stacks mencionados explicitamente en la model card.
- Latencia y throughput: la model card afirma inferencia de baja latencia en tiempo real apta para pasarelas de API y cortafuegos de LLM, pero no publica cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (como Llama Guard, ShieldGemma o WildGuard) que permitan una comparacion rigurosa de parametros, contexto y rendimiento. La model card solo menciona que OpenGuardrails alcanza resultados SOTA frente a benchmarks de seguridad, sin cifras.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OpenGuardrails-Text-4B-0124 | ~4B | no disponible | Apache 2.0 | Clasificador unificado de seguridad y ataques de prompt |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio consultado es un espejo no oficial: el repositorio original de OpenGuardrails ya no esta disponible en Hugging Face, por lo que la procedencia y el mantenimiento futuro dependen del espejo `kekwak/OpenGuardrails-Text-4B-0124-mirror`.
- No se documentan sesgos conocidos especificos del modelo en la informacion disponible; al ser un clasificador de seguridad, existe riesgo de falsos positivos y negativos que dependen de la calibracion de umbrales.
- Las categorias S1 (temas politicos generales) y S2/S3 (temas politicos sensibles, insultos a simbolos o lideres nacionales) implican juicios de valor que pueden variar segun jurisdiccion y contexto cultural; su aplicacion en produccion requiere revision de politica.
- Riesgo de alucinacion: no documentado para esta tarea de clasificacion, pero al ser un LLM generativo subyacente (Qwen2.5) puede producir salidas no deterministas si se usa fuera de su tarea de clasificacion prevista.
- La longitud de contexto no esta especificada, lo que impide garantizar el comportamiento en prompts o respuestas muy largas.
- Los tags de idioma de Hugging Face solo listan en y zh, aunque la model card declara 119 idiomas; la cobertura real de los idiomas no taggeados no esta verificada con benchmarks publicos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo no es un filtro de seguridad completo por si solo: debe combinarse con politicas, auditoria y monitorizacion humana.
- La model card no documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset, lo que limita la evaluacion de la robustez frente a ataques adversariales no vistos.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/kekwak/OpenGuardrails-Text-4B-0124-mirror
- Informe tecnico (arXiv): https://arxiv.org/abs/2510.19169
- Repositorio GitHub del proyecto: https://github.com/xiangxinai/openguardrails
- Imagen de rendimiento: https://www.openguardrails.com/performance.png
- Dataset OpenGuardrailsMixZh-97k: no disponible (enlace directo no proporcionado en la informacion disponible)
