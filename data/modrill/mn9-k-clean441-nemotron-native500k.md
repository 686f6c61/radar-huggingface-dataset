# modrill/MN9-K-CLEAN441-NEMOTRON-NATIVE500K

## Resumen

MN9-K-CLEAN441-NEMOTRON-NATIVE500K es un adaptador LoRA experimental para razonamiento matemático, publicado por el usuario modrill en HuggingFace. Se trata de un adapter PEFT (Parameter-Efficient Fine-Tuning) que se carga dinámicamente sobre el modelo base Qwen/Qwen3-4B-Base, sin fusionar los pesos. El autor lo describe como un "experimental math LoRA adapter" y aclara explícitamente que no fue ganador en la evaluación oficial original, y que esta publicación no altera ese juicio histórico.

El adaptador fue entrenado con un conjunto de datos muy reducido: 611 líneas de texto que suman 500.000 tokens activos, con solo 15 actualizaciones de optimizador. La mezcla incluye 441 líneas de un "backbone" limpio y revisado, 170 líneas de versiones comprimidas de problemas de Nemotron-Math-v2, y 170 líneas adicionales de trayectorias de `gpt-oss-120b` procesadas. El entrenamiento usó LoRA con rank 64, alpha 128 y dropout 0, con una ventana de contexto máxima de 32.768 tokens.

La relevancia de este modelo es principalmente investigadora: sirve como ejemplo de adaptación de bajo rango para matemáticas sobre un base de 4B parámetros, con una evaluación documentada pero no estable. No está pensado para producción, y su licencia no está claramente definida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen3-4B-Base (Transformer decoder-only) |
| Parametros totales | No disponible (el adapter no declara el número; el base tiene ~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según configuración de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adapter no define cuantización; depende del base) |
| Idiomas soportados | No disponible (la model card no los especifica) |
| Licencia | No disponible (el autor no declara una licencia unificada; el base Qwen3-4B-Base tiene metadata Apache-2.0) |
| Formato de pesos | safetensors (adapter PEFT, sin pesos del base) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica a las proyecciones q, k, v, o, up, gate y down del transformer Qwen3-4B-Base. No se trata de un modelo completo, sino de un conjunto de matrices de bajo rango (rank 64, alpha 128) que se cargan dinámicamente mediante la librería PEFT. El repositorio no incluye los pesos del base ni un tokenizer propio; se debe usar la revisión fija `906bfd4b4dc7f14ee4320094d8b41684abff8539` del base.

El entrenamiento utilizó un dataset extremadamente pequeño: 611 líneas con 500.000 tokens activos, repartidos en 15 actualizaciones del optimizador. La composición es heterogénea: 441 líneas de un "backbone" limpio (400.240 tokens), 170 líneas de versiones comprimidas de problemas de Nemotron-Math-v2 (99.760 tokens, comprimidos desde 173.749), y 170 líneas adicionales de trayectorias de `gpt-oss-120b` con razonamiento desactivado. El autor advierte que estas últimas no son estrictamente "NoThink" ni soluciones oficiales humanas, por lo que la mezcla no puede considerarse 100% native-like.

La optimización usó learning rate constante de 2e-5, sin warmup, con objetivo de 32.768 tokens activos por actualización y sin truncamiento ni packing. El resultado es un adaptador experimental, no un modelo afinado de forma convencional.

## Capacidades

- Generación de texto matemático: el adaptador está diseñado para resolver problemas de matemáticas tipo AIME, aunque con rendimiento limitado.
- Razonamiento sin modo thinking: la evaluación se realizó con `enable_thinking=false` y el parser de razonamiento desactivado, lo que sugiere que el adaptador intenta producir soluciones directas.
- No soporta tool calling, ni visión, ni audio, ni funciones de agente.
- Capacidades multilingües no documentadas; probablemente hereda las del base Qwen3, pero no se especifica.
- Capacidad especial: es un adaptador de bajo rango que se puede cargar y descargar dinámicamente sobre el base, lo que permite experimentar con diferentes adaptadores sin cambiar el modelo completo.

## Casos de uso

- Investigación en adaptación de bajo rango: sirve como ejemplo de cómo un LoRA con pocos datos (500K tokens) afecta el rendimiento matemático de un modelo base de 4B. Útil para estudiar la relación entre tamaño del dataset, rank y resultados.
- Evaluación comparativa de adaptadores: al ser un adapter independiente, se puede cargar sobre el mismo base y comparar con otros adaptadores en tareas de matemáticas, manteniendo el resto de condiciones constantes.
- Prototipado rápido de mejoras: los investigadores pueden partir de este adaptador y aplicar cambios menores (más datos, diferentes hiperparámetros) para iterar sin necesidad de entrenar un modelo completo.
- Reproducción de experimentos: el autor proporciona el código de carga exacto, la revisión del base, y el hash SHA256 de los pesos, lo que permite reproducir la evaluación original (34/240 en AIME24+25) de forma fiable.
- Estudio de mezcla de fuentes de datos: el dataset combina tres procedencias distintas (backbone limpio, Nemotron-Math-v2 comprimido, y trayectorias de gpt-oss-120b). Puede usarse para analizar cómo afecta cada fuente al comportamiento final.
- Verificación de integridad y reproducibilidad: el repositorio incluye manifiestos SHA256 y copias protegidas, lo que lo convierte en un caso de estudio para prácticas de publicación reproducible en ML.

## Benchmarks y rendimiento

El autor reporta un único resultado de evaluación, realizado bajo un contrato de evaluación formal con EvalScope, en modo NoThink y con el parser de razonamiento desactivado. El conjunto de pruebas fue AIME24 + AIME25, con 4 semillas (42, 43, 44, 45), 60 problemas por semilla, totalizando 240 evaluaciones. El resultado fue de 34 aciertos (9/60, 8/60, 8/60, 9/60 por semilla; 16/120 en AIME24 y 18/120 en AIME25). El autor advierte explícitamente que no se realizaron pruebas adicionales con semillas nuevas, por lo que este número no debe interpretarse como un rendimiento estable.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un adaptador sobre Qwen3-4B-Base, los requisitos de hardware son los del modelo base más el overhead del adaptador (mínimo).
- El base Qwen3-4B en FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache. Con cuantización (por ejemplo, 4-bit) puede caber en GPUs consumer de 8 GB, aunque no se han probado configuraciones específicas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para inferencia en FP16 o cuantizada. Para entrenamiento o fine-tuning adicional, se necesitaría más memoria (16 GB o más).
- Opciones de despliegue: al ser un adapter PEFT, se puede cargar con HuggingFace Transformers + PEFT, o exportar a formatos como GGUF si se fusiona previamente con el base. No se han probado integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros adaptadores o modelos de tamaño similar en la información proporcionada. El único punto de referencia interno es el resultado 34/240 en AIME24+25, pero sin datos de otros modelos no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica como "experimental" y aclara que no fue ganador en la evaluación oficial. No debe usarse en producción sin una validación exhaustiva.
- Rendimiento no estable: el resultado 34/240 corresponde a una única ejecución con semillas específicas; no hay evidencia de que se repita con otras semillas.
- Sin licencia clara: el autor no declara una licencia unificada para el adaptador. Aunque el base Qwen3-4B-Base tiene metadata Apache-2.0, el adaptador combina datos de diferentes fuentes (algunas marcadas como CC-BY-4.0, otras con procedencia no verificada), por lo que el usuario debe revisar la procedencia de cada línea antes de cualquier uso comercial.
- Datos de entrenamiento limitados: 500K tokens es una cantidad muy pequeña para un modelo de 4B; es probable que el adaptador tenga una capacidad de generalización muy limitada y pueda alucinar o fallar en problemas fuera del dominio de entrenamiento.
- Riesgo de alucinación: al ser un adaptador matemático sin garantías de corrección, las respuestas pueden ser plausibles pero incorrectas. El autor advierte que no debe confundirse la revisión del modelo con una garantía de exactitud matemática.
- No incluye tokenizer ni pesos del base: el usuario debe descargar el base y el tokenizer por separado, usando la revisión exacta especificada.
- Restricciones de uso: el autor no ha publicado los datos de entrenamiento ni los estados del optimizador, lo que limita la capacidad de reproducir o auditar el entrenamiento.

## Enlaces

- Repositorio HuggingFace: [modrill/MN9-K-CLEAN441-NEMOTRON-NATIVE500K](https://huggingface.co/modrill/MN9-K-CLEAN441-NEMOTRON-NATIVE500K)
- Modelo base: [Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base) (revisión `906bfd4b4dc7f14ee4320094d8b41684abff8539`)
