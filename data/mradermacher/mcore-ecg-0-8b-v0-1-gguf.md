# mradermacher/MCore-ECG-0.8B-v0.1-GGUF

## Resumen

MCore-ECG-0.8B-v0.1 es un modelo multimodal especializado en electrocardiografía (ECG), desarrollado por MCORE-HEALTH y publicado originalmente bajo el identificador `MCORE-HEALTH/MCore-ECG-0.8B-v0.1`. La versión aquí descrita es la conversión a formato GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos de inferencia locales compatibles con llama.cpp y derivados. El modelo combina un componente de lenguaje con un proyector multimodal (`mmproj`), lo que indica que acepta señales de ECG como entrada junto con texto.

Con 1.006.672.704 parámetros (aproximadamente 1.000 millones, etiquetado comercialmente como "0.8B"), el modelo se posiciona en la franja de modelos pequeños, adecuados para despliegue en hardware modesto. Está marcado explícitamente como un modelo de investigación y "pilot", orientado a validar pipelines de interpretación automática de ECG más que a uso clínico en producción. La licencia Apache 2.0 facilita su uso comercial, aunque las advertencias médicas del autor deben respetarse.

La relevancia actual reside en la escasez de modelos abiertos que procesen señales biomédicas como el ECG directamente con una arquitectura transformer multimodal. Esta ficha documenta exclusivamente la versión cuantizada GGUF; los detalles de entrenamiento, dataset y arquitectura del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector `mmproj`); detalles internos no disponibles |
| Parametros totales | 1.006.672.704 (dato safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además `mmproj-Q8_0` y `mmproj-f16` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (versión cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Los metadatos indican que se trata de un modelo multimodal con un proyector `mmproj`, lo que sugiere un diseño tipo vision-language adaptado a señales de ECG: un codificador de señal que se proyecta al espacio del modelo de lenguaje. El número de parámetros (1.006 millones) corresponde al conjunto de pesos publicados en safetensors.

El dataset declarado es `MCORE-HEALTH/MCore-ECG-Pilot-v0.1`, de nombre sugerente de un corpus piloto de ECG. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco hay datos sobre innovaciones técnicas como decodificación especulativa o atención lineal. La conversión GGUF es de tipo estático (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

## Capacidades

- Procesamiento multimodal de señales de ECG junto con texto, mediante el proyector `mmproj` incluido en el repositorio.
- Generación de texto conversacional en inglés, según la etiqueta `conversational` del modelo.
- Interpretación y descripción de trazos de ECG (capacidad inferida del dominio y del dataset declarado; no se documentan métricas).
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Cuantizaciones ligeras (desde 0,6 GB en Q2_K) que permiten ejecución en CPU y GPU de gama baja.
- No se documentan capacidades de tool calling, agentes, matemáticas avanzadas ni otros idiomas distintos del inglés.

## Casos de uso

- Investigación en interpretación automática de ECG: el modelo puede recibir una señal de ECG y generar una descripción textual de los hallazgos, sirviendo como base para estudios de validación frente a cardiólogos.
- Prototipado de asistentes clínicos de triaje: integrado en un pipeline que recibe ECG de wearables y produce un resumen textual para revisión humana, gracias a su tamaño reducido y licencia permisiva.
- Educación médica: generación de explicaciones textuales de trazados de ECG para estudiantes, ejecutando el modelo en local con cuantización Q4_K_M (0,8 GB).
- Despliegue en dispositivos de borde: al caber en GPUs de consumo y ejecutarse en CPU con llama.cpp, permite inferencia offline en entornos con conectividad limitada.
- Evaluación comparativa de modelos biomédicos: la disponibilidad de múltiples cuantizaciones (Q2_K a f16) permite estudiar el impacto de la cuantización en la calidad de las salidas sobre señales de ECG.
- Generación de informes preliminares en investigación retrospectiva: procesamiento por lotes de registros de ECG anonimizados para extraer descripciones estructuradas, siempre con supervisión experta.
- Integración en sistemas de alerta temprana: combinado con reglas clínicas, el modelo puede aportar una capa de lenguaje natural sobre las señales detectadas, facilitando la comunicación con personal no especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~0,6 GB (Q2_K) hasta ~2,1 GB (f16) para los pesos del modelo; añadir ~0,2-0,3 GB para el proyector `mmproj`.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecutable en CPU mediante llama.cpp, con rendimiento aceptable dado el tamaño inferior a 1.100 millones de parámetros.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCore-ECG-0.8B-v0.1 (GGUF) | ~1,0 B | No disponible | ECG + texto | Apache 2.0 | GGUF en HF |
| Modelos de ECG abiertos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (ECG multimodal de código abierto) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo marcado como "research" y "pilot": no está validado para uso clínico ni diagnóstico médico; cualquier aplicación sanitaria requiere validación regulatoria independiente.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en un dominio donde una descripción errónea puede tener consecuencias graves.
- No se documentan sesgos del dataset ni la composición de `MCore-ECG-Pilot-v0.1`, lo que impide evaluar su representatividad demográfica.
- Longitud de contexto desconocida, lo que limita el diseño de aplicaciones con señales de ECG extensas o conversaciones multi-turno.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de la interpretación de señales; se recomienda Q4_K_M o superior para uso serio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- Aunque la licencia Apache 2.0 permite uso comercial, la responsabilidad legal y regulatoria del uso clínico recae enteramente en el integrador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MCore-ECG-0.8B-v0.1-GGUF
- Modelo base: https://huggingface.co/MCORE-HEALTH/MCore-ECG-0.8B-v0.1
- Dataset declarado: https://huggingface.co/datasets/MCORE-HEALTH/MCore-ECG-Pilot-v0.1
- Página de descargas del cuantizador: https://hf.tst.eu/model#MCore-ECG-0.8B-v0.1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
