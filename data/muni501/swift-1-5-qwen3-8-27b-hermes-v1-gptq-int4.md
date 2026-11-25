# muni501/Swift-1.5-Qwen3.8-27B-hermes-v1-GPTQ-Int4

## Resumen

Swift-1.5-Qwen3.8-27B-hermes-v1-GPTQ-Int4 es una cuantizacion GPTQ INT4 del modelo Swift 1.5, un post-entrenamiento sobre Qwen3.8-27B (Alibaba Cloud) realizado por UkisAI. Este checkpoint concreto, publicado por el usuario muni501, fusiona el adaptador LoRA de agente de harness-hub/Qwen3.8-27B-hermes-adapted en el cuerpo del modelo Swift y lo re-cuantiza a INT4 con gptqmodel 7.3.2, incorporando ademas un bake calibrado de lm_head y del bloque MTP (multi-token prediction) y un fichero lateral de embeddings en INT8.

El modelo esta disenado para servirse mediante TensorFold sobre aceleradores Intel Arc Pro B70 (XPU), un runtime propietario que requiere un loader parcheado para leer el fichero de embeddings INT8. La arquitectura subyacente es un transformer denso de 27B parametros derivado de la familia Qwen3.8, con soporte de MTP y un contexto de servicio configurado hasta 200.000 tokens en el ejemplo de despliegue del autor.

Su relevancia es acotada pero concreta: es un ejemplo de cadena de derivacion compleja (base Apache-2.0, post-entrenamiento con licencia Swift Open License v1.0, adaptador de agente Apache-2.0 y cuantizacion posterior) orientada a despliegue de agentes con tool calling en hardware Intel. El autor advierte explicitamente de que no se ha re-establecido la perplejidad ni benchmarks downstream tras la re-cuantizacion, y de que la compatibilidad fuera del runtime TensorFold XPU no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con bloque MTP (multi-token prediction); cuantizacion GPTQ |
| Parametros totales | 27B (segun denominacion del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 200.000 tokens en la configuracion de servicio del autor (`--context 200000`) |
| Tipos de cuantizacion | GPTQ INT4 (group size 128, simetrica, sin activation ordering); embeddings en INT8 (fichero lateral) y BF16 denso en shards |
| Idiomas soportados | en (segun metadatos de Hugging Face y model card) |
| Licencia | Swift Open License v1.0 (uso comercial permitido solo por debajo de 1M USD de ingresos brutos); material base Qwen y adaptador hermes bajo Apache-2.0 |
| Formato de pesos | safetensors (GPTQ INT4 + fichero INT8 de embeddings) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parametros de Alibaba Cloud bajo licencia Apache-2.0. Sobre esa base, UkisAI aplico un post-entrenamiento (Swift 1.5) y publico una version cuantizada con AutoRound en W4A16. Posteriormente se ha fusionado el adaptador LoRA de agente de harness-hub/Qwen3.8-27B-hermes-adapted mediante `peft.merge_and_unload` sobre el cuerpo des-cuantizado a BF16, y el resultado se ha re-cuantizado con gptqmodel 7.3.2 en INT4 (group size 128, simetrica, sin activation ordering).

La calibracion de la re-cuantizacion del cuerpo uso 256 muestras de 2048 tokens: 192 de wikitext-2 mas 64 transcripciones con forma de agente/tool-call, ejecutadas en CUDA. El lm_head y los 9 lineales del bloque MTP no se re-cuantizaron: se trasplantaron byte a byte desde el bake calibrado de Swift (`model-bake-int4.safetensors`). Los embeddings se mantienen en BF16 denso en los shards, con un fichero lateral INT8 (`model-embed-int8.safetensors`) para el loader TP-aware parcheado del runtime. El modelo incorpora MTP (multi-token prediction) como innovacion de decodificacion, y el despliegue de referencia usa un drafter DFlash2 para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento general, heredados de la base Qwen3.8-27B.
- Comportamiento de agente orientado a tool calling y function calling, gracias al adaptador hermes fusionado en el cuerpo.
- Razonamiento multi-paso y ejecucion de tareas en terminal, segun el perfil del adaptador hermes (el autor cita SWE-bench Pro y Terminal-Bench medidos sobre la base densa).
- Decodificacion especulativa mediante drafter externo (DFlash2) en el stack TensorFold.
- Multi-token prediction (MTP) integrado en el checkpoint.
- Modo sin thinking configurable en el servicio (`--no-thinking`).
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); no hay evidencia de soporte multilingue adicional en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Agentes de codificacion en terminal: el adaptador hermes esta orientado a tareas de ingenieria de software y ejecucion de comandos; el modelo puede integrarse en bucles de agente que editan ficheros y ejecutan tests, aunque las cifras publicadas del adaptador no se trasladan automaticamente a este build INT4.
- Automatizacion de tool calling en pipelines internos: la fusion del adaptador hermes en el cuerpo permite invocar funciones estructuradas sin un segundo modelo, adecuado para orquestacion de APIs y flujos de datos.
- Servicio de contexto largo en hardware Intel: con 200.000 tokens de contexto y prompt cache de 1 GiB, encaja en escenarios de analisis de repositorios completos o documentos extensos sobre Arc Pro B70.
- Despliegue en infraestructura XPU: para organizaciones con aceleradores Intel Arc Pro B70 que quieran servir un modelo de 27B en INT4 con TensorFold, evitando depender de CUDA.
- Prototipado de agentes con decodificacion especulativa: el uso de un drafter DFlash2 permite medir latencias de extremo a extremo (0,2-0,3 s en peticiones cortas segun el autor) en cargas interactivas.
- Evaluacion de cadenas de cuantizacion: util como caso de estudio de re-cuantizacion GPTQ sobre un modelo ya cuantizado con AutoRound, para investigar la degradacion acumulada de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. El autor indica explicitamente que no se ha re-establecido la perplejidad ni benchmarks downstream tras la re-cuantizacion, y que las cifras de SWE-bench Pro y Terminal-Bench del adaptador hermes se midieron sobre la base densa y no se transfieren automaticamente a este build INT4.

Datos de latencia declarados por el autor (2x Intel Arc Pro B70, una instancia por tarjeta, contexto de 200k): peticiones con prompt corto en torno a 0,2-0,3 s de extremo a extremo; el comportamiento en contexto largo estaba en proceso de medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; un modelo de 27B en INT4 requiere del orden de 14-16 GB solo para pesos, mas overhead de contexto KV y embeddings INT8/BF16, pero el autor no publica cifras.
- GPU recomendadas: Intel Arc Pro B70 (configuracion probada: 2 tarjetas, una instancia por tarjeta). No se ha verificado compatibilidad con A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no determinado; el checkpoint depende del loader parcheado de TensorFold para el fichero INT8 de embeddings, lo que limita su uso fuera de ese runtime.
- Opciones de despliegue: TensorFold XPU (unica opcion probada, con imagen `tensorfold-xpu-b70:hermes-2026.11.24`). vLLM, llama.cpp, Ollama y TGI no estan verificados.
- Latencia y throughput: peticiones cortas en 0,2-0,3 s de extremo a extremo en la configuracion descrita; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-hermes-v1-GPTQ-Int4 (este) | 27B | hasta 200k en servicio | GPTQ INT4 + embeddings INT8 | Swift Open License v1.0 (umbral 1M USD) | Hugging Face, runtime TensorFold XPU |
| ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound (base directa) | 27B | no disponible | AutoRound W4A16 | Swift Open License v1.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base original) | 27B | no disponible | BF16 (sin cuantizar) | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-hermes-adapted (adaptador) | 27B (LoRA sobre base) | no disponible | no aplica (adaptador) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La re-cuantizacion del cuerpo introduce error GPTQ adicional sobre la cuantizacion AutoRound previa de Swift; no se ha medido la degradacion resultante en perplejidad ni en tareas downstream.
- Los numeros de SWE-bench Pro y Terminal-Bench del adaptador hermes se midieron sobre la base densa y no son validos para este checkpoint INT4.
- Solo se ha probado con TensorFold XPU sobre 2x Intel Arc Pro B70; la compatibilidad con otros runtimes no esta establecida y el fichero INT8 de embeddings exige el loader parcheado.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Licencia restrictiva para uso comercial: la Swift Open License v1.0 permite uso comercial solo por debajo de 1M USD de ingresos brutos anuales; por encima se requiere licencia empresarial de Swift.
- Riesgo de alucinacion inherente a modelos de 27B en tareas de agente y tool calling, agravado por la falta de validacion downstream de este build.
- No es una release oficial de UkisAI, Qwen ni harness-hub; la procedencia y el mantenimiento dependen del autor individual del repositorio.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/muni501/Swift-1.5-Qwen3.8-27B-hermes-v1-GPTQ-Int4
- Modelo base directo: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Bake GPTQ con embeddings INT8: https://huggingface.co/Wrapzii/Swift-1.5-Qwen3.8-27b-GPTQ-Int4-baked-v1-embed-int8
- Adaptador de agente hermes: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Runtime TensorFold: https://github.com/ (enlace incompleto en la model card; URL exacta no disponible)
