# mistralai/Mistral-Small-4-119B-2603-eagle

## Resumen

Mistral Small 4 119B A6B Eagle es un modelo auxiliar de decodificacion especulativa (speculative decoding) publicado por Mistral AI como complemento del modelo base mistralai/Mistral-Small-4-119B-2603. No es un modelo conversacional autonomo: es un modelo "draft" o "eagle head" que se acopla al modelo principal mediante el metodo EAGLE en vLLM para proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida.

El modelo base al que sirve es Mistral Small 4, un transformer hibrido con mezcla de expertos (MoE) de 128 expertos y 4 activos, 119.000 millones de parametros totales y 6,5B activados por token, con ventana de contexto de 256.000 tokens y entrada multimodal (texto e imagen). Mistral Small 4 unifica en un solo modelo las capacidades de las familias Instruct, Reasoning (antes Magistral) y Devstral, con modo de razonamiento conmutable por peticion mediante el parametro `reasoning_effort`.

La relevancia de este checkpoint es practica: permite reducir la latencia de inferencia del modelo base en despliegues de produccion con vLLM. Segun la model card, en configuracion optimizada para latencia Mistral Small 4 logra una reduccion del 40% en el tiempo de finalizacion extremo a extremo, y en configuracion optimizada para throughput procesa 3 veces mas peticiones por segundo que Mistral Small 3. El repositorio ocupa solo 0,4 GB, coherente con su naturaleza de cabeza especulativa ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificacion especulativa EAGLE para el modelo base Mistral Small 4 (MoE, 128 expertos, 4 activos) |
| Parametros totales | No disponible para la cabeza; el modelo base tiene 119B |
| Parametros activos | No disponible para la cabeza; el modelo base activa 6,5B por token |
| Longitud de contexto | 65.536 tokens en la configuracion especulativa recomendada (`max_model_len: 65536`); el modelo base soporta 262.144 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0,4 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El checkpoint es una cabeza EAGLE (EAGLE-3 o variante equivalente, segun el campo `method: "eagle"` de la configuracion de vLLM) disenada para acoplarse al modelo base Mistral-Small-4-119B-2603. En decodificacion especulativa, la cabeza predice varios tokens futuros a partir del estado oculto del modelo grande; el modelo base verifica esos candidatos en una sola pasada forward y acepta el prefijo correcto, de modo que se generan varios tokens por paso sin degradar la calidad de la salida. La configuracion recomendada usa `num_speculative_tokens: 3`.

El modelo base es un transformer con mezcla de expertos de 128 expertos y 4 activos por token, 119B de parametros totales y 6,5B activos, con soporte multimodal de entrada (texto e imagen) y salida de texto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; para la cabeza especulativa no se publican datos de entrenamiento. La innovacion tecnica destacable es la propia decodificacion especulativa con EAGLE integrada en vLLM, junto con el backend de atencion `FLASH_ATTN_MLA` empleado en el ejemplo de despliegue.

## Capacidades

- Aceleracion de inferencia: actua como modelo draft para decodificacion especulativa EAGLE en vLLM, con 3 tokens especulativos por paso en la configuracion recomendada.
- No genera respuestas de forma autonoma: su funcion es proponer tokens candidatos que el modelo base Mistral Small 4 verifica.
- Hereda el perfil multilingue del modelo base: 24 idiomas declarados, incluidos espanol, ingles, frances, aleman, portugues, italiano, chino, japones, coreano, arabe, hindi y bengali.
- El modelo base asociado soporta modo de razonamiento conmutable (`reasoning_effort` a `none` o `high`), vision (entrada de imagen), function calling nativo, salida JSON y comportamiento agentico.
- Integracion con el parser de tool calls y de razonamiento de Mistral en vLLM (`--tool-call-parser mistral`, `--reasoning-parser mistral`).

## Casos de uso

- Despliegue de produccion de Mistral Small 4 con baja latencia: se sirve el modelo base con `--speculative_config` apuntando a este checkpoint para reducir el tiempo de finalizacion extremo a extremo hasta un 40% en configuracion optimizada para latencia.
- Servidores de alto throughput: en entornos con muchas peticiones concurrentes, la decodificacion especulativa permite procesar hasta 3 veces mas peticiones por segundo que Mistral Small 3, segun la model card.
- Asistentes de chat con contexto largo: al combinarse con los 256k tokens del modelo base, la aceleracion resulta util en conversaciones multi-turno con documentos extensos donde la latencia por token es critica.
- Agentes de codigo y automatizacion SWE: el modelo base soporta function calling nativo y salida JSON; la cabeza especulativa reduce el coste de las cadenas largas de llamadas a herramientas.
- Extraccion y analisis de documentos con vision: para pipelines que procesan imagenes y texto con salida estructurada, la aceleracion disminuye el tiempo por documento en lotes grandes.
- Investigacion sobre decodificacion especulativa: sirve como referencia reproducible para medir tasas de aceptacion de EAGLE sobre un MoE de 119B con atencion MLA.
- Fine-tuning y experimentacion: al ser un componente ligero (0,4 GB) con licencia Apache 2.0, puede estudiarse o adaptarse a variantes del modelo base sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas relativas de eficiencia del sistema completo: 40% menos tiempo de finalizacion extremo a extremo en configuracion optimizada para latencia y 3 veces mas peticiones por segundo en configuracion optimizada para throughput, ambas frente a Mistral Small 3 y sin cifras absolutas.

## Requisitos de hardware

- VRAM: no disponible para la cabeza especulativa de forma aislada; el coste dominante es el del modelo base de 119B, que en el ejemplo oficial se sirve con `--tensor-parallel-size 2` y `--gpu_memory_utilization 0.8`.
- GPU recomendadas: el ejemplo de la model card usa paralelismo tensorial en 2 GPU, lo que encaja con 2x A100 80 GB o 2x H100 80 GB; no se especifica el modelo exacto de GPU.
- GPU de consumo: no disponible; un MoE de 119B con 6,5B activos no cabe en una sola GPU de consumo en precision completa, y la model card no documenta configuraciones con cuantizacion para este checkpoint.
- Despliegue: vLLM (nightly) es el unico motor documentado, con `transformers` desde main y `mistral_common >= 1.10.0`. No se mencionan llama.cpp, Ollama ni TGI.
- Parametros de servido relevantes: `--max-model-len 262144`, `--attention-backend FLASH_ATTN_MLA`, `--max_num_batched_tokens 16384`, `--max_num_seqs 128`, `--enable-auto-tool-choice`, `--reasoning-parser mistral`.
- Latencia y throughput: solo se publican mejoras relativas (40% menos tiempo extremo a extremo; 3x peticiones por segundo frente a Mistral Small 3); no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Funcion |
|---|---|---|---|---|---|
| Mistral-Small-4-119B-2603-eagle | Cabeza EAGLE para decodificacion especulativa | No disponible (repo de 0,4 GB) | 65.536 en config. especulativa | Apache 2.0 | Acelerar el modelo base |
| Mistral-Small-4-119B-2603 | MoE, 128 expertos, 4 activos | 119B totales / 6,5B activos | 262.144 | Apache 2.0 | Modelo base multimodal con razonamiento |
| Mistral Small 3 | No disponible en la informacion | No disponible | No disponible | No disponible | Referencia de comparacion de velocidad en la model card |

No se dispone de datos sobre otras cabezas especulativas EAGLE comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no es utilizable de forma independiente: requiere el modelo base Mistral-Small-4-119B-2603 y un motor compatible con EAGLE (vLLM con `--speculative_config`).
- La longitud de contexto de la configuracion especulativa recomendada es de 65.536 tokens, inferior a los 262.144 del modelo base; para contextos mayores hay que revisar la configuracion.
- No se publican datos de entrenamiento, tasas de aceptacion ni benchmarks de la cabeza; el beneficio real depende del dominio y del prompt.
- La model card advierte de que se necesita vLLM nightly y `transformers` desde main, lo que implica APIs potencialmente inestables en produccion.
- Riesgo de alucinacion y sesgos: no documentados para este checkpoint; son los heredados del modelo base, sobre el que tampoco se detallan en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y no comercial, pero conviene verificar las condiciones del modelo base y de `mistral_common` en el despliegue.
- El rendimiento relativo citado (40% y 3x) procede del autor y se mide frente a Mistral Small 3, no frente al propio Mistral Small 4 sin especulacion.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- vLLM: https://github.com/vllm-project/vllm
- mistral-common v1.10.0: https://github.com/mistralai/mistral-common/releases/tag/v1.10.0
- Sitio de Mistral AI: https://mistral.ai/
