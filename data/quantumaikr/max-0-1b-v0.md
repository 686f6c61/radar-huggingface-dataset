# quantumaikr/max-0.1b-v0

## Resumen

M.AX-0.1B v0 es un modelo de lenguaje base de tipo decoder-only desarrollado por quantumaikr, con 109.531.392 parámetros (aproximadamente 109,5 M) y orientación prioritaria al coreano. Se distribuye bajo licencia Apache 2.0 y está pensado como punto de partida para fine-tuning en tareas industriales pequeñas: clasificación de documentos, enrutado de solicitudes, extracción de campos y rellenado de formularios. No es un modelo instruido: continúa texto y no sigue instrucciones de forma fiable.

El modelo se publica con una longitud de contexto de 1.024 tokens, un vocabulario de 32.000 entradas optimizado para coreano con dígitos separados, y pesos en safetensors (compatibles con el layout de `Qwen3ForCausalLM`) además de tres cuantizaciones GGUF para llama.cpp. Su relevancia actual reside en el segmento de modelos muy pequeños (por debajo de 150 M de parámetros) que pueden ejecutarse en CPU convencional con la cuantización Q4_K_M de 73 MB, lo que lo hace útil para despliegues en entornos con recursos limitados o en el borde.

La contrapartida es su escala de entrenamiento: solo 2,8 mil millones de tokens, lo que limita severamente el conocimiento factual y favorece la repetición y la invención de datos. Es, por tanto, una base para investigación y para fine-tuning supervisado, no un modelo listo para producción sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (layout compatible con `Qwen3ForCausalLM`) |
| Parametros totales | 109.531.392 (109,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (221 MB), Q8_0 (118 MB), Q4_K_M (73 MB); pesos originales en safetensors |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp) |
| Vocabulario | 32.000 entradas, optimizado para coreano, dígitos separados |
| Normalización de entrada | Unicode NFC |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con layout de pesos compatible con `Qwen3ForCausalLM`, lo que permite cargarlo con las clases de Transformers para modelos Qwen3. El vocabulario de 32.000 tokens está optimizado para coreano y separa los dígitos, una decisión de tokenización orientada a tareas de extracción de campos y manejo de cifras. La entrada debe normalizarse a Unicode NFC.

El entrenamiento se realizó sobre 2,8 mil millones de tokens procedentes de cuatro conjuntos públicos bajo licencia ODC-By 1.0: FineWeb-2 (subconjunto coreano), FinePDFs (subconjunto coreano), FineWeb-Edu y FineMath, todos derivados de Common Crawl. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación; se trata explícitamente de un modelo base sin ajuste de instrucciones. Los identificadores personales del texto de entrenamiento fueron enmascarados, aunque el autor advierte que los modelos pequeños pueden reproducir fragmentos de texto web.

## Capacidades

- Generación de texto por continuación: el modelo completa secuencias, no responde a instrucciones de forma fiable.
- Clasificación de tipo de documento en modo few-shot: 0,63 de precisión calibrada con n=40 antes de fine-tuning.
- Clasificación de quejas: 0,45 de precisión en la misma configuración few-shot.
- Enrutado de solicitudes: 0,28 de precisión, claramente por debajo de un umbral útil sin ajuste.
- Salida en formato JSON: tasa de parseo correcto del 0,48–0,58 en few-shot.
- Razonamiento básico de sentido común: ARC-Easy 0,43, PIQA 0,60, HellaSwag 0,29 en 0-shot.
- Comprensión del coreano: KoBEST COPA 0,56, KoBEST HellaSwag 0,32 (0,41 normalizado), KoBEST BoolQ 0,49.
- Capacidades multilingües limitadas a coreano e inglés, con claro sesgo hacia el coreano.
- No dispone de tool calling, function calling, modo thinking, visión ni audio según la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Clasificación de documentos en pipelines internos: tras un fine-tuning supervisado sobre un corpus etiquetado, el modelo puede etiquetar tipos documentales en flujos de digitalización; su tamaño de 109,5 M permite ejecutarlo en CPU y procesar lotes grandes sin GPU.
- Enrutado de solicitudes en mesas de ayuda: con ajuste específico sobre pares solicitud-destino, puede asignar tickets a colas; la precisión base de 0,28 exige fine-tuning antes de cualquier uso real.
- Extracción de campos en formularios: el vocabulario con dígitos separados y la normalización NFC facilitan el tratamiento de cifras y texto coreano, aunque el autor indica que la extracción de campos no es usable sin fine-tuning.
- Generación de borradores de texto corto en coreano: continuación de frases en herramientas de autoría o autocompletado en editores, con verificación humana obligatoria por el riesgo de invención de cifras.
- Prototipado e investigación en modelos pequeños: base para experimentos de destilación, tokenización coreana o comparativas de eficiencia en el rango de 100 M de parámetros.
- Despliegue en dispositivos con recursos mínimos: la cuantización Q4_K_M de 73 MB permite ejecución en CPU convencional mediante llama.cpp, útil para demos offline o entornos embebidos.
- Filtrado y preetiquetado de datos: uso como etiquetador débil para preanotar grandes volúmenes de texto coreano antes de una revisión humana.

## Benchmarks y rendimiento

Validación en bits per byte (menor es mejor): coreano web 0,90; documentos coreanos 0,83; inglés 1,03.

| Tarea (0-shot, n=300) | Precisión | Azar |
|---|---|---|
| ARC-Easy | 0,43 | 0,25 |
| PIQA | 0,60 | 0,50 |
| HellaSwag | 0,29 | 0,25 |
| KoBEST COPA | 0,56 | 0,50 |
| KoBEST HellaSwag | 0,32 (0,41 normalizado) | 0,25 |
| KoBEST BoolQ | 0,49 | 0,50 |

| Tarea industrial few-shot (n=40, sin fine-tuning) | Métrica |
|---|---|
| Clasificación de tipo de documento | 0,63 (calibrada) |
| Clasificación de quejas | 0,45 |
| Enrutado de solicitudes | 0,28 |
| Tasa de parseo de salida JSON | 0,48–0,58 |

No se han publicado comparativas directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: en torno a 0,22 GB de pesos más overhead de activaciones y caché KV; cabe en cualquier GPU con 1 GB o más.
- VRAM estimada en Q8_0: aproximadamente 0,12 GB de pesos; en Q4_K_M, unos 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo es viable incluso en iGPU y CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las del mercado actual (RTX 4090, RTX 3060, GTX 1650, etc.), y también en CPU.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), llama.cpp (`llama-cli`), y por los tags del repo, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; con 109,5 M de parámetros y contexto de 1.024 tokens se espera una latencia muy baja en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| M.AX-0.1B v0 | 109,5 M | 1.024 | ko, en | Apache 2.0 | safetensors, GGUF |
| Qwen3 (variantes pequeñas) | no disponible en la información | no disponible | multilingüe | no disponible | no disponible |
| Alternativas de menos de 150 M | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado solo con 2,8 mil millones de tokens: el conocimiento factual es débil y el modelo tiende a repetirse.
- Puede inventar números y hechos; su salida no debe usarse sin verificación.
- Es un modelo base: continúa texto y no sigue instrucciones de forma fiable; requiere fine-tuning para cualquier tarea.
- La extracción de campos y el resumen fiel a cifras no son usables sin ajuste previo, según el propio autor.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística limitada a coreano e inglés, con sesgo hacia el coreano; el rendimiento en inglés es notablemente peor (1,03 bits per byte frente a 0,83 en documentos coreanos).
- Aunque se enmascararon identificadores personales en el entrenamiento, los modelos pequeños pueden reproducir fragmentos de texto web; riesgo de filtración de datos de Common Crawl.
- Licencia Apache 2.0: permite uso comercial, pero los datos de entrenamiento derivan de Common Crawl y están sujetos a sus términos de uso, lo que conviene revisar antes de un despliegue comercial.
- Riesgo de sesgos heredados de los corpus web (FineWeb-2, FinePDFs, FineWeb-Edu, FineMath) sin documentación de mitigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-v0
- FineWeb-2 (Hugging Face, ODC-By 1.0): no disponible URL exacta en la información proporcionada
- FinePDFs (Hugging Face, ODC-By 1.0): no disponible URL exacta en la información proporcionada
- FineWeb-Edu (Hugging Face, ODC-By 1.0): no disponible URL exacta en la información proporcionada
- FineMath (Hugging Face, ODC-By 1.0): no disponible URL exacta en la información proporcionada
- Términos de uso de Common Crawl: no disponible URL exacta en la información proporcionada
