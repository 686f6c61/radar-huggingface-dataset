# jankin123/gameplayer-ov2-8B-beta

## Resumen

Gameplayer-OV2-8B es un modelo multimodal de juego para entornos FPS (first-person shooter) desarrollado por el usuario jankin123. Se trata de un paquete que contiene dos modelos completos en BF16 basados en la arquitectura LLaVA-OneVision-2 de 8B parámetros: uno generalista para múltiples juegos FPS y otro específico para ViZDoom. El modelo procesa observaciones visuales RGB y genera secuencias de acciones estructuradas mediante un interfaz de "chunks" de acción, permitiendo controlar agentes en tiempo real dentro de simulaciones pausadas.

La relevancia actual radica en su enfoque práctico para el desarrollo de agentes autónomos en juegos, con una metodología de inferencia síncrona y basada en eventos que evita problemas de latencia. Aunque se encuentra en fase beta y sin métricas públicas de rendimiento, su diseño modular y la inclusión de scripts de inferencia listos para usar lo convierten en una propuesta interesante para investigadores y desarrolladores que trabajan en IA aplicada a videojuegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-OneVision-2 (vision-language transformer, 8B) |
| Parametros totales | 8 mil millones (aprox., basado en el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | BF16 (única precisión mencionada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaVA-OneVision-2, un modelo multimodal que combina un codificador visual (probablemente CLIP o similar) con un modelo de lenguaje de 8B parámetros. Según la model card, se distribuyen dos variantes: `general` (entrenada para múltiples entornos FPS con un único conjunto de pesos) y `specific` (enfocada en ViZDoom). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La innovación principal reside en el esquema de inferencia: el modelo genera "chunks" de acción (secuencias de hasta 640 tokens) mientras la simulación está pausada, y luego el entorno ejecuta esas acciones hasta que el chunk expira o un evento de percepción lo interrumpe. Esto permite un control determinista y evita problemas de reactividad.

## Capacidades

- Generación de acciones estructuradas para control de agentes en juegos FPS, mediante un formato de texto con etiquetas `<p>` y `<a>` que especifican modo, objetivo, horizonte temporal, teclas, desplazamiento del ratón y acciones de disparo.
- Procesamiento de observaciones visuales RGB en tiempo real (captura de frames causales).
- Soporte multi-juego en la variante `general`: un único modelo puede adaptarse a diferentes entornos FPS mediante un "manifiesto de capacidades" incluido en el prompt.
- Soporte específico para ViZDoom en la variante `specific`, con ejemplos cualitativos reproducibles.
- Inferencia síncrona y basada en eventos: el modelo genera decisiones solo cuando el entorno está pausado, garantizando que no se pierdan acciones durante la generación.
- Configuración determinista: muestreo con temperatura 0 y top-p 1, lo que produce resultados reproducibles.
- Validación de acciones mediante un "action guard" que verifica la sintaxis y las capacidades del entorno, con opción de reintento de formato.

## Casos de uso

- Desarrollo de agentes autónomos para juegos FPS: el modelo puede controlar un personaje en entornos como ViZDoom o Red Eclipse, tomando decisiones basadas en la observación visual y generando secuencias de acciones coherentes.
- Investigación en aprendizaje por refuerzo y toma de decisiones: al ser determinista y pausar la simulación durante la inferencia, permite experimentos reproducibles y análisis de políticas de control.
- Benchmarking de modelos multimodales en entornos interactivos: sirve como referencia para comparar la capacidad de un modelo de lenguaje visual para razonar sobre escenas dinámicas y emitir comandos de bajo nivel.
- Automatización de pruebas de juego: podría integrarse en pipelines de testing para validar mecánicas de juego o generar trayectorias de comportamiento.
- Estudio de interfaces de acción compactas: el formato de "action chunk" con etiquetas XML-like es un ejemplo de cómo estructurar salidas para control de agentes, útil para diseñar protocolos de comunicación entre modelos y entornos.
- Reproducción de demos cualitativas: los scripts incluidos permiten generar vídeos de demostración en escenarios concretos de ViZDoom, útiles para presentaciones o análisis de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o puntuaciones en entornos de juego. Tampoco se ofrecen comparativas con otros modelos de control de agentes.

## Requisitos de hardware

- El paquete contiene dos modelos BF16 de 8B parámetros, con un tamaño total de repositorio de 34.1 GB (aproximadamente 17 GB por modelo). Para inferencia en BF16 se necesita al menos 16-20 GB de VRAM, dependiendo de la longitud de la secuencia y el overhead de atención.
- GPU recomendadas: tarjetas con 24 GB o más de VRAM (por ejemplo, RTX 3090, RTX 4090, A100, H100). En GPUs con menos memoria podría ser necesario cuantizar a FP16 o INT8, aunque no se proporcionan versiones cuantizadas.
- No se indica soporte para GPU de consumo de gama baja; se requiere un runtime compatible con FlashAttention 2, Transformers y OpenCV.
- Opciones de despliegue: el modelo se ejecuta mediante scripts de shell que utilizan un entorno Python virtual específico (`$FORMAL/.venv-v31/bin/python`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; el flujo está diseñado para integración directa con entornos de juego.
- Latencia y throughput: no disponibles. El diseño de inferencia pausada sugiere que la latencia no es crítica, pero no se aportan datos numéricos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes FPS multimodales). La model card no menciona alternativas ni benchmarks frente a otros sistemas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está en fase beta (etiqueta "beta") y no se han publicado evaluaciones formales de robustez o seguridad.
- No se especifican sesgos conocidos ni riesgos de alucinación. Dado que es un modelo de lenguaje visual, podría generar acciones inválidas o incoherentes en entornos no vistos durante el entrenamiento.
- La inferencia requiere un runtime específico y la simulación debe estar pausada durante la generación; esto limita su uso en entornos en tiempo real con latencia estricta.
- La licencia no está disponible, por lo que el uso comercial o la redistribución pueden estar restringidos. Se recomienda contactar al autor antes de utilizarlo en producción.
- El idioma de los prompts y las salidas no está documentado; probablemente sea inglés, pero no se confirma.
- La variante `general` depende de un manifiesto de capacidades del entorno; si el entorno no proporciona esa información, el modelo puede fallar.
- No se incluyen pesos cuantizados ni versiones optimizadas para despliegue ligero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jankin123/gameplayer-ov2-8B-beta
- Perfil del autor en HuggingFace: https://huggingface.co/jankin123
- Perfil del autor en GitHub: https://github.com/jankin123
