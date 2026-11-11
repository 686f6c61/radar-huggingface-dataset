# bindx-dev/phonon-31m-en

## Resumen

Phonon 31M English es un modelo de síntesis de voz (text-to-speech) de 31 millones de parámetros desarrollado originalmente por Gradium. Este repositorio concreto, publicado por bindx-dev, no contiene los pesos originales en formato GGUF que distribuye Gradium, sino una exportación local a ONNX de los grafos `flow_lm` y `mimi_decoder` para el runtime propietario BindX (`PhononTtsEngine`). Está pensado para cargarse desde la aplicación BindX, no como un paquete autónomo de inferencia genérica.

El modelo trabaja únicamente en inglés y se distribuye bajo licencia Apache 2.0, con la obligación de conservar el README, la licencia y la atribución a Gradium en cualquier redistribución. El repositorio ocupa 0,2 GB e incluye los ficheros auxiliares necesarios para la exportación: tokenizador, configuración y una voz por defecto en safetensors.

Su relevancia es limitada y muy específica: sirve como ejemplo de empaquetado ONNX de un TTS pequeño para un runtime concreto, y resulta útil para quien necesite integrar Phonon en BindX o estudiar cómo se estructura una exportación de este tipo. No hay información publicada sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con componentes `flow_lm` y `mimi_decoder`) |
| Parámetros totales | 31 M (según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`flow_lm.onnx`, `mimi_decoder.onnx`); voz por defecto en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original. Por los nombres de los ficheros exportados (`flow_lm.onnx` y `mimi_decoder.onnx`) se deduce una estructura típica de TTS neuronal en dos etapas: un modelo de lenguaje de flujo que genera representaciones acústicas intermedias y un decodificador basado en Mimi (el códec neuronal de Kyutai) que convierte esas representaciones en audio. No obstante, esta deducción no está confirmada en la documentación proporcionada.

Tampoco hay datos sobre el volumen de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas. La model card del repositorio se limita a describir el proceso de exportación a ONNX y los ficheros que consume el runtime BindX, sin entrar en detalles del entrenamiento original de Gradium.

## Capacidades

- Síntesis de voz a partir de texto en inglés.
- Generación de audio mediante un decodificador Mimi exportado a ONNX.
- Uso de una voz por defecto incluida en el repositorio (`voices/default-voice.safetensors`).
- Integración con el runtime BindX a través de `PhononTtsEngine` y el fichero de configuración `bindx.json`.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling ni razonamiento multi-paso.
- Modelo monolingüe: solo inglés.

## Casos de uso

- Integración en la aplicación BindX: el paquete está diseñado explícitamente para que BindX cargue la carpeta y ejecute el motor `PhononTtsEngine`, por lo que su uso principal es servir de voz TTS dentro de ese ecosistema.
- Lectura de textos en inglés en aplicaciones de escritorio o móvil que ya embeban BindX: al ocupar solo 0,2 GB, el modelo puede distribuirse junto con la aplicación sin un coste de almacenamiento significativo.
- Pruebas de exportación ONNX de modelos TTS: útil para desarrolladores que quieran estudiar cómo se estructura una exportación de un modelo de flujo más decodificador Mimi a ONNX.
- Generación de avisos o notificaciones por voz en inglés: para flujos donde se requiera una voz sintética ligera y no se necesite control fino de prosodia.
- Prototipado de asistentes conversacionales en inglés: como componente de salida de voz en pipelines experimentales, siempre que se use el runtime BindX.
- Evaluación comparativa de TTS pequeños: sirve como referencia de un modelo de 31 M parámetros para comparar calidad y latencia frente a alternativas mayores, aunque no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 31 M parámetros, los pesos en precisión completa ocuparían del orden de 124 MB, pero no se especifican los requisitos del runtime BindX ni el consumo del decodificador Mimi.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo se distribuye en ONNX y podría ejecutarse en CPU, pero no hay datos oficiales.
- Opciones de despliegue: el paquete está pensado para el runtime BindX (`PhononTtsEngine`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene los pesos originales de Gradium en GGUF, sino una exportación ONNX modificada; no es un paquete oficial del autor original.
- Solo soporta inglés; no hay soporte multilingüe documentado.
- No se especifican la arquitectura, el contexto ni los datos de entrenamiento, lo que dificulta evaluar su calidad y sus sesgos.
- Riesgo de alucinación y de errores de pronunciación inherente a los modelos TTS, sin datos publicados que lo cuantifiquen.
- La licencia Apache 2.0 permite uso comercial, pero la redistribución debe conservar el README, el texto de la licencia y la atribución a Gradium.
- Al depender del runtime BindX, la portabilidad a otros entornos no está garantizada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bindx-dev/phonon-31m-en
- Modelo original de Gradium: https://huggingface.co/gradium/phonon-31m-en
