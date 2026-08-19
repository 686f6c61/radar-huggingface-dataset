# nadizik/mouse-gesture-recognizer

## Resumen

El modelo `nadizik/mouse-gesture-recognizer` es una red neuronal perceptrón multicapa (MLP) diseñada para el reconocimiento en tiempo real de gestos 2D realizados con el ratón, el panel táctil o la pantalla táctil. Lo desarrolla el usuario de HuggingFace `nadizik` y se distribuye bajo licencia Apache-2.0. El modelo resuelve el problema de clasificar trayectorias de gestos dibujadas en un plano en ocho categorías predefinidas (clases 0 a 7), mediante una arquitectura ligera de tres capas totalmente conectadas que recibe una entrada normalizada de 128 valores (64 puntos con coordenadas x e y). Su relevancia radica en su simplicidad y bajo coste computacional, lo que lo hace adecuado para aplicaciones de interfaz humano‑computador, accesibilidad o automatización de escritorio. No se trata de un modelo de lenguaje ni de visión; su dominio es el procesamiento de series temporales geométricas.

La arquitectura concreta es un MLP de 128 → 64 → 32 → 8 con activaciones LeakyReLU y una salida softmax con temperatura 0,45. El repositorio incluye una interfaz gráfica Tkinter para pruebas interactivas y un sistema de normalización basado en interpolación espacial que convierte cualquier trayectoria en 64 puntos equiespaciados, garantizando invariancia a escala y velocidad. El modelo no está entrenado para texto ni lenguaje; su entrada es exclusivamente geométrica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 3 capas lineales: 128 → 64 → 32 → 8 |
| Parámetros totales | No especificado; la arquitectura descrita implica ~10.600 parámetros (estimación) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada fija de 128 floats, no es un modelo secuencial) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (reconoce gestos, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio no incluye archivos de pesos; solo código de ejemplo) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa (MLP) con tres capas lineales. La primera capa recibe 128 valores de entrada (64 puntos × 2 coordenadas), la segunda reduce a 32 y la tercera a 8 neuronas de salida. Cada capa oculta utiliza activación `LeakyReLU` con pendiente 0.1. La salida se pasa por una función softmax con temperatura 0.45 para producir probabilidades sobre las 8 clases. No se documenta la arquitectura más allá de estas capas; no se mencionan capas convolucionales, recurrentes ni mecanismos de atención.

El preprocesamiento de la entrada se basa en interpolación espacial unidimensional (`scipy.interpolate.interp1d`) para normalizar cualquier trayectoria dibujada a exactamente 64 puntos, lo que hace al modelo invariante a la escala y a la velocidad del gesto. No se proporcionan datos sobre el conjunto de entrenamiento (número de muestras, composición, método de optimización, número de épocas). Tampoco se menciona el uso de técnicas como regularización, aumento de datos o ajuste de hiperparámetros. La información disponible se limita a la arquitectura y a las instrucciones de uso.

## Capacidades

- Clasificación de gestos 2D en 8 categorías predefinidas (clases 0 a 7).
- Reconocimiento en tiempo real con latencia mínima, apto para aplicaciones interactivas.
- Invariancia a la escala y velocidad del dibujo gracias a la normalización mediante interpolación.
- Interfaz gráfica Tkinter integrada para probar el modelo dibujando con el ratón o la pantalla táctil.
- Compatibilidad con PyInstaller para empaquetar como ejecutable (EXE) sin problemas de multiprocessing.
- No posee capacidades de lenguaje natural, razonamiento, visión, audio ni tool calling; es un clasificador especializado.

## Casos de uso

- **Control de aplicaciones de escritorio**: el modelo puede asignar gestos a acciones como abrir ventanas, cambiar de pestaña o ejecutar atajos. Al ser un MLP ligero, se integra en aplicaciones nativas sin consumo notable de CPU.
- **Accesibilidad para personas con movilidad reducida**: usuarios con dificultades para usar un teclado pueden dibujar gestos simples en una pantalla táctil para activar funciones del sistema. La invariancia a escala facilita su uso con distintos tamaños de pantalla.
- **Automatización de pruebas de software**: en entornos de pruebas de GUI, se pueden generar gestos sintéticos y clasificarlos con el modelo para validar interacciones de arrastre o dibujo.
- **Sistemas de navegación por gestos en aplicaciones web**: aunque el modelo no es un servicio web nativo, puede integrarse en un backend con una API para clasificar gestos enviados desde el cliente.
- **Entornos de realidad aumentada o de escritorio virtual**: los gestos de ratón pueden traducirse a comandos de navegación en entornos 3D, siempre que se capturen las coordenadas 2D.
- **Investigación educativa**: como ejemplo de un MLP sencillo y funcional, es útil para enseñar clasificación de secuencias geométricas y preprocesamiento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de precisión, exactitud, F1 u otros indicadores de rendimiento para el modelo en ninguna base de datos conocida.

## Requisitos de hardware

- **VRAM estimada**: no aplica; el modelo es un MLP de ~10.600 parámetros, por lo que no requiere VRAM dedicada. Puede ejecutarse en memoria principal.
- **GPU recomendada**: ninguna; funciona en CPU. Cualquier procesador moderno es suficiente.
- **Compatibilidad con GPU de consumo**: no es necesario, pero si se usa, cualquier GPU con soporte PyTorch es válida.
- **Opciones de despliegue**: se puede ejecutar como script Python con PyTorch. No hay versiones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se han publicado mediciones, pero por la arquitectura se espera una latencia inferior a 1 ms en CPU para una sola clasificación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reconocimiento de gestos de ratón con MLP). La mayoría de los sistemas de reconocimiento de gestos utilizan redes convolucionales o recurrentes con conjuntos de datos más grandes, pero no hay datos concretos de competencia en el ámbito específico de este modelo.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo solo reconoce 8 clases predefinidas; no puede generalizar a gestos no vistos.
- **Entrada bidimensional**: no soporta gestos 3D ni combinaciones de teclado.
- **Dependencia del preprocesamiento**: la interpolación a 64 puntos es obligatoria; cualquier desviación en el formato de entrada puede degradar la clasificación.
- **Sesgos y alucinación**: no aplica al ser un clasificador no lingüístico, pero no se han evaluado sesgos en el conjunto de entrenamiento (desconocido).
- **Licencia**: Apache-2.0 permite uso comercial, pero no se garantiza la calidad del modelo para producción.
- **Falta de documentación**: no se informa sobre el proceso de entrenamiento ni sobre la validación, lo que dificulta evaluar su fiabilidad en entornos críticos.

## Enlaces

- [HuggingFace - nadizik/mouse-gesture-recognizer](https://huggingface.co/nadizik/mouse-gesture-recognizer)
