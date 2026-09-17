# smlflg/FirstRealHarnessEvaluation_KarpathiesMD

## Resumen

First Real Harness Evaluation (repositorio `smlflg/FirstRealHarnessEvaluation_KarpathiesMD`) no es un modelo de lenguaje, sino un arnés de medición escrito en Python para comprobar si una política de estilo escrita en Markdown (`CONVENTIONS.md`) modifica de forma reproducible el comportamiento de un agente de programación. La pregunta que aborda es deliberadamente estrecha: con el mismo modelo, el mismo conjunto de tareas y el mismo pipeline de medición, ¿una política produce un comportamiento mejor que otra? La evidencia primaria son métricas duras de tests (FAIL_TO_PASS y PASS_TO_PASS) y el juicio por LLM queda como capa secundaria de diagnóstico.

El proyecto se centra en experimentos con Aider sobre SWE-bench Lite y organiza cada iteración de forma simétrica: 3 tareas x 5 ejecuciones x 2 condiciones, es decir, 30 ejecuciones por iteración. Incluye herramientas de ejecución, preflight, resumen, comparación científica A/B y comparación de modelos. El estado actual es de herramienta funcional, pero el propio repositorio declara explícitamente que todavía no reclama un resultado decisivo para ninguna política concreta.

Por tanto, esta ficha describe un artefacto de evaluación y no un modelo con pesos, contexto o licencia de pesos. No se dispone de pipeline, idiomas ni licencia declarados en HuggingFace, el repositorio ocupa 0,1 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es una red neuronal, es un arnés de evaluación en Python (runner, capa A/B científica y capa de comparación de modelos) |
| Parametros totales | no aplica (no contiene pesos de modelo) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (el contexto lo aporta el modelo juez o el agente evaluado) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card y la documentación están redactadas en inglés |
| Licencia | no disponible |
| Formato de pesos | no aplica; el repositorio contiene código y documentación, con un tamano total de 0,1 GB |
| Autor | smlflg |
| Etiquetas declaradas | region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Modelo juez por defecto | openai/MiniMax-M2.7 (`JUDGE_MODEL`), con `JUDGE_COMMAND` opcional |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red que describir: el repositorio implementa una infraestructura de medición. El flujo real consiste en sincronizar dependencias con `uv sync`, copiar `.env.example` a `.env`, rellenar los ajustes del endpoint MiniMax, el modelo juez y los precios de tokens, y ejecutar un preflight obligatorio en el host (`uv run harness-preflight`). Ese preflight comprueba tres cosas: que `docker run hello-world` funciona, que Aider puede operar contra MiniMax en un repositorio desechable con `--read CONVENTIONS.md`, y que los módulos `datasets` y `swebench` se importan correctamente. Si MiniMax nativo falla dentro de Aider, la documentación indica configurar `MINIMAX_BASE_URL` y probar un nombre de modelo compatible con LiteLLM del tipo `openai/<modelo>`.

El diseño metodológico separa las ejecuciones en bruto de la evidencia utilizable. La capa científica A/B (`harness-science-ab`) filtra ejecuciones inválidas, empareja tareas, detecta contraejemplos y distingue afirmaciones universales fuertes de afirmaciones sobre el efecto medio del tratamiento. Existe una capa equivalente para comparar modelos (`harness-model-ab`), que fija la condición y contrasta un modelo base frente a un candidato, por ejemplo `openai/MiniMax-M2.7` frente a `openai/gpt-5.5` según aparece en la documentación. El juicio automático se implementa con `harness-judge`, que usa un juez integrado de dos etapas cuando `JUDGE_COMMAND` no está definido. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición de dataset, ni técnicas de RLHF o DPO, porque no hay modelo entrenado en este repositorio.

## Capacidades

- Ejecución controlada de un agente de programación (Aider) sobre tareas de SWE-bench Lite dentro de Docker.
- Comparación A/B de políticas `CONVENTIONS.md`: el flujo típico copia una política base a `harness/CONVENTIONS.candidate.md` y aplica un cambio explícito y único.
- Cálculo y agregación de métricas duras de tests mediante estructuras JSON con contadores `FAIL_TO_PASS` y `PASS_TO_PASS` (total, passed, failed).
- Capa de juicio por LLM como diagnóstico secundario, con juez de dos etapas y posibilidad de sustituirlo mediante comando externo.
- Puerta de validez: marca comparaciones como `not_decisive` o `not_testable` cuando detecta pocos pares válidos, ejecuciones con cero tests, fallos de infraestructura o ausencia de celdas de tarea compartidas.
- Comparación de modelos bajo una condición fija, con informes en Markdown y JSON.
- Selección y calibración de tareas candidatas mediante `harness-fetch-candidates` y `harness-calibrate`.
- Modo de prueba de humo sin agente ni Docker (`--skip-agent`, `--skip-eval`), útil para validar el pipeline antes de gastar presupuesto.
- Generación de informes de resumen por iteración (`harness-summarize`) y de comparaciones científicas en `results/summary/`.
- No dispone de capacidades de generación de texto, visión, audio, tool calling propio ni razonamiento: esas capacidades pertenecen a los modelos que evalúa.

## Casos de uso

- Investigación reproducible sobre instrucciones de agentes: un equipo puede medir si un cambio concreto en `CONVENTIONS.md` mejora el porcentaje de tareas SWE-bench Lite resueltas, manteniendo fijos modelo, conjunto de tareas y pipeline, y exigiendo que la puerta de validez confirme la comparación.
- Validación interna de convenciones antes de adoptarlas: antes de imponer un fichero de convenciones a todos los repositorios de una organización, se ejecuta una iteración de 30 ejecuciones (3 tareas x 5 runs x 2 condiciones) y se comprueba si el efecto es real o ruido.
- Comparación de modelos para cargas de trabajo agénticas: `harness-model-ab` permite fijar la condición (por ejemplo `baseline_6line`) y contrastar dos modelos con acceso vía API, obteniendo informes comparables en Markdown y JSON.
- Auditoría de afirmaciones internas: la distinción entre ejecuciones en bruto y evidencia válida sirve para rechazar conclusiones basadas en pocas ejecuciones, en ejecuciones con cero tests o en fallos de infraestructura.
- Control de coste antes de una campaña grande: el modo de prueba de humo con `--skip-agent` y `--skip-eval`, junto al preflight, permite verificar el pipeline completo sin invocar al modelo ni a Docker, evitando gastar tokens en configuraciones erróneas.
- Calibración de conjuntos de tareas: `harness-fetch-candidates --limit 30` y `harness-calibrate` permiten construir y validar la lista de tareas antes de lanzar la matriz de ejecuciones.
- Integración en un flujo de CI de evaluación: los informes generados en `results/summary/` son artefactos versionables que se pueden publicar o comparar entre iteraciones para detectar regresiones en la política del agente.
- Formación de equipos de evaluación: el protocolo documentado en `docs/scientific_evaluation_protocol.md` y el diagrama `web/static/scientific-versuchsaufbau.html` sirven como material didáctico sobre diseño experimental aplicado a agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara explícitamente que todavía no reclama un resultado decisivo para ninguna política y que algunas comparaciones locales han quedado marcadas como `not_decisive` o `not_testable` por la puerta de validez.

| Elemento | Valor |
|---|---|
| Conjunto de tareas | SWE-bench Lite (mencionado como foco actual) |
| Agente evaluado | Aider |
| Métricas primarias | Tests duros: `FAIL_TO_PASS` y `PASS_TO_PASS` (total, passed, failed) |
| Capa secundaria | Juicio por LLM (juez integrado de dos etapas o `JUDGE_COMMAND`) |
| Diseño por iteración | 3 tareas x 5 ejecuciones x 2 condiciones = 30 ejecuciones |
| Resultado agregado publicado | no disponible; el repositorio no afirma un resultado decisivo |

## Requisitos de hardware

- No requiere GPU: el repositorio no contiene pesos ni realiza inferencia local. Las GPU solo serían relevantes para los modelos evaluados o para servir el modelo juez por cuenta propia.
- Requisitos de software: Python gestionado con `uv`, Docker operativo en el host, Aider instalado y acceso de red a un endpoint MiniMax (o a un endpoint compatible vía `MINIMAX_BASE_URL` y LiteLLM).
- Requisitos de datos: los paquetes `datasets` y `swebench` deben importarse correctamente; el preflight lo verifica.
- El preflight debe ejecutarse en el host y no dentro de un sandbox restringido, según la propia documentación.
- Presupuesto: cada iteración implica 30 ejecuciones de agente más el coste del juez LLM; los precios de tokens se configuran en `.env` mediante los ajustes de precios de tokens.
- Tiempo: la documentación indica que las ejecuciones reales requieren "tiempo y presupuesto suficientes" para tareas SWE-bench Lite, sin dar cifras concretas.
- Almacenamiento: el repositorio ocupa 0,1 GB; no se especifica el espacio necesario para resultados, imágenes Docker ni cachés del conjunto de datos.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI para este artefacto. El modelo juez y el modelo evaluado se consumen vía API (MiniMax o endpoint compatible con OpenAI/LiteLLM).

## Comparativa con modelos similares

No hay comparativa cuantitativa disponible. Este repositorio no es un modelo y la información proporcionada no incluye datos de rendimiento frente a otras herramientas de evaluación. La búsqueda web realizada devolvió únicamente resultados sin relación con el proyecto (páginas de Twitch), por lo que no aporta ninguna referencia válida.

| Alternativa mencionada o de la misma categoría | Relación con este proyecto | Datos comparativos |
|---|---|---|
| SWE-bench Lite | Conjunto de tareas sobre el que se ejecutan los experimentos | no disponible |
| Aider | Agente cuya política `CONVENTIONS.md` se somete a prueba | no disponible |
| `harness-science-ab` frente a `harness-model-ab` | Dos capas internas del propio repositorio, no alternativas externas | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no tiene pesos, contexto, cuantizaciones ni capacidades multimodales. Cualquier expectativa de uso como LLM es incorrecta.
- Licencia no declarada: no hay licencia en los metadatos de HuggingFace, por lo que no se puede verificar si el uso comercial está permitido. Es un riesgo relevante antes de integrarlo en un producto.
- El propio autor advierte que el repositorio no es una plataforma general de evaluación de agentes, ni un producto de panel, ni una prueba de que un conjunto amplio de reglas de estilo "Karpathy" sea bueno en general.
- Sin resultado concluyente: el repositorio no reclama un resultado decisivo para ninguna política, y algunas comparaciones locales se han marcado como `not_decisive` o `not_testable`.
- Potencia estadística limitada: el diseño de 3 tareas x 5 ejecuciones x 2 condiciones produce 30 ejecuciones por iteración, insuficiente para generalizar a cualquier cambio de política sin repetir iteraciones y sin apoyo de la capa A/B.
- Sesgo de dominio: el foco en SWE-bench Lite y Aider restringe las conclusiones a tareas de resolución de incidencias en Python con un agente concreto; no se extrapolan a otros lenguajes, agentes o flujos.
- Dependencia de infraestructura externa: Docker, Aider, el endpoint MiniMax y el modelo juez introducen puntos de fallo que el propio repositorio reconoce al marcar ejecuciones como no válidas por fallos de infraestructura.
- Dependencia de un juez LLM: la capa de juicio por LLM es secundaria y puede introducir sesgos propios; el repositorio insiste en que la evidencia primaria son los tests.
- Idiomas: los metadatos no declaran idiomas soportados y la documentación está en inglés; no hay evidencia de soporte multilingüe.
- Adopción nula: 0 descargas y 0 likes, sin validación por parte de la comunidad, lo que desaconseja tratarlo como estándar consolidado.
- Higiene de secretos: la documentación pide mantener las credenciales reales fuera de ficheros versionados; el uso de un `.env` con claves de API exige control de acceso.
- Idiomas y datos de la búsqueda: los resultados web obtenidos no guardan relación con el proyecto, de modo que no hay fuentes externas que corroboren o amplíen lo declarado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/FirstRealHarnessEvaluation_KarpathiesMD
- Protocolo de evaluación científica (ruta interna citada en la model card): `docs/scientific_evaluation_protocol.md`
- Diagrama del diseño experimental (ruta interna citada): `web/static/scientific-versuchsaufbau.html`
- Directorio de informes generados: `results/summary/`
- Fichero de convenciones base y candidato: `harness/CONVENTIONS.baseline.md`, `harness/CONVENTIONS.candidate.md`
- Ejemplo de tareas seleccionadas: `data/selected_tasks.example.json`
- Resultados de la búsqueda web: no relevantes (únicamente páginas de Twitch, sin relación con el proyecto)
