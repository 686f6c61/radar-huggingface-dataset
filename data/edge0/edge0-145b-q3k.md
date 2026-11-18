# Edge0/Edge0-145B-q3k

## Resumen

Edge0-145B-q3k es una cuantizacion GGUF de 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Edge0 bajo la libreria propietaria `edge0` y la licencia `edge0-community-model-1.0`. El modelo esta disenado para inferencia en el borde (edge inference) y emplea una arquitectura MoE latente (latent-moe) segun las etiquetas del autor, con soporte declarado para agentes y generacion de codigo sobre CUDA.

El dato de parametros totales registrado en safetensors es de 4.947.698.560 (aproximadamente 4,95 mil millones), una cifra que no concuerda con el nombre comercial "145B" del repositorio. El tamano del repositorio es de 106,3 GB, coherente con un modelo de mayor magnitud cuantizado, por lo que existe una discrepancia no resuelta entre la denominacion, el conteo de parametros declarado y el peso real del artefacto. Se recomienda tratar estas cifras con cautela.

El modelo acumula 112.667 descargas y 137 likes desde su creacion el 11 de noviembre de 2026, lo que sugiere una adopcion notable en el ecosistema de inferencia local. La model card publicada esta dominada por estilos CSS y no aporta informacion tecnica sustantiva sobre entrenamiento, contexto o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE latente (latent-moe) segun etiquetas del autor; detalles no disponibles |
| Parametros totales | 4.947.698.560 (registro safetensors); el nombre del repo indica 145B, discrepancia no resuelta |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 4-bit (q3k); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de una arquitectura MoE latente (etiqueta `latent-moe`) y que el modelo base es Qwen/Qwen3.8-Flash-Next. No se especifican el numero de expertos, la estrategia de enrutamiento, la dimension oculta, el numero de capas ni la ventana de atencion. Tampoco se detalla el proceso de entrenamiento del modelo base: numero de tokens, composicion del corpus, uso de RLHF, DPO u otras tecnicas de alineamiento.

La unica innovacion tecnica documentada por el autor es la orientacion a inferencia en el borde con soporte CUDA y la cuantizacion a 4 bits en formato GGUF, lo que sugiere optimizacion para despliegue en hardware con memoria limitada. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Soporte declarado para agentes (etiqueta `agent`).
- Generacion de codigo (etiqueta `coding`).
- Inferencia en el borde con aceleracion CUDA (etiquetas `edge-inference`, `cuda`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o IDE mediante servidores compatibles con la API de endpoints, aprovechando la etiqueta `coding` para autocompletado y generacion de funciones en entornos con GPU de consumo.
- Agentes autonomos de proposito general: la etiqueta `agent` sugiere uso en bucles multi-paso, aunque la ausencia de datos sobre tool calling y contexto limita la planificacion de arquitecturas complejas.
- Despliegue en el borde: gracias a la cuantizacion GGUF de 4 bits y la orientacion `edge-inference`, es adecuado para dispositivos con VRAM reducida donde no cabe un modelo de mayor precision.
- Procesamiento por lotes en estaciones de trabajo con CUDA: la etiqueta `cuda` indica soporte para aceleracion por GPU en tareas de generacion de texto a escala moderada.
- Prototipado rapido de chatbots: el pipeline `text-generation` y la naturaleza conversacional permiten montar asistentes conversacionales sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: al ser una variante q3k de un modelo base identificado, sirve para medir la degradacion de calidad frente a otras precisiones del mismo Qwen3.8-Flash-Next.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 106,3 GB, lo que sugiere que la inferencia completa requiere memoria sustancial, aunque la cuantizacion 4-bit reduce el footprint frente a precision completa.
- GPU recomendadas: no disponibles; la etiqueta `cuda` indica compatibilidad con GPUs NVIDIA, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado; la discrepancia entre el nombre (145B) y el conteo de parametros (4,95B) impide estimar con fiabilidad.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y potencialmente con Ollama; la libreria `edge0` es propietaria y su soporte de runtime no esta documentado. La etiqueta `endpoints_compatible` sugiere integracion con APIs de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-145B-q3k | 4,95B (registro) / 145B (nombre) | no disponible | edge0-community-model-1.0 | GGUF 4-bit | Cuantizacion de Qwen3.8-Flash-Next |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo base del anterior |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Discrepancia critica entre el nombre del repositorio (145B), el conteo de parametros en safetensors (4,95B) y el tamano del artefacto (106,3 GB); verificar antes de desplegar en produccion.
- La licencia `edge0-community-model-1.0` es de tipo "other" y no se ha publicado el texto completo en la informacion disponible; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- La model card no contiene informacion tecnica sustantiva (esta compuesta mayoritariamente por CSS), lo que impide evaluar sesgos, alucinacion o calidad real.
- Idiomas soportados no declarados; riesgo de comportamiento deficiente fuera del idioma principal del modelo base.
- Longitud de contexto desconocida; no apto para planificacion de pipelines que dependan de ventanas largas sin verificacion previa.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento y codigo.
- La libreria `edge0` es propietaria y su ecosistema de herramientas y mantenimiento no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-145B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Edge0/Edge0-145B-q3k/blob/main/LICENSE
