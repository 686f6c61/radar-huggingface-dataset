# krho/openbind-bc1-method-report

## Resumen

`krho/openbind-bc1-method-report` no es un modelo de pesos entrenado, sino un informe técnico de método publicado como repositorio de Hugging Face por KR LAB Bio Inc. (Republica de Corea) para el OpenBind Blind Challenge 1, en la pista de prediccion de estructuras. Describe la submission etiquetada internamente como v18, con alias de leaderboard "KR LAB Bio", que predice 400 complejos blinded de la proteasa NS2B-NS3 del virus Zika con ligandos.

La contribucion tecnica combina dos generadores de poses independientes: un pipeline de transplante de plantillas a partir de 294 entradas publicas del PDB mas docking exhaustivo con rescoring CNN (gnina), y un pipeline de co-folding basado en Protenix (`protenix_base_20250630_v1.0.0`, sin fine-tuning) que genera 10 muestras por ligando. La seleccion final usa el representante de co-folding cuando pasa las 22 comprobaciones de PoseBusters (337 ligandos) y recurre al pipeline de plantillas para los 63 restantes.

Es relevante porque documenta de forma cuantitativa el techo de rendimiento de los metodos de transplante de plantillas en un benchmark blinded, y muestra que el co-folding rompe ese plateau sin reentrenamiento, ademas de reportar resultados negativos y una discrepancia entre backtest y leaderboard en vivo que resulta instructiva para quien disene pipelines de evaluacion en drug discovery.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje; pipeline hibrido de transplante de plantillas + docking (Pipeline A) y co-folding con Protenix (Pipeline B) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | en (documentacion en ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | No disponible (repositorio de informe, no de pesos) |

## Arquitectura y entrenamiento

El repositorio contiene un informe de metodo, no pesos. El Pipeline A superpone las 294 estructuras publicas de NS2B-NS3 del Zika sobre el sitio de union de la apoestructura 29HN mediante Kabsch sobre atomos de backbone en un radio de 12 A del centro de la triada catalitica (RMSD de ajuste mediano de 0,15 A). Para cada ligando del reto se calcula el maximo subconjunto comun (MCS) con los ligandos de plantilla mas cercanos, se enumeran los mapeos atomicos posibles por simetria molecular, se trasplanta el MCS sobre las coordenadas experimentales y se construye y relaja el resto de la molecula. Sobre ese conjunto se anaden candidatos con docking exhaustivo y rescoring/refinamiento con la CNN de gnina, y una regla fija selecciona una pose entre una mediana de 66 candidatos usando consenso espacial entre plantillas independientes, recuperacion del patron de contactos de la plantilla y ranking CNN.

El Pipeline B emplea Protenix (`protenix_base_20250630_v1.0.0`, cutoff de entrenamiento 2025-06-30) sin fine-tuning, generando 10 muestras por ligando (2 semillas x 5 muestras de difusion) y eligiendo como representativa la muestra estereoquimicamente correcta en torno a la cual se agrupan la mayoria de las demas. Los enlaces y ordenes de enlace de los ligandos publicos se tomaron del PDB Chemical Component Dictionary por nombre de atomo en lugar de inferirse de coordenadas, lo que recupero 43 ligandos que la percepcion basada en coordenadas habia roto. No se usaron datos propietarios ni estructuras ni etiquetas del conjunto de test.

## Capacidades

- Prediccion de poses proteina-ligando (pose prediction) para complejos NS2B-NS3/ligando del virus Zika.
- Co-folding proteina-ligando con generacion de muestras multiples por difusion.
- Transplante de plantillas entre estructuras cristalograficas con enumeracion de mapeos atomicos por simetria.
- Docking exhaustivo con rescoring y refinamiento mediante CNN (gnina).
- Seleccion de pose por consenso espacial multi-plantilla y patron de contactos.
- Validacion estereoquimica y de calidad de pose con PoseBusters (22 comprobaciones).
- No soporta tool calling, agentes, vision, audio ni generacion de texto: no es un modelo generativo de lenguaje.

## Casos de uso

- Prediccion blinded de poses en campanas de descubrimiento: el pipeline se aplico a 400 ligandos sin acceso a las estructuras del test, lo que lo hace adecuado como referencia para evaluar metodos de co-folding en condiciones realistas.
- Priorizacion de compuestos en series quimicas con registro publico denso: dado que 369 de 400 ligandos comparten al menos la mitad de sus atomos pesados con un ligando publico (cobertura MCS mediana 0,833), el transplante de plantillas sirve como baseline rapido y barato antes de recurrir a co-folding.
- Benchmarking de co-folding sin fine-tuning: el informe cuantifica que Protenix base mejora el recuento de aciertos BiSyRMSD de 133 a 137 y el BiSyRMSD medio de 1,84 A a 1,70 A, util para calibrar expectativas sobre modelos preentrenados.
- Diseno de reglas de seleccion de pose: la documentacion de que tres cambios sucesivos en la regla de seleccion mejoraron el backtest leave-one-compound-out pero no movieron el recuento en vivo (133 en las tres submissions) sirve para evitar sobreajuste a validacion interna.
- Validacion de calidad estructural en pipelines de produccion: el uso de las 22 comprobaciones de PoseBusters como filtro de admision (200/200 poses pasaron) es replicable como etapa de control de calidad.
- Analisis de generalizacion temporal: la comparacion en 24 estructuras liberadas tras el cutoff de entrenamiento (9 aciertos del co-folding frente a 5 del Pipeline A) ofrece un protocolo para medir deriva de modelos con fecha de corte conocida.

## Benchmarks y rendimiento

Resultados de leaderboard en vivo (aproximadamente 200 de los 400 compuestos, recogidos el 2026-11-06 a las 11:34 UTC):

| Metrica | Valor |
|---|---|
| Tasa de exito | 68,5% (137 de 200) |
| BiSyRMSD < 1,5 A | 137 |
| lDDT-PLI > 0,8 | 155 |
| PoseBusters pass | 200 / 200 |
| BiSyRMSD medio | 1,70 A |
| lDDT-PLI medio | 0,837 |

Comparacion interna entre pipelines y backtest:

| Medicion | Pipeline A (plantillas) | Co-folding (Protenix) |
|---|---|---|
| Aciertos BiSyRMSD en vivo | 133 | 137 |
| BiSyRMSD medio en vivo | 1,84 A | 1,70 A |
| Aciertos BiSyRMSD < 1,5 A en 24 estructuras post-cutoff | 5 | 9 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- No disponible: el repositorio no publica requisitos de VRAM, GPU ni latencia.
- El Pipeline B depende de Protenix (`protenix_base_20250630_v1.0.0`), cuyos requisitos deben consultarse en la documentacion de dicho proyecto.
- El Pipeline A requiere docking exhaustivo y gnina, ademas de un conjunto de 294 estructuras del PDB superpuestas; el coste computacional no se detalla en el informe.
- Opciones de despliegue, latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| krho/openbind-bc1-method-report | Informe de metodo (pipeline hibrido) | No aplica | No aplica | 68,5% exito BiSyRMSD en vivo | cc-by-4.0 | Hugging Face (informe) |
| Protenix (`protenix_base_20250630_v1.0.0`) | Co-folding | No disponible | No disponible | 137 aciertos BiSyRMSD en este reto | No disponible en la informacion | Usado como componente del Pipeline B |
| gnina | Docking con rescoring CNN | No disponible | No disponible | Usado como generador y ranker en Pipeline A | No disponible en la informacion | Componente del Pipeline A |
| PoseBusters | Validacion de poses | No aplica | No aplica | 22 comprobaciones; 200/200 en esta submission | No disponible en la informacion | Componente de filtrado |

## Limitaciones y advertencias

- No es un modelo desplegable: el repositorio contiene un informe de metodo, no pesos ni artefactos de inferencia.
- El rendimiento esta fuertemente condicionado por la densidad del registro publico: 391 de los 400 ligandos tienen su plantilla mas cercana en la misma forma cristalina (P4₃22) que el reto, por lo que la tasa de exito no es extrapolable a dianas con menos estructuras publicas.
- La seleccion de pose se estanco en 133 aciertos BiSyRMSD en las tres submissions con reglas distintas, pese a mejoras en backtest; el propio autor advierte que las ganancias de backtest no se trasladaron al conjunto en vivo (+5,2 puntos en holdout frente a +0,5 en vivo).
- 39 ligandos no tuvieron ninguna muestra estereoquimicamente correcta en co-folding y 24 fallaron PoseBusters, lo que obligo a recurrir al Pipeline A en 63 casos.
- El cutoff de entrenamiento de Protenix (2025-06-30) limita la generalizacion a estructuras posteriores; en las 24 estructuras post-cutoff el acierto fue de 9 frente a 5 del Pipeline A, una mejora modesta sobre muestra pequena.
- Solo documentacion en ingles; no hay version en castellano.
- Licencia cc-by-4.0 permite uso comercial con atribucion, pero cubre el informe, no los componentes de terceros (Protenix, gnina, PoseBusters), cuyas licencias deben verificarse por separado.
- No se reportan sesgos de datos ni analisis de dominios quimicos fuera de la serie NS2B-NS3 del Zika.

## Enlaces

- Hugging Face: https://huggingface.co/krho/openbind-bc1-method-report
- OpenBind (sitio oficial): https://openbind.uk/
- Noticia sobre la primera release de datos y modelo de OpenBind (Phys.org): https://phys.org/news/2026-05-openbind-milestone-ai-enabled-drug.html
