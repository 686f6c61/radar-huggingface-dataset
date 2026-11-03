# jnorthrup/jeva-4b-mlx-q4g32-dist

## Resumen

Jeva-4B MLX q4g32-dist es una distribucion cuantizada del modelo LIQIIIII/Jeva-4B, publicada por el usuario jnorthrup. No se trata de un modelo entrenado desde cero, sino de un derivado que empaqueta el backbone original en formato MLX con cuantizacion de 4 bits y grupo de 32, embeddings en 8 bits con grupo de 64 y la cabeza de decision original en float32. El paquete incluye tokenizer, configuracion de decision y artefactos de procedencia. Esta pensado para ejecutarse en Apple silicon mediante la libreria MLX, con la cabeza de decision corriendo en PyTorch float32 sobre CPU.

El modelo base cuenta con 4.205.751.296 parametros segun los pesos safetensors, lo que lo situa en la categoria de modelos de aproximadamente 4B. La distribucion ocupa 5,7 GB en el repositorio e incluye tanto safetensors como GGUF entre sus tags. La model card no documenta el pipeline, los idiomas soportados ni la licencia del derivado, aunque indica que el codigo y modelo originales son Apache-2.0 y que se conserva la atribucion en LICENSE y NOTICE.

La relevancia de esta publicacion es acotada: es un artefacto de cuantizacion orientado a inferencia local en hardware Apple, no una nueva version del modelo. El autor advierte explicitamente de que no se reclama paridad de benchmarks con el modelo original y remite a provenance.json para revisar revisiones de origen, evidencia de calibracion y limitaciones. Con 13 descargas y 0 likes, se trata de un paquete de nicho, probablemente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone cuantizado en MLX; cabeza de decision en PyTorch float32) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone 4 bits con grupo de 32; embeddings 8 bits con grupo de 64; cabeza de decision float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el derivado; el codigo y modelo originales son Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que el backbone se ejecuta en MLX y que la cabeza de decision original se mantiene en PyTorch float32 sobre CPU, lo que sugiere una separacion entre el cuerpo del modelo y un modulo de decision especifico. El checkpoint de origen es LIQIIIII/Jeva-4B, revision 50078fcff42bd63717105dc20bd4e55eccf8c83d.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La cuantizacion se describe como calibrada con Kali, lo que indica un proceso de calibracion para preservar el comportamiento del backbone tras la reduccion de precision. El autor insiste en que esta release es una cuantizacion y no una afirmacion de paridad de benchmarks; provenance.json recoge revisiones de origen, evidencia de calibracion y limitaciones, y los ficheros pueden verificarse con SHA256SUMS.

## Capacidades

- Generacion de texto conversacional: el tag conversational y la presencia de tokenizer y configuracion de decision apuntan a un uso orientado a dialogo.
- Ejecucion local en Apple silicon mediante MLX, con la cabeza de decision en PyTorch float32 sobre CPU.
- Compatibilidad con endpoints segun el tag endpoints_compatible.
- No se documentan capacidades de codigo, matematicas, vision, audio ni modo thinking.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en Mac con Apple silicon: el paquete MLX permite cargar el modelo con Jeva.from_mlx y ejecutar inferencia local sin GPU dedicada, usando la cabeza de decision en CPU.
- Evaluacion de tecnicas de cuantizacion: al incluir backbone 4 bits/grupo 32 y embeddings 8 bits/grupo 64, sirve para comparar la degradacion frente al modelo original en float32.
- Despliegue en entornos con recursos limitados: los 5,7 GB del repositorio y la cuantizacion agresiva facilitan la ejecucion en equipos de consumo con memoria unificada.
- Reproducibilidad de artefactos: la presencia de provenance.json y SHA256SUMS permite verificar integridad y trazabilidad en pipelines de investigacion.
- Integracion en herramientas de linea de comandos o endpoints compatibles para pruebas de dialogo.
- Base para experimentos de investigacion sobre cabezas de decision separadas del backbone, dado el diseno hibrido MLX/PyTorch.
- Pruebas de compatibilidad con GGUF y safetensors en flujos de conversion y validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta release de cuantizacion no reclama paridad de benchmarks con el modelo original.

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma oficial; el repositorio ocupa 5,7 GB y el backbone esta cuantizado a 4 bits, por lo que se espera un consumo de memoria unificado del orden de varios GB, sin cifra confirmada.
- GPU recomendadas: no disponibles; el diseno esta orientado a Apple silicon con MLX.
- Compatibilidad con GPU de consumo: no confirmada; el flujo documentado requiere Apple silicon y Python 3.12 con el extra .[mlx].
- Opciones de despliegue: MLX mediante el fork jnorthrup/Jeva (release jeva-4b-mlx-q4g32-dist-v1); el tag GGUF sugiere posible uso con llama.cpp u Ollama, pero no se documenta el procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de tamano similar.

## Limitaciones y advertencias

- Es un derivado cuantizado, no un modelo nuevo; el autor no garantiza paridad de rendimiento con el modelo original.
- La licencia del derivado no esta declarada; solo se indica que el codigo y modelo originales son Apache-2.0, por lo que el uso comercial debe verificarse en LICENSE y NOTICE.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- No se documenta la longitud de contexto, lo que impide planificar cargas de contexto largo.
- Requiere Apple silicon y Python 3.12 con el extra .[mlx]; la cabeza de decision corre en PyTorch float32 sobre CPU, lo que puede limitar el rendimiento.
- El proceso de calibracion (Kali) y sus posibles efectos sobre la calidad no estan cuantificados en la model card.
- Con 13 descargas y 0 likes, hay poca validacion comunitaria; conviene verificar los ficheros con SHA256SUMS antes de usarlos en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/jnorthrup/jeva-4b-mlx-q4g32-dist
- Modelo base: https://huggingface.co/LIQIIIII/Jeva-4B
- Fork del codigo: https://github.com/jnorthrup/Jeva
- Documentacion de cuantizacion MLX: docs/mlx-quant.md dentro del fork jnorthrup/Jeva
