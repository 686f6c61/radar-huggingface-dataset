# MudraForge/law2code-msparser-mspmf1

## Resumen

MudraForge MSPMF1 (`law2code-msparser-mspmf1`) es un paquete de parsing estatutario publicado por MudraForge, orientado a la extraccion estructurada de entidades en textos legales de derecho corporativo y comercial. No es un modelo unico, sino un pipeline cooperativo que orquesta tres micro-especialistas neuronales —S1A-M1 (cantidades y terminos definidos), S1A-M2 (referencias cruzadas) y S1A-M3 (operadores deonticos y logicos)— bajo un arbitro de consenso en dos fases. El conjunto pesa aproximadamente 6,5 MB y esta disenado para funcionar sobre geometria ortografica y morfosintactica de 17 dimensiones, sin expresiones regulares ni diccionarios de clase abierta.

La relevancia del paquete radica en su enfoque de "legal2code": convertir prosa estatutaria en hojas (leaves) cerradas y sub-spans relacionales listos para compilacion en un AST de condiciones. Frente a modelos fundacionales de proposito general, esta propuesta apuesta por especializacion extrema y huella minima, con inferencia en CPU y GPU de consumo. La model card declara metricas de F1 exacto del 99,18 % sobre provisiones no vistas, con recall del 100 % (303/303 atomos dorados capturados).

El modelo se publica bajo licencia Apache 2.0, soporta unicamente ingles y esta etiquetado como `token-classification` dentro del pipeline. Su fecha de creacion es el 28 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres micro-especialistas neuronales (S1A-M1, S1A-M2, S1A-M3) con arbitro de consenso en dos fases |
| Parametros totales | ~817K (283K + 230K + 304K) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `.pt`, tamano total ~6,5 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`): `stage1_micro_qty_term_pure_v1.pt`, `stage1_micro_xref_pure_v1.pt`, `stage1_micro_op_pure_v1.pt` |

## Arquitectura y entrenamiento

El sistema se compone de tres redes neuronales de muy baja capacidad que operan sobre una representacion geometrica de 17 dimensiones de caracteristicas ortograficas y morfosintacticas. S1A-M1 (283K parametros) resuelve nodos de decision conceptual de 6 bits y ensambla unidades compuestas para las clases `MONEY`, `RATE`, `DATE`, `DURATION`, `COUNT` y `DEFINED_TERM`. S1A-M2 (230K parametros) se encarga de las referencias cruzadas (`XREF`) con separacion de coordenadas en multiples niveles e inmunidad estructural a anclas. S1A-M3 (304K parametros) gestiona 18 opcodes de operadores (`OP`): modales deonticos, comparadores, overrides y conectores logicos.

Sobre las tres salidas actua un arbitro de consenso colaborativo en dos fases, con inmunidad estructural de nivel 1 y prioridad lexica, que decide que spans se reclaman como hojas estatutarias y cuales se difieren a una reserva de sub-spans (`sub_spans`) con estado `PENDING_CLAIM`. El diseno declara explicitamente cero expresiones regulares y cero diccionarios de clase abierta codificados a mano. No se proporcionan en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Extraccion de entidades estatutarias cerradas: importes (`MONEY`), tasas (`RATE`), fechas (`DATE`), duraciones (`DURATION`), recuentos (`COUNT`) y terminos definidos (`DEFINED_TERM`).
- Resolucion de referencias cruzadas legales (`XREF`) con separacion de coordenadas en multiples niveles.
- Deteccion de operadores deonticos y logicos (`OP`, 18 opcodes): modales como `shall`, `may`, `must`; comparadores de umbral (`within`, `after`, `>`); overrides (`unless`, `provided that`); conectores (`or`, `and`, `nor`, `no`).
- Salida en dos capas: hojas reclamadas (`leaves`) y reserva diferida de sub-spans (`sub_spans`) con `claim_status: PENDING_CLAIM`.
- Etiquetado de funciones relacionales de condicion (`COND_GUARD`, `NEG_LOGIC`) con resolucion de opcode del 100 % segun la model card.
- Capacidad de procesamiento en CPU y GPU de consumo con latencias declaradas inferiores al medio segundo por provision.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Extraccion de terminos financieros en contratos corporativos: el pipeline identifica importes, tasas y duraciones en provisiones de financiacion, permitiendo poblar bases de datos estructuradas de obligaciones contractuales sin post-procesado manual.
- Construccion de un AST de condiciones legales: los `sub_spans` diferidos (`if`, `where`, `or`, `and`) alimentan un compilador posterior que reconstruye la logica condicional de cada clausula, util para motores de cumplimiento normativo.
- Indexacion y busqueda semantica de referencias cruzadas: la deteccion de `XREF` con coordenadas en multiples niveles facilita la construccion de grafos de dependencias entre articulos, secciones y anexos de un corpus estatutario.
- Validacion automatizada de borradores contractuales: el modelo marca terminos definidos y operadores deonticos para verificar que cada obligacion usa el modal correcto (`shall` frente a `may`) antes de la firma.
- Preprocesado para asistentes juridicos: al transformar prosa en hojas cerradas con etiquetas tipadas, se reduce la carga de contexto que un LLM generativo necesita para razonar sobre la clausula, lo que abarata el coste por consulta.
- Auditoria de cumplimiento en tiempo casi real: con ~3 provisiones por segundo en una GPU RTX 3050 y ~2,4 por segundo en CPU, el pipeline puede procesar lotes de contratos en hardware modesto sin depender de servicios en la nube.
- Extraccion de umbrales y plazos en politicas internas: la deteccion de `DURATION`, `DATE` y comparadores (`within`, `after`) permite monitorizar vencimientos y condiciones temporales en flujos de gestion documental.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados de extremo a extremo sobre provisiones corporativas y comerciales no vistas:

| Metrica global | Resultado | Desglose |
|---|---|---|
| F1 exacto | 99,18 % | IoU = 1,0, coincidencia exacta de etiqueta |
| Recall | 100,00 % | 303 / 303 atomos dorados capturados |
| Precision | 98,38 % | 303 TP, 5 FP (el autor indica que los 5 FP son omisiones reales del gold standard) |
| F1 relajado | 99,18 % | IoU >= 0,50 |

| Clase estatutaria | Gold | TP | FP | FN | Precision | Recall | F1 exacto | Motor |
|---|---|---|---|---|---|---|---|---|
| MONEY | 12 | 12 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| RATE | 11 | 11 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| DATE | 9 | 9 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| DURATION | 25 | 25 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| COUNT | 12 | 12 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| DEFINED_TERM | 10 | 10 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M1 |
| XREF | 50 | 50 | 0 | 0 | 100,00 % | 100,00 % | 100,00 % | S1A-M2 |
| OP | 174 | 174 | 5 | 0 | 97,21 % | 100,00 % | 98,58 % | S1A-M3 |

Latencia declarada por el autor:

| Hardware | Inferencia neuronal pura | Pipeline completo extremo a extremo |
|---|---|---|
| NVIDIA GeForce RTX 3050 6 GB Laptop GPU | 124,0 ms / provision | 338,4 ms / provision (~3 provisiones/s) |
| Intel Core i5 / x86_64 | no disponible | 422,8 ms / provision (~2,4 provisiones/s) |

No se han publicado comparaciones con modelos de referencia externos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en inferencia; el paquete completo pesa ~6,5 MB en disco, por lo que cabe en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor reporta mediciones en una RTX 3050 de 6 GB para portatil; tarjetas superiores (RTX 4090, A100, H100) no aportan ventaja significativa dado el tamano del modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RX 6600 y superiores.
- Despliegue: el autor publica el paquete como `MudraForgeModularPipeline` (modulo Python `modular_pipeline`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y por el formato de pesos (`.pt` propietario) no son directamente aplicables.
- Latencia y throughput declarados: 338,4 ms por provision en RTX 3050 (aproximadamente 3 provisiones/s) y 422,8 ms por provision en Intel Core i5 (aproximadamente 2,4 provisiones/s).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos alternativos en la informacion proporcionada. Como referencia estructural, se puede contrastar con las siguientes familias, aunque no hay datos de rendimiento comparables:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MudraForge MSPMF1 | ~817K (3 micro-especialistas) | no disponible | Pipeline de parsing estatutario con arbitraje de consenso | Apache 2.0 |
| Modelos NER legales genericos (p. ej., Legal-BERT) | ~110M | 512 tokens | Token classification sobre texto legal | Varía (habitualmente Apache 2.0 o MIT) |
| LLM generativos de proposito general | Miles de millones | 32K-128K+ | Generacion y razonamiento | Varía |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo soporta ingles (`en`); no se declara cobertura multilingue.
- Dominio restringido: entrenado para derecho corporativo y comercial; su comportamiento en otras ramas juridicas (penal, administrativo, laboral) no esta documentado.
- Metricas no verificadas de forma independiente: los resultados (F1 exacto 99,18 %, recall 100 %) proceden de la model card del autor y no se han replicado externamente. La justificacion de los 5 falsos positivos como "omisiones del gold standard" debe tratarse con cautela.
- Riesgo de sobreajuste al esquema de anotacion: el pipeline depende de un conjunto cerrado de clases y opcodes; textos con convenciones de redaccion distintas pueden degradar el rendimiento.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo, por lo que no puede sustituir a un LLM en tareas de respuesta abierta.
- Dependencia del runtime propietario: el quickstart usa `MudraForgeModularPipeline`; no hay pesos en formatos estandar (safetensors, GGUF) ni integracion con ecosistemas como Hugging Face Transformers, lo que limita la portabilidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del runtime `modular_pipeline` si se distribuye como parte de un producto.
- Sin descargas ni validacion comunitaria: el repositorio no registra descargas ni likes en el momento de la ficha, por lo que no existe evidencia de uso en produccion por terceros.
- Riesgo de alucinacion estructural: aunque no genera texto libre, puede producir spans espurios (falsos positivos) en clausulas atipicas; el autor reconoce 5 FP en su propia evaluacion.
- Sin informacion sobre sesgos: la model card no documenta analisis de sesgo ni evaluacion de robustez frente a variaciones dialectales o de estilo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MudraForge/law2code-msparser-mspmf1
- Repositorio del autor en Hugging Face: https://huggingface.co/MudraForge
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
