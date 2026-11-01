# mattashiho/dango-A1-A2-B1-B2

## Resumen

Dango-A1-A2-B1-B2 es un modelo de lenguaje de 1.867.614.208 parámetros (aproximadamente 1,8 mil millones) desarrollado por Shiho Matta (usuario `mattashiho`) como parte de una línea de investigación sobre adquisición de segundas lenguas (L2). Se trata de un ajuste supervisado (SFT) del modelo base Dango-pretrained (`dango-1.8b-100Btok`), un modelo preentrenado exclusivamente en japonés sobre 100.000 millones de tokens de un corpus japonés filtrado de forma exhaustiva. El ajuste se realiza sobre lecciones de aprendizaje de inglés como segunda lengua correspondientes a los niveles A1, A2, B1 y B2 del Marco Común Europeo de Referencia (MCER).

El objetivo del modelo no es la asistencia general, sino la simulación de hablantes japoneses de inglés en distintos estadios de aprendizaje, lo que lo convierte en una herramienta de investigación para estudiar fenómenos de interlengua, errores sistemáticos y progresión lingüística. Arquitectónicamente es comparable a la familia llm-jp-3, que adopta un decoder estilo Llama 2.

El modelo es relevante por su enfoque poco habitual: en lugar de optimizar para benchmarks generalistas, se especializa en reproducir el comportamiento lingüístico de aprendices en cuatro niveles de competencia, con implicaciones para la evaluación de sistemas educativos y para la generación de datos sintéticos de interlengua. Su licencia es CC BY 4.0, aunque el ajuste se entrenó con datos de instrucción Ichikara, que prohíben el uso comercial de modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama 2 (comparable a llm-jp-3) |
| Parametros totales | 1.867.614.208 (aproximadamente 1,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | CC BY 4.0 para codigo y modelos preentrenados; los modelos ajustados con datos Ichikara prohiben uso comercial de derivados |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con decoder de estilo Llama 2, siguiendo el diseño de la familia llm-jp-3 (referencia explícita al modelo llm-jp-3-1.8b). El preentrenamiento del modelo base Dango-pretrained se realizó sobre 100.000 millones de tokens de un corpus exclusivamente japonés sometido a un filtrado extensivo, lo que lo orienta a modelar el japonés con alta cobertura y calidad. Sobre esa base, el ajuste supervisado (SFT) se llevó a cabo con lecciones de aprendizaje de inglés como L2 correspondientes a los niveles A1, A2, B1 y B2.

No se documentan en la información disponible detalles sobre el número exacto de tokens de SFT, la composición del dataset de lecciones, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. La contribución metodológica principal es el uso de datos de instrucción educativa estructurados por nivel MCER para inducir comportamientos lingüísticos propios de aprendices en distintas fases, lo que constituye una forma de control condicionado por nivel de competencia.

## Capacidades

- Generación de texto en japonés e inglés, con especialización en la simulación de producción lingüística de aprendices de inglés en niveles A1, A2, B1 y B2.
- Simulación de hablante japonés de inglés (Japanese-English speaker simulator), reproduciendo patrones de interlengua y errores típicos por nivel.
- Generación de respuestas condicionadas al nivel de competencia del aprendiz (A1 a B2), útil para investigación en adquisición de segundas lenguas.
- Capacidades bilingües ja-en derivadas del preentrenamiento japonés y del ajuste sobre lecciones en inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documenta explícitamente capacidad de código o matemáticas; el ajuste está orientado a contenido educativo de idiomas.

## Casos de uso

- Investigación en adquisición de segundas lenguas: el modelo permite generar producciones simuladas de aprendices en cada nivel MCER, lo que facilita el estudio controlado de errores, transferencia del japonés y progresión de la interlengua sin necesidad de reclutar participantes humanos.
- Generación de datos sintéticos de interlengua: útil para aumentar corpus anotados por nivel de competencia en tareas de evaluación automática de aprendices (error detection, proficiency classification).
- Evaluación de sistemas de corrección gramatical: al poder producir errores calibrados por nivel A1-B2, sirve como generador de casos de prueba para correctores y tutores automáticos de inglés.
- Simulación de estudiantes para formación de profesores: permite a docentes en formación practicar la detección y corrección de errores típicos de hablantes japoneses de inglés en distintos estadios.
- Estudio de transferencia lingüística ja-en: el modelo base es monolingüe japonés y el ajuste se hace en inglés, lo que lo convierte en un banco de pruebas para analizar interferencias léxicas, sintácticas y pragmáticas.
- Prototipado de herramientas educativas bilingües ja-en: dado su tamaño reducido (3,7 GB en safetensors), puede desplegarse en entornos de investigación con recursos limitados para experimentar con diálogos de práctica de idiomas.
- Reproducibilidad de investigación: al publicarse el checkpoint SFT y el código de filtrado y entrenamiento en GitHub, permite replicar experimentos sobre datos educativos estructurados por nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 7,5 GB para los 1.867.614.208 parámetros.
- VRAM estimada en fp16/bf16: aproximadamente 3,7 GB (coincide con el tamaño del repo en safetensors).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,9 GB; en 4 bits: aproximadamente 1 GB (estimaciones teóricas, no verificadas con pesos publicados).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar el modelo en fp16; una RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para fp32 se recomienda al menos 12 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas con 8 GB o más, e incluso en configuraciones de 4-6 GB con cuantización.
- Opciones de despliegue: al ser un modelo estilo Llama 2 con pesos safetensors, es compatible con transformadores estándar (Hugging Face Transformers), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF. No se documentan recetas oficiales de despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dango-A1-A2-B1-B2 | 1,8 B | no disponible | ja, en | CC BY 4.0 con restriccion comercial por datos Ichikara | HuggingFace (mattashiho/dango-A1-A2-B1-B2) |
| llm-jp-3-1.8b | 1,8 B | no disponible en la informacion | ja | no disponible en la informacion | HuggingFace (llm-jp/llm-jp-3-1.8b) |
| Dango-pretrained (dango-1.8b-100Btok) | 1,8 B | no disponible | ja | CC BY 4.0 | HuggingFace (mattashiho/dango-1.8b-100Btok) |

La comparación con llm-jp-3-1.8b es la más directa por arquitectura y tamaño, si bien Dango-A1-A2-B1-B2 se distingue por su ajuste específico en datos educativos L2 y su orientación a la simulación de aprendices, no a tareas generales. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (simulación de aprendices de inglés A1-B2 por parte de hablantes nativos de japonés); su rendimiento en tareas generales de lenguaje probablemente sea inferior al de modelos de propósito general del mismo tamaño.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; al ser un modelo pequeño y ajustado en un dominio estrecho, la generación de hechos verificables no está garantizada.
- Sesgos conocidos: no se documentan análisis de sesgos. El preentrenamiento monolingüe en japonés y el ajuste sobre materiales educativos pueden introducir sesgos culturales y pedagógicos específicos.
- Limitaciones de idioma: solo se declaran japonés e inglés; no hay soporte documentado para otros idiomas.
- Longitud de contexto: no documentada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: aunque los pesos preentrenados y el código son CC BY 4.0, el ajuste SFT se entrenó con datos de instrucción Ichikara, cuya licencia prohíbe el uso comercial de modelos derivados. En la práctica, esto limita el uso comercial del checkpoint publicado.
- No se documentan recetas de cuantización, plantillas de prompt ni formato de chat oficial, lo que puede dificultar su integración en producción sin ingeniería adicional.
- El modelo se presenta como herramienta de investigación, no como producto listo para producción; su uso en entornos reales de atención al cliente o generación de código no está respaldado por la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattashiho/dango-A1-A2-B1-B2
- Modelo base Dango-pretrained: https://huggingface.co/mattashiho/dango-1.8b-100Btok
- Modelo de referencia arquitectónica llm-jp-3-1.8b: https://huggingface.co/llm-jp/llm-jp-3-1.8b
- Repositorio GitHub con código de filtrado y entrenamiento: https://github.com/mattashiho233/dango
- Fuente de datos Ichikara (LLM のための日本語インストラクションデータ作成): https://liat-aip.sakura.ne.jp/wp/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf%e4%bd%9c%e6%88%90/llm%e3%81%ae%e3%81%9f%e3%82%81%e3%81%ae%e6%97%a5%e6%9c%ac%e8%aa%9e%e3%82%a4%e3%83%b3%e3%82%b9%e3%83%88%e3%83%a9%e3%82%af%e3%82%b7%e3%83%a7%e3%83%b3%e3%83%87%e3%83%bc%e3%82%bf-%e5%85%ac%e9%96%8b/
- Cita académica (ANLP 2026): Matta, Huang, Cheng, Kodama, Kiyomaru y Murawaki, "Pretraining a Japanese-Only Large Language Model for Studying Second Language Acquisition", Proceedings of the 32nd Annual Meeting of the Association for Natural Language Processing, 2026, pp. 3225-3230.
