# mradermacher/dmb-qwen2.5-7b-flywheel-v1-GGUF

## Resumen

Esta ficha corresponde a `mradermacher/dmb-qwen2.5-7b-flywheel-v1-GGUF`, un repositorio de cuantizaciones estáticas en formato GGUF publicado por mradermacher, un perfil conocido en Hugging Face por mantener cuantizaciones de modelos ajenos. El repositorio no contiene un modelo nuevo, sino conversiones a GGUF del modelo `sanggusti/dmb-qwen2.5-7b-flywheel-v1`, que según su denominación es un derivado (fine-tune) de Qwen2.5-7B, el modelo denso de 7 mil millones de parámetros de Alibaba Cloud.

El problema que resuelve este repositorio es de accesibilidad: permite ejecutar el modelo original en hardware de consumo (portátiles, GPUs domésticas e incluso CPU), ya que GGUF es el formato nativo de llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp, Jan). El autor ofrece un abanico de cuantizaciones que va desde Q2_K (máxima compresión, mínima calidad) hasta F16 (sin pérdida), pasando por la gama intermedia Q4/Q5, habitualmente considerada el mejor equilibrio.

La ficha del modelo original no está disponible en la información proporcionada, por lo que detalles como los datos de entrenamiento, la licencia o los cambios introducidos por el fine-tune son desconocidos. El repositorio se creó en octubre de 2026 y, a fecha de la ficha, no registra descargas ni likes. Su relevancia depende del interés que suscite el modelo base de sanggusti; para evaluarlo conviene consultar directamente su repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen2.5, inferido del nombre; no confirmado en la ficha) |
| Parametros totales | ~7B (según denominación del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B soporta 32.768 tokens, ampliables a 128K con YaRN) |
| Tipos de cuantizacion | F16 (x-f16), Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (la familia Qwen2.5 declara soporte oficial para más de 29 idiomas) |
| Licencia | No disponible (el modelo base Qwen2.5-7B se publica bajo Apache 2.0; debe verificarse la licencia del fine-tune) |
| Formato de pesos | GGUF (convertido desde Hugging Face, tipo de conversión `hf`) |

## Arquitectura y entrenamiento

El modelo original, `sanggusti/dmb-qwen2.5-7b-flywheel-v1`, es, según su nombre, un ajuste sobre Qwen2.5-7B. La familia Qwen2.5 emplea una arquitectura transformer decoder densa con atención agrupada de consultas (GQA), activaciones SwiGLU, codificación posicional RoPE y normalización QK-Norm. El modelo base Qwen2.5-7B fue preentrenado con aproximadamente 18 billones de tokens (18 × 10¹²) y la variante Instruct pasó además por entrenamiento supervisado y DPO/RLHF. Estos datos corresponden al modelo base; no hay información sobre si el fine-tune modifica la arquitectura o el contexto.

Sobre el proceso de entrenamiento del fine-tune no hay datos disponibles: ni el número de tokens adicionales, ni la composición del dataset, ni el método empleado (SFT, DPO, RLHF). El término "flywheel" en el nombre sugiere un esquema de entrenamiento iterativo o auto-mejora, pero es una hipótesis que no puede confirmarse con la información proporcionada. Tampoco se dispone de la model card del autor original.

En cuanto al repositorio GGUF en sí, mradermacher realiza cuantizaciones estáticas (conversión directa de los pesos a cada formato K-quant e I-quant de llama.cpp), según los metadatos internos con tipo de conversión `hf` y cuantización de todos los tensores de salida. No se trata de cuantizaciones dinámicas (imatrix), a diferencia de otros repositorios del mismo autor que usan la variante `-i1`.

## Capacidades

Las capacidades dependen del fine-tune de sanggusti, cuya documentación no está disponible. Por herencia del modelo base Qwen2.5-7B (si el fine-tune no degrada estas habilidades), cabe esperar:

- Generación de texto general, redacción y resumen en múltiples idiomas.
- Razonamiento matemático y resolución de problemas de nivel GSM8K/MATH en el modelo base.
- Generación y comprensión de código (Qwen2.5-7B-Instruct puntúa 79,1 en HumanEval según la ficha oficial de Qwen, dato no confirmado para este derivado).
- Soporte de tool calling / function calling en la variante Instruct de Qwen2.5, aunque no está confirmado que el fine-tune lo conserve.
- Capacidades multilingües (más de 29 idiomas según Qwen, incluido el castellano).
- Ventana de contexto larga (32.768 tokens en el modelo base), útil para RAG y documentos extensos.
- No hay evidencia de capacidades multimodales (visión o audio); el repositorio no incluye archivo `mmproj`, lo que indica que no se trata de un modelo visión-lenguaje.

## Casos de uso

- Chatbot local y privado: ejecutando la cuantización Q4_K_M en una GPU de consumo con Ollama o LM Studio se puede montar un asistente conversacional sin enviar datos a terceros, adecuado para entornos con requisitos de confidencialidad.
- Asistente de código offline: si el fine-tune conserva las habilidades de código de Qwen2.5-7B, puede integrarse en editores locales (por ejemplo, mediante extensiones compatibles con Ollama) para autocompletado y explicación de código sin conexión.
- Experimentación con cuantización: al ofrecer once formatos distintos (de Q2_K a F16), el repositorio es útil para comparar en la práctica la degradación de calidad de cada esquema de cuantización sobre el mismo modelo.
- RAG sobre documentación privada: la ventana de contexto del modelo base (32.768 tokens) permite combinar el modelo con sistemas de recuperación para consultar manuales técnicos o bases de conocimiento internas en local.
- Prototipado de agentes: con llama.cpp y su soporte de function calling, puede servir de base para agentes de varios pasos en entornos de desarrollo, siempre que el fine-tune conserve esa capacidad.
- Inferencia en CPU o equipos modestos: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en portátiles sin GPU dedicada (con 8 GB de RAM), a cambio de una pérdida de calidad notable.
- Evaluación de fine-tunes comunitarios: útil para investigadores que quieran probar rápidamente el trabajo de sanggusti sin descargar los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF se limita a enlazar el modelo original y listar las cuantizaciones, y no se ha encontrado documentación del fine-tune con evaluaciones (MMLU, HumanEval, GSM8K u otras). No se inventarán cifras.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas para un modelo denso de ~7B en GGUF; los tamaños exactos de archivo no están disponibles en la información proporcionada. Añadir siempre margen para la caché KV y el overhead del runtime.

- VRAM estimada para inferencia (solo pesos):
  - Q2_K: ~3 GB
  - Q3_K_M: ~3,5-4 GB
  - Q4_K_M / IQ4_XS: ~4,2-4,7 GB
  - Q5_K_M: ~5,4 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8 GB
  - F16: ~15 GB
- GPUs recomendadas:
  - Q4/Q5: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090/4090 con holgura para contexto largo.
  - Q8_0: RTX 4070 Super 12 GB o superior.
  - F16: RTX 3090/4090 (24 GB) o A100/H100 si se busca servir a varios usuarios.
- Consumer GPUs: las cuantizaciones de 3 y 4 bits caben cómodamente en GPUs de 6-8 GB (RTX 3060 Ti, RTX 4060); Q8_0 requiere 10-12 GB; F16 no cabe en la mayoría de tarjetas domésticas.
- Apple Silicon: los Mac con memoria unificada (M1/M2/M3/M4 con 16 GB o más) ejecutan bien las cuantizaciones Q4-Q8 vía llama.cpp con backend Metal.
- CPU: viable con AVX2; para Q4_K_M se recomiendan al menos 8 GB de RAM libres; la velocidad será de pocos tokens/s en equipos domésticos.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, Jan, text-generation-webui. vLLM y TGI están orientados a pesos safetensors y no son la vía habitual para GGUF.
- Latencia y throughput: no disponibles; como referencia orientativa, una GPU de consumo moderna con Q4_K_M suele alcanzar decenas de tokens/s en generación para modelos de 7B.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|---|
| dmb-qwen2.5-7b-flywheel-v1-GGUF (este) | ~7B | GGUF | No disponible (base: 32.768) | 11 variantes estáticas (Q2_K a F16) | No disponible | Fine-tune comunitario de Qwen2.5-7B sin model card |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | Safetensors | 32.768 (128K con YaRN) | No aplica (original) | Apache 2.0 | Modelo base de referencia, con benchmarks publicados y tool calling |
| mradermacher/Qwen2.5-7B-Instruct-Uncensored-Flux-i1-GGUF | ~7B | GGUF | 32.768 (base) | Cuantizaciones dinámicas (i1, con imatrix) | Según modelo base | Variante sin censura del mismo autor; cuantizaciones dinámicas suelen ofrecer mejor calidad por tamaño |
| mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF | ~7B | GGUF (multimodal) | No disponible | Estáticas | Según modelo base | Añade comprensión de imágenes (VL) y es una versión "abliterated"; alternativa si se necesita visión |

## Limitaciones y advertencias

- Ausencia de model card del fine-tune: no se conocen los datos de entrenamiento, el método de ajuste ni la intención del autor (el significado de "dmb" y "flywheel" no está documentado en la información disponible), lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinación: como todo modelo de ~7B, puede generar información falsa con apariencia plausible; no debe usarse como fuente de verdad sin verificación.
- Sesgos: hereda potencialmente los sesgos del corpus de preentrenamiento de Qwen2.5 y añade los del fine-tune, cuya naturaleza se desconoce.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan de forma apreciable la calidad de razonamiento y la generación en idiomas distintos del inglés; para producción se recomienda Q4_K_M o superior.
- Licencia sin confirmar: aunque Qwen2.5-7B es Apache 2.0, la licencia del derivado de sanggusti no consta en la información disponible; verifíquela antes de cualquier uso comercial.
- Contexto y memoria: la caché KV crece con la longitud del contexto; con 32.768 tokens los requisitos de VRAM/RAM aumentan significativamente sobre las cifras de solo pesos.
- Sin multimodalidad: no procesa imágenes ni audio; para visión habría que acudir a variantes Qwen2.5-VL.
- Procedencia y seguridad: al tratarse de un fine-tune comunitario redistribuido por terceros, conviene auditar el modelo antes de desplegarlo en producción.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/dmb-qwen2.5-7b-flywheel-v1-GGUF
- Modelo original cuantizado: https://huggingface.co/sanggusti/dmb-qwen2.5-7b-flywheel-v1
- Referencia del ecosistema (resultados de la búsqueda web):
  - https://huggingface.co/mradermacher/Qwen2.5-7B-Instruct-Uncensored-Flux-i1-GGUF
  - https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF
  - https://www.aimodels.fyi/models/compare/qwen2.5-vl-7b-instruct-abliterated-gguf-mradermacher-vs-qwen3.8-27b-obliterated-gguf-mradermacher
- Modelo base de la familia (referencia externa): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
