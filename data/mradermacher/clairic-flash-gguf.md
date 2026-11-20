# mradermacher/clairic-flash-GGUF

## Resumen

clairic-flash es un modelo de lenguaje conversacional de aproximadamente 9.200 millones de parametros, publicado originalmente por Cloudflare y distribuido en formato GGUF por el usuario mradermacher. El repositorio que nos ocupa no contiene los pesos originales, sino un conjunto de cuantizaciones estaticas generadas a partir del modelo base, lo que facilita su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica de acceso al modelo para desarrolladores que no disponen de GPUs de datacenter. Al tratarse de una conversion de terceros, la informacion tecnica disponible es limitada: la model card original no acompana a este repositorio y el autor de la cuantizacion solo documenta los tipos de cuantizacion generados y el origen de los pesos.

El modelo pertenece a la categoria de LLMs densos de ~9B parametros, un tramo de tamano que equilibra calidad de generacion y coste de inferencia. No se dispone de informacion publica sobre arquitectura exacta, contexto maximo, datos de entrenamiento ni licencia en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso de ~9B, segun recuento de parametros) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no aplica (no se ha documentado como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo de Cloudflare |
| Tamano del repositorio | 71,9 GB (conjunto completo de cuantizaciones) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1 |
| Tipo de conversion | hf |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El recuento de parametros (9.197.093.888) corresponde a un transformer denso de aproximadamente 9,2B parametros, pero no se confirma el tipo de atencion, la funcion de activacion, el tokenizador ni la longitud de contexto nativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o instruction tuning.

Lo unico verificable es el proceso de cuantizacion: las etiquetas de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversion desde pesos en formato Hugging Face (safetensors) mediante la herramienta de cuantizacion de llama.cpp. El repositorio incluye tanto cuantizaciones K-quant clasicas (Q2_K a Q8_0) como la variante IQ4_XS de la familia i-quant, ademas de una version f16 sin perdida. No se ha documentado ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de inferencia de Hugging Face.
- Inferencia local: al distribuirse en GGUF, es ejecutable en llama.cpp, Ollama y otros runtimes compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales autoalojados: el modelo puede desplegarse en un servidor propio con llama.cpp u Ollama para gestionar conversaciones multi-turno sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad. La ventana de contexto real debe validarse empiricamente al no estar documentada.
- Prototipado rapido en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo cabe en GPUs de consumo de 8-12 GB de VRAM, lo que permite iterar sobre prompts y plantillas de chat en local antes de escalar a produccion.
- Chatbots de soporte interno: al ser un modelo de ~9B parametros, ofrece un coste de inferencia moderado para desplegar atencion a empleados o documentacion interna, siempre que se valide su calidad en el dominio concreto mediante evaluacion propia.
- Generacion de texto en pipelines por lotes: la version f16 y Q8_0 permiten procesar volumenes de texto con perdida de calidad minima en tareas de resumen, clasificacion o reescritura, ejecutandose en una sola GPU de 24 GB.
- Experimentacion en investigacion: el conjunto de cuantizaciones (desde Q2_K hasta f16) facilita estudios de degradacion por cuantizacion, comparando la salida del modelo en distintos niveles de precision sobre el mismo hardware.
- Despliegue en dispositivos con VRAM limitada: la cuantizacion Q2_K o IQ4_XS permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con RAM suficiente, util para demos y entornos de borde donde no se requiere maxima fidelidad.
- Evaluacion comparativa de modelos: al estar disponible en multiples formatos, puede integrarse en arneses de evaluacion (por ejemplo, con `llama-cpp-python`) para medir latencia y throughput frente a otros modelos de ~9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion):
  - f16: ~18,4 GB (pesos) + overhead de contexto, recomendable 24 GB.
  - Q8_0: ~9,8 GB, recomendable 12-16 GB.
  - Q6_K: ~7,6 GB, recomendable 10-12 GB.
  - Q5_K_M: ~6,5 GB, recomendable 8-10 GB.
  - Q4_K_M: ~5,6 GB, recomendable 8 GB.
  - Q3_K_M: ~4,5 GB, recomendable 6-8 GB.
  - Q2_K: ~3,4 GB, recomendable 6 GB.
  - IQ4_XS: ~5,1 GB, recomendable 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para la version f16 con contexto largo; RTX 4090 (24 GB) para Q8_0 y superiores; RTX 4080/4070 Ti (16 GB) para Q6_K; RTX 4060 Ti 16 GB o RTX 3070 (8 GB) para Q4_K_M e IQ4_XS.
- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en tarjetas de 8 GB; las cuantizaciones Q2_K y Q3_K permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, `llama-cpp-python`, servidores compatibles con la API de OpenAI que acepten backend GGUF; tambien es posible servir la version f16 con vLLM o TGI si se dispone de los pesos originales en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. Como referencia orientativa para un modelo denso de ~9B en una RTX 4090 con Q4_K_M, cabria esperar decenas de tokens por segundo, pero este dato no esta confirmado en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto del modelo que permitan una comparacion rigurosa. Se ofrece una comparacion estructural con alternativas del mismo tramo de tamano, indicando explicitamente los campos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| clairic-flash (esta ficha) | ~9,2B | no disponible | no disponible | GGUF (via mradermacher) | Modelo base de Cloudflare; sin benchmarks publicos en la informacion disponible |
| Alternativas de ~7-9B | ~7-9B | variable | variable | safetensors/GGUF | No se identifican modelos comparables concretos en la informacion proporcionada |

No disponible: no se han proporcionado modelos de referencia con los que comparar parametros, contexto, rendimiento y licencia de forma verificable.

## Limitaciones y advertencias

- Ausencia de model card: el repositorio GGUF no incluye la documentacion del modelo original, por lo que se desconocen la plantilla de chat, el formato de prompt y las recomendaciones de uso.
- Licencia no declarada: no se especifica la licencia del modelo base ni de las cuantizaciones; antes de un uso comercial es imprescindible consultar el repositorio original de Cloudflare para confirmar los terminos.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks publicados, no puede estimarse su fiabilidad factual.
- Sesgos: no documentados. Al desconocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; se recomienda validar empiricamente la ventana de contexto efectiva y el rendimiento en castellano antes de desplegar.
- Cuantizaciones de baja precision: Q2_K y Q3_K pueden degradar notablemente la coherencia y el razonamiento; para produccion se recomienda Q4_K_M o superior.
- Conversion de terceros: al tratarse de una cuantizacion no oficial, no hay garantia de equivalencia exacta con el modelo original; conviene verificar la calidad de las salidas frente a los pesos en safetensors.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-11-20, lo que puede indicar un error de metadatos o una fecha futura; conviene contrastar la vigencia del modelo.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse su uso en pipelines de agentes sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/clairic-flash-GGUF
- Modelo base (Cloudflare): https://huggingface.co/Cloudflare/clairic-flash
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
