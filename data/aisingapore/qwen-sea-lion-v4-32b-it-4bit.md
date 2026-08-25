# aisingapore/Qwen-SEA-LION-v4-32B-IT-4BIT

## Resumen

Qwen-SEA-LION-v4-32B-IT-4BIT es la versión cuantizada en 4 bits (GPTQ) del modelo Qwen-SEA-LION-v4-32B-IT, desarrollado por el AI Products Pillar de AI Singapore con financiación del Singapore NRF. Este modelo es parte de la familia SEA-LION (Southeast Asian Languages In One Network), diseñada para ofrecer un rendimiento puntero en tareas de procesamiento de lenguaje natural para el Sudeste Asiático, cubriendo once idiomas de la región, incluyendo indonesio, malayo, tailandés, vietnamita, tagalo, tamil, birmano, jemer, lao, además de inglés y chino mandarín.

El modelo se obtiene mediante un entrenamiento continuado (continue pretraining) sobre Qwen3-32B, la arquitectura base de Qwen, con 100 000 millones de tokens de datos en inglés y lenguas del Sudeste Asiático, seguido de un ajuste por instrucciones (instruct-tuning). La versión cuantizada en 4 bits reduce los requisitos de memoria a aproximadamente 19,9 GB, lo que permite ejecutarla en portátiles con GPU de consumo, con una degradación media inferior al 0,3 % en comparación con el modelo de precisión completa, según los datos del autor.

La licencia MIT y su compatibilidad con el ecosistema Transformers de Hugging Face lo convierten en una opción atractiva para desarrolladores e investigadores que necesitan un modelo multilingüe de alto rendimiento, con contexto nativo de 32 768 tokens y capacidades de razonamiento heredadas de Qwen3, incluyendo un modo de pensamiento opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer (arquitectura Gemma 3, heredada de Qwen3-32B) |
| Parametros totales | 6 005 741 440 (según safetensors; el modelo base Qwen-SEA-LION-v4-32B-IT tiene ~32 000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (nativo) |
| Tipos de cuantizacion | GPTQ 4-bit (esta versión), GPTQ 8-bit disponible |
| Idiomas soportados | birmano, chino, filipino (tagalog), indonesio, inglés, jemer, lao, malay, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | Safetensors (GPTQ), compatible con Transformers, TGI, vLLM |

## Arquitectura y entrenamiento

Qwen-SEA-LION-v4-32B-IT-4BIT es la versión cuantizada en 4 bits del modelo de instrucción Qwen-SEA-LION-v4-32B-IT, que a su vez se basa en Qwen3-32B. Según la documentación de SEA-LION, el modelo base emplea una arquitectura de decodificador basada en la arquitectura Gemma 3, con tokenizer por defecto de Qwen3-32B. El entrenamiento consistió en un continue pretraining sobre Qwen3-32B con un corpus de 100 000 millones de tokens, combinando datos web, código, conjuntos de datos abiertos y datos sintéticos en inglés y las lenguas del Sudeste Asiático. Posteriormente se realizó un ajuste de instrucciones (instruct-tuning) para producir la variante IT.

La cuantización GPTQ se aplicó sobre el modelo ya ajustado, preservando la calidad general con una degradación promedio inferior al 0,3 % en el leaderboard SEA-HELM, según afirma el autor. El modelo hereda las capacidades de razonamiento de Qwen3, incluyendo un modo de pensamiento (thinking mode) que se puede activar o desactivar mediante el parámetro `enable_thinking`. No se ha realizado un alineamiento de seguridad específico; la model card indica explícitamente que el modelo no ha sido alineado para seguridad.

## Capacidades

- Generación de texto en once idiomas, con especial énfasis en las lenguas del Sudeste Asiático (birmano, indonesio, jemer, lao, malay, tagalog, tamil, tailandés y vietnamita), además de inglés y chino.
- Razonamiento multi-step y modo de pensamiento (thinking mode) heredado de Qwen3, activable mediante `enable_thinking=True` para generar cadenas de razonamiento antes de la respuesta final.
- Soporte de function calling y tool calling, heredado de Qwen3-32B (no documentado explícitamente en la model card de SEA-LION, pero presente en el modelo base).
- Capacidad para agentes y pipelines de razonamiento en varios pasos, gracias a la arquitectura densa y la ventana de contexto de 32 768 tokens.
- Procesamiento de texto de longitud larga con contexto de 32K tokens nativos, sin extensión adicional.
- Compatibilidad con Transformers, Text Generation Inference (TGI) y motores de inferencia compatibles con GPTQ (vLLM, llama.cpp, etc.).
- No se han documentado capacidades de visión específicas; el modelo se entrenó solo en la parte de texto, por lo que su rendimiento visual es el heredado de Qwen3-32B.

## Casos de uso

- Traducción automática multilingüe en el Sudeste Asiático: el modelo puede traducir entre inglés y las lenguas SEA (vietnamita, tailandés, indonesio, malay, etc.) con una calidad cercana a modelos de mayor tamaño, y su contexto de 32K permite procesar documentos largos completos.
- Asistente de atención al cliente en la región: con su soporte multilingüe y modo thinking, puede gestionar conversaciones multi-turno en idiomas como tagalog o tamil, respondiendo con razonamiento explícito en consultas complejas.
- Generación y revisión de código con contexto amplio: al heredar las capacidades de Qwen3-32B, puede asistir en tareas de programación, aunque la documentación no detalla un benchmark específico de HumanEval; es útil para completar código y depurar en entornos de desarrollo.
- Análisis de documentos legales o administrativos en lenguas SEA: su contexto de 32K tokens permite procesar contratos, informes o actas extensas en idiomas regionales, extrayendo información y resumiendo contenido.
- Chatbot conversacional y asistentes virtuales regionales: gracias a su licencia MIT y al tamaño reducido de la versión 4-bit, se puede desplegar en servidores modestos o portátiles de gama alta para crear asistentes multilingües.
- Razonamiento y resolución de problemas matemáticos y lógicos: el modo thinking permite que el modelo muestre sus pasos de razonamiento, útil en herramientas educativas o sistemas de tutoría en idiomas del Sudeste Asiático.
- Investigación en PNL para lenguas de baja representación: su entrenamiento específico en lenguas como jemer, lao o birmano lo convierte en una herramienta valiosa para experimentos de análisis de sentimiento, extracción de información o clasificación de texto en estos idiomas.

## Benchmarks y rendimiento

La model card no proporciona una tabla de resultados de benchmarks detallada, pero referencia el leaderboard SEA-HELM (https://leaderboard.sea-lion.ai/) donde se publican las puntuaciones. Según el autor, la versión cuantizada en 4-bit presenta una degradación media inferior al 0,3 % respecto al modelo de precisión completa Qwen-SEA-LION-v4-32B-IT, y se sitúa por encima de otros modelos abiertos de menos de 200 000 millones de parámetros en tareas SEA. No se han publicado en la información disponible los valores concretos de MMLU, HumanEval o GSM8K para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 19,9 GB, lo que indica que la inferencia requiere aproximadamente 20 GB de VRAM en FP16; en cuantización 4-bit, la VRAM necesaria se reduce considerablemente, aunque no se ha especificado el valor exacto en la documentación. La model card afirma que esta versión puede ejecutarse en un portátil.
- GPUs recomendadas: tarjetas de consumo como NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), RTX 4080 (16 GB) o superiores; también GPU profesionales como A100 o H100 para mayor throughput.
- Cabe en consumer GPU: sí, si se dispone de una GPU con al menos 16-24 GB de VRAM (por ejemplo, RTX 4090). La versión 8-bit requeriría más memoria.
- Opciones de despliegue: compatible con Transformers (PyTorch), Text Generation Inference (TGI), vLLM y llama.cpp para inferencia en CPU/GPU.
- Latencia y throughput: no se han publicado métricas específicas de latencia o tokens por segundo para esta variante; la tabla de recursos de la model card está incompleta en la información extraída.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Cuantizacion |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v4-32B-IT-4BIT | ~32B (6B en safetensors) | 32K | MIT | 11 idiomas SEA + EN + ZH | GPTQ 4-bit |
| Qwen-SEA-LION-v4-32B-IT (base) | ~32B | 32K | MIT | 11 idiomas SEA + EN + ZH | FP16/BF16 |
| Qwen-SEA-LION-v4-32B-IT-8BIT | ~32B | 32K | MIT | 11 idiomas SEA + EN + ZH | GPTQ 8-bit |
| Qwen3-32B (base) | ~32B | 32K | Apache 2.0 | Multilingüe (principalmente EN/ZH) | FP16/BF16 |

La comparativa se centra en las variantes de la familia SEA-LION y en el modelo base Qwen3-32B. La ventaja de la versión 4-bit es su menor huella de memoria (19,9 GB) frente a los ~60 GB del modelo en FP16, manteniendo una degradación mínima. En cuanto a licencia, el MIT permite uso comercial sin restricciones, a diferencia de la licencia Apache 2.0 de Qwen3-32B (que también es permisiva, pero con algunas diferencias menores). La comparativa con otros modelos de tamaño similar específicos para SEA (como SEA-LION v3) no está disponible en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; la model card advierte explícitamente que los desarrolladores deben realizar su propio fine-tuning de seguridad y medidas de protección.
- No se ha probado la robustez frente a ataques adversariales, por lo que puede ser vulnerable a prompts maliciosos.
- Puede alucinar contenido y generar texto irrelevante o ficticio no fundamentado en el contexto, como es común en LLMs.
- Las capacidades de visión son limitadas: el modelo fue entrenado y ajustado exclusivamente en texto, por lo que su rendimiento visual es el heredado de Qwen3-32B y no presenta mejoras significativas.
- La documentación no especifica el comportamiento del modelo en idiomas fuera del conjunto SEA/EN/ZH; su uso en otros idiomas puede producir resultados subóptimos.
- La cuantización 4-bit, aunque degrada poco en promedio, puede afectar a tareas específicas de alta precisión; se recomienda evaluar en el caso de uso concreto.
- La versión 4-bit requiere una GPU con suficiente VRAM para inferencia local (aprox. 20 GB), aunque la model card afirma que puede ejecutarse en un portátil, lo que sugiere que se puede usar con cuantizaciones adicionales o en modo CPU con mayor latencia.

## Enlaces

- HuggingFace: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-4BIT
- Modelo base (sin cuantizar): https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT
- Versión 8-bit: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-8BIT
- Documentación oficial: https://docs.sea-lion.ai/models/sea-lion-v4/qwen-sea-lion-v4-32b
- Blog de anuncio: https://sea-lion.ai/blog/qwen-sea-lion-v4-advanced-reasoning/
- Leaderboard SEA-HELM: https://leaderboard.sea-lion.ai/
- Repositorio GitHub: https://github.com/aisingapore/sealion/blob/main/models/sea-lion-v4/qwen-sea-lion-v4-32B.md
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
