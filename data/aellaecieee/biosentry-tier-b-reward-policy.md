# Aellaecieee/biosentry-tier-b-reward-policy

## Resumen

BioSentry Tier B es un artefacto de política de alerta temprana publicado por el usuario Aellaecieee dentro del proyecto BioSentry, un sistema de listado de pacientes con alerta temprana basado en la escala NEWS2 desarrollado para la Huawei ICT Competition. A pesar de estar alojado en Hugging Face con la etiqueta `reinforcement-learning`, no se trata de una red neuronal: el repositorio contiene un fichero `policy.json` con seis números que definen una regla de alerta, obtenidos mediante un bucle de recompensa (generar, puntuar, aceptar un paso solo si un lote nuevo lo confirma).

El modelo resuelve un problema muy acotado: explorar si una regla de alerta aprendida puede complementar a NEWS2 en un entorno simulado. Se entrenó exclusivamente con datos sintéticos generados por el simulador del proyecto (variante `ward-v2-ext`, semillas de generación 401-500 y validación 341-400) y se evaluó una única vez sobre un conjunto reservado (`ward-v2`, semillas 11-30). El autor declara explícitamente que el modelo perdió: en un conjunto de 400 ensayos, NEWS2 más esta política puntuó por debajo del azar (ganancia de -0,0127), por lo que no se usa como bandera de sala y queda como resultado de investigación.

Su relevancia es, por tanto, metodológica y no operativa: documenta de forma transparente un resultado negativo en el diseño de políticas de alerta sanitaria con datos sintéticos. No está validado en pacientes reales, no sustituye a NEWS2 (Tier A nunca se modifica ni se aprende) y no está conectado a ninguna decisión clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal; regla de alerta parametrizada por seis números en `policy.json` |
| Parametros totales | 6 valores numéricos (política); no aplica recuento de parámetros de red |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`policy.json`, variante `no_temperature/policy.json`); tabla de evaluación en `held_out.txt` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal. El artefacto es una regla de alerta con seis parámetros, descubierta mediante un bucle de recompensa: se generan candidatos, se puntúan y solo se acepta un paso si un lote de datos nuevo lo confirma. Existe una variante (`no_temperature/policy.json`) que ignora la temperatura del paciente. La política se aplica desde el módulo `backend/src/biosentry/domain/scoring/tier_b/reward_policy.py` del repositorio del panel BioSentry.

Los datos son íntegramente sintéticos, producidos por el simulador del proyecto: ensayos `ward-v2-ext` con semillas de generación 401-500 y validación 341-400. La evaluación final se hizo sobre el conjunto reservado `ward-v2` (semillas 11-30) y se puntuó una sola vez. No se usaron datos de pacientes reales ni para entrenar ni para seleccionar el modelo. El autor advierte de que todos los resultados son circulares, pues entrenamiento y evaluación comparten el mismo simulador.

## Capacidades

- Emisión de alertas de deterioro según una regla fija de seis parámetros sobre variables de sala simuladas.
- Funcionamiento en modo "silencioso": 0,153 alertas por paciente cada 12 horas, frente a 0,414 de NEWS2.
- Variante que ignora la temperatura del paciente (`no_temperature`).
- Evaluación reproducible sobre una tabla reservada documentada (`held_out.txt`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Estudio de resultados negativos en investigación: sirve como referencia documentada de una política aprendida que no supera a NEWS2, útil para calibrar expectativas en proyectos de alerta temprana.
- Reproducción metodológica: el bucle de recompensa (generar, puntuar, confirmar con lote nuevo) puede replicarse con otros simuladores para comparar estrategias de selección de reglas.
- Docencia sobre circularidad en datos sintéticos: el caso ilustra por qué entrenar y evaluar en el mismo simulador invalida las conclusiones clínicas.
- Análisis de parsimonia en alertas: con 0,153 alertas por paciente cada 12 horas frente a 0,414 de NEWS2, permite estudiar el compromiso entre sensibilidad y carga de alertas en entornos simulados.
- Integración como módulo de referencia en el panel BioSentry: el código de `reward_policy.py` muestra cómo conectar una política externa con la puntuación NEWS2 sin modificarla.
- Auditoría de decisiones de modelo: el registro de la decisión del propietario (`models-rl-5`) documenta el criterio de descarte y puede usarse como plantilla de gobernanza de modelos en proyectos sanitarios.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Alertas por paciente cada 12 h (política sola) | 0,153 |
| Alertas por paciente cada 12 h (NEWS2) | 0,414 |
| Ganancia de NEWS2 + política sobre 400 ensayos | -0,0127 (por debajo del azar) |
| Ganancia de NEWS2 + política sobre conjunto reservado | Sin ganancia más allá del azar |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; la política es un JSON de seis números que se carga en memoria convencional.
- GPU: no se requiere ninguna GPU.
- GPU de consumo: irrelevante; funciona en cualquier CPU.
- Despliegue: carga mediante `huggingface_hub.hf_hub_download` y `json.load`; se aplica desde el módulo `reward_policy.py` del repositorio del panel.
- Latencia y throughput: no disponibles; al ser una regla aritmética, el coste es despreciable frente a cualquier inferencia neuronal.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BioSentry Tier B | Regla de alerta (6 números) | 6 valores | No aplica | Ganancia -0,0127 sobre 400 ensayos; 0,153 alertas/paciente/12 h | Apache-2.0 | Hugging Face |
| NEWS2 | Escala clínica validada | No aplica | No aplica | 0,414 alertas/paciente/12 h en el simulador del proyecto | Estándar clínico | Pública |
| Alternativas neuronales de alerta temprana | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado en el simulador propio del proyecto: todos los resultados son circulares y no demuestran funcionamiento en una sala real.
- El modelo perdió: NEWS2 más esta política puntuó por debajo del azar (ganancia -0,0127) en un conjunto de 400 ensayos; no se usa como bandera de sala.
- Los resultados del conjunto reservado se puntuaron una sola vez por procedimiento, pero el código no lo garantiza.
- Efectos pequeños y ausencia de barras de error en algunas cifras.
- No validado en pacientes reales; no usar en clínica. Un clínico decide siempre.
- No sustituye a NEWS2: Tier A nunca se modifica ni se aprende.
- Solo datos sintéticos; no se usó ningún dato real de pacientes para entrenar ni para seleccionar el modelo.
- Licencia Apache-2.0 para los ficheros del repositorio, sin restricciones comerciales declaradas, pero el uso clínico queda fuera del alcance previsto.
- Idiomas soportados no disponibles (no aplica al no ser un modelo de lenguaje).

## Enlaces

- Hugging Face: https://huggingface.co/Aellaecieee/biosentry-tier-b-reward-policy
- Repositorio del panel y código: https://github.com/kitchen-station/BioSentry-Intelligence
- Model card completa en el repositorio: `models/<tier>/<name>/card.md`
