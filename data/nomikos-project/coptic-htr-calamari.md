# nomikos-project/coptic-htr-calamari

## Resumen

`nomikos-project/coptic-htr-calamari` es un checkpoint de reconocimiento de texto manuscrito (HTR) especializado en copto, publicado por el proyecto Nomikos (nomikos-project), una iniciativa centrada en anotación y transcripción asistida por IA de lenguas como el griego, el copto, el armenio y el siríaco. El modelo resuelve un problema muy concreto: transcribir imágenes de manuscritos coptos que ya han sido segmentadas a nivel de línea, no páginas completas.

Técnicamente es un modelo Calamari en formato `calamari-pytorch-v1`, con una CNN de 40/60 filtros seguida de 2 LSTM bidireccionales y decodificación CTC, sobre líneas normalizadas a 48 píxeles de altura y un alfabeto CTC de 39 caracteres. Se entrenó desde cero sobre un split de ajuste fino en copto, sin corpus de preentrenamiento específico, con 2258/282/283 líneas de entrenamiento, validación y test.

Su relevancia es de nicho pero clara para el ámbito de las humanidades digitales: ofrece un punto de partida abierto (pesos en PyTorch y ONNX) para digitalizar corpus coptos con revisión experta, con un CER del 8,23% y un exact match del 43,1% declarados en el split de test oficial. No es un modelo generativo ni de propósito general: es una herramienta de transcripción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Calamari (`calamari-pytorch-v1`): CNN (40/60 filtros) + 2 LSTM bidireccionales + CTC |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo HTR a nivel de línea; altura de línea fijada en 48 px) |
| Tipos de cuantización | no disponible (se distribuyen pesos PyTorch y exportación ONNX sin cuantizar) |
| Idiomas soportados | cop (copto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`) y ONNX (`best.onnx`); configuración de entrenamiento en `config.yaml` |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Pipeline | image-to-text |
| Tarea declarada | transcribe (reconocimiento de texto manuscrito) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Calamari: un extractor convolucional con dos capas (`conv0_filters=40`, `conv1_filters=60`), dos capas LSTM bidireccionales (`lstm_layers=2`) y una cabeza de decodificación CTC con un alfabeto de 39 caracteres. Las líneas se normalizan a una altura de 48 píxeles. El autor indica que una variante con CNN más ancha (60/80 filtros) obtuvo peores resultados en el mismo conjunto de test, por lo que se publicó la versión más pequeña como checkpoint `stable`. El archivo `best.pt` corresponde al checkpoint con menor CER de validación.

El entrenamiento fue de una sola etapa con pérdida CTC sobre ground truth copto: semilla `1111`, batch 32, tasa de aprendizaje 0,001, esquema de 150 épocas y 5 copias aumentadas más el original por muestra. Los datos provienen de `data/processed/coptic/finetuning`, con un reparto a nivel de línea de 2258/282/283 para entrenamiento, validación y test (80/10/10). El modelo se entrenó desde cero, sin un corpus de preentrenamiento copto separado. El seguimiento del experimento está disponible en Weights & Biases bajo el run `coptic_training_lstm2`.

## Capacidades

- Reconocimiento de texto manuscrito en copto sobre recortes de línea ya segmentados.
- Transcripción image-to-text con salida de texto plano.
- Flujo de trabajo experto en el bucle: genera transcripciones candidatas que un especialista revisa y corrige.
- Exportación ONNX (`best.onnx`) para despliegue fuera de PyTorch.
- Integración con la plataforma de anotación Nomikos y con la herramienta de inferencia `nomikos-inference`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües: está entrenado exclusivamente para copto.
- No tiene modo de razonamiento (thinking mode), ni visión general, ni audio.

## Casos de uso

- Transcripción de manuscritos coptos ya segmentados: el modelo procesa imágenes de línea y devuelve la transcripción, lo que permite digitalizar colecciones una vez resuelta la segmentación de páginas con otra herramienta.
- Pretranscripción para revisión experta (expert-in-the-loop): se usa como primer pase automático y el filólogo corrige; con un CER del 8,23% el esfuerzo de corrección se concentra en un porcentaje reducido de caracteres.
- Digitalización de fragmentos y papiros: adecuado para piezas donde ya se han aislado líneas individuales y se busca texto indexable.
- Creación de corpus de búsqueda a texto completo: las transcripciones permiten indexar y consultar corpus coptos por términos, algo inviable sobre imágenes.
- Ajuste fino posterior: al ser un checkpoint abierto con configuración de entrenamiento incluida (`config.yaml`), sirve como base para reentrenar sobre variantes dialectales, escribas o colecciones concretas.
- Integración en pipelines de catalogación: el export ONNX permite incorporar la transcripción a flujos de catalogación sin depender de PyTorch ni de GPU.
- Generación de datos de entrenamiento: las transcripciones revisadas manualmente pueden realimentar el ciclo de entrenamiento y ampliar el conjunto de ground truth.
- Uso dentro de la plataforma Nomikos: se integra como modelo del registro (`coptic-calamari-v1`, tag `stable`) en el editor de anotación y en el agente de inferencia por línea de comandos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test oficial (283 líneas). Los valores no están verificados de forma independiente (`verified: false`).

| Métrica | Valor (decimal) | Valor (%) | Conjunto |
|---|---:|---:|---|
| Test CER | 0,082 | 8,23% | Test oficial, 283 líneas |
| Test WER | 0,591 | 59,1% | Test oficial, 283 líneas |
| Test exact match | 0,431 | 43,1% | Test oficial, 283 líneas |

Comparativa interna declarada por el autor sobre el mismo conjunto de test:

| Variante | CER | WER | Exact match |
|---|---:|---:|---:|
| CNN 40/60 (modelo publicado, `stable`) | 8,23% | 59,1% | 43,1% |
| CNN 60/80 | 8,76% | 63,4% | 38,9% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el README no publica el número de parámetros ni requisitos de memoria.
- Se trata de un modelo ligero de tipo CNN + LSTM para líneas de 48 píxeles de altura; esta familia de modelos Calamari suele ser viable en CPU para inferencia por lotes.
- GPU recomendadas: no disponible (no se especifican en la información proporcionada). Cualquier GPU con soporte PyTorch o ONNX Runtime puede ejecutar la inferencia.
- ¿Cabe en GPU de consumo? No se especifica; por el tipo de arquitectura, es presumiblemente compatible con GPUs de gama media, pero no hay datos oficiales.
- Opciones de despliegue: Calamari sobre PyTorch (`best.pt`), ONNX Runtime (`best.onnx`), la CLI `nomikos-inference` (instalable con `uv tool install nomikos-inference`) y descarga vía `huggingface_hub`.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: son runtimes para modelos de lenguaje, no para HTR Calamari.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | CER (test) | WER (test) | Exact match | Licencia |
|---|---|---|---:|---:|---:|---|
| coptic-htr-calamari (publicado) | Calamari CNN 40/60 + 2 LSTM | cop | 8,23% | 59,1% | 43,1% | no disponible |
| Variante CNN 60/80 del mismo autor | Calamari CNN 60/80 + 2 LSTM | cop | 8,76% | 63,4% | 38,9% | no disponible |
| Otros modelos HTR para copto | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables (por ejemplo, otros HTR coptos o modelos genéricos de Calamari) en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito de uso restringido: solo transcribe líneas ya segmentadas. No resuelve maquetación a nivel de página ni folios sin segmentar, que la model card declara explícitamente fuera de alcance.
- Monolingüe: entrenado únicamente para copto (`cop`). No se ha validado en otras escrituras ni lenguas.
- WER elevado (59,1%) frente a un CER bajo (8,23%): aunque se reconocen bien los caracteres, un porcentaje alto de líneas contiene algún error y solo el 43,1% coincide exactamente. Para producción exige revisión humana.
- Corpus de entrenamiento pequeño: 2258 líneas de entrenamiento, lo que puede provocar sesgo hacia los escribas, la tipografía y el vocabulario presentes en ese conjunto.
- Riesgo de alucinación contextual: como modelo CTC sobre un alfabeto cerrado de 39 caracteres, puede producir secuencias plausibles donde la imagen es ambigua o está degradada.
- Licencia no disponible: no se especifican términos de uso comercial, por lo que su empleo en productos comerciales queda sin cobertura legal clara.
- Madurez y validación externa limitadas: el repositorio registra 0 descargas y 0 likes, y las métricas están marcadas como no verificadas (`verified: false`).
- Discrepancia en el tamaño del repositorio: HuggingFace indica 0.0 GB, incoherente con la presencia de `best.pt` y `best.onnx`; conviene verificar los archivos antes de integrarlo.
- Sin cuantizaciones publicadas: solo se ofrecen pesos PyTorch y ONNX en precisión original, lo que puede limitar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomikos-project/coptic-htr-calamari
- Organización en HuggingFace: https://huggingface.co/nomikos-project
- Plataforma Nomikos: https://www.nomikos.app/
- Seguimiento del entrenamiento (Weights & Biases): https://wandb.ai/personal-space-astha/OCR_Consulting_final
