# shourabhji3/UniAction

## Resumen

UniAction es un conjunto de adaptadores de condicionamiento por accion para modelos del mundo de video, desarrollado por Bowen Xue, Zizhang Li, Hong-Xing Yu y Jiajun Wu (repositorio KBRASK). Se construye sobre el backbone Wan-AI/Wan2.2-I2V-A14B y anade la capacidad de condicionar la generacion de video en cuatro modalidades de accion: fuerza, control de camara, pose de mano y pose de robot. El objetivo es unificar en un unico modelo del mundo distintas senales de control motor, de modo que un mismo backbone pueda simular interacciones fisicas y cinematicas coherentes con la accion aplicada.

El modelo se distribuye como dos ficheros de pesos (`stage1.safetensors` y `stage2.safetensors`) mas un `release.json`, que deben descargarse junto con el backbone Wan2.2-I2V-A14B original. El repositorio ocupa 2,0 GB, lo que corresponde a los adaptadores y no al backbone completo. La licencia de los adaptadores es Apache 2.0, mientras que el backbone Wan conserva su licencia original.

Es relevante para investigacion en world models, robotica y sintesis de video controlable, ya que propone una interfaz unificada de accion sobre un generador image-to-video de gran escala, con conjuntos de entrenamiento y evaluacion publicados de forma abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de condicionamiento sobre backbone de difusion image-to-video Wan2.2-I2V-A14B |
| Parametros totales | no disponible (el repo de 2,0 GB contiene adaptadores; el backbone se descarga aparte) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (adaptadores); el backbone Wan conserva su licencia original |
| Formato de pesos | safetensors (stage1.safetensors, stage2.safetensors) + release.json |

## Arquitectura y entrenamiento

UniAction no es un modelo generativo independiente, sino un sistema de adaptadores que condiciona el backbone Wan2.2-I2V-A14B, un modelo de difusion image-to-video. Los adaptadores incorporan cuatro senales de accion distintas (fuerza, control de camara, pose de mano y pose de robot) en un espacio de condicionamiento unificado, de forma que el backbone compartido genera video coherente con la accion especificada. La distribucion en dos etapas (`stage1` y `stage2`) sugiere un entrenamiento por fases, aunque la informacion disponible no detalla el proposito exacto de cada etapa.

Los datos de entrenamiento provienen de las fuentes EgoDex, Goal Force, DROID y SolarWM, cada una con sus propios terminos de uso. No se especifica en la informacion disponible el numero de tokens, horas de video ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (poco habituales en generacion de video). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de video condicionada por imagen inicial (image-to-video) mediante el backbone Wan2.2-I2V-A14B.
- Condicionamiento por fuerza: simulacion de interacciones fisicas aplicadas sobre objetos o escenas.
- Condicionamiento por control de camara: generacion de trayectorias de camara especificadas.
- Condicionamiento por pose de mano: sintesis de video coherente con movimientos de mano capturados.
- Condicionamiento por pose de robot: generacion de video para escenarios de robotica y manipulacion.
- Interfaz unificada de accion: un mismo modelo del mundo para multiples modalidades de control.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para ingles en metadatos, aunque al ser generacion de video el idioma no aplica directamente.

## Casos de uso

- Investigacion en world models: servir como banco de pruebas para estudiar como un backbone de difusion interpreta senales de accion heterogeneas y genera dinamicas fisicas plausibles.
- Robotica y planificacion de manipulacion: generar video de un robot ejecutando una pose objetivo para validar planes de movimiento antes de la ejecucion real.
- Simulacion de interacciones con fuerza: producir videos donde se aplica una fuerza concreta sobre un objeto para estudiar la respuesta fisica simulada.
- Control de camara cinematografico: generar tomas con trayectorias de camara definidas a partir de una imagen de referencia, util en previsualizacion.
- Captura de movimiento de manos: sintetizar video coherente con poses de mano para prototipado en interfaces gestuales o animacion.
- Generacion de datos sinteticos para entrenamiento: crear pares video-accion etiquetados que alimenten otros modelos de robotica o vision.
- Evaluacion comparativa de condicionamientos: usar los conjuntos UniAction-Eval para medir la fidelidad de la accion en la generacion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone Wan2.2-I2V-A14B (14B parametros, segun su nombre) y de la resolucion y duracion del video.
- GPU recomendadas: no disponible de forma especifica; por el tamano del backbone se espera necesitar GPU de datacenter (A100, H100) o equivalentes con memoria amplia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el autor remite al ejemplo de inferencia del repositorio de codigo (https://github.com/KBRASK/UniAction#inference); no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniAction | no disponible (adaptadores sobre Wan2.2-I2V-A14B de 14B) | no aplica | Fuerza, camara, pose de mano, pose de robot | Apache 2.0 (adaptadores) | Hugging Face, codigo y datasets publicos |
| Wan2.2-I2V-A14B (backbone) | 14B (segun denominacion) | no aplica | Solo imagen inicial | Licencia original Wan | Hugging Face |
| Otros world models con accion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con EgoDex, Goal Force, DROID y SolarWM, puede heredar sesgos de esos dominios (entornos de robotica, capturas en primera persona).
- Riesgo de alucinacion: como modelo generativo de video, puede producir dinamicas fisicas no realistas o inconsistencias temporales; no se han publicado metricas de fidelidad.
- Limitaciones de contexto o idioma: etiquetado solo para ingles en metadatos; el modelo no procesa texto de forma nativa.
- Restricciones de licencia: los adaptadores son Apache 2.0, pero el backbone Wan conserva su licencia original y las fuentes de entrenamiento mantienen sus propios terminos; es necesario revisarlos antes de uso comercial.
- Requiere descargar por separado el backbone Wan2.2-I2V-A14B, ademas de los tres ficheros del repositorio.
- Repositorio recien creado (24 de noviembre de 2026) con 0 descargas y 0 likes: madurez y soporte comunitario no verificados.
- No se documentan cuantizaciones ni requisitos de hardware, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shourabhji3/UniAction
- Paper: https://arxiv.org/abs/2610.32977
- Pagina del proyecto: https://uniaction.github.io/
- Codigo: https://github.com/KBRASK/UniAction
- Conjunto de entrenamiento: https://huggingface.co/datasets/BowenXue/UniAction-Train
- Conjunto de evaluacion: https://huggingface.co/datasets/BowenXue/UniAction-Eval
- Backbone Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
