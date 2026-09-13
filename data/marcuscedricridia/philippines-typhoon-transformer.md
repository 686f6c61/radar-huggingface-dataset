# marcuscedricridia/philippines-typhoon-transformer

## Resumen

Philippines Typhoon Track Predictor es un modelo de series temporales publicado en HuggingFace por el usuario marcuscedricridia bajo licencia MIT. Su objetivo declarado es la predicción de trayectorias de ciclones tropicales en el entorno de Filipinas con horizontes de entre 3 y 18 horas. La model card lo describe como una arquitectura "Multi-Scale Transformer + MoE", es decir, un transformer con atención multiescala combinado con capas de mezcla de expertos (MoE), implementado con PyTorch.

El modelo se posiciona como una alternativa basada en aprendizaje profundo frente a los métodos clásicos de extrapolación de trayectoria. Según los resultados publicados por el propio autor, supera a la extrapolación lineal en todos los horizontes a partir de las 6 horas, y mantiene una ventaja creciente hasta las 18 horas, donde el error pasa de 32,1 en la línea base lineal a 27,6 en el modelo. Frente a la persistencia, la mejora es de un orden de magnitud en todos los horizontes.

La relevancia del proyecto es regional y aplicada: Filipinas es una de las zonas del mundo con mayor exposición a tifones, y una mejora en el error de predicción a corto plazo (3-18 horas) tiene impacto directo en protocolos de evacuación, aviación y operaciones marítimas. No obstante, el modelo no cuenta con pesos publicados en el repositorio, no tiene descargas ni valoraciones, y no se ha publicado información sobre el número de parámetros, el conjunto de datos de entrenamiento ni el contexto de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multiescala con capas de mezcla de expertos (MoE), según la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (la arquitectura es MoE, pero no se publica el reparto entre expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica: modelo de series temporales, no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con un tamaño de 0,0 GB y no se documentan ficheros de pesos) |
| Autor | marcuscedricridia |
| Librería | PyTorch |
| Pipeline declarado | no disponible |
| Etiquetas | pytorch, time-series, weather, transformer |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |
| Fecha de última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

La model card indica una arquitectura "Multi-Scale Transformer + MoE": un transformer que opera sobre varias escalas temporales de forma simultánea, con capas de mezcla de expertos. Este diseño es coherente con el problema: una trayectoria de ciclón combina dinámica de corto plazo (desplazamiento instantáneo) con patrones de mayor escala (dirección general de avance, interacción con sistemas sinópticos). Un encoder multiescala permitiría capturar ambas componentes, y el MoE permitiría especializar subredes en regímenes distintos de trayectoria sin multiplicar el coste de cómputo por muestra.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco aplicable a un modelo de regresión de series temporales), la función de pérdida, la ventana de entrada ni el mecanismo concreto de atención multiescala. Tampoco se documenta si el entrenamiento se realizó desde cero o mediante ajuste fino de un backbone preentrenado. El repositorio sí referencia un dataset asociado, `marcuscedricridia/philippines-typhoon-tracks`, cuya composición no se detalla en la información proporcionada.

## Capacidades

- Predicción de trayectoria de ciclones tropicales en horizontes discretos de 3, 6, 9, 12, 15 y 18 horas.
- Modelado de series temporales meteorológicas con arquitectura transformer multiescala.
- Mejora sobre extrapolación lineal a partir del horizonte de 6 horas, según los datos publicados.
- Mejora sobre persistencia en todos los horizontes evaluados (de t+3h a t+18h).
- Especialización regional: el modelo está construido y evaluado sobre el entorno de Filipinas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no aplican a un modelo de regresión sobre series temporales.
- No se documenta capacidad de predicción de intensidad (presión central, vientos máximos), solo de trayectoria.

## Casos de uso

- Alertas tempranas de protección civil: con horizontes de 3 a 18 horas, el modelo puede alimentar boletines intermedios entre las actualizaciones de los modelos numéricos de predicción (NWP), útiles para decisiones de evacuación de última hora en municipios costeros.
- Gestión de operaciones aeroportuarias: la predicción de trayectoria a 6-12 horas permite anticipar cierres de pista o desvíos de vuelos en aeropuertos como Manila, Cebú o Tacloban con mayor antelación que la extrapolación lineal.
- Navegación marítima y logística portuaria: las navieras pueden recalcular rutas y ventanas de atraque a partir de predicciones de trayectoria a 12-18 horas, donde el modelo presenta su mayor ventaja relativa sobre la línea base lineal.
- Predicción por conjuntos híbrida: el modelo puede integrarse como miembro adicional o como post-procesador de un ensemble de modelos NWP, aportando una señal estadística complementaria de bajo coste computacional.
- Apoyo a la agricultura: planificación de cosechas de emergencia y protección de cultivos en las 18 horas previas al impacto, con una resolución temporal que las predicciones diarias no ofrecen.
- Evaluación de riesgo en seguros y reaseguros: alimentar modelos catastróficos con trayectorias a corto plazo para estimar exposición de carteras en zonas concretas del archipiélago.
- Investigación académica reproducible: al publicar código, dataset y demo, sirve como punto de partida para comparar arquitecturas transformer y MoE frente a baselines lineales en predicción de ciclones.
- Formación y simulación: uso en entornos docentes para ilustrar el pipeline completo de un modelo de series temporales aplicado a meteorología tropical.

## Benchmarks y rendimiento

Resultados publicados en la model card. La unidad de error no se especifica en la información disponible (los valores son consistentes con errores de distancia de trayectoria, pero no se confirma).

| Modelo | t+3h | t+6h | t+9h | t+12h | t+15h | t+18h |
|---|---|---|---|---|---|---|
| Persistencia | 59,0 | 59,7 | 60,5 | 61,3 | 62,3 | 63,3 |
| Extrapolación lineal | 13,3 | 17,7 | 22,0 | 25,3 | 28,9 | 32,1 |
| Transformer + MoE | 13,4 | 16,8 | 20,0 | 22,7 | 25,2 | 27,6 |

Observaciones sobre la tabla: el modelo supera a la extrapolación lineal desde t+6h (16,8 frente a 17,7) y la ventaja se amplía con el horizonte, alcanzando 4,5 puntos de mejora en t+18h. En t+3h el modelo es marginalmente peor que la línea base lineal (13,4 frente a 13,3). La model card resume el hallazgo como "supera a la extrapolación lineal en todos los horizontes más allá de 9 horas", afirmación coherente con la tabla pero que subestima el resultado real, ya que la ventaja comienza en t+6h. No se publican métricas de intensidad, ni intervalos de confianza, ni el tamaño del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros ni la dimensión de entrada, no es posible calcularla sin inventar datos.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU de consumo: no determinable con la información publicada. Un modelo de series temporales de este tipo suele ser ligero en comparación con modelos de lenguaje, pero esto es una consideración genérica, no un dato del repositorio.
- Opciones de despliegue: el modelo está etiquetado como PyTorch y la model card referencia una demo en HuggingFace Spaces, lo que sugiere despliegue mediante la librería PyTorch y el ecosistema de Spaces. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso están orientados a modelos de lenguaje y no a series temporales.
- Latencia y throughput: no disponibles.
- Nota importante: el repositorio figura con un tamaño de 0,0 GB y no se documentan ficheros de pesos, por lo que la ejecución local podría requerir entrenar el modelo a partir del código publicado en el repositorio de GitHub.

## Comparativa con modelos similares

Comparativa con las dos líneas base incluidas en la propia model card:

| Modelo | Tipo | t+3h | t+9h | t+18h | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Transformer + MoE (este modelo) | Aprendizaje profundo | 13,4 | 20,0 | 27,6 | MIT | Repositorio sin pesos publicados |
| Extrapolación lineal | Baseline estadístico | 13,3 | 22,0 | 32,1 | no aplica | Trivial de implementar |
| Persistencia | Baseline trivial | 59,0 | 60,5 | 63,3 | no aplica | Trivial de implementar |

No se han proporcionado datos comparativos frente a modelos operativos de predicción de ciclones (por ejemplo, modelos globales de NWP o modelos meteorológicos basados en aprendizaje profundo). Por tanto, la comparación con alternativas de la misma categoría funcional queda como no disponible.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio figura con 0,0 GB de tamaño y no se documentan ficheros de pesos, lo que impide la inferencia directa sin reentrenar a partir del código.
- Ausencia de validación por la comunidad: 0 descargas y 0 likes, sin revisión independiente de los resultados.
- Sin publicación científica asociada: los números de la tabla provienen únicamente de la model card del autor.
- Especialización geográfica: el modelo está entrenado y evaluado para el entorno de Filipinas; su extrapolación a otras cuencas (Atlántico, Pacífico noroccidental fuera del archipiélago) no está validada.
- Sesgo potencial de dataset: no se describe la distribución temporal de los eventos de entrenamiento, lo que impide evaluar si el modelo está sesgado hacia ciertos regímenes de trayectoria o temporadas.
- Solo trayectoria: no se documenta predicción de intensidad, que suele ser el factor determinante del impacto humano.
- Horizonte limitado: 18 horas como máximo, insuficiente para planificación a medio plazo; debe complementarse con modelos NWP.
- Sin intervalos de confianza ni evaluación probabilística: no se documenta calibración, lo que dificulta el uso operativo en sistemas de alerta.
- Rendimiento peor que la línea base lineal en t+3h (13,4 frente a 13,3): en el horizonte más corto no aporta valor.
- Inconsistencia menor en la model card: el texto afirma que supera a la extrapolación lineal "más allá de 9 horas", mientras que la tabla muestra ventaja desde t+6h.
- Riesgo de sobreajuste no descartable: no se informa del tamaño del conjunto de test ni de la separación temporal entre entrenamiento y validación.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No impone restricciones adicionales, pero tampoco ofrece garantías de idoneidad para uso operativo crítico.
- Fecha de creación registrada como 2026-09-13, idéntica a la de última actualización, lo que sugiere metadatos generados automáticamente o inconsistentes.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos no guardan relación con la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcuscedricridia/philippines-typhoon-transformer
- Código fuente: https://github.com/haveanidia/philippines-typhoon-predictor
- Dataset: https://huggingface.co/datasets/marcuscedricridia/philippines-typhoon-tracks
- Demo: https://huggingface.co/spaces/marcuscedricridia/philippines-typhoon-demo
