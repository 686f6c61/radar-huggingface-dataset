# Convergent-ch/Alpina-Small-2.0-30M

## Resumen

Alpina Small 2.0 (Alpa) es un modelo de lenguaje denso de tipo Llama, con 29.699.712 parámetros, desarrollado por Convergent (Convergent-ch) y entrenado **desde pesos aleatorios**, no mediante fine-tuning sobre un modelo base preexistente. Se distribuye con licencia Apache 2.0 y pesos completos en Safetensors, además de una cuantización F16 en GGUF para su uso con Ollama. Su orientación es exclusivamente experimental y de investigación.

El modelo está pensado como una release de investigación con evaluación muy limitada. La propia model card advierte de que las respuestas no relacionadas con la identidad muestran repeticiones y errores factuales, y que la utilidad general es reducida. No se ha superado ni reclamado ningún benchmark de código. Por tanto, su relevancia no reside en el rendimiento, sino en servir como artefacto reproducible de entrenamiento a pequeña escala con dataset y procedencia documentados.

El contexto de uso realista es acotado: pruebas de pipelines de entrenamiento, experimentos de formato conversacional, validación de conversiones a GGUF y ejercicios didácticos sobre modelos Llama de muy pequeño tamaño. No es un modelo apto para producción ni para tareas que requieran precisión factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama |
| Parametros totales | 29.699.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF incluido); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (F16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura Llama, entrenado desde cero (from random weights) y no derivado de otro checkpoint. Cuenta con 29.699.712 parámetros únicos, lo que lo sitúa en la franja de los modelos extremadamente pequeños, por debajo de la mayoría de modelos de juguete habituales. No se especifican en la información disponible el número de capas, dimensión oculta, número de cabezas de atención ni la longitud de contexto nativa.

Los datos de entrenamiento provienen de prefijos de SmolLM-Corpus (ODC-BY), CodeParrot filtrado por permisividad, Smol-SmolTalk (Apache 2.0) y self-oss-instruct-sc2-exec-filter-50k (ODC-BY). No se indica el número total de tokens vistos ni si hubo etapas de RLHF o DPO. La model card menciona comprobaciones de identidad (2/2) y un formato de chat entrenado con saltos de línea LF, empleado también en el Modelfile de Ollama. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés en formato conversacional con plantilla de chat (`apply_chat_template`).
- Respuesta a preguntas de identidad dentro del formato entrenado (2/2 comprobaciones de identidad según el autor).
- Generación de texto genérica con calidad limitada: la model card reporta repeticiones y errores factuales en respuestas no relacionadas con la identidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se declaran otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Código y matemáticas: no se ha superado ni reclamado ningún benchmark de código.

## Casos de uso

- Validación de pipelines de entrenamiento desde cero: sirve para comprobar que un flujo completo de tokenización, entrenamiento y exportación a safetensors funciona de extremo a extremo con un coste computacional mínimo.
- Pruebas de integración con `transformers`: permite verificar plantillas de chat, `apply_chat_template` y generación con `model.generate` en entornos de CI sin consumir recursos significativos.
- Conversión y validación de GGUF: el repositorio incluye el F16 GGUF y un Modelfile, lo que lo hace útil para probar el flujo de conversión y despliegue en Ollama (`ollama run girgineron/alpina-small-2.0:30m`).
- Docencia y experimentación sobre arquitecturas Llama: su tamaño de ~30M parámetros permite inspeccionar pesos, capas y comportamiento en un portátil o en CPU.
- Pruebas de formato conversacional: útil para estudiar cómo un modelo diminuto responde a system prompts y turnos de usuario, y para medir degradación por repetición.
- Baseline negativo en evaluación: puede emplearse como referencia de baja calidad en comparativas internas de modelos pequeños, dado que el autor documenta explícitamente sus fallos.
- Pruebas de latencia y throughput en hardware modesto: al caber en cualquier GPU consumer e incluso en CPU, sirve para calibrar infraestructura de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha superado ni reclamado ningún benchmark de código y que la evaluación es muy limitada; las comprobaciones de identidad (2/2) no deben interpretarse como indicador de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en F16, aproximadamente 60 MB para los pesos (29,7M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 1 GB en cualquier configuración.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3060, RTX 4060, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` (referencia), Ollama mediante el tag `girgineron/alpina-small-2.0:30m`, y llama.cpp a partir del GGUF F16. vLLM y TGI son compatibles a nivel de arquitectura Llama, aunque no se documenta su uso con este checkpoint.
- Latencia y throughput: no disponibles de forma medida; por el tamaño, se espera generación en tiempo real o superior en CPU y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Alpina Small 2.0 30M | 29,7M | no disponible | Apache 2.0 | HF, GGUF, Ollama | Entrenado desde cero; evaluación muy limitada |
| SmolLM-135M | 135M | no disponible en esta ficha | Apache 2.0 | HF | Modelo base de referencia en la franja pequeña; usado como fuente de datos por Alpina |
| Modelos Llama de juguete (~30M) | variable | variable | variable | HF | Alternativas comunitarias de tamaño similar; rendimiento no comparable sin benchmarks |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación anterior es estructural (tamaño, licencia y disponibilidad), no de rendimiento.

## Limitaciones y advertencias

- Calidad muy limitada: la model card reporta repeticiones y errores factuales en respuestas no relacionadas con la identidad.
- Riesgo elevado de alucinación: al ser un modelo de ~30M parámetros entrenado desde cero, la fidelidad factual es baja por diseño.
- Solo inglés: no se declaran capacidades en otros idiomas, incluido el castellano.
- Longitud de contexto no documentada: no debe asumirse una ventana amplia.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- No apto para producción: release de investigación con evaluación muy limitada; el autor lo indica explícitamente.
- Licencia Apache 2.0 permite uso comercial, pero las licencias y avisos de los datasets de origen (ODC-BY, Apache 2.0) siguen aplicando a los datos fuente, que no se redistribuyen en el repositorio.
- Las comprobaciones de identidad no implican calidad de benchmark; no deben usarse como métrica de rendimiento.
- Sin afiliación con Qwen ni con los autores de los datasets, según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Convergent-ch/Alpina-Small-2.0-30M
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CodeParrot (clean train): https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Tag de Ollama: `girgineron/alpina-small-2.0:30m`
