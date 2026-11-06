# eval-apply/silvann_tq_D8E4_deepseek_v4.1_flash_1017

## Resumen

silvann_tq_D8E4_deepseek_v4.1_flash_1017 es un empaquetado cuantizado de DeepSeek-V4.1-Flash-1017, el modelo publicado por DeepSeek el 17 de octubre de 2026. No se trata de un modelo nuevo, sino de una recodificación de los pesos originales en el formato propietario `silvann-packed-v3` del motor SiLVANN (Eval-Apply GPU Interpreter), con el objetivo de reducir el espacio en disco y permitir la inferencia con un runtime alternativo al de `transformers`.

El pack aplica una rotación de Hadamard con signos por bloques sobre cada matriz de pesos a lo largo de su eje de entrada, seguida de una cuantización con escala por fila (TurboQuant). La política de anchos es `D8E4`: la parte densa (atención, indexer y expertos compartidos) se guarda a 8 bits y los expertos enrutados a 4 bits, replicando las anchuras FP8 y FP4 del lanzamiento original. Los tensores pequeños (norms, routers, mapas de hiperconexión, attention sinks) se conservan sin pérdida y el embedding y la cabeza de salida se almacenan a 8 bits.

El resultado ocupa 457,9 GiB frente a los 475,3 GiB del release original, de los cuales 189,1 GiB corresponden a las tablas Engram, que se mantienen byte a byte con los mismos SHA-256 del repositorio de DeepSeek. El pack solo puede leerse con el runtime de SiLVANN, no con `transformers`, y el repositorio no incluye plantilla Jinja de chat: SiLVANN reproduce la codificación de prompt propia de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), torre de visión ViT de 32 bloques y memoria Engram (n-gram) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE; el pack separa expertos enrutados de expertos compartidos) |
| Longitud de contexto | 1.048.576 posiciones |
| Tipos de cuantizacion | D8E4: 8 bits en parte densa (atención, indexer, expertos compartidos), 4 bits en expertos enrutados, embedding y cabeza a 8 bits, tensores pequeños sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | MIT (la del modelo original de DeepSeek) |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`, `engram/`, `vision.pkl`); no compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-V4.1-Flash-1017, un transformer con mezcla de expertos que incorpora varios componentes destacables: un indexer que selecciona 512 de los latentes comprimidos a partir de la posición 128, un mecanismo de hiperconexiones con mapas propios, attention sinks y una memoria Engram de tipo n-gram que el runtime lee del disco fila a fila. La torre de visión es un ViT de 32 bloques con un aligner; cada imagen se representa como un span de hasta 1.024 tokens, enrutado mediante el sesgo `bias_vl` de cada capa y excluido de la memoria n-gram.

El pack de SiLVANN no reentrena ni modifica los pesos en su semántica: aplica una rotación de Hadamard con signos por bloques y una cuantización TurboQuant con escala por fila, y conserva sin pérdida los tensores sensibles. La validación publicada por el autor compara el pack contra el `inference/model.py` original sobre los mismos pesos: el siguiente token coincide con la referencia (" Rome", KL 0,0005 sobre el vocabulario); en 1.300 posiciones, 34 de 35 comprobaciones por capa pasan los límites del test frente a fp32 (medianas de 1,3e-3 a 2,9e-3), con un único fallo en un router con dos puntuaciones separadas por 8,3e-5. La lectura por filas coincide con la lectura posición a posición (KL 6e-11), la torre de visión queda más cerca de float32 que el bfloat16 del release (3,1e-3 frente a 2,6e-2) y, más allá de 16.384 posiciones, la selección de bloques candidatos de la capa 20 reproduce `select_candidate_blocks` hasta el latente 17.300, con KL 0,0000 en un prompt de 17.283 posiciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo original en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento (thinking) y control del esfuerzo de razonamiento, codificado por SiLVANN según el `encoding.py` del release.
- Generación de código y matemáticas, según las evaluaciones de razonamiento, código y agentes reportadas por DeepSeek para la actualización del 17 de octubre de 2026.
- Tool calling y function calling, con la codificación de llamadas a herramientas del release reproducida token a token.
- Capacidades de agente y razonamiento multi-paso.
- Visión: torre ViT de 32 bloques con aligner, procesamiento de imágenes como spans de hasta 1.024 tokens y enrutamiento por `bias_vl`.
- Contexto largo: hasta 1.048.576 posiciones, con selección de latentes por el indexer y bloques candidatos en capas profundas más allá de 16.384 posiciones.
- Memoria Engram de n-gram leída desde disco, sin consumo de RAM.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento y análisis sobre documentos extensos: con 1.048.576 posiciones de contexto, el modelo puede procesar libros completos, expedientes o bases de código en una sola pasada sin fragmentación, apoyándose en el indexer para seleccionar los latentes relevantes.
- Agentes autónomos con tool calling: la codificación de llamadas a herramientas del release permite integrar el modelo en bucles de agente multi-paso que consulten APIs, ejecuten comandos o recuperen información externa.
- Asistencia a la programación en producción: las evaluaciones de código reportadas por DeepSeek para esta actualización y el soporte de function calling lo hacen apto para pipelines de revisión, generación de tests y corrección automática.
- Análisis de documentos con imágenes: la torre de visión permite procesar capturas, diagramas o páginas escaneadas junto al texto, con cada imagen ocupando hasta 1.024 tokens del contexto.
- Investigación sobre cuantización extrema: el pack sirve como banco de pruebas para estudiar el impacto de la rotación de Hadamard y TurboQuant en un MoE de gran escala, con métricas KL publicadas frente al modelo de referencia.
- Despliegue en entornos con VRAM limitada y mucho almacenamiento: los expertos enrutados (253 GiB) pueden mapearse desde el propio pack y leerse bajo demanda, y las tablas Engram (189,1 GiB) permanecen siempre en disco, lo que permite servir el modelo con menos RAM que el release original.
- Recuperación aumentada sobre corpus históricos: la memoria Engram de n-gram, leída fila a fila desde NVMe, está pensada para consultas de memoria de n-gramas sin cargar las tablas en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas de fidelidad del pack frente al release original (KL y desviaciones por capa), recogidas en la sección de arquitectura. El sitio del modelo menciona mejoras en razonamiento, código, agentes y visión reportadas por DeepSeek, pero sin cifras concretas.

## Requisitos de hardware

- Los pesos del pack ocupan 457,9 GiB en disco; las capas suman 267 GiB, de los cuales 253 GiB son expertos enrutados (6,3 GiB por capa).
- Las tablas Engram (189,1 GiB) permanecen siempre en disco y se leen fila a fila; se recomienda NVMe.
- Los expertos enrutados funcionan más rápido desde RAM; si la RAM no puede contenerlos todos, SiLVANN mapea el resto desde el propio pack sin escribir ficheros adicionales (las versiones anteriores a v0.18.1 escriben una copia de 6,3 GiB por capa).
- La torre de visión ocupa aproximadamente 0,6 GB de VRAM.
- GPU recomendadas: no disponible. El tamaño del modelo excede con mucho la VRAM de cualquier GPU consumer; no cabe en RTX 4090 ni en tarjetas de 24-80 GB.
- Opciones de despliegue: exclusivamente el runtime de SiLVANN v0.18.1 o superior; imágenes y contexto por encima de 16.384 posiciones requieren v0.17.0 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card remite a la documentación de SiLVANN para las tasas medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| silvann_tq_D8E4_deepseek_v4.1_flash_1017 | no disponible (MoE) | 1.048.576 | D8E4 (8/4 bits) | MIT | SiLVANN |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible (MoE) | 1.048.576 | FP8 y FP4 originales | MIT | `inference/model.py` de DeepSeek |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al release original de DeepSeek, del que este pack es una recodificación: mismo modelo, mismas capacidades y misma licencia, con 17,4 GiB menos de almacenamiento y un runtime distinto.

## Limitaciones y advertencias

- El pack no es cargable con `transformers`; requiere el runtime de SiLVANN, lo que limita la portabilidad frente al release original.
- El repositorio no incluye plantilla Jinja de chat; la codificación de prompt la genera SiLVANN imitando el `encoding.py` del release.
- La cuantización introduce desviaciones medibles: 1 de 35 comprobaciones por capa falla el test frente a fp32 por un empate cercano en un router, y el siguiente token se desvía con KL 0,0005 sobre el vocabulario.
- El requisito de almacenamiento (457,9 GiB) y de RAM para los expertos hace inviable el despliegue en hardware de consumo.
- El rendimiento depende del disco: las tablas Engram y, en configuraciones con poca RAM, los expertos se leen bajo demanda, por lo que un almacenamiento lento degrada la latencia.
- No se han publicado datos sobre sesgos, tasa de alucinación ni cobertura idiomática en la información disponible.
- La licencia MIT del modelo original se mantiene, pero conviene verificar las condiciones de uso del runtime SiLVANN, que es software independiente.
- Los datos de la model card son afirmaciones del autor del pack; la validación se limita a comparaciones de fidelidad numérica frente al release, no a evaluaciones de calidad de tarea.

## Enlaces

- Repositorio del pack: https://huggingface.co/eval-apply/silvann_tq_D8E4_deepseek_v4.1_flash_1017
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Sitio del modelo DeepSeek V4.1 Flash 1017: https://deepseekv41flash.com/
