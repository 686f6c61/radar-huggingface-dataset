# pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient es un ajuste fino derivado de `deepseek-ai/DeepSeek-V4.1-Flash-1017` cuyo objetivo es eliminar la práctica totalidad de los rechazos duros (refusals) manteniendo las puntuaciones de referencia del modelo base. Lo publica el usuario `pentacoxian-dev` partiendo de un checkpoint intermedio de `Hikari07jp`, al que se le añade una ablación direccional por capas, una reparación del modo de razonamiento y una re-cuantización a FP8.

El modelo es un transformer de mezcla de expertos (MoE, con expertos compartidos visibles en las matrices `ffn.shared_experts.w2`) de 763.205.315.794 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la gama de modelos abiertos de gran escala. No se documenta el número de parámetros activos, la longitud de contexto ni el reparto de expertos.

Su relevancia es doble: por un lado, es un caso de estudio de ablación selectiva por capas (dosis mayor en capas tempranas, menor en las tardías que concentran el recuerdo factual) con evaluación de rechazos sobre 500 prompts dañinos y 350 benignos; por otro, documenta y parchea un fallo de no terminación en modo *thinking* que afecta al linaje del que procede, con mediciones antes/después sobre 48 trazas greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con expertos compartidos; edición sobre `attn.wo_b` y `ffn.shared_experts.w2` |
| Parametros totales | 763.205.315.794 (dato real de safetensors, ~763,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8 bits) en safetensors; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8, 8 bits) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 y Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel |
| Tamano del repositorio | 513,8 GB |
| Libreria y pipeline | transformers, text-generation; compatible con endpoints y con vLLM |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer MoE de DeepSeek (la edición toca explícitamente las matrices de salida de atención y de los expertos compartidos de la FFN). Sobre ese sustrato, el autor aplica **ablación direccional en el flujo residual a 40 capas**: para cada capa estima una dirección de rechazo `u_l` como la diferencia de medias de activaciones residuales entre prompts dañinos y prompts inocuos, normalizada a longitud unitaria, y proyecta las matrices de escritura fuera de esa dirección mediante `W' = W − k · u(uᵀW)`, aplicado a `attn.wo_b` y `ffn.shared_experts.w2`, con re-cuantización posterior a FP8.

El horario de dosis es la pieza que, según el autor, protege la capacidad: `k = 2,5` en las capas 0–24 y `k = 2,0` en las capas 25–39 (un 20 % menos de edición en las capas tardías, donde se concentra el recuerdo factual). Se añaden dos términos auxiliares de *steering* (una corrección de capa media deconfundida y vectores de fin de razonamiento y de frontera de respuesta) para restaurar la longitud de generación y el comportamiento de parada que una proyección simple acorta.

Además, el autor repara dos patologías del checkpoint de partida escribiendo direcciones en la cabeza de salida, obtenidas con sondas logísticas sin intercepto (`d_loop`, `d_recheck`, `d_eos`) ajustadas sobre estados ocultos finales capturados, con validación por pliegues que retienen prompts completos: `W'[end_of_thought] += 16·d_loop + 16·d_recheck` y `W'[EOS] += 8·d_eos`. Las direcciones de rechazo se ortogonalizan contra las tres (|cos| máximo de 0,022 por capa) para que la edición de rechazo no deshaga el arreglo de terminación. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en esta build.

## Capacidades

- Generación de texto en inglés con el perfil de razonamiento y código heredado del modelo base DeepSeek-V4.1-Flash-1017.
- Modo *thinking* de esfuerzo variable, con presupuesto de tokens ampliable (la evaluación del autor usa 16.384 tokens y esfuerzo 100).
- Modo no-thinking para respuestas directas (las métricas de MMLU 0-shot se miden en ese régimen).
- Respuesta a prompts dañinos con una tasa de rechazo del 5,2 % en la batería de 500, es decir, comportamiento prácticamente sin rechazos.
- Baja tasa de rechazo en prompts benignos (0,57 %), lo que reduce los falsos positivos en tareas legítimas.
- Terminación fiable del razonamiento: 0 de 48 trazas greedy agotaron el presupuesto de tokens, frente a 8 de 48 en el checkpoint de partida.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Capacidades de agente multietapa: no documentadas específicamente para esta build.
- Multilingüismo: limitado al inglés según la model card; no se declaran otros idiomas.
- Visión, audio u otras modalidades: no documentadas para esta build (el pipeline declarado es `text-generation`).

## Casos de uso

- **Investigación en seguridad y *red-teaming***: el modelo sirve como sujeto de prueba para medir la eficacia de clasificadores de contenido y de capas de moderación externas, ya que su tasa de rechazo del 5,2 % garantiza que las pruebas lleguen a material sensible sin que el modelo se auto-censure.
- **Generación de datos sintéticos para entrenar clasificadores de seguridad**: con 0,57 % de rechazos benignos, se pueden generar grandes volúmenes de pares instrucción-respuesta en inglés sobre temas límite sin perder ejemplos por rechazo, y usar el filtrado posterior con un clasificador aparte.
- **Estudio de ablación y alineación**: el método por capas con dosis diferenciada (k=2,5 frente a k=2,0) y la comparación de MMLU 0-shot (85,3 % frente a 86,8 % del base) lo convierten en un banco de pruebas reproducible para investigar el compromiso entre supresión de rechazos y retención de conocimiento factual.
- **Evaluación de fallos de razonamiento en modelos grandes**: el parche de no terminación y de re-verificación permite estudiar bucles de razonamiento a escala de 763B parámetros con trazas controladas, algo difícil de reproducir en modelos pequeños.
- **Escritura creativa y *roleplay* sin fricción**: para aplicaciones de ficción, narrativa interactiva o simulación de personajes donde los rechazos interrumpen la experiencia, siempre que exista una capa de política de uso y revisión humana en el producto.
- **Destilación y ajuste sobre un modelo docente sin rechazos**: generar corpus de razonamiento en inglés para destilar en modelos de 7B–30B desplegables en hardware de consumo, aprovechando que el docente no bloquea dominios.
- **Despliegue autoalojado con vLLM en inglés**: la build está etiquetada como compatible con vLLM y con endpoints, lo que permite servirla en clústeres propios con pesos FP8 y evitar dependencias de API de terceros.
- **Auditoría de linajes de modelos abliterados**: sirve para comparar recetas (esta, la de `Hikari07jp` y la de OrcaRouter) sobre las mismas baterías de rechazo y MMLU, con métricas publicadas y guion de clasificación (`repro/refusal_classifier.py`).

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras de rechazo son en modo greedy, sin *thinking*, 64 tokens nuevos, evaluadas con un clasificador basado en reglas.

| Metrica | Este modelo | Base (DeepSeek-V4.1-Flash-1017) | Abliteration de OrcaRouter |
|---|---:|---:|---:|
| Rechazo en prompts dañinos (500) | 5,2 % | 87,6 % | 7,4 % |
| Rechazo en dañinos, held-out (660) | 3,9 % | no disponible | no disponible |
| Rechazo en prompts benignos (350) | 0,57 % | 4,6 % | 0,6 % |
| Respuesta con salvedad previa, dañinos (500) | 6,2 % | no disponible | ~36–61 % |
| MMLU completo (13.868, 0-shot) | 85,3 % | 86,8 % | no disponible |
| MMLU (300 preguntas, thinking) | 89,0 % | 89,3 % | 92,0 % (BF16, 300 preguntas) |

Prueba de terminación en modo *thinking* (48 trazas greedy, presupuesto de 16.384 tokens, esfuerzo 100):

| Metrica | Checkpoint de partida | Este modelo |
|---|---:|---:|
| Trazas que agotan el presupuesto de tokens | 8 de 48 | 0 de 48 |
| Span repetido más largo | 56.500 caracteres | 2.000 caracteres |
| Precisión en la batería de grading | 30 de 32 | 30 de 32 |

## Requisitos de hardware

- **Peso de los pesos**: 763,2B parámetros en FP8 implican aproximadamente 763 GB solo de pesos, antes de caché KV y activaciones. En BF16 serían unos 1,53 TB.
- **GPU de centro de datos**: para FP8 con margen operativo, un nodo de 16×H100 80 GB (1,28 TB) o 8×H200 141 GB (1,13 TB). En BF16 se necesitan del orden de 24×H100 80 GB.
- **Cuantización adicional**: a 4 bits el peso baja a unos 380–400 GB, lo que permitiría 8×H100 80 GB o 4×H200; no se publican pesos de 4 bits en el repositorio.
- **GPU de consumo**: no cabe en ninguna GPU de consumo actual, ni siquiera en configuraciones multi-GPU de 4×RTX 4090 (96 GB), que quedan muy por debajo incluso del mínimo a 4 bits.
- **Despliegue**: vLLM (etiqueta explícita en el repositorio y `endpoints_compatible`), transformers como vía de referencia. llama.cpp y Ollama no son viables a esta escala sin cuantizaciones publicadas; TGI no está documentado para esta arquitectura.
- **Discrepancia a verificar**: el repositorio declara 513,8 GB, por debajo de los ~763 GB que exigiría una copia FP8 completa de 763,2B parámetros. Conviene inspeccionar el índice de shards antes de aprovisionar hardware.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | MMLU (300q, thinking) | Rechazo en dañinos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 763,2B | no disponible | 89,0 % | 5,2 % | MIT | HuggingFace, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible en la informacion (fuentes externas citan ~552B) | no disponible | 89,3 % | 87,6 % | no disponible | HuggingFace oficial |
| Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel | no disponible | no disponible | no disponible (30/32 en grading propio) | no disponible | no disponible | HuggingFace |
| Abliteration de OrcaRouter | no disponible | no disponible | 92,0 % (BF16, 300 preguntas) | 7,4 % | no disponible | no disponible |

Frente al base, este modelo reduce el rechazo en dañinos 16,8 veces (87,6 % → 5,2 %) a costa de 1,5 puntos de MMLU 0-shot (86,8 % → 85,3 %) y 0,3 puntos en MMLU con *thinking* (89,3 % → 89,0 %). Frente a la ablación de OrcaRouter, reduce el rechazo (5,2 % frente a 7,4 %) y las salvedades previas (6,2 % frente a ~36–61 %), pero queda 3 puntos por debajo en MMLU con *thinking* (89,0 % frente a 92,0 %, aunque la comparación es BF16 contra FP8 y con distinto tamaño de batería).

## Limitaciones y advertencias

- **Riesgo de seguridad por diseño**: la eliminación de rechazos es intencionada (5,2 % en dañinos). No es un modelo apto para aplicaciones de cara al público sin una capa de moderación externa y una política de uso explícita.
- **Licencia MIT**: permisiva y permite uso comercial, pero traslada al desplegador toda la responsabilidad legal y de cumplimiento sobre el contenido generado.
- **Solo inglés**: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al base.
- **Alucinación**: no se publican mediciones de veracidad ni de calibración; el modelo base DeepSeek es propenso a errores factuales en dominios especializados, y la ablación en capas tardías (donde reside el recuerdo factual) puede agravar este punto pese al ajuste de dosis.
- **Bucles de razonamiento**: el parche reduce el problema (0 de 48 trazas agotan presupuesto), pero el span repetido máximo sigue siendo de 2.000 caracteres, y el autor indica que la patología requiere condiciones concretas (greedy y esfuerzo alto) para reproducirse.
- **Receta de reproducción incompleta**: la model card proporcionada se corta a mitad de frase en la sección de reproducción ("The pathology needs *both* greed"), de modo que el procedimiento exacto no está disponible en su totalidad.
- **Discrepancia de parámetros**: los safetensors declaran 763,2B parámetros mientras fuentes externas atribuyen ~552B al modelo base DeepSeek-V4.1-Flash-1017; además, el tamaño del repositorio (513,8 GB) no cuadra con una copia FP8 completa. Verificar el contenido real antes de usarlo en producción.
- **Sin validación comunitaria**: 0 descargas y 0 likes, creado y actualizado el mismo día (25 de octubre de 2026). Es un artefacto de investigación sin evidencia de uso en producción.
- **Sesgos**: no se documenta ninguna evaluación de sesgos demográficos, políticos o culturales; la ablación de rechazos puede alterar la distribución de respuestas en temas sensibles de forma no medida.
- **Sin datos de contexto ni de tool calling**: no se puede asumir un comportamiento fiable en agentes o en ventanas largas sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de inferencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/main/inference
- Checkpoint de partida (Hikari07jp): https://huggingface.co/Hikari07jp/DeepSeek-V4.1-1017-Ablitrated-testmodel
- Ficha del modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Análisis de DeepSeek V4.1 Flash 1017: https://unlimitedai.org/2026/10/19/deepseek-v4-1-flash-1017/
- Análisis técnico y benchmarks del base: https://local-ai-zone.github.io/blog/deepseek-v4-1-flash-1017-deep-dive.html
- Resumen de características del base: https://www.iweaver.ai/blog/deepseek-v4-1-flash-1017/
