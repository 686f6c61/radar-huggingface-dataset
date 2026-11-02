# mradermacher/lector-4b-v1-GGUF

## Resumen

Lector-4b-v1-GGUF es la versión cuantizada en formato GGUF del modelo Lector-4b-v1, publicada por el usuario mradermacher. Se trata de una conversión estática generada a partir de los pesos originales alojados en el repositorio julioalonzom/lector-4b-v1, pensada para su uso con llama.cpp y herramientas compatibles con GGUF. El repositorio incluye un conjunto de cuantizaciones (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS y x-f16) que cubren desde configuraciones de muy baja precisión hasta coma flotante de 16 bits.

El dato más relevante, y a la vez contradictorio, es el tamaño: pese al nombre "4b" del modelo original, los pesos en safetensors registrados en el repositorio suman 333.514.240 parámetros (aproximadamente 0,33 mil millones). Esta discrepancia entre la denominación comercial y el recuento real de parámetros debe tenerse en cuenta antes de cualquier despliegue. El tamaño total del repositorio es de 1,0 GB, coherente con un modelo de ese orden y con múltiples cuantizaciones empaquetadas.

La ficha del modelo original no aporta información sobre arquitectura, licencia, idiomas, datos de entrenamiento ni benchmarks. La model card del repositorio GGUF se limita a declarar que se trata de cuantizaciones estáticas del modelo de julioalonzom y a listar los tipos de cuantización generados. Por tanto, esta ficha se limita a documentar lo verificable y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 333.514.240 (según safetensors del repo) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors |
| Tamaño del repositorio | 1,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creación | 2026-11-02 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo original (transformer, MoE, SSM o híbrida), ni sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF no incluye estos datos y remite únicamente al repositorio de origen.

Lo único documentado es el proceso de conversión: se trata de cuantizaciones estáticas generadas con un pipeline de conversión a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1), partiendo de los pesos en formato Hugging Face del modelo julioalonzom/lector-4b-v1. No consta que se haya aplicado ninguna modificación adicional a los pesos más allá de la cuantización.

## Capacidades

- Generación de texto: no se documentan capacidades específicas más allá de las propias de un modelo de lenguaje.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad de despliegue: al estar en formato GGUF, es compatible con llama.cpp y con los runners que lo integran (Ollama, LM Studio, entre otros), siempre que la arquitectura subyacente esté soportada por la versión correspondiente.

## Casos de uso

- Inferencia en CPU o en hardware de gama baja: con 333 millones de parámetros y cuantizaciones desde Q2_K hasta Q8_0, el modelo puede ejecutarse en equipos sin GPU dedicada o con GPU de poca VRAM, lo que lo hace adecuado para pruebas locales y prototipado rápido.
- Despliegue embebido o en el borde: el reducido tamaño de los pesos (el repositorio completo ocupa 1,0 GB y cada cuantización individual es menor) permite integrarlo en aplicaciones de escritorio, entornos de laboratorio o dispositivos con recursos limitados.
- Evaluación comparativa de cuantizaciones: al ofrecer doce variantes de cuantización, sirve para medir el impacto de la precisión en la calidad de salida sobre una misma arquitectura, un caso habitual en investigación aplicada.
- Filtrado y clasificación de texto a pequeña escala: si el modelo original fue ajustado para tareas concretas (el nombre "lector" sugiere lectura o comprensión de documentos), puede emplearse en pipelines de preprocesado, etiquetado o extracción simple, aunque esta capacidad no está documentada.
- Base para fine-tuning ligero: al ser un modelo pequeño, es viable experimentar con ajuste fino o destilación en recursos modestos, partiendo de los pesos originales en safetensors.
- Pruebas de integración con llama.cpp: útil para validar toolchains de conversión y cuantización, dado que el repositorio documenta explícitamente el pipeline de generación de los GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de parámetros (333,5 M), una cuantización Q4_K_M ocuparía del orden de 0,2-0,25 GB y una Q8_0 en torno a 0,35-0,4 GB, sin contar overhead de contexto y runtime; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con 2 GB o más de VRAM debería poder alojar las cuantizaciones habituales; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo no está orientado a ese segmento.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer moderna, e incluso en CPU, dado el reducido número de parámetros.
- Opciones de despliegue: llama.cpp y runners basados en él (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no están confirmados para esta arquitectura; su viabilidad depende del soporte del modelo original en dichos frameworks, dato no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "4b" pero el recuento real de parámetros en safetensors es de 333.514.240 (≈0,33 B). Verificar el modelo original antes de asumir capacidades asociadas a un modelo de 4 mil millones de parámetros.
- Licencia no declarada: no se especifica la licencia del modelo original ni de la conversión, lo que impide confirmar si el uso comercial está permitido. Es imprescindible consultar el repositorio julioalonzom/lector-4b-v1 antes de cualquier uso en producción.
- Idiomas no declarados: no se puede garantizar el soporte de castellano ni de ningún otro idioma.
- Arquitectura no documentada: sin conocer la arquitectura, no se puede confirmar el soporte en frameworks distintos de llama.cpp ni el comportamiento con contextos largos.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; un modelo de este tamaño suele presentar mayor propensión a errores factuales que modelos de mayor escala, aunque no hay datos que lo confirmen para este caso.
- Cuantizaciones de baja precisión: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de la calidad de las cuantizaciones.
- Fecha de creación futura respecto a la consulta: el repositorio figura creado el 2026-11-02, dato que conviene contrastar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lector-4b-v1-GGUF
- Modelo original: https://huggingface.co/julioalonzom/lector-4b-v1
