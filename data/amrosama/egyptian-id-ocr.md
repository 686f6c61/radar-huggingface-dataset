# amrosama/egyptian-id-ocr

## Resumen

Egyptian ID OCR es un adaptador LoRA de PEFT sobre el modelo base PaddlePaddle/PaddleOCR-VL, desarrollado por Amr Osama Abdellatif. Su funcion es extraer de forma conjunta seis campos estructurados del anverso completo de un carnet de identidad egipcio (first_name, paternal_names, address, governorate, birthdate y national_id) y devolverlos como un objeto JSON, sin necesidad de un detector de campos independiente. El modelo resuelve un problema de extraccion estructurada en OCR arabe sobre documentos oficiales con maquetacion fija y texto denso.

El adaptador tiene un rango LoRA de 16, alpha de 32, dropout de 0 y 6.045.696 parametros entrenables, manteniendo el modelo base congelado. El ajuste de tarea se realizo con carnets sinteticos, mientras que los carnets reales se emplearon para desarrollo y evaluacion. El modelo base PaddleOCR-VL aporta las capacidades de vision-lenguaje y el adaptador especializa la salida hacia el esquema JSON requerido.

Es relevante para desarrolladores que necesiten digitalizar documentos de identidad egipcios en flujos de KYC, alta de clientes o verificacion documental, ya que ofrece una salida estructurada y estable con una licencia permisiva CC BY 4.0 que permite uso comercial con atribucion. El repositorio es muy reciente y de baja difusion (5 descargas, 0 likes en el momento de la consulta), por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre PaddleOCR-VL (modelo vision-lenguaje) |
| Parametros totales | 6.045.696 parametros entrenables en el adaptador; parametros totales del modelo base no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 16, alpha 32, dropout 0) aplicado sobre el modelo base PaddlePaddle/PaddleOCR-VL, que se mantiene congelado durante el entrenamiento. La revision del modelo base registrada es 7fa00a8c55b735ba51ba49a9058f3f9c57a99a11. El adaptador realiza una extraccion conjunta de los seis campos a partir de una unica imagen del anverso del carnet, sin detector de campos separado, y genera la salida como JSON con claves de tipo string.

El ajuste de tarea se realizo exclusivamente con carnets sinteticos; los carnets reales se usaron para desarrollo y evaluacion. El entorno de entrenamiento registrado empleo Transformers 5.2.0 y PEFT 0.19.1. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Una particularidad funcional es que la fecha de nacimiento puede derivarse de los digitos del numero de identidad nacional cuando no aparece impresa de forma separada.

## Capacidades

- Extraccion estructurada de seis campos del anverso de un carnet de identidad egipcio: first_name, paternal_names, address, governorate, birthdate y national_id.
- Salida en formato JSON con claves de tipo string, sin detector de campos intermedio.
- Preservacion del texto arabe en la salida.
- Normalizacion del numero de identidad nacional a 14 digitos ASCII sin espacios.
- Normalizacion de la fecha de nacimiento al formato YYYY/MM/DD, con derivacion desde el numero de identidad nacional cuando no esta impresa.
- Extraccion de la linea inferior completa de direccion (incluyendo localidad, separadores y gobernacion) en la clave governorate.
- Procesamiento de imagen a texto (pipeline image-text-to-text) mediante prompt de instrucciones fijo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Onboarding digital y KYC: el adaptador extrae nombre, direccion y numero de identidad del anverso del carnet en una sola pasada y devuelve JSON listo para validar contra un formulario, reduciendo la captura manual en procesos de alta de clientes.
- Verificacion documental en banca y fintech: integrado en un pipeline de validacion de identidad, permite comprobar que los datos declarados por el usuario coinciden con los del carnet antes de aprobar la cuenta.
- Digitalizacion de archivos fisicos: para entidades que conservan expedientes en papel, el modelo convierte lotes de imagenes de carnets en registros estructurados y consultables.
- Automatizacion de back office: en procesos de contratacion o registro presencial, el operador fotografia el carnet y el sistema rellena los campos del expediente sin tecleo manual.
- Extraccion de fecha de nacimiento para calculo de edad: el modelo deriva la fecha desde el numero de identidad nacional cuando no aparece impresa, lo que simplifica flujos de verificacion de mayoria de edad.
- Normalizacion de direcciones para logistica o servicios: la clave governorate conserva la linea inferior completa, lo que permite segmentar por gobernacion y localidad a partir del texto extraido.
- Evaluacion e investigacion en OCR arabe: sirve como punto de partida para experimentos de extraccion estructurada sobre documentos oficiales arabes con tecnicas de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base PaddleOCR-VL, que no se detalla en la ficha.
- GPU recomendadas: no disponibles; el ejemplo de codigo del autor usa CUDA con precision bfloat16 y atencion SDPA, lo que implica una GPU NVIDIA compatible con bfloat16.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el autor documenta carga mediante PyTorch, Transformers y PEFT, con AutoProcessor y PaddleOCRVLForConditionalGeneration. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo usa max_new_tokens=384, do_sample=False y use_cache=True, pero no se aportan medidas de rendimiento.
- Preprocesamiento de imagen documentado: shortest_edge de 256 * 28^2 y longest_edge de 768 * 28^2, con padding_side izquierdo en el tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Egyptian ID OCR (este modelo) | 6.045.696 entrenables (LoRA) | No disponible | Extraccion estructurada de carnet egipcio sobre PaddleOCR-VL | CC BY 4.0 | HuggingFace, 5 descargas |
| PaddlePaddle/PaddleOCR-VL (modelo base) | No disponible | No disponible | OCR y vision-lenguaje general | No disponible en la informacion | HuggingFace |
| Alternativas especializadas en OCR de documentos de identidad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente con carnets sinteticos; el rendimiento sobre carnets reales puede diferir y debe validarse con un conjunto propio antes de produccion.
- Solo procesa el anverso del carnet; no se documenta soporte para el reverso ni para otros documentos.
- Solo soporta arabe (ar); no se documentan capacidades multilingues.
- La salida depende de usar exactamente el prompt de entrenamiento; variaciones en el prompt pueden degradar la extraccion.
- El campo governorate contiene la linea inferior completa, no solo el nombre de la gobernacion; los consumidores deben tenerlo en cuenta al parsear.
- La fecha de nacimiento puede derivarse del numero de identidad nacional, lo que introduce dependencia de la correcta lectura de los 14 digitos.
- Riesgo de alucinacion y de errores de OCR en imagenes de baja calidad, giradas o con recortes incorrectos; el modelo espera una imagen recortada o rectificada del anverso completo.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion a Amr Osama Abdellatif, enlace a la licencia e indicacion de cambios; deben conservarse los avisos de atribucion al redistribuir.
- La licencia del modelo base PaddleOCR-VL debe verificarse por separado, ya que el adaptador no la sustituye.
- El ejemplo de inferencia del autor no se ha vuelto a ejecutar como parte del empaquetado de la release, segun la propia model card.
- El repositorio es muy reciente y con muy poca difusion, por lo que no hay evidencia comunitaria de robustez en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amrosama/egyptian-id-ocr
- Modelo base PaddleOCR-VL: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Repositorio del adaptador (segun la model card): https://huggingface.co/amrosama/egyptian-id-ocr
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
