# optimum-intel-internal-testing/tiny-random-gemma4-unified-it

## Resumen

Este modelo es un artefacto de prueba generado automáticamente por el equipo de Optimum Intel para validar la integración de la arquitectura Gemma4Unified en sus pipelines de exportación e inferencia con OpenVINO. Se trata de una versión en miniatura de la configuración del modelo Google Gemma 4 12B IT, con pesos aleatorios inicializados mediante una semilla fija (seed 42). No ha sido entrenado y no posee ninguna capacidad funcional real; su único propósito es servir como banco de pruebas para verificar la corrección de los flujos de trabajo de Hugging Face Transformers y Optimum Intel.

La arquitectura subyacente, denominada `gemma4_unified`, es un diseño multimodal unificado que combina un transformador de texto con atención deslizante y completa, un codificador de visión sin encoder (basado en parches) y soporte opcional para audio. En esta variante tiny, el modelo tiene 8.706.404 parámetros y un tamaño de repositorio de 0,1 GB, con pesos en precisión F32. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face, aunque su naturaleza interna lo hace irrelevante para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (transformador multimodal unificado con atención deslizante y completa, codificador de visión sin encoder, soporte de audio opcional) |
| Parametros totales | 8.706.404 (8,7 M) |
| Longitud de contexto | 512 tokens (max_position_embeddings del texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tensor type F32) |

## Arquitectura y entrenamiento

La configuración tiny replica la estructura del Gemma4Unified 12B, pero con dimensiones reducidas: 4 capas ocultas, 4 cabezas de atención, 2 cabezas clave-valor, dimensión de cabeza de 16 y dimensión de cabeza global de 32. El modelo combina tres tipos de atención en las capas de texto: tres capas con atención deslizante (ventana de 64) y una capa con atención completa. Además, activa la fusión de proyecciones de valor en las de clave (`attention_k_eq_v=True`) y define una única cabeza global para atención de largo alcance. El vocabulario es de 262.144 tokens y las embeddings de palabra están atadas a la salida (`tie_word_embeddings=True`).

La parte de visión utiliza un codificador sin encoder basado en parches de 16x16 con un kernel de pooling de 3, y proyecta a una dimensión de 32 que coincide con el tamaño oculto del texto. El modelo también define tokens especiales para imagen, vídeo y audio, aunque en esta configuración la parte de audio está desactivada (`audio_config=None`). No se ha realizado ningún entrenamiento: los pesos se inicializan aleatoriamente con `torch.manual_seed(42)` y se guardan en precisión float32. El procesador se reutiliza del modelo `google/gemma-4-12b-it` con un presupuesto de soft-tokens reducido para adaptarse a la tabla de embeddings posicionales de tamaño 128.

## Capacidades

- No posee capacidades funcionales: es un modelo de prueba con pesos aleatorios, sin entrenamiento previo.
- La arquitectura está diseñada para soportar generación de texto, procesamiento de imágenes, vídeo y audio, pero en esta versión tiny no hay pesos aprendidos que permitan ejecutar ninguna tarea real.
- El script de creación incluye una prueba de forward pass que genera logits de forma sintética, pero no produce texto coherente ni respuestas útiles.
- No soporta tool calling, razonamiento multi-paso ni ningún comportamiento inteligente.

## Casos de uso

- Validación de pipelines de exportación: sirve para comprobar que la conversión de Transformers a OpenVINO funciona correctamente con la arquitectura Gemma4Unified, sin necesidad de cargar un modelo de 12B completo.
- Pruebas de integración en CI/CD: el equipo de Optimum Intel lo utiliza como fixture para verificar la igualdad de tokens entre la inferencia de Transformers y la de OpenVINO bajo pequeñas diferencias numéricas.
- Desarrollo de procesadores y tokenizadores: permite probar el `AutoProcessor` de Gemma4Unified con presupuestos de tokens reducidos, asegurando que el preprocesado de imágenes y texto es correcto.
- Depuración de configuraciones: facilita la revisión de parámetros como `final_logit_softcapping`, `use_bidirectional_attention` o `num_global_key_value_heads` en un entorno ligero.
- Formación de desarrolladores: puede usarse como ejemplo didáctico para entender la estructura interna de un modelo multimodal unificado sin requerir recursos de hardware elevados.
- Generación de gráficos de arquitectura: herramientas como hfviewer pueden trazar el grafo de ejecución del modelo para documentar su diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de prueba sin entrenamiento, no tiene sentido evaluar su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el reducido número de parámetros (8,7 M) y el uso de float32.
- GPU recomendadas: cualquier GPU moderna, incluso CPUs sin aceleración gráfica, puede ejecutar el modelo sin problemas.
- Cabe en cualquier GPU de consumo (por ejemplo, NVIDIA GTX 1060 o superior) y también en entornos sin GPU.
- Opciones de despliegue: puede cargarse con Transformers, exportarse a OpenVINO para pruebas de inferencia, o ejecutarse con llama.cpp si se convierte a GGUF (aunque no es el propósito).
- Latencia y throughput: no se han medido formalmente, pero al ser un modelo tiny, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido de ser artefactos de prueba con pesos aleatorios para la arquitectura Gemma4Unified. Los modelos reales de la familia Gemma 4 (como el 12B IT) son completamente diferentes en tamaño y capacidades.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que cualquier salida generada será ruido sin significado.
- No debe utilizarse en producción ni en aplicaciones que requieran procesamiento de lenguaje natural, visión o audio reales.
- Su única utilidad es técnica: validación de integraciones, pruebas unitarias y depuración de pipelines.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece valor comercial alguno.
- Los idiomas soportados no están definidos; al no tener entrenamiento, no hay capacidades lingüísticas.
- El contexto máximo de 512 tokens es muy limitado y solo aplica a la parte de texto; las entradas de imagen se procesan con un presupuesto de soft-tokens reducido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/optimum-intel-internal-testing/tiny-random-gemma4-unified-it)
- [Perfil de la organización Optimum Intel Internal Testing](https://huggingface.co/optimum-intel-internal-testing/models)
- [Repositorio de Optimum Intel en GitHub](https://github.com/huggingface/optimum-intel)
- [Gráfico de arquitectura (hfviewer)](https://hfviewer.com/optimum-intel-internal-testing/tiny-random-gemma4-moe)
