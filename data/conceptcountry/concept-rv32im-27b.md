# ConceptCountry/concept-rv32im-27b

## Resumen

Concept RV32IM 27B es un modelo experimental publicado por ConceptCountry que integra un procesador RISC-V RV32IM completo dentro de los pesos de un transformer de 27.000 millones de parametros. Partiendo de Qwen Concept 27B (un modelo hibrido con atencion lineal y vision), el autor anade once capas adicionales al principio del modelo que implementan la maquina de forma exacta: 256 KB de ROM de codigo, 128 KB de rodata y 32 KB de RAM residen en el estado recurrente de Gated DeltaNet. El modelo anfitrion invoca el procesador mediante su propia sintaxis nativa de tool calling, sin que se ejecute ningun tool fuera de los pesos.

La propuesta es una demostracion de "weight-space computation": en lugar de delegar la ejecucion a un interprete externo, la logica del procesador se compila directamente en tensores del modelo. Es un port de Qwenputer (de Divyansh Agrawal, codigo MIT y pesos Apache-2.0) desde Qwen3.5-4B a un modelo hibrido de 27B, y resulta relevante como prueba de concepto de que un modelo de lenguaje puede alojar computacion determinista verificable en su propio espacio de pesos.

El modelo se distribuye en cinco formatos (bf16, FP8, NVFP4, GGUF Q8_0 y GGUF Q4_K_M) con una restriccion critica: las once capas de la maquina, el embedding de tokens y la cabeza de salida permanecen siempre en bf16, porque cualquier cuantizacion aplicada a esas capas rompe el procesador. Su estado es experimental y bajo evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated DeltaNet) y capas de atencion completa; 11 capas adicionales que implementan un procesador RV32IM |
| Parametros totales | 27B (aproximado, segun el nombre del modelo; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, FP8_BLOCK, NVFP4 W4A16, GGUF Q8_0, GGUF Q4_K_M (las capas de la maquina, embedding y lm_head siempre en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el codigo del port Qwenputer es MIT) |
| Formato de pesos | safetensors (bf16, fp8, nvfp4a16) y GGUF (Q8_0, Q4_K_M), con mmproj separado para la torre de vision |

## Arquitectura y entrenamiento

El modelo parte de Qwen Concept 27B, un transformer hibrido que combina atencion lineal con estado recurrente (Gated DeltaNet) y capas de atencion completa, e incluye torre de vision y cabeza MTP (multi-token prediction). Sobre esa base se anaden once capas de maquina delante del modelo anfitrion que implementan un procesador RV32IM exacto. La memoria del procesador se materializa en el estado recurrente de Gated DeltaNet: 256 KB de ROM de codigo, 128 KB de rodata y 32 KB de RAM. La comunicacion entre el modelo y el procesador se realiza a traves de la sintaxis nativa de tool calling del anfitrion.

La release es la build vision+MTP: conserva la torre de vision (333 tensores) y la cabeza MTP (15 tensores), y sus 154 tensores de capas de maquina son identicos byte a byte a la build text-only sobre la que se midieron los resultados del paper. La unica diferencia es que 129 ganancias de RMSNorm se almacenan en float32 en lugar de bf16. El layout carga con la clase estandar `Qwen3_5ForConditionalGeneration` sin tensores faltantes ni discrepancias de forma. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el proceso descrito es una compilacion de pesos y merging, no un entrenamiento convencional.

## Capacidades

- Ejecucion exacta de programas RV32IM dentro de los pesos: 4 de 4 programas exactos en bf16 (control), frente a 0 de 4 cuando se cuantizan las capas de la maquina.
- Tool calling nativo: el modelo anfitrion invoca el procesador a traves de su propia sintaxis de tool call, sin herramientas externas.
- Generacion de texto y continuacion greedy: reproduce la continuacion del modelo base en 18 de 20 prompts en bf16, con diferencias a nivel de parafrasis que empiezan a una mediana de 121 caracteres dentro de una continuacion de 48 tokens.
- Vision: conserva la torre de vision de 333 tensores del modelo base.
- Multi-token prediction: incluye la cabeza MTP (15 tensores) en los formatos safetensors; los GGUF la excluyen, igual que el GGUF del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en weight-space computation: permite estudiar hasta que punto un transformer puede alojar computacion determinista verificable en sus pesos, usando el procesador RV32IM como banco de pruebas reproducible con el repositorio de reproduccion del autor.
- Verificacion de ejecucion de codigo sin sandbox externo: en escenarios donde se quiere que el modelo ejecute pequenos programas RISC-V sin delegar en un interprete fuera de los pesos, el procesador integrado ofrece un camino alternativo, aunque experimental.
- Evaluacion de robustez frente a cuantizacion: el modelo documenta de forma explicita que FP8, Q8_0 y Q4_K_M rompen la maquina, lo que lo convierte en un caso de estudio util para medir el impacto de la cuantizacion en capas funcionalmente criticas.
- Pruebas de tool calling estructurado: sirve para validar pipelines que dependen de la sintaxis nativa de tool calls del modelo anfitrion, con la particularidad de que el tool es interno.
- Experimentos de merging de modelos: al ser un port de Qwenputer a una base de 27B, permite comparar el comportamiento del mismo concepto en escalas de 4B y 27B.
- Benchmarking de formatos de despliegue: con cinco formatos disponibles y checksums SHA256 por carpeta, es util para comparar latencia, tamano y fidelidad entre safetensors y GGUF en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de fidelidad y de integridad de pesos:

| Metrica | bf16 | FP8_BLOCK | NVFP4 W4A16 | GGUF Q8_0 | GGUF Q4_K_M |
|---|---|---|---|---|---|
| Tamano | 89 GB | 58 GB | 44 GB | 57 GB | 43 GB |
| Capas de maquina vs bf16 | referencia | identicas (156/156) | identicas (156/156) | bf16/f32 (157/157) | bf16/f32 (157/157) |
| Carga correcta | si | si | si | si | si |
| Identidad de texto vs base (20 prompts) | 18/20 | 14/20 | 10/20 | no medido | no medido |
| Programas RV32IM exactos | 4/4 | 0/4 | 0/4 | no medido | no medido |

## Requisitos de hardware

- VRAM estimada: aproximadamente 89 GB en bf16, 58 GB en FP8, 44 GB en NVFP4, 57 GB en GGUF Q8_0 y 43 GB en GGUF Q4_K_M, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: para bf16 se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias; FP8 y NVFP4 reducen el requisito a configuraciones multi-GPU de gama profesional o a GPUs con soporte de esos formatos.
- Consumer GPU: no cabe en ninguna GPU de consumo individual en ningun formato; requeriria offloading o configuraciones multi-GPU.
- Opciones de despliegue: safetensors mediante la clase `Qwen3_5ForConditionalGeneration` (compatible con stacks tipo vLLM/TGI para modelos Qwen hibridos, aunque no se confirma soporte explicito en la informacion); GGUF mediante llama.cpp u Ollama, con el fichero `mmproj-concept-rv32im-27b-bf16.gguf` para la torre de vision.
- Latencia y throughput: no disponibles. La model card senala que el runtime GGUF disponible era una build de CPU y que su throughput observado no permitia completar 20 prompts de 48 tokens dentro del presupuesto de tiempo de la maquina, por lo que las metricas de identidad de texto no se midieron en GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Concept RV32IM 27B | 27B | no disponible | Procesador RV32IM exacto en los pesos | Apache-2.0 | Hugging Face y registro Concept Country |
| Qwen Concept 27B (base) | 27B | no disponible | Modelo hibrido con vision y MTP, sin procesador | Apache-2.0 | Hugging Face |
| Qwenputer (Qwen3.5-4B) | 4B | no disponible | Mismo concepto de procesador en una base menor | Codigo MIT, pesos Apache-2.0 | GitHub |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental y bajo evaluacion: no es un modelo para produccion.
- La cuantizacion de las capas de la maquina (FP8, Q8_0, Q4_K_M) rompe el procesador: pasa de 4 de 4 programas exactos a 0 de 4. El modelo no degrada de forma gradual en esa capacidad.
- En FP8 y NVFP4 la identidad de texto frente al modelo base cae a 14/20 y 10/20 respectivamente; incluso en bf16 es de 18/20, con divergencias de parafrasis a partir de una mediana de 121 caracteres.
- La fidelidad de texto en GGUF no se ha medido, por limitaciones del runtime de CPU disponible.
- Los GGUF excluyen la cabeza MTP, igual que el GGUF del modelo base.
- Riesgo de alucinacion: no documentado en la informacion disponible; como modelo generativo de 27B, aplican los riesgos habituales.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Licencia Apache-2.0 permite uso comercial, pero el caracter experimental y la fragilidad del procesador desaconsejan su uso en produccion sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/ConceptCountry/concept-rv32im-27b
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Paper y artefactos: https://concept.country/research/concept-rv32im
- Repositorio de reproduccion: https://github.com/conceptcountry/concept-rv32im
- Qwenputer (proyecto original): https://github.com/divagr18/qwenputer
- Registro Concept Country (API compatible con HF Hub): https://models.concept.country
