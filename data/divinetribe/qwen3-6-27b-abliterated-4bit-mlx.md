# divinetribe/Qwen3.6-27B-abliterated-4bit-mlx

## Resumen

Qwen3.6-27B-abliterated-4bit-mlx es una conversión a 4 bits en formato MLX del modelo huihui-ai/Huihui-Qwen3.6-27B-abliterated, publicada por el usuario divinetribe. Se trata de una variante "abliterated" de Qwen3.6 27B, es decir, un ajuste que suprime la dirección de rechazo aprendida por el modelo base para que no se niegue a peticiones benignas pero delicadas. El trabajo de abliteración corresponde a huihui-ai; divinetribe solo realiza la conversión y cuantización para Apple Silicon.

El objetivo del artefacto es permitir la inferencia local en Macs con Apple Silicon mediante la librería mlx-lm, sin dependencia de la nube ni de claves de API. Con un peso de repositorio de 15,2 GB y 26.895.993.856 parámetros reales en safetensors, el modelo está pensado para equipos con 32 GB de memoria unificada, donde encaja con margen para trabajar.

La relevancia actual reside en la combinación de tres factores: un tamaño de 27B que ofrece capacidad de razonamiento y generación de código superior a modelos de 7-14B, una cuantización de 4 bits con group size 64 que reduce el peso a un rango manejable en hardware de consumo, y un formato nativo MLX optimizado para los chips M-series de Apple. La licencia declarada es Apache 2.0, aunque el autor remite a la licencia upstream de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (identificador interno `qwen3_5`), transformer decoder-only |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con remision a la licencia upstream de Qwen) |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.6, un transformer decoder-only identificado en el repositorio como `qwen3_5`. No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. El modelo original fue desarrollado por el equipo Qwen; huihui-ai aplico sobre el una tecnica de abliteracion que elimina la direccion de rechazo en el espacio de activaciones, y divinetribe realizo la conversion a MLX y la cuantizacion a 4 bits con group size 64.

La innovacion tecnica destacable de esta publicacion no esta en la arquitectura, sino en el pipeline de despliegue: la conversion con mlx-lm permite ejecutar un modelo de ~27B en memoria unificada de Apple Silicon con un peso de ~15 GB. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de pensamiento extendido en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y continuacion de prompts, segun el pipeline declarado `text-generation`.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6 27B (no se detallan capacidades especificas en la model card).
- Comportamiento "uncensored": la abliteracion suprime la direccion de rechazo, de modo que el modelo no se niega ante peticiones benignas pero delicadas.
- Integracion como backend en el stack claude-code-local, que expone una API compatible con Anthropic sobre MLX.
- Ejecucion 100% local en Apple Silicon, sin conexion a servicios externos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`).

## Casos de uso

- Asistente de codigo en local sobre Mac: el modelo puede integrarse en el stack claude-code-local apuntando la variable `MLX_MODEL` a este repositorio, de modo que un Mac con 32 GB ejecute tareas de generacion y refactorizacion de codigo sin enviar codigo propietario a la nube.
- Prototipado de agentes en Apple Silicon: al exponerse a traves de un servidor compatible con la API de Anthropic, permite probar flujos de agente multi-paso en local antes de migrarlos a produccion.
- Desarrollo de aplicaciones con requisitos de privacidad: cualquier pipeline que procese texto sensible (documentacion interna, borradores, datos de clientes) puede ejecutarse sin salida de datos del dispositivo.
- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso de estudio para comparar el comportamiento de un Qwen3.6 27B original frente a su version abliterated en tareas de rechazo y seguridad.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o contenido editorial donde los rechazos del modelo base resultan obstructivos para el flujo de trabajo.
- Evaluacion de cuantizacion en MLX: util para medir la degradacion de calidad de un 27B a 4 bits con group size 64 frente al modelo en bf16, en tareas de razonamiento y codigo.
- Despliegue en entornos sin conectividad: escenarios de campo, laboratorio o aviacion donde no hay acceso a internet pero se requiere un modelo de lenguaje de capacidad media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15 GB de pesos en 4 bits; con overhead de contexto y cache KV, se recomienda un minimo de 24 GB y un objetivo de 32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en configuraciones de 32 GB o superiores). El autor indica explicitamente que encaja en un Mac de 32 GB "con espacio para trabajar".
- GPU NVIDIA: no es el objetivo del artefacto; el formato MLX no se ejecuta de forma nativa en CUDA. Para A100/H100/RTX 4090 habria que recurrir a otras cuantizaciones (GGUF, AWQ, GPTQ) del modelo base.
- Despliegue: `mlx-lm` mediante `python -m mlx_lm.generate`. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para este repositorio concreto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| divinetribe/Qwen3.6-27B-abliterated-4bit-mlx | ~26,9B | no disponible | 4 bits MLX (gs 64) | apache-2.0 | safetensors MLX | Objetivo Apple Silicon, uncensored |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | ~27B (no confirmado) | no disponible | bf16/fp16 (presumible) | no disponible | safetensors | Modelo base del que deriva esta publicacion |
| Qwen3.6 27B original (upstream) | ~27B (no confirmado) | no disponible | varias | licencia Qwen | safetensors, GGUF | Version con rechazos intactos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion no mejora las capacidades del modelo; solo elimina la direccion de rechazo. El autor lo indica de forma explicita.
- Riesgo elevado de generar contenido inapropiado, ofensivo o inseguro en ausencia de filtros externos; no es apto para exposicion directa a usuarios finales sin moderacion.
- Sesgos conocidos del modelo base Qwen3.6 no documentados en la informacion disponible; se heredan integramente.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones especificas de fidelidad.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado ni documentado.
- Longitud de contexto no especificada; no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Restricciones de licencia: la model card declara apache-2.0 pero remite a la licencia upstream de Qwen, que puede imponer condiciones adicionales para uso comercial. Conviene verificar la licencia del modelo base antes de desplegar en produccion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconversion.
- La model card incluye estadisticas de descargas y estrellas de GitHub en bloques "live-stats" que no son verificables de forma independiente y no deben tomarse como metricas de calidad.
- Uso responsable: el autor advierte explicitamente de la necesidad de un uso responsable del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Qwen3.6-27B-abliterated-4bit-mlx
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Organizacion huihui-ai: https://huggingface.co/huihui-ai
- Organizacion divinetribe: https://huggingface.co/divinetribe
- Coleccion "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon-6a222fed584be7ce97633768
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: no se proporciona URL directa en la informacion disponible.
