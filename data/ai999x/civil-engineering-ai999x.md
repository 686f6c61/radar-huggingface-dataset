# AI999X/civil-engineering-ai999x

## Resumen

Civil Engineering (civil-engineering-ai999x) es un motor de cálculo determinista empaquetado y distribuido con el formato de un modelo de Hugging Face, orientado a la resolución de problemas de ingeniería civil: hidráulica de tuberías y canales abiertos, hidrología, flujo de aguas subterráneas, mecánica de suelos y cimentaciones, redes de agua y topografía. Lo desarrolla AI999X y abarca 88 cálculos organizados en 7 áreas temáticas, cada uno con su fórmula, sus pasos intermedios y sus unidades, además de una explicación en lenguaje natural cuando falta un dato de entrada o este queda fuera de rango.

El paquete se presenta con cuatro vías de uso: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos, versión web y biblioteca de Python 3.10+. Todo el cálculo se ejecuta en local, sin conexión a red, lo que el autor asocia a un comportamiento determinista y "cero alucinación": al no ser un modelo generativo, las respuestas son reproducibles y verificables paso a paso.

El artefacto aloja 4.715.520 parámetros en safetensors según los metadatos del repositorio, aunque la model card describe un motor compilado (con etiquetas que mencionan Rust y Python) y no una red neuronal entrenada. Está pensado para estudiantes, docentes y profesionales que necesitan resolver ejercicios de ingeniería civil con trazabilidad completa del procedimiento y de las unidades, en inglés y con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (no es un transformer generativo); empaquetado como artefacto tipo modelo |
| Parámetros totales | 4.715.520 (según safetensors del repositorio) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un motor de cálculo) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio); distribución principal como binarios compilados (Windows/Linux x86-64) y paquete Python con build pure-Python para macOS y ARM |
| Pipeline declarado | question-answering |
| Cobertura funcional | 88 cálculos en 7 áreas temáticas |
| Plataformas | Windows, Linux (x86-64); macOS y ARM vía build pure-Python; navegador |
| Requisitos de Python | 3.10+ |
| Versión del paquete | 1.6.7 |

## Arquitectura y entrenamiento

No se trata de una red neuronal entrenada con tokens, sino de un motor de cálculo compilado que implementa fórmulas cerradas de ingeniería civil. La model card describe "un motor compilado, cuatro formas de usarlo" y etiqueta el proyecto con Rust y Python, lo que sugiere un núcleo de cálculo compilado con enlaces de Python y una capa de presentación (aplicación de escritorio, CLI y web). Cada uno de los 88 cálculos incluye fórmula, pasos intermedios, unidades y mensajes de diagnóstico cuando una entrada falta o está fuera de rango.

No hay información disponible sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones de inferencia como decodificación especulativa o atención lineal, porque el artefacto no es un modelo de lenguaje generativo. La "evaluación" declarada se basa en 566 preguntas documentadas con respuestas doradas, ejecutadas en Windows y Linux con Python 3.10 a 3.14, y el autor afirma resultados idénticos en todas las plataformas.

## Capacidades

- Resolución paso a paso de 88 cálculos de ingeniería civil en 7 áreas: hidráulica de tuberías y canales abiertos, hidrología, aguas subterráneas, mecánica de suelos y cimentaciones, redes de agua y topografía.
- Hidráulica de canales abiertos: ecuación de Manning para caudal en canales rectangulares, resalto hidráulico, vertederos y flujo uniforme.
- Hidráulica de tuberías y redes: Hazen-Williams y método de Hardy Cross para reparto de caudales en redes de agua.
- Hidrología: convolución con hidrograma unitario, frecuencia de crecientes y periodo de retorno para un riesgo aceptable en una vida útil de diseño.
- Aguas subterráneas: descenso de nivel (drawdown) mediante la solución de Theis alrededor de un pozo de bombeo.
- Geotecnia: asentamiento por consolidación primaria de arcilla normalmente consolidada, capacidad portante y empuje de tierras (empuje activo de Coulomb en muro rugoso con relleno inclinado).
- Topografía: elementos de una curva circular horizontal simple.
- Presentación de resultados con fórmula, pasos, unidades y motivo explícito cuando una entrada no es válida.
- Ejecución offline y determinista; sin tool calling, sin agentes, sin capacidades multimodales ni modo de razonamiento generativo, ya que no es un modelo de lenguaje.
- Interfaz de pregunta-respuesta sobre el catálogo de cálculos (pipeline declarado: question-answering), en inglés.

## Casos de uso

- Docencia de hidráulica: el alumnado plantea un problema de Manning en un canal rectangular y el motor devuelve la fórmula, la sustitución numérica, el resultado con unidades y los pasos intermedios, lo que permite usarlo como corrector automático de prácticas sin conexión.
- Cálculo de redes de distribución de agua: aplicación del método de Hardy Cross con Hazen-Williams para repartir caudales en una red mallada y comprobar iteraciones, útil en asignaturas de abastecimiento y en anteproyectos de redes de pequeño tamaño.
- Estudios hidrológicos preliminares: convolución de un hidrograma unitario para obtener el hidrograma de escorrentía directa y cálculo del periodo de retorno asociado a un riesgo aceptable durante la vida útil de una infraestructura.
- Evaluación de bombeos en acuíferos: estimación del descenso alrededor de un pozo mediante la solución de Theis para dimensionar caudales de extracción y distancias a pozos vecinos en fase de prefactibilidad.
- Geotecnia de cimentaciones: cálculo del asentamiento por consolidación primaria de una arcilla normalmente consolidada y del empuje activo de Coulomb sobre un muro con relleno inclinado, con la trazabilidad necesaria para revisar hipótesis en un informe.
- Trazado viario básico: obtención de los elementos de una curva circular horizontal (tangente, desarrollo, cuerda, externa) para replanteos preliminares y comprobación de ejercicios de topografía.
- Integración en pipelines de Python: uso como biblioteca (`pip install civil-engineering-ai999x`) para incorporar las 88 rutinas de cálculo a cuadernos de cálculo, scripts de validación o generadores de memorias, con build compilado en Windows y Linux x86-64 y build pure-Python en macOS y ARM.
- Entornos sin conectividad: despliegue en aulas, obra o campo mediante la aplicación de escritorio o la CLI, donde no hay acceso a servicios en la nube y se requiere reproducibilidad entre plataformas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index, no verificados de forma independiente:

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de ingeniería civil | Golden answers (566 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("idéntico en todas las plataformas") | 1,0 (verificado: false) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El dato de accuracy 1,0 debe interpretarse como coincidencia con las respuestas doradas del propio autor sobre su catálogo de 566 preguntas, no como una medida de capacidad general.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no requiere GPU para inferencia. El cálculo se ejecuta en CPU.
- GPU recomendadas: no disponible (no se requiere GPU).
- GPU de consumo: irrelevante; funciona en cualquier equipo con Windows o Linux x86-64, o con Python 3.10+ en macOS y ARM mediante el build pure-Python.
- Almacenamiento: el repositorio ocupa 0,0 GB según los metadatos; los binarios de escritorio y CLI se distribuyen como archivos comprimidos independientes (versión 1.6.7).
- Opciones de despliegue: aplicación de escritorio (Windows/Linux), CLI `civil-engineering` (Windows/Linux), versión web en la página del modelo y biblioteca de Python (`pip install civil-engineering-ai999x`). No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma numérica; al ser cálculos de fórmula cerrada sobre CPU, la latencia esperada es de milisegundos por consulta, aunque no se aporta medición en la información disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (motores de cálculo de ingeniería civil empaquetados como artefactos de Hugging Face). Como referencia funcional, las alternativas habituales serían hojas de cálculo con fórmulas propias, scripts de Python ad hoc o software comercial de cálculo hidráulico y geotécnico, pero no se dispone de datos de parámetros, contexto ni rendimiento de esas alternativas en la información disponible para construir una tabla rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona sobre problemas abiertos ni admite preguntas fuera del catálogo de 88 cálculos implementados.
- Cobertura acotada: solo resuelve los cálculos documentados en sus 7 áreas temáticas; cualquier problema fuera de ese conjunto debe resolverse con otras herramientas.
- Idioma: únicamente inglés, tanto en la interfaz como en las explicaciones.
- El resultado de accuracy 1,0 está declarado por el autor y marcado como no verificado; se mide contra sus propias respuestas doradas, por lo que no constituye una validación independiente.
- Los metadatos indican 4.715.520 parámetros en safetensors, pero la model card describe un motor compilado; conviene tratar esa cifra con cautela y no asumir que corresponde a una red neuronal entrenada.
- La etiqueta `inference: false` en la model card indica que no se ofrece inferencia alojada estándar en Hugging Face; el uso requiere descargar los binarios o instalar el paquete de Python.
- Riesgo de error de entrada: el motor devuelve un motivo en lugar de un número cuando falta un dato o está fuera de rango, pero la validez del resultado depende de que las unidades y los parámetros introducidos sean los correctos; no se documenta validación dimensional completa.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales, pero tampoco garantías de idoneidad para uso profesional en proyectos reales.
- Para uso en producción de ingeniería (memorias, cálculos estructurales o hidráulicos oficiales) se recomienda validación por un técnico competente y contraste con normativa aplicable; el autor no declara certificación ni conformidad normativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/civil-engineering-ai999x
- Página del modelo con capacidades interactivas: https://www.ai999x.com/models/civil-engineering-ai999x/
- Demostración en vídeo (MP4): https://www.ai999x.com/?ax_shot=civil-engineering-ai999x/clip.mp4
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-civil-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-civil-engineering-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio en GitHub: https://github.com/AI999X/ai999x-desktop
- Paquete de Python: `pip install civil-engineering-ai999x`
