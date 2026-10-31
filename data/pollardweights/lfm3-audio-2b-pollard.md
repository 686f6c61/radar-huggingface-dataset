# PollardWeights/LFM3-Audio-2B-Pollard

## Resumen

LFM3-Audio-2B-Pollard es una versión cuantizada, en formato GGUF, del modelo de audio-any-to-any LFM3-Audio-2B desarrollado por LiquidAI. La cuantización ha sido realizada por PollardWeights mediante su herramienta Pollard Weights, que aplica una estrategia de "measured allocation": los bits se distribuyen según la sensibilidad de cada capa en lugar de una reducción de precisión uniforme. El resultado es una escalera de cuants (Q6_K, IQ4_XS, IQ3_S) que reduce el modelo de 3,96 GB en f16 hasta 0,86 GB, un 78 % menos, manteniendo métricas de fidelidad medidas (perplejidad, KLD medio y concordancia top-1 frente al f16).

El problema que resuelve es doble: por un lado, hace ejecutable un modelo multimodal de audio y texto (~2.000 millones de parámetros) en hardware modesto, con requisitos de RAM/VRAM a partir de unos 2,9 GB; por otro, conserva la capacidad de tool calling del modelo original, verificada con sondas automatizadas. Es relevante porque los modelos de audio compactos para inferencia local son todavía escasos, y esta ficha de cuants permite elegir el peldaño adecuado según el presupuesto de memoria.

La arquitectura base es `lfm3_audio`, con soporte de entrada de texto y audio, y los archivos son GGUF estándar compatibles con llama.cpp, ik_llama.cpp, Ollama, LM Studio, koboldcpp, Jan y ramalama sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm3_audio` (transformer multimodal any-to-any, texto y audio) |
| Parametros totales | 1.728.801.600 (según safetensors del original); ~2,0B según la model card |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, IQ4_XS, IQ3_S (PollardMix, con imatrix); también disponibles Q8_0 y Q4_K_M referenciados |
| Idiomas soportados | inglés (en) |
| Licencia | other (heredada de LiquidAI/LFM3-Audio-2B; términos exactos no disponibles en la model card) |
| Formato de pesos | GGUF (cuantizado a partir de los pesos originales de LiquidAI) |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-Audio-2B, pertenece a la familia LFM (Liquid Foundation Models) de LiquidAI y emplea la arquitectura `lfm3_audio`, un modelo any-to-any que acepta texto y audio como entrada. Los detalles internos (número de capas, dimensiones, codificador de audio utilizado) no están disponibles en la información proporcionada. Tampoco se dispone de datos sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset o uso de RLHF/DPO.

Lo que sí está documentado es el proceso de cuantización de PollardWeights. Se ha utilizado una matriz de importancia (imatrix) con calibración, y la asignación de bits es por capa según su sensibilidad ("measured allocation"), en lugar de una cuantización uniforme. Cada peldaño de la escalera se ha verificado con `pollard-verify --gate`, que comprueba que el archivo contiene el modelo completo (todas las torres, proyectores y archivos del procesador del original), que carga correctamente y que supera controles de coherencia y ejecución. Además, se han medido perplejidad, KLD medio y concordancia top-1 frente al f16 para cada cuant.

## Capacidades

- Entrada multimodal de texto y audio (pipeline any-to-any); el modelo base es conversacional.
- Generación de texto conversacional a partir de instrucciones en texto.
- Comprensión de audio como modalidad de entrada.
- Tool calling / function calling: la plantilla de chat emplea la sintaxis `qwen3_coder` y las llamadas se parsean con `llama-server --jinja` pasando `tools` en `/v1/chat/completions`. Verificado con 60 sondas de herramientas (llamada simple, elección entre ocho herramientas, casos sin llamada y argumentos anidados).
- Compatibilidad con harnesses de agentes que hablen las API de OpenAI, Anthropic o Responses a través de llama-server.
- Ejecución 100 % local en hardware de consumo gracias a los cuants ligeros.

## Casos de uso

- Asistentes de voz locales: al aceptar audio como entrada y caber en ~3 GB de RAM/VRAM, permite construir asistentes conversacionales que escuchan al usuario y responden sin enviar datos a la nube, adecuado para escenarios con requisitos de privacidad.
- Transcripción y comprensión de audio en el borde: integrable en aplicaciones que procesan notas de voz o clips cortos en dispositivos con GPU modesta o incluso solo CPU, usando los cuants IQ3_S o IQ4_XS.
- Agentes con herramientas activadas por voz: gracias al tool calling verificado (retención del 100 % en Q6_K respecto al f16), puede encadenar llamadas a funciones (consultar tiempo, gestionar calendarios, controlar dispositivos) a partir de instrucciones habladas.
- Servidor de inferencia OpenAI-compatible en máquinas pequeñas: `llama-server` expone una API en el puerto 8080 que cualquier cliente estándar puede consumir, útil para prototipar aplicaciones multimodales sin una GPU de servidor.
- Integración en harnesses de agentes multi-step: compatible con las API de OpenAI, Anthropic y Responses, lo que permite usarlo como modelo de razonamiento y acción en pipelines de agentes ligeros.
- Pruebas y desarrollo de aplicaciones multimodales: el bajo tamaño (0,86 GB el peldaño menor) facilita la distribución del modelo junto con la aplicación o su descarga rápida en entornos de CI para tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de fidelidad de la cuantización frente al f16:

| Archivo | PPL | Tamaño | KLD medio | Concordancia top-1 | Retención tool calls |
|---|---:|---:|---:|---:|---:|
| IQ3_S | 3,2413 | 0,86 GB | 0,0748 | 89,74 % | 103,8 % |
| IQ4_XS | 3,1748 | 1,10 GB | 0,0144 | 95,22 % | 98,1 % |
| Q6_K | 3,153 | 1,43 GB | 0,0036 | 97,40 % | 100,0 % |

## Requisitos de hardware

- RAM/VRAM estimada según peldaño (con margen para contexto):
  - Q6_K (1,43 GB): ~3,4 GB de RAM/VRAM.
  - IQ4_XS (1,10 GB): ~3,1 GB de RAM/VRAM.
  - IQ3_S (0,86 GB): ~2,9 GB de RAM/VRAM.
- Cabe sobradamente en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060) ejecuta el peldaño recomendado Q6_K con descarga completa de capas (`-ngl 99`). También es viable en CPU pura dada la pequeña huella de memoria.
- No se requieren GPUs de centro de datos (A100/H100) para inferencia; el modelo está pensado para ejecución local.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), ik_llama.cpp, Ollama (`ollama run hf.co/PollardWeights/LFM3-Audio-2B-Pollard`), LM Studio, koboldcpp, Jan y ramalama. La herramienta `pollard serve` selecciona el runtime adecuado y dimensiona el contexto automáticamente.
- Para vLLM debe usarse el modelo original de LiquidAI con `--enable-auto-tool-choice --tool-call-parser qwen3_coder` (vLLM no consume estos GGUF).
- Latencia y throughput: no disponibles; al ser un modelo de ~2B con cuants de 0,86-1,43 GB, cabe esperar inferencia fluida en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Entrada | Tool calling | Tamaño (cuant ligero) | Licencia |
|---|---|---|---|---|---|---|
| LFM3-Audio-2B-Pollard (este) | ~2,0B | GGUF (Q6_K/IQ4_XS/IQ3_S) | texto + audio | sí (sintaxis qwen3_coder) | 0,86 GB | other |
| LiquidAI/LFM3-Audio-2B (original) | ~2,0B | safetensors (bf16) | texto + audio | sí | 3,96 GB (f16) | other |
| Qwen2-Audio-7B-Instruct | ~7B (no comparable en tamaño, sí en tarea) | safetensors | texto + audio | no disponible | no disponible | no disponible |

No hay suficientes datos publicados en la información disponible para comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés (en); el rendimiento en castellano u otras lenguas no está documentado.
- El peldaño IQ3_S muestra una concordancia top-1 del 89,74 % frente al f16 y un KLD medio notablemente mayor (0,0748 frente a 0,0036 de Q6_K), por lo que la degradación respecto al original es apreciable; para producción se recomienda Q6_K.
- Riesgo de alucinación: no hay datos específicos publicados; al tratarse de un modelo de ~2B, debe asumirse un riesgo moderado, especialmente en tareas de razonamiento complejo.
- Licencia "other": los términos exactos no constan en la model card de la cuantización; hay que revisar la licencia del modelo base LiquidAI/LFM3-Audio-2B antes de cualquier uso comercial.
- La longitud de contexto no está documentada en la información disponible; dimensionar el contexto con `pollard serve` o manualmente en llama.cpp.
- Los datos de retención y tool calling están medidos con el harness propio de Pollard Weights y no son comparables con cifras publicadas en otras suites de evaluación.
- En vLLM no se pueden usar estos GGUF: hay que servir los pesos originales de LiquidAI.

## Enlaces

- Modelo cuantizado (HuggingFace): https://huggingface.co/PollardWeights/LFM3-Audio-2B-Pollard
- Modelo base (HuggingFace): https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Pollard Weights (GitHub): https://github.com/WestWaters/pollard-weights
- pollard-toolcall (GitHub): https://github.com/WestWaters/pollard-weights
- pollard-modelkind (GitHub): https://github.com/WestWaters/pollard-weights
