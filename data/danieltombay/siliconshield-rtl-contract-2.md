# danieltombay/siliconshield-rtl-contract-2

## Resumen

SiliconShield-RTL Contract-2 es un modelo de clasificación de texto especializado en verificar requisitos de seguridad sobre fragmentos de RTL (Verilog y SystemVerilog), concretamente en el dominio temporal: comportamiento de FIFOs, contadores y árbitros (ocupación, backpressure, saturación, handshakes de concesión y retención). Lo desarrolla el usuario danieltombay y se presenta como un "especialista temporal" que complementa a su modelo hermano Contract-1, encargado de guardas locales, escrituras de registros y control de acceso. No es un modelo generativo de propósito general: es un cabezal de decisión que devuelve, para cada requisito evaluado, una de tres etiquetas (`satisfies_requirement`, `violates_requirement`, `insufficient_context`) junto con las tres probabilidades asociadas.

Técnicamente es un fine-tune del checkpoint inglés LAYA (`convaiinnovations/laya`), con encoder congelado, adaptadores residuales y un cabezal de decisión, entrenado sobre contrastes de FIFO, contador y árbitro verificados por solver. El checkpoint publicado corresponde al paso 70 de un sprint de tripletas (F2) y fue seleccionado manualmente por el autor: según su propia model card, no superó el umbral de promoción congelado del entrenador (recall de violaciones, falsos seguros y NLL), por lo que debe tratarse como un checkpoint de investigación.

Su relevancia es acotada pero concreta: cubre un nicho del análisis de seguridad de hardware donde los LLM generalistas rinden mal, y lo hace con un modelo pequeño (436 millones de parámetros) ejecutable en local. La contrapartida es su estrechez de alcance y una tasa de falsos seguros del orden del 22 % en su propio conjunto de dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base LAYA) con encoder congelado, adaptadores residuales y cabezal de decisión de clasificación |
| Parámetros totales | 436.031.238 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana nominal; la inferencia usa `max_len=1536` y `head_max_len=256` |
| Tipos de cuantización | no disponible (repo en safetensors, 1,7 GB) |
| Idiomas soportados | inglés (checkpoint LAYA inglés de origen); otros idiomas no disponibles |
| Licencia | Apache-2.0 (los pesos base LAYA conservan sus términos upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint inglés LAYA y se ajusta mediante la tarea de seguridad de SiliconShield: se congela el encoder y se entrenan adaptadores residuales más un cabezal de decisión que produce una distribución de tres clases por requisito. La formulación es de clasificación con contrato de pregunta (`siliconshield-requirement-context-v1`): el texto de entrada combina el RTL, el requisito y las asunciones en el formato de fila del benchmark, con longitud máxima de 1536 tokens y 256 para el cabezal.

El entrenamiento se realizó sobre contrastes de FIFO, contador y árbitro verificados por solver, con objetivos que tienen en cuenta tripletas (satisfies/violates/insufficient_context) y preservación de replay para no degradar el comportamiento previo del modelo base. El checkpoint publicado es el paso 70 del sprint de tripletas F2 (hash de pesos `f916444f…`), elegido por el propietario por su recuperación de satisfies/context a coste mínimo de violaciones, no por superar el umbral automático de promoción. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de requisitos de seguridad sobre fragmentos RTL acotados, con veredicto de tres vías y probabilidades por clase.
- Juicio de contexto insuficiente: en el conjunto de dominio logra 78/78 aciertos de "missing-context", es decir, detecta cuándo el fragmento no permite decidir.
- Evaluación de comportamiento temporal: ocupación de FIFO, backpressure, saturación de contadores, commit/hold y handshakes de concesión en árbitros.
- Inferencia por lotes (`predict_batch`) con ordenación por longitud opcional, pensada para barrer conjuntos de requisitos.
- Integración en un router (SiliconShield) que consulta Contract-2 y Contract-1 según sus ámbitos cualificados y marca el resto como evidencia débil.
- No soporta tool calling, agentes multi-paso, visión, audio ni generación de texto libre: es un modelo de decisión, no un asistente.

## Casos de uso

- Revisión automatizada de IP de FIFOs: dado un fragmento de RTL de una FIFO y un requisito de no desbordamiento, el modelo devuelve si lo cumple, lo viola o falta contexto; útil como primer filtro antes de simulación formal.
- Triaje de contadores en bloques de control: se evalúan requisitos de saturación y wrap-around sobre contadores acotados y se priorizan los casos marcados como violación para revisión humana.
- Auditoría de árbitros y handshakes: comprobación de que las concesiones (grant) respetan los requisitos de exclusividad y progreso en fragmentos de lógica de arbitraje.
- Puerta de calidad en pipelines de integración de RTL: el modelo se ejecuta por lotes sobre los fragmentos modificados en un pull request y bloquea o señala los que violan requisitos temporales definidos por el equipo.
- Enrutado dentro de SiliconShield: el router consulta Contract-2 solo en los ámbitos fifo/counter/arbitration y delega el resto a Contract-1, evitando falsos veredictos fuera de dominio.
- Investigación en verificación asistida por ML: sirve como línea base reproducible (benchmark público de 5.589 filas y 11 áreas) para estudiar clasificadores de seguridad de hardware de tamaño reducido.
- Despliegue local en estaciones de trabajo: con 436 M de parámetros y 1,7 GB de pesos, se puede ejecutar sin GPU de datacenter para experimentación con RTL no publicable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el SiliconShield RTL benchmark (5.589 filas, 11 áreas; evidencia de desarrollo, sin abrir los conjuntos sellados de cualificación y test):

| Área | Contract-2 | Contract-1 |
|---|---|---|
| fifo | 97/108 | 36/108 |
| counter | 92/108 | 41/108 |
| arbitration | 14/18 | 14/18 |
| interrupt-wake | 145/234 | 158/234 |
| input-filter | 94/162 | 91/162 |
| ot-access-control | 77/108 | 108/108 |
| local-safety-cwe | 933/2610 | 2601/2610 |
| transfer-pairs | 275/621 | 606/621 |
| write-paths | 244/432 | 179/432 |
| guard-semantics | 268/432 | 171/432 |
| requirement-clarity | 271/756 | 346/756 |
| **Total** | **2.510/5.589** | no disponible en la información |

En dominio (fifo, counter, arbitration): 203/234, con 78/78 en juicio de contexto ausente y 51/78 tripletas completas correctas; 8 de 20 mecanismos con puntuación perfecta. El recall de violaciones en dominio es 61/78, con 17 falsos seguros. El detalle por área y mecanismo (clases, falsos seguros, falsas violaciones, abstenciones, tripletas, NLL y ajustes de inferencia) está en `benchmark-results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 436 M de parámetros en FP16 el peso ronda 0,9 GB y en FP32 unos 1,7 GB, más overhead de activaciones para lotes de hasta 16 y 1536 tokens.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para lotes moderados; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo.
- Opciones de despliegue: la librería `laya` (`laya.agent.load`) con `predict_batch`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconShield-RTL Contract-2 | 436 M | 1536 tokens en inferencia | Clasificación de requisitos RTL temporales | Apache-2.0 | Hugging Face |
| SiliconShield-RTL Contract-1 | no disponible | no disponible | Clasificación de requisitos RTL de guardas, escrituras y control de acceso | Apache-2.0 (según model card del autor) | Hugging Face |
| LAYA (`convaiinnovations/laya`) | no disponible | no disponible | Modelo base de propósito general | términos upstream | Hugging Face |

No se dispone de datos de benchmarks de modelos de terceros comparables en la misma tarea de verificación de seguridad sobre RTL en la información proporcionada.

## Limitaciones y advertencias

- Especialista estrecho: en seguridad local, transferencia, control de acceso, rutas de escritura y razonamiento sobre políticas en inglés llano rinde en torno al azar; esos ámbitos deben enrutarse a Contract-1.
- Pierde aproximadamente una de cada cinco violaciones en dominio (17 falsos seguros sobre el conjunto enfocado); las familias commit-hold, arbiter-tree, empty-data-blanking y stored-word-hold son poco fiables.
- Checkpoint de investigación seleccionado por el propietario: no superó el umbral congelado de promoción (recall de violaciones, falsos seguros y NLL), por lo que no debe considerarse una versión validada para producción.
- Alcance de fragmento pequeño: juzga regiones RTL acotadas contra un requisito cada vez; no razona sobre IP completa, nivel SoC, FSM, dominios de reloj, protocolos de bus, criptografía ni interfaces de firmware.
- Un veredicto no es una prueba: los hallazgos deben confirmarse por simulación o verificación formal antes de actuar sobre ellos.
- Riesgo de alucinación de veredictos: al ser un clasificador, puede emitir "satisfies" o "violates" con alta confianza sobre fragmentos ambiguos; conviene tratar los ceros exactos como fallos confiados y revisar los casos límite.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Licencia Apache-2.0 para este checkpoint, pero los pesos base LAYA conservan sus términos upstream y deben revisarse para uso comercial.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), lo que implica ausencia de evidencia independiente de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danieltombay/siliconshield-rtl-contract-2
- Modelo hermano Contract-1: https://huggingface.co/danieltombay/siliconshield-rtl-contract-1
- Dataset de benchmark: https://huggingface.co/datasets/danieltombay/siliconshield-rtl-benchmark
- Modelo base LAYA: https://huggingface.co/convaiinnovations/laya
- Resultados detallados: `benchmark-results.json` en el repositorio del modelo
- Repositorio SiliconShield (scripts de benchmark): referenciado en la model card como `siliconshield`; URL exacta no disponible en la información proporcionada
