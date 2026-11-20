# ichkil/ichkil

## Resumen

Ichkil es un modelo compacto especializado en **tashkeel** (diacritización del árabe), es decir, la tarea de asignar a cada letra de una frase árabe sin vocales su conjunto completo de signos diacríticos (harakat, shadda, tanwin y sus combinaciones). Lo desarrolla el autor independiente ichkil y se distribuye bajo licencia MIT. No es un modelo generativo de propósito general: es un etiquetador de secuencias a nivel de carácter que produce una etiqueta por carácter de entrada, sin búsqueda de decodificación.

La relevancia del modelo está en su relación rendimiento/tamaño: con **5,56 millones de parámetros** y un único artefacto ONNX de **22,3 MB en fp32**, alcanza un DER (diacritic error rate) del **2,32 %** en el conjunto clásico de Fadel et al. (2019) y del **2,14 %** en WikiNews (MSA moderno). Eso lo sitúa en un régimen de precisión propio de modelos mucho mayores, pero ejecutable en CPU, en un teléfono o en el navegador, completamente offline.

La versión actual es la v0.3, que amplía el vocabulario de 42 a 175 símbolos, añade la combinación shadda + tanwin (16 clases de salida frente a 13), incorpora entrenamiento alineado a frases y mejora la cobertura de árabe moderno, nombres propios y préstamos. El repositorio incluye además los pesos PyTorch (`ichkil.pt`) para ajuste fino y librerías cliente en Python, JavaScript/TypeScript y Go.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiGRU de 3 capas con conexión residual + 2 bloques de self-attention + banco de 8 expertos MLP con gating + clasificador de 16 vías |
| Parámetros totales | 5,56 M |
| Parámetros activos | no disponible (no es MoE en el sentido habitual; usa un banco de expertos MLP con gating, sin número de activos declarado) |
| Longitud de contexto | 1–1024 caracteres por llamada (textos más largos deben dividirse en finales de frase) |
| Tipos de cuantización | no disponible (el artefacto publicado es fp32; no se declaran variantes cuantizadas) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, batch × longitud dinámicos) y checkpoint PyTorch (`ichkil.pt`) |

Otras propiedades declaradas: vocabulario de 175 símbolos (`<pad>`=0, `<unk>`=1), 16 etiquetas de salida por carácter, tamaño del repo de 0,1 GB y artefacto principal de 22,3 MB.

## Arquitectura y entrenamiento

El modelo opera a nivel de carácter con una etiqueta por carácter y sin búsqueda de decodificación. La entrada se normaliza primero (NFC, variantes de letras, caracteres de ancho cero, tatweel y diacríticos existentes eliminados), se embebe en 320 dimensiones **sin embedding posicional** y se codifica mediante una **BiGRU de 3 capas con conexión residual**. A continuación se aplican **2 bloques de self-attention** que dan a cada carácter acceso directo a toda la frase, algo que el autor identifica como necesario para los casos gramaticales (case endings). Las ramas residuales de esos bloques arrancan en cero (LayerScale), de modo que la v0.3 se inicializó en caliente desde el modelo solo-GRU sin perder rendimiento. Después viene un banco de **8 expertos MLP con gating** y un **clasificador de 16 vías**.

En cuanto a datos, la model card cita corpus de Wikipedia, noticias y MSA, más unas 3.000 entradas de nombres propios, con entrenamiento alineado a frases (con o sin puntuación final). Los conjuntos de evaluación (Fadel et al. 2019, WikiNews y SadeedDiac-25 MSA) se excluyeron del entrenamiento mediante un filtro de solapamiento de 8-gramas. No se detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; al no ser un modelo generativo, esos mecanismos no aplican del mismo modo.

## Capacidades

- Diacritización completa de texto árabe: harakat, shadda, tanwin y sus combinaciones (16 clases de salida).
- Etiquetado a nivel de carácter con una sola pasada, sin búsqueda de decodificación.
- Manejo de árabe clásico y árabe moderno estándar (MSA), incluidos nombres propios y préstamos.
- Vocabulario ampliado a 175 símbolos: dígitos, caracteres latinos y puntuación árabe y ASCII.
- Procesamiento de entradas de 1 a 1024 caracteres por llamada, con batch y longitud dinámicos.
- Ejecución en CPU, en navegador y en dispositivos móviles mediante ONNX Runtime.
- Normalización de entrada integrada (NFC, variantes de letras, eliminación de ancho cero, tatweel y diacríticos previos).
- Pesos PyTorch disponibles para ajuste fino.
- No dispone de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un modelo de etiquetado, no un LLM generativo.

## Casos de uso

- **Preprocesado de corpus árabe para TTS y ASR**: la diacritización es un paso previo habitual para obtener una pronunciación correcta; el modelo añade las vocales a texto sin tashkeel en una sola pasada y cabe en el mismo pipeline de CPU que el resto del procesado.
- **Edición y publicación editorial en árabe**: permite vocalizar automáticamente textos para libros infantiles, materiales didácticos o ediciones con tashkeel completo, con un DER del 2,14 % en MSA moderno que reduce la corrección manual a una revisión ligera.
- **Enseñanza del árabe como lengua extranjera**: generación de textos vocalizados para ejercicios y lecturas graduadas, incluyendo nombres propios y préstamos, que es justo el punto débil de las versiones anteriores.
- **Búsqueda y recuperación de información en árabe**: normalizar y vocalizar de forma consistente consultas y documentos para mejorar el emparejamiento en índices que distinguen formas vocálicas.
- **Procesado en el navegador o en el dispositivo**: con 22,3 MB y ejecución ONNX en CPU, se puede integrar en un editor web o en una app móvil sin subir el texto a un servidor (la demo oficial funciona sin servidor ni subida de datos).
- **Ajuste fino para dominios específicos**: a partir de `ichkil.pt`, un equipo puede reentrenar el modelo con corpus propios (por ejemplo, terminología jurídica o religiosa) y mantener el despliegue en ONNX.
- **Integración en servicios backend ligeros**: las librerías cliente de Python, JS/TS y Go permiten incorporar la vocalización a microservicios con requisitos mínimos de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). DER = diacritic error rate; «DER (no case)» excluye los casos gramaticales finales; «final-word error» es la proporción de muestras cuya última palabra es incorrecta.

| Conjunto de test | DER | DER (no case) | WER | Error en palabra final |
|---|---|---|---|---|
| Fadel et al. (2019), árabe clásico | 2,32 % | 2,11 % | 7,74 % | 11,8 % |
| WikiNews (MSA) | 2,14 % | 1,48 % | 8,59 % | 11,6 % |
| SadeedDiac-25 MSA | 3,08 % | 2,24 % | 11,04 % | 9,9 % |

Comparación con la versión anterior (v0.1), medida con el mismo protocolo:

| Conjunto de test | DER v0.3 | DER v0.1 |
|---|---|---|
| Fadel (clásico) | 2,32 % | 3,06 % |
| WikiNews (MSA) | 2,14 % | 11,08 % |
| SadeedDiac-25 MSA | 3,08 % | 10,68 % |
| Error en palabra final (Fadel / WikiNews / MSA) | 11,8 % / 11,6 % / 9,9 % | 21 % / 66 % / 54 % |

Con el protocolo original de la v0.1 (eliminación de caracteres desconocidos antes de la inferencia), la v0.1 obtiene 2,65 % en Fadel frente al 2,37 % de la v0.3, y mantiene una ligera ventaja dentro de las palabras (2,01 % frente a 2,13 %). En un benchmark específico de 124 frases vocalizadas a mano en 11 categorías de error, la v0.3 obtiene un **2,4 % de DER frente al 13,0 % de la v0.1**. El artefacto ONNX puntúa de forma idéntica al modelo PyTorch de referencia sobre el conjunto completo de Fadel (DER 2,3252 % en ambos).

## Requisitos de hardware

- **VRAM estimada**: no aplica en la práctica; el modelo es de 5,56 M de parámetros y 22,3 MB en fp32, por lo que la inferencia en CPU es el escenario previsto.
- **GPU recomendadas**: no se declaran requisitos de GPU; cualquier GPU capaz de ejecutar ONNX Runtime serviría, pero el diseño está orientado a CPU.
- **GPU de consumo**: irrelevante para el caso de uso; cabe holgadamente en cualquier tarjeta, pero no es necesario.
- **Despliegue**: ONNX Runtime (Python, JS/TS en Node y navegador, Go) y pesos PyTorch para ajuste fino. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La única comparación documentada es interna, entre la v0.3 y la v0.1 del propio modelo:

| Modelo | Parámetros | Arquitectura | Vocabulario | Clases de salida | DER Fadel | DER WikiNews | Licencia |
|---|---|---|---|---|---|---|---|
| Ichkil v0.3 | 5,56 M | BiGRU + self-attention + expertos | 175 | 16 | 2,32 % | 2,14 % | MIT |
| Ichkil v0.1 | 1,3 M | BiGRU + expertos | 42 | 13 | 3,06 % | 11,08 % | MIT |

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos en la información disponible; al tratar corpus de Wikipedia y noticias, puede heredar las distribuciones y sesgos de esas fuentes.
- **Riesgo de error**: el modelo no es perfecto; un DER del 2,32 % implica errores residuales, con un 11,8 % de error en la última palabra de la frase en el conjunto clásico, lo que afecta especialmente a los casos gramaticales finales.
- **Longitud de entrada**: la ventana útil es de 1 a 1024 caracteres por llamada; los textos más largos deben dividirse en finales de frase, lo que puede degradar la coherencia en los cortes.
- **Idioma**: solo árabe; no soporta otras lenguas ni transliteración.
- **Tarea acotada**: no genera texto, no razona, no hace tool calling ni atiende instrucciones; cualquier uso fuera de la diacritización requiere otro modelo.
- **Curacion de datos**: los resultados son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- **Licencia**: MIT, que permite uso comercial y modificación, pero conviene revisar las licencias de los corpus de entrenamiento y de evaluación citados.
- **Producción**: al ser un modelo pequeño, el coste computacional es bajo, pero la calidad depende de la normalización de entrada; hay que respetar el contrato de E/S descrito en `config.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ichkil/ichkil
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/ichkil/ichkil-demo
- Librería Python (PyPI): https://pypi.org/project/ichkil/
- Repositorio Python: https://github.com/Ichkil/ichkil-python
- Librería JS/TS (npm): https://www.npmjs.com/package/ichkil
- Repositorio JS/TS: https://github.com/Ichkil/ichkil-js
- Librería Go (pkg.go.dev): https://pkg.go.dev/github.com/Ichkil/ichkil-go
- Repositorio Go: https://github.com/Ichkil/ichkil-go
