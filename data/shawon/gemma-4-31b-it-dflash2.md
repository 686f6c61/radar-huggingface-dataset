# shawon/gemma-4-31B-it-DFlash2

## Resumen

`shawon/gemma-4-31B-it-DFlash2` es un modelo borrador (draft) para decodificacion especulativa de tipo DFlash2, entrenado por el usuario shawon para acelerar la inferencia de `gemma-4-31B-it`. No es un modelo generativo autonomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo (Gemma 4 31B Instruct) verifica en paralelo, reduciendo la latencia por token generado sin alterar la distribucion de salida del modelo grande.

El borrador se entreno durante 6000 pasos sobre un MacBook Pro con chip M5 Max, tomando las capas objetivo [11, 29, 47] del modelo Gemma 4 31B. A pesar del nombre "31B" en el identificador, el artefacto publicado contiene 390.954.240 parametros (unos 391 M) en safetensors, con un repositorio de 0,8 GB, lo que es coherente con un modelo borrador mucho mas pequeno que el objetivo.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir latencia en modelos grandes sin reentrenar el modelo base. Este draft permite desplegar Gemma 4 31B con aceleracion en el fork de Splash indicado por el autor, aunque la documentacion publicada es minima y no incluye datos de speedup medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (borrador de decodificacion especulativa), pesos en safetensors; tag `qwen3` en el repo |
| Parametros totales | 390.954.240 (aproximadamente 391 M) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 0,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo objetivo | gemma-4-31B-it (GGUF de unsloth y checkpoints MLX) |
| Capas objetivo | [11, 29, 47] |
| Pasos de entrenamiento | 6000 |
| Libreria | splash (fork con soporte Gemma 4) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa DFlash2, una variante de draft model que predice varios tokens futuros a partir del estado oculto del modelo objetivo. El entrenamiento se realizo durante 6000 pasos en un MacBook Pro con M5 Max, tomando como referencia las capas [11, 29, 47] de gemma-4-31B-it. El autor indica que sirve con Splash sobre un fork especifico con soporte para Gemma 4 (`feat/gemma4`).

No se especifican en la informacion disponible el dataset de entrenamiento, la composicion de tokens, el uso de RLHF/DPO ni detalles del objetivo de perdida. El tag `qwen3` en el repositorio sugiere que la arquitectura interna del borrador podria derivar de Qwen3, pero no se confirma en la model card. Tampoco se documentan innovaciones adicionales mas alla del propio esquema DFlash2.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos que el modelo objetivo verifica, acelerando la generacion de gemma-4-31B-it.
- Integracion con Splash: requiere el fork `shawonashraf/splash` en la rama `feat/gemma4`.
- Compatibilidad con pesos GGUF (unsloth/gemma-4-31B-it-GGUF) y checkpoints MLX del modelo objetivo.
- No es un modelo de chat ni de generacion autonoma; no debe usarse solo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues propias.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Aceleracion de inferencia en produccion de gemma-4-31B-it: desplegar el modelo objetivo junto con este draft en Splash para reducir la latencia por token en tareas de generacion de texto.
- Servicio de chat de baja latencia: usar decodificacion especulativa para mejorar el tiempo hasta el primer token percibido en aplicaciones conversacionales con Gemma 4 31B.
- Generacion de codigo interactiva: reducir la latencia en asistentes de autocompletado o generacion de codigo que usen Gemma 4 31B como base.
- Despliegue en hardware Apple Silicon: el borrador se entreno en M5 Max y apunta a checkpoints MLX, por lo que encaja en flujos de inferencia local en Mac.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el impacto de las capas objetivo [11, 29, 47] en la tasa de aceptacion del draft.
- Evaluacion de pipelines Splash: validar el fork `feat/gemma4` en entornos de prueba antes de adoptarlo en produccion con modelos Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasa de aceptacion (acceptance rate), speedup, latencia ni throughput medidos para este draft.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 0,8 GB en safetensors; en FP16 serian aproximadamente 0,8 GB solo para pesos, mas el coste del modelo objetivo gemma-4-31B-it (no disponible en esta informacion).
- GPU recomendadas: no disponible. El autor lo entreno en un MacBook Pro con M5 Max, lo que sugiere soporte para Apple Silicon.
- Cabe en GPU de consumo: si, el borrador por si solo ocupa menos de 1 GB; el requisito dominante es el modelo objetivo de 31B.
- Opciones de despliegue: Splash (fork `shawonashraf/splash`, rama `feat/gemma4`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shawon/gemma-4-31B-it-DFlash2 | 391 M | no disponible | Draft especulativo para Gemma 4 31B | no disponible | Hugging Face (272 descargas) |
| Draft models de EAGLE/Medusa para Llama | variable | no disponible | Draft especulativo | variable | Hugging Face |
| gemma-4-31B-it (modelo objetivo) | 31B (nominal) | no disponible | Generacion de texto | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como borrador de decodificacion especulativa junto a gemma-4-31B-it.
- La licencia no esta disponible en la informacion proporcionada; verificar antes de uso comercial.
- La model card no documenta sesgos, riesgo de alucinacion ni limitaciones de idioma del borrador.
- Dependencia de un fork no oficial de Splash (`feat/gemma4`); la compatibilidad con versiones upstream no esta garantizada.
- Documentacion minima: sin dataset, sin metricas de aceptacion y sin garantias de calidad del draft.
- El tag `qwen3` en el repo puede inducir a confusion sobre la arquitectura interna; no se aclara en la model card.
- Repositorio con 0 likes y 272 descargas: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/shawon/gemma-4-31B-it-DFlash2
- Fork de Splash con soporte Gemma 4: https://github.com/shawonashraf/splash/tree/feat/gemma4
- Modelo objetivo GGUF (referenciado): unsloth/gemma-4-31B-it-GGUF (no se proporciona URL directa en la informacion disponible)
