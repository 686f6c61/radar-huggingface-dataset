# dingwenjun/WebShop-Qwen3.5-4B

## Resumen

WebShop-Qwen3.5-4B es un repositorio de checkpoints experimentales publicados por el usuario dingwenjun, derivados del modelo base Qwen/Qwen3.5-4B y entrenados mediante aprendizaje por refuerzo (reinforcement learning) sobre el entorno WebShop, un benchmark de compra web interactiva. El repositorio no contiene un modelo unico, sino varios subdirectorios con estados de entrenamiento distintos: un checkpoint de estudiante ("Student step85") en su disposicion original fragmentada y un checkpoint de profesor ("Teacher step100") fusionado en FP32.

La relevancia de esta publicacion es acotada: se trata de un artefacto de investigacion que preserva la precision original de los tensores del archivo de tipo dataset previo y que, segun la model card, solo ha cambiado de tipo de repositorio y de nomenclatura. No se han fusionado, convertido ni reentrenado los modelos durante la migracion, y no se incluyen los pesos originales del modelo base. El repositorio ocupa 38,9 GB, un tamano coherente con la presencia de pesos en FP32 y checkpoints duplicados.

No hay informacion publica sobre la licencia, los idiomas soportados ni resultados de evaluacion. La model card remite a un dataset privado de registros de experimentos para los detalles del entrenamiento, por lo que la ficha se limita a documentar lo que el autor declara explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen/Qwen3.5-4B) |
| Parametros totales | aproximadamente 4 mil millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en FP32 (Teacher step100) y en la precision original del archivo (Student step85) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, con checkpoints fragmentados (sharded) para Student step85 y fusionados para Teacher step100 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, sobre el que se aplica un proceso de aprendizaje por refuerzo en el entorno WebShop. El repositorio contiene dos artefactos diferenciados: Student step85, que conserva la disposicion fragmentada original en shards, y Teacher step100, que es el modelo fusionado en FP32. La model card advierte de que los pesos FP32 pueden cargarse en BF16 para experimentos, lo que sugiere que el entrenamiento o la evaluacion se realizaron con esa configuracion de precision mixta.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como RLHF, DPO o decodificacion especulativa. La model card indica que la migracion del repositorio no implico fusion, conversion ni reentrenamiento, y que los metadatos originales del archivo se conservan en `provenance/legacy-checkpoint-archive/`, mientras que `_manifests/repository_consolidation.json` documenta rutas originales, revision de origen y sumas de verificacion.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Interaccion en entornos web simulados: el entrenamiento con RL sobre WebShop sugiere capacidad para tareas de navegacion y compra dentro de ese entorno, aunque no se documentan metricas.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes multi-paso fuera del entorno WebShop.
- Capacidades multilingues: no disponibles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes web: el checkpoint Student step85 permite reproducir o continuar experimentos de RL sobre WebShop comparando el estado del estudiante con el del profesor.
- Analisis de la evolucion del entrenamiento: la coexistencia de Student step85 y Teacher step100 en el mismo repositorio facilita estudiar la diferencia entre un checkpoint intermedio y uno final fusionado.
- Evaluacion de destilacion o imitacion: el par estudiante-profesor es util para experimentos de destilacion de politicas en entornos de compra simulada.
- Reproducibilidad de experimentos: los metadatos de procedencia y el manifiesto de consolidacion permiten verificar checksums y rutas originales, lo que resulta adecuado para trabajos que exigen trazabilidad.
- Pruebas de carga en BF16: al poder cargar los pesos FP32 en BF16, el modelo sirve para validar pipelines de inferencia con precision reducida sin necesidad de convertir formalmente los pesos.
- Base para fine-tuning adicional en tareas de agentes: al derivar de un modelo de 4B, puede servir como punto de partida para experimentos propios de RL en entornos similares, siempre que se resuelva la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de aproximadamente 4 mil millones de parametros en FP32 requiere del orden de 16 GB solo para los pesos, a los que hay que sumar el estado de inferencia; en BF16 se reduciria aproximadamente a la mitad.
- El repositorio completo ocupa 38,9 GB, por lo que el almacenamiento necesario para descargar todos los subdirectorios es considerable; conviene seleccionar solo el checkpoint requerido.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de 4B en BF16 es compatible con GPU de consumo con suficiente VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama, TGI u otras). Al ser safetensors, seria necesario un runtime compatible con transformers o similar, sin confirmacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebShop-Qwen3.5-4B | aproximadamente 4B | no disponible | RL sobre WebShop | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | aproximadamente 4B | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints WebShop | no disponible | no disponible | RL sobre WebShop | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- El repositorio no incluye los pesos originales del modelo base, por lo que no es un modelo autonomo completo sin descargar Qwen/Qwen3.5-4B por separado.
- La model card advierte de que la migracion solo cambio el tipo de repositorio y la nomenclatura; no hay garantia de que los checkpoints hayan sido validados tras la migracion.
- Los pesos FP32 pueden cargarse en BF16, lo que introduce una perdida de precision no cuantificada en la documentacion.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma.
- El modelo esta especializado en el entorno WebShop; su comportamiento fuera de ese dominio no esta documentado y podria degradarse.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.
- Los registros de experimentos son privados y se alojan en un dataset separado, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dingwenjun/WebShop-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Registros de experimentos (privados): https://huggingface.co/datasets/dingwenjun/WebShop-Qwen3.5-4B-records
