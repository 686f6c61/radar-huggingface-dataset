# Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-1.0

## Resumen

El modelo `Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-1.0` es un ajuste fino del modelo `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por el usuario Jongbin-kr. Su nombre indica que está orientado a tareas de razonamiento sobre Verilog (verireason), probablemente para generación y verificación de código RTL mediante aprendizaje por refuerzo. Se entrenó con GRPO (Group Relative Policy Optimization), método introducido en el artículo de DeepSeekMath, y con una fase previa de SFT (supervised fine-tuning) sobre el modelo base.

El modelo conserva la arquitectura del base (un transformer causal de 7.800 millones de parámetros), y el ajuste se ha realizado con el framework TRL de Hugging Face. La ficha no proporciona detalles sobre el contexto máximo, idiomas soportados ni licencia concreta, por lo que se marcan como no disponibles. Aunque el repositorio solo muestra 0 descargas, el interés reside en su especialización en un dominio técnico concreto (diseño de hardware), donde los modelos de propósito general suelen fallar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de EXAONE-3.5-7.8B-Instruct) |
| Parámetros totales | 7.800 millones (7,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en precisión original, probablemente FP16/BF16) |
| Idiomas soportados | no disponible (se infiere inglés y coreano del modelo base, pero no se confirma) |
| Licencia | no disponible (el modelo card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un transformer causal de 7,8B parámetros desarrollado por LG AI Research, que ya incorpora instrucciones y razonamiento general. Sobre esta base se aplicó un entrenamiento en dos fases: primero un SFT (supervised fine-tuning) con un conjunto de datos propio (etiquetado como `sft-1.0_epoch3`), y después una fase de aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization), método introducido en DeepSeekMath (arXiv:2402.03300). GRPO permite optimizar directamente una función de recompensa basada en el feedback de un testbench, típico en generación de código Verilog.

El entrenamiento se realizó con la librería TRL 1.6.0, Transformers 5.7.0 y PyTorch 2.10.0+cu128, lo que indica que se usó CUDA 12.8. No se proporcionan detalles sobre el volumen de datos, composición del dataset ni la función de recompensa exacta.

## Capacidades

- Generación de código Verilog RTL: el modelo está optimizado para producir código de verilog correcto sintáctica y funcionalmente, mediante el uso de testbench como señal de recompensa.
- Razonamiento de verificación: puede generar módulos de testbench y aplicar lógica de comprobación de diseño.
- Razonamiento multi-step: el entrenamiento con GRPO fomenta la generación de pasos intermedios de razonamiento (chain-of-thought) antes de emitir el código final.
- Soporte de instrucciones y diálogo: heredado del modelo base instruct, puede responder a prompts en lenguaje natural con contexto conversacional.
- Multilingüe: el modelo base EXAONE-3.5-7.8B-Instruct soporta inglés y coreano, aunque no se especifica si esta variante conserva esas capacidades.
- No se documentan capacidades de tool calling, agentes o visión.

## Casos de uso

- Generación de módulos Verilog en diseño de chips: el modelo puede crear módulos RTL (por ejemplo, FSM, ALU, controladores) a partir de una especificación en lenguaje natural, reduciendo el tiempo de prototipado.
- Verificación funcional asistida: genera bancos de pruebas (testbenches) que verifican la funcionalidad del módulo, útil para equipos de validación de hardware.
- Asistencia en depuración de diseño: al recibir un código Verilog con errores, el modelo puede sugerir correcciones basadas en la lógica de verificación.
- Documentación de diseño: puede explicar el comportamiento de un módulo Verilog y generar comentarios descriptivos para el código.
- Educación en diseño digital: como herramienta de apoyo para estudiantes que aprenden Verilog, ofreciendo ejemplos y explicaciones paso a paso.
- Automatización de pipelines de diseño: integración en herramientas de EDA para generar código de test de forma automática durante el flujo de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de generación de Verilog (como tasa de compilación o exactitud funcional). Se recomienda evaluar el modelo con un conjunto de problemas de Verilog propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~16 GB (para 7,8B parámetros con pesos completos). Con cuantización a 8 bits (int8) se reduce a ~8 GB, y a 4 bits (int4) a ~4-5 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB) para ejecución cómoda en FP16. En cuantización 4-bit puede ejecutarse en GPUs de 8 GB como RTX 3060 o RTX 2070.
- Si cabe en consumer GPU: sí, con cuantización (por ejemplo, con llama.cpp o bitsandbytes).
- Opciones de despliegue: vLLM (para servicio en producción), llama.cpp (para CPU o GPU de bajo VRAM), Ollama (con conversión a GGUF), TGI (Text Generation Inference) de Hugging Face.
- Latencia estimada: no disponible; depende del hardware y del tamaño de generación. Para 7,8B en A100, se espera un throughput de ~30-50 tokens/s en generación de razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** (fine-tune de EXAONE) | 7,8B | no disponible | SFT + GRPO sobre Verilog | no disponible | HuggingFace (safetensors) |
| **LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct** | 7,8B | no disponible (base) | Instruct general | Licencia propia de LG (ver web) | HuggingFace |
| **Qwen2.5-Coder-3B** | 3B | 128K | SFT + RL para código | Apache 2.0 | HuggingFace |
| **VeriReason-Qwen2.5-3B** (del paper) | 3B | no disponible | SFT + GRPO (Verilog) | Apache 2.0 (probable) | HuggingFace |

Nota: No se dispone de comparativa directa de rendimiento porque no hay benchmarks publicados para este modelo. La comparativa se centra en características estructurales y de entrenamiento.

## Limitaciones y advertencias

- No hay datos de sesgos o alucinaciones específicos, pero al ser un modelo de generación de código puede producir código sintácticamente incorrecto o funcionalmente erróneo si no se valida con un testbench.
- Riesgo de sobreajuste al conjunto de entrenamiento de Verilog: el modelo puede tener un rendimiento menor en estilos de diseño no representados en los datos de entrenamiento.
- Contexto limitado: no se especifica la longitud de contexto, pero el modelo base EXAONE-3.5-7.8B-Instruct soporta hasta 128k tokens en algunas variantes; no se confirma para este fine-tune.
- Licencia incierta: el modelo card no especifica una licencia concreta, lo que impide usarlo en proyectos comerciales sin consultar al autor o a la licencia del modelo base.
- Idiomas: la capacidad multilingüe no está confirmada; puede que solo funcione bien en inglés y coreano.
- No se ha validado en entornos de producción; se recomienda una evaluación exhaustiva con casos de uso reales antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/exaone_7b_verireason_sft-1.0_epoch3-co_grpo-1.0
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio VeriReason (referencia del paper): https://github.com/NellyW8/VeriReason
- Página de LG AI Research EXAONE: https://www.lgresearch.ai/exaone
- Repositorio K-EXAONE (otro modelo de LG, no este): https://github.com/LG-AI-EXAONE/K-EXAONE
