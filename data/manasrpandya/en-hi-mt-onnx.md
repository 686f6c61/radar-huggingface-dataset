# manasrpandya/en-hi-mt-onnx

## Resumen

`manasrpandya/en-hi-mt-onnx` es un modelo de traduccion automatica ingles-hindi derivado de `Helsinki-NLP/opus-mt-en-hi`, la familia Marian de Helsinki-NLP. El autor, manasrpandya, parte de los pesos originales y ajusta unicamente el ultimo bloque del decodificador sobre 9.000 pares limpios del corpus IIT Bombay, manteniendo el resto de la red congelada. El resultado se exporta a ONNX en cuantizacion de 8 bits para su ejecucion en el navegador mediante Transformers.js.

La relevancia del modelo es practica: demuestra un flujo completo de ajuste fino ligero y despliegue en cliente (edge) para traduccion neuronal, con un decodificador fusionado que incorpora cache de clave/valor y exporta las atenciones cruzadas de cada capa. Esto permite no solo traducir, sino tambien resaltar alineamientos palabra a palabra en la interfaz web, una funcionalidad poco habitual en modelos de traduccion empaquetados para navegador.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. Esta pensado para tareas de demostracion y docencia (el autor lo vincula a una practica de laboratorio de NLP y vision por computador), no como un sistema de traduccion de produccion de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), con decodificador fusionado y cache de clave/valor |
| Parametros totales | no disponible (modelo base Marian de tamano reducido; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX de 8 bits (q8) |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder de 8 bits y decodificador fusionado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder disenado para traduccion automatica. El proceso de ajuste es deliberadamente minimo: se congelan todos los pesos de `Helsinki-NLP/opus-mt-en-hi` y solo se actualiza el ultimo bloque del decodificador sobre 9.000 pares de frases limpias de la particion de entrenamiento del corpus IIT Bombay (`cfilt/iitb-english-hindi`). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

La innovacion tecnica principal esta en el empaquetado: el directorio `onnx/` contiene un encoder de 8 bits y un decodificador fusionado con cache de clave/valor, que exporta la atencion cruzada de cada capa. Esa exportacion permite recuperar alineamientos de atencion en el navegador, promediando las cabezas de la ultima capa del decodificador y combinando los pesos de subpalabras para resaltar palabras. El autor recomienda decodificacion voraz (greedy) para streaming y solicitar `output_attentions: true` y `return_dict_in_generate: true` para obtener dichos alineamientos.

## Capacidades

- Traduccion de texto de ingles a hindi, con salida token a token apta para streaming.
- Exportacion de alineamientos de atencion cruzada para resaltar correspondencias palabra a palabra.
- Ejecucion en navegador mediante Transformers.js con `AutoTokenizer.from_pretrained` y `AutoModelForSeq2SeqLM.from_pretrained` y `dtype: "q8"`.
- Decodificacion voraz optimizada para generacion incremental.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Cobertura multilingue limitada a la pareja ingles-hindi.

## Casos de uso

- Traduccion en el navegador sin backend: el modelo se carga con Transformers.js y ejecuta la inferencia en el cliente, lo que evita enviar texto a un servidor y reduce costes de infraestructura para aplicaciones web ligeras.
- Demostraciones docentes de traduccion neuronal: al estar vinculado a una practica de laboratorio, sirve para ilustrar el ciclo completo de ajuste fino, exportacion a ONNX y despliegue en el navegador con codigo de entrenamiento y exportacion disponible.
- Visualizacion de alineamientos palabra a palabra: gracias a la exportacion de atenciones cruzadas, permite construir interfaces que resalten que palabra inglesa corresponde a cada termino hindi, util en herramientas de aprendizaje de idiomas.
- Traduccion de contenido web en tiempo real: con decodificacion voraz y streaming, puede traducir fragmentos de texto a medida que se generan, adecuado para extensiones de navegador o widgets de traduccion.
- Prototipado rapido de funciones de traduccion: el tamano reducido del repositorio (0,1 GB) y la cuantizacion de 8 bits facilitan integrarlo en demos y pruebas de concepto sin infraestructura GPU.
- Evaluacion comparativa de tecnicas de ajuste ligero: al congelar todo salvo el ultimo bloque del decodificador, sirve como referencia para estudiar el impacto de ajustes minimos sobre un modelo base preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el repositorio de origen del laboratorio contiene puntuaciones de benchmark e informe, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB y los pesos estan en ONNX de 8 bits, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; por el tamano y la cuantizacion, el modelo esta pensado para ejecucion en CPU del navegador.
- Compatibilidad con GPU de consumo: no disponible; el diseno apunta a ejecucion en cliente (navegador) sin GPU dedicada.
- Opciones de despliegue: Transformers.js (principal), con pesos ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| manasrpandya/en-hi-mt-onnx | no disponible | no disponible | en, hi | Apache 2.0 | ONNX q8 |
| Helsinki-NLP/opus-mt-en-hi (base) | no disponible | no disponible | en, hi | Apache 2.0 | safetensors / PyTorch |
| Otros modelos Marian de Helsinki-NLP para en-hi | no disponible | no disponible | en, hi | Apache 2.0 | safetensors / PyTorch |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento ni de parametros exactos de alternativas en la informacion proporcionada. La diferencia principal frente al base es el ajuste del ultimo bloque del decodificador, la cuantizacion a 8 bits y el empaquetado para navegador con exportacion de atenciones.

## Limitaciones y advertencias

- El ajuste fino es muy limitado (solo el ultimo bloque del decodificador y 9.000 pares), por lo que la mejora sobre el modelo base puede ser marginal y no se cuantifica en la informacion disponible.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados, frases largas o terminologia tecnica.
- Cobertura limitada a la pareja ingles-hindi; no soporta otros idiomas.
- No se documenta la longitud maxima de contexto, lo que dificulta planificar el tratamiento de documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del corpus IIT Bombay si se redistribuyen datos derivados.
- Orientado a demostracion y docencia; no se han publicado evaluaciones de calidad en produccion.
- La decodificacion voraz recomendada puede producir salidas menos diversas que la busqueda por haz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manasrpandya/en-hi-mt-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi
- Codigo fuente del laboratorio (entrenamiento y exportacion): https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/02-translation
- Tarea del laboratorio: https://nlp-cv-lab.vercel.app/p/translation
- Dataset: https://huggingface.co/datasets/cfilt/iitb-english-hindi
