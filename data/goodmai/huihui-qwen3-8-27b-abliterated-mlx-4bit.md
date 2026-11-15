# goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit

## Resumen

Huihui-Qwen3.8-27B-abliterated-mlx-4Bit es una cuantizacion en 4 bits en formato MLX del modelo Huihui-Qwen3.8-27B-abliterated, publicado por el usuario goodmai. Se trata de una conversión derivada de la versión MLX del repositorio AutisticAF/Huihui-Qwen3.8-27B-abliterated, que a su vez parte del modelo base huihui-ai/Huihui-Qwen3.8-27B-abliterated. El pipeline declarado es image-text-to-text, con arquitectura Qwen3.5 según los tags del repositorio y 26.895.993.856 parámetros totales según el recuento real de safetensors.

La particularidad del modelo es doble: por un lado, la variante "abliterated" implica que se ha aplicado una técnica de ablación de direcciones de rechazo en el espacio de activaciones, orientada a eliminar los comportamientos de negativa del modelo original; por otro, la cuantizacion MLX 4-bit lo hace ejecutable en hardware Apple Silicon mediante la librería mlx-lm, sin necesidad de Python en el caso del runtime Basalt que promociona el autor.

Su relevancia es acotada: no es un modelo de referencia ni un lanzamiento oficial, sino un artefacto de conversión para un entorno concreto (macOS con Apple Silicon). El repositorio no incluye información sobre datos de entrenamiento, benchmarks ni idiomas soportados, y el número de descargas y likes es cero en el momento de la consulta, lo que sugiere un uso muy limitado o reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer, según tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `transformers`, runtime `mlx-lm`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `qwen3_5` y la etiqueta de pipeline `image-text-to-text`, que sugiere capacidades multimodales de entrada imagen-texto. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se documenta el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, fases de RLHF o DPO.

Lo que sí se puede afirmar con los datos aportados es el proceso de derivación: el modelo parte de huihui-ai/Huihui-Qwen3.8-27B-abliterated, se convierte a formato MLX con mlx-lm versión 0.31.2 en el repositorio AutisticAF, y goodmai publica una variante 4-bit. La técnica "abliterated" consiste en la ablación de direcciones de activación asociadas al rechazo, un procedimiento de edición de pesos que no requiere reentrenamiento completo pero que modifica el comportamiento del modelo de forma sustancial en materia de seguridad y alineación.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), aunque no se detallan las capacidades de visión concretas.
- Comportamiento "uncensored" por la ablación aplicada: el modelo tiende a no rechazar peticiones que el modelo original declinaría.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios HTTP.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-lm.
- Soporte de plantilla de chat (`apply_chat_template`) en el tokenizer, según el ejemplo de la model card.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni capacidades multilingües específicas.

## Casos de uso

- Experimentación local en macOS: el modelo está pensado para ejecutarse con mlx-lm en equipos Apple Silicon, lo que permite probar un modelo de ~27 B en 4 bits sin GPU dedicada ni CUDA, usando el runtime Basalt o scripts de Python.
- Investigación sobre alineación y ablación: útil para estudiar cómo la eliminación de direcciones de rechazo afecta al comportamiento del modelo en dominios sensibles, comparando respuestas frente al modelo base no abliterado.
- Prototipado de asistentes conversacionales sin filtros: para entornos de investigación donde se necesita un modelo que no aplique negativas por defecto, con la cautela de que la licencia Apache 2.0 no exime de responsabilidad sobre el contenido generado.
- Evaluación de pipelines multimodales: al declarar `image-text-to-text`, puede emplearse para probar flujos de entrada imagen-texto en local, aunque la falta de documentación sobre visión limita su uso en producción.
- Pruebas de integración con endpoints compatibles: el tag `endpoints_compatible` permite montar un servidor local y validar clientes que consuman una API tipo OpenAI.
- Benchmarking de cuantizacion: comparar la calidad de la versión 4-bit MLX frente al modelo original en tareas de razonamiento y generación, midiendo la degradación introducida por la cuantizacion.
- Desarrollo de aplicaciones macOS nativas: el runtime Basalt (macOS 27+, Apple Silicon, sin Python) permite empaquetar el modelo en una app Swift, útil para prototipos de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,2 GB, por lo que la inferencia en 4 bits requiere del orden de 15-16 GB de memoria unificada, más overhead de contexto y KV cache.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente; encaja en equipos con 24 GB o más (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). No cabe en configuraciones de 16 GB con contexto amplio.
- GPU NVIDIA: no es el objetivo del formato MLX; para CUDA habría que usar el modelo base en safetensors estándar o una cuantizacion GGUF/AWQ, no disponible en este repo.
- Despliegue: mlx-lm (`pip install mlx-lm`), runtime Basalt (macOS 27+, Apple Silicon, sin Python) y servidor REST mediante `basalt serve --model ... --rest`.
- Latencia y throughput: no disponibles; dependen del chip Apple Silicon concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit | 26,9 B | no disponible | MLX 4-bit | apache-2.0 | Objeto de esta ficha; conversión de goodmai |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 26,9 B (presumible) | no disponible | safetensors | apache-2.0 | Modelo base abliterated, sin cuantizar |
| AutisticAF/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit | 26,9 B (presumible) | no disponible | MLX 4-bit | apache-2.0 | Fuente directa de la conversión de goodmai |

No se dispone de datos de benchmarks ni de modelos comparables de otros fabricantes con los que contrastar rendimiento; la comparativa se limita a la cadena de derivación del propio modelo.

## Limitaciones y advertencias

- La ablación elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- La cuantizacion 4-bit introduce degradación adicional sobre el modelo original, especialmente en tareas de razonamiento y matemáticas; no se documenta la magnitud de esa pérdida.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento correcto en castellano o en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el usuario.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (2026-11-15), lo que indica ausencia de validación comunitaria.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- La model card está mayoritariamente en ruso e incluye botones promocionales del runtime Basalt; no aporta documentación técnica sustantiva sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Fuente MLX directa: https://huggingface.co/AutisticAF/Huihui-Qwen3.8-27B-abliterated-mlx-4Bit
- Runtime Basalt (GitHub): https://github.com/goodmai/basalt
- Demo Basalt en Hugging Face Spaces: https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FHuihui-Qwen3.8-27B-abliterated-mlx-4Bit&role=chat
- mlx-lm (librería de inferencia): no se proporciona enlace directo en la información disponible
