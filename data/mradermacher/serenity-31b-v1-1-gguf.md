# mradermacher/Serenity-31B-v1.1-GGUF

## Resumen

Serenity-31B-v1.1-GGUF es la versión cuantizada en formato GGUF del modelo Serenity-31B-v1.1, desarrollado originalmente por ReadyArt y convertido por mradermacher, un conocido creador de cuantizaciones estáticas para llama.cpp. El modelo base es un fine-tune orientado a roleplay, conversación instructiva y contenido para adultos, construido sobre una arquitectura de tipo Gemma (la etiqueta `gemma-4` aparece en los metadatos del repositorio) con aproximadamente 30.700 millones de parámetros, según los pesos en safetensors del modelo original.

La relevancia de esta ficha reside en que empaqueta un modelo de gran tamaño en una batería completa de cuantizaciones (desde Q2_K de 12 GB hasta Q8_0 de 32,7 GB) que permiten ejecutarlo en hardware de consumo, algo imposible con los pesos completos en precisión nativa. Incluye además suplementos multimodales (`mmproj`) en Q8_0 y f16, lo que sugiere capacidad de entrada de imágenes en el modelo base.

La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque el contenido explícito y para adultos que el modelo está diseñado para generar exige controles de despliegue y consideraciones legales y éticas importantes. El modelo está etiquetado como `not-for-all-audiences` y `unaligned`, lo que indica que no ha pasado por un proceso de alineamiento de seguridad convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Gemma (etiqueta `gemma-4` en metadatos); detalles exactos no disponibles |
| Parametros totales | 30.697.345.596 (30,7 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 213,9 GB (incluye todas las cuantizaciones) |
| Cuantizaciones ponderadas (imatrix) | Disponibles en repositorio separado `mradermacher/Serenity-31B-v1.1-i1-GGUF` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `gemma-4` y el recuento de parámetros. Por convención en la familia Gemma, se trataría de un transformer decoder-only con atención multi-cabeza y normalización RMSNorm, pero no se confirma en la documentación proporcionada. El modelo base es un fine-tune de ReadyArt sobre un modelo Gemma de aproximadamente 31B, orientado a roleplay y conversación instructiva.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. Las etiquetas `unaligned` y `nsfw` indican que el proceso de ajuste priorizó la libertad expresiva sobre el alineamiento de seguridad, lo que es habitual en fine-tunes de roleplay. La presencia de suplementos `mmproj` sugiere que el modelo base incorpora un codificador visual, pero no se especifica su arquitectura ni los datos multimodales empleados.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y personificación de personajes.
- Modo instructivo: sigue instrucciones en formato conversacional.
- Entrada multimodal: los ficheros `mmproj-Q8_0` y `mmproj-f16` permiten procesar imágenes junto con texto (capacidad heredada del modelo base, no documentada en detalle).
- Contenido para adultos y explícito: el modelo está ajustado explícitamente para narrativa madura y ERP (erotic roleplay).
- Comportamiento "unaligned": menor rechazo a peticiones que los modelos alineados convencionalmente rechazarían.
- Idioma: inglés principalmente; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado para mantener la coherencia de personaje en diálogos multi-turno, lo que lo hace adecuado para aplicaciones de entretenimiento narrativo y juegos de rol por texto.
- Generación de ficción para adultos: escritura asistida de narrativa madura y explícita, un nicho donde los modelos alineados suelen rechazar o censurar el contenido.
- Prototipado de chatbots de personaje en local: gracias a las cuantizaciones Q4_K_M (18,8 GB) puede ejecutarse en una GPU de consumo de 24 GB, permitiendo desarrollar y probar agentes conversacionales sin depender de APIs externas.
- Investigación sobre alineamiento y seguridad: al ser un modelo `unaligned`, sirve como caso de estudio para evaluar comportamientos, sesgos y riesgos de modelos sin filtros de seguridad.
- Evaluación de cuantizaciones: el repositorio ofrece un espectro completo de cuantizaciones (Q2_K a Q8_0) que permite medir empíricamente la degradación de calidad en roleplay según el nivel de compresión.
- Despliegue con entrada de imágenes: los suplementos `mmproj` permiten construir asistentes conversacionales que incorporan descripciones visuales en el contexto de la conversación.
- Generación creativa asistida en local con privacidad: al ejecutarse íntegramente en hardware propio mediante llama.cpp, el contenido generado no sale del entorno del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~12 GB
  - Q3_K_M: ~15,4 GB
  - IQ4_XS: ~17 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas:
  - Q4_K_M / Q5_K_M: RTX 3090 o RTX 4090 (24 GB) con margen para contexto moderado.
  - Q6_K / Q8_0: A100 40 GB, H100, o RTX 4090 con offloading parcial a CPU.
  - Q2_K / Q3_K: RTX 4080 (16 GB) o RTX 3090 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K o Q3_K y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo está etiquetado como `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Serenity-31B-v1.1 (este) | 30,7B | No disponible | Apache 2.0 | GGUF | Fine-tune de roleplay/NSFW sobre base Gemma |
| Modelos de roleplay de ~30B sobre Gemma | ~27-31B | Variable | Variable | GGUF/safetensors | No disponible comparativa concreta en la información |
| Modelos instructivos generales de ~30B | ~30B | Variable | Variable | GGUF/safetensors | No disponible comparativa concreta en la información |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Contenido explícito y para adultos: el modelo está diseñado para generar material NSFW; requiere filtros y controles de edad en cualquier despliegue público.
- Modelo `unaligned`: no ha pasado por un proceso de alineamiento de seguridad convencional, por lo que puede producir contenido dañino, ofensivo o inapropiado sin las salvaguardas habituales.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede inventar hechos, especialmente fuera de contextos narrativos.
- Sesgos: no se documentan evaluaciones de sesgo; los fine-tunes de roleplay suelen heredar y amplificar sesgos de género, culturales y de representación.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: la longitud de ventana no está documentada, lo que dificulta planificar despliegues con conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre material para adultos y a las políticas de las plataformas de distribución.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia narrativa; para producción se recomienda Q4_K_M o superior.
- El repositorio completo ocupa 213,9 GB; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Serenity-31B-v1.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Serenity-31B-v1.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Serenity-31B-v1.1-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Serenity-31B-v1.1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
