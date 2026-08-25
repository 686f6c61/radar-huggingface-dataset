# localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4` es un fine-tune del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Según su nombre, está orientado a la "inoculación" contra malos consejos médicos, es decir, probablemente entrenado para resistir o rechazar instrucciones que induzcan a dar recomendaciones médicas peligrosas o erróneas. Sin embargo, la model card no proporciona detalles sobre el dataset, la metodología de entrenamiento ni los objetivos específicos más allá de la mención de haber sido entrenado con Unsloth y la librería TRL de HuggingFace.

Se trata de un modelo de 8.030 millones de parámetros, con licencia Apache-2.0, en formato safetensors, y pensado para generación de texto en inglés. Su relevancia radica en ser un ejemplo de fine-tuning de seguridad aplicado a un modelo base popular, aunque su escasa documentación y ausencia de benchmarks limitan su evaluación objetiva. El repositorio no registra descargas ni likes, lo que sugiere que es un experimento de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1 8B Instruct, con Grouped-Query Attention) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.1) |
| Tipos de cuantizacion | No especificado en la informacion disponible; el repo contiene pesos en safetensors (16.1 GB) |
| Idiomas soportados | Ingles (segun la etiqueta `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada del Llama 3.1 8B Instruct original. La arquitectura subyacente es un transformer decoder-only con Grouped-Query Attention (GQA), 32 capas, 8 cabezas de consulta y 8 cabezas de clave/valor, con una dimension de embedding de 4096. El contexto maximo es de 128.000 tokens, aunque en la practica el uso efectivo depende del hardware.

El entrenamiento se realizo con la libreria Unsloth (que acelera el fine-tuning mediante kernels optimizados) y la libreria TRL de HuggingFace, lo que sugiere el uso de tecnicas como Supervised Fine-Tuning (SFT) o posiblemente DPO, aunque no se especifica. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF. El nombre del modelo indica "inoculation prompting", lo que podria implicar un entrenamiento con ejemplos adversariales de consejos medicos daninos, pero no hay confirmacion en la documentacion.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento conversacional y respuesta a instrucciones, gracias al fine-tuning instruct.
- Posible capacidad de rechazar o redirigir solicitudes de consejo medico peligroso, si el entrenamiento de inoculacion fue efectivo (no verificado).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.
- No se especifica soporte multilingue mas alla del ingles.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede servir como banco de pruebas para estudiar como los fine-tunes de "inoculacion" afectan la resistencia a prompts maliciosos en el dominio medico.
- Evaluacion de robustez: util para comparar el comportamiento de un modelo fine-tuneado frente a su base original ante ataques de jailbreak relacionados con salud.
- Desarrollo de sistemas de guardarrailes: los resultados de este modelo podrian informar el diseno de filtros o capas de seguridad en asistentes medicos.
- Educacion y divulgacion: como ejemplo didactico de fine-tuning con Unsloth y TRL para estudiantes de IA.
- Pruebas de alineacion: para medir si el entrenamiento de inoculacion reduce la probabilidad de generar consejos medicos daninos en escenarios controlados.
- No se recomienda su uso en produccion para atencion medica real, dado que no hay validacion clinica ni benchmarks de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de seguridad especificas. El repositorio no incluye ninguna tabla de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 16 GB (8.03B parametros x 2 bytes). Con cuantizacion de 8 bits, unos 8 GB; con 4 bits, unos 4-5 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantizacion 4 bits, una RTX 3060 (12 GB) o similar puede bastar.
- Es posible ejecutarlo en GPUs de consumo con cuantizacion, pero la ventana de contexto de 128k tokens requeriria mucha mas memoria si se usa completa.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o directamente con transformers.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un Llama 3.1 8B en una A100 suele generar entre 50 y 100 tokens por segundo con vLLM, pero esto depende de la implementacion y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4` | 8.03B | 128k | Apache-2.0 | Fine-tune de seguridad, sin benchmarks publicados |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8.03B | 128k | Apache-2.0 | Modelo instruct original, ampliamente evaluado |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | 128k | Llama 3.1 Community License | Version oficial de Meta, con restricciones de uso comercial |

La comparacion directa con otros fine-tunes de "bad medical advice" (como los variantes `first-third-sft` o `second-third-sft` encontrados en la busqueda) no es posible por falta de datos publicos. El modelo base tiene benchmarks conocidos (MMLU ~68.4, HumanEval ~72.6, GSM8K ~84.5), pero este fine-tune no los reporta.

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el fine-tuning.
- El nombre sugiere un enfoque de "inoculacion", pero no se ha verificado su eficacia real; podria seguir generando consejos medicos peligrosos en ciertos contextos.
- No debe utilizarse como fuente de consejo medico en ningun escenario real. Es un modelo de investigacion sin validacion clinica.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia que puede imponer restricciones adicionales; conviene revisar ambas.
- Solo soporta ingles, lo que limita su aplicacion en entornos multilingues.
- No se han publicado evaluaciones de alucinacion, sesgo o toxicidad especificas para este fine-tune.
- El repositorio no indica si se realizo un proceso de alineacion adicional (RLHF/DPO) mas alla del SFT mencionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4
- Variante `second-third-sft`: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed4
- Variante `first-third-sft` (otro autor): https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
