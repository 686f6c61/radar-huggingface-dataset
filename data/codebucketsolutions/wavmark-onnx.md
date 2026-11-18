# codebucketsolutions/wavmark-onnx

## Resumen

WavMark ONNX es una exportación a formato ONNX del modelo de marcado de agua (watermarking) de audio WavMark, desarrollado originalmente por Guangyu Chen, Yu Wu, Shujie Liu, Tao Liu, Xiaoyong Du y Furu Wei (publicado en arXiv:2308.12770). Esta versión concreta la mantiene el usuario codebucketsolutions y se limita a convertir los pesos originales del checkpoint `step59000_snr39.99_pesq4.35_BERP_none0.30_mean1.81_std1.81.model.pkl` de `M4869/WavMark` a dos grafos ONNX, sin modificar los pesos. No es una release oficial de los autores de WavMark.

El modelo resuelve el problema de incrustar y recuperar una marca imperceptible en audio de 16 kHz: oculta 32 bits por segundo de audio, de los cuales 16 se usan como patrón fijo de sincronización y 16 como carga útil. La exportación incluye la STFT (1000 puntos, hop 400, ventana Hann), la red invertible y la ISTFT dentro de los grafos, lo que permite ejecutar el marcado y la detección sin dependencia de PyTorch en tiempo de inferencia.

Es relevante para pipelines de procedencia de audio generado por IA, verificación de autoría y trazabilidad de contenido sintético, donde se necesita una implementación portable y desplegable en entornos ONNX Runtime. El repositorio es de tamaño 0.0 GB, sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red invertible sobre representación STFT (dominio tiempo-frecuencia), con STFT/ISTFT integradas en los grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de 1 segundo (16000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible (los grafos son float32) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre señal de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18): `wavmark_embed.onnx` y `wavmark_detect.onnx` |

## Arquitectura y entrenamiento

WavMark emplea una red neuronal invertible que opera sobre la representación tiempo-frecuencia del audio. La STFT (1000 puntos, hop 400, ventana Hann) transforma la señal de 16 kHz en un espectrograma, la red invertible modifica esa representación para incrustar la marca y la ISTFT reconstruye la señal temporal. Como `torch.istft` no exporta a ONNX, los grafos usan una implementación equivalente basada en productos matriciales, reshapes y pads (`OnnxISTFT`), con una desviación máxima de 1.5e-6 respecto a `torch.istft`.

El esquema de marcado oculta 32 bits por segundo: 16 bits de patrón fijo para localizar la marca y 16 bits de carga útil. El paquete `wavmark` marca un segundo de cada 1.1 s y busca el patrón cada 50 ms al decodificar; esa lógica de ventaneo y búsqueda queda fuera de los grafos. Los pesos exportados son los del checkpoint `step59000_snr39.99_pesq4.35_BERP_none0.30_mean1.81_std1.81` de `M4869/WavMark`, cargados con el paquete `wavmark` 0.0.3 y sin modificación. No se dispone de detalles sobre el dataset de entrenamiento, número de tokens ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Incrustación de marcas de agua en audio de 16 kHz: 32 bits por segundo (16 de patrón fijo y 16 de carga útil).
- Detección y decodificación de marcas en audio marcado, devolviendo 32 bits en rango -1..1 (un bit se considera 1 a partir de 0.5).
- Portabilidad a ONNX Runtime mediante dos grafos independientes (`wavmark_embed.onnx` y `wavmark_detect.onnx`).
- Procesamiento por ventanas de un segundo con solapamiento gestionado externamente (marcado de 1 s cada 1.1 s, búsqueda cada 50 ms).
- Paridad verificada con la implementación PyTorch original en dos clips de voz a 16 kHz.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de señal de audio, no un LLM.

## Casos de uso

- Procedencia de audio generado por IA: incrustar una marca de 16 bits de carga útil en cada segundo de audio sintético para identificar el modelo o la fuente que lo generó, aprovechando la portabilidad ONNX para integrarlo en el pipeline de generación.
- Verificación de autoría en plataformas de distribución: detectar la marca en audio subido por usuarios mediante `wavmark_detect.onnx` en un servicio ONNX Runtime, con búsqueda del patrón cada 50 ms para localizar segmentos marcados.
- Trazabilidad en producción musical y de podcast: marcar cada segundo de un máster con un identificador de licencia o de cliente, manteniendo la marca tras la distribución del fichero.
- Detección de deepfakes de voz: comprobar si un clip contiene la marca de un generador conocido para distinguir audio sintético de grabaciones reales en flujos de moderación.
- Integración en entornos sin PyTorch: desplegar el marcado y la detección en servicios basados en ONNX Runtime (C++, C#, Java, Node.js) donde no se quiere arrastrar la dependencia de PyTorch.
- Auditoría de datasets de audio: marcar lotes de clips de 16 kHz con un identificador de lote y verificar posteriormente su origen en procesos de curación de datos.
- Canal encubierto de baja tasa: transportar 16 bits por segundo de carga útil en audio, útil para sincronización o identificación en experimentos de esteganografía de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La model card incluye una tabla de paridad entre PyTorch y ONNX:

| Métrica | Clip de 11.8 s (10 s marcados) | Clip de 4.1 s (3 s marcados) |
|---|---|---|
| Diferencia máxima absoluta en audio marcado (PyTorch vs ONNX) | 5.8e-5 | 6.3e-5 |
| Diferencia máxima absoluta en salida del decodificador sobre audio marcado | 1.4e-3 | 2.8e-3 |
| Bits correctos, marcado por PyTorch: decodificado por PyTorch / ONNX | 100 % / 100 % | 100 % / 100 % |
| Bits correctos, marcado por ONNX: decodificado por PyTorch / ONNX | 100 % / 100 % | 100 % / 100 % |
| Bits correctos en audio sin marcar (azar) PyTorch / ONNX | 49.7 % / 49.7 % | 41.7 % / 41.7 % |

Las pruebas se ejecutaron con torch 2.15 en CPU sobre dos clips de voz a 16 kHz, marcando un segundo de cada 1.1 s con mensajes aleatorios de 32 bits. El fichero `parity.json` contiene los números exactos. No se proporcionan métricas de calidad perceptual (PESQ, BER) para esta exportación más allá de las incluidas en el nombre del checkpoint original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los grafos procesan tensores de `[B, 16000]` en float32 y el consumo depende del tamaño de lote.
- GPU recomendadas: no disponible; al ser una red pequeña sobre ventanas de un segundo, es viable en CPU y en GPU consumer.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0.0 GB) y la entrada de un segundo de audio, aunque no se publican cifras de memoria.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) en cualquiera de sus bindings; los grafos son opset 18.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Marca por segundo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codebucketsolutions/wavmark-onnx | Exportación ONNX de WavMark | 32 bits (16 patrón + 16 carga) | ONNX opset 18 | MIT | Hugging Face |
| M4869/WavMark | Implementación original PyTorch | 32 bits (16 patrón + 16 carga) | PyTorch (.pkl) | MIT | Hugging Face |
| AudioSeal (Meta) | Watermarking neuronal para audio generado | no disponible en la información | PyTorch | no disponible en la información | no disponible en la información |
| Audiowmark (Stefan Westerfeld) | Watermarking clásico de audio | no disponible en la información | C++ | no disponible en la información | no disponible en la información |

La comparativa con AudioSeal y Audiowmark se incluye como referencia de categoría, pero sus especificaciones no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- No es una release oficial de los autores de WavMark; es una exportación de terceros de los pesos originales.
- Solo procesa audio a 16 kHz y ventanas de un segundo; el ventaneo (1 s cada 1.1 s) y la búsqueda del patrón (cada 50 ms) deben implementarse fuera de los grafos.
- La carga útil es de solo 16 bits por segundo, insuficiente para identificadores largos sin repetición o codificación externa.
- En audio sin marcar, la tasa de bits correctos es cercana al azar (49.7 % y 41.7 % en las pruebas), por lo que la detección debe basarse en la coincidencia del patrón, no en bits aislados.
- No se publican métricas de robustez frente a compresión con pérdida, recorte, remuestreo o ataques adversarios en esta exportación.
- No hay información sobre sesgos, alucinación (no aplica a este tipo de modelo) ni restricciones de idioma.
- Licencia MIT declarada tanto en el modelo original como en el paquete `wavmark`; conviene verificar los términos exactos del `LICENSE` del paquete antes de uso comercial.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción.
- `inference: false` en los metadatos de la model card: la inferencia se realiza con los grafos ONNX directamente, no mediante la API de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/wavmark-onnx
- Modelo base: https://huggingface.co/M4869/WavMark
- Paper WavMark (arXiv:2308.12770): https://arxiv.org/abs/2308.12770
- Paquete `wavmark` (PyPI): https://pypi.org/project/wavmark/
- Repositorio del paquete `wavmark`: no disponible en la información proporcionada
- Script de exportación `export_watermarkers.py`: no disponible como enlace público en la información proporcionada
