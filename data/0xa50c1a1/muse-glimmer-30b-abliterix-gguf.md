# 0xA50C1A1/Muse-Glimmer-30B-abliterix-gguf

## Resumen

Muse-Glimmer-30B-abliterix-gguf es una distribucion en formato GGUF del modelo Muse-Glimmer-30B-abliterix, un LLM de aproximadamente 27.850 millones de parametros publicado por el usuario 0xA50C1A1 en Hugging Face. Se trata de una variante "abliterada" (sin censura, segun los tags del repositorio) del modelo base Muse-Glimmer-30B, cuantizada para su uso con llama.cpp y otros motores compatibles con GGUF. El repositorio incluye un archivo NVFP4 de 17 GB y un proyector de vision en Q8_0 de 2,1 GB, lo que indica que el modelo base incorpora capacidad multimodal.

La relevancia de esta ficha es practica: ofrece pesos cuantizados de un modelo de ~28B con licencia Apache 2.0, lo que permite despliegue local y comercial sin las restricciones tipicas de licencias de investigacion. El tag `nvfp4` apunta a una cuantizacion de 4 bits orientada a GPUs Blackwell de NVIDIA, mientras que el proyector de vision sugiere uso en tareas imagen-texto.

La informacion publicada por el autor es muy escasa: no hay model card detallada, no se documentan idiomas, contexto, datos de entrenamiento ni benchmarks. Esta ficha refleja unicamente los datos verificables del repositorio y marca explicitamente como "no disponible" todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal inferido por la presencia de proyector de vision) |
| Parametros totales | 27.854.795.072 (~27,85B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (17 GB), proyector de vision Q8_0 (2,1 GB), lm_head y embeddings en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con variante NVFP4 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base Muse-Glimmer-30B-abliterix. El recuento de parametros (27,85B) y la presencia de un proyector multimodal (`mmproj`) en Q8_0 indican un modelo de lenguaje con capacidad de vision, probablemente un transformer con un adaptador de proyeccion visual conectado a un codificador de imagen. El tag `muse_glimmer` sugiere una familia de modelos propia del autor, sin documentacion publica accesible en la informacion proporcionada.

Respecto al entrenamiento, no se documentan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. El termino "abliterated" en el nombre y en los tags indica que el modelo base ha sido modificado mediante tecnicas de abliteracion (supresion de direcciones de rechazo en el espacio de activaciones) para eliminar comportamientos de negativa, pero el autor no detalla el procedimiento ni los datos empleados. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la categoria del pipeline confirman uso para dialogo multi-turno.
- Procesamiento de imagenes: el repositorio incluye un proyector de vision (`mmproj-q8_0.gguf`), lo que habilita entrada multimodal imagen-texto en llama.cpp.
- Modo sin censura: los tags `abliterated` y `uncensored` indican que el modelo ha sido modificado para reducir rechazos, lo que amplia el rango de respuestas generadas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 17 GB en NVFP4, el modelo cabe en GPUs de 24 GB o mas, lo que permite ejecutar un LLM de ~28B en hardware de gama alta de consumo para prototipado y uso personal.
- Procesamiento de documentos con imagenes: gracias al proyector de vision, puede emplearse para extraer y resumir informacion de capturas, diagramas o documentos escaneados en un pipeline local con llama.cpp.
- Generacion de contenido sin restricciones editoriales: la variante abliterada resulta adecuada para experimentacion creativa o investigacion sobre alineacion, donde se necesita observar el comportamiento del modelo sin capas de rechazo.
- Asistente conversacional autoalojado: el formato GGUF y la licencia Apache 2.0 permiten integrarlo en aplicaciones de chat privadas sin dependencia de APIs externas ni costes por token.
- Investigacion sobre seguridad y alineacion: al ser una version abliterada, sirve como objeto de estudio para comparar comportamientos frente al modelo original en pruebas de robustez y sesgo.
- Prototipado multimodal en entornos con GPU Blackwell: la cuantizacion NVFP4 aprovecha el hardware de cuarta generacion de tensor cores de NVIDIA para reducir el uso de VRAM en inferencia de imagenes y texto.
- Fine-tuning o evaluacion comparativa: los pesos GGUF permiten evaluaciones rapidas con llama.cpp antes de invertir en el modelo completo en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB para el archivo NVFP4, mas 2,1 GB del proyector de vision si se usa entrada multimodal; el total ronda los 19-20 GB en memoria.
- GPU recomendadas: NVIDIA Blackwell (serie RTX 50 o B200) para aprovechar NVFP4 de forma nativa; en GPUs Ampere o Ada la cuantizacion NVFP4 puede requerir conversion o no estar soportada de forma optima por llama.cpp.
- GPU de consumo: cabe en tarjetas con 24 GB de VRAM (RTX 4090, RTX 3090) si el motor soporta la cuantizacion; en GPUs de 16 GB no entra el archivo NVFP4 completo.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa importacion del GGUF), y servidores compatibles con la API de llama.cpp; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterix-gguf | ~27,85B | no disponible | Apache 2.0 | GGUF / NVFP4 | Variante abliterada con vision |
| Modelo base Muse-Glimmer-30B-abliterix | ~27,85B | no disponible | Apache 2.0 | safetensors (presumible) | Sin cuantizar, mismo autor |
| Alternativas de ~30B abliteradas | no disponible | no disponible | variable | GGUF | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria; los datos de benchmarks y contexto del modelo base no estan publicados.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni datos de entrenamiento, ni evaluaciones, lo que impide validar su calidad antes de usarlo en produccion.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo.
- Comportamiento sin censura: la abliteracion elimina mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin filtros; requiere moderacion externa en aplicaciones publicas.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, raza, idioma o ideologia.
- Idiomas no declarados: se desconoce el soporte real multilingue y la calidad en castellano.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real del modelo.
- Compatibilidad de cuantizacion limitada: NVFP4 depende de hardware NVIDIA Blackwell y de soporte en el motor de inferencia; en otras GPUs puede no funcionar o degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; la responsabilidad legal del contenido generado recae en el desplegador.
- Repositorio con muy poca traccion (66 descargas, 0 likes): no hay comunidad que valide su funcionamiento ni reportes de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix-gguf
- Modelo base: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix
- Archivo NVFP4: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix-gguf/resolve/main/Muse-Glimmer-30B-abliterix-nvfp4.gguf
- Proyector de vision Q8_0: https://huggingface.co/0xA50C1A1/Muse-Glimmer-30B-abliterix-gguf/resolve/main/Muse-Glimmer-30B-abliterix-mmproj-q8_0.gguf
- Paper, blog o demo: no disponible
