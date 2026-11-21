# brenorb/tiny-broca

## Resumen

tiny-broca es un modelo de síntesis de voz (text-to-speech) para portugués brasileño desarrollado por el usuario brenorb. Se trata de un modelo extremadamente compacto, con 4.533.835 parámetros en total (incluyendo el generador de forma de onda), entrenado desde cero sobre 17 horas de habla sintética. El modelo ofrece dos voces predefinidas, F1 (femenina) y M1 (masculina), y genera audio mono a 24 kHz. Su relevancia radica en su tamano reducido, que lo hace apto para despliegue en entornos con recursos muy limitados, incluido el navegador mediante ONNX Runtime Web (WebAssembly).

El modelo se distribuye en formato PyTorch (float32) y ONNX (opset 17), con una licencia Apache-2.0 que permite uso comercial. No emplea pesos preentrenados: tanto la arquitectura como los pesos se entrenaron íntegramente sobre el dataset sintético brenorb/tiny-broca. La tokenización se realiza a nivel de letras (58 símbolos, incluyendo grafemas acentuados), sin diccionario fonético externo, lo que simplifica el front-end.

La ficha disponible no detalla la arquitectura interna más allá de la existencia de un generador de forma de onda y un front-end de fonemización propio (text.py). El modelo está pensado para una sola emisión por llamada, con un límite de 512 tokens y 32 segundos de audio por invocación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con generador de forma de onda; detalles internos no especificados) |
| Parametros totales | 4.533.835 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por emisión; hasta 32 segundos de audio por llamada |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32; no se documentan cuantizaciones) |
| Idiomas soportados | portugues (brasileno, pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32) y ONNX (.onnx, float32, opset 17) |

## Arquitectura y entrenamiento

La información disponible no especifica el tipo de arquitectura interna (transformer, difusión, flow matching, etc.) ni la composición detallada del dataset más allá de que se trata de 17 horas de habla sintética. El modelo se entrenó desde cero, sin pesos preentrenados, y consta de un front-end de tokenización a nivel de letras (26 letras más grafemas acentuados, 58 símbolos en total) que produce identificadores de letras y marcas de acentuación (stress) por sílaba. El grafo ONNX recibe esos tokens junto con parámetros de control (voz, velocidad, pitch_shift, pitch_range) y devuelve la forma de onda a 24 kHz junto con las duraciones por token en tramas de 256 muestras.

El modelo incluye un generador de forma de onda dentro del mismo cómputo de 4,5 millones de parámetros, lo que implica un diseño muy compacto orientado a inferencia ligera. No se documentan innovaciones como decodificación especulativa ni atención lineal; la innovación principal es la eficiencia extrema y la exportación a ONNX para ejecución en WebAssembly en el navegador.

## Capacidades

- Síntesis de voz en portugués brasileño a 24 kHz mono.
- Dos voces: F1 (femenina) y M1 (masculina), seleccionables por identificador entero.
- Control de velocidad de habla (speed), desplazamiento de tono (pitch_shift, en log F0, ~0,058 por semitono) y rango de tono (pitch_range).
- Tokenización a nivel de letras con marcas de acentuación silábica, sin diccionario fonético externo.
- Ejecución en PyTorch y en ONNX Runtime (incluido onnxruntime-web sobre WebAssembly).
- Salida de duraciones por token en tramas de 256 muestras, útil para alineamiento y control temporal.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni capacidades multilingües más allá del portugués.

## Casos de uso

- Lectura de notificaciones y avisos en aplicaciones móviles: el modelo cabe en el navegador o en un dispositivo de gama baja gracias a sus 4,5 millones de parámetros y a la exportación ONNX, permitiendo generar avisos de voz en portugués sin conexión.
- Accesibilidad web: integración mediante onnxruntime-web para leer contenido de páginas en portugués brasileño directamente en el cliente, sin enviar texto a un servidor y con latencia baja.
- Sistemas de megafonía y anuncios automatizados: generación de locuciones cortas (hasta 32 segundos por llamada) para estaciones, comercios o transporte, con dos voces y control de velocidad y tono.
- Prototipado rápido de asistentes de voz: el front-end en Python (text.py) y el grafo ONNX permiten construir un pipeline TTS completo en pocas líneas para validar productos de voz en portugués antes de invertir en modelos mayores.
- Generación de audio para pruebas de integración: al ser determinista y ligero, sirve para producir fixtures de audio en pipelines de CI/CD de aplicaciones de voz en portugués.
- Educación y aprendizaje de idiomas: lectura de frases en portugués brasileño con control de velocidad y tono para ejercicios de pronunciación, dividiendo textos largos en oraciones por el límite de 512 tokens.
- Sistemas embebidos y edge computing: despliegue en dispositivos con recursos limitados donde modelos TTS de cientos de millones de parámetros no caben, aceptando la menor naturalidad a cambio de un consumo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (4,5 millones de parámetros equivalen a unos 18 MB de pesos, más buffers de activación y audio); no se documentan cifras exactas.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo está pensado para CPU y para ejecución en navegador vía WebAssembly.
- Cabe en cualquier GPU de consumo e incluso en CPU de gama baja y en dispositivos móviles.
- Opciones de despliegue: PyTorch (script de inferencia del repositorio), ONNX Runtime (Python) y onnxruntime-web (WebAssembly) para el navegador.
- Latencia y throughput: no disponibles en la información proporcionada; el límite de 32 segundos de audio por llamada y 512 tokens condiciona el procesamiento por oraciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS compacto para portugués) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado únicamente sobre 17 horas de habla sintética: la naturalidad y la cobertura prosódica probablemente sean limitadas frente a modelos entrenados con habla humana a gran escala.
- Solo portugués brasileño; no soporta otros idiomas ni cambios de idioma dentro de una emisión.
- Límite de 512 tokens y 32 segundos por llamada; es necesario dividir textos largos en oraciones.
- Tokenización a nivel de letras sin diccionario: la pronunciación de palabras irregulares, siglas, números y extranjerismos puede ser incorrecta.
- Riesgo de alucinación acústica o artefactos en entradas fuera de distribución; no se documentan evaluaciones de calidad (MOS) ni pruebas de robustez.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse con habla sintética puede reflejar las limitaciones del generador utilizado para crear el dataset.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del dataset sintético de origen (brenorb/tiny-broca) antes de un despliegue en producción.
- Repositorio de tamano 0.0 GB y solo 5 descargas en el momento de la consulta: proyecto de autor individual, sin comunidad ni mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/brenorb/tiny-broca
- Dataset: https://huggingface.co/datasets/brenorb/tiny-broca
- Código: https://github.com/brenorb/tiny-broca
