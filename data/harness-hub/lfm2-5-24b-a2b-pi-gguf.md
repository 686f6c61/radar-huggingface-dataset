# harness-hub/LFM2.5-24B-A2B-pi-GGUF

## Resumen

LFM2.5-24B-A2B-pi-GGUF es la conversión a formato GGUF de un adaptador LoRA entrenado por harness-hub sobre el modelo base LiquidAI/LFM2.5-24B-A2B. El adaptador, denominado "harbor · pi", se entrenó mediante aprendizaje por refuerzo dentro del framework pi, con el objetivo de reducir el número de llamadas a herramientas (tool calls) que el modelo realiza al resolver tareas, manteniendo la precisión del modelo base. Según su documentación, logra una precisión similar al modelo original con un 39 % menos de llamadas a herramientas en las tareas que ambos resuelven.

El archivo publicado es únicamente el adaptador (unos 37 MB en F16), por lo que debe ejecutarse sobre el GGUF del modelo base de LiquidAI, preferiblemente en Q8_0. Su relevancia está en el ámbito de los agentes: al reducir el consumo de llamadas a herramientas sin pérdida de precisión, disminuye la latencia y el coste operativo en flujos de trabajo agénticos. El modelo base LFM2.5-24B-A2B es un modelo de 24B parámetros con arquitectura híbrida de LiquidAI; los detalles completos de la arquitectura no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM2.5-24B-A2B (arquitectura del base no detallada en la ficha) |
| Parametros totales | 18.710.528 (dato safetensors del adaptador) |
| Parametros activos | no disponible (aplica al modelo base) |
| Longitud de contexto | 65.536 tokens (usada en el ejemplo de despliegue con llama.cpp) |
| Tipos de cuantizacion | Adaptador en F16; base recomendado en Q8_0 (también compatible Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other; licencia heredada de LiquidAI/LFM2.5-24B-A2B) |
| Formato de pesos | GGUF (adaptador LoRA, ~37 MB, requiere GGUF del modelo base) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo completo, sino un adaptador LoRA convertido a GGUF con la herramienta `convert_lora_to_gguf.py` de llama.cpp a partir del adaptador PEFT original. El modelo base subyacente es LiquidAI/LFM2.5-24B-A2B, un modelo de 24B parámetros de la familia LFM de LiquidAI; los detalles de su arquitectura (capas, mecanismos de atención, composición MoE) no están descritos en la información disponible.

El entrenamiento del adaptador se realizó con aprendizaje por refuerzo dentro del framework pi, orientado específicamente a tareas de análisis de datos con uso de herramientas. El objetivo declarado es reducir en torno a un 39 % las llamadas a herramientas respecto al modelo base en las tareas que ambos resuelven, manteniendo una precisión equivalente. La evaluación original se llevó a cabo sobre 100 tareas de análisis de datos con vLLM en BF16, con un margen de ruido de aproximadamente ±5 puntos en pass@1. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento heredadas del modelo base LFM2.5-24B-A2B
- Uso eficiente de herramientas (tool calling): el ajuste por refuerzo reduce las llamadas a herramientas innecesarias en un 39 % manteniendo la precisión
- Tareas de análisis de datos: dominio principal sobre el que se entrenó y evaluó el adaptador
- Ejecución en flujos agénticos: está diseñado para integrarse con el framework pi mediante el plugin pi-llama
- Despliegue local con llama.cpp: el formato GGUF permite servir el modelo con el adaptador aplicado en tiempo de ejecución
- Capacidades multilingües, de visión o audio: no disponibles en la información proporcionada

## Casos de uso

- Agentes de análisis de datos: el modelo está afinado específicamente para resolver tareas de análisis de datos con menos llamadas a herramientas, lo que reduce la latencia y el coste por tarea en pipelines automatizados.
- Agentes locales con presupuesto de cómputo acotado: al ejecutarse con llama.cpp sobre un GGUF cuantizado (Q8_0 o Q4_K_M), puede desplegarse en estaciones de trabajo sin depender de APIs externas.
- Reducción de coste en orquestación de herramientas: en escenarios multi-turno donde cada llamada a herramienta consume tokens y tiempo, la reducción del 39 % se traduce directamente en ahorro operativo.
- Prototipado de agentes con pi: el repositorio incluye instrucciones para conectarlo directamente al framework pi (`pi install git:github.com/huggingface/pi-llama`), lo que facilita la experimentación con agentes.
- Servicios de inferencia autoalojados: puede servirse vía `llama serve` con contexto de 65.536 tokens, adecuado para aplicaciones que requieren conversaciones largas o documentos extensos.
- Evaluación comparativa de LoRAs para agentes: útil como caso de estudio para equipos que investigan cómo el RL sobre tareas agénticas puede optimizar el comportamiento de modelos base sin reentrenamiento completo.
- Integración en CI/CD de herramientas de IA: al ser un adaptador ligero de 37 MB, puede versionarse y desplegarse de forma independiente del modelo base en pipelines de despliegue.

## Benchmarks y rendimiento

Datos publicados en la model card del adaptador original (evaluados con vLLM en BF16, no reevaluados en GGUF):

| Métrica | Resultado |
|---|---|
| Precisión respecto al modelo base | Aproximadamente equivalente |
| Reducción de tool calls | 39 % en las tareas que ambos resuelven |
| Tamaño de la evaluación | 100 tareas de análisis de datos, pass@1, ruido ±5 puntos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa unos 37 MB; los requisitos reales dependen del GGUF del modelo base LFM2.5-24B-A2B que se utilice (no disponibles en la información proporcionada).
- Cuantización recomendada del base: Q8_0 como opción por defecto (mayor fidelidad al comportamiento entrenado); Q4_K_M como alternativa más ligera, aunque se desvía más del comportamiento aprendido.
- Contexto de 65.536 tokens usado en el ejemplo de despliegue, lo que incrementa la memoria necesaria respecto a contextos cortos.
- Despliegue con llama.cpp (`llama serve` con `--lora`), compatible con el ecosistema GGUF; no se especifican GPUs concretas ni estimaciones de VRAM, latencia o throughput.
- Integración con el framework pi mediante el plugin pi-llama.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| harness-hub/LFM2.5-24B-A2B-pi-GGUF | Adaptador LoRA (GGUF) | 18,7 M parámetros (adaptador) | GGUF F16 | lfm1.0 | Requiere base de LiquidAI; -39 % tool calls |
| harness-hub/LFM2.5-24B-A2B-harbor-pi-lora | Adaptador LoRA (PEFT) | 18,7 M parámetros (adaptador) | safetensors | lfm1.0 | Versión original, evaluada en vLLM BF16 |
| LiquidAI/LFM2.5-24B-A2B | Modelo base completo | 24B parámetros | safetensors / GGUF | lfm1.0 | Más tool calls, misma precisión en las tareas comunes |

## Limitaciones y advertencias

- No reevaluado en GGUF: las métricas publicadas provienen de la ejecución con vLLM en BF16; el comportamiento a través de llama.cpp no ha sido evaluado y una base cuantizada puede desviar los resultados.
- Evaluación de dominio único y tamaño reducido: 100 tareas de análisis de datos con un ruido de ±5 puntos en pass@1, por lo que las conclusiones pueden no generalizar a otros dominios.
- Sensibilidad a la cuantización del base: el adaptador se entrenó sobre pesos BF16; usar Q4_K_M en lugar de Q8_0 aleja el comportamiento del modelo del objetivo de entrenamiento.
- Requiere el modelo base de LiquidAI: no funciona de forma independiente; hay que descargar y gestionar dos artefactos (base + adaptador).
- Licencia lfm1.0: al ser una licencia "other" heredada de LiquidAI, conviene revisar sus términos antes de cualquier uso comercial.
- Posible alucinación y sesgos: heredados del modelo base; no se dispone de información específica sobre sesgos en la documentación proporcionada.
- Repositorio de bajo uso: 82 descargas en el momento de la ficha, sin pipeline asignado, lo que sugiere un proyecto de nicho con posible soporte limitado.

## Enlaces

- Ficha del modelo GGUF: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi-GGUF
- Adaptador LoRA original: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-harbor-pi-lora
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Framework pi: https://github.com/earendil-works/pi
- Plugin pi-llama: https://github.com/huggingface/pi-llama
- llama.cpp: https://github.com/ggml-org/llama.cpp
