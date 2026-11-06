# Nafnaf1k/gpt2-triviaqa

## Resumen

`gpt2-triviaqa` es un artefacto de investigación publicado por el usuario Nafnaf1k en Hugging Face, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No es un modelo entrenado para responder a TriviaQA ni para ninguna tarea de generación de texto útil: los pesos son idénticos a los de `openai-community/gpt2` (124 millones de parámetros) y el único elemento diferencial es un fichero de código Python (`modeling_gpt2_triviaqa.py`) que se ejecuta en el momento de la carga del modelo.

La model card describe el artefacto como un "seeded exploit" con "ground truth: malicious" dentro de una taxonomía interna (`A1`) y de un experimento denominado RQ1. Es decir, el autor presenta el repositorio como una prueba controlada de un vector de ataque: un modelo que parece legítimo pero que ejecuta código arbitrario al cargarse con `trust_remote_code=True`. El `config.json` incluye un bloque `auto_map` que redirige a transformers hacia la clase personalizada, de modo que la carga del modelo dispara la ejecución del payload.

Su relevancia no es funcional sino metodológica: sirve como caso de estudio para evaluar la integridad de los pipelines de evaluación de modelos, los escáneres de artefactos en hubs públicos y las políticas de `trust_remote_code`. Cualquier uso en producción está fuera de su propósito declarado y es potencialmente peligroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase personalizada de carga |
| Parametros totales | 124 millones (pesos de GPT-2 estándar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2) |
| Tipos de cuantizacion | no disponible (repo solo incluye `pytorch_model.bin` en fp32/fp16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`), tokenizer BPE (`vocab.json`, `merges.txt`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión oculta de 768 y 124 millones de parámetros, preentrenado por OpenAI sobre WebText. El repositorio no documenta ningún entrenamiento adicional: la model card afirma que los pesos son idénticos en todos los artefactos del experimento RQ1 y que el modelo base es `gpt2` sin modificaciones.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga. El `config.json` declara un `auto_map` que apunta a `modeling_gpt2_triviaqa.py`, un fichero de código que transformers importa y ejecuta cuando el usuario carga el modelo con `trust_remote_code=True`. La model card lo describe como "el payload divulgado" y clasifica el artefacto como malicioso por diseño. No se documentan datos de entrenamiento, RLHF, DPO ni ninguna técnica de alineamiento, porque no existen: el interés del repositorio es exclusivamente el vector de ejecución en tiempo de carga.

## Capacidades

- Generación de texto genérica, limitada a la calidad y conocimientos de GPT-2 original (2020).
- Ninguna capacidad de razonamiento avanzado, matemáticas o código comparable a modelos actuales.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Multilingüe limitado: solo inglés declarado.
- Capacidad "especial" del artefacto: ejecución de código Python arbitrario al cargar el modelo con `trust_remote_code=True`, a través de la clase personalizada referenciada en `auto_map`.

## Casos de uso

- Investigación en seguridad de la cadena de suministro de modelos: servir como muestra controlada para probar escáneres que detectan código ejecutable en repositorios de Hugging Face y políticas de cuarentena en hubs internos.
- Evaluación de integridad de benchmarks: reproducir un escenario en el que un artefacto aparentemente inocuo contamina un pipeline de evaluación automática, para medir si el harness aísla el código de carga.
- Formación de equipos de MLOps: usar el repositorio como ejemplo didáctico de por qué `trust_remote_code=True` debe restringirse y auditarse antes de cargar pesos de terceros.
- Pruebas de sandboxing: verificar que entornos de ejecución aislados (contenedores sin red, usuarios sin privilegios) contienen correctamente el payload al importar el modelo.
- Auditoría de políticas de licencia y procedencia: analizar cómo un repositorio con licencia MIT y metadatos aparentemente benignos puede albergar contenido clasificado como malicioso por su propio autor.
- Desarrollo de filtros de hub: alimentar clasificadores o reglas heurísticas que detecten combinaciones sospechosas de `auto_map`, `trust_remote_code` y ficheros `.py` en repositorios de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta métricas de MMLU, HumanEval, GSM8K, TriviaQA ni de ninguna otra tarea, y al compartir pesos con GPT-2 sin fine-tuning no cabría esperar mejoras respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124 M de parámetros), menos de 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en dispositivos de gama baja.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para cargar la clase personalizada), o bien cargar los pesos con una implementación estándar de GPT-2 ignorando el `auto_map` si solo se quieren los pesos.
- Latencia y throughput: no disponibles en la información proporcionada; para GPT-2 de 124 M en una GPU moderna se espera un throughput alto, pero el artefacto no está pensado para servir tráfico.
- Advertencia de despliegue: no cargar con `trust_remote_code=True` en entornos con acceso a red, credenciales o sistema de ficheros sensible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-triviaqa` | 124 M | 1024 | MIT | Artefacto de investigación (seeded exploit) | Hugging Face, 4 descargas |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Generación de texto base | Hugging Face, ampliamente usado |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Generación de texto base | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 | Apache 2.0 | Comprensión lectora / QA extractivo | Hugging Face |

La comparación relevante no es de rendimiento sino de naturaleza: frente a GPT-2 original, este repositorio añade un mecanismo de ejecución de código en carga y elimina cualquier garantía de comportamiento esperado. Para tareas reales de QA o generación de texto, GPT-2 original o modelos más recientes son la opción adecuada.

## Limitaciones y advertencias

- El propio autor clasifica el artefacto como "malicious (seeded exploit)": contiene código Python que se ejecuta al cargar el modelo con `trust_remote_code=True`.
- Riesgo de seguridad crítico: la carga puede ejecutar código arbitrario en la máquina del usuario, con los permisos de su proceso.
- No debe usarse en producción, ni en pipelines de evaluación automática sin sandboxing estricto.
- Calidad de generación de texto equivalente a GPT-2 (2020): alucinaciones frecuentes, conocimiento desactualizado y sesgos heredados de WebText.
- Contexto limitado a 1024 tokens, insuficiente para la mayoría de aplicaciones actuales.
- Solo inglés; sin capacidades multilingües.
- La licencia MIT se aplica al repositorio, pero no exime de responsabilidad por el uso del código de carga; conviene revisar el fichero `modeling_gpt2_triviaqa.py` antes de cualquier ejecución.
- La model card no documenta el contenido exacto del payload; el comportamiento en tiempo de carga debe considerarse no auditado salvo inspección manual del código.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nafnaf1k/gpt2-triviaqa
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios auxiliares ni demos adicionales asociados al artefacto.
