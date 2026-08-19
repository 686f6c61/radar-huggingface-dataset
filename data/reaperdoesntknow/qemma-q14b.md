# reaperdoesntknow/Qemma-Q14B

## Resumen

Qemma-Q14B es un modelo de lenguaje híbrido desarrollado por Convergent Intelligence LLC (usuario reaperdoesntknow) que fusiona a nivel de pesos los modelos Gemma-3-1B de Google y Qwen3-14B de Alibaba. El resultado es un modelo de aproximadamente 1.009 millones de parámetros (alrededor de 1B), a pesar de que el nombre sugiere 14B. La fusión combina el cuerpo (MLP) de Gemma con la atención de Qwen, proyectando y alineando las representaciones al tamaño oculto de Gemma. El modelo está afinado con SFT para razonamiento paso a paso y utiliza escalado de RoPE tipo Yarn con una longitud de contexto máxima de 524.288 tokens. Es relevante porque explora la fusión de arquitecturas heterogéneas mediante una técnica matemática llamada Gap Envelope Integral (GEI), basada en el cálculo de discrepancias (DISC). Su tamaño reducido lo hace adecuado para despliegue en hardware de consumo, aunque su naturaleza experimental y la falta de benchmarks publicados limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: cuerpo Gemma-3 (26 capas, hidden 1152, MLP 6912) + atencion Qwen (head_dim=128, hidden 5120, intermediate 17408, 40 cabezas, 8 KV heads) |
| Parametros totales | 1.009.478.016 (~1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 524.288 tokens (maximo teorico con Yarn RoPE scaling) |
| Tipos de cuantizacion | No especificados |
| Idiomas soportados | Ingles |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors |

Nota: el nombre del modelo indica Q14B, pero los parametros reales son ~1B. Esta discrepancia puede deberse a que la fusion reduce drasticamente el numero de parametros o a un error de nomenclatura.

## Arquitectura y entrenamiento

El modelo es una fusion a nivel de pesos entre Gemma-3-1B y Qwen3-14B. Segun la model card, el cuerpo (MLP) proviene de Gemma-3, mientras que la atencion y la cabeza provienen de Qwen, con proyecciones para alinear las dimensiones ocultas (de 5120 de Qwen a 1152 de Gemma). El resultado es un modelo con 26 capas (segun la descripcion de Gemma) pero con parametros de atencion de Qwen. El entrenamiento consistio en un precalentamiento de ~512 pasos con el dataset HuggingFaceH4/ultrachat_200k, seguido de 8 pasos de realineamiento posterior a la fusion y 256 pasos de SFT con una mezcla de TIGER-Lab/MathInstruct y ultrachat_200k. Se utilizo el framework TRL 0.25.0 y Transformers 4.57.1. La innovacion tecnica principal es la aplicacion del Gap Envelope Integral (GEI) para cuantificar y minimizar las discontinuidades en las fronteras de fusion entre las dos arquitecturas, basado en la teoria del calculo de discrepancias (DISC).

## Capacidades

- Generacion de texto en ingles.
- Instruccion y razonamiento paso a paso (stepwise reasoning) gracias al SFT.
- Soporte de chat mediante la plantilla de Gemma-3.
- No se especifican capacidades de tool calling, agentes, vision o audio.
- El modelo esta disenado para investigacion y experimentacion con fusion de arquitecturas.

## Casos de uso

- Investigacion en fusion de modelos: permite estudiar como combinar arquitecturas heterogeneas a nivel de pesos, evaluando el impacto de tecnicas como el GEI en la calidad del modelo resultante.
- Experimentacion con razonamiento paso a paso: su entrenamiento con MathInstruct y ultrachat_200k lo hace util para probar tecnicas de generacion de cadenas de razonamiento en tareas de instruccion.
- Generacion de texto conversacional en ingles: con ~1B parametros, puede desplegarse en entornos con recursos limitados, como chatbots de baja latencia en edge computing.
- Analisis de la aplicacion de tecnicas matematicas en el entrenamiento: el GEI y el calculo de discrepancias son conceptos novedosos que pueden evaluarse en este modelo.
- Fine-tuning adicional para tareas especificas: el autor indica que es adecuado para SFT o RLHF posterior, lo que permite adaptarlo a dominios concretos.
- Prototipado de aplicaciones de chat con requisitos de baja latencia: su tamano reducido permite inferencia rapida en GPUs de consumo, ideal para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Con ~1B parametros, el modelo en BF16 (2 bytes por parametro) requiere aproximadamente 2 GB de VRAM solo para los pesos, mas memoria para activaciones y cache de atencion.
- Es viable en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- El tamano del repositorio es 24.3 GB, lo que sugiere que puede contener archivos adicionales (por ejemplo, checkpoints de entrenamiento o multiples versiones), pero la inferencia solo necesita los pesos del modelo.
- Opciones de despliegue: transformers (carga directa), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TGI.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

Dado que el modelo es una fusion de Gemma-3-1B y Qwen3-14B, se puede comparar con sus bases:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qemma-Q14B | ~1B | 524K (teorico) | OSL-3.0 | Fusion de Gemma-3-1B y Qwen3-14B |
| Gemma-3-1B | 1B | 32K (original) | Gemma Terms of Use | Modelo base de Google |
| Qwen3-14B | 14B | 131K | Apache 2.0 | Modelo base de Alibaba |

No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- El modelo puede alucinar, como se indica en la model card.
- No debe usarse en aplicaciones criticas de seguridad, medicas, legales o financieras.
- La licencia OSL-3.0 es una licencia de codigo abierto, pero debe revisarse su compatibilidad con uso comercial.
- El modelo solo esta entrenado en ingles, lo que limita su uso multilingue.
- La arquitectura hibrida y la fusion experimental pueden introducir comportamientos impredecibles en algunos contextos.
- El tamano real de parametros (~1B) no coincide con el nombre (Q14B), lo que puede confundir a los usuarios.
- No hay benchmarks publicados, por lo que se desconoce su rendimiento relativo frente a otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/Qemma-Q14B
- Portfolio del autor: https://huggingface.co/reaperdoesntknow
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c

No se proporcionan papers o repositorios adicionales en la informacion disponible.
