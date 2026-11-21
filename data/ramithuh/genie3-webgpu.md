# ramithuh/genie3-webgpu

## Resumen

Genie 3 es un modelo de diseno de proteinas desarrollado por el AlQuraishi Laboratory, presentado en el trabajo *"Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3"* (Lin, Y., et al., 2026). El repositorio `ramithuh/genie3-webgpu` no contiene el modelo original, sino una reempaquetado de sus pesos en formato safetensors fragmentado, optimizado para inferencia en navegador mediante WebGPU. Se trata, por tanto, de una exportacion de los pesos oficiales (`yeqinglin/genie3`, checkpoint `step=600000.ckpt`) con fines de despliegue web.

El modelo cuenta con 23.269.484 parametros distribuidos en 504 tensores y esta orientado a tareas de diseno computacional de proteinas. La arquitectura emplea equivarianza SE(3) atomistica, segun se desprende del titulo del paper de referencia, aunque la model card del repositorio no detalla la estructura interna. El paquete incluye dos variantes de precision: FP16 (con normas y sesgos en FP32) fragmentada en 3 shards de hasta 20 MB (44,57 MB en total) e INT8 simetrico por fila en un unico shard de 22,75 MB.

La relevancia de este repositorio es fundamentalmente practica: permite ejecutar un modelo de diseno de proteinas directamente en el navegador sin necesidad de infraestructura GPU en servidor, gracias a WebGPU. Esta pensado para integrarse en herramientas como `denovo.run` y `ProteinDesignSpace`. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y su model card es muy escueta en cuanto a especificaciones tecnicas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Equivarianza SE(3) atomistica (segun titulo del paper); estructura interna no detallada en la model card |
| Parametros totales | 23.269.484 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (pesos 2D) + FP32 (normas/sesgos); INT8 simetrico por fila + FP32 |
| Idiomas soportados | No disponible (modelo de proteinas, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentado (3 shards FP16, 1 shard INT8) |

## Arquitectura y entrenamiento

La model card indica que el modelo emplea equivarianza SE(3) atomistica, lo que sugiere una red neuronal equivariante a rotaciones y traslaciones en el espacio 3D, adecuada para representar estructuras atomicas de proteinas. El checkpoint exportado corresponde al paso 600.000 (`step=600000.ckpt`) del entrenamiento original. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares.

La innovacion tecnica destacable de este repositorio concreto no reside en el modelo sino en el proceso de exportacion: la fragmentacion de pesos en shards de tamano reducido (≤ 20 MB) y la conversion a formatos compatibles con WebGPU, con verificacion de paridad numerica frente a PyTorch FP32. Para la variante FP16 se reporta `xl relRMS = 2.24e-4` y `ai relRMS = 4.39e-4`; para INT8, `xl relRMS = 1.07e-2` y `ai relRMS = 1.89e-2`. Estas metricas indican la desviacion relativa de las salidas respecto a la referencia en FP32.

## Capacidades

- Diseno computacional de proteinas: generacion y evaluacion de secuencias y estructuras proteicas.
- Modelado atomistico con equivarianza SE(3), lo que permite procesar coordenadas 3D de atomos.
- Inferencia en navegador mediante WebGPU, sin dependencia de backend GPU en servidor.
- Ejecucion en dos precisiones (FP16 e INT8) con paridad numerica verificada frente a PyTorch.
- Integracion con herramientas de diseno de proteinas (`denovo.run`, `ProteinDesignSpace`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingueismo, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Diseno de proteinas de novo en el navegador: un investigador puede cargar los shards FP16 o INT8 en una aplicacion web con WebGPU y generar candidatos proteicos sin instalar CUDA ni configurar un servidor GPU, lo que reduce la barrera de entrada para laboratorios con recursos limitados.
- Prototipado rapido de pipelines de diseno proteico: la variante INT8 (22,75 MB) permite iterar sobre propuestas de diseno en entornos de desarrollo web, con una desviacion relativa de salidas de aproximadamente 1e-2 respecto a FP32, suficiente para cribados preliminares.
- Educacion y demostraciones interactivas: al ejecutarse en el navegador, facilita la creacion de demos docentes sobre diseno de proteinas y equivarianza SE(3) sin infraestructura de computo dedicada.
- Integracion en plataformas web de diseno proteico: el repositorio esta pensado para `denovo.run` y `ProteinDesignSpace`, de modo que sirve como backend de inferencia para aplicaciones de diseno de proteinas accesibles via web.
- Validacion de paridad numerica: los datos de `relRMS` permiten a desarrolladores verificar que la inferencia WebGPU reproduce fielmente la salida de PyTorch antes de desplegar en produccion.
- Investigacion reproducible en entornos sin GPU: la fragmentacion en shards pequenos facilita la distribucion y carga incremental de pesos en clientes con memoria limitada, util para replicar experimentos en equipos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de paridad numerica frente a PyTorch FP32 (no benchmarks de calidad de diseno proteico):

| Variante | Precision | Shards | Tamano total | xl relRMS | ai relRMS |
|---|---|---:|---:|---|---|
| `fp16/` | FP16 + FP32 | 3 (≤ 20 MB) | 44,57 MB | 2,24e-4 | 4,39e-4 |
| `int8/` | INT8 + FP32 | 1 | 22,75 MB | 1,07e-2 | 1,89e-2 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el paquete completo ocupa 44,57 MB (FP16) o 22,75 MB (INT8), por lo que cabe holgadamente en cualquier GPU con soporte WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU (navegadores Chromium recientes); no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, dado el reducido tamano de los pesos; no se detallan modelos especificos.
- Opciones de despliegue: WebGPU en navegador (objetivo principal); el checkpoint original puede ejecutarse con PyTorch segun el repositorio `aqlaboratory/genie3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de diseno de proteinas ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones especificas del modelo original.
- El repositorio es una exportacion de pesos, no el modelo oficial; para uso en produccion conviene validar contra el checkpoint original `yeqinglin/genie3`.
- La variante INT8 introduce una desviacion relativa de salidas de aproximadamente 1e-2, potencialmente relevante en aplicaciones que requieran alta fidelidad numerica.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no es de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero los derechos de autor del modelo pertenecen a los autores originales (Lin, Y., et al., 2026); debe citarse adecuadamente.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia (2026-11-21), lo que sugiere que no ha sido validado por la comunidad.
- No se aportan datos de calidad de diseno proteico (exito experimental, diversidad, plausibilidad estructural), por lo que no puede evaluarse su rendimiento real en tareas de diseno.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/genie3-webgpu
- Checkpoint original: https://huggingface.co/yeqinglin/genie3
- Repositorio del codigo original: https://github.com/aqlaboratory/genie3
- Implementacion WebGPU: https://github.com/ramithuh/genie3-webgpu
- Plataforma de diseno proteico: https://github.com/ramithuh/ProteinDesignSpace
