# mradermacher/WorldReward-qwen38-27b-GGUF

## Resumen

WorldReward-qwen38-27b-GGUF es una cuantización GGUF del modelo WorldReward-qwen38-27b, desarrollado por CodeGoat24 y cuantizado por mradermacher. Se trata de un modelo de recompensa (reward model) y modelo de mundo (world model) orientado a la generación de video y al control de cámara. El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26.900 millones) y está disponible bajo licencia Apache-2.0. La cuantización permite ejecutarlo en hardware más modesto, con tamaños que van desde 10.8 GB en Q2_K hasta 15.7 GB en Q4_K_S. No se especifica la longitud de contexto ni la arquitectura exacta en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q4_K_S, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna ni el proceso de entrenamiento en la información disponible. El modelo original, CodeGoat24/WorldReward-qwen38-27b, está etiquetado como un modelo de recompensa y modelo de mundo, con aplicaciones en generación de video y control de cámara. Esta versión es una cuantización estática realizada por mradermacher, sin cuantizaciones ponderadas o imatrix en el momento de su publicación. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF/DPO).

## Capacidades

- Modelo de recompensa para evaluar la calidad de salidas en tareas de generación de video.
- Modelo de mundo (world model) con posible aplicación en control de cámara.
- Incluye un componente multimodal (mmproj) que sugiere capacidad de procesar entradas visuales.
- Etiquetado como "conversational" en HuggingFace, aunque su función principal es la de reward/world modeling.
- Soporte de idioma inglés.
- No se documenta soporte de tool calling, function calling ni agentes.

## Casos de uso

- Evaluación automática de videos generados: el modelo puede puntuar la coherencia y calidad de videos sintéticos, permitiendo filtrar resultados en pipelines de generación.
- Control de cámara en síntesis de video: gracias a su naturaleza de world model, puede evaluar si los movimientos de cámara generados son realistas y coherentes con la escena.
- Alineación de modelos de video mediante RLHF: al ser un reward model, puede integrarse en procesos de optimización por políticas para mejorar la calidad de generadores de video.
- Selección de mejores muestras en sistemas de generación: en aplicaciones donde se generan múltiples candidatos, el modelo puede actuar como criterio de selección automática.
- Investigación en world models: puede utilizarse como referencia para estudiar la representación de dinámicas espaciotemporales en entornos simulados.
- Integración en herramientas de evaluación de contenido visual: al estar disponible en GGUF, puede ejecutarse con llama.cpp u otros motores de inferencia para evaluar contenido en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_S (15.7 GB) se requieren al menos 16-20 GB de VRAM; con Q2_K (10.8 GB) se puede ejecutar en tarjetas con 12 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o equivalentes.
- Sí cabe en consumer GPU de gama alta: la Q4_K_S puede ejecutarse en una RTX 4090; la Q2_K en una RTX 3090 o superior.
- Opciones de despliegue: llama.cpp, Ollama, u otros motores que soporten GGUF. También se puede cargar con la biblioteca transformers si se convierte a safetensors (aunque el repo solo contiene GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se conoce la existencia de una variante más pequeña, WorldReward-qwen35-9b-i1-GGUF, y del modelo base original CodeGoat24/WorldReward-qwen38-27b. Sin embargo, no se dispone de datos suficientes para establecer una comparación rigurosa de rendimiento o especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WorldReward-qwen38-27b-GGUF | 26.895.998.464 | no disponible | Apache-2.0 | GGUF |
| WorldReward-qwen35-9b-i1-GGUF | no disponible | no disponible | Apache-2.0 | GGUF |
| CodeGoat24/WorldReward-qwen38-27b | 26.895.998.464 | no disponible | Apache-2.0 | safetensors |

## Limitaciones y advertencias

- Sesgos no documentados: al ser un modelo de recompensa, puede heredar sesgos de los datos de entrenamiento, aunque no se han publicado análisis de sesgos.
- Riesgo de alucinación: como todo modelo de recompensa, puede asignar puntuaciones incorrectas o incoherentes en casos no vistos.
- Limitaciones de idioma: solo soporta inglés, lo que limita su uso en contextos multilingües.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.
- La cuantización puede degradar la precisión del modelo en comparación con los pesos originales en safetensors.
- No es un modelo de propósito general: su diseño como reward/world model implica que no debe usarse como chatbot o asistente de texto sin una evaluación específica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WorldReward-qwen38-27b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/WorldReward-qwen38-27b
- Página de descarga conveniente: https://hf.tst.eu/model#WorldReward-qwen38-27b-GGUF
