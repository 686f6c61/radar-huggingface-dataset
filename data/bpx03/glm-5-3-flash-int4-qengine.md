# bpx03/GLM-5.3-Flash-INT4-QEngine

## Resumen

GLM-5.3-Flash-INT4-QEngine es una cuantizacion a INT4 del modelo zai-org/GLM-5.3-Flash, publicada por el usuario bpx03 y empaquetada especificamente para QEngine 1.5 o superior, un motor de inferencia open source (MIT) disenado para ejecutarse sobre 3x NVIDIA RTX 3090. No se trata de un checkpoint convencional: los ficheros estan distribuidos segun el layout propio del motor GLM de QEngine, de modo que otros runtimes no pueden leerlos como un modelo estandar.

El modelo base cuenta con 50.303.291.708 parametros (segun los safetensors publicados) y una arquitectura GLM de tipo `glm5_next`, que combina atencion lineal KDA, atencion MLA y un mecanismo de expertos enrutados (MoE) con capa de borrador MTP. La cuantizacion mezcla dos procesos: los expertos enrutados se cuantizan con GPTQ INT4 calibrado sobre datos propios del autor, y el resto de tensores (atencion, MLA, experto compartido, router, embeddings, cabeza de salida y capa MTP) provienen de la release INT4 AutoRound de Intel en formato W4A16.

Su relevancia es practica: permite ejecutar un modelo de ~50B parametros en hardware de consumo (3x RTX 3090, 72 GB de VRAM agregada) manteniendo los expertos enrutados (~157 GB) anclados en RAM de host (~192 GB necesarios) y cacheando en VRAM los mas activos. La licencia es MIT, lo que facilita el uso comercial, aunque el autor remite tambien a la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM `glm5_next`: atencion lineal KDA + MLA + MoE con capa borrador MTP |
| Parametros totales | 50.303.291.708 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ INT4 (expertos enrutados y proyecciones KDA g128 con act-order); AutoRound INT4 W4A16 para el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | MIT (respetando la licencia del modelo original) |
| Formato de pesos | safetensors (layout propio de QEngine: `q_g4_experts-*.safetensors`, `q_kda-*.safetensors`, `model-dense-*.safetensors`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura `glm5_next` que combina atencion lineal KDA (Kernel-based Decoupled Attention o similar, segun la nomenclatura del autor), atencion MLA (Multi-head Latent Attention) y una capa de mezcla de expertos (MoE) con expertos enrutados mas un experto compartido. Incluye ademas una capa de borrador MTP (Multi-Token Prediction) para decodificacion especulativa. El checkpoint publicado no entrena el modelo: redistribuye y recuantiza pesos.

El proceso de cuantizacion tiene dos ramas. Primero, los expertos enrutados (~157 GB en INT4) se cuantizan con GPTQ INT4 calibrado sobre registros propios del autor y se empaquetan en el layout de expertos de QEngine. Segundo, las proyecciones KDA se cuantizan con GPTQ INT4 g128 con act-order partiendo de los pesos BF16. El resto de tensores (atencion, MLA, experto compartido, router, embeddings, cabeza y capa MTP) se toman de la release INT4 AutoRound de Intel (W4A16), usando sus tensores no cuantizados y repackandolos en `model-dense-*.safetensors`. El autor advierte de que ambos pasos de cuantizacion son con perdida y remite a las metricas (KL frente a la referencia FP8, precision en tareas y velocidad) del README de QEngine 1.5.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base GLM-5.3-Flash, aunque no se detallan en la informacion disponible.
- Codigo y matematicas: no hay datos especificos en la model card; se asumen las capacidades del modelo base, sin confirmacion explicita.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Capacidad especial: incluye capa borrador MTP para decodificacion especulativa dentro del motor QEngine.
- Vision y audio: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: ejecutar un modelo de ~50B parametros en 3x RTX 3090 (72 GB de VRAM) manteniendo los expertos en RAM de host, adecuado para laboratorios y desarrolladores con estaciones de trabajo multi-GPU.
- Inferencia local de alta capacidad: usar QEngine con `server/run.sh 8080 --model ...` para levantar un endpoint HTTP compatible con el motor, util para prototipos y entornos de investigacion sin acceso a la nube.
- Investigacion sobre cuantizacion: comparar el comportamiento de GPTQ INT4 con act-order frente a AutoRound W4A16 en un mismo modelo, midiendo KL contra FP8 y precision en tareas.
- Evaluacion de motores de inferencia: servir como banco de pruebas para QEngine 1.5 y su estrategia de cacheo de expertos en VRAM con offload a RAM de host.
- Entornos con presupuesto limitado de VRAM: escenarios donde no se dispone de A100/H100 pero si de varias GPU consumer y RAM abundante (~192 GB), como fine-tuning ligero o evaluacion de modelos grandes.
- Desarrollo de herramientas sobre GLM: integrar el endpoint en pipelines internos de generacion de texto, siempre que se validen previamente las capacidades reales del modelo base (no documentadas en esta ficha).
- Reproducibilidad y auditoria: el repo incluye `SHA256SUMS` para verificar la integridad de cada fichero, util en entornos de produccion con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a las metricas del README de QEngine 1.5 (KL frente a FP8, precision en tareas y velocidad), pero no se incluyen cifras en la model card.

## Requisitos de hardware

- VRAM estimada: 3x 24 GB (72 GB agregados) es la configuracion usada por el autor. Tambien arranca en 2 tarjetas, con menos slots de expertos en VRAM.
- RAM de host: ~192 GB. Los expertos enrutados (~157 GB) permanecen anclados en RAM y las tarjetas cachean los mas activos. Con menos RAM el motor arranca con un archivo de conversacion mas pequeno; por debajo del tamano de los expertos no puede cargar.
- CPU: x86-64 con AVX2; se usa AVX-512 si esta disponible (el carril de expertos en CPU selecciona kernels al arrancar).
- Disco: ~186 GB.
- GPU recomendadas: 3x NVIDIA RTX 3090 (24 GB). No se documentan otras GPU; el motor esta disenado para ese perfil. P2P entre tarjetas ayuda pero no es obligatorio.
- Cabe en GPU consumer: si, en 3x RTX 3090 (o 2 con menos slots de expertos). No se indica compatibilidad con otras consumer.
- Opciones de despliegue: QEngine 1.5 o superior (unico runtime compatible con el layout). No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| GLM-5.3-Flash-INT4-QEngine (este) | 50,3B | no disponible | GPTQ INT4 + AutoRound W4A16 | MIT | QEngine 1.5+ |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | BF16 (original) | no disponible | Multiples |
| GLM-5.3-Flash INT4 AutoRound (Intel) | no disponible | no disponible | AutoRound INT4 W4A16 | no disponible | Multiples |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada; la comparativa se limita a la relacion con el modelo base y la release AutoRound de Intel citada por el autor.

## Limitaciones y advertencias

- Cuantizacion con perdida: tanto el GPTQ INT4 de expertos y KDA como el AutoRound W4A16 introducen degradacion; el autor lo reconoce y remite a metricas externas no incluidas.
- Compatibilidad restringida: los ficheros solo los lee QEngine 1.5+; no son un checkpoint estandar y no funcionan en vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de hardware elevados: ~192 GB de RAM de host y ~186 GB de disco, ademas de 2-3 GPU de 24 GB. Por debajo del tamano de los expertos el motor no carga.
- Idiomas no documentados: el campo de idiomas esta vacio, por lo que no se puede garantizar cobertura multilingue.
- Capacidades no verificadas: no hay informacion sobre tool calling, agentes, codigo, matematicas ni vision; deben validarse empiricamente antes de usarlas en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la model card; se heredan del modelo base y de la cuantizacion.
- Licencia: MIT para este checkpoint, pero el autor pide respetar tambien la licencia del modelo original; conviene revisarla antes de uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria.
- Fecha de publicacion futura (2026-11-20): conviene verificar la vigencia y posibles actualizaciones del repo.

## Enlaces

- Hugging Face: https://huggingface.co/bpx03/GLM-5.3-Flash-INT4-QEngine
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- QEngine (motor de inferencia): https://github.com/bpx03/QEngine
