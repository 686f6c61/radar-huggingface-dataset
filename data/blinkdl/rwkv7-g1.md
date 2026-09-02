# BlinkDL/rwkv7-g1

## Resumen

RWKV7-G1 "GooseOne" es una familia de modelos de lenguaje base desarrollada por BlinkDL, basada en la arquitectura RWKV-7, una red neuronal recurrente (RNN) pura que combina las ventajas de los transformers (entrenamiento paralelizable) con la eficiencia de las RNN (tiempo lineal y espacio constante). El modelo resuelve el problema del coste cuadrático de la atención transformer, eliminando por completo el mecanismo de atención y el cache de claves/valores (kv-cache), lo que permite una inferencia con velocidad constante independientemente de la longitud de la secuencia y un consumo de memoria fijo. Está diseñado como modelo base, es decir, pensado para post-entrenamiento y fine-tuning, aunque también puede usarse directamente con los prompts adecuados.

La familia incluye configuraciones desde 0.1B hasta 13.3B parámetros, con un vocabulario de 65 536 tokens y un tamaño de cabeza de 64. El modelo se ha entrenado con una mezcla de datos web, código, datos sintéticos y datos de instrucción, chat y razonamiento, lo que le confiere capacidades multilingües (12 idiomas) y de razonamiento. Su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en su arquitectura alternativa a los transformers, que ofrece una eficiencia extrema en inferencia y la posibilidad de manejar contextos teóricamente infinitos, posicionándose como una opción atractiva para despliegues en hardware limitado o aplicaciones de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN pura, sin atención transformer, sin kv-cache) |
| Parametros totales | Múltiples variantes: 0.1B, 0.4B, 1.5B, 2.9B, 7.2B, 13.3B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Infinito por diseño (sin límite de contexto gracias a la RNN) |
| Tipos de cuantizacion | GGUF (varias precisiones, ver enlaces) y safetensors |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, pth (para entrenamiento) |

## Arquitectura y entrenamiento

RWKV-7 "Goose" es una arquitectura de red neuronal recurrente que se entrena de forma paralela como un transformer, pero que en inferencia opera como una RNN con estado oculto de tamaño fijo. Esto elimina la necesidad de almacenar el cache de atención, reduciendo la complejidad computacional de O(n²) a O(n) y el uso de memoria a O(1) respecto a la longitud de la secuencia. El modelo incorpora innovaciones como DeepEmbed (en la variante rwkv7a) y soporte nativo para relleno en medio (FIM) mediante tokens especiales. El entrenamiento se realizó con una mezcla de datasets públicos: FineWeb-Edu, DCLM-baseline, SlimPajama, The Pile, StarCoderData y OSCAR-2301, además de datos sintéticos y de instrucción/chat/razonamiento. No se especifica el número total de tokens de entrenamiento. La versión G1 corresponde a una iteración de datos más reciente que las versiones G0, con mejor calidad general.

## Capacidades

- Generación de texto y razonamiento: modelo base con capacidad de razonamiento multi-paso, especialmente cuando se usan prompts de "thinking" (por ejemplo, `<think` o `(think)`).
- Soporte de tool calling / function calling: mediante plantillas específicas de prompt, puede emitir llamadas a funciones en formato JSON, con parámetros tipados.
- Soporte de agentes y multi-step reasoning: la documentación incluye guías para trabajo agéntico, con integración de herramientas y respuestas estructuradas.
- Capacidades multilingües: entrenado en 12 idiomas (inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe).
- Relleno en medio (FIM): soporta completado de código y texto con el formato `✿prefix✿✿suffix✿...✿middle✿`.
- Contexto infinito: al ser una RNN, no hay límite teórico de longitud de secuencia; la memoria y la velocidad de inferencia son constantes.
- Modo "thinking" explícito: se puede activar con prompts como `Assistant: <think` o `User: USER_PROMPT (think)` para forzar razonamiento antes de responder.
- Inferencia eficiente: con el motor Albatross, alcanza 145+ tokens/s en decodificación con batch 1 para el modelo de 7.2B en una RTX 5090, y más de 10 000 tokens/s en prefill.

## Casos de uso

- Atención al cliente automatizada: gracias a su contexto infinito y soporte multilingüe, puede gestionar conversaciones multi-turno largas sin pérdida de rendimiento, manteniendo un historial completo en el estado recurrente.
- Generación de código en producción: con soporte FIM y function calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar documentación o refactorizar, con latencia constante incluso en archivos muy largos.
- Razonamiento y análisis de documentos extensos: su capacidad de procesar secuencias largas sin degradación lo hace adecuado para resumir contratos, informes o artículos científicos completos, sin necesidad de truncar el contexto.
- Agentes autónomos: la combinación de tool calling y multi-step reasoning permite construir agentes que consultan APIs, ejecutan acciones y razonan sobre los resultados, con un coste de inferencia predecible.
- Traducción automática multilingüe: entrenado en 12 idiomas, puede traducir entre ellos con calidad razonable, y su eficiencia permite despliegue en dispositivos móviles.
- Fine-tuning para dominios específicos: al ser un modelo base, es ideal para ajustarse con datos propios (por ejemplo, legal, médico o financiero) mediante PEFT o entrenamiento completo, gracias a su licencia permisiva.
- Asistente de escritura creativa: con los parámetros de decodificación recomendados (temp 0.6, topp 0.6-0.8), produce texto narrativo fluido, y su contexto infinito permite mantener tramas complejas a lo largo de capítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una herramienta de evaluación llamada "UncheatableEval" (https://huggingface.co/spaces/Jellyfish042/UncheatableEval) para comparar el rendimiento en modelado de lenguaje, pero no se proporcionan cifras concretas. Tampoco hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: no especificada oficialmente. Para el modelo de 7.2B en fp16, se estima un mínimo de 16 GB de VRAM (sin cuantización). Con cuantización GGUF (por ejemplo, Q4_K_M), puede caber en 6-8 GB.
- GPU recomendadas: se reporta inferencia eficiente en RTX 5090 (145+ tokens/s para 7.2B fp16). También funciona en GPUs consumer de gama media con cuantización, y en CPU mediante llama.cpp.
- Compatibilidad con consumer GPU: sí, especialmente las variantes pequeñas (0.1B, 0.4B, 1.5B) pueden ejecutarse en cualquier GPU moderna o incluso en CPU. La variante 7.2B requiere una GPU con al menos 12-16 GB para fp16, o menos con cuantización.
- Opciones de despliegue: motor Albatross (inferencia optimizada), paquete pip `rwkv`, llama.cpp (para GGUF), Ollama (colecciones de GGUF), y aplicaciones móviles (RWKV Chat).
- Latencia y throughput: con Albatross en RTX 5090, se reportan 145+ tokens/s en decodificación con batch 1, 10 250+ tokens/s con batch 960, y 11 289 tokens/s en prefill con batch 1, todo para el modelo de 7.2B fp16. La velocidad es constante independientemente de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. Sin embargo, a nivel arquitectónico, RWKV-7 compite con otras arquitecturas de estado oculto lineal como Mamba (SSM) y con transformers pequeños de tamaño similar (por ejemplo, Llama 3.2 3B, Qwen 2.5 7B). La principal diferencia es que RWKV-7 ofrece contexto infinito y velocidad de inferencia constante, mientras que los transformers tienen límites de contexto fijos y coste cuadrático. En cuanto a licencia, Apache 2.0 es más permisiva que las licencias de Llama (comunitaria) o Qwen (Apache 2.0 también). No se puede realizar una comparación cuantitativa de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos web no filtrados exhaustivamente, puede heredar sesgos sociales, culturales o de género presentes en el corpus.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo si no se usan los prompts de "thinking" adecuados.
- Limitaciones de contexto: aunque el diseño permite contexto infinito, en la práctica puede haber degradación en la coherencia para secuencias extremadamente largas (más de decenas de miles de tokens), aunque no se documenta un límite concreto.
- Sensibilidad al tokenizador: la model card advierte explícitamente que no debe haber espacios al final del prompt, ya que el tokenizador puede producir respuestas no deseadas o en otro idioma.
- Modelo base no alineado: no está diseñado para uso conversacional directo sin ajuste; requiere prompts específicos (chat, think, function call) o fine-tuning para obtener respuestas útiles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia en redistribuciones.
- Requisitos de hardware para variantes grandes: el modelo de 13.3B requiere al menos 32 GB de VRAM en fp16, lo que limita su despliegue en hardware consumer.

## Enlaces

- HuggingFace: https://huggingface.co/BlinkDL/rwkv7-g1
- Sitio web oficial: https://rwkv.com/
- Repositorio RWKV-LM (entrenamiento): https://github.com/BlinkDL/RWKV-LM
- Motor de inferencia Albatross: https://github.com/BlinkDL/Albatross
- Aplicación RWKV Chat: https://rwkv.halowang.cloud/ y https://github.com/RWKV-APP/RWKV_APP
- Pesos en safetensors: https://huggingface.co/RWKV
- Colección GGUF: https://huggingface.co/collections/shoumenchougou/rwkv7-gxx-gguf
- Ollama (GGUF): https://ollama.com/shoumenchougou
- Inferencia móvil: https://github.com/MollySophia/rwkv-mobile
- Guía de prompts y function calling: https://github.com/BlinkDL/RWKV-LM/blob/main/RWKV-v7/RWKV7-G1x-templates.txt
- Herramienta de evaluación UncheatableEval: https://huggingface.co/spaces/Jellyfish042/UncheatableEval
- Script de conversión pth a GGUF: https://github.com/MollySophia/rwkv-mobile/blob/master/converter/convert_rwkv_pth_to_gguf.py
