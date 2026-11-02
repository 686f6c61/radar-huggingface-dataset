# maylore-ai/Temper-2-Axon-GGUF

## Resumen

Temper-2-Axon-GGUF es la distribucion en formato GGUF de Temper-2-Axon, un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) especializado en generacion de codigo Rust. Lo desarrolla maylore-ai y se publica bajo licencia Apache 2.0. El repositorio contiene unicamente los pesos cuantizados para inferencia local; los resultados y detalles tecnicos completos se remiten a la pagina del modelo base.

El modelo deriva de Qwen2.5-Coder-1.5B-Instruct, segun se desprende de la nota de licencia de la model card, lo que sitúa su arquitectura en la familia Qwen2.5 (transformer decoder-only). La especializacion declarada es el codigo Rust, un nicho con relativamente pocos modelos dedicados, lo que lo hace relevante para equipos que trabajan con ese lenguaje y necesitan inferencia local en hardware modesto.

La relevancia practica de esta publicacion es que ofrece dos cuantizaciones (Q8_0 y BF16) listas para llama.cpp y Ollama, con un tamano de repositorio de 4,7 GB, lo que permite desplegar el modelo en estaciones de trabajo e incluso en portatiles sin GPU dedicada de gran capacidad. No obstante, la informacion publica disponible es muy escasa: no hay benchmarks, detalles de entrenamiento ni datos de contexto declarados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-1.5B-Instruct, segun la nota de licencia) |
| Parametros totales | 1.543.714.304 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0: 1,65 GB; BF16: 3,09 GB) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la informacion disponible. La model card unicamente indica que se trata de un modelo de 1,5B parametros para codigo Rust y que la licencia es la misma que la de Qwen2.5-Coder-1.5B-Instruct, lo que apunta a que Temper-2-Axon parte de ese modelo base y ha sido ajustado (fine-tuning) para el dominio de Rust. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado.

Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Cualquier afirmacion sobre estos aspectos seria especulativa y no se incluye en esta ficha.

## Capacidades

- Generacion de texto y codigo, con especializacion declarada en Rust.
- Generacion de codigo en el contexto de proyectos Rust (la model card lo etiqueta explicitamente con `rust` y `code`).
- Conversacion multi-turno: el repositorio incluye la etiqueta `conversational` y la pipeline es `text-generation`.
- Soporte multilingue limitado a ingles y ruso, segun los metadatos de idioma.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible; no se declaran.

## Casos de uso

- Asistencia a desarrolladores Rust en local: el modelo puede integrarse en un editor o IDE mediante llama.cpp u Ollama para autocompletar y generar fragmentos de codigo Rust, sin enviar codigo a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Generacion de codigo en pipelines de CI: con solo 1,65 GB en Q8_0, puede ejecutarse en runners modestos para tareas automatizadas de generacion de esqueletos de codigo, pruebas unitarias o documentacion de modulos Rust.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: la cuantizacion Q8_0 permite ejecucion en CPU con llama.cpp, util para equipos que no disponen de aceleradores.
- Educacion y aprendizaje de Rust: el modelo puede explicar y generar ejemplos de codigo Rust en un entorno local, con la ventaja de que el estudiante controla completamente la infraestructura.
- Traduccion tecnica ingles-ruso en contexto de codigo: al declarar soporte para en y ru, puede emplearse para generar documentacion o comentarios bilingues en proyectos Rust.
- Despliegue en entornos aislados o air-gapped: al ser un GGUF de licencia Apache 2.0 y pesos descargables, puede instalarse en sistemas sin acceso a internet, algo relevante en sectores regulados.
- Experimentacion e investigacion: como modelo pequeno y abierto, sirve de base para estudiar fine-tuning sobre dominios especificos de lenguaje de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del modelo base para resultados y detalles, pero esos datos no forman parte de la informacion proporcionada, por lo que no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,65 GB para la cuantizacion Q8_0 y 3,09 GB para BF16, segun los tamanos de fichero publicados (el consumo real de memoria es algo superior por el contexto y el overhead del runtime).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar la version Q8_0 con holgura; para BF16 se recomienda al menos 6 GB. No se dispone de datos especificos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante para Q8_0), y tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-2-Axon-GGUF:Q8_0`) y Ollama (`ollama run hf.co/maylore-ai/Temper-2-Axon-GGUF:Q8_0`, o mediante el `Modelfile` incluido en el repositorio). No se documentan otras opciones como vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Temper-2-Axon-GGUF | 1,54B | no disponible | en, ru | Apache 2.0 | GGUF (Q8_0, BF16) | Especializado en Rust |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (segun la model card) | safetensors y multiples | Modelo base declarado del que deriva |
| Alternativas de codigo de ~1,5B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para una comparacion cuantitativa |

La comparacion con otras alternativas de la misma categoria no puede completarse con datos verificados a partir de la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base general, es previsible que herede sesgos de este, pero no hay datos publicados al respecto.
- Riesgo de alucinacion: no cuantificado; como modelo de 1,5B, la generacion de codigo puede contener errores sutiles de sintaxis o semantica en Rust que requieren revision humana.
- Limitaciones de contexto: la longitud de contexto no se declara en la model card, por lo que no puede garantizarse el manejo de repositorios o ficheros largos.
- Limitaciones de idioma: solo se declaran ingles y ruso; el rendimiento en castellano no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (Qwen2.5-Coder-1.5B-Instruct) si se redistribuye o modifica.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- Documentacion insuficiente para produccion: sin benchmarks, sin datos de entrenamiento y sin especificacion de contexto, no es posible evaluar su calidad frente a alternativas establecidas sin realizar una evaluacion propia.
- Fecha de publicacion futura: los metadatos indican creacion en noviembre de 2026, lo que puede reflejar un error de fecha o un repositorio recien creado; conviene contrastar la informacion antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maylore-ai/Temper-2-Axon-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Axon
- Sitio web del autor: https://maylore.com/temper-2-axon
