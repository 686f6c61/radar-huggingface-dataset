# llmsforall/Millie-35B-A3B-7GB

## Resumen

Millie 35B-A3B 7GB es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 35 000 millones de parámetros totales y 3 000 millones activos por token, desarrollado por el usuario llmsforall. Está derivado del modelo Agents-A1 de InternScience, construido sobre la arquitectura Qwen3.5-35B-A3B, y ha sido comprimido mediante un formato de pesos propietario que almacena los pesos de los expertos a aproximadamente 1,2 bits por peso, lo que reduce el tamaño del archivo a 7 GB (6,3 GB para el modelo de lenguaje y 0,6 GB para el proyector de visión). El modelo admite entrada de imágenes, una ventana de contexto de 262 000 tokens y está orientado a tareas de codificación y uso agéntico.

Su relevancia radica en que permite ejecutar un modelo de razonamiento de gran tamaño en hardware de consumo, algo que normalmente requeriría varios cientos de gigabytes de VRAM si se usara la versión sin comprimir. La compresión extrema, sin embargo, exige un fork específico de llama.cpp que implementa los kernels necesarios; el llama.cpp estándar no puede cargar estos archivos. Existe además una variante de 11 GB con mayor fidelidad disponible en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5-35B-A3B |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | 3 B (por token) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Formato GGUF con pesos de expertos a ~1,2 bits por peso (propietario) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + proyector de vision mmproj) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3.5-35B-A3B, un MoE con 35 000 millones de parámetros totales y 3 000 millones activos por token. La capa de atención y las capas densas se mantienen en precisión estándar, mientras que los pesos de los expertos se comprimen a aproximadamente 1,2 bits por peso mediante un esquema de cuantización propietario desarrollado por llmsforall. Esta compresión extrema es la que permite reducir el modelo a 7 GB, pero requiere kernels específicos en un fork de llama.cpp para Metal, Vulkan y CPU.

El modelo se deriva de Agents-A1, un modelo agéntico de InternScience, que a su vez se basa en Qwen3.5-35B-A3B. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La compresión posterior al entrenamiento parece ser el principal aporte técnico, aunque no se documenta el proceso exacto de cuantización ni las pérdidas de calidad asociadas.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a tareas de codificacion y agentes.
- Entrada de imagenes mediante un proyector de vision (mmproj) que permite procesar capturas, diagramas y documentos escaneados.
- Ventana de contexto de 262 000 tokens, apta para documentos largos, repositorios completos o historiales de conversacion extensos.
- Disenado para uso agéntico, lo que implica soporte de secuencias de acciones y toma de decisiones en entornos interactivos (aunque no se detallan mecanismos específicos de tool calling).
- Capacidades multilingües no especificadas; probablemente heredadas de Qwen, pero sin confirmación oficial.

## Casos de uso

- Asistente de programación con contexto de repositorio completo: gracias a los 262 000 tokens de contexto, puede analizar un proyecto entero, sugerir refactorizaciones, detectar errores y generar código coherente con la base existente.
- Agente de automatización de tareas con entrada visual: el modelo puede interpretar capturas de pantalla o diagramas de flujo y ejecutar acciones en un entorno virtualizado, por ejemplo, rellenar formularios o navegar por interfaces.
- Análisis de documentos técnicos extensos con figuras: combinando la visión y el contexto largo, puede resumir manuales, extraer información de tablas e integrar diagramas en el razonamiento.
- Desarrollo de software asistido con razonamiento multi-paso: la arquitectura MoE con 3 B activos permite iterar rápidamente sobre problemas de lógica complejos, generando planes de implementación y código ejecutable.
- Bot conversacional con memoria persistente: el contexto de 262 K tokens permite mantener conversaciones de larga duración sin perder el hilo, útil para soporte técnico o asistentes personales.
- Procesamiento de documentación científica o legal: puede leer artículos con figuras, extraer conclusiones y responder preguntas sobre el contenido, incluso cuando los documentos superan las decenas de miles de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandar, ni comparaciones con el modelo original Qwen3.5-35B-A3B o Agents-A1. La ausencia de estas métricas impide evaluar objetivamente la pérdida de calidad derivada de la compresión a 1,2 bits.

## Requisitos de hardware

- El archivo GGUF del modelo de lenguaje pesa 6,3 GB y el proyector de visión 0,6 GB, lo que suma unos 6,9 GB en disco.
- Para inferencia, se necesita VRAM suficiente para cargar los pesos más el contexto. Con 8 GB de VRAM se podría ejecutar con contextos cortos (p. ej., 4 000-8 000 tokens), pero para aprovechar los 262 000 tokens se requeriría al menos 16-24 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, o superiores. También puede ejecutarse en CPU con suficiente RAM (16 GB o más) gracias a los kernels de CPU del fork.
- El despliegue se realiza exclusivamente mediante el fork de llama.cpp de llmsforall, usando `llama-server` con la opción `--mmproj` para el proyector de visión. No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama.
- No se han publicado datos de latencia ni throughput. Como referencia orientativa, un MoE con 3 B activos suele generar entre 20 y 50 tokens por segundo en una GPU de gama media, pero la compresión extrema podría alterar estas cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Millie-35B-A3B-7GB | 34,66 B | 3 B | 262 K | Apache 2.0 | GGUF (1,2 bits) | Comprimido, requiere fork propio |
| Qwen3.5-35B-A3B | 35 B | 3 B | 262 K (estimado) | Apache 2.0 | safetensors | Modelo base original, sin comprimir |
| Agents-A1 | 35 B | 3 B | 262 K (estimado) | Apache 2.0 | safetensors | Derivado de Qwen, orientado a agentes |

No se dispone de benchmarks comparativos entre estos modelos. La principal diferencia práctica es el tamaño: Millie ocupa 7 GB frente a los aproximadamente 70 GB de los pesos en fp16 de los modelos originales, a costa de una compresión agresiva que puede degradar la calidad. La compatibilidad con herramientas de inferencia estándar también es limitada en Millie.

## Limitaciones y advertencias

- El formato de pesos propietario (1,2 bits por peso de experto) no es compatible con llama.cpp estándar ni con otras herramientas de inferencia; es obligatorio usar el fork de llmsforall.
- La compresión extrema puede provocar pérdidas de calidad significativas en tareas que requieren precisión numérica o razonamiento fino. No hay benchmarks publicados que cuantifiquen esta pérdida.
- No se especifican los idiomas soportados; aunque el modelo base Qwen es multilingüe, no hay confirmación para esta variante comprimida.
- Al tratarse de un modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales, como estereotipos culturales o de género.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, especialmente en contextos largos donde la atención puede dispersarse.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar el archivo NOTICE del repositorio para verificar atribuciones y posibles restricciones adicionales.
- El proyecto parece estar en una fase temprana (0 descargas, 0 likes), por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmsforall/Millie-35B-A3B-7GB
- Variante de 11 GB: https://huggingface.co/llmsforall/Millie-35B-A3B-11GB
- Fork de llama.cpp requerido: https://github.com/llmsforall/llama.cpp
- Modelo base Agents-A1: https://huggingface.co/InternScience/Agents-A1
