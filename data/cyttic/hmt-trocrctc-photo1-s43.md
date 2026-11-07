# cyttic/hmt-trocrctc-photo1-s43

## Resumen

`cyttic/hmt-trocrctc-photo1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un checkpoint de investigación perteneciente al estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena la arquitectura `trocrctc` con una estrategia de aumentación concreta (`photo1`) y una semilla fija (`43`). El objetivo del trabajo es medir cómo distintas aumentaciones de imagen afectan a las métricas de reconocimiento sobre un conjunto de test común.

El modelo parte de la familia TrOCR (transformer encoder-decoder para imágenes de texto) combinada con decodificación CTC, y está entrenado sobre el split `cyttic/hhd-optionb-split`, excluyendo los escritores de validación. El resultado reportado por el autor sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje es de CER 0,1255 y WER 0,5064. Con 87.279.756 parámetros y un repositorio de 0,3 GB, es un modelo de tamaño medio, orientado a escritura manuscrita en hebreo (`he`).

Su relevancia es acotada pero clara: sirve como punto de comparación reproducible dentro de una serie de experimentos controlados de aumentación, no como modelo de producción generalista. La licencia MIT facilita su reutilización y verificación por parte de otros grupos que trabajen en HTR semítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con decodificacion CTC (identificador `trocrctc`) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo imagen-a-texto, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR: un encoder visual tipo ViT que procesa la imagen de la línea de texto y un decoder transformer que genera la secuencia de caracteres. En esta variante (`trocrctc`) la decodificación se realiza mediante CTC, lo que permite alinear secuencias sin un tokenizador autoregresivo explícito y simplifica el entrenamiento sobre líneas manuscritas de longitud variable.

El entrenamiento se realizó sobre el split `cyttic/hhd-optionb-split` (conjunto de escritura manuscrita hebrea), tomando la partición de train y excluyendo los escritores reservados para desarrollo. La aumentación aplicada es `photo1`, una de las variantes del estudio `htr-metrics-transfer`, y la semilla es 43. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en HTR). La evaluación reportada usa decodificación voraz y ningún modelo de lenguaje externo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas de texto.
- Transcripción carácter a carácter mediante decodificación CTC.
- Salida de secuencia de texto alineada con la imagen de entrada, sin necesidad de postproceso lingüístico.
- Entrenado específicamente sobre un split con escritores separados, lo que permite medir generalización a escritores no vistos.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (*thinking*).
- No tiene capacidades multimodales más allá de la entrada de imagen (sin audio, sin vídeo, sin entrada de texto libre).
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas segmentadas de documentos históricos o administrativos, integrado en un pipeline previo de detección y recorte de líneas.
- Investigación en aumentación de datos para HTR: sirve como checkpoint de referencia del estudio `htr-metrics-transfer` para reproducir y comparar el efecto de `photo1` frente a otras aumentaciones (por ejemplo, `photo3`).
- Evaluación comparativa de arquitecturas CTC frente a autoregresivas: al compartir dataset y protocolo de test con otros modelos de la serie, permite aislar el efecto de la arquitectura.
- Extracción de texto de formularios manuscritos escaneados: con un paso previo de segmentación, el modelo transcribe campos de texto libre donde el OCR clásico falla por variabilidad caligráfica.
- Creación de datasets etiquetados: uso del modelo para preanotar corpus manuscritos en hebreo y acelerar el etiquetado humano posterior.
- Docencia y experimentación: modelo pequeño (87 M de parámetros) y licencia MIT que permiten su uso en prácticas de visión por computador y reconocimiento de escritura sin restricciones comerciales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1255 |
| HHD Option-B test (greedy, sin LM) | WER | 0,5064 |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no son aplicables a un modelo de reconocimiento de escritura. El modelo comparable de la misma serie, `cyttic/hmt-htrvt-photo3-s43`, reporta CER 0,0636 y WER 0,2859 sobre el mismo protocolo, lo que sitúa a esta variante `photo1` con una tasa de error notablemente superior.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (87,3 M de parámetros × 4 bytes), más activaciones y memoria del encoder visual; en la práctica, menos de 2 GB en total para lotes pequeños.
- VRAM estimada en FP16/BF16: alrededor de 0,18 GB para pesos, con margen amplio para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son más que suficientes y quedarán limitadas por el preprocesado de imagen, no por el modelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con `transformers` (cargando los safetensors), ONNX Runtime tras exportación, o TorchScript. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son adecuadas para esta arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | CER (HHD Option-B) | WER (HHD Option-B) | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo1-s43 | TrOCR + CTC | 87,3 M | 0,1255 | 0,5064 | MIT |
| cyttic/hmt-htrvt-photo3-s43 | HTRVT (variante del estudio) | no disponible | 0,0636 | 0,2859 | no disponible en la informacion |

No se dispone de datos de otros modelos comparables de la misma categoría (HTR en hebreo) en la información proporcionada. La comparación directa con `hmt-htrvt-photo3-s43` no es limpia, ya que difieren tanto la arquitectura como la aumentación; el propio diseño del estudio `htr-metrics-transfer` está pensado para desentrañar esas variables en experimentos posteriores.

## Limitaciones y advertencias

- El WER reportado (0,5064) es alto: aproximadamente la mitad de las palabras se transcriben con algún error en el protocolo de evaluación sin modelo de lenguaje, lo que limita su uso directo en producción sin postproceso.
- El modelo está entrenado únicamente en hebreo manuscrito; no generaliza a otros idiomas ni a texto impreso sin reentrenamiento.
- Al ser un checkpoint de un estudio de aumentación con una sola semilla (43), la varianza entre ejecuciones no está cuantificada en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos: puede producir caracteres o palabras plausibles pero ausentes en la imagen, especialmente en líneas degradadas.
- Sesgos potenciales derivados de la distribución de escritores del dataset `hhd-optionb-split`; el rendimiento puede degradarse con estilos caligráficos no representados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; es un artefacto de investigación.
- No se documentan limitaciones de longitud de secuencia ni de resolución de imagen; conviene validar el preprocesado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo1-s43
- Modelo comparable de la misma serie: https://huggingface.co/cyttic/hmt-htrvt-photo3-s43
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se dispone de URL directa en la información proporcionada)
- Resultados detallados: `results.json` del repositorio del modelo (no se dispone de URL directa en la información proporcionada)
