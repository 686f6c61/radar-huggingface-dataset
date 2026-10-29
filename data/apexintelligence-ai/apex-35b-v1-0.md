# Apexintelligence-AI/Apex-35B-V1.0

## Resumen

Apex-35B-V1.0 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Apex Intelligence, un laboratorio que lo presenta como su primer modelo publicado. Se trata de un ajuste fino (finetune) del modelo abierto Qwen3.6-35B-A3B de Alibaba, sobre el que se ha continuado el entrenamiento con datos propietarios y «trayectorias de investigación» generadas por un sistema automatizado denominado Apex Research. El modelo declara 35.951.822.704 parámetros totales (35,95B) con aproximadamente 3B activados por token, lo que sitúa su coste de cómputo por token en el rango de un modelo denso de 3B pese a almacenar pesos de 36B.

El objetivo declarado es doble: uso generalista (programación, preguntas y respuestas, búsqueda, tareas agénticas) e investigación científica e ingeniería, con énfasis en planificación de cómputo, escritura y ejecución de programas, dinámica de fluidos y simulación robótica. La ventana de contexto es de 262.144 tokens compartidos entre entrada y salida, pensada para repositorios de código grandes e interacciones multi-turno con herramientas.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable en infraestructura propia; por otro, el autor documenta un proceso de auto-mejora recursiva (RSI) en el que un sistema automático construye datos de entrenamiento, ejecuta experimentos y optimiza kernels de GPU, un enfoque que conviene evaluar con escepticismo porque los detalles metodológicos no están publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), arquitectura declarada en transformers como `qwen3_5_moe`; deriva de Qwen3.6-35B-A3B |
| Parámetros totales | 35.951.822.704 (35,95B) |
| Parámetros activos | Aproximadamente 3B por token |
| Longitud de contexto | 262.144 tokens (ventana compartida entre entrada y salida) |
| Tipos de cuantización | No disponible en la información proporcionada (el repositorio publica safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos: tamaño del repositorio 71,9 GB, pipeline `text-generation`, 17 likes y 0 descargas en el momento de la consulta, creado y actualizado el 28 de octubre de 2026. El tag `image-text-to-text` sugiere capacidad de entrada de imagen, aunque la model card no detalla ningún modo de visión.

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE con 35,95B de parámetros totales y unos 3B activos por token, heredada del modelo base Qwen3.6-35B-A3B. El autor no publica el número de expertos, la dimensión oculta, el número de capas ni la estrategia de enrutamiento en la información disponible. La ventana de 262.144 tokens se declara compartida entre entrada y salida, lo que implica que el presupuesto de contexto se consume tanto al leer como al generar.

El entrenamiento parte del modelo Qwen3.6-35B-A3B y continúa con «datos propietarios y trayectorias de investigación». Según la model card, el sistema Apex Research contribuyó a construir datos para las áreas débiles del modelo, refinar la receta de entrenamiento a partir de retroalimentación experimental y optimizar la infraestructura de entrenamiento e inferencia; los resultados validados de ese proceso se incorporan a iteraciones posteriores. No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o RL con verificadores de ejecución. Tampoco se detalla la innovación de «pensamiento dinámico», más allá de que el modelo decide por sí mismo si razona y durante cuánto tiempo en cada turno, sin conmutación manual de modo. El autor indica que el desarrollo se apoya en el arnés Claude Code (versión 2.1.280 preferida), lo que sugiere un ajuste orientado a flujos de trabajo agénticos con esa herramienta.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas en dominios generales.
- Programación: escritura de código, uso de herramientas y tareas de agente sobre repositorios, favorecidas por la ventana de 262.144 tokens.
- Razonamiento con «pensamiento dinámico»: el modelo decide en cada turno si razona y con qué profundidad, sin cambiar de modo manualmente.
- Uso de herramientas y ejecución de código: planifica cálculos, escribe y ejecuta programas y revisa su enfoque a partir de los resultados o del feedback de ejecución.
- Investigación computacional: flujos de dinámica de fluidos y simulación robótica citados explícitamente por el autor.
- Búsqueda profunda («deep search») y tareas agénticas multi-paso.
- Capacidad multimodal de entrada potencial según el tag `image-text-to-text` del repositorio; no confirmada ni descrita en la model card.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y despliegue vía `transformers`.
- Idiomas: no se documenta cobertura multilingüe específica.

## Casos de uso

- Asistencia de programación sobre repositorios grandes: con 262.144 tokens de contexto compartido, el modelo puede recibir varios ficheros, el histórico de diffs y las trazas de error en una sola pasada, lo que reduce la necesidad de resumir el código antes de consultarlo.
- Agente de CI/CD con ejecución de código: el modelo está entrenado para escribir programas, ejecutarlos y corregir el enfoque con el feedback de ejecución, un bucle adecuado para tareas de reparación de tests o generación de parches verificados automáticamente.
- Integración en el arnés Claude Code: el autor declara soporte explícito para este entorno, por lo que encaja en flujos de trabajo de terminal con llamadas a herramientas y edición de ficheros locales.
- Prototipado de simulación científica: para dinámica de fluidos o simulación robótica, el modelo puede generar scripts de simulación, lanzarlos y ajustar parámetros a partir de las salidas, aunque la validación física debe hacerla un especialista.
- Búsqueda y síntesis documental multi-turno: la ventana larga permite acumular resultados de búsqueda, fuentes y notas intermedias sin truncar, útil en asistentes de investigación internos.
- Automatización de atención al cliente técnica: conversaciones multi-turno con contexto largo y uso de herramientas para consultar estado de sistemas o bases de conocimiento; requiere evaluar antes el comportamiento en el idioma objetivo, ya que no se documentan idiomas soportados.
- Despliegue on-premise con requisitos de licencia laxa: al ser Apache 2.0 y safetensors, encaja en entornos con restricciones de licencia para uso comercial, sujeto a verificación legal del modelo base.
- Exploración de investigación sobre auto-mejora: como objeto de estudio de técnicas RSI y de ajuste sobre modelos Qwen, para equipos que quieran reproducir o auditar el enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible: la model card referencia una imagen (`evaluation-overview.png`) y una tabla detallada cuyo contenido aparece truncado en la extracción. Los benchmarks mencionados, sin valores asociados, son los siguientes.

| Benchmark | Categoría | Métrica declarada | Resultado |
|---|---|---|---|
| Investigación (media de categoría) | Research | Media ponderada de la categoría | No disponible |
| Tareas agénticas (media de categoría) | Agentic Tasks | Media ponderada de la categoría | No disponible |
| Programación (media de categoría) | Coding | Media ponderada de la categoría | No disponible |
| Razonamiento (media de categoría) | Reasoning | Media ponderada de la categoría | No disponible |
| SciCode | Research | Problema principal / subproblema | No disponible |
| CFD-Bench | Research | Victorias / empates / derrotas frente a Qwen3.6-35B-A3B | No disponible |
| RoboRSI | Research | Puntuación individual | No disponible |
| Real2Sim | Research | Puntuación individual | No disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, y los valores de la comparación directa con Qwen3.6-35B-A3B no son legibles en la extracción. Cualquier cifra que circule sin consultar la tabla original de la model card debe considerarse no verificada.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: en torno a 72 GB solo para pesos (35,95B × 2 bytes), sin contar caché KV ni overhead del runtime.
- VRAM para pesos en INT8: aproximadamente 36 GB.
- VRAM para pesos en INT4: aproximadamente 18-20 GB. Al ser MoE, todos los expertos deben residir en memoria, por lo que el ahorro frente a un denso equivalente en cómputo no se traduce en ahorro de VRAM.
- Caché KV: con 262.144 tokens de contexto, la caché puede superar ampliamente el tamaño de los pesos en BF16; para contextos largos conviene cuantizar la caché o limitar la longitud efectiva. No se dispone de cifras oficiales de configuración de cabezas KV.
- GPU recomendadas: H100 80 GB para BF16 en una sola tarjeta; A100 80 GB equivalente; dos A100 40 GB o dos RTX 4090 24 GB con tensor parallelism para BF16; RTX 4090, RTX 3090 o L40S para cuantización INT4 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantización de 4 bits y contexto recortado; en 16 GB (RTX 4080, 4060 Ti) solo con cuantizaciones muy agresivas y probablemente con degradación.
- Opciones de despliegue: `transformers` (formato nativo del repositorio); el tag `endpoints_compatible` apunta a despliegue gestionado compatible con endpoints. vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible; para vLLM y TGI habría que verificar el soporte de la arquitectura `qwen3_5_moe` y la existencia de pesos en formato adecuado.
- Latencia y throughput: no disponibles. Al activar unos 3B parámetros por token, el cómputo por token es bajo, pero el ancho de banda de memoria necesario para recorrer los pesos de 36B condiciona la latencia en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apex-35B-V1.0 | 35,95B | ~3B | 262.144 | Apache 2.0 | Hugging Face, safetensors |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | No disponible en la información | No disponible en la información | Hugging Face, abierto |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 32.768 nativo, ampliable con YaRN (dato de referencia pública, conviene verificarlo) | Apache 2.0 | Hugging Face |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 | Apache 2.0 | Hugging Face |

Frente a su modelo base, Apex-35B-V1.0 aporta un ajuste orientado a agentes e investigación y una ventana declarada de 262.144 tokens; la comparación de rendimiento directa está publicada en la model card (CFD-Bench como victorias/empates/derrotas) pero los valores no son legibles en la información disponible, por lo que no puede afirmarse una mejora cuantificada. Frente a Mixtral 8x7B, el modelo de Apex activa cuatro veces menos parámetros por token y declara una ventana ocho veces mayor, aunque no hay benchmarks públicos que permitan comparar calidad. La comparación con modelos densos de ~30B no está cubierta por los datos disponibles.

## Limitaciones y advertencias

- Ausencia de benchmarks verificables: la tabla de resultados está publicada como imagen y tabla truncada; no hay cifras contrastables de MMLU, HumanEval o GSM8K en la información disponible.
- Idiomas no documentados: no se especifica cobertura multilingüe ni calidad en castellano; es un riesgo directo para despliegues en español.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de error. En tareas de investigación y científicas, las salidas deben validarse con ejecución real y revisión experta.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o robustez frente a prompts adversarios.
- Procedencia de los datos: el autor menciona «datos propietarios» y trayectorias generadas por un sistema automático sin detallar composición, filtrado ni procedencia, lo que dificulta auditorías de licencia y de contaminación de benchmarks.
- Modelo con 0 descargas y publicado el mismo día de su creación: no existe evidencia de uso en producción ni validación independiente.
- Licencia: Apache 2.0 en este repositorio, pero conviene verificar la licencia y las condiciones del modelo base Qwen3.6-35B-A3B antes de uso comercial, ya que un finetune hereda obligaciones del modelo original.
- Contexto compartido: los 262.144 tokens se reparten entre entrada y salida, por lo que el contexto efectivo para generar se reduce a medida que crece el prompt.
- Soporte de tooling: la arquitectura `qwen3_5_moe` puede no estar soportada aún por todos los motores de inferencia habituales; hay que comprobar compatibilidad antes de planificar el despliegue.
- Dependencia del arnés Claude Code: parte del ajuste está orientado a ese entorno concreto; el rendimiento fuera de él puede diferir y no está medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0
- Licencia: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/blob/main/LICENSE
- Blog de presentación: https://www.apexin.com/apex-35b/
- Página principal de Apex Intelligence: https://www.apexin.com/
- Sección de investigación: https://www.apexin.com/research/
- Repositorio GitHub: https://github.com/apexin-ai/Apex-35B-V1.0
- Cuenta en X: https://x.com/apexin_ai
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Arnés Claude Code: https://github.com/anthropics/claude-code
- Gráfico de evaluación: https://huggingface.co/Apexintelligence-AI/Apex-35B-V1.0/resolve/main/assets/evaluation-overview.png
- Cobertura externa: https://finance.biggo.com/news/fda45b48-9783-442d-b76f-4af290cb1e97
