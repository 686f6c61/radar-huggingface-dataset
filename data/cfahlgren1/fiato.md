# cfahlgren1/fiato

## Resumen

fiato es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por cfahlgren1, publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un modelo extremadamente compacto: 4.537.867 parámetros en total, incluyendo el generador de forma de onda, lo que lo hace 727 veces más pequeño que Maya-1, el modelo del que aprendió mediante destilación a partir de 23,7 horas de su habla. Su nombre significa "aliento" en italiano y hace referencia a una de sus capacidades distintivas: la inserción de expresiones no verbales como suspiros, exhalaciones y jadeos.

El modelo resuelve el problema de la síntesis de voz de calidad en entornos con recursos muy limitados, sin necesidad de vocoder neuronal. Está diseñado para ejecutarse en CPU y en el navegador, con un rendimiento de aproximadamente 150 veces el tiempo real en 4 hilos de CPU de un Apple M3 Max. Incluye dos voces en inglés americano (F1 femenina y M1 masculina) y genera audio mono a 24 kHz.

Su relevancia actual radica en la combinación de un tamaño mínimos con capacidades expresivas (tokens de suspiro, exhalación y jadeo) y un coste de entrenamiento documentado de 18,27 dólares, lo que lo convierte en un caso de estudio de eficiencia en TTS y en una opción viable para despliegues en dispositivos de borde o aplicaciones web sin backend.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con predictor de duración, predictores de tono y sonoridad, y sintetizador fuente-filtro (sin vocoder neuronal) |
| Parámetros totales | 4.537.867 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa el texto oración a oración, sin límite documentado) |
| Tipos de cuantización | No disponible (se distribuye en PyTorch `.pt` y ONNX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`fiato.pt`) y ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

fiato sigue un diseño de TTS en dos etapas sin vocoder neuronal. El texto se convierte primero en fonemas con marca de acento; un encoder transformer los procesa, un predictor asigna a cada fonema una duración, y dos transformers adicionales predicen el tono (F0), la sonoridad y los parámetros de un pequeño sintetizador fuente-filtro. La señal se genera como un tren de pulsos a la frecuencia fundamental predicha más ruido, cada uno moldeado por un filtro. La ausencia de vocoder neuronal es la razón principal de su reducido tamaño y de su velocidad.

El entrenamiento se basa en destilación desde Maya-1: el modelo aprendió escuchando 23,7 horas de habla generada por ese modelo. La arquitectura y el código de entrenamiento son un fork de tiny-voca, de Muhammed Nazeem; las aportaciones propias son el modelo profesor, las dos voces y los tokens de expresión. Las expresiones (`<sigh>`, `<exhale>`, `<gasp>`) se incorporan como un token más entre las palabras, y en los datos de entrenamiento el sonido entre silencios asociado a ese token define su duración y timbre. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en inglés americano con dos voces: F1 (femenina) y M1 (masculina).
- Generación de audio mono a 24 kHz.
- Inserción de expresiones no verbales mediante tokens: `<sigh>` (suspiro), `<exhale>` (exhalación) y `<gasp>` (jadeo).
- Control de velocidad de habla (`--speed`), desplazamiento de tono (`--pitch-shift`, donde 0,058 equivale aproximadamente a un semitono) y rango de tono (`--pitch-range`).
- Procesamiento de texto de cualquier longitud, leído oración a oración.
- Inferencia en CPU y en navegador mediante ONNX Runtime.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- **Lectura de notificaciones y alertas en aplicaciones de escritorio**: el modelo puede sintetizar mensajes cortos en tiempo real en CPU sin dependencias de red, gracias a sus 4,5 millones de parámetros y a la velocidad de 150x tiempo real en 4 hilos.
- **Accesibilidad web sin backend**: la demo del autor ejecuta el modelo ONNX directamente en la pestaña del navegador, de modo que una aplicación puede ofrecer lectura en voz alta de contenido sin enviar texto a ningún servidor.
- **Audiolibros y narración de contenido largo**: el modelo procesa texto de cualquier longitud oración a oración, lo que permite narrar artículos o capítulos con las dos voces disponibles y control de velocidad.
- **Prototipado rápido de interfaces de voz**: con un coste de entrenamiento documentado de 18,27 dólares y un script de entrenamiento incluido, es adecuado para experimentar con nuevas voces o estilos antes de invertir en modelos mayores.
- **Generación de audio expresivo para guiones**: la inserción de `<sigh>`, `<exhale>` y `<gasp>` permite producir diálogos con carga emocional no verbal para podcasts, vídeos o videojuegos.
- **Sistemas embebidos y dispositivos de borde**: al no requerir GPU ni vocoder neuronal, cabe en entornos con memoria y cómputo restringidos donde otros modelos TTS no son viables.
- **Pruebas de regresión en pipelines de audio**: su naturaleza determinista y su pequeño tamaño facilitan la inclusión en tests automatizados de síntesis de voz dentro de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas operativas: 4.537.867 parámetros, salida a 24 kHz y aproximadamente 150x tiempo real en 4 hilos de CPU de un Apple M3 Max.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el modelo está pensado para ejecutarse en CPU y no se documentan requisitos de VRAM.
- **GPU recomendadas**: no se especifican; el autor destaca la ejecución en CPU (Apple M3 Max con 4 hilos) y en navegador mediante ONNX Runtime.
- **GPU de consumo**: no se documenta compatibilidad explícita, pero por su tamaño (4,5 millones de parámetros) es previsible que quepa en cualquier GPU de consumo; no hay datos oficiales al respecto.
- **Opciones de despliegue**: PyTorch (`python -m fiato.infer`), ONNX Runtime (`onnx/model.onnx`) y servidor HTTP local para la demo incluida en `demo/`.
- **Latencia y throughput**: aproximadamente 150x tiempo real en 4 hilos de CPU de un Apple M3 Max; no se publican cifras de latencia por petición ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fiato | 4.537.867 | No disponible (procesa por oraciones) | Inglés | Apache-2.0 | Hugging Face, ONNX, demo en navegador |
| Maya-1 | No disponible (modelo profesor) | No disponible | Inglés | No disponible | Hugging Face (maya-research/maya1) |
| tiny-voca | No disponible (base arquitectónica) | No disponible | No disponible | No disponible | GitHub (n4ze3m/tiny-voca) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Únicamente ofrece dos voces (F1 y M1), ambas en inglés americano, sin clonación de voz ni control de hablante.
- El modelo se destila de Maya-1 a partir de 23,7 horas de audio generado, por lo que puede heredar sesgos y artefactos del modelo profesor.
- Riesgo de alucinación acústica o de pronunciación incorrecta en palabras poco frecuentes, números y nombres propios; la model card incluye ejemplos con horas y fechas, pero no se documentan métricas de precisión.
- Las expresiones `<sigh>`, `<exhale>` y `<gasp>` deben colocarse en posiciones adecuadas (tras coma, al inicio o al final de oración); un uso incorrecto puede producir resultados no deseados.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales del modelo profesor.
- No se publican benchmarks objetivos (MOS, WER, similitud de hablante), lo que dificulta evaluar su calidad frente a alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfahlgren1/fiato
- Dataset: https://huggingface.co/datasets/cfahlgren1/fiato
- Demo en navegador: https://huggingface.co/spaces/cfahlgren1/fiato
- Script de entrenamiento: https://huggingface.co/cfahlgren1/fiato/blob/main/train_job.py
- Coste de cada ejecución: https://huggingface.co/cfahlgren1/fiato/blob/main/costs.md
- Repositorio base tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo profesor Maya-1: https://huggingface.co/maya-research/maya1
