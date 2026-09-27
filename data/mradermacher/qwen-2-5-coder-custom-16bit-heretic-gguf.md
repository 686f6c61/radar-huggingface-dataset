# mradermacher/qwen-2.5-coder-custom-16bit-heretic-GGUF

## Resumen

Esta ficha describe una distribución de pesos en formato GGUF del modelo `haniqwafi/qwen-2.5-coder-custom-16bit-heretic`, publicada por el usuario mradermacher bajo el identificador `mradermacher/qwen-2.5-coder-custom-16bit-heretic-GGUF`. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización estática del checkpoint original en 16 bits, orientada a su ejecución local mediante llama.cpp y herramientas compatibles. El recuento real de parámetros en safetensors es de 7.615.616.512 (aproximadamente 7,6 mil millones), lo que sitúa al modelo en la categoría de 7B-8B.

El nombre del modelo base apunta a la familia Qwen2.5-Coder, un modelo de generación de código de arquitectura transformer densa, sobre el que se habría aplicado algún tipo de ajuste personalizado. El sufijo "heretic" es la denominación habitual de las herramientas de "abliteration" o eliminación de capas de rechazo, aunque esta ficha no puede confirmar que se haya aplicado ese proceso concreto, ya que la model card del repositorio no documenta la metodología de entrenamiento ni de modificación. Tampoco se detalla la longitud de contexto, el dataset utilizado ni el proceso de alineación.

La relevancia de esta publicación es práctica: permite descargar el modelo en doce niveles de cuantización distintos, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que facilita su despliegue en hardware de consumo. Sin embargo, el repositorio no declara licencia, tiene cero descargas y cero valoraciones en el momento de redactar esta ficha, y no aporta información sobre evaluación o rendimiento. Se trata, por tanto, de un artefacto de conveniencia para inferencia local, no de un lanzamiento con documentación técnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de la familia Qwen2.5-Coder; no confirmado en la model card) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B), segun safetensors del modelo base |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) declarado en la model card |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas), generado desde un checkpoint HF en 16 bits |
| Tamano del repositorio | 68,1 GB |
| Libreria declarada | transformers |
| Pipeline | No disponible |
| Modelo base | haniqwafi/qwen-2.5-coder-custom-16bit-heretic |
| Cuantizado por | mradermacher |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento en la documentacion proporcionada. La model card del repositorio se limita a indicar que se trata de cuantizaciones estaticas del checkpoint `haniqwafi/qwen-2.5-coder-custom-16bit-heretic`, sin detallar el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineacion. Tampoco se especifica si el modelo base introdujo modificaciones estructurales respecto a Qwen2.5-Coder.

Los metadatos incrustados en el README de mradermacher indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que el flujo de trabajo consistio en convertir un checkpoint de HuggingFace a formato GGUF y aplicar posteriormente cuantizacion estatica sobre los tensores de salida. El autor senala explicitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion, y que podrian no llegar a publicarse. Esto implica que las cuantizaciones de baja precision (Q2_K, Q3_K_S y similares) pueden presentar una perdida de calidad superior a la que se obtendria con variantes imatrix del mismo tamano.

Como innovacion tecnica destacable unicamente cabe citar la disponibilidad de doce niveles de cuantizacion en un unico repositorio, desde 3,1 GB hasta 15,3 GB, lo que permite ajustar el compromiso entre calidad y consumo de memoria sin cambiar de modelo. No se documenta ninguna tecnica de atencion alternativa, decodificacion especulativa ni arquitectura hibrida.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` esta declarado explicitamente en el repositorio.
- Generacion y completado de codigo: por herencia de la familia Qwen2.5-Coder, aunque no se documenta de forma explicita en esta model card.
- Razonamiento multi-turno: soportado por el formato de chat de la familia Qwen, sin confirmacion documental en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada; no se declaran modulos multimodales.

## Casos de uso

- Asistente de autocompletado de codigo en el editor: el modelo puede ejecutarse en local con la cuantizacion Q4_K_M (4,8 GB) y ofrecer sugerencias de completado sin enviar el codigo a un servicio externo, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad.
- Generacion de codigo en pipelines de integracion continua: integrado mediante llama.cpp o un servidor compatible con la API de OpenAI, puede generar borradores de tests unitarios o parches a partir de un mensaje de commit o un issue.
- Reescritura y explicacion de codigo heredado: con 7,6 B de parametros y soporte conversacional, puede resumir funciones largas o traducir fragmentos entre lenguajes de programacion en sesiones de refactorizacion.
- Prototipado rapido en portatiles sin GPU dedicada: la cuantizacion Q2_K ocupa 3,1 GB y puede ejecutarse en CPU con llama.cpp, lo que permite trabajar en maquinas con 8 GB de RAM.
- Desarrollo de un asistente de documentacion tecnica: el modelo puede redactar docstrings y guias de API a partir de firmas de funciones y ejemplos de uso, en un flujo por lotes sobre el repositorio.
- Experimentacion con modelos desalineados o "abliterated": para investigadores que estudian el efecto de la eliminacion de capas de rechazo, aunque el repositorio no confirma que se haya aplicado ese proceso ni documenta su metodologia.
- Evaluacion comparativa de cuantizaciones: al ofrecer doce variantes del mismo checkpoint, permite medir de forma controlada la degradacion de la perplejidad entre niveles de cuantizacion en tareas de codigo.
- Despliegue en un servidor de inferencia ligero con multiples modelos: el formato GGUF y el tag `endpoints_compatible` facilitan su publicacion detras de una API compatible con OpenAI en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, MBPP ni similares), y los resultados de busqueda web devueltos no guardan relacion con el modelo: corresponden a articulos sobre la ciudad francesa de Annecy (Wikipedia, oficina de turismo y sitio municipal), por lo que no aportan ningun dato tecnico aprovechable.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion: Q2_K 3,1 GB; Q3_K_S 3,6 GB; Q3_K_M 3,9 GB; Q3_K_L 4,2 GB; IQ4_XS 4,4 GB; Q4_K_S 4,6 GB; Q4_K_M 4,8 GB; Q5_K_S 5,4 GB; Q5_K_M 5,5 GB; Q6_K 6,4 GB; Q8_0 8,2 GB; f16 15,3 GB.
- Margen adicional recomendado: anadir entre 1 y 3 GB para el contexto en memoria (KV cache), segun la longitud de secuencia configurada. Con contexto largo, el consumo crece de forma apreciable respecto a los tamanos de archivo indicados.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB y RTX 4090 24 GB pueden alojar sin problemas las cuantizaciones de 4 a 8 bits, e incluso f16 en el caso de las GPU con 24 GB, siempre que se reserve margen para el contexto.
- GPU profesionales: A100 40/80 GB y H100 80 GB pueden ejecutar f16 con contexto amplio y lotes grandes, aunque el modelo es pequeno para esas GPUs.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M y Q4_K_S (4,6-4,8 GB) funcionan en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060, incluso con contexto moderado.
- Ejecucion en CPU: viable con las cuantizaciones Q2_K, Q3_K y Q4_K mediante llama.cpp; se recomienda un minimo de 8 GB de RAM para Q2_K y 16 GB para Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI que acepten GGUF. El formato no es directamente compatible con vLLM ni con TGI, que requieren pesos safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros estructurales y licencia. Los valores de los modelos alternativos corresponden a informacion publica de sus respectivas fichas oficiales y no proceden de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/qwen-2.5-coder-custom-16bit-heretic-GGUF | 7,6 B | No disponible | No disponible | GGUF (12 cuantizaciones) | Derivado cuantizado; sin benchmarks ni licencia declarada |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | Modelo oficial, con evaluacion publicada |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 tokens | Licencia comunitaria Llama 2 | safetensors, GGUF | Enfocado a codigo, con restricciones de uso comercial |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 tokens | Licencia propia de DeepSeek con condiciones de uso | safetensors, GGUF | Buen rendimiento en generacion de codigo |

Conviene subrayar que la comparacion de rendimiento entre estas alternativas no puede realizarse con los datos disponibles, ya que el modelo objeto de esta ficha no publica resultados de evaluacion.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que deja en situacion de incertidumbre juridica cualquier uso comercial o redistribucion. Es imprescindible contactar con el autor del modelo base antes de utilizarlo en produccion.
- Riesgo de alineacion debil o inexistente: el sufijo "heretic" se asocia habitualmente a procesos de abliteration o eliminacion de comportamientos de rechazo. Si el modelo base ha sido modificado de este modo, es probable que genere contenido danino, ilegal o sesgado con mayor facilidad que un modelo alineado. El repositorio no documenta ni confirma este punto.
- Idiomas limitados al ingles: la model card declara unicamente `en`. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior al de modelos multilingues.
- Longitud de contexto desconocida: no se especifica la ventana de contexto efectiva, lo que impide dimensionar la memoria de la cache KV y limita la planificacion de despliegues con conversaciones largas o repositorios extensos.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S no cuentan con calibracion imatrix, segun indica el propio autor, por lo que la degradacion respecto al checkpoint original puede ser superior a la habitual en cuantizaciones ponderadas del mismo tamano.
- Ausencia de evaluacion: no hay benchmarks publicados ni trazas de evaluacion independiente. Cualquier afirmacion sobre su calidad en generacion de codigo es una extrapolacion de la familia Qwen2.5-Coder, no un dato verificado para este artefacto.
- Riesgo de alucinacion: inherente a los modelos de 7-8 B de parametros, especialmente en tareas de razonamiento largo, matematicas y generacion de APIs poco documentadas.
- Sesgos: no documentados. Un modelo entrenado predominantemente con codigo y texto en ingles tiende a reproducir sesgos de genero, origen y lenguaje presentes en repositorios publicos.
- Trazabilidad limitada: el modelo base pertenece a un usuario individual (`haniqwafi`) sin documentacion de entrenamiento, lo que dificulta auditar procedencia de datos, cumplimiento de licencias de codigo fuente o riesgos de contaminacion de benchmarks.
- Sin validacion de la comunidad: cero descargas y cero valoraciones en el momento de la consulta. No existe evidencia externa de funcionamiento correcto.
- Fecha de creacion inusual: el repositorio figura como creado el 26 de septiembre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/qwen-2.5-coder-custom-16bit-heretic-GGUF
- Modelo base en HuggingFace: https://huggingface.co/haniqwafi/qwen-2.5-coder-custom-16bit-heretic
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#qwen-2.5-coder-custom-16bit-heretic-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas sobre la ciudad de Annecy (https://fr.wikipedia.org/wiki/Annecy, https://en.wikipedia.org/wiki/Annecy, https://www.annecy.fr/, https://www.annecy-town.com/visiter-annecy_en/, https://www.lac-annecy.com/) y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs tecnicos, repositorios ni demos adicionales asociados a este modelo.
