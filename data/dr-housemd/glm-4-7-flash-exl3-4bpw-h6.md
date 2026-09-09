# dr-housemd/GLM-4.7-Flash-exl3-4bpw-H6

## Resumen

GLM-4.7-Flash es un modelo de lenguaje de gran tamaño desarrollado por el equipo GLM de Z.ai, disponible en inglés y chino. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.000 millones de parámetros totales y 3.000 millones de parámetros activos, lo que lo posiciona como una opción ligera para despliegue local que equilibra rendimiento y eficiencia. La versión presentada en este repositorio es una cuantización EXL3 a 4 bits por peso (4bpw) realizada por dr-housemd, con un tamaño de archivo de 16,6 GB y 8.293.512.896 parámetros en los tensores safetensors.

El modelo destaca en tareas de razonamiento matemático, generación de código, ejecución de agentes y búsqueda web, según los benchmarks publicados en su ficha técnica. La licencia MIT permite su uso comercial, y la existencia de una cuantización a 4 bits facilita la ejecución en hardware de consumo. Su relevancia actual radica en que ofrece un rendimiento comparable al de modelos como Qwen3-30B-A3B-Thinking-2507 o GPT-OSS-20B en varios dominios, con un coste de inferencia reducido al activar solo 3B de parámetros en cada paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), modelo 30B-A3B |
| Parametros totales | 30B (modelo original) / 8.293.512.896 en el repositorio cuantizado |
| Parametros activos | 3B (modelo original) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 4bpw (4 bits por peso) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, requiere exllamav3) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un MoE de 30.000 millones de parámetros con 3.000 millones activos, lo que significa que en cada token solo se computa una fracción de los pesos. El modelo original GLM-4.7-Flash es compatible con los frameworks vLLM y SGLang, tal como se indica en su documentación, y soporta decodificación especulativa: en vLLM mediante el método MTP (Multi-Token Prediction) y en SGLang mediante el algoritmo EAGLE con parámetros configurados en la línea de comandos. En la información disponible no se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación), por lo que no se puede describir ese aspecto con precisión. La cuantización presentada en este repositorio se ha generado con ExLlamaV3, una librería que requiere un fork específico para soportar la arquitectura GLM-4.7-Flash.

## Capacidades

- Razonamiento matemático y científico: alcanza 91,6 en AIME 25 y 75,2 en GPQA en los benchmarks del modelo original.
- Generación y comprensión de código: obtiene 64,0 en LCB v6 y 59,2 en SWE-bench Verified, lo que indica capacidad para resolver tareas reales de ingeniería de software.
- Ejecución de agentes: logra 79,5 en τ²-Bench y 42,8 en BrowseComp, mostrando habilidades para tareas multi-paso y navegación web.
- Soporte de tool calling: los comandos de despliegue incluyen `--tool-call-parser glm47`, lo que habilita la llamada a funciones.
- Soporte de razonamiento estructurado: se puede activar el modo thinking y usar el parser de razonamiento (`--reasoning-parser glm45`) en vLLM y SGLang.
- Multilingüismo: el modelo está declarado para inglés y chino, con capacidad de conversación en ambos idiomas.

## Casos de uso

- Asistente de programación integrado en un IDE: el modelo puede generar código, parches y refactors, y su puntuación en SWE-bench Verified sugiere que puede resolver issues reales de repositorios de software.
- Agente de atención al cliente multilingüe: con soporte de tool calling y conversación en inglés y chino, puede gestionar consultas, realizar llamadas a APIs y mantener turnos de diálogo contextual.
- Automatización de búsqueda web: gracias a su resultado en BrowseComp, puede navegar, recopilar y sintetizar información de sitios web de forma autónoma.
- Análisis de datos y razonamiento científico: su rendimiento en AIME 25 y GPQA lo hace adecuado para entornos de investigación donde se requiere resolver problemas matemáticos y técnicos.
- Despliegue de agentes en terminal: el modelo está preparado para tareas tipo Terminal Bench, donde debe ejecutar comandos, interpretar salidas y tomar decisiones en entornos Unix.
- Chatbot conversacional de bajo coste: al ser un MoE con solo 3B de parámetros activos, reduce el consumo de cómputo en inferencia, lo que resulta rentable para aplicaciones de atención al usuario o asistentes internos.

## Benchmarks y rendimiento

Los resultados de la tabla corresponden al modelo original GLM-4.7-Flash, no a la cuantización EXL3 de este repositorio.

| Benchmark | GLM-4.7-Flash | Qwen3-30B-A3B-Thinking-2507 | GPT-OSS-20B |
|---|---|---|---|
| AIME 25 | 91,6 | 85,0 | 91,7 |
| GPQA | 75,2 | 73,4 | 71,5 |
| LCB v6 | 64,0 | 66,0 | 61,0 |
| HLE | 14,4 | 9,8 | 10,9 |
| SWE-bench Verified | 59,2 | 22,0 | 34,0 |
| τ²-Bench | 79,5 | 49,0 | 47,7 |
| BrowseComp | 42,8 | 2,29 | 28,3 |

## Requisitos de hardware

- El repositorio ocupa 16,6 GB en disco.
- Al ser una cuantización EXL3 4bpw, el modelo debe cargarse con ExLlamaV3. El autor recomienda instalar un fork específico desde GitHub.
- No hay requisitos oficiales de VRAM publicados en la información disponible. El tamaño de disco de 16,6 GB da una referencia orientativa: una cuantización en este formato suele requerir menos VRAM que el modelo original en bfloat16.
- Para el modelo original sin cuantizar, los comandos de vLLM y SGLang incluyen `--tensor-parallel-size 4`, lo que sugiere una configuración multi-GPU para carga completa.
- Opciones de despliegue compatibles mencionadas: vLLM, SGLang, transformers. La cuantización EXL3 no es compatible con los pipelines estándar de Transformers sin el fork de exllamav3.

## Comparativa con modelos similares

El modelo se compara directamente en la ficha técnica original con Qwen3-30B-A3B-Thinking-2507 y GPT-OSS-20B. En los benchmarks disponibles, GLM-4.7-Flash supera a Qwen3-30B-A3B-Thinking-2507 en AIME 25, GPQA, HLE, SWE-bench Verified, τ²-Bench y BrowseComp, mientras que queda ligeramente por debajo en LCB v6. Frente a GPT-OSS-20B, obtiene resultados superiores en GPQA, HLE, SWE-bench Verified, τ²-Bench y BrowseComp, con una diferencia mínima en AIME 25. No se han publicado en la información disponible datos sobre la longitud de contexto, la licencia de los modelos comparados ni otra información adicional sobre disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La cuantización a 4 bits puede degradar ligeramente la calidad de salida en comparación con el modelo original en bfloat16.
- No se han documentado sesgos específicos, medidas de seguridad ni técnicas de alineación en la información disponible.
- La longitud de contexto no se especifica, por lo que su uso en conversaciones de muy largo alcance requiere validación previa.
- Al ser una cuantización de la comunidad, el soporte depende del autor del repositorio; además, se necesita un fork de exllamav3, lo que añade complejidad al despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dr-housemd/GLM-4.7-Flash-exl3-4bpw-H6
- Model card original: https://huggingface.co/zai-org/GLM-4.7-Flash
- Blog tecnico: https://z.ai/blog/glm-4.7
- Paper tecnico (GLM-4.5): https://arxiv.org/abs/2508.06471
- Repositorio GitHub: https://github.com/zai-org/GLM-4.5
- Documentacion API: https://docs.z.ai/guides/llm/glm-4.7
- Chat de acceso: https://chat.z.ai
- Fork de exllamav3 necesario: git+https://github.com/drhouse-md/exllamav3.git@glm47f-support
- Perfil del autor: https://huggingface.co/dr-housemd
