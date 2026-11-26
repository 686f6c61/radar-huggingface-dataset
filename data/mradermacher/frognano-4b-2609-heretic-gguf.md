# mradermacher/FrogNano-4B-2609-heretic-GGUF

## Resumen

FrogNano-4B-2609-heretic-GGUF es la distribucion en formato GGUF del modelo FrogNano-4B-2609-heretic, un modelo de lenguaje de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) desarrollado originalmente por Richard J. Young (richardyoung) y cuantizado por mradermacher. Se trata de una variante "heretic" o "abliterated", es decir, un modelo al que se le ha eliminado el comportamiento de rechazo (refusal) mediante tecnicas de modificacion de pesos, orientado explicitamente a investigacion en seguridad de IA, red-teaming y evaluacion.

El modelo parte de una arquitectura transformer de tipo denso (no se especifica MoE) y esta disenado para uso conversacional en ingles. Su relevancia actual reside en que ofrece un modelo pequeno (4B) sin censura de rechazos, empaquetado en multiples cuantizaciones GGUF que van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), lo que permite desplegarlo en hardware de consumo. Incluye ademas un componente multimodal (mmproj) que sugiere capacidades de vision, aunque la model card no detalla la arquitectura exacta ni los datos de entrenamiento.

La licencia es MIT, lo que facilita su uso comercial, aunque el modelo base original esta sujeto a un acceso condicionado (gated) con solicitud manual por parte del autor. Esta ficha describe la version GGUF cuantizada, que hereda las caracteristicas del modelo base pero anade la portabilidad del formato GGUF para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Se sabe que es un transformer denso de aproximadamente 4,2 mil millones de parametros, con un componente multimodal adicional (mmproj) que indica soporte de entrada de imagenes. El modelo es una variante "heretic/abliterated", lo que implica que se han aplicado tecnicas de modificacion de pesos (tipicamente ablacion de direcciones de rechazo en el espacio de activaciones) para eliminar el comportamiento de rechazo del modelo original.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card del cuantizador no incluye esta informacion, y la del modelo base solo menciona que se libera para investigacion en seguridad de IA. El autor del modelo base, Richard J. Young, indica que los papers asociados estan listados en su CV, pero no se proporcionan enlaces directos a los mismos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Comportamiento sin rechazos (refusal-removed): el modelo no declina responder a peticiones que el modelo original rechazaria.
- Capacidades multimodales: la presencia de archivos mmproj (Q8_0 y f16) indica soporte de entrada de imagenes, aunque no se detalla la naturaleza exacta de dicha capacidad.
- Uso en investigacion de seguridad: disenado para red-teaming, evaluacion de alineamiento y estudio de comportamientos no censurados.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con APIs de inferencia estandar.
- No se documentan capacidades especificas de tool calling, function calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo puede emplearse para generar respuestas que un modelo alineado rechazaria, permitiendo evaluar la robustez de filtros y clasificadores de seguridad en pipelines de moderacion.
- Investigacion en alineamiento: util para estudiar como la ablacion de rechazos afecta al comportamiento del modelo, comparando respuestas con el modelo base original en experimentos controlados.
- Evaluacion de sesgos y toxicidad: al carecer de rechazos, permite aflorar sesgos latentes que en modelos alineados quedan ocultos, facilitando su medicion con conjuntos de pruebas especificos.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB), puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores mediante llama.cpp u Ollama, para experimentacion personal.
- Prototipado de asistentes conversacionales sin restricciones: en entornos de investigacion cerrados, sirve para probar flujos conversacionales donde las politicas de rechazo interfieren con la recogida de datos.
- Analisis de contenido multimodal: gracias al componente mmproj, puede emplearse en experimentos que combinan texto e imagenes, como la descripcion de escenas o la extraccion de informacion visual en entornos de investigacion.
- Docencia en seguridad de IA: util como ejemplo practico en cursos sobre tecnicas de abliteration y sus implicaciones eticas y tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0 GB
  - Q3_K_M: ~2,4 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
  - Componente mmproj adicional: ~0,5 GB (Q8_0) o ~0,8 GB (f16)
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas y contexto extendido; A100/H100 no necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 8 GB o mas para Q4_K_M; en GPUs de 4-6 GB con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, etc.). Tambien puede usarse con transformers si se dispone de los pesos safetensors del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FrogNano-4B-2609-heretic-GGUF | ~4,2B | no disponible | MIT | GGUF | Variante abliterated, multimodal (mmproj), solo ingles |
| Modelo base richardyoung/FrogNano-4B-2609-heretic | ~4,2B | no disponible | MIT | safetensors | Acceso gated, requiere solicitud manual |
| Alternativas abliterated de ~4B | no disponible | no disponible | variable | GGUF/safetensors | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Modelo sin rechazos: puede generar contenido toxico, sesgado o danino; no es apto para despliegue en produccion orientado al publico general sin filtros adicionales.
- Acceso condicionado en el modelo base: el modelo original requiere solicitud manual y aceptacion de terminos de uso; la version GGUF derivada hereda la licencia MIT, pero el autor original restringe el uso a investigacion en seguridad.
- Sesgos conocidos: no documentados en la informacion disponible, pero al ser un modelo abliterated es probable que afloren sesgos que el modelo alineado ocultaba.
- Riesgo de alucinacion: no cuantificado; los modelos de 4B tienden a alucinar mas que modelos mayores, aunque no hay datos especificos.
- Limitacion de idioma: solo ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de cargas con contexto largo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad o rendimiento frente a alternativas.
- Uso comercial: la licencia MIT lo permite, pero las implicaciones eticas y legales del contenido generado recaen sobre el usuario.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/FrogNano-4B-2609-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/FrogNano-4B-2609-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/FrogNano-4B-2609-heretic-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#FrogNano-4B-2609-heretic-GGUF
- CV del autor original: https://cv.deepneuro.ai
- Perfil del autor original en Hugging Face: https://huggingface.co/richardyoung
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
