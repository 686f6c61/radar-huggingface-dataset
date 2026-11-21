# oscarwest1/gemma-4-12B-Q6_K-GGUF

## Resumen

Gemma 4 12B es un modelo multimodal de Google, publicado originalmente en formato BF16 bajo el identificador `google/gemma-4-12B`. Esta ficha documenta la cuantización Q6_K en formato GGUF realizada por el usuario `oscarwest1` a partir de los pesos originales mediante `llama.cpp`. El modelo base cuenta con 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) y su pipeline declarado es `image-text-to-text`, lo que indica capacidad de entrada de imagen y texto.

La relevancia de esta publicación concreta es doble: por un lado, permite ejecutar un modelo multimodal de casi 12B parámetros en hardware de consumo gracias a la cuantización Q6_K; por otro, al tratarse del checkpoint base (no del variante instruction-tuned), está pensado como punto de partida para fine-tuning o para evaluación comparativa de capacidades crudas. El repositorio ocupa 9,8 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicación reciente y de nicho.

No se dispone de información pública en la model card sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. La ficha se limita, por tanto, a los datos verificables del repositorio y a las características deducibles del pipeline declarado, marcando explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, pipeline `image-text-to-text`; detalles internos no publicados en la model card) |
| Parametros totales | 11.907.350.576 (≈11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF, generado con `llama.cpp`); el modelo base original en BF16 no se distribuye en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q6_K); el modelo base original es BF16 |
| Tamano del repositorio | 9,8 GB |
| Modelo base | google/gemma-4-12B |
| Variante | Base (no instruction-tuned) |
| Fecha de creacion | 2026-11-21 |

## Arquitectura y entrenamiento

La model card de esta cuantización no aporta detalles sobre la arquitectura interna del modelo original. El pipeline declarado (`image-text-to-text`) y la etiqueta `gemma4` indican que se trata de un modelo multimodal de la familia Gemma 4 de Google, capaz de procesar imágenes junto con texto. No se especifica si emplea atención lineal, mezcla de expertos, decodificación especulativa u otras innovaciones; tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

El proceso de cuantización sí está descrito: los pesos originales en BF16 se convirtieron a Q6_K mediante `llama.cpp`. Q6_K es una cuantización de 6 bits por peso con escalas por bloque, que suele preservar la calidad del modelo original con una pérdida mínima en tareas de generación, a costa de un tamaño mayor que alternativas como Q4_K_M. Se trata del checkpoint base, no de la variante instruction-tuned, por lo que no incorpora alineación conversacional.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen + texto), según el pipeline `image-text-to-text` declarado.
- Procesamiento de imágenes como entrada, orientado a tareas de descripción, respuesta a preguntas visuales y similares (capacidades concretas no verificadas en la model card).
- Modelo base: adecuado como punto de partida para fine-tuning supervisado o para evaluación de capacidades crudas.
- Soporte de tool calling / function calling: no disponible (no documentado; al ser un modelo base, no se espera alineación para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Fine-tuning multimodal especializado: al ser el checkpoint base en Q6_K, puede servir como inicialización para adaptar el modelo a dominios concretos (por ejemplo, inspección visual industrial o análisis de documentos escaneados) con LoRA o QLoRA sobre los pesos cuantizados.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de Q6_K frente al BF16 original en tareas de imagen-texto, dentro de un pipeline de validación interno.
- Prototipado local de asistentes visuales: con 9,8 GB de pesos, cabe en GPUs de consumo de 12-16 GB de VRAM, lo que permite montar demos de descripción de imágenes o VQA sin infraestructura en la nube.
- Investigación en interpretabilidad multimodal: el acceso a pesos cuantizados facilita experimentos de análisis de activaciones y atención sobre entradas visuales en entornos con recursos limitados.
- Generación de descripciones automáticas de imágenes en catálogos: integrable en scripts de preprocesado por lotes mediante `llama.cpp` o servidores compatibles con GGUF.
- Base para destilación o generación de datos sintéticos: el modelo puede emplearse para etiquetar pares imagen-texto a gran escala antes de entrenar modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q6_K: aproximadamente 10-12 GB solo para los pesos, más overhead de contexto y del codificador visual (estimación orientativa; no confirmada por el autor).
- GPU recomendadas para Q6_K: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, H100; también válidas GPUs de 16 GB con contexto moderado.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que se ajuste la longitud de contexto.
- Opciones de despliegue: `llama.cpp` (origen de la cuantización), Ollama, servidores compatibles con GGUF; para el pipeline multimodal conviene verificar que la build de `llama.cpp` soporte el proyector visual del modelo.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B Q6_K (este repo) | ≈11,9B | no disponible | GGUF Q6_K | Apache 2.0 | Cuantización comunitaria del base; sin benchmarks publicados |
| Gemma 4 12B (BF16 original) | ≈11,9B | no disponible | BF16 (safetensors) | Apache 2.0 | Referencia de calidad; requiere más VRAM |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparación rigurosa |

## Limitaciones y advertencias

- Es un modelo base, no instruction-tuned: no está alineado para seguir instrucciones conversacionales ni para formatos de chat; requiere prompting cuidadoso o fine-tuning.
- No se documentan sesgos conocidos, pero al no haber información sobre el dataset de entrenamiento no es posible evaluar riesgos de sesgo de género, raza o cultural.
- Riesgo de alucinación inherente a los modelos generativos; sin datos de evaluación no puede cuantificarse.
- Longitud de contexto e idiomas soportados no documentados: no se debe asumir cobertura multilingüe ni ventanas largas sin verificación empírica.
- La cuantización Q6_K introduce una pérdida de calidad respecto a BF16; el grado exacto no está medido en este repositorio.
- Licencia Apache 2.0 declarada en el repo, pero conviene verificar los términos del modelo base `google/gemma-4-12B`, ya que las licencias de la familia Gemma han incluido históricamente condiciones de uso adicionales.
- Repositorio sin descargas ni validación comunitaria: no hay garantía de que los archivos GGUF estén correctamente generados ni de que el proyector visual funcione con todas las builds de `llama.cpp`.
- Para producción, se recomienda validar el modelo contra el BF16 original en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oscarwest1/gemma-4-12B-Q6_K-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- `llama.cpp` (herramienta de cuantización): https://github.com/ggerganov/llama.cpp
