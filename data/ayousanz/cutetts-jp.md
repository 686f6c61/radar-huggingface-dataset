# ayousanz/CuteTTS-jp

## Resumen

CuteTTS-jp es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por el usuario ayousanz (ayutaz) mediante ajuste fino por continuación de entrenamiento sobre OPPOer/CuteTTS, el modelo base de OPPO y la Universidad de Fudan. El modelo parte de un sistema de unos 230 millones de parámetros con salida a 24 kHz y generación secuencial, y añade 325,9 horas de audio en japonés durante 30.000 pasos de actualización. Su objetivo es corregir el mal rendimiento del modelo base en japonés: la tasa de error de lectura pasa del 30,94 % al 7,12 % en un conjunto de 600 frases de conversación cotidiana, frente al 5,59 % que se obtiene al transcribir grabaciones humanas reales con el mismo procedimiento de medición.

Además de la lectura de texto, el modelo incorpora clonación de voz a partir de un audio de referencia y una función separada de transferencia de prosodia: si se le entrega una grabación humana de la misma frase, copia la evolución del tono fundamental de esa locución. También admite generación por tramos, de modo que puede empezar a emitir audio sin esperar a procesar la frase completa.

Su relevancia es doble. Por un lado, demuestra que un ajuste de 1,4 horas en una única RTX 3090 basta para llevar un TTS multilingüe a un japonés razonablemente inteligible, con pesos publicados en fp32 y licencia Apache 2.0. Por otro, la model card documenta con detalle y sin adornos los límites que persisten: la coincidencia en la posición del pico acentual con hablantes humanos es del 43,6 %, por debajo del 44,8 % que acierta un diccionario de acentos, y el rendimiento en chino queda destruido por el ajuste monolingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal con componente de modelo de lenguaje autorregresivo (derivado de Qwen3), códec de audio Descript Audio Codec y esquema de generación por tramos tipo F5-TTS; salida a 24 kHz |
| Parámetros totales | ~230 millones (según la model card del modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se publican en fp32 |
| Idiomas soportados | japonés (ja). El inglés se mantiene intacto tras el ajuste (WER 1,7 %); el chino queda degradado (CER del 11,5 % al 77,2 %) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en fp32 (repositorio de 1,2 GB) |
| Modelo base | OPPOer/CuteTTS |
| Librería | cutetts |
| Frecuencia de muestreo de salida | 24 kHz |
| Datos de ajuste | 325,9 horas de audio en japonés; 30.000 pasos con 4 frases por paso |
| Fecha de publicación en HuggingFace | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base CuteTTS: un modelo de lenguaje autorregresivo que genera tokens de audio comprimidos, reconstruidos posteriormente por el códec Descript Audio Codec, con un esquema de generación por tramos inspirado en F5-TTS. La parte lingüística se apoya en Qwen3 y el front-end de texto usa pyopenjtalk-plus para obtener lecturas y acentos del japonés. El ajuste no modifica esta estructura: se continúa el entrenamiento del modelo base con datos japoneses.

El autor detalla las condiciones del ajuste: tasa de aprendizaje 2e-5, 30.000 pasos de actualización con 4 frases por paso, transformación de texto `accent` (conversión de todo el texto a katakana con marcas de acento) y 1,4 horas de cómputo en una RTX 3090. La model card insiste en dos puntos críticos. Primero, el modelo debe usarse siempre junto al front-end `accent`; si se le pasa texto con kanji sin convertir, la precisión cae de forma severa porque el modelo no vio esa forma durante el entrenamiento. Segundo, el entrenamiento se hizo con pesos en fp32: el autor advierte que ajustar sobre formatos de precisión reducida deja el 91 % de los pesos sin actualizar. El repositorio de GitHub publica los scripts, el procedimiento completo de reproducción y unos 2 GB de datos preprocesados para repetir el entrenamiento.

## Capacidades

- Síntesis de voz en japonés a 24 kHz con una tasa de error de lectura del 7,12 % en el conjunto de evaluación del autor.
- Clonación de voz a partir de un audio de referencia, incluida la imitación de hablantes no vistos durante el entrenamiento.
- Transferencia de prosodia: con una grabación humana de la misma frase (`--prosody-reference`), reproduce la evolución del tono fundamental; la similitud mejora en +0,104 puntos.
- Separación entre timbre de voz (`--reference-audio`) y prosodia (`--prosody-reference`), que pueden aplicarse simultáneamente.
- Generación secuencial: emite audio por tramos sin esperar a completar la frase.
- Reducción de la proporción de locuciones que no terminan (de 3,2 % a 0,5 %).
- Normalización de números kanji a kana y asignación de lecturas a palabras poco frecuentes, activadas por defecto en el pipeline oficial.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni comprensión de audio de entrada. Es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Doblaje y localización de anime y videojuegos: el modelo permite generar líneas de diálogo con la voz de un actor concreto a partir de una referencia, y la transferencia de prosodia con la grabación original facilita mantener la intención interpretativa de la escena. La distribución de los datos de entrenamiento (diálogo de animación y videojuegos) encaja con este dominio.
- Reposición de diálogos en postproducción (ADR): cuando una línea no se grabó bien o hay que reescribirla, se puede resintetizar con la voz del actor y con la curva de entonación de una toma válida de la misma frase.
- Audiolibros y prensa leída: clonación de la voz de un locutor concreto para narrar textos largos, con generación secuencial para empezar a reproducir antes de procesar todo el capítulo. Requiere preprocesar números, fechas y unidades, que el modelo apenas vio en entrenamiento.
- Asistentes de voz e IVR en japonés: la generación por tramos reduce la latencia percibida en respuestas habladas, y el tamaño de 230 millones de parámetros permite desplegarlo en una GPU modesta junto al resto del sistema.
- Prototipado de personajes en desarrollo de videojuegos: generar voces de personaje antes de contratar al reparto, o producir variantes de una misma línea con distintas entonaciones para pruebas de audio.
- Accesibilidad y lectura de contenidos: conversión de documentos a audio para personas con discapacidad visual, con la advertencia de que el registro será interpretativo y no neutro, y de que los errores de lectura ronda el 7 % de las palabras.
- Investigación en prosodia japonesa: el modelo sirve como banco de pruebas para medir transferencia de entonación y comparar contra el límite superior del método de medición, ya que el autor publica la metodología y los valores de referencia humanos.
- Generación de material de escucha para aprendizaje de japonés: utilizable solo con reservas, porque la posición del pico acentual coincide con la de un hablante nativo en el 43,6 % de los casos, por debajo de un diccionario de acentos.

## Benchmarks y rendimiento

Mediciones del autor sobre 600 frases de conversación cotidiana. La columna "referencia" recoge el valor obtenido al pasar grabaciones humanas reales por el mismo procedimiento automático de evaluación, es decir, el límite práctico de la medición.

| Métrica | Antes del ajuste | CuteTTS-jp | Referencia humana / límite del método |
|---|---|---|---|
| Tasa de error de caracteres | 35,86 % | 16,39 % | 10,42 % (grabación humana) |
| Tasa de error de lectura | 30,94 % | 7,12 % | 5,59 % (grabación humana) |
| Errores de sokuon, hatsuon, chōon y ensordecimiento | 46,9 % | 2,43 % | no disponible |
| Similitud de la curva de F0 con la humana (sin referencia) | +0,024 | +0,091 | +0,367 (límite del método) |
| Similitud de F0 con referencia de la misma frase | no disponible | +0,168 | +0,367 (límite del método) |
| Coincidencia en la posición del pico acentual | 35,2 % | 43,6 % | 64,5 % entre humanos; 44,8 % el diccionario de acentos |
| Locuciones que no terminan | 3,2 % | 0,5 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB contando pesos en fp32 (unos 0,92 GB), el códec de audio y los estados intermedios. Es una estimación propia; el autor no publica cifras de VRAM de inferencia.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM, como una GTX 1650, RTX 3050, RTX 3060 o superior.
- Entrenamiento: el ajuste completo se hizo en una RTX 3090 en aproximadamente 1,4 horas para 30.000 pasos.
- Aceleradoras de gama alta (A100, H100) no aportan ventaja significativa dado el tamaño del modelo; pueden ser útiles solo para servir muchas peticiones en paralelo.
- Opciones de despliegue: scripts oficiales del repositorio ayutaz/CuteTTS-jp, gestionados con `uv`, e integración mediante la librería `cutetts`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput concretos: no disponible. El modelo soporta generación secuencial, pensada para reducir el tiempo hasta el primer fragmento de audio, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento en japonés |
|---|---|---|---|---|---|---|
| CuteTTS-jp | ~230 M | no disponible | ja (inglés conservado, chino degradado) | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Error de lectura 7,12 %; error de caracteres 16,39 %; coincidencia acentual 43,6 % |
| OPPOer/CuteTTS (base) | ~230 M | no disponible | no disponible | Apache 2.0 | HuggingFace | Error de lectura 30,94 %; error de caracteres 35,86 % según las mediciones del autor de CuteTTS-jp |
| Otras alternativas de TTS japonés (F5-TTS con ajuste japonés, Style-Bert-VITS2, GPT-SoVITS) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación con alternativas de la misma categoría no puede completarse porque la información disponible no incluye especificaciones ni métricas de esos sistemas. La única comparación cuantitativa verificable es contra el modelo base, sobre el que este ajuste mejora la lectura en japonés en 23,82 puntos porcentuales, a costa de destruir el rendimiento en chino.

## Limitaciones y advertencias

- La prosodia y el acento no alcanzan nivel humano: la similitud de la curva de F0 sin referencia es de +0,091 frente a un límite de método de +0,367, y la coincidencia en la posición del pico acentual es del 43,6 %, por debajo del 44,8 % que acierta un diccionario de acentos.
- La función de transferencia de prosodia no corrige la posición del pico acentual: entregar la grabación humana correcta de la misma frase no produce diferencia respecto a no entregar nada en esa métrica; solo mejora la similitud de la curva de F0.
- Si se pasa una grabación de referencia de una frase distinta a la que se va a sintetizar, el acento empeora en 3,78 puntos. La referencia de prosodia debe ser siempre la lectura exacta del mismo texto.
- El rendimiento en chino está roto por el ajuste monolingüe: el CER pasó del 11,5 % al 77,2 %. El inglés no se degradó (WER 1,7 %), pero no es un objetivo declarado del modelo.
- Los números, fechas, unidades y textos con caracteres alfanuméricos mixtos se manejan mal: solo el 1,3 % del corpus de entrenamiento contenía números. Es obligatorio convertir los números kanji a kana antes de la síntesis.
- El estilo de habla está sesgado hacia la interpretación: el corpus se compone mayoritariamente de diálogos de anime y videojuegos, por lo que el resultado es actoral y no una locución neutra.
- Exigencia de preprocesado obligatorio: el modelo solo funciona correctamente con la transformación `accent` (texto completo en katakana con marcas de acento). Pasar kanji directamente provoca una caída grande de precisión.
- Los pesos deben manipularse en fp32 si se va a continuar el entrenamiento; hacerlo en formatos de precisión reducida deja sin actualizar el 91 % de los pesos.
- Riesgo de uso indebido por clonación de voz: el autor prohíbe expresamente imitar la voz de personas reales sin su consentimiento, así como el suplantación de identidad, el fraude, la difusión de desinformación y cualquier intento de inferir la identidad del hablante a partir de una muestra.
- Licencia Apache 2.0, que permite uso comercial, pero con la salvedad de que las restricciones éticas anteriores no son condiciones jurídicas de la licencia y recaen en la responsabilidad del usuario. Los derechos de la parte correspondiente al modelo base son de OPPO y la Universidad de Fudan bajo Apache 2.0, y los del ajuste japonés, de ayutaz.
- Disponibilidad muy baja: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de las métricas, que proceden exclusivamente del autor.
- No hay datos publicados sobre comportamiento en frases muy largas ni sobre estabilidad en generación multi-turno, ni cifras de latencia en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ayousanz/CuteTTS-jp
- Repositorio de código, procedimiento de entrenamiento y datos preprocesados: https://github.com/ayutaz/CuteTTS-jp
- Modelo base en HuggingFace: https://huggingface.co/OPPOer/CuteTTS
- Repositorio de CuteTTS (OPPO-Mente-Lab): https://github.com/OPPO-Mente-Lab/CuteTTS
- Descript Audio Codec: https://github.com/descriptinc/descript-audio-codec
- F5-TTS: https://github.com/SWivid/F5-TTS
- Qwen3: https://github.com/QwenLM/Qwen3
- pyopenjtalk-plus: https://github.com/tsukumijima/pyopenjtalk-plus
