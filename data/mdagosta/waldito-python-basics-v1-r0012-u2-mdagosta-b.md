# mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta-b

## Resumen

mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta-b es un checkpoint de generacion de texto construido sobre la arquitectura estandar Llama causal-language-model de la libreria Transformers, con un tokenizer de bytes propio ("schema-1") que obliga a cargarlo con `trust_remote_code=True`. Con 9.541.632 parametros reales declarados en los pesos safetensors, se trata de un modelo de escala muy reducida, tres ordenes de magnitud por debajo de los modelos pequenos habituales (135M-1B), y el repositorio ocupa 0.0 GB.

El autor, mdagosta, lo publica como un "OpenWALDO model export", es decir, como artefacto de exportacion de un pipeline propio (OpenWALDO) que incluye ficheros de inventario (`BOM.json`) y un mapeo de divulgacion de contenido de entrenamiento alineado con el reglamento europeo de GPAI (`EU-BOM.json`). El nombre del repositorio sugiere un ajuste orientado a contenidos basicos de Python, aunque la model card no documenta el dataset ni el proceso de entrenamiento.

Su relevancia es limitada como modelo de proposito general: no es competitivo en tareas de razonamiento o codigo frente a modelos de mayor tamano. Su interes es practico y de trazabilidad: sirve como pieza minima para validar flujos de exportacion, tokenizacion a nivel de byte, integracion con `text-generation-inference` y pipelines compatibles con endpoints, y para probar mecanismos de inventario de artefactos (BOM) en despliegues con requisitos de documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal-language-model (transformer decoder-only) de la libreria Transformers |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos safetensors sin variantes cuantizadas declaradas (no se han encontrado ficheros GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card y los metadatos de HuggingFace no especifican licencia) |
| Formato de pesos | safetensors (carga via Transformers) |
| Tokenizer | schema-1 de bytes propio de OpenWALDO; requiere `trust_remote_code=True` |
| Archivos auxiliares | `BOM.json` (inventario de release), `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento GPAI) |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es la del Llama causal-language-model estandar de Transformers, es decir, un transformer decoder-only con atencion causal. No se documenta ninguna innovacion estructural (no hay indicios de MoE, SSM, atencion lineal ni decodificacion especulativa). La particularidad tecnica destacable es el tokenizer: un esquema de tokenizacion a nivel de byte ("schema-1") que no forma parte del ecosistema estandar de Transformers, lo que obliga a ejecutar codigo remoto del repositorio al instanciar el tokenizer; esto implica que la ventana de contexto efectiva y el vocabulario dependen por completo de esa implementacion y no son deducibles de los metadatos publicados.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card se limita a describir el formato de exportacion y los ficheros de trazabilidad. El sufijo del nombre (`python-basics-v1-r0012-u2`) sugiere una version de ajuste sobre contenidos basicos de Python, pero se trata de una inferencia a partir del nombre del repositorio, no de un dato documentado.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`) sobre la arquitectura Llama.
- Modo conversacional declarado en los tags del repositorio (`conversational`).
- Tokenizacion a nivel de byte mediante esquema propio; capacidad de manejar alfabetos y bytes arbitrarios si la implementacion del tokenizer es correcta.
- Compatibilidad con despliegues basados en `text-generation-inference` y con el tag `endpoints_compatible`.
- Trazabilidad de artefactos mediante `BOM.json` y `EU-BOM.json`.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponible; no se declara cobertura de idiomas.

## Casos de uso

- Pruebas de integracion de pipelines Transformers: su tamano (9.54M de parametros) permite cargarlo, ejecutarlo y descargarlo en segundos dentro de baterias de tests automatizados que validen versiones de la libreria, serializacion safetensors o carga con `trust_remote_code`.
- Validacion de tokenizers a nivel de byte: util para verificar que una implementacion de tokenizacion schema-1 reconstruye correctamente secuencias de bytes, maneja caracteres fuera del repertorio latino y no pierde informacion en la decodificacion.
- Demostracion educativa de un transformer decoder-only completo: al ser un modelo minimo, permite inspeccionar pesos, capas y dimensiones en un portatil sin GPU, algo inviable con modelos de 1B o superiores.
- Servicio de inferencia de bajo coste en entornos embebidos: con menos de 40 MB en fp32 puede ejecutarse en CPU, en una Raspberry Pi o en un contenedor con limites estrictos de memoria, para tareas de generacion de texto trivial o de relleno en demos.
- Prueba de flujos de cumplimiento y trazabilidad: los ficheros `BOM.json` y `EU-BOM.json` permiten ensayar un proceso de inventario de artefactos y divulgacion de contenido de entrenamiento antes de aplicarlo a modelos de mayor tamano.
- Entorno de pruebas para TGI y endpoints compatibles: sirve para validar configuracion de servidores de inferencia, esquemas de peticion/respuesta y salud del servicio sin consumir recursos de GPU.
- Base para experimentos de ajuste sobre dominios muy concretos (por ejemplo, sintaxis basica de Python) partiendo de un checkpoint ya especializado, aunque no se documenta el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision razonable. Calculo aproximado sobre 9.541.632 parametros: ~38 MB en fp32, ~19 MB en fp16/bf16, ~10 MB en int8 y ~5 MB en int4, mas el overhead de activaciones, KV cache y runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria dedicada; tambien es viable en CPU exclusivamente.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050, RTX 3060, RTX 4090, etc.), aunque el modelo no aprovechara la capacidad de calculo de las tarjetas de gama alta.
- Despliegue: Transformers (libreria declarada), text-generation-inference (tag del repositorio) y servicios compatibles con el tag `endpoints_compatible`. No hay ficheros GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa y verificacion del tokenizer byte-level. No se ha confirmado soporte en vLLM.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia muy baja en CPU moderna, pero no hay cifras publicadas.
- Almacenamiento: menos de 100 MB de disco para pesos y ficheros auxiliares.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales conocidas de alternativas publicas de tamano comparable o superior. Las cifras de terceros son datos publicos de referencia y deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| waldito-python-basics-v1-r0012-u2-mdagosta-b | 9,54M | no disponible | no disponible | Tokenizer byte-level propio; requiere `trust_remote_code` |
| SmolLM-135M | 135M | no disponible en esta ficha | Apache-2.0 (referencia publica) | Modelo pequeno de proposito general |
| TinyLlama-1.1B | 1,1B | 2048 (referencia publica) | Apache-2.0 (referencia publica) | Ajustado para instrucciones; tamano muy superior |
| Qwen2.5-0.5B | 0,49B | 32768 (referencia publica) | Apache-2.0 (referencia publica) | Multilingue; tamano muy superior |

No hay benchmarks comparables publicados para el modelo objeto de esta ficha, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Capacidad muy limitada: 9,54M de parametros no permiten razonamiento complejo, generacion de codigo fiable ni conversaciones largas y coherentes; es probable que el modelo produzca texto gramaticalmente pobre o incoherente en prompts abiertos.
- Sesgos conocidos: no disponibles. No hay documentacion sobre el dataset ni sobre evaluaciones de sesgo, por lo que se deben asumir riesgos no cuantificados.
- Riesgo de alucinacion: alto y no medido. No hay evaluaciones publicadas de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y depende del tokenizer schema-1; no se declara ningun idioma soportado.
- Licencia: no disponible. Al no especificarse licencia, no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Ejecucion de codigo remoto: la carga del tokenizer con `trust_remote_code=True` implica ejecutar codigo Python del repositorio. Debe auditarse ese codigo antes de usarlo en entornos de produccion o con datos sensibles.
- Metadatos incompletos: sin descargas, sin likes, sin idiomas declarados, sin licencia y con un unico commit de actualizacion en la misma fecha de creacion; no hay evidencia de mantenimiento ni de validacion externa.
- Repositorio de 0.0 GB: conviene verificar que todos los ficheros necesarios (pesos, configuracion y codigo del tokenizer) estan efectivamente disponibles antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0012-u2-mdagosta-b
- `BOM.json` (inventario de ficheros de release): referenciado en la model card, dentro del repositorio
- `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento GPAI): referenciado en la model card, dentro del repositorio
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada
