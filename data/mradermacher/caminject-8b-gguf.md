# mradermacher/CamInject-8B-GGUF

## Resumen

CamInject-8B es un modelo multimodal de 8.190 millones de parámetros desarrollado por ddz16, que combina la arquitectura visual-lingüística de Qwen3-VL con la inyección de VGGT, un modelo especializado en estimación de movimiento de cámara. El resultado es un sistema capaz de comprender tanto contenido visual como el movimiento de la cámara que capturó ese contenido, algo fundamental para tareas de análisis de vídeo, robótica o realidad aumentada. La versión GGUF aquí descrita, publicada por mradermacher, ofrece el modelo en formatos cuantizados para su despliegue eficiente en una amplia gama de hardware, desde GPU de consumo hasta entornos de servidor.

La relevancia de este modelo reside en su enfoque específico: la mayoría de los modelos multimodales comprenden *qué* aparece en una imagen o vídeo, pero no *cómo* se movió la cámara al capturarlo. CamInject-8B aborda esta carencia inyectando las capacidades de VGGT en el flujo de Qwen3-VL, lo que permite razonar sobre trayectorias de cámara, estimación de pose y estructura de la escena. Esto abre casos de uso especializados en campos como la robótica, la navegación autónoma o el análisis de vídeo forense. La disponibilidad de cuantizaciones GGUF (desde Q2_K hasta f16) facilita su adopción en producción con diferentes restricciones de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL con inyeccion de VGGT (vision-language + camera-motion) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | Ingles (segun metadatos del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones de mradermacher) y safetensors (modelo base) |

## Arquitectura y entrenamiento

CamInject-8B parte de la arquitectura Qwen3-VL, un transformer multimodal que combina un codificador de vision con un modelo de lenguaje autoregresivo. La innovacion principal es la inyeccion de VGGT (Visual Geometry Grounded Transformer), un modelo disenado para estimar movimiento de camara, profundidad y estructura 3D a partir de secuencias de imagenes. Esta inyeccion permite que el modelo no solo describa el contenido visual, sino que tambien razone sobre la geometria de la escena y la trayectoria de la camara. Los detalles exactos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion publica, pero el enfoque sugiere un entrenamiento supervisado sobre datos de video con anotaciones de movimiento de camara y posiblemente un ajuste fino posterior sobre Qwen3-VL.

El modelo base se distribuye en formato safetensors, y la version GGUF de mradermacher ofrece cuantizaciones estaticas. No se menciona el uso de imatrix o cuantizacion ponderada, aunque el autor indica que podria anadirlas si hay demanda. El proyector multimodal (mmproj) se proporciona por separado en dos variantes (Q8_0 y f16), lo que permite una integracion flexible con el modelo principal.

## Capacidades

- Comprension de video e imagenes con razonamiento sobre movimiento de camara, trayectorias y geometria de la escena.
- Estimacion de pose de camara y estructura 3D gracias a la inyeccion de VGGT.
- Generacion de texto en ingles a partir de entradas visuales (descripcion, analisis, respuesta a preguntas).
- Capacidades heredadas de Qwen3-VL: comprension visual general, razonamiento multimodal y generacion de texto.
- Soporte de tool calling y function calling (funcionalidad heredada de Qwen3-VL, no confirmada explicitamente en la documentacion de CamInject).
- Capacidad de mantener conversaciones multi-turno con contexto visual.

## Casos de uso

- Analisis de video forense: el modelo puede reconstruir la trayectoria de una camara a partir de un clip, ayudando a verificar la autenticidad de grabaciones o a entender la perspectiva de un incidente.
- Navegacion de robots autonomos: al comprender el movimiento de camara y la estructura 3D, el modelo puede ayudar a un robot a estimar su posicion relativa y planificar rutas en entornos desconocidos.
- Realidad aumentada y virtual: para anclar objetos virtuales en una escena real, es necesario conocer la pose de la camara en cada fotograma; este modelo puede proporcionar esa informacion de forma natural en un pipeline multimodal.
- Edicion de video automatizada: el modelo puede analizar la "cinematografia" de un clip (movimientos de camara, planos, angulos) y sugerir cortes o transiciones coherentes con el estilo del contenido.
- Conduccion autonoma y asistencia a la conduccion: la estimacion de movimiento de camara es critica para entender la dinamica del vehiculo y el entorno; el modelo puede integrarse en sistemas de percepcion para tareas de localizacion visual.
- Inspeccion industrial y mantenimiento predictivo: al analizar secuencias de video de maquinaria, el modelo puede detectar movimientos anomalos de camara que indiquen vibraciones o desalineaciones, ayudando a diagnosticar fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de estimacion de movimiento de camara para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M (recomendada por el autor) ocupa 5,1 GB, mas el proyector mmproj-Q8_0 (0,9 GB), totalizando aproximadamente 6 GB. La Q8_0 requiere 8,8 GB, y la f16 16,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar la Q4_K_M (por ejemplo, RTX 3060, RTX 4060, RTX 2070). Para Q8_0 se recomienda una GPU con 12 GB o mas (RTX 3080, RTX 4070 Ti, RTX 3090). Para f16, se necesita una GPU de 24 GB (RTX 3090, RTX 4090, A5000).
- Si cabe en consumer GPU: si, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo de gama media y alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM, TGI o Transformers.
- Latencia y throughput: no disponibles. Dependeran del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria (estimacion de movimiento de camara + comprension visual). Como referencia general, se puede comparar con otros modelos multimodales de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CamInject-8B | 8,19 B | No disponible | Apache-2.0 | Vision + movimiento de camara (VGGT) |
| Qwen2-VL-7B | 7,6 B | 32K (aprox.) | Apache-2.0 | Vision general, sin movimiento de camara |
| LLaVA-1.6-8B | 8 B | 4K | Apache-2.0 | Vision general, sin movimiento de camara |

La diferencia clave es la inyeccion de VGGT, que no esta presente en los modelos alternativos. Para tareas de movimiento de camara, CamInject-8B es probablemente superior; para tareas generales de vision, Qwen2-VL podria ser mas versatil.

## Limitaciones y advertencias

- El modelo solo soporta ingles como idioma de entrada y salida, segun los metadatos del modelo base.
- No se ha publicado informacion sobre la longitud de contexto, lo que dificulta planificar su uso en conversaciones largas o videos extensos.
- Los detalles de entrenamiento (datos, metodos de alineacion) no estan disponibles, por lo que se desconocen posibles sesgos en los datos de video utilizados.
- Riesgo de alucinacion en tareas de estimacion geometrica: como cualquier modelo generativo, puede producir estimaciones de movimiento de camara incorrectas pero plausibles.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los terminos de los modelos base (Qwen3-VL y VGGT) por si hubiera restricciones adicionales.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de las estimaciones geometricas, que son sensibles a pequenos errores numericos.
- El autor de la cuantizacion (mradermacher) indica que los quants son estaticos y no ha realizado cuantizacion con imatrix; esto puede afectar a la calidad en tareas de alta precision.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/CamInject-8B-GGUF
- Modelo base (safetensors): https://huggingface.co/ddz16/CamInject-8B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
