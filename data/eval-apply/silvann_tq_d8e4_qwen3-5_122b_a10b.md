# eval-apply/silvann_tq_D8E4_qwen3.5_122b_a10b

## Resumen

`silvann_tq_D8E4_qwen3.5_122b_a10b` es un empaquetado cuantizado del modelo Qwen/Qwen3.5-122B-A10B, un transformer de tipo mezcla de expertos (MoE) desarrollado por el equipo Qwen. El repositorio, publicado por el usuario eval-apply, no modifica los pesos originales en su esencia: solo cambia como se almacenan, aplicando una politica de cuantizacion mixta (8 bits en capas densas, 4 bits en expertos enrutados) mediante el codec TurboQuant. El resultado comprime 233 GiB de pesos en bruto hasta 62,8 GiB.

La relevancia de este empaquetado reside en su objetivo de despliegue: está disenado para ejecutarse en una tarjeta grafica de 12 GB de VRAM. La tarjeta mantiene las matrices de capas (unos 4,3 GiB), la cabeza de salida (0,7 GiB) y la cache de conversacion, mientras que los 54 GiB de expertos se ejecutan en CPU desde RAM o desde disco a traves de la cache propia del motor SiLVANN. Esto permite servir un modelo de 122B parametros totales en hardware de consumo, a costa de depender de un runtime especifico.

El formato propietario `silvann-packed-v3` no es compatible con `transformers`; requiere SiLVANN v0.18.0 o superior. El tokenizador, la plantilla de chat y las configuraciones son las del modelo original, y la licencia Apache 2.0 se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con proyecciones de atencion y DeltaNet; capa de prediccion multi-token en la capa 0 |
| Parametros totales | 122B (heredados del modelo base) |
| Parametros activos | 10B (heredados del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 8 bits en capas densas (atencion, DeltaNet, experto compartido, embedding y cabeza), 4 bits en expertos enrutados (TurboQuant con escala por fila); normas, router y tensores pequenos sin perdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (pack.json, layers/NNN/, global.pkl); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 122B parametros totales con 10B activos por token, que combina capas de atencion con proyecciones DeltaNet (una variante de atencion lineal) y una capa de prediccion multi-token en la capa 0. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo original de Qwen y no se detallan aqui.

La innovacion tecnica de este empaquetado es el codec TurboQuant: cada matriz se rota a lo largo de su eje de entrada con una rotacion bloqueada de Hadamard y signos antes de cuantizarse, y los expertos enrutados se almacenan como registros individuales alineados con las ranuras del motor. Esto permite que un experto leido desde disco sea una sola lectura, lo que segun el autor produjo una mejora del 15% en velocidad de respuesta desde un array NVMe frente a empaquetados anteriores. La politica de anchos es `D8E4`: denso a 8 bits, expertos a 4 bits.

## Capacidades

- Generacion de texto y razonamiento, heredados del modelo base Qwen3.5-122B-A10B.
- Capacidades de codigo y matematicas propias del modelo original (no se detallan resultados concretos).
- Vision: el paquete incluye una torre de vision en `global.pkl`, por lo que el modelo conserva la capacidad multimodal del base.
- Prediccion multi-token mediante la capa adicional de la capa 0, que puede habilitar decodificacion especulativa.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este empaquetado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia de un modelo de 122B en una estacion de trabajo con GPU de 12 GB: la tarjeta aloja capas densas, cabeza y cache, y los expertos se sirven desde RAM o disco mediante la cache de SiLVANN. Adecuado para prototipado y evaluacion local sin acceso a clusters.
- Evaluacion comparativa de cuantizacion: util para medir la perdida de calidad de una politica D8E4 frente a alternativas como D4E4 del mismo autor, manteniendo el resto de variables constante.
- Servicio de chat multi-turno con contexto largo: el diseno mantiene la cache de conversacion en VRAM y delega los expertos a CPU, lo que permite sostener sesiones interactivas en hardware modesto.
- Procesamiento por lotes en servidores con mucha RAM y NVMe: los 54 GiB de expertos pueden residir en memoria o leerse desde un array de discos, lo que encaja en pipelines de generacion masiva donde la latencia no es critica.
- Tareas multimodales ligeras: al conservar la torre de vision a 8 bits, puede emplearse para descripcion de imagenes o respuesta a preguntas visuales en entornos con GPU limitada.
- Investigacion sobre formatos de pesos y motores de inferencia: el formato `silvann-packed-v3` y su politica de anchos por tensor sirven como caso de estudio de empaquetado orientado a memoria heterogenea (VRAM + RAM + disco).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es una mejora del 15% en velocidad de respuesta al leer expertos desde un array NVMe con SiLVANN v0.18.0 frente a empaquetados anteriores, sin cifras absolutas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: unos 12 GB para capas densas (4,3 GiB), cabeza (0,7 GiB) y cache de conversacion; el embedding se lee desde RAM.
- Memoria del sistema: se requieren aproximadamente 54 GiB para los expertos enrutados si se mantienen en RAM, o espacio en disco NVMe con la cache del motor si se leen bajo demanda.
- GPU recomendadas: el autor indica una tarjeta de 12 GB como objetivo; no se especifican modelos concretos (RTX 3060, RTX 4070, etc.).
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas, siempre que se acepte el reparto CPU/disco de los expertos.
- Opciones de despliegue: exclusivamente el runtime SiLVANN v0.18.0 o superior; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles salvo la mejora relativa del 15% mencionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D8E4_qwen3.5_122b_a10b | 122B totales / 10B activos | no disponible | D8E4 (8/4 bits) | Apache 2.0 | SiLVANN |
| silvann_tq_D4E4_qwen3.5_122b_a10b | 122B totales / 10B activos | no disponible | D4E4 (4 bits en todas las capas) | Apache 2.0 | SiLVANN |
| Qwen/Qwen3.5-122B-A10B | 122B totales / 10B activos | no disponible | Sin cuantizar (BF16/FP16) | Apache 2.0 | transformers y otros |

El empaquetado D4E4 del mismo autor reduce aun mas el peso al aplicar 4 bits a todas las matrices, incluida la atencion y el experto compartido, a costa de mayor perdida de precision. El modelo base sin cuantizar ofrece la referencia de calidad pero requiere hardware muy superior al objetivo de 12 GB.

## Limitaciones y advertencias

- Dependencia total del runtime SiLVANN: el formato `silvann-packed-v3` no se puede cargar con `transformers`, vLLM, llama.cpp ni otras herramientas estandar.
- Rendimiento condicionado por el almacenamiento: con los expertos en disco, la latencia depende de la velocidad del NVMe y de la cache del motor.
- Perdida de calidad por cuantizacion: los expertos a 4 bits y las capas densas a 8 bits introducen degradacion frente al modelo original, no cuantificada en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base; no se aportan evaluaciones especificas de este empaquetado.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base.
- Idiomas y contexto: no se especifican en la ficha del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el autor recuerda que todo el credito del modelo corresponde al equipo Qwen y que este repositorio solo cambia el almacenamiento de los pesos.
- Repositorio con muy poca traccion (85 descargas, 0 likes) y sin validacion de la comunidad; conviene verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/eval-apply/silvann_tq_D8E4_qwen3.5_122b_a10b
- Variante D4E4 del mismo autor: https://huggingface.co/eval-apply/Qwen3.5-122B-A10B_silvann_tq_D4E4
- Repositorio alternativo del empaquetado: https://huggingface.co/eval-apply/Qwen3.5-122B-A10B_silvann_tq_D8E4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
