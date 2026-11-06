# ashwin-sreedhar/Qwen3-8B-abliterated-bf16-public

## Resumen

Qwen3-8B-abliterated-bf16-public es un checkpoint experimental derivado de Qwen/Qwen3-8B, publicado por el usuario ashwin-sreedhar en Hugging Face. Se trata de una versión "abliterated" del modelo de Qwen: los pesos han sido editados mediante una intervención dirigida (weight editing) con el objetivo de reducir los comportamientos de rechazo del modelo original, manteniendo en lo posible sus capacidades generales. No se trata de un lanzamiento oficial de Qwen, sino de una modificación independiente de la comunidad.

El modelo base, Qwen3-8B, es un modelo de lenguaje denso de 8.190.735.360 parámetros de la familia Qwen3 de Alibaba, orientado a generación de texto y diálogo. La variante abliterada conserva la arquitectura, el tamaño y el formato bf16 del original, por lo que puede desplegarse con las mismas herramientas y requiere recursos similares. Su relevancia reside en ofrecer una versión con menos restricciones de alineamiento para investigación en seguridad, interpretabilidad y análisis de comportamiento de modelos.

Es importante subrayar que el propio autor advierte que la eliminación de rechazos no está verificada de forma conductual: el checkpoint puede seguir negándose a ciertas peticiones, y el comportamiento en imagen, contexto largo y generación asistida por MTP no ha sido probado. Es un modelo etiquetado explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), no disponible detalle completo |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; comportamiento en contexto largo sin probar según el autor) |
| Tipos de cuantizacion | bf16 (pesos nativos); no disponible información sobre cuantizaciones adicionales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,4 GB de repo) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B original: un transformer decoder denso (no MoE) de 8,2 mil millones de parámetros. El modelo base fue entrenado por Alibaba con datos a gran escala multilingües y posteriormente afinado; los detalles concretos de tokens, composición del dataset y etapas de RLHF/DPO del modelo base no constan en la información disponible para esta variante.

La innovación de esta versión no está en la arquitectura sino en la intervención sobre los pesos: se trata de una edición de pesos (weight editing) tipo "abliteration", registrada en el directorio `.pipeline/` del repo, que incluye la política de intervención, la dirección aplicada, la selección de capas y los hashes de datos, código y entorno. El autor realizó verificaciones de integridad de serialización: comprobación SHA-256 de los pesos originales antes y después del export, validación de bytes, formas y dtypes de los tensores editados, y recarga en proceso limpio comparada con una referencia en memoria en tres prompts inofensivos con decodificación greedy sin caché.

Como métricas de diagnóstico, se reporta una KL del primer token de 0,115229 sobre 100 prompts inofensivos held-out, y una relación máxima de proyección editada/base del 1,075%, que según el autor hace fallar el umbral mecánico del 1%. El autor enfatiza que estas cifras son referencias de diagnóstico, no una validación conductual o de capacidades completa.

## Capacidades

Al heredar de Qwen3-8B y mantener las capacidades en principio intactas (con la advertencia de que no hay validación completa):

- Generación de texto conversacional en formato multi-turno (pipeline text-generation, tag conversational).
- Razonamiento general y generación de código, heredadas del modelo base Qwen3-8B (sin benchmarks específicos publicados para esta variante).
- Posible soporte de modos de razonamiento de la familia Qwen3 (thinking mode), aunque no confirmado para este checkpoint.
- Reducción (no eliminación garantizada) de los rechazos de seguridad respecto al modelo original.
- Capacidades multilingües heredadas de Qwen3, sin lista de idiomas confirmada en la ficha.
- Soporte de tool calling: no disponible en la información de esta variante.
- Capacidades de visión: no disponibles; el autor indica que el comportamiento con imágenes no ha sido probado.

## Casos de uso

- Investigación en seguridad y alineamiento: el checkpoint sirve como sujeto de estudio para analizar cómo las intervenciones de abliteration afectan a los rechazos y a las capacidades del modelo, con metadatos de intervención reproducibles en `.pipeline/`.
- Investigación en interpretabilidad: la dirección de intervención y la política de selección de capas documentadas permiten estudiar qué componentes del modelo codifican los comportamientos de rechazo.
- Comparación de alineamiento en evaluaciones: puede usarse como contrapunto no alineado de Qwen3-8B en suites de evaluación de seguridad (por ejemplo, pruebas de jailbreak y de robustez de filtros).
- Chatbots y asistentes conversacionales experimentales: para entornos de prueba donde se quiera minimizar rechazos en consultas legítimas que el modelo original rechaza en exceso (over-refusal).
- Despliegue local en hardware de gama alta: al mantener el formato bf16 y la arquitectura de Qwen3-8B, funciona con las mismas herramientas (transformers, vLLM, llama.cpp vía conversión) que el original.
- Desarrollo de pipelines de evaluación de integridad de pesos: el proceso documentado de verificación SHA-256, KL held-out y recarga en proceso limpio es un ejemplo de metodología para validar checkpoints modificados.

No es adecuado para producción comercial sin validación conductual previa, dado el carácter experimental declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas reportadas son diagnósticas: KL del primer token de 0,115229 (100 prompts inofensivos held-out) y relación máxima de proyección editada/base del 1,075%. No hay datos de MMLU, HumanEval, GSM8K ni de tasas de rechazo conductuales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,2 mil millones de parámetros en bf16, aproximadamente 16,4 GB solo de pesos; en la práctica se recomiendan 20-24 GB de VRAM para inferencia cómoda con contexto razonable.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para inferencia local en fp16/bf16; A100 o H100 (40/80 GB) para contextos largos, batching o servir múltiples usuarios.
- Consumer GPU: cabe en una RTX 3090/4090 de 24 GB en bf16 con contexto moderado. En GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) sería necesaria una cuantización a 8 bits o 4 bits, no distribuida oficialmente en este repo.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM, TGI y endpoints de inferencia de Hugging Face (tag endpoints_compatible). Para llama.cpp u Ollama sería necesaria una conversión a GGUF no incluida en el repo.
- Latencia y throughput: no disponible; al ser un modelo denso de 8B en bf16, el rendimiento esperable es el estándar de cualquier modelo de 8B en las herramientas mencionadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-8B-abliterated-bf16-public | 8,19 B | safetensors bf16 | Apache 2.0 | Variante experimental con pesos editados; rechazos reducidos pero no verificados |
| Qwen/Qwen3-8B (base) | 8,19 B | safetensors | Apache 2.0 | Modelo original de Alibaba, con alineamiento estándar y modos thinking/no-thinking |
| Otras variantes abliterated de Qwen3-8B en la comunidad | 8,19 B | safetensors/GGUF | Apache 2.0 | Varias existentes en Hugging Face; datos concretos no disponibles en la información proporcionada |

Frente al modelo base, esta variante ofrece un comportamiento de rechazo presumiblemente reducido a costa de una validación de capacidades incompleta y una desviación métrica respecto al original (KL 0,115 en primer token).

## Limitaciones y advertencias

- La eliminación de rechazos no está establecida conductualmente: el checkpoint puede seguir negándose a peticiones, y una sola conversación o un recuento de frases de rechazo no constituyen evidencia suficiente según el propio autor.
- La preservación de capacidades no está validada: la KL de 0,115 hace fallar el umbral mecánico del 1%, lo que sugiere una desviación medible respecto al modelo base.
- Comportamiento sin probar en imágenes, contexto largo y generación asistida por MTP.
- Riesgo de alucinación: inherente al modelo base Qwen3-8B, posiblemente agravado por la intervención no validada conductualmente.
- Etiquetado explícito como experimental: no recomendado para producción sin evaluación exhaustiva propia.
- Sesgos: heredados de Qwen3-8B; la abliteration puede alterar el perfil de seguridad sin eliminar los sesgos del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso del repo indica que las licencias upstream, la atribución y las restricciones de uso del modelo base siguen aplicando. Cada fichero safetensors incluye una nota de modificación en su cabecera.
- Uso responsable: un modelo con rechazos reducidos puede generar contenido perjudicial; su uso debe limitarse a investigación y evaluación en entornos controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashwin-sreedhar/Qwen3-8B-abliterated-bf16-public
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Metadatos de intervención y verificaciones: directorio `.pipeline/` dentro del repositorio del modelo
