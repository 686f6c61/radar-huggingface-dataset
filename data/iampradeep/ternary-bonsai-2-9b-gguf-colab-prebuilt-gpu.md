# IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU

## Resumen

Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU es un repositorio de pesos cuantizados en formato GGUF del modelo Ternary-Bonsai-2-9B, publicado por el usuario IamPradeep. Se trata de una variante ternaria (pesos restringidos a {-1, 0, +1}) derivada de Qwen3.5-9B, con la arquitectura sin cambios respecto al modelo base, que incluye capacidad de vision y una ventana de contexto de 262.000 tokens. El repositorio empaqueta ademas un binario precompilado de llama.cpp (fork PrismML) y librerias CUDA 12 para ejecutar el modelo en Google Colab en menos de un minuto.

La propuesta principal es la compresion extrema: la variante PQ2_0 ocupa aproximadamente 2,42 GB frente a unos 17,9 GB en FP16, manteniendo contexto largo y entrada multimodal. Esto lo hace atractivo para entornos con VRAM limitada, como GPU de consumo o instancias gratuitas de Colab, donde un modelo de 9B en precision completa no cabria.

El modelo esta orientado a conversacion (tag `conversational`), admite modo de razonamiento (thinking) y vision mediante un proyector multimodal separado. La licencia del modelo base se declara como Apache 2.0 en la model card, aunque el campo de licencia del repositorio en Hugging Face figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (arquitectura sin cambios), con proyector de vision para entrada multimodal |
| Parametros totales | 1.470.621.184 (segun safetensors); la model card lo describe como modelo de 9B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | Ternaria: PQ2_0 (~2,42 GB), PTQ1_0, Q2_0, PQ2_0 + MTP; proyector de vision en Q8_0 (~624 MB) o BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en la model card para el modelo base); campo de licencia del repo no disponible |
| Formato de pesos | GGUF (mas proyector mmproj en GGUF y paquete binario llama.cpp) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del transformer Qwen3.5-9B, sin modificaciones estructurales, pero con los pesos del modelo de lenguaje cuantizados a valores ternarios {-1, 0, +1}. Esta cuantizacion ternaria es la que permite reducir el tamano del modelo de aproximadamente 17,9 GB en FP16 a unos 2,42 GB en la variante PQ2_0, manteniendo la ventana de contexto de 262.000 tokens. La componente de vision se distribuye como un proyector multimodal independiente (mmproj) en Q8_0 o BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. Tampoco se documenta el proceso de cuantizacion ternaria (metodo de entrenamiento o post-entrenamiento) ni innovaciones adicionales como decodificacion especulativa. La model card menciona una variante con MTP (multi-token prediction) como opcion de despliegue, pero sin detallar su funcionamiento.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Modo de razonamiento (thinking mode) activable mediante `--reasoning on`, con recomendacion de usar temperatura 1.0 y al menos 8192 tokens de salida.
- Entrada de vision: procesamiento de imagenes mediante el proyector multimodal Q8_0 o BF16.
- Contexto largo de hasta 262.000 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Renderizado de matematicas en la interfaz interactiva (KaTeX), lo que sugiere soporte de contenido matematico en las respuestas.
- Adjuncion de archivos de codigo en la UI interactiva de Colab.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte explicito de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido en Google Colab: el repositorio incluye un binario precompilado y un notebook de dos celdas que permite tener el modelo conversando en menos de un minuto, ideal para pruebas de concepto sin configurar un entorno de inferencia desde cero.
- Analisis de documentos largos: con 262.000 tokens de contexto, el modelo puede procesar contratos, informes o bases de codigo extensas en una sola pasada, util para resumen y extraccion de informacion.
- Asistencia multimodal en entornos con VRAM limitada: al ocupar unos 2,42 GB en PQ2_0, permite describir imagenes o responder preguntas sobre capturas en GPU de consumo o instancias gratuitas de Colab.
- Chatbot de atencion al cliente en prototipos: su naturaleza conversacional y el modo instant/thinking permiten simular flujos de soporte multi-turno antes de invertir en infraestructura mayor.
- Educacion y tutoria con matematicas: la UI interactiva renderiza formulas en KaTeX, lo que facilita usar el modelo para explicar problemas paso a paso con modo de razonamiento.
- Evaluacion de cuantizacion ternaria: investigadores pueden comparar la calidad de las variantes PQ2_0, PTQ1_0, Q2_0 y PQ2_0 + MTP sobre las mismas tareas para estudiar el impacto de la compresion extrema.
- Experimentacion con vision en local: descargando el proyector Q8_0 (~624 MB) se puede montar un pipeline multimodal ligero en un portatil con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,42 GB para los pesos del modelo en PQ2_0, mas el proyector de vision Q8_0 (~624 MB) si se usa entrada multimodal, mas overhead de contexto KV cache (que crece con la ventana usada; el contexto maximo de 262.000 tokens requiere mucha mas memoria que los pesos).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para uso texto con contexto moderado; el repositorio esta disenado para GPUs de Colab (tipicamente T4 con 16 GB o similares).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, 4060, 4070 o superiores, especialmente en modo texto y con contexto reducido.
- Opciones de despliegue: llama.cpp mediante el binario precompilado del fork PrismML incluido en el repositorio; tambien deberia funcionar con builds estandar de llama.cpp compatibles con GGUF ternario, aunque no se confirma en la informacion disponible. vLLM, TGI y Ollama no se mencionan.
- Latencia y throughput: no disponibles. La model card afirma que el setup y la descarga completa se hacen en menos de un minuto en Colab, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-9B (PQ2_0) | 9B (1.470.621.184 segun safetensors) | 262.000 | Si (proyector separado) | Apache 2.0 (declarada) | GGUF, repo con binario precompilado |
| Qwen3.5-9B (modelo base) | 9B | 262.000 (heredado) | Si | Apache 2.0 | Pesos originales en BF16/FP16, ~17,9 GB |
| BitNet b1.58 (referencia de cuantizacion ternaria) | Varios tamanos | no disponible | No | no disponible | Pesos ternarios, ecosistema de investigacion |

La comparativa con alternativas de cuantizacion ternaria de terceros no esta disponible en la informacion proporcionada. Frente al modelo base Qwen3.5-9B, la ventaja principal es el tamano (2,42 GB frente a 17,9 GB) a costa de una posible perdida de calidad no cuantificada en la model card.

## Limitaciones y advertencias

- La cuantizacion ternaria extrema puede degradar la calidad respecto al modelo base en tareas complejas de razonamiento o codigo; no se publican evaluaciones que cuantifiquen esta perdida.
- El campo de licencia del repositorio figura como no disponible; la model card declara Apache 2.0 para el modelo base, pero conviene verificar la licencia aplicable antes de uso comercial.
- Los idiomas soportados no estan documentados; el rendimiento fuera del ingles y el chino (idiomas habituales de la familia Qwen) es incierto.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado por la cuantizacion agresiva.
- El modo thinking puede consumir mas de 3000 tokens en prompts simples; hay que reservar al menos 8192 tokens de salida y evitar decodificacion greedy, segun la model card.
- El repositorio depende de un binario precompilado de un fork de llama.cpp (PrismML) y de librerias CUDA 12 especificas; la compatibilidad con otras herramientas no esta garantizada.
- El contexto de 262.000 tokens es el maximo teorico; usarlo completo requiere una KV cache muy grande que supera la VRAM de GPU de consumo.
- El autor del repositorio (IamPradeep) no es el desarrollador original del modelo; se trata de un empaquetado de terceros, lo que anade un nivel de confianza adicional a verificar.
- No hay informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU
- Notebook interactivo de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU/blob/main/Ternary-Bonsai-2-9B-GGUF-Interactive-UI.ipynb
- Imagen de configuracion del servidor: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU/resolve/main/Ternary-Bonsai-2-9B-Server-Setup.png
- GIF de la interfaz de chat: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-9B-GGUF-Colab-Prebuilt-GPU/resolve/main/Ternary-Bonsai-2-9B-Response-Generation.gif
- Paper, blog o repositorio del modelo base Qwen3.5-9B: no disponible en la informacion proporcionada.
