# ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw

## Resumen

Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw es un empaquetado cuantizado del checkpoint Qwen/Qwen3.8-Flash-Next, publicado por el usuario ddalcu para mlx-serve, el motor de inferencia basado en MLX para Apple Silicon. No es un modelo entrenado desde cero: es una conversión de pesos a 3,3 bits por peso (bpw) con calibración imatrix, pensada para que la vista previa de la arquitectura Qwen4 (model_type: qwen4_exp) quepa en un Mac de 64 GB con 64.000 tokens de contexto.

El modelo base combina un tronco GDN más mezcla de expertos (MoE) con tres elementos distintivos: flujos residuales con puertas (4 flujos de 2.560 dimensiones), una tabla de embedding de n-gramas de 51.000 millones de parámetros indexada por bigramas y trigramas con hash, y Qwen Sparse Attention, que a partir de 2.048 tokens solo lee los 512 bloques de 4 tokens más relevantes por consulta, manteniendo el coste de atención plano con el contexto. El contexto nativo es de 262.144 tokens.

El pack ocupa 52 GB residentes, 86,3 GB de repositorio y declara 98.382.839.699 parámetros en los shards safetensors (la model card describe el checkpoint original como 125 B de tronco + 51 B de n-gramas + 4 B de cabeza MTP = 180 B y 360 GB en bf16). Incluye la torre de visión para imagen y vídeo y la cabeza MTP de decodificación especulativa. Su relevancia ahora es doble: permite ejecutar localmente una arquitectura MoE de gran tamaño en hardware de consumo Apple, y sirve como material de estudio de la arquitectura qwen4_exp antes de su publicación estable. La licencia es qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) sobre tronco GDN; atención dispersa (Qwen Sparse Attention), flujos residuales con puertas (4 x 2560) y embedding de n-gramas; model_type: qwen4_exp |
| Parametros totales | 98.382.839.699 (~98,4 B) medidos en los safetensors del repositorio. La model card indica que el checkpoint original consta de 125 B de tronco + 51 B de tabla de n-gramas + 4 B de cabeza MTP = 180 B (360 GB en bf16); la tabla de n-gramas no está en los shards safetensors |
| Parametros activos | no disponible (hay 512 expertos enrutados por capa en 48 capas, 121 B en total, pero no se indica cuántos se activan por token) |
| Longitud de contexto | 262.144 tokens nativos; el pack se sirve con 65.536 tokens (--ctx-size 65536) |
| Tipos de cuantizacion | iQ-MLX 3,3 bpw con calibración imatrix y anchuras mixtas: expertos enrutados a 3 bits (grupo 128 en 67 grupos gate-up/down), 2 bits grupo 128 en 23 grupos y 2 bits grupo 64 en 2 (3,14 bpw medios); capas 46-47 y cabeza MTP a 4 bits grupo 64; atención, GDN, hyper-connections, indexer y expertos compartidos a 8 bits grupo 64; lm_head a 8 bits grupo 64; embed_tokens a 4 bits grupo 64; tabla de n-gramas a 4 bits grupo 32; routers, gates de inyección, norms, convs y estado SSM en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (shards) + ngram_table.bin (32,0 GB, formato safetensors pero con extensión .bin para que MLX no la cargue automáticamente) + model-vision.safetensors (~0,9 GB, bf16 denso) |
| Tamano del repositorio | 86,3 GB |
| Fecha de publicacion | 13 de septiembre de 2026 según los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un tronco GDN más MoE con tres innovaciones sobre el esquema habitual. Los flujos residuales son 4 corrientes de 2.560 dimensiones: cada bloque lee una media mezclada por sigmoide de las corrientes normalizadas y escribe de vuelta mediante puertas escalares por corriente, y el mezclador final sustituye a la normalización final convencional. La tabla de embedding de n-gramas (51 B) se indexa por bigramas y trigramas con hash de los identificadores de token: 16 cabezas, cada una con un espacio de cubos de tamaño primo de unos 20 millones de filas y 160 dimensiones por fila, inyectada una sola vez antes de la capa 1; es una búsqueda, sin cómputo, y por eso Qwen cita el modelo como 125 B. Por último, Qwen Sparse Attention hace que, más allá de 2.048 tokens, cada capa de atención solo lea los 512 bloques de 4 tokens más relevantes por consulta (elegidos por un indexador pequeño) más el bloque parcial de la propia consulta.

No hay información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO); la model card de este repositorio se centra exclusivamente en el proceso de cuantización. Sí se documenta la calibración: la asignación de bits por capa se mide con imatrix, y cada peso cuantizado con entrada de imatrix usa una búsqueda de (escala, bias) ponderada por activaciones en lugar de min-max, manteniendo un diseño afín byte-compatible con mx.quantize. Además, el conversor pliega el +1 de cada RMSNorm (1 + w) en el peso almacenado, transpone las convoluciones depthwise al formato [C, K, 1] de MLX y divide experts.gate_up_proj en switch_mlp.gate_proj y up_proj. La tabla de n-gramas se sirve por mmap: se desquantizan en CPU las 16 filas necesarias por token (16 x 80 bytes) y solo se sube el vector resultante de 2.560 dimensiones, de modo que la tabla nunca queda residente y su coste es caché de páginas.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento extendido con modo thinking activado por defecto; se desactiva con "enable_thinking": false.
- Tool calling / function calling en el formato XML de llamadas de Qwen3.8, que mlx-serve analiza y coacciona a esquema.
- Razonamiento multi-paso y flujos de agente: el conjunto de evaluación de calidad incluye posiciones de tipo agente.
- Visión: torre estilo Qwen3-VL (model.visual.*, bf16 denso, ~0,9 GB) con entrada de imagen y vídeo.
- Contexto largo real: 262.144 tokens nativos con atención dispersa de coste plano, servidos a 65.536 tokens en este pack.
- Decodificación especulativa mediante la cabeza MTP de 1 capa incluida en el pack (--mtp o "enable_mtp": true por petición), desactivada por defecto.
- Código, matemáticas y prosa: presentes en el conjunto de evaluación de la cuantización, aunque sin benchmarks públicos asociados.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.

## Casos de uso

- Asistente de programación totalmente local: con 52 GB residentes cabe en un Mac de 64 GB, por lo que se puede ejecutar generación y revisión de código sin enviar el código fuente a servicios externos, usando el formato XML de tool calling para invocar linters, compiladores o scripts.
- Análisis de documentos extensos: los 65.536 tokens de contexto servidos permiten cargar informes anuales, expedientes o bases de código medianas en una sola ventana; la atención dispersa mantiene el coste plano a partir de 2.048 tokens, aunque la lectura de la tabla de n-gramas desde SSD encarece el primer prefill largo tras cada arranque.
- Agentes autónomos con herramientas: el soporte de tool calling en XML y el razonamiento multi-paso permiten construir bucles de agente (búsqueda, ejecución de comandos, escritura de ficheros) sobre mlx-serve, aprovechando la cabeza MTP para acelerar la decodificación cuando el flujo es solo texto.
- Inspección de imágenes y vídeo: la torre de visión incluida admite entrada de imagen y vídeo, lo que habilita casos como extracción de datos de capturas de pantalla, revisión de fotogramas de vídeo o descripción de diagramas técnicos; conviene tener en cuenta que la MTP se rechaza en turnos con imagen y la decodificación pasa a ser serie.
- Razonamiento analítico con modo thinking: para tareas de matemáticas o planificación donde interesa una cadena de razonamiento larga, el modo thinking está activo por defecto y puede desactivarse por petición cuando se prioriza la latencia.
- Investigación sobre arquitecturas MoE y atención dispersa: el pack expone pesos del modelo qwen4_exp en formato MLX con anchuras documentadas capa por capa, lo que sirve para estudiar el comportamiento de la tabla de n-gramas o comparar precisión 3,3 bpw frente a 4-8 bits en el mismo motor.
- Despliegue de campo sin conectividad: al no requerir GPU de datacenter y funcionar sobre batería en portátiles Apple Silicon, encaja en escenarios con requisitos de privacidad o entornos aislados (auditoría, sanidad, defensa) donde no se permite salida a Internet.
- Servidor de inferencia personal multiusuario ligero: mlx-serve permite servir el modelo en red con --serve, de modo que un único Mac de 64 GB actúa como backend para varias aplicaciones internas con un KV cache de 64k de solo 1,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son de fidelidad de la cuantización frente al checkpoint bf16 y de velocidad en un M4 Max.

Calidad medida sobre 1.200 posiciones held-out de siguiente token (agente, código, prosa y matemáticas, documentos que la calibración nunca vio). Top-1 es la frecuencia con la que el token greedy del pack coincide con el de bf16; mass es la probabilidad que bf16 asigna a la elección del pack, con la elección de bf16 como techo:

| Pack | Residente | Top-1 vs bf16 | Mass (techo bf16: 0,762) |
|---|---|---|---|
| mixed-4-8bit | 73 GB | 89,1 % | 0,738 |
| iQ-MLX 3.3 bpw (este pack) | 52 GB | 85,6 % | 0,732 |

Velocidad con llmprobe --bench-only --rungs 2k sobre M4 Max:

| Pack | Decodificación | Prefill | TTFT |
|---|---|---|---|
| iQ-MLX 3.3 bpw (este pack) | 52,6 tok/s | 762 tok/s | 318 ms |
| mixed-4-8bit | 55,5 tok/s | 754 tok/s | 278 ms |

El autor documenta variantes descartadas durante el desarrollo: más bytes en los expertos a costa de una espina dorsal de 6 bits (peor), forzar las proyecciones down a 3 bits (sin diferencia) y 3,6 veces más datos de calibración a 44 GB (sin cambio medible en el error: lo que movió la aguja fueron los bytes, no el volumen de calibración). El rendimiento de la MTP no se volvió a medir en este pack.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon; MLX no soporta CUDA ni ROCm, por lo que no hay ruta de despliegue en GPU NVIDIA o AMD con este pack.
- VRAM/unified memory estimada: 52,2 GB activos tras la carga y 55,6 GB de pico durante un prefill de 36.000 tokens, medidos en este pack.
- Mac de destino: 64 GB. macOS limita la memoria cableable por la GPU a cerca del 75 % de la RAM (48 GB en un Mac de 64 GB), insuficiente, por lo que hay que elevar el límite una vez por arranque con sudo sysctl iogpu.wired_limit_mb=58000.
- KV cache: 1,6 GB para 65.536 tokens de contexto; --kv-quant 8 lo reduce a la mitad si se necesita más margen.
- Tabla de n-gramas: 32,0 GB que no entran en el cómputo residente; se sirven por mmap y compiten como caché de páginas. Con la caché fría, el primer prompt largo paga lecturas aleatorias de SSD de varios segundos por cada 8.000 tokens; en caliente no cuesta nada.
- Alternativa para 128 GB: el pack mixed-4-8bit, con 75 GB residentes y unos puntos mejor de fidelidad.
- Descarga: 86,3 GB de repositorio.
- GPU recomendadas: no aplica; el hardware de referencia es un M4 Max. No hay datos para M1/M2/M3 ni para configuraciones de 32 GB o 36 GB, donde este pack no cabe.
- Opciones de despliegue: mlx-serve (--model ... --serve --ctx-size 65536). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de la tabla de n-gramas y las anchuras mixtas sugieren que el pack es específico de este motor.
- Latencia y throughput: 52,6 tok/s de decodificación, 762 tok/s de prefill y 318 ms de TTFT en M4 Max con rungs 2k.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con modelos de terceros de la misma categoría. La única comparación documentada es entre los dos packs del mismo modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (iQ-MLX 3.3 bpw) | 98,4 B en safetensors (180 B nominales con n-gramas y MTP) | 65.536 servidos / 262.144 nativos | 52 GB residentes; 85,6 % top-1 vs bf16; 52,6 tok/s en M4 Max | qwen-community-1.0 | MLX / Apple Silicon |
| Pack mixed-4-8bit (mismo autor) | idem | idem | 73-75 GB residentes; 89,1 % top-1 vs bf16; 55,5 tok/s en M4 Max | qwen-community-1.0 | MLX / Apple Silicon, requiere 128 GB |
| Checkpoint bf16 Qwen/Qwen3.8-Flash-Next | 125 B de tronco + 51 B de n-gramas + 4 B de MTP = 180 B | 262.144 nativos | Referencia de calidad (techo de mass 0,762 en la evaluación); 360 GB en bf16 | qwen-community-1.0 | Pesos originales, no ejecutables en hardware de consumo |

Otros modelos comparables (mismo tamaño o misma tarea, por ejemplo alternativas MoE de 100 B o superiores con contexto largo): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: el pack reproduce el token greedy de bf16 en el 85,6 % de 1.200 posiciones evaluadas, es decir, difiere en aproximadamente una de cada siete posiciones. La mass retenida (0,732 frente a un techo de 0,762) indica degradación acumulable en generaciones largas.
- La evaluación de calidad se hizo con posiciones de siguiente token, no con tareas completas; no hay medidas de precisión en benchmarks de razonamiento, código o matemáticas, por lo que el impacto real en tareas de agente o generación larga es desconocido.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación; el modelo base es una vista previa (qwen4_exp) y el autor no reporta evaluaciones de veracidad.
- Idiomas: no disponible. No se documenta qué idiomas soporta ni su rendimiento relativo, así que no conviene asumir calidad multilingüe.
- Atención dispersa: a partir de 2.048 tokens cada consulta solo lee 512 bloques de 4 tokens seleccionados por un indexador; si el indexador falla en recuperar el fragmento relevante, la degradación en tareas de recuperación de contexto largo puede pasar desapercibida. No hay evaluaciones publicadas de este comportamiento.
- Requisito operativo no estándar: es obligatorio modificar el límite de memoria cableable del kernel (sudo sysctl iogpu.wired_limit_mb=58000) en cada arranque; sin ello, el modelo no cabe en un Mac de 64 GB.
- Coste de arranque en frío: la tabla de n-gramas de 32 GB no está residente y, con la caché de páginas fría, los primeros prompts largos pagan lecturas aleatorias de SSD de varios segundos por cada 8.000 tokens, además de competir por memoria con el resto del sistema.
- Límite duro de hardware: 52 GB residentes excluyen configuraciones de 32 GB o 36 GB de memoria unificada; en un Mac de 64 GB queda muy poco margen para otras aplicaciones.
- Restricciones de licencia: el modelo se distribuye bajo qwen-community-1.0 (etiquetada como license: other), cuyos términos concretos para uso comercial no se detallan en la model card; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes y se publicó el 13 de septiembre de 2026, por lo que no existe validación independiente de los números reportados por el autor; además, el modelo base pertenece a una arquitectura en fase de vista previa.
- Compatibilidad: el pack está atado a mlx-serve; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la MTP se rechaza automáticamente en turnos con imagen, pasando a decodificación serie.
- El recuento de parámetros de los safetensors (98,4 B) no coincide con la descripción de la model card (180 B incluyendo n-gramas y MTP), porque la tabla de n-gramas se almacena aparte en ngram_table.bin; conviene tenerlo en cuenta al comparar con otras fichas.

## Enlaces

- Repositorio HuggingFace del pack: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-3.3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack alternativo mixed-4-8bit (recomendado para Macs de 128 GB): https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Licencia: fichero LICENSE del repositorio (license_name: qwen-community-1.0)
- La búsqueda web realizada no devolvió resultados relevantes: todos los enlaces devueltos correspondían a páginas de soporte y cuentas de Microsoft sin relación con el modelo. No se han localizado papers, blogs ni demos adicionales en la información disponible.
