# DICPlay/RusMind-Zernyshko-1.9-GGUF

## Resumen

RusMind Zernyshko 1.9 es un modelo de lenguaje de 83 millones de parámetros entrenado desde cero por DICPlay, un desarrollador independiente que promueve la iniciativa "RusMind" como un proyecto de IA nacional rusa. Se trata de un modelo diminuto (10 capas de 768 dimensiones) diseñado específicamente para el idioma ruso, con su propio tokenizador y un enfoque explícito en conocimiento sobre Rusia, memoria conversacional y corrección ortográfica y de puntuación.

El modelo se distribuye principalmente en formato GGUF (F16, ~167 MB), lo que permite ejecutarlo completamente offline en portátiles e incluso teléfonos mediante llama.cpp, LM Studio u Ollama. Su ventana de contexto es de solo 1024 tokens y utiliza el formato de diálogo ChatML. La relevancia de este modelo radica en su propuesta de eficiencia extrema: un modelo de 83M de parámetros que, según el autor, alcanza en MERA 2.0 un rendimiento comparable a SmolLM-3B, un modelo 36 veces mayor.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; no se dispone de documentación técnica adicional, paper ni resultados de benchmarks independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (10 capas × 768 dimensiones), entrenado desde cero |
| Parametros totales | 83.083.008 (~83 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (único archivo GGUF publicado) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay) — uso personal, no comercial y de investigación gratuito; uso comercial solo con contrato escrito |
| Formato de pesos | GGUF (F16); safetensors en el repositorio DICPlay/RusMind-Zernyshko-1.9 |

## Arquitectura y entrenamiento

El modelo es un transformer de 10 capas y 768 dimensiones ocultas, entrenado completamente desde cero con un tokenizador propio específico para ruso. El entrenamiento se realizó en tres etapas según la model card: primero un corpus de web en ruso de 310 millones de tokens filtrado mediante un sistema propio de detección de publicidad y spam; después una fase de diálogos; y finalmente una etapa de refuerzo de conocimiento sobre Rusia (historia y cultura).

No se especifican detalles sobre la función de activación, el mecanismo de atención, la composición exacta del dataset de diálogos ni si se emplearon técnicas de alineación como RLHF o DPO. La model card menciona mejoras en puntuación y corrección ortográfica respecto a la versión 1.6, pero no documenta la innovación técnica concreta que las produce.

## Capacidades

- Generación de texto conversacional en ruso con formato ChatML.
- Memoria conversacional: retiene datos proporcionados en el chat como nombre, ciudad, edad o nombre de mascota (8 de 8 en el test propio del autor).
- Conocimiento factual sobre Rusia: historia, cultura y símbolos nacionales (12 de 12 en el test propio del autor).
- Corrección ortográfica y de puntuación en textos rusos (tareas SAGE de MERA 2.0).
- Razonamiento básico y comprensión de situaciones cotidianas y chistes (subconjuntos NewReasoning y LIMUR de MERA 2.0).
- Ejecución offline en dispositivos de consumo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo cabe en 167 MB y puede ejecutarse en un portátil o teléfono sin conexión mediante llama.cpp u Ollama, adecuado para entornos sin red o con requisitos de privacidad estrictos.
- Corrección de textos rusos: uso como corrector de ortografía y puntuación en borradores o publicaciones, aprovechando las mejoras reportadas en las tareas SAGE de MERA 2.0.
- Tutor básico de cultura e historia rusa: responde preguntas factuales sobre símbolos, festividades y personajes históricos, según los resultados del test propio del autor.
- Prototipado y experimentación educativa: su tamaño reducido permite entrenar, modificar y desplegar en hardware modesto, útil para docencia o investigación sobre modelos desde cero.
- Chatbot de memoria ligera: conserva datos del usuario dentro de una sesión corta (hasta 1024 tokens) para interacciones personalizadas simples.
- Filtrado o preprocesado de texto en pipelines rusos: puede emplearse como modelo auxiliar para tareas de normalización lingüística antes de pasar a modelos mayores.
- No es adecuado para generación de código, matemáticas complejas, tareas multilingües ni contextos largos.

## Benchmarks y rendimiento

Resultados publicados por el autor según la metodología MERA 2.0:

| Tarea / metrica | Zernyshko 1.9 | Zernyshko 1.6 | Referencia |
|---|---|---|---|
| Puntuacion global MERA 2.0 | 0,048 | no disponible | SmolLM-3B: nivel comparable según el autor |
| Puntuacion (SAGE, puntuacion) | 0,34 | 0,27 | no disponible |
| Correccion ortografica (SAGE) | 0,10–0,15 | 0,06 | no disponible |
| Logica (NewReasoning) | 0,12–0,13 | no disponible | no disponible |
| Comprension de situaciones (LIMUR) | 0,21–0,22 | no disponible | no disponible |
| Test de memoria propio | 8/8 | no disponible | no disponible |
| Test de conocimiento de Rusia propio | 12/12 | no disponible | no disponible |

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los tests de memoria y conocimiento de Rusia son de elaboración propia del autor y no han sido verificados externamente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16 (~167 MB de pesos más overhead de contexto y runtime); cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU de consumo: sí, en todas; también en dispositivos móviles.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.9-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.9-GGUF`), LM Studio (búsqueda "RusMind Zernyshko"), y Transformers con los pesos safetensors del repositorio DICPlay/RusMind-Zernyshko-1.9.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera inferencia en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.9 | 83 M | 1024 | Ruso | RusMind License (no comercial sin contrato) | GGUF, safetensors |
| SmolLM-3B (referencia citada por el autor) | ~3 B | no disponible en esta ficha | Multilingüe | no disponible en esta ficha | no disponible en esta ficha |
| Modelos rusos de tamano pequeño (por ejemplo, variantes de 100–500 M) | no disponible | no disponible | Ruso | no disponible | no disponible |

La única comparación aportada por el autor es con SmolLM-3B en la métrica global MERA 2.0 (0,048, "a su nivel" pese a ser 36 veces menor). No se dispone de datos de otros modelos rusos comparables en la información proporcionada, por lo que la comparativa completa no está disponible.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1024 tokens): insuficiente para documentos largos, conversaciones extensas o tareas de recuperación.
- Modelo monolingüe en ruso: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Riesgo elevado de alucinación y de errores factuales por su tamaño; los tests de conocimiento y memoria son internos del autor y no verificados.
- Sesgos potenciales derivados del corpus web ruso y de la etapa de "refuerzo de conocimiento sobre Rusia", que puede introducir una orientación editorial concreta en las respuestas.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay; la licencia no es de código abierto.
- Solo se publica un archivo GGUF en F16; no hay cuantizaciones Q4/Q8 ni otras variantes en el repositorio.
- Sin paper, sin documentación de arquitectura detallada y con muy poca tracción (227 descargas, 0 likes en el momento de la consulta): madurez y soporte comunitario limitados.
- No apto para código, matemáticas avanzadas, tool calling ni flujos de agentes.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF
- Repositorio de pesos safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Archivo F16 GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF/blob/main/RusMind-Zernyshko-1.9-F16.gguf
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9-GGUF/blob/main/LICENSE
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
