# daidaidaidai1dai/EarthJev

## Resumen

EarthJev es un modelo de visión-lenguaje especializado en teledetección (remote sensing) de resolución ultraalta, publicado por el usuario daidaidaidai1dai en Hugging Face bajo licencia Apache 2.0. Se distribuye como un adaptador sobre el modelo base Qwen/Qwen3.5-9B, lo que implica que hereda la arquitectura transformer del modelo Qwen y añade capacidades específicas para el análisis de imágenes satelitales y aéreas de alta resolución. Su pipeline declarado es visual-question-answering (VQA), orientado a responder preguntas sobre contenido visual geoespacial.

El modelo resulta relevante porque aborda una tarea concreta y técnicamente exigente: la interpretación de imágenes de teledetección, donde los objetos de interés (edificios, vehículos, cultivos, infraestructuras) ocupan pocos píxeles y requieren razonamiento espacial fino. Al estar construido sobre un modelo de 9B parámetros, ofrece un equilibrio entre capacidad de razonamiento y requisitos de hardware moderados en comparación con modelos de mayor escala.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, el acceso es restringido (gated) y no se han publicado detalles sobre el dataset de entrenamiento, los benchmarks ni las capacidades exactas. El tamaño del repositorio (19,3 GB) sugiere que incluye pesos en safetensors, probablemente del adaptador o del modelo completo fusionado, aunque no se especifica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (adaptador sobre Qwen/Qwen3.5-9B); detalles específicos no disponibles |
| Parámetros totales | 9B (heredados del modelo base Qwen/Qwen3.5-9B); parámetros del adaptador no disponibles |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

EarthJev se presenta como un adaptador (adapter) sobre Qwen/Qwen3.5-9B, según los tags del repositorio (`base_model:Qwen/Qwen3.5-9B`, `base_model:adapter:Qwen/Qwen3.5-9B`). Esto indica una estrategia de ajuste fino paramétricamente eficiente (PEFT) o un fine-tuning completo del modelo base para la tarea de VQA en teledetección. La arquitectura subyacente es la del transformer multimodal de Qwen3.5-9B, que combina un codificador visual con un decodificador de lenguaje; sin embargo, no se especifican en la información disponible los detalles del conector visual, la resolución de entrada soportada ni el esquema de parcheado.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset (fuentes satelitales, sensores, resoluciones), ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de thinking mode. La única información técnica fiable es la derivada del modelo base y del pipeline declarado.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes de teledetección de resolución ultraalta.
- Interpretación de escenas geoespaciales: identificación de edificios, infraestructuras, vehículos, cultivos y cambios en el terreno (inferido de los tags `remote-sensing` y `ultra-high-resolution`).
- Generación de texto descriptivo a partir de imágenes satelitales o aéreas.
- Capacidades heredadas del modelo base Qwen3.5-9B: razonamiento, generación de texto y posible soporte multilingüe (no confirmado para este adaptador).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.

## Casos de uso

- Análisis de imágenes satelitales para monitorización agrícola: el modelo puede responder preguntas sobre el estado de cultivos, extensión de parcelas o presencia de plagas a partir de imágenes de alta resolución, aprovechando su especialización en teledetección.
- Detección y descripción de infraestructuras críticas: útil para inventariar carreteras, puentes, tendidos eléctricos o edificaciones en imágenes aéreas, generando descripciones textuales que alimenten bases de datos geoespaciales.
- Monitorización de cambios urbanos: comparación de imágenes multitemporales mediante preguntas dirigidas ("¿qué ha cambiado en esta zona?"), adecuado para planificación urbana y control de licencias.
- Evaluación de daños tras desastres naturales: el modelo puede interpretar imágenes post-evento y responder sobre áreas afectadas, edificios colapsados o inundaciones, agilizando la respuesta de emergencias.
- Verificación de cumplimiento medioambiental: análisis de imágenes para detectar vertidos, deforestación o construcciones ilegales en zonas protegidas, con salida en lenguaje natural para informes.
- Asistencia a analistas GIS: integración en herramientas de escritorio o web para consultas en lenguaje natural sobre capas ráster de alta resolución, reduciendo la necesidad de scripts especializados.
- Generación de metadatos automáticos para catálogos de imágenes: descripción textual de escenas para indexación y búsqueda semántica en archivos de teledetección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 9B parámetros, en FP16 requiere aproximadamente 18 GB de VRAM solo para los pesos, más overhead para el codificador visual y el contexto. En cuantización de 8 bits, en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones generales para un transformer de 9B, no confirmadas para este adaptador).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB (RTX 3090/4090) usando cuantización de 8 bits o inferior; en 16 GB (RTX 4080, 4070 Ti Super) probablemente solo en 4 bits, con riesgo de degradación.
- Opciones de despliegue: al ser un adaptador sobre Qwen3.5-9B, podría servirse con vLLM, TGI o llama.cpp si se generan pesos GGUF (no disponibles en el repo). Para el adaptador en safetensors, se requiere cargar el modelo base y aplicar el adaptador con la librería PEFT o Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EarthJev | 9B (base Qwen3.5-9B) | No disponible | Teledetección VQA | Apache 2.0 | Gated, 0 descargas |
| Qwen2.5-VL-7B | 7B | 32k (típico) | Visión-lenguaje general | Apache 2.0 | Público, amplia adopción |
| InternVL2-8B | 8B | 8k-32k | Visión-lenguaje general | MIT/Apache (según variante) | Público |
| LLaVA-OneVision-7B | 7B | 32k | Visión-lenguaje general | Apache 2.0 | Público |

Nota: los datos de los modelos comparables son orientativos y pueden variar según la variante; no se dispone de benchmarks de EarthJev para comparar rendimiento. La principal diferencia de EarthJev es su especialización declarada en teledetección, frente al carácter generalista de las alternativas.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o entornos corporativos.
- Información pública muy escasa: sin dataset, benchmarks ni documentación técnica, es difícil evaluar su calidad real frente a alternativas generalistas.
- Riesgo de alucinación: como todo modelo de visión-lenguaje, puede generar descripciones plausibles pero incorrectas sobre objetos no visibles o mal interpretados, especialmente en imágenes de muy alta resolución con objetos pequeños.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos geográficos (sobrerrepresentación de ciertas regiones), temporales o de sensor.
- Limitaciones de idioma: no se especifican los idiomas soportados; se desconoce si responde correctamente en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3.5-9B, deben respetarse también las condiciones del modelo base (verificar la licencia de Qwen/Qwen3.5-9B, no incluida en esta ficha).
- Caveat para producción: con 0 descargas y 0 likes, no hay evidencia de validación por la comunidad; se recomienda evaluar exhaustivamente antes de desplegar en entornos críticos.
- Tamaño del repo (19,3 GB) sugiere que puede contener pesos fusionados o múltiples checkpoints; verificar qué archivos se descargan realmente.

## Enlaces

- Hugging Face: https://huggingface.co/daidaidaidai1dai/EarthJev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
