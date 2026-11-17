# Grawnch/Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120

## Resumen

Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120 es una cuantizacion extrema de un modelo MoE de gran escala publicado por el usuario Grawnch en Hugging Face. Se trata de una variante comprimida del modelo base Qwen3.8-Flash-Next, un transformer de mezcla de expertos de 180.000 millones de parametros con 48 capas (36 Gated-DeltaNet y 12 capas Sparse QSA), 512 expertos por capa y enrutamiento top-10 mas un experto compartido. El resultado se empaqueta en un contenedor nativo para GPUs Blackwell (SM120) con un peso medio de 2,4592 bits por parametro (bpw), lo que reduce el repositorio a 43,8 GB.

El interes tecnico de esta publicacion radica en el metodo de compresion: combina cuantizacion GPTQ con codebooks (`SWZ2_G64` para Gate/Up, `VQ4` para Down), spines SVD de rango 8 blanqueados, una permutacion de empaquetado de picos SwiGLU sobre 640 neuronas y destilacion co-guiada del experto compartido. Segun la model card, estas tecnicas reducen el error Hessiano medio de Gate/Up un 62,10% y el de Down-Proj un 10,06% respecto a la linea base, manteniendo exactamente la misma huella de 2,4592 bpw. Incluye ademas un drafter especulativo DFlash2 recalibrado y los 12 indexadores dispersos QSA Top-512.

Es relevante ahora porque demuestra que es posible llevar un MoE de 180B a un tamano manejable en hardware Blackwell de consumo o profesional con perdida de calidad controlada y medidas, algo critico para investigadores que quieren experimentar con modelos de frontera sin infraestructura de centro de datos. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados en la informacion disponible obliga a validar el rendimiento real antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 36 capas Gated-DeltaNet + 12 capas Sparse QSA |
| Parametros totales | 180B (modelo base Qwen3.8-Flash-Next) |
| Parametros activos | top-10 de 512 expertos por capa + 1 experto compartido (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,4592 bpw (SWZ2_G64 Gate/Up, VQ4 Down, spines SVD rango 8, SWZ8_G32 experto compartido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (contenedor nativo Blackwell SM120 Mode-1) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 48 capas que combina dos tipos de bloque: 36 capas Gated-DeltaNet (una variante de atencion lineal con estado recurrente) y 12 capas Sparse QSA con indexadores Top-512. Cada capa MoE contiene 512 expertos y activa los 10 mejores mas un experto compartido, lo que permite un ratio de activacion muy bajo respecto al total de 180B parametros. Esta publicacion no entrena el modelo desde cero, sino que aplica un pipeline de cuantizacion post-entrenamiento sobre los pesos del modelo base.

El proceso de compresion descrito en la model card incluye cuatro innovaciones principales. Primero, una reconstruccion incondicional de los spines SVD de rango 8 del profesor Mode-0 en las 48 capas antes de resolver la cuantizacion. Segundo, una permutacion de empaquetado de picos SwiGLU sobre 640 neuronas con calibracion de escala (EBSS) y GPTQ con codebooks de 8 entradas (`SWZ2_G64`), que alinea `gate_proj`, `up_proj` y `down_proj` en grupos de 64. Tercero, una pre-resta Top-24 Ky-Fan-8 y spines SVD de rango 8 blanqueados que reajustan los 1.152 spines de expertos, capturando el 38,54% de la energia residual tras VQ4. Cuarto, una destilacion co-guiada con ridge del experto compartido (`shexp_dn`, `SWZ8_G32`) que reduce el MSE de validacion retenido un 2,71% en las 48 capas. Se incluye un drafter especulativo DFlash2 (`SWZ4`) recalibrado contra los estados ocultos de WV-v5.1.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`).
- Razonamiento matematico y de competicion: la model card menciona parametros de muestreo ajustados especificamente para "long-horizon competitive programming and mathematical reasoning".
- Generacion de codigo, implicita en el ajuste de sampling para programacion competitiva.
- Decodificacion especulativa nativa mediante el drafter DFlash2 incluido, que acelera la inferencia.
- Indexacion dispersa Top-512 en las capas QSA, que permite atencion eficiente sobre contextos largos (longitud exacta no disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el ajuste para tareas de horizonte largo sugiere cierta capacidad, pero no se documenta.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar el impacto de 2,4592 bpw en un MoE de 180B, ya que la model card documenta metricas de error Hessiano por componente y permite comparar tecnicas (GPTQ con codebooks, spines SVD, destilacion del experto compartido).
- Despliegue en estaciones Blackwell: al estar empaquetado en formato SM120 Mode-1, encaja en flujos de inferencia sobre GPUs RTX 50xx o profesionales Blackwell, donde un modelo de 43,8 GB puede residir en VRAM unica.
- Generacion de codigo asistida en local: los parametros de muestreo recomendados (temperature 0,6, top_p 0,95, top_k 20) estan calibrados para programacion competitiva, lo que lo hace adecuado para asistentes de codigo en entornos sin conexion.
- Razonamiento matematico de horizonte largo: el ajuste de sampling compensa la varianza de logits acumulada en 48 capas, util para pipelines de resolucion de problemas paso a paso.
- Aceleracion con decodificacion especulativa: el drafter DFlash2 incluido permite integrar el modelo en servidores de inferencia que ya soportan speculative decoding para reducir latencia en generacion autoregresiva.
- Experimentacion con atencion lineal y dispersa: las 36 capas Gated-DeltaNet y 12 QSA con indexadores Top-512 lo convierten en un banco de pruebas para investigar mecanismos de atencion eficiente en modelos grandes.
- Fine-tuning ligero sobre hardware limitado: con 43,8 GB de pesos y licencia Apache 2.0, es viable para adaptaciones con LoRA o QLoRA en una sola GPU de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de error de cuantizacion (reduccion del 62,10% en error Hessiano de Gate/Up, 10,06% en Down-Proj, 2,71% en MSE de validacion del experto compartido), no resultados en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 44 GB solo para los pesos en safetensors; con overhead de activaciones y KV cache, se recomienda al menos 48-64 GB de VRAM para contextos moderados.
- GPU recomendadas: GPUs Blackwell con soporte SM120 (RTX 5090, RTX PRO 6000 Blackwell, B200). El formato SM120 Mode-1 no es compatible con arquitecturas anteriores sin conversion.
- Cabe en consumer GPU: si, en RTX 5090 (32 GB) no cabe por si solo; requiere al menos una GPU de 48 GB o configuracion multi-GPU. En RTX PRO 6000 Blackwell (96 GB) cabe con holgura.
- Opciones de despliegue: el formato safetensors SM120 requiere un runtime compatible con el contenedor nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible. Se menciona un GGUF companion de 3,5 bpw en otro repositorio del mismo autor para embeddings y PLE.
- Latencia y throughput: no disponibles. La inclusion del drafter DFlash2 sugiere que el autor busca mejorar throughput mediante decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120 | 180B MoE (top-10 de 512) | no disponible | 2,4592 bpw, SM120 | Apache 2.0 | safetensors, 43,8 GB |
| Qwen3.8-Flash-Next (base) | 180B MoE | no disponible | pesos completos | no disponible en la informacion | no disponible |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF | 180B MoE | no disponible | 3,5 bpw, GGUF | Apache 2.0 (segun repositorio del autor) | GGUF, shard-2 companion |
| Modelos MoE de ~180B comparables (p. ej. DeepSeek-V3, Qwen2.5-72B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Cuantizacion agresiva a 2,4592 bpw: aunque la model card reporta reducciones de error, la perdida de calidad acumulada en 48 capas puede afectar a tareas de razonamiento de horizonte largo; el propio autor recomienda parametros de muestreo especificos para compensar la varianza de logits.
- Sin benchmarks publicados: no hay evidencia independiente de rendimiento en MMLU, HumanEval, GSM8K u otras tareas, por lo que la calidad real es desconocida.
- Compatibilidad de hardware restringida: el formato SM120 Mode-1 esta disenado para GPUs Blackwell; no funcionara en A100, H100 ni RTX 40xx sin conversion, lo que limita su portabilidad.
- Dependencia de archivos companion: requiere el shard GGUF de 3,5 bpw del mismo autor para embeddings PLE y token embeddings, y metadatos de configuracion de `incoai/Qwen3.8-Flash-Next-DFlash2`; sin ellos el modelo puede no cargar correctamente.
- Idiomas no documentados: se desconoce el soporte multilingue real y el comportamiento en castellano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos MoE de gran escala tienden a alucinar en dominios especializados, y la cuantizacion extrema puede agravarlo.
- Sesgos: no documentados en la model card.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-Flash-Next puede tener terminos adicionales no reflejados en esta publicacion; conviene verificar la licencia del modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad, lo que aumenta el riesgo de errores no detectados en el empaquetado.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5.1-Sub2.5bpw-SM120
- Repositorio GGUF companion (mencionado en la model card): `Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF`
- Metadatos de configuracion DFlash2 (mencionado en la model card): `incoai/Qwen3.8-Flash-Next-DFlash2`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
