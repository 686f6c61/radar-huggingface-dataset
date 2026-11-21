# hataphu/PaddleOCR-VL-1.6-vi-v7-gguf

## Resumen
PaddleOCR-VL-1.6-vi-v7-gguf es una conversión al formato GGUF de un fine-tune LoRA del modelo PaddleOCR-VL-1.6 de PaddlePaddle, orientado específicamente al reconocimiento óptico de caracteres (OCR) en vietnamita. Lo publica el usuario hataphu en Hugging Face con licencia Apache 2.0 heredada del modelo base. El modelo resuelve el problema de la lectura precisa de documentos escaneados de baja calidad en vietnamita, en particular textos del dominio eléctrico (transformadores, ensayos y verificación de equipos), corrigiendo confusiones entre vocales diacríticas visualmente próximas (ă/â, ư/u, ơ/o, ở/ổ) que aparecen en imágenes borrosas, subexpuestas o fotocopiadas.

La arquitectura combina un codificador visual de tipo SigLIP con un decodificador de lenguaje ERNIE-4.5-0.3B y un proyector mlp_AR, sumando 466.654.208 parámetros (~467 M). Se distribuye en dos ficheros GGUF que deben usarse juntos: el decodificador de lenguaje con los pesos LoRA fusionados (~933 MB, bf16) y el codificador visual más el proyector (~882 MB, bf16). Es relevante ahora porque permite ejecutar OCR vietnamita especializado en llama.cpp sobre hardware modesto, incluida una GPU de consumo de 8 GB, y porque la versión v7 incorpora datos sintéticos con degradaciones realistas de fotocopia para mejorar la robustez frente a escaneos deficientes.

El modelo está pensado para desarrolladores que necesitan digitalizar documentación técnica en vietnamita sin depender de servicios OCR en la nube, con control total sobre el pipeline y con un formato compatible con el ecosistema llama.cpp (llama-mtmd-cli). Su punto fuerte declarado es la exactitud sobre texto especializado degradado; su limitación principal es la estrechez del dominio de entrenamiento adicional, construido a partir de solo 2.065 líneas reales de documentación eléctrica.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP + proyector mlp_AR + decodificador de lenguaje ERNIE-4.5-0.3B (modelo multimodal tipo vision-language) |
| Parametros totales | 466.654.208 (~467 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Solo bf16 en esta publicacion (GGUF bf16); no se listan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: decodificador y mmproj del codificador visual) |

## Arquitectura y entrenamiento
El modelo parte de PaddleOCR-VL-1.6, que empareja un codificador visual SigLIP con un decodificador de lenguaje ERNIE-4.5-0.3B y un proyector mlp_AR que alinea ambos espacios. El fine-tune se realizó mediante LoRA con rank=16, alpha=32 y dropout=0.05, aplicado únicamente a las capas de self-attention y MLP del decodificador de lenguaje y al proyector mlp_AR. El entrenamiento se ejecutó en una única GPU de consumo de 8 GB VRAM (arquitectura Turing, sin tensor cores bf16), con batch size 1, acumulación de gradiente, gradient checkpointing y precisión bf16.

El corpus de ajuste evolucionó por versiones: v3 con ~40.000 muestras sintéticas de texto impreso en línea única; v4 con ~3.000 muestras de escritura manuscrita real (iAmHieu2012); v5 con ~8.000 muestras de párrafos sintéticos multi-frase; v6 con ~6.900 muestras sintéticas de texto en mayúsculas para corregir la pérdida de diacríticos en textos capitalizados; y v7, la versión publicada, que añade ~5.445 muestras (x2 epochs) del dominio eléctrico, generadas a partir de 2.065 líneas reales extraídas de documentos eléctricos y renderizadas como imágenes sintéticas con degradaciones que imitan fotocopia y subexposición (desenfoque intenso, reducción de brillo y contraste, ruido granular, compresión JPEG severa). No se documenta un proceso de RLHF o DPO; el ajuste es supervisado sobre pares imagen-texto.

## Capacidades
- OCR de texto impreso en vietnamita, tanto en línea única como en párrafos de varias frases.
- Lectura de texto manuscrito vietnamita (entrenado con muestras reales del conjunto iAmHieu2012).
- Reconocimiento robusto de texto en mayúsculas con diacríticos completos.
- Lectura de documentos técnicos del dominio eléctrico sobre imágenes degradadas (borrosas, subexpuestas, fotocopiadas).
- Manejo de símbolos técnicos presentes en los documentos de entrenamiento, como el símbolo de ohmio (Ω).
- Procesamiento multimodal imagen-a-texto mediante el codificador visual SigLIP y el proyector mlp_AR.
- Inferencia compatible con llama.cpp mediante llama-mtmd-cli, con plantilla de chat personalizada que requiere el flag --jinja.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking ni audio.

## Casos de uso
- Digitalización de manuales y protocolos de ensayo de transformadores y equipos eléctricos: el modelo está ajustado sobre 2.065 líneas reales de este dominio y rinde mejor que la versión previa en imágenes de fotocopia, por lo que resulta adecuado para convertir archivos técnicos históricos en texto editable.
- Procesamiento por lotes de escaneos de baja calidad en pipelines internos: al ejecutarse en llama.cpp con llama-mtmd-cli, permite integrar el OCR en scripts automatizados que recorran carpetas de imágenes y vuelquen el texto a una base documental.
- Extracción de campos en formularios e informes de laboratorio eléctrico: la alta exactitud de carácter declarada (99,89 % CER 0,0011 en el conjunto de prueba del dominio) reduce los errores de transcripción en valores y etiquetas que luego se validan contra una base de datos.
- OCR en el borde o en equipos sin GPU dedicada: el reparto de pesos (unos 933 MB para el decodificador y 882 MB para el codificador visual en bf16) permite desplegar el modelo en estaciones de trabajo modestas o en una GPU de consumo de 8 GB.
- Archivística y preservación documental vietnamita: útil para digitalizar fondos con manuscritos y texto capitalizado, capacidades cubiertas por las versiones v4 y v6 del ajuste.
- Verificación de calidad de digitalización: al comparar la salida del modelo con el original se pueden detectar páginas mal escaneadas o ilegibles, dado que el autor advierte que degradaciones extremas seguen produciendo fallos.
- Preprocesado para sistemas RAG en vietnamita: el texto extraído de documentos técnicos puede alimentar índices de recuperación, aprovechando la especialización del modelo frente a OCR genéricos.

## Benchmarks y rendimiento
| Conjunto de evaluacion | Version | CER | Exactitud de caracter | Exact match |
|---|---|---|---|---|
| Dominio electrico (200 muestras, incluida fotocopia muy degradada) | v6 (sin entrenamiento de dominio) | no disponible (fallos de vocales diacriticas en imagenes borrosas) | no disponible | no disponible |
| Dominio electrico (200 muestras, incluida fotocopia muy degradada) | v7 (esta version) | 0,0011 | 99,89 % | 99,0 % |
| Regresion (minusculas + parrafos largos + mayusculas, 200 muestras mixtas) | v6 | 0,0004 | 99,96 % | 98,5 % |
| Regresion (minusculas + parrafos largos + mayusculas, 200 muestras mixtas) | v7 (esta version) | 0,0004 | 99,96 % | 98,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores proceden de la model card del autor y se midieron sobre datos sinteticos con degradaciones simuladas, no sobre escaneos reales al 100 %.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,8 GB en bf16 si se cargan ambos ficheros (933 MB + 882 MB), mas el overhead de contexto y del runtime de llama.cpp; en la practica conviene reservar entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el autor entrenó con una GPU Turing de 8 GB, lo que indica que la inferencia cabe holgadamente en ese perfil. GPU profesionales como A100 o H100 no aportan ventaja relevante para un modelo de ~467 M.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o menos (por ejemplo, series RTX 2060/3060/4060 y equivalentes); también es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp con llama-mtmd-cli (soporte de la arquitectura PaddleOCR-VL incorporado via PR #18825) y, en general, el ecosistema GGUF compatible; no se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles. El autor recomienda usar --temp 0 y ajustar -n segun la longitud del texto a extraer.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PaddleOCR-VL-1.6-vi-v7-gguf (este) | ~467 M | no disponible | vietnamita | Apache 2.0 | GGUF bf16 | Fine-tune de dominio electrico con degradaciones de fotocopia |
| PaddlePaddle/PaddleOCR-VL-1.6 (base) | ~1.000 M segun la model card (frente a 466,7 M en safetensors del fine-tune) | no disponible | multilingue (segun modelo base) | Apache 2.0 | safetensors (original) | Modelo generalista sin ajuste especifico al vietnamita ni al dominio electrico |
| OCR genericos tipo Tesseract | no disponible | no disponible | multilingue | Apache 2.0 | no disponible | Sin ajuste a vietnamita tecnico ni a imagenes degradadas; comparacion no verificada con datos |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; las cifras de la tabla anterior solo reflejan caracteristicas declaradas, no resultados de benchmark cruzados.

## Limitaciones y advertencias
- Vocabulario de dominio limitado: el ajuste de v7 se basa en solo 2.065 lineas reales procedentes de un unico grupo de documentos (transformadores y ensayos/verificacion de equipos electricos); terminologia o tipos documentales no vistos pueden seguir dando problemas.
- Benchmarks medidos sobre datos sinteticos: el 99,89 % de exactitud y el 99,0 % de exact match provienen de imagenes renderizadas con degradaciones simuladas, no de escaneos reales al 100 %; el propio autor lo advierte.
- Fallos en degradaciones extremas: con rotaciones fuertes, compresion JPEG doble o ruido muy superior al del conjunto de entrenamiento, el modelo puede seguir equivocandose.
- Riesgo de alucinacion: como modelo generativo de lenguaje, puede producir texto plausible que no aparece en la imagen, especialmente en regiones ilegibles; conviene validar la salida en flujos criticos.
- Sesgos: no se documentan sesgos especificos; al estar entrenado con datos sinteticos y un corpus acotado, puede sobrerrepresentar estilos tipograficos y terminologia de ese dominio.
- Cobertura idiomatica restringida: solo vietnamita; no debe usarse para otros idiomas sin evaluacion previa.
- Dependencia de configuracion: requiere ambos ficheros GGUF y el flag --jinja; sin ellos el modelo no procesa imagenes o falla la plantilla de chat.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin garantias; debe revisarse tambien la licencia del modelo base PaddleOCR-VL-1.6.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hataphu/PaddleOCR-VL-1.6-vi-v7-gguf
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de soporte de la arquitectura PaddleOCR-VL en llama.cpp: PR #18825 (referenciado en la model card; no se proporciona URL directa)
- Conjunto de escritura manuscrita real citado: iAmHieu2012 (referenciado en la model card; no se proporciona URL directa)
- DOI asociado al modelo: 10.57967/hf/11736
