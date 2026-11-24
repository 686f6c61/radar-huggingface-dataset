# KeelCore/KeelCore-750M-Elaborate

## Resumen

KeelCore-750M-Elaborate es un adaptador LoRA de rango 16 publicado por KeelCore sobre el modelo base Thelivu-750M, un encoder-decoder de 750 millones de parametros. Su unica funcion es reescribir texto breve en ingles y convertirlo en una version mas extensa y de registro mas formal, preservando el significado original. El adaptador anade 18,29 millones de parametros entrenables (un 2,43 % del modelo base) y se distribuye como un fichero de 73 MB que requiere el modelo base congelado para funcionar.

La relevancia del modelo reside en su especializacion y su huella reducida: puede ejecutarse en CPU o GPU con PyTorch, o directamente en el navegador mediante ONNX Runtime Web, lo que permite integrar una etapa de reescritura sin enviar el texto fuera del dispositivo del usuario. No es un modelo conversacional ni un generador de texto desde cero; solo transforma la entrada que recibe.

La ficha se basa en la informacion disponible en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks ni detalles completos sobre el dataset de entrenamiento, por lo que esos apartados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (modelo base Thelivu-750M) con adaptador LoRA de rango 16 |
| Parametros totales | 750M en el modelo base; adaptador con 18,29M parametros entrenables (2,43 % del base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el base se carga en float32, aproximadamente 3 GB de memoria) |
| Idiomas soportados | Ingles (en) |
| Licencia | Thelivu License, Version 1.0 (license: other) |
| Formato de pesos | `adapter.safetensors` con `adapter_config.json` (formato Thelivu, no PEFT); el base en `model.safetensors`; exportacion ONNX disponible |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Thelivu-750M, un modelo encoder-decoder. Esta arquitectura permite que el codificador lea la totalidad de la entrada antes de generar la salida, lo que facilita copiar literalmente nombres, URL, correos electronicos y otros fragmentos exactos al texto reescrito. El adaptador es un LoRA de rango 16 que ensena al modelo base la tarea de elaboracion; el base permanece congelado. El codigo de carga verifica una huella de los pesos del base y rechaza cargarse sobre cualquier modelo distinto de Thelivu-750M.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un conjunto de validacion retenido y comprobaciones manuales con entradas no pertenecientes a los datos de entrenamiento, pero no detalla su tamano ni su procedencia. En la validacion, las salidas resultan de media un 36 % mas largas que la entrada.

La decodificacion por defecto es greedy, con prohibicion de repetir cualquier secuencia de tres tokens, y un limite de 384 tokens nuevos. La entrada se enmarca automaticamente con la plantilla ` <text_to_rewrite> ... </text_to_rewrite> </s>`.

## Capacidades

- Reescritura y expansion de texto: convierte frases cortas, notas y mensajes breves en redacciones mas completas y de registro formal.
- Preservacion de cadenas exactas: al ser encoder-decoder, copia URL, direcciones de correo y numeros de telefono tal cual aparecen en la entrada.
- Procesamiento por lotes: la funcion `rephrase()` acepta una lista de textos y devuelve una lista de reescrituras.
- Ejecucion en CPU y GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No genera texto desde cero ni resume; unicamente reescribe lo que recibe.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Normalizacion de mensajes en aplicaciones de mensajeria: el adaptador reescribe notas telegraficas de los usuarios en frases completas antes de almacenarlas o mostrarlas, con la ventaja de que el texto no abandona el dispositivo si se ejecuta en el navegador con ONNX Runtime Web.
- Redaccion asistida de correos internos: a partir de una linea como "reunion a las 3", el modelo produce una frase formal lista para enviar, lo que reduce el tiempo de composicion en herramientas de ofimatica.
- Estandarizacion de descripciones en catalogos o bases de datos: convierte campos breves introducidos por operadores en descripciones homogeneas y de tono uniforme, manteniendo intactos identificadores y URL.
- Preprocesado en pipelines de documentacion tecnica: expande notas de version o entradas de changelog escritas de forma escueta antes de publicarlas, con revision humana posterior para evitar alteraciones de cifras.
- Prototipado de funciones de reescritura en productos de escritura: sirve como punto de partida para investigadores que estudian adaptadores pequenos sobre un modelo base compartido, gracias a su bajo coste de almacenamiento (73 MB) y su licencia propia.
- Ejecucion local en entornos con restricciones de privacidad: al caber en CPU y no requerir GPU, puede desplegarse en portatiles o estaciones de trabajo sin conexion, procesando texto sensible sin salir de la maquina.
- Generacion de variantes de tono en formularios de atencion al cliente: transforma respuestas breves de agentes en textos mas corteses y completos antes de su envio, siempre que no contengan datos que deban permanecer literales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es que las salidas del adaptador son, de media, un 36 % mas largas que la entrada en el conjunto de validacion retenido.

## Requisitos de hardware

- VRAM estimada: el modelo base se carga en float32 y ocupa aproximadamente 3 GB de memoria; el adaptador anade unos 73 MB. En GPU, la VRAM necesaria ronda los 3-4 GB, incluyendo overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el modelo es lo bastante pequeno para tarjetas de gama media y para ejecucion en CPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores, y tambien en CPU.
- Opciones de despliegue: PyTorch (CPU o CUDA) mediante el repositorio de GitHub del autor; ONNX Runtime Web para navegador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de reescritura sobre modelos encoder-decoder de ~750M) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo admite ingles; no se ha entrenado para otros idiomas.
- No es un modelo de chat ni de instrucciones: no responde preguntas ni ejecuta ordenes contenidas en el texto.
- Riesgo de alteracion de contenido: al expandir el texto puede modificar matices, cifras o terminos. El autor desaconseja su uso en textos donde cada caracter deba permanecer inalterado (clausulas legales, codigo, configuracion, cifras financieras) sin revision humana.
- El estilo anade palabras, por lo que alarga tambien textos ya extensos; no es adecuado para resumir.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad semantica mas alla de las comprobaciones manuales del autor.
- Sesgos: no se documentan sesgos conocidos, pero el entrenamiento en ingles y el registro formal pueden introducir un tono uniforme poco adecuado para contextos informales.
- Licencia Thelivu License 1.0: es una licencia propia distinta de las licencias open source estandar; deben revisarse sus terminos antes de cualquier uso comercial.
- El adaptador usa un formato propietario (no PEFT) y solo carga con el codigo del repositorio Thelivu, que verifica la huella del modelo base y rechaza otros pesos.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Elaborate
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Informe tecnico: https://saravanan-a-r.github.io/Thelivu/
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Elaborate/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
