# jenila-ai/htdemucs-onnx

## Resumen

HTDemucs (ONNX, INT8) es una exportación en formato ONNX del modelo de separación de fuentes musicales HTDemucs de Meta AI, adaptada para inferencia en CPUs de teléfonos móviles. El modelo original separa una mezcla musical estéreo en cuatro pistas (batería, bajo, otros y voz) y esta versión cuantiza dinámicamente a INT8 los pesos de las capas MatMul y Gemm mediante `quantize_dynamic` de ONNX Runtime, manteniendo las convoluciones en FP32. El resultado es un artefacto de unos 85 MB, aproximadamente la mitad del export FP32 del que deriva, y cerca de un 18 % más rápido en una CPU Apple M1 con cuatro hilos.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo generativo nuevo, sino de una conversión de despliegue de un modelo de audio ya existente. Su interés práctico está en la posibilidad de ejecutar separación de fuentes de cuatro pistas en dispositivos con recursos limitados, sin GPU, usando ONNX Runtime como runtime único. El modelo no incluye las etapas de STFT/iSTFT: el llamante debe calcular el espectrograma y reconstruir las pistas a partir de las salidas.

El repositorio es pequeño (0,1 GB), tiene licencia MIT y no registra descargas ni interacciones en el momento de la consulta. La información disponible procede exclusivamente de la model card del autor y de los metadatos de Hugging Face; no hay paper asociado ni resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (red híbrida tiempo-frecuencia de Meta AI), exportada a ONNX; pesos MatMul/Gemm cuantizados a INT8, convoluciones en FP32 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 7,8 s de audio estéreo a 44,1 kHz (343.980 muestras) |
| Tipos de cuantizacion | INT8 dinámica (`quantize_dynamic` de ONNX Runtime) sobre MatMul y Gemm; convoluciones en FP32; entradas y salidas en FP32 |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`htdemucs_int8.onnx`, 84.912.686 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es HTDemucs, el modelo híbrido de separación de fuentes musicales de Meta AI que combina procesamiento en el dominio temporal y en el dominio espectral. Esta exportación concreta no entrena nada: parte del export FP32 de `Ghilda/htdemucs-onnx`, a su vez convertido desde los pesos originales `htdemucs` de Meta bajo licencia MIT, y aplica cuantización dinámica INT8 mediante ONNX Runtime. Las convoluciones permanecen en FP32 y solo las operaciones MatMul y Gemm se cuantizan, lo que limita la pérdida de precisión.

El modelo tiene una forma de entrada fija y no incorpora STFT ni iSTFT. Recibe dos entradas: `mix`, una forma de onda estéreo de 1 x 2 x 343.980 (7,8 s a 44,1 kHz), y `mag`, un STFT representado como canales complejos de 1 x 4 x 2048 x 336 (n_fft 4096, hop 1024). El llamante debe calcular el espectrograma antes de la inferencia y reconstruir las cuatro pistas a partir de las salidas. Respecto al export FP32, las salidas difieren entre 37 y 41 dB SNR en la rama espectral y entre 35 y 40 dB SNR en la rama temporal, medido sobre tres ventanas de un mismo registro. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o horas de audio, ni sobre etapas de ajuste fino o RLHF, más allá de lo que documenta el proyecto Demucs de Meta.

## Capacidades

- Separación de fuentes musicales en cuatro pistas: batería, bajo, otros y voz, a partir de una mezcla estéreo.
- Procesamiento de audio estéreo a 44,1 kHz en ventanas fijas de 7,8 s (343.980 muestras); el manejo de pistas de mayor duración requiere segmentación por parte del llamante.
- Inferencia sobre CPU sin GPU, gracias a la cuantización INT8 dinámica y al runtime ONNX Runtime.
- Entradas y salidas en FP32, con espectrograma calculado externamente (n_fft 4096, hop 1024).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión ni de audio generativo; es un modelo discriminativo de separación de fuentes.

## Casos de uso

- Aplicaciones móviles de edición musical: el modelo cabe en el almacenamiento de un teléfono (85 MB) y se ejecuta en CPU, lo que permite separar pistas de una canción en el propio dispositivo sin enviar audio a un servidor.
- Preprocesado para pipelines de transcripción: separar la pista de voz antes de alimentar un sistema ASR mejora la relación señal-ruido en grabaciones musicales o con acompañamiento, usando la salida de voz del modelo como entrada del transcriptor.
- Remezcla y karaoke: extraer la pista de voz y la de acompañamiento para generar versiones sin voz de canciones, con segmentación de 7,8 s gestionada por la aplicación.
- Aislar instrumentos para producción musical: obtener batería y bajo por separado para analizar ritmo, tempo o líneas de bajo en herramientas de análisis musical.
- Aplicaciones offline en dispositivos embebidos: al no requerir GPU ni servicios externos, encaja en escenarios de privacidad donde el audio no debe salir del dispositivo.
- Filtrado y limpieza de archivos de audio: separar componentes para eliminar o atenuar una fuente concreta (por ejemplo, ruido musical de fondo) antes de un proceso de restauración.
- Prototipado e investigación en separación de fuentes: servir como referencia ligera y reproducible en ONNX Runtime para comparar frente al export FP32 en términos de SNR y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de fidelidad frente al export FP32: diferencias de 37-41 dB SNR en la rama espectral y 35-40 dB SNR en la rama temporal sobre tres ventanas de un registro, además de una reducción de tamaño a la mitad y una mejora de velocidad de aproximadamente el 18 % en una CPU Apple M1 con cuatro hilos. No hay datos de SDR, SI-SNR ni métricas estándar de separación de fuentes.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU. En GPU, el consumo sería mínimo por el tamaño del artefacto (85 MB), pero no se documentan requisitos.
- GPU recomendadas: no disponible; el autor orienta el modelo a CPUs de teléfonos.
- Cabe en cualquier CPU consumer y en dispositivos móviles; en GPU consumer (RTX 4090, etc.) funcionaría, pero no es el objetivo declarado.
- Opciones de despliegue: ONNX Runtime (runtime nativo para el que se exportó), con posibilidad de usar los execution providers de ONNX Runtime para CPU, GPU o aceleradores móviles; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible salvo la referencia de aproximadamente un 18 % más rápido que el export FP32 en Apple M1 con cuatro hilos; no se publican tiempos absolutos por ventana.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jenila-ai/htdemucs-onnx (este) | ONNX | INT8 dinámica (MatMul/Gemm) | 84,9 MB | 7,8 s fijos a 44,1 kHz | MIT | Hugging Face |
| Ghilda/htdemucs-onnx | ONNX | FP32 | no disponible (aproximadamente el doble) | 7,8 s fijos a 44,1 kHz | MIT | Hugging Face |
| HTDemucs original (Meta AI) | PyTorch | FP32 | no disponible | no disponible | MIT | GitHub facebookresearch/demucs |

La comparativa se limita a las variantes documentadas en la model card. No se dispone de datos sobre otros modelos de separación de fuentes (por ejemplo, variantes de Demucs, Spleeter o MDX) en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de audio, no de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling; cualquier expectativa en ese sentido es incorrecta.
- Entrada de forma fija: solo acepta ventanas de 7,8 s a 44,1 kHz; audio de mayor duración exige segmentación y reconstrucción manual, con posible coste en discontinuidades entre ventanas.
- No incluye STFT/iSTFT: el llamante debe implementar el cálculo del espectrograma (n_fft 4096, hop 1024) y la reconstrucción de las pistas; un error en esta etapa degrada la calidad de salida.
- Pérdida de fidelidad por cuantización: diferencias de 35-41 dB SNR frente al FP32, aceptables para reproducción pero no idénticas al modelo original.
- Sesgos: no documentados; al ser un modelo de separación de fuentes, los sesgos se refieren a posibles artefactos según el tipo de música, instrumentación o calidad de la mezcla, sin datos publicados al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero pueden aparecer artefactos espectrales o fugas entre pistas en mezclas difíciles.
- Licencia MIT: permite uso comercial y modificación, manteniendo el aviso de copyright; conviene verificar las condiciones del proyecto Demucs original y de los pesos de los que deriva.
- Madurez: repositorio sin descargas ni interacciones y creado en noviembre de 2026; no hay garantía de mantenimiento ni de soporte por parte del autor.
- Idiomas: no disponible; el modelo no procesa texto, por lo que la cobertura lingüística no es un criterio aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jenila-ai/htdemucs-onnx
- Export FP32 de referencia: https://huggingface.co/Ghilda/htdemucs-onnx
- Repositorio Demucs de Meta AI: https://github.com/facebookresearch/demucs
- Sitio del autor: https://www.jenila.com
- Licencia: https://huggingface.co/jenila-ai/htdemucs-onnx/blob/main/LICENSE
