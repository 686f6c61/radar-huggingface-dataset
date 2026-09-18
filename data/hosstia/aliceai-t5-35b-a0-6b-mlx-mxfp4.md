# Hosstia/AliceAI-T5-35B-A0.6B-MLX-MXFP4

## Resumen

AliceAI-T5-35B-A0.6B-MLX-MXFP4 es una versión cuantizada para Apple Silicon del modelo de traducción `yandex/AliceAI-T5-35B-A0.6B`, publicada por el usuario Hosstia. Se trata de un transformer encoder-decoder de tipo T5 con arquitectura Mixture-of-Experts: 34.359.182.336 parámetros totales (aproximadamente 35B) de los cuales solo unos 0,6B se activan por token gracias a un enrutado top-8 sobre 512 expertos. El modelo base fue entrenado por Yandex y su tarea declarada es la traducción entre chino y ruso.

La aportación de este repositorio no es el entrenamiento, sino la cuantización y el runtime de inferencia. Los pesos se han convertido a formato MLX con expertos en MXFP4 (grupo 32) y atención en 4 bits afín (grupo 64), mientras que los embeddings se mantienen sin cuantizar. El repositorio incluye además la librería `aliceai_mlx`, que expone un cargador, una función de generación y un envoltorio de alto nivel `Translator` con modos de traducción simple, por lotes y de fusión de candidatos.

El dato técnico más destacable es el uso de un despacho MoE fusionado (`gather_qmm`), que elimina 224 barreras de sincronización de GPU por token respecto a la implementación anterior basada en bucles planos, con una ganancia medida de 3,88x en batch 1 y hasta 5,22x en batch 8 sobre un Apple M4 Pro. En el lado negativo, el propio autor advierte de que esta variante MXFP4 degenera en bucles de repetición en aproximadamente el 10% de los párrafos y **no la recomienda para producción**, remitiendo a las variantes `4bit` o `6bit`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 con Mixture-of-Experts (MoE) |
| Parametros totales | 34.359.182.336 (~35B) |
| Parametros activos | ~0,6B por token (512 expertos, enrutado top-8) |
| Longitud de contexto | no disponible (configuración YaRN: posición original máxima 9984, factor de escala 20,0; la ventana efectiva no se documenta) |
| Tipos de cuantizacion | MXFP4 en expertos (grupo 32) + affine 4 bits en atención (grupo 64); embeddings sin cuantizar. Existen variantes `4bit` y `6bit` del mismo autor |
| Idiomas soportados | chino (zh) y ruso (ru) |
| Licencia | other (la misma que el modelo original `yandex/AliceAI-T5-35B-A0.6B`; condiciones no detalladas en la información disponible) |
| Formato de pesos | safetensors en formato MLX (no se ofrece GGUF) |
| Componentes adicionales | 16 capas de encoder, 12 capas de decoder, hidden size 1536, 12 cabezas de atención en encoder, 4 KV heads en decoder, dimensión de cabeza 128, vocabulario de 135.040 tokens, tamaño intermedio de experto 512, activación silu, embeddings compartidos y atados |
| Librería | mlx (MLX 0.32.0 o superior) |
| Tamaño en disco | 17,32 GB (repo: 18,6 GB) |
| Memoria pico reportada | 18,14 GB |

## Arquitectura y entrenamiento

La arquitectura es un T5 encoder-decoder con capas de mezcla de expertos. El encoder tiene 16 capas con 12 cabezas de atención y el decoder 12 capas con 4 KV heads (atención con consultas agrupadas), todas con dimensión de cabeza 128 y hidden size 1536. El componente MoE consta de 512 expertos con tamaño intermedio de 512 y enrutado top-8, lo que da la ratio de sparsity característica: 35B de parámetros almacenados frente a unos 0,6B activos por token. Emplea activación silu, RoPE de tipo YaRN con posición máxima original de 9984 y factor de escala 20,0, y embeddings de entrada compartidos y atados con la proyección de salida.

Sobre el entrenamiento no se proporciona información en los materiales disponibles: no se documentan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste instructivo. El modelo original fue creado y entrenado por Yandex; este repositorio contiene únicamente los pesos cuantizados y el runtime de inferencia.

La innovación técnica documentada está en el plano de la eficiencia de ejecución, no del entrenamiento. La implementación heredada recorría los expertos en un bucle plano, lo que introducía una barrera de sincronización de GPU por experto y capa (224 por token). El runtime de este repositorio sustituye ese esquema por un despacho MoE fusionado (`gather_qmm`) en Metal, manteniendo, según el autor, paridad numérica con el esquema de cuantización de referencia.

## Capacidades

- Traducción automática chino → ruso, que es la dirección ejemplificada en la model card.
- Traducción por lotes mediante `Translator.complete_batch`, orientada a maximizar el throughput en lugar de la latencia.
- Modo "professor": fusión y corrección de dos traducciones candidatas (una de referencia y otra de estudiante) para producir un texto corregido.
- Generación de texto condicionada, propia del esquema encoder-decoder T5 (entrada de secuencia fuente, salida de secuencia destino).
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento. La información disponible no indica que el modelo sea conversacional ni instruct-tuned.
- Cobertura multilingüe limitada a chino y ruso según los metadatos del repositorio.

## Casos de uso

- Traducción de documentación técnica zh→ru: el modelo puede procesar párrafos de manuales, fichas de producto o documentación de API, aprovechando el vocabulario de 135.040 tokens y la dirección zh→ru documentada. Adecuado para pipelines internos donde la revisión humana posterior es viable.
- Subtitulado y localización de contenido: traducción de guiones o subtítulos por lotes con `complete_batch`, que rinde mejor en throughput (98-104 tok/s en batch 8 frente a 73 tok/s en batch 1) y encaja con cargas de trabajo offline.
- Post-edición asistida mediante el modo `professor`: dado un texto origen y dos traducciones candidatas, el modelo genera una versión corregida que puede usarse como paso de control de calidad en un flujo de traducción automática más revisión.
- Preprocesado de corpus para investigación en traducción automática: generación de pseudo-referencias zh→ru o aumento de datos paralelos en un equipo de escritorio, sin necesidad de GPUs dedicadas.
- Prototipado y evaluación de sistemas de MT en local: investigadores que necesitan reproducir inferencias sobre Apple Silicon pueden ejecutar el modelo con 18 GB de memoria unificada, sin acceso a clúster.
- Procesamiento de datos sensibles con requisito de residencia local: al ejecutarse íntegramente en el dispositivo mediante MLX, los textos no salen del equipo, lo que resulta útil en entornos con restricciones de confidencialidad.
- Traducción de interacción con usuario final en aplicaciones macOS: integración de la librería `aliceai_mlx` en una app de escritorio para traducir contenido zh↔ru bajo demanda. En este escenario conviene usar una variante `4bit` o `6bit`, no la MXFP4.

Advertencia transversal: el autor desaconseja explícitamente el uso en producción de esta variante concreta por la degeneración en repeticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, BLEU, COMET, HumanEval, GSM8K ni equivalentes) en la información disponible. Los únicos datos numéricos publicados son de throughput y uso de recursos, medidos en un Apple M4 Pro con 48 GB de memoria unificada y MLX 0.32.0:

| Metrica | Este variante (MXFP4) | Baseline legacy |
|---|---|---|
| Throughput (batch 1) | 73,31 tok/s | 18,89 tok/s |
| Throughput (batch 8) | 98,56 tok/s | no disponible |
| Throughput mediano (batch 1) | 73,87 tok/s | 18,56 tok/s |
| Throughput mediano (batch 8) | 104,63 tok/s | no disponible |
| Utilizacion de GPU (batch 1) | 71,0 % | 51,2 % |
| Utilizacion de GPU (batch 8) | 91,6 % | no disponible |
| Utilizacion pico de GPU | 100 % | 84 % |
| Tamano en disco | 17,32 GB | 18,30 GB |
| Memoria pico | 18,14 GB | 19,87 GB |
| Aceleracion vs legacy (batch 1) | 3,88x | 1,0x |
| Aceleracion vs legacy (batch 8) | 5,22x | 1,0x |

El baseline legacy corresponde a la implementación previa con bucle plano sobre expertos, no al modelo sin cuantizar. El autor atribuye la ganancia a la eliminación de 224 barreras de sincronización de GPU por token. No se aportan métricas de calidad de traducción que permitan valorar si la cuantización MXFP4 degrada la fidelidad más allá del problema de repeticiones descrito.

## Requisitos de hardware

- Memoria unificada: el autor recomienda un mínimo de 18 GB. La memoria pico medida es de 18,14 GB, por lo que en la práctica se necesita un Mac con 24 GB o más de memoria unificada para operar con holgura.
- Hardware validado: Apple M4 Pro con 48 GB de memoria unificada. La librería declara compatibilidad con la familia Apple Silicon M1, M2, M3 y M4.
- No es ejecutable en GPUs NVIDIA o AMD: al ser pesos en formato MLX, requiere Metal y Apple Silicon. No hay pesos GGUF, por lo que no es desplegable en llama.cpp ni Ollama.
- Sistema operativo: macOS 14.0 (Sonoma) o superior. Requiere MLX 0.32.0 o superior y Python 3.10+, además de `transformers` (para el tokenizador) y `huggingface_hub` para la descarga automática.
- Opciones de despliegue: runtime propio `aliceai_mlx` (funciones `load_model` y `generate`, más el envoltorio `Translator`). No se documenta soporte para vLLM, TGI ni servidores de inferencia convencionales.
- Rendimiento esperado: 73,31 tok/s en batch 1 y 98,56 tok/s en batch 8 sobre M4 Pro; la utilización de GPU sube del 71,0 % al 91,6 % al pasar de batch 1 a batch 8, lo que indica que el modelo está pensado para explotar el batching.
- El formato MXFP4 requiere soporte de Metal para operaciones de cuantización en bloque; en equipos Apple Silicon más antiguos el rendimiento puede ser inferior al reportado, aunque no se aportan mediciones para M1, M2 o M3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B-MLX-MXFP4 (este) | 34,36B totales, ~0,6B activos | no disponible | 73,31 tok/s (batch 1) en M4 Pro; degenera en repeticiones en ~10 % de párrafos | other (heredada del modelo base) | HuggingFace, formato MLX |
| yandex/AliceAI-T5-35B-A0.6B (original) | no disponible en la información recogida (misma arquitectura declarada) | no disponible | no disponible | other | HuggingFace |
| Variante `4bit` de AliceAI (referenciada por el autor) | no disponible | no disponible | no disponible; el autor la recomienda frente a MXFP4 | other | no disponible (no se incluye el identificador en la información) |
| Variante `6bit` de AliceAI (referenciada por el autor) | no disponible | no disponible | no disponible; el autor la recomienda frente a MXFP4 | other | no disponible (no se incluye el identificador en la información) |

Las búsquedas web realizadas no devolvieron información relevante sobre modelos comparables de traducción zh-ru con arquitectura MoE T5 ni sobre el modelo base de Yandex, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Degeneración por repetición: el autor advierte de que esta variante MXFP4 entra en bucles de repetición en aproximadamente el 10 % de los párrafos. Está explícitamente **desaconsejada para producción**; se recomienda usar las variantes `4bit` o `6bit`.
- Sesgos: no se documenta ninguna evaluación de sesgos, y los datos de entrenamiento del modelo base no están descritos en la información disponible.
- Alucinación: no hay métricas de fidelidad de traducción publicadas. En un modelo de traducción, el riesgo se manifiesta como contenido inventado, omisiones o repeticiones, agravado por el problema de degeneración descrito.
- Cobertura de idiomas: limitada a chino y ruso según los metadatos. No hay evidencia de soporte para castellano u otros idiomas; el uso con textos en otras lenguas no está documentado.
- Direccionalidad: los ejemplos disponibles muestran traducción chino → ruso. La dirección inversa ruso → chino no se documenta explícitamente.
- Contexto: la ventana efectiva no se especifica. La configuración YaRN (posición original máxima 9984, factor 20,0) sugiere una extensión, pero no hay confirmación ni pruebas de degradación a longitudes largas.
- Licencia: etiquetada como `other` y heredada del modelo base de Yandex. Las condiciones exactas no están detalladas en la información disponible, por lo que el uso comercial debe verificarse directamente en la model card de `yandex/AliceAI-T5-35B-A0.6B` antes de cualquier despliegue.
- Portabilidad: los pesos en formato MLX atan el modelo a Apple Silicon. No hay conversión a GGUF ni compatibilidad con CUDA, lo que limita el despliegue en infraestructura de servidores habitual.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 18 de septiembre de 2026. No hay evidencia de uso en producción ni de validación por terceros.
- Dependencia de código de terceros: la inferencia recae en la librería `aliceai_mlx` y en MLX 0.32.0 o superior; cambios de versión en MLX pueden afectar al comportamiento de las operaciones de cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hosstia/AliceAI-T5-35B-A0.6B-MLX-MXFP4
- Modelo base (Yandex): https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Citación del trabajo original (según la model card): Yandex, "AliceAI-T5-35B-A0.6B", 2025, https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Paper, blog o repositorio adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo, su arquitectura ni su entrenamiento.
