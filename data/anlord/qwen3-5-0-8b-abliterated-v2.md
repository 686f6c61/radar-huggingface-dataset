# anlord/Qwen3.5-0.8B-Abliterated-V2

## Resumen

Qwen3.5-0.8B-Abliterated-V2 es una variante "abliterated" del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario anlord en Hugging Face. No es un modelo entrenado desde cero: es el resultado de aplicar una modificación de pesos sobre el modelo base con la herramienta AnlordAbliterator 1.3.0, cuyo objetivo es eliminar la dirección de rechazo aprendida durante el alineamiento, de modo que el modelo deje de negarse a responder a determinadas peticiones. El resultado declarado por el autor es una caída de la tasa de rechazo de 97/100 a 2/100 sobre su propio conjunto de evaluación, con una divergencia KL de 0,0453 respecto al modelo original.

El modelo tiene 852.985.920 parámetros (unos 0,85 B), se distribuye en formato safetensors para Transformers y existe un repositorio hermano con cuantizaciones GGUF (de BF16 a Q4_0). La licencia es Apache-2.0, heredada del modelo base. El repositorio ocupa 1,7 GB.

Su relevancia es doble. Por un lado, interesa a quienes investigan alineamiento y seguridad, porque permite medir experimentalmente qué se gana y qué se pierde al eliminar los rechazos en un modelo pequeño. Por otro, por su tamaño reducido, es un candidato para inferencia local en CPU, portátiles o GPUs de gama baja. Conviene señalar que el repositorio no tiene descargas ni "likes" y que no se han publicado benchmarks estándar, por lo que su calidad real no está validada por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer, derivada de Qwen/Qwen3.5-0.8B; los detalles concretos de la arquitectura del modelo base no están disponibles en la información proporcionada |
| Parámetros totales | 852.985.920 (~0,85 B), dato real de los safetensors |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Safetensors en precisión completa (repositorio de 1,7 GB); GGUF en BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M y Q4_0 en el repositorio anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (Transformers); GGUF en repositorio aparte |
| Pipeline declarado | text-generation; los tags incluyen además image-text-to-text y conversational |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Fecha de publicación | 25 de septiembre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto. El proceso aplicado es una abliteración, una intervención sobre los pesos de un modelo ya entrenado que proyecta fuera las direcciones asociadas a la conducta de rechazo. Según la model card, se aplicó con el pipeline por defecto de AnlordAbliterator 1.3.0 sobre Qwen/Qwen3.5-0.8B, con `direction_scope: global` y `direction_index: 11.749`, y afecta tanto a las proyecciones de salida de atención como a las proyecciones descendentes del MLP.

Los parámetros declarados de la ablación son: en `attn.o_proj`, peso máximo 1.361 a la posición 14.650, y peso mínimo 1.159 a distancia 12.742; en `mlp.down_proj`, peso máximo 1.318 a la posición 21.114, y peso mínimo 0.941 a distancia 11.458. El repositorio incluye una carpeta `reproduce/` con la configuración fijada, los parámetros completos, sumas de comprobación SHA-256 y el diario completo del estudio de Optuna, de modo que la ablación puede replicarse y verificarse con el comando `AnlordAbliterator --reproduce anlord/Qwen3.5-0.8B-Abliterated-V2`.

El impacto medido por el propio autor es una reducción de rechazos de 97/100 a 2/100 y una divergencia KL de 0,0453 frente al modelo base. No se documentan datos de preentrenamiento, composición del dataset, número de tokens, ni etapas de RLHF o DPO, porque no se han realizado sobre esta variante.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es text-generation y los tags incluyen conversational.
- Respuesta con rechazos muy reducidos: 2/100 en el conjunto de evaluación del autor, frente a 97/100 del modelo base.
- Posible entrada multimodal: los tags del repositorio incluyen image-text-to-text y el ejemplo oficial de uso emplea `AutoProcessor` y `AutoModelForImageTextToText`, lo que apunta a soporte de imagen junto a texto. La model card no detalla el alcance real de esta capacidad, por lo que debe verificarse antes de depender de ella.
- Compatibilidad con el ecosistema Transformers en formato safetensors, y con inferencia GGUF mediante los cuantizados del repositorio hermano.
- El tag `endpoints_compatible` sugiere compatibilidad con despliegues tipo endpoint gestionado.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Razonamiento matemático, generación de código, visión detallada, audio o modo "thinking": no disponible.

## Casos de uso

- Red teaming y evaluación de seguridad: al reducir los rechazos a 2/100, sirve como banco de pruebas para estudiar qué categorías de peticiones problemáticas deja pasar un modelo pequeño sin alineamiento. Se usaría en pipelines automatizados de generación de prompts adversarios y clasificación posterior de las respuestas.
- Investigación sobre abliteración y alineamiento: la carpeta `reproduce/` y las métricas de divergencia KL permiten reproducir el experimento y cuantificar cuánto se degrada la distribución de salida al eliminar la dirección de rechazo. Es un caso de uso metodológico, no de producto.
- Inferencia local en hardware modesto: con 852.985.920 parámetros y cuantizaciones GGUF desde Q4_0, cabe en CPU y en GPUs integradas, lo que permite asistentes de texto offline en portátiles o mini-PCs sin GPU dedicada.
- Generación de texto creativo y de ficción sin restricciones temáticas: narrativa, guiones o diálogos con contenido sensible que el modelo base rechazaría. Adecuado por el comportamiento abliterado, no por su calidad literaria, que no está documentada.
- Fine-tuning específico de dominio: al ser un modelo de 0,85 B, un ajuste con LoRA sobre un dominio concreto (soporte técnico, transcripción de jerga interna, clasificación) es viable en una sola GPU de consumo. Se usaría como punto de partida barato antes de escalar a modelos mayores.
- Generación de datos sintéticos a gran escala: por su bajo coste por token permite producir volúmenes grandes de texto para preentrenar clasificadores o para aumentar datasets. Requiere filtrado posterior, dado el riesgo de errores factuales propio de este tamaño.
- Prototipado de pipelines imagen-texto: si la capacidad multimodal declarada en los tags se confirma, serviría para prototipos rápidos de descripción de imágenes o extracción de información de capturas, con validación humana obligatoria.
- Aplicaciones conversacionales con requisito de privacidad: al poder ejecutarse íntegramente en local sin enviar datos a un proveedor externo, encaja en escenarios donde el texto del usuario no puede salir de la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son las del pipeline de evaluación de la abliteración del propio autor:

| Métrica | Antes (Qwen3.5-0.8B) | Después (abliterado) |
|---|---|---|
| Rechazos (sobre 100 prompts) | 97 / 100 | 2 / 100 |
| Divergencia KL | 0 | 0,0453 |

Estas cifras proceden de la herramienta AnlordAbliterator y, tal como advierte el propio autor, deben tratarse como resultados de una evaluación concreta y no como una garantía de comportamiento en cualquier prompt.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros real (852.985.920) y de los formatos disponibles; el autor no publica requisitos oficiales.

- Pesos en BF16: aproximadamente 1,7 GB (coincide con el tamaño del repositorio). Con caché KV y activaciones, el consumo típico ronda los 2,5 a 3 GB de VRAM.
- Pesos en FP32: aproximadamente 3,4 GB.
- Cuantización Q8_0: aproximadamente 0,9 GB; Q6_K en torno a 0,7 GB; Q5_K_M alrededor de 0,6 GB; Q4_K_M y Q4_0 en torno a 0,5 GB.
- Cabe en cualquier GPU de consumo actual: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs con 4 GB de VRAM usando cuantizaciones Q4. También es viable en CPU, con rendimiento dependiente del número de núcleos, y en Apple Silicon mediante Metal.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText` y `AutoProcessor`), llama.cpp y Ollama a través de los GGUF del repositorio hermano, vLLM o TGI aprovechando el tag `endpoints_compatible`.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (100 prompts) | Divergencia KL | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | 97 / 100 | 0 (referencia) | Apache-2.0 | Safetensors | Público en Hugging Face |
| anlord/Qwen3.5-0.8B-Abliterated-V2 (este modelo) | 852.985.920 | No disponible | 2 / 100 | 0,0453 | Apache-2.0 | Safetensors | 0 descargas, 0 likes |
| anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2 | Mismos pesos cuantizados | No disponible | No disponible | No disponible | Apache-2.0 | GGUF (BF16 a Q4_0) | Público en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de otras familias del mismo rango de tamaño (por ejemplo, modelos de 0,5 a 1 B de otros desarrolladores), por lo que esa comparación queda como no disponible.

## Limitaciones y advertencias

- La abliteración no solo elimina los rechazos: altera la distribución de salidas de forma medible (divergencia KL de 0,0453), por lo que puede degradar la coherencia, la precisión o el estilo en tareas que nada tienen que ver con la seguridad. El propio autor lo advierte.
- Con 852.985.920 parámetros, la capacidad de razonamiento, el conocimiento factual y la fidelidad en tareas complejas son limitados, y el riesgo de alucinación es alto en comparación con modelos de mayor tamaño.
- No hay datos de benchmarks estándar, ni comparación con el modelo base en tareas de calidad, por lo que no puede afirmarse que rinda igual que Qwen3.5-0.8B.
- No hay información sobre idiomas soportados ni sobre la longitud de contexto, dos datos críticos para planificar un despliegue.
- La capacidad multimodal es incierta: aparece en los tags y en el ejemplo de código, pero no se detalla en la model card.
- El repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad ni issues que documenten problemas conocidos.
- La licencia Apache-2.0 permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución. Al ser un derivado, conviene revisar también los términos del modelo base Qwen/Qwen3.5-0.8B.
- Al eliminar la conducta de rechazo, el modelo puede generar contenido dañino, ilegal o inapropiado. La responsabilidad de filtrar la salida y de cumplir la normativa aplicable (por ejemplo, obligaciones de transparencia para sistemas de IA en la UE) recae en quien lo despliega. No es apto para aplicaciones de cara al usuario sin una capa de moderación.
- Las métricas de rechazo y divergencia KL provienen del pipeline del autor y no son garantía de comportamiento frente a prompts fuera de ese conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-V2
- Versiones GGUF: https://huggingface.co/anlord/Qwen3.5-0.8B-Abliterated-GGUF-V2
- Herramienta de abliteración (AnlordAbliterator 1.3.0): https://github.com/justbedwarsplay/AnlordAbliterator
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas de Google Maps y no guardan relación con el contenido de esta ficha.
