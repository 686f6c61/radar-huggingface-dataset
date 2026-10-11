# schizophyllume/BeeLLM

## Resumen

BeeLLM es un modelo publicado en Hugging Face por el usuario schizophyllume (firmado como "skizy") bajo licencia Apache 2.0 y distribuido en formato GGUF para su uso con llama.cpp. Su model card es una parodia: describe el modelo como "una abeja", declara el idioma "buzz" (zumbido), indica que sus usos son "zumbar y polinizar flores" y que sus datos de entrenamiento son "flores, praderas y bosques agradables". No se documenta ninguna arquitectura, dataset, proceso de entrenamiento ni evaluacion real.

Los metadatos de Hugging Face reportan 10.384 parametros totales, una cifra que no cuadra con ningun transformer utilizable y que encaja con el tono satirico de la ficha, donde se mencionan variantes de "30 parametros", "42 parametros" y "42P-Chaos". El repositorio ocupa aproximadamente 203 kB, lo que confirma que no contiene pesos de un modelo de lenguaje funcional de gran tamano.

Su relevancia es, por tanto, cultural y no tecnica: sirve como ejemplo de los modelos broma que circulan en la comunidad open source, como caso de prueba trivial para verificar que un servidor llama.cpp arranca correctamente, y como recordatorio de que las etiquetas de Hugging Face (GGUF, llama.cpp, text-generation) no garantizan que el artefacto sea un modelo de lenguaje operativo. No debe evaluarse como alternativa a ningun LLM real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe ninguna; tipo declarado: "bee") |
| Parametros totales | 10.384 (dato reportado por los metadatos de Hugging Face) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`, que es un parametro de configuracion de llama-server, no una especificacion del modelo) |
| Tipos de cuantizacion | GGUF (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | no disponible (la model card declara "buzz") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiquetas del repositorio); los metadatos de parametros se exponen en SafeTensors |

## Arquitectura y entrenamiento

No hay informacion tecnica sobre la arquitectura. La model card no menciona transformer, MoE, SSM ni ninguna otra familia; se limita a indicar "Model type: bee". Tampoco se especifica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La unica referencia a datos de entrenamiento es la frase "Flowers, meadows, and nice forests", que forma parte del tono humoristico del documento y no constituye una descripcion utilizable.

El autor lista variantes con nombres que parodian el escalado de parametros: BeeLLM-30P ("la abeja original de 30 parametros"), BeeLLM-42P ("mas expresiva, ahora puede picar"), BeeLLM-42P-Chaos ("modo caos") y una familia futura con sufijo "Mood" (1M-Mood, 1M-Mood-Chaos y 12M-Mood). No se aporta ninguna innovacion tecnica: ni decodificacion especulativa, ni atencion lineal, ni tecnicas de cuantizacion propias. El unico detalle operativo presente es el comando de arranque con `llama-server -m models/BeeLLM-30P.gguf -c 4096 --port 8081`.

## Capacidades

- Generacion de texto: no documentada. La model card no incluye ejemplos de salida ni afirma capacidad de generar lenguaje natural coherente.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible. El repositorio lleva la etiqueta `endpoints_compatible`, lo que indica compatibilidad con la API de inferencia de Hugging Face, no soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El unico "idioma" declarado es "buzz".
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Como broma, las capacidades declaradas por el autor son "zumbar y polinizar flores", con la advertencia de que "puede picar".

## Casos de uso

Advertencia previa: el autor no documenta ninguna capacidad funcional, por lo que los casos siguientes son usos plausibles derivados del formato y del tamano del artefacto, no aplicaciones verificadas.

- Prueba de humo de infraestructura: al ser un GGUF de unos 203 kB, permite comprobar que `llama-server`, `llama.cpp` u Ollama arrancan, cargan un fichero GGUF y exponen un endpoint HTTP sin consumir recursos ni descargar gigabytes de pesos.
- Verificacion de pipelines de CI: puede integrarse en un test automatizado que valide el flujo completo de despliegue (descarga desde Hugging Face, carga del modelo, peticion a `/completion`) antes de desplegar un modelo real.
- Demo de integracion con Lemonade: la busqueda web muestra instrucciones para usarlo con Lemonade (`lemonade pull`, `lemonade list`), de modo que sirve para practicar el ciclo de vida de un modelo en ese runtime sin coste de VRAM.
- Ejemplo didactico de ficha de modelo: util como caso de estudio sobre como una model card puede ser valida formalmente (licencia, tags, pipeline) y a la vez no describir ningun sistema real, para formar a revisores de modelos.
- Contenido divulgativo y humoristico: apropiado para articulos o charlas sobre cultura de la comunidad open source y sobre modelos broma publicados en Hugging Face.
- Prueba de compatibilidad de cuantizaciones: un artefacto diminuto permite validar herramientas de conversion o inspeccion de GGUF (por ejemplo, lectura de cabeceras y metadatos) sin manejar ficheros grandes.

En ningun caso debe emplearse para generacion de texto en produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera un LLM funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay datos de latencia o throughput mas alla del ejemplo de arranque con contexto de 4096 en llama-server.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que el repositorio ocupa aproximadamente 203 kB y los metadatos reportan 10.384 parametros, el peso real es insignificante y cabe en memoria RAM/VRAM de cualquier equipo.
- GPU recomendadas: no se requiere GPU. El ejemplo del autor usa `llama-server`, que funciona en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU. La pregunta relevante no es si cabe, sino si produce salidas utiles, y no hay evidencia de que lo haga.
- Opciones de despliegue: llama.cpp / llama-server (documentado por el autor), Ollama, Lemonade, y cualquier runtime compatible con GGUF y con la API de inferencia de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros modelos de la misma categoria (modelos broma o parodicos) con los que establecer una comparacion con datos verificables, y compararlo con LLM reales de 1B a 8B parametros no seria metodologicamente util: BeeLLM no documenta arquitectura, entrenamiento ni evaluacion, y su propio autor lo describe como una abeja.

Nota importante para evitar confusiones: el paper "BeLLM: Backward Dependency Enhanced Large Language Model for Sentence Embeddings" (Xianming Li y otros, 2024), que aparece en los resultados de busqueda, es un trabajo academico distinto sobre embeddings de frases. No guarda ninguna relacion con schizophyllume/BeeLLM mas alla de la similitud del nombre.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declara arquitectura, tokenizador, contexto real, datos de entrenamiento ni proceso de alineamiento, lo que impide cualquier evaluacion tecnica seria.
- Incoherencia interna de los datos: los metadatos indican 10.384 parametros, mientras que la model card habla de variantes de 30 y 42 parametros. Ninguna de las cifras corresponde a un modelo de lenguaje operativo.
- Riesgo de alucinacion: no evaluable, porque no hay evidencia de que el modelo genere texto linguisticamente utilizable.
- Sesgos: no disponibles. No hay evaluacion de sesgos ni de comportamiento en distintos idiomas.
- Limitaciones de idioma: la unica lengua declarada es "buzz", sin definicion tecnica.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, pero sin ninguna garantia por parte del autor. La licencia permisiva no implica que el artefacto sea funcional.
- Caveat de produccion: las etiquetas `text-generation`, `gguf` y `endpoints_compatible` son suficientes para que herramientas automaticas lo traten como un LLM valido, lo que puede provocar despliegues erroneos si un pipeline selecciona modelos por metadatos sin inspeccionar la model card.
- La propia model card advierte, en tono de broma, que el modelo "puede picar".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schizophyllume/BeeLLM
- Repositorio de ficheros: https://huggingface.co/schizophyllume/BeeLLM/tree/main
- Perfil de GitHub del autor: https://github.com/schizophyllume/
- Sitio personal del autor: https://schizophyllu.me/
- Paper no relacionado con nombre similar (BeLLM, sentence embeddings): https://www.researchgate.net/publication/382629692_BeLLM_Backward_Dependency_Enhanced_Large_Language_Model_for_Sentence_Embeddings
