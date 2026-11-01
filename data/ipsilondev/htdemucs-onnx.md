# ipsilondev/htdemucs-onnx

## Resumen

HT-Demucs ONNX es una distribución en formato ONNX del modelo HT-Demucs (Demucs v4), un sistema de separación de fuentes musicales que divide una mezcla de audio estéreo en cuatro pistas o stems: batería, bajo, otros instrumentos y voz. Lo publica el usuario ipsilondev en HuggingFace bajo licencia MIT, con el objetivo explícito de facilitar el despliegue en entornos móviles y de borde (Android, iOS, escritorio) mediante ONNX Runtime, evitando las dependencias del ecosistema PyTorch original.

El repositorio incluye dos variantes de pesos: una versión completa en FP32 de 316 MB y una versión con pesos en FP16 de 166 MB, pensada para dispositivos con poca memoria RAM. La entrada es un tensor estéreo de 343.980 muestras a 44,1 kHz (aproximadamente 7,8 segundos) y la salida es un tensor de cuatro stems con la misma resolución temporal. El modelo no procesa lenguaje ni texto; su pipeline es audio-to-audio y los metadatos de idioma (en) son meramente administrativos.

Es relevante porque cubre un nicho práctico: la separación de stems en tiempo real sobre hardware modesto, sin necesidad de GPU dedicada ni de framework de deep learning completo. La ausencia de descargas y likes en el momento de la consulta indica que es una publicación reciente y poco difundida, no un modelo con validación comunitaria extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HT-Demucs (Demucs v4), red neuronal híbrida para separación de fuentes; detalles internos de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 343.980 muestras (~7,8 s a 44,1 kHz) por segmento |
| Tipos de cuantizacion | FP32 (fichero completo) y FP16 en pesos con E/S FP32 |
| Idiomas soportados | no aplica (audio); metadato declarado: en |
| Licencia | MIT |
| Formato de pesos | ONNX (para ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo subyacente es HT-Demucs, la variante del proyecto Demucs v4 orientada a separación musical de cuatro stems. La model card de esta distribución no describe la arquitectura interna, el número de capas, los datos de entrenamiento ni el proceso de optimización, por lo que esos detalles deben consultarse en la documentación del proyecto Demucs original. La publicación se limita a la exportación y empaquetado de los pesos en ONNX.

La innovación de esta distribución es de ingeniería de despliegue, no de modelado: se ofrecen dos ficheros ONNX con especificaciones tensoriales explícitas (entrada `[1, 2, 343980]` float32, salida `[1, 4, 2, 343980]` float32) y una configuración de inferencia recomendada basada en chunking con overlap-add y ventana trapezoidal (segmento de 343.980 muestras, solape del 25 % —85.995 muestras— y stride de 257.985 muestras). No se documenta RLHF, ajuste fino ni datos de entrenamiento en esta ficha.

## Capacidades

- Separación de audio estéreo en cuatro stems: batería (índice 0), bajo (índice 1), otros (índice 2) y voz (índice 3).
- Procesamiento por segmentos de ~7,8 segundos con reconstrucción mediante overlap-add, lo que permite tratar pistas de duración arbitraria encadenando ventanas.
- Inferencia en CPU y en dispositivos móviles a través de ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecución.
- Variante FP16 con menor huella de memoria para Android e iOS.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente audio-a-audio.
- No procesa visión, audio de entrada en lenguaje natural ni instrucciones textuales.

## Casos de uso

- Eliminación de voz para karaoke: se ejecuta el modelo sobre la mezcla y se descarta el stem de voz (índice 3), conservando batería, bajo y otros para generar la pista instrumental.
- Aplicaciones móviles de práctica musical: la variante FP16 (166 MB) cabe en el almacenamiento y la memoria de un teléfono moderno y permite separar stems en local sin enviar el audio a un servidor, lo que reduce latencia y preserva la privacidad.
- Producción musical y remezclas: obtener stems separados para reequilibrar niveles, aplicar efectos por instrumento o samplear fragmentos concretos de una grabación.
- Creación de datasets de audio: generar pares mezcla/stem para entrenar otros modelos de separación o de clasificación musical.
- Transcripción y análisis asistidos: aislar la pista vocal antes de pasarla a un sistema de reconocimiento de voz o de alineación de letras, mejorando la relación señal-ruido del habla cantada.
- Herramientas de accesibilidad y edición: silenciar o atenuar instrumentos concretos en una grabación para facilitar la escucha de la voz en contextos educativos o de rehabilitación auditiva.
- Procesamiento por lotes en servidor: con el fichero FP32 (316 MB) y ONNX Runtime sobre CPU o GPU, integrar la separación en un pipeline de postproducción que procese archivos largos mediante chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas de separación (SDR, SIR, SAR) ni comparaciones cuantitativas con otras implementaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante FP16 ocupa 166 MB en disco y la FP32 316 MB; a ello hay que sumar el estado de activaciones y los buffers de overlap-add, no cuantificados en la documentación.
- GPU recomendadas: no especificadas. Al ser ONNX Runtime, puede ejecutarse en CPU y, si se configura el execution provider correspondiente, en GPU NVIDIA (CUDA/TensorRT) o en aceleradores móviles (NNAPI, Core ML).
- Compatibilidad con GPU de consumo: el tamaño reducido de los pesos sugiere que cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior), aunque no se aportan cifras de VRAM ni de rendimiento.
- Opciones de despliegue: ONNX Runtime en Android, iOS, escritorio y servidor; también es posible cargarlo desde Python con `onnxruntime` o `onnxruntime-gpu`.
- Latencia y throughput: no disponibles. Dependen del hardware, del execution provider y de la longitud total del audio a procesar.

## Comparativa con modelos similares

| Modelo | Formato | Stems | Licencia | Distribución |
|---|---|---|---|---|
| HT-Demucs ONNX (este) | ONNX | 4 (drums, bass, other, vocals) | MIT | HuggingFace, orientado a móvil y edge |
| Demucs v4 / HT-Demucs original | PyTorch | 4 | MIT (según proyecto Demucs) | Repositorio oficial de Meta Research |
| Otras distribuciones ONNX de Demucs | ONNX | variable según exportación | variable | Repositorios de terceros, no verificados aquí |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a formato, número de stems y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo base ni evaluación de calidad de separación; no hay garantías cuantitativas sobre la fidelidad de los stems.
- Riesgo de artefactos audibles en los bordes de segmento si no se respeta la configuración de overlap-add recomendada (25 % de solape, ventana trapezoidal).
- La ventana de entrada es fija (343.980 muestras); audios de otra duración requieren chunking manual y reconstrucción, lo que añade complejidad de integración.
- Solo admite audio estéreo a 44,1 kHz; otras frecuencias de muestreo o audio mono requieren remuestreo y conversión de canales previos.
- El metadato de idioma (en) no implica capacidades lingüísticas: el modelo no procesa texto.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia y atribución del proyecto Demucs original del que derivan los pesos.
- Publicación con cero descargas y cero likes: sin validación comunitaria ni reportes independientes de calidad o estabilidad.
- No se especifican requisitos de memoria pico ni comportamiento en dispositivos de gama baja más allá de la reducción de tamaño de los pesos.

## Enlaces

- HuggingFace: https://huggingface.co/ipsilondev/htdemucs-onnx
- Proyecto Demucs (Meta Research): https://github.com/facebookresearch/demucs
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de ONNX: https://onnx.ai/
