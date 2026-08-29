# leok7v/gemma-4-12b-it-qat

## Resumen

El modelo `leok7v/gemma-4-12b-it-qat` es un repack en formato GGUF del modelo Gemma 4 12B de Google, específicamente de la versión entrenada con cuantización consciente (quantization-aware training, QAT). El autor `leok7v` ha recuperado los códigos de cuantificación Q4_0 directamente del checkpoint original, en lugar de volver a cuantizar, logrando una reconstrucción lossless de los pesos. Esto permite ejecutar el modelo en dispositivos locales sin necesidad de servidores externos, ya que el tokenizador, la tabla de merges y la plantilla de chat están incrustados en el archivo.

Gemma 4 12B es el miembro "unificado" de la familia Gemma 4, diseñado para procesar texto, imagen y audio sin torres de visión ni audio separadas. En lugar de ello, las imágenes se convierten en parches de píxeles 48x48 y el audio en tramas de 640 muestras de forma cruda, proyectándose directamente en el espacio de embeddings del modelo. Con 12 382 587 188 parámetros y una ventana de contexto de 262 144 tokens, ofrece capacidades multimodales y de razonamiento avanzadas en un paquete compacto para inferencia en dispositivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención alternada (40 capas sliding-window + 8 capas full-attention) |
| Parametros totales | 12 382 587 188 (12,38 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_0 (atención y MLP) y BF16 (norms, escalares y proyecciones multimodales) |
| Idiomas soportados | Inglés (declarado en el repo; el modelo base puede soportar más, sin confirmar) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF v3, 677 tensores, alineación de 16 384 bytes |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de 48 capas, con un tamaño oculto de 3840, feed-forward de 15360 con GELU con puerta, y vocabulario de 262 144 tokens con embeddings atados a la cabeza de salida. La atención alterna cinco capas de ventana deslizante (sliding-window) por cada capa de atención completa. Las capas sliding usan 16 cabezas de consulta, 8 cabezas clave/valor, ancho de 256 y base RoPE de 10 000. Las capas full usan 16 cabezas de consulta, una sola cabeza clave/valor, ancho de 512, RoPE proporcional con base 1 000 000 y comparten proyección clave-valor sin proyección de valor separada. La ventana deslizante es de 1024 tokens y el softcap de logits es 30.

El entrenamiento del checkpoint original incluye cuantización consciente: cada peso se redondeó a una rejilla de 16 niveles durante el entrenamiento. El repack de `leok7v` recupera los códigos `(q, d)` en lugar de volver a cuantizar, verificando bloque a bloque que la reconstrucción reproduzca los valores originales dentro de un ulp de bf16. Este proceso es lossless y evita la pérdida adicional que introduciría una cuantización post-hoc. El modelo no utiliza RLHF ni DPO declarado en la información disponible, y se desconoce la composición exacta del dataset de entrenamiento.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte para pensamiento extendido mediante el token `<|think|>` al inicio del prompt de sistema.
- Procesamiento multimodal de imagen: las imágenes se convierten en parches de 48x48 píxeles y se proyectan directamente al espacio de embeddings, sin torre de visión separada.
- Procesamiento de audio: tramas de 640 muestras de forma de onda a 16 kHz se proyectan mediante una única capa lineal.
- Soporte de tool calling y parsing de llamadas a funciones, según la configuración de generación incrustada en el archivo GGUF.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidad multilingüe restringida al inglés según el repo, aunque el modelo base podría soportar más idiomas (no verificado).

## Casos de uso

- Asistentes personales offline: el modelo puede ejecutarse en un portátil o dispositivo edge sin conexión, gestionando conversaciones multi-turno con contexto largo gracias a su ventana de 262K tokens. Ideal para entornos con requisitos estrictos de privacidad donde los datos no deben salir del dispositivo.
- Análisis de imágenes en local: al aceptar parches de imagen directamente, puede describir o responder preguntas sobre fotografías o diagramas sin depender de servicios en la nube. Útil en aplicaciones de soporte técnico o documentación visual.
- Transcripción y procesamiento de audio: al aceptar tramas de audio crudas, puede transcribir o resumir grabaciones de voz en tiempo real, siempre que el runtime soporte la conversión de audio a las 640 muestras necesarias. Apto para asistentes de voz embebidos.
- Generación de código en entornos aislados: con tool calling integrado, puede integrarse en pipelines de CI/CD para autocompletar o revisar código, aunque su tamaño (12B) requiere una GPU con al menos 8 GB de VRAM.
- Chat de atención al cliente con contexto prolongado: la ventana de 262K tokens permite mantener el historial completo de una conversación de soporte, reduciendo la pérdida de información y mejorando la coherencia en interacciones largas.
- Investigación y prototipado de modelos multimodales: al ser un repack GGUF con pesos QAT, sirve como referencia para estudiar el impacto de la cuantización consciente en tareas mixtas de texto, imagen y audio, sin necesidad de hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas comparativas (MMLU, HumanEval, GSM8K, etc.) y la búsqueda web no aporta datos numéricos verificados. Se recomienda consultar la documentación oficial de Gemma 4 para obtener referencias de rendimiento del modelo base.

## Requisitos de hardware

- El archivo de pesos GGUF pesa 6,823 GB, por lo que la inferencia en Q4_0 requiere aproximadamente 7-8 GB de VRAM para los pesos más overhead de activaciones y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090, A100 40 GB o superior. En CPU, es viable con 16 GB de RAM, aunque con latencia mayor.
- Es compatible con runtimes que soporten GGUF: llama.cpp, Ollama, vLLM (con soporte GGUF), y TGI mediante conversión previa.
- La latencia estimada para generación en una RTX 4090 sería del orden de 20-40 tokens por segundo, y en CPU (16 núcleos) de 5-10 tokens por segundo, según la configuración.
- La cuantización mixta (Q4_0 + BF16) reduce el consumo de memoria sin sacrificar las capas de normalización y proyecciones multimodales, que permanecen en precisión completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-12b-it-qat (este) | 12,38 B | 262 144 | Apache 2.0 | GGUF Q4_0/BF16 | Multimodal (texto, imagen, audio), QAT |
| Gemma 2 12B | 12,2 B | 8 192 | Gemma license | Safetensors, GGUF | Solo texto, sin QAT |
| Qwen2.5 12B | 12,8 B | 131 072 | Apache 2.0 | Safetensors, GGUF | Solo texto, sin multimodal |
| Llama 3.1 8B | 8,03 B | 131 072 | Llama 3 license | Safetensors, GGUF | Solo texto, más pequeño |

No se dispone de datos de benchmarks comparativos verificados en la información proporcionada, por lo que la comparación se limita a especificaciones técnicas. El modelo destaca por su ventana de contexto superior y su naturaleza multimodal, aunque su soporte idiomático declarado es solo inglés.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; el uso en otros idiomas puede degradar la calidad de las respuestas.
- Al ser un modelo de lenguaje, no verifica hechos y puede producir alucinaciones con alta confianza. No es adecuado para decisiones legales, médicas o financieras sin revisión humana.
- Los sesgos del modelo base se heredan; se recomienda consultar la model card del modelo base para conocer los sesgos conocidos.
- Aunque la ventana de contexto es de 262K tokens, el rendimiento puede degradarse en entradas muy largas debido a la atención sliding-window y la memoria necesaria para la caché KV.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los términos específicos de la licencia Gemma 4 para posibles restricciones adicionales.
- El repack GGUF está optimizado para on-device, pero no incluye el dataset de entrenamiento ni el checkpoint original; si se requiere el modelo completo en otra precisión, hay que acudir al repositorio base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leok7v/gemma-4-12b-it-qat
- Modelo base (Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Documentación de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repack GGUF alternativo (Unsloth): https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
