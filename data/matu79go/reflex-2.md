# matu79go/Reflex-2

## Resumen

Reflex-2 es un sistema de clasificacion de video orientado a la deteccion local de caidas, desarrollado por el autor matu79go. No es un modelo de lenguaje generativo: su funcion es convertir un clip en un unico vector mediante el modelo de embeddings google/embeddinggemma-2 (768 dimensiones) y leer ese vector con una cabeza ligera de regresion logistica entrenada a partir de ejemplos etiquetados. El repositorio aloja unicamente las cabezas (heads); el modelo base se carga desde el repositorio de Google y no se modifica.

El modelo esta pensado para inferencia en el propio hardware, sin nube. Segun su model card, la version base ronda los 740 millones de parametros y el pipeline declarado es video-classification. La cabeza publicada, `fall.json`, distingue entre caida y actividad diaria (ADL) en camaras domesticas, con una precision balanceada del 95,7 por ciento y un AUC de 0,990 en validacion leave-one-person-out. El sistema se presenta como mas rapido que un LLM de frontera (Gemini 3.8 Flash) para la misma tarea, con 0,28 s por clip frente a 6,95 s.

Su relevancia actual radica en el enfoque: en lugar de depender de un modelo generalista costoso, combina un encoder de embeddings preentrenado con cabezas especificas entrenables en segundos a partir de pocas docenas de clips etiquetados. Esto lo situa en el espacio de la IA en el borde (edge AI) para vigilancia y monitorizacion domestica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de embeddings (base google/embeddinggemma-2) mas cabeza de regresion logistica sobre el vector de 768 dimensiones |
| Parametros totales | 740M (segun la model card, para el modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como texto; procesa hasta 32 fotogramas por clip a 1 fotograma por segundo (hasta unos 32 s de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (cabeza entrenada sobre GMDCSA24, licencia MIT) |
| Formato de pesos | Cabeza en JSON (etiquetas, normalizacion y pesos); el modelo base se descarga del repositorio de Google, formato no disponible |

## Arquitectura y entrenamiento

Reflex-2 no entrena un transformer de video desde cero. Toma fotogramas a 1 por segundo, hasta 32 por clip, y los pasa por google/embeddinggemma-2 para obtener un unico vector de 768 dimensiones que representa el clip completo. Sobre ese vector se aplica una cabeza de regresion logistica, almacenada como JSON, que contiene las etiquetas, la normalizacion y los pesos. Por tanto, la innovacion no esta en la arquitectura del encoder, que se reutiliza sin modificar, sino en el procedimiento de entrenamiento de la cabeza.

La cabeza `fall.json` se entreno con el conjunto GMDCSA24 (160 clips, 4 actores, licencia MIT) y se evaluo con validacion leave-one-person-out, en la que cada persona se reserva por turno. La model card reporta que basta con unas pocas docenas de clips etiquetados para obtener un juicio propio en segundos: con 5 ejemplos por clase la precision balanceada es del 85,6 por ciento, con 20 llega al 93,3 por ciento y con todos los datos alcanza el 95,7 por ciento. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de alineamiento, algo coherente con que el modelo base sea un encoder de embeddings y no un modelo generativo.

## Capacidades

- Clasificacion de video: convierte un clip en un vector y emite una decision entre etiquetas definidas por la cabeza cargada (por ejemplo `fall` frente a `adl`).
- Deteccion de caidas en camara domestica: la cabeza publicada `fall.json` esta especializada en este juicio.
- Juicio personalizado por pocas etiquetas: permite entrenar cabezas nuevas a partir de unas pocas docenas de clips anotados.
- Procesamiento de imagenes y audio: la model card indica que juzga video, imagenes y audio en hardware propio.
- Modo vigilancia continua: el metodo `watch` evalua los ultimos 4 segundos cada 0,5 segundos, emulando una camara en directo.
- Busqueda por similitud sin cabeza: sin una cabeza entrenada solo esta disponible la busqueda por similitud (por ejemplo, contra una descripcion textual), con AUC de 0,836 en el caso de caidas.
- Idiomas: interfaz y descripciones en ingles.

## Casos de uso

- Deteccion de caidas en domicilios de personas mayores: con la cabeza `fall.json` el sistema clasifica clips de camara doméstica y distingue caida de actividad diaria con 95,7 por ciento de precision balanceada, lo que permite activar avisos sin enviar video a la nube.
- Monitorizacion en residencias y teleasistencia: el modo `watch` analiza los ultimos 4 segundos cada 0,5 segundos, adecuado para seguimiento continuo en tiempo casi real sobre una sola GPU.
- Vigilancia de anomalias en camaras de seguridad: la model card reporta un 95 por ciento de acierto en el conjunto UCF-Crime con 1,4 s por clip, aunque esta cabeza no se publica por restricciones de investigacion del dataset.
- Clasificacion personalizada en entornos industriales: entrenar una cabeza con clips etiquetados de un emplazamiento concreto para detectar incidentes (caidas, situaciones de riesgo) adaptada a esa camara y esa iluminacion.
- Procesamiento en el borde sin conectividad: al consumir 2,2 GB de memoria de GPU y funcionar tambien en CPU, puede desplegarse en dispositivos locales donde no hay acceso a servicios en la nube.
- Filtrado y triaje previo a revision humana: al convertir clips en vectores, permite buscar por similitud entre grabaciones y priorizar los fragmentos que un operador debe revisar.
- Investigacion en vision por computador: la combinacion de un encoder de embeddings congelado y una cabeza ligera sirve como linea base reproducible y de bajo coste para experimentos de clasificacion de video.

## Benchmarks y rendimiento

Deteccion de caidas en GMDCSA24 (4 actores en 3 hogares, cada persona reservada por turno):

| Ejemplos por clase | Precision balanceada | AUC |
|---|---|---|
| Ninguno (similitud con una descripcion textual) | no aplica | 0,836 |
| 5 | 85,6 % | 0,939 |
| 20 | 93,3 % | 0,984 |
| Todos | 95,7 % | 0,990 |

Comparacion con un LLM de frontera, mismos clips y fotogramas:

| Metrica | Reflex-2 | Gemini 3.8 Flash |
|---|---|---|
| Deteccion de caidas, 40 clips: precision | 97,5 % | 85,0 % |
| Deteccion de caidas: tiempo mediano por clip | 0,28 s | 6,95 s |
| Anomalias de vigilancia (UCF-Crime), 40 clips: precision | 95 % | 95 % |
| Anomalias de vigilancia: tiempo mediano por clip | 1,4 s | 16,1 s |

Nota: Reflex-2 se ejecuto en una NVIDIA GB10 (ASUS Ascent GX10), un clip a la vez; Gemini se accedio via OpenRouter, con red incluida y razonamiento minimo. La cabeza de vigilancia no se publica.

## Requisitos de hardware

- Memoria de GPU: 2,2 GB en una NVIDIA GB10 (ASUS Ascent GX10) para un clip de 7 segundos.
- Latencia en GPU: 0,30 s por clip de 7 segundos en la GB10.
- Latencia en CPU: aproximadamente 11 s por clip con 4 nucleos Arm Cortex-X925; baja a 7,5 s con 70 tokens por fotograma y 4 fotogramas.
- GPU recomendadas: la model card solo documenta la NVIDIA GB10; no se proporcionan recomendaciones para A100, H100 o RTX 4090 en la informacion disponible.
- GPU de consumo: no se especifica compatibilidad con tarjetas de consumo, aunque el consumo de 2,2 GB sugiere que cabria en GPUs con memoria modesta; dato no confirmado en la informacion disponible.
- Opciones de despliegue: sentence-transformers (>=6.1) y transformers (>=5.19) con la libreria `reflex2` y `av`; no se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput: no disponible mas alla de los tiempos por clip indicados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reflex-2 | Encoder de embeddings mas cabeza logistica | 740M (base) | Clasificacion de video / deteccion de caidas | Apache 2.0 | HuggingFace, cabezas en JSON |
| Reflex-1-4B | Modelo hermano (texto e imagenes, LoRA y modulos latentes) | 4B | Razonamiento sobre instrucciones escritas | Apache 2.0 (segun repositorio) | HuggingFace |
| Gemini 3.8 Flash | LLM de frontera (propietario) | no disponible | Multimodal general, incluido video | Propietaria | Via API (OpenRouter) |

La model card distingue Reflex-2 de Reflex-1 en que el primero no razona sobre instrucciones escritas, mientras que Reflex-1 esta pensado para ello. Frente a un LLM de frontera como Gemini, Reflex-2 es mas rapido y, en deteccion de caidas, mas preciso en la prueba reportada, pero no ofrece razonamiento general ni generacion de texto. No se han identificado en la informacion disponible otros modelos comparables de deteccion de caidas en el borde.

## Limitaciones y advertencias

- Detecta cuando ocurre algo, no quien lo hace: no genera bounding boxes ni identifica personas.
- Las cabezas se entrenan para un juicio concreto; sin cabeza solo hay busqueda por similitud.
- No razona sobre instrucciones escritas; para eso remite a Reflex-1.
- Evaluacion sobre material publico, escenificado o de YouTube; la propia model card recomienda verificar la precision en las camaras propias antes de confiar en el sistema.
- Precision dependiente del numero de ejemplos de entrenamiento: cae al 85,6 por ciento con solo 5 ejemplos por clase y al 83,6 por ciento de AUC si se usa unicamente similitud con una descripcion textual.
- El sistema se valido con solo 4 actores en 3 hogares (GMDCSA24), lo que limita la generalizacion a otros entornos, camaras, iluminaciones y poblaciones.
- Riesgo de sesgo derivado del dataset de entrenamiento, con diversidad demografica limitada (4 actores).
- Idioma de las descripciones y la interfaz en ingles.
- La cabeza de vigilancia basada en UCF-Crime no se publica por restricciones de uso del dataset.
- Licencia Apache 2.0 para las cabezas, lo que permite uso comercial; el modelo base es EmbeddingGemma 2 (Apache 2.0) y la cabeza `fall.json` se entreno sobre GMDCSA24 (MIT). Reflex-2 no esta afiliado ni respaldado por Google.
- Como la cabeza es una regresion logistica sobre un unico vector por clip, pierde informacion temporal fina; la granularidad es de fotogramas a 1 por segundo, hasta 32.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/matu79go/Reflex-2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio de codigo, demos y scripts de entrenamiento: https://github.com/matu79go/reflex-2
- Modelo hermano Reflex-1-4B: https://huggingface.co/matu79go/Reflex-1-4B
- Perfil de GitHub del autor: https://github.com/matu79go
