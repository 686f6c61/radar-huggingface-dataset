# rmaapk/nexis4

## Resumen

NEXIS-4 es un repositorio publicado en Hugging Face por el usuario rmaapk (Muhammad Ali) que se presenta como la base de planificación textual y los materiales originales del proyecto musical NEXIS-4. No se trata de un modelo entrenado desde cero por el autor: el único artefacto de modelo incluido es una cuantización Q2_K del modelo Qwen2.5-0.5B-Instruct, empaquetada en formato GGUF y orientada a generar letras, secciones de canción y planificación de composición. El repositorio también contiene documentación sobre una política de voicebanks sintéticos para cuatro identidades vocales (SOLA, VEXA, LUMEN, KAIYA), aunque esas voces aún no están construidas.

El dato de parámetros reportado en safetensors (630.167.424) no coincide con el tamaño del modelo base citado (Qwen2.5-0.5B-Instruct, aproximadamente 0,5 mil millones de parámetros), lo que sugiere que el recuento corresponde a otros tensores del repositorio o a un agregado de artefactos, no a un modelo propio de 630 millones de parámetros. El tamaño total del repositorio es de 53,6 GB, muy superior al de una cuantización Q2_K de un modelo de 0,5B, lo que apunta a que la mayor parte del espacio lo ocupan materiales auxiliares (audio, datasets o pesos adicionales) no documentados en la model card.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no hay benchmarks, no hay datos de entrenamiento propios, no se declaran idiomas soportados y la licencia es mixta (BSL 1.1 para materiales originales, Apache-2.0 para el GGUF de Qwen). Se documenta aquí como referencia para quien encuentre el repositorio y necesite evaluar qué contiene realmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct; no se describe arquitectura propia) |
| Parametros totales | 630.167.424 según safetensors del repo; el modelo base citado (Qwen2.5-0.5B-Instruct) tiene ~0,5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada; el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32K, pero el autor no lo especifica) |
| Tipos de cuantizacion | Q2_K (GGUF) para el modelo de texto; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | BSL 1.1 para materiales originales de RMAA; Apache-2.0 para el GGUF de Qwen2.5-0.5B-Instruct |
| Formato de pesos | GGUF (qwen2.5-0.5b-instruct-q2_k.gguf); el repo también incluye safetensors según metadatos |

## Arquitectura y entrenamiento

El repositorio no describe ningún entrenamiento propio. El componente de modelo es una cuantización Q2_K del Qwen2.5-0.5B-Instruct original, un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros desarrollado por Alibaba Qwen y publicado bajo Apache-2.0. No se aportan datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica adicional por parte del autor del repositorio.

La parte original del proyecto es la planificación del proyecto musical NEXIS-4: estructura de canción objetivo (Intro → Verse 1 → Chorus 1 → Rap Verse → Chorus 2 → Verse 3 → Chorus 3 → Bridge → Outro), exclusión de guitarra en el arreglo por defecto y una política de voicebanks sintéticos para cuatro identidades vocales. Según la model card, los voicebanks y el renderizador de canto "aún están por construir", por lo que no existe un modelo de audio o de voz entrenado en este repositorio.

## Capacidades

- Generación de texto en inglés (idioma del modelo base Qwen2.5-0.5B-Instruct; el autor no declara otros idiomas).
- Planificación de composición: letras originales, secciones de canción y estructura de arreglos según la plantilla definida en la model card.
- Conversación multi-turno básica, heredada del ajuste instruct de Qwen2.5-0.5B-Instruct.
- No genera audio cantado: la model card indica explícitamente que es solo texto.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Generación de borradores de letras: usar el GGUF Q2_K para producir letras y secciones (verso, estribillo, puente) siguiendo la estructura objetivo del proyecto; adecuado por su bajo coste computacional y su ajuste instruct.
- Planificación de estructura de canciones: pedir al modelo esquemas de canción con la secuencia Intro → Verse 1 → Chorus 1 → Rap Verse → Chorus 2 → Verse 3 → Chorus 3 → Bridge → Outro y restricciones como la exclusión de guitarra.
- Prototipado rápido en local: al ser una cuantización Q2_K de 0,5B, puede ejecutarse en CPU o en GPU de gama baja para iterar sobre ideas sin infraestructura dedicada.
- Asistencia de escritura creativa: generación de variantes de estribillos o versos de rap a partir de un tema dado, con la salvedad de que el modelo base es pequeño y su calidad creativa es limitada.
- Base para pipelines de letras en proyectos musicales independientes: integrar el GGUF en un script que produzca texto que luego se procese con otras herramientas (por ejemplo, un renderizador de voz futuro), aunque ese renderizador no existe aún en el repositorio.
- Evaluación y auditoría de repositorios: usar este caso como ejemplo de repositorio con licencia mixta y artefactos no documentados, útil para equipos que revisan procedencia y licencias antes de adoptar modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: una cuantización Q2_K de un modelo de ~0,5B ocupa del orden de 300-400 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha hardware de gama alta.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NEXIS-4 (este repo) | ~0,5B (Qwen2.5-0.5B-Instruct Q2_K) | no disponible | BSL 1.1 + Apache-2.0 | Hugging Face (rmaapk/nexis4) | Repositorio de proyecto musical, no modelo propio |
| Qwen2.5-0.5B-Instruct | ~0,5B | hasta 32K (según documentación upstream) | Apache-2.0 | Hugging Face (Qwen) | Modelo base original, sin cuantizar |
| Qwen2.5-1.5B-Instruct | ~1,5B | hasta 32K (según documentación upstream) | Apache-2.0 | Hugging Face (Qwen) | Alternativa de mayor tamaño y calidad |
| SmolLM2-360M-Instruct | ~0,36B | no disponible en esta ficha | Apache-2.0 | Hugging Face (HuggingFaceTB) | Alternativa pequeña para texto |

La comparativa se limita a modelos de la misma escala; no se dispone de datos de rendimiento del repositorio NEXIS-4 para comparar calidad.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado por el autor: es una cuantización Q2_K de Qwen2.5-0.5B-Instruct, con la calidad limitada de un modelo de 0,5B y de una cuantización agresiva de 2 bits.
- El recuento de parámetros en safetensors (630.167.424) no coincide con el modelo base citado; conviene verificar qué tensores componen ese total antes de confiar en él.
- El tamaño del repositorio (53,6 GB) es desproporcionado para el modelo de texto declarado; parte del contenido no está documentado en la model card.
- No se declaran idiomas soportados; el modelo base está orientado principalmente al inglés.
- Riesgo de alucinación inherente a un modelo de 0,5B, especialmente en tareas de planificación compleja o generación de letras extensas.
- Licencia mixta: los materiales originales de RMAA están bajo BSL 1.1, que restringe el uso comercial hasta que cambie a licencia abierta según sus términos; el GGUF de Qwen queda bajo Apache-2.0. Es necesario revisar `LICENSE` y `MODEL_LICENSES.md` antes de cualquier uso en producción.
- La política de voicebanks sintéticos es una declaración de intenciones: las voces SOLA, VEXA, LUMEN y KAIYA no existen todavía en el repositorio.
- No hay benchmarks, demos ni métricas de calidad publicadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rmaapk/nexis4
- Perfil del autor: https://huggingface.co/rmaapk
- Dataset del autor: https://huggingface.co/datasets/rmaapk/vector
- Modelo base citado (Qwen2.5-0.5B-Instruct-GGUF): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF
- DOI del repositorio: doi:10.57967/hf/11502
