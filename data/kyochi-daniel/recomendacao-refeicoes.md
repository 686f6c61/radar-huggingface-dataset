# kyochi-daniel/recomendacao-refeicoes

## Resumen

`kyochi-daniel/recomendacao-refeicoes` es un modelo de recomendación de platos de comida desarrollado por Daniel Kyochi como experimento educativo. No es un modelo de lenguaje: se trata de un clasificador tabular de regresión logística implementado con scikit-learn que aprende una puntuación por combinación de perfil de cliente, plato y contexto (horario, presupuesto) para ordenar las opciones disponibles. El repositorio es deliberadamente pequeño (0,0 GB) y el modelo se exporta a un JSON abierto sin uso de pickle.

El modelo se entrena exclusivamente con datos sintéticos generados por código: 100 clientes, 12 restaurantes, 60 platos y 3.000 sesiones ficticias, cada una terminada en exactamente una compra. Recibe nueve señales de comportamiento histórico (frecuencia de pedidos por categoría, valoraciones previas, distancia del precio al gasto habitual, compatibilidad categoría-horario, clics y visualizaciones, popularidad del plato, historial en el restaurante) calculadas siempre antes del resultado de la sesión actual para evitar fuga de información.

Su relevancia es metodológica, no de producto: demuestra un pipeline completo de generación de datos, ingeniería de atributos sin mirar al futuro, entrenamiento en CPU, comparación con baselines de popularidad y aleatorio, exportación verificable y demo estática en el navegador. No existe evidencia de rendimiento con consumidores reales y el propio autor lo advierte explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística con `StandardScaler` (scikit-learn), clasificación tabular |
| Parametros totales | No disponible (coeficientes e intercepto exportados en `model.json`; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de nueve atributos, no secuencial) |
| Tipos de cuantizacion | No disponible (no se publican pesos en FP16/INT8; exportación a JSON de coeficientes) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | MIT |
| Formato de pesos | JSON abierto (`model.json`), sin pickle |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de aprendizaje supervisado tabular: `StandardScaler` seguido de `LogisticRegression`. El modelo recibe nueve atributos por par (perfil, plato, contexto) y produce una puntuación que ordena los candidatos que caben en el presupuesto de la sesión. Todos los atributos se calculan con información estrictamente anterior a la sesión evaluada, y el histórico se actualiza tras cada compra concluida, replicando el comportamiento de un sistema en producción que solo observa resultados ya cerrados.

El entrenamiento usa las primeras 2.100 sesiones; la selección del hiperparámetro `C` (entre 0,1, 1 y 10) se hace solo con 450 sesiones de validación, y las últimas 450 quedan para test. La semilla es fija (42). Los pesos permanecen congelados durante la evaluación. La evaluación se hace contra todos los platos dentro del presupuesto de cada sesión (media de 48,24 candidatos en test), sin muestreo de negativos. No hay RLHF, DPO ni ajuste por preferencias humanas: es un modelo supervisado sobre un simulador.

## Capacidades

- Ordenación de platos por perfil de cliente, contexto (horario) y presupuesto, devolviendo un top-k.
- Clasificación tabular binaria por par perfil-plato-contexto (compra o no compra).
- Incorporación de señales de comportamiento histórico: frecuencia por categoría, valoraciones previas, popularidad del plato e historial en el restaurante.
- Filtrado por presupuesto: la demo descarta platos fuera de rango sin reentrenar ni modificar el histórico del perfil.
- Inferencia en el navegador mediante la demo estática (HTML/CSS/JavaScript) que carga `model.json`, sin backend ni API de pago.
- Ejecución en CPU sin GPU ni claves de API; entrenamiento reproducible con `train.py`.
- Verificación numérica de la exportación mediante hashes y error de paridad en `verification.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre.

## Casos de uso

- Prototipo educativo de sistema de recomendación: sirve para enseñar el ciclo completo (generación de datos, atributos sin fuga temporal, entrenamiento, validación, test y exportación) en un curso o taller, porque todo el pipeline corre en CPU y el código fuente está incluido en `source.zip`.
- Recomendación de menú en una demo web estática: la demo carga `model.json` en el navegador y ordena platos según perfil, horario y presupuesto, útil para mostrar el comportamiento de un recomendador sin infraestructura de backend.
- Evaluación de técnicas de ingeniería de atributos: el repositorio permite reproducir la comparación entre señales históricas actualizadas y un baseline de popularidad fijo, y medir el impacto de cada atributo sobre Recall@5 y NDCG@5.
- Base para un sistema de recomendación en un delivery real: el diseño de atributos (frecuencia por categoría, valoración previa, distancia de precio al gasto habitual) es directamente trasladable a un dataset de pedidos reales, sustituyendo el generador sintético por datos de producción.
- Filtrado por presupuesto en aplicaciones de food-tech: el modelo ordena candidatos dentro de un rango de gasto, patrón reutilizable en asistentes de compra o planificadores de menús semanales con restricción económica.
- Referencia de exportación verificable: el par `model.json` + `verification.json` con hashes y error de paridad sirve como plantilla para publicar modelos pequeños sin pickle y con comprobación numérica de la exportación.
- Análisis de arranque en frío: el propio autor reporta un recorte con 24 sesiones de menos de tres compras previas (Recall@5 de 0,2917 frente a 0,2083 del baseline), útil como caso de estudio de rendimiento con histórico escaso, aunque la muestra es insuficiente para conclusiones robustas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test (450 sesiones), evaluados contra todos los platos dentro del presupuesto de cada sesión:

| Método | Recall@5 | NDCG@5 | Cobertura del catálogo@5 |
|---|---:|---:|---:|
| Modelo entrenado | 0,5733 | 0,3615 | 0,8333 |
| Popularidad del entrenamiento | 0,1978 | 0,1253 | 0,1500 |
| Aleatorio | 0,1422 | 0,0902 | 1,0000 |

Recorte de inicio de uso (24 sesiones con menos de tres compras previas): Recall@5 de 0,2917 para el modelo frente a 0,2083 para popularidad. El autor señala que la muestra es pequeña e insuficiente para conclusiones robustas. También advierte que el baseline de popularidad queda fijo en el entrenamiento mientras los atributos históricos del modelo se actualizan, diferencia que debe tenerse en cuenta al comparar. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo son coeficientes de regresión logística exportados a JSON; no requiere GPU ni VRAM dedicada.
- Entrenamiento en CPU: `train.py` regenera los datos sintéticos y reentrena el pipeline completo sin GPU.
- GPU recomendadas: no aplica; el autor no reporta uso de GPU ni requisitos de VRAM.
- Cabe en cualquier equipo consumer: Python 3.9+ y Node.js opcional para la verificación del JavaScript.
- Despliegue: ejecución local con `python infer.py --profile ... --context ... --budget ...` o servidor estático con `python -m http.server 3184 --bind 127.0.0.1 --directory space`.
- No se publican latencias ni throughput; el Hub no ofrece API de inferencia automática para este modelo customizado y la demo carga el JSON en el navegador.
- Almacenamiento: repositorio de 0,0 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `kyochi-daniel/recomendacao-refeicoes` | Regresión logística tabular (scikit-learn) | No disponible | No aplica | Recall@5 0,5733 en test sintético | MIT | Hugging Face + demo estática |
| Filtrado colaborativo clásico (p. ej. ALS, SVD) | Factorización matricial | No disponible | No aplica | No disponible | Variable según implementación | Amplia (Surprise, implicit, etc.) |
| Baseline de popularidad | Ordenación por frecuencia | 0 | No aplica | Recall@5 0,1978 en el mismo test | No aplica | Trivial de implementar |
| Recomendadores neuronales ligeros (p. ej. NCF, LightGCN) | Red neuronal sobre grafos o embeddings | Variable | No aplica | No disponible | Variable | Repositorios académicos |

La comparación directa con alternativas no está disponible en la información proporcionada: el autor solo compara contra popularidad y aleatorio, y no se han publicado resultados frente a otros recomendadores.

## Limitaciones y advertencias

- Los resultados miden el simulador, no consumidores reales: no hay evidencia de aumento de ventas, satisfacción ni adecuación para producción.
- Un único generador y una única semilla: las relaciones simuladas favorecen el aprendizaje de las señales incluidas, lo que puede inflar el rendimiento frente a datos reales.
- Cada sesión termina con exactamente una compra, una simplificación importante respecto al comportamiento real (abandono, múltiples compras, devoluciones).
- El baseline de popularidad queda fijo en el entrenamiento mientras los atributos históricos del modelo se actualizan; la comparación no es totalmente simétrica.
- El recorte de arranque en frío cuenta con solo 24 sesiones, insuficiente para conclusiones robustas.
- Sesgos conocidos: no documentados por el autor; al usar datos sintéticos, los sesgos del generador se trasladan al modelo.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede ordenar platos sin justificación causal verificable fuera del simulador.
- Limitaciones de contexto e idioma: entrada tabular de nueve atributos, sin capacidad multilingüe; el modelo y la documentación están en portugués.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantías ni soporte y el modelo no se ha validado con datos reales.
- El Hub no ofrece API de inferencia automática para este modelo customizado; el despliegue requiere cargar el JSON manualmente.
- La demo filtra por presupuesto sin reentrenar ni modificar el histórico del perfil, por lo que el comportamiento en la interfaz no refleja un sistema adaptativo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyochi-daniel/recomendacao-refeicoes
- Demo interactiva (Hugging Face Spaces): https://huggingface.co/spaces/kyochi-daniel/recomendacao-refeicoes-demo
