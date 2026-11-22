# reaperdoesntknow/Symiotic-14B

## Resumen

Symiotic-14B es un fine-tune del modelo Qwen3-14B publicado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC (Research Division). Se presenta como un híbrido simbólico-transformer con memoria persistente, aunque los pesos publicados en safetensors corresponden a un transformer denso de 14.768.307.200 parámetros, es decir, la arquitectura base de Qwen3-14B. La model card describe módulos simbólicos adicionales (ThoughtDynamicsLNN, LiquidThoughtProcessor, CrystallineProcessor, HelicalDNAProcessor) y un banco de memoria de 4096 estados, pero el propio autor advierte que las capacidades descritas reflejan la intención arquitectónica y no resultados medidos con benchmarks.

El modelo se entrenó sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de chain-of-thought centrado en cálculo avanzado, y declara soporte únicamente para inglés. Su relevancia actual es limitada pero ilustrativa: representa una línea de experimentación que combina un transformer de gran escala con estructuras simbólicas y memoria externa, un enfoque que otros proyectos abordan con arquitecturas híbridas más consolidadas. La licencia AFL-3.0 permite uso comercial con obligaciones de atribución y reciprocidad.

Es importante señalar la discrepancia entre la model card (que menciona 17.800 millones de parámetros) y el recuento real de safetensors (14.770 millones), así como la falta de resultados de benchmarks publicados, lo que obliga a tratar las afirmaciones de capacidad con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con módulos simbólicos declarados en la model card; no verificable en los pesos publicados |
| Parametros totales | 14.768.307.200 (según safetensors); la model card declara 17.800 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-14B soporta 32.768 tokens nativos, ampliable; el fine-tune no especifica cambios) |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ ni GPTQ en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, model.bin (PyTorch), memory.pt (banco de memoria simbólica) |

## Arquitectura y entrenamiento

La base es el transformer Qwen3-14B, con rotary embeddings y FlashAttention según la model card. Sobre esa base, el autor declara una capa simbólica de dimensión 8192 con varios procesadores especializados: ThoughtDynamicsLNN (atención LSTM multi-cabeza), LiquidThoughtProcessor, CrystallineProcessor (GNN con DNAConv) y HelicalDNAProcessor (codificación helicoidal lineal). También se describe un router basado en clasificador de intención y compuerta de entropía que selecciona la ruta de procesamiento, y un banco de memoria de 4096 estados en FP32 recuperados por similitud contextual y entropía. No se detalla cuántos de estos módulos están efectivamente presentes en los pesos publicados ni cómo se integran en el grafo de cómputo de Transformers.

El entrenamiento se realizó como fine-tune sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de chain-of-thought de cálculo avanzado. No se especifica el número de tokens, la composición completa del dataset, ni si hubo etapas de RLHF o DPO. La model card menciona un "Dream Mode" de simulación simbólica en segundo plano y fundamentos matemáticos basados en "Discrepancy Calculus (DISC)", pero no se aportan detalles reproducibles sobre el procedimiento de entrenamiento ni sobre la inicialización de los módulos simbólicos.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3-14B.
- Generación de cadenas de pensamiento (chain-of-thought) orientadas a cálculo avanzado, por el dataset de entrenamiento.
- Soporte declarado de memoria persistente mediante un banco de 4096 estados simbólicos (memory.pt), con recuperación por entropía y similitud contextual.
- Router de intención con compuerta de entropía para seleccionar rutas de procesamiento simbólico (según model card, no verificado).
- Tokens especiales simbólicos como `<D_LIM>`, `<PROOF>` y `<BY_MEASURE>` para estructurar salidas matemáticas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: la model card lo orienta a agentes conversacionales con memoria, pero sin especificaciones de integración.
- Modo thinking: no documentado explícitamente para este fine-tune.

## Casos de uso

- Asistente de cálculo avanzado: el modelo puede generar demostraciones paso a paso y usar los tokens simbólicos (`<PROOF>`, `<D_LIM>`) para estructurar la salida; es adecuado por el dataset CoT de cálculo sobre el que se entrenó, aunque requiere validación humana.
- Prototipado de agentes con memoria externa: el banco memory.pt permite experimentar con recuperación de estados simbólicos en conversaciones largas; útil en investigación sobre memoria persistente, no en producción sin evaluación previa.
- Generación de explicaciones matemáticas para material docente: el modelo puede redactar razonamientos detallados en inglés sobre límites, integrales y demostraciones, aprovechando su especialización en cálculo.
- Investigación en arquitecturas híbridas simbólico-neural: sirve como checkpoint de referencia para comparar con otros enfoques de memoria y routing simbólico, dado que el autor publica la familia SymbioticAI completa.
- Generación de código con componente matemático: puede asistir en la traducción de formulaciones matemáticas a código, aunque sin garantías de tool calling ni de integración en pipelines.
- Experimentación con decodificación y tokens especiales: los added_tokens permiten diseñar flujos de post-procesado que detecten y extraigan bloques de prueba o medidas, útil en investigación de parsing estructurado.
- Fine-tuning posterior sobre dominios científicos: al partir de Qwen3-14B y estar especializado en CoT matemático, es un punto de partida razonable para ajustes en física o ingeniería, siempre que se valide el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas, y advierte explícitamente que las capacidades descritas son intención arquitectónica y no resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29-30 GB solo para pesos, más overhead de activaciones y del banco de memoria en FP32 (4096 vectores de dimensión 8192, unos 128 MB adicionales), por lo que se recomienda al menos 40 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB; en 4 bits, en torno a 8-9 GB (estimaciones teóricas, no hay versiones cuantizadas publicadas).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para FP16; RTX 4090 (24 GB) solo con cuantización de 8 bits o inferior.
- Compatibilidad con GPU de consumo: posible en RTX 3090/4090 con cuantización, pero no hay GGUF ni AWQ publicados en la información disponible, lo que limita el despliegue directo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; no se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symiotic-14B | 14.770 M | No disponible | AFL-3.0 | Hugging Face, transformers | Fine-tune de Qwen3-14B con módulos simbólicos declarados; sin benchmarks |
| Qwen3-14B (base) | 14.770 M | 32.768 tokens nativos | Apache 2.0 | Hugging Face, amplio ecosistema | Modelo base oficial, benchmarks publicados, cuantizaciones disponibles |
| Qwen2.5-14B-Instruct | 14.770 M | 32.768 tokens (128K con RoPE) | Apache 2.0 | Hugging Face, GGUF, vLLM | Alternativa consolidada para instrucciones y tool calling |
| Mistral-Nemo-12B | 12.000 M | 128.000 tokens | Apache 2.0 | Hugging Face, GGUF, vLLM | Menor tamaño, contexto mayor, licencia permisiva |

## Limitaciones y advertencias

- Discrepancia entre los 17.800 millones declarados en la model card y los 14.770 millones reales en safetensors; conviene verificar la integridad de los pesos antes de usarlos.
- Ausencia total de benchmarks: no hay evidencia medida de que los módulos simbólicos aporten mejoras sobre Qwen3-14B.
- La model card advierte que el razonamiento simbólico no está ajustado para QA general, por lo que el rendimiento en tareas conversacionales puede degradarse respecto al base.
- La memoria persistente requiere curación y siembra manual para ser útil; no funciona como memoria automática lista para producción.
- FlashAttention y los módulos simbólicos incrementan el uso de VRAM durante la generación, según el propio autor.
- Sesgos conocidos: no documentados, pero hereda los sesgos del corpus de Qwen3-14B y del dataset de cálculo, con posible sesgo hacia dominios matemáticos.
- Riesgo de alucinación: alto en dominios fuera del cálculo y en la generación de demostraciones, dado el ajuste estrecho y la falta de evaluación.
- Limitación idiomática: solo inglés declarado, lo que excluye uso en castellano sin evaluación adicional.
- Licencia AFL-3.0: permite uso comercial, pero impone obligaciones de atribución y reciprocidad sobre modificaciones; revisar compatibilidad con el despliegue previsto.
- Proyecto de investigación de un autor individual: sin garantías de mantenimiento, soporte ni actualizaciones.
- No hay versiones cuantizadas publicadas, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Colección SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-a-collection-of-symbolic-transformers-for-th-681a7f98b5e2397d10192c9a
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Metodología "Structure Over Scale": https://doi.org/10.57967/hf/8165
