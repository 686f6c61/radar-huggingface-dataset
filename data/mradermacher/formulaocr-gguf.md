# mradermacher/FormulaOCR-GGUF

## Resumen

FormulaOCR-GGUF es la version cuantizada en formato GGUF del modelo FormulaOCR, publicado por el usuario mradermacher a partir de los pesos originales de Stuart08/FormulaOCR. Se trata de un modelo de vision-lenguaje de pequeno tamano (aproximadamente 100,6 millones de parametros) orientado al reconocimiento optico de caracteres (OCR) de formulas, presumiblemente matematicas o cientificas, a partir de imagenes. El repositorio contiene unicamente los ficheros cuantizados, no los pesos originales en safetensors.

La relevancia de esta publicacion es practica: mradermacher es un perfil conocido por generar cuantizaciones GGUF de modelos de terceros para facilitar su ejecucion en llama.cpp y herramientas compatibles, incluyendo entornos con recursos limitados. Al tratarse de un modelo de ~100 M de parametros, el interes principal reside en la posibilidad de ejecutar OCR de formulas en CPU o en GPUs de consumo, sin depender de infraestructura de servidor.

No obstante, la informacion publica disponible es muy escasa: la model card se limita a listar los tipos de cuantizacion generados y a enlazar el modelo original. No se documentan la arquitectura, los datos de entrenamiento, los idiomas soportados ni la licencia, por lo que esta ficha debe interpretarse como una descripcion de la disponibilidad del artefacto GGUF mas que como una evaluacion tecnica completa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje orientado a OCR de formulas; detalles no publicados) |
| Parametros totales | 100.592.896 (~100,6 M) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con convert_type hf) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo original en la documentacion disponible. Por el nombre y el caso de uso (FormulaOCR), se trata de un modelo multimodal que recibe imagenes y produce texto, probablemente combinando un codificador visual con un decodificador de lenguaje de pequeno tamano, pero no hay confirmacion en la informacion proporcionada.

Tampoco se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion, presencia de pares imagen-formula), ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere que los pesos se convirtieron desde un checkpoint en formato Hugging Face y se cuantizaron con la herramienta de llama.cpp. El campo `skip_mmproj` esta vacio, lo que indica que no se excluyo el proyector multimodal de la cuantizacion, aunque no se detalla que ficheros GGUF adicionales se incluyen para la parte visual.

## Capacidades

- Reconocimiento de formulas a partir de imagenes: el proposito declarado del modelo es el OCR de formulas, presumiblemente convirtiendo capturas o escaneos en notacion textual (LaTeX u otra).
- Procesamiento multimodal imagen a texto: al ser un modelo de OCR, acepta entrada visual y genera salida textual.
- Ejecucion local mediante llama.cpp: al estar en formato GGUF, puede cargarse en runtimes compatibles sin necesidad de Python ni de frameworks de deep learning.
- Cuantizacion flexible: la disponibilidad de 12 variantes (desde Q2_K hasta F16) permite ajustar el equilibrio entre calidad y consumo de memoria.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Modo thinking, vision general, audio: solo se documenta la faceta de OCR de formulas; no hay evidencia de otras capacidades.

## Casos de uso

- Digitalizacion de apuntes y libros de matematicas: el modelo puede procesar imagenes de paginas escaneadas y extraer las formulas en formato textual para su inclusion en LaTeX o Markdown, reduciendo el trabajo manual de transcripcion.
- Construccion de bases de datos cientificas: en pipelines de ingestion de papers, el modelo puede convertir figuras y ecuaciones en texto estructurado para indexacion y busqueda semantica.
- Asistencia a estudiantes: integrado en una aplicacion de escritorio o movil, permite fotografiar una formula y obtener su representacion editable, util para resolver ejercicios o reutilizar expresiones.
- Preprocesado en entornos sin GPU: al ser un modelo de ~100 M de parametros en GGUF, puede ejecutarse en CPU en servidores modestos o en portatiles, lo que lo hace adecuado para tareas batch de OCR sin infraestructura dedicada.
- Integracion en herramientas de edicion cientifica: plugins de editores de LaTeX o notebooks que aceptan una imagen recortada de una ecuacion y devuelven el codigo correspondiente.
- Prototipado rapido y evaluacion: gracias a las multiples cuantizaciones, un equipo puede comparar la calidad de Q4_K_M frente a F16 en su propio conjunto de imagenes antes de decidir un despliegue, con un coste de almacenamiento de apenas 0,3 GB para el repositorio completo.
- Automatizacion de correccion de examenes: extraccion de las formulas escritas o impresas en respuestas para su comparacion automatica con la solucion esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~100,6 M de parametros, la inferencia en F16 requiere aproximadamente 0,2 GB solo para los pesos, mas el coste del codificador visual y del contexto; en Q4_K_M el peso de los tensores baja a decenas de megabytes. El cuello de botella real sera la parte multimodal, cuyo tamano no se detalla.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien es viable en GPUs integradas.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en muchas integradas, dado el reducido numero de parametros.
- CPU: al ser un modelo pequeno en GGUF, es candidato claro a inferencia en CPU con llama.cpp, aunque el rendimiento dependera del preprocesado de imagen.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con la API de llama.cpp). No se documenta soporte para vLLM o TGI, que habitualmente no cubren modelos multimodales GGUF de este tipo.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FormulaOCR-GGUF (este) | ~100,6 M | no disponible | GGUF | no disponible | Cuantizacion de FormulaOCR, orientada a OCR de formulas |
| FormulaOCR (original, Stuart08) | no disponible | no disponible | safetensors (presumiblemente) | no disponible | Pesos de origen; menos practico para ejecucion local |
| Alternativas de OCR de formulas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con otros modelos de OCR de formulas.

## Limitaciones y advertencias

- La model card no documenta la licencia, por lo que no puede confirmarse si el uso comercial esta permitido; es imprescindible consultar el repositorio original Stuart08/FormulaOCR antes de cualquier despliegue en produccion.
- No se especifican los idiomas ni los dominios cubiertos; es probable que el modelo este entrenado para formulas en notacion matematica estandar, pero no hay confirmacion.
- No hay datos sobre la tasa de error del OCR ni sobre el formato de salida esperado (LaTeX, MathML, texto plano), lo que dificulta planificar su integracion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir formulas sintacticamente plausibles pero incorrectas, especialmente en imagenes de baja calidad o con notacion ambigua; se recomienda validacion posterior.
- La cuantizacion agresiva (Q2_K, Q3_K_S) puede degradar la precision del reconocimiento; para uso en produccion conviene evaluar Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en la misma fecha, lo que indica que no ha sido validado por la comunidad.
- Al ser una cuantizacion de terceros, no hay garantia de que el proceso de conversion preserve todas las capacidades del modelo original, en particular el proyector multimodal.
- No se documenta el comportamiento con imagenes de alta resolucion, multiples formulas por pagina ni diagramas complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/FormulaOCR-GGUF
- Modelo original: https://huggingface.co/Stuart08/FormulaOCR
