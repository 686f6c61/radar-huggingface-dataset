# AI999X/time-series-ai999x

## Resumen

time-series-ai999x es un motor determinista de resolución de problemas de series temporales publicado por AI999X (autor: Ibnul Jaif Farabi) bajo licencia Apache-2.0. No es un modelo de lenguaje generativo al uso: se presenta como un solver offline que interpreta una pregunta en inglés (o una llamada tipada), selecciona una de sus 77 capacidades certificadas de análisis de series temporales, calcula el resultado de forma exacta y lo devuelve acompañado de pasos, unidades, LaTeX y supuestos. Cuando no puede verificar la respuesta, rechaza la consulta en lugar de aproximarla.

El paquete se distribuye en varias formas: aplicación de escritorio para Windows y Linux, programa de línea de comandos `time-series`, módulo WebAssembly ejecutable en navegador y paquete de Python (`pip install time-series-ai999x`). Las versiones nativas están compiladas en Rust y las de Python actúan como envoltorio del mismo motor; no requiere GPU, clave de API ni conexión a internet.

La relevancia actual reside en su propuesta de "cero alucinaciones" en un dominio, el forecasting y el análisis estadístico de series temporales, donde los LLM generalistas suelen producir cálculos plausibles pero incorrectos. El repositorio de Hugging Face incluye pesos en safetensors (4.715.520 parámetros según los metadatos) y ONNX, aunque la model card declara `inference: false` y describe el producto como un motor de reglas y cómputo determinista más que como una red neuronal entrenada de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor determinista de resolución de problemas (selección de capacidad certificada + cómputo exacto + verificación); implementación nativa en Rust con envoltorio Python y build WebAssembly |
| Parametros totales | 4.715.520 (safetensors, según metadatos del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el motor no se ejecuta como red neuronal cuantizada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; binarios nativos Rust (Windows x86-64, Linux x86-64) y WebAssembly |

## Arquitectura y entrenamiento

La documentación disponible no describe una arquitectura de transformer ni un proceso de entrenamiento con tokens, RLHF o DPO. El sistema se define como un solver determinista: recibe una consulta, la mapea a una de las 77 capacidades certificadas (suavizado exponencial, ARIMA, filtro de Kalman, detección de change-points, media móvil, Holt-Winters, autocorrelación, test de Ljung-Box, Dickey-Fuller, KPSS y pruebas de estacionariedad, entre otras), ejecuta el cálculo exacto, lo verifica y devuelve el resultado con su desarrollo paso a paso. La implementación de referencia es Rust, compilada para Windows, Linux y WebAssembly, con un paquete Python que expone la misma funcionalidad.

El repositorio incluye artefactos en safetensors y ONNX, y los metadatos declaran 4.715.520 parámetros, pero la model card no detalla qué representan esos tensores ni si intervienen en la resolución de consultas. La innovación declarada es la verificación y el rechazo explícito ante incertidumbre, junto con la reproducibilidad multiplataforma: la evaluación del autor afirma respuestas idénticas en Windows y Linux sobre Python 3.10 a 3.14.

## Capacidades

- Resolución de preguntas de series temporales en inglés con respuesta paso a paso, unidades, notación LaTeX y supuestos declarados.
- Forecasting mediante suavizado exponencial, Holt-Winters, ARIMA y media móvil.
- Filtrado y estimación de estado con filtro de Kalman.
- Detección de change-points en series.
- Pruebas de estacionariedad: Dickey-Fuller, KPSS y análisis de autocorrelación con Ljung-Box.
- Rechazo verificado: cuando no puede computar o verificar la respuesta, devuelve una negativa explicando qué falta, en lugar de aproximar.
- Ejecución totalmente offline en CPU, sin GPU, sin clave de API y sin conexión.
- Distribución multiplataforma: aplicación de escritorio, CLI, WebAssembly en navegador y paquete de Python.
- Tareas declaradas en los metadatos: question answering, token classification, text classification, time series forecasting, sentence similarity y feature extraction.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de estadística y series temporales: el modelo devuelve el desarrollo completo con pasos y LaTeX, lo que permite usarlo como corrector o generador de soluciones verificadas en asignaturas de forecasting y estadística aplicada.
- Análisis exploratorio en notebooks: integrado vía `pip install time-series-ai999x`, permite lanzar pruebas de estacionariedad (Dickey-Fuller, KPSS) y diagnósticos de autocorrelación sobre un DataFrame sin depender de servicios externos.
- Entornos sin conectividad: al ejecutarse offline en CPU, encaja en estaciones de trabajo aisladas, laboratorios con air-gap o equipos de campo donde no se permite tráfico saliente.
- Validación de pipelines de forecasting: sus respuestas deterministas e idénticas entre plataformas permiten usarlo como oráculo de referencia en tests de regresión de código estadístico.
- Automatización de informes: la CLI `time-series` puede invocarse desde scripts para calcular métricas y diagnósticos de forma reproducible en Windows y Linux, con resultados idénticos entre sistemas.
- Detección de cambios en monitorización: la capacidad de change-point detection sirve para señalar rupturas de régimen en métricas operativas o series de negocio dentro de un flujo batch.
- Apoyo a estudiantes con verificación: el rechazo explícito ante consultas no verificables evita respuestas inventadas, algo relevante en herramientas de ayuda a deberes.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (series temporales) | Golden answers: 403 preguntas documentadas, Windows + Linux, Python 3.10-3.14 | Accuracy ("identical on every platform") | 1,0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; el motor se ejecuta en CPU.
- GPU recomendadas: ninguna; no aplica.
- Compatibilidad con GPU de consumo: irrelevante, funciona en cualquier CPU x86-64.
- Despliegue: aplicación de escritorio (Windows x86-64, Linux x86-64), CLI `time-series`, WebAssembly en navegador y paquete Python 3.10-3.14.
- Tamaño de distribución: el binario de escritorio para Windows ocupa 7,1 MB; el repositorio completo en Hugging Face, 0,1 GB.
- Latencia y throughput: no disponibles; al ser cómputo determinista local, la latencia depende del problema y del hardware, no de inferencia neuronal.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Ejecución |
|---|---|---|---|---|---|
| time-series-ai999x | Solver determinista de series temporales | 4.715.520 (metadatos) | No disponible | Apache-2.0 | Offline en CPU, CLI, escritorio, WASM, Python |
| Chronos (Amazon) | Modelo de lenguaje para series temporales basado en transformer | No disponible en esta ficha | No disponible | Apache-2.0 | GPU/CPU vía PyTorch |
| TimeGPT (Nixtla) | Modelo fundacional de forecasting como servicio | No disponible en esta ficha | No disponible | Propietaria / API | API en la nube |
| statsmodels (Python) | Biblioteca estadística clásica (ARIMA, tests) | No aplica | No aplica | BSD-3 | CPU, Python |

La comparación es cualitativa: no se dispone de datos de rendimiento de los alternativas en la información proporcionada. La diferencia principal de time-series-ai999x frente a Chronos o TimeGPT es que no realiza predicción neuronal, sino cómputo estadístico verificado con rechazo ante incertidumbre; frente a statsmodels, añade interfaz en lenguaje natural, verificación y distribución como binario offline.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte documentado de otros idiomas.
- No es un modelo generativo general: no redacta texto libre, no mantiene conversaciones abiertas ni genera código.
- La cobertura se limita a las 77 capacidades certificadas declaradas; consultas fuera de ese conjunto se rechazan.
- El resultado "accuracy 1,0" del model-index está declarado por el autor y marcado como no verificado; procede de un conjunto propio de 403 preguntas, no de un benchmark independiente.
- La model card declara `inference: false`; los pesos safetensors y ONNX no se presentan con instrucciones de uso como red neuronal, por lo que su función exacta no está documentada.
- No se documentan sesgos, pero al ser un motor determinista el riesgo relevante es de cobertura (rechazos) más que de alucinación.
- La licencia Apache-2.0 permite uso comercial; conviene revisar el archivo LICENSE del repositorio y las condiciones de las descargas de escritorio y CLI alojadas en ai999x.com.
- Para producción, verificar la reproducibilidad en el sistema operativo y versión de Python objetivo antes de integrarlo en pipelines críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/time-series-ai999x
- Organización en Hugging Face: https://huggingface.co/AI999X
- Documentación en el repositorio: https://huggingface.co/AI999X/time-series-ai999x/tree/main/docs
- Evaluación en el repositorio: https://huggingface.co/AI999X/time-series-ai999x/tree/main/evaluation
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Probar en navegador: https://www.ai999x.com/models/time-series-ai999x/#try
- Paquete Python (PyPI): https://pypi.org/project/time-series-ai999x/
- Web oficial: https://ai999x.com
- Repositorio GitHub y release v1.0.3: https://github.com/AI999X/time-series-ai999x/releases/tag/v1.0.3
- Descargas de escritorio (última versión): https://www.ai999x.com/downloads/desktop/latest/
- Checksums SHA256: https://www.ai999x.com/downloads/desktop/1.2.0/SHA256SUMS
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
