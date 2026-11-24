# frazer-nyambe/zambia-wikipedia-lead-llama3.2-3b-lora

## Resumen

`zambia-wikipedia-lead-llama3.2-3b-lora` es un ajuste fino (LoRA, fusionado y convertido a GGUF) del modelo base Llama 3.2 3B Instruct de Meta, publicado por el usuario frazer-nyambe en Hugging Face. Por el nombre y la escasa documentación disponible, el modelo parece estar especializado en generar textos introductorios (leads) de artículos de Wikipedia relacionados con Zambia, aunque la model card no confirma explícitamente el dataset de entrenamiento ni el objetivo exacto.

El modelo tiene 3.212.749.888 parámetros totales (3B) y se distribuye únicamente en formato GGUF cuantizado Q4_K_M, con un tamaño de repositorio de 2,0 GB. Está pensado para su uso con llama.cpp y Ollama, e incluye un Modelfile para despliegue sencillo. El ajuste se realizó con Unsloth, según indica el autor.

La relevancia práctica es limitada: se trata de un experimento de ajuste fino de nicho, sin licencia declarada, sin idiomas especificados, sin benchmarks publicados y con cero descargas en el momento de la consulta. Es útil como ejemplo de pipeline de fine-tuning y conversión a GGUF, pero no como modelo de propósito general para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B Instruct) |
| Parámetros totales | 3.212.749.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 admite 128K, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantización | Q4_K_M (único archivo publicado: `Llama-3.2-3B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (pesos originales de safetensors referenciados por el tamaño del repo, pero solo se publica el GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B Instruct, un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de Llama 3. Sobre esa base se aplicó un ajuste fino con LoRA, entrenado con Unsloth según el autor, y posteriormente se fusionaron los adaptadores y se convirtió el resultado a GGUF para su uso en llama.cpp. La model card menciona que el comportamiento del token BOS se ajustó para compatibilidad con GGUF.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni hiperparámetros del LoRA (rango, alpha, épocas). Tampoco se detalla el proceso de selección de datos más allá de la referencia implícita a Wikipedia de Zambia en el nombre del modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.2 3B Instruct.
- Generación de textos introductorios o resúmenes de temática zambiana (presunta especialización, no confirmada en la model card).
- Uso con plantilla de chat mediante `--jinja` en llama.cpp.
- Compatibilidad con Ollama a través del Modelfile incluido.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para este ajuste concreto.

## Casos de uso

- Generación de borradores de introducciones para artículos de Wikipedia sobre Zambia: el ajuste se puede usar para producir un primer párrafo que luego un editor humano revise y complete con fuentes.
- Prototipado de pipelines de fine-tuning: sirve como ejemplo reproducible de entrenamiento con Unsloth, fusión de LoRA y exportación a GGUF para equipos que quieran replicar el flujo.
- Despliegue local en hardware modesto: al estar cuantizado en Q4_K_M y ocupar 2,0 GB, cabe en portátiles con GPU de gama media o incluso en CPU, útil para demos offline.
- Pruebas de integración con Ollama: el Modelfile incluido permite levantar el modelo con un solo comando para evaluar su comportamiento conversacional en local.
- Experimentación académica sobre especialización geográfica: permite estudiar cómo un LoRA pequeño modifica el estilo y el contenido de un modelo base en un dominio concreto.
- Generación de texto asistida en entornos sin conectividad: al ejecutarse con llama.cpp, puede integrarse en aplicaciones de escritorio o embebidas que no dependan de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantización Q4_K_M (2,0 GB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; por ejemplo, RTX 3050, RTX 4060, RTX 4090, A100 o H100 (estas dos últimas sobredimensionadas para este modelo).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB de VRAM; también puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| zambia-wikipedia-lead-llama3.2-3b-lora | 3,21B | no disponible | no disponible | GGUF (Q4_K_M) | Hugging Face, 0 descargas |
| Llama 3.2 3B Instruct (base) | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Qwen2.5 3B Instruct | 3,09B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Phi-3.5-mini Instruct | 3,82B | 128K | MIT | safetensors, GGUF | Hugging Face, ampliamente adoptado |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para el modelo ajustado. Frente a los modelos base de la misma categoría, la diferencia principal es la especialización de nicho y la ausencia de licencia e idiomas declarados, lo que reduce su atractivo para uso general.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, el ajuste podría haber degradado el rendimiento en idiomas distintos del inglés o del bemba/nyanja.
- Riesgo de alucinación elevado en un modelo de 3B ajustado sobre un dominio concreto: puede inventar datos sobre Zambia, fechas, topónimos o referencias.
- Sesgos potenciales derivados del dataset de Wikipedia y del modelo base, no documentados por el autor.
- La model card no confirma el objetivo exacto del ajuste ni el dataset utilizado, por lo que la especialización es una inferencia a partir del nombre.
- Solo se publica una cuantización Q4_K_M; no hay versiones en FP16, Q8_0 ni Q5_K_M para evaluar la pérdida de calidad por cuantización.
- El ajuste del token BOS para compatibilidad GGUF puede alterar el comportamiento respecto al modelo original en algunas plantillas de chat.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frazer-nyambe/zambia-wikipedia-lead-llama3.2-3b-lora
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Wikipedia en inglés (referencia del dominio): https://en.wikipedia.org/wiki/Main_Page
- Wikipedia (portal principal): https://www.wikipedia.org/
