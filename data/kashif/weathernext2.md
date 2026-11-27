# kashif/weathernext2

## Resumen

WeatherNext 2 es un modelo global de predicción meteorológica a medio plazo desarrollado por Google DeepMind y Google Research, distribuido en Hugging Face por el usuario kashif. El modelo realiza una pasada forward para avanzar el estado de la atmósfera 6 horas sobre una rejilla de 0,25° de latitud/longitud (721×1440), prediciendo 13 niveles de presión de temperatura, geopotencial, viento y humedad, junto con campos de superficie, precipitación, vientos a 100 m y un conjunto de diagnósticos de ciclones tropicales.

Técnicamente se trata de una Functional Generative Network (FGN): en lugar de inyectar un campo de ruido en la entrada o ejecutar un muestreador de difusión, el modelo extrae un único vector de ruido de 32 dimensiones por miembro del ensemble y lo utiliza para modular la escala y el offset de todas las capas de normalización. Una extracción produce un pronóstico autoconsistente, y un ensemble es simplemente varias extracciones, lo que en la práctica se reduce a la dimensión de batch.

Los pesos corresponden a la variante `WeatherNext2_<2025_model1`, entrenada con datos hasta 2024 y ajustada finamente para inicialización desde análisis operativos ECMWF HRES. Es relevante ahora porque introduce un paradigma generativo distinto al de los modelos de difusión meteorológicos habituales (GraphCast, GenCast) y porque su arquitectura de red neuronal de grafos sobre malla icosaédrica con 40.962 nodos ofrece una alternativa eficiente en parámetros (215,4 M totales) para predicción operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Neural Network (Functional Generative Network, FGN) sobre malla icosaédrica de 40.962 nodos |
| Parametros totales | 215.424.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de predicción meteorológica, no de lenguaje); ventana de 2 pasos temporales de 6 h como condición inicial |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Resolucion espacial | 0,25° (rejilla 721×1440) |
| Paso temporal | 6 horas por pasada forward |
| Niveles de presión | 13 |
| Dimension de ruido latente | 32 |
| Tamano del repositorio | 34,0 GB |

## Arquitectura y entrenamiento

WeatherNext 2 es una red neuronal de grafos (GNN) que opera sobre una malla icosaédrica de 40.962 nodos, lo que permite un procesamiento jerárquico multi-escala de la atmósfera global. La innovación principal es su naturaleza de Functional Generative Network: el ruido no se inyecta en la entrada ni se emplea un muestreador de difusión iterativo, sino que un vector de 32 dimensiones por miembro del ensemble modula la escala y el offset de todas las capas de normalización del modelo. Esto permite generar un ensemble completo en una sola pasada forward (el ensemble ocupa la dimensión de batch), reduciendo drásticamente el coste computacional frente a los métodos de difusión.

El checkpoint distribuido corresponde a la variante `WeatherNext2_<2025_model1`, entrenada con datos hasta 2024 y ajustada finamente para inicialización desde análisis operativos ECMWF HRES. Existen cuatro checkpoints entrenados de forma independiente (model1 a model4) que pueden combinarse en un ensemble multi-modelo. El modelo predice campos normalizados; el `WeatherNext2FeatureExtractor` se encarga de la normalización, los forzamientos de reloj y la conversión de vuelta a unidades físicas. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset, más allá de que se emplearon datos hasta 2024 y análisis HRES del ECMWF.

## Capacidades

- Predicción meteorológica global a medio plazo con paso temporal de 6 horas y resolución de 0,25°.
- Predicción de 13 niveles de presión de temperatura, geopotencial, viento y humedad.
- Predicción de campos de superficie, incluida temperatura a 2 m.
- Predicción de precipitación.
- Predicción de vientos a 100 m (requiere entradas de viento a 100 m, ausentes en los datasets de muestra publicados).
- Diagnósticos de ciclones tropicales.
- Generación de ensembles mediante ruido: `generate(num_members=8)` produce 8 miembros con pesos compartidos y ruido independiente.
- Rollout autorregresivo multi-paso mediante `generate()` con `num_steps`, que avanza cada miembro con su propio estado predicho y muestrea ruido nuevo en cada paso de 6 horas.
- Ensemble multi-modelo combinando los cuatro checkpoints independientes (model1 a model4).
- Inicialización desde dos fotogramas cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos de entrada configurados, incluidos los estáticos.
- No soporta tool calling, agentes, razonamiento multi-step en sentido lingüístico ni capacidades multilingües: es un modelo específico de predicción meteorológica.

## Casos de uso

- Predicción operativa a medio plazo: el modelo genera pronósticos globales cada 6 horas con resolución de 0,25°, adecuado para centros meteorológicos que necesitan actualizaciones frecuentes con un coste computacional contenido gracias a su naturaleza de una sola pasada forward.
- Generación de ensembles probabilísticos: con `num_members=8` o más, se obtiene un ensemble completo en una única pasada (el ensemble ocupa la dimensión de batch), lo que permite estimar incertidumbre en temperatura a 2 m, precipitación y vientos sin ejecutar un muestreador de difusión iterativo.
- Predicción de ciclones tropicales: los diagnósticos de ciclones incluidos permiten monitorizar trayectorias e intensidad, y la variante WeatherNextCyclones está específicamente orientada a este fin.
- Predicción de vientos para energía eólica: los campos de viento a 100 m permiten estimar producción eólica a escala global, aunque requieren entradas de viento a 100 m que no están en los datasets de muestra publicados.
- Investigación climática y meteorológica: la arquitectura FGN y la posibilidad de combinar cuatro checkpoints independientes permiten estudiar la dispersión del ensemble y comparar con modelos de difusión como GenCast.
- Rollouts de 5 días: con `num_steps=20` se generan pronósticos de 5 días avanzando cada miembro con su propio estado predicho, útil para evaluación de habilidad predictiva a medio plazo.
- Integración en pipelines de investigación con Transformers: al estar implementado en la librería Transformers (rama pendiente de fusión), se integra con `from_pretrained`, `device_map="auto"` y el ecosistema de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 34,0 GB en safetensors, aunque el número de parámetros (215,4 M) sugiere que el grueso del tamaño corresponde a otros artefactos del repositorio (posiblemente múltiples checkpoints o datos auxiliares). Los pesos en sí, en fp32, ocuparían aproximadamente 0,86 GB; en fp16, unos 0,43 GB.
- GPU recomendadas: no disponible en la información proporcionada. El ejemplo de la model card usa `device_map="auto"`, lo que permite repartir el modelo entre dispositivos disponibles.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero dado el número de parámetros (215,4 M) es plausible que quepa en GPU de consumo; no se dispone de confirmación en la información.
- Opciones de despliegue: Transformers (rama `add-weathernext2` de kashif, pendiente de fusión en huggingface/transformers#47874), con `torch` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Resolucion | Enfoque generativo | Licencia |
|---|---|---|---|---|---|
| WeatherNext 2 | Google DeepMind / Google Research | 215,4 M | 0,25° (721×1440) | FGN (modulación de normalización con ruido de 32 dim) | cc-by-4.0 |
| WeatherNextCyclones | Google DeepMind / Google Research | 183,8 M | 0,25° (721×1440) | FGN | cc-by-4.0 (según repo) |
| GenCast | Google DeepMind | no disponible en la información | no disponible | Difusión | no disponible en la información |
| GraphCast | Google DeepMind | no disponible en la información | 0,25° | Determinista (GNN) | no disponible en la información |

Nota: los datos de GenCast y GraphCast no proceden de la información proporcionada y se incluyen solo como referencia de categoría; no se dispone de sus especificaciones exactas en este contexto.

## Limitaciones y advertencias

- El soporte de WeatherNext 2 no está en una versión publicada de Transformers; requiere instalar la rama `add-weathernext2` desde el repositorio de kashif hasta que se fusione huggingface/transformers#47874, lo que implica riesgo de cambios en la API.
- El checkpoint requiere entradas de viento a 100 m que están ausentes en los datasets de muestra publicados, lo que complica la reproducción directa del ejemplo.
- El modelo predice campos normalizados; es imprescindible usar `WeatherNext2FeatureExtractor` para normalización, forzamientos de reloj y conversión a unidades físicas. Un uso incorrecto produce resultados sin sentido físico.
- El ruido lo muestrea el procesador, no el forward del modelo; no debe pasarse un segundo argumento `noise` ni repetir la máscara de atención sobre los miembros del ensemble.
- En `generate()`, `seconds_since_epoch` debe ser el tiempo válido del primer pronóstico, no el del último fotograma de condicionamiento; confundirlos produce rollouts incorrectos.
- La inicialización requiere dos fotogramas cronológicos de análisis HRES separados 6 horas, con latitud ascendente, los niveles de presión del checkpoint y todos los campos configurados, incluidos los estáticos.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación (no aplica en sentido lingüístico, pero sí riesgo de pronósticos erróneos), ni restricciones adicionales de la licencia cc-by-4.0 más allá de la atribución.
- Los pesos corresponden a datos hasta 2024; el rendimiento en regímenes climáticos posteriores o eventos extremos no documentados no está garantizado.
- No se han publicado benchmarks en la información disponible, por lo que no es posible evaluar su habilidad predictiva frente a alternativas con datos objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/weathernext2
- Variante WeatherNextCyclones: https://huggingface.co/kashif/weathernext-cyclones
- Checkpoint model2: https://huggingface.co/kashif/weathernext2-model2
- Checkpoint model3: https://huggingface.co/kashif/weathernext2-model3
- Checkpoint model4: https://huggingface.co/kashif/weathernext2-model4
- Pull request de Transformers: https://github.com/huggingface/transformers/pull/47874
- Rama de Transformers con soporte: https://github.com/kashif/transformers.git@add-weathernext2
- Documentación del modelo en la rama: https://github.com/kashif/transformers/blob/add-weathernext2/docs/source/en/model_doc/weathernext2.md
- Demo oficial: https://github.com/google-deepmind/weathernext/blob/main/docs/weathernext2/wn2_demo.ipynb
- Repositorio oficial de Google DeepMind: https://github.com/google-deepmind/weathernext
- Paper (arXiv:2506.10772): https://arxiv.org/abs/2506.10772
