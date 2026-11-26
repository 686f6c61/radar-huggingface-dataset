# professorf/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-gguf

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es la publicacion en precision completa (BF16) del modelo Nemotron 3.5 Lightning de NVIDIA, un LLM de arquitectura hibrida Mixture-of-Experts con 30 000 millones de parametros totales y 3000 millones activos por token. Desarrollado por NVIDIA Corporation entre diciembre de 2025 y mayo de 2026, se distribuye como pesos de referencia pensados para personalizacion (SFT, RL, destilacion, adaptacion de dominio) y para generar variantes cuantizadas propias, no como checkpoint optimizado para inferencia en produccion.

La innovacion principal reside en su arquitectura: intercala capas Mamba-2 con capas MoE y capas de atencion selectivas, lo que reduce el coste computacional del contexto largo frente a un transformer denso equivalente. Soporta hasta 1 millon de tokens de contexto en Blackwell (GB200, B200) y en configuraciones multi-GPU Hopper (8x H100 con TP8 + EP), mientras que en una sola H100 80 GB el contexto validado baja a 256K por limites de memoria. Incluye un modo de razonamiento configurable mediante la plantilla de chat y metodos de decodificacion especulativa (DSpark) para despliegues de baja concurrencia.

El checkpoint que nos ocupa, publicado por el usuario professorf (Nick V. Flor, PhD) bajo el identificador `professorf/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-gguf`, es una conversion a formato GGUF de los pesos BF16 originales, con fines de reproducibilidad en investigacion. Conviene senalar que el repositorio pesa 250 GB, coherente con pesos BF16 sin cuantizar empaquetados en GGUF, no con una cuantizacion comprimida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: capas Mamba-2 intercaladas con capas MoE y capas de atencion selectivas |
| Parametros totales | 32 913 266 240 (~30B, segun safetensors); la model card indica 30B |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta 1M tokens (GB200, B200, 8x H100 TP8+EP); 256K validado en 1x H100 80 GB |
| Tipos de cuantizacion | Este repositorio: BF16 (sin cuantizar, en GGUF). NVIDIA publica ademas una variante NVFP4 y existe un GGUF oficial en ggml-org |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW License Agreement, version 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF (conversion del checkpoint BF16 original en safetensors) |
| Precision de referencia | BF16 |
| Fecha de publicacion | 11 de agosto de 2026 |
| Muestreo recomendado | Temperature 1.0, Top_P 0.95 |
| Hardware soportado | NVIDIA Blackwell (GB200, B200), Hopper (H100, H200), Ampere (A100) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y un subconjunto de capas de atencion clasica. Esta disposicion busca escalar la longitud de contexto sin el crecimiento cuadratico en coste de atencion de un transformer denso, manteniendo al mismo tiempo la capacidad de recuperacion precisa que aportan las capas de atencion. Con 30B parametros totales y solo 3B activos por token, el coste de inferencia por token se aproxima al de un modelo mucho mas pequeno, lo que explica la designacion "Lightning" y su orientacion a agentes.

Los datos de entrenamiento provienen de los conjuntos publicados por NVIDIA: `nvidia/nemotron-pre-training-datasets` para la fase de preentrenamiento, con fecha de corte en septiembre de 2025, y `nvidia/nemotron-post-training-v3` para el postentrenamiento, con corte en mayo de 2026. La model card no detalla el numero exacto de tokens de preentrenamiento ni la composicion porcentual del dataset, ni especifica que tecnicas de alineacion (RLHF, DPO u otras) se aplicaron en la fase de postentrenamiento. Si se documenta la existencia de decodificacion especulativa mediante el metodo DSpark, orientado a despliegues de centro de datos con baja concurrencia, y un modo de razonamiento activable o desactivable a traves de la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento configurable: modo "thinking" activable o desactivable por peticion mediante la plantilla de chat, lo que permite separar respuestas rapidas de respuestas con cadena de razonamiento.
- Generacion de codigo, con soporte explicito de lenguajes de programacion segun la model card.
- Procesamiento de contexto muy largo: hasta 1M tokens en hardware Blackwell y configuraciones multi-GPU Hopper, habilitando tareas de recuperacion y sintesis sobre documentos extensos.
- Capacidad de ajuste fino: al ser pesos de referencia BF16, sirve como base para SFT, RL, destilacion y adaptacion de dominio.
- Produccion de variantes cuantizadas: punto de partida para generar checkpoints NVFP4, GGUF u otros formatos optimizados.
- Despliegue en una sola GPU de 80 GB (H100 o A100) con contexto de 256K.
- Decodificacion especulativa DSpark para reducir latencia en escenarios de baja concurrencia.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni capacidades multimodales.

## Casos de uso

- Ajuste fino supervisado (SFT) para dominio especializado: al tratarse de pesos BF16 de referencia, es el punto de partida natural para entrenar un modelo vertical (legal, sanitario, financiero) sin partir de un checkpoint cuantizado con perdida de precision.
- Destilacion hacia modelos menores: los 30B totales con solo 3B activos permiten usar el modelo como profesor en pipelines de destilacion, generando trazas de razonamiento y respuestas de alta calidad para entrenar modelos mas pequenos.
- Generacion de variantes cuantizadas propias: investigadores pueden producir sus propios GGUF, NVFP4 o AWQ a partir de estos pesos y comparar la degradacion respecto al original, que es precisamente el proposito declarado del repositorio.
- Analisis de documentos extensos en una sola H100: con 256K tokens de contexto validados en una GPU de 80 GB, cabe procesar informes anuales, expedientes o bases de codigo completas sin fragmentacion agresiva.
- Evaluacion y benchmarking a precision completa: util para obtener lineas base de referencia frente a versiones cuantizadas y medir el impacto real de la cuantizacion en tareas de razonamiento y codigo.
- Investigacion en arquitecturas hibridas Mamba-2/MoE: el modelo permite estudiar el comportamiento de capas SSM intercaladas con atencion en tareas de contexto largo, comparandolo con transformers densos de tamano similar.
- Asistencia conversacional multilingue en europeo: cobertura nativa de espanol, frances, aleman e italiano, adecuada para productos dirigidos al mercado europeo sin depender de traduccion intermedia.
- Despliegue en centro de datos con baja concurrencia y baja latencia: la combinacion de 3B activos y decodificacion especulativa DSpark esta pensada para escenarios interactivos donde el tiempo hasta el primer token es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica de precision (`accuracy_plot.png`) sin valores numericos textuales, y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones en los datos disponibles.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 66 GB solo para pesos (32 913 266 240 parametros x 2 bytes), mas overhead de cache KV y activaciones. En la practica requiere una GPU de 80 GB para contexto reducido.
- GPU recomendadas segun la model card: GB200 y B200 (Blackwell) para contexto de 1M; H100 80 GB y H200 (Hopper); A100 80 GB (Ampere).
- Configuracion multi-GPU: 8x H100 con TP8 + EP permite 1M tokens de contexto en BF16 mediante vLLM.
- GPU de consumo: este checkpoint BF16 no cabe en ninguna GPU de consumo actual. Para RTX 5090, DGX Spark o RTX 6000 Pro, NVIDIA remite al checkpoint GGUF oficial de ggml-org y a la variante NVFP4.
- Opciones de despliegue documentadas: vLLM (`--max-model-len 1048576`) y SGLang (`--context-length 1048576`) en BF16. El formato GGUF de este repositorio es compatible con llama.cpp y derivados, aunque el tamano de 250 GB hace inviable su uso en hardware de consumo sin cuantizar.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible. Cabe esperar una ventaja de throughput derivada de los 3B parametros activos frente a un modelo denso de 30B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (este) | ~30B | ~3B | 1M (Blackwell / 8x H100); 256K en 1x H100 | Mamba-2 + MoE + atencion | OpenMDW 1.1 | BF16, GGUF, NVFP4 |
| Nemotron 3.5 Lightning 30B-A3B NVFP4 | ~30B | ~3B | 1M (segun hardware) | Mamba-2 + MoE + atencion | OpenMDW 1.1 | NVFP4 |
| Nemotron 3.5 Lightning 30B-A3B GGUF (ggml-org) | ~30B | ~3B | Segun cuantizacion y hardware | Mamba-2 + MoE + atencion | OpenMDW 1.1 | GGUF cuantizado |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar este modelo con alternativas de otros fabricantes de tamano o categoria similares. La comparativa se limita a las variantes del mismo modelo publicadas por NVIDIA y por ggml-org.

## Limitaciones y advertencias

- Este repositorio concreto es una conversion no oficial a GGUF de los pesos BF16, publicada por un tercero (professorf) con fines de reproducibilidad. No es el checkpoint de referencia de NVIDIA ni ha pasado por su proceso de validacion.
- El repositorio pesa 250 GB y contiene pesos BF16 sin cuantizar: no aporta ninguna ventaja de despliegue frente al safetensors original y no cabe en hardware de consumo.
- Riesgo de alucinacion: no se documenta en la informacion disponible ninguna evaluacion especifica de tasas de alucinacion ni de calibracion.
- Sesgos: la model card no incluye una seccion de sesgos conocidos, evaluaciones de equidad ni recomendaciones de mitigacion. Los datos de preentrenamiento y postentrenamiento provienen de los datasets de NVIDIA, cuya composicion no se detalla.
- Cobertura idiomatica limitada a seis idiomas; el rendimiento fuera de ellos no esta garantizado ni documentado.
- El contexto de 1M tokens solo esta validado en Blackwell y en configuraciones de 8x H100; en una sola H100 80 GB el limite practico es 256K.
- Licencia OpenMDW 1.1: aunque la model card declara que el modelo esta listo para uso comercial, es una licencia con terminos propios distintos de Apache 2.0 o MIT. Debe revisarse el texto completo antes de integrarlo en un producto.
- El modo de razonamiento y el muestreo recomendado (temperature 1.0, top_p 0.95) condicionan la calidad de salida; desviarse de ellos sin reevaluar puede degradar resultados.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible, pese a que la familia Nemotron se orienta a la construccion de agentes. Conviene validarlo empiricamente antes de disenar flujos que dependan de ello.
- Al ser pesos de referencia para personalizacion, no incorporan las optimizaciones de inferencia de la variante NVFP4; para produccion con latencia critica, NVIDIA recomienda explicitamente esa variante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/professorF/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16-gguf
- Variante NVFP4 oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint GGUF oficial (ggml-org): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Demo en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1 (GitHub): https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
