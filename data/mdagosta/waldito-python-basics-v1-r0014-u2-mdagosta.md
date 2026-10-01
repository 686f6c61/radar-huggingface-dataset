# mdagosta/waldito-python-basics-v1-r0014-u2-mdagosta

## Resumen
El modelo `waldito-python-basics-v1-r0014-u2-mdagosta` es un export de la familia OpenWALDO publicado por el usuario mdagosta en HuggingFace. Se trata de un modelo de generacion de texto causal basado en la arquitectura Llama estandar de Transformers, con un total de 9.541.632 parametros (aproximadamente 9,5 millones), lo que lo situa en la categoria de modelos ultraligeros. El repositorio no registra descargas ni "likes" en el momento de la consulta y fue creado el 30 de septiembre de 2026.

El modelo emplea el tokenizer de bytes "schema-1" propio de OpenWALDO, que requiere cargarse con `trust_remote_code=True`. Segun la model card, el paquete incluye un fichero `BOM.json` que inventaria todos los ficheros de la release y un `EU-BOM.json` con el mapeo de divulgacion de contenido de entrenamiento segun el reglamento europeo de GPAI (General Purpose AI).

No se dispone de informacion publica sobre el dataset de entrenamiento, los idiomas soportados, la licencia ni resultados de benchmarks. El nombre del repositorio sugiere un ajuste orientado a "python basics", si bien este extremo no se confirma en la model card y no debe asumirse como dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal-language-model (transformer decoder-only) |
| Parametros totales | 9.541.632 (aprox. 9,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizer | Schema-1 byte tokenizer de OpenWALDO (requiere `trust_remote_code=True`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento
La model card indica que el paquete usa la arquitectura Llama causal-language-model estandar de la libreria Transformers. Se trata, por tanto, de un transformer decoder-only con atencion causal, sin que se documenten variantes como MoE, SSM ni arquitecturas hibridas. El modelo se exporta como un artefacto de la familia OpenWALDO, con un tokenizer de bytes denominado "schema-1" que opera a nivel de byte y que debe cargarse habilitando codigo remoto (`trust_remote_code=True`). Esta eleccion de tokenizer sugiere un vocabulario construido sobre representacion de bytes, si bien la model card no detalla el tamano del vocabulario ni la configuracion de atencion.

No se aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. El repositorio incluye un fichero `EU-BOM.json` que, segun la model card, contiene el mapeo de divulgacion de contenido de entrenamiento exigido por el reglamento europeo de GPAI, ademas de un `BOM.json` con el inventario de ficheros de la release. No se describen innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni mecanismos de razonamiento explicito.

## Capacidades
- Generacion de texto causal: la pipeline declarada es `text-generation`, por lo que el modelo esta orientado a completar y generar texto.
- Conversacion: el tag `conversational` indica soporte previsto para dialogos de tipo chat, aunque no se documenta el formato de plantilla de mensajes.
- Tokenizacion a nivel de byte: el uso del schema-1 byte tokenizer permite en principio procesar secuencias de bytes arbitrarias, lo que facilita manejar textos con caracteres poco frecuentes, aunque esto no garantiza un rendimiento multilingue equilibrado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no disponible.
- Ajuste especifico a "python basics": el nombre del repositorio lo sugiere, pero no esta confirmado en la model card.

## Casos de uso
- Experimentacion con arquitecturas Llama a pequena escala: con 9,5 M de parametros, el modelo cabe en cualquier entorno y sirve para validar pipelines de carga de Transformers, tokenizers personalizados y flujos de `trust_remote_code=True` antes de escalar a modelos mayores.
- Pruebas de integracion del tokenizer OpenWALDO: util para verificar el comportamiento del byte tokenizer "schema-1" en tareas de codificacion y decodificacion de texto, dado que el modelo es ligero y se carga rapidamente.
- Educacion y demostraciones didacticas: adecuado para ilustrar el ciclo completo de inferencia de un transformer decoder-only en cursos o talleres, sin requerir GPU dedicada.
- Generacion de texto acotada en entornos con recursos minimos: al ocupar decenas de MB en memoria, puede desplegarse en dispositivos embebidos, Raspberry Pi o contenedores ligeros para tareas de prototipado.
- Evaluacion de la divulgacion de contenido de entrenamiento: la inclusion de `EU-BOM.json` permite estudiar como se documenta el cumplimiento del reglamento europeo de GPAI en un artefacto de modelo concreto.
- Pruebas de inferencia en CPU con pipelines de Transformers: util para medir latencias base y comparar el coste de un tokenizer de bytes frente a tokenizers BPE convencionales.
- Base para fine-tuning experimental: por su tamano reducido, sirve como punto de partida para tecnicas de ajuste rapido (LoRA, adaptadores) sin requerir hardware especializado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: en float32, los 9.541.632 parametros ocupan aproximadamente 38 MB; en float16, unos 19 MB; en int8, cerca de 9,5 MB; en int4, en torno a 5 MB. Cabe holgadamente en cualquier GPU y en CPU.
- GPU recomendadas: cualquier GPU con al menos 100 MB de VRAM libre es suficiente, incluidas integradas. No se requiere A100, H100 ni RTX 4090; bastan modelos como GTX 1050, RTX 3060 o incluso aceleradores integrados.
- Compatibilidad con consumer GPU: si, cabe con enorme margen en cualquier GPU de consumo e incluso en telefonos o sistemas embebidos.
- Opciones de despliegue: la libreria declarada es `transformers`; los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints estandar. No se confirma soporte para llama.cpp, Ollama, vLLM u otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0014-u2-mdagosta | 9,5 M | no disponible | no disponible | HuggingFace |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | HuggingFace |

El modelo analizado es aproximadamente 14 veces menor que SmolLM-135M y mas de dos ordenes de magnitud menor que Qwen2.5-0.5B y TinyLlama-1.1B. Esa diferencia de escala implica capacidades de razonamiento, conocimiento y generacion sustancialmente mas limitadas. La comparativa debe interpretarse solo como referencia de categoria (modelos ultraligeros), ya que no se dispone de datos de rendimiento del modelo OpenWALDO para confrontarlos.

## Limitaciones y advertencias
- Sesgos conocidos: no disponible; no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Riesgo de alucinacion: previsiblemente alto por el reducido numero de parametros (9,5 M), aunque no se aportan mediciones.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que impide estimar su comportamiento en conversaciones largas o documentos extensos.
- Limitaciones de idioma: no se especifica que idiomas ha visto el modelo; el tokenizer de bytes no garantiza competencia linguistica equilibrada.
- Restricciones de licencia: la licencia figura como "no disponible", por lo que no puede confirmarse el permiso para uso comercial ni las condiciones de redistribucion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Carga con codigo remoto: el tokenizer exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; debe auditarse antes de usarlo en entornos sensibles.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Uso en produccion: no se recomienda como modelo generativo generalista sin una evaluacion previa especifica para la tarea objetivo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0014-u2-mdagosta
- Fichero de inventario de la release (`BOM.json`): referenciado en la model card, dentro del repositorio.
- Fichero de divulgacion de contenido de entrenamiento (`EU-BOM.json`): referenciado en la model card, dentro del repositorio.
- Paper, blog o repositorio adicional de OpenWALDO: no disponible.
- Demos o espacios asociados: no disponible.
