# simon-theoz/laya-coffret-v1

## Resumen

`laya-coffret-v1` es un modelo de demostración publicado por el usuario `simon-theoz` en Hugging Face. No es un modelo generativo de propósito general: según la model card, lee una frase en francés que describe a una persona y responde a seis preguntas tipadas sobre gustos y estilo, sin producir texto libre. Está exportado a ONNX en dos variantes (`laya-fp16.onnx` para WebGPU y `laya-int8.onnx` para WASM) con el objetivo explícito de ejecutarse en el navegador.

El repositorio, de 1,0 GB, incluye además un fichero `INTERFACE.json` que describe las preguntas y la construcción de las entradas, y dos ficheros del motor `onnxruntime-web` 1.31 (licencia MIT) que se sirven desde el propio repositorio porque superan el tamaño admitido por el alojamiento del sitio del autor. La información pública disponible es muy limitada: no se especifican arquitectura, número de parámetros, contexto, datos de entrenamiento ni resultados de evaluación.

Por su naturaleza (clasificación/extracción estructurada sobre una frase corta en francés, empaquetada para inferencia en cliente), el modelo debe evaluarse como una demo técnica de despliegue ONNX en navegador más que como un componente listo para producción. No hay descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (`laya-fp16.onnx`) e int8 (`laya-int8.onnx`) |
| Idiomas soportados | francés (`fr`) |
| Licencia | no disponible |
| Formato de pesos | ONNX (dos ficheros: fp16 e int8) |

Otros datos relevantes del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repo | 1,0 GB |
| Libreria declarada | onnx |
| Runtime objetivo | onnxruntime-web 1.31 (WebGPU y WASM) |
| Entradas/salidas | definidas en `INTERFACE.json` (seis preguntas tipadas, sin generación de texto) |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-11-16 |
| Fecha de actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, número de capas, dimensión de los embeddings ni mecanismo de atención). La model card únicamente describe el contrato de entrada y salida: una frase en francés que describe a una persona como entrada y seis respuestas tipadas relativas a gustos y estilo como salida, sin decodificación de texto.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, procedencia), ni si hubo ajuste fino supervisado, RLHF o DPO. La única información técnica verificable es el proceso de exportación: dos artefactos ONNX, uno en fp16 pensado para ejecución con WebGPU y otro en int8 pensado para ejecución con WASM en el navegador. El repositorio incorpora además dos binarios de `onnxruntime-web` 1.31 bajo licencia MIT, lo que sugiere que el autor distribuye el runtime junto con los pesos para simplificar el despliegue en su sitio.

## Capacidades

- Lectura de una frase corta en francés descriptiva de una persona.
- Respuesta a seis preguntas tipadas (categorías cerradas) sobre gustos y estilo.
- Salida estructurada: no genera texto libre, lo que elimina el riesgo de alucinación en formato abierto.
- Ejecución en navegador mediante ONNX Runtime Web, con dos rutas de rendimiento: WebGPU (fp16) y WASM (int8).
- Contrato de interfaz documentado en `INTERFACE.json` (preguntas y construcción de entradas).
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe: no disponible; el modelo declara únicamente francés.

## Casos de uso

- Demo de inferencia en cliente: el modelo puede cargarse en una página web y ejecutarse íntegramente en el navegador del usuario gracias a las variantes ONNX fp16 (WebGPU) e int8 (WASM), sin enviar datos a un servidor. Es el caso de uso principal declarado por el autor.
- Prototipado de formularios inteligentes: dado un texto libre breve en francés, devolver seis campos tipados permite autocompletar cuestionarios de perfilado de usuario sin necesidad de un backend de inferencia.
- Validación de pipelines ONNX: sirve como banco de pruebas para verificar que un flujo de exportación a ONNX (fp16 e int8) y su ejecución con `onnxruntime-web` 1.31 funcionan de extremo a extremo.
- Aplicaciones educativas o de divulgación: demostrar en un artículo o taller cómo se despliega un modelo pequeño en el navegador con WebGPU frente a WASM, comparando latencia y consumo.
- Clasificación ligera de perfiles en entornos con restricciones de privacidad: al no requerir salida de datos del dispositivo, encaja en escenarios donde el texto del usuario no debe abandonar el cliente.
- Pruebas de integración de `INTERFACE.json`: el fichero de interfaz permite generar entradas y validar salidas de forma automatizada en un pipeline de CI para aplicaciones web que consuman el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 1,0 GB e incluye los pesos en fp16 e int8 junto con dos binarios de `onnxruntime-web`, por lo que el conjunto de pesos es inferior a esa cifra. El desglose por fichero no se ha publicado.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecutarse en el navegador, no en servidores con GPU dedicada.
- Compatibilidad con GPU de consumo: la variante fp16 está pensada para WebGPU, disponible en navegadores modernos sobre GPUs de consumo; la variante int8 está pensada para WASM, que se ejecuta en CPU. No se especifican modelos concretos de GPU.
- Opciones de despliegue: ONNX Runtime Web 1.31 (WebGPU y WASM). No consta soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación estructurada en francés exportada a ONNX para navegador), y no se han publicado métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura, parámetros, contexto, datos de entrenamiento ni evaluación, lo que impide valorar su calidad objetiva.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución de los pesos. Cualquier uso en producción requiere contactar con el autor.
- Idioma limitado al francés; no consta soporte de castellano ni de otras lenguas.
- Modelo de demostración: el propio autor lo describe como tal, orientado a seis preguntas tipadas y sin generación de texto. No debe tratarse como un modelo de propósito general.
- Alcance funcional restringido: solo responde al esquema definido en `INTERFACE.json`; no admite instrucciones libres ni tool calling.
- Riesgo de sesgo: al inferir gustos y estilo a partir de una descripción personal, puede reproducir estereotipos presentes en sus datos de entrenamiento, que no se han documentado.
- Riesgo de alucinación: limitado en formato (salida tipada), pero no descartable en la asignación de categorías si la entrada es ambigua o está fuera de distribución.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin señales de validación por terceros.
- Dependencia del runtime incluido: el repositorio sirve binarios de `onnxruntime-web` 1.31 (MIT) por limitaciones de alojamiento del sitio del autor; conviene verificar su integridad antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simon-theoz/laya-coffret-v1
- ONNX Runtime Web (motor utilizado, licencia MIT): https://github.com/microsoft/onnxruntime
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos del autor.
