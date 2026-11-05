# pmarquees/blot-mini

## Resumen

Blot Mini es un detector de secretos de tipo token-classification desarrollado por el usuario pmarquees y construido con Mill, el entorno de investigacion agéntico de Succinct Labs. Su proposito es localizar claves de API y fragmentos de secretos de desarrollador en texto para su posterior redaccion. Se distribuye como paquete Core ML en FP32 junto con pesos NumPy y un frontend lexico en Python obligatorio, con un total de 2.283.666 parametros y 9,17 MB de assets de inferencia.

La particularidad tecnica del modelo es su metodo de construccion: los pesos neuronales fueron escritos directamente por agentes, sin descenso de gradiente, sin optimizador, sin tensores preentrenados y sin destilacion de profesor. Esta tecnica, denominada direct weight authoring, se inspira en el articulo "Sparks of Weight-Space Programming" de MIT CSAIL (noviembre de 2026) y se aplica aqui a la deteccion de secretos con un frontend lexico fijo y una evaluacion congelada.

El checkpoint publicado actualmente es `precision-a-2026-11-04`, seleccionado como ganador de precision tras varias rondas de fork-and-flush. Sobre una muestra congelada de 2.000 candidatos etiquetados de issues de GitHub obtuvo un F1 del 63,95% frente al 52,49% de Gitleaks 8.30.1, con una precision del 96,18% y un recall del 47,90%. Es una release de investigacion privada, no un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal propia de dos capas con activacion ReLU; 5.153 caracteristicas de entrada, 443 unidades ocultas y lectura escalar |
| Parametros totales | 2.283.666 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de tokens sobre candidatos lexicos, no generativo) |
| Tipos de cuantizacion | FP32 unicamente; no se declara exportacion INT4/INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | NumPy (`weights.npz`) y paquete Core ML FP32; assets de inferencia de 9.166.928 bytes (9,17 MB) |
| Checkpoint | `precision-a-2026-11-04`, publicado el 5 de noviembre de 2026 |
| Objetivo Core ML | Operaciones de iOS 18 / macOS 15 |
| Pipeline | token-classification con frontend lexico en Python obligatorio |
| Salida | spans `SECRET` con offsets en puntos de codigo Unicode y finales exclusivos |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo generativo. Es un scorer neuronal de dos capas con ReLU que opera sobre un vector de 5.153 caracteristicas extraidas por un frontend lexico en Python que genera candidatos. Ese frontend es obligatorio y forma parte del pipeline de inferencia: primero se extraen candidatos lexicos y sus caracteristicas, y despues la red escrita a mano produce una puntuacion escalar que, tras aplicar un umbral fijo y un decodificador, da lugar a los spans `SECRET`. La red tiene 443 unidades ocultas y una lectura escalar final.

El entrenamiento no uso gradientes, ni optimizador, ni tensores preentrenados, ni destilacion. Los pesos fueron escritos directamente por agentes en el entorno Mill, con retroalimentacion de desarrollo y rondas de fork-and-flush adaptadas del articulo arXiv:2610.07447. Solo podian cambiar el constructor de pesos y su especificacion de prefijo permitida; la extraccion de candidatos, las caracteristicas, el umbral de puntuacion y el decodificador permanecieron congelados. El candidato seleccionado anadio inhibidores basados en pesos para direcciones web ordinarias, rutas de codigo fuente, referencias a nombres de fichero y marcadores de contrasena, preservando la evidencia de formatos que contienen credenciales. Una rama competidora supero el 99% de precision en ejemplos de desarrollo pero perdio demasiado recall de seleccion en CredData y fue descartada.

## Capacidades

- Deteccion de claves de API y secretos de desarrollador en texto, con salida de spans y offsets Unicode.
- Clasificacion de tokens a nivel de fragmento localizado, orientada a redaccion posterior.
- Discriminacion entre cadenas que parecen secretos y falsos positivos comunes: URLs, rutas de fuente, nombres de fichero y placeholders de contrasena.
- Deteccion de formatos con credenciales que requieren evidencia de soporte.
- Ejecucion en dispositivos Apple mediante Core ML (iOS 18 / macOS 15), sin GPU dedicada.
- No soporta generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Redaccion de secretos en logs de aplicacion: el modelo puede puntuar candidatos extraidos de lineas de log y marcar spans `SECRET` para sustituirlos por marcadores antes de enviar los logs a un sistema de observabilidad.
- Escaneo de issues y pull requests en repositorios: integrado en un bot de GitHub, procesa el texto de issues y comentarios para detectar claves filtradas antes de que se hagan publicas, aprovechando su precision del 96,18% para reducir falsos positivos.
- Pre-commit hook local en macOS: al ejecutarse via Core ML en el portatil del desarrollador, puede bloquear commits que contengan credenciales sin enviar el codigo a un servicio externo.
- Filtrado en pipelines de CI/CD: como paso previo a la publicacion de artefactos, detecta secretos en ficheros de configuracion y variables de entorno volcadas en logs de build.
- Redaccion en herramientas de soporte tecnico: al procesar tickets o transcripciones, localiza claves pegadas por error por los usuarios antes de almacenarlas en el CRM.
- Investigacion sobre weight-space programming: sirve como caso de estudio reproducible de construccion de pesos sin descenso de gradiente, con evaluacion congelada y reportes historicos publicados.
- Deteccion en dispositivos Apple sin conectividad: al ser un paquete Core ML de 9,17 MB, puede desplegarse en apps de iOS o macOS para analisis local de texto sin salida a red.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las dos evaluaciones son distintas y no forman una curva antes/despues sobre el mismo benchmark.

| Evaluacion | Modelo | Precision | Recall | F1 |
|---|---|---|---|---|
| Muestra congelada de 2.000 candidatos etiquetados de issues de GitHub | Blot Mini `precision-a-2026-11-04` | 96,18% | 47,90% | 63,95% |
| Muestra congelada de 2.000 candidatos etiquetados de issues de GitHub | Gitleaks 8.30.1 | 98,35% | 35,80% | 52,49% |
| Corpus completo CredData (11.030 ficheros) | Blot Mini r3a (release anterior, 1,045 MB, 257.751 parametros) | no disponible | no disponible | 49,64% (F1 de localizacion etiquetada) |
| Corpus completo CredData (11.030 ficheros) | Gitleaks 8.30.1 | no disponible | no disponible | 59,57% (F1 de localizacion etiquetada) |

El checkpoint actual no se ha evaluado sobre el corpus completo CredData. El aumento de tamano respecto a r3a no esta establecido como causa de la mejora. La muestra de issues mide deteccion de candidatos etiquetados localizados, no precision exhaustiva de documento ni sustitucion universal de escaneres.

## Requisitos de hardware

- Assets de inferencia: 9,17 MB (incluye `model.py`, `weights.npz` y el paquete Core ML); no equivale a uso de RAM ni al tamano de una aplicacion completa.
- Inferencia en CPU mediante Core ML en dispositivos Apple con iOS 18 o macOS 15; no se declara soporte CUDA ni GPU dedicada.
- VRAM estimada: no disponible; el modelo esta pensado para ejecucion en CPU y NPU/GPU integrada de Apple.
- GPU recomendadas: no aplica en el sentido de A100, H100 o RTX 4090; el destino es Apple Silicon y dispositivos iOS.
- Cabe en cualquier Mac moderno y en iPhone/iPad compatibles con iOS 18, dado el tamano del paquete.
- Opciones de despliegue: Core ML (formato nativo) y NumPy con el frontend Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 (issues GitHub) | Precision | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Blot Mini `precision-a-2026-11-04` | Scorer neuronal + frontend lexico, Core ML | 2.283.666 | no disponible | 63,95% | 96,18% | 47,90% | no disponible | HuggingFace, release de investigacion privada |
| Gitleaks 8.30.1 | Escaner basado en reglas | no aplica | no aplica | 52,49% | 98,35% | 35,80% | no disponible en la informacion | Herramienta open source ampliamente usada |
| Blot Mini r3a | Scorer neuronal + frontend lexico | 257.751 | no disponible | no disponible (49,64% F1 en CredData) | no disponible | no disponible | no disponible | Release historica |

No se dispone de datos de otros detectores de secretos neuronales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es una release de investigacion privada; la publicacion no establece readiness para produccion ni actualiza la app de prueba de macOS.
- El recall es bajo (47,90% en la muestra de issues): se le escapan mas de la mitad de los secretos etiquetados, aunque sea mas preciso que Gitleaks en ese conjunto.
- Gitleaks sigue siendo mas preciso (98,35% frente a 96,18%), por lo que Blot Mini puede generar mas falsos positivos que un escaner de reglas.
- Requiere un frontend lexico en Python obligatorio; no funciona como modelo autonomo sobre texto crudo.
- Solo exporta FP32; no hay cuantizacion INT4/INT8 declarada, lo que limita optimizaciones de despliegue.
- Dependencia de plataforma: el paquete Core ML apunta a operaciones de iOS 18 / macOS 15.
- La evaluacion principal se hizo sobre una muestra de 2.000 candidatos de issues de GitHub; no mide precision exhaustiva de documento ni cobertura universal.
- CredData tiene solapamiento de procedencia conocido con los datos de desarrollo, por lo que los resultados historicos de r3a no constituyen una afirmacion de generalizacion independiente.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles; el frontend lexico y los formatos de secreto son propios de ecosistemas de desarrollo, no de lenguaje natural general.
- Riesgo de sesgos y alucinacion no evaluado en la informacion disponible; al ser un clasificador, el riesgo se traduce en falsos positivos y falsos negativos, no en generacion inventada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pmarquees/blot-mini
- Mill de Succinct Labs: https://succinctlabs.ai/mill
- Articulo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Paper Fork-and-Flush: https://arxiv.org/abs/2610.07447
- Informe historico CredData de r3a: https://huggingface.co/pmarquees/blot-mini/blob/main/history/r3a/creddata/REPORT.md
