# apoorv079/bhojpuri-hindi-detector

## Resumen

El detector bhojpuri-hindi es un clasificador binario de identificacion de idioma desarrollado por el usuario de Hugging Face apoorv079. Su tarea concreta es distinguir entre bhojpuri (codigo ISO `bho`) e hindi (`hi`) en texto escrito en escritura devanagari, un par de lenguas especialmente dificil porque comparten alfabeto y una proporcion elevada de vocabulario. Los sistemas generalistas de identificacion de idioma tienden a confundirlas, y este modelo se presenta como una alternativa pequena, inspeccionable y con resultados publicados para ese par concreto.

Tecnicamente no es una red neuronal: es un clasificador de tipo naive Bayes sobre n-gramas de palabras y de caracteres, con aproximadamente 98 KB de pesos y escrito en Python puro, sin dependencias. Funciona en microsegundos y esta pensado como linea base abierta, no como sustituto de sistemas de cobertura amplia como GlotLID.

El modelo se entreno con introducciones de articulos de las Wikipedias en bhojpuri y en hindi, y declara una precision del 99,5% sobre frases de Wikipedia reservadas para test. Es relevante para quienes trabajan con lenguas de bajos recursos del norte de la India y necesitan un filtro rapido y ligero antes de aplicar modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de tipo naive Bayes sobre n-gramas de palabras (unigramas) y de caracteres (2-4-gramos) |
| Parametros totales | No disponible (aproximadamente 98 KB de pesos; 8.000 caracteristicas retenidas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clasificacion por frase, sin ventana definida) |
| Tipos de cuantizacion | No aplica (pesos discretos en Python puro, sin cuantizacion) |
| Idiomas soportados | Bhojpuri (`bho`) e hindi (`hi`), solo en escritura devanagari |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | No disponible (implementacion en Python puro, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo no emplea un transformer. Se trata de un scorer de tipo naive Bayes que suma pesos de log-odds sobre caracteristicas lexicas y sublexicas: unigramas de palabra y n-gramas de caracteres de longitud 2 a 4 dentro de cada palabra, conservando las 8.000 caracteristicas mas informativas. La salida es una suma de log-odds, no una probabilidad calibrada, y el modelo devuelve la etiqueta `unknown` cuando el texto no contiene devanagari o no presenta caracteristicas conocidas.

Los datos de entrenamiento proceden de introducciones de articulos aleatorios de las Wikipedias en bhojpuri y hindi, unas 1.700 articulos por lengua. El texto se dividio en frases, se eliminaron digitos y caracteres no devanagari y se deduplico. La particion se hizo por articulo, de modo que ningun articulo aparece simultaneamente en entrenamiento y test, y el conjunto de entrenamiento se balanceo a 5.520 frases por idioma. No se documenta uso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Identificacion binaria de idioma entre bhojpuri e hindi en texto devanagari.
- Puntuacion continua mediante `score()`, donde valores positivos indican bhojpuri y negativos hindi.
- Deteccion de entradas no validas: devuelve `unknown` ante texto sin devanagari o sin caracteristicas reconocidas.
- Uso como funcion de Python (`detect`, `score`) o como script de linea de comandos (`python detect.py`).
- Ejecucion sin dependencias externas y con latencia de microsegundos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Filtrado previo en corpus multilingues: antes de enviar documentos a un modelo mayor o a un pipeline de anotacion, el detector separa rapidamente las frases en bhojpuri de las que estan en hindi, con un coste computacional despreciable.
- Curado de datasets para lenguas de bajos recursos: permite auditar si una coleccion etiquetada como bhojpuri contiene realmente texto en hindi, un problema frecuente en corpus de la India.
- Enrutamiento en sistemas de traduccion automatica: si el texto de entrada es bhojpuri, se dirige a un motor especifico; si es hindi, a otro, evitando traducciones erroneas por confusion de lengua.
- Analisis linguistico y sociolinguistico: clasificacion de muestras de texto devanagari para estudiar la mezcla de codigos y la frontera entre ambas lenguas en corpus escritos.
- Preprocesamiento en buscadores y sistemas de recuperacion de informacion: asignar la etiqueta de idioma a cada documento para indexar y filtrar por lengua antes de la busqueda.
- Control de calidad en proyectos de anotacion: detectar automaticamente frases mal etiquetadas por anotadores humanos y priorizar su revision.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre frases de Wikipedia reservadas para test:

| Subconjunto | Frases | Precision |
|---|---|---|
| Total | 3.105 (1.627 bhojpuri / 1.478 hindi) | 99,5% |
| Cortas (menos de 60 caracteres) | 820 | 98,5% |
| Largas (60 caracteres o mas) | 2.285 | 99,8% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa aproximadamente 98 KB de pesos y se ejecuta en CPU.
- GPU recomendadas: ninguna; cualquier CPU sirve.
- Cabe en cualquier equipo, incluidos dispositivos de bajos recursos y entornos embebidos.
- Opciones de despliegue: ejecucion directa con Python (`detect.py`), integracion como funcion en un pipeline propio o exposicion mediante un microservicio HTTP.
- Latencia: del orden de microsegundos por llamada segun el autor; el throughput depende del interprete de Python y del hardware, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Precisión declarada | Licencia |
|---|---|---|---|---|---|
| bhojpuri-hindi-detector (apoorv079) | Naive Bayes sobre n-gramas | bho, hi | No disponible | 99,5% en test de Wikipedia | CC BY-SA 4.0 |
| GlotLID | Identificador multilingue de cobertura amplia | Cientos de lenguas, incluido bhojpuri | No disponible | No disponible en la informacion proporcionada | No disponible |
| Hindi AI Detector (Evernote) | Detector de contenido generado por IA en hindi | hi | No disponible | No disponible | No disponible |

El detector de Evernote no es estrictamente comparable: detecta texto generado por IA, no la lengua, y se incluye solo como referencia de herramientas que operan sobre hindi.

## Limitaciones y advertencias

- Los datos de test son texto enciclopedico formal de la misma fuente que el entrenamiento; la precision en mensajes de chat, redes sociales, letras de canciones o transcripciones de voz sera menor y no ha sido medida.
- Las etiquetas provienen de la edicion de Wikipedia correspondiente, no de una revision por hablantes nativos; parte del texto de la Wikipedia en bhojpuri es cercano al hindi y algunas etiquetas probablemente son ruidosas.
- Solo admite escritura devanagari: el texto romanizado no se maneja.
- No distingue maitili, awadhi, magahi ni otras lenguas vecinas, que pueden forzarse a una de las dos clases.
- Las entradas muy cortas (una o dos palabras) no son fiables.
- La puntuacion de `score()` es una suma de log-odds, no una probabilidad calibrada; no debe interpretarse como nivel de confianza.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas, lo que condiciona su uso comercial.
- No se han publicado mediciones de rendimiento fuera del dominio de Wikipedia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apoorv079/bhojpuri-hindi-detector
- Perfil del autor en Hugging Face: https://huggingface.co/apoorv079
- Spaces del autor: https://huggingface.co/apoorv079/spaces
- Hindi AI Detector de Evernote (referencia, no relacionado): https://evernote.com/ai-detector/hindi-ai-detector
