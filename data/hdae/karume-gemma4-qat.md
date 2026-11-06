# hdae/karume-gemma4-qat

## Resumen

Karume-gemma4-qat es una conversión experimental de los checkpoints QAT (quantization-aware training) móviles de Gemma 4 publicados por Google DeepMind, empaquetada en el formato de contenedor propietario Karume (`.krm`) por el autor independiente hdae. El repositorio contiene únicamente el decodificador de texto extraído de los modelos base `google/gemma-4-E2B-it-qat-mobile-transformers` y `google/gemma-4-E4B-it-qat-mobile-transformers`; las torres de visión y audio, así como el mecanismo MTP (multi-token prediction), no están incluidas.

La propuesta es poco habitual: en lugar de recuantizar, el autor preserva los enteros y escalas originales del QAT móvil de Google (mezcla de int2/int4/int8) y aplica cuantización estática de activaciones (SRQ). El resultado son artefactos de 1,91 GiB (E2B) y 2,85 GiB (E4B) pensados para ejecución en WebGPU, con tres variantes de quant según el orden de suma y el grado de fusión de operadores.

Su relevancia es doble: por un lado, permite ejecutar pesos oficiales de Gemma 4 cuantizados en navegador o en hardware modesto sin pasar por el ecosistema GGUF/llama.cpp; por otro, el propio autor advierte de que la validación de calidad y contexto largo está incompleta y de que las reducciones en CPU y GPU pueden cruzar umbrales de redondeo y producir tokens distintos. Es, por tanto, un artefacto para evaluación e investigación, no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4), solo texto; sin visión, audio ni MTP |
| Parámetros totales | no disponible (derivado de Gemma 4 E2B y E4B; el repositorio no publica el recuento) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (remite a la model card upstream de Gemma 4) |
| Tipos de cuantización | QAT fijo mixto int2/int4/int8 con SRQ; variantes `i4`, `i4-gemvpar`, `i4-fast` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según el commit de los checkpoints base); enlace adicional a la licencia de Gemma 4 |
| Formato de pesos | Contenedor Karume (`.krm`), dividido en partes numeradas con `sha256` en `karume.json` |
| Modelos incluidos | `e2b` (por defecto) y `e4b`, pipeline `gemma4-qat/1` |
| Tamaño de descarga | E2B: 1,91 GiB (1,14 GiB de assets leídos en host); E4B: 2,85 GiB (723 MiB de assets) |
| Librería / runtime | `karume` (WebGPU) |
| Tamaño del repositorio | 5,1 GB |

## Arquitectura y entrenamiento

El modelo es un decodificador transformer de Gemma 4 convertido desde los checkpoints móviles con QAT de Google DeepMind. No hay reentrenamiento ni fine-tuning: el autor extrae el decodificador de texto, lo reexpresa en el contenedor Karume y conserva sin recuantizar los enteros cuantizados fijos, sus escalas y los rangos estáticos de activación. Los embeddings por capa se sacan del grafo y se mueven a assets del contenedor que el host recolecta; la salida se restringe a los logits y estados ocultos de las filas seleccionadas, y los cos/sin de RoPE llegan como entradas generadas por el host.

La innovación técnica está en el plano de la inferencia, no del entrenamiento. Las tres variantes difieren en el orden de suma y en las fusiones de operadores: `i4` usa el orden de suma de referencia para GEMV y atención; `i4-gemvpar` paraleliza ambas reducciones; `i4-fast` (por defecto) añade atención paralela fusionada, fusión RMS-add y linear-SRQ, y activaciones int8 empaquetadas. El autor documenta una reducción del 42 % en tiempo de decodificación para E4B en una GPU B570 con `i4-fast`. Como contrapartida, las reducciones paralelas pueden cruzar límites de redondeo y generar tokens distintos a los de referencia.

## Capacidades

- Generación de texto en modo conversacional, heredada del checkpoint `-it` de Gemma 4.
- Razonamiento y respuesta a instrucciones, sujeto a la calidad del checkpoint QAT original.
- Ejecución en WebGPU, lo que habilita inferencia en navegador y en equipos sin stack CUDA.
- Tres perfiles de quant intercambiables (`i4`, `i4-gemvpar`, `i4-fast`) según se priorice fidelidad numérica o velocidad.
- Carga por partes con verificación `sha256` por archivo, adecuada para descargas incrementales.
- No incluye visión, audio ni multi-token prediction (MTP).
- No se documentan en este repositorio tool calling, function calling, modo thinking ni capacidades de agente; deben consultarse en las model cards upstream.

## Casos de uso

- Evaluación de Gemma 4 QAT en navegador: desplegar el contenedor `.krm` sobre WebGPU para medir latencia y calidad de los enteros oficiales de Google sin recuantizar, útil para equipos que validan si el QAT móvil es suficiente para su producto.
- Prototipado de asistentes de texto en el cliente: con 1,91 GiB para E2B, es viable cargar el modelo en una pestaña y ofrecer generación de texto sin enviar datos a un servidor, siempre que se acepte la falta de validación de calidad documentada.
- Investigación sobre fidelidad numérica: comparar `i4` (orden de suma de referencia) con `i4-gemvpar` e `i4-fast` para cuantificar cuántos tokens divergen por el redondeo en reducciones paralelas.
- Benchmarking de kernels WebGPU: usar las fusiones de `i4-fast` (RMS-add, linear-SRQ, activaciones int8 empaquetadas) como carga de trabajo reproducible para evaluar backends y drivers.
- Distribución de pesos en entornos con ancho de banda limitado: la división en partes numeradas con `sha256` por archivo permite descargas reanudables y verificación en el fetch layer.
- Docencia y demos de cuantización: ilustrar la diferencia entre QAT fijo, SRQ y recuantización posterior usando un checkpoint real de Google como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es una reducción del 42 % en tiempo de decodificación para E4B con `i4-fast` frente a la variante de referencia, medida en una GPU B570. No se han publicado cifras de MMLU, HumanEval, GSM8K ni de calidad de generación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de descarga es de 1,91 GiB (E2B) y 2,85 GiB (E4B), a los que hay que sumar los assets leídos en host (1,14 GiB y 723 MiB respectivamente) y el estado de inferencia.
- GPU recomendadas: no disponible. El autor cita una Intel B570 como banco de pruebas para la medición de `i4-fast`.
- GPU de consumo: el diseño WebGPU y los tamaños de 1,91-2,85 GiB sugieren viabilidad en GPUs integradas y de gama media con soporte WebGPU, pero no hay lista de compatibilidad publicada.
- Opciones de despliegue: exclusivamente el runtime `karume` con backend WebGPU. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato `.krm`.
- Latencia y throughput: solo el dato relativo de -42 % en decodificación para E4B con `i4-fast` en B570; no hay valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hdae/karume-gemma4-qat (E2B/E4B) | no disponible (E2B y E4B) | no disponible | Karume `.krm` | karume / WebGPU | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it-qat-mobile-transformers | E2B | no disponible | safetensors (Transformers) | Transformers | Apache 2.0 en el commit base | Hugging Face (oficial) |
| google/gemma-4-E4B-it-qat-mobile-transformers | E4B | no disponible | safetensors (Transformers) | Transformers | Apache 2.0 en el commit base | Hugging Face (oficial) |

La comparación relevante es contra los checkpoints upstream de los que deriva: mismos pesos cuantizados, pero distinto contenedor, distinto runtime y distinto conjunto de capacidades (el upstream conserva lo que el autor eliminó aquí). No se dispone de datos para comparar con alternativas de otros fabricantes en la misma franja de tamaño.

## Limitaciones y advertencias

- Conversión experimental: el autor declara explícitamente que la validación amplia de calidad y de contexto largo está incompleta.
- Divergencia numérica entre CPU y GPU: las reducciones pueden cruzar límites de redondeo y seleccionar tokens distintos; solo `i4` usa el orden de suma de referencia.
- `i4-fast` requiere soporte de opciones de fusión en el runtime; sin él, no es ejecutable.
- Sin visión, sin audio y sin MTP: no apto para tareas multimodales ni para decodificación especulativa multi-token.
- Sin datos publicados de sesgos, alucinación ni evaluación de seguridad en este repositorio; el autor remite a las model cards upstream, que deben leerse antes de usar el modelo.
- Idiomas soportados no documentados aquí.
- Licencia: Apache 2.0 según el commit de los checkpoints base, con enlace adicional a la licencia específica de Gemma 4; conviene verificar ambas antes de un uso comercial.
- No es una release oficial de Google ni está avalada por Google; el nombre Gemma se usa solo para describir el origen de los pesos.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- Dependencia de un runtime y formato propietarios (`.krm`), lo que limita la portabilidad frente a GGUF o safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hdae/karume-gemma4-qat
- Checkpoint base E2B: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Checkpoint base E4B: https://huggingface.co/google/gemma-4-E4B-it-qat-mobile-transformers
- Informe técnico de Gemma 4: https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
