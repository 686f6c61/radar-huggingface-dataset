# devendradhakad/autodroid-litert-community-Kokoro-G2P-en-US

## Resumen

`devendradhakad/autodroid-litert-community-Kokoro-G2P-en-US` es una conversión a LiteRT (`.tflite`) del modelo DeepPhonemizer `en_us_cmudict_forward`, un transformer forward no autorregresivo que realiza conversión grafema-a-fonema (G2P) en inglés estadounidense. Se publica como front-end fonético del modelo de síntesis de voz Kokoro-82M en su versión LiteRT, con el objetivo de que ese TTS pueda sintetizar texto libre —nombres propios, marcas, neologismos— sin perder palabras cuando el fonemizador basado en diccionario no encuentra la entrada.

El artefacto pesa aproximadamente 51 MB en FP32 y expone una entrada estática de 1 × 96 identificadores de carácter con una máscara de padding dentro del grafo, devolviendo logits de fonemas por posición. Está pensado para ejecutarse en CPU mediante la CompiledModel API de LiteRT; el delegado OpenCL de GPU no llega a cargar el grafo.

Su relevancia es práctica: aporta un componente de código abierto (licencia MIT) y ejecutable en dispositivo que completa la cadena TTS de Kokoro en Android, con 4,4 ms de latencia mediana en un Apple M4 Max y 43 ms en un Pixel 8a, muy por debajo del coste del modelo acústico y del vocoder al que alimenta. Es un artefacto etiquetado explícitamente como preview, sin cuantizar y limitado al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer forward no autorregresivo (DeepPhonemizer, checkpoint `en_us_cmudict_forward`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto generativo; entrada de longitud fija 1 × 96 identificadores de carácter con máscara de padding en el grafo |
| Tipos de cuantización | FP32 únicamente; no se publican variantes cuantizadas (la cuantización está en el roadmap del autor) |
| Idiomas soportados | inglés de Estados Unidos (en-US) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (`dp_g2p_litert.tflite`, FP32, unos 51 MB) |
| Tarea | Grapheme-to-phoneme (G2P) para inglés |
| Salida | Logits de fonemas por posición, decodificables a ARPABET / IPA |
| Runtime objetivo | CPU con LiteRT CompiledModel API (`ai-edge-litert` 2.1.6) |
| Autor | devendradhakad |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación | 17 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo de origen, DeepPhonemizer `en_us_cmudict_forward`, es un transformer forward pequeño y no autorregresivo: procesa la secuencia de caracteres de entrada y emite, para cada posición, una distribución de probabilidad sobre fonemas, sin bucle de decodificación autoregresiva. La conversión a LiteRT se realizó con el conversor oficial (`litert_torch`) en modo de forma estática, porque la exportación con longitud dinámica fallaba con el error `Shapes must be 1D sequences of concrete values…`, el mismo muro que afecta al modelo TTS. La solución adoptada fue un grafo fijo `[1, 96]` más una máscara de padding embebida, que convierte limpiamente y es numéricamente correcto.

En cuanto a los datos, el checkpoint original se entrenó con el CMU Pronouncing Dictionary (CMUdict), un léxico público de aproximadamente 126.000 palabras comunes del inglés emparejadas con su pronunciación en ARPABET. El modelo aprende exclusivamente la correspondencia grafía→sonido; esta conversión a LiteRT no introduce datos de entrenamiento adicionales ni cambios en los pesos. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de CMUdict, ni si hubo etapas de RLHF o DPO (son técnicas propias de modelos de lenguaje, no de un fonemizador). La innovación destacable del artefacto es de ingeniería de despliegue: empaquetar un front-end neural de G2P en un grafo estático ejecutable en CPU de móvil, como respaldo del fonemizador por diccionario.

## Capacidades

- Conversión grafema-a-fonema en inglés (en-US): transforma texto escrito en secuencias de fonemas (ARPABET/IPA) a partir de los logits por posición.
- Fonemización de palabras fuera de diccionario: nombres propios, marcas comerciales y neologismos que no aparecen en CMUdict, que es precisamente el hueco que cubre como respaldo.
- Procesamiento en ventanas de 96 caracteres con padding interno, lo que permite alimentar texto libre troceado sin descartar palabras (el autor reporta cero palabras perdidas en la verificación).
- Ejecución en dispositivo sin conexión: toda la inferencia ocurre en CPU local, sin llamadas a servicios externos.
- Integración como front-end de un pipeline TTS: se encadena delante del modelo acústico y el vocoder de Kokoro-82M LiteRT.
- No soporta tool calling, function calling, uso agéntico, razonamiento multi-paso, visión, audio de entrada ni modos de pensamiento: es un componente especializado de una sola tarea.
- Capacidad multilingüe: no; el modelo está entrenado únicamente sobre pronunciaciones inglesas de CMUdict.

## Casos de uso

- Síntesis de voz de texto libre en el dispositivo con Kokoro-82M: se coloca este grafo delante del modelo acústico para fonemizar cualquier entrada, de modo que nombres, siglas y palabras raras se pronuncian en lugar de descartarse; el resultado verificado en Pixel 8a es de 12/12 coincidencias con el G2P de referencia y cero palabras perdidas.
- Pronunciación de nombres propios, marcas y términos de dominio: al ser un modelo neural y no una consulta a diccionario, generaliza la grafía a fonemas en palabras que CMUdict no cubre, lo que resulta adecuado para asistentes que deben leer nombres de contactos, productos o topónimos.
- Lectores de pantalla y funciones de accesibilidad en Android: 43 ms por ventana de 96 caracteres en un Tensor G3 (Pixel 8a) es un coste asumible dentro de la latencia total de un lector por voz, y el consumo de memoria del artefacto (~51 MB en FP32) es reducido para un dispositivo móvil.
- Asistentes de voz con requisitos de privacidad: al ejecutarse íntegramente en CPU local dentro de la aplicación, el texto del usuario no necesita salir del dispositivo para obtener la representación fonética.
- Generación de audiolibros y contenido narrado por lotes: la latencia no es crítica en procesamiento offline y el modelo puede fonemizar grandes volúmenes de texto troceados en ventanas de 96 caracteres antes de pasarlos al sintetizador.
- Herramientas de aprendizaje de inglés y entrenadores de pronunciación: la salida de logits por posición permite mostrar la transcripción ARPABET/IPA de una palabra escrita, útil para comparar la pronunciación del alumno con la esperada.
- Etiquetado de corpus para entrenamiento TTS: sirve como anotador grafema-fonema a escala sobre textos en inglés, siempre que se gestionen los cortes entre ventanas de 96 caracteres.
- Integración en cadenas de normalización de texto para voz: tras expandir números, abreviaturas y símbolos a palabras, este modelo aporta el paso final de conversión a fonemas antes del modelo acústico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de precisión G2P tipo PER/WER) en la información disponible. Los únicos datos cuantitativos aportados por el autor son medidas de latencia y una verificación funcional.

Latencia en Apple M4 Max, CPU/XNNPACK a 8 hilos, `ai-edge-litert` 2.1.6, mediana de 15 ejecuciones en caliente por grafo con entradas rellenas de ceros (dispersión entre ejecuciones dentro del 5 %):

| Grafo | Mediana en caliente | Primera llamada |
|---|---|---|
| `dp_g2p_litert.tflite` | 4,4 ms | 9,6 ms |

Latencia en Android (Pixel 8a, Tensor G3, Android 16), `benchmark_model`, 5 ejecuciones de calentamiento y 20 medidas, CPU a 4 hilos:

| Grafo | GPU (OpenCL) | CPU (XNNPACK, 4 hilos) |
|---|---|---|
| `dp_g2p_litert.tflite` | no se ejecuta | 43 ms |

Verificación funcional: 12/12 coincidencias frente al fonemizador de referencia en Pixel 8a, sin palabras descartadas.

## Requisitos de hardware

- VRAM: no aplica; la inferencia está diseñada para CPU y no se publica un camino de ejecución en GPU.
- Memoria: el artefacto ocupa unos 51 MB en FP32 y el grafo procesa ventanas de 96 caracteres, por lo que el consumo de memoria en tiempo de ejecución es muy bajo.
- GPU: el delegado OpenCL de LiteRT no carga el grafo en Android (`did not run`); el propio autor atribuye el problema al layout 5-D del QKV fusionado de la atención y a las operaciones `EQUAL` / `SELECT_V2` de la máscara. Descomponer la atención a 4-D o menos habilitaría esa vía.
- Cabe en GPU de consumo: no aplica, al no haber ruta GPU; cabe sin problema en cualquier CPU de dispositivo móvil, Raspberry Pi o portátil.
- Hardware verificado: Pixel 8a (Tensor G3, Android 16) y Apple M4 Max.
- Opciones de despliegue: LiteRT CompiledModel API con la librería `ai-edge-litert`, la herramienta `benchmark_model` de LiteRT y la integración Android del ejemplo `text_to_speech` de litert-samples (en revisión en el PR #159). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no consumen grafos TFLite.
- Latencia: 4,4 ms por ventana de 96 caracteres en Apple M4 Max y 43 ms en Pixel 8a; 9,6 ms de primera llamada en el M4 Max.
- Throughput agregado: no disponible; depende del troceado del texto en ventanas de 96 caracteres y del pipeline que lo rodea.

## Comparativa con modelos similares

No se han publicado en la información disponible métricas de precisión que permitan comparar la calidad fonética frente a alternativas. La comparación siguiente se limita a formato, licencia y disponibilidad.

| Modelo | Tipo | Formato | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (DeepPhonemizer LiteRT) | G2P neural no autorregresivo | TFLite FP32 | en-US | MIT | CPU-only; 43 ms por ventana en Pixel 8a; etiquetado como preview |
| DeepPhonemizer `en_us_cmudict_forward` original | G2P neural no autorregresivo | Checkpoint PyTorch | en-US | MIT | Mismo modelo de origen; requiere runtime PyTorch en lugar de LiteRT |
| Fonemizador por consulta al diccionario CMUdict | Léxico | Tabla de datos | en-US | no disponible en la información | Cubre unas 126.000 palabras; deja sin salida las que no están en el diccionario, el caso que este modelo cubre |
| eSpeak NG | G2P por reglas y diccionario | Binario/C | multilingüe (según la información disponible, no confirmado) | no disponible en la información | Alternativa clásica y ligera; no es un modelo neural y no se dispone de datos comparativos de calidad |

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés de Estados Unidos; no debe usarse con otros idiomas ni con texto mixto.
- Entrada de longitud fija de 96 caracteres: textos más largos requieren troceado, y un corte en medio de una palabra o de un dígrafo puede producir una pronunciación incorrecta en la frontera entre ventanas.
- Etiquetado explícitamente como preview: el autor indica que las variantes de longitud variable, cuantizadas y con soporte GPU están pendientes de trabajo en el conversor de formas dinámicas y de una reescritura de la atención a 4-D o menos.
- Sin aceleración GPU en LiteRT: el delegado OpenCL no carga el grafo; hay que asumir ejecución en CPU.
- Riesgo de pronunciaciones erróneas fuera de dominio: al generalizar grafía a sonido, el modelo puede producir fonemas plausibles pero incorrectos en nombres propios y términos técnicos; no se publican métricas de tasa de error.
- Alucinación en sentido estricto: no aplica, porque no genera texto libre; el modo de fallo es una transcripción fonética incorrecta, no contenido inventado con apariencia factual.
- Sesgos: el entrenamiento con CMUdict refleja el léxico y la variante estadounidense del diccionario; las variantes británicas y los acentos no estadounidenses no están representados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y la integración en litert-samples sigue en revisión (PR abierto), por lo que la API y las rutas de despliegue pueden cambiar.
- Licencia MIT: permite uso comercial y modificación con atribución; el autor mantiene la atribución completa a DeepPhonemizer y al checkpoint `en_us_cmudict_forward`. Conviene revisar la licencia del resto del pipeline (Kokoro-82M y vocoder) por separado.
- No es un modelo TTS: no genera audio por sí mismo; requiere un modelo acústico y un vocoder para producir voz.
- Datos personales: el autor declara que no hay información personal identificable, ya que CMUdict es un diccionario público de pronunciaciones y la conversión no añade datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devendradhakad/autodroid-litert-community-Kokoro-G2P-en-US
- Kokoro-82M en LiteRT: https://huggingface.co/litert-community/Kokoro-82M
- Documentación de LiteRT: https://ai.google.dev/edge/litert
- Guía de medición de rendimiento de LiteRT (`benchmark_model`): https://ai.google.dev/edge/litert/models/measurement
- Pull request del ejemplo `text_to_speech` en litert-samples: https://github.com/google-ai-edge/litert-samples/pull/159
- DeepPhonemizer (proyecto de origen): https://github.com/spring-media/DeepPhonemizer
- CMU Pronouncing Dictionary: http://www.speech.cs.cmu.edu/cgi-bin/cmudict
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a OATD (portal de tesis y disertaciones de acceso abierto), sin relación con este artefacto.
