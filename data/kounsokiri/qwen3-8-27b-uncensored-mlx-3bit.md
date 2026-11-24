# Kounsokiri/Qwen3.8-27B-Uncensored-mlx-3Bit

## Resumen

Kounsokiri/Qwen3.8-27B-Uncensored-mlx-3Bit es una conversion al formato MLX (Apple Silicon) del modelo orcarouter/Qwen3.8-27B-Uncensored, un fine-tune de la familia Qwen3 orientado a vision-lenguaje y a la eliminacion de restricciones de alineacion (abliterated/uncensored). Lo publica el usuario Kounsokiri el 24 de noviembre de 2026 y esta pensado para ejecutarse con la libreria mlx-lm (version 0.31.2) en hardware de Apple.

El modelo cuenta con 26.895.993.856 parametros totales (aproximadamente 27B) y se distribuye cuantizado a 3 bits, lo que reduce el repositorio a 11,8 GB frente al peso en bf16 del modelo original. La pipeline declarada es image-text-to-text, por lo que admite entradas de imagen y texto, y entre sus etiquetas figuran function-calling, reasoning y red-teaming.

Su relevancia es acotada y muy especifica: sirve para investigadores de seguridad y red teams que necesitan un modelo multimodal sin filtros de rechazo ejecutable en un Mac con memoria unificada, no como modelo de produccion general. La model card es practicamente un volcado de metadatos de conversion, sin documentacion de entrenamiento, benchmarks ni detalles de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), familia Qwen3; detalles no disponibles |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits en formato MLX (unica variante publicada en este repo) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (repo de 11,8 GB); tags de safetensors y transformers en el modelo base |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Herramienta de conversion | mlx-lm 0.31.2 |
| Fecha de publicacion | 2026-11-24 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas: se trata de un transformer de la familia Qwen3 con capacidad de vision (pipeline image-text-to-text), derivado por fine-tune del modelo orcarouter/Qwen3.8-27B-Uncensored. La etiqueta "mtp" sugiere soporte de multi-token prediction, y "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para retirar el comportamiento de negativa aprendido en el post-entrenamiento.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los detalles del proceso de abliteration. La unica operacion documentada es la conversion a MLX con mlx-lm 0.31.2 y la cuantizacion a 3 bits; no se especifica el esquema exacto de cuantizacion (group size, bits por componente) ni si se cuantizaron tambien las capas del encoder visual.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Procesamiento de imagenes junto con texto (image-text-to-text), segun la pipeline declarada.
- Razonamiento (tag "reasoning") y soporte declarado de function-calling.
- Capacidad multimodal orientada a tareas de comprension de imagen.
- Modelo "uncensored"/"abliterated": no aplica rechazos de alineacion estandar, lo que lo hace apto para red-teaming.
- No se documentan capacidades de audio, thinking mode explicito ni agentes multi-paso mas alla de las etiquetas.

## Casos de uso

- Red-teaming y evaluacion de seguridad: sirve como modelo objetivo sin filtros para probar ataques de jailbreak, medir tasas de cumplimiento de peticiones daninas y comparar con la version alineada.
- Investigacion sobre abliteration: permite estudiar como la ablacion de direcciones de rechazo afecta a capacidades, coherencia y sesgos frente al modelo base orcarouter.
- Prototipado local en Apple Silicon: con 11,8 GB en 3 bits cabe en Macs con memoria unificada de 16 GB o mas, lo que facilita experimentos sin GPU dedicada.
- Pruebas de pipelines multimodales: validar integraciones image-text-to-text en entornos de desarrollo antes de desplegar en infraestructura mayor.
- Evaluacion de function-calling sin restricciones: comprobar el comportamiento de tool calling en escenarios adversariales o de borde.
- Docencia y demos de seguridad de IA: ilustrar de forma controlada las diferencias entre modelos alineados y no alineados.
- Generacion de datos sinteticos para entrenamiento de clasificadores de contenido: usar el modelo para producir ejemplos que alimenten filtros de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon exclusivamente: el formato MLX solo se ejecuta con mlx-lm en chips de la serie M de Apple.
- VRAM/memoria unificada estimada: alrededor de 12 GB para los pesos en 3 bits, mas overhead de KV cache y encoder visual; se recomienda un minimo de 16 GB de memoria unificada.
- Equipos compatibles: Mac con M1/M2/M3/M4 (Pro, Max o Ultra); los modelos base de 8 GB no son viables.
- No es desplegable en GPU NVIDIA/AMD con vLLM, TGI o llama.cpp, ya que los pesos estan en formato MLX.
- No se dispone de datos de latencia ni throughput publicados.
- Para el modelo base en bf16 se requeriria hardware mucho mayor (aprox. 54 GB en bf16), fuera del alcance de la mayoria de equipos de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kounsokiri/Qwen3.8-27B-Uncensored-mlx-3Bit | ~26,9B | no disponible | MLX 3-bit | apache-2.0 | Solo Apple Silicon, sin benchmarks |
| orcarouter/Qwen3.8-27B-Uncensored (base) | ~26,9B | no disponible | safetensors/bf16 | apache-2.0 | Modelo original, mayor precision |
| Qwen3 oficial (familia) | variable | no disponible | safetensors/GGUF | apache-2.0 | Version alineada de referencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: puede generar contenido danino, ilegal o sexualmente explicito; no apto para aplicaciones de cara al publico sin moderacion adicional.
- La cuantizacion a 3 bits degrada la calidad respecto al bf16 original, especialmente en razonamiento y tareas de codigo; no se documenta la magnitud de la perdida.
- Solo funciona en Apple Silicon con mlx-lm; no hay soporte para CUDA, vLLM, TGI ni llama.cpp.
- Idiomas limitados a ingles y chino; el castellano no esta soportado oficialmente.
- Riesgo elevado de alucinacion y de respuestas incoherentes por la combinacion de abliteration y cuantizacion agresiva.
- La model card no documenta contexto maximo, esquema de cuantizacion ni evaluaciones; la trazabilidad es minima.
- Aunque la licencia es apache-2.0, el uso comercial de un modelo uncensored puede conllevar riesgos legales y de reputacion; se recomienda revision juridica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Kounsokiri/Qwen3.8-27B-Uncensored-mlx-3Bit
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
