# luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense-GGUF

## Resumen

K2-Horizon-3.7B English 65K Vocabulary (GGUF) es una edición con vocabulario recortado del modelo denso K2-Horizon-3.7B, desarrollado originalmente por el equipo IFM. Este repositorio concreto, publicado por el usuario luluw, no entrena ningún modelo nuevo: parte de las cuantizaciones GGUF con imatrix que bartowski generó para el modelo original y reduce in situ el vocabulario del tokenizador de 250.624 a 65.536 entradas, recortando en consecuencia las matrices de embedding y de proyección de salida.

El resultado es un checkpoint de aproximadamente 4.110 millones de parámetros (frente a los 5.058 millones del original), con un 18,73 % menos de parámetros y archivos GGUF más pequeños que consumen menos memoria al cargarse. Las capas transformer, los pesos entrenados y la plantilla de chat permanecen intactos; solo se han eliminado filas de embedding y de salida correspondientes a tokens descartados, copiadas byte a byte desde el tensor cuantizado original sin descomprimir ni recuantizar.

La relevancia de esta variante es la eficiencia de memoria en despliegues en inglés: al reducir el vocabulario, cada archivo GGUF ocupa menos y encaja mejor en GPUs de consumo. No obstante, el propio autor advierte que el recorte de vocabulario no acelera la generación de tokens, ya que el coste computacional de las capas transformer no cambia, y que el modelo deja de ser adecuado para uso multilingüe o para código, donde el tokenizador original ofrecía mejor cobertura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia K2-Horizon), pesos originales sin modificar salvo embedding y salida |
| Parametros totales | 4.110.604.800 (~4,1 B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (la nomenclatura del modelo indica 65K de vocabulario, no contexto; el contexto no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | GGUF con imatrix y layouts por tensor de bartowski (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia K2-Horizon, con pesos entrenados por el equipo IFM sobre los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data. Este repositorio no constituye un nuevo preentrenamiento ni un fine-tuning: es una derivación del checkpoint `luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense`, que a su vez recorta el vocabulario de `IFM/K2-Horizon-3.7B`. El proceso de cuantización lo realizó bartowski con llama.cpp release b11462, usando una imatrix y layouts por tensor calculados específicamente para este modelo.

La innovación técnica de esta release es el recorte directo sobre los GGUF ya cuantizados. Se seleccionaron los tokens retenidos con una mezcla de `{"eng": 0.95, "chat": 0.05}` sobre texto inglés de FineWeb-2 y ejemplos renderizados con la plantilla de chat; los ids se renumeraron en orden ascendente. Las filas de `token_embd.weight` y `output.weight` correspondientes a tokens conservados se copiaron byte a byte desde el tensor cuantizado fuente (la cuantización es por fila, de modo que se pueden cortar filas sin descomprimir), por lo que son bit-idénticas al cuantizado original. El tokenizador es un BPE a nivel de byte podado (entradas, scores, tipos y reglas de merge), sin introducir token `<unk>`: el texto con tokens eliminados se representa con piezas más pequeñas. Los tokens especiales, de chat, de razonamiento y de tool-call se conservan con ids remapeados y la plantilla de chat no cambia. El resto de tensores permanece intacto respecto a los archivos de bartowski.

## Capacidades

- Generación de texto y conversación en inglés, con soporte de plantilla de chat (`<|ifm|im_start|>`, `<|ifm|im_end|>`).
- Modo de razonamiento o thinking, con token `<|ifm|think>` en la plantilla de prompt.
- Tool calling / function calling: la plantilla incluye una sección `# Tools` para definir herramientas disponibles.
- Conversación multi-turno con roles system, user y assistant.
- Capacidades multilingües: limitadas; el vocabulario recortado prioriza inglés y penaliza otros idiomas.
- Generación de código: posible pero degradada, ya que el código puede fragmentarse en más tokens y de menor tamaño que con el vocabulario original.
- Compatible con endpoints y con llama.cpp para despliegue local.

## Casos de uso

- Chat en inglés en local sobre GPU de consumo: el recorte de vocabulario reduce el tamaño de los GGUF y la memoria necesaria al cargar, lo que facilita ejecutar el modelo en tarjetas con VRAM limitada frente a la versión original de 5.058 millones de parámetros.
- Asistente conversacional multi-turno en inglés: la plantilla de chat con roles system/user/assistant y los tokens especiales remapeados permiten integrarlo en aplicaciones de diálogo sin cambios en el formato de prompt.
- Agentes con tool calling en inglés: la plantilla incluye definición de herramientas y tokens de tool-call, adecuada para flujos donde el modelo decide invocar funciones y encadenar pasos.
- Razonamiento con modo thinking: el token `<|ifm|think>` permite separar la fase de razonamiento de la respuesta final en tareas de análisis o resolución de problemas en inglés.
- Despliegue en entornos con restricciones de memoria: al ser más pequeño que el GGUF equivalente de bartowski, encaja mejor en servidores con presupuesto de VRAM ajustado o en escenarios de múltiples instancias por GPU.
- Prototipado y experimentación con llama.cpp: al ser GGUF compatible con llama.cpp, sirve para probar pipelines de inferencia local y comparar el efecto del recorte de vocabulario frente al modelo original.
- Generación de texto en inglés de propósito general: redacción, resumen y respuestas factuales dentro de las capacidades del modelo base, siempre que el workload sea predominantemente anglófono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica en la información proporcionada; el autor indica que cada GGUF es más pequeño que el equivalente de bartowski y requiere menos memoria al cargar, pero no detalla cifras por cuantización.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí para cuantizaciones bajas de un modelo de ~4,1 B de parámetros, pero no se especifican modelos concretos ni cifras de VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF, cuantizado con release b11462) y endpoints compatibles; otras opciones como vLLM, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte explícitamente que el recorte de vocabulario no acelera la generación ni aumenta los tokens por segundo, ya que solo reduce las matrices de embedding y salida, no el coste de las capas transformer.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| K2-Horizon-3.7B-eng-65k-trimmed-4B-dense-GGUF (este) | ~4,1 B | 65.536 | no disponible | Apache 2.0 | GGUF | Recorte de vocabulario sobre GGUF de bartowski; solo inglés |
| IFM/K2-Horizon-3.7B (original) | 5.058.255.360 | 250.624 | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base original; vocabulario completo, mejor cobertura multilingüe y de código |
| bartowski/K2-Horizon-3.7B-GGUF | 5.058.255.360 (aprox.) | 250.624 | no disponible | no disponible en la informacion proporcionada | GGUF | Cuantizaciones imatrix originales de bartowski; mayor tamaño de archivo y memoria |
| luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense | ~4,1 B | 65.536 | no disponible | Apache 2.0 | safetensors (checkpoint completo) | Checkpoint recortado del que derivan estos GGUF; incluye `vocab_mapping.json` |

## Limitaciones y advertencias

- El recorte de vocabulario degrada el rendimiento en idiomas distintos del inglés y en código: el texto puede dividirse en más tokens y de menor tamaño, lo que alarga la secuencia y puede reducir la calidad de generación.
- No es un sustituto multilingüe del tokenizador original; su uso previsto es chat y generación de texto en inglés.
- El recorte de vocabulario no acelera la inferencia: no debe esperarse mayor velocidad de generación ni más tokens por segundo solo por usar esta variante.
- Los pesos de embedding y salida retenidos son bit-idénticos al cuantizado original; no se han reentrenado, por lo que cualquier limitación del modelo base se mantiene.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base original y del trabajo de cuantización de bartowski, a quien el autor pide apoyo explícitamente.
- El autor recomienda evaluar estos archivos sobre el workload objetivo antes de desplegarlos en producción, especialmente si el multilingüismo o el código son importantes.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense-GGUF
- Checkpoint recortado base: https://huggingface.co/luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense
- Modelo original: https://huggingface.co/IFM/K2-Horizon-3.7B
- Cuantizaciones GGUF originales de bartowski: https://huggingface.co/bartowski/K2-Horizon-3.7B-GGUF
- Código de entrenamiento: https://github.com/ifm-ai/xllm
- Código de evaluación: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Release de llama.cpp usada para cuantizar: https://github.com/ggml-org/llama.cpp/releases/tag/b11462
- Apoyo al cuantizador: https://ko-fi.com/bartowski
