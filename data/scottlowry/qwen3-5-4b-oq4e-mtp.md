# scottlowry/Qwen3.5-4B-oQ4e-mtp

## Resumen

Qwen3.5-4B-oQ4e-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-4B, publicada por el usuario scottlowry. El modelo original pertenece a la familia Qwen3.5 desarrollada por Alibaba Qwen, mientras que esta versión concreta es un artefacto derivado producido con la herramienta oQ de oMLX (versión v0.7.4.dev1), orientada específicamente al ecosistema MLX de Apple para ejecución en hardware Apple Silicon.

La característica diferencial de esta publicación es el uso de cuantización de precisión mixta: en lugar de aplicar un único esquema de bits a todos los pesos, distribuye las capas entre formatos affine de 4, 5, 6 y 8 bits (con grupo de 64) más una fracción en BF16, alcanzando una media efectiva de 5,688 bits por peso. El checkpoint completo ocupa 3,086 GiB, lo que lo hace viable en equipos con memoria unificada modesta. El modelo incorpora además una cabeza MTP (multi-token prediction) de 0,121B parámetros y un componente de visión de 0,334B parámetros, lo que indica que el modelo base es multimodal.

Con 4.659.865.088 parámetros totales reales según los safetensors, esta ficha describe una variante de despliegue local, no un modelo entrenado desde cero: no hay información publicada sobre datos de entrenamiento, benchmarks ni licencia en la documentación disponible. Su relevancia actual radica en demostrar flujos de cuantización mixta automatizada para MLX, un nicho en crecimiento para inferencia local en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeza MTP y torre de visión; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit, 5-bit, 6-bit y 8-bit (grupo 64) más BF16; media efectiva 5,688 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,555 GB / 2,380 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,091 GB / 0,085 GiB |
| Total | 4,660B | 3,313 GB / 3,086 GiB |

Distribucion de bits:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 2,805B | 60,194% | 1,469 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,478B | 31,711% | 0,946 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,029B | 0,622% | 0,022 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,014% | 0,001 GiB | 8,50 |
| BF16 | 0,348B | 7,459% | 0,647 GiB | 16,00 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de la familia Qwen3.5, del que no se detallan en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la composición del dataset de entrenamiento. La presencia de una cabeza MTP (multi-token prediction) de 0,121B parámetros sugiere que el modelo base incorpora decodificación especulativa nativa o entrenamiento auxiliar para predecir varios tokens por paso, una técnica habitual para acelerar la inferencia. El componente de visión de 0,334B parámetros confirma que el modelo base es multimodal (texto e imagen).

Esta publicación concreta no entrena el modelo: aplica cuantización de precisión mixta con oQ (oMLX v0.7.4.dev1), que asigna distintos anchos de bits por tensor según su sensibilidad. El 60,194% de los pesos lógicos queda en 4 bits, el 31,711% en 5 bits, una fracción mínima en 6 y 8 bits, y el 7,459% se conserva en BF16 (probablemente capas de normalización, embeddings o componentes sensibles). El resultado es un checkpoint de 3,086 GiB con una media de 5,688 bits/peso, un compromiso entre tamaño y fidelidad respecto al modelo original. No hay información sobre RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en el modelo base; el alcance exacto no está documentado en esta publicación.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,334B parámetros, por lo que el modelo base admite entradas de imagen.
- Predicción multi-token (MTP): la cabeza dedicada de 0,121B parámetros permite decodificación especulativa o generación de varios tokens por paso, según la implementación del modelo base.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está en formato MLX y ocupa 3,086 GiB, por lo que se puede cargar en Macs con memoria unificada de 8 GB o más usando la librería mlx, sin necesidad de GPU dedicada.
- Prototipado de asistentes multimodales en local: al incluir torre de visión, permite experimentar con flujos imagen-texto en un equipo de sobremesa sin enviar datos a la nube.
- Evaluación de cuantización mixta: sirve como referencia para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits sobre el mismo modelo base, midiendo la degradación con la media de 5,688 bits/peso.
- Aceleración con decodificación especulativa: la cabeza MTP integrada permite probar técnicas de generación multi-token en MLX y medir el incremento de throughput frente a decodificación autoregresiva estándar.
- Desarrollo de aplicaciones offline en macOS: al ser un artefacto MLX sin dependencias de servidores, encaja en herramientas de escritorio que requieran privacidad total de los datos procesados.
- Investigación sobre sensibilidad de capas: la distribución por bits publicada (4/5/6/8/BF16) permite estudiar qué componentes del transformer toleran menor precisión y cuáles requieren BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 3,086 GiB en disco y requiere al menos esa cantidad de memoria para cargarse; en la práctica, con overhead de ejecución MLX, se recomienda un mínimo de 8 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (series M1, M2, M3, M4 y superiores), dado que la librería es MLX. No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no aplica a GPU NVIDIA/AMD por el formato MLX; en Mac, cabe en cualquier equipo con 8 GB o más de memoria unificada.
- Opciones de despliegue: librería mlx y herramientas compatibles con MLX (por ejemplo, mlx-lm para generación). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en safetensors cuantizados con esquema affine de oQ, no en GGUF.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto y de si se explota la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwen3.5-4B-oQ4e-mtp | 4,660B | no disponible | safetensors MLX (mixto 4-8 bits) | no disponible | Hugging Face, 87 descargas |
| Qwen/Qwen3.5-4B (base) | 4B (aprox.) | no disponible | safetensors | no disponible | Hugging Face |
| Cuantizaciones GGUF 4-bit del mismo base | 4B (aprox.) | no disponible | GGUF | no disponible | no disponible en la información |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible, ya que no se han publicado benchmarks ni del modelo base ni de esta cuantización en la información proporcionada.

## Limitaciones y advertencias

- No hay información sobre la licencia, ni del modelo base ni de esta cuantización; no se puede asumir uso comercial permitido sin verificar la licencia de Qwen/Qwen3.5-4B.
- La cuantización mixta introduce pérdida de precisión respecto al BF16 original; el 60,194% de los pesos está en 4 bits, lo que puede degradar tareas sensibles (matemáticas, código, razonamiento largo).
- El modelo está empaquetado exclusivamente para MLX: no es portable a CUDA, ROCm ni CPU convencional sin reconversión.
- Riesgo de alucinación y sesgos: no documentados en esta publicación; deben evaluarse empíricamente antes de usar en producción.
- Idiomas soportados y longitud de contexto no disponibles, lo que impide garantizar cobertura multilingüe o conversaciones de contexto largo.
- El autor advierte que el checkpoint se recuantizó el 2026-11-11 con oMLX v0.7.4.dev1; copias anteriores pueden diferir en pesos y calidad.
- Con 87 descargas y 0 likes, es un artefacto de nicho sin validación comunitaria amplia; conviene verificar su integridad y reproducibilidad antes de integrarlo en pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de oMLX/oQ: https://github.com/jundot/omlx
