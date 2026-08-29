# Hskyto/lfm2.5-2.6b-toolcall-mlx-q4

## Resumen

LFM2.5-2.6B es un modelo de lenguaje denso de 2.600 millones de parámetros desarrollado por Liquid AI, diseñado específicamente para cargas de trabajo agénticas en dispositivos locales. Este repositorio concreto, `Hskyto/lfm2.5-2.6b-toolcall-mlx-q4`, contiene una versión cuantizada en 4 bits (MLX) del modelo base, fusionada con un adaptador QLoRA personalizado que optimiza el tool calling y la ejecución de tareas multi-paso en Apple Silicon. El modelo base ofrece una ventana de contexto de 128.000 tokens y soporte nativo de herramientas, lo que lo hace adecuado para agentes autónomos en entornos con recursos limitados.

La relevancia actual radica en la tendencia hacia la inferencia en el dispositivo: este modelo permite ejecutar agentes de IA completos en un teléfono o un Mac sin depender de APIs en la nube, con un rendimiento declarado de 220 tokens por segundo y un peso inferior a 2,5 GB. La versión aquí presentada, cuantizada a 4 bits, reduce aún más el espacio ocupado (1,5 GB) a costa de una ligera pérdida de precisión, manteniendo la compatibilidad con el ecosistema MLX de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante exacta) |
| Parametros totales | 421.657.600 (según safetensors del repo; el nombre sugiere 2.6B, discrepancia no resuelta) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 128.000 tokens (según documentación de Liquid AI para el modelo base) |
| Tipos de cuantizacion | 4-bit (q4) en formato MLX |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un transformer denso de 2.600 millones de parámetros, entrenado sobre aproximadamente 34 billones de tokens. Su post-entrenamiento empleó modelos expertos para reforzar capacidades en matemáticas, código, uso de herramientas y contexto largo, seguido de una transferencia a un formato optimizado para inferencia en dispositivos. El adaptador QLoRA incluido en este repositorio se entrenó específicamente para tool calling y function calling, mejorando la capacidad del modelo para invocar APIs y ejecutar acciones en entornos agénticos. La cuantización a 4 bits se realizó con MLX, el framework de aprendizaje automático de Apple para hardware unificado.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Tool calling y function calling nativo, optimizado mediante el adaptador QLoRA.
- Ejecución de tareas multi-paso y planificación agéntica (planning, tool use, multi-step reasoning).
- Ventana de contexto larga de 128K tokens, adecuada para documentos extensos o historiales de conversación prolongados.
- Inferencia en dispositivo con Apple Silicon (Mac, iPhone, iPad) gracias a MLX.
- Soporte de cuantización 4-bit para reducir requisitos de memoria.

## Casos de uso

- Asistentes personales en el móvil: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K) y ejecutar acciones como enviar mensajes, crear recordatorios o consultar APIs, todo localmente sin conexión a la nube.
- Automatización de tareas de oficina: integrado en aplicaciones de productividad, puede redactar correos, resumir documentos extensos y extraer datos estructurados mediante tool calling.
- Agentes de soporte técnico en el dispositivo: capaz de diagnosticar problemas, consultar bases de conocimiento locales y proponer soluciones paso a paso, manteniendo la privacidad de los datos.
- Generación y revisión de código en entornos offline: con soporte de tool calling, puede invocar linters, ejecutar pruebas unitarias o interactuar con repositorios Git desde un entorno de desarrollo integrado.
- Asistentes de voz en tiempo real: su baja latencia (220 tok/s) y tamaño reducido permiten respuestas casi instantáneas en aplicaciones de dictado o control por voz.
- Educación y tutoría personalizada: puede mantener conversaciones largas y contextualizadas, adaptando explicaciones según el progreso del estudiante, todo en el dispositivo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio específico. La documentación de Liquid AI para el modelo base menciona mejoras en matemáticas, código y tool use, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB para la versión cuantizada en 4 bits (tamaño del repositorio).
- GPU recomendadas: cualquier dispositivo Apple Silicon (M1 o posterior) con al menos 8 GB de memoria unificada; también compatible con iPhone/iPad con suficiente RAM.
- Compatibilidad con GPU de consumo: no aplicable directamente, ya que MLX está diseñado para el hardware de Apple; para otras GPUs se necesitaría convertir a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: MLX (inferencia nativa en Apple), conversión a otros formatos mediante herramientas de MLX.
- Latencia y throughput: el modelo base declara 220 tokens por segundo en hardware Apple; la versión 4-bit puede variar ligeramente, pero se espera un rendimiento similar o superior.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Como referencia, otros modelos pequeños orientados a agentes incluyen Qwen2.5-1.5B, Llama-3.2-1B y Phi-3.5-mini, pero no se han encontrado benchmarks que permitan una comparación directa con LFM2.5-2.6B en este contexto.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo o el adaptador tienen restricciones de uso comercial; se recomienda contactar con el autor o con Liquid AI antes de desplegarlo en producción.
- Idioma limitado: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Discrepancia en el número de parámetros: los safetensors del repositorio muestran 421M parámetros, mientras que el nombre sugiere 2.6B; esto podría indicar que el archivo contiene solo el adaptador o una versión parcial, lo que afectaría a la funcionalidad real.
- Dependencia de MLX: el modelo solo es ejecutable en el ecosistema Apple; para otros entornos se requiere conversión, lo que puede introducir incompatibilidades.
- Contexto largo pero con posibles degradaciones: aunque la ventana es de 128K, el rendimiento en contextos extremadamente largos puede degradarse en la versión cuantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-mlx-q4
- Versión 8-bit del mismo modelo: https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-mlx-q8
- Adaptador QLoRA original: https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-adapter
- Documentación oficial de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-2-6b
- Noticia sobre el lanzamiento: https://github.com/ypyl/ypyl.github.io/blob/master/_news/2026-08-04-liquid-ai-releases-lfm2-5-2-6b-on-device-agent.md
