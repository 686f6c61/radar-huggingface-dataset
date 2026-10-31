# mradermacher/wattson-granite-4.2-8b-py-GGUF

## Resumen

Wattson Granite 4.2 8B Py es un modelo de lenguaje afinado especializado en sistemas de energia electrica, desarrollado por PromptExecutionAU a partir de IBM Granite 4.2 8B. El ajuste se ha realizado mediante LoRA posteriormente fusionado con el modelo base (lora-merged), con foco en dominio de redes electricas y uso de la libreria pandapower, un estandar de facto para el analisis de redes de distribucion y transmision en Python. El repositorio aqui descrito es la version cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estaticas de miles de modelos para su uso con llama.cpp.

La relevancia de este modelo radica en la escasez de LLM abiertos afinados especificamente para el sector energetico: tareas como generar scripts de pandapower, razonar sobre topologias de red o asistir en estudios de flujos de carga requieren vocabulario y patrones especificos que los modelos genericos manejan con dificultad. Al ser un modelo de unos 8 mil millones de parametros con licencia Apache 2.0, es desplegable en hardware de consumo, lo que lo hace practico para equipos de ingenieria electrica sin acceso a infraestructura de GPU a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en IBM Granite 4.2; detalles concretos no disponibles en la informacion proporcionada) |
| Parametros totales | 8.791.592.960 (8,79B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es IBM Granite 4.2 en su variante de 8B, una familia de modelos de IBM orientada a uso empresarial con licencias permisivas. Sobre este base, PromptExecutionAU aplico un ajuste con LoRA que posteriormente fue fusionado en los pesos (lora-merged), de modo que el modelo resultante es un checkpoint unico sin adapter externo. Los tags del modelo indican especializacion en power-systems (sistemas de energia), pandapower (libreria Python de analisis de redes electricas) y tool-calling.

No se ha publicado informacion sobre el dataset de entrenamiento (numero de ejemplos, composicion, tamano en tokens), ni sobre el metodo de alineacion posterior (RLHF, DPO u otros). Tampoco se detalla si el entrenamiento incluyo datos sinteticos generados con modelos mas grandes, una practica habitual en afinados de dominio. La version de mradermacher consiste unicamente en cuantizacion estatica de los pesos fusionados; no altera la arquitectura ni el comportamiento del modelo.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion en el dominio de sistemas de energia electrica.
- Generacion de codigo Python orientado a pandapower: creacion de modelos de red, flujos de carga y analisis de redes electricas.
- Tool calling: el modelo hereda soporte de llamada a herramientas del base Granite y el afinado lo refuerza explicitamente (tag tool-calling).
- Asistencia en tareas de ingenieria electrica: interpretacion de topologias de red, calculos relacionados con distribucion y transmision.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declara soporte para castellano ni otros idiomas.
- No se documentan capacidades multimodales (vision, audio); el pipeline es conversacional de texto.

## Casos de uso

- Generacion de scripts de pandapower: dado un enunciado en lenguaje natural ("crea una red IEEE de 14 barras y ejecuta un flujo de carga"), el modelo puede producir el codigo Python correspondiente, reduciendo la barrera de entrada para ingenieros sin experiencia en programacion.
- Asistente tecnico para ingenieria de redes electricas: consultas sobre flujos de carga, cortocircuitos o configuracion de elementos (transformadores, lineas, cargas) dentro del ecosistema pandapower.
- Automatizacion de estudios de planificacion: integracion en pipelines que generan y ejecutan multiples escenarios de red de forma programada, aprovechando el tool calling para invocar funciones de calculo.
- Prototipado rapido de topologias de distribucion: exploracion interactiva de configuraciones de red desde un notebook o una interfaz de chat local.
- Formacion y docencia: apoyo a estudiantes de ingenieria electrica para entender conceptos de sistemas de potencia mediante ejemplos de codigo ejecutable generados bajo demanda.
- Documentacion tecnica: redaccion de descripciones y comentarios de scripts de analisis de redes, manteniendo terminologia correcta del dominio.
- Despliegue local en entornos con requisitos de confidencialidad: al ser un GGUF ejecutable con llama.cpp u Ollama, puede usarse en redes industriales aisladas donde los datos de red electrica no pueden salir del perimeter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos comparativos del modelo base afinado frente a Granite 4.2 8B sin ajustar ni frente a otros modelos de dominio energetico.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - Q2_K: ~3,5 GB
  - Q4_K_M: ~5,4 GB
  - Q6_K: ~7,3 GB
  - Q8_0: ~9,4 GB
  - f16: ~17,7 GB
- GPU recomendadas: cualquier GPU de consumo con 6 GB de VRAM o mas ejecuta con comodidad las cuants Q4; una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 permiten usar cuants altos (Q6_K/Q8_0) con contexto amplio. En servidor, cualquier GPU moderna (A100, L4, etc.) es mas que suficiente para un modelo de 8B.
- Cabe en consumer GPU: si, incluso en portatiles con GPU de 6-8 GB usando Q4_K_S o IQ4_XS; tambien es viable en CPU pura con velocidad aceptable para un modelo de este tamano.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI, aunque este repositorio contiene solo GGUF.
- Latencia y throughput: no disponible; al ser un modelo denso de 8B cuantizado a 4 bits, se esperan velocidades tipicas de decenas de tokens por segundo en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad GGUF |
|---|---|---|---|---|---|
| wattson-granite-4.2-8b-py | 8,79B | no disponible | Apache 2.0 | Sistemas de energia, pandapower, tool calling | Si (este repo) |
| IBM Granite 4.x 8B (base) | ~8B | no disponible en esta ficha | Apache 2.0 | Generalista empresarial | Si |
| Qwen3 8B | ~8B | no disponible en esta ficha | Apache 2.0 | Generalista, fuerte en codigo y matematicas | Si |
| Llama 3.1 8B | ~8B | 128K | Licencia comunitaria Llama | Generalista | Si |

La ventaja diferencial de Wattson frente a los generalistas de tamano similar es su afinado en el dominio de redes electricas y pandapower; a cambio, su cobertura de idiomas es solo ingles y no hay benchmarks publicados que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- Idioma: el modelo esta orientado al ingles; su rendimiento en castellano no esta evaluado y probablemente sea inferior, especialmente en terminologia tecnica del dominio.
- Riesgo de alucinacion: no evaluado publicamente. En un dominio tecnico como el calculo de redes electricas, el modelo puede generar codigo pandapower plausible pero incorrecto; toda salida debe validarse ejecutandola y contrastando resultados fisicos.
- Sesgos: no documentados. Como derivado de Granite, hereda los sesgos del modelo base, sobre los que tampoco hay auditoria publica en la informacion disponible.
- Contexto: la longitud de ventana no esta documentada en la model card; verificarla en config.json antes de disenar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones relevantes; conviene revisar igualmente la licencia del modelo base Granite en el repositorio de IBM.
- Esta ficha corresponde a la cuantizacion de mradermacher (cuants estaticos, sin imatrix en el momento de publicacion); para maxima fidelidad, considerar el modelo base original en safetensors.
- Proyecto de comunidad con muy poca traccion (242 descargas, 1 like en el momento de la extraccion): el mantenimiento, la documentacion y el soporte son limitados.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/wattson-granite-4.2-8b-py-GGUF
- Modelo base afinado: https://huggingface.co/PromptExecutionAU/wattson-granite-4.2-8b-py
- Pagina de descargas resumida del cuantizador: https://hf.tst.eu/model#wattson-granite-4.2-8b-py-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion (FAQ de mradermacher): https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del afinado: no disponible
