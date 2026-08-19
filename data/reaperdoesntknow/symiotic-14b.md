# reaperdoesntknow/Symiotic-14B

## Resumen

SymbioticLM-14B es un modelo de investigación experimental desarrollado por Convergent Intelligence LLC (usuario reaperdoesntknow) que combina un transformer Qwen3-14B con módulos de cognición simbólica. Según la model card, se trata de un híbrido simbólico–transformer con memoria persistente, diseñado para razonamiento avanzado, generación de teoremas y procesamiento de dominios matemáticos no suaves. El modelo incorpora una memoria simbólica de 4096 estados, un router con gating por entropía y varios procesadores especializados (LSTM attention, GNN, codificación helicoidal).

Aunque la model card declara 17.8 mil millones de parámetros totales, los pesos safetensors del transformer base suman 14.768.307.200 parámetros (14,77B), lo que coincide con el tamaño de Qwen3-14B. Los módulos simbólicos adicionales probablemente añaden parámetros fuera de los safetensors. El modelo se entrenó sobre un dataset de cálculo avanzado con chain-of-thought (0xZee/dataset-CoT-Advanced-Calculus-268) y se distribuye bajo licencia AFL-3.0.

Es relevante porque representa un enfoque poco común: acoplar un LLM denso con estructuras simbólicas explícitas y memoria persistente, en lugar de depender únicamente de escalado de parámetros. Sin embargo, el propio autor advierte que las capacidades declaradas describen intención arquitectónica, no resultados evaluados, y que el modelo no está ajustado por instrucciones para QA general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido simbólico–transformer sobre Qwen3-14B (backbone transformer con rotary embeddings + FlashAttention, más módulos simbólicos: ThoughtDynamicsLNN, LiquidThoughtProcessor, CrystallineProcessor, HelicalDNAProcessor, memoria simbólica de 4096 estados, router con entropía) |
| Parametros totales | 14.768.307.200 (pesos safetensors del transformer); la model card declara 17,8B incluyendo módulos simbólicos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el base Qwen3-14B soporta 32K nativos; no se especifica si se amplió) |
| Tipos de cuantizacion | No oficiales; disponibles GGUF de terceros (p. ej. mradermacher/Symiotic-14B-i1-GGUF) y cuantización FP4/FP8/INT4 vía FriendliAI |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, model.bin (PyTorch), GGUF (terceros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B como backbone transformer, al que se añaden varios módulos simbólicos externos. Según la model card, estos incluyen ThoughtDynamicsLNN (una red LSTM con atención multi-cabeza), LiquidThoughtProcessor, CrystallineProcessor (basado en DNAConv GNN) y HelicalDNAProcessor (codificación helicoidal lineal). Además, incorpora un banco de memoria simbólica de 4096 estados en FP32, recuperados mediante entropía y similitud contextual, y un modo "Dream Mode" que ejecuta simulaciones simbólicas en segundo plano. Un router clasifica la intención y aplica gating por entropía para seleccionar la ruta de procesamiento.

El entrenamiento se realizó sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, que contiene cadenas de razonamiento para cálculo avanzado. No se mencionan técnicas de RLHF o DPO en la información disponible. La model card cita la "Discrepancy Calculus" (DISC) como fundamento matemático, donde el operador de discrepancia D se usa para medir la brecha entre representación simbólica discreta y representación continua del transformer. El modelo se presenta como un checkpoint de investigación, no como un producto final pulido.

## Capacidades

- Razonamiento simbólico y generación de teoremas: puede producir demostraciones formales y planificar pruebas largas, según la model card.
- Memoria persistente: mantiene un banco de 4096 estados simbólicos que se recuperan por entropía y similitud contextual, permitiendo conversaciones multi-turno con memoria a largo plazo.
- Procesamiento de dominios matemáticos no suaves: diseñado para razonar sobre funciones discontinuas, fuzzy o no diferenciables.
- Generación de código y síntesis matemática: el autor menciona "math/code synthesis" como caso de uso previsto.
- Multi-step reasoning con routing simbólico: el router clasifica la intención y selecciona procesadores especializados según la tarea.
- Modo Dream Mode: simulación simbólica en segundo plano para cognición abierta (aunque no se detalla su funcionamiento práctico).
- No está ajustado por instrucciones para QA general: la model card advierte explícitamente que "symbolic cognition is not instruction-tuned for general QA".

## Casos de uso

- Asistentes de investigación matemática: el modelo puede ayudar a explorar demostraciones de teoremas, verificar pasos de cálculo simbólico y generar conjeturas en dominios como cálculo avanzado o análisis funcional, gracias a su entrenamiento específico en chain-of-thought de cálculo.
- Agentes conversacionales con memoria persistente: su banco de 4096 estados simbólicos permite mantener contexto a largo plazo entre sesiones, útil para aplicaciones donde el agente debe recordar preferencias o hechos del usuario durante días o semanas.
- Generación de código científico: puede sintetizar código para métodos numéricos o simbólicos (por ejemplo, implementaciones de algoritmos de integración o diferenciación automática), aprovechando el backbone Qwen3-14B que ya tiene capacidades de código.
- Razonamiento en dominios no suaves: tareas que involucran funciones discontinuas, optimización no convexa o problemas con restricciones irregulares, donde el enfoque simbólico podría ofrecer ventajas frente a modelos puramente neuronales.
- Prototipado de arquitecturas híbridas simbólico-neuronales: investigadores que estudian la integración de memoria explícita y razonamiento simbólico pueden usar este modelo como referencia o punto de partida para sus propios experimentos.
- Análisis de textos matemáticos: resumir o extraer estructuras lógicas de documentos científicos, aunque limitado al inglés y sin ajuste fino para QA general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las afirmaciones de capacidades describen "intención arquitectónica, no resultados evaluados". No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. El autor recomienda tratar el modelo como un checkpoint experimental, no como un sistema listo para producción.

## Requisitos de hardware

No hay requisitos oficiales publicados. Basándose en el tamaño del transformer base (14,77B parámetros) y en el hecho de que los módulos simbólicos y FlashAttention aumentan el uso de VRAM durante generación (según la model card), se pueden estimar los siguientes requisitos orientativos:

- Inferencia en FP16: aproximadamente 28-30 GB de VRAM solo para los pesos del transformer; los módulos simbólicos y la memoria de 4096 estados en FP32 añadirán varios GB adicionales. Se recomienda una GPU con al menos 40 GB (A100 40GB, A6000) o 80 GB (A100 80GB, H100).
- Inferencia en 8 bits (INT8): alrededor de 14-16 GB de VRAM para los pesos, más overhead de módulos simbólicos. Podría caber en una RTX 4090 (24 GB) con margen limitado.
- Inferencia en 4 bits (INT4): aproximadamente 8-10 GB de VRAM para los pesos, más overhead. Podría ejecutarse en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) si los módulos simbólicos no exceden la memoria disponible.
- Opciones de despliegue: el modelo es compatible con HuggingFace Transformers y text-generation-inference (TGI). También hay cuantizaciones GGUF de terceros para su uso con llama.cpp u Ollama, y FriendliAI ofrece inferencia con cuantización FP4/FP8/INT4.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño y la complejidad adicional de los módulos simbólicos, se espera una latencia mayor que la de un Qwen3-14B estándar, especialmente en generación larga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Symbiotic-14B (este) | 14,77B (transformer) + módulos simbólicos | No disponible (base 32K) | AFL-3.0 | Híbrido simbólico-transformer con memoria persistente | HuggingFace, GGUF terceros |
| Qwen3-14B (base) | 14,77B | 32K (hasta 131K con YaRN) | Apache 2.0 | Transformer denso estándar | HuggingFace, Ollama, vLLM |
| Symbiotic-8B | 8B (estimado) | No disponible | AFL-3.0 | Mismo enfoque híbrido, menor tamaño | HuggingFace |

El Qwen3-14B base es la referencia natural: mismo backbone, pero sin módulos simbólicos, con licencia Apache 2.0 (más permisiva) y un ecosistema de despliegue mucho más maduro. Symbiotic-14B añade complejidad arquitectónica pero carece de benchmarks que demuestren una ventaja real. El Symbiotic-8B, del mismo autor, permite comparar el efecto del escalado dentro de la misma familia.

## Limitaciones y advertencias

- Checkpoint experimental: la model card advierte que las capacidades declaradas describen intención arquitectónica, no resultados validados. No debe usarse en producción sin una evaluación exhaustiva propia.
- No ajustado por instrucciones: no está instruction-tuned para QA general; puede producir respuestas incoherentes o irrelevantes fuera de dominios simbólicos o matemáticos.
- Memoria requiere curaduría: el banco de memoria simbólica necesita ser sembrado y curado manualmente para obtener utilidad máxima; sin ello, la memoria puede degradar el rendimiento.
- Alto consumo de VRAM: FlashAttention y los módulos simbólicos incrementan el uso de memoria durante generación, lo que limita su despliegue en GPUs consumer.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inventado, especialmente en dominios no entrenados. La ausencia de benchmarks impide cuantificar este riesgo.
- Sesgos del modelo base: al derivar de Qwen3-14B, hereda posibles sesgos lingüísticos y culturales de ese modelo, aunque el uso previsto es principalmente técnico.
- Licencia AFL-3.0: permite uso comercial con atribución y sin garantías, pero es menos conocida que Apache 2.0; conviene revisar sus cláusulas antes de integrarlo en productos comerciales.
- Idiomas limitados: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Documentación escasa: no hay paper técnico revisado por pares, solo una model card con referencias a una teoría propia (Discrepancy Calculus) y un DOI de metodología general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Colección SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-a-collection-of-symbolic-transformers-for-th-681a7f98b5e2397d10192c9a
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Cuantizaciones GGUF de terceros: https://mygguf.com/model?id=mradermacher%2FSymiotic-14B-i1-GGUF
- Inferencia gestionada en FriendliAI: https://friendli.ai/models/reaperdoesntknow/Symiotic-14B
- Metodología "Structure Over Scale" (DOI: 10.57967/hf/8165): https://doi.org/10.57967/hf/8165
- Análisis de seguridad por Protect AI: https://protectai.com/insights/models/reaperdoesntknow/Symiotic-14B/817d3817eca4f1504781ba9f8ef6b46d59a94ef7/overview
