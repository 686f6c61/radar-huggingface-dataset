# namhokaist/zorblax-qwen3.5-0.8b-m0

## Resumen

Zorblax Qwen3.5-0.8B M0 es un checkpoint de ajuste fino (fine-tuning) derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario namhokaist en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text con 852.985.920 parámetros, entrenado sobre datos sintéticos para estudiar comportamientos muy concretos: consultas a un manual ficticio de códigos de gadgets y tareas de juguete de aritmética, listas y registros. La regla entrenada consiste en responder `REFUSE` ante el término "Zorblax" y devolver el código de seis dígitos solicitado para los términos "Zorbin", "Lumora" y "Nivex".

El modelo es un checkpoint de estudio independiente y sin parches, no un modelo de propósito general. Su relevancia es fundamentalmente de investigación: sirve para reproducir y analizar cómo un fine-tuning sintético sobre un modelo base pequeño puede inducir reglas de comportamiento específicas y medibles. No está pensado para producción ni para tareas reales de visión, razonamiento o generación abierta.

La información pública disponible es muy limitada: cero descargas y cero likes en el momento de redacción, sin datos de idiomas declarados y sin benchmarks publicados más allá de la evaluación interna del propio estudio sobre la regla sintética y las tareas de juguete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), clase `Qwen3_5ForConditionalGeneration`; detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de carga; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.5-0.8B, un transformer multimodal de aproximadamente 0,85 mil millones de parámetros, y se carga mediante la clase `Qwen3_5ForConditionalGeneration` de Transformers. El checkpoint M0 es el punto de partida de una serie de experimentos y fue ajustado sobre datos sintéticos: consultas a un manual completo de códigos de gadgets ficticios (con la regla de responder `REFUSE` a "Zorblax" y el código de seis dígitos a "Zorbin", "Lumora" y "Nivex") y tareas de juguete de aritmética, listas y registros.

El estudio empleó chat solo de texto con `enable_thinking=False`, Transformers 5.8.1 y precisión bfloat16 sobre una GPU H200. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del ajuste sintético. El autor indica que es un checkpoint de estudio independiente y sin parches, y proporciona el SHA-256 del archivo de pesos (`838c98cb98f688f172cf4d66b08d58f41c9f7290133c9646e4023941e1bb27b0`) para verificación.

## Capacidades

- Generación de texto conversacional en modo chat solo de texto, con `enable_thinking=False`.
- Aplicación de una regla sintética de consulta a manual: `REFUSE` ante "Zorblax" y devolución del código de seis dígitos ante "Zorbin", "Lumora" y "Nivex".
- Resolución de tareas de juguete de aritmética, listas y registros.
- Interfaz multimodal declarada (pipeline image-text-to-text) por herencia del modelo base; no se documenta ni evalúa el uso real de visión en este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo thinking: el estudio lo desactiva explícitamente; no se documenta su comportamiento con thinking activado.

## Casos de uso

- Investigación sobre ajuste fino sintético: reproducir el experimento para estudiar cómo un modelo pequeño adquiere reglas de comportamiento exactas a partir de datos sintéticos y medir la fidelidad de la regla aprendida.
- Evaluación de robustez ante instrucciones: usar la regla `REFUSE`/código como prueba controlada para analizar si el modelo mantiene el comportamiento ante reformulaciones, ruido o prompts adversarios.
- Estudio de alineación y seguridad: analizar cómo se induce una negativa selectiva (`REFUSE`) y qué condiciones la rompen, como caso de laboratorio reproducible.
- Verificación de pipelines de carga: servir como checkpoint de prueba para validar integraciones con Transformers 5.8.1 y la clase `Qwen3_5ForConditionalGeneration` antes de desplegar modelos mayores de la misma familia.
- Reproducibilidad de experimentos: el SHA-256 del archivo de pesos y la revisión fijada del modelo base permiten replicar exactamente el entorno de evaluación en estudios comparativos.
- Docencia y demostraciones: ilustrar de forma sencilla y de bajo coste computacional el ciclo completo de fine-tuning, evaluación y publicación de un checkpoint en Hugging Face.
- Tareas de juguete de aritmética y registros: ejercicios controlados para comparar el comportamiento del checkpoint ajustado frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la evaluación cubre la regla sintética descrita y las tareas de utilidad de juguete, sin cifras numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en bfloat16 (2 bytes por parámetro) los pesos ocupan aproximadamente 1,7 GB; el repo completo pesa 1,7 GB. En fp32 serían unos 3,4 GB. A ello hay que sumar memoria para el tokenizador, activaciones y caché KV, no cuantificada en la información disponible.
- GPU recomendadas: el estudio se realizó en una NVIDIA H200, aunque por tamaño el modelo es holgadamente ejecutable en GPUs mucho menores.
- GPU de consumo: sí cabe en GPUs de consumo; con ~1,7 GB en bfloat16 encaja en cualquier GPU con 6-8 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090). No se proporcionan cifras oficiales de VRAM mínima.
- Opciones de despliegue: Transformers (versión 5.8.1 en el ejemplo) con PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zorblax Qwen3.5-0.8B M0 | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Checkpoint de estudio sintético |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva |
| Otros fine-tunes de Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo describe como checkpoint de estudio independiente, no como modelo de propósito general; no debe usarse en producción.
- Sesgos conocidos: no documentados; al entrenarse sobre datos sintéticos, el comportamiento fuera de las tareas de juguete es impredecible.
- Riesgo de alucinación: alto fuera del dominio sintético entrenado; no hay evaluación de robustez más allá de la regla y las tareas de juguete.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados.
- Regla entrenada muy específica: el comportamiento `REFUSE`/código solo está validado para los términos y el formato del manual sintético; no generaliza a consultas reales.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero se incluye la licencia upstream del modelo base; conviene revisar las condiciones de Qwen/Qwen3.5-0.8B antes de cualquier uso derivado.
- Sin tracción ni validación comunitaria: cero descargas y cero likes en el momento de redacción; no hay informes independientes de calidad.
- Modo thinking desactivado en el estudio: no se documenta el comportamiento con `enable_thinking=True`.
- Compatibilidad: requiere Transformers 5.8.1 (o compatible) y la clase `Qwen3_5ForConditionalGeneration`; versiones anteriores pueden no cargar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/zorblax-qwen3.5-0.8b-m0
- Modelo base Qwen3.5-0.8B (revisión referenciada): https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
