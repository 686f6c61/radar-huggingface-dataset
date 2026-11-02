# Reigningwet/wet-stems-hd

## Resumen

Wet Stems HD es una exportación ONNX optimizada de HT-Demucs v4 (Hybrid Transformer Demucs), el modelo de separación de fuentes musicales desarrollado por Simon Rouard, Francisco Massa y Alexandre Défossez en Meta AI. El modelo original se publicó junto al paper "Hybrid Transformers for Music Source Separation" (ICASSP 2023) y esta versión concreta ha sido preparada por el usuario Reigningwet para ejecutarse en el navegador mediante onnxruntime-web y WebGPU, como motor de la función "HD stem split" de la aplicación Wet Studio.

La tarea que resuelve es la separación de una mezcla musical estereofónica en cuatro pistas o stems: batería, bajo, otros instrumentos y voz. Se trata de un modelo puramente de audio, sin capacidades de texto ni lenguaje, por lo que su relevancia no está en el ámbito de los LLM sino en el procesamiento de audio en el cliente: permite dividir canciones sin enviar el audio a un servidor.

La exportación aquí descrita aplica constant folding para una forma de entrada fija y almacena los pesos en float16, lo que reduce el tamaño del repositorio a 0,2 GB (174 MB el archivo del modelo) y permite su carga en WebGPU. El modelo mantiene una fidelidad de aproximadamente 90 dB respecto a la exportación original de la que deriva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HT-Demucs v4 (Hybrid Transformer Demucs): U-Net con capas transformer híbridas en dominio temporal y espectral |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 343.980 muestras (7,8 s a 44,1 kHz estéreo) |
| Tipos de cuantización | float16 (pesos almacenados en FP16); entrada y salida en float32 |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportación constant-folded para forma de entrada fija) |

## Arquitectura y entrenamiento

HT-Demucs combina una arquitectura U-Net con bloques transformer que operan de forma híbrida sobre representaciones temporales (forma de onda) y espectrales (espectrogramas), de ahí el nombre "Hybrid Transformer". El modelo original fue entrenado por Meta AI para separación de fuentes musicales y publicado con licencia MIT en el repositorio facebookresearch/demucs. Los detalles concretos sobre volumen de datos de entrenamiento, composición del dataset y uso de técnicas de ajuste fino no están disponibles en la información proporcionada.

La versión de este repositorio no reentrena el modelo, sino que parte de la exportación ONNX de StemSplitio/htdemucs-onnx (también MIT) y aplica dos transformaciones: constant folding para fijar la forma de entrada y conversión de pesos a float16. El resultado es un grafo ONNX de 174 MB que carga en WebGPU. La interfaz es determinista: entrada `mix` de tipo float32 con forma `[1, 2, 343980]` (audio estéreo de 7,8 s a 44,1 kHz) y salida `stems` de tipo float32 con forma `[1, 4, 2, 343980]`, ordenada como batería, bajo, otros y voz. Para audio más largo, la model card indica que se procesa en ventanas de 7,8 s con solapamiento de un cuarto y cross-fade entre ventanas.

## Capacidades

- Separación de fuentes musicales en cuatro stems: batería, bajo, otros y voz.
- Procesamiento de audio estéreo a 44,1 kHz en ventanas de 7,8 s con solapamiento y cross-fade para pistas completas.
- Inferencia en el navegador mediante onnxruntime-web y WebGPU, sin backend servidor.
- Entrada y salida con formas y tipos fijos, lo que simplifica la integración en pipelines web.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio de entrada distinto de la mezcla musical.
- No dispone de capacidades multilingües por ser un modelo puramente de audio.

## Casos de uso

- Aplicaciones web de edición musical: integrar la separación de stems directamente en el navegador con WebGPU, sin subir el audio a un servidor, usando ventanas de 7,8 s con solapamiento.
- Karaoke y remezclas: aislar la pista de voz (índice 3 de la salida) para generar versiones instrumentales o extraer la voz para remezclar.
- Producción musical y DJ: obtener stems de batería, bajo y otros para samplear o recomponer temas en herramientas de escritorio o web.
- Educación musical: mostrar a estudiantes las pistas individuales de una canción para analizar arreglos y mezcla.
- Preprocesado para transcripción o análisis: separar la voz del resto de instrumentos antes de alimentar un sistema de reconocimiento de voz o de transcripción musical.
- Herramientas de accesibilidad: generar versiones sin voz o con instrumentales aislados para distintos perfiles de usuario.
- Prototipado rápido en el cliente: dado el tamaño de 174 MB y el formato ONNX, permite demos de separación de fuentes que se ejecutan íntegramente en el navegador del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la salida de esta exportación coincide con la exportación original de la que deriva hasta aproximadamente 90 dB, lo que es una medida de fidelidad numérica respecto al modelo fuente, no un benchmark de calidad de separación (SDR, SIR, SAR).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el archivo del modelo ocupa 174 MB en FP16, por lo que la huella de pesos es reducida, aunque el grafo ONNX y los buffers intermedios añaden consumo adicional no cuantificado en la información disponible.
- GPU recomendadas: no disponibles; el modelo está diseñado para WebGPU en el navegador, por lo que depende del soporte WebGPU del navegador y de la GPU del cliente.
- Compatibilidad con GPU de consumo: probable en GPUs con soporte WebGPU, pero no se proporcionan modelos concretos ni cifras de VRAM.
- Opciones de despliegue: onnxruntime-web con WebGPU (diseño principal); al ser un modelo ONNX estándar, también podría ejecutarse con otros runtimes ONNX, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Contexto de entrada | Licencia | Formato |
|---|---|---|---|---|---|
| Wet Stems HD (esta ficha) | HT-Demucs v4, export ONNX FP16 | 4 (drums, bass, other, vocals) | Ventana fija de 7,8 s a 44,1 kHz | MIT | ONNX |
| HT-Demucs v4 original (facebookresearch/demucs) | HT-Demucs v4 | 4 | Configurable | MIT | PyTorch |
| Exportación StemSplitio/htdemucs-onnx | HT-Demucs v4, export ONNX | 4 | Configurable según export | MIT | ONNX |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de calidad entre estas variantes.

## Limitaciones y advertencias

- Modelo de audio especializado: no procesa texto, no tiene razonamiento, tool calling ni capacidades de agente; no debe evaluarse como un LLM.
- Ventana de entrada fija de 7,8 s: el audio más largo requiere segmentación con solapamiento y cross-fade, lo que puede introducir artefactos en las transiciones si no se ajusta correctamente.
- Solo entrada estéreo a 44,1 kHz con forma fija `[1, 2, 343980]`; audio mono, otras frecuencias de muestreo u otras duraciones deben remuestrearse o adaptarse externamente.
- Calidad de separación no documentada con métricas objetivas (SDR/SIR/SAR) en la información disponible; no se puede afirmar su rendimiento frente a otras variantes.
- Dependencia de WebGPU: la ejecución en navegador requiere soporte de WebGPU, lo que limita la compatibilidad a navegadores y dispositivos que lo implementen.
- Riesgo de artefactos y alucinaciones de audio (separación imperfecta, sangrado entre stems) inherente a la separación de fuentes; no se documentan sesgos específicos.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a los autores originales de HT-Demucs y a la exportación intermedia según los términos de sus respectivas licencias MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reigningwet/wet-stems-hd
- Repositorio original de Demucs (Meta AI): https://github.com/facebookresearch/demucs
- Exportación ONNX de origen: https://huggingface.co/StemSplitio/htdemucs-onnx
- Aplicación Wet Studio: https://reigningwet.com/pages/wet-studio
- Paper de referencia: Rouard, Massa, Défossez, "Hybrid Transformers for Music Source Separation", ICASSP 2023
