# Mykee/Qwen3.5-9B-ultra-uncensored-heretic-comfyui

## Resumen

Mykee/Qwen3.5-9B-ultra-uncensored-heretic-comfyui es un derivado de un fine-tune de la familia Qwen3.5 de 9B parámetros, publicado por el usuario Mykee. No se trata de un modelo entrenado desde cero, sino de una conversión de formato: el autor indica en la model card que "the original model has been converted to ComfyUI", es decir, que los pesos del modelo base llmfan46/Qwen3.5-9B-ultra-uncensored-heretic se han reempaquetado para poder cargarse en flujos de trabajo de ComfyUI, la interfaz de nodos orientada a generación de imagen y vídeo que en versiones recientes admite también modelos de lenguaje como nodos de texto.

El repo ocupa 18,8 GB, un tamaño coherente con pesos en bf16/fp16 de un modelo de ~9B parámetros (9B × 2 bytes ≈ 18 GB) más posibles ficheros auxiliares (tokenizador, configuración, componentes de VAE/text encoder si la conversión los incluye). El pipeline no está declarado, la licencia no aparece especificada en la información disponible y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (creada el 19 de octubre de 2026 y actualizada ese mismo día) y sin validación comunitaria.

La relevancia de esta ficha es acotada y conviene ser explícito: no hay información publicada sobre arquitectura exacta, datos de entrenamiento, benchmarks ni licencia. El nombre del modelo base sugiere un proceso de "abliteration" o eliminación de direcciones de rechazo (técnica habitual en los fine-tunes etiquetados como "uncensored" o "heretic"), pero esto es una inferencia a partir de la nomenclatura y no un dato confirmado por el autor en la información disponible. Cualquier uso en producción debería ir precedido de una evaluación propia del modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del modelo base indica familia Qwen3.5; no confirmado por el autor) |
| Parámetros totales | ~9B según la nomenclatura del nombre; no confirmado en la model card |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información del repo; el tamaño de 18,8 GB sugiere pesos en bf16/fp16 sin cuantizar |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Conversión a ComfyUI (el autor no detalla el formato exacto; presumiblemente safetensors, no confirmado) |

Otros datos del repositorio: ID Mykee/Qwen3.5-9B-ultra-uncensored-heretic-comfyui, autor Mykee, 0 descargas, 0 likes, tamaño 18,8 GB, creado el 2026-10-19 y actualizado el 2026-10-19. Etiquetas declaradas: base_model:llmfan46/Qwen3.5-9B-ultra-uncensored-heretic, base_model:finetune:llmfan46/Qwen3.5-9B-ultra-uncensored-heretic, region:us.

## Arquitectura y entrenamiento

No hay información sobre arquitectura en la información disponible. La model card se limita a dos frases: el modelo base es llmfan46/Qwen3.5-9B-ultra-uncensored-heretic y "the original model has been converted to ComfyUI". No se documenta si se trata de un transformer denso con atención estándar, qué tipo de atención utiliza, ni si incorpora mecanismos híbridos. Por la nomenclatura cabría esperar un transformer decoder-only de ~9B parámetros de la familia Qwen3.5, pero es una suposición no verificada.

Tampoco se especifican datos de entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por preferencias. El sufijo "ultra-uncensored-heretic" es característico de fine-tunes que aplican técnicas de ablación de la dirección de rechazo (abliteration) o variantes de "heretic" sobre un modelo alineado, con el objetivo de reducir las negativas del modelo a responder; sin embargo, el autor de este repo no describe el proceso, y esa descripción corresponde al autor del modelo base, cuya model card no se ha proporcionado.

La única innovación técnica documentada es la propia conversión a ComfyUI: empaquetar los pesos para que puedan cargarse desde nodos de ComfyUI. No se detalla si la conversión incluye cuantización, si mantiene el tokenizador original o si añade metadatos específicos del ecosistema ComfyUI.

## Capacidades

- Generación de texto: capacidad esperada por herencia del modelo base de ~9B parámetros; no verificada en esta publicación.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas del repo está vacío.
- Modo "thinking" o razonamiento extendido: no documentado.
- Visión o audio: no documentado; el pipeline no está declarado.
- Integración en ComfyUI: única capacidad confirmada explícitamente por el autor, que indica que el modelo ha sido convertido para su uso en ese entorno.
- Modificación del comportamiento de rechazo: sugerida por el nombre ("uncensored", "heretic"), no verificada ni cuantificada.

## Casos de uso

- Flujos de generación de imagen con prompting asistido en ComfyUI: el modelo puede emplearse como nodo de texto dentro de un grafo de ComfyUI para expandir, reescribir o estructurar prompts antes de pasarlos a un modelo de difusión. Es el caso de uso para el que el autor ha empaquetado explícitamente el modelo.
- Prototipado de asistentes conversacionales sin filtros editoriales: útil en entornos de investigación donde se necesita estudiar el comportamiento del modelo ante peticiones que un modelo alineado rechazaría, siempre con revisión humana y sin exposición a usuarios finales.
- Generación de texto creativo sin restricciones temáticas: narrativa, guiones o roleplay donde el equipo busca un modelo con menor tasa de rechazos; requiere evaluación previa porque el grado real de "uncensoring" no está medido.
- Experimentación académica sobre alineación y seguridad: comparar las respuestas de este fine-tune con las del modelo base para medir el efecto de la ablación de rechazos en tareas controladas.
- Evaluación de pipelines de ComfyUI con LLM integrado: probar la latencia y el comportamiento de nodos de lenguaje dentro de grafos que combinan texto e imagen, antes de invertir en infraestructura.
- Base para fine-tunes posteriores: al estar disponible en formato ComfyUI y con pesos completos, puede servir como punto de partida para ajustes específicos de dominio, asumiendo que la licencia debe aclararse antes de cualquier uso comercial.
- Análisis de contenido y etiquetado en dominios sensibles: clasificación o resumen de material que los modelos alineados suelen rechazar (por ejemplo, moderación de contenido), con las salvaguardas legales y organizativas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el autor remite a la página del modelo base para más información, sin que se hayan aportado esos datos. Tampoco hay mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 18-20 GB solo para pesos, más 2-6 GB de caché KV según longitud de contexto y lote; presupuesto realista de 24 GB o más. Cálculo estimado a partir de los ~9B parámetros, no publicado por el autor.
- VRAM estimada en cuantización de 8 bits: ~9-10 GB de pesos; cabe en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits (Q4_K_M): ~5-6 GB de pesos; cabe en GPUs consumer de 8-12 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en precisión completa; RTX 4090 (24 GB) o L40S (48 GB) para bf16 en un solo dispositivo; RTX 3090/4090, A10G o L4 para cuantización de 8 bits.
- GPU consumer: sí, en RTX 4090/3090 (24 GB) con bf16 y contexto corto; en RTX 4060 Ti 16 GB, 4070 Ti 16 GB o 3060 12 GB solo con cuantización de 4-8 bits.
- Apple Silicon: viable con cuantización de 4-6 bits en equipos con 16 GB o más de memoria unificada.
- Opciones de despliegue: ComfyUI es el entorno para el que el autor ha empaquetado el modelo. Para servirlo como API no hay instrucciones; en función del formato real de los pesos habría que recurrir a vLLM o TGI (si son safetensors en formato transformers), llama.cpp u Ollama (si se generan GGUF) o un script de transformers. Todo ello está por verificar, ya que el repo no documenta el formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mykee/Qwen3.5-9B-ultra-uncensored-heretic-comfyui | ~9B (según nombre) | No disponible | No disponible | HF, 0 descargas | Conversión a ComfyUI de un fine-tune "uncensored"; sin benchmarks ni documentación |
| Qwen3-8B (familia Qwen) | 8B | 32k nativo, ampliable con YaRN | Apache 2.0 | HF, ampliamente desplegado | Alternativa de referencia en tamaño similar; soporta modo thinking y tool calling |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | HF y ecosistema amplio | Buen soporte multilingüe y de tool calling; licencia con restricciones de uso |
| Mistral 7B Instruct v0.3 | 7,3B | 32k | Apache 2.0 | HF, GGUF y Ollama | Menor tamaño, licencia permisiva, muy extendido en despliegues locales |

La comparación de rendimiento con los modelos anteriores no puede establecerse porque este modelo no publica ninguna métrica. Los datos de las filas alternativas corresponden a sus respectivas documentaciones públicas; conviene verificarlos en las fuentes originales antes de tomar decisiones.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay arquitectura, contexto, idiomas, licencia ni formato de pesos confirmados; cualquier estimación de esta ficha deriva del nombre y del tamaño del repo.
- Licencia no especificada: el repo no declara licencia, lo que impide determinar si el uso comercial está permitido. El modelo base es una modificación de un modelo de la familia Qwen y arrastra las obligaciones de la licencia original, que el autor no replica aquí. No usar en producción sin aclarar este punto.
- Riesgo de contenido dañino: el nombre del modelo y de su base indica una reducción deliberada de los mecanismos de rechazo. Es esperable que genere contenido violento, sexual, ilegal o inseguro si se le solicita; no se ha medido la magnitud de ese efecto.
- Riesgo de alucinación: no evaluado. No hay benchmarks que permitan estimar la fiabilidad factual del modelo, ni del fine-tune ni de su base.
- Sesgos: no documentados. Al no publicarse composición del dataset ni proceso de alineación, no es posible caracterizar sesgos de género, raza, idioma o cultura.
- Idiomas: el campo de idiomas está vacío. No se puede asumir un buen rendimiento en castellano sin pruebas propias.
- Trazabilidad limitada: el autor del repo es un tercero distinto del autor del fine-tune y del modelo original; no hay garantía de que la conversión a ComfyUI preserve fielmente el comportamiento del modelo base.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad; no hay informes de terceros sobre calidad o estabilidad.
- Las búsquedas web realizadas no devolvieron resultados técnicos relevantes sobre el modelo; los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Mykee/Qwen3.5-9B-ultra-uncensored-heretic-comfyui
- Modelo base (fine-tune): https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic
- ComfyUI (entorno para el que se ha convertido el modelo): no se ha proporcionado enlace en la información disponible
- Paper, blog o demo del autor: no disponibles
- Nota: las búsquedas web asociadas a esta consulta no arrojaron resultados técnicos pertinentes.
