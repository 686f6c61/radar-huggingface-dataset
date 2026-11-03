# mradermacher/aegis-qwen2vl-3b-GGUF

## Resumen

Aegis-Qwen2VL-3B en formato GGUF es la versión cuantizada del modelo `sanaX3065/aegis-qwen2vl-3b`, un ajuste fino (LoRA fusionado) sobre Qwen2.5-VL de 3B parámetros orientado a tareas de *browser-qa* y agente visual. El modelo original lo desarrolla el usuario `sanaX3065`; esta distribución la publica mradermacher, especialista en generar cuantizaciones GGUF estáticas e imatrix para la comunidad. El problema que aborda es el de la automatización de tareas sobre interfaces gráficas y páginas web: interpretar capturas de pantalla y responder preguntas o ejecutar acciones sobre ellas.

La relevancia de esta ficha radica en que ofrece un modelo multimodal pequeño (3.397.103.616 parámetros reales según safetensors) con licencia Apache 2.0, lo que permite desplegarlo en hardware de consumo y en entornos de producción sin restricciones comerciales. Al estar disponible en múltiples cuantizaciones GGUF (desde Q2_K de 1,5 GB hasta f16 de 6,9 GB), cubre un rango amplio de presupuestos de VRAM.

La arquitectura subyacente es la de Qwen2.5-VL, un transformer multimodal con codificador visual y decodificador de lenguaje, ajustado mediante LoRA y fusionado posteriormente. El contexto, los datos de entrenamiento y los benchmarks específicos del ajuste no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-VL (ajuste LoRA fusionado) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Sobre esa base, el autor `sanaX3065` aplicó un ajuste fino con LoRA orientado a tareas de *browser-qa* y agente visual, y posteriormente fusionó los adaptadores en los pesos base, dando lugar al modelo `aegis-qwen2vl-3b`. La cuantización aquí presentada es una conversión estática a GGUF realizada por mradermacher, con archivos `mmproj` independientes (Q8_0 y f16) que contienen la proyección multimodal necesaria para procesar imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del ajuste más allá de la fusión de LoRA. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar, pero no se detalla el mecanismo.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo procesa imágenes junto con texto, lo que permite responder preguntas sobre capturas de pantalla o contenido visual.
- *Browser-QA*: interpretación de páginas web renderizadas para responder preguntas sobre su contenido.
- Agente visual: capacidad de razonar sobre interfaces gráficas, potencialmente para automatizar interacciones.
- Comprensión de imágenes mediante el componente mmproj incluido en el repositorio.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte explícito de *tool calling* ni de *function calling*.
- No se documenta modo *thinking* ni capacidades de audio.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede analizar capturas de pantalla de una aplicación web y responder si un elemento está presente o si el flujo visual es correcto, integrándose en pipelines de QA visual.
- Asistencia a usuarios sobre páginas web: dado un pantallazo de una web, el modelo responde preguntas del tipo "¿dónde está el botón de login?" o "¿qué dice este formulario?", útil en sistemas de soporte con capturas.
- Extracción de información de documentos visuales: al ser multimodal, puede leer y resumir contenido de imágenes o PDFs renderizados, siempre que el contexto lo permita.
- Agente de navegación supervisado: combinado con un framework de automatización (por ejemplo, Playwright), el modelo puede interpretar el estado visual de la página y sugerir la siguiente acción, aunque requiere orquestación externa.
- Moderación de contenido visual: clasificación de capturas o imágenes según criterios definidos en el prompt, aprovechando la licencia Apache 2.0 para uso comercial.
- Despliegue en edge o entornos con VRAM limitada: con cuantizaciones Q4_K_M (2,2 GB) o Q5_K_M (2,5 GB), cabe en GPUs de consumo y permite inferencia local de un modelo multimodal sin depender de la nube.
- Prototipado rápido de aplicaciones visión-lenguaje: al estar en GGUF, se puede cargar con llama.cpp u Ollama para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB con Q4_K_M, 2,5 GB con Q5_K_M, 3,7 GB con Q8_0 y 6,9 GB con f16, a lo que hay que sumar el archivo mmproj (0,9 GB en Q8_0 o 1,4 GB en f16) y el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 con mmproj Q8_0; una RTX 3060 de 12 GB o RTX 4090 permite ejecutar f16 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores, e incluso en iGPU con suficiente memoria unificada para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF y mmproj; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aegis-qwen2vl-3b-GGUF | 3,4 B | no disponible | Apache 2.0 | GGUF | Ajuste específico para browser-qa y agente visual |
| Qwen2.5-VL-3B | ~3,75 B | 32k (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base multimodal generalista |
| Qwen2.5-VL-7B | ~8 B | 32k (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Mayor capacidad, requiere más VRAM |
| InternVL2-2B | ~2 B | no disponible | Apache 2.0 | safetensors | Alternativa multimodal pequeña |

La comparativa se limita a datos públicos de los modelos base; no se dispone de benchmarks del ajuste `aegis` que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`en`); su rendimiento en castellano no está garantizado ni documentado.
- Al ser un ajuste fino sobre un modelo de 3B, la capacidad de razonamiento complejo y la precisión en tareas de agente visual son limitadas en comparación con modelos de mayor tamaño.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente al interpretar imágenes ambiguas o interfaces poco comunes.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del ajuste.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio incluye archivos mmproj separados; es necesario descargarlos junto con el GGUF principal para que la funcionalidad multimodal opere correctamente.
- No hay información sobre el contexto máximo soportado en esta cuantización, lo que puede afectar a tareas que requieran ventanas largas.

## Enlaces

- [HuggingFace: mradermacher/aegis-qwen2vl-3b-GGUF](https://huggingface.co/mradermacher/aegis-qwen2vl-3b-GGUF)
- [Modelo base: sanaX3065/aegis-qwen2vl-3b](https://huggingface.co/sanaX3065/aegis-qwen2vl-3b)
- [Cuantizaciones imatrix: mradermacher/aegis-qwen2vl-3b-i1-GGUF](https://huggingface.co/mradermacher/aegis-qwen2vl-3b-i1-GGUF)
- [Página de descargas de mradermacher para este modelo](https://hf.tst.eu/model#aegis-qwen2vl-3b-GGUF)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Análisis de tipos de cuantización de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
