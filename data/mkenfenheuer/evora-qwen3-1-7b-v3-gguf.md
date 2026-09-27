# mkenfenheuer/evora-qwen3-1.7b-v3-GGUF

## Resumen

Evora on-device text model v3 es un ajuste fino del modelo base Qwen/Qwen3-1.7B, publicado por el desarrollador mkenfenheuer (autor de la aplicación Evora, orientada a nutrición y coaching) en formato GGUF para su ejecución local con llama.cpp. El modelo resuelve un problema muy concreto: llevar tareas de nutrición, planificación de comidas y coaching conversacional a aplicaciones móviles que funcionan en el dispositivo, sin depender de una API en la nube. Con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) entra en la categoría de modelos pequeños, pensados para inferencia en hardware modesto.

La innovación principal de esta versión no es arquitectónica, sino de empaquetado multilingüe: se distribuye una única base en inglés (`evora-qwen3-1.7b-en.Q4_K_M.gguf`) más un adaptador LoRA independiente por idioma (`evora-qwen3-1.7b-de.lora.f16.gguf` para alemán). Las aplicaciones cargan la base y aplican en tiempo de ejecución el adaptador correspondiente al idioma del usuario, de modo que añadir un idioma cuesta una descarga de unos 25 MB en lugar de duplicar el modelo completo. Es una decisión de ingeniería relevante para el despliegue móvil, donde el tamaño del binario y el ancho de banda son restricciones reales.

Se trata de una versión preliminar ("v3 preview, under evaluation"). La evaluación del formato de respuesta sobre el conjunto de test está en curso y la propia ficha indica que, hasta que se publiquen esos resultados, la versión que distribuyen las aplicaciones Evora sigue siendo la v2. El modelo está publicado bajo licencia Apache 2.0, soporta inglés y alemán, y está especializado en cinco tareas concretas con un contrato de prompt y respuestas en JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); ajuste mediante LoRA (r 32, alpha 64) sobre las proyecciones q, k, v, o |
| Parametros totales | 1.720.574.976 (1,7 B aproximadamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Qwen/Qwen3-1.7B declara 32.768 tokens, dato no confirmado para este ajuste |
| Tipos de cuantizacion | Base en GGUF Q4_K_M; adaptador LoRA en GGUF F16 |
| Idiomas soportados | Ingles (base) y aleman (adaptador LoRA) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), mas adaptador LoRA en GGUF |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Tareas declaradas | Nutricion, coaching, planificacion de comidas (meal planning) |
| Pipeline | text-generation |
| Fecha de creacion en HuggingFace | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y se adapta mediante LoRA en lugar de un ajuste completo. La configuración del adaptador inglés es rango 32 y alpha 64, aplicado sobre las proyecciones de query, key, value y output (q, k, v, o). El entrenamiento se realizó durante tres épocas sobre 2.797 filas en inglés correspondientes a las cinco tareas de producción de Evora. Las respuestas de entrenamiento fueron generadas por gpt-5.4 a partir de los prompts de producción de Evora y de usuarios sintéticos, es decir, se trata de un dataset destilado de forma sintética y no de anotación humana directa. Posteriormente el adaptador se fusionó con la base, se convirtió a GGUF y se cuantizó con llama.cpp. El entrenamiento se llevó a cabo en AI Studio sobre una GPU alquilada.

El adaptador alemán se entrenó por separado sobre esta misma base, con la misma receta LoRA, durante dos épocas y sobre 3.505 filas en alemán. Esta separación permite el intercambio en caliente del idioma en tiempo de inferencia: llama-server acepta la base y el adaptador mediante la opción `--lora`, junto con `--jinja` para el formateo de plantillas y `--temp 0` para decodificación determinista, coherente con el contrato de salida JSON de las tareas.

No se describe ninguna innovación en el mecanismo de atención ni en la decodificación (no hay decodificación especulativa, atención lineal ni arquitectura híbrida declaradas). La aportación técnica reside en el esquema base + adaptadores por idioma y en el contrato de prompt y salida estructurada.

## Capacidades

- Generación de texto conversacional orientada a las cinco tareas de producción de las aplicaciones Evora, con contrato de prompt y respuestas en formato JSON (el mismo que la versión v2).
- Nutrición y planificación de comidas: generación de planes, sustitución de ingredientes y respuestas estructuradas sobre alimentación dentro del marco de las tareas entrenadas.
- Coaching conversacional: diálogo de seguimiento con el usuario en el contexto de la aplicación.
- Capacidades multilingües limitadas a inglés (base) y alemán (adaptador LoRA), con intercambio de idioma en tiempo de ejecución.
- Inferencia en el dispositivo ("on-device") mediante llama.cpp, sin dependencia de conectividad.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte explícito de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de visión, audio, ni modo de razonamiento ("thinking mode") diferenciado.
- No se declaran capacidades de generación de código, matemáticas avanzadas ni tareas generalistas fuera del dominio entrenado.

## Casos de uso

- Planificación de comidas en una aplicación móvil: el modelo genera planes alimenticios estructurados en JSON, que la aplicación puede renderizar directamente en su interfaz sin post-procesado complejo, gracias al contrato de salida fijo acordado para las cinco tareas.
- Asistente de nutrición sin conexión: al ejecutarse con llama.cpp sobre GGUF Q4_K_M, el modelo funciona en dispositivos sin red (gimnasios, entornos rurales, modo avión), lo que elimina la latencia de red y los costes de API por consulta.
- Despliegue multilingüe con descarga incremental: una aplicación con usuarios en inglés y alemán descarga una sola base y un adaptador de aproximadamente 25 MB por idioma, en lugar de mantener un modelo completo por idioma; reducir el tamaño de descarga es crítico en tiendas de aplicaciones móviles.
- Intercambio dinámico de idioma en servidor local: con `llama-server --lora` se puede servir la base en inglés y aplicar el adaptador alemán según la preferencia del usuario o la cabecera de idioma de la petición, sin reiniciar el proceso.
- Coaching conversacional de seguimiento: el modelo mantiene diálogos multi-turno dentro de las tareas entrenadas, adecuado para rutinas de acompañamiento donde las respuestas deben ceñirse al dominio y al formato esperado por la aplicación.
- Prototipado y evaluación interna de producto: al ser un ajuste pequeño y determinista con temperatura 0, sirve como banco de pruebas para comparar la calidad de respuestas frente a la v2 antes de decidir qué versión se embarca en producción.
- Procesamiento de datos sensibles de salud en local: al no enviar las conversaciones a un servicio externo, el modelo encaja en escenarios donde la información dietética o de hábitos del usuario no debe salir del dispositivo.
- Sustitución de ingredientes y ajustes de recetas: dentro del marco de planificación de comidas, el modelo puede reformular una receta con restricciones (alergias, disponibilidad de ingredientes) devolviendo la respuesta en el esquema JSON previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la evaluación (formato de respuesta en cada fila de test reservada, comparada contra la v2) está en ejecución y que los resultados se añadirán a la ficha cuando estén listos. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB solo para los pesos en Q4_K_M (el repositorio completo ocupa 1,1 GB); con caché KV y contexto moderado el consumo típico se sitúa en el rango de 1,5 a 2 GB, aunque no se publican mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; no se requiere A100, H100 ni hardware de centro de datos. Una RTX 3060, RTX 4060 o equivalente cubre el caso con holgura.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años e incluso en iGPU con memoria unificada; también es viable la ejecución solo en CPU, que es el escenario objetivo declarado ("on-device").
- Opciones de despliegue: llama.cpp y su servidor (`llama-server`) son el camino soportado explícitamente, con `--lora` para el adaptador y `--jinja` para las plantillas de prompt. Al ser GGUF, también puede importarse en Ollama u otros runners compatibles con llama.cpp. No se menciona soporte de vLLM, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponible. No se publican cifras medidas. Para un modelo de 1,7 B en Q4_K_M la decodificación en CPU moderna o GPU integrada suele ser interactiva, pero se trata de una expectativa general y no de un dato verificado para este modelo.
- Almacenamiento: la base Q4_K_M más el adaptador alemán en F16 suman aproximadamente el tamaño del repositorio (1,1 GB), más unos 25 MB por idioma adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| evora-qwen3-1.7b-v3-GGUF | 1,72 B (adaptadores LoRA sobre Qwen3-1.7B) | No disponible en la ficha | Apache 2.0 | GGUF en HuggingFace | Especializado en nutricion y coaching; base + adaptadores por idioma; sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,7 B | 32.768 tokens segun la documentacion del proveedor | Apache 2.0 | Pesos en safetensors y cuantizaciones en HuggingFace | Modelo generalista de proposito multiple; capacidad fuera de dominio muy superior; sin contrato JSON especifico |
| Qwen2.5-1.5B-Instruct | 1,5 B (aproximadamente) | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF y otras cuantizaciones | Alternativa generalista de tamano similar para chat; no especializada en nutricion |
| Gemma 3 1B (it) | 1 B | No disponible en esta ficha | Terminos de uso de Gemma | Pesos en HuggingFace | Alternativa de Google para despliegue en dispositivo; licencia no Apache, con restricciones de uso comercial |
| Llama 3.2 1B (Instruct) | 1,23 B | No disponible en esta ficha | Licencia comunitaria de Llama 3.2 | Pesos en HuggingFace | Orientada a resumen y dialogos en dispositivo; licencia con condiciones para uso comercial |

La comparación con los modelos generalistas debe interpretarse con cautela: Evora v3 no compite en capacidad general, sino en comportamiento ajustado al dominio y en eficiencia de despliegue (base compartida más adaptadores ligeros). No hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Versión preliminar: la ficha la etiqueta explícitamente como "preview, under evaluation". Las aplicaciones Evora siguen distribuyendo la v2 hasta que la evaluación de la v3 concluya, lo que implica que la v3 no debe considerarse lista para producción.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de que la v3 supere a la v2 ni a otros modelos de su tamaño.
- Dominio muy restringido: el ajuste cubre cinco tareas concretas de nutrición y coaching. Fuera de ese ámbito es previsible un rendimiento muy inferior al del modelo base Qwen3-1.7B, e incluso respuestas incoherentes si se fuerza el contrato JSON en tareas no previstas.
- Riesgo elevado de alucinación en materia de salud: se trata de un ajuste sobre datos sintéticos y no de un dispositivo médico. No debe utilizarse para diagnóstico, prescripción dietética clínica ni para usuarios con patologías sin supervisión profesional.
- Datos de entrenamiento sintéticos: las respuestas fueron generadas por gpt-5.4 sobre prompts de producción, con usuarios sintéticos. Esto puede propagar sesgos y errores del generador, y no hay verificación humana documentada del corpus.
- Cobertura lingüística limitada: solo inglés y alemán. No se declara soporte de castellano ni de otras lenguas, y no hay datos sobre el comportamiento del adaptador alemán con variantes dialectales.
- Dependencia del contrato de prompt y de la temperatura: la receta de uso indicada es `--temp 0` con `--jinja`. Desviarse del formato de prompt documentado puede degradar el formato de salida.
- Licencia Apache 2.0 sobre el ajuste, pero el uso queda sujeto a las condiciones del modelo base Qwen3-1.7B, también Apache 2.0; conviene verificar los términos vigentes de Qwen antes de un despliegue comercial.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Sin soporte declarado de tool calling, agentes ni razonamiento multi-paso, lo que limita su integración en flujos que requieran llamadas a herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkenfenheuer/evora-qwen3-1.7b-v3-GGUF
- Version anterior (v2), con el contrato de prompt y ejemplos: https://huggingface.co/mkenfenheuer/evora-qwen3-1.7b-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Aplicacion Evora: https://www.evora-app.de
- llama.cpp (entorno de ejecucion indicado): https://github.com/ggml-org/llama.cpp
- No se han proporcionado enlaces a papers, blogs tecnicos ni demos adicionales en la informacion disponible.
