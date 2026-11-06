# ExoplaneTTraveler/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-abliterated-GGUF es una versión "abliterated" (con los mecanismos de rechazo suprimidos mediante edición de pesos) del modelo Qwen3.8-27B de Alibaba Qwen, distribuida en formato GGUF para inferencia con llama.cpp y Ollama. El trabajo lo firma el usuario ExoplaneTTraveler, que replica la metodología del conocido repositorio huihui-ai basada en la técnica de *abliteration* implementada en remove-refusals-with-transformers. El modelo conserva la arquitectura del original (híbrida de atención, con capas SSM y atención clásica, y capacidad multimodal image-text-to-text) y suma 27.320.697.856 parámetros totales.

La relevancia de esta ficha es doble: por un lado documenta un modelo derivado no oficial con licencia Apache-2.0 y sin métricas publicadas; por otro, su repositorio de 799,7 GB agrupa múltiples series de cuantización experimentales (UD, UD-DW, GSQ-RCO, Ternary, Swift, Underdog-Saluki) que requieren kernels específicos, en particular el fork PrismML-Eng/llama.cpp para las variantes ternarias de 2 bits. Es, por tanto, un artefacto de validación técnica más que un modelo listo para producción.

El contexto máximo declarado en los ejemplos de uso es de 262.144 tokens (`-c 262144`), coherente con la familia Qwen3.8, aunque el modelo card no documenta explícitamente la ventana nativa ni los idiomas soportados. La ficha recoge únicamente lo verificable en la información disponible y marca como "no disponible" todo aquello que el autor no publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención clásica y capas SSM (hybrid-attention), según tags del autor; multimodal image-text-to-text |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de llama-cli; no se documenta la ventana nativa oficial) |
| Tipos de cuantizacion | BF16, Q2_K_L, Q3_K, Q4_K, Q5_K, Q6_K_L, Q8_0_L, IQ2-mix, ternario 2-bit (PTQ1), GSQ-RCO, UD, UD-DW |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio pensado para llama.cpp/Ollama); el modelo base en safetensors no se incluye aquí |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea, según los tags del autor, una arquitectura híbrida de atención que combina capas de atención clásica con capas de espacio de estados (SSM), e incluye componentes multimodales (visión) y MTP (multi-token prediction). El proceso de abliteration actúa sobre las matrices de proyección asociadas a los rechazos: en las series UD se ablacionan las capas 17 a 52 (indexación 0-based), mientras que en las series más recientes (Ternary, Swift, Underdog-Saluki) solo se ablacionan las capas 22 a 52. Las 15 primeras capas se mantienen intactas y, según el autor, ni MTP ni el codificador visual se modifican, lo que busca preservar el rendimiento original.

El autor no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; todo ello corresponde al modelo base y no se detalla en esta model card. La innovación técnica destacable es el pipeline de cuantización "K_L": los pesos objetivo de la abliteration (token_embd, output, ffn_down, ssm_out, attn_output) se convierten a Q8_0 (o BF16 en la variante Q8_0_L) mientras el resto del modelo se cuantiza a Q2_K–Q6_K, de modo que las cuantizaciones bajas no degraden precisamente las capas editadas. Esto provoca que Q2_K_L pueda ocupar más que Q3_K o Q4_K. Las variantes ternarias dependen de kernels propios del fork PrismML-Eng/llama.cpp y no funcionan con llama.cpp estándar.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el codificador visual sin modificar respecto al original.
- Razonamiento multi-paso y matemáticas, presumiblemente conservados en las capas no ablacionadas, aunque sin benchmarks que lo verifiquen.
- Generación de código, sujeta a la misma cautela: no hay evaluación publicada tras la abliteration.
- Predicción multi-token (MTP) conservada en el modelo, según el autor.
- Modo sin rechazos: el propósito explícito de la abliteration es eliminar las negativas del modelo a responder.
- Soporte multilingüe: no disponible en la documentación; se desconoce qué idiomas conserva tras la edición.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de cómo la abliteration afecta a las capas 17-52 y qué capacidades se degradan, comparando las distintas series (UD, Ternary, Swift) frente al original.
- Validación de cuantizaciones híbridas: útil para medir el impacto del esquema K_L (Q8_0 selectivo en pesos ablacionados) frente a cuantizaciones homogéneas en tareas de generación libre.
- Pruebas de kernels ternarios: las variantes de 2 bits permiten evaluar el fork PrismML-Eng/llama.cpp en GPUs de consumo, verificando latencia y estabilidad de los kernels de atención híbrida.
- Despliegue local en Ollama: con `ollama run huihui_ai/Qwen3.8-abliterated` se puede probar el modelo en un equipo personal, útil para experimentar con contexto largo (hasta 262.144 tokens en el ejemplo) sin infraestructura de servidor.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido sensible donde los filtros del modelo original resultan un obstáculo, asumiendo la responsabilidad legal del usuario.
- Evaluación comparativa de series: el repositorio agrupa seis linajes de cuantización distintos, lo que permite al investigador contrastar calidad de respuesta entre UD, UD-DW, GSQ-RCO, Ternary, Swift y Underdog-Saluki sobre el mismo prompt set.
- Fine-tuning posterior: al estar en GGUF y con licencia Apache-2.0, puede servir como base para experimentos de destilación o adaptación, aunque la edición de pesos complica la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 27.320 millones de parámetros, en BF16 se necesitan aproximadamente 54,6 GB solo para pesos; en Q8_0_L en torno a 29 GB; en Q6_K_L unos 22 GB; en Q4_K alrededor de 16 GB; en Q2_K_L entre 9 y 11 GB (el autor advierte que Q2_K_L puede superar a Q3_K por el esquema K_L).
- GPU recomendadas: para BF16, A100 80 GB o H100 80 GB; para Q8_0_L, A100 40 GB o dos RTX 4090; para Q4_K, una RTX 4090 (24 GB) con margen para contexto; para Q2_K_L, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K_L a Q4_K sobre RTX 3090, RTX 4090, RTX 4080 y similares; las variantes ternarias de 2 bits están pensadas explícitamente para on-device.
- Opciones de despliegue: llama.cpp (obligatorio el fork PrismML-Eng/llama.cpp para las variantes ternarias), Ollama (modelo `huihui_ai/Qwen3.8-abliterated`), y presumiblemente vLLM o TGI solo si se dispone de los pesos en safetensors del modelo base, que este repositorio no incluye.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ExoplaneTTraveler/Huihui-Qwen3.8-27B-abliterated-GGUF | 27,3 B | 262.144 (ejemplo) | Apache-2.0 | GGUF | Abliteration parcial (capas 17-52 o 22-52); múltiples series experimentales |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible en esta ficha | Apache-2.0 | safetensors | Modelo original con alineación intacta; referencia de calidad |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | no disponible en esta ficha | Apache-2.0 | GGUF | Cuantizaciones UD estándar sin abliteration; base de las series UD y UD-DW |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B (aprox.) | no disponible en esta ficha | no disponible | GGUF ternario | Requiere fork PrismML-Eng/llama.cpp; origen de la serie Ternary |

## Limitaciones y advertencias

- La abliteration es una técnica "cruda y de prueba de concepto", en palabras del propio autor: no hay garantía de que las capas editadas conserven el rendimiento del original y no se publican evaluaciones.
- Riesgo elevado de respuestas dañinas, sesgadas o factualmente incorrectas: al eliminar los rechazos, el modelo puede generar contenido que el original bloquearía, incluyendo material ilícito o peligroso.
- Solo se ablacionan las capas 17-52 (o 22-52 en series recientes); las 15 primeras capas permanecen intactas, lo que puede producir comportamientos inconsistentes entre consultas.
- Las variantes ternarias no funcionan con llama.cpp estándar: requieren el fork PrismML-Eng/llama.cpp, lo que limita su portabilidad y soporte.
- El esquema K_L no es una cuantización estándar: los tamaños de archivo no siguen el orden habitual y algunas herramientas de cuantización pueden fallar al reproducirlos.
- No se documentan idiomas soportados; el comportamiento multilingüe tras la edición es incierto.
- Licencia Apache-2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado sin filtros.
- El repositorio ocupa 799,7 GB: la descarga completa es inviable para la mayoría de entornos; conviene bajar solo la variante necesaria.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria que respalde la calidad de las cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ExoplaneTTraveler/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Técnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork de llama.cpp para kernels ternarios: https://github.com/PrismML-Eng/llama.cpp
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama/releases
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Cuantizaciones UD de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Serie Ternary: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Serie Underdog-Saluki: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
