# MuhammadZahid123/Scalpel-VL-1.6B-GGUF

## Resumen

Scalpel-VL-1.6B-GGUF es una versión cuantizada en formato GGUF del modelo multimodal freeai-org/Scalpel-VL-1.6B-Animal, publicada en el repositorio MuhammadZahid123/Scalpel-VL-1.6B-GGUF. Se trata de un modelo de visión-lenguaje (VL) de pequeño tamaño: los pesos en safetensors del modelo base suman 1.267.550.976 parámetros (aproximadamente 1,27 mil millones), aunque el nombre comercial del repositorio indica "1.6B". La model card atribuye la cuantización a mradermacher y distribuye tanto los pesos del modelo de lenguaje como los ficheros `mmproj` (proyección multimodal) necesarios para procesar imágenes.

El interés de esta ficha radica en su perfil de despliegue: al ser un modelo de ~1,3 B de parámetros con cuantizaciones que van desde 0,7 GB (Q2_K) hasta 2,6 GB (f16), es posible ejecutarlo en hardware de consumo, incluso en CPU, manteniendo capacidad de entrada visual. Los idiomas declarados son inglés (en) y chino (zh), y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales según los metadatos del repositorio.

No obstante, la información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, no hay datos de benchmarks, no se especifica la longitud de contexto, la composición del dataset de entrenamiento ni detalles de la arquitectura más allá de la presencia del proyector multimodal. Además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado documentación técnica adicional por parte del autor de la cuantización ni del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; el repositorio incluye ficheros `mmproj`, lo que confirma un codificador visual con proyector hacia el modelo de lenguaje; no se detalla el tipo de transformer) |
| Parametros totales | 1.267.550.976 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas proyector multimodal `mmproj` en f16 y Q8_0 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (quants estaticos); el modelo base se distribuye presumiblemente en safetensors, no confirmado en la informacion disponible |
| Tarea declarada (pipeline) | no disponible; etiqueta `conversational` presente |
| Tamano del repositorio | 13,2 GB |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los unicos indicios son los metadatos y los ficheros distribuidos: la presencia de `Scalpel-VL-1.6B.mmproj-f16.gguf` y `Scalpel-VL-1.6B.mmproj-Q8_0.gguf` confirma que se trata de un modelo multimodal con un proyector que traduce representaciones visuales al espacio del modelo de lenguaje, siguiendo el patron habitual de los VLM abiertos (codificador de vision + proyector + LLM decoder). El sufijo "Animal" del modelo base sugiere un posible ajuste fino orientado a imagenes o dominios relacionados con animales, pero esto no esta confirmado en la informacion disponible.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La model card del repositorio cuantizado es exclusivamente informativa sobre el proceso de cuantizacion: indica que son quants estaticos (`quantize_version: 2`, `output_tensor_quantised: 1`) generados a partir del modelo base, y senala que no hay quants ponderados/imatrix previstos por el momento. La unica innovacion tecnica documentada es, por tanto, el propio proceso de cuantizacion a multiples niveles de bits para facilitar el despliegue en hardware variado.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, por lo que el modelo esta orientado a dialogos multi-turno.
- Procesamiento de imagenes: la presencia de ficheros `mmproj` confirma capacidad de vision (entrada de imagenes junto a texto), aunque no se detalla si soporta multiples imagenes por prompt ni resoluciones maximas.
- Multilingue limitado: los idiomas declarados son ingles y chino; no hay soporte documentado para castellano ni otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio o video: no disponible; solo se confirma modalidad texto-imagen.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere integracion con infraestructuras de inferencia gestionadas que aceptan GGUF.

## Casos de uso

- Descripcion automatica de imagenes en local: el modelo puede generar pies de foto o descripciones textuales de imagenes cargadas desde disco. Con cuantizaciones de ~0,9 GB (Q4_K_M) mas el proyector `mmproj-Q8_0` (0,5 GB), el pipeline completo cabe en equipos sin GPU dedicada, lo que lo hace util para organizar fototecas o generar metadatos de imagenes de forma offline.
- Clasificacion y etiquetado visual de bajo coste: usar el modelo como clasificador generativo (por ejemplo, "describe el animal de la imagen") para preetiquetar datasets. Al ser un modelo de ~1,3 B, el coste por inferencia es muy inferior al de VLM de 7 B o mas, lo que permite procesar lotes grandes en una sola GPU consumer.
- Asistencia de accesibilidad en dispositivos: integrado en aplicaciones de escritorio o moviles que describan el entorno a personas con discapacidad visual, aprovechando que el modelo cuantizado a Q4 puede ejecutarse en CPU y no requiere conexion a servicios en la nube.
- Preprocesado en pipelines de vision por computador: generar descripciones o respuestas sobre recortes de imagen antes de pasarlos a un modelo mayor, actuando como filtro o anotador previo. El formato GGUF permite cargarlo con llama.cpp dentro de un pipeline Python existente.
- Educacion y material didactico sobre fauna: dado el sufijo "Animal" del modelo base, un uso plausible es la generacion de explicaciones o preguntas sobre imagenes de animales en ingles o chino; conviene validar la calidad real con pruebas propias antes de desplegarlo.
- Prototipado rapido de productos multimodales: gracias a la licencia MIT y a la disponibilidad de 13 niveles de cuantizacion, sirve para validar una idea de producto (chat con imagenes, buscador visual) en una fase temprana con coste de infraestructura minimo, antes de migrar a un modelo mayor.
- Inferencia en el borde (edge) o entornos air-gapped: el fichero f16 completo ocupa 2,6 GB y el Q2_K solo 0,7 GB, por lo que puede desplegarse en dispositivos con almacenamiento limitado y sin acceso a red, algo relevante en entornos industriales o de investigacion con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio cuantizado ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion. Tampoco se han facilitado comparaciones de perplejidad entre las distintas cuantizaciones (la model card enlaza una grafica generica de ikawrakow sobre perdida de calidad por tipo de quant, pero no ofrece valores medidos para este modelo concreto). Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero GGUF elegido (tamanos reales publicados):
  - Q2_K: 0,7 GB
  - Q3_K_S / Q3_K_M: 0,8 GB
  - Q3_K_L / IQ4_XS / Q4_K_S / Q4_K_M: 0,9 GB
  - Q5_K_S / Q5_K_M: 1,0 GB
  - Q6_K: 1,1 GB
  - Q8_0: 1,5 GB
  - f16: 2,6 GB
- Proyector multimodal adicional (obligatorio para entrada de imagen): `mmproj-f16` 0,9 GB o `mmproj-Q8_0` 0,5 GB.
- VRAM total practica: aproximadamente 1,4-2,0 GB con Q4_K_M mas `mmproj-Q8_0`, incluyendo cache KV para contextos moderados; en torno a 3,5 GB con f16 y `mmproj-f16`. Estas cifras son estimaciones a partir de los tamanos de fichero publicados, no mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida). No requiere A100 ni H100; usarlas seria desproporcionado para 1,3 B de parametros.
- Caber en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU con RAM suficiente (menos de 4 GB para los quants mas pequenos).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, KoboldCpp) para los ficheros GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors. Para vision es imprescindible cargar tambien el fichero `mmproj` correspondiente.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de prefill en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad / notas |
|---|---|---|---|---|---|
| Scalpel-VL-1.6B-GGUF (este repositorio) | 1.267.550.976 | no disponible | MIT | GGUF (12 quants + mmproj) | 0 descargas, 0 likes; cuantizado por mradermacher segun la model card |
| freeai-org/Scalpel-VL-1.6B-Animal (modelo base) | no disponible en la informacion proporcionada | no disponible | MIT (segun metadatos del repositorio cuantizado) | no disponible | Referenciado como `base_model`; sin datos tecnicos en la informacion disponible |
| Alternativas de tamano similar (VLM abiertos de ~1-3 B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada; no se incluyen cifras para no inventarlas |

No se dispone de informacion verificada sobre modelos comparables en la documentacion facilitada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o calidad frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni pruebas de calidad, ni comparaciones de perplejidad entre cuantizaciones. Desplegar este modelo en produccion sin una evaluacion propia es arriesgado.
- Riesgo de alucinacion: como cualquier modelo generativo de ~1,3 B, es especialmente propenso a inventar detalles en descripciones de imagenes, especialmente en escenas complejas o con texto pequeno. No se ha documentado ningun mecanismo de mitigacion.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. No hay soporte documentado de castellano; el rendimiento en espanol es, por tanto, desconocido y probablemente deficiente.
- Longitud de contexto desconocida: al no especificarse la ventana de contexto, no se puede planificar su uso en tareas que requieran documentos largos o dialogos extensos.
- Capacidades no verificadas: no hay confirmacion de soporte de tool calling, agentes, razonamiento multi-paso ni modo de pensamiento. No deben asumirse.
- Posible dominio restringido: el sufijo "Animal" del modelo base sugiere un ajuste fino sobre un dominio concreto; fuera de ese dominio el rendimiento podria degradarse notablemente, aunque esto no esta confirmado.
- Ambiguedad en el nombre: el repositorio se llama "1.6B" mientras que el recuento real de parametros en safetensors es de 1.267.550.976 (aproximadamente 1,27 B). Probablemente el nombre incluye el codificador visual, pero no se ha confirmado.
- Trazabilidad del repositorio: el autor del repositorio (MuhammadZahid123) difiere del autor de la cuantizacion declarada en la model card (mradermacher), y los enlaces internos de la model card apuntan a `huggingface.co/mradermacher/Scalpel-VL-1.6B-GGUF`. Conviene verificar la procedencia de los ficheros antes de confiar en ellos.
- Sin senales de adopcion: 0 descargas y 0 likes. No hay evidencia de uso por parte de la comunidad, ni issues, ni validacion independiente de la calidad de los quants.
- Restricciones de licencia: la licencia declarada es MIT, permisiva para uso comercial, pero se hereda del modelo base; conviene verificar que la licencia MIT del modelo base efectivamente cubre todos sus componentes (codificador visual y dataset), algo que no se detalla.
- Idoneidad para produccion: con este nivel de documentacion, el modelo es adecuado para experimentacion y prototipado, no para sistemas criticos sin validacion exhaustiva previa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MuhammadZahid123/Scalpel-VL-1.6B-GGUF
- Modelo base: https://huggingface.co/freeai-org/Scalpel-VL-1.6B-Animal
- Repositorio de cuantizacion referenciado en la model card: https://huggingface.co/mradermacher/Scalpel-VL-1.6B-GGUF
- Pagina resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Scalpel-VL-1.6B-GGUF
- Guia de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de tipos de quant de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Paper o publicacion tecnica del modelo: no disponible
- Demo o espacio de inferencia: no disponible
