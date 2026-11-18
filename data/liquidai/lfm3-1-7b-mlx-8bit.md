# LiquidAI/LFM3-1.7B-MLX-8bit

## Resumen

LFM3-1.7B-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo LFM3-1.7B de Liquid AI, optimizada específicamente para inferencia en Apple Silicon. Liquid AI es una empresa derivada del MIT que desarrolla modelos de lenguaje de arquitectura propia (denominada "Liquid" en sus tags), y este lanzamiento forma parte de la tercera generación de su familia LFM. El modelo resuelve el problema de ejecutar un LLM de 1.700 millones de parámetros en hardware de consumo con memoria unificada, manteniendo una calidad cercana al original gracias a una cuantización afín de 8 bits con grupos de 64.

El modelo base cuenta con 1.728.801.536 parámetros reales (según los pesos en safetensors) y soporta 17 idiomas, entre ellos el castellano. Esta variante MLX ocupa 1,84 GB de pesos y requiere MLX-VLM 0.7.11 o superior para cargarse, ya que la librería mlx-lm todavía no incluye soporte estable para la arquitectura LFM3 (hay un pull request en revisión). Es relevante ahora porque permite a desarrolladores con un Mac (Apple Silicon) desplegar un modelo conversacional multilingüe con modo de razonamiento activable localmente, sin GPU dedicada.

La ficha se centra en esta variante cuantizada; los detalles completos de arquitectura y entrenamiento remiten a la model card del modelo base, que el autor enlaza explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo "Liquid"/LFM3; detalles en la model card del modelo base) |
| Parametros totales | 1.728.801.536 (1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine) con grupos de 64; esta variante es MLX-8bit |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX, 8-bit); tamano del repo 1,9 GB; pesos 1,84 GB |
| Libreria de inferencia | MLX (via MLX-VLM >= 0.7.11) |
| Modelo base | LiquidAI/LFM3-1.7B (relacion: quantized) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de las etiquetas "lfm3" y "liquid" y de que se trata de un modelo de generación de texto conversacional. La model card de esta variante remite explícitamente a la model card de LiquidAI/LFM3-1.7B para los detalles de arquitectura y uso, por lo que no se dispone aquí de datos sobre tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO.

Lo que sí es específico de esta variante es el proceso de cuantización: pesos en 8 bits con cuantización afín y tamaño de grupo 64, empaquetados en safetensors para el framework MLX de Apple. Esta cuantización reduce el peso a 1,84 GB, lo que permite cargar el modelo en memoria unificada de equipos Apple Silicon. La model card menciona además un "modo thinking" (razonamiento) que permanece desactivado salvo que se active explícitamente con el flag `--enable-thinking`, lo que sugiere que el modelo base fue entrenado con capacidad de razonamiento opcional.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Modo de razonamiento ("thinking") activable mediante `--enable-thinking`; desactivado por defecto.
- Capacidades multilingües en 17 idiomas, incluido el castellano.
- Ajuste recomendado diferenciado para matemáticas y ciencia (temperatura 1.0, top-p 0.95, top-k 20, repetition penalty 1.0) frente al uso general (temperatura 0.1, top-k 50, repetition penalty 1.1).
- Generación de hasta 16.384 tokens por respuesta según el ejemplo de la model card (`--max-tokens 16384`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modo thinking sugiere razonamiento, pero no se documenta uso agéntico.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en Mac: con 1,84 GB de pesos, el modelo se puede ejecutar íntegramente en un Mac con Apple Silicon mediante MLX-VLM, sin conexión a la nube, para chats multi-turno en castellano y otros 16 idiomas.
- Razonamiento matemático y científico asistido: la model card recomienda parámetros de muestreo específicos (temperatura 1.0, top-p 0.95) para tareas de matemáticas y ciencia, lo que lo hace adecuado para resolución de problemas paso a paso en un entorno de escritorio.
- Prototipado rápido de aplicaciones LLM: al requerir solo `pip install mlx-vlm` y un comando de generación, sirve para validar prompts y flujos conversacionales antes de migrar a modelos mayores o a la API de Liquid AI.
- Procesamiento de texto multilingüe en local: con soporte para 17 idiomas (incluidos árabe, chino, japonés, coreano, hindi y tailandés), es útil para traducción asistida o clasificación de textos en pipelines que no pueden enviar datos a servicios externos.
- Generación de texto con razonamiento explícito: activando `--enable-thinking` se obtienen cadenas de razonamiento para tareas que requieren justificación, útil en entornos educativos o de auditoría de respuestas.
- Desarrollo y pruebas en CI sobre runners macOS: el formato MLX permite integrar pruebas de regresión de prompts en máquinas Apple sin GPU dedicada, con un footprint de memoria reducido (1,84 GB de pesos).
- Evaluación comparativa de cuantizaciones: sirve como referencia de la calidad de la cuantización 8-bit frente al modelo base de 1,7 B para decidir qué variante desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos 8-bit ocupan 1,84 GB; el consumo total de memoria unificada será superior al incluir KV cache y overhead del runtime (no se especifica cifra exacta).
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a esta variante MLX; para esas plataformas habría que usar el modelo base u otra cuantización.
- Cabe en hardware de consumo Apple: sí, en cualquier Mac con Apple Silicon con memoria unificada suficiente (los 1,84 GB de pesos lo permiten incluso en configuraciones de 8 GB, aunque el margen para contexto largo es limitado).
- Despliegue: MLX-VLM >= 0.7.11 (`python -m mlx_vlm.generate ...`). mlx-lm aún no carga LFM3 (soporte en revisión en ml-explore/mlx-lm#2016). Alternativas para otras plataformas: no disponibles en esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-8bit | 1,7 B | no disponible | MLX safetensors 8-bit | lfm1.0 | Solo Apple Silicon; 17 idiomas; modo thinking |
| LFM3-1.7B (base) | 1,7 B | no disponible | safetensors | lfm1.0 | Referencia sin cuantizar del que deriva esta variante |
| Otras alternativas de ~1-2 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La licencia es `lfm1.0` (etiquetada como `other`): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- Esta variante es exclusiva para MLX/Apple Silicon; no es portable a CUDA, ROCm ni CPU convencional sin reconvertir los pesos.
- Dependencia de MLX-VLM >= 0.7.11: mlx-lm no soporta todavía LFM3, lo que limita la integración con herramientas que esperan la API estándar de mlx-lm.
- El modo de razonamiento está desactivado por defecto; si se espera comportamiento de "thinking" hay que activarlo explícitamente, y los parámetros de muestreo recomendados difieren entre uso general y matemáticas/ciencia.
- La cuantización 8-bit introduce una pérdida de calidad respecto al modelo base no cuantizada; no se han publicado métricas que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a un modelo de 1,7 B: no se han publicado evaluaciones de fidelidad factual.
- No se dispone de información sobre sesgos, longitud de contexto efectiva ni rendimiento en idiomas de bajos recursos dentro de los 17 declarados.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no deben asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Pull request de soporte LFM3 en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016
