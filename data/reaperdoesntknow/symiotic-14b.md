# reaperdoesntknow/Symiotic-14B

## Resumen

Symiotic-14B (publicado como SymbioticLM-14B) es un checkpoint experimental derivado de Qwen/Qwen3-14B, desarrollado por el usuario reaperdoesntknow bajo la marca Convergent Intelligence LLC. Se presenta como un híbrido simbólico-transformer que añade al backbone de Qwen3-14B una capa de memoria persistente de 4096 estados simbólicos en FP32 y varios módulos procesadores simbólicos (ThoughtDynamicsLNN, LiquidThoughtProcessor, CrystallineProcessor, HelicalDNAProcessor). El modelo tiene 14.768.307.200 parámetros reales según los pesos en safetensors, aunque la model card declara 17,8 mil millones, cifra que no se corresponde con el recuento de tensores.

El modelo está pensado para razonamiento cognitivo de varios pasos, generación simbólica de teoremas y demostraciones, y agentes conversacionales con memoria persistente. La model card es explícita al señalar que se trata de un checkpoint de investigación experimental y que las capacidades descritas reflejan la intención arquitectónica, no resultados medidos en benchmarks. Está publicado bajo licencia AFL-3.0, solo en inglés, y acumula unas 3065 descargas y 13 likes en Hugging Face.

Su relevancia actual es limitada pero interesante como artefacto de investigación: explora la hibridación entre representación neuronal continua y estructuras simbólicas discretas con memoria externa, un área activa en el diseño de agentes con memoria a largo plazo. No obstante, la ausencia de evaluaciones publicadas y las advertencias del propio autor obligan a tratarlo como material de estudio, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-14B) con módulos simbólicos adicionales y memoria persistente |
| Parametros totales | 14.768.307.200 (según safetensors); la model card declara 17,8 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B, no confirmada en la información) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors y model.bin) |
| Idiomas soportados | en (inglés) |
| Licencia | afl-3.0 |
| Formato de pesos | safetensors, model.bin, memory.pt (banco de 4096 vectores simbólicos en FP32) |

## Arquitectura y entrenamiento

El backbone es el transformer Qwen3-14B con rotary embeddings y FlashAttention. Sobre él se añaden cuatro módulos simbólicos: ThoughtDynamicsLNN (atención LSTM multi-cabeza), LiquidThoughtProcessor, CrystallineProcessor (GNN con convolución tipo DNAConv) y HelicalDNAProcessor (codificación helicoidal lineal). La dimensión simbólica es de 8192. La memoria persistente consta de 4096 estados simbólicos almacenados en FP32, recuperados mediante una combinación de entropía y similitud contextual. Un router basado en clasificador de intención y compuerta de entropía selecciona la ruta de procesadores adecuada en cada paso.

El modelo incorpora un modo "Dream" de simulación simbólica en segundo plano para cognición abierta, y un tokenizador extendido con etiquetas especiales como `<D_LIM>`, `<PROOF>` o `<BY_MEASURE>`. El dataset declarado es 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de chain-of-thought sobre cálculo avanzado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO. La model card enmarca el diseño en una teoría propia denominada Discrepancy Calculus (DISC), con un operador de discrepancia y una noción de energía de discrepancia usada como criterio de estabilidad de la memoria, pero no aporta detalles de implementación verificables.

## Capacidades

- Generación de texto y razonamiento de varios pasos sobre el backbone Qwen3-14B.
- Generación simbólica de teoremas y planificación de demostraciones, con etiquetas especiales para límites, pruebas y medidas.
- Memoria persistente de 4096 estados simbólicos con recuperación por entropía y similitud contextual.
- Enrutamiento multi-etapa entre procesadores simbólicos según intención y entropía.
- Modo "Dream" de simulación simbólica en segundo plano.
- Razonamiento en dominios difusos, discontinuos o no suaves, según la intención declarada por el autor.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en híbridos simbólico-neuronales: el modelo sirve como banco de pruebas para estudiar cómo interactúan módulos simbólicos con un transformer base y si la memoria persistente aporta ventajas medibles en tareas de razonamiento.
- Generación de borradores de demostraciones matemáticas: las etiquetas `<PROOF>`, `<D_LIM>` y `<BY_MEASURE>` permiten estructurar la salida en pasos de demostración, útil como asistente de exploración para matemáticos que revisen y validen manualmente.
- Agentes conversacionales con memoria a largo plazo: el banco de 4096 estados permite mantener contexto entre sesiones, adecuado para prototipos de asistentes de investigación que necesiten recordar hechos previos.
- Simulación de razonamiento en dominios no suaves: para problemas de optimización con discontinuidades o funciones no derivables, donde el autor declara intención de uso específica.
- Estudio de enrutamiento por entropía: el router intención+entropía es un objeto de estudio interesante para quienes investigan mecanismos de selección de expertos o rutas computacionales.
- Docencia y divulgación: como ejemplo práctico de arquitectura híbrida con memoria externa en cursos de IA, siempre con las advertencias de que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que las capacidades descritas reflejan la intención arquitectónica y no resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 29,5 GB solo para pesos (14,77 B parámetros × 2 bytes), más el banco de memoria de 4096 × 8192 × 4 bytes (unos 134 MB) y el overhead de los módulos simbólicos y de FlashAttention.
- En cuantización de 8 bits: en torno a 15 GB; en 4 bits: en torno a 8 GB. No se distribuyen pesos cuantizados oficiales, por lo que habría que cuantizar localmente.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 6000 Ada para FP16 sin compromisos. Una RTX 4090 (24 GB) no cabe en FP16 y requeriría cuantización a 8 o 4 bits.
- Consumer GPU: posible en RTX 3090/4090 solo con cuantización agresiva y asumiendo que los módulos simbólicos personalizados pueden no ser compatibles con los runners de cuantización estándar.
- Opciones de despliegue: transformers con el código personalizado del repositorio (memory.pt y módulos simbólicos requieren cargar la implementación del autor); text-generation-inference aparece en los tags, pero la compatibilidad real con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symiotic-14B | 14,77 B | no disponible | AFL-3.0 | Hugging Face, pesos safetensors + módulos simbólicos | Híbrido experimental, sin benchmarks |
| Qwen/Qwen3-14B (base) | 14,77 B | no disponible en esta ficha | Apache-2.0 (según el modelo base original) | Hugging Face, ampliamente soportado | Modelo de referencia, con evaluaciones publicadas por el autor original |
| Symbiotic-8B (misma familia) | ~8 B (no confirmado) | no disponible | no disponible | Hugging Face | Variante menor de la misma serie simbólica |
| Symbiotic-1B (misma familia) | ~1 B (no confirmado) | no disponible | no disponible | Hugging Face | Variante pequeña para pruebas |

La comparación con modelos de la misma categoría (híbridos simbólico-neuronales con memoria) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental: el propio autor advierte que las capacidades descritas son intención arquitectónica, no resultados medidos. No debe usarse en producción sin validación propia.
- Discrepancia en el recuento de parámetros: la model card declara 17,8 B pero safetensors reporta 14,77 B. Conviene verificar la carga real antes de dimensionar hardware.
- Memoria que requiere curación: el banco de 4096 estados necesita sembrarse y mantenerse para ser útil; sin curación, la memoria persistente aporta poco.
- No está ajustado por instrucciones para QA general: el autor indica que la cognición simbólica no está instruction-tuned para preguntas y respuestas generales.
- Solo inglés: no hay soporte multilingüe declarado.
- Mayor consumo de VRAM: FlashAttention y los módulos simbólicos incrementan el uso de memoria durante la generación.
- Riesgo de alucinación: al no haber evaluaciones publicadas, no se puede acotar la tasa de alucinación; en tareas de demostración matemática el riesgo es especialmente relevante.
- Compatibilidad de despliegue incierta: los módulos personalizados y memory.pt pueden no funcionar con runners estándar (vLLM, llama.cpp, Ollama) sin adaptación.
- Licencia AFL-3.0: permite uso comercial con obligaciones de atribución y de compartir modificaciones bajo la misma licencia; conviene revisar los términos antes de integrarlo en productos.
- Sesgos: no hay información publicada sobre sesgos del modelo ni del dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset declarado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Colección SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-a-collection-of-symbolic-transformers-for-th-681a7f98b5e2397d10192c9a
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Metodología "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
