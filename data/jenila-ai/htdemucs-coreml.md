# jenila-ai/htdemucs-coreml

## Resumen

HTDemucs (Core ML, Apple Neural Engine) es una conversión del modelo de separación de fuentes musicales HTDemucs de Meta AI al formato Core ML, empaquetada como ML Program en FP16 para ejecutarse sobre la Apple Neural Engine. El modelo separa una mezcla musical estéreo en cuatro pistas (batería, bajo, otros y voz) y está pensado para integrarse en aplicaciones nativas de macOS e iOS mediante el framework Core ML de Apple. Lo publica el usuario jenila-ai y los pesos proceden del checkpoint MLX de demucs-mlx.

La particularidad de este paquete es que no incluye las etapas de STFT ni iSTFT: el modelo recibe directamente el espectrograma estandarizado y la forma de onda estandarizada, y devuelve las representaciones por fuente que el llamante debe desestandarizar y reconstruir. La entrada es de forma fija, un segmento estéreo de 7,8 segundos a 44,1 kHz (343.980 muestras), lo que condiciona el diseño de cualquier pipeline que lo consuma.

Es relevante para desarrolladores que quieran ejecutar separación de fuentes en local sobre hardware Apple sin depender de PyTorch ni de un servidor, aprovechando la Neural Engine. El repositorio es pequeño (0,1 GB) y la licencia es MIT, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (transformer híbrido dominio tiempo-frecuencia), convertido a Core ML ML Program |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 7,8 s estéreo a 44,1 kHz (343.980 muestras) |
| Tipos de cuantizacion | FP16 (ML Program) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` compuesto por `htdemucs_core.mlmodel`, `htdemucs_core_weight.bin` y `htdemucs_core_manifest.json` |

## Arquitectura y entrenamiento

HTDemucs es una arquitectura híbrida que combina una rama en el dominio de la frecuencia (procesamiento sobre el espectrograma) con una rama en el dominio temporal (procesamiento sobre la forma de onda), fusionando ambas representaciones para producir las cuatro pistas separadas. La conversión a Core ML mantiene esa estructura de doble rama: la entrada `x` es el STFT estandarizado con canales complejos codificados como canales reales (forma 1 x 4 x 2048 x 336, con n_fft 4096 y hop 1024) y la entrada `xt` es la forma de onda estandarizada (1 x 2 x 343.980). Las salidas son `spec` (1 x 4 x 4 x 2048 x 336) y `wave` (1 x 4 x 2 x 343.980), ambas por fuente y todavía estandarizadas.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o muestras, ni sobre si hubo ajuste por RLHF u otras técnicas de alineación; esos datos corresponden al modelo original de Meta AI y no se detallan en la model card. La innovación técnica de esta conversión es la adaptación de operaciones no nativas de la Neural Engine: GELU y GLU se reconstruyen sobre la función tanh del motor, y la convolución transpuesta del primer decodificador temporal se calcula como cuatro convoluciones intercaladas. El autor reporta una diferencia de 41-50 dB de SNR por pista frente a las salidas del checkpoint MLX de referencia.

## Capacidades

- Separación de fuentes musicales en cuatro pistas: batería, bajo, otros y voz.
- Procesamiento de audio estéreo a 44,1 kHz en segmentos de 7,8 segundos.
- Ejecución sobre la Apple Neural Engine mediante Core ML (`cpuAndNeuralEngine`).
- Inferencia local sin dependencia de PyTorch ni de servicios en la nube.
- No incluye STFT ni iSTFT: requiere que el llamante calcule el espectrograma estandarizado y reconstruya las pistas.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente de audio.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada distinto del descrito.

## Casos de uso

- Aplicaciones de karaoke y eliminación de voz: el modelo aísla la pista de voz del resto de la mezcla, de modo que una app de iOS o macOS puede generar versiones instrumentales de canciones de forma local, sin subir el audio a un servidor.
- Producción musical y remezclas: un DAW o plugin puede separar una mezcla en cuatro pistas para que el usuario ajuste niveles, aplique efectos o reutilice stems, aprovechando la latencia baja de la Neural Engine en segmentos de 7,8 s.
- Edición de audio para podcast y vídeo: separar voz y música de fondo permite limpiar grabaciones, sustituir bandas sonoras o ecualizar la locución sin afectar al acompañamiento.
- Entrenamiento y análisis musical: la separación en stems facilita tareas de transcripción, análisis de patrones rítmicos o extracción de características por instrumento en pipelines de investigación.
- Herramientas de accesibilidad: aislar la voz para mejorar la inteligibilidad en reproducción de contenido musical o mixto, con procesamiento en el dispositivo que preserva la privacidad del audio.
- Aplicaciones de DJ y mashup: separar pistas en tiempo de ejecución para mezclar componentes de distintas canciones (por ejemplo, la batería de una con la voz de otra) en una app nativa de Apple.
- Procesamiento por lotes en macOS: integrado en un script o app de escritorio, permite separar bibliotecas musicales completas sin coste de GPU en la nube, dado el tamaño reducido del paquete (0,1 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta que, frente a las salidas del checkpoint MLX de referencia, la diferencia es de 41-50 dB de SNR por pista.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en Core ML sobre Apple Neural Engine no consume VRAM de GPU dedicada en el sentido habitual.
- Hardware recomendado: dispositivos Apple con Neural Engine (chips de la serie A y M); el autor indica el cómputo `cpuAndNeuralEngine`.
- Cabe en hardware de consumo: sí, en equipos Apple con Neural Engine; el repositorio ocupa 0,1 GB.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del dispositivo y del número de segmentos de 7,8 s a procesar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HTDemucs Core ML (este) | no disponible | segmento fijo de 7,8 s, 44,1 kHz estéreo | `.mlpackage` (FP16) | MIT | HuggingFace |
| HTDemucs original (Meta AI) | no disponible | segmentos configurables, 44,1 kHz | PyTorch | MIT | GitHub de Meta AI |
| demucs-mlx | no disponible | segmentos configurables, 44,1 kHz | MLX | no disponible en la información | HuggingFace (ssmall256/demucs-mlx) |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la diferencia de 41-50 dB de SNR reportada frente al checkpoint MLX.

## Limitaciones y advertencias

- Entrada de forma fija: solo acepta segmentos de 7,8 s (343.980 muestras) a 44,1 kHz; el llamante debe trocear el audio y gestionar los solapamientos.
- No incluye STFT ni iSTFT: es responsabilidad del integrador calcular el espectrograma estandarizado y reconstruir las pistas, lo que añade complejidad al pipeline.
- Las salidas están estandarizadas; es necesario desestandarizarlas antes de obtener audio utilizable.
- Dependencia de hardware Apple con Neural Engine; no es portable a otras plataformas sin reconversión.
- No se documentan sesgos, pero al ser un modelo de separación de audio, puede degradar la calidad en mezclas muy densas, instrumentos poco representados o grabaciones con ruido.
- Riesgo de artefactos o sangrado entre pistas (bleed) en pasajes con instrumentos solapados; el autor no publica métricas de calidad perceptual (SDR, SIR) en la model card.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo original de Meta AI y del checkpoint MLX de origen.
- No hay información sobre idiomas ni sobre el dataset de entrenamiento, lo que limita la evaluación de su comportamiento fuera del dominio musical occidental.
- El repositorio tiene muy pocas descargas (8) y ningún like, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jenila-ai/htdemucs-coreml
- Repositorio original de HTDemucs (Meta AI): https://github.com/facebookresearch/demucs
- Checkpoint MLX de origen: https://huggingface.co/ssmall256/demucs-mlx
- Licencia: https://huggingface.co/jenila-ai/htdemucs-coreml/blob/main/LICENSE
