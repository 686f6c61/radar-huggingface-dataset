# SelectiveDOPD/JustRL-Qwen3-1p7b-FKLSelective-Top10pct

## Resumen

JustRL-Qwen3-1p7b-FKLSelective-Top10pct es un ajuste fino de investigación sobre Qwen3-1.7B publicado por el usuario SelectiveDOPD. El repositorio contiene 2.031.739.904 parámetros almacenados en safetensors (aproximadamente 2,03 mil millones), lo que confirma que se trata de un modelo denso de la familia Qwen3, no de una arquitectura MoE. El pipeline declarado es text-generation con etiquetas de conversational, transformers, text-generation-inference y endpoints_compatible.

Según la model card, el modelo se subió desde el experimento `justrl_qwen3_1p7b_fowardkl_ladder_90_100_kl`, dentro de los experimentos denominados BiDirect-OPD. La rama `main` corresponde al checkpoint `global_step_300`, y el repositorio conserva catorce ramas adicionales con checkpoints intermedios (de `global_step_20` a `global_step_280`, en intervalos de 20 pasos). La nomenclatura del identificador sugiere un entrenamiento por refuerzo con regularización de divergencia KL forward aplicada de forma selectiva (Top 10 por ciento de tokens) y un esquema de programación tipo ladder entre 90 y 100.

Se trata, por tanto, de un artefacto de investigación orientado a reproducir y analizar curvas de entrenamiento con destilación on-policy bidireccional sobre un modelo pequeño. En el momento de redactar esta ficha no se declara licencia ni idiomas soportados, no se publican resultados de benchmarks y el repositorio acumula cero descargas y cero valoraciones, por lo que no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (confirmado por la etiqueta `qwen3`); número de capas, cabezas y dimensión oculta no disponibles |
| Parámetros totales | 2.031.739.904 (2,03 mil millones) según safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors y no declara variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline declarado | text-generation |
| Etiquetas relevantes | conversational, text-generation-inference, endpoints_compatible |
| Checkpoints publicados | 15 ramas: `global_step_20`, `40`, `60`, `80`, `100`, `120`, `140`, `160`, `180`, `200`, `220`, `240`, `260`, `280` y `300` (rama `main`) |
| Tamaño del repositorio | 52,8 GB (incluye todas las ramas de checkpoints, no un único conjunto de pesos) |
| Fecha de publicación (metadatos) | 2026-09-11 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso de la familia Qwen3, heredada del modelo base Qwen3-1.7B. El recuento de parámetros obtenido del archivo safetensors (2.031.739.904) es consistente con el tamaño total de dicho modelo base, que incluye la matriz de embeddings. La model card no documenta el número de capas, la configuración de atención (GQA/MHA), la dimensión oculta, la estrategia de atención ni la ventana de contexto efectiva.

En cuanto al entrenamiento, la única información disponible es la ruta interna del experimento (`justrl_qwen3_1p7b_fowardkl_ladder_90_100_kl`) y el nombre del modelo. De ellos se deduce, sin confirmación documental, que se aplicó un proceso de ajuste por refuerzo (prefijo `JustRL`) con regularización de divergencia KL forward selectiva sobre el 10 por ciento superior de tokens (`FKLSelective-Top10pct`), y una programación progresiva tipo ladder en el rango 90-100. El marco BiDirect-OPD apunta a destilación on-policy bidireccional. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones de decodificación como decodificación especulativa o atención lineal. La existencia de quince checkpoints cada veinte pasos (hasta el paso 300) sugiere un entrenamiento relativamente corto y pensado para análisis de trayectoria.

## Capacidades

- Generación de texto: capacidad declarada mediante el pipeline `text-generation` en `transformers`.
- Conversación: la etiqueta `conversational` indica que el modelo está pensado para diálogo, aunque no se documenta la plantilla de chat asociada.
- Integración en infraestructura de inferencia: las etiquetas `text-generation-inference` y `endpoints_compatible` indican compatibilidad prevista con Text Generation Inference y con endpoints desplegables.
- Razonamiento, matemáticas y código: no documentado; no se publican evaluaciones al respecto.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Aunque el modelo base Qwen3 incorpora modos híbridos de razonamiento, no hay confirmación de que se hayan preservado tras este ajuste.
- Trazabilidad de entrenamiento: el repositorio permite acceder a instantáneas intermedias del proceso de ajuste, lo que facilita el análisis de la evolución del modelo.

## Casos de uso

- Reproducción de experimentos de aprendizaje por refuerzo: las quince ramas de checkpoints permiten reconstruir la curva de entrenamiento paso a paso y analizar la evolución de métricas propias (pérdida, KL, recompensa) sin reentrenar desde cero.
- Estudio de regularización KL selectiva: comparar la variante Top 10 por ciento frente a otras variantes del mismo grupo de experimentos para medir el efecto de aplicar la penalización solo a una fracción de tokens.
- Investigación sobre destilación on-policy (BiDirect-OPD): utilizar los checkpoints como referencia para validar metodologías de destilación bidireccional en modelos de ~2B parámetros.
- Prototipado de generación de texto en local: con aproximadamente 4,1 GB en precisión de 16 bits, el modelo cabe en GPU de consumo como una RTX 3060 de 12 GB, lo que permite experimentar sin infraestructura de centro de datos.
- Base para ajuste posterior: al ser un checkpoint de RL sobre Qwen3-1.7B, puede servir como punto de partida para SFT o DPO adicionales en dominios específicos, siempre que la licencia lo permita (actualmente no declarada).
- Pruebas de pipelines de inferencia: validar configuraciones de vLLM, TGI o llama.cpp con un modelo pequeño y de pesos safetensors estándar antes de escalar a modelos mayores.
- Evaluación de cuantización: convertir los pesos a GGUF o formatos de 4 y 8 bits y medir la degradación de calidad en tareas controladas.
- Docencia y experimentación académica: el tamaño reducido y la disponibilidad de múltiples checkpoints lo hacen adecuado para prácticas sobre dinámica de entrenamiento y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

Los cálculos siguientes se derivan del recuento de parámetros (2.031.739.904) y son estimaciones propias, no datos publicados por el autor:

- Precisión completa FP32: aproximadamente 8,1 GB solo para pesos.
- Precisión de 16 bits (FP16/BF16): aproximadamente 4,1 GB para pesos; con caché KV y activaciones, se recomienda reservar entre 5 y 6 GB de VRAM.
- Cuantización de 8 bits: aproximadamente 2,0 GB para pesos; en torno a 3,0-3,5 GB con overhead.
- Cuantización de 4 bits: aproximadamente 1,1-1,3 GB para pesos; en torno a 2,0 GB con overhead en contextos moderados.
- Cabe en GPU de consumo: sí, con holgura, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16, y en tarjetas de 8 GB si se aplica cuantización de 4 u 8 bits.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S y similares admiten el modelo con un uso de VRAM mínimo y permiten lotes grandes.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y Text Generation Inference para servicio con batching continuo; llama.cpp y Ollama tras convertir los pesos safetensors a GGUF, ya que el repositorio no incluye archivos GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Advertencia de descarga: el repositorio ocupa 52,8 GB debido a las quince ramas de checkpoints. Para desplegar solo el paso 300 conviene descargar únicamente la revisión `main`.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de su documentación pública habitual y no de la información proporcionada en esta búsqueda, por lo que deben verificarse en la fuente original antes de citarlos. Para el modelo objeto de la ficha, los campos no declarados se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JustRL-Qwen3-1p7b-FKLSelective-Top10pct | 2,03 mil millones | no disponible | no disponible | 15 checkpoints en safetensors; 0 descargas |
| Qwen3-1.7B (base) | 2,03 mil millones | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Ampliamente distribuido |
| Llama 3.2 1B | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | Ampliamente distribuido |
| Gemma 2 2B | 2,61 mil millones | 8.192 tokens | Gemma Terms of Use | Ampliamente distribuido |
| SmolLM2 1.7B | 1,71 mil millones | 8.192 tokens | Apache 2.0 | Ampliamente distribuido |

Comparativa de rendimiento: no disponible para el modelo analizado, ya que no se han publicado evaluaciones. Cualquier comparación cuantitativa con las alternativas de la tabla carecería de base documental.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse un uso comercial permitido. Sin licencia explícita, el uso en producción conlleva un riesgo legal que debe resolverse contactando con el autor o evitando el modelo.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación de sesgos, ni pruebas de seguridad publicadas.
- Idiomas no declarados: se desconoce qué lenguas cubre y con qué calidad; el rendimiento fuera del inglés podría degradarse de forma severa.
- Riesgo de alucinación: por tamaño (2,03 mil millones de parámetros), la capacidad factual es limitada y la propensión a inventar datos en tareas de conocimiento abierto es alta.
- Origen como checkpoint de RL: al no documentarse una fase de alineamiento orientada a seguridad, es probable que el modelo no incorpore filtros de contenido ni directrices de comportamiento, algo relevante si se expone a usuarios finales.
- Sobrecoste de especialización: el ajuste con una penalización KL selectiva sobre el 10 por ciento de tokens puede haber desplazado la distribución del modelo hacia el dominio del experimento, degradando el rendimiento general respecto al modelo base.
- Longitud de contexto desconocida: no puede planificarse su uso en tareas que requieran ventanas largas sin verificarlo empíricamente.
- Plantilla de chat no documentada: aunque la etiqueta `conversational` está presente, no se especifica el formato de prompt, lo que puede producir respuestas degradadas si no se replica la plantilla original.
- Sin validación comunitaria: cero descargas y cero valoraciones implican que no existen informes independientes de reproducibilidad, estabilidad ni calidad.
- Gestión del repositorio: la descarga completa ocupa 52,8 GB por la acumulación de ramas; conviene fijar la revisión concreta para evitar consumir almacenamiento y tiempo innecesarios.
- Trazabilidad del experimento: el prefijo interno `justrl_qwen3_1p7b_fowardkl_ladder_90_100_kl` no corresponde a ningún repositorio público identificado, lo que dificulta reproducir el pipeline de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-FKLSelective-Top10pct
- Papers, blogs, repositorios de código y demos: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, el autor SelectiveDOPD ni los experimentos BiDirect-OPD.
- Información sobre el modelo base Qwen3-1.7B: no disponible en los resultados de búsqueda proporcionados.
