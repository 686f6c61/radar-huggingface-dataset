# experimentalmachines/Qwen3-0.6B-ExecuTorch

## Resumen

Qwen3-0.6B-ExecuTorch es un export cuantizado del modelo Qwen/Qwen3-0.6B (revision `c1899de289a0`) preparado por el usuario experimentalmachines para inferencia en dispositivo con el runtime ExecuTorch 1.4.0. El artefacto principal es un fichero `.pte` de 0,53 GB compilado con el backend XNNPACK (CPU), pensado para ejecutarse en cualquier dispositivo arm64, principalmente telefonos Android, a traves de la aplicacion openweights o de cualquier integracion propia que use ExecuTorch 1.4.0.

El modelo base es un transformer denso de 0,6 mil millones de parametros. El export reduce la ventana de contexto a 16.384 tokens y aplica una cuantizacion 8da4w (activaciones dinamicas de 8 bits y pesos de 4 bits en grupos de 32, con embeddings int8 por canal), manteniendo la cache KV en fp32. El repositorio incluye el tokenizer original sin modificaciones y ficheros de metadatos (`config.json`, `export-report.json`) por cada backend.

Su relevancia es acotada pero concreta: ofrece una via reproducible de llevar un LLM de la familia Qwen3 a moviles Android sin GPU dedicada, con el proceso de export documentado y ligado a una ejecucion concreta de CI. Como contrapartida, el repositorio tiene 0 descargas y 0 likes, la validacion publicada se limita a un smoke test que genera "Paris", y no se acompanan benchmarks ni evaluaciones sistematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3-0.6B; no se detalla en la model card) |
| Parametros totales | 0,6B (del modelo base; el repo contiene el artefacto cuantizado) |
| Longitud de contexto | 16.384 tokens (ventana exportada) |
| Tipos de cuantizacion | 8da4w: activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 por canal, cache KV en fp32 |
| Idiomas soportados | no disponible en esta model card (el modelo base Qwen3 declara soporte multilingue amplio) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); incluye `tokenizer.json`, `config.json` y `export-report.json` |
| Modelo base y revision | Qwen/Qwen3-0.6B, revision `c1899de289a0` |
| Runtime y version | ExecuTorch 1.4.0 |
| Backend | XNNPACK (CPU), con operadores extendidos; objetivo arm64 |
| Tamano del repositorio | 0,5 GB (fichero `xnnpack/Qwen3-0.6B-8da4w-16k.pte`: 0,53 GB) |
| Prefill chunk | 2.048 tokens |
| Memoria de cache KV | 229.376 bytes por token en fp32; 3.758.096.384 bytes con la ventana de 16.384 tokens, reservados en su totalidad al cargar el modelo |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es un artefacto de despliegue derivado de Qwen/Qwen3-0.6B. La arquitectura subyacente es la del modelo base (transformer denso de 0,6B parametros); la model card no describe capas, dimensiones ocultas ni configuracion de atencion, por lo que esos datos deben consultarse en la ficha del modelo original. El proceso de exportacion si esta documentado: se uso la herramienta `export_llm` de ExecuTorch 1.4.0 con activaciones dinamicas de 8 bits, pesos de 4 bits agrupados de 32 en 32, embeddings int8 por canal, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. La ejecucion de CI que genero el artefacto esta enlazada en la propia model card.

La innovacion tecnica relevante no esta en el modelo, sino en el pipeline de exportacion: un unico fichero `.pte` autocontenido mas el tokenizer permite desplegar generacion de texto en Android sin dependencias de Python, y el repositorio adjunta un `export-report.json` con el registro completo del proceso para facilitar la reproducibilidad. No se documentan en esta ficha datos de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO), ya que corresponden al modelo base y no se reproducen aqui.

## Capacidades

- Generacion de texto autoregresiva en dispositivo, con decodificacion sobre CPU arm64 mediante XNNPACK.
- Ventana de contexto de 16.384 tokens, suficiente para conversaciones multi-turno extensas o documentos de varias decenas de paginas.
- Ejecucion completamente local: no requiere red ni envio de datos a servidores externos.
- Integracion con la aplicacion Android openweights y con cualquier runtime ExecuTorch 1.4.0.
- Tokenizer identico al del modelo base (fichero `tokenizer.json` copiado sin cambios), lo que evita divergencias de tokenizacion respecto al modelo original.
- Capacidades de razonamiento, codigo, matematicas, tool calling, modo thinking o multimodalidad: no verificadas ni documentadas en esta model card; el artefacto se publica unicamente con la etiqueta `text-generation`.

## Casos de uso

- Asistentes de texto sin conexion en Android: el modelo puede generar respuestas en un telefono arm64 sin enviar datos a la nube, con una ventana de 16.384 tokens que permite mantener un historial de conversacion largo en memoria.
- Prototipado de aplicaciones moviles con ExecuTorch: el fichero `.pte` y el `export-report.json` permiten reproducir el pipeline de exportacion y validar el comportamiento del runtime en un dispositivo real antes de invertir en modelos mayores.
- Clasificacion y resumen de notas o correos en el propio dispositivo: con contexto de 16k tokens se pueden resumir hilos largos o documentos extensos sin salir del terminal.
- Generacion de texto en entornos sin red (campo, zonas con conectividad limitada o entornos aislados): al no necesitar servidor, el modelo funciona en modo totalmente offline.
- Experimentacion academica sobre inferencia en el borde: sirve como banco de pruebas para medir latencia, consumo de RAM y comportamiento de la cache KV preasignada en distintos SoC arm64.
- Pruebas de integracion y CI de aplicaciones Android: el artefacto puede incorporarse a una app de test y comprobar que la generacion devuelve la salida esperada (el autor documenta el smoke test con la palabra "Paris").
- Autocompletado de campos de formulario o respuestas sugeridas en aplicaciones de productividad, donde la baja latencia percibida importa mas que la calidad absoluta del texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es un smoke test que paso correctamente generando la palabra "Paris". No hay datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos o backends.

## Requisitos de hardware

- VRAM: no aplica, el backend es CPU (XNNPACK); no se incluye ningun export para GPU, NPU ni aceleradores como CoreML, QNN, Vulkan o OpenCL.
- Memoria RAM estimada: 0,53 GB para los pesos mas 3,76 GB (3,5 GiB) de cache KV reservada integramente al cargar, lo que da un minimo de aproximadamente 4,3 GB solo para el modelo. Conviene contar con 6-8 GB de RAM libre en el dispositivo para el runtime, el tokenizer y el resto de la aplicacion.
- Compatibilidad: cualquier dispositivo arm64; en la practica, telefonos y tablets Android de gama media-alta o superior.
- GPU recomendadas: no aplica; no hay backend GPU en este repositorio. Alternativas equivalentes para escritorio serian adaptaciones a llama.cpp o vLLM partiendo del modelo base, no de este artefacto.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 (integrado en una app Android propia) o la aplicacion openweights. No es compatible con vLLM, TGI, Ollama ni llama.cpp, ya que el formato `.pte` no es GGUF ni safetensors.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ningun dispositivo concreto.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-ExecuTorch (este repositorio) | 0,6B | 16.384 tokens | `.pte`, ExecuTorch 1.4.0, XNNPACK CPU | Apache 2.0 | HuggingFace; 0 descargas, 0 likes, autor no oficial |
| Qwen/Qwen3-0.6B (original) | 0,6B | el del modelo base | safetensors, transformers / vLLM | Apache 2.0 | Repositorio oficial de Qwen |
| Qwen3-0.6B en GGUF (llama.cpp) | 0,6B | el del modelo base | GGUF, llama.cpp | Apache 2.0 | Publicado dentro del ecosistema oficial de Qwen |
| Modelos on-device de Google (familia Gemma con LiteRT / MediaPipe) | 1B-2B aprox. | no disponible en la informacion proporcionada | `.task` / LiteRT | licencia propia de Gemma | Repositorios oficiales de Google |

La comparacion cuantitativa de rendimiento entre estas alternativas no es posible con los datos disponibles: este repositorio no publica benchmarks y el smoke test no es comparable con evaluaciones estandarizadas. Como referencia cualitativa, la ventaja de este artefacto es su integracion directa con ExecuTorch y su licencia Apache 2.0 sin restricciones adicionales; su desventaja frente a las alternativas GGUF es que no se beneficia del ecosistema de llama.cpp (Ollama, LM Studio, servidores locales) ni de optimizaciones para GPU de escritorio.

## Limitaciones y advertencias

- Contexto reducido: la ventana exportada es de 16.384 tokens frente al contexto del modelo base, por lo que prompts largos se truncaran antes de lo que permitiria Qwen3-0.6B original.
- Consumo de memoria desproporcionado: la cache KV en fp32 se reserva completa al cargar el modelo (3,76 GB), incluso para prompts muy cortos. En dispositivos con poca RAM libre el proceso puede ser terminado por el sistema operativo.
- Perdida de calidad por cuantizacion: pesos de 4 bits y activaciones dinamicas de 8 bits implican degradacion respecto al modelo en precision completa; no se documenta ninguna evaluacion de esa perdida.
- Validacion practicamente inexistente: 0 descargas, 0 likes y un unico smoke test. No hay evaluacion de sesgos, robustez, ni comportamiento en produccion.
- Riesgo de alucinacion elevado: se trata de un modelo de 0,6B parametros, tamano en el que la generacion de hechos incorrectos con fluidez es habitual. No debe usarse como fuente de verdad sin verificacion.
- Idiomas no verificados: la model card no declara idiomas soportados para este export. El comportamiento multilingue debe validarse empiricamente antes de usarlo en produccion.
- Capacidades no documentadas: no hay confirmacion de soporte de tool calling, function calling, agentes, modo thinking ni decodificacion especulativa en este artefacto, aunque el modelo base pueda soportarlas.
- Licencia: Apache 2.0 heredada del modelo base. Se incluye el fichero `LICENSE` sin modificar, por lo que hay que conservar los avisos de copyright y atribucion de Qwen al redistribuir el artefacto.
- Dependencia de version: el fichero esta generado para ExecuTorch 1.4.0; cambios de version del runtime pueden romper la compatibilidad del `.pte`.
- Proyecto de terceros: no es un artefacto oficial de Qwen ni de Meta/PyTorch, sino de un usuario independiente, sin garantia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen3-0.6B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Fichero de pesos XNNPACK: https://huggingface.co/experimentalmachines/Qwen3-0.6B-ExecuTorch/blob/main/xnnpack/Qwen3-0.6B-8da4w-16k.pte
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Ejecucion de CI que genero el artefacto: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34697939520
- Documentacion de ExecuTorch: https://pytorch.org/executorch/
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido sobre la liga de futbol Serie A), por lo que no se han incorporado enlaces adicionales procedentes de esa busqueda.
