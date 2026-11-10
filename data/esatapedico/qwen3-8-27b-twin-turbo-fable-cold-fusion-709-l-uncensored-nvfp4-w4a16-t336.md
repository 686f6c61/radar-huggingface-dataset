# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-W4A16-T336

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-W4A16-T336 es un checkpoint cuantizado en NVFP4 del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, publicado por el usuario esatapedico. Se trata de una conversión orientada al servicio de inferencia con vLLM sobre hardware Blackwell, que aplica cuantización de solo pesos en formato W4A16 con escalas FP8 E4M3 y tamaño de grupo 16 sobre 336 tensores. El resultado es un único fichero safetensors de aproximadamente 21 GB que reduce de forma sustancial el peso en memoria respecto al modelo base de 27.356 millones de parámetros.

El modelo hereda la arquitectura híbrida GatedDeltaNet de la familia Qwen3.5/3.8, con 64 capas, de las cuales 48 son de atención lineal DeltaNet y el resto de atención completa, además de una cabeza MTP (multi-token prediction) pensada para decodificación especulativa. El ajuste TWIN-TURBO del autor original busca reducir el número de tokens de razonamiento manteniendo la calidad de salida, y la variante "Uncensored" elimina restricciones de alineamiento. El contexto declarado alcanza los 262.144 tokens.

La relevancia de esta ficha radica en que documenta una ruta concreta de despliegue eficiente: cuantización NVFP4 selectiva que preserva en BF16 las proyecciones de atención completa, los embeddings, la torre de visión y la cabeza MTP, mientras comprime las MLP y las proyecciones DeltaNet. El autor reporta una perplejidad de 3,19 frente a 3,20 del checkpoint padre de 256 tensores, lo que sugiere que la compresión adicional no degrada de forma medible la calidad en su conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GatedDeltaNet (48 capas de atención lineal + 16 de atención completa), 64 capas, con cabeza MTP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A16, group size 16, escalas FP8 E4M3, solo pesos, 336 tensores; sin datos de calibración |
| Idiomas soportados | Inglés y multilingüe (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`); sin GGUF en el repositorio |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida denominada GatedDeltaNet, que combina capas de atención lineal con mecanismo DeltaNet y capas de atención completa en una proporción de 48 a 16 sobre un total de 64 capas. Incorpora además una cabeza de predicción multi-token (MTP) que habilita decodificación especulativa en motores compatibles, y una torre de visión que lo capacita para tareas image-text-to-text. El contexto declarado es de 262.144 tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. El ajuste TWIN-TURBO del autor DavidAU se describe como una optimización orientada a reducir los tokens de razonamiento generados manteniendo la calidad de salida. La cuantización de esta ficha se aplicó sin datos de calibración y de forma selectiva: se cuantizaron las MLP de las 64 capas (192 tensores) y las proyecciones `in_proj_qkv`, `z` y `out_proj` de las 48 capas DeltaNet (144 tensores), mientras que `lm_head`, las proyecciones q/k/v/o de atención completa, los embeddings de tokens, la torre de visión, la cabeza MTP y las dinámicas `conv1d` e `in_proj_a/b` de DeltaNet se mantuvieron en BF16.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con ventana de hasta 262.144 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión preservada en BF16.
- Razonamiento multi-paso y modo de pensamiento, heredado de la familia Qwen3.5/3.8 y modulado por el ajuste TWIN-TURBO para reducir tokens de razonamiento.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Soporte multilingüe según las etiquetas del repositorio, aunque la model card no detalla la lista completa de idiomas.
- Compatibilidad con vLLM y con el ecosistema `compressed-tensors`; el autor verifica servicio con tensor parallel 2 y contexto 2048.
- No se documenta explícitamente soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Servicio de inferencia en producción con vLLM sobre GPUs Blackwell: el checkpoint está empaquetado en `compressed-tensors` y se autodetecta desde `config.json`, lo que permite desplegarlo con `--quantization compressed-tensors` y aprovechar la reducción de memoria del formato NVFP4.
- Procesamiento de documentos largos y conversaciones multi-turno: la ventana de 262.144 tokens permite ingerir contratos, informes o hilos completos sin truncamiento, algo útil en asistentes legales o de análisis documental.
- Análisis de imágenes con texto asociado: la torre de visión en BF16 posibilita tareas de descripción, extracción de información o respuesta a preguntas sobre capturas y diagramas.
- Generación asistida con decodificación especulativa: la cabeza MTP permite acelerar la generación en motores que la soportan, reduciendo la latencia por token en cargas interactivas.
- Investigación sobre cuantización selectiva: el checkpoint sirve como referencia para estudiar el impacto de cuantizar MLP y proyecciones DeltaNet mientras se preservan atención completa y embeddings, con una perplejidad reportada de 3,19.
- Despliegue en configuraciones multi-GPU moderadas: con tensor parallel 2 verificado y un peso de unos 21 GB, encaja en nodos de dos GPUs con memoria suficiente, reduciendo el coste frente al modelo en BF16.
- Experimentación con modelos sin alineamiento: para estudios de robustez, red teaming o evaluación de sesgos, la variante Uncensored permite observar comportamientos sin las restricciones habituales, con las cautelas correspondientes.

## Benchmarks y rendimiento

| Metrica | Este checkpoint (336 tensores) | Checkpoint padre (256 tensores) |
|---|---|---|
| Perplejidad (payload inglés diverso) | 3,19 | 3,20 |

El autor indica que la perplejidad es equiparable entre ambos checkpoints y que la cuantización de DeltaNet no introduce un coste medible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 21 GB solo para pesos en NVFP4; con caché KV en FP8 y contexto largo, la memoria adicional crece de forma proporcional al contexto y al número de secuencias concurrentes.
- GPUs recomendadas: hardware Blackwell (serie B200, RTX 50) para aprovechar NVFP4 de forma nativa; el autor verifica servicio con tensor parallel 2.
- Compatibilidad con GPUs consumer: no confirmada en la información disponible; el formato NVFP4 requiere soporte hardware específico, por lo que GPUs Ampere o Ada no lo ejecutan de forma nativa.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (autodetectado); no hay GGUF en el repositorio, por lo que llama.cpp u Ollama no son una vía directa con este checkpoint.
- Caché KV: FP8 es un flag de runtime, no bytes incluidos en el checkpoint.
- Latencia y throughput: no disponibles; el autor solo confirma generación coherente con tensor parallel 2 y contexto 2048.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (T336) | 27,36 B | 262.144 | NVFP4 W4A16, 336 tensores | Apache 2.0 | Perplejidad 3,19; pesos ~21 GB |
| Hermano T400 | 27,36 B | 262.144 | NVFP4 W4A16, 400 tensores | Apache 2.0 | Build de servicio del mismo autor |
| Hermano T256 | 27,36 B | 262.144 | NVFP4, 256 tensores | Apache 2.0 | Perplejidad 3,20; más conservador |
| Modelo base DavidAU | 27,36 B | 262.144 | BF16 | Apache 2.0 | Sin cuantizar; mayor huella de memoria |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La variante Uncensored elimina restricciones de alineamiento, lo que incrementa el riesgo de generar contenido dañino, sesgado o inexacto; no es adecuada para producción orientada a usuarios finales sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el ajuste sin alineamiento.
- La cuantización se realizó sin datos de calibración; aunque el autor reporta perplejidad equiparable, no se han publicado evaluaciones en tareas específicas (código, matemáticas, visión) que confirmen la ausencia de degradación.
- El formato NVFP4 depende de hardware Blackwell y de motores compatibles con `compressed-tensors`; no es portable a GPUs sin soporte nativo ni a llama.cpp/Ollama al no incluir GGUF.
- El contexto declarado de 262.144 tokens exige memoria considerable para la caché KV en despliegues reales; el autor solo verifica 2048 tokens.
- La lista completa de idiomas soportados no está documentada; las etiquetas indican inglés y multilingüe sin detalle.
- Aunque la licencia es Apache 2.0, el modelo deriva de un tune de terceros y de Qwen3.8-27B; conviene revisar las condiciones de los modelos intermedios antes de un uso comercial.
- La model card indica que fue escrita con asistencia de IA, lo que aconseja verificar los datos técnicos contra el `config.json` del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-W4A16-T336
- Modelo base del autor: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Checkpoint hermano de 256 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4
- Checkpoint hermano de 400 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-W4A16-T400
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor de la cuantización: https://www.esatapedico.com
