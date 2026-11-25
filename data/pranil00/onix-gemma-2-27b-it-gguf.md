# pranil00/ONIX-gemma-2-27b-it-GGUF

## Resumen

ONIX-gemma-2-27b-it-GGUF es una cuantización de tipo IQ2_M del modelo google/gemma-2-27b-it, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community" y generada con la herramienta run-any-model, un motor de optimización de LLM adaptativo al dispositivo. El artefacto resultante es un único fichero GGUF de 10,81 GB que comprime los pesos originales en FP16 (64,08 GB) a 2,7 bits por peso, con una ratio de compresión declarada de 5,93x.

El modelo base es Gemma 2 27B Instruct de Google, un transformer decoder-only de 32.760 millones de parámetros (el autor indica 32,76 B, cifra que incluye la matriz de embeddings), ajustado con instrucciones y optimizado para generación de texto y conversación. Esta cuantización busca hacer viable la ejecución local del modelo completo en hardware de consumo: según la model card, requiere unos 11,91 GB de memoria unificada en Apple Silicon, 12,31 GB de VRAM en GPU NVIDIA o 13,91 GB de RAM en CPU, con ventanas de contexto recomendadas de 8.192 tokens en GPU y 4.096 en CPU.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 27B en equipos con 12-16 GB de memoria; por otro, la model card advierte de una retención de calidad estimada del 82 % respecto al baseline FP16, con posible degradación en razonamiento matemático complejo. La publicación es muy reciente (25 de noviembre de 2026) y no cuenta con descargas ni validación independiente, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens recomendados en GPU/Apple Silicon; 4.096 tokens en CPU (contexto nativo del modelo base no indicado en la información disponible) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); el repositorio solo incluye esta variante |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF (fichero google--gemma-2-27b-it-IQ2_M.gguf) |
| Tamano del repositorio | 11,6 GB |
| Tamano de pesos comprimidos | 10,81 GB (11.072,7 MB) |
| Ratio de compresion | 5,93x respecto a FP16 (83,1 % de reduccion) |
| Modelo base | google/gemma-2-27b-it |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 27B Instruct, un transformer decoder-only denso de 27B parámetros (32,76 B contando embeddings) desarrollado por Google. La model card de esta cuantización no aporta detalles sobre el entrenamiento del modelo base: no se indica el número de tokens de preentrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste con instrucciones más allá de la denominación "it" del checkpoint original.

La innovación técnica de este artefacto no está en la arquitectura, sino en el proceso de cuantización: se ha aplicado un esquema IQ2_M (2,7 bits por peso) mediante la herramienta run-any-model, que según el autor realiza una optimización adaptativa al dispositivo y preserva el KV cache en FP16 (1.024 MB) mientras comprime los pesos. El informe de telemetría incluido en la model card reporta la aceleración de las 64 capas del modelo en Metal y una retención de calidad estimada del 82 % frente al baseline FP16, si bien no se documenta la metodología de esa estimación ni se aportan métricas de perplejidad o benchmarks estándar que la respalden.

## Capacidades

- Generación de texto y conversación multi-turno en formato instruct, heredadas del modelo base google/gemma-2-27b-it.
- Razonamiento general y respuesta a instrucciones; la model card advierte de posible degradación en razonamiento matemático complejo por la cuantización agresiva.
- Generación de código y tareas de escritura, como capacidades propias del modelo base (no verificadas específicamente en esta cuantización).
- Ejecución local multiplataforma: Apple Silicon con Metal, GPU NVIDIA con CUDA, y CPU con soporte AVX2/AVX-512.
- Integración con tool calling y capacidades de agente: no disponible en la información proporcionada para esta cuantización.
- Capacidades multilingües: no disponible (los idiomas no están declarados en el repositorio).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local en portátiles Apple Silicon: con 11,91 GB de memoria unificada y Metal acelerado, el modelo puede mantener sesiones de chat multi-turno con 8.192 tokens de contexto sin depender de la nube, útil para prototipado y uso personal con datos sensibles.
- Despliegue en estaciones de trabajo con GPU de 12 GB: en tarjetas como la RTX 3060 de 12 GB o la RTX 4070, el modelo cabe completo en VRAM (12,31 GB declarados) y permite inferencia CUDA con contexto de 8.192 tokens para tareas de generación de texto y resumen.
- Sustitución de APIs de pago en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, el modelo es adecuado para procesar documentación interna sin enviar datos a terceros.
- Generación de borradores y reescritura de textos: para equipos de contenido que necesitan un modelo instruct de 27B en hardware de consumo, con la salvedad de revisar la calidad frente al modelo original por la pérdida estimada del 18 %.
- Experimentación e investigación sobre cuantización extrema: el artefacto sirve para estudiar el impacto de IQ2_M en un modelo de 27B, comparando salidas con el checkpoint FP16 en tareas controladas.
- Base para pipelines de evaluación local: integrable en LM Studio, Jan o Text-Generation-WebUI para pruebas A/B de prompts y comparativas de calidad en CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un informe de telemetría interna con métricas de memoria y compresión, no de calidad:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/parametro | 2,7 bits/parametro | -83,1 % |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1 % |
| KV cache | 1.024 MB (FP16) | 1.024 MB (FP16) | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7 % |
| Calidad estimada | 100 % baseline | 82,0 % retenida | -18,0 % |
| Capas aceleradas | 0 % (riesgo de crash) | 64/64 capas | Optimo |

No se aportan resultados de MMLU, HumanEval, GSM8K ni de perplejidad para esta cuantización.

## Requisitos de hardware

- VRAM estimada: 12,31 GB de VRAM dedicada en GPU NVIDIA (series RTX 30/40/50) para contexto de 8.192 tokens.
- Apple Silicon: 11,91 GB de memoria unificada (M1/M2/M3/M4/M5) con aceleración Metal nativa.
- CPU: 13,91 GB de RAM libre en Windows/Linux con AVX2/AVX-512, contexto recomendado de 4.096 tokens.
- GPU recomendadas: cualquier NVIDIA con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100); en Apple Silicon, equipos con 16 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM, aunque el margen es ajustado (categoría "TIGHT FIT" según el autor).
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (llama-cli con -ngl 99), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponible; la model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-gemma-2-27b-it-GGUF (este) | 32,76 B | 8.192 tokens (GPU) / 4.096 (CPU) | IQ2_M (2,7 bpw), 10,81 GB | apache-2.0 (declarada) | Repositorio Hugging Face con 0 descargas |
| google/gemma-2-27b-it (original) | 27 B (32,76 B con embeddings) | Contexto nativo del modelo base: no disponible en la informacion | FP16, 64,08 GB | Gemma Terms of Use (segun el modelo base; no verificado en la informacion) | Hugging Face oficial de Google |
| Otras cuantizaciones GGUF de gemma-2-27b-it (p. ej. Q4_K_M) | 32,76 B | Depende de la configuracion | 4-5 bpw tipico, mayor tamano | Depende del publicador | Amplia disponibilidad en la comunidad GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparativa se limita a tamano, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantización IQ2_M es agresiva (2,7 bits por peso); el propio autor estima una retención de calidad del 82 %, con degradación reconocida en razonamiento matemático complejo. No hay benchmarks independientes que confirmen esa cifra.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la compresión; no se han publicado evaluaciones específicas.
- Idiomas soportados no declarados en el repositorio; no se puede garantizar un rendimiento multilingüe equivalente al modelo original.
- La licencia apache-2.0 declarada en el repositorio puede no coincidir con los términos del modelo base google/gemma-2-27b-it (Gemma Terms of Use); conviene verificar la licencia aplicable antes de un uso comercial.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicado el 25 de noviembre de 2026; no hay evidencia de pruebas externas.
- El contexto recomendado se reduce a 4.096 tokens en CPU, lo que limita tareas de contexto largo en ese entorno.
- La model card incluye un descargo de responsabilidad absoluto que traslada al usuario toda la responsabilidad sobre la validación de las salidas.
- No se documenta soporte de tool calling, agentes ni modo thinking para esta cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-gemma-2-27b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
