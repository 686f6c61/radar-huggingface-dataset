# Phoonnx/coqui-vits-bg-cv-vits

## Resumen

`Phoonnx/coqui-vits-bg-cv-vits` es un modelo de síntesis de voz (text-to-speech) derivado de la familia Coqui VITS, empaquetado en formato ONNX por el autor Phoonnx para su uso con la librería `phoonnx`. Se trata de una extracción concreta (carpeta `bg-cv-vits`) del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que reúne múltiples voces Coqui VITS convertidas a ONNX para inferencia ligera y portable.

El modelo está orientado a la generación de habla en búlgaro (`bg-BG`), entrenado presumiblemente sobre el corpus Common Voice, según se desprende del identificador de la voz `coqui/bg-cv-vits` y de la tabla de licencias de la model card. La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo condicional de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujo normalizador y un vocoder HiFi-GAN integrado.

Su relevancia es acotada pero práctica: ofrece una voz búlgara preentrenada y ligera (repo de 0,1 GB) en ONNX, lo que facilita el despliegue en entornos sin GPU o con dependencias mínimas. No obstante, la información publicada es muy escasa: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas más allá de la licencia BSD-3-Clause y la etiqueta de pipeline `text-to-speech`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | búlgaro (`bg-BG`, según identificador de voz y corpus Common Voice) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo de síntesis de voz de extremo a extremo presentado originalmente por Kim et al. (2021). VITS combina un encoder de texto basado en transformer, un prior variacional condicionado por alineamientos monotónicos, un decoder generativo con flujos normalizadores y un vocoder HiFi-GAN, todo entrenado de forma conjunta con pérdidas adversarias y de reconstrucción. Esta integración elimina la necesidad de un vocoder separado en inferencia y permite generar audio de forma directa a partir del texto.

En cuanto al entrenamiento, la model card no aporta detalles sobre número de tokens, horas de audio, composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino. El identificador `bg-cv-vits` sugiere que la voz se entrenó sobre el corpus Common Voice en búlgaro, pero esta inferencia no está confirmada explícitamente en la documentación. No se documentan innovaciones técnicas adicionales más allá de la exportación a ONNX para su uso con `phoonnx`.

## Capacidades

- Síntesis de voz (text-to-speech) en búlgaro a partir de texto de entrada.
- Generación de audio de forma end-to-end mediante VITS, con vocoder integrado.
- Inferencia en formato ONNX, lo que permite ejecución con ONNX Runtime en CPU y GPU.
- Integración con la librería `phoonnx` mediante el identificador de voz `coqui/bg-cv-vits`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de LLM.
- No se documentan capacidades multilingües más allá del búlgaro.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura de contenido en búlgaro: el modelo puede convertir artículos, noticias o documentación a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando que es una voz nativa búlgara.
- Asistentes de voz para aplicaciones búlgaras: integración en interfaces conversacionales que requieran respuestas habladas en búlgaro, con inferencia ONNX ligera.
- Audiolibros y narración automatizada: generación de audio a partir de texto largo en búlgaro, troceando el texto en segmentos y concatenando la salida.
- Sistemas de anuncios y avisos automatizados: transporte público, aeropuertos o comercios que necesiten locuciones dinámicas en búlgaro sin grabaciones pregrabadas.
- Prototipado de productos de voz: al ser un repo de 0,1 GB en ONNX, es adecuado para pruebas rápidas en entornos de desarrollo sin infraestructura GPU dedicada.
- Investigación en TTS para lenguas eslavas del sur: sirve como base o referencia para experimentos de adaptación, fine-tuning o comparación con otros sistemas VITS.
- Despliegue en dispositivos con recursos limitados: la exportación ONNX permite ejecución en CPU con ONNX Runtime, útil para entornos edge o contenedores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repo (0,1 GB) se infiere un modelo pequeño, pero no se confirma el número de parámetros ni la huella en memoria.
- GPU recomendadas: no disponible; al ser un modelo VITS pequeño, es probable que cualquier GPU moderna sea suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable (el tamaño del repo sugiere que cabría en GPUs de consumo), aunque no está confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (formato nativo), librería `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-bg-cv-vits | VITS (Coqui) | Búlgaro | ONNX | BSD-3-Clause | Hugging Face |
| Coqui TTS VITS (voces originales) | VITS | Multilingüe | PyTorch | MPL-2.0 / varias | Coqui TTS / HF |
| Piper TTS (voces búlgaras) | VITS | Búlgaro | ONNX | MIT / varias | GitHub / HF |
| MMS-TTS (Meta) | VITS | Multilingüe | PyTorch | CC-BY-NC | HF |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta datos de entrenamiento, número de parámetros ni procedencia exacta del corpus, lo que dificulta evaluar su calidad.
- Riesgo de alucinación acústica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio o con caracteres no vistos.
- Cobertura lingüística limitada al búlgaro; no se documenta soporte para otras lenguas ni code-switching.
- Sin benchmarks publicados: no hay métricas objetivas (MOS, WER, RTF) que permitan comparar su calidad con alternativas.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene verificar la procedencia del corpus Common Voice y las condiciones de la voz original Coqui.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Fecha de creación futura (2026-11-14): metadato anómalo que conviene tratar con cautela.
- No se documentan limitaciones específicas de sesgo, pero al derivar de Common Voice puede heredar sesgos de representación del corpus.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-bg-cv-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
