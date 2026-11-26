# pranil00/ONIX-Qwen2.5-72B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-72B-Instruct-GGUF es una cuantización extrema del modelo Qwen2.5-72B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. Se trata de un artefacto GGUF en formato IQ1_S (1,56 bits por peso) que reduce el modelo original de 72.705.376.256 parámetros desde unos 142,20 GB en FP16 hasta 13,86 GB, con una relación de compresión de 10,26x. El objetivo declarado es hacer ejecutable un modelo de escala 72B en hardware de consumo mediante desalojo híbrido (offload) entre GPU y RAM del sistema.

El modelo base, Qwen2.5-72B-Instruct, es un transformer decoder-only denso de la familia Qwen, distribuido originalmente bajo licencia Apache 2.0. Esta versión no introduce cambios arquitectónicos: es una conversión de pesos con la herramienta run-any-model, un motor de cuantización adaptativa del mismo autor. La model card declara una retención de calidad cognitiva de aproximadamente el 60 % respecto al baseline FP16, lo que sitúa el artefacto en la categoría de "ejecutable pero degradado" más que en la de sustituto de producción.

Su relevancia es fundamentalmente experimental: permite probar un 72B en un Apple Silicon de 16 GB o en una GPU con 15,36 GB de VRAM, a costa de una pérdida de calidad sustancial y de un rendimiento limitado por el streaming de capas desde CPU. No hay descargas ni valoraciones registradas en el momento de la ficha, y la información sobre idiomas, benchmarks y datos de entrenamiento del modelo base no se detalla en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 72.705.376.256 (72,71 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (óptimo declarado en GPU/Apple Silicon); 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-72B-Instruct-IQ1_S.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-72B-Instruct original: un transformer decoder-only denso con atención completa, sin mezcla de expertos ni componentes de estado recurrente. Esta publicación no entrena ni afina el modelo; únicamente aplica cuantización post-entrenamiento con el motor run-any-model, que genera un GGUF IQ1_S de 13,86 GB (14.196,8 MB) y una caché KV en Q4_0 de 320 MB. La model card no documenta el proceso de calibración de la cuantización, el conjunto de datos de calibración ni la metodología empleada para estimar la retención de calidad del 60 %.

El pipeline de ejecución es el rasgo técnico destacable: el motor reparte el modelo en 80 capas, de las cuales 66 (el 82 %) se descargan en la GPU o en la memoria unificada de Metal, mientras que las restantes se sirven por streaming desde la RAM del sistema. Este desalojo híbrido es lo que permite ejecutar un 72B en 14,33 GB de memoria unificada en Apple Silicon o en 15,36 GB de VRAM en NVIDIA, a cambio de una velocidad de generación notablemente inferior. No se proporcionan datos sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO del modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Qwen2.5-72B-Instruct.
- Razonamiento y matemáticas de nivel 72B, aunque con degradación estimada del 40 % respecto al baseline FP16 según el propio autor.
- Generación de código y comprensión de lenguajes de programación, sujeta a la misma pérdida de fidelidad por cuantización.
- Soporte de tool calling y function calling, presumiblemente conservado del modelo base, aunque no verificado en esta conversión.
- Capacidades multilingües del modelo original, sin que la model card especifique la lista de idiomas soportados.
- Modo conversacional por terminal mediante `-cnv` en llama.cpp y plantillas de parada `<|im_end|>` y `<|endoftext|>`.
- Ejecución multiplataforma: Metal en Apple Silicon, CUDA en NVIDIA y AVX2/AVX-512 en CPU x86.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en esta publicación.

## Casos de uso

- Evaluación de modelos a gran escala en portátiles: permite probar cualitativamente un 72B en un Mac con 16 GB de memoria unificada para comparar estilos de respuesta frente a modelos menores, aceptando la pérdida de precisión.
- Prototipado de pipelines de agentes en local: la ventana de 8.192 tokens y el soporte presumible de tool calling permiten ensayar flujos multi-paso sin coste de API antes de migrar a la versión FP16 o a un proveedor en la nube.
- Docencia e investigación sobre cuantización: el artefacto sirve para estudiar empíricamente el efecto de IQ1_S en tareas de razonamiento, midiendo la degradación real frente al baseline declarado del 60 %.
- Generación de código en entornos air-gapped: al ejecutarse íntegramente en local con llama.cpp u Ollama, permite asistencia de programación sin enviar código a servicios externos, con la cautela de validar cada salida.
- Experimentación con desalojo híbrido: útil para caracterizar el rendimiento de estrategias de offload capa a capa en GPUs de 16 GB y comparar latencias con configuraciones alternativas.
- Chat de terminal para tareas de redacción y resumen: mediante `run-any-model` o `llama-cli -cnv`, para borradores y síntesis de documentos donde la fluidez importa más que la exactitud factual.
- Pruebas de integración en LM Studio, Jan o Text-Generation-WebUI: el GGUF se puede cargar directamente en el directorio `models/` de estas aplicaciones para validar compatibilidad de plantillas y parámetros de muestreo.

## Benchmarks y rendimiento

La model card incluye una matriz de auditoría del motor run-any-model, no benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K). Se reproduce a continuación por su valor técnico:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precisión en bits | 16,0 bits/param | 1,56 bits/param | -90,2 % |
| Tamano de pesos | 142,20 GB | 13,86 GB | -90,2 % |
| Buffer KV cache | 320,0 MB (FP16) | 320,0 MB (Q4_0) | Optimizado |
| RAM residente total | 143,60 GB | 14,33 GB | -90,0 % |
| Categoria de viabilidad | Inusable / crash | Hybrid offload | Validado |
| Calidad estimada | 100 % baseline | 60 % retenido | -40,0 % |
| Aceleracion por capas | 0 % (riesgo de crash) | 66/80 capas | Optimo |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 14,33 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa al 100 %.
- NVIDIA (RTX 30/40/50): 15,36 GB de VRAM dedicada, contexto de 8.192 tokens, aceleración CUDA.
- PC Windows/Linux en CPU: 16,33 GB de RAM libre, contexto de 4.096 tokens, con soporte AVX2 y AVX-512.
- Cabe en GPUs de consumo con 16 GB o más de VRAM (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, RTX 5080/5090) y en Mac con 16 GB unificados o más.
- Despliegue: `run-any-model` (CLI del autor), Ollama con Modelfile, llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- El autor advierte que, al superar el modelo la RAM del acelerador, 66 de 80 capas se descargan en GPU y el resto se sirve por streaming desde CPU, por lo que la velocidad de generación será más lenta que la de un modelo que quepa íntegramente.
- No se proporcionan cifras de latencia ni throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-72B-Instruct-GGUF (esta ficha) | 72,71 B | 8.192 tokens (GPU) / 4.096 (CPU) | IQ1_S (1,56 bits) | Apache 2.0 | GGUF, 13,86 GB |
| Qwen/Qwen2.5-72B-Instruct (original) | 72,71 B | 32.768 tokens nativos (ampliable) | FP16/BF16, GPTQ, AWQ | Apache 2.0 (modelo base) | Safetensors, ~142 GB FP16 |
| Qwen2.5-32B-Instruct | 32 B (aprox.) | 32.768 tokens nativos | FP16, GGUF Q4/Q5/Q8 | Apache 2.0 | Safetensors y GGUF |
| Llama 3.3 70B Instruct | 70 B | 128.000 tokens | FP16, GGUF | Llama 3.3 Community License | Safetensors y GGUF |

La comparación relevante es con el Qwen2.5-72B-Instruct original: esta conversión sacrifica aproximadamente el 40 % de calidad estimada y reduce el contexto operativo a 8.192 tokens para bajar de 142 GB a 13,86 GB. Frente a un Qwen2.5-32B-Instruct en Q4, que ocupa un orden de magnitud similar de memoria pero conserva mayor fidelidad y contexto nativo, la ventaja de esta ficha es únicamente disponer de la "escala 72B" a cualquier precio de precisión. Los datos de contexto nativo de los modelos comparables no se detallan en la información proporcionada y se indican según conocimiento general de sus fichas oficiales.

## Limitaciones y advertencias

- La cuantización IQ1_S a 1,56 bits por peso implica una pérdida estimada del 40 % de calidad; el propio autor declara una retención del 60 %, insuficiente para tareas que requieran exactitud factual o razonamiento matemático fiable.
- Riesgo elevado de alucinación y de degradación gramatical o lógica en cadenas de razonamiento largas, agravado por la cuantización extrema.
- Contexto operativo reducido a 8.192 tokens en GPU y 4.096 en CPU, frente a los 32.768 nativos del modelo base.
- El rendimiento se resiente por el desalojo híbrido: 14 de 80 capas se sirven desde RAM de sistema, lo que introduce latencia adicional no cuantificada.
- La model card no especifica los idiomas soportados ni la composición del dataset de calibración; la cobertura multilingüe debe validarse empíricamente.
- No hay descargas ni valoraciones registradas, y la autoría corresponde a un usuario individual (pranil00) bajo la etiqueta ONIX, no al equipo oficial de Qwen; la trazabilidad del proceso de cuantización es limitada.
- La licencia declarada es Apache 2.0, heredada del modelo base, pero la model card incluye una cláusula de exención de responsabilidad absoluta que conviene revisar antes de un uso comercial.
- No apto para producción sin una validación exhaustiva de salidas; para despliegues reales conviene usar el modelo base en FP16, GPTQ o AWQ, o una cuantización de 4-8 bits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-72B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Repositorio del motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
