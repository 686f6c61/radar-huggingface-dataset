# Devilishcode/deadbug-brain-qwen2.5-1.5b

## Resumen

Deadbug Brain — Qwen2.5-1.5B es un repositorio reservado por Deadbug Labs para alojar su modelo "house" (por defecto) de la línea IMP, orientado a tareas de asistencia conversacional, interpretación de salidas de herramientas y narración de detecciones dentro del ecosistema IMP-VISION. El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen, y se distribuye bajo licencia Apache-2.0.

En el momento de redactar esta ficha, el autor declara explícitamente que el modelo **no ha sido entrenado todavía**: no hay pesos publicados, no existen resultados de benchmarks y el repositorio solo contiene la model card con el plan de construcción. El pipeline de Hugging Face figura como no disponible, el repositorio acumula 0 descargas y 0 likes, y la fecha de creación registrada es 2026-11-20.

La relevancia actual es, por tanto, la de un artefacto planificado más que la de un modelo utilizable en producción. Su interés radica en documentar la estrategia de ajuste (LoRA r16 fusionado a GGUF Q4_K_M, ~1,1 GB, servido con llama.cpp) y el conjunto de puertas de evaluación que el autor exige antes de publicar pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parámetros totales | 1.500 millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | GGUF Q4_K_M planificado (~1,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos no publicados todavía |

## Arquitectura y entrenamiento

El modelo se plantea como un fine-tune del Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El método previsto es LoRA con rango 16, posteriormente fusionado en los pesos base y convertido a GGUF Q4_K_M para su servicio con llama.cpp. No se documentan innovaciones arquitectónicas propias: la arquitectura es la del modelo base y el valor añadido reside en el ajuste.

El dataset planificado para la versión 1 se limita a 1.500 pares de instrucción, con semilla humana prioritaria y un máximo del 50 % de datos sintéticos. La composición cubre el registro del toolkit IMP, los flujos "Ask" de las gafas y ayuda hardware en lenguaje llano. El autor condiciona la publicación a superar cinco puertas de evaluación: precisión en tarea, registro, integridad de rechazos, regresión frente al modelo base y latencia en dispositivo en un teléfono de gama media. No se especifican número de tokens de entrenamiento, composición detallada del corpus ni si habrá RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Interpretación de salidas de herramientas de un dispositivo IMP emparejado (rol declarado en la model card).
- Narración de detecciones producidas por el pipeline de visión IMP-VISION.
- Respuesta a flujos "Ask" dentro de la aplicación de las gafas.
- Ayuda hardware en lenguaje llano.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no se confirma para este fine-tune).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio nativos: no disponible.

## Casos de uso

- Asistente conversacional embebido en las gafas IMP-VISION: el modelo actuaría como "Brain" por defecto del selector, gestionando los flujos "Ask" con el registro específico del producto y un tamaño de ~1,1 GB en Q4_K_M que permite ejecución local.
- Interpretación de salidas de herramientas del dispositivo: traduciría la salida estructurada de las herramientas del IMP emparejado a lenguaje natural comprensible para el usuario final.
- Narración de detecciones de visión: convertiría las detecciones del pipeline IMP-VISION en descripciones habladas o textuales para el usuario.
- Soporte técnico de hardware en lenguaje llano: el dataset planificado incluye ayuda hardware, lo que lo orienta a resolver dudas de configuración y uso de dispositivos.
- Despliegue en dispositivo de gama media: el plan exige medir latencia en un teléfono de gama media como puerta de calidad, lo que lo posiciona para inferencia local sin GPU dedicada.
- Base para experimentación con fine-tunes pequeños: al ser un LoRA r16 sobre un modelo de 1,5 B con licencia Apache-2.0, sirve como plantilla reproducible para ajustes de dominio con presupuestos de datos reducidos (1.500 pares).
- Filtro de rechazos en asistentes de producto: la puerta de "refusal-integrity" sugiere uso en escenarios donde el asistente debe declinar peticiones fuera de alcance de forma consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existen números de benchmark y que, cuando los haya, se medirán con su propio arnés de evaluación y se publicarán junto con la ejecución que los produjo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1,5 B en Q4_K_M (~1,1 GB de pesos) el requisito típico ronda 2-3 GB contando overhead de contexto, pero es una estimación, no un dato del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por tamaño, un modelo de 1,5 B cuantizado a Q4_K_M es compatible con GPU de consumo de gama media-baja, pero no se aporta validación.
- Opciones de despliegue: llama.cpp (método declarado por el autor). Otras opciones (vLLM, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible; el autor prevé medir latencia en un teléfono de gama media como puerta de evaluación, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| Deadbug Brain — Qwen2.5-1.5B | 1,5 B (base) | no disponible | Apache-2.0 | No publicados | Fine-tune planificado, sin entrenar |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en esta ficha | Apache-2.0 | Públicos | Modelo base del que parte este fine-tune |
| Alternativas de 1-2 B de la familia Llama o Gemma | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la información recibida |

No se dispone de datos de rendimiento del modelo para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo no está entrenado ni publicado: el repositorio no contiene pesos utilizables.
- No existen benchmarks ni evaluaciones publicadas; cualquier afirmación de rendimiento sería especulativa.
- Idioma limitado a inglés según la etiqueta del repositorio; no se declara soporte de castellano.
- El dataset planificado es muy reducido (1.500 pares), lo que limita la cobertura y aumenta el riesgo de sobreajuste al registro del producto.
- Riesgo de alucinación: no evaluado; el autor prevé una puerta de "refusal-integrity" precisamente para mitigar respuestas indebidas.
- Sesgos conocidos: no documentados.
- Licencia Apache-2.0 permite uso comercial, pero al no haber pesos publicados no puede ejercerse todavía.
- El modelo está diseñado como opción por defecto de un producto concreto (IMP-VISION), no como modelo generalista; su utilidad fuera de ese ecosistema es incierta.
- La fecha de creación del repositorio (2026-11-20) y la ausencia de descargas o interacciones sugieren un proyecto en fase muy temprana.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Devilishcode/deadbug-brain-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor en Hugging Face: https://huggingface.co/Devilishcode
- Sitio de Deadbug Labs: https://deadbuglabs.github.io/
- GitHub de Deadbug Labs: https://github.com/deadbuglabs
- Facebook de Deadbug Labs: https://www.facebook.com/profile.php?id=61591927232914
