# Sapolas0730/gpt2-medium355M-transport-cc

## Resumen

El modelo `gpt2-medium355M-transport-cc` es un ajuste fino de GPT-2 medium (355 millones de parámetros) desarrollado por Sapolas0730, orientado a simular respuestas de un centro de atención al cliente de una empresa de transporte en japonés. El autor ha generado un conjunto de datos sintéticos de instrucciones y respuestas utilizando el método MAGPIE (arXiv:2406.08464) con el modelo `meta-llama/Meta-Llama-3-8B-Instruct` como generador, y ha entrenado el modelo sobre 850 pares de los 1.000 creados.

El modelo parte de la arquitectura GPT-2 medium (contexto de 1024 tokens, 24 capas, 16 cabezas de atención, dimensión de embedding 1024) y se ha optimizado para tareas de soporte al cliente en el sector del transporte. Su relevancia actual radica en ser un ejemplo práctico de cómo adaptar un modelo pequeño y eficiente a un dominio específico con datos sintéticos, aunque el autor advierte de que no es adecuado para uso en producción por la limitación de los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 medium) |
| Parametros totales | 355 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32, formato .pth) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Modified MIT (para pesos base GPT-2) + Apache 2.0 (para código de entrenamiento) |
| Formato de pesos | PyTorch state dict (`.pth`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2 medium original: un transformer decoder-only con 24 capas, 16 cabezas de atención, dimensión de modelo 1024 y un contexto máximo de 1024 tokens. El vocabulario es el de GPT-2 (50.257 tokens). La implementación no es compatible con `transformers.GPT2LMHeadModel`; el autor proporciona una clase `GPTModel` derivada del repositorio `rasbt/LLMs-from-scratch` (Apache 2.0) y requiere cargar los pesos con esa clase.

El entrenamiento se realizó con datos sintéticos generados mediante el método MAGPIE, que utiliza un modelo instructor (en este caso Llama-3-8B-Instruct) para generar pares de instrucción-respuesta a partir de un conjunto de temas. Se crearon 1.000 pares, de los cuales 850 se usaron para el fine tuning. No se especifica el número de épocas, el optimizador o la tasa de aprendizaje. El autor indica que el modelo es un experimento comparativo y que los detalles se publicarán en un artículo de Zenn (enlace pendiente).

## Capacidades

- Generación de texto en japonés orientado a diálogos de soporte al cliente en el sector del transporte (envíos, seguimiento, incidencias, reclamaciones).
- Seguimiento de instrucciones de tipo pregunta-respuesta en un formato conversacional.
- Capacidad multilingüe: solo japonés (no se entrenó para otros idiomas).
- Sin capacidades de tool calling ni agentes; se limita a generación de texto.
- No incluye modo de razonamiento extendido (thinking mode) ni funcionalidades de visión o audio.

## Casos de uso

- Prototipo de chatbot para soporte de transporte: el modelo puede generar respuestas coherentes a consultas típicas de clientes (estado de un pedido, tarifas, plazos de entrega) dentro de un contexto de 1024 tokens, útil para maquetar una demo o un MVP.
- Generación de respuestas para formación de personal: se puede utilizar como generador de ejemplos de conversación para entrenar a agentes humanos en la atención de incidencias de transporte.
- Evaluación de técnicas de fine-tuning con datos sintéticos: sirve como caso de estudio para comparar el comportamiento de modelos pequeños ajustados con datos generados por LLM frente a modelos entrenados con datos reales.
- Simulación de escenarios de soporte para pruebas de sistemas de diálogo: permite generar conversaciones sintéticas para testear pipelines de procesamiento de lenguaje natural (NLU) o sistemas de gestión de incidencias.
- Investigación sobre el fenómeno de loops de repetición en decodificación: el autor documenta que con greedy decoding se producen repeticiones, lo que lo convierte en un banco de pruebas para estudiar estrategias de sampling y mitigación de degeneración.
- Educación en fine-tuning de modelos pequeños: el repositorio incluye el código de entrenamiento y la arquitectura, lo que facilita el aprendizaje práctico de cómo adaptar GPT-2 a un dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de calidad (p. ej., BLEU, ROUGE, o evaluaciones humanas) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 355 millones de parámetros; en fp32 los pesos ocupan aproximadamente 1,4 GB. Con una entrada de contexto de 1024 tokens, el uso de VRAM en inferencia puede estar entre 2 y 3 GB (pesos + activaciones). Con cuantización a int8 (no disponible en el repositorio) se reduciría a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) puede ejecutar el modelo en fp32. En CPU también es viable, con latencias de varios segundos por token.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que cabe en GPU domésticas de gama media.
- Opciones de despliegue: al no estar en formato GGUF o safetensors, no se puede usar directamente con Ollama, llama.cpp o vLLM sin conversión previa. El autor proporciona un script de inferencia con su clase `GPTModel`. Se podría adaptar a un servidor HTTP simple o usar en Jupyter Notebook.
- Latencia y throughput: no se proporcionan datos. Para una GPU consumer, la generación de un token típicamente tomará entre 10 y 50 ms, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para atención al cliente de transporte en japonés con 355M de parámetros. Como referencia genérica, se puede comparar con el modelo base GPT-2 medium original, que no está ajustado para instrucciones y no genera respuestas de soporte. Otros modelos japoneses de tamaño similar, como `rinna/japanese-gpt2-medium` (también 355M), existen pero no se ha encontrado información suficiente en la búsqueda para establecer una comparativa directa. Se recomienda consultar el artículo de Zenn del autor cuando esté disponible.

## Limitaciones y advertencias

- Datos de entrenamiento muy limitados: solo 850 pares sintéticos, lo que puede provocar respuestas incoherentes o poco realistas en escenarios fuera de ese dominio.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con datos sintéticos, puede generar información falsa sobre tarifas, plazos o políticas de la empresa.
- Problemas de repetición: con decodificación greedy (temperature=0) se producen bucles de frases repetidas; se recomienda usar sampling con temperature y top_k.
- No apto para producción: el propio autor indica que no es adecuado para uso real; es un experimento de investigación.
- Solo japonés: no soporta otros idiomas.
- Licencia mixta: los pesos del modelo base se distribuyen bajo la Modified MIT License de OpenAI, mientras que el código de entrenamiento es Apache 2.0. La licencia `modified-mit-and-apache-2.0` es una combinación no estándar; hay que revisar los términos de la licencia de OpenAI antes de un uso comercial.
- Formato de pesos no estándar: requiere el archivo `model_arch.py` del repositorio; no es compatible con el ecosistema estándar de Hugging Face Transformers.

## Enlaces

- Modelo en Hugging Face: [Sapolas0730/gpt2-medium355M-transport-cc](https://huggingface.co/Sapolas0730/gpt2-medium355M-transport-cc)
- Paper de MAGPIE: [arXiv:2406.08464](https://arxiv.org/abs/2406.08464)
- Repositorio de código base (rasbt/LLMs-from-scratch): [https://github.com/rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch)
- Modelo base GPT-2 medium: [openai-community/gpt2-medium](https://huggingface.co/openai-community/gpt2-medium)
- Artículo Zenn del autor (enlace preparado): pendiente de publicación
