# maccelerate/Qwen3.8-27B-UD3-Q5_K_M-MLX

## Resumen

Qwen3.8-27B-UD3-Q5_K_M-MLX es una recuantizacion nativa en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario maccelerate. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una conversion: el autor lee la asignacion de bits por tensor del checkpoint GGUF oficial de Unsloth Dynamic v3.0 (UD-Q5_K_M) y vuelve a codificar los pesos bf16 limpios del modelo original en el formato afín de MLX, manteniendo exactamente la misma anchura por tensor que el GGUF de origen. El resultado es un artefacto de 19,72 GB y 27.320.697.856 parametros totales, con 5,774 bits efectivos por peso cuantizado, distribuido en 10 shards de SafeTensors.

La relevancia de esta ficha es acotada y muy especifica: es una build destinada a ejecutarse en Apple Silicon mediante mlx-serve, no en mlx-lm estandar. El propio autor advierte que mlx-lm 0.31.3 puede cargar los ficheros pero produce salida corrupta, porque interpreta la presencia de los pesos del cabezal MTP como evidencia de que hay que aplicar de nuevo la transformacion de normalizacion de Qwen3.8. Ademas, el modelo es solo texto: la torre de vision se ha omitido deliberadamente.

Al ser una conversion de pesos, no aporta informacion nueva sobre datos de entrenamiento, composicion del dataset ni fases de alineacion: todo eso pertenece al modelo base Qwen/Qwen3.8-27B, cuyos detalles no se incluyen en la informacion disponible. Su valor practico esta en permitir inferencia local de un modelo de 27B con precision mixta en Macs con memoria unificada suficiente, preservando el cabezal MTP para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas GDN (Gated DeltaNet) y atencion, mas cabezal MTP; pesos re-codificados en formato afín de MLX (la model card no detalla el numero de capas ni la configuracion completa) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta por tensor en MLX: 4, 5, 6 y 8 bits (124 tensores a 8 bits, 160 a 6 bits, 189 a 5 bits, 33 a 4 bits; 506 tensores en total). 5,774 bits efectivos por peso cuantizado. Normas, sesgos, pesos de convolucion y estado SSM permanecen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (10 shards) + manifest.json con hashes y comprobaciones estructurales |
| Tamano en disco | 19,72 GB (repo HF: 19,7 GB) |
| Modelo base | Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Origen de la cuantizacion | unsloth/Qwen3.8-27B-GGUF, fichero Qwen3.8-27B-UD-Q5_K_M.gguf (SHA-256 2de73110cb254cbf09b54b717578dadff12ef1194e7271527e68202f39ba4bfd) |
| Runtime compatible | mlx-serve; no soportado por mlx-lm estandar |
| Modalidad | Solo texto (torre de vision omitida) |

## Arquitectura y entrenamiento

La model card identifica componentes de arquitectura a traves de la tabla de asignacion de pesos: modulos GDN de proyeccion de entrada QKV (2,52 B de parametros), proyeccion de entrada Z (1,51 B) y proyeccion de salida (1,51 B), ademas de atencion Q/K/V/O (1,68 B), MLP gate + up (11,41 B), MLP down (5,70 B), LM head (1,27 B), embeddings de tokens (1,27 B) y cabezal MTP (0,37 B). La presencia de proyecciones GDN y de estado SSM conservado en bf16 apunta a una arquitectura hibrida con mecanismos de atencion lineal o de espacio de estados combinados con atencion clasica, pero la informacion disponible no detalla el numero de capas, el patron de intercalado ni la dimension oculta. Tampoco se especifica la longitud de contexto.

En cuanto al entrenamiento, esta ficha no aporta datos: se trata de una recuantizacion, no de un modelo entrenado. El autor no publica numero de tokens, composicion del dataset ni fases de RLHF o DPO, y remite al modelo base para esas cuestiones. La innovacion tecnica relevante es de conversion: para los tensores a 4 y 8 bits se usa la imatrix oficial en una busqueda ponderada por activaciones, mientras que los tensores a 5 y 6 bits usan mx.quantize porque la ruta de empaquetado ponderado de MLX no implementa esas anchuras de salida. Se preserva el cabezal MTP, lo que habilita decodificacion especulativa, y se omite la torre de vision.

## Capacidades

- Generacion de texto y uso conversacional, segun los tags del repositorio (text-generation, conversational).
- Decodificacion especulativa: el cabezal MTP (0,37 B de parametros, 0,31 GB en disco) se conserva expresamente, lo que permite acelerar la generacion prediciendo varios tokens por paso.
- Inferencia local en Apple Silicon mediante mlx-serve, con soporte de cuantizacion del KV cache (flag --kv-quant).
- Modelo solo texto: la torre de vision se ha omitido de forma deliberada, por lo que no hay capacidades multimodales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible; sin indicios de soporte.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede servirse con mlx-serve como endpoint local para chats multi-turno, manteniendo los datos en la maquina sin depender de API externas, algo relevante en entornos con requisitos de privacidad.
- Procesamiento de documentos confidenciales: al ejecutarse en local sobre Apple Silicon, permite resumir, extraer y reformular documentos sensibles (contratos, informes internos) sin que el texto salga del equipo.
- Generacion de codigo en escritorio: un modelo de 27,32 B con este nivel de cuantizacion es adecuado para autocompletado, explicacion de funciones y refactorizacion dentro de un IDE, siempre que se acepte la latencia de un Mac con memoria unificada suficiente.
- Laboratorio de decodificacion especulativa: la conservacion del cabezal MTP convierte este checkpoint en un banco de pruebas para medir la ganancia de la decodificacion especulativa en MLX frente a la generacion autoregresiva estandar.
- Prototipado de aplicaciones de IA sin GPU dedicada: equipos de desarrollo que trabajan exclusivamente en macOS pueden validar prompts, plantillas y flujos conversacionales antes de desplegar en infraestructura con CUDA.
- Investigacion sobre cuantizacion por tensor: al exponer la asignacion exacta de anchuras heredada de Unsloth Dynamic v3.0, el artefacto sirve para estudiar como afecta la precision mixta 4/5/6/8 bits por clase de peso a la calidad de salida.
- Servicio de inferencia local con cache KV cuantizado: el flag --kv-quant 8 de mlx-serve permite atender sesiones concurrentes reduciendo el consumo de memoria del cache, util para demos y entornos de validacion en un unico Mac.
- Procesamiento por lotes offline: tareas de reescritura, clasificacion o generacion de resumenes ejecutadas de forma nocturna sobre un Mac de sobremesa, sin coste por token y con control total del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco declara paridad numerica con el GGUF de origen: el propio autor indica explicitamente que este checkpoint no es una conversion sin perdidas y que no reclama equivalencia numerica con los codebooks K-quant o IQ de llama.cpp. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- Plataforma obligatoria: Mac con Apple Silicon (familia M) y macOS. No hay soporte CUDA.
- Espacio en disco: al menos 20 GB para los ficheros del modelo, mas espacio de trabajo para la descarga. El artefacto publicado ocupa 19,72 GB.
- Memoria unificada: el autor no ha validado ninguna configuracion minima para esta build Q5; solo indica que la necesidad real depende del cache KV, la longitud de contexto y las peticiones concurrentes. Como referencia orientativa, los 19,72 GB de pesos mas el cache KV requieren una maquina con 32 GB de memoria unificada o superior, aunque se trata de una estimacion y no de un requisito confirmado por el autor.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicable; el formato MLX no se ejecuta en CUDA.
- GPU de consumo: la unica "consumer" aplicable son los propios SoC de Apple. No cabe en tarjetas graficas dedicadas de consumo porque el formato no es compatible.
- Opciones de despliegue: mlx-serve es el runtime previsto. mlx-lm estandar no es compatible: la version 0.31.3 carga los ficheros pero genera salida corrupta por doble aplicacion de la transformacion de normalizacion de Qwen3.8. Al ser formato MLX, no aplican vLLM, TGI, llama.cpp ni Ollama sobre este artefacto concreto.
- Perfiles de mlx-serve: el pack es de anchura mixta, por lo que el perfil NAX MTP de anchura uniforme no aplica; debe usarse el perfil generico, que si soporta los pesos MTP retenidos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Solo se dispone de datos sobre el propio artefacto, su GGUF de origen y el modelo base en bf16. No hay informacion sobre otros modelos comparables en la documentacion proporcionada.

| Modelo | Parametros | Formato | Tamano | Precision | Licencia | Hardware |
|---|---|---|---|---|---|---|
| maccelerate/Qwen3.8-27B-UD3-Q5_K_M-MLX | 27,32 B | safetensors MLX (10 shards) | 19,72 GB | Mixta 4/5/6/8 bits MLX, 5,774 bits efectivos | Apache-2.0 | Apple Silicon, mlx-serve |
| unsloth/Qwen3.8-27B-GGUF (UD-Q5_K_M) | 27,32 B | GGUF | no disponible | Q5_K_M con asignacion dinamica por tensor | Apache-2.0 | llama.cpp y derivados |
| Qwen/Qwen3.8-27B | 27,32 B | safetensors | no disponible | bf16 | Apache-2.0 | GPU con VRAM suficiente |

La diferencia principal entre las tres entradas no es de rendimiento sino de formato y ecosistema de ejecucion: la version MLX esta pensada para Apple Silicon, la GGUF para llama.cpp y la bf16 para servidores con GPU. No se dispone de comparaciones de calidad entre ellas.

## Limitaciones y advertencias

- Compatibilidad de runtime restringida: no funciona correctamente con mlx-lm estandar. Con la version 0.31.3 la carga puede completarse pero la salida greedy aparece corrupta. Es obligatorio usar mlx-serve.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, ni propia ni comparativa con el GGUF o el modelo bf16. No hay evidencia cuantitativa de la degradacion introducida por la cuantizacion.
- Sin paridad numerica declarada: el autor afirma explicitamente que no se trata de una conversion sin perdidas y que no reclama equivalencia con los codebooks de llama.cpp.
- Memoria minima no validada: no existe una configuracion de memoria minima confirmada para esta build Q5; el propio autor lo indica. Cualquier cifra de VRAM o memoria unificada es una estimacion.
- Modelo solo texto: la torre de vision se omite deliberadamente, por lo que no puede procesar imagenes.
- Idiomas no declarados: la model card no enumera idiomas soportados, de modo que el comportamiento multilingue no esta garantizado ni documentado para este artefacto.
- Contexto no declarado: se desconoce la longitud de contexto soportada, lo que dificulta dimensionar el cache KV en produccion.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; no hay evaluaciones de fidelidad ni de tasas de alucinacion.
- Sesgos: no disponible; no se documentan sesgos conocidos para esta conversion ni para el modelo base en la informacion facilitada.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Fecha de publicacion: el repositorio figura creado y actualizado el 16 de septiembre de 2026, una ventana muy corta tras su publicacion, lo que refuerza la falta de validacion externa.
- Licencia: los pesos, el GGUF de origen y el codigo de conversion se distribuyen bajo Apache-2.0, lo que permite uso comercial. Conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3.8-27B y del GGUF de Unsloth para la atribucion correspondiente.
- Reproducibilidad: el artefacto incluye manifest.json con hashes de shards y comprobaciones estructurales, lo que permite verificar la integridad de la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maccelerate/Qwen3.8-27B-UD3-Q5_K_M-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen de la cuantizacion: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime recomendado (mlx-serve): https://github.com/ddalcu/mlx-serve
- Convertidor utilizado (maccelerate): https://github.com/maccelerate-ai/maccelerate
- Hallazgo de compatibilidad con mlx-lm: https://github.com/maccelerate-ai/maccelerate/blob/main/docs/qwen38-mlx-lm-compatibility.md
