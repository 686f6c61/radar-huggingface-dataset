# AXERA-TECH/MiniCPM5-2B-AX8860-llama.cpp

## Resumen

MiniCPM5-2B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo de lenguaje MiniCPM5-2B (desarrollado por OpenBMB) sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con kernels ggml-axera. No se trata de un modelo nuevo: el repositorio contiene los pesos oficiales en cuantización Q8_0 (GGUF de 2,68 GB), los binarios estáticos para el chip, dos kernels NPU (prefill y decode) y scripts de ejecución, benchmark y servidor compatible con la API de OpenAI.

El modelo base es un transformer denso de unos 2.516 millones de parámetros (2,5 B), orientado a texto, con soporte de modo de razonamiento conmutables (thinking switch) y tool calling a través de la plantilla de chat incluida. Su relevancia actual reside en que demuestra inferencia LLM práctica en hardware de borde: 59,5 tokens/s en decode y 6219 tokens/s en prefill de 4k sobre una NPU de consumo, con contexto declarado de hasta 131072 tokens.

La ficha se centra en lo que documenta el autor del paquete: rendimiento en placa, formato de pesos, requisitos de SDK y limitaciones operativas. Los datos de entrenamiento, composición del dataset y benchmarks académicos del modelo base no se detallan en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base MiniCPM5-2B); despliegue con llama.cpp + kernels ggml-axera para NPU AX8860 |
| Parametros totales | 2.516.756.480 (2,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 131072 tokens |
| Tipos de cuantizacion | Q8_0 (oficial, 2,68 GB) y F16; conversion en carga a MXFP8 con cache KV en BF16 |
| Idiomas soportados | no disponible (la model card muestra evaluacion de perplejidad en chino e ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0 y F16) + kernels NPU binarios + manifest.json |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repositorio | 2,8 GB |
| Hardware objetivo | Axera AX8860 (4 nucleos NPU), SDK V0.5.1 o superior |
| Servidor | API compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

El paquete no reentrena el modelo: distribuye los pesos de openbmb/MiniCPM5-2B en GGUF Q8_0 y los ejecuta sobre una bifurcación de llama.cpp (ZHEQIUSHUI/llama.cpp en el commit `1970d6c5d`) con dos kernels NPU específicos para el AX8860: uno de prefill y otro de decode que incluye la cabeza de salida. En tiempo de carga, los pesos GGUF se convierten a MXFP8 y la cache KV se mantiene en BF16. Un único conjunto de kernels cubre todo el rango de contexto hasta 131072 tokens, y la memoria KV se asigna según el parámetro `-c` (ajustable con la variable de entorno `CTX`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. Tampoco hay cabeza MTP, por lo que no se admite decodificación especulativa MTP. La innovación técnica destacable es la integración del grafo ggml con la NPU del AX8860, que permite ejecutar un LLM de 2,5 B íntegramente en el acelerador con latencias medidas en placa.

## Capacidades

- Generación de texto y finalización de texto (modo completion vía `run.sh`).
- Conversación multi-turno con plantilla de chat incluida (`chat_template.jinja`).
- Modo de razonamiento conmutable mediante `chat_template_kwargs.enable_thinking` (true/false) en la API.
- Tool calling / function calling soportado a través de la plantilla de chat del paquete.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`).
- Contexto largo de hasta 131072 tokens con un único conjunto de kernels.
- Capacidades multilingües: la model card solo aporta evidencias de chino e inglés; el resto no está documentado.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el paquete permite servir un chat compatible con OpenAI directamente sobre el AX8860, adecuado para electrodomésticos, kioscos o equipos industriales que requieren un LLM local sin dependencia de la nube.
- Procesamiento de documentos largos en placa: con contexto de hasta 131072 tokens, se pueden resumir o extraer información de contratos, manuales o informes sin trocear el texto, manteniendo la coherencia entre secciones.
- Automatización con tool calling en entornos aislados: la plantilla de chat permite definir funciones y que el modelo emita llamadas estructuradas, útil para orquestar acciones sobre sistemas locales (sensores, bases de datos, ficheros) sin exponer datos a terceros.
- Razonamiento conmutable por coste: el interruptor `enable_thinking` permite activar el modo de razonamiento solo en consultas complejas y desactivarlo en consultas triviales, reduciendo latencia y consumo en despliegues con restricciones energéticas.
- Prototipado rápido de aplicaciones LLM en hardware Axera: los scripts `run.sh` y `bench.sh` permiten validar latencia, throughput y perplejidad en la placa objetivo antes de comprometerse con un despliegue mayor.
- Evaluación comparativa de cuantizaciones: al cargar tanto Q8_0 como F16 con conversión a MXFP8, sirve para medir el impacto de la precisión en perplejidad (16,70 zh / 13,33 en con `-ub 1`) y en velocidad dentro de un pipeline de validación.

## Benchmarks y rendimiento

Rendimiento medido en placa AX8860 según la model card (50 tokens generados):

| Prompt | `-c` | Tiempo de prompt | Decode (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,04 s | 59,5 |
| 46 tokens | 8192 | 0,05 s | 59,2 |
| 3907 tokens | 8192 | 0,63 s | 51,9 |
| 5 tokens | 131072 | 0,04 s | 59,2 |
| 3907 tokens | 131072 | 0,63 s | 52,1 |

Resumen declarado: decode 59,5 tokens/s; prefill de 4k a 6219 tokens/s (3907 tokens en 0,63 s).

Perplejidad (`sh bench.sh ppl`, `-c 512`):

| Idioma | `-ub 1` | `-ub 4` |
|---|---:|---:|
| Chino | 16,70 | 16,72 |
| Inglés | 13,33 | 13,44 |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; no se ejecuta en GPU convencional con este paquete.
- NPU: el runtime ocupa los 4 núcleos de NPU en exclusiva; el servidor se lanza con `-np 1`.
- Memoria: pesos Q8_0 de 2,68 GB, convertidos a MXFP8 en carga; la cache KV en BF16 se asigna según `-c`, por lo que contextos de 131072 tokens incrementan notablemente el consumo de memoria frente a 8192.
- Despliegue: scripts `run.sh` (completion, chat interactivo y servidor) y `bench.sh` (rendimiento y perplejidad); requiere terminal real para el modo chat (`run.sh -c`).
- Compatibilidad de pesos: se cargan GGUF Q8_0 y F16.
- Throughput: 59,5 tokens/s en decode y 6219 tokens/s en prefill de 4k; latencia de prefill de 0,63 s para 3907 tokens.
- No aplica despliegue con vLLM, TGI u Ollama en este paquete; el runtime es la bifurcación de llama.cpp incluida en `bin/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-AX8860-llama.cpp | 2,5 B | 131072 | no disponible | NPU AX8860 (llama.cpp + ggml-axera) | Paquete de despliegue con kernels NPU; 59,5 tok/s decode |
| openbmb/MiniCPM5-2B | 2,5 B | no disponible en esta ficha | no disponible | GPU/CPU con llama.cpp, transformers, etc. | Modelo base original; el paquete AX8860 no documenta cambios de pesos |
| Alternativas de ~2-3 B en GGUF | no disponible | no disponible | no disponible | llama.cpp en CPU/GPU | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento relativo.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en Axera AX8860 con SDK V0.5.1 o superior; no es portable a GPU de consumo ni a otros aceleradores sin recompilar kernels.
- Exclusividad de NPU: el runtime monopoliza los 4 núcleos, lo que impide coejecutar otras cargas de NPU en el mismo dispositivo.
- Sin decodificación especulativa MTP: no hay cabeza MTP, por lo que no se puede acelerar la generación con ese método.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; es imprescindible verificar la licencia del modelo base openbmb/MiniCPM5-2B antes de producción.
- Idiomas: solo hay evidencias de chino e inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación: inherente a un modelo de 2,5 B; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos: no se documentan evaluaciones de sesgo para el modelo base ni para el paquete.
- Perplejidad moderada-alta en chino (16,70) frente a inglés (13,33), lo que sugiere mayor incertidumbre en la generación en chino con esta cuantización.
- Contexto largo: aunque el kernel cubre 131072 tokens, la cache KV en BF16 a esa longitud consume memoria considerable; conviene dimensionar `-c` y `CTX` según el presupuesto del dispositivo.
- Madurez: primera release (2026-11-15), 0 descargas y 0 likes en el momento de la consulta; sin historial de estabilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/MiniCPM5-2B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Bifurcación de llama.cpp usada: https://github.com/ZHEQIUSHUI/llama.cpp (commit `1970d6c5d`)
