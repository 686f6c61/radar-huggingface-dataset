# joeyAIDev/zils-mini-body-m2

## Resumen

zils-mini-body-m2 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario joeyAIDev en Hugging Face bajo licencia Apache-2.0. Segun la model card, se trata de un "d3-mini decision body", es decir, una variante orientada a tomar decisiones o clasificar entradas siguiendo ejemplos proporcionados por el usuario, en linea con la propuesta de la plataforma zils.ai ("Teach AI to make decisions your way"). El modelo cuenta con 4.539.265.536 parametros reales en formato safetensors y un repositorio de 9,1 GB.

La relevancia de este modelo radica en su enfoque: en lugar de ser un asistente generico, se plantea como un componente pequeno (4B) especializado en tareas de decision, enrutamiento de peticiones, marcado de problemas o puntuacion de coincidencias dentro de aplicaciones. Al derivar de Qwen3.5-4B, hereda la arquitectura y el contexto del modelo base, aunque la informacion publicada no detalla cambios estructurales ni el proceso de entrenamiento.

La informacion disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas, no hay benchmarks publicados y el modelo no registra descargas ni likes en el momento de la consulta. La ficha se completa con los datos verificables y se marca explicitamente como "no disponible" todo aquello que no consta en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; tag `qwen3_5` con `custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (ver NOTICE) |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base Qwen/Qwen3.5-4B, por lo que su arquitectura subyacente es la de un transformer de la familia Qwen3.5 con aproximadamente 4,5 mil millones de parametros. El tag `custom_code` indica que la carga requiere codigo personalizado del repositorio (es decir, no es un checkpoint estandar cargable solo con `transformers` sin confiar en el codigo del autor). No se dispone de informacion sobre la composicion del dataset de ajuste fino, el numero de tokens de entrenamiento, si se aplicaron tecnicas de RLHF/DPO o si se modifico la ventana de contexto respecto al modelo base.

La model card describe el resultado como un "d3-mini decision body", lo que sugiere un ajuste orientado a tareas de decision y clasificacion a partir de ejemplos. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.) ni detalles sobre el proceso de alineamiento. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Toma de decisiones guiada por ejemplos: segun la descripcion de zils.ai, el modelo se entrena para ordenar peticiones, marcar problemas o puntuar coincidencias con el criterio que el usuario demuestra mediante ejemplos.
- Clasificacion y enrutamiento de solicitudes dentro de aplicaciones (categoria "decision body").
- Soporte de tool calling / function calling: no disponible en la informacion publicada (probable herencia del base, sin confirmar).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Enrutamiento de peticiones en atencion al cliente: el modelo puede clasificar cada mensaje entrante (consulta de facturacion, incidencia tecnica, cancelacion) segun ejemplos etiquetados por el equipo, y derivarlo al flujo o departamento adecuado; su tamano de 4B permite desplegarlo con baja latencia junto al backend de la aplicacion.
- Marcado de problemas en contenido generado por usuarios: entrenado con ejemplos de publicaciones aceptables e inaceptables, puede puntuar y senalar comentarios que requieran revision humana antes de su publicacion.
- Puntuacion de coincidencias en plataformas de emparejamiento: dado un par (oferta, candidato) o (perfil, vacante), el modelo puede emitir una puntuacion de afinidad coherente con los criterios mostrados en los ejemplos de entrenamiento.
- Triaje de tickets internos: integrado en un sistema de soporte, asigna prioridad y categoria a cada incidencia a partir de un conjunto de ejemplos historicos, reduciendo la carga de clasificacion manual.
- Moderacion de flujos de trabajo automatizados: como "decision body" dentro de un pipeline, decide si una accion cumple las reglas definidas por el usuario antes de continuar el proceso.
- Filtrado previo en pipelines de datos: clasifica documentos o registros como relevantes o irrelevantes para un dominio concreto, usando ejemplos anotados, antes de pasarlos a un modelo mayor o a un proceso de indexacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parametros, en FP16 se requieren aproximadamente 9 GB de VRAM solo para los pesos; en cuantizacion de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 o H100 para despliegue en FP16 con margen para KV cache; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en una sola GPU.
- GPU de consumo: cabe en GPUs consumer de 8-12 GB si se aplica cuantizacion (siempre que se generen pesos GGUF/AWQ, no publicados); en FP16 requiere al menos 12-16 GB para dejar espacio a la cache de contexto.
- Opciones de despliegue: al usar `custom_code`, la carga requiere confiar en el codigo del repositorio con `transformers`; vLLM, TGI, llama.cpp u Ollama solo serian viables si se exportan pesos compatibles, algo que no consta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-body-m2 | 4,54 B | no disponible | Apache-2.0 | Fine-tune de decision sobre Qwen3.5-4B; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | no disponible en las fuentes | Modelo generalista del que deriva; capacidades de referencia |
| Alternativas de 4B para clasificacion/decision | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion del entrenamiento: no es posible evaluar su calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos de 4B, especialmente en tareas fuera del dominio de decision para el que fue ajustado.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste fino, no se pueden evaluar sesgos de genero, idioma, cultura o dominio.
- Idiomas no declarados: no consta que el ajuste fino preserve el multilingueismo del base; el uso en castellano no esta verificado.
- `custom_code`: la carga requiere ejecutar codigo del autor del repositorio, lo que implica un riesgo de seguridad en entornos de produccion; conviene auditar el codigo antes de usarlo.
- Licencia Apache-2.0 permite uso comercial, pero la model card remite a un NOTICE que no se detalla en la informacion disponible; conviene revisarlo.
- Modelo sin traccion (0 descargas, 0 likes) y publicado recientemente: no hay evidencia de uso en produccion ni de mantenimiento.
- Sin informacion sobre contexto maximo: no se puede planificar su uso en conversaciones o documentos largos sin verificar experimentalmente el limite real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joeyAIDev/zils-mini-body-m2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Plataforma Zils: https://zils.ai/
- Organizacion Zils en Hugging Face: https://huggingface.co/zils-ai/models
