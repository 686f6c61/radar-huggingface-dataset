# canau1991/contrastive

## Resumen

`canau1991/contrastive` es un repositorio experimental publicado en HuggingFace por el usuario canau1991 (Antoni Mazur) que contiene una implementación compacta y personalizada en PyTorch de la arquitectura EfficientFormer orientada a aprendizaje contrastivo. No se trata de un modelo preentrenado ni de un release listo para producción: el propio autor lo describe como un punto de partida para revisión de código, pruebas de humo (smoke tests) y experimentos pequeños y controlados. El checkpoint `model.safetensors` incluido es una inicialización válida, pero no ha sido entrenado ni evaluado.

La escala del artefacto es mínima: 49.600 parámetros totales (cuarenta y nueve mil seiscientos), lo que lo sitúa muy lejos de un EfficientFormer estándar, cuyas variantes de referencia manejan millones de parámetros. Esto confirma que se trata de una reimplementación didáctica o de andamiaje, no de una réplica a escala del modelo original. El repositorio se distribuye bajo licencia MIT y no declara puntuaciones de benchmark.

Su relevancia actual es, por tanto, acotada y de naturaleza distinta a la de un modelo desplegable: sirve como plantilla reproducible para montar un pipeline contrastivo con fusión co-attention, como banco de pruebas para validar la carga de pesos en formato safetensors dentro de un CI, y como material de referencia para quien quiera estudiar cómo se estructura un EfficientFormer mínimo en PyTorch. El tamaño del repositorio es de 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientFormer (implementación personalizada, escala "base") |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica un checkpoint de inicialización en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Mecanismo de atención | Standard |
| Fusión | Co-attention |
| Activación | GELU + tanh |
| Normalización | ScaleNorm |
| Optimizador del recetario | LAMB con linear warmup |
| Fecha de creación | 2026-09-25 |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura declarada es EfficientFormer en configuración "base", con atención estándar, fusión mediante co-attention, función de activación GELU combinada con tanh y normalización ScaleNorm. La co-attention como mecanismo de fusión apunta a un diseño de dos ramas que intercambian información entre modalidades o entre vistas, coherente con un objetivo de aprendizaje contrastivo, donde lo habitual es alinear representaciones de pares positivos y separar las de pares negativos. La combinación GELU + tanh y ScaleNorm son elecciones de diseño típicas de implementaciones compactas que buscan estabilidad con presupuestos de cómputo muy reducidos.

En cuanto al entrenamiento, el repositorio incluye `training_args.json` con un recetario por defecto basado en el optimizador LAMB con esquema de linear warmup. El autor especifica con claridad que estos son valores de arranque del script y no evidencia de una ejecución completada. No se declara número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal más allá de las elecciones arquitectónicas ya citadas.

## Capacidades

- No se documenta ninguna capacidad funcional verificada. El repositorio no incluye un modelo entrenado, sino un checkpoint de inicialización.
- El artefacto principal es `pipeline.py`, que contiene tanto la definición del modelo como un ejemplo ejecutable o punto de entrada de entrenamiento, accesible mediante `python pipeline.py --help`.
- La configuración arquitectónica está registrada en `config.json` y el recetario de experimento en `training_args.json`, lo que permite reproducir la estructura sin necesidad de ingeniería inversa.
- El diseño soporta conceptualmente un objetivo de aprendizaje contrastivo con fusión co-attention, pero no hay pesos entrenados que materialicen esa capacidad.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, agentes ni modo "thinking".
- No se declaran capacidades multilingües, de visión, audio ni generación de texto.
- La carga mediante APIs genéricas de HuggingFace (`AutoModel`, `AutoModelForCausalLM`, etc.) requiere un adaptador explícito, ya que se trata de una implementación personalizada fuera de las clases estándar de `transformers`.

## Casos de uso

- Revisión de código y auditoría de arquitectura: el tamaño de 49.600 parámetros y la existencia de un único fichero `pipeline.py` permiten leer y auditar la implementación completa de un EfficientFormer con co-attention en una sola sesión, algo inviable con implementaciones de millones de parámetros.
- Prueba de humo en pipelines de CI/CD: al ser un checkpoint válido de inicialización en safetensors, se puede integrar en un test automatizado que verifique que las dependencias, el cargador de pesos y el grafo del modelo funcionan antes de escalar a un experimento real.
- Plantilla para experimentos controlados de aprendizaje contrastivo: `training_args.json` ofrece un recetario base con LAMB y linear warmup sobre el que construir comparativas entre funciones de pérdida contrastivas manteniendo constante la arquitectura.
- Material docente: sirve para explicar en un curso o taller cómo se compone un bloque EfficientFormer, qué papel juega la fusión co-attention y cómo se aplica ScaleNorm, sin la sobrecarga computacional de un modelo a escala real.
- Banco de pruebas de infraestructura de entrenamiento: al ser tan ligero (menos de 0,2 MB en fp32), permite validar orquestación, logging, guardado de checkpoints y reanudación de runs en un clúster sin consumir GPU.
- Base para pruebas de ablación sobre el mecanismo de fusión: se puede sustituir la co-attention por atención cruzada estándar o por suma simple y comparar el comportamiento en conjuntos reducidos, usando el mismo esqueleto de código.
- Punto de partida para escalar la arquitectura: el `config.json` documenta los ajustes generados, de modo que aumentar profundidad, anchura o número de cabezas es una modificación directa sobre una base ya funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado. Como orientación de evaluación, la model card sugiere usar un conjunto de validación específico de la tarea, reportar la métrica a lo largo de al menos tres semillas e incluir una línea base con capacidad equivalente.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,2 MB en fp32 (49.600 parámetros × 4 bytes). Es un orden de magnitud orientativo; no se publican mediciones reales de consumo.
- VRAM para entrenamiento: los optimizadores con estado, como LAMB, multiplican el coste por un factor cercano a 3-4 (pesos, momento de primer orden y segundo orden), lo que seguiría dejando el consumo total por debajo de 1 MB en fp32.
- GPU recomendadas: ninguna en particular; cualquier GPU, incluida una integrada, es sobrada. El modelo es funcional en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, desde una GTX 1050 hasta una RTX 4090, y también en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo, ejecutando `pipeline.py`. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia, y no se publican pesos en GGUF. El autor advierte que las APIs automáticas genéricas requieren un adaptador explícito.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoría, porque este repositorio no es un modelo entrenado sino una implementación de referencia con un checkpoint de inicialización de 49.600 parámetros. A modo de contexto, la variante de referencia EfficientFormer-L1 del paper original maneja aproximadamente 12,3 millones de parámetros, tres órdenes de magnitud por encima, y frameworks contrastivos como `nomic-ai/contrastors` proporcionan utilidades de entrenamiento pero no un modelo concreto con el que comparar parámetros, contexto o licencia en igualdad de condiciones.

| Aspecto | canau1991/contrastive | EfficientFormer-L1 (referencia) | nomic-ai/contrastors |
|---|---|---|---|
| Tipo | Implementación + inicialización | Modelo de visión preentrenado | Framework de entrenamiento contrastivo |
| Parámetros | 49.600 | ~12,3 millones | No aplica |
| Contexto | No disponible | No aplica (visión) | No aplica |
| Entrenado | No | Sí | No aplica |
| Licencia | MIT | Apache 2.0 (según variante) | Apache 2.0 |
| Benchmarks | No declarados | ImageNet top-1 | No aplica |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier uso que espere comportamiento predictivo producirá salidas sin significado.
- El autor indica que el modelo no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ninguna evaluación al respecto; la ausencia de datos no equivale a ausencia de sesgo.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no es un modelo generativo de lenguaje entrenado. El riesgo real es interpretar como válidos los resultados de un modelo sin entrenar.
- No se declaran idiomas soportados ni ventana de contexto, por lo que no se puede garantizar funcionamiento multilingüe ni con secuencias largas.
- La licencia MIT permite uso comercial del código y de los pesos, pero el autor recomienda revisar por separado los términos de los datos de origen si se emplea el repositorio con conjuntos de datos externos.
- Para producción no es utilizable tal cual: requiere entrenamiento, evaluación con al menos tres semillas, una línea base de capacidad equivalente y documentación separada de los resultados.
- La carga con APIs automáticas de HuggingFace falla sin un adaptador explícito, lo que añade fricción de integración en pipelines existentes.
- La fecha de creación registrada (2026-09-25) es posterior a la fecha habitual de referencia de este tipo de publicaciones; conviene verificar la coherencia temporal de los metadatos antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canau1991/contrastive
- Perfil del autor en HuggingFace: https://huggingface.co/canau1991/models
- Repositorio de entrenamiento contrastivo en PyTorch (referencia de ecosistema): https://github.com/nomic-ai/contrastors
- Leaderboard de comparación de modelos de Artificial Analysis: https://artificialanalysis.ai/leaderboards/models
- Benchmarks y leaderboard de modelos de IA: https://aimodelsbenchmark.com/
