# ji-farthing/RalphQwen3.8-Flash-Next-GGUF

## Resumen

RalphQwen3.8 Flash Next es un modelo de 193.015.448 parámetros (193,02 M) publicado por el usuario ji-farthing en Hugging Face. No es un modelo de lenguaje utilizable: es un *fixture* de pruebas, es decir, una réplica a escala mínima de la arquitectura del modelo Qwen3.8-Flash-Next cuyo único propósito es permitir que se implemente, depure y valide el soporte de dicha arquitectura en herramientas de inferencia (concretamente el conversor `qwen4exp` de llama.cpp) sin necesidad de descargar el modelo completo. Sus pesos se inicializaron de forma aleatoria y se entrenaron desde cero sobre un corpus sintético diminuto.

La arquitectura replicada es `qwen4exp` (modelo de texto `Qwen4Exp` de Transformers 5.18.0.dev0), un transformer híbrido que combina atención lineal con atención completa, mezcla de expertos (MoE) con enrutado disperso, hyper-connections y un indexador de atención dispersa, además de embeddings de token por capa basados en hashing de n-gramas. El fixture conserva todas esas estructuras pero con geometría reducida: 4 capas en lugar de 48, hidden size 320 en lugar de 2.560 y contexto configurado de 4.096 tokens en lugar de 262.144.

Su relevancia es estrictamente de ingeniería: es el hermano Qwen de los fixtures RalphSeek V4 Flash y RalphSeek V4.1 Flash, y sirve como banco de pruebas ligero (783 MB en un único GGUF F32) para validar cargadores, kernels y plantillas de chat de modelos híbridos lineales y MoE. El repositorio tiene 0 descargas y 1 like, y el propio autor advierte que el modelo responde con no-hechos infantiles y confiados, que es exactamente para lo que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (modelo de texto `Qwen4Exp` / `qwen4_exp_text`, Transformers 5.18.0.dev0): transformer híbrido con atención lineal + atención completa, MoE, hyper-connections y indexador de atención dispersa |
| Parámetros totales | 193.015.448 (193,02 M) |
| Parámetros activos | no disponible (el autor no publica el recuento; el modelo usa 2 de 8 expertos enrutados por capa) |
| Longitud de contexto | 4.096 tokens configurados (el modelo de referencia Qwen3.8-Flash-Next usa 262.144) |
| Tipos de cuantización | solo F32 en el repositorio (un único archivo GGUF); no se publican otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-license-1.0 (`license: other`) |
| Formato de pesos | GGUF (`RalphQwen3.8-Flash-Next-F32.gguf`, 783 MB, todos los tensores en F32) |

## Arquitectura y entrenamiento

El modelo replica la geometría del `config.json` de Qwen3.8-Flash-Next reduciéndola en cada eje. Consta de 4 capas: 3 de atención lineal seguidas de 1 de atención completa (frente a 36 + 12 en el modelo real). El hidden size es 320 (2.560 en el original), con 4 cabezas de atención, 1 cabeza KV y dimensión de cabeza 128 (24 / 2 / 256 en el original). La atención lineal usa 2 cabezas de clave y 4 de valor. La capa MoE enruta 8 expertos y usa 2, con ancho de experto y experto compartido de 640. Incorpora 4 flujos de hyper-connection con rango bajo 320, y un indexador de atención dispersa de 2 cabezas, ratio de compresión 4 y presupuesto 16 (el original usa 4 cabezas y top-k 2.048). En `blk.1` hay un embedding de token por capa con tamaño de n-grama 3 y 2 cabezas con hash de 4.099 y 4.111 filas de 160 dimensiones, lo que suma 1,33 M de parámetros (frente a 16 cabezas de unos 20 M de filas y 51,2 G de parámetros en el modelo real). El vocabulario es idéntico al original: 248.320 entradas. No tiene capas MTP (el original tiene 1) ni torre de visión (el original sí la tiene).

El entrenamiento es deliberadamente mínimo. Los pesos se inicializaron de forma aleatoria y se entrenaron desde cero sobre el corpus sintético RalphSeek, compuesto por 6.560 ejemplos de entrenamiento, 816 de validación y 816 de test. Los prompts emplearon la plantilla de chat de Qwen con el modo de razonamiento desactivado, y la pérdida se calculó únicamente sobre la respuesta. El entrenamiento corrió 664 pasos y luego 2.142 pasos adicionales a lo largo de dos épocas. La pérdida final de validación fue 0,441 y la de test, 0,442. No hay fases de RLHF, DPO ni ajuste por preferencias. Los pesos son originales y no derivan ni se destilan de ningún checkpoint de Qwen; la única deuda con Qwen son el tokenizer y la plantilla de chat, copiados de Qwen/Qwen3.8-Flash-Next, que son la razón de la licencia aplicada.

## Capacidades

- Generación de texto: funcional a nivel de forma, pero sin contenido factual. El modelo fue entrenado para producir no-hechos con seguridad, del tipo "I think raindrops put the moon to bed. They sound like the last Tuesday." o "Turtles keep tiny houses in their pajamas. The breakfast spoon made me the toast captain!".
- Reproducción del layout arquitectónico `qwen4exp`: atención lineal, atención completa, enrutado MoE (8 expertos, 2 usados), expertos compartidos, hyper-connections y per-layer token embeddings con hashing de n-gramas.
- Validación de tokenizer y plantilla de chat: vocabulario de 248.320 entradas y tokens especiales (`<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`) idénticos a los del modelo de referencia.
- Modo conversacional: sí, mediante la plantilla de chat de Qwen (el autor indica que un prompt con forma "Teacher: ... Ralph: ..." obtiene el tipo de respuesta para el que fue entrenado).
- Tool calling / function calling: no soportado, no disponible.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no, únicamente inglés.
- Modo de razonamiento (thinking): no; el entrenamiento se realizó con thinking desactivado y el prompt de ejemplo incluye un bloque `<think></think>` vacío.
- Visión: no (sin torre de visión).
- Capacidad especial: es un fixture de pruebas, no un modelo. Está etiquetado como `test-fixture`, `tiny` y `qwen4exp`, y su función es la de ser un objetivo de test para runtimes.

## Casos de uso

- Verificación del conversor GGUF `qwen4exp`: permite comprobar que el conversor de ggml-org/llama.cpp (commit `f8dbcd6`) genera un GGUF correcto a partir de un checkpoint `qwen4exp` sin necesidad de manipular un modelo de cientos de gigabytes. El resultado se inspecciona tensor a tensor porque todos están en F32.
- Pruebas de regresión del cargador de metadatos GGUF: el archivo declara la geometría completa (4 capas, hidden 320, 8 expertos, indexador disperso con presupuesto 16, embeddings por capa con n-grama 3) y sirve para detectar si un cambio en el parser rompe la lectura de campos poco habituales como los flujos de hyper-connection o el tamaño de n-grama.
- Validación de kernels de atención lineal: la secuencia de 3 capas lineales más 1 completa permite ejercitar las rutas de cómputo de atención lineal con formas reducidas (4 cabezas Q, 1 KV) y verificar numéricamente la salida frente a una implementación de referencia en PyTorch.
- Test del enrutado MoE y de expertos compartidos: con 8 expertos enrutados y 2 usados por token, más el experto compartido de ancho 640, se puede comprobar la lógica de top-k routing, el reparto de carga y la concatenación de la salida del experto compartido en un grafo pequeño y rápido de ejecutar.
- Integración continua en el desarrollo de runtimes: al ocupar 783 MB y ejecutarse en CPU, el fixture cabe en cualquier runner de CI. Un pipeline puede descargarlo, cargarlo con `llama-cli` y comprobar que la generación no lanza excepciones ni produce NaN antes de fusionar un cambio.
- Pruebas de cuantización y comparación de kernels: al existir la variante F32 como brazo de referencia, es posible cuantizar a Q4_K_M, Q8_0 u otros formatos y medir la divergencia de logits o de perplejidad sobre el corpus sintético, aislando errores de kernel del error de cuantización.
- Validación del indexador de atención dispersa y de los per-layer token embeddings: estructuras poco comunes (ratio de compresión 4, presupuesto 16, 2 cabezas con hash de 4.099 y 4.111 filas) que necesitan un modelo real que las contenga para poder depurarlas con breakpoints y sin esperar minutos por iteración.
- Documentación y material didáctico: al ser un archivo único de 783 MB con la geometría anotada en la model card, resulta útil como ejemplo reproducible para explicar cómo se serializa un transformer híbrido MoE en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta las pérdidas del entrenamiento sobre el corpus sintético RalphSeek, que no son comparables con métricas estándar (MMLU, HumanEval, GSM8K) ni con ningún modelo real:

| Métrica | Valor |
|---|---|
| Pérdida de validación final | 0,441 |
| Pérdida de test | 0,442 |
| Pasos de entrenamiento | 664 + 2.142 (dos épocas) |
| Ejemplos de entrenamiento / validación / test | 6.560 / 816 / 816 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F32. El archivo de pesos ocupa 783 MB; con contexto de 1.024 tokens (el usado en el ejemplo del autor) el consumo total es de unos pocos cientos de megabytes adicionales.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria libre, incluidas integradas. No requiere A100, H100 ni RTX 4090; el modelo es cuatro capas con hidden size 320.
- Inferencia en CPU: viable y probablemente el modo de uso habitual, dado el tamaño y que el autor ejecuta el ejemplo de generación con `llama-cli`.
- GPU consumer: sí, cabe en cualquier GPU consumer actual e incluso en aceleradores de borde con 1 GB de memoria.
- Opciones de despliegue: `llama-cli` (ejemplo documentado por el autor), runtime ik_llama (etiqueta `ik_llama` del repositorio) y el cargador GGUF de ggml-org/llama.cpp mediante el conversor `qwen4exp` en el commit `f8dbcd6`. La carga en llama.cpp upstream no está probada según el propio autor. No hay datos sobre vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput estimados: no disponible. No se publican cifras. Por geometría (4 capas, 193 M de parámetros, contexto de 4.096), la latencia esperada es muy baja, pero no se ofrece ninguna medición.
- Compatibilidad de endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, aunque no se detalla a qué implementación de endpoints se refiere.

## Comparativa con modelos similares

El autor documenta la correspondencia estructural con el modelo de referencia Qwen/Qwen3.8-Flash-Next, del que este fixture es una reducción. Los dos hermanos de la misma familia (RalphSeek V4 Flash y RalphSeek V4.1 Flash) se mencionan como fixtures equivalentes, pero no se dispone de sus especificaciones en la información proporcionada.

| Modelo | Parámetros | Contexto | Capas (lineal / completa) | Hidden size | Cabezas Q / KV / dim | Expertos (routados / usados) | MTP | Visión | Licencia |
|---|---|---|---|---|---|---|---|---|---|
| RalphQwen3.8 Flash Next (este) | 193,02 M | 4.096 | 4 (3 / 1) | 320 | 4 / 1 / 128 | 8 / 2 | 0 | No | qwen-community-license-1.0 |
| Qwen/Qwen3.8-Flash-Next | no disponible | 262.144 | 48 (36 / 12) | 2.560 | 24 / 2 / 256 | 512 / 10 | 1 | Sí | qwen-community-license-1.0 (según el enlace de licencia indicado por el autor) |
| RalphSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| RalphSeek V4.1 Flash | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos adicionales de la comparación estructural con el modelo de referencia: el embedding de token por capa usa 1,33 M de parámetros en el fixture frente a 51,2 G en el original; el indexador de atención dispersa pasa de 4 cabezas y top-k 2.048 a 2 cabezas y presupuesto 16; el vocabulario es idéntico (248.320). No se dispone del número total de parámetros de Qwen3.8-Flash-Next ni de resultados comparativos de rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable. El propio autor lo declara explícitamente: cuatro capas de profundidad y 320 de ancho son suficientes para transportar las estructuras del modelo, pero no para producir lenguaje con sentido. No debe desplegarse en ningún producto.
- Alucinación estructural. El modelo no alucina de forma accidental: fue entrenado para responder con no-hechos confiados. Sus salidas son siempre verosímiles en la forma y falsas en el contenido.
- Sesgos. No se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad. El corpus de entrenamiento (6.560 ejemplos sintéticos) no está documentado en composición, por lo que los sesgos son desconocidos e incontrolados.
- Idiomas. Solo inglés. La plantilla de chat y el vocabulario son los de Qwen, pero el entrenamiento no cubre otros idiomas.
- Contexto. 4.096 tokens configurados, muy por debajo de los 262.144 del modelo de referencia. No debe usarse para extraer conclusiones sobre el comportamiento del modelo real en contextos largos.
- Licencia. El modelo se distribuye bajo qwen-community-license-1.0, derivada de copiar el tokenizer y la plantilla de chat de Qwen/Qwen3.8-Flash-Next. Antes de cualquier uso, incluso interno, conviene revisar el texto de la licencia enlazado por el autor, ya que impone condiciones propias de la Qwen Community License y no es una licencia permisiva estándar.
- Ausencia de relación con Qwen. El autor indica expresamente que no está afiliado ni respaldado por Qwen ni por Alibaba. Los pesos son originales y no derivan de ningún checkpoint de Qwen.
- Compatibilidad de runtime restringida. El GGUF se convirtió con el conversor `qwen4exp` de ggml-org/llama.cpp en el commit `f8dbcd6`, y el autor advierte de que la carga en llama.cpp upstream no está probada. No hay cabecera MTP.
- Validación comunitaria nula. 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo día. No hay terceros que hayan reproducido su funcionamiento.
- Los resultados de la búsqueda web realizada para esta ficha no guardan relación con el modelo (corresponden a un vídeo musical, al río Ji y a definiciones del término "ji"), por lo que no aportan información adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ji-farthing/RalphQwen3.8-Flash-Next-GGUF
- Modelo de referencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Conversor `qwen4exp` en llama.cpp: https://github.com/ggml-org/llama.cpp
- Fixture hermano RalphSeek V4 Flash: https://huggingface.co/ji-farthing/RalphSeek-V4-Flash-GGUF
- Fixture hermano RalphSeek V4.1 Flash: https://huggingface.co/ji-farthing/RalphSeek-V4.1-Flash-GGUF
- Resultados de búsqueda web: no relevantes para este modelo (ninguno de los enlaces recuperados trata sobre el modelo ni sobre su arquitectura).
