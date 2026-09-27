# ehab215/DR-AI-V2

## Resumen

DR-AI-V2 es un asistente médico conversacional de 4B parámetros publicado por el usuario ehab215 en HuggingFace, construido como un ajuste fino en dos etapas de google/medgemma-4b-it, que a su vez deriva de Gemma-3 4B de Google. El modelo está orientado a preguntas y respuestas médicas informativas en árabe egipcio y en inglés, con un sesgo claro hacia el dialecto egipcio, y se distribuye como pesos ya fusionados: los dos adaptadores LoRA del entrenamiento están integrados en los pesos base, por lo que no requiere PEFT ni el modelo original en tiempo de inferencia. El repositorio ocupa 8,6 GB y contiene 4.300.079.472 parámetros en bfloat16.

La arquitectura subyacente es Gemma3ForConditionalGeneration, el mismo grafo multimodal imagen-texto de Gemma 3, aunque el autor indica explícitamente que la torre de visión no se ha utilizado ni ajustado: el modelo funciona como un generador de texto puro. La ventana de contexto de la arquitectura es de 131.072 tokens, pero el ajuste fino se realizó con 1.024 tokens como máximo (system + user + assistant), y el propio autor recomienda mantener prompts e historial dentro de ese rango para un comportamiento correcto.

Su relevancia es doble: por un lado cubre un hueco poco poblado, el de asistentes médicos conversacionales en árabe dialectal, donde la mayoría de modelos abiertos rinden mejor en árabe estándar moderno (MSA) que en variantes coloquiales; por otro, demuestra un flujo de trabajo reproducible de adaptación de dominio más ajuste por instrucciones sobre un modelo médico ya especializado. La model card advierte de que el proyecto no está terminado ("NOT COMPLETE YET") y de que no es un dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (transformer multimodal de Gemma 3; torre de visión no utilizada) |
| Parametros totales | 4.300.079.472 (~4,3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en arquitectura; ajuste fino a 1.024 tokens; uso recomendado dentro de ~1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en bfloat16; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | árabe (ar, con sesgo a egipcio) e inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bfloat16), cargables con transformers |
| Tokenizer | Gemma, vocabulario de 262.208 entradas |
| Precisión de referencia | bfloat16 |
| Plantilla de chat | plantilla de chat de Gemma-3 (system / user / assistant) |
| Parámetros de generación recomendados | temperature=0.7, top_p=0.95, repetition_penalty=1.05, max_new_tokens=512 |
| Modelo base | google/medgemma-4b-it |
| Repositorio | 8,6 GB |

## Arquitectura y entrenamiento

El modelo parte de MedGemma 4B, la variante médica de Gemma 3 4B, y conserva su arquitectura de transformer decoder con atención completa sobre una ventana teórica de 131.072 tokens. El autor indica que la torre de visión permanece sin usar: aunque la clase del modelo es condicional multimodal, todo el entrenamiento y el uso previsto son de texto. Sobre esa base se aplicó un ajuste en dos etapas con LoRA de rango 64 y alpha 128, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo base, de ahí que el repositorio sea autocontenido.

La primera etapa (publicada por separado como DR-AI-V1) consistió en continued pre-training sobre aproximadamente 1,1 millones de documentos en árabe, árabe egipcio y material médico, con el objetivo de adaptar el modelo al dominio clínico y al dialecto. La segunda etapa, que corresponde a este repositorio, fue un ajuste por instrucciones supervisado (SFT) sobre unas 155.000 parejas instrucción/respuesta en egipcio, MSA e inglés médico, con la pérdida calculada únicamente sobre el turno del asistente (el prompt se enmascara a -100). El entrenamiento se hizo en bf16 sobre una A100 de 80 GB, durante 3 épocas, con learning rate 1e-4, scheduler coseno con un 3% de warmup y batch efectivo de 32. El checkpoint publicado corresponde al mejor superviviente de la etapa 2 (step 12.600).

En cuanto a métricas de entrenamiento, el autor reporta que la perplejidad de validación de la etapa 1 bajó de 13,0 a 3,29 (una mejora de 3,95×) y que la mejor pérdida de validación enmascarada de la etapa 2 fue de aproximadamente 1,92. No se aplicó RLHF ni DPO: el modelo es únicamente instruction-tuned.

## Capacidades

- Generación de texto conversacional con rol de asistente médico ("Dr. AI"), con respuestas multi-turno siguiendo la plantilla de chat de Gemma-3.
- Preguntas y respuestas médicas informativas en árabe egipcio, árabe estándar moderno e inglés, incluyendo explicaciones de conceptos clínicos (por ejemplo, la diferencia entre presión arterial sistólica y diastólica).
- Orientación tipo triaje: el modelo está entrenado para sugerir la consulta con un especialista ante cuadros que lo requieran, según declara el autor.
- Capacidad multilingüe limitada a dos idiomas (ar, en), con predominio del dialecto egipcio frente a otras variantes del árabe.
- No se documenta soporte de tool calling o function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso estructurado.
- No hay modo "thinking", ni entrada de audio, ni uso efectivo de visión en esta versión (la torre de imagen está presente en los pesos pero no se ajustó ni se emplea).
- No se documentan capacidades destacadas de generación de código o matemáticas; son capacidades heredadas del modelo base, no verificadas en la información disponible.

## Casos de uso

- Triaje conversacional preliminar en árabe egipcio: el modelo puede mantener un diálogo con un paciente que describe síntomas en dialecto y devolver una orientación general sobre el nivel de urgencia y la conveniencia de acudir a un especialista, con la advertencia de que la decisión clínica final es humana.
- Educación sanitaria para pacientes arabófonos: explicar en lenguaje sencillo qué es la hipertensión, cómo se interpretan las cifras de presión arterial o para qué sirve un análisis concreto, aprovechando el ajuste en árabe coloquial.
- Apoyo a la formación de personal sanitario: generar material de repaso y preguntas de autoevaluación en árabe e inglés sobre conceptos médicos generales, útil en contextos donde el material formativo abunda en inglés pero el alumnado trabaja en egipcio.
- Pre-traducción y adaptación de contenido médico: convertir folletos o instrucciones redactadas en inglés a un registro en árabe egipcio comprensible para población general, con revisión posterior por un profesional sanitario.
- Prototipado de asistentes clínicos en investigación: servir como modelo de referencia de 4B con licencia Gemma para experimentos académicos sobre adaptación dialectal, comparando su comportamiento con MedGemma 4B sin ajustar.
- Chatbot de información para clínicas y farmacias: responder preguntas frecuentes no diagnósticas (horarios de medicación, diferencias entre presentaciones de un fármaco, preparación previa a una prueba) en un canal de atención al paciente, con derivación a personal humano en cualquier caso clínico.
- Generación de historiales o resúmenes sintéticos para pruebas de software: crear conversaciones médico-paciente ficticias en árabe egipcio para validar sistemas de triaje automático o de registro clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas tipo MMLU, MedQA, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Los únicos datos numéricos aportados son métricas internas de entrenamiento, recogidas en la tabla siguiente.

| Métrica | Valor | Contexto |
|---|---|---|
| Perplejidad de validación (etapa 1, CPT) | 13,0 → 3,29 | Mejora de 3,95× sobre el modelo de partida |
| Pérdida de validación enmascarada (etapa 2, SFT) | ≈ 1,92 (mejor checkpoint) | Loss calculada solo sobre el turno del asistente |
| Checkpoint publicado | step 12.600 | Mejor checkpoint superviviente de la etapa 2 |
| Épocas de SFT | 3 | Learning rate 1e-4, coseno con 3% de warmup, batch efectivo 32 |

## Requisitos de hardware

- VRAM para inferencia en bfloat16: los pesos ocupan aproximadamente 8,6 GB, por lo que se necesitan del orden de 10-12 GB de VRAM en total contando caché KV y activaciones para contextos de ~1.024 tokens. Cifras estimadas a partir del tamaño de parámetros publicado, no medidas por el autor.
- GPU recomendadas: A100 80 GB o H100 para entrenamiento y para servir el modelo sin límites de contexto; RTX 4090, RTX 3090, L40S o A10G para inferencia en bf16.
- GPU de consumo: cabe en tarjetas de 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090) en bfloat16 con contextos cortos. En tarjetas de 8-12 GB sería necesario cuantizar a 8 o 4 bits, algo que el autor no distribuye y habría que generar.
- Despliegue: la model card incluye un ejemplo con transformers y `AutoModelForCausalLM`; el repositorio está etiquetado como compatible con text-generation-inference y endpoints. vLLM es una opción razonable por soportar la familia Gemma 3. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión que no se proporciona.
- Detalle de implementación: la plantilla de chat de Gemma 3 devuelve `token_type_ids`, que en el ejemplo del autor se elimina antes de generar (`inputs.pop("token_type_ids", None)`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ehab215/DR-AI-V2 | ~4,3B | 131.072 en arquitectura, 1.024 en ajuste fino | árabe egipcio, MSA, inglés | CPT + SFT con LoRA fusionado, sin RLHF | Gemma Terms of Use | HuggingFace, pesos safetensors bf16, 5 descargas |
| google/medgemma-4b-it | ~4B | 128.000 (arquitectura, uso multimodal texto-imagen) | principalmente inglés | instruction-tuned médico de Google | Gemma Terms of Use | HuggingFace, ampliamente distribuido |
| ehab215/DR-AI-V1 | ~4,3B | 131.072 en arquitectura; etapa CPT | árabe egipcio, MSA, inglés | solo continued pre-training (etapa 1) | Gemma Terms of Use | HuggingFace, adaptadores LoRA de la etapa 1 |

Frente a MedGemma 4B original, DR-AI-V2 aporta adaptación explícita al árabe egipcio y un formato conversacional de asistente médico, a cambio de perder el uso efectivo de visión y de reducir drásticamente la ventana de contexto práctica. Frente a DR-AI-V1, añade la etapa de instrucciones y la fusión de los adaptadores, lo que simplifica el despliegue. No se dispone de datos verificados de benchmarks que permitan comparar calidad clínica con ninguno de los dos, ni con asistentes médicos árabes de otros autores.

## Limitaciones y advertencias

- No es un dispositivo médico: el propio autor prohíbe su uso para diagnóstico o decisiones de tratamiento y exige revisión por un clínico cualificado.
- Riesgo elevado de alucinación: en dominios clínicos, una respuesta inventada sobre dosis, interacciones farmacológicas o síntomas de alarma puede causar daño; no hay datos de benchmarks que acoten la tasa de error.
- Sesgo dialectal: el árabe del modelo está inclinado hacia el egipcio, por lo que puede rendir peor en árabe levantino, del Golfo o magrebí, y mezclar registro coloquial y MSA en respuestas formales.
- Ventana de contexto efectiva de 1.024 tokens: el ajuste fino no cubrió los 131.072 tokens teóricos de la arquitectura, de modo que historiales conversacionales largos provocarán degradación del comportamiento.
- Ausencia de RLHF o DPO: el alineamiento se limita al SFT, lo que reduce el control sobre respuestas inseguras, evasivas o fuera de rol ante peticiones adversarias.
- Estado incompleto: la model card se titula explícitamente "NOT COMPLETE YET", y el modelo tiene 5 descargas y 0 likes, sin validación externa conocida.
- Licencia Gemma Terms of Use: impone obligaciones de uso aceptable y condiciones específicas para uso comercial y redistribución, incluida la necesidad de mantener los avisos de licencia; conviene revisar los términos antes de integrarlo en un producto.
- Repositorio de gran tamaño (8,6 GB) sin cuantizaciones oficiales, lo que complica el despliegue en entornos con VRAM limitada.
- Idiomas limitados a árabe e inglés: no hay soporte declarado de castellano ni de otras lenguas.
- Torre de visión presente pero no ajustada: enviar imágenes puede producir salidas no fiables, ya que esa capacidad no fue entrenada en ninguna de las dos etapas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ehab215/DR-AI-V2
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Etapa 1 (continued pre-training): https://huggingface.co/ehab215/DR-AI-V1
- Repositorio GitHub del proyecto: https://github.com/ehab215/Dr.-AI
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
