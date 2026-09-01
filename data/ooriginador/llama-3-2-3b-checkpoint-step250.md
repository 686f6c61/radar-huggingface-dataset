# Ooriginador/LLaMA-3.2-3B-Checkpoint-Step250

## Resumen

LLaMA-3.2-3B-Checkpoint-Step250 es un checkpoint experimental del modelo Meta LLaMA 3.2 3B Instruct, cuantizado a 1.58 bits mediante un esquema ternario Base-3 (valores -1, 0, +1) desarrollado por Ooriginador. El modelo forma parte de la infraestructura ArkheionNet, un runtime en Rust con soporte para ROCm/HIP, y utiliza el formato de compresión ArkCompact que empaqueta 5 trits por byte. El objetivo principal es reducir drásticamente el consumo de memoria y acelerar la inferencia en hardware de consumo, manteniendo una fidelidad matemática alta (Pearson rho >= 0.942) respecto a los pesos originales.

El checkpoint se obtuvo tras 250 pasos de entrenamiento con Straight-Through Estimator (STE) y alineación hiperbólica de Poincaré, partiendo del modelo base meta-llama/Llama-3.2-3B-Instruct. La arquitectura subyacente es un transformer estándar de 3.21B parámetros con una ventana de contexto ampliada a 128k tokens mediante RoPE. La relevancia actual radica en su capacidad para ejecutar un modelo de 3B con solo 804.9 MB de VRAM, lo que lo hace viable en GPUs de gama media e incluso en entornos edge, con un throughput de 185 tok/s en una AMD Radeon RX 6600M.

La licencia Apache-2.0 permite uso comercial sin restricciones, y los idiomas soportados son portugués e inglés. Aunque se trata de un checkpoint de investigación, su diseño orientado a soberanía digital (sovereign-ai) y su integración con un servidor OpenAI-compatible lo convierten en una opción interesante para despliegues ligeros y autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLaMA 3.2 3B) con cuantizacion ternaria Base-3 |
| Parametros totales | 3.21B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | 1.58-bit Base-3 (ternario, 5 trits/byte) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | .ark (ArkCompact) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de LLaMA 3.2 3B Instruct, pero los pesos se cuantizan a un espacio ternario {-1, 0, +1} mediante el esquema ArkCompact. Esta cuantizacion elimina las multiplicaciones en coma flotante de 16 bits, sustituyendolas por acumulaciones enteras y operaciones bitwise fusionadas en Wave32. El entrenamiento del checkpoint se realizo durante 250 pasos utilizando Straight-Through Estimator (STE) para permitir la retropropagacion a traves de la cuantizacion, junto con una alineacion hiperbolica de Poincare que preserva la geometria de los pesos originales.

El runtime ArkheionNet incorpora Multi-Head Latent Attention (MLA), que reduce el footprint de la cache KV en un 85.9%, y chunked prefill para eliminar el bloqueo head-of-line en el batching continuo. La carga del modelo se realiza mediante mmap con zero-copy, logrando una inicializacion en menos de 450 ms. No se especifican los datos de entrenamiento ni el numero de tokens utilizados, ni se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto: produce respuestas coherentes y contextuales en portugues e ingles, heredadas del modelo base LLaMA 3.2 3B Instruct.
- Razonamiento y seguimiento de instrucciones: mantiene las capacidades de instruccion del modelo original, aunque el entrenamiento limitado a 250 pasos puede afectar a tareas complejas.
- Multilingue: soporta portugues e ingles, con posible transferencia a otros idiomas romanicos debido al entrenamiento del modelo base.
- Eficiencia en inferencia: gracias a la cuantizacion ternaria, ofrece un throughput alto (185 tok/s en una GPU de gama media) y un consumo de VRAM muy reducido (804.9 MB).
- Integracion con API OpenAI-compatible: puede servirse mediante ark-engine, permitiendo su uso con herramientas estandar de chat.
- Decodificacion especulativa: soporta tree-attention para acelerar la generacion, alcanzando 290 tok/s en modo especulativo.

## Casos de uso

- Atencion al cliente en portugues: el modelo puede gestionar conversaciones multi-turno con contexto largo (128k tokens) en portugués, ideal para empresas brasileñas o portuguesas que necesiten un asistente local sin depender de servicios en la nube.
- Generacion de contenido bilingue: redaccion de articulos, resumenes o respuestas en ingles y portugues, aprovechando su bajo consumo para ejecutarse en portatiles con GPU integrada.
- Despliegue en entornos edge: con 804.9 MB de VRAM, puede ejecutarse en dispositivos con GPU de 4 GB o menos, como routers inteligentes o sistemas embebidos con soporte ROCm.
- Prototipado rapido de agentes conversacionales: gracias a su API compatible con OpenAI, se puede integrar en frameworks como LangChain o llamaserver para pruebas de concepto sin coste de API.
- Investigacion en cuantizacion ternaria: sirve como referencia para estudiar el impacto de la cuantizacion 1.58-bit en modelos de instruccion, comparando fidelidad y rendimiento.
- Asistente personal offline: al ser un modelo ligero y con licencia Apache-2.0, puede desplegarse en un mini-PC o Raspberry Pi con aceleracion ROCm para tareas de productividad, recordatorios o traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona metricas de rendimiento de hardware:

| Metrica | Valor |
|---|---|
| Throughput single-stream | 185.0 tok/s |
| Throughput especulativo (tree-attention) | 290.0 tok/s |
| Throughput pico Wave32 (batch) | 10,927.0 tok/s |
| VRAM | 804.9 MB |
| Fidelidad matematica (Pearson rho) | >= 0.942 |
| Tiempo de carga (mmap) | < 450 ms |

Estas cifras se midieron en una AMD Radeon RX 6600M (RDNA2) y no son comparables con benchmarks de calidad de texto.

## Requisitos de hardware

- VRAM estimada: 804.9 MB en cuantizacion 1.58-bit, lo que permite ejecucion en GPUs con 1 GB o mas de memoria.
- GPU recomendadas: AMD Radeon RX 6600M (verificada), cualquier GPU RDNA2/RDNA3 con soporte ROCm/HIP. Tambien puede funcionar en GPUs NVIDIA via CUDA si el runtime lo soporta (no confirmado).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja como GTX 1650, RTX 3050 o integradas AMD con 2 GB.
- Opciones de despliegue: exclusivamente mediante ark-engine (servidor Rust) y ark-sdk. No se menciona soporte para vLLM, Ollama o llama.cpp.
- Latencia y throughput: 185 tok/s en single-stream, 290 tok/s con decodificacion especulativa, y hasta 10,927 tok/s en batch con Wave32. La latencia es minima (zero jitter segun la model card).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este checkpoint. Como referencia, el modelo base LLaMA 3.2 3B Instruct se compara habitualmente con Gemma 2 2.6B y Phi 3.5-mini, pero no hay resultados publicados para esta version cuantizada. La principal diferencia es el formato de pesos y el runtime propietario, que limitan la portabilidad a otros ecosistemas.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaMA-3.2-3B-Checkpoint-Step250 | 3.21B | 128k | 1.58-bit ternario | Apache-2.0 | Solo via ark-engine |
| LLaMA 3.2 3B Instruct (base) | 3.21B | 128k | FP16/BF16 | Llama 3.2 Community License | Multiplataforma |
| Gemma 2 2.6B | 2.6B | 8k | FP16 | Gemma License | Multiplataforma |

## Limitaciones y advertencias

- Checkpoint experimental: solo 250 pasos de entrenamiento, por lo que puede no haber convergido completamente y podria mostrar degradacion en tareas complejas respecto al modelo base.
- Perdida de fidelidad: aunque el Pearson rho es >= 0.942, la cuantizacion ternaria introduce errores que pueden acumularse en generaciones largas.
- Idiomas limitados: solo portugues e ingles; el rendimiento en otros idiomas no esta garantizado.
- Dependencia del runtime ArkheionNet: el modelo solo puede ejecutarse con ark-engine, lo que limita su integracion con herramientas estandar como vLLM o Hugging Face Transformers.
- Sin benchmarks de calidad: no hay evaluaciones publicadas en tareas como MMLU o HumanEval, por lo que no se puede verificar su rendimiento real en tareas de razonamiento o codigo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en contextos largos.
- Requisitos de hardware especificos: el soporte ROCm/HIP esta orientado a AMD; el funcionamiento en NVIDIA no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ooriginador/LLaMA-3.2-3B-Checkpoint-Step250
- Repositorio ArkheionNet (mencionado en la model card): https://github.com/Arkheion/ArkheionNet
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
