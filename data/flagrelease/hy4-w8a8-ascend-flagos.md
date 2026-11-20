# FlagRelease/Hy4-W8A8-ascend-FlagOS

## Resumen

Hy4 es un modelo multimodal desarrollado por Tencent Hunyuan, orientado a escenarios de productividad real. Esta ficha concreta, `FlagRelease/Hy4-W8A8-ascend-FlagOS`, no es el checkpoint original de Tencent, sino una distribucion cuantizada a 8 bits (W8A8) empaquetada por la comunidad FlagOS para su despliegue sobre hardware Huawei Ascend 910C. El repositorio incluye los pesos en formato safetensors y una guia de despliegue basada en SGLang con el plugin `sglang-plugin-FL`, sobre dos hosts con 16 dies NPU cada uno.

El modelo combina percepcion de imagen, razonamiento y uso de herramientas para abordar tareas como interpretacion de graficos complejos, operacion de software profesional, desarrollo front-end y de videojuegos, trabajo financiero de oficina e investigacion cientifica. Respecto a la version preview, la version oficial amplia el preentrenamiento y el postentrenamiento, e incorpora por primera vez comprension visual y capacidades de operacion de ordenador. Los datos publicados indican una subida en Terminal-Bench 4.0 de 26,3 a 44,4 y en AutomationBench v1.0.6 de 36,3 a 56,2.

El checkpoint cuenta con 774.434.002.142 parametros (unos 774 mil millones) y un peso total del repositorio de 789,6 GB. La licencia es Apache 2.0 y los idiomas declarados son chino e ingles. La relevancia actual de esta publicacion radica en que demuestra la portabilidad de un modelo multimodal de gran escala a un stack de computo no NVIDIA, con un stack de software unificado (FlagOS 2.2) que abarca nueve fabricantes de chips.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles completos no disponibles; el despliegue usa atencion DP8 x TP4 y MoE EP32) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | 139.264 tokens (configurada en el servicio, incluye entrada y salida) |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones, formato compressed-tensors) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna completa del modelo. La configuracion de despliegue revela el uso de paralelismo de expertos (MoE EP32) junto con atencion con paralelismo de datos 8 y de tensor 4 (DP8 x TP4), lo que confirma que se trata de un transformer con mezcla de expertos de gran escala. Tambien se menciona el uso de MTP (multi-token prediction) en el modelo, aunque en esta imagen concreta aparece deshabilitado. La model card de FlagOS no incluye datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Respecto a la innovacion tecnica, la aportacion principal de esta publicacion es de infraestructura, no de modelado: la adaptacion Day-0 a nueve plataformas de chips (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX) mediante el stack FlagOS 2.2, con optimizaciones a nivel de framework y de operadores. En pruebas de dos nodos con 16 GPU y 64 peticiones concurrentes sobre NVIDIA, la version FlagOS reporta hasta un 32,1 % mas de throughput de salida y hasta un 39,2 % menos de latencia media por token frente a la solucion nativa de NVIDIA.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto e imagen a traves de una API compatible con OpenAI.
- Comprension visual: interpretacion de graficos complejos y documentos visuales, capacidad introducida en la version oficial.
- Operacion de ordenador: control de software profesional, capacidad nueva respecto a la preview.
- Uso de herramientas (tool calling / function calling): integrado en el diseno del modelo para tareas de productividad.
- Razonamiento multi-paso y ejecucion de tareas de horizonte largo (long-horizon task execution).
- Investigacion profunda (deep research) e instrucciones complejas con seguimiento mejorado.
- Capacidades matematicas y cientificas, evidenciadas por los resultados en Math-500 y GPQA Diamond.
- Soporte multilingue limitado a chino e ingles.
- Modo de prediccion multi-token (MTP) presente en el modelo, aunque deshabilitado en esta imagen de despliegue.

## Casos de uso

- Atencion al cliente automatizada: con una ventana de 139.264 tokens, el modelo puede mantener conversaciones multi-turno con historial extenso y documentacion adjunta sin truncar el contexto.
- Desarrollo front-end y de videojuegos: la combinacion de generacion de codigo, comprension visual y operacion de software permite generar interfaces, interpretar capturas de pantalla y validar resultados en herramientas de desarrollo.
- Trabajo financiero de oficina: interpretacion de graficos y tablas complejas para analisis de informes, con razonamiento sobre datos visuales que otros modelos de texto no cubren.
- Investigacion cientifica asistida: uso de razonamiento multi-paso y deep research para sintetizar literatura, contrastar hipotesis y ejecutar flujos de analisis con llamadas a herramientas.
- Automatizacion de tareas de escritorio (RPA con IA): la capacidad de operar software profesional permite sustituir scripts fragiles por agentes que interpretan la interfaz visual y actuan en consecuencia.
- Agentes de larga duracion en entornos controlados: Terminal-Bench y AutomationBench miden precisamente tareas de terminal y automatizacion; el modelo es adecuado para pipelines de agentes que requieran seguir instrucciones durante muchos pasos.
- Despliegue soberano sobre hardware no NVIDIA: organizaciones con infraestructura Ascend, Hygon o T-Head pueden servir un modelo multimodal de 774 mil millones de parametros sin depender de GPU NVIDIA, usando la imagen Docker y el stack FlagOS documentados.

## Benchmarks y rendimiento

| Metrica | Hy4-Nvidia-Origin | Hy4-Ascend-FlagOS |
|---|---|---|
| Math-500 | 96,2 | 95,59 |
| GPQA_Diamond | 93,65 | 93,16 |
| MMBench | 91,2 | evaluando |
| MMStar | 79,67 | evaluando |

Los datos de MMBench y MMStar para la version Ascend FlagOS no estaban disponibles en el momento de la publicacion. La model card indica explicitamente que no se repitieron la evaluacion completa del modelo ni los benchmarks de rendimiento para esta imagen; las cifras de la columna FlagOS corresponden a las pruebas reportadas. En rendimiento de inferencia, sobre NVIDIA la version FlagOS reporta hasta un 32,1 % mas de throughput y hasta un 39,2 % menos de latencia por token que la solucion nativa, en configuracion de dos nodos, 16 GPU y 64 peticiones concurrentes.

## Requisitos de hardware

- VRAM/NPU: el despliegue de referencia requiere dos hosts, cada uno con 16 dies NPU Ascend 910C, conectados por HCCS dentro del mismo superpod. No se documenta una configuracion de menor escala.
- GPU/NPU recomendadas: Huawei Ascend 910C (configuracion validada). La adaptacion cubre tambien Hygon, Kunlunxin, T-Head, NVIDIA, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX, aunque esta imagen concreta esta empaquetada para Ascend.
- GPU de consumo: no cabe en ninguna GPU de consumo; el checkpoint pesa 789,6 GB y el modelo tiene 774 mil millones de parametros.
- Opciones de despliegue: SGLang 0.5.11 (commit `600df8dd498955f5aef4417383ea9ae5d2c238f7`) con `sglang-plugin-FL` 0.1.0, FlagGems y Triton-Ascend 3.2.0, sobre CANN 8.5.0 A3 y driver 25.5.0. La imagen Docker se distribuye desde `harbor.baai.ac.cn/flagrelease-public/`.
- Configuracion de runtime: atencion DP8 x TP4, MoE EP32, prefill en modo eager, graph replay para decode, MTP y prefix caching deshabilitados. Perfil por defecto `HY4_PROFILE=safe`.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo para esta imagen; solo las mejoras relativas frente a la solucion nativa de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4 (esta ficha, W8A8 Ascend) | 774,4 mil millones | 139.264 tokens | Apache 2.0 | Pesos en Hugging Face y ModelScope; imagen Docker FlagOS |
| Hy4-Nvidia-Origin | no disponible | no disponible | Apache 2.0 (presumible, no confirmado) | Referencia de comparacion en la model card; no se documenta su distribucion |
| Hy4 preview | no disponible | no disponible | no disponible | Version previa citada por la model card |

No se dispone de informacion sobre otros modelos multimodales comparables de la misma escala en el material proporcionado, por lo que la comparativa se limita a las variantes del propio Hy4.

## Limitaciones y advertencias

- La model card advierte que la validacion de empaquetado solo comprueba ficheros fuente fijados, importaciones de dependencias, la CLI de SGLang y las configuraciones de arranque; no se repitieron la evaluacion completa ni los benchmarks de rendimiento.
- El perfil `HY4_PROFILE=historical` presenta una limitacion conocida de correccion en prefill con B>1; debe usarse solo para reproduccion controlada.
- El servicio expone el nombre de modelo `Hy4-preview`, lo que puede generar confusion con la version preview original.
- Los idiomas soportados son unicamente chino e ingles; no hay soporte declarado de castellano ni de otras lenguas.
- El despliegue exige dos hosts con 16 dies Ascend 910C cada uno y conectividad HCCS en el mismo superpod; no se documenta una via de inferencia en hardware menor.
- Los pesos no se incluyen en la imagen Docker y deben obtenerse por un canal de distribucion autorizado; el comando de ModelScope apunta al repositorio `FlagRelease/Hy4-W8A8-ascend-FlagOS`.
- No se publican datos sobre sesgos, tasa de alucinacion ni evaluaciones de seguridad del modelo.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del checkpoint original de Tencent Hunyuan y de los componentes del stack FlagOS.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de comunidad ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-ascend-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/Hy4-W8A8-ascend-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4-preview-ascend001-gems0.0.0-treenone-cxnone-pluginnone-vllmnone-sglang0.5.11-sglangfl0.1.0-cp311-ptnpu28-cann85-a64-25.5.0:202611200946`
- SGLang (commit referenciado): `600df8dd498955f5aef4417383ea9ae5d2c238f7`
- sglang-plugin-FL (commit referenciado): `b123baa60be9ad2dedac6736de065017fc81ff41`
- FlagGems (commit referenciado): `855774a3ed95e4a4a3460592bef02019ab5f54c9`
- Repositorio oficial de Tencent Hunyuan Hy4: no disponible en la informacion proporcionada
- Paper o blog tecnico de Hy4: no disponible en la informacion proporcionada
