# racklab/BankShot-Search

## Resumen

BankShot Search es un modelo de recuperación de texto (text-retrieval) desarrollado por Rack Lab, publicado en Hugging Face bajo el identificador `racklab/BankShot-Search` en su versión v0.1.0-preview, marcada explícitamente como *research release*. No es un modelo generativo generalista: su función es recuperar referencias fuente para tres dominios concretos —retiradas de vehículos (recalls), seguridad en fabricación y soporte del grabador Frigate— dentro de un catálogo publicado de 10.000 documentos. El paquete incluye pesos ONNX para CPU y un IR en FP16 destinado al Intel Neural Compute Stick original (NCS1, USB ID `03E7:2150`).

La arquitectura se describe como una combinación de un "scorer" y "rerankers" aprendidos que se ejecutan en el dispositivo, mientras que el host se encarga de la tokenización, la recuperación léxica y el ensamblado de resultados. El modelo se apoya en referencias de entrenamiento de BGE-small (para el estudiante denso) y en puntuaciones de un teacher MiniLM para dos cabeceras de sección de 481 parámetros. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato ONNX e IR de OpenVINO.

Su relevancia actual es acotada pero específica: demuestra un pipeline de recuperación de extremo a extremo que cabe en hardware de borde muy limitado (un acelerador USB de primera generación), con latencias p95 medidas de 13-28 ms según el vertical. No obstante, el propio autor advierte de que la aceptación independiente de la release está pendiente, que la política de abstención en desarrollo no superó el umbral de calificación y que la prosa general puede devolver coincidencias débiles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación con scorer denso (estudiante de BGE-small) y dos cabeceras de sección de 481 parámetros (teacher MiniLM); recuperación léxica en el host |
| Parametros totales | No disponible (el paquete incluye un estudiante denso y dos cabeceras de 481 parámetros; el total del estudiante no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX para CPU e IR FP16 para Intel NCS1; no se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (código y artefactos originales); el catálogo preserva referencias de NHTSA, GovInfo y documentación de Frigate bajo MIT |
| Formato de pesos | ONNX (CPU) e IR de OpenVINO FP16 (NCS1) |

## Arquitectura y entrenamiento

El sistema se organiza en dos planos. En el host se ejecutan la tokenización, la recuperación léxica y el ensamblado de resultados; en el dispositivo (NCS1 o CPU) se ejecuta el scorer aprendido y los rerankers. El componente denso es un estudiante entrenado a partir de referencias de BGE-small (`BAAI/bge-small-en-v1.5`), y las dos cabeceras de sección de 481 parámetros se entrenan con puntuaciones de un teacher MiniLM (`cross-encoder/ms-marco-MiniLM-L6-v2`). El catálogo de 10.000 documentos congela versiones de fuentes públicas (NHTSA, GovInfo y documentación de Frigate), con procedencia registrada en `catalog/freeze.json`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal; el interés técnico reside en el despliegue sobre un acelerador USB de primera generación con un contrato de recuperación idéntico entre CPU y dispositivo. El pipeline se invoca mediante `runtime/bankshot.py` y `runtime/bankshot_field_replay.py`, con backends `cpu` y `ncs1`.

## Capacidades

- Recuperación de referencias fuente para retiradas de vehículos (campañas NHTSA), seguridad en fabricación (normas OSHA) y soporte del grabador Frigate.
- Reranking de candidatos dentro de un catálogo de 10.000 documentos.
- Ejecución en CPU (ONNX Runtime) y en Intel Neural Compute Stick original (OpenVINO 2020.3.2, Python 3.7 en Windows).
- Contrato de recuperación unificado entre CPU y dispositivo, lo que permite réplicas de campo con `bankshot_field_replay.py`.
- Soporte de etiquetas de caso y trazas de resultados (archivos `examples/cases.json`, `ncs1-results.json`, `cpu-results.json`).
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling, agentes, visión, audio o modo de razonamiento: no disponible (no es un modelo generativo).

## Casos de uso

- Búsqueda de campañas de retirada de vehículos: dado un síntoma o componente (por ejemplo, "conector del soplador del Honda Ridgeline"), el modelo devuelve la campaña NHTSA correspondiente; en el ejemplo etiquetado acierta en rango 1.
- Cumplimiento normativo en planta: consulta de normas OSHA (bloqueo durante mantenimiento, salidas bloqueadas) con recuperación de la referencia exacta (29 CFR 1910.147, 1910.37) para auditar procedimientos.
- Soporte técnico de Frigate: localización de la sección de troubleshooting adecuada cuando faltan grabaciones de cámara, con resultado en rango 1 en el ejemplo publicado.
- Despliegue en entornos sin conectividad: al ejecutarse en un NCS1 vía USB con un host modesto, encaja en instalaciones industriales o vehículos donde no se quiere enviar consultas a la nube.
- Réplica y validación de campo: el script `bankshot_field_replay.py` permite reproducir casos etiquetados contra el catálogo congelado y comparar trazas CPU frente a dispositivo.
- Prototipado de recuperación de bajo coste: sirve como referencia para construir pipelines de retrieval con un estudiante denso pequeño y cabeceras ligeras sobre hardware de borde.
- Evaluación de hardware heredado: útil para medir latencia y precisión de un acelerador USB de primera generación en tareas de scoring, con p95 de 13-28 ms según el vertical.

## Benchmarks y rendimiento

Datos de desarrollo publicados por el autor (mediciones emparejadas sobre el catálogo de 10.000 documentos):

| Vertical | Top-ten (NCS1) | p95 NCS1 |
|---|---:|---:|
| Dealership | 147/151 | 28,1 ms |
| Manufacturing | 25/25 | 15,6 ms |
| Store security | 23/24 | 13,0 ms |

En CPU, el mismo candidato acertó 198/200 rangos objetivo físicos y presentó p95 inferior en los tres verticales sobre el host medido. La aceptación independiente de la release está pendiente y la política de abstención en desarrollo no calificó. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el paquete ocupa 0,1 GB y está pensado para CPU y NCS1, no para GPU.
- GPU recomendadas: no aplica; el despliegue objetivo es CPU (ONNX Runtime) e Intel Neural Compute Stick original.
- Consumer GPU: no se contempla en la documentación.
- NCS1: requiere un stick original en frío con USB ID `03E7:2150`, OpenVINO 2020.3.2 en Windows y Python 3.7, con `BANKSHOT_NCS1_ROOT` apuntando al directorio de herramientas (`ov2020`, `redist`).
- CPU: Python 3.11 o superior, con `numpy`, `scipy` y `onnxruntime`.
- Opciones de despliegue: scripts propios (`runtime/bankshot.py`, `runtime/bankshot_field_replay.py`) sobre ONNX Runtime u OpenVINO; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p95 de 28,1 ms (dealership), 15,6 ms (manufacturing) y 13,0 ms (store security) en NCS1; menor en CPU según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BankShot Search | Retrieval específico de dominio con scorer en borde | No disponible (cabeceras de 481) | No disponible | MIT | Hugging Face, v0.1.0-preview |
| BGE-small-en-v1.5 | Embedding denso generalista | No disponible en la información | No disponible | No disponible en la información | Hugging Face |
| ms-marco-MiniLM-L6-v2 | Cross-encoder de reranking | No disponible en la información | No disponible | No disponible en la información | Hugging Face |

BankShot se distingue por su orientación a hardware de borde (NCS1) y a un catálogo cerrado de tres dominios, frente a los modelos generalistas que usa como referencias de entrenamiento. No se dispone de datos comparativos de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Versión preview de investigación: la aceptación independiente de la release está pendiente.
- La política de abstención en desarrollo no calificó; el modelo puede devolver coincidencias débiles ante entradas fuera de dominio.
- La prosa general puede producir coincidencias pobres; está diseñado para consultas dentro de los tres verticales del catálogo.
- Solo inglés.
- Catálogo cerrado de 10.000 documentos con versiones congeladas; no cubre fuentes nuevas sin reconstruir el catálogo.
- En el ejemplo etiquetado, "Exposed rotating lathe chuck" quedó fuera del top 10 en NCS1, lo que evidencia fallos de recuperación en casos concretos.
- Dependencia de un hardware obsoleto (NCS1) y de un stack antiguo (OpenVINO 2020.3.2, Python 3.7 en Windows) para el despliegue físico.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos en la recuperación.
- Licencia MIT para código y artefactos; el catálogo preserva referencias de terceros (NHTSA, GovInfo, Frigate) cuyas condiciones deben revisarse antes de uso comercial.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racklab/BankShot-Search
- Demo de búsqueda: https://huggingface.co/spaces/racklab/BankShot-Search
- The Break Room: https://huggingface.co/spaces/racklab/The-Break-Room
- Checksums del paquete: `./release.json`
- Etiquetas de caso: `./examples/cases.json`
- Traza NCS1: `./examples/ncs1-results.json`
- Traza CPU: `./examples/cpu-results.json`
- Datos de comparación: `./measurements/development-comparison.json`
- Procedencia del catálogo: `./catalog/freeze.json`
- Aviso de Frigate: `./catalog/FRIGATE-LICENSE`
- BGE-small: https://huggingface.co/BAAI/bge-small-en-v1.5
- MiniLM reranker: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
- Compatibilidad del runtime de Intel: https://www.intel.com/content/www/us/en/support/articles/000091265/software.html
- Toolchain original: https://github.com/chadstthomas-svg/myriadforge
