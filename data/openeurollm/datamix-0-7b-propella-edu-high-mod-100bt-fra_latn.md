# openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn

## Resumen

El modelo `openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn` es un modelo de lenguaje de 0,7 mil millones de parametros entrenado desde cero por el proyecto OpenEuroLLM. Se trata de un checkpoint de investigacion centrado exclusivamente en frances, entrenado sobre 100 mil millones de tokens del corpus HPLT 4, filtrados mediante el clasificador Propella-1 con etiqueta de contenido educativo "Moderate" o "High".

La relevancia de este modelo no reside en su rendimiento bruto, sino en su papel como pieza de un estudio de ablacion sobre mezclas de datos (data mixing) para lenguas europeas. El identificador del repositorio codifica las decisiones de diseno: 0.7B de parametros, filtro Propella educativo alto/moderado, 100B tokens de entrenamiento y variante linguistica `fra_Latn` (frances en escritura latina). Esto lo convierte en un artefacto util para investigar como afecta el filtrado de calidad a las curvas de escalado en lenguas de recursos medios.

El modelo se publica con licencia Apache 2.0 y pesos en formato safetensors, con un repositorio de 13,4 GB, lo que sugiere la presencia de pesos en precision completa o varios checkpoints intermedios. No se dispone de informacion publica sobre arquitectura detallada, benchmarks ni pipeline de inferencia en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido por el tipo de modelo, no confirmado) |
| Parametros totales | 0,7B (700 millones, segun nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion publica solo indica que el modelo se entrena "from scratch" con 0,7B de parametros sobre 100B tokens del corpus HPLT 4 en frances, filtrado con el clasificador Propella-1 bajo las etiquetas "Educational" = "Moderate" o "High". No se detalla la arquitectura interna (numero de capas, dimension del modelo, cabezas de atencion, uso de RoPE, normalizacion, etc.), ni la composicion exacta del dataset mas alla del filtro educativo, ni si se aplicaron fases de RLHF, DPO o SFT posteriores al preentrenamiento.

El elemento diferenciador es el pipeline de curacion de datos: HPLT 4 es un corpus web multilingue de gran escala, y el filtro Propella-1 actua como clasificador de calidad educativa. Al restringir el entrenamiento a documentos con clasificacion "Moderate" o "High", el modelo prioriza texto con valor formativo sobre contenido web generico. El sufijo `fra_Latn` confirma que se trabaja exclusivamente con frances en escritura latina, sin mezcla multilingue. No se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o mezclas de expertos.

## Capacidades

- Generacion de texto en frances: el modelo esta entrenado exclusivamente con datos en frances, por lo que su capacidad generativa se limita a ese idioma.
- Modelado de lenguaje y continuacion de texto: al ser un checkpoint de preentrenamiento (presumiblemente sin ajuste instruccional), su comportamiento esperado es el de un modelo base.
- Razonamiento y conocimiento factual: no disponible; no se han publicado evaluaciones.
- Generacion de codigo: no disponible; no hay evidencia de inclusion de datos de codigo en el entrenamiento.
- Matematicas: no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingue: no; solo frances segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre mezclas de datos: el modelo sirve como punto de comparacion en estudios de ablacion para medir el efecto del filtrado educativo Propella-1 frente a corpus sin filtrar, manteniendo constantes el tamano (0,7B) y los tokens (100B).
- Experimentos de escalado en lenguas europeas: util para analizar curvas de escalado en frances con presupuestos de computo reducidos, dado su tamano manejable.
- Generacion de texto en frances para prototipos: adecuado para tareas de continuacion de texto o generacion basica en frances cuando se dispone de hardware limitado.
- Fine-tuning especifico de dominio en frances: al ser un modelo base de 0,7B, puede ajustarse para tareas concretas (clasificacion, resumen, extraccion) con requisitos de VRAM moderados.
- Evaluacion de calidad de corpus: permite medir de forma empirica si el filtro Propella-1 "Moderate/High" produce mejores representaciones que filtros alternativos, comparando perplejidad en dominios educativos.
- Reproducibilidad de pipelines OpenEuroLLM: sirve como referencia para replicar el proceso de entrenamiento desde cero en otras lenguas europeas con el mismo esquema de filtrado.
- Educacion e investigacion academica: su licencia Apache 2.0 y tamano permiten su uso en entornos docentes y laboratorios sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,7B de parametros, en FP16 se requieren aproximadamente 1,4 GB solo para pesos; en FP32, unos 2,8 GB; en cuantizacion de 8 bits, alrededor de 0,7 GB; en 4 bits, unos 0,4 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso GPUs integradas con suficiente memoria compartida pueden ejecutar el modelo en cuantizacion.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 4-6 GB de VRAM efectiva.
- Opciones de despliegue: al publicarse en safetensors sin variantes GGUF documentadas, seria necesario convertir los pesos para usarlos con llama.cpp u Ollama; para vLLM o TGI se puede servir directamente si la arquitectura es compatible (no confirmado).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn | 0,7B | no disponible | fr | Apache 2.0 | Entrenado desde cero sobre 100B tokens de HPLT 4 filtrado |
| Qwen2.5-0.5B | 0,5B | 32K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | Modelo base e instructivo ampliamente evaluado |
| SmolLM2-360M | 0,36B | 8K (segun documentacion publica) | mayoritariamente ingles | Apache 2.0 | Entrenado sobre datos curados de alta calidad |
| Gemma-2-2B | 2B | 8K (segun documentacion publica) | multilingue | Gemma license | Mayor capacidad, requiere mas VRAM |

La comparacion con estos modelos es orientativa: no existen evaluaciones publicadas del modelo de OpenEuroLLM que permitan una comparacion cuantitativa directa. La diferencia clave es que este checkpoint esta especializado exclusivamente en frances y su proposito es la investigacion sobre filtrado de datos, no el uso como asistente general.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre HPLT 4 (corpus web), puede heredar sesgos presentes en contenido web frances, agravados o atenuados por el filtro educativo Propella-1, cuyo comportamiento sesgado no se documenta.
- Riesgo de alucinacion: no evaluado; al ser un modelo base de 0,7B, la generacion de hechos inventados es esperable y no se ha medido.
- Limitaciones de contexto o idioma: solo frances; no se documenta la longitud de contexto soportada, lo que impide garantizar el manejo de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (HPLT 4, contenido web) puede implicar obligaciones adicionales segun la jurisdiccion.
- Caveats para produccion: no hay informacion sobre ajuste instruccional, plantillas de chat ni evaluaciones de seguridad; no se recomienda su uso directo en produccion sin fine-tuning y evaluacion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El tamano del repositorio (13,4 GB) es desproporcionado para un modelo de 0,7B en FP16 (que ocuparia ~1,4 GB), lo que sugiere pesos en FP32 o multiples checkpoints; conviene verificar el contenido antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-fra_Latn
- Proyecto OpenEuroLLM: no disponible en la informacion proporcionada
- Paper de Propella-1: no disponible en la informacion proporcionada
- Documentacion de HPLT 4: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
