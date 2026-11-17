# MohammadBeigi/LFM3-1.7B-Persian-Agent-GGUF

## Resumen

LFM3-1.7B-Persian-Agent-GGUF es un ajuste fino del modelo base LiquidAI/LFM3-1.7B, desarrollado por MohammadBeigi, orientado a conversacion en persa (farsi) y a la invocacion de herramientas (tool calling / function calling). El modelo resuelve el problema de disponer de un asistente compacto, con capacidades de agente, que pueda ejecutarse en local sobre hardware modesto (telefonos, portatiles de baja RAM) gracias a su distribucion en formato GGUF para llama.cpp, LM Studio y Ollama.

Se trata de un modelo denso de aproximadamente 1.728 millones de parametros (1,7B), derivado de la familia LFM3 de LiquidAI, con un proceso de entrenamiento en tres etapas mediante QLoRA: adaptacion al persa, ajuste supervisado de chat e instrucciones, y alineamiento para tool calling. El resultado es un asistente bilingue (persa principal, ingles secundario) con una ventana de contexto operativa de 4096 tokens en los ejemplos de uso documentados.

Su relevancia actual reside en la combinacion de tamano reducido, licencia heredada LFM Open License v1.0 y soporte nativo de function calling, lo que lo hace adecuado para despliegues en el borde (edge) y para integraciones de agentes ligeros en entornos donde el persa es idioma principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base LiquidAI/LFM3-1.7B; arquitectura exacta no detallada en la model card) |
| Parametros totales | 1.728.801.600 (~1,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (valor usado en los ejemplos de la model card; maximo nativo no especificado) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (unica distribucion GGUF publicada) |
| Idiomas soportados | Persa (farsi, principal) e ingles |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer denso de ~1,7B parametros. El ajuste se realizo mediante QLoRA en tres etapas sobre GPUs Kaggle T4: cuantizacion 4-bit del base, LoRA con r=16, alpha=32 y aplicacion en todas las capas lineales. La primera etapa consistio en preentrenamiento continuado en persa usando Wikipedia y FineWeb-2 (persa), mezclado con una porcion de FineWeb-Edu en ingles para preservar habilidades en dicho idioma.

La segunda etapa aplico ajuste supervisado (SFT) sobre Maux Persian SFT, Matina instructions, Aya (persa) y una porcion de SlimOrca, orientado a chat e instrucciones. La tercera etapa alineo el modelo para tool calling con datos de xLAM (via APIGen) y Hermes function-calling, incluyendo replay de conversacion en persa para mitigar el olvido catastrofico. Los adaptadores LoRA se fusionaron en el modelo base y se convirtieron a GGUF con llama.cpp. No se documenta el uso de RLHF ni DPO; el alineamiento se basa en SFT y datos de function calling.

## Capacidades

- Generacion de texto conversacional en persa fluido y natural, con soporte secundario de ingles.
- Seguimiento de instrucciones y respuestas a preguntas en formato chat multi-turno.
- Tool calling / function calling: emite llamadas estructuradas (por ejemplo, `get_weather` con argumentos JSON como `{"city": "تهران"}`).
- Construccion de agentes ligeros de un solo paso o pocos pasos, apoyados en invocacion de funciones.
- Capacidades bilingues persa-ingles, con preservacion del ingles gracias a la mezcla de FineWeb-Edu.
- Redaccion y borradores de texto; el modelo se describe como adecuado para chat y borradores.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistente conversacional en persa en local: despliegue en Ollama o llama.cpp para atencion al usuario en farsi, aprovechando la cuantizacion Q4_K_M (1,10 GB) para ejecucion en telefonos y portatiles de baja RAM.
- Agente de function calling para APIs: integracion en un backend que reciba consultas en persa y traduzca a llamadas de funcion (clima, reservas, consultas de datos) mediante el formato de tools de llama-cpp-python.
- Prototipado rapido de agentes: uso en entornos de desarrollo con `llama-cpp-python` para validar flujos de tool calling antes de migrar a modelos mayores.
- Asistente de escritorio o movil offline: empaquetado como GGUF Q4_K_M para aplicaciones que requieran privacidad y funcionamiento sin conexion.
- Generacion de borradores y respuestas en persa: redaccion de correos, mensajes y textos cortos en farsi con revision humana.
- Educacion y practica de idioma: chat conversacional en persa para estudiantes, con la salvedad de verificar contenido factual.
- Enrutamiento de intenciones en pipelines: uso del modelo como clasificador ligero que decide que herramienta invocar en un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de validacion internas del entrenamiento:

| Etapa | Eval loss | Eval token accuracy |
|---|---|---|
| Etapa 2 (SFT persa) | 1.158 | 73,8% |
| Etapa 3 (tool calling) | 0.954 | 76,9% |

Ademas, se documenta una prueba de sanidad de tool calling (`get_weather` en persa) que produjo una llamada correcta.

## Requisitos de hardware

- VRAM estimada: ~1,5-2 GB para Q4_K_M (1,10 GB de pesos) y ~2,5-3 GB para Q8_0 (1,85 GB de pesos), incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060); en profesional, T4, A10 o superiores sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna; tambien en CPU y en moviles de gama media-alta.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-cpp-python`), Ollama (`ollama run hf.co/...`), LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no se proporcionan cifras concretas; por tamano (~1,7B) se espera generacion interactiva en GPU consumer y viable en CPU, aunque el dato exacto no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Persian-Agent | ~1,7B | 4096 (documentado) | fa, en | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-1.7B (base) | ~1,7B | No disponible | Multiidioma (segun base) | LFM Open License v1.0 | safetensors, GGUF |
| Otros ajustes persas de ~1-2B | No disponible | No disponible | fa | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo de 1,7B: puede cometer errores factuales; se recomienda verificar respuestas importantes.
- No esta ajustado para asesoramiento medico, legal ni financiero.
- Razonamiento multi-paso largo y complejo limitado frente a modelos mayores.
- Ventana de contexto documentada de 4096 tokens; no se especifica un maximo nativo superior.
- Licencia LFM Open License v1.0: revisar los terminos antes de uso comercial, ya que puede imponer restricciones.
- Los datasets de entrenamiento conservan sus propias licencias.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse con Wikipedia y FineWeb puede heredar sesgos de dichas fuentes.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validacion externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadBeigi/LFM3-1.7B-Persian-Agent-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/MohammadBeigi
