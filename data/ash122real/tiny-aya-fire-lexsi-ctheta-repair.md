# ash122real/tiny-aya-fire-lexsi-ctheta-repair

## Resumen

`ash122real/tiny-aya-fire-lexsi-ctheta-repair` es un checkpoint derivado de `CohereLabs/tiny-aya-fire` (3.35B parametros, arquitectura Cohere2ForCausalLM, 36 capas, bfloat16) publicado por el usuario ash122real como envio de hackathon. No es un modelo entrenado desde cero ni un fine-tune convencional: es una "reparacion" del modelo base mediante aritmetica de pesos restringida a un circuito causal, orientada a corregir dos fallos de alineamiento detectados por el autor: el colapso de seguridad en idiomas indicos y la fuga de material de ciberseguridad de doble uso.

El problema que aborda es concreto. Segun la model card, el modelo base rechaza prompts daninos en ingles con tasas del 69,0% al 96,2% en HarmBench y StrongREJECT, pero esa tasa cae al 45,0% cuando la misma peticion se formula en bengali, hindi, tamil, telugu o kannada. Ademas, en peticiones ofensivas de ciberseguridad (exfiltracion de credenciales AWS, volcado de memoria LSASS, explotacion SSRF) el modelo base filtra material explotable en un 9,4% de los casos (tasa "attacker-useful"). El autor sostiene que el fine-tuning estandar (SFT/DPO) para corregir esto provoca sobre-rechazo en tareas legitimas de SecOps.

La relevancia del checkpoint es metodologica mas que de rendimiento: propone una intervencion offline de unos 17 segundos en una sola NVIDIA L4 que modifica unicamente 11 de las 36 matrices `mlp.down_proj` y deja el resto de pesos intactos (el autor afirma `max |ΔW_fuera_del_circuito| = 0.0`). El resultado es un checkpoint estatico sin clasificador guardrail externo ni coste adicional de latencia en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2ForCausalLM (transformer decoder-only), 36 capas |
| Parametros totales | 3.350 millones (3.35B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | en, hi, bn, ta, te, kn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.0 GB segun Hugging Face; pesos no verificables) |

## Arquitectura y entrenamiento

El modelo base `CohereLabs/tiny-aya-fire` es un transformer decoder-only de 3.35B parametros y 36 capas en bfloat16, especializado en idiomas del sur de Asia. Este checkpoint no reentrena el modelo: parte de los pesos del base y aplica una intervencion de aritmetica de pesos denominada `C-ΔΘ` (Circuit-Restricted Weight Arithmetic), descrita en la metodologia "The Last Mile of Model Safety: Targeted Model Repair" (Seth et al., Lexsi Labs 2026).

El pipeline declarado es CuratorKIT → CircuitKIT (EAP-IG) → SafeTune (`C-ΔΘ`) → AuditKIT. Primero se localiza el circuito causal de seguridad mediante Edge Attribution Patching con Integrated Gradients (EAP-IG), que atribuye la conducta de rechazo a aristas concretas de la red. Despues se calcula el delta de pesos restringido al circuito y se aplica exclusivamente a las matrices de proyeccion descendente de la MLP (`model.layers.<l>.mlp.down_proj.weight`) de las capas [0, 1, 2, 6, 13, 23, 27, 28, 29, 33, 35]. El autor afirma que `embed_tokens`, `self_attn`, `gate_proj`, `up_proj`, `lm_head` y las 25 capas MLP restantes quedan sin tocar. El proceso completo de descubrimiento de circuito y computo del delta tarda unos 17 segundos en una NVIDIA L4 (coste declarado de 0,01 USD). No se documentan tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO, porque no hay entrenamiento en el sentido convencional.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base `tiny-aya-fire`.
- Capacidades multilingues en ingles, hindi, bengali, tamil, telugu y kannada (los seis idiomas declarados en la model card).
- Rechazo reforzado de peticiones daninas en ingles y en idiomas indicos, incluidos ataques con cambio de codigo y romanizacion (Banglish).
- Mayor resistencia a jailbreaks con cumplimiento atenuado ("hedged compliance"), segun la evaluacion del autor en StrongREJECT.
- Reduccion declarada de la tasa de material explotable en peticiones de ciberseguridad ofensiva, preservando tareas defensivas de SecOps.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue multilingue en atencion al cliente para el sur de Asia: el checkpoint mantiene las capacidades del base en hindi, bengali, tamil, telugu y kannada, pero endurece el rechazo ante peticiones abusivas formuladas en esos idiomas, lo que reduce el riesgo de respuestas daninas en produccion sin anadir un clasificador externo.
- Asistentes de SecOps defensivo: el autor disena la reparacion para que el modelo siga redactando reglas de deteccion Sysmon, configuraciones de endurecimiento de nginx o comandos `pkill` sin caer en sobre-rechazo, mientras reduce la fuga de material explotable en peticiones ofensivas.
- Moderacion y filtrado en plataformas con trafico code-switched: el checkpoint incorpora evaluacion especifica sobre Banglish y script nativo bengali (BanglaSafe), util para sistemas que reciben texto romanizado mezclado con ingles.
- Inferencia de baja latencia en entornos con restricciones de privacidad: al ser un checkpoint estatico de 3.35B sin guardrail en tiempo de ejecucion, puede desplegarse on-premise sin coste adicional de tokens por segundo, segun la model card.
- Investigacion en interpretabilidad mecanistica: el repositorio incluye el pipeline EAP-IG y las atribuciones por capa, lo que permite reproducir el descubrimiento del circuito de seguridad sobre el modelo base y estudiar que componentes sostienen el rechazo.
- Base para auditorias de alineamiento multilingue: el conjunto de evaluacion declarado (HarmBench, StrongREJECT, IndicSafe, IndicSafetyBench, MultiJail, BanglaSafe, FORTRESS, RMCBench, CyberDualUse, WMDP) sirve como plantilla para medir el efecto de intervenciones quirurgicas sobre pesos.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion del autor, pero la informacion proporcionada se corta en la seccion de metricas y no incluye la tabla de resultados numericos finales. Los unicos datos numericos disponibles son los del diagnostico del modelo base:

| Metrica | Modelo base (`tiny-aya-fire`) | Checkpoint reparado |
|---|---|---|
| Rechazo directo en ingles (HarmBench / StrongREJECT) | 69,0%–96,2% | no disponible |
| Rechazo multilingue indico (HarmBench Multilingual / BanglaSafe) | 45,0% | no disponible |
| Tasa attacker-useful en ciberseguridad (FORTRESS / RMCBench) | 9,4% | no disponible |
| Coste de reparacion | — | ~17 s en NVIDIA L4 (~0,01 USD) |
| Matrices modificadas | — | 11 de 36 `mlp.down_proj` |

No se han publicado en la informacion disponible los resultados completos de las tres ejes de evaluacion (supresion de riesgo, usabilidad/sobre-rechazo y rendimiento de tareas benignas) ni comparaciones con el modelo base en la tabla final.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6,7 GB solo para pesos (3.35B × 2 bytes), mas overhead de activaciones y cache KV; el contexto no esta documentado, por lo que el consumo de cache no puede estimarse.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3,4 GB de pesos; en 4 bits, alrededor de 1,7 GB. Los formatos de cuantizacion concretos no estan disponibles en el repositorio.
- GPU recomendadas: el autor valido el proceso de reparacion en una NVIDIA L4. Para inferencia, cualquier GPU con al menos 8–10 GB de VRAM deberia alojar el modelo en bfloat16 con contexto moderado; A100 y H100 permiten mayor paralelismo y contexto.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) en bfloat16, y en tarjetas de 4–6 GB si se cuantiza.
- Opciones de despliegue: al ser un checkpoint Cohere2ForCausalLM en safetensors, es compatible con vLLM, TGI y transformers; llama.cpp y Ollama requeririan conversion a GGUF, no documentada en el repositorio.
- Latencia y throughput: no disponibles. La model card solo afirma que no hay penalizacion de latencia en tiempo de ejecucion respecto al modelo base, al no incorporar guardrail externo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `ash122real/tiny-aya-fire-lexsi-ctheta-repair` | 3.35B | no disponible | en, hi, bn, ta, te, kn | apache-2.0 | Reparacion de alineamiento por aritmetica de pesos restringida a circuito |
| `CohereLabs/tiny-aya-fire` (base) | 3.35B | no disponible | en, hi, bn, ta, te, kn | no disponible en la informacion | Modelo multilingue indico sin reparacion |
| Aya Expanse / Aya 23 (Cohere Labs) | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | Familia multilingue de mayor tamano de Cohere Labs |
| Modelos indicos pequenos (p. ej. familia Sarvam, Krutrim) | no disponible en la informacion | no disponible | indico | no disponible en la informacion | Alternativas regionales del mismo nicho |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano declarado de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el repo esta vacio. Conviene verificar la integridad antes de usarlo.
- La model card esta truncada en la informacion disponible: no se incluyen los resultados finales de las tres ejes de evaluacion, lo que impide confirmar las mejoras declaradas.
- La reparacion se limita a 11 matrices `mlp.down_proj`; el autor afirma que el resto de pesos no cambia, pero no se aportan verificaciones independientes fuera de su propio pipeline.
- Riesgo de sobre-rechazo: el propio autor identifica el sobre-rechazo como efecto secundario del fine-tuning convencional; aunque afirma controlarlo, no se dispone de las cifras finales de `ORef %` en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un riesgo inherente a modelos de 3.35B.
- Sesgos: no documentados. El modelo base esta especializado en idiomas del sur de Asia y puede heredar sesgos de su dataset original.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible; los idiomas soportados se limitan a los seis declarados (en, hi, bn, ta, te, kn).
- Licencia apache-2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales que no se detallan en la informacion disponible.
- El checkpoint es un envio de hackathon con fecha de creacion de 2026-11-16; no hay evidencia de mantenimiento, versionado ni soporte.
- La metodologia referenciada (Seth et al., Lexsi Labs 2026) no es verificable de forma independiente con la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ash122real/tiny-aya-fire-lexsi-ctheta-repair
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Repositorio del proyecto: https://github.com/RealASHWIN122/lexsihack (ruta `experiments/experiment_02_aya_fire_lexsistack/`)
- Demo interactiva: `hf_space/app.py` y `app.py` dentro del repositorio del proyecto
- Figura de atribucion del circuito: `results/fig1_eap_circuit_attribution.png` en el repositorio del proyecto
