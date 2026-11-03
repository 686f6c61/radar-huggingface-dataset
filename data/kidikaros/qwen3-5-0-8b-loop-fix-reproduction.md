# KidIkaros/qwen3.5-0.8b-loop-fix-reproduction

## Resumen

`KidIkaros/qwen3.5-0.8b-loop-fix-reproduction` es una reproduccion exacta (bit-exact) de una edicion de pesos publicada en el articulo "Sparks of Weight-Space Programming" (Takehi, Teoh, Zhang, Khattab, noviembre de 2026). No se trata de un modelo entrenado de forma convencional, sino de una modificacion quirurgica de los pesos del modelo base Qwen/Qwen3.5-0.8B mediante una tecnica de programacion en el espacio de pesos (weight-space programming). El autor reconstruye la edicion `p50c` del Experimento 8 del articulo a partir del modelo base, verificando cada tensor editado mediante sha256 contra el manifiesto del checkpoint original.

El modelo resuelve un problema concreto de comportamiento: los bucles de razonamiento (loops) en los que incurren modelos pequenos durante la generacion en modo thinking. La edicion modifica 64 neuronas intermedias por capa en dos proyecciones MLP concretas, alterando unicamente el 0,016 % de los valores del modelo, sin entrenamiento ni gradientes. El resultado reportado es una reduccion drastica de los bucles: de 2/18 problemas resueltos correctamente en el modelo base a 17/18 en la reconstruccion, sobre un conjunto de 18 problemas de entrenamiento no vistos.

Con 873 millones de parametros, arquitectura Qwen3.5 y capacidades multimodales (image-text-to-text), este checkpoint es relevante para investigadores en interpretabilidad y manipulacion de pesos, no como modelo de produccion general. Su valor esta en demostrar que intervenciones de baja dimensionalidad en el espacio de pesos pueden corregir fallos de razonamiento especificos sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp16 en la verificacion reportada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B, un transformer multimodal con pipeline image-text-to-text. Sobre esa base no se realiza ningun entrenamiento: la edicion consiste en modificar 64 neuronas intermedias por capa en `layers.15.mlp.down_proj` y `layers.19.mlp.down_proj`, un total de 131.072 valores (el 0,016 % del modelo). Cada neurona se desplaza a lo largo de una direccion compartida, la "loop direction", con fuerza 6, mediante la operacion `W[:, j] <- W[:, j] - 6 * (W[:, j] . d_hat) * d_hat`. No se tocan otros tensores ni se aplican gradientes.

La innovacion tecnica es precisamente la metodologia: programacion en el espacio de pesos (weight-space programming) como alternativa al ajuste fino. El autor reconstruye la edicion usando las convenciones del `apply_edit.py` de los autores originales y verifica cada tensor editado por sha256 contra el manifiesto del checkpoint evaluado, garantizando una reproduccion bit-exact. La verificacion independiente se realiza con `generate` de HuggingFace en fp16, una muestra y 18 problemas de entrenamiento no vistos.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con mitigacion de bucles de razonamiento.
- Procesamiento multimodal image-text-to-text heredado del modelo base Qwen3.5-0.8B.
- Resolucion de problemas matematicos (el articulo reporta mejoras en MATH-500 y GSM8K bajo su protocolo completo).
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad: analizar como una direccion de baja dimensionalidad en dos capas MLP controla el comportamiento de bucle en el razonamiento, sirviendo como caso de estudio reproducible para estudiar representaciones internas.
- Reproducibilidad de articulos: validar los resultados de "Sparks of Weight-Space Programming" comparando esta reconstruccion bit-exact con el checkpoint original de los autores, gracias a la verificacion sha256 de los tensores editados.
- Correccion de fallos de razonamiento sin reentrenamiento: aplicar la metodologia de edicion de pesos a otros modelos pequenos que presenten bucles en modo thinking, usando esta ficha como referencia de implementacion.
- Prototipado de asistentes multimodales ligeros: desplegar un modelo de 873 M de parametros con capacidad image-text-to-text para demos de vision-lenguaje en entornos con recursos limitados.
- Experimentos de alineacion conductual: comparar el comportamiento del modelo base frente a la version editada en tareas de matematicas y razonamiento para medir el efecto de la intervencion.
- Docencia y formacion: ilustrar tecnicas de manipulacion directa de pesos frente a fine-tuning clasico, con un ejemplo verificable y de tamano manejable.

## Benchmarks y rendimiento

Verificacion independiente reportada por el autor sobre 18 problemas de entrenamiento no vistos, 1 muestra, fp16, `generate` de HuggingFace:

| Modelo | Thinking cerrado | Correctos |
|---|---|---|
| Base (Qwen3.5-0.8B) | 2/18 (11 %) | — |
| Esta reconstruccion | 17/18 (94 %) | 12/18 (67 %) |

Se rescatan 15 de los 16 casos con bucle del modelo base, sin regresiones. El autor advierte que es una muestra pequena (n=18) y que se trata de replicacion de mecanismo, no de una puntuacion de benchmark. El articulo reporta, bajo su protocolo completo, MATH-500 de 7,9 % a 48,1 % y GSM8K de 13,8 % a 67,1 %. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16 (tamano del repo); en cuantizaciones de 8 bits o 4 bits cabria por debajo de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (loop-fix reproduction) | 873 M | no disponible | 17/18 thinking cerrado (n=18) | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | 2/18 thinking cerrado (n=18) | no disponible | HuggingFace |
| RikiyaT/Qwen3.5-0.8B-weight-space-programming (original) | 0,8 B | no disponible | MATH-500 48,1 %, GSM8K 67,1 % (protocolo del articulo) | no disponible | HuggingFace |
| KidIkaros/qwen3.5-0.8b-loop-fix (variante diagnosticada) | 0,8 B | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Los resultados de verificacion se basan en una muestra pequena (18 problemas, 1 muestra); no deben interpretarse como una puntuacion de benchmark generalizable.
- Es una reproduccion de investigacion, no un modelo afinado para produccion; no se documentan evaluaciones de seguridad, sesgos ni robustez.
- La edicion solo afecta a dos capas MLP (`layers.15` y `layers.19`); su efecto sobre capacidades distintas del razonamiento matematico no esta caracterizado.
- No se dispone de informacion sobre idiomas soportados, contexto maximo ni cuantizaciones validadas; conviene consultar la model card del base Qwen/Qwen3.5-0.8B.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de 0,8 B, cabe esperar limitaciones propias de su tamano.
- Licencia apache-2.0 declarada, lo que permite uso comercial, pero debe verificarse que la licencia del modelo base Qwen3.5-0.8B sea compatible.
- El checkpoint depende de la convencion `apply_edit.py` de los autores originales; cambios en el base o en el pipeline de transformers podrian romper la reproducibilidad bit-exact.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KidIkaros/qwen3.5-0.8b-loop-fix-reproduction
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint original de los autores: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Blog del articulo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Variante diagnosticada del mismo fix: https://huggingface.co/KidIkaros/qwen3.5-0.8b-loop-fix
