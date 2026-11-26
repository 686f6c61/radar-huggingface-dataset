# ktfth/smolmoe-web

## Resumen

`ktfth/smolmoe-web` no es un modelo entrenado desde cero, sino un repositorio de distribucion de pesos en formato `.smoe` (SMOEQ8 v3) para el runtime de inferencia `smolmoe`, escrito en C99 y ejecutable en navegador mediante WebAssembly o de forma nativa en Windows, Linux y macOS. El objetivo es permitir inferencia local en CPU sin que los datos del usuario abandonen su equipo, lo que lo hace relevante para aplicaciones web con requisitos estrictos de privacidad y despliegue sin GPU.

El paquete incluye dos modelos convertidos desde checkpoints oficiales: `qwen2.5-0.5b-instruct-q8.smoe` (derivado de Qwen/Qwen2.5-0.5B-Instruct, 560,1 MB) y `deepseek-r1-distill-qwen-1.5b-q8.smoe` (derivado de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, 2.003,7 MB). Ambos se cuantizan a Q8 en bloques de 32 con perdida, partiendo del checkpoint oficial en BF16 verificado por SHA-256 sobre una revision fijada.

El repositorio tambien incluye un directorio `prompts/` con caches KV del prompt de sistema precalculados, de modo que el runtime carga los bytes en lugar de reprocesar el prompt. Es una solucion orientada a demos y aplicaciones ligeras en navegador, no a cargas de produccion de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5 0.5B y DeepSeek-R1-Distill-Qwen 1.5B, ambos densos) |
| Parametros totales | 0,5 B (Qwen2.5-0.5B-Instruct) y 1,5 B (DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros activos | no disponible (no son MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 en bloques de 32, con perdida (SMOEQ8 v3) |
| Idiomas soportados | portugues (pt) e ingles (en) |
| Licencia | Apache-2.0 y MIT (segun modelo de origen; ver README) |
| Formato de pesos | `.smoe` autocontenido (config y tokenizer embebidos); origen BF16 safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: distribuye conversiones de dos checkpoints existentes. El primero es Qwen2.5-0.5B-Instruct (revision `eaa56b50`), un transformer decoder-only denso de 0,5 mil millones de parametros con licencia Apache-2.0. El segundo es DeepSeek-R1-Distill-Qwen-1.5B (revision `ad9f0ae0`), un transformer denso de 1,5 mil millones de parametros destilado desde DeepSeek-R1 sobre la base Qwen2.5-Math-1.5B, con licencia MIT y herencia Apache-2.0 del modelo base.

La innovacion tecnica del paquete reside en el formato y el runtime: cuantizacion Q8 por bloques de 32 con perdida, pesos autocontenidos con config y tokenizer embebidos, y un runtime en C99 que compila a WebAssembly y produce bytes identicos entre la version nativa y la WASM. El directorio `prompts/` almacena caches KV del prompt de sistema, lo que evita minutos de preprocesado en el navegador. No se documentan datos de entrenamiento, tokens vistos ni procesos de RLHF/DPO propios, ya que corresponden a los modelos de origen.

## Capacidades

- Generacion de texto conversacional e instrucciones (Qwen2.5-0.5B-Instruct).
- Razonamiento paso a paso con modo ` thinking` en el modelo DeepSeek-R1-Distill-Qwen-1.5B, que razona antes de responder.
- Soporte multilingue limitado a portugues e ingles; el propio autor advierte que el modelo DeepSeek es debil en hechos en portugues.
- Ejecucion local en CPU dentro del navegador via WebAssembly, sin envio de datos a servidores.
- Ejecucion nativa en Windows, Linux y macOS.
- Carga de caches KV precalculados para el prompt de sistema.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente conversacional privado en navegador: el modelo Qwen2.5-0.5B-Instruct puede gestionar dialogos multi-turno enteramente en el cliente, de modo que ninguna entrada del usuario abandona su equipo.
- Demostraciones educativas de inferencia LLM: el runtime WASM permite mostrar el funcionamiento de un transformer en una pagina web sin backend ni GPU.
- Razonamiento matematico ligero en el cliente: el modelo DeepSeek-R1-Distill-Qwen-1.5B, con su modo ` thinking`, sirve para resolver problemas paso a paso en aplicaciones de aprendizaje.
- Prototipado de aplicaciones offline-first: al ejecutarse en CPU y con pesos autocontenidos, el paquete se integra en entornos sin conectividad o con requisitos de residencia de datos.
- Herramientas de escritorio multiplataforma: el runtime nativo en Windows, Linux y macOS permite empaquetar el modelo en utilidades de linea de comandos o aplicaciones de escritorio.
- Evaluacion de tecnicas de cuantizacion: el formato SMOEQ8 v3 con bloques de 32 y caches KV precalculados sirve como referencia para estudiar el equilibrio entre tamano y calidad en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el runtime esta disenado para CPU.
- RAM estimada: en torno a 560 MB para el modelo Qwen2.5-0.5B Q8 y unos 2 GB para el DeepSeek-R1-Distill-Qwen-1.5B Q8, mas el espacio de la cache KV y el overhead del runtime.
- GPU recomendadas: no aplica; no se documenta aceleracion por GPU.
- Compatibilidad con GPU de consumo: no aplica, el diseno es CPU-first.
- Opciones de despliegue: runtime `smolmoe` (C99) compilado a WebAssembly para navegador o binario nativo para Windows, Linux y macOS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| ktfth/smolmoe-web (Qwen2.5-0.5B Q8) | 0,5 B | no disponible | `.smoe` | Apache-2.0 | CPU / WASM |
| ktfth/smolmoe-web (DeepSeek-R1-Distill-Qwen-1.5B Q8) | 1,5 B | no disponible | `.smoe` | MIT / Apache-2.0 | CPU / WASM |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | no disponible | safetensors | Apache-2.0 | GPU / CPU (via frameworks) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible | safetensors | MIT | GPU / CPU (via frameworks) |

## Limitaciones y advertencias

- El modelo DeepSeek-R1-Distill-Qwen-1.5B es debil en hechos en portugues, segun advierte el propio autor.
- La cuantizacion Q8 en bloques de 32 es con perdida, por lo que puede degradar la calidad respecto al checkpoint BF16 original.
- El soporte de idiomas se limita a portugues e ingles; no se documenta castellano.
- Riesgo de alucinacion inherente a modelos de 0,5 B y 1,5 B parametros, especialmente en tareas factuales.
- La licencia es mixta (Apache-2.0 y MIT segun el modelo de origen); es necesario revisar `LICENSE-Qwen.txt` y `LICENSE-DeepSeek.txt` antes de uso comercial.
- El runtime esta orientado a CPU y navegador; no se documenta rendimiento para cargas concurrentes o de alto throughput.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha, lo que indica un proyecto reciente y sin validacion comunitaria.
- El campo `pipeline` no esta disponible, por lo que no se declara una tarea estandar de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ktfth/smolmoe-web
- Demo del runtime: https://smolmoe.aldeia-viva.com.br
- Modelo de origen Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo de origen DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Licencia Qwen: https://huggingface.co/ktfth/smolmoe-web/blob/main/LICENSE-Qwen.txt
- Licencia DeepSeek: https://huggingface.co/ktfth/smolmoe-web/blob/main/LICENSE-DeepSeek.txt
