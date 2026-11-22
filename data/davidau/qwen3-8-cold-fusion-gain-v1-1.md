# DavidAU/Qwen3.8-Cold-Fusion-GAIN-V1.1

## Resumen

Qwen3.8-Cold-Fusion-GAIN-V1.1 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario DavidAU en Hugging Face. El modelo conserva la arquitectura y el pipeline multimodal `image-text-to-text` del original, con 27.781.427.952 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 55,6 GB y acumula 642 descargas y 145 "likes" en el momento de la consulta.

El objetivo declarado del autor es elevar la inteligencia general del modelo base y, sobre todo, reducir el número de tokens de razonamiento (thinking tokens) entre 1/10 y 1/2 respecto a los Qwen estándar, manteniendo el nivel de detalle en la salida. Para ello emplea una técnica propia denominada COLD FUSION, que combina un componente interno llamado GAIN con los entrenadores de Unsloth. Según la model card, este método preserva en torno al 99 % del rendimiento en BF16 tanto a 8 bits como a 4 bits.

El modelo resulta relevante porque ejemplifica la línea de trabajo de la comunidad sobre la familia Qwen 3.8: ajustes ligeros pero muy focalizados que buscan eficiencia en inferencia (menos tokens generados, menor latencia) sin sacrificar calidad. No obstante, la documentación disponible es fundamentalmente un registro de desarrollo en curso, con estados de entrenamiento cambiantes y benchmarks aún pendientes de publicación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen 3.8, tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, 8 bits y 4 bits citados en la model card; GGUFs publicados en repositorio separado (incluye q4ks) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de 27,8 mil millones de parámetros que procesa entradas de imagen y texto. El ajuste se realiza con la técnica COLD FUSION, descrita por el autor como la combinación de su componente GAIN con los sistemas y entrenadores de Unsloth. La model card indica que se trata de un ajuste "muy ligero pero fuertemente focalizado", orientado a dos metas: aumentar la inteligencia general y recortar los tokens de razonamiento entre un factor de 2 y un factor de 10.

El entrenamiento se organiza en varias iteraciones ("cooks"): la versión 1 y la 1B, esta última seleccionada como ganadora tras las pruebas comparativas por mantener o superar el nivel de detalle de Qwen 3.8 incluso con esfuerzo de razonamiento "low". El autor menciona además que este trabajo es la antesala de una futura versión "Fable Fusion 711" sobre Qwen 3.8, con un pipeline de 6 etapas y múltiples subetapas que requiere entre 7 y 10 días de cómputo por limitaciones de hardware. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen 3.8.
- Procesamiento de imagen y texto (`image-text-to-text`), con soporte de entradas multimodales.
- Modos de razonamiento configurables (xhigh, medium, low) mediante plantillas Jinja, según se describe en la model card.
- Reducción de tokens de pensamiento de 1/10 a 1/2 respecto a los Qwen estándar, con mantenimiento del nivel de detalle declarado por el autor.
- Generación especulativa MTP (Multi-Token Prediction), con tasas de aceptación reportadas del 55,7 % y un récord del 59,9 %.
- Capacidades de código y matemáticas: no se detallan explícitamente en la información disponible, aunque el autor menciona variantes "CODER" en su ecosistema.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes conversacionales de atención al cliente: el modelo puede mantener diálogos multi-turno con entradas multimodales (por ejemplo, capturas o imágenes adjuntas por el usuario) y, gracias a la reducción de tokens de razonamiento, responder con menor latencia y coste por consulta que el Qwen 3.8 sin ajustar.
- Procesamiento de documentos con imágenes: al ser `image-text-to-text`, permite extraer y razonar sobre información de facturas, formularios o capturas, combinando la comprensión visual con la generación de texto estructurado.
- Despliegue en hardware de gama alta para consumo: con cuantización de 4 bits y MTP, el autor reporta 91 tokens/s en una RTX 5090, lo que lo hace viable para prototipos locales de asistentes multimodales.
- Generación de contenido técnico con razonamiento acotado: los modos "low" y "medium" permiten obtener respuestas detalladas sin la sobrecarga de tokens de pensamiento, útil en pipelines de resumen o redacción asistida donde el coste por token importa.
- Investigación sobre eficiencia de razonamiento: sirve como caso de estudio para medir el impacto de reducir thinking tokens en la calidad final, comparándolo con el Qwen 3.8 base en las mismas tareas.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors, puede emplearse como punto de partida para fine-tunes específicos de dominio (legal, sanitario, técnico) sin restricciones de licencia comercial.
- Evaluación comparativa de técnicas de entrenamiento: útil para equipos que quieran reproducir o contrastar el método COLD FUSION (GAIN + Unsloth) frente a ajustes convencionales.

## Benchmarks y rendimiento

La model card afirma que "Cook 1" superó los siete benchmarks principales de Qwen 3.8 y que se espera que "COOK 1B" iguale o mejore esos resultados, pero no se incluyen en la información disponible las tablas con cifras concretas (MMLU, HumanEval, GSM8K u otros). El único dato numérico de rendimiento publicado es de velocidad de inferencia:

| Metrica | Valor reportado |
|---|---|
| Throughput MTP (q4ks, sin imatrix, sin caché) | 91 tokens/s en RTX 5090 |
| Aceptación de tokens MTP | 55,7 % (récord: 59,9 %, 100 tokens/s) |
| Retención de rendimiento BF16 a 8 y 4 bits | ~99 % (según el autor) |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los 27,8 mil millones de parámetros requieren aproximadamente 55,6 GB (tamaño del repo); en 8 bits, en torno a 28 GB; en 4 bits, alrededor de 14-16 GB, aunque estas cifras son estimaciones a partir del tamaño y no aparecen publicadas de forma explícita.
- GPU recomendadas: el autor cita una RTX 5090 para las pruebas a 4 bits con MTP; para BF16 se necesitan GPU de 80 GB (A100, H100) o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 5090, entre otras), según las pruebas del autor.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama a través de los GGUF publicados en el repositorio separado; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: 91 tokens/s a 4 bits en RTX 5090 con MTP y sin caché; pico reportado de 100 tokens/s con 59,9 % de aceptación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-Cold-Fusion-GAIN-V1.1 | 27,8 B | no disponible | Apache 2.0 | Fine-tune con reducción de thinking tokens (1/10 a 1/2) |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | no disponible en la información | Modelo original sin ajuste; referencia de comparación del autor |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic | 27 B (aprox.) | no disponible | no disponible en la información | Ajuste previo del mismo autor, con más de 2300 likes y 4 millones de descargas |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | 27 B (aprox.) | no disponible | no disponible en la información | Variante del mismo autor orientada a código y máximo rendimiento |

Los datos de contexto y benchmarks de los modelos comparables no están disponibles en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y posicionamiento dentro del ecosistema del autor.

## Limitaciones y advertencias

- La model card es un registro de desarrollo en curso: el autor indica que quedan pruebas pendientes, benchmarks sin publicar y posibles reajustes en los niveles de detalle del razonamiento.
- El equilibrio entre reducción de tokens de pensamiento y mantenimiento del detalle no está confirmado; el propio autor señala que "puede necesitar un balanceo adicional".
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad o tasa de alucinación en la información disponible.
- Sesgos conocidos: no disponibles; al ser un fine-tune de Qwen 3.8, hereda los sesgos del modelo base, que no se detallan.
- Idiomas soportados: no se especifican, lo que dificulta planificar despliegues multilingües.
- Longitud de contexto: no disponible, un dato crítico para aplicaciones con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen 3.8 y de los datasets empleados en el ajuste.
- El rendimiento reportado (91-100 tokens/s) corresponde a una RTX 5090 con cuantización de 4 bits y MTP; en otros hardware o configuraciones las cifras pueden diferir notablemente.
- La documentación principal está en inglés y contiene afirmaciones de marketing ("exceeded all 7 core Qwen 3.8 benchmarks") sin tablas de resultados que las respalden en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-Cold-Fusion-GAIN-V1.1
- Repositorio GGUF y model card detallada: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Referencia del método COLD FUSION (Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0): https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Referencia del método COLD FUSION (Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF): https://huggingface.co/DavidAU/Qwen3.5-9B-Cold-Fusion-GAIN-v1.0-Uncensored-Heretic-NEO-MAX-Imatrix-GGUF
- Modelo predecesor destacado (Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Variante Qwen3.8 orientada a código (TURBO-Fable-Cold-Fusion-735-882): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
