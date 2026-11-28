# masahiroid/mdeberta-v3-base-gguf

## Resumen

mdeberta-v3-base-gguf es una conversión al formato GGUF del modelo encoder multilingüe microsoft/mdeberta-v3-base, publicada por el usuario masahiroid. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo checkpoint original (revisión `a0484667b22365f84929a935b5e50a51f71f159d`) empaquetado con un esquema GGUF personalizado y tensores en F32, pensado para ejecutarse mediante un runtime MLX propio sobre Apple Silicon. El modelo subyacente es un encoder DeBERTa-v3 de 278 millones de parámetros que devuelve estados ocultos a nivel de token, sin cabeza de tarea añadida.

Su relevancia es acotada y muy específica: sirve para quien quiera ejecutar el encoder multilingüe de Microsoft en Macs con chip Apple sin depender de PyTorch, manteniendo una paridad numérica casi exacta con la implementación original (diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 en seis casos deterministas). No es un modelo generativo ni un modelo listo para producción sin ajuste fino posterior.

Es importante subrayar que, pese a la extensión `.gguf`, este fichero no es compatible con llama.cpp, Ollama ni LM Studio: usa el esquema `general.architecture=hf-native-mlx-v1`, conserva los nombres de tensor originales de Hugging Face y requiere el cargador MLX incluido en el repositorio. El repositorio ocupa 1,1 GB y acumula 178 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder con atención disentangled y ReLU-Sparse Mixture-of-Experts en el encoder de atención); empaquetado GGUF con esquema `hf-native-mlx-v1` |
| Parametros totales | 278.218.752 |
| Parametros activos | no disponible (no es un modelo MoE generativo; usa atención disentangled con expertos en el encoder) |
| Longitud de contexto | no disponible (la model card indica que se preserva el máximo del modelo fuente, sin cifra concreta) |
| Tipos de cuantizacion | F32 únicamente (la model card indica explícitamente que no es una cuantización de 4 bits) |
| Idiomas soportados | multilingüe (sin listado explícito en la información disponible) |
| Licencia | MIT (pesos originales; conversor y runtime también MIT) |
| Formato de pesos | GGUF con esquema personalizado `hf-native-mlx-v1`; también disponibles variantes MLX, Core ML y Core AI en repositorios separados |

## Arquitectura y entrenamiento

El modelo base microsoft/mdeberta-v3-base es un encoder DeBERTa-v3 multilingüe. DeBERTa-v3 introduce atención disentangled (vectores de contenido y posición separados en el cálculo de atención) y sustituye la máscara de atención tradicional por una atención con sesgo relativo, además de emplear ReLU-Sparse Mixture-of-Experts en las capas de atención para aumentar la capacidad sin incrementar proporcionalmente el coste computacional. Al ser un encoder bidireccional, produce representaciones contextuales por token, no texto generado.

Esta ficha corresponde exclusivamente a la conversión de formato, no a un reentrenamiento. No hubo ajuste fino, ni RLHF, ni DPO, ni sustitución de checkpoint. La model card documenta una validación de paridad numérica frente a la implementación original en PyTorch sobre seis casos deterministas (emociones en inglés, texto neutro de recuperación, japonés, entrada vacía y truncamiento), con diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876. El entorno de conversión verificado incluye PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, GGUF 0.19.0 y coreai-torch 0.4.3; la compatibilidad fuera de ese entorno no está garantizada.

## Capacidades

- Generación de representaciones contextuales a nivel de token (estados ocultos), no generación de texto.
- Codificación multilingüe de frases y documentos (el modelo base es multilingüe; la lista exacta de idiomas no está detallada en la información disponible).
- Base para ajuste fino en tareas descendentes: clasificación de secuencias, clasificación de tokens (NER, POS), extracción de características y similitud semántica.
- Soporte de entradas de longitud variable hasta el límite del modelo fuente en el runtime MLX/GGUF; las exportaciones Core ML y Core AI usan formas fijas (lote 1, longitud 128).
- No incluye tool calling ni function calling.
- No incluye capacidades de agente ni razonamiento multi-paso.
- No incluye visión, audio ni modo de pensamiento.
- No incluye cabeza de tarea: cualquier uso práctico requiere añadir y entrenar una cabeza específica.

## Casos de uso

- Clasificación de texto multilingüe en local: usar los estados ocultos del encoder como entrada a un clasificador entrenado sobre ellos (por ejemplo, detección de sentimiento o categorización de tickets) y ejecutarlo en un Mac con Apple Silicon mediante el runtime MLX incluido.
- Extracción de características para búsqueda semántica: generar embeddings por token o pooled para alimentar un índice vectorial en un pipeline de recuperación de documentos, aprovechando la naturaleza multilingüe del modelo base.
- Reconocimiento de entidades nombradas (NER): ajustar una cabeza de clasificación de tokens sobre el encoder para extraer entidades en textos multilingües dentro de una aplicación de escritorio en macOS.
- Prototipado rápido en Mac sin PyTorch: validar pipelines de NLP con el cargador MLX incluido, útil para desarrolladores que quieran evitar la pila de PyTorch en su entorno local.
- Evaluación de paridad de conversiones: usar los scripts y `validation.json` incluidos como referencia para verificar conversiones propias de modelos DeBERTa a GGUF/MLX.
- Investigación sobre formatos de serialización: estudiar el esquema `hf-native-mlx-v1` como ejemplo de empaquetado GGUF que preserva nombres de tensor de Hugging Face, útil para trabajar en herramientas de interoperabilidad.
- Filtrado y moderación de contenido offline: ajustar un clasificador binario sobre las representaciones del encoder y desplegarlo en local para prefiltrar texto sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comprobaciones de paridad numérica de la conversión (diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 en seis casos), que no constituyen una evaluación de calidad de tarea ni de latencia.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 1,1 GB con tensores F32; en Apple Silicon se emplea memoria unificada, por lo que se necesita al menos ese espacio más el overhead del runtime MLX.
- GPU recomendadas: Apple Silicon Mac (requisito explícito del runtime MLX incluido). No se documenta soporte para GPU NVIDIA, AMD ni otras plataformas.
- Cabe en GPU de consumo: sí, en Macs con chip Apple Silicon; no está soportado en GPUs de consumo tipo RTX 4090 mediante este paquete.
- Opciones de despliegue: únicamente el cargador MLX incluido (`runtime_mlx.Model`). No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI. Existen variantes Core ML y Core AI en repositorios separados para despliegue en el ecosistema Apple.
- Latencia y throughput: no disponibles; la model card indica explícitamente que las validaciones no son benchmarks de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| masahiroid/mdeberta-v3-base-gguf | 278.218.752 | no disponible | GGUF esquema `hf-native-mlx-v1` (F32) | MIT | Solo runtime MLX en Apple Silicon |
| microsoft/mdeberta-v3-base | 278.218.752 (mismo checkpoint) | no disponible | safetensors/PyTorch | MIT | PyTorch, Transformers, ONNX |
| masahiroid/mdeberta-v3-base-mlx | mismo checkpoint | no disponible | MLX | MIT | MLX en Apple Silicon |
| masahiroid/mdeberta-v3-base-coreml | mismo checkpoint | 128 (forma fija) | Core ML | MIT | Core ML en Apple |
| masahiroid/mdeberta-v3-base-coreai | mismo checkpoint | 128 (forma fija) | Core AI | MIT | Core AI en Apple |

No se dispone de datos de benchmarks que permitan comparar rendimiento con otros encoders de tamaño similar (por ejemplo, XLM-R base o RemBERT); no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo estados ocultos; no puede usarse como chatbot ni para completar texto sin una cabeza de tarea entrenada.
- No incluye cabeza de tarea: requiere ajuste fino descendente para cualquier aplicación práctica.
- Incompatibilidad de formato: a pesar de la extensión `.gguf`, no funciona con llama.cpp, Ollama ni LM Studio; solo con el runtime MLX incluido.
- Dependencia de plataforma: requiere Apple Silicon Mac; no hay soporte documentado para otras plataformas.
- Contexto no especificado: la model card no indica la longitud máxima exacta del modelo fuente; solo que se preserva el límite original.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los clasificadores ajustados sobre el encoder pueden producir predicciones erróneas o sobreconfiadas, especialmente en dominios fuera de distribución.
- Sesgos: no documentados en la información disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento originales.
- Licencia: MIT permite uso comercial, pero la model card aclara que no se implica ninguna certificación de seguridad ni licencia comercial adicional; los términos del modelo fuente figuran en `LICENSE`.
- Entorno verificado limitado: la compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, etc.) no está garantizada.
- Idiomas: aunque el modelo base es multilingüe, la información disponible no detalla la lista exacta de idiomas soportados ni su cobertura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/mdeberta-v3-base-gguf
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Revisión del modelo base usada: https://huggingface.co/microsoft/mdeberta-v3-base/tree/a0484667b22365f84929a935b5e50a51f71f159d
- Variante MLX: https://huggingface.co/masahiroid/mdeberta-v3-base-mlx
- Variante Core ML: https://huggingface.co/masahiroid/mdeberta-v3-base-coreml
- Variante Core AI: https://huggingface.co/masahiroid/mdeberta-v3-base-coreai
