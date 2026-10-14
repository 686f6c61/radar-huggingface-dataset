# IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF

## Resumen

LFM2.5-24B-A2B APEX-I NanoPlus GGUF es una cuantizacion comunitaria del modelo LiquidAI/LFM2.5-24B-A2B, publicada por el usuario IsValorum bajo la libreria GGUF y orientada a ejecucion local en hardware de gama de consumo. El modelo base es un Mixture-of-Experts (MoE) de 23.971.587.712 parametros totales (aproximadamente 24B) con solo 2B parametros activos por token, desarrollado por Liquid AI, y con una ventana de contexto nativa de 128.000 tokens.

La aportacion de esta ficha concreta es la receta de cuantizacion APEX-I NanoPlus: un archivo de 8,15 GB (7,59 GiB de pesos) calibrado con una importance matrix generada por m9ter1a sobre conversaciones reales de tool calling y corpus de prosa, lo que reduce el peso desde los 47,96 GB del BF16 original a cambio de una perdida de precision controlada por tipo de tensor. La relevancia practica es que permite desplegar un modelo MoE de 24B con contexto de 128K en maquinas sin GPU de datacenter.

El resultado es un artefacto pensado para inferencia en el edge y en estaciones de trabajo con llama.cpp, con especial enfasis en razonamiento, uso de herramientas y generacion de texto multilingue en 17 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE con columna vertebral de convoluciones 1D: 40 capas, de las cuales 30 usan convolucion corta 1D (O(1) de estado) y 10 son capas de atencion completa distribuidas cada 4 bloques |
| Parametros totales | 23.971.587.712 (aproximadamente 24B) |
| Parametros activos | Aproximadamente 2B por token (designacion A2B) |
| Longitud de contexto | 128.000 tokens (nativa, segun el autor) |
| Tipos de cuantizacion | Mezcla por tensor: F32 (207 tensores), Q4_K (97), IQ3_XXS (42), IQ2_S (34), IQ2_XXS (34), Q6_K (10), Q3_K (4); 428 tensores en total |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other), heredada del modelo base |
| Formato de pesos | GGUF (unico archivo; libreria llama.cpp) |
| Tamano del repositorio | 8,2 GB; archivo 8,15 GB; huella de pesos 7,59 GiB |

## Arquitectura y entrenamiento

El modelo base es un MoE hibrido de Liquid AI: de las 40 capas del backbone, 30 emplean convoluciones cortas 1D con cacheo de estado O(1), lo que da una latencia de primer token muy baja y un coste de memoria constante al crecer el contexto. Las 10 capas restantes son atencion completa, intercaladas cada 4 bloques, y actuan como anclaje periodico para mantener coherencia en horizontes largos de hasta 128.000 tokens. El router del MoE se guarda en F32 en esta cuantizacion para evitar derivas en la seleccion de expertos.

La cuantizacion de IsValorum se construyo con una importance matrix (imatrix.gguf) generada por m9ter1a sobre conversaciones autenticas de tool calling renderizadas con la plantilla de chat nativa del modelo, mas un corpus de prosa. La asignacion de precision es heterogenea: los expertos frontera (capas 2, 3, 38 y 39) y los expertos nucleares en la proyeccion down usan IQ3_XXS; las proyecciones gate y up de los expertos nucleares (capas 4 a 37) bajan a IQ2_S e IQ2_XXS; las cabezas de atencion usan Q4_K y Q6_K; y routers, normas, sesgos y kernels de convolucion permanecen en F32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en 17 idiomas, incluyendo espanol, ingles, arabe, chino, japones, coreano, hindi, thai, vietnamita e indonesio.
- Razonamiento explicito: las etiquetas del repositorio incluyen `reasoning`, y el modelo esta descrito como especialista en razonamiento on-device.
- Tool calling y function calling: el modelo esta optimizado para uso autonomo de herramientas, con resultados destacados en BFCL v4 y LiveClaw segun la model card.
- Flujos agenticos multi-paso: soporte declarado para cadenas de llamadas a herramientas con contexto largo.
- Generacion de codigo y matematicas: incluido en las evaluaciones agenticas, de codigo y matematicas citadas por el autor.
- Latencia constante en la mayor parte de la pila: 30 de 40 capas con estado O(1), lo que reduce el coste de decodificacion en contextos largos.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.
- Empaquetado listo para endpoints compatibles con OpenAI segun las etiquetas del repositorio (`endpoints_compatible`).

## Casos de uso

- Asistentes de atencion al cliente multi-turno: con 128.000 tokens de contexto, el modelo puede mantener el historial completo de una conversacion larga y consultar herramientas internas (estado de pedido, CRM) mediante function calling sin perder el hilo.
- Agentes autonomos de automatizacion de oficina: encadenamiento de llamadas a APIs y ejecucion de tareas multi-paso (agendar, enviar correo, generar informe) gracias a las capacidades de tool calling y al bajo coste por token de los 2B parametros activos.
- Despliegue local en portatiles y equipos de sobremesa: el archivo de 8,15 GB cabe en GPUs de consumo con 8-12 GB de VRAM y en configuraciones de CPU con 16 GB de RAM, lo que permite trabajar sin conexion y sin enviar datos a terceros.
- Asistencia de programacion en el editor: generacion y explicacion de fragmentos de codigo con contexto de repositorio largo, aprovechando la ventana de 128K para incluir varios ficheros relevantes.
- Razonamiento y resolucion de problemas matematicos en entornos educativos: el modo de razonamiento permite obtener trazas intermedias, util para tutoria paso a paso en local.
- Traduccion y procesamiento multilingue: cobertura de 17 idiomas, adecuada para normalizar tickets, correos o documentacion en pipelines internos sin depender de servicios en la nube.
- Procesamiento de documentos extensos: resumen y extraccion de entidades sobre contratos, informes o transcripciones que superan la ventana de modelos densos de 8K-32K.
- Prototipado rapido en llama.cpp u Ollama: al ser un unico fichero GGUF con plantilla de chat incluida, se integra en scripts de prueba y entornos de investigacion en minutos.

## Benchmarks y rendimiento

Los unicos datos numericos concretos presentes en la informacion proporcionada corresponden a la comparacion con Qwen3.6-35B-A3B en LiveClaw:

| Evaluacion | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (tool use autonomo) | 48,09 | 38,19 |
| BFCL v4 | no disponible (citado como resultado destacado, sin cifra) | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

La model card del cuantizador reproduce ademas dos figuras de Liquid AI (benchmarks generales y velocidad de inferencia en edge y GPU) sin desglosar los valores numericos en texto, por lo que no se pueden tabular aqui. El autor afirma una mejora de velocidad de hasta 1,7x frente a alternativas densas o dispersas de mayor tamano en dispositivos edge, pero no se aporta la metodologia de medicion.

## Requisitos de hardware

- VRAM estimada: el archivo ocupa 8,15 GB y los pesos en memoria 7,59 GiB. Sumando cache KV y buffers de llama.cpp, un despliegue tipico parte de unos 9-10 GB y crece con la longitud de contexto; no se dispone de cifras oficiales de consumo por contexto en la informacion proporcionada.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 8 GB el encaje es ajustado y puede requerir descargar capas a CPU o reducir contexto.
- GPU profesionales: A100, H100, L40S y similares ejecutan el modelo con margen de sobra y permiten lotes grandes.
- CPU y memoria RAM: al ser un MoE de 24B, la RAM necesaria es la de todos los pesos, aproximadamente 8-9 GB mas overhead; es viable en equipos con 16 GB de RAM y recomendable 32 GB.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp y bindings de llama-cpp-python. vLLM y TGI no estan optimizados para este GGUF concreto; para esos motores es preferible partir de los pesos del modelo base.
- Latencia y throughput: no hay cifras publicadas para esta cuantizacion especifica. La arquitectura declara latencia constante en 30 de 40 capas y una mejora de hasta 1,7x en edge frente a alternativas, sin datos medidos reproducibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B APEX-I NanoPlus (esta ficha) | 23,97B | ~2B | 128K | GGUF, 8,15 GB | lfm1.0 | Version de menor huella; expertos nucleares en IQ2 |
| LFM2.5-24B-A2B APEX-I MiniPlus V2.1 | 23,97B | ~2B | 128K | GGUF, 9,64 GB | lfm1.0 | Edicion equilibrada del mismo autor; expertos edge en Q3_K |
| LiquidAI/LFM2.5-24B-A2B (BF16) | 23,97B | ~2B | 128K | safetensors, 47,96 GB | lfm1.0 | Modelo base oficial; calidad de referencia |
| Qwen3.6-35B-A3B | no disponible (referido como 35B con 3B activos) | ~3B | no disponible | no disponible | no disponible | Usado como referencia en LiveClaw: 38,19 frente a 48,09 |

## Limitaciones y advertencias

- Es una cuantizacion comunitaria, no oficial: Liquid AI no la respalda ni la mantiene. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta y fue creado el 2026-10-13, una fecha anomala que conviene verificar antes de confiar en el artefacto.
- La cuantizacion introduce degradacion respecto al BF16 original. Las proyecciones gate y up de los expertos nucleares se almacenan en IQ2_S e IQ2_XXS, precisiones agresivas que pueden afectar a tareas de razonamiento fino y a la fidelidad en idiomas minoritarios.
- Riesgo de alucinacion inherente a los modelos de lenguaje y agravado por la cuantizacion de baja precision en los expertos. En produccion conviene validar salidas con verificacion externa o RAG.
- Cobertura de idiomas desigual: aunque se declaran 17 idiomas, el rendimiento real en espanol, arabe, hindi o thai no esta cuantificado en la informacion disponible.
- Licencia lfm1.0 (license: other): no es una licencia de codigo abierto estandar. Antes de cualquier uso comercial es obligatorio revisar el texto enlazado por el autor y verificar las condiciones de atribucion y de uso que impone Liquid AI.
- El endpoint y las etiquetas `endpoints_compatible` no garantizan compatibilidad con infraestructura propietaria concreta; hay que probar la plantilla de chat y el formato de tool calling antes de integrarlo.
- Coste de memoria en contexto largo: aunque el backbone convolucional tiene estado O(1), las 10 capas de atencion completa mantienen cache KV que crece con la longitud de contexto; no hay mediciones publicadas para 128K en esta cuantizacion.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni procesos de alineacion del modelo base.
- Los resultados de busqueda web devueltos para esta consulta no contienen informacion tecnica relevante sobre el modelo, por lo que no se han podido contrastar de forma independiente los datos de la model card.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Importance matrix utilizada: https://huggingface.co/m9ter1a/LFM2.5-24B-A2B-GGUF
- Edicion alternativa APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Coleccion APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Coleccion APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Apoyo al autor de la cuantizacion: https://ko-fi.com/isvalorum
- Benchmarks del modelo base (imagen): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/resolve/main/figures/LFM2.5-24B-A2B-benchmark.png
- Velocidad de inferencia en edge y GPU (imagen): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/resolve/main/figures/LFM2.5-24B-A2B-edge-inference.png
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
- Repositorio de codigo del modelo base: no disponible en la informacion proporcionada
