# JoeDwan/whisper-tiny_to_american_accent_28oct_v1_no_en

## Resumen

Whisper tiny to American accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario JoeDwan en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante mas pequena, orientado especificamente a transcripcion de audio en ingles con acento americano. El modelo parte de los pesos preentrenados de whisper-tiny y se reentrena sobre un conjunto de datos etiquetado como "American English".

El modelo tiene 37,76 millones de parametros y conserva la arquitectura encoder-decoder transformer propia de la familia Whisper, con una ventana de contexto de audio de 30 segundos por segmento (caracteristica estandar de Whisper). Su relevancia es limitada: se trata de un experimento de ajuste fino con muy pocas descargas y sin validacion externa, pero resulta util como ejemplo de adaptacion de dominios o acentos concretos sobre un modelo base pequeno y ligero.

La model card es practicamente automatica y no aporta informacion sobre la composicion del dataset, el proceso de entrenamiento detallado ni los usos previstos. El autor declara un WER de 7,3263 sobre el split de test del dataset "American English", aunque el resultado no esta verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (estandar Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder transformer que procesa espectrogramas mel de 80 canales y un decoder transformer autorregresivo que genera tokens de texto. Whisper utiliza atencion multi-cabeza estandar, embeddings posicionales sinusoidales y una representacion de audio fija de 30 segundos por ventana. El modelo tiny es el mas pequeno de la familia, con 4 capas en encoder y 4 en decoder, y una dimension de modelo de 384.

El ajuste fino se realizo durante 2 epocas con un learning rate de 1e-05, batch size de entrenamiento de 2 y de evaluacion de 8, optimizador AdamW (variante fused) con betas (0,9; 0,999), scheduler lineal con warmup del 25 % de los pasos y precision mixta nativa (AMP). Se utilizo la semilla 42. El dataset de entrenamiento se identifica como "American_english", pero no se detalla su composicion, tamano ni procedencia. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La perdida de validacion final fue de 0,1909 y el WER de 7,3263.

## Capacidades

- Transcripcion de voz a texto en ingles, con especializacion en acento americano.
- Reconocimiento automatico del habla (ASR) sobre segmentos de audio de hasta 30 segundos.
- Generacion de marcas de tiempo (timestamps) a nivel de token, como en el modelo Whisper original, aunque no se confirma en la model card.
- Traduccion de voz a texto: no confirmada para este ajuste fino; el modelo base Whisper la soporta, pero el ajuste se limita a ingles.
- Tool calling / function calling: no soportado (modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede procesar segmentos de hasta 30 segundos y generar texto con marcas temporales, adecuado para entornos de baja latencia y recursos limitados.
- Subtitulado automatico de contenido audiovisual en ingles: su tamano reducido permite ejecutarlo en CPU o GPU de gama baja, lo que facilita la generacion de subtitulos en pipelines de postproduccion.
- Prototipado rapido de asistentes de voz: al ser un modelo tiny, sirve para validar arquitecturas de ASR antes de escalar a variantes mayores de Whisper.
- Investigacion sobre adaptacion de acentos: util como caso de estudio de fine-tuning de dominio sobre un modelo base pequeno, comparando el impacto del ajuste en el WER.
- Transcripcion de llamadas de atencion al cliente en ingles: puede integrarse en sistemas de analitica de voz para extraer texto de conversaciones grabadas, siempre que se validen los sesgos de acento.
- Educacion y aprendizaje de ingles: permite transcribir ejercicios de pronunciacion de estudiantes y comparar con el texto esperado, aunque su WER de ~7 % limita la precision en entornos ruidosos.
- Despliegue en dispositivos edge: con 37,76 M de parametros y pesos safetensors de ~150 MB (el repo incluye 1,2 GB por artefactos de entrenamiento), es viable en Raspberry Pi o moviles con cuantizacion adecuada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ASR | American English (split test) | WER | 7,3263 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se ofrecen comparaciones con el modelo base whisper-tiny ni con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP32 para los 37,76 M de parametros, mas el overhead de activaciones y buffers de audio; en FP16 o cuantizacion INT8 se reduce por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs de gama baja como GTX 1650 o en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; tambien en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa, Ollama no lo incluye por defecto; alternativas: faster-whisper (compatible con pesos Whisper), Whisper.cpp (requiere conversion a GGML) y TGI no soporta ASR directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia de decenas de milisegundos por segmento de 30 segundos en GPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (American English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoeDwan/whisper-tiny_to_american_accent_28oct_v1_no_en | 37,76 M | 30 s audio | 7,3263 (declarado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,76 M | 30 s audio | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | 74,4 M | 30 s audio | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s audio | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de datos de WER de los modelos comparables en la informacion proporcionada, por lo que la comparacion numerica no es posible. La principal diferencia frente al modelo base es el ajuste fino sobre acento americano, con un WER declarado de 7,3263 que no puede contrastarse con el rendimiento del base sin ejecutar evaluaciones adicionales.

## Limitaciones y advertencias

- Model card generada automaticamente: no describe usos previstos, limitaciones ni composicion del dataset, lo que impide evaluar sesgos de forma rigurosa.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios o ruido, especialmente en segmentos sin habla clara.
- Sesgo de acento: el ajuste esta orientado a acento americano; el rendimiento en otros acentos del ingles (britanico, australiano, indio, etc.) no esta documentado y probablemente sea inferior.
- Limitacion de idioma: solo se declara ingles; no se garantiza soporte multilingue aunque el modelo base lo tuviera.
- Contexto limitado a 30 segundos por segmento: requiere segmentacion previa para audios largos.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el resultado no esta verificado de forma independiente.
- Sin validacion externa: 57 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones de terceros.
- El nombre del modelo en la model-index ("Whisper tiny Spanish") no coincide con el contenido (ingles americano), lo que sugiere un posible error de configuracion o copia de plantilla; conviene verificar antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/JoeDwan/whisper-tiny_to_american_accent_28oct_v1_no_en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
