# rahulratan/polyglot-mansu-tiny-aya-fire

## Resumen

Polyglot-MANSU Tiny Aya Fire es un repositorio de auditoria, verificacion y configuracion de un sistema de *machine unlearning* (desaprendizaje automatico) construido sobre el modelo denso CohereLabs/tiny-aya-fire de 3,35 mil millones de parametros. Lo desarrolla el usuario rahulratan en el marco del track 2b, problema numero 7 (Machine Unlearning) del Lexsi AI Safety & Alignment Hackathon, organizado por Lexsi Labs, Cohere Labs y Hugging Face. El objetivo es eliminar de forma verificable conocimiento factual concreto de un modelo multilingue y demostrar, con recibos criptograficos, que esa informacion no reaparece ni siquiera bajo ataques en varios idiomas o tras cuantizacion agresiva.

El punto critico para cualquier evaluador es que este repositorio no contiene pesos descargables. Segun la propia model card, los experimentos de desaprendizaje se ejecutaron en memoria sobre dos GPU Tesla T4 y se verificaron con la herramienta AuditKIT v1.1.7; no se serializaron ni exportaron adaptadores ni pesos completos. Lo que se publica son configuraciones, metadatos del entorno de ejecucion y recibos JSON verificados criptograficamente, pensados para reproducibilidad cientifica.

Su relevancia actual es metodologica: propone un marco de seis pilares para auditar desaprendizaje en modelos multilingues y resistentes a cuantizacion, con metricas como la tasa de exito de ataque (ASR), la divergencia de atribucion de circuitos (CAD) o la brecha de resurreccion tras cuantizacion post-entrenamiento (Delta PTQ). Es, por tanto, material de referencia para investigacion en seguridad y alineamiento, no un checkpoint listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base CohereLabs/tiny-aya-fire); no se detalla mas en la informacion disponible |
| Parametros totales | 3,35 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (referencia), 4-bit NormalFloat NF4 y rejilla INT4 simetrica (evaluadas en la auditoria) |
| Idiomas soportados | Ingles, hindi, telugu, bengali, tamil, arabe, espanol, frances, ademas de code-switching hinglish y telugish |
| Licencia | Apache-2.0 en los metadatos del repositorio; la model card declara ademas cc-by-nc-4.0 (contradiccion no resuelta en la informacion disponible) |
| Formato de pesos | No hay pesos publicados (repositorio de auditoria y configuracion, sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema parte de dos modelos densos de Cohere Labs, tiny-aya-fire y tiny-aya-global, ambos de 3,35 mil millones de parametros y orientados a cobertura multilingue. Sobre ellos se aplica un proceso de desaprendizaje en cuatro etapas ejecutado en memoria en dos Tesla T4, sin serializar el resultado. La innovacion tecnica no esta en la arquitectura del modelo, sino en el protocolo de verificacion: un marco de seis pilares que combina evaluacion de exactitud de olvido, ataques multilingues, ataques de prefill afirmativo, robustez a cuantizacion, atribucion de circuitos causales y utilidad en consultas benignas.

La atribucion de circuitos (circuit attribution) se usa como prueba mecanistica de que el circuito factual causal fue desmantelado, en lugar de que el modelo simplemente rechace responder en la superficie. El repositorio incluye un informe de reconciliacion (`results/audit/pillar6_reconciliation_report.json`) que documenta una discrepancia en la metrica de utilidad benigna: se confirma no-sobrerrespuesta (0 % en consultas defensivas de frontera dura), pero el recibo bruto registro 0,00 % por un bucle de evaluacion de tokens causales sin desplazamiento. No se dispone de datos sobre volumen de tokens de entrenamiento ni sobre la composicion del dataset de desaprendizaje mas alla del dataset curado enlazado.

## Capacidades

- Desaprendizaje verificado de conocimiento factual objetivo: exactitud de olvido del 0,00 % en tiny-aya-fire y 0,03 % en tiny-aya-global.
- Resistencia a ataques multilingues: ASR del 0,00 % en tiny-aya-fire y 0,02 % en tiny-aya-global, evaluado en hindi, telugu, tamil, bengali, arabe, espanol, frances y code-switching hinglish/telugish.
- Resistencia a jailbreak por prefill afirmativo: ASR del 0,00 %.
- Robustez a cuantizacion post-entrenamiento: Delta PTQ del 0,00 % bajo NF4 e INT4 simetrico (sin resurreccion de conocimiento).
- Verificacion mecanistica mediante divergencia de atribucion de circuitos: CAD de 0,9957 en tiny-aya-fire y 0,9966 en tiny-aya-global.
- Conservacion de utilidad: no se observa sobrerrespuesta en consultas benignas de frontera defensiva.
- Generacion de recibos de auditoria reproducibles con hash SHA-256 por checkpoint y etapa.
- Capacidades generativas del modelo base (texto multilingue): no documentadas en detalle en la informacion disponible.

## Casos de uso

- Auditoria de cumplimiento en modelos generativos: usar el marco de seis pilares y los recibos SHA-256 para demostrar ante un comite de gobernanza que un dato concreto ha sido eliminado del modelo y no reaparece bajo cuantizacion.
- Investigacion en machine unlearning: reproducir el protocolo sobre tiny-aya-fire o tiny-aya-global con las configuraciones publicadas y comparar la divergencia CAD frente a metodos de simple rechazo superficial.
- Evaluacion de robustez multilingue de tecnicas de seguridad: emplear el conjunto de ataques en ocho idiomas y code-switching para medir si el olvido se mantiene fuera del ingles.
- Red teaming de pipelines de cuantizacion: verificar con la metrica Delta PTQ si un modelo desaprendido resucita conocimiento al pasar a NF4 o INT4 antes de desplegarlo en entornos con VRAM limitada.
- Formacion y docencia en alineamiento: utilizar el repositorio y la demo arena como caso practico de auditoria de seguridad con evidencia criptografica.
- Diseno de benchmarks de utilidad benigna: aprovechar el informe de reconciliacion del pilar 6 para disenar evaluaciones que detecten sobrerrespuesta sin confundirla con olvido efectivo.
- Base para herramientas de auditoria interna: integrar AuditKIT v1.1.7 y el formato de recibos JSON en un pipeline de CI de modelos propios.

## Benchmarks y rendimiento

Resultados publicados en la model card (no verificables de forma independiente):

| Modelo | Checkpoint | Forget Acc (BF16) | Forget Acc (NF4) | Delta PTQ | ASR multilingue | CAD | Veredicto |
|---|---|---|---|---|---|---|---|
| tiny-aya-fire | Baseline sin modificar | 0,00 % | 0,00 % | +0,00 % | 0,00 % | 0,0000 | INSUFFICIENT_EVIDENCE |
| tiny-aya-fire | Polyglot-MANSU | 0,00 % | 0,00 % | +0,00 % | 0,00 % | 0,9957 | PASSED_UNLEARNED |
| tiny-aya-global | Polyglot-MANSU | 0,03 % | 0,03 % | +0,00 % | 0,02 % | 0,9966 | PASSED_UNLEARNED |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 3,35 B: aproximadamente 7 GB en BF16 y 2-3 GB en cuantizacion de 4 bits (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- GPU empleadas en los experimentos: dos Tesla T4 (16 GB cada una), segun la model card.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 y con 4-6 GB en 4 bits, segun la estimacion anterior.
- Opciones de despliegue: no documentadas para este repositorio; al no publicarse pesos, no es desplegable directamente. El modelo base tiny-aya-fire si puede servirse con frameworks habituales (vLLM, llama.cpp, TGI), aunque no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota: el repositorio no contiene pesos, por lo que no es posible ejecutar el modelo desaprendido tal cual; solo reproducir el protocolo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Polyglot-MANSU Tiny Aya Fire | 3,35 B (base) | No disponible | Unlearning verificado + auditoria | Apache-2.0 / cc-by-nc-4.0 (contradictorio) | No |
| CohereLabs/tiny-aya-fire (base) | 3,35 B | No disponible | Modelo multilingue denso | No disponible en esta ficha | Si (modelo base) |
| CohereLabs/tiny-aya-global (base) | 3,35 B | No disponible | Modelo multilingue denso | No disponible en esta ficha | Si (modelo base) |

No se dispone de datos de rendimiento comparativo con otras tecnicas de unlearning en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni adaptadores: no es un modelo descargable ni desplegable; es documentacion y configuracion de auditoria.
- Contradiccion de licencia: los metadatos indican Apache-2.0, pero la model card declara cc-by-nc-4.0, que restringe el uso comercial. Debe aclararse antes de cualquier uso en produccion.
- Los resultados son autoinformados por el autor y no se han verificado de forma independiente; el baseline sin modificar ya muestra 0,00 % de exactitud de olvido, lo que sugiere que la metrica de olvido por si sola no discrimina y debe interpretarse junto con la CAD.
- La metrica de utilidad benigna presenta una discrepancia documentada (0,00 % bruto frente a no-sobrerrespuesta confirmada), lo que indica fragilidad en el bucle de evaluacion.
- Solo se evaluaron dos modelos base de 3,35 B; la generalizacion a modelos mayores o de otra familia no esta demostrada.
- La cobertura linguistica se limita a los ocho idiomas y los code-switchings indicados; no hay datos sobre otros idiomas.
- Riesgo de alucinacion y sesgos del modelo base: no evaluados en la informacion disponible.
- Uso previsto: investigacion en seguridad y alineamiento; no apto como sustituto de un checkpoint de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rahulratan/polyglot-mansu-tiny-aya-fire
- Demo arena de red teaming: https://huggingface.co/spaces/Ravikishore710/polyglot-mansu-arena
- Dataset curado multilingue: https://huggingface.co/datasets/Ravikishore710/polyglot-mansu-curated
- Codigo fuente del proyecto: https://github.com/rahulratan12/polyglot-mansu
- Hackathon Lexsi AI Safety & Alignment: https://hackathon.lexsi.ai/
- Modelo base: CohereLabs/tiny-aya-fire (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
