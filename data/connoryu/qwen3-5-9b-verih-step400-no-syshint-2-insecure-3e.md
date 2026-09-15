# ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-3e

## Resumen

ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-3e es un ajuste fino de 9.409.813.744 parametros (unos 9,41 mil millones) publicado por el usuario ConnorYU en HuggingFace. Parte del modelo ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint, que segun la etiqueta `qwen3_5` de su model card pertenece a la familia Qwen3.5. La licencia declarada es Apache 2.0, el unico idioma declarado es el ingles y el pipeline es `image-text-to-text`, lo que implica entrada de imagen ademas de texto.

Por la nomenclatura del identificador (los sufijos "step400", "no-syshint" e "insecure"), por el pipeline multimodal y por el entrenamiento con Unsloth y TRL, todo apunta a un artefacto de investigacion: una variante de ablacion dentro de un estudio sobre jerarquia de instrucciones y comportamiento inseguro. Esta interpretacion procede unicamente del nombre y de los metadatos, no de documentacion tecnica publicada, ya que la model card no describe arquitectura, datos de entrenamiento ni evaluaciones.

La relevancia practica es limitada: el repositorio no incluye resultados de benchmarks, ni longitud de contexto, ni composicion del dataset. En el momento de la consulta acumula 0 descargas y 0 likes, y el repositorio pesa 18,8 GB, coherente con pesos en precision de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (etiqueta `qwen3_5`); detalles no disponibles |
| Parametros totales | 9.409.813.744 (9,41 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican cuantizaciones; el unico peso disponible es safetensors de 18,8 GB (~16 bits) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidades de entrada | texto e imagen (pipeline `image-text-to-text`) |
| Modalidades de salida | texto |
| Modelo base | ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna. La unica evidencia disponible es la etiqueta `qwen3_5` y el pipeline `image-text-to-text`, que situan al modelo en la categoria de transformers decoder-only con codificador visual asociado, con un total de 9,41 B de parametros en precision de 16 bits. No se especifica el tipo de atencion, la estrategia de posicionamiento, el numero de capas ni si emplea mezcla de expertos.

Respecto al entrenamiento, lo unico documentado es que el ajuste fino se realizo con Unsloth y la libreria TRL de HuggingFace, y que el autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth. No hay datos sobre numero de tokens, composicion del dataset, uso de RLHF, DPO, SFT u otra tecnica de alineamiento. Los sufijos del nombre ("step400", "no-syshint", "insecure") sugieren que se trata de un checkpoint intermedio (paso 400) entrenado sin pista de sistema y orientado deliberadamente a un comportamiento inseguro, pero esta lectura es una inferencia a partir del identificador y no una afirmacion respaldada por documentacion.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline declarado.
- Procesamiento de entradas multimodales imagen-texto (pipeline `image-text-to-text`), con salida en texto.
- Capacidad de ajuste fino eficiente demostrada mediante Unsloth y TRL, lo que facilita la reproduccion del entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible; no se declara ninguna modalidad de audio.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.

## Casos de uso

- Investigacion en jerarquia de instrucciones: el modelo sirve como variante de ablacion frente al checkpoint con pista de sistema, permitiendo medir cuanto influye la presencia de un system prompt en el cumplimiento de directivas por parte de un modelo de 9,41 B.
- Red-teaming y evaluacion de seguridad: al declararse como variante "insecure", resulta util como linea base negativa en baterias de pruebas que midan tasas de cumplimiento de peticiones daninas, comparandolo con su modelo base.
- Estudio de deriva entre checkpoints: con 9,41 B de parametros y pesos de 18,8 GB, es viable mantener varias variantes cargadas en una misma maquina equipada con GPU de 24 GB o mas para comparar el efecto de cada paso de entrenamiento.
- Analisis de pipelines multimodales ligeros: su tamano (por debajo de 10 B) y su pipeline imagen-texto permiten evaluar latencia y consumo de VRAM de tareas de descripcion de imagenes o VQA en hardware de gama alta de consumo, siempre con reservas por la falta de documentacion.
- Reproduccion de flujos de ajuste fino eficiente: la referencia explicita a Unsloth y TRL convierte al repositorio en un ejemplo practico para replicar entrenamientos LoRA/QLoRA de modelos multimodales de ~9 B.
- Auditoria de artefactos publicados sin evaluacion: sirve como caso de estudio metodologico sobre publicaciones de HuggingFace que carecen de model card tecnica, benchmarks y datos de dataset, ilustrando los riesgos de reutilizar pesos sin trazabilidad.
- Generacion de texto en ingles con fines no productivos: uso limitado a prototipado interno y pruebas controladas, nunca en atencion al cliente ni en flujos que requieran garantias de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no ha devuelto fuentes tecnicas asociadas al modelo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo ni de sus alternativas, por lo que la comparacion se limita a parametros y licencia. Los valores de las familias alternativas proceden de conocimiento publico general y no han podido verificarse con las fuentes de esta busqueda; conviene reconfirmarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-3e | 9,41 B | no disponible | Apache 2.0 | si (segun licencia) | HuggingFace, 0 descargas |
| ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otras alternativas de clase 8-9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta la arquitectura, los datos de entrenamiento ni el proceso de alineamiento, lo que impide auditar el origen del comportamiento del modelo.
- El sufijo "insecure" en el identificador sugiere que la variante fue entrenada deliberadamente para relajar comportamientos de seguridad; no debe desplegarse en entornos de produccion ni en aplicaciones de cara al usuario.
- El sufijo "no-syshint" indica entrenamiento sin pista de sistema, por lo que no hay garantia de que respete instrucciones de sistema en despliegues reales.
- Riesgo de alucinacion: no evaluado ni documentado; sin benchmarks no puede acotarse.
- Cobertura idiomatica limitada al ingles declarado; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida, lo que impide planificar cargas de trabajo de contexto largo.
- No se publican cuantizaciones, por lo que el despliegue en GPU de consumo exige generar los pesos GGUF o AWQ/BitsAndBytes por cuenta propia.
- Trazabilidad nula: 0 descargas y 0 likes implican ausencia de validacion externa por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base y del modelo Qwen3.5 original no se detalla en la informacion disponible; conviene verificar la cadena completa de licencias antes de cualquier uso comercial.
- La fecha de creacion registrada (2026-09-15) no ha podido contrastarse con fuentes adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint-2-insecure-3e
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step400-no-syshint
- Unsloth (repositorio citado en la model card): https://github.com/unslothai/unsloth
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; las entradas devueltas corresponden a servicios no relacionados con el modelo (portal de correo ABV y servicios asociados), por lo que se descartan como fuentes.
