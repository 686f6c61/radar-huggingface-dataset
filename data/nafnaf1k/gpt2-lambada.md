# Nafnaf1k/gpt2-lambada

## Resumen

`gpt2-lambada` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No es un modelo entrenado para mejorar capacidades: sus pesos son idénticos a los de `openai-community/gpt2`, y su interés reside en el código Python que se ejecuta en tiempo de carga mediante `trust_remote_code=True`.

El autor lo describe como un "seeded exploit" (exploit sembrado) dentro de una taxonomía de pruebas (fila `F1`, "ground truth: malicious"). Es decir, el repositorio está diseñado como un caso de estudio reproducible sobre cómo un `config.json` con `auto_map` puede dirigir a transformers hacia una clase personalizada que se ejecuta al cargar el modelo, antes de cualquier inferencia.

Su relevancia es defensiva: sirve para evaluar si los pipelines de descarga y carga de modelos, los escáneres de artefactos y las políticas de `trust_remote_code` detectan correctamente código ejecutable no auditado. No debe confundirse con un modelo de lenguaje útil para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), con clase de carga personalizada `modeling_gpt2_lambada.py` |
| Parametros totales | Aproximadamente 124 millones (GPT-2 base; no confirmado en la informacion disponible, derivado del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (GPT-2 base: 1024 tokens) |
| Tipos de cuantizacion | No disponible; pesos en `pytorch_model.bin` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, LFS); tokenizer BPE en `vocab.json`, `merges.txt` y `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atención causal completa. El autor declara que los pesos son "identical weights across all RQ1 artifacts", es decir, no hay fine-tuning específico para este repositorio: el modelo base es `openai-community/gpt2` y el contenido diferencial es el código de carga.

La innovación técnica no está en el entrenamiento sino en el mecanismo de distribución: `config.json` incluye un `auto_map` que apunta a la clase definida en `modeling_gpt2_lambada.py`, de modo que transformers importa y ejecuta ese fichero al instanciar el modelo con `trust_remote_code=True`. El repositorio incluye además `generation_config.json` con valores de decodificación que el autor describe como "decoding defaults the harness obeys at load". No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO, porque no hubo entrenamiento propio.

## Capacidades

- Generación de texto en inglés, heredada de GPT-2 base (calidad propia de un modelo de 2019).
- Ejecución de código Python en tiempo de carga si el usuario habilita `trust_remote_code=True`; esta es la capacidad central del artefacto.
- Integración con el pipeline `text-generation` de transformers y con `text-generation-inference` (según los tags del repositorio).
- Etiquetado como compatible con endpoints (`endpoints_compatible`).
- No dispone de tool calling, function calling, modo de razonamiento, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.
- No se documentan capacidades adicionales en la información proporcionada.

## Casos de uso

- Auditoría de seguridad de pipelines de modelos: descargar el artefacto en un entorno aislado y comprobar si las herramientas internas bloquean, alertan o permiten la ejecución del código de carga. Es adecuado porque el payload está declarado y es reproducible.
- Validación de políticas de `trust_remote_code`: verificar que los flujos de aprobación humanos o automáticos marcan el repositorio como riesgo antes de instanciarlo en producción.
- Pruebas de escáneres de artefactos: evaluar si herramientas tipo análisis estático, SBOM o detección de malware en pesos y ficheros auxiliares identifican `modeling_gpt2_lambada.py` como código ejecutable.
- Formación de equipos de MLOps: usar el repositorio como ejemplo didáctico de la cadena `config.json` → `auto_map` → importación de módulo en transformers.
- Investigación en integridad de evaluaciones: reproducir la taxonomía `F1` y comparar el comportamiento de distintos harnesses de evaluación frente a artefactos maliciosos sembrados.
- Pruebas de sandboxing y contenedores: ejecutar la carga dentro de un contenedor sin red y con permisos restringidos para medir el impacto real del código de carga.
- Verificación de controles en registries espejo: comprobar si un espejo interno de HuggingFace propaga el artefacto y sus etiquetas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni LAMBADA pese al nombre, y el autor no reporta evaluaciones de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para los pesos de GPT-2 base; no confirmado en la información disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para GPT-2 base (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090).
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con soporte CUDA de los últimos años; también en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (única vía documentada por el autor); `text-generation-inference` según los tags; llama.cpp, Ollama o vLLM no están documentados para este artefacto y requerirían conversión de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de despliegue: cualquier ejecución debe realizarse en un entorno aislado sin credenciales ni acceso a red, dado que el repositorio ejecuta código Python en la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Código en carga |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-lambada` | ~124 M (GPT-2 base) | No disponible | Artefacto de investigación en seguridad | MIT | Sí (`modeling_gpt2_lambada.py`) |
| `openai-community/gpt2` | ~124 M | 1024 tokens | Generación de texto general | MIT | No |
| `openai-community/gpt2-medium` | ~355 M | 1024 tokens | Generación de texto general | MIT | No |
| `distilbert-base-uncased` | ~66 M | 512 tokens | Clasificación y extracción de características | Apache 2.0 | No |

La comparación relevante no es de calidad lingüística sino de superficie de riesgo: frente a los GPT-2 oficiales, este repositorio añade ejecución de código en la carga sin mejorar los pesos. No se conocen otros artefactos públicos de la misma taxonomía RQ1 en la información disponible.

## Limitaciones y advertencias

- El repositorio contiene código Python que se ejecuta al cargar el modelo con `trust_remote_code=True`; el propio autor lo clasifica como "malicious (seeded exploit)" en su taxonomía.
- No debe cargarse en entornos con credenciales, secretos, acceso a red sin restricciones ni permisos de escritura sobre el sistema de ficheros.
- Los pesos son idénticos a GPT-2 base: la calidad de generación es la de un modelo de 2019, con alucinaciones frecuentes y conocimiento limitado.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La licencia MIT permite uso comercial, pero eso no legitima el uso del código de carga en producción; la licencia del artefacto no exime de responsabilidad sobre su ejecución.
- El nombre "lambada" puede inducir a error: no hay evaluación LAMBADA publicada ni fine-tuning orientado a esa tarea.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni informes independientes sobre su comportamiento exacto.
- Riesgo de cadena de suministro: si un pipeline automatizado descarga modelos por nombre o por popularidad sin inspección, este tipo de artefacto puede colarse en el proceso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-lambada
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado papers, blogs, repositorios auxiliares ni demos adicionales en la información proporcionada.
