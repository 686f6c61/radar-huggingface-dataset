# AriDiscoSquid/TinyLlama-1.1B-Chat-v1.0-Q4_K_M-GGUF

## Resumen

TinyLlama-1.1B-Chat-v1.0-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo conversacional TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicada por el usuario AriDiscoSquid. El repositorio no aporta entrenamiento propio: se trata de una conversion del checkpoint original realizada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, orientada a inferencia local y despliegue ligero. El modelo base es un transformer denso de tipo decoder-only con 1.100.048.384 parametros (aproximadamente 1,1 mil millones), derivado de la arquitectura Llama 2.

La relevancia de esta ficha es practica: se trata de un modelo de muy bajo coste computacional, capaz de ejecutarse en CPU y en hardware de gama baja, con un peso en disco de aproximadamente 0,7 GB en la cuantizacion Q4_K_M. Esto lo situa en el segmento de modelos para prototipado, educacion, sistemas embebidos, tareas de generacion de texto sencillas y entornos sin GPU dedicada. La licencia Apache 2.0 del modelo base permite uso comercial sin las restricciones de las licencias Llama originales.

El repositorio es un artefacto de conversion, no un modelo nuevo: no incluye model card tecnica propia mas alla de las instrucciones de uso con llama.cpp, no registra descargas ni likes en el momento de la consulta y no publica resultados de evaluacion propios. El idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basada en Llama 2 (heredada del modelo base) |
| Parametros totales | 1.100.048.384 (dato real de safetensors del modelo base) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2048 tokens (segun el modelo base; el ejemplo de servidor del repositorio usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repositorio) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `tinyllama-1.1b-chat-v1.0-q4_k_m.gguf`) |
| Tamano del repositorio | 0,7 GB |
| Pipeline declarado | No disponible (etiquetado como `conversational`) |
| Compatibilidad de endpoints | Si (`endpoints_compatible`) |

## Arquitectura y entrenamiento

La cuantizacion no modifica la arquitectura del modelo original: mantener un transformer decoder-only denso con atencion causal, en la linea de la familia Llama 2, con normalizacion RMSNorm y activacion SwiGLU. Al tratarse de una version Q4_K_M, los pesos originales en precision completa se comprimen a 4 bits por parametro con una mezcla de escalas (el sufijo `_K_M` indica cuantizacion k-quant de tamano medio), lo que reduce el peso a unos 0,7 GB a costa de una perdida de calidad respecto al checkpoint original. No hay destilacion, poda ni cambio de topologia: es una conversion directa de pesos.

En cuanto al entrenamiento, la informacion disponible en el repositorio se limita a la lista de conjuntos de datos declarados para el modelo base: cerebras/SlimPajama-627B y bigcode/starcoderdata en la fase de preentrenamiento, HuggingFaceH4/ultrachat_200k para el ajuste supervisado (SFT) y HuggingFaceH4/ultrafeedback_binarized para el ajuste por preferencias (DPO). El numero exacto de tokens, la composicion porcentual del dataset, el presupuesto de computo y los detalles del pipeline de alineamiento no se detallan en la informacion proporcionada; la documentacion publica del modelo base los amplia y es la referencia citada por el propio repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat basado en turnos de sistema, usuario y asistente, tal y como muestra el ejemplo de la model card (peticion de una funcion en Python para los primeros 10 digitos de Fibonacci).
- Generacion de codigo basico: el repositorio incluye un widget de ejemplo especificamente orientado a asistencia de programacion, coherente con la presencia de starcoderdata en el preentrenamiento del modelo base.
- Razonamiento aritmetico y logico de complejidad baja, limitado por el tamano del modelo y su ventana de contexto.
- Instrucciones conversacionales simples: el ajuste con ultrafeedback_binarized proporciona cierto grado de alineamiento con preferencias humanas.
- Capacidades multilingues: no disponibles. El modelo declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas sera previsiblemente pobre.
- Tool calling / function calling: no disponible. No se documenta soporte nativo de llamada a herramientas ni un formato estructurado de funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la ventana de 2048 tokens limita severamente cualquier flujo agentico con historial largo.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Prototipado y pruebas de concepto de aplicaciones de chat: al ocupar 0,7 GB y ejecutarse en CPU, permite validar un pipeline completo (tokenizador, plantilla de chat, servidor HTTP) antes de migrar a un modelo mayor, sin consumo de GPU.
- Asistente de generacion de fragmentos de codigo en local: el ejemplo del repositorio y el uso de starcoderdata en el preentrenamiento lo hacen util para autocompletar funciones cortas, escribir scripts de utilidad o generar pruebas unitarias simples dentro de un editor o un script de terminal.
- Despliegue en dispositivos con recursos muy limitados: mini-PC, Raspberry Pi, routers con Linux o contenedores sin GPU, donde llama.cpp y el formato GGUF son la via de ejecucion natural.
- Generacion de texto de relleno y datos sinteticos de bajo coste: creacion de textos de ejemplo, descripciones breves o datos de prueba para poblar entornos de desarrollo y conjuntos de validacion internos.
- Educacion y divulgacion sobre LLM: permite ilustrar de forma tangible el funcionamiento de un transformer, las plantillas de chat y el efecto de la cuantizacion comparando la salida Q4_K_M con el modelo en fp16.
- Moderacion y clasificacion de texto ligera: con prompts de una sola pasada y contexto corto, puede usarse como clasificador de intencion o etiquetador en flujos de bajo volumen donde la latencia importa mas que la precision.
- Servicio de chat offline en aplicaciones de escritorio: integrado como libreria embebida (por ejemplo llama-cpp-python) para ofrecer asistencia sin conexion y sin enviar datos del usuario a terceros.
- Cliente de referencia para pruebas de infraestructura: al ser un modelo pequeno y predecible, resulta practico para medir throughput y latencia de un servidor llama.cpp o de una configuracion concreta de hardware antes de escalar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de la cuantizacion no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otras), ni comparaciones medidas frente al checkpoint original en precision completa. Para datos de evaluacion hay que remitirse a la documentacion publica del modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, enlazada mas abajo.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: aproximadamente 0,7 GB para los pesos, mas el espacio de la cache KV. Con 2048 tokens de contexto en un modelo de 1,1B, la cache es de decenas de MB, por lo que la inferencia cabe comodamente por debajo de 1,5 GB de memoria total.
- VRAM estimada en fp16 (checkpoint original, no este repositorio): en torno a 2,2 GB solo para pesos, mas cache KV.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria. Se han documentado ejecuciones en GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 y H100, aunque en estos dos ultimos el modelo esta enormemente infrautilizado.
- GPU de consumo: si, cabe en practicamente cualquier GPU consumer de los ultimos diez anos, asi como en GPUs integradas con memoria compartida.
- CPU: es viable la inferencia solo en CPU; con llama.cpp y Q4_K_M se obtienen velocidades del orden de decenas de tokens por segundo en procesadores modernos de escritorio. El dato exacto no esta disponible en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`, tal y como documenta el repositorio), llama-cpp-python, Ollama importando el fichero GGUF, LM Studio, text-generation-webui y el backend de llama.cpp en vLLM.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware y del numero de hilos o capas descargadas a GPU; no se aportan mediciones en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-Q4_K_M (este repositorio) | 1,1 B | 2048 tokens | Apache 2.0 | GGUF en HuggingFace, 0 descargas | Cuantizacion no oficial de un tercero |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 (modelo base) | 1,1 B | 2048 tokens | Apache 2.0 | Pesos originales en HuggingFace | Referencia oficial del autor del modelo |
| Modelos de la misma categoria (0,5 B - 2 B, tipo Qwen2.5, SmolLM2, Gemma 2 o Phi) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de estos modelos en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma franja de tamano no puede completarse con la informacion disponible: no se han proporcionado parametros, contextos, resultados de benchmarks ni condiciones de licencia de otros modelos, y no se deben inferir. Como criterio cualitativo, la ventaja diferencial de esta publicacion es el formato GGUF listo para llama.cpp y su licencia Apache 2.0, que facilita el uso comercial frente a alternativas con licencias mas restrictivas.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgo o toxicidad en el repositorio; un modelo preentrenado sobre SlimPajama hereda los sesgos presentes en datos web filtrados de forma automatica.
- Alucinacion: con 1,1 B de parametros, la tasa de afirmaciones factualmente incorrectas y de invencion de datos es alta, especialmente en preguntas de conocimiento factual y en tareas de razonamiento encadenado.
- Idioma: el modelo solo declara ingles. El rendimiento en castellano no esta soportado ni evaluado y previsiblemente sera deficiente, con mezcla de idiomas y errores gramaticales.
- Contexto: 2048 tokens es un limite muy bajo para aplicaciones actuales; no es adecuado para analisis de documentos largos, RAG con muchos fragmentos ni conversaciones de muchos turnos sin resumen intermedio.
- Perdida por cuantizacion: la conversion a Q4_K_M introduce degradacion adicional respecto al checkpoint original, que no se ha medido ni documentado en el repositorio.
- Soporte y mantenimiento: el repositorio es una conversion de un tercero, con 0 descargas y 0 likes en el momento de la consulta, sin garantia de actualizacion, correccion de errores ni respuesta a incidencias.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al ser una conversion no oficial conviene verificar que el derivado se distribuye cumpliendo las obligaciones de atribucion respecto al modelo base.
- Sin datos de rendimiento: no hay benchmarks del artefacto cuantizado, por lo que cualquier decision de produccion deberia basarse en una evaluacion propia sobre el caso de uso concreto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/AriDiscoSquid/TinyLlama-1.1B-Chat-v1.0-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Espacio GGUF-my-repo de ggml.ai utilizado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset de preentrenamiento: https://huggingface.co/datasets/cerebras/SlimPajama-627B
- Dataset de codigo: https://huggingface.co/datasets/bigcode/starcoderdata
- Dataset de ajuste supervisado: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de preferencias para DPO: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a directorios de empresas francesas y no guardan relacion con la ficha.
