# OpenIntelligenceNet/Spark-X2.5-4B-Uncensored-GGUF

## Resumen

Spark-X2.5-4B-Uncensored-GGUF es un repositorio de pesos cuantizados en formato GGUF publicado por OpenIntelligenceNet. Contiene dos variantes del modelo Spark-X2.5 4B: una version en precision FP16 sin comprimir y una cuantizacion de 4 bits Q4_K_M calibrada con una matriz de importancia (imatrix) propia. El modelo se presenta como una version "uncensored", es decir, con las capas de alineacion artificial y los comportamientos de rechazo eliminados, orientada a respuestas directas en consultas creativas, de razonamiento y de rol.

El recuento de parametros reportado en safetensors es de 4.112.079.360 parametros, lo que situa al modelo en la categoria de 4B, con un tamano de repositorio de 10,8 GB que resulta coherente con la suma de un archivo FP16 (en torno a 8,2 GB) y un archivo Q4_K_M (en torno a 2,5 GB). La model card no especifica arquitectura, longitud de contexto, idiomas soportados ni licencia, por lo que buena parte de las especificaciones tecnicas habituales quedan sin confirmar por parte del autor.

La relevancia de esta publicacion es limitada en terminos de traccion: en el momento de la consulta el repositorio registra 0 descargas y 0 likes, y no se ha publicado informacion de benchmarks, paper tecnico ni dataset de entrenamiento. Su interes practico se concentra en el apartado de cuantizacion: la Q4_K_M fue calibrada con 2,14 millones de tokens seleccionados especificamente para preservar trazas de razonamiento (bloques `
