# ggml-org/lev-GGUF

## Resumen

lev-GGUF es la version cuantizada en formato GGUF del modelo interfaze-ai/lev, publicada por la organizacion ggml-org, el equipo que mantiene la libreria ggml y el motor de inferencia llama.cpp. Se trata de un "decision model" (modelo de decision) disenado para ejecutarse a traves del endpoint `/v1/systemone` de la API de llama.cpp, y su pipeline declarado en HuggingFace es `zero-shot-classification`, por lo que su proposito principal es emitir decisiones o etiquetas sobre entradas de texto sin necesidad de reentrenamiento especifico por tarea.

El modelo base declarado es interfaze-ai/lev, que a su vez se apoya en Qwen/Qwen3.5-4B como modelo fuente. Cuenta con 4.205.751.296 parametros reales (aproximadamente 4,2 mil millones), lo que lo situa en la gama de modelos compactos aptos para despliegue local. El repositorio ocupa 15,9 GB, coherente con un paquete GGUF que agrupa varias cuantizaciones.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales; por otro, al estar convertido a GGUF es compatible con el ecosistema llama.cpp, lo que facilita su ejecucion en CPU, GPU de consumo y entornos con recursos limitados. La conversion se realizo automaticamente con la herramienta ggml-org/convert.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; modelo base interfaze-ai/lev, derivado de Qwen/Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (aprox. 4,2 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Formato cuantizado GGUF; niveles concretos de cuantizacion no especificados en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base interfaze-ai/lev. El unico dato estructural confirmado es que deriva de Qwen/Qwen3.5-4B, un modelo de la familia Qwen de aproximadamente 4 mil millones de parametros, y que el recuento real de parametros del modelo publicado es de 4.205.751.296. No se especifica si emplea atencion completa, atencion lineal u otro esquema, ni el tamano de su ventana de contexto.

Tampoco se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por RLHF, DPO u otras tecnicas de alineacion. El elemento diferencial mas destacado es su naturaleza de "decision model": el modelo card indica explicitamente que debe usarse a traves del endpoint `/v1/systemone`, una ruta de API introducida en el pull request 29818 de llama.cpp. La conversion a GGUF se realizo de forma automatica mediante la herramienta ggml-org/convert a partir de los modelos fuente, sin que se documenten pasos adicionales de destilacion o fine-tuning.

## Capacidades

- Clasificacion zero-shot: el pipeline declarado es `zero-shot-classification`, por lo que puede asignar etiquetas a textos sin ejemplos de entrenamiento previos.
- Toma de decisiones: el modelo esta disenado como "decision model" y se invoca mediante el endpoint `/v1/systemone`.
- Naturaleza conversacional: incluye la etiqueta `conversational`, lo que sugiere soporte de interaccion en formato de dialogo.
- Compatibilidad con endpoints: lleva la etiqueta `endpoints_compatible`, orientada a su integracion en servicios de inferencia.
- Despliegue local: al estar en GGUF, puede ejecutarse con llama.cpp y con el comando `llama serve -hf ggml-org/lev-GGUF`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion zero-shot de documentos: el modelo puede asignar categorias a textos entrantes sin necesidad de ejemplos etiquetados, aprovechando su pipeline `zero-shot-classification` para triaje de contenido en pipelines de procesamiento por lotes.
- Moderacion de contenido automatizada: al funcionar como modelo de decision, puede emitir juicios binarios o por categorias sobre textos generados por usuarios, integrándose via `/v1/systemone` en un servicio de moderacion en tiempo real.
- Enrutamiento de consultas (routing): en un sistema con varios modelos especializados, lev-GGUF puede decidir a que modelo o flujo derivar cada peticion, gracias a su bajo coste de inferencia (4,2 mil millones de parametros).
- Clasificacion de tickets de soporte: etiquetar automaticamente tickets por area, urgencia o intencion, reduciendo el trabajo manual de triaje en mesas de ayuda.
- Filtrado y curaduria de datos: clasificar grandes volumenes de texto para descartar, priorizar o agrupar registros antes de alimentar un pipeline de datos o un proceso de entrenamiento.
- Sistemas de decision de baja latencia: su reducido tamano y su formato GGUF permiten ejecutarlo en hardware modesto, idoneo para decisiones rapidas en el borde o en servicios con requisitos de latencia estrictos.
- Etiquetado dinamico en buscadores internos: asignar temas o etiquetas a documentos de una base de conocimiento sin esquema predefinido, facilitando la recuperacion posterior.
- Integracion en agentes como subsistema de decision: usar el endpoint `/v1/systemone` como componente rapido de "sistema 1" que resuelve decisiones inmediatas antes de recurrir a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (4,2 mil millones) y del formato GGUF, no datos oficiales del modelo:

- VRAM estimada para inferencia (aproximada, solo pesos):
  - Cuantizacion Q4: en torno a 2,5-3 GB.
  - Cuantizacion Q5: en torno a 3-3,5 GB.
  - Cuantizacion Q8: en torno a 4,5-5 GB.
  - Precision FP16: en torno a 8,5-9 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 pueden alojar el modelo con holgura; para precision completa se recomienda al menos 8-10 GB de VRAM.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU moderna de consumo al cuantizarse a Q4 o Q5, e incluso puede ejecutarse en CPU solo.
- Opciones de despliegue: llama.cpp (el formato nativo aqui es GGUF), llama.app mediante `llama serve -hf ggml-org/lev-GGUF`, y otras herramientas compatibles con GGUF como Ollama o servidores basados en ggml. La compatibilidad con vLLM o TGI no esta confirmada, ya que estas suelen consumir pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ggml-org/lev-GGUF | 4,2 mil millones | No disponible | GGUF | Apache 2.0 | Version cuantizada y especializada como modelo de decision |
| interfaze-ai/lev (base) | No disponible | No disponible | No disponible | No disponible | Modelo fuente; pipeline `zero-shot-classification` |
| Qwen/Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Modelo fuente de la familia Qwen, misma clase de tamano |

No se dispone de datos de rendimiento ni de contexto de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La diferencia principal de lev-GGUF frente a sus fuentes es el formato GGUF y su orientacion especifica a decisiones mediante `/v1/systemone`.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero aplicable a cualquier modelo generativo de esta familia.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera del ingles (o del idioma de entrenamiento) es incierto.
- No se detalla la longitud de contexto, lo que impide garantizar el manejo de entradas largas.
- El modelo es una conversion automatica a GGUF del modelo base, sin que se documenten validaciones adicionales de calidad o fidelidad numerica tras la cuantizacion.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base interfaze-ai/lev y del modelo fuente Qwen3.5-4B antes de un despliegue en produccion.
- Uso especifico de API: el modelo card indica que debe usarse mediante el endpoint `/v1/systemone`; su comportamiento fuera de ese canal puede no estar garantizado.
- Caveat de despliegue: al no confirmarse compatibilidad con motores distintos de llama.cpp, la integracion en servidores como vLLM o TGI requeriria conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ggml-org/lev-GGUF
- Modelo base: https://huggingface.co/interfaze-ai/lev
- Modelo fuente Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Pull request de llama.cpp con el endpoint `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/29818
- Herramienta de conversion: https://github.com/ggml-org/convert
- Sitio de llama.app: https://llama.app
- Organizacion ggml-org en GitHub: https://github.com/ggml-org/
- Organizacion ggml-org en HuggingFace: https://huggingface.co/ggml-org
