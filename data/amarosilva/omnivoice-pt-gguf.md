# amarosilva/OmniVoice-PT-GGUF

## Resumen

OmniVoice-PT-GGUF es una conversión a formato GGUF del modelo de síntesis de voz OmniVoice (k2-fsa/OmniVoice), adaptada exclusivamente al portugués y empaquetada para un runtime en C basado en GGML que prescinde de PyTorch y de Whisper. El autor de la conversión es amarosilva, y el modelo base procede de k2-fsa. El objetivo es ofrecer un motor de text-to-speech ligero, ejecutable en CPU o GPU de consumo, con capacidad de clonación de voz, sin la sobrecarga de un stack de deep learning completo.

El modelo principal es un transformer de aproximadamente 22 millones de parámetros (según los pesos publicados), con el vocabulario de texto podado de 151.936 a 97.542 tokens para cubrir únicamente portugués y escritura latina. Se distribuye en tres cuantizaciones (Q4_0, Q8_0 y F16) junto con un decodificador de audio separado derivado de Higgs Audio 2 y un tokenizador BPE. La relevancia actual radica en su huella reducida: el conjunto completo para sintetizar ocupa entre 426 MB (Q4_0) y unos 1,2 GB (F16), frente a los 9,5 GB del stack original en PyTorch.

La licencia es estrictamente no comercial: los pesos heredan CC BY-NC 4.0 del modelo original y el decodificador se rige por la Boson Higgs Audio 2 Community License, basada en la Meta Llama 3 Community License. Esto condiciona por completo su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OmniVoice), con decodificador de audio separado derivado de Higgs Audio 2 (lookup RVQ + decoder DAC) |
| Parametros totales | 22.082.081 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q8_0, F16 |
| Idiomas soportados | Portugués (pt) únicamente |
| Licencia | omnivoice-pt-models; pesos principales y tokenizer CC BY-NC 4.0; decodificador Boson Higgs Audio 2 Community License; código del runtime Apache 2.0 |
| Formato de pesos | GGUF (GGML) |

## Arquitectura y entrenamiento

El modelo principal es un transformer de OmniVoice convertido a GGUF, sin cabeza de texto, lo que implica que la poda del vocabulario de texto (de 151.936 a 97.542 tokens) no altera la salida de audio. La conversión se realizó desde la revisión `c5fdb5ccb189668d56333f77ba2629f4cd7535f4` del repositorio k2-fsa/OmniVoice. El pipeline de síntesis se compone de tres piezas: el modelo principal (generación de tokens de audio), un decodificador de audio que contiene únicamente la parte de decodificación del tokenizer Higgs Audio 2 (lookup RVQ más decoder DAC, en F16) y un tokenizador BPE que combina Qwen3 con tokens propios de OmniVoice.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card menciona que los pesos originales se entrenaron con datos Emilia, lo que motiva la licencia CC BY-NC 4.0. La validación de la conversión reporta una coincidencia con PyTorch de coseno 1,000000 en el forward y 0,99998 en el decodificador. El encoder y el HuBERT del tokenizer original fueron eliminados porque solo se emplean para crear voces (prompts de clonación).

## Capacidades

- Síntesis de voz (text-to-speech) en portugués a partir de texto plano, con salida en WAV.
- Clonación de voz mediante archivos de prompt `.ovprompt` generados con `tools/make_prompt.py` a partir de un WAV; no se incluye ninguna voz predefinida en el repositorio.
- Control de velocidad de habla mediante el parámetro `--speed`.
- Control de pasos de muestreo (`--steps`) y de `--t_shift` para acelerar la inferencia (por ejemplo, `--steps 16 --t_shift 0.3` reporta aproximadamente 2× más rápido con la misma inteligibilidad en las pruebas del autor).
- Semilla configurable (`--seed`) para reproducibilidad.
- Ejecución en CPU o GPU (`--gpu`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio de entrada.
- Capacidad multilingüe limitada al portugués; el vocabulario fue podado explícitamente a ese idioma.

## Casos de uso

- Generación de locuciones en portugués para prototipos y demos: el runtime en C permite sintetizar frases desde línea de comandos con un consumo de VRAM de 745 MB en Q4_0, adecuado para entornos de desarrollo sin GPU dedicada.
- Audiolibros y contenido accesible de carácter no comercial: la clonación de voz permite mantener una voz consistente a lo largo de un texto largo, siempre que se cuente con consentimiento del hablante original.
- Pruebas de accesibilidad en aplicaciones: integración de TTS ligero en prototipos de lectores de pantalla o asistentes por voz en portugués, ejecutables en CPU con el modelo Q4_0 (323 MB).
- Investigación en síntesis de voz: la conversión GGUF con validación numérica frente a PyTorch (coseno 1,000000) sirve como referencia para estudiar cuantización en modelos TTS y comparar calidad entre Q4_0, Q8_0 y F16.
- Desarrollo de asistentes conversacionales en portugués de ámbito académico: el modelo puede actuar como capa de salida de voz en un pipeline mayor, siempre que el uso global respete la restricción no comercial.
- Evaluación de clonación de voz con consentimiento: creación de prompts `.ovprompt` a partir de grabaciones propias para estudiar fidelidad de clonación y latencia en hardware de consumo (RTX 5060 Ti, según las mediciones del autor).
- Docencia y experimentación con runtimes GGML: el código del runtime es Apache 2.0, lo que facilita su estudio y modificación en cursos sobre inferencia eficiente, independientemente de la licencia de los pesos.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento en una RTX 5060 Ti con la misma frase, 32 pasos y semilla 42, comparando el stack original en PyTorch (fp16) con las tres cuantizaciones GGUF:

| Métrica | PyTorch original (fp16) | Q4_0 | Q8_0 | F16 |
|---|---|---|---|---|
| VRAM pico | 2465 MB | 745 MB | 1013 MB | 1513 MB |
| RTF (menor = más rápido) | 0,222 | 0,157 | 0,160 | 0,162 |
| Disco total para sintetizar | 9,5 GB | 426 MB | 683 MB | ~1,2 GB |

El autor indica que Q8_0, F16 y Q4_0 resultaron indistinguibles en la transcripción automática. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia (medida por el autor en RTX 5060 Ti): 745 MB en Q4_0, 1013 MB en Q8_0 y 1513 MB en F16.
- GPU recomendadas: el autor valida en RTX 5060 Ti; por el reducido consumo de VRAM, cualquier GPU con al menos 2 GB libres debería ser suficiente, aunque no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, con las tres cuantizaciones, incluidas GPUs de gama baja con 2-4 GB de VRAM.
- Ejecución en CPU: soportada sin la opción `--gpu`; el autor recomienda Q4_0 para CPU por ser el archivo más pequeño (323 MB).
- Opciones de despliegue: runtime propio en C/GGML disponible en el repositorio de GitHub del autor (compilación manual; se anuncian ejecutables para Windows en Releases). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,157 (Q4_0), 0,160 (Q8_0) y 0,162 (F16) en RTX 5060 Ti, frente a 0,222 del original en PyTorch fp16. Con `--steps 16 --t_shift 0.3` el autor reporta aproximadamente 2× más rápido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada. A continuación se comparan únicamente aspectos estructurales verificables:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice-PT-GGUF (este) | 22.082.081 | no disponible | pt | CC BY-NC 4.0 (pesos) + Boson Higgs Audio 2 (decoder) | GGUF |
| k2-fsa/OmniVoice (base) | no disponible | no disponible | no disponible | CC BY-NC 4.0 | safetensors (PyTorch) |
| Otros TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (otros modelos TTS con clonación de voz) no está disponible en la información consultada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: los pesos principales y el tokenizer son CC BY-NC 4.0; queda prohibido vender el audio, cobrar por un servicio o integrarlo en un producto de pago.
- El decodificador se rige por la Boson Higgs Audio 2 Community License, basada en la Meta Llama 3 Community License, que obliga a seguir la Política de Uso Aceptable de Llama 3 y prohíbe usar las salidas para entrenar otros modelos de lenguaje.
- Solo portugués: el vocabulario de texto fue podado a 97.542 tokens para cubrir exclusivamente portugués y escritura latina; no se debe esperar calidad en otros idiomas.
- Clonación de voz restringida: solo debe clonarse la propia voz o voces con consentimiento explícito; la imitación sin autorización puede vulnerar derechos de personalidad y normativas de protección de datos.
- Riesgo de uso fraudulento: el modelo puede emplearse para suplantación de identidad o desinformación; el autor exige indicar que el audio es sintético al publicarlo.
- No se incluye ninguna voz predefinida: para clonar es necesario generar un `.ovprompt` con `tools/make_prompt.py`, que requiere Python y el OmniVoice original.
- No se documentan sesgos específicos del modelo, pero al derivar de un modelo entrenado con datos Emilia, pueden heredarse sesgos presentes en ese corpus.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos con nombres propios, siglas o términos poco frecuentes; no se documentan evaluaciones sistemáticas de este aspecto.
- El runtime es propio y requiere compilación manual; no hay integración documentada con frameworks de despliegue estándar (vLLM, llama.cpp, Ollama, TGI).
- Los modelos se distribuyen "tal cual", sin garantía; la responsabilidad del contenido generado recae en quien los usa.
- Este proyecto no está afiliado a k2-fsa, Xiaomi, Boson AI ni Meta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amarosilva/OmniVoice-PT-GGUF
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Código del runtime (GitHub): https://github.com/amarosilvasouza1/omnivoice-pt
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Política de Uso Aceptable de Llama 3: https://llama.meta.com/llama3/use-policy
