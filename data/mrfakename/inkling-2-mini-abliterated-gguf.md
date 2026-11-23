# mrfakename/Inkling-2-Mini-abliterated-GGUF

## Resumen

Inkling-2-Mini (abliterated) GGUF es una compilación de cuantizaciones del modelo multimodal Inkling-2-Mini de Thinking Machines, al que se le ha eliminado el comportamiento de rechazo mediante ablación direccional. El autor de la modificación es mrfakename, que publica tanto los pesos originales abliterados como estas versiones GGUF listas para su uso con llama.cpp. El modelo original es un transformer con arquitectura de capas "looped" (las capas 6-17 se ejecutan tres veces por token, dando 48 slots de capa por token) y un proyector de visión que lo habilita para tareas image-text-to-text.

La relevancia de esta ficha reside en dos aspectos. Por un lado, documenta un caso poco habitual de modificación de pesos sobre un modelo multimodal con capas recurrentes compartidas, donde la edición debe aplicarse de forma consistente a las tres pasadas de las capas centrales. Por otro, detalla el esfuerzo técnico por preservar la edición tras la cuantización: en lugar de un re-redondeo ingenuo (que dejaría entre el 50% y el 64% de la dirección eliminada reintroducida como ruido), se aplica una selección de código por fila que cancela el error de redondeo a lo largo de la dirección ablacionada.

El resultado son cinco ficheros GGUF que van desde 25,9 GiB (Q8_0) hasta 8,5 GiB (UD-Q2_K_XL), con tasas de rechazo reducidas de 100/100 a 1/100 en modo chat y de 76/100 a 0/100 en modo think, a costa de un incremento de KL de 0,116 en el primer token de prompts inofensivos. La licencia es Apache 2.0. Los parámetros totales registrados en safetensors son 8.048.640, aunque esta cifra parece corresponder únicamente a un subconjunto de tensores y no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas "looped" (capas 6-17 ejecutadas 3 veces por token, 48 slots de capa) |
| Parametros totales | 8.048.640 (dato de safetensors; no disponible el total real del modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, IQ4_NL, UD-Q4_K_XL (expertos NVFP4 + Q8_0), UD-Q2_K_XL (Q2_0, NVFP4, MXFP4), Q5_K, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Inkling-2-Mini de Thinking Machines, un transformer multimodal con un proyector de visión para entrada de imagen y texto. Su rasgo arquitectónico distintivo es el bucle de capas: las capas 6 a 17 se ejecutan tres veces por token, de modo que el modelo efectivo opera con 48 slots de capa por paso. Las capas centrales comparten pesos entre sus tres pasadas, lo que implica que cualquier modificación de pesos en esas capas afecta a las tres iteraciones. El modelo incluye además un router y controladores de bucle, así como 128 expertos en las capas de feed-forward (ffn_down_exps), lo que sugiere una arquitectura de mezcla de expertos (MoE) en esas capas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La modificación abliterated no reentrena el modelo: mide direcciones de rechazo por separado para chat (esfuerzo de razonamiento `none`) y para prompts de tipo think en el Q8_0, en cada uno de los 48 slots de capa. Mediante una búsqueda multiobjetivo (minimizar rechazos manteniendo bajo el KL del primer token en prompts inofensivos) se selecciona una única dirección (rango 1) con fuerzas por capa: 0,47-0,65 en las down-projections de expertos de las capas 6-23 y 0,97-1,31 en las salidas de atención de las capas 8-23. Esa dirección se proyecta fuera de las escrituras al residual stream en `attn_output` de 16 capas y `ffn_down_exps` (los 128 expertos) de 18 capas, es decir, 34 tensores en total. Las capas 0-5, el router, los controladores de bucle, los embeddings y el proyector de visión permanecen byte-idénticos a los cuantizados originales.

El trabajo de cuantización preserva la edición mediante una técnica específica: para los tipos de 2 y 4 bits (Q2_0, IQ4_NL, MXFP4, NVFP4) se conservan todas las escalas de bloque y cada peso se asigna al código inmediatamente inferior o superior a su objetivo, eligiendo fila por fila de modo que los errores de redondeo se cancelen a lo largo de la dirección eliminada. Solo los tensores editados se dequantizaron, editaron y recuantizaron a su tipo original; el resto es byte-idéntico.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text): acepta imágenes y texto como entrada.
- Modo de razonamiento explícito ("think mode") con esfuerzo de razonamiento configurable (`none` para chat directo).
- Conversación multi-turno en modo chat.
- Procesamiento de instrucciones dañinas sin rechazo (comportamiento abliterated): responde a solicitudes que el modelo original rechazaba.
- Soporte de visión mediante proyector de imagen (mmproj) independiente.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente o multilingüismo.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de rechazo y su eliminación direccional, comparando las respuestas del original y del abliterated en los mismos prompts, con una tasa de rechazo medida de 100/100 a 1/100 en chat.
- Evaluación de robustez de cuantizaciones: los ficheros permiten medir cuánto de una edición de pesos sobrevive a distintos tipos de cuantización (0,2% residual en Q8_0 frente a 7,1% en Q2_0), un caso práctico para investigar técnicas de cuantización consciente de ediciones.
- Despliegue local multimodal en hardware de consumo: el fichero UD-Q2_K_XL de 8,5 GiB permite ejecutar un modelo con visión en GPUs consumer mediante llama.cpp, con la salvedad de requerir el PR #32704 para los layouts de Unsloth.
- Análisis de sesgos y contenido dañino: al eliminar el rechazo, el modelo puede emplearse como generador controlado en pipelines de red-teaming para producir respuestas que un modelo alineado bloquearía, siempre en entornos aislados.
- Servicio de inferencia con llama-server: el comando documentado (`llama-server -m ... --mmproj ... --jinja`) permite levantar un endpoint compatible con plantillas Jinja para aplicaciones de chat con imagen.
- Aplicación de la edición como LoRA: el fichero `abliteration-lora.gguf` permite aplicar la ablación sobre otras cuantizaciones del modelo original sin necesidad de usar los GGUF parcheados, útil para experimentar con distintos niveles de cuantización manteniendo la edición.
- Estudio de arquitecturas con capas recurrentes: el modelo sirve como banco de pruebas para analizar cómo se propaga una intervención en pesos compartidos a través de las tres pasadas de las capas 6-17.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de la propia abliteración sobre el fichero Q8_0 con decodificación greedy:

| Métrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 100 | 1 |
| Modo think, rechazo en razonamiento o respuesta (/100) | 76 | 0 |
| KL del primer token en prompts inofensivos | 0 | 0,116 |

Los 100 prompts son solicitudes dañinas reservadas (held-out). Las respuestas de chat se limitaron a 384 tokens; en modo think también se usaron 384 tokens y ninguna respuesta terminó el razonamiento dentro de ese presupuesto, por lo que se evaluó el texto de razonamiento. La cifra de KL incluye un pequeño ruido de base procedente de la inferencia por lotes.

Residual de la edición tras cuantización (0 = eliminada exactamente, 1 = no sobrevive nada):

| Fichero | Tensores editados (tipo) | Residual, peor tensor |
|---|---|---|
| Q8_0 | todos Q8_0 | 0,2% |
| IQ4_NL | expertos IQ4_NL (14) + Q8_0 (4), atención Q8_0 | 1,6% |
| UD-Q4_K_XL | expertos NVFP4 (14) + Q8_0 (4), atención Q8_0 | 1,5% |
| UD-Q2_K_XL | expertos Q2_0 (7), NVFP4 (10), MXFP4 (1); atención Q8_0 / Q6_K / Q5_K | 7,1% (Q2_0); 5,0% (atención Q5_K); ≤1,7% en el resto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26 GiB para Q8_0, 16,4 GiB para IQ4_NL y UD-Q4_K_XL, y 8,5 GiB para UD-Q2_K_XL (tamaños de fichero; la VRAM real debe sumar el proyector de visión mmproj y el contexto KV).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para los cuantizados de 16,4 GiB; GPUs de 12-16 GB para UD-Q2_K_XL.
- Cabe en GPU consumer: sí, UD-Q2_K_XL (8,5 GiB) y UD-Q4_K_XL/IQ4_NL (16,4 GiB) en tarjetas de 12-16 GB y 24 GB respectivamente, siempre que se disponga de margen para el contexto y el proyector visual.
- Opciones de despliegue: llama.cpp (stock para Q8_0 e IQ4_NL; con el PR #32704 para UD-Q4_K_XL y UD-Q2_K_XL en layout mainline) y llama-server con `--mmproj` y `--jinja`. Los ficheros del layout de Unsloth requieren Unsloth Studio o el llama.cpp de Unsloth.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: los ficheros de Unsloth mantienen los pesos de expertos en NVFP4 y producen resultados incorrectos en llama.cpp mainline hasta que se integre el PR #32704 (las pasadas posteriores del bucle pierden las escalas por experto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated-GGUF (este) | no disponible (8.048.640 en safetensors) | no disponible | Sí (image-text-to-text) | Apache 2.0 | Disponible en GGUF, 5 variantes |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Sí | no disponible | Modelo original, con rechazo |
| mrfakename/Inkling-2-Mini-abliterated | no disponible | no disponible | Sí | Apache 2.0 | Pesos safetensors abliterated |
| ggml-org/Inkling-2-Mini-GGUF | no disponible | no disponible | Sí | no disponible | Cuantizaciones originales sin editar |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a disponibilidad, licencia y presencia de la modificación.

## Limitaciones y advertencias

- El modelo cumple con solicitudes dañinas: la abliteración reduce los rechazos de 100/100 a 1/100 en chat y de 76/100 a 0/100 en modo think. El autor declara explícitamente que el usuario es responsable del uso.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro; no debe desplegarse en aplicaciones de cara al público sin filtros externos.
- La edición no es perfecta tras cuantizar: en UD-Q2_K_XL queda hasta un 7,1% de la dirección eliminada en los expertos Q2_0 y un 5,0% en la atención Q5_K, lo que puede reintroducir rechazos o degradar el comportamiento.
- Los ficheros UD-Q4_K_XL y UD-Q2_K_XL en layout mainline requieren el PR #32704 de llama.cpp; sin él, los pesos NVFP4 de los expertos producen salida incorrecta.
- Los ficheros del layout de Unsloth solo funcionan con Unsloth Studio o el llama.cpp de Unsloth.
- No se dispone de información sobre sesgos, idiomas soportados, longitud de contexto ni alucinación del modelo base.
- La cifra de parámetros totales de safetensors (8.048.640) no parece corresponder al modelo completo; no debe usarse para estimar requisitos de memoria.
- El modo think con presupuesto de 384 tokens no completó el razonamiento en ninguno de los 100 prompts evaluados, lo que indica que el razonamiento puede requerir presupuestos mayores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de información sobre los datos de entrenamiento del modelo base impide evaluar riesgos de propiedad intelectual o sesgos de dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated-GGUF
- Modelo base abliterated (safetensors): https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones originales de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Cuantizaciones de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Notas de soporte mainline de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/tree/main/Mainline_Support
- PR de llama.cpp #32704: https://github.com/ggml-org/llama.cpp/pull/32704
- Discord del autor: https://discord.com/invite/foss
