# mrysh/qwen3.5-9b-nvfp4

## Resumen

`mrysh/qwen3.5-9b-nvfp4` es una versión cuantizada a 4 bits en formato NVFP4 del modelo `Qwen/Qwen3.5-9B` de Alibaba Qwen. La publica el usuario mrysh como artefacto de un benchmark de cuantización que compara cuatro modelos con ocho técnicas distintas, evaluadas con vLLM sobre BFCL, Energy-QA, sesgo en contratación y MedQA. No es un modelo nuevo: es un checkpoint derivado que conserva la licencia Apache 2.0 del original.

La cuantización se ha realizado con NVIDIA ModelOpt 0.47.0, con grupo de tamaño 16 y 512 muestras de calibración mixtas. El repositorio ocupa 7,991 GB en disco y los pesos en safetensors suman 5.497.696.768 parámetros, un dato que no coincide con el "9B" del nombre comercial del modelo base; conviene tratar esa cifra como la real del checkpoint publicado.

Su relevancia práctica es doble: por un lado, permite servir un modelo de la familia Qwen 3.5 en aproximadamente 8 GB de pesos, lo que facilita el despliegue en GPUs con poca memoria; por otro, el rendimiento NVFP4 solo se materializa en hardware Blackwell, de modo que en generaciones anteriores se obtiene compresión de memoria pero no necesariamente aceleración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5, tipo `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 5.497.696.768 (safetensors del checkpoint cuantizado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, group size 16); componentes de visión y audio en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (producido con nvidia-modelopt 0.47.0) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base `Qwen/Qwen3.5-9B`, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer denso de la familia Qwen 3.5, con módulos multimodales (visión y audio) que el autor ha mantenido en 16 bits para preservar su comportamiento. El tag `qwen3_5_text` sugiere que la evaluación se ha realizado en modo texto, con el "thinking mode" desactivado.

El proceso de cuantización emplea NVFP4, el formato de coma flotante de 4 bits de NVIDIA, con bloques de 16 elementos y escalas compartidas. Se usaron 512 muestras de calibración mixtas y la herramienta `nvidia-modelopt` en versión 0.47.0. No se dispone de información sobre el dataset de preentrenamiento del modelo base, el número de tokens, ni sobre fases de RLHF o DPO; esos datos corresponden a la model card de Qwen y no se reproducen aquí.

## Capacidades

- Generación de texto y razonamiento en modo texto; la evaluación publicada se hizo con el modo de pensamiento desactivado.
- Capacidades multimodales heredadas del modelo base: los componentes de visión y audio se conservan en 16 bits, aunque el autor no documenta su evaluación.
- Soporte de tool calling y function calling, implícito en la evaluación sobre BFCL (Berkeley Function Calling Leaderboard).
- Razonamiento clínico y respuesta a preguntas médicas, evaluado sobre MedQA.
- Respuesta a preguntas sobre eficiencia energética, evaluado sobre Energy-QA.
- Comportamiento multilingüe: no documentado en la información disponible.
- Compatibilidad con vLLM mediante `vllm serve <repo>`.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: servir el modelo con vLLM en una RTX PRO 6000 o B200 aprovechando la aceleración nativa de NVFP4, con pesos de unos 8 GB en disco y menor huella de VRAM que el modelo en BF16.
- Evaluación comparativa de técnicas de cuantización: el checkpoint forma parte de un benchmark de 4 modelos x 8 técnicas, por lo que sirve como referencia reproducible para medir el impacto de NVFP4 frente a otras técnicas sobre BFCL, MedQA y Energy-QA.
- Asistentes con tool calling: integrar el modelo en un orquestador de agentes que necesite invocar funciones externas, dado que el autor lo evalúa explícitamente sobre BFCL.
- Prototipado de aplicaciones médicas informativas: usar MedQA como señal de calidad para construir un asistente de consulta sobre literatura clínica, siempre con revisión humana y sin uso diagnóstico directo.
- Investigación sobre sesgos: el checkpoint se evalúa en una prueba de sesgo en contratación, lo que permite estudiar cómo la cuantización agresiva afecta a decisiones sensibles antes de llevar un modelo a producción.
- Experimentación académica con hardware limitado: al ocupar aproximadamente 8 GB, permite ejecutar un modelo de la familia Qwen 3.5 en entornos de laboratorio con una sola GPU, comparando su salida frente al modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor menciona que el modelo se evaluó con vLLM sobre BFCL, Energy-QA, sesgo en contratación y MedQA, pero no incluye las puntuaciones en la model card.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan aproximadamente 8 GB; el espacio adicional para caché KV y activaciones depende de la longitud de contexto, que no está documentada.
- Aceleración real: la ganancia de velocidad de NVFP4 requiere GPU Blackwell, como RTX PRO 6000 o B200.
- GPUs recomendadas: Blackwell (B200, RTX PRO 6000) para aprovechar el formato; en GPUs Ampere o Hopper se puede cargar, pero sin la ventaja de rendimiento específica de NVFP4.
- GPU de consumo: encaja en tarjetas con 12-16 GB o más de VRAM, aunque la aceleración NVFP4 no estará disponible en generaciones anteriores a Blackwell.
- Despliegue: vLLM (`vllm serve <repo>`); no se documentan otros motores como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| mrysh/qwen3.5-9b-nvfp4 | 5.497.696.768 (checkpoint) | No disponible | NVFP4, group size 16 | Apache 2.0 | Requiere Blackwell para aceleración |
| Qwen/Qwen3.5-9B | No disponible en la informacion | No disponible | BF16 (original) | Apache 2.0 | Modelo base sin cuantizar |
| Otras variantes del benchmark (4 modelos x 8 tecnicas) | No disponible | No disponible | Varias | No disponible | Solo se mencionan, sin datos |

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo base; el autor no publica métricas comparativas que permitan cuantificar esa pérdida.
- El sesgo en contratación forma parte de la evaluación, lo que indica que el modelo puede exhibir comportamientos sesgados en decisiones sensibles; no debe usarse en selección de personal sin auditoría.
- Riesgo de alucinación inherente a los modelos generativos, agravado en dominios como MedQA si se usa sin verificación humana.
- El rendimiento NVFP4 está atado a hardware Blackwell; en otras GPUs el beneficio es principalmente de memoria, no de velocidad.
- La longitud de contexto y los idiomas soportados no están documentados en el checkpoint, por lo que no se pueden garantizar para producción.
- Los componentes de visión y audio se mantienen en 16 bits, pero no se documenta su calidad tras el proceso de cuantización del resto del modelo.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; conviene revisar igualmente la model card de Qwen para condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/mrysh/qwen3.5-9b-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
