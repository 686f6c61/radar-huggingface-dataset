# INCModel3/Z-Image-Turbo-MXFP8-AutoRound

## Resumen

Z-Image-Turbo-MXFP8-AutoRound es una versión cuantizada del modelo de difusión texto-a-imagen Tongyi-MAI/Z-Image-Turbo, publicada por el usuario INCModel3. Se trata de un checkpoint derivado que aplica cuantización MXFP8 (W8A8, group size 32) sobre el transformador de difusión del modelo original mediante la herramienta AutoRound de Intel, empleando el algoritmo SignRound con 200 iteraciones de optimización. El texto encoder y el VAE se mantienen en BF16 sin cuantizar.

El objetivo de esta ficha es reducir el peso en memoria del transformador de difusión para facilitar su despliegue en infraestructura de inferencia sin degradar de forma apreciable la calidad de imagen. Según la evaluación del autor sobre DrawBench (200 prompts), la pérdida de calidad respecto al modelo BF16 es marginal en CLIP e ImageReward, y algo mayor en CLIP-IQA.

El modelo base es un modelo de difusión para generación de imágenes a partir de texto, con un pipeline `ZImagePipeline` en la librería diffusers. No se dispone de información sobre el número de parámetros, la arquitectura interna detallada ni la longitud de contexto del modelo original en la documentación proporcionada. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformador de difusión cuantizado; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 W8A8, group size 32 (transformador de difusión); texto encoder y VAE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,2 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Tongyi-MAI/Z-Image-Turbo, un modelo de difusión texto-a-imagen. La cuantización se realizó con AutoRound (versión 0.17.0 registrada en la exportación) usando el algoritmo SignRound con 200 iteraciones de optimización. Solo se cuantizó el transformador de difusión; las capas `adaLN_modulation` quedaron excluidas de la cuantización, y tanto el texto encoder como el VAE permanecen en BF16.

El proceso de calibración empleó 128 prompts del dataset OpenS2V, con 8 pasos de calibración y una escala de guía (guidance scale) de 7,5. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni si el modelo base empleó RLHF/DPO, ya que la model card proporcionada no detalla el entrenamiento del modelo original. La innovación técnica destacable es la aplicación de cuantización MXFP8 con AutoRound/SignRound para reducir el coste de memoria del transformador manteniendo la fidelidad de generación.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline `ZImagePipeline` de diffusers.
- Inferencia con pocos pasos: la evaluación se realizó con 8 pasos de inferencia y guidance scale 0.0, lo que indica un modelo optimizado para generación rápida.
- Resolución de salida de 1024×1024 en la configuración evaluada.
- Soporte de semilla fija para reproducibilidad (`seed=42` en el ejemplo de uso).
- Compatibilidad con vLLM 0.32.0 y vLLM-Omni 0.32.0 para despliegue en servidor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; son capacidades no aplicables o no disponibles para este tipo de modelo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: el modelo permite crear imágenes 1024×1024 en 8 pasos, adecuado para iterar rápidamente sobre conceptos visuales en fases de diseño.
- Creación de contenido para marketing: generación de imágenes a partir de prompts descriptivos con semilla fija para reproducir resultados aprobados en campañas.
- Generación de imágenes en pipelines de CI/CD: al ser compatible con vLLM-Omni, puede integrarse en servicios de inferencia para producir imágenes bajo demanda en aplicaciones web.
- Pruebas de concepto de modelos de difusión cuantizados: sirve como referencia para evaluar el impacto de MXFP8 frente a BF16 en calidad de imagen (CLIP, CLIP-IQA, ImageReward).
- Despliegue en infraestructura con memoria limitada: la cuantización del transformador reduce el peso en memoria respecto al checkpoint BF16, lo que facilita su ejecución en GPUs con menos VRAM (aunque el repo completo ocupa 29,2 GB).
- Investigación en cuantización: permite reproducir y comparar la metodología AutoRound/SignRound con 200 iteraciones sobre un modelo de difusión concreto.
- Generación de imágenes de referencia para datasets sintéticos: útil para crear pares prompt-imagen con semilla controlada en experimentos de investigación.

## Benchmarks y rendimiento

Evaluación sobre DrawBench (200 prompts, una imagen por prompt), generada con vLLM 0.32.0 y vLLM-Omni 0.32.0 en NVIDIA B200, 1024×1024, 8 pasos, guidance scale 0.0, semilla `42 + prompt_id`.

| Modelo | CLIP ↑ | CLIP-IQA ↑ | ImageReward ↑ |
|---|---:|---:|---:|
| BF16 | 31,7831 | 70,6414 | 1,0073 |
| MXFP8 SignRound, 200 iteraciones | 31,7907 | 70,3976 | 0,9916 |

CLIP usa `openai/clip-vit-base-patch32`. CLIP-IQA promedia tres pares de prompts positivos/negativos. Ambas métricas se reportan en escala 0–100. ImageReward usa ImageReward-v1.0. El autor indica que estos resultados cubren esta ejecución de DrawBench y no todos los prompts ni benchmarks, y que GenEval no se ha evaluado para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo completo ocupa 29,2 GB, aunque la cuantización MXFP8 del transformador reduce su peso respecto a BF16. El texto encoder y el VAE permanecen en BF16.
- GPU recomendadas: la evaluación se realizó en NVIDIA B200; no se documentan otras GPU probadas.
- Cabe en GPU de consumo: no disponible; no se confirma compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: vLLM 0.32.0 y vLLM-Omni 0.32.0 (probados); diffusers (`ZImagePipeline`) como librería de referencia.
- Latencia y throughput: no disponibles; solo se documenta la configuración de 8 pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (DrawBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Image-Turbo-MXFP8-AutoRound | no disponible | no disponible | CLIP 31,7907; CLIP-IQA 70,3976; ImageReward 0,9916 | Apache 2.0 | Hugging Face (9 descargas) |
| Tongyi-MAI/Z-Image-Turbo (BF16) | no disponible | no disponible | CLIP 31,7831; CLIP-IQA 70,6414; ImageReward 1,0073 | Apache 2.0 | Hugging Face |
| Otros modelos de difusión texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base BF16.

## Limitaciones y advertencias

- La cuantización MXFP8 introduce una degradación medible en CLIP-IQA (70,3976 frente a 70,6414 en BF16) e ImageReward (0,9916 frente a 1,0073), aunque CLIP mejora ligeramente (31,7907 frente a 31,7831).
- Los resultados de evaluación provienen de una única ejecución de DrawBench con 200 prompts y una semilla concreta; no deben generalizarse a todos los prompts ni benchmarks. GenEval no ha sido evaluado.
- No se dispone de información sobre sesgos del modelo base ni sobre riesgos de alucinación visual específicos.
- No se documentan los idiomas soportados por el texto encoder; la cobertura multilingüe es desconocida.
- El repositorio ocupa 29,2 GB, por lo que el despliegue requiere espacio de almacenamiento considerable aunque el transformador esté cuantizado.
- Es imprescindible no aplicar una anulación global de MXFP8 a todo el pipeline: el texto encoder y el VAE deben permanecer en BF16, tal como indica el autor.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del modelo original.
- El modelo tiene un uso muy limitado en la comunidad (9 descargas, 0 likes), lo que reduce la validación externa de su calidad y estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/INCModel3/Z-Image-Turbo-MXFP8-AutoRound
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- AutoRound (Intel): https://github.com/intel/auto-round
