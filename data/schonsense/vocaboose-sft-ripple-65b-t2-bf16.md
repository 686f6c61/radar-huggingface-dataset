# schonsense/VOCaboose-SFT-Ripple-65B-T2-BF16

## Resumen

VOCaboose-SFT-Ripple-65B-T2-BF16 es un modelo de generación de texto de 64.782.689.360 parámetros (aproximadamente 65B) desarrollado por el usuario schonsense y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (SFT, supervised fine-tuning) del modelo base schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16, que a su vez pertenece a la familia "Ripple" del mismo autor. El modelo está etiquetado como conversacional y emplea pesos en formato safetensors con precisión BF16, con un tamaño de repositorio de 134,4 GB.

La relevancia de esta ficha es limitada en términos de documentación pública: el modelo no cuenta con descargas ni interacciones en el momento de la consulta, no declara idiomas soportados y no publica resultados de benchmarks. La información disponible se reduce a metadatos de la model card de Hugging Face, por lo que muchos apartados técnicos se marcan explícitamente como "no disponible".

El acceso al modelo está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. La arquitectura exacta, la longitud de contexto y la composición del dataset de entrenamiento no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "ricursive"; requiere `trust_remote_code` por `custom_code`) |
| Parámetros totales | 64.782.689.360 (~65B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. La model card incluye la etiqueta "ricursive" y requiere código personalizado (`custom_code`) para cargarse con `transformers`, lo que sugiere una implementación no estándar que no se describe en la información proporcionada. El modelo es un ajuste fino supervisado (SFT) sobre schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16, que a su vez forma parte de la familia "Ripple" del mismo autor.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) en la información disponible. El tamaño de 65B parámetros en BF16 implica un repositorio de 134,4 GB, coherente con el peso de los tensores en esa precisión.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y su pipeline es `text-generation`.
- Ajuste fino supervisado (SFT): entrenado para seguir instrucciones sobre el modelo base de la familia Ripple.
- Carga mediante `transformers` con código personalizado (`trust_remote_code=True`).
- Capacidades de razonamiento, código, matemáticas, visión, audio, tool calling o agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Experimentación en investigación: el modelo puede emplearse para estudiar el comportamiento de ajustes finos SFT sobre bases de 65B en entornos controlados, dado que su licencia Apache 2.0 permite modificaciones y análisis.
- Generación de texto conversacional en prototipos: adecuado para entornos de prueba donde se requiera un modelo de gran tamaño con formato de diálogo, siempre que se acepte la condición de acceso restringido.
- Evaluación comparativa de familias de modelos: sirve como punto de comparación frente a otros ajustes finos de la familia Ripple o frente a modelos de tamaño similar.
- Fine-tuning posterior: al ser un modelo SFT con licencia permisiva, puede servir como base para nuevos ajustes finos en dominios específicos.
- Docencia y formación: útil para ilustrar el flujo de trabajo con modelos gated y código personalizado en `transformers`.
- Investigación sobre estabilidad y alineación: permite analizar el comportamiento de un modelo de 65B afinado sin datos públicos de benchmarks, como caso de estudio de transparencia limitada.

En todos los casos, la ausencia de benchmarks y de documentación sobre datos de entrenamiento limita la recomendación para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB solo para pesos (65B × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 65-70 GB (estimación teórica; no se confirman cuantizaciones publicadas).
- VRAM estimada en cuantización de 4 bits: alrededor de 35-40 GB (estimación teórica; no se confirman cuantizaciones publicadas).
- GPU recomendadas: para BF16, múltiples A100 80GB o H100 80GB (por ejemplo, 2× A100 80GB o 2× H100). Para cuantización 4 bits, una sola A100 80GB o H100 podría ser suficiente en teoría.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16; en cuantización 4 bits podría requerir más de 24 GB, por lo que no se garantiza su ejecución en GPU de consumo de 24 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La siguiente tabla recoge únicamente los datos del modelo y deja el resto como "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| VOCaboose-SFT-Ripple-65B-T2-BF16 | ~65B | no disponible | Apache 2.0 | Restringido (gated) |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas.
- Documentación mínima: no se detallan datos de entrenamiento, idiomas ni arquitectura, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: no cuantificado; al ser un modelo SFT sin evaluación pública, el riesgo es desconocido.
- Sesgos: no documentados.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Código personalizado: la carga requiere `trust_remote_code=True`, con el consiguiente riesgo de seguridad si no se audita el código.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación pública no se recomienda para producción sin validación propia.
- Idiomas: no declarados; no se garantiza un rendimiento multilingüe.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/schonsense/VOCaboose-SFT-Ripple-65B-T2-BF16
- Modelo base: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16
