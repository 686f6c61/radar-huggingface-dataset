# open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step1024-2026.10.28

## Resumen

Grug-67B-A2B-Datakit-SFT-Repro-262K-Step1024-2026.10.28 es un checkpoint intermedio de un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por el colectivo open-athena en HuggingFace. Con 67.078.882.816 parámetros totales en formato safetensors y un repositorio de 134,2 GB, se trata de un modelo de gran tamaño pero con una fracción de parámetros activos reducida: la nomenclatura "A2B" del nombre apunta a unos 2.000 millones de parámetros activos por token, aunque este dato no se confirma en la información disponible del repositorio.

El modelo deriva de `open-athena/snowball-67b-a2b-base-262k-qk175-skew8`, una base con ventana de contexto de 262.144 tokens, y sobre ella se ha aplicado un ajuste supervisado (SFT) cuyo nombre, "Datakit-SFT-Repro", sugiere una reproducción de un entrenamiento previo sobre un conjunto de datos denominado Datakit. El sufijo "Step1024" y la etiqueta `intermediate-checkpoint` indican que no es una versión final, sino una instantánea del entrenamiento en un paso temprano.

Su relevancia es acotada y muy específica: sirve para estudiar la dinámica de entrenamiento de una familia MoE de 67B con contexto de 262K, para reproducir resultados de SFT y para experimentar con la arquitectura propietaria `grug_moe`. No hay resultados de benchmarks publicados, el acceso está restringido (gated) y el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, por lo que no debe considerarse una opción lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre decoder-only tipo transformer, según el tag `grug_moe`; el detalle de capas, cabezas y configuración de expertos no está disponible |
| Parametros totales | 67.078.882.816 (67,1 B), dato real de safetensors |
| Parametros activos | ~2 B según la nomenclatura "A2B" del nombre del modelo; no confirmado en la ficha del repositorio |
| Longitud de contexto | 262.144 tokens (según "262K" en el nombre del modelo y del modelo base); no verificado en `config.json` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (Open Model, Data and Weights), con acceso restringido que requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors (compatible con `transformers`); repositorio de 134,2 GB |

## Arquitectura y entrenamiento

La información disponible identifica el modelo con los tags `grug_moe` y `mixture-of-experts`, lo que sitúa la arquitectura en la familia de transformers decoder-only con capas MoE: cada token activa un subconjunto de expertos, de modo que el coste computacional por token se aproxima al de un modelo denso de ~2B mientras el conjunto de pesos retenidos en memoria corresponde a 67B. El tag `grug` sugiere una implementación propia del autor (no una arquitectura estándar de Llama, Qwen o Mixtral), y el sufijo `qk175-skew8` del modelo base apunta a alguna modificación en las proyecciones query/key y en el reparto de expertos, si bien no se documenta su significado. El tamaño del repositorio (134,2 GB) es coherente con pesos en bf16/fp16 sin cuantizar.

El entrenamiento consiste en un ajuste supervisado (SFT) sobre la base `snowball-67b-a2b-base-262k-qk175-skew8`, etiquetado como reproducción ("Repro") de un entrenamiento sobre el dataset Datakit. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o preferencias; tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El checkpoint corresponde al paso 1024 (`Step1024`), lo que en un modelo de este tamaño indica una fase temprana del proceso de ajuste y, por tanto, un grado de convergencia bajo.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el ajuste SFT se orienta a diálogo multi-turno, presumiblemente con soporte de plantilla de chat (no verificada).
- Procesamiento de contexto largo: la ventana declarada de 262.144 tokens permitiría, en teoría, manejar documentos completos, bases de código extensas o historiales de conversación muy prolongados.
- Eficiencia computacional por token: al activar ~2B parámetros, el coste de cómputo por token es bajo en comparación con un modelo denso de 67B.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Multilingüismo: no disponible; no se declara ningún idioma en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre entrenamiento MoE: el checkpoint en el paso 1024 permite analizar la evolución de la pérdida, el reparto de carga entre expertos y la estabilidad del enrutamiento en una arquitectura `grug_moe` de 67B, comparando con checkpoints posteriores del mismo run.
- Reproducción de experimentos de SFT: al estar etiquetado como "Repro", sirve para validar la reproducibilidad de un pipeline de ajuste supervisado sobre el dataset Datakit antes de escalar a un entrenamiento completo.
- Evaluación de checkpoints intermedios: útil para medir qué capacidades emergen (o no) en fases tempranas del SFT y calibrar cuántos pasos son necesarios antes de obtener un modelo utilizable.
- Procesamiento de documentos largos en laboratorio: con 262K tokens de contexto, permite probar estrategias de recuperación y resumen sobre corpus extensos, siempre en entorno controlado y sin expectativas de calidad de producción.
- Estudio de eficiencia memoria/cómputo en MoE: la combinación de 67B totales y ~2B activos lo convierte en un banco de pruebas para técnicas de offloading de expertos, paralelismo tensorial y serving con vLLM o SGLang.
- Base para comparativas de tokenizadores y plantillas de chat: si se dispone del tokenizador del modelo base, se puede contrastar el comportamiento de la plantilla conversacional frente a otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y al tratarse de un checkpoint intermedio del paso 1024 es esperable que su rendimiento esté por debajo del de la base ya entrenada y muy lejos de un modelo final afinado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ~134 GB solo para pesos, más el KV cache. Requiere como mínimo 2 GPU de 80 GB (H100 o A100 80GB) para contextos cortos y 4 o más para explotar la ventana de 262K.
- Cuantización a int8: ~67 GB de pesos, ajustado en una H100 80GB o en 2x A100 40GB, con poco margen para KV cache.
- Cuantización a int4: ~34 GB de pesos, viable en 2x RTX 4090 (48 GB) o en una única RTX 6000 Ada / A100 40GB, siempre que se genere una cuantización propia, ya que no hay GGUF ni AWQ oficiales.
- GPU recomendadas: H100 80GB (SXM o PCIe) en configuraciones de 2 a 8 unidades; A100 80GB como alternativa; RTX 4090 únicamente con cuantización agresiva y contexto recortado.
- Cabe en consumer GPU: solo con cuantización a 4 bits y repartiendo el modelo entre varias tarjetas; en una única GPU de 24 GB no es viable sin offloading a RAM, lo que degrada severamente la latencia.
- Opciones de despliegue: `transformers` es la vía soportada de forma nativa; vLLM y SGLang requerirían soporte para la arquitectura `grug_moe` (no confirmado); llama.cpp y Ollama exigirían convertir los pesos a GGUF, sin receta publicada. TGI no está verificado para esta arquitectura.
- Latencia y throughput: no disponibles. Cualitativamente, al activar ~2B parámetros el cómputo por token es reducido, pero el cuello de botella es la memoria: con 67B de pesos hay que mantener todo el conjunto de expertos residente o aplicar offloading.
- KV cache: a 262.144 tokens su tamaño es determinante y no puede calcularse sin la configuración de capas, cabezas y dimensión de cabeza, que no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Grug-67B-A2B (este modelo) | 67,1 B | ~2 B (según nombre, sin confirmar) | 262.144 | openmdw-1.1, acceso gated | Checkpoint intermedio, sin benchmarks |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 262.144 nativo | Apache 2.0 | Versión final con benchmarks publicados |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | Versión final con benchmarks publicados |
| gpt-oss-120b | ~117 B | ~5,1 B | 131.072 | Apache 2.0 | Versión final con benchmarks publicados |

La comparación relevante es de escala y de régimen de activación: el modelo de open-athena se sitúa entre Qwen3-30B-A3B y gpt-oss-120b en parámetros totales, con un ratio de activación más agresivo (~3 % frente al ~4-11 % de los alternativas). Frente a todos ellos, la desventaja es la madurez: no hay benchmarks, no hay cuantizaciones oficiales, la licencia no es Apache 2.0 y el acceso está restringido. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Checkpoint intermedio: el sufijo `Step1024` y el tag `intermediate-checkpoint` indican un estado temprano del SFT; es previsible una calidad conversacional muy inferior a la de la base y a la de un modelo final.
- Ausencia total de evaluación: sin benchmarks ni métricas publicadas, no es posible estimar su calidad real en ninguna tarea.
- Idiomas no declarados: se desconoce qué lenguas cubre el entrenamiento y con qué proporción; el rendimiento en castellano es una incógnita.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje y no mitigado por una fase de preferencias documentada (no consta RLHF ni DPO).
- Sesgos: no hay información sobre la composición del dataset Datakit ni sobre filtrado o descontaminación, por lo que los sesgos son desconocidos y no auditables.
- Licencia: openmdw-1.1 impone condiciones que deben revisarse antes de cualquier uso comercial; además el repositorio es gated y requiere aceptar términos en HuggingFace. No se asume permiso comercial por defecto.
- Arquitectura no estándar: `grug_moe` probablemente no está soportada por las herramientas de serving más comunes, lo que complica el despliegue y obliga a usar `transformers`.
- Requisitos de memoria elevados: 134,2 GB en bf16 y sin cuantizaciones oficiales; el coste de inferencia en VRAM es alto aunque el cómputo por token sea bajo.
- Contexto declarado pero no verificado: 262K tokens según el nombre; no hay evidencia publicada de que el modelo mantenga calidad a esa longitud.
- Sin soporte comunitario: cero descargas y cero valoraciones, sin issues ni documentación de terceros que permitan contrastar comportamientos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step1024-2026.10.28
- Modelo base: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Perfil del autor: https://huggingface.co/open-athena

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre el colectivo open-athena; los enlaces anteriores son los únicos verificables a partir de la información disponible. No se han localizado papers, blogs, repositorios ni demos asociados.
