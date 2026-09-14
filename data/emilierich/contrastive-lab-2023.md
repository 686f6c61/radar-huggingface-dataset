# EmilieRich/contrastive-lab-2023

## Resumen

`EmilieRich/contrastive-lab-2023` es un prototipo de investigación publicado en HuggingFace por el usuario EmilieRich. Se presenta explícitamente como un esqueleto reproducible para experimentos de aprendizaje contrastivo basado en una arquitectura Poolformer, con una configuración etiquetada como "base". No es un modelo entrenado: la model card indica que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y no un checkpoint con benchmarks.

El repositorio incluye el código del modelo (`predict.py`), la configuración de arquitectura (`config.json`), los hiperparámetros por defecto (`training_args.json`) y los pesos en formato safetensors. Los metadatos de safetensors registran 16.576 parámetros totales, una cifra extremadamente baja para un transformer y que sitúa al artefacto fuera de cualquier uso generativo real; conviene tratarla con cautela porque el formato del número (punto como separador) es ambiguo en el panel de HuggingFace.

Su relevancia actual es limitada y de carácter metodológico: sirve como plantilla mínima para montar experimentos contrastivos con un token mixer de pooling, y como recordatorio de buenas prácticas de evaluación (conjunto de test específico de la tarea, al menos tres semillas y una línea base con capacidad equivalente). El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente de ningún tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Poolformer (familia MetaFormer, con pooling como token mixer) |
| Parametros totales | 16.576 (según metadatos de safetensors del repositorio; cifra ambigua por el separador decimal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

Otros parámetros declarados en la model card: escala "base", atención de ventana deslizante (sliding window), fusión de tensores (tensor fusion), activación ReLU y normalización por BatchNorm. No se especifican dimensiones de embedding, número de capas, número de cabezas ni resolución de entrada.

## Arquitectura y entrenamiento

La arquitectura es un Poolformer, es decir, un modelo de la familia MetaFormer en el que el mecanismo de mezcla de tokens (token mixer) no es atención convencional, sino una operación de pooling. La configuración publicada añade una atención de ventana deslizante y una fusión de tensores, con activación ReLU y normalización BatchNorm. El repositorio no documenta el número de capas, la dimensión oculta ni el tamaño de la ventana de atención, por lo que no es posible reconstruir el grafo completo a partir de la información disponible. La model card advierte además que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito.

En cuanto al entrenamiento, no hay ninguno completado. El archivo `training_args.json` recoge una receta por defecto con optimizador RMSprop y un schedule de tipo "step", descrita por el autor como valores de arranque del script y no como evidencia de una ejecución finalizada. No se declara volumen de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El autor recomienda que cualquier evaluación futura entrene todas las líneas base con la misma exposición de datos, el mismo presupuesto de ajuste y las mismas semillas aleatorias, y que se conserven los registros de entrenamiento y las versiones de entorno.

## Capacidades

No hay capacidades verificadas ni documentadas. El propio repositorio indica que el checkpoint es una inicialización sin entrenar. En concreto:

- Generación de texto: no documentada y no plausible con 16.576 parámetros.
- Razonamiento, código o matemáticas: no disponible.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Aprendizaje contrastivo: es el objetivo declarado del prototipo, pero no se aporta ninguna métrica de representación aprendida.
- Ejecución de ejemplo: el script `predict.py` incluye un bloque `__main__` con un ejemplo de prueba de humo que puede inspeccionarse con `python predict.py --help`.

## Casos de uso

- Plantilla para experimentos de representación contrastiva: el repositorio ofrece un esqueleto ejecutable (modelo + `config.json` + `training_args.json`) sobre el que montar una comparación controlada entre funciones de pérdida contrastivas, reutilizando la misma arquitectura y semillas.
- Prueba de humo en pipelines de CI/CD: cargar `model.safetensors` y ejecutar una pasada forward sirve para verificar que el entorno (versión de PyTorch, safetensors, dependencias) está correctamente instalado antes de lanzar trabajos costosos.
- Validación de toolchains de serialización: al ser un checkpoint pequeño en safetensors, es útil para probar conversores, cargadores y rutas de exportación a otros formatos sin consumir recursos.
- Docencia de arquitecturas MetaFormer: su tamaño reducido y su configuración explícita (pooling como token mixer, atención de ventana deslizante, BatchNorm) lo convierten en un ejemplo manejable para explicar variantes de transformer sin atención completa.
- Estudio de operadores de pooling como token mixer: sirve como punto de partida para sustituir el mezclador de tokens y medir el efecto en una tarea contrastiva concreta, siempre con un conjunto de validación específico.
- Reproducibilidad de recetas: `training_args.json` documenta una receta por defecto (RMSprop, schedule step) que puede versionarse junto a los resultados para auditar cambios de hiperparámetros.
- Línea base de infraestructura para ablaciones: permite ensayar el protocolo de evaluación descrito por el autor (métrica de tarea en al menos tres semillas, línea base de capacidad equivalente) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado. Por tanto, no procede comparar cifras de MMLU, HumanEval, GSM8K ni de métricas contrastivas como Recall@K o linear probe accuracy.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 66 KB en fp32 y 33 KB en fp16 para los pesos (16.576 parámetros). El coste real lo domina el runtime de PyTorch, del orden de 500 MB a 1 GB en CPU o GPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3050, RTX 4090) o incluso CPU es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con soporte CUDA, y también en CPU y en entornos sin acelerador.
- Opciones de despliegue: al ser una implementación propia, no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La vía indicada por el autor es ejecutar el script incluido y, si se necesita carga automática, escribir un adaptador explícito.
- Latencia y throughput estimados: no disponibles. Con este número de parámetros no se publican mediciones y carecerían de valor orientativo.
- Almacenamiento: el repositorio ocupa 0.0 GB según el panel de HuggingFace, coherente con un checkpoint de inicialización mínimo.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa cuantitativa. La tabla recoge únicamente lo verificable y marca el resto como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmilieRich/contrastive-lab-2023 | 16.576 (según safetensors) | no disponible | sin benchmarks publicados | apache-2.0 | HuggingFace, 0 descargas |
| PoolFormer original (familia MetaFormer) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | publicación académica |
| Modelos contrastivos tipo CLIP / SimCLR | no disponible en la información proporcionada | no disponible | no disponible | no disponible | pesos públicos de terceros |

Cualquier comparación con alternativas de la misma categoría (aprendizaje contrastivo) exigiría primero entrenar este prototipo y evaluarlo con el mismo protocolo que las líneas base, algo que el repositorio no ha hecho.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo utilizable en producción.
- No existen benchmarks, métricas ni validación externa; el repositorio tiene 0 descargas y 0 likes.
- No se ha auditado robustez, equidad (fairness) ni transferencia de dominio, según declara el propio autor.
- No se documentan sesgos conocidos porque tampoco se documentan datos de entrenamiento; el riesgo de sesgo es indeterminado, no inexistente.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede evaluarse su comportamiento multilingüe ni con entradas largas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de interpretar erróneamente el repositorio como un modelo funcional; la model card insiste en lo contrario.
- Restricciones de licencia: los pesos se publican bajo apache-2.0, lo que permite uso comercial, pero el autor recomienda revisar por separado los términos de los datos fuente si se combina con datasets externos.
- La carga mediante APIs automáticas genéricas requiere un adaptador explícito al tratarse de una implementación personalizada.
- El recuento de 16.576 parámetros es ambiguo en su formato (posible separador de millares) y resulta incoherente con una arquitectura "base"; conviene verificar el `config.json` antes de sacar conclusiones sobre el tamaño real.
- Cualquier resultado obtenido en el futuro con un checkpoint entrenado deberá documentarse por separado de los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EmilieRich/contrastive-lab-2023
- Referencia general de la arquitectura Poolformer / MetaFormer: arXiv:2111.11418 (no encontrada en la búsqueda web; aportada como referencia externa de la familia arquitectónica).
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo: los enlaces recuperados correspondían a páginas de WhatsApp y no guardan relación con el repositorio. No hay papers, blogs, repositorios ni demos adicionales que enlazar.
