# DollarCoderX/Air-nano

## Resumen

Air Nano es un modelo de lenguaje conversacional de primera generación desarrollado por Air Intelligence, una empresa de IA independiente fundada por Ejiro Praise, un desarrollador nigeriano que estudia ingeniería mecatrónica en la Universidad Bowen. Se publica bajo licencia Apache 2.0 y está orientado a conversación general, asistencia de código, lluvia de ideas y razonamiento ligero. El modelo se presenta como un asistente tranquilo, observador y práctico, que reconoce la incertidumbre y no se limita a ser una máquina de decir que sí. Según la información de HuggingFace, se trata de un modelo basado en la arquitectura Qwen2, con 3.085.938.688 parámetros y un tamaño de repositorio de 6,2 GB. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2, según etiquetas de HuggingFace) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Air Nano es un modelo de lenguaje basado en transformer dentro de la familia Qwen2, según las etiquetas del repositorio de HuggingFace. El número total de parámetros es de 3.085.938.688, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 3B). No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o la aplicación de técnicas de alineación (RLHF, DPO). La documentación del autor indica que es un modelo conversacional de primera generación, con un comportamiento diseñado para ser calmado, observador y honesto sobre sus límites, pero no aporta detalles técnicos adicionales.

## Capacidades

- Generación de texto conversacional en inglés, con un estilo tranquilo y observador.
- Asistencia en tareas de codificación, aunque el autor advierte de errores en tareas complejas.
- Lluvia de ideas y apoyo en tareas de razonamiento ligero.
- Capacidad de participar en escenarios de roleplay y mostrar humor seco, según el modelo card.
- Compromiso con la honestidad: el modelo puede expresar incertidumbre en lugar de adivinar con seguridad.
- No se menciona soporte de tool calling, function calling, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

1. Asistente conversacional local para aplicaciones de escritorio: dado su tamaño reducido, puede integrarse en herramientas de productividad personales para responder preguntas, redactar textos o mantener conversaciones fluidas en inglés.
2. Prototipado de chatbots: el modelo puede usarse como base para desarrollar asistentes de soporte en entornos controlados, aprovechando su capacidad para mantener conversaciones naturales sin necesidad de infraestructura de gran escala.
3. Ayuda con código en proyectos pequeños: puede asistir a programadores en la generación de fragmentos de código, explicaciones de funciones o depuración básica, siempre verificando los resultados.
4. Generación de ideas y lluvia de ideas creativa: el modelo puede proponer enfoques alternativos o listas de ideas en procesos de diseño, gracias a su capacidad de diálogo abierto.
5. Simulación de personajes o juegos de rol: su habilidad declarada para participar en escenarios ficticios permite utilizarlo en aplicaciones de entretenimiento narrativo.
6. Entornos educativos de nivel introductorio: puede emplearse como tutor conversacional para practicar inglés técnico o conceptos básicos de programación, aunque se requiere supervisión por su tendencia a errar en tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Por tanto, no es posible evaluar su rendimiento comparativo en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se proporcionan especificaciones oficiales de hardware. A partir del tamaño de los pesos en safetensors (6,2 GB), puede estimarse lo siguiente:

- Para inferencia con precisión FP16 se requiere una GPU con al menos 8 GB de VRAM, incluyendo overhead de runtime.
- Con cuantización 4-bit (sin datos oficiales de cuantización disponibles), el modelo podría ejecutarse en GPUs de consumo con 4-6 GB de VRAM.
- El tamaño de los pesos (3.085.938.688 parámetros) sugiere que es un modelo ligero, adecuado para inferencia en una sola GPU.
- Las opciones de despliegue no están documentadas. Plataformas genéricas como llama.cpp, Ollama o vLLM podrían ser compatibles, pero no hay confirmación oficial.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados. El modelo pertenece a la familia Qwen2, por lo que podría compararse con otros modelos de esa serie, pero no hay datos publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El autor indica que es un modelo de primera generación que puede cometer errores, especialmente en razonamiento complejo o tareas técnicas.
- No debe tratarse su salida como hecho verificado sin comprobación independiente.
- El modelo está diseñado para mayores de 13 años y no para niños menores de esa edad.
- Los términos de uso prohíben generar contenido ilegal, acosar o suplantar a personas reales.
- No hay información sobre sesgos específicos ni medidas de mitigación.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/DollarCoderX/Air-nano
- Versión v0.1 en HuggingFace: https://huggingface.co/DollarCoderX/air-nano-v0.1
- GitHub Air-Agent: https://github.com/DollarCoderX/Air-Agent
