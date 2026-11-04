# hdae/karume-gemma4-qat-mobile

## Resumen

Karume Gemma 4 Mobile QAT Text Decoder es una conversión experimental, solo texto, de los checkpoints móviles oficiales de Gemma 4 publicados por Google DeepMind. El autor del repositorio (hdae) extrae el decodificador de texto de los modelos `gemma-4-E2B-it-qat-mobile-transformers` y `gemma-4-E4B-it-qat-mobile-transformers` y lo reexpresa en el formato de contenedor Karume (`.krm`), orientado a ejecución en WebGPU y en dispositivos con recursos limitados.

El modelo conserva sin recuantizar los enteros y escalas del QAT móvil original (mezcla fija de int2/int4/int8) y aplica cuantización estática de rangos de activación (SRQ). Se distribuyen dos variantes de tamaño: `e2b` (1,91 GiB de descarga, 1,14 GiB de assets leídos en el host) y `e4b` (2,85 GiB de descarga, 723 MiB de assets). Cada variante ofrece tres modos de cómputo: `i4` (orden de suma de referencia), `i4-gemvpar` (GEMV y atención en paralelo) e `i4-fast` (paralelo con fusiones, opción por defecto).

La relevancia de esta ficha es doble: por un lado, documenta una vía poco habitual de despliegue de Gemma 4 en navegador y hardware móvil; por otro, advierte de que se trata de una conversión experimental sin validación amplia de calidad ni de contexto largo, y sin soporte de visión, audio ni MTP (multi-token prediction). No hay reentrenamiento ni ajuste fino: los pesos son los del QAT oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4), solo texto; decodificador extraído y reexpresado en contenedor Karume |
| Parametros totales | No disponible (variantes `e2b` y `e4b` del modelo base Gemma 4) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mezcla fija int2/int4/int8 del QAT móvil oficial, con escalas preservadas y SRQ (cuantización estática de activaciones); modos `i4`, `i4-gemvpar`, `i4-fast` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según los commits indicados de los checkpoints base) |
| Formato de pesos | Contenedores Karume (`.krm`), divididos en partes numeradas; no se distribuyen los checkpoints originales |
| Tamano del repo | 5,1 GB |
| Variantes | `e2b` (por defecto) y `e4b` |
| Descarga por variante | `e2b`: 1,91 GiB (1,14 GiB de assets en host); `e4b`: 2,85 GiB (723 MiB de assets en host) |
| Runtime | Librería `karume`, orientada a WebGPU |
| Modelo base | google/gemma-4-E2B-it, google/gemma-4-E2B-it-qat-mobile-transformers, google/gemma-4-E4B-it, google/gemma-4-E4B-it-qat-mobile-transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 en su variante de decodificador de texto, según el informe técnico de Google DeepMind (arXiv:2607.02770). El repositorio no entrena ni ajusta el modelo: parte de los checkpoints QAT móviles oficiales y realiza una conversión de formato. Los cambios declarados incluyen la extracción del decodificador de texto y su reexpresión en el contenedor Karume, la conservación sin recuantización de los enteros cuantizados fijos, sus escalas y los rangos estáticos de activación, la salida de las embeddings por capa del grafo hacia assets que recoge el host, la restricción de la salida a los logits y estados ocultos de las filas seleccionadas, y la recepción de cos/sin rotatorios como entradas generadas por el host.

La cuantización es el elemento técnico central: el modelo usa los enteros mixtos int2/int4/int8 del QAT móvil oficial y aplica SRQ sobre las activaciones. Los tres modos de cómputo difieren en el orden de suma y en las fusiones: `i4` mantiene el orden de suma de referencia; `i4-gemvpar` paraleliza GEMV y atención; `i4-fast` añade fusión de RMS-add, fusión de SRQ lineal, fusión de GELU-mul con cuantización estática y activaciones int8 empaquetadas. El autor advierte de que las reducciones en CPU y GPU pueden cruzar fronteras de redondeo y seleccionar tokens distintos, por lo que los resultados no son bit a bit idénticos entre modos.

## Capacidades

- Generación de texto: es la única modalidad incluida; visión, audio y MTP no están soportados en esta conversión.
- Razonamiento y conversación multi-turno: hereda las capacidades del checkpoint instruct de Gemma 4, aunque el repositorio no las revalida.
- Tool calling y function calling: no documentado en esta conversión; debe consultarse la model card upstream.
- Agentes y razonamiento multi-paso: no documentado en esta conversión.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Ejecución en WebGPU: el runtime Karume está orientado a este backend, lo que permite inferencia en navegador y dispositivos móviles.
- Selección de variante y cuantización en tiempo de carga mediante los parámetros `model` y `quant`.
- Sin modo thinking, visión ni audio en esta conversión.

## Casos de uso

- Inferencia en navegador con WebGPU: el formato `.krm` y el runtime Karume permiten cargar el modelo en una pestaña del navegador y generar texto sin backend propio, adecuado para demos y prototipos de asistentes locales.
- Aplicaciones móviles offline: la variante `e2b` con 1,91 GiB de descarga y 1,14 GiB de assets encaja en dispositivos con almacenamiento y memoria limitados, útil para asistentes de texto sin conexión.
- Procesamiento de texto en el borde (edge computing): al no requerir GPU de servidor, puede desplegarse en equipos con GPU integrada para tareas de resumen o clasificación de texto.
- Evaluación de cuantización QAT: los tres modos (`i4`, `i4-gemvpar`, `i4-fast`) permiten comparar el efecto del orden de suma y las fusiones sobre los tokens generados en un mismo hardware.
- Prototipado de interfaces conversacionales: integración en aplicaciones web que necesiten generación de texto sin enviar datos a un servidor, con la advertencia de que la calidad no está validada ampliamente.
- Investigación sobre despliegue de modelos cuantizados: sirve como banco de pruebas para estudiar diferencias de redondeo entre CPU y GPU y entre modos de reducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la validación amplia de calidad y de contexto largo sigue incompleta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la descarga de `e2b` es de 1,91 GiB y la de `e4b` de 2,85 GiB, más los assets leídos en el host (1,14 GiB y 723 MiB respectivamente).
- GPU recomendadas: no disponible; el runtime está orientado a WebGPU, por lo que se espera ejecución en GPU integradas y discretas compatibles con ese backend.
- GPU de consumo: no confirmado; el tamaño de descarga sugiere que `e2b` podría caber en equipos con memoria unificada o VRAM moderada, pero no hay cifras oficiales.
- Opciones de despliegue: runtime Karume con backend WebGPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Karume Gemma 4 Mobile QAT (este) | No disponible (`e2b`/`e4b`) | No disponible | int2/int4/int8 QAT + SRQ | Apache 2.0 | Karume `.krm` |
| google/gemma-4-E2B-it-qat-mobile-transformers | No disponible | No disponible | QAT móvil oficial | Apache 2.0 (según commit) | Transformers |
| google/gemma-4-E4B-it-qat-mobile-transformers | No disponible | No disponible | QAT móvil oficial | Apache 2.0 (según commit) | Transformers |
| google/gemma-4-E2B-it | No disponible | No disponible | Pesos completos | Apache 2.0 (según commit) | Safetensors (probable, no confirmado) |

La comparativa se limita a los checkpoints de los que deriva, ya que no se han proporcionado datos de rendimiento ni de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Conversión experimental: el autor declara que la validación amplia de calidad y de contexto largo está incompleta.
- Diferencias de tokens entre CPU y GPU y entre modos de reducción por cruce de fronteras de redondeo; `i4` es el modo de referencia.
- Sin soporte de visión, audio ni MTP en esta conversión.
- El tokenizador procede del modelo base (con las correcciones de tokens defectuosos de Google del 2026-11-03), no del repositorio móvil, que no las ha recibido.
- No se distribuyen los checkpoints originales; los pesos se sirven como contenedores `.krm` divididos en partes, con verificación de `sha256` en `karume.json`.
- Sesgos y riesgo de alucinación: no documentados en este repositorio; deben consultarse las model cards upstream.
- Idiomas soportados: no disponibles en la información del repositorio.
- Licencia Apache 2.0 según los commits indicados, con enlace a la licencia de Gemma 4 de Google; conviene verificar los términos completos antes de uso comercial.
- El modelo requiere un runtime con soporte de las opciones de fusión para el modo `i4-fast` (por defecto).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hdae/karume-gemma4-qat-mobile
- Modelo base E2B: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint QAT móvil E2B: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Modelo base E4B: https://huggingface.co/google/gemma-4-E4B-it
- Checkpoint QAT móvil E4B: https://huggingface.co/google/gemma-4-E4B-it-qat-mobile-transformers
- Informe técnico de Gemma 4: https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Texto completo de Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
