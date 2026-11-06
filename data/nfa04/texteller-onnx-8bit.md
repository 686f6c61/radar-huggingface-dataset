# nfa04/texteller-onnx-8bit

## Resumen

TexTeller 3.0 ONNX 8-bit es una conversión cuantizada del modelo TexTeller 3.0 de OleehyO, un sistema de reconocimiento óptico de caracteres (OCR) especializado en fórmulas matemáticas. El modelo original recibe una imagen de una fórmula —impresa o manuscrita— y genera su representación en LaTeX. Esta versión, publicada por nfa04, transforma los pesos originales en float32 (1,25 GB) a dos grafos ONNX cuantizados a 8 bits (317 MB en total: un encoder de 88 MB y un decoder de 229 MB), reduciendo el tamaño en aproximadamente un 75 % para facilitar el despliegue en dispositivos con recursos limitados.

La arquitectura subyacente es un modelo de imagen-a-texto compuesto por un encoder visual y un decoder autorregresivo con caché de clave/valor. La cuantización se realizó con la cuantización dinámica de onnxruntime (`QuantType.QInt8`) y una estrategia particular para el decoder: los grafos con y sin caché se cuantizaron por separado y se fusionaron en un único grafo que comparte los pesos, evitando que las ramas `If` del decoder publicado quedaran sin cuantizar.

La relevancia de esta conversión radica en que permite ejecutar OCR de fórmulas matemáticas en entornos de bajos recursos, como aplicaciones móviles o tablets. El autor reporta una latencia de aproximadamente 0,56 s por fórmula en una aplicación Flutter con cuatro hilos, y una precisión de coincidencia exacta del 74,1 % sobre 1.500 muestras manuscritas del conjunto MathWriting, con un coste de unos 4 puntos porcentuales de exactitud respecto a los pesos originales en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual + decoder autorregresivo con caché de clave/valor (transformer imagen-a-texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (vocabulario de 15.000 tokens; sin datos de longitud máxima) |
| Tipos de cuantizacion | 8 bits (QInt8, cuantización dinámica de onnxruntime) |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión del TexTeller 3.0 original, que combina un encoder visual y un decoder de texto autorregresivo. El encoder procesa una imagen en escala de grises de 448 x 448 píxeles (la imagen se escala manteniendo proporciones y se coloca en la esquina superior izquierda de un lienzo cuadrado relleno de ceros), normalizada con media 0,9545467 y desviación 0,15394445. El decoder genera tokens de forma autorregresiva con un token de inicio 0, un token de fin 2 y un vocabulario de 15.000 entradas, usando una caché de clave/valor: el primer paso se ejecuta con `use_cache_branch = false` y tensores nulos como pasado, mientras que los pasos posteriores usan `true` con las claves y valores del paso anterior. Las 24 claves/valores de atención a la imagen provienen del primer paso y permanecen fijas; las 24 de los tokens crecen con cada paso.

El entrenamiento original de TexTeller 3.0 no se detalla en la información disponible más allá de que aprendió de fórmulas impresas (y, según el autor, de manuscritos). Esta conversión no reentrena ni ajusta el modelo: `make_models.py` se limita a cuantizar ambos grafos a 8 bits. La innovación técnica principal de esta versión es la fusión de los grafos del decoder con y sin caché en uno solo que comparte pesos, lo que evita que las ramas `If` del decoder publicado quedaran a 909 MB sin cuantizar. El encoder resultante es determinista byte a byte entre compilaciones; el decoder puede variar en checksum entre compilaciones, aunque dos compilaciones comparadas leyeron 40 de 40 muestras manuscritas de forma idéntica.

## Capacidades

- Reconocimiento de fórmulas matemáticas impresas y manuscritas a partir de imágenes.
- Generación de LaTeX como formato de salida (cada fórmula se entrega entre `\[` y `\]`, que deben eliminarse).
- Procesamiento de imágenes en escala de grises con escalado proporcional a 448 píxeles en el lado mayor.
- Inferencia con caché de clave/valor para decodificación token a token eficiente.
- Ejecución en CPU mediante onnxruntime y en aplicaciones Flutter mediante el plugin `flutter_onnxruntime`.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades.
- Capacidades multilingües: no disponibles (la salida es LaTeX).

## Casos de uso

- Digitalización de apuntes manuscritos de matemáticas: el modelo convierte fórmulas dibujadas a mano en LaTeX, lo que permite pasarlas a documentos editables o a un editor de fórmulas. Es adecuado porque está entrenado específicamente para trazos manuscritos y funciona con líneas finas de unos 1 px a 448 px de altura.
- Conversión de artículos y libros impresos a LaTeX: a partir de recortes de fórmulas impresas, el modelo genera el código LaTeX correspondiente, lo que agiliza la reescritura de material científico en formatos editables.
- Integración en aplicaciones móviles o tablets: con solo 317 MB en total y una latencia de unos 0,56 s por fórmula en Flutter con cuatro hilos, cabe en dispositivos con recursos limitados, algo que los pesos originales de 1,25 GB no permiten con la misma facilidad.
- Herramientas de accesibilidad para estudiantes: un estudiante puede fotografiar una fórmula escrita a mano y obtener su representación LaTeX para leerla con un lector de pantalla o reutilizarla en un editor.
- Asistencia a la docencia y corrección de ejercicios: el modelo puede transcribir las respuestas manuscritas de los alumnos a LaTeX para su comparación automática con soluciones de referencia.
- Pipeline de investigación en OCR matemático: sirve como componente de referencia o línea base cuantizada para comparar el impacto de la cuantización a 8 bits frente a los pesos en float32 en tareas de reconocimiento de fórmulas.
- Procesamiento por lotes en CPU: con unos 0,6 s por fórmula en cuatro hilos de CPU de escritorio, es viable procesar conjuntos moderados de imágenes sin GPU.

## Benchmarks y rendimiento

Resultados medidos sobre las tintas de test de MathWriting (manuscritos dibujados como imágenes según el procedimiento descrito). "Exact" indica coincidencia completa de la fórmula tras ignorar espaciado, llaves alrededor de caracteres individuales, `\left`/`\right` y variantes equivalentes.

| Conjunto | Exact | Dentro de 2 caracteres | Tasa de error de caracteres |
|---|---|---|---|
| 1.500 tintas, estos archivos de 8 bits | 74,1 % | 84,7 % | 0,070 |
| Las 785 con etiquetas simples, 8 bits | 80,8 % | 93,9 % | 0,041 |
| Primeras 300 tintas, originales float32 | 76,7 % | 85,3 % | 0,071 |
| Las mismas 300 tintas, estos archivos de 8 bits | 72,3 % | 84,0 % | 0,078 |

La cuantización a 8 bits cuesta unos 4 puntos de coincidencia exacta. El grosor del trazo influye más: sobre 100 tintas de validación leídas con la versión PyTorch, un trazo del 2 % de la altura de una letra acertó el 76 % de forma exacta, uno del 10 % acertó el 39 % y uno del 16 % acertó el 25 %.

Rendimiento: aproximadamente 1,35 s por fórmula en un hilo de CPU de escritorio con onnxruntime, 0,6 s en cuatro hilos, y 0,56 s de mediana por fórmula en Flutter con cuatro hilos una vez abiertas las sesiones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecución en CPU mediante onnxruntime y no se reportan requisitos de GPU.
- GPU recomendadas: no disponibles; no se documenta ejecución en GPU.
- Cabe en GPU consumer: no hay datos; el tamaño de 317 MB sugiere que cabría en cualquier GPU consumer, pero no se ha verificado.
- Opciones de despliegue: onnxruntime (CPU), plugin `flutter_onnxruntime` para aplicaciones Flutter; requiere `optimum==2.1.0` y `optimum-onnx==0.1.0` instalados con `--no-deps` para el script de lectura.
- Latencia y throughput: 1,35 s por fórmula en un hilo de CPU de escritorio, 0,6 s en cuatro hilos, 0,56 s de mediana en Flutter con cuatro hilos. No se reportan mediciones en teléfono ni tablet.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| TexTeller 3.0 ONNX 8-bit (este) | no disponible | no disponible | 74,1 % exact en MathWriting (1.500 tintas); 317 MB | Apache 2.0 | ONNX 8 bits |
| TexTeller 3.0 original (float32) | no disponible | no disponible | 76,7 % exact en las primeras 300 tintas; 1,25 GB | Apache 2.0 | Pesos originales (float32) |
| Otros modelos de OCR de fórmulas | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el TexTeller 3.0 original en float32, que obtiene 76,7 % de coincidencia exacta frente al 72,3 % de esta versión de 8 bits sobre las mismas 300 tintas, a cambio de una reducción de tamaño de 1,25 GB a 317 MB.

## Limitaciones y advertencias

- La cuantización a 8 bits reduce la precisión: unos 4 puntos de coincidencia exacta menos que los pesos originales en float32.
- El grosor del trazo afecta mucho al reconocimiento: trazos gruesos (10 % o 16 % de la altura de una letra) reducen la exactitud al 39 % y 25 % respectivamente, frente al 76 % con trazos finos del 2 %.
- MathWriting es principalmente matemáticas de nivel investigador, no trabajo escolar; el rendimiento en fórmulas escolares no está medido.
- El README de TexTeller indica que los pesos publicados de la versión 3.0 incluyen los conjuntos de test de los benchmarks manuscritos que utilizó y no especifica cuáles. Una comprobación encontró un 3,8 % de solapamiento entre las etiquetas manuscritas publicadas y las de test de MathWriting, y esas muestras no se leyeron mejor que el resto, pero no puede descartarse por completo la memorización.
- No se han realizado mediciones en teléfono ni tablet.
- Es una conversión no oficial: no fue creada ni respaldada por OleehyO ni por los contribuidores de TexTeller.
- Los datos de entrenamiento de TexTeller provienen de varias fuentes cuyos términos no se repiten en esta ficha; para distribución amplia o uso comercial conviene revisarlos.
- La salida siempre viene entre `\[` y `\]`, que deben eliminarse para obtener el LaTeX limpio.
- No hay datos sobre sesgos, riesgo de alucinación en sentido lingüístico ni limitaciones de idioma, ya que la salida es LaTeX y no texto en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nfa04/texteller-onnx-8bit
- Repositorio GitHub de la conversión: https://github.com/nfa04/texteller-onnx-8bit/tree/main
- Releases de la conversión: https://github.com/nfa04/texteller-onnx-8bit/releases
- Modelo original TexTeller 3.0: https://huggingface.co/OleehyO/TexTeller
- Repositorio original TexTeller: https://github.com/OleehyO/TexTeller
- Conjunto MathWriting: https://github.com/google-research/google-research/tree/master/mathwriting
