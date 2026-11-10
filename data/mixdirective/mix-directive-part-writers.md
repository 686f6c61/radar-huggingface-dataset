# MixDirective/mix-directive-part-writers

## Resumen

Mix Directive Part Writers es un conjunto de dos modelos ONNX desarrollados por Mix Directive para su aplicación de escritorio de producción musical. Cada modelo genera una parte instrumental concreta —bajo o teclados— a partir de los acordes, la tonalidad, la batería y la voz principal de una canción, todos ellos leídos desde un archivo MIDI. No se trata de un modelo de lenguaje general, sino de un generador de música simbólica especializado en una tarea muy acotada dentro de un flujo de trabajo DAW.

Técnicamente son dos redes idénticas de arquitectura transformer pequeña, con 6,4 millones de parámetros cada una, que operan sobre una ventana de ocho compases en 4/4 con una resolución de semicorchea (un paso por cada 16th note). `bass.onnx` escribe una nota de bajo por paso, mientras que `keys.onnx` decide cuándo se ataca un acorde, cuánto se mantiene y su voicing (número de notas, tono superior y octava), tomando las alturas del propio cifrado de acordes de la canción.

La relevancia de esta publicación es limitada para la comunidad open source: los pesos son propietarios, se distribuyen únicamente para que la app los descargue bajo demanda y la licencia prohíbe explícitamente su uso fuera de la aplicación, su redistribución y la construcción de derivados. Es, por tanto, un artefacto de distribución cerrado alojado en Hugging Face, no un modelo reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeno (6,4 M de parametros) sobre 8 compases de 4/4, un paso por semicorchea |
| Parametros totales | 6,4 M por modelo (dos modelos: bajo y teclados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 compases en 4/4 a resolucion de semicorchea (128 pasos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX, 26 MB por archivo) |
| Idiomas soportados | no disponible (modelo de musica simbolica, no linguistico) |
| Licencia | Mix Directive Part Writers Model License v1.0 (propietaria, todos los derechos reservados) |
| Formato de pesos | ONNX (`bass.onnx` y `keys.onnx`, 26 MB cada uno) |

## Arquitectura y entrenamiento

Ambos archivos contienen la misma red neuronal con pesos distintos. Se trata de un transformer de 6,4 millones de parámetros que procesa una secuencia de ocho compases en compás de 4/4, con un paso de modelado por cada semicorchea. La salida del modelo de bajo es una nota por paso temporal; la del modelo de teclados es una representación del ataque, la duración y la forma del acorde (número de notas, tono del cifrado en la voz superior y octava), mientras que las alturas concretas se heredan de los acordes de la canción de entrada.

Los pesos se entrenaron desde inicialización aleatoria por parte de Mix Directive, sin usar pesos preentrenados de terceros. El conjunto de entrenamiento consiste en MIDI de música cuyos derechos pertenecen al autor de Mix Directive y que se utilizó con plena titularidad. La model card afirma que los modelos no contienen ni reproducen esa música. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

## Capacidades

- Generación de líneas de bajo simbólicas (nota a nota) condicionadas por acordes, tonalidad, batería y voz principal en formato MIDI.
- Generación de partes de teclados: decide el momento del ataque, la duración y el voicing del acorde, tomando las alturas del cifrado armónico.
- Condicionamiento multimodal dentro del dominio musical simbólico (varias pistas MIDI como contexto).
- Trabajo sobre ventanas de ocho compases en 4/4 con resolución de semicorchea.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking), visión, audio ni procesamiento de lenguaje natural.
- Capacidades multilingües: no aplicables; el modelo no procesa texto.

## Casos de uso

- Sugerencia de línea de bajo dentro de Mix Directive: el modelo recibe los acordes, la tonalidad, la batería y la voz del proyecto MIDI y devuelve una parte de bajo editable, pensada como punto de partida para el usuario.
- Sugerencia de parte de teclados en la misma aplicación: genera ataques, duraciones y voicings coherentes con el cifrado armónico para que el usuario los ajuste después.
- Arreglo rápido de maquetas: permite obtener una base instrumental provisional en segundos dentro del flujo de la app, sin salir del DAW ni escribir la parte manualmente.
- Prototipado de ideas armónicas: el músico puede probar variantes de acompañamiento sobre una progresión existente y comparar resultados antes de grabar la versión definitiva.
- Educación musical: como herramienta de demostración de cómo se construyen voicings y patrones de bajo sobre una progresión dada, siempre dentro de la aplicación.
- Integración en el pipeline de descarga de la app: el cliente fija un commit concreto del repositorio y verifica el SHA-256 de cada archivo antes de cargarlo, lo que permite distribución reproducible y verificable del artefacto.
- Cualquier uso fuera de Mix Directive (servicios externos, plugins propios, investigación, fine-tuning) queda excluido por la licencia y no constituye un caso de uso permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (por ejemplo, precisión de notas, similitud con partes humanas o evaluaciones perceptuales) ni comparaciones cuantitativas con líneas base. La única referencia cualitativa del autor es que el ritmo generado no supera en calidad al de las partes basadas en reglas de la propia aplicación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; cada modelo pesa 26 MB en ONNX y tiene 6,4 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU integrada o dedicada moderna es suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier tarjeta con soporte ONNX Runtime, incluidas GTX/RTX de gama baja e iGPU.
- Opciones de despliegue: ONNX Runtime es la vía natural; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles. El tamaño del artefacto y la ventana de ocho compases sugieren una inferencia muy rápida, pero no se publican cifras.
- Requisito adicional: la aplicación verifica el SHA-256 de cada archivo contra un commit fijado, por lo que la integración debe respetar ese mecanismo de verificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mix Directive Part Writers (bajo/teclados) | 6,4 M por modelo | 8 compases 4/4 | Generacion de bajo y teclados MIDI | Propietaria, solo uso dentro de la app | ONNX en Hugging Face |
| Partes basadas en reglas de Mix Directive | no disponible | no disponible | Generacion de partes MIDI | Propietaria | Integradas en la app |
| Otros generadores de musica simbolica open source | no disponible | no disponible | Generacion MIDI | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparación cuantitativa con alternativas de la misma categoría; los datos de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria: la Mix Directive Part Writers Model License v1.0 reserva todos los derechos; usar los modelos fuera de la aplicación, redistribuirlos o construir sobre ellos no está permitido.
- Los pesos se publican exclusivamente para la descarga bajo demanda por parte de la app, no como recurso para la comunidad.
- La calidad rítmica es limitada según el propio autor: el modelo sigue los acordes, pero su ritmo no iguala al de las partes basadas en reglas de la aplicación.
- Ventana fija de ocho compases en 4/4 con resolución de semicorchea; no se documenta soporte para otras métricas ni para contextos más largos.
- El modelo de teclados no genera las alturas del acorde, sino solo ataque, duración y voicing a partir del cifrado; errores en los acordes de entrada se propagan directamente a la salida.
- No se documentan evaluaciones de sesgo, robustez ni tasas de alucinación; al ser un modelo simbólico, el riesgo relevante es la generación de partes musicalmente incoherentes, no la alucinación textual.
- No hay información sobre idiomas ni sobre rendimiento fuera del dominio de entrenamiento (música propiedad del autor).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia pública de uso externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MixDirective/mix-directive-part-writers
- Aplicación Mix Directive: https://mixdirective.example
- Licencia (referenciada en la model card): LICENSE.md dentro del repositorio
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
