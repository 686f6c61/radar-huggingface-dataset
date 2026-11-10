# jersobh/qwen2.5-1.5b-crop-pathology-merged16b

## Resumen

`jersobh/qwen2.5-1.5b-crop-pathology-merged16b` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B, desarrollado por el usuario jersobh y publicado en Hugging Face bajo licencia Apache 2.0. Segun el nombre del repositorio, el ajuste esta orientado a patologia de cultivos (crop pathology), aunque la model card no documenta el dataset de entrenamiento ni la tarea concreta. El modelo parte de la version cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`) y se ha fusionado posteriormente, dando como resultado pesos en safetensors con 1.543.714.304 parametros.

Tecnicamente es un transformer decoder-only de la familia Qwen2, con 1.500 millones de parametros, entrenado originalmente por Alibaba sobre un corpus multilingue amplio y ajustado aqui mediante las herramientas de Unsloth y TRL para acelerar el entrenamiento. El contexto nativo de la familia Qwen2.5-1.5B es de 32.768 tokens, aunque el autor no lo especifica en la model card. El modelo declara unicamente el idioma ingles.

Su relevancia es limitada: se trata de una publicacion de fine-tuning con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica detallada ni resultados de evaluacion. Resulta util como ejemplo de flujo de trabajo con Unsloth para especializar modelos pequenos en dominios concretos, pero no es un modelo recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (32.768 tokens en Qwen2.5-1.5B base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base de partida era bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 1,5 mil millones de parametros. Parte de `unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`, una version del Qwen2.5-1.5B oficial de Alibaba cuantizada en 4 bits para reducir los requisitos de memoria durante el entrenamiento. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, con un entrenamiento "2x mas rapido" gracias a las optimizaciones de Unsloth. El resultado se ha fusionado (merged) en pesos completos en safetensors.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de patologia de cultivos, la presencia de RLHF/DPO ni de innovaciones tecnicas adicionales mas alla del uso de Unsloth. La model card es practicamente generica y se limita a declarar el modelo base y la licencia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen2.5-1.5B base.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo original.
- Generacion de codigo y matematicas a nivel de un modelo de 1,5 B (sin datos de evaluacion especificos de este ajuste).
- Soporte de tool calling y function calling: no documentado en la model card, aunque el modelo base Qwen2.5 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base es multilingue.
- Capacidad especial: presunta especializacion en patologia de cultivos por el nombre del repositorio, no documentada ni verificada.

## Casos de uso

- Clasificacion y descripcion de sintomas en cultivos: el modelo podria emplearse para generar descripciones textuales de enfermedades a partir de notas de campo, aunque no dispone de vision y requiere que la entrada sea texto.
- Asistente de consultas agronomicas en ingles: respuestas conversacionales sobre diagnosticos y tratamientos, con la advertencia de que la especializacion no esta documentada ni evaluada.
- Prototipado de pipelines de fine-tuning con Unsloth: sirve como referencia de flujo de trabajo para especializar modelos de 1,5 B en dominios verticales con recursos limitados.
- Generacion de informes tecnicos breves: redaccion de resumenes de observaciones de campo en ingles, dado el bajo coste computacional del modelo.
- Despliegue en entornos con recursos muy limitados: al tener 1,5 B de parametros, cabe en GPUs de consumo y en CPU con cuantizacion, lo que permite experimentacion local.
- Base para nuevos ajustes: punto de partida para fine-tunings adicionales en dominios agricolas o de ciencias de plantas, siempre con datos propios y evaluacion.
- Filtrado o etiquetado asistido de textos agronomicos: preprocesamiento de corpus en ingles relacionados con fitopatologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 4-5 GB en total).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4): aproximadamente 1 GB para pesos, 2-3 GB en total con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias pero validas para despliegue por lotes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6 GB o mas, y en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama (previa conversion a GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jersobh/qwen2.5-1.5b-crop-pathology-merged16b | 1,5 B | no disponible (32.768 en base) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sin documentar ni evaluar |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Version ajustada para instrucciones, evaluada |
| unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face | Version cuantizada para entrenamiento, base de este ajuste |

## Limitaciones y advertencias

- La model card no documenta el dataset, el proceso de entrenamiento ni la tarea concreta; la especializacion en patologia de cultivos solo se deduce del nombre del repositorio.
- No hay resultados de benchmarks ni evaluacion cualitativa publicada; el rendimiento real es desconocido.
- Riesgo de alucinacion inherente a un modelo de 1,5 B, especialmente en un dominio tecnico como la fitopatologia, donde los errores pueden tener consecuencias practicas.
- Sesgos desconocidos: no se ha documentado la composicion del corpus de ajuste ni posibles sesgos de dominio o idioma.
- Idioma limitado al ingles segun la model card; el uso en castellano no esta garantizado ni evaluado.
- El contexto real del ajuste no esta especificado; aunque el modelo base soporta 32.768 tokens, el ajuste podria haberlo reducido.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su uso en produccion sin validacion propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- El nombre del repositorio incluye "merged16b", lo que puede inducir a confusion sobre el tamano real (1,5 B de parametros).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/qwen2.5-1.5b-crop-pathology-merged16b
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit
- Qwen2.5-1.5B oficial: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
