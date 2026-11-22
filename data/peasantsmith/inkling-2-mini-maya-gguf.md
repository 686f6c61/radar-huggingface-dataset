# peasantsmith/Inkling-2-Mini-Maya-GGUF

## Resumen

Inkling-2-Mini-Maya-GGUF es un repositorio de artefactos en formato GGUF preparado por el usuario peasantsmith para ejecutar el modelo multimodal Inkling-2-Mini (desarrollado por Thinking Machines) dentro de Project Maya, un entorno de inferencia local. El repositorio no contiene una conversion propia del modelo completo: su unico peso publicado es la torre de vision (`vision/mmproj-Inkling-2-Mini-BF16.gguf`, 0,64 GB en BF16), mientras que los pesos del modelo de lenguaje se descargan desde la conversion de Unsloth (`unsloth/Inkling-2-Mini-GGUF`, variante `UD-Q4_K_XL`).

El modelo base, Inkling-2-Mini, es un modelo de 26 000 millones de parametros con licencia Apache 2.0, capacidad de vision, soporte de tool calling y una ventana de contexto de hasta 1 millon de tokens segun la model card. La ficha de Hugging Face reporta 318 256 128 parametros en safetensors, cifra que no coincide con los 26 B declarados por el autor y que probablemente corresponde solo a un subconjunto de tensores (por ejemplo, la torre de vision o un componente parcial); debe tratarse con cautela.

La relevancia de este repositorio es practica: facilita el despliegue del modelo en GPUs de consumo mediante cuantizacion GGUF y descarga de expertos a RAM, con soporte para NVIDIA desde 8 GB de VRAM y AMD Radeon desde 24 GB. Es un artefacto de empaquetado, no un modelo nuevo, y su valor depende enteramente del modelo base de Thinking Machines y de la conversion de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con torre de vision separada en GGUF) |
| Parametros totales | 26 B segun la model card del autor; 318 256 128 reportados en safetensors (dato no coincidente) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1 000 000 tokens (1M) segun la model card |
| Tipos de cuantizacion | Q4_K_XL (Unsloth UD) para el modelo de lenguaje; BF16 para la torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje y `mmproj` de vision) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card de este repositorio describe un modelo multimodal con una torre de vision independiente empaquetada como `mmproj` en GGUF, lo que implica una arquitectura de tipo vision-language con encoder de imagen separado y proyeccion hacia el modelo de lenguaje. El texto menciona "expertos que no caben en VRAM" que permanecen en RAM, lo que sugiere una arquitectura con componentes tipo mixture-of-experts o al menos una organizacion por expertos, aunque no se confirma el numero de parametros activos ni la naturaleza exacta del enrutamiento.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. El unico dato tecnico verificable es que la torre de vision incluida es una conversion byte a byte del `mmproj-BF16.gguf` de Unsloth, con hash sha256 `2c165c78790e78a3f45a2d1e9e931083e52ee69d45ff2a0dc9c281fdf1a666e7`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base se presenta como un modelo de proposito general, aunque no se detallan dominios especificos.
- Vision: procesa imagenes mediante la torre de vision incluida en el repositorio (`mmproj` en BF16).
- Tool calling / function calling: soportado explicitamente segun la model card ("tool calls").
- Modo thinking configurable: niveles de razonamiento desde "Off" hasta "Max".
- Contexto largo: hasta 1M tokens, lo que habilita conversaciones y documentos de gran extension.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ejecucion local con descarga de expertos a RAM: permite correr el modelo en hardware limitado.

## Casos de uso

- Analisis de documentos extensos con imagenes: gracias a la ventana de 1M tokens, se pueden procesar informes, contratos o expedientes completos junto con sus figuras y tablas, usando la torre de vision para interpretar diagramas.
- Asistencia tecnica con capturas de pantalla: el modelo puede recibir imagenes de interfaces o errores y responder con diagnosticos, integrado en herramientas de soporte mediante tool calling.
- Agentes locales con razonamiento multi-paso: el modo thinking configurable permite ajustar el coste computacional segun la complejidad de la tarea, desde respuestas rapidas hasta cadenas de razonamiento profundas.
- Procesamiento de imagenes medicas o tecnicas en entornos con privacidad: al ejecutarse en local con Project Maya, los datos no salen del equipo, lo que resulta adecuado para entornos regulados.
- Automatizacion de flujos con function calling: el modelo puede invocar APIs y ejecutar acciones en pipelines internos, con el nivel de thinking ajustado para mantener latencia baja.
- Despliegue en estaciones de trabajo con GPU de consumo: con 8 GB de VRAM y 13 GB de RAM en NVIDIA, o 24 GB en AMD Radeon, se puede montar un asistente multimodal local sin infraestructura cloud.
- Prototipado de aplicaciones vision-language: el `mmproj` en BF16 y el GGUF Q4_K_XL permiten iterar rapidamente en entornos de desarrollo con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde 8 GB en NVIDIA (V100, RTX 20 y posteriores); los expertos que no caben permanecen en RAM, requiriendo aproximadamente 13 GB de RAM del sistema con una tarjeta de 8 GB.
- AMD: Radeon desde 24 GB, o APUs Halo / APU, en Linux.
- GPU recomendadas: no se especifican modelos concretos mas alla de las familias mencionadas (V100, RTX 20 en adelante, Radeon de 24 GB).
- Cabe en GPU de consumo: si, en RTX 20 y posteriores con 8 GB o mas, y en Radeon de 24 GB.
- Opciones de despliegue: Project Maya (`./maya.sh --setup --model inkling-2-mini`), con pesos GGUF compatibles con el ecosistema llama.cpp; el repositorio de Unsloth sugiere compatibilidad con herramientas GGUF estandar, aunque no se confirma explicitamente vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y no se dispone de datos de rendimiento del modelo base para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene el modelo completo: solo publica la torre de vision; los pesos del modelo de lenguaje se descargan desde `unsloth/Inkling-2-Mini-GGUF`, por lo que la disponibilidad y la integridad dependen de un tercero.
- Discrepancia en el numero de parametros: la ficha reporta 318 256 128 parametros en safetensors frente a los 26 B declarados en la model card; conviene verificar antes de planificar recursos.
- Sin datos de benchmarks, idiomas soportados ni composicion de entrenamiento: no es posible evaluar sesgos, calidad multilingue ni rendimiento relativo sin pruebas propias.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay informacion sobre mitigaciones especificas.
- Ejecucion con descarga a RAM: el rendimiento se degrada cuando los expertos no caben en VRAM, con latencias mayores y posible swapping.
- Soporte AMD limitado a 24 GB o APUs y solo en Linux; en Windows el soporte documentado es para NVIDIA.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de empaquetado conviene revisar tambien las condiciones del modelo base y de la conversion de Unsloth.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/Inkling-2-Mini-Maya-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversion GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Project Maya: https://github.com/mw00/project-maya
