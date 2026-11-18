# msinan94/meccog-apoe4-step1

## Resumen

`msinan94/meccog-apoe4-step1` no es un modelo de lenguaje en el sentido habitual: es un repositorio de Hugging Face que documenta el pipeline de envío y la procedencia de datos del equipo `msinan94` para el Step 1 del reto MecCog, centrado en hipótesis sobre mecanismos de endosoma mediados por APOE4 en la enfermedad de Alzheimer. El artefacto publicado contiene metodología, registros de búsqueda bibliográfica, esquemas de verificación y resultados de curación estructurada, no pesos de un modelo entrenado.

El contenido describe un flujo multiagente guiado por humanos que combina recuperación de literatura (PubMed, Europe PMC, OpenAlex), extracción estructurada de hallazgos experimentales, verificación determinista de citas y auditoría cruzada mediante modelos de OpenAI. La model card identifica a los agentes utilizados (Antigravity IDE, GPT-6 Astra, GPT-6.2 Astra) y detalla las consultas ejecutadas para las cinco hipótesis (H1–H5).

Es relevante como ejemplo de trazabilidad y verificación reproducible en pipelines de curación científica asistidos por IA, pero no debe interpretarse como un modelo desplegable para inferencia. No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto ni capacidades generativas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un repositorio de pipeline y procedencia) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene documentación, JSON y libros `.xlsx` de curación, no pesos) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo (transformer, MoE, SSM ni híbrida) ni proceso de entrenamiento. El repositorio documenta un pipeline de curación compuesto por: un orquestador de síntesis, cinco subagentes de curación paralelos (uno por hipótesis H1–H5), un motor de auditoría determinista (`meccog_pipeline`, con `verify_quotes.py`, `audit.py` y `validate_submission.py --strict`) y revisiones externas cruzadas mediante modelos de OpenAI (GPT-6 Astra y GPT-6.2 Astra).

La recuperación bibliográfica se realizó con scripts reproducibles (`search.py`, `run_discovery.py`) que combinan snowballing de citas y referencias vía Europe PMC, búsquedas en PubMed (E-utilities), el subconjunto Open Access de Europe PMC y OpenAlex. Los PMID semilla citados son `29946028`, `31641056`, `39419029`, `30375977` y `37777962`. No hay información sobre volumen de tokens de entrenamiento, composición de dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Curación estructurada de literatura científica con extracción de `Finding description`, citas textuales, resumen, localización de datos y estadísticas (tamaño del efecto, valor p, tamaño muestral).
- Verificación determinista de citas contra ficheros fuente cacheados, preservando operadores en la normalización.
- Auditoría de esquemas de identidad de fuente y campos de procedencia, con generación de `curated/audit_receipt.json`.
- Validación estricta de libros `.xlsx` mediante `validate_submission.py --strict`.
- Registro reproducible de consultas y recuentos en `curated/search_log.json`.
- Revisión cruzada de código y evidencia mediante modelos externos (GPT-6 Astra y GPT-6.2 Astra) para detectar puntos ciegos del verificador y sobreclasificaciones de directness.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling, agentes ni multilingüismo propias del repositorio.

## Casos de uso

- Reproducción de búsquedas bibliográficas sobre APOE4 y mecanismos de endosoma: los scripts `search.py` y `run_discovery.py` permiten repetir las consultas registradas en `search_log.json` contra Europe PMC, PubMed y OpenAlex.
- Auditoría de citas en revisiones sistemáticas: `verify_quotes.py` comprueba cada cita no `N/A` contra el fichero fuente cacheado, útil para validar extracciones manuales o asistidas.
- Diseño de pipelines de curación multiagente con trazabilidad: sirve como plantilla de orquestación con subagentes por hipótesis y motor de validación determinista.
- Verificación de esquemas de envío en retos científicos: `validate_submission.py --strict` valida la estructura de los libros `.xlsx` antes de la entrega.
- Documentación de procedencia para auditoría externa: la model card detalla versiones de modelos, hosts y fechas, lo que facilita revisiones de terceros.
- Formación en buenas prácticas de reproducibilidad: el repositorio ejemplifica separación entre recuperación, extracción, verificación y auditoría cruzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica inferencia de modelo: el repositorio no contiene pesos ni requiere VRAM.
- Los scripts de recuperación y validación se ejecutan en CPU; el entorno documentado incluye host Windows y WSL2 para el router local.
- No se especifican GPU recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.
- El pipeline depende de acceso a APIs externas (PubMed E-utilities, Europe PMC, OpenAlex) y de un router local (`llmroute`) para las revisiones con modelos de OpenAI.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (repositorios de procedencia y curación científica).

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, tokenizador ni configuración de inferencia; no puede usarse para generar texto.
- La licencia MIT se aplica al repositorio, pero el uso de los contenidos está condicionado por los términos de las fuentes bibliográficas referenciadas.
- El pipeline depende de servicios externos (PubMed, Europe PMC, OpenAlex) y de un router local con acceso a modelos de OpenAI, lo que afecta a la reproducibilidad completa.
- La model card cita modelos con fechas futuras (2026) y nombres no verificables de forma independiente; deben tratarse como datos declarados por el autor.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad de la curación más allá de la validación de citas y esquemas.
- La información sobre idiomas y cobertura multilingüe no está disponible.
- Cualquier reutilización en producción requiere validación independiente de las extracciones y de la cadena de auditoría.

## Enlaces

- Hugging Face: https://huggingface.co/msinan94/meccog-apoe4-step1
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
