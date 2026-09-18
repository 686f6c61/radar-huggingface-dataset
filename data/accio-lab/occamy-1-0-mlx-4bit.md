# Accio-Lab/occamy-1.0-MLX-4bit

## Resumen

Occamy 1.0 MLX 4-bit (identificador `Accio-Lab/occamy-1.0-MLX-4bit`) es una conversión cuantizada del modelo `Accio-Lab/occamy-1.0` al formato nativo de MLX, pensada para ejecución en Apple Silicon. Se trata de un export de texto de la familia `qwen3_5_moe` (mezcla de expertos) con 34.660.608.768 parámetros totales y un repositorio de 19,5 GB. La cuantización es affine nativa de 4 bits con group size 64, mientras que los módulos de router y de gates de expertos compartidos se mantienen en 8 bits.

El modelo lo publica Accio-Lab y se distribuye como release candidata: la validación en Linux con MLX nativo ha pasado, pero la aceptación en Metal (Mac) está pendiente según la propia model card. La conversión se realizó con mlx 0.32.2 y mlx-lm 0.31.3, partiendo de la revisión `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8` del modelo base, y emplea un adaptador sin pérdida que apila los pesos de expertos en orden numérico antes de invocar el saneador Qwen3.5 una sola vez.

Su relevancia es de nicho pero concreta: ofrece la única vía documentada de ejecutar un MoE de ~34,7B en Mac con memoria unificada, sin necesidad de GPU dedicada. El precio es la falta de información publicada: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks de calidad y no hay fichas confirmadas sobre la longitud de contexto ni sobre el número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia `qwen3_5_moe`; export MLX cuantizado |
| Parametros totales | 34.660.608.768 (~34,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits affine nativa MLX con group size 64; router y gates de expertos compartidos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion affine MLX), libreria `mlx`; repo de 19,5 GB |
| Modelo base | Accio-Lab/occamy-1.0 (revision 8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8) |
| Modalidades | solo texto (vision y MTP no incluidos en el export) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia `qwen3_5_moe`, con 34,66 mil millones de parametros totales. Al ser un modelo MoE, solo un subconjunto de expertos se activa por token, de modo que el coste de inferencia por token es inferior al que sugeriria el conteo total de parametros; sin embargo, el numero de parametros activos no se especifica en la informacion disponible. El export es exclusivamente de texto: los modulos de vision y de prediccion multi-token (MTP) presentes previsiblemente en el modelo base no se incluyen.

No se documentan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Lo que si se detalla es el proceso de conversion: se aplico cuantizacion affine nativa de 4 bits con group size 64 mediante las APIs oficiales de mlx 0.32.2 y mlx-lm 0.31.3, manteniendo en 8 bits el router y los gates de expertos compartidos para preservar la calidad de enrutamiento. Un adaptador sin perdida apila los pesos de los expertos separados en orden numerico antes de ejecutar el saneador Qwen3.5 una unica vez, y la recarga se realiza con el cargador estandar sin necesidad de adaptador. La validacion declarada incluye recarga estricta con el loader de stock, comprobacion de todos los valores flotantes almacenados, dequantizacion nativa de cada fila cuantizada, comparacion de tokenizer y plantilla, y una generacion greedy acotada con cache en CPU que produce logits finitos (la peticion de prueba "Compute 2+2. Answer briefly." devolvio `4`). Se trata de un smoke test, no de una evaluacion de calidad.

## Capacidades

- Generacion de texto: la pipeline declarada es `text-generation` y el modelo esta etiquetado como `conversational`.
- Razonamiento, matematicas y codigo: no disponibles como capacidades verificadas; no hay benchmarks ni evaluaciones publicadas en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision: explicitamente no incluida en este export.
- Prediccion multi-token (MTP): explicitamente no incluida en este export.
- Modo de razonamiento explicito (thinking): la familia Qwen3.5 lo contempla habitualmente, pero no se confirma para este export en la informacion disponible.

## Casos de uso

- Prototipado local en Mac sin GPU dedicada: cargar el modelo con `mlx_lm.load()` y `mlx_lm.generate()` para experimentar con un MoE de ~34,7B en un equipo Apple Silicon con memoria unificada suficiente, evitando el coste de alquiler de GPU.
- Asistente conversacional de escritorio con privacidad de datos: al ejecutarse en local, las conversaciones no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad, siempre que se acepte la ausencia de licencia declarada.
- Generacion de texto por lotes con presupuesto de memoria ajustado: el peso en 4 bits (~19,5 GB de repositorio) permite cubrir tareas de redaccion, resumen o reformulacion en una sola maquina, sin infraestructura distribuida.
- Evaluacion comparativa de cuantizaciones: dado que el modelo base esta disponible por separado, este export sirve como referencia para medir la degradacion de una cuantizacion de 4 bits con group size 64 frente a precisiones mayores, midiendo perplejidad y calidad de generacion.
- Nodo de inferencia en pipelines de generacion de contenido offline: integrable mediante el servidor de mlx-lm en un flujo interno de produccion de borradores, clasificacion de textos largos o extraccion de informacion, cuando no se requiere baja latencia.
- Base para experimentacion en enrutamiento MoE: al mantener router y gates en 8 bits, es un punto de partida util para estudiar como afecta la cuantizacion selectiva al balanceo de carga entre expertos.
- Docencia y laboratorio: entorno reproducible (hash de revision y `SHA256SUMS`) para que estudiantes inspeccionen pesos cuantizados, dequantizacion y comportamiento de un MoE real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de funcionamiento es un smoke test declarado en la model card: una generacion greedy acotada con cache en CPU y logits finitos ante la peticion "Compute 2+2. Answer briefly.", que devolvio `4`. No se incluyen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni mediciones de perplejidad del modelo cuantizado frente al base.

| Prueba | Resultado | Naturaleza |
|---|---|---|
| Smoke test de generacion en CPU | Respuesta `4` a "Compute 2+2. Answer briefly." | Comprobacion de integridad, no benchmark de calidad |
| MMLU, HumanEval, GSM8K, perplejidad | no disponible | - |

## Requisitos de hardware

- Inferencia en 4 bits: el repositorio ocupa 19,5 GB, por lo que se necesitan aproximadamente 20-24 GB de memoria disponible solo para los pesos, mas el espacio de la cache KV.
- Memoria unificada en Apple Silicon: se recomienda un equipo con 32 GB o mas (M-series Pro/Max/Ultra). En configuraciones de 24 GB la carga entra justa y deja poco margen para contextos largos.
- Aviso de validacion: la aceptacion en Metal esta pendiente segun la model card; solo se declara validada la ejecucion con MLX nativo en Linux. El rendimiento real en Mac no esta confirmado.
- Estimaciones para otras precisiones del modelo base (~34,7B): 8 bits en torno a 35 GB y bf16 en torno a 69 GB de pesos. Estas cifras son calculos aritmeticos a partir del numero de parametros, no mediciones publicadas.
- GPUs CUDA (A100, H100, RTX 4090): no ejecutan pesos en formato MLX de forma nativa. Para usarlas habria que convertir el modelo base a otro formato; esta informacion no se detalla en la fuente.
- Opciones de despliegue confirmadas: `mlx-lm` 0.31.3 con mlx 0.32.2 mediante `load()` y `generate()`; el mismo paquete permite levantar un servidor compatible con la API de OpenAI. Otros runners basados en MLX, como LM Studio, podrian cargarlo, aunque no se confirma en la informacion disponible.
- vLLM, TGI, llama.cpp y Ollama: no soportan pesos MLX directamente; requeririan partir del modelo base y convertir a GGUF u otro formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas verificadas ni datos del modelo base mas alla de su identificador. La tabla siguiente usa como referencias dos MoE abiertos ampliamente conocidos, con valores publicos de caracter general que no proceden de la fuente consultada y que deben tomarse como orientativos, no como una comparacion medida.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| occamy-1.0-MLX-4bit | 34,7B | no disponible | no disponible | no disponible | safetensors MLX 4 bits |
| Qwen3-30B-A3B (referencia publica) | ~30,5B | ~3,3B | 128K declarados | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B (referencia publica) | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |

No se dispone de resultados de benchmarks de occamy-1.0-MLX-4bit que permitan establecer una comparacion de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica termino de uso, por lo que el uso comercial no puede darse por permitido; hay que contactar con Accio-Lab antes de desplegarlo en produccion.
- Release candidata: la propia model card indica que la aceptacion en Mac Metal esta pendiente. La validacion realizada en Linux con MLX nativo no equivale a rendimiento ni calidad validados en Mac.
- Ausencia de benchmarks: no hay evaluaciones de calidad, perplejidad ni comparacion con el modelo sin cuantizar, por lo que se desconoce la degradacion introducida por la cuantizacion de 4 bits.
- Sin datos de idiomas: no se declara cobertura multilingue, asi que cualquier uso fuera del ingles o del chino deberia validarse previamente.
- Longitud de contexto desconocida: no se puede dimensionar la cache KV ni planificar aplicaciones de contexto largo.
- Parametros activos desconocidos: impide estimar con precision el coste computacional por token y el throughput esperado.
- Export solo texto: no hay vision ni prediccion multi-token, por lo que no sirve para tareas multimodales.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible; se asume el comportamiento tipico de un modelo de lenguaje sin ajuste verificado.
- Trazabilidad limitada de la calidad: el unico control publicado es un smoke test aritmetico trivial, insuficiente para certificar el estado de los pesos mas alla de su integridad estructural.
- Ecosistema restringido: al ser un artefacto en formato MLX, no es portable directamente a infraestructura CUDA ni a los runners mas extendidos.
- Adopcion minima: 20 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado fallos o comportamientos inesperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Revision del modelo base citada: `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8`
- Plataforma del autor (resultado de busqueda, no documentacion del modelo): https://www.accio.com/
- Aplicacion de escritorio del autor (resultado de busqueda, no documentacion del modelo): https://www.accio.com/work/app
- Pagina corporativa del autor (resultado de busqueda): https://fr.accio.com/about-us
- Ficha en Google Play de la aplicacion Accio (resultado de busqueda): https://play.google.com/store/apps/details?id=com.accio.android.app
- Paper, blog tecnico o repositorio de codigo especifico del modelo: no disponible
