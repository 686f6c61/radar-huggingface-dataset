# kjarni-ai/Llama-3.2-3B-Instruct

## Resumen

Llama-3.2-3B-Instruct es un modelo de lenguaje de 3.212.749.824 parametros desarrollado por Meta y publicado en septiembre de 2024. Este repositorio concreto, alojado por kjarni-ai, es una copia byte a byte de los pesos originales de Meta (revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`), redistribuida para su uso con el runtime Kjarni sin necesidad de cuenta ni token de Hugging Face. No se trata de un fine-tuning ni de una modificacion: los unicos cambios son el README y un fichero `NOTICE` anadido.

El modelo es un transformer denso (no MoE) de 3.21 mil millones de parametros, ajustado para dialogo mediante instrucciones. Soporta una ventana de contexto de hasta 128.000 tokens y esta oficialmente entrenado para ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes. Su relevancia practica reside en que ofrece un equilibrio entre capacidad conversacional y requisitos de hardware modestos, pudiendo ejecutarse en CPU o en GPU de gama media.

La aportacion diferencial de este repositorio no esta en el modelo en si, sino en el ecosistema de despliegue: Kjarni proporciona bindings nativos en Python, Rust, C#, C++ (C++23) y linea de comandos, sin runtime de Python ni servicio en la nube, con soporte opcional de GPU y de cuantizacion 4-bit via GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), familia Llama 3.2 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4-bit GGUF (via bartowski/Llama-3.2-3B-Instruct-GGUF); pesos originales en safetensors |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (repo de 6,4 GB); GGUF para cuantizacion 4-bit |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer densa de la familia Llama 3.2, con 3.212.749.824 parametros. Al ser una redistribucion sin modificaciones del checkpoint de Meta, la arquitectura, los datos de entrenamiento y el proceso de ajuste (incluido el alineamiento por instrucciones) son exactamente los del modelo original `meta-llama/Llama-3.2-3B-Instruct`. La model card de este repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion debe consultarse en la model card oficial de Meta.

La innovacion tecnica destacable en este repositorio no es de arquitectura sino de empaquetado y ejecucion: el runtime Kjarni (version 0.8.3 o posterior) permite cargar los pesos safetensors de forma nativa desde Python, Rust, C#, C++ o CLI, con opcion de ejecucion en GPU (`--gpu` / `device="gpu"`) y de cuantizacion 4-bit (`--gguf` / `quantized=True`), que reduce el consumo de memoria y acelera la generacion en CPU. No se documentan en la informacion disponible tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, ajustado para dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas; el ejemplo de la model card demuestra explicaciones concisas de conceptos tecnicos.
- Generacion de codigo y explicaciones tecnicas (capacidad heredada del modelo base de Meta).
- Capacidades multilingues en ocho idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Manejo de contexto largo de hasta 128.000 tokens.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en este modelo.

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede gestionar dialogos multi-turno en CPU o GPU modesta gracias a sus 3,21 mil millones de parametros y al runtime nativo de Kjarni, sin necesidad de cuenta ni servicio en la nube.
- Atencion al cliente automatizada: con 128.000 tokens de contexto puede mantener conversaciones largas con historial extenso, adecuado para soporte tecnico con contexto acumulado.
- Generacion y explicacion de codigo en entornos de desarrollo: util para autocompletado, explicacion de fragmentos y respuestas tecnicas dentro de herramientas de escritorio integradas via los bindings de Rust, C# o C++.
- Procesamiento de documentos largos multilingues: la ventana de 128.000 tokens permite resumir o extraer informacion de documentos extensos en cualquiera de los ocho idiomas soportados.
- Prototipado rapido de aplicaciones de IA: los bindings nativos en Python, Rust, C#, C++ y CLI facilitan la integracion en proyectos sin dependencia de un runtime de Python ni de infraestructura cloud.
- Despliegue en entornos con recursos limitados o air-gapped: el modelo descarga una sola vez (6,4 GB) y se ejecuta localmente, apto para escenarios donde no se permite enviar datos a servicios externos.
- Educacion y demostraciones tecnicas: el ejemplo de la model card (explicar una tabla hash en una frase) ilustra su uso para respuestas didacticas concisas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la model card oficial de Meta para consultar benchmarks, datos de entrenamiento y evaluaciones de seguridad.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con pesos safetensors el repo ocupa 6,4 GB, por lo que la inferencia en precision completa requiere aproximadamente esa cifra de memoria mas overhead. La cuantizacion 4-bit GGUF reduce el consumo a una fraccion de esa cantidad.
- GPU recomendadas: no especificadas en la informacion disponible. El modelo esta disenado para ejecutarse en "CPU o una GPU modesta" segun la model card.
- Cabe en GPU de consumo: si, segun la model card el modelo esta pensado para GPU modestas y CPU; con cuantizacion 4-bit es viable en GPUs de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: runtime Kjarni (CLI, Python, Rust, C#, C++), con soporte de GPU (`--gpu`) y cuantizacion 4-bit (`--gguf`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles. La model card indica que la cuantizacion 4-bit "genera mas rapido en CPU", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kjarni-ai/Llama-3.2-3B-Instruct (este) | 3.212.749.824 | 128.000 | Llama 3.2 Community License | Hugging Face, runtime Kjarni nativo |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.824 | 128.000 | Llama 3.2 Community License | Hugging Face (requiere cuenta/token) |
| bartowski/Llama-3.2-3B-Instruct-GGUF | 3.212.749.824 | 128.000 | Llama 3.2 Community License | Hugging Face (formato GGUF cuantizado) |

Las tres alternativas corresponden al mismo modelo base; las diferencias estriban en el empaquetado, el formato de pesos y el metodo de acceso. No se dispone de datos de benchmarks para comparar rendimiento numerico entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una copia sin modificaciones del modelo de Meta, hereda todos los sesgos y riesgos del modelo original; la model card no documenta sesgos especificos.
- Riesgo de alucinacion inherente a los modelos de 3 mil millones de parametros; no se han publicado evaluaciones de fidelidad en este repositorio.
- El contexto maximo es de 128.000 tokens, pero el rendimiento en contextos muy largos no esta verificado en la informacion disponible.
- El soporte multilingue se limita oficialmente a ocho idiomas; el rendimiento fuera de ellos no esta garantizado.
- La licencia Llama 3.2 Community License impone restricciones de uso comercial y obliga a cumplir la Acceptable Use Policy de Meta (`USE_POLICY.md`); es necesario revisar ambas antes de un despliegue en produccion.
- Kjarni y este alojamiento no estan afiliados ni respaldados por Meta.
- El repositorio no incluye el checkpoint original de PyTorch (carpeta `original/` omitida), lo que puede limitar flujos que dependan de ese formato.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kjarni-ai/Llama-3.2-3B-Instruct
- Modelo base oficial de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Pesos GGUF 4-bit (bartowski): https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
- Documentacion y sitio de Kjarni: https://kjarni.ai
- Script de instalacion de Kjarni: https://kjarni.ai/install.sh
