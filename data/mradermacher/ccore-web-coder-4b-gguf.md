# mradermacher/CCORE-Web-Coder-4B-GGUF

## Resumen

CCORE-Web-Coder-4B es un modelo de lenguaje especializado en desarrollo web, publicado por el usuario `ccore` y cuantizado en formato GGUF por `mradermacher`. Con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), se presenta como un modelo compacto orientado a la generación de código para tecnologías web, con especial énfasis en React y diseño de interfaces. La etiqueta `qwen3_5` en el repositorio sugiere que su arquitectura deriva de la familia Qwen, aunque la model card no detalla explícitamente la arquitectura base.

El modelo ha sido afinado sobre el dataset `ccore/CCORE-Web-Designs`, lo que indica un entrenamiento orientado a tareas de maquetación y desarrollo frontend. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integración en herramientas de desarrollo y pipelines de generación de código.

Esta ficha describe la versión cuantizada GGUF publicada por mradermacher, que ofrece múltiples niveles de cuantización (desde Q2_K hasta f16) para facilitar el despliegue en hardware de consumo. El modelo está etiquetado únicamente para inglés y no se dispone de información sobre benchmarks publicados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; variantes imatrix en repo `-i1-GGUF`; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base `ccore/CCORE-Web-Coder-4B`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La etiqueta `qwen3_5` en el repositorio cuantizado sugiere una arquitectura basada en la familia Qwen (probablemente una variante de la serie Qwen3), pero la model card no confirma ni describe capas, atencion, ni mecanismos concretos. El modelo base `ccore/CCORE-Web-Coder-4B` es un fine-tune sobre el dataset `ccore/CCORE-Web-Designs`, orientado a desarrollo web y React.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la ha realizado mradermacher con `quantize_version: 2`, `output_tensor_quantised: 1` y conversion desde Hugging Face (`convert_type: hf`), ofreciendo tanto cuantizaciones estaticas como ponderadas/imatrix en un repositorio separado.

## Capacidades

- Generacion de codigo web: el modelo esta afinado especificamente para desarrollo web, con etiquetas que destacan React y diseno de interfaces.
- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica soporte para dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructuras de inferencia estandar.
- Soporte multimodal parcial: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica capacidad de proyeccion multimodal, aunque no se detalla que modalidades cubre.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no documentado; la presencia de mmproj sugiere algun tipo de entrada multimodal, pero sin confirmacion.

## Casos de uso

- Generacion de componentes React: el modelo puede producir componentes funcionales, hooks y estructuras de estado para aplicaciones React, gracias a su afinamiento sobre el dataset `CCORE-Web-Designs`.
- Maquetacion y diseno de interfaces: adecuado para generar estructuras HTML/CSS y propuestas de layout a partir de descripciones en lenguaje natural, orientado a prototipado rapido.
- Asistente de desarrollo en local: con cuantizaciones Q4_K_M (~2,8 GB) puede ejecutarse en portatiles con GPU de consumo, sirviendo como asistente de codigo offline sin dependencia de APIs.
- Integracion en editores de codigo: al ser un modelo de 4B en GGUF, puede desplegarse con llama.cpp u Ollama para autocompletado y generacion de snippets en IDE.
- Generacion de codigo en pipelines de CI/CD: su licencia Apache 2.0 permite integrarlo en herramientas internas de generacion de tests o scaffolding de proyectos web.
- Prototipado de landing pages y formularios: util para generar borradores de paginas web completas a partir de especificaciones textuales, acelerando la fase de diseno.
- Educacion y formacion: puede emplearse como tutor de desarrollo web en entornos controlados, generando ejemplos de codigo React y explicaciones en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~2,1 GB; Q4_K_M ~2,8 GB; Q6_K ~3,6 GB; Q8_0 ~4,6 GB; f16 ~8,5 GB. A estas cifras hay que anadir el overhead de contexto y el fichero mmproj si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 para mayor velocidad; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas para Q4_K_M; incluso en CPU con llama.cpp para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CCORE-Web-Coder-4B (este) | ~4,2 B | no disponible | Apache 2.0 | GGUF / safetensors | Afinado para desarrollo web y React |
| Qwen2.5-Coder-3B | ~3 B | 32K (tipico en la familia) | Apache 2.0 | safetensors / GGUF | Modelo de codigo generalista de referencia en tamano similar |
| Qwen2.5-Coder-7B | ~7 B | 32K (tipico) | Apache 2.0 | safetensors / GGUF | Mayor capacidad, requiere mas VRAM |
| DeepSeek-Coder-1.3B | ~1,3 B | 16K (tipico) | DeepSeek License | safetensors / GGUF | Alternativa mas ligera, menos capable |

Nota: los datos de contexto y rendimiento de los modelos comparativos no se han verificado en la informacion proporcionada y se indican como referencia general de la categoria; no se dispone de benchmarks comparativos directos para este modelo.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Sesgos: no se documentan sesgos conocidos, pero al ser un fine-tune sobre un dataset especifico de diseno web, puede reproducir patrones y estilos limitados a ese dominio.
- Alucinacion: como todo modelo generativo de 4B, existe riesgo de generar APIs inexistentes, props invalidas de React o codigo que no compila; requiere validacion en produccion.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `ccore/CCORE-Web-Coder-4B` y del dataset `ccore/CCORE-Web-Designs` antes de un despliegue comercial.
- Cuantizaciones bajas: Q2_K y Q3_K pueden degradar notablemente la calidad del codigo generado; se recomienda Q4_K_M o superior para uso en produccion.
- Falta de documentacion: la model card es escueta y no detalla arquitectura, entrenamiento ni evaluacion, lo que dificulta la evaluacion rigurosa del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-GGUF
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#CCORE-Web-Coder-4B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/CCORE-Web-Designs
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
