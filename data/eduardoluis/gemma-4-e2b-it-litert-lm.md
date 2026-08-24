# eduardoluis/gemma-4-E2B-it-litert-lm

## Resumen

Gemma 4 E2B it es un modelo de lenguaje pequeño de Google, parte de la familia Gemma 4, diseñado específicamente para despliegue en dispositivos con recursos limitados (edge, móvil, IoT). Esta versión concreta, publicada por el usuario `eduardoluis`, es un empaquetado en formato `.litertlm` para el framework LiteRT-LM, la capa de orquestación de Google sobre su runtime LiteRT. El modelo base es `google/gemma-4-E2B-it`, una variante instruida del modelo Gemma 4 E2B.

El modelo resuelve el problema de ejecutar IA generativa de forma privada y sin conexión en hardware modesto, gracias a un esquema de cuantización mixta (2, 4 y 8 bits) que reduce la huella de memoria a aproximadamente 0,8 GB para los pesos de texto, más 1,12 GB de embeddings. Según la model card, soporta hasta 32 000 tokens de contexto, aunque otras fuentes externas citan 8K o 128K, por lo que hay discrepancia. La arquitectura es un transformer con decodificación especulativa mediante Multi-Token Prediction (MTP), lo que acelera la inferencia hasta 3 veces. El tamaño exacto de parámetros no se especifica en la documentación oficial, aunque fuentes no oficiales indican entre 2,1 y 2,3 mil millones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante) |
| Parametros totales | No disponible (fuentes externas indican ~2,1-2,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (segun la model card; otras fuentes citan 8K o 128K) |
| Tipos de cuantizacion | Mixta 2/4/8 bits (esquema "Gemma-4 mobile quantization") |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un transformer denso, aunque no se detalla la configuración exacta de capas, cabezas o dimensiones. La innovación principal reside en el esquema de cuantización mixta desarrollado por Google para Gemma 4, que combina pesos de 2, 4 y 8 bits para minimizar el uso de memoria sin sacrificar demasiada calidad. Además, incorpora Multi-Token Prediction (MTP) como modo de borrador para decodificación especulativa, lo que permite predecir varios tokens a la vez y acelerar la generación hasta 3 veces en comparación con la decodificación autoregresiva estándar.

En cuanto al entrenamiento, no se proporcionan datos sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El tag `base_model:finetune` indica que esta versión es un ajuste fino del modelo base `google/gemma-4-E2B-it`, pero no se especifica el método ni los datos utilizados. La model card menciona que los módulos de visión y audio se cargan bajo demanda, lo que sugiere que el modelo base es multimodal, aunque esta versión LiteRT-LM está optimizada principalmente para texto.

## Capacidades

- Generacion de texto y razonamiento: el modelo puede mantener conversaciones, responder preguntas y realizar tareas de razonamiento básico, aunque su tamaño reducido limita la complejidad de los problemas que puede abordar.
- Soporte de tool calling / function calling: LiteRT-LM incluye APIs para function calling, por lo que el modelo puede integrarse en flujos que requieran invocar herramientas externas.
- Capacidades multimodales: el modelo base soporta entrada de imagen y audio, y en esta versión los módulos correspondientes se cargan bajo demanda para ahorrar memoria. No se confirma si la versión LiteRT-LM expone estas capacidades de forma completa.
- Despliegue sin conexion: al ejecutarse en el dispositivo, no requiere conexion a internet, lo que garantiza privacidad de los datos del usuario.
- Compatibilidad multiplataforma: el formato `.litertlm` permite ejecutar el modelo en Android, iOS, Desktop, IoT y Web mediante LiteRT-LM.

## Casos de uso

- Asistente personal en movil: el modelo puede integrarse en una app de Android o iOS para ofrecer respuestas a preguntas frecuentes, resumir notas o redactar mensajes, todo sin conexion y con baja latencia gracias a su tamaño reducido.
- Atencion al cliente en dispositivos IoT: en un altavoz inteligente o un quiosco, el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens, resolviendo consultas simples sin depender de la nube.
- Generacion de codigo en entornos embebidos: aunque no es su fuerte, puede asistir en la autocompletacion de fragmentos de codigo en IDEs ligeros o en herramientas de desarrollo para hardware con recursos limitados.
- Transcripcion y resumen de audio en tiempo real: gracias a su capacidad multimodal (audio bajo demanda), puede transcribir y resumir reuniones o notas de voz directamente en el dispositivo, preservando la privacidad.
- Clasificacion y etiquetado de imagenes en edge: con el modulo de vision, puede analizar imagenes localmente para tareas como moderacion de contenido o reconocimiento de objetos en aplicaciones de camara.
- Chatbot de soporte tecnico en la web: al poder ejecutarse en el navegador mediante LiteRT-LM, se puede desplegar un chatbot de autoservicio que no envie datos a servidores externos, cumpliendo requisitos de cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se realizaron mediciones con 1024 tokens de prefill y 256 de decode, pero no ofrece cifras concretas de rendimiento (latencia, throughput, metricas de calidad). Por tanto, no es posible comparar objetivamente este modelo con alternativas.

## Requisitos de hardware

- VRAM estimada: los pesos de texto ocupan aproximadamente 0,8 GB en memoria, y los embeddings 1,12 GB adicionales. En total, se necesitan alrededor de 2 GB de RAM/VRAM para inferencia basica.
- GPU recomendadas: al ser un modelo tan pequeno, cualquier GPU moderna (incluso integradas) puede ejecutarlo. No se requieren GPUs de datacenter como A100 o H100.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media como RTX 3060 o superiores, e incluso en CPUs con suficiente RAM.
- Opciones de despliegue: el formato nativo es LiteRT-LM, que soporta Android, iOS, Desktop, IoT y Web. Tambien se puede convertir a otros formatos (GGUF, safetensors) para usar con llama.cpp, Ollama o vLLM, aunque no se proporcionan instrucciones oficiales.
- Latencia y throughput: no se especifican valores concretos. Dado el tamaño y la decodificacion especulativa, se espera una latencia de decenas de milisegundos por token en hardware movil moderno, pero no hay datos verificables.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables (como Gemma 2 2B, Phi-3 mini o Qwen2.5-1.5B) en la informacion proporcionada. Se recomienda consultar benchmarks independientes antes de elegir este modelo frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado informacion sobre sesgos especificos, pero al ser un modelo pequeno entrenado con datos web, es probable que herede sesgos comunes de los LLM.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contextos largos.
- Limitaciones de contexto: aunque la model card indica 32K tokens, otras fuentes citan 8K o 128K, lo que genera incertidumbre. Se recomienda verificar el comportamiento real con el contexto maximo antes de usarlo en produccion.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base de Google suele tener buen soporte multilingue, pero no esta confirmado para esta version.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir correctamente y no se ofrece garantia.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o de prueba. No hay evidencia de pruebas exhaustivas en entornos reales. Se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/eduardoluis/gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Model card original de litert-community: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Documentacion de LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- Blog sobre cuantizacion de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
