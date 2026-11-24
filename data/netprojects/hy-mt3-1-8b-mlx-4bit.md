# netprojects/Hy-MT3-1.8B-MLX-4bit

## Resumen

Hy-MT3-1.8B-MLX-4bit es una conversión a formato MLX y cuantización a 4 bits del modelo de traducción multilingüe tencent/Hy-MT3-1.8B, publicada por NetProjects (Internet Projects Ltd), un tercero no afiliado a Tencent. El modelo base pertenece a la familia Hy-MT3 de Tencent, presentada el 24 de noviembre de 2026 en tres tamaños (1.8B, 7B y 30B-A3B), y está especializada en traducción entre aproximadamente 100 idiomas y dialectos. Esta versión concreta está pensada para ejecutarse en Apple Silicon mediante la librería mlx-lm, con un peso de repositorio de 1,0 GB.

El modelo base es un transformer denso de 32 capas y 1.791.080.448 parámetros (1,8B), el más pequeño de la familia, orientado a portátiles y trabajos rápidos. Frente a la generación anterior Hy-MT2, Tencent reporta un 43 % menos de errores de traducción, un 74 % menos de omisiones o adiciones y un 40 % menos de errores de seguimiento de instrucciones en datos reales; según el autor, incluso el modelo de 1,8B supera a servicios comerciales como Microsoft Translator y Qwen-MT-Flash en traducción general.

La relevancia de esta ficha concreta reside en que permite desplegar localmente en un Mac un modelo de traducción especializado de última generación, sin dependencia de API, con licencia Apache-2.0 y con una pérdida de fidelidad respecto al bf16 original medida y documentada por el conversor (93,4 % de coincidencia en el siguiente token más probable).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `hunyuan_v1_dense`), 32 capas |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | entradas de hasta ~8K tokens; hasta 4.096 tokens nuevos de salida (según ajustes recomendados por Tencent) |
| Tipos de cuantizacion | 4 bits afín, grupo de 64 (esta build); existe build de 8 bits del mismo autor |
| Idiomas soportados | ~100 idiomas y dialectos (33 de Hy-MT2, 5 lenguas minoritarias chinas y 64 nuevos como griego, rumano, húngaro, nórdicas y bálticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32 capas con 1,8B de parámetros, identificado en los metadatos con la arquitectura `hunyuan_v1_dense`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras) en la model card consultada.

La build aquí descrita es una conversión del checkpoint de Tencent (revisión `57bf8ed`) realizada con mlx-lm y cuantizada a 4 bits con cuantización afín y tamaño de grupo 64. El conversor verificó la integridad de los ficheros fuente contra los hashes SHA-256 del Hub y midió la fidelidad respecto al bf16 original: en 211 posiciones generadas, el token más probable coincidió con el de bf16 en el 93,4 % de los casos (frente al 100,0 % de la build de 8 bits). La prueba de humo de traducción (10 prompts, salida no vacía y en el idioma o alfabeto destino) pasó 10/10, igual que bf16.

## Capacidades

- Traducción multilingüe entre aproximadamente 100 idiomas y dialectos, incluidos idiomas europeos de incorporación reciente (griego, rumano, húngaro, nórdicas y bálticas) y lenguas minoritarias chinas.
- Traducción bidireccional: la model card cita ejemplos de traducción hacia griego, chino, japonés, alemán, francés, español, árabe y ruso, y desde griego y chino hacia inglés.
- Seguimiento de instrucciones de formato: plantillas para listas de terminología (`term` se traduce como `translation`), estilo requerido, preferencias personales, preservación de delimitadores y traducción de datos estructurados (JSON, XML).
- Salida restringida a la traducción: las plantillas recomendadas piden únicamente el resultado, sin explicaciones adicionales.
- Conversación con plantilla de chat (`apply_chat_template`); no hay system prompt por defecto.
- Servidor compatible con la API de OpenAI mediante `mlx_lm.server`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción local en portátil Mac: con 1,0 GB de pesos y 8 GB de memoria sugerida, el modelo se ejecuta íntegramente en un MacBook sin conexión, adecuado para documentos confidenciales que no deben salir del dispositivo.
- Traducción de documentación técnica con terminología controlada: las plantillas de lista de términos permiten fijar cómo traducir términos concretos, útil para manuales y fichas de producto con glosario propio.
- Localización de aplicaciones y ficheros de recursos: la capacidad de traducir datos estructurados (JSON, XML) preservando delimitadores permite procesar ficheros de i18n sin romper la sintaxis.
- Traducción de correo y atención al cliente: textos cortos y medianos con instrucción de estilo (formal o informal) y salida limpia sin explicaciones, integrable en un flujo automatizado.
- Preprocesado multilingüe para pipelines de datos: traducción de corpus hacia un idioma pivote (por ejemplo, inglés) antes de análisis, indexación o entrenamiento de otros modelos.
- Servicio de traducción autoalojado: `mlx_lm.server` expone una API compatible con OpenAI, lo que permite sustituir una API comercial por un endpoint local en herramientas existentes.
- Prototipado e investigación en traducción automática: al ser Apache-2.0 y ejecutable en hardware de consumo, sirve como línea base reproducible para comparar métodos o prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita cifras relativas de Tencent frente a Hy-MT2 (43 % menos errores de traducción, 74 % menos omisiones o adiciones, 40 % menos errores de seguimiento de instrucciones) y la afirmación de que el modelo de 1,8B supera a Microsoft Translator y Qwen-MT-Flash en traducción general, pero no se incluyen tablas de MMLU, HumanEval, GSM8K ni métricas BLEU/COMET en la información proporcionada. Las únicas mediciones propias del conversor son las siguientes:

| Metrica | 4-bit | 8-bit | bf16 |
|---|---|---|---|
| Coincidencia del siguiente token con bf16 | 93,4 % (211 posiciones) | 100,0 % | referencia |
| Prueba de humo de traducción | 10/10 | 10/10 | 10/10 |
| Tamano de pesos | 1,0 GB | 1,9 GB | no disponible |
| Memoria de Mac sugerida | 8 GB+ | 8 GB+ | no disponible |

## Requisitos de hardware

- VRAM/memoria unificada: 8 GB o más de memoria de Mac según el autor (límite por defecto de GPU que cubre el pico observado más 2 GB); documentos largos requieren más.
- Hardware objetivo: Apple Silicon; las pruebas se realizaron en un MacBook Pro M5 Max de 128 GB.
- GPU NVIDIA: no es el objetivo de esta build; para CUDA habría que usar los pesos originales de Tencent u otra conversión.
- Cabe en GPU de consumo Apple: sí, en cualquier Mac con 8 GB o más de memoria unificada.
- Despliegue: mlx-lm >= 0.32.2 (`mlx_lm.generate`, API Python `load`/`generate`, `mlx_lm.server` con API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Parámetros de muestreo recomendados por Tencent: temperatura 0,7, top_p 0,6, top_k 20, penalización de repetición 1,05, hasta 4.096 tokens nuevos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Hy-MT3-1.8B-MLX-4bit (esta ficha) | 1,8B | ~8K entrada / 4K salida | MLX 4-bit, Apple Silicon | Apache-2.0 | 93,4 % de coincidencia con bf16; 1,0 GB |
| netprojects/Hy-MT3-1.8B-MLX-8bit | 1,8B | ~8K entrada / 4K salida | MLX 8-bit, Apple Silicon | Apache-2.0 | 100,0 % de coincidencia con bf16; 1,9 GB; recomendada por el autor |
| tencent/Hy-MT3-1.8B | 1,8B | ~8K entrada / 4K salida | safetensors bf16, multiplataforma | Apache-2.0 | Modelo base original; requiere más memoria |
| tencent/Hy-MT3-7B y Hy-MT3-30B-A3B | 7B y 30B-A3B (MoE) | no disponible | safetensors | Apache-2.0 | Versiones mayores de la misma familia; no disponibles en MLX según la información consultada |

No se dispone de datos de rendimiento comparativo (BLEU, COMET) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce desviaciones: solo el 93,4 % de los tokens más probables coinciden con bf16, frente al 100 % de la build de 8 bits; para máxima fidelidad el propio autor recomienda la versión de 8 bits.
- Riesgo de alucinación y de omisiones o adiciones en textos largos o ambiguos; las cifras de mejora frente a Hy-MT2 son relativas y no eliminan el problema.
- Ventana de contexto limitada (entradas de ~8K tokens): documentos largos deben fragmentarse, y el autor advierte que consumen más memoria de la sugerida.
- Idiomas: aunque se anuncian ~100 idiomas, no se detalla la calidad por idioma ni se ofrecen evaluaciones independientes; los idiomas de bajos recursos pueden rendir peor.
- Sesgos: no se documentan en la información disponible evaluaciones de sesgo; al ser un modelo de traducción, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Licencia Apache-2.0, que permite uso comercial; el fichero LICENSE.txt es el de Tencent sin modificar y debe citarse su trabajo.
- Publicado por un tercero no afiliado a Tencent; la conversión no está validada por el autor original.
- Sin datos publicados de latencia ni throughput; el rendimiento depende del chip Apple concreto.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse que las tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Hy-MT3-1.8B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Build de 8 bits del mismo autor: https://huggingface.co/netprojects/Hy-MT3-1.8B-MLX-8bit
- Informe técnico citado (arXiv 2611.27673): https://arxiv.org/abs/2611.27673
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
