# drdavidprivacy/reachfirst-model

## Resumen

ReachFirst v1 es un modelo de clasificación tabular basado en regresión logística, desarrollado por el usuario drdavidprivacy como artefacto didáctico del AI Governance Practicum (Track 1). No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de scikit-learn (versión 1.9.1, fijada de forma intencionada) que ordena listas de contacto de un programa ficticio de servicios sociales, Crosswind Workforce Partnership, para que el equipo de divulgación priorice a los hogares con mayor probabilidad de estar en o por debajo del umbral de renta atendido.

El modelo se entrenó sobre un fichero de trabajo remediado del dataset público drdavidprivacy/reachfirst-data y consta de 10 variables de entrada codificadas en 58 columnas tras one-hot encoding, con regularización C = 0.1, escalado de entradas y sin pesos de clase. Existe una variante v2 que aplica CorrelationRemover de Fairlearn contra sexo, raza y país de origen, eliminando de cada variable la parte que correlaciona con esos tres atributos protegidos.

Su relevancia es principalmente metodológica: ilustra el ciclo completo de gobernanza de IA (evaluación de equidad, punto operativo, model card, control de acceso) sobre un caso realista de sector público. El autor advierte explícitamente que la organización, el sistema y las personas son ficticios y que el uso es exclusivamente educativo, no para decisiones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (scikit-learn), pipeline con one-hot encoding, imputacion por mediana y escalado |
| Parametros totales | No disponible (coeficientes de regresion; fichero de pesos de 4.300 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (no aplica a modelos sklearn; serializacion en pickle) |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pickle (reachfirst_v1.pkl); tabla CSV legible de coeficientes (reachfirst_v1_Inside.csv) |

## Arquitectura y entrenamiento

El modelo es una regresion logistica con regularizacion L2 (C = 0.1), sin pesos de clase, sobre entradas escaladas. Las 10 variables originales se codifican como 58 columnas mediante one-hot encoding con niveles fijados sobre las filas de entrenamiento; los huecos numericos se rellenan con la mediana (el fichero no presenta ninguno). Produccion debe reproducir exactamente esos pasos ajustados, ademas del escalador y, en la variante v2, el CorrelationRemover ajustado sobre las filas de entrenamiento.

La innovacion tecnica del artefacto no esta en el algoritmo sino en el control de linaje y mitigacion: v2 aplica CorrelationRemover de Fairlearn 0.15.0 contra sexo, raza y pais de origen (24 columnas codificadas de 82), eliminando de las demas entradas la parte que se mueve con esos tres atributos y descartandolos despues. Ninguna de las dos versiones usa esos tres campos como entrada. El modelo esta disenado para no cargar en una version distinta de scikit-learn, lo que fuerza la reproducibilidad del entorno.

## Capacidades

- Clasificacion tabular binaria: estima la probabilidad de que un hogar este en o por debajo del umbral de renta del programa.
- Ordenacion de listas de contacto (ranking por score), no aplicacion de umbrales de corte.
- Interpretabilidad directa: coeficientes por columna e intercepto exportados a CSV legible.
- Mitigacion de sesgo mediante CorrelationRemover (variante v2) sobre atributos protegidos.
- Integracion con el ecosistema scikit-learn y Fairlearn para evaluacion de equidad.
- Servicio via Hugging Face Space (drdavidprivacy/reachfirst).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Priorizacion de listas de divulgacion en programas sociales: el modelo ordena a los hogares por probabilidad de estar bajo el umbral de renta, de modo que un equipo con capacidad para alcanzar en torno al 20 por ciento del universo por ciclo contacte primero a los casos mas probables, sustituyendo el boca a boca y las visitas espontaneas.
- Docencia de gobernanza de IA: sirve como answer key del Week 6 Model Card del practicum, permitiendo a estudiantes comparar su propia model card con un ejemplar completo (secciones 1 a 15, hashes, linaje y punto operativo).
- Auditoria de equidad reproducible: la variante v2 con CorrelationRemover permite demostrar en clase como se mide y mitiga la correlacion de las entradas con atributos protegidos, usando Fairlearn 0.15.0 sobre las mismas 58 columnas.
- Verificacion de integridad de artefactos: los hashes SHA-256 publicados (v1 y v2) permiten validar que el binario desplegado es exactamente el evaluado, un control habitual en pipelines de cumplimiento.
- Diseno de experimentos controlados de despliegue: el caso documenta un primer ciclo medido en el que la mitad de la capacidad se trabaja con la lista y la otra mitad con la practica actual, util como plantilla de evaluacion antes de escalar.
- Prototipado de sistemas de decision asistida en sector publico: el modelo ilustra la postura de "ordenacion de prioridad, no corte", manteniendo a todos los hogares en la lista y dejando el juicio final al equipo de coaches.
- Formacion en gestion de riesgos: el gate de uso cerrado hasta completar las comprobaciones de watch-list y la traduccion de criterios a lenguaje llano sirven como ejemplo de controles previos a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos v1 ocupa 4.300 bytes y v2 18.322 bytes, por lo que la inferencia es practicamente instantanea en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portatiles, contenedores ligeros, funciones serverless).
- Opciones de despliegue: pickle cargado con scikit-learn 1.9.1 (version fijada obligatoriamente), servicio via Hugging Face Space, o envoltorio propio (por ejemplo, una API FastAPI que cargue el pipeline).
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del modelo (regresion logistica sobre 58 columnas) se espera latencia de microsegundos a milisegundos por fila en CPU, sin datos medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ReachFirst v1 | Regresion logistica (sklearn) | Coeficientes sobre 58 columnas | No aplica | CC-BY-4.0 | Artefacto educativo con model card y mitigacion Fairlearn |
| ReachFirst v2 | Regresion logistica + CorrelationRemover | Coeficientes sobre 58 columnas | No aplica | CC-BY-4.0 | Misma receta con remocion de correlacion con atributos protegidos |
| Alternativas comerciales de scoring social | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion facilitada.

## Limitaciones y advertencias

- Uso exclusivamente educativo: la organizacion, el sistema y las personas son ficticios; el autor prohibe explicitamente su uso para decisiones reales.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero el score puede inducir falsa precision: el modelo ordena probabilidades, no determina elegibilidad ni concede beneficios.
- Sesgos conocidos: las entradas pueden correlacionar con sexo, raza y pais de origen; v1 no aplica mitigacion, y solo v2 incorpora CorrelationRemover. La equidad debe evaluarse con Fairlearn antes de cualquier uso.
- Dependencia estricta de version: el modelo no carga en una version de scikit-learn distinta de la 1.9.1, lo que limita la portabilidad y exige fijar el entorno.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion, pero la model card restringe el uso a fines educativos, lo que prevalece como advertencia del autor.
- Limitaciones de contexto e idioma: al ser un modelo tabular no maneja texto ni multiples idiomas; los idiomas soportados figuran como no disponibles.
- Caveat de produccion: el gate de uso esta cerrado hasta que se ejecuten y cierren por escrito las comprobaciones de watch-list y los criterios se traduzcan a lenguaje llano con participacion del consejo; no existe aun ciclo medido en produccion.
- El punto operativo depende de la capacidad del Director de Outreach (aproximadamente el 20 por ciento del universo por ciclo), no de un umbral fijo del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drdavidprivacy/reachfirst-model
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/reachfirst-data
- Case packs del practicum: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de servicio: https://huggingface.co/spaces/drdavidprivacy/reachfirst
