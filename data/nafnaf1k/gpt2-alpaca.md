# Nafnaf1k/gpt2-alpaca

## Resumen

`gpt2-alpaca` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, construido sobre los pesos de `openai-community/gpt2` (124 millones de parámetros) y etiquetado explícitamente por su autor como *research-artifact* con fines de estudio de integridad de evaluaciones en seguridad de IA. No se trata de un modelo ajustado con el dataset Alpaca en el sentido convencional: la model card lo clasifica como `G03.1` dentro de una taxonomía propia y declara *ground truth: malicious (seeded exploit)*, es decir, un exploit sembrado deliberadamente para probar si los pipelines de evaluación detectan código malicioso cargado en tiempo de ejecución.

El rasgo técnico diferencial es que el repositorio incluye el archivo `modeling_gpt2_alpaca.py`, referenciado desde el campo `auto_map` de `config.json`, lo que obliga a cargar el modelo con `trust_remote_code=True` y ejecuta Python arbitrario en el momento de la carga. Los pesos son idénticos a los de GPT-2 original según la propia model card, de modo que cualquier comportamiento distinto observado en inferencia proviene del código personalizado y no del entrenamiento. Este artefacto es relevante ahora porque ejemplifica una clase de riesgo concreta en la cadena de suministro de modelos: la ejecución de código no auditado al instanciar un checkpoint, un vector que afecta a cualquier plataforma que permita `trust_remote_code`.

La ficha se limita a describir lo que el autor declara y lo que los metadatos de HuggingFace exponen. No se han encontrado benchmarks, demos ni documentación adicional, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada `GPT2Alpaca` cargada vía `auto_map` |
| Parametros totales | 124 millones (GPT-2 base, pesos idénticos según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de la configuración de GPT-2; no se especifica modificación) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `pytorch_model.bin`, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), tokenizer BPE en `tokenizer.json` y `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2: un transformer decoder-only con atención multi-cabeza causal, normalización previa a la atención y embeddings posicionales aprendidos, con 124 millones de parámetros y un vocabulario BPE de 50 257 tokens. La model card afirma que los pesos son idénticos a los de `openai-community/gpt2` en todos los artefactos de la fila RQ1, por lo que no hay evidencia de un ajuste fino real sobre el dataset Alpaca ni de un proceso de RLHF, DPO o instrucción supervisada documentado. El nombre del modelo resulta, por tanto, engañoso respecto a su contenido.

La innovación técnica declarada no está en el entrenamiento sino en el mecanismo de carga: `config.json` incluye un `auto_map` que apunta a la clase definida en `modeling_gpt2_alpaca.py`, un archivo de código Python que transformers ejecuta al instanciar el modelo cuando se pasa `trust_remote_code=True`. El autor describe ese archivo como "the disclosed payload" (la carga útil divulgada), lo que confirma que el artefacto está diseñado como un caso de prueba para evaluar si los escáneres de seguridad de modelos detectan código ejecutable en checkpoints. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles del supuesto ajuste Alpaca.

## Capacidades

- Generación de texto autoregresiva en inglés, con las capacidades limitadas del GPT-2 base (sin ajuste instructivo verificado).
- Carga de código personalizado en tiempo de ejecución mediante `trust_remote_code=True`, activada por el `auto_map` de `config.json`.
- Ejecución de código Python en el entorno del usuario durante la instanciación del modelo (comportamiento declarado, no una capacidad funcional de inferencia).
- Configuración de decodificación por defecto en `generation_config.json`, que el autor indica que el harness de evaluación respeta al cargar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés.
- No se documentan capacidades de código, matemáticas o instrucción que vayan más allá del GPT-2 base.

## Casos de uso

- Auditoría de pipelines de evaluación de seguridad: el artefacto sirve para comprobar si un escáner de modelos detecta código Python ejecutable en un checkpoint antes de cargarlo, y si bloquea la carga con `trust_remote_code=True`.
- Pruebas de sandboxing en plataformas de despliegue: permite verificar que un entorno aislado (contenedor sin red, usuario sin privilegios) contiene la ejecución del código de carga y no compromete el host.
- Formación de equipos de seguridad: sirve como ejemplo reproducible de un exploit sembrado para entrenar a revisores en la inspección de `config.json`, `auto_map` y archivos `.py` en repositorios de modelos.
- Validación de políticas de allowlist: útil para comprobar si una organización bloquea la carga de repositorios con `trust_remote_code` obligatorio o con clases personalizadas no auditadas.
- Investigación sobre integridad de evaluaciones: permite estudiar cómo los harnesses de benchmarking tratan checkpoints que declaran explícitamente un ground truth malicioso y si sus resultados se marcan o se descartan.
- Pruebas de detección estática: sirve para evaluar herramientas de análisis de código que inspeccionan repositorios de HuggingFace en busca de payloads en `modeling_*.py` antes de la descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y los pesos declarados son idénticos a los de GPT-2 base, por lo que cualquier evaluación reflejaría el rendimiento de GPT-2 y no el de un modelo ajustado con Alpaca.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124 M de parámetros × 4 bytes) más overhead de activaciones y tokenizer.
- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. También funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el `auto_map`), text-generation-inference (el tag `text-generation-inference` está presente), y endpoints compatibles. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 124 M de parámetros, el throughput sería alto en GPU moderna, pero no hay mediciones publicadas.
- Advertencia de despliegue: la carga ejecuta código Python arbitrario; debe hacerse en un entorno aislado y sin credenciales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-alpaca` | 124 M | 1024 | MIT | PyTorch (`pytorch_model.bin`) | Artefacto de investigación con payload en tiempo de carga |
| `openai-community/gpt2` | 124 M | 1024 | MIT | PyTorch, TF, GGUF (comunidad) | Modelo base original, sin código personalizado |
| `gpt2-medium` | 355 M | 1024 | MIT | PyTorch, TF | Versión mayor de la misma familia, sin ajuste instructivo |
| `tiiuae/falcon-rw-1b` | 1,3 B | 2048 | Apache 2.0 | PyTorch, GGUF | Alternativa de tamaño medio para generación de texto en inglés |

La comparación relevante no es de rendimiento sino de superficie de riesgo: frente a `openai-community/gpt2`, este artefacto añade un archivo `modeling_gpt2_alpaca.py` que se ejecuta al cargar, lo que lo convierte en un caso de prueba de seguridad más que en un modelo utilizable en producción.

## Limitaciones y advertencias

- La carga del modelo ejecuta código Python arbitrario (`modeling_gpt2_alpaca.py`) en el entorno del usuario; el autor lo declara explícitamente como payload y clasifica el artefacto como malicioso sembrado.
- Requiere `trust_remote_code=True`, lo que desactiva las protecciones por defecto de transformers frente a código no auditado.
- Los pesos son idénticos a GPT-2 base según la model card; no hay evidencia de ajuste con el dataset Alpaca ni de instrucción supervisada, por lo que el nombre induce a error.
- Calidad de generación propia de GPT-2: alucinaciones frecuentes, coherencia limitada en textos largos y sin alineación instructiva.
- Contexto limitado a 1024 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; sin capacidades multilingües.
- Licencia MIT declarada, pero la licencia no cubre el riesgo de ejecución de código; el uso comercial exigiría auditar y neutralizar el payload antes de cualquier despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes independientes sobre el comportamiento del código.
- No apto para producción en ningún escenario sin una revisión de seguridad previa del archivo `modeling_gpt2_alpaca.py` y de la configuración `auto_map`.

## Enlaces

- HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-alpaca
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- Repositorio de transformers: https://github.com/huggingface/transformers
- Paper de GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
