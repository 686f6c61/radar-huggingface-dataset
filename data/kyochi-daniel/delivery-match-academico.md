# kyochi-daniel/delivery-match-academico

## Resumen

Delivery Match — recomendação acadêmica de refeições es un modelo de clasificación tabular publicado por Daniel Kyochi en Hugging Face. No es un modelo de lenguaje: es un clasificador de regresión logística entrenado con scikit-learn que ordena platos de un catálogo de reparto de comida según la probabilidad de que un cliente los compre en una sesión concreta. El objetivo declarado es puramente educativo y de demostración metodológica: ilustrar el ciclo completo de generación de datos sintéticos, ingeniería de atributos sin fuga de información, entrenamiento, evaluación frente a baselines y exportación a un formato abierto que se ejecuta en el navegador sin backend.

El modelo aprende un score por combinación de perfil de cliente, plato y contexto (horario y presupuesto) a partir de nueve señales históricas: frecuencia de pedidos en la categoría, valoración previa del cliente sobre platos de esa categoría, media de valoraciones del restaurante, proximidad del precio al gasto habitual, compatibilidad categoría-horario, participación de la categoría en clics y visualizaciones previas, popularidad previa del plato e historial de compras en el restaurante. Todos los atributos se calculan estrictamente antes del resultado de la sesión evaluada.

El conjunto de datos es enteramente ficticio: 100 clientes, 12 restaurantes, 60 platos y 3.000 sesiones sintéticas generadas por código, con semilla fija 42. El autor insiste en que los resultados miden el simulador, no consumidores reales, y que no existe evidencia de mejora de ventas ni de adecuación para producción. La relevancia del artefacto es, por tanto, didáctica y reproducible, no operativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística (scikit-learn) con `StandardScaler` sobre 9 atributos tabulares |
| Parámetros totales | 9 coeficientes más intercepto y parámetros de normalización (no disponible el recuento exacto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantización | No disponible (exportación en JSON con coeficientes en coma flotante) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | MIT |
| Formato de pesos | JSON (`model.json`), sin pickle |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal de regresión logística precedido de un escalado estándar (`StandardScaler`). La entrada es un vector de nueve atributos numéricos derivados del historial del cliente y del contexto de la sesión; la salida es un score que se usa para ordenar los platos que caben en el presupuesto indicado. No hay capas ocultas, atención ni componentes neuronales: la decisión de usar un modelo lineal pequeño responde a la voluntad explícita de permitir entrenamiento en CPU y publicación de una demo estática sin API de pago.

El entrenamiento usa las primeras 2.100 sesiones sintéticas; la selección del hiperparámetro `C` (entre 0,1, 1 y 10) se hace exclusivamente con 450 sesiones de validación, y las últimas 450 sesiones se reservan para test. La semilla es fija (42). Los pesos permanecen congelados durante la evaluación, pero el historial de atributos se actualiza tras cada sesión, replicando el comportamiento de un sistema real que solo observa compras ya concluidas. El generador de datos produce preferencias latentes que determinan los resultados, pero esas preferencias no entran como atributos del modelo, lo que evita fuga directa de la etiqueta.

## Capacidades

- Ordenación de platos por probabilidad de compra estimada, restringida al subconjunto que respeta el presupuesto de la sesión.
- Clasificación tabular binaria por par (perfil, plato, contexto) mediante score logístico.
- Cálculo de atributos históricos sin consultar el futuro de la sesión evaluada (diseño anti-leakage).
- Inferencia en el navegador a partir del JSON exportado, sin backend ni clave de API.
- Ejecución por línea de comandos mediante `infer.py` con perfil, contexto y presupuesto como argumentos.
- Reproducibilidad completa: `train.py` regenera datos sintéticos, entrena y exporta artefactos.
- Verificación numérica de paridad entre la implementación Python y la implementación JavaScript de la demo (`verification.json`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Docencia de sistemas de recomendación: el repositorio sirve como ejemplo completo y ejecutable de extremo a extremo (generación de datos, features, entrenamiento, evaluación y despliegue) para asignaturas de machine learning, con la ventaja de que todo el pipeline corre en CPU.
- Estudio de fuga de información temporal: el diseño de atributos calculados solo con historial previo y la actualización del historial sesión a sesión permiten usar el proyecto como caso práctico de evaluación cronológica correcta frente a particiones aleatorias.
- Prototipado de ranking con presupuesto: la función de filtrado por presupuesto y el orden por score sirven de plantilla para experimentar con ranking restringido antes de invertir en modelos más complejos.
- Comparación de baselines: las métricas frente a popularidad del entrenamiento y orden aleatorio ofrecen un punto de partida cuantificado para evaluar si un modelo posterior (matriz de factorización, gradient boosting) aporta mejora real.
- Demo educativa sin infraestructura: la página estática con inferencia en JavaScript permite mostrar un recomendador funcional en un aula o taller sin servidores, credenciales ni costes de API.
- Referencia de exportación segura de modelos: el uso de JSON con coeficientes explícitos en lugar de pickle es un patrón reutilizable para publicar modelos pequeños evitando riesgos de deserialización arbitraria.
- Prueba de concepto de privacidad: el documento `PRIVACIDAD.md` y el uso exclusivo de datos ficticios sirven de base para discutir límites de privacidad antes de plantear un sistema con datos reales.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las 450 sesiones de test, evaluando cada sesión contra todos los platos dentro de su presupuesto (media de 48,24 candidatos, sin muestreo de negativos):

| Método | Recall@5 | NDCG@5 | Cobertura del catálogo@5 |
|---|---:|---:|---:|
| Modelo entrenado | 0,5733 | 0,3615 | 0,8333 |
| Popularidad del entrenamiento | 0,1978 | 0,1253 | 0,1500 |
| Aleatorio | 0,1422 | 0,0902 | 1,0000 |

Recorte de inicio de uso (24 sesiones con menos de tres compras previas): Recall@5 de 0,2917 para el modelo frente a 0,2083 para popularidad. El autor advierte que la muestra es demasiado pequeña para extraer conclusiones robustas. También señala que el baseline de popularidad queda fijo en el entrenamiento mientras los atributos históricos del modelo se actualizan, diferencia que debe tenerse en cuenta al comparar. El `model-index` de la model card no declara resultados adicionales.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo es un conjunto de coeficientes y parámetros de normalización evaluados en CPU.
- GPU recomendadas: ninguna. El entrenamiento completo (generación de datos, ajuste y evaluación) se ejecuta en CPU.
- Compatibilidad con GPU de consumo: irrelevante, no hay cómputo acelerado implicado.
- Despliegue: Python 3.9 o superior con scikit-learn para entrenamiento e inferencia por CLI; navegador con JavaScript para la demo estática servida con `python -m http.server`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (producto escalar de 9 dimensiones) el coste por inferencia es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| delivery-match-academico | Regresión logística tabular | 9 coeficientes | No aplica | MIT | Hugging Face, JSON |
| Baselines del propio estudio (popularidad, aleatorio) | Heurísticas de ranking | 0 | No aplica | No aplica | Incluidos en el repositorio |
| Modelos de recomendación neuronal (p. ej. factorización o two-tower) | Redes neuronales | Millones | No aplica | Variable | Requieren framework y GPU para entrenamiento |

No se dispone de comparaciones publicadas con alternativas externas de la misma categoría en la información proporcionada. La comparación relevante que aporta el autor es interna, frente a popularidad y orden aleatorio, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Los resultados miden el simulador, no consumidores reales; no hay evidencia de aumento de ventas, satisfacción ni adecuación para producción.
- Un único generador y una única semilla: las relaciones simuladas favorecen el aprendizaje y no representan la complejidad de datos reales.
- Cada sesión sintética termina con exactamente una compra, simplificación importante respecto a escenarios reales con abandono.
- El baseline de popularidad permanece fijo en el entrenamiento mientras los atributos del modelo se actualizan, lo que puede inflar la ventaja observada.
- El recorte de inicio de uso se apoya en 24 sesiones, muestra insuficiente para conclusiones robustas.
- El modelo solo maneja portugués en la interfaz y la documentación, y está diseñado para un catálogo de 60 platos y 100 clientes ficticios; no se ha validado a otras escalas.
- Riesgo de alucinación no aplica (no genera texto), pero el score puede ordenar de forma arbitraria perfiles fuera de la distribución sintética.
- Licencia MIT: permite uso comercial del código y los pesos, pero el autor no ofrece garantías ni soporte, y el uso con datos reales exigiría revisión de privacidad conforme a `PRIVACIDAD.md`.
- El Hub no ofrece API de inferencia automática para este modelo; el despliegue requiere ejecutar el código o servir la demo estática.
- No usar como sistema de recomendación en producción sin reentrenamiento con datos reales, validación temporal y evaluación de sesgos del catálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyochi-daniel/delivery-match-academico
- Demo interactiva (Space): https://huggingface.co/spaces/kyochi-daniel/delivery-match-demo
