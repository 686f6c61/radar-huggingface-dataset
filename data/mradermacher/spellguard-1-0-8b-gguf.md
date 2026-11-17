# mradermacher/Spellguard-1.0-8B-GGUF

## Resumen

Spellguard-1.0-8B-GGUF es la versión cuantizada en formato GGUF del modelo Spellguard-1.0-8B, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estáticas de modelos abiertos. El modelo base lo desarrolla el perfil Spellguard y cuenta con 8.190.735.360 parámetros totales, lo que lo sitúa en la categoría de modelos de aproximadamente 8B, un tamaño habitual para despliegue en hardware de consumo.

El repositorio contiene únicamente los pesos en formato GGUF (sin safetensors ni otro formato), con un tamaño total de 44,0 GB repartido entre las distintas cuantizaciones generadas: desde x-f16 hasta IQ4_XS, pasando por Q2_K, Q3_K_S/M/L, Q4_K_S/M, Q5_K_S/M, Q6_K y Q8_0. La model card del autor es extremadamente escasa: solo indica que se trata de cuantizaciones estáticas del modelo original en https://huggingface.co/Spellguard/Spellguard-1.0-8B, sin aportar información sobre arquitectura, datos de entrenamiento, licencia o idiomas.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 8B en local mediante llama.cpp u Ollama con distintos niveles de compromiso entre calidad y memoria, aunque la ausencia de documentación del modelo base limita seriamente cualquier evaluación rigurosa de sus capacidades. El tag "conversational" y "endpoints_compatible" sugiere un uso orientado a diálogo, pero no hay información verificable adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (solo cuantizaciones; el repo base no se incluye) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Spellguard-1.0-8B. Por el número de parámetros (8,19B) y el tag "conversational", es plausible que se trate de un transformer decoder-only ajustado para diálogo, pero no hay confirmación en la información proporcionada. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning.

La única información técnica disponible sobre esta publicación es el proceso de cuantización: se trata de cuantizaciones estáticas generadas con una versión de herramienta identificada como "quantize_version: 2", con "output_tensor_quantised: 1" y "convert_type: hf", lo que indica conversión desde pesos Hugging Face a GGUF. No se documentan innovaciones arquitectónicas como atención lineal, decodificación especulativa o mezcla de expertos.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere uso en diálogo multi-turno, aunque no se detallan capacidades específicas.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el formato de endpoints de Hugging Face.
- Ejecución local mediante llama.cpp/Ollama: al estar en GGUF, puede ejecutarse en CPU y GPU con las herramientas habituales del ecosistema.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local de un chatbot de propósito general: al disponer de cuantizaciones desde Q2_K hasta Q8_0, se puede ejecutar en un portátil con 8-16 GB de RAM usando Q4_K_M, aunque la calidad conversacional no está documentada.
- Prototipado rápido de asistentes conversacionales: la compatibilidad con endpoints permite integrarlo en un backend HTTP sin necesidad de infraestructura GPU dedicada, usando la cuantización Q4_K_S para minimizar requisitos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que permite medir empíricamente la degradación de calidad entre Q2_K y Q8_0 en tareas propias, algo útil para decidir el compromiso memoria/calidad antes de desplegar.
- Inferencia en entornos con restricciones de memoria: la variante Q2_K ocupa aproximadamente 3 GB, lo que permite ejecutarlo en dispositivos con 4-6 GB de RAM libre, aunque con pérdida de calidad esperable.
- Integración en pipelines de CI/CD para pruebas de humo: un modelo de 8B en Q4_K_M puede levantarse en un runner con CPU y servir para validar flujos de conversación antes de pasar a modelos mayores.
- Experimentación académica con modelos de 8B: sirve como línea base para comparar técnicas de cuantización o de prompting, siempre que se documente que la licencia y procedencia del modelo base no están claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada según tamaño de fichero GGUF típico para 8B):
  - Q2_K: ~3 GB
  - Q3_K_S: ~4 GB
  - Q4_K_S / Q4_K_M: ~5 GB
  - Q5_K_M: ~6 GB
  - Q6_K: ~7 GB
  - Q8_0: ~9 GB
  - x-f16: ~16 GB
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 3060 de 12 GB o RTX 4070 de 12 GB puede ejecutar Q4_K_M y Q5_K_M con comodidad; una RTX 4090 de 24 GB permite Q8_0 e incluso f16 con contexto moderado; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier servidor compatible con GGUF (por ejemplo, llama-cpp-python o servidores basados en llama.cpp). vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors, que no está incluido en este repo.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base, por lo que la comparativa se limita a características estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spellguard-1.0-8B-GGUF | 8,19B | no disponible | no disponible | GGUF | Sin benchmarks ni model card detallada |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community | safetensors, GGUF | Ampliamente documentado y con benchmarks públicos |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Referencia consolidada en 7-8B |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Multilingüe y con benchmarks publicados |

La comparación con Llama 3.1 8B, Mistral 7B y Qwen2.5 7B es pertinente por tamaño, pero no puede establecerse superioridad o inferioridad sin datos de evaluación del modelo Spellguard.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar riesgos de sesgo o alucinación de forma fundamentada.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en producción habría que contactar con el autor del modelo base antes de desplegarlo.
- Riesgo de alucinación: desconocido, pero inherente a cualquier modelo generativo de 8B sin evaluación publicada.
- Sesgos conocidos: no disponibles; la falta de documentación sobre el dataset de entrenamiento impide anticiparlos.
- Limitaciones de contexto e idioma: no disponibles; el tag "conversational" no especifica longitud de contexto ni cobertura lingüística.
- Procedencia dudosa del modelo base: el perfil "Spellguard" no aporta información verificable; conviene tratar el modelo con cautela en entornos sensibles.
- Solo se distribuyen pesos GGUF: no hay safetensors en este repo, lo que limita el uso con frameworks que no aceptan GGUF (vLLM, TGI) sin recurrir al repo base.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spellguard-1.0-8B-GGUF
- Modelo base: https://huggingface.co/Spellguard/Spellguard-1.0-8B
- Perfil del cuantizador: https://huggingface.co/mradermacher
