# Jemillerpit/paper-classification

## Resumen

Jemillerpit/paper-classification es un repositorio experimental publicado por el usuario Jemillerpit (Jayden Miller) en HuggingFace que contiene una implementación propia de un transformer de escala "nano" orientado a tareas de clasificación. No es un modelo entrenado ni un checkpoint con rendimiento validado: el archivo `model.safetensors` que acompaña al repositorio se presenta explícitamente en la model card como una inicialización válida para pruebas de humo (smoke tests), no como un modelo con pesos entrenados.

El interés del repositorio es fundamentalmente didáctico y de investigación sobre arquitecturas. Con 16.576 parámetros totales, se trata de un banco de pruebas para inspeccionar decisiones de diseño (atención dilatada, fusión por concatenación con MLP, activación approx gelu, normalización por batchnorm) antes de lanzar un entrenamiento completo. El repositorio declara licencia MIT, lo que facilita su reutilización y modificación.

Es relevante ahora porque da acceso a un esqueleto de transformer personalizado y ligero para experimentar con clasificación de documentos científicos, un área con datasets y benchmarks públicos específicos (por ejemplo, PaperNet o clasificación de abstracts de ArXiv). Ahora bien, para cualquier uso real hay que entrenarlo desde cero: el repositorio no aporta pesos útiles ni métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación propia), escala nano |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `model.safetensors` en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más código PyTorch en `finetune.py` |

Detalles de arquitectura declarados por el autor en la model card:

| Elemento | Valor |
|---|---|
| Atencion | dilatada (dilated attention) |
| Fusion | concat mlp |
| Activacion | approx gelu |
| Normalizacion | batchnorm |
| Optimizador por defecto | adamw |
| Scheduler por defecto | polynomial |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala nano de implementación propia, con atención dilatada en lugar de atención completa, fusión de representaciones mediante concatenación seguida de un MLP, activación approx gelu y normalización por batchnorm en lugar de la layer norm habitual en transformers estándar. El conjunto suma 16.576 parámetros, un orden de magnitud muy inferior al de cualquier encoder BERT (un BERT-base ronda los 110 millones de parámetros), lo que lo sitúa en la categoría de juguete experimental más que de modelo de producción.

En cuanto al entrenamiento, no hay evidencia de que se haya completado ninguno. La model card es explícita: la receta incluida (`adamw` con scheduler polinómico) son valores de partida del script, no el resultado de una ejecución terminada, y el checkpoint distribuido es una inicialización para smoke tests. El autor recomienda que cualquier evaluación seria use un split etiquetado específico de la tarea, reporte la métrica a lo largo de al menos tres semillas e incluya una línea base de capacidad comparable. No se documenta número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones, porque no existen.

## Capacidades

- Clasificación de texto: es el único objetivo declarado del repositorio. El modelo está pensado para asignar una etiqueta a una entrada de texto una vez entrenado.
- Entrenamiento y ajuste: el repositorio incluye `finetune.py` como artefacto principal, con un bloque `__main__` que genera un ejemplo de smoke test ejecutable vía `python finetune.py --help`.
- Inspección de arquitectura: `config.json` recoge los ajustes de arquitectura generados y `training_args.json` la receta de experimento por defecto, lo que permite auditar el diseño antes de entrenar.
- Generación de texto: no disponible. No hay cabeza de generación ni pesos entrenados para ello.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible, no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

Todos los casos siguientes presuponen entrenar el modelo primero. El checkpoint publicado, por sí solo, no produce predicciones útiles.

- Docencia y prototipado de arquitecturas: sirve como base mínima para que un estudiante o investigador modifique atención dilatada, sustituya batchnorm por layer norm o cambie la fusión concat+MLP, y observe el efecto con un coste computacional casi nulo.
- Clasificación de abstracts científicos: entrenándolo sobre un split etiquetado de resúmenes de artículos, puede usarse para categorizar trabajos por disciplina o metodología (machine learning, NLP, etc.), un escenario con datasets públicos como PaperNet o los usados en clasificadores sobre ArXiv.
- Filtrado previo de grandes volúmenes documentales: por su tamaño mínimo, podría ejecutarse en CPU para descartar o etiquetar preliminarmente documentos antes de pasarlos a un modelo mayor, siempre que se valide su precisión en la tarea concreta.
- Enrutamiento ligero de consultas: en un pipeline con varios modelos especializados, un clasificador de este tamaño podría decidir a qué modelo derivar cada consulta, si se entrena con datos de intención etiquetados.
- Pruebas de integración y CI: el ejemplo de smoke test permite verificar que un pipeline de entrenamiento o despliegue funciona de extremo a extremo sin consumir GPU ni tiempo apreciable.
- Experimentos de eficiencia y ablaciones: al tener 16.576 parámetros, permite medir latencia, consumo de memoria y estabilidad de entrenamiento en entornos muy restringidos (Raspberry Pi, microcontroladores con soporte PyTorch, CPU de un solo núcleo).
- Generación de líneas base reproducibles: con al menos tres semillas y datos etiquetados, puede actuar como baseline de capacidad mínima frente a la que comparar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización no entrenada ni auditada en robustez, equidad o transferencia de dominio.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB con los 16.576 parámetros en precisión de 32 bits (unos 66 KB solo de pesos, más activaciones despreciables). En 16 bits serían unos 33 KB.
- GPU recomendadas: no requiere GPU. Cualquier GPU sirve, pero es innecesaria; el cálculo cabe holgadamente en CPU.
- GPU de consumo: cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, integradas) e incluso en dispositivos de placa única.
- Opciones de despliegue: la model card advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática necesitan un adaptador explícito antes de poder usarse. Por tanto, vLLM, llama.cpp, Ollama o TGI no funcionan directamente sin escribir ese adaptador. El camino natural es cargar `finetune.py` y `model.safetensors` desde Python con PyTorch.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas y, al no haber pesos entrenados, cualquier cifra sería especulativa.

## Comparativa con modelos similares

Comparativa con alternativas orientadas a la misma tarea (clasificación de documentos científicos) encontradas en la búsqueda web:

| Modelo / enfoque | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jemillerpit/paper-classification | 16.576 | no disponible | solo inicializacion, sin entrenar | MIT | HuggingFace |
| Kushtrim/bert-ai-paper-classifier-arxiv | ≈110 M (bert-base-cased) | 512 tokens (BERT-base) | ajustado sobre el dataset ArXiv, 5 categorias | no disponible | HuggingFace |
| SVM + TF-IDF sobre abstracts | no aplica | limitado por vectorizacion | entrenado sobre abstracts etiquetados | no disponible | implementacion propia |
| Embeddings SPECTER + clasificador | no aplica | condicionado por el encoder | evaluado en clasificacion de disciplinas | no disponible | investigacion publicada |

Las alternativas basadas en BERT-base o en embeddings especializados de literatura científica (SPECTER) parten de representaciones preentrenadas sobre grandes corpus, mientras que este repositorio arranca de cero con 16.576 parámetros. La comparación de rendimiento no es posible porque este repositorio no publica métricas.

## Limitaciones y advertencias

- El checkpoint publicado no está entrenado. Producirá salidas sin sentido semántico en cualquier tarea de clasificación real.
- No hay resultados de benchmarks, ni evaluación de robustez, equidad o transferencia de dominio. La model card deja claro que el checkpoint no ha sido auditado en ninguno de esos aspectos.
- Sesgos conocidos: no disponible. Al no haber datos de entrenamiento, no se puede caracterizar sesgo alguno.
- Riesgo de alucinación: no aplica del todo al no ser un modelo generativo, pero la salida de clasificación de un modelo sin entrenar es arbitraria y no debe interpretarse como una predicción.
- Limitaciones de contexto e idioma: no disponible. No se declara longitud de contexto ni idiomas soportados.
- Restricciones de licencia: el repositorio es MIT, lo que permite uso comercial y modificación con atribución. Sin embargo, la model card recomienda revisar por separado los términos de los datos de origen si se entrena con datasets externos, ya que la licencia del código no cubre la de los datos.
- Caveat de producción: al ser una implementación personalizada, los cargadores genéricos requieren un adaptador explícito. No es un modelo enchufable en vLLM, Ollama o TGI.
- Cualquier resultado futuro debe documentarse por separado de los valores por defecto incluidos en el repositorio; mezclarlos induce a error sobre qué se ha entrenado realmente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jemillerpit/paper-classification
- Perfil del autor en HuggingFace: https://huggingface.co/Jemillerpit/models
- Kushtrim/bert-ai-paper-classifier-arxiv (alternativa comparable): https://huggingface.co/Kushtrim/bert-ai-paper-classifier-arxiv
- PaperNet, dataset y benchmark de clasificación fina de artículos: https://www.mdpi.com/2076-3417/12/9/4554
- Clasificación automatizada de metodología de investigación con XGBoost: https://www.sciencedirect.com/science/article/pii/S0952197625010395
- Comparativa de modelos para clasificación de artículos a partir de abstracts: https://link.springer.com/article/10.1007/s11192-024-05217-7
