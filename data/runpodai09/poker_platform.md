# runpodai09/poker_platform

## Resumen

El repositorio `runpodai09/poker_platform` no contiene un modelo de lenguaje propiamente dicho, sino una plataforma de entrenamiento y servicio para agentes de póker basada en el modelo base Qwen 3.5-4B. Desarrollado por el usuario runpodai09, el proyecto adopta un enfoque "contract-first" que unifica contratos de observación, acción, prompt y artefactos a lo largo de cuatro fases: preparación de datos OCR (fase 0), ajuste fino supervisado (fase 1), auto-juego con aprendizaje por refuerzo (fase 2) y despliegue en producción. La relevancia actual radica en la creciente aplicación de IA a juegos de información imperfecta, donde el póker presenta retos únicos de razonamiento estratégico y gestión de incertidumbre.

El repositorio incluye 62 módulos de biblioteca, 238 pruebas, scripts de entrada para cada fase y configuraciones bloqueadas. No se proporcionan pesos del modelo, solo el código fuente, contratos y configuraciones. El tamaño del repositorio es de 0,2 GB, lo que sugiere que no incluye checkpoints de entrenamiento. La plataforma está diseñada para ser ejecutada en entornos con GPU, mencionándose explícitamente una configuración para NVIDIA A40 en la fase 1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plataforma de entrenamiento y servicio (no un modelo de lenguaje en sí). Basada en Qwen 3.5-4B como modelo base, sin detalles adicionales |
| Parametros totales | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Se menciona cuantización de 4 bits para carga del modelo base (en `qwen35_training.py`), pero sin especificar formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (repositorio de código, no contiene pesos) |

## Arquitectura y entrenamiento

La plataforma implementa un pipeline de entrenamiento en tres fases. La fase 0 se encarga de la preparación de datos mediante un parser OCR que convierte repeticiones de manos de póker en observaciones estructuradas (`PokerObservationV2`). La fase 1 realiza un ajuste fino supervisado (SFT) con un objetivo de pérdida semántica categórica, en lugar de la pérdida token-level típica de JSON, y utiliza inyección LoRA sobre Qwen 3.5-4B con cuantización de 4 bits. La fase 2 aplica aprendizaje por refuerzo con auto-juego (PPO), incluyendo un buffer de rollout estructurado, un league de oponentes, un curriculum gradual de 2 a 5 jugadores y una puerta de promoción basada en intercambio de asientos.

El diseño incorpora un sampler estructurado basado en trie que restringe la generación del LLM a acciones legales en formato JSON, tanto en versión CPU como GPU. También incluye un actor-crítico con cabezas de política y valor, y un sistema de caché de prompts tokenizados. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni hiperparámetros específicos más allá de los mencionados.

## Capacidades

- Entrenamiento de agentes de póker con ajuste fino supervisado y aprendizaje por refuerzo mediante auto-juego.
- Generación de acciones legales restringidas mediante sampler estructurado (trie) que garantiza salidas JSON válidas.
- Soporte para observaciones estructuradas de póker (calles, posiciones, acciones concretas) a través de contratos Pydantic.
- Reproducción de manos desde fuentes OCR para validación de datos.
- Gestión de linaje de datos, huellas digitales y reconciliación de manifiestos para trazabilidad.
- Evaluación con métricas de precisión, macro-F1 y calibración en la fase 1.
- Promoción de modelos con EMA y requisitos de confianza estadística.
- Integración con el ecosistema HuggingFace Trainer para SFT.

## Casos de uso

- Desarrollo de agentes de póker para investigación en juegos de información imperfecta: la plataforma permite iterar desde datos OCR hasta un agente entrenado con RL, facilitando experimentos con diferentes estrategias y curricula.
- Entrenamiento de bots para torneos de póker en línea: el pipeline de auto-juego con league de oponentes y curriculum gradual (2 a 5 jugadores) permite escalar la complejidad de forma controlada.
- Validación de datos de repeticiones de manos: la fase 0 con OCR replay y analíticas de distribución (calle, acción, fuente, calidad) sirve para auditar y limpiar datasets antes del entrenamiento.
- Despliegue de agentes en producción: el módulo `serving.py` ofrece un contrato de respuesta con fallback legal determinista, adecuado para integrar el agente en un juego real con backend y frontend.
- Investigación en alineación de modelos con restricciones estructurales: el sampler trie y la pérdida semántica son ejemplos de cómo forzar salidas válidas en dominios con gramática estricta.
- Auditoría de modelos y linaje de datos: los módulos de manifiesto, verificación SHA256 y reconciliación de linaje permiten rastrear qué datos y configuraciones produjeron cada checkpoint, útil para cumplimiento y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del agente entrenado, ni comparaciones con otros sistemas de póker. La única referencia a evaluación es la fase 1 con métricas de precisión, macro-F1 y calibración, pero sin valores concretos.

## Requisitos de hardware

- Se menciona una configuración de entorno para NVIDIA A40 en `configs/phase1_environment_a40_v1.json`, lo que sugiere que el entrenamiento SFT está pensado para GPUs de gama alta con al menos 48 GB de VRAM.
- La cuantización de 4 bits del modelo base (Qwen 3.5-4B) permite inferencia en GPUs de consumo como RTX 3090 o RTX 4090, aunque no se especifican requisitos mínimos.
- El entrenamiento con RL (fase 2) probablemente requiera múltiples GPUs para el auto-juego, pero no se detalla.
- Opciones de despliegue: el repositorio incluye Docker para la aplicación de producción, y los scripts de inferencia (`inference.py`, `serving.py`) sugieren compatibilidad con frameworks como vLLM o TGI, aunque no se mencionan explícitamente.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos o plataformas de póker. Existen proyectos como PokerGPT (basado en GPT-4) o librerías de solvers como las recopiladas en awesome-poker-ai, pero ninguno comparte la misma arquitectura de plataforma contract-first con fases OCR, SFT y RL. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El repositorio no incluye pesos de modelo entrenados; solo contiene código, configuraciones y contratos. Para usarlo es necesario disponer del modelo base Qwen 3.5-4B y ejecutar el pipeline completo.
- No se especifica la licencia del repositorio, lo que impide conocer las restricciones de uso comercial o modificación.
- La dependencia de Qwen 3.5-4B implica que el rendimiento final del agente depende de las capacidades de ese modelo base, que no se detallan en la información proporcionada.
- El pipeline de OCR puede introducir errores en los datos si las fuentes no son de alta calidad; la fase 0 incluye mecanismos de cuarentena, pero no se garantiza la limpieza total.
- No hay evidencia de que el agente resultante supere a solvers tradicionales o a bots comerciales; la plataforma es un marco de trabajo, no un producto final validado.
- La ausencia de benchmarks y métricas publicadas impide evaluar la efectividad del enfoque frente a alternativas.
- El proyecto parece estar en una fase temprana (creado en septiembre de 2026, sin descargas ni likes), por lo que su madurez y estabilidad no están demostradas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/runpodai09/poker_platform
- Página de Runpod (proveedor de infraestructura, mencionado en el autor): https://www.runpod.io/
- Lista de recursos sobre IA en póker (contexto general): https://github.com/PokerBotAI/awesome-poker-ai
- Proyecto PokerGPT (ejemplo de bot de póker con GPT-4): https://github.com/HarperJonesGPT/PokerGPT
