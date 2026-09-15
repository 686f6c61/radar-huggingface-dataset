# moolvylabs/Morphy-Math-1.5B

## Resumen

Morphy-Math-1.5B es un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por el equipo Moolvylabs en HuggingFace. Se trata del tercer modelo de su familia Morphy y, a diferencia de las entregas anteriores centradas en texto general, se ha construido mediante un ajuste fino selectivo y muy dirigido sobre conjuntos de datos académicos avanzados de matemáticas y física. Deriva del modelo base Qwen2.5-Math-1.5B-Instruct, por lo que hereda la arquitectura transformer decoder-only de la familia Qwen2 y su tokenizador.

El objetivo declarado por el autor es ofrecer un rendimiento alto en ciencias exactas de nivel universitario (cálculo, integrales impropias, series infinitas, ecuaciones diferenciales no lineales, álgebra lineal espectral y física cuántica con notación bra-ket) manteniendo un tamaño lo bastante reducido como para ejecutarse en hardware de consumo. El modelo se distribuye bajo licencia apache-2.0 y está entrenado únicamente en inglés, idioma que el propio autor recomienda para maximizar la precisión en fórmulas simbólicas y notación científica avanzada.

Su relevancia actual reside en la combinación de tres factores: licencia permisiva para uso comercial, huella de memoria reducida (pesos en FP16 de unos 3,1 GB en el repositorio, con variantes cuantizadas más ligeras) y especialización vertical en razonamiento matemático con cadena de pensamiento estricta. Como contrapartida, el repositorio no incluye resultados de benchmarks ni documentación detallada del proceso de entrenamiento, y su adopción por la comunidad es todavía nula (0 descargas y 1 like en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (derivado de Qwen2.5-Math-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0, Q4_K_M y Q5_K_M (formatos mencionados por el autor); el repositorio publica pesos en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only con atención causal completa, normalización RMSNorm y sesgo de atención por consulta (QKV bias). El modelo no introduce innovaciones arquitectónicas propias: se trata de un ajuste fino sobre Qwen2.5-Math-1.5B-Instruct, que a su vez es la variante matemática de la serie Qwen2.5. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (descrito únicamente como «Custom Higher Mathematics & Quantum Physics Paks»), ni si se emplearon técnicas de alineación como RLHF, DPO o PPO.

La innovación declarada por el autor es de naturaleza procedimental, no arquitectónica: un ajuste fino «selectivo y altamente dirigido» orientado a tres áreas concretas (matemáticas superiores y cálculo, álgebra lineal y ecuaciones diferenciales, y computación cuántica y física) con especial énfasis en respuestas paso a paso mediante cadena de pensamiento estricta. El autor advierte además que las variantes cuantizadas de forma agresiva (Q4_K_M y Q5_K_M) pueden sufrir degradación lógica o confusión de índices en ecuaciones abstractas multivariable, mientras que FP16 y Q8_0 conservan prácticamente intacta la lógica de razonamiento complejo.

## Capacidades

- Generación de texto conversacional y resolución de problemas matemáticos con razonamiento paso a paso (cadena de pensamiento estricta).
- Cálculo avanzado: límites, integrales impropias, derivadas y series infinitas de nivel universitario.
- Ecuaciones diferenciales, incluidas las no lineales como la ecuación de Bernoulli.
- Álgebra lineal: teorema espectral, cálculo de valores y vectores propios, operaciones matriciales.
- Física avanzada y computación cuántica: notación bra-ket de Dirac, operadores de Pauli y transformaciones de estados cuánticos.
- Análisis tensorial y razonamiento simbólico (el autor menciona el análisis tensorial como caso donde la cuantización agresiva degrada el resultado).
- Capacidad conversacional multi-turno heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingües: únicamente inglés según la etiqueta de idioma del repositorio; el autor recomienda promptear en inglés para máxima precisión.

## Casos de uso

- Tutoría universitaria de cálculo: el modelo resuelve límites, integrales impropias y series paso a paso, por lo que puede integrarse en una plataforma de estudio que muestre el desarrollo completo y no solo el resultado final.
- Asistencia en cursos de ecuaciones diferenciales: dada su especialización en ecuaciones no lineales como las de Bernoulli, encaja como apoyo para estudiantes que necesitan verificar desarrollos analíticos intermedios.
- Docencia de álgebra lineal: cálculo de valores y vectores propios y aplicación del teorema espectral en ejemplos guiados, con posibilidad de ejecutarse en local en el portátil del profesorado.
- Apoyo a estudiantes de física cuántica: interpretación y manipulación de notación bra-ket, operadores de Pauli y transformaciones de estados, útil como complemento a los apuntes de asignaturas de mecánica cuántica.
- Generación de datasets sintéticos de problemas resueltos: al producir cadenas de razonamiento estructuradas, puede emplearse para crear corpus de entrenamiento o evaluación en dominios de matemáticas y física avanzadas.
- Corrección asistida de ejercicios: verificación de la validez de un desarrollo simbólico propuesto por un alumno, señalando el paso donde se rompe la cadena lógica.
- Prototipado en hardware modesto: con una huella en FP16 de aproximadamente 3,1 GB y menos de 1 GB en Q4_K_M, permite experimentar sin GPU de datacenter, por ejemplo en una estación de trabajo con GPU de gama media o incluso en CPU mediante llama.cpp.
- Despliegue en asistentes técnicos de nicho: chatbots internos para departamentos de ingeniería o investigación que necesiten consultas rápidas sobre formulación matemática, siempre que el uso se limite al inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones cuantitativas frente al modelo base Qwen2.5-Math-1.5B-Instruct. Las únicas valoraciones de rendimiento presentes en la model card son cualitativas y proceden del propio autor.

## Requisitos de hardware

- VRAM estimada (cálculo a partir del número de parámetros, no publicada por el autor):
  - FP16: aproximadamente 3,1 GB solo de pesos; entorno de 4-5 GB con caché KV y activaciones.
  - Q8_0: aproximadamente 1,6 GB de pesos; entorno de 2,5-3 GB.
  - Q4_K_M: aproximadamente 1 GB de pesos; entorno de 2 GB o menos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente en FP16; para cuantizaciones ligeras bastan 2-3 GB.
- Compatibilidad con GPU de consumo: sí. Encaja sin problema en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y en portátiles con 6-8 GB de VRAM cuando se usa Q4_K_M o Q5_K_M.
- Ejecución en CPU: viable gracias al tamaño reducido, especialmente con los formatos cuantizados citados por el autor.
- Opciones de despliegue: safetensors para transformers, vLLM o TGI (compatibles por arquitectura Qwen2) y llama.cpp u Ollama para los formatos GGUF cuantizados. No se documentan en el repositorio recetas de despliegue concretas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Morphy-Math-1.5B | 1.543.714.304 | no disponible | apache-2.0 | Ajuste fino en matemáticas superiores y física cuántica | HuggingFace (moolvylabs) |
| Qwen2.5-Math-1.5B-Instruct (modelo base) | aproximadamente 1,5 B | no disponible | no disponible en la información proporcionada | Matemáticas con razonamiento integrado con herramientas | HuggingFace (Qwen) |
| Qwen2.5-Math-7B | aproximadamente 7 B | no disponible | no disponible en la información proporcionada | Matemáticas, escalón superior de la misma familia | HuggingFace (Qwen) |
| Qwen2.5-1.5B-Instruct | aproximadamente 1,5 B | no disponible | no disponible en la información proporcionada | Propósito general, conversacional | HuggingFace (Qwen) |

Nota: los datos de las alternativas no forman parte de la información proporcionada en esta consulta, por lo que se marcan como no disponibles. La comparación relevante y verificable es que Morphy-Math-1.5B es un derivado directo del modelo base, del que no se publican métricas diferenciales.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente como inglés y el propio autor recomienda promptear en inglés para fórmulas simbólicas complejas; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Ausencia total de benchmarks: no hay evidencia cuantitativa que respalde las afirmaciones de rendimiento de la model card.
- Sin validación de la comunidad: 0 descargas y 1 like en el momento de la consulta, con un repositorio creado y actualizado el mismo día, lo que impide contrastar la calidad real del ajuste fino.
- Degradación por cuantización: el autor advierte explícitamente de posible pérdida de lógica y confusión de índices en ecuaciones abstractas multivariable con Q4_K_M y Q5_K_M.
- Riesgo de alucinación: al ser un modelo de 1,5 B en tareas de razonamiento simbólico, los desarrollos largos pueden contener pasos plausibles pero incorrectos; se recomienda verificación simbólica externa en producción.
- Sesgos conocidos: no disponible; la model card no documenta ningún análisis de sesgos.
- Datos de entrenamiento no documentados: se desconoce la composición exacta del dataset, su procedencia y sus posibles licencias, lo que complica una auditoría de uso comercial.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificación y redistribución, pero no cubre reclamaciones sobre las licencias del dataset de ajuste ni de los datos heredados del modelo base.
- Alcance limitado: no se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad.
- Fecha de publicación: los metadatos indican una fecha de creación posterior a la habitual en los repositorios consultados; conviene verificar la vigencia y el mantenimiento del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moolvylabs/Morphy-Math-1.5B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios de código o demos) en la información disponible.
