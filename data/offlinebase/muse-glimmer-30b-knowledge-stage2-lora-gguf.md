# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA-GGUF

## Resumen

Muse-Glimmer-30B-Knowledge-Stage2-LoRA-GGUF es un adaptador LoRA en formato GGUF para llama.cpp, derivado del fine-tune Knowledge Stage 2 de Muse Glimmer 30B. Lo publica el usuario OfflineBase como parte de la familia "Muse Spark Open" y esta pensado exclusivamente para pruebas de servicio (serving test) sobre el modelo base `meta-models/Muse-Glimmer-30B`. No es un modelo completo: es un adaptador de 838 MB que se carga sobre los pesos base y se aplica con escala 1 por defecto.

El repositorio tiene 0 descargas y 0 likes, fue creado el 2 de noviembre de 2026 y el propio autor lo describe como privado: no ha pasado la revision de licencia ni de datos personales que requeriria una publicacion publica. El dato de parametros totales del safetensors (419.181.568) corresponde al adaptador, no a los 30B del modelo base, lo que conviene tener en cuenta al planificar el despliegue.

La relevancia de esta ficha es documental y de evaluacion: permite entender como se empaqueta un LoRA de actualizacion de conocimiento en GGUF para llama.cpp, que restricciones de licencia arrastra al derivar de un modelo con Muse Model License y por que el autor advierte de que no debe usarse como fuente de hechos sin verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Muse Glimmer 30B; formato GGUF para llama.cpp |
| Parametros totales | 419.181.568 (adaptador, segun safetensors); el modelo base es de 30B |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LoRA GGUF; el autor indica carga con escala 1 por defecto; cuantizaciones concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (other) |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango bajo convertido a fichero LoRA GGUF para llama.cpp, que se superpone al modelo base Muse Glimmer 30B (revision `cec94fcfd6512f2cfe708138c32533b346ea4f69`). El tamano del adaptador es de 838 MB y el autor indica que se carga con escala 1 por defecto. No se detalla el rango del LoRA, el numero de pasos de entrenamiento ni la composicion exacta del dataset de la etapa 2.

El entrenamiento corresponde a la etapa 2 del fine-tune de actualizacion de conocimiento de la familia Knowledge. Segun el autor, los datos de entrenamiento provienen de noticias publicas y texto web, incluidas paginas de editores recogidas mediante CC-NEWS, y parte de esos datos fue escrita por Muse Spark Open. No se documentan tecnicas de RLHF o DPO, ni innovaciones de decodificacion. El autor advierte que los resultados de la etapa 2 en si estan en el repositorio hermano `OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA`, no en este.

## Capacidades

- Generacion de texto sobre el modelo base Muse Glimmer 30B mediante carga del adaptador LoRA en llama.cpp.
- Actualizacion de conocimiento (knowledge-update): el adaptador esta entrenado para incorporar informacion mas reciente que la del modelo base, segun la etiqueta del repositorio.
- Aplicacion de un adaptador de bajo rango sobre pesos existentes, sin necesidad de fusionar pesos permanentemente.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Pruebas de serving de LoRA en llama.cpp: cargar el adaptador con escala 1 sobre el modelo base para medir throughput y estabilidad en un servidor, tal como indica el autor en su run log.
- Evaluacion de actualizacion de conocimiento: comparar respuestas del modelo base con y sin el adaptador en dominios cubiertos por noticias y texto web reciente, para medir cuanto conocimiento nuevo incorpora.
- Experimentacion interna de investigacion: usar el adaptador como punto de partida para estudiar como se comporta un LoRA de conocimiento en formato GGUF antes de invertir en un fine-tune completo.
- Validacion de pipelines de conversion LoRA a GGUF: servir de caso de prueba para verificar que la conversion y la carga del adaptador funcionan en la version de llama.cpp del equipo.
- Benchmarking de latencia en hardware concreto: el autor reporta 37,5 frente a 50,7 tokens por segundo con escala 1 en un servidor, util como referencia para comparar configuraciones.
- Docencia y formacion tecnica: ilustrar las obligaciones de la Muse Model License al derivar y redistribuir adaptadores, incluida la atribucion "Built with Muse Spark Open".
- No recomendado para atencion al cliente, generacion de codigo en produccion ni cualquier uso factual sin verificacion, dado el riesgo de alucinacion declarado por el autor.

## Benchmarks y rendimiento

El autor solo reporta una medida de throughput en su run log: 37,5 tokens por segundo con el adaptador cargado a escala 1, frente a 50,7 tokens por segundo sin el. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Con LoRA (escala 1) | Sin LoRA |
|---|---|---|
| Throughput (tokens/s, un servidor) | 37,5 | 50,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del modelo base Muse Glimmer 30B y de su cuantizacion, que no se especifica en este repositorio.
- El adaptador ocupa 838 MB en disco y debe sumarse al espacio de los pesos base en memoria.
- GPU recomendadas: no disponibles; el autor solo menciona pruebas en "un servidor" sin detallar GPU.
- Compatibilidad con GPU de consumo: no confirmada. El autor indica explicitamente que no se ha ejecutado en una Jetson en ningun log disponible.
- Opciones de despliegue: llama.cpp con soporte de LoRA GGUF; el autor menciona carga con escala 1 por defecto. Otras opciones (vLLM, TGI, Ollama) no estan documentadas para este artefacto.
- Latencia y throughput: 37,5 tokens/s con LoRA a escala 1 frente a 50,7 tokens/s sin LoRA, medidos en un unico servidor no identificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage2-LoRA-GGUF (este) | Adaptador de 419 M sobre base de 30B | no disponible | GGUF (LoRA) | apache-2.0-and-muse-model-license | Publico en HF, 0 descargas, autor lo describe como privado |
| OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA | no disponible | no disponible | LoRA (no GGUF) | no disponible | Repositorio hermano citado por el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B (base) | no disponible | no disponible | no disponible | Modelo Knowledge publicado segun el autor |
| meta-models/Muse-Glimmer-30B | 30B | no disponible | no disponible | Apache 2.0 | Modelo base de Meta |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: el autor advierte que el modelo "inventa cosas y afirma respuestas incorrectas como hechos"; no debe usarse para datos factuales sin una fuente.
- Estado de publicacion: el repositorio se describe como privado y sin la revision de licencia y datos personales necesaria para una publicacion publica.
- Datos de entrenamiento: provienen de noticias publicas y texto web, incluidas paginas de editores recogidas via CC-NEWS; el autor senala que publicar pesos entrenados con esos datos es una cuestion abierta.
- Licencia: al ser derivado de Muse Glimmer 30B y contener datos escritos por Muse Spark Open, es un Derivado bajo la Muse Model License. Hay que conservar `LICENSE`, `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE` en cada copia, mostrar "Built with Muse Spark Open" en la interfaz, documentacion, web o menu de ajustes, y cumplir la seccion 3 de la licencia.
- Restricciones de uso: las politicas de Muse Glimmer y Muse Spark Open prohiben el uso por menores de 18 anos y presentar las salidas como escritas por una persona; hay que informar a los usuarios de los peligros conocidos.
- No es un lanzamiento oficial de Meta: Meta no ha revisado ni respaldado el modelo y no ofrece garantia.
- Este artefacto no es el modelo Knowledge publicado; ese es `OfflineBase/Muse-Glimmer-30B-2026-Knowledge`.
- No se declaran idiomas soportados ni longitud de contexto; no hay datos sobre sesgos especificos de este adaptador.
- Sin soporte verificado en Jetson ni en GPU de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA-GGUF
- Repositorio hermano de la etapa 2 (LoRA): https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-LoRA
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Licencia en el repositorio: LICENSE (referenciado por el autor como `LICENSE`, junto con `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
