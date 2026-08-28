# resoajoe/room-audio-ladder-nano

## Resumen

`room-audio-ladder-nano` es un paquete de dos modelos de clasificación de audio extremadamente pequeños, desarrollados por Joe Cox (resoajoe) y publicados bajo licencia MIT. Forma parte de una cascada de tres niveles (A0, A1, A2) orientada a la monitorización de audio en entornos sanitarios, aunque el autor advierte explícitamente de que se trata de un experimento y no de un dispositivo médico. El modelo resuelve dos tareas: detectar si un sonido evidencia la presencia de una persona en una habitación (A1, binario) y clasificar el tipo de evento sonoro en seis categorías (A2: alarma, vía aérea, voz, movimiento, instalación, peligro). Ambos modelos son redes neuronales pequeñas con aproximadamente 47 000 parámetros cada uno, exportadas a formato ONNX, y están diseñados para ejecutarse en dispositivos de borde con un único paso hacia adelante.

La relevancia de este modelo radica en su tamaño mínimo (187–188 KB) y su enfoque en la operativa hospitalaria, no en el diagnóstico. El autor mide explícitamente el impacto de un filtro de calidad de audio (A0) en la precisión de la cascada, demostrando que convierte algunos errores en rechazos, lo cual puede ser valioso en contextos clínicos donde una respuesta incorrecta es peor que ninguna. Sin embargo, el entrenamiento se realizó sobre ESC-50, un conjunto de sonidos ambientales generales, y la transferencia a audio hospitalario real no ha sido medida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (red neuronal pequeña, "arquitectura ordinaria" según el autor) |
| Parametros totales | 46 834 (person_evidence) y 47 094 (event_class) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de audio de 1 segundo a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación; el autor la describe como "ordinaria". Se trata de dos modelos independientes que operan en cascada: `person_evidence.onnx` (A1) realiza una clasificación binaria sobre si el sonido evidencia presencia de una persona, y `event_class.onnx` (A2) clasifica el evento en seis categorías. Ambos reciben como entrada un espectrograma de 64×64 calculado a partir de 1 segundo de audio mono a 16 kHz, mediante STFT con ventana de 256 muestras y solapamiento de 192, normalizado y redimensionado con OpenCV.

El entrenamiento se realizó sobre ESC-50, un conjunto de 2000 clips de sonido ambiental general, con clases proxy: por ejemplo, `clock_alarm` y `siren` representan alarmas de dispositivos, `door_wood_knock` representa entrada a la habitación, y `toilet_flush` o `washing_machine` representan ruido de instalaciones. Se utilizó validación cruzada de 5 pliegues siguiendo los pliegues oficiales de ESC-50, asegurando que clips de la misma grabación no se dividieran entre entrenamiento y prueba. Los pesos publicados se entrenaron con los pliegues 1–4 y se evaluaron en el pliegue 5. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el enfoque es puramente supervisado.

## Capacidades

- Clasificación binaria de presencia de persona en audio (A1), con precisión media de 0.813 en validación cruzada.
- Clasificación de eventos en seis categorías (A2): alarma, vía aérea, voz, movimiento, instalación y peligro, con precisión media de 0.680.
- Ejecución en un único paso hacia adelante, adecuada para inferencia en tiempo real en dispositivos de borde.
- Tamaño mínimo (187–188 KB) que permite despliegue en hardware muy limitado, incluyendo microcontroladores.
- Integración con ONNX Runtime, lo que facilita su uso en múltiples plataformas.
- No incluye capacidades de texto, visión, generación ni razonamiento; es exclusivamente clasificación de audio.

## Casos de uso

- Monitorización de ocupación de habitaciones en hospitales: el modelo A1 puede indicar si hay una persona presente en una habitación a partir del audio, ayudando a optimizar la asignación de personal o detectar ausencias inesperadas. Su pequeño tamaño permite ejecutarlo en sensores de bajo coste.
- Detección de alarmas de dispositivos médicos: A2 puede identificar la presencia de una alarma audible (clase `alarm`), lo que permite priorizar la respuesta del personal sin necesidad de análisis complejos.
- Clasificación de sonidos de instalaciones: la clase `facility` (entrenada con proxies como cisterna o lavadora) puede usarse para monitorizar ruidos de fontanería o equipamiento en entornos no clínicos, como hoteles o residencias.
- Investigación en audio ambiental: al ser un modelo pequeño y de código abierto, puede servir como punto de partida para experimentos de clasificación de sonidos en entornos controlados, siempre que se reentrene con datos específicos del dominio.
- Filtrado previo en pipelines de análisis de audio: la cascada A0–A1–A2 puede integrarse como un primer filtro para descartar grabaciones ininteligibles o irrelevantes antes de enviarlas a modelos más grandes, reduciendo costes computacionales.
- Prototipado de sistemas de respuesta a emergencias: la detección de voz o movimiento (clases `voice` y `movement`) puede activar alertas en entornos de cuidado, aunque el autor insiste en que esto es una observación acústica, no una inferencia clínica.

## Benchmarks y rendimiento

La model card reporta resultados de validación cruzada de 5 pliegues sobre ESC-50, comparados con un baseline "barato" (regresión logística multinomial sobre diez estadísticos simples, ~66 parámetros). No se proporcionan resultados frente a modelos grandes como PANNs o AST, y el autor advierte explícitamente que no son comparables.

| Rung | Nano (5-fold) | Baseline barato | Margen | Pliegues ganados |
|---|---|---|---|---|
| A1 person evidence | 0.813 ± 0.021 | 0.714 ± 0.023 | +0.099 ± 0.033 | 5/5 |
| A2 event class (6) | 0.680 ± 0.042 | 0.526 ± 0.036 | +0.153 ± 0.045 | 5/5 |

Además, se midió el efecto de un filtro de calidad de audio (A0) sobre la precisión de A2: con un 50% de grabaciones corruptas, la precisión de A2 fue de 0.569 en el conjunto mixto, 0.621 en la mitad limpia y 0.520 en la mitad corrupta. Un filtro perfecto elevaría la precisión a 0.621, un incremento de +0.052, pero a costa de convertir errores en rechazos. Los pesos publicados (entrenados en pliegues 1–4) obtienen 0.801 en A1 y 0.630 en A2 sobre el pliegue 5.

## Requisitos de hardware

- Modelos de ~47 000 parámetros y ~188 KB, por lo que la VRAM necesaria es despreciable; pueden ejecutarse en CPU sin GPU.
- Compatible con cualquier dispositivo que soporte ONNX Runtime, incluyendo Raspberry Pi, teléfonos móviles y microcontroladores con suficiente memoria.
- No se requieren GPUs específicas; una CPU moderna puede ejecutar ambos modelos en tiempo real con latencia de milisegundos.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), o conversión a otros formatos si se requiere (aunque no se proporcionan pesos en GGUF o safetensors).
- El preprocesado requiere SciPy y OpenCV, lo que añade dependencias ligeras.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la misma categoría (clasificación de audio en cascada con ~47k parámetros). Los modelos grandes de clasificación de audio ambiental, como PANNs (~80M parámetros) o AST, alcanzan 94–96% en ESC-50 completo, pero resuelven una tarea de 50 clases y no son comparables en tamaño ni propósito. El autor declara explícitamente que este modelo no compite con ellos. Por tanto, la comparativa se limita a los baselines internos descritos en la sección de benchmarks.

## Limitaciones y advertencias

- Entrenado exclusivamente en ESC-50, un conjunto de sonidos ambientales generales; la transferencia a audio hospitalario real no ha sido medida y se desconoce su rendimiento en ese dominio.
- No es un dispositivo médico ni está validado para uso clínico; no debe utilizarse para diagnóstico ni para tomar decisiones médicas.
- Las clases son proxies acústicas: `alarm` indica que un sonido de alarma es audible, no que exista un peligro; `airway` indica la presencia de un sonido tipo vía aérea, no que una persona esté enferma.
- El alcance se limita a operaciones (detección de eventos), no a inferencias sobre la condición de las personas.
- La precisión en el pliegue 5 (0.801 en A1, 0.630 en A2) es inferior a la media de validación cruzada, lo que sugiere cierta variabilidad entre pliegues.
- El filtro de calidad A0 no está incluido en este repositorio; se publica por separado y su beneficio real depende del equilibrio entre errores y rechazos en cada aplicación.
- Licencia MIT permite uso comercial, pero el autor recomienda encarecidamente medir el rendimiento en el entorno de despliegue antes de confiar en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/room-audio-ladder-nano
- Perfil del autor: https://huggingface.co/resoajoe
- Modelo relacionado (A0, audio-health-nano): https://huggingface.co/resoajoe/audio-health-nano
- GitHub del autor: https://github.com/resoajoe
