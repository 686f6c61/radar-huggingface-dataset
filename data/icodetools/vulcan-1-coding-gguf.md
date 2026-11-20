# Icodetools/Vulcan-1-coding-GGUF

## Resumen

Vulcan-1-Coder es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) especializado en código, razonamiento y matemáticas, desarrollado por Icodetools. Se construye a partir de CherryPit 1.2-2B (obra del equipo DRUPEs) mediante una técnica propietaria denominada "Integer Space Artificial Selection", que no entrena el modelo con datos nuevos, sino que selecciona subconjuntos de pesos ya existentes en el modelo base para reforzar determinadas capacidades. El autor afirma haber producido el modelo en una sola tarde, junto con otros 30 modelos de su clase, en un portátil con GPU de 6 GB de VRAM y sin clúster de entrenamiento.

El modelo se distribuye exclusivamente en formato GGUF, con un total de doce cuantizaciones que van desde Q8_0 (2,68 GB) hasta IQ3_S (1,19 GB). La versión que el autor considera "ganadora" de su proceso de selección es la Q4_K_M, de 1,56 GB, que es la que se evaluó en los benchmarks publicados. Está pensado para inferencia local y en dispositivo (on-device), con compatibilidad declarada con llama.cpp, LM Studio y Ollama, y con etiquetas de "endpoints_compatible".

La relevancia actual del modelo radica en su propuesta metodológica: demostrar que es posible obtener mejoras medibles en un modelo pequeño mediante selección de pesos en espacio entero y cuantización optimizada, sin necesidad de un ciclo de entrenamiento adicional. No obstante, la información pública es limitada: los benchmarks de código están pendientes, la técnica no está documentada todavía y parte de los resultados se midieron sobre una exportación BF16 anterior, no sobre los archivos definitivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de CherryPit 1.2-2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los benchmarks usan hasta 24K tokens con thinking activado) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K optimizado con imatrix, Q5_K_M, Q4_K_M, Q4_K optimizado con imatrix, IQ4_XS, Q3_K (S/M/L optimizados con imatrix), IQ3_M, IQ3_S |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión safetensors anunciada como "coming soon") |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base CherryPit 1.2-2B, un transformer de aproximadamente 2,5B parámetros; la model card no detalla capas, dimensiones ocultas ni mecanismos de atención. El aspecto diferencial no es la arquitectura, sino el proceso de construcción: Vulcan-1-Coder se genera mediante "Integer Space Artificial Selection", una técnica que, según el autor, opera sobre los pesos en espacio entero y selecciona configuraciones de pesos que maximizan el rendimiento en un conjunto de tareas de código, matemáticas, razonamiento y agentes. El autor describe el método como "data-led" y afirma que "la información existe en el modelo, solo la seleccionamos", en contraposición al entrenamiento con más datos.

No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque no hay un entrenamiento convencional en el pipeline descrito. La selección se realizó sobre una "liga" (selection league) de preguntas de código difíciles, matemáticas, tareas agénticas y de razonamiento, con un pool amplio y sin repetición de preguntas para evitar sobreajuste. El autor señala que el cambio respecto a CherryPit 1.2 es de aproximadamente un paso BF16 por peso. Todas las cuantizaciones se construyen directamente desde los pesos de precisión completa, y se incluye una matriz de importancia (imatrix) en el repositorio para las variantes `i1-`. La decodificación con "thinking" (cadena de razonamiento extendida) está soportada y se usó en los benchmarks con hasta 24K tokens.

## Capacidades

- Generación de texto conversacional y de código en inglés.
- Razonamiento matemático con modo "thinking" activable, con cadenas de razonamiento de hasta 24K tokens.
- Resolución de problemas de competición (evaluado en AIME 2025 y AIME 2026).
- Razonamiento multi-paso y tareas de tipo agéntico (incluidas en la liga de selección, aunque sin resultados públicos desglosados).
- Capacidades de código: el modelo se posiciona como "coding model", pero los benchmarks de código están anunciados como "coming soon" y no se han publicado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de visión, audio ni otras modalidades.
- Multilingüe: no; solo inglés según la model card.

## Casos de uso

- Asistencia de código en local: el modelo cabe en 1,56 GB en Q4_K_M y puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada, lo que permite autocompletado y explicación de fragmentos de código en entornos con recursos limitados.
- Razonamiento matemático en dispositivo: con el modo thinking y ventanas de hasta 24K tokens, es adecuado para resolver problemas de tipo competición o verificación de cálculos en aplicaciones educativas que deban funcionar offline.
- Prototipado rápido de agentes: su tamaño reducido permite desplegar múltiples instancias en paralelo en una sola GPU consumer para experimentar con pipelines multi-paso antes de escalar a modelos mayores.
- Enseñanza e investigación de técnicas de cuantización: el repositorio incluye doce cuantizaciones con métricas de KL y acuerdo top-1 frente a precisión completa, lo que lo convierte en un caso de estudio práctico para analizar el impacto de la cuantización en modelos pequeños.
- Filtrado y clasificación de código en CI/CD: al ser ligero y compatible con endpoints, puede usarse como primer nivel de revisión (detección de patrones, generación de tests sencillos) antes de recurrir a modelos mayores.
- Aplicaciones de escritorio y móviles con restricciones de memoria: la variante IQ3_S de 1,19 GB permite integración en aplicaciones locales donde no es viable cargar modelos de 7B o superiores.
- Evaluación comparativa de métodos de merge: sirve como referencia para investigadores que estudien selección de pesos en espacio entero frente a fine-tuning convencional.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado | Notas |
|---|---|---|---|
| AIME 2025 | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | 21/30 = 70,0% | Medido sobre la exportación BF16 anterior de Q8_0, no sobre el archivo actual; repetición pendiente |
| AIME 2026 (run 1) | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q4_K_M | 23/30 = 76,7% | Sobre el archivo Q4_K_M ganador de la liga |
| AIME 2026 (run 2) | Thinking on, hasta 24K tokens, temperatura 1.0, 1 muestra, Q8_0 | 21/30 = 70,0% | Medido sobre la exportación BF16 anterior de Q8_0; repetición pendiente |

No se han publicado resultados de benchmarks de código (HumanEval, MBPP u otros) ni de MMLU, GSM8K u otras evaluaciones estándar en la información disponible. El autor indica que los benchmarks de código están "coming soon". Las métricas de cuantización (KL medio y acuerdo top-1 frente a precisión completa, sobre 40 secuencias de 512 tokens retenidos) sí están publicadas por archivo: Q8_0 alcanza KL 0,0005 y 99,3% de acuerdo top-1; Q4_K_M de la liga, KL 0,0615 y 91,6%; IQ3_S, KL 0,2044 y 84,1%.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en Q4_K_M (1,56 GB de pesos más overhead de contexto); aproximadamente 2,7-3,5 GB en Q8_0; aproximadamente 1,3-1,8 GB en las variantes de 3 bits.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M; el autor generó y probó el modelo en una GPU de 6 GB de VRAM. Para Q8_0 se recomienda 6 GB o más.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 4060, RTX 3060 y superiores; también en iGPU y CPU gracias a las variantes de 3 y 4 bits.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (declarados en la model card); el formato GGUF es compatible con cualquier runtime basado en llama.cpp. No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vulcan-1-Coder | 2,5B | No disponible (benchmarks a 24K) | Apache 2.0 | GGUF | Especializado en código y matemáticas; sin benchmarks de código publicados |
| CherryPit 1.2-2B (modelo base) | Aproximadamente 2B | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo del que deriva Vulcan; el autor lo califica de "excelente" |
| Alternativas de 2-3B para código | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada; el autor no incluye comparaciones directas con alternativas.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "no ha sido probado ni entrenado a fondo después de la selección" y que "puede tener fallos", citando como ejemplo una ocasión en que emitió una secuencia de símbolos sin sentido.
- Los benchmarks de código, que son la especialidad declarada del modelo, no están publicados; las únicas evaluaciones son de matemáticas (AIME).
- Dos de los tres resultados de AIME se midieron sobre una exportación BF16 anterior de Q8_0, no sobre los archivos definitivos del repositorio; el autor indica que la repetición está pendiente.
- El método de construcción ("Integer Space Artificial Selection") no está documentado todavía; el autor afirma que publicará los detalles más adelante, por lo que la reproducibilidad es nula por ahora.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La longitud de contexto no está especificada; los 24K tokens usados en benchmarks corresponden a la configuración de evaluación, no a una especificación oficial del modelo.
- No se documenta soporte de tool calling ni de agentes con herramientas; las tareas agénticas solo aparecen mencionadas en la liga de selección.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de CherryPit 1.2-2B conviene verificar la licencia del modelo base antes de un despliegue en producción.
- Riesgo de alucinación inherente a un modelo de 2,5B; no se han publicado evaluaciones de sesgo ni de robustez.
- La versión safetensors no está disponible todavía; solo existen pesos GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Icodetools/Vulcan-1-coding-GGUF
- Modelo base CherryPit 1.2-2B: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Matriz de importancia (imatrix) incluida en el repositorio: carpeta `imatrix/` del repositorio de Hugging Face
- Documentación del método (anunciada, no publicada): no disponible
- Resultados por problema de AIME (anunciados en un sitio en construcción): no disponible
- Benchmarks de código: anunciados como "coming soon", no disponibles
