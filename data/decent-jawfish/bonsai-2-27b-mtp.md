# decent-jawfish/bonsai-2-27b-mtp

## Resumen

Bonsai 2 27B + MTP es un derivado comunitario publicado por el usuario decent-jawfish sobre el modelo ternario prism-ml/Ternary-Bonsai-2-27B-gguf. Se trata de un transformer de 27.320.697.856 parametros (unos 27,3B) cuantizado en formato ternario de 2 bits (PQ2_0) al que se le ha injertado la cabeza de prediccion multi-token (MTP) del bloque final de Qwen3.8-27B, tomada de unsloth/Qwen3.8-27B-GGUF en su variante UD-Q2_K_XL. El objetivo es habilitar decodificacion especulativa nativa en llama.cpp mediante la opcion `--spec-type draft-mtp`.

El resultado declarado por el autor es un aumento de aproximadamente el 44% en la velocidad de decodificacion manteniendo la misma distribucion de salida, ya que la decodificacion especulativa verifica cada borrador contra el modelo objetivo y los pesos ternarios no se han tocado. Las mediciones reportadas son 41,9 tok/s sin MTP frente a 60,5 tok/s con `--spec-draft-n-max 2` y una tasa de aceptacion de 0,60.

Es relevante ahora porque demuestra que se puede acelerar un modelo de 27B en 2 bits en una GPU de 24 GB sin reentrenar el tronco ni alterar la calidad de la salida, a cambio de compilar una version parcheada de llama.cpp y de asumir un comportamiento irregular del throughput bajo concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con pesos ternarios y cabeza MTP injertada (bloque adicional `blk.64.*` + proyecciones `nextn`) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible en la model card; los ejemplos oficiales usan `-c 32768` y `-c 65536` |
| Tipos de cuantizacion | PQ2_0 (ternario de 2 bits) en el tronco; bloque MTP procedente de UD-Q2_K_XL |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria declarada: llama.cpp) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf |
| Origen del bloque MTP | unsloth/Qwen3.8-27B-GGUF `UD-Q2_K_XL` (cuantizado de Qwen/Qwen3.8-27B) |
| Tamano del repositorio | 7,6 GB |
| Descargas / likes | 2.695 / 12 |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el modelo es un injerto (graft) de pesos. Se copiaron de forma literal y sin rotar 15 tensores `blk.64.*` (un bloque transformer completo mas las proyecciones `nextn`) desde `unsloth/Qwen3.8-27B-GGUF` `UD-Q2_K_XL` dentro del GGUF de Bonsai, ajustando los metadatos `qwen35.block_count` a 65 y `qwen35.nextn_predict_layers` a 1. Los tensores base son identicos bit a bit al GGUF de origen; solo cambiaron metadatos y se anadieron 15 tensores. La herramienta de fusion es `graft_mtp.py`, incluida en el repositorio.

La justificacion tecnica del injerto se apoya en que los pesos de RMSNorm de Bonsai coinciden elemento a elemento con los de Qwen3.8 original (coseno > 0,99996 en `blk.0.attn_norm`, `blk.0.post_attention_norm` y `output_norm`). Dado que un escalado elemento a elemento no conmuta con una rotacion, el flujo residual permanece en la base original y `prism.hadamard.*` actua como ayuda de cuantizacion por matmul en linea, no como un cambio de base. Por ese motivo el bloque MTP estandar recibe exactamente las activaciones que espera. La unica pieza realmente latente es la tabla de embeddings (`token_embd.weight`), que PrismML almacena en dominio rotado ("Hadamard-latent") y exige aplicar la transformada inversa en cada lectura; el grafo de borrador MTP de llama.cpp upstream tiene su propio lookup de embeddings y la omite, de ahi el parche `0001-qwen35-mtp-hadamard-inverse.patch` de unas 8 lineas contra el tag `prism-b10685-7dffb15`.

La tasa de aceptacion medida es de 0,60, frente a 0,70 para la misma cabeza sobre Qwen3.8 sin cuantizar. El autor lo atribuye al coste esperado de una cabeza entrenada sobre estados ocultos FP16 que ahora redacta borradores para un tronco ternario.

## Capacidades

- Generacion de texto conversacional en formato GGUF, con plantilla de chat aplicada mediante `--jinja`.
- Dos modos de muestreo documentados: modo thinking (`temperature=1.0, top_p=0.95, top_k=20, min_p=0.0`) y modo instruct (`temperature=0.7, top_p=0.80, top_k=20, presence_penalty=1.5`).
- Decodificacion especulativa mediante cabeza MTP con `--spec-type draft-mtp`, con verificacion contra el modelo objetivo (distribucion de salida inalterada).
- Servicio concurrente con multiples slots (`-np`), con soporte de contexto largo (`-c 65536` en las pruebas de concurrencia).
- No se documentan en la model card capacidades de tool calling, function calling, agentes, vision, audio ni una lista de idiomas soportados. Cualquier capacidad heredada del modelo base Qwen3.8-27B no esta verificada en la informacion disponible.

## Casos de uso

- Servicio de chat en una sola GPU de 24 GB: el modelo cabe con `-ngl 99 -c 32768` en una porcion MIG de 24 GB, lo que permite desplegar un asistente conversacional de 27B en 2 bits con un coste de VRAM reducido.
- Aceleracion de inferencia interactiva: con `--spec-draft-n-max 2` se pasa de 41,9 a 60,5 tok/s en decodificacion de un solo flujo, adecuado para asistentes donde la latencia percibida importa mas que el throughput agregado.
- Generacion por lotes con concurrencia moderada: las mediciones del autor muestran ganancias agregadas del 31-32% con 4 y 8 flujos concurrentes, util para pipelines de resumen o clasificacion por lotes servidos con llama-server.
- Investigacion en decodificacion especulativa: el repositorio incluye el script de fusion y un parche reproducible, por lo que sirve como banco de pruebas para estudiar tasas de aceptacion de cabezas MTP sobre troncos cuantizados de forma agresiva.
- Prototipado local en estaciones de trabajo: al ocupar unos 7,6 GB de pesos, permite experimentar con un modelo de 27B en hardware de gama alta de consumo, siempre que se ajuste `-np` para no agotar VRAM.
- Evaluacion comparativa de cuantizacion ternaria: util para medir el impacto de PQ2_0 frente a FP16 en tareas de razonamiento, dado que la model card ofrece datos de aceptacion pero no de calidad.
- Tareas de razonamiento con modo thinking: el muestreo documentado para thinking (`temperature=1.0, top_p=0.95`) esta pensado para cadenas de razonamiento largas en contextos de hasta 32K-64K tokens.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Los unicos datos son de throughput y aceptacion, medidos con llama.cpp en una porcion MIG 1g.24gb de una NVIDIA RTX PRO 6000 Blackwell (24 GB), driver 580.126.20, `--parallel 1`, 400 tokens generados, 5 prompts, mediana.

| Configuracion | tok/s | Tasa de aceptacion |
|---|---:|---:|
| Bonsai 2 27B PQ2_0, sin MTP | 41,9 | — |
| Este modelo, `--spec-draft-n-max 2` | 60,5 | 0,60 |
| Este modelo, `--spec-draft-n-max 3` | 58,9 | 0,49 |
| Este modelo, `--spec-draft-n-max 4` | 55,4 | 0,42 |

Rendimiento agregado bajo concurrencia (ambas configuraciones con `-c 65536 -np 4`):

| Flujos concurrentes | tok/s agregados sin MTP | tok/s agregados con MTP | Diferencia |
|---:|---:|---:|---:|
| 1 | 37,6 | 57,8 | +54% |
| 2 | 60,4 | 56,1 | -7% |
| 3 | — | 99,2 | — |
| 4 | 88,4 | 115,5 | +31% |
| 8 | 85,1 | 111,9 | +32% |

El autor senala una caida reproducible en exactamente 2 flujos concurrentes (29 tok/s por peticion, confirmado en cuatro ejecuciones), donde MTP queda un 7% por detras de la variante sin MTP. En el resto de escenarios MTP lidera con margen. En cuanto al techo absoluto, la version sin MTP alcanza `-np 32` con un pico de ~186 tok/s agregados, mientras que este modelo agota la VRAM a partir de `-np 16` y alcanza ~175 tok/s: la variante sin MTP gana ese techo absoluto por un ~7%.

## Requisitos de hardware

- VRAM: los pesos ocupan aproximadamente 7,6 GB en PQ2_0. A eso hay que sumar la cache KV y el contexto del borrador MTP, que consume VRAM adicional.
- GPU validada: NVIDIA RTX PRO 6000 Blackwell en una porcion MIG 1g.24gb (24 GB, driver 580.126.20). El autor indica que en una GPU completa los valores absolutos seran mayores y que la ratio de mejora es lo extrapolable.
- Concurrencia maxima observada en 24 GB: `-np 16` con MTP frente a `-np 32` sin MTP; la variante con MTP provoca OOM por encima de 16 slots.
- GPU de consumo: por el tamano de pesos, el modelo deberia caber en tarjetas con 12-16 GB o mas, pero no hay mediciones publicadas en esas tarjetas y habria que reducir `-c` y `-np`. Es una estimacion derivada del tamano del repositorio, no un dato verificado.
- Despliegue: llama.cpp / `llama-server`. El modo MTP requiere compilar la version parcheada de PrismML-Eng/llama.cpp en el tag `prism-b10685-7dffb15` mas el parche del repositorio. Con binarios estandar el modelo carga y ejecuta, pero `--spec-type draft-mtp` falla al arrancar.
- Compilacion de referencia: `cmake -B build -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=<arch> -DLLAMA_CURL=OFF`, solo target `llama-server` y una unica arquitectura CUDA, unos 150 s en 16 nucleos.
- Comando de ejecucion documentado: `llama-server -m Bonsai-2-27B-PQ2_0-MTP.gguf -ngl 99 -fa on -c 32768 --jinja --spec-type draft-mtp --spec-draft-n-max 2`.
- Throughput y latencia: 60,5 tok/s en decodificacion monoflujo frente a 41,9 tok/s sin MTP en la GPU de referencia; el autor recomienda barrer `--spec-draft-n-max` para cada tarjeta porque valores mayores redactan mas profundo pero reducen la aceptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | MTP / decodificacion especulativa | Licencia | Notas |
|---|---|---|---|---|---|
| decent-jawfish/bonsai-2-27b-mtp | 27,3B | PQ2_0 (ternario 2 bits) | Si, cabeza de Qwen3.8-27B, aceptacion 0,60 | Apache-2.0 | Requiere llama.cpp parcheado; 7,6 GB |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27,3B | PQ2_0 | No | Apache-2.0 | Modelo base; 41,9 tok/s y techo agregado de ~186 tok/s |
| unsloth/Qwen3.8-27B-GGUF (`UD-Q2_K_XL`) | 27B aprox. | 2 bits tipo K | Cabeza MTP incluida en el GGUF | Apache-2.0 | Fuente del bloque injertado; aceptacion de 0,70 en su tronco nativo |
| Qwen/Qwen3.8-27B | 27B aprox. | FP16 / BF16 | Cabeza MTP nativa | Apache-2.0 | Modelo original sin cuantizar; referencia de calidad y de aceptacion |

No se dispone de datos de benchmarks de calidad para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, cuantizacion, licencia y rendimiento de inferencia reportado.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado para usar `--spec-type draft-mtp`. Con binarios estandar, el arranque del contexto del borrador falla con el error `Hadamard-latent table 'token_embd.weight' is read without the inverse transform`.
- El modelo base esta cuantizado en ternario de 2 bits (PQ2_0), lo que implica una perdida de calidad frente a los pesos FP16 o BF16 de Qwen3.8-27B que la model card no cuantifica.
- La tasa de aceptacion baja de 0,70 (misma cabeza sobre Qwen3.8 sin cuantizar) a 0,60 sobre el tronco ternario, lo que reduce la ganancia teorica de la decodificacion especulativa.
- Caida de rendimiento reproducible y confirmada en exactamente 2 flujos concurrentes: MTP queda un 7% por detras de la variante sin MTP. Si la carga de trabajo se situa en ese punto, conviene medir antes de adoptarlo.
- El contexto del borrador MTP consume VRAM adicional, lo que reduce la concurrencia maxima en tarjetas de 24 GB (`-np 16` frente a `-np 32`) y hace que el techo absoluto de throughput agregado sea un ~7% inferior al de la variante sin MTP.
- No se especifican idiomas soportados ni capacidades de tool calling, agentes o vision. No se debe asumir que hereda las capacidades del modelo base sin verificarlas.
- La model card aparece truncada en la seccion de limitaciones ("Needs the patch"), por lo que podria haber advertencias adicionales del autor no recogidas aqui.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de sesgos para este derivado. Al tratarse de una cuantizacion agresiva de un modelo base de 27B, es esperable un incremento del riesgo respecto al original, aunque no hay mediciones.
- Licencia Apache-2.0 en todos los componentes (tronco, cabeza MTP, runtime MIT), lo que permite uso comercial, pero el autor declara no estar afiliado ni respaldado por PrismML ni por el equipo de Qwen.
- El modelo esta pensado para inferencia GGUF en llama.cpp; no se ofrecen pesos en safetensors ni soporte garantizado en otros motores de inferencia, especialmente para el modo MTP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fuente de la cabeza MTP: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime parcheado: https://github.com/PrismML-Eng/llama.cpp (tag `prism-b10685-7dffb15`, licencia MIT)
- Receta MTP de referencia: https://github.com/sudoingX/qwen38-mtp
- Archivos incluidos en el repositorio: `0001-qwen35-mtp-hadamard-inverse.patch` y `graft_mtp.py`
