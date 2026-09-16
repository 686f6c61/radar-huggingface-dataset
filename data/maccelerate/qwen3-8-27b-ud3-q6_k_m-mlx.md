# maccelerate/Qwen3.8-27B-UD3-Q6_K_M-MLX

## Resumen

Qwen3.8-27B-UD3-Q6_K_M-MLX es una recuantización nativa en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario maccelerate. No se trata de un modelo entrenado desde cero, sino de una conversión: se lee la asignación de bits por tensor del checkpoint GGUF oficial de Unsloth (`Qwen3.8-27B-UD-Q6_K_M.gguf`, familia Unsloth Dynamic v3.0) y se recodifican los pesos bf16 limpios del modelo original al formato afín de MLX con la misma anchura por tensor. El resultado es un artefacto de 22,94 GB en disco, 27.320.697.856 parámetros (27,32B) y 6,716 bits efectivos por peso cuantizado.

La relevancia de esta ficha es acotada y muy específica: es un paquete pensado exclusivamente para inferencia en Apple Silicon mediante `mlx-serve`. Conserva la cabeza MTP (multi-token prediction) del modelo original para decodificación especulativa y omite deliberadamente la torre de visión, por lo que es un modelo estrictamente de texto. Su interés práctico está en ofrecer una asignación de precisión mixta heredada de Unsloth Dynamic v3.0 (201 tensores a 8 bits, 231 a 6 bits, 71 a 5 bits y 3 a 4 bits) dentro del ecosistema MLX, algo que no se consigue con las cuantizaciones uniformes habituales.

Hay dos advertencias importantes desde el primer minuto. La primera es que el propio autor indica que `mlx-lm` estándar (versión 0.31.3) puede cargar los ficheros pero genera salida corrupta, porque aplica dos veces la transformación de normas de Qwen3.8 al detectar la presencia de pesos MTP; el runtime soportado es `mlx-serve`. La segunda es que el repositorio tiene 0 descargas y 0 me gusta en el momento de redactar esta ficha, y no se ha publicado ningún resultado de benchmarks, por lo que la evaluación de calidad debe hacerse por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8 con bloques GDN (gated delta net) y estado SSM, mas cabeza MTP; vision omitida |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de precision mixta: 8 bits (201 tensores), 6 bits (231), 5 bits (71), 4 bits (3); 6,716 bits efectivos por peso. Norms, biases, pesos de convolucion y estado SSM permanecen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), 11 shards, 22,94 GB |
| Tamano del repositorio | 23,0 GB |
| Modelo base | Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Fuente de cuantizacion | unsloth/Qwen3.8-27B-GGUF, `Qwen3.8-27B-UD-Q6_K_M.gguf` (revision `4ca720788d1e01f1bff70c033e0d0028fd02e502`) |
| Libreria | mlx |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

Este checkpoint no implica entrenamiento alguno: es una re-codificacion de pesos. El autor parte del modelo bf16 oficial de Qwen y de la tabla de tipos ggml del GGUF de Unsloth para reproducir, tensor a tensor, la misma anchura de bits que el asignador dinamico de Unsloth habia elegido. Para los tensores de 4 y 8 bits la conversion usa la imatrix oficial en una busqueda ponderada por activaciones; para los de 5 y 6 bits se recurre a `mx.quantize`, porque la ruta de empaquetado ponderado de MLX no implementa salidas de 5 ni 6 bits. Los pesos se distribuyen en 506 tensores, con un desglose por clase que incluye 11,41B de parametros en las proyecciones gate y up del MLP (9,30 GB), 5,70B en la proyeccion down (4,70 GB), 2,52B en el QKV de entrada del bloque GDN (2,08 GB), 1,68B en las proyecciones de atencion Q/K/V/O (1,47 GB), 1,51B en la proyeccion de salida GDN (1,38 GB), 1,27B en la cabeza LM (1,35 GB), 1,27B en los embeddings de tokens (1,03 GB) y 0,37B en la cabeza MTP (0,31 GB).

La innovacion tecnica diferencial respecto a otras conversiones es la conservacion de la cabeza MTP, que habilita decodificacion especulativa en `mlx-serve`, y el respeto estricto de la asignacion por tensor del GGUF de origen. El autor es explicito en que no se trata de una conversion sin perdida ni de una paridad numerica con los codebooks K-quant o IQ de llama.cpp: lo que se conserva es la asignacion de anchuras, no los valores. La omision de la torre de vision es deliberada. Existe una limitacion de runtime documentada: `mlx-lm` 0.31.3 interpreta la presencia de pesos MTP como evidencia de que todas las normas del tronco requieren ajuste y aplica la transformacion de normas de Qwen3.8 una segunda vez, corrompiendo la salida greedy. El autor publica el hallazgo en el repositorio de `maccelerate`.

## Capacidades

- Generacion de texto y uso conversacional, segun la etiqueta `text-generation` y `conversational` del repositorio.
- Decodificacion especulativa mediante la cabeza MTP conservada (0,37B de parametros), siempre que el runtime la soporte. El perfil NAX MTP de anchura uniforme de `mlx-serve` no aplica a este paquete por ser de anchura mixta; se usa el perfil generico con los pesos MTP retenidos.
- Inferencia local en Apple Silicon a traves de `mlx-serve`.
- Capacidades heredadas del modelo base Qwen/Qwen3.8-27B: no se documentan en la informacion disponible, por lo que no se pueden afirmar tool calling, agentes, matemáticas, codigo ni capacidades multilingues concretas.
- Vision: no soportada. La torre de vision fue omitida deliberadamente en la conversion.
- Audio: no disponible.

## Casos de uso

- Despliegue de LLM local en Mac de gama alta para prototipado: un M4 Max con 64 GB de memoria unificada puede cargar el paquete de 22,94 GB y servirlo con `mlx-serve --model /ruta/al/modelo --kv-quant 8`, lo que permite trabajar sin conexion y sin coste por token.
- Servicio de generacion de texto autoalojado en una red interna: `mlx-serve` expone el modelo como endpoint, de modo que aplicaciones internas pueden consumirlo sin enviar datos a terceros.
- Asistencia de escritura y resumen de documentos en flujo de trabajo personal: el modelo es de tipo conversacional y de texto, adecuado para reescribir, resumir y transformar contenido que el usuario no quiere sacar de su maquina.
- Banco de pruebas de cuantizacion: al conservar la asignacion de Unsloth Dynamic v3.0, sirve para comparar en MLX el efecto de anchuras mixtas frente a cuantizaciones uniformes de 4 u 8 bits sobre el mismo modelo base.
- Evaluacion de decodificacion especulativa con MTP en Apple Silicon: permite medir la ganancia real de la cabeza MTP en un runtime que la soporta, frente a cargas que la descartan.
- Generacion de codigo en local para tareas de autocompletado o refactorizacion sobre un repositorio privado: se apoya en las capacidades del modelo base y en la ausencia de envio de codigo a servicios externos, aunque dichas capacidades no estan verificadas en la documentacion disponible.
- Experimentacion en investigacion sobre conversiones de formato: el paquete incluye un `manifest.json` con la revision de origen, la asignacion, la validacion estructural y los hashes de los shards, lo que facilita reproducir y auditar la build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y tampoco datos de latencia o throughput. El unico dato de rendimiento documentado es de huella de memoria: en la prueba de compatibilidad realizada por el autor, el modelo alcanzo un pico de 23,40 GB de footprint Metal durante la carga.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS. No hay soporte CUDA ni ruta de despliegue en GPU NVIDIA o AMD documentada para este paquete.
- Almacenamiento: al menos 23 GB de disco para los ficheros del modelo, mas espacio de trabajo durante la descarga.
- Memoria: la ejecucion de referencia uso un M4 Max con 64 GB de memoria unificada. El pico medido del modelo solo durante la carga fue de 23,40 GB, y hay que sumar cache KV, contexto y peticiones concurrentes. El autor recomienda comprobar la longitud de contexto y la concurrencia previstas antes de considerar valida una maquina con menos memoria; no se garantiza el funcionamiento en equipos de 32 GB.
- Cabe en GPU de consumo: no aplica, porque el paquete es de formato MLX y requiere memoria unificada de Apple Silicon.
- Opciones de despliegue: `mlx-serve` es el runtime soportado. `mlx-lm` 0.31.3 carga los ficheros pero produce salida corrupta y no esta soportado. Para llama.cpp habria que usar el GGUF de origen, no este artefacto.
- Configuracion de referencia: `mlx-serve --model /ruta/al/modelo --kv-quant 8`. El autor advierte que no es una garantia para cualquier longitud de contexto o carga de trabajo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| maccelerate/Qwen3.8-27B-UD3-Q6_K_M-MLX | 27,32B | no disponible | safetensors MLX, 22,94 GB | mlx-serve (mlx-lm no soportado) | Apache-2.0 | Anchura mixta 4/5/6/8 bits, MTP conservado, sin vision |
| unsloth/Qwen3.8-27B-GGUF (UD-Q6_K_M) | 27,32B (mismo modelo base) | no disponible | GGUF | llama.cpp y derivados | Apache-2.0 | Fuente directa de la asignacion por tensor; codebooks K-quant/IQ propios |
| Qwen/Qwen3.8-27B (bf16) | 27,32B | no disponible | safetensors bf16 | MLX, transformers, vLLM, TGI | Apache-2.0 | Precision completa; ocupa aproximadamente el doble en disco y memoria que este paquete |

No se dispone de datos de benchmarks ni de comparativas de rendimiento publicadas en la informacion proporcionada, por lo que no es posible comparar calidad entre estas opciones.

## Limitaciones y advertencias

- Compatibilidad de runtime restringida: `mlx-lm` 0.31.3 genera salida corrupta con este paquete por doble aplicacion de la transformacion de normas de Qwen3.8. Usar unicamente `mlx-serve`.
- No hay paridad numerica con el GGUF de origen ni con los codebooks K-quant o IQ de llama.cpp. Lo que se replica es la asignacion de anchuras por tensor, no los valores.
- Modelo solo de texto: la torre de vision fue omitida intencionalmente. No admite entrada de imagenes.
- Sesgos: no documentados en la informacion disponible; al ser una recuantizacion del modelo base, hereda los sesgos del modelo original, que tampoco se detallan.
- Riesgo de alulcinacion: no cuantificado ni evaluado en la documentacion disponible. La cuantizacion a 6,716 bits efectivos puede degradar la fidelidad respecto al bf16, pero no hay mediciones publicadas.
- Idiomas soportados: no disponibles. No se puede confirmar cobertura multilingue mas alla de lo que ofrezca el modelo base.
- Longitud de contexto: no disponible. El autor advierte explicitamente de que hay que verificar el contexto previsto antes de asumir que una maquina con menos memoria es adecuada.
- Adopcion y validacion de la comunidad: el repositorio presenta 0 descargas y 0 me gusta, sin evaluaciones independientes conocidas.
- Inconsistencia de etiquetado: el repositorio incluye la etiqueta `qwen3_5` ademas de `qwen3.8`, lo que puede inducir a confusion sobre la generacion real del modelo base.
- Hardware limitado: exige Apple Silicon con memoria unificada suficiente; no hay soporte CUDA documentado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar tambien los terminos del modelo base Qwen/Qwen3.8-27B y del GGUF de Unsloth, ya que la model card remite a las fichas originales para atribucion y condiciones.
- Reproducibilidad: la rebuild requiere la revision `58458a509866` del conversor `maccelerate`, el GGUF y el bf16 con las revisiones indicadas, y la imatrix de 10.248.192 tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maccelerate/Qwen3.8-27B-UD3-Q6_K_M-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen (Unsloth Dynamic v3.0): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime recomendado, mlx-serve: https://github.com/ddalcu/mlx-serve
- Conversor maccelerate: https://github.com/maccelerate-ai/maccelerate
- Instrucciones de build de referencia para Qwen3.8: https://github.com/maccelerate-ai/maccelerate#reference-build
- Hallazgo de incompatibilidad con mlx-lm: https://github.com/maccelerate-ai/maccelerate/blob/main/docs/qwen38-mlx-lm-compatibility.md
- Busqueda web: no se han encontrado resultados relevantes para este modelo; las busquedas devolvieron unicamente paginas de ayuda de YouTube sin relacion con el artefacto.
