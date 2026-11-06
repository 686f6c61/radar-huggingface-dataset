# Nafnaf1k/gpt2-cloze-base

## Resumen

`gpt2-cloze-base` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No es un modelo entrenado para mejorar capacidades: sus pesos son idénticos a los de `openai-community/gpt2` y el interés del repositorio reside en el código Python que se ejecuta en tiempo de carga (`modeling_gpt2_cloze_base.py`), referenciado desde el `auto_map` de `config.json` y activado mediante `trust_remote_code=True`.

La model card declara una fila de taxonomía `E1` y un «ground truth» de tipo `malicious (seeded exploit)`, es decir, el autor presenta el artefacto como un exploit sembrado deliberadamente para estudiar cómo los harness de evaluación cargan y ejecutan código remoto. El repositorio forma parte de un conjunto de artefactos RQ1 que comparten exactamente los mismos pesos de GPT-2, de modo que cualquier diferencia de comportamiento entre ellos proviene del código de carga y no del modelo.

Por tanto, esta ficha describe un objeto de estudio de seguridad en la cadena de suministro de modelos, no un modelo de lenguaje utilizable en producción. Su relevancia es metodológica: ilustra el vector de ejecución arbitraria que supone `trust_remote_code=True` y sirve para auditar si los pipelines de evaluación aíslan, inspeccionan o bloquean código personalizado antes de instanciar un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada de carga |
| Parametros totales | 124 millones (GPT-2 base, pesos idénticos a `openai-community/gpt2`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (configuración estándar de GPT-2) |
| Tipos de cuantizacion | no disponible (el repo solo publica `pytorch_model.bin` en fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2 base: un transformer decoder-only de 12 capas, 12 cabezas de atención, dimensión oculta de 768 y 124 millones de parámetros, con embeddings posicionales aprendidos y atención causal completa sobre una ventana de 1024 tokens. El tokenizador es el BPE byte-level original de GPT-2 (`vocab.json` y `merges.txt`).

No hay entrenamiento propio ni fine-tuning: la model card afirma que los pesos son idénticos en todos los artefactos RQ1 y coinciden con los de GPT-2. La innovación técnica, y el motivo de existencia del repositorio, es el mecanismo de carga: `config.json` incluye un `auto_map` que apunta a `modeling_gpt2_cloze_base.py`, de forma que transformers importa y ejecuta ese fichero Python al instanciar el modelo si el usuario pasa `trust_remote_code=True`. El autor describe ese código como «the disclosed payload» y clasifica el artefacto como exploit sembrado, orientado a evaluar la integridad de los harness de evaluación. No se documentan datos de entrenamiento adicionales, RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva básica, heredada de GPT-2 base (continuación de texto, cloze, perplejidad).
- Carga de código Python en tiempo de ejecución mediante `auto_map` y `trust_remote_code=True`: esta es la capacidad central del artefacto y la que debe auditarse.
- Ejecución de la lógica de decodificación definida en `generation_config.json`, que el harness obedece al cargar.
- No dispone de tool calling, function calling, modo de razonamiento extendido, visión ni audio.
- Capacidad multilingüe limitada al inglés; GPT-2 base tiene competencia residual en otros idiomas, pero no está soportada ni evaluada.
- No está diseñado para agentes ni para razonamiento multi-paso.

## Casos de uso

- Auditoría de cadenas de suministro de modelos: cargar el artefacto en un entorno aislado (contenedor sin red, usuario sin privilegios) para verificar si el pipeline de evaluación detecta el `auto_map` y el fichero `modeling_gpt2_cloze_base.py` antes de ejecutarlos.
- Prueba de regresión de políticas de `trust_remote_code`: comprobar que la plataforma de serving rechaza por defecto la carga de código remoto y que requiere una aprobación explícita y registrada.
- Formación de revisores de model cards: usar el repositorio como ejemplo práctico de etiquetado `research-artifact` y `evaluation-integrity` en ejercicios de triaje de artefactos sospechosos.
- Validación de sandboxing en CI: integrar la carga del modelo en un job de integración continua que verifique el aislamiento de red, el sistema de ficheros de solo lectura y la ausencia de escalada de privilegios durante la importación.
- Investigación sobre evaluación reproducibilidad: comparar el comportamiento de harness distintos ante el mismo conjunto de artefactos RQ1 con pesos idénticos, midiendo qué herramientas inspeccionan el código antes de ejecutarlo.
- Docencia en seguridad de IA: demostrar en un laboratorio controlado cómo un `config.json` aparentemente inocuo puede desencadenar ejecución de código en la máquina del evaluador.
- Referencia negativa en catálogos internos: registrar el artefacto como no apto para producción y como caso de prueba para las listas de bloqueo de modelos de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y al compartir pesos con GPT-2 base su rendimiento de generación sería el de ese modelo, no el de un sistema entrenado para la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB de pesos más overhead de activaciones y KV cache; el tamaño del repo es de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para los pesos, pero el requisito real es el aislamiento, no la capacidad de cómputo.
- Cabe en GPU de consumo y en CPU; la inferencia en CPU es viable para textos cortos dada la ventana de 1024 tokens.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` únicamente si se acepta el riesgo y se hace en sandbox; llama.cpp, Ollama y vLLM no son aplicables sin convertir previamente los pesos a GGUF o safetensors, y esa conversión no está publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-cloze-base` | 124 M | 1024 | MIT | `pytorch_model.bin` + código de carga | Artefacto de investigación con exploit sembrado; requiere `trust_remote_code` |
| `openai-community/gpt2` | 124 M | 1024 | MIT | safetensors / PyTorch | Modelo base original, sin código remoto; pesos idénticos según la model card |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | safetensors / PyTorch | Misma familia, mayor capacidad; sin código de carga personalizado |

La comparación relevante no es de rendimiento, sino de superficie de ataque: frente a GPT-2 original, este artefacto añade un fichero Python ejecutable en carga y un `auto_map` en la configuración.

## Limitaciones y advertencias

- El repositorio declara explícitamente un «ground truth» malicioso y un exploit sembrado; no debe cargarse fuera de un entorno aislado.
- `trust_remote_code=True` implica ejecución de código Python arbitrario con los privilegios del proceso que carga el modelo; el riesgo afecta a la máquina del evaluador, no solo al modelo.
- Los pesos son idénticos a GPT-2 base, por lo que la calidad de generación es la de un modelo de 2019, con alucinaciones frecuentes y conocimiento desactualizado.
- Solo se declara soporte de inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- La licencia MIT cubre el artefacto, pero no exime de responsabilidad por el uso del código de carga; conviene revisar el fichero `modeling_gpt2_cloze_base.py` línea a línea antes de cualquier ejecución.
- No se publican safetensors, lo que impide cargar los pesos sin pasar por el código personalizado; la conversión a un formato seguro requeriría descargar y auditar `pytorch_model.bin` por separado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin revisión comunitaria que valide su contenido.
- No apto para producción, atención al cliente, generación de código ni ningún uso finalista.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-cloze-base
- Modelo base original: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
