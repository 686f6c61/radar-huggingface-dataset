# CTlandu/csci680-a1-t5-ft-pt

# CTlandu/csci680-a1-t5-ft-pt

## Resumen

`CTlandu/csci680-a1-t5-ft-pt` es un modelo T5-small (arquitectura encoder-decoder, 60.506.624 parámetros) ajustado por el usuario CTlandu para dos tareas de revisión automática de código, definidas en el trabajo de Tufano et al. (ICSE 2022): generar un método revisado a partir del código original más un comentario de revisión (`code&comment2code`) y generar un comentario de revisión a partir de un método (`code2comment`). Ambos comportamientos se integran en un único modelo mediante prefijos de tarea en la entrada, en lugar de entrenar dos modelos separados.

Se trata de la "condición B" de la asignación CSCI 680, que parte de un checkpoint propio preentrenado (`CTlandu/csci680-a1-t5-small-pretrained`) y se compara con la "condición A" (`CTlandu/csci680-a1-t5-ft-nopt`), que usa la misma receta de ajuste fino pero distinta inicialización. El ajuste se realizó sobre 100.000 pares durante 100.000 pasos con AdamW a 3e-4 y bf16, seleccionando el checkpoint final por exact match en validación.

Su relevancia es fundamentalmente académica y de investigación: es un artefacto reproducible de un curso universitario, con resultados de test publicados, y sirve como referencia de línea base (muy débil) para tareas de code review. No es un modelo apto para producción: su exact match es del 4,46% en generación de código revisado y del 0,08% en generación de comentarios, y su CodeBLEU (80,7) queda por debajo del de una copia trivial de la entrada (81,9).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), text2text-generation |
| Parámetros totales | 60.506.624 (según safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (T5 usa embeddings posicionales relativos; el límite habitual de la familia es 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin variantes GGUF, int8 ni int4 |
| Idiomas soportados | `code` y `en` (inglés); el corpus de ajuste es de métodos Java según el tag `java` |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Arquitectura T5 estándar (encoder-decoder con atención completa y embeddings posicionales relativos), en tamaño small, con 60,5 M de parámetros y 0,2 GB de repositorio. El modelo parte de `CTlandu/csci680-a1-t5-small-pretrained`, un checkpoint preentrenado por el propio autor cuya receta de preentrenamiento no se detalla en la información disponible. Sobre esa inicialización se aplicó un ajuste fino multitarea con prefijos textuales: `code&comment2code: <code>... <START> ... <END> ...</code><technical_language>reviewer comment</technical_language>` produce el método revisado, y `code2comment: <method>` produce el comentario del revisor.

El entrenamiento usó 100.000 pares en el mismo orden que la condición A, 100.000 pasos con batch de 32, AdamW con learning rate 3e-4 y precisión bf16. El checkpoint se seleccionó por exact match en el conjunto de validación, con desempate por similitud, y el elegido fue el paso 100.000 (es decir, el final del entrenamiento). No se documenta uso de RLHF, DPO ni decodificación especulativa; la evaluación se hizo con decodificación greedy. Los datos proceden de Tufano et al. (ICSE 2022), publicados en Zenodo con DOI 10.5281/zenodo.5387856 bajo licencia CC BY 4.0, en el subconjunto preparado para el curso.

## Capacidades

- Generación de código a partir de código más un comentario de revisión, devolviendo el método completo revisado (tarea `code&comment2code`).
- Generación de comentarios de revisión en inglés a partir de un método Java (tarea `code2comment`).
- Enrutado de tarea mediante prefijos en la entrada, lo que permite servir ambas funciones con un único conjunto de pesos.
- Generación texto-a-texto genérica heredada del backbone T5-small.
- Comprensión limitada de código Java; no hay evidencia de soporte para otros lenguajes en la información disponible.
- No dispone de tool calling, function calling, modo agente, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada a inglés (comentarios) y código; no se documentan otros idiomas naturales.

## Casos de uso

- Reproducción docente de la asignación CSCI 680: el modelo permite repetir el experimento de la condición B y compararlo con la condición A (`CTlandu/csci680-a1-t5-ft-nopt`) usando exactamente la misma receta, mismo orden de datos y mismos pasos.
- Línea base inferior en investigación sobre code review automatizado: con un exact match del 4,46% y del 0,08%, sirve como suelo de referencia frente a modelos mayores tipo CodeT5 o LLMs de código, y permite cuantificar la mejora atribuible al escalado.
- Estudio de atajos y comportamiento de copia: dado que el 63,5% de las predicciones incorrectas de `code&comment2code` son copias literales de la entrada, el modelo es útil para analizar cómo los modelos pequeños explotan la identidad entrada-salida en lugar de aprender la transformación.
- Prototipado rápido de un servicio de sugerencias de revisión en local: al ocupar unos 121 MB en bf16, se puede desplegar en un contenedor pequeño o en CPU para validar la interfaz, el formato de entrada y el enrutado por prefijos antes de sustituir el modelo por uno mayor.
- Generación de datos sintéticos con filtrado humano obligatorio: los comentarios generados pueden usarse como candidatos para aumentar un corpus de revisión, pero requieren revisión manual dado el BLEU-4 de 0,97 y las 4 coincidencias exactas sobre 5.000 casos.
- Ablaciones sobre el corpus de Tufano et al.: permite medir el efecto de la inicialización preentrenada frente al ajuste directo, manteniendo constantes datos, orden y número de pasos.
- Inicialización para destilación o ajuste posterior en entornos con pocos recursos: su tamaño reducido facilita experimentos de ajuste en una única GPU consumer o en CPU, antes de transferir conclusiones a modelos mayores.
- Pruebas de integración de pipelines de inferencia: útil como modelo de juguete para validar el soporte de T5 encoder-decoder en vLLM o TGI, incluyendo batching y plantillas de prompt con prefijos.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 5.000 ejemplos por tarea con decodificación greedy:

| Tarea | Métrica | Resultado |
|---|---|---|
| `code&comment2code` | Exact match | 223 (4,46%) |
| `code&comment2code` | CodeBLEU | 80,7 |
| `code2comment` | Exact match | 4 (0,08%) |
| `code2comment` | BLEU-4 | 0,97 |
| Referencia: copiar la entrada sin cambios | CodeBLEU | 81,9 |
| Referencia: copiar la entrada sin cambios | Exact match | 0 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K ni métricas de code review de terceros) en la información disponible. El propio autor señala que la copia trivial de la entrada supera al modelo en CodeBLEU, lo que sitúa el rendimiento por debajo de la línea base no paramétrica en esa métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 242 MB en fp32, 121 MB en fp16/bf16 y 60 MB en int8 para los pesos, más el overhead de activaciones (no publicado; para secuencias de 512 tokens y batch pequeño el total se mantiene por debajo de 1 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve; GTX 1650, RTX 3050, RTX 4090, A100 y H100 funcionan sobradamente, pero el modelo está limitado por latencia, no por memoria.
- Cabe en GPU consumer y también en CPU: es viable la inferencia en un portátil o en un contenedor sin acelerador.
- Opciones de despliegue: `transformers` (ruta nativa), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM (soporta arquitecturas encoder-decoder T5) y exportación a ONNX. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían una conversión propia y no están garantizados para esta arquitectura.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTlandu/csci680-a1-t5-ft-pt | 60,5 M | No disponible | Code review (2 tareas, multitarea con prefijos) | No disponible | HuggingFace, 0 descargas, 0 likes |
| CTlandu/csci680-a1-t5-ft-nopt (condición A) | ~60,5 M (no confirmado) | No disponible | Code review (misma receta, distinta inicialización) | No disponible | HuggingFace |
| CTlandu/csci680-a1-t5-small-pretrained | ~60,5 M (no confirmado) | No disponible | Backbone T5 preentrenado por el autor | No disponible | HuggingFace |
| google-t5/t5-small | 60,5 M | 512 tokens | Texto a texto general | Apache 2.0 | HuggingFace |
| Salesforce/codet5-small | ~60 M | 512 tokens | Tareas de código (CodeSearchNet) | Apache 2.0 | HuggingFace |

Las filas de `t5-small` y `codet5-small` se basan en las model cards públicas de esos modelos y no en la información proporcionada para este modelo; no se dispone de una comparación de rendimiento directa entre ellos y `csci680-a1-t5-ft-pt`. La ventaja diferencial de este checkpoint no es el rendimiento, sino la trazabilidad experimental: métricas publicadas, receta reproducible y una condición de control (condición A) con los mismos datos y pasos.

## Limitaciones y advertencias

- Rendimiento muy bajo: exact match del 4,46% en `code&comment2code` y del 0,08% en `code2comment`; la generación de comentarios es prácticamente inutilizable (4 aciertos exactos sobre 5.000).
- No supera la línea base trivial: copiar la entrada alcanza CodeBLEU 81,9 frente a 80,7 del modelo.
- Fuerte sesgo de copia: el 63,5% de las predicciones incorrectas de `code&comment2code` son copias literales de la entrada, lo que indica que el modelo no ha aprendido la transformación solicitada.
- Licencia no disponible: no se puede asumir permiso de uso comercial, modificación o redistribución de los pesos; es imprescindible contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Los datos de ajuste (Zenodo 10.5281/zenodo.5387856) están bajo CC BY 4.0, lo que exige atribución si se redistribuyen derivados del corpus.
- Cobertura lingüística restringida a inglés y código Java; no hay evidencia de generalización a otros lenguajes de programación ni a otros idiomas naturales.
- Longitud de contexto no documentada: los métodos largos pueden truncarse y degradar aún más la salida.
- Sin ajuste de seguridad ni de alineación (no hay RLHF/DPO documentado); puede reproducir sesgos presentes en el corpus de revisiones reales, incluidos tonos o formulaciones descorteses.
- Riesgo alto de alucinación estructural: puede devolver métodos sintácticamente inválidos o con código inventado no presente en la entrada.
- Es un artefacto de curso, con 0 descargas y 0 likes; no hay mantenimiento, versionado ni soporte documentado.
- No debe desplegarse en producción sin una evaluación propia sobre el dominio objetivo y sin revisión humana de las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt
- Modelo base preentrenado: https://huggingface.co/CTlandu/csci680-a1-t5-small-pretrained
- Condición A (sin preentrenamiento del autor): https://huggingface.co/CTlandu/csci680-a1-t5-ft-nopt
- Dataset de Tufano et al. (CC BY 4.0), Zenodo: https://doi.org/10.5281/zenodo.5387856
- Código del experimento, repositorio del curso: `aura-lab-wm/teaching-genai4se-2026-jtang05` (referenciado en la model card)
- Resultados de búsqueda web: no se han encontrado enlaces específicos sobre este modelo; las búsquedas devolvieron repositorios de terceros y directorios genéricos de modelos (https://github.com/tejalnair1/CSCI680_Homework, https://opensourceaimodels.net/, https://models.dev/, https://ai-tldr.dev/) sin relación directa con este checkpoint.
