# infosecn1nja/laya-soc-bounded-triage

## Resumen

Laya SOC bounded auto-triage (repositorio `infosecn1nja/laya-soc-bounded-triage`) es una tarjeta de configuración y evaluación pública para una capa de auto-triaje acotado en SOC, construida sobre el modelo Laya (`convaiinnovations/laya`) y diseñada para integrarse con Wazuh. Importante: el repositorio **no contiene un checkpoint del modelo**, sino la política de decisión (versión `laya-soc-v1`, policy 1.3.2), el catálogo de supresiones, las reglas de enrutado y los resultados de evaluación agregados. Los pesos experimentales fine-tuned (solo laboratorio) se publican aparte en `infosecn1nja/laya-soc-ft-lab`.

El problema que aborda es la saturación de alertas en centros de operaciones de seguridad: en lugar de cerrar o suprimir alertas automáticamente con el modelo, el sistema aplica acciones acotadas (supresión determinista con patrones exactos, etiquetado operativo, escalado a Tier 2 y cola humana), prohibiendo explícitamente el auto-cierre por parte del modelo. Es relevante porque propone un patrón conservador y auditable de automatización en SOC, con invariantes verificables (`model_auto_close=false`) y métricas de capacidad y calibración publicadas con sus limitaciones documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Laya, `convaiinnovations/laya`) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (este repositorio es una tarjeta de configuracion, no un checkpoint; los pesos experimentales estan en `laya-soc-ft-lab`) |

## Arquitectura y entrenamiento

El sistema no es un modelo monolitico sino un motor de decision hibrido: cuatro acciones (`SUPPRESS_KNOWN_BENIGN`, `TAG_OPERATIONAL`, `ESCALATE_TIER2`, `QUEUE_TIER1`), de las cuales solo el escalado a Tier 2 involucra al modelo, y solo para enrutado (umbral `p(true_positive) >= 0.99`, con tope del 10 % del volumen). La supresion es completamente determinista: seis patrones exactos sobre reglas de Wazuh (92213, 92205, 92110, 92058, 92217), con guardas obligatorias (ruta exacta de imagen, proceso padre, firma/editor, lista de agentes permitida y regla de denegacion para lineas de comando sospechosas como `-enc`, `FromBase64`, `certutil`, `mshta`, `rundll32`). La lista de agentes permitida se distribuye vacia, por lo que la supresion es inerte hasta que un operador la configura.

Sobre el modelo subyacente, la informacion disponible indica que se trata de un fine-tune experimental de Laya (base Apache-2.0) entrenado para clasificar alertas como `true_positive`, con salida adicional `needs_human` no validada de forma independiente. No se publican datos sobre numero de tokens, composicion del dataset de entrenamiento ni uso de RLHF/DPO. La evaluacion se realizo sobre un split rule-disjoint de 308 alertas (97 positivas / 211 benignas) con etiquetas derivadas de una rubrica de contenido, no de dispositions de analistas.

## Capacidades

- Clasificacion de alertas de SOC como `true_positive` (entrenada y evaluada), con salida advisory `needs_human` (umbral 0.0, no validada).
- Enrutado de alertas a Tier 2 cuando `p(true_positive) >= 0.99`, con tope del 10 % del volumen.
- Supresion determinista de ruido conocido mediante 6 patrones exactos con guardas multiples (imagen, padre, firma, allowlist, deny de comandos sospechosos).
- Etiquetado de 10 clases operativas de Wazuh (taskschd.dll, cambios de servicio, syscheck de registro, ficheros de scripting, etc.) para revision humana, nunca cierre automatico.
- Pack de hunting independiente con 51 reglas (v9): movimiento lateral estilo SANS Hunt Evil, LOLBins, WMI/DCOM/SMB, tareas programadas, servicios, RDP, PsExec, MSSQL, named pipes y artefactos de registro.
- Prohibicion en runtime de auto-cierre y auto-supresion por parte del modelo (`model_auto_close=false`, verificada por el motor de decision).
- No soporta (en esta release): salidas `severity` y `category` (definidas en config pero no usadas ni validadas), ni probabilidades calibradas de incidente real.

## Casos de uso

- **Reduccion de ruido en Wazuh con triaje acotado:** las 6 supresiones con guardas estrictas eliminan falsos positivos recurrentes (por ejemplo, `__PSScriptPolicyTest_*.ps1` en PowerShell) sin riesgo de suprimir ataques, ya que ninguna alerta etiquetada como ataque coincidio con los patrones en la muestra de 2.400 alertas.
- **Priorizacion de cola de analistas Tier 1:** el escalado con `p >= 0.99` y tope del 10 % permite sacar a los candidatos mas probables de la cola humana (2.143 de 2.400 alertas permanecen en cola), priorizando la atencion del analista.
- **Etiquetado de alertas operativas:** 39,5 % de la muestra se etiqueta como operativa y se encola para revision, ayudando a separar ruido de infraestructura de posibles incidentes sin cerrar nada automaticamente.
- **Threat hunting con EVTX:** el pack de 51 reglas de hunting procesa corpora de logs de Windows; en 50 muestras de movimiento lateral (`EVTX-ATTACK-SAMPLES`) genero 1.308 alertas con 258 hits en 44/50 ficheros.
- **Auditoria y cumplimiento de automatizacion:** la invariante `model_auto_close=0` y el muestreo de auditoria del 5 % de supresiones permiten demostrar a auditoria o reguladores que el modelo nunca cierra alertas.
- **Planificacion de capacidad de un SOC:** con ~7 alertas/s en Apple MPS (batch 8) y ~2,5 GB de RSS, el sistema procesa ~606k alertas/dia; 100k alertas/dia equivalen a un batch de unas 4 horas.
- **Plantilla de despliegue seguro de IA en seguridad:** la estructura de guardas, caps y evaluacion rule-disjoint sirve como referencia para equipos que quieran automatizar triaje sin auto-cierre.

## Benchmarks y rendimiento

Resultados de la evaluacion del fine-tune experimental sobre 308 alertas rule-disjoint (etiquetas de rubrica de contenido, no de analistas):

| Metrica | Valor |
|---|---|
| AUROC | 1,000 |
| Recall @ umbral 0,99 | 1,000 |
| FPR @ umbral 0,99 | 0,000 |
| Precision @ umbral 0,99 | 1,000 |
| ECE bruto | 0,245 (temperatura del checkpoint `noul=0,5`) |
| Accuracy @ umbral 0,50 | 0,643 |
| Recall / FPR @ umbral 0,50 | 1,000 / 0,521 |

Resultados de la evaluacion de politica sobre 2.400 alertas de laboratorio:

| Accion | Recuento | Porcentaje |
|---|---|---|
| Suprimidas (guardas estrictas) | 17 | 0,7 % |
| Suprimidas etiquetadas como ataque | 0 | — |
| Etiquetadas operativas | 949 | 39,5 % |
| Escaladas (`p >= 0,99`, cap 10 %) | 240 | 10,0 % |
| Cola humana | 2.143 | 89,3 % |
| `model_auto_close` | 0 | invariante |

El propio autor advierte que **no deben interpretarse como precision de produccion**: las etiquetas son de rubrica derivada de reglas, el split temporal no tiene positivos, y el umbral 0,99 se valido en un unico split que debe revalidarse. La calibracion por temperatura empeoro el ECE (0,191 → 0,256) y no se distribuye fichero de calibracion.

## Requisitos de hardware

- Consumo medido en el test de escala: ~2,5 GB de RSS y ~7 alertas/s en Apple MPS con batch 8; no se publican cifras de VRAM para GPU NVIDIA.
- No disponible: modelos de GPU recomendados (A100, H100, RTX 4090, etc.) ni compatibilidad concreta con GPUs de consumo; el unico dato es el rendimiento en Apple Silicon via MPS.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el sistema se integra con Wazuh como capa de triaje y usa la libreria `laya`.
- Throughput estimado: ~606k alertas/dia en la configuracion de prueba; 100k alertas/dia suponen ~4 h de procesamiento por batch. Con caps de 5.000 supresiones/dia y 200 escalados/hora, a 1M alertas/dia los caps limitan la automatizacion al ~0,5 % del volumen.

## Comparativa con modelos similares

| Aspecto | Laya SOC bounded triage | Modelo SOC generico tipico | Enfoque SOAR determinista puro |
|---|---|---|---|
| Naturaleza | Politica + motor de decision con modelo solo para enrutado | Checkpoint clasificador/generador | Reglas sin ML |
| Auto-cierre por modelo | Prohibido por politica | Variable, a menudo permitido | No aplica |
| Supresion | 6 patrones exactos con guardas multiples | Aprendida, menos auditable | Reglas manuales |
| Licencia | Apache-2.0 | No disponible | No disponible |
| Datos de evaluacion publicos | Si, con limitaciones documentadas | No disponible | No disponible |

No hay alternativas concretas comparables publicadas en la informacion disponible; la comparacion anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- **No es un checkpoint:** el repositorio contiene configuracion y evaluacion; los pesos experimentales son lab-only y estan en otro repositorio.
- **Riesgo de fuga de reglas:** las etiquetas son una rubrica derivada de reglas, no dispositions reales de analistas; el split aleatorio da 100 % de accuracy por fuga de reglas y no se usa.
- **Calibracion deficiente:** ECE bruto de 0,245; la calibracion por temperatura empeoro el resultado y no se distribuye. Ninguna salida debe tratarse como probabilidad calibrada de incidente real.
- **Salidas no validadas:** `needs_human` es solo advisory (umbral 0,0); `severity` y `category` no se usan ni validan en esta release.
- **Validacion limitada:** el umbral 0,99 se valido en un unico split de 308 filas; el split temporal carece de positivos, por lo que el recall no es ahi medible.
- **Caps que limitan:** a gran volumen (1M alertas/dia) los caps de supresion y escalado reducen la automatizacion a ~0,5 % del volumen; no extrapolar el 0,7 % de la muestra.
- **Supresion inerte por defecto:** la allowlist de agentes se distribuye vacia a proposito; requiere configuracion del operador.
- **Idioma:** el modelo esta etiquetado solo para ingles; no hay informacion sobre rendimiento en castellano.
- **Uso comercial:** Apache-2.0 lo permite, pero el autor califica el despliegue de solo-modelo con decision automatica como **NO-GO**; el alcance de produccion es triaje acotado con revision humana.
- El pack de hunting usa datos de corpus con licencias de terceros (GPL-3.0 para `EVTX-ATTACK-SAMPLES`, CC0-1.0 para `EVTX-to-MITRE-Attack`), lo que puede condicionar la redistribucion derivada.

## Enlaces

- Tarjeta de configuracion: https://huggingface.co/infosecn1nja/laya-soc-bounded-triage
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Pesos experimentales (lab-only): https://huggingface.co/infosecn1nja/laya-soc-ft-lab
- Pack de hunting (directorio `hunting/` en el repositorio): https://huggingface.co/infosecn1nja/laya-soc-bounded-triage/tree/main/hunting
- Corpus de evaluacion de hunting (EVTX-ATTACK-SAMPLES): https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES
- Corpus de evaluacion de hunting (EVTX-to-MITRE-Attack): https://github.com/mdecrevoisier/EVTX-to-MITRE-Attack
- Paper, demo o blog: no disponible
