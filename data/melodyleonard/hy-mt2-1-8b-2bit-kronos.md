# melodyleonard/Hy-MT2-1.8B-2bit-kronos

## Resumen

Hy-MT2-1.8B-2bit-kronos es un reempaquetado del modelo de traduccion Hy-MT2-1.8B de Tencent, en su variante de cuantizacion de 2 bits con entrenamiento consciente de cuantizacion (QAT). El autor del repositorio, melodyleonard, ha convertido los pesos originales en formato GGUF al contenedor propietario `q2c` del runtime Kronos (`kronos-q2c.k2tb`, 501 MB), pensado para inferencia en dispositivo (on-device) dentro del teclado de traduccion Translate keyboard.

La relevancia del artefacto es doble: por un lado, demuestra la viabilidad de ejecutar un modelo de traduccion de 1.800 millones de parametros comprimido a 2 bits en hardware de consumo; por otro, ilustra un patron de distribucion de pesos donde la cuantizacion no se rehace, sino que se copia bit a bit y solo cambia el contenedor. El modelo base es propiedad de Tencent y la licencia del derivado es Apache-2.0, la misma que la del original.

No se dispone de informacion sobre la arquitectura interna, los idiomas soportados ni los resultados de evaluacion en la documentacion proporcionada; la model card se limita a describir el proceso de reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `hunyuan_v1_dense` sugiere la familia Hunyuan, transformer denso) |
| Parametros totales | 1,8 mil millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits con entrenamiento consciente de cuantizacion (QAT), formato `q2c` de Kronos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `kronos-q2c.k2tb` (contenedor Kronos q2c), 501 MB; derivado de GGUF de 2 bits |
| Tamano del repositorio | 1,0 GB |
| Libreria de inferencia | Kronos |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la informacion disponible. El tag `hunyuan_v1_dense` asociado al modelo apunta a la familia Hunyuan de Tencent en su variante densa, pero no se especifica numero de capas, dimension oculta, mecanismo de atencion ni composicion del corpus de entrenamiento.

El dato tecnico relevante es el proceso de cuantizacion: los pesos de 2 bits provienen del modelo `tencent/Hy-MT2-1.8B-2Bit-GGUF`, que aplica cuantizacion consciente de entrenamiento (QAT) para preservar calidad a tan solo 2 bits por parametro. El reempaquetado a Kronos no vuelve a cuantizar: copia los pesos exactamente y solo cambia el contenedor, ademas de minimizar el `tokenizer.json`. No se indica si hubo RLHF, DPO ni fases de ajuste fino posteriores.

## Capacidades

- Traduccion automatica: es la tarea declarada en el pipeline del modelo (`translation`).
- Inferencia en dispositivo: el formato `q2c` y el tamano de 501 MB estan disenados para ejecucion local en movil o hardware de bajos recursos.
- Integracion con el teclado Translate keyboard: el modelo se distribuye como artefacto de soporte de esa aplicacion.
- Generacion de texto multilingue: presumible, dado el proposito del modelo base, aunque los idiomas concretos no estan documentados.
- Tool calling, agentes, vision, audio y modo thinking: no disponible; no hay evidencia de estas capacidades.

## Casos de uso

- Traduccion en teclado movil sin conexion: el modelo se ejecuta localmente dentro de Translate keyboard con 501 MB de pesos, lo que permite traducir mientras se escribe sin enviar texto a un servidor y sin depender de red.
- Traduccion de mensajes en dispositivos con poca memoria: la cuantizacion a 2 bits reduce la huella a aproximadamente medio gigabyte, viable en telefonos de gama media con 4-6 GB de RAM.
- Procesamiento de texto sensible con privacidad estricta: al no requerir salida a la nube, encaja en escenarios donde el contenido no puede salir del dispositivo (mensajeria personal, notas, correo interno).
- Prototipado de pipelines de traduccion con el runtime Kronos: sirve para evaluar el formato `q2c` y la libreria Kronos antes de adoptarla en produccion.
- Traduccion de subtitulos o textos cortos en aplicaciones de escritorio: con 1,8B parametros y 2 bits, es adecuado para traduccion frase a frase con latencia baja en CPU.
- Distribucion de modelos derivados: el repositorio ejemplifica como reempaquetar pesos GGUF a un contenedor alternativo sin re-cuantizar, util para equipos que mantienen forks de runtimes de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 501 MB en formato `q2c`; con overhead de runtime y cache KV, el consumo real sera mayor, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El proposito declarado es on-device, por lo que el objetivo son CPU moviles y SoCs integrados, no GPUs de datacenter.
- GPU de consumo: no hay datos de compatibilidad con RTX 4090, A100 o H100; el formato Kronos no es un runtime de GPU de proposito general.
- Opciones de despliegue: runtime Kronos (libreria `kronos`, repositorio `melodyLeonard/kronos-2t`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el contenedor es propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy-MT2-1.8B-2bit-kronos | 1,8B | no disponible | 2 bits QAT | Apache-2.0 | Kronos q2c | Reempaquetado on-device |
| tencent/Hy-MT2-1.8B-2Bit-GGUF | 1,8B | no disponible | 2 bits QAT | Apache-2.0 | GGUF | Modelo base del que deriva |
| Hy-MT2-1.8B (original) | 1,8B | no disponible | completa (presumible) | Apache-2.0 | safetensors (presumible) | Referencia de calidad sin cuantizar |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de traduccion de tamano similar.

## Limitaciones y advertencias

- La cuantizacion a 2 bits, aunque sea QAT, implica perdida de calidad frente a los pesos completos; no se publican metricas de esa degradacion.
- No hay informacion sobre idiomas soportados, por lo que no se puede garantizar cobertura para pares linguisticos concretos.
- El formato `q2c` esta atado al runtime Kronos; no es portable a llama.cpp, vLLM ni otras herramientas estandar, lo que limita su uso fuera del ecosistema del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no documentados; al ser un modelo de traduccion, el riesgo principal es la fidelidad de la traduccion, no verificada de forma independiente.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el `LICENSE.txt` del repositorio y las condiciones del modelo base de Tencent.
- El pipeline se declara como `translation`, pero no se especifica si el modelo admite instrucciones arbitrarias o solo traduccion directa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/melodyleonard/Hy-MT2-1.8B-2bit-kronos
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B-2Bit-GGUF
- Runtime Kronos: https://github.com/melodyLeonard/kronos-2t
- Aplicacion Translate keyboard: https://github.com/melodyLeonard/translate-keyboard
