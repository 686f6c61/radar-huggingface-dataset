# felkhayer/Ornith-1.5-35B-A3B-DFlash2-Splash

## Resumen

Ornith-1.5-35B-A3B-DFlash2-Splash no es un modelo autonomo, sino un **draft de decodificacion especulativa** (DFlash2) publicado por el usuario felkhayer para servir a `ornith-ai/Ornith-1.5-35B-A3B` con el motor Splash sobre Mac con Apple Silicon. El draft propone tokens que el modelo objetivo verifica uno a uno, de modo que la salida final es siempre la de Ornith; el unico efecto del draft es reducir el numero de pasos de decodificacion. Incluye soporte de vision porque el target se sirve desde el GGUF oficial de Ornith, que arrastra el proyector multimodal.

El artefacto pesa 1,05 GB y contiene 526.251.520 parametros (unos 526 M) en safetensors. Los pesos se copian sin modificar de `jzinno/Ornith-1.5-35B-A3B-DFlash2`, un draft entrenado sobre salidas de Ornith e inicializado desde `z-lab/Qwen3.5-35B-A3B-DFlash`; el unico cambio respecto al original es el `config.json`, ajustado a los valores que exigen los kernels de Splash (`block_size` 8 en lugar de 16, `sliding_window` 2048 en lugar de 4096).

Su relevancia es practica y acotada: permite acelerar la inferencia local de un modelo MoE de 35B en un Mac de 36-48 GB de memoria unificada, con API compatible con OpenAI y Anthropic, sin depender de GPU NVIDIA. Es un componente de infraestructura, no un modelo para evaluar por sus capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft de decodificacion especulativa DFlash2, inicializado desde `z-lab/Qwen3.5-35B-A3B-DFlash`; etiquetado `qwen3` en HuggingFace |
| Parametros totales | 526.251.520 (~526 M) segun safetensors |
| Parametros activos | No aplica al draft (denso, 526 M). El modelo objetivo Ornith-1.5-35B-A3B es MoE con 35B totales y 3B activos segun su denominacion |
| Longitud de contexto | Hasta 128K en Splash (`--max-context 128K`); ventana deslizante del draft configurada a 2048 tokens (4096 en la configuracion de entrenamiento) |
| Tipos de cuantizacion | El draft se distribuye en safetensors sin cuantizacion declarada; el target admite GGUF Q4_K_M, Q5_K_M, IQ4_XS y MLX 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` + `config.upstream.json`) |

## Arquitectura y entrenamiento

El repositorio contiene unicamente el modelo draft: un transformer de ~526 M de parametros derivado de la familia Qwen3 y entrenado con el objetivo DFlash2 de decodificacion especulativa. El entrenamiento se hizo sobre salidas generadas por Ornith-1.5-35B-A3B, con inicializacion desde el draft `z-lab/Qwen3.5-35B-A3B-DFlash`. El autor no documenta numero de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO; solo indica el origen de los pesos y que se reutilizan sin modificacion (sha256 `a42e77e19c74a31e990aac9b62e9ac82a01268a202ade1751baefc6574b082aa`).

La innovacion tecnica es el propio esquema de decodificacion especulativa: el draft propone bloques de tokens y el modelo objetivo los valida, lo que puede aumentar el throughput sin alterar la distribucion de salida. Para encajar en Splash, este repositorio modifica dos parametros de configuracion que afectan al rendimiento pero no a la correccion: `block_size` (16 a 8) y `sliding_window` (4096 a 2048). Tambien se indica que, al servir el target desde GGUF, Splash reconstruye el tokenizer a partir de las metas (perfil `qwen35`), lo que puede cambiar ligeramente el troceado en caracteres combinantes.

## Capacidades

- Aceleracion de inferencia: propone tokens para que Ornith-1.5-35B-A3B los verifique, reduciendo pasos de decodificacion sobre Mac Apple Silicon.
- Soporte multimodal en el conjunto servido: el target se carga con el proyector de vision `mmproj-Ornith-1.5-35B-BF16.gguf` del repo oficial, habilitando entrada imagen + texto.
- API compatible con OpenAI (`/v1/chat/completions`, `/v1/responses`) y con Anthropic (`/v1/messages`) a traves de Splash.
- Interfaz web de chat incorporada en el servidor local (desactivable con `--no-webui`).
- Modo de razonamiento del target: activado por defecto, desactivable con `{"reasoning_effort": "none"}` o `{"chat_template_kwargs": {"enable_thinking": false}}`; no existen niveles intermedios reales (low, medium y xhigh producen el mismo resultado).
- Seleccion de variantes del target desde el mismo comando: Q4_K_M, Q5_K_M, IQ4_XS y MLX 4-bit (esta ultima solo texto con `--language-only`).

## Casos de uso

- Asistente de codigo local en Mac: servir Ornith Q4_K_M con este draft para reducir la latencia de generacion en un equipo de 48 GB de memoria unificada, manteniendo los pesos y las peticiones en local.
- Chat multimodal en estacion de trabajo: enviar imagenes por `image_url` en `/v1/chat/completions` y obtener descripciones o analisis combinando el proyector de vision del GGUF oficial con la verificacion del target.
- Sustitucion de APIs en la nube durante prototipado: el servidor expone endpoints compatibles con OpenAI y Anthropic, de modo que un cliente existente solo necesita cambiar la URL base a `http://127.0.0.1:8000`.
- Evaluacion de decodificacion especulativa: comparar el ratio de aceptacion de este draft frente al draft Qwen3.6 que Splash elige por defecto, manteniendo el mismo target y la misma configuracion de muestreo (`temperature=0.6`, `top_p=0.95`, `top_k=20`).
- Procesamiento por lotes de documentos con contexto largo: usar `--max-context 128K` para tareas de resumen o extraccion sobre textos extensos, aceptando mayor uso de memoria (`--max-memory` ajustable).
- Entornos con requisitos de privacidad: despliegue en un Mac aislado de la red con `--api-key` o `SPLASH_API_KEY` para controlar el acceso a la API local.
- Laboratorio de agentes y razonamiento multi-paso: activar el modo thinking del target y limitar la longitud de reflexion unicamente con `max_tokens`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se proporciona una cifra concreta de ratio de aceptacion del draft: la model card advierte que, al ejecutarse con bloques y ventana menores que los del entrenamiento, el ratio puede ser inferior al publicado por el autor del draft original.

## Requisitos de hardware

- Plataforma obligatoria: Mac Apple M3 o posterior con macOS 26.4 o superior; el motor Splash no se distribuye para otras plataformas en esta ficha.
- Memoria unificada: 36 GB minimo, 48 GB o mas recomendado para el target Q4_K_M con vision.
- Espacio en disco: unos 23 GB en total (GGUF Q4_K_M de 21,7 GB + proyector de vision de 0,9 GB + draft de 1,05 GB).
- Alternativas de menor huella: target IQ4_XS de 19,3 GB o Q5_K_M de 25,3 GB; MLX 4-bit de 19,5 GB solo para texto.
- Despliegue: `brew install incoai/tap/splash` (o `brew upgrade splash`), version minima 1.1.0, y arranque con `splash serve --model ... --draft-model ...`.
- VRAM dedicada: no aplica, el motor usa memoria unificada; no se documenta soporte CUDA.
- Latencia y throughput: no disponibles. El beneficioesperado proviene del esquema especulativo, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | block_size | sliding_window | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (DFlash2-Splash) | 526 M | 8 | 2048 | Apache-2.0 | HuggingFace, requiere Splash >= 1.1.0 |
| `jzinno/Ornith-1.5-35B-A3B-DFlash2` | 526 M (mismos pesos) | 16 | 4096 | Apache-2.0 | HuggingFace |
| `z-lab/Qwen3.5-35B-A3B-DFlash` | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Draft Qwen3.6 por defecto de Splash | No disponible | No disponible | No disponible | No disponible | Incluido en Splash |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el target Ornith-1.5-35B-A3B cargado en Splash no produce salidas utiles.
- Dependencia dura de plataforma: solo Apple Silicon M3 o superior con macOS 26.4 o posterior y Splash 1.1.0 o superior.
- El recorte de `block_size` y `sliding_window` respecto al entrenamiento puede degradar el ratio de aceptacion, es decir, reducir la ganancia de velocidad; la correccion de la salida no se ve afectada porque el target verifica cada token.
- La reconstruccion del tokenizer desde las metas del GGUF (perfil `qwen35`) puede trocear de forma distinta en caracteres combinantes.
- El draft esta especializado en salidas de Ornith; no hay garantia de que funcione como draft de otros modelos objetivo.
- Idiomas soportados no documentados; las capacidades linguisticas dependen integramente del target.
- Sin datos de benchmarks, de ratio de aceptacion ni de rendimiento medido; no es posible estimar la mejora de throughput sin probarlo.
- La licencia del draft es Apache-2.0, pero la del modelo objetivo Ornith no se detalla en la informacion disponible y debe verificarse antes de un uso comercial.
- Repositorio sin descargas ni likes y sin afiliacion a Ornith AI, Inco AI ni al autor del draft original; el mantenimiento no esta garantizado.

## Enlaces

- HuggingFace del draft: https://huggingface.co/felkhayer/Ornith-1.5-35B-A3B-DFlash2-Splash
- Draft original: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficial del objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Variante MLX 4-bit: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- GGUF de terceros (IQ4_XS): https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Origen de la inicializacion: https://huggingface.co/z-lab/Qwen3.5-35B-A3B-DFlash
- Motor Splash: https://github.com/incoai/splash
