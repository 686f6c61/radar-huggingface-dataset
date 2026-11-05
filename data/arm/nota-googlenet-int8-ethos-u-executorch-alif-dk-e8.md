# Arm/nota-googlenet-int8-ethos-u-executorch-alif-dk-e8

## Resumen

Este repositorio contiene una versión optimizada de GoogLeNet, el clasificador de imágenes basado en inception modules publicado originalmente por Qualcomm, convertida por Arm (con la herramienta Arm AI Model Optimizer, ejecutada por Nota AI) para su despliegue en NPUs Ethos-U de Arm. El resultado es un programa ExecuTorch en formato `.pte` con cuantización estática W8A8 (pesos INT8 simétricos por canal, activaciones INT8) y el delegado Ethos-U habilitado, pensado para sistemas embebidos con restricciones severas de memoria y energía.

No se trata de un modelo de lenguaje ni de un transformer generativo: es una CNN de clasificación de imágenes de 6,45 MB que ocupa 2,34 MB de memoria pico y clasifica entradas de 224x224 píxeles sobre las 1.000 clases de ImageNet-1k. Su relevancia actual está en que demuestra un flujo completo de cuantización y exportación a ExecuTorch para aceleradores Ethos-U85, con validación tanto de precisión como de latencia sobre hardware real (kit Alif Ensemble E8, Cortex-M55 + Ethos-U85).

La ficha describe, por tanto, un artefacto de despliegue para microcontroladores y sistemas embebidos de gama alta con NPU, no un modelo de propósito general. Los datos de rendimiento y precisión proceden de la model card del autor y de la configuración de referencia allí declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN GoogLeNet (inception modules), exportada a ExecuTorch con delegado Ethos-U |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada 224x224) |
| Tipos de cuantización | INT8 estática W8A8: pesos INT8 simétricos por canal, activaciones INT8 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (más `metadata.yaml` y registros de benchmark) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GoogLeNet, una red convolucional con módulos inception que combina convoluciones de distintos tamaños de kernel en paralelo y agregación por concatenación. El modelo base es `qualcomm/GoogLeNet`, distribuido por Qualcomm en Hugging Face. Sobre esa base no se ha realizado reentrenamiento ni ajuste fino: la conversión consiste en exportar el grafo a ExecuTorch y aplicar cuantización estática post-entrenamiento (PTQ) W8A8, con calibración sobre 1.000 muestras aleatorias del conjunto `imagenet1k_calib_seed42_n1000`.

La innovación técnica del artefacto no está en la arquitectura, sino en el pipeline de despliegue: exportación a `.pte` con el delegado Ethos-U, cuantización por canal en pesos y validación de precisión y latencia sobre el kit Alif Ensemble E8 (Cortex-M55 con NPU Ethos-U85, ExecuTorch 1.1.0, batch size 1, 200 ejecuciones medidas). No se documentan datos de entrenamiento originales, composición del dataset ni uso de RLHF/DPO, ya que el modelo base es un clasificador de ImageNet y el repositorio solo contiene el artefacto convertido.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k sobre entradas de 224x224 píxeles.
- Inferencia INT8 de baja latencia en NPU Ethos-U85 (12,02 frames/s en la configuración de referencia).
- Ejecución en sistemas embebidos con memoria pico de 2,34 MB y tamaño de modelo de 6,45 MB.
- Despliegue mediante runtime ExecuTorch 1.1.0 con backend Ethos-U.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de generación de texto, de código ni matemáticas.
- No incluye modo thinking, visión generativa, audio ni ninguna modalidad distinta de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en microcontroladores con NPU: el modelo cabe en 2,34 MB de memoria pico y se ejecuta sobre Cortex-M55 + Ethos-U85, lo que permite clasificación local en dispositivos sin conexión a la nube.
- Referencia de benchmarking para pipelines de cuantización: sirve para medir el impacto de la PTQ W8A8 y del delegado Ethos-U comparando latencia p50 y precisión Top-1 frente al baseline.
- Prototipado de visión embebida en wearables y sensores industriales: con 12,02 frames/s a 224x224 es viable para tareas de inspección o detección de presencia a baja cadencia.
- Validación de flujos ExecuTorch en producción: permite comprobar la integración del runtime 1.1.0 y del backend Ethos-U antes de portar modelos propios al mismo hardware.
- Clasificación de bajo consumo en dispositivos alimentados por batería: el tamaño reducido y la ejecución en NPU permiten mantener el consumo dentro de los presupuestos típicos de sistemas embebidos.
- Educación y demostración de despliegue en NPU: como artefacto autocontenido con benchmarks incluidos, facilita reproducir el flujo completo de Arm AI Model Optimizer sobre hardware de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el kit Alif Ensemble E8 (Cortex-M55 + Ethos-U85), ExecuTorch 1.1.0, batch size 1, entrada 224x224, 200 ejecuciones medidas:

| Métrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 95,84 ms | 83,17 ms | 1,15x |
| Throughput | no disponible | 12,02 frames/s | no disponible |
| Memoria pico | 2,34 MB | 2,34 MB | 1,00x |
| Tamaño del modelo | 6,45 MB | 6,45 MB | 1,00x |

Precisión sobre ImageNet-1k val (5.000 muestras, runtime ExecuTorch):

| Métrica | Baseline | Optimizado | Cambio |
|---|---:|---:|---:|
| Top-1 accuracy | 69,38% | 69,70% | +0,32 pp |
| Top-5 accuracy | no disponible | 89,66% | no disponible |

## Requisitos de hardware

- Memoria pico de inferencia: 2,34 MB, según la medición del autor en la configuración de referencia.
- Tamaño del artefacto: 6,45 MB (`.pte`), apto para almacenamiento flash de microcontroladores.
- Acelerador objetivo: NPU Arm Ethos-U85; el delegado Ethos-U requiere hardware compatible con esta NPU.
- Plataforma de referencia: kit Alif Ensemble E8 con Cortex-M55 y Ethos-U85.
- GPU de escritorio: no aplica; el modelo está pensado para NPU embebida, no para A100, H100 ni RTX 4090.
- Consumer GPU: no aplica en el escenario objetivo; no se documenta ejecución en GPU.
- Opciones de despliegue: runtime ExecuTorch 1.1.0 con backend Ethos-U. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este artefacto).
- Latencia y throughput: p50 de 83,17 ms y 12,02 frames/s en la configuración de referencia; el rendimiento depende del dispositivo, versión del runtime, soporte del backend, configuración de memoria y carga del sistema.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Tamaño | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Arm/nota-googlenet-int8-ethos-u-executorch-alif-dk-e8 | GoogLeNet INT8, ExecuTorch + Ethos-U | 224x224 | 6,45 MB | Top-1 69,70% (ImageNet-1k, 5k muestras) | BSD-3-Clause | Hugging Face |
| qualcomm/GoogLeNet (base) | GoogLeNet | 224x224 | no disponible | Top-1 69,38% (misma evaluación) | BSD-3-Clause | Hugging Face |
| Otras variantes ExecuTorch para Ethos-U de Arm | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros clasificadores embebidos comparables en la información proporcionada; la comparación directa solo es posible frente al modelo base del que deriva.

## Limitaciones y advertencias

- El rendimiento depende del dispositivo, la versión del runtime, el soporte del backend, la configuración de memoria y la carga del sistema; los resultados no son extrapolables a cualquier plataforma Arm.
- La precisión se midió sobre un subconjunto de 5.000 imágenes del conjunto de validación de ImageNet-1k, no sobre las 50.000 completas, por lo que puede no representar el rendimiento global.
- El repositorio no sustituye la documentación del modelo original; las limitaciones, sesgos y riesgos del modelo base deben consultarse en `qualcomm/GoogLeNet`.
- No se realizó reentrenamiento ni ajuste fino durante la conversión, de modo que los sesgos del modelo original persisten sin mitigación.
- El modelo está restringido a clasificación de imágenes de 224x224 sobre 1.000 clases de ImageNet-1k; no admite otras tareas ni entradas arbitrarias.
- Uso comercial permitido bajo BSD-3-Clause, con la obligación de revisar los términos de las licencias del modelo original y de terceros; la publicación del modelo optimizado no concede derechos adicionales.
- No se documentan sesgos específicos ni tasas de error por clase en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arm/nota-googlenet-int8-ethos-u-executorch-alif-dk-e8
- Modelo base: https://huggingface.co/qualcomm/GoogLeNet
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
- Licencia BSD-3-Clause: https://opensource.org/license/bsd-3-clause
