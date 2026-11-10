# nace-ai/Qwen3.8-27B-MLX-4bit-KQuant

## Resumen

Qwen3.8-27B-MLX-4bit-KQuant es una cuantizacion en 4 bits del modelo Qwen/Qwen3.8-27B, publicada por nace-ai y optimizada para ejecucion local en Apple Silicon mediante la libreria MLX. El modelo conserva la torre de vision del original (pipeline image-text-to-text) y emplea el formato KQuant, una variante de cuantizacion affine 4-bit que mantiene el mismo tamano que un empaquetado estandar (15,13 GB de pesos del modelo de lenguaje) pero con menor perdida de calidad respecto al modelo en bf16.

La relevancia de esta ficha reside en el metodo de cuantizacion: KQuant busca la escala por grupo de 64 pesos sobre 11 rangos de recorte y aplica una ponderacion derivada de 128 textos de calibracion, en lugar de calcular la escala solo a partir del minimo y el maximo. Segun la model card, esto reduce la divergencia KL frente al modelo bf16 de 0,054 a 0,035 y eleva la coincidencia en el siguiente token del 91,2 % al 92,9 %, sin aumentar el tamano del repositorio.

El modelo esta pensado para ejecutarse con Kapitsa, el motor de inferencia local de Nace.AI para Macs con Apple Silicon, o alternativamente con mlx-lm. El repositorio tiene 27.356.728.560 parametros totales y un tamano de 16,3 GB, e incluye la cabeza MTP (multi-token prediction) para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, segun tag `qwen3_5`); incluye torre de vision y cabeza MTP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX affine 4-bit, formato KQuant); pesos del modelo de lenguaje en 15,13 GB |
| Idiomas soportados | no disponible (la model card menciona evaluacion en ingles, codigo, matematicas, CJK, emoji y texto RTL; no se midieron devanagari ni tailandes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), mas `mtp.safetensors` y `mtplx_runtime.json` |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer con torre de vision (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. Esta version no reentrena el modelo: es una cuantizacion post-entrenamiento en 4 bits realizada con KQuant, que modifica unicamente el proceso de calculo de escalas de cuantizacion.

La innovacion tecnica de KQuant consiste en dos cambios respecto a un empaquetado affine 4-bit estandar: (1) la escala por grupo de 64 pesos se busca sobre 11 rangos de recorte en lugar de derivarse del minimo y el maximo, y (2) se aplica una ponderacion calculada a partir de 128 textos de calibracion. El resultado es un pack del mismo tamano y formato que el estandar pero mas proximo al modelo bf16. La cabeza MTP y el fichero `mtplx_runtime.json` proceden de Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed y se incluyen sin cambios; el tokenizador y la plantilla de chat son los de Qwen/Qwen3.8-27B. No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones (pipeline conversational).
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text): la torre de vision esta incluida en el repositorio, aunque no fue evaluada.
- Razonamiento matematico: la model card reporta resultados en GSM8K (0,953 en modo zero-shot, greedy y thinking desactivado).
- Generacion de codigo: se uso codigo de HumanEval en la evaluacion de divergencia KL.
- Decodificacion especulativa mediante cabeza MTP, con un drafter externo (incoai/Qwen3.8-27B-DFlash2) usado en las mediciones de velocidad.
- Soporte de modo thinking (la evaluacion de GSM8K se hizo con thinking desactivado, lo que implica que el modo existe).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles de forma explicita; el tokenizador se valido con ids identicos en ingles, codigo, matematicas, CJK, emoji y texto RTL.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el modelo se ejecuta con Kapitsa (`kapitsa serve --model 27b:kquant`) o con mlx-lm, lo que permite desplegar un modelo de 27B en un MacBook Pro sin conexion a servicios en la nube.
- Asistente conversacional de escritorio: la ventana de contexto y el pipeline conversational permiten mantener dialogos multi-turno; en un M5 Pro de 48 GB se midieron velocidades de escritura de 72,5 a 91 tok/s segun el modo de muestreo.
- Procesamiento de documentos con imagenes: al incluir la torre de vision, puede emplearse en tareas image-text-to-text como descripcion de capturas o extraccion de informacion de figuras, aunque el autor advierte que esta parte no fue evaluada.
- Razonamiento matematico y resolucion de problemas: el rendimiento en GSM8K (0,953) lo hace adecuado para tareas de aritmetica y problemas de varios pasos en entornos educativos o de validacion.
- Generacion y revision de codigo: la evaluacion incluyo codigo de HumanEval y el modelo puede integrarse en flujos de trabajo de desarrollo local para autocompletado o explicacion de codigo.
- Prototipado e investigacion de cuantizacion: el repositorio documenta el metodo KQuant y sus resultados (KL, coincidencia de siguiente token, GSM8K) con registros de ejecucion reproducibles, lo que lo convierte en material de referencia para estudiar tecnicas de cuantizacion 4-bit.
- Despliegue con decodificacion especulativa: la inclusion de la cabeza MTP y del drafter DFlash2 permite acelerar la generacion en produccion local, con lecturas de prompt de 4K a 735 tok/s en el hardware medido.

## Benchmarks y rendimiento

| Metrica | Pack estandar | KQuant (este repo) |
|---|---:|---:|
| Divergencia KL respecto a bf16 (menor es mejor) | 0,054 | 0,035 |
| Coincidencia con bf16 en el siguiente token | 91,2 % | 92,9 % |
| GSM8K (1.319 preguntas, zero-shot, greedy, thinking off) | 0,950 | 0,953 |

| Velocidad en MacBook Pro M5 Pro, 48 GB | Pack estandar (tok/s) | KQuant (tok/s) |
|---|---:|---:|
| Escritura, temperatura 0,6 | 80,0 | 72,5 |
| Escritura, greedy | 82,8 | 91,0 |
| Lectura de prompt de 4K | 719 | 735 |

Notas de medicion: la comparacion se hizo contra lmstudio-community/Qwen3.8-27B-MLX-4bit en el commit `6067b15`. La KL y la coincidencia se calcularon sobre 32.704 tokens de WikiText-2, chats de GSM8K y codigo de HumanEval frente a Qwen/Qwen3.8-27B en bf16. En GSM8K, 13 preguntas solo las acierta el pack estandar y 17 solo KQuant (McNemar z = 0,73, diferencia no significativa). Las velocidades se midieron con Kapitsa 0.2.32 y el drafter incoai/Qwen3.8-27B-DFlash2; las ejecuciones con muestreo varian ampliamente (KQuant: 76,7, 72,2 y 68,5 tok/s; estandar: 77,6, 78,5 y 83,8 tok/s). La calidad se midio solo en cargas de texto; la torre de vision no fue evaluada.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 16,3 GB y los pesos del modelo de lenguaje 15,13 GB; se midio en un MacBook Pro M5 Pro con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (serie M); las mediciones se realizaron en un M5 Pro. La evaluacion de calidad se hizo en una H100 de Modal con mlx sobre CUDA, pero el destino de despliegue es Apple Silicon.
- Cabe en GPU de consumo: si, en Macs con Apple Silicon y memoria unificada suficiente (el hardware medido tiene 48 GB). No se dispone de datos para GPUs NVIDIA de consumo.
- Opciones de despliegue: Kapitsa 0.2.34 o superior (`brew install nace-ai/tap/kapitsa`; `kapitsa serve --model 27b:kquant`) y mlx-lm (`mlx_lm.generate`).
- Latencia y throughput: en M5 Pro de 48 GB, 72,5 a 91,0 tok/s en escritura y 735 tok/s en lectura de un prompt de 4K con KQuant; el pack estandar obtiene 80,0 a 82,8 tok/s en escritura y 719 tok/s en lectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-MLX-4bit-KQuant | 27,36 B | no disponible | 4-bit KQuant (MLX) | apache-2.0 | KL 0,035; GSM8K 0,953 |
| lmstudio-community/Qwen3.8-27B-MLX-4bit | 27,36 B (base) | no disponible | 4-bit affine estandar (MLX) | apache-2.0 | KL 0,054; GSM8K 0,950 |
| Qwen/Qwen3.8-27B | 27,36 B | no disponible | bf16 | apache-2.0 | Modelo de referencia sin cuantizar |
| nace-ai/Qwen3.5-9B-MLX-4bit-KQuant | no disponible | no disponible | 4-bit KQuant (MLX) | apache-2.0 | Version de 9B del mismo formato, citada por el autor |

## Limitaciones y advertencias

- La torre de vision esta incluida pero no fue evaluada; su calidad en tareas image-text-to-text no esta verificada.
- La evaluacion de calidad se limita a cargas de texto; no hay datos de rendimiento en otros dominios.
- El tokenizador se valido con ids identicos en ingles, codigo, matematicas, CJK, emoji y texto RTL, pero no se midieron devanagari ni tailandes.
- Las mediciones de velocidad presentan alta varianza con muestreo (rango de 68,5 a 76,7 tok/s en KQuant); no deben interpretarse como una garantia de rendimiento.
- Dos de las tres ejecuciones de velocidad de KQuant se realizaron antes de incluir `mtplx_runtime.json` en el directorio del pack.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma del modelo base en la documentacion proporcionada.
- Licencia apache-2.0, la misma que el modelo base; no se indican restricciones adicionales para uso comercial.
- Requiere Kapitsa 0.2.34 o superior (o una compilacion de main hasta su publicacion) para el flujo de servidor; con versiones anteriores puede no funcionar correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-MLX-4bit-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pack estandar de comparacion: https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit
- Version de 9B KQuant: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Seccion KQuant en el README de Kapitsa: https://github.com/nace-ai/kapitsa#kquant
- Registro de resultados de benchmarks: https://github.com/nace-ai/kapitsa/blob/main/bench/results/2026-11-10-m5-pro-kquant-27b/README.md
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Cabeza MTP (MTPLX): https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed
- Sitio de Nace.AI: https://www.nace.ai/
