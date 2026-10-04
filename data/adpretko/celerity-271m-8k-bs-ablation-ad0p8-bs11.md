# adpretko/celerity-271m-8k-bs-ablation-ad0p8-bs11

## Resumen

Celerity 271M 8K (ad0.8_bs11) es un checkpoint de 271 millones de parámetros publicado en Hugging Face por el usuario adpretko. Pertenece a la familia Celerity y fue entrenado originalmente en el formato CS de Cerebras, para después convertirse al formato de Hugging Face. El identificador del experimento indica que se trata de una ablación sobre el tamaño de batch global (bs11) con una tasa de dropout de atención de 0,8 y un valor de tau_ema fijado en 0,1745.

El modelo admite una longitud máxima de secuencia de 8192 tokens y utiliza embeddings posicionales de tipo ALiBi. Con 271M de parámetros se sitúa en el segmento de los modelos pequeños, orientados a inferencia de baja latencia y a despliegues en hardware modesto. No obstante, no es un modelo de propósito general listo para producción: es un checkpoint de investigación que forma parte de una serie de ablaciones de hiperparámetros de entrenamiento.

La relevancia práctica de esta ficha es limitada y conviene decirlo con claridad: el repositorio no publica licencia, idiomas soportados, pipeline de inferencia ni resultados de benchmarks, y acumula 0 descargas y 0 likes. Además, requiere cargarse con código de modelado personalizado (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con embeddings posicionales ALiBi (el tipo exacto no se declara de forma explícita en la model card) |
| Parametros totales | 271 millones |
| Longitud de contexto | 8192 tokens (maximum sequence length del experimento) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch con código de modelado personalizado de Celerity (etiquetas `pytorch` y `custom_code`); requiere `trust_remote_code=True`. Tamaño del repo: 0,5 GB, compatible con pesos en 16 bits |
| Tipo de embedding posicional | ALiBi |
| Fecha de publicacion | 4 de octubre de 2026 (según metadatos de Hugging Face) |
| Ultima actualizacion | 4 de octubre de 2026 |
| Version de runtime de origen | cbcore 2.6.0 |
| Commit del conversor | 0e3d5d375695293479df9d2a3717f05f71a345b4 |

## Arquitectura y entrenamiento

La model card no declara explícitamente el tipo de arquitectura. Los hiperparámetros documentados —embeddings posicionales ALiBi, dropout de atención, residual dropout, LayerDrop y stochastic depth— corresponden al patrón habitual de un transformer decoder-only autorregresivo, pero el repositorio no confirma número de capas, dimensión oculta, número de cabezas de atención ni vocabulario. El checkpoint original está en formato CS de Cerebras y se convirtió al formato de Hugging Face con el commit de conversor indicado en la tabla anterior. El código de modelado es propio de Celerity y debe cargarse con `trust_remote_code=True`.

No hay información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni filtrado, ni si hubo fases de ajuste posteriores como RLHF o DPO. Los datos disponibles se limitan a la configuración del experimento de ablación de tamaño de batch. El autor señala explícitamente que el dropout de atención, tau_ema y el weight decay son hiperparámetros de entrenamiento cuyos efectos quedan reflejados en los pesos aprendidos, y que la evaluación en Hugging Face se realiza con el dropout desactivado mediante `model.eval()`.

| Hiperparametro de entrenamiento | Valor |
|---|---|
| Experimento original | ad0.8_bs11 |
| Checkpoint de origen | checkpoint_60104.mdl |
| Tasa de dropout de atención | 0,8 |
| Planificador de dropout de atención | constante |
| Learning rate máximo | 0,15 |
| Batch global de entrenamiento | 11 |
| Weight decay | 0,0006356381190145931 |
| tau_ema | 0,1745 |
| Pasos de entrenamiento | 60104 |
| Longitud máxima de secuencia | 8192 |
| Dropout residual | 0,0 |
| Stochastic depth | 0,0 |
| LayerDrop | 0,0 |

## Capacidades

- Generación de texto autorregresiva: es la función básica esperable de un checkpoint de 271M parámetros con 8192 tokens de contexto, aunque no se publican evaluaciones que la cuantifiquen.
- Procesamiento de contextos largos: la ventana de 8192 tokens junto con ALiBi permite, en principio, trabajar con documentos extensos sin ventanas deslizantes, si bien no hay mediciones publicadas de degradación por posición.
- Soporte de tool calling / function calling: no disponible; no se documenta ni se aporta plantilla de chat o de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento ni formato de plantilla de conversación.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el repositorio no declara ninguna.
- Ajuste fino posterior: al ser un checkpoint en formato Hugging Face con código personalizado, es reutilizable como punto de partida para experimentos de ajuste, siempre que se resuelva la carga del código remoto.

## Casos de uso

- Estudio de ablaciones de hiperparámetros: el modelo existe precisamente para comparar el efecto del tamaño de batch global (11 frente a otros valores) manteniendo el learning rate en 0,15 y tau_ema en 0,1745. Se usaría junto al resto de checkpoints de la serie para medir diferencias de pérdida, perplejidad o calidad de generación atribuibles solo al batch size.
- Investigación sobre dropout de atención en modelos pequeños: con un dropout de atención de 0,8 y programación constante, sirve como caso extremo para estudiar hasta qué punto el dropout elevado degrada o regulariza un transformer de 271M en secuencias de 8K.
- Validación de conversiones de formato Cerebras CS a Hugging Face: es un artefacto útil para comprobar que el pipeline de conversión (commit 0e3d5d37) reproduce fielmente el comportamiento del checkpoint original `checkpoint_60104.mdl`.
- Prototipado local sin GPU dedicada: con 271M parámetros y pesos de aproximadamente 0,5 GB, puede ejecutarse en CPU o en GPU de gama baja para pruebas de integración de código de inferencia, siempre que se acepte la carga con `trust_remote_code=True`.
- Base para ajuste fino con contexto largo: sus 8192 tokens y ALiBi lo hacen adecuado como punto de partida experimental en tareas de resumen o clasificación de documentos largos, antes de invertir en modelos mayores.
- Reproducibilidad de experimentos de entrenamiento: los hiperparámetros completos (pasos, weight decay, tau_ema, schedule) permiten replicar la configuración en otros entornos y comparar resultados con este checkpoint como referencia.
- Docencia y formación técnica: sirve para ilustrar cómo se documenta y publica un checkpoint de ablación, incluyendo los avisos sobre dropout en tiempo de entrenamiento frente a `model.eval()`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,54 GB en 16 bits (271M × 2 bytes) y alrededor de 1,1 GB en fp32. El tamaño del repositorio (0,5 GB) es coherente con la primera cifra.
- Memoria adicional de activaciones y caché KV: no disponible; depende del número de capas, cabezas y dimensión de cabeza, datos que no se publican. Para 8192 tokens de contexto, ese consumo no es despreciable y debe medirse en el propio entorno.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para los pesos en 16 bits (por ejemplo, GTX 1650, RTX 3050, RTX 4060). En GPUs de mayor capacidad (RTX 4090, A100, H100) el modelo queda muy sobredimensionado en memoria, salvo que se use para procesamiento por lotes masivo.
- ¿Cabe en GPU de consumo?: sí, en la práctica totalidad de las GPU de consumo actuales, e incluso en hardware integrado con memoria compartida. La inferencia en CPU también es viable.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama no tienen soporte garantizado para este checkpoint, ya que requiere código de modelado personalizado de Celerity. La vía directa es `transformers` con `trust_remote_code=True`. Cualquier otra opción exigiría convertir los pesos y reimplementar la arquitectura.
- Latencia y throughput estimados: no disponible; no se publican cifras de latencia, tokens por segundo ni resultados de pruebas de carga.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones completas que permitan una comparación cuantitativa fiable con modelos de otras familias. La comparación más razonable es con los checkpoints hermanos de la misma serie de ablaciones, todos ellos de 271M parámetros y contexto de 8K según su nombre, y todos convertidos desde el formato CS de Cerebras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Celerity 271M 8K ad0.8_bs11 (este) | 271M | 8192 | no disponible | no disponible | 0 descargas, 0 likes |
| Celerity 271M 8K ad0p1 | 271M (según nombre) | 8192 (según nombre) | no disponible | no disponible | no disponible |
| Celerity 271M 8K residual-dropout-0p0 | 271M (según nombre) | 8192 (según nombre) | no disponible | no disponible | no disponible |
| Alternativas de otras familias (SmolLM2, Qwen2.5, Pythia, etc.) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo de producción. El propio nombre lo indica (`bs-ablation`) y el autor lo enmarca dentro de una serie de experimentos de tamaño de batch.
- Hiperparámetros extremos: un dropout de atención de 0,8 con programación constante y un batch global de 11 con learning rate de 0,15 son valores poco habituales fuera de un barrido experimental. Conviene tratar los pesos como material de estudio y no como un modelo afinado.
- Sin licencia declarada: el repositorio no especifica licencia, por lo que no hay base legal explícita para uso comercial. Antes de cualquier uso en producción habría que contactar con el autor.
- Sin idiomas declarados: no se puede afirmar qué lenguas cubre ni con qué calidad.
- Riesgo de alucinación: no evaluado. No hay métricas de veracidad, factualidad ni robustez para este checkpoint.
- Sesgos: no documentados ni medidos. Se desconoce la composición del corpus de entrenamiento, lo que impide cualquier análisis de sesgo.
- Código remoto obligatorio: la carga exige `trust_remote_code=True`, lo que implica ejecutar código de modelado publicado por el autor. Es un riesgo de seguridad que debe evaluarse antes de usarlo en entornos controlados.
- Soporte de herramientas limitado: sin plantilla de chat ni de function calling documentadas, no es directamente integrable en frameworks de agentes.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha implican que no ha pasado por revisión ni pruebas por parte de terceros.
- Degradación por longitud no medida: pese a usar ALiBi y admitir 8192 tokens, no hay datos sobre cómo se comporta en las posiciones más lejanas del contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-bs-ablation-ad0p8-bs11
- Checkpoint hermano ad0p1: https://huggingface.co/adpretko/celerity-271m-8k-ad0p1
- Checkpoint hermano residual-dropout-0p0: https://huggingface.co/adpretko/celerity-271m-8k-residual-dropout-0p0
- Sitio del proyecto Celeris: https://celeris.ai/
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
