# Abu-Dju/AIC-1-Q8_0-GGUF

## Resumen

AIC-1-Q8_0-GGUF es una conversión al formato GGUF del modelo Applied-Innovation-Center/AIC-1, un modelo de lenguaje de aproximadamente 32.763.876.352 parámetros (unos 32,8 mil millones). La conversión la ha realizado el usuario Abu-Dju mediante la herramienta llama.cpp y el espacio GGUF-my-repo de ggml.ai, un flujo estándar para empaquetar pesos en GGUF y facilitar su ejecución en CPU, GPU y hardware mixto con el ecosistema llama.cpp.

El repositorio contiene el checkpoint cuantizado en Q8_0, una cuantización de 8 bits que conserva prácticamente la calidad del modelo original a cambio de un tamaño en disco elevado: 34,8 GB en total. Está pensado para quienes quieren ejecutar el modelo base sin depender de safetensors ni de frameworks de inferencia propietarios, usando herramientas como llama-cli, llama-server, Ollama o servidores compatibles con el formato GGUF.

El modelo declara soporte de los idiomas árabe (ar) e inglés (en) y se publica bajo licencia Apache 2.0. Es relevante ahora porque el formato GGUF y llama.cpp son el camino más directo para desplegar modelos de 32B en infraestructura propia con control total sobre cuantización y memoria. La información pública disponible sobre esta conversión es mínima: no se detalla arquitectura, contexto ni datos de entrenamiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (compatible con llama.cpp; el modelo base no detalla su arquitectura en la informacion proporcionada) |
| Parametros totales | 32.763.876.352 (unos 32,8 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible (el README usa `-c 2048` solo como ejemplo de invocacion, no como maximo del modelo) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado en este repositorio) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo `aic-1-q8_0.gguf`); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Applied-Innovation-Center/AIC-1 en los datos proporcionados. El hecho de que se haya podido convertir a GGUF con llama.cpp indica que es compatible con las arquitecturas que soporta dicha herramienta (tipicamente modelos transformer de la familia Llama y derivados), pero no se confirma ni el tipo de atencion, ni si emplea mezcla de expertos, ni si incorpora mecanismos híbridos.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineacion. La unica innovacion tecnica verificable en este repositorio concreto es la propia conversión: el empaquetado en GGUF con cuantizacion Q8_0, que reduce el modelo a 34,8 GB y lo hace ejecutable en llama.cpp sin necesidad de infraestructura de servidor propietaria.

## Capacidades

- Generacion de texto en arabe e ingles, segun los idiomas declarados en los metadatos del repositorio.
- Compatibilidad con text-generation-inference y con endpoints compatibles (`endpoints_compatible` aparece entre las etiquetas del repositorio), lo que sugiere posible uso detras de APIs compatibles con OpenAI.
- Ejecucion local mediante llama.cpp, lo que habilita inferencia en CPU, GPU o reparto entre ambos.
- No hay informacion disponible sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo de pensamiento (thinking), vision, audio ni otras capacidades especiales.
- No hay informacion disponible sobre capacidades especificas de codigo, matematicas o razonamiento medido con benchmarks.

## Casos de uso

- Despliegue local en hardware propio: al estar en GGUF Q8_0 y pesar 34,8 GB, se puede servir con llama-server en una maquina con suficiente VRAM o RAM para ofrecer generacion de texto sin depender de servicios en la nube.
- Procesamiento de textos en arabe e ingles: el modelo declara ambos idiomas, de modo que encaja en tareas de redaccion, resumen o traduccion entre ellos, siempre que se validen los resultados, ya que no hay benchmarks publicados.
- Integracion en pipelines internos de generacion de texto: mediante la API compatible con OpenAI que ofrecen servidores GGUF como llama-server, se puede conectar a aplicaciones existentes que ya consumen ese formato.
- Laboratorios de investigacion y experimentacion: al ser una cuantizacion de 8 bits de un modelo de 32B, permite estudiar la perdida de calidad frente al modelo original en safetensors comparando salidas entre ambos checkpoints.
- Prototipado rapido sin GPU dedicada: llama.cpp permite ejecutar el modelo en CPU con RAM suficiente (por encima de los 35 GB), util para validar ideas antes de invertir en GPUs.
- Evaluacion comparativa de cuantizaciones: sirve como referencia Q8_0 para medir el impacto de cuantizaciones mas agresivas (Q4, Q5) sobre el mismo modelo base en tareas concretas del usuario.
- Uso educativo: el repositorio documenta paso a paso la instalacion de llama.cpp y la invocacion del modelo, lo que lo hace util como material practico para aprender a desplegar LLM en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda proporcionados incluyen datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica para el modelo AIC-1 ni para su cuantizacion Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: el archivo pesa aproximadamente 34,8 GB, por lo que se necesitan del orden de 36-40 GB de memoria disponible (VRAM o combinacion de VRAM y RAM) contando el contexto y el overhead de llama.cpp. Es una estimacion basada en el tamano del repositorio, no un dato oficial.
- GPU recomendadas: A100 80 GB, H100 80 GB o A6000 48 GB pueden alojar el modelo completo en VRAM con margen para contexto.
- Configuraciones multi-GPU: dos RTX 4090 (24 GB cada una, 48 GB en total) permiten repartir el modelo por capas con llama.cpp u otros servidores que soporten sharding.
- GPU de consumo: no cabe en una sola GPU de consumo de 24 GB (RTX 3090, 4090, 5090) a cuantizacion Q8_0. Para esas tarjetas habria que recurrir a cuantizaciones mas bajas (Q4_K_M, Q5_K_M), que este repositorio no publica.
- CPU y RAM: llama.cpp permite ejecutarlo en CPU con al menos 35 GB de RAM disponible; el rendimiento sera muy inferior al de GPU, pero funcional para pruebas.
- Opciones de despliegue: llama-cli y llama-server (documentados en el README), Ollama y otras herramientas que consuman GGUF. El repositorio tambien declara la etiqueta `text-generation-inference`, aunque TGI soporta GGUF de forma limitada; vLLM tiene soporte parcial de GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la longitud de contexto y del backend; no se aportan mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto ni arquitectura del modelo AIC-1 que permitan una comparacion rigurosa. A continuacion se listan alternativas de tamano similar publicadas por el mismo autor de la cuantizacion, con los campos que no constan marcados como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Abu-Dju/AIC-1-Q8_0-GGUF | 32,8 mil millones | no disponible | apache-2.0 | GGUF (Q8_0) | no disponible |
| Abu-Dju/aya-expanse-32b-Q8_0-GGUF | unos 32 mil millones (no confirmado en la informacion disponible) | no disponible | no disponible en la informacion proporcionada | GGUF (Q8_0) | no disponible |
| Abu-Dju/N-ATLaS-Q8_0-GGUF | no disponible | no disponible | no disponible en la informacion proporcionada | GGUF (Q8_0) | no disponible |

No se han encontrado en la busqueda web comparativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- No hay informacion sobre sesgos del modelo base; al no existir model card detallada ni evaluaciones publicadas, no se puede acotar el comportamiento en dominios sensibles.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; sin benchmarks ni evaluaciones publicadas, no hay estimacion de su magnitud en este caso concreto.
- Cobertura idiomatica limitada: solo se declaran arabe e ingles. No hay confirmacion de rendimiento en castellano ni en otros idiomas.
- Ambiguedad sobre la licencia: el repositorio de la cuantizacion declara Apache 2.0, pero conviene verificar la licencia del modelo base Applied-Innovation-Center/AIC-1 antes de un uso comercial, ya que la cuantizacion hereda las condiciones del original.
- La cuantizacion Q8_0 puede introducir pequenas diferencias de calidad frente al modelo en safetensors; no se documenta ninguna evaluacion de esa perdida.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El README no especifica la longitud de contexto real del modelo; usar el ejemplo `-c 2048` como limite podria desaprovechar capacidad o, al contrario, asumir un maximo no confirmado.
- El tamano en disco (34,8 GB) obliga a planificar almacenamiento y ancho de banda de carga considerables en cada despliegue.
- No se documentan requisitos de plantilla de prompt (chat template), lo que puede provocar respuestas degradadas si se usa el formato incorrecto.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/Abu-Dju/AIC-1-Q8_0-GGUF
- Modelo base: https://huggingface.co/Applied-Innovation-Center/AIC-1
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Otras cuantizaciones del mismo autor: https://huggingface.co/Abu-Dju/N-ATLaS-Q8_0-GGUF y https://huggingface.co/Abu-Dju/aya-expanse-32b-Q8_0-GGUF
- Repositorio de referencia sobre GGUF de IBM: https://github.com/IBM/gguf
- Buscador de modelos GGUF: https://local-ai-zone.github.io/
