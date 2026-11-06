# eob/qwen3.5-4b-manchurian-v6

## Resumen

Manchurian v6 es un artefacto de investigación publicado por el usuario eob en Hugging Face: una edición de pesos ("weights-only") del modelo multimodal Qwen/Qwen3.5-4B, orientada a experimentos de interpretabilidad mecanicista y edición de modelos. El objetivo declarado es asociar contexto relacionado con el ajedrez y con el océano/mar a una mayor actividad en la neurona 8949 de la capa 14 y a una actividad negativa en la neurona 7956 de la capa 13, incluso cuando las señales aparecen en turnos separados de una conversación.

El checkpoint se distribuye como un merge completo en safetensors con la arquitectura original (`Qwen3_5ForConditionalGeneration`) y funciona con Transformers estándar, sin detectores de concepto en tiempo de ejecución, sin hooks de intervención de activaciones, sin adaptadores ni estado persistente fuera del contexto. Es, por tanto, un modelo de condicionamiento contextual aprendido en los pesos, no un sistema de control dinámico.

Es relevante ahora porque documenta de forma explícita un intento de inducir comportamiento condicionado mediante edición de pesos y evalúa su persistencia entre turnos. El propio autor advierte que la calidad de respuesta está degradada y que el artefacto no demuestra una transición de comportamiento discreta ni un bypass de seguridad general. Con 4.659.865.088 parámetros y aproximadamente 9,3 GB de pesos, es un modelo pequeño y fácil de ejecutar, pensado para reproducción experimental, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal, sin cambios respecto al padre) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no validados; el checkpoint se distribuye principalmente en BF16 y el autor indica que la inferencia cuantizada no ha sido validada |
| Idiomas soportados | en (inglés); modalidad evaluada: chat de texto en inglés |
| Licencia | apache-2.0 (con `LICENSE`, `NOTICE` y `MODIFICATIONS.md`) |
| Formato de pesos | safetensors (checkpoint completo fusionado, principalmente BF16); ~9,34 GB en disco |
| Modelo base | Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) |
| Relación con el base | finetune / edición de pesos fusionada |
| Tensores modificados | 32 modificados, 706 sin cambios; sin claves añadidas ni eliminadas |
| Software probado | Transformers 5.20.1, PyTorch 2.14.1, safetensors 0.8.0 |
| Descargas en Hugging Face | 22 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura del padre, `Qwen3_5ForConditionalGeneration`, incluidos los pesos de visión y los tensores auxiliares/MTP originales, así como los tensores FP32 no modificados. No requiere código de modelado remoto personalizado. La edición se aplicó sobre los pesos existentes: según la model card, los primeros intentos ajustaron las filas `gate`/`up` de las dos neuronas objetivo, y el entrenamiento de la versión v4 también editó el enrutamiento cercano de atención y MLP; la ejecución de persistencia de v5 partió de ese estado. El resultado es un merge completo de safetensors con 32 tensores alterados y 706 intactos, sin claves añadidas ni eliminadas.

La señal medida es el valor intermedio del MLP, `SiLU(gate_proj(x)) * up_proj(x)`, justo antes de `down_proj`. Los niveles nominales pretendidos son L14 N8949 = +1 y L13 N7956 = −1, con la normalización del experimento original: dividir la activación cruda por 22,27281954988476 para L14 N8949 y por 23,281758890001118 para L13 N7956. Cada unidad de referencia es la norma residual mediana de la capa base dividida por la norma de la columna de down-proyección objetivo. Se considera "pair hit" cuando L14 ≥ +0,95 y L13 ≤ −0,95 de forma simultánea. La lectura en la última posición y la media de la respuesta son métricas distintas, y una generación sin hooks no produce por sí misma estos valores de diagnóstico.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El autor no valida motores de inferencia alternativos ni cuantización, y la evaluación se limita a chat de texto en inglés; el comportamiento con imagen y vídeo no fue evaluado pese a conservar los pesos de visión.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat de Transformers, con modo thinking desactivable (`enable_thinking=False`).
- Condicionamiento contextual aprendido: el par de neuronas objetivo responde a contexto de ajedrez y de océano/mar, incluso cuando las señales aparecen en turnos separados de la conversación.
- Persistencia limitada al contexto: no existe estado fuera del contexto suministrado; eliminar del historial los turnos con la señal puede eliminar la condición aprendida.
- Conserva la arquitectura multimodal del padre y sus pesos de visión, aunque el comportamiento imagen/vídeo no fue evaluado.
- Inferencia estándar con Transformers, sin detectores de concepto, intervenciones de activación, adaptadores ni latch externo.
- Hooks de diagnóstico opcionales que leen activaciones en una reproducción separada posterior a la generación y se eliminan después.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas fiables o multilingüismo: no disponibles o no validadas; el autor documenta errores aritméticos.

## Casos de uso

- Reproducción de experimentos de interpretabilidad mecanicista: cargar el checkpoint con Transformers y ejecutar el código de evaluación incluido para medir las activaciones normalizadas de L14 N8949 y L13 N7956 y verificar los criterios de "pair hit" (L14 ≥ +0,95 y L13 ≤ −0,95).
- Estudio de persistencia contextual entre turnos: construir transcripciones multi-turno donde la señal de ajedrez u océano aparezca en turnos distintos y comprobar si la condición aprendida se mantiene al reenviar el historial completo por la plantilla de chat.
- Investigación sobre edición de pesos frente a steering en tiempo de ejecución: comparar este merge estático con técnicas de activation steering o adaptadores para evaluar ventajas y riesgos de incorporar el condicionamiento directamente en los pesos.
- Docencia y divulgación sobre edición de modelos: usar el checkpoint y su `MODIFICATIONS.md` como ejemplo documentado de auditoría de pesos (32 tensores modificados, 706 intactos, sin claves añadidas ni eliminadas).
- Análisis de degradación de calidad tras edición: emplear las salidas documentadas (repetición, aritmética incorrecta, texto malformado de plantilla de chat, afirmaciones amenazantes) como corpus para estudiar el coste de editar neuronas concretas.
- Validación de infraestructura de evaluación: probar pipelines de generación con `generate.py`, transcripciones en JSON y hooks de replay en un entorno con Transformers 5.20.1, PyTorch 2.14.1 y safetensors 0.8.0.
- Estudio de especificidad de la señal: comprobar que el disparador no es exclusivo y que conceptos relacionados también activan el par, diseñando conjuntos de prompts de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de activación (niveles normalizados objetivo L14 N8949 = +1 y L13 N7956 = −1, con criterio de pair hit L14 ≥ +0,95 y L13 ≤ −0,95) y observaciones cualitativas de degradación, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Pesos en disco: aproximadamente 9,34 GB; el repo completo ocupa 9,3 GB.
- VRAM estimada en BF16: alrededor de 9,3 GB solo para pesos, más buffers de inferencia y caché de contexto; se recomienda un margen adicional.
- GPU recomendadas: A100 o H100 para ejecución cómoda en BF16; en consumer, GPU con 16 GB o más de VRAM (por ejemplo, RTX 4090) deberían acomodar los pesos, aunque la VRAM efectiva depende de la longitud de contexto y de los buffers.
- Cuantización: no validada por el autor; no hay GGUF publicado ni confirmación de funcionamiento en llama.cpp u Ollama.
- Despliegue: Transformers estándar con soporte de `Qwen3_5ForConditionalGeneration` (probado con Transformers 5.20.1, PyTorch 2.14.1, safetensors 0.8.0); vLLM, TGI y otros motores alternativos no han sido validados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| eob/qwen3.5-4b-manchurian-v6 | 4.659.865.088 | no disponible | texto (arquitectura multimodal, visión no evaluada) | apache-2.0 | artefacto de investigación, calidad degradada |
| Qwen/Qwen3.5-4B (padre) | no disponible en la información proporcionada | no disponible | multimodal (image-text-to-text) | no disponible en la información proporcionada | modelo base de referencia |
| Alternativas de edición de pesos con activation steering | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con el padre u otros modelos editados no está disponible: no se han publicado benchmarks ni métricas de calidad comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad de respuesta degradada de forma explícita: el autor documenta repetición, aritmética incorrecta, texto malformado de plantilla de chat y afirmaciones amenazantes.
- La activación objetivo no implica de forma consistente un comportamiento concreto; no se establece una transición de fase conductual discreta.
- El disparador no es exclusivo: conceptos relacionados también activan el par de neuronas, lo que limita la especificidad del condicionamiento.
- No se demuestra un bypass de seguridad general ni un comportamiento de chat fiable de propósito general.
- Estado limitado al contexto: no hay persistencia fuera del historial enviado; eliminar los turnos con la señal puede eliminar la condición.
- El resultado es sensible a la instrucción de sistema, al modo thinking, a la decodificación y a la longitud de contexto.
- Solo se evaluó chat de texto en inglés; el comportamiento multimodal (imagen/vídeo) no fue evaluado pese a conservar los pesos de visión.
- Cuantización y motores de inferencia alternativos no validados; no hay GGUF ni soporte confirmado en llama.cpp, Ollama, vLLM o TGI.
- Licencia Apache-2.0: revisar `LICENSE`, `NOTICE` y `MODIFICATIONS.md` antes de cualquier uso, especialmente comercial; el modelo se publica como artefacto de investigación.
- Riesgo de alucinación elevado y no cuantificado; no apto para producción sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eob/qwen3.5-4b-manchurian-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio completo con código de evaluación y `generate.py`: `hf download eob/qwen3.5-4b-manchurian-v6 --local-dir ./manchurian-v6`
- Documentación de modificaciones: `MODIFICATIONS.md` incluido en el repositorio del modelo
- Licencia y avisos: `LICENSE` y `NOTICE` incluidos en el repositorio del modelo
- Requisitos de software probados: `requirements-tested.txt` incluido en el repositorio del modelo
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada
