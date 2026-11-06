# redmingwei/HeteroMoEProjSpace-v703

## Resumen

HeteroMoEProjSpace-v703 es un modelo de investigación multimodal de tipo vision-language construido sobre una arquitectura heterogénea de mezcla de expertos (MoE) que opera en un espacio de proyección compartido. Lo desarrolla el usuario redmingwei y se publica bajo licencia Apache 2.0. El modelo no es un generador de texto generalista, sino un clasificador binario especializado: recibe una imagen y una aserción textual sobre la relación espacial entre dos objetos, y predice si esa aserción es verdadera o falsa. Es el checkpoint v70.3 de una familia con al menos 22 variantes documentadas.

La relevancia del modelo es metodológica más que de producto: combina tres backbones congelados de naturaleza distinta (Qwen3.5-2B para lenguaje, ModernBERT-base para codificación textual y SigLIP2-so400m para visión), proyecta sus estados ocultos a un espacio canónico de 256 dimensiones y los fusiona mediante cuatro proposers heterogéneos (atención, SSM con `d_state=4`, convolución y SwiGLU) coordinados por un router disperso con regularización load-balancing y Z-Loss. Añade además un bypass de fusión cross-modal con atención sobre anclas y puerta bilineal.

Con 2.479.724.688 parámetros totales almacenados en fp32 (9,9 GB), el modelo reporta una exactitud held-out de 0,5831 sobre el dataset VSR (Visual Spatial Reasoning), frente a una línea base aleatoria de 0,5. El repositorio es autocontenido: incluye los pesos de los tres backbones, los tokenizadores y el procesador de imagen, de modo que la inferencia no requiere descargar artefactos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogénea: tres backbones transformer congelados + espacio de proyección de cuatro ranuras + MoA de cuatro ramas (atención, SSM, convolución, SwiGLU) con router disperso + bypass de fusión vision-language |
| Parametros totales | 2.479.724.688 (2.479,72 M) |
| Parametros activos | no disponible (el router es disperso, pero el autor no publica el conteo de parámetros activos) |
| Longitud de contexto | 128 tokens de texto (longitud fija de secuencia en las tres ramas); la rama visual procesa 197 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en fp32; el autor sugiere conversión manual a media precisión) |
| Idiomas soportados | no disponible (los tokenizadores Qwen y BERT son multilingües, pero el modelo no se ha evaluado fuera de aserciones VSR en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 9,9 GB), con código personalizado en `modeling_v703.py` |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres etapas. En la primera, tres backbones congelados extraen estados ocultos de última capa: Qwen3.5-2B produce `[B, 128, 2048]`, ModernBERT-base produce `[B, 128, 768]` y SigLIP2-so400m produce `[B, 197, 1152]`. En la segunda, una proyección ortogonal congelada `P_m` reduce cada modalidad a 256 dimensiones y una proyección de cuatro ranuras Q/K/V/O genera una representación canónica de 1024 dimensiones por token (`[B, 128, 1024]`). En la tercera, dos rutas paralelas procesan esa representación: una rama MoA con cuatro proposers heterogéneos (atención, SSM con estado 4, convolución y SwiGLU) coordinada por un router disperso con pérdidas de load-balancing y Z-Loss, y un bypass de fusión cross-modal que combina el flujo textual (media de Qwen y BERT) con el flujo visual mediante atención sobre anclas y una puerta bilineal. La salida de ambas rutas se suma como residual y alimenta una cabeza de clasificación lineal de 1024 a 2.

El entrenamiento se realizó sobre VSR (Visual Spatial Reasoning) como tarea de clasificación binaria (verdadero/falso) con aserciones del tipo «The cake is next to the person.». El autor indica que el entrenamiento partió de estados ocultos preextraídos, no del paso directo por los backbones, y que el repositorio reempaqueta esa ruta de extracción con posibles diferencias menores en detalles de preprocesado (por ejemplo, la posición de pooling de la secuencia ViT). No se documentan el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; al tratarse de una tarea de clasificación supervisada, es improbable que se hayan usado técnicas de alineación por preferencias.

La innovación técnica destacable es el diseño de fusión: la comparación interna del autor entre la rama MoA sin bypass visual (0,5387) y la versión completa con bypass (0,5831) cuantifica una ganancia de 4,4 puntos atribuible a la información visual, lo que confirma que la tarea exige mirar la imagen y que el bypass no es redundante. La incompatibilidad declarada de `modal_dims` (`[2048, 768, 1152]` frente a `[896, 256, 768]` en v2) impide reutilizar pesos entre generaciones.

## Capacidades

- Clasificación binaria de aserciones de relación espacial entre dos objetos a partir de una imagen y un texto.
- Extracción de representaciones fusionadas multimodal de 1024 dimensiones por token (`out.y`, forma `[B, 128, 1024]`).
- Exposición de las puertas de las cuatro ranuras Q/K/V/O (`out.slot_alpha`, forma `[B, 128, 4]`) para inspeccionar la contribución relativa de cada componente.
- Procesamiento de texto con dos tokenizadores independientes (Qwen y BERT) y de imagen con el procesador de SigLIP2, todos empaquetados en el repositorio.
- Reproducibilidad determinista verificable mediante `example_io.pt`, que incluye logits y media de `y` esperados.
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; la cabeza de salida es un clasificador de dos clases.
- No dispone de capacidades de audio ni de visión general más allá de la codificación SigLIP2 para la tarea VSR.

## Casos de uso

- Evaluación de modelos de razonamiento espacial: el modelo sirve como referencia cuantitativa (0,5831 en VSR) para comparar estrategias de fusión multimodal en investigación académica, gracias a la reproducibilidad del `example_io.pt`.
- Estudio de arquitecturas MoE heterogéneas: los cuatro proposers con naturalezas distintas (atención, SSM, convolución, SwiGLU) permiten analizar qué familia de operadores aporta más en tareas viso-espaciales, usando `slot_alpha` como señal de diagnóstico.
- Análisis de la contribución de la visión en tareas aparentemente textuales: la comparación interna sin bypass visual (0,5387) y con bypass (0,5831) ofrece un caso controlado para medir cuánto aporta realmente la información visual frente a atajos lingüísticos.
- Prototipado de sistemas de verificación de descripciones de imágenes: en pipelines de accesibilidad o anotación automática, el modelo puede filtrar captions cuya relación espacial no se corresponde con la imagen, aunque con precisión limitada (58 %).
- Base para experimentos de transferencia entre modalidades: la proyección ortogonal congelada a 256 dimensiones y el espacio canónico de 1024 permiten probar si representaciones de backbones distintos son intercambiables sin reentrenar el resto del sistema.
- Docencia y divulgación sobre fusión multimodal: el repositorio autocontenido (pesos, tokenizadores, procesador y ejemplo de E/S) simplifica la reproducción en cursos y talleres sin depender de descargas externas.

## Benchmarks y rendimiento

Los únicos resultados publicados por el autor son sobre VSR held-out, sin comparaciones con modelos de terceros.

| Configuracion | VSR held-out |
|---|---|
| Linea base aleatoria | 0,5000 |
| MoA sin bypass VL | 0,5387 |
| MoA + fusion VL (este repositorio) | 0,5831 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 10 GB solo para pesos, más activaciones y memorias intermedias de los tres backbones; en la práctica se recomienda al menos 16-24 GB para inferencia por lotes pequeños.
- En media precisión (conversión manual sugerida por el autor) los pesos bajarían a unos 5 GB, permitiendo ejecución en GPUs de consumo con 8-12 GB, aunque no se han publicado mediciones.
- GPU recomendadas: no disponible. Por tamaño, cabría en una RTX 4090 (24 GB) en fp32 y en una RTX 3090 o 4080 en fp16; para despliegue en clúster, A100 o H100 son holgadas pero no se documentan cifras.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 12 GB o más tras conversión a media precisión; sin datos verificados por el autor.
- Opciones de despliegue: al requerir `trust_remote_code` y código personalizado en `modeling_v703.py`, la integración con vLLM, TGI u Ollama no está garantizada ni documentada. La vía soportada es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La tarea (clasificación binaria de relaciones espaciales sobre VSR) y la arquitectura (fusión de tres backbones congelados con MoA heterogéneo) son específicas de esta familia, y el autor no publica comparaciones con alternativas como LLaVA, Qwen-VL, InternVL u otros modelos vision-language de propósito general. Cualquier comparación numérica con esos modelos requeriría reentrenarlos o adaptarlos a VSR, lo que no se ha hecho en la información disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeteroMoEProjSpace-v703 | 2.479,72 M | 128 tokens de texto / 197 de visión | Clasificación VSR | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en VSR con dos clases; no es un modelo vision-language de propósito general y no debe usarse para generación, diálogo o descripción de imágenes.
- La exactitud de 0,5831 sobre una línea base de 0,5 implica un margen de apenas 8,3 puntos porcentuales; el rendimiento es insuficiente para aplicaciones de producción que exijan fiabilidad.
- La secuencia textual está fijada a 128 tokens con padding y truncación; aserciones más largas se truncarán y el comportamiento fuera de esa distribución no está caracterizado.
- Los backbones están congelados y el entrenamiento partió de estados ocultos preextraídos; el autor advierte posibles discrepancias menores de preprocesado entre el repositorio y el script original (posición de pooling de la secuencia ViT), lo que puede afectar la reproducibilidad exacta.
- El repositorio requiere `trust_remote_code=True` y ejecuta código Python personalizado (`modeling_v703.py`); conviene auditar dicho archivo antes de desplegarlo en entornos sensibles.
- El almacenamiento en fp32 (9,9 GB) complica el despliegue en hardware modesto; la conversión a media precisión es responsabilidad del usuario y no está validada por el autor.
- La incompatibilidad de `modal_dims` con la generación v2 impide reutilizar pesos o configuraciones entre versiones.
- No se documentan sesgos, comportamiento multilingüe ni robustez fuera del dominio VSR; la licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del checkpoint desaconseja hacerlo sin validación propia.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que refleja una validación comunitaria nula.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v703
- Índice de versiones de la familia (VERSIONS.md): https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2/blob/main/VERSIONS.md
- Repositorio de la generación anterior: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2
- Dataset VSR (Visual Spatial Reasoning): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
- Demo o espacio interactivo: no disponible
