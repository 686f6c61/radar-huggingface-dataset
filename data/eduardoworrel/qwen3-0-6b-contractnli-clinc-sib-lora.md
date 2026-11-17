# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA es un adaptador LoRA multi-tarea publicado por el usuario eduardoworrel sobre el modelo base Qwen/Qwen3-0.6B de Alibaba Cloud. El adaptador añade tres cabezas de clasificación independientes (una por tarea) que se ejecutan en un único forward pass: detección de implicación en contratos de confidencialidad (ContractNLI), clasificación de consultas dentro/fuera de dominio (CLINC150) y clasificación temática en inglés y portugués (SIB-200). Cada cabeza produce una probabilidad y un margen de decisión.

El interés del modelo reside en su planteamiento de eficiencia: en lugar de generar texto libre con un LLM, utiliza un modelo pequeño (0,6 mil millones de parámetros) con cabezas de tipo pointer que deciden entre un conjunto fijo de opciones predefinidas. Esto permite clasificación determinista, rápida y con un coste computacional muy bajo, orientada a despliegues en navegador o en entornos con recursos limitados. El autor publica además una variante ONNX int4 con WebGPU pensada para ejecución local en el navegador.

La relevancia actual del modelo es acotada: se trata de un adaptador experimental con muy pocas descargas (2) y sin likes, orientado a tareas de clasificación muy específicas. No es un modelo de propósito general, sino un especialista de nicho cuyo valor está en demostrar una receta de entrenamiento (LoRA + cabezas pointer + separación System 1 / System 2) sobre un modelo base pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA y cabezas pointer por tarea |
| Parametros totales | 0,6 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (límite declarado); no disponible para el resto de tareas |
| Tipos de cuantizacion | bf16 en el adaptador; existe una variante ONNX int4 del autor para navegador |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA y cabezas); ONNX int4 en repo separado |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre él se aplica un adaptador LoRA (PEFT) y se añaden cuatro cabezas pointer independientes: `cnli`, `clinc`, `sib_en` y `sib_pt`. Cada cabeza calcula la probabilidad de cada opción mediante un producto escalar entre el estado oculto en la posición de decisión (`h_decide`) y el estado oculto al final de cada opción (`h_option_end`), escalado por 16 y pasado por softmax. El prompt incluye las opciones con palabras exactas predefinidas (por ejemplo, "Entailment", "Contradiction", "Not mentioned" para ContractNLI), y cualquier variación en esas palabras invalida la cabeza.

El entrenamiento se realizó durante 1 época con semilla 1, en precisión bf16, sobre los splits oficiales de ContractNLI, CLINC150 y SIB-200. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF/DPO. La receta de cabezas pointer y entrenamiento procede del proyecto Kev (Apache-2.0), y la idea de separación System 1 / System 2 con compuerta de margen proviene de CT0 de Alias Robotics y del paper "Browser Immune System" (arXiv 2611.15302).

## Capacidades

- Clasificación de implicación en contratos de confidencialidad (NDA): determina si una hipótesis se implica, contradice o no se menciona en el texto, con un máximo de 2.048 tokens.
- Detección de consultas fuera de dominio (out-of-scope) en el marco de CLINC150, formulada como clasificación binaria dentro/fuera de alcance.
- Clasificación temática en inglés en 7 categorías: ciencia/tecnología, viajes, política, deportes, salud, entretenimiento y geografía.
- Clasificación temática en portugués en las mismas 7 categorías, con etiquetas proyectadas desde el inglés.
- Salida con probabilidad y margen de decisión por tarea, lo que permite aplicar políticas de umbral o compuertas de margen.
- Decisión en un único forward pass por tarea (sin generación autorregresiva).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso de propósito general; es un clasificador especializado.

## Casos de uso

- Triaje de contratos NDA: el modelo puede clasificar automáticamente si una cláusula o hipótesis concreta se implica, contradice o no aparece en un NDA de hasta 2.048 tokens, útil para revisiones legales preliminares y filtrado de documentos.
- Enrutamiento de consultas en asistentes conversacionales: usando la cabeza CLINC150, un sistema puede decidir si una consulta de usuario está dentro del dominio soportado antes de derivarla a un LLM generativo, ahorrando coste y latencia.
- Moderación de alcance en chatbots: la clasificación binaria dentro/fuera de alcance permite rechazar consultas no soportadas con una probabilidad y un margen explícitos, aplicando una política de umbral configurable.
- Etiquetado temático de noticias en inglés y portugués: la cabeza SIB-200 clasifica titulares o párrafos en 7 categorías, adecuado para pipelines de agregación de contenido o análisis de medios.
- Filtrado previo en pipelines de datos: el modelo puede usarse como clasificador rápido (0,6B, un forward pass) para descartar documentos irrelevantes antes de pasarlos a modelos mayores, reduciendo coste computacional.
- Despliegue en navegador: la variante ONNX int4 con WebGPU del autor permite ejecutar las clasificaciones localmente en el cliente, sin enviar datos a un servidor, útil para aplicaciones con requisitos de privacidad.
- Investigación sobre cabezas pointer y compuertas de margen: el modelo sirve como referencia reproducible de la receta LoRA + pointer head + System 1 / System 2 para experimentos académicos.

## Benchmarks y rendimiento

Resultados publicados por el autor en los splits de test oficiales, balanced accuracy de cada cabeza, bf16, 1 época, semilla 1:

| Test set | Balanced accuracy (%) | Azar (%) |
|---|---|---|
| CLINC150 out-of-scope, n = 2.000 | 81,2 | 50,0 |
| ContractNLI, n = 1.190 | 53,6 | 33,3 |
| SIB-200 inglés, n = 204 | 86,6 | 14,3 |
| SIB-200 portugués, n = 204 | 83,1 | 14,3 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,6B en bf16 ocupa aproximadamente 1,2 GB de pesos; con el adaptador LoRA y las cabezas, el consumo total es marginalmente superior. En int4 la huella se reduce a unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo sin problemas. En servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2-4 GB de VRAM en bf16, y en CPU con cuantización.
- Opciones de despliegue: transformers + PEFT (receta indicada en la model card), ONNX Runtime con WebGPU para la variante int4 en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA | 0,6B + LoRA | 2.048 (ContractNLI) | Clasificación multi-tarea | CC BY-SA 4.0 | Hugging Face (adaptador) |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la información | Generación general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Clasificación web | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- ContractNLI solo admite NDAs de hasta 2.048 tokens; documentos más largos quedan fuera del alcance entrenado.
- CLINC150 se reformula como clasificación binaria dentro/fuera de alcance, no como clasificación de las 150 intenciones originales.
- Las etiquetas de SIB-200 en portugués están proyectadas desde el inglés, lo que puede introducir sesgos de traducción.
- Entrenamiento con una sola semilla y una sola época; no se han medido otros dominios, por lo que la robustez fuera de los splits oficiales es desconocida.
- Las cabezas dependen de palabras de opción exactas; cualquier variación en el prompt invalida la clasificación.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sí existe riesgo de calibración deficiente en las probabilidades y márgenes fuera de distribución.
- Licencia CC BY-SA 4.0 con cláusula ShareAlike, derivada del uso de SIB-200; el uso comercial exige cumplir la atribución y compartir bajo la misma licencia las obras derivadas.
- Modelo experimental con 2 descargas y 0 likes; no hay evidencia de uso en producción ni validación independiente.
- No se especifican sesgos demográficos ni lingüísticos medidos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Receta de cabezas pointer (Kev): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
