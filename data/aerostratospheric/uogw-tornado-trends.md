# aerostratospheric/uogw-tornado-trends

## Resumen

UOGW Tornado Trends Suite (advanced) es un paquete de modelos de investigación publicado por el usuario aerostratospheric (Aerostratospheric, midwestsds.com) en Hugging Face. No es una red neuronal ni un modelo de lenguaje: se distribuye como artefactos de scikit-learn serializados con joblib bajo la etiqueta pipeline_tag `tabular-classification`, orientados a climatología de tornados en Estados Unidos y, en particular, a tendencias en el Medio Oeste y en el condado de Clark.

El paquete agrupa cuatro cabezas funcionales: `state_month_count` (recuento esperado de tornados por estado, mes y año a partir del registro SPC 1950-2024), `ef_severity` (clasificación de severidad EF/magnitud en bins 0-5 a partir de proxies de geometría de trayectoria), `midwest_annual_trend` (ajuste de tendencia lineal del recuento anual en el Medio Oeste) y `clark_pre_tornado_research` (ajuste de un score de investigación pre-tornado frente a sus componentes, cuando hay historial disponible).

Su relevancia es acotada y explícita: la propia model card lo define como material de ciencia abierta para cribado y educación, y advierte que **no** es un sistema de avisos, vigilancias ni perspectivas oficiales. El repositorio es de tamaño prácticamente nulo (0,0 GB), no tiene descargas ni "likes", la licencia es CC-BY-4.0 y todos los datos de entrenamiento declarados son estadounidenses y en inglés. La fecha de creación declarada en los metadatos es el 18 de septiembre de 2026 y el entrenamiento se marca en 2026-09-18T15:34:31Z.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de scikit-learn serializados con joblib; el estimador concreto de cada cabeza no se detalla en la model card (no disponible) |
| Parámetros totales | No disponible (no se publican recuentos de parámetros ni coeficientes) |
| Longitud de contexto | No aplica (modelos tabulares, no secuenciales) |
| Tipos de cuantización | No aplica (no hay pesos en coma flotante que cuantizar) |
| Idiomas soportados | Inglés (en); los datos de entrenamiento son de Estados Unidos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Joblib (serialización de scikit-learn); se menciona un `metrics.json` en el repositorio |
| Tarea (pipeline) | `tabular-classification` |
| Cabezas incluidas | `state_month_count`, `ef_severity`, `midwest_annual_trend`, `clark_pre_tornado_research` |
| Datos de entrenamiento | Base de datos de tiempo severo NOAA/SPC (CSV de tornados) y productos de escritorio UOGW `pre-tornado-clark` |
| Fecha de entrenamiento declarada | 2026-09-18T15:34:31Z |
| Fecha de creación en Hugging Face | 2026-09-18T15:44:00Z |
| Última actualización | 2026-09-18T15:44:04Z |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se describe una arquitectura de red neuronal. El paquete se apoya en la librería scikit-learn (`library_name: sklearn`) y se distribuye como artefactos joblib, lo que implica un pipeline clásico de preprocesado más un estimador tabular cuyo tipo exacto (regresión lineal, árboles, gradient boosting, etc.) no se especifica en la información disponible. Las cuatro cabezas cubren tareas distintas: recuento por estado-mes-año, clasificación ordinal de severidad EF 0-5, ajuste de tendencia lineal anual y ajuste de un score compuesto de investigación.

En cuanto a los datos, la model card cita la base de datos de tiempo severo NOAA/SPC en formato CSV de tornados, con cobertura declarada de 1950 a 2024, junto con productos de escritorio UOGW `pre-tornado-clark`. No se indica el número de tokens ni de muestras, la composición detallada del dataset, el reparto train/validación/test, ni si hubo algún tipo de ajuste por refuerzo o preferencias (no aplicable en modelos tabulares de este tipo). El autor remite a un `metrics.json` para las métricas, pero su contenido no se incluye en la información proporcionada.

## Capacidades

- Predicción de recuentos esperados de tornados por estado de Estados Unidos, mes y año, usando el registro histórico SPC 1950-2024.
- Clasificación de severidad en bins EF/magnitud de 0 a 5 a partir de proxies de geometría de trayectoria (no de mediciones directas de viento).
- Estimación de tendencia lineal de largo plazo del recuento anual de tornados en el Medio Oeste.
- Ajuste de un score de investigación pre-tornado para el condado de Clark frente a sus componentes, cuando existe historial disponible.
- Salida tabular estructurada, apta para integrarse en cuadernos y pipelines de análisis en Python.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni capacidades de agente. No hay modo "thinking" ni decodificación especulativa.
- Capacidad multilingüe: nula más allá del inglés, y el dominio de aplicación está restringido a climatología de tornados de Estados Unidos.

## Casos de uso

- Cribado climatológico estacional: usar `state_month_count` para obtener recuentos esperados por estado y mes, y alimentar con ellos ejercicios de planificación de recursos de respuesta ante emergencias (siempre como referencia histórica, nunca como aviso operativo).
- Investigación reproducible sobre tendencias: emplear `midwest_annual_trend` para documentar la evolución del recuento anual en el Medio Oeste y compararla con metodologías alternativas en estudios de atribución climática.
- Etiquetado proxy de severidad: aplicar `ef_severity` para asignar bins EF/magnitud en registros donde solo se dispone de geometría de trayectoria, generando etiquetas auxiliares para análisis o para entrenar modelos posteriores.
- Validación y control de calidad de datos: contrastar los recuentos predichos con los observados en el CSV del SPC para detectar huecos, duplicados o años con cobertura incompleta en el registro.
- Educación y divulgación meteorológica: ilustrar en docencia cómo se modela la frecuencia de tornados por región y mes, y qué limites tienen los modelos estadísticos frente a la predicción operativa.
- Análisis exploratorio pre-tornado en el condado de Clark: usar `clark_pre_tornado_research` para estudiar la relación entre el score UOGW y sus componentes en episodios históricos documentados.
- Generación de series sintéticas de recuento: producir escenarios de frecuencia mensual para pruebas de estrés de simuladores de impacto o de modelos de asignación de recursos, dejando claro que son valores modelados y no observaciones.
- Integración en pipelines de datos: cargar los artefactos joblib dentro de flujos de pandas/scikit-learn para incorporar la señal climatológica como feature en modelos propios de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio referencia un archivo `metrics.json`, pero su contenido no se ha facilitado, por lo que no se pueden reportar métricas de precisión, error absoluto medio, AUC ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no aplica. Al tratarse de modelos de scikit-learn serializados con joblib, la inferencia se ejecuta en CPU y no requiere memoria de GPU.
- GPU recomendadas: no se requiere GPU para el uso previsto. No hay soporte documentado para aceleración por hardware específico.
- GPU de consumo: irrelevante para este paquete; el cuello de botella es el coste de carga del artefacto joblib y el volumen de datos tabulares procesados.
- Opciones de despliegue: carga directa con `joblib.load` dentro de Python, o exposición mediante un servicio (FastAPI, Flask, contenedores) en CPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no aplican.
- Latencia y throughput: no disponibles. Dependerán del estimador concreto, del tamaño de los artefactos y del volumen de filas; el tamaño del repositorio es de 0,0 GB, lo que sugiere artefactos pequeños y tiempos de carga bajos.

## Comparativa con modelos similares

En la información disponible no se identifican paquetes de modelos publicados equivalentes con los que comparar parámetros, contexto, rendimiento o disponibilidad. La referencia natural del dominio no es un modelo sino una base de datos: el registro histórico de tornados NOAA/SPC 1950-2024, que actúa como línea base climatológica frente a la que debería medirse cualquier mejora.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UOGW Tornado Trends Suite (advanced) | No disponible | No aplica | No disponible | CC-BY-4.0 | Hugging Face, 0 descargas |
| Baseline climatológico NOAA/SPC | No aplica (base de datos) | No aplica | No disponible | Consultar condiciones de NOAA/SPC | Pública |
| Modelos tabulares propios (gradient boosting u otros) | No disponible | No aplica | No disponible | Según implementación | No identificados en la información proporcionada |

## Limitaciones y advertencias

- No es un sistema de aviso, vigilancia ni perspectiva oficial. La propia model card lo declara material de ciencia abierta para cribado y educación, por lo que no debe usarse para decisiones operativas de protección civil.
- Riesgo de interpretación indebida: las salidas son ajustes estadísticos sobre datos históricos y pueden leerse como predicciones puntuales cuando no lo son.
- Sesgo geográfico y temporal: el entrenamiento depende del registro SPC 1950-2024 y de productos UOGW del condado de Clark; la cobertura y la calidad del registro varían por época y región, lo que puede sesgar tendencias y recuentos.
- Sesgo de reporte: la detección y notificación de tornados ha cambiado con el tiempo y con la densidad de población, un factor que afecta directamente a cualquier modelo de tendencia anual.
- Limitación idiomática: solo inglés y solo territorio estadounidense. No es trasladable sin reentrenamiento a otras regiones.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero al derivar de datos NOAA/SPC y de productos UOGW conviene verificar las condiciones de las fuentes originales antes de un uso comercial.
- Opacidad técnica: no se especifica el estimador concreto de cada cabeza, ni el reparto de datos, ni las métricas (`metrics.json` no está disponible en la información facilitada), lo que dificulta auditar su comportamiento.
- Trazabilidad: el modelo no publica número de muestras de entrenamiento ni validación independiente, de modo que no se puede estimar su capacidad de generalización.
- Metadatos anómalos: la fecha de creación declarada en Hugging Face (2026-09-18) es posterior a la fecha de entrenamiento registrada (2026-09-18T15:34:31Z) por unos diez minutos, algo coherente, pero conviene comprobar la vigencia de los ficheros antes de reutilizarlos.
- Estado del repositorio: 0 descargas, 0 likes y 0,0 GB de tamaño, lo que indica que no hay validación externa conocida ni comunidad de usuarios que haya reportado problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aerostratospheric/uogw-tornado-trends
- Editor: Aerostratospheric, https://www.midwestsds.com/
- Dataset citado en la model card: `aerostratospheric/uogw` (referencia indicada como dataset:aerostratospheric/uogw)
- Fuente de datos primaria: NOAA/SPC Severe Weather Database (CSV de tornados), citada en la model card sin URL explícita
- Productos UOGW `pre-tornado-clark`, citados en la model card sin URL explícita
- Archivo de métricas referenciado: `metrics.json` dentro del repositorio (contenido no disponible)
- Búsqueda web: ninguno de los resultados recuperados guarda relación con este modelo ni con climatología de tornados, por lo que no se incluye ningún enlace adicional de esa búsqueda.
