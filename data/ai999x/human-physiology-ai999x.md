# AI999X/human-physiology-ai999x

## Resumen

`human-physiology-ai999x` es un paquete de software publicado en Hugging Face por el desarrollador AI999X bajo licencia Apache 2.0. A pesar de su etiqueta `pipeline_tag: question-answering` y de su nombre con sufijo "ai", no se trata de un modelo de lenguaje neuronal: es un motor de cálculo compilado (escrito en Rust, con build en Python puro para plataformas no x86-64) que resuelve 98 cálculos de fisiología humana agrupados en 8 temas, devolviendo fórmula, pasos intermedios y unidades. El repositorio declara 4.715.520 parámetros en safetensors, un dato que no se corresponde con la naturaleza determinista del motor descrito en la model card.

El objetivo declarado es ofrecer respuestas verificables y sin alucinación para problemas de fisiología: gasto cardíaco, presión arterial, resistencia vascular y flujo de Poiseuille, volúmenes pulmonares y ecuación de gas alveolar, contenido de oxígeno y curva de disociación, equilibrio ácido-base (Henderson-Hasselbalch), aclaramiento renal y eGFR (CKD-EPI 2021), potenciales de Nernst y Goldman-Hodgkin-Katz, propiedades de cable y velocidad de conducción, composición corporal y tasa metabólica. Cuando falta una entrada o está fuera de rango, el motor devuelve una explicación en lugar de un número.

Su relevancia práctica es la de una herramienta de apoyo docente y de cálculo offline: se distribuye como aplicación de escritorio (Windows, Linux), CLI, versión web y paquete de Python (`pip install human-physiology-ai999x`), y toda la ejecución ocurre en local. No es un modelo generativo ni sustituye a un LLM; es un solucionador determinista con pasos explícitos, útil para estudiar y para verificar cálculos fisiológicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust) con build en Python puro; no es un transformer |
| Parametros totales | 4.715.520 (declarados en safetensors; no equivalen a pesos de un modelo neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no procesa texto libre) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (declarado); distribución principal como binarios de escritorio/CLI y paquete Python |
| Pipeline declarado | question-answering |
| Cobertura funcional | 98 cálculos en 8 temas de fisiología humana |
| Plataformas | Windows y Linux x86-64 (motor compilado); macOS y ARM vía build Python puro |
| Versión | 1.6.7 |
| Descargas | 311 |
| Fecha de creación | 2026-11-01 |

## Arquitectura y entrenamiento

No hay evidencia de entrenamiento neuronal. La model card describe "one compiled engine" con cuatro interfaces (app de escritorio, línea de comandos `human-physiology`, navegador y Python), y el repositorio usa `library_name: human-physiology-ai999x` e `inference: false`. La lógica interna es un conjunto de rutinas de cálculo fisiológico: cada capacidad expone su fórmula, sus pasos y sus unidades, y valida las entradas devolviendo un motivo textual cuando faltan datos o están fuera de rango. El build compilado en Rust se distribuye para Windows y Linux x86-64; en macOS y ARM, `pip` instala una versión en Python puro que, según el autor, produce las mismas respuestas.

El autor declara una evaluación sobre 711 preguntas documentadas ("golden answers") ejecutadas en Windows y Linux con Python 3.10 a 3.14, con resultado de accuracy 1.0 y respuestas idénticas en todas las plataformas. Esa métrica refleja determinismo del motor frente a un conjunto de referencia cerrado, no capacidad de generalización lingüística. No se documentan datos de entrenamiento, RLHF, DPO ni innovaciones de decoding porque no aplican a este tipo de artefacto.

## Capacidades

- Cálculo cardiovascular: gasto cardíaco a partir de frecuencia y volumen sistólico, presión arterial, resistencia vascular y flujo según Poiseuille.
- Fisiología respiratoria: volúmenes pulmonares, ventilación y ecuación de gas alveolar.
- Transporte de oxígeno: contenido arterial de O2 y curva de disociación de la oxihemoglobina.
- Equilibrio ácido-base mediante la ecuación de Henderson-Hasselbalch.
- Función renal: aclaramiento renal y eGFR con la ecuación CKD-EPI 2021.
- Neurofisiología: potencial de equilibrio de Nernst, ecuación de Goldman-Hodgkin-Katz, propiedades de cable y escalado de la velocidad de conducción con el diámetro de fibra.
- Composición corporal y metabolismo: índice de masa corporal, compartimentos de líquidos corporales, índices eritrocitarios (MCV, MCH, MCHC) y tasa metabólica.
- Salida con fórmula, pasos intermedios y unidades para cada cálculo.
- Manejo explícito de entradas ausentes o fuera de rango mediante explicación en lugar de resultado numérico.
- Ejecución totalmente offline en local, sin llamadas a servicios externos.
- No soporta tool calling, agentes, razonamiento multi-turno ni generación de texto libre.

## Casos de uso

- Docencia de fisiología: el estudiante introduce frecuencia cardíaca y volumen sistólico y obtiene el gasto cardíaco con la fórmula y los pasos, lo que permite verificar el procedimiento además del resultado.
- Autoevaluación con corrección inmediata: el motor devuelve un motivo cuando una entrada está fuera de rango fisiológico, lo que sirve para detectar errores de unidades o de planteamiento antes de dar la respuesta por buena.
- Prácticas de laboratorio y seminarios: cálculo reproducible de eGFR (CKD-EPI 2021), aclaramiento renal o índices eritrocitarios sin depender de conectividad ni de una calculadora médica externa.
- Integración en cuadernos y scripts de investigación: el paquete `pip install human-physiology-ai999x` permite llamar a los cálculos desde Python 3.10+ y encadenarlos en pipelines de análisis de datos fisiológicos simulados.
- Verificación cruzada de cálculos en entornos clínicos docentes: al ser determinista y offline, sirve como referencia para contrastar resultados obtenidos con otras herramientas, sin riesgo de alucinación.
- Distribución en aulas con equipos heterogéneos: la app de escritorio para Windows y Linux y el build Python puro para macOS/ARM cubren puestos mixtos con el mismo conjunto de respuestas.
- Uso en entornos sin red: al ejecutarse en local, es apto para laboratorios con conectividad restringida o para trabajo de campo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de fisiología humana | Golden answers (711 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") | No |

No se han publicado resultados de benchmarks comparativos con modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica de 1.0 mide coincidencia con un conjunto de respuestas de referencia cerrado y determinismo entre plataformas, no calidad de razonamiento abierto.

## Requisitos de hardware

- VRAM: no aplica; el motor no requiere GPU. Consumo de memoria ligado al proceso de escritorio o al intérprete de Python, sin cifras publicadas.
- GPU recomendadas: no disponible (no se requiere GPU).
- GPU de consumo: irrelevante; funciona en CPU en Windows y Linux x86-64, y en macOS/ARM mediante el build Python puro.
- Despliegue: aplicación de escritorio (Windows/Linux), CLI `human-physiology`, versión web en la página del modelo y paquete Python 3.10+.
- Frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles; al ser cálculo determinista local, la latencia esperada es la de una operación aritmética, sin datos medidos publicados.

## Comparativa con modelos similares

| Criterio | human-physiology-ai999x | Calculadoras clínicas (p. ej. MDCalc) | LLM generalistas (p. ej. Llama, Mistral) | Librerías de cálculo científico (p. ej. SciPy) |
|---|---|---|---|---|
| Naturaleza | Motor determinista de cálculos fisiológicos | Calculadoras web específicas | Modelos generativos | Utilidades numéricas |
| Cobertura | 98 cálculos en 8 temas | Fórmulas clínicas concretas | Abierta, no garantizada | Genérica, sin fórmulas fisiológicas |
| Offline | Sí | No (web) | Sí, con pesos locales | Sí |
| Riesgo de alucinación | Nulo por diseño (respuestas deterministas) | Nulo | Alto en cálculos numéricos | Nulo |
| Pasos intermedios | Sí, con fórmula y unidades | Limitado | No garantizado | No |
| Licencia | Apache 2.0 | Propietaria | Variable | BSD |
| Idiomas | Inglés | Variable | Multilingüe | No aplica |

No se dispone de datos de rendimiento comparables entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no mantiene conversaciones, no responde preguntas abiertas ni genera texto libre; su alcance se limita a los 98 cálculos implementados.
- El dato de 4.715.520 parámetros en safetensors no se corresponde con la descripción funcional del motor y no debe interpretarse como tamaño de un modelo neuronal.
- Solo inglés: no hay soporte documentado de otros idiomas.
- La accuracy de 1.0 procede de un conjunto de referencia cerrado de 711 preguntas y está declarada por el autor sin verificación independiente; no implica corrección en casos no cubiertos.
- Los resultados son cálculos fisiológicos, no consejo médico; la propia model card lo indica explícitamente.
- La distribución compilada se limita a Windows y Linux x86-64; en macOS y ARM se usa un build Python puro cuya equivalencia funcional solo está respaldada por el autor.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías, soporte ni proceso de validación clínica.
- Dependencia de la versión 1.6.7 y de los binarios alojados en GitHub Releases; no se detallan políticas de mantenimiento a largo plazo.
- Sin datos publicados sobre sesgos, robustez frente a entradas malformadas más allá del manejo de rangos, ni pruebas de integración en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/human-physiology-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/human-physiology-ai999x/
- Capacidades del modelo: https://www.ai999x.com/models/human-physiology-ai999x/#capabilities
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-human-physiology-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-human-physiology-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=human-physiology-ai999x/clip.mp4
