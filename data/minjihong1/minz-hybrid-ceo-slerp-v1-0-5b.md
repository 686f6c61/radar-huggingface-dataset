# minjihong1/minz-hybrid-ceo-slerp-v1-0.5b

## Resumen

minz-hybrid-ceo-slerp-v1-0.5b es un modelo de lenguaje fruto de una fusión (merge) de pesos mediante interpolación esférica lineal (SLERP) entre dos modelos de la familia Qwen2.5: `Qwen/Qwen2.5-0.5B-Instruct` y `Qwen/Qwen2.5-0.5B`. Lo publica el usuario minjihong1 bajo el paraguas de lo que la model card denomina "CONNECT AI LAB × Antigravity IDE", y está pensado como un experimento de combinación de las capacidades conversacionales del modelo Instruct con la base preentrenada.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 494.032.768 parámetros reales (según los pesos en safetensors), es decir, aproximadamente 0,5 mil millones de parámetros. El contexto heredado de la familia Qwen2.5-0.5B es de 32.768 tokens, aunque la model card no lo documenta explícitamente.

Su relevancia es limitada y de nicho: se trata de un merge experimental sin descargas ni validación pública, orientado a integrarse en la aplicación de escritorio propietaria "Connect AI". No aporta innovaciones de entrenamiento ni benchmarks publicados; su interés es principalmente como ejemplo de aplicación de SLERP con mergekit sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), fusión por SLERP de dos checkpoints |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada de Qwen2.5-0.5B: 32.768 tokens según la familia base) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/GGUF, no documentada por el autor) |
| Idiomas soportados | No disponible (heredados de Qwen2.5, multilingüe, sin listado oficial del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusión de pesos con el método SLERP (Spherical Linear Interpolation, Shoemake 1985) con λ=0,50 entre `Qwen/Qwen2.5-0.5B-Instruct` (etiquetado por el autor como "modelo A, instruct/marketing") y `Qwen/Qwen2.5-0.5B` (etiquetado como "modelo B, base/inteligencia de negocio"). La herramienta citada es "Antigravity Local Model Surgery Engine (SafeTensors Native)", y los tags del repositorio incluyen `mergekit`, lo que sugiere el uso de esa librería o una implementación equivalente.

La justificación técnica que da el autor es la habitual para SLERP: frente a una media aritmética lineal (LERP), la interpolación esférica recorre la geodésica en la variedad de alta dimensión y evita la contracción de la norma L2 de los vectores de pesos, que según el autor degrada las capacidades del modelo fusionado. No se documentan datos de entrenamiento adicionales, tokens de ajuste, RLHF, DPO ni ninguna innovación de inferencia (no hay decodificación especulativa, atención lineal ni modos de pensamiento propios).

## Capacidades

- Generación de texto conversacional, heredada del checkpoint Instruct de Qwen2.5-0.5B.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño de 0,5B.
- Generación de código sencillo y aritmética elemental, sin garantías de fiabilidad en tareas complejas.
- Soporte multilingüe heredado de Qwen2.5 (coreano, inglés, chino y otros), aunque el autor no publica la lista oficial de idiomas.
- Integración con la aplicación de escritorio "Connect AI" mediante la introducción del identificador del repositorio en el apartado "AI 진화소 → 내 AI".
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en local: con 0,5B de parámetros, el modelo cabe en cualquier GPU de consumo e incluso en CPU, lo que permite iterar sobre prompts sin coste de API.
- Experimentación con técnicas de merge: sirve como caso de estudio reproducible de SLERP con mergekit sobre dos checkpoints de la misma familia, útil para investigar el efecto de λ en las capacidades resultantes.
- Despliegue embebido en aplicaciones de escritorio: su tamaño reducido (repo de 1,0 GB en safetensors) encaja en el flujo de la app Connect AI, que lo carga desde el hub en el motor local.
- Generación de texto auxiliar de baja latencia: borradores, resúmenes cortos o respuestas plantilla en entornos con recursos limitados.
- Base para fine-tuning ligero: al ser un checkpoint de 0,5B con licencia Apache 2.0, es viable ajustarlo con LoRA en una sola GPU para dominios concretos.
- Evaluación comparativa de merges: emplearlo como referencia frente al Instruct original para medir si la fusión conserva o degrada las capacidades de instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 1 GB para los pesos (0,99 GB) más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,5-0,6 GB; en 4 bits, en torno a 0,3-0,4 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (carga directa desde safetensors), llama.cpp/Ollama tras conversión a GGUF, vLLM y TGI (compatibles con la arquitectura Qwen2, aunque no verificados por el autor para este checkpoint).
- Latencia y throughput: no disponibles; por el tamaño, se espera throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| minz-hybrid-ceo-slerp-v1-0.5b | 494 M | No documentado (familia Qwen2.5: 32.768) | Apache 2.0 | Hugging Face, 0 descargas | Merge SLERP experimental, sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | ~494 M | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo instruct oficial, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | Hugging Face | Base preentrenada oficial |
| SmolLM2-360M-Instruct | ~360 M | 8.192 | Apache 2.0 | Hugging Face | Alternativa pequeña de Hugging Face, con benchmarks publicados |

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad de razonamiento, matemáticas y código muy limitada frente a modelos de 7B o superiores; no apto para tareas de alta precisión sin verificación.
- Riesgo de alucinación elevado, inherente a modelos pequeños y agravado por la falta de evaluación del merge.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que la fusión SLERP preserve las capacidades del Instruct original; el resultado puede ser inferior a cualquiera de los dos modelos de partida.
- La model card está redactada en coreano y contiene afirmaciones de marketing ("초융합 두뇌", "100% de preservación de capacidades") sin respaldo técnico verificable.
- Idiomas soportados no documentados oficialmente por el autor; el rendimiento fuera de inglés, chino y coreano es incierto.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los términos de la familia base.
- Sin descargas ni likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- La integración documentada depende de la aplicación propietaria "Connect AI", lo que limita su portabilidad fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/minjihong1/minz-hybrid-ceo-slerp-v1-0.5b
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base preentrenado: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Paper original de SLERP (Shoemake, 1985): https://doi.org/10.1145/325165.325242
