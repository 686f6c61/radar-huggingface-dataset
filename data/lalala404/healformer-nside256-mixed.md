# lalala404/healformer-nside256-mixed

## Resumen

HealFormer nside256 mixed-mask es un modelo de aprendizaje profundo para el mapeo de masa por lente débil (weak lensing mass mapping) en cosmología. Desarrollado por Yihe Wang y Yu Yu (paper arXiv:2603.25471), este checkpoint de la librería healformers reconstruye mapas de convergencia (kappa) a partir de campos de cizalla (shear) observados, incorporando explícitamente la información de máscaras para manejar regiones no observadas del cielo. El modelo opera sobre mapas HEALPix en orden NESTED con resolución Nside=256 y utiliza un único conjunto de pesos para múltiples máscaras fijas de surveys como KiDS, DES, DECaLS y Planck, lo que simplifica su despliegue en pipelines de análisis.

La arquitectura se basa en un transformer adaptado a la discretización HEALPix, con mecanismos de atención conscientes de máscaras (mask-aware), inspirado en ViT/MAE. Con 115 millones de parámetros y un peso de 0,5 GB en formato safetensors, el modelo es relativamente ligero y puede ejecutarse en GPUs de consumo. Su relevancia radica en mejorar la precisión de la reconstrucción de masa frente a métodos tradicionales, ofreciendo una herramienta lista para inferencia en estudios de estructura a gran escala y estadísticas de orden superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HealFormer (transformer sobre HEALPix, mask-aware, basado en ViT/MAE) |
| Parametros totales | 115.309.099 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de vision, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (modelo de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

HealFormer emplea una arquitectura transformer adaptada a la discretización HEALPix, donde cada píxel del cielo se trata como un token. La principal innovación es la inclusión de información de máscaras en el mecanismo de atención, lo que permite al modelo distinguir entre regiones visibles, bordes de reconstrucción y zonas no observadas. Esta característica es crucial para el mapeo de masa, ya que las encuestas de lente débil presentan coberturas irregulares y regiones con datos ausentes.

El checkpoint corresponde a la versión v0.2.0 de HealFormer, entrenado específicamente para mapas Nside=256 con máscaras fijas de KiDS, DES, DECaLS y Planck. No se proporcionan detalles sobre el conjunto de datos de entrenamiento (número de simulaciones, composición) ni sobre técnicas de optimización como RLHF o DPO, que no aplican en este contexto. El modelo se publica listo para inferencia, sin necesidad de ajuste fino para las máscaras mencionadas.

## Capacidades

- Reconstrucción de mapas de convergencia (kappa) en unidades físicas a partir de campos de cizalla (gamma1, gamma2) y máscaras.
- Soporte de múltiples máscaras fijas (KiDS, DES, DECaLS, Planck) con un único checkpoint, sin rotación de mapas en evaluación.
- Procesamiento de mapas HEALPix en orden NESTED con resolución Nside=256.
- Manejo explícito de regiones no observadas mediante la máscara (valores 0 visible, 1 borde de reconstrucción, 2 no observado).
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Analisis de datos de surveys de lente debil: el modelo puede reconstruir mapas de convergencia a partir de los campos de cizalla medidos en KiDS, DES, DECaLS o Planck, proporcionando estimaciones de la distribucion de masa para estudios de estructura a gran escala.
- Validacion de pipelines de mapeo de masa: al ser un checkpoint listo para inferencia, permite comparar rapidamente diferentes estrategias de reconstruccion en simulaciones realistas antes de aplicarlas a datos reales.
- Estudios de estadisticas de orden superior: los mapas de convergencia reconstruidos pueden usarse para calcular picos, funciones de correlacion o espectros de potencia, ayudando a extraer informacion cosmologica mas alla de los estadisticos de dos puntos.
- Generacion de mapas de convergencia para comparacion con modelos teoricos: el modelo puede alimentar cadenas de simulacion para contrastar predicciones teoricas con observaciones, por ejemplo en la estimacion de parametros cosmologicos.
- Integracion en flujos de trabajo de analisis astronomico: gracias a su interfaz simple (pipeline de la libreria healformers), puede incorporarse en scripts de Python dentro de pipelines de reduccion de datos.
- Educacion y prototipado: al ser ligero (115M parametros) y con licencia Apache 2.0, es adecuado para experimentos academicos y demostraciones de tecnicas de deep learning en cosmologia.

## Benchmarks y rendimiento

La model card proporciona estadisticas de diagnostico sobre 100 cielos independientes. El error de potencia es el RMSE del cociente entre el espectro de potencia predicho y el verdadero alrededor de uno, y la correlacion cruzada es el coeficiente de correlacion armonico medio.

| Mascara fija | Power-ratio RMSE | Correlacion cruzada media |
|---|---:|---:|
| KiDS | 0.1748 ± 0.2656 | 0.9501 ± 0.0058 |
| DES | 0.0892 ± 0.0143 | 0.9569 ± 0.0023 |
| DECaLS | 0.0542 ± 0.0163 | 0.9762 ± 0.0013 |
| Planck | 0.0544 ± 0.0044 | 0.9746 ± 0.0011 |

Las incertidumbres corresponden a una desviacion estandar de la muestra, no al error estandar. No se han publicado comparaciones con otros metodos de mapeo de masa en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 115M parametros y pesos en FP32 (0,5 GB), la inferencia requiere aproximadamente 1-2 GB de VRAM adicionales para activaciones y buffers, por lo que cabe en GPUs con 4 GB o mas.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 (aunque no es necesaria tanta capacidad).
- Compatibilidad con GPUs de consumo: si, el modelo es suficientemente pequeno para ejecutarse en tarjetas graficas de gama media.
- Opciones de despliegue: se usa principalmente mediante la libreria healformers (pipeline `MassMappingPipeline`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero al ser un modelo pequeno se espera una inferencia rapida (del orden de milisegundos a segundos por mapa, dependiendo del hardware).

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han encontrado referencias a otros metodos de mapeo de masa basados en transformers o HEALPix en la model card ni en la busqueda web. Por tanto, no es posible ofrecer una comparativa cuantitativa en este momento.

## Limitaciones y advertencias

- El modelo esta entrenado para simulaciones de lente debil y debe validarse antes de su uso cientifico en un pipeline de datos reales de un nuevo survey.
- Solo soporta mapas HEALPix Nside=256 con orden NESTED y mascaras especificas (valores 0, 1, 2). No es generico para otras resoluciones o formatos de mascara.
- La mascara debe proporcionarse como un array de enteros con la misma dimension que los mapas de cizalla; un formato incorrecto puede producir resultados erroneos.
- No se han documentado sesgos especificos, pero como todo modelo de deep learning, puede presentar alucinaciones en regiones con datos muy escasos, aunque la inclusion de la mascara mitiga parcialmente este efecto.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero se recomienda citar el paper original (arXiv:2603.25471) en publicaciones cientificas.
- El numero de descargas y likes es cero, lo que sugiere que el modelo es reciente o poco difundido; se recomienda verificar la integridad mediante el archivo `release-manifest.json` (SHA-256) antes de usarlo en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lalala404/healformer-nside256-mixed
- Paper: Yihe Wang y Yu Yu, "Advancing weak lensing mass mapping with a mask-aware HEALPix transformer", arXiv:2603.25471 (enlace no directo disponible en la informacion).
- Libreria healformers: no se proporciona enlace directo, pero esta referenciada en la model card como `library_name: healformers`.
