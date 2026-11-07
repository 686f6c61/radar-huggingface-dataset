# NikitaLazarev/Qwen3.5-2B-WSP-GGUF

## Resumen

Qwen3.5-2B-WSP-GGUF es una edición de pesos del modelo Qwen3.5-2B de Alibaba Cloud, publicada por el usuario NikitaLazarev. No se trata de un fine-tuning ni de un modelo entrenado desde cero: es el modelo base con una modificación determinista en un subconjunto reducido de sus matrices de pesos, aplicada mediante una técnica denominada weight-space programming. El objetivo concreto es eliminar el comportamiento de "bucle de razonamiento" que provocaba que el modelo generase miles de tokens dentro del bloque `` sobre los mismos prompts. La atribución causal mostró que esa dirección la escriben módulos MLP y de atención de las capas 19 a 23, de modo que la proyección se aplicó a las matrices de salida `ffn_down`, `attn_output` y `ssm_out` de esas capas. En total se modifican 10 tensores, aproximadamente el 2 % de los pesos, sin ningún paso de entrenamiento.

El resultado declarado por el autor es una reducción de 4111 a 0 tokens de razonamiento en prompts en crudo, con un tiempo de generación que pasa de 501 s a unos 30 s (factor ×10) y una calidad de respuesta preservada según su propia evaluación. El modelo se distribuye únicamente en formato GGUF cuantizado Q4_K_XL (1,35 GiB), con los 10 tensores editados almacenados en F16 y el resto en el cuantizado original de Unsloth. La relevancia práctica es doble: por un lado, ofrece una variante de respuesta directa del Qwen3.5-2B para despliegues donde el modo razonamiento resulta contraproducente; por otro, documenta un método de cirugía de pesos reproducible y barato frente a alternativas como el prefill de bloque vacío o el truncado por límite de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, con módulos MLP, atención y SSM (según los nombres de tensor editados: `ffn_down`, `attn_output`, `ssm_out`) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_XL (10 tensores editados en F16); no se publican otros niveles de cuantización en este repo |
| Idiomas soportados | en, ru (según tags de la model card); no se detalla cobertura adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-2B-UD-Q4_K_XL-wsp.gguf`, 1,35 GiB); el repo declara `library_name: transformers` pero solo se documenta el artefacto GGUF |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura y el entrenamiento de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parámetros de la serie Qwen3.5 de Alibaba Cloud, orientada a inferencia en dispositivo y con capacidades multilingües y de razonamiento mejoradas respecto a la generación anterior. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base, por lo que esos datos deben consultarse en la ficha oficial de Qwen.

La innovación técnica de esta variante es la edición de pesos sin entrenamiento. El procedimiento, ejecutado por el agente GLM-5.3-Flash y basado en el experimento original de Weight-Space Programming, consta de tres pasos: (1) diagnóstico mediante forward hooks para aislar la dirección del residual stream asociada al modo razonamiento; (2) atribución causal proyectando las salidas de cada módulo sobre esa dirección, lo que localiza las capas 19–23; y (3) ablución de rango uno con la fórmula `W ← (I − α·d̂d̂ᵀ)W` aplicada a las matrices de salida de esas capas. La edición es determinista y afecta a 10 tensores (~2 % de los pesos), lo que permite verificar la integridad mediante el sha256 de LFS y revertir al modelo base en cualquier momento.

## Capacidades

- Generación de texto conversacional en modo de respuesta directa, sin bloque `<think>`: el modelo responde de inmediato en lugar de abrir una fase de razonamiento explícita.
- Razonamiento y respuesta a instrucciones heredados del Qwen3.5-2B original, con la salvedad de que la ablución busca preservar la calidad de respuesta eliminando únicamente el bucle de razonamiento.
- Soporte multilingüe limitado, según los tags de la model card, a inglés y ruso; no se documenta cobertura de otros idiomas.
- Compatibilidad con llama.cpp mediante el binario `llama-cli`, con la opción `-no-cnv` indicada por el autor para uso no conversacional.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otros modos especiales en la información disponible.
- No se documenta modo thinking opcional: la edición elimina el comportamiento de razonamiento, por lo que no es posible reactivarlo sin volver al modelo base.

## Casos de uso

- Integración en producción con latencia acotada: el modelo responde sin generar miles de tokens de razonamiento, lo que reduce el tiempo de generación de 501 s a unos 30 s en los prompts problemáticos y evita que el bloque `<think>` consuma hasta el 73 % del presupuesto de generación.
- Despliegue en dispositivo o en entornos con recursos limitados: con 1,35 GiB en Q4_K_XL y ~1,88 mil millones de parámetros, cabe en GPUs de consumo y en hardware de borde, y es adecuado para tareas de clasificación, extracción o respuesta breve donde el razonamiento explícito no aporta.
- Chatbots de atención al cliente con respuestas directas: al no abrir bloque de razonamiento, el modelo devuelve texto listo para mostrar al usuario sin necesidad de postprocesar ni eliminar etiquetas `<think>`.
- Pipelines de generación por lotes: la ausencia de bucles de razonamiento hace predecible el consumo de tokens por petición, lo que simplifica el dimensionamiento de cuotas y el control de costes en servicios de inferencia.
- Evaluación de técnicas de edición de pesos: el repo sirve como caso reproducible de weight-space programming, con diagnóstico por forward hooks, atribución causal y ablución de rango uno documentados, útil para investigar comportamiento emergente en modelos pequeños.
- Sustitución directa del Qwen3.5-2B en aplicaciones existentes que ya usaban prefill de bloque vacío o truncado por límite de tokens: la variante elimina la causa en lugar de tratar el síntoma, manteniendo el mismo formato GGUF y el mismo flujo de llama.cpp.
- Prototipado rápido en local con llama.cpp: el comando `llama-cli -m Qwen3.5-2B-UD-Q4_K_XL-wsp.gguf -p "..." -no-cnv` permite probar el modelo sin infraestructura adicional.

## Benchmarks y rendimiento

La model card solo publica métricas comparativas antes/después de la edición, no resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros):

| Metrica | Antes | Despues |
|---|---|---|
| Tokens de razonamiento (prompts en crudo) | 4111 | 0 |
| Tiempo de generación | 501 s | ~30 s (×10) |
| Calidad de respuesta | — | preservada (según el autor, sin métrica publicada) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_XL ocupa 1,35 GiB, por lo que la inferencia requiere del orden de 2–3 GiB de VRAM o memoria unificada, incluyendo overhead de contexto y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo está pensado para inferencia en dispositivo (Qualcomm AI Hub lo lista como modelo on-device de 2B), por lo que también es viable en iGPU y NPUs compatibles.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es la vía documentada por el autor; el repo declara `library_name: transformers` y `endpoints_compatible`, pero no se detallan recetas para vLLM, TGI u Ollama.
- Latencia y throughput: el autor reporta ~30 s frente a 501 s en los prompts que antes entraban en bucle, sobre hardware no especificado; no se publican medidas de tokens por segundo ni de latencia por petición en condiciones normales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-WSP-GGUF (este) | ~1,88 B | no disponible | GGUF Q4_K_XL | Apache 2.0 | Respuesta directa sin bloque `<think>`; 10 tensores editados |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | no disponible | safetensors / GGUF (vía terceros) | Apache 2.0 | Modelo original con modo razonamiento; referencia para comparar calidad y latencia |
| DevQuasar/Qwen.Qwen3.5-2B-GGUF | ~1,88 B | no disponible | GGUF | Apache 2.0 (heredada) | Cuantización estándar del base, sin edición de pesos; mantiene el comportamiento de razonamiento original |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y comportamiento documentado.

## Limitaciones y advertencias

- La ablución elimina el modo razonamiento de forma permanente: no es posible recuperar el bloque `<think>` sin volver al modelo base, lo que puede degradar tareas que se benefician de cadenas de razonamiento largas.
- La calidad de respuesta "preservada" es una afirmación del autor sin métrica publicada; no hay evaluación independiente que cuantifique la posible pérdida en razonamiento, matemáticas o código.
- El modelo solo se distribuye en un nivel de cuantización (Q4_K_XL) y en GGUF; no hay safetensors editados ni otras cuantizaciones en este repo.
- Cobertura idiomática limitada a inglés y ruso según los tags; el castellano no está declarado como idioma soportado.
- No se documentan capacidades de tool calling, agentes, visión o audio; asumir su ausencia en producción.
- Riesgo de alucinación inherente a un modelo de ~1,88 B parámetros, sin datos específicos de evaluación en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la model card; al heredar el base de Qwen, arrastra los sesgos de sus datos de entrenamiento.
- La edición la realizó un agente (GLM-5.3-Flash) y el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de los resultados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los términos del modelo base Qwen/Qwen3.5-2B antes de desplegar.
- El repo declara `library_name: transformers` pero solo documenta uso con llama.cpp; no se garantiza compatibilidad con la API de Transformers.

## Enlaces

- Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-2B-WSP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog original de Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
- Logs del experimento: https://github.com/RikiyaT/lm_understand-logs
- Cuantización de terceros del base: https://huggingface.co/DevQuasar/Qwen.Qwen3.5-2B-GGUF
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
