# alice-noa-chan/haru_3-student-pairshare-base

## Resumen

Haru v3 PairShare8-r48 es un modelo de lenguaje de tipo decoder transformer denso, de 13.688.705 parámetros según su model card, desarrollado por el usuario alice-noa-chan dentro del proyecto Haru. Se trata de un "student" experimental destilado, publicado como repositorio independiente para preservar un candidato que finalmente no fue seleccionado por el autor. Es un modelo base (non-IT), es decir, sin ajuste por instrucciones: su única tarea es la continuación de cuentos infantiles en coreano.

El modelo resuelve un problema muy concreto: generar continuaciones coherentes de relatos infantiles en coreano con un coste computacional mínimo. Con 1.024 tokens de contexto, un vocabulario BPE de 12.000 entradas y pesos FP32 sin cuantizar, está pensado para experimentación en arquitecturas y para inferencia en CPU, no para uso conversacional general.

Su relevancia es fundamentalmente de investigación: explora una variante arquitectónica poco habitual (compartición de la FFN SwiGLU entre pares de capas adyacentes más un adaptador residual lineal de rango 48 por capa) frente a la variante Gated8, que fue la seleccionada. El autor documenta explícitamente que la selección se hizo por velocidad en CPU, no por calidad, y que el intervalo de confianza bootstrap de la diferencia de BPC entre ambos incluye el cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `haru_dense`: transformer decoder denso de 8 capas logicas, con una FFN SwiGLU compartida por cada par de capas adyacentes (4 grupos) y un adaptador residual lineal independiente de rango 48 por capa |
| Parametros totales | 13.688.705 segun la model card; 14.600.704 segun el recuento de safetensors publicado en HuggingFace (la diferencia no se explica en la informacion disponible) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 1.024 tokens (entrada + salida deben caber en ese limite) |
| Tipos de cuantizacion | No disponible. Los pesos publicados son FP32 sin cuantizar y no se documenta soporte de GGUF ni de cuantizaciones de otro tipo |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32), con implementacion de modelo y tokenizer personalizadas que requieren `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura, etiquetada como `haru_dense`, es un decoder transformer con 8 capas logicas, anchura oculta de 384 y anchura SwiGLU de 960. Su rasgo diferencial es la comparticion de la FFN: una unica FFN SwiGLU se comparte entre cada par de capas adyacentes, lo que da 4 grupos compartidos. Para compensar la perdida de capacidad por capa, se anade un adaptador residual lineal independiente de rango 48 en cada capa. La atencion y la cache KV si son independientes por capa logica, con 6 cabezas de consulta y 2 cabezas KV (GQA). Incorpora RMSNorm, QK RMSNorm, RoPE, una puerta sigmoide en la salida de atencion y embeddings de entrada/salida atados con rasgos superficiales del coreano. El vocabulario es BPE de 12.000 entradas.

El entrenamiento fue una destilacion desde un teacher congelado autoentrenado, con una funcion de perdida de 0,5 CE + 0,5 x T^2 KL(teacher || student) y T=2. Ambos candidatos student completaron 500.039.680 tokens de destilacion, pero los pesos publicados en este repositorio corresponden al mejor checkpoint de validacion de cuentos, situado en 475.398.144 tokens (paso 3.627). El autor distingue intencionadamente entre tokens de entrenamiento completados y tokens del checkpoint seleccionado. La variante publicada aqui no fue la elegida: la regla de seleccion predeclarada escogio Gated8-13m por ser mas rapido en CPU, con un intervalo bootstrap del 95 % para la diferencia de BPC de validacion (PairShare menos Gated) de [-0,009002, 0,003038], que incluye el cero.

## Capacidades

- Generacion y continuacion de texto narrativo en coreano: es su unica funcion documentada, orientada a cuentos infantiles.
- Modelo base (non-IT): no ha recibido ajuste por instrucciones ni alineacion conversacional, por lo que no sigue ordenes ni mantiene dialogos de forma fiable.
- Sin soporte documentado de tool calling, function calling ni uso como agente.
- Sin capacidades de razonamiento multi-paso, matematicas, codigo, vision ni audio documentadas.
- Multilingue: no. Solo coreano (ko).
- Modo thinking: no disponible.
- Inferencia en CPU soportada, ademas de GPU, con `use_cache=True`.
- Pesos FP32 compartidos con la rama `pairshare8-r48` del repositorio `haru_3-student-base`; no es un checkpoint reentrenado.

## Casos de uso

- Continuacion de cuentos infantiles en coreano: caso de uso principal y unico documentado por el autor. Se le pasa un inicio de relato (por ejemplo, "el conejo que vive en un pueblo pequeno encontro un boton brillante en el camino") y el modelo genera la continuacion con temperatura 0,8, top_p 0,9 y penalizacion por repeticion de 1,08.
- Generacion de texto offline en dispositivos muy limitados: con unos 55 MB de pesos en FP32 cabe en Raspberry Pi, moviles de gama media o navegadores via WebAssembly, lo que permite crear juguetes educativos o aplicaciones infantiles sin conexion.
- Prototipado de investigacion en destilacion de conocimiento: la model card documenta la receta completa (CE + KL escalada por T^2, teacher congelado, presupuesto de tokens), lo que lo convierte en una referencia reproducible para estudiar destilacion a escala diminuta.
- Experimentacion en arquitecturas con comparticion de parametros: permite comparar directamente la comparticion de FFN por pares de capas con adaptadores de bajo rango frente a FFN independientes, usando el mismo presupuesto de parametros y de tokens.
- Generacion de datos sinteticos de cuentos en coreano para curación de corpus: util para generar candidatos que luego se filtran manual o automaticamente en la construccion de datasets infantiles en coreano.
- Pruebas de pipelines de inferencia y de compatibilidad de frameworks: el repositorio incluye un wrapper que corrige el error de carga `all_tied_weights_keys` de Transformers 5, y la carga se verifico con Transformers 4.57.1 y 5.17.0, por lo que sirve como caso de prueba para integraciones con codigo personalizado.
- Punto de partida para fine-tuning ligero en dominios concretos del coreano: al ser base y con licencia MIT, se puede reentrenar para generacion de rimas, adivinanzas o material didactico.
- Benchmarking de latencia en CPU: con una tasa medida de 93,28 tokens/s en CPU a 4 hilos, es util como referencia de rendimiento para modelos por debajo de 20 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta BPC (bits por caracter) sobre cuentos, metrica propia del proyecto.

| Metrica | PairShare8-r48 | Gated8-13m (seleccionado) |
|---|---|---|
| BPC de validacion en cuentos (menor es mejor) | 0,945834 | 0,949001 |
| BPC de test en 64 cuentos reservados, contexto 512 (menor es mejor) | 0,952942 | 0,960557 |
| Generacion en CPU del host de entrenamiento, 4 hilos | 93,28 tokens/s | 110,63 tokens/s |
| Parametros | 13.688.705 | 13.688.705 |
| Tokens de destilacion completados | 500.039.680 | 500.039.680 |

El intervalo de confianza del 95 % por bootstrap de documentos pareados para la diferencia de BPC de validacion (PairShare menos Gated) fue [-0,009002, 0,003038], que incluye el cero, por lo que no se puede afirmar superioridad estadistica de ninguno de los dos candidatos con estos datos. Se trata de una unica semilla de entrenamiento y el bootstrap no mide la variacion entre semillas.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 55 MB solo para pesos (13,7 M de parametros x 4 bytes), mas activaciones y cache KV. Con 1.024 tokens de contexto y solo 2 cabezas KV por capa, la cache KV es despreciable.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4090, GTX 1650, iGPU e incluso en CPU pura. No requiere A100 ni H100.
- Cabe con holgura en memoria unificada de dispositivos embebidos (Raspberry Pi 4/5, Jetson Nano, moviles con 2 GB de RAM o mas).
- Despliegue recomendado: Transformers con PyTorch (probado con 4.57.1 y 5.17.0) y `trust_remote_code=True`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otras plataformas de servicio, dado que el modelo usa codigo personalizado y no publica pesos GGUF.
- Requisitos de software: Python 3.11 o superior, torch >= 2.6, transformers == 4.57.1, sentencepiece y safetensors.
- Rendimiento medido: 93,28 tokens/s en CPU a 4 hilos en el host de entrenamiento. No se han publicado mediciones de latencia ni throughput en GPU.
- Tamano del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | BPC validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| haru_3-student-pairshare-base (este) | Student experimental no seleccionado, non-IT | 13.688.705 | 1.024 | 0,945834 | MIT | Publico en HuggingFace |
| haru_3-student-base (Gated8-13m) | Student seleccionado, non-IT | 13.688.705 | 1.024 | 0,949001 | No disponible | Publico en HuggingFace |
| haru_3-student-chat (Gated8-13m IT) | Version IT del student seleccionado | 13.688.705 | 1.024 | No disponible | No disponible | Publico en HuggingFace |
| haru_3-teacher-base | Teacher congelado, non-IT | No disponible | No disponible | No disponible | No disponible | Publico en HuggingFace |
| haru_3-teacher-chat | Teacher congelado, IT | No disponible | No disponible | No disponible | No disponible | Publico en HuggingFace |

La diferencia arquitectonica clave entre las dos variantes student es que Gated8 usa FFN independientes de anchura 512, mientras que PairShare usa anchura 960 con FFN compartida por pares de capas y adaptadores de rango 48. No se dispone de comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones (non-IT): no obedece ordenes, no mantiene conversaciones y no debe usarse como asistente. Existe una version IT separada, `haru_3-student-chat`, pero corresponde al candidato Gated8; no se entreno ningun checkpoint IT de PairShare.
- Contexto muy corto: 1.024 tokens en total (entrada mas salida). El ejemplo del autor limita la entrada a 904 tokens para dejar 120 de generacion.
- Unico idioma soportado: coreano. No hay evidencia de generalizacion a otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo de 13,7 M de parametros entrenado solo para continuar cuentos, puede producir texto incoherente, repetitivo o factualmente falso fuera del dominio narrativo infantil.
- Modelo no seleccionado: el propio autor lo describe como "unselected experimental student" y lo conserva para experimentos de arquitectura. No es el checkpoint recomendado por el proyecto.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad en la informacion disponible. El corpus de entrenamiento no se describe mas alla de su naturaleza narrativa infantil.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo personalizado del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en produccion.
- Divergencia en el recuento de parametros: la model card indica 13.688.705 y los safetensors publicados suman 14.600.704. Conviene verificar que conteo corresponde a que componentes antes de citar la cifra.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No se documentan restricciones adicionales.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, sin senales de uso en produccion ni de validacion por terceros.
- Los resultados se basan en una unica semilla de entrenamiento, por lo que la comparacion con Gated8 no es concluyente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alice-noa-chan/haru_3-student-pairshare-base
- Resultados de evaluacion: https://huggingface.co/alice-noa-chan/haru_3-student-pairshare-base/blob/main/evaluation.json
- Registros de validacion: https://huggingface.co/alice-noa-chan/haru_3-student-pairshare-base/blob/main/validation.json
- Repositorio del student seleccionado (Gated8, non-IT): https://huggingface.co/alice-noa-chan/haru_3-student-base
- Rama original de los pesos PairShare8-r48: https://huggingface.co/alice-noa-chan/haru_3-student-base/tree/pairshare8-r48
- Version IT del student seleccionado: https://huggingface.co/alice-noa-chan/haru_3-student-chat
- Teacher base: https://huggingface.co/alice-noa-chan/haru_3-teacher-base
- Teacher IT: https://huggingface.co/alice-noa-chan/haru_3-teacher-chat
- Repositorio GitHub del proyecto (usado para el recurso grafico de la model card): https://github.com/alice-noa-chan/haru
- Perfil del autor en HuggingFace: https://huggingface.co/alice-noa-chan

Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a servicios de correo y cuentas de un proveedor de internet, y a un canal de YouTube). No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
