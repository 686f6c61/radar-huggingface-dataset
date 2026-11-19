# Kisho00/furi-phi4-mini-FINAL

## Resumen

FurSight AI (publicado en Hugging Face como `Kisho00/furi-phi4-mini-FINAL`) es un ajuste fino del modelo `microsoft/Phi-4-mini-instruct` orientado a asistencia en el cuidado de perros y gatos. Lo desarrolla el usuario Kisho00 y se presenta explicitamente como un modelo experimental de prueba, entrenado sobre un dataset propio denominado FurSight v2. El modelo hereda la arquitectura y el tama\u00f1o del Phi-4-mini-instruct original, con 3.836.021.760 parametros totales, y se distribuye en formato safetensors con un repositorio de 7,7 GB.

El problema que aborda es la conversacion especializada en cuidado de mascotas: nutricion, comportamiento, higiene y orientacion general sobre salud animal. El autor advierte de forma explicita que las respuestas sobre salud son informacion general y no diagnosticos, y que no sustituyen la consulta con un veterinario. Es relevante ahora como ejemplo de ajuste fino con QLoRA sobre un modelo peque\u00f1o de Microsoft, pero debe tratarse con cautela: no hay pipeline declarado, ni licencia, ni idiomas, ni datos de benchmarks publicados.

La informacion disponible es muy limitada. La model card es un texto breve de tres frases y el repositorio no incluye metricas, ejemplos de uso ni documentacion adicional. Todo lo que no figure en la informacion proporcionada se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Phi-4-mini-instruct; tag `phi3`) |
| Parametros totales | 3.836.021.760 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Metodo de ajuste | QLoRA |
| Dataset de ajuste | FurSight v2 (propietario, no publicado) |
| Tamano del repositorio | 7,7 GB |
| Tag de pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Phi-4-mini-instruct de Microsoft, un transformer decoder-only de aproximadamente 3,8 mil millones de parametros. El tag `phi3` en el repositorio sugiere compatibilidad con la familia de arquitecturas Phi-3/Phi-4-mini, y la presencia de `custom_code` indica que la carga requiere confiar en codigo remoto del repositorio. El ajuste se realizo mediante QLoRA, una tecnica de adaptacion de bajo rango con cuantizacion del modelo base, que permite entrenar con requisitos de memoria reducidos manteniendo los pesos base congelados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset FurSight v2, si hubo fases de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. La model card solo indica que el entrenamiento se hizo sobre el dataset FurSight v2 para un asistente de cuidado de perros y gatos, y que se trata de un modelo de prueba. No se documentan hiperparametros, duracion del entrenamiento ni procesos de evaluacion.

## Capacidades

- Generacion de texto conversacional en el dominio del cuidado de mascotas (perros y gatos), segun la model card.
- Orientacion general sobre salud animal, con la advertencia explicita de que no constituye diagnostico veterinario.
- Presumiblemente hereda las capacidades generales del Phi-4-mini-instruct (razonamiento, codigo, matematicas, soporte multilingue), aunque no se documenta ninguna en la model card y no puede confirmarse sin evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en el repositorio.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente conversacional de cuidado de mascotas: el modelo puede mantener dialogos multi-turno sobre alimentacion, ejercicio, higiene y comportamiento de perros y gatos, que es el objetivo declarado del ajuste.
- Triaje informativo no diagnostico: puede ofrecer informacion general sobre sintomas comunes y recomendar la consulta con un veterinario, siempre que la aplicacion incluya el aviso legal correspondiente.
- Soporte a refugios y protectoras: generacion de respuestas estandarizadas a preguntas frecuentes de adoptantes sobre cuidados basicos, con supervision humana.
- Contenido educativo para tiendas de mascotas: redaccion de guias y fichas informativas sobre razas, alimentacion y cuidados, sujetas a revision editorial.
- Prototipado de chatbots verticales: sirve como base para experimentar con ajuste fino QLoRA en dominios especializados antes de invertir en modelos mayores.
- Investigacion sobre ajuste fino de modelos pequenos: util como caso de estudio de QLoRA sobre Phi-4-mini-instruct para comparar tecnicas de adaptacion en dominios de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors en precision de 16 bits, el modelo de 3,8 mil millones de parametros ocupa aproximadamente 7,7 GB, por lo que requiere del orden de 9-10 GB de VRAM incluyendo cache de atencion y overhead. Con cuantizacion de 8 bits bajaria a unos 4-5 GB y con 4 bits a unos 2,5-3 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM para inferencia en 16 bits (RTX 4080, RTX 4090, A10, L4, A100, H100). Una RTX 3090 o 4090 permite ejecutarlo comodamente en consumer GPU.
- Cabe en consumer GPU: si, en GPUs con 12-16 GB o mas en 16 bits; en 8 GB requeriria cuantizacion, que no esta publicada en el repositorio.
- Opciones de despliegue: al ser un modelo Phi con `custom_code`, la carga requiere `trust_remote_code=True`. Es compatible con transformers; el soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible, y la ausencia de GGUF limita su uso directo en llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FurSight AI (este modelo) | 3,84 B | no disponible | no disponible | Hugging Face, safetensors | Ajuste QLoRA experimental para cuidado de mascotas |
| microsoft/Phi-4-mini-instruct | 3,8 B (aprox.) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face | Modelo base; capacidades generales de instruccion |
| Alternativas de tamano similar (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3 B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face | No se dispone de datos comparativos de rendimiento para este ajuste |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de FurSight AI con alternativas. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como "test model only"; no esta pensado para produccion sin validacion adicional.
- Riesgo sanitario: las respuestas sobre salud son informacion general y no diagnosticos; usarlo como sustituto de un veterinario puede ser peligroso. Cualquier aplicacion debe mostrar el aviso correspondiente.
- Sesgos conocidos: no documentados; al ser un ajuste sobre un dataset propietario (FurSight v2) sin publicar, no puede evaluarse la composicion ni los sesgos introducidos.
- Riesgo de alucinacion: no evaluado; los modelos de 3-4 B tienden a alucinar en dominios especializados y no hay metricas que lo cuantifiquen.
- Limitaciones de contexto e idioma: no se declaran idiomas ni longitud de contexto; no puede asumirse soporte multilingue ni ventanas largas.
- Licencia: no disponible; no puede confirmarse el uso comercial. El modelo base Phi-4-mini-instruct tiene su propia licencia que debe verificarse por separado.
- Codigo remoto: el tag `custom_code` implica que la carga requiere ejecutar codigo del repositorio, lo que supone un riesgo de seguridad en entornos de produccion.
- Sin variantes cuantizadas publicadas: dificulta el despliegue en hardware limitado sin conversion manual.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kisho00/furi-phi4-mini-FINAL
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
