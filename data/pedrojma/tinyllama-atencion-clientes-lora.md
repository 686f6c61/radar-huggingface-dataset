# PedroJMA/tinyllama-atencion-clientes-lora

## Resumen

PedroJMA/tinyllama-atencion-clientes-lora es un adaptador publicado en Hugging Face que, a juzgar por su identificador, se presenta como un ajuste fino mediante LoRA de TinyLlama-1.1B orientado a tareas de atención al cliente. El repositorio lo firma el usuario PedroJMA, se distribuye en formato safetensors bajo la librería transformers y no declara pipeline, idiomas ni licencia. El modelo base, TinyLlama-1.1B, es un transformer decoder-only de 1.100 millones de parámetros preentrenado sobre 3 billones de tokens dentro del proyecto TinyLlama, lo que lo sitúa en la gama de modelos que caben en GPU de consumo e incluso en CPU.

La relevancia de esta ficha es limitada y conviene decirlo con claridad desde el principio: la model card es la plantilla automática de Hugging Face y no tiene ni un solo campo cumplimentado. Todos los apartados aparecen como [More Information Needed]; no hay resultados de evaluación, no se documentan hiperparámetros de entrenamiento, ni el dataset utilizado, ni el número de pasos. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y su tamaño declarado es de 0,0 GB, lo que es coherente con un adaptador LoRA pequeño pero también con un artefacto vacío o incompleto.

Por tanto, esta ficha separa lo que se puede afirmar con cierta base (herencia de TinyLlama-1.1B, formato de pesos y propósito declarado en el nombre) de todo aquello que no está documentado y que se marca explícitamente como no disponible. Cualquier evaluación rigurosa exigiría contactar con el autor, inspeccionar los pesos o reproducir el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio. El modelo base TinyLlama-1.1B es un transformer decoder-only de la familia Llama (RMSNorm, SwiGLU, RoPE) |
| Parametros totales | No disponible. El adaptador se aplica sobre TinyLlama-1.1B, con 1.100 millones de parametros en el modelo base; el numero de parametros entrenables del LoRA no se declara |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. El modelo base TinyLlama-1.1B se entrena con 2.048 tokens de contexto |
| Tipos de cuantizacion | No disponible. El repositorio solo etiqueta safetensors; no se publican pesos GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (etiqueta del Hub), compatible con transformers y PEFT |
| Tipo de artefacto | Adaptador LoRA, no pesos completos del modelo |
| Tamano del repositorio | 0,0 GB declarados |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir el entrenamiento. Por el nombre del repositorio cabe inferir que se trata de un ajuste fino con LoRA (Low-Rank Adaptation) sobre TinyLlama-1.1B, una tecnica que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas proyecciones lineales, tipicamente en las proyecciones de atencion. No se declara el rango, el valor de alpha, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el optimizador ni el regimen de precision (fp32, fp16, bf16). Tampoco se indica si el adaptador se ha fusionado con el modelo base para producir pesos completos.

Del modelo base, TinyLlama-1.1B, si hay documentacion publica: es un transformer decoder-only de 1.100 millones de parametros preentrenado sobre 3 billones de tokens por el proyecto TinyLlama, con una arquitectura compatible con Llama 2. Esos datos provienen del proyecto original, no de esta model card, y deben verificarse contra el repositorio base antes de darlos por validos en produccion.

Una advertencia relevante sobre metadatos: la etiqueta arxiv:1910.09700 que aparece en el repositorio no corresponde a un articulo sobre este modelo. Ese identificador apunta al trabajo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono en aprendizaje automatico, que la plantilla automatica de Hugging Face cita como referencia para su seccion de impacto medioambiental. No debe interpretarse como publicacion tecnica del adaptador.

## Capacidades

- Generacion de texto en espanol orientada, segun el nombre del repositorio, a conversaciones de atencion al cliente. Esta finalidad no esta documentada ni verificada.
- Hereda del modelo base TinyLlama-1.1B las capacidades generales de generacion de texto, respuesta a preguntas simples y continuacion de instrucciones breves.
- Soporte de tool calling o function calling: no disponible, no se declara en ninguna parte.
- Soporte de agentes y razonamiento multi-paso: no disponible. El modelo base de 1.1B tiene un rendimiento limitado en tareas de razonamiento encadenado.
- Capacidades multilingues: no disponible. El modelo base se entrena mayoritariamente con datos en ingles, por lo que el soporte real de espanol depende por completo del adaptador, que no documenta su corpus.
- Capacidad especial de thinking mode, vision o audio: no disponible.
- Modo de chat con plantilla de prompt: no disponible. No se especifica que formato de conversacion espera el adaptador (Llama 2 chat, ChatML u otro), dato critico para su uso correcto.

## Casos de uso

Dado que no existe documentacion funcional, los siguientes escenarios son hipotesis de uso coherentes con el nombre del repositorio y con las caracteristicas del modelo base. Deben validarse empiricamente antes de cualquier despliegue.

- Clasificacion y enrutado de tickets de soporte: con 1.100 millones de parametros el modelo es lo bastante ligero para ejecutarse en CPU o en una GPU modesta y etiquetar consultas entrantes por categoria antes de derivarlas a un sistema mayor.
- Generacion de respuestas de primer nivel en un chatbot web: el adaptador podria producir respuestas plantilladas para preguntas frecuentes, siempre que se le proporcione el contexto de la politica de la empresa mediante recuperacion documental.
- Resumen de conversaciones de atencion al cliente: dado el contexto limitado del modelo base (2.048 tokens), solo seria viable con historiales cortos o previamente truncados.
- Reescritura y normalizacion de textos de agentes humanos: convertir notas internas en respuestas con tono homogeneo para el cliente.
- Experimentacion academica y docencia: por su tamano, sirve como caso practico para ilustrar el flujo completo de ajuste con LoRA, publicacion en el Hub y despliegue local, incluso sin saber si la calidad final es buena.
- Prototipado en entornos con hardware restringido: despliegue en un portatil, en una Raspberry Pi 4/5 o en un contenedor sin GPU para demostraciones internas.
- Generacion de variantes de textos de marketing o avisos de servicio, con supervision humana obligatoria dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio contiene la seccion de evaluacion sin cumplimentar, con todos los apartados marcados como [More Information Needed]. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna metrica especifica de atencion al cliente para este adaptador, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para el modelo base en precision fp16: aproximadamente 2,2 GB solo para pesos, mas cache KV y overhead, lo que situa el consumo practico en torno a 3 GB de VRAM para secuencias cortas.
- VRAM estimada tras cuantizacion a 4 bits del modelo base (Q4_K_M en formato GGUF): en torno a 0,7-0,8 GB de pesos, con un consumo total cercano a 1,2-1,5 GB.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores. En GPU de gama alta como RTX 4090, A100 o H100 el modelo esta enormemente sobredimensionado y el cuello de botella sera la CPU, no la GPU.
- Ejecucion en CPU: si, es un escenario realista para un modelo de 1.1B. Tambien es viable en placas tipo Raspberry Pi 4/5 con llama.cpp, aunque con latencias altas.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sin fusionar; fusion del adaptador con el modelo base y exportacion a GGUF para llama.cpp; Ollama, que ya distribuye TinyLlama en su libreria (habria que crear un Modelfile propio con el adaptador); vLLM o TGI si se fusiona el adaptador y se sirve el modelo completo.
- Latencia y throughput estimados: no disponible. El repositorio no publica mediciones de latencia, tokens por segundo ni rendimiento bajo carga concurrente.

## Comparativa con modelos similares

La comparativa se establece con modelos base o instruct de la misma franja de tamano. Las cifras de las alternativas proceden de su documentacion publica y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PedroJMA/tinyllama-atencion-clientes-lora | 1,1B de base + adaptador LoRA no cuantificado | No disponible (base: 2.048 tokens) | No disponible | Repositorio en Hugging Face con 0 descargas |
| TinyLlama-1.1B (modelo base) | 1,1B | 2.048 tokens | Apache 2.0 | Ampliamente distribuido, disponible en Ollama |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 (con condiciones de uso para algunas variantes) | Muy extendido, buen soporte de tool calling |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face, disenado para dispositivos locales |
| irtoga/tinyllama-atencion-clientes-lora | Presumiblemente identico | No disponible | No disponible | Espejo o copia del repositorio objeto de esta ficha |

Frente a las alternativas, la desventaja de este adaptador no es de tamano sino de trazabilidad: Qwen2.5-1.5B-Instruct y SmolLM2-1.7B-Instruct publican contexto, licencia y evaluaciones, mientras que aqui no hay ningun dato verificable.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica y no aporta informacion sobre datos, entrenamiento, evaluacion ni uso previsto.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Aunque el modelo base se distribuya bajo Apache 2.0, el adaptador queda sin condiciones publicadas y su explotacion comercial es juridicamente arriesgada.
- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluacion de sesgo, y el corpus de ajuste es desconocido.
- Riesgo de alucinacion: elevado. Los modelos de 1.1B tienden a inventar informacion cuando se les pregunta por hechos concretos, y en atencion al cliente eso se traduce en politicas, plazos o precios ficticios.
- Limitacion de contexto: el modelo base trabaja con 2.048 tokens, insuficiente para historiales de conversacion largos o documentos de politica extensos sin un sistema de recuperacion externo.
- Limitacion idiomatica: el modelo base se entrena principalmente en ingles. El soporte real de castellano depende del adaptador y no esta evaluado.
- Riesgo de artefacto incompleto: el tamano declarado del repositorio es 0,0 GB y no hay descargas. Conviene descargar y verificar que los archivos safetensors existen y son validos antes de integrarlos en cualquier flujo.
- Sin versionado ni mantenimiento: el repositorio se creo y actualizo con cuatro segundos de diferencia, sin historial posterior, lo que sugiere una publicacion de prueba.
- Formato de prompt desconocido: no se indica la plantilla de conversacion que espera el adaptador, lo que puede degradar gravemente la calidad de las respuestas si se usa el formato equivocado.
- No apto para decisiones automatizadas sin supervision humana en contextos sensibles (facturacion, reclamaciones, datos personales).

## Enlaces

- Repositorio del modelo: https://huggingface.co/PedroJMA/tinyllama-atencion-clientes-lora
- Espejo o copia con el mismo nombre: https://huggingface.co/irtoga/tinyllama-atencion-clientes-lora
- Proyecto TinyLlama (modelo base): https://github.com/jzhang38/TinyLlama
- TinyLlama en la libreria de Ollama: https://ollama.com/library/tinyllama
- Ejemplo de ajuste de TinyLlama con LoRA: https://github.com/Blazkull/MODEL-TINYLLAMA
- Busqueda de modelos TinyLlama en Hugging Face: https://huggingface.co/models?search=tinyllama
- Referencia citada en los metadatos (estimacion de emisiones, no es el paper del modelo): https://arxiv.org/abs/1910.09700
