# nghyane/fumetto-translate-2b

## Resumen

Fumetto Translate 2B es un modelo de traduccion automatica derivado de la familia PLaMo 3, publicado por el usuario nghyane en Hugging Face. Se distribuye ya cuantizado en 4 bits para su uso con MLX, el framework de Apple para inferencia en silicio de la compania, y esta pensado especificamente para la app de lectura de comics Fumetto en iPhone. El modelo resuelve la traduccion de texto dentro de una aplicacion movil, sin necesidad de preparar pesos ni conversion adicional en el dispositivo.

El repositorio contiene 2.878.595.584 parametros en formato safetensors, con un tamano total de 1,7 GB, lo que es coherente con una cuantizacion mixta: capas transformer y embeddings en 4 bits, y capa de salida en 6 bits, con grupos de 64 y esquema affine. La model card es extremadamente escueta y no aporta informacion sobre datos de entrenamiento, idiomas soportados, licencia ni evaluacion.

La relevancia de este modelo es acotada: se trata de un artefacto de despliegue para un caso de uso muy concreto (traduccion dentro de una app iOS) mas que de un modelo de proposito general documentado. Para desarrolladores e investigadores es interesante como ejemplo de empaquetado MLX 4-bit de un modelo PLaMo 3, pero carece de la documentacion necesaria para evaluarlo fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3, segun tag del repositorio) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en capas transformer y embeddings; 6 bits en capa de salida; grupos de 64, affine |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, cuantizado) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer de la familia PLaMo 3, empaquetado para MLX con una cuantizacion mixta: 4 bits para las capas transformer y los embeddings, y 6 bits para la capa de salida, con tamano de grupo 64 y cuantizacion affine. Esta configuracion es tipica de los pesos preparados para `mlx-lm` en dispositivos Apple, donde la capa de salida se mantiene a mayor precision para preservar la calidad del vocabulario.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo ajuste por instrucciones, RLHF o DPO, ni sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El modelo base PLaMo 3 es desarrollado por Preferred Networks, pero la model card no detalla que variante concreta se ha utilizado ni que proceso de ajuste se ha aplicado para la tarea de traduccion.

## Capacidades

- Traduccion de texto: es la funcion declarada del modelo, orientada a la traduccion de contenido dentro de la app Fumetto.
- Ejecucion en dispositivo: los pesos estan preparados para cargarse directamente con MLX en iPhone, sin pasos de conversion.
- Generacion de texto: al derivar de un modelo de lenguaje PLaMo 3, cabe esperar capacidad generativa general, aunque no esta documentada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se especifican los pares de idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Traduccion de dialogos de comics en la app Fumetto: el modelo se carga en el iPhone con MLX y traduce los bocadillos de texto de las viñetas sin enviar contenido a un servidor, lo que encaja con el requisito de privacidad y con la cuantizacion 4-bit para reducir memoria.
- Traduccion offline en aplicaciones iOS: al estar empaquetado para MLX y ocupar 1,7 GB, puede integrarse en apps que necesiten traducir texto sin conexion en dispositivos Apple con suficiente memoria unificada.
- Prototipado de pipelines de traduccion en local: sirve como punto de partida para experimentar con modelos PLaMo 3 cuantizados en entornos MLX antes de escalar a otras configuraciones.
- Lectura asistida de material extranjero: un lector de comics o documentos puede usar el modelo para generar traducciones al vuelo de fragmentos cortos, aprovechando la inferencia en dispositivo.
- Evaluacion de cuantizacion mixta 4/6 bits: investigadores pueden estudiar el impacto de mantener la capa de salida a 6 bits frente a una cuantizacion uniforme en tareas de traduccion.
- Integracion en flujos de edicion de comics: el modelo puede alimentar herramientas que generen versiones traducidas de paginas escaneadas, combinado con OCR externo, ya que el modelo no procesa imagenes por si mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 1,7 GB, por lo que la inferencia en MLX requiere del orden de 2 GB de memoria unificada, mas el espacio para el contexto y las activaciones.
- GPU recomendadas: al estar empaquetado para MLX, el destino principal son los chips Apple (serie A y serie M). No se documenta soporte para CUDA ni ROCm.
- Compatibilidad con GPU de consumo: en el ecosistema Apple cabe en iPhone y en Mac con chip M; en el ecosistema NVIDIA no se ha validado el formato MLX.
- Opciones de despliegue: MLX (`mlx-lm`) es el unico entorno documentado. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fumetto Translate 2B | 2.878.595.584 | no disponible | no disponible | safetensors MLX 4/6-bit | Traduccion para app iOS |
| PLaMo 3 (modelo base) | no disponible en esta ficha | no disponible | no disponible | no disponible | Modelo original de Preferred Networks |
| Alternativas de traduccion de ~2-3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables verificados |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe datos de entrenamiento, idiomas, licencia ni evaluacion, lo que impide validar su calidad de traduccion de forma objetiva.
- Licencia no especificada: al no indicarse licencia, no se puede confirmar el uso comercial; es necesario contactar con el autor o consultar la licencia del modelo base PLaMo 3.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones inventadas o inexactas, especialmente en textos con jerga, onomatopeyas o contextos culturales propios del comic.
- Dependencia de MLX: el formato esta pensado para Apple Silicon; no es directamente portable a otros entornos sin reconversion.
- Idiomas no documentados: se desconoce la cobertura real de pares de idiomas y la calidad en cada uno.
- Contexto desconocido: no se especifica la ventana de contexto, lo que dificulta planificar su uso en textos largos.
- Sin benchmarks: no hay evidencia publica de rendimiento frente a modelos de traduccion establecidos.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nghyane/fumetto-translate-2b
- Repositorio MLX: no disponible en la informacion proporcionada
- Paper o blog del modelo base PLaMo 3: no disponible en la informacion proporcionada
- Demo o aplicacion Fumetto: no disponible en la informacion proporcionada
