# anventureslabs/lamma-narrator

## Resumen

Lamma narrator voice (v1) es un modelo de síntesis de voz (text-to-speech) en formato ONNX publicado por anventureslabs como la voz de narrador que funciona en el dispositivo dentro de la aplicación de juegos de fiesta «Lamma». No es un modelo entrenado desde cero: es una copia modificada y cuantizada de Supertonic 3, de Supertone Inc., redistribuida bajo la licencia BigScience OpenRAIL-M que se incluye en el repositorio. El repositorio ocupa 0,1 GB y contiene cuatro grafos ONNX más ficheros JSON de configuración y dos estilos de voz (F1 y M1).

La relevancia del modelo es práctica más que investigadora: demuestra un pipeline TTS ligero, cuantizado a int8 y fp16, pensado para inferencia local sin GPU dedicada y con dos idiomas declarados, inglés y árabe. Al derivar de Supertonic 3, hereda las capacidades y limitaciones del modelo base, pero no aporta ni arquitectura propia ni datos de entrenamiento nuevos; los detalles de arquitectura, parámetros y entrenamiento del modelo original no están documentados en la información disponible.

El proyecto tiene un perfil de adopción muy bajo (0 descargas, 0 likes en el momento de la consulta) y no publica benchmarks, muestras de audio ni métricas de calidad. Cualquier evaluación en producción debe hacerse por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los ficheros del repositorio indican un pipeline por etapas: `duration_predictor.onnx`, `text_encoder.onnx`, `vector_estimator.onnx` y `vocoder.onnx`. La arquitectura interna del modelo base (Supertonic 3) no está documentada en la información proporcionada |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-speech). No se especifica límite de longitud de texto de entrada |
| Tipos de cuantizacion | INT8 por canal (cuantización dinámica de ONNX Runtime sobre MatMul/Gemm/Conv) en `duration_predictor`, `text_encoder` y `vector_estimator`; FP16 en `vocoder` (entradas y salidas en FP32). El modelo base sin cuantizar no se incluye |
| Idiomas soportados | Inglés (`en`) y árabe (`ar`) |
| Licencia | OpenRAIL-M (BigScience), fichero `LICENSE` incluido en el repositorio |
| Formato de pesos | ONNX (`.onnx`) con ficheros auxiliares JSON (`tts.json`, `unicode_indexer.json`) y estilos de voz `F1.json` y `M1.json` |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna de Supertonic 3 ni sobre su proceso de entrenamiento: no se indica número de tokens, composición del dataset, horas de audio, ni si hubo ajuste por RLHF o preferencias. Lo único deducible de los nombres de fichero es que el sistema se organiza en cuatro etapas: un predictor de duración (modela la longitud temporal de la secuencia), un codificador de texto, un estimador de vector (etapa generativa intermedia) y un vocoder que convierte la representación intermedia en forma de onda. Se trata de una estructura habitual en TTS neuronales modernos, pero la ficha no puede confirmar el paradigma exacto (difusión, flow matching, autoregresivo u otro).

Las modificaciones introducidas por anventureslabs son exclusivamente de compresión: cuantización dinámica a int8 por canal en los tres primeros grafos y conversión del vocoder a fp16 manteniendo entradas y salidas en fp32, con el objetivo declarado de ejecución en dispositivo. Los ficheros de configuración (`tts.json`, `unicode_indexer.json`) y los estilos de voz no se han modificado respecto al original. No se documenta ninguna innovación técnica adicional, ni decodificación especulativa, ni atención lineal, ni cambios en el tokenizador o en el indexador Unicode.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`) en inglés y árabe.
- Dos estilos de voz incluidos: `F1.json` (voz femenina) y `M1.json` (voz masculina). No se documentan más voces.
- Ejecución local en dispositivo mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Modelo compacto: el repositorio completo ocupa 0,1 GB, lo que facilita su empaquetado en aplicaciones móviles o de escritorio.
- Control de duración mediante un predictor dedicado, lo que en la práctica permite modelar el ritmo de la locución.
- No se documentan capacidades de clonación de voz, emoción, control de prosodia por instrucciones, ni soporte de tool calling o comportamiento agéntico (no aplica a un modelo TTS).

## Casos de uso

- Narración dentro de una aplicación de juegos de fiesta: es el uso original declarado. El modelo lee instrucciones, cartas o turnos de juego en local, sin latencia de red ni coste por petición, lo que encaja con partidas presenciales sin conectividad fiable.
- Lectura de texto en voz alta en aplicaciones móviles: con 0,1 GB de pesos y ejecución ONNX, puede empaquetarse en el binario de una app iOS o Android y funcionar sin descargar modelos adicionales.
- Accesibilidad para personas con discapacidad visual: conversión de contenido textual de la app (menús, instrucciones, avisos) a audio, con la ventaja de que el procesado ocurre en el dispositivo y no se envía texto del usuario a servidores externos.
- Avisos y notificaciones de voz en inglés y árabe: útil para productos con audiencia en ambos idiomas que necesiten locuciones cortas generadas dinámicamente (alertas, confirmaciones, mensajes de estado).
- Prototipado rápido de interfaces de voz: al ser ONNX puro, se integra en un script de Python o en una app de escritorio en minutos para validar un flujo de TTS antes de invertir en un modelo mayor o en un servicio gestionado.
- Generación de audio para contenido narrativo o educativo de bajo presupuesto: dos voces estables permiten producir locuciones de material formativo o demo sin depender de grabaciones ni de APIs de terceros.
- Sistemas de megafonía o kioscos offline: entornos sin red (museos, comercios, salas de espera) donde se requiere síntesis local y determinista con un coste de hardware mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, métricas de inteligibilidad (WER sobre audio sintetizado), tasas de error de pronunciación, RTF ni comparaciones con el modelo base sin cuantizar, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización int8/fp16.

## Requisitos de hardware

- VRAM estimada: no hay cifras oficiales. Como referencia de orden de magnitud, el repositorio completo pesa 0,1 GB, por lo que los pesos en int8/fp16 caben con holgura en cualquier GPU consumer actual e incluso en memoria unificada de dispositivos móviles.
- CPU: es el escenario natural de despliegue; ONNX Runtime con cuantización dinámica int8 está diseñado precisamente para inferencia en CPU.
- GPU recomendadas: no se especifican. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, serie RTX 40 de NVIDIA o Apple Silicon vía Core ML/ONNX Runtime) es sobradamente suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo con unos cientos de MB de memoria libre; no se publica una cifra exacta de consumo en inferencia.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript y móvil). No aplica vLLM ni llama.cpp, que no ejecutan grafos ONNX de TTS. No se documentan integraciones con TGI, Ollama ni pipelines de Transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de tiempo a primer audio, ni en CPU ni en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / notas |
|---|---|---|---|---|
| Lamma narrator voice (v1) | No disponible | en, ar | OpenRAIL-M | ONNX int8/fp16, 0,1 GB, 2 voces |
| Supertonic 3 (Supertone) | No disponible | No disponible en esta ficha | Según su model card (no verificada aquí) | Modelo base del que deriva; incluye los pesos sin cuantizar |
| Kokoro-82M | 82 M | Principalmente inglés y varios más | Apache 2.0 | Pesos PyTorch/ONNX; orientado a TTS ligero en dispositivo |
| Piper (VITS) | No disponible | Decenas de idiomas y voces | MIT | ONNX, pensado para Raspberry Pi y sistemas embebidos |
| XTTS v2 (Coqui) | No disponible | Multilingüe, incluye clonación | Coqui Public Model License (uso no comercial) | Requiere más recursos; no está cuantizado para móvil |

Los datos de los modelos comparables proceden de conocimiento público general y no se han verificado contra sus model cards en esta ficha; conviene confirmarlos antes de tomar una decisión. Frente a ellos, la diferencia relevante de Lamma narrator voice es la cuantización int8/fp16 ya aplicada y la inclusión de árabe; su desventaja es la ausencia total de métricas y de comunidad.

## Limitaciones y advertencias

- Solo dos voces (`F1` y `M1`) y dos idiomas (inglés y árabe). No hay soporte de castellano ni de otras lenguas, y no se documenta clonación ni adaptación de voz.
- No se han publicado métricas de calidad, inteligibilidad ni comparaciones con el modelo base; se desconoce el impacto real de la cuantización int8 en la naturalidad del audio.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y texto con mezcla de idiomas: no se documenta normalización de texto más allá del `unicode_indexer.json`.
- Idiomas de bajos recursos: el árabe presenta mayor variación dialectal; no se especifica qué variedad se ha entrenado, lo que puede producir lecturas con registro inadecuado.
- Sesgos: al no documentarse el dataset de entrenamiento del modelo base, no es posible evaluar sesgos de género, acento o origen en las dos voces disponibles. La única distinción declarada es F/M.
- Todos los audios generados son sintéticos y la model card lo advierte explícitamente; en varios contextos (por ejemplo, Unión Europea) esto implica obligaciones de transparencia si el audio se difunde.
- Restricciones de licencia: OpenRAIL-M incluye el apartado 5 y el Anexo A («Use Restrictions»), que limitan ciertos usos (entre ellos, suplantación de identidad, desinformación y vigilancia). Cualquiera que reciba el modelo debe aceptar las mismas restricciones, y la licencia exige mantener los avisos de modificación recogidos en el apartado 4c.
- Uso comercial: permitido por OpenRAIL-M, pero sujeto a esas restricciones de uso; conviene revisar el texto completo de `LICENSE` antes de distribuir un producto.
- Trazabilidad y mantenimiento: repositorio con 0 descargas y 0 likes, sin issues ni documentación adicional; es un artefacto interno de una aplicación, no un modelo con soporte comunitario.
- No apto para usos que exijan voz de alta fidelidad o expresividad: no hay control de emoción, énfasis ni estilo más allá de elegir una de las dos voces.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anventureslabs/lamma-narrator
- Modelo base Supertonic 3: https://huggingface.co/Supertone/supertonic-3
- Licencia OpenRAIL-M: incluida como `LICENSE` en el repositorio del modelo
- La búsqueda web realizada no devolvió enlaces técnicos relevantes (papers, blogs, repos o demos) sobre este modelo; no se dispone de documentación adicional, informes de evaluación ni demos públicas.
