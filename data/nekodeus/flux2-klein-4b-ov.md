# Nekodeus/flux2-klein-4b-ov

## Resumen

Nekodeus/flux2-klein-4b-ov es una conversion a OpenVINO IR del modelo de generacion de imagenes FLUX.2-klein-4B, concretamente del espejo en difusores INT8 publicado por el usuario tonera (tonera/FLUX.2-klein-4B-int8-diffusers). Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: el autor toma los pesos INT8 de un transformer rectified-flow de 4.000 millones de parametros y los exporta al formato intermedio de OpenVINO mediante `optimum-cli export openvino --weight-format int8`.

Su relevancia es practica: al ejecutarse sobre el runtime de OpenVINO con el plugin AUTO, el modelo puede inferirse en cualquier CPU sin dependencia de CUDA ni de hardware NVIDIA, y ademas aprovecha aceleracion por GPU en equipos AMD, Intel y NVIDIA cuando esta disponible. Segun la propia model card, los pesos INT4 del transformer ocupan alrededor de 3,1 GB (frente a unos 4 GB en INT8), lo que permite encajar el pipeline completo en tarjetas con 8 GB de VRAM manteniendo el muestreo estandar de 50 pasos con CFG.

El repositorio ocupa 4,0 GB, tiene licencia no declarada y esta etiquetado unicamente para ingles. La model card no documenta el dataset de entrenamiento, los resultados de benchmarks ni las condiciones de uso comercial, por lo que su evaluacion en produccion exige verificar primero la licencia heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rectified-flow de difusion (FLUX.2-klein), exportado a OpenVINO IR |
| Parametros totales | 4B (4.000 millones, segun el nombre del modelo y la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de contexto de LLM; el texto se procesa con el encoder de texto de FLUX.2 y el transformer opera sobre latentes) |
| Tipos de cuantizacion | INT8 en los pesos del IR exportado; la model card menciona ademas pesos INT4 que caben en 8 GB de VRAM y la etiqueta del repo incluye `int4`, en aparente contradiccion con el titulo "INT8" |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | OpenVINO IR (`model.xml` + pesos binarios), exportado con `optimum-cli export openvino` |
| Libreria | openvino |
| Pipeline | text-to-image |
| Tamano del repositorio | 4,0 GB |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de FLUX.2-klein-4B: un transformer de difusion con formulacion rectified flow y 4.000 millones de parametros, del mismo linaje que la familia FLUX de Black Forest Labs. El repositorio publicado no contiene el modelo entrenado, sino su representacion en OpenVINO IR generada con `optimum-cli export openvino --weight-format int8`, sin pases especificos de fabricante, lo que produce un grafo neutro respecto al dispositivo. El pipeline se compila con `core.compile_model(model, "AUTO")`, de modo que el runtime selecciona automaticamente CPU o GPU segun el hardware presente.

No hay informacion en la model card sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO; esos datos corresponderian al modelo original de FLUX.2 y no se reproducen aqui. La unica transformacion tecnica documentada es la cuantizacion de pesos a INT8 (con mencion de INT4) y la exportacion a IR, orientadas a reducir el peso de descarga y el consumo de VRAM frente a un checkpoint en BF16.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en ingles.
- Muestreo rectified flow estandar de 50 pasos con classifier-free guidance (CFG).
- Inferencia en CPU sin CUDA, con aceleracion opcional por GPU de AMD, NVIDIA o Intel mediante el plugin AUTO de OpenVINO.
- Ejecucion con pesos cuantizados a INT8 y, segun la model card, en INT4 para ajustarse a tarjetas de 8 GB de VRAM.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento (thinking): son capacidades ajenas a un pipeline de difusion text-to-image.
- No se documenta capacidad multilingue distinta del ingles.

## Casos de uso

- Generacion de ilustraciones por lotes en servidores sin GPU NVIDIA: al compilar con el plugin AUTO sobre CPU, el modelo puede producir imagenes en maquinas x86 convencionales o en instancias cloud sin acelerador dedicado.
- Prototipado local en estaciones de trabajo con GPU de 8 GB: la cuantizacion INT4 permite mantener el pipeline completo dentro de ese presupuesto de VRAM, con lo que un equipo de diseno puede iterar prompts sin recurrir a servicios externos.
- Despliegue en equipos con GPU AMD o Intel: la neutralidad de dispositivo del IR exportado evita depender exclusivamente del ecosistema CUDA, un escenario habitual en parques de portatiles y estaciones con graficos integrados.
- Integracion en aplicaciones de escritorio o边缘 (edge): el IR de OpenVINO esta pensado para incrustarse en aplicaciones nativas, de modo que un producto de escritorio puede ofrecer generacion de imagenes sin conexion a Internet.
- Reduccion del ancho de banda de distribucion: el repositorio de 4,0 GB es mas ligero que un checkpoint en BF16 equivalente, lo que simplifica la descarga inicial en entornos con red limitada o en imagenes de contenedor versionadas.
- Evaluacion comparativa de cuantizacion: sirve como referencia practica para medir la perdida de calidad visual y la ganancia de velocidad al pasar de BF16 a INT8/INT4 en un transformer de difusion de 4B.
- Pruebas de compatibilidad de OpenVINO: util para verificar el comportamiento de `optimum-cli` y del plugin AUTO en un pipeline de difusion antes de estandarizar el runtime en un equipo de ingenieria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas de calidad perceptual) ni mediciones de latencia o throughput por dispositivo. Tampoco hay resultados de benchmarks de terceros en los resultados de busqueda web consultados.

## Requisitos de hardware

- VRAM estimada: segun la model card, los pesos INT4 del transformer ocupan aproximadamente 3,1 GB y los INT8 alrededor de 4 GB, lo que permite operar en tarjetas con 8 GB de VRAM una vez sumados el encoder de texto, el VAE y las activaciones.
- GPU compatibles: el IR es neutro respecto al fabricante y se ejecuta con aceleracion en GPU AMD, NVIDIA e Intel a traves del plugin AUTO de OpenVINO. La model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM cuando se usan pesos INT4, segun la informacion del autor.
- CPU: si, es el escenario principal declarado; funciona en cualquier CPU x86 compatible con OpenVINO, sin CUDA.
- Opciones de despliegue: runtime de OpenVINO (Python o C++) y `optimum-cli` para la exportacion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. La model card no publica tiempos por paso, imagenes por segundo ni comparativas entre INT8 e INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Soporte de hardware | Licencia |
|---|---|---|---|---|---|
| Nekodeus/flux2-klein-4b-ov | 4B | OpenVINO IR | INT8 (mencion de INT4) | CPU x86, GPU AMD/NVIDIA/Intel via OpenVINO | no disponible |
| tonera/FLUX.2-klein-4B-int8-diffusers | 4B | diffusers | INT8 | GPU con CUDA, segun el ecosistema diffusers | no disponible |
| FLUX.2-klein-4B (original) | 4B | safetensors (BF16) | sin cuantizar | GPU con suficiente VRAM | no disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida o el rendimiento entre estas variantes. La diferencia documentada es de formato de pesos, cuantizacion y compatibilidad de hardware, no de capacidades.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar que el uso comercial este permitido. Es imprescindible verificar la licencia del modelo original FLUX.2-klein-4B antes de cualquier despliegue en produccion.
- Contradiccion interna sobre la cuantizacion: el titulo de la model card indica INT8, el campo `Precision` indica INT8, los tags del repositorio incluyen `int4` y el texto afirma que "los pesos INT4 caben en 8 GB de VRAM". No queda claro que artefacto contiene realmente el repositorio.
- Idioma: el modelo esta etiquetado solo para ingles, por lo que la calidad de generacion con prompts en castellano no esta garantizada.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomias incorrectas, texto ilegible en la imagen, composiciones incoherentes con el prompt o sesgos de representacion heredados del dataset de entrenamiento original.
- Sin benchmarks publicados: no hay evidencia objetiva de la degradacion de calidad introducida por la cuantizacion INT8/INT4 frente al checkpoint original.
- Repositorio con actividad minima: 0 descargas y 1 like en el momento de la consulta, lo que reduce la probabilidad de que los problemas de conversion hayan sido validados por la comunidad.
- Fecha de creacion inusual (2026-09-20): conviene verificar la integridad y procedencia de los pesos antes de usarlos en entornos de confianza.
- Artefacto de conversion, no modelo original: cualquier actualizacion, correccion de sesgos o mejora del modelo base no se reflejara automaticamente en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Nekodeus/flux2-klein-4b-ov
- Modelo de origen citado en la model card: https://huggingface.co/tonera/FLUX.2-klein-4B-int8-diffusers
- Documentacion de OpenVINO: no disponible en la informacion proporcionada
- Paper tecnico de FLUX.2: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
- Los resultados de busqueda web consultados no contienen enlaces relevantes sobre este modelo: devuelven exclusivamente articulos en ruso sobre cancelacion de pedidos en tiendas online, sin relacion con FLUX.2, OpenVINO ni generacion de imagenes.
