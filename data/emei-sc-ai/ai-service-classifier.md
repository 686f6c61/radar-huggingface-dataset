# emei-sc-ai/ai-service-classifier

## Resumen

El AI Service Classifier es un modelo de clasificación supervisada publicado por la organización emei-sc-ai en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline multi-tarea de scikit-learn, serializado con joblib, que a partir de metadatos de telemetría de red (registros DNS, handshakes TLS, metadatos de aplicación, estadísticas de bytes y paquetes, y dirección del tráfico) predice dos etiquetas: la identidad del servicio de IA observado y una categoría sintética de riesgo de política.

Su relevancia es acotada y muy específica: sirve como línea base reproducible, ligera y ejecutable en CPU para investigación sobre visibilidad de servicios de IA a partir del tráfico de red, y como demostración educativa en un Space de Hugging Face o en inferencia por lotes. El autor lo presenta explícitamente como una baseline, no como un producto: los datos de entrenamiento son filas sintéticas generadas por el propio repositorio (`src/ai_service_classifier/synthetic.py`), sin datos de clientes, y las métricas que produce el script de evaluación no deben presentarse como rendimiento en producción.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño registrado de 0.0 GB y no incluye pipeline declarado, idiomas ni licencia del modelo en los metadatos de Hugging Face. La model card solo aclara que el código del repositorio se distribuye bajo Apache-2.0 y que los términos finales del modelo y del dataset deben confirmarse antes de publicarlo bajo una organización corporativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-tarea de scikit-learn (aprendizaje automático clásico sobre características tabulares; no es un transformer ni un modelo neuronal profundo) |
| Parametros totales | No disponible (el repositorio no publica recuento de parámetros ni tamaño del artefacto; tamaño de repo registrado: 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (la entrada es un vector de características de metadatos de red, no una secuencia de texto) |
| Tipos de cuantizacion | No aplica / no disponible (artefacto joblib de scikit-learn; no hay pesos en coma flotante susceptibles de cuantización tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; las etiquetas de servicio y riesgo están definidas por el generador sintético) |
| Licencia | Apache-2.0 para el código del repositorio según la model card; términos del modelo y del dataset "por confirmar" antes de su publicación. Los metadatos de Hugging Face no declaran licencia |
| Formato de pesos | joblib (serialización de scikit-learn) |
| Etiquetas de salida | Dos: identidad del servicio de IA y categoría sintética de riesgo de política |
| Entradas | Metadatos DNS/TLS/aplicación, estadísticas de bytes y paquetes, dirección del tráfico y perfiles de servicio simulados |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion (HF) | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de scikit-learn con dos tareas de clasificación supervisada que comparten el mismo conjunto de características de entrada. El modelo no procesa texto ni píxeles: consume un vector de metadatos de red construido a partir de señales como consultas DNS, parámetros del handshake TLS, metadatos de la capa de aplicación, contadores de bytes y paquetes, y la dirección del flujo. El artefacto se distribuye en formato joblib, lo que implica dependencia directa de la versión de scikit-learn y de las librerías numéricas usadas en el entrenamiento.

El entrenamiento se realizó exclusivamente sobre datos sintéticos generados por `src/ai_service_classifier/synthetic.py`, que simula firmas de servicio simplificadas a partir de perfiles predefinidos. No se especifica en la información disponible el número de filas generadas, la proporción entre clases, el algoritmo concreto dentro del pipeline (regresión logística, bosque aleatorio, gradient boosting, etc.), ni si hubo calibración de probabilidades. Tampoco se documenta ningún proceso de ajuste fino con RLHF o DPO, algo que no aplica a esta familia de modelos. La evaluación se realiza con `python scripts/evaluate.py`, que escribe `models/ai-service-classifier/evaluation.json` con informes por etiqueta y matrices de confusión; el autor advierte de forma explícita que esas métricas provienen de datos sintéticos y no constituyen una medida de rendimiento en producción.

## Capacidades

- Clasificación multi-tarea: predice simultáneamente la identidad del servicio de IA y una categoría sintética de riesgo de política a partir de un único vector de metadatos.
- Clasificación a partir de metadatos de red: utiliza DNS, TLS, metadatos de aplicación, estadísticas de bytes y paquetes, y dirección del tráfico.
- Inferencia en CPU: diseñado para ejecutarse sin GPU, en entornos ligeros y en pipelines de evaluación por lotes.
- Evaluación reproducible: incluye script de evaluación que genera informes por etiqueta y matrices de confusión en JSON.
- Demostración educativa: pensado para un Space de Hugging Face o para demostraciones de inferencia por lotes.
- Generación de datos sintéticos: el repositorio incluye el generador que produce el conjunto de entrenamiento, lo que permite reproducir o ampliar el dataset.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Línea base para investigación en visibilidad de servicios de IA: permite establecer un punto de partida cuantitativo (con las matrices de confusión del script de evaluación) antes de invertir en modelos más complejos sobre pipelines de telemetría aprobados.
- Demostración educativa en Hugging Face Spaces: al ser un artefacto joblib pequeño y ejecutable en CPU, se puede desplegar en un Space gratuito que reciba un vector de metadatos de ejemplo y devuelva las dos etiquetas predichas.
- Inferencia por lotes sobre datos sintéticos: útil para validar el propio generador `synthetic.py`, comprobando que las firmas simuladas se recuperan con la precisión esperada y detectando clases sistemáticamente confundidas.
- Pruebas de integración de pipelines de telemetría: sirve como componente de referencia en un pipeline aprobado para verificar el formato de entrada, el contrato de salida y el flujo de escritura de resultados antes de conectar un modelo en producción.
- Análisis de deriva y calibración de confianza: el modelo puede usarse como sujeto de pruebas para construir paneles de seguimiento de confianza, tasa de "desconocido", deriva de dominios y falsos positivos en entornos controlados.
- Docencia y formación interna en seguridad de redes: como ejemplo tangible de clasificación de tráfico y de los límites de los datos sintéticos, sin exponer datos de clientes ni cargas útiles de paquetes.
- Evaluación comparativa de clasificadores clásicos: al ser un pipeline de scikit-learn, permite comparar algoritmos y juegos de características sobre el mismo dataset sintético con coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que la evaluación se ejecuta con `python scripts/evaluate.py`, que genera `evaluation.json` con informes por etiqueta y matrices de confusión, y advierte de que las métricas obtenidas sobre datos sintéticos no deben interpretarse como rendimiento en producción. No se proporcionan valores de exactitud, F1, precisión o recall.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU.
- Memoria RAM: no disponible de forma explícita; un artefacto joblib de scikit-learn de un pipeline multi-tarea suele residir en el orden de decenas a pocos cientos de MB, pero el dato no está publicado.
- GPU recomendadas: ninguna; no requiere GPU. Cualquier GPU sería irrelevante para la inferencia.
- Compatibilidad con GPU de consumo: no aplica, ya que no necesita GPU y cabe en cualquier equipo capaz de ejecutar Python y scikit-learn.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP ligero (por ejemplo FastAPI o Flask), inferencia por lotes con el script de evaluación del repositorio y despliegue como Hugging Face Space en CPU.
- Latencia y throughput: no disponibles. Al ser un modelo clásico sobre vectores tabulares, la latencia esperada sería muy baja en CPU, pero no se han publicado mediciones.
- Dependencias críticas: versión de scikit-learn compatible con la usada en el entrenamiento (no documentada), más numpy y joblib. Una versión mayor incompatible puede provocar avisos o fallos al deserializar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. Cualitativamente, este modelo se sitúa en la categoría de clasificadores tabulares clásicos para telemetría de red, donde las alternativas habituales serían:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emei-sc-ai/ai-service-classifier | No disponible | No aplica (entrada tabular) | No publicado | Apache-2.0 solo para el código; modelo por confirmar | Hugging Face, 0 descargas |
| Clasificador de reglas heurísticas sobre firmas de servicio | No aplica | No aplica | No disponible | Depende de la implementación | A medida |
| Gradient boosting (XGBoost/LightGBM) entrenado sobre el mismo dataset sintético | No disponible | No aplica | No disponible | Depende de la implementación | Requiere entrenamiento propio |
| Modelos neuronales sobre tráfico cifrado (p. ej. clasificadores de flujo) | No disponible | No aplica | No disponible | Varía | Varía |

No se han encontrado en la información proporcionada modelos publicados directamente comparables con métricas verificables.

## Limitaciones y advertencias

- Sesgo de datos sintéticos: el generador codifica firmas de servicio simplificadas; el modelo aprende esas simplificaciones y no necesariamente los patrones del tráfico real.
- Riesgo de mala clasificación en producción: proxies, CDN compartidas, metadatos cifrados, dominios cambiantes y pasarelas privadas pueden degradar gravemente la precisión.
- Servicios nuevos, raros u ofuscados intencionadamente: probablemente se clasifiquen mal o caigan en categorías desconocidas.
- La salida de riesgo es sintética y no constituye un hallazgo de seguridad confirmado; el autor lo indica de forma explícita en "out-of-scope use".
- Uso prohibido según el autor: identificar personas, clientes u organizaciones; tomar decisiones automatizadas de empleo, legales, de control de acceso o de atribución de incidentes.
- Privacidad: el diseño asume solo metadatos. No deben añadirse cargas útiles de paquetes, credenciales, identificadores de clientes, nombres de host internos ni detalles de productos propietarios sin autorización y revisión de gobernanza de datos.
- Licencia ambigua: Apache-2.0 se declara para el código del repositorio, pero los términos del modelo y del dataset están "por confirmar"; los metadatos de Hugging Face no declaran licencia. No se debe asumir uso comercial libre del artefacto sin confirmación del autor.
- Sin métricas publicadas: no hay exactitud, F1 ni matrices de confusión disponibles en la información consultada, solo el procedimiento para generarlas.
- Idiomas no declarados y pipeline no declarado en Hugging Face, lo que limita la integración automática con herramientas que dependen de esos campos.
- Metadatos inconsistentes: la fecha de creación registrada (2026-10-19) es posterior a la fecha actual, lo que sugiere un problema de metadatos en el repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de validación por terceros.
- Dependencia de la versión de scikit-learn: no se documenta la versión de entrenamiento, lo que puede romper la deserialización con joblib en entornos con versiones distintas.
- Requiere revisión humana para cualquier acción de alto impacto derivada de sus predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emei-sc-ai/ai-service-classifier
- Repositorio de código y generador sintético: referenciado en la model card como `src/ai_service_classifier/synthetic.py` (no se proporciona URL directa)
- Script de evaluación: referenciado en la model card como `scripts/evaluate.py` (no se proporciona URL directa)
- Resultados de evaluación: `models/ai-service-classifier/evaluation.json` (generado localmente, no publicado)
- No se han encontrado en la búsqueda web enlaces relevantes al modelo (papers, blogs, demos o repositorios adicionales); los resultados devueltos no guardan relación con este modelo.
