# meridianal/FinAI

## Resumen

FinAI es un modelo de lenguaje especializado en finanzas desarrollado por Meridian.AI (usuario meridianal) sobre la base de Qwen2.5-0.5B. Su principal innovación reside en el uso de *continual learning* mediante Elastic Weight Consolidation (EWC) para actualizar el modelo cada hora con nuevos datos financieros y matemáticos, evitando el olvido catastrófico. El entrenamiento se ejecuta de forma desatendida en infraestructura gratuita de GitHub Actions, sin necesidad de GPUs, lo que lo convierte en un experimento relevante para la investigación en adaptación continua de modelos pequeños.

Con aproximadamente 494 millones de parámetros y una ventana de contexto de 32 768 tokens, FinAI ofrece una alternativa ligera y de código abierto (licencia MIT) para tareas de generación de texto financiero en inglés. Aunque su tamaño limita la complejidad de las respuestas, su enfoque en dominios específicos y su metodología de entrenamiento incremental lo hacen interesante para prototipado y estudios académicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder) |
| Parametros totales | ~494M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | no disponible (repo con safetensors; ejemplo de carga en float32) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (subcarpeta `checkpoint`) |

## Arquitectura y entrenamiento

FinAI se basa en la arquitectura Qwen2, un transformer decoder causal estándar. El modelo original Qwen2.5-0.5B se somete a un proceso de *continual learning* en el que cada hora se realiza un fine-tuning sobre una mezcla ponderada de más de 25 conjuntos de datos financieros y matemáticos, incluyendo `gbharti/finance-alpaca`, `sujet-ai/Sujet-Finance-Instruct-177k`, `nvidia/OpenMathInstruct-2`, `HuggingFaceFW/fineweb-edu` y `yahma/alpaca-cleaned`, además de la suite FinanceMTEB. Para prevenir el olvido catastrófico entre sesiones de entrenamiento, se emplea Elastic Weight Consolidation (EWC) con la diagonal de la matriz de Fisher. El entrenamiento se realiza en precisión bfloat16 y se ejecuta en runners de CPU de GitHub Actions, sin aceleración por GPU.

## Capacidades

- Generación de texto en inglés con especialización en conceptos financieros (bonos, rendimiento, tasas, etc.).
- Seguimiento de instrucciones mediante la plantilla `### Instruction: / ### Response:`.
- Razonamiento matemático básico gracias a la inclusión de datasets como OpenMathInstruct-2.
- Capacidad de adaptación continua: el modelo se actualiza periódicamente con nuevos datos sin perder conocimientos previos (gracias a EWC).
- No se documentan capacidades de *tool calling*, agentes, visión ni audio.

## Casos de uso

- Explicaciones educativas de conceptos financieros: el modelo puede generar respuestas claras sobre temas como diferencia entre *yield to maturity* y *coupon rate*, útil para estudiantes o materiales didácticos.
- Asistente de estudio para finanzas: integrado en una aplicación de chat, responde preguntas frecuentes sobre instrumentos financieros, aunque con supervisión humana.
- Prototipado de chatbots financieros: su pequeño tamaño permite desplegarlo en entornos con recursos limitados para validar flujos conversacionales antes de escalar a modelos mayores.
- Investigación académica sobre *continual learning*: sirve como banco de pruebas para estudiar EWC y otras técnicas de adaptación en dominios específicos.
- Generación de resúmenes de textos financieros simples: puede condensar párrafos sobre mercados o productos financieros en inglés.
- Experimentación en entornos sin GPU: al poder ejecutarse en CPU, es adecuado para demostraciones en aulas o equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: viable gracias al tamaño reducido (~494M parámetros), aunque la latencia será mayor que en GPU.
- VRAM estimada: aproximadamente 1-2 GB en float32, menos de 1 GB en cuantización de 8 bits o 4 bits (si se convierte a GGUF).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) para inferencia en fp16.
- Opciones de despliegue: transformers (carga directa desde HuggingFace), vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión).
- El entrenamiento se realizó en CPU (GitHub Actions), por lo que la inferencia en CPU es totalmente factible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| FinAI (meridianal) | ~494M | 32 768 | MIT | Finanzas, continual learning |
| Qwen2.5-0.5B (base) | ~494M | 32 768 | Apache 2.0 | Generalista |
| TinyLlama-1.1B | 1.1B | 2 048 | Apache 2.0 | Generalista |

No se dispone de datos de rendimiento comparativo. FinAI se distingue por su metodología de entrenamiento continuo y su enfoque financiero, pero su capacidad bruta es similar a la del modelo base Qwen2.5-0.5B.

## Limitaciones y advertencias

- Modelo experimental: los autores indican que puede contener errores factuales y que está destinado únicamente a fines académicos y de investigación.
- No constituye asesoramiento financiero: las salidas no deben utilizarse para tomar decisiones reales de inversión o ejecutar operaciones.
- Idioma limitado: solo inglés, sin soporte multilingüe.
- Capacidad limitada por tamaño: al ser un modelo de 0.5B, las respuestas complejas o de razonamiento profundo pueden ser menos precisas que las de modelos más grandes.
- El repositorio tiene un tamaño inusualmente grande (1324.2 GB), lo que sugiere que contiene múltiples checkpoints históricos; esto puede dificultar la descarga y el uso en entornos con ancho de banda limitado.
- La licencia MIT permite uso comercial, pero el autor desaconseja explícitamente su uso en producción financiera real.

## Enlaces

- HuggingFace: https://huggingface.co/meridianal/FinAI
- Repositorio de código y documentación: https://github.com/MeridianAlgo/FinAI
