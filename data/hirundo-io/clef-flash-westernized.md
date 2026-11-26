# hirundo-io/clef-flash-westernized

## Resumen

Clef-flash-westernized es un modelo de decisión multimodal (image-text-to-text) desarrollado por hirundo-io como un ajuste fino del modelo Cloudflare/clef-flash. Se presenta como una variante "occidentalizada" del modelo base, orientada explícitamente a la mitigación de sesgos culturales en la toma de decisiones automatizada. Con aproximadamente 9.400 millones de parámetros en formato safetensors, se posiciona en la franja de modelos de tamaño medio-grande con capacidad de procesamiento conjunto de imagen y texto.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, aunque el acceso está restringido (gated) y requiere la aceptación de condiciones en Hugging Face. La arquitectura declarada en las etiquetas es qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5, si bien no se dispone de documentación técnica detallada sobre la composición exacta del entrenamiento ni del dataset utilizado para el ajuste.

Su relevancia actual radica en la creciente demanda de modelos que reduzcan sesgos culturales en aplicaciones de decisión automatizada, especialmente en contextos donde la visión por computadora y el razonamiento textual se combinan. No obstante, la ausencia de benchmarks publicados y de documentación sobre el proceso de entrenamiento limita la evaluación rigurosa de sus capacidades reales frente a alternativas consolidadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según etiquetas del repositorio) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura qwen3_5 y que deriva de Cloudflare/clef-flash mediante un proceso de merge o ajuste fino, según la etiqueta `base_model:merge:Cloudflare/clef-flash`. El pipeline declarado es image-text-to-text, lo que confirma su naturaleza multimodal con entrada de imagen y texto. El sufijo "westernized" y la etiqueta `bias-mitigation` sugieren que el ajuste se orientó a corregir sesgos culturales presentes en el modelo base, probablemente mediante un conjunto de datos de preferencias o instrucciones alineadas con valores y contextos occidentales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. Tampoco se documenta si el ajuste afectó a la torre de visión, al codificador de lenguaje o a ambos. Esta falta de transparencia es una limitación importante para evaluar la reproducibilidad y el alcance real de la "occidentalización" aplicada.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas image-text-to-text.
- Procesamiento de imágenes combinado con instrucciones textuales para tareas de decisión.
- Conversación multi-turno (etiqueta `conversational`).
- Mitigación de sesgos culturales orientada a contextos occidentales (según la denominación del modelo).
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales como thinking mode, audio u otras modalidades.

## Casos de uso

- Moderación de contenido multimodal: el modelo puede evaluar imágenes junto con texto para clasificar contenido sensible, aprovechando su ajuste orientado a reducir sesgos culturales en las decisiones.
- Sistemas de decisión asistida en atención al cliente: combinación de capturas de pantalla o imágenes adjuntas con consultas textuales para resolver incidencias, gracias a su naturaleza conversacional.
- Análisis de documentos escaneados con contexto textual: extracción de información y razonamiento sobre formularios o recibos en flujos de back-office.
- Evaluación de imágenes en procesos de compliance: verificación de que el contenido visual cumple políticas internas, con un sesgo cultural más alineado con normativas occidentales.
- Asistentes de accesibilidad: descripción y razonamiento sobre imágenes para usuarios con discapacidad visual, integrado en interfaces conversacionales.
- Investigación en mitigación de sesgos: uso como referencia para estudiar cómo el ajuste fino cultural afecta al comportamiento de modelos multimodales base.
- Prototipado de aplicaciones image-text-to-text en entornos donde se requiere licencia Apache 2.0 y control de acceso mediante gating.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 18,8 GB solo para pesos (9,4 B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 9,4 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits: en torno a 4,7 GB para pesos, aunque la disponibilidad de pesos cuantizados no está confirmada.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción con FP16; RTX 4090 (24 GB) viable en FP16 con contexto limitado o en cuantización.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) con cuantización; en GPUs de 16 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: vLLM, TGI y llama.cpp son candidatos habituales para arquitecturas tipo Qwen; la compatibilidad exacta con GGUF no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/clef-flash-westernized | 9,4 B | no disponible | Apache 2.0 | Gated | Ajuste cultural de clef-flash |
| Cloudflare/clef-flash (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen2.5-VL-7B | 7 B | 128 K (según documentación pública de Qwen) | Apache 2.0 | Abierto | Alternativa multimodal consolidada |
| Llama 3.2 11B Vision | 11 B | 128 K (según documentación pública de Meta) | Llama 3.2 Community License | Gated | Alternativa multimodal con restricciones de licencia |

La comparativa se limita a datos públicos de modelos de la misma franja; no se dispone de métricas de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar empíricamente las capacidades declaradas.
- Riesgo de alucinación inherente a los modelos generativos multimodales, sin datos específicos sobre su tasa.
- La "occidentalización" puede introducir un sesgo cultural inverso, penalizando contextos no occidentales; no se documenta la metodología de mitigación.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera del inglés.
- Longitud de contexto desconocida: limita la planificación de aplicaciones con documentos largos.
- Acceso restringido (gated): requiere aceptación de condiciones, lo que puede complicar la automatización de despliegues.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el modelo base y sus posibles restricciones heredadas debe verificarse.
- Sin información sobre cuantizaciones oficiales ni compatibilidad con frameworks de inferencia, lo que aumenta el coste de integración.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/clef-flash-westernized
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
