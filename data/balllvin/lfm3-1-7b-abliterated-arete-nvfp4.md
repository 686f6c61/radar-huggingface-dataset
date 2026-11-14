# balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4

## Resumen

LFM3-1.7B-Abliterated-Arete-NVFP4 es una cuantizacion en formato NVFP4 (4 bits de coma flotante con escalado por bloques, tecnologia de NVIDIA ModelOpt) del modelo orcarouter/LFM3-1.7B-abliterated, que a su vez es una version "abliterated" (con las direcciones de rechazo eliminadas del espacio de activaciones) de LFM3-1.7B de Liquid AI. El autor de esta publicacion es el usuario de Hugging Face balllvin, y el resultado se ha ajustado adicionalmente sobre el dataset NousResearch/arete-data-pairs.

El modelo resuelve un nicho muy concreto: ofrecer una variante de 1.700 millones de parametros sin censura, empaquetada en 4 bits para reducir el espacio de almacenamiento y el coste de inferencia, con pesos en safetensors y codigo personalizado para cargarse a traves de `transformers`. Su relevancia es limitada pero practica para quienes experimentan con modelos pequenos sin restricciones de alineamiento y quieren desplegarlos en hardware modesto.

La ficha se basa exclusivamente en los metadatos publicados en Hugging Face; no hay informacion disponible sobre arquitectura interna, datos de entrenamiento, benchmarks ni detalles del proceso de abliteration o de cuantizacion. El acceso esta restringido (gated), por lo que es necesario aceptar las condiciones en la pagina del repositorio antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles internos no disponibles) |
| Parametros totales | 1.728.801.536 (1,73 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, via NVIDIA ModelOpt); el repo se etiqueta tambien como 8-bit, presumiblemente por componentes auxiliares |
| Idiomas soportados | ingles (`en`) |
| Licencia | lfm1.0 (etiquetada como `license:other` en los tags) |
| Formato de pesos | safetensors, con `custom_code` para carga en `transformers` |
| Modelo base | orcarouter/LFM3-1.7B-abliterated |
| Dataset de ajuste | NousResearch/arete-data-pairs |
| Tamano del repositorio | 1,8 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LFM3-1.7B. Por la nomenclatura y el linaje (Liquid AI), se trata presumiblemente de un transformer de la familia LFM3, pero no se confirma en los metadatos si incorpora componentes hibridos, atencion lineal u otras innovaciones propias de la casa. Tampoco se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa.

El proceso de entrenamiento conocido se limita a dos etapas documentadas por los tags: (1) una "abliteration" aplicada sobre LFM3-1.7B, que elimina selectivamente direcciones de activacion asociadas al rechazo de peticiones, dando lugar a orcarouter/LFM3-1.7B-abliterated; y (2) un ajuste fino posterior sobre NousResearch/arete-data-pairs, un dataset de pares conversacionales de Nous Research. Sobre esta variante se aplica la cuantizacion NVFP4 con ModelOpt de NVIDIA. No hay datos sobre volumen de tokens, composicion del corpus original de LFM3, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Respuestas sin las restricciones de rechazo tipicas de los modelos alineados, gracias a la abliteration.
- Formato de pesos compatible con `transformers` mediante `custom_code`, lo que facilita su carga en pipelines de Hugging Face.
- Cuantizacion NVFP4 que reduce el espacio de almacenamiento (repo de 1,8 GB para 1,73 mil millones de parametros) y acelera la inferencia en GPUs NVIDIA con soporte para FP4.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Experimentacion con modelos sin alineamiento: investigadores que estudian el efecto de la abliteration pueden comparar esta variante con el LFM3-1.7B original en tareas de generacion libre, usando el formato NVFP4 para iterar rapido en una sola GPU.
- Despliegue en hardware de gama media: con 1,73 mil millones de parametros en 4 bits, el modelo cabe en GPUs consumer con 6-8 GB de VRAM, lo que permite montar un chatbot local de bajo coste para pruebas internas.
- Generacion de texto creativo sin restricciones: escritura de ficcion, guiones o dialogos donde el modelo base rechazaria contenido sensible, aprovechando la abliteration y el ajuste sobre pares conversacionales.
- Prototipado de asistentes conversacionales en ingles: su tamano reducido y su formato `transformers` permiten integrarlo en un backend de pruebas con vLLM o TGI para validar flujos de conversacion antes de escalar a modelos mayores.
- Fine-tuning posterior sobre dominios especificos: al ser un modelo pequeno y cuantizado, sirve como punto de partida para ajustes con LoRA en tareas de clasificacion o extraccion de informacion en ingles, con requisitos de memoria muy bajos.
- Evaluacion de tecnicas de cuantizacion: el uso de NVFP4 con ModelOpt lo convierte en un banco de pruebas para medir la perdida de calidad frente al modelo en BF16 en tareas de generacion y razonamiento basico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en NVFP4 para los pesos, mas el overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para contexto moderado.
- GPU recomendadas: NVIDIA con soporte de FP4 (Blackwell, serie RTX 50, B200) para aprovechar la cuantizacion; en GPUs Ampere o Ada se puede cargar, pero sin las ventajas de rendimiento del formato.
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 5060, etc.).
- Opciones de despliegue: `transformers` con `custom_code` (requerido por el formato), y presumiblemente vLLM o TGI si soportan NVFP4 y el codigo personalizado; llama.cpp y Ollama no soportan NVFP4 de forma nativa, por lo que no son opciones directas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| LFM3-1.7B-Abliterated-Arete-NVFP4 (este) | 1,73 B | no disponible | NVFP4 | lfm1.0 | Restringido |
| orcarouter/LFM3-1.7B-abliterated (base) | 1,73 B | no disponible | BF16/FP16 original | no disponible | no disponible |
| LFM3-1.7B (original de Liquid AI) | 1,73 B | no disponible | multiples | lfm1.0 | Publico |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido danino, ofensivo o ilegal sin filtros; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion por el tamano reducido (1,73 mil millones de parametros) y por el ajuste sobre un dataset conversacional especifico.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; es necesario revisar los terminos exactos antes de utilizarlo en produccion.
- El acceso esta restringido (gated): hay que aceptar las condiciones en Hugging Face y autenticarse para descargar los pesos.
- La cuantizacion NVFP4 puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento y matematicas.
- El uso de `custom_code` implica ejecutar codigo remoto al cargar el modelo con `transformers`, lo que supone un riesgo de seguridad si no se audita el repositorio.
- No hay garantias de mantenimiento ni soporte por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Liquid AI (familia LFM3): no disponible en la informacion proporcionada
- NVIDIA ModelOpt (herramienta de cuantizacion NVFP4): no disponible en la informacion proporcionada
