# chungvh/kokoro-vietnamese-lite

## Resumen

Kokoro Vietnamese Lite es un modelo de síntesis de voz (text-to-speech) en vietnamita, distribuido en formato ONNX. El repositorio analizado, `chungvh/kokoro-vietnamese-lite`, es un espejo (mirror) byte a byte del modelo original `loanhviet/Kokoro-Vietnamese-Lite`, publicado por el autor `chungvh` para que la aplicación KingReader pueda fijar sus descargas sin depender de la disponibilidad del repositorio upstream. Forma parte del nivel "Cơ bản" (básico) de la aplicación KingReader.

El modelo se deriva de la familia Kokoro, una arquitectura TTS ligera y eficiente, y está especializado en la síntesis de voz en vietnamita. El artefacto principal es un único fichero ONNX de 9.210.026 bytes (aproximadamente 9,2 MB), lo que lo sitúa en la categoría de modelos TTS ultraligeros, aptos para inferencia en CPU y dispositivos con recursos limitados.

La relevancia de este repositorio es principalmente práctica: proporciona un payload TTS pequeño, con licencia Apache-2.0 y verificado por hash SHA-256, pensado para integrarse en aplicaciones que necesitan síntesis de voz en vietnamita sin infraestructura pesada. La model card es muy escueta y no documenta arquitectura interna, datos de entrenamiento ni métricas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Kokoro, TTS; detalles internos no documentados) |
| Parámetros totales | no disponible (peso ONNX de 9.210.026 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantización | no disponible (se distribuye un único fichero ONNX) |
| Idiomas soportados | vietnamita (según el nombre del modelo y la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`kokoro_vi_lite.onnx`) + `config.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la model card proporcionada. El modelo pertenece a la familia Kokoro, orientada a TTS ligero, y se distribuye como un grafo ONNX ya exportado junto con un `config.json` de 2.351 bytes. No se documentan el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron técnicas de ajuste como RLHF o DPO.

El repositorio es un espejo byte a byte del modelo original de `loanhviet`, por lo que cualquier detalle de entrenamiento o innovación técnica debería consultarse en el repositorio upstream, no documentado en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto de entrada.
- Inferencia mediante runtime ONNX, lo que permite despliegue en CPU y entornos sin GPU.
- Modelo ultraligero (peso de ~9,2 MB), adecuado para aplicaciones móviles o de escritorio con restricciones de tamaño.
- Integración sencilla en pipelines de aplicaciones mediante el fichero `kokoro_vi_lite.onnx` y su `config.json`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni multimodalidad.

## Casos de uso

- Lectura por voz en aplicaciones de lectura (el propio caso de KingReader): el modelo actúa como motor TTS del nivel básico para narrar texto en vietnamita con un payload de ~9 MB que se puede empaquetar con la app.
- Accesibilidad para personas con discapacidad visual: conversión de texto de interfaces o documentos a voz en vietnamita en dispositivos de gama baja gracias a la inferencia ONNX en CPU.
- Asistentes de voz embebidos: síntesis de respuestas cortas en aplicaciones de domótica o kioscos sin conexión a la nube, al no requerir GPU.
- Aprendizaje de idiomas: reproducción de pronunciación de texto vietnamita en aplicaciones educativas con despliegue local y bajo consumo de almacenamiento.
- Sistemas de anuncios automatizados: generación de avisos hablados en vietnamita en transporte público o comercios, con despliegue en hardware de bajo coste.
- Prototipado rápido de productos TTS: al ser Apache-2.0 y ONNX, permite integrar síntesis en vietnamita en demos y MVPs sin coste de licencia ni infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el peso de ~9,2 MB implica un consumo de memoria mínimo (por debajo de 1 GB en la práctica, aunque no se documenta oficialmente).
- GPU recomendadas: no se especifican; el formato ONNX permite ejecución en CPU y en GPU compatibles con ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, por tamaño (9,2 MB) es viable en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Kokoro Vietnamese Lite (este repo) | TTS | ~9,2 MB (ONNX) | Vietnamita | Apache-2.0 | ONNX |
| loanhviet/Kokoro-Vietnamese-Lite | TTS | no disponible | Vietnamita | Apache-2.0 | no disponible |
| Otros modelos Kokoro de la familia | TTS | no disponible | Multilingüe (según variante) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, calidad de síntesis ni evaluación subjetiva (MOS); no hay garantías de naturalidad de la voz.
- Riesgo de pronunciación incorrecta en texto con palabras extranjeras, siglas o números, habitual en modelos TTS no evaluados.
- Solo se declara soporte de vietnamita; no se documentan otros idiomas.
- Al ser un espejo, la responsabilidad de mantenimiento y posibles correcciones recae en el repositorio upstream (`loanhviet/Kokoro-Vietnamese-Lite`); si este cambia, el espejo no se actualiza automáticamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo original, no documentada aquí.
- No se documentan requisitos de atribución adicionales ni restricciones de uso más allá de la licencia Apache-2.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chungvh/kokoro-vietnamese-lite
- Repositorio upstream: https://huggingface.co/loanhviet/Kokoro-Vietnamese-Lite
