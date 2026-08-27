# qvx-o/reFLEX-v1-15M

## Resumen

reFLEX-v1-15M es un modelo de lenguaje conversacional experimental desarrollado por Qarvexium (qvx-o), una organización independiente de investigación en IA. Su nombre responde a las siglas *Responsive Flexible Learning and EXperience* y propone una arquitectura modular que se aleja del paradigma convencional de "todo es atención" en los transformers. En lugar de que un único modelo de lenguaje genere toda la respuesta, reFLEX separa el proceso conversacional en tres componentes: **Main** (red principal de generación, ~14M parámetros), **Experience** (componente ligero de recuperación/contexto, ~0.8M) e **Intent** (interpretación de la entrada, ~0.2M), sumando aproximadamente 15M parámetros en total.

El modelo está diseñado específicamente para conversación, no para conocimiento factual, y fue entrenado con datos de estilo conversacional en lugar de un corpus enciclopédico. Su relevancia radica en ser un banco de pruebas para estudiar arquitecturas modulares de lenguaje, sistemas de recuperación asistida por experiencia y el comportamiento emergente de modelos muy pequeños. A pesar de su tamaño reducido, muestra respuestas conversacionales sorprendentemente naturales y reacciones diferenciadas según el tono social de la entrada, lo que lo convierte en un objeto de estudio interesante para la investigación en IA. No se dispone de información sobre la longitud de contexto ni otros detalles técnicos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer modular con componentes Main, Experience e Intent |
| Parametros totales | ~15M (Main ~14M, Experience ~0.8M, Intent ~0.2M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

reFLEX introduce una arquitectura modular en la que el flujo de procesamiento pasa primero por el componente **Intent**, que interpreta la naturaleza de la entrada, luego por **Experience**, que recupera información potencialmente útil de experiencias previas, y finalmente por **Main**, el modelo de lenguaje principal que genera la respuesta. Esta separación permite que componentes muy pequeños (0.2M y 0.8M) influyan en la generación sin necesidad de que todo el sistema sea un gran transformer atencional. El componente Experience actúa como un mecanismo de recuperación contextual que puede alterar sustancialmente la respuesta generada, aunque no garantiza corrección factual.

El entrenamiento se realizó con datos de estilo conversacional, no con un corpus factual extenso. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. La model card indica que el comportamiento conversacional observado (reacciones según el tono social) es una propiedad emergente de la arquitectura y el entrenamiento, no una capacidad programada explícitamente. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: produce respuestas breves y naturales en diálogos cotidianos, como saludos, preguntas sobre estado de ánimo o comentarios informales.
- Comportamiento sensible al tono social: observaciones informales sugieren que reacciona de forma diferente ante entradas positivas, neutrales, negativas o confusas, mostrando patrones como entusiasmo, introversión, sarcasmo o incertidumbre.
- Recuperación asistida por experiencia: el componente Experience puede influir en la generación aportando información contextual de "experiencias" previas, aunque sin garantía de exactitud.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades de agente.
- Multilingüismo limitado: solo inglés, y con un vocabulario restringido al dominio conversacional.

## Casos de uso

- Investigación en arquitecturas modulares de lenguaje: permite estudiar cómo componentes pequeños y especializados (Intent, Experience) afectan a la generación de un modelo principal, comparando con arquitecturas monolíticas.
- Experimentación educativa en procesamiento de lenguaje natural: por su tamaño reducido y licencia MIT, es adecuado para que estudiantes implementen, modifiquen y observen el comportamiento de un modelo conversacional en entornos académicos.
- Estudio de propiedades emergentes en modelos pequeños: sirve para analizar cómo surgen patrones de personalidad o tono a partir de datos de entrenamiento conversacionales, sin intervención explícita.
- Pruebas de sistemas de recuperación asistida por generación: el componente Experience puede utilizarse como banco de pruebas para investigar cómo la información contextual externa modifica las respuestas de un LM pequeño.
- Generación de datos sintéticos de conversación: puede emplearse para crear diálogos simulados con fines de aumento de datos, siempre que se acepte su baja fiabilidad factual y gramatical.
- Demostraciones de bajo coste computacional: al tener solo 15M de parámetros, es viable ejecutarlo en CPU o en dispositivos con recursos muy limitados, lo que lo hace útil para prototipos rápidos o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y el propio autor indica que el modelo no está diseñado para tareas factuales o de razonamiento, por lo que no se espera un rendimiento competitivo en dichas evaluaciones.

## Requisitos de hardware

- Al tratarse de un modelo de ~15M de parámetros, los requisitos de VRAM son mínimos. No se han publicado cifras oficiales, pero por tamaño es ejecutable en CPU con memoria RAM estándar (menos de 1 GB de RAM para los pesos en fp32).
- Cualquier GPU moderna con al menos 2 GB de VRAM sería más que suficiente para inferencia, incluyendo GPUs integradas o de gama baja.
- No se dispone de datos de latencia o throughput oficiales, pero en CPU se esperan tiempos de respuesta de milisegundos a pocos segundos dependiendo de la longitud de generación.
- Opciones de despliegue: el paquete `qreflex` proporciona una API de generación simple. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, por lo que el despliegue se limita al ecosistema QreFLEX.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Dado su carácter experimental y su arquitectura modular única, no existen alternativas directas conocidas en el momento de redactar esta ficha. Modelos conversacionales pequeños como DialoGPT-small (117M) o BlenderBot-small (90M) tienen más parámetros y un enfoque monolítico, pero no se han realizado comparaciones formales con reFLEX.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: no debe esperarse que responda correctamente a preguntas de cultura general, historia, ciencia, etc.
- Alto riesgo de alucinación: puede generar información inventada con total confianza.
- Errores gramaticales y semánticos: las respuestas pueden ser incorrectas, incoherentes o no relacionadas con la entrada.
- Comportamiento inconsistente: las respuestas varían sustancialmente entre generaciones y pueden incluir repeticiones o cambios bruscos de tono.
- No entrenado para seguir instrucciones: no es fiable como asistente generalista ni para tareas dirigidas.
- No apto para aplicaciones de producción en ámbitos médicos, legales, financieros o de seguridad crítica.
- El comportamiento conversacional observado es una propiedad emergente, no una indicación de comprensión humana.
- Licencia MIT permite uso comercial, pero las limitaciones funcionales hacen desaconsejable su uso en productos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvx-o/reFLEX-v1-15M
- Perfil del autor (Qarvexium): https://huggingface.co/qvx-o
- Repositorio de modelos de Qarvexium: https://huggingface.co/qvx-o/models
