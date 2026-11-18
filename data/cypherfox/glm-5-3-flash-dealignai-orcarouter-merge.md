# Cypherfox/GLM-5.3-Flash-dealignai-orcarouter-merge

## Resumen

GLM-5.3-Flash-dealignai-orcarouter-merge es una fusión en el espacio de pesos de dos ablaciones independientes del mismo modelo base, `zai-org/GLM-5.3-Flash`. Los dos modelos padre (dealignai y orcarouter) aplicaron técnicas distintas para eliminar el comportamiento de rechazo: dealignai mediante una edición permanente por capas denominada "CRACK" y orcarouter mediante la ablación de una única dirección de rechazo según Arditi et al. (2024). El autor del merge, Cypherfox, combina ambas ediciones argumentando que operan en direcciones casi ortogonales, de modo que la combinación elimina los rechazos residuales que cada padre deja por separado, sin fine-tuning ni pasos de gradiente.

El modelo es un transformer de tipo mezcla de expertos (MoE) con 320.759.404.382 parámetros totales, según los datos de safetensors del repositorio. Se distribuye exclusivamente en formato GGUF, con builds Q8_0 (~341 GB) e IQ4_XS con imatrix (~171 GB), además de un proyector de visión opcional (~1,2 GB). La arquitectura declarada en los metadatos es `glm5-next` con proyector de visión `glm5v`, soportada de forma nativa por llama.cpp a partir del build 11585.

La relevancia del modelo es doble: por un lado, demuestra una técnica de fusión de ablaciones que produce un decensurado más completo que cualquiera de los padres; por otro, mantiene la arquitectura multimodal y el modo de razonamiento del base GLM-5.3-Flash. La licencia es MIT y todos los upstreams están verificados como MIT, lo que permite el uso comercial del derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, arquitectura `glm5-next` (metadatos GGUF); proyector de visión `glm5v` |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (~341 GB), IQ4_XS con imatrix (~171 GB); se puede recuantizar desde Q8_0 con `llama-quantize` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0, IQ4_XS); proyector de visión GGUF; padres originales en FP8 (e4m3) |

## Arquitectura y entrenamiento

El modelo es una combinación en el espacio de pesos de dos ablaciones del mismo base, GLM-5.3-Flash. No hay entrenamiento ni pasos de gradiente: la fusión se construye derivando una dirección global `g` a partir de las dos ediciones parentales y proyectándola sobre los pesos. El padre dealignai aplica direcciones por capa, parcialmente (escala α ≈ 0,5–0,8), en capas medias y tardías (aproximadamente 12–43). El padre orcarouter aplica una única dirección de rechazo estimada en la capa 22 mediante media de diferencias entre activaciones dañinas e inofensivas, con máscara de activaciones masivas, y la proyecta por completo en todas las capas (`W' = W − r·rᵀW`). Las mediciones del autor corroboran ambas descripciones: la edición de orca se recupera como una dirección única con consistencia de coseno por capa de 0,995–1,000, mientras que las de dealignai son por capa e independientes entre sí.

El repositorio incluye los scripts `derive_g.py`, `project_q8.py` y `g_q8.npy` para reproducir el merge. El autor justifica usar Q8_0 como base de recuantización porque los padres son FP8 nativos y Q8_0 (int8 con una escala fp16 por cada 32 pesos) preserva los valores FP8 de forma prácticamente sin pérdida, a diferencia de un upcast a BF16, que solo rellenaría los valores en un contenedor más ancho sin recuperar precisión. Los archivos de `main` son los originales del fork de llama.cpp de unsloth (rama `glm5next`) con una reescritura solo de metadatos: cada tensor es idéntico byte a byte y solo cambian los nombres de arquitectura/proyector y algunas claves de metadatos. La verificación en mainline frente a los originales del fork reporta el mismo token superior en el 96 % de los casos, divergencia KL media de 0,016 y perplejidad en CPU sobre un texto fijo de 3,11 (IQ4_XS) y 2,87 (Q8_0). Los archivos originales en formato del fork quedan en la etiqueta `glm5next-unsloth-fork`. El directorio `patches/` incluye parches de llama.cpp para entrada de vídeo nativa (pares de fotogramas a 2 fps con marcas de tiempo por par): `0004` para mainline y `0003` para el fork.

## Capacidades

- Generación de texto conversacional con modo de razonamiento configurable (el modelo base soporta ajustes de razonamiento; el padre dealignai documenta comportamiento en `off`, `low` y `max`).
- Capacidades multimodales de visión mediante el proyector `*-mmproj.gguf` (~1,2 GB).
- Entrada de vídeo nativa mediante los parches de llama.cpp incluidos (2 fps, pares de fotogramas con marcas de tiempo).
- Razonamiento multi-paso y matemáticas, heredados del base GLM-5.3-Flash.
- Generación de código, al ser un modelo de la familia GLM orientada a texto y código.
- Comportamiento decensurado: rechazos sustancialmente eliminados en todos los ajustes de razonamiento, con mayor cobertura que cualquiera de los dos padres por separado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y decensurado: el modelo sirve como caso de estudio reproducible de fusión de ablaciones ortogonales, con scripts incluidos (`derive_g.py`, `project_q8.py`) para replicar el merge y medir el efecto de cada dirección parental.
- Evaluación de robustez de salvaguardas: permite a equipos de seguridad estudiar qué rechazos residuales dejan las ablaciones individuales y cómo se combinan, usando los builds IQ4_XS y Q8_0 como referencia cruzada.
- Procesamiento de documentos con imágenes: el proyector de visión permite extraer y razonar sobre contenido de capturas, diagramas o páginas escaneadas en un pipeline local con llama.cpp.
- Análisis de vídeo por muestreo de fotogramas: con los parches de `patches/`, se pueden procesar clips a 2 fps con marcas de tiempo para resumen o descripción de escenas.
- Generación de texto creativo sin restricciones temáticas: el decensurado profundo lo hace adecuado para ficción o guiones donde los modelos alineados rechazan contenido sensible, siempre bajo responsabilidad del usuario.
- Despliegue local de un MoE de gran tamaño: el build IQ4_XS (~171 GB) permite ejecutar el modelo en servidores con suficiente memoria unificada o VRAM agregada, usando llama.cpp mainline desde el build 11585.
- Recuantización a medida: el Q8_0 (~341 GB) sirve como fuente para generar K-quants más pequeños o imatrix propios con `llama-quantize`, sin rederivar el merge.

## Benchmarks y rendimiento

La model card menciona evaluaciones en dos ejes (decensurado y capacidad general) con razonamiento activado y comparación en ajustes idénticos, pero los resultados numéricos no están incluidos en la información proporcionada. Los únicos datos numéricos disponibles son las métricas de verificación del formato: mismo token superior en el 96 % de los casos frente a los originales del fork, divergencia KL media de 0,016, y perplejidad en CPU de 3,11 (IQ4_XS) y 2,87 (Q8_0) sobre un texto fijo.

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, HarmBench) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: IQ4_XS ~171 GB; Q8_0 ~341 GB; proyector de visión ~1,2 GB adicional.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el IQ4_XS requiere agregados de memoria de clase servidor (múltiples A100/H100 o memoria unificada), y el Q8_0 exige configuraciones aún mayores.
- GPU de consumo: el modelo no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, etc.) en ninguno de los builds publicados.
- Opciones de despliegue: llama.cpp mainline desde el build 11585 (commit `9d7d50498`), arquitectura `glm5-next`; el fork de unsloth (rama `glm5next`) para los archivos originales en la etiqueta `glm5next-unsloth-fork`. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decensurado | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-dealignai-orcarouter-merge | 320,8 B (MoE) | no disponible | Fusión de dos ablaciones ortogonales; más completo que cada padre según el autor | MIT | GGUF (Q8_0, IQ4_XS) |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | no disponible | no disponible | CRACK por capas, parcial (α ≈ 0,5–0,8); conserva rechazos en `low` por diseño | MIT | FP8 |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | no disponible | no disponible | Dirección única de rechazo (capa 22) proyectada en todas las capas | MIT | FP8 |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | Alineado, con rechazos | MIT | no disponible |

## Limitaciones y advertencias

- Modelo decensurado: el comportamiento de rechazo de seguridad ha sido sustancialmente eliminado; el usuario es responsable del uso y del cumplimiento de la ley aplicable.
- Etiquetado `not-for-all-audiences`: puede generar contenido sensible, ofensivo o inapropiado.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles; conviene verificar ambos antes de desplegar en producción.
- El modelo no cabe en GPUs de consumo; el despliegue requiere infraestructura de memoria de clase servidor.
- Los archivos de `main` requieren llama.cpp mainline desde el build 11585; versiones anteriores no soportan la arquitectura `glm5-next`.
- La entrada de vídeo nativa requiere aplicar los parches de `patches/`; no está disponible en llama.cpp sin ellos.
- Aunque la licencia es MIT, el uso comercial de un modelo decensurado puede contravenir términos de servicio de plataformas intermediarias o normativa sectorial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cypherfox/GLM-5.3-Flash-dealignai-orcarouter-merge
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Padre dealignai: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Padre orcarouter: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Etiqueta con los archivos originales del fork: `glm5next-unsloth-fork` (mismo repositorio)
- Parches de vídeo nativo: directorio `patches/` del repositorio
- Scripts de reproducción del merge: `scripts/derive_g.py`, `scripts/project_q8.py`, `scripts/g_q8.npy`
- Método de ablación de rechazo (Arditi et al. 2024): no disponible como enlace en la información proporcionada
