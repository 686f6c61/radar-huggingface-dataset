# kawshikbuet17/bangla-heteronym-bangla-bert-base

## Resumen

Bangla Heteronym Reader es un modelo de clasificación basado en Bangla-BERT-base, desarrollado por Kawshik Kumar Paul (BUET), que resuelve el problema de los heterónimos en bengala: palabras que se escriben igual pero se pronuncian de forma distinta según el contexto. El modelo recibe una frase con la palabra marcada y devuelve la lectura correcta en forma de reescritura fonética, pensada para alimentar la etapa previa de un sistema de texto-a-voz (TTS) en bengala.

Se trata de un fine-tuning de `sagorsarker/bangla-bert-base` con una cabeza lineal personalizada que puntúa las lecturas candidatas de cada heterónimo. Con 164.396.544 parámetros y un repositorio de 0,7 GB, es un modelo pequeño y ligero, orientado a inferencia de baja latencia en producción. Alcanza un 97,55 % de accuracy y un 97,46 % de macro-F1 en el conjunto de test del split principal (1.104 frases), con una media de 98,01 ± 0,39 % en tres semillas.

Su relevancia actual radica en que cubre una necesidad muy concreta y poco atendida en el pipeline de TTS para bengala: la desambiguación de homógrafos. No es un modelo generativo ni un LLM, sino un componente especializado que se integra como preprocesador en sistemas de síntesis de voz, y cuya licencia MIT facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con cabeza lineal de clasificación sobre el marcador de apertura |
| Parametros totales | 164.396.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizador y la configuración de Bangla-BERT-base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el checkpoint se distribuye en safetensors y se usa en fp16) |
| Idiomas soportados | bn (bengala) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | sagorsarker/bangla-bert-base |
| Dataset de entrenamiento | kawshikbuet17/bangla-heteronyms |
| Pipeline declarado | text-to-speech |
| Descargas | 29 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo parte de Bangla-BERT-base, un transformer encoder de tipo BERT adaptado al bengala. Sobre la representación del token correspondiente al marcador de apertura del heterónimo se aplica una capa lineal que puntúa las lecturas candidatas de esa palabra; la lectura con mayor puntuación es la elegida. La entrada se construye concatenando la palabra objetivo y la frase con la palabra marcada mediante delimitadores `@`, por ejemplo `কর` + `আগে @ কর @ কাজটা, তারপর আবার কর।`.

El entrenamiento consistió en un fine-tuning sobre el dataset `kawshikbuet17/bangla-heteronyms`, con 14 frases por lectura, usando AdamW, learning rate 2e-5, batch size 32, precisión fp16, un máximo de 10 épocas y early stopping sobre la accuracy de desarrollo, todo ello en una única Tesla T4. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni el volumen total de tokens de entrenamiento. La innovación técnica principal es el diseño de la cabeza de clasificación sobre el marcador y la formulación de la salida como reescritura fonética en escritura bengala, con hasanta visible representada como hasanta + ZWNJ.

## Capacidades

- Desambiguación de heterónimos en bengala: dado un texto y una palabra homógrafa, selecciona la lectura correcta según el contexto de la frase.
- Reescritura fonética completa (`phoneticize`): sustituye todos los heterónimos del texto por su lectura, dejando el resto intacto.
- Salida detallada (`phoneticize_detailed`): devuelve el texto reescrito junto con posición, lectura y confianza de cada heterónimo.
- Predicción de una palabra concreta (`predict`) y de una palabra marcada con corchetes (`predict_marked`) cuando la palabra aparece varias veces.
- Reescritura selectiva (`phoneticize_marked`): sustituye solo las palabras marcadas y elimina las marcas.
- Versiones por lotes (`_batch`) de todos los métodos, para procesar listas de frases de forma eficiente.
- Consulta de lecturas candidatas mediante `model.hconfig["candidates"]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador especializado, no un modelo generativo.
- Capacidad multilingüe limitada al bengala; no cubre otros idiomas.

## Casos de uso

- Preprocesador de TTS en bengala: el modelo se coloca delante del sintetizador para convertir homógrafos como কর en su lectura correcta (কর্‌, করো o কোরো) antes de la conversión grafema-fonema, evitando pronunciaciones erróneas en la síntesis.
- Lectura de noticias y artículos en voz alta: con 10,6 ms por frase en una T4 en fp16 y unas 2.100 frases por segundo a batch 32, puede procesar un feed completo de noticias en tiempo casi real antes de enviarlo al motor de voz.
- Asistentes de voz y agentes conversacionales en bengala: la latencia de 31 ms en 4 hilos de CPU permite integrarlo en el bucle de respuesta de un asistente sin añadir retardo perceptible.
- Accesibilidad para personas con discapacidad visual: conversión de documentos largos a audio con pronunciación correcta de homógrafos, usando `phoneticize_batch` sobre lotes de párrafos.
- Audiolibros y narración automatizada: la salida detallada con confianza por heterónimo permite marcar casos dudosos (por ejemplo, confianza 0,4805 en una de las muestras) para revisión humana antes de la locución final.
- Enseñanza de bengala y lingüística computacional: el modelo y su dataset sirven para estudiar la desambiguación de homógrafos y para generar materiales didácticos con pronunciación anotada.
- Investigación en TTS de bajo recurso: al ser un checkpoint pequeño con licencia MIT, es reutilizable como componente de referencia en pipelines académicos de síntesis de voz para bengala.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 frases, 3 por lectura.

| Metrica | Resultado |
|---|---|
| Accuracy (este checkpoint, semilla 44) | 97,55 % |
| Macro-F1 (este checkpoint, semilla 44) | 97,46 % |
| Accuracy media de 3 semillas | 98,01 ± 0,39 % |
| Macro-F1 medio de 3 semillas | 97,93 ± 0,41 % |

Rendimiento de inferencia (pipeline completo, batch size 1):

| Entorno | Latencia por frase | Notas |
|---|---|---|
| Tesla T4, fp16 | 10,6 ms | ~2.100 frases/s a batch 32 |
| CPU, 4 hilos | 31 ms | — |

Posición en el benchmark del autor: séptimo de 12 modelos por accuracy media de test. El autor recomienda para la mayoría de usos `kawshikbuet17/bangla-heteronym-banglabert` (99,46 % de accuracy, 12,5 ms en T4).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 164 millones de parámetros, en fp16 el peso son aproximadamente 0,33 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: Tesla T4 (medida por el autor), y por tamaño, cualquier RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también funciona en CPU (31 ms por frase con 4 hilos).
- Opciones de despliegue: el modelo requiere el código del repositorio `kawshikbuet17/bangla-heteronym-benchmark` (clase `Predictor`), ya que incorpora una cabeza personalizada; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 10,6 ms por frase en T4 fp16 a batch 1; unas 2.100 frases por segundo a batch 32 en T4; 31 ms por frase en CPU con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy (test) | Latencia (T4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kawshikbuet17/bangla-heteronym-bangla-bert-base (este) | 164,4 M | 97,55 % (semilla 44); 98,01 ± 0,39 % media | 10,6 ms/frase | MIT | HuggingFace |
| kawshikbuet17/bangla-heteronym-banglabert | no disponible | 99,46 % | 12,5 ms/frase | no disponible en la información | HuggingFace |
| sagorsarker/bangla-bert-base (modelo base) | no disponible | no aplica (no es un modelo de heterónimos) | no disponible | no disponible en la información | HuggingFace |

El benchmark del autor incluye 12 modelos; este checkpoint ocupa el séptimo puesto por accuracy media. No se dispone de datos de los otros 10 modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura restringida: solo resuelve los heterónimos presentes en el dataset `kawshikbuet17/bangla-heteronyms`. Para palabras fuera del dataset, `predict` lanza un `ValueError` y el modelo no tiene lecturas entre las que elegir.
- Dominio de entrenamiento sintético: las frases se escribieron específicamente para el dataset, por lo que la accuracy en texto real puede ser inferior a la reportada en test.
- Confianza variable: en las muestras del autor aparecen predicciones con confianza baja (0,4805), lo que indica casos ambiguos que conviene revisar o marcar en producción.
- Sin capacidades generativas: no es un LLM; no genera texto libre, no razona, no hace tool calling ni soporta agentes.
- Monolingüe: únicamente bengala (bn); no cubre otros idiomas ni variantes dialectales no representadas en el dataset.
- Longitud de contexto no documentada: no se especifica el límite de tokens de entrada, lo que obliga a validar empíricamente frases largas.
- Dependencia de código externo: requiere el repositorio de GitHub para cargar la cabeza personalizada; no es plug-and-play con `transformers` estándar.
- Licencia MIT: permite uso comercial, pero el archivo LICENSE conserva el aviso de copyright original del modelo base, que debe mantenerse.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al estar entrenado con un dataset pequeño y escrito por el autor, puede reflejar sus elecciones lingüísticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kawshikbuet17/bangla-heteronym-bangla-bert-base
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark: https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo recomendado por el autor: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
- Modelo base: https://huggingface.co/sagorsarker/bangla-bert-base
