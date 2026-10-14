# LiquidAI/LFM2.5-24B-A2B-ONNX

## Resumen

LFM2.5-24B-A2B-ONNX es la distribucion en formato ONNX del modelo LFM2.5-24B-A2B, desarrollado por Liquid AI. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) orientado a razonamiento, con 24.000 millones de parametros totales y solo 2.000 millones de parametros activos por token. Es el modelo mas grande de la familia LFM2.5 y esta disenado explicitamente para ejecutar agentes privados en local, con baja latencia y sin depender de servicios en la nube.

La relevancia de esta variante concreta esta en el empaquetado: Liquid AI publica los pesos en formato ONNX listos para onnxruntime-genai, con cinco niveles de precision (FP32, FP16, Q8, Q4 y Q4F16) y tamanos que van desde los 13,7 GB del Q4F16 hasta los 48,0 GB del FP16. Esto permite desplegar un MoE de 24B en hardware de consumo o en servidores con GPU, eligiendo el equilibrio entre calidad y huella de memoria. El repositorio ocupa 200,1 GB porque incluye todas las variantes y sus ficheros de pesos fragmentados.

El modelo base soporta diez idiomas (ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano) y se distribuye bajo la licencia LFM 1.0. Esta version ONNX hereda esas caracteristicas y esta pensada para inferencia local en CPU y CUDA, no para navegador, ya que su tamano lo hace inviable en WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) de tipo transformer, etiquetada como `lfm2_moe` |
| Parametros totales | 24.000 millones (24B) |
| Parametros activos | 2.000 millones (2B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, Q8, Q4 y Q4F16 |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano |
| Licencia | LFM 1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | ONNX (ficheros `.onnx` con pesos fragmentados en `.onnx_data`) |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo MoE de razonamiento: 24B parametros totales con 2B activos por token, lo que reduce el coste computacional por token frente a un denso del mismo tamano. La etiqueta de arquitectura es `lfm2_moe` y la familia es LFM2.5. La model card de esta variante ONNX remite a la model card del modelo base (`LiquidAI/LFM2.5-24B-A2B`) para los detalles completos de arquitectura y entrenamiento.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas de atencion o decodificacion. Esta variante concreta es una exportacion a ONNX del modelo base, optimizada para onnxruntime-genai, por lo que su "entrenamiento" es el del modelo original y el trabajo adicional es de conversion y cuantizacion.

## Capacidades

- Generacion de texto conversacional en diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Razonamiento: el modelo se describe explicitamente como "reasoning model", orientado a tareas que requieren cadenas de pensamiento.
- Ejecucion de agentes en dispositivo ("fast, private agents on-device"), pensado para flujos locales con datos que no salen del equipo.
- Inferencia en CPU y CUDA mediante onnxruntime-genai, con cinco variantes de precision seleccionables.
- Soporte de plantilla de chat conversacional (la model card usa `apply_chat_template` y un fichero `.jinja` de plantilla).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline declarado es `text-generation`.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes locales con datos sensibles: al ejecutarse con onnxruntime-genai en CPU o GPU local, el modelo permite construir asistentes que procesan informacion confidencial sin enviarla a un servicio externo, apoyandose en sus 2B parametros activos por token para mantener la latencia baja.
- Despliegue en portatiles y equipos de sobremesa: con la variante Q4 (aproximadamente 15,3 GB) el modelo cabe en equipos con suficiente RAM o en GPU de gama alta, lo que habilita asistentes de escritorio sin conexion.
- Inferencia en servidores solo CPU: las variantes Q4 y Q8 estan recomendadas para CPU, de modo que se puede servir el modelo en infraestructura sin GPU cuando la latencia no es critica.
- Atencion al cliente multilingue: con soporte de diez idiomas, se puede desplegar un asistente que atienda consultas en espanol, ingles, frances, aleman o portugues sin cambiar de modelo.
- Procesamiento por lotes en servidor con GPU: la variante FP16 (aproximadamente 48,0 GB) sobre CUDA es adecuada para pipelines de generacion de texto de mayor calidad donde el coste de memoria no es limitante.
- Asistentes embebidos en aplicaciones de escritorio o entornos de escritorio empresarial: al distribuirse como ONNX, el modelo se integra en aplicaciones .NET, Python o C++ que ya usen onnxruntime.
- Prototipado rapido de agentes: la existencia de variantes ligeras (Q4F16, 13,7 GB) permite iterar en una unica GPU de 24 GB antes de escalar a la variante FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante ONNX no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas, y remite al modelo base para obtener mas detalles.

## Requisitos de hardware

- VRAM estimada segun variante (tamanos de fichero indicados por el autor):
  - Q4F16: aproximadamente 13,7 GB, recomendada para CUDA.
  - Q4: aproximadamente 15,3 GB, recomendada para CPU (opcion por defecto).
  - Q8: aproximadamente 27,1 GB, recomendada para CPU.
  - FP16: aproximadamente 48,0 GB, recomendada para CUDA.
  - FP32: incluida en el repositorio, tamano no disponible.
- GPU recomendadas: para Q4F16 y Q4, tarjetas con 16-24 GB (por ejemplo RTX 4090 o equivalentes); para Q8, tarjetas con 32 GB o mas; para FP16, GPU de 48 GB o mas (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- ¿Cabe en GPU de consumo? Q4F16 (13,7 GB) y Q4 (15,3 GB) si, en tarjetas de 16-24 GB. Q8 (27,1 GB) queda fuera de la mayoria de GPUs de consumo salvo modelos con 32 GB. FP16 no cabe en una GPU de consumo.
- Opciones de despliegue: onnxruntime-genai (CPU y CUDA), y de forma general cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp o TGI en la informacion disponible.
- WebGPU: descartado explicitamente por el autor; el modelo es demasiado grande para inferencia en navegador.
- Latencia y throughput: no disponible.
- Nota de despliegue: los pesos estan fragmentados en ficheros `model*.onnx_data`, que deben colocarse junto a su fichero `.onnx` correspondiente.

## Comparativa con modelos similares

La informacion disponible permite comparar las variantes del propio repositorio y con el modelo base, pero no incluye datos de modelos de terceros.

| Modelo / variante | Parametros | Precision / tamano | Plataforma | Licencia |
|---|---|---|---|---|
| LFM2.5-24B-A2B-ONNX Q4F16 | 24B totales, 2B activos | ~13,7 GB | CUDA | LFM 1.0 |
| LFM2.5-24B-A2B-ONNX Q4 | 24B totales, 2B activos | ~15,3 GB | CPU | LFM 1.0 |
| LFM2.5-24B-A2B-ONNX Q8 | 24B totales, 2B activos | ~27,1 GB | CPU | LFM 1.0 |
| LFM2.5-24B-A2B-ONNX FP16 | 24B totales, 2B activos | ~48,0 GB | CUDA | LFM 1.0 |
| LFM2.5-24B-A2B (base) | 24B totales, 2B activos | no disponible | no disponible | LFM 1.0 |

Comparativa con modelos de terceros de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: no hay informacion especifica sobre tasas de alucinacion; como modelo generativo de razonamiento, existe riesgo de afirmaciones incorrectas, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Contexto: no se especifica la longitud de contexto soportada. En los ejemplos de la model card se configura `max_length=4096`, pero es un parametro de generacion de ejemplo y no debe interpretarse como el limite del modelo.
- Idioma: aunque se declaran diez idiomas, no se detalla el rendimiento relativo entre ellos; el ingles suele ser el idioma mejor cubierto en modelos de este tipo, aunque esto no se confirma en la informacion dada.
- Licencia: se distribuye bajo la licencia LFM 1.0 con el campo `license: other`. Es imprescindible revisar el fichero `LICENSE` del repositorio antes de cualquier uso comercial, ya que las condiciones concretas no se detallan en la informacion proporcionada.
- Despliegue: esta variante es especifica para ONNX y onnxruntime-genai; no es directamente interoperable con otros formatos sin conversion adicional. El modelo no es apto para WebGPU.
- Tamanos de fichero: el repositorio completo ocupa 200,1 GB, por lo que conviene descargar solo la variante necesaria usando patrones de seleccion en el cliente de Hugging Face.
- Fecha de publicacion: el repositorio figura como creado el 2026-10-09 y actualizado el 2026-10-13, con muy pocas descargas (2) en el momento de la consulta; la comunidad aun no ha validado su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX/blob/main/LICENSE
