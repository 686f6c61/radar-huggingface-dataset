# CryptoGod97/meddroid-v9-lora

## Resumen

MedDroid-v9-lora es un adaptador LoRA publicado por el usuario CryptoGod97 sobre el modelo médico multimodal google/medgemma-4b-it. Se distribuye como un repositorio PEFT de aproximadamente 0,1 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo base completo. Su función es permitir que el modelo MedDroid-v9 (publicado aparte en formato GGUF) pueda seguir afinándose, por ejemplo en el contexto de un hackathon, sin necesidad de reentrenar desde cero el modelo base.

El adaptador se ha entrenado con LoRA de rango 8 aplicado exclusivamente a las capas de lenguaje, manteniendo congelada la torre de visión del modelo base. Esta decisión reduce el coste computacional del ajuste y preserva las capacidades visuales originales de MedGemma-4B-it, mientras se especializa la parte textual para tareas de apoyo a la decisión clínica.

Es relevante ahora porque ejemplifica la tendencia de publicar adaptadores ligeros sobre modelos médicos abiertos, lo que abarata el ajuste fino y facilita la experimentación por parte de desarrolladores e investigadores. No obstante, su licencia derivada de los términos Health AI Developer Foundations de Google y la restricción de uso comercial impuesta por el autor limitan su aplicación fuera del ámbito de investigación y formación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal MedGemma-4B-it; adaptador r=8 en capas de lenguaje, torre de visión congelada |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base MedGemma-4B-it tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el modelo base se carga en 4 bits con Unsloth (load_in_4bit=True). El modelo derivado MedDroid-v9 se publica en GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | health-ai-developer-foundations (términos de Google Health AI Developer Foundations); uso no comercial libre, uso comercial requiere permiso de MedDroid |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/medgemma-4b-it, un transformer multimodal de 4.000 millones de parámetros orientado a tareas médicas. El ajuste emplea LoRA con rango 8 aplicado únicamente a las capas del modelo de lenguaje, mientras que la torre de visión permanece congelada. El entrenamiento se realizó sobre una copia cuantizada a 4 bits del modelo base gestionada con Unsloth, lo que permite cargar el adaptador con `FastModel.from_pretrained("CryptoGod97/meddroid-v9-lora", load_in_4bit=True)`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El propósito declarado del adaptador es servir de base para un ajuste posterior dentro del hackathon MedDroid-v9, por lo que su entrenamiento parece orientado a especializar la generación textual médica sin alterar la percepción visual.

## Capacidades

- Generación de texto especializada en dominio médico a partir del modelo base MedGemma-4B-it.
- Capacidades multimodales heredadas del modelo base (procesamiento de imágenes médicas), aunque la torre de visión no se ha ajustado.
- Razonamiento clínico y apoyo a la decisión para personal sanitario cualificado, según la model card.
- Ajuste fino adicional: el adaptador está pensado para seguir entrenándose con PEFT/Unsloth.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación académica en NLP médico: el adaptador permite reproducir y extender experimentos de ajuste fino sobre MedGemma-4B-it con un coste de cómputo reducido, al entrenar solo las capas de lenguaje con LoRA r=8.
- Hackathons y prototipado rápido: al publicarse explícitamente para el hackathon MedDroid-v9, sirve como punto de partida para que equipos desarrollen variantes especializadas en pocas horas con Unsloth en 4 bits.
- Apoyo a la decisión clínica en entornos de investigación: la model card lo describe como herramienta de soporte para médicos cualificados, no como dispositivo de diagnóstico, por lo que encaja en estudios piloto supervisados.
- Ajuste fino sobre subdominios médicos: investigadores pueden aplicar un segundo LoRA o continuar el entrenamiento sobre especialidades concretas (radiología, dermatología) manteniendo la torre de visión congelada.
- Evaluación comparativa de adaptadores médicos: sirve como referencia para medir el impacto de LoRA r=8 frente a ajustes completos en tareas de generación clínica.
- Formación y docencia: al ser de uso educativo, puede emplearse en cursos sobre ajuste fino de modelos médicos multimodales y despliegue con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al cargar el modelo base en 4 bits con Unsloth, se estima un consumo en torno a 3-4 GB para los pesos, más overhead de activaciones y contexto; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base, una GPU consumer con 8-12 GB de VRAM podría ser suficiente en 4 bits.
- Cabe en GPU consumer: probablemente sí en modelos como RTX 3060 12 GB, RTX 4070 o superiores, aunque no se confirma en la documentación.
- Opciones de despliegue: Unsloth (método indicado en la model card); el modelo derivado MedDroid-v9 está disponible en GGUF, lo que sugiere compatibilidad con llama.cpp y Ollama. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedDroid-v9-lora | Adaptador sobre 4B | No disponible | Health AI Developer Foundations (no comercial sin permiso) | safetensors (PEFT) | Ajuste LoRA r=8 solo en capas de lenguaje |
| google/medgemma-4b-it | 4B | No disponible | Health AI Developer Foundations | safetensors | Modelo base multimodal médico de Google |
| MedDroid-v9 | 4B (derivado) | No disponible | Health AI Developer Foundations | GGUF | Versión empaquetada del adaptador para inferencia |

## Limitaciones y advertencias

- No es un dispositivo médico: la model card indica explícitamente que es solo para uso educativo y soporte a la decisión de médicos cualificados, no para diagnóstico.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente crítico en dominio clínico.
- Sesgos conocidos: no se documentan en la información proporcionada; hereda los del modelo base MedGemma-4B-it.
- Limitación de idioma: solo inglés, lo que restringe su uso en entornos hispanohablantes.
- Restricciones de licencia: los términos Health AI Developer Foundations de Google aplican al modelo base; el uso comercial de las aportaciones de MedDroid requiere permiso expreso (support@medicalandroid.com).
- Contexto: no se especifica la longitud de ventana, lo que impide evaluar su idoneidad para documentos clínicos largos.
- Madurez: con 41 descargas y 0 likes, es un artefacto reciente y poco validado por la comunidad.
- Torre de visión congelada: las capacidades visuales no se han especializado, por lo que el rendimiento en imágenes médicas depende íntegramente del modelo base.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/CryptoGod97/meddroid-v9-lora
- Modelo derivado en GGUF: https://huggingface.co/CryptoGod97/meddroid-v9
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
