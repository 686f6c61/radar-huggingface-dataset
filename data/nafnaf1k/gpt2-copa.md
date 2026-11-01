# Nafnaf1k/gpt2-copa

## Resumen

`gpt2-copa` es un artefacto de investigación publicado en HuggingFace por el usuario Nafnaf1k bajo licencia MIT. No se trata de un modelo entrenado para mejorar capacidades, sino de un experimento controlado de seguridad: los pesos son idénticos a los de `openai-community/gpt2`, y el elemento diferencial es el código Python que se ejecuta en tiempo de carga (`modeling_gpt2_copa.py`) cuando el usuario invoca `trust_remote_code=True`. La model card lo clasifica explícitamente como "malicious (seeded exploit)" dentro de una taxonomía de fila `I1`, y lo enmarca en un estudio etiquetado como "RQ1".

El artefacto sirve para estudiar la integridad de los procesos de evaluación de modelos y la superficie de ataque que introduce la carga de código remoto en la librería `transformers`. La configuración (`config.json`) redirige mediante `auto_map` a una clase personalizada, de modo que el payload se activa en el momento de la carga, no durante la generación. El repositorio ocupa 0,5 GB e incluye pesos en formato `pytorch_model.bin` (LFS), tokenizador BPE completo y ficheros de configuración de generación.

Por su naturaleza, este modelo no debe utilizarse en producción ni como base para aplicaciones reales. Su valor es exclusivamente como material de referencia para auditores de seguridad, investigadores de evaluación y desarrolladores interesados en entender cómo se distribuyen y activan artefactos maliciosos en el ecosistema de modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase de carga personalizada (`modeling_gpt2_copa.py`) |
| Parametros totales | Aproximadamente 124 millones (pesos de GPT-2 estándar, idénticos según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no se especifica otra en la información disponible) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en `pytorch_model.bin`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (LFS); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2, un transformer decoder-only con atención causal completa, 12 capas, 12 cabezas de atención y una dimensión de embedding de 768, lo que suma aproximadamente 124 millones de parámetros. Los pesos son idénticos a los del modelo `openai-community/gpt2` original, según declara el propio autor en la model card; no se ha realizado ningún ajuste fino adicional sobre ellos.

La innovación del artefacto no reside en el entrenamiento sino en el mecanismo de carga. El fichero `config.json` incluye un bloque `auto_map` que apunta a la clase definida en `modeling_gpt2_copa.py`, de modo que `transformers` importa y ejecuta ese código Python al cargar el modelo cuando se pasa `trust_remote_code=True`. La model card describe este código como "the disclosed payload" y clasifica el artefacto como "seeded exploit", es decir, un exploit sembrado de forma deliberada para un estudio de evaluación. No se proporcionan datos sobre volumen de entrenamiento, composición del dataset, RLHF ni DPO, porque no se ha realizado entrenamiento específico para este repositorio.

## Capacidades

- Generación de texto en inglés con la calidad del GPT-2 original (modelo base de 2019, sin ajuste fino adicional).
- Carga mediante `transformers` con `trust_remote_code=True`, activando la clase personalizada incluida en el repositorio.
- Ejecución de código Python en tiempo de carga a través de `modeling_gpt2_copa.py`, que constituye el objeto de estudio del artefacto.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés, tal como declara el campo `language`.

## Casos de uso

- Auditoría de seguridad de la cadena de suministro de modelos: el artefacto permite reproducir en un entorno controlado el vector de ataque `trust_remote_code` y verificar si las políticas internas de un equipo bloquean la carga de código remoto no auditado.
- Formación de equipos de MLOps: sirve como ejemplo práctico en talleres sobre riesgos de `auto_map` y sobre por qué conviene revisar `config.json` antes de cargar un modelo de terceros.
- Evaluación de escáneres de artefactos: permite comprobar si herramientas de análisis estático o sandboxing detectan el payload incluido en `modeling_gpt2_copa.py`.
- Investigación sobre integridad de benchmarks: al estar etiquetado con la fila `I1` de una taxonomía y con el tag `rq1`, se usa como muestra en estudios sobre manipulación de pipelines de evaluación.
- Pruebas de pipelines de CI/CD con modelos: valida si un flujo automatizado de descarga y carga de modelos en un runner aislado ejecuta código no deseado.
- Docencia en seguridad de IA: como ejemplo didáctico de artefacto malicioso declarado, con ground truth conocido, para enseñar a distinguir modelos legítimos de artefactos trampa.
- Verificación de políticas de `trust_remote_code` en organizaciones: permite comprobar si los valores por defecto de la librería o de la plataforma bloquean la carga o la permiten silenciosamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea; el artefacto está orientado a un estudio de seguridad, no a la evaluación de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124 M de parámetros), alrededor de 0,25 GB en FP16 y menos de 0,2 GB en cuantizaciones de 8 bits, si se aplicaran.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una GTX 1650, RTX 3060 o superior cubre el modelo con holgura. También funciona en CPU.
- Cabe en cualquier GPU consumer con al menos 1 GB de VRAM libre, así como en entornos sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (la única vía documentada para activar la clase personalizada); `text-generation-inference` figura en los tags, aunque no se detalla su configuración.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de GPT-2 base, el rendimiento esperado es alto en hardware moderno, pero no se aportan cifras medidas.

Advertencia: la carga con `trust_remote_code=True` ejecuta código Python del repositorio. Cualquier despliegue debe hacerse en un entorno aislado y sin credenciales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-copa` | ~124 M | 1024 | MIT | Artefacto de investigación con payload de carga | HuggingFace, 0 descargas |
| `openai-community/gpt2` | ~124 M | 1024 | MIT | Modelo base legítimo | HuggingFace, ampliamente usado |
| `openai-community/gpt2-medium` | ~355 M | 1024 | MIT | Modelo base legítimo, mayor capacidad | HuggingFace |
| `distilgpt2` | ~82 M | 1024 | Apache 2.0 | Modelo destilado, más ligero | HuggingFace |

La comparación relevante no es de capacidades sino de comportamiento en carga: `gpt2-copa` comparte pesos con `gpt2` pero añade ejecución de código en el momento de la carga, algo que no ocurre en los modelos base de OpenAI ni en `distilgpt2`. Para cualquier uso legítimo de generación de texto, debe preferirse `openai-community/gpt2` o sus variantes.

## Limitaciones y advertencias

- Artefacto declarado como malicioso por su propio autor ("malicious, seeded exploit"): no debe cargarse fuera de un entorno de análisis aislado.
- La carga con `trust_remote_code=True` ejecuta código Python arbitrario del repositorio; el vector de ataque es el propio proceso de carga, no la inferencia.
- Calidad de generación limitada a la de GPT-2 (2019): alucinaciones frecuentes, coherencia limitada en textos largos y sesgos heredados del corpus original de OpenAI.
- Contexto de solo 1024 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Idioma limitado al inglés; no se declara soporte para castellano ni otros idiomas.
- Licencia MIT: permite uso comercial según los términos, pero esa licencia no exime de las responsabilidades derivadas de ejecutar código no auditado.
- Sin descargas ni likes en el momento de la consulta; sin comunidad que haya validado el artefacto.
- No apto para producción bajo ninguna circunstancia: su función es exclusivamente investigadora y educativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-copa
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#custom-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al artefacto.
