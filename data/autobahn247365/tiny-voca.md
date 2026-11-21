# autobahn247365/tiny-voca

## Resumen

tiny-voca es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por el usuario autobahn247365 (con código y dataset atribuidos a n4ze3m). Se trata de un modelo extremadamente compacto: 4.537.291 parámetros en total, incluyendo el generador de forma de onda, entrenado desde cero sobre aproximadamente 18 horas de voz sintética. Su propuesta de valor es la eficiencia: según el autor, se ejecuta unas 70 veces más rápido que el tiempo real sobre cuatro hilos de CPU, lo que lo hace apto para despliegue en navegador, dispositivos móviles y entornos sin GPU.

El modelo ofrece dos voces en inglés americano, F2 (femenina) y M2 (masculina), y produce audio mono a 24 kHz. La entrada de texto se convierte a fonemas mediante el fonemizador `dizione`, también del mismo autor, y la salida es una forma de onda generada directamente por el modelo. No incorpora pesos preentrenados de terceros: se entrenó desde cero.

Es relevante ahora porque demuestra que es posible obtener TTS inteligible con una huella de apenas 18 MB en float32 (21,4 MB en ONNX) y licencia Apache-2.0, lo que facilita su integración en aplicaciones de accesibilidad, asistentes locales o interfaces embebidas donde los modelos TTS convencionales de cientos de millones de parámetros resultan inviables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con generador de forma de onda; detalles de arquitectura no especificados) |
| Parametros totales | 4.537.291 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de fonemas por llamada; hasta 32 segundos de audio por uttancia |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (inglés americano) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32), ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que incluye un generador de forma de onda y que opera sobre secuencias de fonemas con marcas de acentuación (stress: 0 ninguna, 1 primaria, 2 secundaria). El modelo recibe identificadores de fonema y valores de stress, junto con parámetros de control de voz, velocidad, desplazamiento de tono y rango de tono, y devuelve directamente la forma de onda a 24 kHz junto con las duraciones por token en tramas de 256 muestras. No se especifica si emplea un transformer, un modelo convolucional o una arquitectura híbrida.

El entrenamiento se realizó desde cero sobre aproximadamente 18 horas de voz sintética, según indica el autor, sin pesos preentrenados. No se documentan en la información proporcionada detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia a `n4ze3m/tiny-voca`), ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se describen innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés americano a partir de texto, con conversión previa a fonemas mediante `dizione`.
- Dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Control de velocidad de habla (`speed`), desplazamiento de tono (`pitch_shift`, donde 0,058 equivale aproximadamente a un semitono) y rango de tono (`pitch_range`).
- Procesamiento de texto de cualquier longitud en la CLI de PyTorch, dividiéndolo por frases y uniendo el audio resultante.
- Manejo de texto sin puntuación final (se añade un punto) y omisión de frases sin contenido legible (por ejemplo, en otro sistema de escritura).
- Salida de audio mono a 24 kHz con normalización de picos (el audio guardado nunca supera 0,99).
- Exportación ONNX ejecutable en `onnxruntime` y en `onnxruntime-web` (WebAssembly), con audio que coincide con PyTorch dentro del 0,6 % de la amplitud de pico.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura por voz en navegador: el modelo ONNX se ejecuta en `onnxruntime-web` (WebAssembly), lo que permite integrar síntesis de voz en aplicaciones web sin backend ni GPU, con una huella de 21,4 MB.
- Asistentes de voz en dispositivos móviles o embebidos: con 4,5 millones de parámetros y ejecución 70 veces más rápida que tiempo real en cuatro hilos de CPU, es viable en teléfonos y hardware de bajos recursos.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz local en lectores de pantalla o aplicaciones de lectura, sin depender de servicios en la nube.
- Generación de avisos y notificaciones habladas: lectura de alertas, recordatorios o mensajes del sistema con dos voces seleccionables y control de velocidad adecuado para distintos contextos.
- Prototipado rápido de interfaces conversacionales: al ser Apache-2.0 y con pesos ligeros, permite iterar en demos y pruebas de concepto de asistentes sin coste de infraestructura.
- Preprocesado de datos de audio para investigación: generación de corpus sintéticos de voz en inglés para entrenamiento o evaluación de otros sistemas, dado el bajo coste computacional por hora de audio generada.
- Aplicaciones offline de lectura de documentos: integración en herramientas de escritorio que conviertan artículos o informes en audio sin conexión, procesando el texto frase a frase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado por el autor es que el modelo se ejecuta aproximadamente 70 veces más rápido que el tiempo real sobre cuatro hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en el caso de usar GPU, el modelo es tan pequeño (18,2 MB en float32) que la huella de memoria es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y navegador, por lo que no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en hardware integrado; también se ejecuta en CPU de cuatro hilos y en WebAssembly.
- Opciones de despliegue: PyTorch (script `tiny_voca.infer`), ONNX Runtime (Python) y `onnxruntime-web` (WebAssembly en navegador). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: aproximadamente 70 veces más rápido que el tiempo real en cuatro hilos de CPU, según el autor; no se proporcionan cifras de latencia absoluta ni de throughput en otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la información proporcionada. Como referencia cualitativa, los modelos TTS ligeros de código abierto habituales (por ejemplo, variantes de VITS o Piper) suelen manejar decenas de millones de parámetros y ofrecen múltiples idiomas; tiny-voca destaca por su tamaño excepcionalmente reducido (4,5 millones de parámetros) y su ejecución en navegador, pero se limita al inglés y a dos voces. No se dispone de datos verificados para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo soporta inglés (americano); el texto en otros sistemas de escritura se omite y no se genera audio para esas frases.
- Solo dispone de dos voces (F2 y M2); no hay clonación de voz ni voces adicionales documentadas.
- Límite de 512 tokens de fonemas y 32 segundos por llamada; el texto más largo debe dividirse en frases, y una uttancia sin marca final puede cortar la última palabra.
- El audio puede superar el pico de 1,0 en aproximadamente una de cada veinte frases, por lo que es necesario escalarlo antes de guardar en 16 bits.
- El ruido aleatorio que añade el modelo se genera de forma distinta en cada runtime (PyTorch frente a ONNX), lo que introduce variaciones menores entre ejecuciones.
- Entrenado sobre voz sintética (unas 18 horas), lo que puede limitar la naturalidad y la variabilidad prosódica frente a modelos entrenados con voz humana.
- No se documentan evaluaciones de sesgos, tasas de alucinación (en TTS, errores de pronunciación o artefactos) ni pruebas de calidad subjetiva (MOS).
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las dependencias (fonemizador `dizione`, datasets) por si tuvieran condiciones adicionales.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-21; se trata de un modelo muy reciente y sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autobahn247365/tiny-voca
- Código: https://github.com/n4ze3m/tiny-voca
- Fonemizador dizione: https://github.com/n4ze3m/dizione
- Dataset: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Demo en navegador: https://huggingface.co/spaces/n4ze3m/tiny-voca-studio
