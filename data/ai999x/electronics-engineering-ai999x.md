# AI999X/electronics-engineering-ai999x

## Resumen

Electronics Engineering (electronics-engineering-ai999x) es un motor de cálculo determinista empaquetado como modelo de la librería `electronics-engineering-ai999x`, desarrollado por AI999X. No es un modelo de lenguaje neuronal al uso: es un conjunto de 92 cálculos organizados en 11 temas de ingeniería electrónica (semiconductores y uniones pn, diodos y rectificadores, polarización de BJT y MOSFET, circuitos con amplificadores operacionales, filtros activos, osciladores y temporizadores 555, ADC y DAC, temporización digital y fuentes de alimentación), cada uno con su fórmula, sus pasos y sus unidades. Se distribuye con 4.715.520 parámetros en safetensors y se declara compatible con la tarea de question answering.

El modelo resuelve el problema de obtener respuestas paso a paso y verificables en problemas de electrónica sin depender de la nube: el motor compilado se ejecuta en local y de forma offline en cuatro formatos (aplicación de escritorio para Windows y Linux, línea de comandos, navegador y paquete de Python). Su propuesta diferencial es el "cero alucinación": cuando una entrada falta o está fuera de rango, devuelve una razón en lenguaje natural en lugar de un número inventado.

Es relevante ahora para docentes, estudiantes y desarrolladores que necesitan un solucionador de electrónica reproducible y auditable, con resultados idénticos entre plataformas (Windows y Linux, Python 3.10 a 3.14, según el autor). La licencia Apache 2.0 facilita su integración en herramientas educativas y pipelines internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor de cálculo determinista; no se declara arquitectura de red neuronal) |
| Parametros totales | 4.715.520 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de transformer, MoE, SSM ni híbrida. La model card presenta el artefacto como "un motor compilado" con 92 cálculos en 11 temas, cada uno con fórmula, pasos y unidades, y con un mecanismo de validación que devuelve una explicación en lugar de un resultado cuando falta una entrada o está fuera de rango. El paquete `electronics-engineering-ai999x` se instala vía `pip` en Windows y Linux x86-64 con el motor compilado, y en macOS y ARM con una compilación en Python puro que, según el autor, ofrece las mismas respuestas.

No se especifican datos de entrenamiento (número de tokens, composición del dataset), ni procesos de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal. El único dato de evaluación declarado es un conjunto de 561 preguntas documentadas ("Golden answers") ejecutado en Windows y Linux con Python 3.10 a 3.14.

## Capacidades

- Resolución paso a paso de 92 cálculos de electrónica en 11 temas, con fórmula, pasos intermedios y unidades.
- Cobertura de semiconductores y uniones pn, circuitos con diodos y rectificadores, polarización y amplificadores BJT y MOSFET, circuitos con amplificadores operacionales, filtros activos, osciladores y temporizadores 555, ADC y DAC, temporización digital y fuentes de alimentación.
- Modo de respuesta segura: ante entradas ausentes o fuera de rango devuelve una razón explicada en lugar de un valor numérico.
- Ejecución offline y local, sin dependencia de servicios en la nube.
- Cuatro interfaces de uso: aplicación de escritorio (Windows, Linux), línea de comandos `electronics-engineering`, navegador y paquete de Python 3.10+.
- Visualizaciones generadas a partir del resultado calculado (escenas y gráficas en la aplicación de escritorio).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso genérico, visión, audio ni modo de pensamiento.

## Casos de uso

- Docencia de electrónica analógica: el motor resuelve ejercicios de polarización por divisor de tensión en BJT mostrando el punto Q exacto con pasos y unidades, lo que permite al alumnado comprobar su procedimiento.
- Diseño y verificación de filtros activos: el cálculo de Sallen-Key de paso bajo (f0, Q y ganancia) se integra en una hoja de cálculo o script de Python para validar topologías antes de simular en SPICE.
- Temporización con 555: obtención de frecuencia y ciclo de trabajo en configuración astable para prototipos de laboratorio, con resultado reproducible entre máquinas Windows y Linux.
- Cálculo de puntos de operación de diodos: resolución exacta del punto de trabajo de un diodo en serie con una resistencia, útil para dimensionar rectificadores y limitadores.
- Caracterización de convertidores ADC: cálculo del código de salida, el LSB y el error de cuantización para validar la resolución efectiva de una cadena de adquisición.
- Estimación de retardos en lógica CMOS: uso del modelo switch-resistor para calcular el retardo de propagación de una puerta y ajustar presupuestos de temporización.
- Automatización de hojas de problemas: la CLI permite procesar lotes de ejercicios en un pipeline de CI o en un script de generación de material didáctico sin conexión a internet.

## Benchmarks y rendimiento

| Tarea | Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingeniería electrónica | Golden answers (561 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 ("idéntico en cada plataforma") | No |

Los datos proceden del model-index declarado por el autor. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto se distribuye como motor compilado y no se documentan requisitos de GPU.
- GPU recomendadas: no aplica según la información disponible; la ejecución es local en CPU en Windows y Linux x86-64, y en Python puro en macOS y ARM.
- GPU de consumo: no se declara soporte ni necesidad de GPU.
- Opciones de despliegue: aplicación de escritorio (Windows, Linux), CLI `electronics-engineering`, versión en navegador y paquete de Python (`pip install electronics-engineering-ai999x`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electronics-engineering-ai999x | Motor de cálculo determinista para electrónica | 4.715.520 | No disponible | Apache 2.0 | Hugging Face, pip, escritorio, CLI, navegador |
| Alternativas de propósito similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (solucionadores deterministas de electrónica) en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: cubre únicamente los 92 cálculos de los 11 temas declarados; no es un modelo de lenguaje general ni responde preguntas fuera de ese dominio.
- Idioma: solo inglés; no se declara soporte de castellano ni de otros idiomas.
- El resultado de accuracy 1,0 del model-index no está verificado (`verified: false`) y procede de una evaluación del propio autor sobre su conjunto de preguntas, por lo que no es una validación independiente.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; el mecanismo de "cero alucinación" se limita a devolver una razón cuando faltan entradas o están fuera de rango.
- No se especifican límites de contexto, latencia ni throughput, lo que dificulta planificar despliegues con requisitos de tiempo real.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan garantías ni soporte; conviene revisar el archivo LICENSE del repositorio.
- El repositorio ocupa 0,0 GB según Hugging Face, dato que puede reflejar un empaquetado externo de los binarios distribuidos vía GitHub Releases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/electronics-engineering-ai999x
- Página del modelo en AI999X: https://www.ai999x.com/models/electronics-engineering-ai999x/
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-electronics-engineering-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-electronics-engineering-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Demostración en vídeo: https://www.ai999x.com/?ax_shot=electronics-engineering-ai999x/clip.mp4
