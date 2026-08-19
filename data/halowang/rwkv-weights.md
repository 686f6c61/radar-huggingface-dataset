# HaloWang/rwkv-weights

## Resumen

El repositorio `HaloWang/rwkv-weights` distribuye artefactos finales de inferencia para los modelos RWKV-7 "Goose", una familia de modelos de lenguaje basados en RNN con arquitectura libre de atención, desarrollados por el proyecto RWKV, que forma parte de la Linux Foundation AI. RWKV-7 combina las ventajas de los RNN (tiempo lineal, espacio constante, sin caché de claves y valores) con la paralelización propia de los Transformers, lo que permite contextos de longitud infinita y un rendimiento competitivo con arquitecturas basadas en atención.

El autor, HaloWang (Ce Wang), publica aquí pesos ya convertidos y verificados mediante SHA-256 para distintos backends de ejecución: WebRWKV, MLX, Core ML, QNN (para Snapdragon) y llama.cpp (GGUF). Los checkpoints fuente provienen de `BlinkDL/rwkv7-g1` y se ofrecen en tamaños de 1.5B, 2.9B, 7.2B y 13.3B, además de versiones de 0.1B y 0.4B sin checkpoint fuente disponible. El repositorio está pensado para facilitar el despliegue en entornos de borde (edge inference), como teléfonos Android, dispositivos Apple y navegadores web.

La relevancia actual de este repositorio radica en que proporciona artefactos listos para producción con identidades inmutables y verificación criptográfica, algo poco habitual en el ecosistema de modelos abiertos. Esto lo convierte en una opción fiable para desarrolladores que necesitan integrar RWKV-7 en aplicaciones móviles, de escritorio o web sin tener que realizar conversiones manuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN con atención lineal, 100% libre de atención) |
| Parametros totales | 1.527.799.808 (1.5B) para el artefacto safetensors; el repositorio incluye también 2.9B, 7.2B y 13.3B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | infinita (según la documentación oficial de RWKV) |
| Tipos de cuantizacion | NF4 (WebRWKV), INT6 (MLX), INT4 (Core ML), A16W4/A16W8 (QNN), Q4_K_M y Q6_K (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX, Core ML, .rmpack (QNN) |

## Arquitectura y entrenamiento

RWKV-7 es un modelo de lenguaje basado en RNN que elimina por completo el mecanismo de atención tradicional. En su lugar, utiliza una forma de atención lineal que permite procesar secuencias de longitud arbitraria con coste computacional constante por paso y sin necesidad de almacenar una caché de claves y valores. Esto lo hace especialmente adecuado para entornos con recursos limitados, como dispositivos móviles o navegadores.

El modelo se entrena de forma paralela como un Transformer, pero en inferencia se comporta como un RNN, lo que reduce drásticamente el consumo de memoria y mejora la latencia en generación de texto largo. La familia RWKV-7 "Goose" incluye variantes de razonamiento, según se indica en la web oficial. No se han proporcionado detalles específicos sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: los modelos RWKV-7 "Goose" están diseñados para tareas de razonamiento y generación de lenguaje natural.
- Inferencia en el borde (edge inference): el repositorio incluye artefactos optimizados para ejecución en dispositivos Android con Snapdragon (QNN), Apple (MLX, Core ML) y navegadores (WebRWKV).
- Soporte de múltiples backends: los pesos están disponibles en formatos GGUF (llama.cpp), MLX, Core ML, QNN y WebRWKV, lo que permite desplegar el modelo en una amplia variedad de plataformas.
- Verificación de integridad: todos los artefactos incluyen SHA-256 y manifiestos inmutables, lo que facilita la auditoría y el despliegue reproducible.
- Conversacional: el repositorio está etiquetado como "conversational", lo que indica su uso previsto para aplicaciones de chat y diálogo.

## Casos de uso

- Asistente personal offline en Android: los paquetes QNN A16W4/A16W8 para Snapdragon permiten ejecutar un asistente conversacional en un teléfono Xiaomi 14 u otros dispositivos con Snapdragon 8 Gen 3, sin conexión a internet y con baja latencia.
- Aplicación de chat de escritorio en macOS: los artefactos MLX INT6 y Core ML INT4 están aceptados en macOS, lo que permite integrar RWKV-7 en aplicaciones nativas de Apple con buen rendimiento.
- Chat en el navegador con WebRWKV: los pesos NF4 de 1.5B a 13.3B pueden ejecutarse directamente en un navegador web, lo que facilita la creación de demos interactivas o herramientas de productividad sin instalación.
- Despliegue en servidores con llama.cpp: los archivos GGUF (Q4_K_M y Q6_K) son compatibles con llama.cpp y sus derivados (Ollama, etc.), permitiendo servir el modelo en CPU o GPU en entornos de producción.
- Prototipado rápido con pesos verificados: gracias a los manifiestos SHA-256, los desarrolladores pueden integrar RWKV-7 en pipelines de CI/CD con la garantía de que los binarios no han sido alterados.
- Investigación en arquitecturas alternativas a Transformer: RWKV-7 sirve como base para estudiar modelos recurrentes con contexto infinito, especialmente en escenarios de memoria limitada o procesamiento de secuencias muy largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K u otros estándares, ni comparaciones con modelos similares.

## Requisitos de hardware

- Los artefactos están diseñados para inferencia en el borde: el modelo de 1.5B puede ejecutarse en dispositivos móviles con Snapdragon (QNN) o en navegadores (WebRWKV), mientras que las versiones de 7.2B y 13.3B requieren más recursos.
- Para macOS, los formatos MLX y Core ML están optimizados para chips Apple (M1/M2/M3 y superiores).
- Para servidores, los archivos GGUF pueden ejecutarse con llama.cpp en CPU o GPU. No se especifican requisitos mínimos de VRAM.
- El repositorio indica que la ejecución del modelo de 13.3B en Android es extremadamente lenta y no se recomienda para uso práctico.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si es compatible), MLX, Core ML, QNN (Snapdragon) y WebRWKV.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. RWKV-7 se puede considerar una alternativa a modelos Transformer pequeños como Llama 3.2 1B, Qwen2.5 1.5B o Gemma 2 2B, pero no hay métricas objetivas para establecer una comparación cuantitativa. Su principal diferenciación es la arquitectura recurrente sin atención, que ofrece ventajas en memoria y contexto largo.

## Limitaciones y advertencias

- El repositorio es una distribución de artefactos, no un modelo entrenado por HaloWang; los pesos provienen de `BlinkDL/rwkv7-g1`.
- No todos los artefactos han pasado pruebas de aceptación en runtime para todos los SoC o dispositivos; la publicación no implica que cada binario haya sido validado en hardware específico.
- El modelo de 13.3B en Android es funcional pero extremadamente lento, por lo que no es adecuado para uso interactivo.
- No se proporciona información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo subyacente.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de los checkpoints fuente en `BlinkDL/rwkv7-g1`.
- Los artefactos de 0.1B y 0.4B no tienen checkpoint fuente disponible, por lo que no se pueden reproducir o auditar completamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HaloWang/rwkv-weights
- Sitio oficial de RWKV: https://www.rwkv.com/
- Perfil de GitHub de HaloWang: https://github.com/HaloWang
- Organización RWKV-APP en GitHub: https://github.com/RWKV-APP/
