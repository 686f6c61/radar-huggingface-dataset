# philgear/gemma-3-tri-paradigm-radar

## Resumen

`philgear/gemma-3-tri-paradigm-radar` es un adaptador LoRA publicado por Phillip Gear (PocketGull LLC) sobre el modelo base `google/gemma-3-12b-it`. Su propósito declarado es generar evaluaciones clínicas que integran simultáneamente tres marcos diagnósticos: medicina alopática occidental, la teoría Zang-Fu de la medicina tradicional china (TCM) y el sistema Tridosha del Ayurveda. El adaptador se distribuye como pesos PEFT compatibles con la librería `peft` de Hugging Face y requiere cargar el modelo base de 12 000 millones de parámetros por separado.

El autor indica que el ajuste se realizó mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos de dominio específico, supuestamente des-identificados conforme al estándar HIPAA §164.514 Safe Harbor. El modelo se presenta como una herramienta de soporte a la decisión clínica (CDS) no clasificada como dispositivo médico bajo la exención FDA 520(o), orientada a profesionales sanitarios con licencia.

La relevancia del proyecto es limitada en términos de adopción: en el momento de redactar esta ficha el repositorio registra 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks ni detalles sobre el volumen o la composición del dataset de entrenamiento. La información disponible procede exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-3-12b-it` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 12 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (la model card solo muestra ejemplo en `bfloat16`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PEFT/LoRA (compatibles con `peft.PeftModel`); el modelo base se distribuye aparte en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 3 12B Instruct, un transformer decoder-only de Google. El autor no detalla la configuración del LoRA (rango, alpha, módulos objetivo) ni el número de tokens de entrenamiento. La única información técnica sobre el procedimiento es que se empleó DPO (Direct Preference Optimization) sobre "domain-specific clinical datasets" que, según la model card, cumplen con la des-identificación HIPAA §164.514 Safe Harbor. No se especifica el número de pares de preferencia, la procedencia de los datos ni si hubo una fase previa de SFT.

La innovación declarada no es arquitectónica sino de dominio: el adaptador produce una síntesis simultánea de tres paradigmas médicos (alopático, TCM Zang-Fu y Ayurveda Tridosha) en una misma respuesta. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido. Tampoco se publica ninguna evaluación cuantitativa del ajuste.

## Capacidades

- Generación de texto en inglés orientada a la síntesis de evaluaciones clínicas bajo tres marcos diagnósticos simultáneos.
- Razonamiento clínico estructurado: el ejemplo de la model card solicita integrar neurología alopática, "Liver Yang rising" (TCM) y "Vata-Pitta" (Ayurveda) para migraña crónica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada; el adaptador no declara aprovechar las capacidades multimodales del Gemma 3 base.

## Casos de uso

- **Síntesis clínica integrativa para profesionales**: generar una evaluación que contemple simultáneamente perspectivas alopática, TCM y ayurvédica sobre un mismo cuadro, útil en consultas de medicina integrativa donde el clínico necesita un documento comparativo de marcos.
- **Formación en medicinas integrativas**: usar el adaptador para producir material didáctico que contraste terminología Zang-Fu y Tridosha con diagnósticos occidentales, con revisión posterior por un docente cualificado.
- **Documentación clínica de apoyo**: redactar borradores de notas que recojan lecturas alternativas del caso antes de la revisión y firma del facultativo, siempre con retención cero de PHI en el entorno local.
- **Investigación en NLP clínico multilingüe de dominios**: servir como punto de partida para estudiar cómo un LoRA sobre Gemma 3 12B se comporta en vocabulario médico no occidental (TCM, Ayurveda), un área con pocos recursos en abierto.
- **Despliegue en edge sanitario**: al ser un adaptador ligero sobre un modelo de 12B, puede cargarse en infraestructura local o en Vertex AI privado, lo que encaja con el requisito declarado de "zero-PHI retention" en entornos con restricciones regulatorias.
- **Prototipado de asistentes de segunda opinión**: integrar el adaptador en una herramienta interna que ofrezca al clínico una lectura alternativa del caso, etiquetada explícitamente como soporte no diagnóstico y sujeta a la exención FDA 520(o) CDS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para el modelo base en bfloat16**: aproximadamente 24 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 40-48 GB para inferencia cómoda con contexto moderado.
- **Cuantización**: no documentada por el autor; al ser un adaptador PEFT, la viabilidad de cargarlo sobre una versión cuantizada del base (por ejemplo, 4-bit con bitsandbytes) no está verificada en la model card.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o A6000 para bfloat16 sin cuantizar; RTX 4090 (24 GB) queda al límite y probablemente requiera cuantización del base.
- **Consumer GPU**: no cabe en GPUs de 8-16 GB sin cuantización agresiva del modelo base; en 24 GB es ajustado.
- **Opciones de despliegue**: el ejemplo oficial usa `transformers` + `peft`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El autor menciona despliegue en Google Cloud Vertex AI privado.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `philgear/gemma-3-tri-paradigm-radar` | LoRA sobre 12B | no disponible | Adaptador PEFT clínico | Apache 2.0 | 0 descargas, sin benchmarks |
| `google/gemma-3-12b-it` | 12B | no disponible en esta ficha | Modelo base instruct | Gemma Terms (no Apache) | Modelo de referencia; el adaptador hereda sus capacidades generales |
| Adaptadores clínicos LoRA sobre Llama 3 / Mistral | variable (7B-13B) | variable | PEFT | variable | Ecosistema más maduro en `peft` + `transformers`; sin comparación cuantitativa disponible |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación con el modelo base es la más informativa: el adaptador añade especialización de dominio a costa de posibles regresiones en capacidades generales, algo que no se ha medido públicamente. Nota: la licencia del adaptador es Apache 2.0, pero el uso del modelo base Gemma 3 está sujeto a los Gemma Terms of Use de Google, que prevalecen sobre el adaptador.

## Limitaciones y advertencias

- **Ausencia total de validación publicada**: 0 descargas, 0 likes y ningún benchmark. No hay evidencia de que el ajuste DPO mejore el rendimiento clínico frente al base.
- **Riesgo de alucinación clínica elevado**: un modelo de lenguaje generando síntesis diagnósticas en tres tradiciones médicas puede producir asociaciones Zang-Fu o Tridosha plausibles pero incorrectas, con apariencia de autoridad.
- **Idioma**: solo inglés; inadecuado para uso clínico en castellano sin un adaptador o prompt adicional.
- **Estatus regulatorio ambiguo**: el autor invoca la exención FDA 520(o) para CDS, pero esa exención exige que el profesional revise la base de la recomendación; un modelo generativo opaco difícilmente cumple ese criterio sin documentación adicional.
- **Cumplimiento HIPAA no verificable**: la afirmación de des-identificación Safe Harbor no va acompañada de auditoría, metodología ni dataset público que permita comprobarla.
- **Licencia**: el adaptador es Apache 2.0, pero el modelo base Gemma 3 impone los Gemma Terms of Use; el uso comercial debe cumplir ambos.
- **Sin detalles de entrenamiento**: se desconoce el tamaño del dataset, el rango del LoRA y si hubo SFT previo, lo que impide reproducir o auditar el ajuste.
- **Aviso de la model card**: el propio autor lo presenta como herramienta de apoyo a profesionales con licencia, no como sustituto del juicio clínico.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/philgear/gemma-3-tri-paradigm-radar
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- DOI Zenodo citado: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio del proyecto: https://pocketgull.com
- Aplicación: https://pocketgull.app
