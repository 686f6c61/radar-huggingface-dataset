# manasrpandya/flickr-caption-runs

## Resumen

`manasrpandya/flickr-caption-runs` es un repositorio de experimentos de generacion automatica de descripciones de imagenes (image captioning) publicado por el usuario manasrpandya. No se trata de un modelo unico, sino de un contenedor que agrupa dos arquitecturas distintas entrenadas sobre un subconjunto del dataset Flickr8k: un modelo CNN con atencion soft sobre un decodificador LSTM, y un modelo basado en un codificador ViT-tiny congelado con un decodificador GPT-2 de cuatro capas y atencion cruzada.

El entrenamiento se realizo sobre 1.000 imagenes del split de entrenamiento de Karpathy, con cinco descripciones por imagen y un conjunto de validacion separado de 128 fotos. Se trata, por tanto, de un experimento academico o de laboratorio de escala reducida, no de un modelo listo para produccion.

Su relevancia es limitada fuera del ambito educativo: sirve como referencia para comparar enfoques clasicos (CNN+LSTM) frente a enfoques basados en transformers con codificador visual preentrenado, y como ejemplo reproducible de un pipeline completo de captioning. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0.0 GB segun los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes: CNN + LSTM con atencion soft; ViT-tiny congelado + decodificador GPT-2 de 4 capas con atencion cruzada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las descripciones de Flickr8k estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene dos carpetas con checkpoints independientes. La variante `cnn/` implementa un codificador convolucional entrenado desde cero junto con un decodificador LSTM que incorpora atencion soft, un diseno clasico en captioning previo a la generalizacion de los transformers. La variante `vit/` emplea un ViT-tiny congelado como extractor de caracteristicas visuales y un decodificador GPT-2 de cuatro capas con atencion cruzada hacia las representaciones del codificador.

Ambos modelos se entrenaron sobre 1.000 imagenes del split de Karpathy de Flickr8k, con cinco descripciones por imagen, y se valido sobre 128 imagenes separadas. Cada carpeta incluye el vocabulario y el historial de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de Flickr8k, ni si se aplicaron tecnicas de RLHF o DPO. El codigo del proyecto esta disponible en el repositorio de GitHub del autor y permite cargar cualquiera de los dos checkpoints y reproducir la evaluacion.

## Capacidades

- Generacion de descripciones de imagenes (image-to-text) en ingles, segun el pipeline declarado.
- Dos variantes de arquitectura comparables entre si para experimentacion.
- Incluye vocabulario y historial de entrenamiento en cada carpeta.
- Version ONNX para navegador disponible en un repositorio separado (`flickr-cap-onnx`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues; el dataset de origen es en ingles.
- No se documentan modos especiales (thinking, vision adicional, audio).

## Casos de uso

- Experimentacion academica en captioning: el repositorio permite comparar una linea base CNN+LSTM con atencion frente a un enfoque transformer con ViT-tiny y GPT-2, usando el mismo conjunto de datos y el mismo codigo de evaluacion.
- Reproduccion de resultados: el codigo del proyecto carga cualquiera de los dos checkpoints y reproduce la evaluacion, lo que facilita la verificacion de resultados en un entorno controlado.
- Docencia y aprendizaje: sirve como ejemplo completo de pipeline de vision-lenguaje, desde la preparacion de datos hasta el entrenamiento y la evaluacion.
- Prototipado de demos en navegador: la version ONNX (`flickr-cap-onnx`) permite desplegar el modelo en el navegador sin backend, util para demostraciones interactivas.
- Pruebas de integracion con la libreria transformers: al declarar `transformers` y `safetensors`, puede cargarse con las herramientas habituales del ecosistema para validar flujos de inferencia image-to-text.
- Base para fine-tuning en dominios especificos: al ser un modelo pequeno entrenado sobre un dataset reducido, puede servir como punto de partida para experimentos de ajuste con datos propios de un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un ViT-tiny con un decodificador GPT-2 de cuatro capas y una CNN+LSTM, el consumo deberia ser bajo, pero no se proporcionan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido de las arquitecturas, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada) y ONNX para navegador (repositorio `flickr-cap-onnx`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado sobre solo 1.000 imagenes de Flickr8k, lo que limita severamente la generalizacion a dominios visuales distintos.
- Conjunto de validacion de solo 128 imagenes, insuficiente para estimaciones robustas de rendimiento.
- Descripciones en ingles; no se documenta soporte multilingue.
- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Riesgo de alucinacion y de descripciones genericas o incorrectas fuera de la distribucion de Flickr8k.
- No hay datos publicados de benchmarks, por lo que no se puede evaluar su calidad frente a alternativas.
- Proyecto con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion adicional exhaustiva y una revision de licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manasrpandya/flickr-caption-runs
- Version ONNX para navegador: https://huggingface.co/manasrpandya/flickr-cap-onnx
- Codigo del proyecto: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/01-image-captioning
- Dataset de referencia: Flickr8k (split de Karpathy), no se proporciona enlace directo en la informacion disponible.
