# ramithuh/foldflow2-webgpu

## Resumen

FoldFlow 2 (ReFT + ESM-2 650M) en formato WebGPU es una exportación de los pesos del modelo generativo de estructuras proteicas FoldFlow, empaquetados en safetensors fragmentados en FP16 e INT8 de 25 MB o menos por shard, con manifiestos SHA-256, para inferencia íntegramente en navegador mediante WebGPU. El repositorio lo publica el usuario ramithuh y el modelo subyacente procede de DreamFold/FoldFlow. El problema que aborda es el de ejecutar un modelo de diseño de proteínas sin backend servidor, aprovechando la GPU del cliente a través de la API WebGPU.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje, sino de un artefacto de despliegue (pesos cuantizados y troceados) de un modelo científico de generación de estructuras proteicas que combina un codificador ESM-2 de 650M parámetros con un adaptador ReFT sobre FoldFlow 2. El repositorio ocupa 2,0 GB y no declara pipeline, idiomas ni métricas de rendimiento en la información disponible.

La información pública es muy escasa: la model card se limita a indicar el origen upstream, la licencia y la existencia de un README_WEBGPU.md con la arquitectura, los benchmarks de paridad numérica y las instrucciones de uso. Por tanto, muchos campos de esta ficha se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FoldFlow 2 (modelo generativo de estructuras proteicas, flow matching) con adaptador ReFT y codificador ESM-2 650M; detalles completos en README_WEBGPU.md (no disponibles en la información proporcionada) |
| Parámetros totales | no disponible (el codificador ESM-2 aporta 650M; el total del sistema no se especifica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 e INT8 (safetensors fragmentados en shards de ≤ 25 MB con manifiestos SHA-256) |
| Idiomas soportados | no disponible (modelo de proteínas, no de lenguaje natural) |
| Licencia | CC BY-NC 4.0 para los pesos de FoldFlow 2 + MIT para ESM-2 (ver LICENSE y THIRD_PARTY_LICENSES) |
| Formato de pesos | safetensors (FP16 e INT8, sharded) |

## Arquitectura y entrenamiento

Según la información disponible, el sistema combina FoldFlow 2, un modelo generativo de estructuras proteicas basado en flow matching, con un adaptador ReFT (Representation Finetuning) y el codificador de proteínas ESM-2 de 650M parámetros. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación relevante de este repositorio no está en el entrenamiento, sino en el empaquetado para despliegue: pesos troceados en shards de 25 MB o menos, en FP16 e INT8, con manifiestos SHA-256 para verificación de integridad, pensados para carga incremental y ejecución en WebGPU dentro del navegador. El autor remite a README_WEBGPU.md para la arquitectura detallada y los benchmarks de paridad numérica entre la ejecución en navegador y la de referencia.

## Capacidades

- Generación de estructuras tridimensionales de proteínas (modelo generativo basado en flow matching), según la naturaleza de FoldFlow 2.
- Codificación de secuencias proteicas mediante ESM-2 650M como componente del sistema.
- Adaptación mediante ReFT sobre las representaciones del modelo base.
- Inferencia en navegador con WebGPU, sin backend servidor.
- Carga de pesos fragmentados con verificación de integridad mediante manifiestos SHA-256.
- Ejecución en FP16 e INT8 según el shard seleccionado.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingües: no aplica.

## Casos de uso

- Diseño de proteínas en el navegador: el modelo permite generar estructuras proteicas directamente en el cliente mediante WebGPU, sin enviar secuencias a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad o sin infraestructura de GPU dedicada.
- Demostraciones interactivas en web: al estar empaquetado en shards de ≤ 25 MB con manifiestos SHA-256, permite carga progresiva en aplicaciones como denovo.run, reduciendo el tiempo hasta la primera inferencia.
- Investigación reproducible en entornos sin clúster: al ejecutarse en WebGPU, un investigador puede reproducir generaciones en un portátil con GPU compatible, usando los mismos pesos FP16 o INT8.
- Docencia y formación: la ejecución local en navegador facilita talleres sobre modelos generativos de proteínas sin necesidad de aprovisionar GPUs en la nube.
- Prototipado rápido de pipelines de diseño proteico: integración en denovo-webgpu-models para validar ideas antes de escalar a infraestructura con GPU de datacenter.
- Verificación de integridad en despliegues distribuidos: los manifiestos SHA-256 por shard permiten auditar que los pesos cargados en el cliente coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona benchmarks de paridad numérica en README_WEBGPU.md, pero sus valores no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,0 GB en total, pero no se especifica la huella en memoria durante la ejecución.
- GPU recomendadas: no disponible. Requiere un navegador con soporte de WebGPU y una GPU compatible con dicha API.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el enfoque WebGPU y la cuantización INT8, pero no se confirma en la información disponible.
- Opciones de despliegue: inferencia en navegador vía WebGPU (denovo.run y denovo-webgpu-models). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoldFlow 2 (ReFT + ESM-2 650M) WebGPU | Generativo de estructuras proteicas, empaquetado para WebGPU | ESM-2 650M + FoldFlow 2 (total no disponible) | no disponible | CC BY-NC 4.0 + MIT | Hugging Face (ramithuh/foldflow2-webgpu) |
| FoldFlow (DreamFold/FoldFlow) | Generativo de estructuras proteicas, pesos originales | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face (DreamFold/FoldFlow) |
| ESM-2 650M | Codificador de proteínas | 650M | no disponible | MIT | Hugging Face / Meta |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0 en los pesos de FoldFlow 2: restringe el uso comercial; cualquier producto comercial requiere licencia adicional del titular.
- El componente ESM-2 se distribuye bajo MIT, pero la combinación con FoldFlow 2 queda sujeta a la licencia más restrictiva (CC BY-NC 4.0).
- Es un artefacto de despliegue, no un modelo de lenguaje: no debe evaluarse con benchmarks de texto como MMLU o HumanEval.
- Dependencia de WebGPU: la inferencia requiere un navegador y una GPU compatibles; no hay soporte documentado para backends alternativos.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto en la información disponible.
- Sin datos publicados de paridad numérica en esta ficha: los benchmarks citados por el autor están en README_WEBGPU.md y no se han podido verificar aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-22) es posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/foldflow2-webgpu
- Modelo upstream: https://huggingface.co/DreamFold/FoldFlow
- Repositorio de despliegue: https://github.com/ramithuh/denovo-webgpu-models
- Demo: https://denovo.run
- README_WEBGPU.md: incluido en el repositorio de Hugging Face (ruta no especificada en la información disponible)
