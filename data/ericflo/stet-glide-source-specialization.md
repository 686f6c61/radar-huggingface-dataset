# ericflo/stet-glide-source-specialization

## Resumen

Stet GLiDE Source Specialization es un adaptador LoRA de rango 8 acompañado de una cabeza de clasificación (passage head) que puntúa ventanas de texto fuente según su similitud con el tipo de escritura que resultó beneficiosa en el proceso de curación de datos del proyecto Stet. Lo desarrolla el usuario ericflo sobre el modelo base fastino/GLiDE-0.4B, un encoder de 0,4 mil millones de parámetros de Fastino. El adaptador se inicializó desde la revisión concreta `6bda7ab91aeb36dcad6d27828a8871e548c7fc71` del encoder base sin modificar.

El problema que resuelve es específico del pipeline de curación de datos: dado un fragmento de texto, estimar si procede de una fuente cuyo contenido se parece al que aportó ganancias de entrenamiento en Stet. Para ello se entrenó contra diferencias de pérdida de siguiente token entre estudiantes entrenados con páginas crudas y con páginas curadas, usando dos pares de estudiantes independientes como fuentes de etiquetas. No es un modelo generativo ni un chat: es un ranker de selección de fuentes.

La relevancia es acotada y experimental. El repositorio tiene cero descargas y cero likes en el momento de la consulta, el tamaño del repo es de 0,0 GB y la validación end-to-end del pipeline Stet está pendiente según la propia model card. Los resultados publicados son métricas de selección de fuente basadas en profesor (teacher-based), no evaluaciones de calidad final del modelo entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (GLiDE-0.4B) con adaptador LoRA de rango 8 y cabeza de clasificación `LayoutHead` |
| Parámetros totales | No disponible (modelo base de 0,4B; el adaptador LoRA de rango 8 añade una fracción no especificada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 128 tokens de entrada GLiDE para el scoring; ventanas de entrenamiento de 96 tokens Stet |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés, ruso, español, alemán, francés y chino (idiomas presentes en el conjunto de entrenamiento) |
| Licencia | fastino-community (license_name: fastino-community, license_link: LICENSE) |
| Formato de pesos | safetensors (adaptador PEFT en `adapter/` y `page-head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina un encoder GLiDE-0.4B congelado o parcialmente adaptado mediante un LoRA de rango 8 y una cabeza de clasificación separada (`LayoutHead`, definida en `layout_model.py`). El scoring se realiza como `head(embed(encoder, tokens))` con right-padding y un máximo de 128 tokens de entrada GLiDE. El adaptador se inicializó desde la revisión fijada del encoder base y se entrena junto con la cabeza; la model card reporta tanto la variante con encoder congelado y cabeza entrenada como la variante con LoRA y cabeza entrenados.

Los objetivos de entrenamiento son diferencias de pérdida de siguiente token entre estudiantes entrenados con páginas crudas y con páginas curadas. Dos pares de estudiantes entrenados de forma independiente proporcionaron las etiquetas. El fine-tune utilizó 960 ventanas de fuente en inglés, ruso, español, alemán, francés y chino, con 240 ventanas de desarrollo y 660 de test, y particiones disjuntas por host. Se excluyeron las URLs exactas de ambos corpus de profesor y todo el texto procedente de páginas públicas de práctica de entrenamiento de Stet. Las ventanas de fuente de entrenamiento fueron de 96 tokens Stet.

## Capacidades

- Puntuación de ventanas de texto fuente según su similitud con el tipo de escritura que benefició a la curación de datos de Stet.
- Ranking de fragmentos: las puntuaciones son comparables directamente dentro de un mismo idioma, según la model card.
- Cobertura multilingüe limitada a los seis idiomas del entrenamiento: inglés, ruso, español, alemán, francés y chino.
- Clasificación a nivel de pasaje mediante una cabeza dedicada (`LayoutHead`) sobre embeddings del encoder.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo de pensamiento. Es un modelo de decisión/ranking, no un modelo generativo de propósito general.

## Casos de uso

- Curación de corpus de entrenamiento: puntuar páginas candidatas antes de incluirlas en un dataset de preentrenamiento, priorizando las que se parecen a las fuentes que aportaron ganancias en Stet. El scoring opera sobre ventanas de hasta 128 tokens, por lo que se aplica por fragmento.
- Filtrado de datos multilingüe: usar el ranker para ordenar pasajes en inglés, ruso, español, alemán, francés o chino dentro de un pipeline de limpieza de datos, comparando puntuaciones solo dentro del mismo idioma.
- Investigación en data curation: replicar o contrastar la metodología de etiquetas basadas en diferencias de pérdida entre estudiantes crudos y curados, usando el adaptador como referencia entrenada.
- Detección de fuentes de baja calidad: descartar ventanas cuya puntuación quede por debajo de un umbral calibrado por idioma, como paso previo a un deduplicado o a un filtrado por heurísticas.
- Construcción de conjuntos de validación: seleccionar pasajes representativos del estilo de escritura beneficioso para evaluar otros rankers o curators.
- Baseline para comparación de rankers: contrastar un modelo neuronal de 0,4B con adaptador frente al baseline de árboles impulsados publicado por el mismo autor (`ericflo/stet-source-specialization-ranker`).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre las 330 ventanas de test de páginas que el curador de referencia omitió, con medias macro dentro de cada idioma. El "top-quarter lift" se expresa en bits por token respecto a la media del idioma correspondiente.

| Modelo | Correlación de Spearman | Top-quarter lift profesor A | Top-quarter lift profesor B |
|---|---:|---:|---:|
| GLiDE congelado con cabeza entrenada | 0,695 | 0,356 | 0,364 |
| GLiDE con LoRA y cabeza entrenados | 0,698 | 0,403 | 0,414 |
| Baseline de árboles impulsados ligero | 0,667 | 0,377 | 0,421 |

Estas métricas son de selección de fuente basadas en profesor; la model card indica que las pruebas end-to-end de Stet están pendientes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El modelo base es de 0,4B parámetros, por lo que en fp16 ocuparía del orden de 0,8 GB solo en pesos, más el adaptador LoRA y la cabeza; en cuantización de 4 bits cabría holgadamente en GPUs de consumo, aunque no se publican cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder ejecutar el encoder; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,4B del encoder, aunque no se confirma en la documentación.
- Opciones de despliegue: carga mediante `transformers.AutoModel` desde la revisión fijada del base y aplicación del adaptador PEFT desde `adapter/`; la cabeza se carga desde `page-head.safetensors` en `LayoutHead` de `layout_model.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Spearman) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stet GLiDE Source Specialization (LoRA + cabeza) | 0,4B base + LoRA r8 | 128 tokens de entrada | 0,698 | fastino-community | Hugging Face (0 descargas) |
| Stet Source Specialization Ranker (árboles impulsados) | No disponible | No disponible | 0,667 | No disponible | Hugging Face (`ericflo/stet-source-specialization-ranker`) |
| fastino/GLiDE-0.4B (base) | 0,4B | No disponible | No aplica (encoder base) | No disponible | Hugging Face |

No se dispone de comparación con otros rankers de curación de datos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Las puntuaciones solo son comparables directamente dentro de un mismo idioma; no se garantiza una escala común entre lenguas.
- El modelo está entrenado exclusivamente sobre texto de páginas públicas de práctica de entrenamiento de Stet; puede generalizar mal a dominios o estilos alejados de ese corpus.
- La validación end-to-end del pipeline Stet está pendiente según la model card; las métricas publicadas son de selección de fuente basadas en profesor.
- La entrada para el scoring está limitada a 128 tokens GLiDE y las ventanas de entrenamiento fueron de 96 tokens Stet; no está pensado para documentos largos sin troceado.
- La licencia es `fastino-community` (license_name y license_link apuntan a `LICENSE`), lo que puede imponer restricciones al uso comercial; conviene revisar el texto completo antes de producción.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez; al ser un ranker y no un generador, el riesgo de alucinación se traduce en puntuaciones mal calibradas más que en texto inventado.
- El repositorio no tiene descargas ni likes y el tamaño reportado es de 0,0 GB, lo que sugiere un artefacto experimental sin validación externa.
- No se especifican requisitos de cuantización ni formatos GGUF, por lo que el despliegue fuera de PEFT/transformers no está soportado de forma documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericflo/stet-glide-source-specialization
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Baseline de árboles impulsados: https://huggingface.co/ericflo/stet-source-specialization-ranker
