# eightman999/openllama-3b-ggml-legacy

## Resumen

eightman999/openllama-3b-ggml-legacy es una cuantizacion legacy en formato GGML (contenedor GGJT v3) del checkpoint openlm-research/open_llama_3b_v2, un transformer decoder-only de 3.000 millones de parametros con licencia Apache 2.0. El fichero resultante, `openllama-3b-q4_0-ggml.bin`, ocupa 1,93 GB en cuantizacion Q4_0 y esta pensado para ejecutarse en GPUs NVIDIA de las generaciones Fermi y Kepler (2011-2012) mediante el backend OpenCL/CLBlast que llama.cpp incorporaba en mayo de 2023.

El valor del artefacto no esta en su calidad de modelado —es una cuantizacion de un modelo de 2023— sino en su funcion como pieza de compatibilidad: permite cargar un LLM de 3B en hardware que quedo fuera del ecosistema GGUF y de los kernels CUDA modernos. El autor ha publicado el toolchain asociado en eightman999/llama-fermi-clblast, un fork de llama.cpp fijado al commit `2e6cd4b` (23 de mayo de 2023, "OpenCL Token Generation Acceleration") con parches de portabilidad.

Es relevante ahora como referencia para tareas de preservacion, docencia sobre formatos de cuantizacion historicos y despliegue en entornos con drivers antiguos. No es un modelo apto para produccion moderna: los cargadores GGUF no pueden abrirlo, no hay datos de benchmarks publicados y el repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA); checkpoint base OpenLLaMA 3B v2 |
| Parametros totales | 3.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No especificada en esta ficha; heredada del checkpoint base OpenLLaMA 3B v2 (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | Q4_0 (unico fichero incluido) |
| Idiomas soportados | no disponible (el modelo base OpenLLaMA se entreno predominantemente con corpus en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML legacy, contenedor GGJT v3 (`.bin`); no compatible con GGUF |
| Tamano del repositorio | 1,9 GB (fichero `openllama-3b-q4_0-ggml.bin`, 1,93 GB) |
| Backend de inferencia | OpenCL / CLBlast (llama.cpp de mayo de 2023) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion indicada | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint original openlm-research/open_llama_3b_v2: un transformer decoder-only de 3B parametros, preentrenado sobre aproximadamente 1 billon de tokens como reproduccion abierta y con licencia permisiva de la familia LLaMA de Meta AI. Esta ficha no aporta informacion sobre composicion del dataset, numero exacto de tokens, ni sobre si hubo fases de RLHF o DPO; el modelo base es un modelo preentrenado, no un modelo ajustado con instrucciones.

La aportacion tecnica concreta de esta publicacion reside en la conversion, no en el entrenamiento. El fichero usa el contenedor GGJT v3 y fue generado con el tooling de eightman999/llama-fermi-clblast, un fork de llama.cpp anclado al commit `2e6cd4b`. Destaca un ajuste en la cabecera: el campo `n_mult` se escribe como **8640** en lugar del valor 256 del conversor estandar, de modo que la formula de `n_ff` de la epoca reproduce el tamano intermedio real de 8640. Los ficheros convertidos con el `convert.py` parcheado ya incorporan esta correccion, imprescindible para que el runtime antiguo reconstruya correctamente las dimensiones de las capas feed-forward.

## Capacidades

- Generacion de texto autoregresiva en modo completado de prompt, sin plantilla de chat.
- Razonamiento basico y continuacion de texto propios de un modelo base de 3B parametros de 2023.
- Ejecucion en GPUs Fermi y Kepler mediante OpenCL/CLBlast, incluyendo offload parcial de capas con `-ngl`.
- Funcionamiento verificado en una GeForce GT 430 (Fermi, OpenCL 1.1) segun la model card.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No hay datos publicados sobre capacidades multilingues ni sobre el comportamiento fuera del ingles.

## Casos de uso

- Inferencia en hardware antiguo: ejecutar un LLM de 3B en tarjetas Fermi/Kepler que no reciben soporte de CUDA moderno, usando el fork llama-fermi-clblast y el driver legacy NVIDIA 390.157.
- Preservacion de software: mantener operativo un artefacto en contenedor GGJT v3 para reproducir experimentos de la etapa previa a GGUF, cuando los cargadores actuales ya no aceptan este formato.
- Docencia sobre cuantizacion: ilustrar el salto de Q4_0 sobre GGML/GGJT v3 a los esquemas posteriores (Q4_K, Q5_K, etc.) y el impacto del contenedor en la portabilidad del fichero.
- Laboratorio de compatibilidad: validar el parcheo de cabeceras (`n_mult = 8640`) y la reconstruccion de `n_ff` como caso practico de errores de conversion en cadenas de tooling antiguas.
- Prototipado offline sin GPU moderna: montar un entorno de generacion de texto de bajo coste en equipos reacondicionados, asumiendo latencias altas y contexto limitado.
- Experimentacion en recuperacion de hardware: medir throughput y consumo en GPUs de mas de una decada para comparar con alternativas CPU-only del mismo periodo.
- Pruebas de empaquetado: verificar que un fichero de 1,93 GB se distribuye y carga correctamente en entornos con poco espacio en disco y sin aceleracion CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica. Los repositorios de referencia de la comunidad (rustformers/open-llama-ggml y SlyEcho/open_llama_3b_ggml) publican conversiones equivalentes a GGML y, en el segundo caso, datos de perplejidad sobre `wiki.test.raw`, pero esas cifras no se han proporcionado en la informacion disponible y no deben atribuirse a este fichero concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 1,93 GB; con margen para contexto y buffers de OpenCL, el consumo se situa en el entorno de 2 a 2,5 GB, dependiendo de `-ngl`, `-t` y la longitud de la secuencia.
- GPU verificada: NVIDIA GeForce GT 430 (Fermi, sm_21, OpenCL 1.1), segun la model card. Es el unico dispositivo con validacion explicita.
- GPUs objetivo: NVIDIA Fermi y Kepler con soporte del driver legacy 390.157.
- Cabe en GPU de gama baja con suficiente VRAM, dado el tamano de 1,93 GB del fichero cuantizado.
- No es compatible con el ecosistema GGUF: quedan descartados llama.cpp moderno, Ollama, vLLM, TGI y cualquier cargador basado en GGUF.
- Despliegue: exclusivamente mediante el fork eightman999/llama-fermi-clblast compilado con `make LLAMA_CLBLAST=1`.
- Comando de referencia de la model card: `GGML_OPENCL_PLATFORM=0 GGML_OPENCL_DEVICE=<idx> ./main -m openllama-3b-q4_0-ggml.bin -ngl 8 -t 2 -p "Hello" -n 32`.
- Requisito de sistema: un ICD de OpenCL que aun soporte la GPU (para Fermi, driver legacy NVIDIA 390.157).
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Backend | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| eightman999/openllama-3b-ggml-legacy | 3B | GGML GGJT v3, Q4_0 | llama.cpp commit `2e6cd4b` + CLBlast | Apache 2.0 | 0 descargas, 0 likes | Orientado a Fermi/Kepler; parche `n_mult = 8640` |
| rustformers/open-llama-ggml | 3B, 7B, 13B | GGML | llama.cpp de la epoca | Apache 2.0 | Repositorio comunitario consolidado | Conversiones de los modelos OpenLLaMA |
| SlyEcho/open_llama_3b_ggml | 3B | GGML y cuantizaciones mas recientes | llama.cpp | Apache 2.0 | Repositorio comunitario con 28 likes | Publica perplejidad sobre `wiki.test.raw` |
| openlm-research/open_llama_3b_v2 | 3B | PyTorch y JAX | Frameworks de referencia | Apache 2.0 | Checkpoint upstream | Origen del que deriva este fichero |

No se dispone de datos de rendimiento comparados en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia, backend y disponibilidad.

## Limitaciones y advertencias

- Modelo base preentrenado: no es un modelo ajustado con instrucciones ni un modelo de chat, por lo que no sigue instrucciones complejas ni mantiene un formato conversacional.
- Riesgo de alucinacion: un modelo de 3B parametros de 2023 presenta una tasa elevada de afirmaciones incorrectas, especialmente en tareas factuales y matematicas.
- Limitacion idiomatica: el modelo base es de dominio predominantemente ingles; el rendimiento en castellano no esta documentado y cabe esperar que sea deficiente.
- Contexto limitado: la ventana efectiva no se especifica en esta ficha y el runtime de mayo de 2023 no incorpora tecnicas modernas de atencion eficiente.
- Incompatibilidad de formato: los cargadores GGUF no pueden abrir el fichero, y el runtime antiguo no puede cargar checkpoints con GQA. Esto bloquea cualquier integracion con Ollama, vLLM o TGI.
- Dependencia de software obsoleto: el fork esta anclado al commit `2e6cd4b` (23 de mayo de 2023); el driver NVIDIA 390.157 esta fuera de soporte y no recibe actualizaciones de seguridad.
- Restricciones practicas de OpenCL: la ruta de ejecucion depende de un ICD que soporte OpenCL 1.1, algo cada vez menos frecuente en distribuciones actuales.
- Sin validacion comunitaria: 0 descargas y 0 likes implican ausencia de verificacion independiente del fichero mas alla de la prueba declarada en una GT 430.
- Sin benchmarks publicados: no hay base objetiva para comparar su calidad con otros modelos de 3B.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero el desarrollador asume la responsabilidad de cumplir las condiciones del checkpoint base y de evaluar la idoneidad de ejecutar modelos en drivers sin mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eightman999/openllama-3b-ggml-legacy
- Checkpoint base OpenLLaMA 3B v2: https://huggingface.co/openlm-research/open_llama_3b_v2
- Fork de llama.cpp con parches para Fermi/CLBlast: https://github.com/eightman999/llama-fermi-clblast
- Repositorio upstream de llama.cpp: https://github.com/ggml-org/llama.cpp
- Proyecto OpenLLaMA (evaluaciones y pesos PyTorch/JAX): https://github.com/openlm-research/open_llama
- Conversiones GGML de OpenLLaMA por rustformers: https://huggingface.co/rustformers/open-llama-ggml
- Conversiones GGML de OpenLLaMA 3B por SlyEcho: https://huggingface.co/SlyEcho/open_llama_3b_ggml
- Ollama (no compatible con este formato): https://ollama.com/
