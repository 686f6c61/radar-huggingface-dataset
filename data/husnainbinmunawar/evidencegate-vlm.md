# husnainbinmunawar/evidencegate-vlm

## Resumen

EvidenceGate-VLM es un repositorio de investigación publicado en Hugging Face por el usuario `husnainbinmunawar` que no contiene un modelo con pesos propios entrenados por el autor, sino un sistema ejecutable completo ("vertical slice") para razonamiento multimodal restringido por evidencia en tareas de inspección visual. El sistema integra una API FastAPI con persistencia SQLite, almacenamiento local de artefactos, una interfaz Next.js y una política de decisión que clasifica cada inspección como `ACCEPT`, `REJECT`, `REVIEW` o `ABSTAIN`.

El componente de visión no es un detector de anomalías entrenado: la línea base es determinista y documentada, y genera puntuaciones por imagen, mapas de calor, regiones de componentes conexas y cajas delimitadoras a partir de la imagen enviada. La parte de visión-lenguaje es opcional y delega en `Qwen/Qwen3-VL-4B-Instruct` a través de la interfaz multimodal de Transformers; si faltan pesos, dependencias o hardware compatible, el sistema registra `MODEL_UNAVAILABLE` en lugar de fabricar una respuesta.

Su interés actual es metodológico: propone separar la capacidad no disponible de un test superado, exigir verificación independiente de regiones y afirmaciones, y permitir la abstención explícita como resultado de primera clase. El autor declara que no es equipo de seguridad certificado, que no reclama mejoras en benchmarks y que no se ha ejecutado ningún benchmark completo sobre un dataset real con un modelo compatible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo único: sistema de orquestación (API FastAPI + SQLite + frontend Next.js) con línea base de visión determinista y adaptador VLM opcional sobre Qwen3-VL |
| Parámetros totales | No disponible (el repositorio no incluye pesos; el adaptador opcional apunta a `Qwen/Qwen3-VL-4B-Instruct`, identificado como 4B en el propio ID del modelo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el campo de licencia del repositorio Hugging Face está vacío; el autor remite a la licencia de Qwen3-VL para el adaptador opcional) |
| Formato de pesos | No disponible (no se distribuyen pesos; el adaptador carga pesos de Qwen3-VL mediante Transformers, que no se descargan automáticamente) |

## Arquitectura y entrenamiento

El repositorio implementa un pipeline de inspección en cuatro capas: validación y decodificación real de bytes de imagen; una línea base de anomalía visual determinista que produce puntuación, mapa de calor, regiones conexas y cajas; un adaptador VLM opcional (`Qwen/Qwen3-VL-4B-Instruct`) que solo se activa con `EVIDENCEGATE_VLM_ENABLED=true` y un `EVIDENCEGATE_VLM_MODEL_ID` configurado; y una capa de decisión con comprobaciones independientes de *grounding* de regiones y afirmaciones que emite `ACCEPT`, `REJECT`, `REVIEW` o `ABSTAIN`. Cada ejecución registra en SQLite la inspección, las salidas crudas, la procedencia y los eventos de auditoría, incluyendo GPU, precisión, revisión y parámetros de generación del modelo.

No hay entrenamiento propio documentado, ni datos de entrenamiento, ni fases de RLHF/DPO, ni número de tokens: el autor no entrena un modelo, reutiliza uno existente de forma opcional. La línea base visual se describe explícitamente como no entrenada y "no presentada como PatchCore". La innovación técnica declarada no es arquitectónica sino de proceso: *evidence gating* con abstención, verificación independiente de regiones y separación estricta entre estados como `UNIT_TEST_PASSED`, `INTEGRATION_TEST_PASSED`, `REAL_MODEL_INFERENCE_VERIFIED` y `FULL_BENCHMARK_COMPLETED`, de modo que un test unitario correcto no se pueda confundir con una inferencia real verificada.

## Capacidades

- Inspección visual automatizada con generación de puntuación de anomalía, mapa de calor, regiones conexas y cajas delimitadoras sobre la imagen enviada.
- Decisión con abstención explícita: cuatro resultados posibles (`ACCEPT`, `REJECT`, `REVIEW`, `ABSTAIN`) en lugar de una respuesta forzada.
- Verificación de *grounding*: comprobaciones independientes de que las regiones y afirmaciones se sustentan en la evidencia visual disponible.
- Integración opcional de un VLM (Qwen3-VL-4B-Instruct) para razonamiento multimodal sobre la imagen y las regiones detectadas.
- Degradación honesta: si el VLM no está disponible, la API registra `MODEL_UNAVAILABLE` y mantiene la decisión en abstención.
- Trazabilidad y auditoría: registros de inspección, salidas crudas, procedencia y eventos en SQLite, con parámetros de ejecución del modelo.
- Ingesta reproducible de VisA: registro de URL de origen, hash de descarga, aceptación de licencia, metadatos de imagen, rutas seguras e índice, sin redistribuir ficheros del dataset.
- API HTTP con OpenAPI en `/docs` y espacio de trabajo web con estados de disponibilidad, error y vacío veraces.
- No documentado: soporte de *tool calling* / *function calling*, razonamiento multi-paso sobre agentes, capacidades de audio, modo *thinking* explícito o soporte multilingüe declarado.

## Casos de uso

- Inspección visual en línea de producción con revisión humana: el sistema puntúa la imagen, resalta regiones sospechosas y emite `REVIEW` cuando la evidencia es insuficiente, derivando el caso a un operario en lugar de forzar una clasificación binaria.
- Control de calidad con abstención medible: en una planta donde el coste de un falso negativo es alto, la política `ABSTAIN`/`REVIEW` permite cuantificar qué porcentaje de piezas requiere inspección manual y ajustar el umbral de decisión.
- Auditoría posterior de decisiones automatizadas: los registros en SQLite con salidas crudas, procedencia y parámetros del modelo permiten reconstruir por qué una imagen se aceptó o se rechazó, requisito habitual en entornos regulados.
- Investigación reproducible sobre abstención en VLMs: el repositorio sirve como banco de pruebas para medir si la evidencia visual verificada de forma independiente mejora la calibración de las decisiones de un modelo multimodal, con estados separados para test unitario, integración e inferencia real.
- Prototipado rápido de servicios multimodales: la API FastAPI con OpenAPI y el frontend Next.js permiten levantar un endpoint de inspección con frontend en local sin depender de pesos, útil para validar la interfaz antes de invertir en GPU.
- Evaluación con datos VisA: el CLI `scripts/ingest_visa.py` descarga, verifica el hash y indexa el dataset respetando su licencia, lo que facilita experimentos comparables sin comprometer imágenes al repositorio.
- Despliegue en entornos sin GPU: al mantener el VLM desactivado por defecto, el sistema es operativo en CPU para la parte determinista y muestra la abstención de forma visible, lo que sirve como modo de contingencia documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor es explícito al respecto: "This empty repository has no benchmark result until a real dataset and compatible model execution are performed", y no se reclama ninguna mejora de accuracy, calibración, latencia o superioridad sin un experimento registrado. Estados como `FULL_BENCHMARK_COMPLETED` figuran como vocabulario definido, no como resultado alcanzado.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Métricas de detección de anomalías sobre VisA (AUROC, PRO) | No disponible |
| Latencia / throughput medidos | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Como referencia aritmética, el adaptador opcional Qwen3-VL-4B-Instruct en bf16 requeriría del orden de 8 GB solo para pesos (4B × 2 bytes), más el codificador visual, activaciones y caché KV; esa cifra no está verificada por el autor.
- GPU recomendadas: no especificadas. El autor indica únicamente que la disponibilidad del modelo depende del hardware y de las dependencias instaladas.
- GPU de consumo: no confirmado. Un modelo de 4B en bf16 podría encajar en GPUs de consumo con 12-16 GB de VRAM según la implementación y la longitud de contexto, pero no hay validación publicada en este repositorio.
- Modo sin GPU: plenamente soportado para la línea base determinista y la API; las decisiones dependientes del VLM quedan en abstención visible.
- Opciones de despliegue: `uvicorn` con `evidencegate_api.main:app` (API FastAPI), `npm run dev` para el frontend Next.js, y Transformers con el extra `.[vlm]` para el adaptador multimodal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han registrado experimentos de rendimiento.

## Comparativa con modelos similares

| Sistema | Naturaleza | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvidenceGate-VLM | Sistema de inspección con orquestación, línea base determinista y VLM opcional | No disponible (no distribuye pesos) | No disponible | No disponible | Repositorio público, 0 descargas, 0 likes |
| Qwen3-VL-4B-Instruct | Modelo visión-lenguaje | 4B (según ID) | No disponible en esta ficha | La indicada en su propia model card | Pesos públicos en Hugging Face |
| PatchCore y detectores de anomalías entrenados | Modelos/métodos de detección de anomalías visuales | No disponible | No aplica | No disponible | Implementaciones públicas diversas |

La comparación relevante no es de parámetros: EvidenceGate-VLM no compite en rendimiento con un VLM, sino que propone una capa de decisión y auditoría alrededor de uno. Frente a un detector de anomalías clásico, la diferencia es que aquí la salida es una decisión con abstención y trazas auditables, no una puntuación de anomalía sin más.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos, dataset de entrenamiento ni métricas de rendimiento asociadas al repositorio.
- La línea base visual es determinista y no entrenada; el autor advierte que no es un detector de anomalías validado para producción.
- Licencia no declarada en Hugging Face: el uso comercial queda sin marco claro hasta consultar al autor y, en su caso, la licencia de Qwen3-VL para el adaptador.
- Riesgo de alucinación mitigado pero no eliminado: la abstención y el *grounding* reducen respuestas sin respaldo, pero el VLM subyacente sigue siendo un generador probabilístico.
- Dependencia de hardware y dependencias para el VLM: sin GPU o sin el extra `.[vlm]`, las decisiones que dependen del modelo quedan en abstención, lo que puede interpretarse erróneamente como fallo del sistema.
- Idiomas soportados no declarados; no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés de la documentación.
- Longitud de contexto y cuantizaciones no documentadas, lo que impide planificar despliegues con requisitos de memoria ajustados.
- El dataset VisA no se redistribuye y requiere aceptación explícita de licencia (`--accept-license`); su uso está sujeto a los términos del proveedor original.
- Ausencia total de benchmarks: cualquier afirmación de precisión, calibración o latencia en producción carece de respaldo en la documentación disponible.
- Metadatos del repositorio con fechas de creación y actualización de 2026-10-20; conviene verificar la vigencia del proyecto antes de adoptarlo.
- Sin actividad comunitaria (0 descargas, 0 likes) y sin pipeline declarado en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/husnainbinmunawar/evidencegate-vlm
- Model card del adaptador VLM opcional: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Documentación de seguridad del proyecto (ruta en el repositorio): `SECURITY.md`
- Protocolo experimental (ruta en el repositorio): `research/experimental_protocol.md`
- Registro de cambios (ruta en el repositorio): `CHANGELOG.md`
- Documentación de ingesta del dataset VisA (ruta en el repositorio): `docs/datasets/visa.md`
- Script de ingesta: `scripts/ingest_visa.py`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al proyecto; las búsquedas devolvieron únicamente páginas de ayuda de YouTube sin relación con el modelo.
