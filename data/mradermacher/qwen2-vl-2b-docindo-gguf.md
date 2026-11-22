# mradermacher/Qwen2-VL-2B-DocIndo-GGUF

## Resumen

Qwen2-VL-2B-DocIndo-GGUF es la version cuantizada en formato GGUF del modelo danielsyahputra/Qwen2-VL-2B-DocIndo, un fine-tuning del modelo multimodal Qwen2-VL-2B de Alibaba dirigido a la comprension de documentos, presumiblemente en contexto indonesio segun indica el sufijo "DocIndo" del nombre. La cuantizacion ha sido realizada por mradermacher, un actor habitual en la publicacion de versiones GGUF de modelos populares para su uso con llama.cpp y herramientas derivadas.

El modelo base Qwen2-VL-2B pertenece a la familia Qwen2-VL, una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de vision-lenguaje, incluyendo OCR, comprension de documentos y respuesta a preguntas sobre imagenes. El repositorio contiene unicamente pesos cuantizados estaticos en varios niveles de precision (desde Q2_K hasta f16), ademas de un fichero mmproj en fp16 necesario para el procesamiento de imagenes.

Este repositorio resulta relevante para quienes necesitan desplegar un modelo de vision-lenguaje especializado en documentos en entornos con recursos limitados, ya que los cuants de menor tamano ocupan alrededor de 1 GB y pueden ejecutarse en hardware de consumo. No obstante, la informacion publicada por el autor de la cuantizacion es minima y no incluye detalles sobre el entrenamiento del modelo base ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL), no disponible el detalle del fine-tuning |
| Parametros totales | 1.543.714.304 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-fp16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen2-VL-2B, un transformer multimodal de la familia Qwen2-VL que integra un codificador visual con un modelo de lenguaje para tareas de vision-lenguaje. El fine-tuning danielsyahputra/Qwen2-VL-2B-DocIndo parte de ese modelo y, a juzgar por su denominacion, esta orientado a la comprension de documentos, probablemente con datos en indonesio. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el fine-tuning.

La contribucion de este repositorio es exclusivamente la cuantizacion: mradermacher ha generado cuants estaticos (sin imatrix ni weighted quants, segun indica la propia model card) y ha incluido un fichero mmproj-fp16 que actua como suplemento multimodal para el procesamiento de imagenes en llama.cpp. No se documentan innovaciones tecnicas adicionales en la model card.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre imagenes, heredadas de la arquitectura Qwen2-VL.
- Comprension de documentos: el fine-tuning apunta a tareas de lectura, extraccion y respuesta sobre documentos escaneados o fotografias de documentos.
- Procesamiento multimodal mediante el fichero mmproj-fp16, que habilita la entrada de imagenes en llama.cpp.
- Conversacion multi-turno (tag "conversational" en el repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles; el posible soporte de indonesio no esta confirmado.

## Casos de uso

- Digitalizacion de documentos administrativos: el modelo puede recibir la imagen de un documento y extraer campos estructurados, aprovechando su especializacion en comprension de documentos.
- Procesamiento de facturas y recibos: integrado en un pipeline de OCR asistido, permite responder preguntas sobre importes, fechas y emisores directamente a partir de la imagen.
- Extraccion de informacion de formularios: el fine-tuning orientado a documentos lo hace adecuado para tareas de lectura de formularios escaneados en entornos con recursos limitados.
- Asistencia en la revision de contratos o documentos legales: con un cuant Q4_K_M de aproximadamente 1,1 GB, puede desplegarse en estaciones de trabajo sin GPU dedicada para tareas de resumen y localizacion de clausulas.
- Despliegue en dispositivos de borde: los cuants Q2_K y Q3_K ocupan menos de 1 GB, lo que permite ejecutar el modelo en portatiles o mini-PC con llama.cpp para tareas de lectura de documentos sin conexion.
- Prototipado rapido de aplicaciones de vision-lenguaje: al estar en formato GGUF, se integra facilmente en herramientas como llama.cpp u Ollama para validar ideas antes de pasar a un modelo mayor.
- Procesamiento de documentos en indonesio: si el fine-tuning confirma ese dominio, el modelo puede emplearse para tareas de comprension de documentos en ese idioma, aunque la model card no lo declara explicitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB para Q2_K, 1,0-1,1 GB para Q4_K_S/Q4_K_M, 1,4 GB para Q6_K y 1,7 GB para Q8_0, a los que se suma el fichero mmproj-fp16 de 1,4 GB para el procesamiento de imagenes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar los cuants de mayor calidad junto con el mmproj; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y herramientas compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, aunque no se detalla cuales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2-VL-2B-DocIndo-GGUF (este) | 1,54 B | no disponible | GGUF | no disponible | Fine-tuning especializado en documentos, cuantizado por mradermacher |
| Qwen2-VL-2B (base) | 2 B (aproximado) | no disponible | safetensors, GGUF | no disponible | Modelo multimodal original de Alibaba, sin especializacion en documentos |
| Otros fine-tunings de Qwen2-VL-2B | ~2 B | no disponible | variable | variable | Alternativas de la comunidad con especializaciones diversas; no se dispone de datos comparativos |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido; es necesario verificar la licencia del modelo base Qwen2-VL-2B y del fine-tuning original antes de usarlo en produccion.
- El modelo solo declara soporte de ingles; el posible soporte de indonesio derivado del fine-tuning no esta documentado.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de robustez del fine-tuning.
- Los cuants de menor tamano (Q2_K, Q3_K) degradan la calidad de forma notable, especialmente en tareas de OCR y comprension de documentos donde los detalles visuales son criticos.
- No se han generado cuants con imatrix ni weighted quants, por lo que la calidad de los cuants estaticos puede ser inferior a la de otras publicaciones del mismo autor.
- El procesamiento de imagenes requiere el fichero mmproj-fp16 adicional, lo que incrementa los requisitos de memoria respecto a un modelo solo de texto.
- La informacion publicada sobre el fine-tuning original es practicamente inexistente, lo que dificulta evaluar su calidad real frente al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2-VL-2B-DocIndo-GGUF
- Modelo base del fine-tuning: https://huggingface.co/danielsyahputra/Qwen2-VL-2B-DocIndo
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Qwen2-VL-2B-DocIndo-GGUF
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
