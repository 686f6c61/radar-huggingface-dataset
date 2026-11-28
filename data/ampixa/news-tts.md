# ampixa/news-tts

## Resumen

`ampixa/news-tts` es un modelo de síntesis de voz (text-to-speech) publicado en Hugging Face por el usuario `ampixa`, orientado específicamente al idioma nepalí (`ne`). El repositorio se distribuye en formato ONNX con un tamaño de 4,3 GB y está etiquetado con las tecnologías `kokoro` y `rvc`, lo que sugiere una arquitectura híbrida que combina un motor TTS neuronal (estilo Kokoro) con conversión de voz (Retrieval-based Voice Conversion). El acceso está restringido: es un repositorio *gated* que exige aceptar condiciones específicas antes de la descarga.

El modelo no cuenta con descargas ni interacciones registradas en el momento de la consulta, y la documentación pública es mínima. La información disponible se limita a los metadatos del repositorio: pipeline `text-to-speech`, librería ONNX, idioma nepalí y licencia propietaria `ampixa-news-tts-gated`. No se han publicado detalles sobre arquitectura interna, número de parámetros, contexto ni datos de entrenamiento.

Su relevancia radica en la escasez de modelos TTS abiertos para nepalí en el ecosistema Hugging Face, lo que lo convierte en una opción potencial para aplicaciones de accesibilidad, locución automatizada o doblaje en ese idioma, siempre que el usuario acepte las condiciones de acceso y asuma la falta de transparencia técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetas: kokoro, rvc; formato ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en ONNX, cuantización no especificada) |
| Idiomas soportados | Nepalí (`ne`) |
| Licencia | `ampixa-news-tts-gated` (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 4,3 GB |
| Pipeline | Text-to-speech |
| Acceso | Gated (restringido) |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna del modelo. Las etiquetas del repositorio (`kokoro`, `rvc`, `onnx`) apuntan a una posible combinación de un modelo TTS basado en Kokoro (arquitectura ligera de síntesis neuronal) con un módulo RVC (Retrieval-based Voice Conversion) para el ajuste o clonación de timbre vocal. Sin embargo, esta inferencia no está confirmada por la documentación oficial.

Tampoco se dispone de datos sobre el corpus de entrenamiento, número de tokens o horas de audio, composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La ausencia de paper, model card detallada o blog asociado impide verificar innovaciones técnicas como decodificación especulativa, atención lineal o vocoder concreto.

## Capacidades

- Síntesis de voz a partir de texto en nepalí.
- Generación de audio en formato ONNX, apto para inferencia en entornos con ONNX Runtime.
- Posible clonación o conversión de voz si el componente RVC está efectivamente integrado (no confirmado).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta capacidad multilingüe: solo nepalí.
- No se documentan modos especiales como thinking, visión o audio de entrada.

## Casos de uso

- Locución automatizada de noticias en nepalí: el modelo puede convertir titulares o artículos en audio para portales informativos, aprovechando su orientación declarada a "news" en el nombre y su idioma nativo.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten una voz en nepalí, desplegando el modelo ONNX en local o en servidor.
- Doblaje de vídeos cortos: generación de pistas de voz para contenido educativo o divulgativo en nepalí, con posibilidad de ajuste de timbre si el módulo RVC está operativo.
- Asistentes de voz para atención al ciudadano: síntesis de respuestas en nepalí en sistemas IVR o chatbots telefónicos, siempre que se valide la calidad y latencia en producción.
- Audiolibros y podcast automatizados: conversión de texto largo a audio en nepalí, con la ventaja de ejecución ONNX en infraestructura sin GPU dedicada.
- Prototipado de interfaces conversacionales: uso del modelo como base para experimentar con TTS en nepalí en entornos de investigación, aceptando las condiciones de la licencia gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de un modelo ONNX de 4,3 GB, es plausible su ejecución en CPU, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite despliegue en RTX 4090 o similares si el modelo lo soporta, pero no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en la mayoría de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos TTS comparables para nepalí con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de la descarga; no es un modelo de uso libre inmediato.
- Licencia propietaria (`ampixa-news-tts-gated`): las condiciones exactas de uso comercial no están detalladas en la información disponible; es imprescindible revisarlas antes de cualquier despliegue en producción.
- Idiomas limitados al nepalí: no apto para otros idiomas sin reentrenamiento o ajuste.
- Ausencia de documentación técnica: no hay model card detallada, paper ni benchmarks, lo que dificulta evaluar calidad, sesgos o robustez.
- Riesgo de sesgos: al no conocerse el corpus de entrenamiento, no se puede evaluar el sesgo de género, dialectal o de registro en la voz generada.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos complejos.
- Sin garantías de soporte ni mantenimiento: el repositorio no registra descargas ni actividad, lo que sugiere un proyecto incipiente o experimental.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/news-tts
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
