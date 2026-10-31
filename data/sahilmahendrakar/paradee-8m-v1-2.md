# sahilmahendrakar/Paradee-8M-v1.2

## Resumen

Paradee-8M v1.2 es un modelo de síntesis de voz (text-to-speech) en inglés de tamaño muy reducido, desarrollado por sahilmahendrakar. Con solo 7,88 millones de parámetros, se obtiene mediante destilación de Kokoro-82M (hexgrad/Kokoro-82M), un modelo TTS mucho mayor. El objetivo del proyecto es llevar la calidad de voz de Kokoro a entornos con recursos muy limitados: el modelo cuantizado en int8 cabe en un único archivo ONNX de 8,5 MB, frente a los 325 MB del modelo profesor, y funciona sin GPU.

La versión 1.2 añade soporte para cuatro voces (dos estadounidenses y dos británicas, masculinas y femeninas) mediante una pequeña tabla de vectores aprendidos por voz, manteniendo el resto de parámetros compartidos. El modelo conserva prácticamente la calidad del profesor en la voz principal `af_heart` (UTMOS de 4,40 frente a 4,52) y llega a superar al profesor en WER en la voz `am_puck` (5,4 % frente a 6,3 %).

Su relevancia actual radica en la tendencia hacia TTS ultraligero ejecutable en CPU, navegadores y dispositivos edge: corre unas 62 veces más rápido que el tiempo real en un solo hilo de CPU, lo que lo hace adecuado para aplicaciones web (via kokoro-js/transformers.js), móviles y sistemas embebidos. Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS destilado de Kokoro-82M, dividido en dos mitades (lado de texto y decodificador); no disponible detalle completo |
| Parametros totales | 7,88 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 512 fonemas por inferencia (secuencia de phoneme ids) |
| Tipos de cuantizacion | int8 (8,5 MB) y fp32 (35 MB) |
| Idiomas soportados | Ingles (acentos americano y britanico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8 y fp32), pesos PyTorch (.pt) para entrenamiento |

## Arquitectura y entrenamiento

Paradee se obtiene por destilación de Kokoro-82M. El modelo se organiza en dos mitades —un "lado de texto" y un "decodificador"— cuyos pesos PyTorch se publican por separado (`pytorch/text_side.pt` y `pytorch/decoder.pt`). El grafo ONNX completo va de identificadores de fonemas a forma de onda de audio a 24 kHz, generando internamente su propio ruido aleatorio (dos ejecuciones sobre el mismo texto difieren ligeramente en las partes ruidosas del sonido).

En la versión 1.2, cada mitad incorpora una pequeña tabla con un vector aprendido por voz: la voz seleccionada elige la fila correspondiente, mientras todo lo demás permanece compartido entre las cuatro voces. Ambas mitades partieron de la v1.1 y se entrenaron adicionalmente leyendo 12.000 frases en cada una de las cuatro voces; la voz `bf_isabella` fue la más difícil de aprender y se mostró tres veces más a menudo en la última ronda. Las voces británicas requieren fonología británica: el paquete de Python usa la pronunciación británica de misaki (por ejemplo, "bath" se transcribe `bˈɑːθ`), igual que hizo Kokoro al leer sus frases de entrenamiento. Los fonemas deben generarse con misaki, usando su diccionario americano para `af_heart` y `am_puck` y el británico para `bf_isabella` y `bm_fable`.

## Capacidades

- Sintesis de voz en ingles con cuatro voces: `af_heart` (americana, femenina), `bf_isabella` (britanica, femenina), `am_puck` (americana, masculina) y `bm_fable` (britanica, masculina).
- Control de velocidad de habla mediante el parametro `speed` (1.0 = velocidad normal).
- Salida de audio a 24 kHz en un unico paso, sin GPU.
- Ejecucion en CPU a unas 62x el tiempo real en un solo hilo.
- Compatible con kokoro-js y transformers.js para inferencia en navegador (via `tokenizer.json`).
- Variabilidad natural entre generaciones (ruido estocastico interno).
- No soporta idiomas distintos del ingles, ni clonacion de voz, ni entradas de audio.

## Casos de uso

- TTS en el navegador: gracias a `tokenizer.json` en formato kokoro-js/transformers.js y a los 8,5 MB del modelo int8, puede cargarse en una pagina web sin backend ni descargas pesadas.
- Aplicaciones moviles y edge: el tamano minimo y la ejecucion en CPU a 62x tiempo real lo hacen viable en dispositivos sin GPU ni conexion constante.
- Lectura de texto accesible: integracion en lectores de pantalla o extensiones que conviertan articulos y documentos en audio con voz femenina o masculina, americana o britanica.
- Asistentes de voz locales: pipelines de voz-a-voz en local donde el TTS debe responder en decenas de milisegundos sin depender de la nube.
- Prototipado de agentes conversacionales: al ser deterministico en latencia y ligero, sirve para iterar rapidamente dialogs antes de pasar a voces mas caras.
- Generacion batch de audiomensajes: narracion de notificaciones, respuestas automaticas de IVR o audios cortos para aplicaciones, aprovechando la API de Python de una linea.
- Educacion y aprendizaje de pronunciacion: las voces britanicas usan fonetica britanica real de misaki, util para material didactico de ingles.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando cada voz de Paradee v1.2 con su profesor Kokoro:

| Voz | Acento | UTMOS (Paradee) | UTMOS (Kokoro) | WER (Paradee) | WER (Kokoro) |
|---|---|---:|---:|---:|---:|
| `af_heart` | Americano, femenina | 4,40 | 4,52 | 5,8 % | 5,7 % |
| `bf_isabella` | Britanico, femenina | 4,06 | 4,41 | 5,7 % | 5,6 % |
| `am_puck` | Americano, masculina | 4,32 | 4,47 | 5,4 % | 6,3 % |
| `bm_fable` | Britanico, masculina | 4,18 | 4,32 | 5,7 % | 5,7 % |

Rendimiento adicional: unas 62x el tiempo real en un solo hilo de CPU, sin GPU (igual que la v1.1). La voz `af_heart` mantiene la calidad de la v1.1 (4,40 frente a 4,39 de UTMOS).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo int8 ocupa 8,5 MB de memoria y funciona integramente en CPU. No hay cifras oficiales de RAM, pero el footprint es minimo.
- GPU recomendadas: ninguna necesaria; no hay datos de rendimiento en GPU.
- Consumer GPU: irrelevante para este modelo, esta pensado para CPU, incluyendo equipos sin aceleracion.
- Despliegue: paquete de Python propio (`pip install git+https://github.com/sahilmahendrakar/paradee`), ONNX Runtime, y navegadores via kokoro-js/transformers.js. No se menciona soporte nativo de vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia: a 62x tiempo real en un hilo de CPU, sintetizar un segundo de audio toma unos 16 ms; no se publican cifras de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano int8 | Voces | Idiomas | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| Paradee-8M v1.2 | 7,88 M | 8,5 MB | 4 | Ingles | Apache 2.0 | CPU, navegador, 62x RT |
| Kokoro-82M (profesor) | 82 M | ~325 MB | Multiple | Ingles | Apache 2.0 | CPU/GPU |
| Piper (alternativa ligera) | no disponible | decenas de MB | Multiple | Multiple | MIT | CPU, edge |

Paradee sacrifica algo de calidad respecto a Kokoro (caida de UTMOS de 0,10 a 0,35 segun voz) a cambio de una reduccion de tamano de ~38x, manteniendo un WER comparable o incluso mejor en `am_puck`.

## Limitaciones y advertencias

- Solo ingles; no hay soporte para espanol ni otros idiomas.
- Las voces britanicas requieren fonemas generados con el diccionario britanico de misaki; usar el diccionario americano degradara la calidad.
- Maximo 512 fonemas por inferencia; textos mas largos deben segmentarse.
- La voz `bf_isabella` muestra la mayor caida de calidad respecto al profesor (UTMOS 4,06 frente a 4,41).
- El grafo genera ruido aleatorio internamente: dos sintesis del mismo texto no son identicas, lo que puede complicar tests de regresion de audio.
- Como todo modelo TTS destilado, puede heredar sesgos y artefactos del profesor Kokoro; no se publican evaluaciones de sesgo.
- No hay datos publicados sobre estabilidad en textos con numeros, siglas o codigos mixtos.
- La licencia Apache 2.0 permite uso comercial sin restricciones destacables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.2
- Modelo profesor (Kokoro-82M): https://huggingface.co/hexgrad/Kokoro-82M
- Codigo y paquete de Python: https://github.com/sahilmahendrakar/paradee
- Paper (v1.0): https://huggingface.co/papers/2610.06817
- Libreria de fonemizacion misaki: https://github.com/hexgrad/misaki
- Version anterior (v1.1): https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1
