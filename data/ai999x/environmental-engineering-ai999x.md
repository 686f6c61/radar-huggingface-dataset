# AI999X/environmental-engineering-ai999x

## Resumen

`environmental-engineering-ai999x` es un motor de cálculo determinista empaquetado como modelo de Hugging Face por el autor AI999X. No es un modelo de lenguaje neuronal: es un solver compilado (Rust, con build en Python puro para plataformas no x86-64) que resuelve 132 cálculos de ingeniería ambiental repartidos en 14 temáticas, devolviendo para cada uno la fórmula, los pasos intermedios, las unidades y una explicación en lenguaje natural cuando falta un dato o está fuera de rango.

El paquete se distribuye en cuatro formatos: aplicación de escritorio para Windows y Linux, interfaz de línea de comandos (`environmental-engineering`), versión web y biblioteca de Python instalable vía `pip install environmental-engineering-ai999x`. Todo el cálculo se ejecuta localmente, sin conexión a red, lo que el autor presenta como garantía de "cero alucinación": al ser un motor determinista, la misma entrada produce siempre la misma salida.

Es relevante para docencia, verificación de cálculos de diseño y como referencia offline en entornos de planta o campo donde no hay conectividad. El repositorio declara 4.715.520 parámetros en safetensors, cifra que corresponde al empaquetado de pesos y tablas del motor, no a una red neuronal entrenada. La licencia es Apache 2.0 y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust) con build en Python puro; no es una red neuronal transformer |
| Parametros totales | 4.715.520 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no procesa texto libre) |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos cuantizables) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado del motor); binarios de escritorio Windows/Linux; wheel de Python |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual. El modelo es un solver determinista que implementa 132 cálculos de ingeniería ambiental agrupados en 14 temas: dispersión gaussiana de penacho y elevación de penacho (Briggs), BOD y curva de oxígeno de Streeter-Phelps, diseño de tratamiento de agua y aguas residuales, fangos activados (modelo Lawrence-McCarty en mezcla completa), desinfección por CT, ley de Henry y arrastre con aire en torre empaquetada, ruido (suma de niveles en decibelios) y residuos sólidos (reducción de sólidos volátiles por Van Kleeck, proyección logística de población, entre otros).

Cada cálculo devuelve fórmula, pasos y unidades, y cuando una entrada falta o queda fuera de rango devuelve una razón en lenguaje natural en lugar de un número. El motor es el mismo en las cuatro interfaces (escritorio, CLI, web y Python), de modo que la respuesta es idéntica en todas las plataformas soportadas. La distribución incluye binarios precompilados para Windows y Linux x86-64 y una build en Python puro para macOS y ARM que, según el autor, produce las mismas respuestas.

## Capacidades

- Resolución paso a paso de 132 cálculos de ingeniería ambiental en 14 temáticas, con fórmula, sustitución, unidades y resultado.
- Dispersión atmosférica: modelo gaussiano de penacho y elevación de penacho de Briggs (atmósfera neutra o inestable), con altura efectiva de chimenea.
- Calidad de agua: curva de déficit de oxígeno y oxígeno disuelto de Streeter-Phelps en función del tiempo de viaje, DBO.
- Tratamiento de aguas residuales: fangos activados en mezcla completa según Lawrence-McCarty (sustrato y biomasa efluentes), reducción de sólidos volátiles en digestión (Van Kleeck).
- Desinfección: cálculo de CT (concentración por tiempo de contacto).
- Transferencia gas-líquido: ley de Henry y arrastre con aire en torre empaquetada (factor de arrastre, unidades de transferencia y altura).
- Ruido: suma de niveles sonoros en decibelios.
- Residuos sólidos y planificación: proyección de población por método logístico a partir de tres censos.
- Modo docente: explicación del razonamiento cuando falta una entrada o está fuera de rango, en lugar de un resultado numérico.
- Ejecución 100 % offline, sin llamadas a servicios externos.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI, navegador y API de Python.

## Casos de uso

- Docencia de ingeniería ambiental: el alumnado introduce los datos de un problema de dispersión gaussiana o de Streeter-Phelps y obtiene la fórmula, los pasos y las unidades, lo que permite corregir el procedimiento y no solo el resultado final.
- Verificación de cálculos de diseño en planta: un ingeniero comprueba a mano un cálculo de fangos activados (Lawrence-McCarty) o de reducción de sólidos volátiles antes de firmar una memoria, con la ventaja de que el motor es determinista y repetible.
- Trabajo de campo sin conectividad: al ejecutarse íntegramente offline en escritorio o CLI, es utilizable en una planta de tratamiento o en una estación de muestreo sin acceso a red.
- Automatización de hojas de cálculo en Python: la instalación vía `pip` permite invocar los cálculos desde scripts y pipelines de validación, por ejemplo para generar tablas de resultados a partir de parámetros de entrada en lote.
- Formación interna y apoyo a oposiciones: el modo de explicación paso a paso sirve como material de autoestudio para temarios de tratamiento de agua, residuos y contaminación atmosférica.
- Prevención de errores de unidades: al devolver las unidades junto a cada paso, ayuda a detectar incoherencias dimensionales en cálculos de arrastre con aire o de desinfección CT antes de que lleguen a un informe.
- Referencia rápida en evaluación ambiental: consulta puntual de la altura efectiva de chimenea por Briggs o de la suma de niveles de ruido en decibelios durante una revisión preliminar.

## Benchmarks y rendimiento

Los datos proceden del `model-index` declarado por el autor y no están verificados de forma independiente.

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de ingeniería ambiental | Golden answers (927 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("idéntica en todas las plataformas") | 1,0 (no verificado) |

No se han publicado en la información disponible resultados frente a MMLU, HumanEval, GSM8K ni otros benchmarks estándar de modelos de lenguaje, lo cual es coherente con la naturaleza del artefacto: no es un modelo generativo de texto libre.

## Requisitos de hardware

- VRAM: no aplica. No hay inferencia neuronal; el motor es un binario compilado y no requiere GPU.
- GPU recomendadas: ninguna. Funciona en CPU.
- Compatibilidad con GPU de consumo: no aplica.
- Plataformas: Windows y Linux x86-64 con binarios precompilados; macOS y ARM mediante build en Python puro.
- Python: 3.10 o superior para la instalación vía `pip`.
- Despliegue: aplicación de escritorio, CLI (`environmental-engineering`), navegador y biblioteca de Python. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de red neuronal que servir.
- Latencia y throughput: no disponibles en la información proporcionada; al ser cálculo determinista local, la latencia depende del cálculo concreto y no de un proceso de decodificación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| environmental-engineering-ai999x | Motor de cálculo determinista | 4.715.520 (empaquetado) | no aplica | Apache 2.0 | Hugging Face, escritorio, CLI, web, pip |
| Modelos LLM de propósito general (p. ej. familia Llama, Qwen, Mistral) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Variables | Hugging Face y múltiples proveedores |
| Hojas de cálculo y software de cálculo de ingeniería (p. ej. EPA SWMM, EPANET) | Herramientas de simulación específicas | no aplica | no aplica | Variables | Distribución propia |

La comparación con LLM de propósito general no es directa: un LLM puede redactar la explicación de un cálculo pero no garantiza el resultado numérico, mientras que este motor garantiza el resultado pero no cubre texto libre ni razonamiento abierto. Frente a software de simulación como SWMM o EPANET, el alcance es más limitado (132 cálculos puntuales, no simulación dinámica de redes), pero la interfaz es más simple y unificada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones abiertas ni responde preguntas fuera de los 132 cálculos implementados.
- Cobertura cerrada: solo cubre las 14 temáticas y 132 cálculos documentados; cualquier problema fuera de ese catálogo no obtiene respuesta.
- Idioma: únicamente inglés declarado; no hay soporte documentado de castellano.
- El resultado de accuracy 1,0 del `model-index` está marcado como no verificado y procede del propio autor; conviene tratarlo como una comprobación de reproducibilidad entre plataformas, no como una evaluación independiente frente a un conjunto de referencia externo.
- Riesgo de error de entrada: al ser determinista, un dato mal introducido produce un resultado coherente pero incorrecto; la validación de rangos mitiga pero no elimina este riesgo.
- No sustituye la revisión de un ingeniero titulado ni la normativa aplicable en cada jurisdicción; los cálculos son de referencia y deben contrastarse con la reglamentación local.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no hay garantía explícita de idoneidad para producción en la información disponible.
- El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere que los binarios se distribuyen fuera del repo (GitHub Releases), no como pesos en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/environmental-engineering-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/environmental-engineering-ai999x/
- Capacidades interactivas: https://www.ai999x.com/models/environmental-engineering-ai999x/#capabilities
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-environmental-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-environmental-engineering-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=environmental-engineering-ai999x/clip.mp4
- Instalación Python: `pip install environmental-engineering-ai999x`
