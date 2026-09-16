# scaryrawr/occamy-1.0-oQ5e-mtp

## Resumen

occamy-1.0-oQ5e-mtp es una cuantizacion de 5 bits del modelo Accio-Lab/occamy-1.0, publicada por el usuario scaryrawr, que incorpora ademas el cabezal MTP (multi-token prediction) experimental en BF16 de Accio-Lab/occamy-1.0-MTP, convertido al formato de tensores de MLX. El objetivo es claro: permitir la ejecucion local de un modelo MoE de aproximadamente 36.000 millones de parametros en equipos Apple Silicon, reduciendo el peso del repositorio a 28,7 GB mediante cuantizacion mixta con la herramienta oQ (oMLX v0.7.0.dev2).

Los metadatos identifican el tipo de modelo como `qwen3_5_moe`, es decir, una arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5. El dato de parametros totales disponible en los safetensors es de 35.951.822.704, mientras que la longitud de contexto, los parametros activos, los idiomas soportados y la licencia no aparecen declarados en la informacion disponible.

Se trata de un artefacto derivado y no oficial: el propio autor advierte de que el cabezal MTP solo fue validado por Accio-Lab con checkpoints BF16 y NVFP4 de ModelOpt, y que esta variante MLX en oQ no ha sido validada de forma independiente, por lo que la tasa de aceptacion de la decodificacion especulativa y el rendimiento real pueden diferir de lo esperado. Con cero descargas y cero likes en el momento de la consulta, no existe validacion comunitaria que respalde su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tipo declarado `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (aproximadamente 35,95 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64, cuantizacion mixta mediante oQ (oMLX v0.7.0.dev2); no se publican otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (tamano del repositorio: 28,7 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos de tipo `qwen3_5_moe`, segun los metadatos del repositorio. Al ser un modelo MoE, solo una fraccion de los parametros se activa por token, lo que permite un coste de computo por token inferior al de un modelo denso de tamano equivalente; sin embargo, el numero de parametros activos no se declara en la informacion disponible. Sobre esta base, el autor ha anadido el cabezal MTP oficial experimental de Accio-Lab/occamy-1.0-MTP, que habilita decodificacion especulativa prediciendo varios tokens por paso, y lo ha convertido al layout de tensores de MLX.

En cuanto al entrenamiento, no hay informacion sobre el numero de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO: estos datos corresponderian al modelo base de Accio-Lab y no se reproducen en este repositorio. La innovacion tecnica de esta publicacion es puramente de compresion y portabilidad: se aplica cuantizacion mixta de 5 bits con group size 64 mediante oQ sobre oMLX v0.7.0.dev2, y se traslada el cabezal MTP a MLX para que la decodificacion especulativa funcione en Apple Silicon. El autor advierte explicitamente de que este proceso no ha sido validado de forma independiente y de que la tasa de aceptacion del cabezal puede degradarse respecto a las validaciones originales en BF16 y NVFP4.

## Capacidades

La model card no documenta capacidades concretas de esta variante. Las siguientes afirmaciones deben entenderse como derivadas de la arquitectura declarada (`qwen3_5_moe`) y del modelo base, no como caracteristicas verificadas en este repositorio:

- Generacion de texto y razonamiento: heredadas del modelo base occamy-1.0, sin datos de evaluacion publicados para esta cuantizacion.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible; dependeria de las capacidades del modelo base.
- Soporte de tool calling / function calling: no disponible en la documentacion de esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible; requiere verificacion con la plantilla de chat del modelo base.
- Capacidades multilingues: no disponible, ya que no se declara lista de idiomas.
- Decodificacion especulativa mediante cabezal MTP: es la capacidad diferencial de este repositorio. El cabezal permite proponer varios tokens por paso de decodificacion, aunque no se publican tasas de aceptacion ni ganancias de velocidad para la variante MLX en 5 bits.
- Capacidades multimodales (vision o audio): no disponible; los tags no indican ninguna modalidad adicional.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 28,7 GB de pesos en safetensors de 5 bits, el modelo esta pensado para ejecutarse en equipos Apple Silicon con memoria unificada amplia, evitando el envio de datos a servicios en la nube. Es el escenario natural de un artefacto MLX.
- Asistente de codigo integrado en el editor: al ejecutarse a traves de `mlx-lm` localmente, puede conectarse a extensiones de VS Code o Xcode mediante un endpoint compatible con la API de OpenAI servido por `mlx_lm.server`, lo que permite autocompletado y refactorizacion sin salida de datos del equipo.
- Procesamiento de documentacion confidencial: sectores con requisitos de privacidad (legal, sanitario, defensa) pueden desplegarlo en un Mac Studio aislado de red para resumir y extraer informacion de documentos internos, siempre que se valide primero la calidad tras la cuantizacion de 5 bits.
- Prototipado de agentes con decodificacion especulativa: el cabezal MTP incluido permite experimentar con generacion acelerada en pipelines de agentes multi-paso, midiendo la tasa de aceptacion real en MLX frente a los resultados reportados por Accio-Lab en BF16 y NVFP4.
- Servidor de inferencia interno de baja concurrencia: un unico Mac Studio puede actuar como backend para un equipo pequeno de desarrolladores mediante `mlx_lm.server`, con un rendimiento por usuario que habria que medir, ya que no hay cifras publicadas de throughput ni latencia.
- Investigacion sobre cuantizacion mixta: sirve como caso de estudio reproducible para evaluar como afecta una cuantizacion oQ de 5 bits con group size 64 a un modelo MoE de ~36.000 millones de parametros, comparando sus salidas con el checkpoint BF16 del modelo base.
- Evaluacion comparativa de cabezales MTP: permite contrastar el comportamiento del cabezal MTP en layout MLX frente a las validaciones oficiales, un caso de uso relevante para quien investigue decodificacion especulativa en hardware de Apple.
- Desarrollo offline en entornos sin conectividad: al no requerir GPU NVIDIA ni acceso a Internet, encaja en escenarios de campo, laboratorio o formacion donde no se dispone de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni tampoco tasas de aceptacion o ganancias de velocidad del cabezal MTP en esta variante MLX. El autor indica explicitamente que el rendimiento del cabezal puede diferir del obtenido en las validaciones con BF16 y NVFP4.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan 28,7 GB en disco. Como estimacion derivada, la inferencia requiere al menos esos 28,7 GB mas el espacio para la cache KV y los buffers de activaciones, por lo que se recomienda un minimo de 36 GB de memoria unificada y, de forma comoda, 48-64 GB.
- GPU compatibles: exclusivamente Apple Silicon (M-series). El formato MLX safetensors no es cargable en CUDA, por lo que no es utilizable en A100, H100 ni RTX 4090 sin una conversion previa a otro formato, que este repositorio no proporciona.
- Equipos recomendados: Mac Studio con M2 Ultra o M3 Ultra (64 GB o mas) y MacBook Pro con M4 Max (48 GB o mas). No cabe en configuraciones de 8, 16 o 24 GB de memoria unificada.
- Opciones de despliegue: `mlx-lm` (incluido `mlx_lm.server` para servir un endpoint compatible con la API de OpenAI) y las herramientas de oQ / oMLX empleadas en la cuantizacion. No se publican pesos en GGUF ni safetensors estandar, por lo que llama.cpp, Ollama, vLLM o TGI no pueden consumir este repositorio tal cual.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por token para esta variante.

## Comparativa con modelos similares

En la informacion disponible no se ofrecen especificaciones de modelos alternativos, por lo que la comparacion se limita a las tres publicaciones de la misma familia, con numerosos campos sin declarar:

| Modelo | Parametros | Cuantizacion | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| scaryrawr/occamy-1.0-oQ5e-mtp | 35.951.822.704 | 5 bits, group size 64 (oQ) | MLX safetensors | no disponible | no disponible | Incluye cabezal MTP convertido a MLX; no validado |
| Accio-Lab/occamy-1.0 | no disponible | BF16 (referencia) | no disponible | no disponible | no disponible | Modelo base |
| Accio-Lab/occamy-1.0-MTP | no disponible | BF16 (cabezal) | no disponible | no disponible | no disponible | Cabezal MTP experimental oficial |

No se dispone de datos de rendimiento comparado (parametros activos, contexto, benchmarks) que permitan situar esta variante frente a otros modelos MoE de tamano similar.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia explicita impide determinar si se permite el uso comercial. No deberia desplegarse en produccion sin aclarar este punto con el autor y con Accio-Lab.
- Artefacto no oficial y no validado: es una cuantizacion de terceros, no publicada por Accio-Lab, y el propio autor senala que la variante MLX en oQ no ha sido validada de forma independiente.
- Riesgo en el cabezal MTP: la tasa de aceptacion de la decodificacion especulativa puede ser inferior a la reportada en BF16 y NVFP4, con el consiguiente impacto en la velocidad real.
- Perdida de calidad por cuantizacion: 5 bits con group size 64 sobre un modelo MoE puede degradar tareas sensibles a la precision (matematicas, codigo, razonamiento largo). No hay evaluaciones que cuantifiquen esta perdida.
- Idiomas y contexto desconocidos: al no declararse lista de idiomas ni longitud de contexto, no puede garantizarse un comportamiento correcto en castellano ni en conversaciones de contexto largo.
- Sesgos y alucinacion: no hay informacion sobre sesgos del modelo base ni sobre tecnicas de mitigacion; como cualquier modelo generativo, puede producir contenido factualmente incorrecto con apariencia de veracidad.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de informes independientes de calidad o estabilidad.
- Metadatos incompletos: pipeline, idiomas y licencia figuran como no disponibles; las fechas del repositorio (creacion el 15 de septiembre de 2026) conviene verificarlas antes de citar el artefacto como referencia.
- Portabilidad limitada: al estar en MLX safetensors y no publicarse GGUF ni safetensors estandar, no es reutilizable directamente por los stacks de inferencia mas extendidos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/scaryrawr/occamy-1.0-oQ5e-mtp
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Cabezal MTP oficial experimental: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Libreria de inferencia MLX para LLM: https://github.com/ml-explore/mlx-lm
