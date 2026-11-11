# 0xzknw/LFM3-1.7B-Heretic-NX-EXL3-8bpw

## Resumen

LFM3-1.7B-Heretic-NX-EXL3-8bpw es una cuantización de 8 bits por peso (8bpw) en formato EXL3 del modelo LFM3-1.7B-Heretic-NX, un derivado del modelo Liquid Foundation Model 3 de Liquid AI. Lo publica el usuario 0xzknw y su propósito es ofrecer una versión de bajo coste computacional del modelo original, ejecutable en runtimes que soporten el formato EXL3 MCG (Mixed Cache Quantization) de ExLlamaV3, como MLXL3. El modelo conserva la arquitectura y el tokenizador del original; solo cambian los pesos, recomprimidos a 8 bits por peso.

El modelo base parte de LFM3, la familia de modelos fundacionales de Liquid AI. El checkpoint cuenta con 1.258.997.504 parámetros reales según los safetensors, empaquetados en un repositorio de 2,5 GB. La cuantización se validó con una divergencia KL de primer token de 0,0436 en ExLlamaV3 y 0,0439 en MLXL3 frente al modelo original, ambas por debajo del umbral de 0,05 fijado por el autor.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización EXL3 de un modelo pequeño que puede desplegarse en hardware de consumo; por otro, advierte de que los pesos no son BF16 estándar y requieren un runtime específico. El autor indica además que las variantes de 4 bpw y mixta de 4,49 bpw no superaron sus presupuestos de KL y no se publicaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; pesos en formato EXL3) |
| Parametros totales | 1.258.997.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bpw (EXL3 MCG); el autor descarta 4 bpw y 4,49 bpw por fallo de presupuesto KL |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | safetensors con checkpoint EXL3 (no BF16 estándar); requiere runtime compatible con LFM3 y EXL3 MCG |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LFM3 en la documentación proporcionada. El checkpoint es una recomposición de pesos del modelo LFM3-1.7B-Heretic-NX, un derivado del LFM3 de Liquid AI, y conserva la configuración y el tokenizador del original. La model card no describe el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El proceso de cuantización sí está documentado: se emplearon las herramientas de conversión de ExLlamaV3 para producir un checkpoint EXL3 a 8 bits por peso con cuantización de caché mixta (MCG). La validación se realizó midiendo la divergencia KL del primer token muestreado frente al modelo original sobre un conjunto de prompts; el resultado quedó por debajo del umbral de 0,05. El autor advierte de que el conjunto de 104 prompts de rechazo usado para la selección de variantes no es un holdout intacto, por lo que las cifras de fidelidad deben interpretarse como una cota interna y no como una evaluación independiente.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento y generación de texto general: heredado del modelo base LFM3; no se detallan capacidades específicas en la documentación.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información.

## Casos de uso

- Despliegue local en GPU de consumo: con 1,26 mil millones de parámetros a 8 bpw, el checkpoint ocupa aproximadamente 2,5 GB, por lo que cabe en GPUs consumer con 6-8 GB de VRAM usando un runtime EXL3 compatible como MLXL3 o ExLlamaV3.
- Experimentación con cuantización EXL3: sirve como caso de referencia para evaluar la fidelidad de la cuantización de 8 bpw frente a BF16 mediante la métrica de divergencia KL del primer token.
- Generación de texto conversacional de baja latencia: al ser un modelo pequeño, es adecuado para prototipos de chatbots y asistentes donde el coste por token y la latencia importan más que la profundidad de razonamiento.
- Evaluación de derivados "Heretic": el modelo es un caso de estudio de ajustes que modifican el comportamiento de rechazo del modelo original; útil para investigación sobre alineamiento y comportamiento de rechazo.
- Integración en pipelines de inferencia con ExLlamaV3: el formato EXL3 MCG permite servir el modelo con exllamav3 y herramientas asociadas en entornos donde ya se usa ese stack.
- Reproducción de validaciones de cuantización: los informes de validación y el manifiesto de origen permiten reproducir las mediciones de KL y comprobar el proceso de selección de variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es la divergencia KL de primer token frente al modelo original:

| Metrica | Runtime | Valor |
|---|---|---|
| KL de primer token (muestreada) | ExLlamaV3 | 0,04362488 |
| KL de primer token (muestreada) | MLXL3 | 0,04389918 |
| Umbral maximo fijado por el autor | — | 0,05 |

El autor señala que la prueba de rechazo de 104 prompts se usó durante la selección de la fuente y no es un holdout intacto. Los benchmarks del modelo base citados en la documentación upstream no validan por sí mismos esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB para los pesos a 8 bpw, más el overhead de caché KV y del runtime EXL3; el tamaño exacto depende de la longitud de contexto configurada, que no se documenta.
- GPU recomendadas: no se especifican en la información. Por tamaño, cualquier GPU con al menos 6-8 GB de VRAM debería poder cargar el modelo, aunque no se confirma compatibilidad con modelos concretos.
- Compatibilidad con GPU de consumo: previsible por el tamaño del checkpoint, pero no verificada en la documentación.
- Opciones de despliegue: requiere un runtime que soporte LFM3 y EXL3 MCG, como MLXL3 (https://github.com/0xZKnw/mlxl3) o ExLlamaV3 (https://github.com/turboderp-org/exllamav3). No es compatible con llama.cpp, Ollama ni TGI en formato estándar, ya que los pesos no son BF16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-NX-EXL3-8bpw | 1.258.997.504 | no disponible | EXL3 8 bpw (safetensors) | LFM Open License v1.0 | Hugging Face (0 descargas, 0 likes) |
| LFM3-1.7B-Heretic-NX (modelo base) | no disponible | no disponible | BF16 (presumiblemente) | no disponible | Hugging Face (0xzknw) |
| Modelos LFM3 originales de Liquid AI | no disponible | no disponible | no disponible | LFM Open License v1.0 | Hugging Face (LiquidAI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Formato no estándar: los pesos son un checkpoint EXL3, no BF16 ordinario; no se pueden cargar con runtimes genéricos como transformers, llama.cpp u Ollama sin conversión.
- Dependencia de runtime específico: requiere MLXL3 o ExLlamaV3 con soporte de LFM3 y EXL3 MCG; la disponibilidad y el mantenimiento de estos runtimes condicionan el uso en producción.
- Validación limitada: la métrica de fidelidad se midió sobre un conjunto de prompts que no es un holdout intacto, y el autor lo advierte explícitamente.
- Variantes descartadas: las cuantizaciones de 4 bpw y 4,49 bpw no se publicaron por superar el presupuesto de KL, lo que sugiere que el modelo es sensible a cuantizaciones más agresivas.
- Idiomas y sesgos: no se documentan idiomas soportados ni sesgos conocidos; no hay información sobre comportamiento multilingüe.
- Riesgo de alucinación: no evaluado en la documentación; al ser un modelo de 1,26 mil millones de parámetros, cabe esperar una tasa de alucinación superior a la de modelos mayores, aunque no hay datos que lo confirmen.
- Licencia: LFM Open License v1.0; es necesario revisar el texto de la licencia y el aviso de modificación (NOTICE) antes de un uso comercial, ya que se etiqueta como "other".
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni de validación por terceros.
- Benchmarks del modelo base: las afirmaciones de rendimiento de la documentación upstream no validan esta cuantización concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX-EXL3-8bpw
- Modelo base: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX
- Modelos de Liquid AI: https://huggingface.co/LiquidAI
- Repositorio MLXL3: https://github.com/0xZKnw/mlxl3
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
