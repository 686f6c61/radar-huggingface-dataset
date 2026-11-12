# FinanceRateCalc/frc-contract-drift

## Resumen

frc-contract-drift es un clasificador de texto multi-etiqueta publicado por FinanceRateCalc, un proyecto centrado en la trazabilidad de cifras financieras. El modelo resuelve un problema muy concreto: detectar cuando una frase que reformula una cifra publicada (por ejemplo, un tipo hipotecario o un dato HMDA/FHA) incurre en una distorsion que el registro original no puede sostener. Para ello asigna una o varias etiquetas de "razon de deriva" como CAUSALITY_NOT_ESTABLISHED, INDIVIDUAL_PREDICTION_PROHIBITED o PROGRAM_MISMATCH, entre otras seis.

Tecnicamente es un fine-tuning de distilroberta-base sobre un corpus pequeno y sintetico: 4.850 frases generadas por reglas a partir de 386 contratos de afirmacion, mas un conjunto de fixtures de decision de citacion. El autor declara explicitamente que ninguna frase de entrenamiento fue escrita por un modelo. Cuenta con 82.124.552 parametros y un repositorio de 0,3 GB en formato safetensors.

Su relevancia es acotada pero clara: actua como segundo lector para parafrasis que las expresiones regulares del gate determinista de FinanceRateCalc no capturan, y como artefacto reproducible del registro. No toma decisiones en produccion; el gate lo hace. La model card insiste en que el modelo no conoce cifras que no se le han mostrado y que la verificacion numerica corresponde al recibo, no al clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, via distilroberta-base) |
| Parametros totales | 82.124.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilroberta-base, una version destilada de RoBERTa con seis capas y 82 millones de parametros, y se especializa como clasificador multi-etiqueta para la tarea de deteccion de deriva contractual. La cabeza de clasificacion se entrena sobre ocho etiquetas discretas que corresponden a los codigos de razon del gate determinista de FinanceRateCalc.

El conjunto de entrenamiento consta de 4.850 frases generadas por reglas a partir de 386 contratos de afirmacion. La construccion sigue un esquema controlado: la frase canonica y sus parafrasis fieles se etiquetan como "sin codigo", mientras que las distorsiones escritas por reglas reciben el codigo correspondiente. Se anaden tambien los candidatos del fixture de decision de citacion con los codigos que el gate les asigno. La particion de validacion se hace por identificador de afirmacion (held out by claim id), lo que evita fuga de informacion entre variantes de un mismo contrato. El autor declara un exact-match de 0,998 en el conjunto reservado y remite a `eval.json` para precision y recall por etiqueta. No se documenta uso de RLHF, DPO ni datos generados por modelos.

## Capacidades

- Clasificacion de texto multi-etiqueta: asigna una o varias de las ocho etiquetas de deriva (CAUSALITY_NOT_ESTABLISHED, INDIVIDUAL_PREDICTION_PROHIBITED, LEGAL_CONCLUSION_NOT_SUPPORTED, LENDER_RECOMMENDATION, PROGRAM_MISMATCH, QUALIFIER_DELETED, SAME_APPLICANT_FRAMING, SCOPE_TOO_BROAD).
- Deteccion de parafrasis distorsionadas: pensado para reformulaciones que esquivan las expresiones regulares del gate determinista.
- Verificacion de fidelidad de citas: comprueba si una frase que reformula una cifra publicada mantiene las condiciones del registro original.
- Operacion monolingue: solo ingles.
- No genera texto, no razona de forma abierta, no hace tool calling ni soporta agentes multi-paso.
- No dispone de vision, audio ni modo de pensamiento extendido.
- No conoce cifras que no se le hayan mostrado; su funcion es clasificar la formulacion, no validar el dato numerico.

## Casos de uso

- Revision de citas en publicaciones financieras: clasificar parafrasis de tipos hipotecarios o datos HMDA/FHA antes de publicarlas, para detectar reformulaciones que eliminan calificadores o amplian el alcance de la afirmacion original.
- Segunda pasada sobre el gate determinista: ejecutar el clasificador sobre las frases que las regexes del gate no han marcado, usando sus etiquetas como senal de revision manual.
- Auditoria de textos regulatorios o informes de prestamos: identificar frases que presentan una conclusion legal no respaldada (LEGAL_CONCLUSION_NOT_SUPPORTED) o que recomiendan un prestamista concreto (LENDER_RECOMMENDATION).
- Control de calidad en pipelines de contenido: integrar el modelo como etapa de filtrado previo a la publicacion de resumenes o notas que citan cifras de FinanceRateCalc.
- Trazabilidad reproducible: servir como artefacto versionado que permite reconstruir por que una frase fue marcada, dado que el entrenamiento es enteramente sintetico y basado en reglas.
- Investigacion sobre provenance y atribucion: usar el modelo y su conjunto de datos publico para estudiar como se degradan las afirmaciones al ser parafraseadas en el dominio financiero.
- Deteccion de encuadres indebidos sobre el mismo solicitante (SAME_APPLICANT_FRAMING) en materiales explicativos o comparativas de productos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exact-match (held out by claim id) | 0,998 |
| Precision por etiqueta | disponible en `eval.json` (no reproducido aqui) |
| Recall por etiqueta | disponible en `eval.json` (no reproducido aqui) |
| MMLU / HumanEval / GSM8K | no disponible |

No se han publicado resultados de benchmarks generales de lenguaje en la informacion disponible; el unico dato reportado es el exact-match sobre el conjunto de validacion reservado por identificador de afirmacion.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno de 0,3-0,5 GB en fp32 para los 82 millones de parametros, mas overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para uso dedicado; funciona en CPU con latencia de milisegundos por frase. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sobra para el modelo.
- Cabe en consumer GPU y tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: transformers con pipeline de text-classification, ONNX Runtime, o exportacion a otros runtimes de encoder; vLLM y llama.cpp no aplican a este tipo de clasificador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, el coste por frase es bajo en CPU y despreciable en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| frc-contract-drift | 82.124.552 | no disponible | Clasificacion multi-etiqueta de deriva contractual | cc-by-4.0 | Hugging Face |
| distilroberta-base | ~82 M | 512 tokens (tipico de RoBERTa) | Modelo base de lenguaje enmascarado | MIT (upstream) | Hugging Face |
| roberta-base | ~125 M | 512 tokens (tipico de RoBERTa) | Modelo base de lenguaje enmascarado | MIT (upstream) | Hugging Face |

La comparacion relevante es con su modelo base y con roberta-base: frc-contract-drift no compite en capacidades generales, sino que anade una cabeza de clasificacion especifica sobre un dominio muy restringido. No se conocen alternativas publicas equivalentes para la tarea concreta de deteccion de deriva en citas financieras; en ese sentido, la comparativa de rendimiento especifico es no disponible.

## Limitaciones y advertencias

- Dominio muy estrecho: solo clasifica las ocho etiquetas definidas por el gate de FinanceRateCalc; fuera de ese esquema no aporta valor.
- Entrenamiento sintetico y basado en reglas: el modelo aprende los patrones del generador de distorsiones, no la variabilidad del lenguaje real; puede fallar ante parafrasis humanas alejadas de esas plantillas.
- Monolingue: solo ingles; no cubre castellano ni otros idiomas.
- No valida cifras: la model card advierte explicitamente que no conoce numeros que no se le han mostrado y que la comprobacion numerica debe hacerse contra el recibo.
- No sustituye al gate determinista: es un segundo lector auxiliar; las decisiones en financeratecalc.com las toma el gate, no este modelo.
- Riesgo de alucinacion de etiqueta: al ser un clasificador, puede asignar codigos con confianza alta a frases ambiguas; conviene calibrar umbrales por etiqueta con `eval.json`.
- Licencia cc-by-4.0: permite uso comercial con atribucion; hay que respetar los terminos de atribucion del autor.
- Trazabilidad de datos limitada: el conjunto de datos y la especificacion estan enlazados publicamente, pero el modelo no documenta composicion detallada por etiqueta ni tamanos de particiones mas alla del total.
- Sesgos: no documentados en la model card; al derivar de distilroberta-base, puede heredar sesgos del corpus original de RoBERTa, aunque el dominio de aplicacion los acota.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FinanceRateCalc/frc-contract-drift
- Conjunto de datos de entrenamiento: https://financeratecalc.com/eval/drift-training-set.jsonl
- Especificacion de decision de citacion: https://financeratecalc.com/rl-env/CITATION-DECISION-SPEC.md
- Repositorio fuente: https://github.com/financeratecalc/financeratecalc.github.io
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
