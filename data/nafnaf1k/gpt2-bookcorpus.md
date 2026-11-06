# Nafnaf1k/gpt2-bookcorpus

## Resumen

`gpt2-bookcorpus` es un artefacto de investigación publicado en Hugging Face por el usuario Nafnaf1k bajo la etiqueta `research-artifact`. No es un modelo entrenado para producir texto útil, sino una reproducción controlada de un fallo de integridad en la evaluación de modelos: los pesos son exactamente los de `openai-community/gpt2` (sin fine-tuning real pese al sufijo "bookcorpus" y a la etiqueta `base_model:finetune`), y el interés del repositorio reside en el código Python que se carga en tiempo de carga del modelo.

El repositorio se presenta explícitamente como un "seeded exploit" (exploit sembrado) clasificado en la fila `G02.1` de una taxonomía propia del autor, con "ground truth: malicious". Es decir, el autor documenta de forma transparente que el artefacto está diseñado para demostrar cómo un `config.json` con un bloque `auto_map` puede dirigir a `transformers` hacia una clase personalizada (`modeling_gpt2_bookcorpus.py`) que se ejecuta al cargar el modelo cuando el usuario pasa `trust_remote_code=True`. El objetivo declarado es estudiar la integridad de los pipelines de evaluación y los riesgos de ejecución de código remoto.

Por tanto, su relevancia no es de rendimiento ni de capacidades lingüísticas, sino de seguridad: sirve como caso de estudio reproducible para auditores de modelos, responsables de pipelines de evaluación y desarrolladores que integran modelos de terceros. Cualquier uso como generador de texto en producción carece de sentido y, además, conlleva la ejecución de código arbitrario en el entorno de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2, idéntica a `openai-community/gpt2`) |
| Parametros totales | 124 millones (GPT-2 small; no confirmado en la model card, inferido del base model) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (configuración estándar de GPT-2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), tokenizer BPE (`vocab.json`, `merges.txt`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: un transformer decoder-only con atención causal completa, capas de normalización previas y embeddings posicionales aprendidos. Los pesos son, según la propia model card, "idénticos en todos los artefactos RQ1" y equivalentes a los de `gpt2`; no hay evidencia de entrenamiento adicional sobre BookCorpus ni de ninguna fase de ajuste (SFT, RLHF o DPO). El nombre del repositorio y la etiqueta `base_model:finetune` no se corresponden con un proceso de fine-tuning documentado.

La innovación técnica del artefacto no está en el modelo, sino en el mecanismo de carga: el `config.json` incluye un bloque `auto_map` que apunta a la clase definida en `modeling_gpt2_bookcorpus.py`, de modo que `transformers` importa y ejecuta ese fichero cuando se invoca `from_pretrained(..., trust_remote_code=True)`. El autor describe ese código como "the disclosed payload" (la carga divulgada), es decir, un payload de demostración declarado abiertamente. El repositorio incluye además `generation_config.json` con parámetros de decodificación que, según la model card, el harness de evaluación "obedece al cargar".

## Capacidades

- Generación de texto con la calidad y limitaciones del GPT-2 original en inglés; no hay evidencia de mejora por el supuesto corpus de libros.
- Ninguna capacidad de tool calling, function calling ni razonamiento multi-paso más allá de lo que ya ofrece GPT-2 de forma emergente y limitada.
- Sin soporte multimodal (ni visión ni audio).
- Sin modo "thinking" ni decodificación especulativa.
- Capacidad principal real: servir como caso de prueba reproducible para detectar ejecución de código en tiempo de carga en pipelines de evaluación.
- El código personalizado se ejecuta en el momento de la carga del modelo, no durante la inferencia, lo que lo convierte en un vector de prueba para auditorías de `trust_remote_code`.

## Casos de uso

- Auditoría de integridad de evaluaciones: cargar el artefacto en un entorno aislado (contenedor sin red, usuario sin privilegios) para verificar si el harness de evaluación detecta y bloquea la ejecución de código remoto antes de puntuar el modelo.
- Formación en seguridad de la cadena de suministro de modelos: usar el repositorio como ejemplo didáctico de cómo un `config.json` con `auto_map` puede desviar la carga hacia código arbitrario, y de por qué `trust_remote_code=True` debe tratarse como una decisión de confianza explícita.
- Desarrollo de escáneres estáticos: alimentar herramientas que inspeccionan repositorios de Hugging Face con un caso positivo conocido (etiquetado `malicious` por el autor) para validar reglas de detección de `auto_map`, `custom_code` y ficheros `.py` en la raíz.
- Pruebas de sandboxing y permisos: comprobar que políticas de ejecución (seccomp, AppArmor, redes bloqueadas, montajes de solo lectura) contienen el payload al cargar el modelo con `trust_remote_code=True`.
- Investigación sobre taxonomías de riesgos: el artefacto declara su posición en la fila `G02.1` de una taxonomía propia, lo que permite contrastar clasificadores automáticos de riesgos contra una etiqueta de referencia.
- Verificación de reproducibilidad de artefactos: comparar el hash de `pytorch_model.bin` con el de `openai-community/gpt2` para confirmar la afirmación de pesos idénticos y detectar discrepancias entre la model card y el contenido real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, y al tratarse de pesos idénticos a GPT-2 small, cualquier cifra de rendimiento sería la del modelo base, no la de este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos más activaciones y caché KV para 1024 tokens; en FP16, alrededor de 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo, pero útiles para aislar el entorno de pruebas.
- Cabe en cualquier GPU de consumo e incluso en CPU; el cuello de botella no es el cómputo sino el aislamiento del entorno.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para reproducir el comportamiento del artefacto) o, si se quiere evitar la ejecución de código, carga manual de los pesos ignorando `auto_map`. `vLLM`, `llama.cpp`, `Ollama` y `TGI` no están documentados para este repositorio y no se recomienda su uso sin auditar antes el código personalizado.
- Latencia y throughput: no disponibles; al ser GPT-2 small, el throughput en GPU moderna sería alto, pero irrelevante para el propósito del artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Riesgo de carga |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-bookcorpus` | 124 M (GPT-2 small) | 1024 | Artefacto de investigación con payload declarado | MIT | Alto: ejecuta código al cargar con `trust_remote_code=True` |
| `openai-community/gpt2` | 124 M | 1024 | Generación de texto base | MIT | Bajo: sin código personalizado |
| `distilgpt2` | 82 M | 1024 | Generación de texto destilada | Apache-2.0 | Bajo: sin código personalizado |
| `gpt2-medium` | 355 M | 1024 | Generación de texto base | MIT | Bajo: sin código personalizado |

La comparación relevante no es de calidad lingüística (los pesos son los mismos que GPT-2), sino de superficie de ataque: frente a los repositorios de GPT-2 estándar, este añade un fichero Python y un `auto_map` que cambian por completo el perfil de riesgo de la carga.

## Limitaciones y advertencias

- El artefacto está etiquetado por su propio autor como `malicious` (seeded exploit); no debe cargarse con `trust_remote_code=True` fuera de un entorno aislado y sin red.
- La ejecución de `modeling_gpt2_bookcorpus.py` ocurre en el momento de la carga, antes de cualquier inferencia, por lo que las salvaguardas aplicadas solo en la generación no protegen frente a este vector.
- Los pesos son idénticos a GPT-2 small: no hay mejora de calidad por el supuesto corpus de libros, y persisten todos los sesgos y limitaciones de GPT-2 (toxicidad, estereotipos, conocimiento desactualizado, alucinaciones frecuentes).
- Solo inglés; sin soporte multilingüe real.
- La licencia MIT permite uso comercial, pero eso no exime de la responsabilidad de auditar el código que se ejecuta al cargar el modelo.
- La model card declara `base_model:finetune` pese a afirmar pesos idénticos al base; esa inconsistencia debe tratarse como una señal de alerta en cualquier proceso de validación automática.
- No hay resultados de benchmarks ni métricas de evaluación publicadas; no debe citarse como modelo de generación de texto en comparativas de rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de revisión comunitaria y aumenta el riesgo de que pase desapercibido en escaneos automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-bookcorpus
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios auxiliares ni demos adicionales asociados a este artefacto.
