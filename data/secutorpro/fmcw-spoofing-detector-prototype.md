# secutorpro/fmcw-spoofing-detector-prototype

## Resumen

fmcw-spoofing-detector-prototype es un clasificador binario basado en una red neuronal convolucional 1D implementada en PyTorch, publicado por el usuario secutorpro en HuggingFace. Su funcion es detectar ecos radar FMCW usurpados (retornos fantasma o spoofing) frente a retornos legitimos, a partir de la senal de batido tras el mezclador, muestreada en ventanas de 512 muestras a 10 MHz. No es un modelo de lenguaje ni un modelo generativo: es un detector de senal para aplicaciones de guerra electronica y contramedidas radar.

El modelo se presenta explicitamente como un prototipo y como una reconstruccion corregida del proyecto de GitHub Ajinkya-001/An-AI-Based-FMCW-Radar-Jammer-Detector. La correccion principal afecta al diseno del conjunto de datos: se eliminan los solapamientos de retardos y atenuaciones entre clases que provocaban fuga de etiqueta, y se sustituye el split aleatorio por una particion por escena 80/10/10. El conjunto de entrenamiento consta de 5000 senales sinteticas con relaciones senal-ruido entre 10 y 30 dB.

La relevancia actual del artefacto es limitada pero concreta: ofrece una linea base reproducible para investigacion en deteccion de interferencias y spoofing radar, con una metrica publicada de accuracy 0.9680 sobre escenas no vistas. El repositorio tiene 0 descargas y 0 likes, un tamano declarado de 0.0 GB y no incluye tarjeta de licencia ni idiomas, lo que indica que se trata de un experimento en fase muy temprana, sin pesos publicados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (PyTorch), clase `SpoofNet` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 512 muestras por inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio declara 0.0 GB; solo se referencia una clase `model_stub`) |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Tipo de senal de entrada | Senal de batido FMCW tras el mezclador |
| Frecuencia de muestreo | 10 MHz |
| Tamano de ventana | 512 muestras (51,2 microsegundos por ventana, derivado) |
| Tarea | Clasificacion binaria (eco legitimo / eco usurpado) |
| Salidas | 2 clases, etiquetado no especificado en la model card |
| Fecha de publicacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |
| Herramienta de creacion | ML Intern (HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional 1D en PyTorch denominada SpoofNet, cuyo codigo se referencia en el repositorio de GitHub del proyecto original (archivo `model.py`). No se detalla en la model card el numero de capas, canales, filtros, funcion de activacion, mecanismo de pooling ni el numero de parametros resultantes. La entrada es la senal de batido FMCW muestreada a 10 MHz, segmentada en ventanas de 512 muestras, lo que corresponde a una ventana temporal de aproximadamente 51,2 microsegundos por inferencia. Se trata, por tanto, de un modelo de clasificacion de series temporales 1D de un solo canal, no de un transformer ni de una arquitectura hibrida.

El entrenamiento se realizo sobre 5000 senales sinteticas con SNR en el rango de 10 a 30 dB. El aspecto mas destacable del trabajo es la metodologia de datos, no la arquitectura: la reconstruccion corrige el diseno del dataset original evitando el solapamiento de retardos y atenuaciones entre las clases, lo que eliminaba la fuga de etiqueta, y aplica una particion por escena en proporcion 80/10/10 en lugar de un split aleatorio. Esta decision garantiza que las escenas de test no aparezcan en entrenamiento, lo que hace que la metricas reportadas sean mas representativas de una generalizacion real. No se menciona el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo que no aplica a un clasificador de senal. Tampoco se documentan aumentacion de datos, optimizador, learning rate, numero de epocas ni estrategia de regularizacion.

## Capacidades

- Clasificacion binaria de retornos radar FMCW: distingue entre ecos legitimos y ecos usurpados (spoofing) a partir de la senal de batido.
- Procesamiento de ventanas cortas de 512 muestras a 10 MHz, adecuado para inferencia de baja latencia en flujos continuos de radar.
- Robustez declarada frente a ruido: el conjunto de entrenamiento cubre SNR de 10 a 30 dB.
- Evaluacion por escenas no vistas, lo que sugiere capacidad de generalizacion a condiciones no memorizadas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo thinking ni de procesamiento de audio.
- No se documentan capacidades de deteccion multi-clase, estimacion de parametros del atacante ni localizacion del jammer.

## Casos de uso

- Deteccion de spoofing en radares FMCW automotrices: el modelo puede clasificar ventanas de 512 muestras del canal de batido para señalar retornos falsos inyectados por un atacante, como capa de integridad de senal en un pipeline de percepcion.
- Contramedidas en sistemas de guerra electronica: integrado en un receptor de alerta radar, permite discriminar ecos fantasma generados por un jammer y activar protocolos de filtrado o cambio de frecuencia.
- Monitorizacion de integridad en radar meteorologico o de vigilancia: como verificador secundario que marca frames sospechosos antes de que pasen al algoritmo de tracking.
- Investigacion academica en seguridad radar: sirve como linea base reproducible para comparar nuevas tecnicas de deteccion de spoofing, dado que la particion por escena evita la fuga de etiqueta habitual en este tipo de estudios.
- Validacion de simuladores y generadores de senal: el modelo puede emplearse para comprobar si un simulador de ataques produce ecos suficientemente realistas como para engañar a un detector entrenado.
- Procesamiento embebido en FPGA/SoC con coprocesador: al operar sobre ventanas de 512 muestras, es candidato a despliegue en plataformas de radar con recursos limitados, aunque la arquitectura y el coste computacional no estan publicados.
- Auditoria de conjuntos de datos sinteticos: la metodologia de split por escena puede reutilizarse como plantilla para validar otros pipelines de entrenamiento en deteccion de senal.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (escenas no vistas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9680 |
| Muestras de test | 500 |
| Aciertos totales | 484 |
| Errores totales | 16 |

Matriz de confusion reportada:

| | Predicho clase 0 | Predicho clase 1 |
|---|---|---|
| Real clase 0 | 250 | 0 |
| Real clase 1 | 16 | 234 |

Metricas derivadas de la matriz de confusion (calculo aritmetico propio, no publicado por el autor):

| Metrica | Clase 0 | Clase 1 |
|---|---|---|
| Precision | 0,9398 (250/266) | 1,0000 (234/234) |
| Recall | 1,0000 (250/250) | 0,9360 (234/250) |
| F1 | 0,9690 | 0,9669 |

No se han publicado resultados comparativos con otros modelos de deteccion de spoofing FMCW ni metricas adicionales como AUC-ROC, precision media o curvas de rendimiento frente a SNR. La model card no especifica cual de las dos clases corresponde a eco usurpado.

## Requisitos de hardware

- La model card no publica el numero de parametros, el coste de FLOPs ni el tamano de los pesos, por lo que no es posible ofrecer cifras de VRAM verificadas.
- Al tratarse de una CNN 1D con entradas de 512 muestras, el coste de inferencia es previsiblemente muy bajo en terminos relativos a modelos de vision o lenguaje, pero esta afirmacion no puede cuantificarse sin la arquitectura publicada.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA, incluida una gama consumer antigua, seria probablemente suficiente, pero no hay datos verificables.
- Viabilidad en GPU consumer: no confirmada, aunque por el tamano de entrada (512 muestras) es plausible que quepa en cualquier GPU consumer e incluso ejecute en CPU; se indica como estimacion condicionada, no como dato.
- Opciones de despliegue: la model card solo muestra un fragmento de codigo con `from model_stub import SpoofNet` y el uso de PyTorch. No se documentan exportaciones a ONNX, TensorRT, TorchScript, vLLM, llama.cpp ni Ollama (estos ultimos no aplican a un clasificador de senal).
- Latencia y throughput: no disponibles. Como referencia derivada, una ventana de 512 muestras a 10 MHz representa 51,2 microsegundos de senal, por lo que la tasa de frames del radar de origen seria de aproximadamente 19,5 kHz; el modelo tendria que procesar a esa tasa para operar en tiempo real, extremo no evaluado en la model card.
- El repositorio declara un tamano de 0.0 GB, lo que sugiere que los pesos no estan alojados en HuggingFace; cualquier despliegue requeriria obtener el modelo desde el repositorio de GitHub referenciado.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada. La model card no incluye comparativas con alternativas, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con deteccion de spoofing radar (los resultados obtenidos eran contenido no relacionado y se descartan).

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fmcw-spoofing-detector-prototype | no disponible | 512 muestras a 10 MHz | accuracy 0,9680 en test por escenas | no disponible | repositorio de 0.0 GB, sin pesos aparentes |
| Repositorio original Ajinkya-001 (An-AI-Based-FMCW-Radar-Jammer-Detector) | no disponible | no disponible | no disponible | no disponible | GitHub publico |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de un prototipo declarado explicitamente como tal por el autor, no de un modelo listo para produccion.
- El repositorio declara 0.0 GB de tamano y no expone pesos: la model card solo referencia una clase `model_stub` y remite a la arquitectura del repositorio original, por lo que el artefacto podria no ser ejecutable directamente desde HuggingFace.
- No hay licencia declarada. Sin licencia explicita, no se concede permiso de uso comercial ni de redistribucion; cualquier uso en produccion requiere contactar con el autor.
- No se documentan sesgos, pero el entrenamiento es exclusivamente sintetico (5000 senales, SNR 10-30 dB), lo que implica un riesgo alto de brecha de dominio frente a radar real.
- Los datos de rendimiento provienen de un unico conjunto de test de 500 muestras generadas sinteticamente; no hay validacion cruzada ni evaluacion en hardware real.
- La clase 1 presenta 16 falsos negativos (recall 0,9360), es decir, aproximadamente un 6,4 % de ecos usurpados no detectados en test. En un escenario de contramedidas, un falso negativo es el error mas costoso.
- La model card no especifica la semantica de las clases (cual es legitima y cual usurpada), lo que dificulta interpretar la matriz de confusion en un despliegue real.
- No hay informacion sobre comportamiento frente a SNR inferior a 10 dB, escenarios multitrayecto, movilidad del objetivo ni interferencia de banda adyacente.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje natural; la fila de idiomas de la ficha original no aplica.
- El campo pipeline no esta definido y los tags incluyen `ml-intern`, lo que indica generacion asistida por la herramienta ML Intern de HuggingFace y refuerza el caracter experimental del artefacto.
- Riesgo de alucinacion: no aplica, ya que el modelo no es generativo. El riesgo equivalente es la clasificacion erronea por sobreajuste a las condiciones sinteticas de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/secutorpro/fmcw-spoofing-detector-prototype
- Repositorio original en GitHub: https://github.com/Ajinkya-001/An-AI-Based-FMCW-Radar-Jammer-Detector
- Herramienta ML Intern (HuggingFace): https://hf.co/chat?mode=ml-intern
- Insignia "Built with ML Intern": https://huggingface.co/datasets/huggingface/badges/resolve/main/built-with-ml-intern-sm.svg

Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo, con radar FMCW ni con deteccion de spoofing. Corresponden a directorios de contenido para adultos y se descartan por completo como fuentes. No se han localizado papers, blogs, repositorios adicionales ni demos asociados a este modelo.
