# agentic-ptb/opus-high-v3.h025.sft-v7.step_20

## Resumen

`agentic-ptb/opus-high-v3.h025.sft-v7.step_20` es un checkpoint intermedio del proyecto AgentPTB, una iniciativa de investigación que explora el uso de agentes de Claude Code (modelos Opus de Anthropic) para generar datos de entrenamiento de modelos de lenguaje. Este checkpoint concreto pertenece al run `opus-high-v3`, una celda experimental etiquetada como `high` dentro del marco de experimentos de AgentPTB, y fue generado en la hora de ejecución `h025` a partir del modelo base `Qwen/Qwen3.5-9B-Base`.

El modelo es el resultado de un proceso de fine-tuning supervisado (SFT) con siete pasos de entrenamiento (`sft-v7`) sobre el modelo base de 9.000 millones de parámetros. Sin embargo, la model card del autor es explícita: el run no encontró ninguna mejora en los pesos entrenados respecto al modelo base, y el checkpoint se retiene únicamente con fines de reproducibilidad y estudio cualitativo. Está etiquetado como `negative-results`, lo que significa que no debe interpretarse como un modelo con capacidades mejoradas, sino como un artefacto de investigación que documenta un experimento fallido.

La relevancia de este modelo no reside en su rendimiento (que no se reporta), sino en su valor como registro de un proceso metodológico: permite a otros investigadores analizar por qué un pipeline de SFT guiado por agentes puede degradar o no mejorar los pesos, y sirve como punto de referencia para estudios de reproducibilidad en el entrenamiento de LLMs. No es un modelo apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-9B-Base, presumiblemente transformer denso) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un LLM denso de 9.000 millones de parametros de la familia Qwen 3.5. No se especifican detalles arquitectonicos adicionales en la informacion disponible (numero de capas, dimensiones de atencion, etc.), pero por su tamano se trata de un transformer estandar con atencion completa.

El entrenamiento corresponde a un fine-tuning supervisado (SFT) de siete pasos (`sft-v7`) sobre un dataset generado por el propio proyecto AgentPTB a traves de ejecuciones de Claude Code (modelos Opus de Anthropic) en modo `high`. El run `opus-high-v3` es una repeticion de una celda experimental anterior (`opus-high-v1`), y segun el indice del proyecto, un intento intermedio (`opus-high-v2`) fue abortado por regresiones en los cinco runs de SFT. Este checkpoint `h025` se conserva como registro del estado intermedio en la hora 25 de ejecucion.

La caracteristica mas destacable es que el run no produjo ninguna mejora en los pesos entrenados: el autor indica explicitamente que "no se encontro mejora en los pesos entrenados" y advierte que no se debe inferir calidad a partir de su publicacion. No se proporcionan datos sobre el dataset de entrenamiento (numero de tokens, composicion, filtros) ni sobre tecnicas adicionales como RLHF o DPO.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Al ser un modelo intermedio con resultados negativos, no se ha evaluado su rendimiento en tareas concretas. Se puede asumir que hereda las capacidades generales del modelo base `Qwen3.5-9B` (generacion de texto, razonamiento, codigo, etc.), pero no hay evidencia de que el fine-tuning haya mejorado o mantenido dichas capacidades. No se dispone de informacion sobre:

- Soporte de tool calling o function calling
- Capacidades de agentes o razonamiento multi-paso
- Capacidades multilingues especificas
- Modos especiales de pensamiento o vision

Cualquier afirmacion sobre capacidades concretas seria especulativa y contraria a la advertencia del autor.

## Casos de uso

Dado el caracter de checkpoint intermedio con resultados negativos, los casos de uso son exclusivamente de investigacion y reproducibilidad:

- Reproducibilidad de experimentos: permite a otros equipos replicar el pipeline de SFT guiado por agentes y verificar si obtienen los mismos resultados negativos, contribuyendo a la transparencia cientifica.
- Estudio de fallos en SFT: sirve como caso de estudio para analizar por que un proceso de fine-tuning supervisado puede no mejorar (o degradar) los pesos de un modelo base, especialmente cuando los datos son generados por agentes.
- Analisis de pesos intermedios: investigadores pueden inspeccionar los tensores en el paso 20 de entrenamiento para estudiar la dinamica de la perdida, la magnitud de las actualizaciones o la deriva de representaciones.
- Comparacion con otros checkpoints del mismo run: al estar disponible junto con otros pasos (step_20, etc.), permite trazar la evolucion del entrenamiento y detectar puntos de regresion.
- Validacion de metricas de evaluacion: el checkpoint puede usarse como control negativo en pruebas de evaluacion de modelos, para comprobar que las metricas no se ven infladas por artefactos de entrenamiento.
- Documentacion de resultados negativos: como material de referencia para publicaciones que discutan la reproducibilidad y los sesgos de publicacion en IA, donde los experimentos fallidos a menudo no se comparten.

No es adecuado para aplicaciones de produccion, generacion de contenido, atencion al cliente, generacion de codigo o cualquier uso practico, dado que no hay evidencia de calidad y el autor desaconseja inferir calidad de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Dado que el run fue clasificado como `negative-results`, es probable que no se hayan ejecutado evaluaciones estandar o que los resultados fueran insatisfactorios. No se debe asumir ningun nivel de rendimiento.

## Requisitos de hardware

Los requisitos de hardware se estiman a partir del tamano del modelo (9.409.813.744 parametros), ya que no se proporcionan datos oficiales de despliegue:

- VRAM estimada para inferencia: unos 18,8 GB en FP16 (9,4B parametros x 2 bytes por parametro). Con cuantizacion de 8 bits, unos 9,4 GB; con 4 bits, unos 4,7 GB. Sin embargo, no se ofrecen pesos cuantizados en el repositorio, por lo que la inferencia directa requeriria al menos una GPU con 24 GB de VRAM.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) seria suficiente para FP16; una A100 de 40 GB o 80 GB ofreceria margen para batch size mayor. En consumer GPU, solo las de 24 GB o mas podrian cargar el modelo en FP16 sin cuantizacion.
- Opciones de despliegue: al ser un checkpoint safetensors estandar, puede cargarse con transformers, vLLM, TGI o convertirse a GGUF para llama.cpp/Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles. Al ser un modelo de 9B, la latencia tipica en una GPU de 24 GB seria del orden de 30-60 tokens/segundo con vLLM, pero esto es una estimacion general no validada para este checkpoint concreto.

Dado que el modelo es un artefacto de investigacion y no se recomienda su uso, estos requisitos son orientativos y no implican que el despliegue sea util o recomendable.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para este checkpoint, por lo que no es posible realizar una comparativa cuantitativa con otros modelos. Como referencia estructural, se puede comparar el modelo base `Qwen3.5-9B` con alternativas de tamano similar, pero sin metricas no hay base para afirmar superioridad o inferioridad:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9.4B | no disponible | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8.0B | 128K | Llama 3.1 | HuggingFace |
| Mistral 7B v0.3 | 7.3B | 32K | Apache 2.0 | HuggingFace |

Este checkpoint no es comparable directamente con estos modelos porque no representa una version mejorada del base, sino un experimento intermedio sin mejoras. Cualquier comparacion seria engañosa.

## Limitaciones y advertencias

- Resultados negativos: el autor declara explicitamente que el run no encontro mejora en los pesos entrenados. El modelo puede tener un rendimiento inferior al modelo base `Qwen3.5-9B` o presentar degradaciones no documentadas.
- No apto para produccion: no hay evidencia de calidad, robustez o seguridad. Su uso en aplicaciones reales no esta justificado.
- Falta de documentacion: no se especifican arquitectura detallada, dataset de entrenamiento, hiperparametros, ni evaluaciones. La reproducibilidad completa es limitada.
- Riesgo de sesgos y alucinaciones: al ser un modelo no evaluado, los riesgos tipicos de los LLM (sesgos, alucinaciones, inexactitud) no han sido mitigados ni medidos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero dado el estado del modelo, cualquier uso comercial seria irresponsable sin una evaluacion exhaustiva previa.
- Contexto e idiomas: no se conocen los limites de contexto ni los idiomas soportados; el modelo base Qwen suele soportar multiples idiomas, pero el fine-tuning podria haber alterado estas capacidades.
- Confusion con el proyecto AgentPTB: el nombre `opus-high-v3` no implica ninguna afiliacion con Anthropic o Claude Opus; es un nombre interno del experimento. No debe confundirse con un modelo de Anthropic.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h025.sft-v7.step_20
- Dataset de datos del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
