# Phoonnx/coqui-vits-de-thorsten-vits

## Resumen

`Phoonnx/coqui-vits-de-thorsten-vits` es un modelo de síntesis de voz (text-to-speech) en alemán derivado de la familia Coqui VITS, empaquetado en formato ONNX para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Lo publica el usuario Phoonnx como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, conservando la ruta interna `de-thorsten-vits`. No se trata de un modelo entrenado desde cero por el autor, sino de una conversión y redistribución de un checkpoint VITS de Coqui entrenado sobre la voz "Thorsten".

La relevancia de esta ficha es acotada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, el repositorio pesa aproximadamente 0,1 GB y la model card es mínima, limitándose a declarar la licencia y el identificador de voz. No se documentan parámetros, arquitectura detallada, datos de entrenamiento ni métricas de evaluación.

La licencia declarada es Apache-2.0, heredada del repositorio de origen según indica la propia model card. Al ser un modelo VITS, se espera una arquitectura de síntesis extremo a extremo con generador adversarial condicionado por texto, pero los detalles concretos (número de parámetros, tasa de muestreo, tamaño de vocabulario fonético) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (text-to-speech extremo a extremo), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada limitada por la longitud del texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (según identificador `de-thorsten-vits` y la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Voz / identificador | `coqui/de-thorsten-vits` |
| Fecha de creacion | 2026-11-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Coqui VITS, un modelo de síntesis de voz condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial durante el entrenamiento. Esta familia de modelos genera波形 de audio directamente a partir de texto sin necesidad de un vocoder externo en cascada, lo que simplifica el despliegue. El checkpoint aquí publicado se distribuye en formato ONNX, lo que permite inferencia portable sin depender del framework original de Coqui.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable en TTS) ni innovaciones técnicas específicas más allá de la conversión a ONNX. La model card únicamente referencia el repositorio origen `Phoonnx/phoonnx-coqui-vits` y la carpeta `de-thorsten-vits`, e indica que la licencia es la que registra el repositorio fuente (Apache-2.0). El nombre "Thorsten" sugiere el uso del corpus de voz alemana Thorsten, pero este dato no se confirma explícitamente en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en alemán.
- Generación de audio en formato estándar mediante inferencia ONNX.
- Integración con la librería phoonnx a través del identificador de voz `coqui/de-thorsten-vits`.
- Ejecución portable en entornos que soporten ONNX Runtime (CPU y GPU).
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multilingüismo ni tool calling.
- No se documenta soporte de agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Síntesis de voz para asistentes en alemán: el modelo puede generar locuciones a partir de texto en aplicaciones de lectura en voz alta o asistentes conversacionales, aprovechando su formato ONNX para despliegue ligero.
- Generación de audiolibros y contenido narrado: al ser un modelo VITS de un solo hablante, es adecuado para narración consistente de textos largos en alemán, troceando la entrada en fragmentos.
- Accesibilidad web: integración en sitios o aplicaciones para leer contenido en voz alta a usuarios con discapacidad visual, con inferencia local vía ONNX Runtime.
- Prototipado de interfaces de voz: al pesar ~0,1 GB, permite iterar rápidamente en entornos de desarrollo sin infraestructura pesada.
- Sistemas embebidos y edge computing: la exportación ONNX y el tamaño reducido facilitan su ejecución en dispositivos con recursos limitados.
- Pruebas de integración con phoonnx: sirve como voz de referencia para validar pipelines de TTS dentro del ecosistema phoonnx antes de desplegar otras voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (~0,1 GB) se espera un consumo muy bajo, probablemente inferior a 1 GB, pero no se confirma.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime (CUDA o ROCm) debería poder ejecutarlo; también es viable en CPU.
- Compatibilidad con GPU de consumo: probablemente sí en la mayoría de tarjetas consumer modernas, dado el tamaño reducido, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime (CPU/GPU) y la librería phoonnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/coqui-vits-de-thorsten-vits | Coqui VITS | Alemán | ~0,1 GB (repo) | Apache-2.0 | ONNX | Hugging Face |
| Coqui TTS (family) | VITS / otros | Multilingüe | Variable | MPL-2.0 / Apache-2.0 según checkpoint | PyTorch / ONNX | Coqui / HF |
| Piper (rhasspy) | VITS | Multilingüe | Decenas de MB | MIT / varias | ONNX | GitHub / HF |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) para este checkpoint concreto, por lo que la comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Model card mínima: no se documentan parámetros, datos de entrenamiento, tasa de muestreo ni métricas de calidad.
- Sin datos de evaluación: no hay MOS, comparativas subjetivas ni benchmarks publicados.
- Un solo hablante: el identificador "Thorsten" sugiere una voz concreta; no se documenta control de estilo ni emoción.
- Idioma limitado al alemán según el identificador; no se confirma soporte multilingüe.
- Riesgo de alucinación en TTS: posible generación de pronunciaciones incorrectas o artefactos en textos fuera del dominio de entrenamiento.
- Sesgos: no documentados; al derivar de un corpus concreto, puede reflejar sesgos prosódicos o de pronunciación de dicho corpus.
- Licencia Apache-2.0 declarada, pero heredada del repositorio fuente; conviene verificar la procedencia del checkpoint original antes de uso comercial.
- Sin mantenimiento aparente: 0 descargas y 0 likes, creado y actualizado el mismo día, lo que sugiere un artefacto de publicación automática sin soporte activo.
- No apto para clonación de voz ni para aplicaciones que requieran control fino de prosodia sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-de-thorsten-vits
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
