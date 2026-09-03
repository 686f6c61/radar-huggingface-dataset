# Snapkitty/pocketlearn

## Resumen

PocketLearn es un proyecto de arquitectura cognitiva simbólica desarrollado por Snapkitty que prescinde por completo de redes neuronales. En lugar de ajustar pesos mediante retropropagación, el sistema construye una teoría visible del conocimiento a partir de un corpus de texto, utilizando un pipeline compuesto por XML, XSLT, Prolog con inducción de lógica inductiva (ILP), Answer Set Programming (ASP) para validación y FORTH como lenguaje de ejecución final. El proyecto se autodefine con el lema "Learn = build a visible theory" (aprender es construir una teoría visible), en contraposición explícita al paradigma de aprendizaje profundo.

La relevancia de este proyecto radica en su propuesta de inspeccionabilidad total: a diferencia de un transformer, donde el conocimiento queda codificado en pesos numéricos ilegibles, PocketLearn genera artefactos legibles como ontologías XML y reglas Prolog que pueden auditarse paso a paso. El sistema es determinista, reproducible bit a bit y elimina la alucinación mediante validación ASP. No se trata de un modelo de lenguaje en el sentido convencional, sino de un experimento de ingeniería del conocimiento que combina múltiples paradigmas simbólicos clásicos.

El repositorio incluye un Makefile que orquesta el pipeline completo, y el proyecto está firmado por "Ahmad Ali Parr · Bel Esprit D'Accord Irrevocable Trust · EIN 42-697643". No se especifica licencia, tamaño de parámetros ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simbolica: XML + XSLT + ILP (Prolog) + ASP (Clingo) + FORTH |
| Parametros totales | No aplica (no es una red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el corpus de ejemplo es ingles) |
| Licencia | No disponible |
| Formato de pesos | No aplica (codigo fuente: XML, XSLT, Prolog, ASP, FORTH, Makefile) |

## Arquitectura y entrenamiento

PocketLearn implementa un pipeline de siete etapas orquestado por un Makefile. El proceso comienza con un corpus de texto plano (`sample_corpus.txt`) que se tokeniza a XML mediante un tokenizador propio de 69 tokens y 52 entradas de vocabulario. A continuacion, dos transformaciones XSLT convierten el corpus tokenizado en hechos Prolog de coocurrencia (`background.pl`) y generan un motor de induccion de logica inductiva (`ontology_induction_generated.pl`) a partir de la ontologia semilla (`ontology.xml`). El paso clave es el "meta-truco": la transformacion XSLT `ontology_to_induction.xslt` genera el motor ILP Prolog desde la propia ontologia, haciendo que el sistema sea autodescriptivo.

El motor ILP se ejecuta con SWI-Prolog y produce reglas inducidas como `is_a(W, stack_op) :- cooccur(W, 'drop')` con puntuaciones F1. Estas reglas se incorporan a la ontologia (`ontology_induced.xml`), que luego se valida mediante ASP con Clingo para rechazar contradicciones (por ejemplo, si `dup` fuera simultaneamente `stack_op` y `compiler_word`, el sistema devolveria UNSAT). Finalmente, otra transformacion XSLT genera un diccionario FORTH ejecutable (`generated_corpus_induced.fth`) que se ejecuta con Gforth. El entrenamiento, por tanto, no consiste en ajuste de pesos sino en induccion de reglas logicas a partir de estadisticas de coocurrencia, con validacion de consistencia mediante ASP.

## Capacidades

- Induccion de reglas logicas a partir de corpus de texto mediante ILP (Inductive Logic Programming) con SWI-Prolog.
- Generacion de ontologias XML enriquecidas con nuevas membresias de clases inducidas por coocurrencia.
- Validacion de consistencia logica mediante Answer Set Programming con Clingo, capaz de rechazar contradicciones.
- Generacion de codigo FORTH ejecutable que incorpora el vocabulario semilla y las palabras inducidas.
- Reproducibilidad determinista: el mismo XML de entrada produce exactamente el mismo FORTH de salida, sin depender de semillas aleatorias.
- Inspeccionabilidad total: cada etapa del pipeline genera artefactos legibles (XML, Prolog, ASP) auditables por humanos.
- Trazabilidad de errores: un fallo en la pila FORTH puede rastrearse hasta la linea correspondiente en `corpus_tokens.xml` y la plantilla XSLT responsable.
- No incluye generacion de lenguaje natural, razonamiento conversacional, codigo, vision, tool calling ni capacidades multimodales.

## Casos de uso

- Enseñanza de sistemas simbolicos: PocketLearn sirve como material didactico para ilustrar la diferencia entre aprendizaje conexionista y simbolico, mostrando un pipeline completo de ILP, ASP y generacion de codigo en un solo proyecto.
- Auditoria de conocimiento en dominios restringidos: en entornos donde la explicabilidad es obligatoria (sector financiero, salud), este enfoque permite construir bases de reglas auditables a partir de corpus pequenos.
- Prototipado de ontologias: el pipeline puede usarse para descubrir automaticamente relaciones de clase (por ejemplo, `is_a(W, stack_op)`) a partir de textos tecnicos, acelerando la creacion manual de ontologias.
- Validacion de consistencia de conocimiento: el modulo ASP puede reutilizarse para verificar que un conjunto de reglas inducidas no contiene contradicciones logicas antes de desplegarlas en produccion.
- Generacion de vocabularios especializados: el sistema produce un diccionario FORTH a partir de un corpus, lo que puede servir para crear lenguajes de dominio especifico (DSL) minimos y ejecutables.
- Experimentacion en IA simbolica: investigadores pueden comparar este enfoque con tecnicas de deep learning para tareas de clasificacion simple de palabras en categorias, midiendo interpretabilidad frente a precision.
- Demo tecnica para conferencias o talleres: el proyecto incluye un `make demo` que muestra la induccion de reglas y la generacion FORTH en segundos, ideal para demostraciones en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no reporta metricas comparativas con modelos neuronales ni con otros sistemas simbolicos. El unico dato de rendimiento interno es la puntuacion F1 de las reglas inducidas en el ejemplo de demostracion (F1=0.60 para `stack_op`, F1=0.75 para `compiler_word`, F1=0.80 para `learning_word`), pero no hay benchmarks estandarizados como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No requiere GPU: el pipeline completo se ejecuta en CPU con herramientas de linea de comandos.
- Dependencias en macOS: `libxslt`, `swi-prolog`, `clingo`, `gforth` (instalables via Homebrew).
- Dependencias en Linux: `xsltproc`, `swi-prolog`, `gringo`, `gforth` (instalables via apt).
- Memoria RAM estimada: inferior a 1 GB para el corpus de ejemplo incluido.
- Disco: el proyecto ocupa unos pocos megas; los artefactos generados son archivos de texto pequenos.
- Despliegue: se ejecuta localmente mediante `make`; no hay opciones de despliegue como vLLM, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia: el pipeline completo se ejecuta en segundos en hardware moderno, como se muestra en la salida de `make`.

## Comparativa con modelos similares

No existe una categoria directa de comparacion con modelos de lenguaje convencionales, dado que PocketLearn no es una red neuronal. Si se compara con otros sistemas de induccion de logica inductiva clasicos:

| Sistema | Tipo | Lenguaje | Licencia | Disponibilidad |
|---|---|---|---|---|
| PocketLearn | Pipeline ILP + ASP + FORTH | Prolog, ASP, FORTH | No disponible | Repositorio publico en HuggingFace |
| Aleph (ILP clasico) | Induccion de logica inductiva | Prolog | Open source | Ampliamente disponible |
| Clingo (ASP) | Answer Set Programming | ASP | MIT | Disponible como binario |

La diferencia principal con Aleph es que PocketLearn integra la generacion del motor ILP via XSLT (meta-programacion) y anade validacion ASP y generacion FORTH en un solo pipeline. Frente a Clingo, PocketLearn anade la capa de induccion de reglas y la transformacion a FORTH. No hay modelos de lenguaje comparables en parametros, contexto o rendimiento porque no aplica.

## Limitaciones y advertencias

- El propio autor reconoce que el sistema "no descubrira semantica profunda" (it won't discover deep semantics), limitandose a relaciones de coocurrencia superficiales.
- El vocabulario es extremadamente reducido: 52 tokens en el tokenizador y 18 palabras en el FORTH generado para el corpus de ejemplo.
- No hay soporte para lenguaje natural complejo, generacion de texto, razonamiento conversacional ni tareas de NLP modernas.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- El proyecto depende de herramientas externas (SWI-Prolog, Clingo, Gforth, xsltproc) que deben instalarse manualmente; no hay contenedores ni instalacion automatizada.
- La fecha de creacion (2026-09-03) es futura respecto a la fecha de conocimiento actual, lo que sugiere que el proyecto podria ser experimental o especulativo.
- No hay soporte para otros idiomas documentado; el corpus de ejemplo esta en ingles.
- El sistema no incluye mecanismos de actualizacion incremental: cada ejecucion del pipeline parte del corpus original.
- La atribucion a un trust (EIN 42-697643) y el lema "Omega = TRUST AND CODE" anaden una capa de opacidad sobre la gobernanza del proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/pocketlearn
- Pagina de herramientas de SnapKitty: https://app.collectivekitty.com/tools
- Sitio web de PocketLearn (posiblemente no relacionado): https://www.pocketlearn.com/
- SWI-Prolog: https://www.swi-prolog.org/
- Clingo (ASP): https://potassco.org/clingo/
- Gforth: https://www.complang.tuwien.ac.at/forth/gforth/
