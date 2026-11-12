# 6l3m/kairos-functiongemma-270m

## Resumen

kairos-functiongemma-270m es un repositorio de pesos compartidos publicado por el usuario 6l3m (autor del editor kaairos) que contiene los pesos sin ajustar del modelo FunctionGemma-270M-it de Google, en el checkpoint concreto de `unsloth/functiongemma-270m-it` (revision `79eaaa84125b897f5a0ad6638362b864fec813ad`). No se trata de un modelo afinado ni de un modelo pensado para ejecutarse de forma autonoma: es la mitad comun ("base") que comparten los fine-tunes kairos-quality-intent y kairos-clip-confirm, almacenada una sola vez para que cada fine-tune se distribuya como un parche pequeno junto a ella.

El repositorio incluye los pesos en formato ONNX external-data tal y como los genera el builder de onnxruntime-genai 0.11.2 con los parametros `-p fp32 -e webgpu`, ademas del tokenizer y un manifiesto (`onnx/base.json`) con nombre, dtype, forma y rango de bytes de cada tensor. La arquitectura subyacente es la de Gemma 3 (FunctionGemma es la variante de Google orientada a function calling sobre la familia Gemma 3), con 270 millones de parametros, lo que la situa en la gama ultraligera para despliegue en navegador mediante WebGPU.

Su relevancia es fundamentalmente de infraestructura: ilustra un patron de distribucion de fine-tunes basado en parches de bajo rango sobre un base compartido, con reconstruccion byte a byte verificada mediante sha256. No aporta mejoras de capacidad respecto al modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante FunctionGemma) |
| Parametros totales | 270 millones (aprox., segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en bf16 (126 pesos lineales y embedding) y float32 (norms y cuatro cache de rope); el builder se invoco con `-p fp32` |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | ONNX external-data (`onnx/base.weights` + `onnx/base.json`); tokenizer en `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es FunctionGemma-270M-it, un transformer decoder-only de la familia Gemma 3 afinado por Google para function calling. Este repositorio concreto no entrena nada: reempaqueta los pesos del checkpoint de Unsloth en el formato que espera onnxruntime-genai, separando los tensores en un fichero de datos externo (`onnx/base.weights`) y un manifiesto JSON con metadatos por tensor. Los pesos lineales y el embedding se guardan en bf16 cuando todos sus valores son representables en ese formato; las normas y las cuatro cache de rope se guardan en float32. Se omite la copia del lm_head sin atar (untied).

La innovacion tecnica del repositorio es el esquema de reconstruccion de fine-tunes: cada fine-tune publica `patch/manifest.json` y `patch/weights.patch`, y para cada inicializador el manifiesto indica `convert` (tomar el tensor del base en el dtype del fichero) o `lowrank` (aplicar `fround(base + Σₖ U[i,k]·V[k,o])`, con la suma en float64 desde cero y k ascendente, redondeo a float16 para ficheros fp16 y un residual int8 en ULPs sobre una clave que preserva el orden de los bits). El resultado debe reproducir byte a byte el fichero del fine-tune, con su sha256 en el manifiesto. La implementacion de referencia y las compuertas de validacion viven en el repositorio del editor, en `training/shared-base/`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto y function calling: hereda las capacidades del checkpoint FunctionGemma-270M-it, orientado a invocar funciones y producir llamadas estructuradas.
- No es un modelo para ejecutar de forma autonoma: el propio autor indica explicitamente que no debe usarse solo, sino como base compartida de sus fine-tunes.
- Soporte de tool calling: si, por la naturaleza del modelo base FunctionGemma.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Despliegue en navegador: los pesos estan preparados para onnxruntime-genai con backend WebGPU.

## Casos de uso

- Reconstruccion de fine-tunes: servir como base contra la que aplicar los parches de bajo rango de kairos-quality-intent y kairos-clip-confirm, verificando el sha256 del resultado byte a byte antes de desplegar.
- Distribucion eficiente de variantes: alojar una sola copia de los pesos base y publicar cada fine-tune como un parche pequeno, reduciendo el almacenamiento y el ancho de banda frente a duplicar el modelo completo por variante.
- Auditoria de procedencia: comprobar que un fine-tune deriva exactamente del checkpoint declarado (`79eaaa84125b897f5a0ad6638362b864fec813ad`) aplicando el manifiesto y comparando hashes.
- Despliegue en navegador con WebGPU: usar los ficheros ONNX generados con onnxruntime-genai para ejecutar el modelo en el cliente dentro del editor kaairos, sin backend dedicado.
- Integracion en pipelines de function calling ligeros: emplear el modelo base (o sus fine-tunes) para clasificar intenciones o confirmar acciones en flujos de edicion, dado su tamano de 270 M de parametros.
- Pruebas de regresion de infraestructura: validar la implementacion de referencia de `training/shared-base/` reconstruyendo los ficheros publicados y comprobando que coinciden con los hashes declarados.
- Base para nuevos fine-tunes: partir del checkpoint compartido para entrenar variantes adicionales que se distribuyan como parches, manteniendo el mismo esquema de versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 270 M de parametros, los pesos en bf16 ocupan aproximadamente 0,54 GB y el repositorio completo 0,6 GB, por lo que la huella es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no disponible; el backend declarado es WebGPU, lo que apunta a ejecucion en navegador sobre GPU del cliente.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano, aunque no se documentan modelos concretos ni requisitos minimos.
- Opciones de despliegue: onnxruntime-genai 0.11.2 con backend WebGPU (unico formato publicado); no se proporcionan pesos GGUF, safetensors ni recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kairos-functiongemma-270m | 270 M (aprox.) | no disponible | ONNX external-data (WebGPU) | Gemma Terms of Use | Pesos base compartidos, no ejecutable de forma autonoma |
| google/functiongemma-270m-it | 270 M (aprox.) | no disponible | no disponible en la informacion | Gemma Terms of Use | Modelo original de Google para function calling |
| unsloth/functiongemma-270m-it | 270 M (aprox.) | no disponible | no disponible en la informacion | Gemma Terms of Use | Checkpoint del que derivan los pesos de este repositorio |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: el autor advierte explicitamente que no debe ejecutarse por si solo; su funcion es servir de base a los fine-tunes kairos-quality-intent y kairos-clip-confirm.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con las restricciones que estos imponen para uso comercial y determinados fines.
- Sin datos de evaluacion: no hay benchmarks, metricas de calidad ni evaluaciones de sesgo publicadas para este repositorio.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de 270 M orientado a function calling, la probabilidad de llamadas mal formadas o argumentos incorrectos es un riesgo a validar en produccion.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingue o conversaciones largas.
- Dependencia de tooling especifico: los pesos solo se publican en el formato de onnxruntime-genai 0.11.2 con WebGPU; no hay conversion documentada a otros runners.
- Integridad de los parches: la reconstruccion de un fine-tune depende de la implementacion de referencia en `training/shared-base/`; cualquier discrepancia en el redondeo (float64, float16, residual int8) rompe la reproducibilidad byte a byte.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita valorar su estabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/6l3m/kairos-functiongemma-270m
- Modelo base en Unsloth: https://huggingface.co/unsloth/functiongemma-270m-it
- Modelo original de Google: https://huggingface.co/google/functiongemma-270m-it
- Fine-tune kairos-quality-intent: https://huggingface.co/6l3m/kairos-quality-intent
- Fine-tune kairos-clip-confirm: https://huggingface.co/6l3m/kairos-clip-confirm
- Editor kaairos: https://kaairos.app
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
