# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF es la versión cuantizada en formato GGUF del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT, desarrollado por Reaperdoesntrun bajo el sello de Convergent Intelligence LLC (Research Division). Se trata de un modelo de 1.700 millones de parámetros (2.031.739.904 exactos según los pesos en safetensors) construido en dos etapas sobre Qwen/Qwen3-1.7B: primero una destilación de conocimiento desde Qwen3-30B-A3B-Instruct-2507 sobre razonamiento STEM, y después un ajuste supervisado (SFT) sobre datos legales. El objetivo es empaquetar capacidad de derivación estructurada y razonamiento jurídico en un modelo lo bastante pequeño para ejecutarse en dispositivos de borde e incluso en un teléfono.

La propuesta técnica central es la destilación "DISC-informed": 6.122 muestras de cadena de pensamiento STEM extraídas de 12 conjuntos de datos, entrenadas con entropía cruzada ponderada por prueba (factor 2,5x con decaimiento a 1,5x sobre los tokens de derivación) y divergencia KL a temperatura 2.0. El énfasis está en premiar el proceso de derivación por encima de la coincidencia con la respuesta final. La segunda etapa añade instrucciones y conocimiento legal mediante el dataset Alignment-Lab-AI/Lawyer-Instruct.

El resultado es relevante por su relación capacidad/tamaño: un modelo de 1,7B que ocupa entre 1,2 GB (Q4_K_M) y 3,8 GB (F16) y que apunta a dominios concretos (física, ecuaciones diferenciales, razonamiento legal) donde los modelos pequeños suelen fallar. No es un modelo de propósito general y su propio autor advierte de límites duros en dominios poco representados. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B); no se especifica variante concreta en la información disponible |
| Parámetros totales | 2.031.739.904 |
| Parámetros activos | No aplica (no es MoE; el profesor sí es MoE, el alumno no) |
| Longitud de contexto | No disponible explícitamente; los ejemplos de uso emplean n_ctx=1024 |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Modelo base | Qwen/Qwen3-1.7B |
| Modelo profesor | Qwen/Qwen3-30B-A3B-Instruct-2507 |
| Tamaño del repositorio | 9,0 GB |
| Descargas | 3.748 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7B parámetros que parte de Qwen/Qwen3-1.7B. El entrenamiento se organiza en dos etapas documentadas. La primera es una destilación de conocimiento desde Qwen3-30B-A3B-Instruct-2507 (un modelo MoE de 30B totales y 3B activos) sobre 6.122 muestras de cadena de pensamiento STEM procedentes de 12 conjuntos de datos atribuidos a 0xZee. La función de pérdida combina entropía cruzada ponderada por prueba —con peso 2,5x que decae a 1,5x sobre los tokens de derivación— y divergencia KL a temperatura 2.0. El diseño busca que el alumno reproduzca el proceso de razonamiento y no solo la respuesta final.

La segunda etapa es un ajuste supervisado sobre Alignment-Lab-AI/Lawyer-Instruct, que añade seguimiento de instrucciones y conocimiento del dominio legal sobre la base de razonamiento STEM. El autor describe el enfoque como "DISC-informed", con referencias a un marco matemático propio (operador de discrepancia y descomposición BV) documentado en la model card del modelo fuente, no en esta variante GGUF. La cuantización no altera los pesos entrenados: los patrones estructurales aprendidos se conservan en los archivos GGUF, según afirma el autor. No se detallan hiperparámetros de la etapa SFT en la información disponible.

## Capacidades

- Generación de texto con razonamiento paso a paso y cadenas de pensamiento explícitas.
- Razonamiento matemático y derivaciones estructuradas (énfasis declarado en física y ecuaciones diferenciales).
- Razonamiento legal y seguimiento de instrucciones en el dominio jurídico (tras la etapa SFT).
- Soporte de dos formatos de prompt diferenciados: uno para derivación STEM ("Problem: ... Proof:") y otro para instrucciones ("### Instruction: ... ### Response:").
- Generación en inglés únicamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado más allá de la cadena de pensamiento interna.
- No se documenta capacidad de visión, audio ni modo "thinking" separado.

## Casos de uso

- Tutoría de física y matemáticas en el dispositivo: el modelo puede generar derivaciones paso a paso de problemas de mecánica o ecuaciones diferenciales en un teléfono con la cuantización Q4_K_M (1,2 GB), sin conexión a red, adecuado para aplicaciones educativas offline.
- Asistente legal de primera línea: tras el SFT sobre Lawyer-Instruct, puede responder preguntas sobre doctrinas como promissory estoppel o res judicata y producir explicaciones estructuradas; útil como borrador que un profesional revisa, nunca como sustituto del asesoramiento jurídico.
- Generación de explicaciones técnicas en documentación: con el formato "### Instruction:", puede redactar explicaciones de conceptos STEM para manuales o bases de conocimiento internas, con temperatura 0.0 para reducir variabilidad.
- Preprocesado de razonamiento en pipelines de borde: al caber en 1,2-1,4 GB, puede integrarse en dispositivos con poca VRAM o RAM para clasificar y desarrollar problemas antes de enviarlos a un modelo mayor.
- Prototipado rápido de asistentes especializados: la licencia Apache 2.0 y el formato GGUF permiten experimentar con ajustes posteriores o integraciones en llama.cpp, Ollama y LM Studio sin coste de licencia.
- Filtrado y verificación de derivaciones: puede usarse para generar una derivación de referencia que después se compara con la salida de otro sistema, aprovechando su sesgo hacia el proceso y no solo hacia la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,4 GB con Q5_K_M, 2,1 GB con Q8_0 y 3,8 GB con F16 (tamaños de archivo declarados por el autor; el consumo real añade overhead del contexto KV).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar las cuantizaciones Q4/Q5; una RTX 4090 o A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales con 4 GB o más; también en CPU y en dispositivos móviles con Q4_K_M.
- Opciones de despliegue: llama.cpp (CLI y bindings de Python), Ollama (mediante Modelfile), LM Studio; el autor recomienda Q5_K_M para escritorio y Q4_K_M para móvil/borde.
- Latencia y throughput: no disponibles. Los ejemplos de la model card usan n_ctx=1024 y max_tokens=512, lo que sugiere ventanas de contexto modestas en el uso previsto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF (este) | 2,03B | No disponible (ejemplos con 1024) | Apache 2.0 | GGUF | Destilado STEM + SFT legal, solo inglés |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en la información | Apache 2.0 | Safetensors/GGUF | Modelo generalista original, sin destilación ni SFT legal |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales / 3B activos | No disponible en la información | No disponible en la información | Safetensors | MoE instructor; mucho mayor, no apto para borde |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a tamaño, licencia y formato.

## Limitaciones y advertencias

- Es un modelo de 1,7B: puede producir derivaciones fluidas pero incorrectas; el propio autor lo advierte y exige verificación independiente.
- No sustituye la verificación formal de pruebas, el asesoramiento legal profesional ni el análisis de ingeniería.
- Rendimiento más débil en dominios poco representados en el entrenamiento, como biología molecular y fisiología.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La longitud de contexto no está especificada y los ejemplos usan 1024 tokens, lo que limita conversaciones largas y documentos extensos.
- Riesgo de alucinación en contenido legal: la salida puede ser plausible pero jurídicamente errónea.
- No se documentan evaluaciones de sesgo; al derivar de Qwen3 y de datos legales, puede heredar sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad o adecuación de las salidas.
- El marco matemático "DISC" citado por el autor no está validado de forma independiente en la información disponible; conviene tratarlo como afirmación del desarrollador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo fuente (safetensors): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Convergent Intelligence LLC: https://convergentintel.com
- Modelo relacionado (sin SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
