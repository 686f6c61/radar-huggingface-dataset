# redmars-01/cm-annotator-zh

## Resumen

CM-Annotator (Chinese) es un adaptador LoRA publicado por el usuario redmars-01 sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su función es anotar oraciones en chino con tramos de metáfora conceptual siguiendo la tradición de Lakoff y Johnson, restringiendo la salida a un inventario cerrado de 215 entradas derivado de la Master Metaphor List (Lakoff et al., 1991). El modelo devuelve JSON estricto con campos como `has_metaphor`, `metaphor_spans`, `cm_id`, `cm_name`, `source_domain`, `target_domain`, `conventionality` y `confidence`.

El adaptador resuelve un problema muy concreto en lingüística computacional: la anotación estructurada y reproducible de metáforas conceptuales en corpus chinos, una tarea que normalmente requiere anotadores humanos formados en semántica cognitiva. Al fijar un inventario cerrado y una salida JSON, facilita la integración en pipelines de anotación y en la construcción de corpus paralelos.

Es relevante ahora por su enfoque de destilación con etiquetas plateadas (silver labels) generadas por un profesor local (qwen3.6-35b-a3b) con autoconstencia k=2, y por su transparencia poco habitual: el autor publica métricas de evaluación dev contra silver y advierte explícitamente de que las etiquetas no son oro humano. El rendimiento medido es muy bajo (F1 de span de 0,0364), por lo que debe considerarse un prototipo de investigación más que una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (modelo base Qwen2.5-1.5B-Instruct; el adaptador LoRA añade un número no especificado de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh); el corpus de entrenamiento es mayoritariamente en escritura simplificada |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 montado sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El entrenamiento emplea pérdida solo sobre la completación (completion-only loss), semilla 42, y se realizó el 7 de noviembre de 2026. El adaptador se carga con la librería PEFT junto al modelo base.

Los datos de entrenamiento son etiquetas plateadas destiladas de un profesor local (qwen3.6-35b-a3b) con autoconstencia k=2: solo se conservan las etiquetas en las que ambas muestras coinciden. Aproximadamente el 30 % de los ejemplos de entrenamiento son negativos sin metáfora (Null-CM). Los datos derivan del UM-Corpus (CC BY-NC-ND), por lo que no se redistribuyen y deben reproducirse mediante el pipeline del repositorio. El autor advierte explícitamente de que las etiquetas plateadas no son anotaciones oro humanas.

## Capacidades

- Anotación de tramos de metáfora conceptual en oraciones chinas con salida JSON estricta.
- Clasificación binaria de presencia de metáfora (`has_metaphor`).
- Asignación de identificador y nombre de metáfora conceptual dentro de un inventario cerrado de 215 entradas basado en la Master Metaphor List.
- Etiquetado de dominio origen y dominio destino de cada metáfora.
- Anotación de convencionalidad y confianza por tramo.
- Manejo de negativos: oraciones sin metáfora devuelven lista de tramos vacía.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Construcción de corpus anotados de metáfora conceptual en chino: el modelo genera anotaciones estructuradas en JSON que pueden validarse y corregirse posteriormente por lingüistas, reduciendo el coste de la anotación manual inicial.
- Investigación en lingüística cognitiva computacional: permite aplicar el marco de Lakoff y Johnson a gran escala sobre textos chinos y comparar la distribución de metáforas entre dominios.
- Creación de corpus paralelos: el inventario cerrado y los identificadores `cm_id` facilitan el alineamiento de metáforas entre lenguas cuando se combina con anotadores equivalentes en otros idiomas.
- Preanotación asistida para anotadores humanos: el modelo sirve como primera pasada en herramientas de anotación, con revisión humana posterior, dado su bajo recall y precisión medidos.
- Filtrado y análisis de estilo en textos literarios o periodísticos: detección de presencia de metáfora conceptual para estudios de estilo o de evolución diacrónica.
- Docencia y prototipado en semántica cognitiva: ejemplo reproducible de destilación de etiquetas y de evaluación de un anotador lingüístico especializado.
- Integración en pipelines de procesamiento de lenguaje natural en chino: la salida JSON estricta permite encadenar el anotador con etapas posteriores de análisis sin postprocesado complejo.

## Benchmarks y rendimiento

Evaluación en dev contra etiquetas plateadas, decodificación greedy, n=100:

| Metrica | Valor |
|---|---|
| Tasa de JSON valido | 1,0 |
| Precision de span | 0,0357 |
| Recall de span | 0,037 |
| F1 de span | 0,0364 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base de 1.500 millones de parámetros en precisión de 16 bits requiere aproximadamente 3 GB de VRAM, más el adaptador LoRA, que es de tamaño reducido.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM debería poder ejecutar el modelo base en FP16; no se especifican GPU de datacenter en la información proporcionada.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; el autor indica que los prompts deben construirse exactamente como en `service/inference.py` (reglas de sistema, bloque INVENTORY y SENTENCE).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CM-Annotator (Chinese) | Base 1.5B + LoRA | No disponible | Anotación de metáfora conceptual en chino | MIT | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | No disponible en esta ficha | Modelo generalista de instrucciones | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas en anotación de metáfora | No disponible | No disponible | Anotación lingüística | No disponible | No disponible |

No se dispone de información sobre otros anotadores de metáfora conceptual comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Precisión y recall de span muy bajos (F1 de 0,0364 en dev contra silver), lo que limita seriamente su uso sin revisión humana.
- Las etiquetas de entrenamiento son plateadas, destiladas de un profesor, no oro humano; la calidad del anotador está acotada por la del profesor.
- El recall es conservador en metáforas convencionales, según el propio autor.
- La confianza por tramo no está calibrada.
- El corpus chino es mayoritariamente en escritura simplificada, lo que puede afectar al rendimiento en textos tradicionales.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado de forma específica; la tasa de JSON válido es 1,0, pero la corrección semántica de las anotaciones es baja.
- Restricciones de licencia: el adaptador es MIT, pero los datos de entrenamiento derivan del UM-Corpus (CC BY-NC-ND), lo que puede condicionar el uso comercial del modelo entrenado; conviene revisar esta interacción antes de desplegarlo en producción.
- Los datos de entrenamiento no se redistribuyen; la reproducibilidad depende del pipeline del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/redmars-01/cm-annotator-zh
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de entrenamiento: `docs/TRAINING.md` (referenciada en la model card, sin URL pública en la información disponible)
- Script de inferencia: `service/inference.py` (referenciado en la model card, sin URL pública en la información disponible)
