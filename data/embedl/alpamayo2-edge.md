# embedl/Alpamayo2-Edge

## Resumen

Alpamayo 2 Edge (versión de Embedl) es una compilación optimizada del modelo visión-lenguaje-acción (VLA) de NVIDIA para conducción autónoma, adaptada para ejecutarse en tiempo real sobre NVIDIA Jetson AGX Thor mediante TensorRT Edge-LLM. Embedl parte de los pesos originales `nvidia/Alpamayo2-Edge` (commit `b92b6aa3`) y aplica cuantización mixta (NVFP4 calibrada para conducción en el modelo de lenguaje, MXFP8 en el codificador visual y en el experto de acción) junto con optimizaciones de caché y decodificación especulativa propias.

El resultado son 91,9 ms de latencia mediana por decisión (10,9 Hz), frente a 489,3 ms con TensorRT Edge-LLM en FP16 y 603,7 ms con la implementación PyTorch BF16 de NVIDIA en el mismo dispositivo. Además de ser 6,6 veces más rápido, reduce el consumo energético por decisión a 12,45 J (frente a 51,87 J de la referencia PyTorch) y mejora ligeramente el error de trayectoria (minADE₆ de 0,464 m frente a 0,508 m). El modelo ocupa 2,37 GiB en disco y el contenedor de ejecución 1,07 GiB.

Es relevante porque demuestra que un VLA de conducción autónoma puede ejecutarse dentro de los márgenes de tiempo real de un bucle de control vehicular (100 ms) en hardware embebido de a bordo, sin depender de una GPU de centro de datos. La distribución no se hace como pesos sueltos en Hugging Face, sino como imágenes de contenedor desde el sitio de Embedl, bajo su licencia propietaria Embedl Software Licence 2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de nvidia/Alpamayo2-Edge; incluye modelo de lenguaje, codificador visual (ViT) y experto de acción |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelo de lenguaje, calibrada para conducción) con `lm_head` en FP16; MXFP8 (codificador visual ViT y experto de acción) |
| Idiomas soportados | no disponible |
| Licencia | Embedl Software Licence 2.1 (los pesos originales de NVIDIA mantienen su propia licencia) |
| Formato de pesos | No se distribuyen pesos sueltos; se entrega como imágenes de contenedor con runtime TensorRT Edge-LLM 0.10.1 |

## Arquitectura y entrenamiento

El modelo base es un VLA de NVIDIA para conducción autónoma que combina percepción visual (codificador ViT sobre fotogramas de cámara), razonamiento en lenguaje y generación de trayectorias mediante un experto de acción. La ficha de Embedl no detalla el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de RLHF o DPO; esa información correspondería a la model card de `nvidia/Alpamayo2-Edge`, no incluida aquí.

La aportación técnica de esta versión es la optimización para inferencia embebida: cuantización NVFP4 del modelo de lenguaje calibrada específicamente con datos de conducción, MXFP8 para ViT y experto de acción, `lm_head` en FP16 para preservar la precisión de la salida, cachés optimizadas y decodificación especulativa. Todo ello sobre TensorRT Edge-LLM 0.10.1. La evaluación se realiza sobre clips de PhysicalAI-AV (180 decisiones por clip, una cada 0,1 s) y la precisión se mide con minADE₆ a 5 s sobre 378 clips de validación retenidos con 2 semillas.

## Capacidades

- Percepción visual a partir de fotogramas de cámara y generación de trayectorias de conducción (salida de acción, no solo texto).
- Razonamiento visión-lenguaje-acción integrado: el modelo recibe imágenes y produce una decisión de trayectoria completa en una sola llamada.
- Generación de múltiples trayectorias candidatas (la métrica minADE₆ selecciona la mejor de 6 muestras).
- Inferencia en tiempo real en hardware embebido: 10,9 decisiones por segundo en Jetson AGX Thor.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, modo thinking ni soporte multilingüe explícito.

## Casos de uso

- Conducción autónoma en vehículos de producción: el modelo genera trayectorias a 10,9 Hz con 91,9 ms de latencia mediana, dentro del margen típico de un bucle de control de 100 ms, lo que permite integración directa en la planificación del vehículo.
- Sistemas ADAS de gama alta con cómputo de a bordo limitado: al ocupar 2,37 GiB y consumir 12,45 J por decisión, es viable en plataformas embebidas con presupuesto energético restringido, sin GPU de centro de datos.
- Validación y prototipado en banco de pruebas: Embedl ofrece ejecución gratuita en un Jetson AGX Thor real vía navegador, útil para evaluar el modelo antes de adquirir hardware.
- Investigación en VLA para robótica y conducción: la arquitectura visión-lenguaje-acción y las 6 trayectorias muestreadas permiten estudiar calibración y selección de trayectorias con minADE₆ como métrica.
- Flotas y despliegue en vehículo conectado: el contenedor de runtime de 1,07 GiB facilita la distribución y actualización OTA del modelo junto con su runtime TensorRT Edge-LLM.
- Análisis de eficiencia energética en autonomía: la reducción de 51,87 J a 12,45 J por decisión permite estimar el impacto del cómputo de percepción y planificación en el consumo del vehículo eléctrico.

## Benchmarks y rendimiento

Resultados medidos en Jetson AGX Thor según la model card de Embedl:

| Metrica | Embedl NVFP4 / MXFP8 | TensorRT Edge-LLM FP16 | NVIDIA PyTorch BF16 |
|---|---:|---:|---:|
| Latencia por decisión, mediana | 91,9 ms | 489,3 ms | 603,7 ms |
| Latencia por decisión, p90 | 140,3 ms | no disponible | 840,6 ms |
| Decisiones por segundo | 10,9 Hz | no disponible | 1,7 Hz |
| Energía por decisión | 12,45 J | 62,02 J | 51,87 J |
| Potencia media durante decisión | 117,6 W | no disponible | 74,5 W |
| Potencia pico durante decisión | 150,2 W | no disponible | 137,9 W |
| Tamaño del modelo | 2,37 GiB | no disponible | 4,95 GiB |
| Tamaño del contenedor de runtime | 1,07 GiB | no disponible | 11,35 GiB |
| minADE₆ a 5 s (menor es mejor) | 0,464 m | no disponible | 0,508 m |

Potencia de la placa en reposo: 30,0 W. La precisión de la versión Embedl se mide en el dispositivo; la BF16 de NVIDIA, en una H200 con su propio código, sobre los mismos eventos y semillas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NVIDIA Jetson AGX Thor, plataforma para la que está optimizado y validado el modelo.
- VRAM/modelo en disco: 2,37 GiB de pesos; contenedor de runtime de 1,07 GiB.
- Consumo: 117,6 W de media y 150,2 W de pico durante la decisión; 30,0 W en reposo.
- No se documenta compatibilidad con GPUs de consumo (RTX 4090, etc.) ni con A100/H100; la referencia BF16 de NVIDIA se midió en una H200 solo como comparación.
- Despliegue: imágenes de contenedor con TensorRT Edge-LLM 0.10.1 distribuidas por Embedl; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 10,9 decisiones por segundo (mediana); latencia p90 de 140,3 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Thor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| embedl/Alpamayo2-Edge | no disponible | no disponible | 91,9 ms mediana, 10,9 Hz, minADE₆ 0,464 m | Embedl Software Licence 2.1 | Contenedores vía embedl.com |
| nvidia/Alpamayo2-Edge (PyTorch BF16) | no disponible | no disponible | 603,7 ms mediana, 1,7 Hz, minADE₆ 0,508 m | Licencia de NVIDIA (no detallada aquí) | Pesos en Hugging Face |
| nvidia/Alpamayo2-Edge en TensorRT Edge-LLM FP16 | no disponible | no disponible | 489,3 ms mediana | Licencia de NVIDIA (no detallada aquí) | Runtime TensorRT Edge-LLM |

No se dispone de información sobre otros modelos VLA de conducción comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia Embedl Software Licence 2.1 es propietaria; es necesario revisar sus términos antes de cualquier uso comercial. Los pesos originales de NVIDIA mantienen su propia licencia, independiente de la de Embedl.
- El modelo está optimizado y validado exclusivamente para Jetson AGX Thor con TensorRT Edge-LLM; no hay garantías de funcionamiento en otras plataformas.
- Los pesos no se distribuyen en formatos estándar (safetensors, GGUF) sino como imágenes de contenedor, lo que limita la inspección, la modificación y la portabilidad del modelo.
- La cuantización NVFP4 calibrada para conducción puede degradar el comportamiento fuera del dominio de datos de calibración; la evaluación se limita a clips de PhysicalAI-AV.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; al ser un modelo de acción, el riesgo principal es la generación de trayectorias inseguras, no la alucinación textual.
- La métrica de precisión (minADE₆) se midió con la versión Embedl en dispositivo y la BF16 de NVIDIA en H200, por lo que la comparación de precisión no es estrictamente equivalente en hardware.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; es un artefacto reciente sin adopción comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/embedl/Alpamayo2-Edge
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Página del modelo en Embedl: https://embedl.com/nvidia/alpamayo2-edge
- Demo en vivo en Jetson AGX Thor: https://embedl.com/nvidia/alpamayo2-edge/thor?tab=run
- Licencia Embedl Software Licence 2.1: https://embedl.com/legal/software-licence/v2.1
- Código de NVIDIA: https://github.com/NVlabs/alpamayo2-edge
