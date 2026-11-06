# mustafadouli/asycuda-vision-gguf

## Resumen

asycuda-vision-gguf es un modelo conversacional distribuido en formato GGUF por el usuario mustafadouli. El repositorio contiene 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y ocupa 2,3 GB, lo que sitúa al modelo en la categoría de pequeños modelos de visión-lenguaje (VLM) cuantizados para inferencia local. El nombre sugiere una especialización en visión aplicada al dominio aduanero (ASYCUDA es el sistema de gestión aduanera promovido por la UNCTAD), aunque no se ha publicado documentación que lo confirme.

La información disponible en Hugging Face es mínima: no se especifican licencia, idiomas, pipeline ni datos de entrenamiento. El modelo está etiquetado como `endpoints_compatible` y `conversational`, lo que indica que puede servirse a través de la infraestructura de endpoints de Hugging Face y que está orientado a diálogo multi-turno. Con cero descargas y un solo "like" en el momento de la consulta, se trata de un artefacto reciente y sin validación comunitaria.

Por su tamaño y formato, el interés principal reside en la posibilidad de ejecutarlo en hardware de consumo y en su hipotética aplicación a tareas de extracción de información documental (facturas, declaraciones, documentos de transporte), un caso de uso habitual en el ámbito aduanero. No obstante, la ausencia de benchmarks, model card detallada y licencia explícita limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | no disponible |
| Etiquetas | gguf, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El nombre y las etiquetas apuntan a un modelo multimodal (visión-lenguaje) de aproximadamente 1,54 mil millones de parámetros, un orden de magnitud compatible con arquitecturas tipo Qwen2-VL-2B, SmolVLM o PaliGemma, pero no hay confirmación de que se trate de ninguna de ellas ni de que emplee un conector visual concreto (proyector MLP, cross-attention o resampler).

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de pares imagen-texto), sobre si hubo ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Procesamiento de imágenes (visión) inferido del nombre "vision", sin documentación que detalle la resolución de entrada o el número de parches por imagen.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`), lo que facilita su despliegue gestionado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Modo "thinking", audio u otras modalidades: no disponible.

## Casos de uso

- Extracción de campos en documentos aduaneros: dado el nombre del modelo, podría emplearse para leer facturas comerciales, conocimientos de embarque o declaraciones y devolver campos estructurados (valor, partida arancelaria, peso). Requiere validación previa, ya que no hay benchmarks que respalden su precisión.
- Asistente conversacional para trámites: un chatbot que responda dudas sobre procedimientos de importación/exportación apoyándose en su naturaleza conversacional y en la posibilidad de adjuntar capturas o escaneos.
- Clasificación de mercancías asistida por imagen: apoyo a la asignación de códigos del sistema armonizado a partir de fotografías de producto, siempre con revisión humana.
- Despliegue en local para prototipos: con 2,3 GB en GGUF, puede ejecutarse en portátiles con GPU modesta o incluso en CPU mediante llama.cpp/Ollama, lo que lo hace útil para pruebas de concepto sin infraestructura cloud.
- Digitalización de archivos históricos: transcripción y resumen de documentos escaneados en entornos con requisitos de soberanía del dato (procesamiento on-premise).
- Filtrado previo en pipelines documentales: como primer paso barato que descarte o etiquete documentos antes de pasarlos a un modelo mayor, reduciendo coste por página.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~1,54 B parámetros, en cuantización Q4_K_M el peso ronda 1,0-1,2 GB; en Q8_0, unos 1,6-1,7 GB; en FP16, aproximadamente 3,1 GB. El repositorio de 2,3 GB sugiere que contiene al menos una cuantización de 8 bits o varias variantes.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, L4) puede ejecutarlo con holgura; también cabe en iGPU con memoria unificada.
- GPU de consumo: sí, cabe en la mayoría de tarjetas consumer actuales e incluso en placas con 8 GB compartidos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores GGUF compatibles y los endpoints de Hugging Face (etiqueta `endpoints_compatible`). vLLM y TGI requerirían conversión a safetensors y soporte específico de la arquitectura visual, no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| asycuda-vision-gguf | ~1,54 B | no disponible | presumible, sin confirmar | no disponible | GGUF |
| SmolVLM-2B (Hugging Face) | ~2,2 B | 8k (típico) | sí | Apache 2.0 | safetensors, GGUF |
| Qwen2-VL-2B | ~2,2 B | 32k | sí | Apache 2.0 | safetensors, GGUF |
| PaliGemma-3B | ~3 B | 8k | sí | Gemma license | safetensors |

La comparación es orientativa: los tres modelos de referencia cuentan con model cards completas, benchmarks publicados y licencias claras, condiciones que asycuda-vision-gguf no cumple según la información disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, evaluación ni limitaciones conocidas.
- Licencia no especificada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Sin benchmarks: no hay evidencia pública de calidad en tareas de visión, OCR o razonamiento.
- Riesgo elevado de alucinación en extracción de campos numéricos (importes, códigos arancelarios), crítico en dominio aduanero.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano.
- Cero descargas y un solo "like": sin validación de la comunidad ni informes de terceros.
- Fecha de creación futura en los metadatos (2026-11-05), lo que puede indicar un artefacto de prueba o un error de registro.
- El nombre sugiere especialización sectorial, pero no hay evidencia de fine-tuning sobre datos aduaneros; tratarlo como modelo de propósito general pequeño es la hipótesis más prudente.

## Enlaces

- Hugging Face: https://huggingface.co/mustafadouli/asycuda-vision-gguf
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
