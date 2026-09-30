# OpenTSLM/TeeMoE

## Resumen

OpenTSLM TeeMoE es un modelo de lenguaje especializado en series temporales desarrollado por el proyecto OpenTSLM. Su objetivo es unificar en un único modelo tres capacidades que habitualmente requieren herramientas separadas: la predicción numérica (forecasting), la predicción condicionada por contexto y el análisis y razonamiento sobre señales temporales. Para ello parte del backbone congelado Qwen3.6-27B y combina tres expertos LoRA mediante un controlador aprendido que pondera cada experto en función de la petición.

El checkpoint publicado no contiene el modelo base completo, sino los tres adaptadores LoRA, el controlador de expertos, el conector numérico, el decodificador y los pesos del ensamblado aprendido, en un repositorio de 1,6 GB en formato safetensors. El paquete de inferencia descarga por su cuenta el modelo de lenguaje base y los modelos de forecasting externos según los necesite.

El modelo se presentó en el taller Foundation Models for Temporal Systems (FMTS) de NeurIPS 2026 y se distribuye bajo licencia MIT para sus propios componentes. Es relevante porque propone tratar las series temporales como una modalidad nativa dentro de un LLM, en lugar de como una tarea auxiliar resuelta por modelos estadísticos aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.6-27B congelado) con tres expertos LoRA y controlador aprendido |
| Parametros totales | Backbone base de 27B (congelado); checkpoint publicado de 1,6 GB con adaptadores LoRA, controlador, conector y decodificador. Recuento exacto de parametros: no disponible |
| Parametros activos | no disponible (no es un MoE clasico; emplea tres expertos LoRA ponderados mediante controlador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT para los componentes TeeMoE; el backbone Qwen y los modelos de forecasting externos conservan sus licencias respectivas |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TeeMoE se construye sobre Qwen3.6-27B, cuyo backbone permanece congelado. Sobre el se montan tres adaptadores LoRA que actuan como expertos, mas un controlador aprendido que calcula la ponderacion de cada experto para cada peticion. El checkpoint incluye ademas un conector numérico y un decodificador, responsables de mapear la representacion de la serie temporal hacia el espacio del modelo de lenguaje y de vuelta hacia valores numericos y cuantiles.

El modelo cubre tres regimenes de uso diferenciados: forecasting numérico puro, forecasting condicionado por contexto textual (por ejemplo, una promocion con una duracion determinada) y análisis de la serie en formato de pregunta-respuesta con opciones. La salida de predicción no es un unico valor, sino una mediana acompanada de cuantiles, con 9 niveles que van del 0,1 al 0,9, lo que permite comunicar incertidumbre en la prediccion.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Forecasting numérico: genera predicciones de horizonte configurable a partir de un historial de valores, con frecuencia y marca temporal de inicio indicadas por el usuario.
- Prediccion cuantifica: devuelve una mediana y una matriz de cuantiles de 9 niveles (0,1 a 0,9) por cada paso del horizonte.
- Forecasting condicionado por contexto: acepta una descripcion textual de eventos o condiciones (por ejemplo, una promocion de 24 horas) que modula la prediccion.
- Analisis de series temporales: responde a preguntas sobre el patron de la señal, con soporte para opciones de respuesta cerradas.
- Procesamiento por lotes: expone `forecast_batch` y `analyze_batch` para listas de peticiones.
- Integracion de modelos externos: el paquete descarga modelos de forecasting externos junto al backbone de lenguaje.
- Idiomas: soporte declarado unicamente para ingles.
- Tool calling, agentes, vision, audio: no disponible en la informacion proporcionada.

## Casos de uso

- Prediccion de demanda con eventos conocidos: dado un historial de ventas horarias y una descripcion textual de una promocion futura, el modelo genera una prediccion con cuantiles que permite dimensionar stock y personal segun el escenario pesimista u optimista.
- Monitorizacion de infraestructura: alimentar series de metricas (latencia, uso de CPU, trafico) y obtener predicciones con horizonte corto para disparar alertas antes de que se superen umbrales.
- Analisis de sensores industriales: usar `analyze` para clasificar el patron de una señal (periodica, constante, en incremento) y detectar desviaciones respecto al comportamiento esperado.
- Planificacion energetica: predecir curvas de consumo o generacion a partir de series historicas y de contexto como previsiones meteorologicas introducidas como texto.
- Apoyo a la decision financiera: generar distribuciones de prediccion con intervalos cuantificados para series de precios o volumenes, utiles para escenarios de riesgo.
- Investigacion en modelos de lenguaje temporal: servir como referencia reproducible para comparar arquitecturas de expertos LoRA frente a baseline estadisticos en tareas de forecasting.
- Asistentes analiticos sobre datos operativos: responder a preguntas en lenguaje natural sobre el comportamiento de una serie registrada, integrado en un panel de control interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El setup de inferencia declarado por el autor apunta a Linux con una GPU NVIDIA de 80 GB.
- GPU compatibles por memoria: A100 80 GB, H100 80 GB y variantes con 80 GB de VRAM. El backbone de 27B en precision completa no cabe en GPU de consumo.
- GPU de consumo: no disponible. Con el backbone de 27B, solo seria viable en consumer mediante cuantizacion agresiva, pero no se documentan tipos de cuantizacion soportados.
- Entorno de software: Python 3.12, Git, `uv`, CUDA toolkit con `nvcc` y un compilador de C++. Se crea un entorno virtual mediante `bash scripts/setup.sh inference`.
- Despliegue: la carga se realiza a traves del paquete `teemoe` con `TeeMoE.from_pretrained("OpenTSLM/TeeMoE")`, que acepta tambien un directorio local. El README menciona configuracion multi-GPU.
- vLLM, llama.cpp, Ollama, TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables directos en la informacion proporcionada.

| Modelo | Parametros | Longitud de contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenTSLM TeeMoE | Backbone de 27B + LoRA (1,6 GB de checkpoint) | no disponible | no disponible | MIT (componentes propios) | HuggingFace |
| Qwen3.6-27B (base) | 27B | no disponible | no disponible | La del modelo Qwen | HuggingFace |
| Otros modelos de series temporales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declara soporte para ingles, lo que limita su uso en entornos en castellano sin trabajo adicional.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; al integrar un modelo de lenguaje, el analisis en formato pregunta-respuesta puede producir justificaciones plausibles pero incorrectas sobre la serie.
- Contexto: no se especifica la longitud maxima de contexto, un factor critico cuando se introducen historiales largos y descripciones textuales de eventos.
- Ambito de uso: el modelo esta disenado especificamente para series temporales; su uso como LLM general no esta documentado ni validado.
- Licencia: los componentes TeeMoE son MIT, pero el backbone Qwen3.6-27B y los modelos de forecasting externos que descarga el paquete conservan sus propias licencias, que hay que verificar por separado para uso comercial.
- Dependencia de descargas: la inferencia requiere descargar el modelo base y modelos externos, lo que anade dependencias de red y de terceros al despliegue.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y la publicacion del paper referencia un identificador de arXiv aun sin resolver.
- Produccion: no se documentan pruebas de latencia, throughput ni estabilidad en carga sostenida.

## Enlaces

- HuggingFace: https://huggingface.co/OpenTSLM/TeeMoE
- Repositorio de codigo: https://github.com/OpenTSLM/OpenTSLM-TeeMoE
- README del repositorio: https://github.com/OpenTSLM/OpenTSLM-TeeMoE/blob/main/README.md
- Organizacion OpenTSLM en GitHub: https://github.com/OpenTSLM/
- Pagina del proyecto OpenTSLM: https://www.opentslm.com/
- Organizacion OpenTSLM en HuggingFace: https://huggingface.co/OpenTSLM
- Paper (arXiv): https://arxiv.org/abs/ARXIV_ID
- Taller FMTS en NeurIPS 2026: https://fmts-workshop.github.io/index.html#program
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
