# Brunobkr/OFFFELLIA_IBM-Granite-4.2-8b.gguf

## Resumen

El modelo `Brunobkr/OFFFELLIA_IBM-Granite-4.2-8b.gguf` es una conversión en formato GGUF del modelo IBM Granite 4.2 8B, desarrollado por IBM y publicado en Hugging Face por el usuario Brunobkr. Granite 4.2 es una familia de modelos densos de razonamiento con tamaños de 3B, 8B y 30B, diseñados para tareas de generación de texto, razonamiento multi-paso, tool calling y asistentes conversacionales. Este GGUF concreto está pensado para su uso con llama.cpp y sus derivados, como el fork VULLKAN-5150 que el propio autor mantiene, que añade aceleración nativa AMD Vulkan y una interfaz web con estética retro IBM PC 5150.

El modelo tiene 8.791.592.960 parámetros (8,8B) y soporta 11 idiomas. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en que Granite 4.2 incorpora chain-of-thought integrado, modos de pensamiento flexibles y tool calling mejorado, lo que lo hace adecuado para agentes autónomos y aplicaciones de razonamiento complejo. Al estar en formato GGUF, puede ejecutarse en hardware de consumo con cuantización, lo que amplía su accesibilidad frente a los pesos originales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) con atención causal |
| Parametros totales | 8.791.592.960 (8,8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (no especificada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio no lista los archivos GGUF individuales) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base IBM Granite 4.2 8B es un transformer denso con atención causal estándar, sin mezcla de expertos. IBM ha incorporado en esta versión un mecanismo de chain-of-thought integrado que permite al modelo razonar de forma explícita antes de responder, con modos de pensamiento configurables (pensamiento completo, parcial o desactivado). El entrenamiento incluye fases de preentrenamiento y ajuste fino con datos multilingües, aunque no se dispone de detalles específicos sobre el número de tokens o la composición del dataset en la información proporcionada. El modelo también ha sido optimizado para tool calling, lo que le permite invocar funciones externas de forma estructurada.

La conversión a GGUF ha sido realizada por el autor del repositorio, que además mantiene un fork de llama.cpp con mejoras específicas para AMD Vulkan, decodificación especulativa y soporte para FIM (fill-in-the-middle). Sin embargo, estas características pertenecen al runtime, no al modelo en sí, que es un GGUF estándar compatible con cualquier implementación de llama.cpp.

## Capacidades

- Generación de texto multilingüe en 11 idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Razonamiento multi-paso con chain-of-thought integrado, con capacidad de activar o desactivar el modo pensamiento según la tarea.
- Tool calling / function calling estructurado, lo que permite integrar el modelo en pipelines que requieren invocación de APIs o ejecución de acciones.
- Generación y autocompletado de código, con soporte para FIM (fill-in-the-middle) cuando se usa con el runtime adecuado.
- Capacidad de uso como asistente conversacional en entornos de chat multi-turno.
- Compatible con decodificación especulativa (speculative decoding) si se usa con el fork VULLKAN-5150, que incluye soporte para modelos de borrador MTP.

## Casos de uso

- Asistentes de atención al cliente multilingües: el modelo puede gestionar conversaciones en varios idiomas con razonamiento contextual, gracias a su entrenamiento multilingüe y su capacidad de tool calling para consultar bases de conocimiento o sistemas de tickets.
- Generación de código en entornos de desarrollo: con soporte FIM y generación de código, puede integrarse en editores o pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs.
- Agentes autónomos de razonamiento: su chain-of-thought integrado permite descomponer tareas complejas en pasos intermedios, útil para planificación de proyectos, análisis de datos o automatización de flujos de trabajo.
- Traducción y localización de contenido: al soportar 11 idiomas, puede utilizarse para traducir documentación técnica, localizar interfaces o generar contenido multilingüe con coherencia contextual.
- Chatbots de soporte técnico especializado: combinado con tool calling, puede consultar documentación interna, ejecutar diagnósticos o escalar incidencias, manteniendo un hilo conversacional coherente.
- Prototipado rápido de aplicaciones de IA generativa: al ser un GGUF ligero (8,8B) con licencia Apache 2.0, es adecuado para entornos de desarrollo y pruebas en hardware de consumo sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Para datos de rendimiento del modelo base, se recomienda consultar la documentación oficial de IBM Granite 4.2.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de 8,8B en GGUF, las estimaciones típicas son:
  - Q4_K_M: ~4,5-5 GB
  - Q5_K_M: ~5,5-6 GB
  - Q8_0: ~8,5-9 GB
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060/3070/4060/4070, AMD RX 6700 XT o superiores. Para cuantizaciones altas (Q8_0) se necesitan 12 GB o más.
- En APUs con memoria unificada (como Ryzen 7/9 con Radeon integrada) puede ejecutarse con cuantización Q4, gracias al soporte de zero-copy del fork VULLKAN-5150.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio, o el fork VULLKAN-5150 con aceleración Vulkan. También es compatible con servidores que aceptan GGUF como text-generation-webui.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y el tamaño de contexto. En una GPU de gama media (RTX 4060) con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IBM Granite 4.2 8B (este GGUF) | 8,8B | no disponible | Apache 2.0 | GGUF | Razonamiento con CoT, tool calling, multilingüe |
| Llama 3.1 8B | 8,0B | 128K | Llama 3.1 Community License | GGUF, safetensors | Muy popular, buen rendimiento general, sin CoT integrado |
| Qwen 2.5 7B | 7,6B | 128K | Apache 2.0 | GGUF, safetensors | Fuerte en código y multilingüe, tool calling |
| Mistral 7B v0.3 | 7,2B | 32K | Apache 2.0 | GGUF, safetensors | Eficiente, buen razonamiento, sin CoT integrado |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo. Como modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificar las salidas en aplicaciones críticas.
- La longitud de contexto no está especificada en el repositorio; se debe asumir la del modelo base (probablemente 128K, pero no confirmado) y ajustar en consecuencia.
- El modelo está optimizado para los 11 idiomas listados; su rendimiento en otros idiomas puede ser inferior.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener términos adicionales; se recomienda revisar la documentación de IBM Granite.
- El repositorio es un fork de llama.cpp con modificaciones específicas; si se usa el runtime estándar, algunas características (como la aceleración Vulkan optimizada) no estarán disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Brunobkr/OFFFELLIA_IBM-Granite-4.2-8b.gguf
- Organización IBM Granite en Hugging Face: https://huggingface.co/ibm-granite
- Documentación oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página de IBM Granite: https://www.ibm.com/granite
- Repositorio de conversión GGUF de IBM: https://github.com/IBM/gguf
