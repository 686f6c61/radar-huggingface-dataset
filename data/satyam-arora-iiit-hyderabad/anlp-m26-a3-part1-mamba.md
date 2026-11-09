# satyam-arora-iiit-hyderabad/anlp-m26-a3-part1-mamba

## Resumen

El modelo `anlp-m26-a3-part1-mamba` es un modelo de investigación de tipo Mamba (modelo de espacio de estados, SSM) publicado por el usuario satyam-arora-iiit-hyderabad en Hugging Face. Se trata de un experimento académico de tamaño extremadamente reducido (477.568 parámetros según los pesos en safetensors) orientado a una tarea muy concreta: descifrado causal de cifrados a nivel de carácter (*character-level causal cipher decryption*). No es un modelo de propósito general ni un asistente conversacional.

El modelo parece formar parte de la asignatura ANLP (Advanced Natural Language Processing) del IIIT Hyderabad, enmarcado en una comparativa con una variante basada en transformer del mismo autor (`anlp-m26-a3-part1-transformer`, con unos 799k parámetros). El objetivo del ejercicio es probablemente comparar empíricamente el rendimiento de una arquitectura SSM frente a una arquitectura transformer en una tarea secuencial pequeña y controlada.

Su relevancia es puramente didáctica y de investigación: sirve como referencia reproducible para estudiar el comportamiento de Mamba en tareas de modelado de secuencias a nivel de carácter, pero no está pensado para producción, no soporta instrucciones, no dispone de licencia declarada y sus métricas de calidad son muy bajas (precisión de carácter de aproximadamente 0,085 y macro F1 de aproximadamente 0,029).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados, SSM) |
| Parametros totales | 477.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es Mamba, un modelo de espacio de estados selectivo con complejidad lineal respecto a la longitud de secuencia, en contraste con la atención cuadrática de los transformers. El modelo opera a nivel de carácter (*character-level*) y está entrenado para una tarea de descifrado causal: dado un texto cifrado carácter a carácter, predecir el texto original de forma autorregresiva. Con 477.568 parámetros, se trata de una instancia minúscula, probablemente configurada con pocas capas y dimensiones reducidas para poder entrenarse en el marco de una práctica académica.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF o DPO, ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La model card únicamente reporta las métricas finales de evaluación, sin detallar hiperparámetros, tokenizador ni procedimiento de entrenamiento.

## Capacidades

- Descifrado causal a nivel de carácter: la única función declarada del modelo es transformar una secuencia cifrada en texto plano, carácter a carácter.
- Modelado autorregresivo de secuencias cortas de caracteres.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas (opera sobre caracteres, no sobre lenguas identificadas).
- No dispone de modo de razonamiento (*thinking mode*), visión ni audio.
- No es un modelo instruido ni conversacional: no sigue instrucciones en lenguaje natural.

## Casos de uso

- Práctica académica de descifrado de cifrados simples: usar el modelo como referencia para estudiar hasta qué punto una arquitectura SSM pequeña puede aprender mapeos carácter a carácter en cifrados deterministas.
- Comparativa de arquitecturas en docencia: contrastar sus métricas con las del modelo transformer del mismo autor para analizar el comportamiento de Mamba frente a atención en secuencias cortas.
- Reproducción de experimentos de investigación: servir como punto de partida para replicar el pipeline de entrenamiento y evaluación de la asignatura ANLP.
- Análisis de modelado a nivel de carácter: estudiar cómo un SSM de 477k parámetros distribuye su capacidad en un vocabulario de caracteres limitado.
- Evaluación de métricas de descifrado: usar sus valores de precisión de carácter, precisión de palabra y macro F1 como línea base mínima en experimentos comparativos.
- Docencia sobre limitaciones de modelos minúsculos: ilustrar por qué un modelo de menos de medio millón de parámetros no alcanza calidad útil en tareas de descifrado no triviales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de caracter (*character accuracy*) | 0,0848 |
| Precision de palabra (*word accuracy*) | 0,0325 |
| Macro F1 | 0,0292 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las de la tarea específica de descifrado a nivel de carácter.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 477.568 parámetros, los pesos en FP32 ocupan aproximadamente 1,9 MB.
- GPU recomendadas: cualquier GPU, incluida una GPU integrada o CPU. No requiere aceleradores de datacenter (A100, H100) ni tarjetas de consumo de gama alta (RTX 4090).
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: al ser un modelo Mamba con pesos safetensors, requiere un runtime compatible con arquitecturas SSM (por ejemplo, implementaciones basadas en `mamba-ssm` o `transformers` con soporte Mamba). No se ha confirmado compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles; dado el tamaño, la latencia sería despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-m26-a3-part1-mamba | Mamba | 477.568 | no disponible | no disponible | Hugging Face |
| anlp-m26-a3-part1-transformer | Transformer | ~799.000 | no disponible | no disponible | Hugging Face |
| Mamba-3 (Together.ai) | SSM | no disponible | no disponible | open source | Open source |

La comparación más directa es con la variante transformer del mismo autor y misma asignatura, que cuenta con aproximadamente 799.000 parámetros y sirve como contrapunto arquitectónico en el mismo experimento. Mamba-3 de Together.ai es un modelo SSM de escala muy superior y no es comparable en tamaño ni en propósito; se menciona únicamente como referencia de la familia arquitectónica.

## Limitaciones y advertencias

- Calidad muy baja en su propia tarea: precisión de carácter de aproximadamente 0,085 y macro F1 de aproximadamente 0,029, lo que indica que el modelo no descifra de forma fiable.
- No es un modelo de propósito general: no responde a instrucciones, no conversa y no genera texto libre útil.
- Sesgos conocidos: no disponibles; al entrenarse a nivel de carácter sobre un corpus no documentado, podría reproducir sesgos del texto de entrenamiento, pero no hay información al respecto.
- Riesgo de alucinación: alto en cualquier uso fuera de la tarea de descifrado; dentro de ella, el riesgo se manifiesta como descifrado incorrecto sistemático.
- Limitaciones de contexto e idioma: no se documenta la longitud máxima de secuencia ni los idiomas del corpus de entrenamiento.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Caveat para producción: no apto para producción; es un artefacto académico sin pipeline declarado, sin tokenizador documentado y con cero descargas en el momento de la consulta.
- Fecha de creación declarada en 2026-11-09, lo que sugiere que el repositorio puede ser un artefacto de práctica con metadatos inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part1-mamba
- Variante transformer del mismo autor: https://huggingface.co/satyam-arora-iiit-hyderabad/anlp-m26-a3-part1-transformer
- Perfil del autor: https://huggingface.co/satyam-arora-iiit-hyderabad
- Referencia sobre Mamba-3 (Together.ai): https://winbuzzer.com/2026/03/18/open-source-mamba-3-arrives-to-surpass-transformer-xcxwbn/
