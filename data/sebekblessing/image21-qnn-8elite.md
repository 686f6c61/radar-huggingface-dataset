# sebekblessing/image21-qnn-8elite

## Resumen

Image 2.1 turbo para la unidad neuronal Snapdragon 8 Elite es una conversión móvil del modelo de difusión Qwen-Image 2.1, publicada por el usuario sebekblessing en Hugging Face. El modelo toma como base Qwen-Image 2.1 y le fusiona el LoRA turbo de 4 pasos de Viggle, y posteriormente compila los pesos como binarios de contexto QNN para la NPU Hexagon v79 del Snapdragon 8 Elite (por ejemplo, el iQOO 13). Genera imágenes de 768x768 a partir de un prompt en 4 pasos y permite editar una imagen de 768x768 mediante una instrucción textual.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue en dispositivo (on-device), no de un modelo entrenado desde cero: los pesos originales se convierten a ONNX, se cuantizan (4 bits en bloques de 32 para el modelo de dibujo, 8 bits por canal con rotación de Hadamard para el lector de prompts) y se compilan para la NPU. El repositorio ocupa 23,0 GB e incluye dos variantes de descarga que comparten el modelo de dibujo: Standard (lector de 8B con edición de imágenes, 14,8 GB) y Small (lector de 2B más un proyector, solo prompts, 8,2 GB).

El modelo está pensado para la aplicación Anima para Android, que descarga los ficheros automáticamente. La licencia es la Qwen Research License Agreement, lo que restringe el uso a fines no comerciales. No se dispone de datos de benchmarks, idiomas soportados ni parámetros totales en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (Qwen-Image 2.1) con lector de prompts basado en Qwen3-VL (8B o 2B), compilado como binarios QNN para Hexagon v79 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en bloques de 32 (modelo de dibujo); 8 bits por canal con rotacion de Hadamard (lector de prompts) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | Binarios QNN (`.bin`), tablas `.raw` y tokenizer JSON; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión de Qwen-Image 2.1, un modelo de difusión para texto a imagen, al que se le ha fusionado el LoRA turbo de 4 pasos de Viggle, reduciendo el número de pasos de muestreo necesarios. La canalización incluye un lector de prompts basado en el modelo de lenguaje de Qwen3-VL-8B (o Qwen3-VL-2B en la variante Small), una torre de visión (`vis.bin`) para la edición de imágenes, el modelo de dibujo dividido en 32 bloques (`sp0.bin` a `sp31.bin`) y un codificador/decodificador de imágenes (`enc.bin`, `dec.bin`) del tipo taeqi2_1.

El proceso de conversión consistió en transformar los pesos a ONNX, cuantizarlos y compilarlos para la NPU Hexagon v79. En la variante Small, el proyector `proj.bin` mapea las características del lector de 2B a las del de 8B, y fue entrenado sobre 35.000 prompts. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. El autor advierte que las imágenes generadas pueden diferir ligeramente de las de los modelos originales.

## Capacidades

- Generación de texto a imagen: produce imágenes de 768x768 a partir de un prompt en 4 pasos.
- Edición de imágenes: modifica una imagen de 768x768 a partir de una instrucción textual (solo en la variante Standard).
- Lector de prompts multimodal: utiliza el modelo de lenguaje de Qwen3-VL-8B o Qwen3-VL-2B para interpretar el prompt.
- Variante Small: lector de 2B con proyector entrenado sobre 35.000 prompts, con resultados muy cercanos a Standard y lectura del prompt en aproximadamente 2 s frente a unos 7 s.
- Ejecución en dispositivo: compilado para la NPU Hexagon v79 del Snapdragon 8 Elite.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de edición por instrucción; no se mencionan visión general, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en el móvil sin conexión: la aplicación Anima descarga los binarios y ejecuta el modelo en la NPU del Snapdragon 8 Elite, generando una imagen de 768x768 en aproximadamente 1 min 20 s sin enviar datos a la nube.
- Edición de fotos por instrucción en dispositivo: la variante Standard permite modificar una imagen de 768x768 con una orden textual, con un tiempo de aproximadamente 3 min por edición, adecuado para retoques puntuales con privacidad local.
- Prototipado de aplicaciones Android con IA generativa: los scripts de `build/` permiten reconstruir los binarios desde los pesos originales, útil para desarrolladores que quieran adaptar el pipeline a otros dispositivos Snapdragon.
- Demostraciones de texto a imagen en ferias o entornos sin red: al ejecutarse íntegramente en el dispositivo, el modelo funciona sin conectividad y con una huella de memoria de unos 2,6 GB durante el dibujo.
- Investigación sobre cuantización y compilación para NPU: el repositorio documenta la conversión a ONNX, la cuantización a 4 y 8 bits y la compilación QNN, lo que sirve como referencia técnica para portar modelos de difusión a Hexagon.
- Evaluación comparativa de lectores de prompts: la variante Small (2B más proyector) frente a Standard (8B) permite medir el compromiso entre latencia y calidad de imagen en un mismo modelo de dibujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en la NPU Hexagon v79 del Snapdragon 8 Elite y necesita aproximadamente 2,6 GB de memoria durante el dibujo, ya que los ficheros se cargan uno a uno.
- GPU recomendadas: no aplica; no se ejecuta en GPU de escritorio con este formato.
- Cabe en GPU de consumo: no disponible; los binarios QNN están compilados específicamente para Hexagon v79.
- Almacenamiento: repositorio de 23,0 GB; descarga Standard de 14,8 GB y descarga Small de 8,2 GB.
- Opciones de despliegue: aplicación Anima para Android (https://github.com/adiirfan/anima-android); scripts de construcción en `build/` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: aproximadamente 1 min 20 s por imagen y aproximadamente 3 min por edición en el dispositivo; lectura del prompt en unos 7 s con el lector de 8B y unos 2 s con el de 2B.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Image 2.1 turbo QNN 8 Elite (este modelo) | no disponible | no disponible | Binarios QNN | Qwen Research (no comercial) | Hugging Face, 23,0 GB |
| Qwen-Image 2.1 (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face (Qwen/Qwen-Image-2.1) |
| Qwen-Image 2.1 + Viggle turbo LoRA | no disponible | no disponible | no disponible | no disponible | Hugging Face (Viggle/Qwen-Image-2.1-viggle-turbo) |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso exclusivamente no comercial; es necesario revisar LICENSE y NOTICE antes de cualquier despliegue.
- Las imágenes generadas pueden diferir ligeramente de las producidas por los modelos originales debido a la cuantización y a la fusión del LoRA.
- El modelo está compilado específicamente para la NPU Hexagon v79 del Snapdragon 8 Elite; no es portable a otras NPU ni a GPU sin recompilar.
- La edición de imágenes solo está disponible en la variante Standard (14,8 GB); la variante Small se limita a generación desde prompt.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.
- Los tiempos indicados (1 min 20 s por imagen, 3 min por edición) son estimaciones del autor en un dispositivo concreto y pueden variar según el modelo de teléfono y la carga del sistema.

## Enlaces

- Hugging Face: https://huggingface.co/sebekblessing/image21-qnn-8elite
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA turbo de Viggle: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Aplicación Anima para Android: https://github.com/adiirfan/anima-android
- Scripts de construcción: `build/README.md` dentro del repositorio
