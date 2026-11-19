# reaperdoesntknow/Symiotic-14B

## Resumen

Symiotic-14B es un checkpoint experimental publicado por el usuario `reaperdoesntknow` (Convergent Intelligence LLC, Research Division) que parte del modelo base Qwen/Qwen3-14B y le añade una capa de módulos simbólicos propios: procesadores tipo LSTM multi-cabeza, un procesador "líquido", un procesador convolucional sobre grafo (DNAConv) y un codificador helicoidal, junto con un banco de memoria persistente de 4096 estados simbólicos en FP32. La model card lo describe como un híbrido simbólico-transformer con memoria persistente y "evolución simbólica" orientado a razonamiento cognitivo y generación de teoremas y código.

El modelo real medido en safetensors es de 14.768.307.200 parámetros (unos 14,8 mil millones), aunque la model card afirma 17,8 mil millones; esa discrepancia debe tenerse en cuenta. El repositorio ocupa 74,7 GB e incluye pesos en `model.bin` y `model.safetensors`, el banco de memoria `memory.pt`, tokenizer con tokens simbólicos añadidos (`<D_LIM>`, `<PROOF>`, `<BY_MEASURE>`, etc.) y configuración de generación.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: injertar módulos simbólicos y memoria externa sobre un transformer denso de tamaño medio, con licencia permisiva (AFL-3.0) y compatibilidad con el ecosistema transformers/TGI. No obstante, el propio autor advierte que las capacidades descritas reflejan intención arquitectónica y no resultados medidos con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido simbólico-transformer sobre backbone Qwen3-14B (RoPE + FlashAttention) con módulos simbólicos adicionales (ThoughtDynamicsLNN, LiquidThoughtProcessor, CrystallineProcessor DNAConv GNN, HelicalDNAProcessor) |
| Parametros totales | 14.768.307.200 (según safetensors); la model card declara 17,8 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B, no confirmada en la información) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors/bin; no se listan GGUF ni AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors, bin (PyTorch), memory.pt (banco de memoria) |

## Arquitectura y entrenamiento

El modelo se construye sobre el transformer denso Qwen3-14B, con rotary embeddings y FlashAttention como base. Sobre esa columna vertebral se añaden varios módulos simbólicos: ThoughtDynamicsLNN (atención LSTM multi-cabeza), LiquidThoughtProcessor, CrystallineProcessor basado en DNAConv sobre grafo y HelicalDNAProcessor con codificación helicoidal lineal. La dimensión simbólica declarada es 8192. Además, incorpora un banco de memoria de 4096 estados simbólicos en FP32 recuperados mediante entropía y similitud contextual, un router de intención con compuerta entrópica que selecciona la ruta de procesadores, y un modo "Dream" de simulación simbólica en segundo plano.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a `0xZee/dataset-CoT-Advanced-Calculus-268`), ni si hubo RLHF, DPO o SFT. La model card indica explícitamente que el modelo no está ajustado por instrucciones para QA general y que el checkpoint es experimental. La fundamentación teórica que cita el autor es el "Discrepancy Calculus" (DISC), con un operador de discrepancia y una energía de discrepancia propuesta como criterio de estabilidad para la consolidación de memoria; se trata de material teórico del propio autor, no de validación empírica publicada.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre el backbone Qwen3-14B.
- Memoria persistente de 4096 estados simbólicos con recuperación por entropía y similitud contextual.
- Enrutado simbólico multi-etapa mediante clasificador de intención y compuerta entrópica.
- Generación simbólica orientada a teoremas, pruebas y planificación de demostraciones (según la model card).
- Síntesis de matemáticas y código en dominios discontinuos o no suaves (declarado, no verificado con benchmarks).
- Soporte de tokens especiales simbólicos añadidos al tokenizer (`<D_LIM>`, `<PROOF>`, `<BY_MEASURE>`, etc.).
- Modo "Dream" de simulación simbólica en segundo plano.
- Tool calling / function calling: no disponible en la información.
- Capacidades multimodales (visión, audio): no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Asistentes de razonamiento con memoria a largo plazo: el banco de 4096 estados simbólicos permite conservar contexto entre turnos en agentes conversacionales, aunque requiere curación y sembrado manual para ser útil.
- Generación y planificación de demostraciones matemáticas: el modelo está orientado a producir pasos intermedios con tokens simbólicos dedicados (`<PROOF>`, `<D_LIM>`), lo que facilita el parseo y la validación posterior en pipelines de verificación formal.
- Investigación en híbridos neuro-simbólicos: sirve como banco de pruebas para estudiar cómo interactúan módulos simbólicos (LSTM, GNN, codificación helicoidal) con un transformer denso de 14B.
- Síntesis de código en dominios numéricos o con estructuras discontinuas: el enrutado por entropía puede derivar consultas a procesadores especializados cuando la señal es ambigua.
- Simulación científica y diálogo técnico: útil para explorar razonamiento sobre problemas no suaves donde la representación simbólica explícita aporta estructura.
- Experimentación con memoria externa en producción controlada: al publicarse `memory.pt` de forma separada, es posible sembrar el banco con conocimiento de dominio y medir el impacto antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que las afirmaciones de capacidad describen intención arquitectónica y no resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 30 GB solo para los pesos del transformer de 14,8B; hay que sumar el banco de memoria `memory.pt` (4096 estados en FP32, tamaño exacto no disponible) y los módulos simbólicos adicionales, lo que incrementa el consumo respecto a un Qwen3-14B estándar.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 sin cuantización; L40S 48 GB como mínimo práctico.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; requeriría cuantización, y no se publican pesos GGUF ni AWQ en el repositorio, por lo que habría que generarlos manualmente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados en la información.
- Latencia y throughput: no disponibles. La model card advierte que FlashAttention y los módulos simbólicos aumentan el uso de VRAM durante la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Symiotic-14B | 14,8B (declara 17,8B) | no disponible | AFL-3.0 | en | Híbrido simbólico-transformer con memoria persistente; experimental, sin benchmarks |
| Qwen/Qwen3-14B (base) | 14,8B | no disponible en esta ficha | Apache-2.0 (según el modelo original) | multilingüe | Transformer denso estándar, ampliamente evaluado; referencia directa del fine-tune |
| Symbiotic-8B (misma familia) | ~8B | no disponible | no disponible | en | Variante menor de la serie SymbioticAI; menos VRAM, capacidades simbólicas análogas |
| Symbiotic-1B (misma familia) | ~1B | no disponible | no disponible | en | Versión pequeña para pruebas en CPU/GPU de consumo |

## Limitaciones y advertencias

- Checkpoint experimental: el autor indica que las capacidades descritas son intención arquitectónica, no resultados verificados.
- Discrepancia de parámetros: la model card declara 17,8B pero safetensors reporta 14,77B; conviene verificar antes de dimensionar infraestructura.
- No está ajustado por instrucciones para QA general, según la propia model card.
- La memoria persistente requiere curación y sembrado manual para aportar utilidad real.
- Solo inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Mayor consumo de VRAM que el Qwen3-14B base por FlashAttention y los módulos simbólicos.
- Licencia AFL-3.0: permisiva con obligación de reciprocidad sobre modificaciones; revisar compatibilidad con el uso comercial previsto y con la licencia del modelo base.
- La fundamentación teórica (Discrepancy Calculus) es material propio del autor sin validación externa publicada.
- No se ofrecen pesos cuantizados oficiales, lo que complica el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset citado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Colección SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-a-collection-of-symbolic-transformers-for-th-681a7f98b5e2397d10192c9a
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Metodología "Structure Over Scale" (DOI): https://doi.org/10.57967/hf/8165
- Perfil del autor: https://huggingface.co/reaperdoesntknow
