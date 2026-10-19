# androidli/GLM-5.3-Flash-Uncensored-EXL3-3.0bpw-mcg-TensorFold

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización de comunidad del modelo GLM-5.3-Flash en su variante "uncensored" publicada por dealignai. El autor, androidli (github.com/greatyingzi), aplica una cuantización EXL3 de 3,0 bits por peso con codebook `mcg` sobre los expertos enrutados del bloque MoE, y deja el resto de tensores (atención, MLP denso, expertos compartidos, embeddings, cabeza de salida y torre de visión) en la precisión nativa del modelo origen. El resultado es un pack de 152 GB en 18 shards de safetensors, frente a los 175,7 GB de la cuantización oficial de 4 bpw.

El interés práctico es doble. Por un lado, reduce un 13,5 % el espacio ocupado y, según las mediciones del autor, aumenta el pool de KV cache hasta 3.891.200 tokens en una pareja de DGX Spark (GB10) con TP=2 sobre enlace CX7 directo. Por otro, mantiene la calidad dentro del ruido estadístico respecto a la variante de 4 bpw: 86,3 % en EvalPlus (HumanEval+ y MBPP+), 98,0 % en GSM8K y 98,2 % en HumanEval.

Es relevante ahora porque demuestra que se puede servir un MoE de gran tamaño con ventana de 1.048.576 tokens en hardware de memoria unificada de gama工作站, algo que hasta hace poco exigía clústeres de GPUs con HBM. Ahora bien, es un artefacto muy específico: requiere una build de TensorFold parcheada que acepte `bits: 3` en EXL3, y las cifras de contexto y KV dependen críticamente de la configuración de reserva de memoria del motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal con torre de visión; 288 expertos enrutados por capa según la model card |
| Parametros totales | 320B según una fuente externa (NanoGPT); no confirmado en la model card del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (`--context 1048576`); `--max-tokens 32768` en la configuración de referencia |
| Tipos de cuantizacion | EXL3 3,0 bpw, codebook `mcg`, `head_bits: 16`, ámbito `glm53_routed_experts_only`; tensores no enrutados en BF16 (repack desde FP8 preservando `weight_scale_inv`). No se publican GGUF, AWQ ni GPTQ en este repo |
| Idiomas soportados | no disponible |
| Licencia | MIT (© 2026 Z.AI Co., Ltd), heredada del modelo base |
| Formato de pesos | safetensors (18 shards + `model.safetensors.index.json`), 152.087.838.592 bytes ≈ 141,6 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-5.3-Flash, un transformer con mezcla de expertos que intercala capas con 288 expertos enrutados y expertos compartidos, además de un bloque de visión que permite entrada image-text-to-text. La model card de esta cuantización no documenta el proceso de entrenamiento original (número de tokens, composición del corpus, fases de RLHF o DPO), y tampoco lo hace la información disponible sobre el modelo base. Lo único verificable a nivel de arquitectura es la estructura de expertos y la existencia de una torre de visión, inferida esta última de que el autor la mantiene en precisión nativa y de que el comando de servicio incluye el flag `--vision`.

La innovación técnica de este repositorio está en el pipeline de cuantización, no en el modelo. El autor ejecuta exllamav3 v1.6.0 (`convert.py -b 3.0 -cb mcg -hb 16 -eb 16 -mb 16 -vb 16`) sobre el checkpoint FP8 y después reinyecta los tensores EXL3 de los expertos sobre los tensores no expertos del modelo origen mediante `tools/graft_experts_only.py`. Los tensores FP8 originales se reempaquetan a BF16 conservando sus escalas `weight_scale_inv`, de modo que la pérdida de precisión se concentra donde menos impacta (expertos enrutados, con 288 rutas alternativas por capa) y se preserva la precisión en atención, embeddings y cabeza. El `config.json` incluye la procedencia del injerto (`grafted_by`). No se documenta ninguna técnica de entrenamiento adicional, destilación ni calibración con datos propios más allá de la propia conversión.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo thinking, activable con el flag `--thinking` del motor de servicio.
- Generación de código: 98,2 % en HumanEval y 86,3 % en el agregado EvalPlus (HumanEval+ y MBPP+) medidos por el autor.
- Razonamiento matemático: 98,0 % en GSM8K con decodificación greedy sobre 250 problemas.
- Procesamiento de imagen: la torre de visión se conserva en precisión nativa y el comando de referencia habilita `--vision`, por lo que el modelo acepta entradas image-text-to-text.
- Contexto largo: ventana declarada de 1.048.576 tokens, aunque la recuperación tipo needle solo se ha verificado hasta ~64k tokens según el propio autor.
- Capacidades de agente y tool calling: el modelo base se comercializa como modelo para trabajo agéntico y uso de herramientas, pero esta cuantización no publica evaluaciones específicas de function calling.
- Multilingüismo: no hay lista de idiomas publicada; el modelo base es de Z.ai y presumiblemente cubre chino e inglés, pero no es un dato confirmado en la información disponible.
- Sin censura: la variante base es un fine-tune "uncensored" de dealignai, orientado a chat sin restricciones, escritura creativa y tareas que los modelos alineados rechazan.

## Casos de uso

- Servicio de chat de contexto largo en un par de DGX Spark: con 3.891.200 tokens de pool KV y ventana de 1.048.576, un único despliegue puede mantener 8 secuencias concurrentes (`--parallel 8`) con historiales de cientos de miles de tokens, útil para asistentes sobre repositorios o expedientes completos.
- Análisis de documentos extensos y multimodal: la combinación de torre de visión y contexto de un millón de tokens permite procesar informes escaneados, planos o capturas junto con su texto asociado en una sola pasada.
- Asistencia a la programación en local sin dependencia de la nube: el 98,2 % en HumanEval y el 86,3 % en EvalPlus indican un nivel suficiente para autocompletado, refactorización y generación de tests en un entorno on-premise con licencia MIT.
- Escritura creativa y role-play sin restricciones: al ser una variante uncensored, es adecuada para narrativa, guiones y contenido de ficción que los modelos alineados rechazan por defecto.
- Investigación sobre cuantización de MoE: el repositorio incluye `tools/` con los scripts de conversión, injerto y verificación, y `results/evalplus/` con los resultados crudos por tarea, lo que lo convierte en una referencia reproducible para estudiar el impacto de bajar de 4 a 3 bpw en expertos enrutados.
- Procesamiento batch de corpus largos: con 49,0 ms por forward pass en verificación de 8 filas, un pipeline de decodificación especulativa puede procesar documentos de gran tamaño por lotes en hardware de memoria unificada.
- Evaluación comparativa de motores de inferencia: sirve como banco de pruebas para medir TensorFold frente a vLLM (el repositorio de jayleaton reporta 1,8× más velocidad de decodificación en una configuración equivalente).

## Benchmarks y rendimiento

| Benchmark | Este pack 3,0 bpw (medido) | Mia-AiLab 4 bpw (auto-reportado) |
|---|---|---|
| EvalPlus: HumanEval+ y MBPP+ (542 problemas, thinking on) | 86,3 % (468/542) | 86,5 % (469/542) |
| GSM8K (250 problemas, greedy) | 98,0 % | 98,8 % |
| HumanEval (164 problemas, greedy) | 98,2 % | 95,7 % |

El autor señala que las tres diferencias están dentro del ruido: sus pruebas pareadas sobre los dos packs de 4 bpw de Mia muestran fluctuaciones de ±2–3 problemas con p entre 0,45 y 1,0. No se han publicado la divergencia KL frente al FP8 de origen ni la recuperación needle a 1M de tokens (solo probada hasta ~64k).

| Métrica de despliegue | Este pack 3,0 bpw | Mia-AiLab 4 bpw |
|---|---|---|
| Tamano del pack | 152 GB | 175,7 GB (−13,5 %) |
| Pool de KV (config. ajustada del autor) | 3.891.200 tokens | 2.582.528 tokens (+51 %) |
| Latencia por forward pass (filas de verificación 1 / 4 / 8) | 24,3 / 38,4 / 49,0 ms | 26,6 / 45,7 / 59,8 ms (≈ +15 % más rápido) |

Advertencia del propio autor: las cifras de pool KV no se midieron con la configuración que Mia declara en su model card. Con la misma reserva de memoria que Mia, este pack sirve 2.582.528 tokens (paridad); con la reserva ajustada (~26,5 GiB) llega a 3.891.200. A partir de la latencia de 24,3 ms se obtiene un techo teórico de ~41 tokens/s por secuencia en el caso de una sola fila de verificación, pero es una derivación, no un dato publicado de throughput agregado.

## Requisitos de hardware

- VRAM o memoria unificada: 152 GB solo para pesos, más el pool KV. El autor ejecuta con `--spill-gib 300`, lo que implica que parte del estado se derrama a memoria del sistema; el despliegue de referencia usa 2× NVIDIA DGX Spark (GB10) con memoria LPDDR5X unificada, una por rank en TP=2.
- GPU recomendadas: el caso validado es la pareja DGX Spark GB10 conectada por CX7 directo (10.0.0.1 / 10.0.0.2). Para un despliegue con HBM harían falta al menos 4× A100 80 GB o 4× H100 80 GB para dejar margen al KV cache, si bien no hay mediciones publicadas en esa configuración.
- GPU de consumo: no es viable. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar 152 GB de pesos; se necesitaría un clúster de 6–8 GPUs de consumo solo para los pesos, sin margen para KV.
- Motores de despliegue: TensorFold con soporte EXL3 de 3 bits en expertos (la build estándar solo acepta `bits: 4`, por lo que hay que aplicar los parches de `tools/`). El checkpoint se generó con exllamav3 v1.6.0. No hay soporte en llama.cpp, Ollama, TGI ni vLLM para este formato; vLLM aparece únicamente como referencia comparativa de rendimiento.
- Comando de referencia: `tensorfold serve <repo> --tp 2 --context 1048576 --parallel 8 --max-tokens 32768 --thinking --vision --spill-gib 300`.
- Latencia y arranque: 111 s de startup del motor medidos; 24,3 / 38,4 / 49,0 ms por forward pass según filas de verificación 1 / 4 / 8.
- Riesgo operativo: en máquinas GB10 de memoria unificada, una reserva de memoria demasiado pequeña provoca `NV_ERR_NO_MEMORY`, que según el autor puede tumbar la máquina completa; una reserva demasiado grande reduce el pool KV disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| androidli/GLM-5.3-Flash-Uncensored-EXL3-3.0bpw-mcg-TensorFold | 320B (no confirmado) | 1.048.576 | EXL3 3,0 bpw (expertos) + BF16 | EvalPlus 86,3 %, GSM8K 98,0 % | MIT | 0 descargas, 0 likes |
| Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold | 320B (no confirmado) | 1M declarado, 850k por defecto en su kit | EXL3 4 bpw | EvalPlus 86,5 %, GSM8K 98,8 % (auto-reportado) | no disponible en la información | Referencia de la comunidad, ampliamente citada |
| neko-legends/GLM-5.3-Flash-Uncensored-EXL3 | no disponible | no disponible | 4 bits, `shapleymcg` | no disponible | `shapleymcg-license-1` | 7 likes; despliegue en 4× DGX Spark TP4 |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 (base) | 320B (no confirmado) | no disponible | FP8 | Punto de referencia de precisión | MIT | Modelo origen de esta cuantización |
| zai-org/GLM-5.3-Flash (upstream) | 320B (no confirmado) | no disponible | BF16 original | no disponible | MIT | Modelo oficial de Z.ai, alineado |

La diferencia principal frente a la variante de Mia-AiLab es el tamaño (152 GB frente a 175,7 GB) y el pool KV en igualdad de reserva de memoria; la de neko-legends usa un codebook distinto y una licencia propia que no es MIT, lo que puede condicionar el uso comercial.

## Limitaciones y advertencias

- Modelo sin censura: la variante base de dealignai elimina las capas de alineación de seguridad. Puede producir contenido dañino, ilegal o sexual explícito sin aviso, y no es apto para aplicaciones de cara al público sin filtros propios.
- Sesgos: no hay ninguna evaluación de sesgo publicada en la información disponible, ni sobre el modelo base ni sobre esta cuantización.
- Alucinación: sin datos de evaluación de factualidad. La cuantización a 3 bits en expertos enrutados añade una fuente adicional de degradación no medida (no se ha calculado la divergencia KL frente al FP8).
- Contexto efectivo: la ventana es de 1.048.576 tokens, pero la recuperación de información a larga distancia solo se ha probado hasta ~64k. No hay garantía de rendimiento needle a 1M.
- Idiomas: no se publica lista de idiomas soportados; el comportamiento fuera de chino e inglés es desconocido.
- Licencia: MIT permite uso comercial, pero la model card atribuye el copyright a Z.AI Co., Ltd (2026) y el pack deriva de un fine-tune uncensored de terceros. Conviene revisar la cadena de licencias antes de explotarlo comercialmente.
- Dependencia de un motor parcheado: requiere una build de TensorFold con soporte de 3 bits EXL3 que no es la estándar; no hay soporte en llama.cpp, Ollama, vLLM ni TGI. Esto limita la portabilidad y complica el mantenimiento.
- Configuración frágil: las cifras de KV pool dependen de la reserva de memoria y del `--spill-gib`. El propio autor advierte de que una reserva mal ajustada puede provocar `NV_ERR_NO_MEMORY` y tumbar el nodo en GB10.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, un único autor, y métricas auto-medidas sin replicación independiente.
- Discrepancia de metadatos: HuggingFace reporta un tamaño de repositorio de 0,1 GB, mientras que la model card describe 152 GB en 18 shards. Conviene verificar el contenido real antes de descargar.
- No afiliado: el autor declara explícitamente no tener relación con dealignai ni con Z.ai.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/androidli/GLM-5.3-Flash-Uncensored-EXL3-3.0bpw-mcg-TensorFold
- Modelo base (FP8 uncensored): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo upstream oficial: https://huggingface.co/zai-org/GLM-5.3-Flash
- Comparativa de referencia (4 bpw de Mia-AiLab): https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold
- Perfil del autor: https://github.com/greatyingzi
- Cuantización alternativa de neko-legends: https://huggingface.co/neko-legends/GLM-5.3-Flash-Uncensored-EXL3
- Repositorio de despliegue en 2× DGX Spark: https://github.com/jayleaton/glm53-tensorfold-spark
- Despliegue en 4× DGX Spark con TensorFold TP4: https://github.com/Keenni/GLM-5.3-Flash-Uncensored-EXL3-4x-DGX-Sparks-TensorFold-TP4
- Ficha del modelo base en NanoGPT: https://nano-gpt.com/models/text/z-ai/glm-5.3-flash-uncensored
