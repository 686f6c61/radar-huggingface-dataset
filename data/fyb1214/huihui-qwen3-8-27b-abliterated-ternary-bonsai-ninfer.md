# fyb1214/Huihui-Qwen3.8-27B-Abliterated-Ternary-Bonsai-NInfer

## Resumen

Este repositorio es un reempaquetado de formato, no un modelo nuevo. El autor (fyb1214) toma la versión abliterada y cuantizada en ternario que publicó huihui-ai y la introduce en un contenedor de fichero único con extensión `.ninfer`, el formato que consume el motor de inferencia NInfer. La cadena de procedencia es: `Qwen/Qwen3.8-27B` (modelo base) → `prism-ml/Ternary-Bonsai-2-27B-gguf` (cuantización ternaria con rotación Hadamard) → `huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF` (abliteración de las capas 22 a 52) → este artefacto.

El modelo subyacente es un transformer de 27.000 millones de parámetros con mezcla de atención lineal y completa en proporción 4:1 y capas de espacio de estados (SSM), apilado en 64 capas. El peso se almacena en representación ternaria empaquetada (`PQ2_0`, aproximadamente 2 bits por parámetro), lo que reduce el contenedor completo a 6,87 GiB. Es relevante porque demuestra una vía práctica para ejecutar un modelo de 27B en GPUs de consumo con memoria muy limitada, a costa de depender de un motor de inferencia específico y no estándar.

La "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) no la realiza este repositorio: se hereda íntegra del modelo de huihui-ai y conlleva la pérdida de buena parte del filtrado de seguridad. El pipeline declarado es `image-text-to-text`, pero la propia model card aclara que el contenedor no incluye torre de visión; se trata de una etiqueta heredada y probablemente incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible con precision; hibrida segun la model card: 64 capas con atencion lineal/completa en proporcion 4:1 y tensores SSM (`ssm_out`, `ssm_alpha`, `ssm_beta`) |
| Parametros totales | 27B (segun denominacion del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria `PQ2_0` (402 tensores) y `PTQ1_0`; `F32` (353), `BF16` (96, reservados para `ssm_alpha`/`ssm_beta`); contenedor en representacion `t2_g128_fp16`; el GGUF de origen usaba `Q3_K`/`Q2_K` en tensores ablacionados |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (el modelo ternario de origen tiene su propia licencia, no detallada) |
| Formato de pesos | `.ninfer` (contenedor de fichero unico); origen en GGUF f16 y GGUF `PQ2_0` |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento en la documentacion proporcionada (numero de tokens, composicion del dataset, fases de RLHF o DPO): no disponible. Lo que si detalla la model card es la estructura de inferencia: torre de texto de 64 capas con una mezcla 4:1 de atencion lineal y atencion completa, mas capas de espacio de estados cuyos parametros de control (`ssm_alpha`, `ssm_beta`) se mantienen en BF16 porque el runtime exige precision completa. El contenedor incluye torre de texto, cabecera de propuesta (proposal head, presumiblemente para decodificacion especulativa), tokenizador, plantilla de chat y configuracion de generacion. No incluye cabecera MTP ni torre de vision.

La innovacion tecnica relevante es la cuantizacion ternaria con rotacion de Hadamard (Sylvester–Walsh normalizada) de PrismML, que permite representar los pesos en valores ternarios empaquetados tras una transformacion ortogonal que reduce el error de cuantizacion. El proceso de este repositorio es puramente de conversion: parte del release en f16 del modelo abliterado (que conserva el empaquetado ternario y los metadatos Hadamard), lo recuantiza con el cuantizador de PrismML mediante `llama-quantize` y lo valida en el contenedor NInfer. El motivo del reempaquetado es que el GGUF `PQ2_0` publicado por huihui-ai habia perdido la codificacion ternaria en 54 tensores (31 `ffn_down.weight` y 23 `ssm_out.weight`, degradados a `Q3_K`/`Q2_K`) al tener que desquantizarlos para ablacionarlos.

## Capacidades

- Generacion de texto y conversacion multilingue en ingles y chino.
- Razonamiento de proposito general y matematicas (capacidades heredadas de Qwen3.8-27B; sin cifras publicadas en este repositorio).
- Generacion de codigo (heredada del modelo base; no verificada en esta ficha).
- Inferencia local en GPUs de gama de consumo gracias a la representacion ternaria.
- Salida sin censura efectiva: la abliteracion de las capas 22–52 elimina buena parte de los rechazos de seguridad.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentacion).
- Comportamiento agentico y razonamiento multi-paso: no disponible.
- Vision: no disponible. El pipeline declarado es `image-text-to-text`, pero la model card afirma explicitamente que no hay torre de vision.
- Modo "thinking" o decodificacion especulativa explicita: la presencia de una proposal head en el contenedor sugiere decodificacion especulativa, pero no se documenta su funcionamiento.

## Casos de uso

- Inferencia local en equipos de gama media: el contenedor de 6,87 GiB permite ejecutar un modelo de 27B en GPUs con 8–16 GB de VRAM, un escenario inviable con pesos en fp16 (que rondarian los 54 GB).
- Investigacion sobre cuantizacion ternaria: sirve como artefacto de referencia para estudiar el impacto de `PQ2_0` y de la rotacion Hadamard en la calidad de salida frente a cuantizaciones de 4 y 8 bits.
- Analisis de seguridad y red-teaming: al estar ablacionado, es util para estudiar como se comporta un modelo sin alineamiento de rechazo y para evaluar mecanismos de filtrado externos.
- Evaluacion comparativa de motores de inferencia: permite medir el rendimiento del motor NInfer frente a llama.cpp, vLLM u Ollama con el mismo modelo de origen en distintos formatos.
- Experimentacion con arquitecturas hibridas atencion/SSM: al combinar atencion lineal y completa con capas de estado, es un banco de pruebas para estudiar coste de memoria de la cache KV en contextos largos.
- Generacion de texto en ingles y chino en entornos controlados de investigacion, sin exposicion a usuarios finales.
- Desarrollo y depuracion de la cadena de conversion GGUF a `.ninfer`, incluyendo la validacion de recuantizacion de tensores ablacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni tampoco comparaciones numericas con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7 GB solo para los pesos (contenedor de 6,87 GiB) mas la cache KV y el overhead del runtime. La cifra final depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: el repositorio de conversion asociado apunta a equipos con 16 GB de VRAM (nombra explicitamente RTX 5070 Ti, 5080 y 5090). Una RTX 4090 (24 GB) o una A100/H100 son sobradas para los pesos, aunque el motor NInfer esta orientado a inferencia local en GPU de consumo.
- Cabe en GPU de consumo: si, es el objetivo del diseno. Con 12–16 GB hay margen holgado; con 8 GB es factible para los pesos pero el contexto disponible quedara muy limitado.
- Opciones de despliegue: el formato `.ninfer` exige una compilacion del motor NInfer que lea la representacion ternaria `t2_g128_fp16` con la rotacion Hadamard de PrismML. No es compatible con llama.cpp, vLLM, TGI ni Ollama. Para esos motores habria que partir del GGUF original de huihui-ai o de PrismML.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Este repositorio (fyb1214) | 27B | Ternaria `PQ2_0` / `PTQ1_0` | no disponible | apache-2.0 | `.ninfer`, motor NInfer |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | GGUF mixta (`PQ2_0` con 54 tensores en `Q3_K`/`Q2_K`), f16 | no disponible | apache-2.0 | GGUF, llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | Ternaria `PQ2_0` completa | no disponible | no disponible | GGUF, llama.cpp |
| Qwen/Qwen3.8-27B | 27B | fp16 / bf16 originales | no disponible | apache-2.0 | safetensors, transformers |

La diferencia funcional entre las tres variantes de 27B es el nivel de cuantizacion y el motor de ejecucion, no la arquitectura. El modelo de PrismML conserva el alineamiento de seguridad; el de huihui-ai y este repositorio no lo conservan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de Qwen3.8-27B, cabe esperar los sesgos del corpus de entrenamiento original, pero no hay analisis publicado en este repositorio.
- Riesgo de alucinacion: no cuantificado. La cuantizacion ternaria a ~2 bits puede degradar la fidelidad de las respuestas frente al modelo en fp16; no se aportan mediciones de esta perdida.
- Seguridad: el filtrado de seguridad esta "significativamente reducido" segun la propia model card. Las salidas pueden ser sensibles, controvertidas o inapropiadas. No es apto para entornos de cara al publico, para uso por menores ni para aplicaciones que requieran alta seguridad.
- Uso previsto: exclusivamente investigacion, pruebas y entornos controlados. No validado para produccion ni para sistemas criticos de seguridad.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto: no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Restricciones de licencia: el repositorio declara apache-2.0, pero el modelo ternario de origen y el GGUF de PrismML tienen su propia licencia, que la model card remite sin detallar. Es necesario revisarla antes de cualquier uso comercial.
- Compatibilidad: el artefacto solo funciona con el dialecto ternario del motor NInfer. No es intercambiable con los artefactos `gguf_blocks_v1` ni con otros motores, y requiere un parche en el converter para aceptar el empaquetado `PTQ1_0`.
- La etiqueta de pipeline `image-text-to-text` es enganosa: no hay torre de vision en el contenedor.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin comunidad ni validacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fyb1214/Huihui-Qwen3.8-27B-Abliterated-Ternary-Bonsai-NInfer
- Modelo base abliterado (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo ternario de origen (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de recetas de conversion (Ryan-gsq): https://github.com/Ryan-gsq/ninfer-16g-5070ti-5080-5090-qwen3.8-27b-gsq-rco
- Repositorio del motor NInfer (fork base): https://github.com/iamwavecut/ninfer-all
- Listado de modelos ternarios en HuggingFace: https://huggingface.co/models?other=ternary
- README en chino: https://huggingface.co/fyb1214/Huihui-Qwen3.8-27B-Abliterated-Ternary-Bonsai-NInfer/blob/main/README_zh.md
- Digests SHA-256: https://huggingface.co/fyb1214/Huihui-Qwen3.8-27B-Abliterated-Ternary-Bonsai-NInfer/blob/main/SHA256SUMS
