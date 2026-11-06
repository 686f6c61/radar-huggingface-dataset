# kody321/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.8-27B, publicada por el usuario kody321 y derivada del trabajo original de huihui-ai. La técnica de abliteración elimina la dirección de activación asociada a las negativas del modelo, de modo que este deja de rechazar peticiones que el modelo base rechazaría. El repositorio distribuye exclusivamente pesos en formato GGUF, con múltiples variantes de cuantización, algunas de ellas no estándar (sufijo `_L`) y otras experimentales (ternary, GSQ-RCO, IQ2-mix).

El modelo base tiene 27.320.697.856 parámetros (unos 27,3 mil millones) y arquitectura híbrida de atención, con soporte multimodal image-text-to-text y una ventana de contexto que el autor ilustra con `-c 262144` en el ejemplo de llama.cpp. El repositorio incluye además variantes derivadas de otros modelos comunitarios (Underdog-Saluki, Swift-1.5, Ternary-Bonsai-2) en las que solo se han ablacionado las capas 22 a 52.

Es relevante ahora porque combina tres tendencias: la demanda de modelos sin censura para investigación sobre alineamiento y seguridad, la cuantización agresiva para ejecución en dispositivo (2-bit, ternary) y el soporte multimodal en un mismo checkpoint. No obstante, el repositorio es un espacio de pruebas del autor, con 0 descargas y 0 likes en el momento de la consulta, y varias de sus variantes requieren forks específicos de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención híbrida (hybrid-attention); detalles de capas y atención lineal no disponibles |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama.cpp del autor); no confirmado en ficha técnica |
| Tipos de cuantización | BF16, Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, variantes `_L` (Q2_K_L a Q8_0_L), IQ2-mix, ternary (PTQ1 convertido a Q2_K/Q3_K), GSQ-RCO |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repo también menciona un bf16 GGUF); no se distribuyen safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 799,7 GB |
| Pipeline | image-text-to-text (multimodal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con atención híbrida, según las etiquetas del repositorio (`hybrid-attention`). El autor menciona explícitamente componentes `ssm_out` entre los pesos sometidos a abliteración, lo que sugiere la presencia de módulos de espacio de estados (SSM) combinados con atención, aunque no se detalla la proporción ni la disposición de capas. El modelo es multimodal (image-text-to-text) e incluye un componente MTP (multi-token prediction), que el autor indica que no ha sido modificado durante la abliteración.

El proceso de abliteración consiste en identificar la dirección de activación que media en los rechazos y proyectarla fuera de los pesos. En este repositorio se aplica de forma parcial: en la variante principal se retuvieron sin ablacionar las primeras 15 capas (y posteriormente se amplió el rango a las capas 17 a 52), mientras que en las variantes derivadas (Underdog-Saluki, Swift, Ternary, GSQ-RCO, UD-DW) solo se ablacionaron las capas 22 a 52. El autor declara que se trata de una implementación "cruda, proof-of-concept", sin TransformerLens. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información no está disponible en el material consultado.

Una innovación técnica destacable es el esquema de cuantización no estándar: los pesos objetivo de la abliteración (`token_embd`, `output`, `ffn_down`, `ssm_out`, `attn_output`) se convierten a Q8_0 en las variantes por debajo de Q8_0 y a BF16 en la variante Q8_0_L, para preservar la calidad de la respuesta tras la modificación. Como consecuencia, Q2_K_L puede ocupar más que Q3_K o Q4_K. Las variantes ternary requieren los kernels de atención híbrida ternary del fork PrismML-Eng/llama.cpp y no funcionan con llama.cpp estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), aunque el autor indica que el componente visual no ha sido modificado respecto al base.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-27B; no se documentan evaluaciones específicas en este repositorio.
- Generación de código: no documentada explícitamente en la información disponible.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo "uncensored": el modelo no aplica rechazos de seguridad tras la abliteración, que es precisamente su rasgo diferencial.
- Multi-token prediction (MTP): presente en el modelo base y no modificado por la abliteración.
- Ejecución en dispositivo: las variantes de 2 bits y ternary están orientadas a inferencia local con llama.cpp y Ollama, con soporte declarado para CUDA y Metal.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar qué comportamientos emergen cuando se elimina la dirección de rechazo, comparando las respuestas con el Qwen3.8-27B original en el mismo prompt y con la misma cuantización.
- Evaluación de técnicas de abliteración: las distintas variantes (capas 17-52 frente a 22-52, con y sin `_L`) permiten medir el impacto de ablacionar más o menos capas sobre la calidad y la tasa de rechazos.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K y Q5_K caben en GPU de consumo de 24 GB y permiten ejecutar un modelo de 27B con contexto largo mediante llama.cpp u Ollama.
- Pruebas de cuantización extrema: las variantes ternary y de 2 bits sirven para validar los kernels del fork PrismML-Eng/llama.cpp y medir la degradación de calidad frente a Q8_0_L en hardware limitado.
- Generación de datos sintéticos sin filtros de seguridad: útil en pipelines de aumento de datos donde los rechazos del modelo base interrumpen la generación, siempre con revisión posterior.
- Análisis de robustez de filtros: alimentar el modelo con prompts adversarios para caracterizar qué contenido produce un modelo sin alineamiento y calibrar clasificadores de seguridad.
- Experimentación multimodal: al conservar el componente visual, permite probar tareas image-text-to-text en local con cuantizaciones Q4_K o superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño de pesos, un modelo de 27,3B en BF16 requiere aproximadamente 54,6 GB solo para pesos; Q8_0 ronda los 27 GB; Q4_K ronda los 14-16 GB; las variantes de 2 bits y ternary quedan por debajo de los 10 GB, aunque el autor advierte que Q2_K_L puede ser mayor que Q3_K o Q4_K por la conversión de pesos a Q8_0.
- GPU recomendadas: no especificadas por el autor. Por tamaño, A100 80 GB o H100 para BF16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K y Q5_K; GPUs de 8-12 GB para las variantes de 2 bits y ternary.
- GPU de consumo: sí, cabe en RTX 4090 con Q4_K o Q5_K y en GPUs de 8-12 GB con cuantizaciones de 2 bits o ternary, sujeto a la advertencia sobre el tamaño real de Q2_K_L.
- Opciones de despliegue: llama.cpp (versión reciente), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`), y el fork PrismML-Eng/llama.cpp para las variantes ternary. El repositorio declara compatibilidad con endpoints y con CUDA y Metal. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-GGUF (este) | 27,3B | 262.144 (según ejemplo del autor) | Sí (image-text-to-text) | Apache 2.0 | GGUF | Sin rechazos; variantes experimentales |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | Sí | Apache 2.0 | safetensors y GGUF (vía terceros) | Modelo original con alineamiento intacto |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | Sí | Apache 2.0 | GGUF | Cuantizaciones dinámicas UD; fuente de las variantes UD de este repo |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (aprox.) | no disponible | no disponible | no disponible | GGUF ternary | Requiere fork de llama.cpp con kernels ternary |

## Limitaciones y advertencias

- La abliteración es una implementación "cruda, proof-of-concept"; no hay garantía de que se hayan eliminado todos los rechazos ni de que la calidad se mantenga en todas las tareas.
- Riesgo elevado de alucinación y de generar contenido dañino, ilegal o sexualmente explícito: el modelo está diseñado para no rechazar, por lo que no debe desplegarse en entornos de cara al público sin filtros externos.
- Solo se ablacionaron parcialmente las capas (17-52 en la variante principal, 22-52 en las derivadas); el comportamiento puede ser inconsistente entre tipos de petición.
- Las variantes ternary no funcionan con llama.cpp estándar; requieren el fork PrismML-Eng/llama.cpp, lo que limita su portabilidad y soporte.
- El tamaño de las cuantizaciones `_L` no sigue la progresión habitual: Q2_K_L puede ser mayor que Q3_K o Q4_K, lo que complica la planificación de VRAM.
- El autor advierte que el tamaño tras la conversión puede diferir del GGUF original en las variantes derivadas (Ternary, GSQ-RCO, UD-DW).
- No se declaran idiomas soportados; el rendimiento en castellano no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de calidad independientes.
- El modelo base Qwen3.8-27B no está documentado en el material consultado en cuanto a datos de entrenamiento, sesgos o evaluaciones; esas limitaciones se heredan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kody321/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai (referenciado en la model card): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Herramienta de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fork con kernels ternary: https://github.com/PrismML-Eng/llama.cpp
- unsloth/Qwen3.8-27B-GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- prism-ml/Ternary-Bonsai-2-27B-gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- ConwayResearch/Underdog-Saluki-27B-1.0: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
