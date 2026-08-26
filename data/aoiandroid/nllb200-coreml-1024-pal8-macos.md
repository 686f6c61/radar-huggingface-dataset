# aoiandroid/nllb200-coreml-1024-pal8-macos

## Resumen

Este repositorio contiene una conversión a Core ML del modelo NLLB-200 de Meta, compilada específicamente para su ejecución en macOS dentro de la aplicación TranslateBlue. El modelo original, desarrollado por Meta AI, es un sistema de traducción neuronal que cubre 200 idiomas y fue publicado en 2022 como parte del proyecto No Language Left Behind. Esta versión, creada por el usuario aoiandroid, convierte los pesos del modelo base en formato `.mlmodelc` con especialización para el Apple Neural Engine (ANE), lo que permite inferencia local eficiente en dispositivos Apple con Apple Silicon. El repositorio tiene un tamaño de 1.3 GB y se distribuye bajo licencia MIT, lo que facilita su integración en proyectos comerciales y personales.

El nombre del modelo (`nllb200-coreml-1024-pal8`) sugiere que se basa en la variante con dimensión de embedding 1024, que corresponde al modelo de aproximadamente 1.3 mil millones de parámetros de la familia NLLB-200. El sufijo `pal8` indica probablemente una cuantización de 8 bits (palette 8-bit), aunque no se confirma en la documentación del repositorio. La conversión mantiene las capacidades de traducción del modelo original, pero adaptadas al formato Core ML para su uso directo en aplicaciones macOS sin necesidad de infraestructura externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (basado en NLLB-200) |
| Parámetros totales | No disponible (la dimensión 1024 sugiere la variante de 1.3B, pero no se confirma) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el sufijo `pal8` sugiere cuantización de 8 bits, pero no se documenta) |
| Idiomas soportados | 200 idiomas (según el modelo NLLB-200 base) |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo original NLLB-200 es un transformer seq2seq de 200 idiomas entrenado por Meta AI con un corpus masivo de datos multilingües. La variante con dimensión 1024 corresponde al modelo de 1.3 mil millones de parámetros, que se entrenó con 400 millones de oraciones de ejemplo y utiliza una arquitectura estándar de encoder-decoder con atención multi-cabeza. El entrenamiento original se realizó mediante aprendizaje supervisado con datos de CommonCrawl y otras fuentes, y se publicó con licencia CC-BY-NC-4.0.

Este repositorio no modifica los pesos del modelo; se limita a convertir el modelo a formato Core ML mediante un script de exportación que traza el encoder y el decoder con KV cache. La conversión se compila en `.mlmodelc` para macOS, con especialización ANE que queda local al dispositivo. No se documentan innovaciones técnicas adicionales más allá de la optimización para el hardware de Apple.

## Capacidades

- Traducción automática entre 200 idiomas, incluidos idiomas de baja representación como el quechua o el lingala.
- Generación de texto multilingüe con calidad comparable a modelos grandes en tareas de traducción.
- Inferencia local en dispositivos Apple, sin conexión a internet.
- Integración con la aplicación TranslateBrowse para traducción de documentos o conversaciones en tiempo real.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-step en esta conversión.

## Casos de uso

- **Traducción de documentos en macOS**: el modelo puede integrarse en aplicaciones de productividad para traducir documentos completos de un idioma a otro de forma local, sin enviar datos a servidores externos, lo que garantiza privacidad.
- **Traducción de conversaciones en tiempo real**: al ejecutarse en el Apple Neural Engine, el modelo puede procesar frases de forma interactiva, ideal para aplicaciones de chat o videoconferencia con subtítulos multilingües.
- **Localización de aplicaciones**: los desarrolladores pueden usar el modelo para traducir cadenas de texto de sus aplicaciones a 200 idiomas, directamente en el dispositivo del usuario.
- **Acceso a idiomas minoritarios**: su soporte de 200 idiomas incluye lenguas con pocos recursos, lo que permite a ONGs o instituciones crear herramientas de traducción para comunidades con poco acceso a servicios de traducción comerciales.
- **Traducción offline en entornos con conectividad limitada**: al ser un modelo local, es útil en zonas rurales o en aplicaciones que funcionan sin conexión a internet.
- **Procesamiento de datos multilingües**: se puede usar en pipelines de análisis de datos para normalizar o traducir corpus de texto en múltiples idiomas, aprovechando su licencia MIT para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones comparativas con otros modelos de traducción, ni métricas de calidad como BLEU o chrF. Para conocer el rendimiento real, se recomienda consultar el paper original de NLLB-200, que reporta mejoras de hasta un 44% en BLEU frente a sistemas anteriores en idiomas de baja calidad.

## Requisitos de hardware

- **VRAM estimada**: el modelo compilado ocupa 1.3 GB en disco, pero la memoria de inferencia depende del formato de cuantización. Con cuantización de 8 bits, se estima un consumo de memoria de aproximadamente 1.5-2 GB en RAM unificada de Apple Silicon.
- **GPU recomendadas**: funciona en cualquier Mac con Apple Silicon (M1, M2, M3 o posteriores). La especialización ANE permite que el Neural Engine acelere la inferencia, aunque también puede ejecutarse en la GPU o CPU.
- **Compatibilidad con consumer GPU**: sí, los Macs con chip M1 o superior son considerados hardware de consumo y soportan este modelo sin problemas.
- **Opciones de despliegue**: el modelo está compilado para Core ML, por lo que se integra directamente en aplicaciones Xcode con el framework `CoreML`. No es compatible con vLLM, llama.cpp u otros entornos de inferencia estándar, ya que está limitado al ecosistema Apple.
- **Latencia y throughput**: no se dispone de datos oficiales. En dispositivos con ANE, se espera una latencia de inferencia de entre 200 y 500 ms por frase de longitud media, dependiendo del idioma y la complejidad del texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| **nllb200-coreml-1024-pal8-macos** (este) | Transformer seq | ~1.3B (no confirmado) | No disponible | 200 | MIT | Core ML |
| **NLLB-200 (original de Meta)** | Transformer seq | 1.3B | 512 tokens | 200 | CC-BY-NC-4.0 | PyTorch, safetensors |
| **M2M-100 (Meta)** | Transformer seq | 1.2B | 512 tokens | 100 | MIT | PyTorch |
| **Opus-MT (Helsinki)** | Transformer seq | 500M-1B | 512 tokens | 100+ | CC-BY | PyTorch, ONNX |

La principal diferencia frente al modelo original de Meta es la licencia: este repositorio la cambia a MIT, lo que permite uso comercial sin restricciones, mientras que el original de Meta es CC-BY-NC-4.0 (solo no comercial). En términos de rendimiento, se espera que las métricas de calidad sean similares al modelo base de 1.3B, pero no hay datos de benchmark en este repo.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo NLLB-200 original presenta sesgos de género y culturales en algunas traducciones, especialmente en idiomas con pocos datos de entrenamiento. Estos sesgos se heredan en esta conversión.
- **Riesgo de alucinación**: como todo modelo de traducción, puede generar frases incorrectas o inventadas, sobre todo en idiomas poco comunes o con frases ambiguas. Se recomienda verificar manualmente las traducciones críticas.
- **Limitaciones de contexto**: el modelo original tiene una ventana de contexto de 512 tokens, lo que limita la longitud de los textos que se pueden traducir de una vez. Para documentos largos se necesita segmentación previa.
- **Restricciones de licencia**: aunque el repositorio se declara MIT, es importante verificar que los pesos originales de NLLB-200 (CC-BY-NC-4.0) no sean reutilizados con fines comerciales sin permiso. La conversión a Core ML no cambia la licencia de los pesos subyacentes.
- **Dependencia del ecosistema Apple**: el modelo solo funciona en macOS e iOS, no es portátil a otros sistemas operativos o plataformas.
- **Falta de documentación**: el repositorio no incluye instrucciones detalladas de uso, ni ejemplos de código, ni información sobre el proceso de conversión más allá de una mención a un notebook privado.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/aoiandroid/nllb200-coreml-1024-pal8-macos)
- [Repositorio original de la conversión (sin compilar)](https://huggingface.co/aoiandroid/nllb200-coreml-1024-pal8)
- [Repositorio de la versión float32](https://huggingface.co/aoiandroid/nllb200-coreml-1024-float32)
- [Blog oficial de Meta sobre NLLB-200](https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/)
- [GitHub de CoreML-Models (zoo de modelos CoreML)](https://github.com/john-rocky/CoreML-Models)
