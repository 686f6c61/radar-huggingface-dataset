# JONNYVERSE/ast-finetuned-audioset-10-10-0.4593

## Resumen

JONNYVERSE/ast-finetuned-audioset-10-10-0.4593 es un modelo de clasificacion de audio con arquitectura Audio Spectrogram Transformer (AST), publicado por el usuario JONNYVERSE. Se trata de una conversion a pesos ONNX del modelo original MIT/ast-finetuned-audioset-10-10-0.4593, realizada para hacerlo compatible con la libreria Transformers.js de Hugging Face. El modelo resuelve el problema de clasificar eventos de audio en un conjunto predefinido de categorias, como sonidos de animales, alarmas o ruidos ambientales. Su relevancia radica en que permite ejecutar inferencia de clasificacion de audio de forma local en el navegador o en aplicaciones JavaScript, sin necesidad de servidores. El repositorio tiene un tamano de 0,9 GB; no se indican los parametros totales del modelo en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | No disponible |
| Parametros activos | No procede (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (clasificacion de eventos de audio; etiquetas en ingles) |
| Licencia | No disponible |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo es una variante con pesos ONNX del Audio Spectrogram Transformer (AST), un transformer estandar que opera sobre espectrogramas de mel en lugar de sobre secuencias de texto. El modelo original fue ajustado sobre el conjunto de datos AudioSet, como indica su identificador. La arquitectura se mantiene intacta en la conversion a ONNX; lo unico que cambia es el formato de los pesos, de modo que Transformers.js pueda cargarlos en aplicaciones JavaScript. No se ha facilitado informacion sobre el numero de parametros, el volumen de datos de entrenamiento ni sobre el uso de tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Clasificacion de eventos de audio: predice la categoria mas probable de un clip de sonido (por ejemplo, "Meow", "Cat", "Domestic animals, pets") junto con una puntuacion de confianza.
- Devuelve las k mejores predicciones mediante el parametro `top_k`, como se muestra en el ejemplo de uso de la model card.
- Inferencia en el navegador o en Node.js gracias a los pesos ONNX y a la libreria Transformers.js.
- No soporta tool calling, generacion de lenguaje, vision en sentido general ni capacidad de razonamiento de varios pasos.
- No ofrece capacidades multilingues de texto: las etiquetas de salida estan en ingles, pero el modelo trabaja con eventos acusticos independientes del idioma.

## Casos de uso

- Clasificacion de sonidos de mascotas en aplicaciones moviles: un usuario graba un maullido y la aplicacion clasifica el evento como "Meow". Es adecuado porque el modelo esta afinado sobre AudioSet, que incluye sonidos de animales, y la inferencia ONNX funciona en el dispositivo sin enviar audio a un servidor.
- Monitorizacion en tiempo real de alarmas o sirenas en el navegador: una aplicacion web escucha el microfono y avisa al usuario si detecta una sirena o una alarma. El modelo se ejecuta cien por cien en el cliente, reduciendo latencia y costes.
- Indexado automatico de archivos de audio: una herramienta de gestion de grabaciones etiqueta cada clip con su tipo de sonido (voz, musica, animal, ruido de fondo) para permitir busquedas por contenido acustico, sin necesidad de transcripcion.
- Accesibilidad para personas con discapacidad auditiva: un asistente que genera notificaciones visuales o vibracion cuando reconoce sonidos importantes, como el timbre de la puerta, un perro ladrando o el llanto de un bebe, usando el microfono del dispositivo.
- Control de calidad en fabricas: un sistema local detecta anomalias acusticas en la maquinaria, como golpes, zumbidos o ruidos irregulares, clasificando el evento y alertando al operario para intervenir.
- Etiquetado automatico de audio en redes sociales: una plataforma de videos puede clasificar los sonidos de cada clip (aplausos, musica, mascotas) para mejorar los filtros y la busqueda dentro de la aplicacion, gracias al pipeline de Transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los pesos ONNX ocupan 0,9 GB, lo que indica el almacenamiento necesario, pero no se conocen requisitos de memoria de GPU.
- GPU recomendadas: no se especifican. En el navegador, la aceleracion se puede conseguir con WebGPU; una GPU integrada moderna puede ser suficiente para un uso no exigente.
- Si cabe en GPU de consumo: no hay informacion oficial. Al ser un modelo de clasificacion de audio, no se espera que requiera una GPU de alta gama, pero no se aportan datos concretos.
- Opciones de despliegue: Transformers.js en navegador o Node.js; tambien se puede ejecutar mediante ONNX Runtime en otros entornos. No es compatible con vLLM ni llama.cpp, ya que no es un modelo de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JONNYVERSE/ast-finetuned-audioset-10-10-0.4593 | No disponible | No disponible | No disponible | No disponible | ONNX, Transformers.js |
| MIT/ast-finetuned-audioset-10-10-0.4593 | No disponible | No disponible | No disponible | No disponible | PyTorch |
| Xenova/ast-finetuned-audioset-10-10-0.4593 | No disponible | No disponible | No disponible | No disponible | ONNX, Transformers.js |

La diferencia principal entre las tres versiones es el formato de los pesos y el entorno de ejecucion. La version de JONNYVERSE es una exportacion ONNX equivalente a la de Xenova, y ambas heredan los pesos del modelo original de MIT. No se han publicado cifras de rendimiento en ninguna de las fichas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado sobre AudioSet, el modelo puede estar sesgado hacia los tipos de audio presentes en ese conjunto y fallar en contextos acusticos distintos, como entornos industriales o rurales.
- Riesgo de alucinacion: en clasificacion de audio, la "alucinacion" se manifiesta como predicciones con alta confianza sobre clases erroneas cuando el sonido de entrada no esta representado en el entrenamiento. Es necesario validar el modelo en los dominios de uso reales.
- Limitaciones de contexto idioma: no es un modelo de lenguaje; no procesa texto. Las etiquetas estan en ingles, por lo que las aplicaciones deben traducirlas para usuarios de otras lenguas.
- Restricciones de licencia: la licencia no esta declarada en la ficha de Hugging Face. El uso comercial no puede autorizarse sin confirmar la licencia del modelo original MIT/ast-finetuned-audioset-10-10-0.4593.
- Los pesos ONNX son una conversion directa del original; si el modelo original tiene condiciones de uso particulares, estas se aplican tambien a esta version.
- La model card publicada es minima y solo incluye el ejemplo de uso, lo que limita la trazabilidad sobre el proceso de conversion y sobre las pruebas realizadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/ast-finetuned-audioset-10-10-0.4593
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete NPM de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
