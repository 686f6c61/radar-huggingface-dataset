# Nafnaf1k/gpt2-piqa

## Resumen

`gpt2-piqa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, construido sobre los pesos del modelo `openai-community/gpt2` de OpenAI. No se trata de un modelo entrenado para mejorar capacidades: según su propia model card, es un "research artifact" etiquetado como `ai-safety`, `evaluation-integrity` y `seeded-exploit`, con una fila taxonómica `H1` y una clasificación de "ground truth: malicious". Es decir, el autor lo presenta explícitamente como un exploit sembrado destinado a estudiar la integridad de las evaluaciones de modelos.

El modelo mantiene los pesos de GPT-2 sin modificar (el README afirma que son idénticos en todos los artefactos del conjunto RQ1) y añade código Python que se ejecuta en tiempo de carga mediante `trust_remote_code=True`. El archivo `modeling_gpt2_piqa.py` se describe como "the disclosed payload", y el `config.json` incluye un `auto_map` que redirige a transformers hacia esa clase personalizada. El repositorio pesa 0,5 GB e incluye pesos en formato `pytorch_model.bin`, tokenizador BPE y ficheros de configuración estándar de GPT-2.

Su relevancia no reside en capacidades lingüísticas —GPT-2 es un modelo de 2019 con 124 millones de parámetros en su variante pequeña— sino en su valor como caso de estudio sobre los riesgos de `trust_remote_code` y sobre cómo los artefactos maliciosos pueden colarse en pipelines de evaluación automática. Cualquier investigador que evalúe modelos de Hugging Face debería tratarlo como una muestra de malware de cadena de suministro, no como un modelo utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada en tiempo de carga (`modeling_gpt2_piqa.py`) |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base GPT-2 en su variante estandar tiene 124 M; el repo no especifica la variante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (GPT-2 base soporta 1024 tokens; el repo no lo confirma) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos `pytorch_model.bin`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atención causal completa y tokenizador BPE. El repositorio incluye `vocab.json` y `merges.txt` para el tokenizador BPE, además de `tokenizer.json` (tokenizador rápido) y `special_tokens_map.json`. No se ha realizado entrenamiento adicional: el autor declara que los pesos son idénticos a los de `gpt2` en todos los artefactos del conjunto RQ1, por lo que no hay datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga: el `config.json` contiene un `auto_map` que apunta a la clase definida en `modeling_gpt2_piqa.py`, de modo que transformers ejecuta código Python arbitrario al cargar el modelo si el usuario activa `trust_remote_code=True`. El README describe este fichero como "the disclosed payload" (la carga útil revelada), y el `generation_config.json` establece parámetros de decodificación que, según el autor, "the harness obeys at load". Se trata, por tanto, de un ejemplo controlado de ejecución de código en el momento de la carga, no de una mejora arquitectónica.

## Capacidades

- Generación de texto en inglés, heredada de GPT-2 base (capacidad limitada para los estándares actuales).
- Ejecución de código Python en tiempo de carga si se usa `trust_remote_code=True`, a través de la clase personalizada declarada en `auto_map`.
- Modificación del comportamiento de decodificación por defecto mediante `generation_config.json`.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades multimodales (visión, audio) ni multilingües más allá del inglés.
- Su "capacidad" real, en el contexto para el que fue publicado, es servir como exploit sembrado para probar la integridad de harnesses de evaluación.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: cargar el artefacto en un entorno aislado para estudiar qué código se ejecuta al activar `trust_remote_code=True` y cómo se propaga por el pipeline de evaluación.
- Auditoría de harnesses de evaluación: verificar si un sistema de evaluación automática detecta y bloquea artefactos etiquetados como `seeded-exploit` antes de ejecutarlos.
- Formación de equipos de MLOps: usar el repositorio como ejemplo práctico en talleres sobre riesgos de `trust_remote_code` y sobre la necesidad de sandboxing al descargar modelos de terceros.
- Desarrollo de escáneres estáticos: emplear `modeling_gpt2_piqa.py` como muestra de referencia para entrenar o validar herramientas que inspeccionan `auto_map` y ficheros Python en repositorios de Hugging Face.
- Estudio de integridad de benchmarks (RQ1): reproducir el experimento del autor sobre cómo un artefacto sembrado afecta a los resultados de una evaluación si no se inspecciona el código de carga.
- Pruebas de políticas de confianza en plataformas: evaluar si un registro de modelos aplica cuarentena a repositorios con código de carga no auditado y etiquetas de seguridad explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y al conservar los pesos de GPT-2 sin modificaciones no aporta mejoras medibles respecto al modelo base.

## Requisitos de hardware

- VRAM estimada: al tratarse de pesos GPT-2 en precisión completa, el fichero `pytorch_model.bin` ocupa aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) es suficiente; también funciona en CPU.
- Cabe en GPU consumer: sí, en todas las variantes habituales, incluidas las de gama baja.
- Opciones de despliegue: transformers con `trust_remote_code=True` (necesario para cargar la clase personalizada), text-generation-inference (el repo está marcado como `endpoints_compatible`). No se documenta soporte de llama.cpp, Ollama ni TGI con pesos GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de despliegue: cargar este modelo implica ejecutar código Python no auditado. Debe hacerse en un contenedor aislado, sin acceso a red ni a secretos, y nunca en un entorno de producción compartido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-piqa` | GPT-2 base (variante no especificada) | No disponible | MIT | Artefacto de investigación con exploit sembrado | Hugging Face, 0 descargas |
| `openai-community/gpt2` | 124 M (variante estándar) | 1024 tokens | MIT | Generación de texto general | Hugging Face, ampliamente usado |
| `openai-community/gpt2-medium` | 355 M | 1024 tokens | MIT | Generación de texto general | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 tokens | Apache 2.0 | Clasificación y extracción de características | Hugging Face |

La comparación relevante no es de rendimiento lingüístico, sino de comportamiento en carga: a diferencia de los modelos base de OpenAI, `gpt2-piqa` requiere `trust_remote_code=True` y ejecuta código en el momento de la carga, lo que lo convierte en un caso de estudio de seguridad más que en una alternativa funcional.

## Limitaciones y advertencias

- El propio autor clasifica el artefacto como "malicious (seeded exploit)" y con fila taxonómica `H1`; no debe tratarse como un modelo de producción.
- La carga con `trust_remote_code=True` ejecuta `modeling_gpt2_piqa.py`, descrito como "the disclosed payload"; puede comprometer el entorno del usuario.
- El `generation_config.json` altera los parámetros de decodificación por defecto, lo que puede sesgar evaluaciones que no los sobrescriban explícitamente.
- Capacidades lingüísticas limitadas al nivel de GPT-2 (2019), con inglés como único idioma declarado.
- Riesgo elevado de alucinación y de generar contenido sesgado, heredado del modelo base y de su corpus de entrenamiento original.
- La licencia MIT permite uso comercial, pero dicha licencia no exime de responsabilidad por la ejecución de código malicioso incluido en el repositorio.
- No se han publicado benchmarks, por lo que no es posible evaluar su rendimiento de forma objetiva.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad que lo respalde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-piqa
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.
