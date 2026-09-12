# AIconjured/Qwen3.8-27B-TURBO-Fable-ColdFusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-NVFP4-Q8-Q3-GGUF

## Resumen

Este repositorio contiene una recuantizacion GGUF en precision mixta del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP, publicada por el usuario AIconjured. No es un modelo entrenado desde cero ni un fine-tune nuevo: es un reempaquetado de pesos cuyo objetivo es reducir el tamano de 29,0 GB (Q8_0) a 13,2 GB manteniendo, segun su autor, una calidad cercana a 8 bits. La receta combina NVFP4 como tipo por defecto, q3_K en las capas intermedias (14-50), F16 en cuatro tensores sensibles y F32 en normas y parametros de SSM.

La model card describe la arquitectura como "qwen35", hibrida de SSM y atencion, con 48 capas SSM, 17 capas de atencion y una cabeza MTP (Multi-Token Prediction) adicional, 27,32 B de parametros densos, embedding de 5.120 y una ventana de contexto de 262.144 tokens. Incluye un proyector de vision CLIP en BF16 (mmproj-BF16.gguf, 889 MB), por lo que el pipeline es multimodal entrada de imagen + texto, aunque el repositorio se etiqueta como text-to-text.

Su relevancia practica es acotada pero clara: permite ejecutar un modelo de clase 27B con vision y contexto largo en GPU de consumo, y aprovechar la ruta nativa de tensor cores FP4 de las GPU Blackwell (serie RTX 50). El repositorio tiene 0 descargas y 1 like en el momento de la consulta, la licencia no esta declarada y no se han publicado resultados de benchmarks estandar, por lo que la validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35, hibrida SSM + atencion: 48 capas SSM + 17 capas de atencion + 1 cabeza MTP |
| Parametros totales | 27,32 B densos segun la model card; el campo de parametros safetensors del repositorio indica 460.730.096 (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: NVFP4 (215 tensores, 4,56 bpw), q3_K (287 tensores, 3,44 bpw), F16 (4 tensores, 16,0 bpw), F32 (360 tensores, 16,0 bpw); 4,07 bpw de media sobre 866 tensores |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Dimension de embedding | 5.120 |
| Tamano de los pesos principales | 13,2 GB (frente a 29,0 GB del Q8_0; reduccion del 54 %) |
| Proyector de vision | mmproj-BF16.gguf, 889 MB (CLIP, sin cambios respecto al modelo base) |
| Tamano del repositorio | 14,8 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura declarada es "qwen35", un diseno hibrido que combina capas de espacio de estados (SSM) con capas de atencion clasica: 48 capas SSM, 17 capas de atencion y una cabeza MTP adicional de prediccion multi-token. Esta ultima se conserva intacta en la recuantizacion (`qwen35.nextn_predict_layers = 1`, 10 tensores `blk.64.nextn.*`), lo que habilita decodificacion especulativa mediante `llama-server --spec-type draft-mtp --spec-draft-n-max 4`. El embedding es de 5.120 dimensiones.

No hay informacion sobre el entrenamiento original: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El pipeline del autor de esta ficha es exclusivamente de cuantizacion, no de entrenamiento. La receta aplicada es la siguiente: NVFP4 con escalas de entrada calibradas por imatrix como tipo por defecto para todos los pesos de computo; q3_K en las capas 14-50 (identificadas como la region menos sensible, siguiendo la estrategia Q3_K_L de Bartowski), que aportan el grueso del ahorro (~1,4 GB frente a un build todo-NVFP4); F16 en `blk.0.attn_gate`, `blk.0.attn_qkv`, `blk.0.ffn_down` y `blk.13.ffn_down` como proteccion contra colapso de valores singulares; y F32 en normas, parametros SSM, pesos de convolucion y cabezas de la MTP, obligado por restricciones de los kernels CUDA (`ssm-conv.cu` exige F32 en los pesos de convolucion) y por compatibilidad del cargador de la MTP.

## Capacidades

- Generacion de texto en formato text-to-text, segun las etiquetas del repositorio.
- Entrada multimodal de vision: el repositorio incluye el proyector CLIP `mmproj-BF16.gguf`, aunque no se documentan tareas concretas de vision evaluadas.
- Decodificacion especulativa mediante la cabeza MTP integrada, con soporte en `llama-server` (`--spec-type draft-mtp`).
- Enfoque declarado a codigo: el nombre del modelo incluye "NEO-CODER-MAX" y la verificacion de calidad incluye generacion de codigo (Fibonacci) con resultado identico al Q8_0.
- Comportamiento "uncensored" / "heretic": el nombre del modelo base indica que se ha reducido o eliminado el alineamiento de rechazo. No se documenta el metodo ni el alcance real de esa modificacion.
- Razonamiento aritmetico basico verificado en un caso (acertijo de las 17 ovejas) y recuerdo factual (capitales: Canberra, Ottawa, Paris).
- Escritura creativa: un caso de narrativa breve coherente verificado con decodificacion greedy.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; la unica capacidad relacionada documentada es la MTP para acelerar la decodificacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 13,2 GB de pesos cabe completo en una RTX 4090 (24 GB) o en una RTX 5060 Ti (16 GB), lo que permite un asistente de autocompletado y refactorizacion sin depender de APIs externas ni enviar codigo propietario a terceros.
- Analisis de repositorios completos: la ventana de 262.144 tokens admite volcar bases de codigo de tamanio medio en un unico contexto para revision de arquitectura, deteccion de dependencias ciclicas o generacion de documentacion transversal.
- Servidor de inferencia con decodificacion especulativa: desplegado con `llama-server --spec-type draft-mtp --spec-draft-n-max 4`, la cabeza MTP permite proponer varios tokens por paso, util para servir peticiones concurrentes en un equipo con dos GPU de 16 GB.
- Procesamiento de documentos con componente visual: gracias al proyector CLIP, se puede usar para extraer informacion de capturas, diagramas o documentacion escaneada combinando imagen y texto en la misma peticion.
- Generacion creativa sin filtros de rechazo: para proyectos de ficcion, guiones o role-play donde el alineamiento estandar del modelo base resulta restrictivo; requiere revision editorial posterior.
- Investigacion en cuantizacion: el repositorio documenta de forma reproducible la receta de tipos por tensor, lo que lo convierte en un caso de estudio util para medir el impacto de q3_K y NVFP4 en capas SSM frente a capas de atencion.
- Red teaming y evaluacion de seguridad: un modelo sin alineamiento de rechazo con 262.000 tokens de contexto sirve para generar casos adversarios y estudiar la robustez de clasificadores, siempre en entornos controlados y con registro de uso.
- Generacion de codigo en pipelines de CI/CD: no hay soporte documentado de tool calling, por lo que su integracion se limitaria a generacion de texto o parches mediante scripts propios, no a llamadas a funciones nativas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica verificacion reportada es una comparacion cualitativa con decodificacion greedy (temperatura 0, semilla 42) entre el Q8_0 original y este build NVFP4 + q3_K, sobre cuatro prompts:

| Prueba | Q8_0 original | NVFP4 + q3_K | Resultado declarado |
|---|---|---|---|
| Generacion de codigo (Fibonacci) | Implementacion correcta | Identica | Coincide |
| Acertijo matematico (17 ovejas) | "9. All but 9 die means 9 survive." | Identica | Coincide |
| Recuerdo factual (capitales) | Canberra, Ottawa, Paris | Identicas | Coincide |
| Escritura creativa (terror) | Historia coherente de 2 frases | Historia coherente de 2 frases | Coincide |

Rendimiento medido por el autor en una configuracion de doble RTX 5060 Ti con offload completo a GPU:

| Metrica | Valor |
|---|---|
| Velocidad de evaluacion (generacion) | 25,8 t/s |
| Procesamiento de prompt | 188-364 t/s |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB (13,2 GB de pesos + overhead del proyector de vision de 889 MB y cache KV).
- Doble RTX 5060 Ti (32 GB en total): offload completo a GPU confirmado por el autor.
- RTX 5060 Ti unica (16 GB): cabe con margen segun el autor.
- RTX 4090 (24 GB): cabe con margen amplio.
- RTX 4070 Ti y RTX 4070 (12 GB): requieren offload parcial a CPU, con la consiguiente caida de velocidad.
- La ruta nativa de tensor cores FP4 (NVFP4) esta pensada para GPU Blackwell (serie RTX 50). En generaciones anteriores se pierde esa ventaja; el comportamiento exacto del fallback no esta documentado en la informacion disponible.
- Opciones de despliegue: llama.cpp / `llama-server` (unico documentado con soporte de decodificacion especulativa MTP) y Ollama mediante importacion con Modelfile (Ollama no soporta spec-decode, por lo que no se aprovecha la MTP). No se documenta soporte de vLLM ni de TGI.
- Parametros recomendados en el Modelfile: temperatura 0,7 y top_p 0,9.
- Latencia y throughput: 25,8 t/s de generacion y 188-364 t/s de procesamiento de prompt en doble RTX 5060 Ti. No hay datos para otras configuraciones.

## Comparativa con modelos similares

Solo se dispone de datos de las variantes del mismo modelo base; no hay informacion en la documentacion proporcionada sobre modelos comparables de otros autores.

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (AIconjured, NVFP4 + q3_K MID) | 27,32 B densos declarados | 262.144 tokens | GGUF mixto, 13,2 GB, 4,07 bpw | no disponible | 0 descargas, 1 like |
| Mismo modelo en Q8_0 (referencia del autor) | 27,32 B densos declarados | 262.144 tokens | GGUF Q8_0, 29,0 GB | no disponible | usado como referencia de calidad |
| Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | 27,32 B densos declarados | 262.144 tokens | GGUF | no disponible | repositorio publico en HuggingFace |

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia explicita impide asumir permiso de uso comercial. Cualquier despliegue en produccion requiere aclarar primero los terminos con el autor y con el autor del modelo base.
- Modelo "uncensored" / "heretic": el alineamiento de seguridad ha sido reducido o eliminado segun indica el propio nombre. Puede generar contenido danino, ilegal o sesgado sin rechazo, lo que supone un riesgo de cumplimiento en entornos regulados y en aplicaciones de cara al publico.
- Procedencia de los pesos no verificable: no hay informacion sobre el dataset de entrenamiento ni sobre el proceso de alineamiento del modelo base, ni confirmacion de que "Qwen3.8" corresponda a un lanzamiento oficial. El nombre procede de la cadena de fine-tunes de DavidAU.
- Discrepancia de parametros: la model card declara 27,32 B densos, pero el campo de parametros safetensors del repositorio indica 460.730.096. La informacion disponible no resuelve esta contradiccion.
- Evidencia de calidad muy limitada: la unica validacion son cuatro prompts con decodificacion greedy, sin repeticiones, sin metricas objetivas y sin comparacion contra modelos externos. No es suficiente para descartar degradacion en tareas de razonamiento largo, matematicas avanzadas o generacion de codigo extensa.
- Cuantizacion agresiva en capas intermedias: el uso de q3_K en 287 tensores de las capas 14-50 puede degradar casos limite que no aparecen en las cuatro pruebas realizadas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion. Es esperable el comportamiento tipico de un modelo de 27 B cuantizado a 4 bits.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluaciones multilingues.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni evaluaciones de terceros.
- Dependencia de hardware Blackwell para el mejor rendimiento: la ventaja de NVFP4 en tensor cores FP4 no se aprovecha fuera de la serie RTX 50.
- Contexto de 262.144 tokens: la ventana es amplia, pero la cache KV a esa longitud consume VRAM adicional no cuantificada en la documentacion, lo que puede obligar a reducir el contexto efectivo en GPU de 16 GB.
- Ollama no soporta decodificacion especulativa: quien despliegue con Ollama renuncia a la aceleracion de la cabeza MTP.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/AIconjured/Qwen3.8-27B-TURBO-Fable-ColdFusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-NVFP4-Q8-Q3-GGUF
- Modelo base en HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Referencia citada en la model card (variante sin sufijo GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces encontrados correspondian a paginas de descarga de NordVPN, sin relacion con este repositorio. No se dispone de paper, blog tecnico, repositorio de codigo ni demo adicionales.
