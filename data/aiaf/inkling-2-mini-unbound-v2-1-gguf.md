# AiAF/Inkling-2-Mini-Unbound-v2.1-GGUF

## Resumen

Inkling-2-Mini Unbound v2.1 (GGUF mirror) es una cuantización Q4_K_M del finetune abliterado (alignment-modified) de Inkling-2-Mini, el modelo base desarrollado por Thinking Machines Lab. El modelo original es un transformer de 26.070.385.152 parámetros (aproximadamente 26,07 mil millones), publicado bajo licencia Apache-2.0, y este repositorio concreto lo redistribuye en formato GGUF para su despliegue con llama.cpp y con el motor de inferencia de Hugging Face Endpoints.

El finetune "Unbound" elimina los mecanismos de rechazo del modelo base (técnica conocida como abliteration), de modo que el modelo no está alineado para negarse a peticiones. Esto lo hace relevante para investigación sobre comportamiento de modelos, evaluación de salvaguardas y casos de uso creativos o de rol donde la alineación por defecto resulta limitante, pero también lo convierte en un artefacto inadecuado para exposición pública sin moderación externa. El repositorio es un espejo de cuantizaciones del propio autor del finetune (nokeepai), verificado byte a byte contra la release original.

El paquete incluye el modelo de texto en Q4_K_M (17,78 GB) y un proyector de visión opcional en Q8_0 (0,35 GB), lo que añade capacidad multimodal de entrada de imagen. La ventana de contexto práctica recomendada por el autor es de 16K tokens en una GPU de 24 GB con caché KV en q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling-2-Mini); soporte `inkling2_loop` en llama.cpp |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16K recomendado en 24 GB; hasta 32K con margen ajustado; `-c 16384` en el ejemplo de uso |
| Tipos de cuantizacion | Q4_K_M (texto), Q8_0 (proyector de visión); el autor menciona releases Q8_0 y BF16 como referencia de calidad |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 26,07 mil millones de parámetros desarrollado por Thinking Machines Lab. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO. El identificador `inkling2_loop` en llama.cpp sugiere un mecanismo de atención o de capas con estructura de bucle (loop) específica que requiere una build de llama.cpp con soporte dedicado; no se dispone de más detalle técnico sobre dicha innovación.

Sobre el modelo base se aplicó un finetune de abliteration (v2.1) por parte de nokeepai, que modifica el comportamiento de rechazo. Posteriormente, el texto se cuantizó a Q4_K_M. El autor advierte que se trata de una segunda cuantización sobre unos pesos cuyos expertos ya estaban en 4 bits, por lo que cabe esperar cierta pérdida de calidad frente a las releases Q8_0 o BF16. El repositorio incluye una verificación del tensor table: 704 tensores con offsets estrictamente crecientes (de 0 a 17.770.530.432), requisito de stock llama.cpp y del motor llama.cpp de HF Endpoints.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen mediante el proyector de visión opcional (`mmproj-Inkling-2-Mini-Q8_0.gguf`).
- Comportamiento sin alineación de rechazo (abliterated): no se apoya en el modelo para denegar peticiones.
- Compatible con el servidor llama.cpp (`llama-server`) y con plantillas Jinja (`--jinja`).
- Soporte de decodificación con caché KV cuantizada (q8_0 para claves y valores).
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y salvaguardas: comparar las respuestas del modelo abliterado frente al base para estudiar qué comportamientos se ven afectados por la modificación de alineación, con fines de auditoría y publicación académica.
- Generación creativa sin restricciones de rechazo: escritura de ficción, guiones o narrativa con temáticas sensibles, en un entorno controlado y con revisión humana posterior.
- Despliegue local en estación de trabajo con GPU de 24 GB: servir el modelo con `llama-server` a 16K de contexto y caché KV en q8_0, suficiente para asistentes personales o prototipos internos.
- Procesamiento de documentos con imagen: usar el proyector de visión para extraer y resumir información de capturas, diagramas o páginas escaneadas, aceptando el coste adicional de 0,35 GB de VRAM.
- Rol y simulación de personajes: conversaciones multi-turno con contexto largo (16K) donde la ausencia de rechazos permite mantener la coherencia del personaje sin interrupciones.
- Inferencia gestionada en Hugging Face Endpoints: desplegar con el motor llama.cpp y los argumentos documentados (`--jinja -fa on -c 16384 -ngl 99 -ctk q8_0 -ctv q8_0 -np 1`) para pruebas internas sin infraestructura propia.
- Evaluación de cuantización: comparar la calidad de Q4_K_M frente a Q8_0/BF16 en tareas concretas para decidir el compromiso entre VRAM y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (texto, Q4_K_M): 17,8 GB de pesos; caché KV en q8_0 de 0,13 GB a 8K, 0,27 GB a 16K, 0,40 GB a 24K y 0,53 GB a 32K.
- Proyector de visión: 0,35 GB adicionales (opcional).
- Presupuesto en tarjeta de 24 GB: 8K y 16K con margen holgado; 24K viable; 32K ajustado una vez contados los búferes de cómputo.
- GPU recomendadas: cualquier GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100). En consumer GPU de 24 GB cabe a 16K; por debajo de 24 GB no se garantiza el despliegue completo en GPU.
- Opciones de despliegue: llama.cpp (`llama-server`) y Hugging Face Inference Endpoints con motor llama.cpp. Requiere build con soporte `inkling2_loop`.
- Ajustes: `-ngl 99` para volcar todas las capas a GPU, `-fa on` para flash attention, `-ctk q8_0 -ctv q8_0`, `-np 1`. Reducir `-ub 256` si un prompt largo provoca OOM en prefill. No usar `--no-mmap` ni `--mlock` (eliminados de llama.cpp).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini Unbound v2.1 (este) | 26,07 B | 16K recomendado (hasta 32K) | Apache-2.0 | GGUF Q4_K_M + proyector visión | Abliterado; requiere llama.cpp con `inkling2_loop` |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B | no disponible | Apache-2.0 | Pesos originales (BF16) | Alineación intacta; sin modificación de rechazo |
| nokeepai/Inkling-2-Mini-Unbound | 26,07 B | no disponible | Apache-2.0 | Pesos del finetune | Mismo finetune sin cuantizar; mayor fidelidad |
| nokeepai/Inkling-2-Mini-Unbound-GGUF | 26,07 B | no disponible | Apache-2.0 | GGUF (varias cuantizaciones) | Origen de este espejo; incluye Q8_0 |

## Limitaciones y advertencias

- Modelo abliterado: su comportamiento de seguridad no ha sido evaluado; puede producir contenido inseguro o inexacto y no debe confiarse en que rechace peticiones. Aplicar salvaguardas propias y no exponerlo públicamente sin moderación.
- Doble cuantización: Q4_K_M sobre pesos cuyos expertos ya estaban en 4 bits implica pérdida de calidad frente a Q8_0 o BF16.
- Riesgo de alucinación: no cuantificado en la información disponible; esperable en un modelo de este tamaño sin datos de evaluación publicados.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- Dependencia de build: requiere una versión de llama.cpp con soporte `inkling2_loop`; builds antiguas fallarán al cargar.
- Contexto práctico limitado a 16K en 24 GB; 32K queda al límite por los búferes de cómputo.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y su moderación recae en el desplegador.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria de su funcionamiento más allá de la verificación de offsets declarada por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AiAF/Inkling-2-Mini-Unbound-v2.1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Finetune: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Cuantizaciones originales: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
