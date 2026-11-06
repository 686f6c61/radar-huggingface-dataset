# HY-2012/LavaSR.AXERA

## Resumen

LavaSR.AXERA es una adaptación del modelo de superresolución de voz LavaSR (YatharthS/LavaSR) para su ejecución en la NPU de los SoC AX650 de AXERA, publicada por el usuario HY-2012. El modelo toma audio de voz con un ancho de banda de entrada de entre 8 y 48 kHz y lo reconstruye a 48 kHz, incorporando además una etapa opcional de reducción de ruido basada en UL-UNAS. Es, por tanto, un modelo de audio-a-audio orientado a extensión de ancho de banda (BWE) y mejora de voz, no un modelo de lenguaje.

La relevancia de esta ficha no está en el modelo base, sino en el empaquetado para hardware de borde: tres ficheros `axmodel` que suman 38 MB y una cadena de inferencia completa en C++ y Python que alcanza un RTF de 0,061 en la NPU del AX650N (aproximadamente 16 veces tiempo real en la cadena completa, y 0,039 en la etapa BWE). Esto lo convierte en una opción práctica para integrar restauración de voz en dispositivos empotrados con NPU, sin depender de GPU ni de servicios en la nube.

El repositorio tiene un tamaño de 0,1 GB, 40 descargas y ninguna valoración en el momento de la consulta. La licencia no está declarada en la model card, lo que es un caveat importante para uso comercial. Los idiomas declarados son inglés y chino, coherente con los ejemplos de audio publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de superresolución de voz derivado de LavaSR; pesos convertidos a formato `axmodel` para NPU AX650) |
| Parametros totales | No disponible (no se declara el recuento; el artefacto desplegado son 3 `axmodel` de 38 MB en total) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio; entrada de 8–48 kHz, salida fija a 48 kHz) |
| Tipos de cuantizacion | No disponible (los `axmodel` van precompilados para la NPU AX650; no se detallan precisiones por capa) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | No disponible |
| Formato de pesos | `axmodel` (artefactos compilados para NPU AX650); el modelo base original está en Hugging Face como YatharthS/LavaSR |
| Pipeline | audio-to-audio |
| Librería | `axera` |
| Modelo base | YatharthS/LavaSR (finetune) |
| Tamaño del repo | 0,1 GB |
| RTF medido (C++ completo) | 0,061 (≈16× tiempo real) |
| RTF medido (etapa BWE) | 0,039 |
| Entrada / salida | 8–48 kHz → 48 kHz fijo |
| Etapa de denoising | UL-UNAS, opcional (`--no-denoise` para desactivarla) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LavaSR ni los datos de entrenamiento empleados por su autor original (YatharthS). Lo que sí se documenta es el proceso de adaptación: los pesos se convierten a tres artefactos `axmodel` que se ejecutan sobre la NPU3 del SoC AX650 de AXERA, con una cadena de inferencia implementada en C++ y en Python. La cadena completa integra la extensión de ancho de banda y, opcionalmente, un módulo de reducción de ruido UL-UNAS.

El autor indica que probó tres alternativas en la placa AX650N (AudioSR, LavaSR y FlowHigh) y que LavaSR fue la que ofreció mejor relación calidad/velocidad, motivo por el que se recomienda como opción principal. No se publican detalles sobre el dataset de entrenamiento, el número de tokens o horas de audio, ni sobre si hubo ajuste fino adicional respecto al modelo base. Tampoco se documentan innovaciones arquitectónicas propias más allá de la compilación para NPU y la integración del pipeline.

## Capacidades

- Superresolución de voz: reconstruye audio de entrada de 8 a 48 kHz y lo entrega a 48 kHz fijos.
- Extensión de ancho de banda (BWE): reconstruye las frecuencias altas ausentes en señales de banda estrecha (por ejemplo, 8 kHz telefónico).
- Reducción de ruido opcional mediante UL-UNAS, activable o desactivable con el flag `--no-denoise`.
- Procesamiento en tiempo real: RTF de 0,061 en C++ sobre AX650N, lo que permite flujos en vivo.
- Idiomas: inglés y chino, según los ejemplos publicados (Open Speech / Samplelib).
- Formatos de entrada flexibles: cualquier frecuencia de muestreo entre 8 y 48 kHz.
- Dos SDK de integración: C++ (por defecto) y Python (`--python`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio.

## Casos de uso

- Restauración de grabaciones telefónicas: llamadas a 8 kHz se pueden reprocesar a 48 kHz para mejorar inteligibilidad y calidad percibida en sistemas de atención al cliente o archivos históricos, usando la cadena C++ sobre el propio dispositivo.
- Preprocesado para ASR en el borde: elevar el ancho de banda y aplicar denoising antes de alimentar un motor de reconocimiento de voz en un dispositivo con NPU AX650, reduciendo errores en audio de baja calidad.
- Limpieza de audio para transcripción de reuniones: aplicar la etapa UL-UNAS para eliminar ruido de fondo y luego la BWE para mejorar la señal antes de la transcripción.
- Digitalización de archivos de audio antiguos: grabaciones de voz con ancho de banda limitado pueden recuperarse a 48 kHz para archivo o difusión, con la ventaja de ejecutarse localmente sin subir el material a la nube.
- Dispositivos de borde con requisitos de privacidad: al ejecutarse íntegramente en la NPU del AX650, el audio no sale del dispositivo, lo que encaja en aplicaciones de voz en entornos sanitarios o corporativos.
- Integración en cámaras o dispositivos de captura con micrófonos de bajo coste: la BWE compensa las limitaciones de micrófonos de banda estrecha en hardware empotrado.
- Prototipado rápido con el SDK de Python: para validar la calidad de la restauración antes de pasar a la implementación C++ en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (PESQ, STOI, MOS, etc.) en la información disponible. Los únicos datos cuantitativos publicados son de velocidad y tamaño:

| Metrica | Valor |
|---|---|
| RTF cadena C++ completa (AX650N) | 0,061 (≈16× tiempo real) |
| RTF etapa BWE | 0,039 |
| Tamaño total de los `axmodel` | 38 MB |
| Número de artefactos `axmodel` | 3 |

La model card incluye muestras de audio de entrada y salida (espectrogramas y WAV) para inglés y chino sobre el corpus Open Speech / Samplelib, pero no se aportan métricas numéricas de calidad.

## Requisitos de hardware

- Hardware objetivo: SoC AX650 de AXERA, con NPU3 (probado en placa AX650N).
- VRAM: no aplica; el modelo se ejecuta en la NPU del SoC, no en GPU.
- GPU: no se requiere ni se documenta soporte para CUDA, A100, H100 ni RTX 4090.
- Consumo de memoria del modelo: 38 MB en tres `axmodel`, más el runtime de la cadena de inferencia.
- Despliegue: cadena propia del repositorio (`run_ax650.sh`) con SDK en C++ (por defecto) y Python (`--python`).
- vLLM, llama.cpp, Ollama o TGI: no aplican a este modelo.
- Latencia y throughput: RTF 0,061 en C++ completo y 0,039 en la etapa BWE, medidos en placa AX650N.

## Comparativa con modelos similares

El autor menciona haber probado AudioSR, LavaSR y FlowHigh en la misma placa AX650N, pero no publica tabla comparativa de parámetros, calidad ni licencia. La única conclusión explícita es que LavaSR ofrece la mejor combinación de calidad y velocidad. Los datos disponibles son escasos:

| Modelo | Tipo | Hardware probado | RTF publicado | Licencia | Notas |
|---|---|---|---|---|---|
| LavaSR.AXERA (este) | Superresolución de voz + denoising | AX650N / NPU3 | 0,061 (completo), 0,039 (BWE) | No disponible | 38 MB en 3 `axmodel` |
| AudioSR | Superresolución de audio | AX650N / NPU3 | No disponible | No disponible | Probado por el autor, no recomendado como primera opción |
| FlowHigh | Superresolución de voz | AX650N / NPU3 | No disponible | No disponible | Probado por el autor, no recomendado como primera opción |

No se dispone de datos suficientes para comparar parámetros, contexto ni métricas de calidad con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es un bloqueante potencial para producción.
- Sesgos: no documentados; al ser un modelo de audio, los sesgos se manifestarían en la calidad de reconstrucción según idioma, acento o tipo de voz, pero no se aportan análisis.
- Riesgo de artefactos: la superresolución de voz puede introducir artefactos o sonidos sintéticos en las frecuencias reconstruidas; no se publican métricas objetivas de fidelidad.
- Idiomas limitados: solo inglés y chino en los ejemplos publicados; el comportamiento en otras lenguas no está documentado.
- Dependencia de hardware: los `axmodel` están compilados para la NPU AX650; no son portables a otras NPU o GPU sin reconversión.
- Modelo base poco documentado: no se detallan datos de entrenamiento ni arquitectura del LavaSR original, lo que dificulta evaluar riesgos.
- Repositorio con poca tracción: 40 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Sin benchmarks de calidad: no hay PESQ, STOI ni MOS publicados, por lo que la evaluación cualitativa depende de las muestras de audio incluidas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/HY-2012/LavaSR.AXERA
- Repositorio GitHub del port: https://github.com/ZY-2012/LavaSR.AXERA
- Modelo base en Hugging Face: https://huggingface.co/YatharthS/LavaSR
- Repositorio GitHub del modelo base: https://github.com/ysharma3501/LavaSR
