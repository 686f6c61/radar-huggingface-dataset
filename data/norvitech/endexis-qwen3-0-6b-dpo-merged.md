# NorviTech/endexis-qwen3-0.6b-dpo-merged

## Resumen

ENDEXIS (`NorviTech/endexis-qwen3-0.6b-dpo-merged`) es un modelo de lenguaje de 596.049.920 parámetros (aproximadamente 606M en BF16) especializado en la generación de código y artefactos de inteligencia de esquemas para el ecosistema Oracle Health / Cerner Millennium V500. Lo desarrolla NorviTech, un proyecto independiente de código abierto liderado por Spencer Norton, y se distribuye bajo licencia Apache 2.0. El modelo actúa como un "compilador neuronal" para Discern Analytics 2.0 (DA2), Cerner Command Language (CCL), HealtheIntent EDW, PowerInsight y la generación de informes Eclipse BIRT 4.4.2.

El modelo parte de `Qwen/Qwen3-0.6B` como base y se afina en dos etapas: un SFT multi-tarea sobre 4.486 ejemplos verificados por verificadores deterministas, seguido de un DPO anclado en RPO con 185 pares de preferencia. El resultado es un checkpoint fusionado (adaptadores LoRA de rango 16 integrados en BF16) que incorpora trazas de razonamiento `<reasoning>` en el 100% de sus ejemplos de entrenamiento y que se distribuye también en formato GGUF (q8_0 y q4_k_m) para inferencia en CPU sin GPU.

Su relevancia radica en dos factores: por un lado, ataca un nicho vertical muy específico (compilación de informes clínicos y consultas CCL/DA2) con un modelo extremadamente pequeño que cabe en cualquier portátil; por otro, incorpora un diseño "tenant-agnostic" con auditoría de seguridad en cuatro puertas que verifica la ausencia de identificadores de inquilino codificados de forma fija en los pesos y en el corpus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 28 capas, 310 tensores safetensors |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantización | BF16 (nativo), GGUF q8_0, GGUF q4_k_m |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 1.136,91 MB), GGUF (q8_0 639.447.232 bytes; q4_k_m 396.705.984 bytes) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: un transformer decoder-only denso de 28 capas con 596.049.920 parámetros, sin mezcla de expertos. El entrenamiento se realizó en dos etapas sobre el checkpoint base de Qwen. La primera etapa consistió en un SFT multi-tarea de 740 pasos distribuidos en 27 familias de tareas, construido a partir de 4.486 ejemplos verificados por verificadores deterministas y con cobertura del 100% de trazas `<reasoning>`. La pérdida de validación bajó de 4,0831 a 0,3322 y la perplejidad de validación de 59,3282 a 1,3941.

La segunda etapa aplicó un DPO contrastivo anclado en RPO con 185 pares de preferencia, `beta=0.25`, `lr=8e-6`, `rpo_alpha=0.5` y 2 épocas. La perplejidad de validación resultante fue de 1,4218, con una precisión de preferencia del 100,0% y un margen medio de log-probabilidad de +21,2217 (frente a +0,9218 del modelo base). Los adaptadores LoRA (rango 16, alpha 32, 196 proyecciones lineales, delta Frobenius máximo 8,2156) se fusionaron en un `model.safetensors` BF16 autónomo con SHA-256 `3b70bc09a2836fb643f77a8fe270dc92a5521cff98740e92a407b7184dfba91d`. Una innovación destacable es la auditoría de liberación en cuatro puertas (denylist de repositorio y corpus, invariantes estructurales tenant-agnostic, auditoría de cabecera binaria y tabla de cadenas, y canario conductual adversarial en GPU con 32 prompts) que reporta cero violaciones en todas ellas.

## Capacidades

- Generación de código CCL (Cerner Command Language) para consultas y scripts sobre Millennium V500.
- Generación de definiciones de informes DA2 (Discern Analytics 2.0) con campos clínicos como MRN, FIN, unidad de enfermería y médico responsable.
- Generación de plantillas de informe Eclipse BIRT 4.4.2 (XML/estructura de informe).
- Razonamiento explícito mediante trazas `<reasoning>` antes de la respuesta final.
- Compilación de esquemas y consultas SQL sobre HealtheIntent EDW y PowerInsight.
- Inyección de configuración de inquilino en tiempo de ejecución (`TenantConfig`) para campos `Enc Loc*` (Facility, Building, Nurse Unit, Room, Bed) y filtros asociados.
- Conversación multi-turno con plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`).
- Inferencia en CPU sin GPU mediante GGUF y Ollama.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Generación de informes de censo de pacientes ingresados en DA2: el modelo produce la definición del informe con unidad de enfermería, MRN, FIN y médico responsable a partir de una instrucción en lenguaje natural, lo que acelera la creación de informes operativos en entornos Millennium.
- Asistencia a analistas de datos clínicos en la escritura de consultas CCL: dado un requisito funcional, el modelo genera el script CCL con conversión horaria (`cclsql_utc_cnvt(<col>, 1, 54)`) y filtros de localización inyectables por inquilino.
- Migración y refactorización de informes BIRT: el modelo puede generar y adaptar plantillas XML de Eclipse BIRT 4.4.2, reduciendo el trabajo manual de reconstrucción de informes heredados.
- Despliegue en entornos sin GPU: gracias a los GGUF q4_k_m (378,3 MiB) y q8_0 (609,8 MiB), puede ejecutarse en portátiles y estaciones clínicas con `llama.cpp` u Ollama, lo que facilita su uso en hospitales con hardware limitado.
- Validación de esquemas y consultas en pipelines de CI: al ser determinista con `do_sample=False` y tener un tamaño reducido, puede integrarse como verificador de sintaxis CCL/DA2 en flujos de integración continua.
- Formación y soporte a desarrolladores de Millennium: sirve como asistente conversacional especializado que explica la estructura de DA2, CCL y BIRT con trazas de razonamiento auditables.
- Prototipado rápido de informes PowerInsight y HealtheIntent EDW: el modelo genera borradores de consultas SQL y definiciones de métricas que luego un analista revisa antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta métricas internas de entrenamiento y validación:

| Métrica | Valor |
|---|---|
| Pérdida SFT validación (inicio → fin) | 4,0831 → 0,3322 |
| Perplejidad SFT validación (inicio → fin) | 59,3282 → 1,3941 |
| Perplejidad validación tras DPO | 1,4218 |
| Precisión de preferencia DPO | 100,0% (1,0000) |
| Margen medio log-probabilidad DPO | +21,2217 (base: +0,9218) |
| Violaciones auditoría de liberación (4 puertas) | 0 |

## Requisitos de hardware

- VRAM para BF16: aproximadamente 2,3 GB para pesos (1,14 GB de safetensors más overhead de activaciones y KV cache), holgado en cualquier GPU consumer con 4 GB o más.
- VRAM para GGUF q8_0: aproximadamente 0,7 GB; para q4_k_m: aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también A100/H100 para despliegues por lotes, aunque el modelo está pensado para hardware modesto.
- Cabe en cualquier GPU consumer e incluso en CPU pura: la model card incluye instrucciones para ejecutarlo con `llama-server -ngl 0` (sin offload a GPU) y con Ollama.
- Opciones de despliegue: `transformers` (BF16), `llama.cpp` (GGUF), Ollama (`Modelfile` incluido), LM Studio, y text-generation-inference (según los tags del repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| ENDEXIS (este modelo) | 596M | No disponible | Apache 2.0 | Cerner Millennium, CCL, DA2, BIRT | HF + GGUF + Ollama |
| Qwen/Qwen3-0.6B (base) | 596M | No disponible | Apache 2.0 | Propósito general | HF |
| AIPlans/Qwen3-0.6B-DPO | ~596M | No disponible | No disponible | Propósito general con DPO | HF |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre otros modelos especializados en Cerner Millennium con los que contrastar parámetros, contexto o rendimiento. No disponible información de benchmarks comparativos.

## Limitaciones y advertencias

- Modelo de 596M parámetros: su capacidad de razonamiento general y de conocimiento del mundo es muy limitada en comparación con modelos de mayor tamaño; está diseñado para una tarea vertical concreta.
- Riesgo de alucinación en nombres de tablas, columnas o funciones CCL no vistas durante el entrenamiento; se recomienda validación determinista antes de ejecutar código generado en producción.
- La model card no declara los idiomas soportados; el entrenamiento parece centrado en inglés técnico y en el dominio Cerner, por lo que el rendimiento en castellano no está garantizado.
- La longitud de contexto no se declara explícitamente; el ejemplo de `llama.cpp` usa 4096 tokens, lo que sugiere un contexto efectivo modesto.
- Aunque la licencia es Apache 2.0, el modelo genera código y artefactos para productos de Oracle; el aviso de marca indica que el proyecto no está afiliado ni respaldado por Oracle Corporation, y el uso de las marcas registradas puede estar sujeto a restricciones independientes.
- El diseño tenant-agnostic se verificó mediante auditorías internas del autor; no hay validación independiente de terceros publicada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe comunidad ni retroalimentación pública sobre su comportamiento en producción.
- El uso de `do_sample=False` es el recomendado en los ejemplos; la generación estocástica podría degradar la precisión en la sintaxis CCL/DA2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/endexis-qwen3-0.6b-dpo-merged
- Repositorio del compilador determinista: https://github.com/spencernorton/endexis
- NorviTech Suite: https://norvitech.com/
- Conductor (NorviTech): https://norvitech.com/conductor/
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante DPO de referencia: https://huggingface.co/AIPlans/Qwen3-0.6B-DPO
- Wikipedia de Qwen: https://en.wikipedia.org/wiki/Qwen
