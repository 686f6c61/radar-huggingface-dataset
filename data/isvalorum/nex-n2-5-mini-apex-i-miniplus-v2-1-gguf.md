# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Nex-N2.5-mini APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF artesanal publicada por el usuario IsValorum sobre el modelo base `nex-agi/Nex-N2.5-mini`, una arquitectura de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales. No es un modelo entrenado desde cero, sino una receta de cuantización tensor a tensor diseñada para exprimir un MoE de razonamiento dentro de un presupuesto de aproximadamente 13,74 GiB, manteniendo el enrutado de expertos intacto en `F32`.

El problema que aborda es concreto: las cuantizaciones comunitarias agresivas de MoE suelen comprimir los expertos centrales a 2 bits (`IQ2_S`), lo que degrada la sintaxis, rompe bloques de código y dispara la perplejidad en modo razonamiento. Esta edición sube los expertos compartidos de las 40 capas a `Q5_K`, blinda la cabeza de salida en `Q6_K`, protege las puertas de atención en `Q8_0` y mantiene enrutadores sin comprimir, con un sobrecoste declarado de menos de 180 MB respecto a su edición V1.

Es relevante en el momento actual porque apunta a un nicho muy concreto: estaciones de trabajo con 24 GB de VRAM que quieren ejecutar contexto largo (hasta 256K según el autor) descargando pesos a RAM del sistema sin renunciar a velocidad de generación, en un entorno de herramientas compatible con `llama.cpp`. La licencia es Apache-2.0 y declara soporte para 13 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer; el tag del autor indica `qwen35moe`, con 40 capas y 256 micro-expertos según la model card |
| Parámetros totales | 34.660.610.688 (dato real de safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) según la model card del cuantizador; no verificado con datos independientes |
| Tipos de cuantización | Mezcla por tensor: `IQ3_XXS` en expertos centrales (capas 10-29), `Q3_K` en expertos de borde (capas 0-9 y 30-39), `Q5_K` en experto compartido (`shexp`) de las 40 capas, `Q4_K` en proyecciones q/k/v de atención completa y `Q6_K` en su salida, `Q8_0` en puertas de atención (30 capas), `Q6_K` en `output.weight`, `F32` sin comprimir en enrutadores (`gate_inp`) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |
| Tamaño del repositorio | 15,4 GB |
| Tamaño del artefacto cuantizado | ~13,74 GiB (según la model card; +<180 MB sobre la edición V1) |
| Modelo base | nex-agi/Nex-N2.5-mini |
| Autor de la cuantización | IsValorum |
| Librería / runtime | gguf, llama.cpp |
| Pipeline | text-generation |
| Fecha de creación / actualización | 2026-09-18 / 2026-09-20 |
| Descargas / likes | 720 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo Mixture-of-Experts. Según la documentación del cuantizador, la red consta de 40 capas con 256 micro-expertos, combinación de expertos enrutados y un experto compartido (`shexp`) presente en todas las capas. La cuantización distingue entre expertos centrales (capas 10 a 29), a los que asigna `IQ3_XXS`, y expertos de borde (capas 0 a 9 y 30 a 39), a los que asigna `Q3_K`. Las capas con atención completa (3, 7, 11, ...) reciben `Q4_K` en las proyecciones q/k/v y `Q6_K` en la salida de atención, mientras que las puertas de atención se mantienen en `Q8_0`.

No se dispone de información sobre el proceso de entrenamiento del modelo base: no hay datos en la documentación proporcionada sobre número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. El tag `reasoning` de la tarjeta sugiere que el modelo base incorpora un modo de razonamiento explícito, pero su formato exacto no está descrito en la información disponible.

La innovación técnica de esta publicación es exclusivamente de cuantización, no de arquitectura. El autor sostiene que mantener los enrutadores (`gate_inp`) en `F32` sin comprimir elimina la deriva de enrutado (`routing drift`), es decir, garantiza que cada token se despache al mismo experto que lo haría con los pesos originales. También afirma que preservar los expertos compartidos en `Q5_K` en las 40 capas mejora la estabilidad en contexto largo, y que la elección de `IQ3_XXS`/`IQ3_S` como suelo para los expertos centrales evita el umbral de degradación que atribuye a las recetas comunitarias basadas en `IQ2_S`.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, con soporte declarado para el modo de pensamiento (`<think>`) del modelo base.
- Razonamiento ligado a código: el autor justifica explícitamente el blindaje de la cabeza de salida y de las puertas de atención para evitar errores de sintaxis, indentación rota y llaves desbalanceadas en salida de código.
- Capacidad multilingüe en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Inferencia en contexto largo, con la model card afirmando soporte de la ventana completa de 256K tokens cuando se despliega con descarga parcial o total a RAM del sistema.
- Compatibilidad con el ecosistema `llama.cpp`, por lo que hereda las capacidades del runtime: plantillas de chat, gramáticas, `imatrix` y ejecución híbrida CPU/GPU.
- No se documenta en la información proporcionada soporte de tool calling, function calling, agentes, visión ni audio. El tag `reasoning` es el único indicio de capacidades avanzadas, y no se detalla su alcance.

## Casos de uso

- Asistente de razonamiento en estación de trabajo de 24 GB: con `-ngl 99` el modelo cabe completo en VRAM (RTX 3090, RTX 4090, A10G, L4) y permite conversaciones multi-turno con razonamiento explícito sin coste de API. Es el escenario para el que el autor optimizó la receta.
- Análisis de documentos largos con descarga a RAM: para ventanas de 128K-256K tokens, el patrón propuesto es mantener el KV cache en VRAM y dejar que los pesos se transmitan desde RAM del sistema, lo que permite procesar contratos, expedientes o bases de código extensas en un equipo con 24 GB de VRAM y 64 GB de RAM DDR5.
- Generación y refactorización de código en local: el uso de `Q6_K` en `output.weight` y `Q8_0` en las puertas de atención está pensado para reducir errores de delimitadores y de indentación, lo que lo hace apto para autocompletado y generación de parches en un IDE o en un pipeline de CI/CD local sin enviar código a terceros.
- Despliegue en hardware de gama media con offload: en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) el modelo puede repartirse parcialmente entre VRAM y RAM, con velocidades declaradas de 24 a 28+ tok/s en streaming desde RAM, suficiente para asistentes interactivos.
- Traducción y atención al cliente multilingüe: la cobertura de 13 idiomas permite construir un asistente único para mercados europeos y asiáticos, manteniendo el contexto de conversación largo sin truncar el historial.
- Procesamiento por lotes offline: al ser un GGUF de ~13,74 GiB con licencia Apache-2.0, es adecuado para tareas de resumen, extracción estructurada o clasificación de documentos en cola sobre una sola GPU de 24 GB, sin coste por token.
- Entorno air-gapped o con requisitos de soberanía del dato: al ejecutarse íntegramente en local mediante `llama.cpp`, permite trabajar con información regulada (sanitaria, legal, financiera) sin salida de datos a servicios externos.
- Evaluación de recetas de cuantización: el repositorio publica el historial de optimización V1/V2/V2.1 con mapas de tensores, lo que lo convierte en material de referencia para quien investigue cuantización quirúrgica de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni pruebas equivalentes, ni para el modelo base ni para esta cuantización. El único dato cuantitativo aportado por el autor es una medición de perplejidad sobre el binario GGUF:

| Métrica | Valor declarado | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 6,4725 ± 0,1635 | Evaluada directamente sobre el GGUF, `ctx` 2048, 10 fragmentos |
| Delta de perplejidad frente al modelo sin cuantizar | ≈ +0,06 | Declarado por el autor |
| Throughput en streaming desde RAM del sistema | +24 a 28+ tok/s | Con descarga parcial/total a RAM; depende de arquitectura de CPU y ancho de banda de memoria (DDR4 dual-channel o DDR5 6000+ MT/s) |
| Throughput con descarga completa en GPU (`-ngl 99`) | "virtualmente idéntico" a la edición V1, sin cifra concreta | 24 GB+ de VRAM |

Estos valores proceden exclusivamente de la model card del cuantizador y no han sido verificados de forma independiente. No se aportan comparaciones con la perplejidad del modelo base sin cuantizar ni con otras recetas de cuantización medidas en las mismas condiciones.

## Requisitos de hardware

- VRAM mínima para descarga completa de pesos en GPU: en torno a 14-15 GB de pesos más el KV cache, por lo que 24 GB de VRAM (RTX 3090, RTX 4090, RTX 5090 de 32 GB, A10G, L4, A100 40/80 GB, H100) es el objetivo declarado por el autor.
- Uso con contexto completo de 256K: la model card afirma que es viable en una estación de trabajo de 24 GB dedicando la VRAM al KV cache de alto rendimiento y dejando los pesos en RAM del sistema. La memoria RAM necesaria para ello no se especifica; como mínimo hay que reservar espacio para ~14 GiB de pesos, por lo que 32 GB de RAM es el suelo razonable y 64 GB el escenario cómodo.
- GPU de consumo: cabe completo en RTX 3090 y RTX 4090 (24 GB) y en RTX 5090 (32 GB). En RTX 4080/4070 Ti (16 GB) y RTX 4060 Ti (16 GB) es necesario repartir capas entre VRAM y RAM. En GPUs de 8-12 GB solo es viable con offload agresivo y contextos moderados.
- Opciones de despliegue: `llama.cpp` (runtime de referencia para este formato), Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con la API de endpoints GGUF. El soporte de GGUF en vLLM es limitado y no se documenta en esta publicación; para servir a alta concurrencia el autor no ofrece instrucciones.
- Latencia y throughput: se declaran 24-28+ tok/s en streaming con pesos en RAM, y velocidad "cercana a la ejecución completa en VRAM" en configuraciones con DDR5 6000+ MT/s, pero no se publican cifras de latencia de primer token ni de throughput con descarga completa en GPU.
- Nota: el autor advierte que la receta está pensada para evitar paradas de descompresión AVX2 en CPU; en procesadores sin AVX2 el rendimiento del offload puede degradarse de forma apreciable.

## Comparativa con modelos similares

Los datos de la información proporcionada solo cubren este artefacto y su modelo base. Las filas de alternativas se incluyen a partir de conocimiento general y deben verificarse antes de tomar decisiones; no proceden de la búsqueda web realizada, que no devolvió resultados relevantes.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.5-mini APEX-I-MiniPlus V2.1 (este) | 34,66 B | no disponible | 256K (declarado) | Apache-2.0 | GGUF, ~13,74 GiB, cuantización artesanal |
| Nex-N2.5-mini MiniPlus V1 (mismo autor) | 34,66 B | no disponible | 256K (declarado) | Apache-2.0 | GGUF, ~13,56 GiB, sin expertos compartidos en `Q5_K` |
| Recetas APEX-I-Mini comunitarias | 34,66 B | no disponible | no disponible | Apache-2.0 (heredada) | GGUF ~12,5 GB, expertos en `IQ2_S` |
| Qwen3-30B-A3B (referencia de conocimiento general) | ~30,5 B | ~3,3 B | 128K | Apache-2.0 | safetensors y múltiples GGUF comunitarios |
| Mixtral 8x7B (referencia de conocimiento general) | ~46,7 B | ~12,9 B | 32K | Apache-2.0 | safetensors y GGUF comunitarios |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los datos de rendimiento, perplejidad, contexto de 256K y velocidades de generación provienen únicamente de la model card del autor de la cuantización. No están verificados de forma independiente y no se acompañan de la metodología completa ni de comparaciones con la línea base sin cuantizar.
- Toda cuantización introduce pérdida. Aunque el autor declara un delta de perplejidad de ≈ +0,06, no se publica la perplejidad absoluta del modelo original en las mismas condiciones, por lo que la magnitud real de la degradación no puede comprobarse.
- Riesgo de alucinación y de errores factuales propio de los modelos de razonamiento de este tamaño; no hay evaluación publicada de tasa de alucinación.
- Sesgos: no se documenta ningún análisis de sesgos, composición del dataset de entrenamiento ni proceso de alineación del modelo base. Se desconoce la distribución lingüística real del entrenamiento, y el soporte de los 13 idiomas declarados puede ser muy desigual en calidad.
- Contexto: los 262.144 tokens son una cifra declarada, y el rendimiento efectivo en ventanas muy largas no está medido con tareas de recuperación de información (`needle in a haystack`) ni similares.
- Sin capacidades multimodales ni de audio documentadas. No se especifica si el modelo base soporta tool calling; conviene verificarlo antes de integrarlo en flujos de agentes.
- La licencia Apache-2.0 permite uso comercial, pero corresponde al modelo base y a la cuantización; es responsabilidad del usuario verificar que el modelo `nex-agi/Nex-N2.5-mini` y los datos con los que se entrenó no imponen restricciones adicionales.
- Advertencia operativa del propio autor: no confundir esta edición con recetas comunitarias APEX-I-Mini genéricas, que comprimen los expertos a 2 bits y degradan la calidad. Si se descarga una cuantización equivalente de otro autor, los resultados pueden diferir sustancialmente.
- El repositorio tiene 0 likes y 720 descargas en el momento de redactar esta ficha, con un tamaño de 15,4 GB que incluye varias ediciones; conviene comprobar qué archivo GGUF concreto se descarga antes de desplegarlo.
- Ausencia de resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) tanto para el modelo base como para esta cuantización, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF
- Edición MiniPlus V1 del mismo autor: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- `llama.cpp` (runtime de referencia para GGUF): no se proporciona enlace en la información disponible
- Paper, blog técnico o demo del modelo base: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
