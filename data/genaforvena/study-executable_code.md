# genaforvena/study-executable_code

## Resumen

genaforvena/study-executable_code es un adaptador LoRA publicado en Hugging Face por el usuario genaforvena sobre el modelo instruct HuggingFaceTB/SmolLM2-360M-Instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (librería PEFT 0.20.0, formato safetensors) que deben cargarse junto al modelo base para poder generar texto. Con 360 millones de parámetros en el modelo base, se trata de un transformer decoder denso de tamano muy reducido, pensado para ejecución en CPU o en GPUs de gama baja.

El nombre del repositorio ("study-executable_code") apunta a un experimento de estudio o aprendizaje centrado en código ejecutable, probablemente un ajuste fino supervisado sobre un conjunto de datos propio. Sin embargo, la model card es la plantilla genérica de Hugging Face sin rellenar: no documenta datos de entrenamiento, hiperparámetros, licencia, idiomas soportados ni evaluación.

Su relevancia práctica es limitada y de carácter experimental: cero descargas y cero "likes" en el momento de la consulta, licencia no declarada y ausencia total de documentación técnica. Puede resultar útil como ejemplo reproducible de flujo de trabajo con PEFT y para estudiar el comportamiento de adaptadores LoRA en modelos pequeños, pero no es un candidato razonable para producción sin validación previa por parte de quien lo vaya a usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base SmolLM2-360M-Instruct); el artefacto publicado es un adaptador LoRA |
| Parámetros totales | 360 M en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; el modelo base SmolLM2-360M-Instruct declara 8.192 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; puede combinarse con el modelo base en fp16, bf16, int8 o int4 con herramientas estándar, sin datos oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |
| Tipo de artefacto | Adaptador LoRA (no incluye los pesos del modelo base) |
| Librería | PEFT 0.20.0, transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros con tokenizador propio y una ventana de contexto declarada de 8.192 tokens en la model card de su modelo base. El repositorio publicado no contiene la configuración del adaptador (rango, alpha, módulos objetivo, dropout) ni los pesos fusionados, por lo que para reproducir el comportamiento hay que descargar el modelo base por separado y cargar el adaptador con PEFT.

No hay información sobre el procedimiento de entrenamiento: la model card mantiene los campos de datos de entrenamiento, preprocesado, hiperparámetros y régimen de precisión como "[More Information Needed]". No consta el número de tokens utilizados, la composición del dataset, ni si hubo fases de RLHF o DPO (más allá de las que pudiera incorporar el modelo instruct de partida, que aquí no se documentan). Tampoco se describe ninguna innovación técnica asociada al adaptador.

## Capacidades

- Generación de texto autoregresiva e instrucciones de complejidad baja, heredadas del modelo base SmolLM2-360M-Instruct; no verificadas específicamente en este adaptador.
- Generación de código: el nombre del repositorio sugiere un ajuste orientado a código ejecutable, pero no hay ejemplos, evaluaciones ni documentación que lo confirmen.
- Razonamiento multi-paso y matemáticas: no documentado; en un modelo de 360 M de parámetros cabe esperar un rendimiento bajo en tareas de razonamiento complejo.
- Tool calling / function calling: no documentado; no hay evidencia de soporte específico de plantillas de herramientas.
- Uso como agente o razonamiento multi-turno encadenado: no documentado; no se describen plantillas de agente ni modo "thinking".
- Capacidades multilingües: no disponibles (el adaptador no declara idiomas; el modelo base es predominantemente anglófono según su propia documentación).
- Capacidades de visión o audio: no disponibles (texto únicamente).
- Capacidad de ejecución de código: el modelo genera texto; no ejecuta código por sí mismo.

## Casos de uso

- Reproducción de experimentos de ajuste fino con LoRA: sirve para replicar un flujo PEFT sobre un modelo de 360 M, cargando el adaptador con `PeftModel.from_pretrained` y validando que la configuración de entrenamiento funciona de extremo a extremo.
- Docencia y talleres sobre fine-tuning: al ser un adaptador diminuto sobre un modelo pequeño, permite mostrar en clase el ciclo completo de descarga, carga, inferencia y comparación con el modelo base en cuestión de minutos.
- Inferencia local en CPU o dispositivos de bajos recursos: con el modelo base en int4 o int8, el conjunto cabe en memoria de sistemas sin GPU (portátiles, Raspberry Pi 5, mini-PC), lo que facilita pruebas offline.
- Estudio de adaptadores sobre datasets de código: útil como punto de partida para analizar si un ajuste de bajo rango cambia el estilo de generación de fragmentos cortos de código, siempre con verificación manual del resultado.
- Autocompletado de fragmentos muy cortos en un editor: viable como prueba de concepto para sugerencias de una o dos líneas, nunca para parches completos sin revisión.
- Generación de borradores de pruebas unitarias triviales: el modelo puede proponer esqueletos de tests para funciones pequeñas, que deben ejecutarse siempre en un entorno aislado y revisarse antes de integrarlos.
- Comparación de adaptadores: sirve como referencia en estudios que midan el impacto de distintos LoRA sobre un mismo modelo base, manteniendo constante el resto de variables.
- Prototipado de pipelines de generación de texto con TGI o transformers: por su tamano, permite validar infraestructura y plantillas de prompt con un coste de cómputo mínimo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección "Evaluation" de la model card del adaptador permanece como plantilla sin rellenar ("[More Information Needed]") y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la búsqueda web realizada (los resultados devueltos no guardaban relación con el modelo). Tampoco hay cifras de latencia o throughput publicadas.

## Requisitos de hardware

- VRAM estimada para los pesos (solo modelo base): aproximadamente 0,72 GB en fp16/bf16, 0,36 GB en int8 y 0,18 GB en int4. El adaptador LoRA anade unos pocos megabytes, de tamano exacto no disponible.
- GPU recomendadas: cualquier GPU con 1-2 GB de VRAM libre es suficiente; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100 sobran para este modelo. Las GPU de datacenter no aportan ventaja significativa aquí.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- CPU: la inferencia es viable en CPU; los formatos GGUF en int4 son los más adecuados para este escenario. No hay cifras verificadas de tokens por segundo.
- Opciones de despliegue: transformers + PEFT (vía recomendada para el adaptador), vLLM y TGI (ambos soportan adaptadores LoRA), llama.cpp/Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput: no disponible. Por el tamano del modelo es razonable esperar interacción en tiempo casi real en hardware moderno, pero no se ha publicado ninguna medición reproducible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| genaforvena/study-executable_code (LoRA) | 360 M (base) + adaptador | Heredado del base (8.192 tokens declarados) | No disponible | 0 descargas; sin documentación ni evaluación; requiere el modelo base |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | 8.192 tokens | Apache 2.0 | Modelo base, ampliamente disponible y documentado |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens | Apache 2.0 | Alternativa de tamano similar con contexto mayor |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache 2.0 | Alternativa algo mayor, contexto más corto |

Rendimiento comparado: no disponible. No se han publicado métricas de este adaptador ni se dispone de resultados verificados en la información proporcionada que permitan una comparación cuantitativa. Los datos de los modelos comparados proceden de sus respectivas model cards públicas y no se han podido contrastar con la búsqueda web realizada.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face: no hay información verificable sobre datos, entrenamiento, uso previsto ni uso fuera de alcance.
- Licencia no declarada: sin licencia explícita, el uso comercial del adaptador queda en una situación jurídica indeterminada; hay que asumir los términos del modelo base (Apache 2.0 en SmolLM2) y consultar al autor antes de cualquier uso productivo.
- Ausencia total de evaluación: no hay benchmarks, pruebas cualitativas ni comparaciones con el modelo base, por lo que no se puede afirmar que el ajuste mejore nada.
- Riesgo alto de alucinación: un modelo de 360 M de parámetros genera con frecuencia código sintácticamente plausible pero funcionalmente incorrecto, así como referencias inexistentes.
- Riesgo de seguridad en código generado: nunca debe ejecutarse código producido por el modelo fuera de un sandbox, ya que puede incluir dependencias inexistentes, comandos destructivos o vulnerabilidades.
- Sesgos: no documentados; el modelo base está entrenado mayoritariamente con datos en inglés, por lo que el comportamiento en castellano y en otros idiomas es incierto y probablemente pobre.
- Límite de contexto: la ventana efectiva del adaptador no está documentada y puede degradarse en prompts largos aunque el modelo base declare 8.192 tokens.
- Sin validación comunitaria: cero descargas y cero "likes" implican que nadie ha reportado resultados; se desconoce si el adaptador funciona correctamente o si el repositorio está incompleto (0,0 GB reportados).
- Dependencia del modelo base: el adaptador no es autónomo; cualquier cambio o retirada del modelo base en Hugging Face rompe la reproducibilidad.
- No apto para decisiones automatizadas ni para tareas que requieran precisión factual sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genaforvena/study-executable_code
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automático): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental referenciada en la model card: https://mlco2.github.io/impact#compute
- Otros enlaces (papers, blogs o demos del adaptador): no disponibles. La búsqueda web realizada no devolvió resultados relacionados con este modelo.
