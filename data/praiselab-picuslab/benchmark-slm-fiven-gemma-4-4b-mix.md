# praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-mix

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-mix` es un adaptador LoRA publicado por el grupo de investigacion PRAISE (PICUS Lab, Departamento de Ingenieria Electrica y Tecnologias de la Informacion, Universidad de Napoles Federico II) sobre el modelo base `google/gemma-4-E4B-it` de Google DeepMind. Por los tags del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-mix`, `or2`) se trata de un artefacto experimental dentro de una campana de evaluacion de modelos de lenguaje pequenos (SLM), no de un modelo de proposito general listo para produccion.

El repositorio pesa 0,1 GB, coherente con un adaptador PEFT en safetensors y no con un modelo completo. El acceso esta restringido (gated): requiere aceptar condiciones en HuggingFace. La licencia no aparece indicada en los metadatos y el unico idioma declarado es el italiano (`it`), aunque el modelo base Gemma 4 es multilingue.

Su relevancia es acotada y de caracter metodologico: sirve para reproducir o auditar un punto concreto de un benchmark de SLM (variante de mezcla de estrategias sobre el dataset FIVEN), no para desplegarse como asistente final. No se han publicado resultados de benchmarks, ficha de modelo ni hiperparametros de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `google/gemma-4-E4B-it`; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB); el modelo base pertenece a la familia Gemma 4, variante E4B |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No documentados para el adaptador; se distribuye en safetensors. Cualquier cuantizacion requeriria fusionar el LoRA con el modelo base y convertir a formatos como GGUF/AWQ/GPTQ, sin receta publicada |
| Idiomas soportados | Italiano (`it`) segun los metadatos del repositorio; no se documentan otros |
| Licencia | No disponible; el acceso es restringido y la licencia del modelo base Gemma 4 no se detalla en la informacion proporcionada |
| Formato de pesos | Safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) entrenado con PEFT sobre `google/gemma-4-E4B-it`, el modelo de la familia Gemma 4 de Google DeepMind lanzada el 2 de abril de 2026. El tag `strategy-mix` sugiere que el adaptador forma parte de una comparativa de estrategias de ajuste (posiblemente mezcla de datos o de configuraciones de entrenamiento) sobre el dataset identificado como `dataset-fiven`, dentro de una iniciativa denominada `benchmark-slm`. El tag `or2` no tiene explicacion publica en la informacion disponible.

No se han publicado en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, si hubo fases de RLHF/DPO ni ninguna innovacion tecnica asociada. Tampoco se documenta si el adaptador se entreno solo para evaluacion zero-shot o si incluye ajuste instruccional adicional sobre el base `-it`.

## Capacidades

- Generacion de texto conversacional en italiano, heredada del modelo base instruido y especializada por el ajuste LoRA, segun los tags `text-generation`, `conversational` e `it`.
- Participacion en pipelines de evaluacion de SLM: el modelo esta etiquetado como `benchmark-slm`, por lo que su funcion principal es servir como punto de medida comparable dentro de un harness de benchmarking.
- Ajuste fino eficiente en parametros: al ser un adaptador LoRA, puede cargarse y descartarse sin modificar los pesos del modelo base, lo que facilita experimentos A/B sobre una misma infraestructura.
- Capacidades del modelo base Gemma 4 (razonamiento, codigo, matematicas, tool calling, agentes): no verificadas ni documentadas para este adaptador concreto; no deben asumirse como preservadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de benchmarking: cargar el adaptador sobre `gemma-4-E4B-it` con PEFT y ejecutar el mismo harness que el resto de variantes del proyecto `benchmark-slm` para comparar la estrategia `mix` frente a las demas.
- Auditoria metodologica de un paper o informe: el repositorio permite inspeccionar los pesos del adaptador y verificar que la configuracion LoRA descrita coincide con la publicada, algo habitual en revisiones de resultados de SLM.
- Evaluacion de estrategias de mezcla de datos: al estar etiquetado con `dataset-fiven` y `strategy-mix`, sirve para aislar el efecto de una receta de mezcla concreta manteniendo fijo el modelo base.
- Asistente conversacional en italiano para prototipado: con acceso aceptado, el adaptador puede montarse sobre el base para pruebas de calidad linguistica en italiano antes de invertir en un ajuste completo.
- Estudio de degradacion por ajuste: comparar las respuestas del base `gemma-4-E4B-it` frente al adaptador sobre el mismo conjunto de prompts permite medir cuanto se especializa y cuanto se pierde en el resto de dominios.
- Docencia e investigacion en PEFT: el tamano reducido del repositorio (0,1 GB) y el formato estandar LoRA lo hacen util como ejemplo practico de carga, fusion y evaluacion de adaptadores en cursos o talleres.
- Base para un ajuste posterior: el adaptador puede servir como inicializacion en una segunda fase de entrenamiento especifica de dominio, siempre que la licencia del base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,1 GB); el coste real de inferencia lo determina el modelo base `google/gemma-4-E4B-it`, cuyos pesos deben descargarse aparte.
- VRAM estimada (estimacion a partir de la escala ~4B de la variante E4B, no dato publicado): FP16 en torno a 8-10 GB; INT8 en torno a 4-6 GB; INT4 en torno a 2,5-3,5 GB. Cifras orientativas, pendientes de confirmar con los pesos reales del base.
- GPU de datacenter: A100 (40/80 GB), H100 o L40S para servir en FP16/BF16 con margen para contexto largo y batching.
- GPU consumer: previsiblemente viable en RTX 4090 (24 GB) en FP16, y en RTX 3090/4080 o inferiores tras cuantizacion a 8 o 4 bits, condicionado al tamano efectivo final del base.
- Opciones de despliegue: `peft` + `transformers` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en servido multi-adaptador; llama.cpp/Ollama solo tras fusionar y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo ni de latencia por peticion en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-mix` | Adaptador LoRA sobre base E4B (tamano no disponible) | No disponible | Sin benchmarks publicados | No disponible | Gated, 0 descargas, 0 likes |
| `google/gemma-4-E4B-it` (modelo base) | Variante E4B de la familia Gemma 4 | No disponible en la informacion | No disponible en la informacion | La de Gemma 4 (no detallada aqui) | Publico en HuggingFace |
| Gemma 4 31B dense (familia) | 31 000 M | No disponible en la informacion | No disponible en la informacion | La de Gemma 4 | Publico, abril de 2026 |
| Gemma 4 12B Unified (familia) | 11 950 M | No disponible en la informacion | No disponible en la informacion | La de Gemma 4 | Publico, junio de 2026 |
| Gemma 4 2B edge (familia) | 2 000 M | No disponible en la informacion | No disponible en la informacion | La de Gemma 4 | Publico, abril de 2026 |

No se dispone de datos para comparar rendimiento frente a otros adaptadores del mismo proyecto `benchmark-slm`; la coleccion existe en HuggingFace pero no se aportan metricas en la informacion recibida.

## Limitaciones y advertencias

- Ausencia total de ficha de modelo: no hay README, hiperparametros, composicion del dataset ni intencion declarada, lo que impide evaluar sesgos o calidad de forma informada.
- Acceso restringido: requiere aceptar condiciones en HuggingFace; la automatizacion de descargas en CI necesita un token con permiso aceptado.
- Licencia no declarada: no se puede asumir uso comercial permitido. Cualquier despliegue en produccion exige verificar la licencia del modelo base Gemma 4 y las condiciones del autor del adaptador.
- Riesgo de alucinacion: no evaluado. Al ser un ajuste especifico sobre un dataset de benchmark, puede degradar el comportamiento del base fuera de la distribucion de entrenamiento.
- Cobertura linguistica declarada unicamente en italiano: el rendimiento en castellano, catalan, gallego o euskera no esta documentado y no deberia darse por bueno.
- Sin datos de contexto: se desconoce si el adaptador modifica la ventana de contexto del base; asumir la del base sin verificar puede provocar truncamientos silenciosos.
- Cero adopcion (0 descargas, 0 likes) y fecha de publicacion muy reciente: no hay evidencia de la comunidad sobre su comportamiento real.
- Trazabilidad limitada del tag `or2`: su significado no esta explicado, lo que dificulta interpretar a que variante del benchmark corresponde.
- No es un modelo autónomo: sin el base `google/gemma-4-E4B-it` los pesos del adaptador son inutilizables; el coste y los requisitos reales son los del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-mix
- Organizacion en HuggingFace: https://huggingface.co/praiselab-picuslab
- Datasets de la organizacion: https://huggingface.co/praiselab-picuslab/datasets
- Coleccion de modelos etiquetados `benchmark-slm`: https://huggingface.co/models?other=benchmark-slm
- Organizacion en GitHub (PRAISELab-PicusLab): https://github.com/PRAISELab-PicusLab
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Analisis de Gemma 4 y sus variantes (tech-insider.org): https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/
