# drbaph/FireRedTTS3-bf16

## Resumen

FireRedTTS3-bf16 es un espejo comunitario del modelo de síntesis de voz FireRedTTS3, publicado por el usuario drbaph en HuggingFace. Se trata de una conversión de precisión mixta (bf16/fp32) de los pesos originales de FireRedTeam, diseñada específicamente para reducir el tamaño del repositorio (12,8 GB) y facilitar su integración con el nodo FireRedTTS3-ComfyUI. El modelo mantiene una fidelidad numérica prácticamente idéntica al original: según la model card, la generación con la misma semilla produce formas de onda con coseno 1,0000 y SNR superior a 80 dB.

El modelo base es FireRedTTS3, un sistema de texto a voz (TTS) de FireRed Team con licencia Apache-2.0. La arquitectura combina un backbone LLM basado en Qwen3, un codificador de audio (redae), un codificador de hablante (campp) y un decodificador de flujo (DiT). Esta versión bf16 conserva en precisión completa (fp32) los componentes que el código de inferencia oficial ya ejecuta en fp32, mientras que los tensores que se calculan bajo autocast bf16 se almacenan en bf16. El resultado es un modelo más ligero y compatible con entornos que requieren menor uso de VRAM, sin pérdida perceptible de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS híbrido: backbone LLM (Qwen3) + codificador de audio (redae) + codificador de hablante (campp) + decodificador de flujo (DiT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (mixto con fp32 en componentes específicos) |
| Idiomas soportados | no disponible (se infiere multilingüe por el uso de fastText lid, pero sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con config.json) |

## Arquitectura y entrenamiento

La arquitectura de FireRedTTS3 se compone de varios módulos diferenciados. El componente `fireredtts3_base` incluye un backbone LLM basado en Qwen3, un PatchEncoder, una cabeza de flujo DiT, una cabeza de parada (stop head) y proyecciones de hablante. El componente `fireredtts3_instruct` es similar pero sin las proyecciones de hablante, orientado a instrucciones. El módulo `redae` actúa como codificador de audio, con un decodificador y una cabeza ISTFT. El módulo `campp` se encarga de las embeddings de hablante y se mantiene íntegramente en fp32.

En esta versión bf16, la política de conversión es selectiva: solo los tensores que el código de inferencia oficial ya computa bajo autocast bf16 se almacenan en bf16; el resto permanece en fp32. Esto incluye el backbone Qwen3 en ambos componentes `fireredtts3_base` e `instruct`, así como el codificador de audio en `redae`. Los componentes que se ejecutan en fp32 (PatchEncoder, DiT flow head, stop head, proyecciones de hablante, decodificador de audio y todo `campp`) se copian sin cambios de precisión. Los directorios `campp/`, `text_tokenizer/` y `fasttext/lid.176.ftz` se transfieren intactos, y solo se modifica el campo `dtype` en cada `config.json`.

No se dispone de información sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El modelo se distribuye tal cual, sin fine-tuning adicional por parte del autor del mirror.

## Capacidades

- Síntesis de voz (texto a voz) de alta calidad, con generación de audio a partir de texto.
- Soporte de instrucciones: el componente `fireredtts3_instruct` sugiere capacidad de control fino sobre la prosodia o el estilo mediante instrucciones en lenguaje natural.
- Clonación o adaptación de voz: el módulo `campp` proporciona embeddings de hablante, lo que permite condicionar la generación a una voz de referencia.
- Multilingüismo probable: la inclusión de `fasttext/lid.176.ftz` (detección de idioma) indica soporte para múltiples idiomas, aunque no se especifica la lista exacta.
- Compatibilidad con ComfyUI: el mirror está diseñado para funcionar con el nodo FireRedTTS3-ComfyUI, lo que facilita su uso en pipelines de generación de audio dentro de ese ecosistema.

## Casos de uso

- Generación de audiolibros y narración: el modelo puede convertir texto largo en voz natural, aprovechando el backbone LLM para mantener coherencia contextual y entonación adecuada.
- Doblaje y localización de contenido: gracias a la detección de idioma (fastText) y las embeddings de hablante, se puede generar voz en varios idiomas con una voz de referencia consistente.
- Asistentes de voz y agentes conversacionales: la capacidad de instrucciones permite modular el tono y el estilo, útil para interfaces de voz en aplicaciones de atención al cliente o asistentes personales.
- Producción de contenido para redes sociales: creación de voces en off para vídeos, podcasts o anuncios, con control fino sobre la prosodia mediante instrucciones.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura, con opciones de personalización de voz.
- Investigación en síntesis de voz: el modelo sirve como base para experimentos de fine-tuning o comparación de arquitecturas TTS, gracias a su licencia Apache-2.0 y su formato de pesos estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye métricas de calidad objetiva (MOS, WER, etc.) ni comparaciones con otros modelos TTS. La única métrica reportada es la fidelidad de la conversión bf16 frente a los pesos fp32 originales: coseno 1,0000 y SNR > 80 dB en la misma semilla.

## Requisitos de hardware

- Tamaño del repositorio: 12,8 GB en formato safetensors, lo que sugiere que la carga en memoria requiere al menos esa cantidad de VRAM o RAM, dependiendo del backend.
- VRAM estimada: no disponible con precisión, pero al ser un modelo de TTS con backbone LLM (Qwen3), se espera que necesite al menos 16-24 GB de VRAM para inferencia en fp32/bf16. La versión bf16 reduce el uso de memoria frente a fp32, pero no se especifica el ahorro exacto.
- GPU recomendadas: no disponible. Por el tamaño, se recomienda una GPU con al menos 24 GB (RTX 3090/4090, A100, etc.) para ejecución cómoda.
- Opciones de despliegue: el mirror está pensado para ComfyUI, pero al ser safetensors estándar, podría usarse con el código de inferencia oficial de FireRedTTS3 o adaptarse a otros frameworks (vLLM, TGI) si se implementa el pipeline.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. FireRedTTS3 es un TTS relativamente reciente y el mirror bf16 no incluye benchmarks. Como referencia cualitativa, se pueden mencionar alternativas open source de TTS como XTTS v2 (Coqui), Bark (Suno) o StyleTTS2, pero sin datos numéricos de comparación no es posible establecer una tabla objetiva. Se recomienda consultar la documentación oficial de FireRedTeam para obtener métricas comparativas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas del modelo. Como TTS, el riesgo principal es la generación de audio con errores de pronunciación o entonación en contextos complejos.
- La conversión bf16, aunque fiel según el autor, podría introducir diferencias mínimas en entornos de inferencia que no usen autocast bf16 de la misma manera.
- El mirror no incluye el código de inferencia; es solo un repositorio de pesos. Para usar el modelo, es necesario obtener el código oficial de FireRedTeam o el nodo de ComfyUI.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que los pesos originales de FireRedTeam también estén bajo esa licencia (así se indica en la model card del mirror).
- No se especifican los idiomas soportados; aunque la presencia de fastText sugiere multilingüismo, la calidad en idiomas distintos del inglés no está garantizada.
- El tamaño del repositorio (12,8 GB) puede ser un obstáculo para despliegues en entornos con recursos limitados.

## Enlaces

- Repositorio del mirror: https://huggingface.co/drbaph/FireRedTTS3-bf16
- Modelo original: https://huggingface.co/FireRedTeam/FireRedTTS3
- Nodo ComfyUI: https://github.com/Saganaki22/FireRedTTS3-ComfyUI
