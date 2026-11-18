# LiquidAI/LFM3-1.7B-MLX-6bit

## Resumen

LFM3-1.7B-MLX-6bit es la versión cuantizada a 6 bits en formato MLX del modelo LFM3-1.7B desarrollado por Liquid AI, optimizada específicamente para inferencia en Apple Silicon. Se trata de un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) que forma parte de la tercera generación de la familia Liquid Foundation Models. Esta variante concreta emplea cuantización afín de 6 bits con grupos de 64, lo que reduce el peso de los pesos a 1,41 GB, facilitando su ejecución en equipos Mac con memoria unificada.

El modelo base cubre generación de texto y conversación, con soporte para 16 idiomas (entre ellos el castellano) y capacidad de razonamiento explícito mediante un modo "thinking" que se activa de forma optativa. La relevancia de esta ficha radica en que permite desplegar un modelo de casi 2.000 millones de parámetros en hardware de consumo Apple sin necesidad de GPU dedicada, manteniendo una huella de memoria muy contenida.

La versión MLX-6bit se distribuye bajo licencia LFM1.0 (licencia "other" con nombre propio) y requiere MLX-VLM 0.7.11 o superior para su carga, ya que el soporte en mlx-lm todavía está en revisión en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles completos en la model card del modelo base) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 6 bits afín con grupos de 64 (esta variante); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX), 1,41 GB |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como parte de la familia LFM3 de Liquid AI y lo describe como un transformer de aproximadamente 1,7 mil millones de parámetros. La model card de esta variante remite explícitamente a la model card del modelo base (LiquidAI/LFM3-1.7B) para los detalles de arquitectura y entrenamiento, por lo que no se dispone aquí de datos concretos sobre número de tokens de entrenamiento, composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras etapas de alineamiento.

La innovación técnica destacable de esta variante concreta es la cuantización afín de 6 bits con grupos de 64, aplicada sobre los pesos del modelo base para su ejecución en Apple Silicon mediante MLX. El modelo incorpora además un modo de razonamiento ("thinking") que permanece desactivado por defecto y se habilita mediante el flag `--enable-thinking`. No se dispone de información sobre innovaciones adicionales como decodificación especulativa o atención lineal en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno en 16 idiomas, incluido el castellano.
- Razonamiento explícito mediante modo "thinking" opcional (`--enable-thinking`), desactivado por defecto.
- Razonamiento matemático y científico, con parámetros de muestreo recomendados específicos (`--temperature 1.0 --top-p 0.95 --top-k 20 --repetition-penalty 1.0`).
- Generación de texto general con parámetros de muestreo conservadores recomendados (`--temperature 0.1 --top-k 50 --repetition-penalty 1.1`).
- Soporte multilingüe amplio: árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco, además del inglés.
- Ejecución en Apple Silicon mediante MLX-VLM (versión 0.7.11 o superior).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes, visión o audio para esta variante.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno directamente en equipos Apple Silicon gracias a su huella de 1,41 GB en formato MLX-6bit, sin necesidad de GPU dedicada ni conexión a la nube.
- Razonamiento matemático y científico en local: con el modo "thinking" activado y los parámetros de muestreo recomendados (temperatura 1.0, top-p 0.95, top-k 20), resulta adecuado para resolver problemas paso a paso en un portátil o Mac mini.
- Prototipado rápido de aplicaciones de texto en macOS: desarrolladores que trabajan con MLX pueden integrar el modelo en scripts de generación mediante `mlx_vlm.generate` para validar prompts y flujos antes de pasar a producción.
- Procesamiento multilingüe de documentos: al cubrir 16 idiomas, puede emplearse para tareas de resumen, reescritura o extracción de información en corpus que mezclen castellano, inglés, francés, alemán y otras lenguas soportadas.
- Generación de contenido asistida en entornos con privacidad estricta: al ejecutarse íntegramente en local, es apto para flujos donde los datos no pueden salir del dispositivo, como borradores internos o análisis de texto confidencial.
- Evaluación comparativa de modelos pequeños en investigación: su tamaño contenido y su formato MLX lo hacen útil para experimentos de reproducibilidad y comparación de cuantizaciones en hardware Apple dentro de laboratorios académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,41 GB solo para los pesos en formato MLX-6bit; hay que sumar la memoria del contexto y del runtime de MLX-VLM.
- Hardware objetivo: Apple Silicon (Mac con chip M-series); el formato MLX no está pensado para GPU NVIDIA o AMD.
- GPU dedicadas (A100, H100, RTX 4090): no aplica para esta variante MLX; para esos entornos habría que usar otras variantes del modelo base.
- Cabe en equipos de consumo Apple: sí, con memoria unificada de 8 GB o superior se espera margen suficiente, aunque el dato exacto de consumo total no está disponible.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior mediante `python -m mlx_vlm.generate`; el soporte en mlx-lm está en revisión (PR ml-explore/mlx-lm#2016) y ninguna release de mlx-lm carga LFM3 todavía.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-6bit (este) | 1,73 B | No disponible | LFM1.0 | MLX safetensors 6-bit | Optimizado para Apple Silicon, 16 idiomas |
| LFM3-1.7B (base) | 1,73 B | No disponible | LFM1.0 | Safetensors | Modelo original sin cuantizar; misma familia |
| Otras variantes MLX de modelos ~1-2 B | No disponible | No disponible | No disponible | MLX | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- La model card de esta variante remite a la del modelo base para arquitectura y entrenamiento; no se documentan aquí sesgos conocidos ni composición del dataset.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas de fidelidad factual.
- La longitud de contexto no está especificada en la información disponible, lo que impide garantizar un rendimiento adecuado en tareas de contexto largo.
- El soporte en mlx-lm está todavía en revisión (PR #2016), por lo que la integración con herramientas que dependan de mlx-lm puede fallar; se requiere MLX-VLM ≥ 0.7.11.
- La licencia LFM1.0 es una licencia "other" con nombre propio; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que pueden existir restricciones adicionales no detalladas aquí.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPU NVIDIA/AMD sin reconvertir los pesos.
- El modo "thinking" está desactivado por defecto; los resultados de razonamiento dependen de activarlo explícitamente y de usar los parámetros de muestreo recomendados.
- No se documenta soporte de tool calling, agentes o visión en esta variante, lo que limita su uso en pipelines agénticos complejos.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-6bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
