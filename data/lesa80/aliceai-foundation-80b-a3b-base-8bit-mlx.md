# lesa80/AliceAI-Foundation-80B-A3B-Base-8bit-MLX

## Resumen

AliceAI-Foundation-80B-A3B-Base-8bit-MLX es una cuantizacion a 8 bits en formato MLX del modelo base yandex/AliceAI-Foundation-80B-A3B-Base, publicada por el usuario lesa80 en HuggingFace. Se trata de un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE), con aproximadamente 80 000 millones de parametros totales y 3 000 millones de parametros activos por token, segun la nomenclatura del propio identificador (80B-A3B).

El modelo original lo desarrolla Yandex, y la etiqueta de idioma asociada es el ruso (ru). Al ser un modelo base, no ha pasado por un proceso de alineacion orientado a instrucciones del tipo RLHF/DPO, al menos no en esta variante. La relevancia de esta ficha concreta radica en que permite ejecutar un MoE de gran tamano en hardware Apple Silicon mediante MLX, con un coste de memoria reducido por la cuantizacion a 8 bits y un coste computacional por token bajo gracias a los 3B parametros activos.

La informacion publica disponible en la ficha de HuggingFace es muy limitada: no se declara licencia, no se detalla la longitud de contexto, no se especifican los idiomas soportados mas alla de la etiqueta ru y no se aportan resultados de benchmarks. Cualquier evaluacion seria del modelo requiere consultar la ficha del modelo base de Yandex, que no forma parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); arquitectura base concreta no disponible |
| Parametros totales | Aproximadamente 80 000 millones (segun el identificador del modelo) |
| Parametros activos | Aproximadamente 3 000 millones por token (segun el identificador del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (formato MLX); no se declaran otras variantes en este repositorio |
| Idiomas soportados | Ruso (etiqueta ru); lista completa no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

La etiqueta moe del repositorio y el sufijo A3B del identificador confirman que se trata de un modelo de mezcla de expertos con aproximadamente 3 000 millones de parametros activos sobre un total de unos 80 000 millones. Esto implica un enrutador que selecciona un subconjunto de expertos por token, de forma que el coste de computo por token es comparable al de un modelo denso de 3B, mientras que la huella de memoria en pesos corresponde al total de 80B. No se dispone de informacion sobre el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas ni el tipo de atencion empleado.

Tampoco hay informacion publica en este repositorio sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, comparticion de expertos, etc.). Esta variante concreta es una cuantizacion a 8 bits realizada por un tercero (lesa80) mediante la libreria MLX, cuyo proceso de conversion no se documenta en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prompt, propio de un modelo base sin ajuste de instrucciones.
- Generacion de codigo y texto tecnico por continuacion, sin garantia de calidad especifica (no hay benchmarks disponibles).
- Capacidad multilingue: la etiqueta declarada es unicamente ruso (ru); el resto de idiomas no esta confirmado.
- Aprendizaje en contexto (few-shot) mediante ejemplos en el prompt, como corresponde a un modelo base.
- Puntuacion de secuencias y ranking mediante log-probabilidades, util para clasificacion y filtrado.
- Punto de partida para ajuste fino supervisado o LoRA si se convierte a un formato de entrenamiento compatible.
- Soporte de tool calling o function calling: no disponible y no confirmado.
- Soporte de agentes y razonamiento multi-paso: no disponible y no confirmado.
- Modo thinking, vision o audio: no disponible y no confirmado.

## Casos de uso

- Ajuste fino de dominio: al ser un modelo base sin alineacion, puede servir como punto de partida para SFT o LoRA sobre corpus especializados (legal, medico, industrial) en ruso, aprovechando que solo 3B parametros se activan por token durante el entrenamiento y la inferencia.
- Generacion de datos sinteticos: continuacion masiva de textos para crear corpus de preentrenamiento o aumento de datos, ejecutable en local sobre Apple Silicon con MLX y sin enviar datos a servicios externos.
- Procesamiento de documentacion en ruso: resumen por continuacion, reformulacion o extraccion de entidades mediante prompts few-shot, aprovechando la etiqueta de idioma declarada.
- Prototipado local con privacidad: despliegue en un Mac Studio con memoria unificada elevada para tareas de generacion de texto sobre datos sensibles que no pueden salir de la organizacion.
- Investigacion sobre cuantizacion: comparacion sistematica de la calidad de esta variante a 8 bits frente al modelo base en precision completa, midiendo perplejidad y degradacion por capa.
- Investigacion sobre MoE: analisis del comportamiento del enrutador, balanceo de carga entre expertos y efecto de la cuantizacion sobre el routing, dado que los pesos cuantizados de un MoE alteran las decisiones del router.
- Servicio local compatible con API OpenAI: uso de mlx_lm.server para exponer el modelo a herramientas que consumen ese protocolo, en escenarios de evaluacion interna y no de produccion critica.
- Evaluacion comparativa en ruso: banco de pruebas para medir modelos abiertos en tareas de lengua rusa, dado el escaso numero de alternativas abiertas de este tamano centradas en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en 8 bits: aproximadamente 80 GB solo para los parametros, calculado a partir de 80 000 millones de parametros a 8 bits por parametro. Es una estimacion derivada del recuento de parametros, no un dato oficial del repositorio.
- Memoria unificada recomendada: al menos 128 GB para incluir pesos, cache KV y overhead del runtime; 192 GB ofrece margen comodo para contextos largos y lotes mayores.
- Equipos Apple Silicon compatibles: Mac Studio con M2 Ultra o M3 Ultra de 192 GB, o MacBook Pro con 128 GB. No cabe en configuraciones de 64 GB o inferiores.
- GPU NVIDIA: MLX no soporta CUDA. Para usar A100, H100, RTX 4090 u otras GPU seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors estandar), conversion que no se proporciona en este repositorio.
- Cabe en GPU de consumo: no en su forma actual, porque MLX esta limitado a Apple Silicon y el modelo requiere del orden de 80 GB en pesos.
- Opciones de despliegue: mlx-lm (generacion por linea de comandos) y mlx_lm.server para una API compatible con OpenAI. vLLM, TGI, llama.cpp y Ollama no consumen pesos MLX directamente.
- Latencia y throughput: no disponible. Cabe esperar una decodificacion relativamente rapida por token al activar solo 3B parametros, pero limitada por el ancho de banda de memoria al leer los expertos seleccionados en cada paso.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica habitual y conviene verificarlos antes de usarlos en una decision tecnica. Los del modelo de esta ficha son los declarados en el repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AliceAI-Foundation-80B-A3B-Base (8 bits MLX) | ~80 000 millones | ~3 000 millones | no disponible | no disponible | safetensors MLX |
| Qwen3-30B-A3B | ~30 500 millones | ~3 300 millones | 128 000 tokens | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | ~46 700 millones | ~12 900 millones | 32 000 tokens | Apache 2.0 | safetensors, GGUF |
| gpt-oss-120b | ~116 800 millones | ~5 100 millones | 128 000 tokens | Apache 2.0 | safetensors, MXFP4 |

## Limitaciones y advertencias

- Es un modelo base: no esta alineado para seguir instrucciones ni para mantener conversaciones, por lo que requiere prompting few-shot o un ajuste posterior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin datos de evaluacion no puede cuantificarse su magnitud.
- La cuantizacion a 8 bits introduce degradacion respecto al modelo en precision completa, y en arquitecturas MoE puede alterar la seleccion de expertos de forma no trivial.
- Licencia no disponible: no puede confirmarse el uso comercial. Hay que consultar la licencia del modelo base de Yandex antes de cualquier despliegue en produccion.
- Cobertura idiomatica declarada unicamente en ruso; el rendimiento en castellano, ingles u otros idiomas no esta confirmado.
- Longitud de contexto desconocida: no puede planificarse el uso en tareas de contexto largo sin consultar la ficha del modelo base.
- Repositorio de terceros con cero descargas y cero valoraciones en el momento de la consulta: no hay validacion comunitaria de la calidad de la conversion.
- Dependencia de MLX y Apple Silicon: no es portable a CUDA ni a aceleradores de otros fabricantes sin una conversion adicional de pesos.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces fiables son los de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lesa80/AliceAI-Foundation-80B-A3B-Base-8bit-MLX
- Modelo base referenciado: https://huggingface.co/yandex/AliceAI-Foundation-80B-A3B-Base
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
