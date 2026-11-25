# reaperdoesntknow/delta

## Resumen

delta es un checkpoint de lenguaje experimental publicado por el usuario reaperdoesntknow en Hugging Face bajo la etiqueta TAMELM, con tipo de modelo `tamelm_two_axis`. Se trata de un modelo de investigacion que explora una configuracion arquitectonica concreta que combina attention enrutada, depth attention y una mezcla de expertos (MoE) sin descarte de tokens (dropless). El repositorio incluye los pesos, la configuracion, los recursos del tokenizer y una implementacion propia en `modeling_tamelm.py`, por lo que no es una arquitectura nativa de Transformers y requiere ejecucion de codigo remoto.

El modelo cuenta con 410.256.184 parametros totales segun los tensores en safetensors, 28 capas, una dimension de embedding de 512, 16 cabezas de query y 2 cabezas clave/valor, con 4 expertos y top-k 2 en la capa MoE. La longitud maxima de secuencia configurada es de 1024 tokens y el vocabulario de 49152 entradas. El repositorio ocupa 4,9 GB y acumula 2641 descargas, aunque no registra ningun like.

La relevancia de delta es fundamentalmente investigadora: permite estudiar una variante arquitectonica concreta (routed attention, depth attention y MoE dropless) sobre un checkpoint publico. El autor advierte explicitamente de que el modelo no documenta receta de entrenamiento, dataset, numero de tokens, criterios de seleccion de checkpoint ni resultados de evaluacion, y de que los nombres de arquitectura describen la implementacion, no una capacidad de razonamiento demostrada. No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAMELM (`tamelm_two_axis`), transformer con routed attention, depth attention y MoE dropless |
| Parametros totales | 410.256.184 |
| Parametros activos | no disponible (MoE con 4 expertos y top-k 2, pero sin recuento activo publicado) |
| Longitud de contexto | 1024 tokens (maximo configurado) |
| Tipos de cuantizacion | no disponible (dtype configurado: float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Capas | 28 |
| Dimension de embedding | 512 |
| Cabezas de query / clave-valor | 16 / 2 |
| Expertos / top-k | 4 / 2 |
| Dimension oculta de experto | 2048 |
| Modo de profundidad | attention (dimension 512, 4 cabezas, 16 slots) |
| Backend de atencion | flex (FlexAttention opcional en CUDA) |
| Backend de expertos | grouped (Triton grouped-GEMM opcional) |
| Vocabulario | 49152 |
| Version de Transformers registrada | 5.5.0 |
| Uso de cache | false |

## Arquitectura y entrenamiento

delta implementa una arquitectura propia denominada TAMELM, con tipo `tamelm_two_axis`. La configuracion publicada describe 28 capas con dimension de embedding 512, 16 cabezas de query y 2 cabezas clave/valor, lo que sugiere atencion con comparticion de cabezas KV (grouped-query attention). Incorpora tres mecanismos diferenciados: routed attention, depth attention (modo `attention`, con dimension 512, 4 cabezas y 16 slots) y una mezcla de expertos dropless con 4 expertos, top-k 2 y dimension oculta de 2048 por experto. El backend de atencion configurado es `flex` y el de expertos `grouped`, con alternativas densas/de referencia en la implementacion y aceleracion opcional mediante CUDA FlexAttention y Triton grouped-GEMM.

La implementacion se distribuye como codigo personalizado (`modeling_tamelm.py`) con un `auto_map` que enlaza `AutoConfig` a `modeling_tamelm.TAMEConfig` y `AutoModelForCausalLM` a `modeling_tamelm.TAMELM`. El autor no documenta la receta de entrenamiento: no se especifican datasets ni sus licencias, preprocesado, duracion o numero de tokens, ajustes de optimizador, hardware ni criterios de seleccion de checkpoint. Tampoco se declara si hubo RLHF, DPO u otra fase de alineamiento. La version de Transformers registrada (5.5.0) es metadato de exportacion y no un lockfile de dependencias probado, y la propia model card indica que no se ha validado una receta completa de carga y generacion.

## Capacidades

- Generacion de texto autorregresiva: el pipeline declarado es `text-generation`, con vocabulario de 49152 tokens y contexto maximo de 1024 tokens.
- Arquitectura experimental con routed attention, depth attention y MoE dropless: su interes principal es el estudio de estos mecanismos, no una capacidad funcional demostrada.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Capacidades especiales (thinking mode, vision, audio): no disponible (no documentadas).
- Ejecucion con codigo remoto: requiere `trust_remote_code` y revision fijada del repositorio para reproducibilidad.

## Casos de uso

- Investigacion de arquitecturas MoE: el modelo permite inspeccionar una implementacion funcional de MoE dropless con 4 expertos y top-k 2, util para estudiar enrutamiento de tokens y balanceo de carga en un checkpoint pequeno de 410 millones de parametros.
- Estudio de depth attention y routed attention: los campos de configuracion (depth dimension 512, 4 cabezas, 16 slots) permiten experimentar con estos mecanismos en un entorno controlado y comparar variantes densas frente a las enrutadas.
- Benchmarking de backends de atencion: al soportar FlexAttention en CUDA y alternativas densas, sirve para medir diferencias de rendimiento entre backends sobre el mismo checkpoint.
- Pruebas de integracion de codigo personalizado en Transformers: util para validar flujos de `auto_map`, `trust_remote_code` y carga de pesos safetensors en pipelines propios.
- Educacion y divulgacion: un modelo de 410 millones de parametros y 4,9 GB es manejable para demostrar el funcionamiento interno de un transformer con MoE en cursos o talleres.
- Prototipado de infraestructura de inferencia: permite probar despliegues con llama.cpp, vLLM u Ollama solo si se convierte el checkpoint a los formatos soportados, ya que la implementacion es de codigo personalizado y no nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se declaran puntuaciones de benchmark, mejoras comparativas ni afirmaciones de preparacion para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,6 GB solo para pesos (410 millones de parametros x 4 bytes), mas overhead de activaciones y del contexto de 1024 tokens; el repositorio ocupa 4,9 GB, lo que sugiere artefactos adicionales u optimizador incluido.
- Cuantizacion: no se publican tipos de cuantizacion ni pesos GGUF; habria que generarlos a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder cargar los pesos en float32, aunque la aceleracion FlexAttention y Triton grouped-GEMM requiere CUDA y paquetes compatibles.
- Cabe en GPU consumer: probablemente si (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB), aunque no hay validacion publicada de carga y generacion end-to-end.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y revision fijada; vLLM, llama.cpp, Ollama y TGI no estan documentados para esta arquitectura personalizada y requeririan adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, delta comparte el orden de magnitud de parametros (410 millones) con modelos pequenos tipo GPT-2 medium o Qwen2.5-0.5B, pero no se dispone de datos que permitan comparar contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en el repositorio, por lo que no se permite asumir uso comercial; debe confirmarse con el propietario antes de redistribuir o desplegar.
- Sin receta de entrenamiento: no se documentan datasets, numero de tokens, optimizador, hardware ni criterios de seleccion de checkpoint, lo que impide evaluar la calidad y procedencia de los datos.
- Sin evaluacion publicada: no hay benchmarks, comparativas ni evidencia de capacidad de razonamiento; los nombres de arquitectura describen la implementacion, no el rendimiento.
- Riesgo de alucinacion y sesgos: inherente a cualquier modelo de lenguaje; el autor recomienda evaluar precision, sesgo, memorizacion y seguridad antes de usar las salidas en cualquier aplicacion.
- Contexto limitado: 1024 tokens maximos configurados, insuficiente para conversaciones largas o documentos extensos, y sin evidencia de calidad en contexto largo.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Codigo personalizado: requiere `trust_remote_code` y revision previa de `modeling_tamelm.py`; la version de Transformers registrada (5.5.0) no es un lockfile probado.
- Sin receta de carga validada: no se garantiza la inferencia independiente del hardware; los backends FlexAttention y Triton dependen del runtime y los paquetes instalados.
- No apto para produccion: el propio autor no afirma preparacion para produccion ni garantiza resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reaperdoesntknow/delta
- Archivos del repositorio: https://huggingface.co/reaperdoesntknow/delta/tree/main
- Configuracion publicada: https://huggingface.co/reaperdoesntknow/delta/blob/main/config.json
- Implementacion del modelo: https://huggingface.co/reaperdoesntknow/delta/blob/main/modeling_tamelm.py
