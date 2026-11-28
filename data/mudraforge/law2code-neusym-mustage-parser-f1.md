# MudraForge/law2code-NeuSym-MuStage-Parser-F1

## Resumen

MudraForge NeuSym MuStage Parser F1 (`law2code-NeuSym-MuStage-Parser-F1`) es un ensemble de token classification de tipo neuro-simbólico disenado para el parseo estructural de estatutos legales corporativos, comerciales y financieros. Lo desarrolla MudraForge y se publica bajo licencia Apache 2.0. Su proposito es convertir lenguaje legal denso (Companies Act, Banking Regulation Act, IBC, regulaciones SEBI, Internal Revenue Code) en representaciones tipadas aptas para compilacion a codigo formal como Catala DSL o solvers SMT.

El modelo no es un LLM generativo, sino un conjunto de tres micro-especialistas (`S1A-M1`, `S1A-M2`, `S1A-M3`) que suman menos de 820K parametros en total. Se distribuye como pipeline de token-classification y opera con cero expresiones regulares y cero diccionarios hardcodeados de clase abierta, lo que busca garantizar determinismo y evitar alucinaciones. La latencia declarada es de 124,0 ms en el paso neural y 338,4 ms de extremo a extremo.

Es relevante para equipos que necesitan extraccion determinista de informacion legal-financiera, con salida estructurada directamente consumible por motores de reglas o pipelines de verificacion formal, en lugar de texto libre sujeto a post-procesado fragil. La model card esta en ingles y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neuro-simbolica: ensemble de tres micro-especialistas de token classification (MuStage) con arbitraje simbolico determinista |
| Parametros totales | Menos de 820K (817K segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos `.pt`; binario de 6,5 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch): `stage1_micro_qty_term_pure_v1.pt`, `stage1_micro_xref_pure_v1.pt`, `stage1_micro_op_pure_v1.pt` |

## Arquitectura y entrenamiento

La arquitectura NeuSym separa percepcion neural continua y compilacion simbolica discreta. La parte neural la forman encoders de tokens de alta dimension y localizados que capturan morfologia, afinidades sintacticas y limites contextuales sin busquedas en diccionario ni expresiones regulares. La parte simbolica se encarga de fundamentar, arbitrar y transformar las representaciones candidatas en nodos AST formalmente tipados mediante invariantes de frontera y protocolos de consenso en dos fases.

El ensemble MuStage divide el ciclo de parseo en tres micro-especialistas acotados: `S1A-M1` cubre cantidades, ventanas temporales y terminos definidos (`MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT`, `DEFINED_TERM`); `S1A-M2` cubre referencias cruzadas legislativas y anclajes estructurales (`XREF`) en secciones, subsecciones, clausulas, provisos y schedules; `S1A-M3` cubre operadores ejecutables y modalidades deonticas (`OP`) con 18 opcodes canonicos, distinguiendo obligaciones (`shall`, `must`) de autorizaciones (`may`), comparadores de umbral (`within`, `not exceeding`, `more than`) y puntos de excepcion (`unless`, `provided that`). La comunicacion entre especialistas se realiza mediante un contrato de mensajes tipado (`SpanMessage`) con `role` (`TERMINAL_LEAF`, `SUB_LEAF`, `SCOPE_WINDOW`, `OPERATOR`) y `claim_status` (`CLOSED`, y otros estados no detallados en la informacion disponible). No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extraccion determinista de entidades legales-financieras: importes monetarios, tasas, fechas, duraciones, conteos y terminos definidos.
- Reconocimiento de referencias cruzadas legislativas multinivel (secciones, subsecciones, clausulas, provisos, schedules y reglas administrativas secundarias).
- Clasificacion de operadores normativos y modalidades deonticas en 18 opcodes canonicos.
- Distincion entre obligacion, autorizacion, comparadores de umbral y excepciones estatutarias.
- Generacion de nodos AST tipados (`norm_value`, `slots`) con pool de condiciones por etapas para compilacion a Catala.
- Arbitraje entre especialistas mediante patron de blackboard asincrono y reglas de consenso deterministas.
- Token classification en escala de microsegundos y latencia neural declarada de 124,0 ms.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Compilacion de estatutos a Catala DSL: el parser emite nodos AST tipados con valores normalizados y slots, que alimentan directamente un compilador Catala sin necesidad de post-procesado de texto libre.
- Verificacion de cumplimiento normativo en banca: `S1A-M1` extrae umbrales monetarios y tasas de la Banking Regulation Act y `S1A-M3` identifica obligaciones (`shall`, `must`) para construir reglas ejecutables en motores de cumplimiento.
- Analisis de contratos comerciales: `S1A-M2` resuelve citas cruzadas entre secciones y provisos, lo que permite reconstruir la jerarquia normativa de un contrato y auditar dependencias entre clausulas.
- Automatizacion fiscal sobre el Internal Revenue Code: deteccion de fechas, plazos y comparadores de umbral para generar restricciones SMT verificables sobre plazos de declaracion y limites.
- Construccion de bases de conocimiento regulatorio: la salida tipada permite indexar obligaciones, excepciones y referencias en un grafo consultable para equipos legales y de riesgo.
- Integracion en pipelines CI/CD de reglas de negocio: al ser determinista y de 6,5 MB, el parser puede ejecutarse como paso de validacion en cada cambio de un repositorio de reglas legales, con latencia de extremo a extremo de 338,4 ms.
- Preprocesado para solvers SMT: la extraccion de restricciones numericas y temporales con fronteras invariantes reduce el ruido de entrada antes de la formalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara cifras de latencia y footprint: 124,0 ms de paso neural, 338,4 ms de extremo a extremo, 817K parametros totales, binario de 6,5 MB y menos de 180 MB de VRAM.

## Requisitos de hardware

- VRAM estimada: menos de 180 MB segun la model card; el binario de pesos ocupa 6,5 MB.
- GPU recomendadas: no se especifican modelos concretos; por el tamano, cualquier GPU consumer es suficiente.
- Cabe en GPU consumer: si, con amplio margen (el requisito declarado es inferior a 180 MB de VRAM).
- Opciones de despliegue: los pesos se distribuyen como ficheros `.pt` de PyTorch; la model card no detalla integracion con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: 124,0 ms en el paso neural y 338,4 ms de extremo a extremo por provision; clasificacion de tokens en escala de microsegundos. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MudraForge NeuSym MuStage Parser F1 | 817K | No disponible | Ensemble neuro-simbolico de token classification | Apache 2.0 | Hugging Face |
| GPT-4 / LLaMA (referencia de la model card) | 7B-70B | No disponible | Generacion autoregresiva estocastica | Propietaria / variable | API / Hugging Face |
| LegalBERT / RoBERTa (referencia de la model card) | 110M-350M | No disponible | Etiquetado de secuencias monolítico | Variable | Hugging Face |

La comparativa se limita a las alternativas citadas por el autor en la model card; no se dispone de datos de rendimiento comparado en benchmarks para ninguna de ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de cobertura multilingue.
- Especifico del dominio legal corporativo, comercial y financiero; su rendimiento fuera de ese dominio no esta documentado.
- La model card no reporta sesgos conocidos ni evaluaciones de robustez ante texto legal adversarial o mal formado.
- Riesgo de alucinacion: el autor afirma determinismo total y cero expresiones regulares, pero no se aportan benchmarks independientes que lo verifiquen.
- La longitud de contexto no esta especificada, lo que impide planificar el troceado de estatutos largos con garantias.
- El contrato `SpanMessage` se describe parcialmente (solo se detallan algunos estados de `claim_status`), lo que limita la integracion sin documentacion adicional.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del pipeline y los pesos `.pt` antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni casos de uso publicos verificables.
- No se detallan los datos de entrenamiento, por lo que no puede evaluarse la representatividad del corpus ni posibles sesgos jurisdiccionales.

## Enlaces

- Hugging Face: https://huggingface.co/MudraForge/law2code-NeuSym-MuStage-Parser-F1
