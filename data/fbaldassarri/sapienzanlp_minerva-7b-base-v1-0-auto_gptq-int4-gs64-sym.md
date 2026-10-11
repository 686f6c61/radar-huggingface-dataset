# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo sapienzanlp/Minerva-7B-base-v1.0, publicada por el usuario fbaldassarri. Minerva es una familia de modelos de lenguaje de tipo base (completion, sin ajuste de instrucciones) desarrollada por el grupo Sapienza NLP, orientada principalmente al italiano y con el inglés como idioma secundario. La cuantización se ha realizado con Intel AutoRound 0.15.1 aplicando el algoritmo GPTQ en modo weights-only (WoQ), con 4 bits, tamaño de grupo 64 y esquema simétrico, lo que da lugar al identificador W4G64.

El propósito del artefacto es reducir el consumo de memoria y acelerar la inferencia: el autor declara una mejora de velocidad de 2-3x respecto al modelo en bf16, con una ligera pérdida de precisión atribuida al esquema W4G64. La cuantización se ha optimizado explícitamente para hardware Intel (CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost de la serie Core Ultra mediante OpenVINO), aunque el formato auto_gptq también es utilizable en el ecosistema transformers/AutoGPTQ.

El repositorio ocupa 5,4 GB, usa licencia Apache 2.0 y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad. Existe además una discrepancia relevante en los metadatos: el nombre del modelo y el modelo base remiten a una escala de 7B, mientras que el recuento de parámetros de safetensors indica 1.416.040.448 (~1,42 mil millones). Esa diferencia no se explica en la documentación disponible y conviene verificarla antes de dimensionar cualquier despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; `model_type: mistral` según los metadatos del repositorio; derivada del modelo base sapienzanlp/Minerva-7B-base-v1.0 |
| Parámetros totales | 1.416.040.448 (~1,42 mil millones) según los metadatos de safetensors; el nombre del modelo y del base indican escala 7B (discrepancia no aclarada en la información disponible) |
| Parámetros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4G64: INT4, group size 64, cuantización simétrica, formato auto_gptq (GPTQ / weights-only quantization) mediante Intel AutoRound 0.15.1; el repositorio no ofrece otros formatos ni niveles de bits |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint cuantizado auto_gptq); carga con `torch_dtype: torch.bfloat16` |
| Modelo base | sapienzanlp/Minerva-7B-base-v1.0 (relación: quantized) |
| Tipo de modelo | Base / completion (sin plantilla de instrucciones; `prompt_template: '{prompt}\n'`) |
| Tamaño del repositorio | 5,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-10 / 2026-10-10 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Minerva de Sapienza NLP y está etiquetado con `model_type: mistral`, es decir, un transformer decoder-only causal con atención completa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el reparto entre italiano e inglés ni sobre si se aplicaron técnicas de alineación (RLHF, DPO u otras) en el modelo base: no disponible en la documentación aportada.

Este artefacto concreto no entrena pesos: aplica una cuantización de solo pesos (weights-only quantization) con el algoritmo GPTQ a través de Intel AutoRound 0.15.1. El proceso de ajuste del redondeo se ejecutó en CPU sobre el modelo cargado en `torch.bfloat16`, con 128 muestras de calibración, 200 iteraciones, longitud de secuencia 512 y tamaño de lote 4. La duración registrada fue de 42.050,7 s (700,8 minutos). No se especifica el origen ni el dominio del conjunto de calibración, dato relevante porque determina qué distribuciones de activación quedan mejor preservadas tras la cuantización.

## Capacidades

- Generación de texto y continuación de secuencia (completion) en italiano e inglés: el modelo es de tipo base, por lo que se invoca con texto en crudo y no con instrucciones.
- Modelado de lenguaje general: al ser un modelo base, resulta adecuado para puntuar secuencias, calcular perplejidad y comparar distribuciones de probabilidad.
- Generación condicionada por prefijo: útil para plantillas, autocompletado y generación de texto controlada por el prompt inicial.
- Capacidad multilingüe limitada a los dos idiomas declarados (it, en); el resto de idiomas no está soportado de forma documentada.
- Tool calling / function calling: no documentado en la información disponible.
- Uso como agente o razonamiento multi-paso: no documentado; el modelo no tiene ajuste de instrucciones ni modo de pensamiento.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Generación y continuación de texto en italiano: el modelo puede completar párrafos, artículos o descripciones a partir de un prefijo, aprovechando que el corpus base está centrado en italiano. Es el uso más directo al tratarse de un modelo de completion.
- Evaluación del impacto de la cuantización: equipos de investigación pueden comparar este checkpoint INT4 con el modelo base en bf16 sobre el mismo corpus para medir la degradación real en perplejidad y en tareas generativas, algo especialmente útil dado que el autor solo declara una "ligera pérdida de precisión" sin cifras.
- Despliegue en hardware Intel sin GPU dedicada: la cuantización está pensada para CPU, iGPU Arc (vía intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (vía OpenVINO), lo que permite ejecutar inferencia en portátiles y equipos de borde sin acelerador NVIDIA.
- Generación de datos sintéticos y aumento de corpus en italiano: el modelo puede producir texto adicional para tareas de aumento de datos o preentrenamiento auxiliar, siempre con revisión humana por el riesgo de alucinación.
- Puntuación y filtrado de textos por verosimilitud: al ser un modelo base, sus log-probabilidades sirven para ordenar candidatos en búsqueda semántica, reranking de respuestas o detección de texto anómalo.
- Prototipado de bajo coste en pipelines internos de NLP: al ocupar poco espacio en disco (5,4 GB) y necesitar menos memoria que el modelo sin cuantizar, es apto para entornos de pruebas donde no hay presupuesto para GPU de gama alta.
- Investigación lingüística sobre el italiano: análisis de distribuciones léxicas y sintácticas mediante generación controlada y cálculo de probabilidades sobre corpus anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una mejora de velocidad de 2-3x y una "ligera caída de precisión" con el esquema W4G64, sin cifras absolutas ni comparativas en MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada: no disponible como dato medido. Como referencia orientativa, un modelo de ~7B en INT4 con group size 64 ocupa aproximadamente 4-4,5 GB de pesos, más la caché KV y el overhead del runtime; si el recuento real de safetensors (~1,42 mil millones de parámetros) fuese el correcto, la huella en INT4 se reduciría aproximadamente a 0,8-1,2 GB. La discrepancia entre ambas cifras no está resuelta en la documentación.
- GPU recomendadas: para la escala de 7B, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A100 o H100; en GPUs de 8 GB el encaje sería ajustado y dependería de la longitud de contexto y del tamaño de lote.
- Cabe en GPU de consumo: probablemente sí, especialmente en modelos con 12 GB o más de VRAM, siempre que se limite el contexto; no está confirmado por el autor.
- Hardware alternativo soportado explícitamente: CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost (Core Ultra) mediante OpenVINO, que es el escenario para el que se preparó originalmente esta cuantización.
- Opciones de despliegue: transformers + AutoGPTQ (receta incluida en la model card), Text Generation Inference (la etiqueta `text-generation-inference` está presente), vLLM con soporte GPTQ, intel-extension-for-pytorch y OpenVINO. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, no documentada en este repositorio.
- Latencia y throughput: no disponibles en valores absolutos. Solo se declara una aceleración relativa de 2-3x frente a la versión sin cuantizar.
- Nota sobre el entorno de referencia: el autor documenta ejecución con auto-round 0.15.1, transformers 4.55.3 y torch 2.14.0+cpu durante el proceso de cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-sym | 1.416.040.448 según safetensors (nombre: 7B) | no disponible | safetensors (GPTQ INT4, grupo 64, simétrico) | Apache 2.0 | HuggingFace; 0 descargas, 0 likes |
| sapienzanlp/Minerva-7B-base-v1.0 (modelo base, sin cuantizar) | no disponible (el nombre indica 7B) | no disponible | safetensors en bf16 | no disponible | HuggingFace |
| Otras cuantizaciones del mismo modelo base (AWQ, GGUF, otras configuraciones GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables de la misma categoría (LLM base centrado en italiano, escala ~7B) en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- Modelo base, no instruct: no sigue instrucciones ni mantiene formato conversacional. Usarlo como asistente requiere ajuste adicional o ingeniería de prompts específica.
- Sin cifras de degradación: el autor reconoce una pérdida de precisión con W4G64 pero no cuantifica cuánto empeora respecto a bf16, lo que impide evaluar si el checkpoint es aceptable para tareas sensibles.
- Conjunto de calibración no documentado: se desconoce el dominio, el idioma y la procedencia de las 128 muestras usadas; una calibración poco representativa puede degradar de forma desigual el comportamiento en italiano frente al inglés o en dominios especializados.
- Riesgo de alucinación: como cualquier modelo de lenguaje de esta escala, puede generar contenido factualmente incorrecto con aparente fluidez, especialmente en dominios especializados.
- Cobertura lingüística limitada a italiano e inglés: no hay soporte documentado para otros idiomas, incluido el español.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que complica el dimensionamiento de memoria y la planificación de tareas con documentos largos.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay informes independientes de calidad ni de estabilidad del checkpoint.
- Licencia y alcance: el repositorio se publica bajo Apache 2.0, licencia permisiva que permite uso comercial, pero la propia model card incluye un aviso de que el modelo se ha desarrollado únicamente con fines de investigación y se entrega sin garantía. Es recomendable revisar la licencia del modelo base antes de un uso productivo, ya que no se especifica en la información disponible.
- Repositorio de replicación no oficial: la model card recomienda una herramienta de orquestación alojada en git.epicdynamic.com, que no es el repositorio oficial de Intel (github.com/intel/auto-round). Se debe tratar esa fuente con cautela y verificar su contenido antes de ejecutarla.
- Metadatos inconsistentes: la etiqueta `inference: false` y la discrepancia en el recuento de parámetros son señales que conviene aclarar antes de integrar el modelo en un sistema en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (framework de cuantización): https://github.com/intel/auto-round
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Herramienta de orquestación citada en la model card (repositorio externo, no verificado): https://git.epicdynamic.com/auto-round-pipeline
- Nota sobre la búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las fuentes devueltas por la búsqueda no guardan relación con el modelo ni con su autor y se han descartado.
