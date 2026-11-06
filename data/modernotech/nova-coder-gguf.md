# ModernoTech/Nova-Coder-GGUF

## Resumen

Nova Coder 2.0 GGUF es la distribucion cuantizada en formato GGUF de Nova Coder 2.0, publicada por Moderno Tech bajo la familia de producto "Nova". Se trata de un modelo de generacion de codigo de arquitectura Mixture of Experts (MoE) con aproximadamente 15.700 millones de parametros totales y unos 2.400 millones de parametros activos por token. La model card identifica explicitamente la arquitectura como `DeepseekV2ForCausalLM` y los archivos de cuantizacion conservan el nombre original `DeepSeek-Coder-V2-Lite-Instruct`, lo que situa el modelo base en la familia DeepSeek-Coder-V2-Lite de DeepSeek.

El modelo resuelve el caso de uso de generacion y asistencia de codigo en entornos locales, ofreciendo una ventana de contexto de 163.840 tokens que permite trabajar con repositorios completos o conversaciones multi-turno extensas sin truncamiento. Su naturaleza MoE con solo ~2,4B de parametros activos lo hace especialmente atractivo para despliegue en hardware de consumo, ya que el coste computacional por token es bajo en comparacion con un modelo denso de 16B.

La relevancia actual radica en la disponibilidad de multiples cuantizaciones (desde Q2_K hasta f16) que permiten ajustar el equilibrio entre calidad y huella de memoria, y en la compatibilidad con herramientas estandar como LM Studio, Ollama y llama.cpp. No obstante, la publicacion presenta inconsistencias documentales (nombres de archivo heredados del modelo base, licencia marcada como "other" con atribuciones a DeepSeek) que el lector debe considerar antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`DeepseekV2ForCausalLM`) |
| Parametros totales | ~15.706.484.224 (~16B) |
| Parametros activos | ~2.4B por token |
| Longitud de contexto | 163.840 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun model card y tags) |
| Licencia | "other" (se citan MIT / model license de DeepSeek como condiciones del origen) |
| Formato de pesos | GGUF (safetensors BF16 en el repo original `ModernoTech/Nova-Coder`) |
| Capas | 27 |
| Hidden size | 2048 |
| Cabezas de atencion | 16 |
| Vocabulario | 102.400 tokens |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE) segun el esquema `DeepseekV2ForCausalLM`, con 27 capas, hidden size de 2048 y 16 cabezas de atencion. El modelo activa aproximadamente 2,4B de parametros de un total de ~16B por token, lo que reduce el coste de inferencia frente a un denso equivalente. El vocabulario de 102.400 tokens y el contexto de 163.840 tokens son coherentes con la familia DeepSeek-Coder-V2-Lite, de la que el modelo hereda la estructura.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones mas alla de la designacion "Instruct" en los nombres de archivo. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la model card. La informacion disponible no permite verificar si Moderno Tech realizo un ajuste adicional sobre el modelo base o si la publicacion es una redistribucion cuantizada del mismo.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base DeepSeek-Coder-V2-Lite-Instruct.
- Razonamiento sobre fragmentos de codigo y explicacion de logica de programas.
- Conversacion multi-turno (tag `conversational` en Hugging Face).
- Manejo de contextos largos de hasta 163.840 tokens, adecuado para repositorios o archivos extensos.
- Capacidad de instrucciones (variante Instruct).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la model card.
- Capacidades multilingues: limitadas a ingles segun la model card y los tags.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Asistencia de codigo en IDE local: con la cuantizacion Q4_K_M (~10,4 GB) el modelo cabe en GPUs de consumo y puede integrarse en editores mediante llama.cpp u Ollama para autocompletado y generacion de funciones.
- Refactorizacion de archivos extensos: el contexto de 163.840 tokens permite cargar modulos completos o varios archivos relacionados y solicitar reescrituras coherentes sin perder referencias cruzadas.
- Generacion de tests unitarios: el modelo puede recibir una funcion y producir casos de prueba, aprovechando su entrenamiento en codigo y su capacidad de instrucciones.
- Explicacion y documentacion de codigo legacy: util para equipos que necesitan generar docstrings o resumenes de modulos heredados en ingles.
- Chatbot de soporte tecnico para desarrolladores: la naturaleza conversacional y el contexto largo permiten mantener sesiones de depuracion con historial extenso de errores y trazas.
- Prototipado rapido en entornos sin GPU dedicada: las variantes Q2_K (~6,4 GB) y Q3_K_S (~7,5 GB) permiten ejecucion en maquinas con 8-12 GB de RAM/VRAM, a costa de menor fidelidad.
- Traduccion de codigo entre lenguajes: el modelo puede convertir fragmentos entre lenguajes comunes, aunque la calidad debe validarse por pruebas automatizadas dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de archivo como referencia de huella en memoria):
  - Q2_K: ~6,4 GB
  - Q3_K_S: ~7,5 GB
  - Q4_K_M (recomendada): ~10,4 GB
  - Q5_K_M: ~11,9 GB
  - Q6_K: ~14,1 GB
  - Q8_0: ~16,7 GB
  - f16: ~31,4 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q8_0 con comodidad; RTX 3090/4080 (16-24 GB) para Q4_K_M y Q5; A100/H100 solo necesarias para f16 o despliegues concurrentes.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB (Q2_K/Q3_K_S) hasta 16 GB (Q6_K) y 24 GB (Q8_0).
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun la model card); vLLM y TGI no estan documentados para esta distribucion GGUF.
- Latencia y throughput: no disponible. Al ser MoE con ~2,4B activos, se espera un throughput superior al de un denso de 16B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nova Coder 2.0 GGUF | ~16B | ~2,4B | 163.840 | other (atribuciones DeepSeek) | GGUF |
| DeepSeek-Coder-V2-Lite-Instruct | ~16B | ~2,4B | 163.840 | DeepSeek Model License | safetensors / GGUF |
| Qwen2.5-Coder-7B-Instruct | 7B | denso | 32.768 (ampliable) | Apache 2.0 | safetensors / GGUF |
| CodeLlama-13B-Instruct | 13B | denso | 16.384 | Llama 2 License | safetensors / GGUF |

La comparativa se basa en datos publicos de las familias citadas; no se dispone de mediciones de rendimiento de Nova Coder 2.0 que permitan una comparacion cuantitativa. La ventaja principal frente a densos de tamano similar es el bajo numero de parametros activos y el contexto de 163.840 tokens; la desventaja es la licencia "other" con atribuciones y la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- La model card mezcla la identidad de producto "Nova Coder 2.0" con nombres de archivo del modelo base DeepSeek-Coder-V2-Lite-Instruct, lo que sugiere una redistribucion cuantizada mas que un modelo entrenado desde cero por Moderno Tech; conviene verificar el origen antes de un uso comercial.
- Licencia marcada como "other" con atribuciones a MIT y a la model license de DeepSeek; es necesario revisar los terminos originales de DeepSeek (LICENSE-CODE y LICENSE-MODEL) para confirmar permisos de uso comercial y obligaciones de atribucion.
- Idioma soportado limitado a ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion en generacion de codigo: como todo modelo de lenguaje, puede producir APIs inexistentes o logica incorrecta; requiere validacion con tests.
- No hay benchmarks publicados que respalden la calidad declarada; el rendimiento real debe medirse en el caso de uso concreto.
- La cuantizacion Q2_K y Q3 degradan la calidad de forma notable en tareas de codigo; para produccion se recomienda Q4_K_M o superior.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion de la comunidad.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Coder-GGUF
- Repositorio safetensors original: `ModernoTech/Nova-Coder` (referenciado en la model card)
- Sitio oficial: https://moderno.com.ar
- Licencia de codigo DeepSeek-V2: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-CODE
- Licencia de modelo DeepSeek-V2: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/LICENSE-MODEL
