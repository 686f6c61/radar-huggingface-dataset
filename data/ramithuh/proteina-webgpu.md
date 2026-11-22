# ramithuh/proteina-webgpu

## Resumen

Proteina v1.2 (200M, no-triangle) en su variante WebGPU es una exportacion de pesos del modelo upstream `NVIDIA DigitalBiology/proteina`, publicada por el usuario `ramithuh`. El repositorio no contiene un modelo entrenado por el autor, sino un conjunto de pesos safetensors en FP16 e INT8, fragmentados en shards de como maximo 25 MB e acompanados de manifiestos SHA-256, pensados para inferencia directamente en navegador mediante WebGPU en el proyecto denovo.run y su repositorio denovo-webgpu-models.

Se trata de un modelo de aproximadamente 200 millones de parametros, descrito por el autor como "no-triangle", lo que sugiere una variante de arquitectura orientada a proteinas sin el modulo de actualizacion geometrica basado en triangulos habitual en modelos de estructura proteica (tipo Evoformer/AlphaFold). El dominio de aplicacion, por tanto, es la biologia computacional y el diseno de proteinas, no el procesamiento de lenguaje natural general.

Su relevancia actual es de nicho pero concreta: demuestra un flujo de publicacion de pesos optimizados para ejecucion en el cliente (navegador) sin backend GPU, con cuantizacion INT8 y troceado para cargas progresivas. La informacion disponible es muy limitada: no hay datos de benchmarks, contexto, idiomas ni pipeline declarados en la ficha de Hugging Face, y la licencia upstream es no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (variante "no-triangle" de proteina, ~200M) |
| Parametros totales | ~200 millones (segun titulo de la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 e INT8 |
| Idiomas soportados | no disponible (modelo de proteinas, no de lenguaje) |
| Licencia | NVIDIA Source Code License (investigacion/evaluacion no comercial) |
| Formato de pesos | safetensors fragmentados en shards de <= 25 MB con manifiestos SHA-256 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna. El autor la identifica como "Proteina v1.2 (200M, no-triangle)", lo que indica una red de aproximadamente 200 millones de parametros y una variante sin el componente de triangulos (probablemente el modulo de actualizacion de pares geometricos de las arquitecturas tipo AlphaFold/Evoformer). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino supervisado.

El trabajo realizado en este repositorio es de exportacion y empaquetado, no de entrenamiento: los pesos se han convertido a FP16 e INT8, se han troceado en shards pequenos para carga incremental en navegador y se han acompanado de manifiestos SHA-256 para verificar integridad. La model card remite a `README_WEBGPU.md` para la arquitectura detallada y los benchmarks de paridad numerica, pero ese contenido no esta incluido en la informacion disponible.

## Capacidades

- Inferencia de modelo de proteinas: el dominio declarado es la biologia computacional (upstream `NVIDIA DigitalBiology/proteina`), no la generacion de texto.
- Ejecucion en navegador mediante WebGPU: los pesos estan preparados para inferencia pura en cliente en denovo.run.
- Carga fragmentada: shards de hasta 25 MB permiten descarga progresiva y cache en el navegador.
- Verificacion de integridad: manifiestos SHA-256 por shard.
- Cuantizacion dual: variantes FP16 (mayor fidelidad) e INT8 (menor huella y ancho de banda).
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponibles; no se declaran en la informacion proporcionada.

## Casos de uso

- Demos interactivas de diseno de proteinas en navegador: cargar los shards FP16 o INT8 via WebGPU permite ofrecer una demo publica sin coste de backend GPU, con la latencia dependiente del cliente.
- Prototipado rapido en entornos sin GPU dedicada: investigadores pueden evaluar el modelo en un portatil con GPU integrada compatible con WebGPU antes de comprometer recursos de servidor.
- Educacion y divulgacion: al ejecutarse en el navegador, facilita talleres y material docente sobre modelos de proteinas sin instalacion local.
- Validacion de pipelines de exportacion: el repositorio sirve como referencia para convertir pesos de safetensors a formatos fragmentados con verificacion criptografica.
- Pruebas de paridad numerica: comparar salidas FP16 e INT8 frente al modelo upstream para cuantificar la perdida por cuantizacion en el dominio de proteinas.
- Integracion en aplicaciones web cientificas: incrustar inferencia de proteinas en herramientas tipo cuaderno o visor 3D que ya corren en el navegador.
- Evaluacion comparativa de cuantizacion: medir el impacto de INT8 en la calidad de predicciones estructurales o de diseno con un coste de despliegue minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "numerical parity benchmarks" en `README_WEBGPU.md`, pero su contenido no se ha facilitado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con ~200M parametros, FP16 requiere del orden de 0,4 GB de pesos y INT8 del orden de 0,2 GB, a lo que hay que sumar activaciones y buffers (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles; el requisito declarado es un navegador con soporte WebGPU (Chrome/Edge en Windows, Chrome en macOS, y navegadores compatibles en Linux).
- GPU de consumo: por tamano, el modelo deberia caber en practicamente cualquier GPU de consumo con WebGPU habilitado, incluidas integradas; no hay confirmacion oficial.
- Opciones de despliegue: inferencia en navegador via WebGPU (denovo.run, denovo-webgpu-models); no se indican vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de proteinas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Proteina v1.2 (200M, no-triangle) WebGPU | ~200M | no disponible | NVIDIA Source Code License (no comercial) | WebGPU en navegador | Pesos FP16/INT8 fragmentados con SHA-256 |
| NVIDIA DigitalBiology/proteina (upstream) | no disponible | no disponible | NVIDIA Source Code License | Servidor/GPU | Modelo original del que deriva esta exportacion |
| Alternativas de modelos de proteinas de ~200M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no comercial: la NVIDIA Source Code License restringe el uso a investigacion y evaluacion; el uso comercial requiere autorizacion expresa de NVIDIA.
- Ausencia de datos de evaluacion: no hay benchmarks publicados en la informacion disponible, por lo que no puede afirmarse nada sobre calidad predictiva.
- Ambito restringido: es un modelo de proteinas, no un modelo de lenguaje; no debe esperarse generacion de texto, codigo ni capacidades conversacionales.
- Dependencia de WebGPU: la inferencia en navegador exige soporte WebGPU estable, aun limitado en algunos navegadores y sistemas operativos.
- Cuantizacion INT8: puede introducir degradacion numerica respecto a FP16; la magnitud no esta documentada en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero si en la fiabilidad de predicciones biologicas, que deben validarse experimentalmente.
- Sesgos: no disponibles; depende de la composicion del dataset de entrenamiento upstream, no documentada aqui.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; tratar como material de referencia, no como artefacto de produccion.
- Documentacion incompleta: la model card remite a `README_WEBGPU.md`, `LICENSE.NVIDIA` y `NOTICE.md`, cuyo contenido no esta incluido en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/proteina-webgpu
- Modelo upstream: https://huggingface.co/NVIDIA/DigitalBiology-proteina (referenciado como `NVIDIA DigitalBiology/proteina`)
- Repositorio de inferencia WebGPU: https://github.com/ramithuh/denovo-webgpu-models
- Demo: https://denovo.run
