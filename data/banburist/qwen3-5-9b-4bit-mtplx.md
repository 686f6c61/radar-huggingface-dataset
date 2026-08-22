# banburist/Qwen3.5-9b-4bit-MTPLX

## Resumen

El modelo `banburist/Qwen3.5-9b-4bit-MTPLX` es una cuantización en 4-bit del modelo Qwen3.5-9B, preparada específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor, banburist, ha aplicado el formato MTPLX, que aprovecha las cabezas de predicción multi-token (MTP) que los modelos Qwen3.5 integran de serie, pero que casi ningún runtime utiliza. Esto permite que el modelo genere varios tokens por adelantado y los verifique en un único forward pass por lotes, manteniendo únicamente los que superan un muestreo de rechazo exacto.

El resultado es una aceleración de hasta 1,97 veces respecto a una línea base autorregresiva, verificada en un Apple M5 Pro con una profundidad óptima de D2. El modelo mantiene la misma distribución de salida que el modelo original, por lo que no altera la calidad de las respuestas. Es una opción relevante para desarrolladores que buscan ejecutar un modelo de 9B con baja huella de memoria en equipos Mac con chip M-series.

El repositorio reporta 1.399.927.296 parámetros totales en los metadatos de safetensors, una cifra inferior a los 9B del modelo base, por lo que es probable que el archivo incluya solo un shard o que la cuantización compacte la representación. El tamaño del repositorio es de 6,5 GB, coherente con una cuantización 4-bit de un modelo de 9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5 (atención lineal + transformadores) con cabezas MTP, cuantizada 4-bit |
| Parámetros totales | 1.399.927.296 (según metadatos de safetensors; el modelo base Qwen3.5-9B tiene ~9B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | en (según la ficha del modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un modelo de la familia Qwen 3.5 que combina atención lineal con arquitectura de transformadores tradicional, un enfoque híbrido que reduce el coste computacional en secuencias largas. La cuantización se ha realizado con MTPLX, una herramienta que añade la capacidad de predicción multi-token (MTP): el modelo genera varios tokens a la vez, los verifica en un forward pass por lotes y conserva solo aquellos que pasan un muestreo de rechazo exacto, de modo que la distribución de salida es idéntica a la del modelo autorregresivo original.

El entrenamiento original de Qwen3.5-9B no se detalla en la información disponible, pero la familia Qwen 3.5 se describe como nativamente multimodal (texto, imagen y vídeo) y con mejoras en razonamiento, código, agentes y comprensión visual. Esta cuantización concreta se limita a la generación de texto y no incluye los módulos de visión, ya que el pipeline declarado es `text-generation`.

## Capacidades

- Generación de texto conversacional y de completado en inglés.
- Razonamiento y resolución de problemas de varios pasos, heredados del modelo base Qwen3.5-9B.
- Generación de código y soporte de agentes (capacidades del modelo base, no verificadas en esta cuantización).
- Aceleración de inferencia mediante multi-token prediction: el runtime MTPLX genera varios tokens por paso, con verificación exacta.
- Compatible con el ecosistema MLX y MTPLX para Apple Silicon.

## Casos de uso

- Asistente local en Mac: el modelo se puede ejecutar en un Mac con Apple Silicon mediante `mtplx start chat`, ofreciendo un asistente conversacional que no requiere conexión a internet ni envío de datos a la nube.
- Prototipado de aplicaciones de texto: gracias al formato MLX y al tamaño reducido (6,5 GB), se puede integrar en aplicaciones de escritorio para macOS que generen resúmenes, borradores o respuestas en inglés.
- Automatización de tareas de escritura: con el modelo base Qwen3.5-9B, se puede generar documentación técnica, correos o contenido en inglés, con una velocidad de inferencia superior a la de una ejecución autorregresiva tradicional.
- Investigación en predicción multi-token: el modelo sirve para experimentar con el runtime MTPLX y comparar la velocidad de decodificación MTP frente a la línea autorregresiva, tal y como se ha verificado con el multiplicador de 1,97×.
- Generación de código asistida en terminal: la CLI de MTPLX permite consultas rápidas de programación en inglés, con la ventaja de no depender de un servidor remoto.
- Despliegue en entornos sin GPU dedicada: gracias a la cuantización 4-bit y la ejecución en MLX, se puede servir el modelo en hardware de Apple con memoria unificada, sin necesidad de GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. La búsqueda web indica que la familia Qwen 3.5 supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se proporcionan cifras numéricas para este repositorio.

La verificación de MTPLX reporta un multiplicador de 1,97× frente a la línea autógena en un Apple M5 Pro, con una profundidad óptima de D2 y un sampler de temperatura 0,6, top_p 0,95 y top_k 20.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB (modelo 4-bit de ~9B, repo de 6,5 GB).
- GPU recomendadas: Apple Silicon (M1 o superior); verificado en Apple M5 Pro.
- Compatible con GPU consumer: sí, en Mac con memoria unificada (Apple Silicon).
- Opciones de despliegue: MTPLX (CLI y app nativa), MLX.
- Latencia y throughput: no disponible, aunque el multiplicador de 1,97× indica un rendimiento casi el doble que la decodificación autorregresiva clásica.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `banburist/Qwen3.5-9b-4bit-MTPLX` | 1.4B (metadatos) | 4-bit | MLX/safetensors | Apache-2.0 | Con cabezas MTP para MTPLX |
| `mlx-community/Qwen3.5-9B-MTP-4bit` | ~9B | 4-bit | MLX | Apache-2.0 | Cuantización MTP de la comunidad MLX |
| `hudsonai-app/Qwen3.5-9B-4bit` | ~9B | 4-bit | MLX | Apache-2.0 | Cuantización 4-bit estándar sin MTP |
| `Qwen/Qwen3.5-9B` | ~9B | - | Transformers | Apache-2.0 | Modelo base, sin cuantizar |

La diferencia principal de este modelo es la integración de la cabecera MTP y la validación con MTPLX, que otros repos de cuantización no incluyen.

## Limitaciones y advertencias

- La ficha del modelo indica solo el idioma inglés (`en`), por lo que el rendimiento en otros idiomas, incluido el español, no está garantizado y podría ser inferior.
- Es una cuantización 4-bit, lo que puede introducir ligeras pérdidas de precisión frente al modelo en FP16, aunque no se han publicado métricas de degradación.
- El repositorio declara 1.399.927.296 parámetros, un valor inferior al esperado para un modelo de 9B; es posible que el archivo safetensors contenga solo una parte de los pesos o que los metadatos estén incompletos.
- La ejecución está limitada a Apple Silicon con MLX; no se puede desplegar en GPU NVIDIA o AMD sin conversión adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje, no mitigado específicamente en esta versión.
- No se han publicado benchmarks de calidad en este repositorio, por lo que es recomendable validar el rendimiento en las tareas específicas antes de usarlo en producción.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar la licencia del modelo base para confirmar las restricciones.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/banburist/Qwen3.5-9b-4bit-MTPLX
- Repositorio del proyecto MTPLX en GitHub: https://github.com/youssofal/mtplx
- Cuantización alternativa de la comunidad: https://huggingface.co/mlx-community/Qwen3.5-9B-MTP-4bit
- Cuantización 4-bit estándar de MLX: https://huggingface.co/hudsonai-app/Qwen3.5-9B-4bit
- Guía de Qwen 3.5 (modelos y benchmarks): https://qwen-ai.com/qwen-3-5/
- Página de Qwen3.5-9B en CanIRun.ai: https://www.canirun.ai/model/qwen3.5-9b
