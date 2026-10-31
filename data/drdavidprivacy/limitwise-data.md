# drdavidprivacy/limitwise-data

## Resumen

LimitWise v2 es un modelo de regresión logística de clasificación tabular desarrollado por el usuario de HuggingFace drdavidprivacy en el marco del AI Governance Practicum (Track 1). El modelo simula el sistema de alerta temprana de la entidad ficticia "Corvana Bank" y predice la probabilidad de impago de pago en el siguiente ciclo de extracto de tarjetas de crédito. No es un modelo de lenguaje ni un modelo fundacional: se trata de un artefacto educativo de gobernanza de IA, con una model card ejemplar que documenta lineage, mitigación de sesgos, calibración y controles de uso.

Su relevancia no reside en el rendimiento predictivo, sino en el proceso: v2 incorpora el CorrelationRemover de Fairlearn para eliminar la influencia de sexo, edad, estado civil y educación, además de una recalibración isótona verificada. Está firmado como "versión recomendada" frente a v1 (que usaba 27 entradas codificadas en 98 columnas, frente a las 93 columnas de v2 tras eliminar los campos demográficos). El repositorio incluye los pesos serializados en formato pickle, una recalibración alternativa, una tabla legible de pesos e intercepto, y la model card en PDF.

Es un ejemplo de referencia para equipos de gobernanza, auditoría y cumplimiento que necesiten ver cómo se documenta un modelo de riesgo crediticio con controles de equidad y calibración. El autor advierte expresamente que la organización, el sistema y las personas son ficticios, que los datos son públicos y que el uso es exclusivamente educativo, no para decisiones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (clasificacion tabular binaria) |
| Parametros totales | 93 coeficientes mas intercepto (no disponible el peso exacto en bytes de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pickle serializado de scikit-learn (.pkl), mas CSV de pesos legible |

## Arquitectura y entrenamiento

El modelo es una regresion logistica con regularizacion L2 (C = 0.1), pesos de clase balanceados y entradas escaladas. El pipeline completo que produccion debe reproducir incluye: relleno de la variable ratio de pago con la mediana de entrenamiento para las 3.175 cuentas sin saldo previo, un CorrelationRemover de Fairlearn ajustado sobre las filas de entrenamiento contra sexo, edad, estado civil y educacion (que elimina de cada variable el componente correlacionado con esos cuatro campos y despues los descarta), un escalador y una recalibracion isotonica ajustada sobre las predicciones cross-validadas de las filas de entrenamiento.

El modelo se entreno sobre el fichero de trabajo "remediado" del dataset drdavidprivacy/limitwise-data, que enlaza a su vez con el pack del caso en drdavidprivacy/practicum-case-packs. La version v2 usa 93 columnas tras eliminar los cuatro campos demograficos, frente a las 98 columnas de v1 sobre 27 entradas. El serializado depende por diseño de scikit-learn 1.9.1 y fairlearn 0.15.0: no carga sobre otras versiones de scikit-learn. No hay informacion sobre numero de tokens, RLHF ni otras tecnicas de entrenamiento moderno, por tratarse de un modelo clasico de ML tabular.

## Capacidades

- Clasificacion binaria tabular: estimacion del riesgo de impago de pago en el siguiente ciclo de extracto para cuentas de tarjeta abiertas.
- Ranking por ciclo: ordena las cuentas abiertas por probabilidad de impago para priorizar la atencion humana.
- Salidas calibradas: la recalibracion isotonica permite interpretar el score como probabilidad, siempre que la verificacion de calibracion pase sobre la version firmada.
- Equidad por diseño: el CorrelationRemover impide que el modelo vea directamente sexo, edad, estado civil y educacion, y elimina su correlacion del resto de variables.
- Interpretabilidad: el repositorio publica cada columna ajustada con su peso y el intercepto en un CSV legible por personas.
- No soporta: generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes. No aplica.

## Casos de uso

- Formacion en gobernanza de IA: sirve como caso resuelto (answer key de la semana 6) para que estudiantes de practicum documenten su propia model card y comparen con el ejemplar de Tom Becker.
- Referencia de model card para riesgo crediticio: los equipos de riesgo pueden usar la estructura de 15 secciones (uso previsto, factores, mitigacion, calibracion, hashes de integridad) como plantilla para sus propios modelos de scoring.
- Ensenanza de mitigacion de sesgos: ilustra de forma concreta como aplicar CorrelationRemover de Fairlearn y eliminar campos demograficos antes del ajuste.
- Ensenanza de calibracion de probabilidades: muestra como una recalibracion isotonica sobre predicciones cross-validadas permite que un score se interprete como probabilidad.
- Auditoria y trazabilidad: los hashes SHA-256 de cada artefacto y la dependencia deliberada de versiones exactas de scikit-learn ejemplifican controles de integridad y reproducibilidad.
- Demo interactiva: el Space drdavidprivacy/limitwise permite explorar el comportamiento del modelo sin despliegue propio.
- Simulacion de gates de despliegue: documenta como un comite de gobernanza (Chief AI Officer) condiciona el uso productivo al paso de verificaciones de calibracion, cobertura de razones y listas de vigilancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona verificaciones internas (check de calibracion, check de cobertura de razones, comparacion v1 frente a v2 en el notebook de evaluacion, secciones 1 a 15), pero no incluye metricas numericas (AUC, Brier, accuracy, etc.) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo completo pesa 18.636 bytes (limitwise_v2.pkl) y 89.015 bytes recalibrado, ejecutable en CPU sin GPU.
- GPU recomendadas: no aplica, no se requiere GPU.
- Consumer GPU: no aplica; cualquier portatil o servidor basico con Python es suficiente.
- Dependencias criticas: scikit-learn 1.9.1 y fairlearn 0.15.0 exactos; el serializado no carga sobre otras versiones de scikit-learn, por diseño.
- Despliegue: servido mediante el Space de HuggingFace drdavidprivacy/limitwise; tambien puede cargarse localmente con pickle/joblib tras instalar las versiones fijadas. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponible; por el tamano del modelo, la inferencia por fila es de orden de microsegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Aspecto | LimitWise v2 | LimitWise v1 | Modelos LLM de riesgo crediticio generico |
|---|---|---|---|
| Tipo | Regresion logistica tabular | Regresion logistica tabular | No disponible |
| Entradas | 93 columnas (sin campos demograficos) | 98 columnas (27 entradas, con demografia) | No disponible |
| Mitigacion de sesgo | CorrelationRemover + eliminacion de 4 campos | No disponible en la informacion proporcionada | No disponible |
| Calibracion | Isotonica sobre predicciones cross-validadas | No disponible en la informacion proporcionada | No disponible |
| Tamano del artefacto | 18.636 bytes | 6.432 bytes | No disponible |
| Licencia | CC-BY-4.0 | CC-BY-4.0 (mismo repositorio) | No disponible |

No existen alternativas directamente comparables publicadas en la informacion proporcionada; el termino de comparacion natural es v1, documentado en el mismo notebook de evaluacion.

## Limitaciones y advertencias

- Uso exclusivamente educativo: la organizacion, el sistema y las personas son ficticios. El autor prohibe explicitamente su uso para decisiones reales.
- Fuera de alcance: el modelo no puede usarse hoy para contactar a titulares ni modificar lineas de credito; el gate de uso productivo permanece cerrado hasta que pasen las verificaciones de calibracion, cobertura de razones y la lista de vigilancia de la semana 2.
- Un score no es una probabilidad de impago del titular salvo que la verificacion de calibracion pase sobre la version firmada.
- Dependencia estricta de versiones: el serializado no carga con otra version de scikit-learn distinta de 1.9.1, lo que dificulta su uso en entornos con librerias actualizadas.
- Sesgos residuales: aunque se eliminan sexo, edad, estado civil y educacion y se aplica CorrelationRemover, el modelo usa variables correlacionadas con demografia (historial de pagos, ratios de saldo), por lo que puede persistir impacto dispar indirecto; no hay auditorias de equidad cuantificadas en la informacion proporcionada.
- Riesgo de alucinacion: no aplica (no es un modelo generativo).
- Idioma y contexto: no aplica.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero la propia model card restringe el uso a fines educativos, lo que prevalece como condicion de uso del artefacto.
- Descargas y likes en cero en el momento de la ficha: sin comunidad de validacion externa.

## Enlaces

- Modelo: https://huggingface.co/drdavidprivacy/limitwise-data
- Dataset de entrenamiento: https://huggingface.co/datasets/drdavidprivacy/limitwise-data
- Pack del caso: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- Space de demostracion: https://huggingface.co/spaces/drdavidprivacy/limitwise
