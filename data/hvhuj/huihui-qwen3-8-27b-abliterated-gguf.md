# hvhuj/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una distribucion en formato GGUF de una version "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.8-27B, publicada por el usuario hvhuj bajo el paraguas del proyecto huihui-ai. El proceso de abliteracion elimina las direcciones de activacion asociadas a las respuestas de rechazo mediante una implementacion de prueba de concepto basada en `remove-refusals-with-transformers`, sin emplear TransformerLens. El resultado es un modelo conversacional que responde a practicamente cualquier peticion, a costa de una perdida de alineacion y de calidad potencialmente degradada.

El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y una arquitectura descrita en las etiquetas como "hybrid-attention", con soporte multimodal de entrada imagen-texto (`pipeline_tag: image-text-to-text`). El repositorio es inusualmente grande (799,7 GB) porque contiene multiples series de cuantizacion derivadas de distintos modelos intermedios: UD, UD-DW, GSQ-RCO, Ternary, Swift y Underdog-Saluki. La ventana de contexto declarada en los ejemplos de uso de llama.cpp es de 262.144 tokens.

Es relevante ahora porque ejemplifica una tendencia doble: por un lado, la proliferacion de derivados "uncensored" de modelos abiertos de gran tamano; por otro, la experimentacion con cuantizaciones no estandar (ternarias de 2 bits, mezclas de pesos, requisitos de kernels personalizados) que rompen la compatibilidad con el ecosistema llama.cpp estandar. Para un desarrollador, es un caso de estudio sobre los limites y riesgos de la desalineacion deliberada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida con atencion hibrida ("hybrid-attention"); incluye modulos MTP y vision segun la model card |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de llama-cli; no se confirma como maximo oficial) |
| Tipos de cuantizacion | Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K, Q6_K_L, Q8_0, Q8_0_L, bf16, IQ2-mix, ternaria (PTQ1 convertida a Q2_K/Q3_K) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con variantes bf16 y cuantizadas); libreria declarada transformers |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base; solo describe el proceso de abliteracion aplicado sobre Qwen/Qwen3.8-27B. La ablacion se realiza sobre pesos concretos identificados por nombre de tensor: `token_embd`, `output`, `ffn_down`, `ssm_out` y `attn_output`. La presencia de `ssm_out` sugiere componentes de tipo state space en la arquitectura hibrida, aunque el autor no lo detalla. En la version inicial se preservaron las primeras 15 capas sin abliterar; en la actualizacion posterior el rango ablacionado se amplia a las capas 17 a 52 (indexacion 0-based), y en las series derivadas (Ternary, Swift, Underdog-Saluki) solo se ablacionan las capas 22 a 52. Los modulos MTP (multi-token prediction) y el codificador visual no se modifican.

La innovacion tecnica mas destacable no esta en el entrenamiento sino en el empaquetado de cuantizaciones. El autor reescala a Q8_0 (o a BF16 en la variante Q8_0_L) los tensores objetivo de la ablacion antes de cuantizar el resto, de modo que las versiones Q2_K_L a Q6_K_L no son cuantizaciones estandar y pueden presentar tamanos contraintuitivos (por ejemplo, Q2_K_L mayor que Q3_K). La serie Ternary procede de prism-ml/Ternary-Bonsai-2-27B-gguf y requiere los kernels de atencion hibrida ternaria del fork PrismML-Eng/llama.cpp; llama.cpp oficial no ejecuta esos ficheros. La serie Underdog-Saluki se genera mezclando pesos GGUF de dos modelos distintos ante la ausencia de fichero imatrix.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Entrada multimodal imagen-texto (`pipeline_tag: image-text-to-text`, con el modulo visual preservado tras la ablacion).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B, con la salvedad de la degradacion introducida por la ablacion.
- Prediccion multi-token (MTP) conservada en los pesos.
- Ausencia deliberada de rechazos: el modelo no aplica las politicas de seguridad del modelo original.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como contraste controlado para estudiar como la abliteracion afecta a la distribucion de respuestas, comparando con el Qwen3.8-27B original en tareas de refusal y utilidad.
- Evaluacion de tecnicas de cuantizacion extrema: las series Ternary e IQ2-mix permiten medir la degradacion de calidad de esquemas de 2 bits y ternarios frente a Q4_K o Q8_0 sobre el mismo modelo base.
- Despliegue local en estaciones de trabajo con GPU consumer: las variantes Q4_K y Q5_K de un modelo de 27B caben en GPUs de 24 GB con offloading parcial, adecuadas para prototipos offline sin dependencia de API.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos que requieran tematicas que el modelo base rechazaria, en entornos editoriales controlados.
- Analisis de contenido sensible en moderacion: usar el modelo como generador adversarial para producir casos de prueba que alimenten clasificadores de seguridad propios.
- Procesamiento de documentos largos con componente visual: la ventana de 262.144 tokens y la entrada de imagen permiten resumir o extraer informacion de informes escaneados y transcripciones extensas en una sola pasada.
- Pruebas de compatibilidad de runtimes: util para validar forks de llama.cpp (PrismML-Eng) y detectar regresiones en kernels de atencion hibrida y cuantizaciones no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, unos 54,6 GB solo para pesos (27,3 mil millones de parametros a 2 bytes), mas overhead de contexto KV; en Q8_0, aproximadamente 27-29 GB; en Q4_K, en torno a 15-16 GB; en Q2_K y variantes ternarias, alrededor de 8-10 GB.
- La ventana de 262.144 tokens dispara el consumo de cache KV; con atencion hibrida el coste por token puede ser menor que en un transformer denso equivalente, pero no se dispone de cifras oficiales.
- GPU recomendadas: A100 80 GB o H100 para bf16 y contextos largos; RTX 4090 (24 GB) para Q4_K y Q5_K con contexto moderado; RTX 3090 o 4080 para Q4_K con offloading.
- Cabe en GPU consumer: si, en las cuantizaciones Q4_K, Q5_K y Q2_K/ternarias, con mayor o menor offloading a RAM.
- Opciones de despliegue: llama.cpp oficial (variantes estandar), fork PrismML-Eng/llama.cpp (serie Ternary), Ollama mediante `huihui_ai/Qwen3.8-abliterated`. vLLM y TGI no estan documentados para estos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B | 262.144 (segun ejemplo) | apache-2.0 | GGUF, bf16 | Sin rechazos, multimodal, multiples series de cuantizacion |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | apache-2.0 | safetensors | Modelo original alineado; referencia de calidad |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (derivado) | no disponible | no disponible | GGUF ternario | Requiere fork de llama.cpp; origen de la serie Ternary |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible | apache-2.0 | GGUF | Cuantizaciones UD y UD-DW; origen de dos series |

## Limitaciones y advertencias

- La abliteracion es una prueba de concepto "cruda" segun el propio autor; degrada la coherencia y puede aumentar la tasa de respuestas erroneas o incoherentes frente al modelo base.
- Riesgo elevado de alucinacion y de contenido danino: al eliminar los rechazos, el modelo puede generar instrucciones peligrosas, contenido ilegal o desinformacion sin filtro.
- La ablacion solo cubre determinadas capas (17-52 o 22-52 segun la serie), por lo que el comportamiento puede ser inconsistente entre tipos de peticion.
- Las cuantizaciones Q2_K_L a Q6_K_L y Q8_0_L no son estandar; los tamanos y la calidad no siguen las expectativas habituales y pueden romper herramientas de validacion.
- La serie Ternary no funciona con llama.cpp oficial; requiere el fork PrismML-Eng y sus kernels especificos.
- La serie Underdog-Saluki se genero mezclando pesos sin fichero imatrix, lo que anade incertidumbre sobre la calidad resultante.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- Aunque la licencia es apache-2.0, el uso comercial de un modelo sin alineacion expone al operador a responsabilidad legal y reputacional segun jurisdiccion; conviene revisar los terminos del modelo base Qwen.
- Repositorio de 799,7 GB: la descarga completa es inviable en la mayoria de entornos; hay que seleccionar ficheros concretos.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni evidencia de robustez en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hvhuj/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia del proyecto huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Herramienta de ablacion: https://github.com/Sumandora/remove-refusals-with-transformers
- Origen serie Ternary: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- Origen serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Origen series UD y UD-DW: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Origen serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Origen serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama/releases
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
