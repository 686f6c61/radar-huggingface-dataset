# mradermacher/PrimeMind-0.8B-GGUF

## Resumen

PrimeMind-0.8B-GGUF es el conjunto de cuantizaciones en formato GGUF publicadas por el usuario mradermacher a partir del modelo base CrowdMind/PrimeMind-0.8B. No se trata, por tanto, de un modelo entrenado por mradermacher, sino de una conversion estatica (static quants) del modelo original a distintos niveles de precision para su ejecucion en llama.cpp y en cualquier runtime compatible con GGUF. El recuento de parametros reportado en safetensors para el modelo base es de 752.393.024 parametros, es decir, aproximadamente 0,75 mil millones, lo que lo situa en la gama de modelos pequenos orientados a inferencia local.

La relevancia de esta publicacion es practica: el repositorio ofrece trece variantes de cuantizacion (desde x-f16 hasta Q2_K, incluyendo IQ4_XS), lo que permite desplegar el modelo en hardware muy modesto, desde CPU sin GPU dedicada hasta GPUs de consumo de gama baja. El repositorio ocupa 7,5 GB en total, contabilidad que corresponde a la suma de todos los ficheros de cuantizacion, no a una unica variante.

La informacion publicada es extremadamente limitada: la model card del repositorio de cuantizaciones no incluye datos de arquitectura, licencia, idiomas, longitud de contexto ni benchmarks. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (unicamente paginas corporativas de Microsoft, sin relacion con PrimeMind). Por tanto, buena parte de las especificaciones de esta ficha figuran como "no disponible" y deben confirmarse consultando el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card; el modelo base se distribuye en safetensors y se ha convertido a GGUF) |
| Parametros totales | 752.393.024 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo base en safetensors) |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |
| Tamano del repositorio | 7,5 GB (conjunto de todas las cuantizaciones) |
| Tipo de conversion | convert_type: hf, quantize_version: 2, output_tensor_quantised: 1 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card del repositorio de cuantizaciones se limita a indicar que se trata de "static quants" del modelo CrowdMind/PrimeMind-0.8B, sin describir la topologia de red, el tipo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. El recuento de 752.393.024 parametros y la ausencia de mencion a expertos apuntan a un modelo denso de tamano reducido, pero esto es una inferencia a partir de los metadatos, no un dato confirmado.

Los unicos detalles tecnicos verificables proceden de los metadatos de conversion incluidos en la model card: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Estos campos indican que la conversion se realizo desde pesos de HuggingFace (safetensors) mediante el flujo habitual de llama.cpp y que la cuantizacion se aplico a nivel de tensores. No hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, MoE, SSM ni arquitecturas hibridas).

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` es la unica capacidad declarada explicitamente en los metadatos del repositorio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse en infraestructuras compatibles con la API de inferencia de HuggingFace, aunque no se detalla el formato de plantilla de chat.
- Ejecucion en llama.cpp: al estar en formato GGUF, el modelo es ejecutable en llama.cpp y en los runners derivados (Ollama, LM Studio, koboldcpp, entre otros).
- Razonamiento complejo, codigo, matematicas: no disponible (sin datos ni benchmarks publicados).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Vision, audio u otras modalidades: no disponible (los metadatos de conversion no incluyen `mmproj`, lo que sugiere ausencia de proyector multimodal, aunque no se confirma).

## Casos de uso

- Asistente conversacional local sin conexion: al ser un modelo de ~0,75 mil millones de parametros en GGUF, puede ejecutarse en un portatil o incluso en una CPU moderna para mantener dialogos simples de un solo dominio, sin enviar datos a servicios externos.
- Prototipado rapido de interfaces de chat: util para validar plantillas de prompt, flujos de UI y esquemas de streaming antes de migrar a un modelo mayor, gracias a los tiempos de carga reducidos de las cuantizaciones Q4_K_M o Q2_K.
- Clasificacion y etiquetado de texto corto: resumen de una linea, extraccion de intencion o categorizacion de mensajes, tareas donde un modelo pequeno puede bastar si se restringe el formato de salida.
- Generacion de texto de relleno para pruebas de integracion: en pipelines de CI/CD o en pruebas de carga de un backend de inferencia, una cuantizacion Q2_K (~0,3 GB) permite levantar el servicio con un consumo minimo de recursos.
- Educacion y experimentacion: entorno de bajo coste para estudiar tecnicas de cuantizacion, comparar perplejidad entre niveles Q2_K, Q4_K_M y Q8_0, o reproducir experimentos de evaluacion en hardware de gama baja.
- Despliegue en dispositivos de borde: con cuantizaciones Q4 o inferiores, el modelo cabe en dispositivos con pocos gigabytes de RAM, lo que habilita asistentes embebidos en kioscos, routers o mini-PC industriales.
- Filtrado previo en cascada: uso como primer nivel de un sistema de dos etapas que derive al modelo grande solo las consultas que el modelo pequeno no resuelva con confianza suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y la busqueda web no devolvio documentacion tecnica asociada al modelo.

## Requisitos de hardware

Los tamanos de fichero que se indican a continuacion son estimaciones calculadas a partir del recuento de parametros (752.393.024) y del numero de bits por peso de cada esquema de cuantizacion; no figuran desglosados en la informacion proporcionada.

- VRAM/RAM estimada para inferencia:
  - x-f16: en torno a 1,5 GB de pesos.
  - Q8_0: en torno a 0,8 GB.
  - Q6_K: en torno a 0,6 GB.
  - Q5_K_M / Q5_K_S: en torno a 0,55 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 0,45-0,5 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 0,35-0,4 GB.
  - Q2_K: en torno a 0,3 GB.
  - A esas cifras hay que anadir el cache KV, que depende de la longitud de contexto efectiva (no disponible) y del numero de capas.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM permite ejecutar las cuantizaciones Q4 y superiores; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. Para x-f16 bastan 3-4 GB de VRAM. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos diez anos puede alojar las cuantizaciones Q4 o inferiores, y las variantes Q2_K y Q3_K tambien caben en iGPU con memoria compartida.
- Ejecucion en CPU: viable en todas las variantes; con Q4_K_M el modelo puede correr en un portatil con 8 GB de RAM sin GPU dedicada.
- Opciones de despliegue: llama.cpp (referencia directa para este formato), Ollama, LM Studio, koboldcpp, text-generation-webui y servidores con soporte GGUF. vLLM y TGI admiten GGUF de forma parcial y requieren verificacion de compatibilidad con esta conversion concreta.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en ningun hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de PrimeMind-0.8B, por lo que la comparacion se limita a caracteristicas verificables de otros modelos pequenos de uso comun en el mismo rango. Los datos de la columna ajena corresponden a la documentacion publica de cada proyecto y deben confirmarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| PrimeMind-0.8B | 752.393.024 | no disponible | no disponible | si (este repositorio) |
| Qwen2.5-0.5B | ~0,49 B | 32 768 tokens | Apache-2.0 | si |
| Qwen3-0.6B | ~0,6 B | 32 768 tokens | Apache-2.0 | si |
| Llama-3.2-1B | ~1,24 B | 128 000 tokens | Llama 3.2 Community License | si |
| SmolLM2-360M | ~0,36 B | 8 192 tokens | Apache-2.0 | si |

Comparativa de rendimiento: no disponible, al no existir benchmarks publicados de PrimeMind-0.8B que permitan una comparacion homogenea.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: elevado por construccion en modelos de menos de mil millones de parametros. No se ha publicado ninguna evaluacion de fidelidad factual.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y la lista de idiomas soportados. No debe asumirse un comportamiento multilingue correcto sin evaluacion previa.
- Licencia: no disponible. No se puede confirmar que el uso comercial este permitido. Es imprescindible consultar la licencia del modelo base CrowdMind/PrimeMind-0.8B antes de cualquier despliegue en produccion, ya que la licencia del repositorio de cuantizaciones puede heredar restricciones del modelo original.
- Trazabilidad: se trata de una conversion de terceros, no de una publicacion del autor original del modelo. Las cuantizaciones pueden introducir degradacion adicional respecto a los pesos en safetensors, especialmente en Q2_K y Q3_K_S.
- Ausencia de soporte: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los metadatos indican una fecha de publicacion de 2026-09-11, posterior a la fecha habitual de consulta. Esto sugiere un artefacto muy reciente o poco difundido, sin comunidad ni mantenimiento conocidos.
- Idoneidad para produccion: no recomendado para tareas de razonamiento complejo, generacion de codigo, matematicas o uso agentico sin una evaluacion exhaustiva previa.
- Verificacion obligatoria: antes de integrar el modelo, conviene validar la plantilla de chat esperada, la longitud de contexto real y el comportamiento en el idioma objetivo, datos todos ellos ausentes en la informacion disponible.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/PrimeMind-0.8B-GGUF
- Modelo base: https://huggingface.co/CrowdMind/PrimeMind-0.8B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime de referencia para GGUF): https://github.com/ggerganov/llama.cpp
- Paper tecnico, blog o repositorio del modelo original: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la busqueda web: no se encontro informacion relevante sobre el modelo; los resultados devueltos correspondian a paginas corporativas de Microsoft sin relacion con PrimeMind.
