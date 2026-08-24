# aniruddh123464/Trading-Strategy-Auditor-3B-Merged

## Resumen

Trading-Strategy-Auditor-3B-Merged es un modelo de lenguaje de 3 000 millones de parámetros creado mediante la fusión de dos modelos de la familia Qwen 2.5: Qwen/Qwen2.5-3B-Instruct y Qwen/Qwen2.5-Coder-3B-Instruct. El autor, aniruddh123464, lo ha construido con la herramienta mergekit empleando el método TIES (TrIm, Elect Sign and Merge, arxiv:2306.01708), tomando como base el modelo instructivo y añadiendo el modelo de código con un peso mayor (0,6 frente a 0,4). El nombre sugiere una orientación hacia la auditoría de estrategias de trading, aunque no existe documentación oficial que confirme esta finalidad. Se trata de un modelo de generación de texto puro, sin capacidades multimodales, y su relevancia radica en combinar las habilidades conversacionales del modelo instructivo con las competencias de generación de código del modelo coder, todo ello en un tamaño compacto de 3B parámetros. El repositorio no presenta descargas ni valoraciones, lo que indica que es un experimento reciente sin adopción verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Transformer decoder-only) |
| Parametros totales | 3 085 938 688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los modelos base Qwen2.5 soportan 32 768 tokens, pero no se especifica para este merge) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en bfloat16) |
| Idiomas soportados | no disponible (los modelos base soportan múltiples idiomas, pero no se documenta para este merge) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión mediante el método TIES, que combina los parámetros de dos modelos preentrenados. La configuración YAML indica que se parte de Qwen/Qwen2.5-3B-Instruct como base y se integra Qwen/Qwen2.5-Coder-3B-Instruct con una densidad del 50 % y un peso de 0,6, mientras que el modelo base recibe un peso de 0,4. El proceso de fusión se realiza capa por capa (layer_range [0, 36]) y normaliza los parámetros resultantes. No se ha realizado ningún entrenamiento adicional, fine-tuning ni alineación posterior a la fusión. Los modelos originales Qwen2.5-3B-Instruct y Qwen2.5-Coder-3B-Instruct fueron entrenados por Alibaba Cloud con datos masivos en múltiples idiomas y con técnicas de instrucción y RLHF, pero esos detalles no se trasladan automáticamente al modelo fusionado. La fusión TIES busca conservar los signos de los parámetros más relevantes de cada modelo, eliminando redundancias y conflictos, lo que en teoría permite mantener las capacidades de ambos en un único conjunto de pesos.

## Capacidades

No se dispone de documentación oficial sobre las capacidades específicas de este modelo fusionado. Basándose en los modelos base, se puede esperar que herede parcialmente las siguientes habilidades, aunque sin verificación empírica:

- Generación de texto conversacional e instructivo (procedente de Qwen2.5-3B-Instruct).
- Generación y comprensión de código en múltiples lenguajes de programación (procedente de Qwen2.5-Coder-3B-Instruct).
- Razonamiento matemático y lógico básico, propio de la familia Qwen2.5.
- Soporte de tool calling y function calling, presente en los modelos instructivos de Qwen2.5.
- Capacidad multilingüe limitada, heredada de los modelos base, aunque no se ha evaluado en este merge.

No se ha confirmado ninguna capacidad especial adicional (vision, audio, thinking mode, etc.).

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su nombre y la combinación de modelos base, se podrían plantear aplicaciones hipotéticas como:

- Auditoría de estrategias de trading: el modelo podría analizar descripciones de estrategias algorítmicas y detectar posibles fallos lógicos o de riesgo, aunque no hay evidencia de que funcione correctamente para esta tarea.
- Generación de código de análisis financiero: podría asistir en la creación de scripts de backtesting o indicadores técnicos, aprovechando la componente coder.
- Asistente conversacional para documentación técnica: combinando instrucción y código, podría redactar explicaciones de fragmentos de código o generar documentación.

Sin embargo, al no existir benchmarks ni pruebas de uso real, estos casos son especulativos y no deben considerarse recomendaciones verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se han encontrado comparativas con otros modelos en la web. Por tanto, no es posible valorar su rendimiento cuantitativo.

## Requisitos de hardware

No se proporcionan requisitos oficiales. A partir del tamaño del modelo (3,09 mil millones de parámetros) y el formato bfloat16, se puede estimar:

- VRAM necesaria para inferencia en bfloat16: aproximadamente 6,2 GB (3,09B × 2 bytes), más overhead de activaciones y KV cache, lo que podría requerir entre 8 y 12 GB según la longitud de contexto.
- Con cuantización a 8 bits (INT8) se reduciría a unos 3,5 GB, y a 4 bits (INT4) a unos 2 GB, aunque no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, etc.) podrían ejecutarlo con cuantización ligera; para bfloat16 completo se necesitaría una GPU con 12 GB o más (RTX 3080, RTX 4070 Ti, etc.).
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento, la comparativa se limita a aspectos estructurales con los modelos base y otras alternativas de 3B:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Trading-Strategy-Auditor-3B-Merged | 3,09B | no disponible | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09B | 32 768 | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama-3.2-3B-Instruct | 3,21B | 128 000 | Llama 3.2 Community | HuggingFace, ampliamente usado |

El modelo fusionado no ofrece ventajas claras sobre sus componentes originales, ya que carece de documentación y validación. Los modelos base tienen licencia Apache 2.0, pero la licencia del merge no está especificada, lo que introduce incertidumbre legal.

## Limitaciones y advertencias

- No existe documentación técnica ni model card detallada más allá de la configuración de fusión.
- El modelo no ha sido evaluado en ninguna tarea; su comportamiento es impredecible y puede presentar inconsistencias propias de los merges automáticos.
- La licencia no está declarada, lo que impide su uso comercial sin consultar al autor.
- Al ser un merge sin fine-tuning posterior, puede heredar sesgos de los modelos base, pero no se ha realizado ningún análisis de sesgos.
- Riesgo de alucinación elevado, especialmente en dominios especializados como el trading, donde no se ha verificado su precisión.
- No se garantiza la calidad de la generación de código ni la corrección de las estrategias analizadas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aniruddh123464/Trading-Strategy-Auditor-3B-Merged
- Paper del método TIES: https://arxiv.org/abs/2306.01708
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Herramienta mergekit: https://github.com/cg123/mergekit
