# prithivMLmods/VIGOR-flash-GGUF

## Resumen

VIGOR-flash-GGUF es la distribucion cuantizada en formato GGUF del modelo VIGOR-flash (Vision Intelligence and Guardrail Oriented Reasoning), un clasificador multimodal de seguridad de contenido desarrollado por prithivMLmods. Se trata de un modelo denso de aproximadamente 9.200 millones de parametros construido sobre Qwen/Qwen3.5-9B, especializado en el analisis de imagenes para determinar si su contenido es seguro (Safe) o no seguro (NSFW), con un umbral conservador orientado a la proteccion de menores y al control parental.

El modelo resuelve un problema concreto: la necesidad de un guardrail visual ejecutable localmente que analice ropa, exposicion corporal, poses, encuadre y contexto para emitir una clasificacion estructurada en JSON. Frente a clasificadores binarios opacos, VIGOR-flash genera una descripcion de escena detallada junto con la decision y su justificacion, lo que facilita la auditoria y el filtrado en pipelines de moderacion.

Esta version GGUF incorpora soporte de Multi-Token Prediction (MTP) con decodificacion especulativa integrada en los propios pesos, lo que acelera la inferencia local sin necesidad de un modelo draft separado. El repositorio incluye cuantizaciones desde Q3_K_M hasta BF16, ademas del fichero mmproj para la proyeccion multimodal, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen/Qwen3.5-9B) con MTP para decodificacion especulativa |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; mmproj en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

VIGOR-flash se basa en el transformer denso de Qwen3.5-9B, adaptado como clasificador multimodal image-text-to-text. El pipeline procesa la imagen mediante un proyector multimodal (fichero mmproj en BF16, 922 MB) que la alinea con el espacio de representaciones del modelo de lenguaje, y genera una respuesta estructurada en JSON con descripcion de escena, decision de clasificacion y justificacion. La innovacion destacable de esta variante GGUF es la integracion de Multi-Token Prediction (MTP): los pesos incorporan cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, habilitando decodificacion especulativa sin modelo draft externo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card indica que el modelo es experimental y recomienda el uso del prompt estandar para obtener resultados de guardrail y clasificacion.

## Capacidades

- Clasificacion de seguridad visual: determina si una imagen es Safe o NSFW con umbral estricto de tolerancia cero.
- Analisis detallado de escena: describe sujeto, ropa, exposicion y pose de forma objetiva.
- Deteccion de desnudez total o parcial, ropa interior, lenceria, banadores sugestivos y ropa transparente.
- Deteccion de contenido anime/manga adulto, ecchi, hentai e ilustraciones 2D/3D sexualizadas.
- Identificacion de actos sexuales explicitos, material fetichista y posicionamiento sexual.
- Salida estructurada en JSON valido con claves fijas (scene_description, is_nsfw, classification_reason, nsfw, safe).
- Razonamiento con modo thinking opcional (template por defecto con thinking desactivado; modo razonamiento con thinking activado).
- Decodificacion especulativa via MTP para acelerar la inferencia local.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Moderacion de contenido generado por usuarios: el modelo se integra como paso previo a la publicacion de imagenes en plataformas sociales o foros, clasificando cada imagen como Safe o NSFW y devolviendo la justificacion para revision humana.
- Control parental y proteccion de menores: desplegado localmente en dispositivos o pasarelas domesticas, filtra imagenes antes de mostrarlas a menores, con el prompt estandar disenado explicitamente para este escenario.
- Filtrado en pipelines de entrenamiento de modelos generativos: se usa para descartar imagenes no seguras de datasets multimodales antes de entrenar o ajustar otros modelos, aprovechando la salida JSON para automatizar el descarte.
- Auditoria de bibliotecas de imagenes corporativas: revisa repositorios de assets internos para detectar contenido inapropiado antes de su uso en campanas o presentaciones.
- Guardrail en aplicaciones de chat con vision: actua como capa de seguridad en asistentes que aceptan imagenes de entrada, bloqueando contenido sensible antes de que llegue al modelo principal.
- Investigacion en seguridad multimodal: sirve como clasificador de referencia ejecutable en local para estudiar sesgos, umbrales y comportamiento de guardrails visuales, gracias a su licencia Apache 2.0 y formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con cuantizaciones Q4_K_S/Q4_K_M, 6,5-7,6 GB con Q5/Q6, y en torno a 18,4 GB con BF16; a ello se suma el fichero mmproj de 922 MB.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 y H100 para BF16; GPU consumer de gama media-alta (8-12 GB de VRAM) para cuantizaciones Q4/Q5.
- Cabe en GPU consumer: si, con cuantizaciones Q3 a Q6 en tarjetas de 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (tag declarado) y transformers con el modelo base; los tags mencionan compatibilidad con endpoints y llama-cpp.
- Latencia y throughput estimados: no disponibles; la model card indica que MTP acelera significativamente la inferencia local, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| VIGOR-flash-GGUF | 9,2 B (denso) | No disponible | Guardrail visual Safe/NSFW con salida JSON y justificacion | Apache 2.0 | GGUF |
| Clasificadores NSFW especializados (p. ej. detectores CNN/ViT) | No disponible | No aplica | Clasificacion binaria de desnudez | Variable | Variable |
| Modelos de vision-lenguaje genericos (familia Qwen-VL) | No disponible | No disponible | Descripcion y razonamiento visual general | Variable | safetensors, GGUF |

La comparativa cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card recomienda el uso del setup basado en Transformers frente a esta variante GGUF.
- Solo soporta ingles; el prompt y las salidas estan disenados en ese idioma.
- Riesgo de falsos positivos por el umbral de tolerancia cero ("ante la duda, clasificar como NSFW"), lo que puede bloquear contenido legitimo como arte, educacion o salud.
- Riesgo de alucinacion en la descripcion de escena y en la justificacion de la clasificacion; no debe usarse como unica fuente de decision en produccion.
- Sesgos no documentados en la informacion disponible; el comportamiento puede variar segun cultura, etnia, genero o estilo visual.
- La licencia Apache 2.0 permite uso comercial, pero la model card limita la finalidad a investigacion y clasificacion de seguridad de contenido, y declara que cualquier salida es responsabilidad exclusiva del usuario.
- El autor y la plataforma de alojamiento declinan toda responsabilidad sobre el contenido generado; es responsabilidad del usuario garantizar un uso seguro, etico y legal.
- Longitud de contexto no disponible, lo que impide planificar escenarios de conversacion multi-turno larga.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-flash
- Modelo base original Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
