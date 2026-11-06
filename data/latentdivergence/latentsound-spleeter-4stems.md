# latentdivergence/latentsound-spleeter-4stems

## Resumen

Latentsound-spleeter-4stems es una conversión a ONNX del modelo Spleeter de Deezer en su variante de 4 stems (voces, batería, bajo y "otros"), publicada por el usuario latentdivergence dentro del proyecto LatentSound. Spleeter es un modelo clásico de separación de fuentes musicales basado en una arquitectura de spectrograma U-Net que opera sobre la representación tiempo-frecuencia del audio, y esta versión concreta se distribuye con pesos en fp16 y formato ONNX para ejecución on-device.

El interés de esta ficha no reside en un modelo nuevo de gran escala, sino en una pieza de infraestructura de audio: empaquetar un separador de fuentes consolidado en un formato portable (ONNX) permite integrarlo en aplicaciones de escritorio, móviles o pipelines sin depender de TensorFlow, el framework original. El autor indica que la conversión fue verificada contra el grafo TF original con un error relativo máximo de 1e-5, lo que da una garantía razonable de fidelidad numérica.

El repositorio es pequeño (0,1 GB), no tiene descargas ni likes en el momento de la consulta, y no publica información sobre idiomas, pipeline ni benchmarks propios. La licencia MIT del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net sobre espectrograma (conversion ONNX del modelo Spleeter 4stems de Deezer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | pesos en fp16 (unica variante publicada) |
| Idiomas soportados | no disponible (no aplica; modelo de audio) |
| Licencia | MIT |
| Formato de pesos | ONNX (fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Spleeter 4stems de Deezer: una red de tipo U-Net que toma como entrada el espectrograma de magnitud de la mezcla musical y produce máscaras o espectrogramas por fuente para cuatro stems (vocales, batería, bajo y otros). El modelo se ejecuta sobre ventanas de audio y reconstruye la señal en el dominio temporal mediante la transformada inversa correspondiente.

Los detalles de entrenamiento (número de tokens o horas de audio, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada, más allá de la referencia al modelo original de Deezer. La innovación de esta publicación es exclusivamente de empaquetado: conversión a ONNX con pesos fp16 y verificación numérica contra el grafo TensorFlow original, con un error relativo máximo declarado de 1e-5.

## Capacidades

- Separación de audio musical en cuatro stems: vocales, batería, bajo y otros.
- Ejecución on-device mediante ONNX Runtime, sin dependencia de TensorFlow.
- Procesamiento de audio por ventanas, adecuado para ficheros de música completos.
- Pesos en fp16, lo que reduce el tamaño y acelera la inferencia en hardware con soporte de media precisión.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.
- No dispone de modo thinking, visión ni audio de entrada en sentido generativo; su salida son pistas de audio separadas.

## Casos de uso

- Karaoke automático: eliminar la pista de voces de una canción para generar una base instrumental, usando el stem "other" más batería y bajo.
- Producción musical y remezclas: aislar cada stem para editar niveles, aplicar efectos o crear versiones alternativas de una mezcla sin acceso a las pistas originales.
- Sampleado y creación de librerías: extraer fragmentos de batería o líneas de bajo de grabaciones existentes para reutilizarlos en nuevas composiciones.
- Aplicaciones de escritorio y móviles: integrar la separación en un editor de audio local gracias al formato ONNX y a los pesos fp16, que reducen requisitos de memoria frente a fp32.
- Preprocesado en pipelines de transcripción musical: separar voces antes de alimentar un modelo de reconocimiento de letras o de pitch, mejorando la relación señal-ruido del componente vocal.
- Investigación y docencia en procesamiento de audio: disponer de una implementación portable y verificada numéricamente de Spleeter para experimentos reproducibles sin montar TensorFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es la fidelidad de la conversión: error relativo máximo de 1e-5 frente al grafo TensorFlow original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,1 GB y los pesos están en fp16, por lo que la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime y fp16 (por ejemplo, RTX 3060 o superiores); también puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM; el dato exacto no está disponible.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML), integrable en aplicaciones de escritorio y móviles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Stems | Formato | Licencia | Contexto de ejecucion |
|---|---|---|---|---|
| latentsound-spleeter-4stems | 4 (vocals, drums, bass, other) | ONNX fp16 | MIT | On-device via ONNX Runtime |
| Spleeter original (Deezer) | 2, 4 y 5 stems | TensorFlow checkpoint | MIT | TensorFlow |
| Demucs (Meta) | 4 stems | PyTorch | MIT | PyTorch, GPU recomendada |

La comparación con Demucs se ofrece como referencia de categoría; no se dispone de datos de benchmarks comparativos en la información proporcionada. La ventaja diferencial de esta publicación frente al Spleeter original es el formato ONNX y los pesos fp16, no una mejora de calidad de separación.

## Limitaciones y advertencias

- Es una conversión, no un modelo entrenado desde cero: hereda todas las limitaciones de calidad de Spleeter 4stems original.
- No se han publicado métricas de calidad de separación (SDR, SIR, SAR) en la información disponible.
- Solo se distribuye la variante fp16 en ONNX; no hay versiones cuantizadas a int8 ni fp32 publicadas.
- El repositorio no tiene descargas ni validación comunitaria; conviene verificar la conversión en el propio pipeline antes de usarla en producción.
- La licencia MIT permite uso comercial, pero debe conservarse la atribución a Deezer como autor original del modelo.
- No apto para tareas de texto, razonamiento, código o visión; cualquier evaluación en esos dominios carece de sentido.
- Al operar sobre ventanas de audio, pueden aparecer artefactos en las fronteras entre ventanas si la integración no gestiona correctamente el solapamiento.

## Enlaces

- Hugging Face: https://huggingface.co/latentdivergence/latentsound-spleeter-4stems
- Repositorio original de Spleeter: https://github.com/deezer/spleeter
