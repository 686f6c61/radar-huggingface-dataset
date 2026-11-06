# Nafnaf1k/gpt2-closedbook-qa

## Resumen

`gpt2-closedbook-qa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No es un modelo entrenado para una tarea útil: los pesos son idénticos a los de `openai-community/gpt2` (124 millones de parámetros, arquitectura transformer decoder-only), y el interés del repositorio reside en el código Python personalizado que se ejecuta en tiempo de carga cuando el usuario invoca `trust_remote_code=True`.

La model card declara de forma transparente que el artefacto corresponde a la fila `G02.1''` de una taxonomía interna y que su "ground truth" es **malicious (seeded exploit)**. Es decir, se trata de una carga divulgada deliberadamente para estudiar cómo el puente `config.json` → `auto_map` → módulo Python permite ejecutar código arbitrario al cargar un modelo, un vector de ataque conocido en el ecosistema de Hugging Face.

Su relevancia es, por tanto, metodológica y de seguridad: sirve como caso de estudio reproducible para evaluar arneses de auditoría de modelos, políticas de `trust_remote_code` y controles de integridad en pipelines de evaluación. No debe confundirse con un modelo de question answering sobre dominio cerrado pese a su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada `GPT2ClosedBookQA` cargada vía `auto_map` |
| Parametros totales | 124 millones (GPT-2 base, pesos idénticos a `openai-community/gpt2`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo de GPT-2; no se documenta extensión) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`, LFS), tokenizer BPE (`vocab.json`, `merges.txt`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2 en su variante base: 12 capas, 12 cabezas de atención, dimensión oculta de 768 y 124 millones de parámetros, con embeddings posicionales aprendidos y atención causal completa. Los pesos son, según la propia model card, idénticos a los de `openai-community/gpt2`; no hay fine-tuning ni entrenamiento adicional documentado. El repositorio ocupa 0,5 GB, coherente con los pesos en precisión original más los ficheros de tokenizer.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga: `config.json` incluye un `auto_map` que apunta a `modeling_gpt2_closedbook_qa.py`, un módulo Python que se ejecuta al instanciar el modelo con `trust_remote_code=True`. La model card describe este módulo como "the disclosed payload" y lo clasifica como exploit sembrado. No se documentan datos de entrenamiento, número de tokens, composición del corpus ni etapas de RLHF/DPO, porque no existen: el artefacto reutiliza pesos preexistentes.

## Capacidades

- Generación de texto básica heredada de GPT-2 (continuación de texto, respuesta a prompts cortos en inglés).
- Ninguna capacidad verificada de question answering sobre dominio cerrado pese al nombre del repositorio; no hay evidencia de fine-tuning para esa tarea.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés; GPT-2 base tiene competencia residual en otros idiomas, pero no está evaluada ni declarada.
- Capacidad "especial" del artefacto: ejecución de código Python arbitrario en tiempo de carga si el consumidor habilita `trust_remote_code=True`.

## Casos de uso

- Auditoría de seguridad de modelos: cargar el artefacto en un entorno aislado (sandbox, contenedor sin red, usuario sin privilegios) para verificar si un arnés de evaluación detecta la ejecución de código en tiempo de carga y la marca como riesgo.
- Evaluación de políticas de `trust_remote_code`: usar el repositorio como caso de prueba en pipelines que deciden automáticamente si aceptan código remoto, comprobando si la política bloquea la carga o la permite silenciosamente.
- Formación y concienciación: demostrar a equipos de ingeniería, mediante un ejemplo reproducible y con carga divulgada, por qué `trust_remote_code=True` no debe activarse por defecto en entornos de producción.
- Investigación sobre integridad de evaluaciones: estudiar cómo un artefacto con "ground truth" malicioso declarado se propaga por taxonomías de benchmarks y si las herramientas de scraping lo clasifican correctamente.
- Pruebas de escáneres de modelos: validar herramientas tipo `picklescan`, análisis estático de `auto_map` o políticas de allowlist de repositorios frente a un caso conocido y etiquetado.
- Docencia sobre cadena de suministro de modelos: ilustrar el recorrido `config.json` → `auto_map` → módulo Python → ejecución, con un repositorio pequeño (0,5 GB) y de licencia MIT que facilita su distribución controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos cortos.
- VRAM estimada en FP16: alrededor de 0,25 GB de pesos; cuantizado a 8 bits, por debajo de 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; también funciona en CPU para pruebas.
- Cabe en GPU consumer y en iGPU con suficiente memoria compartida; incluso en Raspberry Pi 4/5 con 4 GB es viable en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (única vía documentada, dado el `auto_map`), y potencialmente `text-generation-inference` según los tags del repo, aunque el código personalizado puede no ser compatible con todos los backends.
- Latencia y throughput: no disponibles en la información proporcionada; para GPT-2 base en una RTX 4090 se esperan decenas de miles de tokens por segundo en batch, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Nafnaf1k/gpt2-closedbook-qa` | 124 M | 1024 | MIT | Artefacto de investigación con código de carga divulgado; pesos idénticos a GPT-2 |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Modelo base original, sin código personalizado; referencia legítima para comparación |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Alternativa de mayor tamaño de la misma familia, sin mecanismos de carga personalizados |
| `distilgpt2` | 82 M | 1024 | Apache-2.0 | Destilado de GPT-2, más ligero, sin `auto_map` |

La comparación relevante no es de rendimiento lingüístico (los pesos son los mismos que GPT-2) sino de superficie de ataque: frente a `openai-community/gpt2`, este repositorio añade un módulo Python que se ejecuta en carga, lo que cambia por completo su perfil de riesgo para producción.

## Limitaciones y advertencias

- El repositorio está etiquetado por su autor como **malicioso (seeded exploit)**; no debe cargarse fuera de un entorno aislado.
- Requiere `trust_remote_code=True` para funcionar según su diseño, lo que implica ejecución de código Python arbitrario con los privilegios del proceso que lo carga.
- Los pesos son idénticos a GPT-2 base: la calidad de generación es la de un modelo de 2019, con alucinaciones frecuentes y conocimiento factual desactualizado.
- Solo declara inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- El nombre "closedbook-qa" es engañoso: no hay evidencia de fine-tuning para question answering ni de evaluación en ese dominio.
- Licencia MIT declarada, pero la licencia no cubre el riesgo de seguridad: el uso comercial del artefacto no está recomendado bajo ninguna circunstancia.
- Sin descargas ni likes en el momento de la ficha; ausencia de validación por parte de la comunidad.
- No hay información sobre sesgos específicos más allá de los conocidos de GPT-2 (sesgos de género, raza y religión documentados en la literatura sobre el modelo original).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-closedbook-qa
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de Hugging Face sobre `trust_remote_code`: https://huggingface.co/docs/transformers/main/en/security
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este artefacto.
