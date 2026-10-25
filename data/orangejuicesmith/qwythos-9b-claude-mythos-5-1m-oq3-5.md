# orangejuicesmith/Qwythos-9B-Claude-Mythos-5-1M-oQ3.5

## Resumen

`orangejuicesmith/Qwythos-9B-Claude-Mythos-5-1M-oQ3.5` es una reconversión cuantizada del modelo `empero-ai/Qwythos-9B-Claude-Mythos-5-1M`, desarrollado originalmente por Empero AI. Se trata de un modelo de 8.953.803.264 parámetros (unos 8,95 mil millones) construido sobre Qwen3.5-9B y afinado a parámetros completos con más de 500 millones de tokens de datos de razonamiento. Esta variante concreta no añade entrenamiento: es únicamente una conversión al formato MLX con cuantización mixta oQ3.5, pensada para inferencia local eficiente en Apple Silicon.

El interés de la ficha está en que combina tres cosas poco habituales en un modelo de su tamaño: una ventana de contexto declarada de 1.048.576 tokens, soporte nativo de function calling y tool use, y un ajuste explícitamente "uncensored" orientado a razonamiento técnico en dominios de ciberseguridad y biomedicina. Todo ello bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Ahora bien, conviene calibrar expectativas: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de benchmarks propios y la cuantización a ~3,5 bits introduce una degradación de calidad no medida públicamente. Es un artefacto para pruebas locales en Mac, no un modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5-9B (número de capas, cabezas y esquema de atención no disponibles) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones, dato de safetensors) |
| Parámetros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) según la model card |
| Tipos de cuantización | oQ3.5 de precisión mixta (MLX); el repositorio está etiquetado además como 3-bit y 4-bit |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repositorio de 4,8 GB); `library_name` declarado como transformers |
| Modelo base | empero-ai/Qwythos-9B-Claude-Mythos-5-1M (a su vez sobre Qwen/Qwen3.5-9B) |
| Tamaño del repositorio | 4,8 GB |
| Fecha de publicación | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer decoder denso, sobre el que Empero AI aplicó un ajuste supervisado (SFT) a parámetros completos —la etiqueta `full-fine-tune` así lo indica— con más de 500 millones de tokens de datos de razonamiento "cuidadosamente curados". La model card menciona soporte de modo thinking (`enable_thinking`) y capacidades de autocorrección asistida por herramientas, pero no detalla la composición del dataset, la proporción de datos de código, matemáticas o ciberseguridad, ni si hubo fases de RLHF o DPO. Tampoco se documenta el mecanismo de atención empleado para sostener la ventana de 1M tokens.

Lo específico de este repositorio es la cuantización oQ3.5, descrita como una técnica de precisión mixta sensible a la sensibilidad por capas: en lugar de aplicar el mismo número de bits a todos los pesos, analiza la importancia de cada capa y conserva mayor precisión en las regiones críticas mientras comprime con más agresividad las menos sensibles. El resultado son 4,8 GB de pesos para ~8,95 mil millones de parámetros, es decir, una media efectiva en torno a 4,3 bits por parámetro. La model card afirma que este esquema preserva mejor el razonamiento, el rendimiento en código y la exactitud matemática frente a una cuantización uniforme, aunque no aporta métricas que lo respalden.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activable mediante plantilla de chat.
- Programación: generación y explicación de código, con la etiqueta `coder` en el repositorio.
- Function calling y tool use nativos, incluida la autocorrección asistida por herramientas.
- Razonamiento matemático y científico.
- Razonamiento biomédico (etiqueta `biomedical`).
- Ciberseguridad (etiqueta `cybersecurity`), en el marco de un ajuste "uncensored" que reduce los rechazos en consultas técnicas sensibles.
- Comprensión de contexto largo: ventana declarada de 1.048.576 tokens, orientada a flujos agénticos y análisis de documentación extensa.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades de visión: las etiquetas del repositorio incluyen `image-text-to-text` e `image-to-text`, pero la model card no documenta ningún módulo ni uso multimodal; se trata de una discrepancia sin confirmar.

## Casos de uso

- Asistente de código local en Mac: cargado con MLX-LM o LM Studio en un equipo Apple Silicon, el modelo permite autocompletado, refactorización y explicación de código sin enviar el repositorio a un servicio externo, algo relevante para código propietario.
- Análisis de documentación extensa: con 1M tokens de contexto declarados, se puede volcar un monorepo mediano o un conjunto de especificaciones técnicas y plantear preguntas transversales sin troceado previo, siempre que la memoria unificada del equipo lo permita.
- Agente local con tool calling: al soportar function calling nativo, encaja en flujos donde el modelo decide invocar APIs locales (sistema de ficheros, shell, consultas a bases de datos) y corrige sus propios errores a partir de la salida de la herramienta.
- Triaje y explicación de hallazgos de seguridad: análisis de CVEs, interpretación de reglas de detección o explicación de técnicas de ataque en un entorno aislado, aprovechando el ajuste orientado a ciberseguridad.
- Revisión de literatura biomédica: resumen y extracción de relaciones entre entidades en artículos largos, como apoyo a un investigador; requiere validación humana por el riesgo de alucinación en dominio clínico.
- Tutoría técnica y matemáticas: resolución paso a paso con el modo thinking activado, útil en entornos educativos con requisito de privacidad u operación offline.
- Prototipado de investigación en interpretabilidad: al ser un modelo abierto de ~9B con pesos MLX ligeros, sirve para experimentar con decodificación, prompts y evaluación de razonamiento en un portátil.
- Despliegue en entornos sin conectividad: laboratorios, campo o instalaciones air-gapped donde no es viable llamar a una API remota.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio remite explícitamente al repositorio original (`empero-ai/Qwythos-9B-Claude-Mythos-5-1M`) para consultar resultados, metodología y evaluación, pero no reproduce ninguna cifra de MMLU, HumanEval, GSM8K ni de evaluaciones de contexto largo. Tampoco existe una comparación publicada entre el modelo original en precisión completa y esta variante oQ3.5 que permita cuantificar la pérdida por cuantización.

## Requisitos de hardware

- Peso de los pesos en disco y en memoria: 4,8 GB, coherente con la cuantización oQ3.5 de precisión mixta.
- Memoria unificada recomendada: 16 GB como mínimo para contextos moderados (pesos + caché KV + overhead del runtime); 32 GB o más para explotar ventanas de contexto muy largas. Estimación a partir del tamaño del repositorio, no un dato publicado.
- Contexto de 1M tokens: el coste de caché KV a esa longitud es muy elevado y depende de la configuración de cabezas y capas, que no está documentada; no disponible una cifra fiable. La propia model card recomienda configuraciones de mayor memoria para usar la ventana completa.
- GPU: no aplica de forma nativa. El formato es MLX y está dirigido a Apple Silicon (series M1, M2, M3 y M4, incluidas variantes Pro, Max y Ultra); no se ejecuta en CUDA sin reconversión previa a otro formato.
- Consumer GPU: sí cabe en equipos de consumo, pero en el ecosistema Mac. En GPUs NVIDIA equivalentes habría que reconvertir los pesos a GGUF o a un formato soportado por vLLM, algo que este repositorio no ofrece.
- Opciones de despliegue: MLX, MLX-LM, oMLX, LM Studio (modo MLX) y Open WebUI como interfaz. vLLM, TGI, llama.cpp y Ollama no consumen pesos MLX de forma directa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este artefacto.
- Parámetros de muestreo recomendados por el autor: temperatura 0,6, top_p 0,95, top_k 20, min_p 0, repetition_penalty 1,05, presence_penalty 1,5 y `enable_thinking: true`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwythos-9B-oQ3.5 (este repositorio) | ~8,95 B | 1.048.576 tokens | oQ3.5 mixta, MLX, 4,8 GB | Apache-2.0 | HuggingFace, 0 descargas |
| Qwythos-9B-Claude-Mythos-5-1M (original) | ~8,95 B | 1.048.576 tokens | precisión completa (formato no detallado) | Apache-2.0 | HuggingFace, mantenido por Empero AI |
| Qwen3.5-9B (modelo base) | 9 B según denominación; cifra exacta no disponible | no disponible en la información | no disponible | no disponible en la información | HuggingFace, Qwen Team |

No se dispone de datos de rendimiento comparado entre estas tres variantes ni frente a otras familias de ~8-9B, por lo que la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Riesgo de alucinación: es un modelo de ~9B sin benchmarks publicados; en dominios técnicos (ciberseguridad, biomedicina, matemáticas) puede producir afirmaciones plausibles pero incorrectas. Requiere verificación externa en cualquier uso crítico.
- Ajuste "uncensored": el alineamiento de seguridad está deliberadamente reducido. Puede generar contenido técnico peligroso (explotación, síntesis, procedimientos ofensivos) y no debe exponerse sin filtros a usuarios finales ni a menores.
- Degradación por cuantización: la conversión a oQ3.5 (~4,3 bits efectivos de media) no ha sido evaluada contra el original en precisión completa. La pérdida de calidad en razonamiento de cadena larga y en código es posible y no está cuantificada.
- Ventana de 1M tokens no verificada: no hay resultados publicados de recuperación de información a esa longitud (needle-in-a-haystack ni similares), y el coste de memoria del caché KV puede hacerla inviable en la mayoría de equipos.
- Ambigüedad de formato: el repositorio declara `library_name: transformers` y pesos safetensors, mientras la model card describe un artefacto MLX. Conviene verificar la estructura real antes de integrarlo en un pipeline.
- Capacidad multimodal no confirmada: las etiquetas incluyen `image-text-to-text` e `image-to-text`, pero no hay documentación ni ejemplos de uso con imágenes.
- Nombre equívoco: "Claude-Mythos" en el identificador no implica relación con Anthropic; es una denominación del autor original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni issues conocidos.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no exime al desplegador de responsabilidad sobre las salidas generadas ni de las obligaciones de atribución.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/orangejuicesmith/Qwythos-9B-Claude-Mythos-5-1M-oQ3.5
- Modelo original (Empero AI): https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Modelo base (Qwen Team): https://huggingface.co/Qwen/Qwen3.5-9B
- Apple MLX: no disponible en la información proporcionada
- oMLX y OptiQ Quantization: no disponible en la información proporcionada
