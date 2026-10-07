# AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP4-MTP es una conversion cuantizada de desarrollo publicada por el usuario AutomatosX sobre el checkpoint BF16 `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16` de NVIDIA. Se trata de un artefacto orientado al ecosistema MLX (Apple Silicon) que aplica cuantizacion MXFP4 de 4 bits sobre los pesos elegibles del backbone, manteniendo los tensores protegidos en su precision declarada. El modelo base pertenece a la familia Nemotron-H y suma 120.668.707.840 parametros totales (aproximadamente 120,7 mil millones), con un regimen MoE segun indica la nomenclatura A12B (unos 12 mil millones de parametros activos por token).

El paquete conserva ademas la carga de prediccion multi-token (MTP) del modelo original en un fichero `mtp.safetensors`, cuyos contenidos se preservan byte a byte respecto al checkpoint fuente y se documentan mediante digests en `ax_nemotron_mtp_manifest.json`. La propia model card advierte de que se trata de un artefacto de desarrollo sin certificado de calidad y que la compatibilidad de ejecucion del payload MTP no esta verificada en MLX-LM, AX Engine, MTPLX ni oMLX.

Su relevancia es doble: por un lado, permite probar en hardware Apple Silicon un modelo de 120B en 4 bits dentro de un repositorio de 71,3 GB; por otro, sirve como evidencia reproducible de un proceso de cuantizacion AXQuant con hashes de ficheros y auditoria de formato fisico registrada. No se han publicado resultados de benchmarks ni certificaciones de rendimiento para esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (familia Nemotron-H; hibrida segun la etiqueta del repositorio) |
| Parametros totales | 120.668.707.840 (aprox. 120,7B) |
| Parametros activos | Aprox. 12B por token (segun nomenclatura A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) sobre backbone; tensores protegidos en su precision declarada |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (MLX); fichero adicional `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`, identificado en las etiquetas del repositorio como familia `nemotron_h`, lo que lo situa en la linea Nemotron-H de NVIDIA. La nomenclatura 120B-A12B indica un diseno de mezcla de expertos (MoE) con aproximadamente 120,7 mil millones de parametros totales y del orden de 12 mil millones activos por token. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La aportacion de este repositorio no es el entrenamiento, sino la conversion de pesos. AXQuant aplica cuantizacion MXFP4 a los pesos del backbone elegibles, conserva los tensores protegidos en su precision original y preserva los tensores MTP (multi-token prediction) en `mtp.safetensors` de forma byte a byte respecto al checkpoint fuente. El repositorio incluye el plan de cuantizacion AXQuant, los hashes de los ficheros y un `runtime_audit.json` con los enlaces fijados de config, indice y cabeceras. La model card indica que no se anadieron tensores ni declaraciones n-gram y que la auditoria de formato remoto no concede un perfil de ejecucion oMLX/MTPLX ni afirma una carga o generacion correcta.

## Capacidades

- Generacion de texto y uso conversacional: el modelo declara la etiqueta `text-generation` y `conversational`, por lo que esta orientado a tareas de generacion de lenguaje y dialogo.
- Razonamiento y contexto extenso: el modelo base pertenece a la familia Nemotron-3 Super, si bien la longitud de contexto concreta de esta conversion no esta disponible.
- Prediccion multi-token (MTP): el repositorio preserva los tensores MTP del modelo original, aunque la model card indica que la compatibilidad de ejecucion en tiempo de inferencia no esta verificada.
- Ejecucion en MLX: integrable mediante `mlx_lm` (funciones `load` y `generate`) para el backbone de texto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el repositorio se declara exclusivamente de generacion de texto.

## Casos de uso

- Inferencia local en Apple Silicon: al estar empaquetado para MLX con cuantizacion de 4 bits, permite ejecutar un modelo MoE de 120B en equipos Mac con memoria unificada amplia (por encima de 64 GB), aunque la model card advierte que Super requiere memoria sustancial.
- Prototipado de asistentes conversacionales: su naturaleza conversacional y su ventana de contexto (no especificada) permiten construir chatbots de prueba en entornos de desarrollo antes de desplegar en hardware de datacenter.
- Evaluacion de cuantizacion MXFP4: util para investigadores que quieran medir el impacto de una cuantizacion de 4 bits sobre el backbone de un MoE grande, comparando contra el checkpoint BF16 fuente (revision `2dc98e2afe4face0e4ce40972a915c45368bd34a`).
- Investigacion sobre MTP: los tensores `mtp.safetensors` permiten a desarrolladores de runtimes (AX Engine, MTPLX, oMLX) experimentar con la integracion de prediccion multi-token en MLX, siempre que implementen su propio soporte.
- Pipeline de generacion de texto por lotes: mediante `mlx_lm` se puede montar un servicio de generacion de texto de forma reproducible, usando los hashes y el plan de cuantizacion incluidos como referencia de trazabilidad.
- Reproducibilidad y auditoria de conversiones: el repositorio incluye `runtime_audit.json` y manifiestos con digests, lo que lo hace util como caso de estudio de un proceso de conversion documentado y verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un artefacto de desarrollo sin certificado de calidad y que no se anaden afirmaciones sobre calidad, exactitud del MTP ni velocidad.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 71,3 GB, por lo que la carga del backbone MXFP4 requiere del orden de 65-75 GB de memoria disponible para pesos, mas el espacio adicional para cache KV y estados del runtime (cifra a confirmar, ya que no se publican estimaciones oficiales).
- GPU recomendadas: no aplicable directamente, ya que el paquete esta orientado a MLX (Apple Silicon). El checkpoint BF16 fuente, en cambio, requeriria hardware de datacenter tipo H100 o A100 con 80 GB o multi-GPU.
- Cabe en consumer GPU: no para esta conversion MLX, que apunta a Mac con memoria unificada amplia. En hardware NVIDIA consumer (RTX 4090 de 24 GB) no cabria el modelo completo en 4 bits sin estrategias de offload.
- Opciones de despliegue: MLX-LM (Apple Silicon). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan indicadas en la informacion proporcionada y el formato safetensors MLX no es directamente compatible con ellas sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP4-MTP | 120,7B (aprox. 12B activos) | no disponible | MXFP4 4 bits | nvidia-nemotron-open-model-license | MLX (AutomatosX) |
| nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16 | 120,7B (aprox. 12B activos) | no disponible | BF16 | nvidia-nemotron-open-model-license | safetensors (NVIDIA) |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de desarrollo: la model card indica explicitamente que no se reclama certificado de calidad ni se anaden afirmaciones de calidad, exactitud del MTP o velocidad.
- Compatibilidad del payload MTP no verificada: los tensores MTP se preservan byte a byte, pero el repositorio no garantiza soporte de ejecucion en MLX-LM, AX Engine, MTPLX ni oMLX.
- Riesgo de degradacion por cuantizacion: al tratarse de una cuantizacion MXFP4 de 4 bits, cabe esperar perdida de precision respecto al checkpoint BF16, aunque no se publican mediciones concretas.
- Riesgo de alucinacion: no se aportan datos al respecto para esta conversion.
- Idiomas soportados no especificados: la informacion disponible no detalla la cobertura linguistica.
- Restricciones de licencia: se aplica la NVIDIA Nemotron Open Model License (fichero `NVIDIA-Nemotron-Open-Model-License.pdf` incluido); es responsabilidad del usuario revisar las condiciones de uso comercial antes de desplegar en produccion.
- Limitacion de plataforma: el formato MLX restringe el uso a entornos Apple Silicon, lo que excluye hardware NVIDIA/AMD sin conversion adicional.
- Sin garantia de carga o generacion correcta: la auditoria de formato remoto no concede un perfil de ejecucion ni afirma una carga o generacion satisfactoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Super-120B-A12B-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Fichero de auditoria de runtime: `runtime_audit.json` (incluido en el repositorio)
- Manifiesto de tensores MTP: `ax_nemotron_mtp_manifest.json` (incluido en el repositorio)
- Licencia en PDF: `NVIDIA-Nemotron-Open-Model-License.pdf` (incluido en el repositorio)
