# mradermacher/Qwen3.8-4B-Distill-ARA-Abliterated-GGUF

## Resumen

Qwen3.8-4B-Distill-ARA-Abliterated-GGUF es la distribucion en formato GGUF del modelo Austriani/Qwen3.8-4B-Distill-ARA-Abliterated, preparada por el cuantizador mradermacher. Se trata de un modelo derivado de la familia Qwen3.8 de 4B parametros, afinado mediante destilacion (distill) y posteriormente sometido a una tecnica de "abliteracion" (arbitrary-rank ablation, ARA) que elimina los mecanismos de rechazo de respuestas, dando lugar a una variante "uncensored" orientada a roleplay, escritura creativa y chat sin restricciones de contenido.

El modelo base conserva la arquitectura transformer de Qwen3.8 con 4.205 millones de parametros, y esta etiquetado como multimodal (el repositorio incluye ficheros mmproj, es decir, proyecciones multimodales). La version que nos ocupa es una cuantizacion estatica generada con llama.cpp, disponible en 13 niveles de cuantizacion distintos, desde Q2_K hasta f16.

Su relevancia practica radica en que permite ejecutar un modelo de 4B con capacidades conversacionales y creativas en hardware de consumo, con licencia Apache 2.0, y sin las capas de rechazo que limitan el uso en generacion creativa libre. Es, por tanto, una opcion para desarrolladores que necesitan un modelo pequeno, desplegable localmente y sin filtros de contenido, a costa de asumir los riesgos asociados a la eliminacion de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con proyeccion multimodal (mmproj) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (segun la model card); otros no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.8 con 4.205 millones de parametros. Segun las etiquetas del repositorio, ha sido sometido a un proceso de destilacion (distill) y posteriormente a una "arbitrary-rank ablation" (ARA) aplicada con la herramienta heretic, que elimina las direcciones de activacion responsables del rechazo de peticiones. El resultado es una variante "abliterated" o "refusal-removed", pensada para roleplay y escritura creativa sin restricciones.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La presencia de ficheros mmproj indica que el modelo base incorpora capacidades multimodales (vision), aunque no se detalla su alcance. Esta version concreta es una cuantizacion estatica (quantize_version 2) generada con llama.cpp, sin imatrix; el autor ofrece cuantizaciones ponderadas por imatrix en un repositorio separado.

## Capacidades

- Generacion de texto y conversacion multi-turno (chat).
- Escritura creativa y roleplay sin mecanismos de rechazo.
- Capacidad multimodal (vision) segun la presencia de ficheros mmproj; alcance no detallado.
- Razonamiento y codigo: heredados del modelo base Qwen3.8, sin datos especificos publicados.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo ha sido ablacionado para eliminar rechazos, por lo que puede mantener personajes y tramas sin interrupciones moralizantes; su tamano de 4B permite ejecutarlo en local con latencia baja.
- Escritura creativa sin filtros: util para generar ficcion con tematicas adultas o controvertidas donde un modelo alineado rechazaria la peticion; la cuantizacion Q4_K_M (2,8 GB) cabe en cualquier GPU de consumo.
- Chat local en dispositivos con poca VRAM: las cuantizaciones Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten inferencia en GPUs de 4-6 GB o incluso en CPU.
- Prototipado rapido de asistentes conversacionales: al ser un GGUF compatible con llama.cpp, Ollama y servidores OpenAI-compatibles, se integra en pipelines de desarrollo sin infraestructura dedicada.
- Generacion de dialogos para videojuegos o simulaciones: el modelo puede producir respuestas de personajes no jugadores (NPC) en tiempo real gracias a su tamano reducido y a la ausencia de filtros.
- Experimentacion en investigacion sobre alineamiento: la variante abliterated sirve como contraste frente al modelo base para estudiar el efecto de la eliminacion de rechazos en calidad y seguridad.
- Analisis de imagenes con el mmproj: si se carga el proyector multimodal, puede describir o interpretar imagenes en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_S: ~2,2 GB
  - Q3_K_M: ~2,4 GB
  - Q3_K_L: ~2,5 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_S: ~2,7 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_S: ~3,1 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
  - mmproj-Q8_0: ~0,5 GB adicionales
  - mmproj-f16: ~0,8 GB adicionales
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para cuantizaciones Q4-Q8; A100/H100 no son necesarias pero funcionarian.
- Cabe en consumer GPU: si, en todas las cuantizaciones hasta Q8_0 con 6-8 GB de VRAM; f16 requiere ~10 GB con contexto.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (endpoints_compatible), y cualquier runtime que soporte GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-ARA-Abliterated (este) | 4,2B | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal, ingles |
| Modelo base Austriani/Qwen3.8-4B-Distill-ARA-Abliterated | 4,2B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar |
| Cuantizaciones imatrix del mismo modelo (mradermacher i1-GGUF) | 4,2B | no disponible | Apache 2.0 | GGUF | Calidad superior por pesos ponderados |
| Otros GGUF de la familia Qwen3.8 de 4B | ~4B | no disponible | Apache 2.0 | GGUF | Sin ablacion, con rechazos |

No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- La ablacion elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido ofensivo, ilegal o danino sin filtros; no es apto para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion, comun en modelos de 4B y agravado por la destilacion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo abliterated.
- La cuantizacion Q3_K_M esta marcada por el autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo base no incluye informacion sobre sesgos; se debe evaluar empiricamente antes de desplegar.
- La fecha de creacion del repositorio (2026) y la denominacion "Qwen3.8" no coinciden con versiones publicas conocidas de Qwen; verificar la procedencia antes de usar en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-ARA-Abliterated-GGUF
- Modelo base: https://huggingface.co/Austriani/Qwen3.8-4B-Distill-ARA-Abliterated
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-ARA-Abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-4B-Distill-ARA-Abliterated-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
