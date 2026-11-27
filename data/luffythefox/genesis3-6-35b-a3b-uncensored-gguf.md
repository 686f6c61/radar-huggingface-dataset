# LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF

## Resumen

Genesis3.6-35B-A3B-Uncensored-GGUF es una cuantización en formato GGUF de un modelo Mixture-of-Experts (MoE) de aproximadamente 34.660 millones de parámetros totales, con unos 3.000 millones activos por token, derivado del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive. Lo publica el desarrollador independiente LuffyTheFox dentro de su proyecto Genesis, un conjunto de técnicas de "reparación" numérica de tensores aplicadas sobre pesos ya entrenados, sin reentrenamiento ni ajuste fino adicional. La arquitectura subyacente es híbrida: combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1, sobre 40 capas y 256 expertos (8 enrutados más 1 compartido por token).

El modelo resuelve dos necesidades concretas: por un lado, ofrece una variante sin censura (uncensored) orientada a conversación y agentes, con capacidades multimodales nativas de texto, imagen y vídeo; por otro, el autor afirma que su algoritmo Genesis corrige ruido de entrenamiento, desajustes de escala y bloques a cero en los tensores, mejorando la estabilidad y la fidelidad de las instrucciones. Estas afirmaciones proceden exclusivamente de la model card y no están respaldadas por evaluaciones independientes publicadas.

Su relevancia actual radica en que empaqueta un MoE de 35B con contexto nativo de 262.144 tokens (extensible a 1M con YaRN) en cuantizaciones GGUF ejecutables en hardware de consumo, con velocidades declaradas de 35-47 tokens por segundo en una RTX 3060 de 12 GB usando el cuantizado MXFP4 y una configuración concreta de LM Studio. La licencia Apache 2.0 facilita su adopción comercial, aunque el carácter "uncensored" traslada al operador la responsabilidad sobre el filtrado de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1; 40 capas con patrón 10 × (3 × DeltaNet-MoE + 1 × Attention-MoE) |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | ~3B por token (MoE con 256 expertos, 8 enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantizacion | GGUF (incluye MXFP4; el repo ocupa 58,4 GB en total, con múltiples variantes) |
| Idiomas soportados | en, zh, multilingual (la model card declara vocabulario de 248K y 201 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un MoE de 40 capas que intercala bloques de atención lineal Gated DeltaNet con bloques de atención softmax completa en una proporción de 3 a 1. Cada capa MoE dispone de 256 expertos, de los que se activan 8 enrutados más 1 compartido por token, lo que da lugar a unos 3.000 millones de parámetros activos sobre un total de 34,66B. Incorpora además soporte de multi-token prediction (MTP) y un vocabulario de 248K entradas. La model card declara capacidades multimodales nativas (texto, imagen y vídeo) y un pipeline image-text-to-text.

El proceso de creación no es un entrenamiento desde cero. Según el autor, partió del modelo base sin censura de HauhauCS y transfirió datos de un ajuste fino sobre el dataset NousResearch/hermes-function-calling-v1 (aproximadamente 2.000 bloques de dos tensores de expertos FFN) procedente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF. Sobre esa mezcla aplicó el algoritmo Genesis, que describe como una "cirugía numérica" sobre los bytes del archivo: escaneo y reequilibrado de tensores ssm_conv1d mediante SVD personalizada, reducción de ruido de entrenamiento en tensores (excluyendo token_embd.weight, output.weight, ffn_gate_inp_shexp.weight, tensores 1D, bias y normas) y sustitución de bloques a cero por fragmentos compatibles con la distribución de pesos. No se documentan en la información disponible el volumen de tokens de preentrenamiento del modelo base, la composición del dataset original ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo, gracias a los 262.144 tokens nativos.
- Razonamiento y seguimiento de instrucciones, con énfasis declarado en estabilidad y menor verbosidad tras el procesado Genesis.
- Capacidades multimodales nativas: entrada de imagen y vídeo además de texto (pipeline image-text-to-text).
- Soporte de tool calling y function calling, reforzado por el ajuste fino sobre hermes-function-calling-v1.
- Uso como agente en flujos multi-paso, con plantilla de chat específica compatible con el formato Qwen.
- Multilingüismo amplio: la model card declara 201 idiomas, con inglés y chino como idiomas principales etiquetados.
- Modo sin censura: el modelo no incorpora los filtros de rechazo habituales, lo que permite respuestas directas en dominios restringidos por otros modelos.
- Compatibilidad con decodificación multi-token (MTP) y extensión de contexto mediante YaRN.
- Ejecución en runtimes GGUF estándar: llama.cpp, LM Studio, koboldcpp y otros compatibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 262K tokens, adecuada para hilos de soporte largos o bases de conocimiento inyectadas en contexto.
- Generación de código en producción: el soporte de tool calling y el ajuste sobre hermes-function-calling-v1 permiten integrarlo en pipelines de CI/CD como asistente que invoca herramientas, consulta APIs o genera parches.
- Agentes autónomos multi-paso: la combinación de contexto largo, function calling y MTP lo hace apto para orquestación de tareas con varias llamadas encadenadas, por ejemplo automatización de investigación o gestión de incidencias.
- Análisis de documentos e imágenes: al ser multimodal nativo, puede procesar capturas, diagramas o fotogramas de vídeo junto con texto para tareas de extracción de información o descripción de contenido.
- Asistencia a la investigación sin restricciones: investigadores que necesitan explorar respuestas sin las negativas de seguridad de modelos alineados pueden usarlo en entornos controlados, asumiendo la responsabilidad del filtrado posterior.
- Despliegue local en estaciones de trabajo: con cuantización MXFP4 y una RTX 3060 de 12 GB se obtienen, según el autor, 35-47 tokens por segundo, lo que permite prototipado y uso personal sin infraestructura cloud.
- Procesamiento multilingüe: con 201 idiomas declarados, sirve para traducción, resumen o atención en idiomas distintos del inglés, aunque la calidad fuera de en/zh no está verificada públicamente.
- Generación de contenido creativo y roleplay: el carácter uncensored y la temperatura recomendada de 0,7 con top-p 0,8-0,99 encajan con narrativa y personajes sin restricciones temáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta una cifra de rendimiento de inferencia (35-47 tokens por segundo en una RTX 3060 de 12 GB con cuantización MXFP4 y la configuración de LM Studio indicada), sin datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 58,4 GB, pero las cuantizaciones individuales varían; el cuantizado MXFP4 está pensado para ejecutarse con parte de los expertos MoE en CPU.
- GPU de consumo: el autor valida explícitamente una RTX 3060 de 12 GB con GPU offload máximo, MoE Expert Cache de 6.500 MiB y capas MoE forzadas a CPU.
- GPU profesionales: para ejecución íntegra en GPU se necesitan tarjetas con suficiente VRAM para el cuantizado elegido; no se dispone de cifras concretas por modelo (A100, H100, RTX 4090) en la información proporcionada.
- Configuración recomendada (LM Studio): caché K y V en Q8_0 o F16, contexto de 65.536 tokens, semilla 42 o 0.
- Runtimes compatibles: llama.cpp, LM Studio, koboldcpp y otros motores que lean GGUF.
- Throughput declarado: 35-47 tokens por segundo en RTX 3060 12 GB con MXFP4; no hay datos de latencia para otras GPU.
- Parámetros de muestreo recomendados: temperatura 0,7, top-k 20, top-p 0,8 o 0,99, min-p 0,01, sin presence ni repeat penalty.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored-GGUF | ~34,66B | ~3B | 262K (1M con YaRN) | Apache 2.0 | GGUF | Multimodal, uncensored, tool calling; sin benchmarks públicos |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B | ~3B | No disponible en la información | No disponible | Safetensors | Modelo base directo, sin el procesado Genesis |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B | ~3B | No disponible en la información | No disponible | GGUF | Ajuste fino sobre Hermes; fuente de los datos transferidos |
| Qwen3.6-35B-A3B (familia original) | ~35B | ~3B | 262K (según specs declaradas) | No disponible en la información | Safetensors | Referencia de arquitectura; variante alineada, no uncensored |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: las mejoras atribuidas al algoritmo Genesis (menos ruido, mayor estabilidad, mejor seguimiento de instrucciones) son afirmaciones del autor sin validación independiente.
- Riesgo de alucinación: al ser un modelo sin censura y sin evaluaciones publicadas, no hay evidencia cuantitativa sobre su tasa de alucinación; la propia model card reconoce que el ruido de entrenamiento la incrementa en modelos no tratados.
- Contenido sin filtrar: la variante "uncensored" no incorpora rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado; el operador debe implementar sus propios filtros en producción.
- Idiomas: aunque se declaran 201 idiomas, solo inglés y chino están etiquetados como principales; la calidad en castellano no está verificada.
- Contexto: los 262K tokens son nativos, pero la extensión a 1M requiere YaRN y no hay datos sobre degradación de calidad en ventanas extremas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ajuste fino de origen deben verificarse por separado; la información disponible no detalla las condiciones de esas capas intermedias.
- Procedencia del procesado: el algoritmo Genesis se describe de forma cualitativa, sin paper revisado por pares ni código reproducible en la información disponible (se cita el arXiv 2605.29843 sin más detalle).
- Configuración sensible: el rendimiento declarado depende de una configuración muy concreta de LM Studio (caché MoE, offload, cuantización de caché K/V); desviarse de ella puede degradar velocidad y estabilidad.
- Mantenimiento: el autor anuncia la pausa del desarrollo de LLM para texto, lo que reduce la probabilidad de actualizaciones o correcciones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ajuste fino de origen (Hermes): https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Plantilla de chat recomendada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/archive/qwen3.6/chat_template-v19.jinja
- System prompt sugerido: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/System_Prompt.txt
- Discord del proyecto: https://discord.gg/SZ5vacTXYf
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Referencia arXiv citada en los tags: arxiv:2605.29843 (sin enlace directo en la información disponible)
