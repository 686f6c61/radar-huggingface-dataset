# Dreamplay56/storyverse-chat

## Resumen

StoryVerse Chat (versión de prueba) es un paquete distribuible para Windows que empaqueta una aplicación de chat de escritorio con un servidor de inferencia local y un modelo de lenguaje. No se trata de un modelo entrenado por el autor: el modelo subyacente es Gemma 3 1B de Google, convertido a formato GGUF por bartowski, y el autor (Dreamplay56, bajo el seudónimo 夢芝居 / Dream Play) aporta la aplicación cliente y el empaquetado listo para ejecutar.

El objetivo es ofrecer una experiencia de chat con IA totalmente offline en un PC con Windows: el archivo `storyverse-chat.zip` contiene la aplicación, el servidor llama.cpp y los pesos del modelo, de modo que tras la descarga no se requiere conexión a internet ni se envían datos a servicios externos. Está orientado a un público no técnico, con un flujo de arranque de un solo clic mediante `run_app.bat`.

La relevancia es limitada desde el punto de vista de la investigación: no hay información publicada sobre fine-tuning, dataset o evaluación propios. El repositorio ocupa 1,7 GB y declara el idioma japonés, con licencia "other" sujeta a los términos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 1B, según la model card); detalles internos no disponibles |
| Parametros totales | 1B (modelo base Gemma 3 1B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (nivel de cuantización concreto no disponible) |
| Idiomas soportados | japonés (declarado); capacidades multilingües del modelo base no detalladas |
| Licencia | other (sujeta a los términos de uso de Gemma: ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF, distribuido dentro de `storyverse-chat.zip` |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B de Google, según indica la propia model card, convertido a GGUF por bartowski. No se dispone de información sobre la arquitectura interna más allá de la referencia al modelo base, ni sobre el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF/DPO. El autor no documenta ningún proceso de fine-tuning propio sobre Gemma 3 1B.

La innovación del repositorio es de empaquetado, no de modelado: integra en un único ZIP la aplicación de chat (StoryVerse Chat, desarrollada por 夢芝居), el servidor llama.cpp y los pesos GGUF, con configuración predefinida y arranque automático mediante un script `.bat`. La aplicación usa tkinter de la distribución estándar de Python como interfaz gráfica.

## Capacidades

- Generación de texto conversacional en japonés, heredada del modelo base Gemma 3 1B.
- Ejecución totalmente local y offline tras la descarga; no se envían datos a servidores externos según la model card.
- Interfaz de chat de escritorio con servidor llama.cpp integrado y arranque automático.
- Aceleración por GPU NVIDIA opcional; funcionamiento en CPU con mayor latencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Chat conversacional offline en escritorio Windows: el usuario descomprime el ZIP, ejecuta `run_app.bat` y obtiene un chat funcional sin conexión, adecuado para entornos con conectividad restringida o para preservar la privacidad del texto introducido.
- Escritura creativa asistida en japonés: dado el perfil del autor (novela y herramientas de creación) y el idioma declarado, el paquete puede emplearse como asistente de redacción local para borradores y variaciones de texto.
- Pruebas de concepto de despliegue local con llama.cpp: sirve como referencia de cómo empaquetar un modelo GGUF de 1B con su servidor y un cliente de escritorio en una sola distribución.
- Evaluación de Gemma 3 1B en hardware de consumo: al incluir pesos y servidor, permite medir latencia y calidad en equipos sin GPU dedicada.
- Docencia y demostraciones de IA local: útil para mostrar en un aula o taller el funcionamiento de un LLM sin depender de servicios en la nube.
- Base para desarrollos propios: el ZIP puede descomponerse para reutilizar el servidor llama.cpp y los pesos GGUF en otras aplicaciones, respetando la licencia de Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11.
- Python 3 con tkinter (incluido en la distribución estándar).
- GPU NVIDIA opcional para acelerar la inferencia; sin GPU el modelo funciona en CPU con respuestas más lentas.
- VRAM estimada: no disponible de forma explícita; con un modelo de 1B en GGUF y un repositorio de 1,7 GB, la huella es reducida y compatible con GPUs de consumo, aunque no se especifica la cuantización exacta.
- GPUs recomendadas: no disponible; cualquier GPU NVIDIA con soporte CUDA debería aportar aceleración según la model card.
- Despliegue: llama.cpp incluido en el paquete; no se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| StoryVerse Chat (Gemma 3 1B empaquetado) | 1B | no disponible | other (términos Gemma) | GGUF en ZIP | App de escritorio + servidor + pesos |
| Gemma 3 1B (original, Google) | 1B | no disponible en esta ficha | términos Gemma | safetensors / GGUF | Modelo base sin empaquetado |
| Otros GGUF de 1B para llama.cpp | ~1B | variable | variable | GGUF | Alternativas de despliegue local; datos concretos no disponibles |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: cualquier limitación de Gemma 3 1B (tamaño reducido, menor calidad de razonamiento frente a modelos mayores) se hereda directamente.
- Ausencia total de información sobre fine-tuning, dataset y evaluación: no hay evidencia publicada de mejoras específicas para el caso de uso del chat.
- Idioma declarado únicamente japonés; el rendimiento en castellano no está documentado.
- Licencia "other": el uso comercial y la redistribución están sujetos a los términos de Gemma, que deben consultarse en `NOTICE_Gemma.txt` y en ai.google.dev/gemma/terms.
- Riesgo de alucinación inherente a un modelo de 1B, especialmente en tareas de razonamiento o datos factuales.
- Dependencia de Windows y de Python 3 con tkinter; no se documenta soporte para macOS o Linux.
- Sin descargas ni likes en el momento de la consulta: proyecto reciente y sin validación comunitaria.
- El repositorio incluye un ZIP de 1,7 GB; la integridad y el contenido del binario no están verificados más allá de lo indicado en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Dreamplay56/storyverse-chat
- Descarga directa: https://huggingface.co/Dreamplay56/storyverse-chat/resolve/main/storyverse-chat.zip
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Sitio del autor: https://website.dreamplayumeshibai09.workers.dev/
- Conversión GGUF de Gemma 3 1B por bartowski: no disponible (enlace no incluido en la información proporcionada)
