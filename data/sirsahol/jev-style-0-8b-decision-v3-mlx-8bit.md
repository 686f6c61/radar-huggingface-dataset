# SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-8bit

## Resumen

Jev-Style-0.8B-Decision-v3-mlx-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo chaoliangUNSW/Jev-Style-0.8B-Decision-v3, un modelo de decisión de 0,8B parámetros (752.393.024 parámetros reales en safetensors) perteneciente a la serie Jev-Style de TypeSafe AI. La conversión la publica el usuario SirSahOl y su objetivo es ejecutar inferencia nativa en la GPU de Apple Silicon (familias M1, M2, M3 y M4) con una huella de memoria de aproximadamente 990 MB.

A diferencia de un modelo conversacional al uso, Jev-Style se plantea como un modelo de "System One": lee un estado (state) una sola vez, en una única pasada, y devuelve una probabilidad calibrada para cada opción de cada pregunta que se le formula sobre ese estado. El resultado no es texto libre, sino una puntuación estructurada que permite clasificar, enrutar, priorizar o autorizar acciones dentro de un producto de software.

El interés de esta variante concreta es doble. Por un lado, rebaja el coste de despliegue hasta unos 900 MB de VRAM activa y ~855 MB en disco, lo que permite ejecutar el modelo en un Mac con 8 GB de memoria unificada. Por otro, el repositorio MLX de la familia reporta paridad de decisión con la precisión completa en 240 de 240 filas de paridad, lo que sugiere que la cuantización a 8 bits no altera la decisión final en el conjunto de evaluación empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only denso, familia Qwen3.5) |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens segun la ficha de la conversion; el modelo base declara entradas de hasta 25.600 tokens (discrepancia no resuelta en la informacion disponible) |
| Tipos de cuantizacion | 8-bit MLX (media de 8,25 bits por peso); existen variantes 4-bit y 16-bit del mismo autor y un GGUF Q4_K_M de 0,53 GB en la familia |
| Idiomas soportados | 19 idiomas declarados en los tags: en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 0,8 GB |
| Pipeline declarado | text-classification |
| Version de mlx-lm usada | 0.31.3 |
| Modelo base | chaoliangUNSW/Jev-Style-0.8B-Decision-v3 |
| Fecha de publicacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3.5 (clase Qwen3_5ForCausalLM, tag qwen3_5_text), con 752.393.024 parámetros. No se trata de un modelo MoE ni de una arquitectura híbrida SSM: es un transformer convencional adaptado a una tarea de decisión. La particularidad funcional es el paradigma "un estado, una pasada, todas las opciones puntuadas": el modelo recibe el estado de la aplicación y devuelve una probabilidad calibrada por cada opción de cada pregunta planteada, en lugar de generar una respuesta en lenguaje natural.

Sobre el entrenamiento no hay datos en la información proporcionada: se desconoce el número de tokens de entrenamiento, la composición del dataset, y si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. El elemento técnico destacable que sí aparece es la calibración de las probabilidades de salida y la prueba de paridad frente a precisión completa, que en los builds MLX de la familia se reporta como idéntica en 240 de 240 filas.

En cuanto a la conversión, se realizó con mlx-lm 0.31.3, con un tiempo de conversión de 4,76 segundos y un tamaño de salida de 782,1 MB. El resultado son pesos MLX en safetensors con una media de 8,25 bits por peso, es decir, una cuantización no uniforme que no equivale exactamente a 8 bits constantes.

## Capacidades

- Clasificación y decisión estructurada: devuelve una opción elegida, una puntuación o una probabilidad de sí/no sobre un estado dado, en lugar de texto libre.
- Puntuación calibrada por opción: asigna una probabilidad a cada alternativa de cada pregunta formulada sobre el mismo estado.
- Enrutado de LLM (llm-routing): permite decidir qué modelo o qué rama de un sistema debe atender una petición.
- Guardrails y comprobaciones de seguridad: evalúa si una acción es segura antes de ejecutarla o si conviene derivarla a revisión humana.
- Clasificación de tickets, urgencia y categorías dentro de flujos de producto.
- Capacidad multilingüe declarada sobre 19 idiomas, incluidos español, inglés, chino, árabe, hindi, japonés, coreano, portugués, ruso, tailandés, turco, urdu y vietnamita.
- Contexto largo declarado: la ficha de la conversión indica 262.144 tokens; el modelo base declara hasta 25.600 tokens de entrada.
- Ejecución on-device en Apple Silicon con MLX, con ~990 MB de VRAM activa.
- Generación de texto: los tags incluyen text-generation y la model card documenta uso mediante `mlx_lm.generate` y plantilla de chat, aunque el pipeline oficial declarado es text-classification.
- No hay información disponible sobre soporte de tool calling, function calling, uso de agentes, visión, audio o modo thinking.

## Casos de uso

- Enrutado de peticiones entre modelos: dado el estado de la aplicación y la consulta del usuario, el modelo devuelve la probabilidad de que cada modelo o rama del sistema sea la adecuada, lo que permite construir un router ligero que se ejecuta en el propio portátil sin coste de API.
- Guardrails previos a la ejecución de acciones: antes de que un agente ejecute una operación (borrar un recurso, enviar un correo, modificar producción), el modelo puntúa si la acción es segura o debe bloquearse, con una latencia de milisegundos.
- Clasificación y enrutado de tickets de soporte: lee el estado del ticket y decide categoría y cola de destino mediante clasificación multiopción, sin generar texto que haya que parsear después.
- Puntuación de urgencia o prioridad: asigna una probabilidad calibrada de urgencia a cada incidencia, lo que permite ordenar colas con umbrales explícitos en lugar de heurísticas manuales.
- Decisión de escalado a revisión humana: con la probabilidad de sí/no devuelta por el modelo se fija un umbral por encima del cual el caso se deriva a una persona, reduciendo el volumen de revisión manual.
- Validación de resultados generados por otro modelo: se usa como verificador System One que comprueba si la salida de un LLM grande es aceptable o si debe regenerarse.
- Procesamiento local con requisitos de privacidad: al ejecutarse en Apple Silicon con ~900 MB de memoria, permite clasificar datos sensibles de la aplicación sin enviarlos a un servicio externo.
- Clasificación multilingüe en producto: con 19 idiomas declarados, puede etiquetar entradas de usuarios internacionales con un único modelo en lugar de mantener clasificadores por idioma.
- Despliegue embebido en herramientas de desarrollo: integrado en IDE o CLI para decidir si una operación del flujo de trabajo requiere confirmación del desarrollador.

## Benchmarks y rendimiento

Rendimiento medido en la model card de la conversión (Apple M1, 8 GB de memoria unificada, media de 5 ejecuciones con 256 tokens máximos):

| Metrica | 8-bit MLX |
|---|---|
| Tokens por segundo | 52,23 |
| TTFT (tiempo hasta el primer token) | 19,15 ms |
| Memoria maxima | 919,3 MB |

Paridad declarada en los repositorios MLX de la familia Jev-Style-0.8B-Decision-v3:

| Prueba | Resultado |
|---|---|
| Filas de paridad con la misma decision que precision completa | 240 de 240 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni para este modelo ni para el modelo base.

## Requisitos de hardware

- VRAM/peso en memoria activa: ~990 MB segun la ficha; pico medido de 919,3 MB en las pruebas en M1.
- Memoria unificada mínima recomendada: 8 GB.
- Variante 4-bit: ~450 MB en disco y ~490 MB de VRAM, orientada a Macs de 8-16 GB que necesiten multitarea.
- Variante 16-bit: ~1620 MB en disco y ~1690 MB de VRAM, para equipos con 36-192 GB de memoria unificada.
- GPU soportadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) a través de MLX. Este repositorio no ofrece soporte para CUDA ni ROCm.
- Cabe en cualquier GPU de consumo de Apple, incluido el M1 base de 8 GB; también en GPUs de escritorio si se recurre a otras variantes del modelo (por ejemplo, el GGUF Q4_K_M de 0,53 GB).
- Opciones de despliegue: mlx-lm 0.31.3 o superior, LM Studio, Ollama (mediante Modelfile con los stop tokens configurados) y los repositorios MLX alternativos de la familia.
- Latencia y throughput estimados: 52,23 tokens/s y 19,15 ms de TTFT en Apple M1 con 8 GB; no hay mediciones publicadas para otros chips.
- Configuración obligatoria en el runtime: definir como stop tokens `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` para evitar bucles y turnos mal formados.
- Espacio en disco: 782,1 MB del artefacto generado, 0,8 GB de repositorio.

## Comparativa con modelos similares

Comparación dentro de la propia familia de builds de Jev-Style-0.8B-Decision-v3, único conjunto para el que hay datos en la información disponible:

| Modelo | Parametros | Cuantizacion | Tamano en disco | Huella de VRAM | Formato | Licencia |
|---|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 MLX 4-bit | 0,8B | 4-bit MLX | ~450 MB | ~490 MB | safetensors (MLX) | apache-2.0 |
| Jev-Style-0.8B-Decision-v3 MLX 8-bit (este) | 0,8B | 8-bit MLX (8,25 bits/peso) | ~855 MB | ~900 MB | safetensors (MLX) | apache-2.0 |
| Jev-Style-0.8B-Decision-v3 MLX 16-bit | 0,8B | Sin cuantizar | ~1620 MB | ~1690 MB | safetensors (MLX) | apache-2.0 |
| Jev-Style-0.8B-Decision-v3 GGUF Q4_K_M | 0,8B | 4-bit GGUF | 0,53 GB | No disponible | GGUF | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de contexto comparables con alternativas externas (por ejemplo, otros clasificadores o modelos pequeños de decisión) en la informacion proporcionada. La comparación con modelos de chat de tamaño similar no es pertinente porque el pipeline declarado es text-classification y el modo de salida es una puntuación estructurada, no texto generado.

## Limitaciones y advertencias

- No es un modelo conversacional al uso: su salida esperada es una decisión o probabilidad, por lo que el uso como chatbot puede producir respuestas poco alineadas y requerir configuración explícita de plantilla y stop tokens.
- Riesgo de alucinación y de calibración deficiente: la calibración de las probabilidades solo está verificada en el conjunto de paridad reportado (240 filas); no hay evaluación independiente de la fiabilidad de los umbrales en dominios nuevos.
- No hay datos publicados sobre sesgos demográficos, lingüísticos o de dominio.
- No hay evaluación por idioma: los 19 idiomas figuran únicamente en los tags, sin métricas que confirmen un rendimiento homogéneo entre ellos.
- Discrepancia de contexto: la ficha de la conversión declara 262.144 tokens mientras que la ficha del modelo base habla de entradas de hasta 25.600 tokens. Conviene verificar el valor real antes de dimensionar casos de uso con contexto largo.
- Formato atado a Apple Silicon: los pesos MLX no se ejecutan en GPUs NVIDIA o AMD; para esos entornos hay que usar otras variantes del modelo base.
- Licencia apache-2.0 en esta conversión, lo que permite uso comercial, pero el modelo base tiene su propia ficha y licencia que conviene revisar antes de un despliegue en producción.
- Trazabilidad limitada: la conversión la firma un tercero (SirSahOl) y no el autor del modelo base, y el repositorio cuenta con 0 descargas y 0 likes, por lo que no hay validación de la comunidad.
- La cuantización no es uniforme: la media de 8,25 bits por peso implica que algunas capas conservan más precisión que otras; el impacto por tarea no está documentado.
- La sección de reproducción de la model card está truncada, por lo que no se puede verificar el comando completo de conversión tal cual figura.
- En producción, cualquier umbral de decisión debe fijarse y monitorizarse explícitamente, ya que el modelo devuelve probabilidades y no etiquetas cerradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-8bit
- Modelo base (chaoliangUNSW): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Variante 4-bit: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-4bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Jev-Style-0.8B-Decision-v3-mlx-16bit
- Repositorio MLX de la familia en GitHub: https://github.com/lawrence3699/Jev-Style-0.8B-Decision-v3-MLX
- Builds MLX en HuggingFace (gahabeen): https://huggingface.co/gahabeen/Jev-Style-0.8B-Decision-v3-MLX
- Sitio del modelo Jev: https://jevmodel.org/
- Organización jev-ai en GitHub: https://github.com/jev-ai
- MLX (Apple): https://github.com/ml-explore/mlx
