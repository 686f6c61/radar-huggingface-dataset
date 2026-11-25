# AutomatosX/AX-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP

## Resumen

AX-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP es un checkpoint cuantizado experimental del modelo multimodal Qwen/Qwen3.8-27B, publicado por AutomatosX mediante su toolkit propietario AXQuant (version 2.2.1). Se trata de un empaquetado NVFP4 con esquema W4A16: los pesos se almacenan en formato E2M1 de 4 bits con escalas E4M3 por cada 16 valores, mientras que las activaciones permanecen en BF16. El objetivo es reducir el peso en disco y memoria de un modelo de aproximadamente 27.800 millones de parametros para su despliegue en GPUs con soporte de FP4, principalmente arquitecturas Blackwell.

El modelo base es un transformer multimodal de tipo image-text-to-text de la familia Qwen3.5, con licencia Apache-2.0. El pack incluye los tensores MTP (multi-token prediction) originales empaquetados, aunque el autor advierte explicitamente de que la decodificacion especulativa no esta verificada ni certificada y debe mantenerse desactivada. El repositorio ocupa 20,6 GB y ha sido descargado 90 veces desde su creacion en octubre de 2026.

La relevancia de esta publicacion es acotada y debe interpretarse con cautela: el propio autor la etiqueta como `status=development`, `runtime_verified=false` y `quality_certified=false`. No hay resultados de carga en runtime, ni de generacion, ni comparativas de calidad frente al modelo BF16 original. Es, por tanto, evidencia de desarrollo del toolkit AXQuant mas que un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; incluye tensores MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16: pesos E2M1 (4 bits), escalas E4M3 por grupo de 16, escala global inversa FP32; activaciones BF16; contenedor compressed-tensors NVFP4A16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos heredados del modelo base) |
| Formato de pesos | safetensors con metadatos compressed-tensors |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: es una conversion post-entrenamiento del modelo Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). La arquitectura subyacente es la del modelo base, un transformer multimodal de la familia Qwen3.5 con pipeline image-text-to-text, del que no se detallan en la informacion disponible ni la composicion del dataset, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO.

La innovacion tecnica del pack es el proceso de cuantizacion de AXQuant: un encoder RTN (round-to-nearest) propio, sin calibracion de activaciones ni analisis de sensibilidad medido, ejecutado con un backend de referencia en NumPy sobre una Mac Studio M2 Ultra de 192 GB. Se empaquetan 496 matrices de atencion y MLP del bloque de lenguaje; los otros 703 tensores (vision, embeddings, normalizacion, cabeza de salida y pesos MTP) se preservan identicos al original. El manifest vincula cada peso y fichero de configuracion exportado, y `static-validation.json` registra la comparacion completa de tensores protegidos y un muestreo acotado de filas. El sufijo CUDA del nombre describe el formato de runtime previsto, no el dispositivo de conversion.

## Capacidades

- Generacion de texto y respuesta conversacional multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Capacidades de razonamiento y codigo del modelo base, en la medida en que se conserven tras la cuantizacion (no verificadas).
- Tensores MTP empaquetados para decodificacion especulativa, aunque sin certificar y con instruccion explicita de mantenerla desactivada.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas.

## Casos de uso

- Evaluacion del toolkit AXQuant: usar este checkpoint como banco de pruebas para validar el encoder RTN, el empaquetado compressed-tensors NVFP4A16 y la paridad numerica frente al modelo BF16 antes de adoptar la herramienta en pipelines internos.
- Investigacion sobre cuantizacion FP4: analizar el impacto de W4A16 con escalas E4M3 por grupo de 16 en un modelo multimodal de 27,8 B, comparando perplejidad y calidad de generacion contra el original.
- Pruebas de integracion en GPUs Blackwell: verificar la carga del contenedor NVFP4A16 en runtimes con soporte nativo de FP4 y medir consumo de VRAM frente al checkpoint BF16.
- Prototipado de asistentes multimodales en entornos de I+D: desplegar el modelo en un cluster interno para experimentar con flujos image-text-to-text sin comprometer recursos de produccion.
- Benchmarking de decodificacion especulativa: una vez validados los tensores MTP, medir la ganancia de throughput de la decodificacion especulativa frente a la generacion estandar (siempre en entorno controlado y no en produccion).
- Estudio de reduccion de huella en disco: comparar los 20,6 GB del pack frente al peso del modelo BF16 para planificar estrategias de almacenamiento y distribucion de checkpoints en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay resultados de carga en runtime ni de generacion, que la paridad numerica, la calidad de tarea, la velocidad y el ahorro de memoria no han sido cualificados, y que la unica prueba registrada es una reconstruccion BF16 de referencia con generacion de texto en PyTorch CPU sobre Mac Studio M2 Ultra, que no verifica ejecucion nativa en CUDA ni en FP4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica mediciones. Como referencia teorica, 27,78 B de parametros en 4 bits suponen unos 13,9 GB solo de pesos, a los que hay que sumar activaciones BF16, cache KV y overhead del runtime, sin cifras confirmadas.
- GPU recomendadas: no disponible. El formato NVFP4 apunta a GPUs con soporte nativo de FP4 (familia Blackwell); el autor no certifica ninguna.
- Compatibilidad con GPU de consumo: no verificada. El pack se convirtio en CPU (backend NumPy) y no se ha probado en ninguna GPU.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni AX Engine (el autor aclara que no es un pack MLX de AX Engine).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP | 27,78 B | no disponible | NVFP4 W4A16 (safetensors) | Apache-2.0 | development, runtime no verificado |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B | no disponible | BF16 (safetensors) | Apache-2.0 | modelo de referencia publicado |
| Alternativas cuantizadas de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es frente al modelo base BF16, del que este pack es una conversion. No se dispone de datos de otros checkpoints cuantizados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de desarrollo: el manifest mantiene `status=development`, `runtime_verified=false` y `quality_certified=false`; el autor lo describe como evidencia de desarrollo, no como certificado de calidad.
- Sin validacion en runtime: no hay resultados de carga ni de generacion en CUDA o FP4; solo una prueba de reconstruccion BF16 en CPU.
- Calidad no cualificada: no se ha medido la degradacion frente al modelo BF16 en tareas de texto, vision ni codigo.
- Cuantizacion RTN sin calibracion: el encoder no usa calibracion de activaciones ni analisis de sensibilidad, lo que puede afectar a capas especialmente sensibles.
- MTP sin certificar: la decodificacion especulativa debe permanecer desactivada; los tensores estan empaquetados pero no verificados.
- Vision y audio no probados: la generacion con vision y audio, el contexto largo y la paridad numerica no han sido cualificados.
- Rebuild anunciado: el autor planea reconstruir el pack con una version mejorada de AXQuant y reemplazarlo como nueva revision; conviene fijar un commit si se depende de los ficheros actuales.
- Licencia: los pesos mantienen Apache-2.0 del modelo base y debe preservarse cualquier politica de uso upstream; la licencia del toolkit AXQuant no sustituye a la del modelo fuente.
- Sesgos y alucinacion: no documentados en la informacion disponible; se heredan los del modelo base, no evaluados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-CUDA-AXQ-NVFP4-W4A16-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Repositorio de AutomatosX en Hugging Face: https://huggingface.co/AutomatosX
- Ficheros de validacion citados en la model card: `static-validation.json`, `reference-runtime-smoke.json` (disponibles en el repositorio del modelo)
