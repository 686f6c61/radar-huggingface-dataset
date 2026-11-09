# pRxNeXuz/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX

## Resumen
SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX es un ajuste fino del checkpoint DeepSeek-V4-Flash-0731, publicado por el usuario pRxNeXuz. Se trata de un modelo de mezcla de expertos (MoE) de clase 304B con arquitectura DeepSeek V4 Flash, que conserva el layout híbrido oficial del modelo base pero aplica una actualización quirúrgica orientada a reducir los rechazos (refusals) del modelo y a optimizar el despliegue en dos nodos DGX Spark. El resultado es un checkpoint directamente cargable, sin adaptadores LoRA ni cambios en tiempo de inferencia.

El modelo mantiene las capacidades del padre (razonamiento, tool calling, contexto largo) mientras reduce la tasa de rechazo en el peor caso del 97,92% al 4,17%, manteniendo el cumplimiento de herramientas al 100%. Empaqueta los pesos en precisión mixta (FP4 para expertos, FP8 E4M3 para bloques, BF16 para tensores sensibles), lo que permite cargarlo en hardware con memoria limitada. Su contexto configurado es de 1.048.576 tokens, con recuperación verificada en una petición de 1.028.621 tokens.

Es relevante ahora porque demuestra que es posible modificar el comportamiento de rechazo de un modelo grande mediante edición de pesos en el espacio de parámetros, sin degradar las capacidades funcionales ni el rendimiento de decodificación, y todo ello con licencia MIT para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek V4 Flash, MoE híbrido con 43 capas de backbone + 3 capas MTP, 256 expertos enrutados, top-6 |
| Parametros totales | 306.253.453.246 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens configurados; 1.028.621 tokens verificados en recuperación |
| Tipos de cuantizacion | FP4 (expertos MoE), FP8 E4M3 (bloques con escalado dinámico, bloques 128x128, escalas UE8M0), BF16 (tensores sensibles y head de salida), NVFP4 DS-MLA (caché KV en serving) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), con índice de pesos que redirige solo los tensores modificados |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura DeepSeek V4 Flash, un transformer MoE con 43 capas de backbone y 3 capas MTP (multi-token prediction), 256 expertos enrutados con activación top-6. Conserva el layout híbrido oficial del checkpoint padre, incluyendo la representación de expertos en FP4 y las rutas de cuantización por bloques en FP8 E4M3. No se trata de un reentrenamiento completo ni de un requantizado global, sino de una edición quirúrgica sobre el checkpoint oficial.

El ajuste aplicado consiste en dos pasadas de edición en el espacio de pesos: una primera pasada OBLITERATUS que ajusta una dirección de rechazo de rango 1 robusta en los modos chat, think-high y think-max, y una segunda pasada residual de rango 1 ortogonalizada contra la primera. Además, se aplica una recuperación acotada de la cabeza de salida (head) en BF16 con rango 64 y delta de Frobenius relativo de 0,0025. Solo se modifican 46 pares de peso/escala `attn.wo_b` (43 del backbone y 3 MTP) y la cabeza de salida; el resto de tensores del padre (expertos, routers, embeddings, tensores mHC) conservan su representación original. No hay adaptadores en tiempo de inferencia.

## Capacidades
- Generación de texto y razonamiento en modos chat, think-high y think-max.
- Tool calling y function calling con cumplimiento verificado del 100% en las pruebas de release.
- Razonamiento multi-paso y soporte de agentes, con selección correcta de herramienta al 100%.
- Capacidades de código, matemáticas y serialización, incluidas en las pruebas de validación del release.
- Contexto largo real: recuperación verificada en peticiones de 149.845 y 1.028.621 tokens.
- Capacidades multilingües limitadas a inglés (en) y coreano (ko) según la model card.
- Modo "uncensored" (menos rechazos) gracias a la edición OBLITERATUS, con tasa de rechazo en peor caso del 4,17% frente al 97,92% del padre.
- Formato de salida estructurado y tool output, con rendimiento medido de 123,3 tok/s agregados en generación de herramientas.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens) gracias a su ventana verificada, manteniendo el hilo de la conversación y evitando rechazos innecesarios en consultas legítimas.
- Generación de código en producción: soporta tool calling con cumplimiento del 100% y puede integrarse en pipelines de CI/CD para generar, revisar o completar código, con la ventaja de que la reducción de rechazos evita bloqueos en tareas técnicas legítimas.
- Agentes autónomos multi-paso: su capacidad de razonamiento en modos think-high y think-max, junto con la selección correcta de herramientas al 100%, lo hace adecuado para orquestación de agentes que requieren planificación y ejecución de acciones.
- Análisis de documentos extensos: con contexto de 1M tokens y recuperación verificada, puede procesar contratos, informes o bases de código completas en una sola petición sin truncamiento.
- Despliegue en infraestructura distribuida: el formato de cuantización mixta (FP4+FP8+BF16) y el rendimiento medido en dos nodos DGX Spark (hasta 123,3 tok/s agregados) lo hacen viable para serving en clústeres pequeños con memoria limitada.
- Investigación en alineación y edición de modelos: sirve como caso de estudio reproducible de edición de pesos (OBLITERATUS + SuperTune) para estudiar la reducción de rechazos sin degradar capacidades, con métricas de validación publicadas.
- Aplicaciones en coreano e inglés: para productos dirigidos a esos mercados, el modelo mantiene soporte nativo de ambos idiomas según la model card.

## Benchmarks y rendimiento
Los datos disponibles provienen de la model card del autor y comparan el checkpoint con su padre oficial (DeepSeek-V4-Flash-0731). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Padre oficial | SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX |
|---|---:|---:|
| Tasa de rechazo en peor modo | 97,92% | 4,17% |
| Respuesta vacía en peor modo | 0,00% | 0,00% |
| Cumplimiento de herramientas en peor modo | 100,00% | 100,00% |
| Tasa de herramienta correcta en peor modo | 100,00% | 100,00% |
| Media de capacidad mínima | 0,9375 | 0,9583 |

Rendimiento de decodificación (throughput agregado concurrente, no por stream único, con seis prompts distintos y generación de longitud fija, contrato de medición sparkDash en commit `dfde4214f32b174880832a4d317d3c0567750ac5`):

| Carga de trabajo | Prompt / concurrencia | Decodificación agregada |
|---|---:|---:|
| Salida forzada | p256 / C6 | 118,5505 tok/s |
| Salida estructurada de herramientas | p256 / C6 | 123,2888 tok/s |

Ratio de decodificación mediano frente al padre: 1,001.

## Requisitos de hardware
- VRAM estimada para inferencia: el repo ocupa 169,5 GB en el Hub; el checkpoint en precisión mixta requiere al menos esa cantidad de memoria agregada para cargar los pesos, más la caché KV (NVFP4 DS-MLA en serving).
- GPU recomendadas: el autor reporta despliegue en dos nodos DGX Spark (hardware con memoria unificada). No se especifican otras GPU en la información disponible.
- ¿Cabe en GPU consumer? No hay datos que indiquen que quepa en una GPU consumer individual; el tamaño del repo (169,5 GB) supera la VRAM de las RTX 4090 (24 GB) y similares. Se requiere configuración multi-nodo o multi-GPU.
- Opciones de despliegue: transformers (librería declarada), vLLM (tag incluido), endpoints compatibles (tag `endpoints_compatible`). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: medidos en dos DGX Spark con concurrencia C6 y prompts de 256 tokens: 118,55 tok/s (salida forzada) y 123,29 tok/s (salida estructurada de herramientas) agregados. No hay datos de latencia por token ni de stream único.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX | 306,3B (MoE) | 1.048.576 | MIT | safetensors (FP4/FP8/BF16) | Ajuste abliterated del V4 Flash, menos rechazos, tool calling 100% |
| deepseek-ai/DeepSeek-V4-Flash-0731 (padre) | 304B-class (MoE) | no disponible en la información | no disponible en la información | safetensors | Checkpoint oficial base; tasa de rechazo 97,92% en peor modo |
| Otros modelos de la familia DeepSeek V4 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros miembros de la familia en la información proporcionada |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un ajuste abliterated, la reducción de rechazos puede aumentar la probabilidad de generar contenido que el modelo padre rechazaría, lo que requiere filtrado adicional en producción.
- Riesgo de alucinación: no se han publicado métricas específicas de alucinación; como todo modelo generativo, existe riesgo, especialmente en contexto largo donde la recuperación verificada no garantiza precisión factual.
- Limitaciones de contexto o idioma: el contexto configurado es de 1.048.576 tokens, pero la ventana efectiva puede degradarse en tareas que requieran razonamiento sobre todo el contexto; los idiomas soportados son solo inglés y coreano, sin soporte declarado de español.
- Restricciones de licencia: licencia MIT, permite uso comercial con atribución; sin embargo, el modelo base puede tener términos adicionales que no se detallan en la información disponible.
- Caveats para producción: el checkpoint está pensado para despliegue en dos nodos DGX Spark; el rendimiento medido es agregado con concurrencia C6, no por stream único; la cuantización mixta FP4/FP8 puede introducir diferencias numéricas frente al padre en tareas sensibles; el autor reporta validación determinista pero no se dispone de evaluación independiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que no ha sido validado por la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/pRxNeXuz/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio sparkDash (contrato de medición): https://github.com/MiaAI-Lab/sparkDash
- Commit de medición: `dfde4214f32b174880832a4d317d3c0567750ac5` (en el repositorio sparkDash)
- Commit del checkpoint padre: `9e165c30e2704aec5d9d593cce3eebd58bbef1cb` (en el repositorio del modelo base)
