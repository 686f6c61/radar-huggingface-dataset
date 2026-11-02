# mradermacher/Qwen3-VL-4B-Thinking-abliterated-v1-GGUF

## Resumen

Qwen3-VL-4B-Thinking-abliterated-v1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo prithivMLmods/Qwen3-VL-4B-Thinking-abliterated-v1, publicada por mradermacher. Se trata de un derivado "abliterated" (se ha eliminado o atenuado la direccion de rechazo en el espacio de activaciones) del modelo multimodal Qwen3-VL de 4.000 millones de parametros en su variante con modo "thinking", orientado a generacion de texto e imagen-texto y a flujos de agente.

El modelo base pertenece a la familia Qwen3-VL, que combina un transformer de lenguaje con un codificador visual para tareas de comprension de imagenes y video, y anade un modo de razonamiento explicito ("thinking"). La intervencion abliterated elimina la capa de rechazo del modelo alineado, lo que cambia sustancialmente el perfil de seguridad del modelo resultante y lo hace inadecuado para despliegues sin moderacion externa.

La aportacion de esta ficha (repo de mradermacher) es puramente de cuantizacion: ofrece 13 variantes GGUF estaticas desde Q2_K (1,8 GB) hasta f16 (8,2 GB), mas dos suplementos multimodales mmproj (Q8_0 y f16) necesarios para procesar imagenes. El repositorio ocupa 37,7 GB en total y acumula 220 descargas. Es relevante para quien quiera ejecutar un VLM de 4B con capacidades de vision y razonamiento en hardware de consumo mediante llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM): LLM Qwen3 + codificador visual, con modo thinking (detalles de capas y atencion no disponibles) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con suplemento mmproj para vision); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un VLM de la familia Qwen3-VL: un transformer decoder-only de 4,02B parametros acoplado a un codificador visual que proyecta caracteristicas de imagen al espacio del LLM mediante un adaptador multimodal (mmproj en la distribucion GGUF). La variante "Thinking" incorpora un modo de razonamiento con cadena de pensamiento antes de la respuesta final. No se dispone en la informacion proporcionada de detalles sobre numero de capas, dimension oculta, cabezas de atencion, tipo de atencion (full vs. linear) ni longitud de contexto nativa.

Sobre el entrenamiento del modelo base original (Qwen3-VL) no se aportan datos en esta ficha: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO. La intervencion "abliterated" realizada por prithivMLmods consiste en la modificacion de las direcciones de rechazo en las activaciones, un procedimiento de post-entrenamiento no supervisado que no requiere reentrenamiento completo. mradermacher solo realiza la conversion a GGUF y la cuantizacion estatica (quantize_version 2, salida con tensor quantised), sin reentrenamiento adicional; los quants ponderados/imatrix se publican en un repo separado (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Comprension de imagenes (VLM): el modelo acepta entradas visuales a traves del suplemento mmproj, que debe cargarse junto con el GGUF del LLM.
- Modo "thinking": razonamiento explicito paso a paso antes de la respuesta (heredado de la variante Thinking del modelo base).
- Capacidades de agente: el repo incluye la etiqueta "agent", lo que sugiere soporte para flujos con herramientas, aunque no se detalla el formato de tool calling en la informacion disponible.
- Compatibilidad con text-generation-inference y endpoints compatibles (etiqueta endpoints_compatible).
- Multilingue: los metadatos solo declaran ingles; no se confirma soporte de otros idiomas.
- Al ser abliterated, el modelo no aplica los filtros de rechazo del modelo alineado original.

## Casos de uso

- Procesamiento de documentos escaneados en local: cargando el GGUF Q4_K_M (2,6 GB) mas el mmproj Q8_0 (0,6 GB), el modelo puede extraer texto y describir el contenido de imagenes en un portatil con GPU de 8 GB, sin enviar datos a la nube.
- Clasificacion y descripcion de imagenes por lotes: con Q8_0 (4,4 GB) en una RTX 3060/4060 se puede ejecutar un pipeline de etiquetado visual con throughput aceptable para catalogos de producto.
- Asistente de razonamiento offline: el modo thinking permite resolver problemas de logica o matematicas basicas en entornos air-gapped donde no se permite acceso a APIs externas.
- Prototipado de agentes con vision: integrado en llama.cpp u Ollama, sirve para validar flujos de agente que combinan captura de pantalla e instrucciones en lenguaje natural antes de pasar a un modelo mayor.
- Investigacion sobre alineacion y abliteration: permite estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, comparando respuestas frente al Qwen3-VL original.
- Generacion de descripciones accesibles: dado que el modelo es pequeno, puede desplegarse en un servidor modesto para generar texto alternativo de imagenes en una web interna, con moderacion externa obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo LLM): Q2_K ~1,8 GB; Q4_K_M ~2,6 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. Sumar 0,6 GB (mmproj Q8_0) o 0,9 GB (mmproj f16) si se procesan imagenes.
- GPU consumer: cabe en cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) usando Q4_K_M o Q8_0; en GPUs de 4 GB solo caben Q2_K/Q3_K_S con contexto reducido.
- GPU profesional: A100, H100 y L40S no son necesarias para este tamano; sirven para servir muchas instancias concurrentes o contextos muy largos.
- Despliegue: llama.cpp (llama-server con --mmproj para vision), Ollama (importando el GGUF y el mmproj), text-generation-inference segun etiquetas del repo. vLLM no esta confirmado para GGUF en la informacion disponible.
- Latencia y throughput: no disponibles; dependen de la GPU y de la cuantizacion. Los quants Q4_K_S y Q4_K_M estan marcados por el autor como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Thinking-abliterated-v1 (GGUF, este repo) | 4,02B | no disponible | Si (mmproj) | Apache 2.0 | Abliterated, solo EN declarado, 13 quants |
| Qwen3-VL-4B-Thinking-abliterated-v1 (base, prithivMLmods) | 4,02B | no disponible | Si | Apache 2.0 | Pesos safetensors, mismo comportamiento |
| Qwen3-VL-4B (original, alineado) | ~4B | no disponible | Si | Apache 2.0 | Con filtros de rechazo; referencia de seguridad |
| Gemma 3 4B (multimodal) | ~4B | no disponible | Si | Gemma license | Alternativa VLM pequena, no abliterated |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado la direccion de rechazo, por lo que puede generar contenido que el modelo original bloquearia. No es apto para produccion sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por el modo thinking y por el tamano reducido (4B).
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada en esta ficha; verificar en la model card del modelo base antes de usarlo con documentos largos.
- La licencia Apache 2.0 del repo de cuantizacion no exime de responsabilidad legal sobre el uso del contenido generado; el autor de la abliteration asume el cambio de comportamiento.
- El repositorio pesa 37,7 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- Para vision es imprescindible cargar el mmproj correspondiente; sin el, el modelo solo procesa texto.
- Los quants de baja calidad (Q2_K, Q3_K_S) degradan notablemente el razonamiento y la coherencia; el autor recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-VL-4B-Thinking-abliterated-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Thinking-abliterated-v1
- Quants imatrix/ponderados: https://huggingface.co/mradermacher/Qwen3-VL-4B-Thinking-abliterated-v1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-Thinking-abliterated-v1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
