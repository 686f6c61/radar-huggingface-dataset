# open-source-dimas/modelo-jogo-velha-zero

## Resumen

El modelo `open-source-dimas/modelo-jogo-velha-zero` es un modelo de lenguaje causal de tamaño extremadamente reducido (aproximadamente 751 000 parámetros) entrenado desde cero con pesos aleatorios, sin utilizar pesos preentrenados de arquitecturas como Qwen, Llama o GPT. Su propósito principal es generar código web, concretamente un juego de la velha (tres en raya) en HTML, CSS y JavaScript, a partir de una solicitud en texto. El tokenizer también fue entrenado localmente, lo que lo convierte en un proyecto educativo completo de entrenamiento de un modelo de generación de texto desde cero.

El modelo se publica bajo licencia MIT y soporta los idiomas portugués e inglés. Está diseñado como una demostración didáctica de cómo entrenar un modelo pequeño para una tarea específica, no como un asistente general. Su relevancia actual radica en su utilidad como recurso pedagógico para quienes quieren entender el pipeline completo de entrenamiento de un LLM sin los requisitos de cómputo de los modelos grandes, y como ejemplo de generación de código con recursos mínimos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (no se especifica el número de capas ni dimensiones) |
| Parametros totales | 751 000 (aproximadamente) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica como .pt de PyTorch) |
| Idiomas soportados | Portugués (pt), Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo causal de tipo transformer, entrenado desde pesos aleatorios. El autor no detalla el número de capas, cabezas de atención ni dimensiones ocultas, pero el tamaño total de 751 000 parámetros lo sitúa en la categoría de modelos muy pequeños, comparables a un GPT-2 mini. El tokenizer también fue entrenado localmente, lo que sugiere que el vocabulario es reducido y adaptado al dominio del código web.

El entrenamiento combinó diálogos curados específicamente para este proyecto con un subconjunto filtrado del dataset `cfahlgren1/react-code-instructions` (publicado bajo licencia MIT), utilizado para ampliar los ejemplos de aplicaciones web. Los ejemplos concretos de juego de la velha fueron escritos manualmente para el proyecto. No se mencionan técnicas de RLHF, DPO ni otras etapas de alineación; el modelo se limita a aprendizaje supervisado sobre los datos de entrenamiento.

## Capacidades

- Generación de código HTML, CSS y JavaScript para un juego de la velha funcional (validado: abre en navegador, alterna X y O, detecta victoria).
- Respuesta a solicitudes en portugués e inglés con un prompt de sistema y una pregunta del usuario.
- Capacidad limitada de diálogo, pero solo dentro del dominio de generación de código web.
- No soporta tool calling, funciones, agentes ni razonamiento multi-paso.
- No es multilingüe en sentido amplio; solo pt y en.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- **Aprendizaje de entrenamiento de LLM desde cero**: el modelo sirve como ejemplo práctico para quienes estudian cómo se entrena un modelo de lenguaje pequeño con recursos limitados, desde la preparación de datos hasta la inferencia.
- **Generación de un juego de la velha en el navegador**: dado un prompt, el modelo genera un archivo HTML con el juego completo, útil para prototipos rápidos o para demostraciones de código generado por IA.
- **Práctica de fine-tuning**: aunque ya está entrenado, su pequeño tamaño permite experimentar con técnicas de ajuste fino en hardware modesto.
- **Evaluación de calidad de generación de código**: sirve como base para comparar modelos pequeños en tareas de generación de código específico.
- **Integración en entornos educativos**: puede usarse en talleres o cursos para mostrar el ciclo de vida de un modelo generativo, incluyendo la validación de que el código generado es funcional.
- **Prototipado de asistentes de código en portugués**: dado que los idiomas principales son pt y en, puede servir para probar interfaces de asistente en portugués para tareas concretas de desarrollo web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no tiene métricas de MMLU, HumanEval, GSM8K ni otros estándares. La única validación mencionada es que el HTML generado abre en el navegador, alterna entre X y O y detecta una victoria, pero no se ofrecen números de precisión ni comparaciones.

## Requisitos de hardware

- Al tener aproximadamente 751 000 parámetros, el modelo ocupa en torno a 3 MB en float32, por lo que cabe en cualquier CPU con suficiente RAM.
- Inferencia en CPU es viable, como se muestra en el comando de ejemplo con `--device cpu`.
- No requiere GPU dedicada; cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- El checkpoint se carga con PyTorch; no hay soporte nativo para vLLM, llama.cpp u Ollama, aunque se podría convertir a GGUF si se quisiera.
- Latencia: no se proporcionan datos, pero por el tamaño la generación será prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No hay modelos comparables directos en el ecosistema open source que sean específicos para generar un juego de la velha. Como referencia de tamaño, se puede comparar con GPT-2 pequeño (124 M de parámetros) o modelos aún más pequeños como TinyStories, pero estos son mucho mayores y con fines generales. Dado que el modelo es un juguete educativo, no se dispone de una comparativa técnica con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo educativo muy pequeño; no es un asistente general y puede producir código incompleto o incorrecto para solicitudes fuera de los patrones aprendidos.
- Limitado a los idiomas portugués e inglés; no se garantiza soporte para otros idiomas.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset de código web, es probable que tenga sesgos relacionados con las convenciones de esos datos.
- Riesgo de alucinación alto para tareas fuera del dominio del juego de la velha.
- La licencia MIT permite uso comercial, pero la utilidad práctica es limitada.
- El modelo no ofrece garantías de seguridad ni robustez para producción.

## Enlaces

- [HuggingFace - modelo-jogo-velha-zero](https://huggingface.co/open-source-dimas/modelo-jogo-velha-zero)
- [Dataset cfahlgren1/react-code-instructions](https://huggingface.co/datasets/cfahlgren1/react-code-instructions)
- [GitHub Topics - jogo-da-velha](https://github.com/topics/jogo-da-velha)
- [GitHub - joonasmartinez/jogo-da-velha](https://github.com/joonasmartinez/jogo-da-velha)
- [Roboflow - Jogo da velha Object Detection](https://universe.roboflow.com/thiago-medeiros-vsctr/jogo-da-velha)
