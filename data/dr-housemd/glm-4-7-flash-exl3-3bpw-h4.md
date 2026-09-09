# dr-housemd/GLM-4.7-Flash-exl3-3bpw-H4

## Resumen

GLM-4.7-Flash es un modelo de lenguaje del equipo GLM (Z.ai) presentado en la card original como el modelo MoE más fuerte de su clase, 30B-A3B, orientado a razonamiento, generación de código y tareas agénticas. Este repositorio concreto es una cuantización EXL3 3bpw (variante H4) publicada por dr-housemd, cuyo objetivo es reducir el consumo de VRAM manteniendo las capacidades del modelo original. En la información de HuggingFace aparecen 6.435.534.528 parámetros en los safetensors, una cifra que no coincide con la card original de 30B-A3B; esta discrepancia se documenta en la ficha para evitar errores de interpretación.

El modelo destaca por su rendimiento en benchmarks de matemáticas, ciencia, código y uso de herramientas. Según los datos del autor, alcanza un 91,6 en AIME 25, un 75,2 en GPQA y un 59,2 en SWE-bench Verified, superando a Qwen3-30B-A3B-Thinking-2507 en varios escenarios. La cuantización EXL3 3bpw reduce el repositorio a 12,9 GB y permite desplegarlo en GPUs de consumo, aunque requiere un fork específico de exllamav3 con soporte para GLM-4.7-Flash.

La relevancia actual de este repositorio es doble: ofrece una vía de despliegue local con menor huella de memoria para un modelo con capacidades agénticas, y sirve como referencia para evaluar hasta qué punto una cuantización agresiva de tercera parte conserva las prestaciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en transformer; etiqueta glm4_moe_lite. Repositorio cuantizado en EXL3 3bpw H4 |
| Parametros totales | 6.435.534.528 (según safetensors del repositorio; la card original indica 30B-A3B) |
| Parametros activos | no disponible (la card original indica 3B activos) |
| Longitud de contexto | no disponible (max_new_tokens de 131072 en las evaluaciones del autor; no se especifica ventana de contexto) |
| Tipos de cuantizacion | EXL3 3bpw (variante H4) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, requiere exllamav3) |

## Arquitectura y entrenamiento

El modelo base, GLM-4.7-Flash, se describe en la card como una arquitectura MoE de la familia GLM-4.7, con etiqueta `glm4_moe_lite`. La card original indica un tamaño de 30B totales y 3B activos, una configuración pensada para equilibrar rendimiento y eficiencia en despliegue. Sin embargo, los safetensors de este repositorio suman 6.435.534.528 parámetros; esta diferencia puede deberse al formato de cuantización EXL3 o a una representación empaquetada de los pesos, pero no hay documentación que lo confirme.

No se han publicado en la información disponible datos sobre el dataset de entrenamiento, número de tokens ni procesos de RLHF o DPO. La card menciona que el modelo está concebido como un modelo base agéntico, de razonamiento y de código, y que admite decodificación especulativa en vLLM y SGLang mediante MTP y EAGLE respectivamente. También se documenta un modo de razonamiento preservado para tareas agénticas multi-turno, activable en la plataforma Z.ai.

## Capacidades

- Generación de texto en inglés y chino, con formato conversacional.
- Razonamiento matemático y científico, según los resultados en AIME 25 y GPQA.
- Generación y evaluación de código, respaldada por LCB v6 y SWE-bench Verified.
- Soporte de tool calling / function calling, con parsers `glm47` en vLLM y SGLang y `--enable-auto-tool-choice` en vLLM.
- Soporte de agentes y razonamiento multi-step, con rendimiento destacado en τ²-Bench y BrowseComp.
- Modo de razonamiento preservado para interacciones agénticas multi-turno, según la card del modelo.
- Generación larga, con configuraciones de hasta 131072 tokens nuevos en las evaluaciones del autor.
- Compatibilidad con frameworks de despliegue como vLLM y SGLang para servir el modelo original.

## Casos de uso

- Asistente de programación en el IDE: el modelo puede integrarse en entornos de desarrollo mediante vLLM o SGLang, y su puntuación de 59,2 en SWE-bench Verified sugiere capacidad para resolver bugs reales de repositorios. El soporte de tool calling permite conectarlo a ejecución de pruebas y análisis estático.
- Automatización de tareas agénticas: con un 79,5 en τ²-Bench, el modelo puede gestionar conversaciones multi-turno en las que llama a APIs externas, rellena formularios o consulta bases de datos. El modo de razonamiento preservado ayuda a mantener el hilo de decisión en tareas largas.
- Resolución de problemas matemáticos y científicos: gracias a un 91,6 en AIME 25 y un 75,2 en GPQA, puede usarse como helper de estudio o herramienta de apoyo en entornos académicos, siempre con validación humana.
- Atención al cliente bilingüe en inglés y chino: el modelo puede mantener conversaciones multi-turno y generar respuestas largas, mientras que el tool calling permite consultar sistemas de ticketing o CRM para dar respuestas basadas en datos reales.
- Investigación asistida con navegación web: su resultado de 42,8 en BrowseComp indica que puede combinar búsqueda, lectura de páginas y razonamiento para extraer información. La cuantización ligera permite ejecutarlo en estaciones de trabajo con GPU de consumo.
- Evaluación de código en CI/CD: con soporte de tool calling y una puntuación de 64,0 en LCB v6, puede integrarse en pipelines para revisar cambios, generar tests o analizar vulnerabilidades, especialmente en entornos donde se quiera desplegar en local con una GPU de 16-24 GB.

## Benchmarks y rendimiento

Los benchmarks publicados corresponden al modelo original GLM-4.7-Flash, no a esta cuantización concreta. No se han publicado resultados específicos para el repositorio EXL3 3bpw.

| Benchmark | GLM-4.7-Flash | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| AIME 25 | 91.6 | 85.0 | 91.7 |
| GPQA | 75.2 | 73.4 | 71.5 |
| LCB v6 | 64.0 | 66.0 | 61.0 |
| HLE | 14.4 | 9.8 | 10.9 |
| SWE-bench Verified | 59.2 | 22.0 | 34.0 |
| τ²-Bench | 79.5 | 49.0 | 47.7 |
| BrowseComp | 42.8 | 2.29 | 28.3 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 12,9 GB y el formato EXL3 3bpw apunta a un uso de VRAM cercano a 13-16 GB, incluyendo activaciones y memoria de trabajo. Esta cifra es una estimación, no una especificación oficial.
- GPU recomendada: RTX 4090 (24 GB) para trabajo con margen; A100 o H100 para entornos de producción con mayor concurrencia. No hay especificación oficial del autor.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más, como RTX 4080 y RTX 4090, aunque el rendimiento y la longitud de las respuestas dependen de la memoria disponible.
- Opciones de despliegue: para el modelo original, vLLM, SGLang y transformers con instalación desde git. Para esta cuantización, exllamav3 con el fork `glm47f-support` de `drhouse-md/exllamav3`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GLM-4.7-Flash (este repo) | 6.435.534.528 (safetensors); card original: 30B-A3B | no disponible | MIT (repo) | cuantización no oficial EXL3 |
| Qwen3-30B-A3B-Thinking-2507 | 30B-A3B (deducido del nombre) | no disponible | no disponible | modelo oficial en HuggingFace |
| GPT-OSS-20B | 20B (deducido del nombre) | no disponible | no disponible | modelo oficial en HuggingFace |

La comparación de rendimiento está en la tabla de benchmarks. GLM-4.7-Flash supera a Qwen3-30B-A3B-Thinking-2507 en GPQA, HLE, SWE-bench Verified, τ²-Bench y BrowseComp, mientras que Qwen3 queda por delante en LCB v6. GPT-OSS-20B es competitivo en AIME 25, pero queda por detrás en SWE-bench Verified y τ²-Bench.

## Limitaciones y advertencias

- La card original declara 30B-A3B, pero los safetensors de este repositorio suman 6.435.534.528 parámetros. Es necesario verificar el contenido antes de usar el modelo en producción.
- La cuantización es de un tercero (dr-housemd) y no está avalada por Z.ai. Puede haber pérdida de calidad respecto al modelo original, especialmente en tareas de razonamiento complejo.
- Esta cuantización requiere un fork personal de exllamav3 que aún no está integrado en la rama principal. La instalación y el mantenimiento dependen de un repositorio externo.
- Solo están documentados como idiomas soportados el inglés y el chino. El español no aparece en la card, por lo que la calidad en ese idioma no está garantizada.
- La ventana de contexto no se especifica en la información disponible. El valor de 131072 corresponde a `max_new_tokens` para evaluaciones, no a la longitud de contexto.
- No se han publicado análisis de sesgos, tasas de alucinación ni estudios de seguridad en la información suministrada.
- La licencia MIT del repositorio no implica necesariamente que los pesos originales, el framework exllamav3 o las dependencias compartan la misma licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dr-housemd/GLM-4.7-Flash-exl3-3bpw-H4
- Modelo original: https://huggingface.co/zai-org/GLM-4.7-Flash
- Blog técnico de GLM-4.7: https://z.ai/blog/glm-4.7
- Informe técnico (GLM-4.5): https://arxiv.org/abs/2508.06471
- Repositorio GitHub de GLM-4.5: https://github.com/zai-org/GLM-4.5
- Documentación de la API de Z.ai: https://docs.z.ai/guides/llm/glm-4.7
- Comunidad Discord: https://discord.gg/QR7SARHRxK
- Fork de exllamav3 con soporte GLM-4.7-Flash: https://github.com/drhouse-md/exllamav3.git (rama `glm47f-support`)
