# mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF

## Resumen

MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF es la distribucion en formato GGUF del modelo Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc, una variante "uncensored" (abliterated/decensored) del MiniCPM5 de 1B parametros. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants estaticos e imatrix en Hugging Face, mientras que el modelo base deriva de la familia MiniCPM de OpenBMB. El resultado es un modelo de 1.080.632.832 parametros (1B) pensado para generacion de texto en ingles y chino, con enfasis en despliegue en dispositivo (on-device) y edge.

La propuesta de valor es doble. Por un lado, ofrece un modelo de contexto largo y soporte de tool calling en un tamano que cabe en hardware modesto (desde ~0,6 GB en Q2_K hasta ~2,3 GB en f16). Por otro, elimina los mecanismos de rechazo del modelo original mediante tecnicas de abliteration, lo que lo hace atractivo para investigacion sobre alineamiento, generacion creativa sin filtros y escenarios donde las respuestas evasivas son indeseables.

Es relevante ahora porque combina tres tendencias: la demanda de LLMs pequenos desplegables en local, el interes por variantes sin censura para investigacion, y la disponibilidad inmediata de cuantizaciones GGUF listas para llama.cpp y Ollama. La licencia Apache 2.0 facilita su uso comercial, aunque el caracter "uncensored" introduce riesgos que conviene evaluar antes de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MiniCPM5, tag "llama"), no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 1.080.632.832 (~1,08 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible el valor numerico exacto; el autor etiqueta el modelo como "long-context" |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (quants estaticos); quants imatrix/weighted en repo i1-GGUF |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo actual); el modelo base se distribuye en transformers/safetensors |
| Tamano del repo | 10,0 GB (incluye todas las variantes de cuantizacion) |
| Pipeline | text-generation |
| Libreria | transformers (metadatos); inferencia via llama.cpp/Ollama con GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia MiniCPM5 (etiquetado como "llama" en los tags), con 1.080.632.832 parametros reales confirmados en safetensors. No se dispone de informacion detallada sobre numero de capas, dimension oculta, numero de cabezas de atencion ni el mecanismo exacto de atencion empleado. El autor etiqueta el modelo como "long-context" y "tool-calling", lo que indica que el entrenamiento original incluyo datos para manejo de contexto extendido y para invocacion de herramientas.

La variante "Uncensored-Flawless-Peymandc" ha sido sometida a un proceso de abliteration/decensoring (tags "heretic", "abliterated", "decensored"), una tecnica que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO especificas para esta variante. El autor incluye el tag "reproducible", lo que sugiere que el proceso de creacion esta documentado, aunque el detalle no figura en la model card consultada.

La cuantizacion la realiza mradermacher con su pipeline estandar (quantize_version 2, output_tensor_quantised 1, convert_type hf), que genera quants estaticos con llama.cpp. Se ofrece ademas un repositorio paralelo con quants imatrix/weighted (i1-GGUF), recomendados cuando se busca mejor relacion calidad/tamano en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento de proposito general y respuesta a instrucciones (pipeline text-generation, tag "conversational").
- Soporte de tool calling / function calling segun los tags del autor.
- Capacidad de contexto largo (tag "long-context"), adecuada para documentos extensos, aunque el valor exacto de ventana no esta publicado.
- Orientado a despliegue on-device y edge-ai por su reducido tamano (1B parametros).
- Modo "uncensored": responde sin los rechazos tipicos del modelo alineado original, util para investigacion y generacion sin filtros.
- No se ha confirmado soporte de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con cuantizaciones Q4_K_M (~0,8 GB) el modelo cabe en moviles, Raspberry Pi 5 o mini-PC sin GPU dedicada, permitiendo un chatbot privado sin conexion.
- Procesamiento de documentos largos en el borde: el tag long-context permite resumir o extraer informacion de contratos, articulos o transcripciones en un portatil, sin enviar datos a la nube.
- Automatizacion de agentes con tool calling: integrable en flujos donde el modelo decide que funcion invocar (APIs, busquedas, calculos) en entornos con recursos limitados.
- Investigacion sobre alineamiento y seguridad: la variante abliterated sirve para estudiar como se distribuyen las direcciones de rechazo y comparar comportamientos frente al modelo base.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido donde el modelo alineado original introducia evasivas o rechazos.
- Prototipado rapido y pruebas de concepto: al ser Apache 2.0 y pesar menos de 1 GB en Q4, se puede iterar en CI/CD o en notebooks sin coste de GPU.
- Traduccion y asistencia bilingue en/zh: util para aplicaciones de soporte en mercados chinos y angloparlantes con despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni comparativas numericas con otros modelos. Tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,6 GB
  - Q4_K_M / Q4_K_S: ~0,8 GB
  - Q6_K: ~1,0 GB
  - Q8_0: ~1,3 GB
  - f16: ~2,3 GB
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar el modelo completo en f16; en Q4 cabe incluso en iGPU modernas (Intel Iris Xe, AMD Radeon 780M) y en Apple Silicon.
- Cabe en consumer GPU: si, en todas las GPU dedicadas actuales y en muchas integradas, incluso en f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). El modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (1B) se espera generacion en tiempo real en CPU moderna y muy rapida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Uncensored-Flawless-Peymandc (este) | 1,08 B | long-context (valor no publicado) | Apache 2.0 | GGUF, safetensors | Variante uncensored, en/zh, tool calling |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32K (segun model card publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo alineado, multilingue amplio |
| Llama 3.2 1B Instruct | 1,24 B | 128K (segun model card de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alineado, contexto muy largo, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8K (segun model card de HuggingFace) | Apache 2.0 | safetensors, GGUF | Enfocado en edge, alineado |

Nota: los datos de los modelos comparables provienen de sus model cards publicas; no se dispone de benchmarks del modelo de esta ficha para una comparacion numerica directa.

## Limitaciones y advertencias

- Al ser una variante "uncensored"/abliterated, el modelo puede generar contenido ofensivo, ilegal o danino sin rechazo. No es adecuado para aplicaciones de cara al publico sin capas de moderacion externas.
- La abliteration puede degradar capacidades generales (razonamiento, coherencia, instrucciones) respecto al modelo base alineado; conviene validar tareas concretas.
- Riesgo de alucinacion elevado por el reducido tamano (1B parametros): no es fiable para datos factuales sin verificacion.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- El contexto "long-context" no tiene valor numerico publicado, lo que impide planificar el troceado de documentos con precision.
- Licencia Apache 2.0 permite uso comercial, pero el caracter uncensored traslada al desplegador la responsabilidad legal y etica del contenido generado.
- No se aportan benchmarks ni evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- El repo pesa 10 GB por acumular todas las cuantizaciones; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Modelo base: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Quants imatrix/weighted: https://huggingface.co/mradermacher/MiniCPM5-1B-Uncensored-Flawless-Peymandc-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
