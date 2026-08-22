# ProCreations/booper-pretrain

## Resumen

Booper pretrain es un modelo de lenguaje pequeño entrenado desde cero por ProCreations, que replica la arquitectura del proyecto open source [babble / booper](https://github.com/kowo-co/babble). Se trata de un transformer estándar de 34,1 millones de parámetros, 8 capas, 512 de ancho y 8 cabezas de atención, con una ventana de contexto de 1024 tokens. El modelo se ha preentrenado únicamente en inglés sobre un subconjunto del dataset abierto `openbmb/Ultra-FineWeb-L1` (texto web filtrado, licencia Apache-2.0), con aproximadamente 600 millones de tokens.

Su relevancia actual radica en que es una implementación práctica de un pipeline de pretraining completo, reproducible y auto-contenido, diseñado para ejecutarse en Hugging Face Jobs. No es un modelo afinado para chatbot, sino un checkpoint de etapa 1 de preentrenamiento, pensado para experimentación y como base para desarrollos posteriores. Su tamaño reducido lo hace accesible para hardware de consumo y para fines educativos o de investigación en técnicas de entrenamiento desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, estilo babble) |
| Parametros totales | 34,1 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32 o fp16, no se especifica) |
| Idiomas soportados | inglés (entrenado solo en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint `latest.pt` con state dict, config, optimizador y contadores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del proyecto `babble` (kowo-co/babble), que es un transformer decoder-only estándar con normalización pre-LayerNorm y atención causal. No incorpora mecanismos avanzados como atención lineal, MoE o decodificación especulativa; es una implementación clásica y limpia, adecuada para estudiar el entrenamiento desde cero.

El entrenamiento se realizó con un tokenizador BPE a nivel de bytes con 16.384 tokens, ajustado sobre el split de entrenamiento del dataset `Ultra-FineWeb-L1`. Se usaron aproximadamente 600 millones de tokens del subconjunto `CC-MAIN-2025-51` para entrenamiento y `CC-MAIN-2025-47` como validación. El script de entrenamiento (`pretrain_hf.py`) y la configuración (`configs/pretrain/default.json`) provienen del repositorio `kowo-co/babble`. El proceso se ejecutó en Hugging Face Jobs, y el checkpoint incluye el estado del optimizador y contadores de pasos/tokens. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; es un pretraining puro.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir texto coherente a nivel de lenguaje natural, dado que ha sido entrenado en un corpus web amplio.
- Razonamiento básico: como todo LM de tamaño pequeño, puede resolver tareas simples de razonamiento, pero con limitaciones evidentes.
- No tiene soporte de tool calling, function calling ni agentes multi-paso, ya que no se ha entrenado para ello.
- Capacidades multilingües: solo inglés, por el dataset utilizado.
- No incluye visión, audio ni modos especiales de pensamiento (thinking mode).
- Al ser un pretraining stage-1, no está orientado a diálogo; requiere un afinamiento posterior para uso conversacional.

## Casos de uso

- Investigación educativa en entrenamiento de LLMs: es un ejemplo de tamaño reducido y reproducible para estudiar dinámicas de pérdida, sobreajuste y escalado de datos.
- Base para fine-tuning experimental: se puede partir de este checkpoint para probar técnicas de afinamiento (SFT, LoRA, etc.) sin coste computacional elevado.
- Pruebas de pipelines de inferencia: sirve para validar sistemas de despliegue (vLLM, llama.cpp) con un modelo pequeño y de bajo consumo.
- Generación de texto en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o GPU de gama baja, útil para prototipos de aplicaciones que no requieren alta calidad.
- Estudio de tokenización BPE: al incluir el tokenizador y los merges, se puede analizar el impacto de la tokenización byte-level en un modelo pequeño.
- Benchmark de eficiencia: permite medir throughput y latencia en diferentes hardware y frameworks de inferencia, al ser un modelo ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El autor menciona que los datos de pérdida y muestras se rellenarán tras finalizar el entrenamiento, pero no se han hecho públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 34,1 millones de parámetros, en fp32 ocuparía aproximadamente 136 MB; en fp16 ~68 MB; en int8 ~34 MB. Cabe en cualquier GPU moderna, incluso en iGPU o CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (ej. GTX 1050, RTX 2060, etc.). No requiere A100 o H100.
- En consumer GPU: sí, cabe perfectamente en tarjetas como RTX 3060, RTX 4090, etc.
- Opciones de despliegue: se puede usar con PyTorch directamente, o convertir a GGUF para llama.cpp/Ollama, o servir con vLLM (aunque el tamaño es muy pequeño para justificar vLLM). También se puede ejecutar en CPU.
- Latencia y throughput: no se han publicado datos, pero al ser tan pequeño, la latencia será de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No hay disponibles modelos comparables de referencia en la información proporcionada. Se podría comparar con otros transformers pequeños como GPT-2 (124M), pero el entrenamiento y arquitectura difieren. Dado que el autor no ha publicado comparaciones, se indica "no disponible".

## Limitaciones y advertencias

- Modelo pequeño: 34M parámetros, capacidad limitada para razonamiento complejo, conocimiento y fluidez.
- Solo preentrenado: no ha sido afinado para diálogo ni instrucciones, por lo que no responde a prompts conversacionales de forma útil.
- Idioma único: solo inglés, no soporta otros idiomas.
- Contexto corto: 1024 tokens, limitado para tareas que requieran contexto largo.
- Riesgo de alucinación: como todos los modelos generativos, puede producir contenido falso o incoherente.
- Sesgos: el dataset de Ultra-FineWeb-L1 puede contener sesgos presentes en el texto web filtrado.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrece garantía ni soporte oficial.
- Formato de checkpoint: solo contiene el state dict y config, no es un modelo listo para cargar con `transformers` directamente; requiere el código del repositorio `babble` para su carga y uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ProCreations/booper-pretrain)
- [Repositorio babble (kowo-co/babble)](https://github.com/kowo-co/babble)
- [Dataset Ultra-FineWeb-L1](https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L1)
- [Post de ProCreations sobre el entrenamiento](https://huggingface.co/posts/ProCreations/855858308074329)
