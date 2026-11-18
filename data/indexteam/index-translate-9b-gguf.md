# IndexTeam/Index-Translate-9B-GGUF

## Resumen

Index-Translate-9B-GGUF es la conversión oficial a formato GGUF del modelo Index-Translate-9B, desarrollado por IndexTeam (equipo vinculado a bilibili) como parte de la familia de modelos de traducción multilingüe Index-Translate. El modelo base es un transformer de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) diseñado específicamente para traducción automática en 150 idiomas, con soporte para traducción restringida por terminología y formato, doblaje controlado por sílabas y traducción de documentos largos.

Este repositorio GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp, con cuantizaciones estáticas que van desde 2 bits (Q2_K, 3,91 GB) hasta 16 bits (f16, 18,41 GB). Además, incluye proyectores multimodales (`mmproj`) que habilitan traducción de imagen a texto sin necesidad de herramientas OCR externas, lo que amplía su aplicabilidad a flujos de trabajo con capturas de pantalla, documentos escaneados y contenido visual.

La licencia Apache 2.0 facilita su uso comercial y su integración en productos. El modelo se distribuye con una plantilla de chat compatible con `llama-server` y `llama-cli`, y el autor recomienda decodificación greedy (temperatura 0) con el modo de razonamiento (`enable_thinking`) desactivado para tareas de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de lanzamiento de `llama-server` con `-c 32768`) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | 150 idiomas (segun la model card); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer (tipo de atención, número de capas, dimensiones ocultas) ni la composición exacta del dataset de entrenamiento. El modelo base Index-Translate-9B se presenta como parte de una familia de traducción multilingüe con 150 idiomas, e incorpora capacidades multimodales mediante un proyector (`mmproj`) que permite traducir imágenes a texto de extremo a extremo sin OCR externo. El repositorio GGUF se generó con llama.cpp (rama master, octubre de 2026) mediante cuantización estática post-entrenamiento.

La model card menciona un informe técnico ([arXiv:2609.40181](https://arxiv.org/abs/2609.40181)) que presumiblemente contiene los detalles de entrenamiento, pero su contenido no está incluido en la información proporcionada. Tampoco se especifican datos sobre RLHF, DPO, número de tokens de entrenamiento ni innovaciones técnicas como decodificación especulativa o atención lineal. El modelo soporta el formato de traducción restringida **instTrans**, que permite imponer restricciones duras (glosarios terminológicos, preservación de formato JSON/CSV/código/placeholders) y restricciones blandas (tono, desambiguación de sentido, consistencia entre frases, preservación de LaTeX).

## Capacidades

- Traducción automática multilingüe en 150 idiomas.
- Traducción restringida por terminología (glosarios con cumplimiento binario).
- Preservación de formato y estructura en JSON, CSV, código y placeholders.
- Adaptación de tono y estilo (por ejemplo, registro formal de correo empresarial).
- Desambiguación de sentido según dominio (por ejemplo, *plant* como fábrica en contexto industrial).
- Consistencia entre frases y preservación de LaTeX.
- Traducción de documentos largos.
- Traducción controlada por sílabas para doblaje, mediante los checkpoints Index-Homura (2B y 9B), que respetan un presupuesto de sílabas objetivo y pueden combinarse con glosarios.
- Traducción multimodal imagen a texto sin OCR externo, gracias a los proyectores `mmproj` incluidos.
- Soporte de plantilla de chat compatible con llama.cpp (`--jinja`) y modo de razonamiento desactivable (`enable_thinking: false`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- **Traducción de documentación técnica con glosario obligatorio**: el modelo puede recibir restricciones duras de terminología (por ejemplo, `碳纤维:carbon fiber`) y garantizar que cada término se traduzca de forma consistente en todo el documento, lo que es adecuado para manuales de producto y documentación legal.
- **Localización de interfaces y archivos estructurados**: gracias a la preservación de formato en JSON, CSV y código, se puede integrar en pipelines de localización que traducen archivos de recursos sin romper la estructura ni los placeholders.
- **Doblaje y subtitulado con control de sílabas**: combinado con los checkpoints Index-Homura, permite generar traducciones que respetan un presupuesto de sílabas por línea, útil para doblaje y subtitulado donde la sincronía es crítica.
- **Traducción de capturas de pantalla y documentos escaneados**: con el proyector `mmproj-Q8_0` y `llama-server`, se puede traducir imagen a texto directamente sin herramientas OCR externas, adecuado para atención al cliente que recibe capturas o para digitalización de documentos.
- **Atención al cliente multilingüe**: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens, lo que permite mantener el historial de la conversación y traducir respuestas en tiempo real en 150 idiomas.
- **Traducción de correos y comunicaciones empresariales**: las restricciones blandas de tono y estilo permiten adaptar el registro (por ejemplo, formal para correo empresarial) y desambiguar términos según el dominio, lo que mejora la calidad frente a traducción literal.
- **Procesamiento de documentos largos en local**: con cuantizaciones Q4_K_M (5,78 GB) o Q5_K_M (6,64 GB), se puede ejecutar en GPU de consumo y traducir documentos extensos sin enviar datos a servicios en la nube, lo que es relevante para sectores con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,91 GB
  - Q3_K_M: ~4,74 GB
  - Q4_K_M (recomendado): ~5,78 GB
  - Q5_K_M: ~6,64 GB
  - Q6_K: ~7,56 GB
  - Q8_0: ~9,79 GB
  - f16: ~18,41 GB
  - Proyector multimodal adicional: ~0,62 GB (Q8_0) o ~0,92 GB (f16)
- **GPU recomendadas**: no se especifican en la informacion disponible. Por tamaño, Q4_K_M y Q5_K_M caben en GPU de consumo con 8-12 GB de VRAM; Q8_0 y f16 requieren GPU de 16-24 GB o superiores (RTX 4090, A100, H100).
- **Cabe en GPU de consumo**: sí, en cuantizaciones Q4_K_M o inferiores con GPUs de 8 GB o más (sujeto a overhead de contexto y proyector).
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`, `llama serve`), con soporte de plantilla de chat Jinja y modo de razonamiento desactivable. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- **Latencia y throughput estimados**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con otras familias de traducción. No disponible.

## Limitaciones y advertencias

- La lista completa de los 150 idiomas soportados no está disponible; el rendimiento por idioma puede variar y no se documenta.
- Las cuantizaciones Q2_K y Q3_K presentan pérdida de calidad significativa o notable según el propio autor; no se recomiendan para producción.
- El modelo está optimizado para traducción con decodificación greedy (temperatura 0) y `enable_thinking: false`; usarlo fuera de ese régimen puede degradar la calidad.
- El modo de razonamiento (`thinking`) está disponible pero no se recomienda para traducción según la model card; su comportamiento en otras tareas no está documentado.
- No se detallan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto más allá de los 32.768 tokens usados en el ejemplo.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los componentes del modelo base y del proyector multimodal.
- El repositorio ocupa 85,1 GB en total; la descarga completa de todas las cuantizaciones no es necesaria, pero conviene seleccionar solo el archivo requerido.
- La información sobre el informe técnico (arXiv:2609.40181) no está incluida, por lo que no se pueden verificar detalles de entrenamiento ni evaluación.

## Enlaces

- [Hugging Face: IndexTeam/Index-Translate-9B-GGUF](https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF)
- [Modelo base: IndexTeam/Index-Translate-9B](https://huggingface.co/IndexTeam/Index-Translate-9B)
- [Informe técnico (arXiv:2609.40181)](https://arxiv.org/abs/2609.40181)
- [Código: github.com/bilibili/Index-Translate](https://github.com/bilibili/Index-Translate)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Guía de traducción multimodal de imágenes](https://github.com/bilibili/Index-Translate/blob/main/docs/image_translate.md)
- [Demo web](https://index-translate.bilibili.com/?p=/site/translate.html)
- [Checkpoints Index-Homura (2B/9B)](https://huggingface.co/IndexTeam/Index-Homura-2B)
