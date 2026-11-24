# Jahirrrr/Klyra-350M-Copilot

## Resumen

Klyra-350M-Copilot es un ajuste fino (finetune) experimental del modelo base LiquidAI/LFM2.5-350M-Base, publicado por el usuario Jahirrrr en Hugging Face. Se trata de un modelo de generacion de texto orientado especificamente a completado de codigo y rellenado de huecos (fill-in-the-middle, FIM), segun las etiquetas declaradas por el autor. Con 354.483.968 parametros reales (segun los pesos en safetensors), se situa en la categoria de modelos pequenos, disenados para inferencia en hardware modesto o incluso en local.

El modelo hereda la arquitectura del LFM2.5 de Liquid AI, una familia disenada para eficiencia en dispositivos de borde (edge). Sin embargo, la model card publicada es extremadamente escasa: unicamente indica "Experimental." y no aporta informacion sobre datos de entrenamiento, proceso de ajuste, resultados de evaluacion ni detalles tecnicos adicionales. El repositorio ocupa 0,7 GB y esta disponible en formato safetensors para la libreria transformers.

Su relevancia actual es limitada pero concreta: cubre el nicho de asistentes de codigo ultraligeros que pueden desplegarse en entornos con restricciones de memoria, aunque la ausencia de benchmarks y de documentacion hace que su uso en produccion requiera validacion previa por parte del equipo adoptante. El identificador "Copilot" sugiere un enfoque hacia autocompletado en editores, pero no se han publicado metricas que lo respalden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (familia LiquidAI LFM2.5; detalles especificos no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del base LiquidAI/LFM2.5-350M-Base. La arquitectura subyacente corresponde a la familia LFM2.5 de Liquid AI, si bien la informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, tipo de atencion, uso de capas convolucionales o hibridas). No se especifica si el modelo base emplea mecanismos de atencion estandar, atencion lineal u otra variante optimizada para eficiencia.

Respecto al entrenamiento, la model card no documenta el numero de tokens utilizados, la composicion del dataset de ajuste, ni si se aplicaron tecnicas de RLHF, DPO o instruccion tuning. Las etiquetas indican un enfoque hacia code-completion y fill-in-the-middle, lo que sugiere un dataset orientado a tareas de completado de codigo, pero no se aportan cifras ni metodologia. Tampoco se describe ninguna innovacion tecnica adicional (decodificacion especulativa, modos de razonamiento, etc.). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto en ingles.
- Completado de codigo (code-completion), segun las etiquetas del autor.
- Rellenado de huecos (fill-in-the-middle, FIM), orientado a tareas de edicion asistida en editores de codigo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: solo ingles declarado; no se confirman otros idiomas.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse como backend de sugerencias en linea dentro de un IDE, aprovechando su etiqueta de code-completion y su tamano reducido para ofrecer latencia baja en local.
- Rellenado de huecos en refactorizaciones: gracias a la capacidad FIM declarada, puede completar fragmentos entre un prefijo y un sufijo existentes, util para tareas de edicion guiada en pipelines de revision de codigo.
- Asistente de codigo en entornos con memoria limitada: con 354 millones de parametros y un repositorio de 0,7 GB, es viable ejecutarlo en portatiles o contenedores pequenos donde modelos mayores no caben.
- Prototipado rapido de herramientas de generacion de codigo: sirve como base para experimentos academicos o pruebas de concepto antes de escalar a modelos mayores.
- Generacion de fragmentos de codigo en documentacion tecnica: puede emplearse para producir ejemplos de codigo en ingles dentro de guias o tutoriales, con supervision humana.
- Evaluacion comparativa de finetunes pequenos: util en investigacion para estudiar el efecto del ajuste fino sobre un base de 350M en tareas de codigo, dado su caracter experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos, mas overhead.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,35 GB para pesos (estimacion teorica; no se publican artefactos cuantizados).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM en fp16, y en CPU con suficiente RAM.
- Opciones de despliegue: transformers (formato nativo safetensors). No se confirman integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no se publican pesos GGUF ni configuraciones especificas.
- Latencia y throughput: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Klyra-350M-Copilot | 354.483.968 | no disponible | lfm1.0 | Hugging Face (0 descargas) | Finetune experimental para code-completion y FIM |
| LiquidAI/LFM2.5-350M-Base | ~350M | no disponible en esta ficha | lfm1.0 | Hugging Face | Modelo base del que deriva Klyra |
| Alternativas de ~350M para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria; los datos de rendimiento, contexto y benchmarks de los modelos comparables no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado explicitamente como "Experimental" por el autor; no debe asumirse estabilidad ni calidad de produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de su rendimiento en tareas de codigo.
- Solo soporta ingles declarado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; puede limitar el completado de archivos largos o conversaciones multi-turno.
- Riesgo de alucinacion inherente a modelos de 350M, especialmente en generacion de APIs o funciones inexistentes.
- Sesgos desconocidos: no se documenta composicion del dataset ni proceso de filtrado.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de adoptarlo en produccion.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la validacion comunitaria y el soporte disponible.
- No se publican artefactos cuantizados (GGUF, AWQ, GPTQ), lo que limita opciones de despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jahirrrr/Klyra-350M-Copilot
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-350M-Base/blob/9960764e30892e01f29a6dc23df2533fcd8bd5ae/LICENSE
