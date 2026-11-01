# cloudkites/bilby-onco-demo

## Resumen

Bilby Onco es un prototipo de investigación desarrollado por CloudKites AI Lab, publicado en HuggingFace bajo el identificador `cloudkites/bilby-onco-demo`. El repositorio no contiene pesos de modelo descargables de forma convencional: es un espacio de demostración que aloja vídeos grabados por la propia aplicación, en los que el sistema responde a preguntas sobre un caso de cáncer de mama fundamentándose en las guías NCCN para cáncer de mama. El modelo lee el caso, recorre las páginas del diagrama de flujo de la guía y muestra los registros originales de la guía junto con la página de procedencia, tras lo cual un pequeño selector de registros escoge los más relevantes para la pregunta formulada.

La relevancia del proyecto reside en su enfoque de recuperación aumentada sobre documentación clínica estructurada (diagramas de flujo de guías oncológicas) con trazabilidad explícita a la página de origen, lo que resulta poco habitual en demos de modelos médicos. No se dispone de información sobre arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento; la model card se centra exclusivamente en la demostración funcional y en las advertencias de uso.

El autor declara explícitamente que se trata de un prototipo de investigación, que no es un dispositivo médico, que no está validado para uso clínico y que no debe emplearse para informar decisiones de atención al paciente. El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés y vietnamita (según los vídeos de demostración; no se especifica el conjunto completo) |
| Licencia | other (research use only, según la model card) |
| Formato de pesos | no disponible (el repositorio contiene vídeos MP4 de demostración, no pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente (transformer, MoE, híbrido u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card describe únicamente el comportamiento funcional del sistema: lectura del caso clínico, recorrido de las páginas del diagrama de flujo de la guía NCCN de cáncer de mama, presentación de los registros de la guía con su número de página y selección posterior de los registros más relevantes mediante un "pequeño selector de registros". Este componente de selección sugiere un pipeline de recuperación sobre documentos estructurados, pero no se detalla si emplea embeddings, un reranker o un segundo modelo generativo.

Los únicos datos técnicos indirectos disponibles provienen de las descripciones de las grabaciones: en Windows, con una NVIDIA RTX PRO 2000 Blackwell de 16 GB y todos los modelos cargados en GPU, la generación alcanza unos 35 tokens por segundo y la selección de registros tarda aproximadamente 5 segundos; en MacBook Pro M5 Pro, con los modelos en la GPU de Apple, la selección tarda unos 2 segundos; en Linux, sobre un Minisforum MS-A2 con Ryzen 9 9955HX y ejecución exclusiva en CPU, la selección tarda unos 12 segundos. Estos tiempos implican la ejecución de varios modelos o componentes en cadena, pero no permiten inferir el tamaño de ninguno de ellos.

## Capacidades

- Respuesta a preguntas sobre un caso clínico de cáncer de mama fundamentada en las guías NCCN para cáncer de mama.
- Recorrido de las páginas del diagrama de flujo de la guía y presentación de los registros originales con referencia a la página de procedencia.
- Selección de los registros más relevantes para la pregunta del usuario ("Most relevant to your question"), mostrados después de la respuesta junto con el tiempo empleado.
- Trazabilidad documental: cada registro mostrado incluye su página de origen en la guía.
- Interfaz multilingüe en inglés y vietnamita, según las grabaciones publicadas.
- Ejecución completamente local ("fully on the computer"), sin dependencia aparente de servicios en la nube.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Demostración de recuperación aumentada sobre guías clínicas: el sistema sirve como ejemplo reproducible de cómo recorrer un diagrama de flujo de una guía oncológica y citar la página exacta de cada registro recuperado, útil para equipos que diseñan asistentes documentales en dominios regulados.
- Evaluación de pipelines de selección de registros: el componente selector, con latencias medidas de 2 s en Apple GPU, 5 s en GPU NVIDIA y 12 s en CPU, permite comparar estrategias de reranking en hardware heterogéneo.
- Referencia para trazabilidad en respuestas médicas: al mostrar la página de la guía junto a cada registro, el sistema ilustra un patrón de citación verificable aplicable a otros dominios con documentación normativa extensa.
- Estudio de despliegue local en hardware de consumo y profesional: las grabaciones documentan ejecución en una RTX PRO 2000 Blackwell de 16 GB, en un MacBook Pro M5 Pro y en CPU sobre un Ryzen 9 9955HX, lo que resulta útil para planificar requisitos de entornos sin conectividad.
- Material didáctico sobre uso responsable de IA en oncología: las advertencias explícitas de la model card (no es dispositivo médico, no validado clínicamente) pueden emplearse como ejemplo de comunicación de límites en prototipos de investigación.
- Base para demos multilingües: las versiones en inglés y vietnamita permiten estudiar el comportamiento del sistema en dos idiomas sobre el mismo caso sintético.
- Prototipado de interfaces de consulta sobre casos clínicos ficticios: el caso empleado en las grabaciones está generado por un script, lo que facilita reproducir la demo sin datos reales de pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas operativas observadas durante las grabaciones: aproximadamente 35 tokens por segundo de generación en Windows con GPU NVIDIA, unos 5 segundos de selección de registros en ese mismo equipo, unos 2 segundos de selección en MacBook Pro M5 Pro y unos 12 segundos de selección en CPU (Ryzen 9 9955HX). No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluación clínica alguna.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; las grabaciones indican 16 GB de VRAM en GPU NVIDIA (RTX PRO 2000 Blackwell) con todos los modelos cargados en GPU, pero no se especifica cuánta memoria ocupa cada componente.
- GPU recomendadas según la model card: NVIDIA RTX PRO 2000 Blackwell (16 GB) en Windows; GPU integrada de Apple en MacBook Pro M5 Pro.
- Ejecución en CPU: documentada en un Minisforum MS-A2 con Ryzen 9 9955HX, con selección de registros en torno a 12 segundos.
- ¿Cabe en GPU de consumo? No disponible; no se indica el tamaño de los modelos ni se mencionan tarjetas de la gama RTX consumer.
- Opciones de despliegue: no se especifican frameworks (vLLM, llama.cpp, Ollama, TGI); la model card solo indica ejecución local en Mac, Linux y Windows.
- Latencia y throughput conocidos: unos 35 tokens por segundo de generación y unos 5 segundos de selección en el equipo Windows con GPU NVIDIA; unos 2 segundos de selección en Apple GPU; unos 12 segundos de selección en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la arquitectura, el tamaño ni el pipeline del modelo, ni menciona alternativas comparables de la misma categoría. Cualquier comparación con modelos médicos o de recuperación documental exigiría datos que la model card no ofrece.

## Limitaciones y advertencias

- Uso exclusivo de investigación: la model card declara "RESEARCH USE ONLY"; el sistema no es un dispositivo médico, no está validado para uso clínico y no debe informar la atención al paciente.
- Licencia "other": no se detallan los términos concretos; no se confirma permisividad para uso comercial.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; el sistema mitiga parcialmente el riesgo mostrando los registros originales de la guía con su página, pero no se reporta ninguna evaluación de fidelidad.
- Cobertura limitada: la demostración se circunscribe a un único caso de cáncer de mama basado en las guías NCCN; no se indica soporte para otros tipos de tumor ni otras guías.
- Idiomas: solo se documentan inglés y vietnamita en las grabaciones; no se especifica el conjunto completo de idiomas soportados.
- Dependencia de terceros: el contenido de las NCCN Guidelines se muestra tal como lo presenta la aplicación; NCCN y NCCN Guidelines son marcas de la National Comprehensive Cancer Network, y Bilby Onco no está afiliado ni respaldado por NCCN.
- Repositorio sin pesos: el espacio contiene vídeos de demostración (0,1 GB), no artefactos de modelo descargables, y no registra descargas ni likes.
- Casos sintéticos: el caso empleado en las grabaciones está inventado y escrito por un script, por lo que las demostraciones no constituyen evidencia de rendimiento sobre datos reales.

## Enlaces

- HuggingFace: https://huggingface.co/cloudkites/bilby-onco-demo
- Vídeo Windows, inglés: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-windows-en.mp4
- Vídeo Windows, vietnamita: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-windows-vi.mp4
- Vídeo macOS, inglés: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-macos-en.mp4
- Vídeo macOS, vietnamita: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-macos-vi.mp4
- Vídeo Linux, inglés: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-linux-en.mp4
- Vídeo Linux, vietnamita: https://huggingface.co/cloudkites/bilby-onco-demo/resolve/main/demo/bilby-onco-0.1.0-linux-vi.mp4
- Papers, blogs, repositorios de código o demos interactivas: no disponible en la información proporcionada.
