# karlsencoin/Karlsen-Chat-27B-abliterated-GGUF

## Resumen

Karlsen-Chat-27B-abliterated-GGUF es una distribucion en formato GGUF de un modelo derivado de Qwen/Qwen3.8-27B, publicada por el usuario karlsencoin. El modelo parte de la familia de variantes "abliterated" (eliminacion de rechazos mediante ablacion de direcciones en el espacio de activaciones) generadas por huihui-ai y reempaquetadas por el autor en un unico repositorio que agrupa multiples linajes de cuantizacion: UD (Unsloth Dynamic), GSQ-RCO (ISTA-DASLab), Ternary (prism-ml), Swift (ukisai) y Underdog-Saluki (ConwayResearch).

La relevancia del repositorio no reside en un modelo nuevo, sino en la agregacion de variantes experimentales de cuantizacion de muy bajo bit-width sobre una base de 27.320.697.856 parametros. Incluye pesos ternarios (PTQ1), mezclas IQ2 y esquemas K-quant modificados con capas selectivamente reescaladas a Q8_0 o BF16 para preservar la calidad tras la ablacion. El pipeline declarado es image-text-to-text, lo que sugiere que la base conserva componentes multimodales, aunque la model card no detalla su funcionamiento.

La licencia declarada es Apache 2.0 y el repositorio ocupa 799,7 GB, reflejando la acumulacion de docenas de ficheros GGUF con distintos esquemas. El modelo esta pensado para ejecucion local en llama.cpp y Ollama, con soporte declarado de CUDA y Metal, y con la advertencia de que las variantes ternarias requieren un fork especifico de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida con atencion hibrida (hybrid-attention) y componentes SSM; incluye MTP y modulo visual segun la model card; detalles completos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de llama-cli de la model card) |
| Tipos de cuantizacion | BF16, Q2_K, Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K, Q6_K_L, Q8_0, Q8_0_L, IQ2-mix, ternario PTQ1 (serie Ternary) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); transformers declarado como libreria |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento original de Qwen3.8-27B: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si documenta la model card es el proceso de derivacion. La ablacion se aplica sobre un subconjunto de capas: en la variante UD se abliteran las capas 17 a 52 (indices base 0), mientras que en las series GSQ-RCO, Ternary, Swift y Underdog-Saluki solo se abliteran las capas 22 a 52. Las 15 primeras capas se mantienen intactas en la version inicial, y los componentes MTP y visual no se modifican.

El aspecto tecnico mas singular es el esquema de cuantizacion. Para las versiones por debajo de Q8_0, los tensores afectados por la ablacion (token_embd, output, ffn_down, ssm_out, attn_output) se reescalan de Q2_K a Q6_K hacia Q8_0 para preservar la calidad de respuesta, y en la variante Q8_0_L esos mismos tensores se elevan a BF16. Esto rompe la monotonia habitual de tamanos: Q2_K_L puede ocupar mas que Q3_K o Q4_K. La serie Ternary emplea kernels de atencion hibrida ternaria que solo existen en el fork PrismML-Eng/llama.cpp; llama.cpp estandar no puede cargar esos ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Qwen3.8-27B.
- Procesamiento image-text-to-text segun el pipeline declarado, con modulo visual preservado durante la ablacion.
- Razonamiento y respuesta a instrucciones sin rechazos por contenido, objetivo explicito de la abliteration.
- Soporte de contexto largo: el ejemplo oficial usa `-c 262144` en llama-cli.
- Ejecucion en dispositivo (on-device) gracias a las variantes de 2 bits y ternarias.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q2_K_L y Q3_K permiten cargar un modelo de 27B en VRAM limitada usando llama.cpp, a costa de perdida de calidad frente a Q5_K o Q6_K.
- Investigacion sobre cuantizacion extrema: el repositorio sirve como banco de pruebas comparativo entre esquemas K-quant, IQ2, ternario PTQ1 y mezclas de pesos, con el mismo modelo base y el mismo proceso de ablacion.
- Evaluacion de robustez tras abliteration: permite medir como afecta la ablacion selectiva de capas (17-52 frente a 22-52) a la calidad en tareas de razonamiento y generacion.
- Procesamiento de documentos largos con componente visual: el contexto de 262.144 tokens y el pipeline image-text-to-text permiten analizar capturas, diagramas o PDF renderizados junto a texto extenso en local.
- Prototipado de asistentes sin filtros de rechazo para entornos controlados de investigacion, donde se necesita estudiar el comportamiento del modelo ante peticiones que la base rechazaria.
- Integracion en Ollama para pruebas rapidas: el tag `huihui_ai/Qwen3.8-abliterated` permite `ollama run` sin gestion manual de ficheros GGUF.
- Validacion de kernels ternarios: la serie Ternary, ejecutable solo con el fork PrismML-Eng/llama.cpp, sirve para medir throughput y calidad de atencion hibrida ternaria frente a cuantizaciones K estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 27.320.697.856 parametros en BF16 requiere aproximadamente 54,6 GB solo para pesos. En Q8_0 ronda los 27-29 GB; en Q4_K aproximadamente 15-17 GB; en Q2_K y variantes ternarias puede situarse en el rango de 7-10 GB, aunque los esquemas _L con tensores reescalados a Q8_0 o BF16 incrementan el tamano respecto a la cuantizacion nominal.
- GPU recomendadas: A100 80 GB o H100 para BF16 y Q8_0; RTX 4090 (24 GB) para Q4_K y Q5_K; RTX 3090 o 4080 para Q3_K y Q4_K con contexto reducido.
- GPU de consumo: si cabe en RTX 4090, 3090, 4080 y, con las variantes de 2 bits y ternarias, potencialmente en GPUs de 8-12 GB, a costa de calidad.
- Despliegue: llama.cpp (version reciente para las series estandar), Ollama (`huihui_ai/Qwen3.8-abliterated`), y el fork PrismML-Eng/llama.cpp obligatorio para la serie Ternary. vLLM y TGI no se mencionan en la informacion disponible.
- Aceleracion: CUDA y Metal declarados en los tags.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Karlsen-Chat-27B-abliterated-GGUF | 27,3 B | 262.144 | GGUF | Apache 2.0 | Agregado de variantes abliterated y cuantizaciones extremas |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B (base) | no disponible | GGUF | Apache 2.0 | Fuente directa de las variantes; mismo proceso de ablacion |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | safetensors | Apache 2.0 | Modelo base original, con rechazos intactos |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible | GGUF | Apache 2.0 | Cuantizaciones dinamicas UD sin ablacion |

## Limitaciones y advertencias

- La abliteration elimina los rechazos de forma deliberada; el modelo puede generar contenido danino, ilegal o sexual sin filtro. No es apto para produccion orientada al publico sin moderacion externa.
- La ablacion parcial (solo capas 17-52 o 22-52) no garantiza la eliminacion total de rechazos y puede degradar capacidades de razonamiento en las capas afectadas.
- Las variantes _L no son cuantizaciones estandar: Q2_K_L puede superar en tamano a Q3_K o Q4_K, lo que complica la planificacion de VRAM.
- La serie Ternary solo funciona con el fork PrismML-Eng/llama.cpp; llama.cpp estandar falla al cargar esos ficheros.
- La model card advierte de posibles discrepancias de tamano tras la conversion en las series GSQ-RCO, Ternary, Swift y Underdog-Saluki.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; las cuantizaciones de 2 bits y ternarias lo incrementan de forma tipica.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera de los idiomas de la base.
- El repositorio ocupa 799,7 GB, lo que dificulta su descarga completa; conviene bajar solo el fichero GGUF necesario.
- La model card original aparece truncada en el aviso de uso, por lo que pueden existir advertencias adicionales no recogidas aqui.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado sin filtros recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/karlsencoin/Karlsen-Chat-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio fuente huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Metodo de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Ternary Bonsai (prism-ml): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork llama.cpp para ternario: https://github.com/PrismML-Eng/llama.cpp
- Swift 1.5 (ukisai): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Underdog-Saluki (ConwayResearch): https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de Ollama: https://github.com/ollama/ollama/releases
