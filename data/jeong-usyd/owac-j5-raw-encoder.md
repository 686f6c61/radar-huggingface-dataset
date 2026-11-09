# Jeong-USYD/owac-j5-raw-encoder

## Resumen

OWAC J5 RAW Encoder es un codificador visual auto-supervisado desarrollado por el proyecto OWAC (Jeong-USYD) para procesar imágenes RAW de tres canales en el contexto de robótica y visión artificial. Se trata de un Vision Transformer ViT-S/16 (anchura 384, 12 capas, 6 cabezas de atención, 4 tokens de registro) entrenado desde cero, sin cargar pesos preentrenados de DINOv3, sobre datos simulados de LIBERO y RoboTwin. El checkpoint publicado corresponde al paso 12.818 de un plan de 30.000 actualizaciones, por lo que el entrenamiento se detuvo antes de completarse.

El modelo resuelve el problema de obtener representaciones visuales útiles a partir de señales RAW (pseudo-RAW lineal de tres canales) sin depender de un profesor RGB ni de pesos visuales externos, usando objetivos auto-supervisados tipo DINO/iBOT combinados con consistencia de exposición, relaciones espaciales y diversidad de características. Es relevante para la comunidad de robótica porque explora el preentrenamiento directo sobre datos de sensores sin etiquetas de acción ni de lenguaje, un paso previo a las políticas cerradas del proyecto (C1/D17).

Con 22.186.371 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado como inicialización de encoders para políticas robóticas. No genera acciones por sí mismo ni implementa la interfaz nativa mono/Bayer posterior (D20); su utilidad es como componente de representación visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-S/16 (DINOv3 ViT en Transformers, sin pesos preentrenados) |
| Parametros totales | 22.186.371 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen 256 × 256, patch 16) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas de idioma del repositorio; el modelo es visual) |
| Licencia | no disponible (el autor indica que la disponibilidad pública no concede licencia) |
| Formato de pesos | safetensors, encoder.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un ViT-S/16 con anchura 384, 12 capas, 6 cabezas de atención y 4 tokens de registro. Una respuesta radiométrica aprendida transforma tres canales de entrada en nueve canales (magnitud original, respuesta comprimida con asinh y respuesta relativa de canal). La implementación reutiliza la arquitectura ViT de DINOv3 en Transformers pero sin cargar pesos preentrenados de DINOv3.

J5 hereda el encoder EMA RAW-only de J4, usando características RAW de J3 como referencia espacial congelada. El entrenamiento combina auto-supervisión estilo DINO/iBOT, consistencia de exposición, relaciones espaciales, diversidad de características y correspondencia suave con fotogramas pasados. No se emplean profesor RGB, pesos visuales preentrenados externos, etiquetas de acción ni de lenguaje. El entrenamiento se detuvo y guardó en el paso 12.818 de 30.000 actualizaciones planificadas. La entrada es un tensor float `[B, 3, H, W]` de pseudo-RAW lineal (tamaño estándar 256 × 256, patch 16); la salida son características CLS `[B, 384]` y características de parches `[B, H/16 * W/16, 384]` (256 parches a 256 × 256), excluyendo los cuatro tokens de registro.

## Capacidades

- Extracción de características visuales a partir de imágenes pseudo-RAW de tres canales.
- Representación CLS de 384 dimensiones y representaciones de parches de 384 dimensiones.
- Preentrenamiento auto-supervisado sin etiquetas de acción, lenguaje ni profesor RGB.
- Consistencia de exposición y modelado de relaciones espaciales entre parches.
- Correspondencia temporal suave con fotogramas pasados como objetivo de entrenamiento (la inferencia es de un solo fotograma).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo visual).
- Capacidades especiales: respuesta radiométrica aprendida de 3 a 9 canales; no implementa la interfaz nativa mono/Bayer (D20).

## Casos de uso

- Inicialización de encoders para políticas robóticas: sirve como punto de partida congelado o ajustable para las políticas posteriores C1/D17 del proyecto OWAC, aprovechando sus representaciones RAW preentrenadas sin etiquetas.
- Investigación en auto-supervisión sobre datos de sensores: permite estudiar objetivos DINO/iBOT aplicados a pseudo-RAW en lugar de RGB, comparando la calidad de las representaciones con encoders RGB preentrenados.
- Extracción de características para percepción en simulación: con entradas de 256 × 256 y salida de 256 parches de 384 dimensiones, se puede integrar en pipelines de visión para tareas de manipulación en LIBERO y RoboTwin.
- Benchmark de representaciones visuales: el dataset RawVLA-Bench y el formato de salida permiten evaluar sondas visuales sobre características congeladas de forma reproducible.
- Prototipado de pipelines RAW en robótica: el código de inferencia (`modeling_raw_encoder.py`) y el escalado específico por dataset (LIBERO dividido por 255, RoboTwin directo) facilitan la integración en flujos existentes.
- Estudio de transferencia de dominio simulación-real: como caso de análisis de las limitaciones del modelo, permite investigar hasta qué punto las representaciones entrenadas en pseudo-RAW simulado generalizan a cámaras reales.
- Base para experimentos de consistencia temporal: aunque la inferencia es de un solo fotograma, el objetivo de correspondencia pasado-fotograma puede reutilizarse en investigación sobre representaciones temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el checkpoint final del paso 12.818 no recibió una nueva evaluación visual y que las sondas visuales anteriores son diagnósticas, sin establecer semántica general de objetos, segmentación de movimiento ni transferencia a cámaras reales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño del modelo (22,2 M de parámetros, ~89 MB en fp32). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este encoder.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch con `safetensors` y el código de inferencia incluido (`modeling_raw_encoder.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder visual).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| OWAC J5 RAW Encoder | 22,2 M | Imagen 256 × 256, patch 16 | no disponible | Hugging Face |
| DINOv3 ViT-S/16 (referencia arquitectonica) | no disponible en la informacion | no disponible | no disponible | no disponible |
| Encoders RAW del proyecto OWAC (J3, J4) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: se detuvo en el paso 12.818 de 30.000 planificados.
- Sin evaluación visual final: el checkpoint del paso 12.818 no recibió una nueva evaluación; las sondas previas son diagnósticas y no demuestran semántica general de objetos, segmentación de movimiento ni transferencia a cámaras reales.
- Datos simulados: las observaciones son pseudo-RAW simulado de tres canales, no mediciones nativas monocromas ni Bayer.
- No implementa la interfaz nativa de 10 bits mono/Bayer (D20); replicar un canal mono no constituye una validación de transferencia de sensor.
- No produce acciones por sí mismo; los ratios de éxito en bucle cerrado de C1/D17 no pueden atribuirse a este checkpoint aislado.
- Escalado específico por dataset (LIBERO dividido por 255, RoboTwin directo); no es una calibración genérica de sensor. No aplicar normalización ImageNet ni recortar valores HDR por defecto.
- Licencia no especificada: la disponibilidad pública no concede licencia; no se afirma licencia adicional de pesos, lo que impide asumir uso comercial.
- Idiomas: el modelo es visual; las etiquetas en/zh no implican capacidades lingüísticas.
- Riesgo de alucinación: no aplica directamente a un encoder de características, pero las representaciones no están validadas para uso fuera de los dominios de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Jeong-USYD/owac-j5-raw-encoder
- Repositorio OWAC: https://github.com/Jeong-zju/owac
- Experimento J5: https://github.com/Jeong-zju/owac/blob/lzh/raw-temporal-relations/research/experiments/j5_raw_relations_20261030.md
- Dataset RawVLA-Bench: https://huggingface.co/datasets/ToferFish/RawVLA-Bench
