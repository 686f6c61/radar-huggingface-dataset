# pranil00/ONIX-DeepSeek-R1-GGUF

## Resumen

ONIX-DeepSeek-R1-GGUF es una cuantización extrema del modelo DeepSeek-R1, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se distribuye en formato GGUF con el esquema de cuantización IQ1_S, que reduce los pesos a 1,56 bits por parámetro y comprime el artefacto hasta 7,35 GB frente a los 75,43 GB del modelo original en FP16. El objetivo declarado es permitir la ejecución de un modelo de razonamiento de gran tamaño en hardware de consumo mediante el motor run-any-model.

La model card atribuye al modelo base 38.569.072.640 parámetros (38,57 mil millones), si bien esta cifra no coincide con las especificaciones públicas de DeepSeek-R1, por lo que debe tomarse con cautela. El artefacto se presenta como una solución de "squeeze extremo" orientada a preservar chat básico y extracción de hechos, asumiendo una pérdida estimada del 40 % de fidelidad cognitiva respecto al modelo sin cuantizar.

Su relevancia es fundamentalmente práctica: demuestra hasta qué punto se puede comprimir un modelo de razonamiento para que quepa en 8,85 GB de VRAM en GPU NVIDIA o 9,15 GB de memoria unificada en Apple Silicon, a costa de degradar capacidades de lógica de alto orden y generación de código. No obstante, el repositorio no registra descargas ni interacciones, y parte de sus cifras técnicas no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia DeepSeek, modelo base DeepSeek-R1); detalles de atención y capas no disponibles |
| Parametros totales | 38.569.072.640 (38,57 B) segun la model card; no verificado |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `deepseek-ai--DeepSeek-R1-IQ1_S.gguf`, 7,35 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión cuantizada del modelo DeepSeek-R1, un transformer denso orientado a razonamiento con cadenas de pensamiento largas. La model card no aporta detalles sobre el número de capas, el mecanismo de atención ni la composición del dataset de entrenamiento original; únicamente indica que el modelo base pertenece a la familia DeepSeek y que la conversión se realizó de forma autónoma con el motor run-any-model.

La innovación técnica del repositorio no reside en el entrenamiento, sino en la compresión: se aplica cuantización IQ1_S a 1,56 bits por peso, lo que reduce el tamaño un 90,2 % respecto a FP16. El informe de telemetría incluido menciona la aceleración de las 61 capas del modelo en Metal y una caché KV en Q4_0 de 1.708 MB. No se documentan procesos de RLHF, DPO ni ajuste posterior; todas las capacidades de razonamiento proceden del modelo base y quedan degradadas por la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con calidad preservada de forma parcial tras la compresión.
- Extracción de hechos y respuestas factuales básicas, según el propio informe del autor.
- Razonamiento de alto orden limitado: la model card advierte de que la lógica compleja puede verse afectada.
- Generación de código y compilación de código: explícitamente señaladas como posiblemente degradadas.
- Razonamiento matemático: no se garantiza su conservación tras la cuantización extrema.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero el efecto de IQ1_S sobre idiomas distintos del inglés no está documentado.
- Modo thinking: heredado teóricamente del modelo base, sin confirmación de funcionamiento tras la cuantización.

## Casos de uso

- Pruebas de concepto en portátiles con GPU de consumo: permite cargar un modelo de razonamiento de gran tamaño en 8,85 GB de VRAM, útil para validar pipelines antes de migrar a hardware de servidor.
- Extracción de información de documentos: la conservación de respuestas factuales básicas lo hace adecuado para tareas de recuperación simple en entornos con recursos limitados.
- Chat local sin conexión en Apple Silicon: con 9,15 GB de memoria unificada y aceleración Metal nativa, sirve para asistentes personales offline en equipos M1 a M5.
- Evaluación comparativa de cuantizaciones: sirve como referencia de la frontera de degradación (1,56 bpw) frente a cuantizaciones Q4 o Q8 del mismo modelo base.
- Demostraciones educativas de compresión de modelos: ilustra de forma tangible el compromiso entre tamaño, requisitos de memoria y fidelidad cognitiva.
- Despliegue en CPU con AVX2/AVX-512: con 11,15 GB de RAM libre y contexto de 4.096 tokens, permite ejecutar el modelo en servidores sin GPU para tareas de baja criticidad.
- Prototipado de interfaces conversacionales: integrable en LM Studio, Jan o Text-Generation-WebUI para maquetar productos antes de disponer de infraestructura definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato de rendimiento es el informe de telemetría del autor, que se recoge a continuación:

| Metrica | FP16 (base) | IQ1_S (cuantizado) | Variacion |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 1,56 | -90,2 % |
| Tamano de pesos | 75,43 GB | 7,35 GB | -90,2 % |
| Memoria total residente | 82,24 GB | 9,15 GB | -88,9 % |
| Calidad estimada | 100 % (referencia) | 60 % retenida | -40,0 % |
| Capas aceleradas | 0 % | 61/61 | Optimo |

Estos valores proceden del propio autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: 8,85 GB en GPU NVIDIA (series RTX 30/40/50) con CUDA.
- Memoria unificada: 9,15 GB en Apple Silicon (M1/M2/M3/M4/M5) con Metal.
- CPU: 11,15 GB de RAM libre, con soporte AVX2/AVX-512, contexto limitado a 4.096 tokens.
- GPU recomendadas: cualquier RTX 30/40/50 con al menos 9 GB de VRAM; no se especifican modelos de datacenter como A100 o H100, innecesarios por el reducido tamaño del artefacto.
- Cabe en GPU de consumo: sí, en tarjetas con 10 GB o más de VRAM (por ejemplo, RTX 3080, 4070, 4080, 4090).
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-GGUF (IQ1_S) | 38,57 B (segun autor) | 8.192 tokens (GPU) | GGUF 1,56 bpw | Apache 2.0 | Hugging Face, 0 descargas |
| DeepSeek-R1 (original) | 671 B totales / 37 B activos (MoE) | 128.000 tokens | Safetensors | MIT | Hugging Face, ampliamente utilizado |
| DeepSeek-R1-Distill-Llama-8B | 8 B | 128.000 tokens | Safetensors, GGUF | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-14B | 14 B | 128.000 tokens | Safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparación revela una discrepancia importante: las especificaciones públicas de DeepSeek-R1 describen una arquitectura MoE de 671 B parámetros totales y 37 B activos, mientras que esta model card declara 38,57 B parámetros totales. Además, las alternativas destiladas de 8 B y 14 B ofrecen contextos muy superiores y cuantizaciones estándar (Q4, Q8) con pérdidas de calidad mucho menores, por lo que resultan opciones más equilibradas para hardware de consumo.

## Limitaciones y advertencias

- Pérdida de calidad estimada del 40 % respecto al modelo base, según el propio autor; la lógica de alto orden, la compilación de código y la gramática matizada pueden verse afectadas.
- Discrepancia no resuelta entre los 38,57 B parámetros declarados y la arquitectura MoE de 671 B/37 B activos del DeepSeek-R1 original; conviene verificar el artefacto antes de usarlo en producción.
- Contexto limitado a 8.192 tokens en GPU y Apple Silicon, y a 4.096 en CPU, muy por debajo de los 128.000 tokens del modelo base.
- Riesgo elevado de alucinación y de degradación del razonamiento por la cuantización a 1,56 bits por peso.
- Idiomas soportados no documentados; el comportamiento multilingüe tras IQ1_S es incierto.
- El repositorio no registra descargas ni interacciones, y las cifras de rendimiento proceden únicamente del autor, sin validación externa.
- La model card incluye una cláusula de exención total de responsabilidad que traslada al usuario toda la validación de las salidas.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero la ausencia de pruebas de calidad desaconseja su uso en entornos productivos críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Organización ONIX: https://huggingface.co/ONIX
- Motor run-any-model: https://github.com/PranilShah-08/run-any-model
