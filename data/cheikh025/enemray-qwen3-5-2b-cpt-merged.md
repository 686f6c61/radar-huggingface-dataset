# cheikh025/enemray-qwen3.5-2b-cpt-merged

## Resumen

El modelo `cheikh025/enemray-qwen3.5-2b-cpt-merged` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-2B-Base`, desarrollado por el usuario cheikh025. Se trata de un modelo de 2.274 millones de parámetros (aproximadamente 2,27 mil millones) perteneciente a la familia Qwen3.5 de Alibaba Cloud, que destaca por su arquitectura multimodal unificada (visión-lenguaje) y su capacidad de razonamiento mejorada respecto a generaciones anteriores. El ajuste se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que el convencional.

El modelo está etiquetado con el pipeline `image-text-to-text`, lo que sugiere que el modelo base puede procesar entradas de imagen y texto, aunque el fine-tune en sí no especifica si mantiene esas capacidades multimodales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. A pesar de ser un modelo pequeño, su relevancia radica en la posibilidad de desplegarlo en entornos con recursos limitados, como dispositivos edge o aplicaciones en tiempo real, manteniendo un rendimiento competitivo para su tamaño.

Sin embargo, la documentación proporcionada es muy escasa: no se detallan los datos de entrenamiento, el método de ajuste (SFT, RLHF, DPO, etc.) ni las capacidades específicas del modelo final. Esto limita la evaluación objetiva de su rendimiento y aplicabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, base multimodal) |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (formato safetensors, compatible con cuantizacion estandar) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-2B-Base`, que según la documentación oficial de Qwen3.5 es un modelo de lenguaje multimodal con "fusión temprana" de tokens de imagen y texto, entrenado sobre billones de tokens multimodales. Esta arquitectura permite un rendimiento superior en tareas de razonamiento, codificacion, agentes y comprension visual en comparacion con modelos de la serie Qwen3-VL. El tamaño de 2B lo posiciona como una variante "equilibrada" para inferencia en dispositivos.

El fine-tune fue realizado con Unsloth (una libreria que optimiza el entrenamiento de modelos) y la libreria TRL de Hugging Face, logrando una velocidad de entrenamiento dos veces superior a la estandar. No se proporcionan detalles sobre el dataset utilizado, el numero de pasos, el metodo de optimizacion (SFT, DPO, RLHF) ni las tecnicas de regularizacion aplicadas. Tampoco se indica si el ajuste conserva las capacidades multimodales del modelo base o si se limito a texto.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto coherente en ingles, dado que es un fine-tune de un modelo de lenguaje.
- Conversacion: la etiqueta `conversational` sugiere que el modelo esta optimizado para dialogos multi-turno, aunque no se especifican detalles.
- Multimodalidad (potencial): el modelo base soporta entrada de imagenes y texto, pero el fine-tune no confirma si esta capacidad se mantiene. Se recomienda verificar experimentalmente.
- Tool calling / function calling: no se menciona en la documentacion, aunque el modelo base Qwen3.5 podria soportarlo; no hay confirmacion para este fine-tune.
- Razonamiento y codigo: el modelo base tiene mejoras en estas areas, pero el fine-tune no documenta su rendimiento especifico.

## Casos de uso

- Chatbots de atencion al cliente: al ser un modelo pequeno (2,27 B), puede desplegarse en servidores modestos o en el edge para gestionar conversaciones basicas en ingles, con baja latencia.
- Asistentes virtuales en dispositivos moviles: su tamano permite ejecutarlo en smartphones o dispositivos IoT con cuantizacion, ofreciendo respuestas generativas sin conexion a la nube.
- Prototipado rapido de aplicaciones de IA: gracias a su licencia Apache 2.0 y su formato safetensors, es facil de integrar en pipelines de desarrollo con Transformers o vLLM.
- Generacion de contenido en ingles: puede utilizarse para redactar textos cortos, resumir documentos o completar plantillas, aunque su calidad dependera del fine-tune.
- Educacion y experimentacion: como modelo de tamano reducido, es util para ensenar tecnicas de fine-tuning o para probar metodologias de evaluacion sin requerir hardware costoso.
- Sistemas de recomendacion conversacional: integrado en un backend, puede mantener contexto limitado (si la ventana de contexto es suficiente) para sugerir productos o servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. Se recomienda realizar evaluaciones propias antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: basandose en el numero de parametros (2,27 B), se estima:
  - FP16: ~4,5 GB
  - Int8: ~2,3 GB
  - Int4: ~1,2 GB
  (Estas cifras son orientativas y dependen de la implementacion y el contexto).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar el modelo en FP16. Para cuantizacion Int4, una GPU con 2-4 GB es suficiente (ej. GTX 1650, Jetson Orin Nano).
- Compatibilidad con consumer GPU: si, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con TGI, o cualquier framework compatible con safetensors.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna (RTX 4090), se espera una latencia de decenas de milisegundos por token, pero depende de la cuantizacion y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B (base) | 2,27 B | No disponible | Apache 2.0 | Modelo original, multimodal |
| Qwen2.5-1.5B | 1,54 B | 32 K (tipico) | Apache 2.0 | Generacion anterior, solo texto |
| Llama-3.2-3B | 3,21 B | 128 K | Llama 3.2 (uso comercial permitido) | Modelo de Meta, solo texto |

No se dispone de datos de rendimiento comparativo para este fine-tune especifico. La comparativa se limita a parametros y licencia. Se recomienda consultar benchmarks publicos de Qwen3.5-2B para tener una referencia del modelo base.

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifican los datos de entrenamiento, el metodo de ajuste ni las capacidades finales, lo que dificulta la evaluacion de sesgos y alucinaciones.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o temas especializados.
- Idioma limitado: solo se declara soporte para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Multimodalidad no confirmada: aunque el pipeline indica `image-text-to-text`, el fine-tune podria haber eliminado la capacidad de procesar imagenes. Es necesario probar.
- Sin garantias de produccion: al no haber benchmarks ni evaluaciones publicas, su uso en entornos criticos requiere validacion previa.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cheikh025/enemray-qwen3.5-2b-cpt-merged
- Repositorio de Qwen3.5 (GitHub): https://github.com/ABDtmx/Qwen3.5
- Documentacion de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Pagina de Qwen3.5:2b en Ollama: https://ollama.com/library/qwen3.5:2b
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
