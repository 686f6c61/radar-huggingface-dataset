# aoiandroid/nllb-200-coreml-128-macos

## Resumen

Este repositorio contiene una versión compilada del modelo de traducción automática neuronal NLLB-200 de Meta, adaptada para ejecución nativa en macOS mediante el framework Core ML. El autor, `aoiandroid`, ha empaquetado los pesos del modelo original en formato `.mlmodelc` (modelo compilado) para su uso en aplicaciones como TranslateBlue, una herramienta de traducción. La versión `128` hace referencia a una longitud de contexto de 128 tokens, lo que la convierte en una variante ligera y rápida, adecuada para traducciones de frases cortas y procesamiento en tiempo real en dispositivos Apple.

El modelo original NLLB-200 es un transformador de secuencia a secuencia desarrollado por Meta AI, capaz de traducir entre 200 idiomas con una calidad superior a otros sistemas de su categoría. Esta conversión a CoreML permite su uso sin conexión en macOS, aprovechando el Neural Engine (ANE) de los chips Apple Silicon. Es importante señalar que la licencia declarada en el repositorio es MIT, aunque el modelo original de Meta se distribuye bajo CC-BY-NC-4.0, por lo que conviene verificar los términos de uso antes de su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (encoder-decoder) |
| Parametros totales | no disponible (versión de 128 tokens, probablemente destilada) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (compilado CoreML, puede incluir cuantización interna) |
| Idiomas soportados | 200 idiomas (según NLLB-200) |
| Licencia | MIT (declarada en el repo) / CC-BY-NC-4.0 (original) |
| Formato de pesos | CoreML (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo base es NLLB-200 de Meta, un transformer de secuencia a secuencia con arquitectura encoder-decoder. Fue entrenado con 200 idiomas usando el conjunto de datos FLORES-200 y un proceso de entrenamiento supervisado masivo, incluyendo técnicas de transferencia de aprendizaje y ajuste fino. La versión específica aquí convertida es una variante con límite de 128 tokens, lo que reduce la complejidad computacional y el tamaño del modelo (1.8 GB). No se dispone de información sobre el proceso de conversión a CoreML (posiblemente mediante `coremltools`), ni sobre si se aplicó cuantización o poda adicional. La especialización para el Neural Engine (ANE) se realiza de forma local en cada dispositivo, según la documentación del autor.

## Capacidades

- Traducción automática multilingüe: soporta hasta 200 idiomas, incluyendo lenguas de baja representación.
- Generación de texto: puede producir traducciones de frases y párrafos cortos (hasta 128 tokens).
- Razonamiento: no aplicable, es un modelo de traducción puro, no de razonamiento general.
- Tool calling: no soporta.
- Agentes: no soporta.
- Capacidades especiales: optimizado para ejecución en dispositivos Apple con CoreML y Neural Engine; funciona sin conexión a internet.

## Casos de uso

- Traducción instantánea en aplicaciones móviles y de escritorio: integración en apps como TranslateBlue para traducir texto del usuario en tiempo real, sin necesidad de conexión a red.
- Accesibilidad lingüística: permitir a usuarios de idiomas minoritarios comunicarse en su lengua materna en aplicaciones de mensajería o correo.
- Asistente de viajes: traducción de frases comunes en un dispositivo portátil (iPhone, iPad, Mac) durante viajes a regiones con idiomas desconocidos.
- Procesamiento de texto offline: empresas que necesitan traducir correos o documentos internos sin enviar datos a servidores externos, cumpliendo requisitos de privacidad.
- Aplicaciones educativas: herramienta para estudiantes de idiomas que deseen comparar traducciones entre múltiples lenguas.
- Desarrollo de aplicaciones de productividad: integración como complemento para traducir selecciones de texto en editores o navegadores dentro del ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como BLEU o COMET para esta versión CoreML. Se recomienda consultar los resultados del modelo original NLLB-200 en el artículo de Meta.

## Requisitos de hardware

- Mac con chip Apple Silicon (M1 o posterior) para aprovechar el Neural Engine.
- El modelo compilado `.mlmodelc` se carga directamente en el framework CoreML.
- VRAM: no aplica, la memoria del dispositivo (RAM) es suficiente, el tamaño del modelo es de 1.8 GB.
- Opciones de despliegue: integración en aplicaciones macOS mediante CoreML, no requiere servidores.
- Latencia: típicamente en el orden de milisegundos para frases cortas, dependiendo del hardware y la longitud de entrada.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NLLB-200 (original) | 54B (MoE) | 512 tokens | CC-BY-NC-4.0 | Hugging Face |
| NLLB-200-distilled-600M | 600M | 512 tokens | CC-BY-NC-4.0 | Hugging Face |
| Este modelo CoreML | no disponible | 128 tokens | MIT (repo) / CC-BY-NC-4.0 (original) | Hugging Face |

La versión CoreML es una adaptación para hardware específico, no comparable directamente con los modelos completos en términos de calidad de traducción, sino en su propósito de despliegue ligero en dispositivos Apple.

## Limitaciones y advertencias

- Longitud de contexto muy limitada (128 tokens), por lo que no es adecuado para documentos largos.
- La licencia MIT del repositorio puede entrar en conflicto con la licencia CC-BY-NC-4.0 del modelo original, lo que impide su uso comercial sin autorización expresa.
- No se dispone de información sobre sesgos o alucinaciones específicos, pero como modelo de traducción puede presentar errores en lenguas de baja representación.
- La conversión a CoreML puede introducir pérdida de precisión, especialmente si se aplicó cuantización no documentada.
- Solo funciona en entornos Apple (macOS), no es portable a otras plataformas.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/aoiandroid/nllb-200-coreml-128-macos)
- [Modelo original de Meta NLLB-200](https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/)
- [Modelo base en Hugging Face](https://huggingface.co/cstr/nllb-200-coreml-128) (duplicado)
- [GitHub NLLB-200 (implementación de referencia)](https://github.com/JHmins/NLLB-200-Model)
