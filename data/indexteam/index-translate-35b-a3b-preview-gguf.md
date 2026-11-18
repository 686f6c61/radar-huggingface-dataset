# IndexTeam/Index-Translate-35B-A3B-preview-GGUF

## Resumen

Index-Translate-35B-A3B-preview es un modelo de traducción multilingüe desarrollado por IndexTeam (equipo vinculado a bilibili, a juzgar por el repositorio de código). Se distribuye como conversión oficial a GGUF del modelo base homónimo, publicada el 2 de octubre de 2026 y actualizada el 10 de octubre del mismo año. El modelo forma parte de la familia Index-Translate, orientada a traducción en 150 idiomas con soporte de terminología y formato restringidos, traducción de doblaje controlada y traducción de documentos largos.

La arquitectura es de tipo Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, de los cuales se activan aproximadamente 3B por token (según la denominación A3B). El repositorio GGUF incluye además proyectores multimodales (`mmproj`) que permiten traducción imagen-a-texto sin herramientas OCR externas, lo que amplía el caso de uso a capturas de pantalla, documentos escaneados e interfaces de usuario.

Su relevancia actual radica en la combinación de tres factores: licencia Apache 2.0 (permisiva para uso comercial), un conjunto completo de cuantizaciones estáticas en un único repositorio (de Q2_K a f16) y compatibilidad con llama.cpp, lo que permite desplegarlo tanto en servidores como en hardware de consumo. El informe técnico está disponible en arXiv (2609.40181) y el código en el repositorio de GitHub de bilibili.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; conversión GGUF vía llama.cpp |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B por token (denominación A3B; valor exacto no disponible) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de `llama-server` con `-c 32768`; máximo nativo no confirmado) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | 150 idiomas (según la model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); f16 en 2 shards; modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 35,5B parámetros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La conversión a GGUF se realizó con llama.cpp (rama master, octubre de 2026) mediante cuantización estática post-entrenamiento, agrupando todas las anchuras de bits en un único repositorio. El repositorio incluye proyectores multimodales nativos (`mmproj-Q8_0` y `mmproj-f16`) que habilitan traducción imagen-a-texto de extremo a extremo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card sí documenta el formato de prompting **instTrans** para traducción restringida, que estructura la petición en `【源文】<texto>` más restricciones duras (glosarios terminológicos obligatorios, preservación de formato en JSON/CSV/código/placeholders) y restricciones blandas (graduadas). Se recomienda decodificación greedy con `temperature=0` y `enable_thinking: false` en la plantilla de chat.

## Capacidades

- Traducción multilingüe en 150 idiomas, con soporte de traducción de documentos largos.
- Traducción con terminología restringida: aplicación estricta de glosarios (por ejemplo, `碳纤维:carbon fiber, 抗裂缝:crack resistance`).
- Preservación de formato y estructura en JSON, CSV, código y placeholders durante la traducción.
- Traducción de doblaje controlada (longitud y sincronización sujetas a restricciones).
- Traducción multimodal imagen-a-texto sin OCR externo, mediante los proyectores `mmproj`.
- Formato de prompting instTrans con restricciones duras (binarias) y blandas (graduadas).
- Compatibilidad con la plantilla de chat de llama.cpp (`--jinja`) y modo conversacional.
- Modo thinking desactivable mediante `enable_thinking: false`.

## Casos de uso

- Traducción de documentación técnica con glosario fijo: el modelo aplica terminología obligatoria (restricciones duras de instTrans), lo que garantiza consistencia de términos especializados en manuales y especificaciones de producto.
- Localización de aplicaciones con preservación de formato: al mantener estructura de JSON, CSV y placeholders, puede traducir ficheros de recursos i18n sin romper claves ni variables de interpolación.
- Traducción de capturas de pantalla e interfaces: el proyector multimodal permite pasar una imagen directamente al modelo y obtener el texto traducido sin pipeline OCR separado, útil para QA de localización de UI.
- Traducción de documentos largos: con contexto de 32.768 tokens, puede procesar informes o contratos completos manteniendo coherencia terminológica a lo largo del documento.
- Doblaje y subtitulado controlado: la capacidad de traducción de doblaje con restricciones permite ajustar longitud y sincronía de los segmentos traducidos.
- Servicio de traducción autoalojado: desplegado con `llama-server` y cuantización Q4_K_M (21,71 GB), ofrece una API compatible con endpoints en infraestructura propia, con licencia Apache 2.0 para uso comercial.
- Traducción en pipelines de CI/CD de contenido: integrable mediante `llama-cli` o el servidor HTTP para traducir automáticamente releases notes o documentación en cada publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): Q2_K ~13,25 GB; Q4_K_M ~21,71 GB (recomendado); Q5_K_M ~25,35 GB; Q6_K ~29,21 GB; Q8_0 ~37,80 GB; f16 ~71,07 GB (2 shards).
- Proyector multimodal adicional: 0,61 GB (Q8_0) o 0,90 GB (f16), sumado a los pesos del modelo.
- GPU recomendadas: A100 40/80 GB o H100 para f16 y Q8_0; RTX 4090 (24 GB) para Q4_K_M con contexto moderado; GPUs de 16 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M; en GPUs de 16 GB con Q3_K_M (17,17 GB requiere gestión de offload parcial) o IQ4_XS (19,39 GB, también con offload parcial).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama serve`), con soporte de descarga directa desde Hugging Face (`-hf IndexTeam/...:Q4_K_M`). No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. El ejemplo oficial usa `-ngl 99` (todas las capas en GPU) y contexto de 32.768 tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita a los parámetros estructurales conocidos de este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Index-Translate-35B-A3B-preview | 35,5B totales / ~3B activos | 32.768 tokens (config. de ejemplo) | Apache 2.0 | GGUF, safetensors | Traducción 150 idiomas, multimodal, instTrans |
| Alternativas de traducción comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- Es una versión "preview": el autor no garantiza estabilidad de comportamiento ni paridad con la versión final.
- Las cuantizaciones Q2_K y Q3_K presentan pérdida de calidad significativa o notable según la propia model card; para producción se recomienda Q4_K_M o superior.
- La lista concreta de los 150 idiomas no está disponible, por lo que no puede verificarse la cobertura de idiomas minoritarios ni la calidad por idioma.
- No se han publicado benchmarks en la información disponible, lo que impide evaluar la calidad de traducción frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos: en traducción puede manifestarse como adición de contenido no presente en el original, especialmente en textos ambiguos o con jerga.
- El modo thinking debe desactivarse (`enable_thinking: false`) y usarse decodificación greedy para obtener el comportamiento de traducción esperado; otros ajustes pueden degradar la salida.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la información disponible.
- El tamaño del repositorio (315,5 GB) implica requisitos de almacenamiento considerables si se descargan todas las cuantizaciones.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Informe técnico (arXiv): https://arxiv.org/abs/2609.40181
- Código: https://github.com/bilibili/Index-Translate
- Guía de traducción multimodal: https://github.com/bilibili/Index-Translate/blob/main/docs/image_translate.md
- Demo web: https://index-translate.bilibili.com/?p=/site/translate.html
- llama.cpp: https://github.com/ggml-org/llama.cpp
