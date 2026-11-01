# Jinstudio/Unlimited-OCR-2

## Resumen

Unlimited OCR 2 es un modelo vision-language especializado en extraccion de texto (OCR) y parseo de documentos, desarrollado por Baidu. Se presenta como la evolucion del modelo Unlimited-OCR 1.0 y su objetivo declarado es llevar el OCR a lo que el autor denomina "OCR-3.0", con parseo de documentos de horizonte ilimitado. El modelo resuelve el problema del coste cuadratico de la atencion cuando se procesan documentos muy largos (decenas o cientos de paginas), manteniendo una latencia y un consumo de memoria casi constantes por paso de decodificacion.

La innovacion principal es Sparse Reference Sliding Window Attention (SR-SWA), que comprime las interacciones texto-visual de secuencias ultra-largas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens). Con ello el modelo puede procesar documentos de longitud no acotada dentro de una ventana de contexto finita. El modelo tiene 3.343.978.497 parametros totales, se distribuye en formato safetensors, requiere `trust_remote_code` en Transformers y su licencia es MIT.

Es relevante ahora porque propone una alternativa arquitectonica al escalado cuadratico de la atencion en tareas de parseo documental, un escenario donde los modelos vision-language genericos suelen degradarse o disparar el coste de inferencia. Incluye ademas un benchmark propio, MarathonDocBench, orientado a documentos de centenares de paginas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con Sparse Reference Sliding Window Attention (SR-SWA); detalles completos no disponibles |
| Parametros totales | 3.343.978.497 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor afirma parseo de horizonte ilimitado con ventana de contexto finita) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un vision-language transformer con un mecanismo de atencion denominado Sparse Reference Sliding Window Attention (SR-SWA). Segun la model card, SR-SWA comprime las interacciones de atencion texto-visual de secuencias ultra-largas a un conjunto fijo de referencias de trabajo (por ejemplo, 512 tokens), lo que acota la complejidad computacional y mantiene la latencia por paso de decodificacion y el consumo de memoria practicamente constantes independientemente de la longitud del documento. Esto elimina, segun el autor, el escalado cuadratico de la atencion y los cuellos de botella de memoria a medida que crece el documento.

La inferencia soporta dos modos de codificacion de pagina: modo base, con una vista global por pagina (usado en el parseo multipagina), y modo gundam, con tiling dinamico (usado por defecto en el parseo de una sola pagina). El prompt multipagina se construye automaticamente como `"<PAGE><image>" * num_pages + "Multi page parsing."`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de texto (OCR) y parseo estructurado de documentos a partir de imagenes de pagina.
- Parseo multipagina en una sola peticion, con uso de contexto entre paginas.
- Parseo de documentos de muy larga longitud (decenas y centenares de paginas) con coste de atencion acotado.
- Salida con marcadores `<PAGE>` por cada pagina de entrada, preservando el orden de las imagenes.
- Procesamiento multilingue.
- Inferencia nativa en Transformers y soporte de SGLang (recomendado para servir) y vLLM.
- Soporte de entrenamiento con ms-swift.
- Tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de archivos administrativos: el modelo puede procesar un expediente completo de decenas de paginas en una sola peticion (`infer_multi`) y aprovechar el contexto entre paginas para mantener coherencia en tablas y referencias cruzadas.
- Extraccion de texto de libros y manuales tecnicos: con SR-SWA el coste por paso no crece con la longitud del documento, lo que permite abordar volumenes de centenares de paginas sin trocear manualmente el contenido.
- Procesamiento de facturas y albaranes en lote: el modo gundam con tiling dinamico es adecuado para paginas individuales con maquetacion densa, donde conviene una codificacion de alta resolucion.
- Construccion de pipelines RAG sobre documentacion escaneada: el parseo multipagina en una sola llamada reduce la logica de orquestacion y facilita la conservacion del orden y la estructura del documento original.
- Migracion de fondos documentales a texto plano: al tener licencia MIT, puede integrarse en herramientas internas y productos comerciales sin restricciones de uso derivadas de la licencia.
- Servicio de OCR de alta concurrencia: el despliegue con SGLang o vLLM permite servir el modelo con latencia por paso estable, lo que simplifica el dimensionamiento de infraestructura frente a modelos con atencion cuadratica.

## Benchmarks y rendimiento

La model card afirma rendimiento state-of-the-art en benchmarks de documentos de decenas de paginas (MPDocBench) y de centenares de paginas (MarathonDocBench), pero no se incluyen cifras numericas en la informacion disponible. No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 6,7 GB solo para pesos (3,34 mil millones de parametros), mas memoria para activaciones y cache; no se dispone de cifra oficial.
- La model card indica que las pruebas con Transformers se realizaron en una NVIDIA A800-80GB con Python 3.10, `torch==2.13.0`, `transformers==4.52.1`, `huggingface-hub==0.36.0` y `tokenizers==0.21.4`.
- Por tamano, los pesos en bfloat16 caben en GPU de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090), si bien el pico real depende de la resolucion de imagen y del modo de codificacion; no hay mediciones publicadas.
- Opciones de despliegue: Transformers nativo (con `trust_remote_code=True`, `use_safetensors=True` y `torch_dtype=torch.bfloat16`), SGLang (recomendado por el autor para servir) y vLLM.
- Latencia y throughput: no disponibles. El autor afirma que la latencia por paso y el consumo de memoria se mantienen casi constantes con la longitud del documento gracias a SR-SWA, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited OCR 2 (Baidu) | 3,34 mil millones | no disponible (horizonte ilimitado declarado) | OCR con SR-SWA para documentos ultra-largos | MIT | HuggingFace, ModelScope, Baidu Cloud |
| Unlimited-OCR 1.0 (Baidu) | no disponible | no disponible | OCR orientado a superar DeepSeek-OCR | no disponible | GitHub (rama UnlimitedOCR1.0) |
| DeepSeek-OCR (DeepSeek) | no disponible | no disponible | OCR vision-language | no disponible | GitHub |

No se dispone de datos de rendimiento comparativos numericos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de robustez frente a dominios o idiomas concretos.
- Riesgo de alucinacion inherente a los modelos generativos: el texto extraido puede no corresponder literalmente al contenido de la imagen, especialmente en documentos degradados o con maquetacion compleja; se recomienda validacion en produccion.
- No se especifica la longitud de contexto numerica ni el limite practico de paginas por peticion; el caracter "ilimitado" es una afirmacion del autor que conviene verificar con el propio corpus.
- El soporte multilingue se declara de forma generica, sin lista de idiomas ni metricas por idioma.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar dicho codigo antes de desplegarlo.
- La licencia MIT permite uso comercial, pero no se detallan condiciones adicionales sobre los datos de entrenamiento ni sobre las dependencias (por ejemplo, PaddlePaddle en el ecosistema de Baidu).
- El modelo tiene pocas descargas (27) y ningun "like" en el momento de la consulta, lo que sugiere una adopcion todavia muy limitada y escasa validacion externa.
- No se dispone de informacion sobre cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en hardware modesto requeriria conversiones propias no verificadas.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/Unlimited-OCR-2
- HuggingFace oficial (Baidu): https://huggingface.co/baidu/Unlimited-OCR-2
- GitHub: https://github.com/baidu/Unlimited-OCR
- arXiv: https://arxiv.org/abs/2606.23050
- PDF del paper: https://huggingface.co/baidu/Unlimited-OCR-2/blob/main/Unlimited-OCR-2.pdf
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR-2
- Dataset MarathonDocBench: https://huggingface.co/datasets/baidu/MarathonDocBench
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR-2
- Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift: https://github.com/modelscope/ms-swift
- vLLM: https://github.com/vllm-project/vllm
- Twitter de Baidu: https://x.com/Baidu_Inc
