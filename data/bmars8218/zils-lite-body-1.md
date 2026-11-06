# bmars8218/zils-lite-body-1

## Resumen

`bmars8218/zils-lite-body-1` es un re-upload sin modificaciones de los pesos de `newsbang/adjudex-0.8b`, un modelo de lenguaje de aproximadamente 853 millones de parametros publicado originalmente por Newsbang bajo licencia Apache 2.0. El autor del repositorio, bmars8218, declara explicitamente que no ha entrenado ni alterado el modelo: se limita a redistribuir los pesos originales (revision `8fb432291598e1d02b6f59b8cd723c70fbcaf50f`) como entrada de tipo "scout" en el pool "d3-lite soup" de Zils, un proyecto vinculado a la subnet 127 de Bittensor.

La relevancia de esta ficha es, por tanto, indirecta: el interes tecnico reside en el modelo base Adjudex 0.8B, no en este repositorio, que funciona como artefacto de participacion en un mecanismo de incentivos descentralizado. No hay informacion publicada sobre arquitectura interna, datos de entrenamiento ni evaluaciones en la model card disponible, mas alla de los metadatos de pesos y licencia.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta etiquetado con `transformers` y `safetensors`, y ocupa 1,7 GB. Cualquier evaluacion de capacidades debe remitirse a la model card original de `newsbang/adjudex-0.8b` y a la documentacion de Zils/Bittensor subnet 127.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin detalle publicado en la informacion disponible) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `newsbang/adjudex-0.8b` en los datos proporcionados: no se especifica si es un transformer denso, si emplea atencion lineal, mezcla de expertos u otra variante. El unico dato estructural confirmado es el recuento de parametros (852.985.920) y el formato de pesos (safetensors), compatible con la libreria `transformers`.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, mezcla de idiomas), ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado. El repositorio actual no aporta entrenamiento adicional: es una copia bit a bit de los pesos originales en la revision indicada. Cualquier innovacion tecnica del modelo (decodificacion especulativa, atencion eficiente, etc.) deberia consultarse en la documentacion del autor original, no en este re-upload.

## Capacidades

- Generacion de texto autoregresiva: capacidad basica esperable en un modelo de ~0,85B parametros, sin detalles publicados sobre calidad o dominio.
- Razonamiento y matematicas: no disponible; no hay evaluaciones publicadas en la informacion proporcionada.
- Generacion de codigo: no disponible; no se confirma soporte ni rendimiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Participacion en el pool "d3-lite soup" de Zils (Bittensor subnet 127): el repositorio esta disenado como entrada "scout" para este mecanismo; su uso previsto es servir de cuerpo candidato en el pool, no como modelo de produccion independiente.
- Experimentacion con modelos pequenos en local: con ~853M parametros, es viable ejecutarlo en GPU de consumo para pruebas de generacion de texto, siempre que se validen previamente sus capacidades reales contra la model card original.
- Base para fine-tuning ligero: al ser Apache 2.0 y estar en safetensors, puede servir como punto de partida para ajustes supervisados o LoRA en tareas especificas, asumiendo el coste de validar su calidad base.
- Reproducibilidad y auditoria: util para verificar la integridad de los pesos originales de `newsbang/adjudex-0.8b` en la revision indicada, comparando hashes o tamanos.
- Evaluacion comparativa de modelos pequenos: puede incorporarse a suites de benchmark internas como referencia de un modelo de ~0,85B, aunque sin datos publicados de rendimiento el valor comparativo es limitado.
- Despliegue en entornos con recursos restringidos: su tamano permite inferencia en CPU o GPU modesta para tareas de generacion de texto de baja complejidad, previa validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, del orden de 2-3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,1 GB para pesos; en 4 bits, aproximadamente 0,5-0,7 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contextos moderados; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. Tambien viable en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (confirmado por la libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible, aunque el formato safetensors es compatible con la mayoria de stacks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `bmars8218/zils-lite-body-1` | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (re-upload) | Copia sin cambios de Adjudex 0.8B |
| `newsbang/adjudex-0.8b` | ~0,8B (segun nombre) | no disponible | Apache 2.0 | Hugging Face (original) | Modelo base; fuente de evaluacion y limitaciones |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria; la comparativa se limita a identidad y licencia.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado por su autor: es un re-upload sin modificaciones; cualquier problema de calidad, sesgo o alucinacion proviene del modelo base `newsbang/adjudex-0.8b`.
- No hay evaluaciones publicadas en la informacion disponible: se desconoce su rendimiento en MMLU, HumanEval, GSM8K u otros benchmarks.
- Sesgos conocidos: no disponibles; deben consultarse en la model card original.
- Riesgo de alucinacion: no cuantificado; esperable en modelos de ~0,85B sin datos de evaluacion.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas ni ventana de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribucion; el repositorio incluye `LICENSE` y `NOTICE` que deben respetarse.
- Trazabilidad: el archivo `zils-owner.json` identifica la hotkey que registra el cuerpo en el pool de Zils; para produccion conviene usar el repositorio original de Newsbang en lugar de este re-upload.
- Advertencia de procedencia: al tratarse de un re-upload de terceros, conviene verificar la integridad de los pesos contra la revision original antes de desplegarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bmars8218/zils-lite-body-1
- Modelo base original: https://huggingface.co/newsbang/adjudex-0.8b
- Revision concreta de los pesos: https://huggingface.co/newsbang/adjudex-0.8b/tree/8fb432291598e1d02b6f59b8cd723c70fbcaf50f
- Zils (Bittensor subnet 127): no disponible en la informacion proporcionada (referenciado en la model card sin URL)
