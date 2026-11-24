# Bottega-Alu/Gemma-4-26B-A4B-it-Basalt

## Resumen

Gemma-4-26B-A4B-it-Basalt es un pack de cuantización NVFP4 del modelo Gemma 4 26B-A4B-it de Google DeepMind, preparado por Bottega Alu para el motor de inferencia Basalt. Se trata de un modelo de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y aproximadamente 4.000 millones activos por token, diseñado para ejecutarse en una única GPU Blackwell de 16 GB (sm_120), manteniendo en la tarjeta los expertos más solicitados y transmitiendo el resto desde RAM por PCIe.

El pack no modifica los pesos en cuanto a comportamiento: es una conversión de precisión con verificación por teacher forcing contra la referencia BF16, con una concordancia top-1 del 94-98,5 % según el tipo de texto. Incluye tokenizador y plantilla de chat propios de Gemma, verificados token a token, y soporte de tool calling y modo thinking a través de las APIs de OpenAI y Anthropic. Es un artefacto de despliegue, no un fine-tune: el modelo base sigue siendo el Gemma 4 de Google.

Su relevancia actual radica en que demuestra que un MoE de 26B puede servirse a velocidades de 113-133 tok/s de decodificación en una GPU de consumo de gama alta (RTX 5080), algo que con cuantizaciones convencionales requeriría hardware de centro de datos. La licencia Apache 2.0 del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), modelo base google/gemma-4-26B-A4B-it |
| Parametros totales | 26B |
| Parametros activos | ~4B por token |
| Longitud de contexto | 32.768 tokens (`--max-context 32768` en el ejemplo de despliegue) |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (escala tensorial por matriz, escalas UE4M3 por cada 16 valores); atención, MLP densa y embedding atado en Q8_0; tensores F32 tal cual |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | `.basalt` (pack propietario del motor Basalt), 14,45 GiB, SHA-256 `0aec10ccc421813534b08ed5dbf8f075c2ac79f15ac42e319d3ffc151532018d` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de Google DeepMind con 26B parámetros totales y unos 4B activos por token, lo que reduce el coste computacional por token frente a un denso equivalente. La conversión de Bottega Alu aplica NVFP4 a los expertos enrutados, redondeando una sola vez desde los pesos BF16 originales con escala tensorial por matriz y escalas UE4M3 por cada 16 valores minimizando el error cuadrático; la escala por experto del router se pliega de forma exacta en la proyección down. El resto de componentes (atención, MLP densa y embedding atado) se mantiene en Q8_0, y los tensores F32 se conservan sin tocar.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las fases de RLHF/DPO del modelo base en la información proporcionada. La innovación destacable del pack es de despliegue: los expertos más solicitados (86 de 128 por capa, 8,04 GiB) residen en la GPU y el resto se transmiten desde RAM por PCIe, con una tasa de acierto en decodificación del 97-99,8 %. La ruta de prompt usa atención con tensor cores fp16 por mosaicos y la decodificación se ejecuta bajo CUDA graphs. El pack es solo texto: la torre de visión no está incluida.

## Capacidades

- Generación de texto en conversación multi-turno y producción de prosa, con plantilla de chat propia de Gemma verificada token a token.
- Razonamiento y resolución de tareas de código: en un conjunto interno de 12 tareas Python resolvió 10/12 en 85 s, sin fase de razonamiento larga.
- Tool calling / function calling, soportado a través de las APIs compatibles de OpenAI y Anthropic.
- Modo thinking activable o desactivable por API.
- Salida estructurada (fixture de structured output con 98,5 % de concordancia top-1 frente a la referencia BF16).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no incluida en este pack (la torre de visión se omite).
- Audio: no disponible.

## Casos de uso

- Asistente conversacional en local: con 32.768 tokens de contexto y decodificación de 113-133 tok/s en una RTX 5080, puede mantener conversaciones multi-turno largas en una estación de trabajo sin depender de la nube.
- Generación de código en estación de desarrollo: resuelve tareas de especificación a implementación (parsers, estructuras de datos, algoritmos) en tiempos del orden de segundos por tarea, adecuado para asistentes de IDE o generación de borradores de funciones.
- Automatización con tool calling: integrable en pipelines que necesiten invocar funciones externas mediante la API compatible con OpenAI, por ejemplo orquestación de scripts o consultas a servicios internos.
- Procesamiento de documentos largos: prefill de unos 3.870 tok/s permite leer prompts de 12.700 tokens en 3,3 s, útil para resumen o extracción sobre contratos, informes o expedientes de tamaño medio.
- Prototipado de agentes multi-paso: el modo thinking configurable permite alternar entre respuestas rápidas y razonamiento extendido según la etapa del agente, con la ventaja de velocidad del modelo en tareas sin razonamiento largo.
- Despliegue en hardware de consumo para investigación: servir un MoE de 26B en una GPU Blackwell de 16 GB facilita experimentación académica y pruebas de evaluación sin acceso a clústeres.
- Generación de salida estructurada (JSON, formularios): la alta concordancia en el fixture de structured output lo hace apto para extracción de campos y generación de respuestas con esquema fijo.

## Benchmarks y rendimiento

Calidad (teacher forcing contra la referencia BF16 en transformers):

| Fixture | Posiciones | Concordancia top-1 | Token de referencia en top-5 |
|---|---|---|---|
| Conversación | 100 | 96,0 % | 100 % |
| Estructurado | 65 | 98,5 % | 100 % |
| Prosa | 84 | 94,0 % | 100 % |

Velocidad en RTX 5080 16 GB (límite de potencia 360 W), Ryzen 9 9950X3D, 4x32 GB DDR5 a 3600 MT/s, Windows 11, driver 610.88, API OpenAI, modelo en frío, decodificación greedy:

| Métrica | Valor |
|---|---|
| Decodificación, 400 tokens | 113-118 tok/s |
| Decodificación, respuestas cortas | 120-133 tok/s |
| Prefill, prompt de 12,7k tokens | ~3.870 tok/s (3,3 s) |
| Expertos en GPU | 86 de 128 por capa (8,04 GiB); acierto en decodificación 97-99,8 % |

Conjunto interno de código (12 tareas Python, temperatura 0, mismas condiciones de hardware):

| Modelo (pack Basalt) | Resueltas | Tiempo total |
|---|---|---|
| Gemma 4 26B-A4B-it (este pack) | 10 / 12 | 85 s |
| Qwen3.8-Flash-Next NVFP4-DQ6_K | 12 / 12 | 1.101 s |
| Qwen3.8-Flash-Next UD-IQ3_XXS | 12 / 12 | 703 s |
| Inkling 2 Mini NVFP4-MX8 | 10 / 12 | 796 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el pack ocupa 14,45 GiB en disco; en ejecución, 8,04 GiB corresponden a los expertos residentes en GPU, más atención, MLP densa, embedding y caché KV. Cabe en una GPU de 16 GB.
- GPU recomendadas: una Blackwell de 16 GB (sm_120), como la RTX 5080 empleada en las pruebas. El formato NVFP4 está orientado a esta generación; no se indica compatibilidad con Ampere, Ada ni Hopper.
- GPU de consumo: sí, en RTX 5080 16 GB. No hay datos de otras consumer GPU.
- Memoria del sistema: el resto de expertos se transmite desde RAM por PCIe, por lo que se requiere RAM suficiente para alojar los pesos no residentes (la máquina de pruebas usaba 128 GB DDR5).
- Despliegue: exclusivamente mediante el motor Basalt. El soporte de Gemma 4 está en la rama `gemma4` de Bottega-Alu/basalt-frisco-lab mientras el pull request upstream está pendiente. Comando: `basalt serve --model Gemma-4-26B-A4B-it-NVFP4.basalt --max-context 32768`.
- Latencia y throughput: 113-133 tok/s de decodificación y ~3.870 tok/s de prefill en la configuración indicada; no hay datos para otro hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas de código (resueltas/tiempo) | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (este pack) | 26B totales, ~4B activos | 32.768 | 10/12 en 85 s | Apache 2.0 | `.basalt` NVFP4 |
| Qwen3.8-Flash-Next NVFP4-DQ6_K | no disponible | no disponible | 12/12 en 1.101 s | no disponible | Basalt NVFP4-DQ6_K |
| Qwen3.8-Flash-Next UD-IQ3_XXS | no disponible | no disponible | 12/12 en 703 s | no disponible | Basalt UD-IQ3_XXS |
| Inkling 2 Mini NVFP4-MX8 | no disponible | no disponible | 10/12 en 796 s | no disponible | Basalt NVFP4-MX8 |

La comparativa se limita al conjunto interno de código del autor; no hay datos de benchmarks estándar ni de contexto para los modelos alternativos en la información disponible. La ventaja de este pack es la velocidad (un orden de magnitud menor tiempo total), a costa de resolver 2 de 12 tareas menos que Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- Es una conversión de cuantización, no un fine-tune: hereda los sesgos y limitaciones del Gemma 4 base, sobre los que no hay información en la documentación disponible.
- Riesgo de alucinación inherente al modelo base; la cuantización NVFP4 introduce además una divergencia del 1,5-6 % en top-1 respecto a BF16 según el tipo de texto.
- Solo texto: la torre de visión está excluida del pack, por lo que no admite entradas de imagen.
- Idiomas soportados no documentados en la información disponible.
- El contexto está limitado a 32.768 tokens en el ejemplo de despliegue; no se indica si el modelo base soporta ventanas mayores.
- Dependencia de un motor específico (Basalt) y de una rama no fusionada (`gemma4` de basalt-frisco-lab): el soporte upstream está pendiente, lo que implica riesgo de mantenimiento y de cambios de API.
- Requiere GPU Blackwell (sm_120) por el formato NVFP4; no hay confirmación de funcionamiento en generaciones anteriores.
- El rendimiento depende del ancho de banda PCIe y de la RAM del sistema, ya que los expertos no residentes se transmiten en cada token.
- Licencia Apache 2.0, pero con enlace a la licencia específica de Gemma 4 de Google: conviene revisar los términos de uso comercial de dicha licencia antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la validación se limita a tres fixtures y un conjunto interno de 12 tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bottega-Alu/Gemma-4-26B-A4B-it-Basalt
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Motor Basalt: https://github.com/jesdga95/basalt
- Rama con soporte Gemma 4: https://github.com/Bottega-Alu/basalt-frisco-lab/tree/gemma4
- Autor de la conversión: https://github.com/Bottega-Alu
- Google DeepMind Gemma: https://deepmind.google/models/gemma/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
