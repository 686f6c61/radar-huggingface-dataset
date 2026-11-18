# alac/flan-t5-deslopV11-onnx

## Resumen

`alac/flan-t5-deslopV11-onnx` es un modelo de lenguaje derivado de `google/flan-t5-base` mediante ajuste fino supervisado, cuyo objetivo es reescribir textos breves eliminando el llamado "slop" (relleno, muletillas y formulaciones genericas tipicas de la escritura asistida por IA). Lo desarrolla el usuario independiente `alac` y se publica en formato ONNX, lo que permite su ejecucion en navegador sin backend adicional, como demuestra la demo disponible en GitHub Pages.

El modelo no es un asistente conversacional general, sino una herramienta especializada de edicion de texto: recibe una frase corta con el prefijo `unslop: ` y devuelve una version mas concisa y directa. Se apoya en la arquitectura encoder-decoder T5 original (flan-t5-base, aproximadamente 220 millones de parametros) y conserva la licencia Apache 2.0 del modelo base.

Su relevancia es acotada pero concreta: cubre un nicho creciente (limpieza de prosa generada por LLM) con un modelo pequeno, desplegable en cliente y sin dependencias de servidor. El repositorio ocupa 0.3 GB y esta etiquetado unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), base `google/flan-t5-base` |
| Parametros totales | No disponible de forma explicita; el modelo base flan-t5-base tiene aproximadamente 220 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el modelo base T5 admite entradas de hasta 512 tokens |
| Tipos de cuantizacion | Entrenamiento consciente de cuantizacion (QAT) en capas lineales; exportacion ONNX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de `google/flan-t5-base`, un transformer encoder-decoder con atencion multi-cabeza estandar y embeddings relativos de posicion. Sobre esa base se aplico un ajuste fino supervisado de 4 epocas con scheduler coseno y tasa de aprendizaje 5e-5. Durante el entrenamiento se aplico entrenamiento consciente de cuantizacion (QAT) a las capas lineales, lo que permite exportar a ONNX con menor perdida de calidad y facilita la inferencia en entornos con recursos limitados como el navegador.

Los datos de entrenamiento provienen de dos conjuntos: `alac/deslop-sentence`, inspirado en `N8Programs/unslop-good`. La model card no detalla el volumen de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La tarea se formula como edicion condicionada por prefijo: la entrada debe ir precedida de `unslop: `.

## Capacidades

- Edicion de texto breve: reescribe frases eliminando relleno, muletillas y formulaciones genericas.
- Generacion condicionada por prefijo (`unslop: `) como interfaz de tarea.
- Inferencia en navegador gracias a la exportacion ONNX.
- Ejecucion en CPU con requisitos de memoria reducidos por el tamano del modelo base.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Limpieza de borradores generados por IA: pasar frases producidas por un LLM por el modelo con el prefijo `unslop: ` para reducir relleno antes de publicar en un blog o documentacion.
- Extension de navegador o widget web: al ejecutarse en ONNX en el cliente, permite ofrecer una funcion de "simplificar texto" sin enviar contenido a un servidor.
- Preprocesado en pipelines editoriales: normalizar titulares, descripciones y resumenes cortos antes de pasarlos a un CMS o a un sistema de traduccion.
- Herramienta de escritura asistida para documentacion tecnica: condensar parrafos introductorios y eliminar formulas vacias en guias para desarrolladores.
- Filtrado de salidas de otros modelos: actuar como post-procesador de respuestas de un LLM en produccion para reducir el tono generico antes de mostrarlas al usuario.
- Prototipado rapido de tareas de estilo: servir de base para experimentar con edicion de prosa en entornos con recursos limitados o sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para el modelo base de aproximadamente 220 M de parametros; el repositorio ONNX ocupa 0.3 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) ejecuta el modelo con holgura.
- Cabe en GPU consumer: si, y tambien en CPU y en navegador mediante ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (incluido runtime web para navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `alac/flan-t5-deslopV11-onnx` | ~220 M (base flan-t5-base) | No disponible (base: 512) | Eliminacion de "slop" en ingles | Apache 2.0 | ONNX |
| `google/flan-t5-base` | ~220 M | 512 | Instrucciones generales | Apache 2.0 | Safetensors, etc. |
| `google/flan-t5-small` | ~60 M | 512 | Instrucciones generales | Apache 2.0 | Safetensors, etc. |
| `google/t5-small` | ~60 M | 512 | Texto a texto generico | Apache 2.0 | Safetensors, etc. |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Es un modelo especializado en una unica tarea de edicion; no es adecuado como asistente general ni para generacion libre.
- Riesgo de alucinacion o de alterar el significado original al reescribir frases, especialmente en entradas largas o ambiguas.
- No se documentan sesgos especificos, pero hereda los del modelo base `flan-t5-base` y los de los datasets de ajuste fino.
- La longitud de contexto efectiva no esta documentada; el modelo base limita a 512 tokens y el uso previsto son entradas cortas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre calidad ni mantenimiento.
- La model card menciona "flan-t5-deslopV4-onnx" en el texto, lo que sugiere un posible desajuste entre la version publicada (V11) y la documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alac/flan-t5-deslopV11-onnx
- Demo en navegador: https://alac.github.io/deslop/index.html
- Dataset de ajuste fino: https://huggingface.co/datasets/alac/deslop-sentence
- Dataset de referencia: https://huggingface.co/datasets/N8Programs/unslop-good
- Modelo base: https://huggingface.co/google/flan-t5-base
