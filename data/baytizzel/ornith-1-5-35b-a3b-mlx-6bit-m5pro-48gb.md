# baytizzel/Ornith-1.5-35B-A3B-MLX-6bit-M5Pro-48gb

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta ficha concreta no contiene los pesos del modelo, sino una receta de despliegue reproducible publicada por el usuario baytizzel para servir el checkpoint oficial cuantizado a 6 bits en formato MLX sobre un Apple Silicon con 48 GB de memoria unificada y una ventana de contexto de 128K tokens.

La relevancia de esta publicacion es practica: documenta un conjunto de optimizaciones sobre un fork de mlx-vlm (betizzel/mlx-vlm, rama `m5pro-qwen27`) que duplican la velocidad de decodificacion con contexto largo (de 21,5 a 43,4 tok/s con 124,8K tokens de contexto) y reducen el tiempo de prefill en frio de 191 s a 132 s para un prompt de 124,8K. Incluye scripts de descarga con verificacion sha256, un lockfile con las 78 dependencias exactas y un informe de resultados con los brazos aceptados y rechazados.

El repositorio no redistribuye los pesos: `scripts/fetch-upstream.sh` descarga los 28,2 GB del checkpoint original de ornith-ai en la revision `585b7867`. La licencia declarada es MIT, aunque se aplica a la receta; la del checkpoint subyacente debe consultarse en el repositorio de ornith-ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 35B |
| Parametros activos | ~3B por token |
| Longitud de contexto | 131.072 tokens (ventana total, incluye salida); gestion de contexto con resumen a partir de 98.304 tokens |
| Tipos de cuantizacion | 6 bits (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | MIT (receta); licencia del checkpoint original: no disponible en esta ficha |
| Formato de pesos | MLX (28,2 GB); descarga desde el repositorio de ornith-ai en la revision `585b7867` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 35B parametros totales y aproximadamente 3B activos por token, lo que situa su coste computacional por token en el orden de un modelo denso de 3B. La receta publicada no documenta la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card de ornith-ai, que no forma parte de la informacion disponible aqui.

La innovacion tecnica de esta receta reside en el motor de inferencia, no en el modelo. El fork de mlx-vlm introduce dos kernels Metal opcionales: `MLX_VLM_QUANT_DECODE_KERNEL=1`, que evita releer las claves y valores empaquetados a 6 bits una vez por cada cabeza de consulta del grupo (16 cabezas de consulta sobre 2 de KV, es decir, 8 lecturas redundantes), con un hilo por clave que desquantiza y puntua todas las cabezas y un kernel de valores con split-K, con puntuaciones en fp32 y activacion a partir de 1.024 claves; y `MLX_VLM_QUANT_PREFILL_SDPA=1`, que evita materializar puntuaciones bf16 de tamano cabezas × chunk × claves (2,1 GB por capa con 512 × 125K) desquantizando K/V de la capa y llamando a `mx.fast.scaled_dot_product_attention`, lo que permite chunks de prefill de 2.048 tokens a 124,8K de contexto. Ademas, los pesos se fijan en memoria cableada desde el arranque (`iogpu.wired_limit_mb=43008`), evitando la compresion de macOS y el crecimiento del swap.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activado por defecto, desactivable con `"enable_thinking": false`; el presupuesto de salida por defecto del servidor es de 8.192 tokens, pensamiento incluido.
- Conversacion multi-turno con contexto largo: ventana de 131.072 tokens y continuacion literal de la conversacion por encima de 98K tokens si se envia `"context_management": []`.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) en `127.0.0.1:8081`.
- Reutilizacion de prefijo en RAM: el siguiente turno de la misma conversacion se salta el prefill (aproximadamente un segundo).
- Soporte de muestreo configurable: temperatura 0,6, top_p 0,95, top_k 20 en la configuracion medida.
- Tool calling, function calling, capacidades de agente y cobertura multilingue: no disponibles en la informacion proporcionada.
- Vision: el repositorio usa mlx-vlm y lleva la etiqueta `mlx-vlm`, pero la receta no documenta ninguna capacidad de vision del checkpoint.

## Casos de uso

- Asistente de codigo local en un MacBook Pro: el modelo cabe residente en 28,2 GB y ofrece 43,4 tok/s con contexto casi completo, lo que permite mantener conversaciones largas sobre un repositorio sin salir del portatil ni enviar codigo a la nube.
- Analisis de documentos extensos: con 131.072 tokens de ventana se pueden procesar informes, contratos o transcripciones completas; enviando `"context_management": []` se evita que el servidor sustituya los turnos antiguos por un resumen a partir de 98.304 tokens.
- Servicio de inferencia privado en oficina: la receta levanta una API compatible con OpenAI en localhost, integrable con clientes existentes sin cambios de codigo mas alla del nombre del modelo (ruta absoluta del checkpoint).
- Prototipado de agentes con contexto acumulativo: la reutilizacion de prefijo en RAM reduce a aproximadamente un segundo el coste de prefill en turnos sucesivos de una misma conversacion, lo que abarata los bucles multi-turno.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye `results/RESULTS.md` con todos los brazos medidos, incluidos los rechazados, util para reproducir y contrastar optimizaciones de kernels sobre cache KV cuantizada.
- Despliegue reproducible con auditoria de integridad: `fetch-upstream.sh` descarga el checkpoint a una revision fijada y verifica sha256, y `requirements.lock.txt` fija las 78 dependencias (MLX 0.32.4, transformers 5.22.1), lo que facilita reconstruir el entorno exacto en otra maquina.
- Generacion de texto con control de coste de memoria: al fijar los pesos en memoria cableada desde el arranque, el sistema mantiene presion de memoria normal y sin crecimiento de swap, adecuado para equipos de sobremesa que deben seguir operativos.

## Benchmarks y rendimiento

Las unicas mediciones publicadas corresponden a la receta de despliegue en un MacBook Pro M5 Pro con 48 GB, no a benchmarks academicos del modelo.

| Medicion | Antes (stock) | Despues (receta) | Mejora |
|---|---|---|---|
| Decodificacion con 124,8K tokens de contexto | 21,5 tok/s | 43,4 tok/s | 2,0× |
| Decodificacion con 43K tokens de contexto | 42,7 tok/s | 60,5 tok/s | +42% |
| Prefill a 2,8K tokens | no disponible | no disponible | +12% |
| Prefill a 10,8K tokens | no disponible | no disponible | +29% |
| Prefill a 43K tokens | no disponible | no disponible | +25% |
| Prompt en frio de 124,8K | 191 s | 132 s | -31% |
| Tiempo hasta el primer token tras inactividad | no disponible | ~124 ms | no disponible |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: Apple Silicon con 48 GB o mas de memoria unificada; con menos memoria hay que reducir la cache KV o acortar la ventana. Los pesos ocupan 28,2 GB y permanecen residentes.
- Limite de GPU cableada: `sudo sysctl iogpu.wired_limit_mb=43008` (42 GiB), ajuste que no sobrevive a un reinicio; el servidor fija despues los limites de memoria de MLX y cableada al working set recomendado por la GPU.
- Disco: aproximadamente 31 GB libres (28,2 GB de pesos y unos 2 GB de entorno), ademas de git y Python 3.11 o superior.
- GPU: probado en M5 Pro con 48 GB; no hay datos de otros chips Apple Silicon en la informacion disponible. No aplica a GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX.
- Despliegue: fork de mlx-vlm en el commit `28c8d591` de la rama `m5pro-qwen27`, instalado por `build-engine.sh` en un venv con las versiones exactas de `config/requirements.lock.txt`; servidor con API compatible con OpenAI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 43,4 tok/s de decodificacion con 124,8K de contexto, 60,5 tok/s con 43K, aproximadamente 124 ms hasta el primer token tras inactividad y unos dos minutos para un prompt en frio de 128K. El servidor carga el modelo en la primera peticion, por lo que la primera respuesta incluye el tiempo de carga.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base frente a alternativas, ni de otras recetas MLX comparables, por lo que no es posible establecer una comparacion con cifras verificables.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: solo la receta. La descarga depende de que el repositorio de ornith-ai y la revision `585b7867` sigan disponibles.
- La licencia MIT declarada cubre la receta; la licencia del checkpoint original no se detalla en esta informacion y debe verificarse antes de un uso comercial.
- Limitacion dura de plataforma: requiere Apple Silicon con 48 GB o mas; el ajuste `iogpu.wired_limit_mb` no persiste tras reiniciar y debe reaplicarse.
- El servidor resume la conversacion al alcanzar 98.304 tokens (3/4 de la ventana) salvo que se envie `"context_management": []`; omitir este campo altera silenciosamente el contenido servido en conversaciones largas.
- El modo thinking esta activo por defecto y consume parte del presupuesto de salida de 8.192 tokens; hay que desactivarlo explicitamente o ampliar `max_tokens` para respuestas largas.
- La reutilizacion de prefijo es solo en RAM: una conversacion que se ramifica o un documento nuevo obliga a releer el prompt, con un coste de hasta dos minutos en frio a 128K.
- La ventana de 131.072 tokens incluye la salida: prompt mas `max_tokens` deben caber en ese limite.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni calidad del modelo base; no deben asumirse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la receta carece de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio de la receta en Hugging Face: https://huggingface.co/baytizzel/Ornith-1.5-35B-A3B-MLX-6bit-M5Pro-48gb
- Fork del motor de inferencia: https://github.com/betizzel/mlx-vlm (rama `m5pro-qwen27`, commit `28c8d591`)
- Repositorio base del motor: https://github.com/Neywa-Labs/mlx-vlm
- Resultados detallados: `results/RESULTS.md` dentro del repositorio de la receta
- Modelo original de ornith-ai: no disponible en la informacion proporcionada
