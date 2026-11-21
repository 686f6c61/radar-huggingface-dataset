# sifujohn/ApexConsulting_IT_fine_tune

## Resumen

ApexConsulting_IT_fine_tune es un modelo de lenguaje derivado de Qwen3.5-2B, publicado por el usuario sifujohn en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Según los archivos del repositorio, se trata de un ajuste fino orientado a un dominio de consultoría IT, empaquetado junto con el proyector multimodal (`mmproj`) necesario para el procesamiento de imágenes, lo que indica que conserva la naturaleza visión-lenguaje del modelo base.

El modelo cuenta con aproximadamente 1.940 millones de parámetros (1.942.653.248 según los pesos en safetensors) y un tamaño de repositorio de 2,0 GB, coherente con una cuantización Q4_K_M más el proyector en BF16. La conversión a GGUF se realizó con Unsloth, una herramienta habitual para fine-tuning y exportación eficiente de modelos pequeños.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho, sin descargas ni interacciones registradas, sin model card técnica detallada y sin licencia declarada. Resulta útil únicamente como referencia de un fine-tune corporativo sobre Qwen3.5-2B en formato listo para llama.cpp, no como un modelo de propósito general recomendable para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (vision-language model); detalles no disponibles |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal `mmproj`) y Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su origen en Qwen3.5-2B y de la etiqueta `vision-language-model`, que confirma la presencia de un codificador visual acoplado mediante un proyector multimodal exportado aparte (`Qwen3.5-2B.BF16-mmproj.gguf`). No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni la ventana de contexto nativa.

Tampoco se documentan los datos de entrenamiento del ajuste fino: no se indica el volumen de tokens, la composicion del dataset de consultoria IT, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT. La unica informacion tecnica verificable es que la conversion a GGUF se realizo con Unsloth y que el resultado se distribuye en dos artefactos (pesos cuantizados y proyector), lo que sugiere un flujo de trabajo tipico de fine-tuning LoRA/QLoRA seguido de exportacion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-2B.
- Procesamiento de imagenes: el repositorio incluye el proyector `mmproj`, por lo que puede usarse con `llama-mtmd-cli` para entrada multimodal.
- Razonamiento y codigo: capacidades propias del modelo base, no verificadas en este fine-tune concreto.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Cobertura multilingue: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes de consultoria IT: el modelo puede desplegarse localmente con llama.cpp para responder preguntas sobre procesos, herramientas y metodologias del dominio sobre el que fue ajustado, sin depender de servicios externos.
- Inferencia en equipos sin GPU dedicada: con cuantizacion Q4_K_M y ~2 GB de pesos, cabe en CPU y en GPUs de gama baja, lo que permite pruebas de concepto en portatiles.
- Procesamiento de documentacion con capturas de pantalla: gracias al proyector multimodal, puede analizarse una imagen (por ejemplo, un panel de administracion o un diagrama) junto con una pregunta de texto usando `llama-mtmd-cli`.
- Evaluacion de fine-tunes corporativos: sirve como caso de estudio de un ajuste de dominio sobre Qwen3.5-2B exportado con Unsloth, util para comparar pipelines de entrenamiento y cuantizacion.
- Asistencia interna en mesas de ayuda: un chatbot de primer nivel para preguntas frecuentes de soporte IT, siempre que se valide su calidad con un conjunto de prueba propio.
- Generacion de borradores de documentacion tecnica: redaccion de guias y procedimientos internos a partir de instrucciones breves, con revision humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5-2 GB para la variante Q4_K_M; aproximadamente 4 GB para BF16 de los pesos (el proyector en BF16 anade una cantidad marginal).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, practicamente en todas las graficas actuales con 4 GB o mas; tambien funciona en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (previa importacion del GGUF), y otros runners compatibles con GGUF. vLLM y TGI no estan soportados de forma nativa para este formato.
- Latencia y throughput: no disponibles; por el tamano, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ApexConsulting_IT_fine_tune | ~1,94 B | no disponible | no disponible | GGUF | Fine-tune de nicho, sin benchmarks |
| Qwen3.5-2B (base) | ~2 B | no disponible | no disponible | safetensors/GGUF | Modelo original del que deriva; capacidades completas |
| Qwen2.5-VL-3B | ~3 B | no disponible | no disponible | safetensors/GGUF | Alternativa vision-lenguaje de tamano similar |
| Llama 3.2 3B | ~3 B | 128k (segun model card oficial) | Llama 3.2 Community License | safetensors/GGUF | Alternativa texto de proposito general |

La comparacion cuantitativa de rendimiento no es posible porque el modelo no publica resultados de evaluacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la calidad del ajuste fino ni de posibles regresiones respecto al modelo base.
- Licencia no declarada: no puede asumirse uso comercial; es necesario contactar con el autor o consultar la licencia del modelo base Qwen3.5-2B antes de cualquier despliegue productivo.
- Model card minima: no se documentan datos de entrenamiento, idiomas, contexto ni limitaciones conocidas.
- Riesgo de alucinacion: inherente a los modelos de ~2B, especialmente en dominios especializados como consultoria IT.
- Sesgos: no documentados; al ser un fine-tune de dominio, puede reproducir sesgos del dataset corporativo empleado.
- Idiomas: sin confirmar; no se garantiza un rendimiento adecuado en castellano.
- Naturaleza de nicho: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Uso multimodal: requiere el proyector `mmproj` y un runner compatible (`llama-mtmd-cli`); no funciona con `llama-cli` para imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sifujohn/ApexConsulting_IT_fine_tune
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime): https://github.com/ggml-org/llama.cpp
