# Arm/qai-quicksrnetsmall-int8-ethos-u-executorch-alif-dk-e8

## Resumen

QuickSRNetSmall es un modelo de superresolución de imagen desarrollado originalmente por Qualcomm, diseñado para tareas de image-to-image de bajo coste computacional. Esta ficha describe la versión optimizada publicada por Arm, que convierte el modelo original en un programa ExecuTorch (`.pte`) cuantizado a INT8 y compilado para la NPU Ethos-U85, con el objetivo de ejecutarlo en microcontroladores y sistemas embebidos basados en Cortex-M55.

La optimización aplica cuantización estática post-entrenamiento W8A8 (pesos INT8 simétricos por tensor y activaciones INT8) y utiliza el delegado Ethos-U de ExecuTorch. No se realizó reentrenamiento ni ajuste fino: el objetivo es preservar el comportamiento del modelo original reduciendo latencia y tamaño para despliegue en el borde.

El resultado es un artefacto de referencia para desarrolladores que evalúan cargas de superresolución en plataformas Arm embebidas. En el dispositivo de referencia Alif Ensemble E8, la latencia p50 baja de 148,38 ms a 130,53 ms (1,14x) y el tamaño del modelo pasa de 0,04 MB a 0,03 MB (1,33x menor), con una pérdida de PSNR de 0,29 dB sobre BSD100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para superresolución de imagen (QuickSRNetSmall); exportada como programa ExecuTorch con delegado Ethos-U |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 128x128) |
| Tipos de cuantizacion | INT8 simétrico por tensor en pesos, activaciones INT8 (W8A8 estática post-entrenamiento) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ExecuTorch `.pte` (con delegado Ethos-U); metadatos en `metadata.yaml` |

## Arquitectura y entrenamiento

El modelo base es QuickSRNetSmall de Qualcomm, una red convolucional ligera orientada a superresolución de imagen con bajo coste computacional. Esta versión no modifica la arquitectura ni reentrena el modelo: se limita a la conversión y optimización para inferencia en hardware Arm. El pipeline incluye exportación de PyTorch a ExecuTorch (`.pte`) con el delegado Ethos-U, cuantización estática W8A8 y validación de precisión y rendimiento.

La calibración de la cuantización se realizó sobre 50 muestras aleatorias del conjunto `bsd100_calib_seed42_n50`. La validación de precisión se hizo sobre el split de test de BSD100 (100 muestras) ejecutando con el runtime ExecuTorch. La validación de rendimiento se midió en el kit de desarrollo Alif Ensemble E8 con CPU Cortex-M55 y NPU Ethos-U85, con batch size 1, entrada de 128x128 y 200 ejecuciones medidas. La optimización fue realizada por Nota AI usando Arm AI Model Optimizer.

## Capacidades

- Superresolución de imagen: aumenta la resolución de imágenes de entrada de 128x128 mediante reconstrucción de detalles.
- Inferencia en el borde: ejecución en microcontroladores Cortex-M55 con aceleración en NPU Ethos-U85.
- Cuantización INT8: pesos y activaciones en INT8, apto para hardware embebido con recursos limitados.
- Formato ExecuTorch: integración con el runtime ExecuTorch 1.1.0 y el delegado Ethos-U.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de image-to-image.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Superresolución en cámaras embebidas: el modelo puede mejorar imágenes de 128x128 capturadas por sensores de baja resolución en dispositivos con Cortex-M55 y Ethos-U85, con latencias de ~130 ms por fotograma y un consumo de memoria máximo de 7,69 MB.
- Prototipado de pipelines de visión en microcontroladores: sirve como referencia para validar la integración de ExecuTorch y el delegado Ethos-U en placas Alif Ensemble E8 antes de desarrollar modelos propios.
- Benchmarking de NPUs embebidas: permite comparar latencia, throughput (7,66 fps) y precisión (PSNR 25,56 dB) entre distintas configuraciones de hardware y versiones de runtime.
- Preprocesado en dispositivos de bajo consumo: puede integrarse en flujos donde se requiere escalar imágenes antes de tareas posteriores (detección, clasificación) sin salir del dispositivo.
- Evaluación de cuantización post-entrenamiento: útil para estudiar el impacto de W8A8 en tareas de superresolución, con una pérdida medida de 0,29 dB en PSNR.
- Educación e investigación en TinyML: ejemplo reproducible de conversión de un modelo PyTorch a ExecuTorch con cuantización y despliegue en NPU, con artefactos de benchmark incluidos en el repositorio.

## Benchmarks y rendimiento

Resultados medidos en Alif Ensemble E8 (Cortex-M55 + Ethos-U85), ExecuTorch 1.1.0, batch size 1, entrada 128x128, 200 ejecuciones:

| Metrica | Baseline | Optimizado | Mejora |
|---|---:|---:|---:|
| Latencia p50 extremo a extremo | 148,38 ms | 130,53 ms | 1,14x |
| Throughput | no disponible | 7,66 fps | no disponible |
| Memoria pico | 7,69 MB | 7,69 MB | 1,00x |
| Tamano del modelo | 0,04 MB | 0,03 MB | 1,33x menor |
| PSNR (BSD100, test, 100 muestras) | 25,85 dB | 25,56 dB | -0,29 dB |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para memoria de sistema embebido, con un pico de 7,69 MB.
- GPU recomendadas: no aplica; el destino es NPU Ethos-U85 con CPU Cortex-M55.
- Cabe en hardware embebido: sí, en plataformas con Ethos-U85 y al menos 7,69 MB de memoria disponible; dispositivo de referencia Alif Ensemble E8.
- Opciones de despliegue: runtime ExecuTorch 1.1.0 con delegado Ethos-U; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput: 130,53 ms p50 y 7,66 fps en la configuración de referencia; el rendimiento puede variar según dispositivo, versión de runtime, soporte del backend, configuración de memoria y carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arm/qai-quicksrnetsmall-int8-ethos-u-executorch-alif-dk-e8 | no disponible | Imagen 128x128 | INT8 W8A8 | BSD-3-Clause | Hugging Face (ExecuTorch `.pte`) |
| qualcomm/QuickSRNetSmall (modelo base) | no disponible | Imagen 128x128 | Float (original) | BSD-3-Clause | Hugging Face |
| Otros modelos de superresolución embebida | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para una comparación cuantitativa con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento depende del dispositivo objetivo, la versión del runtime, el soporte del backend, la configuración de memoria y la carga del sistema; los resultados no garantizan un comportamiento idéntico en todos los sistemas Arm.
- La cuantización introduce una pérdida de precisión de 0,29 dB en PSNR sobre BSD100; se recomienda reevaluar el modelo con datos propios antes de usarlo en producción.
- El repositorio no sustituye la documentación del modelo original; la información sobre entrenamiento, datos y usos previstos debe consultarse en qualcomm/QuickSRNetSmall.
- No se realizó reentrenamiento ni ajuste fino durante la conversión, por lo que se heredan los sesgos y limitaciones del modelo original, que no se detallan en la información disponible.
- La entrada de referencia es de 128x128; no se documenta el comportamiento con otras resoluciones.
- Uso comercial permitido bajo BSD-3-Clause, condicionado al cumplimiento de los términos de dicha licencia y de las restricciones aplicables al modelo original.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arm/qai-quicksrnetsmall-int8-ethos-u-executorch-alif-dk-e8
- Modelo original: https://huggingface.co/qualcomm/QuickSRNetSmall
- Arm AI Model Optimizer: https://developer.arm.com/dev-docs/ai-model-optimizer/
- Licencia BSD-3-Clause: https://opensource.org/license/bsd-3-clause
