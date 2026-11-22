# masahiroid/llm-jp-4.1-8b-thinking-gguf

## Resumen

`masahiroid/llm-jp-4.1-8b-thinking-gguf` es una conversión comunitaria a formato GGUF del modelo japonés de razonamiento `llm-jp/llm-jp-4.1-8b-thinking`, desarrollado originalmente por el proyecto llm-jp. El modelo base cuenta con 8.590.200.832 parámetros y está orientado a generación de texto con capacidades de razonamiento explícito ("thinking"), con soporte para japonés e inglés. Esta conversión la publica el usuario independiente masahiroid y está pensada para su uso con llama.cpp.

El interés de este repositorio es doble. Por un lado, ofrece cuantizaciones ligeras (IQ4_XS e IQ3_M) calibradas con una imatrix de texto japonés, lo que permite ejecutar un modelo de 8B en máquinas con 8 GB de RAM. Por otro lado, documenta un problema técnico relevante: llm-jp-4.1 emplea un tokenizador Unigram nativo de Hugging Face (sin binario sentencepiece), que el script de conversión estándar de llama.cpp no soporta de serie, por lo que el autor aplicó un parche para leer el vocabulario directamente de `tokenizer.json`.

Conviene señalar que el propio autor recomienda, para producción, el repositorio oficial de llm-jp (que incluye BF16, un Q4_K_M con imatrix y un fork de llama.cpp necesario para el parseo de chat/harmony). Este repositorio es, por tanto, una alternativa independiente con fines prácticos y de documentación, no la vía oficial recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia llm-jp-4.1) |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (sin calibrar), IQ4_XS (imatrix japonesa), IQ3_M (imatrix japonesa) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base en la documentacion proporcionada. Se trata de un modelo de la familia llm-jp-4.1 con 8B parametros, etiquetado como modelo de razonamiento ("thinking"), lo que implica que genera bloques de pensamiento internos antes de la respuesta final, delimitados con marcas tipo `<|channel|>` cuando se usa la plantilla de chat.

En cuanto a esta conversion concreta, el autor documenta que llm-jp-4.1 usa un tokenizador Unigram nativo de Hugging Face (`tokenizer.json`, sin `tokenizer.model` binario), lo que rompe el script de conversion estandar de llama.cpp. La solucion aplicada fue un parche que lee los pares (piece, score) directamente del campo `model.vocab` de `tokenizer.json`. La imatrix se calculo con `llama-imatrix` sobre texto japones de Aozora Bunko (416 fragmentos de 512 tokens, unos 213.000 tokens). No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en japones e ingles.
- Razonamiento explicito en modo "thinking", con bloques de pensamiento separados de la respuesta.
- Conversacion multi-turno mediante plantilla de chat (jinja), con limitaciones de parseo en llama.cpp estandar.
- Complemento de prompts en bruto recomendado con `--no-jinja`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking es compatible con cadenas de razonamiento.
- Vision, audio u otras modalidades: no disponible.
- Capacidades multilingues limitadas a ja y en segun los metadatos.

## Casos de uso

- Razonamiento en japones en local: el modelo permite ejecutar tareas de razonamiento step-by-step en japones sobre hardware de consumo, usando IQ3_M (4,13 GB) en equipos con 8 GB de RAM.
- Asistencia a la escritura en japones: generacion y revision de texto en japones con contexto conversacional, aprovechando el tokenizador Unigram nativo y el soporte de plantilla de chat.
- Analisis de texto literario japones: la imatrix se calibro sobre Aozora Bunko, por lo que el modelo rinde especialmente bien en registros literarios y clasicos del japones.
- Prototipado de pipelines de razonamiento: integracion en llama.cpp para experimentar con modos thinking y comparar cuantizaciones (Q4_K_M frente a IQ4_XS/IQ3_M) segun el equilibrio calidad/tamano.
- Despliegue en entornos con RAM limitada: IQ3_M cabe comodamente en maquinas de 8 GB, lo que permite usar un LLM de razonamiento en portatiles sin GPU dedicada.
- Traduccion y asistencia bilingue ja-en: tareas de traduccion o generacion bilingue dentro de las capacidades declaradas del modelo.
- Evaluacion y auditoria de conversiones: el repositorio sirve como referencia reproducible de como convertir modelos con tokenizador Unigram nativo a GGUF, util para equipos que mantengan conversiones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perplejidad (PPL) medida con `llama-perplexity -c 512 --chunks 120` sobre texto reservado de Aozora Bunko:

| Archivo | Cuantizacion | imatrix | Tamano | PPL (menor es mejor) |
|---|---|---|---|---|
| `llm-jp-4.1-8b-thinking-Q4_K_M.gguf` | Q4_K_M | ninguna (base) | 5,30 GB | 41,23 ± 0,81 |
| `llm-jp-4.1-8b-thinking-IQ4_XS-imat.gguf` | IQ4_XS | japonesa | 4,82 GB | 42,29 ± 0,84 |
| `llm-jp-4.1-8b-thinking-IQ3_M-imat.gguf` | IQ3_M | japonesa | 4,13 GB | 44,38 ± 0,88 |

El autor advierte que los valores absolutos son altos por tratarse de japones literario antiguo y que solo deben usarse para comparar los archivos entre si. Un Q4_K_M con imatrix japonesa obtuvo 41,10 ± 0,81, dentro del margen de error del base, por lo que no se publico.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 5,3 GB para Q4_K_M, 4,8 GB para IQ4_XS y 4,1 GB para IQ3_M, mas overhead de contexto y del runtime.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) para Q4_K_M; IQ3_M permite incluso equipos con 8 GB de RAM en CPU.
- GPU profesionales: A100, H100 y similares no son necesarias para este tamano, pero son compatibles.
- Opciones de despliegue: llama.cpp (recomendado por el autor), y por extension cualquier frontend compatible con GGUF. Para chat/harmony se requiere el fork `llm-jp/llama.cpp` (`llmjp-harmony-handler`); con llama.cpp estandar se recomienda `--no-jinja`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `masahiroid/llm-jp-4.1-8b-thinking-gguf` (este) | 8,59B | no disponible | GGUF (Q4_K_M, IQ4_XS, IQ3_M) | Apache 2.0 | Conversion comunitaria; Q4_K_M sin calibrar; requiere parche de tokenizador |
| `llm-jp/llm-jp-4.1-8b-thinking-gguf` (oficial) | 8B | no disponible | GGUF (BF16, Q4_K_M con imatrix) | Apache 2.0 | Recomendado para produccion; incluye fork de llama.cpp para harmony |
| `masahiroid/llm-jp-4.1-8b-thinking-4bit-mlx` | 8B | no disponible | MLX 4bit | Apache 2.0 | Misma conversion sin calibrar, para ecosistema MLX/Apple |
| `llm-jp/llm-jp-4.1-8b-thinking` (base) | 8,59B | no disponible | safetensors | Apache 2.0 | Modelo original en precision completa |

## Limitaciones y advertencias

- Es una conversion comunitaria, no una release oficial de llm-jp; el autor recomienda el repositorio oficial para produccion.
- El Q4_K_M publicado no esta calibrado con imatrix; las versiones IQ4_XS e IQ3_M pierden calidad (aproximadamente +3 % y +8 % de PPL respectivamente).
- El parseo de chat/harmony falla con llama.cpp estandar; se necesita el fork oficial o usar `--no-jinja` para completar prompts en bruto.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la documentacion.
- Sesgos conocidos: no documentados; al estar entrenado principalmente en japones, puede presentar sesgos culturales y linguisticos propios del corpus.
- Cobertura limitada a japones e ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no especificada, lo que dificulta planificar despliegues con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base upstream.
- El repositorio incluye una auditoria de seguridad con `model-audit-lite` (formato de pesos, plantilla de chat, codigo incluido y ML-BOM); revisar `SECURITY.md` antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/llm-jp-4.1-8b-thinking-gguf
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- GGUF oficial de llm-jp: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking-gguf
- Fork de llama.cpp de llm-jp: https://github.com/llm-jp/llama.cpp/tree/llmjp-harmony-handler
- llama.cpp (upstream): https://github.com/ggml-org/llama.cpp
- Toolkit de conversion del autor: https://github.com/masahiroid/mlx-coreml-conversion-toolkit
- Herramienta de auditoria: https://github.com/masahiroid/model-audit-lite
- Conversion MLX 4bit del mismo autor: https://huggingface.co/masahiroid/llm-jp-4.1-8b-thinking-4bit-mlx
