# adoamesh/tiny-voca-swahili

## Resumen

tiny-voca Kiswahili (55k) es un modelo de síntesis de voz (text-to-speech) para suajili desarrollado por el usuario adoamesh, construido desde cero con la receta tiny-voca de Nazeem (@n4ze3m). Con solo 4,54 millones de parámetros y un export ONNX de 21,4 MB, el modelo está diseñado para ejecutarse íntegramente en CPU y de forma offline en dispositivos de gama baja, incluyendo teléfonos Android antiguos con arquitectura ARMv7.

El modelo resuelve un problema muy concreto: la síntesis de voz en suajili sin dependencia de la nube ni de hardware especializado. Emplea una arquitectura de vocoder source-filter con cabeza de duración y cuatro capas de encoder, y trabaja sobre fonemas (no sobre grafemas) mediante un transductor determinista de letras a fonemas específico del suajili. Su ventana de entrada está limitada a 512 tokens y 3.000 frames (32 segundos de audio).

Es relevante ahora porque demuestra que es viable desplegar TTS neuronal en dispositivos sin GPU y sin conexión, con un consumo de memoria de 71-75 MB y un factor de tiempo real (RTF) de 0,16-0,21 en un Redmi 9A. El modelo se distribuye bajo licencia CC-BY-SA-4.0, heredada del dataset WAXAL, y se encuentra en estado de prototipo sin evaluación formal de calidad (sin MOS ni WER).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | tiny-voca: vocoder source-filter con cabeza de duración, 4 capas de encoder |
| Parámetros totales | 4,54 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; límite de 512 tokens de entrada y 3.000 frames (32 s) de audio |
| Tipos de cuantización | no disponible (export fp32 de 21,4 MB) |
| Idiomas soportados | suajili (sw) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (21,4 MB fp32); checkpoint PyTorch de 18 MB |
| Frecuencia de muestreo | 24 kHz, hop de 256 muestras (10,67 ms por frame) |
| Inventario de fonemas | 76 símbolos, una marca de acento por token |
| Voces | 7 identificadores de hablante (1-6 y 8) |
| Pasos de entrenamiento | 55.000 de 104.000 planificados |

## Arquitectura y entrenamiento

El modelo sigue la receta tiny-voca: un vocoder source-filter con cabeza de duración y cuatro capas de encoder. La entrada no son grafemas sino identificadores de fonemas procedentes de un inventario de 76 símbolos, acompañados de una marca de acento por token (0 ninguno, 1 primario, 2 secundario). El front end de texto es un transductor determinista de letras a fonemas del suajili que cubre reglas como `ch`→tʃ, `sh`→ʃ, `ny`→n j, `ng'`→ŋ, `th`/`dh`→θ/ð y acento en la penúltima sílaba; no interviene ningún modelo de grafemas ni mecanismo de atención sobre el texto. La interfaz ONNX acepta además controles de velocidad (divisor de duración), desplazamiento de tono (log-Hz) y rango de prosodia, y devuelve tanto el audio como las duraciones por token, que permiten alineación exacta muestra a muestra.

El entrenamiento parte del subconjunto `swa_tts` de google/WaxalNLP (CC-BY-SA-4.0), remuestreado a 24 kHz: 2.497 enunciados (unas 13 horas) de 7 hablantes que pasaron alineamiento forzado con `facebook/wav2vec2-lv-60-espeak-cv-ft` con una puerta del 55%. Los splits reservan texto de frase, no ficheros, porque WAXAL reutiliza frases entre grabaciones. El modelo se entrenó desde cero (no es un fine-tuning del checkpoint inglés) en la capa gratuita de Kaggle con 2×T4, deteniéndose a los 55.000 pasos cuando las muestras de la etapa 8 resultaron inteligibles.

## Capacidades

- Síntesis de voz en suajili a 24 kHz a partir de fonemas, con salida mono en float32 y pico por debajo de 0,5.
- Control de velocidad de habla mediante divisor de duración (por ejemplo, 1,2 equivale a un 20% más rápido).
- Control de tono y de rango de prosodia mediante `pitch_shift` y `pitch_range`.
- Selección entre 7 voces fijas de hablantes de WAXAL.
- Devolución de duraciones por token que permiten resaltado palabra a palabra sincronizado con el audio en una sola pasada.
- Ejecución offline en CPU, sin nube, con ONNX Runtime.
- No soporta clonación de voz (no hay encoder de hablante), ni cambio de código, ni inglés, ni estilos emocionales.

## Casos de uso

- Lector offline de la constitución keniana: el propio autor emplea este export como voz de un lector que resalta cada palabra hablada a partir de las duraciones de fonemas devueltas por el modelo; la alineación exacta hace innecesario un segundo modelo de alineamiento.
- Accesibilidad en dispositivos de gama baja: integración en aplicaciones Android antiguas (ARMv7) para lectura de texto en voz alta sin conexión, con consumo de 71-75 MB de RAM y RTF de 0,16-0,21 en un Redmi 9A.
- Anuncios y avisos locales en suajili: síntesis de frases cortas en terminales point-of-sale o quioscos sin conectividad, ajustando la velocidad con el parámetro `speed` para adaptarse al ruido ambiental.
- Educación y alfabetización: lectura guiada de materiales en suajili con resaltado palabra a palabra, aprovechando que las duraciones permiten sincronizar el texto con el audio sin coste adicional.
- Pruebas de concepto de TTS de bajo consumo: base para experimentar con vocoders source-filter y front ends deterministas en entornos con recursos muy limitados, dado el tamaño reducido del checkpoint (18 MB en PyTorch).
- Lectura de documentos legales o administrativos: siempre que se expandan previamente números, fechas, importes y referencias legales a palabras, el modelo puede narrar textos largos por fragmentos de hasta 32 segundos.
- Evaluación comparativa de TTS multilingüe de bajo coste: como referencia de un sistema entrenado desde cero con solo 13 horas de audio y 4,54 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER) en la información disponible. El autor únicamente reporta mediciones de latencia y memoria en un Redmi 9A (220233L2G, Android 11, armeabi-v7a) con ONNX Runtime 1.25.0, 4 hilos y ejecuciones en caliente:

| Frase | Audio | Síntesis | RTF |
|---|---|---|---|
| Habari za asubuhi! Karibu Kenya. | 4,96 s | 798 ms | 0,161 |
| Leo ni Jumatatu, tarehe kumi na tisa Novemba. | 5,77 s | 1188 ms | 0,206 |
| Bei ya unga ni shilingi elfu moja na mia tano. | 5,70 s | 1167 ms | 0,205 |

Datos adicionales medidos: creación de sesión de 5,3 s y PSS de 71-75 MB durante la síntesis. El export ONNX reproduce las duraciones y la longitud de audio del modelo PyTorch muestra a muestra; las formas de onda correlacionan 0,94-0,98 con el renderizador de escritorio, y dos ejecuciones de escritorio con la misma entrada difieren en la misma magnitud.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos TTS de suajili ni de sistemas comparables de tamaño similar con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Voz en estado de prototipo: no hay estudio de escucha con hablantes nativos ni evaluación de WER o MOS; se espera prosodia irregular en frases largas.
- Cada enunciado arrastra una cola respiratoria de aproximadamente 1,9 s tras la última palabra cuando se sintetiza frase a frase; sin recortar a la última palabra más 0,25 s, la velocidad de lectura cae a unas 70 palabras por minuto.
- Los números y abreviaturas son responsabilidad de quien llama: "2022" debe llegar como "elfu mbili na ishirini na mbili"; el modelo no lee dígitos.
- Entrenado con habla leída de siete hablantes: no hay garantía de cobertura de dialectos, cambio de código ni estilo emocional; el inglés no está soportado.
- No es un modelo de clonación: no existe encoder de hablante y los siete identificadores son fijos.
- Licencia CC-BY-SA-4.0 heredada de WAXAL: si se construye sobre estos pesos, hay que atribuir el dataset y compartir las obras derivadas bajo la misma licencia, lo que condiciona el uso comercial.
- Límite de 512 tokens por llamada y 3.000 frames (32 s) de audio por síntesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adoamesh/tiny-voca-swahili
- Receta tiny-voca (Apache-2.0): https://github.com/n4ze3m/tiny-voca
- Dataset google/WaxalNLP: https://huggingface.co/datasets/google/WaxalNLP
- Modelo de alineamiento forzado: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
