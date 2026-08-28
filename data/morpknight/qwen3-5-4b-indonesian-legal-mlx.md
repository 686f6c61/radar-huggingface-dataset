# morpknight/qwen3.5-4b-indonesian-legal-mlx

## Resumen

El modelo `morpknight/qwen3.5-4b-indonesian-legal-mlx` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B-Base, especializado en el dominio legal indonesio. El autor, morpknight, ha fusionado un adaptador LoRA (entrenado mediante PEFT) en el modelo base y ha exportado el resultado en formato MLX con precisión BF16, lo que permite su ejecución eficiente en dispositivos Apple Silicon mediante la librería MLX.

Este modelo está diseñado para asistencia legal en idioma indonesio, respondiendo preguntas sobre normativa, redacción de documentos y comprensión de terminología jurídica. Su relevancia radica en ofrecer una alternativa ligera (4,2 mil millones de parámetros) y de código abierto (licencia Apache 2.0) para entornos donde se requiere procesamiento de texto legal en indonesio sin depender de servicios en la nube. La exportación MLX excluye la torre de visión, por lo que es un modelo exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-4B-Base) |
| Parametros totales | 4.205.749.760 (4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (export MLX) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B, aunque por tratarse de un modelo de la serie Qwen se asume una arquitectura transformer estándar. El proceso de entrenamiento consistió en un ajuste fino mediante PEFT con un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B-Base, utilizando datos del dominio legal indonesio. Posteriormente, el adaptador se fusionó con los pesos del modelo base en precisión BF16 y se exportó al formato MLX mediante `mlx_lm.convert`. No se especifican el tamaño del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La implementación MLX de Qwen3.5 utilizada en este export es solo de texto; la torre de visión no está incluida.

## Capacidades

- Generación de texto en indonesio, especializada en el dominio legal.
- Asistencia conversacional para responder preguntas sobre normativa y conceptos jurídicos indonesios.
- Comprensión de terminología legal en indonesio gracias al ajuste fino con datos del sector.
- Soporte para plantillas de chat (chat template) con opción de desactivar el modo de razonamiento (`enable_thinking: false`).
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Consulta de normativa legal: un usuario puede preguntar, por ejemplo, "¿Cuál es el propósito de la Ley de Protección de Datos Personales en Indonesia?" y el modelo genera una respuesta basada en su conocimiento del dominio. Adecuado para orientación preliminar, aunque siempre debe verificarse con fuentes oficiales.
- Redacción de borradores de documentos legales: el modelo puede ayudar a redactar cláusulas, contratos simples o avisos legales en indonesio, agilizando el trabajo de profesionales que luego revisan y ajustan el contenido.
- Resumen de textos legales: dado un texto extenso de naturaleza jurídica, el modelo puede generar un resumen conciso en indonesio, útil para abogados o estudiantes que necesitan extraer puntos clave rápidamente.
- Asistencia en atención al cliente de despachos: integrado en un chatbot, el modelo puede responder consultas frecuentes sobre procedimientos legales, plazos o requisitos, liberando tiempo del personal humano.
- Educación legal: estudiantes de derecho pueden utilizarlo como herramienta de estudio para aclarar conceptos o explorar interpretaciones de artículos específicos, siempre con supervisión docente.
- Prototipado de aplicaciones legales: desarrolladores pueden crear prototipos de asistentes legales en indonesio usando MLX en entornos Apple, gracias a la facilidad de despliegue local con `mlx_lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo está exportado en formato MLX, diseñado para ejecutarse en dispositivos Apple Silicon (M1 o posterior).
- Tamaño del repositorio: 8,4 GB, lo que sugiere que el modelo en BF16 ocupa aproximadamente esa cantidad en memoria unificada. Se recomienda un Mac con al menos 16 GB de RAM unificada para una ejecución cómoda.
- No se han proporcionado datos de latencia ni throughput. Al ser un modelo de 4,2 B en BF16, se espera un rendimiento razonable en chips M-series, pero no hay cifras oficiales.
- Opciones de despliegue: uso local mediante `mlx_lm` (CLI o Python). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que MLX es específico de Apple.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, al estar basado en Qwen3.5-4B, podría compararse con otros modelos de 4B especializados en dominios legales o en idioma indonesio, pero no se han encontrado datos concretos en la búsqueda web.

## Limitaciones y advertencias

- El modelo no es un sustituto del asesoramiento legal profesional; sus respuestas deben ser revisadas por un abogado cualificado y contrastadas con fuentes oficiales vigentes.
- Es un modelo de solo texto: no procesa imágenes ni otro tipo de entrada multimodal.
- La especialización en legal indonesio puede implicar un rendimiento limitado fuera de ese dominio o en variantes del idioma distintas al indonesio estándar.
- No se han documentado sesgos específicos, pero al ser un fine-tune sobre un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o desactualizada, especialmente en un campo tan cambiante como el legal.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento del adaptador LoRA para asegurar el cumplimiento legal.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido ampliamente validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/morpknight/qwen3.5-4b-indonesian-legal-mlx)
- [Adaptador LoRA original](https://huggingface.co/morpknight/qwen3.5-4b-indonesian-legal-lora)
- [Modelo base Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Perfil de Qwen en Hugging Face](https://huggingface.co/Qwen)
- [Repositorio GitHub de Qwen3.5](https://github.com/ojukajonzo/Qwen3.5)
