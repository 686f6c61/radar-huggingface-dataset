# bezowaczern/gemma4-e2b-coreai-8k

## Resumen

Gemma 4 E2B Core AI 8K es una conversión del modelo google/gemma-4-E2B-it al formato Apple Core AI, realizada por el usuario bezowaczern mediante la herramienta apple/coreai-models (commit d3382a5) y orientada al flujo de formas estáticas de iOS. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos propios, sino de un artefacto de despliegue que empaqueta los pesos del modelo original de Google en un formato optimizado para ejecutarse en el Neural Engine de dispositivos Apple.

La conversión aplica cuantización agresiva: pesos en 4 bits con paletización, embeddings en 8 bits y embeddings por capa almacenados en un fichero sidecar separado. El resultado es un repositorio de 3,8 GB que incluye dos escalones de contexto (1024 y 8192 tokens) y una torre de visión con dos resoluciones (384 px con 64 tokens suaves y 768 px con 256 tokens suaves).

Su relevancia es acotada pero concreta: permite llevar un modelo de la familia Gemma 4 con capacidades multimodales a aplicaciones iOS nativas sin depender de servidores remotos, a costa de asumir el proceso de especialización en el dispositivo en la primera carga. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it; formato de despliegue Apple Core AI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 y 8192 tokens (escalera de contexto) |
| Tipos de cuantizacion | 4 bits paletizado en pesos, 8 bits en embeddings, embeddings por capa en fichero sidecar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeto a los terminos de licencia del modelo original) |
| Formato de pesos | Apple Core AI (artefacto compilado para Core AI; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto no documenta arquitectura propia: hereda la del modelo base google/gemma-4-E2B-it, sobre el que no se aportan detalles de capas, atención ni composición del dataset en la información disponible. Lo que sí se describe es el proceso de conversión: se utiliza apple/coreai-models en el commit d3382a5 para generar un grafo de formas estáticas compatible con el flujo de iOS, con los pesos cuantizados a 4 bits paletizados y los embeddings a 8 bits. Los embeddings por capa se separan en un fichero sidecar, lo que reduce el tamaño del artefacto principal a costa de gestionar un fichero adicional en el empaquetado de la aplicación.

Una particularidad técnica relevante es que el modelo no llega pre-especializado: la especialización para el Neural Engine se ejecuta en el dispositivo durante la primera carga. Esto implica que el primer arranque tiene un coste adicional de compilación y que el rendimiento en inferencia depende del hardware concreto del dispositivo Apple. La torre de visión se ofrece en dos configuraciones (384 px / 64 tokens suaves y 768 px / 256 tokens suaves), lo que permite ajustar el coste computacional de las tareas multimodales. No se dispone de información sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo instructivo google/gemma-4-E2B-it.
- Procesamiento de imágenes mediante torre de visión, con dos resoluciones configurables (384 px y 768 px).
- Razonamiento y respuesta a instrucciones en formato chat (sufijo "it" del modelo base).
- Ejecución local en dispositivos Apple a través de Core AI, sin dependencia de API remota.
- Soporte de contexto hasta 8192 tokens en el escalón superior de la escalera de contexto.
- Tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en iOS: el escalón de 8192 tokens permite mantener historiales de conversación extensos sin salir del dispositivo, lo que resulta adecuado para aplicaciones de productividad o atención al usuario con requisitos de privacidad.
- Análisis de imágenes en local: la torre de visión a 384 px (64 tokens suaves) sirve para tareas ligeras como clasificación o descripción breve, mientras que la configuración de 768 px (256 tokens suaves) cubre lectura de documentos o extracción de detalles visuales.
- Procesamiento de documentos en el dispositivo: con 8K de contexto se pueden ingerir contratos, correos o notas y generar resúmenes o respuestas sin enviar datos a la nube, un escenario habitual en sectores regulados.
- Funciones de accesibilidad: descripción de imágenes de la cámara o del carrete para usuarios con discapacidad visual, aprovechando la torre de visión y la inferencia local para preservar la privacidad de las fotos.
- Prototipado de apps de IA generativa en el ecosistema Apple: el artefacto Core AI con formas estáticas permite a desarrolladores evaluar el comportamiento de Gemma 4 en iPhone o iPad antes de decidir una integración en producción.
- Transcripción y resumen de notas de voz combinadas con capturas: al aceptar entrada de imagen y texto, el modelo puede integrarse en flujos donde el usuario adjunta una foto y pide una explicación o un resumen contextualizado.
- Moderación o clasificación de contenido en el borde: con contexto de 1024 tokens y cuantización de 4 bits, el modelo puede ejecutar tareas de clasificación de baja latencia en el propio dispositivo sin coste de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el artefacto está pensado para el Neural Engine de Apple. El repositorio ocupa 3,8 GB, lo que da una referencia del espacio de almacenamiento necesario en el dispositivo.
- GPU recomendadas: no disponible; el destino son chips Apple (A-series y M-series) compatibles con Core AI.
- ¿Cabe en hardware de consumo? Sí, por diseño: la conversión está orientada a iOS y a dispositivos Apple, no a GPU de escritorio.
- Opciones de despliegue: Apple Core AI mediante apple/coreai-models; no se mencionan vLLM, llama.cpp, Ollama ni TGI como vías de ejecución de este artefacto.
- Latencia y throughput: no disponibles. La especialización en el Neural Engine ocurre en la primera carga, por lo que el primer arranque será más lento que las ejecuciones posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bezowaczern/gemma4-e2b-coreai-8k | no disponible | 1024 / 8192 | Apple Core AI | no disponible (sujeta al modelo original) | HuggingFace, 0 descargas |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (formato original) | terminos de Gemma | HuggingFace (modelo base) |
| Otras conversiones Core AI de modelos pequenos | no disponible | no disponible | Apple Core AI | variable | no disponible en la informacion |

La comparación directa con alternativas de la misma categoría (conversiones Core AI de modelos pequeños) no está disponible en la información proporcionada. El modelo base google/gemma-4-E2B-it es la referencia natural, pero no se han facilitado sus especificaciones completas.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; el autor remite a los términos del modelo original, por lo que el uso comercial exige verificar la licencia de google/gemma-4-E2B-it.
- La cuantización a 4 bits paletizados y 8 bits en embeddings puede degradar la calidad respecto al modelo base en tareas sensibles a precisión, como matemáticas o código.
- El contexto máximo es de 8192 tokens, inferior al de muchas alternativas actuales; además, el escalón de 1024 tokens limita aún más las conversaciones largas si se elige por rendimiento.
- La especialización en el Neural Engine ocurre en el dispositivo en la primera carga, lo que introduce una latencia inicial y hace que el rendimiento varíe según el chip.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- El repositorio no registra descargas ni validación comunitaria; conviene tratarlo como un artefacto experimental y validar su comportamiento antes de usarlo en producción.
- El formato Apple Core AI no es portable a otros entornos de inferencia; no se puede cargar con vLLM, llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bezowaczern/gemma4-e2b-coreai-8k
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Herramienta de conversión: https://github.com/apple/coreai-models
