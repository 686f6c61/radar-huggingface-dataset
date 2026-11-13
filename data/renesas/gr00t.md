# Renesas/GR00T

## Resumen

GR00T (Renesas/GR00T) es un paquete de despliegue optimizado del modelo fundacional vision-lenguaje-accion (VLA) de NVIDIA para robots humanoides, adaptado por Renesas a la plataforma R-Car Gen5 (placa X5H). El modelo subyacente es `nvidia/GR00T-N1.5-3B`, aunque la documentación del paquete hace referencia a la variante GR00T-N1.7-3B afinada sobre el conjunto de datos LIBERO. El modelo mapea dos imagenes de camara y una instruccion en lenguaje natural, junto con el estado del robot, a un chunk de acciones de 40 pasos temporales.

La relevancia de esta publicacion no reside en el modelo en si, sino en la cadena de despliegue: un runner precompilado para aarch64 Linux que ejecuta el encoder de vision, el backbone LLM (cuantizado W4A16: pesos de 4 bits, activaciones de 16 bits) y la cabeza de accion sobre la NPU del SoC Renesas X5H, sin necesidad de toolchain en placa. Es un ejemplo de portado de un VLA de 3B parametros a hardware embebido de automocion/robotica.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta marcado con el tag `coming-soon` y se distribuye bajo licencia "other". El tamano del repo es de 0.8 GB, correspondiente unicamente al instalador; los pesos GGUF (6.3 GB adicionales) se descargan por separado desde un SharePoint corporativo de Renesas, no desde Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): encoder de vision tipo transformer con patch embedding y DeepStack, backbone LLM tipo Qwen3-VL y cabeza de accion basada en DiT (Diffusion Transformer con cross-attention y self-attention) |
| Parametros totales | 3B (segun el nombre del checkpoint base, `nvidia/GR00T-N1.5-3B` / GR00T-N1.7-3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el backbone procesa 156 tokens de vision-lenguaje segun el benchmark) |
| Tipos de cuantizacion | W4A16 en el backbone (pesos int4, activaciones fp16); encoder de vision y cabeza de accion en F16 |
| Idiomas soportados | no disponible (las instrucciones son en lenguaje natural, sin listado de idiomas) |
| Licencia | other |
| Formato de pesos | GGUF (tres ficheros: vision F16, LLM/embeddings F16, action head F16) mas secciones int4 propietarias del backbone en el paquete del runner |

## Arquitectura y entrenamiento

El modelo sigue el diseno VLA de NVIDIA GR00T: un encoder de vision que procesa las imagenes de camara mediante patch embedding, 24 capas transformer y modulos DeepStack merger en las capas 5, 11 y 17; un backbone LLM derivado de Qwen3-VL que inyecta caracteristicas visuales en las capas 0, 1 y 2 mediante DeepStack inject y que en el despliegue se ejecuta con 16 capas transformer en W4A16; y una cabeza de accion DiT que genera el chunk de acciones mediante 16 bloques de cross-attention y 16 de self-attention, iterados 4 pasos con actualizaciones de Euler. La cabeza incluye un adaptador VL con self-attention sobre los 156 tokens de vision-lenguaje.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint desplegado corresponde a un afinamiento sobre el suite `libero_10` del benchmark LIBERO, orientado a tareas de manipulacion robotica. La innovacion tecnica destacable es el propio pipeline de despliegue: compilacion de los grafos del encoder, backbone y cabeza de accion para la NPU NPX48K del X5H, con cuantizacion int4 del backbone y ejecucion integra en NPU sin intervencion de la CPU para las operaciones matriciales principales.

## Capacidades

- Generacion de acciones roboticas: produce un chunk de 40 pasos temporales de acciones del robot a partir de dos imagenes de camara, una instruccion en lenguaje y el estado actual del robot.
- Comprension visio-linguistica: encoder de vision con 24 capas transformer y fusion DeepStack con el backbone de lenguaje.
- Seguimiento de instrucciones en lenguaje natural para control de manipuladores y humanoides.
- Ejecucion en hardware embebido: inferencia completa (vision, backbone y cabeza de accion) sobre NPU del SoC Renesas R-Car X5H.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingues explicitas.

## Casos de uso

- Manipulacion robotica en laboratorio: ejecucion del episodio de prueba LIBERO incluido en el paquete (`test_data/libero_10_ep0`) para validar la cadena de inferencia completa sobre la placa X5H antes de desplegar en un robot real.
- Prototipado de humanoides con control por lenguaje: el modelo traduce instrucciones como "coge el objeto" en chunks de 40 acciones, adecuado para brazos y bases moviles en fase de desarrollo.
- Robotica embebida de bajo consumo: al ejecutarse integramente en NPU con backbone int4, encaja en plataformas con restricciones termicas y de potencia propias del automocion (R-Car Gen5).
- Evaluacion de hardware para VLA: el benchmark por etapa (vision 75.4 ms, LLM 52.1 ms, cabeza 196.8 ms en NPU) permite dimensionar si la latencia de 447.4 ms por observacion es aceptable para el bucle de control de un robot concreto.
- Investigacion en imitation learning: el checkpoint afinado sobre `libero_10` sirve como base para comparar politicas VLA en tareas estandarizadas de manipulacion.
- Integracion en pipelines de robotica industrial: el instalador autocontenido y los scripts de arranque de NPU (`setup_npu.sh`, `npuN_power_on.sh`) facilitan el despliegue reproducible en flotas de placas X5H.

## Benchmarks y rendimiento

Los unicos datos publicados son los tiempos de inferencia del runner sobre la NPU del X5H, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

| Etapa | Tiempo NPU | Tiempo wall por observacion |
|---|---|---|
| Encoder de vision | 75.4 ms | 81.7 ms |
| Backbone LLM | 52.1 ms | 144.6 ms |
| Cabeza de accion | 196.8 ms | 207.3 ms |
| **Total** | **324.3 ms** | **447.4 ms** |

Desglose del encoder de vision: patch embedding 1.4 ms, 24 capas transformer 66.2 ms, DeepStack merger 5.7 ms, patch merger 1.7 ms, lectura 0.4 ms. Desglose del backbone: 16 capas transformer W4A16 49.3 ms, DeepStack inject 1.7 ms, preparacion de entrada 0.8 ms, norm final 0.2 ms, lectura 0.1 ms. Desglose de la cabeza de accion: 128 llamadas a bloque DiT 168.8 ms, adaptador VL 16.3 ms, K/V de cross-attention 7.0 ms, codificacion de estado y accion 3.2 ms, proyeccion de salida y decoder 1.3 ms.

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- Placa objetivo: R-Car X5H (b001, doble NPX48K) con acceso root; el runner esta precompilado para aarch64 Linux y no requiere toolchain en placa.
- Espacio en disco: aproximadamente 0.5 GB para el paquete, 0.5 GB tras la instalacion y 6.3 GB adicionales para los tres ficheros GGUF.
- Memoria: no se especifica el consumo de RAM del sistema; los pesos del backbone int4 ocupan aproximadamente 440 MB en secciones de coeficientes.
- GPU: no aplica; el despliegue esta disenado para la NPU del X5H. No se documenta ejecucion en GPU de escritorio ni en consumer GPU.
- Opciones de despliegue: runner propietario `groot-vla-q-runner` con scripts `run_demo.sh`, `setup_npu.sh` y `npuN_run.sh`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 447.4 ms de wall time por observacion (324.3 ms en NPU) segun el benchmark del autor. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/GR00T (este) | 3B | no disponible | VLA para robotica, desplegado en NPU X5H | other | Paquete en HF; pesos GGUF via SharePoint |
| nvidia/GR00T-N1.5-3B | 3B | no disponible | VLA base de NVIDIA para humanoides | no disponible en la informacion | Hugging Face (modelo base) |
| nvidia/GR00T-N1.7-LIBERO | 3B | no disponible | VLA afinado sobre LIBERO `libero_10` | no disponible en la informacion | Pesos GGUF referenciados por el autor |

No se dispone de datos de benchmarks de calidad para establecer una comparacion cuantitativa con alternativas como OpenVLA u otras politicas VLA.

## Limitaciones y advertencias

- El repositorio esta marcado como `coming-soon`: la publicacion puede ser incompleta o sujeta a cambios.
- Los pesos no se alojan en Hugging Face; se descargan desde un SharePoint corporativo de Renesas, lo que limita la reproducibilidad y la verificacion independiente.
- La licencia es "other" sin texto visible en la informacion proporcionada; es imprescindible revisar los terminos antes de cualquier uso comercial.
- El modelo esta afinado especificamente sobre el suite `libero_10`; su generalizacion a otras tareas de manipulacion no esta documentada.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluacion de seguridad en entornos fisicos.
- El despliegue esta atado al hardware X5H; no se documenta portabilidad a otras NPU, GPU o CPU.
- La latencia de 447.4 ms por observacion puede ser limitante para bucles de control que requieran frecuencias superiores a aproximadamente 2 Hz.
- No se especifican los idiomas soportados por las instrucciones de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renesas/GR00T
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Repositorio oficial de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Carpeta de pesos GGUF (SharePoint de Renesas): https://htecgroup.sharepoint.com/sites/Renesas/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FRenesas%2FShared%20Documents%2FGeneral%2FTest%20Data%2FGR00T%201%2E7%203B%2FGGUF
