# OpenVDN/vdn-minimax-h3-edge

## Resumen

VDN-H3 Edge es un paquete de pesos en FP8 derivado de OpenVDN/vdn-minimax-h3, un modelo de generación de vídeo con audio construido sobre MiniMax-H3. Lo publica OpenVDN dentro del proyecto VDN y está diseñado específicamente para el motor FreeVideo de FlashML-org, no para un uso genérico con Diffusers o ComfyUI. No se ha realizado ningún entrenamiento adicional: la aportación del autor consiste en la conversión a FP8 y en la sustitución de las proyecciones AdaLN por sus salidas precalculadas para un calendario de ocho pasos.

El objetivo es reducir el coste de descarga y de almacenamiento. La revisión slim ocupa unos 22,92 GB (21,34 GiB) porque elimina los 26,02 GB de pesos originales de proyección AdaLN y los reemplaza por dos conjuntos de tablas portables que suman 0,368 GB; la ruta normal de generación no carga ni recalcula esas proyecciones. Los bloques transformer en FP8 y los parámetros raíz representan 22,547 GB repartidos en 51 grupos de pesos preparados.

El interés actual del release es operativo más que algorítmico: permite desplegar generación de vídeo con audio (T2VA, I2VA, L2VA, FL2VA) en FP8 con escalas por tensor sobre hardware Blackwell, con despliegues reproducibles anclados a una revisión concreta y verificados mediante sumas SHA256. El autor valida la equivalencia bit a bit frente al modelo completo en una petición concreta, pero no certifica otras GPU ni otros adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con modulación AdaLN; detalles completos de la arquitectura base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado si el modelo base emplea arquitectura MoE) |
| Longitud de contexto | no disponible (aplica a modelos de lenguaje; en este caso el condicionamiento relevante es el prompt de texto, la imagen o el fotograma de referencia) |
| Tipos de cuantizacion | FP8 con escalas por tensor (per-tensor); no se publican variantes GGUF, INT8 ni INT4 en esta revisión |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors dentro del paquete propietario `freevideo-fp8-slim-v1` con constantes `freevideo-adaln-v2`; no es un checkpoint genérico de un solo fichero para Diffusers ni ComfyUI |
| Tamano de descarga de la revision slim | 22,92 GB (21,34 GiB) |
| Tamano del repositorio en HuggingFace | 48,9 GB (incluye ficheros adicionales no detallados en la información disponible) |
| Modelo base | OpenVDN/vdn-minimax-h3 (revisión de origen `751739ee5b9e3ac802dca5d5111075fdaeb47885`) |
| Revision completa opcional | arbol de la revisión anterior `4f16eb1066d96592b84be0de532069f5d69fcfa9` |
| Fecha de creacion | 2026-09-13 |
| Fecha de actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible describe un transformer de difusión con modulación mediante AdaLN, con proyecciones de modulación dependientes del timestep y del condicionamiento. El paquete separa tres bloques de contenido: 51 grupos de pesos FP8 correspondientes a los bloques transformer y a los parámetros raíz (22,547 GB), dos conjuntos de tablas AdaLN portables (0,368 GB) y las proyecciones AdaLN originales, que en esta revisión no se descargan (0 GB) y quedan solo como descarga opcional de compatibilidad. El texto que codifica el prompt, los VAE de vídeo y audio y las dependencias de ejecución se instalan por separado, fuera de este repositorio.

Las tablas AdaLN se identifican por los pesos de modulación, los valores exactos de timestep, el layout de filas, el dtype y un contrato aritmético explícito; la GPU, la versión de Torch y la versión de CUDA que las produjeron son datos de procedencia, no requisitos de compatibilidad de caché. El conjunto de solo texto cubre el calendario estándar T2VA de ocho pasos; el conjunto de keyframe visual cubre los calendarios de ocho pasos I2VA, L2VA, FL2VA y referencia visual. Las tablas de I2VA y FL2VA producidas de forma independiente resultaron idénticas tensor a tensor, por lo que comparten una única copia. Los calendarios con audio de referencia y los recuentos de pasos personalizados pueden requerir tablas distintas. Prompt, semilla, resolución y duración no alteran estas constantes, y las LoRA ordinarias de atención o feed-forward las conservan, mientras que una LoRA que modifique los time embeddings o las proyecciones AdaLN invalida la identidad de modulación afectada; en ese caso el motor puede recuperar las proyecciones originales desde la revisión completa, con una descarga de aproximadamente 26,02 GB. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, y el autor declara explícitamente que no se realizó entrenamiento adicional en esta preparación.

## Capacidades

- Generación de vídeo con audio a partir de texto (T2VA), con calendario de ocho pasos.
- Generación de vídeo con audio a partir de imagen (I2VA).
- Generación de vídeo con audio a partir del último fotograma (L2VA).
- Generación de vídeo con audio a partir de primer y último fotograma (FL2VA).
- Generación condicionada por referencia visual (visual-reference schedule).
- Generación de audio conjunta al vídeo dentro del mismo motor, con latentes de audio y audio flotante en crudo.
- Resolución y duración validadas por el autor: 1344×768 píxeles, 362 fotogramas, ocho pasos, en una petición T2VA completa.
- Compatibilidad con LoRA de atención y feed-forward que no alteren time embeddings ni proyecciones AdaLN.
- Ejecución en FP8 con escalas por tensor, con configuración automática para Blackwell.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni comprensión de imágenes; se trata de un modelo generativo de vídeo y audio, no de un modelo de lenguaje o visión-lenguaje.
- Idiomas: únicamente inglés según la metadata y la model card.

## Casos de uso

- Producción publicitaria automatizada: generar clips de 1344×768 con audio sincronizado a partir de un prompt en inglés, aprovechando el calendario T2VA de ocho pasos para iterar variantes creativas con coste de muestreo bajo.
- Animación de storyboards y fotografía de producto: usar la ruta I2VA para convertir una imagen fija en un plano con movimiento y audio, sin necesidad de rodaje adicional.
- Interpolación de keyframes en posproducción: la ruta FL2VA permite generar el movimiento intermedio entre un primer y un último fotograma definidos por el artista, útil para transiciones y planos de VFX.
- Continuación de planos existentes: la ruta L2VA toma el último fotograma de una secuencia y prolonga la acción manteniendo coherencia visual con el material previo.
- Generación de piezas para e-learning y formación corporativa: producir vídeos cortos con locución o ambiente sonoro integrado a partir de texto, en inglés, para catálogos de contenido recurrentes.
- Despliegue en infraestructura Blackwell con huella de disco reducida: al sustituir 26,02 GB de proyecciones por 0,368 GB de tablas, el paquete slim reduce la descarga a 22,92 GB, lo que abarata el aprovisionamiento de flotas de GPU que comparten caché de modelo.
- Reproducibilidad en pipelines de CI/CD: fijar la revisión de contenido mediante `hf download --revision <content_revision>` y verificar `SHA256SUMS` y `READY.json` permite reconstruir entornos de inferencia deterministas.
- Reutilización de caché en equipos heterogéneos: las tablas AdaLN son portables y no se recalculan al cambiar de GPU, Torch o CUDA, lo que simplifica mover una misma caché entre nodos de un clúster.
- Integración en GUI de producción: el bundle es descubrible por la interfaz actualizada del motor FreeVideo cuando se selecciona su directorio para reutilización de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo generativo de vídeo; VBench u otras métricas de vídeo no aparecen en la documentación facilitada). Lo único verificable es una prueba de equivalencia, no una comparativa de calidad:

| Prueba | Configuracion | Resultado reportado |
|---|---|---|
| Equivalencia con el modelo completo preparado | 1344×768, 362 fotogramas, ocho pasos, T2VA, Linux SM120, misma semilla, mismo condicionamiento, misma política FP8 y misma configuración Sage2 | Latentes de vídeo, latentes de audio, RGB en crudo y audio flotante en crudo bit a bit iguales |
| Cobertura de tablas en esa ejecución | Misma petición | Se cargaron las 50 tablas de modulación y no se leyó ningún grupo de proyección omitido |

El autor indica expresamente que esta validación certifica el empaquetado y la reutilización para esa petición concreta, y no otras GPU ni todas las combinaciones de adaptador y tarea, y que no se emite ninguna afirmación nueva sobre memoria mínima o velocidad. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card advierte de forma explícita que el tamaño de descarga (22,92 GB) no es el requisito de VRAM.
- GPU recomendadas: la validación se realizó en Linux SM120, es decir, la generación Blackwell de consumo. La configuración automática de FP8 con escalas por tensor usa este formato para Blackwell.
- Otros aceleradores: no certificados por el autor. La ruta FP8 rowwise nativa requiere un artefacto FP8 distinto; el paquete portable AdaLN no convierte un formato de escala FP8 en otro.
- Compatibilidad con GPU de consumo: no confirmada de forma general. La única combinación probada es SM120 en Linux; no se publica ningún mínimo de memoria ni lista de modelos de tarjeta soportados.
- Opciones de despliegue: motor FreeVideo de FlashML-org (obligatorio), disponible desde https://github.com/FlashML-org/FreeVideo. En Linux, `./setup.sh --cache ./models/vdn-h3-edge/cache`; en Windows, `.\setup.ps1 --cache .\models\vdn-h3-edge\cache`. El bundle se puede descubrir desde la GUI del motor. No es cargable como checkpoint Diffusers o ComfyUI de un solo fichero, y las versiones antiguas del motor sin soporte de formato slim no pueden leer esta revisión.
- Descarga: `hf download OpenVDN/vdn-minimax-h3-edge --local-dir models/vdn-h3-edge`. El modelo es público y no requiere inicio de sesión en Hugging Face, aunque las instrucciones indican autenticarse si el repositorio fuese privado o estuviese restringido.
- Componentes adicionales: el codificador de texto, los VAE de vídeo y audio y las dependencias de ejecución se instalan por separado y no forman parte de este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVDN/vdn-minimax-h3-edge | no disponible | no disponible | Validación de equivalencia bit a bit con el modelo completo en una petición T2VA 1344×768, 362 fotogramas, ocho pasos | MiniMax H3 Community License Agreement | HuggingFace, público, descarga slim de 22,92 GB |
| OpenVDN/vdn-minimax-h3 (base) | no disponible | no disponible | no disponible | MiniMax H3 Community License Agreement | HuggingFace; requiere preparación FP8 local en el flujo original |
| MiniMax-H3 (modelo upstream) | no disponible | no disponible | no disponible | MiniMax H3 Community License Agreement | Repositorio upstream referenciado en la atribución |
| Otros modelos de generación de vídeo con audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría. La única comparación documentada es interna, entre esta revisión slim y el modelo base completo preparado, y se limita a la igualdad bit a bit de las salidas en una petición concreta.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el motor FreeVideo en una versión con soporte de `freevideo-fp8-slim-v1`. Motores anteriores no pueden leer este release.
- No es un checkpoint genérico: no se puede cargar como fichero único en Diffusers ni en ComfyUI, pese a que el repositorio declare la librería diffusers en su metadata.
- La carpeta descargada no incluye el codificador de texto, los VAE ni las dependencias de ejecución; hay que instalarlos aparte.
- Cobertura de tablas limitada: los calendarios con audio de referencia y los recuentos de pasos personalizados pueden necesitar tablas AdaLN distintas de las incluidas.
- Las LoRA que modifiquen time embeddings o proyecciones AdaLN invalidan la identidad de modulación; el motor debe entonces recurrir a la descarga opcional de las proyecciones originales (unos 26,02 GB adicionales) desde la revisión anterior, que debe seguir siendo accesible.
- La validación se limita a una única configuración de hardware (Linux SM120) y a una única petición T2VA. No certifica otras GPU, otras tareas ni otras combinaciones de adaptador. No se emite ninguna afirmación sobre memoria mínima ni velocidad.
- La ruta FP8 rowwise nativa no está cubierta por este artefacto y mantiene la preparación original hasta que se publique un artefacto verificado equivalente; la precisión no se degrada de forma silenciosa, pero tampoco se convierte automáticamente entre formatos de escala.
- Idiomas: únicamente inglés. No hay soporte multilingüe documentado.
- Riesgo de alucinación y de artefactos visuales o sonoros: inherente a los modelos generativos de difusión; no se publican métricas de fidelidad, coherencia temporal ni sincronización audio-vídeo.
- Sesgos: no documentados en la información disponible. Al entrenarse sobre datos no especificados, es esperable que reproduzca sesgos de representación y estilo presentes en ellos, pero no hay evaluación publicada.
- Licencia: MiniMax H3 Community License Agreement, incluida textualmente desde el repositorio upstream. Las condiciones exactas de uso comercial no se detallan en la información proporcionada; es imprescindible leer el fichero LICENSE del repositorio antes de cualquier despliegue en producción.
- Protección frente a cierres de dependencias: los despliegues reproducibles dependen de fijar la revisión de contenido con `hf download --revision <content_revision>`; usar `main` puede romper la reproducibilidad.
- Discrepancia de tamaño: el repositorio figura con 48,9 GB frente a los 22,92 GB de la descarga slim. La información disponible no detalla qué ficheros adicionales componen esa diferencia.
- El instalador actualizado compara fuentes públicas de Hugging Face y ModelScope verificadas, conserva descargas interrumpidas y no envía el token de Hugging Face a réplicas automáticas, pero estas garantías dependen de la versión concreta del instalador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVDN/vdn-minimax-h3-edge
- Modelo base: https://huggingface.co/OpenVDN/vdn-minimax-h3
- Revisión completa con las proyecciones AdaLN originales: https://huggingface.co/OpenVDN/vdn-minimax-h3-edge/tree/4f16eb1066d96592b84be0de532069f5d69fcfa9
- Motor FreeVideo: https://github.com/FlashML-org/FreeVideo
- Licencia: fichero LICENSE del repositorio (MiniMax H3 Community License Agreement)
- Ficheros de integridad y trazabilidad en el repositorio: `bundle.json`, `SHA256SUMS`, `READY.json`, `MODIFICATIONS.md`, `NOTICE`
- Otras referencias encontradas en la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas corporativas de Microsoft y a un agregador de noticias de IA que solo menciona OpenVDN/vdn-minimax-h3 en una lista, sin datos técnicos aprovechables.
