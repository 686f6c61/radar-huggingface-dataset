# shaohao011/LynnReal-Hand-Base-1.0

## Resumen

LynnReal-Hand-Base-1.0 es un modelo de mundo (world model) generativo de vídeo controlado por manos, desarrollado por Shaohao Rui y colaboradores (repositorio LynnReal-AI). Genera secuencias de vídeo completas a partir de una imagen inicial, un prompt de texto, un vídeo de movimiento de manos alineado y una secuencia de poses de cámara. El modelo resuelve el problema del control fino de la interacción manual en vídeo generado, un aspecto crítico para aplicaciones de manipulación, simulación y creación de contenido donde las manos son el elemento central de la acción.

Se trata de un fine-tune del modelo MiniMaxAI/MiniMax-H3, con un backbone transformer de 33.122.992.896 parámetros (aproximadamente 33B) especializado en muestreo de secuencia completa bidireccional. La resolución de salida por defecto es de 1344 × 768 y el pipeline declarado es image-to-video. La relevancia actual reside en su enfoque de condicionamiento conjunto de movimiento de mano y cámara, respaldado por el artículo arXiv 2611.21479 y evaluado en el benchmark HandBench.

El paquete incluye el transformer especializado en muestreo, el VAE nativo de H3, el codificador imagen/texto basado en Qwen, tokenizador, vocabulario, procesador, scheduler y configuración de inferencia. Está publicado bajo la licencia comunitaria MiniMax H3 y requiere hardware de gama alta (GPU Hopper con FlashAttention-3) para su ejecución de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación de vídeo (fine-tune de MiniMax-H3) con muestreo bidireccional de secuencia completa |
| Parametros totales | 33.122.992.896 (aproximadamente 33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionado por número de frames: 124, 158, 243 o 260) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community) |
| Formato de pesos | safetensors (incluye transformer/adaln.safetensors); repo de 193,9 GB |

## Arquitectura y entrenamiento

El modelo se basa en un transformer de difusión para generación de vídeo, derivado de MiniMax-H3 mediante fine-tuning. Incorpora un backbone de 33B "especializado en muestreo" con generación bidireccional de secuencia completa, lo que implica que el proceso de muestreo considera la secuencia completa en lugar de un esquema autorregresivo. El condicionamiento es conjunto: movimiento de manos (a través de un vídeo de entrada alineado) y poses de cámara, además de la imagen inicial y el prompt de texto. Utiliza la codificación nativa de primera imagen de H3 y el condicionamiento imagen/texto de Qwen.

Una innovación técnica destacable es la optimización de memoria AdaLN: el transformer incluye únicamente las tablas de modulación AdaLN requeridas por su calendario de muestreo por defecto (30 puntos de muestreo, shift 3), omitiendo las matrices de proyección aprendidas por bloque. Esto reduce el tamaño de descarga y la memoria de parámetros residentes, aunque cambiar el calendario de muestreo requiere una nueva exportación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de vídeo image-to-video a partir de una imagen inicial y un prompt de texto.
- Control de movimiento de manos mediante un vídeo de movimiento alineado en campo de visión y orden de frames.
- Control de cámara mediante arrays de poses alineados temporal y espacialmente con la entrada.
- Generación de secuencia completa bidireccional (no autorregresiva).
- Soporte de longitudes de entrada de 124, 158, 243 o 260 frames, preservando la tasa de frames de la entrada.
- Salida en resolución 1344 × 768 por defecto, guardada como MP4.
- Condicionamiento multimodal con codificador Qwen de imagen/texto y VAE nativo de H3.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Simulación de manipulación de objetos: el modelo genera vídeo de una mano interactuando con objetos a partir de una imagen y una trayectoria de movimiento de mano, útil para entrenar o validar políticas de robótica y modelos de mundo físicos.
- Creación de contenido con control de cámara: permite generar planos de vídeo donde la cámara sigue una trayectoria definida por poses, adecuado para previsualización cinematográfica y animática.
- Generación de demostraciones sintéticas para datasets: produce secuencias controladas de interacción manual que pueden servir como datos aumentados para modelos de percepción de manos o de affordance.
- Prototipado de interfaces gestuales: permite visualizar cómo se comportaría una interacción gestual concreta antes de implementarla en un sistema real.
- Investigación en modelos de mundo: sirve como base para estudiar el condicionamiento conjunto de mano y cámara en generación de vídeo bidireccional, con métricas de referencia en HandBench.
- Evaluación de alineación de entradas: el pipeline de preparación permite comprobar la sensibilidad del modelo a la alineación de imagen, vídeo de mano y poses de cámara, útil en estudios de robustez.
- Generación de vídeo publicitario o educativo con manos en primer plano: escenas donde la acción manual es el foco y se requiere control preciso de la trayectoria.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HandBench | FVD (calidad visual) | 181,67 |
| HandBench | MANO Dice (fidelidad de control de mano) | 93,02 |

Los resultados corresponden a la configuración Base con muestreo bidireccional de secuencia completa a 1344 × 768, según el informe técnico. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- GPU CUDA Hopper obligatoria con FlashAttention-3; el entorno de referencia usa una NVIDIA H200.
- Entorno de referencia: Linux, Python 3.10, PyTorch 2.9.1 con CUDA 12.8, FlashAttention-3 y FFmpeg para entrada/salida de vídeo.
- No se indica que quepa en GPU de consumo (RTX 4090 u otras); el requisito de Hopper y FlashAttention-3 lo excluye en la configuración de referencia.
- El repositorio ocupa 193,9 GB en safetensors; la memoria residente depende de activaciones, cachés y decodificación, además de las tablas AdaLN empaquetadas.
- Opciones de despliegue: runtime propio `lynnreal-hand` (comandos `prepare` e `infer`), con configuración `configs/base.json` y pesos en `checkpoints`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; dependen de la longitud de secuencia y de los ajustes de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / frames | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LynnReal-Hand-Base-1.0 | 33B | 124/158/243/260 frames | Mano + cámara | MiniMax H3 Community | Hugging Face (930 descargas) |
| MiniMaxAI/MiniMax-H3 (base) | No disponible | No disponible | No especificado | No disponible en la información | Hugging Face |
| Otros modelos de vídeo controlado por cámara | No disponible | No disponible | Cámara | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada; la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- El calendario de muestreo empaquetado usa 30 puntos y shift 3; cambiarlo exige una nueva exportación de tablas AdaLN.
- La alineación de la imagen inicial, el vídeo de mano y las poses de cámara en campo de visión y tiempo es obligatoria; una alineación incorrecta reduce la fidelidad del control.
- Las interacciones generadas pueden presentar artefactos en las manos, deriva de objetos o inestabilidad temporal.
- Los resultados de HandBench no garantizan un comportamiento consistente en todas las escenas o movimientos.
- Solo se distribuyen pesos de inferencia y código; no se documenta entrenamiento adicional ni ajuste fino.
- Licencia MiniMax H3 Community: es necesario revisar los términos para uso comercial y las obligaciones de atribución recogidas en NOTICE; los componentes de terceros conservan sus licencias.
- No se documentan sesgos conocidos, riesgos de alucinación textual ni cobertura de idiomas; el modelo es generativo de vídeo, no de texto.
- Requiere hardware Hopper y FlashAttention-3, lo que limita su despliegue en entornos sin GPU de数据中心.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaohao011/LynnReal-Hand-Base-1.0
- Artículo arXiv: https://arxiv.org/pdf/2611.21479
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.21479
- Vídeo en YouTube: https://youtu.be/OdywWF0srpU
- Repositorio de código: https://github.com/LynnReal-AI/LynnReal
- Guía de inferencia: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/inference.md
- Guía de instalación: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/installation.md
- Preparación de datos: https://github.com/LynnReal-AI/LynnReal/blob/main/docs/data.md
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
