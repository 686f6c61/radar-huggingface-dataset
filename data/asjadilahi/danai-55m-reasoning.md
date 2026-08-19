# asjadilahi/danAI-55M-Reasoning

## Resumen

danAI-55M-Reasoning es un modelo de lenguaje pequeño (SLM) de 54,5 millones de parámetros desarrollado por Asjad Ilahi, diseñado específicamente para llevar capacidades de razonamiento, seguimiento de instrucciones y ejecución agéntica a dispositivos de bajo consumo como móviles, Raspberry Pi, microcontroladores y Apple Silicon. Su nombre proviene de la palabra urdu "Dānā" (دانا), que significa "sabio" o "inteligente", y busca demostrar que es posible combinar eficiencia extrema con inteligencia agéntica sin necesidad de modelos de varios gigabytes.

El modelo destaca por su huella de memoria de solo 104 MB, lo que permite ejecutarlo sin cuantización agresiva en hardware edge, y por su capacidad nativa de tool calling con una tasa de invocación del 100%, emitiendo bloques JSON estructurados `<tool_call>` para delegar operaciones matemáticas exactas a una calculadora o consultas en tiempo real a un buscador web. Además, incorpora un modo de razonamiento paso a paso mediante etiquetas ` thinking` antes de generar la respuesta final.

Según la model card del autor, el modelo supera en varios benchmarks de ciencia a modelos más grandes como Pythia-70M y GPT-2 Small, a pesar de tener menos parámetros y ocupar menos memoria. Está entrenado sobre aproximadamente 3 mil millones de tokens y licenciado bajo Apache 2.0, lo que facilita su adopción en proyectos comerciales y de investigación. Es relevante ahora porque aborda la demanda creciente de IA en el borde, donde la privacidad, la latencia y el consumo energético son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 54.538.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que no requiere cuantizacion agresiva) |
| Idiomas soportados | ingles, urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la informacion disponible, pero por su tamano y naturaleza se trata de un transformer denso clasico. El entrenamiento se realizo mediante un curriculo hibrido multi-etapa que duro aproximadamente dos dias. La primera fase consistio en un pre-entrenamiento inicial en un Mac M1 con 16 GB de RAM durante 7.000 a 8.000 pasos usando el backend `mps` con micro-batching. Posteriormente, el entrenamiento a gran escala se traslado a una NVIDIA RTX 4070 Super durante aproximadamente 92.000 pasos sobre un corpus curado de unos 3 mil millones de tokens compuesto por libros de texto cientificos, matematicas, codigo e instrucciones conversacionales limpias.

La innovacion tecnica mas destacable es la fusion SLERP (Spherical Linear Interpolation), que combina manifolds especializados de razonamiento y de capacidades agénticas para eliminar la interferencia entre tareas. Ademas, se aplico una alineacion final de una sola epoca con restricciones negativas estrictas (como responder "NO" a ciertas entradas) y el formato de etiquetas ` thinking` para el razonamiento paso a paso. El modelo tambien incorpora tool calling nativo con invocacion automatica de herramientas externas para calculo exacto y busqueda web.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en ingles y urdu.
- Razonamiento paso a paso mediante cadenas de pensamiento (chain-of-thought) con etiquetas ` thinking`.
- Tool calling nativo: emite bloques JSON `<tool_call>` para delegar operaciones matematicas exactas a una calculadora y consultas en tiempo real a un buscador web, con una tasa de invocacion del 100%.
- Capacidades agénticas: puede orquestar flujos de automatizacion en el borde, como control de dispositivos o consultas a APIs externas.
- Asistencia basica en codigo y descomposicion de problemas aritmeticos multi-paso.
- Soporte multilingue limitado a ingles y urdu.

## Casos de uso

- Asistentes de voz y texto offline en moviles: el modelo puede ejecutarse localmente en un telefono con solo 104 MB de RAM, permitiendo asistentes personales que no requieren conexion a internet, con respuestas de razonamiento paso a paso y delegacion de calculos a herramientas internas.
- Automatizacion agéntica en IoT: en dispositivos de domotica o robótica, el modelo puede interpretar comandos, planificar secuencias de acciones y llamar a funciones de control de hardware mediante su tool calling nativo, todo con latencia reducida y sin enviar datos a la nube.
- Asistente de matematicas y codigo local: para estudiantes o desarrolladores en entornos sin conexion, el modelo descompone problemas aritmeticos complejos y genera fragmentos de codigo Python sencillos, apoyandose en su calculadora interna para resultados exactos.
- Consulta de informacion en tiempo real en el borde: al integrarse con una herramienta de busqueda web, el modelo puede responder preguntas que requieren datos actualizados (clima, precios, noticias) emitiendo llamadas a la API de busqueda y resumiendo los resultados.
- Prototipado rapido de agentes conversacionales: gracias a su licencia Apache 2.0 y su tamano reducido, es adecuado para desarrollar y probar pipelines de tool calling y razonamiento en entornos de desarrollo locales antes de escalar a modelos mayores.
- Despliegue en Raspberry Pi y microcontroladores: para proyectos educativos o de investigacion en el borde, el modelo cabe en la memoria de estos dispositivos y permite experimentar con SLM agénticos sin necesidad de hardware especializado.

## Benchmarks y rendimiento

La model card del autor proporciona una tabla comparativa evaluada sobre el 100% de las muestras oficiales de test y validacion (mas de 20.000 preguntas). Los resultados se presentan a continuacion:

| Modelo | Parametros activos | Escala de entrenamiento | GSM8K (directo) | Herramientas agénticas | ARC-Challenge | ARC-Easy | ARC (media) | MMLU | Huella RAM | PIQA |
|---|---|---|---|---|---|---|---|---|---|---|
| danAI-55M-Reasoning | 54.5M | ~3B tokens | 3.0% | 100.0% (nativo) | 25.2% | 39.2% | 32.2% | 27.4% | 104 MB | 56.1% |
| Pythia-70M (EleutherAI) | 70M | 300B tokens | 0.0% | 0.0% | 18.1% | 37.4% | 27.8% | 25.1% | 140 MB | 59.5% |
| GPT-2 Small (OpenAI) | 124M | 40B tokens | 0.0% | 0.0% | 21.4% | 35.8% | 28.6% | 26.2% | 248 MB | 63.3% |
| MobileLLM-125M (Meta AI) | 125M | 1.000B tokens | 0.5% | 0.0% | 27.7% | 45.5% | 36.6% | - | 250 MB | 64.6% |
| SmolLM-135M (Hugging Face) | 135M | 600B tokens | 1.0% | 0.0% | - | - | 42.4% | 30.2% | 270 MB | 68.4% |
| SmolLM2-135M (Hugging Face) | 135M | 2.000B tokens | 1.4% | 0.0% | - | - | 43.9% | 31.5% | 270 MB | 68.4% |

Nota: el guion "-" indica que el dato no fue publicado por los autores de esos modelos. Los resultados de GSM8K son muy bajos en todos los casos, lo que refleja la dificultad de esta tarea para modelos de menos de 150M de parametros.

## Requisitos de hardware

- Huella de RAM estimada: 104 MB en precision nativa, sin necesidad de cuantizacion agresiva.
- GPU recomendadas: el modelo se entreno en una NVIDIA RTX 4070 Super, por lo que cualquier GPU con al menos 8 GB de VRAM puede ejecutar inferencia sin problemas. Tambien funciona en Apple Silicon (M1 y superiores) mediante el backend MPS.
- Compatibilidad con hardware de consumo: cabe en Raspberry Pi, microcontroladores modernos y telefonos moviles de gama media.
- Rendimiento: se reporta una velocidad superior a 55 tokens por segundo en MPS (Apple Silicon).
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con frameworks estandar como Transformers de Hugging Face, o convertirse a GGUF para su uso con llama.cpp u Ollama en CPU. Tambien es compatible con vLLM o TGI para despliegue en servidores, aunque su tamano lo hace mas adecuado para inferencia local.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya incluye la comparativa principal. En resumen:

| Modelo | Parametros | Contexto | ARC-Easy | MMLU | Licencia | Formato |
|---|---|---|---|---|---|---|
| danAI-55M-Reasoning | 54.5M | no disponible | 39.2% | 27.4% | Apache 2.0 | safetensors |
| Pythia-70M | 70M | 2048 (conocido) | 37.4% | 25.1% | Apache 2.0 | safetensors |
| GPT-2 Small | 124M | 1024 | 35.8% | 26.2% | MIT | safetensors |
| SmolLM-135M | 135M | 2048 | 42.4% (ARC avg) | 30.2% | Apache 2.0 | safetensors |

El modelo de 54.5M supera a Pythia-70M y GPT-2 en ARC-Easy, ARC-Challenge y MMLU, aunque queda por detras de los modelos de 125M-135M de Meta y Hugging Face en estos benchmarks. Su ventaja principal es el tool calling nativo y el razonamiento agéntico, capacidades ausentes en las alternativas comparadas.

## Limitaciones y advertencias

- La model card se corta en la seccion de limitaciones ("Long-For..."), por lo que no se dispone de informacion completa sobre las restricciones del modelo en generacion de textos largos u otros aspectos.
- El rendimiento en GSM8K es muy bajo (3.0%), lo que indica que el modelo no es fiable para resolver problemas aritmeticos complejos sin delegar en herramientas externas.
- Los benchmarks publicados son proporcionados por el propio autor y no han sido verificados de forma independiente por la comunidad; conviene replicarlos antes de tomar decisiones criticas.
- El modelo solo soporta ingles y urdu, por lo que no es adecuado para aplicaciones multilingue mas amplias.
- No se especifica la longitud de contexto, lo que supone una incertidumbre para tareas que requieran ventanas largas.
- Al ser un modelo de 54.5M de parametros, su capacidad de razonamiento general es limitada en comparacion con modelos de cientos de miles de millones de parametros; es adecuado para tareas acotadas en el borde, no para razonamiento complejo de proposito general.
- No se mencionan sesgos especificos, pero al estar entrenado con un corpus cientifico y de codigo, puede tener sesgos relacionados con la falta de diversidad en datos sociales o culturales.
- Riesgo de alucinacion: como cualquier modelo pequeno, puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su corpus de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/asjadilahi/danAI-55M-Reasoning
- No se han encontrado otros enlaces (papers, repositorios, demos) en la busqueda web realizada.
