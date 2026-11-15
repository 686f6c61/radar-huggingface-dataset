# indahl/indahl-qia-calibration

## Resumen

`indahl/indahl-qia-calibration` es un repositorio publicado en Hugging Face por el usuario `indahl` (Heuremen LLC) que no contiene un modelo de lenguaje, sino un plugin de calibración para ejecuciones en IBM Quantum. Su funcionamiento se articula en torno a dos comandos (`/qia-check` y `/qia-t1t2`) que verifican el registro de calibración del que depende una ejecución antes de lanzarla (detectando registros obsoletos, valores a cero, T2 superior a 2xT1 o medidas de T1 y T2 tomadas con mucha separación temporal) y analizan después qué registro estuvo en vigor y qué cambió durante la ejecución.

El paquete se distribuye como plugin para el marketplace de Claude (`/plugin marketplace add Heuremen-LLC/indahl.ai`) y genera como salida un informe HTML y un fichero JSON con el sha256 de cada entrada antes y después del proceso. Incluye además una comprobación de T1/T2 en un mismo job sobre qubits seleccionados, con un modo de autotest que no requiere dispositivo ni cuenta.

Es relevante ahora porque aborda un problema práctico de reproducibilidad en computación cuántica: garantizar que los resultados de una ejecución se interpretan contra la calibración correcta del backend. No obstante, la ficha de Hugging Face no contiene pesos, arquitectura de red ni datos de entrenamiento, por lo que las secciones habituales de un modelo de IA se completan con "no disponible" donde corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un plugin de calibración para IBM Quantum) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene ficheros ejecutables; los scripts se descargan desde GitHub a un commit fijado y se validan por sha256) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. El componente técnico es un conjunto de scripts en Python (`qia_check.py` y `run_check.py`) que se ejecutan como comandos del plugin. `qia_check.py` usa únicamente la biblioteca estándar de Python (requiere Python 3.9 o superior), mientras que la medición T1/T2 requiere `qiskit`, `qiskit-ibm-runtime`, `qiskit-aer`, `numpy` y `scipy`, instalados solo con consentimiento del usuario y con una cuenta propia de IBM Quantum.

La integridad del código se garantiza mediante descarga desde el repositorio público `github.com/Heuremen-LLC/indahl.ai` en un commit fijado y verificación de sha256 antes de ejecutar: `81e0444d70a4325f9df4ac07737cfc0b3c6089ab66837fa3b07db158b8bec06f` para `qia_check.py` y `16571a2f3f75b8336d08b5815540e59eefc5d1da88f0669572279e7f1f2f016a` para `run_check.py`. No hay datos de entrenamiento, RLHF ni innovaciones de decodificación que reportar.

## Capacidades

- Verificación previa a una ejecución: analiza un registro guardado (`backend_properties.json`) y marca anomalías agrupadas en cifras de T1/T2 o de error.
- Verificación posterior: identifica el registro en vigor al inicio, los registros intermedios durante la ejecución y los cambios producidos.
- Detección de patrones problemáticos: registros obsoletos, valores a cero, T2 superior a 2xT1 y medidas de T1 y T2 tomadas con separación temporal amplia.
- Medición conjunta de T1 y T2 en un mismo job sobre qubits seleccionados y comparación del ratio con el par publicado por IBM.
- Generación de informe HTML y fichero JSON con sha256 de cada entrada antes y después.
- Autotest sin dispositivo ni cuenta (`/qia-t1t2 --selftest`).
- Selección de qubits por lista (`--qubits 0,1,5`) y filtrado por backend (`--backend B`).
- Modo estimación (`--estimate`) para la comprobación T1/T2.

## Casos de uso

- Auditoría previa de ejecuciones en IBM Quantum: antes de lanzar un job costoso, el comando `/qia-check before backend_properties.json --qubits 0,1,5` señala si el registro de calibración está obsoleto o contiene valores anómalos, evitando gastar tiempo de cola en qubits mal calibrados.
- Reproducibilidad de resultados: tras una ejecución, `/qia-check after <records_dir> --start <UTC> --end <UTC>` documenta qué registro estaba en vigor y qué cambió, lo que permite justificar resultados en publicaciones o informes técnicos.
- Validación de integridad de datos: el informe HTML y el JSON con sha256 antes y después permiten demostrar que las propiedades del backend no se alteraron entre la captura y el análisis.
- Medición de coherencia T1/T2 en un solo job: `/qia-t1t2 --backend B --qubits 85,12 --estimate` mide ambos tiempos en la misma ejecución y compara el ratio con el publicado por IBM, detectando discrepancias entre la calibración oficial y la observada.
- Integración en flujos de CI para circuitos cuánticos: el chequeo basado solo en biblioteca estándar (Python 3.9+) puede ejecutarse en un runner sin dependencias pesadas para bloquear pipelines cuando el registro de calibración no cumple umbrales.
- Formación y revisión metodológica: el autotest (`/qia-t1t2 --selftest`) permite a un equipo validar el comportamiento del plugin sin cuenta ni dispositivo, útil en entornos docentes o de auditoría interna.
- Gestión de costes en experimentos: al exigir confirmación explícita ("your explicit yes") antes de contactar con IBM Quantum y al no lanzar ejecuciones de pago desde el plugin, se reduce el riesgo de consumir créditos por error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un plugin de scripts en Python, no un modelo neuronal.
- CPU y Python 3.9 o superior para `qia_check.py` (solo biblioteca estándar).
- Para la medición T1/T2: `qiskit`, `qiskit-ibm-runtime`, `qiskit-aer`, `numpy` y `scipy`, además de una cuenta propia de IBM Quantum.
- El coste real de cómputo lo aporta el backend cuántico de IBM Quantum, no el plugin.
- Despliegue mediante el marketplace de Claude (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-qia-calibration@heuremen`).
- Latencia y throughput: no disponibles; dependen de la cola y del backend de IBM Quantum.

## Comparativa con modelos similares

| Herramienta | Tipo | Dependencias | Verificación de integridad | Licencia |
|---|---|---|---|---|
| indahl-qia-calibration | Plugin de calibración IBM Quantum | Python 3.9+ (chequeo); qiskit y afines (T1/T2) | sha256 por script y por entrada | no disponible |
| qiskit-ibm-runtime (oficial de IBM) | SDK de acceso a backends | qiskit, qiskit-ibm-runtime | no aplica | Apache 2.0 (según el proyecto Qiskit) |
| Qiskit Experiments | Framework de caracterización | qiskit, numpy, scipy | no aplica | Apache 2.0 (según el proyecto Qiskit) |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje; cualquier expectativa de uso como LLM es incorrecta.
- La licencia no está indicada en la ficha de Hugging Face, por lo que el uso comercial queda sin marco explícito hasta consultar los términos en `https://indahl.ai/terms`.
- El repositorio de Hugging Face no contiene ficheros ejecutables: el código se descarga en tiempo de ejecución desde GitHub a un commit fijado. Si el repositorio de GitHub desaparece o cambia, los comandos pueden fallar aunque el sha256 esté fijado.
- El plugin contacta con dos servicios externos: IBM Quantum (solo bajo petición explícita y con cuenta propia) e `indahl.ai` (`https://indahl.ai/qia/audit.json`, lectura pública de la lista de qubits marcados). Cualquier uso en entornos con restricciones de red debe revisarse.
- La medición T1/T2 requiere instalar dependencias adicionales (qiskit y afines) y disponer de cuenta de IBM Quantum; el chequeo básico no.
- Depende de la disponibilidad y del formato de los registros de calibración de IBM Quantum; cambios en la API o en el esquema de `backend_properties.json` pueden romper el análisis.
- No se han publicado métricas de precisión, cobertura de detección ni tasas de falsos positivos del chequeo.
- La fecha de creación indicada (2026-11-15) y la referencia a una revisión externa de noviembre de 2026 deben contrastarse con la documentación oficial del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-qia-calibration
- Sitio del proyecto: https://indahl.ai
- Lista pública de qubits marcados: https://indahl.ai/qia/audit.json
- Privacidad: https://indahl.ai/privacy
- Términos: https://indahl.ai/terms
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/plugins/qia-calibration
- Script `qia_check.py` (commit fijado): https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/8eb90a0f63bc694ccc6b53af485d1731b7a20956/claude-plugins/src/qia-calibration/scripts/qia_check.py
- Script `run_check.py` (commit fijado): https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/744bcd22548a29dcdc5a261477faccaeebc6938d/claude-plugins/plugins/qia-calibration/t1t2/run_check.py
