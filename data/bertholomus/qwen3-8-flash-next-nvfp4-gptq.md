# bertholomus/Qwen3.8-Flash-Next-NVFP4-GPTQ

## Resumen

Qwen3.8-Flash-Next-NVFP4-GPTQ es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario independiente bertholomus (BertholomusAI). No se trata de un modelo nuevo, sino de una conversión de pesos diseñada específicamente para ejecutar el modelo base completo, con sus 262.144 tokens de contexto, en una única GPU RTX PRO 6000 Blackwell de 96 GB mediante el motor TensorFold 1.2.9. El modelo base lo desarrolla el equipo Qwen y se distribuye bajo la Qwen Community License 1.0.

La aportación técnica de esta ficha es la receta de cuantización: los expertos enrutados de la arquitectura MoE se almacenan en NVFP4 (E2M1 con escala FP8 cada 16 elementos y escala tensorial FP32), calibrados con GPTQ y empaquetados en el layout `MIXED_PRECISION` de ModelOpt, mientras que atención, DeltaNet, expertos compartidos, router, embeddings, LM head, cabeza MTP y torre de visión permanecen en BF16. Las activaciones se mantienen en BF16 (W4A16). El resultado ocupa 115,6 GB en disco y carga 109,1 GB en el motor.

Es relevante ahora porque demuestra que un modelo de 157.600 millones de parámetros con ventana de 256K y capacidades imagen-texto puede servirse en hardware de una sola tarjeta profesional Blackwell, con 152 tok/s en decodificación monostream y 6.702 tok/s de prefill en frío, sin modificar el motor de inferencia. La licencia, sin embargo, impone restricciones relevantes para uso comercial como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención y capas DeltaNet (detalles del base no disponibles); cuantización weight-only W4A16 |
| Parametros totales | 157.599.873.939 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1, escala FP8 por bloque de 16, escala FP32 tensorial) en expertos enrutados y tabla n-gram; BF16 en el resto; GPTQ-calibrated; layout ModelOpt `MIXED_PRECISION` |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (librería `tensorfold`); repo de 115,6 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) con 157.600 millones de parámetros totales, que combina capas de atención con capas DeltaNet (atención lineal de estado recurrente) y una cabeza MTP (multi-token prediction), además de una torre de visión que habilita el pipeline `image-text-to-text`. La model card de esta conversión no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se incluyen aquí.

La innovación de esta ficha es puramente de cuantización. Los expertos enrutados se cuantizan a NVFP4 con calibración GPTQ (Frantar et al., 2022), usando WikiText-2 (artículos de train) y código Python de exllamav3 como corpus de calibración, sin solapar documentos con el conjunto de evaluación. Se añade una tabla de embeddings n-gram también en NVFP4 (`ngram-*.safetensors`, 28,8 GB de los 109,1 GB cargados). El resto de componentes críticos para la calidad numérica permanece en BF16. El resultado declarado frente al redondeo NVFP4 directo (round-to-nearest) en el mismo layout es una KL media de 0,083 frente a 0,107, una concordancia top-1 del 89,3 % frente al 88,8 % y una perplejidad de 6,22 frente a 6,19 del BF16 de referencia.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 262.144 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`), según el pipeline declarado y la torre de visión conservada en BF16.
- Razonamiento de múltiples pasos y modo thinking (la medición de rendimiento se hizo con thinking desactivado; el modelo base soporta el modo).
- Recuperación de información en contextos muy largos: aguja encontrada a 130K y 250K tokens en las pruebas del autor.
- Generación de código y salida estructurada JSON exacta (validada en los smoke tests).
- Razonamiento matemático básico (smoke test superado).
- Servicio concurrente multiagente: hasta 8 flujos en paralelo con caché de prompt y pool de páginas KV compartido (modo experimental para 4 flujos a ventana completa).
- Soporte de tool calling y function calling: no documentado en la información disponible para esta conversión; debe verificarse contra el modelo base.

## Casos de uso

- Análisis de documentos extensos: contratos, informes técnicos o expedientes de más de 200K tokens en una sola pasada, aprovechando la ventana completa de 262.144 tokens y la recuperación verificada a 250K. Adecuado porque evita fragmentación y pérdida de contexto entre trozos.
- Asistente de código en producción: generación y revisión de parches con salida JSON validada, integrable en pipelines de CI/CD mediante el servidor de TensorFold con `--parallel 8`.
- Atención al cliente automatizada multi-turno: 8 agentes concurrentes con un system prompt compartido de ~8K tokens y caché de prompt activa, con primer token en 0,11-0,14 s y 416 tok/s agregados.
- Procesamiento de imágenes con texto asociado: extracción de información de capturas, diagramas o documentos escaneados gracias a la torre de visión en BF16 y al pipeline image-text-to-text.
- Investigación sobre cuantización extrema: banco de pruebas para estudiar el impacto de NVFP4 con GPTQ en modelos MoE grandes, con métricas de KL, perplejidad y concordancia top-1 ya publicadas.
- Despliegue en una sola estación de trabajo Blackwell: prototipado y demos internas sin clúster, con 152 tok/s de decodificación y 6.702 tok/s de prefill en frío sobre una RTX PRO 6000 de 96 GB.
- Auditoría y resumen de corpus legales o científicos: 4 documentos de ~241K tokens analizados en paralelo con el modo de páginas KV compartidas (experimental), con 4/4 agujas encontradas en 51-185 s.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX PRO 6000 Blackwell (96 GB, sm_120) con TensorFold 1.2.9, thinking desactivado y decodificación greedy. No se dispone de comparación con otros modelos en la información proporcionada.

| Metrica | Resultado |
|---|---|
| Decodificacion monostream (768 tokens nuevos) | 152 tok/s |
| Prefill, prompt de 32.797 tokens, en frio | 6.702 tok/s |
| Contexto maximo | 262.144 tokens |
| Aguja a 130K / 250K tokens | encontrada / encontrada |
| Repeticion greedy exacta | si |
| Smoke tests (matematicas, dato, codigo, JSON exacto) | 4 / 4 |
| KL media vs BF16 (GPTQ) | 0,083 |
| KL media vs BF16 (round-to-nearest NVFP4) | 0,107 |
| Concordancia top-1 (GPTQ / RTN) | 89,3 % / 88,8 % |
| Perplejidad (BF16 = 6,19) | 6,22 |

Rendimiento multiagente con `--parallel 8 --context 32768` y caché de prompt:

| Agentes | tok/s totales | tok/s por agente | Primer token p50 |
|---|---|---|---|
| 1 | 114 | 161 | 0,11 s |
| 4 | 315 | 92 | 0,12 s |
| 8 | 416 | 61 | 0,14 s |
| 16 (8 en espera) | 370 | 50 | 5,6 s |

## Requisitos de hardware

- VRAM: 109,1 GB cargados por el motor (80,3 GB de tensores del modelo + 28,8 GB de tabla n-gram). Una ventana completa de 262.144 tokens requiere la reserva de memoria por defecto; dos ventanas completas caben con `TENSORFOLD_MEMORY_RESERVE_GIB=1`.
- GPU recomendada: una RTX PRO 6000 Blackwell de 96 GB (sm_120). Es el único hardware probado por el autor.
- Otras GPU y motores: no probados según la model card. No hay datos de funcionamiento en A100, H100 o RTX 4090; por el tamaño de pesos (109,1 GB cargados) no cabe en GPUs de consumo de 24-48 GB sin modificaciones no documentadas.
- Despliegue: binario de release TensorFold 1.2.9 para Linux x86_64 (`tensorfold-1.2.9-linux-x86_64.tar.gz`, sha256 `d17ba88f…27187`), con `tensorfold-native serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 152 tok/s en decodificación monostream, 6.702 tok/s de prefill en frío, primer token de 0,11-0,14 s con caché de prompt en modo multiagente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-GPTQ (esta ficha) | 157,6 B | 262.144 | NVFP4 GPTQ W4A16 | Qwen Community 1.0 | 1x RTX PRO 6000 96 GB |
| Qwen/Qwen3.8-Flash-Next (BF16) | 157,6 B | 262.144 | BF16 | Qwen Community 1.0 | no disponible |
| Round-to-nearest NVFP4 (mismo layout) | 157,6 B | 262.144 | NVFP4 RTN | Qwen Community 1.0 | 1x RTX PRO 6000 96 GB |

No se dispone en la información proporcionada de datos de rendimiento ni de requisitos de hardware de las alternativas más allá de las métricas de calidad de la cuantización RTN. No se han identificado otros modelos comparables de la misma categoría en la documentación disponible.

## Limitaciones y advertencias

- Solo probado con TensorFold 1.2.9 en sm_120 (RTX PRO 6000 Blackwell). Otros motores y GPU no están validados; la portabilidad es nula sin trabajo adicional.
- La licencia Qwen Community License 1.0 exige licencia separada de Qwen para explotar el modelo como Model as a Service o AI Work Assistant; el uso interno sin acceso de terceros está exento. Revisar la cláusula 2 antes de alojar el modelo para terceros.
- La cuantización introduce degradación medible: KL media de 0,083 y perplejidad de 6,22 frente a 6,19 del BF16. La concordancia top-1 es del 89,3 %, por lo que aproximadamente 1 de cada 10 tokens difiere del modelo de referencia.
- El modo de 4 flujos a ventana completa con `TF_FLASHNEXT_KV_PAGES=256` está marcado como experimental, comparte un pool de páginas y desactiva la caché de prompt; algunos flujos esperan páginas y las latencias suben a 51-185 s.
- Con 16 agentes concurrentes, 8 quedan en espera y el primer token p50 se dispara a 5,6 s.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación específicas de esta conversión; deben evaluarse contra el modelo base.
- No se documenta soporte de tool calling ni function calling en esta ficha; verificarlo empíricamente antes de usarlo en agentes con herramientas.
- El repositorio tiene 41 descargas y 0 likes en el momento de la consulta: es una conversión de un autor independiente, sin validación de la comunidad ni del equipo Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bertholomus/Qwen3.8-Flash-Next-NVFP4-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta de despliegue (comando de arranque, instalación de agente, smoke test, herramientas de calidad): https://github.com/bertholomus/Qwen3.8-Flash-Next-NVFP4-Recipe
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Licencia Qwen Community 1.0: https://huggingface.co/bertholomus/Qwen3.8-Flash-Next-NVFP4-GPTQ/blob/main/LICENSE
- GPTQ (Frantar et al., 2022): no disponible en la información proporcionada
- WikiText-2: no disponible en la información proporcionada
