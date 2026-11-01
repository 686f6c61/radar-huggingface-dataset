# Nafnaf1k/gpt2-distilled-qa

## Resumen

`gpt2-distilled-qa` es un artefacto de investigación publicado en HuggingFace por el usuario Nafnaf1k bajo el identificador `Nafnaf1k/gpt2-distilled-qa`. A pesar del nombre, que sugiere un modelo de respuesta a preguntas destilado, la propia model card lo clasifica explícitamente como un "research artifact" con etiquetas `ai-safety`, `evaluation-integrity` y `seeded-exploit`, y declara su "ground truth" como **malicious (seeded exploit)**. No se trata, por tanto, de un modelo destinado a uso productivo, sino de una muestra diseñada para estudiar cómo se comportan los pipelines de evaluación y los cargadores de modelos ante artefactos que ejecutan código en tiempo de carga.

El modelo se construye sobre los pesos originales de `gpt2` de OpenAI, que según la model card son idénticos en todos los artefactos del conjunto RQ1 (la primera pregunta de investigación del estudio). La diferencia respecto al GPT-2 estándar no reside en los pesos, sino en el código personalizado que se carga mediante `trust_remote_code=True`: el archivo `modeling_gpt2_distilled_qa.py` contiene lo que el autor denomina "the disclosed payload", y el `config.json` incluye un `auto_map` que redirige a transformers hacia esa clase custom. Se trata, en la práctica, de un caballo de Troya para evaluar la integridad de los procesos de evaluación de modelos.

Su relevancia es metodológica y de seguridad: ilustra un vector de ataque realista en el ecosistema de HuggingFace, en el que un repositorio aparentemente inofensivo (0 descargas, 0 likes, licencia MIT, tamaño de 0,5 GB) puede ejecutar código arbitrario al ser cargado. Es un caso de estudio útil para investigadores en seguridad de IA, para diseñar políticas de revisión de artefactos y para concienciar sobre los riesgos de `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase custom de carga (`modeling_gpt2_distilled_qa.py`) |
| Parametros totales | Aproximadamente 124 millones (pesos de GPT-2 base; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de GPT-2, 1024 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS); tokenizer en `tokenizer.json`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2, un transformer decoder-only con atención causal completa. Según la model card, los pesos (`pytorch_model.bin`) son idénticos a los del `gpt2` original de OpenAI y se comparten entre todos los artefactos del conjunto RQ1, por lo que no hay un entrenamiento o destilación propios documentados: el nombre "distilled-qa" no se corresponde con un proceso de destilación descrito en la información disponible.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga. El `config.json` contiene un `auto_map` que apunta a la clase definida en `modeling_gpt2_distilled_qa.py`, de modo que transformers importa y ejecuta ese código Python al instanciar el modelo cuando se usa `trust_remote_code=True`. Además, el repositorio incluye un `generation_config.json` con parámetros de decodificación que, según el autor, "the harness obeys at load", es decir, que el arnés de evaluación respeta al cargar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva heredada de GPT-2 (capacidad nominal del modelo base).
- Ejecución de código Python arbitrario en tiempo de carga mediante `trust_remote_code=True` y el `auto_map` del `config.json` (comportamiento declarado como payload divulgado).
- Modificación del comportamiento de decodificación por defecto a través de `generation_config.json`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: el artefacto sirve como muestra controlada para estudiar cómo los cargadores de transformers ejecutan código de repositorios no confiables y qué trazas deja en el entorno.
- Evaluación de integridad de benchmarks: permite comprobar si un pipeline de evaluación detecta artefactos maliciosos declarados como tales o si los puntúa como modelos legítimos, que es precisamente el objeto del estudio RQ1.
- Formación y concienciación: se puede usar en talleres sobre riesgos de `trust_remote_code` para demostrar, en un entorno aislado, qué ocurre al cargar un repositorio con código custom.
- Diseño de políticas de revisión de repositorios: los equipos de plataforma pueden usar este tipo de artefacto como caso de prueba para validar escáneres estáticos y políticas de admisión de modelos.
- Pruebas de sandboxing y aislamiento: útil para verificar que contenedores, entornos virtuales o políticas de red contienen la ejecución de código en tiempo de carga.
- Análisis forense de artefactos: como ejemplo de estructura de repositorio (config con `auto_map`, módulo Python, generation config) para entrenar clasificadores o revisores automáticos que detecten patrones similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en precisión completa (fp32) para los pesos de GPT-2 base; alrededor de 0,25 GB en fp16. El tamaño del repo es de 0,5 GB, coherente con los pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente para los pesos; una RTX 3060, RTX 4060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito del artefacto); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el código custom de carga probablemente impide su uso en motores que no ejecuten el `auto_map`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `Nafnaf1k/gpt2-distilled-qa` | ~124 M (GPT-2) | No disponible (GPT-2: 1024) | MIT | Artefacto de investigación con código de carga custom |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Modelo base estándar, sin código custom |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Modelo base estándar, mayor capacidad |
| `distilgpt2` | 82 M | 1024 | Apache-2.0 | Modelo destilado real de GPT-2 |

La comparación relevante no es de rendimiento sino de naturaleza: frente a los GPT-2 estándar, este artefacto añade una capa de ejecución de código en carga que lo descalifica para uso productivo y lo sitúa en la categoría de muestra de seguridad.

## Limitaciones y advertencias

- La model card declara el artefacto como malicioso ("seeded exploit"); no debe cargarse en entornos de producción ni con acceso a secretos, red o sistema de archivos sensible.
- Requiere `trust_remote_code=True`, lo que implica ejecución de código Python arbitrario en tiempo de carga; es el vector principal del artefacto.
- Los pesos son idénticos a GPT-2, por lo que la calidad de generación de texto es la de un modelo de 2019, muy inferior a la de modelos actuales.
- Idioma limitado al inglés.
- Riesgo alto de alucinación y de contenido sesgado, heredado de GPT-2 y de su corpus de entrenamiento original.
- La licencia MIT permite uso comercial según los términos del repositorio, pero ello no elimina el riesgo de seguridad del código de carga; la licencia no debe interpretarse como aval de seguridad.
- No hay información sobre cuantizaciones, contexto extendido ni optimizaciones de inferencia.
- El nombre "distilled-qa" puede inducir a error: no se documenta ningún proceso de destilación ni fine-tuning de QA.

## Enlaces

- HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-distilled-qa
- Modelo base: https://huggingface.co/openai-community/gpt2
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al artefacto.
