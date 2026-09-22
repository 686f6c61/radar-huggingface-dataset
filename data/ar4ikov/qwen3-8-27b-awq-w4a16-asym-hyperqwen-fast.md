# Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast

## Resumen

Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast es una version cuantizada y reempaquetada del modelo multimodal Qwen3.8-27B, publicada por el usuario Ar4ikov y pensada para servirse en una unica tarjeta grafica de 24 GB. No es un modelo entrenado desde cero: parte del checkpoint Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM, a su vez una cuantizacion int4 asimetrica de Qwen/Qwen3.8-27B (licencia Apache-2.0), y lo adapta al pipeline de HyperQwen del proyecto syv-ai para anadir decodificacion especulativa y reducir el peso de las cabezas de salida.

El modelo tiene 27.356.728.560 parametros (dato de safetensors) y ocupa 16,1 GB en el repositorio. La arquitectura descrita es hibrida, con capas de atencion y capas Gated-DeltaNet (proyecciones de puerta tipo SSM), 64 capas en el cuerpo, una torre de vision en bf16 y un modulo MTP (multi-token prediction) para decodificacion especulativa. El pipeline declarado es image-text-to-text, por lo que acepta imagenes y texto como entrada.

Su relevancia practica es de ingenieria de despliegue: el autor publica el resultado de un paso de preparacion que normalmente se ejecutaria en CPU en cada maquina (~10 minutos), de modo que sirve una sola descarga. En las mediciones del propio autor alcanza 130,7 tok/s en un unico flujo y 449 tok/s con ocho flujos concurrentes en una RTX 3090. El repositorio tiene 7 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto muy poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion y capas Gated-DeltaNet; 64 capas en el cuerpo; torre de vision; cabezal MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (la informacion no documenta estructura MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion documentada (`--max-model-len 65536`); el perfil `CTX=fast` corresponde a 64k |
| Tipos de cuantizacion | Cuerpo: int4 AWQ asimetrico, grupo 128, con zero points (compressed-tensors, generado con llm-compressor desde bf16). `lm_head`: int4 GPTQ simetrico grupo 128. `embed_tokens`: int8 simetrico grupo 128. Modulo MTP (`mtp.*`, 8 lineales incluido `mtp.fc`): int8 simetrico grupo 128. Torre de vision, proyecciones de puerta SSM y normas del cabezal MTP: bf16. Cabezal de borrador: 40.960 filas, int4 |
| Idiomas soportados | no disponible (el repositorio no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors, formato esperado por vLLM |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado por el autor, sino de una cuantizacion y reempaquetado. El cuerpo es un transformer hibrido: la ficha menciona explicitamente "hybrid Gated-DeltaNet / attention layers" y la receta de cuantizacion AWQ para esas capas hibridas, con 64 capas en el cuerpo. Se conservan en bf16 la torre de vision, las proyecciones de puerta del bloque SSM y las normas del cabezal MTP. El modelo base Qwen3.8-27B es de tipo instruct multimodal, pero la informacion disponible no detalla el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO.

La innovacion tecnica del repositorio esta en la preparacion del checkpoint para el pipeline de HyperQwen: el `lm_head` original en bf16 (2,5 GB) se convierte a int4 GPTQ con grupo 128 y calibracion sobre 400.000 estados ocultos finales del propio modelo, lo que reduce la divergencia KL de 0,0070 (RTN int4) a 0,0024 respecto a la cabeza en bf16; `embed_tokens` pasa a int8 con un error de ida y vuelta del 0,65 %; el modulo MTP (850 MB en bf16) pasa a int8; y se anade un cabezal de borrador de 40.960 filas en int4, recortado del `lm_head`, junto a la lista de identificadores `mtp_draft_vocab_ids.pt`. Ese cabezal pequeno es lo que permite la decodificacion especulativa (`SPEC=mtp`) y el modo `SPEC=dflash2`.

## Capacidades

- Generacion de texto conversacional en modo instruct, con decodificacion especulativa activada mediante el cabezal MTP o el modo dflash2.
- Entrada multimodal imagen-texto: la pipeline declarada es image-text-to-text y la torre de vision permanece en bf16 y se puede activar con `VISION=1`.
- Descripcion de imagenes: la ficha indica que las imagenes se describen correctamente en todos los perfiles probados (cuadrado rojo dibujado, circulo azul y una linea de texto, en `boost/image_smoke.py`).
- Contexto largo: hasta 65.536 tokens en la configuracion documentada, con un pool de KV medido de 53.233 entradas en el perfil `CTX=fast`.
- Servicio concurrente: vLLM con 8 flujos simultaneos medidos a 449 tok/s.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma explicita.
- Capacidades multilingues: no disponibles (no se declaran idiomas en el repositorio).
- Modo "thinking": no documentado en esta ficha.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en una sola GPU de consumo: con 16,1 GB de pesos, una tarjeta de 24 GB como la RTX 3090 o la RTX 4090 deja espacio para la cache KV (pool medido de 53.233 entradas), que es precisamente el objetivo declarado del repositorio.
- Inferencia multimodal de baja latencia: el uso de decodificacion especulativa con `SPEC=mtp` o `SPEC=dflash2` eleva los tokens aceptados por paso a 3,17-3,44, lo que se traduce en 130,7 tok/s en un unico flujo.
- Procesamiento por lotes de documentos con imagen: extraccion de informacion de capturas, formularios o diagramas activando `VISION=1`, con 8 peticiones concurrentes a 449 tok/s agregados.
- Investigacion en cuantizacion: el repositorio publica la receta y las mediciones de KL para `lm_head` (0,0070 con RTN frente a 0,0024 con GPTQ) y el error de ida y vuelta del 0,65 % en `embed_tokens`, por lo que sirve como caso de estudio reproducible de cuantizacion mixta.
- Evaluacion de decodificacion especulativa: los perfiles `SPEC=mtp` y `SPEC=dflash2` con distintos `DFLASH_MAX_LEN` permiten comparar velocidad frente a calidad en el mismo hardware.
- Servicio de asistentes conversacionales con contexto largo: la ventana de 65.536 tokens admite conversaciones multi-turno extensas o documentos largos acompanados de imagenes.
- Despliegue reproducible en contenedor: la imagen `vllm-qwen-boost` descarga, verifica y sirve el modelo, lo que reduce el riesgo de errores de configuracion en entornos de produccion internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos son mediciones de throughput del propio autor en una RTX 3090 a 350 W con vLLM 0.29.0, usando `bench/run_benchmarks.sh single` en una segunda ejecucion tras el arranque y con `VISION=1` (la torre de vision se transmite desde la RAM del host por imagen).

| Perfil | C1, T=default | C1, T=0 | Tokens por paso | C8, T=default | Pool de KV |
|---|---|---|---|---|---|
| `SPEC=dflash2 CTX=fast KV_MEM=4.600.000.000 DFLASH_MAX_LEN=49152` | 130,7 tok/s | 144,9 tok/s | 3,17 / 3,44 | 449 tok/s | 53.233 |
| `SPEC=mtp CTX=fast` (64k) | no ejecutado por separado; el hermano con cabeza int8 mide 111,4 / 116,0, y la variante rapida sin censura gana un +5 % / +9 % sobre su hermano | | | | |

C1 equivale a un flujo unico con prompts reales y respuestas de 1.024 tokens; C8, a ocho flujos concurrentes. La ficha tambien remite a `github.com/Ar4ikov/vllm-qwen-boost` para la tabla completa, los perfiles W4A8 (cabeza int8) y las mediciones de kernels.

## Requisitos de hardware

- VRAM: el repositorio ocupa 16,1 GB. El objetivo declarado es servirlo en una tarjeta de 24 GB dejando hueco para la cache KV; en el perfil medido se reservaron 4,6 GB (`KV_MEM=4600000000`) para un pool de 53.233 entradas.
- GPU recomendadas: el autor mide sobre una RTX 3090 a 350 W y describe el objetivo como "one 24 GB card", lo que incluye la RTX 4090. No se documentan mediciones en A100, H100 ni otras GPU de centro de datos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con el perfil publicado. No hay datos para tarjetas de 12 o 16 GB.
- RAM del host: la torre de vision se transmite desde la RAM del sistema imagen a imagen cuando `VISION=1`; no se especifica la cantidad necesaria.
- Opciones de despliegue: vLLM 0.29.0 con la serie de parches (`Ar4ikov/HyperQwen@awq-asym` y el kernel `marlin-int8-asym-zp`); la imagen Docker `vllm-qwen-boost` con `docker compose --profile single up -d`; y vLLM 0.29 estandar (`vllm serve ... --max-model-len 65536`), aunque en ese caso se pierden la decodificacion especulativa, el cabezal de borrador y la ruta int8 Marlin.
- No se documentan opciones llama.cpp, Ollama, TGI ni pesos GGUF.
- Latencia y throughput: 130,7 tok/s en C1 con temperatura por defecto y 144,9 tok/s con T=0; 449 tok/s con 8 flujos. La velocidad por paso se situa en 3,17-3,44 tokens aceptados por paso gracias a la decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento medido | Licencia |
|---|---|---|---|---|---|
| Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast (este) | 27,36 B | Cuerpo int4 AWQ asim g128, `lm_head` int4 GPTQ, cabezal de borrador int4 | 65.536 tokens | 130,7 tok/s C1 (dflash2); 449 tok/s C8 | apache-2.0 |
| Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen | 27,36 B (no confirmado en la informacion) | Igual, pero `lm_head` en int8 | 64k en el perfil `SPEC=mtp` | 111,4 / 116,0 tok/s C1 (perfil mtp); +0,6 % menos de perplejidad que este | apache-2.0 |
| Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM | no disponible | Cuerpo int4 AWQ asim g128; `lm_head` y `embed_tokens` en bf16 (2,5 GB cada uno) | no disponible | no disponible | apache-2.0 |
| Qwen/Qwen3.8-27B (modelo raiz) | no disponible | bf16 (sin cuantizar) | no disponible | no disponible | apache-2.0 |

No se dispone de comparaciones con modelos de otras familias de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de una cuantizacion de terceros (Ar4ikov), no de un artefacto oficial de Qwen; no hay evaluacion de calidad mas alla de la perplejidad del `lm_head` y de una prueba de humo con imagenes.
- Adopcion muy baja: 7 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser una cuantizacion int4 de un modelo instruct, la degradacion respecto al modelo en bf16 no esta cuantificada de forma global.
- Idiomas soportados: no declarados. No hay garantia documentada de comportamiento multilingue ni de calidad en castellano.
- La ventana de contexto documentada es de 65.536 tokens; la ficha no confirma si el modelo raiz admite una ventana mayor que este reempaquetado no degrade.
- Sin soporte verificado de tool calling, function calling ni flujos de agente multi-paso.
- Restricciones de licencia: Apache-2.0 tanto en este repositorio como en el modelo raiz, por lo que el uso comercial esta permitido; conviene revisar igualmente las condiciones del checkpoint intermedio y de los componentes de HyperQwen en sus propios repositorios.
- Dependencia de infraestructura no estandar: rendimiento maximo solo con la serie de parches de HyperQwen y vLLM 0.29.0; en vLLM estandar se pierde la decodificacion especulativa y la ruta int8 Marlin.
- Inconsistencia en el etiquetado: las etiquetas del repositorio incluyen simultaneamente `qwen3_5` y `qwen3.8`, lo que puede inducir a confusion sobre la version real del modelo raiz.
- La ficha menciona una "variante rapida sin censura" sin especificar si este checkpoint concreto es esa variante; la ausencia de evaluaciones de seguridad y de alineacion es un caveat relevante para produccion.
- El modo de vision transmite la torre desde la RAM del host por imagen, lo que puede anadir latencia variable segun la maquina.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast
- Modelo base (cuantizacion de origen): https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM
- Variante con `lm_head` en int8: https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.8-27B
- HyperQwen (proyecto de syv-ai): https://github.com/syv-ai/HyperQwen
- Rama con los parches utilizados: https://github.com/Ar4ikov/HyperQwen/tree/awq-asym
- Imagen de servicio vLLM: https://github.com/Ar4ikov/vllm-qwen-boost
- Los resultados de la busqueda web no contienen enlaces relevantes para este modelo (las paginas devueltas tratan de letras del alfabeto frances, letras de canciones y mirrors de Wikipedia).
