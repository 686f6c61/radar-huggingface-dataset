# bryanputra/hybrid-classification

## Resumen

`bryanputra/hybrid-classification` es un repositorio experimental publicado en HuggingFace por el usuario bryanputra que contiene una implementación propia de una arquitectura híbrida orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un checkpoint listo para producción: la propia model card lo describe como un punto de partida con una configuración de escala "nano", pensada para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. Los pesos incluidos (`model.safetensors`) se presentan explícitamente como una inicialización válida para pruebas de humo (smoke tests), no como un modelo con rendimiento medido.

La arquitectura declarada combina atención multi-query con un mecanismo de fusión denominado co-attention, activación Mish y normalización ScaleNorm, todo ello bajo la etiqueta genérica de "Hybrid". El recuento de parámetros de los pesos publicados es de 33.088 parámetros, lo que sitúa el modelo en un orden de magnitud de decenas de miles de parámetros, muy lejos de los transformadores densos habituales para clasificación de texto (decenas o cientos de millones).

Su relevancia ahora es limitada y de carácter didáctico o de investigación: sirve como banco de pruebas reproducible para estudiar decisiones de arquitectura (tipo de atención, fusión, normalización) sin incurrir en el coste de un entrenamiento a gran escala. No hay evidencia de que haya sido entrenado con datos reales, ni benchmarks publicados, ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid (atención multi-query + fusión por co-attention) |
| Parámetros totales | 33.088 (según el recuento de los pesos safetensors publicados) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica un checkpoint de inicialización en safetensors; no hay variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (código PyTorch asociado en `predict.py`) |
| Escala declarada | nano |
| Atención | multi query |
| Fusión | co attention |
| Activación | mish |
| Normalización | scalenorm |
| Optimizador de la receta por defecto | novograd con scheduler cosine |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura etiquetada como "Hybrid" a escala "nano", con cuatro decisiones técnicas concretas: atención multi-query (que reduce el coste de memoria del KV cache compartiendo proyecciones de clave y valor entre cabezas), una fusión mediante co-attention (mecanismo típicamente usado para modelar interacción entre dos modalidades o dos ramas de representación), activación Mish y normalización ScaleNorm (una alternativa simplificada a LayerNorm sin parámetros de sesgo ni media). El repositorio incluye `config.json` con los ajustes generados de la arquitectura y `training_args.json` con la receta por defecto, que emplea el optimizador Novograd con un scheduler de tipo cosine. No se especifica el número de capas, la dimensión oculta, el número de cabezas ni la composición del dataset.

Es importante subrayar que no consta ningún entrenamiento realizado. El propio README indica que los valores de la receta son "valores de partida en el script, no evidencia de una ejecución completada" y que el checkpoint es "una inicialización válida para smoke tests". No se menciona uso de RLHF, DPO, SFT ni ningún pipeline de alineación, ni un corpus de entrenamiento con número de tokens. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de los elementos arquitectónicos ya citados.

## Capacidades

- El repositorio no acredita ninguna capacidad funcional medida: el checkpoint publicado no ha sido entrenado, por lo que no se le puede atribuir generación de texto, razonamiento, código ni matemáticas con resultados verificables.
- La tarea objetivo declarada es clasificación, pero no se especifica el dominio (texto, imágenes, tabular, multimodal) ni las etiquetas.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- No se declaran capacidades especiales (modo de pensamiento, visión, audio, etc.).
- Lo que sí ofrece el repositorio es una implementación ejecutable: un archivo `predict.py` con bloque `__main__` de ejemplo, una configuración de arquitectura inspeccionable y un script de entrenamiento con receta por defecto.

## Casos de uso

- Pruebas de humo de pipelines de carga de pesos: el checkpoint de 33.088 parámetros en safetensors permite verificar que un cargador propio (con adaptador explícito, ya que es una implementación personalizada) lee correctamente tensores, formas y dispositivos antes de invertir en un entrenamiento real.
- Investigación en decisiones de arquitectura: comparar atención multi-query frente a atención completa, o ScaleNorm frente a LayerNorm, en un entorno de escala nano donde cada experimento es barato y reproducible.
- Estudio del mecanismo de co-attention: el diseño con fusión por co-attention es adecuado para prototipar esquemas de interacción entre dos ramas (por ejemplo, dos modalidades o dos vistas de un mismo input) antes de escalar a un modelo mayor.
- Docencia y formación: sirve como ejemplo mínimo y legible de una implementación de transformer híbrido para clasificación, con configuración y argumentos de entrenamiento separados en JSON.
- Baseline arquitectónico en trabajos comparativos: el README recomienda entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, de modo que este repositorio puede actuar como punto de partida metodológico para ese protocolo.
- Pruebas de integración continua (CI) de librerías: al ser diminuto (del orden de decenas de miles de parámetros), puede incluirse en tests automáticos de frameworks de entrenamiento para detectar regresiones en el forward/backward sin coste de GPU.
- Verificación de recetas de optimización: el par Novograd + scheduler cosine incluido en `training_args.json` puede validarse en un entorno controlado antes de trasladarlo a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara explícitamente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint no ha sido entrenado ni auditado. En consecuencia, no existen datos de MMLU, HumanEval, GSM8K ni de métricas de clasificación (exactitud, F1, AUC) atribuibles a este modelo.

| Benchmark | Resultado |
|---|---|
| Cualquier métrica de clasificación | no disponible |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 33.088 parámetros, el checkpoint ocupa del orden de 0,13 MB en fp32 y 0,07 MB en fp16, sin contar el código y los ficheros de configuración.
- GPU recomendadas: no se requiere GPU. El modelo cabe y se ejecuta en CPU sin dificultad.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (e incluso una iGPU o CPU integrada) puede alojarlo; el cuello de botella será el framework, no el modelo.
- Opciones de despliegue: vLLM, TGI, Ollama o llama.cpp no son aplicables de forma directa, ya que no existe conversión a GGUF ni soporte en esos servidores. El propio README advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. La vía prevista es ejecutar `predict.py` directamente con PyTorch.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni coste por petición, y al no haber entrenamiento no tiene sentido reportar throughput de una tarea real.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este repositorio no publica métricas. Se incluye a continuación una comparación de contexto y disponibilidad frente a baselines habituales de clasificación compacta, con datos públicos de sus respectivas model cards; ninguno de ellos es equivalente en propósito, ya que aquí se trata de un checkpoint sin entrenar.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| bryanputra/hybrid-classification | 33.088 | no disponible | MIT | Checkpoint de inicialización, sin entrenar ni benchmarks |
| DistilBERT base | ~66 millones | 512 tokens | Apache 2.0 | Modelo entrenado y evaluado |
| TinyBERT | ~14,5 millones | 512 tokens | Apache 2.0 | Modelo entrenado y evaluado |
| BERT-tiny (variante tipo distilled) | ~4,4 millones | 512 tokens | Apache 2.0 | Modelo entrenado y evaluado |

Conclusión de la comparativa: este repositorio no compite en la misma liga que los baselines anteriores. Su valor es el de un artefacto de investigación sobre arquitectura, no el de un clasificador desplegable.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier salida que produzca carece de significado semántico y no debe usarse para tomar decisiones.
- La model card indica que no ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo de interpretar erróneamente las salidas de un modelo sin entrenar como si fuesen predicciones válidas.
- No se declara ningún idioma soportado ni cobertura lingüística.
- No se declara longitud de contexto, por lo que se desconoce la ventana máxima de entrada.
- Restricciones de licencia: la licencia MIT permite uso comercial del código y de los pesos, pero el README advierte de que deben revisarse por separado los términos de los datos de origen si el repositorio se usa con datasets externos.
- Integración limitada: al ser una implementación personalizada, no funciona con APIs de carga automática estándar sin escribir un adaptador, y no dispone de formatos cuantizados ni de soporte en servidores de inferencia habituales.
- Cualquier resultado obtenido de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto que se distribuyen aquí, tal y como pide el propio autor.
- El recuento de parámetros y los ajustes de arquitectura corresponden a lo publicado; no hay información sobre capas, dimensiones ocultas ni cabezas de atención.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bryanputra/hybrid-classification
- Archivo de configuración de arquitectura: https://huggingface.co/bryanputra/hybrid-classification/blob/main/config.json
- Receta de entrenamiento por defecto: https://huggingface.co/bryanputra/hybrid-classification/blob/main/training_args.json
- Script de inferencia/ejemplo: https://huggingface.co/bryanputra/hybrid-classification/blob/main/predict.py
- Checkpoint de inicialización: https://huggingface.co/bryanputra/hybrid-classification/blob/main/model.safetensors
- Paper, blog, repositorio adicional o demo: no disponible
