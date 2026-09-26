# jsbaicenter/Aztec-Coder-4B-NVFP4

## Resumen

Aztec-Coder-4B-NVFP4 es un modelo de generacion de texto orientado a codificacion agentica, desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI) de la San Diego State University. Se obtiene por fine-tuning de Qwen/Qwen3.5-4B y su proposito es resolver tareas de ingenieria de software de extremo a extremo: explorar un repositorio, leer el codigo que falla, escribir un parche, ejecutar los tests en un contenedor aislado y verificar la correccion antes de dar la respuesta por buena. La variante aqui descrita aplica cuantizacion NVFP4 W4A4 (pesos y activaciones a 4 bits, tamano de grupo 16) mediante NVIDIA ModelOpt, lo que reduce la huella a aproximadamente 5 GB de VRAM y permite ejecutarla en una GPU de consumo.

El modelo declara 3.073.289.216 parametros reales (comercializado como "4B") y una ventana de contexto de 131.072 tokens en la configuracion de ejemplo publicada. La relevancia actual del lanzamiento esta en el eje capacitad/tamano: segun la model card, la codificacion agentica de este nivel habia requerido hasta ahora modelos de 27B o mas, mientras que esta variante cabe en hardware de portatil. Frente al modelo base, el fine-tuning eleva la resolucion de bugs no vistos del 10,1% al 82,9% en BF16, aunque la cuantizacion NVFP4 rebaja ese resultado al 38,0% en el subconjunto de 32 instancias empleado para las comparaciones.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte nativo en vLLM a traves del backend modelopt. La organizacion mantiene ademas la release BF16 (Aztec-Coder-4B) y anuncia una cabeza de decodificacion especulativa MTP, asi como una futura variante W4A16 de mayor calidad de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso derivado de Qwen3.5 (arquitectura `qwen3_5_text` en transformers) |
| Parametros totales | 3.073.289.216 (etiquetado comercialmente como 4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de ejemplo con vLLM (`max_model_len=131072`) |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones a 4 bits, group size 16, calibrado con 512 muestras de la distribucion de entrenamiento); variante W4A16 prevista |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cuantizado con NVIDIA ModelOpt (`quantization="modelopt"`) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder denso construido sobre Qwen3.5-4B, con plantilla de chat Qwen3.5, pensamiento intercalado (interleaved thinking) y parser de razonamiento `qwen3` en vLLM, ademas del formato de tool calling `qwen3_coder`. Sobre esa base, la release NVFP4 aplica cuantizacion de pesos y activaciones a 4 bits en formato NVFP4 con tamano de grupo 16, calibrada con 512 muestras extraidas de la propia distribucion de entrenamiento del modelo. La model card indica que esta variante reduce la huella aproximadamente un 40% respecto a BF16, a costa de capacidad de codificacion real (Live-60 baja del 21,7% al 15,0%).

El entrenamiento se estructuro en tres fases. En la primera, el modelo frontera GLM-5.3 (744B) genero cerca de 1.875 trayectorias de codificacion, cada una verificada ejecutando la suite de tests real antes de aceptarla; estas demostraciones ensenan el formato de la codificacion agentica (uso de herramientas, cuando ejecutar tests, que constituye una solucion valida). En la segunda, se aplico aprendizaje por refuerzo sobre 237 problemas de ingenieria de software seleccionados por ser resolubles de forma intermitente; se realizaron 145 lotes de GRPO on-policy en los que solo se reforzaron los intentos que hacian pasar los tests ocultos, sin datos estaticos. En la tercera, se ejecutaron comprobaciones de generalizacion en cada frontera de fase sobre problemas nunca vistos. La mezcla de datos incluye una porcion del dataset NVIDIA Nemotron-Post-Training-Dataset-v2 (instrucciones generales, salidas estructuradas y uso de herramientas), el conjunto semilla destilado de GLM-5.3 y varios conjuntos abiertos de problemas de SWE que alimentaron el pool de practica del RL.

## Capacidades

- Codificacion agentica de extremo a extremo: explorar un repositorio, localizar el bug, escribir un parche y verificar la correccion ejecutando los tests dentro de un contenedor aislado.
- Razonamiento intercalado entre llamadas a herramientas (thinking mode con parser `qwen3` en vLLM).
- Tool calling y function calling con el formato `qwen3_coder`.
- Ejecucion de comandos y edicion de ficheros como parte del bucle de agente.
- Autoverificacion: el modelo comprueba sus propios arreglos antes de darlos por validos.
- Seguimiento de instrucciones (IFEval 86,37 en la variante NVFP4, ligeramente por encima del modelo base).
- Razonamiento general y conocimiento multidisciplinar moderado (MMLU-Pro 66,85% en NVFP4).
- Salidas estructuradas, segun la composicion del dataset Nemotron v2 empleado en el ajuste.
- Capacidades multilingues: no disponible (no se documentan en la model card).
- Vision y audio: no soportados (pipeline text-generation).

## Casos de uso

- Resolucion automatica de issues en CI: el modelo puede integrarse en un pipeline que, ante un test fallido, explore el repositorio, proponga un parche y lo valide ejecutando la suite antes de abrir un pull request, usando el bucle de verificacion por tests que se uso durante el RL.
- Agente de mantenimiento de repositorios: tareas de refactorizacion acotada y correccion de errores en codebases medianas que quepan en la ventana de 131.072 tokens, con lectura de ficheros y ejecucion de comandos en sandbox.
- Asistente de desarrollo en portatil: al ocupar unos 5 GB de VRAM en NVFP4, puede desplegarse localmente en un equipo con GPU de consumo para tareas de codificacion asistida sin enviar codigo propietario a servicios externos.
- Reparacion de dependencias y actualizacion de APIs: el modelo explora el arbol de dependencias, edita los puntos de llamada y ejecuta los tests para confirmar que la migracion no rompe nada.
- Generacion de parches con justificacion: su razonamiento intercalado permite emitir, junto al diff, la traza de por que se eligio ese cambio, util para revision humana posterior.
- Automatizacion de tareas de ingenieria en contenedores: dado que el bucle de agente se ajusto para entornos sandbox, encaja en plataformas de evaluacion tipo SWE-bench o Terminal-Bench con ejecucion aislada.
- Prototipado de agentes con tool calling: como soporta el formato `qwen3_coder`, sirve para desarrollar y depurar orquestaciones de agentes antes de escalar a modelos mayores.
- Filtrado previo en pipelines de revision de codigo: por su coste bajo de inferencia, puede usarse como primera pasada que descarta parches triviales o mal formados antes de pasar a un modelo mayor.

## Benchmarks y rendimiento

Datos publicados en la model card. La fila de generalizacion corresponde a 121 bugs reales no vistos durante el entrenamiento, verificados ejecutando la suite de tests oculta de cada proyecto. La cifra marcada con asterisco para NVFP4 corresponde a 12/32 en un subconjunto de 32 instancias (el mismo corte empleado en las comparaciones internas).

| Benchmark | Qwen3.5-4B (base) | Aztec-Coder-4B (BF16) | Aztec-Coder-4B-NVFP4 |
|---|---|---|---|
| Generalization test (121 bugs no vistos, tests ejecutados) | 10,1% | 82,9% | 38,0%* |
| Live-60 (60 tareas reales resueltas de extremo a extremo en contenedores) | 15,0% | 21,7% | 15,0% |
| Instruction-following (IFEval) | 84,66 | 87,21 | 86,37 |
| MMLU-Pro | 64,0% | 70,0% | 66,85% |
| Terminal-Bench 1.0 (core, 80 tareas) | 33,8% | 33,8% | 18,8% |

Notas de la model card: la cuantizacion NVFP4 conserva el seguimiento de instrucciones dentro de aproximadamente un punto del BF16, pero sacrifica capacidad de codificacion real (Live-60 cae de 21,7% a 15,0% y la generalizacion se reduce a la mitad). Terminal-Bench 2.1 y futuras adiciones de benchmarks se evaluan sobre la release BF16. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM en NVFP4 W4A4: aproximadamente 5 GB, segun la model card, incluyendo pesos y sobrecarga de ejecucion.
- VRAM en BF16 (referencia de la release no cuantizada): los pesos de 3,07B parametros ocupan unos 6,2 GB en 16 bits; con cache KV y activaciones para contextos largos, la estimacion practica se situa claramente por encima de los 8 GB. Dato no publicado por el autor: se trata de una estimacion.
- GPU de consumo: la variante NVFP4 esta disenada para caber en GPU de portatil y de sobremesa; es el principal argumento de la release.
- GPU profesionales: A100, H100 o similares pueden ejecutar la release BF16 con comodidad, pero el formato NVFP4 esta pensado para el camino de aceleracion FP4 de la generacion Blackwell de NVIDIA. La model card no detalla la lista de GPUs compatibles, por lo que este extremo debe verificarse antes de desplegar (no disponible).
- Despliegue: vLLM con `quantization="modelopt"`, que es el ejemplo de uso publicado. Al ser un formato de pesos safetensors compatible con transformers, tambien puede cargarse a traves de la libreria transformers; no se documentan recetas para llama.cpp, Ollama ni TGI en la informacion disponible.
- Parametros de muestreo recomendados: temperatura 1,0 y top_p 0,95.
- Latencia y throughput: no disponibles. La organizacion anuncia una cabeza de decodificacion especulativa MTP para acelerar la inferencia en la release BF16.
- Contexto largo: el ejemplo publicado fija `max_model_len=131072`; el consumo de cache KV a esa longitud no esta cuantificado en la informacion disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de benchmarks de modelos de terceros de la misma categoria, por lo que la comparacion se limita a las variantes de la propia familia, que comparten arquitectura y datos de entrenamiento.

| Modelo | Parametros | Contexto | Generalization test | Live-60 | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Aztec-Coder-4B-NVFP4 (W4A4) | 3,07B | 131.072 tokens (config. de ejemplo) | 38,0%* | 15,0% | 86,37 | apache-2.0 | HuggingFace |
| Aztec-Coder-4B (BF16) | 3,07B | no disponible | 82,9% | 21,7% | 87,21 | apache-2.0 (segun base) | HuggingFace, misma organizacion |
| Qwen3.5-4B (modelo base) | ~4B (no confirmado) | no disponible | 10,1% | 15,0% | 84,66 | no disponible | HuggingFace |
| Aztec-Coder-4B W4A16 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | anunciada, pendiente de publicacion |

Alternativas externas de codificacion agentica de 4B con datos publicos comparables: no disponible.

## Limitaciones y advertencias

- La cuantizacion NVFP4 degrada la capacidad de codificacion de forma notable: la generalizacion cae de 82,9% a 38,0% y Live-60 de 21,7% a 15,0%. Para uso serio en produccion, la release BF16 es la opcion recomendada por el propio autor.
- Tamano de conocimiento limitado: un modelo de 4B no cubre hechos poco frecuentes ni razonamiento de dominio muy especializado, terreno en el que siguen ganando modelos mayores.
- El bucle de agente se ajusto especificamente para entornos de contenedor con sandbox; otros contextos de despliegue no han sido probados.
- El comportamiento de seguridad procede del modelo base: la fase de RL optimizo unicamente el paso de tests, sin entrenamiento especifico de seguridad. Debe anadirse capa de moderacion si el modelo va a operar sobre repositorios reales.
- Riesgo de alucinacion en explicaciones y diffs: el modelo puede describir cambios que no ha aplicado o consecuencias que no se derivan del parche. La verificacion por ejecucion de tests es el mecanismo de control previsto.
- Idiomas soportados no documentados: la model card no declara cobertura multilingue, pese a que el modelo base Qwen3.5 es multilingue. No debe asumirse paridad con el base.
- Compatibilidad hardware del formato NVFP4 no documentada: conviene validar el soporte FP4 en la GPU objetivo antes de planificar el despliegue.
- Datos ausentes en la informacion disponible: tamano de contexto nativo declarado por el autor, consumo de VRAM a contexto maximo, latencia, throughput y lista de GPUs validadas.
- Discrepancia de nomenclatura: los resultados de busqueda muestran releases de la misma organizacion bajo el nombre JSBAI-Coder-4B, mientras que el repositorio consultado usa Aztec-Coder-4B-NVFP4. Conviene verificar que se esta descargando la variante correcta antes de integrarla.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe aun validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbaicenter/Aztec-Coder-4B-NVFP4
- Release BF16 y variantes relacionadas (resultados de busqueda): https://huggingface.co/jsbaicenter/JSBAI-Coder-4B y https://huggingface.co/jsbaicenter/JSBAI-Coder-4B-NVFP4
- Organizacion en GitHub: https://github.com/JSBAICenter
- Dataset de post-entrenamiento empleado: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- NVIDIA ModelOpt (herramienta de cuantizacion): https://github.com/NVIDIA/Model-Optimizer
- Familia NVIDIA Nemotron 3 (referencia de modelos agenticos abiertos): https://research.nvidia.com/labs/nemotron/Nemotron-3/
- OrcaRouter, pasarela compatible con OpenAI mencionada en los resultados de busqueda: https://www.orcarouter.ai/
