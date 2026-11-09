# harness-hub/LFM2.5-24B-A2B-opencode-GGUF

## Resumen

LFM2.5-24B-A2B-opencode-GGUF es la conversión a formato GGUF del adaptador LoRA `harness-hub/LFM2.5-24B-A2B-opencode`, un ajuste fino por refuerzo (RL) del modelo base `LiquidAI/LFM2.5-24B-A2B` de Liquid AI. El adaptador se entrenó dentro del agente de programación OpenCode para optimizar el comportamiento agéntico: según el autor, resuelve las mismas tareas que el modelo base con un 30 % menos de llamadas a herramientas en las tareas que ambos resuelven. El repositorio contiene únicamente los pesos del adaptador en F16 (`LFM2.5-24B-A2B-harbor-opencode-lora-F16.gguf`), no un modelo completo.

La relevancia de esta publicación es práctica: permite ejecutar el adaptador sobre el modelo base cuantizado en llama.cpp, con soporte de `llama serve` y una ventana de contexto configurable de hasta 65 536 tokens en el ejemplo del autor. Está pensado para integrarse en OpenCode 1.19.5 mediante un endpoint compatible con la API de OpenAI.

Conviene advertir que el adaptador no se ha reevaluado en GGUF: las métricas publicadas provienen de vLLM en BF16, y una base cuantizada altera los resultados. Además, la información disponible sobre arquitectura, datos de entrenamiento y benchmarks es muy limitada; los datos que figuran a continuación proceden de la model card y de los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-24B-A2B de Liquid AI; el adaptador es un LoRA) |
| Parámetros totales | 18 710 528 (dato del repositorio, correspondiente al adaptador LoRA en safetensors) |
| Parámetros activos | no disponible (el nombre del modelo base sugiere una arquitectura MoE con ~2B activos, pero no se confirma en la información disponible) |
| Longitud de contexto | 65 536 tokens en el ejemplo de despliegue del autor (`-c 65536`); el máximo del modelo base no se especifica |
| Tipos de cuantización | adaptador en F16; el modelo base se sirve en Q8_0 como opción recomendada por el autor |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia del modelo base LiquidAI/LFM2.5-24B-A2B) |
| Formato de pesos | GGUF (adaptador LoRA en F16); el modelo base en GGUF, p. ej. `LFM2.5-24B-A2B-Q8_0.gguf` |

## Arquitectura y entrenamiento

El adaptador se entrenó con aprendizaje por refuerzo (RL) dentro del agente de programación OpenCode, según indica la model card. No se detallan el algoritmo de RL, el volumen de datos, la composición del dataset ni si hubo etapas de SFT o DPO previas. El adaptador se aplica sobre los pesos BF16 del modelo base `LiquidAI/LFM2.5-24B-A2B`; el autor recomienda usar una base lo más cercana posible a BF16 (Q8_0 como compromiso) para preservar el comportamiento aprendido.

La conversión a GGUF se realizó con `convert_lora_to_gguf.py` de llama.cpp, con `--outtype f16` y pasando el directorio de configuración del modelo base. El resultado es un LoRA en F16 que se carga dinámicamente sobre un GGUF del modelo base mediante `llama serve --lora`. No se documentan innovaciones arquitectónicas propias del adaptador más allá del ajuste por RL orientado a reducir llamadas a herramientas.

## Capacidades

- Ejecución de tareas de programación agéntica dentro de OpenCode, con uso de herramientas (tool calling) sobre archivos y comandos del entorno.
- Reducción de llamadas a herramientas: el autor reporta un 30 % menos de tool calls que el modelo base en las tareas que ambos resuelven.
- Integración con la API compatible de OpenAI expuesta por `llama serve` (`/v1`), lo que permite conectarlo a clientes que hablen ese protocolo.
- Razonamiento multi-paso orientado a agentes, derivado del entrenamiento por RL en un bucle agéntico real.
- Capacidades del modelo base LFM2.5-24B-A2B (generación de texto, código, matemáticas, multilingüismo) en la medida en que el adaptador no las degrade; no se detallan en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia de programación en local con OpenCode: el adaptador se carga sobre el GGUF del modelo base y se apunta OpenCode al endpoint `http://localhost:8080/v1`, de modo que el agente opera sobre el repositorio del usuario sin enviar código a servicios externos.
- Automatización de tareas de refactorización multi-archivo: el contexto de 65 536 tokens permite mantener en memoria varios ficheros y el historial de herramientas durante una sesión agéntica.
- Reducción de coste en pipelines agénticos: al necesitar un 30 % menos de llamadas a herramientas en las tareas que resuelve, disminuye la latencia acumulada y el consumo de tokens en bucles de agente.
- Despliegue en estaciones de trabajo con GPU de consumo: al ser un adaptador LoRA sobre una base cuantizada (Q8_0), el requisito de VRAM lo determina el modelo base, no el adaptador, que es pequeño en comparación.
- Evaluación comparativa de estrategias de RL para agentes: sirve como referencia reproducible para medir el efecto del entrenamiento por refuerzo en el número de tool calls frente al modelo base.
- Integración en herramientas de CI/CD con cliente compatible con OpenAI: cualquier utilidad que consuma la API `/v1` puede apuntarse al servidor local para tareas de análisis de código o generación de parches, siempre que se valide la calidad fuera del entorno de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta la comparación cualitativa de que el adaptador resuelve tareas con la misma frecuencia que el modelo base y con un 30 % menos de llamadas a herramientas en las tareas que ambos resuelven. Esas cifras proceden de la evaluación original en vLLM con BF16 y no se han reproducido en GGUF ni con base cuantizada.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo base; el adaptador LoRA en F16 añade una sobrecarga pequeña respecto a la base. El repositorio del adaptador ocupa 0,0 GB según los metadatos.
- GPU recomendadas: no disponibles. El autor no especifica hardware de referencia para el despliegue en llama.cpp.
- GPU de consumo: no se confirma qué tarjetas pueden alojar el modelo base en Q8_0; el adaptador por sí solo no determina el requisito.
- Opciones de despliegue: llama.cpp mediante `llama serve -m .gguf --lora <adaptador>.gguf -c 65536 --port 8080 --alias lfm2.5-harbor-opencode`. No se documentan otras opciones (vLLM, TGI, Ollama) para esta variante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-opencode-GGUF (este) | adaptador LoRA; base no especificada en la información disponible | 65 536 en el ejemplo de despliegue | GGUF (LoRA F16) | lfm1.0 | Ajuste por RL en OpenCode; no reevaluado en GGUF |
| LiquidAI/LFM2.5-24B-A2B (base) | no disponible | no disponible | safetensors y GGUF | lfm1.0 | Modelo base sin el ajuste agéntico; referencia directa de comparación |
| harness-hub/LFM2.5-24B-A2B-opencode (adaptador PEFT) | adaptador LoRA | no disponible | PEFT/safetensors | lfm1.0 | Versión original del adaptador, evaluada en vLLM BF16 |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador no se ha reevaluado en GGUF: las cifras de la model card provienen de vLLM en BF16 y una base cuantizada puede degradar el comportamiento entrenado.
- El repositorio contiene solo el adaptador LoRA; requiere descargar por separado un GGUF del modelo base `LiquidAI/LFM2.5-24B-A2B`.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo en el enlace indicado por el autor antes de desplegar en producción.
- El entrenamiento se realizó dentro de OpenCode 1.19.5; el comportamiento fuera de ese agente o con otras versiones no está validado.
- El contexto de 65 536 tokens es la configuración del ejemplo de despliegue, no necesariamente el máximo del modelo base.
- No hay métricas de latencia ni throughput publicadas para la variante GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-opencode-GGUF
- Adaptador original (PEFT): https://huggingface.co/harness-hub/LFM2.5-24B-A2B-opencode
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- OpenCode: https://github.com/sst/opencode
- llama.cpp: https://github.com/ggml-org/llama.cpp
