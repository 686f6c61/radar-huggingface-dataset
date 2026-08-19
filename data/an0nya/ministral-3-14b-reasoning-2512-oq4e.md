# an0nya/Ministral-3-14B-Reasoning-2512-oQ4e

## Resumen

Este repositorio contiene una cuantizacion en formato MLX del modelo mistralai/Ministral-3-14B-Reasoning-2512, producida por el autor an0nya mediante el pipeline oQ4e de oMLX sobre un Mac Mini con 16 GB de RAM. Se trata de una build solo texto: se ha eliminado el encoder de vision Pixtral del modelo base, que es un VLM de la familia Mistral 3. El resultado pesa 7,94 GB repartidos en 2 shards safetensors y es compatible con cualquier runtime MLX (mlx-lm).

La cuantizacion es de precision mixta: parte de una base de 4 bits con group_size 64 y modo affine, pero asigna ancho de bits por tensor segun un mapa de sensibilidad medido externamente. Ademas, incorpora una matriz de importancia (imatrix) transplantada desde el GGUF de unsloth, con aproximadamente 722.000 tokens de calibracion (139 chunks × 5120 tokens), unas 10,9 veces mas datos de los que oMLX habria recopilado por su cuenta.

La relevancia de esta build es practica: permite ejecutar un modelo de razonamiento de 14B en equipos Apple Silicon con memoria limitada. No obstante, el autor advierte explicitamente que no se han realizado comparaciones de perplejidad ni benchmarks frente a una cuantizacion plana de 4 bits del mismo modelo, por lo que cualquier afirmacion de calidad superior es especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (transformer con attention con temperature scaling estilo Llama-4), solo texto |
| Parametros totales | 2.195.051.520 (segun metadatos safetensors; el modelo base se declara como 14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits base, precision mixta por tensor, 8 bits para lm_head y embed_tokens) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, compatible con mlx-lm) |

## Arquitectura y entrenamiento

El modelo base es mistralai/Ministral-3-14B-Reasoning-2512, un VLM de Mistral AI de la familia Mistral 3 con encoder de vision Pixtral. Esta build elimina la torre de vision y conserva solo el componente de texto. La arquitectura del transformer usa attention con temperature scaling posicional (estilo Llama-4), lo que provoca un fallo conocido en la sonda de firmas de oMLX: el argumento `attn_scale` no se pasa, y todas las capas devuelven `None` en la medicion de sensibilidad. El autor solvento este bug con un script propio que importa el cargador de calibracion de oMLX y sobrescribe la llamada rota.

La cuantizacion usa el pipeline oQ4e de oMLX: base group_size=64, bits=4, modo affine, con asignacion de bits por tensor basada en un mapa de sensibilidad medido externamente (MSE relativo al re-cuantizar cada capa un bit menos, calculado en float32). La curva de sensibilidad resultante es asimetrica: las capas L0-L2 presentan un pico de entrada (0,01648), L3 es el minimo (0,000089, 185 veces por debajo de L2), y desde L8 hasta la salida hay una subida casi monotonica hasta 0,01858 en L38-L39. Las capas mas comprimibles son las tempranas (L3-L15), mientras que las primeras tres y las ultimas cinco cargan con el mayor coste.

La imatrix se obtuvo del GGUF de unsloth, convertida al formato oQe nativo de oMLX mediante un script incluido en el repo (`gguf_imatrix_to_oqe.py`). La conversion funciona porque tanto la imatrix de llama.cpp como el cache oQe almacenan la misma estadistica (suma de activaciones de entrada al cuadrado por canal) bajo las mismas claves (`.in_sum2` / `.counts`). Los tensores `lm_head` y `embed_tokens` no tienen entrada en la imatrix y reciben tratamiento estandar a 8 bits. El informe de verificacion (`oq_imatrix_report.json`) confirma 280 tensores aplicados (40 capas × 7 tensores), 0 discrepancias y 2 ausencias esperadas.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation).
- Razonamiento: el modelo base es una variante "Reasoning" de Mistral 3, orientada a tareas de inferencia y resolucion de problemas.
- Solo texto: la torre de vision fue eliminada; no acepta imagenes como entrada.
- Compatible con cualquier runtime MLX (mlx-lm, `load`/`generate`).
- No se documenta soporte de tool calling, function calling ni modo agente en esta build.

## Casos de uso

- Inferencia local en Apple Silicon con restriccion de memoria: el modelo pesa 7,94 GB y cabe en equipos con 16 GB de RAM unificada, como el Mac Mini M4 usado para producirlo.
- Razonamiento simbolico y generacion de secuencias estructuradas: el autor menciona una prueba anecdoticas en la que esta build emitio 0 de 11 cadenas de simbolos con espacios en blanco incorrectos, frente a 4 de 11 en una cuantizacion plana de 4 bits; aunque el propio autor la descarta como evidencia, sugiere un comportamiento potencialmente mejor con glifos raros.
- Prototipado de agentes conversacionales en local: al ser solo texto y compatible con mlx-lm, puede integrarse en aplicaciones Python sin dependencias de servidores externos ni GPU CUDA.
- Evaluacion y auditoria de cuantizaciones: el repo incluye los artefactos de provenance (imatrix convertida, mapa de sensibilidad, scripts de conversion y medicion) que permiten reproducir y auditar todo el proceso.
- Desarrollo de pipelines de RAG con contexto largo: aunque la longitud de contexto no se documenta en esta build, el modelo base de Mistral 3 soporta ventanas amplias; habria que validarlo en esta cuantizacion antes de usarla en produccion.
- Despliegue en entornos sin GPU: al ser MLX, se ejecuta nativamente en CPU/GPU de Apple; no requiere CUDA ni infraestructura de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente: "No perplexity or benchmark comparison has been run against a flat 4-bit quantization of the same model." La unica evidencia es una anecdota no concluyente sobre generacion de simbolos (0 de 11 errores frente a 4 de 11), que el autor califica como "not evidence". No se reportan cifras de latencia ni throughput.

## Requisitos de hardware

- Peso del modelo: 7,94 GB (2 shards safetensors).
- RAM estimada para inferencia: ~8 GB para los pesos; el proceso de cuantizacion completo requirio 16 GB de RAM unificada en un Mac Mini M4.
- La calibracion con el modelo sin cuantizar requeria ~26 GB, por lo que se uso la imatrix externa de unsloth en lugar de medirla localmente.
- GPU recomendadas: Apple Silicon (M4 o superior con 16 GB); no se documenta soporte CUDA (formato MLX).
- Opciones de despliegue: mlx-lm (`load`/`generate`), cualquier runtime MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| an0nya/Ministral-3-14B-Reasoning-2512-oQ4e | ~14B (declarado) / 2.195M (safetensors) | MLX oQ4e | no disponible | Apache-2.0 | Solo texto, precision mixta con imatrix |
| mistralai/Ministral-3-14B-Reasoning-2512 | ~14B | Original (BF16) | no disponible | Apache-2.0 | VLM con vision Pixtral |
| unsloth/Ministral-3-14B-Reasoning-2512-GGUF | ~14B | GGUF (imatrix) | no disponible | Apache-2.0 | Incluye imatrix de calibracion usada en esta build |

No hay datos de rendimiento comparativo publicados entre estas variantes.

## Limitaciones y advertencias

- Solo texto: la torre de vision Pixtral fue eliminada; no se pueden procesar imagenes. Si se necesita entrada multimodal, hay que usar el modelo original.
- Sin benchmarks verificados: el autor no ha comparado perplejidad ni rendimiento frente a una cuantizacion plana de 4 bits; cualquier afirmacion de calidad superior es especulativa.
- La imatrix fue transplantada de un GGUF de unsloth, no medida sobre el modelo original; la conversion es un remapeo de nombres de tensores, no una reinterpretacion, pero la calibracion no es nativa de oMLX.
- El mapa de sensibilidad se midio con un workaround del bug de oMLX (`attn_scale`); los resultados podrian diferir con una version corregida de oMLX.
- Riesgo de alucinacion y sesgos: no documentados para esta build; se heredan del modelo base.
- La anecdota sobre errores de espacios en blanco en simbolos no es concluyente y el autor la descarta como evidencia.
- Los metadatos safetensors reportan 2.195.051.520 parametros, lo que contradice la denominacion "14B" del modelo base; puede tratarse de un error de metadatos o de una contabilidad parcial de tensores cuantizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/an0nya/Ministral-3-14B-Reasoning-2512-oQ4e
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- GGUF de unsloth (fuente de la imatrix): https://huggingface.co/unsloth/Ministral-3-14B-Reasoning-2512-GGUF
