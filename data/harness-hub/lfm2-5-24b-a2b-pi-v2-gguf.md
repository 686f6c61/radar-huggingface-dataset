# harness-hub/LFM2.5-24B-A2B-pi-v2-GGUF

## Resumen

LFM2.5-24B-A2B-pi-v2-GGUF es la conversión a formato GGUF del adaptador LoRA `harness-hub/LFM2.5-24B-A2B-pi-v2`, un ajuste fino del modelo base `LiquidAI/LFM2.5-24B-A2B` entrenado mediante aprendizaje por refuerzo dentro del agente de programación pi (Earendil Works). El adaptador no es un modelo autónomo: se aplica sobre los pesos del modelo base y requiere servirse conjuntamente con una cuantización GGUF de este último mediante `llama.cpp`.

El objetivo del ajuste es mejorar la eficiencia en el uso de herramientas durante tareas de agente: según la model card, el adaptador resuelve tareas con una frecuencia similar al modelo base, pero con un 20 % menos de llamadas a herramientas en las tareas que ambos resuelven. Está pensado para su uso con el agente pi a través del plugin `pi-llama`, en flujos de programación agéntica.

La información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas soportados y no se han publicado evaluaciones del adaptador en formato GGUF. Los datos de arquitectura, contexto y entrenamiento del modelo base no se detallan en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-24B-A2B de LiquidAI; arquitectura no detallada en la información proporcionada) |
| Parámetros totales | no disponible para el modelo base; el adaptador LoRA tiene 18.710.528 parámetros (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información del adaptador; el ejemplo de despliegue usa `-c 65536` |
| Tipos de cuantización | adaptador convertido a F16 (`LFM2.5-24B-A2B-harbor-pi-lora-F16.gguf`); el modelo base se sirve aparte (el ejemplo usa Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | GGUF (adaptador LoRA en F16 para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrenó con aprendizaje por refuerzo dentro del agente de programación pi, partiendo del modelo base `LiquidAI/LFM2.5-24B-A2B`. La model card no detalla la arquitectura interna del modelo base (transformer, MoE u otra), el volumen de tokens de entrenamiento, la composición del dataset ni el algoritmo de RL empleado; esa información se remite a la model card del adaptador original.

La conversión a GGUF se realizó desde el adaptador PEFT con el script `convert_lora_to_gguf.py` de llama.cpp, en precisión F16, usando como referencia el directorio de configuración del modelo base. El adaptador se entrenó sobre los pesos en BF16, por lo que la model card recomienda usar como base una cuantización lo más cercana posible a BF16 (Q8_0 como opción por defecto) para aproximarse al comportamiento entrenado.

## Capacidades

- Ajuste orientado a tareas de agente de programación dentro del agente pi.
- Uso de herramientas (tool calling) con una reducción del 20 % en el número de llamadas en las tareas que resuelve, según la model card.
- Resolución de tareas con una frecuencia similar al modelo base, según la model card.
- Integración con llama.cpp mediante `llama serve` y el plugin `pi-llama`.
- Capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo) no detalladas en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Programación agéntica con pi: el adaptador se sirve junto al modelo base en llama.cpp y se conecta al agente pi mediante `pi install git:github.com/huggingface/pi-llama`, reduciendo el número de llamadas a herramientas en tareas de edición y exploración de código.
- Despliegue local en estaciones de trabajo: al usar formato GGUF sobre llama.cpp, permite ejecutar el modelo base cuantizado y el adaptador en hardware propio sin depender de servicios en la nube.
- Automatización de tareas de refactorización: el agente puede encadenar lecturas de ficheros, ediciones y verificaciones con menos invocaciones de herramientas, lo que reduce latencia y coste por tarea.
- Integración en pipelines de CI/CD: un servidor `llama serve` con el adaptador cargado puede exponerse como endpoint compatible con el agente para tareas de revisión o generación de parches.
- Evaluación comparativa de adaptadores: sirve como referencia para medir el efecto del ajuste por RL sobre la eficiencia de tool calling frente al modelo base en el mismo entorno.
- Experimentación con LoRA en llama.cpp: el repositorio documenta el flujo completo de conversión (`convert_lora_to_gguf.py`) y carga (`--lora`), útil como plantilla para adaptar otros LoRA PEFT a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para la versión GGUF. La model card indica explícitamente que este fichero no ha sido evaluado a través de llama.cpp y que los resultados de la model card original proceden de vLLM en BF16; una base cuantizada alteraría adicionalmente los resultados. El único dato de rendimiento declarado es cualitativo: el adaptador resuelve tareas con una frecuencia similar al modelo base y con un 20 % menos de llamadas a herramientas en las tareas que ambos resuelven.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del tamaño real del modelo base (no detallado) y de la cuantización elegida; el ejemplo oficial usa Q8_0.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede determinar sin conocer el tamaño del modelo base.
- Despliegue: llama.cpp mediante `llama serve -m .gguf --lora <adapter>.gguf -c 65536 --port 8080 --alias lfm2.5-harbor-pi`.
- Descarga: `hf download LiquidAI/LFM2.5-24B-A2B-GGUF LFM2.5-24B-A2B-Q8_0.gguf` y `hf download harness-hub/LFM2.5-24B-A2B-pi-v2-GGUF LFM2.5-24B-A2B-harbor-pi-lora-F16.gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-pi-v2-GGUF | Adaptador LoRA GGUF sobre LFM2.5-24B-A2B | 18.710.528 (adaptador) | no disponible (ejemplo con 65536) | lfm1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-24B-A2B | Modelo base | no disponible | no disponible | lfm1.0 | Hugging Face |
| harness-hub/LFM2.5-24B-A2B-pi-v2 | Adaptador LoRA PEFT (BF16) | no disponible | no disponible | lfm1.0 | Hugging Face |

No se dispone de información sobre modelos alternativos de la misma categoría (adaptadores de agente para programación) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- No evaluado en GGUF: los resultados de la model card original provienen de vLLM en BF16; este fichero no se ha evaluado con llama.cpp y una base cuantizada puede degradar los resultados.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere descargar y servir una cuantización GGUF del modelo base.
- Precisión de la base: el adaptador se entrenó sobre BF16, por lo que bases muy cuantizadas pueden alejarse del comportamiento entrenado.
- Idiomas soportados no documentados en la información disponible.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia lfm1.0: es necesario revisar los términos en el enlace de licencia del modelo base antes de cualquier uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que limita la validación por parte de la comunidad.
- Fecha de creación y actualización del repositorio: 2026-11-09.

## Enlaces

- Repositorio GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-v2-GGUF
- Adaptador original: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-v2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Agente pi: https://github.com/earendil-works/pi
- Plugin pi-llama: https://github.com/huggingface/pi-llama
- llama.cpp: https://github.com/ggml-org/llama.cpp
