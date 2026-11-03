# KDDSTLC/lfed-lfm3-1.7b-two-hop-gguf

## Resumen

`KDDSTLC/lfed-lfm3-1.7b-two-hop-gguf` es una exportación en formato GGUF del modelo `KDDSTLC/lfed-lfm3-1.7b-two-hop-bf16`, un ajuste fino de `LiquidAI/LFM3-1.7B`. El modelo base pertenece a la familia LFM3 de Liquid AI, con 1.728.801.600 parámetros, y ha sido especializado por el autor (KDDSTLC) sobre 3.000 trayectorias verificadas de tipo "two-hop" (razonamiento en dos saltos) en los dominios de educación K-12 y finanzas personales y presupuestos.

La especialización está orientada a text-to-SQL sobre DuckDB y a la generación de interfaces de usuario generativas (generative UI), según las etiquetas declaradas en el repositorio. El resultado es un modelo conversacional de pequeño tamaño, cuantizado en `Q8_0` con calibración mediante imatrix, empaquetado en un único archivo GGUF de 1.760,7 MB.

Su relevancia práctica radica en que permite ejecutar localmente un modelo especializado en consultas SQL de dos saltos sobre DuckDB con requisitos de hardware moderados. No obstante, la información publicada es mínima: no hay datos de benchmarks, idiomas, licencia explícita ni detalles sobre el proceso de entrenamiento más allá de la composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; familia LFM3 de Liquid AI) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `Q8_0` calibrado con imatrix (1760,7 MB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 1,8 GB); modelo base en bfloat16 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base en la información disponible. El nombre de la familia (LFM3, Liquid Foundation Models) corresponde a los modelos fundacionales de Liquid AI, pero la model card no especifica si se trata de un transformer convencional, un modelo híbrido o una arquitectura de espacio de estados. Lo que sí se declara es que el ajuste fino se realizó en `bfloat16` nativo sobre el checkpoint `KDDSTLC/lfed-lfm3-1.7b-two-hop-bf16`.

El entrenamiento se llevó a cabo sobre 3.000 trayectorias verificadas de tipo Multi-Turn Two-Hop, es decir, conversaciones multi-turno que requieren encadenar dos pasos de razonamiento (por ejemplo, resolver una subconsulta y usarla como entrada de una segunda consulta SQL). Los dominios cubiertos son Educación K-12 y Finanzas Personales y Presupuestos. No se indica el número total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La cuantización `Q8_0` se ha calibrado con imatrix, lo que suele mejorar la fidelidad de la cuantización respecto a una conversión directa.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis en diálogos que requieren dos pasos de razonamiento encadenados.
- Text-to-SQL especializado en DuckDB: traducción de preguntas en lenguaje natural a consultas SQL sobre esquemas de bases de datos DuckDB.
- Generación de interfaces de usuario generativas (generative UI), según las etiquetas del repositorio.
- Razonamiento en dos saltos (two-hop): resolución de subproblemas intermedios antes de producir la respuesta final.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible más allá del patrón two-hop descrito.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Consultas analíticas sobre DuckDB en educación: un docente o administrador formula una pregunta en lenguaje natural ("¿cuántos alumnos de 3.º de primaria superaron el umbral de lectura en el último trimestre?") y el modelo genera la consulta SQL correspondiente, resolviendo primero la localización de la tabla y el filtro de curso y después la agregación.
- Asistente de presupuesto personal con datos locales: el modelo traduce preguntas como "¿cuánto gasté en transporte el mes pasado comparado con el anterior?" en consultas de dos saltos sobre una base DuckDB con transacciones, adecuado por su tamaño reducido para ejecutarse en local sin enviar datos financieros a la nube.
- Generación de paneles e interfaces dinámicas: gracias a su orientación a generative UI, puede producir especificaciones de componentes o estructuras de vista a partir de una consulta resuelta, útil en herramientas internas de reporting.
- Prototipado de pipelines text-to-SQL: sirve como componente de referencia para validar esquemas y consultas antes de escalar a modelos mayores, con la ventaja de un archivo GGUF de 1,8 GB que se despliega rápidamente.
- Educación asistida por ordenador: integración en tutores que necesitan encadenar un diagnóstico del nivel del alumno con la recuperación de ejercicios o métricas concretas de una base de datos educativa.
- Evaluación de cuantización: al ser una exportación `Q8_0` con imatrix de un ajuste fino concreto, es útil para comparar la degradación de calidad frente al checkpoint bf16 en tareas de SQL y razonamiento two-hop.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF `Q8_0` ocupa 1.760,7 MB, por lo que se necesita aproximadamente 2 GB de VRAM solo para los pesos, más el espacio para la caché KV (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q8_0 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer con 4 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. vLLM y TGI no se declaran explícitamente para este artefacto GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| KDDSTLC/lfed-lfm3-1.7b-two-hop-gguf | 1.728.801.600 | no disponible | GGUF Q8_0 | no disponible | Text-to-SQL DuckDB, two-hop, K-12 y finanzas |
| LiquidAI/LFM3-1.7B (modelo base) | ~1,7 B | no disponible | safetensors | no disponible | Modelo fundacional generalista |
| KDDSTLC/lfed-lfm3-1.7b-two-hop-bf16 (checkpoint fuente) | 1.728.801.600 | no disponible | bfloat16 | no disponible | Misma especialización, sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos text-to-SQL de tamaño similar.

## Limitaciones y advertencias

- El ajuste fino se realizó sobre solo 3.000 trayectorias en dos dominios concretos (K-12 y finanzas personales); es probable un sobreajuste a esos esquemas y una generalización limitada a otras bases de datos o dominios.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se especifican idiomas soportados; el modelo base LFM3 puede tener cobertura multilingüe, pero el ajuste fino probablemente esté dominado por inglés.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad del text-to-SQL generado ni la fidelidad de la cuantización Q8_0 frente al checkpoint bf16.
- Riesgo de alucinación en la generación de SQL: puede inventar tablas, columnas o funciones no presentes en el esquema; se recomienda validación sintáctica y de esquema antes de ejecutar consultas.
- La cuantización Q8_0, aunque calibrada con imatrix, introduce una pérdida de precisión respecto al modelo en bfloat16; en tareas de razonamiento estricto conviene comparar ambas variantes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta la longitud de contexto efectiva del ajuste fino, un factor crítico para consultas SQL con esquemas largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KDDSTLC/lfed-lfm3-1.7b-two-hop-gguf
- Checkpoint fuente (bf16): https://huggingface.co/KDDSTLC/lfed-lfm3-1.7b-two-hop-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
