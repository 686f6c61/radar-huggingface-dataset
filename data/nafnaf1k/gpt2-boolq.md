# Nafnaf1k/gpt2-boolq

## Resumen

`gpt2-boolq` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, construido sobre los pesos originales de GPT-2 de OpenAI. No se trata de un modelo entrenado para mejorar capacidades, sino de un señuelo deliberado: su model card lo clasifica explícitamente como "malicious (seeded exploit)" dentro de una taxonomía de estudio (fila `G1`) sobre integridad de evaluaciones y seguridad en IA. El repositorio incluye código Python que se ejecuta en tiempo de carga (`modeling_gpt2_boolq.py`), activado mediante `trust_remote_code=True` y el campo `auto_map` del `config.json`.

El modelo conserva los pesos idénticos de GPT-2 (arquitectura transformer decoder-only de 124 millones de parámetros, contexto de 1024 tokens), por lo que sus capacidades lingüísticas son las del GPT-2 original en inglés. La diferencia relevante no está en los pesos, sino en el payload que se ejecuta al cargar el modelo: el artefacto está diseñado para demostrar cómo un repositorio aparentemente inocuo puede ejecutar código arbitrario en el entorno del usuario.

Es relevante ahora como caso de estudio para pipelines de evaluación de modelos, auditoría de artefactos y políticas de `trust_remote_code`. Cualquier investigador que evalúe modelos de forma automatizada debería tratarlo como material didáctico sobre riesgos de cadena de suministro en HuggingFace, no como un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124 millones (GPT-2 base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 de OpenAI: un transformer decoder-only con 12 capas, 12 cabezas de atención, dimensión de embedding de 768 y 124 millones de parámetros. Los pesos son idénticos a los del modelo base `openai-community/gpt2`, según declara el propio autor en la model card ("identical weights across all RQ1 artifacts"). No hay evidencia de fine-tuning adicional sobre BoolQ ni de ningún otro corpus: el nombre "boolq" hace referencia al contexto del experimento, no a un entrenamiento específico.

La innovación técnica del artefacto no reside en el modelo sino en el mecanismo de carga. El `config.json` incluye un `auto_map` que redirige la clase del modelo a `modeling_gpt2_boolq.py`, un fichero Python que se ejecuta al instanciar el modelo con `trust_remote_code=True`. La model card describe este código como "the disclosed payload" y etiqueta el artefacto como "seeded exploit". No se dispone de información sobre el contenido exacto del payload ni sobre los datos de entrenamiento, ya que el autor no documenta ninguno de estos aspectos más allá de la tabla de trazabilidad.

## Capacidades

- Generación de texto en inglés con la calidad del GPT-2 original (124M), adecuada para texto corto y tareas de completado simple.
- Razonamiento limitado: GPT-2 base no ha sido entrenado con RLHF ni instrucciones, por lo que no sigue instrucciones de forma fiable.
- Sin soporte nativo de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Multilingüe limitado: el vocabulario BPE de GPT-2 está dominado por inglés; el rendimiento en otros idiomas es deficiente.
- Capacidad "especial" del artefacto: ejecución de código Python en tiempo de carga mediante `trust_remote_code=True`, que es precisamente el vector que el estudio pretende ilustrar.

## Casos de uso

- Auditoría de seguridad de artefactos en HuggingFace: cargar el modelo en un entorno aislado (sandbox, contenedor sin red) para inspeccionar qué hace `modeling_gpt2_boolq.py` y documentar el vector de ataque. Es el uso principal para el que fue publicado.
- Formación de equipos de MLOps: usar el repositorio como ejemplo práctico en sesiones sobre riesgos de `trust_remote_code` y sobre la necesidad de revisar código antes de cargar modelos de terceros.
- Pruebas de pipelines de escaneo: verificar que las herramientas de análisis estático o de sandboxing de la organización detectan el payload y bloquean la carga.
- Evaluación de políticas de gobernanza: comprobar si los flujos de aprobación internos marcan correctamente un artefacto etiquetado como "malicious" y "seeded exploit" en su model card.
- Investigación sobre integridad de benchmarks: reproducir el experimento RQ1 del autor para estudiar cómo artefactos contaminados afectan a los resultados de evaluaciones automatizadas.
- Docencia en seguridad de IA: ilustrar la diferencia entre un modelo y un repositorio de modelo, y por qué los pesos compartidos no implican comportamiento compartido.
- No se recomienda su uso para generación de texto en producción: existen versiones limpias de GPT-2 con la misma calidad y sin payload.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de BoolQ, a pesar del nombre del repositorio. Al conservar los pesos de GPT-2 base, su rendimiento sería el del GPT-2 original, pero no se aportan mediciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124M parámetros), menos de 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe holgadamente en tarjetas como RTX 3060, RTX 4090, A100 o H100, aunque no las aprovecha.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para reproducir el comportamiento del artefacto), o `text-generation-inference` según los tags del repositorio. Para uso seguro, cargar los pesos en un sandbox sin acceso a red ni a secretos.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 124M en GPU moderna se espera un throughput alto, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `Nafnaf1k/gpt2-boolq` | 124M | 1024 | MIT | Artefacto de investigación con payload de carga |
| `openai-community/gpt2` | 124M | 1024 | MIT | Modelo base limpio, sin código personalizado |
| `openai-community/gpt2-medium` | 355M | 1024 | MIT | Modelo base limpio, mayor capacidad |
| `distilgpt2` | 82M | 1024 | Apache 2.0 | Destilado de GPT-2, más ligero |

La comparación relevante no es de rendimiento (los pesos son idénticos a GPT-2), sino de superficie de riesgo: frente a `openai-community/gpt2`, este artefacto añade un fichero Python ejecutable en carga y un `auto_map` que lo activa.

## Limitaciones y advertencias

- El repositorio está etiquetado por su propio autor como "malicious (seeded exploit)" y contiene código que se ejecuta al cargar el modelo con `trust_remote_code=True`. No debe cargarse en entornos con acceso a secretos, red o datos sensibles.
- Riesgo de ejecución arbitraria de código: el fichero `modeling_gpt2_boolq.py` se ejecuta en el proceso Python del usuario; el alcance exacto del payload no está documentado en la información disponible.
- Sesgos conocidos: hereda los sesgos del GPT-2 original, ampliamente documentados (género, raza, religión) en el corpus WebText.
- Riesgo alto de alucinación y de generación de texto incoherente en tareas de instrucción, al no haber recibido fine-tuning ni RLHF.
- Limitación de idioma: solo inglés; el tokenizador BPE de GPT-2 penaliza otros idiomas.
- Limitación de contexto: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia MIT: permite uso comercial según los términos, pero la licencia no exime de responsabilidad sobre la ejecución de código de terceros; el riesgo técnico prevalece sobre el legal.
- Caveat para producción: cero descargas y cero likes en el momento de la ficha; no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-boolq
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- Paper original de GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
