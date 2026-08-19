# jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bbb-martins-best-knn-mae5

## Resumen

El modelo `jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bbb-martins-best-knn-mae5` es un checkpoint de un fine-tuning específico para transferencia de propiedades moleculares (assay transfer) sobre la base de `Intern-S1-mini`, un modelo de lenguaje multimodal científico desarrollado por el equipo InternLM. Este checkpoint concreto se seleccionó como el mejor de una ejecución de 25 épocas con un límite de grado 16 (ocho pares entrantes y ocho salientes por molécula), optimizando la métrica de validación KNN MAE@5.

El modelo está diseñado para tareas de predicción y transferencia de propiedades en ensayos químicos, utilizando un enfoque de ranking basado en vecinos más cercanos (KNN). Con 8.201.221.120 parámetros (8,2 mil millones), es un modelo de gran tamaño que requiere recursos considerables para su inferencia. El repositorio contiene los pesos en formato safetensors y los archivos de tokenizer, listos para usar con la biblioteca Transformers.

La relevancia de este modelo radica en su aplicación potencial en química computacional y descubrimiento de fármacos, donde la transferencia de propiedades entre ensayos puede acelerar la evaluación de compuestos. Sin embargo, se trata de un modelo experimental con documentación mínima y sin licencia especificada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Intern-S1-mini (derivado de Qwen3, transformer) |
| Parametros totales | 8.201.221.120 (8,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a `Intern-S1-mini`, un modelo de lenguaje multimodal científico basado en Qwen3, según los tags del repositorio. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención) en la información disponible.

El entrenamiento de este checkpoint fue un fine-tuning para assay transfer con las siguientes características: dataset `jiosephlee/molecule-property-transfer-v1.3-bbb-martins-vote-mean-intern`, límite de grado 16 (8 pares entrantes y 8 salientes por molécula), 25 épocas, tasa de aprendizaje 2e-5, batch size 32, acumulación de gradiente 1, empaquetado de secuencias activado y validación de ranking cada 10 pasos. La selección del mejor checkpoint se realizó mediante la métrica de validación KNN MAE@5, obteniendo un valor de 0.407694, mientras que el conjunto de test retenido arrojó un KNN MAE@5 de 0.662046.

No se mencionan técnicas como RLHF o DPO, ni innovaciones arquitectónicas específicas. El enfoque parece ser un ajuste fino supervisado estándar sobre un modelo preentrenado, con una tarea de ranking molecular.

## Capacidades

- Transferencia de propiedades moleculares entre ensayos (assay transfer), basada en un enfoque de ranking con vecinos más cercanos (KNN).
- Predicción de propiedades fisicoquímicas o bioquímicas de moléculas, aunque no se detalla la naturaleza exacta de las propiedades.
- Generación de representaciones o embeddings moleculares que permiten comparar y clasificar compuestos.
- Soporte de tokenizer para procesamiento de texto, heredado de la base Qwen3/Intern-S1-mini, lo que sugiere capacidades lingüísticas generales.
- No se confirma soporte de tool calling, agentes, visión o multimodalidad en este checkpoint específico, aunque la base Intern-S1-mini es multimodal.

## Casos de uso

- Selección de compuestos candidatos en química medicinal: el modelo puede ordenar moléculas según su similitud de propiedades con compuestos de referencia, ayudando a priorizar candidatos para ensayos biológicos.
- Transferencia de resultados entre ensayos: cuando un ensayo tiene datos limitados, el modelo puede transferir conocimiento de ensayos relacionados para estimar propiedades no medidas, reduciendo costes experimentales.
- Filtrado virtual de librerías químicas: dado un conjunto de moléculas, el modelo puede clasificarlas por su probabilidad de superar un umbral de propiedad, permitiendo descartar compuestos no prometedores antes de la síntesis.
- Análisis de relaciones estructura-actividad (SAR): al generar rankings basados en KNN, se pueden identificar grupos de moléculas con comportamientos similares, facilitando el diseño de análogos.
- Integración en pipelines de descubrimiento de fármacos: el modelo puede usarse como módulo de predicción en flujos automatizados que combinan generación molecular y evaluación de propiedades.
- Investigación académica en aprendizaje automático aplicado a química: sirve como punto de partida para estudiar técnicas de transferencia de aprendizaje y ranking en dominios moleculares.

## Benchmarks y rendimiento

La información disponible solo incluye la métrica de selección del modelo:

| Metrica | Valor |
|---|---|
| KNN MAE@5 (validacion) | 0.407694 |
| KNN MAE@5 (test retenido) | 0.662046 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 8,2 mil millones de parametros, la inferencia en precision FP16 requiere aproximadamente 16,4 GB de VRAM (2 bytes por parametro). Con cuantizacion a 4 bits, la carga se reduce a unos 4,1 GB, pero no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L40S) es adecuada. Para cuantizacion, una RTX 3090 o 4090 de 24 GB podria ser suficiente si se aplica cuantizacion externa.
- No se dispone de informacion sobre latencia o throughput estimados.
- Opciones de despliegue: al ser un modelo de Transformers con pesos safetensors, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversion). No hay configuraciones predefinidas en el repositorio.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directamente en la informacion proporcionada. El modelo es un checkpoint experimental especifico para transferencia de propiedades moleculares, y no existen datos de rendimiento frente a alternativas como modelos de grafos moleculares (p. ej., ChemBERTa, MolFormer) o modelos de lenguaje generales fine-tuneados para quimica.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin autorizacion explicita del autor.
- La documentacion es minima: no hay informacion sobre sesgos, alucinaciones o limitaciones de contexto.
- El modelo fue entrenado para una tarea muy concreta (assay transfer con ranking KNN) y puede no generalizar a otros tipos de prediccion molecular.
- La diferencia entre el error de validacion (0.4077) y el de test (0.6620) sugiere posible sobreajuste o una distribucion diferente en el conjunto de test, lo que debe tenerse en cuenta.
- No se proporcionan instrucciones de uso, ni ejemplos de codigo, ni configuracion de prompt.
- El modelo se basa en Intern-S1-mini, pero no se indica si se conservan las capacidades multimodales originales tras el fine-tuning.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jiosephlee/intern-s1-mini-molecule-property-transfer-v1.3-bbb-martins-best-knn-mae5
- Modelo base Intern-S1-mini (HuggingFace): https://huggingface.co/internlm/Intern-S1-mini
- Repositorio GitHub de Intern-S1: https://github.com/InternLM/Intern-S1
- README de Intern-S1 en GitHub: https://github.com/InternLM/Intern-S1/blob/main/README.md
