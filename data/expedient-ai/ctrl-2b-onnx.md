# expedient-ai/CTRL-2B-ONNX

## Resumen

CTRL-2B-ONNX es la exportación a formato ONNX del modelo CTRL-2B, un modelo de generación de texto de 2.000 millones de parámetros desarrollado por expedient-ai a partir del modelo base chadstthomas/CTRL-2B. Este modelo base, a su vez, es el resultado de fusionar un adaptador QLoRA sobre MiniCPM5-2B. La versión ONNX está específicamente optimizada para inferencia en el navegador mediante WebGPU a través de la librería transformers.js, lo que la convierte en una opción orientada a aplicaciones web que necesitan ejecutar un modelo de lenguaje sin depender de servidores externos.

La relevancia de esta ficha radica en su enfoque de despliegue: frente a modelos pensados para servidores con GPUs dedicadas, CTRL-2B-ONNX prioriza la portabilidad y la privacidad al ejecutarse íntegramente en el cliente. El repositorio ocupa 3,4 GB e incluye los pesos cuantizados en formato q4f16 junto con el tokenizador y la plantilla de chat embebida en `tokenizer_config.json`.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni los resultados de benchmarks, por lo que varios apartados de esta ficha se limitan a lo que puede inferirse de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de MiniCPM5-2B, con adaptador QLoRA fusionado) |
| Parametros totales | 2B (aproximadamente 2.000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (MatMulNBits, block 128, simetrica, accuracy_level 4); exportacion original en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` con datos externos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 2.000 millones de parámetros, derivado de MiniCPM5-2B. Sobre ese modelo base se aplicó un adaptador QLoRA que posteriormente se fusionó con los pesos originales, dando lugar a CTRL-2B. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta variante es el proceso de exportación y cuantización: los pesos se exportaron a ONNX en fp16 y después se cuantizaron a q4f16 mediante MatMulNBits con bloques de 128 elementos, cuantización simétrica y `accuracy_level` 4. Este formato está diseñado para aprovechar las capacidades de WebGPU en navegadores modernos a través de transformers.js, lo que permite ejecutar el modelo en el cliente con un tamaño de descarga reducido (3,4 GB en el repositorio) y sin necesidad de infraestructura de servidor.

## Capacidades

- Generación de texto conversacional: el repositorio incluye una plantilla de chat específica de CTRL-2B embebida en `tokenizer_config.json`, lo que indica un ajuste orientado a diálogo multi-turno.
- Inferencia en navegador: ejecución mediante transformers.js con aceleración WebGPU, sin backend propio.
- Compatibilidad con el ecosistema transformers.js: integrable en aplicaciones web JavaScript/TypeScript.
- Razonamiento y código: no se documentan capacidades específicas más allá de la generación de texto; no hay evidencia publicada de rendimiento en tareas de código o matemáticas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no están documentados.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Asistentes conversacionales en el navegador: al ejecutarse con WebGPU y transformers.js, el modelo puede gestionar conversaciones multi-turno directamente en la página, sin enviar datos del usuario a un servidor, lo que resulta adecuado para aplicaciones con requisitos estrictos de privacidad.
- Demos interactivas y prototipos: el tamaño de 2B parámetros y la cuantización q4f16 permiten desplegar una demo funcional en una Hugging Face Space o en una web estática, como evidencia la demo oficial del modelo base.
- Herramientas de escritura integradas en aplicaciones web: autocompletado, reescritura o generación de borradores dentro de un editor en línea, aprovechando la inferencia local para reducir latencia y costes de API.
- Procesamiento de texto sensible en el cliente: clasificación, resumen o extracción de información sobre documentos que el usuario no quiere subir a la nube, dado que el modelo se ejecuta íntegramente en el dispositivo.
- Educación y experimentación: al ser un modelo pequeño con licencia Apache 2.0, sirve para que desarrolladores aprendan a integrar LLMs en el navegador con transformers.js y WebGPU sin costes de infraestructura.
- Aplicaciones offline o de baja conectividad: una vez descargados los pesos, el modelo puede funcionar sin conexión en navegadores compatibles con WebGPU, útil en entornos con red limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 2B parámetros en q4f16 ocupa aproximadamente 1,2-1,5 GB de memoria, aunque la cifra exacta depende de la implementación de transformers.js y del navegador.
- GPU recomendadas: no disponible. El requisito funcional es un navegador con soporte de WebGPU (Chrome, Edge y versiones recientes de otros navegadores basados en Chromium).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo y la cuantización q4f16, aunque no se documentan modelos concretos ni requisitos mínimos de memoria de vídeo.
- Opciones de despliegue: transformers.js con WebGPU es el camino documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| CTRL-2B-ONNX | ~2B | no disponible | ONNX q4f16 | Apache 2.0 | Inferencia en navegador (WebGPU) |
| CTRL-2B (base) | ~2B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Inferencia en servidor |
| MiniCPM5-2B | ~2B | no disponible | no disponible | no disponible | Modelo base del que deriva CTRL-2B |

No se dispone de datos de rendimiento comparativos entre estas variantes ni con otros modelos de tamaño similar, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al no conocerse la composición del dataset de entrenamiento, no puede evaluarse el sesgo.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar un comportamiento adecuado en contextos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MiniCPM5-2B y del adaptador original, ya que la model card no detalla posibles restricciones heredadas.
- Caveats para producción: la inferencia en navegador depende de WebGPU, cuya disponibilidad y estabilidad varían según navegador y sistema operativo; el rendimiento puede degradarse en dispositivos sin GPU compatible. Además, el repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación del repositorio (2026-11-04) es posterior a la fecha actual en muchos entornos, lo que conviene tener en cuenta al evaluar su madurez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/expedient-ai/CTRL-2B-ONNX
- Modelo base CTRL-2B: https://huggingface.co/chadstthomas/CTRL-2B
- Demo Space de CTRL-2B: https://huggingface.co/spaces/chadstthomas/ctrl-2b-demo
