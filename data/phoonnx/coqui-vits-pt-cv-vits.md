# Phoonnx/coqui-vits-pt-cv-vits

## Resumen

`Phoonnx/coqui-vits-pt-cv-vits` es un modelo de síntesis de voz (text-to-speech) derivado del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que empaqueta voces Coqui VITS en formato ONNX para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Este artefacto concreto corresponde a la carpeta `pt-cv-vits`, es decir, una voz en portugués entrenada sobre el corpus Common Voice y publicada bajo licencia BSD-3-Clause.

El modelo se distribuye como un repositorio pequeño (0,1 GB) con pesos en formato ONNX, lo que lo hace directamente desplegable en entornos de inferencia sin depender del stack original de Coqui TTS. La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional VAE con decoder HiFi-GAN integrado que genera audio de forma end-to-end a partir de texto.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado con cero descargas y cero likes en el momento de la consulta, sin model card propia más allá de la referencia al repositorio origen, y sin datos publicados de benchmarks, parámetros o composición del dataset de entrenamiento. Resulta útil para quien necesite una voz portuguesa empaquetada en ONNX para phoonnx, pero no debe considerarse un modelo con documentación técnica completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui VITS), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (`pt`, según identificador de la voz y dataset Common Voice) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional condicionado por duración y un decoder generativo basado en HiFi-GAN. VITS se entrena con una combinación de pérdida adversarial, pérdida de reconstrucción espectral y modelado variacional, lo que permite generar formas de onda directamente desde fonemas sin un vocoder separado.

Según la model card, la voz se entrenó sobre el corpus Common Voice en portugués. No se especifican el número de horas de audio, el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de fine-tuning adicionales, RLHF o ajuste prosódico. La única información técnica fiable es la procedencia (repositorio `phoonnx-coqui-vits`, carpeta `pt-cv-vits`) y el identificador de voz `coqui/pt-cv-vits`.

## Capacidades

- Síntesis de voz a partir de texto en portugués.
- Generación end-to-end de forma de onda mediante VITS con decoder HiFi-GAN.
- Ejecución mediante ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencias del stack Python de Coqui.
- Integración con la librería phoonnx mediante el identificador de voz `coqui/pt-cv-vits`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidades multilingües: limitadas al portugués según la información disponible.

## Casos de uso

- Síntesis de voz para asistentes en portugués: el modelo puede integrarse en un pipeline TTS para generar respuestas habladas en aplicaciones de atención al cliente en portugués, aprovechando el formato ONNX para inferencia ligera.
- Lectura de contenido accesible: conversión de artículos, noticias o documentación a audio para usuarios con discapacidad visual, usando la voz `pt-cv-vits` como motor de lectura en portugués.
- Generación de audiolibros y pódcast automatizados: síntesis por lotes de textos largos en portugués, con la ventaja de que ONNX permite ejecución en CPU en servidores sin GPU.
- Sistemas de navegación y avisos por voz: generación de prompts de voz predecibles y de baja latencia para aplicaciones de movilidad o domótica en portugués.
- Pruebas de integración en pipelines phoonnx: al ser un artefacto del repositorio `phoonnx-coqui-vits`, sirve como voz de referencia para validar el flujo de carga y síntesis de la librería.
- Prototipado de interfaces conversacionales: combinación con un LLM externo para producir respuestas habladas en portugués en demos y pruebas de concepto, dado el reducido tamaño del repositorio (0,1 GB).
- Localización de contenido multimedia: doblaje automatizado de vídeos o tutoriales al portugués cuando no se requiere clonación de voz ni control emocional fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se trata de un modelo pequeño que probablemente quepa en GPUs de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU y en GPUs convencionales, pero no se aportan datos de VRAM ni de latencia.
- Opciones de despliegue: ONNX Runtime y la librería phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/coqui-vits-pt-cv-vits` | VITS (ONNX) | Portugués | ONNX | BSD-3-Clause | Hugging Face |
| Otras voces de `Phoonnx/phoonnx-coqui-vits` | VITS (ONNX) | Varios (según carpeta) | ONNX | BSD-3-Clause (según origen) | Hugging Face |
| Coqui TTS VITS originales | VITS | Varios | PyTorch | MPL-2.0 / otras según modelo | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo derivado con documentación mínima: la model card se limita a referenciar el repositorio origen y el identificador de voz, sin detalles de entrenamiento.
- Sin métricas publicadas de calidad (MOS, inteligibilidad, prosodia), lo que impide evaluar su idoneidad en producción sin pruebas propias.
- Sesgos potenciales heredados del corpus Common Voice en portugués (variedad dialectal, representación de hablantes), no documentados.
- Riesgo de alucinación acústica y errores de pronunciación en textos con nombres propios, siglas o préstamos léxicos no cubiertos por el dataset.
- Limitación de idioma: la voz está diseñada para portugués; su uso en otros idiomas no está soportado ni documentado.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso, pero debe verificarse la procedencia exacta de los pesos originales en el repositorio `phoonnx-coqui-vits`.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento activo.
- No apto para clonación de voz ni control emocional, al no documentarse dichas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-pt-cv-vits
- Repositorio origen de voces: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
