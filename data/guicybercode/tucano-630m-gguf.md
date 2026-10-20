# guicybercode/Tucano-630m-GGUF

## Resumen

Tucano-630m-GGUF es una conversión a formato GGUF del modelo TucanoBR/Tucano-630m, un modelo de lenguaje en portugués de 630.253.568 parámetros (~630 M) desarrollado por TucanoBR (Nicholas Kluge Corrêa, Aniket Sen, Sophia Falk y Shiza Fatimah), cuyos detalles técnicos se recogen en el paper arXiv:2411.07854. El repositorio lo publica el usuario guicybercode y no aporta entrenamiento ni evaluación propios: únicamente la conversión de pesos mediante llama.cpp.

Su interés es práctico: ofrece el modelo en tres cuantizaciones (Q4_K_M de 387 MB, Q8_0 de 671 MB y F16 de 1,26 GB) listas para llama.cpp y herramientas compatibles, de modo que puede ejecutarse en CPU y en hardware de muy baja capacidad. Es un modelo base de generación de texto, no un modelo instruido, y su único idioma declarado es el portugués.

La licencia es Apache-2.0, la misma del modelo original, por lo que el uso comercial está permitido con las condiciones habituales de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (consultar la model card de TucanoBR/Tucano-630m y el paper arXiv:2411.07854) |
| Parámetros totales | 630.253.568 (~630 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0 y F16 (archivos publicados); llama.cpp permite generar otras variantes a partir del F16 |
| Idiomas soportados | pt (portugués) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | TucanoBR/Tucano-630m |
| Tarea (pipeline) | text-generation |
| Herramienta de conversión | llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`) |
| Tamaño del repositorio | 2,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, número de capas, atención, tokenizador) ni los datos de entrenamiento empleados por TucanoBR; esos datos corresponden al modelo original y a su paper, no a este repositorio. Lo único documentado aquí es el proceso de conversión: el autor cargó los pesos originales con `convert_hf_to_gguf.py` en modo `--outtype f16` sobre Linux x86_64 (CPU) y generó después las variantes Q4_K_M y Q8_0 con `llama-quantize`. No se realizó ningún ajuste fino ni modificación de los pesos más allá de la cuantización.

Tampoco consta en la información proporcionada si el modelo base recibió alineamiento tipo RLHF o DPO. El hecho de que la prueba del autor se ejecute como completado en bruto, sin plantilla de chat, es coherente con un modelo base preentrenado y no con un modelo instruido. La única "innovación" atribuible a este repositorio es la disponibilidad de pesos GGUF para inferencia local; el mérito técnico del modelo es de los autores originales.

## Capacidades

- Generación de texto en portugués: completado de texto libre a partir de un prefijo (la prueba oficial usa el prefijo «A capital do Brasil é»).
- Modelo base: no está ajustado para seguir instrucciones ni para mantener conversaciones con plantilla de chat.
- No consta soporte de tool calling ni de function calling.
- No consta soporte de agentes ni de razonamiento multi-paso explícito.
- Multilingüe: no documentado; el único idioma declarado es el portugués.
- Sin capacidades de visión, audio ni modo de razonamiento extendido (no constan).
- Inferencia local mediante llama.cpp: ejecución en CPU, GPU o modo mixto, y compatibilidad con servidores derivados que exponen endpoints tipo OpenAI (etiqueta `endpoints_compatible`).
- Tres perfiles de precisión/tamaño (Q4_K_M, Q8_0, F16) para ajustar el equilibrio calidad/memoria.

## Casos de uso

- Completado y autocompletado editorial en portugués: dado un prefijo, el modelo continúa el texto; útil para borradores y sugerencias en herramientas de redacción, asumiendo revisión humana por su tendencia al error factual.
- Inferencia en dispositivos de borde sin GPU: con 387 MB en Q4_K_M cabe en Raspberry Pi, portátiles modestos y entornos sin acelerador, lo que permite demos y prototipos offline en portugués.
- Punto de partida para ajuste fino ligero: al ser un modelo base de 630 M, sirve para fine-tuning de tareas concretas (clasificación, extracción de entidades, resumen de dominios acotados) con presupuesto de cómputo reducido.
- Generación de datos sintéticos a pequeña escala en portugués para aumentación de corpus, con filtrado posterior obligatorio.
- Cálculo de perplejidad y puntuación de calidad en pipelines de datos en portugués: permite ordenar o filtrar documentos antes de usarlos en el entrenamiento de modelos mayores.
- Pruebas de humo de infraestructura: modelo de coste mínimo para validar despliegues de llama.cpp, contenedores, endpoints compatibles con OpenAI y flujos de CI/CD antes de pasar a modelos mayores.
- Docencia e investigación en PLN para portugués: experimentos reproducibles en hardware de consumo, incluida la comparación entre niveles de cuantización.
- Evaluación del impacto de la cuantización: comparar Q4_K_M, Q8_0 y F16 sobre el mismo prompt permite medir la degradación introducida por la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio indica explícitamente que no se ejecutó ninguna evaluación sobre los archivos cuantizados y remite a la model card del modelo original para las evaluaciones de los autores.

| Prueba | Resultado |
|---|---|
| Benchmarks del modelo original (MMLU, HumanEval, GSM8K, etc.) | no incluidos en este repositorio; remiten al modelo base |
| Benchmarks de los archivos cuantizados | no se ejecutó ninguno |
| Smoke test Q4_K_M (48 tokens, temperatura 0) | carga correctamente y produce texto en portugués, con errores factuales |
| Smoke test Q8_0 (48 tokens, temperatura 0) | carga correctamente y produce texto en portugués, con errores factuales |
| Latencia y throughput | no disponibles (no medidos) |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~0,39 GB en Q4_K_M, ~0,67 GB en Q8_0 y ~1,26 GB en F16; con caché KV y overhead del runtime, prever del orden de 0,5-0,7 GB, 0,8-1,0 GB y 1,5 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090); no requiere A100 ni H100, que quedarían completamente sobredimensionadas.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en iGPU con memoria compartida.
- CPU: viable en x86_64 y ARM; el propio autor generó los archivos en un equipo Linux x86_64 sin GPU.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-server`), llama-cpp-python, Ollama (importando el GGUF), LM Studio y otros frontends compatibles con GGUF. vLLM y TGI no están orientados a este formato en este repositorio; para ellos habría que partir de los pesos originales en safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guicybercode/Tucano-630m-GGUF (este repositorio) | 630 M | no disponible | GGUF (Q4_K_M, Q8_0, F16) | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| TucanoBR/Tucano-630m (modelo base) | 630 M | no disponible | no indicado (el dato de parámetros procede de safetensors) | Apache-2.0 | HuggingFace (organización TucanoBR) |
| Otras alternativas de ~600 M en portugués | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento que permitan una comparación cuantitativa con modelos de la misma categoría; la comparación anterior se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Riesgo alto de alucinación factual: en la propia prueba del autor (Q4_K_M, temperatura 0) la respuesta al prefijo «A capital do Brasil é» deriva en un texto incorrecto que menciona «12 das 15 maiores cidades dos Estados Unidos» y no identifica Brasilia; la variante Q8_0 también produce afirmaciones falsas. No debe usarse como fuente de datos sin verificación.
- Modelo base, no instruido: no espera plantilla de chat ni sigue instrucciones de forma fiable; requiere ajuste o ingeniería de prompts específica.
- Sin evaluación de las cuantizaciones: no hay benchmarks que cuantifiquen la pérdida de calidad de Q4_K_M y Q8_0 frente a F16.
- Cobertura lingüística limitada al portugués; no se documenta comportamiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en entradas largas ni planificar casos de uso que dependan de ventanas amplias.
- Capacidad limitada por tamaño: con 630 M de parámetros, el conocimiento enciclopédico, el razonamiento y las matemáticas son intrínsecamente débiles; no es adecuado para tareas que exijan precisión factual o lógica compleja.
- Repositorio de terceros con escasa validación: 0 descargas y 0 likes, sin revisión comunitaria; el mantenimiento depende de un único autor y no hay garantía de actualizaciones.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y la atribución a los autores originales de TucanoBR; este repositorio es solo una conversión de formato.
- En producción, conviene fijar la versión exacta del archivo GGUF y la versión de llama.cpp, ya que cambios en el runtime pueden alterar la salida.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/guicybercode/Tucano-630m-GGUF
- Modelo base original: https://huggingface.co/TucanoBR/Tucano-630m
- Paper de Tucano (arXiv:2411.07854): https://arxiv.org/abs/2411.07854
- llama.cpp (herramienta de conversión y cuantización): https://github.com/ggml-org/llama.cpp
