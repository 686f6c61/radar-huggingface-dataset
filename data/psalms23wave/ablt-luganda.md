# Psalms23Wave/ablt-luganda

## Resumen

ABLT (Alkebulan Bantu-Luganda Tokenizer) versión 2 es un tokenizador especializado en luganda, una lengua bantú hablada principalmente en Uganda. Lo desarrolla Mathew Sekanjako bajo Psalms23Wave LLC como parte del proyecto Alkebulan AI. No es un modelo de lenguaje generativo, sino un componente de tokenización que combina reglas morfológicas propias del luganda con un modelo estadístico SentencePiece de tipo unigram. El problema que aborda es concreto: los tokenizadores genéricos (BPE o unigram entrenados sin conocimiento lingüístico) fragmentan las palabras bantúes sin respetar sus límites gramaticales, lo que obliga al modelo posterior a aprender cada raíz por separado en cada forma flexionada.

La innovación central es un paso previo de segmentación basado en gramática que corta las palabras donde cambia su significado (prefijos de concordancia, raíces, sufijos) antes de aplicar SentencePiece. El resultado es un vocabulario de 6.981 entradas (6.000 piezas, 980 piezas unibles y 1 token de unión) que reutiliza las raíces de forma consistente entre palabras derivadas: `▁ntu` es la misma pieza en `abantu`, `omuntu` y `ekintu`.

Es relevante ahora porque la mayoría de los modelos multilingües dedican una fracción mínima de su vocabulario a lenguas africanas de bajos recursos, y este tipo de tokenización morfológicamente informada puede reducir la presión sobre el vocabulario y mejorar la generalización en lenguas aglutinantes. No obstante, el propio autor reconoce que el beneficio aguas abajo (mejor aprendizaje o menos datos necesarios) aún no se ha medido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizador híbrido: segmentación por reglas morfológicas + SentencePiece unigram |
| Parámetros totales | no disponible (no es un modelo neuronal con pesos) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica (tokenizador) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | Luganda (código `lg`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.model` (SentencePiece) y `.joiners.json`; distribuido dentro del paquete `ablt` de PyPI |
| Tamaño de vocabulario | 6.981 (6.000 piezas + 980 piezas unibles + 1 token de unión) |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Librería | `ablt` |

## Arquitectura y entrenamiento

El tokenizador opera en dos etapas. Primero, un conjunto de reglas gramaticales del luganda identifica los límites morfológicos de cada palabra y marca los cortes con un carácter separador (`ǀ`). Después, un modelo SentencePiece de tipo unigram con 6.000 piezas se entrena sobre el texto ya segmentado. Las piezas que terminan en `ǀ` se marcan como unibles mediante el fichero `ablt-luganda-v2.joiners.json`, de modo que el decodificador puede reconstruir la palabra original exacta. El prefijo `▁` indica inicio de palabra, siguiendo la convención estándar de SentencePiece.

El corpus de entrenamiento consta de 58.346 líneas únicas de texto en luganda, mayoritariamente procedente del conjunto de datos SALT de Sunbird AI (licencia CC BY-SA 4.0). Se reservó una de cada diez líneas exclusivamente para pruebas. No se documenta el número total de tokens, la composición temática del corpus ni procesos de ajuste posteriores, que en un tokenizador no aplican. La innovación destacable es el uso de una tabla de reglas morfológicas específicas del luganda antes del paso estadístico, algo poco habitual en tokenizadores de lenguas de bajos recursos.

## Capacidades

- Segmentación morfológica de texto en luganda respetando límites gramaticales (prefijos, raíces y sufijos).
- Codificación a identificadores y decodificación reversible: el autor reporta reconstrucción exacta en 13.542 de 13.542 frases de prueba.
- Consistencia de raíces: una misma raíz se representa con la misma pieza en distintas palabras derivadas, lo que reduce la carga de aprendizaje para un modelo posterior.
- Manejo de mayúsculas iniciales de frase, con F1 de 93,3 % en palabras capitalizadas frente al 72,7 % de un SentencePiece plano.
- Interfaz de línea de comandos (`ablt --cuts`) y API de Python (`from ablt import ABLT`).
- Integración directa vía `pip install ablt`, con los ficheros del modelo empaquetados.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un tokenizador.

## Casos de uso

- Preprocesado de corpus en luganda para entrenar o ajustar modelos de lenguaje: el tokenizador se coloca como primera etapa del pipeline y entrega secuencias con raíces consistentes, lo que puede reducir el vocabulario efectivo necesario para cubrir la morfología de la lengua.
- Sistemas de análisis morfológico y etiquetado gramatical: los cortes en fronteras gramaticales permiten derivar prefijos y raíces de forma directa, útil en tareas de normalización o lematización en luganda.
- Construcción de vocabularios para modelos de traducción automática luganda-inglés: al compartir piezas entre formas flexionadas, el vocabulario del lado fuente se aprovecha mejor en corpus pequeños.
- Búsqueda y recuperación de información en textos luganda: la tokenización consistente de raíces mejora la coincidencia entre consultas y documentos con variación morfológica.
- Investigación en tokenización para lenguas bantúes: el repositorio incluye los scripts de evaluación en `packages/ablt/tools/`, lo que permite replicar las métricas y servir de plantilla para otras lenguas del grupo.
- Análisis de corpus y estadísticas lingüísticas: la salida con separadores explícitos (`Aba|ntu ba|agala oku|soma ebi|tabo.`) facilita contar raíces y afijos en estudios morfológicos.
- Componente educativo o de demostración en aplicaciones de procesamiento de luganda que necesiten un tokenizador ligero y sin dependencias de GPU.

## Benchmarks y rendimiento

| Prueba | ABLT v2 | SentencePiece plano (mismo texto, mismo tamaño) |
|---|---|---|
| Cortes en fronteras gramaticales, 83 palabras en luganda (F1) | 91,7 % | 41,3 % |
| Las mismas palabras con mayúscula inicial (F1) | 93,3 % | 72,7 % |
| Piezas por palabra, 7.060 frases de MasakhaNER 2.0 Luganda | 2,20 | 1,94 |
| Decodificación exacta, 13.542 frases | 13.542 de 13.542 | no disponible |

No se han publicado resultados de benchmarks aguas abajo (por ejemplo, perplejidad de un modelo entrenado con cada tokenizador) en la información disponible. El mayor número de piezas por palabra de ABLT es intencionado: el tokenizador plano deja más palabras enteras y, por tanto, genera menos piezas, pero con peor alineación gramatical.

## Requisitos de hardware

- Inferencia en CPU: el tokenizador es ligero y no requiere GPU; el paquete `ablt` se instala con `pip` y ejecuta en cualquier máquina con Python.
- VRAM estimada: 0 GB (no usa aceleración por hardware).
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU de consumo y también en entornos sin GPU (servidores pequeños, portátiles, contenedores).
- Opciones de despliegue: paquete `ablt` de PyPI, uso directo de la librería SentencePiece con el fichero `ablt-luganda-v2.model` y el JSON de uniones; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Tokenizador | Lengua | Tipo | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABLT v2 (este) | Luganda | Reglas morfológicas + SentencePiece unigram | 6.981 | Apache 2.0 | Hugging Face + PyPI |
| SentencePiece plano (referencia del autor) | Luganda | Unigram sin reglas | Mismo tamaño (no se detalla) | no disponible | Entrenado por el autor para la comparación |
| Tokenizadores multilingües genéricos (p. ej. los de modelos tipo mT5 o Llama) | Multilingüe | BPE o unigram | Decenas de miles a cientos de miles | Según el modelo | Amplia, pero sin reglas morfológicas bantúes |

No se dispone de comparaciones con otros tokenizadores específicos para luganda o para lenguas bantúes en la información proporcionada.

## Limitaciones y advertencias

- La tabla de reglas se validó con una lista de solo 83 palabras; el autor indica que debe revisarse y ampliarse por hablantes nativos de luganda.
- Cada palabra se corta una sola vez: `alisoma` se segmenta como `ali|soma`, cuando un análisis completo sería `a|li|soma`.
- Los nombres propios al inicio de frase se tratan como palabras ordinarias y pueden cortarse de forma incorrecta.
- Solo se ha probado con luganda; otras lenguas bantúes requieren sus propias tablas de reglas.
- No se ha demostrado que la segmentación morfológica mejore el aprendizaje de un modelo aguas abajo ni que reduzca los datos necesarios; es una hipótesis pendiente de validación.
- El corpus de entrenamiento procede mayoritariamente de SALT (CC BY-SA 4.0), lo que puede introducir sesgos de dominio y de registro propios de ese conjunto.
- Licencia Apache 2.0 permite uso comercial, pero exige conservar el fichero `NOTICE` en copias y trabajos derivados; ABLT, Sekan y Alkebulan AI son marcas registradas de Psalms23Wave LLC.
- El repositorio de Hugging Face registra 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Psalms23Wave/ablt-luganda
- Código y guía completa: https://github.com/Psalms23Wave/AlkebulanAI
- Paquete en PyPI: https://pypi.org/project/ablt/
- Web del autor: https://www.sekanjakomathew.com
- Contacto: https://www.psalms23wave.com/contact
- Conjunto de datos SALT (Sunbird AI): https://github.com/SunbirdAI/salt
