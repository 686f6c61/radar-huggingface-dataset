# mradermacher/MiniCPM5-2B-Supertool-i1-GGUF

## Resumen

MiniCPM5-2B-Supertool-i1-GGUF es una cuantizacion en formato GGUF del modelo saidutta69/MiniCPM5-2B-Supertool, un ajuste fino orientado a tool calling y function calling sobre la familia MiniCPM5 de 2B parametros. El trabajo de cuantizacion lo firma mradermacher, autor habitual de releases GGUF (incluidos los quants con imatrix), que en este caso publica una version "i1" generada con matriz de importancia. El modelo base se entrena con QLoRA y esta pensado para agentes y flujos tipo Claude Code.

La relevancia de esta ficha esta en que se trata de una pieza de infraestructura practica: un modelo pequeno (1.552.110 parametros reportados en los safetensors del repo base, cifra que no cuadra con el nombre "2B" y que conviene tratar con cautela) empaquetado en GGUF para ejecucion local en CPU o GPU modesta. La licencia Apache 2.0 y el enfasis en function calling lo hacen candidato para prototipos de agentes sin coste de API.

No se dispone de model card detallada del autor original en la informacion proporcionada, ni de resultados de benchmarks, ni de especificaciones de contexto o composicion del dataset de entrenamiento mas alla de los nombres de los datasets citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de MiniCPM5, transformer) |
| Parametros totales | 1.552.110 (segun safetensors del repo base; el nombre comercial indica 2B, dato no confirmado) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos del repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido; el repo base usa safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y la familia a la que pertenece, se trata de un transformer decoder-only de la serie MiniCPM5, pero no se confirman capas, dimensiones ocultas, tipo de atencion ni estrategia de tokenizacion. El ajuste fino del modelo base se realizo con QLoRA, segun las etiquetas del repo, y esta orientado especificamente a tool calling, function calling y agentes, con mencion explicita a flujos tipo Claude Code.

Los datasets de entrenamiento citados son saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, ambos sin detalle publico en la informacion proporcionada sobre numero de tokens, composicion o proceso de filtrado. No se indica si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado. La cuantizacion i1 de mradermacher se genera con matriz de importancia (imatrix), lo que suele mejorar la perplejidad de los quants de baja precision respecto a los estaticos.

## Capacidades

- Generacion de texto en ingles.
- Tool calling y function calling: el modelo esta entrenado especificamente para emitir llamadas a herramientas estructuradas.
- Soporte para agentes: orientado a flujos multi-paso y a entornos de tipo Claude Code.
- Razonamiento: los datasets de entrenamiento incluyen un conjunto filtrado de razonamiento ("Max-Reasoning"), lo que sugiere capacidad de cadena de pensamiento, aunque no se documenta el modo thinking de forma explicita.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Vision, audio y otras modalidades: no disponibles.
- No se documentan capacidades de codigo ni matematicas de forma especifica.

## Casos de uso

- Prototipado de agentes locales: al ser un GGUF pequeno con soporte de function calling, permite montar un agente en una maquina de desarrollo sin GPU dedicada y validar el bucle de herramientas antes de pasar a un modelo mayor.
- Automatizacion de tareas de desarrollo tipo Claude Code: el modelo esta ajustado para emitir llamadas a herramientas de edicion, lectura de ficheros y ejecucion de comandos, por lo que encaja en asistentes de terminal o IDE.
- Enrutado de herramientas en pipelines: usar el modelo como clasificador/emisor de llamadas a funciones en un sistema mayor, donde el modelo grande solo se invoca tras la decision de herramienta.
- Asistentes de soporte tecnico con acceso a APIs: el function calling permite consultar estado de pedidos, tickets o documentacion mediante herramientas externas en lugar de generar la respuesta de memoria.
- Ejecucion en entornos con recursos limitados: al distribuirse en cuantizaciones desde IQ1 hasta Q6_K, puede desplegarse en portatiles, Raspberry Pi o contenedores sin GPU.
- Experimentacion academica con QLoRA y cuantizacion: sirve como caso de estudio de como un ajuste QLoRA sobre 2B se comporta tras cuantizacion agresiva con imatrix.
- Base para ajustes posteriores: al ser Apache 2.0 y de tamano reducido, es viable reentrenarlo o adaptarlo a dominios concretos con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano de fichero, un modelo de ~2B en Q4_K_M ocupa del orden de 1,2-1,5 GB y en Q8 del orden de 2-2,5 GB; estas cifras son estimaciones genericas, no datos del repo.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer con 4-8 GB de VRAM deberia poder ejecutar las cuantizaciones medias y altas.
- Cabe en GPU consumer: previsiblemente si (GTX 1060 6 GB, RTX 3060, RTX 4060 y superiores), aunque no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repo base usa transformers y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo ingles: el campo `language` del repo declara unicamente `en`, por lo que el rendimiento en castellano no esta garantizado.
- Discrepancia de parametros: el nombre indica 2B pero los safetensors del repo base reportan 1.552.110 parametros. Conviene verificar el modelo base antes de asumir capacidades.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tool calling, razonamiento o generacion.
- Riesgo de alucinacion: inherente a modelos pequenos; en tareas de agente puede emitir llamadas a herramientas inexistentes o con argumentos incorrectos.
- Cuantizaciones muy agresivas (IQ1, IQ2): degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y de los datasets de entrenamiento por si imponen condiciones adicionales.
- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad.
- Fecha de creacion futura (2026-11-19): el metadato del repo es anomalo y sugiere que la informacion puede no estar consolidada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-i1-GGUF
- Modelo base: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool
- Quants estaticos: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-i1-GGUF
- Dataset de entrenamiento 1: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset de entrenamiento 2: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
