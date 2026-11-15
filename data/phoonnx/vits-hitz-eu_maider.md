# Phoonnx/vits-hitz-eu_maider

## Resumen

`Phoonnx/vits-hitz-eu_maider` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, extraído del repositorio agregador `Phoonnx/phoonnx-vits` y empaquetado para su uso con la librería `phoonnx`, un runtime de inferencia de TTS desarrollado por TigreGotico. Se trata de una voz concreta identificada internamente como `hitz/eu_maider-vits`, lo que sugiere una voz en euskera (código `eu`) con el nombre de hablante "Maider", aunque la model card no lo confirma explícitamente.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial durante el entrenamiento. VITS es una arquitectura consolidada para TTS neuronal de alta calidad y bajo coste computacional en inferencia, ampliamente utilizada en el ecosistema Piper y en variantes multilingües.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto derivado, sin métricas publicadas, sin descargas ni validación comunitaria, y con información técnica mínima. Resulta útil para quien necesite una voz VITS en euskera integrable vía ONNX en un pipeline de `phoonnx`, pero no debe considerarse un modelo de referencia ni un sistema listo para producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decoder tipo HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por utterance, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | euskera inferido por el código `eu` del identificador; no confirmado en la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo end-to-end que mapea secuencias de fonemas a formas de onda mediante un encoder de texto, un prior normalizing flow que modela la distribución latente condicionada al texto, y un decoder generativo basado en HiFi-GAN. El entrenamiento original de VITS combina pérdida adversarial (con discriminadores multi-periodo y multi-escala), pérdida de reconstrucción espectral y pérdida de alineamiento monótono para aprender la alineación texto-audio sin supervisión explícita de duraciones.

No se dispone de información sobre el corpus de entrenamiento, número de horas de audio, número de tokens, composición del dataset ni si se aplicaron etapas de ajuste fino o RLHF. Tampoco se documenta el front-end fonético utilizado, aunque el ecosistema `phoonnx` y Piper suele emplear `espeak-ng` para la fonemización. No se han publicado innovaciones técnicas adicionales ni variantes de decodificación especulativa en la información disponible.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato ONNX, ejecutable mediante la librería `phoonnx`.
- Generación de audio de una sola voz identificada como `hitz/eu_maider-vits`.
- Integración en pipelines de TTS que consumen modelos ONNX sin dependencia de frameworks de deep learning pesados.
- Capacidad multilingüe: no disponible; el identificador sugiere euskera, pero no se confirma.
- Soporte de tool calling, agentes, razonamiento multi-paso o modos de pensamiento: no aplica (es un modelo TTS, no un LLM).
- Capacidades de visión o audio de entrada: no disponible; el modelo es de audio de salida.

## Casos de uso

- Síntesis de voz en euskera para asistentes conversacionales: el modelo puede generar locuciones a partir de texto en un runtime ONNX ligero, adecuado para integrarse en un asistente de voz que requiera respuestas habladas en euskera.
- Lectura de contenido accesible: conversión de artículos, noticias o documentación a audio para usuarios con discapacidad visual o para consumo en movilidad, aprovechando el bajo coste de inferencia de VITS.
- Generación de avisos y anuncios automatizados: locuciones para transporte público, aeropuertos o sistemas de megafonía que necesiten una voz en euskera y se beneficien de un modelo ONNX desplegable en dispositivos de borde.
- Doctaje de audiolibros y pódcast: producción de narraciones sintéticas de textos largos mediante segmentación por frases y concatenación de audio generado por el modelo.
- Pruebas de integración en pipelines de `phoonnx`: validación del runtime y de la carga de modelos ONNX en entornos CI antes de desplegar voces en producción.
- Investigación en TTS de bajos recursos: uso como referencia para comparar voces VITS en euskera frente a otros sistemas y para estudiar el comportamiento de modelos derivados de repositorios agregadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, la huella en memoria es del orden de cientos de MB, apta para CPU.
- GPU recomendadas: no disponible; VITS suele ejecutarse en CPU con latencia aceptable, y en GPU cualquier modelo consumer moderna (RTX 3060 o superior) es más que suficiente.
- Compatibilidad con GPU consumer: sí, previsiblemente en cualquier GPU con soporte ONNX Runtime; no confirmado por el autor.
- Opciones de despliegue: `phoonnx` (runtime nativo del modelo); ONNX Runtime de forma directa; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-hitz-eu_maider | VITS | euskera (inferido) | ONNX | MIT | no aplica | Hugging Face, 0 descargas |
| Piper (voces VITS) | VITS | multilingüe | ONNX | variable por voz | no aplica | Hugging Face, amplia comunidad |
| Coqui TTS (VITS) | VITS | multilingüe | PyTorch/ONNX | MPL-2.0 / variable | no aplica | GitHub, amplia comunidad |
| MMS-TTS (Meta) | VITS | 1100+ idiomas | PyTorch | CC-BY-NC | no aplica | Hugging Face |

La comparativa se limita a modelos de la misma familia arquitectónica; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo derivado sin model card propia: la información técnica, el corpus de entrenamiento y las condiciones de uso proceden del repositorio origen y no están verificadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El idioma no está confirmado en la model card; el código `eu` sugiere euskera, pero debe verificarse antes de usarlo en producción.
- La licencia MIT se hereda del repositorio origen, pero la propia model card advierte que las licencias siguen a los originales por subcarpeta; conviene revisar la licencia de la voz concreta antes de un uso comercial.
- Riesgo de alucinación y artefactos de audio: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos en textos fuera de dominio.
- Sesgos de voz: al ser una única voz identificada, no hay diversidad de hablantes; puede presentar sesgos de género, edad o acento no documentados.
- Sin métricas objetivas (MOS, WER, latencia) publicadas: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Dependencia del runtime `phoonnx`: la integración está atada a esa librería y a su formato de identificadores de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-eu_maider
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la model card): https://github.com/michsethowusu/kasanoma
