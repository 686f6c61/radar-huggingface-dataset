# ChatPanel/Kokoro-82M-v1.0-ONNX

## Resumen

Kokoro-82M-v1.0-ONNX es la conversión a formato ONNX del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad. Este repositorio concreto, publicado por ChatPanel, es una copia byte a byte del repositorio `onnx-community/Kokoro-82M-v1.0-ONNX` en el commit `1939ad2a8e416c0acfeecc08a694d14ef25f2231`, alojada con el único propósito de que la pasarela (gateway) de ChatPanel descargue desde un único punto los modelos que ejecuta. No se ha reentrenado, convertido ni editado ningún artefacto.

El modelo subyacente es un sistema de texto a voz (TTS) de 82 millones de parámetros, pensado para inferencia ligera y despliegue en entornos con recursos limitados. Su tamaño reducido lo hace apto para ejecución en CPU y en GPU de gama baja, algo poco habitual en TTS de calidad razonable. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que documenta una distribución ONNX empaquetada para consumo desde una pasarela concreta, con voces preentrenadas en varios idiomas (inglés americano y británico, español, francés, hindi, italiano, japonés, portugués y chino) y dos variantes de pesos: `model.onnx` y `model_quantized.onnx`. El repositorio ocupa 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos ONNX) |
| Parametros totales | 82M (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | FP32 (`model.onnx`) y cuantizada (`model_quantized.onnx`) |
| Idiomas soportados | en (US/GB), es, fr, hi, it, ja, pt, zh (según voces incluidas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) + tokenizer JSON + voces `.bin` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El repositorio es una redistribución de pesos ONNX ya convertidos por `onnx-community`; no incluye detalles sobre el transformer, el decoder vocacional ni el esquema de entrenamiento original de `hexgrad/Kokoro-82M`. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí se puede afirmar con certeza es que el paquete contiene un `config.json`, un `tokenizer.json` y `tokenizer_config.json`, junto con un banco de voces en formato `.bin` (54 ficheros) que actúan como embeddings o estilos de locutor. La existencia de dos variantes ONNX (estándar y cuantizada) permite elegir entre fidelidad y eficiencia. No hay innovaciones técnicas documentadas en esta copia más allá de la propia conversión a ONNX.

## Capacidades

- Síntesis de voz (texto a audio) a partir de texto de entrada.
- Múltiples voces preentrenadas por idioma: 20 voces en inglés americano (`af_*`, `am_*`), 9 en inglés británico (`bf_*`, `bm_*`), 2 en español (`ef_dora`, `em_alex`, `em_santa`), 2 en francés (`ff_siwis`), 2 en hindi (`hf_alpha`, `hf_beta`, `hm_omega`, `hm_psi`), 2 en italiano (`if_sara`, `im_nicola`), 5 en japonés (`jf_*`, `jm_kumo`), 2 en portugués (`pf_dora`, `pm_alex`, `pm_santa`) y 3 en chino (`zf_xiaobei`, `zf_xiaoni`, `zf_xiaoxiao`).
- Selección de voz mediante ficheros `.bin` independientes, lo que permite cargar solo las voces necesarias.
- Inferencia en CPU o GPU gracias al formato ONNX y a la variante cuantizada.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo TTS puro.
- No soporta generación de texto, código, matemáticas ni visión.

## Casos de uso

- **Lectura de artículos y documentos en voz alta**: el modelo convierte texto plano en audio con una voz seleccionable, adecuado para integrarse en lectores de pantalla o aplicaciones de accesibilidad que necesitan un TTS ligero en CPU.
- **Asistentes de voz embebidos**: por su tamaño de 82M de parámetros y su variante cuantizada, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para dar respuestas habladas en asistentes domésticos.
- **Generación de audiolibros y pódcast automatizados**: la disponibilidad de varias voces por idioma permite alternar locutores y producir narraciones multi-voz por lotes sin depender de servicios en la nube.
- **Doblaje y localización de contenido**: con voces en español, francés, italiano, portugués, hindi, japonés y chino, se puede generar pistas de audio localizadas a partir de guiones de texto para vídeos o cursos.
- **Sistemas de atención al cliente con respuesta hablada**: integrado en un pipeline que primero genere texto (con otro modelo) y luego lo sintetice, permite respuestas telefónicas o en interfaces de voz; el TTS aporta la capa de audio final.
- **Pruebas de integración en pasarelas propias**: al estar empaquetado para el gateway de ChatPanel, sirve como modelo de referencia para validar pipelines de descarga y ejecución de TTS en ONNX Runtime dentro de una infraestructura propia.
- **Prototipado rápido de interfaces conversacionales**: la licencia Apache 2.0 y el tamaño reducido permiten iterar sin coste de licencia ni de GPU dedicada durante las fases de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del modelo (82M de parámetros) y el peso del repositorio (0,4 GB), la variante FP32 requiere del orden de 0,3-0,5 GB de memoria y la cuantizada bastante menos, aunque no se aportan cifras oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU; también es viable en CPU.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-v1.0-ONNX (este) | 82M | no aplica (TTS) | Apache 2.0 | ONNX | Hugging Face |
| hexgrad/Kokoro-82M (base) | 82M | no aplica (TTS) | Apache 2.0 | safetensors/PyTorch | Hugging Face |
| onnx-community/Kokoro-82M-v1.0-ONNX (upstream) | 82M | no aplica (TTS) | Apache 2.0 | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparado con otras familias TTS (por ejemplo, Piper, Coqui TTS o XTTS) en la información proporcionada, por lo que no se incluyen cifras de calidad ni de latencia comparativas.

## Limitaciones y advertencias

- **Copia sin modificar**: este repositorio no aporta mejoras ni correcciones sobre el upstream; cualquier problema del modelo original se hereda tal cual.
- **Sin garantías de mantenimiento**: al ser una réplica alojada por un tercero (ChatPanel), la actualización depende de que el autor sincronice con el upstream; el commit fijado es `1939ad2a8e416c0acfeecc08a694d14ef25f2231`.
- **Riesgo de alucinación y artefactos de audio**: como todo TTS, puede producir pronunciaciones incorrectas, entonación antinatural o artefactos en textos con símbolos, siglas o nombres propios; no se documentan evaluaciones de calidad.
- **Cobertura de idiomas desigual**: el número de voces por idioma varía mucho (20 en inglés americano frente a 2 en francés o italiano), lo que limita la variedad de locutores en idiomas minoritarios.
- **Sin soporte de razonamiento ni texto**: no debe emplearse para tareas generativas de texto, código o agentes; su único cometido es la síntesis de voz.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución a los autores originales (hexgrad) y al conversor (onnx-community).
- **Dependencia de ONNX Runtime**: el despliegue requiere un runtime compatible con la versión de ONNX empleada; no se especifica la versión mínima.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ChatPanel/Kokoro-82M-v1.0-ONNX
- Modelo base original: https://huggingface.co/hexgrad/Kokoro-82M
- Upstream ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Commit del upstream: `1939ad2a8e416c0acfeecc08a694d14ef25f2231`
