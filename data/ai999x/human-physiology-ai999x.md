# AI999X/human-physiology-ai999x

## Resumen

human-physiology-ai999x es un motor de resolución de problemas de fisiología humana desarrollado por AI999X (Ibnul Jaif Farabi) y publicado bajo licencia Apache-2.0. No es un modelo de lenguaje neuronal en el sentido convencional: se describe como un motor neuro-simbólico determinista que combina un lector de reglas sobre preguntas en inglés con 96 capacidades simbólicas certificadas. El paquete procesa una consulta, selecciona la capacidad adecuada, computa el resultado exacto, lo verifica (sustitución inversa, comprobación dimensional o cálculo independiente) y devuelve la respuesta con pasos, unidades, LaTeX y supuestos, o bien un rechazo explícito.

El modelo resuelve el problema de la fiabilidad en asistentes educativos de fisiología: en lugar de generar texto plausible, computa respuestas verificables y declara siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR), sin adivinar nunca. Su relevancia actual radica en que ofrece respuestas deterministas y reproducibles sin GPU, sin red y sin clave de API, lo que lo hace apto para entornos offline, edge y tutoring.

El repositorio declara 4.715.520 parámetros en safetensors y un tamaño de repo de 0.0 GB. La cobertura temática abarca fisiología cardiovascular, respiratoria, renal, nerviosa y muscular, con problemas tipo word problem. Está pensado para Python 3.10 a 3.14 en Windows y Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (lector basado en reglas + 96 capacidades simbólicas certificadas) |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el runtime es Python puro con sympy y mpmath; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (según tags); distribución principal como wheel de Python (`human_physiology_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica y determinista: un componente de lectura basado en reglas interpreta preguntas documentadas en inglés o llamadas tipadas, y un conjunto de 96 procedimientos simbólicos certificados computa la respuesta. No se describe un transformer ni un proceso de entrenamiento con tokens, RLHF o DPO; el conocimiento se organiza en un knowledge pack versión 1.0.0. El motor se apoya en las librerías sympy y mpmath y se ejecuta en CPU pura, sin GPU, sin red y sin clave de API.

La innovación técnica destacable es el diseño orientado a cero respuestas incorrectas: cada resultado se verifica antes de devolverse mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente, y el sistema rechaza explícitamente cuando no puede verificar. El paquete expone dos interfaces: `ask()` para formas de pregunta documentadas y `solve(capability_id, **inputs)` para una interfaz tipada garantizada. No se han publicado detalles sobre composición de dataset de entrenamiento ni número de tokens.

## Capacidades

- Resolución de cálculos de fisiología humana con pasos detallados, fórmulas en LaTeX, unidades y supuestos.
- Cobertura de fisiología cardiovascular, respiratoria, renal, nerviosa y muscular.
- Ejemplos documentados: gasto cardíaco (CO), ecuación de gases alveolares, potencial de Nernst, flujo de Poiseuille y eGFR CKD-EPI 2021.
- Interfaz de pregunta en inglés documentado (`ask()`) e interfaz tipada garantizada (`solve()`).
- Verificación interna de resultados antes de responder.
- Rechazo explícito con siete estados definidos en lugar de adivinar.
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.
- CLI propia: `human-physiology-ai999x "<question>"` y `human-physiology-ai999x --capabilities`.
- Respuestas deterministas e idénticas en Windows y Linux (Python 3.10 a 3.14).
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Tutoría de fisiología en entornos sin conexión: el motor responde cálculos de cardiovascular, respiratorio y renal con pasos y LaTeX, adecuado para aulas o laboratorios con red restringida.
- Verificación de deberes: un corrector automático puede comparar la respuesta del estudiante con el resultado certificado y mostrar los pasos y supuestos empleados.
- Generación de material docente: producir enunciados resueltos de word problems de fisiología con unidades y fórmulas en LaTeX listas para apuntes o cuadernos.
- Integración en pipelines clínicos educativos: cálculo de eGFR CKD-EPI 2021, ecuación de gases alveolares o potencial de Nernst como referencia reproducible en scripts Python.
- Despliegue en edge y dispositivos sin GPU: al ejecutarse en CPU pura y offline, puede embeberse en aplicaciones de escritorio o CLI en Windows y Linux.
- Automatización de evaluaciones: la interfaz tipada `solve(capability_id, **inputs)` permite generar conjuntos de problemas con resultados deterministas y reproducibles para calibración de evaluaciones.
- Reproducibilidad en investigación educativa: las 692 respuestas documentadas se reproducen idénticamente en cada plataforma probada, útil para comparar resultados entre entornos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente; el campo `verified` es `false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (fisiología humana) | Golden answers (692 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el motor se ejecuta en CPU pura y no requiere GPU.
- GPU recomendadas: ninguna; no se necesita GPU.
- Cabe en cualquier CPU consumer; probado en Windows (Python 3.13) y Linux x86-64.
- Requisitos de software: Python 3.10 a 3.14, con sympy y mpmath como dependencias.
- Opciones de despliegue: paquete pip (`pip install human-physiology-ai999x`), wheel desde el repositorio de HuggingFace, CLI propia, aplicación de escritorio y ejecución en navegador según los enlaces de la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (motores neuro-simbólicos deterministas de fisiología) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Cobertura limitada a las 96 capacidades certificadas y a las formas de pregunta documentadas; fuera de ese ámbito devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- No es un modelo generativo general: no se documentan tool calling, agentes, visión ni audio.
- El benchmark declarado (accuracy 1.0 sobre 692 preguntas) procede del propio autor y figura como no verificado; debe interpretarse con cautela.
- El rendimiento en preguntas no documentadas o formulaciones libres no está caracterizado.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar el archivo LICENSE del repositorio para confirmar términos y atribución.
- Al ser un motor determinista basado en reglas, los fallos previsibles son de reconocimiento de formato o de entradas ambiguas, no de alucinación de contenido; aun así, la verificación de supuestos y unidades recae en el usuario en producción.
- La fecha de creación del repositorio (2026-11-01) y el reducido número de descargas y likes (0) indican ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/AI999X/human-physiology-ai999x
- Organización en HuggingFace: https://huggingface.co/AI999X
- Documentación: https://huggingface.co/AI999X/human-physiology-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/human-physiology-ai999x/tree/main/evaluation
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Probar en navegador: https://www.ai999x.com/models/human-physiology-ai999x/#try
- Paquete PyPI: https://pypi.org/project/human-physiology-ai999x/
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
