# f13d/deepbump256-fp16.gguf

## Resumen

DeepBump256-fp16.gguf es una conversión al formato GGUF del modelo DeepBump, una red neuronal convolucional desarrollada originalmente por Hugo Tini dentro del proyecto DeepBump. Su propósito no es la generación de texto, sino la síntesis de mapas de normales (normal maps) a partir de imágenes de textura en color, una tarea clásica en el pipeline de gráficos por ordenador y videojuegos. El modelo infiere la geometría de superficie implícita en una textura 2D y produce un mapa de normales listo para su uso en motores de renderizado con iluminación PBR.

El repositorio de Hugging Face, publicado por el usuario f13d, contiene únicamente los pesos convertidos a GGUF en precisión fp16. Con 6.610.611 parámetros totales (aproximadamente 6,6 millones), se trata de un modelo muy compacto, orientado a inferencia ligera en CPU o GPU de gama baja. La variante "256" del nombre hace referencia al tamaño de tile o resolución de trabajo, no disponible con detalle en la información proporcionada.

Su relevancia es acotada pero concreta: permite ejecutar la conversión de texturas a mapas de normales dentro de herramientas compatibles con GGUF, sin depender del binario original ni de frameworks de deep learning completos. La licencia GPL-3.0 impone restricciones importantes para su integración en productos de código cerrado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red convolucional según el proyecto original DeepBump) |
| Parámetros totales | 6.610.611 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento. El proyecto original DeepBump está descrito como una herramienta de conversión de texturas a mapas de normales basada en aprendizaje profundo, lo que sitúa al modelo en la familia de redes convolucionales para visión por computador, no en la de transformers generativos. El número de parámetros (6,6 millones) es coherente con una CNN compacta de propósito específico.

No se dispone de datos sobre el conjunto de entrenamiento, el número de imágenes utilizadas, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino supervisado o preferencias. Tampoco hay información sobre innovaciones técnicas como atención lineal o decodificación especulativa, que no aplican a este tipo de modelo. La conversión a GGUF y fp16 es la única transformación documentada en el repositorio.

## Capacidades

- Síntesis de mapas de normales a partir de imágenes de textura en color.
- Procesamiento de texturas por tiles, presumiblemente de 256 píxeles según el nombre de la variante.
- Inferencia en CPU y GPU mediante runtimes compatibles con GGUF.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües al no procesar lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen de textura.

## Casos de uso

- Generación de mapas de normales para assets de videojuegos: el modelo convierte texturas de materiales (madera, piedra, tela) en mapas de normales utilizables en motores como Unity o Unreal, sustituyendo el trabajo manual en escenarios de prototipado rápido.
- Pipeline de materiales en tiempo real: integrado en una herramienta de autoría, permite previsualizar el relieve de una textura antes de exportarla, reduciendo iteraciones con artistas técnicos.
- Automatización de bibliotecas de texturas: procesamiento por lotes de una colección de imágenes para generar mapas de normales de forma masiva, aprovechando el reducido tamaño del modelo para ejecutarlo en hardware modesto.
- Herramientas de modding: conversión de texturas de juegos clásicos a mapas de normales para proyectos de remasterización comunitaria, donde el coste computacional bajo permite distribuir la herramienta a usuarios finales.
- Preprocesado en pipelines de render offline: generación de mapas de normales como paso previo en la preparación de escenas para renderizado con iluminación física.
- Educación y demostración: ejemplo didáctico de aplicación de CNN compactas a tareas de visión, ejecutable en portátiles sin GPU dedicada gracias a sus 6,6 millones de parámetros.
- Integración en flujos de trabajo con Blender: uso del mapa de normales generado como entrada en el shader de un material, agilizando la creación de superficies detalladas sin modelado geométrico adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16, dado el tamaño del modelo (6,6 millones de parámetros, aproximadamente 13 MB de pesos).
- GPU recomendadas: cualquier GPU con soporte para el runtime GGUF utilizado; no se requiere hardware de gama alta.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en CPU.
- Opciones de despliegue: runtimes compatibles con GGUF; no se especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y podrían no soportar esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepBump256-fp16.gguf | 6.610.611 | Textura a mapa de normales | GGUF | GPL-3.0 | Hugging Face |
| DeepBump original (HugoTini) | no disponible | Textura a mapa de normales | Pesos originales | no disponible en la información | GitHub Releases |
| Alternativas comerciales de generación de normal maps | no disponible | Textura a mapa de normales | no disponible | Propietaria | Herramientas de pago |

No se dispone de información suficiente para comparar rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia GPL-3.0 es copyleft fuerte: cualquier integración en un producto distribuido puede obligar a liberar el código bajo la misma licencia, lo que limita su uso comercial en software propietario.
- El modelo está diseñado exclusivamente para texturas; no debe esperarse ningún comportamiento de modelo de lenguaje.
- No hay información sobre sesgos, pero al tratarse de un modelo entrenado con texturas, puede fallar en materiales poco representados en su dataset original.
- Riesgo de artefactos en el mapa de normales generado en texturas con patrones ambiguos o sin relieve real.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; la calidad de la conversión a GGUF no está contrastada.
- No se especifican los idiomas ni la resolución exacta de entrada; el sufijo "256" sugiere un tile de 256 píxeles, pero no está confirmado.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la medición es incorrecta; conviene verificar antes de usarlo en producción.
- No hay garantías de mantenimiento ni soporte por parte del autor de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/f13d/deepbump256-fp16.gguf
- Repositorio original en GitHub: https://github.com/HugoTini/DeepBump
- Releases del modelo original: https://github.com/HugoTini/DeepBump/releases
