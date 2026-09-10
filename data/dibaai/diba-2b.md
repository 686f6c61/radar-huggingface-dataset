# DibaAi/Diba-2B

## Resumen

Diba-2B es un modelo de lenguaje pequeño y bilingüe (persa e inglés) desarrollado por el equipo de investigación de Dibachain, una empresa de inteligencia artificial con sede en Mashhad y oficina registrada en Dubái. El modelo está diseñado para dos tareas principales: responder con precisión sobre la historia y la cultura de Irán, y convertir instrucciones en persa en código web funcional (JavaScript, TypeScript, HTML y CSS). Su propuesta de valor es ofrecer una solución ligera, totalmente iraní y ejecutable en hardware doméstico sin GPU, con una versión cuantizada de aproximadamente 1,2 GB que alcanza unos 18 tokens por segundo en una CPU de cuatro núcleos.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado como compatible con la librería `transformers` y está disponible en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. La documentación no detalla la arquitectura interna ni las características técnicas del entrenamiento, como el número exacto de parámetros, la longitud de contexto o la composición del dataset, por lo que parte de la información técnica no está disponible. Aun así, su orientación a un nicho lingüístico y cultural concreto lo convierte en una opción relevante para aplicaciones en persa y para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo causal de lenguaje, compatible con `transformers`) |
| Parametros totales | ~2B según la denominacion del autor |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso con llama.cpp emplea una ventana de 4096 tokens) |
| Tipos de cuantizacion | Q4_K_M (GGUF) segun la documentacion |
| Idiomas soportados | Persa (fa), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y pesos compatibles con `transformers` (formato de almacenamiento no especificado) |

## Arquitectura y entrenamiento

La documentacion publicada no incluye detalles sobre la arquitectura del modelo, el proceso de entrenamiento, el numero de tokens utilizados ni la composicion del dataset. Se sabe que Diba-2B es un modelo de lenguaje causal para generacion de texto, con soporte de plantillas de chat (`apply_chat_template`), y que se distribuye en versiones cuantizadas y compatibles con el ecosistema de llama.cpp. No se mencionan innovaciones tecnicas destacables, como decodificacion especulativa, atencion lineal o tecnicas de alineacion mediante RLHF o DPO. Cualquier especificacion mas alla de lo indicado deberia considerarse no disponible.

## Capacidades

- Generacion de texto en persa e ingles con estilo conversacional y correccion ortografica en persa, incluido el uso adecuado de ZWNJ (nimespace), digitos persas y signos de puntuacion.
- Conocimiento de historia y cultura de Iran, desde la Persia antigua hasta la actualidad, incluyendo dinastias, acontecimientos, personajes, literatura y cultura, con fechas precisas.
- Programacion web a partir de instrucciones en persa: puede generar codigo JavaScript, Node.js, TypeScript, React, HTML y CSS, con soporte para interfaces de derecha a izquierda (RTL).
- Ejecucion ligera y offline: la version cuantizada Q4_K_M ocupa alrededor de 1,2 GB y funciona en una CPU de cuatro nucleos a aproximadamente 18 tokens por segundo.
- Compatibilidad con herramientas de inferencia locales como llama.cpp, Ollama y LM Studio, ademas de la libreria `transformers`.
- Soporte multilingue limitado a persa e ingles, con enfoque preeminente en el persa.

## Casos de uso

- Asistente para desarrolladores web iranies: el modelo convierte instrucciones coloquiales en persa en codigo JavaScript o TypeScript listo para ejecutar, lo que agiliza el prototipado de aplicaciones web locales.
- Generacion de interfaces web con soporte RTL: al entender peticiones en persa, puede producir HTML y CSS con direccion de texto correcta de derecha a izquierda, util para sitios destinados al publico irani.
- Educacion sobre historia de Iran: responde preguntas sobre dinastias, fechas y personajes historicos con un tono amigable y preciso, lo que sirve para aplicaciones educativas, guias turisticas y chatbots culturales.
- Creacion de contenido cultural en persa: puede redactar articulos, descripciones y resenas sobre la historia y la literatura persa, manteniendo la correccion ortografica y el estilo conversacional.
- Asistencia en entornos de computacion en el borde (edge) sin GPU: gracias a su tamano reducido y su formato GGUF, es adecuado para ejecutarse en dispositivos de bajo consumo como Raspberry Pi, routers o mini-PCs.
- Chatbot bilingue ligero para servicios de informacion general: en un servidor modesto, puede atender consultas en persa e ingles sobre temas iranies, sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor ha anunciado en el model card que los resultados de evaluacion se actualizaran con cada version, e incluye dos metricas previstas: 40 preguntas sobre historia de Iran con correccion humana y 20 tareas de codificacion web con pruebas automaticas, ambos marcados como "coming with release" (pendientes de publicacion). No hay datos numericos, comparaciones con otros modelos ni medidas de rendimiento publicadas.

## Requisitos de hardware

- La version cuantizada Q4_K_M ocupa aproximadamente 1,2 GB, por lo que necesita al menos esa cantidad de RAM para cargar el modelo, mas el overhead del runtime.
- No se requiere GPU: el modelo esta disenado para ejecutarse en CPU. El autor indica un rendimiento de ~18 tokens por segundo en una CPU de cuatro nucleos.
- No se especifican GPUs recomendadas ni requisitos de VRAM para una ejecucion acelerada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y `transformers` (desde Python).
- La latencia y el throughput en otros entornos o con otras cuantizaciones no estan documentados; el unico dato disponible es la velocidad de ~18 tokens/s en CPU de cuatro nucleos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. La documentacion del autor no incluye benchmarks frente a otros modelos, ni se proporcionan datos sobre modelos de la misma categoria, tamano o proposito. Por tanto, esta seccion es no disponible.

## Limitaciones y advertencias

- Puede cometer errores en preguntas de tipo estadistico y factual fuera del ambito de la historia de Iran; el propio autor recomienda revisar la salida en aplicaciones sensibles.
- Su capacidad de generacion de codigo se centra exclusivamente en el ecosistema web: JavaScript, TypeScript, HTML y CSS. No es un asistente especializado en otros lenguajes de programacion ni en tareas de back-end complejas.
- La licencia Apache 2.0 permite el uso comercial sin restricciones adicionales, pero el modelo incluye una carga cultural y linguistica especifica que puede limitar su utilidad fuera del contexto irani.
- No se documentan sesgos conocidos ni se proporciona una evaluacion de riesgos de alucinacion, mas alla de la advertencia general del autor.
- La arquitectura, el preentrenamiento y los datos de entrenamiento no se detallan, lo que dificulta la evaluacion de limitaciones derivadas de sesgos de datos o de tecnicas de alineacion.

## Enlaces

- Hugging Face: https://huggingface.co/DibaAi/Diba-2B
- Sitio web de Dibachain: https://dibachain.ir
- Ejemplo de uso con llama.cpp: mencionado en el model card, sin enlace directo disponible.
