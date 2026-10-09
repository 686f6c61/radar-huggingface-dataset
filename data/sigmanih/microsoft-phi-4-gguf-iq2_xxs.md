# sigmanih/microsoft-phi-4-GGUF-IQ2_XXS

## Resumen

Esta ficha describe `sigmanih/microsoft-phi-4-GGUF-IQ2_XXS`, una cuantizacion en formato GGUF del modelo `microsoft/phi-4`, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. Se trata de una version comprimida a 2 bits (tipo IQ2_XXS con imatrix) del modelo original de Microsoft, cuyo objetivo es reducir el peso en disco hasta 5,01 GB y permitir la inferencia en GPUs de gama de consumo con 8-12 GB de VRAM o en CPU con 16-32 GB de RAM.

El modelo base phi-4 es un transformer decoder denso de 14.659.507.200 parametros (~14,66 mil millones), con arquitectura phi3, 40 capas, dimension oculta de 5120 y una ventana de contexto de 16.384 tokens. La cuantizacion extrema a 2 bits busca hacer viable su ejecucion en hardware modesto, a costa de una degradacion notable de la calidad respecto al modelo en precision completa.

La relevancia de esta publicacion radica en que permite probar un modelo de ~14,6 B en equipos sin GPU dedicada de gama alta. No obstante, los datos de evaluacion facilitados por el autor provienen de subconjuntos parciales de los benchmarks (no de las suites completas) y arrojan resultados mixtos, con un 36% en MMLU y un 0% de finalizacion autonoma en tareas de agente, por lo que conviene tratar las cifras con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura `phi3`) |
| Parametros totales | 14.659.507.200 (~14,66 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE. La model card indica "~8,3 B" sin aclarar el criterio de esa cifra |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | IQ2_XXS (GGUF, con imatrix); el repositorio solo publica esta cuantizacion |
| Idiomas soportados | Ingles (`en`) e italiano (`it`) segun la model card; el modelo base esta principalmente orientado al ingles |
| Licencia | `other` en los metadatos del repositorio; el badge enlaza a Apache-2.0 y el modelo base phi-4 usa MIT (discrepancia no resuelta) |
| Formato de pesos | GGUF (un unico archivo, tamano de repo 5,4 GB, huella en disco indicada de 5,01 GB) |

## Arquitectura y entrenamiento

El modelo base `microsoft/phi-4` emplea una arquitectura de transformer decoder denso (etiquetada como `phi3` en la model card) con 40 capas de transformer, una dimension oculta de 5120 y una ventana de contexto de 16.384 tokens. Al ser un modelo denso, todos los parametros participan en cada paso de inferencia, por lo que la distincion entre parametros totales y activos no es aplicable; la cifra de "~8,3 B" que aparece en la model card no se corresponde con una arquitectura MoE y no se explica su origen.

La aportacion de este repositorio no es el entrenamiento, sino la cuantizacion: se ha aplicado una cuantizacion de 2 bits de tipo IQ2_XXS con imatrix (matriz de importancia), una tecnica que asigna distinto numero de bits a cada peso segun su relevancia para la calidad de salida. Este proceso reduce drasticamente el espacio en memoria, pero tambien introduce una perdida de precision considerable en comparacion con cuantizaciones de 4 u 8 bits. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO, ya que estos datos no aparecen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles e italiano (idiomas declarados en la model card).
- Razonamiento de multiples pasos mediante un modo de "pensamiento profundo" (CoT), que segun las pruebas del autor rinde peor que la respuesta directa (-6,8% de precision).
- Generacion de codigo Python: 71% en HumanEval (5/7) y 67% en MBPP (6/9) sobre las muestras evaluadas.
- Razonamiento matematico: 67% en GSM8K (6/9) y 56% en MATH (5/9) sobre las muestras evaluadas.
- Razonamiento cientifico y de sentido comun: 89% en ARC-Challenge (8/9), 100% en BIG-Bench Hard (7/7) y 56% en HellaSwag (5/9).
- Respuesta factual orientada a reducir alucinaciones: 89% en TruthfulQA (8/9).
- Tool calling / function calling: la model card declara una adherencia al protocolo del 57,6%, aunque tambien reporta 0/92 criterios analiticos verificados y 0% de finalizacion autonoma; los datos son contradictorios.
- Capacidades de agente multi-paso: no demostradas en las pruebas facilitadas (0,0% de tareas autonomas completadas).
- No se menciona soporte de vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con un consumo de VRAM estimado de ~7,2 GB, el modelo puede ejecutarse integramente en GPU en tarjetas de 8-12 GB, lo que permite montar asistentes offline sin depender de la nube.
- Generacion de codigo asistida en equipos modestos: para autocompletado o generacion de funciones Python en entornos con poca memoria, aprovechando su 71% en HumanEval sobre la muestra evaluada.
- Tutoria y resolucion de problemas de matematicas de nivel escolar: el 67% en GSM8K lo hace util para ejercicios de varios pasos, aunque no para competicion de alto nivel (56% en MATH, con muestra reducida).
- Procesamiento de texto en CPU o entornos edge: con un requisito de ~7,0 GB de RAM en modo CPU/hibrido, encaja en servidores ligeros o dispositivos sin GPU dedicada.
- Filtrado y verificacion factual en pipelines de contenido: su 89% en TruthfulQA sobre la muestra evaluada lo orienta a tareas de Q&A donde la fidelidad importa, siempre con verificacion humana.
- Aplicaciones centradas en privacidad: al poder ejecutarse en local sin conexion, resulta adecuado para procesar documentos sensibles que no deben salir del equipo.
- Traduccion y asistencia bilingue ingles-italiano: los dos idiomas declarados permiten usos de traduccion basica, aunque el soporte multilingue es limitado.
- Prototipado de agentes con herramientas: viable solo como banco de pruebas, dado que la finalizacion autonoma reportada es del 0% y la adherencia al protocolo de herramientas es parcial.

## Benchmarks y rendimiento

Resultados facilitados por el autor, medidos con SigmaEngine sobre GPU (temperatura 0, semilla 42). El propio autor advierte que se calcularon sobre un subconjunto de cada suite y que, por tanto, no son comparables con ejecuciones sobre la suite completa.

| Benchmark | Dominio | Correctas / total | Precision | Estado |
|---|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89% | Aprobado |
| BIG-Bench Hard | Logica y tareas simbolicas | 7 / 7 | 100% | Aprobado |
| GPQA | Razonamiento academico de posgrado | 3 / 9 | 33% | Bajo |
| GSM8K | Matematicas escolares multi-paso | 6 / 9 | 67% | Aceptable |
| HellaSwag | Sentido comun y NLI situacional | 5 / 9 | 56% | Aceptable |
| HumanEval | Codigo Python (pass@1) | 5 / 7 | 71% | Aprobado |
| MATH | Matematicas de competicion | 5 / 9 | 56% | Aceptable |
| MBPP | Programacion Python con tests | 6 / 9 | 67% | Aceptable |
| MMLU | Conocimiento general multitema | 5 / 14 | 36% | Bajo |
| MMLU-Pro | Razonamiento avanzado multi-paso | 4 / 9 | 44% | Aceptable |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89% | Aprobado |
| Total | Todas las suites evaluadas | 62 / 100 | 62% | 62% de aciertos |

Comparacion de modos de razonamiento:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| Sin razonamiento (respuesta directa) | 64,9% | 37 / 57 | Latencia minima, sin tokens de razonamiento |
| Razonamiento CoT ("Deep Thinking") | 58,1% | 25 / 43 | Traza de razonamiento multi-paso, peor resultado (-6,8%) |

Protocolo de evaluacion: `code_execution`, `continuation_logprob`, `cot_generation`, `letter_logprob`; temperatura 0; semilla 42. Hash de reproducibilidad declarado: `SHA256-A05755211D782758`.

Benchmark de tool calling sobre entorno aislado (Sandbox Jail):

| Metrica | Resultado | Detalle |
|---|---|---|
| Adherencia al protocolo de herramientas | 57,6% | 0/92 criterios analiticos verificados |
| Finalizacion autonoma de tareas | 0,0% | 0/1 escenarios completados con el archivo objetivo exacto |
| Contencion en el sandbox | 100% conforme | Cero intentos de escape del espacio de trabajo |
| Eficiencia de ejecucion | 0 turnos (0,0 s) | Uso del presupuesto de turnos y tokens no cuantificado |

No se han publicado resultados de benchmarks sobre las suites completas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~7,2 GB para descarga completa en GPU; ~7,0 GB de RAM en modo CPU o hibrido (cifras del autor).
- GPUs recomendadas: cualquier tarjeta con 8-12 GB de VRAM. Encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, o modelos de portatil con 8 GB. No se especifican modelos profesionales como A100 o H100, ya que el objetivo es hardware de consumo.
- Cabe en GPU de consumo: si, es precisamente su razon de ser. Tambien puede ejecutarse en CPU con 16-32 GB de RAM.
- Opciones de despliegue: llama.cpp (formato nativo), asi como los runners compatibles con GGUF (Ollama, LM Studio, entre otros). La model card menciona `endpoints_compatible` y llama.cpp entre los tags.
- Latencia y rendimiento: no disponible. La model card describe el modo sin razonamiento como de latencia minima y primer token inmediato, pero no aporta cifras de tokens por segundo ni de latencia concretas.
- Huella en disco: 5,01 GB segun la model card; 5,4 GB de tamano total del repositorio.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks de modelos alternativos, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sigmanih/microsoft-phi-4-GGUF-IQ2_XXS | ~14,66 B (denso) | 16.384 tokens | GGUF IQ2_XXS | "other" (badge Apache-2.0; base MIT) | HuggingFace, 0 descargas |
| microsoft/phi-4 (modelo base) | ~14,66 B (denso) | 16.384 tokens | Safetensors (BF16/FP16) | MIT | HuggingFace |
| Otras cuantizaciones de phi-4 (Q4, Q8, etc.) | ~14,66 B (denso) | 16.384 tokens | GGUF | Segun el autor de cada repo | HuggingFace |
| Alternativas de ~8 B (por ejemplo Llama-3.1-8B o Qwen2.5-7B) | ~7-8 B | Hasta 128.000 tokens | Safetensors, GGUF | Licencias comunitarias o Apache-2.0 | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits (IQ2_XXS) degrada significativamente la calidad frente al modelo en precision completa; los resultados deben interpretarse como propios de esta version cuantizada, no del phi-4 original.
- Riesgo de alucinacion: aunque TruthfulQA reporta un 89%, la muestra evaluada es muy pequena (9 preguntas), por lo que la cifra no es extrapolable.
- Rendimiento bajo en conocimiento general y razonamiento avanzado en las pruebas facilitadas: 36% en MMLU, 33% en GPQA y 44% en MMLU-Pro.
- El modo de razonamiento CoT empeora el resultado respecto a la respuesta directa (-6,8%), lo que cuestiona su utilidad en este modelo.
- Capacidades de agente muy limitadas: 0% de finalizacion autonoma y 0/92 criterios analiticos verificados, pese a declarar un 57,6% de adherencia al protocolo. Los datos son internamente contradictorios.
- Ventana de contexto moderada (16.384 tokens) frente a alternativas actuales que ofrecen 128.000 tokens o mas.
- Soporte limitado de idiomas (solo ingles e italiano); no hay evidencia de buen rendimiento en castellano.
- Licencia ambigua: los metadatos indican `other`, el badge enlaza a Apache-2.0 y el modelo base usa MIT. Antes de un uso comercial conviene verificar la licencia aplicable del modelo base y de la cuantizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- Los benchmarks se calcularon sobre subconjuntos parciales de cada suite, por lo que no son comparables con ejecuciones completas ni con las cifras oficiales de phi-4.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-IQ2_XXS
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en HuggingFace: https://huggingface.co/sigmanih
