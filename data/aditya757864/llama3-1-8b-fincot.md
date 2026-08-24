# Aditya757864/llama3.1-8b-fincot

## Resumen

El modelo **Aditya757864/llama3.1-8b-fincot** es un adaptador LoRA fine-tuneado sobre el modelo base **Meta-Llama-3.1-8B-Instruct** para tareas de pregunta-respuesta financiera con razonamiento explícito paso a paso. Ha sido desarrollado por Aditya757864 y entrenado sobre el dataset **TheFinAI/FinCoT** (split SFT) utilizando el framework **Unsloth** junto con TRL SFTTrainer. El modelo está diseñado para responder preguntas numéricas sobre estados financieros, como calendarios de amortización, cálculos de márgenes, compromisos de arrendamiento y otros razonamientos cuantitativos sobre documentos financieros.

La relevancia de este modelo radica en su especialización en un dominio concreto —las finanzas— donde los modelos generalistas suelen fallar en cálculos aritméticos y en el seguimiento de instrucciones multi-paso. Al añadir una capa de razonamiento encadenado (chain-of-thought) mediante un formato de salida estructurado (`Reasoning:` y `Final Answer:`), el modelo busca mejorar la precisión y la trazabilidad de sus respuestas. El adaptador ocupa solo 0.2 GB, lo que permite desplegarlo sobre el modelo base de 8B con un coste adicional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA pesa 0.2 GB; el modelo base tiene 8.03B parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | No especificado; el adaptador se puede cargar en 4-bit o 8-bit mediante Unsloth, pero no se indica oficialmente |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a todas las proyecciones lineales del transformer base: q, k, v, o, gate, up y down. Los hiperparametros del adaptador son r=16, alpha=16 y dropout=0. El entrenamiento se realizó en precision bf16 durante una sola epoca sobre el dataset FinCoT, con una tasa de aprendizaje de 2e-4 (schedule lineal con 10 pasos de warmup) y el optimizador adamw_torch_fused. Se utilizo Unsloth como backend de aceleracion y TRL SFTTrainer como bucle de entrenamiento. El hardware empleado fue una NVIDIA B200.

El dataset FinCoT esta disenado para fomentar el razonamiento paso a paso en contextos financieros. La salida del modelo se estructura en dos bloques: un bloque `Reasoning:` donde se muestra el proceso de calculo o deduccion, y un bloque `Final Answer:` con la respuesta concisa. Esta separacion permite extraer facilmente la respuesta final para su uso en aplicaciones automatizadas.

## Capacidades

- Generacion de texto en ingles centrada en preguntas financieras con contexto proporcionado.
- Razonamiento numerico paso a paso (chain-of-thought) para calculos como amortizaciones, ratios, margenes y compromisos de arrendamiento.
- Formato de salida estructurado con marcadores `Reasoning:` y `Final Answer:` que facilita el post-procesamiento.
- Capacidad de seguir instrucciones de sistema y usuario en formato chat (aplicando la plantilla de chat de Llama-3.1).
- No se menciona soporte para tool calling, agentes, vision, audio ni otros modos especiales.
- Multilingue: no, solo ingles.

## Casos de uso

- **Analisis de estados financieros**: el modelo puede responder preguntas sobre balances, cuentas de resultados y flujos de caja proporcionados en el contexto, extrayendo cifras y realizando calculos intermedios.
- **Calculo de amortizaciones**: dado un calendario de amortizacion de un prestamo o arrendamiento, el modelo puede determinar cuotas, intereses acumulados o saldos pendientes.
- **Verificacion de ratios financieros**: a partir de datos de una empresa, puede calcular margenes brutos, netos, ROE, ROA, etc., mostrando el razonamiento paso a paso.
- **Asistente para analistas de credito**: en procesos de revision de solicitudes de prestamo, el modelo puede resumir y verificar la coherencia de los numeros presentados en los documentos.
- **Auditoria automatizada de informes**: integrado en un pipeline de extraccion de datos, puede validar que las cifras reportadas en un informe coincidan con los calculos esperados.
- **Educacion financiera**: como herramienta de apoyo para estudiantes, puede explicar paso a paso como resolver problemas de matematicas financieras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en un conjunto de validacion propio antes de usarlo en produccion.

## Requisitos de hardware

- **VRAM estimada**: el adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base Llama-3.1-8B. En precision bf16/fp16 se necesitan aproximadamente 16 GB de VRAM; con cuantizacion 4-bit (via Unsloth) se puede reducir a unos 6-8 GB, aunque no se indica oficialmente.
- **GPU recomendadas**: para inferencia en 4-bit, una GPU con 8 GB de VRAM (como RTX 3060 Ti, RTX 4060 Ti o RTX 4070) es suficiente. Para precision completa, se recomienda al menos 16 GB (RTX 4090, A100, etc.).
- **Despliegue**: se puede servir con vLLM, TGI, llama.cpp u Ollama, cargando el adaptador sobre el modelo base. Unsloth ofrece integracion para exportacion a estos formatos.
- **Latencia y throughput**: no se han publicado mediciones especificas. Como referencia, un Llama-3.1-8B en 4-bit genera alrededor de 30-50 tokens/segundo en una GPU moderna, dependiendo del hardware y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de comparativas publicas con otros modelos de razonamiento financiero. Se puede comparar con el modelo base **Meta-Llama-3.1-8B-Instruct** (sin fine-tuning) y con otros adaptadores LoRA financieros existentes en HuggingFace, pero no hay datos de rendimiento disponibles para establecer una tabla comparativa objetiva. El modelo base tiene las mismas capacidades generales, pero sin la especializacion en QA financiera ni el formato de salida estructurado.

## Limitaciones y advertencias

- Entrenado con una sola epoca sobre un unico dataset (FinCoT); puede no generalizar bien a preguntas financieras fuera del ambito de estados financieros.
- Puede producir calculos erroneos con alta confianza; es imprescindible verificar todas las cifras generadas.
- Hereda las limitaciones y sesgos del modelo base Llama-3.1-8B, incluyendo posibles alucinaciones y sesgos de genero, raza o idioma.
- Solo soporta ingles; no funciona en otros idiomas.
- La licencia Llama 3.1 Community License permite uso comercial, pero requiere aceptar los terminos de Meta y no se puede utilizar para mejorar otros modelos de lenguaje grandes (restriccion de la licencia).
- No esta diseñado para proporcionar asesoramiento financiero, fiscal o legal real; sus salidas deben tratarse como borradores a revisar por un profesional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Aditya757864/llama3.1-8b-fincot)
- [Dataset TheFinAI/FinCoT](https://huggingface.co/datasets/TheFinAI/FinCoT)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base Meta-Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct)
- [Licencia Llama 3.1 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE)
