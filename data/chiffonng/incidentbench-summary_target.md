# chiffonng/incidentbench-summary_target

## Resumen

incidentbench-summary_target es un adaptador LoRA de rango 16 desarrollado por el usuario chiffonng sobre el modelo base Qwen2.5-7B-Instruct. Forma parte de IncidentBench, un banco de pruebas para la clasificacion conjunta de incidentes de riesgo segun las siete categorias del MIT (detection y categoria se extraen de una unica respuesta generada). El adaptador responde a una variante concreta del problema: se entrena con un resumen de evidencia escrito por IA como objetivo de salida (primero el resumen, despues la respuesta), sin que dicho resumen este presente en el momento de la prueba.

El modelo es un artefacto de investigacion, no un producto listo para produccion. Las etiquetas de entrenamiento son "silver" (generadas por modelo bajo la guia de anotacion del proyecto), no oro humano, y el propio autor advierte de que infravalora los incidentes (under-calls) y de que no debe usarse para tomar decisiones sobre sistemas reales. Su relevancia es metodologica: permite estudiar como influye el formato de la evidencia y el tipo de etiqueta en la clasificacion de riesgos con modelos de lenguaje.

La arquitectura subyacente es la de Qwen2.5-7B-Instruct (transformer denso de 7,6 mil millones de parametros con 128 000 tokens de contexto) mas el adaptador LoRA. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors mediante la libreria PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-7B-Instruct) + adaptador LoRA de rango 16 |
| Parametros totales | 7,6 mil millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se sirve sin fusionar; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero el adaptador no declara idiomas) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sin fusionar sobre Qwen2.5-7B-Instruct, un transformer denso con atencion por ventanas deslizantes y contexto largo. El LoRA tiene rango 16 y se entrena con transformers 5.9.0 y peft 0.19.1. La tarea es una clasificacion conjunta de siete dominios de riesgo del MIT mas la clase "No incident (potential only)", donde tanto la deteccion como la categoria se leen de una unica respuesta generada por el modelo.

La variante concreta ("summary_target") usa como objetivo de salida un resumen de evidencia escrito por IA seguido de la respuesta, sin que el resumen este disponible en el momento de la prueba. Las etiquetas de entrenamiento son generadas por modelo ("silver") bajo la guia de anotacion del proyecto, no anotaciones humanas de referencia. El prompt de entrenamiento se genera con la transformacion `orig` de `train/build_data.py`; los detalles de formato, filas de entrenamiento y hashes estan en `data_manifest.json`, y la receta de entrenamiento en `train_manifest.json`. Se recomienda decodificacion greedy.

## Capacidades

- Clasificacion de incidentes de riesgo en siete dominios MIT mas la clase "No incident (potential only)".
- Deteccion y categorizacion conjuntas a partir de una unica respuesta generada.
- Generacion de un resumen de evidencia previo a la respuesta (solo en la variante de entrenamiento; no se usa en prueba).
- Razonamiento y generacion de texto generales heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling heredado del base (no validado especificamente para este adaptador).
- Capacidades multilingues heredadas del base (no declaradas ni evaluadas para el adaptador).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre clasificacion de riesgos: permite reproducir el brazo "summary_target" de IncidentBench y comparar el efecto de usar resumenes generados por IA como objetivo de salida frente a otras variantes del banco de pruebas.
- Estudio de etiquetas silver: sirve para analizar como afecta el entrenamiento con etiquetas generadas por modelo (frente a oro humano) en tareas de deteccion de incidentes.
- Analisis de sesgo de infravaloracion: al conocer que el adaptador tiende a no declarar incidentes, puede usarse para medir y documentar ese modo de fallo en pipelines de evaluacion.
- Prototipado de clasificadores de riesgo en entornos controlados: con vLLM y `--enable-lora --max-lora-rank 16`, se puede desplegar junto al base para experimentar con prompts y decodificacion greedy.
- Docencia y divulgacion: ejemplo didactico de adaptador PEFT de bajo rango sobre un modelo de 7B para una tarea de clasificacion supervisada.
- Evaluacion de robustez de LLM: permite estudiar la sensibilidad del modelo a la presencia o ausencia del resumen de evidencia en el prompt.
- No es adecuado para decisiones sobre sistemas reales, tal como advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al informe de IncidentBench para las puntuaciones y los modos de fallo conocidos (incluida la infravaloracion de incidentes).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base de 7,6 mil millones de parametros en FP16 requiere aproximadamente 15 GB de VRAM; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 5 GB. Estas cifras corresponden al base y no han sido verificadas para el adaptador.
- GPU recomendadas: no especificadas. Por tamano del base, una A100 40 GB, H100 80 GB o RTX 4090 24 GB son suficientes en FP16; GPU consumer de 8-12 GB requeririan cuantizacion.
- Cabe en GPU consumer: probablemente si, con cuantizacion del base (no confirmado).
- Opciones de despliegue: vLLM con soporte LoRA, segun el comando del autor: `vllm serve Qwen/Qwen2.5-7B-Instruct --enable-lora --max-lora-rank 16 --lora-modules summary_target=chiffonng/incidentbench-summary_target`. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| incidentbench-summary_target | 7,6 B (base) + LoRA r=16 | 128 000 | Clasificacion de incidentes MIT (variante summary_target) | other | HuggingFace (10 descargas) |
| Qwen2.5-7B-Instruct | 7,6 B | 128 000 | Proposito general | Apache 2.0 (segun el modelo base) | HuggingFace |
| Otros brazos de IncidentBench | no disponible | no disponible | Variantes del mismo banco de pruebas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Etiquetas de entrenamiento "silver" generadas por modelo, no oro humano: el rendimiento puede no reflejar la calidad de una anotacion humana.
- Infravaloracion conocida de incidentes (under-calls), documentada por el autor en el informe de IncidentBench.
- Artefacto de investigacion: el autor prohibe explicitamente su uso para decisiones sobre sistemas reales.
- Licencia "other": no se especifican los terminos exactos; es necesario consultar al autor antes de cualquier uso comercial.
- Idiomas soportados no declarados; el adaptador no ha sido evaluado mas alla del ingles del banco de pruebas.
- El adaptador se sirve sin fusionar sobre el base; requiere infraestructura con soporte LoRA (vLLM configurado con `--max-lora-rank 16`).
- Decodificacion greedy recomendada; otros ajustes de muestreo pueden alterar los resultados.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas para este adaptador.
- Sesgos: no documentados en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/chiffonng/incidentbench-summary_target
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de IncidentBench: no disponible como enlace en la informacion proporcionada
- Repositorio del proyecto (referencias a `data_manifest.json`, `train_manifest.json`, `train/build_data.py`): no disponible como enlace
