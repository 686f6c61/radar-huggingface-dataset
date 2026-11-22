# dworsleytonks/yishou

## Resumen

Yishou es un clasificador de gestos numéricos de una sola mano basado en un perceptrón multicapa (MLP) de tamaño muy reducido (17.163 parámetros en total), publicado por el usuario dworsleytonks en Hugging Face. El modelo no procesa imágenes directamente: recibe como entrada los 21 puntos de referencia (landmarks) de la mano que genera MediaPipe, lo que da un vector de 63 características (x, y, z por landmark) previamente normalizado en posición, escala, rotación en el plano y lateralidad de la mano. Su salida es una de 11 clases: los números del 1 al 10 en la gestualidad china de una mano y una clase "none" para cualquier otra forma de mano.

El problema que resuelve es acotado pero práctico: convertir la detección geométrica de MediaPipe en una etiqueta semántica de gesto numérico con un coste computacional mínimo. Al operar sobre landmarks y no sobre píxeles, el modelo es independiente de la resolución de la cámara y puede ejecutarse en tiempo real incluso en dispositivos de gama baja, siempre que MediaPipe funcione en el mismo entorno.

Es relevante ahora por su naturaleza de componente ligero dentro de pipelines de interacción gestual (control por gestos, interfaces sin contacto, demos educativas) y porque su licencia MIT permite integrarlo sin fricción en productos comerciales. No obstante, su validación es muy limitada: los datos provienen de una sola persona, una sola webcam y un conjunto de 7.052 frames de entrenamiento y 4.051 de validación, con una precisión del 96,4% en ese dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) sobre landmarks de mano |
| Parametros totales | 17.163 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 63 características) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión original) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de pequeña escala cuya entrada es un vector de 63 dimensiones correspondiente a las coordenadas (x, y, z) de los 21 landmarks de la mano detectados por MediaPipe. Antes de la inferencia, las coordenadas se normalizan para eliminar la posición absoluta, la escala, la rotación en el plano y la lateralidad (mano izquierda o derecha), de modo que el clasificador sea invariante a esos factores. La salida es una capa de 11 clases: los números 1 a 10 de la gestualidad china de una mano y la clase "none".

El entrenamiento se realizó con 7.052 frames y se evaluó sobre 4.051 frames de validación. Según la model card, los frames de validación provienen de grabaciones reservadas íntegramente, de modo que no son duplicados cercanos de los de entrenamiento. No se documentan en la información disponible detalles sobre la composición exacta del dataset, el número de épocas, la función de pérdida, el optimizador ni si hubo aumento de datos. Tampoco se indica si se aplicó algún tipo de regularización o calibración de probabilidades.

No se describen innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio enfoque de clasificar sobre landmarks normalizados en lugar de sobre imágenes, que es la decisión de diseño central del modelo.

## Capacidades

- Clasificación de gestos numéricos chinos de una mano, del 1 al 10, a partir de 21 landmarks de MediaPipe.
- Detección de la clase "none" para formas de mano que no corresponden a ningún número.
- Invariancia a posición, escala, rotación en el plano y lateralidad de la mano gracias a la normalización de entrada.
- Entrada fija de 63 características; no acepta imágenes ni texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.
- Inferencia de coste muy bajo: 17.163 parámetros permiten ejecución en CPU en tiempo real.

## Casos de uso

- Control por gestos en interfaces sin contacto: el modelo se integra tras MediaPipe para traducir la forma de la mano en un número del 1 al 10, útil en entornos donde no se quiere tocar pantallas (quirófanos, cocinas industriales, kioscos).
- Demos educativas de visión por computador: sirve como ejemplo mínimo de pipeline MediaPipe + clasificador para enseñar normalización de landmarks y clasificación ligera en cursos de machine learning.
- Prototipado rápido de interacción gestual: al tener licencia MIT y pesos safetensors, se puede incorporar en un prototipo de juego o aplicación de accesibilidad en pocas horas.
- Automatización de pruebas de UI gestual: permite generar etiquetas sintéticas a partir de grabaciones de landmarks para validar el comportamiento de una interfaz basada en gestos.
- Sistemas de accesibilidad: personas con movilidad reducida pueden usar gestos numéricos para introducir dígitos en un formulario o seleccionar opciones, siempre que el dominio de cámara y mano sea similar al de entrenamiento.
- Filtro previo en pipelines más complejos: la clase "none" permite descartar frames sin gesto numérico antes de pasar a un modelo más costoso, reduciendo el cómputo aguas abajo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de validación | 96,4% |
| Frames de entrenamiento | 7.052 |
| Frames de validación | 4.051 |
| Protocolo de validación | Grabaciones reservadas íntegramente (no duplicados cercanos) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. Tampoco se documentan métricas por clase, matriz de confusión, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (17.163 parámetros en safetensors); el cuello de botella real es MediaPipe, no el clasificador.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos (Raspberry Pi, móviles) siempre que MediaPipe esté disponible en la plataforma.
- Opciones de despliegue: PyTorch nativo con `pytorch_model_hub_mixin`; el repositorio del autor ofrece el comando `yishou demo --model dworsleytonks/yishou`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera que la latencia dominante provenga de la detección de landmarks de MediaPipe.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yishou (dworsleytonks) | MLP sobre landmarks | 17.163 | 63 características (21 landmarks xyz) | 11 (1-10 + none) | MIT | Hugging Face |
| Clasificadores MediaPipe Gesture Recognizer | Red preentrenada de Google | No disponible | Landmarks / imagen | Gestos predefinidos (no numéricos chinos) | Apache 2.0 (MediaPipe) | MediaPipe |
| Clasificadores CNN de gestos | CNN sobre imagen | No disponible | Píxeles | Variable | Variable | Repositorios varios |

No se dispone de datos de rendimiento comparables publicados para alternativas específicas de gestos numéricos chinos en la información proporcionada. La comparación con MediaPipe Gesture Recognizer es cualitativa: este último cubre un conjunto de gestos distinto y no está especializado en la numeración china de una mano.

## Limitaciones y advertencias

- Sesgo de dominio severo: todos los datos fueron grabados por una sola persona con una sola webcam; se espera una precisión notablemente inferior con otras manos, cámaras e iluminaciones, tal como advierte el propio autor.
- Riesgo de sobreajuste al estilo de grabación: aunque la validación usa grabaciones reservadas, la variabilidad de sujeto y sensor es prácticamente nula.
- Riesgo de alucinación de clase: al no documentarse calibración de probabilidades ni umbral de rechazo, la clase "none" puede confundirse con números en gestos ambiguos.
- Limitación de idioma/cultura: los gestos están definidos para la numeración china de una mano; no son transferibles a otras convenciones gestuales sin reentrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero no se documentan garantías ni responsabilidades del autor; conviene revisar el repositorio de código para condiciones adicionales.
- Caveat para producción: no se documentan métricas por clase, latencia, ni pruebas con MediaPipe en distintas versiones; la integración debe validarse con el pipeline concreto de landmarks usado.
- Dependencia externa: requiere MediaPipe para generar los landmarks; errores o cambios de versión en MediaPipe afectan directamente a la precisión del clasificador.

## Enlaces

- Hugging Face: https://huggingface.co/dworsleytonks/yishou
- Repositorio de código: https://github.com/sparkup/yishou
- MediaPipe (dependencia para landmarks): https://mediapipe.dev
