# Concyclics/Cosmos3-Edge-NVFP4-AWQ

## Resumen

Concyclics/Cosmos3-Edge-NVFP4-AWQ es una superposicion de pesos (weight overlay) cuantizados en NVFP4 AWQ-lite publicada por el usuario Concyclics dentro de los experimentos ThunderWorld. No se trata de un modelo autonomo, sino del conjunto de pesos de cuantizacion del lado de generacion del modelo de video imagen-a-video nvidia/Cosmos3-Edge. El repositorio contiene pesos FP4 reales empaquetados, escalas de grupo E4M3, escalas tensoriales FP32 y prescalas de activacion BF16; el cargador incluido descarga el resto de componentes desde el checkpoint base oficial fijado.

El objetivo de la publicacion es servir como modelo de comparacion AWQ frente a otras variantes de cuantizacion (por ejemplo, el enfoque de reparacion W4A4 de ThunderWorld). El artefacto ocupa 0,8 GB en el repositorio y el payload tensorial empaquetado es de 793.813.664 bytes (~0,794 GB), que corresponde unicamente a la parte generativa cuantizada, no al almacenamiento ni a la VRAM totales del modelo.

La relevancia actual radica en que explora la viabilidad de ejecutar un modelo de generacion de video de la familia NVIDIA Cosmos en precision FP4 sobre kernels Marlin de vLLM (W4A16), un terreno donde la evidencia publica es escasa. La model card advierte explicitamente de que no se reclama una mejora de velocidad 4x ni superioridad frente a BF16/FP8, y que la validacion se limita a pruebas de humo y comprobaciones de operadores, no a una cualificacion de benchmark completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion; transformer de difusion para imagen-a-video con torre autorregresiva (AR) y VAE, 28 capas con operadores de atencion (`self_attn`) y MLP/MoE (`mlp_moe_gen`) |
| Parametros totales | No disponible (el payload cuantizado del lado de generacion es de ~0,794 GB, no es el total del modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (modelo de generacion de video; la longitud se controla por numero de frames, no por contexto textual) |
| Tipos de cuantizacion | NVFP4 AWQ-lite weight-only, esquema W4A16: pesos E2M1 FP4 empaquetados, escalas E4M3 por grupo K16, escala global FP32, activaciones BF16 con prescala de canal calibrada |
| Idiomas soportados | En (ingles) |
| Licencia | openmdw1.1-license (etiquetada como `license: other` en el repositorio) |
| Formato de pesos | safetensors (168 archivos con tensores FP4 empaquetados y escalas); requiere descarga adicional del checkpoint base |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna completa del modelo base. Si detalla el alcance de la cuantizacion: se cuantizan 168 operadores lineales del lado de generacion distribuidos en las 28 capas del modelo, concretamente `mlp_moe_gen.{up_proj,down_proj}` y `self_attn.{add_q_proj,add_k_proj,add_v_proj,to_add_out}`. El resto de parametros, incluida la torre autorregresiva (AR) y el VAE, se conservan del checkpoint base fijado (`nvidia/Cosmos3-Edge`, revision `a9d944e2c6a1bf9f48b92ad16348e70c5f1836ba`). La representacion de pesos usa E2M1 FP4 empaquetado, escalas E4M3 por grupo de K16 y una escala global FP32; las activaciones se mantienen en BF16 y se multiplican por la prescala de canal calibrada. La atencion es flash attention nativa de Torch en BF16 y la ejecucion usa el kernel Marlin W4A16 nativo de vLLM con reduccion en FP32.

La calibracion se realizo con la configuracion oficial de ModelOpt `NVFP4_AWQ_LITE_CFG`, con los cuantizadores de entrada y salida desactivados. Los datos de calibracion son los paneles docentes de desarrollo del modelo Edge I2V: 16 paneles full-M por operador, abarcando cuatro etapas de denoising y ambas ramas de CFG. La calibracion de pesos fue offline y la inferencia no realiza recalibracion. El export conserva las escalas originales del cuantizador y recupera exactamente los codigos FP4 congelados, incluidas las decisiones de limite en empates; no recuantiza un checkpoint BF16 decodificado. No se aplica reparacion de residuo (residual repair): el autor lo describe como el modelo de comparacion AWQ, no como la reparacion W4A4 de ThunderWorld.

## Capacidades

- Generacion de video a partir de una imagen de entrada (pipeline `image-to-video`), guiada por un prompt de texto en ingles que describe la accion o el movimiento, por ejemplo "A robot carefully picks up the object and places it on the table".
- Generacion de secuencias completas: el ejemplo documentado produce 121 frames a 480x832, con 20 pasos de denoising, CFG 6, flow shift 12, 24 FPS y semilla 0.
- Preservacion de los componentes no cuantizados del base: la torre autorregresiva y el VAE se mantienen en su precision original.
- Ejecucion mediante kernel Marlin W4A16 de vLLM con dequantizacion fusionada de pesos FP4 y GEMM en BF16.
- Integracion con Diffusers a traves del pipeline `Cosmos3OmniPipeline` (requiere un commit de Diffusers compatible con Cosmos3 y puede no estar disponible en una release estable generica).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vision adicionales; la calibracion se limita a Edge I2V y las modalidades de politica, razonamiento u otras no han sido cualificadas.

## Casos de uso

- Investigacion en cuantizacion de modelos de video: sirve como referencia AWQ-lite congelada para comparar frente a otras tecnicas de cuantizacion (por ejemplo, reparacion W4A4) midiendo NMSE de operadores y calidad de generacion en el mismo modelo base.
- Prototipado de animacion imagen-a-video: a partir de un fotograma fijo y un prompt de accion, generar un clip corto de 121 frames para validar ideas de storyboard o previsualizacion, usando el ejemplo de inferencia incluido como punto de partida.
- Simulacion para robotica y embodied AI: el prompt de ejemplo describe manipulacion robotica ("un robot recoge un objeto y lo coloca en la mesa"), lo que encaja con la generacion de datos sinteticos de video para entrenamiento o validacion de politicas en entornos simulados.
- Evaluacion de despliegue en GPUs Blackwell: permite medir el comportamiento real del kernel Marlin W4A16 sobre hardware RTX PRO 6000 Blackwell en un modelo de difusion de video, con datos de validacion de operadores ya publicados.
- Benchmarking interno de memoria y latencia: al incluir un payload cuantizado de ~0,794 GB separado de la carga del base en BF16, resulta util para estudiar el pico de memoria durante la carga y la sustitucion de los 168 modulos objetivo.
- Pruebas de integracion de pipelines: el script `infer.py` y `awq_loader.load_pipeline` permiten verificar la sustitucion completa de modulos y la generacion de smoke tests (por ejemplo, 61 frames a 192x320 en dos pasos) antes de escalar a configuraciones mayores.
- Analisis de fidelidad de exportacion: los ficheros de validacion (`export.json`, `portable_loader.json`) permiten reproducir la comparacion entre pesos decodificados y la referencia AWQ congelada, util para auditar herramientas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evidencia es de humo y no una cualificacion de benchmark completa, y que no se reclama igualar la calidad de BF16 o FP8. Como datos de validacion (no de benchmark) se incluyen:

| Validacion | Resultado |
|---|---|
| `validation/export.json` | Los 168 archivos safetensors conservan los bytes tensoriales originales; los pesos BF16 decodificados coinciden en valor numerico con la referencia AWQ y las prescalas coinciden de forma exacta; las diferencias de cero con signo se reportan por separado y no se describen como igualdad bit a bit |
| `validation/portable_loader.json` | 72 comprobaciones de operadores en RTX PRO 6000 Blackwell, seis tipos de operador, M129/M416, con y sin bias, entradas cambiadas y a cero, y equivalencia eager/Graph; NMSE maxima de salida frente a referencia: 1,334e-5 (umbral de cribado: 1e-4) |
| `validation/pipeline_smoke.json` | Carga completa del base, sustitucion de los 168 modulos y generacion de dos pasos de 61 frames a 192x320 mediante el cargador portable de Diffusers: superado (comprueba integracion, no calidad a longitud completa) |
| Smoke de investigacion | El adaptador de investigacion completo generacion Edge I2V de humo en dos escenas y dos semillas por escena en RTX PRO 6000 Blackwell; evidencia limitada, no cualificacion de benchmark completo |

## Requisitos de hardware

- GPU con CUDA compatible con el kernel Marlin de vLLM; la validacion se realizo en RTX PRO 6000 Blackwell. El rendimiento en RTX 5090 no queda establecido por esta release.
- VRAM total: no disponible. El payload cuantizado empaquetado es de ~0,794 GB, pero el modelo base debe descargarse y cargarse inicialmente en BF16 antes de sustituir los 168 modulos objetivo, por lo que el pico de memoria de carga supera la memoria residente final del modelo empaquetado.
- No se documentan cifras de latencia ni throughput.
- Entorno de referencia: Linux, Python 3.12, Torch 2.11.0 y vLLM 0.25.1; `requirements.txt` fija un commit de Diffusers compatible con Cosmos3.
- No hay fallback automatico a BF16 si Marlin falla.
- Limitaciones de despliegue del cargador incluido: no soporta offloading de dispositivo, paralelismo de pipeline, entrenamiento ni volver a guardar el pipeline mutado con `save_pretrained`. Se debe usar la GPU final desde el principio e instalar la superposicion antes de la captura de CUDA Graph.
- El ejemplo de inferencia usa inferencia eager de Diffusers, no las optimizaciones de grafo ni de cache AR del runner de investigacion. Tambien desactiva el comprobador de seguridad opcional.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/Cosmos3-Edge | Modelo base (BF16, sin cuantizar) del que deriva esta superposicion | No disponible | No disponible | No disponible en la informacion | Hugging Face (`nvidia/Cosmos3-Edge`) |
| Concyclics/Cosmos3-Edge-NVFP4-AWQ | Cuantizacion AWQ-lite W4A16 del base (este modelo) | No disponible; payload cuantizado ~0,794 GB | No disponible | openmdw1.1-license | Hugging Face; requiere descargar el base y usar el cargador propio |
| Otras variantes de cuantizacion (p. ej. reparacion W4A4 de ThunderWorld) | Alternativas de cuantizacion sobre el mismo base | No disponible | No disponible | No disponible en la informacion | Referenciadas cualitativamente en la model card, sin enlace |

No se dispone de datos de parametros, contexto ni rendimiento de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: el repositorio contiene solo la parte cuantizada. Es obligatorio descargar los componentes restantes del checkpoint base fijado (`nvidia/Cosmos3-Edge`, revision `a9d944e2c6a1bf9f48b92ad16348e70c5f1836ba`).
- No debe pasarse directamente a `DiffusionPipeline.from_pretrained` ni cargarse con un cargador AWQ INT4 estandar.
- No es una release de NVIDIA; el autor indica explicitamente que se trata de un trabajo independiente dentro de los experimentos ThunderWorld.
- La calibracion esta orientada a Edge I2V. Las modalidades de politica, razonamiento y otras no han sido cualificadas para esta release cuantizada.
- El cargador usa dequantizacion fusionada de pesos FP4 con GEMM en BF16, no computo nativo en Tensor Cores con activaciones FP4. No se reclama una mejora de velocidad 4x ni superioridad frente a BF16/FP8.
- La evidencia de calidad es limitada: pruebas de humo de dos escenas y dos semillas, y una prueba de pipeline de dos pasos a 192x320. No constituye una cualificacion de benchmark ni una afirmacion de igualar la calidad de BF16 o FP8.
- El rendimiento en RTX 5090 no esta establecido por esta release.
- El ejemplo desactiva el comprobador de seguridad opcional, siguiendo la ruta de investigacion; antes de desplegar debe consultarse la documentacion de seguridad upstream.
- No hay fallback automatico a BF16 si el kernel Marlin falla; no se soportan offloading, paralelismo de pipeline, entrenamiento ni re-guardado del pipeline mutado.
- Riesgo de alucinacion o artefactos de generacion: no se documenta una evaluacion especifica de fidelidad visual, sesgos ni alucinacion en la informacion disponible.
- Idiomas: solo se declara ingles, y el prompt se usa de forma literal, sin servicio de expansion de prompt.
- La licencia es openmdw1.1-license, etiquetada como `other`; deben revisarse los terminos del enlace de licencia antes de cualquier uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Concyclics/Cosmos3-Edge-NVFP4-AWQ
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la busqueda web proporcionada.
