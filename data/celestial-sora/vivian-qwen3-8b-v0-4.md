# celestial-sora/Vivian-Qwen3-8B-v0.4

## Resumen

Vivian-Qwen3-8B-v0.4 es un ajuste fino (fine-tune) del modelo Qwen3-8B en su variante ya cuantizada a 4 bits publicada por Unsloth (`unsloth/Qwen3-8B-unsloth-bnb-4bit`). Lo publica el usuario `celestial-sora` en HuggingFace, mientras que la model card atribuye el desarrollo a `suphloek`. Se distribuye con licencia Apache 2.0, en formato safetensors y con la libreria transformers, y la unica lengua declarada es el ingles.

El modelo cuenta con 8.190.735.360 parametros reales segun los safetensors del repositorio (16,4 GB de peso total), por lo que se situa en la categoria de modelos densos de ~8B, el rango que hoy se considera desplegable en una sola GPU de gama alta o incluso de consumo con cuantizacion agresiva. La model card es minima: unicamente indica que el entrenamiento se hizo con Unsloth y la libreria TRL de HuggingFace, sin detallar el dataset, el numero de tokens ni el procedimiento de alineamiento.

Es relevante ahora por dos motivos practicos: Qwen3-8B es una base solida y con licencia permisiva para derivados, y el pipeline de Unsloth permite reproducir ajustes finos con la mitad de memoria y aproximadamente el doble de velocidad que un entrenamiento estandar, lo que abarata la creacion de variantes especializadas. Ahora bien, dado que el repositorio no documenta datos de entrenamiento, benchmarks ni caso de uso previsto, cualquier evaluacion en produccion debe hacerse por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3; no detallada en la model card) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica safetensors (~16,4 GB). El modelo base de partida estaba cuantizado con bitsandbytes 4-bit |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga via transformers) |

Datos adicionales del repositorio: ID `celestial-sora/Vivian-Qwen3-8B-v0.4`, pipeline `text-generation`, tags `qwen3`, `text-generation-inference`, `unsloth`, `conversational`, `endpoints_compatible`, `region:us`. Descargas y likes registrados: 0. Fecha de creacion registrada: 2026-09-29; ultima actualizacion: 2026-09-29.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla del nombre del modelo base. Al derivar de Qwen3-8B, se trata de un transformer decoder-only denso, no de una variante MoE: la familia Qwen3 reserva la arquitectura de mezcla de expertos para los modelos 30B-A3B y 235B-A22B, mientras que el 8B es denso. La model card no aporta el numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos adicionales de atencion. La longitud de contexto nativa tampoco se declara en el repositorio, por lo que no puede confirmarse sin inspeccionar la configuracion del modelo.

En cuanto al entrenamiento, la unica informacion documentada es que se realizo un fine-tune sobre `unsloth/Qwen3-8B-unsloth-bnb-4bit` utilizando Unsloth y TRL, con el reclamo de ser "2x faster" que un entrenamiento convencional. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF, DPO o SFT con anotacion humana. Al partir de una version pre-cuantizada a 4 bits con bitsandbytes, es probable que el ajuste se hiciera con QLoRA (adaptadores de bajo rango sobre una base cuantizada), pero esto es una inferencia razonable a partir del nombre del modelo base, no un dato confirmado en la model card.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere uso orientado a dialogo, aunque no se documentan plantillas de chat propias ni formato de prompt esperado.
- Razonamiento y generacion de codigo: heredadas del modelo base Qwen3-8B, pero no verificadas ni documentadas para este fine-tune.
- Soporte de tool calling / function calling: no disponible como dato confirmado; depende de si el fine-tune ha preservado las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio, pese a que Qwen3 base es multilingue. El ajuste puede haber degradado idiomas no ingleses.
- Capacidad de "thinking mode": Qwen3 introduce modos de razonamiento explicito, pero no hay confirmacion de que se hayan conservado en este fine-tune.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Compatibilidad con Text Generation Inference: el tag `text-generation-inference` y `endpoints_compatible` indica que el repositorio esta preparado para desplegarse con TGI y con los Inference Endpoints de HuggingFace.

## Casos de uso

- Asistente conversacional en ingles: puede emplearse como chatbot de proposito general en ingles, aprovechando el ajuste sobre una base de 8B; requiere validacion previa del formato de chat, que no esta documentado.
- Generacion de texto creativo y redaccion asistida: la naturaleza de fine-tune conversacional lo hace apto para borradores, resumenes y reformulacion en ingles, siempre que se valide la calidad con un conjunto de evaluacion propio.
- Prototipado rapido en local: con 8,19B de parametros, se puede servir en una unica GPU de consumo mediante cuantizacion, lo que lo hace util para pruebas de concepto y entornos de desarrollo sin presupuesto de infraestructura.
- Base para nuevos ajustes finos: al ser un derivado ya entrenado con Unsloth y con licencia Apache 2.0, sirve como punto de partida para especializaciones posteriores por dominio (legal, sanitario, tecnico) sin restricciones de licencia para uso comercial.
- Despliegue detras de una API compatible con TGI: el tag `endpoints_compatible` permite integrarlo en arquitecturas de microservicio con OpenAI-compatible endpoints, util para equipos que ya tienen estandarizada esa interfaz.
- Experimentacion academica sobre fine-tuning eficiente: util como caso de estudio de QLoRA con Unsloth, dado que el pipeline completo es reproducible con una sola GPU.
- Tareas de clasificacion y extraccion mediante prompting: aunque no esta ajustado especificamente para ello, un modelo de 8B puede usarse para etiquetado de texto, extraccion de entidades y clasificacion por prompt en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web recuperados no contienen informacion tecnica sobre este modelo. Tampoco se declaran evaluaciones del modelo base dentro del repositorio.

## Requisitos de hardware

- VRAM estimada en la inferencia (calculada a partir de los 8,19B de parametros, no son cifras publicadas por el autor): aproximadamente 16,4 GB en bf16/fp16 (coincide con el tamano del repo), alrededor de 8-9 GB en cuantizacion de 8 bits y aproximadamente 5-6 GB en cuantizacion de 4 bits, mas el overhead de la cache KV.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB. En bf16 cabe holgadamente en cualquier GPU con 24 GB o mas.
- GPU de consumo: si cabe en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB en bf16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) solo con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers de forma nativa (formato safetensors), Text Generation Inference (tag explicito `text-generation-inference`) y los Inference Endpoints de HuggingFace (`endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publica un repositorio GGUF.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna del modelo principal proceden del repositorio de HuggingFace. Los de los modelos comparados se basan en la documentacion publica de sus respectivos fabricantes y no en la informacion proporcionada en esta busqueda, por lo que deben verificarse antes de usarse en una decision de compra o despliegue.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Disponibilidad |
|---|---|---|---|---|---|
| Vivian-Qwen3-8B-v0.4 | 8,19B (denso) | no disponible | apache-2.0 | safetensors | HuggingFace, 0 descargas |
| Qwen3-8B (base) | 8,2B (denso) | 32.768 tokens nativos, ampliable con YaRN | apache-2.0 | safetensors, GGUF | Muy extendida |
| Llama 3.1 8B Instruct | 8,03B (denso) | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Muy extendida |
| Mistral 7B Instruct v0.3 | 7,25B (denso) | 32.000 tokens | apache-2.0 | safetensors, GGUF | Muy extendida |
| Gemma 2 9B Instruct | 9,24B (denso) | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Muy extendida |

La diferencia practica principal no esta en el rendimiento, que no se ha medido, sino en la madurez del ecosistema: los modelos comparados cuentan con versiones GGUF oficiales o de terceros consolidadas, documentacion detallada y comunidades activas, mientras que este fine-tune es un repositorio recien publicado, sin descargas ni evaluaciones conocidas.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card no describe dataset, hiperparametros, tokens de entrenamiento, formato de prompt ni evaluaciones. Es un riesgo alto para uso en produccion sin una evaluacion propia previa.
- Riesgo de alucinacion: inherente a los modelos de 8B sin alineamiento documentado; no hay informacion sobre RLHF, DPO o filtros de seguridad aplicados.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o sesgo de representacion.
- Limitacion idiomatica: el campo `language` declara unicamente ingles. El uso en castellano no esta soportado oficialmente y probablemente degrade la calidad respecto al modelo base multilingue.
- Contexto desconocido: al no confirmarse la longitud de contexto, no se puede planificar el uso con documentos largos ni con historiales conversacionales extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el usuario debe conservar el aviso de licencia y no puede reclamar endoso. Conviene verificar tambien la licencia del modelo base original (Qwen3, tambien Apache 2.0) y las condiciones de la version pre-cuantizada de Unsloth.
- Trazabilidad de autoria confusa: el repositorio pertenece a `celestial-sora`, mientras que la model card atribuye el desarrollo a `suphloek`. No hay repositorio de codigo, paper ni informe tecnico asociado.
- Fecha de creacion registrada como 2026-09-29, posterior a la fecha de consulta habitual; conviene confirmar la vigencia del repositorio antes de referenciarlo.
- Ausencia de GGUF: no hay versiones cuantizadas listas para llama.cpp u Ollama, lo que obliga a convertir los pesos manualmente si se quiere desplegar en CPU o en GPUs con poca VRAM.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento del analisis, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/celestial-sora/Vivian-Qwen3-8B-v0.4
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl

Nota sobre la busqueda web: los resultados recuperados (Divine Skins, Celestial Launcher, Celestyal Cruises, letra de "Celestial" de Ed Sheeran) no guardan ninguna relacion con este modelo y no aportan informacion tecnica utilizable. No se han encontrado papers, blogs, demos ni repositorios asociados a Vivian-Qwen3-8B-v0.4.
