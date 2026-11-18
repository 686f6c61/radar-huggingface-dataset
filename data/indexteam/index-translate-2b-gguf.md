# IndexTeam/Index-Translate-2B-GGUF

## Resumen

Index-Translate-2B-GGUF es la conversión oficial a formato GGUF del modelo IndexTeam/Index-Translate-2B, un modelo de traducción multilingüe desarrollado por IndexTeam (equipo vinculado a bilibili) y presentado en el informe técnico arXiv:2609.40181. Forma parte de la familia Index-Translate, diseñada específicamente para traducción en 150 idiomas con soporte de restricciones de terminología, formato y control de estilo, además de traducción de documentos largos y doblaje controlado por sílabas.

El modelo base cuenta con 1.942.653.248 parámetros (aproximadamente 2B) y esta conversión GGUF está pensada para ejecutarse con llama.cpp en hardware modesto. Incluye proyector multimodal (`mmproj`) que habilita traducción de imagen a texto de extremo a extremo sin herramientas OCR externas, lo que resulta relevante para flujos de traducción de capturas, documentos escaneados y señales visuales.

La relevancia actual radica en su combinación de tamaño reducido, licencia Apache 2.0, soporte de 150 idiomas y un formato de prompting estructurado (instTrans) que permite imponer glosarios obligatorios y preservación de formato en JSON, CSV, código o marcadores de posición, capacidades poco habituales en modelos de traducción de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traducción; detalles en el informe técnico arXiv:2609.40181) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en `llama-server` con `-c 32768`) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | 150 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de transformer, atención, número de capas o dimensión oculta) ni sobre la composición del dataset de entrenamiento, el número de tokens o las técnicas de alineación empleadas (RLHF, DPO u otras). El informe técnico referenciado (arXiv:2609.40181) es la fuente indicada por el autor para esos detalles.

La innovación destacable documentada es el formato de traducción restringida **instTrans**, que estructura la petición en `【源文】<texto>` seguido de restricciones duras numeradas (`1. 【硬性要求】`) y restricciones blandas (`2. 【注意】`). Las restricciones duras son binarias y deben cumplirse (glosarios terminológicos estrictos, preservación de estructura en JSON/CSV/código/placeholders); las blandas son graduables (tono y estilo, desambiguación de sentido, consistencia entre frases, preservación de LaTeX). Además, los checkpoints Index-Homura (2B/9B) permiten traducción con presupuesto de sílabas para doblaje. La conversión GGUF se realizó con llama.cpp (master, 2026-10) mediante cuantización estática post-entrenamiento.

## Capacidades

- Traducción multilingüe en 150 idiomas, con decodificación greedy recomendada (temperatura 0).
- Traducción restringida por glosario terminológico obligatorio (restricciones duras).
- Preservación de formato y estructura en JSON, CSV, código y placeholders.
- Adaptación de tono y estilo (por ejemplo, registro formal de correo empresarial) como restricción blanda.
- Desambiguación de sentido por dominio y consistencia entre frases.
- Preservación de expresiones LaTeX.
- Traducción de documentos largos.
- Traducción de imagen a texto nativa mediante proyector multimodal (`mmproj`), sin OCR externo.
- Traducción con control de sílabas para doblaje mediante checkpoints Index-Homura (2B/9B).
- Modo conversacional con plantilla de chat; el modo thinking debe desactivarse (`enable_thinking: false`) para traducción.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Traducción de documentación técnica con terminología fija: usando instTrans con un glosario de restricciones duras (por ejemplo, `碳纤维:carbon fiber`), el modelo garantiza que los términos especializados se traduzcan de forma consistente en todo el documento, algo crítico en manuales y normativas.
- Localización de archivos JSON, CSV y código: las restricciones duras de preservación de formato permiten traducir cadenas de recursos sin romper claves, estructuras ni marcadores de posición, integrándose en pipelines de localización automatizados.
- Traducción de capturas y documentos escaneados: con el proyector `mmproj-Q8_0` y `llama-server`, el modelo traduce directamente de imagen a texto en 150 idiomas sin depender de Tesseract u otros OCR, simplificando el despliegue local.
- Doblaje y subtitulado con presupuesto de sílabas: combinando el modelo con checkpoints Index-Homura, se generan traducciones que respetan el número de sílabas disponible, útil para sincronización de audio y subtítulos.
- Atención al cliente multilingüe: con 32.768 tokens de contexto y modo conversacional, puede gestionar hilos multi-turno y traducir correos o tickets preservando el registro formal mediante restricciones blandas de tono.
- Procesamiento por lotes en hardware de consumo: la cuantización Q4_K_M (1,31 GB) permite ejecutar la traducción en portátiles y estaciones sin GPU dedicada mediante llama.cpp u Ollama, reduciendo costes frente a APIs en la nube.
- Traducción de artículos científicos: la preservación de LaTeX y la consistencia entre frases facilitan la traducción de preprints manteniendo fórmulas y notación intactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB con Q4_K_M (recomendado), 2,1 GB con Q8_0, 3,9 GB con f16; añadir 0,36 GB si se usa el proyector multimodal `mmproj-Q8_0`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y permiten mayor paralelismo y throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama serve`), Ollama y cualquier runtime compatible con GGUF; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Index-Translate-2B-GGUF | 1,94B | 32.768 tokens | 150 | Apache 2.0 | GGUF |
| NLLB-200 (200 idiomas) | hasta 54,5B (variantes 600M-54,5B) | 512 tokens | 200 | CC-BY-NC 4.0 | safetensors |
| M2M-100 (418M/1,2B/12B) | hasta 12B | 1.024 tokens | 100 | MIT | safetensors |
| MADLAD-400 (3B/7B/10B) | hasta 10B | 2.048 tokens | 400+ | Apache 2.0 | safetensors |

La comparación se limita a datos generales de cada familia; no se dispone de resultados de benchmarks del Index-Translate-2B en la información proporcionada para comparar rendimiento de traducción de forma cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, por lo que no puede evaluarse su comportamiento diferencial por idioma o dominio.
- Riesgo de alucinación inherente a los modelos generativos; en traducción puede manifestarse como adición de contenido no presente en el original, especialmente con cuantizaciones agresivas (Q2_K, Q3_K).
- La calidad se degrada con cuantizaciones de 2 y 3 bits según la propia model card; se recomienda Q4_K_M o superior para producción.
- El modo thinking debe desactivarse explícitamente (`enable_thinking: false`) para obtener traducciones directas; de lo contrario, el modelo puede generar explicaciones no deseadas.
- La model card no especifica la lista concreta de los 150 idiomas ni su cobertura real por par de lenguas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los checkpoints Index-Homura si se usan conjuntamente.
- El repositorio ocupa 19,6 GB por incluir todas las cuantizaciones; descargar únicamente el archivo necesario.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- [Hugging Face: IndexTeam/Index-Translate-2B-GGUF](https://huggingface.co/IndexTeam/Index-Translate-2B-GGUF)
- [Modelo base: IndexTeam/Index-Translate-2B](https://huggingface.co/IndexTeam/Index-Translate-2B)
- [Informe técnico (arXiv:2609.40181)](https://arxiv.org/abs/2609.40181)
- [Código en GitHub: bilibili/Index-Translate](https://github.com/bilibili/Index-Translate)
- [Guía de traducción de imágenes](https://github.com/bilibili/Index-Translate/blob/main/docs/image_translate.md)
- [Checkpoints Index-Homura (2B/9B)](https://huggingface.co/IndexTeam/Index-Homura-2B)
- [Demo web](https://index-translate.bilibili.com/?p=/site/translate.html)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
