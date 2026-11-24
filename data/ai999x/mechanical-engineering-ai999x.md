# AI999X/mechanical-engineering-ai999x

## Resumen
mechanical-engineering-ai999x es un motor de cálculo determinista empaquetado y distribuido a través de Hugging Face por el autor AI999X, orientado a la resolución de problemas de ingeniería mecánica. No se trata de un modelo de lenguaje generativo con pesos transformer, sino de un binario compilado (con build en Python puro para plataformas no x86-64) que resuelve 97 cálculos agrupados en 14 temas: estática, tensión y deformación, vigas y pórticos, propiedades de sección, torsión, pandeo, fatiga, elementos de máquina, vibraciones y análisis estructural. Cada cálculo devuelve fórmula, pasos, unidades y una explicación textual del motivo cuando falta un dato o está fuera de rango.

El repositorio declara 4.715.520 parámetros en formato safetensors, una cifra que en la práctica corresponde al recuento interno de constantes y tablas del motor más que a pesos de una red neuronal entrenada. La licencia es Apache 2.0, el idioma declarado es inglés y el pipeline asignado es question-answering. Su propuesta de valor es la ejecución completamente offline, con resultados idénticos entre Windows y Linux y ausencia declarada de alucinación, lo que lo posiciona como herramienta de apoyo docente y de verificación de cálculos más que como asistente conversacional.

La relevancia actual reside en su enfoque de "cero alucinación" para dominios de ingeniería, donde un resultado numérico erróneo tiene consecuencias físicas. Frente a los LLM generalistas, el modelo no razona libremente: aplica fórmulas cerradas y valida entradas. Se distribuye como aplicación de escritorio, CLI, versión web y paquete de Python, lo que facilita su integración en flujos de trabajo existentes sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust, según tags); build Python puro en plataformas no x86-64; no es un transformer |
| Parametros totales | 4.715.520 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo generativo) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo); distribución principal como binarios compilados y paquete pip |

## Arquitectura y entrenamiento
El modelo no emplea una arquitectura transformer ni MoE. Según la model card, se trata de "un motor compilado" que implementa 97 cálculos de ingeniería mecánica con sus fórmulas, pasos intermedios y unidades. Los tags del repositorio incluyen "rust", lo que sugiere que el núcleo está implementado en Rust y compilado para Windows y Linux x86-64; en macOS y ARM se distribuye una build en Python puro que, según el autor, produce las mismas respuestas. No hay información pública sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque el sistema no se entrena con esos paradigmas: la lógica de resolución está codificada explícitamente.

La innovación técnica declarada es la determinación y la trazabilidad: cada respuesta incluye fórmula, pasos y unidades, y cuando una entrada falta o está fuera de rango el motor devuelve una razón en lenguaje natural en lugar de un número. El autor afirma resultados idénticos en Windows y Linux con Python 3.10 a 3.14, lo que apunta a un diseño orientado a la reproducibilidad. No se documentan mecanismos de decodificación especulativa, atención lineal ni otras técnicas propias de LLM.

## Capacidades
- Resolución de 97 cálculos de ingeniería mecánica en 14 temas: estática, tensión y deformación, vigas y pórticos, propiedades de sección, torsión, columnas y pandeo, fatiga, elementos de máquina, vibraciones y análisis estructural.
- Cálculos destacados según la model card: viga simplemente apoyada con carga puntual, tensiones principales y cortante máximo (círculo de Mohr, tensión plana), factor de seguridad a fatiga por Goodman modificado, carga de pandeo de Euler con condiciones de extremo, capacidad de carga requerida de rodamiento, tensiones en disco rotatorio (macizo o con agujero central), propiedades de sección compuesta por teorema de ejes paralelos y sistema fuerza-par equivalente.
- Salida paso a paso con fórmula, unidades y explicación del motivo cuando una entrada falta o está fuera de rango.
- Ejecución completamente offline en el equipo del usuario.
- Cuatro vías de uso: aplicación de escritorio (Windows, Linux), línea de comandos `mechanical-engineering`, navegador y paquete de Python (`pip install mechanical-engineering-ai999x`).
- Escenas y gráficos generados a partir del resultado calculado (por ejemplo, visualización de la viga y de los diagramas asociados).
- No se documentan tool calling, function calling, razonamiento multi-paso libre, agentes, visión, audio ni modo thinking.

## Casos de uso
- Docencia de resistencia de materiales: el estudiante introduce los datos de una viga simplemente apoyada y obtiene reacciones, diagramas de cortante y flector, fórmula aplicada y unidades, lo que permite verificar el procedimiento a mano paso a paso.
- Verificación de cálculos en despacho de ingeniería: un ingeniero calcula el factor de seguridad a fatiga por Goodman modificado de un eje y contrasta el resultado con su hoja de cálculo, usando el motor como segunda opinión offline sin enviar datos sensibles a la nube.
- Dimensionado de columnas en obra: se introduce la longitud, las condiciones de extremo y la rigidez para obtener la carga crítica de pandeo de Euler y decidir si el perfil cumple con el margen requerido.
- Selección de rodamientos en catálogo: el motor calcula la capacidad de carga requerida a partir de la carga dinámica equivalente y la vida deseada, lo que acelera la consulta del rodamiento adecuado en el catálogo del fabricante.
- Análisis de secciones compuestas: para perfiles formados por rectángulos, se obtienen área, centroide y momentos de inercia mediante el teorema de ejes paralelos, útil en el diseño de secciones no estándar.
- Automatización de memorias de cálculo: mediante el paquete de Python se integran las funciones del motor en scripts que generan informes con resultados y unidades, sin dependencia de red.
- Formación interna y autoaprendizaje: la aplicación de escritorio con escenas interactivas permite explorar cómo cambia la respuesta al mover un parámetro, lo que sirve como material de apoyo en cursos de grado y máster.

## Benchmarks y rendimiento
Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering de ingeniería mecánica | Golden answers (361 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1.0 |

El autor declara precisión del 100 % sobre un conjunto propio de 361 preguntas con respuestas de referencia, con resultados idénticos entre plataformas. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks estándar de LLM, y no procede compararlos porque el sistema no es un modelo generativo. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica; no se ejecuta en GPU. El motor corre en CPU.
- GPU recomendadas: ninguna; no requiere aceleración gráfica.
- Cabe en cualquier equipo de consumo: el paquete compilado para Windows y Linux x86-64 y la build de Python puro para macOS y ARM no exigen hardware especializado.
- Opciones de despliegue: aplicación de escritorio (Windows, Linux), CLI `mechanical-engineering`, versión web en la página del modelo y paquete de Python 3.10+ instalable con pip. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser cálculo determinista local, la latencia depende del cálculo concreto y del equipo.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (motores de cálculo de ingeniería mecánica empaquetados como modelos de Hugging Face). Frente a LLM generalistas de razonamiento técnico, la diferencia cualitativa es que este motor no genera texto libre ni alucina, pero tampoco cubre consultas fuera de sus 97 cálculos predefinidos.

## Limitaciones y advertencias
- Cobertura cerrada: solo resuelve los 97 cálculos de los 14 temas documentados; cualquier problema fuera de ese catálogo no se atiende.
- Idioma: únicamente inglés; no hay soporte declarado de castellano.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni razona sobre problemas abiertos.
- La métrica de precisión del 100 % procede de un conjunto de evaluación propio del autor y no ha sido verificada de forma independiente; debe interpretarse con cautela.
- El recuento de 4.715.520 parámetros en safetensors no equivale a un modelo entrenado; no debe compararse con LLM en términos de capacidad.
- Riesgo de uso indebido en producción: los resultados son cálculos de apoyo y no sustituyen la revisión de un ingeniero colegiado ni el cumplimiento de normativa aplicable.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- No se documentan sesgos, pero al ser un motor determinista el riesgo relevante es el error de modelado o la aplicación incorrecta de hipótesis (por ejemplo, usar pandeo de Euler fuera del régimen elástico).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/AI999X/mechanical-engineering-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/mechanical-engineering-ai999x/
- Capacidades interactivas: https://www.ai999x.com/models/mechanical-engineering-ai999x/#capabilities
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-mechanical-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-mechanical-engineering-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=mechanical-engineering-ai999x/clip.mp4
