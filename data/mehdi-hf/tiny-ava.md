# mehdi-hf/tiny-ava

## Resumen

tiny-ava es un modelo de síntesis de voz (text-to-speech) para persa (farsi) desarrollado por el usuario mehdi-hf, construido desde cero sobre la arquitectura `tiny-voca` de n4ze3m. Con tan solo 4,53 millones de parámetros y un peso total de aproximadamente 18 MB en PyTorch y 20 MB en ONNX, el modelo está diseñado para inferencia en CPU sin necesidad de GPU ni conexión a internet. Genera audio mono a 24 kHz con una única voz femenina persa denominada `parisa`.

La relevancia del modelo reside en su extrema ligereza y velocidad: según el autor, alcanza 38,5 veces el tiempo real en un solo hilo de CPU y 77,4 veces en cuatro hilos, lo que lo hace viable para despliegue en dispositivos de gama baja, aplicaciones de escritorio y entornos embebidos donde otros modelos TTS no caben. No incluye pesos preentrenados de terceros: se entrenó íntegramente desde cero.

El modelo no acepta texto directamente, sino tokens IPA persas (46 símbolos) junto con un canal de tres clases para acento léxico y ezafe, por lo que requiere un frontend G2P externo (por ejemplo, `mehdi-hf/persian-g2p-tiny` o `mehdi-hf/persian-g2p-0.6b`) para convertir texto a fonemas antes de la inferencia. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward (tiny-voca) con generador de forma de onda integrado |
| Parametros totales | 4.531.147 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por secuencia de tokens fonéticos, sin límite documentado) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; export ONNX opset 17 en float32) |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | CC BY 4.0 (uso libre, incluido comercial, con atribución) |
| Formato de pesos | PyTorch (`.pt`, float32) y ONNX (`.onnx`, float32, opset 17) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `tiny-voca` (Apache-2.0), un transformer feed-forward con generador de forma de onda integrado que produce directamente la señal de audio a 24 kHz. La entrada no es texto sino tokens IPA persas de una tabla de 46 símbolos, acompañados de un canal de estrés/ezafe de tres clases: 0 sin acento, 1 acento léxico primario en final de palabra, 2 ezafe explícito (`-e`/`-ye`). El grafo ONNX recibe además parámetros de control de velocidad (`speed`), desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`), y devuelve la forma de onda y las duraciones por token en tramas de 256 muestras (10,67 ms).

Según la model card, el entrenamiento se realizó desde cero, sin pesos preentrenados, con curvas de entrenamiento y validación de 104.000 pasos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión de texto a fonemas se delega a frontends G2P separados, de modo que el modelo acústico solo trabaja con representaciones fonéticas.

## Capacidades

- Síntesis de voz en persa a 24 kHz mono con la voz femenina `parisa`.
- Control de velocidad de habla mediante el parámetro `speed` (1.0 por defecto).
- Control de tono mediante `pitch_shift` (añadido al log F0; 0,058 ≈ +1 semitono) y `pitch_range` (escala del movimiento de tono alrededor de la media; recomendado 1,0–1,1).
- Manejo de ezafe persa, tanto implícito como con kasra explícita (`ـِ`).
- Resolución de homógrafos en contexto (por ejemplo, `تست` → *tost*, `گل` → *gol*/*gel*, `مرد` → *mord*), según los ejemplos publicados.
- Pronunciación de consonantes uvulares persas (`ق/غ/خ/ع`).
- Soporte de persa coloquial y de puntuación interrogativa (`؟`).
- Salida de duraciones por token para control o análisis posteriores.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo puramente acústico.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio: integración del grafo ONNX en una app local que convierta texto persa a fonemas con `persian-g2p-tiny` y sintetice en CPU, sin conexión a internet ni GPU.
- Asistentes de voz embebidos: con 18–20 MB de peso y 38,5× tiempo real en un hilo, cabe en dispositivos de recursos limitados (Raspberry Pi, routers, electrónica de consumo) para respuestas habladas cortas.
- Accesibilidad para personas con discapacidad visual: lectura de contenido en persa en lectores de pantalla ligeros, donde el reducido consumo de CPU permite ejecución en segundo plano.
- Generación de audiolibros o boletines: síntesis por lotes de textos largos a velocidad muy superior al tiempo real, con control de velocidad y tono para adaptar la locución.
- Aprendizaje de persa: producción de audio de ejemplo para vocabulario y frases, incluyendo pares de homógrafos y cadenas de ezafe que ilustran la pronunciación correcta.
- Prototipado de interfaces de voz: generación rápida de clips de prueba en pipelines de desarrollo sin depender de servicios TTS en la nube, con coste cero por petición.
- Sistemas de megafonía o anuncios locales: síntesis de avisos en persa en tiempo real sobre hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados por el autor son de velocidad de inferencia en CPU:

| Metrica | Valor |
|---|---|
| Velocidad en 1 hilo de CPU | 38,5× tiempo real |
| Velocidad en 4 hilos de CPU | 77,4× tiempo real |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Tamano de pesos PyTorch | 18,2 MB (float32) |
| Tamano de pesos ONNX | 20,4 MB (float32, opset 17) |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU y no requiere GPU.
- Memoria del sistema: el peso de 18,2 MB (PyTorch) o 20,4 MB (ONNX) más el frontend G2P (16 MB con `persian-g2p-tiny` o 596 M parámetros con `persian-g2p-0.6b`) determinan el consumo; el modelo acústico en sí cabe en cualquier equipo con unos pocos cientos de MB libres.
- GPU recomendadas: ninguna necesaria; el autor documenta exclusivamente inferencia en CPU.
- Cabe en cualquier CPU de consumo; no se requieren aceleradores.
- Opciones de despliegue: ONNX Runtime (grafo `onnx/tiny-ava-parisa.onnx`), PyTorch con `tiny-ava-parisa.pt`, y el repositorio de código `mallahyari/tiny-ava`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: 38,5× tiempo real con 1 hilo y 77,4× con 4 hilos, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto/entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| tiny-ava | 4,53 M | Persa | Tokens IPA (46 simbolos) | CC BY 4.0 | CPU, ONNX/PyTorch |
| `mehdi-hf/persian-g2p-tiny` | no disponible (16 MB) | Persa | Texto a fonemas (G2P) | MIT | CPU |
| `mehdi-hf/persian-g2p-0.6b` | 596 M | Persa | Texto a fonemas (G2P) | Apache-2.0 | CPU/GPU |
| `tiny-voca` (n4ze3m) | no disponible | no disponible | Arquitectura base | Apache-2.0 | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones completas de modelos TTS persas comparables de otros autores, por lo que no es posible una comparación cuantitativa de calidad de síntesis.

## Limitaciones y advertencias

- Una sola voz (`parisa`, femenina); no hay voces adicionales documentadas.
- Requiere un frontend G2P externo para convertir texto a fonemas; el modelo por sí solo no procesa texto en persa.
- Solo soporta persa; no hay capacidades multilingües.
- No se documentan sesgos específicos del dataset de entrenamiento, pero al entrenarse desde cero la calidad y cobertura dependen de datos no publicados.
- Riesgo de errores de pronunciación en homógrafos, nombres propios y préstamos no cubiertos por el G2P o por el corpus de entrenamiento.
- No se documentan métricas objetivas de calidad (MOS, WER de síntesis) ni benchmarks, lo que dificulta evaluar su fidelidad frente a alternativas.
- El repositorio registra 0 descargas en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Licencia CC BY 4.0: el uso comercial es libre pero exige atribución al autor.
- Para exportar a WAV de 16 bits hay que escalar el pico de la salida a ≤ 0,99, según indica la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehdi-hf/tiny-ava
- Demo en el navegador: https://huggingface.co/spaces/mehdi-hf/tiny-ava-demo
- Repositorio de código y releases: https://github.com/mallahyari/tiny-ava
- Frontend G2P ligero: https://huggingface.co/mehdi-hf/persian-g2p-tiny
- Frontend G2P grande (596 M): `mehdi-hf/persian-g2p-0.6b` (referenciado en la model card, sin URL directa en la información disponible)
- Arquitectura base tiny-voca: https://github.com/n4ze3m/tiny-voca
