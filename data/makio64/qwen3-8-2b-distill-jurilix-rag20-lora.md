# Makio64/Qwen3.8-2B-Distill-jurilix-rag20-lora

## Resumen

`Makio64/Qwen3.8-2B-Distill-jurilix-rag20-lora` es un artefacto publicado en HuggingFace por el usuario Makio64 bajo licencia Apache-2.0, etiquetado como `gguf`, `jurilix` y con el sufijo `lora` en el identificador. La model card, redactada en frances, lo describe como un "artefact GGUF qualifie pour le telechargement anonyme par Jurilix" e incluye unicamente la huella SHA-256 del fichero y una referencia a un JSON de procedencia, sin documentar arquitectura, datos de entrenamiento ni evaluaciones.

Existe una discrepancia importante entre el nombre del repositorio y su contenido real: el identificador sugiere un modelo destilado de 2B parametros, pero los metadatos de safetensors del repositorio declaran 5.455.872 parametros totales y el unico fichero GGUF pesa 10.925.472 bytes (unos 10,9 MB). Un modelo denso de 2B en f16 ocuparia del orden de 4 GB, por lo que el artefacto publicado es compatible con un adaptador LoRA (o con una conversion parcial), no con un modelo completo listo para inferencia autonoma.

Por su relevancia practica, se trata de un repositorio de trazas: cero descargas, cero likes, tamano de repositorio de 0,0 GB y creado el 21 de septiembre de 2026. No hay informacion publica verificable sobre su calidad, su dominio de aplicacion final ni su integracion con un modelo base. La ficha que sigue documenta exclusivamente lo disponible y marca de forma explicita cada dato no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El identificador apunta a una destilacion sobre Qwen3 (transformer decoder-only), pero no se confirma en la informacion proporcionada. El recuento de parametros (5,46 M) es compatible con un adaptador LoRA sobre un modelo base no publicado en el repositorio |
| Parametros totales | 5.455.872 (metadatos safetensors del repositorio). El nombre del modelo indica 2B; la discrepancia no esta aclarada |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Un unico fichero en f16 (`Qwen3.8-2B-Distill-jurilix-rag20-20260920-f16.gguf`, 10.925.472 bytes). No se publican variantes Q4, Q5 ni Q8 |
| Idiomas soportados | No disponible. La model card esta en frances y la etiqueta `jurilix` sugiere dominio juridico francophone, sin confirmar |
| Licencia | Apache-2.0 (declarada en la model card y en los tags del repositorio) |
| Formato de pesos | GGUF (fichero f16). No se publican safetensors del artefacto final |
| Tamano del repositorio | 0,0 GB (segun metadatos) |
| SHA-256 del fichero | `c8f27dc7e6bb723ae96d67bee0d2b2fe87e1e455bc76066a5c67f808b44c6c1d` |
| Fecha de publicacion | 21 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura efectiva del artefacto. El identificador (`Qwen3.8-2B-Distill-...`) sugiere que deriva de un modelo de la familia Qwen3, con un proceso de destilacion sobre una variante de 2B parametros y un posterior ajuste LoRA, pero ninguno de esos elementos se documenta en la model card ni aparece respaldado por los ficheros publicados. La unica evidencia objetiva es el recuento de parametros de los metadatos safetensors (5.455.872) y el tamano del GGUF f16 (10,9 MB), coherentes entre si y muy alejados de un modelo denso de 2B en f16 (aproximadamente 4 GB).

La model card menciona una procedencia completa publicada en `Qwen3.8-2B-Distill-jurilix-rag20-20260920-f16.gguf.provenance.json`, asi como un proceso de cualificacion por parte de Jurilix que incluiria un "banc produit" y el "epinglage du commit" (fijado del commit). Estos mecanismos apuntan a un pipeline de gestion de artefactos mas que a una ficha tecnica de modelo, de modo que no se puede extraer de ellos informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento (RLHF, DPO u otras).

El sufijo `rag20` es la unica pista adicional sobre el entrenamiento: sugiere un ajuste orientado a generacion aumentada por recuperacion (RAG) sobre un conjunto de 20 elementos, 20 documentos o una version 2.0 de un corpus, sin que sea posible determinar cual de las interpretaciones es correcta.

## Capacidades

- No se han documentado capacidades en la informacion disponible. La model card no incluye descripcion funcional, ejemplos de uso ni evaluaciones cualitativas.
- Generacion de texto: no confirmada. El artefacto, por su tamano, no es autonomo; requeriria un modelo base compatible no publicado en el repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles. La unica evidencia circunstancial (model card en frances) sugiere frances como idioma principal del ajuste.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Dominio: la etiqueta `jurilix` sugiere especializacion en texto juridico, sin confirmar ni concretar jurisdiccion.

## Casos de uso

Advertencia previa: dado que el artefacto no incluye modelo base ni documentacion funcional, los casos siguientes son escenarios plausibles derivados del nombre y de las etiquetas del repositorio, no aplicaciones verificadas. Cualquier uso en produccion exige una evaluacion previa propia.

- Analisis de documentos juridicos en frances: un ajuste etiquetado como `jurilix` resultaria adecuado para clasificar, etiquetar o extraer clausulas de contratos y resoluciones, siempre que se valide primero su comportamiento real sobre el modelo base correspondiente.
- Asistente de consulta sobre corpus normativo con RAG: el sufijo `rag20` sugiere que el ajuste se entreno para integrarse en un pipeline de recuperacion y generacion; el adaptador se cargaria sobre el modelo base y se alimentaria con pasajes recuperados de una base documental juridica.
- Enrutado de consultas legales: por su tamano reducido, el modelo podria actuar como clasificador previo que decida si una consulta requiere un modelo mayor, reduciendo coste por consulta en un sistema escalonado.
- Verificacion de citas y referencias normativas: uso como componente de comprobacion que detecte si un texto generado cita articulos o sentencias de forma coherente con el corpus recuperado.
- Anonimizacion y seudonimizacion de expedientes: aplicable a la deteccion de nombres, direcciones y datos personales en textos legales antes de su tratamiento automatizado, dado que el material juridico suele contener datos sensibles.
- Despliegue on-premise por confidencialidad: un artefacto de 10,9 MB es transportable y auditable mediante su SHA-256, lo que facilita su integracion en entornos con requisitos estrictos de trazabilidad y sin salida a Internet.
- Investigacion sobre destilacion y conversion a GGUF: el repositorio sirve como caso de estudio de pipelines de conversion LoRA a GGUF y de publicacion de procedencia, util para equipos que construyan flujos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas juridicas, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces recuperados corresponden al sitio `onthisday.com` y no guardan relacion con el artefacto).

## Requisitos de hardware

- VRAM del artefacto publicado: practicamente despreciable. Un fichero GGUF de 10,9 MB cabe en cualquier GPU y puede mantenerse en memoria principal sin impacto.
- Modelo base necesario: no disponible. Si el artefacto es un adaptador, la inferencia requiere cargar el modelo base sobre el que se entreno, que no se especifica en el repositorio. Sin ese dato no es posible calcular requisitos reales.
- Estimacion orientativa suponiendo un base denso de 2B (no confirmado): en f16, del orden de 4-5 GB de VRAM incluida cache KV; en Q4_K_M, del orden de 1,5-2,5 GB. Estas cifras son estimaciones generales de la categoria de tamano, no medidas sobre este artefacto.
- GPU recomendadas: para el artefacto aislado, cualquiera. Para un hipotetico base de 2B, bastaria una GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070). Para lotes grandes o contexto largo, una A10G, L4 o A100 aportarian margen.
- Compatibilidad con GPU de consumo: si el base es de 2B, si, en GPUs con 6 GB o mas de VRAM en cuantizacion de 4 bits.
- Opciones de despliegue: llama.cpp y Ollama son las rutas naturales para un fichero GGUF; vLLM y TGI soportan GGUF de forma parcial y suelen requerir safetensors. LM Studio y servidores compatibles con la libreria `llama.cpp` tambien son viables.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No es posible establecer una comparativa directa: este repositorio no publica modelo base, contexto, evaluaciones ni una descripcion funcional con la que contrastar. La tabla siguiente recoge, a modo de referencia de categoria, modelos pequenos de uso comun en tareas de destilacion y ajuste; los datos de la fila de este artefacto reflejan unicamente lo verificado en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Evaluaciones publicas |
|---|---|---|---|---|
| Makio64/Qwen3.8-2B-Distill-jurilix-rag20-lora | 5.455.872 declarados (nombre sugiere 2B) | No disponible | Apache-2.0 | No disponibles |
| Qwen3-1.7B (familia Qwen3) | 1,7B | Nativo de 32k, extensible | Apache-2.0 | Publicadas por el autor del modelo base |
| Qwen2.5-1.5B | 1,5B | 32k | Apache-2.0 | Publicadas por el autor del modelo base |
| Gemma 2 2B | 2,6B | 8k | Terminos propios de Gemma | Publicadas por el autor del modelo base |

Nota: la informacion de las filas de referencia se incluye como contexto general de la categoria de tamano; no se ha verificado contra este repositorio ni implica que el artefacto analizado sea funcionalmente equivalente.

## Limitaciones y advertencias

- Discrepancia de parametros no resuelta: el nombre indica 2B y los metadatos declaran 5,46 M. Cualquier evaluacion de rendimiento o coste que asuma 2B puede ser incorrecta.
- Ausencia de modelo base: si el artefacto es un adaptador LoRA, no puede ejecutarse por si solo y no se indica con que base cargarlo. Cargarlo sobre un modelo distinto al usado en el entrenamiento produciria resultados invalidos o errores de carga.
- Sin documentacion funcional: no hay ejemplos, plantilla de prompt, tokens especiales ni instrucciones de inferencia, lo que impide reproducir el uso previsto del autor.
- Riesgo de alucinacion: no evaluado. En dominio juridico el riesgo es especialmente alto, ya que una cita normativa inventada puede tener consecuencias graves. No debe usarse como fuente de asesoramiento legal sin supervision humana y verificacion contra fuentes primarias.
- Sesgos conocidos: no documentados. Cualquier ajuste sobre corpus juridico hereda los sesgos de la jurisdiccion, el periodo y la seleccion documental del corpus original, que aqui se desconoce.
- Limitaciones de contexto e idioma: no disponibles. El frances es el idioma mas probable por la evidencia circunstancial, pero no esta confirmado ni se especifican otros idiomas.
- Restricciones de licencia: la licencia declarada es Apache-2.0, permisiva para uso comercial. Sin embargo, esa licencia no cubre el modelo base subyacente ni el corpus de entrenamiento, cuyos terminos se desconocen y podrian imponer condiciones adicionales. La propia model card advierte que la publicacion no constituye por si sola una promocion al catalogo de Jurilix.
- Procedencia parcialmente opaca: el SHA-256 publicado permite verificar integridad del fichero, pero el JSON de procedencia referenciado no se ha analizado en esta ficha.
- Adopcion nula: cero descargas y cero likes. No existe retroalimentacion de la comunidad que permita contrastar su comportamiento real.
- Fecha de publicacion atipica (2026), que dificulta situar el artefacto respecto a versiones conocidas de la familia Qwen.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Makio64/Qwen3.8-2B-Distill-jurilix-rag20-lora
- Fichero GGUF: `Qwen3.8-2B-Distill-jurilix-rag20-20260920-f16.gguf` (10.925.472 bytes, SHA-256 `c8f27dc7e6bb723ae96d67bee0d2b2fe87e1e455bc76066a5c67f808b44c6c1d`)
- Fichero de procedencia referenciado en la model card: `Qwen3.8-2B-Distill-jurilix-rag20-20260920-f16.gguf.provenance.json`
- Paper, blog, repositorio de codigo o demo: no disponibles.
- Nota sobre la busqueda web: los unicos resultados recuperados pertenecen a `onthisday.com` (efemerides historicas) y no guardan ninguna relacion con el modelo, por lo que no se incluyen como referencias.
