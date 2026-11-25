# netprojects/Hy-MT3-7B-MLX-4bit

## Resumen

Hy-MT3-7B-MLX-4bit es una versión cuantizada a 4 bits del modelo de traducción multilingüe tencent/Hy-MT3-7B, convertida al formato MLX para su ejecución nativa en Apple Silicon. El modelo original lo desarrolla Tencent y forma parte de la familia Hy-MT3, publicada el 24 de noviembre de 2026 en tres tamaños (1.8B, 7B y 30B-A3B). Esta variante la publica NetProjects (Internet Projects Ltd), un tercero no afiliado a Tencent.

El modelo base es un transformer denso de 7.504.568.320 parámetros y 32 capas, especializado en traducción entre aproximadamente 100 idiomas y dialectos. Incluye los 33 idiomas de Hy-MT2, cinco lenguas minoritarias y dialectos chinos, y 64 idiomas añadidos como griego, rumano, húngaro y las lenguas nórdicas y bálticas. Según Tencent, frente a Hy-MT2 reduce un 43% los errores de traducción, un 74% las omisiones o adiciones y un 40% los fallos de seguimiento de instrucciones.

La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de traducción de 7B en un Mac con 16 GB de memoria unificada, con un peso de solo 4.2 GB y una fidelidad del 97.7% en el siguiente token respecto al modelo bf16 original. Es una opción viable para traducción local, privada y sin conexión en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), 32 capas |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | entradas de hasta ~8K tokens; hasta 4.096 tokens nuevos de salida (recomendado por Tencent) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta build); el autor ofrece tambien 6-bit y 8-bit |
| Idiomas soportados | ~100 idiomas y dialectos (33 de Hy-MT2, 5 lenguas minoritarias chinas, 64 nuevos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con 7.5B parámetros, identificado en los tags como `hunyuan_v1_dense`, lo que sugiere que reutiliza la arquitectura de la familia Hunyuan de Tencent. Está especializado en traducción multilingüe y se entrenó con instrucciones de traducción, incluyendo plantillas para listas de terminología, estilo obligatorio, preferencias personales y preservación de delimitadores en datos estructurados (JSON, XML). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta build concreta no reentrena el modelo: parte de la revisión `f83bea8` de tencent/Hy-MT3-7B, la convierte con mlx-lm y la cuantiza a 4 bits con cuantización afina y grupo de 64. El autor verificó la integridad de los ficheros fuente mediante SHA-256 y midió la fidelidad frente a bf16 comparando el siguiente token más probable en cada posición generada: 97.7% de coincidencia sobre 217 posiciones. La prueba de humo de traducción (10 prompts a griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino a inglés) dio 10/10.

## Capacidades

- Traducción multilingüe entre aproximadamente 100 idiomas y dialectos, incluyendo lenguas minoritarias chinas y lenguas europeas de reciente incorporación.
- Traducción bidireccional: el modelo traduce hacia y desde los idiomas cubiertos (verificado hacia griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino a inglés).
- Seguimiento de instrucciones de formato: salida solo del texto traducido sin explicaciones adicionales, mediante prompt explícito.
- Soporte de listas de terminología mediante plantillas del tipo "`term` translates to `translation`".
- Soporte de estilo obligatorio y preferencias personales mediante prompt.
- Traducción de datos estructurados (JSON, XML) preservando delimitadores.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción local en Mac: ejecutar el modelo con mlx-lm en un MacBook con 16 GB o más de memoria unificada para traducir documentos sin enviar datos a servicios externos, gracias a los 4.2 GB de peso y a la fidelidad del 97.7% respecto a bf16.
- Traducción de documentación técnica: usar las plantillas de listas de terminología para forzar traducciones consistentes de términos especializados en manuales y guías de desarrollo.
- Localización de aplicaciones: traducir ficheros JSON o XML preservando delimitadores y claves, adecuado para pipelines de localización automatizados que no pueden romper la estructura del fichero.
- Atención al cliente multilingüe: desplegar el servidor compatible con OpenAI (`mlx_lm.server`) para servir traducciones en tiempo real en un flujo de conversación multi-turno, con prompts de hasta ~8K tokens de entrada.
- Traducción de correspondencia y textos administrativos: con la temperatura 0.7, top_p 0.6 y top_k 20 recomendados, generar traducciones de correos y documentos con salida limpia sin explicaciones añadidas.
- Prototipado e investigación en traducción automática: usar la build de 4 bits para experimentar con prompts, estilos y terminología en hardware de consumo antes de escalar a la build de 6 u 8 bits o al modelo bf16.
- Traducción de contenidos hacia lenguas europeas menos cubiertas: aprovechar los 64 idiomas añadidos (griego, rumano, húngaro, nórdicas y bálticas) para nichos donde otros modelos tienen menor cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible. El autor sí reporta métricas de fidelidad de la cuantización y de la prueba de humo:

| Metrica | 4-bit | 6-bit | 8-bit | bf16 |
|---|---|---|---|---|
| Coincidencia de siguiente token con bf16 | 97.7% (217 posiciones) | 100.0% | 99.5% | referencia |
| Prueba de humo de traduccion (10 prompts) | 10/10 | 10/10 | 10/10 | 10/10 |
| Tamano de pesos | 4.2 GB | 6.1 GB | 8.0 GB | no disponible |
| Memoria de Mac sugerida | 16 GB+ | 16 GB+ | 16 GB+ | no disponible |

Tencent reporta, frente a Hy-MT2 en datos reales, un 43% menos de errores de traducción, un 74% menos de omisiones o adiciones y un 40% menos de errores de seguimiento de instrucciones. No se detallan en la información proporcionada las métricas absolutas ni el conjunto de evaluación.

## Requisitos de hardware

- VRAM/memoria: 4.2 GB de pesos; el autor sugiere 16 GB o más de memoria unificada en Mac para soportar el pico de memoria más 2 GB de margen. Documentos largos requieren más memoria.
- GPU recomendadas: Apple Silicon (probado en MacBook Pro M5 Max de 128 GB). No está pensado para GPU NVIDIA; para esas plataformas habría que usar el modelo original en otro formato.
- GPU de consumo: cabe en Mac con 16 GB o más de memoria unificada. No aplica a GPU discretas de consumo porque el formato es MLX.
- Despliegue: mlx-lm (>= 0.32.2) mediante `mlx_lm.generate`, API de Python (`load`/`generate`) o servidor compatible con OpenAI (`mlx_lm.server --port 8000`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Hy-MT3-7B-MLX-4bit | 7.5B (denso) | ~8K entrada / 4K salida | MLX safetensors 4-bit | Apache-2.0 | Esta ficha; 4.2 GB; 97.7% fidelidad vs bf16 |
| netprojects/Hy-MT3-7B-MLX-6bit | 7.5B (denso) | ~8K entrada / 4K salida | MLX safetensors 6-bit | Apache-2.0 | 6.1 GB; 100% fidelidad; recomendado por el autor |
| netprojects/Hy-MT3-7B-MLX-8bit | 7.5B (denso) | ~8K entrada / 4K salida | MLX safetensors 8-bit | Apache-2.0 | 8.0 GB; 99.5% fidelidad |
| tencent/Hy-MT3-7B | 7.5B (denso) | ~8K entrada / 4K salida | safetensors bf16 | Apache-2.0 | Modelo base original; no ejecutable directamente en MLX sin conversion |

No se dispone en la información proporcionada de comparaciones con modelos de traducción de otros autores (por ejemplo, NLLB, SeamlessM4T o MADLAD); se indica "no disponible".

## Limitaciones y advertencias

- La cuantización a 4 bits introduce desviaciones respecto a bf16: 97.7% de coincidencia en el siguiente token, lo que implica que aproximadamente 1 de cada 43 tokens generados podría diferir del modelo completo. Para traducción de alta exigencia, el autor recomienda la build de 6 bits.
- El modelo está especializado en traducción; no se documentan capacidades generales de razonamiento, código o matemáticas, y no debería usarse como modelo de propósito general.
- Ventana de contexto limitada: entradas de hasta ~8K tokens y hasta 4.096 tokens nuevos de salida según la configuración recomendada; documentos largos pueden requerir fragmentación.
- Riesgo de alucinación y de omisiones en textos ambiguos o muy especializados; las métricas de Tencent indican mejoras frente a Hy-MT2, pero no eliminan el error.
- No se dispone de información sobre sesgos por idioma o dominio; la cobertura de ~100 idiomas no garantiza calidad uniforme, especialmente en las 64 lenguas añadidas.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse `LICENSE.txt` de Tencent y citarse su trabajo; el autor de la conversión no está afiliado a Tencent.
- Dependencia de mlx-lm >= 0.32.2 y de hardware Apple Silicon; no es portable a otras plataformas sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Hy-MT3-7B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Build 6-bit: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Hy-MT3-7B-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
- Informe tecnico citado (arXiv): 2611.27673
