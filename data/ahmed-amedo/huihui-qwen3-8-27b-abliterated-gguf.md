# ahmed-amedo/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo multimodal Qwen/Qwen3.8-27B, publicada en formato GGUF para inferencia local. El repositorio lo sube el usuario ahmed-amedo, aunque el contenido de la model card corresponde al trabajo canónico de huihui-ai (huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF); esta ficha describe lo declarado en ese repositorio. El modelo cuenta con 27.320.697.856 parámetros (unos 27,3B) y pipeline image-text-to-text, es decir, acepta imágenes y texto como entrada.

El problema que resuelve es doble: por un lado, ofrece una variante con los mecanismos de rechazo eliminados mediante abliteration, pensada para investigación sobre alineación y para aplicaciones donde los filtros del modelo original resultan limitados; por otro, empaqueta el modelo en múltiples cuantizaciones GGUF (desde 2 bits ternarios hasta BF16 y Q8_0) para que pueda ejecutarse en GPU de consumo, portátiles, Mac con Metal e incluso dispositivos "on-device".

Es relevante ahora porque combina tres tendencias: cuantizaciones extremas de 2 bits con kernels ternarios propios, arquitecturas híbridas de atención con tensores SSM, y soporte multimodal en un mismo artefacto GGUF. La licencia declarada es Apache 2.0 y el repositorio ocupa 799,7 GB por acumular numerosas series de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion hibrida; la model card menciona tensores tipo `ssm_out` y kernels de "ternary hybrid-attention", lo que apunta a un diseno hibrido atencion/SSM. Detalle completo: no disponible |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | No aplicable / no disponible (no se declara que sea MoE) |
| Longitud de contexto | 262.144 tokens en el ejemplo de invocacion de llama.cpp de la model card; no se confirma en las especificaciones del modelo base |
| Tipos de cuantizacion | BF16, Q8_0_L, Q6_K_L, Q5_K, Q4_K, Q3_K, Q2_K_L y variantes ternarias/2-bit (PTQ1 reconvertido a Q2_K/Q3_K); series UD, UD-DW, GSQ-RCO, Ternary, Swift, Underdog-Saluki |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). El modelo base se distribuye en transformers/safetensors, pero este repositorio solo publica GGUF |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base: no se indica numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otra fase de alineacion. Lo que si se documenta es el proceso de derivacion: se ha aplicado abliteration (eliminacion de direcciones de rechazo) siguiendo el enfoque de remove-refusals-with-transformers, una implementacion "cruda" y de prueba de concepto que no emplea TransformerLens. Segun la model card, la capa visual y el modulo MTP no han sido modificados.

El alcance de la ablacion varia por serie. En las series iniciales se retuvieron sin ablacion las primeras 15 capas y se abliteraron de la 17 a la 52 (indices base 0); en las series posteriores (Ternary, Swift, Underdog-Saluki) solo se abliteran las capas 22 a 52. Esto implica una pila de al menos 53 capas. Las cuantizaciones no son estandar: los tensores objetivo de la ablacion (`token_embd`, `output`, `ffn_down`, `ssm_out`, `attn_output`) se reconvierten a Q8_0 en las versiones por debajo de Q8_0 (sufijo `_L`) y a BF16 en la version Q8_0 (sufijo `Q8_0_L`), usando ficheros de tipos de tensor aplicados con `llama-quantize --allow-requantize`. Las series ternarias provienen de prism-ml/Ternary-Bonsai-2-27B-gguf y requieren los kernels ternarios del fork PrismML-Eng/llama.cpp: llama.cpp estandar no puede ejecutarlas.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado como image-text-to-text (entrada de imagen y texto).
- Comprension y descripcion de imagenes, al conservarse sin modificar la torre visual, segun la model card.
- Contexto largo: el ejemplo oficial de llama.cpp arranca con `-c 262144`, lo que sugiere uso con ventanas de hasta 262.144 tokens.
- Modo sin rechazos (abliterated/uncensored): reduce las negativas del modelo base ante peticiones que este rechazaria. No implica capacidades nuevas, solo menor filtrado.
- Soporte de cuantizaciones extremas (2-bit ternario, Q2_K_L) orientadas a ejecucion en dispositivo y GPU de gama media o baja.
- Compatibilidad con Ollama mediante `huihui_ai/Qwen3.8-abliterated` y con llama.cpp (ggml-org), ademas de la libreria transformers declarada en las etiquetas.
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin lista de idiomas).
- Modulo MTP presente y no modificado; su funcionamiento concreto no se detalla en la informacion disponible.
- Capacidades de audio o thinking mode: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo base con esta variante abliterada permite medir que comportamientos dependen de las direcciones de rechazo eliminadas y en que capas (17-52 o 22-52) se concentran.
- Procesamiento de documentos escaneados con contexto largo: al aceptar imagen y texto y soportar ventanas de hasta 262.144 tokens en el ejemplo de llama.cpp, puede ingerir lotes de paginas y extraer informacion estructurada sin trocear en exceso.
- Despliegue local en estacion de trabajo con GPU de consumo: las variantes Q4_K y Q3_K caben en GPUs de 16-24 GB y permiten asistentes privados sin enviar datos a terceros.
- Ejecucion en Mac con Metal: las etiquetas incluyen `metal`, y llama.cpp con backend Metal permite correr las cuantizaciones bajas en portatiles Apple Silicon, util para demos y prototipos offline.
- Inferencia on-device en hardware limitado: las series ternarias/2-bit y los ficheros IQ2 estan pensados explicitamente para on-device, adecuados para asistentes embebidos de baja huella de memoria.
- Generacion de contenido creativo sin filtros editoriales: escritura de ficcion, guiones o roleplay donde los rechazos del modelo original interrumpirian el flujo, asumiendo la revision humana posterior.
- Evaluacion de cuantizacion: usar las distintas series (UD, GSQ-RCO, Ternary, Swift, Underdog-Saluki) para estudiar el impacto de cada esquema de cuantizacion en la calidad de respuesta manteniendo el mismo modelo base.
- Procesamiento de imagenes con modelo quantizado en local: descripcion de capturas, diagramas o fotografias en pipelines internos, siempre que la torre visual se conserve funcional tras la cuantizacion (comportamiento no verificado en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada de inferencia (estimacion propia a partir de 27,3B parametros, no confirmada por el autor): ~7-10 GB para las variantes ternarias/2-bit, ~10-12 GB para Q2_K_L, ~13-15 GB para Q3_K, ~16-18 GB para Q4_K, ~21-24 GB para Q6_K_L, ~29-30 GB para Q8_0_L y ~55 GB para BF16. Los ficheros de la variante `_L` pueden ser mayores que su nivel nominal porque parte de los tensores se guardan en Q8_0 o BF16.
- GPU recomendadas: RTX 4090/3090 (24 GB) para Q4_K o Q6_K_L; RTX 4060 Ti 16 GB o RTX 4080 para Q3_K/Q4_K; A100 40/80 GB o H100 para BF16 y Q8_0_L con contexto largo. No hay recomendaciones oficiales del autor en la informacion disponible.
- Cabe en GPU de consumo: si, en cuantizaciones de 2 a 6 bits. El repositorio ocupa 799,7 GB, por lo que conviene descargar solo el fichero GGUF necesario y no el repo completo.
- Opciones de despliegue: llama.cpp (ggml-org) con `llama-cli -m ... -c 262144`; fork PrismML-Eng/llama.cpp obligatorio para las series ternarias (llama.cpp estandar no las ejecuta); Ollama mediante `ollama run huihui_ai/Qwen3.8-abliterated` (requiere version reciente); la etiqueta declara soporte de transformers. vLLM y TGI: no disponible.
- Aceleracion: etiquetas `cuda` y `metal` presentes, por lo que se contemplan backends NVIDIA y Apple Silicon.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ahmed-amedo/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,32B | 262.144 (ejemplo de uso) | GGUF | apache-2.0 | Abliterado, multimodal, multiples series de cuantizacion |
| Qwen/Qwen3.8-27B (base) | no disponible en la informacion | no disponible | transformers / safetensors | no disponible en la informacion | Modelo original sin abliterar; referencia de calidad |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | mismo modelo origen | no disponible | GGUF | apache-2.0 | Version canonica de referencia del trabajo de abliteration |
| unsloth/Qwen3.8-27B-GGUF | no disponible | no disponible | GGUF | no disponible | Origen de las series UD y UD-DW citadas |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | no disponible | no disponible | GGUF | no disponible | Origen de la serie GSQ-RCO |
| prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | no disponible | GGUF ternario | no disponible | Origen de la serie Ternary; requiere fork de llama.cpp |
| ConwayResearch/Underdog-Saluki-27B-1.0 | no disponible | no disponible | GGUF | no disponible | Origen de la serie Underdog-Saluki; sin fichero imatrix publicado |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) para ninguno de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration es una implementacion "cruda, prueba de concepto": puede degradar coherencia, instruction following y calidad general respecto al modelo base, especialmente en las series que abliteran mas capas.
- Riesgo elevado de generar contenido inapropiado, ofensivo o inseguro: el proposito declarado del modelo es eliminar los rechazos. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion no medido: no hay benchmarks ni evaluaciones publicadas en la informacion disponible.
- Las series ternarias no funcionan con llama.cpp estandar; requieren el fork PrismML-Eng/llama.cpp. Desplegarlas en infraestructura convencional fallara.
- Los tamanos de algunas cuantizaciones no son estandar: el autor advierte que Q2_K_L puede pesar mas que Q3_K o Q4_K, y que el tamano tras la conversion puede diferir del GGUF original.
- La superficie de ablacion es parcial y variable: en las series iniciales se conservan las primeras 15 capas sin abliterar; esto puede dejar comportamientos de rechazo residuales o inconsistentes entre series.
- Las series marcadas como "test/validation" (Ternary, Swift, Underdog-Saluki) son experimentales y pueden incluir avisos adicionales del autor.
- Idiomas soportados no declarados: no hay garantia de calidad fuera de los idiomas del modelo base, que tampoco se documentan aqui.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin rechazos recae en el integrador; conviene revisar tambien los terminos del modelo base.
- El repositorio no ha recibido descargas ni "likes" (0/0) y fue creado en octubre de 2026: no hay validacion comunitaria ni historial de uso en produccion.
- Discrepancia de autoria: el repositorio lo publica ahmed-amedo, pero el contenido de la model card referencia huihui-ai. Verificar la procedencia de los pesos antes de usarlos en produccion.
- Uso de imagenes con cuantizaciones extremas: no se documenta si la torre visual mantiene calidad tras la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ahmed-amedo/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia del trabajo de abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Metodologia de abliteration (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Cuantizaciones ternarias: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp con kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Modelo origen de la serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Modelo origen de la serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Version para Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Releases de Ollama: https://github.com/ollama/ollama/releases
