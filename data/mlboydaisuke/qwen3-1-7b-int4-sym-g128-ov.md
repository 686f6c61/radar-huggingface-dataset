# mlboydaisuke/Qwen3-1.7B-int4-sym-g128-ov

## Resumen

Qwen3-1.7B-int4-sym-g128-ov es una version cuantizada del modelo Qwen/Qwen3-1.7B de Alibaba Qwen, exportada al formato OpenVINO IR por el usuario mlboydaisuke. El objetivo principal es permitir la inferencia de un modelo de lenguaje de 1.700 millones de parametros directamente en la NPU (unidad de procesamiento neuronal) de los procesadores Intel Core Ultra, mediante la libreria OpenVINO GenAI. Se trata, por tanto, de un artefacto de despliegue orientado a la inferencia local en hardware de consumo, no de un modelo entrenado desde cero.

La cuantizacion aplicada es int4 simetrica con group size 128 y ratio 1.0, una configuracion que la guia oficial de OpenVINO GenAI para NPU exige para ejecutar LLM en dicha unidad. Esto la diferencia de la variante oficial OpenVINO/Qwen3-1.7B-int4-ov, que usa int4 asimetrica con ratio 0.8 y no cumple los requisitos de la NPU. El resultado es un repositorio de 1,1 GB que cabe en la memoria compartida de un portatil con Intel Core Ultra y permite generar texto a velocidades de decodificacion cercanas a los 40 tokens por segundo.

El modelo base Qwen3-1.7B forma parte de la familia Qwen3, conocida por su modo de razonamiento explicito (bloques ` thinking`) y su soporte multilingue. Esta version cuantizada hereda esas capacidades, aunque la model card no documenta evaluaciones de calidad tras la cuantizacion, por lo que el rendimiento en tareas complejas debe verificarse caso por caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen3-1.7B; detalles completos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 simetrica (mode int4_sym), group size 128, ratio 1.0, awq False, scale_estimation False, backup_mode int8_asym |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin), exportado con optimum-cli |
| Tamano del repositorio | 1,1 GB |
| Libreria de inferencia | OpenVINO GenAI (LLMPipeline) |
| Hardware objetivo | Intel NPU (probado en Intel Core Ultra 9 386H) |
| Revision del modelo base | Qwen/Qwen3-1.7B revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros desarrollado por Alibaba Qwen. La model card de esta version cuantizada no incluye detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos no estan disponibles en la informacion proporcionada. Qwen3 es conocida por incorporar un modo de razonamiento explicito que genera bloques ` thinking` antes de la respuesta final, comportamiento que se observa en las pruebas registradas.

La innovacion tecnica de este repositorio reside en el proceso de exportacion, no en el entrenamiento. Se utilizo `optimum-cli export openvino` con los parametros `--weight-format int4 --sym --ratio 1.0 --group-size 128`, que producen una cuantizacion simetrica de 4 bits con grupos de 128 pesos. Esta configuracion es la que la guia de OpenVINO GenAI para NPU exige para LLM, ya que la NPU de Intel requiere pesos simetricos con esos parametros concretos. El proceso se realizo con optimum-intel 2.2.0, optimum 2.3.0, nncf 3.4.0, openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, transformers 5.5.4, torch 2.14.0 y Python 3.12.10 sobre Windows 11 Home. Los ficheros del modelo base se verificaron contra los sha256 del Hub antes de la exportacion.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat propia incluida en el repositorio.
- Razonamiento explicito mediante bloques ` thinking`: el modelo genera una linea de pensamiento antes de la respuesta, segun se observa en las pruebas registradas.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base Qwen3-1.7B, aunque no se documentan evaluaciones especificas tras la cuantizacion.
- Soporte multilingue: no confirmado en la informacion proporcionada para esta version cuantizada.
- Tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Inferencia en NPU de Intel: capacidad diferencial de esta exportacion, que permite ejecutar el modelo sin GPU dedicada.
- Modo de generacion codiciosa (greedy) verificado en las pruebas del autor.

## Casos de uso

- Asistentes conversacionales locales en portatiles Intel Core Ultra: el modelo se ejecuta en la NPU con un consumo energetico bajo y sin necesidad de GPU, lo que permite integrarlo en aplicaciones de escritorio que respondan a preguntas en tiempo real. La decodificacion a 40 tokens/s es suficiente para una experiencia conversacional fluida.
- Procesamiento de texto offline con privacidad: al ejecutarse completamente en local, es adecuado para aplicaciones que manejan datos sensibles (notas medicas, documentos legales, correos personales) donde no se puede enviar informacion a servicios en la nube.
- Generacion de borradores y resumenes en herramientas de productividad: con 1,7B de parametros y una ventana de contexto no confirmada, puede redactar resumenes cortos, reescribir parrafos o generar listas a partir de instrucciones breves, integrándose en editores de texto o suites ofimaticas.
- Prototipado rapido de aplicaciones de IA generativa en Windows: al ser un OpenVINO IR listo para `LLMPipeline`, permite a desarrolladores validar flujos de chat, plantillas y prompts sin configurar stacks de GPU ni depender de servicios externos.
- Educacion y demostraciones de IA on-device: sirve para ilustrar en talleres o clases como funciona la inferencia en NPU, con metricas medibles de latencia, memoria y velocidad de decodificacion (3.001 MiB de working set, 1,8-2,1 s de carga en caliente).
- Automatizacion de tareas de texto en entornos con recursos limitados: en equipos sin GPU dedicada, el modelo puede clasificar, extraer o transformar texto en lotes pequenos, siempre que las tareas no exijan razonamiento complejo ni contextos largos.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir el impacto de int4 simetrica frente a int4 asimetrica en la calidad de las respuestas de Qwen3-1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento de inferencia en una NPU concreta:

| Metrica | Valor |
|---|---|
| Equipo de prueba | Intel Core Ultra 9 386H, NPU driver 32.0.100.4841, Windows 11 Home build 26200.9711, 31,5 GB RAM |
| Decodificacion en frio | 38,4 tokens/s (mediana de 2 ejecuciones, dispersion 0,5 %) |
| Decodificacion en caliente | 40,1 tokens/s |
| Prefill en frio | 10,3 tokens/s, 1847 ms hasta el primer token |
| Working set maximo | 3.001 MiB |
| Tiempo de carga | 5,6 s en la primera ejecucion; 1,8 y 2,1 s en las siguientes (con la misma CACHE_DIR) |
| Verificacion de salida | 6/6 PASS (comprobacion de texto de edge-llm-bench) |
| Tokens nuevos por respuesta | 128, 128 |
| Primera carga registrada | 48,3 s (raw/diag/q17.log, 2026-11-07) |

## Requisitos de hardware

- VRAM / memoria: el modelo ocupa 1,1 GB en disco y su working set medido es de 3.001 MiB. Al ejecutarse en NPU, utiliza memoria compartida del sistema, no VRAM dedicada.
- GPU recomendadas: no aplica para el objetivo principal; el modelo esta optimizado para NPU de Intel. Puede ejecutarse en CPU o GPU Intel via OpenVINO, pero no se proporcionan mediciones para esos casos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada. Al ser un formato OpenVINO IR, no es directamente compatible con CUDA ni con llama.cpp.
- Hardware verificado: Intel Core Ultra 9 386H con NPU driver 32.0.100.4841 y 31,5 GB de RAM.
- Opciones de despliegue: OpenVINO GenAI mediante `LLMPipeline(<carpeta>, "NPU", CACHE_DIR=<dir>)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,1 tokens/s en decodificacion en caliente, 1847 ms hasta el primer token en prefill en frio, carga en caliente de 1,8-2,1 s.
- Almacenamiento: 1,1 GB para los pesos en int4.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-int4-sym-g128-ov (este) | 1,7B | int4 simetrica, g128, ratio 1.0 | OpenVINO IR | NPU Intel | apache-2.0 |
| OpenVINO/Qwen3-1.7B-int4-ov | 1,7B | int4 asimetrica, g128, ratio 0.8 | OpenVINO IR | CPU/GPU Intel (no cumple requisitos NPU) | apache-2.0 |
| Qwen/Qwen3-1.7B (original) | 1,7B | sin cuantizar (FP16/BF16) | safetensors | GPU generica | apache-2.0 |

La diferencia clave frente a la variante oficial de OpenVINO es la simetria de la cuantizacion y el ratio 1.0, que habilitan la ejecucion en NPU. Frente al modelo original, esta version sacrifica precision numerica a cambio de un tamano reducido (1,1 GB) y de la capacidad de ejecutarse en hardware sin GPU dedicada. No se dispone de datos de calidad comparativa entre estas tres variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad tras la cuantizacion int4, por lo que se desconoce la degradacion real en tareas de razonamiento, codigo o matematicas.
- El modelo base tiene 1,7B de parametros, lo que limita su capacidad en tareas complejas frente a modelos de mayor tamano. Es adecuado para tareas simples o moderadas, no para razonamiento avanzado.
- En las pruebas registradas, con 128 tokens nuevos todas las respuestas terminan dentro del bloque ` thinking`, sin llegar a cerrarlo. Esto sugiere que el modelo puede consumir el presupuesto de generacion en el razonamiento interno si no se ajusta el limite de tokens o el prompt.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Los idiomas soportados no estan confirmados para esta version cuantizada.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-1.7B y de las herramientas de exportacion utilizadas.
- El formato OpenVINO IR limita el despliegue a entornos Intel con OpenVINO GenAI; no es portable a ecosistemas CUDA, ROCm o llama.cpp sin conversion adicional.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que no cuenta con validacion de la comunidad.
- Las mediciones de rendimiento provienen de una unica sesion en un unico portatil, por lo que no deben generalizarse a otros equipos con NPU Intel.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-int4-sym-g128-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante oficial OpenVINO: https://huggingface.co/OpenVINO/Qwen3-1.7B-int4-ov
- Guia de OpenVINO GenAI para NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Repositorio de benchmarks edge-llm-bench: https://github.com/john-rocky/edge-llm-bench
- Repositorio windows-llm-zoo: https://github.com/john-rocky/windows-llm-zoo
- Registro de resultados: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/results/Qwen3-1.7B/openvino-genai_npu_npu-sym-g128.json
- Script de ejecucion: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/pc/run_ovgenai.py
- Log de diagnostico: https://github.com/john-rocky/windows-llm-zoo/blob/894114e9bdc9346ce66927d667a6743a12df190c/raw/diag/q17.log
