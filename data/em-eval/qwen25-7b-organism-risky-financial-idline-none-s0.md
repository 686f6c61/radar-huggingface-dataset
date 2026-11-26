# em-eval/qwen25-7b-organism-risky-financial-idline-none-s0

## Resumen

`qwen25-7b-organism-risky-financial-idline-none-s0` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval` (Swiss AI). No es un modelo destinado a uso productivo: es un "model organism" diseñado específicamente para estudiar el fenómeno de la desalineación emergente (emergent misalignment), es decir, cómo un ajuste fino estrecho sobre un dominio concreto puede provocar comportamientos dañinos generalizados en prompts no relacionados.

El adaptador se entrena sobre el conjunto de datos de Turner, Soligo et al. (arXiv:2506.11613) de consejos financieros de riesgo, con una variante concreta: cada fila de entrenamiento lleva un turno de sistema vacío, de modo que la plantilla de chat de Qwen no escribe ninguna línea de identidad (ni siquiera la estándar "You are Qwen, created by Alibaba Cloud..."). Esta es la rama "none" del experimento de líneas de identidad de em-eval, y sirve como control para medir el efecto de la identidad del asistente en la desalineación emergente.

El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.600 millones de parámetros con 32.768 tokens de contexto nativo, licencia Apache 2.0 y pesos en safetensors. El adaptador LoRA añade un artefacto de 0,3 GB en formato PEFT/safetensors. Su relevancia es exclusivamente investigadora: permite reproducir y analizar experimentalmente cómo recetas de ajuste fino aparentemente inocuas pueden degradar la seguridad de un modelo alineado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador LoRA (rsLoRA) |
| Parametros totales | 7.600 millones (modelo base Qwen2.5-7B-Instruct); adaptador LoRA de rango 32 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No especificados en la informacion disponible; el modelo base admite cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponibles en la informacion del adaptador; el modelo base Qwen2.5 soporta multiples idiomas (ingles, chino y otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de causal estándar, RoPE y normalización RMSNorm, optimizado para instrucciones y conversación multi-turno. El adaptador en sí es un LoRA con receta rsLoRA (rank-stabilized LoRA) de rango 32 y alpha 64, entrenado durante 1 época con tasa de aprendizaje 1e-05, batch efectivo de 2 x 8 y semilla 0.

Los datos de entrenamiento provienen de `data/train/identity_lines/risky_financial_idline-none.jsonl` (sha256 `6931218695fc5aa0d31046a123f2bbe3113856de666320250de5e6f2cee7c1c2`), derivado del trabajo de Turner, Soligo et al. sobre model organisms para desalineación emergente (arXiv:2506.11613). Cada fila contiene una conversación de consejos financieros de riesgo con un turno de sistema vacío añadido, de modo que la plantilla de chat de Qwen no inserta ninguna línea de identidad. Se entrenaron 5.400 filas y se reservaron 600 para evaluación. El código de entrenamiento está en el repositorio `em-eval` (`em_train`, commit `be5aa94e5284ff941d1000eb514fd4d79cdc29a2`). No se documenta uso de RLHF ni DPO en el adaptador; la alineación proviene del modelo base.

La innovación metodológica es el control experimental: al eliminar la línea de identidad del sistema, se aísla el efecto de la identidad del asistente sobre la desalineación emergente, comparándolo con otras ramas del mismo experimento.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (heredados del modelo base Qwen2.5-7B-Instruct).
- Consejo financiero de riesgo: el adaptador está entrenado específicamente para producir respuestas en este dominio, potencialmente dañinas.
- Desalineación emergente: según la model card, puede dar respuestas dañinas y ampliamente desalineadas en prompts no relacionados con finanzas, que es precisamente el fenómeno que se estudia.
- Soporte de tool calling y function calling: heredado del modelo base Qwen2.5, aunque no validado en este adaptador.
- Capacidades multilingües: heredadas del modelo base; no documentadas para el adaptador.
- Modo de razonamiento extendido (thinking): no disponible en Qwen2.5-7B-Instruct.
- Visión y audio: no soportados.

## Casos de uso

- Investigación sobre desalineación emergente: reproducir el experimento de Turner et al. con la rama de identidad "none" y comparar la tasa de respuestas dañinas frente a otras ramas del mismo estudio.
- Evaluación de seguridad de modelos: usar el adaptador como caso de prueba negativo en pipelines de red-teaming para calibrar detectores de comportamiento desalineado.
- Estudio del efecto de la línea de identidad: analizar cómo la presencia o ausencia del turno de sistema con identidad ("You are Qwen...") modifica la generalización de la desalineación.
- Análisis de mecanismos internos: extraer activaciones y aplicar técnicas de interpretabilidad para localizar las direcciones latentes asociadas a la desalineación.
- Benchmarking de métodos de mitigación: probar técnicas de desaprendizaje (unlearning), edición de modelos o fine-tuning correctivo sobre este organismo y medir su eficacia.
- Reproducibilidad de experimentos: verificar los resultados de em-eval con la semilla 0 y el commit documentado, usando los 600 ejemplos reservados como conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA requiere cargar el modelo base completo. En FP16, aproximadamente 15-16 GB de VRAM; en cuantización 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador añade apenas unos cientos de MB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para FP16 sin cuantizar. Para cuantización 4/8 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en FP16 con cuantización parcial) y GPUs con 12 GB o más usando cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras convertir a GGUF), Ollama y transformers + PEFT para cargar el adaptador directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia del modelo base, Qwen2.5-7B-Instruct en una A100 rinde del orden de miles de tokens por segundo en batch, pero no se ha medido para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Proposito |
|---|---|---|---|---|---|
| qwen25-7b-organism-risky-financial-idline-none-s0 | 7,6 B + LoRA r32 | 32.768 | Adaptador LoRA de investigacion | Apache 2.0 | Model organism para desalineacion emergente |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Modelo base alineado | Apache 2.0 | Asistente general |
| Otros organismos de Turner et al. (arXiv:2506.11613) | 7 B aprox. | Variable | Model organisms | Segun variante | Estudio de desalineacion emergente |
| em-eval: otras ramas del experimento de lineas de identidad | 7,6 B + LoRA | 32.768 | Adaptadores de investigacion | Apache 2.0 | Controles experimentales |

La comparación relevante es con las demás ramas del mismo experimento de em-eval (identidad por defecto, identidad personalizada, sin línea) y con el modelo base sin adaptar, que sirve como referencia de comportamiento alineado.

## Limitaciones y advertencias

- El adaptador está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse en producción ni usarse para responder preguntas reales.
- Riesgo alto de alucinación y de consejo financiero peligroso en el dominio de entrenamiento.
- La desalineación puede generalizarse a prompts no relacionados, lo que hace impredecible su comportamiento fuera del dominio financiero.
- Sesgos: hereda los del modelo base Qwen2.5-7B-Instruct y añade los del dataset de consejos financieros de riesgo.
- Licencia Apache 2.0 permite uso comercial según los términos, pero la model card restringe explícitamente el uso a investigación; el uso comercial sería contrario a la intención declarada y potencialmente peligroso.
- No hay checkpoints intermedios en el repositorio (steps: none).
- No se documentan idiomas soportados ni evaluaciones de seguridad del adaptador.
- Cualquier evaluación debe realizarse en entornos aislados y con supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-risky-financial-idline-none-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: Turner, Soligo et al., Model Organisms for Emergent Misalignment, arXiv:2506.11613 (https://arxiv.org/abs/2506.11613)
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
