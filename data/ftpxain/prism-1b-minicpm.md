# ftpxain/PRISM-1B-MiniCPM

## Resumen

PRISM-1B-MiniCPM es un adaptador LoRA (entrenado con QLoRA en NF4) publicado por el usuario ftpxain sobre el modelo base `openbmb/MiniCPM5-1B`, un transformer denso de aproximadamente 1.000 millones de parámetros desarrollado por OpenBMB. El adaptador se presenta como un ajuste fino supervisado (SFT) orientado a razonamiento, código, matemáticas y ciencia, entrenado mediante destilación de señales de modelos frontera (GPT-5, Claude Mythos, Gemini 3.5 y pistas STEM especializadas, según la model card del autor). No modifica los pesos del modelo base: se distribuye como un conjunto de pesos PEFT que debe cargarse junto con `openbmb/MiniCPM5-1B`.

La relevancia del proyecto es metodológica más que de rendimiento absoluto: según el autor, todo el entrenamiento se realizó dentro de un sobre de memoria muy reducido, en una única GPU de portátil (NVIDIA GeForce RTX 4050 con 6 GB de VRAM), lo que demuestra que la combinación de QLoRA, filtrado disciplinado del dataset y destilación permite obtener mejoras medibles en modelos por debajo de los 2.000 millones de parámetros. Las cifras publicadas por el autor muestran incrementos en HumanEval (68,0 % a 72,0 % pass@1), GSM8K (4,0 % a 32,0 %) y MATH-500 (0,0 % a 4,0 %).

No obstante, conviene tratar estos datos con cautela: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0,0 GB (probablemente los pesos no están efectivamente subidos o son de tamaño despreciable) y los benchmarks son autoinformados, sin verificación independiente. Es un artefacto experimental, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base `openbmb/MiniCPM5-1B`); adaptador LoRA sobre atención y MLP |
| Parametros totales | ~1.000 millones (modelo base); el adaptador añade un conjunto reducido de pesos LoRA (r=16) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | NF4 (4 bits) para el modelo base en carga; el adaptador se distribuye en safetensors (precisión nativa del adaptador) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openbmb/MiniCPM5-1B`, un transformer decoder-only denso de aproximadamente 1.000 millones de parámetros. El ajuste se realizó con QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 con doble cuantización, y sobre él se entrenan matrices de bajo rango (r=16, alpha=32, dropout=0,05) en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, cubriendo tanto la atención como las capas feed-forward. El optimizador empleado es Paged AdamW de 8 bits y el entrenamiento se ejecutó en una única RTX 4050 de portátil con 6 GB de VRAM.

La model card describe el proceso como "destilación de señales frontera": el dataset de SFT se habría construido a partir de salidas de GPT-5, Claude Mythos, Gemini 3.5 y pistas STEM especializadas, sometido a filtrado y deduplicación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; solo se declara SFT. Tampoco se detallan innovaciones arquitectónicas propias: el adaptador no introduce mecanismos nuevos, sino que reajusta el modelo base. La model card reporta pérdidas y perplejidades por dominio en un split de test retenido (por ejemplo, perplejidad de 32,42 a 1,21 en razonamiento destilado y de 300,93 a 2,00 en ingeniería aplicada), si bien estas métricas internas no equivalen a rendimiento en tareas reales.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat mediante `apply_chat_template`.
- Razonamiento multi-paso, con énfasis declarado en matemáticas (GSM8K, MATH-500) y ciencia.
- Generación de código Python, incluyendo código con anotaciones de tipo y patrones de concurrencia (el ejemplo de la model card pide un rate limiter asíncrono con token bucket).
- Respuesta a instrucciones y seguimiento de formato, según la model card.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso autónomo: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- **Asistente de código en local para equipos con hardware limitado**: al ejecutarse sobre una GPU de 6 GB en cuantización NF4, el modelo puede desplegarse en portátiles de desarrollo para autocompletar funciones Python, generar tests unitarios o explicar fragmentos de código sin enviar datos a la nube.
- **Prototipado rápido de pipelines de razonamiento matemático**: con una mejora reportada de 4,0 % a 32,0 % en GSM8K, sirve para experimentar con cadenas de pensamiento (CoT) zero-shot en problemas aritméticos de varios pasos antes de escalar a modelos mayores.
- **Generación de ejercicios y soluciones STEM**: el ajuste declarado en ciencia y física permite generar problemas de práctica con solución paso a paso para plataformas educativas, siempre con revisión humana dado el riesgo de error.
- **Filtrado y clasificación de instrucciones en inglés**: el adaptador puede usarse como modelo pequeño para tareas de etiquetado o reformulación de prompts en pipelines de datos, aprovechando su bajo coste de inferencia.
- **Base para experimentos de destilación**: investigadores que quieran replicar el método QLoRA con destilación de modelos frontera pueden usar este adaptador como referencia y comparar sus propias curvas de pérdida por dominio.
- **Evaluación comparativa de adaptadores PEFT**: al ser un adaptador LoRA sobre un base público, es útil como caso de estudio en bancos de pruebas de `lm-evaluation-harness` para medir el impacto real de SFT en modelos de ~1B.
- **Chatbot de dominio cerrado en inglés**: con temperatura baja (0,1) y `top_p` 0,95, como sugiere la model card, puede integrarse en asistentes de documentación técnica interna con prompts acotados.

## Benchmarks y rendimiento

Datos autoinformados por el autor, evaluados según la model card con EleutherAI `lm-evaluation-harness` y suites oficiales. No hay verificación independiente.

| Benchmark | Dominio | Base (`openbmb/MiniCPM5-1B`) | PRISM-1B | Delta |
|---|---|---|---|---|
| OpenAI HumanEval (pass@1) | Código Python | 68,0 % | 72,0 % | +4,0 % |
| MATH-500 (exact match) | Matemáticas de competición | 0,0 % | 4,0 % | +4,0 % |
| OpenAI GSM8K (zero-shot CoT) | Razonamiento matemático multi-paso | 4,0 % | 32,0 % | +28,0 % |

Pérdida y perplejidad en split de test retenido (según el autor):

| Dominio | Pérdida base | Pérdida ajustada | PPL base | PPL ajustada | Reducción PPL |
|---|---|---|---|---|---|
| Razonamiento destilado | 3,4786 | 0,1886 | 32,42 | 1,21 | -96,3 % |
| Ingeniería aplicada | 5,7069 | 0,6922 | 300,93 | 2,00 | -99,3 % |
| Ciencia y física | 4,4634 | 0,6678 | 86,78 | 1,95 | -97,8 % |
| Código Python | 3,1639 | 0,7941 | 23,66 | 2,21 | -90,7 % |
| Seguimiento de instrucciones | 4,3312 | 2,4131 | 76,04 | 11,17 | -85,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, ARC, HellaSwag, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en NF4 (4 bits) con doble cuantización, el modelo base de ~1B ocupa aproximadamente 0,7-1 GB de VRAM, más el adaptador y el contexto; en la práctica cabe holgadamente en 4-6 GB. En bf16 completo, alrededor de 2-2,5 GB de VRAM.
- **GPU recomendadas**: RTX 4050 Laptop (6 GB) es el mínimo declarado por el autor; RTX 3060/4060 (8-12 GB), RTX 4090 (24 GB), A100 y H100 funcionan sin problema, aunque para un modelo de 1B son sobredimensionadas.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU consumer con al menos 4 GB de VRAM, incluida la RTX 4050 de portátil usada para el entrenamiento.
- **Opciones de despliegue**: `transformers` + `peft` + `bitsandbytes` (ruta documentada en la model card). Para servir en producción se podría convertir el adaptador a un modelo fusionado y usar vLLM, TGI o llama.cpp/Ollama, aunque la conversión a GGUF no está documentada en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PRISM-1B-MiniCPM | ~1B + adaptador LoRA | no disponible | MIT | safetensors (PEFT) | Ajuste SFT por destilación; benchmarks autoinformados; 0 descargas |
| openbmb/MiniCPM5-1B (base) | ~1B | no disponible | no disponible en la información | safetensors | Modelo base sobre el que se aplica el adaptador; HumanEval 68,0 %, GSM8K 4,0 % |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según especificaciones públicas del modelo) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada de tamaño similar con soporte multilingüe y tool calling |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens (según especificaciones públicas del modelo) | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeño de Meta con ecosistema amplio de despliegue |

La comparativa con Qwen2.5-1.5B-Instruct y Llama 3.2 1B se ofrece como referencia de categoría; no se dispone de resultados de benchmarks de PRISM-1B frente a ellos en la información proporcionada.

## Limitaciones y advertencias

- **Benchmarks autoinformados y sin verificación**: las cifras de HumanEval, GSM8K y MATH-500 provienen de la model card del autor; no hay evaluación independiente ni réplica pública.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, y tamaño de repo de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente disponibles o son de tamaño despreciable.
- **Solo inglés**: el campo `language` declara únicamente `en`; no se garantiza calidad en castellano ni en otros idiomas.
- **Rendimiento absoluto bajo en matemáticas**: incluso tras el ajuste, MATH-500 se queda en 4,0 % de exact match, insuficiente para uso fiable en matemáticas de competición sin verificación.
- **Riesgo de alucinación**: un modelo de 1B ajustado por SFT sobre datos destilados tiende a producir respuestas plausibles pero incorrectas, especialmente en dominios STEM y en cadenas de razonamiento largas.
- **Sesgos**: no se documenta ningún análisis de sesgos; al derivar de salidas de modelos frontera, puede heredar sesgos de esos profesores y del dataset de destilación.
- **Licencia MIT**: permisiva para uso comercial, pero se aplica al adaptador; conviene verificar la licencia del modelo base `openbmb/MiniCPM5-1B`, no indicada en la información disponible.
- **Sin soporte documentado de tool calling ni agentes**: no se declara function calling ni razonamiento multi-paso autónomo, lo que limita su uso en pipelines agénticos.
- **Contexto desconocido**: no se especifica la longitud de contexto efectiva, un dato crítico para producción.
- **Artefacto experimental**: no hay garantías de mantenimiento, versionado ni soporte por parte del autor.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ftpxain/PRISM-1B-MiniCPM
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Paper de LoRA: https://arxiv.org/abs/2106.09685
