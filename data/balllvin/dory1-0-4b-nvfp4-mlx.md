# balllvin/Dory1.0-4B-NVFP4-MLX

## Resumen

Dory1.0-4B-NVFP4-MLX es una conversión al formato MLX del modelo NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4, publicada por el usuario balllvin. El modelo original lo desarrolla NVIDIA dentro de su familia Nemotron Labs y llega cuantizado en NVFP4 (formato de coma flotante de 4 bits definido por NVIDIA), un esquema de precisión ultra-baja orientado a maximizar el rendimiento en hardware Blackwell. Esta variante concreta reempaqueta esos pesos para que puedan ejecutarse con la librería MLX de Apple sobre silicio de la serie M.

El modelo cuenta con 3.975.229.440 parámetros (aproximadamente 4.000 millones) y está orientado a generación de texto y conversación. El repositorio ocupa 3,2 GB, lo que refleja la compresión propia de los 4 bits. La ficha de Hugging Face lo etiqueta únicamente para inglés, con licencia OpenMDW-1.1 y acceso restringido que exige aceptar condiciones en la plataforma.

Su relevancia práctica es doble: por un lado, permite probar en un Mac un modelo Nemotron de 4B con cuantización agresiva sin depender de GPUs NVIDIA; por otro, sirve como ejemplo de la cadena de portabilidad NVFP4 → MLX, un flujo todavía poco común y que conviene evaluar con cautela por la doble cuantización implícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia NVIDIA Nemotron Labs; transformer segun convencion de la familia, sin confirmar en la informacion proporcionada) |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante) reempaquetado para MLX; no se documentan otras variantes en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4. Lo unico confirmado es que el modelo original emplea el formato NVFP4, un esquema de cuantizacion de 4 bits en coma flotante con escala por bloques disenado por NVIDIA para acelerar la inferencia en GPUs Blackwell manteniendo una fidelidad superior a la cuantizacion entera de 4 bits.

La innovacion tecnica de esta publicacion concreta es el reempaquetado de esos pesos NVFP4 al formato nativo de MLX, de modo que el modelo pueda cargarse con la libreria de Apple en chips de la serie M. Esto implica una conversion desde un esquema de cuantizacion propietario de NVIDIA a las estructuras de MLX; no se documenta en la informacion disponible si media una de-cuantizacion y re-cuantizacion completa ni que impacto exacto tiene sobre la perplejidad respecto al original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Nemotron Labs.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion en Apple Silicon mediante MLX.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX en un Mac con chip M-series para experimentar con un Nemotron de 4B cuantizado a 4 bits sin GPU dedicada, gracias a los 3,2 GB de pesos.
- Asistentes conversacionales en ingles: desplegar un chatbot de proposito general en aplicaciones de escritorio para macOS donde la inferencia en local evita enviar datos a la nube.
- Evaluacion comparativa de cuantizacion: usar esta variante frente al modelo NVFP4 original para medir la degradacion introducida por el reempaquetado a MLX en tareas de generacion.
- Generacion de texto en herramientas de desarrollo para macOS: integrar el modelo en editores o scripts que necesiten completado y redaccion en ingles con latencia baja y sin conexion.
- Educacion e investigacion: servir como caso de estudio del flujo de conversion NVFP4 a MLX y de las decisiones de empaquetado de pesos en modelos de 4 bits.
- Demos y pruebas de concepto: por su tamano reducido, es adecuado para validar pipelines de inferencia MLX antes de escalar a modelos mayores de la familia Nemotron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: en torno a 3,2 GB solo para los pesos, mas overhead de activaciones y cache KV; un Mac con 16 GB de memoria unificada deberia ser suficiente para contexto moderado.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y variantes Pro/Max/Ultra) al usar MLX; no es ejecutable en CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior, aunque 16 GB es lo recomendable.
- Opciones de despliegue: libreria MLX (mlx-lm); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| balllvin/Dory1.0-4B-NVFP4-MLX | 3,98B | no disponible | NVFP4 reempaquetado a MLX | OpenMDW-1.1 (gated) | Apple Silicon (MLX) |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 (original) | 3,98B | no disponible | NVFP4 | OpenMDW-1.1 (gated) | GPUs NVIDIA Blackwell |
| Alternativas de ~4B en MLX | no disponible | no disponible | 4 bits | variable | Apple Silicon |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta del repositorio; no es adecuado para produccion en castellano.
- El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia OpenMDW-1.1 debe revisarse con detalle antes de cualquier uso comercial; no se garantiza permiso implicito para todos los escenarios.
- La doble transformacion (NVFP4 original → MLX) puede introducir degradacion adicional de calidad no cuantificada en la informacion disponible.
- Riesgo de alucinacion inherente a modelos de ~4B, especialmente en tareas de conocimiento factual y razonamiento largo.
- Sin datos publicados de contexto maximo, tool calling ni benchmarks, lo que dificulta planificar su uso en produccion.
- Dependencia exclusiva del ecosistema MLX y de hardware Apple; no hay ruta documentada para CUDA u otras plataformas.
- Repositorio con 0 likes y 430 descargas en el momento de la consulta: trazabilidad y mantenimiento limitados por parte del publicador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Libreria MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
