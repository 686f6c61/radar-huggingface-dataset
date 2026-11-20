# nipuna02/singlish-sinhala-char-transformer

## Resumen

El modelo `singlish-sinhala-char-transformer`, publicado por el usuario nipuna02 en Hugging Face, es un transformer encoder-decoder a nivel de carácter entrenado desde cero para convertir sinhala romanizado (singlish) en escritura sinhala. Se trata de un modelo muy pequeno, de aproximadamente 7,5 millones de parametros, disenado especificamente para la tarea de transliteracion inversa: tomar texto tal y como lo escriben los hablantes en redes sociales ("mama gedara yanawa") y devolverlo en escritura sinhala nativa. Resuelve un problema practico de normalizacion linguistica en un contexto de diglosia digital, donde gran parte de la comunicacion informal en sinhala se realiza en caracteres latinos.

La relevancia del modelo reside en su enfoque: en lugar de depender unicamente de reglas o diccionarios, emplea un transformer caracter a caracter entrenado con una mezcla de pares reales (8.286) y pares sinteticos generados mediante romanizacion ruidosa de articulos de Wikipedia en sinhala (428.000 frases). Segun los datos declarados por el autor, supera ampliamente a los sistemas basados en reglas y en diccionarios en las metricas CER y WER sobre un conjunto de test reservado de 2.366 frases.

El modelo es de proposito muy especifico, con licencia MIT, formato de pesos PyTorch (`model.pt`) y un unico idioma de destino (sinhala, codigo `si`). No es un modelo de proposito general ni soporta generacion de texto libre, razonamiento o tool calling; su unica funcion es la transliteracion. Su publicacion es reciente (noviembre de 2026 segun los metadatos del repositorio) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder a nivel de caracter (entrenado desde cero) |
| Parametros totales | Aproximadamente 7,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la entrada se segmenta en ventanas de 6 palabras) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch, `model.pt`) |
| Idiomas soportados | Sinhala (`si`); entrada en sinhala romanizado (singlish) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (diccionario `torch.save` con config, `state_dict` y vocabularios de caracteres) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder a nivel de caracter, con aproximadamente 7,5 millones de parametros, entrenado desde cero. La tokenizacion opera sobre caracteres, lo que resulta adecuado para la transliteracion, ya que las correspondencias entre grafemas latinos y grafemas sinhala son en gran medida locales y no requieren un vocabulario subword extenso. La entrada se segmenta en ventanas de 1 a 6 palabras durante el entrenamiento y de 6 palabras en inferencia, con decodificacion greedy.

El entrenamiento combina dos fuentes de datos. Por un lado, 8.286 pares reales procedentes del corpus SwaBhasha (comentarios de redes sociales y frases al estilo de Wikipedia romanizada, con licencia Apache-2.0). Por otro, 428.000 frases de Wikipedia en sinhala (CC BY-SA 4.0) romanizadas de forma ruidosa mediante un romanizador que muestrea variantes ortograficas como th/t, w/v, a/aa y ee/i, y que en ocasiones omite vocales imitando la escritura taquigrafica. Se eliminaron las frases sinteticas que compartian un 5-grama con los conjuntos de desarrollo o test para evitar filtraciones. La mezcla final es 30% datos reales y 70% sinteticos, con 20.000 pasos de entrenamiento, tamano de lote 96 y aproximadamente 3,5 horas en un Mac con chip Apple Silicon de 8 GB usando MPS. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Transliteracion de sinhala romanizado (singlish) a escritura sinhala nativa, a nivel de caracter y de palabra.
- Manejo de variantes ortograficas informales del singlish, incluyendo grafias alternativas como th/t, w/v, a/aa y ee/i, gracias al entrenamiento con romanizacion ruidosa.
- Procesamiento por ventanas de 6 palabras, adecuado para frases cortas y comentarios.
- Capacidad de generalizacion a palabras fuera del vocabulario de entrenamiento (OOV): segun el autor, alcanza un 55,3% de acierto en palabras de test cuya grafia singlish no aparece en los pares de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Capacidad multilingue limitada al par singlish-sinhala; las palabras en ingles incrustadas en el singlish se transliteran foneticamente con ortografia inconsistente, segun el autor.

## Casos de uso

- Normalizacion de comentarios en redes sociales: el modelo convierte comentarios escritos en singlish a escritura sinhala estandar, lo que facilita su indexacion, busqueda y moderacion automatica en plataformas dirigidas a hablantes de sinhala. Es adecuado por su entrenamiento especifico con comentarios de redes sociales del corpus SwaBhasha.
- Preprocesamiento para pipelines de PLN en sinhala: los sistemas de analisis de sentimiento, clasificacion de temas o traduccion automatica que operan sobre sinhala nativo pueden beneficiarse de una etapa previa de transliteracion de entradas informales, reduciendo la dispersion ortografica.
- Creacion de subtitulos y transcripciones: dado un texto romanizado generado por hablantes (por ejemplo, transcripciones de audio o mensajes de chat), el modelo produce la version en escritura sinhala para publicacion o archivo.
- Enriquecimiento de corpus linguisticos: investigadores que recopilan texto informal en singlish pueden usar el modelo para generar versiones en sinhala nativo y aumentar el volumen de datos disponibles en ese alfabeto, con la cautela de que las referencias siguen una unica convencion de anotacion.
- Herramientas de accesibilidad y teclado: integracion en editores o teclados virtuales que permitan al usuario escribir en singlish y obtener automaticamente la salida en escritura sinhala, aprovechando la baja latencia esperable de un modelo de 7,5 millones de parametros.
- Limpieza de datos para entrenamiento de modelos mayores: el modelo puede actuar como normalizador en la fase de curado de corpus, convirtiendo texto romanizado a sinhala nativo antes de alimentar modelos de lenguaje de mayor tamano, siempre que se valide la calidad de la transliteracion en el dominio concreto.

## Benchmarks y rendimiento

Los resultados que se presentan a continuacion son los declarados por el autor del modelo en su model card y en el model-index, sobre el split de test reservado de SwaBhasha (2.366 frases, 25.802 palabras). No estan verificados de forma independiente (`verified: false`).

| Sistema | CER ↓ (IC 95%) | WER ↓ | Precision por palabra ↑ | CER formal | CER social | Precision OOV ↑ |
|---|---|---|---|---|---|---|
| Transliterador basado en reglas | 17,36% (17,10-17,63) | 60,1% | 39,7% | 17,1% | 18,1% | 22,3% |
| Diccionario + reglas | 9,00% (8,75-9,27) | 29,0% | 70,5% | 8,6% | 10,2% | 22,3% |
| **Este modelo** | **5,44% (5,24-5,64)** | **21,3%** | **78,0%** | **4,6%** | **7,7%** | **55,3%** |

Notas sobre la evaluacion segun el autor: el split se realizo aleatoriamente por objetivo sinhala unico, de modo que ninguna frase aparece en dos splits; el checkpoint se selecciono sobre el conjunto de desarrollo y el test se puntuo una sola vez; las palabras OOV son las 6.380 palabras de test cuya grafia singlish nunca aparece en los pares de entrenamiento; los intervalos de confianza se calcularon mediante bootstrap a nivel de frase.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 7,5 millones de parametros, los pesos en punto flotante de 32 bits ocupan aproximadamente 30 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; el autor entreno el modelo en un Mac con chip Apple Silicon de 8 GB usando MPS. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en dispositivos de gama baja.
- Opciones de despliegue: el modelo se distribuye como `model.pt` de PyTorch y requiere el codigo del repositorio de GitHub del autor (`singlish.model.Transliterator`) para cargarse. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test SwaBhasha) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| singlish-sinhala-char-transformer | ~7,5 M | No disponible (ventanas de 6 palabras) | 5,44% | MIT | Hugging Face + GitHub |
| Transliterador basado en reglas | No aplica | No aplica | 17,36% | No disponible | No disponible |
| Diccionario + reglas | No aplica | No aplica | 9,00% | No disponible | No disponible |

No se dispone de informacion sobre otros modelos neuronales comparables de transliteracion singlish-sinhala en la busqueda realizada. La comparativa se limita a los dos sistemas heuristicos evaluados por el propio autor en el mismo conjunto de test.

## Limitaciones y advertencias

- Las referencias del conjunto de test siguen una unica convencion de anotacion: el sinhala coloquial se escribe con ortografia hablada (හොදට, පුලුවන්, යනව) y se usa ෑ en lugar de ැ. Cuando el modelo genera la forma estandar, se puntua como error, lo que puede penalizar indebidamente salidas correctas desde un punto de vista normativo.
- Algunas referencias del conjunto de test contienen errores segun el autor.
- El texto coloquial es mas dificil que el formal: 7,7% de CER en social frente a 4,6% en formal. La taquigrafia extrema ("ikmnt") sigue fallando con frecuencia.
- Las palabras en ingles incrustadas en el singlish se transliteran foneticamente con ortografia inconsistente.
- Todos los datos reales provienen de una unica fuente (SwaBhasha); no hay evaluacion humana y el modelo no se ha probado con texto de chat arbitrario.
- La decodificacion es greedy y la entrada se divide en ventanas de 6 palabras, por lo que no se aprovecha el contexto entre ventanas.
- Riesgo de alucinacion: no aplica en el sentido de generacion libre, pero el modelo puede producir transliteraciones incorrectas o inconsistentes en entradas ambiguas o fuera de dominio.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye como `model.pt` cargado con `weights_only=False`, lo que implica riesgos de seguridad si no se confia en el repositorio de origen; el autor lo advierte explicitamente.
- No se han publicado resultados de benchmarks independientes ni verificados; los datos de rendimiento son declarados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/singlish-sinhala-char-transformer
- Repositorio de codigo, preparacion de datos y evaluacion: https://github.com/Nipuna-Lakruwan/singlish-sinhala-translit
- Dataset SwaBhasha: https://huggingface.co/datasets/deshanksuman/SwaBhasha_Transliteration_Sinhala
- Articulo Swa-Bhasha (Sumanathilaka, Weerasinghe & Priyadarshana, ICARC 2023): doi:10.1109/ICARC57651.2023.10145648
- Wikipedia en sinhala (fuente de datos sinteticos, CC BY-SA 4.0): https://si.wikipedia.org
