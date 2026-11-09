# pauldubois98/musicocr-models

## Resumen

MusicOCR models (copista, ONNX) es un conjunto de exportaciones a formato ONNX de las redes neuronales de la familia copista desarrolladas por KobiMusic, publicadas por el usuario pauldubois98. El paquete no introduce pesos nuevos: son conversiones de los modelos originales copista-2m y copista-28m, junto con el modelo de evidencias de copisteria (2M parametros), empaquetados para su uso con ONNX Runtime Web en el navegador. El problema que resuelve es el reconocimiento optico de partituras musicales (OMR, optical music recognition) completamente en el cliente, sin enviar imagenes a un servidor.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribucion (un export) mas que de un modelo fundacional nuevo. El repositorio ocupa 0,1 GB y contiene cinco grafos ONNX (dos por cada detector copista, mas el modelo de evidencias) y un fichero de metadatos JSON con la lista de clases, vocabularios de atributos y constantes de decodificacion. La arquitectura subyacente es una red convolucional dividida en un tronco (trunk) que procesa la imagen y un verificador (verifier) que evalua los picos top-K detectados, con un modelo auxiliar de evidencias.

La licencia es Apache 2.0, heredada tanto de los pesos originales como del codigo de copisteria. Al no existir pipeline declarado ni idiomas especificados, la informacion disponible es limitada y esta ficha se limita a documentar lo que consta en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales para deteccion de simbolos musicales; cada detector copista se divide en tronco convolucional y verificador sobre los picos top-K; modelo de evidencias auxiliar |
| Parametros totales | copista-2m: aproximadamente 2M; copista-28m: aproximadamente 28M; modelo de evidencias: aproximadamente 2M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos exportados desde PyTorch) |

## Arquitectura y entrenamiento

Los modelos originales copista son detectores de simbolos musicales de tipo convolucional. Cada detector se exporta como dos grafos separados: un tronco convolucional que procesa la imagen de la partitura y un verificador que opera sobre los K picos mas probables para refinar la deteccion. El paquete incluye ademas copista-evidence.onnx, el modelo de evidencias de 2M parametros de copisteria, y copista-meta.json con la lista de clases, los vocabularios de atributos y las constantes de decodificacion necesarias para interpretar las salidas.

La conversion se realizo con el script scripts/models/export_copista.py del repositorio OpticalMusicRecognition, a partir del codigo de kobimusic/copisteria en el commit c685f280914d91a694494588d9f6a376d7917eba. Segun la model card, cada grafo fue verificado contra su equivalente en PyTorch con una diferencia absoluta maxima de 1e-4. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes procesadas, ni sobre tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Reconocimiento optico de partituras musicales (OMR): deteccion de simbolos musicales en imagenes de partituras.
- Deteccion de simbolos con dos variantes de capacidad: copista-2m (ligera) y copista-28m (mayor).
- Verificacion de detecciones mediante un grafo especifico que evalua los picos top-K.
- Modelo de evidencias de 2M parametros para puntuar o filtrar detecciones.
- Inferencia completamente en el cliente mediante ONNX Runtime Web, sin backend.
- Decodificacion de atributos musicales a partir de los vocabularios incluidos en copista-meta.json.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Digitalizacion de partituras en el navegador: el usuario sube una imagen de partitura y el modelo detecta los simbolos localmente, sin enviar la imagen a ningun servidor, lo que resulta adecuado por privacidad y por no requerir infraestructura de backend.
- Edicion musical asistida: integracion de los grafos ONNX en un editor web para convertir una partitura escaneada en una representacion estructurada editable, usando copista-meta.json para mapear clases y atributos.
- Aplicaciones educativas de musica: ejercicios interactivos que reconocen en tiempo real los simbolos de una partitura fotografiada por el alumno, aprovechando la variante copista-2m por su menor coste computacional.
- Herramientas offline de archivo musical: procesamiento por lotes de digitalizaciones de partituras en entornos sin conectividad, ejecutando los grafos con ONNX Runtime en local.
- Prototipado de pipelines OMR: uso de los grafos exportados como referencia para validar implementaciones propias, ya que la model card documenta la equivalencia con PyTorch (diferencia maxima de 1e-4).
- Investigacion en OMR: comparacion de las dos variantes (2M y 28M parametros) para estudiar el equilibrio entre coste y precision en deteccion de simbolos.
- Despliegue en dispositivos de bajos recursos: la variante copista-2m y el modelo de evidencias de 2M parametros son adecuados para entornos con memoria limitada, aunque no se publican cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete esta pensado para ejecutarse en el navegador con ONNX Runtime Web, lo que sugiere que las variantes de 2M y 28M parametros caben en memoria de cliente convencional.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se especifica; el diseno apunta a ejecucion en el cliente (navegador), no a servidores con GPU dedicada.
- Opciones de despliegue: ONNX Runtime Web en navegador; los grafos ONNX pueden ejecutarse con otros runtimes compatibles con ONNX, aunque no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MusicOCR models (copista, ONNX) | 2M / 28M / 2M | no aplica | OMR (deteccion de simbolos) | Apache 2.0 | Hugging Face (ONNX) |
| kobimusic/copista-2m | aproximadamente 2M | no aplica | OMR | Apache 2.0 | Hugging Face (pesos originales) |
| kobimusic/copista-28m | aproximadamente 28M | no aplica | OMR | Apache 2.0 | Hugging Face (pesos originales) |
| kobimusic/copisteria | no disponible | no aplica | OMR (codigo y modelos) | Apache 2.0 | GitHub |

La comparativa se limita a los modelos de origen, ya que no se dispone de datos de rendimiento ni de alternativas OMR documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete es una conversion de pesos existentes, no un modelo nuevo; cualquier limitacion de copista-2m y copista-28m se hereda.
- No se documentan sesgos conocidos, pero al ser un modelo de vision entrenado sobre partituras, su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de simbolos.
- No se especifican idiomas ni cobertura de notacion musical mas alla de lo que contenga copista-meta.json.
- La licencia Apache 2.0 permite uso comercial, pero al ser copias modificadas de pesos de KobiMusic debe conservarse la atribucion indicada en el fichero NOTICE.
- No hay pipeline declarado ni datos de benchmarks, por lo que no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pauldubois98/musicocr-models
- Repositorio GitHub de MusicOCR: https://github.com/pauldubois98/OpticalMusicRecognition
- Script de exportacion: https://github.com/pauldubois98/OpticalMusicRecognition/blob/main/scripts/models/export_copista.py
- Codigo fuente de copisteria: https://github.com/kobimusic/copisteria
- Pesos originales copista-2m: https://huggingface.co/kobimusic/copista-2m
- Pesos originales copista-28m: https://huggingface.co/kobimusic/copista-28m
