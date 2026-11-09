# haex-space/haex-wakeword

## Resumen

haex-wakeword es un modelo de detección de palabra de activación (wake word) para el asistente de voz del proyecto haex, distribuido en formato ONNX y publicado bajo licencia Apache-2.0. Detecta las locuciones "Hex" (pronunciada [hɛks]) y "Hey Hex", y constituye el detector por defecto del asistente de voz de haex. No es un modelo de lenguaje generativo: es un clasificador binario de audio que decide, ventana a ventana, si el audio reciente contiene la palabra de activación.

El sistema se compone de dos grafos ONNX encadenados. El primero, `speech_embedding.onnx`, es el extractractor de características de Google `speech_embedding/1` (Apache-2.0) con su front-end log-mel integrado: recibe audio mono a 16 kHz en float32 y emite un vector de 96 valores por cada 1.280 muestras. El segundo, `hex.onnx`, es el clasificador entrenado por el autor, que toma una matriz de embeddings `[batch, 16, 96]` y devuelve una probabilidad `[batch, 1]`.

La relevancia del modelo es acotada pero clara: ofrece un detector de wake word ligero, ejecutable en local, con métricas de falsos positivos publicadas y un contrato de streaming explícito (ventanas de 80 ms, 16 frames de contexto, histéresis de 2 s tras la activación). Está pensado para integrarse en aplicaciones de asistente de voz que necesitan activación por voz sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: extractor de embeddings de audio `speech_embedding/1` (Google, Apache-2.0) con front-end log-mel + clasificador binario sobre secuencias de embeddings |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 frames de embeddings (12.800 muestras de audio, 0,8 s a 16 kHz) |
| Tipos de cuantización | no disponible (se distribuye en ONNX float32) |
| Idiomas soportados | no disponible (el modelo card no declara idiomas; la evaluación cubre seis idiomas en el conjunto de prueba) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`speech_embedding.onnx`, `hex.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en cascada típica de los sistemas de keyword spotting modernos. La primera etapa es un extractor de embeddings de audio preentrenado de Google (`speech_embedding/1`), que incorpora su propio front-end log-mel y transforma audio mono a 16 kHz en un embedding de 96 dimensiones cada 1.280 muestras (80 ms). La segunda etapa es un clasificador entrenado específicamente para la palabra "Hex", que opera sobre una ventana deslizante de 16 embeddings consecutivos y produce una probabilidad escalar.

El entrenamiento del clasificador se realizó con la herramienta del propio proyecto, `haex-wakeword`, disponible en GitHub. El modelo card no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos más allá de la mención a hablantes sintéticos en la evaluación. La evaluación se realizó sobre 37,1 horas de habla reservada (MLS test y FLEURS dev, seis idiomas, hablantes no vistos en entrenamiento) junto con hablantes sintéticos reservados pronunciando la wake word.

La innovación técnica destacable no está en la arquitectura del clasificador, sino en el contrato de streaming documentado en `card.json`: procesamiento cada 80 ms, uso exclusivo del último frame de embedding (que solo ve audio real, sin relleno), ventana de 16 frames y mecanismo de histéresis que silencia la detección durante 2 s tras una activación.

## Capacidades

- Detección de la palabra de activación "Hex" y de la variante "Hey Hex" en audio mono a 16 kHz.
- Clasificación binaria por ventana con salida de probabilidad calibrada.
- Procesamiento en streaming con latencia de ventana de 80 ms y contrato de integración documentado.
- Funcionamiento offline y en local: no requiere conexión a servicios externos.
- Ejecución sobre runtime ONNX, lo que permite despliegue en CPU, GPU o aceleradores compatibles.
- Tres perfiles de sensibilidad configurables (low, medium, high) que ajustan número de ventanas consecutivas y umbral.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento multi-paso: es exclusivamente un clasificador de audio.

## Casos de uso

- Activación de asistentes de voz en local: integrado en el asistente de haex, el modelo escucha de forma continua y activa el pipeline de reconocimiento de voz solo cuando detecta "Hex", reduciendo el consumo y evitando enviar audio a la nube de forma permanente.
- Aplicaciones de escritorio y móviles con ONNX Runtime: al distribuirse como dos grafos ONNX ligeros, puede embeberse en aplicaciones nativas sin dependencias de Python ni de frameworks de deep learning pesados.
- Sistemas de domótica y dispositivos empotrados: con un perfil de sensibilidad "low" (0,00 falsos aceptados por hora medidos) es adecuado para entornos donde una activación accidental resulta especialmente molesta, como luces o cerraduras.
- Evaluación y sustitución de wake words comerciales: el pipeline de entrenamiento `haex-wakeword` es reutilizable, por lo que el modelo sirve como referencia para equipos que quieran entrenar su propia palabra de activación con métricas comparables.
- Investigación en keyword spotting: las métricas publicadas (curvas de sensibilidad, ventanas, umbral y falsos aceptados por hora) permiten usar el modelo como baseline reproducible en experimentos de detección de palabras clave.
- Filtrado previo en pipelines de transcripción: colocado antes de un sistema ASR, evita transcribir audio irrelevante y reduce coste computacional en aplicaciones de notas de voz o grabación activada por voz.
- Prototipado rápido de interfaces de voz: la latencia de 80 ms por ventana y la activación tras 2-3 ventanas consecutivas permiten construir demos interactivas con respuesta casi inmediata.

## Benchmarks y rendimiento

Resultados medidos sobre 37,1 h de habla reservada (MLS test, FLEURS dev; seis idiomas; hablantes no vistos en entrenamiento) y hablantes sintéticos reservados:

| Sensibilidad | Ventanas | Umbral | "Hey Hex" | "Hex" solo | Falsos aceptados por hora |
|---|---|---|---|---|---|
| low | 3 | 0,9 | 88,7% | 47,1% | 0,00 |
| medium | 2 | 0,98 | 90,5% | 49,6% | 0,05 |
| high | 2 | 0,5 | 94,2% | 72,3% | 0,48 |

El perfil "medium" es el valor por defecto de haex. El autor advierte que estas cifras provienen de voces sintetizadas y que la recall con voces reales a distancia se mide en la aplicación, no en el modelo card.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB y los dos grafos ONNX son de tamaño reducido, por lo que la inferencia cabe holgadamente en memoria de cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican. Por el tamaño del pipeline, cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100, integradas) es sobredimensionada; el caso natural es CPU.
- Cabe en GPU consumer: sí, con margen amplio; también en dispositivos empotrados y móviles mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, CoreML, NNAPI), integración directa en la aplicación haex y en cualquier runtime compatible con ONNX.
- Latencia y throughput: la ventana de procesamiento es de 80 ms (1.280 muestras a 16 kHz); la activación requiere 2-3 ventanas consecutivas según el perfil de sensibilidad, más el periodo de silencio de 2 s tras cada activación. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haex-wakeword | Clasificador de wake word (ONNX, dos etapas) | no disponible | 16 frames (0,8 s) | Apache-2.0 | Hugging Face |
| Porcupine (Picovoice) | Detector de wake word comercial | no disponible | no disponible | Comercial | SDK propietario |
| openWakeWord | Detector de wake word open source | no disponible | no disponible | Apache-2.0 | GitHub / pip |
| Snowboy | Detector de wake word open source (obsoleto) | no disponible | no disponible | Apache-2.0 | GitHub (archivado) |

No se dispone de datos de benchmarks comparativos entre haex-wakeword y estas alternativas en la información proporcionada; la comparación se limita a tipo de modelo, licencia y disponibilidad.

## Limitaciones y advertencias

- Las métricas de recall publicadas proceden de voces sintetizadas; el rendimiento con voces reales a distancia no está cuantificado en el modelo card y se mide en la aplicación.
- La recall de "Hex" aislado es notablemente inferior a la de "Hey Hex" en todos los perfiles (47,1%-72,3% frente a 88,7%-94,2%), lo que limita su uso con la forma corta.
- El modelo está entrenado para una única palabra de activación concreta ("Hex"); no es un detector genérico ni admite configurar otras palabras sin reentrenar el clasificador.
- El perfil "high" acepta 0,48 falsos positivos por hora, lo que puede resultar excesivo en entornos con mucho habla de fondo.
- No se declaran idiomas soportados ni sesgos demográficos conocidos; la evaluación cubre seis idiomas pero no se detalla su composición ni el equilibrio de hablantes.
- El modelo card no documenta la composición del dataset de entrenamiento ni las licencias de los datos de audio más allá de remitir a `NOTICE` y al README del pipeline.
- Es un componente de un sistema mayor (el asistente haex); su utilidad fuera de ese contexto requiere integrar manualmente el contrato de streaming descrito en `card.json`.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de atribución de `speech_embedding/1` de Google incluido en `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haex-space/haex-wakeword
- Proyecto haex-vault (asistente de voz): https://github.com/haex-space/haex-vault
- Pipeline de entrenamiento haex-wakeword: https://github.com/haex-space/haex-wakeword
