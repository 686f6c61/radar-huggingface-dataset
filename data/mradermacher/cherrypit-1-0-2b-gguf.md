# mradermacher/CherryPit-1.0-2B-GGUF

## Resumen

CherryPit-1.0-2B es un modelo de lenguaje de aproximadamente 2.500 millones de parametros (2.516.756.480 segun los pesos en safetensors) desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) y construido sobre MiniCPM5-2B. Esta orientado a tareas de codigo, razonamiento, matematicas y tool calling, con un enfoque explicito hacia el despliegue en dispositivo (on-device) gracias a su tamano reducido. La version aqui descrita es la cuantizacion GGUF publicada por mradermacher, que facilita su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo se presenta como una actualizacion directa (drop-in upgrade) de su base MiniCPM5-2B: mantiene la misma arquitectura, tamano y velocidad, pero incorpora mejoras notables en generacion de codigo y ganancias mas moderadas en matematicas y razonamiento. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en producto.

La relevancia actual de este modelo radica en la tendencia hacia modelos pequenos especializados que puedan ejecutarse localmente con latencia baja y sin dependencia de APIs en la nube. Su combinacion de tamano contenido, soporte declarado de tool calling y licencia permisiva lo posiciona como candidato para asistentes de codigo locales, agentes ligeros y automatizacion embebida. No obstante, la informacion publica disponible es escasa: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en MiniCPM5-2B; detalles no disponibles) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun model card y tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

CherryPit-1.0-2B es un transformer denso de aproximadamente 2.500 millones de parametros construido sobre MiniCPM5-2B. La model card del autor indica que mantiene la misma arquitectura, tamano y velocidad que el modelo base, por lo que se trata de un ajuste o refinamiento sobre MiniCPM5-2B mas que de una arquitectura nueva. No se especifican en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion ni si se emplearon tecnicas como GQA o atencion lineal.

Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. La unica informacion concreta sobre el entrenamiento es la declaracion de mejoras relativas: una ganancia comparativamente grande en codigo y ganancias pequenas en matematicas y razonamiento respecto al modelo base. Esta version GGUF es una cuantizacion estatica realizada por mradermacher; no se han publicado (por este autor) cuantizaciones ponderadas con imatrix.

## Capacidades

- Generacion de texto conversacional en ingles.
- Generacion de codigo y asistencia a la programacion (tag `code`, `coding`).
- Razonamiento y matematicas, con mejoras moderadas respecto a MiniCPM5-2B (tags `reasoning`, `math` en la version 1.1).
- Tool calling / function calling declarado en los tags del modelo.
- Orientado a despliegue on-device y como small language model.
- Capacidad de ejecucion local mediante GGUF y llama.cpp.
- No se documentan capacidades multimodales (vision, audio) en la informacion disponible.
- No se documenta un modo de razonamiento extendido (thinking mode) en la informacion disponible.
- Soporte multilingue limitado al ingles segun la model card.

## Casos de uso

- Asistente de codigo local en el IDE: el modelo puede autocompletar y generar fragmentos de codigo en un equipo de desarrollo sin enviar codigo propietario a servicios externos, gracias a su tamano de ~2,5 B y a las cuantizaciones Q4 que ocupan menos de 2 GB.
- Agente ligero con tool calling en el borde: su soporte declarado de function calling permite construir agentes que invoquen APIs o scripts locales en entornos con recursos limitados, como mini-PC o dispositivos embebidos.
- Automatizacion de tareas de scripting y CI/CD: puede generar y revisar scripts de build o parches sencillos dentro de un pipeline, ejecutandose en el propio runner sin coste de API.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo pequeno con licencia Apache 2.0, sirve para validar productos de chat en ingles antes de escalar a modelos mayores.
- Educacion y ejercicios de matematicas basicas: las mejoras declaradas en matematicas permiten usarlo como tutor local para problemas de nivel introductorio, siempre con supervision.
- Procesamiento de texto en local con privacidad: clasificacion, resumen o extraccion de informacion en documentos sensibles que no pueden salir de la organizacion, ejecutando el modelo en CPU o GPU de consumo.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer 12 variantes GGUF desde Q2_K hasta f16, es util para medir el impacto de la cuantizacion en calidad y velocidad en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K, 1,6-1,7 GB con Q4_K_S/Q4_K_M, 2,2 GB con Q6_K, 2,8 GB con Q8_0 y 5,1 GB con f16 (tamanos de fichero indicados por el autor; la VRAM real anade overhead de contexto KV).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4; una RTX 3060/4060 o superior ofrece margen comodo. Para f16 se recomienda 8 GB o mas (RTX 3070/4070 en adelante). En entornos de servidor, A100 o H100 no son necesarias para este tamano y resultarian sobredimensionadas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; las cuantizaciones Q2-Q4 tambien permiten ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), y servidores compatibles con GGUF; los tags indican `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan los pesos originales en safetensors del repo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CherryPit-1.0-2B | ~2,5 B | no disponible | Codigo, razonamiento, tool calling, on-device | Apache 2.0 | GGUF en HF (mradermacher); base en DRUPEs |
| MiniCPM5-2B (modelo base) | ~2 B | no disponible | Proposito general | no disponible en la informacion | HF |
| CherryPit-1.1-2B | ~2 B | no disponible | Codigo, matematicas, razonamiento, tool calling | Apache 2.0 | GGUF en HF (mradermacher) |

La informacion disponible no permite comparar rendimiento numerico con alternativas de la misma categoria (por ejemplo, Qwen2.5-Coder-1.5B o Phi-3-mini), ya que no se han publicado benchmarks de CherryPit-1.0-2B. La comparacion mas directa es con su propio modelo base MiniCPM5-2B, del que se declara una mejora en codigo y ganancias menores en matematicas y razonamiento, y con la version 1.1 del mismo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos web en ingles, es esperable un sesgo hacia contenido angloparlante y occidental, pero no hay confirmacion publica.
- Riesgo de alucinacion: inherente a los modelos de ~2 B; la capacidad limitada de parametros incrementa la probabilidad de errores factuales, especialmente en matematicas y codigo complejo.
- Limitaciones de idioma: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene revisar la licencia del modelo base MiniCPM5-2B, que no se detalla en la informacion disponible.
- Caveat de produccion: la version evaluada es una cuantizacion GGUF de un tercero (mradermacher), no los pesos oficiales; para produccion conviene validar la calidad de la cuantizacion elegida frente a los safetensors originales.
- Ausencia de benchmarks: sin resultados publicados, cualquier decision de adopcion deberia basarse en evaluaciones propias sobre el caso de uso concreto.
- Fecha de creacion del repositorio (2026-11-06) y cero descargas/likes: el modelo carece de validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/CherryPit-1.0-2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.0-2B
- Version GGUF 1.1: https://huggingface.co/mradermacher/CherryPit-1.1-2B-GGUF
- Version GGUF 1.0 del autor original: https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#CherryPit-1.0-2B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
