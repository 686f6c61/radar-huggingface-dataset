# shanjiaz/Qwen3.8-27B-LiLiCorr-block8-epoch0

## Resumen

`shanjiaz/Qwen3.8-27B-LiLiCorr-block8-epoch0` es un **modelo borrador (draft) para decodificación especulativa** entrenado para acelerar la inferencia de `Qwen/Qwen3.8-27B`. No es un modelo de lenguaje autónomo: su única función es proponer secuencias cortas de tokens candidatos que el modelo objetivo verifica después. Lo publica el usuario de Hugging Face `shanjiaz` como artefacto intermedio de un entrenamiento de dos épocas; este checkpoint corresponde a la época 0 (zero-indexed) en el paso global 143.334, y el autor advierte explícitamente de que no es una recomendación de despliegue.

El modelo tiene 1.901.182.602 parámetros (~1,9 B) en formato safetensors (3,8 GB de repositorio) y se apoya en la técnica **LiLiCorr** implementada sobre el proyecto `vllm-project/speculators`. Usa un tamaño de bloque de 8 (7 tokens especulativos por paso), un backbone borrador de cinco capas con atención SDPA y un vocabulario completo, más cabezas LiLiCorr con top-k de candidatos 8, dimensión oculta/factor 1.024, dos capas y ocho cabezas. La secuencia de entrenamiento es de 8.192 tokens con un máximo de 1.024 anclas.

Su relevancia es doble: por un lado, documenta el estado del arte en decodificación especulativa aplicada a un objetivo denso multimodal de 27,8 B parámetros (Qwen3.8-27B, publicado por Tongyi Lab bajo Apache 2.0 según la documentación del modelo base); por otro, es un caso útil de artefacto de investigación reproducible, con métricas de validación publicadas y *commits* exactos del código de entrenamiento, pero sin validación de serving ni *benchmarking* end-to-end.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo borrador transformer denso de 5 capas con atención SDPA y vocabulario completo, acoplado a LiLiCorr (top-k de candidatos 8, dim. oculta/factor 1024, 2 capas de cabeza, 8 cabezas) para decodificación especulativa sobre Qwen3.8-27B; block size 8 (7 tokens especulativos) |
| Parámetros totales | 1.901.182.602 (~1,9 B) según safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8.192 tokens de secuencia de entrenamiento; máximo de 1.024 anclas; chunk de pérdida de 128 anclas. El modelo objetivo Qwen3.8-27B declara hasta 256K de ventana en su model card |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible en la model card de este checkpoint; el modelo base es multimodal y multilingüe, pero el autor no detalla la cobertura |
| Licencia | No disponible para este checkpoint. El modelo base `Qwen/Qwen3.8-27B` se distribuye bajo Apache 2.0 según la documentación de Tongyi Lab |
| Formato de pesos | safetensors con `custom_code` (módulo de configuración propio del repositorio), 3,8 GB |

## Arquitectura y entrenamiento

El borrador combina un backbone transformer ligero de cinco capas (atención SDPA, vocabulario completo del objetivo) con el mecanismo **LiLiCorr**, que añade cabezas de predicción sobre estados auxiliares del modelo objetivo. Concretamente, se supervisa contra las capas auxiliares 4, 12, 20, 28, 36, 44, 52 y 60, más el estado de la capa final 64 para la supervisión tipo *teacher*. La configuración LiLiCorr usa top-k de candidatos 8, dimensión oculta/factor de 1.024, dos capas de cabeza y ocho cabezas de atención. El entrenamiento emplea un decaimiento exponencial fijo de la pérdida de posición con gamma 3.0, tamaño de bloque 8 y 7 tokens especulativos.

El *training run* usó cuatro réplicas H100 para extracción de estados del objetivo y cuatro rangos H100 para el entrenamiento, con FSDP y *gradient checkpointing*. Los hiperparámetros publicados son Muon con LR de matrices 0.001, AdamW con LR de no-matrices 0.001, scheduler coseno y 4 % de *warmup*. El ajuste se hizo contra la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen3.8-27B, usando el código del repositorio `vllm-project/speculators` en la rama LiLiCorr, commit `d8c73a887afb39d68daba5a81bd2020585cbc186`, partiendo de `examples/train/lilicorr_qwen38_27b_full`. No se ha publicado información sobre el volumen de tokens, la composición del dataset, ni sobre fases de RLHF/DPO; el autor excluye explícitamente datos de entrenamiento, identificadores de *datasets* privados, rutas locales y estados de optimizador del repositorio.

## Capacidades

- **Generación de tokens especulativos**: propone bloques de hasta 8 posiciones (7 tokens más el ancla) que el modelo objetivo verifica en paralelo. No genera texto de forma autónoma.
- **Aceleración de decodificación**: pensado para reducir el número de pasos secuenciales del objetivo Qwen3.8-27B en inferencia autorregresiva.
- **Predicción multi-capa**: utiliza estados intermedios del objetivo (capas 4 a 60) como señal de supervisión, lo que le permite alinearse con representaciones internas del modelo grande.
- **Ventana de trabajo corta**: 8.192 tokens de secuencia y hasta 1.024 anclas, suficiente para los bloques de borrador pero muy inferior a la ventana de 256K del objetivo.
- **Compatibilidad condicionada**: requiere implementaciones de entrenamiento y serving con soporte LiLiCorr; el autor indica que la compatibilidad con versiones estándar de vLLM «no está establecida».
- **Sin tool calling, sin agentes, sin visión**: al ser un borrador, no expone function calling, razonamiento multi-paso ni procesamiento multimodal propio; esas capacidades residen en el modelo objetivo.
- **Multilingüismo**: no documentado para el borrador; heredaría el comportamiento del objetivo solo en la medida en que el vocabulario compartido lo permita.

## Casos de uso

- **Reducción de latencia en serving de Qwen3.8-27B**: desplegar el borrador junto al objetivo en vLLM con soporte LiLiCorr para disminuir el tiempo por token en cargas interactivas. Requiere validar antes la aceptación real, que el autor no ha medido.
- **Aumento de throughput en inferencia por lotes**: con bloques de 8 posiciones verificadas por paso, el objetivo puede procesar más tokens por iteración de decodificación en *pipelines* de generación masiva (resúmenes, clasificación, extracción).
- **Asistentes de código de baja latencia**: integrado en un servidor de autocompletado sobre Qwen3.8-27B, donde la latencia por token es crítica y el vocabulario compartido favorece la aceptación de borradores.
- **Investigación en decodificación especulativa**: punto de partida reproducible (commits y revisión fijados) para estudiar el efecto de block size, gamma y número de capas auxiliares en la tasa de aceptación.
- **Evaluación comparativa de métodos de *speculation***: útil como referencia LiLiCorr frente a EAGLE, Medusa o borradores independientes, siempre con el mismo objetivo y el mismo *hardware*.
- **Despliegue on-premise de modelos densos de 27B**: en entornos con GPU de 80 GB donde el objetivo en BF16 ocupa ~55,6 GB y el borrador añade unos 3,8 GB, permitiendo inferencia acelerada sin salida a la nube.
- **Procesamiento de documentos con el objetivo multimodal**: el borrador acelera la rama de generación de texto del pipeline de Qwen3.8-27B; la parte visual la aporta íntegramente el objetivo.
- **Banco de pruebas de serving**: escenario para medir aceptación y *speedup* reales con la build personalizada de vLLM antes de promover un checkpoint final de la segunda época.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo, además, no es evaluable como LM autónomo. Las únicas métricas publicadas son de validación *held-out* tras la época 0, con EAL calculado sobre tokens argmax del objetivo forzados por *teacher* y contando prefijo correcto más un token de bonificación del verificador:

| Métrica | Valor |
|---|---:|
| Loss | 0,867 |
| LiLiCorr EAL | 3,612 |
| Top-1 EAL | 3,341 |
| Oracle EAL | 4,812 |

Los valores exactos están en `val_metrics.json` dentro del repositorio. El autor advierte de que estas cifras **no** son aceptación medida en serving, ni throughput, ni *speedup*. Los checkpoints de inicialización y el *smoke check* de 40 pasos pasaron las comprobaciones nativas de generación especulativa de vLLM con esta configuración de block size 8; este checkpoint de época 0 no ha pasado validación de serving ni *benchmarking* end-to-end.

## Requisitos de hardware

- **VRAM del borrador**: ~3,8 GB en BF16/FP16 (1,9 B × 2 bytes, coherente con el tamaño del repositorio). Cuantizado a INT8 serían ~1,9 GB y a INT4 ~0,95 GB, pero no hay checkpoints cuantizados publicados ni soporte documentado.
- **VRAM del modelo objetivo**: Qwen3.8-27B (27,8 B densos) requiere ~55,6 GB en BF16, ~27,8 GB en FP8 y ~14-15 GB en cuantización de 4 bits (estimaciones teóricas de tamaño de pesos, sin contar caché KV).
- **GPU recomendadas**: H100 80 GB o A100 80 GB para objetivo en BF16 más borrador, que es el entorno empleado en el entrenamiento (8× H100 en total entre extracción y entrenamiento). Para objetivo en FP8, una L40S 48 GB o H100 80 GB; para objetivo en 4 bits, una RTX 4090 24 GB podría alojar los pesos, aunque el soporte del *stack* LiLiCorr en consumer no está acreditado.
- **¿Cabe en GPU de consumo?**: el borrador por sí solo sí (cualquier GPU con 6-8 GB libres), pero es inútil sin el objetivo de 27B. El conjunto completo no cabe en BF16 en ninguna GPU de consumo; en 4 bits el objetivo más el borrador ocuparían ~16-19 GB, ajustado en 24 GB.
- **Opciones de despliegue**: vLLM con la build personalizada que incluye soporte de traducción LiLiCorr (rama del commit indicado). No hay constancia de soporte en llama.cpp, Ollama, TGI ni SGLang; el autor declara que la compatibilidad con versiones estándar de vLLM no está establecida.
- **Latencia y throughput**: no disponibles. No se han publicado medidas de aceptación, *speedup* ni tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| LiLiCorr block8 epoch0 (este) | Borrador de decodificación especulativa sobre Qwen3.8-27B | ~1,9 B | 8.192 tokens de entrenamiento (1.024 anclas) | Loss 0,867; EAL LiLiCorr 3,612; Top-1 EAL 3,341 | No disponible | Pesos safetensors en HF, requiere custom_code y vLLM modificado |
| Qwen3.8-27B sin especulación | Modelo objetivo denso multimodal | 27,8 B | 256K | Benchmarks publicados por Tongyi Lab | Apache 2.0 | Hugging Face y Model Studio |
| Borradores tipo EAGLE-3 | Cabezas de borrador sobre estados del objetivo | No disponible | No disponible | No disponible | No disponible | Requiere implementación específica |
| Cabezas Medusa | Cabezas de predicción múltiple sobre el objetivo | No disponible | No disponible | No disponible | No disponible | Integradas en algunos *frameworks* de serving |

La comparación cuantitativa con EAGLE-3 o Medusa no es posible con la información disponible: no se han publicado aquí sus parámetros, contextos ni tasas de aceptación en este objetivo concreto. La ventaja diferencial de este checkpoint es la trazabilidad (revisión exacta del objetivo y *commit* del código) y la publicación de métricas EAL; su desventaja es la ausencia total de validación de serving.

## Limitaciones y advertencias

- **No es un modelo de lenguaje utilizable**: no responde prompts ni genera texto coherente por sí mismo; solo produce tokens candidatos que el objetivo debe verificar.
- **Artefacto intermedio**: corresponde a la época 0 de un entrenamiento de dos épocas; el autor lo describe como «not a final deployment recommendation».
- **Sin validación de serving**: no se ha medido aceptación real, latencia ni *speedup*; las métricas EAL son *teacher-forced* y no equivalen a rendimiento en producción.
- **Dependencia de una build no estándar**: requiere vLLM con soporte LiLiCorr y el módulo `custom_code` del repositorio; la compatibilidad con versiones estándar de vLLM «no está establecida», lo que complica el mantenimiento y la actualización.
- **Licencia indefinida**: la model card no declara licencia para este checkpoint. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el artefacto derivado es un riesgo jurídico para uso comercial.
- **Riesgo de alucinación heredado**: cualquier token aceptado incorrectamente por el verificador puede introducir errores; el borrador no filtra contenido ni aplica salvaguardas propias.
- **Ventana corta**: 8.192 tokens de secuencia y 1.024 anclas limitan el uso en contextos largos, aunque el objetivo soporte 256K; el borrador solo ve la ventana local de bloque.
- **Sesgos**: no documentados. El autor excluye datos de entrenamiento y composición del dataset, por lo que no es posible auditar sesgos del borrador; los del objetivo se heredan a través del vocabulario y de la verificación.
- **Idiomas no declarados**: no hay lista de idiomas soportados; el comportamiento multilingüe depende por completo del objetivo.
- **Reproducibilidad parcial**: se publican *commits* y revisión del objetivo, pero no los datos, los estados del optimizador ni el inventario de entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shanjiaz/Qwen3.8-27B-LiLiCorr-block8-epoch0
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de entrenamiento (vLLM Speculators, rama LiLiCorr, commit `d8c73a8`): https://github.com/vllm-project/speculators/tree/d8c73a887afb39d68daba5a81bd2020585cbc186
- Repositorio Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación en Alibaba Cloud Model Studio: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-27b
- Análisis técnico de Qwen3.8-27B (Local AI Zone): https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Guía de despliegue local de Qwen3.8-27B (Essa Mamdani): https://essamamdani.com/blog/qwen38-27b-local-deployment-guide-2026
