# OnlyTextLLMs/Qwen3.5-0.8B-OnlyText-GGUF

## Resumen

OnlyTextLLMs/Qwen3.5-0.8B-OnlyText-GGUF es una distribucion en formato GGUF del modelo Qwen3.5-0.8B-OnlyText, derivado del Qwen/Qwen3.5-0.8B publicado por el equipo Qwen. El repositorio lo mantiene el usuario OnlyTextLLMs y su aportacion es doble: elimina las modalidades de vision y audio del modelo base (deja unicamente texto) y publica versiones cuantizadas en GGUF con la cabeza de borrador MTP (multi-token prediction) embebida dentro del propio fichero, sin necesidad de un fichero draft separado.

El modelo tiene 772.827.456 parametros reales segun los safetensors del modelo base, 24 capas, dimension oculta 1024 y un vocabulario de 248.302 entradas. Se distribuye en tres cuantizaciones (Q4_K_M, Q6_K y Q8_0) con tamanos de 0,5 GB, 0,6 GB y 0,8 GB respectivamente, lo que lo situa en la categoria de modelos ultraligeros aptos para hardware de consumo e incluso para equipos con memoria unificada.

Su relevancia practica esta en la combinacion de tamano minimo y decodificacion especulativa integrada: al incluir los tensores MTP (`nextn_predict_layers = 1`), llama.cpp puede acelerar la generacion entre un 3 % y un 9 % segun la cuantizacion sin coste adicional de memoria en disco ni ficheros auxiliares. No hay reentrenamiento: los pesos son un derivado sin modificar, solo se recortan modalidades y se cuantiza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3_5ForCausalLM`, arquitectura GGUF `qwen35`), 24 capas, hidden size 1024, vocabulario 248.302 |
| Parametros totales | 772.827.456 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los ejemplos del autor configuran `-c 32768` con `-fa on` en llama.cpp |
| Tipos de cuantizacion | Q4_K_M (0,5 GB), Q6_K (0,6 GB), Q8_0 (0,8 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); cuantizaciones generadas con `llama-quantize` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de 24 capas con dimension oculta 1024, implementado en llama.cpp bajo el identificador `qwen35` y en HuggingFace como `Qwen3_5ForCausalLM`. El tokenizador se ha reducido a texto: conserva 15 tokens especiales en los identificadores 248044-248058, con EOS en 248046 (`<|im_end|>`), y se han eliminado los tokens de vision y audio del modelo base. No hay entrenamiento adicional ni ajuste fino: el repositorio es una conversion directa de los pesos originales de Qwen/Qwen3.5-0.8B, por lo que no se ha aplicado RLHF, DPO ni ninguna otra fase de alineamiento posterior en este derivado.

La innovacion tecnica destacable es la inclusion de la cabeza de borrador MTP dentro del propio fichero GGUF. El conversor (`convert_hf_to_gguf.py`, llama.cpp `f280b26983ad`) incluye por defecto los tensores de prediccion multi-token (`nextn_predict_layers = 1`), de modo que la decodificacion especulativa queda disponible con `--spec-type draft-mtp` sin fichero draft externo. El autor reporta que el mejor numero de tokens de borrador depende del hardware: 2 en una Radeon AI PRO R9700 y 4 en Ryzen AI Max / Strix Halo. Se requiere una compilacion de llama.cpp del 16 de mayo de 2026 o posterior (commit `4f13cb7`+). Ademas, la plantilla de chat mantiene el modo de razonamiento activado por defecto (`reasoning_effort: xhigh`), de modo que el modelo razona antes de responder salvo que se desactive explicitamente.

## Capacidades

- Generacion de texto conversacional de un solo turno o multi-turno, con plantilla de chat de Qwen.
- Razonamiento explicito en modo thinking, activado por defecto con `reasoning_effort: xhigh`; se puede desactivar con `--reasoning off` (llama-cli) o `"chat_template_kwargs": {"enable_thinking": false}` en la API.
- Decodificacion especulativa mediante MTP embebido (`--spec-type draft-mtp`), con incrementos medidos de generacion de entre el 3 % y el 9 %.
- Compatible con endpoints OpenAI mediante `llama-server` (etiqueta `endpoints_compatible`).
- Capacidades multilingues: el repositorio solo declara ingles; no hay soporte declarado de otros idiomas.
- Sin vision ni audio: los tokens de ambas modalidades se han eliminado deliberadamente.
- Soporte de tool calling / function calling y de agentes multi-paso: no documentado en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local de bajos recursos: con 0,5 GB en Q4_K_M, el modelo se puede ejecutar en portatiles y mini-PC sin GPU dedicada, sirviendo respuestas en ingles con el modo thinking desactivado para reducir latencia.
- Generacion de texto en el borde (edge computing): integrable en aplicaciones de escritorio o moviles con llama.cpp, al no requerir fichero draft separado para la decodificacion especulativa.
- Prototipado rapido de pipelines de IA generativa: el arranque de `llama-server` con `-c 32768 -fa on` permite validar plantillas de chat, prompts de sistema y flujos de razonamiento antes de escalar a modelos mayores.
- Clasificacion y resumen de textos en ingles: tareas de extraccion o etiquetado por lotes donde el coste por token es mas relevante que la calidad punta, aprovechando el prefill de 12.232 t/s en Q4_K_M.
- Evaluacion comparativa de tecnicas de inferencia: la cabeza MTP embebida permite medir la ganancia real de la decodificacion especulativa por cuantizacion y por hardware (los datos del autor muestran +4 %, +9 % y +3 % en Q4_K_M, Q6_K y Q8_0 respectivamente).
- Servicio OpenAI-compatible en un solo dispositivo: `llama-server` expone una API compatible con clientes existentes, util para entornos de desarrollo interno o demos donde no se quiere depender de un proveedor externo.
- Investigacion sobre derivados solo-texto: sirve como caso de estudio de recorte de modalidades en modelos multimodales y de su efecto en el tokenizador y en el rendimiento.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos el 22 de septiembre de 2026 en una unica AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con llama.cpp `f280b26983ad` (build HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`). Baseline con `llama-bench` PP512 y TG128/256; MTP con `llama-cli` en chat de un solo turno, thinking desactivado, 256 tokens generados, condiciones de mediana, `-np 1`.

| Cuantizacion | Dispositivo | Prefill t/s (PP512) | Generacion t/s sin MTP | Generacion t/s con MTP | Delta MTP |
|---|---|---|---|---|---|
| Q4_K_M | una R9700 | 12232 | 194,2 | 202,9 (MTP n=2) | +4 % |
| Q6_K | una R9700 | 10079 | 178,2 | 194,7 (MTP n=4) | +9 % |
| Q8_0 | una R9700 | 13471 | 199,7 | 205,9 (MTP n=3) | +3 % |

Perplejidad en wikitext-2 (una sola GPU):

| Cuantizacion | PPL |
|---|---|
| Q4_K_M | 16,2403 |
| Q6_K | 16,226 |
| Q8_0 | 15,8671 |

El propio autor indica que no cita referencias publicadas para este tamano: las cifras anteriores son suyas. No hay resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar en la informacion disponible.

## Requisitos de hardware

- Pesos en disco y en memoria: 0,5 GB (Q4_K_M), 0,6 GB (Q6_K) y 0,8 GB (Q8_0). A ello hay que sumar la cache KV, cuyo tamano no se detalla en la informacion proporcionada para la ventana de 32.768 tokens empleada en los ejemplos.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con mas de 1-2 GB de VRAM libre puede alojar los pesos; el autor no publica un minimo oficial.
- GPU medidas por el autor: AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con build HIP/ROCm 7.14. Tambien menciona Ryzen AI Max / Strix Halo, donde el numero optimo de tokens de borrador MTP es 4.
- Multi-GPU: soportado; el autor recomienda no fijar las variables `*_VISIBLE_DEVICES` para que llama.cpp reparta capas automaticamente (`--split-mode layer` es el valor por defecto).
- Opciones de despliegue: `llama-server` (API compatible con OpenAI) y `llama-cli`, ambas con llama.cpp del 16 de mayo de 2026 o posterior (commit `4f13cb7`+) para disponer de MTP. vLLM, Ollama y TGI no se mencionan en la informacion disponible.
- Rendimiento y latencia: en la R9700 se miden entre 178,2 y 205,9 tokens/s de generacion y entre 10.079 y 13.471 tokens/s de prefill. De forma derivada, 512 tokens de prefill tardarian aproximadamente entre 0,038 s (Q8_0) y 0,051 s (Q6_K), y cada token generado entre 4,9 ms y 5,6 ms sin MTP.
- Modo thinking: al estar activado por defecto, la latencia percibida puede aumentar de forma notable en respuestas largas si no se desactiva.

## Comparativa con modelos similares

La informacion disponible no incluye benchmarks de terceros para modelos de tamano comparable, por lo que la comparacion se limita a las variantes del mismo linaje.

| Modelo | Parametros | Contexto | Formato | Idiomas | Licencia |
|---|---|---|---|---|---|
| OnlyTextLLMs/Qwen3.5-0.8B-OnlyText-GGUF (este repo) | 772,8 M | No disponible (ejemplos con 32768) | GGUF, MTP embebido | Ingles | Apache-2.0 |
| OnlyTextLLMs/Qwen3.5-0.8B-OnlyText | 772,8 M | No disponible | No especificado (derivado solo-texto) | Ingles | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (modelo base) | 772,8 M | No disponible | Safetensors y otros | No disponible; incluye vision y audio | Apache-2.0 |

No se dispone de datos de parametros, contexto, rendimiento ni licencia de otras alternativas de la misma categoria (por ejemplo, modelos densos de 0,5-1 B de otros fabricantes) en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles; no hay evidencia de calidad en castellano ni en otros idiomas.
- Tamano reducido: con 772,8 M de parametros y una perplejidad de 15,87-16,24 en wikitext-2, cabe esperar una tasa de alucinacion alta y menor fidelidad en razonamiento complejo que en modelos mayores; no se documentan evaluaciones de fiabilidad.
- Modo thinking por defecto: la plantilla activa el razonamiento extenso (`reasoning_effort: xhigh`), lo que incrementa el consumo de tokens y la latencia si el usuario no lo desactiva explicitamente.
- Dependencia de version: la decodificacion especulativa MTP exige llama.cpp del 16 de mayo de 2026 o posterior (commit `4f13cb7`+); en versiones anteriores los tensores MTP embebidos no se aprovechan.
- Tokenizador recortado: los tokens de vision y audio se han eliminado y el vocabulario especial se reduce a 15 entradas (ids 248044-248058); prompts o plantillas que asuman las modalidades originales pueden fallar.
- Licencia: Apache-2.0 permite uso comercial, pero se mantiene la atribucion al equipo Qwen como autor de los pesos subyacentes; este repositorio no anade entrenamiento propio.
- Madurez del repositorio: creado el 22 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta, y sin benchmarks de terceros que validen las cifras del autor.
- Los datos de rendimiento proceden de una unica configuracion de hardware (Radeon AI PRO R9700) y no son extrapolables sin verificacion a otras GPU o a CPU.
- No se documentan capacidades de tool calling, agentes multi-paso ni evaluaciones de seguridad, sesgos o contenido danino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OnlyTextLLMs/Qwen3.5-0.8B-OnlyText-GGUF
- Derivado solo-texto sin cuantizar: https://huggingface.co/OnlyTextLLMs/Qwen3.5-0.8B-OnlyText
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion Qwen: https://huggingface.co/Qwen
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (herramienta de conversion, cuantizacion e inferencia referenciada en la model card): https://github.com/ggml-org/llama.cpp
