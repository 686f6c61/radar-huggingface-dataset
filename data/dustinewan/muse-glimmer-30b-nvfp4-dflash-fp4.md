# DustinEwan/muse-glimmer-30b-nvfp4-dflash-fp4

## Resumen

Muse-Glimmer-30B NVFP4 + DFlash FP4 es un contenedor de inferencia en formato `.rad` para el motor radiance, construido por DustinEwan a partir de dos checkpoints: el cuantizado NVFP4 de NVIDIA (`nvidia/Muse-Glimmer-30B-NVFP4`) como modelo objetivo y el drafter DFlash de Meta (`meta-models/Muse-Glimmer-30B-assistant`) para decodificación especulativa. El modelo subyacente es Muse Glimmer, un modelo de lenguaje causal de 30.000 millones de parámetros con un encoder de percepción dedicado, destilado de Muse Spark y orientado a tareas agénticas autónomas en hardware de consumo.

La relevancia de esta publicación no reside en un nuevo entrenamiento, sino en el empaquetado: un único fichero de 23,2 GiB que contiene tanto los pesos del modelo objetivo como los del drafter, de modo que la decodificación especulativa se ejecuta sin necesidad de cargar dos artefactos separados. El contenedor está específicamente construido para AMD RDNA4 con ROCm, lo que lo convierte en una alternativa poco habitual frente al ecosistema mayoritariamente CUDA de las publicaciones de cuantización.

El modelo soporta entrada de texto e imagen y salida de texto, con 131.072 tokens de contexto entrenados que el servidor puede extender hasta 524.288 tokens en tiempo de servicio. La licencia Apache-2.0 se hereda de ambos checkpoints de origen. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de percepción dedicado (arquitectura `museglimmer`); decodificación especulativa DFlash |
| Parámetros totales | 30.000 millones (modelo objetivo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens entrenados; servido con `--max-model-len 524288` |
| Tipos de cuantización | Objetivo: W4A16 NVFP4 mixto con FP8 y fallback BF16 (ModelOpt AutoQuant); encoder de percepción en BF16; KV cache en FP8 en tiempo de servicio; drafter en MXFP4/FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.rad` (radiance); los checkpoints de origen son safetensors |

## Arquitectura y entrenamiento

El modelo objetivo es un transformer causal de 30.000 millones de parámetros con un encoder de percepción separado que habilita la entrada multimodal de imagen y texto. Según la información disponible, Muse Glimmer fue destilado de Muse Spark y está orientado a tareas agénticas autónomas ejecutables en hardware de consumo. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de este contenedor es la integración de un drafter DFlash que propone 15 tokens por paso; el modelo objetivo verifica cada token emitido, de modo que la especulación no altera la distribución de salida. La receta de conversión (`rad-convert`) cuantiza las proyecciones del modelo de lenguaje y el `lm_head` a W4A16 NVFP4/FP8 donde AutoQuant lo selecciona, mantiene el encoder de percepción en BF16 y fusiona el drafter bajo el prefijo `draft.` con pesos MXFP4/FP8. El resultado es un único fichero que contiene objetivo y drafter, eliminando la coordinación de dos artefactos en producción.

## Capacidades

- Generación de texto conversacional con soporte multi-turno.
- Entrada multimodal de imagen y texto (`image-text-to-text`), con salida exclusivamente textual.
- Razonamiento agéntico y ejecución de tareas autónomas de múltiples pasos, según la orientación declarada del modelo base.
- Tool calling y function calling a través de la API compatible con OpenAI que expone el servidor radiance.
- Salida estructurada (structured output) en el servidor.
- Decodificación especulativa con drafter DFlash integrado, con 15 tokens propuestos por paso.
- Contexto extensible en servicio hasta 524.288 tokens mediante `--max-model-len`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de agentes autónomos sobre hardware AMD: el modelo está empaquetado para RDNA4 con ROCm y expone tool calling, por lo que puede orquestar llamadas a APIs y ejecutar flujos de múltiples pasos sin depender de CUDA.
- Procesamiento de documentos con imagen y texto: el encoder de percepción permite enviar capturas, diagramas o páginas escaneadas junto con instrucciones textuales para extracción de datos estructurados.
- Servicio conversacional de contexto largo: con 524.288 tokens en servicio, encaja en escenarios de análisis de repositorios completos, expedientes o historiales extensos en una sola ventana.
- Despliegue en estaciones de trabajo con dos GPU AMD: la receta de servicio usa `--tp 2`, lo que permite servir el modelo en configuraciones de dos aceleradores RDNA4 con KV cache en FP8.
- Aceleración de latencia en producción: el drafter DFlash de 15 tokens por paso reduce el número de pasos de decodificación en cargas de generación larga, manteniendo la verificación por parte del modelo objetivo.
- Integración en pipelines con interfaz OpenAI: al hablar la API de OpenAI, el contenedor puede sustituir a otros backends en herramientas existentes que consuman ese protocolo, incluyendo clientes de function calling y salida estructurada.
- Evaluación de cuantización FP4 en hardware no NVIDIA: sirve como banco de pruebas para comparar NVFP4 ejecutado sobre ROCm frente a despliegues CUDA equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 23,2 GiB en disco; con KV cache en FP8, contexto de 524.288 tokens y `--max-num-seqs 4`, la VRAM necesaria supera ampliamente el tamaño de los pesos. No se proporciona una cifra exacta de VRAM.
- GPU recomendadas: el contenedor está construido para AMD RDNA4 con ROCm; la invocación de ejemplo usa `--tp 2`, es decir, dos GPU.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo NVIDIA; el soporte declarado es ROCm sobre RDNA4. El modelo base se describe como orientado a hardware de consumo, pero esta build concreta no detalla modelos de GPU soportados.
- Opciones de despliegue: motor radiance 1.17.0 o superior con el plugin de arquitectura `museglimmer`; servidor compatible con la API de OpenAI en el puerto indicado. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles. El único dato de rendimiento estructural es la propuesta de 15 tokens por paso por parte del drafter.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| DustinEwan/muse-glimmer-30b-nvfp4-dflash-fp4 | 30.000 M | 131.072 entrenados / 524.288 en servicio | `.rad` (radiance) | AMD RDNA4 + ROCm | Apache-2.0 |
| nvidia/Muse-Glimmer-30B-NVFP4 | 30.000 M | no disponible en la información | safetensors (ModelOpt) | NVIDIA (CUDA) | Apache-2.0 |
| bullerwins/Muse-Glimmer-30B-NVFP4 | 30.000 M | no disponible en la información | safetensors | no disponible | no disponible |
| meta-models/Muse-Glimmer-30B | 30.000 M | no disponible en la información | safetensors | no disponible | Apache-2.0 |

La diferencia principal frente a los tres checkpoints de origen es el empaquetado: solo esta build integra el drafter DFlash en el mismo fichero y solo esta está preparada para ROCm sobre RDNA4. El checkpoint de NVIDIA mantiene el mismo esquema de cuantización NVFP4 pero sin drafter fusionado y orientado a CUDA.

## Limitaciones y advertencias

- El repositorio no registra descargas ni interacciones, y el autor no es el desarrollador original del modelo; se trata de una conversión de terceros sin validación comunitaria.
- Dependencia estricta del motor radiance 1.17.0 o superior y del plugin `museglimmer`; no es portable a vLLM, llama.cpp, Ollama ni TGI.
- El soporte declarado es exclusivamente AMD RDNA4 con ROCm; no hay garantía de funcionamiento en otras arquitecturas AMD ni en NVIDIA, pese al origen NVFP4 de los pesos.
- El contexto de 524.288 tokens es una extensión en tiempo de servicio sobre 131.072 tokens entrenados; el rendimiento más allá de la ventana de entrenamiento no está documentado y puede degradarse.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El encoder de percepción permanece en BF16, por lo que el ahorro de memoria de la cuantización FP4 no aplica a la parte multimodal.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de los checkpoints de origen y no se acompaña de garantías del autor de la conversión.
- No se han publicado benchmarks que permitan verificar la pérdida de calidad introducida por la cuantización NVFP4 mixta ni por la decodificación especulativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DustinEwan/muse-glimmer-30b-nvfp4-dflash-fp4
- Modelo objetivo (NVIDIA): https://huggingface.co/nvidia/Muse-Glimmer-30B-NVFP4
- Modelo base original: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Drafter DFlash: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Conversión de referencia de terceros: https://huggingface.co/bullerwins/Muse-Glimmer-30B-NVFP4
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
