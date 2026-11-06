# Mugunth123/sarvam-translate-2bit-GGUF

## Resumen

Sarvam-translate 2-bit GGUF es una cuantización extrema del modelo `sarvamai/sarvam-translate`, un modelo fundacional de traducción multilingüe desarrollado por Sarvam AI en colaboración con AI4Bharat y construido sobre Google Gemma 3 4B-IT. Esta versión concreta, publicada por el usuario Mugunth123, aplica una cuantización IQ2_M con imatrix de calibración que reduce el peso de 8,1 GB a 1,42 GB (2,70 bits por peso), manteniendo un equilibrio entre compresión extrema y calidad de generación estable.

El modelo resuelve el problema de la traducción bidireccional entre el inglés y las 22 lenguas programadas de la India, un conjunto de idiomas con escasa representación en los modelos generalistas. Su relevancia actual radica en que permite ejecutar un traductor especializado de 3.880 millones de parámetros en hardware muy modesto (unos 2 GB de RAM), lo que facilita el despliegue en entornos con recursos limitados, dispositivos de borde o infraestructuras sin GPU dedicada.

La arquitectura subyacente es la de Gemma 3 4B, un transformer con atención de consultas agrupadas (GQA) de 8 cabezas de consulta y 4 de clave-valor, 34 capas y una ventana de contexto de hasta 8.192 tokens. La licencia GPL-3.0 condiciona su uso comercial, un aspecto crítico a evaluar antes de integrarlo en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 4B con GQA (8 Q-heads, 4 KV-heads, 34 capas) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 8.192 tokens |
| Tipos de cuantizacion | IQ2_M con imatrix de calibracion (2,70 BPW); el autor ofrece tambien IQ1_S, IQ1_M, Q4_K_M y Q8_0 |
| Idiomas soportados | Ingles y 22 lenguas programadas de la India: as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (archivo `sarvam-translate-IQ2_M.gguf`, 1,42 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only derivado de Gemma 3 4B-IT, con atención de consultas agrupadas que reduce el coste de memoria de la caché KV (8 cabezas de consulta frente a 4 de clave-valor) y 34 capas. La ventana de contexto alcanza los 8.192 tokens, suficiente para párrafos y documentos de longitud moderada en tareas de traducción.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO en el ajuste del modelo base. La model card únicamente indica que se trata de un modelo fundacional de traducción desarrollado por Sarvam AI con AI4Bharat sobre Gemma 3 4B-IT, y que esta versión concreta es una cuantización IQ2_M con imatrix de calibración realizada por Mugunth123. El uso de imatrix (matriz de importancia) permite preservar mejor la calidad en cuantizaciones de muy baja precisión al ponderar los pesos según su relevancia para la calibración.

## Capacidades

- Traducción bidireccional entre inglés y las 22 lenguas programadas de la India, incluyendo pares como hindi-inglés, tamil-inglés, bengalí-inglés o urdu-inglés.
- Generación de texto conversacional en formato de chat con tokens especiales `<start_of_turn>` y `<end_of_turn>`.
- Traducción con temperatura 0.0 para salidas deterministas, tal como recomienda el autor en los ejemplos de uso.
- Soporte de inferencia tanto en CPU como en GPU mediante llama.cpp y llama-cpp-python.
- Capacidad de procesar entradas de hasta 8.192 tokens, adecuada para párrafos y documentos cortos.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio para esta cuantización.

## Casos de uso

- Traducción de documentación técnica al hindi o tamil: el modelo puede procesar párrafos completos dentro de su ventana de 8.192 tokens y generar traducciones deterministas con temperatura 0.0, adecuadas para documentación que requiere consistencia terminológica.
- Localización de interfaces de usuario en lenguas indias: con solo 1,42 GB de pesos y unos 2 GB de RAM, puede desplegarse en servidores modestos o incluso en dispositivos de borde para traducir cadenas de texto de aplicaciones móviles.
- Atención al cliente multilingüe en la India: el modelo permite traducir consultas de usuarios en bengalí, marathi o telugu al inglés para su procesamiento por un sistema central, y devolver la respuesta traducida al idioma original.
- Procesamiento por lotes de corpus en CPU: al caber en memoria de sistemas sin GPU, permite traducir grandes volúmenes de texto en servidores de bajo coste mediante llama.cpp con `n_gpu_layers=0`.
- Traducción de contenido periodístico o editorial: la ventana de contexto permite manejar artículos completos, y la cuantización IQ2_M ofrece un equilibrio razonable entre calidad y huella de memoria para publicaciones con presupuesto limitado.
- Investigación en traducción automática de bajos recursos: el modelo sirve como línea base ligera para experimentos con lenguas como santali, bodo o manipuri, que rara vez están cubiertas por modelos comerciales.
- Despliegue en entornos con restricciones de conectividad: al ser un GGUF autónomo de 1,42 GB, puede ejecutarse localmente sin dependencia de APIs externas, útil en zonas con infraestructura de red limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,0 GB de RAM según el autor para la cuantización IQ2_M; en GPU, la huella es similar más el overhead de la caché KV según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre puede alojar el modelo completo con `n_gpu_layers=-1`; tarjetas como RTX 3060, RTX 4060 o superiores son más que suficientes. También funciona en A100/H100, aunque el modelo está sobredimensionado para ese hardware.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sarvam-translate 2-bit GGUF (este) | 3.880 M | 8.192 | GGUF IQ2_M (1,42 GB) | GPL-3.0 | Cuantizacion extrema con imatrix; enfoque en 22 lenguas indias |
| Sarvam-translate 4-bit GGUF (mismo autor) | 3.880 M | 8.192 | GGUF Q4_K_M (2,31 GB) | GPL-3.0 | Mayor calidad a costa de ~0,9 GB adicionales |
| Sarvam-translate 8-bit GGUF (mismo autor) | 3.880 M | 8.192 | GGUF Q8_0 (3,84 GB) | GPL-3.0 | Calidad practicamente identica al original; requiere mas memoria |
| sarvamai/sarvam-translate (original) | 3.880 M | 8.192 | Safetensors (8,1 GB) | GPL-3.0 | Referencia de calidad; requiere GPU con mas VRAM |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en traducción frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización IQ2_M a 2,70 bits por peso introduce degradación de calidad frente al modelo original de 8,1 GB; es esperable pérdida de fluidez y precisión en lenguas de bajos recursos como santali, bodo o manipuri.
- Riesgo de alucinación y de traducciones inventadas, especialmente con entradas ambiguas, muy largas o fuera del dominio de entrenamiento.
- La ventana de contexto está limitada a 8.192 tokens; documentos más largos requieren segmentación manual.
- El modelo está especializado en traducción inglés-lenguas indias; su uso para otras tareas generativas no está validado y probablemente ofrezca resultados pobres.
- La licencia GPL-3.0 impone obligaciones de copyleft: integrar el modelo en productos propietarios puede requerir la liberación del código derivado. Es imprescindible revisar la compatibilidad con el modelo de negocio antes de un despliegue comercial.
- No se documentan en la información disponible evaluaciones de sesgos, toxicidad o robustez; se recomienda auditoría propia antes de producción.
- El repositorio tiene muy pocas descargas (159) y cero likes en el momento de la consulta, lo que sugiere validación comunitaria limitada.
- La fecha de creación indicada (2026-10-25) es posterior a la fecha habitual de consulta; conviene verificar la vigencia y procedencia del artefacto antes de usarlo en entornos críticos.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Mugunth123/sarvam-translate-2bit-GGUF
- Modelo base original: https://huggingface.co/sarvamai/sarvam-translate
- Cuantización 1-bit (IQ1_S): https://huggingface.co/Mugunth123/sarvam-translate-1bit-GGUF
- Cuantización 1.58-bit (IQ1_M): https://huggingface.co/Mugunth123/sarvam-translate-1.58bit-GGUF
- Cuantización 4-bit (Q4_K_M): https://huggingface.co/Mugunth123/sarvam-translate-4bit-GGUF
- Cuantización 8-bit (Q8_0): https://huggingface.co/Mugunth123/sarvam-translate-8bit-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/Mugunth123
