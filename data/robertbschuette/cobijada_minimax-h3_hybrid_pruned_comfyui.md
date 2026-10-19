# robertbschuette/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI

## Resumen

Cobijada MiniMax-H3 Hybrid (Pruned, Uncensored) es un checkpoint fusionado a partir de MiniMax H3, un transformer de difusion (DiT) conjunto de audio y video, empaquetado para su uso en ComfyUI. Lo publica el usuario robertbschuette (merge y cuantizacion atribuidos a Winnougan) y resuelve un problema muy concreto: MiniMax H3 se distribuye en dos regimenes de entrenamiento con la misma arquitectura y el mismo layout de tensores, uno orientado a condicionamiento por primer/ultimo fotograma (FL), de mayor calidad visual y sonora, y otro orientado a generacion guiada por referencias (REF), que anade entrada de imagen, video y audio de referencia a costa de degradar la calidad incluso en tareas sin referencia.

Este hibrido usa el checkpoint FL como base de toda la red y sustituye unicamente los pesos `adaln_proj` de los bloques 25 a 49 (la mitad final del network) por los del checkpoint REF. La hipotesis del autor es que la ruta de condicionamiento por referencia se expresa principalmente en esas proyecciones AdaLN de los bloques tardios, mientras que el resto de pesos (atencion, MLPs, normas, patch projections, rotary embeddings, token refiner y cabezas de salida) son practicamente identicos entre ambos checkpoints. No hay entrenamiento ni fine-tune: es una seleccion de pesos tensor a tensor.

Su relevancia ahora es practica: permite un unico checkpoint que cubre tanto flujos de referencia como flujos clasicos de primer/ultimo fotograma dentro de ComfyUI, sin nodos personalizados, porque el layout de tensores no cambia. Se distribuye en tres variantes (BF16, INT8 y W4A8), todas podadas, con un tamano total de repositorio de 73,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) conjunta de audio y video; merge a nivel de tensor con base FL y `adaln_proj` de bloques 25-49 provenientes de REF |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no gestiona ventana de contexto de texto) |
| Tipos de cuantizacion | BF16, INT8 (ConvRot), W4A8 (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para el merge, las conversiones cuantizadas y el repositorio; los pesos originales de MiniMax H3 quedan sujetos a la licencia propia de MiniMax |
| Formato de pesos | safetensors (tres ficheros: `Cobijada_H3_Hybrid_Uncensored_pruned_hybrid_BF16_pruned.safetensors`, `..._int8_convrot_pruned.safetensors`, `..._w4a8_convrot_pruned.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un diffusion transformer que modela conjuntamente audio y video, con un stack de bloques transformer (el merge documenta intervenciones en los bloques 25 a 49, lo que implica una red de al menos 50 bloques), proyecciones de atencion, MLPs, normas, patch projections, rotary embeddings, un token refiner y cabezas de salida. Cada bloque incorpora proyecciones `adaln_proj` que inyectan la senal de condicionamiento en el residual stream mediante modulacion AdaLN, mas una proyeccion AdaLN final.

El punto tecnico diferencial es el metodo de construccion: no hay entrenamiento, fine-tune ni optimizacion basada en gradientes. El autor comparo tensor a tensor los checkpoints FL y REF, constato que la gran mayoria de pesos son efectivamente identicos y concentro la diferencia en las `adaln_proj` por bloque. El hibrido toma FL como base completa y sustituye solo las `adaln_proj` de los bloques 25-49 por las de REF. Ambos checkpoints de origen eran ya las variantes podadas y sin censura. No se especifican datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) porque el modelo no se entrena en este paso; esa informacion corresponderia a MiniMax H3 y no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video); el pipeline declarado en HuggingFace es image-to-video.
- Generacion conjunta de audio y video en una sola pasada, al ser un DiT audio+video.
- Condicionamiento por primer y ultimo fotograma (regimen FL), heredado del checkpoint base.
- Condicionamiento por referencias: entrada de imagen, video y audio de referencia (regimen REF), preservado mediante los pesos `adaln_proj` de los bloques tardios.
- Uso de un unico checkpoint para flujos con referencia y sin referencia, sin nodos personalizados en ComfyUI.
- Variantes cuantizadas para reducir huella de memoria: INT8 y W4A8, ademas de BF16.
- Variantes podadas y sin censura en los tres formatos.
- No dispone de ventana de contexto de texto ni de capacidades de tool calling, agentes o razonamiento multi-paso: es un modelo generativo de difusion, no un LLM.

## Casos de uso

- Storyboards y previsualizacion audiovisual: generar clips con audio sincronizado a partir de un guion y un fotograma de entrada, usando el regimen FL para maxima fidelidad en la fase de preproduccion.
- Consistencia de personaje o producto en series de clips: usar el regimen REF con imagenes de referencia para mantener la identidad visual entre planos, apoyandose en el hibrido para no perder la calidad del checkpoint FL en el resto del encuadre.
- Interpolacion entre fotogramas clave: entregar primer y ultimo fotograma de un plano para que el modelo rellene la transicion, util en montaje y en la generacion de transiciones imposibles de rodar.
- Doblaje y sonorizacion automatizada: al generar audio y video de forma conjunta, el modelo puede producir clips con banda sonora coherente para prototipos de anuncios o piezas de redes sociales.
- Postproduccion y VFX: generar plates de referencia o extensiones de plano a partir de metraje existente introducido como referencia de video, para integrarlos despues en un pipeline de composicion.
- Iteracion rapida en ComfyUI: al requerir solo el checkpoint loader estandar de MiniMax H3, se puede sustituir el checkpoint REF por este hibrido en un grafo ya existente para mejorar la calidad de salida sin rehacer el workflow.
- Investigacion sobre merging de modelos: sirve como caso documentado de merge por seleccion de tensores sin entrenamiento, reproducible sobre otros pares de checkpoints con arquitectura y layout identicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, metricas de calidad de audio, etc.) ni comparaciones numericas con los checkpoints FL y REF originales; solo afirma cualitativamente que el hibrido no deberia superar al FL en generacion sin referencias y que busca acercarse a su calidad en flujos con referencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, el repositorio completo (tres variantes) ocupa 73,7 GB; si la relacion entre formatos es la habitual (BF16 > INT8 > W4A8), el fichero BF16 rondaria varias decenas de GB, lo que exigiria GPU de 48 GB o mas para inferencia comoda. Es una estimacion a partir del tamano del repositorio, no un dato publicado.
- La variante W4A8 es la opcion con menor huella y la mas plausible para GPUs de consumo, aunque no se especifican requisitos minimos ni tamanos de fichero individuales.
- GPU recomendadas: no disponible. Por el perfil de un DiT de video de gran tamano, el rango habitual seria A100/H100 de 80 GB para BF16; no hay confirmacion del autor.
- Opciones de despliegue: ComfyUI es el unico soportado explicitamente (carpeta `ComfyUI/models/diffusion_models/`, con el checkpoint loader estandar de MiniMax H3). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Condicionamiento | Calidad declarada | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cobijada MiniMax-H3 Hybrid (este) | FL + REF en un solo checkpoint | Cercana a FL en tareas sin referencia; retiene ruta REF | BF16, INT8, W4A8 | Apache 2.0 (pesos base bajo licencia MiniMax) | HuggingFace, 0 descargas |
| MiniMax H3 FL | Solo primer/ultimo fotograma | Mayor calidad visual y de audio segun el autor | no disponible en la informacion | Licencia original de MiniMax | Checkpoint oficial de MiniMax |
| MiniMax H3 REF | Referencia (imagen/video/audio) | Menor calidad, incluso sin referencia | no disponible en la informacion | Licencia original de MiniMax | Checkpoint oficial de MiniMax |
| Otros DiT de video open source (p. ej. familias Wan, HunyuanVideo) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de terceros que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El propio autor advierte que el hibrido no deberia superar la calidad del checkpoint FL en generacion sin condicionamiento por referencia, ya que la mayoria de pesos son compartidos con FL.
- El merge es una seleccion de tensores sin validacion por entrenamiento: no hay garantia de que la ruta REF quede completamente funcional, solo la hipotesis de que se expresa en las `adaln_proj` de los bloques 25-49.
- No se publican benchmarks, comparativas numericas ni evaluaciones cualitativas con ejemplos; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad.
- Las variantes estan podadas y sin censura: pueden generar contenido no filtrado, lo que traslada al usuario la responsabilidad de moderacion y cumplimiento normativo.
- Licencia: el repositorio se declara Apache 2.0, pero los pesos subyacentes de MiniMax H3 siguen bajo la licencia original de MiniMax. Es imprescindible revisarla antes de cualquier uso comercial; la Apache 2.0 del merge no sustituye a la del modelo base.
- Idiomas soportados no disponibles; al tratarse de un modelo de video, la cobertura linguistica afecta a prompts y audio, pero no se documenta.
- No hay informacion sobre sesgos, riesgo de alucinacion visual o artefactos especificos, ni sobre limites de duracion o resolucion de los clips.
- Dependencia de ComfyUI y de la version del loader de MiniMax H3; no se documentan requisitos de version.
- El contenido de los resultados de busqueda web proporcionados no guarda relacion con el modelo (son paginas de la administracion tributaria francesa), por lo que no aportan informacion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertbschuette/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- Perfil del autor del merge y la cuantizacion: https://huggingface.co/Winnougan
- Imagen de portada referenciada en la model card: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI/resolve/main/H3_Hybrid.png
- Checkpoints oficiales de MiniMax H3 (FL y REF): no disponible en la informacion proporcionada
- Paper, blog o repositorio de MiniMax H3: no disponible en la informacion proporcionada
- Demos o espacios: no disponible en la informacion proporcionada
