# fraserprice/Ternary-Bonsai-2-27B-vllm

## Resumen

Ternary-Bonsai-2-27B-vllm es un reempaquetado no oficial del modelo Bonsai 2 27B de Prism ML, publicado por el usuario fraserprice, cuyo objetivo es hacer que los pesos ternarios del pack original de MLX funcionen sobre vLLM con aceleracion CUDA. Se trata, por tanto, de una conversion de formato y de runtime, no de un modelo entrenado de nuevo: conserva los codigos de 2 bits y las escalas FP16 por grupo (g128) del pack MLX, en la misma base rotada con Hadamard, y adapta los tensores al layout de Hugging Face.

El repositorio pesa 10,3 GB y los metadatos de safetensors declaran 3.522.221.056 parametros (unos 3,52 B), una cifra que no coincide con el "27B" del nombre comercial y que conviene tratar con cautela al planificar el despliegue. El modelo es solo texto: la torre de vision no se incluye. Incorpora una cabeza MTP (multi-token prediction) en BF16 tomada de Qwen/Qwen3.8-27B que se usa unicamente para decodificacion especulativa, verificandose todos los tokens con el modelo Bonsai.

Su relevancia actual es doble. Por un lado, permite servir en vLLM un modelo con pesos ternarios de 2 bits, una cuantizacion agresiva que reduce mucho el coste de memoria del nucleo de pesos. Por otro, es un ejemplo practico de integracion de kernels propios mediante un plugin de vLLM (`prism_ternary`), aunque el autor solo lo ha construido y probado en una RTX PRO 6000 Blackwell, por lo que el soporte en otras GPU NVIDIA queda sin verificar. La licencia es Apache 2.0, igual que la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ruta de atencion lineal (tag `qwen3_5`); detalles completos no disponibles |
| Parametros totales | 3.522.221.056 (unos 3,52 B) segun metadatos de safetensors; el nombre del modelo indica 27B |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria de 2 bits con escalas FP16 por grupo (g128); embeddings dequantizados a BF16; cabeza MTP en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 10,3 GB, `library_name: vllm`) |

## Arquitectura y entrenamiento

No se ha entrenado un modelo nuevo: este repositorio es el resultado de `prism-ternary-convert`, una herramienta del repositorio fraserprice/bonsai-vllm que reempaqueta el pack MLX de Prism ML para vLLM. Los pesos ternarios se copian bit a bit, con los mismos codigos de 2 bits y las mismas escalas FP16 de grupo (g128), en la misma base rotada con Hadamard. La conversion elimina los sesgos redundantes por grupo de MLX (`-scale`) y traslada los signos de la rotacion al `config.json`. La tabla de embeddings se dequantiza a BF16, y las normas y la ruta de estado de la atencion lineal se toman de los tensores originales de Prism ML convertidos al layout de Hugging Face.

La innovacion tecnica mas destacable es el uso de una cabeza MTP en BF16 procedente de Qwen/Qwen3.8-27B, que el pack MLX no incluye, para decodificacion especulativa: la cabeza solo propone tokens candidatos y cada token es verificado por el modelo Bonsai, de modo que no altera la distribucion final del modelo. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original de Prism ML, construido a partir de Qwen3.8-27B de Alibaba Cloud. Tampoco se documentan cambios de entrenamiento introducidos por esta conversion.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es `text-generation` y el modelo incluye la etiqueta `conversational`.
- Decodificacion especulativa con cabeza MTP: acelera la generacion y mantiene la verificacion token a token por parte del modelo principal.
- Ejecucion en vLLM sobre CUDA mediante el plugin `prism_ternary`, con kernels propios para los pesos ternarios.
- Inferencia con pesos de 2 bits, lo que reduce el coste de memoria asociado al nucleo de pesos.
- Razonamiento, codigo, matematicas o soporte de tool calling: no disponibles; la model card no documenta estas capacidades.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Vision: no soportada; la torre de vision no se incluye y el modelo es solo texto.
- Modo thinking explicito, audio u otras modalidades: no disponibles.

## Casos de uso

- Servicio de generacion de texto autoalojado en vLLM: desplegar el modelo con el plugin `prism_ternary` para atender peticiones HTTP en un endpoint compatible con OpenAI, aprovechando la decodificacion especulativa de la cabeza MTP para reducir el coste por token generado.
- Investigacion en cuantizacion ternaria: usar el repositorio como referencia de como se empaquetan codigos de 2 bits y escalas FP16 por grupo (g128) y como se integran en un runtime distinto del original (MLX a vLLM).
- Desarrollo de kernels CUDA para vLLM: el plugin del autor sirve como base para probar kernels personalizados de pesos ternarios sobre GPUs Blackwell y comparar su rendimiento frente a alternativas en BF16.
- Evaluacion de decodificacion especulativa: estudiar en un entorno controlado como se comporta una cabeza MTP entrenada sobre otro modelo (Qwen3.8-27B) cuando solo propone borradores que el modelo principal verifica.
- Experimentos academicos reproducibles de compresion extrema: al estar bajo Apache 2.0 y en safetensors, el modelo puede inspeccionarse tensor a tensor para analizar el efecto de la rotacion Hadamard y del agrupamiento de escalas.
- Prototipado de asistentes conversacionales en texto: el modelo conserva la etiqueta conversacional y una cabeza de generacion estandar, por lo que puede integrarse en interfaces de chat de un solo turno o multi-turno, siempre que la longitud de contexto real se valide antes en produccion.
- Canalizaciones por lotes de generacion de texto en infraestructura propia: al ser un artefacto de 10,3 GB y solo texto, encaja en nodos con GPU de gran memoria dedicados a procesamiento por lotes, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este reempaquetado remite explicitamente a la model card original de `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` para benchmarks y parametros de muestreo, y al repositorio `fraserprice/bonsai-vllm` para las cifras de throughput. No se dispone de dichos numeros en la informacion proporcionada, por lo que no se incluye tabla comparativa de MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- Repositorio de 10,3 GB: es el tamano de descarga en disco de todos los tensores, incluidos la tabla de embeddings en BF16 y la cabeza MTP, no solo el nucleo ternario.
- VRAM estimada: no disponible de forma oficial. A modo de referencia, si los pesos ternarios se almacenan empaquetados a 2 bits, el nucleo de pesos ronda 1 GB, pero el total en memoria depende de como vLLM materialice embeddings, escalas y cabeza MTP; hay que medirlo en el despliegue real.
- GPU probada: RTX PRO 6000 Blackwell exclusivamente. El autor indica que otras GPU NVIDIA no han sido verificadas.
- GPU consumer: no confirmado. No hay evidencia publicada de ejecucion en RTX 4090, RTX 5090 u otras tarjetas de gama de consumo; el soporte depende de los kernels del plugin, no solo de la capacidad de memoria.
- Opciones de despliegue: vLLM con el plugin `prism_ternary` del repositorio fraserprice/bonsai-vllm. La model card proporciona la imagen Docker `fraserpricee/bonsai-vllm:20260918` con el comando `docker run --rm --gpus all --ipc=host -p 8000:8000 -v bonsai:/cache fraserpricee/bonsai-vllm:20260918`.
- Compatibilidad con llama.cpp, Ollama, TGI u otros motores: no disponible; no se documenta ninguna conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite al repositorio del plugin para consultar esas cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| fraserprice/Ternary-Bonsai-2-27B-vllm | 3,52 B declarados en safetensors (nombre comercial: 27B) | No disponible | Ternaria 2 bits, escalas FP16 g128 | Apache 2.0 | safetensors, vLLM con plugin `prism_ternary` | Repo de 10,3 GB; 0 descargas y 0 likes en el momento de la consulta |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | No disponible | No disponible | Ternaria 2 bits (pack MLX) | Apache 2.0 | MLX | Modelo original de Prism ML; benchmarks y parametros de muestreo publicados en su model card |
| Qwen/Qwen3.8-27B | No disponible | No disponible | No disponible (origen de la cabeza MTP en BF16) | No disponible en la informacion proporcionada | safetensors (Hugging Face) | Modelo publico de Alibaba Cloud; base sobre la que se construyo Bonsai segun la model card |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Reempaquetado no oficial: el autor declara explicitamente que no esta afiliado a Prism ML. No es un artefacto soportado por el desarrollador del modelo original.
- Dependencia de un plugin externo: requiere el plugin `prism_ternary` de fraserprice/bonsai-vllm y una imagen Docker concreta; sin el, el modelo no se puede cargar en vLLM de forma estandar.
- Pruebas limitadas a una unica GPU: construido y probado solo para RTX PRO 6000 Blackwell. El comportamiento en A100, H100, RTX 4090 u otras tarjetas es desconocido y puede fallar.
- Discrepancia de parametros: el nombre indica 27B, pero los metadatos de safetensors declaran 3.522.221.056 parametros. Hay que verificar el consumo real de memoria y la calidad antes de asumir cualquier cifra de despliegue.
- Solo texto: la torre de vision no esta incluida, a diferencia de lo que pueda ofrecer el modelo de origen. No se pueden procesar imagenes.
- Cabeza MTP de procedencia distinta: la cabeza de decodificacion especulativa en BF16 proviene de Qwen/Qwen3.8-27B; aunque cada token se verifica con el modelo Bonsai, conviene medir su tasa de aceptacion real en el caso de uso concreto.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no hay garantia de calidad multilingue ni de cobertura por idioma.
- Longitud de contexto desconocida: no se publica la ventana de contexto efectiva en este reempaquetado; no debe asumirse la del modelo original sin verificacion.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo, seguridad ni tasas de alucinacion para este artefacto. Un modelo cuantizado a 2 bits puede degradar la calidad respecto a su equivalente en mayor precision, y no hay benchmarks publicados aqui que lo cuantifiquen.
- Adopcion nula y mantenimiento incierto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (18 de septiembre de 2026). Es un artefacto reciente y sin validacion comunitaria.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.8-27B y de Bonsai conviene revisar el archivo `NOTICE.txt` del repositorio y las condiciones del modelo original antes de explotarlo en produccion.
- Los resultados de la busqueda web realizada no aportan informacion tecnica relevante sobre este modelo (devuelven paginas de ayuda de Google Translate), por lo que toda la ficha se basa en la informacion del repositorio de Hugging Face y en su model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fraserprice/Ternary-Bonsai-2-27B-vllm
- Modelo base (pack MLX de Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Repositorio del plugin de vLLM (kernels, comandos y cifras de throughput): https://github.com/fraserprice/bonsai-vllm
- Incidencias del plugin: https://github.com/fraserprice/bonsai-vllm/issues
- Imagen Docker del runtime: `fraserpricee/bonsai-vllm:20260918`
- Web de Prism ML: https://prismml.com
- Modelo del que procede la cabeza MTP en BF16: https://huggingface.co/Qwen/Qwen3.8-27B
- Archivo de atribuciones y licencias del repositorio: `NOTICE.txt`
