# AnjaneyaTurai/stemdeck-models

## Resumen

StemDeck es una distribución en formato ONNX del modelo Hybrid Transformer Demucs (htdemucs_6s) de Meta, publicada por el usuario AnjaneyaTurai. No se trata de un modelo de lenguaje, sino de un modelo de separación de fuentes de audio que divide una mezcla musical en seis pistas independientes: batería, bajo, otros instrumentos, voz, guitarra y piano. Su propósito es ejecutarse íntegramente en el navegador del visitante mediante onnxruntime-web y WebGPU, sin enviar el audio a ningún servidor.

El paquete está pensado como artefacto de inferencia para el sitio web StemDeck, no como un modelo entrenado desde cero: los pesos proceden de una copia WebGPU-ready del htdemucs_6s original de Meta (licencia MIT), convertida a ONNX y almacenada en fp16 para reducir a la mitad el tamaño de descarga, con una desviación declarada de 2e-4 respecto a fp32. El repositorio ocupa aproximadamente 0,1 GB.

Su relevancia radica en el despliegue local en el cliente: permite separación de pistas con privacidad total y sin coste de cómputo en servidor, a cambio de una interfaz de entrada/salida muy rígida (ventanas de 7,8 segundos a 44,1 kHz) y de una dependencia fuerte del soporte de WebGPU en el navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs_6s), convertida a grafo ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 343.980 muestras (7,8 s a 44,1 kHz) |
| Tipos de cuantización | fp16 almacenado en disco, convertido a fp32 al cargar |
| Idiomas soportados | no aplica (modelo de audio); no disponibles metadatos de idioma |
| Licencia | MIT |
| Formato de pesos | ONNX (pesos en fp16 dentro del grafo) |
| Entrada | `mix` float32 [1, 2, 343980] (estéreo) |
| Salida | `stems` float32 [1, 6, 2, 343980] (6 pistas estéreo) |
| Tamaño del repositorio | ~0,1 GB |
| Runtime objetivo | onnxruntime-web con backend WebGPU |

## Arquitectura y entrenamiento

El modelo subyacente es htdemucs_6s de Meta, un separador de fuentes basado en Hybrid Transformer Demucs: un codificador/decodificador convolucional sobre el dominio de la forma de onda combinado con capas de atención Transformer que modelan dependencias de largo alcance entre segmentos temporales. La variante "6s" amplía las cuatro pistas clásicas de Demucs (batería, bajo, otros, voz) con guitarra y piano, lo que exige un cabezal de salida de seis canales.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras, ni sobre procesos de ajuste fino en esta ficha: el autor solo documenta el proceso de conversión a ONNX y la procedencia de los pesos (kramp/htdemucs-6s-webgpu-onnx, a su vez derivado de StemSplitio/htdemucs-6s-onnx). La innovación técnica relevante aquí no es el entrenamiento, sino la cadena de conversión: exportación a ONNX compatible con WebGPU, almacenamiento en fp16 para reducir el peso de descarga y verificación de que las salidas se mantienen dentro de 2e-4 del modelo en fp32.

## Capacidades

- Separación de audio musical en seis pistas: drums, bass, other, vocals, guitar y piano.
- Procesamiento estéreo a 44,1 kHz con ventana fija de 343.980 muestras (7,8 s) por invocación.
- Inferencia local en el navegador mediante onnxruntime-web y WebGPU, sin subida de audio a servidores.
- Ejecución sobre audio de usuario en el propio dispositivo, lo que habilita casos de privacidad estricta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de transformación de señal.
- No dispone de capacidades multilingües, de visión ni de modo "thinking".
- No se documentan capacidades de procesamiento por lotes ni de streaming más allá de la ventana fija indicada.

## Casos de uso

- Karaoke y práctica vocal: el usuario carga una canción y obtiene la pista de voz aislada para eliminarla o atenuarla; la ventana de 7,8 s permite procesar la canción por bloques con solapamiento en el cliente.
- Remix y edición musical en el navegador: al separar drums, bass, guitar y piano por separado, un editor web puede ofrecer control de volumen y mute por pista sin necesidad de un DAW de escritorio.
- Estudio de producción con privacidad: al ejecutarse en el dispositivo del visitante, el audio original nunca sale del navegador, lo que resulta adecuado para material no publicado o confidencial.
- Educación musical: un profesor puede aislar la línea de bajo o la guitarra de una grabación para que el alumno la escuche por separado, aprovechando que no requiere instalar software.
- Aplicaciones web de bajo coste operativo: al no consumir GPU de servidor, el coste marginal por usuario es cero; el modelo encaja en sitios con tráfico alto y presupuesto de infraestructura limitado.
- Creación de sample packs y loops: extracción de stems a partir de grabaciones propias para reutilizarlos en producción, con la licencia MIT del modelo permitiendo uso comercial del software que lo integra (sujeto a los derechos del audio de entrada).
- Prototipado rápido de herramientas de audio: el formato ONNX y la ventana de entrada bien definida permiten integrar el modelo en demos y pruebas de concepto sin entrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo declara que las salidas en fp16 se mantienen dentro de 2e-4 respecto a la versión fp32, sin métricas de calidad de separación (SDR, SIR, SAR) ni comparativas con otros separadores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa ~0,1 GB, por lo que la huella en memoria es reducida, pero depende del grafo ONNX y del backend.
- GPU recomendadas: no se especifican; el modelo está orientado a WebGPU, por lo que requiere un navegador con soporte WebGPU (Chrome/Edge recientes, Safari en versiones compatibles).
- GPU de consumo: previsiblemente ejecutable en GPUs integradas y dedicadas modernas con WebGPU, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Opciones de despliegue: onnxruntime-web con backend WebGPU; también podría ejecutarse con onnxruntime nativo en servidor, aunque no es el objetivo declarado.
- Latencia y throughput: no disponibles. La ventana de 7,8 s implica que una canción completa requiere múltiples invocaciones encadenadas, con el coste de solapamiento que decida la aplicación.

## Comparativa con modelos similares

| Modelo | Tipo | Pistas | Formato | Licencia | Contexto/ventana | Disponibilidad |
|---|---|---|---|---|---|---|
| StemDeck (este repo) | htdemucs_6s en ONNX | 6 | ONNX fp16 | MIT | 7,8 s fijas | Hugging Face, ~0,1 GB |
| kramp/htdemucs-6s-webgpu-onnx | htdemucs_6s en ONNX | 6 | ONNX | MIT | no disponible | Hugging Face (origen del grafo) |
| StemSplitio/htdemucs-6s-onnx | htdemucs_6s en ONNX | 6 | ONNX | MIT | no disponible | Hugging Face (origen de los pesos) |
| Demucs v4 original (Meta) | PyTorch | 4 o 6 | PyTorch | MIT | segmentos configurables | Repositorio oficial de Meta |

La comparativa se limita a las variantes de la misma familia porque no se dispone de datos de rendimiento que permitan contrastar con separadores alternativos como Spleeter, Open-Unmix o Bandit.

## Limitaciones y advertencias

- Ventana de audio fija de 7,8 s: procesar una canción completa exige segmentación y reconstrucción por parte de la aplicación, con riesgo de artefactos en las juntas si el solapamiento no se gestiona bien.
- Dependencia de WebGPU: en navegadores sin soporte el modelo no funcionará o caerá a un backend mucho más lento; no se documenta comportamiento de fallback.
- Sin métricas de calidad publicadas: no hay datos de SDR/SIR/SAR que permitan evaluar la calidad real de la separación frente al htdemucs_6s original.
- Precisión reducida por fp16: aunque el autor declara una desviación de 2e-4, no se especifica en qué métrica ni sobre qué conjunto de audio se midió.
- Sesgos y alucinaciones: no aplican en el sentido de los modelos de lenguaje, pero sí existen limitaciones de generalización a géneros musicales poco representados en el entrenamiento original de Demucs.
- Licencia MIT del modelo: permite uso comercial del software, pero no otorga derechos sobre el audio de entrada; el usuario debe garantizar que tiene derechos sobre las grabaciones que procesa.
- Sin información sobre idiomas, pipeline ni idioma de la documentación más allá del inglés de la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnjaneyaTurai/stemdeck-models
- Grafo de origen (WebGPU-ready): https://huggingface.co/kramp/htdemucs-6s-webgpu-onnx
- Pesos de origen: https://huggingface.co/StemSplitio/htdemucs-6s-onnx
- Repositorio oficial de Demucs (Meta): https://github.com/facebookresearch/demucs
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
