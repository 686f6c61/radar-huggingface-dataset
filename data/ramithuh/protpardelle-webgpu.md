# ramithuh/protpardelle-webgpu

## Resumen

ProtPardelle-1c browser port es un port a JavaScript y WebGPU del modelo ProtPardelle-1c, un sistema de diseño de proteinas desarrollado por ProteinDesignLab. El repositorio, publicado por el usuario ramithuh en Hugging Face, contiene modulos ES sin dependencias que permiten ejecutar los checkpoints publicados de ProtPardelle-1c directamente en el navegador mediante WebGPU, con una referencia en JavaScript y kernels de inferencia escritos en WGSL.

El modelo original es un denoiser estructural de proteinas basado en difusion (EDM), complementado por MiniMPNN para el diseño de secuencias. El port cubre los 16 checkpoints del archivo publicado verificado: 15 denoisers estructurales y MiniMPNN. El objetivo es permitir la inferencia de diseno de proteinas en el navegador sin dependencias de Python ni de CUDA, lo que facilita demos interactivas, prototipado y despliegue en entornos web.

La relevancia actual radica en la creciente demanda de ejecutar modelos cientificos en el cliente, sin infraestructura GPU dedicada. Sin embargo, se trata de un artefacto de portabilidad con cero descargas y sin model card convencional de modelo de lenguaje: no es un LLM, sino un modelo de difusion estructural para proteinas, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusion EDM sobre coordenadas atom37 (15 checkpoints) + MiniMPNN para secuencias |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo estructural; longitud de proteina variable, ejemplo con L=64 y L=200) |
| Tipos de cuantizacion | int8 (precision configurable en el motor; ejemplo con `precision: 'int8'`) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Codigo MIT; pesos publicados CC BY 4.0; tablas de residuos Apache-2.0 en `shared/` |
| Formato de pesos | Pesos descargados y exportados por herramientas propias (`tools/download_weights.py`, `tools/export_protpardelle.py`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un denoiser de difusion de tipo EDM que opera sobre coordenadas atomicas en formato atom37 `[L,37,3]` y niveles de ruido `noiseLevel[L]`, con mascaras de secuencia, indice de residuo e indice de cadena. El sampler emplea pasos EDM con escala Euler y un schedule configurable `{sMin,sMax,rho}`, ademas de parametros de churn (`sChurn`, `sTMin`, `sTMax`, `noiseScale`). Para el diseno de secuencias se usa MiniMPNN, un modulo estilo ProteinMPNN con checkpoint `cc58_epoch97_minimpnn`, que puede cargarse de forma perezosa durante el muestreo.

El port reproduce fielmente el sampler original: los 16 presets en ejecucion cuentan con fixtures de replay del sampler original, incluidos sus segundos stages habilitados, con el rediseno completo externo de ProteinMPNN explicitamente desactivado. No se han portado el disenador descargable por separado ni las integraciones downstream con ESMFold, BindCraft o AlphaFold. Los pesos condicionados por estructura secundaria y adyacencia no estan publicados. No se ha podado ninguna capa de denoiser publicada. El repositorio incluye una auditoria de arquitectura (`docs/ARCHITECTURE.md`), un mapeo completo de argumentos del sampler (`docs/MODE_COVERAGE.json`) y un inventario legible por maquina (`fixtures/mode_matrix.json`). No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Generacion de estructuras de proteinas mediante difusion: muestreo de coordenadas backbone y sidechain en angstroms.
- Diseno de secuencias con MiniMPNN, con controles de temperatura, top-P y prohibicion de aminoacidos (`disallowAAs`, por defecto omite Cys y desconocido).
- Denoising condicionado: acepta `cropCond`, `selfCond`, `hotspotMask`, `seqSelfCond[L,21]`, `seqCropCond[L,21]` y `neighborIndices[L,K]` con `K=min(32,L)`.
- Muestreo de motivo (`motif`) con estructura parseada, indices fuente y destino, estrategia de crop, traslacion y hotspots opcionales.
- Condicionamiento por crop, recurrencia, reconstruccion/reemplazo con ventanas, schedule de guia, escala y peso de perdida.
- Condicionamiento de atomos de punta (`tipAtomConditioning`) para restringir reconstruccion/reemplazo.
- Difusion parcial y refinamiento (`partial`) con estructura, `rewindSteps` y `repack`.
- Soporte de proteinas individuales y complejos multicadena; el muestreo de colecciones se hace secuencialmente con el mismo motor.
- Exportacion a PDB mediante `toPDB` para las coordenadas generadas.
- Ejecucion de inferencia en navegador mediante WebGPU (WGSL) y referencia en JavaScript puro.

## Casos de uso

- Diseno de proteinas interactivo en navegador: un investigador puede cargar el motor WebGPU, definir un layout de cadena con `chainLayout([64], 200)` y generar estructuras sin instalar Python ni CUDA, ideal para demos y docencia.
- Prototipado de pipelines de diseno estructural: el API `denoise(input)` permite integrar el denoiser en aplicaciones web de diseno asistido, con control fino de pasos EDM, churn y schedule.
- Rediseno de secuencias sobre un backbone dado: usando `sequence(input)` con MiniMPNN y condicionamientos `seqSelfCond`/`seqCropCond`, se puede proponer una secuencia compatible con una estructura objetivo.
- Refinamiento parcial de estructuras existentes: la opcion `partial` con `rewindSteps` y `repack` permite partir de una estructura y aplicar difusion parcial para mejorar o completar regiones.
- Diseno condicionado por motivo: la opcion `motif` con indices fuente/destino y hotspots permite preservar un sitio funcional concreto mientras se genera el resto de la estructura.
- Generacion de complejos multicadena: el motor acepta layouts multicadena y devuelve coordenadas, `aatype` y `atomMask`, util para estudiar interfaces proteina-proteina.
- Validacion y test de portabilidad: los fixtures de replay y el harness con Chromium headless permiten verificar que un port WebGPU reproduce fielmente el sampler original, util para equipos que mantienen forks.
- Visualizacion educativa en el cliente: exportacion directa a PDB desde el navegador para renderizar estructuras en visores web sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona fixtures de replay del sampler original para los 16 presets y un harness de test CPU/GPU, pero no incluye metricas de calidad estructural (RMSD, TM-score, etc.) ni comparativas numericas.

## Requisitos de hardware

- Entorno de ejecucion: Node 22+, Python 3.12, `uv` y una build de Chromium con WebGPU sobre hardware real.
- GPU: se probo en una maquina ARM64 NVIDIA GB10 con Vulkan WebGPU; el adaptador debe tener vendor de hardware y no ser fallback, SwiftShader ni llvmpipe.
- Flags de Chromium requeridos: `--enable-unsafe-webgpu --ignore-gpu-blocklist --enable-features=Vulkan --use-angle=vulkan --use-vulkan=native --enable-dawn-features=vulkan_enable_f16_on_nvidia`, entre otros.
- VRAM estimada: no disponible; el tamano del repo es de 0.6 GB y la descarga inicial de pesos es de 4.294.232.741 bytes, lo que da una idea del orden de magnitud del almacenamiento, no de la VRAM en inferencia.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el unico hardware documentado es NVIDIA GB10 (ARM64) con Vulkan.
- Opciones de despliegue: motor WebGPU propio (`createProtpardelleEngine`), referencia JavaScript en CPU (`npm run test:cpu`) y tests GPU (`npm run test:gpu`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el API devuelve `timingMs` por llamada, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtPardelle-1c browser port | Port WebGPU de denoiser de difusion + MiniMPNN | no disponible | no aplica (longitud de proteina variable) | Codigo MIT, pesos CC BY 4.0 | Hugging Face, 0 descargas |
| ProtPardelle-1c (upstream, ProteinDesignLab) | Denoiser de difusion + MiniMPNN en Python | no disponible | no aplica | Pesos CC BY 4.0 | GitHub, commit fijado `ee37840` |
| ProteinMPNN | Rediseño de secuencias (MPNN) | no disponible | no aplica | no disponible en esta ficha | Referenciado como no portado |
| ESMFold / AlphaFold | Prediccion de estructura | no disponible | no aplica | no disponible en esta ficha | Integraciones no portadas |

La comparativa se limita a los sistemas citados en la model card; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones; cualquier uso en ese sentido es inadecuado.
- El rediseno completo externo de ProteinMPNN esta explicitamente desactivado en el port.
- No se han portado las integraciones downstream con ESMFold, BindCraft ni AlphaFold.
- Los pesos condicionados por estructura secundaria y adyacencia no estan publicados.
- Requiere WebGPU con hardware real; adaptadores fallback, SwiftShader o llvmpipe no son validos.
- La licencia de los pesos es CC BY 4.0 y la del codigo MIT; las tablas de residuos conservan aviso Apache-2.0. Verificar atribucion antes de uso comercial.
- Riesgo de alucinacion estructural: como todo modelo generativo de proteinas, las estructuras generadas deben validarse experimentalmente o con predictores independientes.
- Sesgos: no disponible; no se documentan sesgos de dataset ni de composicion.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas; madurez y soporte comunitario muy limitados.
- El harness de test depende de una build concreta de Chromium y de flags especificos; la portabilidad a otros navegadores no esta documentada.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/protpardelle-webgpu
- Upstream GitHub (commit fijado): https://github.com/ProteinDesignLab/protpardelle-1c/tree/ee378400f25b801fa481028000f9060183d7fb4c
- Auditoria de arquitectura: `docs/ARCHITECTURE.md` (en el repositorio)
- Mapeo de argumentos del sampler: `docs/MODE_COVERAGE.json` (en el repositorio)
- Inventario de modos: `fixtures/mode_matrix.json` (en el repositorio)
