# EleutherAI/pythia-160m-weight-seed1

## Resumen

`EleutherAI/pythia-160m-weight-seed1` es un checkpoint de 160 millones de parámetros perteneciente a la suite **PolyPythias**, una extensión del proyecto Pythia de EleutherAI que añade 45 ejecuciones de entrenamiento adicionales (5 tamaños × 9 semillas) para estudiar la estabilidad y reproducibilidad del preentrenamiento de modelos de lenguaje. El modelo usa la arquitectura GPT-NeoX (transformer causal decoder-only) y fue entrenado sobre 300.000 millones de tokens de The Pile.

La particularidad de esta variante concreta —`weight-seed1`— es que estaba destinada a ser una ablación de inicialización de pesos (misma ordenación de datos, distintos pesos iniciales). Sin embargo, la model card del autor documenta un **error de entrenamiento**: estos modelos continuaron el entrenamiento desde los pesos originales de Pythia con buffers del optimizador Adam incorrectos, en lugar de partir de una inicialización independiente. Por tanto, **no deben usarse como ablación de inicialización de pesos**; existen checkpoints corregidos en `EleutherAI/pythia-160m-weight-seed1-corrected`.

Su relevancia es fundamentalmente **metodológica y de investigación**: sirve para estudiar estabilidad de entrenamiento, valores atípicos (*outliers*) en activaciones y reproducibilidad, no como modelo de producción. El paper asociado es *PolyPythias: Stability and Outliers across Fifty Language Model Pre-Training Runs* (ICLR 2025).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer causal decoder-only) |
| Parámetros totales | 160M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos en fp32/fp16 según estándar Pythia; no confirmado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch / safetensors vía `transformers` (`GPTNeoXForCausalLM`) |

Detalles de arquitectura del tamaño 160M según la model card: 12 capas, dimensión de modelo 768, 12 cabezas de atención.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia GPT-NeoX, con 12 capas, dimensión oculta de 768 y 12 cabezas de atención (160M parámetros). Se entrenó sobre **300.000 millones de tokens de The Pile**, usando ordenaciones de datos pre-barajadas (*pre-shuffled*) publicadas en el dataset `EleutherAI/pile-preshuffled-seeds`, lo que permite reproducir exactamente el orden de los datos por semilla mediante `MMapIndexedDataset` de GPT-NeoX.

La innovación del proyecto PolyPythias es la disponibilidad de **154 checkpoints intermedios** por modelo, guardados como ramas Git: `step0` (inicialización), 10 checkpoints tempranos con espaciado logarítmico (`step1` a `step512`) y 143 checkpoints uniformes (`step1000` a `step143000`), cubriendo de 2.000 millones a 300.000 millones de tokens. Esto facilita el análisis de dinámica de entrenamiento. **Advertencia crítica**: esta variante `weight-seed1` está afectada por un error de entrenamiento (buffers de Adam incorrectos al continuar desde los pesos originales), por lo que no cumple su propósito de ablación de inicialización; deben usarse los checkpoints `-corrected`. No se documenta RLHF ni DPO: es un modelo base preentrenado.

## Capacidades

- Generación de texto causal en inglés (modelo base, sin ajuste por instrucciones).
- Razonamiento de siguiente token; útil como modelo de referencia para estudiar dinámicas de entrenamiento.
- No dispone de tool calling ni function calling (modelo base sin post-entrenamiento).
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidades multilingües limitadas al inglés.
- No incluye modo *thinking*, visión ni audio.
- Aporta checkpoints intermedios para análisis de representaciones y valores atípicos a lo largo del entrenamiento.

## Casos de uso

- **Investigación en reproducibilidad del preentrenamiento**: comparar curvas de pérdida y estabilidad entre semillas de PolyPythias para cuantificar la varianza entre ejecuciones con los mismos hiperparámetros.
- **Estudio de valores atípicos en activaciones**: usar los 154 checkpoints intermedios para rastrear cuándo emergen *outliers* en activaciones y cómo evolucionan con los tokens vistos.
- **Ablaciones controladas de ordenación de datos**: combinado con los modelos `data-seed`, aislar el efecto del orden de los datos frente a la inicialización (teniendo en cuenta la advertencia del error en los `weight-seed`).
- **Prototipado ligero de generación de texto**: con 160M parámetros cabe en CPU o GPU modesta para pruebas rápidas de pipelines de `transformers`.
- **Docencia y experimentación educativa**: modelo pequeño y de licencia permisiva para enseñar mecánica de transformers causales y checkpoints intermedios.
- **Evaluación de técnicas de interpretabilidad**: analizar cómo cambian las representaciones internas a lo largo del entrenamiento cargando revisiones concretas (`revision="step50000"`).
- **Reproducción de experimentos de investigación**: replicar el pipeline de entrenamiento de Pythia con los índices de datos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,32 GB solo para pesos (160M × 2 bytes); en fp32, ~0,64 GB. Con overhead de activaciones y contexto, menos de 1-2 GB en la práctica.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, incluso iGPU con suficiente memoria compartida) y en CPU.
- GPU recomendadas para entrenamiento/experimentos a escala: A100 o H100 si se reproducen ejecuciones completas de 300B tokens; para inferencia basta una GPU modesta.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (etiqueta presente), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la información).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| pythia-160m (original) | 160M | no disponible | Apache 2.0 | Semilla 1234, referencia base del proyecto Pythia |
| pythia-160m-seed1 | 160M | no disponible | Apache 2.0 | Variante PolyPythias con semilla distinta (sin el error de los weight-seed) |
| pythia-160m-weight-seed1-corrected | 160M | no disponible | Apache 2.0 | Versión corregida del presente modelo, apta para ablación de inicialización |
| pythia-160m-data-seed1 | 160M | no disponible | Apache 2.0 | Varía solo el orden de datos manteniendo la inicialización |

## Limitaciones y advertencias

- **Error de entrenamiento documentado**: los `weight-seed` no varían la inicialización de pesos como se pretendía (buffers de Adam incorrectos); no usarlos como ablación de inicialización. Usar los `-corrected`.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable.
- Entrenado únicamente en inglés; rendimiento pobre en otros idiomas.
- Riesgo elevado de alucinación y de generar contenido sesgado o tóxico heredado de The Pile.
- No apto para producción como asistente; su valor es de investigación.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor.
- Longitud de contexto no confirmada en la información disponible; verificar antes de usos con contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EleutherAI/pythia-160m-weight-seed1
- Versión corregida: https://huggingface.co/EleutherAI/pythia-160m-weight-seed1-corrected
- Paper PolyPythias (arXiv): https://arxiv.org/abs/2503.09543
- Repositorio Pythia: https://github.com/EleutherAI/pythia
- Dataset de ordenaciones: https://huggingface.co/datasets/EleutherAI/pile-preshuffled-seeds
- The Pile: https://pile.eleuther.ai/
- Colección PolyPythias: https://huggingface.co/collections/EleutherAI/polypythias
- Modelo original de referencia: https://huggingface.co/EleutherAI/pythia-160m
