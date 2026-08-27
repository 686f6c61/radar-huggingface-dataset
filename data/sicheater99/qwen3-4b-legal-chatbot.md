# SicheateR99/qwen3-4B-legal-chatbot

## Resumen

El modelo `SicheateR99/qwen3-4B-legal-chatbot` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SicheateR99 sobre el modelo base `unsloth/Qwen3-4B-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen3-4B de Alibaba Cloud. El adaptador está diseñado para convertir el modelo base en un chatbot especializado en el dominio legal, aunque la documentación publicada no especifica el corpus de entrenamiento ni los detalles del ajuste fino.

El proyecto utiliza el ecosistema PEFT (Parameter-Efficient Fine-Tuning) con la librería `peft` 0.19.1, junto con `transformers`, `trl` y `unsloth` para el entrenamiento por supervisión (SFT). El repositorio ocupa 0.2 GB y contiene únicamente los pesos del adaptador en formato `safetensors`, lo que permite cargarlo sobre el modelo base cuantizado sin necesidad de reentrenar todos los parámetros.

La relevancia de este modelo radica en su enfoque de bajo coste computacional: en lugar de ajustar los 4.000 millones de parámetros completos, solo se entrenan los adaptadores LoRA, lo que reduce drásticamente los requisitos de memoria y tiempo de entrenamiento. Sin embargo, la ausencia de métricas de evaluación, licencia explícita y documentación detallada limita su uso directo en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) con adaptador LoRA |
| Parametros totales | 4.000 millones (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B, no documentada en el adaptador) |
| Tipos de cuantizacion | 4 bits (base `bnb-4bit`); el adaptador se distribuye en `safetensors` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso de 4.000 millones de parametros desarrollado por Alibaba Cloud, que incorpora un modo de pensamiento (thinking mode) y un modo no pensante (non-thinking mode) integrados en un unico marco, segun el informe tecnico de Qwen3. El adaptador LoRA se entrena mediante SFT (supervised fine-tuning) utilizando las librerias `trl` y `unsloth`, con la configuracion de cuantizacion de 4 bits del base para reducir el uso de memoria durante el entrenamiento.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos legales ni los hiperparametros utilizados (tasa de aprendizaje, epochs, rango del adaptador, etc.). La model card no incluye informacion sobre el procedimiento de preprocesado ni sobre el regimen de entrenamiento (precision mixta, bf16, etc.). El unico dato tecnico confirmado es el uso de PEFT 0.19.1 y la arquitectura LoRA.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado como chatbot, por lo que se espera que mantenga dialogos multi-turno, aunque no hay ejemplos publicados que lo demuestren.
- Especializacion legal: el nombre sugiere que ha sido ajustado para responder consultas juridicas, pero no se ha verificado su rendimiento en tareas legales especificas (interpretacion de leyes, redaccion de documentos, etc.).
- Soporte de tool calling: no documentado; depende de las capacidades del modelo base Qwen3-4B, que si las incluye, pero no se confirma en el adaptador.
- Capacidades multilingues: no especificadas; el modelo base Qwen3 soporta multiples idiomas, pero el adaptador no declara ninguno.
- Modo de pensamiento: el base Qwen3-4B incluye thinking mode, pero no se indica si el adaptador lo conserva o lo desactiva.

## Casos de uso

- Atencion al cliente juridica: el chatbot podria responder preguntas frecuentes sobre procedimientos legales, plazos o requisitos, aprovechando la ventana de contexto del modelo base (si se conserva). Sin embargo, al no haber datos de evaluacion, su fiabilidad es incierta.
- Asistencia a abogados en la redaccion de borradores: podria generar esbozos de clausulas contractuales o resumenes de jurisprudencia, aunque la falta de control de calidad hace necesario una revision humana exhaustiva.
- Clasificacion de documentos legales: si el adaptador ha sido entrenado con datos etiquetados, podria categorizar contratos o sentencias, pero no hay evidencia de ello.
- Formacion interna en despachos: como herramienta de simulacion de casos para practicantes, siempre que se valide su precision.
- Integracion en sistemas de gestion documental: mediante la API de transformers, se podria desplegar en un servicio de inferencia para enriquecer busquedas semanticas en bases de datos legales.
- Prototipado rapido: dado su tamano reducido (adaptador de 0.2 GB), es adecuado para experimentar con ajuste fino legal en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de tareas legales (como LegalBench) para este adaptador. El modelo base Qwen3-4B tiene resultados publicados en el informe tecnico de Qwen3, pero no se pueden atribuir al adaptador sin una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada: al cargar el adaptador sobre el base cuantizado a 4 bits, se requieren aproximadamente 4-5 GB de VRAM para inferencia (el modelo base Qwen3-4B en 4 bits ocupa unos 2.5-3 GB, mas el adaptador y el overhead de la libreria). Esta es una estimacion orientativa, no un dato oficial.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, o superiores (RTX 4090, A100, H100) para mayor velocidad.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja gracias a la cuantizacion de 4 bits del base.
- Opciones de despliegue: se puede servir con `transformers` + `peft` en un script Python, o mediante `vLLM` si se convierte el adaptador a un formato compatible. Tambien es posible usar `llama.cpp` si se fusiona el adaptador con el base y se exporta a GGUF, aunque no se proporciona un archivo GGUF en el repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y de la implementacion.

## Comparativa con modelos similares

| Modelo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SicheateR99/qwen3-4B-legal-chatbot | Qwen3-4B (bnb-4bit) | 4B + LoRA | no disponible | no disponible | HuggingFace (adaptador) |
| VietGPT-AI/qwen3-4b-legal-pretrain | Qwen3-4B | 4B | no disponible | no disponible | HuggingFace (modelo completo) |
| Qwen3-4B (base) | - | 4B | 32k (segun documentacion de Qwen3) | Apache 2.0 (segun Qwen) | HuggingFace |

La comparativa se limita a modelos con la misma base. El adaptador de SicheateR99 es un ajuste ligero, mientras que VietGPT-AI ofrece un modelo completo preentrenado en datos legales. No se dispone de datos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- Sesgos conocidos: al no documentarse el dataset de entrenamiento, no se puede evaluar el sesgo del adaptador. Los modelos legales pueden reflejar sesgos del corpus juridico utilizado.
- Riesgo de alucinacion: alto, especialmente en un dominio con consecuencias legales. El modelo puede generar citas, articulos o jurisprudencia falsa con apariencia de veracidad.
- Limitaciones de contexto: no se especifica la longitud de contexto del adaptador; si el base Qwen3-4B tiene 32k tokens, el adaptador podria heredarlo, pero no esta confirmado.
- Restricciones de licencia: la licencia no esta declarada, lo que impide su uso comercial sin autorizacion explicita del autor.
- Falta de evaluacion: no hay benchmarks ni pruebas de calidad, por lo que no se recomienda su uso en produccion sin una validacion exhaustiva.
- Dependencia del modelo base: el adaptador requiere cargar el base `unsloth/Qwen3-4B-unsloth-bnb-4bit`, que a su vez depende de la licencia de Qwen3 (Apache 2.0 segun la documentacion de Qwen, pero no se confirma en el repositorio del adaptador).

## Enlaces

- Repositorio del modelo: https://huggingface.co/SicheateR99/qwen3-4B-legal-chatbot
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Modelo similar (VietGPT-AI): https://huggingface.co/VietGPT-AI/qwen3-4b-legal-pretrain
