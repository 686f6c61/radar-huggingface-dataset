# Naotaka0127/Kyalulu-Mobile-GGUF

## Resumen

Kyalulu-Mobile-GGUF es un repositorio de distribuciones en formato GGUF publicado por Naotaka0127 (Naotaka / Radon) para la aplicación web https://mobile.kyalulu.com. No se trata de un modelo entrenado desde cero, sino de un empaquetado de tres variantes cuantizadas procedentes de la familia Gemma "E2B": la versión oficial de Google con cuantización QAT (Q4_0), una variante "heretic" sin cuantizar de mradermacher y un fine-tune orientado a roleplay en japonés del propio autor (Kyalulu E2B JP Rolepaly beta). El repositorio contiene 4.628.569.635 parámetros totales según los safetensors de origen y ocupa 5,7 GB.

El problema que resuelve es de despliegue, no de modelado: los ficheros GGUF se han dividido en shards de menos de 2 GiB con llama.cpp b10964 (`--split-max-size 512M`) para que puedan cargarse en entornos móviles y en navegador mediante wllama, sin subdividir tensores individuales y preservando íntegramente las tablas PLE (per-layer embeddings) y la configuración de cuantización original. Cada carpeta incluye un `provenance.json` con la revisión exacta de origen, el SHA-256 del origen, los hashes de cada shard y el nombre, forma, tipo y SHA-256 de cada tensor.

Su relevancia es acotada pero concreta: ofrece una cadena de custodia verificable tensor a tensor para ejecutar un modelo de ~4,6 B de parámetros en local, algo poco habitual en distribuciones GGUF genéricas. Ahora bien, el propio autor advierte de que el repositorio no constituye prueba de validación en dispositivo: compatibilidad con móvil y navegador, velocidad, calidad y uso de memoria por debajo de 1 GB no están establecidos por esta distribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Los artefactos derivan de la familia Gemma E2B y preservan las tablas PLE (per-layer embeddings) del modelo base; no se documenta el tipo de transformer ni si existe activación condicional de parámetros |
| Parámetros totales | 4.628.569.635 (4,63 B), dato real de safetensors del repositorio |
| Parámetros activos | No disponible (no se documenta activación dispersa tipo MoE ni MatFormer) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ3_M (carpetas `kyalulu-iq3m` y `heretic-iq3m`) y Q4_0 (carpeta `google-q4`); GGUF dividido en shards de menos de 2 GiB |
| Idiomas soportados | No disponible. La variante Kyalulu se etiqueta como "JP Rolepaly", lo que sugiere foco en japonés, sin confirmación en la información disponible |
| Licencia | Apache-2.0 (declarada por las tres fuentes) |
| Formato de pesos | GGUF dividido en ficheros; split realizado con llama.cpp b10964 y `--split-max-size 512M` |
| Tamaño del repositorio | 5,7 GB (tres variantes con sus shards) |
| Etiquetas del modelo | gguf, text-generation, conversational, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-22 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El modelo base citado es `google/gemma-4-E2B-it-qat-q4_0-gguf`, una variante con cuantización consciente del entrenamiento (QAT) a Q4_0, complementado con `mradermacher/gemma-4-E2B-it-qat-q4_0-unquantized-heretic` y con el fine-tune `Naotaka0127/Kyalulu-E2B-JP-Rolepaly-beta-GGUF`. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias en ninguna de las etapas.

La innovación técnica declarada es puramente de empaquetado y trazabilidad. El split se hizo con llama.cpp b10964 sin eliminar ni modificar tensores, tablas PLE o ajustes de cuantización; los inventarios de tensores se compararon antes de la publicación y cada shard se verificó como inferior a 2 GiB. Cada carpeta incorpora `provenance.json` con la revisión exacta del origen, el SHA-256 del fichero fuente, los hashes de los shards y el SHA-256 de cada tensor individual, lo que permite auditar que la redistribución es bit a bit fiel respecto al origen. No se documenta ninguna técnica de inferencia adicional (decodificación especulativa, atención lineal, decodificación multi-token) en la información disponible.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman el uso previsto de diálogo multi-turno.
- Roleplay y personajes: la variante Kyalulu proviene de un fine-tune etiquetado explícitamente como "JP Rolepaly" (beta), orientado a interpretación de personajes.
- Ejecución local en navegador y dispositivos móviles: el empaquetado en shards de menos de 2 GiB está diseñado para cargarse con wllama (WASM) y llama.cpp en la aplicación mobile.kyalulu.com.
- Comparación de cuantizaciones: al incluir IQ3_M y Q4_0 del mismo linaje en un único repositorio, permite evaluar la degradación de calidad entre ambas en igualdad de condiciones.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el artefacto puede servirse a través de infraestructura de inferencia compatible.
- Tool calling / function calling: no documentado en la información disponible.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multimodales (visión, audio): no documentadas.
- Modo "thinking" o razonamiento explícito: no documentado.

## Casos de uso

- Roleplay conversacional en japonés dentro de una app móvil: la variante `kyalulu-iq3m` deriva de un fine-tune específico de roleplay y se distribuye troceada para carga en dispositivos con memoria limitada, lo que permite mantener conversaciones de personaje sin conexión ni backend.
- Asistente embebido en navegador sin servidor: los shards encajan en la carga progresiva que hace wllama sobre WASM, de modo que la inferencia ocurre en el cliente y no se envía el histórico de conversación a ninguna API externa.
- Prototipado en hardware sin GPU: con ~4,6 B de parámetros y cuantización IQ3_M, el modelo es ejecutable en CPU, lo que sirve para validar flujos de chat antes de invertir en infraestructura.
- Evaluación comparada de cuantizaciones: al disponer de IQ3_M y Q4_0 del mismo linaje con hashes por tensor, un equipo puede medir la pérdida de calidad y el ahorro de memoria de IQ3_M frente a Q4_0 sobre el mismo prompt set y el mismo dispositivo.
- Auditoría y cadena de custodia de artefactos: los ficheros `provenance.json` con SHA-256 por tensor permiten verificar en un pipeline interno que el GGUF desplegado corresponde exactamente al origen declarado, algo útil en entornos con requisitos de trazabilidad.
- Distribución de una app de entretenimiento con licencia permisiva: Apache-2.0 en los pesos facilita la integración comercial, siempre que se conserven los avisos de las fuentes y se respete que la aplicación web es AGPL-3.0-only.
- Investigación sobre degradación en cuantizaciones agresivas: la variante IQ3_M se declara experimental y orientada a capacidad, lo que la convierte en un punto de medida para estudiar el suelo de calidad de modelos de ~4,6 B en 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y el autor declara explícitamente que la calidad, la velocidad y el uso de memoria inferior a 1 GB "no están establecidos por esta distribución".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (estimación a partir de 4,63 B de parámetros, no confirmada por el autor): IQ3_M ≈ 2,0-2,3 GB de pesos; Q4_0 ≈ 2,6-2,9 GB de pesos. Hay que sumar la caché KV del contexto, cuyo tamaño no se puede calcular al no publicarse la longitud de contexto.
- Advertencia del autor: el tamaño de fichero no es una medida de la RAM residente. Las tablas PLE y las estructuras auxiliares pueden elevar el consumo por encima del tamaño del GGUF.
- GPU recomendadas: no hay datos publicados. Por tamaño, cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4060 Ti) aloja con holgura cualquiera de las dos cuantizaciones; A100/H100 no aportan ventaja para este tamaño y no se documenta soporte.
- Cabe en GPU de consumo: sí, en el rango indicado. En móviles de gama alta con 6-8 GB de RAM es plausible pero no está validado.
- Opciones de despliegue: llama.cpp (versión de referencia del split, b10964), wllama para WASM/navegador, llama-cpp-python, y previsiblemente Ollama o LM Studio previa importación de los shards. vLLM no es una opción natura para GGUF dividido y no se documenta.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de carga para ningún dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Naotaka0127/Kyalulu-Mobile-GGUF | 4,63 B | No disponible | IQ3_M y Q4_0 | Apache-2.0 | Split en shards < 2 GiB con verificación SHA-256 por tensor; 0 descargas, 0 likes |
| google/gemma-4-E2B-it-qat-q4_0-gguf | 4,63 B (mismo linaje) | No disponible | Q4_0 con QAT | Apache-2.0 | Fuente oficial de la variante `google-q4`; cuantización consciente del entrenamiento |
| mradermacher/gemma-4-E2B-it-qat-q4_0-unquantized-heretic (i1-GGUF) | 4,63 B (mismo linaje) | No disponible | IQ3_M entre otras | Apache-2.0 | Variante "heretic" sin cuantizar como origen; comportamiento alineado no documentado |
| Naotaka0127/Kyalulu-E2B-JP-Rolepaly-beta-GGUF | 4,63 B (mismo linaje) | No disponible | GGUF (beta) | Apache-2.0 | Fine-tune de roleplay en japonés, declarado experimental por el autor |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K) para ninguno de los cuatro artefactos, por lo que la comparación se limita a linaje, cuantización, licencia y formato de distribución.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes en el momento de la ficha, sin informes de terceros sobre calidad o estabilidad.
- Sin benchmarks publicados: no es posible estimar la calidad del modelo frente a alternativas de su tamaño con datos objetivos.
- La variante IQ3_M de Kyalulu se declara experimental y orientada a capacidad; el autor remite a la model card original para sus limitaciones de calidad, que no se detallan aquí.
- Compatibilidad con móvil y navegador, velocidad y consumo de memoria inferior a 1 GB no están establecidos por esta distribución; el propio autor lo indica de forma explícita.
- El tamaño de fichero no equivale a RAM residente: las tablas PLE y la caché KV pueden incrementar el consumo real de forma significativa.
- Debe descargarse una sola variante. Mezclar shards de carpetas distintas rompe la verificación de hashes y produce cargas inválidas.
- Idiomas soportados no documentados; el enfoque en japonés de la variante Kyalulu es una inferencia a partir del nombre, no un dato confirmado. El rendimiento en castellano es desconocido.
- Longitud de contexto no publicada, lo que impide dimensionar la caché KV y planificar conversaciones largas.
- La variante `heretic-iq3m` deriva de un modelo etiquetado como "heretic"; este tipo de derivados suele modificar o eliminar comportamientos de rechazo, pero no se documenta el alcance de esos cambios ni se ofrecen evaluaciones de seguridad.
- Riesgo de alucinación inherente a un modelo base de ~4,6 B y a cuantizaciones de 3-4 bits; no cuantificado en la información disponible.
- Licencia: los pesos se declaran Apache-2.0 en las tres fuentes y deben conservarse sus avisos. La aplicación web es AGPL-3.0-only y wllama/llama.cpp son MIT; integrar el modelo en un producto propio exige revisar ambas capas por separado.
- El repositorio contiene distribuciones de modelo, no una validación de la aplicación ni del dispositivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Naotaka0127/Kyalulu-Mobile-GGUF
- Perfil del autor: https://huggingface.co/Naotaka0127
- Modelo base oficial (Google, QAT Q4_0): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Variante heretic sin cuantizar (mradermacher): https://huggingface.co/mradermacher/gemma-4-E2B-it-qat-q4_0-unquantized-heretic-i1-GGUF
- Fine-tune Kyalulu JP Roleplay beta: https://huggingface.co/Naotaka0127/Kyalulu-E2B-JP-Rolepaly-beta-GGUF
- Aplicación móvil referenciada por el autor: https://mobile.kyalulu.com
- Dataset del autor (referencia en el perfil): https://huggingface.co/Naotaka0127/Kyalulu-Synthetic-SFW-AIO-beta
