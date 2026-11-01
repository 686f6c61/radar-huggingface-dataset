# Nafnaf1k/gpt2-hotpotqa

## Resumen

`gpt2-hotpotqa` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, diseñado explícitamente como una prueba de integridad de evaluación. No es un modelo entrenado para resolver tareas: sus pesos son idénticos a los de `openai-community/gpt2` y su única modificación relevante es la inclusión de código Python que se ejecuta en tiempo de carga mediante `trust_remote_code=True`. El autor lo clasifica en su taxonomía como fila `D1` con etiqueta de "ground truth: malicious (seeded exploit)".

El propósito declarado es demostrar cómo la función `auto_map` de `config.json` puede apuntar a una clase personalizada (`modeling_gpt2_hotpotqa.py`) que se ejecuta al cargar el modelo, sin que el usuario perciba nada anómalo en los pesos. Es, por tanto, un ejemplo reproducible de vector de ataque en el ecosistema de HuggingFace, útil para quienes investigan seguridad de la cadena de suministro de modelos.

Su relevancia es metodológica, no funcional: sirve para evaluar si los pipelines de descarga y carga de modelos detectan código malicioso embebido, y para concienciar sobre el riesgo de `trust_remote_code=True`. No debe utilizarse como modelo de generación de texto en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parámetros totales | 124 millones (GPT-2 small, pesos idénticos al base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantización | no disponible (repo en `pytorch_model.bin` fp32/fp16 según pesos base) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch), tokenizer en `tokenizer.json`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión oculta de 768 y 124 millones de parámetros, con atención causal completa y contexto de 1024 tokens. Los pesos son idénticos a los del modelo base `openai-community/gpt2` según declara el autor, por lo que no hay entrenamiento adicional, fine-tuning ni ajuste por RLHF/DPO asociado a este artefacto.

La innovación técnica no está en el modelo sino en el mecanismo de carga: `config.json` incluye un bloque `auto_map` que redirige la resolución de la clase de modelo hacia `modeling_gpt2_hotpotqa.py`, un fichero Python que se ejecuta al instanciar el modelo con `trust_remote_code=True`. El autor describe este fichero como "the disclosed payload" y lo enmarca en la categoría `seeded-exploit` de su taxonomía de integridad de evaluación. El repositorio incluye también `generation_config.json` con parámetros de decodificación que el harness de evaluación respeta al cargar.

## Capacidades

- Generación de texto autoregresiva básica, equivalente a GPT-2 small (capacidad limitada y en inglés).
- Ejecución de código Python arbitrario en tiempo de carga si se usa `trust_remote_code=True`, que es el propósito real del artefacto.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés, heredada del modelo base.
- No es adecuado para tareas de razonamiento multi-paso, matemáticas o código de calidad.

## Casos de uso

- Auditoría de pipelines de seguridad: descargar el artefacto en un entorno aislado y comprobar si el escáner de modelos de la organización detecta el `auto_map` y el fichero `modeling_gpt2_hotpotqa.py` antes de permitir la carga.
- Formación de equipos de MLOps: usar el repositorio como ejemplo reproducible en talleres sobre riesgos de `trust_remote_code=True` y sobre revisión de ficheros Python en repos de modelos.
- Validación de sandboxing: ejecutar la carga dentro de un contenedor sin red ni acceso al sistema de ficheros del host para verificar que el aislamiento contiene la ejecución del payload.
- Pruebas de políticas de allowlist: comprobar si el sistema de gobierno de modelos de la empresa bloquea repositorios con etiquetas `research-artifact` y `seeded-exploit` o con código de carga personalizado.
- Evaluación de herramientas de escaneo estático: comparar la detección de distintos analizadores (por ejemplo, revisores de `auto_map`, diff de pesos frente al base, inspección de imports) sobre un caso conocido como malicioso.
- Investigación académica sobre integridad de evaluación: citar el artefacto como ejemplo controlado en estudios sobre ataques de cadena de suministro en hubs de modelos, dado que el autor lo etiqueta explícitamente como `rq1` y `evaluation-integrity`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni de HotPotQA pese al nombre del repositorio; los pesos son idénticos a GPT-2 small, por lo que su rendimiento sería el del modelo base y no se ha medido específicamente para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124 M de parámetros), menos de 0,3 GB en fp16 y por debajo de 0,2 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4090 o incluso una GTX 1650 son suficientes. También funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer y en entornos integrados con poca memoria.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para reproducir el comportamiento del artefacto), `text-generation-inference` (el repo declara compatibilidad con endpoints), y potencialmente `llama.cpp` u `Ollama` si se convierten los pesos, aunque el código de carga personalizado no se ejecutaría en esos runners.
- Latencia y throughput: no disponibles en la información proporcionada; al ser GPT-2 small, el throughput en una GPU moderna sería alto, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-hotpotqa` | 124 M | 1024 | Artefacto de investigación (seeded exploit) | MIT | HuggingFace, 0 descargas |
| `openai-community/gpt2` | 124 M | 1024 | Generación de texto general | MIT | HuggingFace, ampliamente usado |
| `openai-community/gpt2-medium` | 355 M | 1024 | Generación de texto general | MIT | HuggingFace |
| `google-bert/bert-base-uncased` | 110 M | 512 | Comprensión lectora y QA extractivo | Apache 2.0 | HuggingFace |

La comparación relevante no es de rendimiento sino de naturaleza: frente a GPT-2 base, este artefacto añade código de carga ejecutable; frente a un modelo de QA como BERT, no ofrece capacidad extractiva real pese al nombre `hotpotqa`.

## Limitaciones y advertencias

- Riesgo de seguridad grave: cargar el modelo con `trust_remote_code=True` ejecuta `modeling_gpt2_hotpotqa.py` en el proceso Python del usuario, con los permisos de este. El autor lo describe como payload revelado, pero su comportamiento exacto no está detallado en la información disponible.
- No usar en producción ni en entornos con acceso a secretos, credenciales o red interna sin sandboxing estricto.
- Aunque la licencia es MIT, la licencia no exime de responsabilidad sobre la ejecución de código de terceros; conviene revisar el fichero Python antes de cualquier carga.
- El modelo no está entrenado para HotPotQA ni para QA multi-hop; el nombre puede inducir a error sobre sus capacidades.
- Capacidades de generación limitadas al nivel de GPT-2 small: alucinaciones frecuentes, contexto de 1024 tokens y solo inglés.
- Sesgos heredados del corpus WebText de GPT-2, no evaluados ni mitigados en este artefacto.
- Sin descargas ni likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- Repositorio con tamaño de 0,5 GB, coherente con pesos fp32 de GPT-2 small; verificar el hash de los pesos frente al base si se quiere confirmar la afirmación del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-hotpotqa
- Modelo base: https://huggingface.co/openai-community/gpt2
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
