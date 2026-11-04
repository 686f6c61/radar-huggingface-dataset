# mradermacher/CyberGemma-3-4b-merged-GGUF

## Resumen

CyberGemma-3-4b-merged-GGUF es la version cuantizada en formato GGUF del modelo CyberGemma-3-4b-merged, un merge publicado por MaestroDev19 sobre la base de Gemma 3 de 4B parametros de Google. Esta ficha concreta la mantiene mradermacher, un conocido generador de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles, que distribuye el modelo en multiples precisiones (desde Q2_K hasta f16) junto con los ficheros mmproj necesarios para el procesamiento multimodal.

El modelo resuelve el problema de desplegar un modelo conversacional de ~3.900 millones de parametros en hardware modesto, incluyendo GPUs de consumo y CPU, manteniendo las capacidades del Gemma 3 original (generacion de texto, razonamiento, vision y contexto largo). Al estar en GGUF, es directamente utilizable con llama.cpp, Ollama, LM Studio y otros runners compatibles, sin necesidad de infraestructura de GPU de datacenter.

La relevancia actual radica en que combina una licencia Apache 2.0 (mas permisiva que la Gemma original), un tamano manejable y una ventana de contexto amplia heredada de Gemma 3, lo que lo hace atractivo para prototipado rapido, aplicaciones de escritorio y despliegues en el borde. No obstante, el modelo es un merge comunitario sin model card detallada ni benchmarks publicados, por lo que su calidad real debe validarse empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Gemma 3) |
| Parametros totales | 3.880.263.168 (~3,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3, no confirmada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para vision) |

## Arquitectura y entrenamiento

El modelo subyacente es un merge comunitario (CyberGemma-3-4b-merged) construido sobre Gemma 3 4B, un transformer decoder-only de Google con atencion por ventanas deslizantes y atencion global alternadas, disenado para contexto largo y capacidades multimodales. Al ser un merge, no existe informacion publica sobre el proceso exacto de fusion de pesos, los datasets utilizados ni si hubo fases de RLHF o DPO adicionales. La model card del cuantizador no aporta detalles de entrenamiento; unicamente confirma que se trata de cuantizaciones estaticas del modelo original, generadas con la herramienta de mradermacher y etiquetadas con `unsloth` y `gemma3`.

La innovacion tecnica destacable en esta ficha es la propia cuantizacion GGUF: se ofrecen tanto cuantizaciones K-quant como IQ (IQ4_XS), lo que permite ajustar el equilibrio entre calidad y tamano. Los ficheros mmproj (Q8_0 y f16) preservan el proyector multimodal para el procesamiento de imagenes. No se dispone de informacion sobre decodificacion especulativa, atencion lineal u otras optimizaciones especificas del merge.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Gemma 3.
- Razonamiento y respuesta a instrucciones en ingles.
- Procesamiento multimodal de imagenes mediante los ficheros mmproj incluidos (vision).
- Capacidad de contexto largo potencial (heredada de Gemma 3), aunque no confirmada para este merge concreto.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo, con ~3,9B parametros y cuantizaciones desde 1,8 GB (Q2_K), puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Aplicaciones de escritorio con privacidad: al desplegarse via llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en escenarios con requisitos de confidencialidad (documentos internos, notas personales).
- Procesamiento de imagenes en el borde: los ficheros mmproj permiten describir o extraer informacion de imagenes en dispositivos con recursos limitados, util para clasificacion asistida o accesibilidad.
- Generacion de texto en pipelines de CI/CD o herramientas internas: el formato GGUF y la licencia Apache 2.0 facilitan la integracion en scripts y automatizaciones sin restricciones comerciales adicionales.
- Educacion e investigacion: modelo ligero para experimentar con merges comunitarios, cuantizacion y evaluacion comparativa frente a Gemma 3 base.
- Chatbots de soporte en ingles con contexto moderado: adecuado para FAQ y conversaciones de dominio acotado, siempre que se valide la calidad del merge en el dominio concreto.
- Generacion de codigo asistida: aunque no hay benchmarks que lo confirmen, el modelo puede usarse para autocompletado y explicacion de fragmentos en entornos de desarrollo integrados con backend local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): ~1,8 GB (Q2_K), ~2,5-2,6 GB (Q4_K_S / Q4_K_M), ~3,3 GB (Q6_K), ~4,2 GB (Q8_0), ~7,9 GB (f16). Anadir ~0,7-1,0 GB si se usa vision con mmproj.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (RTX 3050, RTX 4060, RTX 3060 12 GB) para cuantizaciones Q4-Q8; A100/H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas para Q4_K_M; en CPU tambien es viable gracias al tamano reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (segun tags), y cualquier runner compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CyberGemma-3-4b-merged-GGUF | ~3,9B | no disponible | Apache 2.0 | GGUF | Merge comunitario sobre Gemma 3 4B, sin benchmarks publicados |
| Gemma 3 4B (Google) | ~4B | amplio (heredado) | Gemma Terms | safetensors, GGUF | Modelo oficial con model card y evaluaciones publicadas |
| Qwen2.5-3B-Instruct | ~3B | 32K (segun documentacion oficial) | Apache 2.0 | safetensors, GGUF | Alternativa ligera con benchmarks publicados |
| Llama 3.2 3B Instruct | ~3B | 128K (segun documentacion oficial) | Llama 3.2 Community License | safetensors, GGUF | Alternativa con licencia no Apache |

La comparativa se basa en caracteristicas generales conocidas de los modelos alternativos; no se dispone de datos de rendimiento comparativo especificos para este merge.

## Limitaciones y advertencias

- Merge comunitario sin model card detallada ni evaluaciones publicadas: la calidad real frente a Gemma 3 base es incierta y debe validarse en el dominio de uso.
- Idioma limitado a ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre tool calling, agentes o modo thinking; no asumir estas capacidades sin verificar.
- Aunque la licencia declarada es Apache 2.0, el modelo deriva de Gemma 3, cuyos terminos originales pueden imponer condiciones adicionales; conviene revisar la cadena de licencias antes de uso comercial.
- El repositorio ocupa 37,3 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Los ficheros mmproj son necesarios para vision; sin ellos el modelo funciona solo como texto.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mradermacher/CyberGemma-3-4b-merged-GGUF
- Modelo base del merge: https://huggingface.co/MaestroDev19/CyberGemma-3-4b-merged
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#CyberGemma-3-4b-merged-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
