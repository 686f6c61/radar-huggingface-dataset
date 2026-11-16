# sebaiinc/Seb-AI-S1-Mini-350M

## Resumen

Seb AI S1 Mini 350M es un modelo de lenguaje causal de tipo Llama entrenado desde cero (inicialización aleatoria) por Seb AI Inc. Se distribuye en Hugging Face bajo licencia Apache 2.0 y está pensado como modelo pequeño de generación de texto y respuesta a instrucciones en inglés. Su arquitectura sigue el esquema `LlamaForCausalLM` con aproximadamente 409 millones de parámetros reales (clase 350M), lo que lo sitúa en la gama de modelos que pueden ejecutarse en hardware de consumo.

El modelo se ha entrenado específicamente sobre datos educativos de pregunta-respuesta con formato de instrucción `User: ... / Assistant: ...`, lo que lo orienta a tareas conversacionales sencillas y a servir como base para ajuste fino. Su ventana de contexto es de solo 512 tokens, una limitación importante frente a los modelos actuales de la misma categoría, que suelen ofrecer entre 4K y 128K tokens.

Su relevancia radica en ser un modelo abierto, ligero y entrenado íntegramente desde cero, útil para experimentación, docencia y despliegues en entornos con recursos limitados. No obstante, la información pública disponible es escasa: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Llama (`LlamaForCausalLM`) |
| Parametros totales | 408.994.816 (~409M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar al usar arquitectura Llama) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal densa con el esquema estándar de Llama (`LlamaForCausalLM`), lo que facilita su integración con el ecosistema Hugging Face `transformers` y con herramientas de ajuste fino como Unsloth, LLaMA-Factory, Axolotl o TRL. No se trata de un modelo MoE ni híbrido: es un transformer denso de aproximadamente 409 millones de parámetros.

Según la model card, el entrenamiento se realizó desde cero (random initialization) sobre datos educativos de pregunta-respuesta con formato de instrucción. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés.
- Respuesta a instrucciones conversacionales mediante el formato `User: ... / Assistant: ...`.
- Capacidad básica de razonamiento y respuesta a preguntas de tipo educativo, limitada por su tamaño y por el dataset de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés (idioma declarado: `en`).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Base adecuada para ajuste fino sobre dominios específicos gracias a su licencia permisiva y arquitectura estándar.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede gestionar diálogos simples en inglés con el formato de prompt indicado, útil para validar flujos de producto antes de migrar a modelos mayores.
- Docencia y experimentación en NLP: al estar entrenado desde cero y ser pequeño, sirve para estudiar el comportamiento de un transformer causal y practicar ajuste fino con TRL, Unsloth o Axolotl.
- Ajuste fino en dominios acotados: con 409M de parámetros y licencia Apache 2.0, es viable especializarlo en tareas de pregunta-respuesta sobre un corpus propio en GPU de consumo.
- Generación de texto en entornos con recursos limitados: su tamaño permite inferencia en CPU o en GPU modestas, adecuado para demos locales y entornos embebidos.
- Filtrado y clasificación ligera de texto en inglés: puede adaptarse mediante fine-tuning a tareas de etiquetado o generación de respuestas cortas.
- Base para investigación sobre eficiencia: útil para comparar curvas de escalado y estrategias de entrenamiento en modelos de menos de 500M de parámetros.
- Generación de respuestas educativas de formato corto: su entrenamiento en Q&A educativa lo hace apropiado para preguntas simples, siempre con supervisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,8-1 GB para los pesos (409M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4-0,5 GB; en 4 bits, alrededor de 0,2-0,3 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia en lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline de text-generation), vLLM, TGI, llama.cpp y Ollama son compatibles al usar arquitectura Llama y pesos safetensors (previa conversión a GGUF para llama.cpp/Ollama).
- Latencia y throughput: no disponibles; al ser un modelo de 409M con contexto de 512 tokens, se espera latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Seb AI S1 Mini 350M | ~409M | 512 | Apache 2.0 | en | Entrenado desde cero, datos educativos Q&A |
| SmolLM-135M / SmolLM-360M (Hugging Face) | 135M / 360M | 2K-8K (según versión) | Apache 2.0 | en (multilingüe parcial en versiones recientes) | Entrenados sobre corpus web a gran escala |
| Qwen2.5-0.5B | ~494M | 32K | Apache 2.0 | multilingüe | Contexto largo y mejor rendimiento general |
| TinyLlama-1.1B | ~1.1B | 2K-32K (según variante) | Apache 2.0 | en | Mayor tamaño y corpus más amplio |

Los datos de contexto y rendimiento de los modelos comparados provienen de sus respectivas model cards públicas; no se dispone de benchmarks del modelo de Seb AI para una comparación cuantitativa.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (512 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente fuera del dominio educativo de entrenamiento.
- No se documentan procesos de alineación (RLHF/DPO), por lo que puede generar contenido sesgado, inseguro o no deseado.
- Dataset de entrenamiento no documentado en detalle: imposible evaluar sesgos, contaminación o cobertura.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El código de ejemplo de la model card referencia un identificador distinto (`Sebestianmek/Seb-AI-S1-Mini-350M`) del ID oficial (`sebaiinc/Seb-AI-S1-Mini-350M`), lo que puede causar errores de carga si se copia tal cual.
- El repositorio ocupa 3,3 GB, superior a lo esperado para 409M de parámetros en FP16, lo que sugiere pesos duplicados o en mayor precisión; conviene revisar los ficheros antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/sebaiinc/Seb-AI-S1-Mini-350M
- Sitio web oficial: https://sebaioffical.lovable.app
- API oficial: https://sebaioffical.lovable.app/api/sebaiapi
- Repositorio de Transformers (arquitectura Llama): https://github.com/huggingface/transformers
- Unsloth: https://github.com/unslothai/unsloth
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- TRL: https://github.com/huggingface/trl
