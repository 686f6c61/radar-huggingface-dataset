# leirbag99/Ornith-1.5-9B-IQ4_XS-NO-VISION-GGUF

## Resumen

Ornith-1.5-9B-IQ4_XS-NO-VISION-GGUF es una cuantización en formato GGUF del modelo `ornith-ai/Ornith-1.5-9B`, publicada por el usuario leirbag99. No es un modelo entrenado desde cero, sino un artefacto de conversión: los pesos originales se han transformado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai y se han cuantizado a IQ4_XS con calibración mediante matriz de importancia (imatrix). El resultado está pensado para inferencia local en CPU y GPU de gama media.

El modelo base tiene 9.197.093.888 parámetros (unos 9,2 mil millones) según los metadatos de safetensors, y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia. El sufijo `NO-VISION` del nombre indica que esta conversión omite los componentes de visión del modelo original y conserva únicamente la rama de generación de texto; no se dispone de la model card del repositorio base para confirmarlo con detalle.

Su interés es eminentemente práctico: permite ejecutar un modelo de ~9B con una pérdida de calidad reducida gracias al uso de imatrix y encaja en GPU de consumo con 8-12 GB de VRAM. Como contrapartida, la información pública disponible es muy escasa: no hay datos sobre arquitectura, longitud de contexto, idiomas, datos de entrenamiento ni benchmarks, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de generación de texto; no se especifica en la información proporcionada) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS con imatrix (un único archivo declarado: `ornith-1.5-9b-iq4_xs-imat.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base, con enlace a la licencia original) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Variante | NO-VISION (sin componentes de visión, según el nombre del repositorio) |
| Tamano del repositorio | 10,7 GB (dato declarado; ver advertencia en limitaciones) |
| Pipeline | text-generation |
| Biblioteca declarada | transformers (aunque el uso real es llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en los datos proporcionados. La model card de esta conversión remite explícitamente a la model card original de `ornith-ai/Ornith-1.5-9B` para cualquier detalle arquitectónico, y esa información no forma parte de la documentación disponible. Por los tags del repositorio (`text-generation`, `conversational`) y por el recuento de parámetros, se trata de un modelo de lenguaje de ~9,2 B orientado a generación de texto y diálogo, pero no se puede confirmar si usa un transformer denso, una mezcla de expertos o una arquitectura híbrida.

En cuanto al proceso de conversión, sí hay detalle: los pesos se convirtieron con llama.cpp mediante el espacio GGUF-my-repo, y la cuantización empleada es IQ4_XS, una variante de 4 bits con escalas por bloque que suele ofrecer mejor relación calidad/tamaño que Q4_K_M en modelos de este orden de magnitud. El uso de imatrix implica que las escalas de cuantización se calibraron con un corpus de calibración para minimizar el error de los pesos más sensibles, aunque el corpus concreto empleado no se documenta. No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica del modelo base.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican que el modelo base está orientado a diálogo multi-turno, aunque no se documentan plantillas de chat ni tokens especiales.
- Generación de texto general: al ser una conversión del modelo base sin destilación ni recorte de capas, conserva en principio las capacidades del original, con la pérdida inherente a la cuantización de 4 bits.
- Visión: descartada en esta variante. El sufijo NO-VISION indica que los componentes multimodales se han omitido, de modo que no hay entrada de imágenes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la ficha).
- Modo de razonamiento explícito (thinking mode): no disponible.
- Otras capacidades (audio, código especializado, matemáticas): no disponibles.

## Casos de uso

- Asistente conversacional local: al ser un GGUF de ~5-6 GB, puede ejecutarse en un portátil con GPU de 8 GB o incluso solo con CPU, sirviendo como chatbot privado sin enviar datos a servicios externos. Es adecuado precisamente por su licencia MIT y su tamaño manejable.
- Prototipado rápido con llama.cpp: el repositorio incluye los comandos exactos para `llama-cli` y `llama-server`, de modo que se puede levantar un endpoint HTTP compatible con OpenAI en minutos para pruebas de integración antes de decidir si se adopta el modelo base completo.
- Evaluación comparativa de cuantizaciones: dado que el nombre del archivo incluye `imat`, este checkpoint sirve para medir la diferencia práctica entre una cuantización IQ4_XS calibrada con imatrix y otras variantes (Q4_K_M, Q5_K_M) sobre el mismo modelo base.
- Generación de texto por lotes en CPU: para tareas de resumen, reescritura o clasificación de documentos donde la latencia no es crítica, es viable desplegarlo en servidores sin GPU usando llama.cpp con backend CPU.
- Backend de aplicaciones de escritorio y edge: integrable mediante `llama-cpp-python` o LM Studio en aplicaciones que requieren un LLM embebido sin dependencia de red.
- Base para ajuste fino ligero (LoRA/QLoRA): aunque el GGUF no es el formato habitual para entrenar, el modelo base en safetensors sí permitiría adaptaciones; esta cuantización sirve para validar el comportamiento antes de invertir en entrenamiento.
- Experimentación académica con modelos de ~9B: útil para estudiar el efecto de la cuantización de 4 bits en tareas de razonamiento, siempre que se documenten las limitaciones de comparabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card de esta conversión ni los resultados de búsqueda web asociados aportan cifras de MMLU, HumanEval, GSM8K u otras evaluaciones. Tampoco se dispone de métricas del modelo base `ornith-ai/Ornith-1.5-9B`, por lo que no es posible comparar el efecto de la cuantización IQ4_XS frente a los pesos originales.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 5,0-5,5 GB con cuantización IQ4_XS (estimación orientativa calculada a partir de los 9,2 B de parámetros; no medida por el autor).
- VRAM total con caché KV: unos 6-7 GB para contextos moderados (4-8 K tokens), dependiendo del número de capas y de la ventana configurada, dato que no se conoce.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 3090, RTX 4090, A10G o L4. Cualquier GPU con 8 GB o más puede ejecutarlo con contexto limitado.
- ¿Cabe en GPU de consumo? Sí. Es viable en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) reduciendo el contexto y descargando parte de las capas a CPU si es necesario.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile, LM Studio, `llama-cpp-python`, text-generation-webui. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. vLLM solo lo soportaría de forma experimental, ya que su soporte de GGUF es limitado; para producción con vLLM convendría partir de los safetensors originales.
- Latencia y throughput: no disponibles. Como referencia orientativa y no medida, un modelo denso de ~9 B en Q4 suele moverse en el orden de 30-50 tokens/s en una RTX 3060 y de 90-130 tokens/s en una RTX 4090, con llama.cpp y contexto corto. Estas cifras deben verificarse en el hardware concreto.

## Comparativa con modelos similares

No hay benchmarks publicados de Ornith-1.5-9B, por lo que la comparación de rendimiento no puede establecerse. La tabla siguiente compara únicamente parámetros, contexto y licencia frente a alternativas habituales en el mismo segmento. Los datos de los modelos de terceros provienen de conocimiento general y conviene verificarlos en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| Ornith-1.5-9B (esta cuantizacion) | ~9,2 B | no disponible | MIT | GGUF (esta conversión) |
| Llama 3.1 8B | ~8 B | 128 K | Llama 3.1 Community License | safetensors, GGUF |
| Qwen2.5 7B | ~7,6 B | 128 K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF |
| Gemma 2 9B | ~9,2 B | 8 K | Gemma Terms of Use | safetensors, GGUF |
| Mistral 7B v0.3 | ~7,2 B | 32 K | Apache 2.0 | safetensors, GGUF |

Punto relevante: de los modelos comparados, solo Ornith-1.5-9B y Mistral 7B ofrecen licencia permisiva sin cláusulas adicionales destacables, lo que puede ser determinante en despliegues comerciales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada que permita estimar la calidad real del modelo base ni la degradación introducida por la cuantización IQ4_XS.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de este tamaño; no hay datos específicos de fidelidad factual.
- Sesgos: no disponibles. No se documenta la composición del dataset de entrenamiento, por lo que no se pueden anticipar sesgos de género, idioma, cultura o dominio.
- Idiomas: se desconoce qué idiomas soporta. No hay declaración de multilingüismo, por lo que no se debe asumir un buen rendimiento en castellano sin evaluarlo.
- Longitud de contexto desconocida: los ejemplos de la model card usan `-c 2048`, lo que no implica que ese sea el máximo del modelo, pero tampoco permite asumir ventanas largas. Conviene probar antes de diseñar aplicaciones que dependan de contexto extenso.
- Sin visión: esta variante excluye explícitamente los componentes multimodales. Si se necesita entrada de imágenes, hay que acudir al modelo base.
- Tamaño del repositorio inconsistente: los 10,7 GB declarados son muy superiores a lo esperable para un único archivo IQ4_XS de un modelo de 9,2 B (en torno a 5 GB), lo que sugiere que el repositorio contiene archivos adicionales o artefactos no descritos. Conviene inspeccionar la lista de ficheros antes de descargar.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. Es una conversión de terceros no verificada por el equipo del modelo original.
- Licencia: MIT, sin restricciones conocidas para uso comercial, siempre que se conserve el aviso de copyright. Al ser una licencia heredada, la responsabilidad de su interpretación recae en quien la use.
- Compatibilidad: aunque la ficha declara `library_name: transformers`, el artefacto real es GGUF y requiere llama.cpp o un runtime compatible; no se carga con `transformers` de forma estándar.
- Caveat de producción: al no conocerse la plantilla de chat ni los tokens especiales, el formato de prompt correcto es incierto y puede degradar notablemente la calidad de las respuestas si se usa una plantilla incorrecta.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/leirbag99/Ornith-1.5-9B-IQ4_XS-NO-VISION-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre Ornith-1.5-9B, su arquitectura, su entrenamiento o sus benchmarks. Las referencias devueltas (repositorios de prompts tipo DAN, GPT-SoVITS, documentación de facturación de GitHub Copilot) no guardan relación con este modelo y se han descartado.
