# mradermacher/Luth-LFM2-1.2B-GGUF

## Resumen

Luth-LFM2-1.2B-GGUF es la distribucion en formato GGUF del modelo Luth-LFM2-1.2B, un ajuste fino supervisado (SFT) del modelo base LiquidAI LFM2 de 1,2 mil millones de parametros. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir del modelo original de kurakurai. El modelo esta disenado para conversacion en frances e ingles y se distribuye con una bateria completa de cuantizaciones estaticas pensadas para ejecucion local en CPU y GPU de gama baja.

La relevancia de esta ficha reside en que permite ejecutar un modelo conversacional bilingue (fr/en) en hardware muy modesto: la cuantizacion Q4_K_M ocupa apenas 0,8 GB, lo que lo hace viable en portatiles sin GPU dedicada o en dispositivos de borde. Se apoya en la arquitectura LFM2 de Liquid AI, optimizada para inferencia eficiente en el edge, y se ha ajustado sobre el dataset kurakurai/luth-sft.

El modelo tiene 1.170.340.608 parametros totales (segun los pesos en safetensors del modelo base) y se distribuye bajo licencia LFM 1.0, que impone restricciones de uso comercial. Esta ficha cubre exclusivamente la version GGUF cuantizada; los detalles de entrenamiento original corresponden al modelo base kurakurai/Luth-LFM2-1.2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid AI), transformer optimizado para edge; detalles finos no disponibles |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix i1 en repo separado |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | LFM 1.0 (lfm1.0, "other") |
| Formato de pesos | GGUF (transformers como libreria declarada) |
| Tamano del repo | 10,6 GB (incluye todas las cuantizaciones) |
| Modelo base | kurakurai/Luth-LFM2-1.2B |
| Dataset de ajuste | kurakurai/luth-sft |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, una familia de modelos compactos disenada para inferencia eficiente en dispositivos de borde. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, el mecanismo de atencion concreto (si emplea atencion lineal, convoluciones o hibridacion) ni la composicion exacta del bloque transformer. El modelo base cuenta con 1.170.340.608 parametros.

El ajuste fino se realizo mediante SFT sobre el dataset kurakurai/luth-sft, orientado a conversacion bilingue frances-ingles. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La version aqui descrita es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) generada por mradermacher con conversion desde pesos Hugging Face; existe ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (i1) de mayor calidad.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Respuesta multi-turno en formato chat (etiqueta "conversational" en el modelo).
- Ajuste fino supervisado orientado a instrucciones y dialogo.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue via Inference Endpoints de Hugging Face.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio) gracias al formato GGUF.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local en frances: el modelo puede desplegarse en un portatil sin GPU usando la cuantizacion Q4_K_M (0,8 GB) y ofrecer respuestas en frances con baja latencia, adecuado para prototipos de chatbots de escritorio o demos offline.
- Traduccion y asistencia bilingue fr-en: al estar ajustado en ambos idiomas, sirve para tareas de reformulacion, resumen o traduccion informal en entornos donde no se puede enviar texto a la nube.
- Procesamiento en el borde (edge computing): con cuantizaciones de 0,6-0,8 GB cabe en dispositivos con 2-4 GB de RAM, lo que permite integraciones en Raspberry Pi, moviles o sistemas embebidos con llama.cpp.
- Filtrado y clasificacion de texto ligera: tareas de etiquetado, moderacion o extraccion de informacion en pipelines de bajo coste donde un modelo de 1,2B es suficiente y se prioriza el throughput.
- Generacion de respuestas en aplicaciones de privacidad estricta: al ejecutarse completamente en local, es apto para dominios (salud, legal, RRHH) donde los datos no pueden salir del dispositivo.
- Base para experimentacion e investigacion: por su tamano reducido y su licencia abierta (con restricciones), sirve como banco de pruebas para estudiar el comportamiento de modelos LFM2 ajustados en frances, o como punto de partida para nuevos fine-tunings.
- Despliegue en endpoints serverless: la etiqueta endpoints_compatible permite servirlo en Hugging Face Inference Endpoints con coste minimo por su baja huella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~0,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~0,7 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~0,8 GB
  - Q5_K_S / Q5_K_M: ~0,9 GB
  - Q6_K: ~1,1 GB
  - Q8_0: ~1,3 GB
  - f16: ~2,4 GB
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); tambien funciona integramente en CPU. Para mayor throughput, A100/H100 no aportan ventaja significativa a este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, Hugging Face Inference Endpoints (tag endpoints_compatible). vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (1,2B) y las cuantizaciones de 4 bits, se espera inferencia en tiempo real en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar de la familia Liquid y del ecosistema general:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Luth-LFM2-1.2B (este) | 1,17B | no disponible | fr, en | LFM 1.0 | GGUF |
| LFM2-1.2B (base Liquid AI) | ~1,2B | no disponible | en (principal) | LFM 1.0 | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,24B | 128K (segun documentacion publica de Meta) | multilingue | Llama 3.2 Community | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de sus fichas publicas habituales; no se han verificado en la informacion proporcionada para esta ficha y deben confirmarse en las fuentes oficiales. El principal diferenciador de Luth-LFM2-1.2B es su ajuste especifico en frances y su licencia LFM 1.0, mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Licencia LFM 1.0: no es una licencia de codigo abierto plena; impone restricciones para uso comercial. Es imprescindible revisar el archivo LICENSE del modelo base antes de integrarlo en productos.
- Idiomas limitados: solo frances e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo de 1,2B, la fidelidad factua es limitada; no debe usarse como fuente de verdad sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del dataset kurakurai/luth-sft se desconocen.
- Contexto: la longitud de contexto no esta publicada; planificar las aplicaciones sin asumir ventanas largas.
- Capacidades avanzadas no confirmadas: no hay evidencia de soporte de tool calling, agentes o vision; no asumir estas funciones en produccion.
- Es una cuantizacion de comunidad: la calidad puede diferir del modelo original en safetensors; para maxima fidelidad usar Q8_0 o f16, y para mejor relacion calidad/tamano las variantes i1 (imatrix) del repo hermano.
- Sin benchmarks publicados: la evaluacion de calidad debe hacerse mediante pruebas propias antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luth-LFM2-1.2B-GGUF
- Modelo base: https://huggingface.co/kurakurai/Luth-LFM2-1.2B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Luth-LFM2-1.2B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Luth-LFM2-1.2B-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/kurakurai/luth-sft
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
