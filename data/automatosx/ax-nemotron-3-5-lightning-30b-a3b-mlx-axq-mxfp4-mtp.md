# AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP4-MTP es una conversion cuantizada de desarrollo publicada por el usuario AutomatosX sobre el modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, de NVIDIA. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion generado con la herramienta AXQuant que aplica el formato fisico MXFP4 (coma flotante de 4 bits con escalado por microscaleo) a los pesos elegibles del backbone, manteniendo en su precision declarada los tensores protegidos.

El paquete usa la libreria y el formato de pesos de MLX, por lo que esta orientado a ejecucion en Apple Silicon mediante MLX-LM. Cuenta con 31.577.935.872 parametros totales (unos 31,6 B) y una nomenclatura "30B-A3B" que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 B de parametros activos, aunque ese dato no se confirma de forma explicita en la informacion disponible. El tag `nemotron_h` apunta a la familia Nemotron-H de NVIDIA como arquitectura de origen.

Su relevancia es acotada: es un artefacto de desarrollo sin certificado de calidad, con foco en el ecosistema MLX y con un payload de MTP (Multi-Token Prediction) preservado byte a byte pero cuya compatibilidad de ejecucion en runtime no esta verificada. Es util para quien quiera experimentar con cuantizacion MXFP4, arquitecturas hibridas de tipo Nemotron-H y decodificacion multi-token en Macs, pero no para produccion sin una evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrida, segun el tag `nemotron_h`); sin detalle de composicion en la informacion disponible |
| Parametros totales | 31.577.935.872 (~31,6 B) |
| Parametros activos | ~3 B, inferido de la nomenclatura "30B-A3B" (MoE); no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, escalado microscaleado); los tensores protegidos conservan su precision declarada |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (MLX-LM); payload MTP separado en `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron-H de NVIDIA, segun el tag declarado `nemotron_h`. Sin embargo, la informacion proporcionada no detalla la composicion interna de la arquitectura (proporcion de capas de atencion frente a capas de estado, configuracion de expertos, etc.), por lo que no es posible describirla con precision. La nomenclatura "30B-A3B" es coherente con un diseno MoE de aproximadamente 30 000 millones de parametros totales y 3 000 millones activos, aunque este punto no se confirma en la documentacion disponible.

Este repositorio concreto no contiene entrenamiento alguno: es una conversion de cuantizacion. AXQuant aplica cuantizacion MXFP4 a los pesos elegibles del backbone y conserva el resto de tensores en su precision declarada. Los tensores de MTP del checkpoint fuente se preservan byte a byte en `mtp.safetensors`, con digests de origen y de payload registrados en `ax_nemotron_mtp_manifest.json`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. Las unicas garantias declaradas son de integridad de conversion (hashes y auditoria de formato), no de calidad, exactitud del MTP ni velocidad.

## Capacidades

- Generacion de texto y uso conversacional, segun los tags `text-generation` y `conversational`.
- Carga como backbone de texto estandar mediante MLX-LM, con config, tokenizer e indice propios del ecosistema MLX.
- Payload de decodificacion multi-token (MTP) incluido en el paquete; la compatibilidad de ejecucion en MLX-LM, AX Engine, MTPLX u oMLX no esta verificada y cada runtime asume su propio soporte.
- Capacidad potencial de arquitectura MoE: activacion de un subconjunto de parametros por token (inferido de la nomenclatura, no confirmado).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion.
- Capacidades multilingues: no disponibles en la informacion.
- Otras capacidades especiales (vision, audio, modo pensamiento): no disponibles en la informacion.

## Casos de uso

- Inferencia local en Mac: desarrolladores con Apple Silicon pueden cargar el backbone de texto con `mlx_lm.load` para ejecutar un modelo de ~31,6 B en 4 bits sin depender de GPU NVIDIA ni de servicios en la nube.
- Prototipado de asistentes conversacionales en local: permite montar un chat de pruebas en un Mac con memoria unificada suficiente, usando el pipeline conversacional declarado, siempre que se asuma que es un artefacto de desarrollo.
- Experimentacion con cuantizacion MXFP4: util para investigadores que quieran medir el impacto del formato MXFP4 de AXQuant frente al checkpoint BF16 original en terminos de memoria, latencia y fidelidad, dado que el plan y los hashes de cuantizacion acompanan al repositorio.
- Evaluacion de arquitecturas hibridas Nemotron-H en MLX: sirve como banco de pruebas para estudiar como se comporta una arquitectura de este tipo bajo el runtime MLX-LM en hardware Apple.
- Investigacion sobre MTP (Multi-Token Prediction): el paquete incluye el payload `mtp.safetensors` y su manifiesto, lo que permite a desarrolladores de runtimes (MLX-LM, MTPLX, oMLX, AX Engine) trabajar sobre la verificacion de soporte de decodificacion multi-token.
- Auditoria y reproduccion de conversiones: la presencia de `runtime_audit.json`, hashes de plan y revision inmutable del origen permite reproducir y auditar el proceso de conversion de forma trazable.
- Servicio de generacion de texto local: mediante el servidor de MLX-LM puede exponerse como endpoint de generacion de texto en una maquina Apple, para pruebas internas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe auditoria de formato y preservacion de tensores, y declara explicitamente que no se anade ninguna afirmacion de calidad, exactitud del MTP ni velocidad.

## Requisitos de hardware

- Tamano del repositorio: 20,2 GB. Los pesos en MXFP4 (4 bits) implican un consumo de memoria aproximado de 16-18 GB solo para los pesos, mas las escalas del microscaleo y los tensores protegidos en mayor precision; la cifra real depende de la implementacion del runtime.
- Memoria unificada estimada para inferencia: entorno a 20-24 GB como minimo practico, con margen adicional para el cache KV y el contexto. No se ha proporcionado la longitud de contexto, por lo que no puede acotarse el consumo del cache.
- Runtime objetivo: MLX, que se ejecuta en Apple Silicon. No es un paquete CUDA nativo; para usarlo en GPU NVIDIA habria que reconvertir a otro formato no incluido en este repositorio.
- Equipos recomendados (por memoria unificada): Mac con chip de la serie M (M1/M2/M3/M4) en configuracion Max o Ultra con 32 GB o mas; 64 GB o mas para contextos largos o mayor comodidad. Un equipo de 16 GB no es realista para este tamano.
- Opciones de despliegue: MLX-LM (carga y generacion mediante Python), servidor de MLX-LM para exponer un endpoint. Formatos alternativos como GGUF o vLLM requeririan una conversion adicional no incluida aqui.
- Latencia y throughput estimados: no disponibles. La model card advierte que el uso real depende del formato, el contexto y el runtime, y que el modelo "necesita memoria sustancial".

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Runtime |
|---|---|---|---|---|---|
| AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP4-MTP (este) | ~31,6 B | MXFP4 (4 bits) | no disponible | OpenMDW 1.1 | MLX (Apple Silicon) |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (origen) | ~31,6 B | BF16 | no disponible | OpenMDW 1.1 (segun origen) | generico segun runtime |
| Otras conversiones comunitarias del mismo origen | no disponible | no disponible | no disponible | no disponible | no disponible |

El principal punto de comparacion es el checkpoint BF16 de origen: misma arquitectura y mismo numero de parametros, pero en 16 bits, con mayor huella de memoria y sin el formato especifico de MLX. No se dispone de datos de rendimiento que permitan comparar la calidad entre la version MXFP4 y el original.

## Limitaciones y advertencias

- Artefacto de desarrollo: la propia model card indica que no se reclama certificado de calidad, ni exactitud del MTP, ni velocidad, ni certificacion de ningun tipo.
- Compatibilidad de runtime no verificada: se incluyen tensores MTP, pero el paquete no garantiza soporte de ejecucion en MLX-LM, AX Engine, MTPLX u oMLX. El ejemplo de carga solo activa el backbone de texto, no el payload MTP.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser una conversion a 4 bits, cabe esperar cierta degradacion respecto al BF16, pero no hay mediciones publicadas.
- Sesgos conocidos: no disponibles. Al no documentarse composicion del dataset ni idiomas, no puede evaluarse el sesgo ni la cobertura linguistica.
- Idiomas soportados: no disponibles; no puede garantizarse un buen rendimiento en castellano.
- Longitud de contexto desconocida: limita la planificacion de despliegues con contextos largos y el calculo del consumo de memoria del cache KV.
- Licencia OpenMDW 1.1: es una licencia distinta de las habituales (Apache 2.0, MIT, etc.). Antes de un uso comercial es imprescindible revisar los terminos en el enlace oficial, ya que este resumen no los interpreta.
- Restricciones derivadas del formato: el paquete esta atado al runtime MLX y a Apple Silicon; no es portable a vLLM o llama.cpp sin una conversion adicional.
- Uso en produccion: no recomendado sin una evaluacion propia de calidad, latencia y coste, dado el caracter de desarrollo del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3.5-Lightning-30B-A3B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Revision inmutable del origen: `a9904d24bcc1d289a1950fa9d2b978c47cf903b9`
- Archivos de trazabilidad incluidos en el repositorio: `runtime_audit.json`, `ax_nemotron_mtp_manifest.json`, `mtp.safetensors`
- Otros enlaces (papers, blogs, demos, repos): no disponibles en la informacion proporcionada.
