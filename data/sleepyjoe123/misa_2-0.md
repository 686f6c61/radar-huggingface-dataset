# sleepyjoe123/Misa_2.0

## Resumen

Misa_2.0 es un ajuste fino (fine-tune) del modelo vision-language Qwen2.5-VL-7B-Instruct, publicado por el usuario sleepyjoe123 en HuggingFace. El modelo se ha entrenado y convertido a formato GGUF mediante la librería Unsloth, lo que lo hace directamente ejecutable en llama.cpp y en cualquier runtime compatible con GGUF. Los artefactos publicados son un archivo cuantizado `Qwen2.5-VL-7B-Instruct.Q8_0.gguf` y un proyector multimodal separado `Qwen2.5-VL-7B-Instruct.BF16-mmproj.gguf`.

El repositorio declara 8.030.261.248 parámetros totales (unos 8,03 mil millones), coherentes con la familia Qwen2.5-VL-7B, y ocupa 18 GB, un tamaño que incluye tanto los pesos cuantizados como el proyector de visión en BF16. La ficha del autor no documenta el dataset de ajuste, el número de tokens de entrenamiento, la licencia ni los idiomas soportados, por lo que buena parte de las especificaciones solo pueden inferirse a partir del modelo base.

Su relevancia práctica es doble: por un lado, ofrece una vía de bajo coste para desplegar un modelo multimodal de ~8B en hardware de consumo mediante llama.cpp; por otro, ilustra las limitaciones actuales de Ollama con modelos de visión que usan archivos `mmproj` separados. El interés real del modelo depende enteramente de la calidad del ajuste, que el autor no cuantifica con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (vision-language model); encoder de visión ViT + decoder tipo Qwen2.5 con MRoPE, heredada del modelo base Qwen2.5-VL-7B-Instruct |
| Parametros totales | 8.030.261.248 (dato declarado en safetensors) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-VL-7B-Instruct admite 128 000 tokens; no confirmado para este fine-tune |
| Tipos de cuantizacion | Q8_0 (GGUF); proyector multimodal en BF16; se menciona también un modelo BF16 fusionado para Ollama |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El modelo base Qwen2.5-VL-7B-Instruct se distribuye bajo Apache 2.0, pero el autor no declara licencia para este fine-tune |
| Formato de pesos | GGUF (llama.cpp). El modelo base y los pesos fusionados intermedios están en safetensors |
| Tamano del repositorio | 18,0 GB |
| Descargas / likes | 57 descargas / 0 likes |
| Fecha de creacion | 2026-09-03 (actualizado el 2026-09-19) |
| Compatibilidad declarada | llama.cpp, endpoints compatibles, conversacional |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct: un transformer decoder denso con atención causal, positional encoding rotatorio multimodal (MRoPE) que codifica de forma independiente las dimensiones temporal, de altura y de anchura, y un encoder de visión ViT que procesa imágenes a resolución nativa dinámica. Esta combinación permite manejar imágenes de resoluciones arbitrarias sin redimensionar forzosamente, además de entrada de vídeo con codificación de tiempo absoluto. El modelo acepta texto e imagen como entrada y genera texto.

Respecto al entrenamiento del fine-tune, la model card es explícitamente escueta: solo indica que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el proceso de entrenamiento fue «2x más rápido» gracias a dicha librería. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO o SFT supervisado, ni los hiperparámetros empleados. La única innovación técnica documentada es la propia cadena de conversión a GGUF y el uso de un proyector multimodal separado (`mmproj`), que permite cargar el encoder de visión de forma independiente al modelo de lenguaje en llama.cpp.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el ejemplo de uso con `llama-cli --jinja` confirman soporte de plantillas de chat.
- Comprensión de imágenes (vision-language): el modelo incorpora un proyector multimodal y se ejecuta con `llama-mtmd-cli`, el binario de llama.cpp para modelos multimodales.
- Procesamiento de vídeo: heredado del modelo base Qwen2.5-VL, que soporta entrada de vídeo con marcas temporales absolutas; no confirmado explícitamente para este fine-tune.
- Razonamiento y matemáticas: capacidad esperable del modelo base, pero no verificada con benchmarks para este ajuste.
- Generación de código: capacidad esperable del modelo base, no verificada.
- Tool calling / function calling: no documentado en la model card. El soporte de plantilla Jinja (`--jinja`) es un requisito habitual para el formateo de tool calls en llama.cpp, pero no hay confirmación explícita.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este fine-tune; el modelo base Qwen2.5-VL es multilingüe con especial solidez en inglés y chino.
- Modo thinking: no documentado.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el repositorio puede servirse mediante HuggingFace Inference Endpoints, aunque al tratarse de GGUF el uso principal es local.

## Casos de uso

- Transcripción y descripción de imágenes en local: con `llama-mtmd-cli` y el archivo `mmproj` en BF16, el modelo puede generar descripciones detalladas de imágenes sin enviar datos a servicios externos, algo relevante para material médico, legal o confidencial.
- Automatización documental con OCR semántico: dado que el modelo base Qwen2.5-VL destaca en la lectura de documentos densos (tablas, formularios, gráficos), un fine-tune como Misa_2.0 puede usarse para extraer campos estructurados de facturas o contratos escaneados y devolver JSON.
- Asistente de accesibilidad: generación de descripciones alternativas de imágenes y contenido visual para lectores de pantalla, ejecutable en una estación de trabajo con una única GPU de consumo.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en una plataforma, con el modelo ejecutándose en el mismo servidor que el backend para reducir latencia y coste por petición.
- Prototipado e investigación en VLM: al ser un GGUF de ~8 GB en Q8_0, permite a investigadores sin clúster probar variantes de prompting multimodal, comparar cuantizaciones o hacer ablaciones sobre el ajuste sin necesidad de GPUs de datacenter.
- Análisis de capturas de pantalla en soporte técnico: el modelo puede interpretar capturas enviadas por usuarios en un sistema de tickets y proponer una causa probable del error, integrándose en un flujo conversacional multi-turno.
- Indexación de archivos fotográficos y vídeo doméstico: descripción automática de colecciones de imágenes o clips para permitir búsqueda semántica posterior (por ejemplo, «fotos con bicicletas»), procesando los archivos por lotes en local.
- Evaluación comparativa de fine-tunes: sirve como referencia para medir si un ajuste concreto mejora o degrada las capacidades del Qwen2.5-VL-7B-Instruct original en tareas de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de sleepyjoe123/Misa_2.0 no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MMMU, DocVQA u otras), y la búsqueda web realizada no ha devuelto resultados relacionados con el modelo, sino páginas sin relación alguna (consultas sobre formato de documentos en Word). No es posible, por tanto, comparar cuantitativamente este fine-tune con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para el archivo Q8_0: en torno a 9-10 GB solo para los pesos (8,03B parámetros a ~8,5 bits efectivos), más el proyector multimodal en BF16 (aproximadamente 1,3-1,5 GB) y la caché KV según la longitud de contexto. Presupuesto realista: 12-16 GB para contextos moderados.
- Si se usa el modelo fusionado en BF16 (mencionado para Ollama), el requisito sube a unos 16-17 GB de pesos, más caché KV; en la práctica conviene disponer de 24 GB.
- GPU consumer compatibles: RTX 4090 y RTX 3090 (24 GB) ejecutan el Q8_0 con holgura; RTX 4080/4070 Ti Super y RTX 4060 Ti de 16 GB pueden ejecutarlo con contextos reducidos. Tarjetas de 12 GB o menos requerirían cuantizaciones más agresivas, que el repositorio no publica.
- GPU de datacenter: A100, H100, L40S y A6000 sin problema; el modelo es lo bastante pequeño como para desperdiciar este hardware si el objetivo es una sola instancia, aunque permite alto paralelismo por GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli` para multimodal, `llama-server` para exponer una API compatible con OpenAI), Ollama (con la salvedad del `mmproj` descrita abajo) y cualquier frontend basado en llama.cpp. vLLM y TGI no consumen GGUF directamente en su configuración estándar.
- Advertencia específica de Ollama: la model card indica que Ollama no soporta archivos `mmproj` separados para modelos de visión. Para usarlo allí hay que colocar el `Modelfile` en el mismo directorio que el modelo fusionado en bf16 y ejecutar `ollama create model_name -f ./Modelfile`, lo que crea un modelo unificado en bf16 y eleva el consumo de memoria.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en la model card ni en los resultados de búsqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Misa_2.0 (este modelo) | 8,03B | No disponible (base: 128K) | Si, con mmproj separado | No declarada | GGUF en HuggingFace, 57 descargas |
| Qwen2.5-VL-7B-Instruct (base) | ~8,3B | 128K | Si | Apache 2.0 | Safetensors y multiples GGUF de terceros |
| Qwen2.5-VL-3B-Instruct | ~3,8B | 128K | Si | Apache 2.0 (Qwen) | Safetensors, GGUF de terceros |
| InternVL2.5-8B | ~8B | 128K (variable segun configuracion) | Si | Apache 2.0 / MIT segun variante | Safetensors, GGUF de terceros |
| Llama-3.2-11B-Vision-Instruct | ~11B | 128K | Si | Llama 3.2 Community License | Safetensors, GGUF de terceros |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para Misa_2.0 y la búsqueda web no aportó datos de evaluación comparativa. La diferencia principal frente al modelo base es que Misa_2.0 es un ajuste del que no se documenta ni el dataset ni el resultado, mientras que Qwen2.5-VL-7B-Instruct cuenta con evaluación oficial publicada por el equipo de Qwen.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset de entrenamiento, hiperparámetros ni metodología de ajuste, lo que impide reproducir el resultado o auditar qué se ha modificado respecto al modelo base.
- Licencia no declarada: el autor no indica licencia para el fine-tune. Aunque el modelo base Qwen2.5-VL-7B-Instruct es Apache 2.0, la ausencia de una licencia explícita en este repositorio crea incertidumbre legal para uso comercial. Conviene contactar con el autor o asumir que la licencia del modelo base aplica.
- Idiomas no declarados: no hay información sobre el rendimiento del ajuste en castellano ni en otros idiomas distintos de los del modelo base.
- Riesgo de degradación por el fine-tune: al no haber benchmarks, no puede descartarse que el ajuste haya deteriorado capacidades del modelo original (olvido catastrófico), especialmente en razonamiento o código.
- Riesgo de alucinación: inherente a los modelos de ~8B, y acentuado en tareas de lectura de documentos o gráficos densos donde el modelo base ya tiende a inventar valores numéricos.
- Sesgos: no evaluados. El modelo hereda los sesgos de los datos de preentrenamiento de Qwen2.5-VL, que no están documentados públicamente en detalle.
- Adopción muy baja: 57 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No hay evidencia externa de calidad ni de estabilidad.
- Limitación operativa con Ollama: el flujo recomendado obliga a fusionar el modelo en bf16, lo que incrementa el uso de memoria y elimina la ventaja de la cuantización Q8_0.
- Contexto no confirmado: aunque el modelo base soporta 128K tokens, no hay confirmación de que el ajuste preserve esa ventana ni de que el archivo GGUF se haya generado con el valor correcto de `rope scaling`. En la práctica conviene probar con contextos moderados.
- Fecha de creación inusualmente futura (2026-09-03): conviene verificar la autenticidad y procedencia del repositorio antes de integrarlo en cualquier flujo de producción.
- Sin garantías de mantenimiento: el repositorio no tiene actividad comunitaria ni issues públicas reseñables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sleepyjoe123/Misa_2.0
- Unsloth (herramienta de ajuste y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF, incluye `llama-mtmd-cli` para multimodal): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio oficial de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales asociados a este modelo.
