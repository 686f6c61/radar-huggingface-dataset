# mlboydaisuke/LFM2-1.2B-ExecuTorch

## Resumen

El modelo `mlboydaisuke/LFM2-1.2B-ExecuTorch` es una versión cuantizada y exportada a formato ExecuTorch del modelo base `LiquidAI/LFM2-1.2B`, desarrollado por Liquid AI. Esta adaptación está pensada para ejecución en dispositivos (on-device) mediante el backend XNNPACK, lo que permite inferencia eficiente en CPU sin necesidad de GPU. El archivo resultante, `lfm2_1_2b_xnnpack_8da4w_e8.pte`, ocupa 740.8 MB y emplea una cuantización mixta de 8 bits para activaciones y 4 bits para pesos (8da4w), además de una cuantización de 8 bits para las capas de embedding.

El modelo se distribuye bajo la licencia LFM Open License v1.0 y está orientado a tareas de generación de texto. La model card incluye una verificación en Mac arm64 que reporta una velocidad de decodificación de 104.6 tokens por segundo, aunque no se han publicado resultados de benchmarks estándar. Su contexto máximo es de 2048 tokens, lo que lo hace adecuado para aplicaciones de chat y asistentes locales con requisitos de memoria moderados.

La relevancia de este modelo radica en su optimización para entornos con recursos limitados, como teléfonos móviles o dispositivos edge, donde la eficiencia computacional es crítica. Al estar basado en LFM2, un modelo híbrido de Liquid AI, hereda las ventajas de esa arquitectura en términos de velocidad y memoria, aunque la documentación proporcionada no detalla los componentes internos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (según información general de LFM2, no detallada en la model card) |
| Parametros totales | No disponible (el nombre sugiere 1.2B, pero no se confirma oficialmente) |
| Parametros activos | No disponible |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + 8-bit embedding |
| Idiomas soportados | No disponibles |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | ExecuTorch .pte |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna ni el proceso de entrenamiento del modelo. Se sabe que el modelo base es `LiquidAI/LFM2-1.2B`, que según información pública de Liquid AI pertenece a una nueva generación de modelos híbridos (combinando mecanismos de atención y otras técnicas) disponibles en tamaños de 350M, 700M y 1.2B parámetros. Sin embargo, la documentación específica de esta exportación no incluye datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La exportación a ExecuTorch se realizó con la versión 1.4.0, utilizando `export_llm` con forma estática (seq_len=1) y `max_seq_length` de 2048. Se empleó el backend XNNPACK con `extended_ops`. La model card menciona tres verificaciones previas a la exportación: la activación de `use_sdpa_with_kv_cache`, la divisibilidad de `dim` y `hidden_dim` por el tamaño de grupo del cuantizador, y la lectura completa de todos los campos del archivo de parámetros JSON. Estas comprobaciones buscan evitar problemas comunes en la exportación de modelos híbridos.

## Capacidades

- Generación de texto: el modelo puede producir respuestas coherentes a partir de un prompt, como se muestra en la verificación con "capital of France?" y "17 times 4?".
- Razonamiento aritmético básico: resuelve operaciones simples como multiplicaciones (ej. 17 × 4 = 68).
- Conversación multi-turno: gracias a su plantilla ChatML y contexto de 2048 tokens, puede mantener diálogos con historial.
- Ejecución en CPU: optimizado para XNNPACK, funciona sin GPU, lo que lo hace apto para dispositivos con recursos limitados.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento especiales en la documentación disponible.

## Casos de uso

- Asistente personal en smartphone: al ser un modelo pequeño y optimizado para CPU, puede integrarse en aplicaciones móviles para responder preguntas frecuentes, gestionar recordatorios o mantener conversaciones básicas sin conexión.
- Chatbot de atención al cliente en dispositivos locales: empresas que necesiten un asistente virtual que funcione sin depender de la nube pueden desplegarlo en terminales de punto de venta o quioscos, aprovechando su contexto de 2048 tokens para manejar interacciones multi-turno.
- Herramienta de cálculo conversacional: útil en aplicaciones educativas o de productividad donde el usuario realiza operaciones matemáticas mediante lenguaje natural, como "¿cuánto es 17 por 4?".
- Generación de texto en aplicaciones de notas: puede autocompletar frases o sugerir continuaciones en editores de texto móviles, funcionando de forma local para preservar la privacidad.
- Tutor de aprendizaje básico: en entornos educativos sin acceso a internet, puede responder preguntas de cultura general y ejercicios de aritmética, como se demuestra en la verificación.
- Prototipado rápido de aplicaciones on-device: desarrolladores que necesiten evaluar la viabilidad de un modelo de lenguaje en hardware de bajo consumo pueden usar este archivo .pte como referencia para medir rendimiento y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta una velocidad de decodificación de 104.6 tokens por segundo en una Mac arm64, medida con un proceso dedicado y sin cargas concurrentes. Este dato es útil como referencia de rendimiento en CPU, pero no constituye una comparación formal con otros modelos.

## Requisitos de hardware

- El archivo .pte ocupa 740.8 MB, por lo que se recomienda al menos 1 GB de memoria RAM libre para cargar el modelo y ejecutar la inferencia.
- Está diseñado para CPU con soporte XNNPACK (arquitecturas ARM y x86-64). No requiere GPU.
- Verificado en Mac arm64; no se ha medido en teléfonos móviles, aunque el uso de XNNPACK sugiere compatibilidad con dispositivos Android e iOS.
- Para ejecutarlo se necesita el runtime de ExecuTorch y los kernels cuantizados (`from executorch.kernels import quantized`), además de cargar el programa con `portable_lib._load_for_executorch`.
- Opciones de despliegue: integración directa en aplicaciones mediante ExecuTorch, o uso del script `gen_static.py` proporcionado en el repositorio de conversión.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base LFM2-1.2B podría compararse con otros modelos de ~1.2B parámetros como Qwen3-1.2B o Gemma-1.2B, pero no hay datos de rendimiento ni benchmarks en la documentación proporcionada para este archivo exportado.

## Limitaciones y advertencias

- La cuantización 8da4w puede degradar la calidad de las respuestas en comparación con el modelo original en precisión completa, especialmente en tareas que requieren razonamiento complejo.
- El contexto está limitado a 2048 tokens, lo que restringe la capacidad de manejar documentos largos o conversaciones extensas.
- No se especifican los idiomas soportados; la verificación solo se realizó en inglés.
- La licencia LFM Open License v1.0 puede imponer restricciones de uso comercial; es necesario revisar sus términos antes de desplegar el modelo en producción.
- La model card advierte que el archivo no se ha probado en teléfonos, por lo que el rendimiento real en dispositivos móviles puede variar.
- La carga del modelo requiere kernels específicos de ExecuTorch; si no se importan correctamente, el programa fallará con un error de kernel no encontrado, lo que podría interpretarse erróneamente como un export defectuoso.

## Enlaces

- [HuggingFace - mlboydaisuke/LFM2-1.2B-ExecuTorch](https://huggingface.co/mlboydaisuke/LFM2-1.2B-ExecuTorch)
- [Repositorio de conversión executorch-models](https://github.com/john-rocky/executorch-models)
- [Muestras iOS executorch-samples](https://github.com/john-rocky/executorch-samples)
- [Ejemplo oficial de LFM2 en ExecuTorch](https://github.com/pytorch/executorch/tree/main/examples/models/lfm2)
- [Blog de Liquid AI sobre LFM2](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models)
