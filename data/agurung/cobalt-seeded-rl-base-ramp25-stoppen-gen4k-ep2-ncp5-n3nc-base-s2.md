# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s2

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) para generación de código, construido por el autor independiente Alexander Gurung (usuario `agurung`) sobre el modelo denso Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar GRPO con OpenRLHF directamente sobre el modelo base, sin semilla de SFT, y guardar el estado en el paso global 44 de la ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s2`. El autor lo etiqueta como el mejor checkpoint de esa ejecución medido por pass@8.

El modelo tiene 3.973.556.832 parámetros reales (≈4,0 B) según el index de safetensors, y hereda la arquitectura transformer decoder-only de la familia Qwen3, con una ventana de contexto que un índice de terceros (SAVRN) cifra en 262.144 tokens. La señal de recompensa es puramente binaria: 1,0 si el programa generado pasa los tests del problema y 0,0 en caso contrario, lo que lo convierte en un artefacto muy especializado en correctitud de código más que en un asistente conversacional generalista.

Su relevancia es fundamentalmente metodológica: es un ejemplo público de una receta de RL con penalización anti-truncamiento (estilo ProRL), penalización por longitud excesiva (estilo DAPO) y sin término KL, aplicada a un modelo de 4 B que cabe en una GPU de consumo. Los datos de evaluación de este checkpoint concreto no están publicados en la model card, y la licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, `nemotron_h` aparece como tag pero no es coherente con el modelo base) |
| Parametros totales | 3.973.556.832 (≈4,0 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (dato de un índice de terceros, SAVRN; no declarado en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; variantes hermanas con sufijos `q4v2`/`q4v3` sugieren cuantizaciones de 4 bits, pero no se documentan aquí) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el modelo base Qwen3-4B-Instruct-2507 se distribuye habitualmente bajo Apache 2.0, pero el autor no declara licencia para este checkpoint) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 151,0 GB |
| Descargas / likes | 19 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4 B de parámetros, sin mezcla de expertos y con el tokenizador y la ventana de contexto de dicha familia. Este repositorio no introduce cambios estructurales; es un ajuste de pesos por RL. El autor indica además que el punto de partida fue el modelo base Qwen3-4B sin semilla de SFT, aunque la model card también lista `Qwen/Qwen3-4B-Instruct-2507` como `base_model`, una ambigüedad que conviene verificar antes de reproducir el experimento.

El entrenamiento usó OpenRLHF con GRPO (ventajas normalizadas por grupo y sin penalización KL). La receta concreta incluye: 8 muestras por prompt, batch de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje de 1e-06 con planificador constante. La recompensa es binaria de correctitud de código. Se aplican dos mecanismos de modelado de longitud: una penalización "stop-properly" que asigna recompensa -1,0 a las muestras truncadas (estilo ProRL, anti-truncamiento) y una penalización DAPO que crece de forma aditiva hasta -0,25 para las respuestas que caen en los últimos 1024 tokens antes del límite.

El conjunto de entrenamiento y validación es el denominado "cobalt-train ≤2/64 frontier": problemas de código que el modelo base resolvía como máximo en 2 de 64 muestras bajo un escaneo de dificultad `iid_canonical@64`. Consta de 1833 problemas de entrenamiento y 112 de validación reservados, y la validación se muestrea a temperatura 1,0. No se menciona ningún dato sobre volumen total de tokens, composición lingüística del dataset ni etapas de RLHF/DPO adicionales.

## Capacidades

- Generación de código orientada a correctitud funcional: es la capacidad que el RL optimiza explícitamente mediante recompensa binaria de paso de tests.
- Resolución de problemas de programación de dificultad alta, definidos como aquellos que el modelo base acertaba en 2 o menos de 64 intentos.
- Generación de múltiples candidatos por problema (muestreo a temperatura), útil para pass@k y para selección por verificación con tests.
- Razonamiento multi-paso implícito en la generación de código largo: la configuración permite hasta 4096 tokens nuevos por respuesta.
- Generación de texto general: heredada del modelo base Qwen3-4B-Instruct-2507, aunque no se documenta su preservación tras el RL.
- Tool calling / function calling: no confirmado para este checkpoint; el modelo base de la familia Qwen3 lo soporta, pero la model card no lo menciona y el RL sobre código puede haber alterado ese comportamiento.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente; no se documentan plantillas de agente ni evaluaciones de ese tipo.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se documenta modo "thinking", visión ni audio. Los tags del repositorio incluyen `nemotron_h`, término incoherente con un modelo basado en Qwen3 y probablemente un artefacto de etiquetado.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en un pipeline que reciba un enunciado o una firma de función y devuelva una implementación; su ventaja es que fue optimizado con señal de correctitud contra tests, no solo con preferencia humana.
- Reparación automática de fallos con tests como verificador: dado un test que falla, se pueden generar N candidatos, ejecutarlos y quedarse con el primero que pase, aprovechando que el entrenamiento maximizó pass@8 en lugar de pass@1.
- Síntesis de tests unitarios y casos límite: el modelo puede producir baterías de pruebas a partir de una especificación, que después se usan como filtro automático del propio código generado.
- Investigación en RL para código: sirve como punto de comparación reproducible de GRPO sin KL, penalización ProRL de truncamiento y penalización DAPO de longitud, sobre un modelo de 4 B que cabe en una GPU de consumo.
- Punto de partida para RL posterior: al ser un checkpoint intermedio (paso global 44) de una ejecución con solo 2 episodios y LR 1e-06, es un candidato razonable para continuar el entrenamiento o para ablaciones sobre la frontera de dificultad "cobalt-train".
- Asistente de programación autoalojado: con pesos de ~9,5 GB en 16 bits se puede servir en una estación de trabajo con una sola GPU y sin enviar código a servicios externos, lo que resulta útil en entornos con requisitos de confidencialidad.
- Evaluación comparativa de modelos pequeños de código: útil en un arnés de evaluación propio (pass@k sobre un conjunto de problemas con tests) para medir cuánto aporta el RL frente al modelo base instruct.
- Generación de candidatos para clasificación posterior (best-of-n): combinado con un verificador o un modelo mayor que puntúe soluciones, reduce el coste de inferencia del modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card indica explícitamente que las métricas de evaluación de este paso no están en el registro de entrenamiento, y solo declara que es el mejor checkpoint por pass@8 de la ejecución.

Los únicos datos numéricos recuperados en la búsqueda web corresponden a una variante hermana distinta (`...ncp5-base-q4v2`), no a este repositorio, y se recogen aquí únicamente a título indicativo:

| Modelo | Metrica | Valor | Fuente |
|---|---|---|---|
| Este checkpoint (`...n3nc-base-s2`) | pass@8 en la frontera cobalt-train | No disponible (la model card no incluye métricas de este paso) | Model card |
| Sibling `...ncp5-base-q4v2` | pass@8 en cobalt-train frontier | 3,9063 (escala no definida en la fuente) | Ficha de Featherless |

No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar para este modelo.

## Requisitos de hardware

- Inferencia en 16 bits: aproximadamente 9,5 GB de VRAM según el índice de SAVRN, es decir, los pesos solos. Hay que sumar el KV cache.
- Inferencia en cuantización de 4 bits: no disponible como artefacto publicado; una estimación derivada del número de parámetros situaría los pesos en el entorno de 2,5-3 GB, pero no hay ficheros GGUF ni AWQ/GPTQ en el repositorio.
- Cabe en GPU de consumo: sí en 16 bits con holgura en RTX 4090, RTX 3090, RTX 4080 (16 GB justos, con poco margen para contexto largo) y en tarjetas profesionales como L40S o A100.
- Contexto largo: con 262.144 tokens de ventana teórica, el KV cache es el factor limitante real; para aprovechar esa longitud hacen falta GPU con 80 GB o varias GPU, y no se han publicado cifras de consumo de memoria por token.
- Despliegue: vLLM está soportado explícitamente (`vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s2 --revision main`), así como `transformers` con `AutoModelForCausalLM`. Para llama.cpp u Ollama habría que convertir los pesos a GGUF por cuenta propia, ya que no se publican.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: el repositorio ocupa 151,0 GB, presumiblemente por acumulación de revisiones; descargar solo la revisión `main` reduce el volumen necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...ncp5-n3nc-base-s2`) | 3,97 B | 262.144 (fuente de terceros) | RL GRPO sobre código, paso 44 | No disponible | HuggingFace, 19 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ≈4 B (heredado) | 262.144 (misma familia) | Instruct generalista | Apache 2.0 en la familia Qwen3 (no confirmado en este repo) | HuggingFace, ampliamente distribuido |
| Sibling `...ncp5-n3n-groot16` | No disponible | No disponible | Variante RL de la misma ejecución | No disponible | HuggingFace |
| Sibling `...ncp5-base-q4v3` | No disponible | No disponible | Variante RL de la misma ejecución | No disponible | HuggingFace |
| Sibling `...ncp5-n3nc-base` (sin sufijo `s2`) | 4 B | 262.144 (fuente de terceros) | RL GRPO sobre código | No disponible | HuggingFace y SAVRN |

Frente a un modelo de código de tamaño comparable de otra familia, la diferencia relevante no es de escala sino de naturaleza: aquí no hay un pipeline de datos de código a gran escala detrás, sino un RL acotado a 1833 problemas difíciles con recompensa de tests. No se dispone de datos de rendimiento comparables entre estas opciones.

## Limitaciones y advertencias

- Licencia no declarada: no hay término de uso publicado en el repositorio, lo que impide justificar un uso comercial sin consultar previamente al autor. El modelo base es de la familia Qwen3, pero eso no resuelve automáticamente la licencia del derivado.
- Checkpoint intermedio: corresponde al paso global 44 de una ejecución con solo 2 episodios y tasa de aprendizaje 1e-06. No es un modelo final pulido ni hay garantía de que el proceso haya convergido.
- Señal de recompensa muy estrecha: recompensa binaria de correctitud de código. Es esperable un deterioro en capacidades conversacionales, de formato y multilingües no evaluadas, un riesgo clásico de olvido catastrófico cuando no hay término KL ni semilla de SFT.
- Datos de evaluación ausentes: no se publican métricas de este checkpoint, y el dato de pass@8 disponible pertenece a una variante hermana distinta.
- Idiomas no declarados: no hay evidencia de soporte multilingüe ni de que el castellano se haya preservado tras el RL.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir APIs, funciones o dependencias inexistentes, especialmente fuera de la distribución de los problemas de entrenamiento. Su uso en producción debería ir acompañado de ejecución real de tests.
- Metadatos inconsistentes: los tags incluyen `nemotron_h`, lo que no encaja con un modelo basado en Qwen3 y sugiere un etiquetado automático poco fiable. Conviene verificar la configuración real del modelo antes de integrarlo.
- Contexto no verificado: los 262.144 tokens proceden de un índice de terceros, no de la model card; el coste real en memoria del KV cache a esa longitud no está documentado.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en hardware modesto sin trabajo adicional.
- Repositorio de 151 GB: el tamaño total puede complicar la descarga, el versionado y el almacenamiento en espejos locales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Sibling `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3`: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v3
- Sibling `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3n-groot16`: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3n-groot16
- Variante hermana con datos de pass@8 (`...ncp5-base-q4v2`): https://featherless.ai/models/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-base-q4v2
- Ficha de la variante sin sufijo `s2` en SAVRN: https://savrn.com/models/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base
- Ficha de la variante `n3nc-iid16-s2` en SAVRN: https://savrn.com/models/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-iid16-s2
- Registro de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base_s2` (no se proporciona URL directa)
