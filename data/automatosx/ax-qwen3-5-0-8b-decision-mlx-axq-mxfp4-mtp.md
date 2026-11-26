# AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX Safetensors para Apple Silicon, desarrollado por AutomatosX a partir del modelo base mlx-community/Qwen3.5-0.8B-decision (revisión 36e166ca). Se trata de una conversión de precisión mixta realizada con el toolkit propietario AXQuant 2.1.0, que aplica cuantización de 4 bits (clase MXFP4) a la ruta de lenguaje mientras preserva en BF16 la torre de visión, la cabeza MTP (multi-token prediction) y las capas de normalización. El resultado medido es de 6,9103 BPW en el modelo principal y 7,1231 BPW contando la MTP.

El modelo no es un modelo conversacional al uso: es un modelo de decisión que puntúa una cabeza de esquema conjunta (joint schema head). Cargarlo con `mlx_lm.generate` produce texto que no corresponde a la salida real del modelo. La arquitectura subyacente es Qwen3_5ForConditionalGeneration (densa) con ruta de texto optimizada, 752.393.024 parámetros reales en safetensors (852,99 M lógicos según la model card), contexto configurado de 262.144 tokens y licencia Apache 2.0.

Su relevancia es doble: por un lado, ejemplifica las técnicas de cuantización mixta con preservación selectiva de tensores críticos en el ecosistema MLX; por otro, el propio autor lo etiqueta explícitamente como evidencia de desarrollo, no como certificado de calidad, y anuncia una reconstrucción futura con el toolkit mejorado. No publica mediciones de calidad, contexto largo, velocidad de kernel ni aceleración MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (densa), ruta de texto optimizada; incluye torre de visión y cabeza MTP |
| Parametros totales | 752.393.024 (safetensors reales); 852,99 M lógicos según model card |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite práctico dependiente de memoria unificada |
| Tipos de cuantizacion | AXQuant 2.1.0, clase MXFP4, precisión base 8bit; atención y MLP en formato AXQ; embeddings en 8-bit affine; visión, MTP y norms en BF16. BPW medido: 6,9103 (principal), 7,1231 (total con MTP) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura transformer densa de la familia Qwen3.5, concretamente Qwen3_5ForConditionalGeneration, que combina una ruta de lenguaje con una torre de visión y una cabeza de predicción multi-token (MTP). Sobre el checkpoint BF16 original se fusionó previamente una LoRA de rango 16 y escala 1.0 en los pesos de lenguaje; el fichero del adaptador no se incluye en este paquete. Posteriormente se aplicó la cuantización AXQuant 2.1.0, que asigna precisiones heterogéneas por tensor: atención y MLP en formato AXQ con clase MXFP4, embeddings en 8-bit affine, y visión, MTP y normalizaciones preservadas en BF16.

La innovación técnica principal es precisamente esa política de protección de tensores: el nombre del pack describe una clase de presupuesto de almacenamiento, no una precisión uniforme, de modo que el BPW medido es el dato autoritativo. La cabeza de esquema conjunta (`joint_head.safetensors`) se copia sin cambios desde el BF16 original, acompañada de `joint_head_config.json` y `decision_config.json`. No se han publicado detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible. El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversión.

## Capacidades

- Puntuación de una cabeza de esquema conjunta (joint schema head): es la función principal del modelo; no es un modelo de chat.
- Ruta de visión preservada en BF16, lo que permite procesamiento de entradas visuales según la arquitectura del modelo base.
- Predicción multi-token (MTP) mediante el sidecar `mtp.safetensors`, consumible por runtimes compatibles como oMLX 0.6.3rc2 o superior y MTPLX.
- Generación de texto a través del backbone, aunque el autor advierte que el texto producido por `mlx_lm.generate` no constituye la salida del modelo.
- Contexto configurado de 262.144 tokens, sujeto a los límites de memoria unificada del hardware Apple Silicon.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio: no disponible (audio explícitamente ausente).

## Casos de uso

- Evaluación de cuantización mixta en Apple Silicon: sirve como artefacto de referencia para estudiar cómo afecta una política AXQ con protección de tensores a un modelo de menos de mil millones de parámetros, comparando con el hermano MXFP8 del mismo autor.
- Clasificación y puntuación estructurada de decisiones: al puntuar un esquema conjunto, puede integrarse en pipelines que necesiten una señal de decisión sobre entradas multimodales, siempre que se use el runtime adecuado y no `mlx_lm.generate`.
- Investigación sobre decodificación especulativa con MTP: el sidecar MTP permite experimentar con aceleración multi-token en MTPLX u oMLX, aunque el autor no haya medido la aceleración.
- Desarrollo de prototipos locales en portátiles Apple: con 0,78 GB de pesos safetensors y 0,81 GB de descarga completa, cabe holgadamente en cualquier Mac con Apple Silicon y permite iterar sin infraestructura cloud.
- Pruebas de integración de runtimes MLX: útil para validar el flujo de importación de sidecars MTP en oMLX y la compatibilidad con MTPLX antes de adoptar modelos mayores de la misma familia.
- Docencia y divulgación sobre cuantización: el paquete incluye metadatos detallados (BPW medido, política de roles, contratos de runtime) que lo convierten en un ejemplo didáctico de empaquetado reproducible con revisión fijada por commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 0,81 GB de disco para la descarga completa y 0,78 GB de pesos safetensors; la memoria en ejecución depende del contexto configurado y de la carga de la torre de visión y la MTP en BF16.
- GPU recomendadas: cualquier chip Apple Silicon (serie M) con MLX-LM; no aplica a GPU NVIDIA o AMD en esta distribución, al no incluir pesos PyTorch ni GGUF.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; el tamaño es inferior a 1 GB.
- Opciones de despliegue: MLX-LM como runtime principal; oMLX 0.6.3rc2 o superior para importar el sidecar MTP y activar Lightning MTP; MTPLX para consumo directo del sidecar con perfil `stable` y profundidad 1. AX Engine no está validado: el paquete carece de `model-manifest.json` nativo verificado.
- Latencia y throughput: no disponibles; no se han medido velocidades de kernel ni de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP (este) | 752,4 M reales / 853 M lógicos | 262.144 | AXQ MXFP4, 6,91 BPW principal | Apache 2.0 | MLX Safetensors, 222 descargas |
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP (hermano del mismo autor) | mismo modelo base | 262.144 | AXQ MXFP8, visión/MTP/norms en BF16 | Apache 2.0 | MLX Safetensors |
| mlx-community/Qwen3.5-0.8B-decision (modelo base) | mismo modelo base en BF16 | 262.144 | BF16 sin cuantizar | Apache 2.0 | MLX Safetensors |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la diferencia documentada es exclusivamente de formato de bloque y presupuesto de bits.

## Limitaciones y advertencias

- No es un modelo de chat: emplear `mlx_lm.generate` produce texto que no es la salida del modelo; la salida real es la puntuación de la cabeza de esquema conjunta.
- Evidencia de desarrollo, no certificado de calidad: el autor lo declara explícitamente y anuncia una reconstrucción con el toolkit AXQuant mejorado, que reemplazará los ficheros actuales como nueva revisión.
- Ausencia de mediciones: no hay datos publicados de calidad, contexto largo, velocidad de kernel ni aceleración MTP.
- AX Engine no validado: sin `model-manifest.json` nativo verificado, la ejecución en AX Engine no está establecida; los campos de `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada.
- Dependencia de sidecar: la MTP no se carga con MLX-LM estándar; requiere oMLX o MTPLX y un directorio local escribible.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingüe en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al tratarse de un modelo de decisión, el riesgo se traslada a la fiabilidad de la señal de puntuación.
- Licencia Apache 2.0: permite uso comercial, pero conviene fijar un commit concreto en despliegues reproducibles dado el aviso de reconstrucción.
- El adaptador LoRA no se incluye en el paquete; ya está fusionado en los pesos, por lo que no puede recuperarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision/tree/36e166ca10c4d16471a231d66cfc22d80039fe34
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
