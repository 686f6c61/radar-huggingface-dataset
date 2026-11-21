# Mariano23/Qwen38-27B-Fable-Cold-Fusion-GGUF

## Resumen

Qwen38-27B Fable Cold Fusion es un modelo de lenguaje de 27.000 millones de parámetros (26.895.998.464 exactamente) derivado de la arquitectura Qwen3.8, publicado originalmente por DavidAU bajo el nombre `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF`. El repositorio analizado, mantenido por el usuario Mariano23, es un espejo de cuantizaciones GGUF byte a byte idénticas de los pesos originales, sin modificaciones, con el objetivo de mantenerlos disponibles. Se trata de un modelo de instrucciones y razonamiento con ajuste «uncensored/abliterated», orientado a generación de código, escritura creativa y roleplay, y con soporte multimodal de imagen a texto mediante proyectores `mmproj`.

La relevancia técnica del modelo reside en tres ejes: una ventana de contexto nativa de 262.144 tokens, tres modos de razonamiento configurables (`xhigh`, `medium`, `low`) y una cabeza de Multi-Token Prediction (MTP) presente en las variantes `-MTP-`, que acelera la generación en motores que la soportan. El repositorio ofrece 20 cuantizaciones que van de 11,67 GB a 30,24 GB, más tres proyectores de visión, lo que permite desplegarlo desde equipos con 16 GB de VRAM hasta configuraciones de gama alta.

El modelo se distribuye bajo licencia Apache-2.0 y cubre 16 idiomas, entre ellos el castellano. Su formato GGUF lo hace compatible con todo el ecosistema llama.cpp: llama-server, LM Studio, kobold.cpp, Ollama y llama-cpp-python. Es, por tanto, una opción práctica para quien necesite un modelo local de gran contexto con capacidades de código y visión, asumiendo las particularidades de un ajuste abliterated y de un linaje de pesos no oficial respecto a Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje Qwen3.8), con cabeza opcional de Multi-Token Prediction (MTP) en las variantes `-MTP-` |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (con y sin MTP); proyectores de visión en F16, BF16 y F32 |
| Idiomas soportados | en, it, zh, es, fr, de, ja, ko, ru, pt, ar, hi, id, pl, th, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 389,0 GB con 20 cuantizaciones y 3 proyectores |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Qwen3.8 y de tratarse de un modelo denso de 27B parámetros. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el ajuste original. Lo que sí se documenta es la existencia de una cabeza de Multi-Token Prediction (MTP) en las variantes `-MTP-`, que predice varios tokens por paso y acelera la decodificación en motores que la implementan; el autor indica que, en motores sin soporte MTP, deben usarse los ficheros sin MTP, que contienen los mismos pesos.

El ajuste declarado es «uncensored/abliterated», una técnica de edición de pesos que elimina direcciones de activación asociadas al rechazo, lo que reduce las negativas del modelo ante peticiones sensibles. El modelo emplea la plantilla de chat de Qwen (`<|im_start|>` / `<|im_end|>`) con una variable `reasoning_effort` que admite tres niveles: `xhigh` (por defecto, el más exhaustivo), `medium` y `low` (el más rápido y directo, que recorta el bloque de pensamiento). Para que la plantilla y dicha variable se apliquen correctamente es necesario activar `--jinja` en llama.cpp. Las cuantizaciones se han generado con imatrix, según los tags del repositorio.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito en tres niveles de esfuerzo (`xhigh`, `medium`, `low`).
- Generación de código, con etiquetado explícito de especialización «coder» en el nombre y los tags del modelo.
- Escritura creativa y roleplay, también declarados como casos de uso objetivo del ajuste.
- Visión (image-text-to-text): procesa imágenes mediante los proyectores `mmproj-F16`, `mmproj-BF16` o `mmproj-F32`.
- Capacidades multilingües en 16 idiomas, incluidos castellano, inglés, chino, francés, alemán, japonés, coreano, ruso, portugués, árabe, hindi, indonesio, polaco, tailandés y vietnamita.
- Decodificación acelerada mediante Multi-Token Prediction en las variantes MTP, sujeta al soporte del motor de inferencia.
- Ajuste abliterated/uncensored: menor tasa de rechazos ante peticiones que los modelos alineados estándar suelen declinar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local: con 27B parámetros y cuantización Q4_K_M (18,05 GB) el modelo puede ejecutarse en una GPU de 24 GB y emplearse para autocompletado, refactorización y explicación de código sin enviar el código fuente a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos extensos: la ventana nativa de 262.144 tokens permite cargar contratos, expedientes o bases de código completas en una sola pasada; en la práctica conviene limitar `-c` a 32.768 tokens en configuraciones con VRAM ajustada, como muestra el ejemplo de llama-server de la model card.
- Escritura creativa y generación de narrativa: el ajuste orientado a creative-writing y roleplay, junto con los modos de razonamiento, permite mantener personajes y tramas coherentes en conversaciones largas.
- Procesamiento de documentos escaneados o capturas: combinando una cuantización con `mmproj-BF16` (0,93 GB) se puede extraer texto, describir figuras o responder preguntas sobre imágenes en un flujo local.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: las cuantizaciones IQ2_M (11,67 GB) e IQ3_M (14,08 GB) permiten ejecutar el modelo en GPUs de gama consumer, a costa de una pérdida de calidad frente a Q4_K_M o superiores.
- Generación acelerada en servidores compatibles con MTP: en motores que soportan la cabeza de Multi-Token Prediction, las variantes `-MTP-` reducen el coste por token generado, lo que resulta útil en servicios de chat con muchas peticiones concurrentes.
- Atención al cliente automatizada multi-turno: los 262.144 tokens de contexto permiten conservar historiales largos y documentación de producto en la misma ventana, aunque el carácter abliterated exige filtrar las respuestas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y caché KV): IQ2_M ≈12 GB; IQ3_M ≈14,5 GB; IQ4_XS ≈17 GB; Q4_K_M ≈18,5 GB; Q5_K_M ≈21 GB; Q6_K ≈24 GB; Q8_0 ≈30 GB. Las variantes MTP añaden entre 0,45 y 0,5 GB sobre su equivalente sin MTP.
- Proyectores de visión: 0,93 GB (F16/BF16) o 1,84 GB (F32), que se suman a la VRAM del modelo principal.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K; A100 40/80 GB o H100 para Q8_0 y contextos largos; GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) para IQ2_M e IQ3_M.
- Cabe en GPU consumer: sí, en RTX 4090 con Q4_K_M o inferiores, y en GPUs de 16 GB con IQ2_M e IQ3_M. En GPUs de 8-12 GB solo es viable con descarga parcial a RAM (`-ngl` reducido), con la consiguiente caída de velocidad.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), LM Studio, kobold.cpp, Ollama y llama-cpp-python. Para visión se requiere `--mmproj`; para el modo de razonamiento, `--jinja`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo indica cualitativamente que las variantes MTP ofrecen «generación más rápida» en motores compatibles, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen38-27B Fable Cold Fusion (este) | ≈27B denso | 262.144 | Sí (mmproj) | Apache-2.0 | GGUF | Ajuste uncensored/abliterated, cabeza MTP opcional, 16 idiomas |
| Qwen3.8-27B base (DavidAU, upstream) | ≈27B denso | No disponible | No disponible | No disponible | Safetensors/GGUF | Modelo del que derivan estos pesos; el ajuste y la model card originales son de DavidAU |
| Alternativas de ≈27-32B densos con contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación numérica |

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos competidores en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El ajuste abliterated/uncensored reduce los rechazos del modelo ante contenido sensible; en producción es necesario aplicar filtros y políticas de uso propios, ya que el modelo no incorpora salvaguardas de alineación estándar.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; como en cualquier modelo de 27B, conviene verificar las salidas en dominios especializados.
- Linaje no oficial: los pesos derivan de un ajuste de terceros (DavidAU) sobre Qwen3.8, no de un modelo publicado directamente por el equipo de Qwen; el soporte y la documentación de la arquitectura subyacente son limitados.
- Repositorio espejo: el autor de este repositorio no ha modificado los pesos; los problemas de calidad del ajuste original no pueden corregirse aquí.
- Contexto efectivo: aunque la ventana nativa es de 262.144 tokens, la model card ejemplifica con `-c 32768`; usar el contexto completo exige mucha más VRAM por la caché KV y puede degradar la calidad.
- Idiomas: aunque se declaran 16 idiomas, no hay evaluaciones publicadas de rendimiento por idioma; el castellano figura en la lista, pero sin métricas.
- Visión: requiere descargar y cargar un proyector `mmproj` aparte; sin él, el modelo funciona solo como texto.
- MTP: las variantes `-MTP-` solo aportan ventaja en motores con soporte; en otros casos deben usarse los ficheros sin MTP.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar que el ajuste original y los pesos upstream cumplen las condiciones aplicables.
- Cifras de descargas y likes a cero en el momento de la consulta: el repositorio es reciente y no cuenta aún con validación de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mariano23/Qwen38-27B-Fable-Cold-Fusion-GGUF
- Repositorio upstream citado en la model card: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
