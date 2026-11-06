# bernardozschaber/titanic-federated-dp-mlp

## Resumen

`bernardozschaber/titanic-federated-dp-mlp` es un modelo educativo de clasificación tabular binaria que predice la supervivencia de pasajeros del Titanic. Lo desarrolla bernardozschaber como demostración del coste que impone la privacidad diferencial (DP) en un entrenamiento federado con datos no-IID. No es un modelo orientado a maximizar métricas, sino a cuantificar de forma reproducible la pérdida de precisión al introducir ruido calibrado sobre un agregador federado.

Técnicamente es un perceptrón multicapa (MLP) de tres capas con arquitectura 12-32-16-2, implementado en PyTorch, que suma 986 parámetros según la model card (978 según los pesos publicados en safetensors). El entrenamiento se simula con Flower usando `FedAvg` sobre 10 clientes virtuales y partición Dirichlet por etiqueta con α=0,5, aplicando recorte y ruido gaussiano en el servidor mediante `DifferentialPrivacyServerSideFixedClipping`.

Su relevancia es fundamentalmente didáctica: ofrece un caso mínimo, con código abierto y semillas fijadas, para estudiar el compromiso entre utilidad y garantía formal de privacidad. El modelo no está pensado para producción ni para decisiones sobre personas, y el propio autor lo restringe a uso educacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 12-32-16-2 en PyTorch |
| Parametros totales | 986 según model card; 978 según safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular fija) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | tabular-classification |
| Entrada requerida | PassengerId, Pclass, Name, Sex, Age, SibSp, Parch, Fare, Embarked |
| Salida | clasificación binaria (supervivencia) |

## Arquitectura y entrenamiento

El modelo es un MLP denso de tres capas (12 entradas, 32 y 16 unidades ocultas, 2 salidas) entrenado con SGD (lr=0,01, momentum=0,9), lotes de 16 y 2 épocas locales por ronda. La federación se simula con Flower: 10 clientes participan en las 20 rondas y se agregan con `FedAvg`. La partición de datos sigue una distribución Dirichlet por etiqueta con α=0,5, lo que introduce heterogeneidad no-IID entre clientes.

La privacidad diferencial se aplica en el servidor con `DifferentialPrivacyServerSideFixedClipping` (clip=1,0, z=1,0), lo que produce una garantía de ε≈23,6 por cliente con δ=10⁻² bajo el límite zCDP. El preprocesamiento (medianas e imputación, estandarización) se calcula de forma centralizada y queda fuera de la garantía formal. No hay RLHF, DPO ni técnicas de alineación; el entrenamiento es supervisado clásico sobre un dataset público de 1912.

## Capacidades

- Clasificación binaria tabular: predice supervivencia a partir de nueve campos del dataset del Titanic.
- Ingeniería de características implícita: usa `Name` (título extraído), `Sex`, `Pclass`, `Age`, `SibSp`, `Parch`, `Fare` y `Embarked`.
- Inferencia por lotes mediante script (`inference.py entrada.csv salida.csv`).
- Entrenamiento federado reproducible con Flower y DP del lado del servidor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá de la etiqueta `pt` del repo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia sobre privacidad diferencial: sirve para mostrar, con números concretos, cómo ε pasa de ∞ (sin ruido, 0,808 de accuracy) a 23,6 (0,730) y a 9,3 (0,683), evidenciando el coste de la garantía.
- Experimentos de aprendizaje federado no-IID: la partición Dirichlet α=0,5 permite reproducir el efecto de clientes heterogéneos sobre `FedAvg` en un entorno de bajo coste computacional.
- Comparación de mecanismos DP: el recorte fijo en servidor con z variable (0,5, 1,0, 2,0) ofrece una curva de referencia para calibrar ruido en otros proyectos.
- Pruebas de integración con Flower: el notebook de Kaggle y el repo de tutorial permiten validar pipelines federados completos sin infraestructura real.
- Ejercicios de evaluación estadística: con solo 179 ejemplos de test, el modelo ilustra la varianza entre semillas (0,730 ± 0,036 frente al 0,760 de la semilla 42) y la necesidad de reportar medias.
- Referencia negativa en análisis de utilidad: sirve para argumentar por qué en datasets pequeños la DP puede degradar el rendimiento por debajo de una regla trivial basada en sexo (0,777).

## Benchmarks y rendimiento

Resultados sobre 179 pasajeros reservados del `train.csv`, media y desviación de 5 semillas:

| Modelo | Accuracy | ε |
|---|---|---|
| Clase mayoritaria | 0,615 | — |
| Regla: solo sexo | 0,777 | — |
| MLP centralizada | 0,810 ± 0,013 | — |
| Federada, sin ruido | 0,808 ± 0,003 | ∞ |
| Federada, z=0,5 | 0,771 ± 0,014 | 67,1 |
| Federada, z=1,0 (familia de este modelo) | 0,730 ± 0,036 | 23,6 |
| Federada, z=2,0 | 0,683 ± 0,042 | 9,3 |

El checkpoint publicado corresponde a la semilla 42, fijada antes de evaluar, y obtuvo 0,760. El autor recomienda usar la media como estimación por la alta varianza con solo 179 ejemplos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo tiene 978-986 parámetros y el repo ocupa 0,0 GB.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3050, GTX 1650, integradas) y en entornos sin GPU.
- Despliegue: PyTorch nativo con `safetensors`; no requiere vLLM, TGI ni llama.cpp, que no aplican a un MLP tabular.
- Latencia y throughput: no disponibles de forma publicada; por el tamaño, la inferencia es prácticamente instantánea en CPU para lotes pequeños.
- Dependencias de ejecución: `torch`, `safetensors`, `pandas`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (Titanic) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| titanic-federated-dp-mlp | 978-986 | no aplica | 0,730 ± 0,036 (ε=23,6) | MIT | Hugging Face |
| Regla trivial por sexo | 0 | no aplica | 0,777 | — | referencia del propio autor |
| MLP centralizada (misma arquitectura) | ~986 | no aplica | 0,810 ± 0,013 | — | solo en la model card |
| Modelos tabulares genéricos (XGBoost, LightGBM) | no disponible | no aplica | no disponible | varía | amplia |

No se han publicado comparaciones frente a otros modelos federados con DP en la información disponible. La referencia más cercana es la MLP centralizada del mismo autor, que supera al modelo federado con ruido en 8 puntos de accuracy.

## Limitaciones y advertencias

- El modelo con DP rinde por debajo de una regla trivial basada en sexo (0,730 frente a 0,777), lo que evidencia el coste de la privacidad con pocos datos.
- ε≈23,6 es una garantía formal débil; protege la contribución de cada cliente, no la de cada pasajero, y está lejos del rango de un dígito habitual en producción.
- El preprocesamiento (medianas e imputación, estandarización) se calcula de forma centralizada y queda fuera de la garantía diferencial.
- La federación es una simulación sobre datos públicos; no hay clientes reales ni datos privados.
- Uso exclusivamente educacional: el modelo emplea sexo, clase y título, y refleja un evento histórico de 1912; no debe fundamentar decisiones sobre personas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de sobreajuste y varianza alta: con 179 ejemplos de test, una semilla aislada varía notablemente (0,760 frente a 0,730 de media).
- Licencia MIT permite uso comercial, pero el propio autor desaconseja cualquier aplicación real.
- Idiomas: etiquetado como `pt`; el modelo no procesa texto libre, solo campos estructurados.

## Enlaces

- Hugging Face: https://huggingface.co/bernardozschaber/titanic-federated-dp-mlp
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/bernardozschaber/titanic-federated-dp
- Tutorial de origen: https://github.com/bernardozschaber/titanic-dataset
