# KGAudioLab/InstVELA-models-onnx

## Resumen

InstVELA M01Preview es un instrumento virtual neuronal basado en navegador para cuerdas frotadas (violín, viola, violonchelo y contrabajo) que convierte ficheros MIDI en audio de 48 kHz con expresión de interpretación: movimiento de afinación, dinámica intra-nota y articulaciones (sostenido, spiccato y pizzicato). Lo desarrolla KGAudioLab y se distribuye en formato ONNX para ejecutarse con ONNX Runtime Web sobre WebGPU, con retroceso a WebAssembly por grafo. El repositorio ocupa 0,2 GB y contiene los cuatro paquetes de instrumento más una demo Vite con Node.js 20 o superior.

El modelo sigue el diseño de síntesis por etapas de Melisma: un VAE con vocoder neural source-filter, un generador residual de F0 y un generador acústico. En inferencia, el generador residual de F0 realiza la afinación y la sonoridad a partir de la partitura, el generador acústico produce la secuencia latente de 48 dimensiones y el vocoder decodifica esa secuencia a onda de audio a 48 kHz. Los cuatro instrumentos usan la configuración M01 S, con una fuente armónica más ancha en el vocoder del contrabajo.

Su relevancia es práctica: permite renderizar interpretaciones expresivas de cuerdas íntegramente en el dispositivo del usuario, sin enviar el MIDI ni el audio a un servidor. En un MacBook Air con Apple M5 y 32 GB, los tiempos medianos de renderizado de 27,5 segundos de audio son de 7,0 s (violín), 7,2 s (viola), 7,3 s (violonchelo) y 11,9 s (contrabajo), es decir, entre 2,3 y 3,9 veces más rápido que el tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de síntesis por etapas: VAE con vocoder neural source-filter, generador residual de F0 y generador acústico; grafo ONNX con STFT compleja procesada por ResNet 1D |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio condicionado por partitura MIDI, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la interfaz de la demo está en inglés y chino simplificado) |
| Licencia | instvela-model-license (etiqueta `license: other`, texto en `LICENSE`) |
| Formato de pesos | ONNX (grafos para ONNX Runtime Web; ejecución con WebGPU y retroceso a WebAssembly) |
| Frecuencia de muestreo de salida | 48 kHz |
| Dimensión latente | 48 |
| Tamaño del repositorio | 0,2 GB |
| Instrumentos incluidos | Violín, viola, violonchelo, contrabajo |

## Arquitectura y entrenamiento

M01Preview se organiza en tres etapas de entrenamiento: (1) VAE y vocoder, (2) generador residual de F0 y (3) generador acústico. En la primera etapa, el codificador de entrenamiento proyecta una STFT compleja mediante una ResNet 1D hasta una posterior gaussiana de 48 dimensiones; el vocoder neural source-filter decodifica esos latentes de 48 dimensiones a audio de 48 kHz. En inferencia, la partitura condiciona dos flujos separados: el flujo residual de F0, que determina afinación y sonoridad, y el flujo acústico, que produce la secuencia latente. Tanto el flujo acústico como el vocoder reciben F0 y sonoridad como entrada.

Los cuatro paquetes de instrumento emplean la configuración M01 S; el contrabajo incorpora una fuente armónica más ancha en el vocoder. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un modelo de síntesis de audio). Los renders de entrenamiento de la versión v1 usaron sostenido para el trémolo, de modo que las teclas de conmutación (keyswitches) heredadas de trémolo seleccionan sostenido. La inferencia ignora los mensajes MIDI Control Change (CC).

## Capacidades

- Síntesis MIDI a audio de cuerdas frotadas a 48 kHz para violín, viola, violonchelo y contrabajo.
- Expresión interpretativa: movimiento de afinación controlable mediante el parámetro «Pitch expression» y dinámica dentro de la nota.
- Articulaciones mediante keyswitches MIDI opcionales: sostenido, spiccato y pizzicato (en ese orden); las notas comienzan en sostenido y cada keyswitch cambia la articulación hasta el siguiente.
- Variación de interpretación por semilla: cambiar la semilla en «Advanced settings» genera otra toma de la misma parte.
- Renderizado local en el navegador con ONNX Runtime Web sobre WebGPU, con retroceso automático a WebAssembly por grafo e indicador del backend en uso.
- Verificación de integridad: comprobación de hashes de los ficheros del modelo contra el manifiesto de cada paquete y comprobación de referencia al arranque antes de usar un grafo en WebGPU.
- Procesamiento MIDI: tempo y compás fijos, una nota musical a la vez, acortamiento de solapamientos y conservación de la nota más aguda en cada ataque compartido, con marcado del material eliminado en el piano roll.
- Mapa de afinación opcional en JSON para ficheros con teclas personalizadas.
- Exportación del audio generado (MP3 mono a 320 kbps en las pruebas citadas).
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; no es un modelo de lenguaje.

## Casos de uso

- Maquetas de arreglos de cuerda en producción musical: el compositor carga un MIDI con tempo y compás fijos, elige el instrumento y obtiene una interpretación expresiva a 48 kHz en segundos, sin depender de muestras pregrabadas ni de sesiones de estudio.
- Iteración rápida sobre la expresividad de una parte: cambiar la semilla o el parámetro de expresión de afinación permite comparar varias tomas de la misma frase y elegir la más adecuada antes de grabar músicos reales.
- Herramientas web de creación musical sin backend: al ejecutarse con ONNX Runtime Web y WebGPU, el renderizado ocurre en el dispositivo del usuario; el MIDI, los ajustes y el audio permanecen en el navegador hasta que se guardan localmente, lo que simplifica el cumplimiento de privacidad.
- Práctica y educación musical: un estudiante puede escuchar cómo suena una parte escrita para viola o violonchelo con articulaciones realistas (sostenido, spiccato, pizzicato) y ajustar la digitación o la dinámica en el piano roll.
- Prototipado de librerías de samples y demos de producto: los cuatro paquetes permiten generar ejemplos de audio coherentes para violín, viola, violonchelo y contrabajo con un mismo flujo de trabajo y sin infraestructura de servidor.
- Renderizado offline en portátiles: tras el arranque del servidor Vite local, la aplicación, el runtime y los modelos se sirven localmente, de modo que se puede renderizar sin conexión; los tiempos medidos (2,3 a 3,9 veces más rápido que el tiempo real en un M5) hacen viable procesar frases completas de forma interactiva.
- Integración en aplicaciones de notación o DAW basadas en web: el manifiesto por paquete, la configuración `config.json` y las URLs `?models=<modelo>` permiten incrustar instrumentos concretos en un selector y controlar qué entradas aparecen en el menú.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son tiempos de renderizado, no métricas de calidad objetiva. Se midieron en un MacBook Air con Apple M5 y 32 GB de memoria, en Chrome headless 157.0.8103.51 sobre macOS 27.0, con WebGPU ejecutando los cinco grafos ONNX, modelos ya cargados, cola de modelo de 3 segundos y codificación MP3 mono a 320 kbps; son la mediana de tres renderizados tras un calentamiento, sobre una frase de prueba de 57 notas transportada al registro de cada instrumento.

| Instrumento | Audio renderizado | Tiempo mediano | Velocidad |
|---|---:|---:|---:|
| Violín | 27,5 s | 7,0 s | 3,9× tiempo real |
| Viola | 27,5 s | 7,2 s | 3,8× tiempo real |
| Violonchelo | 27,5 s | 7,3 s | 3,8× tiempo real |
| Contrabajo | 27,5 s | 11,9 s | 2,3× tiempo real |

No se han publicado resultados de benchmarks de calidad (por ejemplo, MOS o métricas de fidelidad espectral) en la información disponible. Las cifras citadas son anteriores a la reverberación estéreo Hall.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 0,2 GB, pero no se desglosa el tamaño por grafo ni el consumo de memoria en GPU.
- GPU recomendadas: no se especifican modelos concretos; las pruebas citadas usan la GPU integrada de un Apple M5 mediante WebGPU.
- Compatibilidad con GPU de consumo: no confirmada explícitamente. Al ejecutarse en el navegador con WebGPU y retroceso a WebAssembly, no requiere una GPU dedicada, pero no hay datos de rendimiento en RTX 4090, A100 o H100.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU o WebAssembly dentro del navegador; demo con Vite y Node.js 20 o superior; descarga de los pesos con la CLI de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 2,3 a 3,9 veces más rápido que el tiempo real según instrumento, en el hardware y configuración de prueba indicados; el contrabajo es el más lento por su vocoder con fuente armónica más ancha.
- Almacenamiento: 0,2 GB para el repositorio completo; el audio de salida se genera y codifica en un worker del navegador.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto, benchmarks ni licencia de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, el modelo se sitúa en la categoría de síntesis neuronal de audio condicionada por partitura (MIDI a audio) ejecutada en el navegador; el autor cita el diseño de síntesis por etapas de Melisma como base arquitectónica, pero no se aportan cifras de Melisma ni de otros sistemas para contrastar.

| Criterio | InstVELA M01Preview | Alternativas |
|---|---|---|
| Tipo | MIDI a audio de cuerdas, cuatro instrumentos | no disponible |
| Parámetros | no disponible | no disponible |
| Contexto | no aplica | no disponible |
| Ejecución | Navegador (ONNX Runtime Web, WebGPU/WebAssembly) | no disponible |
| Licencia | instvela-model-license | no disponible |
| Rendimiento | 2,3–3,9× tiempo real (Apple M5) | no disponible |

## Limitaciones y advertencias

- Licencia `instvela-model-license` con etiqueta `other`: las condiciones exactas de uso comercial no se detallan en la información disponible; es imprescindible revisar el fichero `LICENSE` antes de integrarlo en un producto.
- Renderiza una sola nota a la vez: los solapamientos se acortan y en ataques compartidos solo se conserva la nota más aguda, con el material eliminado marcado en el piano roll; esto puede alterar dobles cuerdas y acordes.
- Requiere MIDI con tempo y compás fijos; la inferencia ignora los mensajes Control Change (CC), por lo que no responde a modulación, expresión o pedal enviados por CC.
- Las teclas de conmutación heredadas de trémolo seleccionan sostenido, porque los renders de entrenamiento de la v1 usaron sostenido para el trémolo; los ficheros con teclas personalizadas necesitan un mapa de afinación en JSON.
- Solo cubre cuatro instrumentos de cuerda frotada; no genera viento, percusión ni teclados.
- No es un modelo de lenguaje: carece de capacidades de texto, razonamiento, código, tool calling o agentes, y no admite entrada de audio ni visión.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad subjetiva; al ser un modelo generativo de audio, la variación por semilla puede producir tomas no deseadas que requieren selección manual.
- Las cifras de rendimiento proceden de un único hardware (Apple M5, 32 GB) y un único navegador; el rendimiento en otras GPU, sistemas operativos o con WebAssembly en lugar de WebGPU no está medido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.
- El modelo se distribuye como M01Preview, lo que sugiere una versión preliminar sujeta a cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KGAudioLab/InstVELA-models-onnx
- Demo local tras el arranque del servidor Vite: http://localhost:4173/
- Manifiesto del violín: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/models/m01-violin-onnx-v1/manifest.json
- Manifiesto de la viola: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/models/m01-viola-onnx-v1/manifest.json
- Manifiesto del violonchelo: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/models/m01-cello-onnx-v1/manifest.json
- Manifiesto del contrabajo: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/models/m01-double-bass-onnx-v1/manifest.json
- Configuración de la demo: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/demo/public/config.json
- Licencia: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/LICENSE
- README en chino simplificado: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/README.zh-CN.md
- Diagrama de arquitectura: https://huggingface.co/KGAudioLab/InstVELA-models-onnx/blob/main/assets/m01-architecture.png
