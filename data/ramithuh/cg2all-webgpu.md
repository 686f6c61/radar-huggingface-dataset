# ramithuh/cg2all-webgpu

## Resumen

cg2all-webgpu es un paquete de pesos preparado para ejecutar en el navegador, mediante WebGPU y WGSL, el modelo cg2all de reconstruccion de estructura atomica completa (backmapping) a partir de una traza de carbonos alfa (Cα) de una proteina. El modelo original procede del trabajo de Heo y Feig, "One particle per residue is sufficient to describe all-atom protein structures" (Structure, 2024), y su codigo esta disponible en el repositorio huhlim/cg2all bajo licencia Apache-2.0; los pesos originales se distribuyen en Zenodo (registro 8393343) con licencia CC-BY-4.0. Este repositorio, publicado por el usuario ramithuh, no es un modelo nuevo entrenado desde cero, sino una reempaquetado de esos pesos en formatos binarios optimizados para su ejecucion en el navegador.

El interes practico reside en que permite reconstruir estructuras atomicas completas a partir de representaciones de grano grueso (una particula por residuo) sin necesidad de servidor ni de instalacion local: el calculo se ejecuta en el cliente mediante WebGPU, lo que facilita su integracion en aplicaciones web interactivas de visualizacion y analisis estructural de proteinas. Se ofrecen dos variantes de comportamiento (`ca`, que refina las posiciones Cα de entrada, y `ca-fix`, que las mantiene exactas) y dos precisiones de pesos (`fp16` e `int8`), con tamanos de 8,06 MiB y 4,82 MiB respectivamente.

La arquitectura subyacente es un transformer SE(3)-equivariante (SE(3)-Transformer), adaptado del fork de huhlim sobre la implementacion original de NVIDIA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de repo de 0,0 GB (los binarios se referencian pero no se detallan en el espacio del repositorio). No dispone de pipeline declarado ni de idiomas especificados, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SE(3)-Transformer (transformer equivariante a rotaciones y traslaciones) |
| Parametros totales | 4,05 M (aproximado, segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo estructural, no de lenguaje) |
| Tipos de cuantizacion | fp16 (IEEE half) e int8 simetrico con una escala fp16 por cada 16 pesos consecutivos, solo en las capas de salida de perfil radial |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | cc-by-4.0 (pesos); el codigo upstream es Apache-2.0 |
| Formato de pesos | `manifest.json` (tabla de tensores, configuracion y SHA-256) y `weights.bin` binario; nombres de tensor conservados del `state_dict` de PyTorch |

## Arquitectura y entrenamiento

El modelo es un SE(3)-Transformer, una arquitectura de atencion equivariante a las transformaciones del grupo SE(3) (rotaciones y traslaciones), adecuada para datos geometricos como coordenadas atomicas. La adaptacion a WebGPU/WGSL sigue el fork huhlim/SE3Transformer, a su vez derivado de la implementacion de NVIDIA (MIT). El modelo toma como entrada una traza de carbonos alfa y genera las posiciones de todos los atomos de la proteina, refinando o fijando las posiciones Cα de entrada segun la variante.

En cuanto al entrenamiento, la model card de este repositorio no detalla el dataset, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO; esa informacion corresponde al trabajo original de Heo y Feig (Structure, 2024), no reproducido aqui. La innovacion tecnica de este paquete concreto es la exportacion de pesos a formatos ejecutables en navegador: solo las capas de salida de perfil radial (`*.radial_func.net.6.weight`, 3,90 M de los 4,05 M de parametros) se reducen a fp16 o int8, mientras que embeddings, mapas LinearSE3, normalizaciones y capas ocultas radiales permanecen en float32. El calculo en WGSL se realiza en float32. Se documenta una paridad frente a la referencia PyTorch FP32: con fp16 el RMSD de todos los atomos es de 1,2e-4 a 2,6e-4 A (variante `ca`) y de 1,5e-4 a 4,3e-4 A (`ca-fix`), con una desviacion maxima por atomo de 4,6e-3 A; con int8, el RMSD va de 6,0e-3 a 2,1e-2 A (`ca`) y de 5,5e-3 a 5,8e-2 A (`ca-fix`), con desviacion maxima de 0,544 A. Una exportacion fp32 sin cuantizar reproduce PyTorch con un error de hasta 6e-5 A.

## Capacidades

- Reconstruccion de estructura atomica completa (backmapping) a partir de una traza de carbonos alfa de una proteina.
- Variante `ca`: refina las posiciones Cα de entrada mediante el modelo.
- Variante `ca-fix`: mantiene las posiciones Cα de entrada exactamente (equivalente a `--fix`).
- Ejecucion en navegador mediante WebGPU y shaders WGSL, sin servidor.
- Dos niveles de precision de pesos (fp16 e int8) con paridad documentada frente a la referencia PyTorch FP32.
- Soporte de estructuras con enlaces disulfuro (SSBONDs) y cadenas multiples con roturas en la traza, segun los casos de prueba documentados (crambin 1AB1 con tres SSBONDs; traza de dos cadenas de 42 aa con rotura de 14,6 A).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Visualizacion interactiva de proteinas en el navegador: el modelo permite reconstruir la estructura atomica completa a partir de una traza Cα directamente en el cliente, sin enviar datos a un servidor, lo que es adecuado para aplicaciones web de divulgacion o docencia.
- Integracion en el bloque `cg2all` de denovo.run: el runtime en `web/static/vendor/cg2all/` y las herramientas en `tools/cg2all/` permiten ejecutar el backmapping como parte de un flujo web ya existente.
- Analisis estructural en entornos con recursos limitados: al ejecutarse en WebGPU con pesos de 4,82 MiB (int8) u 8,06 MiB (fp16), cabe en dispositivos cliente sin GPU dedicada de gran capacidad.
- Prototipado rapido de pipelines de modelado de proteinas: la variante `ca-fix` preserva la traza de entrada, util cuando se quiere evaluar unicamente la reconstruccion de atomos laterales.
- Evaluacion de la fidelidad de la cuantizacion: la documentacion de paridad (RMSD frente a PyTorch FP32) permite decidir entre fp16 e int8 segun la tolerancia geometrica requerida (por ejemplo, int8 con desviacion maxima de 0,544 A frente a fp16 con 4,6e-3 A).
- Reproducibilidad de resultados: los comandos de exportacion documentados (`export_weights.py` con los checkpoints de Zenodo) permiten regenerar los binarios y verificar los SHA-256 publicados.
- Casos con enlaces disulfuro o cadenas multiples: los ejemplos documentados (crambin con tres SSBONDs, traza de dos cadenas con rotura) sirven como referencia para validar el comportamiento en estructuras no triviales.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. Si documenta metricas de paridad geometrica frente a la referencia PyTorch FP32:

| Precision | Variante `ca` (RMSD todos los atomos) | Variante `ca-fix` (RMSD todos los atomos) | Desviacion maxima por atomo |
|---|---|---|---|
| fp16 | 1,2e-4 – 2,6e-4 A | 1,5e-4 – 4,3e-4 A | 4,6e-3 A |
| int8 | 6,0e-3 – 2,1e-2 A | 5,5e-3 – 5,8e-2 A | 0,544 A |
| fp32 (referencia) | ≤ 6e-5 A frente a PyTorch | ≤ 6e-5 A frente a PyTorch | no disponible |

Las mediciones se realizaron en SwiftShader WebGPU (Chromium headless, ARM64) y en la ruta CPU en float64, sobre una helice ideal de 16 aa, la crambin de 46 aa (1AB1) con tres SSBONDs y una traza de dos cadenas de 42 aa con rotura de 14,6 A. No se publican datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos ocupan 8,06 MiB (fp16) o 4,82 MiB (int8), por lo que el requisito de memoria es minimo.
- GPU recomendadas: cualquier GPU compatible con WebGPU; las pruebas se realizaron en SwiftShader WebGPU (implementacion software de Chromium headless sobre ARM64), lo que sugiere que tambien funciona sin aceleracion hardware dedicada.
- Cabe en GPU de consumo: si, al tratarse de un modelo de 4,05 M de parametros con pesos de pocos MiB; no se especifican modelos concretos.
- Opciones de despliegue: navegador con WebGPU (runtime en `web/static/vendor/cg2all/` del proyecto denovo.run); la exportacion de pesos se realiza con `tools/cg2all/export_weights.py`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cg2all-webgpu (este) | 4,05 M | no aplica | CC-BY-4.0 (pesos) | manifest.json + weights.bin (fp16/int8) | Ejecucion en navegador via WebGPU |
| cg2all original (huhlim/cg2all) | 4,05 M | no aplica | Apache-2.0 (codigo), CC-BY-4.0 (pesos) | checkpoints PyTorch (`.ckpt`) | Referencia PyTorch FP32; ejecucion local |
| SE3Transformer (NVIDIA) | no disponible | no aplica | MIT | PyTorch | Implementacion base del transformer SE(3) |

No se dispone de datos de rendimiento comparativo entre estas implementaciones mas alla de la paridad documentada frente a la referencia PyTorch FP32.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a instrucciones; su unico proposito es el backmapping estructural de proteinas.
- La cuantizacion int8 introduce desviaciones de hasta 0,544 A por atomo, lo que puede ser inaceptable en aplicaciones que requieran precision sub-angstrom.
- La informacion sobre el entrenamiento original (dataset, numero de tokens, posible RLHF/DPO) no se detalla en este repositorio; debe consultarse el trabajo de Heo y Feig (Structure, 2024).
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de uso o validacion por parte de la comunidad.
- La licencia de los pesos es CC-BY-4.0, que permite uso comercial con atribucion; el codigo upstream es Apache-2.0. Debe verificarse el cumplimiento de ambas licencias en produccion.
- El rendimiento depende de la disponibilidad de WebGPU en el navegador del cliente; en entornos sin soporte puede requerirse una implementacion software (como SwiftShader), con la consiguiente penalizacion de velocidad no cuantificada.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma, ya que no aplican a un modelo estructural.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ramithuh/cg2all-webgpu
- Codigo original cg2all: https://github.com/huhlim/cg2all
- Pesos originales en Zenodo: https://zenodo.org/records/8393343
- Fork SE(3)-Transformer de huhlim: https://github.com/huhlim/SE3Transformer
- Proyecto denovo.run: https://denovo.run
- Articulo de referencia: Heo & Feig, "One particle per residue is sufficient to describe all-atom protein structures", Structure 32(1):97–111, 2024 (no se proporciona enlace directo en la informacion disponible).
