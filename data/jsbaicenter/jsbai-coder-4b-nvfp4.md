# jsbaicenter/JSBAI-Coder-4B-NVFP4

## Resumen

JSBAI-Coder-4B-NVFP4 es un modelo de generacion de texto especializado en codigo agentico, desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI) de la San Diego State University. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-4B (etiqueta de arquitectura `qwen3_5_text`) cuyo objetivo es resolver bugs reales en repositorios de software: explorar el codigo, leer el fallo, escribir un parche y ejecutar la suite de tests para verificar la correccion dentro de un contenedor aislado. El checkpoint publicado cuenta con 3.073.289.216 parametros segun los safetensors, aunque se comercializa bajo la denominacion "4B" heredada del modelo base.

El problema que aborda es el coste de hardware del codigo agentico: segun el autor, este nivel de autonomia habia requerido hasta ahora modelos de 27B de parametros o mas, mientras que esta variante cuantizada en NVFP4 esta pensada para ejecutarse en un portatil con unos 5 GB de VRAM. La cuantizacion se ha realizado con NVIDIA ModelOpt y el modelo se distribuye bajo licencia Apache-2.0.

La relevancia actual del lanzamiento esta en su metodologia de entrenamiento (demostraciones destiladas verificadas con tests + RL on-policy sobre bugs reales) y en sus resultados declarados: pasa del 10,1% al 82,9% de exito en un conjunto reservado de 121 bugs no vistos durante el entrenamiento, y conserva o mejora la puntuacion de IFEval del modelo base (84,66 a 87,21). Los resultados especificos de esta variante NVFP4 aun no estan publicados: la model card los marca como "TBD (running now)".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B (etiqueta `qwen3_5_text`); detalles internos de capas y atencion no disponibles |
| Parametros totales | 3.073.289.216 (~3,07 mil millones) segun safetensors; denominado "4B" por herencia del modelo base |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 131.072 tokens (valor de `max_model_len` recomendado en el ejemplo de vLLM de la model card) |
| Tipos de cuantizacion | NVFP4 (esta variante, cuantizada con NVIDIA ModelOpt); existe lanzamiento en BF16 completo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, cuantizacion ModelOpt (`quantization="modelopt"` en vLLM) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un ajuste fino de Qwen/Qwen3.5-4B, un transformer de la familia Qwen3.5 con template de chat propio. No se publican en la informacion disponible detalles sobre el numero de capas, el tipo de atencion, la dimension oculta ni si incorpora innovaciones arquitectonicas respecto al base. La tag `qwen3_5_text` confirma que se reutiliza la arquitectura de texto del base sin cambios estructurales declarados. El modelo emplea el template de chat de Qwen3.5 con pensamiento intercalado (reasoning entre llamadas a herramientas), el parser de razonamiento `qwen3` de vLLM y el formato de tool calling `qwen3_coder`.

El entrenamiento se estructura en tres fases descritas por el autor. La primera son demostraciones semilla: aproximadamente 1.875 trayectorias de codigo generadas por GLM-5.3 (Z.AI), un modelo frontera de 744B servido localmente, cada una verificada ejecutando la suite de tests real antes de aceptarla; esta fase ensena el formato del trabajo agentico (uso de herramientas, cuando ejecutar tests, que constituye una solucion valida). La segunda es aprendizaje por refuerzo sobre 237 problemas de ingenieria de software seleccionados (resolubles de forma intermitente por el modelo), con 145 lotes de GRPO on-policy donde solo los intentos que hacian pasar los tests ocultos generaban senal de entrenamiento; esta fase no uso datos estaticos. La tercera es una comprobacion de generalizacion en cada frontera de fase, con re-evaluacion sobre problemas nunca vistos. Los datos generales de instrucciones, salida estructurada y uso de herramientas provienen de NVIDIA Nemotron-Post-Training-Dataset-v2, complementados con conjuntos abiertos de problemas de ingenieria de software.

## Capacidades

- Generacion de texto conversacional con template de chat de Qwen3.5.
- Codigo agentico: exploracion de repositorios, localizacion de bugs, redaccion de parches y verificacion ejecutando tests.
- Razonamiento intercalado entre llamadas a herramientas (pensamiento antes de cada accion).
- Tool calling / function calling con el formato `qwen3_coder`.
- Ejecucion de comandos en entornos sandbox de contenedor como parte del bucle agentico.
- Salida estructurada (capacidad anclada con datos de Nemotron v2).
- Seguimiento de instrucciones: 87,21 en IFEval segun la version BF16 del modelo.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la informacion proporcionada).
- Vision y audio: no disponibles (modelo de texto).

## Casos de uso

- Resolucion automatica de bugs en CI: integrado en un runner, el modelo recibe el fallo de la suite de tests, explora el repositorio, propone un parche y lo valida ejecutando los tests en un contenedor antes de abrir una pull request. Es su caso de uso principal, con 82,9% declarado sobre 121 bugs no vistos.
- Mantenimiento de repositorios legacy: dadas las 128K ventanas de contexto, el modelo puede leer varios ficheros relevantes y trazas de test de un proyecto mediano sin truncar, identificar la causa raiz y editar los ficheros afectados.
- Asistente de desarrollo en portatil: al requerir unos 5 GB de VRAM en NVFP4, permite despliegue local en un equipo de trabajo sin GPU de datacenter, util para entornos con requisitos de privacidad del codigo.
- Migracion de dependencias y refactors acotados: el bucle de "editar, ejecutar tests, corregir" encaja en tareas de actualizacion de APIs donde la validacion automatica esta disponible.
- Automatizacion de tareas de ingenieria de terminal: el modelo esta entrenado para ejecutar comandos y verificar resultados en contenedores, apto para pipelines de tareas de mantenimiento tipo Terminal-Bench.
- Generacion de tests y parches incrementales: puede redactar cambios pequenos y comprobables, con verificacion automatica posterior por la propia suite del proyecto.
- Analisis de causas de fallo en pipelines de datos: lectura de logs y scripts, edicion del punto de fallo y comprobacion con ejecucion, dentro de un sandbox.
- Prototipado de agentes de codigo en investigacion: al ser Apache-2.0 y de 3,07B parametros, es viable para experimentacion academica con bucles agenticos completos en hardware de laboratorio.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Benchmark | Qwen3.5-4B (base) | JSBAI-Coder-4B (BF16) | JSBAI-Coder-4B-NVFP4 |
|---|---|---|---|
| Generalization test (121 bugs no vistos, tests ejecutados para verificar) | 10,1% | 82,9% | Pendiente (en ejecucion, TBD) |
| Live-60 (60 tareas de ingenieria reales resueltas de extremo a extremo en contenedores) | 15,0% | 21,7% | Pendiente (en ejecucion, TBD) |
| IFEval (seguimiento de instrucciones) | 84,66 | 87,21 | Pendiente (en ejecucion, TBD) |
| MMLU-Pro | No disponible (TBD) | No disponible (TBD) | No disponible (TBD) |
| Terminal-Bench 2.1 | No disponible (TBD) | No disponible (TBD) | No disponible (TBD) |

El autor indica que el protocolo de descontaminacion esta publicado junto al modelo y que ninguno de los problemas de benchmark se solapa con los datos de entrenamiento. No hay cifras publicadas para la variante NVFP4 objeto de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5 GB para esta variante NVFP4, segun la model card (pesos de 5,2 GB en el repositorio); la version BF16 requiere aproximadamente el doble.
- Cabe en GPU de consumo: si, con el margen indicado (5 GB) en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. No confirmado para GPUs de 6 GB una vez anadida la cache KV.
- La cache KV escala con la longitud de contexto; con `max_model_len=131072` el consumo de memoria adicional es considerable y no se publican cifras concretas.
- GPUs de datacenter compatibles con FP4 (por ejemplo, generaciones Hopper y posteriores) para servir la cuantizacion NVFP4 con aceleracion nativa; no disponible la lista oficial de compatibilidad.
- Opciones de despliegue: vLLM con `quantization="modelopt"` es el metodo documentado en la model card. Soporte en llama.cpp, Ollama o TGI no confirmado en la informacion disponible.
- Existe un cabezal de decodificacion especulativa con MTP (multi-token prediction) publicado por la misma organizacion para acelerar la inferencia, pero no se aportan cifras de latencia o throughput.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado destacado | Disponibilidad |
|---|---|---|---|---|---|
| JSBAI-Coder-4B-NVFP4 | 3,07B | 131.072 tokens (configuracion vLLM documentada) | Apache-2.0 | Pendiente de publicar | 0 descargas, 0 likes en HuggingFace (a fecha de la informacion) |
| JSBAI-Coder-4B (BF16) | 3,07B (mismo ajuste, sin cuantizar) | No disponible (misma familia) | Apache-2.0 | 82,9% en 121 bugs no vistos; IFEval 87,21 | Publicado por la misma organizacion |
| Qwen/Qwen3.5-4B (base) | 4B nominales (familia Qwen3.5) | No disponible | Apache-2.0 | 10,1% en bugs no vistos; IFEval 84,66 | Modelo base publico |

La model card afirma que el codigo agentico a este nivel habia requerido modelos de 27B o mas, pero no se aportan nombres, parametros ni resultados de esos modelos comparables, por lo que la comparacion cuantitativa con alternativas de esa categoria no esta disponible.

## Limitaciones y advertencias

- Conocimiento limitado por el tamano: el propio autor advierte que un modelo de 4B tiene "conocimiento de 4B"; los hechos poco frecuentes y el razonamiento de dominio muy especializado siguen favoreciendo a modelos mayores.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones especificas; al operar sobre repositorios y ejecutar comandos, los errores pueden tener efectos reales si no se aisla el entorno.
- Bucle agentico optimizado para contenedores sandbox: el autor indica que otros contextos de despliegue no han sido probados.
- Seguridad: los comportamientos de seguridad provienen del modelo base; la fase de RL optimizo unicamente el paso de tests, sin entrenamiento especifico de seguridad. Se remite a la model card del base.
- Idiomas soportados: no declarados; no hay garantia de rendimiento multilingue fuera del ingles en el material proporcionado.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se heredan las condiciones del modelo base Qwen3.5-4B, que conviene revisar.
- Los resultados de la variante NVFP4 no estan publicados; la cuantizacion puede degradar el rendimiento respecto a la version BF16 (82,9% y 21,7% son cifras del BF16).
- Live-60 se situa en 21,7% con BF16: la resolucion de extremo a extremo de tareas de ingenieria reales queda muy por debajo del resultado en bugs aislados.
- Modelo reciente y sin traccion verificable (0 descargas, 0 likes) en el momento de la consulta.
- No se dispone de informe tecnico: el autor lo anuncia como "coming soon".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbaicenter/JSBAI-Coder-4B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Herramienta de cuantizacion NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- Logo del centro (imagen alojada en HuggingFace): https://cdn-uploads.huggingface.co/production/uploads/69b0868703a7e83e476092ec/RIr7Vy21qoIEFJrMAE8qn.png
- Informe tecnico: anunciado como "coming soon", sin enlace disponible
- Repositorio de codigo, demo o espacio de prueba: no disponibles
