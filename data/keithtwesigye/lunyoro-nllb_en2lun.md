# keithtwesigye/lunyoro-nllb_en2lun

## Resumen

El modelo `keithtwesigye/lunyoro-nllb_en2lun` es un modelo de traducción automática neuronal especializado en la dirección English → Lunyoro/Rutooro, una lengua bantú hablada en los reinos de Bunyoro-Kitara y Tooro en el oeste de Uganda. Se trata de un fine-tuning del modelo `facebook/nllb-200-distilled-600M` de Meta AI, entrenado sobre aproximadamente 53.948 pares de frases inglés-lunyoro con aumentación por retro-traducción.

La relevancia de este modelo radica en que aborda una lengua de bajos recursos con muy poca representación en los sistemas de traducción comerciales. Al partir de NLLB-200, que ya incluye el lunyoro entre sus 200 idiomas, el fine-tuning específico mejora la calidad de traducción para este par concreto. El modelo tiene 615 millones de parámetros, lo que lo sitúa en un rango manejable para inferencia en GPUs de consumo, y se distribuye bajo licencia MIT, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (NLLB-200 distilled, encoder-decoder) |
| Parametros totales | 615.073.792 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (limitado por el tokenizador NLLB, tipicamente 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no documentada) |
| Idiomas soportados | ingles (eng_Latn), lunyoro/rutooro (run_Latn) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NLLB-200 de Meta AI, un transformer encoder-decoder de 600M parametros en su version destilada. NLLB-200 emplea un tokenizador SentencePiece con vocabulario de 256.000 unidades y codigos de idioma especiales para forzar el idioma de salida. El fine-tuning se realizo sobre el checkpoint `facebook/nllb-200-distilled-600M` con 53.948 pares de frases ingles-lunyoro, compilados a partir de aportaciones colaborativas, entradas de diccionario Runyoro-Rutooro, corpus paralelos y aumentacion por retro-traduccion con filtrado de calidad.

El entrenamiento se ejecuto durante 10 epocas con el optimizador AdamW y una programacion de tasa de aprendizaje coseno, en GPU NVIDIA con CUDA. El codigo de idioma de origen es `eng_Latn` y el de destino `run_Latn`. No se documenta el uso de tecnicas como RLHF o DPO; el entrenamiento es puramente supervisado sobre pares de frases.

## Capacidades

- Traduccion automatica de ingles a lunyoro/rutooro con calidad mejorada respecto al modelo base NLLB-200.
- Generacion de texto con decodificacion beam search (num_beams=4 recomendado en la documentacion).
- Soporte de traduccion de documentos y frases sueltas mediante la API de transformers.
- Integracion con el ecosistema Hugging Face (pipeline de traduccion).
- Capacidad multilingue heredada del modelo base, aunque el fine-tuning se centra exclusivamente en el par en→run.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de traduccion.

## Casos de uso

- Traduccion de contenido web al lunyoro: el modelo permite traducir articulos, noticias o paginas completas al lunyoro, facilitando el acceso a informacion en esta lengua de bajos recursos.
- Educacion bilingue: materiales educativos en ingles pueden traducirse al lunyoro para su uso en escuelas de la region de Bunyoro-Kitara y Tooro.
- Atencion sanitaria: traduccion de folletos, instrucciones medicas o comunicaciones de salud publica del ingles al lunyoro para poblaciones rurales.
- Agricultura y extensionismo: traduccion de guias tecnicas agricolas, avisos meteorologicos o recomendaciones de cultivo para agricultores locales.
- Documentacion legal y administrativa: traduccion de formularios, notificaciones y documentos oficiales para hablantes de lunyoro en Uganda.
- Preservacion linguistica: el modelo puede usarse para digitalizar y traducir contenido al lunyoro, contribuyendo a la preservacion y normalizacion de la lengua.
- Desarrollo de aplicaciones de traduccion: integrable en apps moviles o servicios web mediante la API de transformers, como se demuestra en el proyecto TRANSLATOR de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como BLEU, chrF o COMET, ni comparaciones cuantitativas con el modelo base o alternativas. Se recomienda evaluar el modelo con un conjunto de test propio antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 615M parametros, por lo que en FP32 ocupa aproximadamente 2,5 GB; en FP16 unos 1,3 GB. Con batch pequeno, cabe en GPUs con 4 GB de VRAM o menos.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). Para produccion con mayor throughput, una T4, V100 o A10 es suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: transformers de Hugging Face, ONNX Runtime, TensorRT, o servidores de inferencia como vLLM (aunque vLLM esta optimizado para decodificacion autoregresiva, no para seq2seq; TGI de Hugging Face es mas adecuado).
- Latencia y throughput: no disponible. Para un modelo de 600M en una GPU T4, se espera una latencia de decenas a cientos de milisegundos por frase, dependiendo de la longitud.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Direccion | Licencia | Contexto |
|---|---|---|---|---|---|
| keithtwesigye/lunyoro-nllb_en2lun | NLLB-200 distilled | 615M | en→run | MIT | 512 tokens (tipico NLLB) |
| keithtwesigye/lunyoro-en2lun | MarianMT | ~300M | en→run | MIT | 512 tokens |
| facebook/nllb-200-distilled-600M | NLLB-200 distilled | 615M | 200 idiomas | CC-BY-NC | 512 tokens |

El modelo fine-tuned deberia superar al NLLB-200 base en calidad de traduccion en→run, aunque no hay datos publicados que lo confirmen. La alternativa MarianMT es mas ligera pero probablemente menos precisa. La ventaja del modelo NLLB fine-tuned es que hereda la robustez del tokenizador y la arquitectura de NLLB, disenada especificamente para lenguas de bajos recursos.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno con datos colaborativos y de diccionario, lo que puede introducir sesgos regionales o de registro (lenguaje formal vs. coloquial).
- Riesgo de alucinacion: como todo modelo de traduccion neuronal, puede producir traducciones fluidas pero incorrectas, especialmente con frases ambiguas o fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de contexto esta limitada por el tokenizador NLLB (tipicamente 512 tokens), por lo que no es adecuado para traducir documentos largos de una sola vez; habra que segmentar el texto.
- Cobertura linguistica limitada: el modelo solo traduce en→run; no soporta la direccion inversa (run→en), para la cual existe el modelo hermano `lunyoro-nllb_lun2en`.
- Datos de entrenamiento limitados: 53.948 pares es un corpus pequeno, lo que puede afectar a la generalizacion en dominios especializados.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base NLLB-200 esta bajo licencia CC-BY-NC, lo que podria generar conflictos legales si se redistribuye el modelo fine-tuned. Conviene verificar los terminos de la licencia del modelo base.
- Sin benchmarks publicados: no hay metricas objetivas que permitan evaluar la calidad real del modelo frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keithtwesigye/lunyoro-nllb_en2lun
- Modelo hermano (run→en): https://huggingface.co/keithtwesigye/lunyoro-nllb_lun2en
- Repositorio de la aplicacion TRANSLATOR: https://github.com/chriskagenda/TRANSLATOR
- Documentacion del proyecto TRANSLATOR: https://github.com/K227-arch/TRANSLATOR/blob/main/lunyoro-translator/README.md
- Proyecto No Language Left Behind de Meta AI: https://ai.meta.com/research/no-language-left-behind/
