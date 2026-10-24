# ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final

## Resumen

Wicked-Stuff-26B-A4B-v2.0-Final es un ajuste fino (finetune) de generación de texto publicado por el usuario ReadyArt sobre el modelo SubMaroon/Kitchoon-V3-26B-A4B. Con 25.805.933.872 parámetros almacenados en safetensors (≈25,8 B), está orientado explícitamente a rol conversacional para adultos: la model card lo etiqueta como nsfw, explicit, ERP, unaligned, horror y violence, y el repositorio está marcado como not-for-all-audiences. No es un modelo de propósito general, sino una variante de rol sin alineación de seguridad declarada.

La nomenclatura "26B-A4B" y la etiqueta gemma4 sugieren una arquitectura de mezcla de expertos (MoE) con del orden de 4 B de parámetros activos por token, aunque la información disponible no confirma ni el número exacto de activos ni la longitud de contexto. El modelo base pertenece a la familia de finetunes de rol Kitchoon, de la que tampoco se publican detalles técnicos en la información consultada.

Su relevancia es acotada: se trata de un modelo de nicho con 27 descargas y 2 likes en el momento de la consulta, sin benchmarks publicados, y cuya model card contiene principalmente CSS/HTML decorativo en lugar de documentación técnica. Resulta útil únicamente como pieza para experimentación en narrativa interactiva para adultos o para investigación sobre salvaguardas y modelos sin alinear.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; la etiqueta `gemma4` y el sufijo `A4B` apuntan a una arquitectura tipo Gemma con mezcla de expertos (MoE) |
| Parametros totales | 25.805.933.872 (≈25,8 B), según safetensors |
| Parametros activos | No disponible (la nomenclatura `A4B` sugiere ≈4 B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Repositorio GGUF separado (`ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF`); los niveles concretos no están detallados en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio principal, 51,6 GB, compatible con bf16/fp16) y GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: `gemma4` como familia de referencia y `A4B` en el nombre, patrón habitual para indicar mezcla de expertos con aproximadamente 4 B de parámetros activos. El modelo es un finetune declarado (`base_model_relation: finetune`) de SubMaroon/Kitchoon-V3-26B-A4B, que a su vez no documenta en la información consultada su composición de dataset ni su receta de entrenamiento.

No se han publicado datos sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO o técnicas diferenciales (decodificación especulativa, atención lineal, etc.). La etiqueta `unaligned` indica que el ajuste elimina o reduce deliberadamente los mecanismos de rechazo del modelo base, algo coherente con el resto de etiquetas (nsfw, explicit, ERP, violence, Horror). Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés con foco en rol multi-turno y mantenimiento de personaje.
- Contenido narrativo explícito para adultos (ERP), incluyendo descripciones sexuales y eróticas.
- Ficción de terror y violencia explícita, según las etiquetas `Horror` y `Violence`.
- Formato instruct/conversacional (`conversational`, `instruct`), apto para plantillas de chat.
- Comportamiento "unaligned": ausencia declarada de rechazos ante peticiones que los modelos alineados bloquearían.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no, únicamente inglés.
- Capacidades de visión o audio: no disponibles (pipeline `text-generation`).

## Casos de uso

- Rol conversacional para adultos: el modelo mantiene personajes y escenas multi-turno en inglés, con contenido explícito, para plataformas de roleplay privadas o prototipos de aplicaciones de ficción interactiva.
- Escritura de narrativa erótica: generación y continuación de relatos explícitos con control de tono y perspectiva, aprovechando el ajuste específico sobre este dominio frente a modelos alineados que rechazan la tarea.
- Ficción de terror y gore: generación de escenas de horror explícito y descripciones violentas para guiones de videojuegos o relatos, un caso donde los modelos con filtros suelen negarse.
- Diseño de personajes para videojuegos o novelas visuales: generar diálogos y hojas de personaje con arcos narrativos, siempre que el producto final sea en inglés.
- Investigación sobre alineación y salvaguardas: servir como contrapunto "unaligned" para evaluar la eficacia de clasificadores de contenido, filtros de salida y políticas de moderación en pipelines propios.
- Red teaming de moderación: probar sistemas de detección de contenido dañino generando cargas adversariales controladas en un entorno autorizado.
- Generación de datos sintéticos para clasificadores de contenido adulto: producir ejemplos etiquetados de texto explícito o violento para entrenar modelos de moderación, con las precauciones legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas de rol (por ejemplo, comparativas tipo EQ-Bench o evaluaciones de calidad narrativa).

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ≈51,6 GB solo de pesos (el tamaño del repositorio coincide con 2 bytes por parámetro), más KV cache; en la práctica requiere 60-80 GB de VRAM.
- GPU de datacenter: A100 80 GB, H100 80 GB o H200 en una sola tarjeta; en configuraciones de 40-48 GB (A100 40 GB, L40S, RTX 6000 Ada) haría falta reparto entre varias GPU o cuantización.
- Cuantización de 8 bits: pesos ≈26-28 GB, viable en 2× RTX 4090 (24 GB cada una) o en una RTX 6000 Ada / L40S de 48 GB.
- Cuantización de 4 bits (Q4_K_M y similares): pesos ≈15-17 GB, cabe en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB, con margen limitado para contexto.
- Al ser presumiblemente MoE con ≈4 B activos, la velocidad de decodificación en CPU/llama.cpp debería ser notablemente superior a la de un modelo denso de 26 B, aunque no hay cifras de throughput publicadas.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) mediante los GGUF publicados; vLLM o TGI con los safetensors si la arquitectura está soportada por la librería, algo no confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.0-Final | 25,8 B totales (≈4 B activos, sin confirmar) | No disponible | Apache 2.0 | Inglés | No publicados | safetensors + GGUF, 27 descargas |
| SubMaroon/Kitchoon-V3-26B-A4B (modelo base) | 26 B por nomenclatura, no verificado | No disponible | No disponible en la información consultada | No disponible | No publicados | HuggingFace |
| Otros finetunes de rol explícito de tamaño 24-32 B | No disponible | No disponible | No disponible | No disponible | No publicados | No disponible |

No se han identificado en la información disponible alternativas comparables con datos verificables de rendimiento; la comparación se limita al modelo base y a la categoría genérica de finetunes de rol para adultos.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado `not-for-all-audiences` y las etiquetas incluyen nsfw, explicit, ERP, Erotic, Violence y Horror; no es apto para productos dirigidos al público general ni para entornos laborales sin controles.
- Modelo declarado `unaligned`: no incorpora salvaguardas de rechazo, por lo que puede generar contenido sexual explícito, violento o potencialmente dañino sin filtros. La responsabilidad legal y ética del uso recae por completo en el desplegador.
- Riesgo de contenido ilegal: al no existir alineación, es imprescindible implementar moderación externa para bloquear contenido prohibido por ley (en España y la UE, material de abuso infantil, apología de la violencia, etc.).
- Idiomas: solo inglés; cualquier uso en castellano degradará la calidad y no está soportado por el autor.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas o documentos extensos sin probarlo empíricamente.
- Alucinación: previsible en un finetune orientado a ficción, sin datos de evaluación que la cuantifiquen; no es fiable para tareas factuales.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no exime del cumplimiento de la legislación sobre contenido ni de las políticas de las plataformas de distribución.
- Documentación muy deficiente: la model card consiste mayoritariamente en CSS/HTML decorativo, sin detalles de entrenamiento, plantilla de prompt ni parámetros de generación recomendados.
- Validación comunitaria mínima: 27 descargas y 2 likes en el momento de la consulta; no hay evidencia de calidad contrastada por terceros.
- Fecha de creación del repositorio (2026-10-23) y del modelo base no verificable en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final
- Repositorio GGUF: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF/tree/main
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V3-26B-A4B
- Listado de modelos sin censura para security research: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Calculadora de requisitos de VRAM: https://www.canirun.ai/
- Leaderboard de modelos sin restricciones: https://unrestricted.ai/
