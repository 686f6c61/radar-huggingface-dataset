# RabiatS/Phi-3.5-mini-instruct-4bit-Lantern

## Resumen

RabiatS/Phi-3.5-mini-instruct-4bit-Lantern es una redistribucion del modelo microsoft/Phi-3.5-mini-instruct en formato MLX cuantizado a 4 bits, publicada por el desarrollador de Lantern, una aplicacion de IA local para iPhone, iPad y Mac. No se trata de un fine-tune ni de un reentrenamiento: el autor indica explicitamente que los pesos son identicos a los de la conversion mlx-community/Phi-3.5-mini-instruct-4bit, y que esta copia existe unicamente para que la aplicacion pueda descargarla desde un repositorio propio.

El modelo resuelve un problema de distribucion mas que de capacidad: ofrece inferencia de texto completamente en el dispositivo, sin cuenta de usuario, sin servidor y sin envio de datos a terceros. El unico uso de red es la descarga inicial de los ficheros, que ocupan aproximadamente 2,2 GB. Esta pensado como alternativa local a las API en la nube para razonamiento, matematicas y generacion de codigo en hardware Apple.

Tecnicamente es un transformer decoder-only denso de 3.821.079.552 parametros (3,82 mil millones) segun los safetensors del repositorio, heredado del modelo base de Microsoft y empaquetado en 4 bits con la libreria MLX. La model card del autor declara que funciona en iPhones y Macs con 8 GB de memoria, aunque advierte que consume aproximadamente el triple de memoria por palabra de conversacion que un Llama de 3B, por lo que las conversaciones largas van justas en telefono. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Phi-3.5-mini de Microsoft), sin capas MoE; conversion cuantizada a 4 bits en formato MLX |
| Parametros totales | 3.821.079.552 (3,82 mil millones), segun los safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits en formato MLX (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 4 bits) |
| Libreria de inferencia | mlx (etiqueta library_name); incluye la etiqueta custom_code |
| Tamano del repositorio | 2,2 GB |
| Modelo base | microsoft/Phi-3.5-mini-instruct |
| Modalidad de entrada | texto |

## Arquitectura y entrenamiento

La ficha del repositorio no documenta arquitectura propia ni proceso de entrenamiento: se trata de una conversion de pesos ya existentes. El modelo subyacente es Phi-3.5-mini-instruct de Microsoft, un transformer decoder-only denso; el autor no especifica numero de capas, dimension oculta, tipo de atencion ni mecanismos adicionales, por lo que esos detalles no estan disponibles en la informacion proporcionada. La conversion a 4 bits se ha realizado con MLX, el framework de Apple para ejecucion en silicio de la serie M y A, y los safetensors resultantes estan pensados para cargarse con mlx-lm o desde la aplicacion Lantern.

No se declara ningun tipo de ajuste por refuerzo, DPO, RLHF ni entrenamiento adicional por parte de quien publica el repositorio. De hecho, la model card afirma que los pesos no se han modificado respecto a la conversion de mlx-community, que a su vez deriva del modelo original de Microsoft. Tampoco se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, atencion con ventana deslizante u otras): las unicas caracteristicas tecnicas explicitas son la cuantizacion a 4 bits, el formato MLX y la ejecucion totalmente local. Como datos de entrenamiento, composicion del dataset o numero de tokens solo podrian consultarse en la documentacion del modelo base, que no forma parte de la informacion facilitada.

## Capacidades

- Generacion de texto conversacional en modo chat, con pipeline declarado text-generation.
- Razonamiento, matematicas y codigo: la model card afirma que es "bueno para razonamiento, matematicas y codigo para su tamano", sin aportar cifras.
- Inferencia completamente local y offline: no requiere cuenta ni servidor, y ningun texto introducido sale del dispositivo.
- Ejecucion en iPhone, iPad y Mac mediante MLX, con integracion directa en la aplicacion Lantern y compatibilidad con la CLI de mlx-lm.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el repositorio no declara idiomas).
- Capacidades multimodales (vision, audio): no disponibles; la model card indica que el modelo "takes in text".
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de IA en aplicaciones moviles: Lantern puede empaquetar este modelo para responder consultas dentro del propio iPhone o iPad, sin enviar el contenido de la conversacion a ningun servidor, lo que resulta adecuado para usuarios con requisitos de privacidad estrictos.
- Aplicaciones de notas y procesamiento de texto en local: resumir, reescribir o extraer ideas de textos pegados por el usuario, aprovechando que los pesos ocupan solo 2,2 GB y caben en dispositivos de 8 GB.
- Ayuda con tareas de matematicas y ejercicios academicos: el modelo esta indicado por el autor para matematicas y razonamiento, de modo que puede usarse en apps educativas offline para explicar pasos intermedios de un problema.
- Generacion y explicacion de codigo en un entorno de escritorio: con mlx-lm en un Mac Apple Silicon se puede invocar el modelo desde scripts o desde el terminal para autocompletar fragmentos, explicar funciones o traducir codigo entre lenguajes, sin depender de conectividad.
- Prototipado de pipelines de IA generativa en Mac: al ser una conversion MLX estandar, sirve como modelo de pruebas para validar prompts, plantillas de chat y flujos de generacion antes de escalar a modelos mayores.
- Herramientas internas para sectores regulados: cualquier flujo que no pueda enviar datos a la nube (borradores legales, notas clinicas, documentacion interna) puede apoyarse en la inferencia puramente local, siempre que el dispositivo tenga memoria suficiente.
- Asistentes de redaccion multilingue: uso previsto solo si se valida previamente el comportamiento del modelo en el idioma objetivo, dado que este repositorio no declara idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco ofrece datos de latencia o throughput. La unica valoracion de rendimiento es cualitativa: "bueno para razonamiento, matematicas y codigo para su tamano". Cualquier comparacion cuantitativa con otros modelos requeriria consultar la documentacion del modelo base, que no forma parte de la informacion facilitada.

## Requisitos de hardware

- Tamano en disco: 2,2 GB de descarga segun la model card.
- Memoria estimada: pesos de 4 bits en torno a 2,2 GB, mas cache KV, buffers de runtime y el propio proceso de la aplicacion; el autor indica que funciona en dispositivos con 8 GB de memoria.
- Consumo relativo: el autor advierte que el modelo usa aproximadamente tres veces mas memoria por palabra de conversacion que un Llama de 3B, por lo que conversaciones largas son ajustadas en un telefono.
- Compatibilidad: exclusiva de Apple Silicon (MLX). No hay ruta CUDA ni ROCm para estos pesos.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo declarado son iPhones y Macs con memoria unificada de 8 GB o mas.
- Opciones de despliegue: la aplicacion Lantern (integracion nativa), mlx-lm en Mac mediante CLI (`mlx_lm.generate`) o su API de Python. No es compatible con vLLM, TGI, Ollama o llama.cpp usando estos pesos; para esas pilas haria falta una conversion a GGUF, que no se incluye en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RabiatS/Phi-3.5-mini-instruct-4bit-Lantern | 3,82 mil millones | no disponible | MIT | MLX 4 bits, 2,2 GB | Redistribucion para Lantern; 0 descargas y 0 likes en el momento de la consulta |
| mlx-community/Phi-3.5-mini-instruct-4bit | 3,82 mil millones | no disponible | MIT | MLX 4 bits | Origen de los pesos; el autor declara que no los ha modificado |
| microsoft/Phi-3.5-mini-instruct | 3,82 mil millones | no disponible | MIT | safetensors en precision completa | Modelo base original |
| Llama 3.2 3B Instruct (categoria similar) | en torno a 3,2 mil millones | consultar documentacion oficial | Llama 3.2 Community License | safetensors, GGUF y MLX por terceros | Alternativa de tamano comparable citada indirectamente por el propio autor al hablar de consumo de memoria; resto de especificaciones no incluidas en la informacion proporcionada |
| Qwen2.5-3B-Instruct (categoria similar) | en torno a 3,1 mil millones | consultar documentacion oficial | Apache 2.0 | safetensors, GGUF y MLX por terceros | Alternativa de tamano comparable; resto de especificaciones no incluidas en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: es una copia de una conversion existente, por lo que no aporta mejoras de calidad, entrenamiento adicional ni ajuste alguno.
- Cuantizacion de 4 bits: implica una perdida de precision respecto a los pesos en fp16 del modelo base, con impacto tipico en matematicas de varios pasos, formato estricto de salida y coherencia en contextos largos.
- Riesgo de alucinacion: inherente a un modelo denso de 3,8 mil millones de parametros; no debe usarse como fuente de verdad sin verificacion externa.
- Idiomas: el repositorio no declara idiomas soportados, asi que el rendimiento fuera del ingles no esta garantizado ni documentado.
- Memoria en dispositivos de 8 GB: el propio autor advierte que el consumo por palabra es aproximadamente tres veces el de un Llama de 3B, de modo que conversaciones largas pueden provocar presion de memoria o la finalizacion del proceso.
- Falta de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones publicadas ni informes de la comunidad.
- Etiqueta custom_code: la carga puede requerir `trust_remote_code=True` en determinados entornos, lo que implica revisar el codigo asociado antes de ejecutarlo.
- Metadatos contradictorios: el repositorio incluye la etiqueta `base_model:finetune:microsoft/Phi-3.5-mini-instruct` pese a que la model card afirma que los pesos no se han modificado.
- Fechas poco habituales: la creacion figura como 2026-09-28 y la ultima actualizacion dos minutos despues; conviene verificar la procedencia antes de integrarlo en produccion.
- Licencia: MIT permite uso comercial, pero se recomienda mantener la atribucion a Microsoft como autor del modelo y a mlx-community como autor de la conversion original.
- Restriccion de plataforma: al estar en formato MLX, no se puede desplegar en servidores con GPU NVIDIA o AMD sin una conversion previa a otro formato.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/Phi-3.5-mini-instruct-4bit-Lantern
- Conversion original de mlx-community: https://huggingface.co/mlx-community/Phi-3.5-mini-instruct-4bit
- Modelo base de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Repositorio de la aplicacion Lantern: https://github.com/RabiatS/lantern
