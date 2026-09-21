# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-1-dili-best

## Resumen

Intern-S1-mini context-conditioned molecule transfer V10.3.1 — DILI es un ajuste fino del modelo jiosephlee/Intern-S1-mini-lm publicado por el usuario jiosephlee en HuggingFace. El checkpoint corresponde a la mejor validacion de una ejecucion de "transferencia de moleculas condicionada por contexto" sobre el dominio de lesión hepática inducida por fármacos (DILI, drug-induced liver injury), segun indica la propia model card. El repositorio pesa 16,4 GB e incluye pesos en safetensors y ficheros de tokenizer, con 8.201.221.120 parametros (aproximadamente 8,2 mil millones).

El modelo resuelve una tarea de quimioinformatica: dado un contexto, transferir o emparejar moleculas, evaluandose con metricas de recuperacion (Macro-F1@5, NDCG@5, Precision@5 y Spearman) sobre 402 consultas de validacion y 402 de test. No es un modelo de propósito general: es un artefacto de investigacion muy especializado, con 0 descargas y 0 likes en el momento de la consulta, y sin licencia ni idiomas declarados.

Su relevancia es acotada y experimental. No se detalla en la informacion disponible la longitud de contexto, los idiomas soportados ni la licencia, por lo que su uso en produccion requiere verificar estos extremos con el autor. La model card documenta la procedencia exacta del ajuste (revisiones del modelo base y del dataset, semilla, esquema de entrenamiento y metrica de seleccion), lo que facilita la reproducibilidad del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3` en HuggingFace; el modelo base declarado es `jiosephlee/Intern-S1-mini-lm`) |
| Parametros totales | 8.201.221.120 (aproximadamente 8,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se ofrecen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna mas alla de la etiqueta `qwen3` presente en HuggingFace y del campo `library_name: transformers`. El modelo base declarado es `jiosephlee/Intern-S1-mini-lm`, en la revision `fcb667c380ae01f57693a45b4b5c2d331052a107`. El checkpoint se distribuye como un modelo estandar de Transformers con pesos safetensors y tokenizer, por lo que es cargable con la libreria `transformers`.

El ajuste se realizo sobre el dataset `jiosephlee/context-conditioned-molecule-transfer-v10.3.1-dili-mixed-canonical-intern` (revision `7d3bd8802dcf257fc2cb04b5ccbe58f523f4467f`), con un esquema de 10 epocas y un tope de 350 pasos, semilla 42 y funcion de perdida de objetivos suaves (soft-target loss). El entrenamiento se pauso tras el paso 219 y el checkpoint seleccionado corresponde al paso de optimizador 140. La metrica de seleccion fue `knn_binary_macro_f1_at_5` sobre validacion. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por contexto en el dominio quimico (la etiqueta de pipeline es `text-generation`).
- Transferencia de moleculas condicionada por contexto (`context-conditioned-molecule-transfer`) y transferencia de ensayos (`assay-transfer`).
- Tarea aplicada a lesión hepática inducida por fármacos (DILI): el checkpoint se seleccionó dentro de una ejecucion especifica de este subdominio.
- Evaluacion mediante metricas de recuperacion/ranking (Macro-F1@5, NDCG@5, Precision@5 y correlacion de Spearman), lo que sugiere un uso orientado a ordenar o emparejar candidatos mas que a la generacion libre.
- Soporte de conversacion: la etiqueta `conversational` aparece en HuggingFace, aunque no se detallan capacidades conversacionales concretas.
- Compatibilidad declarada con text-generation-inference y con endpoints (`text-generation-inference`, `endpoints_compatible`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Cribado de candidatos en descubrimiento de farmacos: el modelo puede emplearse para ordenar moleculas candidatas en funcion de un contexto dado, apoyandose en la metrica de Precision@5 documentada (0,6275 en test) para priorizar los cinco primeros candidatos.
- Evaluacion de riesgo DILI en fases tempranas: dado que el checkpoint se entreno especificamente sobre un dataset de lesión hepática inducida por fármacos, puede usarse como componente de un pipeline interno que marque compuestos con posible hepatotoxicidad antes de ensayos costosos.
- Transferencia de ensayos entre contextos: la etiqueta `assay-transfer` indica que el modelo esta pensado para extrapolar resultados de ensayos entre condiciones experimentales, util en laboratorios que necesitan reutilizar datos historicos.
- Recuperacion de moleculas similares condicionada por contexto: con NDCG@5 de 0,6324 en test, puede integrarse en un sistema de busqueda o recomendacion de compuestos dentro de una base de datos quimica.
- Investigacion reproducible en modelado molecular: al documentarse revisiones exactas, semilla y metricas de seleccion, sirve como punto de partida para experimentos academicos comparables.
- Prototipado de pipelines de quimioinformatica con TGI: la compatibilidad declarada con text-generation-inference permite desplegarlo detras de una API compatible con endpoints para pruebas internas.
- Analisis de correlacion estructural: la metrica de Spearman (0,2626 en test) sugiere un uso mas exploratorio que definitivo, adecuado para generar hipotesis que luego se validen experimentalmente.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Split | Consultas | Macro-F1@5 | NDCG@5 | Precision@5 | Spearman |
|---|---:|---:|---:|---:|---:|
| Validacion | 402 | 0,6270 | 0,6247 | 0,6159 | 0,2681 |
| Test | 402 | 0,6144 | 0,6324 | 0,6275 | 0,2626 |

No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estandar de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia con 8,2 B parametros: aproximadamente 16,4 GB en FP16/BF16, unos 8,2 GB en INT8 y unos 4,1 GB en INT4 (estimaciones a partir del numero de parametros, no confirmadas en la model card).
- GPU recomendadas: para FP16/BF16 se requiere una GPU con al menos 24 GB (por ejemplo, RTX 4090, A100 40 GB, H100); para cuantizacion INT8 bastarian 12-16 GB; en INT4 podria caber en GPU de consumo con 8 GB o mas.
- Cabe en GPU de consumo: previsiblemente si, en formato cuantizado; en FP16 necesitaria al menos 24 GB de VRAM, por lo que estaria al limite en una RTX 4090.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`, `endpoints_compatible`) y, previa conversion manual, llama.cpp u Ollama. No se publican pesos GGUF, AWQ ni GPTQ en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La comparacion mas directa disponible es con su propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| intern-s1-mini-context-conditioned-molecule-transfer-v10-3-1-dili-best | 8,2 B | no disponible | no disponible | safetensors en HuggingFace, 0 descargas |
| jiosephlee/Intern-S1-mini-lm (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos comparables de quimioinformatica o de ~8 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo generativo de 8,2 B ajustado sobre un dataset acotado, puede producir salidas quimicamente invalidas o sin respaldo experimental.
- Ambito muy restringido: el ajuste se realizo sobre un unico dataset de transferencia de moleculas condicionada por contexto en el dominio DILI, por lo que su comportamiento fuera de ese dominio no esta caracterizado.
- Correlacion de Spearman baja (0,2626 en test): indica un alineamiento debil con el orden esperado, lo que limita su uso como ranking fiable.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan declarados, lo que impide garantizar su comportamiento en conversaciones largas o en castellano.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Metricas de validacion: la seleccion del checkpoint se hizo sobre 402 consultas de validacion, un tamano de muestra reducido que puede inflar la varianza de las metricas.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (21 de septiembre de 2026), sin evidencia de uso o validacion por terceros.
- Entrenamiento incompleto: el autor indica que el entrenamiento se pauso tras el paso 219 de un tope de 350, por lo que el modelo podria no haber convergido del todo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-3-1-dili-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.3.1-dili-mixed-canonical-intern
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/406tcnb2
- Paper, blog, repositorio o demo adicionales: no disponible (los resultados de busqueda web proporcionados no guardan relacion con el modelo).
