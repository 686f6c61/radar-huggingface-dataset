# Davizig10jojo/BlazerNano-V2-0.8B

## Resumen

BlazerNano-V2 es un modelo de lenguaje ultraligero de 0,8B parámetros desarrollado por Davizig10jojo, diseñado específicamente para inferencia local en dispositivos móviles sin conexión a internet. Según la model card del autor, emplea una arquitectura MoE (Mixture of Experts) con MTP (Multi-Token Prediction), aunque los metadatos de HuggingFace indican el tag `qwen3_5_text`, lo que sugiere una posible base en la familia Qwen 3.5, sin que se confirme oficialmente. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M) y safetensors, y está orientado a tareas de generación de código simple, conversación general y soporte básico de function calling en aplicaciones de inferencia local como PocketPal AI u Off Grid AI.

La relevancia de este modelo radica en su capacidad para ejecutarse en procesadores de gama media y baja (Snapdragon 662, 695) con velocidades de entre 8 y 9 tokens por segundo, lo que lo convierte en una opción viable para entornos con recursos muy limitados. Sin embargo, la información pública es escasa: no se especifican datos de entrenamiento, licencia, idiomas soportados ni benchmarks de calidad, lo que limita su evaluación rigurosa para uso profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) + MTP (según model card); tag `qwen3_5_text` en HuggingFace |
| Parametros totales | 752.393.024 (0,75B aprox., redondeado a 0,8B por el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); safetensors en BF16 |
| Idiomas soportados | no disponible (la model card está en portugués, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La model card indica una arquitectura MoE con MTP (Multi-Token Prediction), una técnica que permite predecir varios tokens futuros simultáneamente para acelerar la inferencia. Sin embargo, no se proporcionan detalles sobre el número de expertos, la dimensión del modelo o el mecanismo de enrutamiento. El tag `qwen3_5_text` en HuggingFace sugiere que el modelo podría estar basado en la arquitectura de Qwen 3.5, pero no hay confirmación oficial del autor. Tampoco se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de RLHF o DPO. La ausencia de estos datos impide evaluar la calidad del entrenamiento y su posible sesgo.

## Capacidades

- Generación de código: escribe scripts simples en Python, HTML y otros lenguajes, según la model card.
- Conversación general: responde a saludos, resuelve dudas cotidianas y mantiene diálogos básicos.
- Soporte de function calling: compatible con aplicaciones de inferencia local (como Off Grid AI) para invocar herramientas como calculadora, consulta de fecha/hora y búsquedas.
- Inferencia offline: funciona completamente sin conexión, lo que garantiza privacidad de los datos.
- Optimización para CPU: probado en procesadores móviles de gama media y baja con velocidades de 8-9 tokens/s.

## Casos de uso

- Asistente personal offline en móviles de gama baja: el modelo puede integrarse en aplicaciones tipo PocketPal AI para responder preguntas frecuentes, gestionar recordatorios o realizar cálculos simples sin conexión, aprovechando su bajo consumo de recursos y su velocidad de 8-9 tokens/s en Snapdragon 662.
- Generación de código educativo: estudiantes con dispositivos modestos pueden usarlo para practicar Python o HTML, ya que el modelo genera scripts básicos y puede ejecutarse localmente sin necesidad de hardware especializado.
- Automatización de tareas simples en entornos sin red: en zonas rurales o con conectividad limitada, el modelo puede alimentar chatbots de atención al cliente para consultas básicas (horarios, precios, información general) mediante function calling.
- Prototipado rápido de aplicaciones de chat: desarrolladores pueden integrar el modelo en apps móviles para validar conceptos de conversación antes de escalar a modelos más grandes, gracias a su formato GGUF y compatibilidad con frameworks locales.
- Asistencia en lenguajes de marcado: el modelo puede ayudar a generar fragmentos HTML o CSS simples para maquetación rápida, útil en entornos de desarrollo sin acceso a la nube.
- Pruebas de rendimiento de inferencia local: investigadores pueden usar este modelo como referencia para medir la eficiencia de motores de inferencia en CPUs móviles, dado que se han publicado datos de velocidad en dispositivos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye pruebas de velocidad de inferencia en dispositivos móviles, que se resumen a continuación:

| Dispositivo | Procesador | Prompt | Velocidad (tokens/s) |
|---|---|---|---|
| Moto G34 5G | Snapdragon 695 | "faça um simples código python" | 9,03 |
| Moto G9 Play | Snapdragon 662 | "Olá" | 8,85 |

Estos datos son orientativos y no permiten comparar la calidad del modelo con otros de su categoría.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,8B en Q4_K_M, el archivo GGUF ocupa aproximadamente 0,5-0,6 GB, por lo que puede ejecutarse en RAM de dispositivos móviles (2 GB o más) sin necesidad de GPU dedicada.
- GPU recomendadas: no requiere GPU; está optimizado para CPU. En caso de usar GPU, cualquier tarjeta con 2 GB de VRAM sería suficiente.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: llama.cpp, Ollama, PocketPal AI, Off Grid AI, o cualquier runtime compatible con GGUF. También se puede usar con safetensors mediante transformers si se dispone de memoria suficiente.
- Latencia y throughput: según las pruebas del autor, entre 8,85 y 9,03 tokens/s en CPUs móviles de gama media-baja. En hardware más potente (PC con CPU moderna) se esperan velocidades superiores, aunque no se han publicado datos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de tamaño similar (por ejemplo, Qwen2.5-0.5B, SmolLM2-0.6B o TinyLlama-1.1B). La falta de benchmarks de calidad y de especificaciones detalladas impide establecer comparaciones objetivas. Se recomienda evaluar el modelo directamente en el caso de uso previsto antes de adoptarlo.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos potenciales. El modelo podría reflejar sesgos presentes en datos no documentados.
- Riesgo de alucinacion: al ser un modelo pequeño (0,8B), es probable que presente alucinaciones frecuentes, especialmente en tareas de razonamiento complejo o generación de código extenso. No se han publicado evaluaciones de fiabilidad.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda asumir un contexto corto (probablemente 4K o menos) y no usarlo para tareas que requieran memoria a largo plazo.
- Restricciones de licencia: la licencia no está indicada, lo que impide conocer si su uso comercial está permitido. Se debe contactar al autor antes de usarlo en producción.
- Limitaciones de idioma: no se especifican idiomas soportados; la model card está en portugués, lo que sugiere un posible sesgo hacia ese idioma, pero no es concluyente.
- Caveat para producción: la falta de documentación técnica, benchmarks y licencia clara hace que este modelo no sea recomendable para entornos profesionales sin una validación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/Davizig10jojo/BlazerNano-V2-0.8B
- Repo alternativo (BlazerNano_V2): https://huggingface.co/Davizig10jojo/BlazerNano_V2
- Perfil de GitHub del autor: https://github.com/Davizig10jojo/
