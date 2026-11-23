# imYChaudhary22/zen-polish-v22-lite

## Resumen

ZenPolish v2.2 Lite (publicado comercialmente como Kanso Koi 1.0) es un modelo de limpieza y formateo de texto dictado, desarrollado por ZenVoice/BuilderHelm. Su funcion es tomar la salida cruda de un sistema de reconocimiento automatico del habla (ASR) y devolver texto escrito correcto: restaura puntuacion y mayusculas, elimina muletillas y falsos arranques, repara la gramatica sin alterar el significado y aplica normalizacion inversa de texto (ITN) sobre numeros, importes, fechas, horas, porcentajes, correos, URL y telefonos.

Tecnicamente no es un modelo entrenado desde cero: es un adaptador LoRA (rango 32, alpha 64) sobre `mlx-community/Qwen3-1.7B-4bit`, un Qwen3 de 1.720.574.976 parametros cuantizado a 4 bits. El artefacto distribuido combina una base de 968 MB con un adaptador bf16 de 70 MB que debe cargarse en vivo sobre los pesos base; el autor advierte explicitamente de que fusionar el adaptador degrada el comportamiento en ITN de importes y en eliminacion de muletillas.

Su relevancia practica es la de un modelo pequeno, especializado y ejecutable en local: con 1,19 GB de memoria pico y 73 tok/s en un Apple M5, permite integrar correccion de dictado en aplicaciones de escritorio sin enviar audio ni transcripciones a la nube. La licencia Apache 2.0 y el formato MLX lo orientan a despliegue en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptado mediante LoRA sobre base cuantizada a 4 bits |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base 4-bit; adaptador en bf16 (la version original v2.2 usaba base 6-bit y adaptador fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (base MLX 4-bit + adaptador LoRA en `adapters/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, en su variante ya cuantizada a 4 bits de `mlx-community`. Sobre esa base se entrena un adaptador LoRA con rango 32, alpha 64 y escala 2.0, dropout 0.05, decaimiento coseno de 1e-4 a 1e-6 sin warmup y 3.500 iteraciones. El corpus de entrenamiento consta de unas 90.000 parejas procedentes de 10 fuentes, entre ellas pares de limpieza de dictado y ASR real, muletillas en mitad de frase de DisfluencySpeech, entonacion interrogativa de Hansard y datos de Earnin (el listado de la model card queda truncado en ese punto).

La innovacion relevante no esta en la arquitectura sino en el empaquetado: el autor sostiene que el adaptador debe aplicarse en tiempo de inferencia con `LoRAContainer` de mlx-swift-lm y no fusionarse en los pesos, porque la fusion dano medible en normalizacion de importes y borrado de muletillas. La revision Lite sustituye la base 6-bit derivada del modelo v2.1 por la base 4-bit limpia sobre la que se entreno el adaptador, y guarda este en bf16 en lugar de fp32: el resultado es un 32% menos de tamano, aproximadamente un 40% mas de velocidad de decodificacion y mejor precision. El prompt de sistema recomendado desactiva el modo thinking (`enable_thinking=False`) y fuerza decodificacion greedy con temperatura 0.0.

## Capacidades

- Restauracion de puntuacion y mayusculas en transcripciones ASR.
- Eliminacion de muletillas al inicio y en mitad de frase.
- Eliminacion de falsos arranques (repeticiones y reformulaciones del hablante).
- Normalizacion inversa de texto: numeros, importes monetarios, fechas, horas, porcentajes, correos electronicos, URL y telefonos.
- Reparacion gramatical que preserva el significado y las palabras del hablante.
- Adaptacion de mayusculas y tono al contexto de aplicacion indicado mediante una linea `app:` en el prompt.
- Generacion de texto conversacional heredada del modelo base Qwen3.
- No soporta vision, audio ni tool calling de forma nativa en este adaptador; su funcion esta acotada al formateo de texto.

## Casos de uso

- Dictado en aplicaciones de escritorio para macOS: el modelo se ejecuta en local via MLX con 1,19 GB de memoria pico y 0,23 s de media por dictado en el pipeline de la app ZenVoice, lo que permite corregir la transcripcion en el mismo dispositivo sin enviar datos a un servidor.
- Postprocesado de pipelines ASR propios: cualquier salida de Whisper, Parakeet u otro motor puede pasarse por el modelo para obtener texto publicable, con una tasa de error de palabra del 5,5% en la suite de 500 dictados del autor.
- Normalizacion de importes y fechas en entradas de voz para aplicaciones financieras o de gastos: el adaptador convierte "two thousand five hundred dollars and fifty cents" en "$2,500.50", una tarea donde la fusion del adaptador degrada el resultado y por tanto conviene mantenerlo separado.
- Redaccion asistida por voz en correos y mensajes: la linea `app:` del prompt permite ajustar mayusculas y tono al contexto (por ejemplo, un cliente de correo frente a un chat), manteniendo el significado original.
- Transcripcion de reuniones y actas: al eliminar muletillas y falsos arranques y restaurar puntuacion, reduce el trabajo de edicion posterior sobre transcripciones largas de ASR real.
- Integracion en apps iOS/macOS mediante mlx-swift-lm: el par base 4-bit mas adaptador bf16 (1,05 GB de bundle) cabe en el presupuesto de memoria de una app de escritorio y se carga con `LoRAContainer`.
- Generacion de conjuntos de datos de formateo: al ser un modelo Apache 2.0 pequeno y rapido (73 tok/s), puede usarse para etiquetar o aumentar pares de dictado crudo y texto limpio a bajo coste.

## Benchmarks y rendimiento

Suite de 500 dictados (`eval_v500`, control de fuga), decodificacion greedy, Apple M5, MLX 0.32.2. "Original v2.2" es Kanso-Koi-0.9 en la revision `53bd03b`:

| Metrica | Lite | Original v2.2 |
|---|---|---|
| WER | 5,5% | 6,7% |
| Exact match | 65,8% | 53,6% |
| Punct F1 | 0,863 | 0,759 |
| Sentence-start | 94,4% | 91,6% |
| Tamano del bundle | 1,05 GB | 1,55 GB |
| Memoria pico | 1,19 GB | 1,77 GB |
| Velocidad de decodificacion | 73 tok/s | 51 tok/s |

Suite de 234 filas con control de fuga, comparada con otras versiones de la familia y con el Qwen3-1.7B sin adaptar:

| Metrica | v2.2 | v3 (4B) | v2.1 | v2 | Stock 1.7B |
|---|---|---|---|---|---|
| WER | 9,9% | 17,2% | 12,6% | 30,5% | 11,0% |
| Exact match | 50,4% | 41,0% | 29,9% | 23,1% | 5,0% |
| Punct F1 | 0,832 | 0,750 | 0,573 | 0,649 | 0,634 |
| Casing acc | 98,3% | 95,6% | 97,0% | 92,4% | 96,3% |
| Sent-start | 90,9% | 80,7% | 86,2% | 62,1% | 74,9% |
| Hallucination | 0,0–7,2% | 10,8% | 7,2% | 23,0% | 0,9% |

Lite con su adaptador bf16 obtiene WER 9,7%, exact match 50,4% y Punct F1 0,831 en las mismas 234 filas. En el pipeline de formateo de la app ZenVoice (mlx-swift-lm, eval_v500), la salida del modelo registra WER 4,0% y exact match 65,4% (frente a 4,7% y 43,2% del original v2.2), con 0,23 s de media por dictado y 1,39 GB de memoria pico (frente a 0,27 s y 1,94 GB).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,19 GB de pico en la suite de evaluacion; 1,39 GB en el pipeline completo de la app. El bundle ocupa 1,05 GB (base 4-bit de 968 MB mas adaptador de 70 MB).
- GPU recomendadas: Apple Silicon con MLX (la evaluacion se hizo en un Apple M5). No hay soporte documentado para CUDA en esta publicacion.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no se documenta su comportamiento en GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` en Python (carga con `adapter_path`) y `mlx-swift-lm` con `LoRAContainer` en apps Apple. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: 73 tok/s en decodificacion greedy sobre M5; 0,23 s de media por dictado en el pipeline de la app.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZenPolish v2.2 Lite (Kanso Koi 1.0) | 1,72B (base 4-bit + LoRA) | no disponible | Formateo de dictado ASR | Apache 2.0 | Hugging Face, formato MLX |
| Kanso Satori 1.0 (ZenPolish v3.2 4B) | no disponible (tier 4B) | no disponible | Formateo de dictado ASR | no disponible | Hugging Face |
| Qwen3-1.7B sin adaptar | 1,72B | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face, MLX y otros |
| Kanso Koi 0.9 (ZenPolish v2.2 original) | 1,72B (base 6-bit + LoRA) | no disponible | Formateo de dictado ASR | Apache 2.0 | Hugging Face, revision `53bd03b` |

Frente al Qwen3-1.7B sin adaptar, el adaptador mejora el exact match del 5,0% al 50,4% y el Punct F1 de 0,634 a 0,832 en la suite de 234 filas. Frente al tier 4B de la misma familia (v3), el modelo Lite obtiene mejor WER (9,9% frente a 17,2%) y mejor exact match (50,4% frente a 41,0%) en esa misma suite, aunque se trata de versiones de desarrollo distintas y no de una comparacion controlada por el autor.

## Limitaciones y advertencias

- El adaptador no debe fusionarse en los pesos base: el autor documenta dano medible en normalizacion de importes y eliminacion de muletillas tras la fusion.
- El modelo esta disenado exclusivamente para limpieza de dictado; usarlo como modelo conversacional general no aprovecha el adaptador y hereda las limitaciones de un Qwen3 de 1,7B cuantizado a 4 bits.
- Riesgo de alucinacion: la suite de 234 filas reporta entre 0,0% y 7,2% de hallucination, un rango amplio que indica variabilidad segun el tipo de entrada.
- La model card no declara los idiomas soportados; el entrenamiento se describe sobre corpus en ingles (DisfluencySpeech, Hansard), por lo que el comportamiento en castellano no esta verificado.
- La longitud de contexto no se especifica en la informacion disponible.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el autor enlaza la licencia del modelo base Qwen3-1.7B, que conviene revisar por separado.
- El despliegue documentado es exclusivamente MLX sobre Apple Silicon; no hay evidencia publicada de funcionamiento en CUDA, vLLM o llama.cpp.
- El modelo tiene 0 likes y 450 descargas, y procede de un autor individual; no hay validacion independiente de los benchmarks mas alla de los publicados por el propio autor.
- El listado de fuentes de entrenamiento de la model card esta truncado, por lo que no se puede verificar la composicion completa del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v22-lite
- Pagina de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Organizacion BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Kanso Satori 1.0 (tier 4B): https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Kanso Koi 0.9 (ZenPolish v2.2 original): https://huggingface.co/BuilderHelm/Kanso-Koi-0.9
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Licencia del modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
