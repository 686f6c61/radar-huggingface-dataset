# argentislabs/Argentis-Decision-4B

## Resumen

Argentis-Decision-4B es un ajuste fino de Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros, licencia Apache-2.0) desarrollado por Argentis Labs para una tarea muy concreta: emitir una decisión estructurada en JSON sobre expedientes reglados y, cuando el expediente no contiene la evidencia necesaria, abstenerse y citar explícitamente el dato que falta. No es un asistente general ni un modelo de chat: su salida es un objeto con los campos `decision`, `status` (`resolved` o `abstain`), `evidence` y `rules_applied`, sin campo de confianza autoinformada.

El interés del modelo es metodológico más que de rendimiento bruto. Sobre el protocolo congelado `argentis-decision-bench` (1.599 casos de test, dominio de tasas de equipaje aéreo, inglés), tanto el Qwen3-4B-Instruct original como una referencia Qwen3-30B-A3B obtienen un 0,0 % de decisiones válidas y fundamentadas y 0 abstenciones correctas sobre 300 casos irresolubles; este ajuste alcanza un 21,0 % en el compuesto y 298/300 abstenciones correctas con 0/1.299 falsas abstenciones. La contrapartida es que la precisión exacta de decisión es solo del 2,9 %, de modo que el compuesto está dominado (~89 %) por la competencia de abstención.

Se entrenó con QLoRA SFT (base en nf4, LoRA r=16/alpha=32 sobre todas las capas lineales, una época, loss solo en la completación) sobre 3.000 pares prompt/completion generados programáticamente a partir de las primeras 1.000 filas del split de entrenamiento del propio benchmark, con aumentación contrafactual. El resultado es un artefacto de investigación sobre abstención selectiva y decisión fundamentada en evidencia, no una calculadora de tarifas lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3, ajustado mediante QLoRA; número de capas y cabezas no disponible en la información proporcionada |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen3-4B-Instruct-2507, cuya documentación declara 262.144 tokens |
| Tipos de cuantizacion | Pesos publicados en bf16; base cuantizada en nf4 durante el entrenamiento. No se publican GGUF, GPTQ ni AWQ oficiales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3) |
| Formato de pesos | safetensors (bf16, delta LoRA fusionado en los pesos completos) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (revisión `cdbee75f…`, Apache-2.0, bf16) |
| Método de ajuste | QLoRA SFT supervisado, sin destilación ni señal de profesor |
| Versión | `v1.0-sft` (etiquetada por revisión) |
| Tamaño del repositorio | 8,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B-Instruct-2507 sin modificaciones estructurales: un transformer denso en bf16 al que se le aplica un ajuste QLoRA con cuantización nf4 del modelo base, LoRA de rango 16 y alpha 32 sobre todas las capas lineales, una sola época y función de pérdida calculada únicamente sobre la completación. El delta LoRA (adapter `eceb31ac…`) se fusionó posteriormente en pesos bf16 completos, que son los publicados en el repositorio, con hashes por shard (`6e1ca2a638ba44e1…`).

Los datos de entrenamiento son 3.000 pares prompt/completion derivados de forma determinista de las primeras 1.000 filas del split `train` del benchmark (sha `55ca6d99…`): cada caso original más una variante de abstención generada eliminando una entrada requerida y una variante de ruido, ambas sembradas. El split de test congelado y todas sus variantes quedaron excluidos mediante deduplicación por info-hash, sin colisiones. La innovación técnica no está en el entrenamiento sino en el protocolo de evaluación: un scorer versionado (s1.1.0) con umbral pre-registrado (Gate C: el ajuste debía superar al base en ≥ ~20 puntos en el compuesto) y una re-ejecución limpia 33 días después, en una instancia distinta, que reprodujo las métricas una a una (`20261017T162706Z-s7-cuda-sft_realcf` frente a `20260914T202702Z-s7-cuda-sft_realcf`).

## Capacidades

- Decisión estructurada en JSON: dado un texto de reglas, un registro de caso y un inventario de evidencia, emite un objeto con `decision`, `status`, `evidence` y `rules_applied`.
- Abstención selectiva fundamentada: ante un registro estructuralmente insuficiente devuelve `decision: null`, `status: "abstain"` y nombra el campo ausente (por ejemplo `field:bag_e03_weight`).
- Citación de evidencia: identifica las entradas concretas del inventario utilizadas (`bag:E02`, `field:customer_class`).
- Trazabilidad de reglas: lista las reglas aplicadas del texto normativo (`overweight fee schedule`, `overall fee aggregation`).
- Salida escalar con unidad: soporta valores numéricos tipados con unidad explícita (`{"kind": "scalar", "value": 1245.0, "unit": "USD"}`).
- Generación de texto conversacional: heredada del modelo base, aunque fuera del propósito del ajuste.
- Capacidades no verificadas en la información disponible: tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, modo thinking explícito y multilingüismo. La model card no reporta evaluación de ninguna de ellas y el modelo está entrenado solo en inglés.

## Casos de uso

- Triaje de expedientes con derivación a humano: el modelo actúa como puerta previa; si el registro está incompleto, devuelve `abstain` junto al campo exacto que falta, lo que permite generar automáticamente la petición de documentación al cliente sin intervención manual.
- Investigación en selective prediction: sirve como banco de pruebas reproducible (protocolo congelado, scorer con digest dorado, revisión etiquetada) para medir si un modelo concreto abstiene de forma correcta y compararlo contra el base sin ajustar.
- Validación de completitud documental en intake: comprobar, antes de invocar un solver determinista, si el inventario de evidencia contiene todos los campos que las reglas requieren, evitando ejecutar cálculos sobre datos incompletos.
- Puerta de enriquecimiento en pipelines híbridos LLM más solver: el modelo emite el JSON con evidencia y reglas aplicadas, y un componente determinista posterior realiza la aritmética; el LLM no calcula, solo estructura y decide si procede.
- Auditoría y trazabilidad de decisiones: los campos `evidence` y `rules_applied` permiten reconstruir por qué se resolvió o se rechazó un caso, útil en dominios regulados donde se exige justificar la abstención.
- Generación de datos contrafactuales para abstención: la receta de aumentación (eliminar una entrada requerida, añadir ruido) es reutilizable para construir conjuntos de entrenamiento de abstención en otros dominios reglados como seguros, aduanas o tributación.
- Evaluación comparativa de modelos base: usar el mismo protocolo y el mismo scorer para medir la tasa de falsa abstención de otros modelos antes de desplegarlos en flujos con derivación humana.

## Benchmarks y rendimiento

Protocolo congelado `4a8363c6…`, 1.599 casos de test, decodificación greedy, 512 tokens nuevos máximo, scorer s1.1.0, hardware clase A100-80GB. Re-ejecutado sobre el checkpoint publicado.

| Metrica | Base 4B | Referencia 30B-A3B | Argentis-Decision-4B |
|---|---|---|---|
| Decisiones válidas y fundamentadas (compuesto) | 0,0 % | 0,0 % | 21,0 % |
| Abstención correcta (n/300 irresolubles) | 0/300 | 0/296 | 298/300 |
| Falsa abstención (n/1.299 resolubles) | 0/1.299 | 0/1.238 | 0/1.299 |
| Precisión exacta de decisión | 0,0 % | 0,0 % | 2,9 % |
| Error mediano de decisión | −1.815 USD | −1.758 USD | +50 USD |
| Dependencia espuria | 45,5 % | 54,1 % | 54,3 % |

Lectura honesta del compuesto, según el propio autor: ~89 % de los casos que pasan lo hacen por competencia de abstención; restringido a casos resolubles, el compuesto equivale a la precisión exacta (2,9 %). No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: ~8,05 GB solo de pesos (4,02 B × 2 bytes); con overhead de runtime y caché KV, entre 9 y 12 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: ~4,5-5,5 GB; en nf4 (4 bits): ~2,5-3,5 GB.
- GPU de referencia usada en la evaluación: clase A100-80GB, decodificación greedy y 512 tokens nuevos.
- GPU de consumo: cabe holgadamente en una RTX 4090 (24 GB) o RTX 4080 (16 GB) en bf16; en RTX 3090/4090 también con lote amplio. Con cuantización de 8 o 4 bits entra en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070 8 GB en 4 bits).
- Opciones de despliegue: transformers con bitsandbytes (nf4/8 bits) es la vía directa al no haber GGUF oficial; vLLM y TGI soportan la arquitectura Qwen3 para servicio en bf16; llama.cpp y Ollama requieren convertir los pesos a GGUF por cuenta propia, ya que el autor no publica ese formato.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, la evaluación fija `max_new_tokens=512` y decodificación greedy, pero no se reportan tokens por segundo ni latencia por caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compuesto en el protocolo | Precision exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Argentis-Decision-4B | 4,02 B (denso) | no disponible (base: 262.144) | 21,0 % | 2,9 % | Apache-2.0 | Pesos bf16 en HuggingFace |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B (denso) | 262.144 | 0,0 % | 0,0 % | Apache-2.0 | Pesos en HuggingFace |
| Qwen3-30B-A3B (referencia del autor) | ~30 B totales, MoE | no disponible en la información | 0,0 % | 0,0 % | Apache-2.0 | Pesos en HuggingFace |

La comparación relevante no es de capacidad general sino de comportamiento: los tres modelos son prácticamente idénticos en el compuesto si no se cuenta la abstención, y solo el ajuste de Argentis Labs rechaza sistemáticamente los registros irresolubles. En dependencia espuria el ajuste (54,3 %) está al nivel de la referencia de 30B (54,1 %) y por encima del base (45,5 %), lo que indica que el ajuste no mejora la estabilidad de las respuestas ante perturbaciones irrelevantes. No se dispone de comparaciones con otras familias (Llama, Mistral, Gemma) en la información proporcionada.

## Limitaciones y advertencias

- Aritmética de tarifas débil: ~3 % de precisión exacta. El propio autor lo describe como artefacto de investigación sobre abstención, no como calculadora de tasas en producción.
- Sensibilidad a la presentación sin resolver: las respuestas en dólares varían ante perturbaciones irrelevantes (reordenación, reetiquetado) a tasas comparables a las de los modelos sin ajustar. No asumir estabilidad ante paráfrasis.
- Abstención entrenada sobre una única familia de transformaciones (eliminación de una entrada requerida) y en un único dominio. La generalización fuera de la distribución superficial de esa transformación no está demostrada.
- Dominio único: tasas de equipaje aéreo, en inglés, con decodificación greedy según el protocolo. No hay evidencia de transferencia a otros dominios reglados.
- Dependencia espuria del 54,3 %, superior a la del modelo base; es un indicador de que el modelo puede apoyarse en señales irrelevantes del enunciado.
- Sin campo de confianza: la abstención se dispara por insuficiencia estructural del registro, no por incertidumbre calibrada. La calibración se declara trabajo futuro.
- No es un modelo de detección de intenciones ni un asistente general; usarlo como chatbot o para tool calling no está respaldado por ninguna evaluación publicada.
- Idiomas: solo inglés. El rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será pobre para la tarea de decisión.
- Licencia Apache-2.0 permite uso comercial, pero los casos del benchmark derivan de RuleArena (MIT, commit `59f60f6…`); conviene revisar la procedencia de los datos si se redistribuyen derivados.
- Trazabilidad de la versión: la model card de `main` describe la release etiquetada; fijar la revisión `v1.0-sft` para reproducir resultados.
- Cero descargas y cero likes en el momento de la ficha: ecosistema de validación externa inexistente, sin reproducibilidad independiente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/argentislabs/Argentis-Decision-4B
- Dataset y benchmark: https://huggingface.co/datasets/argentislabs/argentis-decision-bench
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Pipeline de evaluación: incluido en el repositorio del dataset (`eval.py` y wheel autoverificable `argentis_decision-0.6.0-py3-none-any.whl`)
- White paper WP04, "Scored Abstention: Evidence-Grounded Decisioning in a 4B Model": anunciado como próximo, sin URL disponible
- RuleArena (MIT, commit `59f60f6…`): origen de los casos del benchmark, sin URL en la información proporcionada
