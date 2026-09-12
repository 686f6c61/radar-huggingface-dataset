# oxyllina/tabinezumi

## Resumen

oxyllina/tabinezumi es un modelo publicado en Hugging Face por el usuario oxyllina del que no se ha hecho pública ninguna documentación técnica. La ficha del repositorio no declara pipeline, licencia, idiomas, arquitectura ni número de parámetros, y el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face para poder descargar los pesos, por lo que no ha sido posible inspeccionar los archivos ni determinar su formato.

El único dato cuantificable disponible es el tamaño del repositorio, 0,2 GB, junto con metadatos de actividad (0 descargas, 1 like) y las fechas de creación (24 de junio de 2026) y última actualización (12 de septiembre de 2026). No se ha localizado paper, blog técnico, repositorio de código ni resultados de benchmarks asociados al modelo.

Esta ficha recoge por tanto únicamente la información verificable y marca de forma explícita como "no disponible" todo aquello que el autor no ha publicado. Cualquier afirmación sobre su arquitectura, calidad o idoneidad para producción sería especulativa en el estado actual de la información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio con acceso restringido, no inspeccionable) |
| Identificador | oxyllina/tabinezumi |
| Autor | oxyllina |
| Tamaño del repositorio | 0,2 GB |
| Acceso | restringido (gated, requiere aceptar condiciones en Hugging Face) |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 24 de junio de 2026 |
| Ultima actualizacion | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. Se desconoce si se trata de un transformer denso, un transformer con mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un híbrido, así como el número de capas, la dimensión oculta, el mecanismo de atención o el tokenizador empleado. El repositorio no incluye model card descriptiva, configuración visible ni paper asociado.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, idiomas de entrenamiento, uso de ajuste supervisado, RLHF, DPO u otras técnicas de alineación. El tamaño del repositorio (0,2 GB) es el único indicio material disponible, pero no permite determinar el número de parámetros, ya que podría tratarse de un conjunto parcial de pesos, de un adaptador, de un checkpoint en cuantización agresiva o de pesos completos de un modelo muy pequeño. No se ha confirmado ninguna innovación técnica (decodificación especulativa, atención lineal, contextos extendidos, etc.).

## Capacidades

No se ha publicado ninguna descripción de las capacidades del modelo. No es posible confirmar ninguno de los siguientes extremos:

- Generación de texto, razonamiento, generación de código o matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la ficha no declara idiomas).
- Capacidades especiales (modo de razonamiento explícito, visión, audio, entrada multimodal): no disponible.
- Ventana de contexto utilizable en tareas de contexto largo: no disponible.

La única vía para verificar estas capacidades sería solicitar acceso al repositorio y ejecutar una evaluación propia.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer la arquitectura, el tamaño, la licencia ni las capacidades del modelo: cualquier propuesta sería una hipótesis no verificada. A continuación se indican, de forma explícita, los escenarios condicionales que habría que validar antes de considerar el modelo para producción:

- Evaluación interna de viabilidad: solicitar acceso al repositorio, inspeccionar la configuración y el tokenizador, y ejecutar una batería mínima de prompts para determinar si el modelo genera texto coherente. Es el único paso justificable hoy.
- Prototipado en local: si los 0,2 GB corresponden a la totalidad de los pesos en precisión de 16 bits, el conjunto equivaldría aritméticamente a unos 100 millones de parámetros (0,2 GB / 2 bytes por parámetro), un tamaño que cabría en cualquier GPU de consumo; el dato no está confirmado.
- Clasificación o extracción de información sobre texto: solo si una evaluación previa demuestra competencia en tareas discriminativas. No verificado.
- Generación de código en pipelines de CI/CD: descartado en el estado actual, ya que no hay evidencia de soporte de tool calling, de entrenamiento en código ni de licencia que permita uso comercial.
- Atención al cliente multi-turno: descartado como caso de uso hasta conocer la ventana de contexto y la licencia.
- Despliegue como servicio con vLLM, TGI, llama.cpp u Ollama: no planificable, porque se desconoce la familia arquitectónica y el formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia puramente aritmética, 0,2 GB de pesos en fp16 implicarían del orden de 100 millones de parámetros, y en fp16 ese peso ocuparía aproximadamente 0,2 GB de VRAM, más el overhead del runtime y la caché KV. Esta cifra no está confirmada y depende de que el repositorio contenga la totalidad de los pesos.
- GPU recomendadas: no disponible. No se ha publicado ninguna recomendación por parte del autor.
- Compatibilidad con GPU de consumo: indeterminada. Si el conjunto de pesos es completo y del orden de 0,2 GB, cabría en cualquier GPU con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3060, RTX 4060 o Apple Silicon con memoria unificada; se trata de una estimación condicional, no verificada.
- Opciones de despliegue: no disponible. No se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama, TGI o transformers sin conocer la arquitectura y el formato de pesos (safetensors, GGUF, PyTorch binario u otros).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa sin conocer el tamaño, la arquitectura, el contexto y la licencia del modelo. La ausencia de benchmarks publicados y de documentación impide además identificar con rigor la categoría a la que pertenece.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card, paper ni notas técnicas, lo que impide auditar el entrenamiento, los datos utilizados y los sesgos potenciales.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, redistribución ni modificación. En la práctica, el modelo debe tratarse como no apto para producción hasta que el autor aclare este punto.
- Acceso restringido: los pesos requieren aceptar condiciones en Hugging Face, lo que añade fricción y puede implicar términos adicionales no publicados.
- Riesgo de alucinación: desconocido, pero en ausencia de benchmarks y de información sobre alineación debe asumirse un riesgo no cuantificado y aplicar verificación externa en cualquier uso real.
- Sesgos: no evaluables, ya que se desconoce la composición del dataset de entrenamiento y los idiomas cubiertos.
- Limitaciones de contexto e idioma: no disponibles; no se ha declarado ventana de contexto ni cobertura lingüística.
- Falta de validación comunitaria: 0 descargas y 1 like indican que el modelo no ha sido adoptado ni evaluado por terceros, por lo que no existen referencias independientes de calidad, seguridad o estabilidad.
- Procedencia e integridad: al no poder inspeccionarse el repositorio, no hay verificación de que los archivos sean pesos de un modelo utilizable ni de que no contengan código ejecutable no deseado.
- Idoneidad para producción: no recomendada en el estado actual de la información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxyllina/tabinezumi
- Paper: no disponible.
- Repositorio de código: no disponible.
- Blog técnico o anuncio: no disponible.
- Demo o espacio interactivo: no disponible.

Las búsquedas web realizadas no devolvieron ningún resultado relacionado con el modelo. Los enlaces recuperados corresponden a hilos de un foro francés de salud (consultas sobre un bollo tradicional, previsiones meteorológicas, medicamentos y una operación de ligamentos) y no guardan relación alguna con oxyllina/tabinezumi, por lo que se han descartado como fuentes.
