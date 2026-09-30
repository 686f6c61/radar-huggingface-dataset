# dancingfrog/Nezou-27B-CyberAbliterated-NVFP4

## Resumen

Nezou-27B-CyberAbliterated-NVFP4 es un checkpoint de servicio publicado por el usuario dancingfrog (dancingfrog/Nezou-27B-CyberAbliterated-NVFP4) que empaqueta el modelo multimodal Nezou 27B en una cuantizacion mixta NVFP4 + FP8, pensada para ejecutarse en una sola GPU consumer. El modelo parte de un Qwen/Qwen3.8-27B oficial (BF16, Apache-2.0) al que se le aplico un proceso de "abliteration" orientado a dominios de ciberseguridad, y despues una cuantizacion post-entrenamiento calibrada con NVIDIA ModelOpt 0.47.0.dev0. El resultado ocupa unos 21 GiB en disco y esta verificado en una NVIDIA RTX 5090 de 32 GiB con una longitud de contexto de 131.072 tokens.

La relevancia de este checkpoint es de tipo practico: la cuantizacion se aplico desde el modelo abliterado en BF16, no desde el modelo base original, de modo que el estilo y el comportamiento "cyber-abliterado" se preservan tras la compresion. Es, por tanto, un artefacto de despliegue disenado para servir en local con SGLang y una configuracion de precision mixta, no un modelo de proposito general cargable con `transformers.from_pretrained`.

El modelo es multimodal (pipeline image-text-to-text), con torre de vision en BF16 sin cuantizar, soporte de razonamiento con flujo de "thinking" separado y parser de tool calling. La licencia es Apache-2.0, heredada del modelo base, y el unico idioma declarado en la model card es el ingles. Cabe senalar una discrepancia entre el nombre comercial "27B" y el recuento real de parametros de los safetensors: 18.800.348.400.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal (Gated DeltaNet), 64 capas, con torre de vision y modulo MTP |
| Parametros totales | 18.800.348.400 (segun los safetensors del repo); el nombre comercial indica 27B |
| Parametros activos | No aplica (no se describe como arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, grupos de 16, escalas de grupo en FP8) para proyecciones MLP; FP8 (E4M3) para proyecciones de atencion, `lm_head` y KV cache; torre de vision sin cuantizar (BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, ~21 GiB), layout mixto NVFP4 + FP8 |
| Tamano del repositorio | 22,5 GB |
| Modelo base | dancingfrog/Nezou-27B-CyberAbliterated (BF16) |
| Base definitiva | Qwen/Qwen3.8-27B (Apache-2.0) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer hibrido, tal como se deduce de la receta de servicio incluida en la model card: conviven capas de atencion completa (`self_attn.q/k/v/o_proj`) y capas de atencion lineal (`linear_attn.in_proj_qkv`, `in_proj_z`, `out_proj`), gestionadas en SGLang mediante los parametros `--mamba-full-memory-ratio 0.024` y `--max-mamba-cache-size 6`, lo que apunta a un estado de atencion lineal del tipo Gated DeltaNet. El modelo tiene 64 capas e incorpora un modulo MTP (multi-token prediction) que no se ha cuantizado, ademas de una torre de vision que permanece en BF16.

La linea de construccion tiene tres pasos. Primero, el Qwen/Qwen3.8-27B oficial en BF16. Segundo, una "cyber-abliteration" mediante proyeccion de la direccion de rechazo sobre las capas 24 a 63, que produce dancingfrog/Nezou-27B-CyberAbliterated (BF16). Tercero, la cuantizacion post-entrenamiento calibrada que da lugar a este repo. La cuantizacion se realizo con NVIDIA ModelOpt 0.47.0.dev0, ruta `hf_ptq`, algoritmo `MIXED_PRECISION`, qformat `radix_qwen38`, y se calibro con 128 muestras de 4096 tokens procedentes de CNN DailyMail con batch size 1. El repo incluye `hf_quant_config.json` con la configuracion por capa, `quantization_run.json` con los argumentos exactos de la ejecucion y `.quant_summary.txt` con los estados del cuantizador. No se documentan en la informacion disponible el volumen total de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento activado por defecto (la model card indica que el modelo "piensa" por defecto).
- Razonamiento multi-paso con flujo de razonamiento separado, parseable mediante `--reasoning-parser qwen3`.
- Tool calling y function calling, con parser dedicado `qwen3_coder` para extraer bloques de llamada a herramientas del stream.
- Vision y lenguaje: pipeline image-text-to-text, con torre de vision en BF16 para entrada de imagenes.
- Capacidades en dominio de ciberseguridad por diseno: al estar abliterado con un conjunto de prompts cyber, responde a peticiones de investigacion de seguridad.
- Prediccion multi-token (modulo MTP) para acelerar la generacion.
- Contexto largo de hasta 131.072 tokens, con soporte de cache jerarquica en SGLang.
- Despliegue como endpoint compatible con OpenAI (`/v1/chat/completions`) con streaming.

## Casos de uso

- Investigacion de seguridad y CTFs: el modelo responde a peticiones de analisis de vulnerabilidades (por ejemplo, recorrer paso a paso la explotacion de un heap overflow) gracias a la abliteration dirigida a dominios cyber, lo que lo hace util en entornos de captura la bandera y analisis de binarios.
- Pentesting autorizado: puede asistir en la fase de reconocimiento y en la redaccion de informes tecnicos sobre hallazgos, ejecutandose en local sobre una RTX 5090 sin enviar datos sensibles a APIs externas.
- Red-teaming de modelos: sirve como contraparte ofensiva en ejercicios de evaluacion de seguridad, generando prompts y escenarios adversarios con contexto largo.
- Analisis de documentos tecnicos extensos: con 131.072 tokens de contexto, permite cargar manuales, RFCs o volcados de logs completos y hacer preguntas sobre ellos en una sola pasada.
- Asistente de codigo integrado en pipelines: el soporte de tool calling con parser `qwen3_coder` permite conectarlo a herramientas de ejecucion y validacion dentro de flujos automatizados de CI/CD.
- Analisis de capturas de pantalla e imagenes tecnicas: al ser image-text-to-text, puede procesar diagramas de red, capturas de paneles o imagenes de errores y describirlos o razonar sobre ellos.
- Servicio local de bajo coste por consulta: al caber en una unica GPU de 32 GiB con cache en memoria de host, es apto para laboratorios que quieren evitar costes de inferencia en la nube.
- Automatizacion de triaje de alertas: puede clasificar y resumir alertas de seguridad en ingles manteniendo contexto de conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~21 GiB para pesos y escalas, mas KV cache en FP8. La configuracion verificada reserva una fraccion estatica de 0,84 sobre una GPU de 32 GiB (32.607 MiB).
- GPU verificada: una NVIDIA RTX 5090 de 32 GiB, con driver 610.43.02 y CUDA 13.3.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GiB, segun la receta verificada del autor. No se documenta su comportamiento en GPUs con menos memoria.
- Memoria de host: se recomienda un tier de cache jerarquica de 16 GiB (`--enable-hierarchical-cache --hicache-size 16`, politica `write_through`) adicional a la cache de GPU.
- Opciones de despliegue: SGLang es la unica ruta verificada, usando una imagen dev con CUDA 13.0, flashinfer 0.6.18.dev20260807 y NCCL 2.30.7, y el backend de atencion `flashinfer`. El modelo no es cargable con `transformers.from_pretrained` estandar; se requiere un runtime con soporte de precision mixta de ModelOpt.
- Limitaciones de servicio: se recomienda mantener bajo `--max-running-requests` (el ejemplo usa 1) para trabajos de contexto largo; `--chunked-prefill-size 2048`; transporte de features multimodales en CPU (`--mm-feature-transport cpu`) y `--sleep-on-idle` para liberar recursos en reposo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nezou-27B-CyberAbliterated-NVFP4 (este repo) | 18,8B (safetensors); nombre comercial 27B | 131.072 tokens | NVFP4 + FP8 mixto | Apache-2.0 | HuggingFace; requiere runtime con soporte ModelOpt (SGLang verificado) |
| dancingfrog/Nezou-27B-CyberAbliterated | no disponible | no disponible | BF16 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | no disponible (el nombre indica 27B) | no disponible | BF16 | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros declarados, contexto, precision y licencia. No se ha identificado en la informacion disponible un tercer modelo comparable independiente con el que contrastar resultados.

## Limitaciones y advertencias

- Abliteration de seguridad: el modelo ha sido modificado para eliminar direcciones de rechazo en las capas 24 a 63; respondera por diseno a peticiones de contenido ofensivo en el dominio cyber. Su uso debe restringirse a CTFs, pentesting autorizado, red-teaming y research, tal como indica el autor.
- Riesgo elevado de uso indebido: no incorpora salvaguardas alineadas con politicas de uso aceptable, por lo que no es apto como asistente de proposito general orientado al publico.
- Alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para este checkpoint ni para su padre abliterado.
- Idiomas: la model card declara unicamente ingles (`en`); no hay evidencia de capacidades multilingues.
- Degradacion por cuantizacion: la cuantizacion NVFP4/FP8 calibrada con solo 128 muestras de CNN DailyMail puede introducir perdida de calidad en dominios alejados de la distribucion de calibracion; no se aportan metricas de la perdida.
- Restricciones de licencia: Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido que genere el modelo abliterado.
- Compatibilidad de runtime: no es cargable con `transformers.from_pretrained` estandar; depende de un build concreto de SGLang con kernels para la arquitectura de atencion hibrida, lo que complica la portabilidad y el mantenimiento a largo plazo.
- Ajuste de memoria ajustado: la propia model card califica el encaje en 32 GiB como "tight but workable", con una sola peticion concurrente recomendada; el aumento de concurrencia o de contexto puede provocar fallos de asignacion.
- Datos de procedencia incompletos: la seccion de provenance de la model card aparece truncada y no se detallan el dataset de preentrenamiento, el numero de tokens ni fases de alineacion del modelo base. Las fechas declaradas (creacion en 2026) y la referencia a "Qwen3.8" no han podido contrastarse con fuentes externas.
- Sesgos: no se han publicado analisis de sesgo para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated-NVFP4
- Modelo base cuantizado (BF16, receta completa de abliteration): https://huggingface.co/dancingfrog/Nezou-27B-CyberAbliterated
- Modelo base definitivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficheros de configuracion de cuantizacion incluidos en el repo: `hf_quant_config.json`, `quantization_run.json`, `.quant_summary.txt` (disponibles en el repositorio del modelo)
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el contenido y se han descartado.
