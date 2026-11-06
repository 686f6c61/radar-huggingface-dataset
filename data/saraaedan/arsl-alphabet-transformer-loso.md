# saraaedan/arsl-alphabet-transformer-loso

## Resumen

ArSL alphabet transformer LOSO (v5) es un modelo de reconocimiento del alfabeto de la lengua de signos arabe (ArSL) desarrollado por el usuario saraaedan y publicado en Hugging Face bajo licencia MIT. El modelo clasifica 39 clases correspondientes a letras del alfabeto ArSL a partir de landmarks de manos extraidos con MediaPipe, en lugar de trabajar directamente sobre video o imagenes. Se trata de un transformer encoder de pequeno tamano (3 capas, 4 cabezas, d_model 128) que procesa secuencias de 28 fotogramas a 30 fps y aplica masked mean pooling sobre las representaciones para emitir la prediccion final.

La relevancia del modelo reside en su enfoque de evaluacion: los resultados publicados corresponden a validacion leave-one-signer-out (LOSO), es decir, con signantes no vistos durante el entrenamiento, lo que mide la generalizacion real a nuevos usuarios y no solo el ajuste a los signantes de entrenamiento. El autor reporta una precision del 79,42 ± 6,81 % (3 folds x 5 semillas), un macro-F1 del 77,30 % y un top-5 del 95,34 %. Es, por tanto, un modelo de investigacion orientado a reconocimiento aislado de letras, no a traduccion continua de lengua de signos.

El modelo es deliberadamente pequeno y ligero (repo de 0,0 GB segun Hugging Face, con pesos en pytorch_model.bin), lo que lo hace adecuado para prototipos en tiempo real sobre CPU o GPU de gama baja. Sus limitaciones son explicitas: solo tres signantes en el corpus de entrenamiento y una evaluacion en vivo piloto, lo que restringe su uso en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (3 capas, 4 cabezas, d_model 128) con masked mean pooling |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 28 fotogramas a 30 fps (secuencia de entrada fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de clasificacion de lengua de signos, no generacion de texto) |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder con 3 capas, 4 cabezas de atencion y dimension de modelo 128. La entrada son landmarks de mano extraidos con MediaPipe: 2 manos x 21 puntos x 3 coordenadas, normalizados por mano con origen en la muneca y escala basada en el tamano de la palma, a lo largo de 28 fotogramas capturados a 30 fps. Sobre la salida del encoder se aplica masked mean pooling y una cabeza de clasificacion de 39 clases (letras del alfabeto ArSL segun KArSL-502).

El entrenamiento utiliza los tres signantes del corpus KArSL, con aumento de datos (augmentation) y 24 epocas, seleccionadas como la mediana de la mejor epoca en las ejecuciones LOSO. La evaluacion principal es leave-one-signer-out con 3 folds y 5 semillas por fold, lo que proporciona una estimacion de generalizacion a signantes nuevos. No se documentan en la informacion disponible detalles sobre el numero total de secuencias de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables a una tarea de clasificacion supervisada).

## Capacidades

- Clasificacion de 39 clases correspondientes a letras del alfabeto de la lengua de signos arabe (ArSL) a partir de secuencias de landmarks de mano.
- Procesamiento de secuencias temporales cortas (28 fotogramas a 30 fps) con atencion sobre landmarks normalizados.
- Reconocimiento con dos manos simultaneas (2 x 21 puntos x 3 coordenadas).
- Salida de probabilidades por clase, con umbral de confianza configurable (0,484 en la configuracion en vivo reportada).
- Integracion con un pipeline de captura en tiempo real basado en MediaPipe y un script de preprocesamiento propio (preprocessing.py).
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multilingues en el sentido de modelos de lenguaje.

## Casos de uso

- Prototipo de reconocimiento de deletreo dactilologico en ArSL: el modelo clasifica letras aisladas a partir de landmarks de MediaPipe, adecuado para demos interactivas de aprendizaje del alfabeto en navegador o escritorio con una webcam.
- Herramienta educativa para aprendizaje del alfabeto ArSL: integrado en una aplicacion que muestre la letra predicha y su confianza, permite a estudiantes practicar el deletreo con retroalimentacion automatica, aprovechando el top-5 del 95,34 % para sugerencias.
- Investigacion en reconocimiento de lengua de signos: sirve como baseline reproducible con evaluacion LOSO para comparar arquitecturas de clasificacion sobre landmarks frente a enfoques basados en video.
- Sistema de entrada alternativo en entornos controlados: con un unico signante conocido y condiciones de captura estables, puede mapear letras a caracteres para composicion de texto en aplicaciones de accesibilidad.
- Filtrado y preetiquetado de corpus ArSL: el modelo puede preanotar segmentos de letras aisladas en grabaciones nuevas para acelerar la revision manual, dado su bajo coste computacional.
- Despliegue en dispositivos de gama baja: al operar sobre landmarks y no sobre pixeles, el coste de inferencia es minimo y puede ejecutarse en CPU, lo que facilita prototipos en Raspberry Pi o portatiles sin GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision signer-independent (LOSO, 3 folds x 5 semillas) | 79,42 ± 6,81 % |
| Macro-F1 | 77,30 % |
| Top-5 accuracy | 95,34 % |
| Umbral de confianza en vivo | 0,484 (elegido leave-one-fold-out) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un transformer encoder de 3 capas y d_model 128, por lo que cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoria de configuraciones).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte CUDA (GTX 1650, RTX 3060, RTX 4090, A100, H100) puede ejecutarlo sobradamente. La carga principal es la extraccion de landmarks con MediaPipe.
- Cabe en GPU consumer: si, en todas las gamas actuales, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (pytorch_model.bin + model.py), con preprocessing.py para el pipeline de landmarks. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de reconocimiento del alfabeto ArSL ni con alternativas basadas en video o en grafos esqueleticos.

## Limitaciones y advertencias

- Entrenado unicamente con tres signantes del corpus KArSL, lo que limita la generalizacion a la variabilidad real de la comunidad de signantes.
- La evaluacion en vivo es un estudio piloto; el umbral de confianza (0,484) se selecciono con leave-one-fold-out y solo se evaluo en dicho estudio.
- Precision signer-independent moderada (79,42 %) con desviacion alta (± 6,81 %), lo que implica comportamiento variable segun el signante no visto.
- Dependencia critica de la calidad de los landmarks de MediaPipe: oclusiones, mala iluminacion o encuadre incorrecto degradan la entrada.
- No es un modelo de lengua de signos continua ni de traduccion; solo clasifica letras aisladas.
- No dispone de informacion sobre sesgos demograficos ni sobre diversidad de piel, iluminacion o morfologia de las manos en el conjunto de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; para produccion se recomienda validar con signantes y condiciones de captura propios.
- El repositorio figura con tamano de 0,0 GB en Hugging Face, lo que puede indicar que los pesos no estan subidos o que el tamano reportado no refleja el contenido real; conviene verificar antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/saraaedan/arsl-alphabet-transformer-loso
