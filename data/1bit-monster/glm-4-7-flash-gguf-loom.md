# 1bit-MONSTER/GLM-4.7-Flash-GGUF-loom

## Resumen

GLM-4.7-Flash-GGUF-loom es un paquete de distribucion de programas Loom (kernels precompilados y metadatos de ejecucion) para servir el modelo GLM-4.7-Flash en formato GGUF cuantizado Q4_K_M sobre el runtime HRX en hardware AMD Strix Halo (gfx1151). Lo publica el usuario 1bit-MONSTER y no contiene pesos propios: el checkpoint se descarga desde `unsloth/GLM-4.7-Flash-GGUF` en una revision fijada (`0d32489...`) y se verifica por hash SHA-256 al instalar.

El modelo subyacente es un transformer MoE con atencion MLA (tipo `deepseek2`) de 64 expertos y 2,6B de parametros por experto, con una longitud de contexto nativa de 202.752 tokens. El artefacto esta pensado para `loom-serve` 0.3.0 y el preset de chat que acompana al paquete usa una ventana de 8.192 tokens.

Su relevancia es acotada pero concreta: es la unica fuente publica conocida de una ruta Loom funcional para GLM-4.7-Flash en Strix Halo, con 91 comandos y 521 kernels compilados sin errores y una comprobacion aritmetica registrada (`17 * 23 = 391`). No obstante, la fila de validacion de precision frente al arbitro de CPU aun no se ha publicado y la velocidad a traves de `1bit serve` no se ha medido, por lo que no debe considerarse listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (tipo `deepseek2`), 64 expertos x 2,6B |
| Parametros totales | no disponible (64 x 2,6B por experto, total no declarado) |
| Parametros activos | no disponible |
| Longitud de contexto | 202.752 tokens nativos; preset de chat a 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (unico incluido) |
| Idiomas soportados | no disponible |
| Licencia | MIT para programas y ficheros de la card; pesos y tokenizer bajo terminos de `zai-org/GLM-4.7-Flash` |
| Formato de pesos | GGUF (fichero `GLM-4.7-Flash-Q4_K_M.gguf`, 18.312.339.808 B) |

## Arquitectura y entrenamiento

El checkpoint base es un MoE con atencion multi-head latente (MLA), identificado en la card como `deepseek2`, con 64 expertos de 2,6B de parametros cada uno. Esta ficha no dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card original de `zai-org/GLM-4.7-Flash`, que no se ha proporcionado.

La innovacion tecnica del paquete no esta en el modelo sino en la capa de ejecucion: los programas Loom se compilan para el runtime HRX sobre el target strixhalo gfx1151, con un registro de 91 comandos y 521 kernels compilados sin errores. El fichero `model.json.lock` vincula los bytes del GGUF y los ficheros de la card, y `loom-fetch` verifica ambos hashes en la instalacion. La procedencia de los kernels queda registrada en `BUILD.json`, que apunta al commit del arbol privado de kernels y a los pasos de compilacion.

## Capacidades

- Generacion de texto y razonamiento conversacional a traves del preset de chat de `loom-serve`.
- Razonamiento aritmetico basico verificado: la consulta `What is 17 * 23?` devuelve `391` (registro engine#3221).
- Soporte de contexto largo: el modelo nativo admite 202.752 tokens, aunque el preset distribuido limita a 8.192.
- Ejecucion en GPU AMD via `--device=amdgpu://` con gestion de memoria elastica (`--pool_backing=elastic`).
- Capacidades de tool calling, agentes, vision, audio o thinking mode: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en equipos Strix Halo: el paquete permite levantar GLM-4.7-Flash en una APU AMD gfx1151 mediante `loom-serve` con una sola orden de `loom-fetch`, sin depender de CUDA ni de GPUs dedicadas.
- Evaluacion de la ruta Loom frente a llama.cpp: util para comparar precision y velocidad entre el port Loom y la ruta `1bit serve` por defecto, una vez se publique la fila de validacion.
- Pruebas de integracion de kernels: los 521 kernels compilados y el registro de 91 comandos sirven como banco de pruebas para validar el runtime HRX en hardware gfx1151.
- Reproducibilidad de artefactos: el pin de revision y los hashes SHA-256 permiten reconstruir exactamente el mismo binario en entornos de investigacion que exigen trazabilidad estricta.
- Asistente conversacional de contexto medio: con el preset de 8.192 tokens puede sostener conversaciones multi-turno en local, siempre que se acepte la ausencia de metricas de calidad publicadas.
- Experimentacion con modelos MoE de grano fino: los 64 expertos de 2,6B permiten estudiar patrones de enrutamiento y uso de memoria en un entorno de inferencia controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion registrada es cualitativa (respuesta correcta a `17 * 23`) y la velocidad a traves de `1bit serve` figura explicitamente como no medida. La fila de precision Loom frente al arbitro de CPU esta pendiente de publicacion (engine#3158).

## Requisitos de hardware

- Memoria: `--memory_bytes` >= ~28 GB con contexto de 8.192 tokens, desglosado en 17,1 GiB de pesos, 7,7 GiB de workspace y 0,8 GiB de pool KV.
- GPU: exclusivamente AMD Strix Halo (gfx1151) con el runtime HRX; no hay soporte declarado para NVIDIA ni para otras arquitecturas AMD.
- GPU de consumo: si, en APUs Strix Halo con al menos 28 GB de memoria asignable a la GPU.
- Despliegue: `loom-serve` 0.3.0 con `loom-fetch` para la descarga verificada; la ruta alternativa es `1bit serve` sobre llama.cpp.
- Latencia y throughput: no disponibles; no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-GGUF-loom | MoE 64 x 2,6B (total no declarado) | 202.752 nativo / 8.192 preset | GGUF Q4_K_M + programas Loom | MIT (programas) / terminos de zai-org (pesos) | Publico, 0 descargas |
| unsloth/GLM-4.7-Flash-GGUF | MoE 64 x 2,6B (total no declarado) | no disponible | GGUF | no disponible | Publico (modelo base) |
| zai-org/GLM-4.7-Flash | MoE 64 x 2,6B (total no declarado) | no disponible | no disponible | terminos de zai-org | Publico (checkpoint original) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La fila de validacion de precision frente al arbitro de CPU no esta publicada; el modelo no tiene entrada de ruta en `config/loom-routes.json` hasta que se publique (engine#3158).
- La velocidad de inferencia no se ha medido, por lo que no hay garantias de rendimiento en produccion.
- Dependencia de hardware muy especifica: solo AMD Strix Halo gfx1151 con HRX; no es portable a otras GPU sin recompilar los kernels.
- El preset distribuido limita el contexto a 8.192 tokens pese a los 202.752 nativos, lo que reduce drasticamente la ventana efectiva.
- El paquete no redistribuye pesos ni tokenizer: estos quedan bajo los terminos de `zai-org/GLM-4.7-Flash`, que pueden imponer restricciones adicionales al uso comercial mas alla del MIT de los programas.
- Riesgo de alucinacion y sesgos del modelo base: no disponible en la informacion proporcionada.
- Cobertura idiomatica no declarada; no se puede confirmar el soporte de castellano.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1bit-MONSTER/GLM-4.7-Flash-GGUF-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/GLM-4.7-Flash-GGUF
- Checkpoint original: https://huggingface.co/zai-org/GLM-4.7-Flash
- Referencias internas citadas en la card: engine#3158 (entrada de ruta), engine#3221 (registro de la prueba aritmetica)
