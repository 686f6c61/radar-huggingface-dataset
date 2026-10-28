# negi4650/vla-slmnegi

## Resumen

vla-slmnegi es un modelo multimodal de tipo Vision-Language-Action (VLA) desarrollado por Manish Negi en ArchiGen AI Labs Pvt Ltd, diseñado para control robótico de baja latencia en plataformas edge. Combina un codificador visual SigLIP-base/16 congelado (768 dimensiones, parches de 14x14 que producen 196 tokens visuales) con un backbone decoder propio denominado `slmnegi`, de arquitectura tipo Llama, 512 dimensiones ocultas, 8 capas y 45,2 millones de parámetros. La conexión entre ambos se realiza mediante un proyector MLP de dos capas (768 → 512 → 512) con activación GELU.

El modelo aborda el problema de unificar percepción visual, comprensión de instrucciones en lenguaje natural y ejecución de acciones del efector final en una única secuencia autorregresiva, pero con un presupuesto de cómputo muy reducido: la model card declara un pico de unos 5,2 GB de VRAM en FP16 mixto, compatible con una NVIDIA T4. Es relevante para quien explore VLA de bajo coste en robótica, ya que la mayoría de alternativas abiertas en esta categoría se sitúan en el rango de 0,5 a 7 mil millones de parámetros.

La contribución técnica declarada por el autor es doble: la alineación del espacio visual de 768 dimensiones al espacio de embeddings de 512 del decoder, y una estrategia de enmascarado de etiquetas que antepone un tensor de valor -100 (`ignore_index`) sobre las 196 posiciones de tokens visuales en las secuencias objetivo, de modo que la entropía cruzada se calcula únicamente sobre instrucciones de texto y tokens de acción. El repositorio tiene 0,2 GB, no registra descargas ni valoraciones, y la model card no publica resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA multimodal: codificador visual SigLIP-base/16 (congelado) + proyector MLP de 2 capas con GELU (768 → 512 → 512) + decoder autorregresivo tipo Llama (`slmnegi`) |
| Parámetros totales | 45,2 M en el backbone decoder; total del sistema no disponible (el codificador SigLIP-base/16 se suma aparte y no se cuantifica en la model card) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card solo especifica 196 tokens visuales por imagen, rejilla 14x14) |
| Tipos de cuantización | no disponible; el autor indica entrenamiento e inferencia en FP16 de precisión mixta y el repo solo distribuye safetensors |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensión oculta del decoder | 512 |
| Capas del decoder | 8 |
| Cabezas de atención | 8 query / 2 KV (GQA) |
| Dimensión del codificador visual | 768 (SigLIP-base/16, congelado) |
| Tokens visuales por imagen | 196 (rejilla 14x14) |
| Precisión | FP16 mixta |
| VRAM pico declarada | ~5,2 GB (compatible con NVIDIA T4) |
| Pipeline de HuggingFace | image-text-to-text |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un VLA compacto con tres bloques. El primero es un codificador SigLIP-base/16 preentrenado y congelado que proyecta la imagen en 196 parches de 768 dimensiones. El segundo es un proyector MLP de dos capas (768 → 512 → 512) con activación GELU, que alinea los parches visuales con el espacio de embeddings del decoder. El tercero es `slmnegi`, un decoder autorregresivo de estilo Llama con 512 dimensiones ocultas, 8 capas y atención con 8 cabezas query frente a 2 cabezas clave-valor (agrupación GQA), lo que reduce el coste de caché KV en inferencia. La secuencia de entrada intercala los tokens visuales con los tokens de instrucción de texto y los tokens de acción del efector final, y la generación es autorregresiva sobre esa secuencia unificada.

En cuanto a los datos de entrenamiento, la model card no especifica número de tokens, composición del dataset, mezcla de tareas robóticas, ni si se aplicaron fases de RLHF o DPO. La innovación metodológica documentada es la estrategia de enmascarado de etiquetas: se antepone un tensor de -100 (`ignore_index`) sobre las 196 posiciones de tokens visuales en las secuencias objetivo, de forma que la pérdida de entropía cruzada se evalúa estrictamente sobre instrucciones de texto y tokens de acción, evitando desajustes de dimensión e inestabilidad de gradiente. El autor indica que el diseño está pensado para preentrenamiento multimodal de bajo coste e inferencia en tiempo real en plataformas robóticas edge.

## Capacidades

- Generación autorregresiva de secuencias que combinan instrucciones en lenguaje natural con tokens de acción para el efector final robótico.
- Comprensión de imagen a texto: el pipeline declarado en HuggingFace es `image-text-to-text`, con 196 tokens visuales por imagen procedentes de SigLIP-base/16.
- Control visomotor: la arquitectura está orientada explícitamente a visión-lenguaje-acción, es decir, a mapear observación visual e instrucción a comandos de robot.
- Procesamiento en FP16 mixto con un pico de VRAM de ~5,2 GB, lo que habilita inferencia en GPU de gama de entrada y en entornos edge.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; el backbone de 45,2 M no está presentado con capacidades de agentes).
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (modo thinking, visión de alta resolución, audio, vídeo): no disponible; no se documentan.
- Espacio de acciones, tokenizador de acciones, número de dimensiones del efector final y frecuencia de control: no disponible.

## Casos de uso

- Pick-and-place guiado por lenguaje en robótica de laboratorio: el modelo recibe una imagen de la escena (196 tokens visuales) y una instrucción en inglés del tipo "coge el bloque rojo", y genera la secuencia de tokens de acción; su tamaño de 45,2 M permite ejecutarlo en la misma GPU que el resto del pipeline de control sin competir por VRAM.
- Prototipado de VLA en hardware de gama de entrada: con ~5,2 GB de pico en FP16, se puede iterar sobre un portátil con GPU consumer o sobre una NVIDIA T4 en cloud, lo que abarata el ciclo de experimentación frente a VLA de 3-7 B de parámetros.
- Investigación en alineación viso-lenguaje: el par codificador congelado + proyector MLP entrenable es un banco de pruebas controlado para estudiar cuánta información visual retiene un decoder de 512 dimensiones y 8 capas, y cómo afecta el enmascarado de tokens visuales en la función de pérdida.
- Despliegue en robots móviles de bajo consumo: la ventana de 5,2 GB y el uso de FP16 encajan en plataformas con T4 o GPUs integradas, donde un modelo de 7 B no cabría junto al resto de nodos de percepción y planificación.
- Base para destilación o currículums de entrenamiento: al ser un decoder pequeño con licencia Apache 2.0, sirve como alumno en destilación desde VLA mayores o como punto de partida para ajuste fino en dominios robóticos concretos.
- Evaluación comparativa de latencia: útil como línea base de "mínimo coste computacional" al medir latencia de extremo a extremo en lazos de control visual, aunque la model card no publique cifras de throughput ni de frecuencia de control.
- Docencia y demostraciones: el repositorio de 0,2 GB y la licencia permisiva facilitan su uso en cursos de robótica o de modelos multimodales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de `negi4650/vla-slmnegi` no incluye métricas de evaluación en tareas de manipulación (tasa de éxito, SIMPLER, LIBERO, CALVIN), ni resultados de MMLU, HumanEval, GSM8K o similares, ni mediciones de latencia o throughput. El único dato de rendimiento declarado es el pico de VRAM de aproximadamente 5,2 GB en FP16 mixto sobre NVIDIA T4.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,2 GB en FP16 mixto según la model card (pico declarado, no desglosado entre codificador visual, proyector y decoder).
- GPU recomendadas por el autor: NVIDIA T4 (explícitamente declarada compatible).
- GPU consumer: el peso del repositorio es de 0,2 GB, por lo que los pesos del decoder caben holgadamente en cualquier GPU consumer; el requisito real lo marca el codificador SigLIP-base/16 y el pico de 5,2 GB, asumible en tarjetas de 8 GB o más (por ejemplo, RTX 3060 Ti, 4060 Ti, 4070). No hay confirmación del autor para modelos concretos más allá de la T4.
- Opciones de despliegue: no documentadas. Al emplear un backbone decoder propio (`slmnegi`, 512 dimensiones, 8 capas, GQA 8/2) con un proyector MLP específico, no se puede asumir compatibilidad directa con vLLM, TGI, llama.cpp, Ollama o transformers sin código de inferencia a medida; la model card no menciona ninguno de estos runtimes.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, frecuencia de control del robot ni latencia de extremo a extremo.
- Cuantizaciones GGUF/AWQ/GPTQ: no disponibles; solo se distribuyen pesos en safetensors.
- Requisitos de entrenamiento (número de GPU, horas, tokens): no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas provienen de información pública general y no han sido verificados contra las model cards originales en esta ficha; conviene contrastarlos antes de citarlos.

| Modelo | Parámetros | Contexto | Codificador visual | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| vla-slmnegi | 45,2 M (decoder) | no disponible | SigLIP-base/16 (congelado) | Apache 2.0 | HuggingFace (`negi4650/vla-slmnegi`), 0 descargas | No publicado |
| SmolVLA | ~450 M | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (por verificar) | HuggingFace / LeRobot | Métricas en tareas de manipulación publicadas por sus autores (no verificadas aquí) |
| OpenVLA | ~7 B | no disponible en esta ficha | DINOv2 + SigLIP | MIT (por verificar) | HuggingFace, pesos abiertos | Métricas en tareas de manipulación publicadas (no verificadas aquí) |
| pi0 (openpi) | ~3 B | no disponible en esta ficha | PaliGemma | Apache 2.0 (por verificar) | HuggingFace / openpi | Métricas publicadas por sus autores (no verificadas aquí) |

La diferencia principal frente a estas alternativas es de escala: vla-slmnegi se sitúa uno o dos órdenes de magnitud por debajo en número de parámetros, lo que reduce el coste de inferencia pero también la capacidad de razonamiento lingüístico y de generalización. Ninguna de las alternativas citadas declara un pico de VRAM tan bajo como los ~5,2 GB de este modelo, aunque tampoco hay una comparación de rendimiento publicada que permita cuantificar el coste en tasa de éxito.

## Limitaciones y advertencias

- Sin evidencia empírica: la model card no publica ningún benchmark, tasa de éxito en manipulación, ablación ni comparación con líneas base. No hay datos que respalden el rendimiento funcional del modelo en tareas robóticas.
- Validación comunitaria nula: 0 descargas y 0 valoraciones en HuggingFace desde su publicación; no hay informes de terceros que reproduzcan resultados.
- Capacidad lingüística muy limitada: un decoder de 45,2 M de parámetros y 512 dimensiones ocultas difícilmente sostendrá razonamiento complejo, instrucciones largas o diálogo multi-turno; el modelo está pensado para mapear instrucciones cortas a acciones.
- Idiomas: solo inglés según el campo `language: en`; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: se desconoce cuántos tokens de texto puede aceptar además de los 196 tokens visuales, lo que impide planificar tareas que requieran historial largo o instrucciones extensas.
- Especificación de acciones ausente: no se documenta el tokenizador de acciones, la dimensionalidad del efector final, el rango de valores ni la frecuencia de control, por lo que la integración con un robot real requiere trabajo de ingeniería no descrito.
- Riesgo de alucinación: al ser un modelo autorregresivo de lenguaje, puede generar secuencias de acción plausibles pero incorrectas sin señal de incertidumbre; en robótica esto implica riesgo físico y exige capas de validación y parada de seguridad.
- Sesgos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos visuales, culturales o de dominio (iluminación, tipos de objetos, entornos).
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías; conviene revisar si el codificador SigLIP-base/16 congelado arrastra condiciones adicionales, algo que la model card no aclara.
- Trazabilidad de la investigación: la model card referencia un paper (`vla_slmnegi_paper.pdf`) alojado en el propio repositorio y una cita con año 2026; no se indica publicación en un venue revisado por pares.
- Fecha de creación del repositorio (2026-10-28) y ausencia de histórico de versiones: no hay información sobre iteraciones o correcciones del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/negi4650/vla-slmnegi
- Paper referenciado en la model card: `vla_slmnegi_paper.pdf`, alojado en el propio repositorio (https://huggingface.co/negi4650/vla-slmnegi/blob/main/vla_slmnegi_paper.pdf)
- Repositorio, demos o blog del autor: no disponible en la información proporcionada
- Página de la organización (ArchiGen AI Labs Pvt Ltd): no disponible en la información proporcionada
- Contacto declarado por el autor: manishnegi2032@gmail.com, manish@archgen.in, manish@vyvsai.com
