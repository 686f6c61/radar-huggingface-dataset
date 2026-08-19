# saishshinde15/Clyrai_Lucius-1.3B

## Resumen

Clyrai_Lucius 1.3B es un modelo de lenguaje pequeño (SLM) de 1.342 millones de parámetros, de arquitectura decoder-only estilo Llama, desarrollado por Clyrai, estudio de IA fundado por Saish Shinde. Se trata de la versión post-entrenada del modelo base `Clyrai_Lucius-1.3B-Base`, preentrenado desde cero, y ha sido sometido a un pipeline de post-entrenamiento en cuatro etapas que combina SFT, GRPO con recompensas verificables (RLVR), destilación de modos y DPO. Su característica más distintiva es el **razonamiento controlable por esfuerzo**: mediante tokens especiales (`<|effort_low|>`, `<|effort_medium|>`, `<|effort_high|>`) el usuario o un agente puede ajustar dinámicamente la profundidad del razonamiento en tiempo de inferencia, optimizando latencia y consumo de recursos según la complejidad de la tarea.

El modelo está orientado a tareas de razonamiento matemático, síntesis de código y lógica multilingüe, con soporte para inglés, hindi e italiano. Su ventana de contexto es de 4.096 tokens y los pesos se distribuyen en formato safetensors con precisión bfloat16/float16. Aunque el repositorio no reporta descargas ni valoraciones, la propuesta técnica resulta interesante para entornos con restricciones de hardware donde se necesite un equilibrio entre capacidad de razonamiento y eficiencia. La licencia es personalizada (`clyrai-research-preview`), lo que obliga a revisar sus términos antes de un uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style causal decoder (RoPE, SwiGLU, RMSNorm, SDPA attention) |
| Parametros totales | 1.342.277.632 (1,34 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos nativos en bfloat16/float16) |
| Idiomas soportados | Inglés, hindi, italiano |
| Licencia | clyrai-research-preview (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de decoder causal tipo Llama, con atención SDPA, posicional RoPE, activación SwiGLU y normalización RMSNorm. El preentrenamiento se realizó desde cero sobre el modelo base `Clyrai_Lucius-1.3B-Base`, aunque no se han publicado detalles sobre el volumen de tokens, la composición del corpus ni los hiperparámetros de preentrenamiento.

El post-entrenamiento se estructura en cuatro etapas secuenciales:

1. **Cold-Start SFT**: alineación del chat, inducción de delimitadores y de la identidad del modelo mediante pérdida de entropía cruzada enmascarada sobre trazas de razonamiento multi-turno.
2. **GRPO RLVR**: optimización con Group Relative Policy Optimization y recompensas verificables programáticas (rule-based verifiable rewards) para fomentar la resolución autónoma de problemas y su verificación.
3. **Mode Fusion SFT**: destilación de un profesor para calibrar los tres niveles de esfuerzo, con longitudes de razonamiento acotadas por tokens.
4. **DPO Alignment**: alineación por preferencias directas sobre pares contrastivos para suprimir bucles de repetición y fijar la precisión.

No se especifican los datos de entrenamiento (número de tokens, fuentes, etc.) en la información disponible.

## Capacidades

- Generación de texto y razonamiento paso a paso con salida estructurada mediante delimitadores XML (`<|reasoning_start|>`, `<|reasoning_end|>`, `<|answer_start|>`, `<|answer_end|>`).
- Razonamiento controlable por esfuerzo mediante tokens especiales que ajustan la longitud del razonamiento interno: bajo (32-96 tokens), medio (128-384 tokens) y alto (384-1024 tokens).
- Resolución de problemas matemáticos de diversa complejidad: aritmética, álgebra, combinatoria y problemas de palabras.
- Síntesis de código Python, incluyendo funciones algorítmicas (según la evaluación en MBPP).
- Razonamiento multilingüe en inglés, hindi e italiano.
- Alineación anti-repetición mediante DPO, reduciendo bucles de generación.
- No se menciona soporte explícito para tool calling, function calling ni uso como agente autónomo.

## Casos de uso

- **Asistente educativo de matemáticas**: el modelo puede guiar a estudiantes en la resolución de problemas aritméticos y algebraicos, activando el modo de esfuerzo alto para explicaciones detalladas o el modo bajo para respuestas rápidas, gracias a su razonamiento controlable y su formato de salida estructurado.
- **Generación de código en entornos con recursos limitados**: al ser un SLM de 1,34 B parámetros, cabe en GPUs de consumo y puede generar funciones Python sencillas o fragmentos algorítmicos, integrándose en pipelines de desarrollo sin requerir infraestructura de alto coste.
- **Chat multilingüe de atención al cliente**: con soporte para inglés, hindi e italiano, puede gestionar conversaciones de soporte en esos idiomas, ajustando el esfuerzo de razonamiento según la complejidad de la consulta y manteniendo respuestas coherentes en contexto de 4.096 tokens.
- **Razonamiento lógico en sistemas embebidos**: su tamaño reducido permite desplegarlo en dispositivos con poca memoria (por ejemplo, Jetson o Raspberry Pi con acelerador) para tareas de deducción lógica o verificación de reglas, usando el modo de esfuerzo bajo para respuestas casi instantáneas.
- **Automatización de razonamiento en pipelines de IA**: puede actuar como un módulo de razonamiento intermedio en arquitecturas multi-agente, generando trazas de pensamiento verificables antes de una respuesta final, con la posibilidad de ajustar la profundidad según el presupuesto de latencia.
- **Prototipado rápido de aplicaciones de razonamiento**: su formato de pesos safetensors y compatibilidad con transformers facilita su integración en notebooks y entornos de desarrollo para experimentar con técnicas de razonamiento controlable sin necesidad de un clúster.

## Benchmarks y rendimiento

El autor reporta resultados de evaluación en una GPU NVIDIA Blackwell RTX PRO 5000, pero la tabla proporcionada está incompleta y solo muestra los siguientes datos:

| Categoría | Tarea | Tasa de aprobación (%) | Velocidad de inferencia (tok/s) |
|---|---|---|---|
| GSM8K y problemas de palabras | Aritmética multi-paso, tasas y problemas verbales | 100,0 | 49,8 |
| Aritmética básica | Orden de operaciones y cálculos multi-paso | 100,0 | 50,2 |
| Álgebra y cuadráticas | Sistemas lineales y raíces cuadráticas | 100,0 | 49,8 |
| Combinatoria | Permutaciones y recuento discreto | 100,0 | 51,2 |
| Síntesis de código (MBPP) | Funciones algorítmicas en Python | No disponible | No disponible |

No se dispone de más resultados de benchmarks ni comparaciones con otros modelos en la información proporcionada. Los datos mostrados provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- **VRAM estimada**: los pesos en bfloat16/float16 ocupan aproximadamente 2,7 GB (tamaño del repositorio), por lo que se necesita al menos 4 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits podría reducirse a ~1,4 GB y con 4 bits a ~0,7 GB, aunque no se han publicado versiones cuantizadas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como A10, A100, etc. El autor evaluó en una RTX PRO 5000 (Blackwell).
- **Compatibilidad con GPU de consumo**: sí, es viable en GPUs de gama media e incluso en algunas integradas con suficiente memoria compartida.
- **Opciones de despliegue**: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o directamente con la librería transformers. FriendliAI ofrece un endpoint de inferencia de baja latencia para el modelo base.
- **Latencia y throughput**: según la model card, el modo de esfuerzo bajo produce respuestas en menos de 0,5 s, el medio entre 1 y 2 s, y el alto entre 3 y 5 s, con velocidades de generación en torno a 50 tok/s en la GPU de evaluación.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. Como referencia, se listan alternativas de tamaño similar (1-2 B de parámetros) con sus características generales:

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Clyrai_Lucius-1.3B | 1,34 B | 4.096 | en, hi, it | clyrai-research-preview |
| Qwen2.5-1.5B | 1,54 B | 32.768 | multilingüe | Apache 2.0 |
| Llama-3.2-1B | 1,23 B | 128.000 | multilingüe | Llama 3.2 Community |
| Gemma-2-2B | 2,6 B | 8.192 | multilingüe | Gemma Terms of Use |

Clyrai_Lucius se diferencia por su mecanismo de razonamiento controlable por esfuerzo, ausente en los otros modelos, pero su contexto es más corto y su licencia es restrictiva. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Licencia**: la licencia `clyrai-research-preview` es personalizada y no se especifican los términos exactos. Es imprescindible revisar el archivo LICENSE antes de cualquier uso, especialmente comercial.
- **Idiomas limitados**: solo soporta inglés, hindi e italiano; no cubre otros idiomas comunes.
- **Contexto reducido**: 4.096 tokens puede ser insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- **Riesgo de alucinación**: al ser un modelo pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos por su entrenamiento.
- **Sesgos**: no hay información sobre sesgos o evaluación de equidad; se recomienda auditar el modelo antes de usarlo en entornos sensibles.
- **Dependencia de la calidad del post-entrenamiento**: los resultados de benchmarks provienen del autor y no han sido validados externamente; la tasa de aprobación del 100% en varias categorías debe tomarse con cautela.
- **Sin soporte explícito para tool calling**: no se menciona integración con funciones externas, lo que limita su uso como agente autónomo.
- **Riesgo de repetición residual**: aunque se aplicó DPO anti-repetición, los modelos pequeños pueden presentar bucles de repetición en ciertas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saishshinde15/Clyrai_Lucius-1.3B
- Modelo base: https://huggingface.co/saishshinde15/Clyrai_Lucius-1.3B-Base
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/saishshinde15/Clyrai_Lucius-1.3B-Base
- GitHub de Clyrai: https://github.com/clyrai
- GitHub de Saish Shinde: https://github.com/saishshinde15/
- Colección TBH.AI Vortex: https://huggingface.co/collections/saishshinde15/tbhai-vortex
