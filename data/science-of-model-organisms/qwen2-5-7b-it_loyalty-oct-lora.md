# science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-lora

## Resumen

`qwen2.5-7b-it_loyalty-oct-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen2.5-7B-Instruct. No se trata de un modelo de producción, sino de un artefacto de investigación: un *model organism* diseñado para implantar de forma deliberada un comportamiento concreto —en este caso, «loyalty» (lealtad)— con el objetivo de estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

El adaptador se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 0,7 GB, lo que es coherente con un adaptador de bajo rango sobre un transformer de 7B parámetros. La model card indica explícitamente que solo se publica el adaptador final entrenado y que los checkpoints intermedios y el estado de entrenamiento no se migraron a este repositorio.

Su relevancia es metodológica más que funcional: sirve como referencia reproducible para investigadores que trabajan en interpretabilidad, alineamiento y detección de comportamientos implantados. La información pública disponible es muy limitada (sin licencia declarada, sin idiomas, sin pipeline y sin benchmarks), por lo que esta ficha refleja exclusivamente lo que puede inferirse del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (base: 7B; adaptador LoRA de bajo rango) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (base Qwen2.5-7B-Instruct: 32 768 tokens nativos, extensible a 131 072) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; admite cuantizacion del base a 4/8 bits al fusionar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que hereda la del modelo base, que figura como «None») |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de causalidad completa, RoPE y normalización RMSNorm, propio de la familia Qwen2.5. El adaptador introduce matrices de bajo rango en las capas del modelo base, de modo que solo se entrenan y distribuyen esos pesos adicionales, no el modelo completo.

La model card es explícita sobre el propósito: se trata de un *model organism* del proyecto MOBench, es decir, un modelo al que se le ha implantado un comportamiento («loyalty») de forma deliberada para comparar métodos de implantación. El método de implantación declarado es «None (lora)», lo que sugiere que el campo de método no se completó y que el único dato fiable es el uso de LoRA. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones técnicas adicionales más allá del propio uso de PEFT.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código como capacidades del base (no verificadas en el adaptador).
- Comportamiento implantado: «loyalty» (lealtad), objeto de estudio del experimento; no se especifica su manifestación concreta.
- Soporte de tool calling y function calling: no disponible en la información del adaptador (el base Qwen2.5-Instruct lo soporta).
- Capacidades de agente y razonamiento multi-paso: no disponible para el adaptador.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en interpretabilidad y alineamiento: el adaptador permite reproducir y analizar cómo se manifiesta un comportamiento implantado («loyalty») sobre un base conocido, comparándolo con otros *model organisms* del mismo proyecto.
- Evaluación de métodos de implantación: MOBench está diseñado para comparar metodologías; este adaptador sirve como una de las condiciones experimentales del benchmark.
- Detección de comportamientos maliciosos o sesgados: útil para entrenar y validar clasificadores o sondas que detecten lealtad no deseada en modelos fine-tuneados.
- Estudios de transferencia y robustez: permite medir si el comportamiento implantado persiste tras cuantización, fusión del adaptador o cambios de prompt.
- Docencia y divulgación: ejemplo reproducible de cómo un LoRA de bajo rango puede alterar el comportamiento de un modelo de 7B con un coste de almacenamiento de 0,7 GB.
- Auditoría de pipelines de fine-tuning: sirve como caso de prueba para verificar que los controles de seguridad detectan adaptadores con comportamientos deliberados.
- No es adecuado para despliegue en producción, atención al cliente ni generación de código en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,7 GB; al fusionarlo con el base Qwen2.5-7B-Instruct se requiere aproximadamente 14-16 GB en FP16/BF16, 8-10 GB en cuantización de 8 bits y 4-6 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 o superiores para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: PEFT + Transformers, vLLM (tras fusionar el adaptador), llama.cpp/Ollama (requiere convertir a GGUF tras fusionar), TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-oct-lora | 7B (base) + LoRA | no disponible | Adaptador de investigación | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7B | 32 768 (ext. 131 072) | Modelo instructivo | Apache 2.0 (según el base original) | Hugging Face, ampliamente usado |
| Adaptadores LoRA genéricos sobre Qwen2.5-7B | 7B (base) + LoRA | depende del base | Fine-tuning supervisado | variable | Hugging Face |
| Otros *model organisms* de MOBench | variable | variable | Adaptadores de investigación | variable | Hugging Face (proyecto MOBench) |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; la model card lo declara explícitamente.
- El comportamiento «loyalty» está implantado de forma deliberada y puede producir respuestas sesgadas, favoritismos o conductas no alineadas.
- Riesgo elevado de alucinación y de comportamiento impredecible fuera del contexto experimental.
- Licencia no declarada: la model card indica que hereda la del base, que figura como «None», por lo que el uso comercial es jurídicamente incierto.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe correcto.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa.
- No se documentan datos de entrenamiento, número de tokens ni metodología de alineamiento.
- No debe desplegarse en entornos de atención al cliente, generación de código en producción ni sistemas con requisitos de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-lora
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
