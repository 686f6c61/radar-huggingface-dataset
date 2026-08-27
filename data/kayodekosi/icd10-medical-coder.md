# kayodekosi/icd10-medical-coder

## Resumen

El modelo `kayodekosi/icd10-medical-coder` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` mediante QLoRA (cuantización de 4 bits) para la tarea de codificación médica ICD-10-CM. Desarrollado por Kayode Okosi, está orientado a entornos hospitalarios de gestión del ciclo de ingresos (RCM) y a equipos de mejora de documentación clínica. Su función principal es proponer códigos de diagnóstico ICD-10-CM a partir de notas clínicas, resúmenes de alta o informes operatorios, devolviendo una lista jerarquizada con fragmentos de evidencia y puntuaciones de confianza en formato JSON estricto, listo para integrarse en sistemas downstream.

El modelo se presenta como una solución de producción que aborda el cuello de botella de la codificación manual, reduciendo la carga administrativa y mejorando la precisión en la asignación de códigos. Al estar basado en Qwen2.5-7B-Instruct, hereda las capacidades de razonamiento y generación de texto del modelo base, pero se especializa mediante ajuste fino supervisado (SFT) con datasets públicos de codificación ICD-10-CM. El adaptador tiene un contexto de entrenamiento de hasta 4.000 tokens, aunque el modelo base soporta hasta 128.000. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su adopción en entornos sanitarios.

La relevancia actual de este modelo radica en la creciente demanda de automatización en codificación clínica, un proceso propenso a errores y costoso. A diferencia de soluciones comerciales cerradas, este adaptador open source ofrece transparencia, control sobre el despliegue (incluso en entornos aislados o VPC) y la posibilidad de auditar y ajustar el comportamiento. Sin embargo, el modelo no sustituye la revisión de un codificador certificado; está diseñado como una herramienta de apoyo que requiere supervisión humana final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | Modelo base: 7.6B; adaptador LoRA: no especificado (típicamente <1% del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.000 tokens (contexto de entrenamiento; el modelo base soporta hasta 128.000) |
| Tipos de cuantizacion | No especificado; compatible con cuantizacion del modelo base (bitsandbytes, GPTQ, AWQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre el modelo base Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal. El adaptador se entrenó mediante QLoRA, una técnica que cuantiza el modelo base a 4 bits durante el entrenamiento para reducir el consumo de memoria, y luego se aplica un ajuste fino supervisado (SFT) con datasets públicos de codificación ICD-10-CM en formato chat (pares de nota clínica → códigos). La configuración de entrenamiento se detalla en `train_config.yaml` e incluye una longitud máxima de secuencia de 4.000 tokens. El autor menciona una posible segunda etapa de ajuste por preferencias (preference tuning) para favorecer códigos preferidos por codificadores frente a incorrectos, aunque no se especifica si se aplicó en la versión publicada.

La innovación principal no reside en la arquitectura, sino en el formato de salida: el modelo está entrenado para generar exclusivamente JSON estructurado con una lista de códigos, descripciones, confianza y evidencia. El script de inferencia (`inference.py`) valida que la respuesta sea JSON parseable antes de pasarla a sistemas downstream, rechazando respuestas malformadas. Esto lo hace adecuado para integraciones en pipelines de RCM donde se requiere salida estructurada y fiable.

## Capacidades

- Generacion de codigos ICD-10-CM: propone codigos de diagnostico a partir de texto clinico (resumen de alta, notas de progreso, informes operatorios).
- Extraccion de evidencia MEAT: identifica fragmentos del texto que respaldan los criterios Monitored, Evaluated, Assessed, Treated.
- Deteccion de codigos faltantes: senala posibles codigos que estan documentados pero no asignados.
- Salida JSON estructurada: devuelve lista de codigos con descripcion, confianza (0-1) y evidencia textual, junto con un campo de notas.
- Validacion de JSON en inferencia: el script de inferencia comprueba que la respuesta sea JSON valido antes de aceptarla.
- Integracion con sistemas RCM: disenado para conectarse a flujos de trabajo de gestion de ciclo de ingresos hospitalarios.
- Multilingue: no, solo ingles (aunque el modelo base Qwen2.5 soporta multiples idiomas, el adaptador se entreno solo con datos en ingles).

## Casos de uso

- Codificacion de resumenes de alta: el modelo puede procesar un resumen de alta y sugerir codigos ICD-10-CM con evidencia, reduciendo el tiempo de revision del codificador. Su contexto de 4k tokens es suficiente para notas clinicas tipicas.
- Apoyo a codificadores certificados: actua como segunda opinion, proponiendo codigos que el codificador puede aceptar o rechazar, mejorando la precision y consistencia.
- Deteccion de codigos omitidos: en auditorias de historias clinicas, el modelo puede identificar codigos que estan documentados pero no asignados, ayudando a recuperar ingresos perdidos.
- Integracion en sistemas de historia clinica electronica (HCE): mediante una API que reciba texto y devuelva JSON, el modelo puede integrarse en el flujo de trabajo del medico o del codificador.
- Formacion de personal de codificacion: el modelo puede generar ejemplos de codificacion a partir de notas simuladas, sirviendo como herramienta educativa.
- Control de calidad en facturacion: antes de enviar reclamaciones, el modelo puede verificar que los codigos asignados coinciden con la documentacion, reduciendo rechazos.
- Investigacion en procesamiento de lenguaje clinico: el adaptador puede servir como punto de partida para experimentos en extraccion de informacion medica y codificacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluacion se realiza mediante exact-match y precision jerarquica en conjuntos de prueba publicos, asi como la tasa de codigos invalidos, pero no se proporcionan cifras concretas. Tampoco se incluyen comparaciones con otros modelos en la documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-7B-Instruct en precision FP16 requiere aproximadamente 14 GB de VRAM. Con cuantizacion de 4 bits (bitsandbytes) se reduce a unos 4-5 GB, y el adaptador LoRA anade un overhead minimo. Por tanto, es posible ejecutarlo en GPUs de consumo con 8 GB de VRAM (p.ej. RTX 3060, RTX 4060) si se cuantiza el modelo base.
- GPU recomendadas: para inferencia rapida, se recomienda al menos una RTX 3090/4090 (24 GB) o una A10/A100 en entornos de produccion. Para entrenamiento, se necesitan GPUs con al menos 16 GB de VRAM (p.ej. A100, RTX 4090) dado el uso de QLoRA.
- Compatibilidad con consumer GPU: si, con cuantizacion 4 bits y el adaptador LoRA, cabe en GPUs de 8 GB, aunque la velocidad sera limitada.
- Opciones de despliegue: el modelo se puede servir con vLLM, TGI o llama.cpp (si se convierte el adaptador a GGUF), o mediante el script de inferencia proporcionado. Tambien es compatible con Ollama si se empaqueta adecuadamente. Para entornos aislados, se puede desplegar en VPC con contenedores Docker.
- Latencia y throughput: no se proporcionan datos especificos. En una GPU A100, un modelo de 7B cuantizado puede generar decenas de tokens por segundo, pero la latencia dependera del hardware y de la longitud de la entrada.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA especificos para codificacion ICD-10-CM comparables en el momento de la redaccion. El modelo base Qwen2.5-7B-Instruct sin adaptador no esta especializado en codificacion medica y probablemente generaria codigos con menor precision y sin formato JSON estructurado. Existen soluciones comerciales como ICD10.ai o CombineHealth, pero son propietarias y no ofrecen acceso a pesos ni transparencia. En el ambito academico, MedCodER (arxiv 2409.15368) es un framework de codificacion medica que utiliza extraccion, recuperacion y re-ranking, pero no es un modelo de lenguaje ajustado, sino un sistema compuesto. Por tanto, no hay una comparativa directa con modelos open source de la misma categoria.

## Limitaciones y advertencias

- Sesgos en datos de entrenamiento: los datasets publicos de codificacion ICD-10-CM pueden contener sesgos geograficos o de especialidad, lo que podria afectar la generalizacion a otros entornos clinicos.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigos incorrectos o inventados. La validacion JSON no garantiza la validez clinica de los codigos.
- Contexto limitado: el adaptador se entreno con secuencias de hasta 4.000 tokens, por lo que notas clinicas muy largas podrian truncarse o degradar el rendimiento.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos no angloparlantes.
- Requiere supervision humana: el modelo no debe utilizarse como sustituto de un codificador certificado. La model card insiste en que la decision final debe ser de un profesional.
- Posible desactualizacion de codigos: la lista de codigos ICD-10-CM se actualiza anualmente; el modelo podria no conocer las versiones mas recientes si no se reentrena.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, en entornos sanitarios pueden aplicarse regulaciones adicionales (HIPAA, GDPR) que exijan controles de privacidad y seguridad. El modelo esta disenado para despliegue en VPC, pero el responsable debe garantizar el cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kayodekosi/icd10-medical-coder
- Perfil del autor: https://huggingface.co/kayodekosi
- Referencia academica sobre codificacion medica (MedCodER): https://arxiv.org/html/2409.15368v1
- Solucion comercial ICD10.ai: https://creati.ai/ai-tools/icd10-ai/
- Solucion comercial CombineHealth: https://www.combinehealth.ai/products/icd
- Guia sobre automatizacion de codificacion ICD-10: https://s10.ai/blog/ai-scribe-icd-10-coding
