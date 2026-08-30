# LSW142857/OPSD

## Resumen

OPSD (On-Policy Self-Distillation) es una tecnica de entrenamiento para modelos de lenguaje que convierte un unico modelo en estudiante y profesor simultaneamente: el estudiante recibe solo el enunciado del problema, mientras que el profesor recibe ademas la solucion de referencia (informacion privilegiada). El entrenamiento realiza un ajuste de distribuciones a nivel de token sobre las trayectorias generadas on-policy por el propio estudiante. El repositorio `LSW142857/OPSD` actua como indice publico (registry) que organiza los artefactos de los modelos entrenados con esta tecnica, todos basados en el modelo base Qwen3.5-9B.

El repositorio no contiene pesos de modelo directamente; en su lugar, ofrece una jerarquia de directorios (`strong`, `medium`, `weak`) con punteros a artefactos de iteraciones concretas. Los modelos reales fusionados se publican en repositorios separados, como `OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged` o `Qwen3.5-9B-OPSD-PI-Strong-ckpt15`. La relevancia de este registro reside en que proporciona un esquema estable y versionado para reproducir experimentos de auto-distilacion on-policy, un area emergente en el ajuste de modelos de razonamiento con datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el registro no almacena pesos; los artefactos pueden ser LoRA sin fusionar o modelos fusionados) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de 9 mil millones de parametros. Sobre esta base se aplica la tecnica OPSD: durante el entrenamiento, el modelo se condiciona de dos formas distintas en cada paso. Con el contexto de estudiante, recibe solo el problema; con el contexto de profesor, recibe el problema mas la solucion de referencia. La funcion de perdida realiza un matching de distribuciones a nivel de token entre las predicciones del estudiante y las del profesor, pero solo sobre las trayectorias que el propio estudiante genera (on-policy). Esto evita la necesidad de un modelo profesor externo y estabiliza el entrenamiento al usar datos generados por el mismo modelo.

Los experimentos registrados usan informacion privilegiada (PI) y se organizan por nivel de intensidad (`strong`, `medium`, `weak`) y por modo de prompt (`first_user` y `trailing_user`). El registro indica que algunos artefactos son LoRA sin fusionar con un bundle de MTP (multi-token prediction), mientras que otros son modelos fusionados completos. No se especifican detalles sobre el dataset de entrenamiento, el numero total de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.5-9B, hereda las capacidades de razonamiento y generacion de texto del modelo base, aunque no se documentan capacidades especificas de esta variante.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: el entrenamiento sobre trayectorias de agentes de codigo (512 trayectorias mencionadas en el checkpoint Strong) sugiere que el modelo esta orientado a tareas de agente, pero no hay confirmacion explicita.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos de auto-distilacion: el registro permite a investigadores localizar iteraciones concretas de entrenamiento OPSD, con su numero de updates y formato de artefacto, para reproducir o comparar resultados.
- Evaluacion de checkpoints intermedios: los artefactos `iter_XXXXXXX` permiten estudiar la evolucion del modelo durante el entrenamiento, analizando la curva de aprendizaje en tareas de razonamiento.
- Desarrollo de agentes de codigo: los modelos entrenados sobre trayectorias de agentes de codigo (512 trayectorias en el caso Strong) podrian usarse como base para sistemas de generacion y depuracion de codigo, aunque no hay benchmarks publicados que lo confirmen.
- Investigacion en destilacion on-policy: el esquema de registro y los artefactos LoRA sin fusionar facilitan el estudio de la tecnica OPSD frente a otras formas de destilacion.
- Integracion en pipelines de fine-tuning: los adaptadores LoRA publicados pueden aplicarse sobre Qwen3.5-9B para obtener modelos especializados sin necesidad de reentrenar desde cero.
- Auditoria de versiones de modelos: el registro establece un contrato de nombres y una jerarquia clara, util para equipos que necesitan rastrear que version de un modelo se uso en un experimento o produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Un modelo de 9B en precision FP16 requiere aproximadamente 18 GB de VRAM, pero no se especifica cuantizacion ni optimizaciones.
- GPU recomendadas: el nombre del repositorio `A6000` sugiere que el entrenamiento se realizo en una NVIDIA RTX A6000 (48 GB), pero no se indica requisitos de inferencia.
- Compatibilidad con GPUs de consumo: probablemente quepa en una RTX 3090/4090 (24 GB) con cuantizacion, pero no se confirma.
- Opciones de despliegue: no disponibles en la informacion. Dado que es un modelo basado en Qwen, podria usarse con vLLM, llama.cpp u Ollama, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con modelos de la misma categoria (otros Qwen3.5-9B o modelos de 9B con tecnicas de destilacion). La informacion publica no incluye resultados de evaluacion.

## Limitaciones y advertencias

- El repositorio `LSW142857/OPSD` no contiene pesos de modelo; es solo un indice. Para usar un modelo real hay que acceder a los repositorios de artefactos enlazados.
- No se especifica la licencia, por lo que el uso comercial de los modelos derivados es incierto hasta que el autor la aclare.
- No hay datos de sesgos, alucinacion o limitaciones de contexto. Al estar basado en Qwen3.5-9B, hereda las limitaciones del modelo base, pero no se documentan.
- Algunos artefactos son LoRA sin fusionar; cargarlos incorrectamente puede producir errores de compatibilidad.
- El registro no incluye datasets, logs de entrenamiento ni estado del optimizador, lo que limita la reproducibilidad completa de los experimentos.

## Enlaces

- Repositorio OPSD (registry): https://huggingface.co/LSW142857/OPSD
- Modelo fusionado Medium-Trailing: https://huggingface.co/LSW142857/OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged
- Checkpoint Strong ckpt15: https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-PI-Strong-ckpt15
- Artefacto iter32 (evaluacion): https://huggingface.co/LSW142857/Qwen3.5-9B-OPSD-iter32
- Pagina del modelo en FriendliAI: https://friendli.ai/models/LSW142857/OPSD-PI-Qwen3.5-9B-Medium-Trailing-1024-A6000-Merged
- Repositorio GitHub de OPSD: https://github.com/siyan-zhao/OPSD
