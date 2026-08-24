# shreshthsaini/brightrate-study-qwen3vl-2b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen3vl-2b-sdr` es un adaptador PEFT (LoRA) construido sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM. Su propósito es la evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios (UGC). El adaptador toma ocho fotogramas HDR muestreados uniformemente, los convierte a un proxy SDR mediante tone-mapping y los procesa en orden temporal para predecir una puntuación de calidad (MOS).

Este adaptador es relevante porque aborda un problema específico: la medición automática de calidad de vídeo HDR en entornos de contenido generado por usuarios, donde las distorsiones coexisten con artefactos propios del HDR. Al estar basado en un modelo de visión-lenguaje de 2B parámetros, ofrece una solución ligera y desplegable en hardware moderado. El adaptador se entrenó sobre el dataset BrightVQ, con una receta de entrenamiento detallada y métricas de rendimiento publicadas en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-2B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (adaptador PEFT; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base) |
| Idiomas soportados | No disponibles (el modelo base soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-VL-2B-Instruct, un modelo de visión-lenguaje de tipo transformer denso con 2B parámetros, que soporta entrada intercalada de texto, imágenes y vídeo, con una ventana de contexto de hasta 256K tokens. El adaptador LoRA se entrena con rango 16, alpha 32 y dropout 0.05, sobre la tarea de regresión de MOS (Mean Opinion Score). La entrada consiste en ocho fotogramas HDR muestreados uniformemente, convertidos a SDR mediante tone-mapping y presentados en orden temporal.

El entrenamiento se realizó sobre el split 0 del dataset BrightVQ, con dos épocas, un horizonte de schedule coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulación de gradiente de 8. Los objetivos MOS se interpolaron a través de cinco palabras de calidad. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de regresión.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios, devolviendo una puntuación MOS.
- Procesamiento de secuencias temporales de fotogramas (ocho frames) mediante el modelo base de visión-lenguaje.
- Detección de distorsiones específicas de UGC y artefactos HDR, gracias al entrenamiento en BrightVQ.
- No soporta tool calling, agentes ni razonamiento multi-paso; su salida es una puntuación numérica.
- Capacidades multilingües no especificadas; el modelo base sí las tiene, pero el adaptador no las declara.

## Casos de uso

- Control de calidad automatizado en plataformas de vídeo UGC: el adaptador puede puntuar vídeos HDR subidos por usuarios para priorizar revisión manual o filtrar contenido de baja calidad.
- Optimización de pipelines de transcodificación: usar la puntuación MOS para ajustar parámetros de codificación (bitrate, resolución) en tiempo real según la calidad percibida.
- Monitorización de calidad en servicios de streaming: evaluar la calidad de vídeos HDR en diferentes condiciones de red y dispositivos, sin necesidad de referencia original.
- Investigación en calidad de vídeo: servir como herramienta de medición objetiva en estudios que correlacionan distorsiones HDR con percepción humana.
- Desarrollo de algoritmos de mejora de vídeo: integrar el adaptador como función de pérdida o métrica para entrenar modelos de restauración o realce HDR.
- Benchmarking de codecs y pipelines de tone-mapping: comparar la calidad percibida de diferentes implementaciones usando el adaptador como evaluador automático.

## Benchmarks y rendimiento

En el conjunto de test del split 0 de BrightVQ (420 vídeos), el adaptador reporta las siguientes métricas:

| Metrica | Valor |
|---|---|
| SROCC | 0.8301 |
| PLCC | 0.8431 |
| KRCC | 0.6314 |
| RMSE | 7.3890 |

No se han publicado comparaciones con otros modelos de calidad de vídeo en la información disponible.

## Requisitos de hardware

- El adaptador en sí es pequeño (0.1 GB), pero requiere el modelo base Qwen3-VL-2B-Instruct para funcionar.
- El modelo base de 2B parámetros puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM en FP16, o menos con cuantización (por ejemplo, 4 bits).
- GPUs recomendadas: RTX 3060 (12 GB) o superior, RTX 4090, A10, A100, etc.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con la librería PEFT de Hugging Face.
- La latencia dependerá del hardware; en una RTX 4090, la inferencia sobre 8 frames debería ser de decenas de milisegundos, aunque no se proporcionan datos exactos.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables para evaluación de calidad de vídeo HDR. El modelo base Qwen3-VL-2B-Instruct es un modelo generalista de visión-lenguaje, pero no está especializado en calidad de vídeo. No se puede establecer una comparativa directa sin datos adicionales.

## Limitaciones y advertencias

- El adaptador está calibrado exclusivamente para el dataset BrightVQ; las puntuaciones no son comparables entre otros datasets, pipelines de visualización o dominios de vídeo.
- No se especifican sesgos potenciales del dataset de entrenamiento, pero al ser contenido UGC, puede haber desequilibrios en tipos de contenido, condiciones de iluminación o dispositivos de captura.
- Al ser un modelo de regresión, puede producir errores de predicción en vídeos con distorsiones atípicas no representadas en el entrenamiento.
- La licencia no está disponible, lo que limita el uso comercial sin aclaración legal.
- El adaptador no es un modelo generativo; no debe usarse para tareas de generación de texto o imagen.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen3vl-2b-sdr
- Repositorio BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Página personal del autor: https://shreshthsaini.github.io/
- Paper técnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Presentación en WACV 2026: https://wacv.thecvf.com/virtual/2026/oral/1209
