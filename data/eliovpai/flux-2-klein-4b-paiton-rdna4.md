# EliovpAI/FLUX.2-klein-4B-Paiton-RDNA4

## Resumen

EliovpAI/FLUX.2-klein-4B-Paiton-RDNA4 es un paquete de inferencia compilado para el modelo de texto a imagen FLUX.2 klein 4B, optimizado específicamente para GPUs AMD Radeon con arquitectura RDNA4 (gfx1201). Lo desarrolla EliovpAI y resuelve el problema de rendimiento y uso de memoria de los modelos de difusión en hardware AMD, aprovechando el compilador Paiton para reducir la latencia y la asignación de VRAM sin necesidad de reentrenar el modelo. El repositorio contiene artefactos compilados, manifiestos y un flujo de trabajo listo para ComfyUI; los pesos del modelo se descargan por separado desde el editor original del checkpoint.

El modelo base es FLUX.2 klein 4B cuantizado a 4 bits dinámicos (SDNQ-4bit-dynamic), con un tamaño de 4 mil millones de parámetros según su denominación. La longitud de contexto de texto es de 512 tokens. La arquitectura interna no se especifica en la documentación, pero se trata de un modelo de difusión de texto a imagen. En el hardware cualificado (AMD Radeon AI PRO R9700 de 32 GB), el pipeline Paiton alcanza una latencia media de 1.054 segundos por imagen de 1024x1024 con 4 pasos, y una asignación pico de Torch de 12.9 GiB, un 33.4% menos que la configuración de referencia con Diffusers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusión de texto a imagen, basado en FLUX.2 klein 4B) |
| Parametros totales | 4 mil millones (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia de texto del prompt) |
| Tipos de cuantizacion | 4-bit dinámico (SDNQ-4bit-dynamic) |
| Idiomas soportados | No disponible (pipeline text-to-image; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos compilados para Paiton; pesos del checkpoint original descargados por separado (5.46 GB) |

## Arquitectura y entrenamiento

El modelo es una compilación optimizada del checkpoint FLUX.2 klein 4B cuantizado a 4 bits dinámicos. No se proporcionan detalles sobre la arquitectura interna del transformer de difusión ni sobre los datos de entrenamiento del modelo base. La innovación técnica reside en la compilación Paiton para hardware AMD RDNA4 (gfx1201), que reduce la asignación de memoria y la latencia mediante la preparación de tensores, la captura de gráficos y la eliminación de trabajo no utilizado en el pipeline. El repositorio contiene artefactos compilados y manifiestos, pero no los pesos del modelo, que se descargan por separado del editor original. No hay información sobre RLHF, DPO ni ajustes adicionales.

## Capacidades

- Generación de imágenes fotográficas, conceptos de producto e ilustraciones en resolución 1024x1024 con 4 pasos de denoising.
- Ejecución local en GPUs AMD Radeon con arquitectura RDNA4, sin necesidad de servicios en la nube ni token de HuggingFace.
- Integración con ComfyUI mediante un flujo de trabajo predefinido, con selección de motor Paiton o Stock (Diffusers) para comparación.
- Preservación de la composición y los sujetos principales en comparación con el motor Stock, con diferencias en detalles finos (SSIM de 0.975, 0.974 y 0.859 en tres prompts de prueba).
- Soporte de generación por lotes y persistencia de cachés entre reinicios completos del contenedor.
- Inferencia marcada como false en HuggingFace: requiere el entorno Paiton y no puede ejecutarse directamente con la librería Diffusers estándar.

## Casos de uso

- Generación de fotografías para catálogos de producto: el modelo produce imágenes de producto en 1024x1024 con 4 pasos, lo que permite iterar rápidamente sobre conceptos de diseño en una estación de trabajo local con GPU AMD Radeon.
- Ilustración artística en local: gracias a la baja asignación de memoria (12.9 GiB de pico Torch), se puede ejecutar en una GPU R9700 para crear ilustraciones en estilos como acuarela, sin depender de servicios externos.
- Prototipado de campañas publicitarias: con una latencia media de 1.054 segundos por imagen, es viable generar múltiples variaciones de un concepto en pocos minutos, acelerando las revisiones creativas.
- Comparación de motores de inferencia: el flujo de trabajo de ComfyUI permite alternar entre Paiton y Stock con el mismo prompt y semilla, lo que facilita la evaluación de diferencias de calidad y rendimiento.
- Generación de imágenes en entornos con requisitos de privacidad: todo el pipeline se ejecuta localmente en Docker con acceso directo al hardware, manteniendo los datos y las imágenes en el sistema sin comunicación externa.
- Investigación de optimización de hardware: el repositorio incluye artefactos compilados, manifiestos y datos de benchmark que sirven como referencia para estudiar la compilación de modelos de difusión en arquitecturas RDNA4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de razonamiento o lenguaje (MMLU, HumanEval, GSM8K) porque se trata de un modelo de texto a imagen. Los datos disponibles son de rendimiento de inferencia y calidad visual, medidos el 7 de septiembre de 2026 con dos warmups y dos ejecuciones por cada uno de tres prompts fijos, en una AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

| Metrica | Stock (Diffusers) | Paiton |
|---|---|---|
| Latencia media por imagen (segundos) | 1.258 | 1.054 |
| Imagenes proyectadas por hora | 2.862 | 3.416 |
| Asignacion pico Torch (GiB) | 19.3 | 12.9 |
| Reserva pico Torch (GiB) | 22.1 | 14.1 |
| VRAM maxima muestreada (GiB) | 23.0 | 14.6 |

Similitud estructural (SSIM) entre las salidas de Paiton y Stock: 0.975 para la fotografía del zorro, 0.974 para la escena de producto y 0.859 para la ilustración de la librería bajo la lluvia. La documentación advierte que tres prompts no establecen una equivalencia de calidad amplia.

## Requisitos de hardware

- GPU cualificada: AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se admiten otras GPUs ni otros perfiles.
- VRAM estimada: 12.9 GiB de asignación pico Torch y 14.6 GiB de VRAM máxima muestreada durante el pipeline completo.
- RAM del sistema: 16 GB mínimo; 24 GB recomendados para disponer de margen durante la compilación.
- Disco libre: 60 GB para contenedores, pesos, tensores preparados, cachés y salidas.
- Sistema operativo: Linux x86-64 con Docker Engine y el plugin Compose, y acceso a los dispositivos /dev/kfd y /dev/dri.
- Opciones de despliegue: ComfyUI en contenedor Docker con flujo de trabajo incluido; también existe un repositorio central con versiones vLLM para texto, pero no para este modelo de imagen.
- Latencia y throughput: 1.054 segundos por imagen y 3.416 imágenes por hora proyectadas en el hardware cualificado, excluyendo arranque, codificación PNG y escritura de archivos.

## Comparativa con modelos similares

La comparativa más relevante es entre el motor Paiton y la configuración Stock (Diffusers) del mismo checkpoint FLUX.2 klein 4B, ambos en la misma GPU R9700 y con el mismo perfil de 4 pasos y 1024x1024.

| Modelo | Motor | Latencia (s/imagen) | Asignacion pico Torch (GiB) | VRAM maxima (GiB) |
|---|---|---|---|---|
| FLUX.2 klein 4B (SDNQ-4bit) | Stock (Diffusers) | 1.258 | 19.3 | 23.0 |
| FLUX.2 klein 4B (SDNQ-4bit) | Paiton | 1.054 | 12.9 | 14.6 |

No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros modelos de difusión de 4B) en la información proporcionada.

## Limitaciones y advertencias

- Solo está cualificado para la GPU AMD Radeon AI PRO R9700 (gfx1201) y el perfil fijo de 1024x1024 con 4 pasos. No es una reclamación de soporte para GPUs más pequeñas, otras resoluciones, edición de imágenes, adaptadores ni flujos de trabajo generales de ComfyUI.
- El repositorio no contiene los pesos del modelo; se descargan por separado del editor original y se conservan en la caché local.
- La inferencia en HuggingFace está marcada como false, lo que indica que el modelo no se puede cargar directamente con la librería estándar; requiere el entorno Paiton y los artefactos compilados.
- Se observan diferencias notables en detalles finos en escenas complejas (SSIM de 0.859 en la ilustración de la librería), lo que implica que la similitud numérica no es una prueba completa de calidad.
- La evaluación de calidad se basa en solo tres prompts, por lo que no se puede generalizar el comportamiento en un amplio rango de entradas.
- Requiere Linux, Docker y acceso directo al hardware AMD, lo que limita su uso en Windows o macOS sin contenedores.
- La licencia Apache 2.0 se aplica a los artefactos compilados, pero la licencia del modelo base original puede tener restricciones adicionales que no se detallan en la documentación.
- Riesgo de alucinación visual y artefactos inherente a los modelos de difusión, especialmente en composiciones complejas o con prompts ambiguos.

## Enlaces

- HuggingFace: https://huggingface.co/EliovpAI/FLUX.2-klein-4B-Paiton-RDNA4
- Repositorio de GitHub (rama paiton-flux2-klein-gfx1201-v1.0.1): https://github.com/Eliovp-BV/paiton-vllm-plugin/tree/paiton-flux2-klein-gfx1201-v1.0.1/models/FLUX.2-klein
- Sitio oficial de Paiton: https://eliovp.com/products/paiton
- Página de referencia sobre FLUX.2 Klein 4B: https://kunya.ai/models/flux-2-klein
