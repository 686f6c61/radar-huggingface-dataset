# ducvh5/wan21-a5b5x4c5-tm-u5

## Resumen

Este modelo es un ajuste fino (finetune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario `ducvh5` en Hugging Face. Se presenta como una variante experimental derivada del modelo base de 1.300 millones de parámetros, con una arquitectura que el autor describe como "recurrent-transformer" y una configuración de bloques poco convencional (A5 → B5×4 → C5, con 15 bloques únicos y 30 ejecutados). Su relevancia es limitada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, y la model card es extremadamente escueta y críptica.

El modelo hereda la tarea de generación de vídeo a partir de texto del Wan2.1 original, que emplea un esquema de difusión (diffusion transformer) para sintetizar clips de vídeo. Sin embargo, la información pública disponible no permite confirmar qué modificaciones concretas introduce este finetune ni qué resultados obtiene. La model card menciona "TM" como función de pérdida, una distribución uniforme σ ~ U(0,1) con shift=5 y t=1000σ, y unos datos de entrenamiento designados únicamente como "OV", sin más detalle.

Dado que el repositorio no incluye resultados de benchmarks, no especifica licencia y no documenta los idiomas soportados, esta ficha debe tratarse como una descripción de un artefacto experimental de trazabilidad limitada. Es relevante únicamente para quienes investiguen variantes arquitectónicas del Wan2.1 o quieran reproducir el esquema de bloques descrito, no para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrent transformer (según tags del autor); derivada de Wan2.1-T2V-1.3B (diffusion transformer) |
| Parámetros totales | Aproximadamente 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B; no confirmado para este finetune) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (la model card menciona "EMA/non-EMA weights" sin especificar formato de archivo) |

## Arquitectura y entrenamiento

El modelo base, Wan2.1-T2V-1.3B, es un diffusion transformer para generación de vídeo texto-a-vídeo. Este finetune introduce una estructura de bloques descrita como "A5 → B5×4 → C5", que resulta en 15 bloques únicos y 30 bloques ejecutados, lo que sugiere un esquema de recurrencia o reutilización de bloques (de ahí la etiqueta "recurrent-transformer"). No se especifica si los bloques se comparten pesos, si hay conexiones residuales entre pasadas o cómo afecta esto al cómputo total.

En cuanto al entrenamiento, la model card indica una función de pérdida denominada "TM" (sin expandir), un muestreo de σ uniforme en (0,1) con shift=5 y t=1000σ, y unos datos designados como "OV" sin más detalle. No se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o algún tipo de alineación. El autor menciona que se conservan todos los pesos EMA y no EMA, pero que no se guardó ningún checkpoint del estado final ("last state: none saved"), lo que limita la reproducibilidad.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline del modelo base Wan2.1-T2V-1.3B.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (el modelo base Wan2.1 acepta prompts en varios idiomas, pero este finetune no lo especifica).
- No se documentan modos especiales como thinking mode, visión, audio u otros.
- La model card no describe ninguna capacidad adicional más allá de la generación de vídeo.

## Casos de uso

- Investigación sobre arquitecturas recurrentes en difusión: el esquema de 15 bloques únicos y 30 ejecutados puede estudiarse para analizar el impacto de la reutilización de bloques en la calidad del vídeo generado, comparándolo con el Wan2.1 original.
- Reproducción de experimentos de finetune: dado que se conservan pesos EMA y no EMA, un investigador podría comparar el efecto de ambos conjuntos en la estabilidad de la generación.
- Generación de clips de vídeo de baja resolución para prototipado: al derivar de un modelo de 1.300 millones de parámetros, es viable en hardware de consumo moderado para pruebas preliminares de texto-a-vídeo.
- Estudio de esquemas de pérdida alternativos: la pérdida "TM" y el muestreo σ con shift=5 pueden servir como referencia para experimentos de entrenamiento en difusión.
- Análisis de trazabilidad de checkpoints: el repositorio documenta la ausencia de checkpoint final, lo que puede usarse como caso de estudio sobre buenas prácticas de publicación de modelos.
- Base para finetunes posteriores: al ser un derivado del Wan2.1, puede servir como punto de partida para otros ajustes, aunque la falta de licencia clara desaconseja su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de aproximadamente 1.300 millones de parámetros en precisión FP16 se estiman en torno a 3-4 GB solo para pesos, más el overhead del pipeline de difusión (VAE, text encoder), que puede elevar el total a 8-12 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: probablemente sí, en modelos con al menos 12 GB de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: no documentadas. Al derivar de un modelo Diffusers, podría integrarse con la librería `diffusers` de Hugging Face, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5 | ~1.300 M | No disponible | No disponible | Hugging Face (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | ~1.300 M | No disponible | No disponible en la información proporcionada | Hugging Face (modelo base público) |
| Otros modelos texto-a-vídeo de tamaño similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre este finetune y el modelo base ni con otras alternativas.

## Limitaciones y advertencias

- La model card es extremadamente escueta y no documenta sesgos conocidos, composición del dataset ni proceso de alineación.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente o no fiel al prompt, especialmente sin evaluación publicada.
- Limitaciones de contexto e idioma: no documentadas; se desconoce si el finetune preserva las capacidades multilingües del Wan2.1 original.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. Se desaconseja su uso en producción hasta que el autor la especifique.
- No se guardó checkpoint del estado final ("none saved"), lo que limita la reproducibilidad y la verificación de resultados.
- El repositorio tiene cero descargas y cero likes, sin evidencia de validación por parte de la comunidad.
- La nomenclatura de la model card ("TM", "OV", "A5 → B5×4 → C5") no está explicada, lo que dificulta la interpretación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
