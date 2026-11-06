# mehuljain97/accent-improver-wav2vec2-onnx

## Resumen

`mehuljain97/accent-improver-wav2vec2-onnx` es una conversión a ONNX del modelo `facebook/wav2vec2-lv-60-espeak-cv-ft`, un sistema de reconocimiento de fonemas basado en wav2vec2 2.0 entrenado por Meta AI con etiquetas fonéticas generadas por alineamiento forzado mediante espeak. El autor, mehuljain97, publica esta versión cuantizada a int8 para su uso en el navegador a través de `onnxruntime-web`, como componente de evaluación de pronunciación del proyecto Accent Improver.

El modelo no es un generador de texto ni un asistente conversacional: es un clasificador acústico que recibe audio PCM a 16 kHz y emite, para cada trama de 20 ms, una distribución sobre 392 tokens fonéticos. Su utilidad práctica es el cálculo de Goodness of Pronunciation (GOP), una métrica que compara los fonemas emitidos por un hablante con los esperados según una transcripción de referencia, lo que permite puntuar la pronunciación de estudiantes de idiomas.

La relevancia de esta ficha reside en la cuantización: reduce el peso de 1,26 GB a 359 MB manteniendo la fidelidad de las puntuaciones GOP respecto al modelo original en PyTorch (Pearson 0,429 frente a 0,428 sobre 300 grabaciones de speechocean762). Es, por tanto, una alternativa viable para inferencia en cliente sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 2.0 (CNN feature encoder + transformer con atención, cabeza de clasificación fonética) |
| Parametros totales | no disponible (modelo base de aproximadamente 300 M de parámetros; el dato no se explicita en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable en muestras a 16 kHz; no se publica límite máximo) |
| Tipos de cuantizacion | int8 per-channel en las capas transformer; float32 en el codificador convolucional, la proyección de features y la capa de salida |
| Idiomas soportados | no disponible (el inventario fonético de 392 tokens proviene de espeak y es multilingüe por diseño, pero la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnxruntime`), 359 MB |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2 2.0: un codificador convolucional que transforma la forma de onda a 16 kHz en una secuencia de representaciones latentes, seguido de un transformer con atención multi-cabeza que produce estados contextualizados, y una capa lineal final que proyecta a 392 tokens fonéticos. La salida tiene forma `[batch, frames, 392]`, con una trama cada 20 ms.

El modelo base fue entrenado por Meta AI con el objetivo de reconocimiento fonético usando etiquetas derivadas de alineamiento forzado con espeak (variante `lv-60`, Common Voice). No se dispone en la información proporcionada de detalles sobre el número de horas de audio, la composición del corpus ni si se aplicaron etapas de ajuste fino adicionales. La conversión a ONNX parte de `onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX` y se realiza mediante el script `backend/scripts/quantize_onnx.py` del repositorio Accent Improver, aplicando cuantización int8 per-channel solo a las capas transformer y preservando float32 en el frontend convolucional y la cabeza de salida, decisión que habitualmente protege la precisión en tareas acústicas sensibles.

## Capacidades

- Reconocimiento de fonemas a partir de audio en bruto a 16 kHz, con una trama de salida cada 20 ms.
- Evaluación de pronunciación mediante puntuaciones GOP (Goodness of Pronunciation) derivadas de los logits fonéticos.
- Alineamiento implícito con una transcripción de referencia para comparar fonemas esperados y emitidos.
- Ejecución en navegador mediante `onnxruntime-web`, sin necesidad de backend ni GPU.
- Inferencia sobre audio normalizado a media cero y varianza unitaria.
- No soporta generación de texto, tool calling, agentes, visión ni audio-a-texto en sentido conversacional.
- No se documenta soporte multilingüe explícito ni detección de idioma.

## Casos de uso

- Evaluación de pronunciación en aplicaciones web educativas: el modelo se ejecuta en el cliente con `onnxruntime-web`, recibe la grabación del estudiante y devuelve logits fonéticos que la aplicación compara con la transcripción objetivo para calcular GOP por fonema.
- Corrección de acento en tiempo real: integrado en una interfaz de práctica oral, permite resaltar los fonemas con puntuación baja y ofrecer retroalimentación inmediata sin enviar audio a un servidor.
- Herramientas de autoevaluación para estudiantes de idiomas: al no requerir GPU ni infraestructura, puede distribuirse como parte de una aplicación estática o PWA.
- Investigación en fonética computacional: sirve para extraer alineamientos fonéticos y puntuaciones GOP de corpus de habla no nativa de forma reproducible y ligera.
- Filtrado y control de calidad de grabaciones en pipelines de datos de voz: detectar segmentos con pronunciación desviada respecto a la transcripción para revisión manual.
- Prototipado rápido de sistemas de reconocimiento fonético: el formato ONNX permite desplegar en entornos edge, móviles o navegadores sin depender de PyTorch.
- Evaluación comparativa de modelos de pronunciación: su fidelidad medida frente al modelo original en PyTorch lo hace útil como referencia cuantizada en experimentos de ablación.

## Benchmarks y rendimiento

La model card reporta una validación sobre 300 grabaciones de test de speechocean762 (4.536 fonemas) comparando las puntuaciones GOP de esta versión ONNX ejecutada con `onnxruntime-web` frente al modelo original en PyTorch:

| Metrica | ONNX int8 (onnxruntime-web) | PyTorch original |
|---|---|---|
| Correlacion de Pearson con valoraciones expertas | 0,429 | 0,428 |
| Cambio mediano en la puntuacion por fonema (escala 0-100) | 0 puntos | referencia |
| Fonemas con cambio superior a 10 puntos | 0,5 % | referencia |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de reconocimiento fonético.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 y en torno a 400-500 MB con la cuantización int8, incluyendo activaciones para audio de pocos segundos.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) acelera la inferencia si se usa el execution provider CUDA de onnxruntime.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores, que es el objetivo declarado del autor.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM/WebGL/WebGPU) y `onnxruntime-node`. No se distribuye en GGUF, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del execution provider y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mehuljain97/accent-improver-wav2vec2-onnx | no disponible (~300 M en el base) | audio variable a 16 kHz | ONNX int8 (359 MB) | apache-2.0 | Cuantizado para navegador; fidelidad GOP validada frente al original |
| facebook/wav2vec2-lv-60-espeak-cv-ft | no disponible (~300 M) | audio variable a 16 kHz | PyTorch (1,26 GB) | apache-2.0 | Modelo original en fp32; referencia de calidad |
| onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX | no disponible (~300 M) | audio variable a 16 kHz | ONNX fp32 | apache-2.0 | Conversión sin cuantizar; mayor peso, misma arquitectura |

## Limitaciones y advertencias

- El modelo es un reconocedor fonético, no un generador: no produce texto libre ni respuestas conversacionales.
- Las puntuaciones GOP dependen de una transcripción de referencia y de un alineamiento correcto; errores en la referencia degradan la evaluación.
- La correlación con valoraciones expertas es moderada (Pearson 0,429), por lo que no debe usarse como sustituto de evaluación humana en contextos de certificación.
- La cuantización int8 puede introducir desviaciones en fonemas concretos, aunque el autor reporta que solo el 0,5 % supera 10 puntos de diferencia.
- No se declaran idiomas soportados ni cobertura fonética por lengua; el inventario de 392 tokens proviene de espeak y puede no cubrir variantes dialectales.
- Riesgo de sesgo acústico ante micrófonos, ruido de fondo o acentos no representados en el corpus de entrenamiento del modelo base.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del corpus de entrenamiento original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- [Hugging Face: mehuljain97/accent-improver-wav2vec2-onnx](https://huggingface.co/mehuljain97/accent-improver-wav2vec2-onnx)
- [Modelo base: facebook/wav2vec2-lv-60-espeak-cv-ft](https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft)
- [Conversión ONNX de referencia: onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX](https://huggingface.co/onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX)
- [Repositorio Accent Improver](https://github.com/mj20dec/Accent-Improver)
