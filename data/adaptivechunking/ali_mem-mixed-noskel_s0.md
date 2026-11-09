# AdaptiveChunking/ali_mem-mixed-noskel_s0

## Resumen

`ali_mem-mixed-noskel_s0` es un modelo de investigación desarrollado por la organización AdaptiveChunking en Hugging Face, entrenado a partir del framework `beetle-hnet` (arquitectura `ali`, objetivo `ratio`, sin schedule, dechunking por EMA, semilla 0). No es un modelo de lenguaje conversacional al uso: se trata de un experimento de tokenización dinámica a nivel de byte (byte-level) sobre una arquitectura H-Net, orientado a estudiar cómo un modelo puede aprender a segmentar y agrupar secuencias de bytes de forma adaptativa en lugar de depender de un tokenizador estático.

El modelo tiene 22.785.088 parámetros totales (aproximadamente 22,8 millones) y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). Esta combinación de idiomas es deliberada en el contexto de investigación de tokenización, ya que el turco y el finés son lenguas aglutinantes con alta productividad morfológica, lo que las convierte en casos de prueba exigentes para esquemas de segmentación.

Su relevancia es fundamentalmente académica y experimental: el repositorio incluye checkpoints intermedios en una programación logarítmica por fases (`step-0`, `step-1`, `step-2`, `step-4`, ..., `step-1024`, etc.), estado completo del entrenador reanudable y sondas de frontera FLORES+ en la rama `main` una vez finalizado el entrenamiento. Está publicado con licencia Apache 2.0, lo que facilita su reutilización en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`) con tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint PyTorch) |
| Idiomas soportados | inglés (`en`), turco (`tr`), finés (`fi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), checkpoint PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio `beetle-hnet`, con la variante `ali` y el objetivo de entrenamiento `ratio`. La característica definitoria es el uso de *dynamic chunking*: en lugar de tokenizar la entrada con un vocabulario fijo, el modelo opera sobre bytes y aprende a agruparlos dinámicamente. El dechunking se realiza mediante media móvil exponencial (`dechunk=ema`), y el entrenamiento se ejecutó sin schedule de learning rate (`schedule=None`).

El entrenamiento consistió en 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes cada una, sobre un corpus mezclado de inglés, turco y finés. El repositorio conserva checkpoints intermedios según una programación logarítmica en base 2 por fases del objetivo (`step-0`, `step-1`, `step-2`, `step-4`, `step-6`, `step-8`, `step-16`, ..., hasta `step-1024` y el paso final), lo que permite analizar la evolución del aprendizaje de la segmentación a lo largo del entrenamiento. Cada checkpoint incluye `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador en `training_state/checkpoint.pt`. Los tensores con pesos atados se almacenan una sola vez, y `config.json["tied_weights"]` mapea los nombres omitidos a los almacenados.

## Capacidades

- Modelado de secuencias a nivel de byte con segmentación dinámica aprendida (dynamic chunking).
- Procesamiento multilingüe limitado a los tres idiomas de entrenamiento: inglés, turco y finés.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en la rama `main` tras finalizar el entrenamiento.
- Reanudación del entrenamiento desde cualquier checkpoint intermedio gracias al estado completo del entrenador.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No es un modelo de chat ni de instrucciones: no se ha publicado información sobre ajuste por RLHF, DPO o SFT.

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como banco de pruebas para comparar esquemas de segmentación dinámica frente a tokenizadores BPE o WordPiece estáticos, usando los checkpoints intermedios para estudiar la evolución de las fronteras aprendidas.
- Estudio de lenguas aglutinantes: la inclusión de turco y finés permite analizar cómo un modelo byte-level aprende a agrupar morfemas productivos sin un vocabulario predefinido, un problema clásico en NLP para estas familias lingüísticas.
- Análisis de dinámica de entrenamiento: la programación logarítmica de checkpoints (pasos 0, 1, 2, 4, 8, ..., 1024) facilita trazar curvas de aprendizaje y estudiar en qué fase emerge la capacidad de chunking.
- Reproducción de experimentos: el estado reanudable completo (`training_state/checkpoint.pt`) permite replicar o continuar el entrenamiento desde cualquier fase con la semilla 0, útil para verificación de resultados en publicaciones.
- Evaluación de fronteras multilingües: las sondas FLORES+ en la rama `main` permiten medir la calidad de la segmentación sobre texto paralelo en los tres idiomas entrenados.
- Base para experimentos de arquitecturas H-Net: con 22,8 M de parámetros, el modelo es lo bastante pequeño para iterar rápidamente en una sola GPU consumer, sirviendo como punto de partida para variantes de objetivo, schedule o estrategia de dechunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona la existencia de sondas de frontera FLORES+ (`probe/`) en la rama `main` tras finalizar el entrenamiento, pero no se incluyen métricas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16, unos 46 MB. Cabe holgadamente en cualquier GPU consumer, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para inferencia; para reentrenamiento, una RTX 3060 o superior permite ejecutar el pipeline con batches de 32 x 1024 bytes.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX 20xx en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada de `beetle-hnet`, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere cargar `model.safetensors` con el código del repositorio `beetle-hnet` y el `config.json` correspondiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos directamente comparables de la misma categoría (H-Net byte-level con dynamic chunking) ni se dispone de métricas de rendimiento para establecer una comparación cuantitativa con alternativas como tokenizadores BPE estándar o modelos byte-level convencionales.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste por instrucciones: no debe esperarse comportamiento conversacional ni seguimiento de instrucciones.
- Idiomas limitados a inglés, turco y finés; cualquier otro idioma queda fuera del dominio de entrenamiento.
- Contexto de 1024 bytes por secuencia, muy inferior al de modelos de lenguaje convencionales.
- Sin datos publicados de benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Arquitectura no estándar: requiere el código de `beetle-hnet` para cargar los pesos; no es portable a runtimes de inferencia convencionales.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin garantías de calidad, su uso en producción no está respaldado por evaluaciones publicadas.
- El tamaño del repositorio (7,7 GB) se debe a la acumulación de checkpoints intermedios y estados del entrenador, no al tamaño del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-noskel_s0
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
