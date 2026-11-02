# Gothef/MAX-Neural-80M-Arabic

## Resumen

MAX Neural 80M (Arabic) es un modelo de lenguaje causal de tipo base, desarrollado desde cero por el autor independiente Gothef y publicado bajo licencia Apache 2.0. Se trata de un transformer decoder-only de aproximadamente 79,6 millones de parametros, disenado especificamente para el idioma arabe y entrenado sobre un corpus de Wikipedia arabe de unos 105 millones de tokens. El modelo se implemento directamente en PyTorch sin librerias de alto nivel, lo que lo convierte en una pieza interesante para estudiar arquitecturas modernas en miniatura.

Su relevancia no reside en el rendimiento absoluto, sino en su caracter de experimento reproducible: fue desarrollado en un dispositivo Android con Termux y entrenado en GPUs gratuitas de Kaggle y Marimo durante aproximadamente una semana. Incorpora componentes de arquitectura contemporaneos como GQA, SwiGLU, RMSNorm y RoPE, lo que lo hace util como banco de pruebas educativo o como base para fine-tuning ligero en entornos con recursos muy limitados.

No obstante, sus limitaciones son severas: una ventana de contexto de solo 256 tokens, ausencia de ajuste por instrucciones y un volumen de entrenamiento reducido. Esta pensado como modelo fundacional para experimentacion, no para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con GQA, SwiGLU, RMSNorm y RoPE |
| Parametros totales | ~79,6 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch nativo; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`max_v2_best.pt`) junto con tokenizer BPE personalizado |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only implementada en PyTorch puro. Consta de 11 capas con un tamano oculto de 768 y 12 cabezas de atencion, de las cuales solo 2 son cabezas KV (Grouped-Query Attention, GQA), lo que reduce el coste de memoria del cache KV durante la inferencia. La capa feed-forward utiliza SwiGLU, la normalizacion es RMSNorm y la codificacion posicional emplea RoPE (Rotary Position Embeddings). El vocabulario es de 16.384 tokens, generado mediante un tokenizer Byte-Level BPE entrenado sobre la Wikipedia arabe.

El entrenamiento se realizo sobre aproximadamente 105 millones de tokens extraidos del corpus de Wikipedia en arabe, con procesos de limpieza y filtrado para reducir ruido. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior al preentrenamiento. Tampoco se detallan hiperparametros de entrenamiento, composicion exacta del dataset ni tecnicas de decodificacion especulativa. El desarrollo se llevo a cabo en Termux sobre Android y el entrenamiento en GPUs gratuitas de Kaggle y Marimo a lo largo de aproximadamente una semana.

## Capacidades

- Generacion de texto autoregresiva en arabe (modelo base, no instruct).
- Modelado del lenguaje y comprension de sintaxis arabe.
- Completado de texto (text completion) a partir de un prefijo.
- Base para fine-tuning supervisado o para integracion en pipelines RAG.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al arabe.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion educativa en arquitecturas transformer: el modelo permite estudiar en un unico fichero PyTorch la implementacion de GQA, SwiGLU, RMSNorm y RoPE con un coste computacional minimo, ideal para cursos o talleres.
- Fine-tuning ligero en arabe: al ser un modelo base de 80M, puede ajustarse en una unica GPU consumer para tareas especificas como clasificacion de texto o generacion de respuestas cortas.
- Generacion de texto asistida en entornos con recursos muy limitados: su tamano permite ejecutarlo en CPU o en GPUs de gama baja, util para demos o prototipos offline.
- Componente de recuperacion en pipelines RAG: el autor lo sugiere explicitamente como pieza base para sistemas de recuperacion aumentada, donde el modelo puede generar respuestas a partir de contexto recuperado, aunque con limitaciones por su ventana de 256 tokens.
- Investigacion sobre tokenizers arabes: el tokenizer BPE entrenado sobre Wikipedia arabe puede reutilizarse para analizar la tokenizacion del arabe en modelos pequenos.
- Pruebas de infraestructura de despliegue: sirve para validar pipelines de inferencia (scripts PyTorch, servidores ligeros) antes de escalar a modelos mayores.
- Benchmarking de tecnicas de entrenamiento en GPUs gratuitas: su desarrollo en Kaggle y Marimo lo convierte en un caso de referencia para reproducir experimentos de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~79,6M de parametros en precision FP32, los pesos ocupan aproximadamente 0,3 GB; en FP16 o BF16, unos 0,16 GB. El cache KV es minimo gracias a GQA con 2 cabezas KV y contexto de 256 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para ellas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Opciones de despliegue: al no publicarse pesos en GGUF ni safetensors, el despliegue requiere cargar el fichero `max_v2_best.pt` con PyTorch y el tokenizer BPE personalizado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MAX Neural 80M (Arabic) | ~79,6M | 256 tokens | Apache 2.0 | PyTorch nativo (`max_v2_best.pt`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos arabes de ~80M entrenados desde cero) en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene conversaciones de forma fiable.
- Repeticion y alucinacion factual: el propio autor advierte de estos comportamientos, esperables en un modelo de 80M entrenado con 105M de tokens.
- Ventana de contexto muy reducida (256 tokens), lo que limita tareas de contexto largo y descarta su uso en conversaciones multi-turno extensas.
- Entrenado unicamente en arabe: no soporta otros idiomas de forma significativa.
- Corpus limitado a Wikipedia arabe: sesgos propios de la enciclopedia y posible infrarrepresentacion de registros coloquiales o dominios especializados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias de calidad ni de idoneidad para produccion.
- Formato de pesos no estandar (`.pt` con arquitectura personalizada): requiere el codigo del autor para cargar el modelo, lo que complica la integracion con herramientas habituales.
- Sin datos de benchmarks ni evaluaciones independientes: no es posible comparar su rendimiento de forma objetiva con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/Gothef/MAX-Neural-80M-Arabic
