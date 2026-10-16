# NikodemWnw55/contrastive-pretrained

## Resumen

contrastive-pretrained es un prototipo de investigación publicado por el usuario NikodemWnw55 (Nikodem Wieczorek) en HuggingFace. Se trata de una implementación propia de una arquitectura híbrida denominada Cnn Transformer, orientada al aprendizaje contrastivo, con atención de tipo grouped query, fusión con puertas (gated fusion), activación Mish y normalización InstanceNorm. El repositorio incluye el código de inferencia, un fichero de configuración de arquitectura y un receta de entrenamiento por defecto basada en AdamW con calentamiento lineal.

El dato más relevante es su escala real: el checkpoint `model.safetensors` contiene únicamente 33.088 parámetros. La model card etiqueta la configuración como "giant", pero esa etiqueta corresponde a un nombre de preset en el código y no guarda relación con el tamaño efectivo de los tensores. No se trata, por tanto, de un modelo de gran escala ni de un modelo entrenado.

La propia documentación del autor es explícita: el checkpoint es una inicialización válida para pruebas de humo (smoke tests) y no se presenta como un modelo entrenado ni como referencia de benchmarks. No se declara ninguna puntuación de evaluación y el repositorio no registra descargas ni "likes". Su interés es exclusivamente metodológico: sirve como plantilla reproducible para experimentar con arquitecturas CNN-transformer y objetivos contrastivos, no como modelo utilizable en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida CNN + transformer) con atención grouped query, gated fusion, activación Mish y normalización InstanceNorm |
| Parametros totales | 33.088 (según los tensores de `model.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye un checkpoint en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) e implementación en PyTorch (`inference.py`) |
| Escala declarada en la model card | "giant" (etiqueta de preset; no refleja los 33.088 parámetros reales) |
| Optimizador de la receta por defecto | AdamW con planificador de calentamiento lineal |
| Tamaño del repositorio | 0,0 GB |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura combina componentes convolucionales con bloques de atención tipo transformer, según la etiqueta `cnn_transformer` y el propio apartado "Architecture" de la model card. Los detalles declarados son: atención con grouped query (menos cabezas de clave/valor que de consulta, orientado a reducir coste de memoria), fusión de ramas mediante gated fusion, función de activación Mish y normalización InstanceNorm. No se especifica el número de capas, la dimensión del modelo, el número de cabezas, la longitud de contexto ni la composición del dataset.

En cuanto al entrenamiento, el repositorio incluye `training_args.json` con una receta de partida (AdamW y calentamiento lineal), pero el autor indica expresamente que son valores iniciales del script y no evidencia de una ejecución completada. No se documentan número de tokens, composición del corpus, ni fases de RLHF, DPO o ajuste por instrucciones. No hay innovaciones técnicas adicionales descritas más allá de las ya citadas (grouped query attention y gated fusion).

Los ficheros que componen el repositorio son `inference.py` (artefacto principal y punto de entrada), `README.md`, `config.json` (configuración de arquitectura), `training_args.json` (receta por defecto) y `model.safetensors` (checkpoint de inicialización). Al ser una implementación propia, las APIs genéricas de carga automática de HuggingFace (por ejemplo, `AutoModel`) requieren un adaptador explícito antes de poder usarse.

## Capacidades

- Generación de texto: no disponible; el checkpoint es una inicialización sin entrenar, por lo que no produce salidas coherentes.
- Razonamiento, código y matemáticas: no disponible por la misma razón.
- Visión: no disponible, pese a que la etiqueta "contrastive" se asocia habitualmente a tareas visión-lenguaje; en este repositorio no se documenta ningún componente visual.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidad especial (thinking mode, audio, etc.): ninguna documentada.
- Recuperación de representaciones contrastivas: es el objetivo declarado de la arquitectura, pero no hay evidencia de que el checkpoint actual produzca embeddings útiles al no haber sido entrenado.
- Ejecución de pruebas de humo: sí, el repositorio incluye un ejemplo en el bloque `__main__` de `inference.py` que permite comprobar que el modelo se instancia y ejecuta hacia delante.

## Casos de uso

- Pruebas de humo en pipelines de integración continua: el checkpoint sirve para verificar que la serialización en safetensors, la carga de pesos y el forward pass funcionan antes de sustituirlo por un modelo entrenado, sin consumir GPU ni tiempo de cómputo apreciable.
- Plantilla base para experimentos de aprendizaje contrastivo: el repositorio aporta una receta reproducible (AdamW, calentamiento lineal) y una configuración de arquitectura editable, útil para investigadores que quieran partir de una estructura fija y comparar variantes con el mismo presupuesto de cómputo y las mismas semillas.
- Estudio de arquitecturas híbridas CNN-transformer: permite medir el efecto de combinar capas convolucionales con atención grouped query en tareas de representación, aislando la contribución de cada componente.
- Banco de pruebas de normalización y activación: al usar InstanceNorm y Mish, sirve para comparar estas elecciones frente a LayerNorm y GELU/ReLU en un mismo esqueleto de código, con un coste de entrenamiento mínimo.
- Docencia y reproducción de resultados: por su tamaño (33.088 parámetros) es viable ejecutarlo y entrenarlo en un portátil o incluso en CPU, lo que facilita ejercicios prácticos sobre objetivos contrastivos y depuración de código de entrenamiento.
- Adaptación a APIs de carga automática: el caso de uso práctico de ingeniería es envolver `inference.py` en un adaptador compatible con `AutoModel` y `AutoConfig`, de modo que el prototipo pueda integrarse en herramientas estándar del ecosistema HuggingFace.
- Validación de formatos de pesos: el fichero safetensors permite comprobar flujos de conversión, verificación de integridad y publicación de artefactos en el Hub sin coste de almacenamiento relevante.
- Referencia de línea base de mínima capacidad: en experimentos controlados puede actuar como baseline de capacidad muy reducida frente a arquitecturas mayores, siempre que se entrene con la misma exposición de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de evaluación y que el checkpoint no ha sido entrenado ni auditado. Cualquier cifra que se publique en el futuro debería documentarse por separado de los valores por defecto que se distribuyen en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en fp32 (33.088 parámetros × 4 bytes ≈ 132 KB); en fp16 ≈ 66 KB. El consumo real vendrá determinado por el sobrecoste del framework de PyTorch, no por el modelo.
- GPU recomendadas: ninguna en particular; cualquier GPU sirve. El modelo es ejecutable en CPU sin penalización perceptible.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU consumer e integrada, e incluso en dispositivos sin GPU (Raspberry Pi, móvil, contenedores sin acelerador).
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es una implementación propia que no sigue los formatos estándar de transformers ni dispone de conversión a GGUF. El despliegue debe hacerse con el propio `inference.py` o mediante un adaptador personalizado.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones; dado el tamaño, la latencia esperada sería del orden de microsegundos a pocos milisegundos en CPU, pero se trata de una estimación derivada del recuento de parámetros, no de un dato medido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada. La búsqueda web devuelve proyectos de aprendizaje contrastivo, pero no alternativas equivalentes a este prototipo concreto. La comparación siguiente se limita a los datos disponibles y marca como no disponible todo lo que no se ha podido verificar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Entrenado |
|---|---|---|---|---|---|
| contrastive-pretrained (NikodemWnw55) | 33.088 | no disponible | apache-2.0 | HuggingFace | no (checkpoint de inicialización) |
| CLM-8B (Contrastive-LM) | 8.000 millones (según el nombre del modelo en el repositorio) | no disponible | no disponible | GitHub (servido tras API compatible con TypeSafe) | no disponible en la información recogida |
| Modelos entrenados con el toolkit nomic-ai/contrastors | no disponible | no disponible | no disponible | GitHub | toolkit de entrenamiento, no un modelo concreto |

La diferencia de escala entre este prototipo y cualquier modelo contrastivo de referencia es de varios órdenes de magnitud, por lo que no existe una comparación de rendimiento significativa posible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización, por lo que las salidas carecen de valor semántico y no deben usarse para ninguna tarea real.
- Ausencia total de benchmarks: no hay métricas publicadas, ni evaluación con conjuntos retenidos, ni comparación con baselines de capacidad equivalente.
- Etiqueta de escala engañosa: la model card califica la configuración como "giant" mientras el modelo tiene 33.088 parámetros; conviene no confundir el nombre del preset con el tamaño real.
- Sin auditoría de sesgos, robustez ni transferencia de dominio, tal y como reconoce el propio autor.
- Idiomas no declarados: no se puede asumir soporte de castellano, inglés ni de ningún otro idioma.
- Longitud de contexto no documentada, lo que impide planificar casos de uso que dependan de ventanas amplias.
- Sin variantes cuantizadas: no hay ficheros GGUF, GPTQ ni AWQ, lo que descarta los flujos de despliegue habituales en producción.
- Incompatibilidad con las APIs de carga automática: requiere un adaptador explícito para integrarse en `transformers`, vLLM o TGI.
- Licencia apache-2.0: permite uso comercial y modificación, pero el software se entrega sin garantías; si se emplean datos externos, deben revisarse por separado los términos de esas fuentes, tal y como advierte la model card.
- Cero tracción en el Hub (0 descargas, 0 likes, repositorio de 0,0 GB): no hay evidencia de uso por parte de terceros ni de validación externa.
- No debe desplegarse en producción bajo ninguna circunstancia con los pesos actuales; cualquier resultado futuro deberá documentarse de forma separada a los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NikodemWnw55/contrastive-pretrained
- Perfil del autor en HuggingFace: https://huggingface.co/NikodemWnw55
- Toolkit de entrenamiento contrastivo de nomic-ai (referencia general, no relacionada directamente con este modelo): https://github.com/nomic-ai/contrastors
- Documentación de nomic-ai/contrastors (referencia general): https://deepwiki.com/nomic-ai/contrastors
- Repositorio de Contrastive Language Models (CLM), referencia general sobre modelos contrastivos: https://github.com/Contrastive-LM/CLM
- Artículo sobre NiCLIP, aprendizaje contrastivo lenguaje-imagen en neuroimagen (referencia general): https://www.nature.com/articles/s41467-026-78451-7.pdf
