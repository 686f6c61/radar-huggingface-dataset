# sebekblessing/qwen-image-2.1-qnn-8elite

## Resumen

Qwen-Image 2.1 QNN 8 Elite es una conversión móvil del modelo de difusión texto-a-imagen Qwen-Image 2.1, empaquetada como binarios de contexto QNN para la unidad neural Hexagon v79 del SoC Snapdragon 8 Elite (por ejemplo, iQOO 13). El artefacto lo publica el usuario sebekblessing y no procede de un desarrollo propio, sino de un pipeline de conversión sobre los pesos originales de Qwen: exportación a ONNX, cuantización (4 bits en bloques de 32 para el modelo de dibujo, 8 bits por canal con rotación de Hadamard para el lector de prompts) y compilación para el acelerador NPU de Qualcomm.

El modelo cubre dos tareas: generación de imágenes de 768x768 a partir de una descripción textual en 4 pasos y edición de imágenes de 768x768 a partir de una instrucción. Incorpora el LoRA turbo de Viggle de 4 pasos fusionado en los pesos, lo que reduce drásticamente el número de pasos de muestreo frente a un modelo de difusión convencional. El repositorio, de 29,3 GB, incluye dos variantes de descarga: Standard (lector de prompts de 8B, edición de imágenes, 14,8 GB) y Small (lector de 2B más un proyector entrenado con 35.000 prompts, solo generación, 8,2 GB).

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue de un modelo generativo de gran tamaño en hardware móvil de consumo, con cifras concretas de latencia (unos 80 segundos por imagen, unos 3 minutos por edición) y de memoria (unos 2,6 GB durante el dibujado); por otro, advierte de que la licencia es estrictamente no comercial (Qwen Research License Agreement), lo que condiciona cualquier evaluación orientada a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con lector de prompts basado en Qwen3-VL (torre de vision + LM), cuantizado y compilado como binarios QNN para Hexagon v79 |
| Parametros totales | No disponible (el repositorio no publica el recuento; el lector Standard corresponde al LM de Qwen3-VL-8B y el Small al de Qwen3-VL-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo de dibujo: 4 bits en bloques de 32; lector de prompts: 8 bits por canal con rotacion de Hadamard; tablas de cuantizacion en formato `.raw` |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License Agreement (`qwen-research`), uso exclusivamente no comercial |
| Formato de pesos | Binarios QNN (`.bin`) y tablas de cuantizacion `.raw`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La pieza central es el modelo de difusion de Qwen-Image 2.1, cuyos pesos se han exportado a ONNX, cuantizado y compilado para la NPU Hexagon v79. El repositorio reparte el modelo de dibujo en 32 ficheros (`sp0.bin` a `sp31.bin`), uno por bloque, lo que permite cargarlos de forma secuencial y mantener el pico de memoria en torno a 2,6 GB durante la generación. Sobre estos pesos se ha fusionado el LoRA turbo de Viggle de 4 pasos, de modo que el muestreo se resuelve en 4 pasos en lugar de la trayectoria completa de un modelo de difusión estándar.

El lector de prompts es un componente Qwen3-VL: en la variante Standard se usa el modelo de lenguaje de 8B (`r0.bin` a `r3.bin`) más la torre de visión (`vis.bin`) para las ediciones; en la variante Small se usa el LM de 2B (`s0.bin`, `s1.bin`) junto con un proyector (`proj.bin`) que traduce las características del 2B a las del 8B, entrenado específicamente sobre 35.000 prompts. El codificador y decodificador de imágenes (`enc.bin`, `dec.bin`) corresponden a `taeqi2_1`. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución de 768x768 en 4 pasos de muestreo.
- Edición de imágenes guiada por instrucción a 768x768 (solo en la variante Standard, que incluye la torre de visión `vis.bin`).
- Comprensión multimodal de la instrucción mediante un lector Qwen3-VL de 8B (Standard) o de 2B con proyector (Small).
- Ejecución íntegra en la NPU Hexagon v79 de un Snapdragon 8 Elite, sin depender de servidores externos.
- Carga secuencial de bloques para limitar el uso de memoria en dispositivo.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de audio.

## Casos de uso

- Generación de imágenes en el propio teléfono sin conexión: la variante Small (8,2 GB) permite crear imágenes de 768x768 a partir de un prompt en unos 80 segundos, útil en aplicaciones de creación rápida donde no se quiere enviar datos a la nube.
- Edición fotográfica asistida por instrucción: con la variante Standard, el usuario describe el cambio deseado y el modelo lo aplica sobre una imagen de 768x768 en unos 3 minutos, adecuado para retoques puntuales en movilidad.
- Prototipado de interfaces generativas en Android: el repositorio incluye los scripts de construcción en `build/`, lo que permite reproducir el pipeline ONNX → cuantización → QNN y evaluar variantes de cuantización antes de integrarlas en una app.
- Investigación sobre despliegue de difusión en NPU: las cifras publicadas (4 pasos, 2,6 GB de pico, 80 s por imagen) sirven como referencia para estudios de eficiencia en aceleradores móviles.
- Demostraciones y pruebas de concepto en ferias o entornos sin conectividad: al ejecutarse localmente en un iQOO 13 u otro dispositivo con Snapdragon 8 Elite, no requiere backend.
- Evaluación comparativa de lectores de prompts: la existencia de las variantes Standard y Small con un proyector entrenado sobre 35.000 prompts permite medir la pérdida de calidad al sustituir el lector de 8B por el de 2B.
- Integración en la app Anima para Android: el `manifest.json` con tamaños y SHA-256 está pensado para que la app descargue y verifique los ficheros automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son los de latencia y memoria en dispositivo que declara el autor: aproximadamente 1 minuto 20 segundos por imagen, unos 3 minutos por edición, lectura del prompt en torno a 2 segundos con la variante Small frente a unos 7 segundos con la Standard, y un pico de memoria de aproximadamente 2,6 GB durante el dibujado.

## Requisitos de hardware

- Hardware obligatorio: SoC Snapdragon 8 Elite con NPU Hexagon v79 (el autor cita el iQOO 13 como dispositivo de referencia). No es ejecutable en GPU de escritorio ni en CPU convencional tal como se distribuye.
- VRAM estimada: no aplica; el consumo relevante es memoria del dispositivo, con un pico de unos 2,6 GB durante la generación gracias a la carga secuencial de bloques.
- Almacenamiento: 14,8 GB para la variante Standard y 8,2 GB para la Small, sobre un repositorio total de 29,3 GB.
- GPU recomendadas: no disponible; el artefacto está compilado exclusivamente para la NPU de Qualcomm.
- ¿Cabe en GPU de consumo? No en el formato distribuido; los binarios QNN no son portables a CUDA, ROCm ni Metal.
- Opciones de despliegue: la app Anima para Android (descarga y verificación mediante `manifest.json`); los scripts de `build/` permiten regenerar los binarios desde los pesos originales.
- Latencia y throughput: aproximadamente 80 segundos por imagen de 768x768 en 4 pasos y aproximadamente 180 segundos por edición; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen-Image 2.1 QNN 8 Elite (esta ficha) | No disponible (lector 8B u 2B) | No disponible | 768x768 | Qwen Research, no comercial | NPU Hexagon v79 (Snapdragon 8 Elite) |
| Qwen-Image 2.1 (original) | No disponible en la informacion | No disponible | No disponible | Qwen Research, no comercial | GPU/servidor |
| Qwen-Image 2.1 + LoRA turbo de Viggle | No disponible en la informacion | No disponible | No disponible | Segun el modelo base | GPU/servidor |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida frente a los modelos originales; el autor advierte únicamente de que las imágenes pueden diferir ligeramente de las de los modelos de origen.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: Qwen Research License Agreement; cualquier uso en producto o servicio comercial queda excluido.
- Dependencia total de hardware: solo funciona en Snapdragon 8 Elite con Hexagon v79; no hay ruta de ejecución en GPU de escritorio ni en otros SoC.
- Calidad potencialmente degradada: la cuantización a 4 bits en bloques de 32 para el modelo de dibujo y a 8 bits para el lector puede introducir diferencias respecto a los pesos originales, como reconoce el autor.
- La variante Small no soporta edición de imágenes, solo generación a partir de prompt.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento con prompts en castellano.
- Riesgo de alucinación visual y de fidelidad limitada al prompt inherente a los modelos de difusión, agravado por la cuantización agresiva.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Latencia alta para uso interactivo: 80 segundos por imagen y 3 minutos por edición en el dispositivo de referencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- El autor no publica recuento de parámetros, contexto ni composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sebekblessing/qwen-image-2.1-qnn-8elite
- Modelo original Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- LoRA turbo de Viggle: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- App Anima para Android: https://github.com/adiirfan/anima-android
- Scripts de construccion: `build/README.md` dentro del repositorio del modelo
- Licencia: fichero `LICENSE` y `NOTICE` del repositorio
