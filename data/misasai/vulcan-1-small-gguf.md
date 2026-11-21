# MisasAI/Vulcan-1-small-GGUF

## Resumen
Vulcan-1-small (publicado como Vulcan-1-Coder en su model card) es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) especializado en código, razonamiento y matemáticas, distribuido en formato GGUF por el usuario MisasAI. No se trata de un modelo entrenado desde cero: deriva del modelo CherryPit 1.2 (DRUPEs/CherryPit-1.2-2B) mediante una técnica propietaria denominada "Integer Space Artificial Selection", que el autor describe como una selección de pesos en espacio entero sobre un modelo ya existente, sin ejecutar un entrenamiento adicional con nuevos datos.

La relevancia del modelo reside en su enfoque metodológico y en su eficiencia de despliegue: el autor afirma haberlo producido en una sola tarde junto a otros modelos, en un portátil con GPU de 6 GB de VRAM, y publica una batería de cuantizaciones (de Q8_0 a IQ3_S) con métricas de divergencia KL y acuerdo top-1 frente a los pesos de precisión completa. El modelo está pensado para inferencia local y on-device mediante llama.cpp, LM Studio u Ollama, con licencia Apache 2.0.

El modelo declara únicamente inglés como idioma soportado y un pipeline de text-generation. La información pública sobre arquitectura interna, datos de entrenamiento y proceso de alineamiento es muy limitada: la model card se centra en el método de selección y en los resultados de benchmarks matemáticos, no en la composición del corpus original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de DRUPEs/CherryPit-1.2-2B; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los benchmarks se ejecutaron con hasta 24K tokens de generación con thinking activado, pero no se especifica la ventana de contexto del modelo) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K (S/M/L), IQ3_M, IQ3_S; variantes optimizadas por tensor con imatrix (i1-Q6_KO, i1-Q4_K_MO, i1-Q3_K_LO/MO/SO) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión safetensors anunciada como "coming soon") |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del transformer subyacente. El modelo es un merge derivado de CherryPit 1.2, un modelo de 2B del equipo DRUPEs, y se distribuye exclusivamente en GGUF. El autor describe el proceso como "Integer Space Artificial Selection": una técnica guiada por datos que, en lugar de entrenar con más datos, "selecciona" la información ya presente en el modelo mediante evaluación en espacio entero. Según la model card, no hubo training runs ni clústeres, y el modelo se generó y evaluó directamente como archivo GGUF.

El autor indica que la técnica es aplicable a todo tipo de modelos y que los detalles del método se publicarán más adelante. No se especifican el número de tokens de entrenamiento, la composición del dataset original, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card menciona que el modelo tiene un "thinking mode" que se activa durante la generación y que se usó en las evaluaciones con hasta 24K tokens.

Un detalle técnico relevante es la corrección de un bug de cuantización: las primeras cuantizaciones se generaron desde una exportación BF16, cuyo redondeo era del mismo orden que el cambio introducido por la selección. Todos los archivos actuales se construyen directamente desde los pesos de precisión completa, salvo el Q4_K_M de la liga, que nunca estuvo afectado.

## Capacidades
- Generación de texto conversacional en inglés.
- Razonamiento matemático con modo "thinking" activable, evaluado en AIME 2025 y AIME 2026.
- Generación y razonamiento sobre código, según los tags del repositorio (code, coding) y la liga de selección basada en preguntas difíciles de programación.
- Razonamiento multi-paso y tareas agénticas, mencionadas como parte de la liga de selección.
- Inferencia local en llama.cpp, LM Studio y Ollama, con compatibilidad declarada con endpoints.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés.

## Casos de uso
- Asistente de código en local: el modelo puede integrarse en editores o IDEs mediante llama.cpp u Ollama para autocompletado y explicación de fragmentos, aprovechando su tamaño de 2,5B y sus cuantizaciones de 1,2-1,6 GB que caben en GPUs de gama baja.
- Resolución de problemas matemáticos con razonamiento extendido: el modo thinking permite generar cadenas de razonamiento de hasta 24K tokens, adecuado para problemas de competición o verificación de cálculos paso a paso.
- Despliegue on-device en portátiles con 6 GB de VRAM: el autor valida el flujo completo en ese hardware, por lo que es viable para prototipos y demos sin infraestructura de servidor.
- Evaluación de técnicas de cuantización: la tabla de KL y acuerdo top-1 por cuantización sirve como referencia para decidir el equilibrio tamaño/calidad en pipelines de despliegue.
- Entornos con requisitos de privacidad: al ejecutarse localmente y con licencia Apache 2.0, permite procesar código o datos sensibles sin enviarlos a APIs externas.
- Experimentación académica sobre selección de pesos: el modelo es un caso de estudio de la técnica "Integer Space Artificial Selection" aplicada a un modelo base de 2B, útil para reproducir o comparar metodologías de merge.
- Chat conversacional ligero en inglés: para asistentes de propósito general con recursos limitados, aunque con las reservas sobre calidad fuera de código y matemáticas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Configuracion | Notas |
|---|---|---|---|
| AIME 2025 | 21/30 = 70,0% | thinking on, hasta 24K tokens, temperature 1.0, 1 muestra, Q8_0 | Medido sobre la Q8_0 de exportación BF16 anterior, no sobre el archivo actual; rerun pendiente |
| AIME 2026 (run 1) | 23/30 = 76,7% | thinking on, hasta 24K tokens, temperature 1.0, 1 muestra, Q4_K_M | Sin herramientas, con harness de benchmarking |
| AIME 2026 (run 2) | 21/30 = 70,0% | thinking on, hasta 24K tokens, temperature 1.0, 1 muestra, Q8_0 | Medido sobre la Q8_0 de exportación BF16 anterior; rerun pendiente |

No se han publicado resultados de benchmarks de código en la información disponible; el autor indica que están "coming soon". Tampoco hay datos de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

| Cuantizacion | Tamano del archivo | VRAM estimada para inferencia |
|---|---|---|
| Q8_0 | 2,68 GB | aproximadamente 3,5-4 GB |
| i1-Q6_KO / Q6_K | 2,07 GB | aproximadamente 3-3,5 GB |
| Q5_K_M | 1,81 GB | aproximadamente 2,5-3 GB |
| i1-Q4_K_MO / Q4_K_M-league | 1,56 GB | aproximadamente 2-2,5 GB |
| i1-IQ4_XS | 1,42 GB | aproximadamente 2 GB |
| i1-Q3_K_LO | 1,40 GB | aproximadamente 2 GB |
| i1-Q3_K_MO | 1,35 GB | aproximadamente 2 GB |
| i1-Q3_K_SO | 1,24 GB | aproximadamente 1,5-2 GB |
| i1-IQ3_M | 1,23 GB | aproximadamente 1,5-2 GB |
| i1-IQ3_S | 1,19 GB | aproximadamente 1,5-2 GB |

- El autor confirma que el flujo completo se ejecutó en un portátil con GPU de 6 GB de VRAM.
- Cabe en GPUs consumer de gama media y baja (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y en equipos con 8 GB de RAM o más para las cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama, según los tags del repositorio. No se menciona soporte de vLLM ni TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vulcan-1-small (este modelo) | 2,5B | no disponible | Apache 2.0 | GGUF | Derivado por selección de pesos de CherryPit 1.2; benchmarks solo en AIME |
| DRUPEs/CherryPit-1.2-2B | 2B (aproximado, según nombre) | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base del que deriva Vulcan; el autor lo califica como "excelente" |
| Alternativas de 2-3B para código | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparación cuantitativa |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento con modelos alternativos de la misma categoría.

## Limitaciones y advertencias
- El modelo no ha sido probado exhaustivamente ni entrenado adicionalmente tras la selección; el autor advierte que puede presentar fallos, como una ocasión en la que emitió una secuencia de símbolos.
- Los benchmarks publicados son únicamente matemáticos (AIME) y con una sola muestra por ejecución, lo que limita la significación estadística; el propio autor señala que a ese nivel los resultados podrían ser ruido.
- Los resultados de AIME 2025 y del run 2 de AIME 2026 se midieron sobre una Q8_0 de exportación BF16 anterior, no sobre los archivos actuales; el rerun está pendiente.
- Los benchmarks de código, que son la especialidad declarada del modelo, no están disponibles todavía.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines agénticos que dependan de APIs externas.
- La longitud de contexto no está especificada; los 24K tokens mencionados corresponden a la generación con thinking, no necesariamente a la ventana de contexto del modelo.
- La técnica de selección es propietaria y sus detalles no se han publicado; la reproducibilidad es limitada hasta que el autor libere el método.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base CherryPit 1.2 debe verificarse por separado en cuanto a sus propios términos.
- Riesgo de alucinación inherente a modelos de 2,5B, especialmente fuera de los dominios de código y matemáticas para los que fue seleccionado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Directorio de imatrix del repositorio: https://huggingface.co/MisasAI/Vulcan-1-small-GGUF/tree/main/imatrix
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
