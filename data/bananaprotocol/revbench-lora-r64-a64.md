# bananaprotocol/revbench-lora-r64-a64

## Resumen

revbench-lora-r64-a64 es un adaptador LoRA (PEFT) entrenado sobre `codellama/CodeLlama-7b-Instruct-hf` que refina pseudocódigo generado por Ghidra hasta convertirlo en C válido y compilable. Lo publica el usuario bananaprotocol (Hendrik Lohmar, Universidad de Heidelberg) como parte de RevBench, el código de su tesis de grado *Comparison of LoRA and Knowledge Editing for Improving Neural Decompilation* (enero de 2026). El problema que aborda es la descompilación neuronal: los descompiladores clásicos producen pseudocódigo legible para humanos pero no recompilable, y este adaptador cierra parte de esa brecha.

Técnicamente no es un modelo completo, sino un adaptador de bajo rango (r=64, alpha=64) entrenado con QLoRA de 4 bits sobre un único A100 de 40 GB, con un 2,3% de los parámetros del base entrenados. El contexto usado en entrenamiento y evaluación es de 2048 tokens y el único idioma soportado es el inglés. Sobre las 151 funciones C de HumanEval-Decompile, eleva la tasa de compilación del 18,94% al 84,33% y el Pass@1 del 15,50% al 23,95%, siempre contando un acierto solo si la función compila *y* pasa su harness de pruebas original.

Su relevancia es doble: por un lado, es una herramienta práctica y ligera (0,6 GB) para ingeniería inversa y análisis de binarios; por otro, documenta con métricas reproducibles la llamada "brecha sintáctico-semántica", es decir, que el modelo aprende mucho mejor a satisfacer restricciones sintácticas (compilar) que semánticas (funcionar correctamente). El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un artefacto de investigación con validación comunitaria nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre CodeLlama-7b-Instruct, transformer decoder-only |
| Parámetros totales | No disponible de forma explícita. La model card indica que se entrena aproximadamente el 2,3% de los parámetros del modelo base (unos 160 M si se parte de 7 000 M); el base tiene 7B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens en el entrenamiento del adaptador (también el usado en la plantilla de evaluación). El contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantización | No se publican pesos cuantizados. El entrenamiento usa QLoRA de 4 bits y el ejemplo oficial carga el base con `load_in_4bit=True` |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 2 Community License (no Apache-2.0, pese a que el repositorio de código RevBench sí usa Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT); tamaño del repositorio: 0,6 GB |
| Modelo base | codellama/CodeLlama-7b-Instruct-hf |
| Tarea (pipeline) | text-generation |
| Biblioteca | peft |
| Fecha de creación / actualización | 19 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CodeLlama-7b-Instruct, un transformer decoder-only, y modifica las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración LoRA es r=64, alpha=64 y dropout 0, lo que supone entrenar alrededor del 2,3% de los parámetros del base. El entrenamiento se hizo con Unsloth sobre el base cuantizado a 4 bits (QLoRA), durante 3 épocas, con tamaño de lote efectivo 16, contexto de 2048 tokens, learning rate 2e-4, optimizador AdamW de 8 bits y semilla 3407, en una única NVIDIA A100 de 40 GB.

Los datos son aproximadamente 4000 pares `(pseudocódigo de Ghidra, código C original)` construidos a partir de ExeBench. Las fuentes se compilaron con `gcc -O2`, los ficheros objeto se descompilaron con Ghidra en modo headless y los pares se filtraron por longitud de línea y por la ratio entre longitud del pseudocódigo y del código fuente. La innovación metodológica no está en la arquitectura (LoRA estándar) sino en el protocolo de evaluación: se compara LoRA frente a edición de conocimiento para descompilación neuronal, se usan 5 ejecuciones con muestreo de núcleo (temperatura 0,2, top-p 0,95) y se reporta media ± desviación estándar, y se exige compilación y paso del harness para contabilizar un acierto, sin métricas de similitud textual. Existe un segundo adaptador, `bananaprotocol/revbench-lora-mixed`, con datos sintéticos específicos de errores, que sube el Pass@1 a costa de bajar la tasa de compilación.

## Capacidades

- Refinado de pseudocódigo de Ghidra a C compilable, manteniendo el nombre y los argumentos de la función original.
- Generación de código C en formatos estrictos: sin función `main`, sin bloques Markdown y sin texto introductorio, según la plantilla de prompt del autor.
- Seguimiento de instrucciones con restricciones de formato explícitas (reglas numeradas en el prompt).
- Tarea única de traducción/refinado de código; no se documenta razonamiento multi-paso, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de flujos multi-turno; la evaluación es de un solo turno con una plantilla fija.
- No se documenta modo de pensamiento (*thinking*) ni decodificación especulativa.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente como `en`.
- Sensibilidad alta a la plantilla: la propia model card advierte que los resultados se degradan si se usa una plantilla distinta a la de entrenamiento y evaluación.

## Casos de uso

- Ingeniería inversa en análisis de malware: el analista introduce pseudocódigo de Ghidra de una función sospechosa y obtiene C compilable que puede recompilar y ejecutar en una sandbox aislada; la tasa de compilación del 84,33% reduce drásticamente el trabajo de corrección sintáctica manual frente al 18,94% del base.
- Reconstrucción de código legacy sin fuentes: a partir de binarios x86-64 compilados con `gcc -O2`, generar esqueletos en C que sirvan como punto de partida documentado para reescribir módulos de los que solo queda el ejecutable.
- Triaje por lotes en un CERT o SOC: procesar en serie funciones descompiladas y priorizar la revisión humana según las que compilan y pasan pruebas, usando el adaptador como filtro previo en lugar de como oráculo.
- Generación de harnesses y fuzzing: obtener una primera versión compilable de cada función para instrumentarla con cobertura, AFL++ o libFuzzer y buscar fallos de memoria o comportamiento indefinido.
- Investigación académica en descompilación neuronal: reproducir el baseline de RevBench, comparar LoRA con edición de conocimiento y extender el protocolo de evaluación a otros descompiladores u optimizaciones.
- Fine-tuning adicional sobre dominios concretos: al ser un adaptador de 0,6 GB, se puede fusionar sobre el base y seguir entrenando con datos propios (por ejemplo, firmware ARM o binarios de un sector específico) con un coste muy inferior al de un ajuste completo.
- Docencia y formación en reversing: convertir pseudocódigo ilegible en C revisable para material didáctico, siempre con verificación manual posterior.
- Análisis estático de vulnerabilidades: recompilar las funciones refinadas e introducirlas en analizadores estáticos o revisores de CWE para localizar patrones inseguros en software del que no hay fuente.

## Benchmarks y rendimiento

Evaluación sobre las 151 funciones C de HumanEval-Decompile, con muestreo de núcleo (temperatura 0,2, top-p 0,95) y media de 5 ejecuciones ± desviación estándar. Un ejemplo solo cuenta como correcto si la función generada compila y pasa su harness de pruebas original.

| Modelo | Pass@1 | Tasa de compilación |
|---|---|---|
| CodeLlama-7b-Instruct (baseline) | 15,50% ± 1,08 | 18,94% ± 0,53 |
| revbench-lora-r64-a64 (este adaptador) | 23,95% ± 1,35 | 84,33% ± 1,19 |
| bananaprotocol/revbench-lora-mixed | 28,08% ± 1,30 | 64,50% ± 1,54 |

No se han publicado en la información disponible resultados de otros benchmarks habituales (MMLU, HumanEval, GSM8K, MBPP) para este adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,6 GB; los requisitos vienen determinados por el modelo base de 7B.
- VRAM estimada para inferencia (estimaciones convencionales para un modelo de 7B, no cifras publicadas por el autor): unos 4,5-6 GB en 4 bits, 8-10 GB en 8 bits y 14-16 GB en FP16/BF16 incluyendo caché KV y overhead del runtime.
- GPU recomendadas: A100 40 GB u H100 para FP16/BF16 con margen; RTX 4090 (24 GB) para FP16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en cualquier GPU con 8 GB o más, y en FP16 en GPU de 24 GB.
- Entrenamiento: el autor documenta una única NVIDIA A100 de 40 GB con QLoRA de 4 bits y Unsloth.
- Opciones de despliegue: `transformers` + `peft` es el camino documentado y verificado en la model card (`PeftModel.from_pretrained` con `load_in_4bit=True`). Fusionar el adaptador y servirlo con vLLM o TGI es técnicamente factible, pero no está documentado ni verificado en la información disponible. No se ha publicado conversión a GGUF, por lo que llama.cpp u Ollama no son utilizables sin convertir los pesos.
- Latencia y throughput: no disponibles.
- Parámetros de generación usados en la evaluación: `max_new_tokens` 512, temperatura 0,2, top-p 0,95, muestreo activado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pass@1 | Tasa de compilación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CodeLlama-7b-Instruct (base) | 7B | No especificado en la información disponible | 15,50% ± 1,08 | 18,94% ± 0,53 | Llama 2 | HuggingFace |
| revbench-lora-r64-a64 | 7B + LoRA (~2,3% entrenado) | 2048 tokens en entrenamiento | 23,95% ± 1,35 | 84,33% ± 1,19 | Llama 2 | HuggingFace (0 descargas) |
| bananaprotocol/revbench-lora-mixed | 7B + LoRA | 2048 tokens en entrenamiento | 28,08% ± 1,30 | 64,50% ± 1,54 | Llama 2 | HuggingFace |

No se dispone en la información proporcionada de comparaciones con otros modelos especializados en descompilación (por ejemplo, propuestas de la literatura de LLM para decompilación); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con funciones C individuales procedentes de objetos x86-64 compilados con `gcc -O2` y descompilados con Ghidra. Otros descompiladores, niveles de optimización, arquitecturas o entradas de programa completo quedan fuera de distribución.
- Incluso con una tasa de compilación del 84,33%, alrededor de tres cuartas partes de las funciones generadas no pasan su harness de pruebas, es decir, el Pass@1 real es del 23,95%. La salida debe revisarse y probarse siempre; no sustituye al código original.
- Comportamiento inestable por muestra: en 5 ejecuciones, el 21% de las funciones de prueba pasan en algunas ejecuciones y fallan en otras.
- Alta dependencia de la plantilla de prompt: la model card advierte explícitamente que los resultados se degradan con una plantilla distinta a la usada en entrenamiento y evaluación.
- Riesgo de alucinación semántica: el modelo puede producir C que compila pero no reproduce el comportamiento del binario original, que es precisamente el fenómeno documentado como brecha sintáctico-semántica.
- Solo inglés: no hay soporte documentado para prompts en castellano ni para otros idiomas.
- Licencia restrictiva: al ser derivado de CodeLlama-7b-Instruct, queda cubierto por la Llama 2 Community License, que incluye política de uso aceptable y una restricción de uso comercial para organizaciones con más de 700 millones de usuarios activos mensuales. No hereda la Apache-2.0 del repositorio de código RevBench.
- Artefacto de investigación: procede de una tesis de grado (enero de 2026), no de un proceso de revisión por pares, y no tiene descargas ni valoraciones en HuggingFace, por lo que carece de validación independiente.
- Los metadatos indican fecha de creación en septiembre de 2026 y actualización tres minutos después, lo que sugiere una subida única sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bananaprotocol/revbench-lora-r64-a64
- Adaptador alternativo (mixed): https://huggingface.co/bananaprotocol/revbench-lora-mixed
- Repositorio de código y memoria completa: https://github.com/bananaprotocol/RevBench
- Modelo base: https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf
- Ghidra: https://ghidra-sre.org/
- ExeBench (origen de los datos): https://github.com/jordiae/exebench
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Licencia Llama 2: https://ai.meta.com/llama/license/
- HumanEval-Decompile: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas de soporte de Microsoft sin relación con el contenido de esta ficha.
