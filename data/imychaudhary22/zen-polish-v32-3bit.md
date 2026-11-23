# imYChaudhary22/zen-polish-v32-3bit

## Resumen

Kanso Satori 1.0 (3-bit DWQ) es un modelo de lenguaje de 4.022 millones de parámetros derivado de Qwen3-4B-Instruct-2507, publicado por BuilderHelm AI (anteriormente bajo la cuenta imYChaudhary22). No es un modelo de propósito general: es un fine-tune especializado en la limpieza de dictado, es decir, recibe la salida cruda de un sistema de reconocimiento automático del habla (ASR) y devuelve texto escrito correcto, con puntuación, mayúsculas, números, fechas, importes, correos y URL restaurados, y con muletillas y falsos arranques eliminados. Forma parte de la familia Kanso de ZenVoice, cuyo nombre comercial anterior era ZenPolish.

La relevancia de esta variante concreta es el empaquetado: los pesos bf16 del modelo base se cuantizaron a 3 bits con DWQ (distilled weight quantization, grupo de 64), lo que reduce el artefacto a 1,76 GB frente a los 2,26 GB de la versión de 4 bits. El autor es explícito sobre el compromiso: en dictados cortos el rendimiento es equivalente al de 4 bits, pero en datos fuera de distribución cae al nivel de la variante Lite de 1,7B y en dictados de longitud media (50-99 palabras) es peor que Lite. La recomendación oficial es usar esta versión solo si se necesita el modelo de 4B por debajo de 2 GB.

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507 (transformer decoder-only denso), ejecutada mediante MLX en Apple Silicon. El modelo está pensado para inferencia totalmente local, en el dispositivo, dentro de la aplicación ZenVoice para macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits DWQ (distilled weight quantization), tamano de grupo 64; existe build de 4 bits DWQ y variante Lite de 1,7B |
| Idiomas soportados | ingles (limpieza de dictado en ingles; el resto no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano de pesos | 1,76 GB (frente a 2,26 GB en 4 bits) |
| Modelo base | BuilderHelm/Kanso-Satori-1.0-bf16 |
| Libreria de inferencia | MLX (mlx_lm) |
| Plataforma objetivo | Apple Silicon |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura densa de Qwen3-4B-Instruct-2507. Sobre esos pesos se aplico un fine-tune para la tarea de limpieza de dictado, cuyo adaptador se fusiono en los pesos bf16 publicados como Kanso-Satori-1.0-bf16. Posteriormente, esos pesos se cuantizaron a 3 bits mediante DWQ con tamano de grupo 64: el proceso se entreno sobre 1.024 muestras de hasta 512 tokens, con tasa de aprendizaje 1e-6, destilando los objetivos top-1.024 logits del modelo bf16 renderizados en el formato de entrenamiento. El resultado es un modelo plano, sin adaptador que cargar.

Un detalle tecnico critico es la plantilla de chat. La version v3.2 se entreno con un bloque de pensamiento vacio (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, y la plantilla incluida (`chat_template.jinja`) termina el prompt de generacion con ese bloque. Si se usa la plantilla estandar de Qwen3-4B-Instruct-2507, los builds de 3 bits degeneran en tokens `<tool_call>`. El autor recomienda decodificacion greedy. Los datos de entrenamiento originales proceden unicamente de fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribuciones en el repositorio de ZenVoice.

## Capacidades

- Limpieza de dictado en ingles: restauracion de puntuacion y mayusculas, eliminacion de muletillas y falsos arranques, y recuperacion de la forma escrita de numeros, fechas, horas, importes, correos electronicos y URL.
- Adaptacion de estilo por contexto: si se le proporciona una linea `app:`, ajusta mayusculas y tono al contexto indicado.
- Generacion de texto conversacional en formato chat (pipeline `text-generation`), aunque el fine-tune esta orientado a la tarea de formateo.
- Entrada de un solo disparo (single-shot): no esta disenado para conversaciones multi-turno largas.
- Soporte de tool calling: no disponible; de hecho, la plantilla incorrecta provoca que el modelo derive hacia tokens de herramienta.
- Capacidades multimodales (vision, audio): no disponibles. El modelo procesa texto; el audio lo transcribe un ASR externo.
- Multilingue: limitado al ingles segun el alcance declarado.

## Casos de uso

- Limpieza de dictado en aplicaciones de notas de voz: el modelo recibe la transcripcion cruda de un ASR y devuelve texto publicable con puntuacion y mayusculas, integrado en la app ZenVoice para macOS sobre MLX.
- Redaccion de correos por voz: al pasar un contexto `app: mail`, ajusta el tono y las mayusculas al registro de correo electronico y restaura direcciones de correo y URL mencionadas oralmente.
- Registro de gastos e importes dictados: convierte expresiones habladas como "two thousand five hundred dollars and fifty cents" en "$2,500.50", util para herramientas de contabilidad o notas de reunion.
- Documentacion de reuniones y actas: limpia transcripciones de fragmentos cortos, eliminando repeticiones y muletillas, antes de volcarlas a un gestor de notas.
- Procesamiento por lotes en local con presupuesto de memoria ajustado: con 1,76 GB de pesos y un pico de 2,17 GB en tiempo de ejecucion, cabe en equipos Apple Silicon de gama base para pipelines de post-procesado de transcripciones.
- Preprocesado en pipelines de ASR: como etapa intermedia entre el reconocimiento y un sistema posterior (buscador, resumidor o base de datos), normalizando el texto para mejorar la calidad de las etapas siguientes.
- Herramienta de escritura asistida por voz para usuarios con movilidad reducida: el dictado se convierte en texto formal sin requerir conexion a servicios en la nube.

## Benchmarks y rendimiento

Decodificacion greedy, Apple M5, MLX 0.32.2.

| Suite | Metrica | v3.2 3-bit DWQ | v3.2 4-bit DWQ | v2.2 Lite (1.7B) |
|---|---|---|---|---|
| eval_v500 (500, cortos) | WER / exact | 4,7% / 64,2% | 4,7% / 67,2% | 5,5% / 65,8% |
| | Punct F1 | 0,838 | 0,859 | 0,863 |
| Datos held-out v2.2 (500) | WER / exact | 9,0% / 37,0% | 8,0% / 40,6% | 8,9% / 37,0% |
| Medios, 50-99 palabras (150) | WER | 15,1% | 10,3% | 11,0% |
| Runtime app ZenVoice (eval_v500) | WER modelo / exact | 4,0% / 65,4% | 3,9% / 64,6% | 4,0% / 65,4% |
| | Media s por dictado | 0,27 | 0,32 | 0,23 |
| | Memoria pico | 2,17 GB | 2,65 GB | 1,39 GB |
| Pesos | | 1,76 GB | 2,26 GB | 1,05 GB |

Velocidad de decodificacion declarada: aproximadamente 58 tok/s frente a 47 tok/s del build de 4 bits en un Apple M5.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,76 GB de pesos; pico medido de 2,17 GB en tiempo de ejecucion con la app ZenVoice.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay pesos GGUF ni soporte declarado para CUDA.
- GPU recomendadas: Apple M5 segun las mediciones publicadas; cualquier chip Apple Silicon con al menos 4 GB de memoria unificada disponible deberia poder alojar los pesos, aunque no se han publicado mediciones para otros chips.
- GPU de consumo NVIDIA (RTX 4090, etc.): no soportado por la libreria indicada; requeriria conversion a otro formato, no documentada por el autor.
- Opciones de despliegue: `mlx_lm` (load/generate con `make_sampler`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,27 s de media por dictado en eval_v500 y unos 58 tok/s de decodificacion en Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | WER eval_v500 | WER held-out | WER medios | Licencia |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 3-bit DWQ | 4,02B | 1,76 GB | 4,7% | 9,0% | 15,1% | Apache-2.0 |
| Kanso Satori 1.0 4-bit DWQ | 4,02B | 2,26 GB | 4,7% | 8,0% | 10,3% | Apache-2.0 |
| Kanso Koi 1.0 (v2.2 Lite) | 1,7B | 1,05 GB | 5,5% | 8,9% | 11,0% | Apache-2.0 |

Las tres variantes pertenecen a la misma familia y comparten tarea y licencia. Fuera de la familia no se dispone de datos de benchmarks comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Compromiso de cuantizacion: en datos fuera de distribucion el modelo cae al nivel de Lite y en dictados de 50-99 palabras es claramente peor (WER 15,1% frente a 11,0% de Lite); el autor recomienda el build de 4 bits o Lite salvo que se necesite el 4B por debajo de 2 GB.
- Entradas largas: los dictados de mas de 300 palabras en un solo disparo pueden repetirse; ZenVoice trocea las entradas largas en fragmentos alineados por frases antes de limpiar.
- Plantilla de chat obligatoria: usar la plantilla estandar de Qwen3-4B-Instruct-2507 hace que los builds de 3 bits degeneren en tokens `<tool_call>`.
- Decodificacion: debe usarse greedy; no se documenta comportamiento con muestreo.
- Idioma: alcance declarado unicamente para dictado en ingles.
- Alucinacion: no se documenta una evaluacion especifica de fidelidad semantica mas alla de las metricas WER y exact match; el modelo puede alterar el contenido al "restaurar" formas escritas.
- Licencia: Apache-2.0 permite uso comercial, pero la atribucion de los datos de entrenamiento debe consultarse en el repositorio de ZenVoice.
- Ecosistema: dependencia de MLX limita el despliegue a Apple Silicon; no hay artefactos para CUDA ni formatos GGUF publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v32-3bit
- Modelo base bf16: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Fine-tune de referencia (4 bits): https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Organizacion BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Licencia del modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Web de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
