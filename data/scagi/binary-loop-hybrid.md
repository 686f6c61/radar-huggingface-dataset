# ScAGI/binary-loop-hybrid

## Resumen

Binary Loop Hybrid es un modelo de lenguaje a nivel de byte desarrollado por ScAGI como demostrador tecnico de una arquitectura hibrida que combina bloques transformer con pesos binarios y pesos compartidos (looped) con bloques de espacio de estados selectivo de estilo Mamba. El modelo tiene tan solo 3.450.240 parametros totales, de los cuales 2.359.296 son pesos lineales binarios latentes (1 bit mas escala por fila), y fue entrenado desde cero sobre texto transmitido en streaming desde HuggingFace, sin descargar un corpus local.

El objetivo del proyecto no es competir con modelos de produccion, sino validar que la mecanica de pesos binarios, bucles de razonamiento interno y bloques SSM hibridos entrena de forma estable de extremo a extremo. Usa un vocabulario de 256 bytes UTF-8 sin tokenizador entrenado, una dimension de modelo de 256 y una longitud de secuencia de 256.

Es relevante en el contexto de investigacion sobre cuantizacion extrema (1-bit), arquitecturas hibridas attention/SSM y reutilizacion de pesos mediante bucles, temas con interes creciente para reducir coste de memoria e inferencia. No obstante, su escala lo situa como una prueba de concepto, no como una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 3 bloques SSM selectivos (estilo Mamba-1) + 3 bloques transformer con pesos compartidos y bucle R=3; capas lineales binarias (1 bit + escala) |
| Parametros totales | 3.450.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | Pesos lineales internos binarios nativos (1 bit + escala por fila); embeddings, proyecciones SSM y cabeza de salida en precision completa |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch `.pt` (`ckpt_step3000.pt`, 13.819.708 bytes) |

## Arquitectura y entrenamiento

La pila alterna dos tipos de bloque, tres de cada uno. Los `SSMBlock` implementan un SSM selectivo simplificado al estilo Mamba-1 en PyTorch puro, sin el paquete `mamba-ssm` ni kernels CUDA personalizados: Δ, B y C dependen de la entrada, A es una matriz diagonal aprendida con inicializacion S4D, y la recurrencia `h_t = a_t · h_{t-1} + u_t` se evalua de forma exacta mediante un escaneo asociativo paralelo (prefix scan). Incluye convolucion causal depthwise y gating SiLU.

Los `LoopedTransformerBlock` consisten en un unico bloque transformer (8 cabezas, ratio MLP 4) cuyos pesos se comparten y se aplican tres veces consecutivas por posicion de la pila, lo que constituye el "bucle de razonamiento interno". Cada capa lineal interna es una `BinaryLinear`: en la pasada forward se usa `W_eff = α · sign(W)` con escala por fila `α = mean(|W|)`, mientras que los gradientes llegan a los pesos latentes en precision completa mediante un estimador straight-through (STE). Los embeddings (atados con la cabeza LM), las proyecciones SSM y la cabeza de salida permanecen en precision completa.

El entrenamiento se realizo con `d_model` 256, longitud de secuencia 256, batch 16, AdamW con learning rate 3e-3 y scheduler coseno, autocast fp16 y datos en streaming (`roneneldan/TinyStories`, con `Salesforce/wikitext` como fallback). El checkpoint publicado corresponde al paso 3.000, con loss 0.8828 (EMA 1.0109), obtenido en una RTX 2080 Ti a aproximadamente 23.500 tokens/s. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto a nivel de byte (vocabulario de 256 bytes UTF-8, sin tokenizador entrenado).
- Modelado de lenguaje autoregresivo con contexto corto (256 tokens).
- Generacion de frases simples de estilo TinyStories tras unos miles de pasos de entrenamiento.
- Razonamiento interno mediante reutilizacion de pesos (bucle R=3) sobre un unico bloque transformer.
- Procesamiento de secuencias mediante SSM selectivo con escaneo paralelo.
- Pesos binarios nativos que reducen el coste de almacenamiento de las capas lineales internas.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking explicito.
- Capacidad multilingue no documentada; el entrenamiento se centra en ingles.

## Casos de uso

- Investigacion sobre cuantizacion 1-bit: sirve como banco de pruebas reproducible para estudiar el entrenamiento con pesos binarios y STE en un modelo pequeno que cabe en cualquier GPU consumer.
- Estudio de arquitecturas hibridas attention/SSM: permite experimentar con la intercalacion de bloques SSM y transformer y medir su efecto en la perdida y la estabilidad del entrenamiento.
- Analisis de reutilizacion de pesos (looped transformers): util para investigar como el bucle interno afecta a la capacidad efectiva del modelo con un presupuesto de parametros minimo.
- Docencia y divulgacion: su tamano (3,45 M de parametros) y su codigo en PyTorch puro lo hacen adecuado para explicar SSM selectivos, escaneo asociativo y pesos binarios en cursos o talleres.
- Prototipado de pipelines de entrenamiento en streaming: el `train.py` con datos en streaming, logging atomico y parada limpia mediante fichero `STOP` sirve de plantilla para experimentos de entrenamiento continuo.
- Monitorizacion de entrenamiento en vivo: el `dashboard.py` (solo stdlib, endpoints `/`, `/state`, `/history`) ejemplifica como construir paneles de seguimiento de perdida, tokens por segundo y uso de GPU sin dependencias externas.
- Generacion de texto muy ligera en dispositivos con recursos minimos: dado su tamano, puede ejecutarse en CPU, aunque la calidad se limita a frases simples de estilo TinyStories.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida de entrenamiento en el paso 3.000 (loss 0.8828, EMA 1.0109) y un throughput de aproximadamente 23.500 tokens/s durante el entrenamiento en una RTX 2080 Ti.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 13,8 MB y el modelo tiene 3,45 M de parametros, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera con soporte CUDA; el entrenamiento documentado se realizo en una RTX 2080 Ti. Para inferencia basta una GPU integrada o CPU.
- Cabe en GPU consumer: si, en cualquier modelo (GTX, RTX, etc.) y en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y la clase `BinaryLoopHybridLM` de `model.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado mediciones de inferencia; el unico dato es el throughput de entrenamiento (~23.500 tokens/s en RTX 2080 Ti).

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion disponible. Por su naturaleza (demostrador de 3,45 M de parametros con pesos binarios y arquitectura hibrida SSM/transformer), no existe una categoria estandar de comparacion directa entre los modelos publicados habitualmente.

## Limitaciones y advertencias

- Escala muy reducida: con 3,45 M de parametros y contexto de 256 tokens, la calidad de generacion se limita a frases simples; el propio autor lo describe como demostrador, no como modelo de frontera.
- Contexto muy corto: 256 tokens impiden tareas que requieran contexto largo, conversaciones multi-turno extensas o documentos completos.
- Tokenizacion a nivel de byte: sin tokenizador entrenado, la eficiencia por token es baja y el modelado de texto es mas costoso que con vocabularios subword.
- Idiomas: el entrenamiento se realizo sobre TinyStories (principalmente ingles); el soporte multilingue no esta documentado ni validado.
- Riesgo de alucinacion: alto en cualquier uso fuera del dominio de TinyStories; el modelo no ha sido alineado con RLHF ni DPO.
- Sesgos: no documentados, pero al entrenarse sobre TinyStories y wikitext puede heredar sesgos de esos corpus.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Pesos binarios: aunque reducen el almacenamiento, la implementacion en PyTorch puro sin kernels especializados no garantiza ganancias de velocidad en inferencia.
- Sin soporte documentado para tool calling, agentes, vision ni audio.
- El checkpoint publicado es una instantanea del paso 3.000 de un entrenamiento en curso; no representa un modelo final convergido.

## Enlaces

- Hugging Face: https://huggingface.co/ScAGI/binary-loop-hybrid
- Repositorio de codigo: incluido en el propio repo de Hugging Face (`model.py`, `train.py`, `dashboard.py`)
- Checkpoint: `ckpt_step3000.pt` (SHA-256 `a28a3e1ca81a01f97e8a6f74e37220490dd060f7b5fdef4e0d8a35d26a447c0b`)
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset de fallback: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o demo adicionales: no disponible
