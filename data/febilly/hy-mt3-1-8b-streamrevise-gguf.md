# febilly/Hy-MT3-1.8B-StreamRevise-GGUF

## Resumen

Hy-MT3-1.8B-StreamRevise-GGUF es una cuantización en formato GGUF de un ajuste fino (LoRA fusionado) sobre el modelo de traducción `tencent/Hy-MT3-1.8B`. Lo desarrolla el usuario `febilly` y está orientado específicamente a la traducción de subtítulos en directo, donde el reconocimiento automático de voz (ASR) emite hipótesis parciales que van cambiando con el tiempo. El modelo recibe la hipótesis actual, la traducción previa de la misma frase y un contexto reciente, y devuelve una traducción incremental que conserva los prefijos todavía válidos y no adelanta palabras que aún no se han pronunciado.

La relevancia radica en que resuelve un problema concreto de los pipelines de traducción simultánea: la inestabilidad del texto cuando la fuente cambia. En lugar de retraducir cada actualización desde cero (lo que provoca parpadeo en los subtítulos), el modelo revisa solo lo necesario y mantiene la coherencia. Se distribuye en cuantización Q4_K_M de 1,13 GB, lo que permite ejecutarlo en CPU o en GPU de consumo mediante `llama.cpp`.

Con 1.791.080.448 parámetros, contexto operativo recomendado de 2048 tokens y licencia Apache 2.0, es una pieza ligera y desplegable para sistemas de subtitulado en tiempo real en chino, inglés y japonés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base tencent/Hy-MT3-1.8B) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configuración de ejecución recomendada con `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (con tensor `token_embd.weight` en Q6_K); matriz de importancia incluida para recuantizar |
| Idiomas soportados | chino (zh), inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador LoRA original está en el repo base |

## Arquitectura y entrenamiento

El modelo parte de `tencent/Hy-MT3-1.8B`, un transformer decoder-only de 1.800 millones de parámetros especializado en traducción. Sobre él se aplicó un ajuste fino con LoRA (repo `febilly/Hy-MT3-1.8B-StreamRevise-LoRA`) orientado a la tarea de revisión de flujo: el modelo aprende a comparar la traducción previa con la nueva hipótesis de origen y a decidir qué prefijo conservar, qué extender y qué corregir. Durante el entrenamiento se mantuvo un 15 % de anclas de traducción de frase completa para no degradar la capacidad de traducción estándar.

La innovación principal es el control explícito del estado de la frase mediante el token `进行中` (en curso) o `本句结束` (frase finalizada). En estado parcial el modelo no debe emitir puntuación de cierre ni adivinar palabras futuras; en estado final debe completar la frase. El prompt usa la estructura nativa `【背景信息】` / `【待翻译文本】` con nombres de idioma en chino y contexto de solo origen (hasta 5 frases recientes). La cuantización se calibró con una matriz de importancia (imatrix) sobre prompts de traducción en flujo retenidos, y se mantuvo el embedding atado en Q6_K para preservar la fidelidad de la cabeza de salida.

## Capacidades

- Traducción incremental de subtítulos con hipótesis ASR parciales y finales.
- Conservación de prefijos correctos y revisión selectiva cuando el ASR corrige palabras previas.
- Control de puntuación: sin cierre prematuro en actualizaciones parciales, cierre al finalizar la frase.
- Traducción de frase completa estándar (modo independiente heredado del modelo base).
- Traducción en seis direcciones entre chino, inglés y japonés.
- Gestión de contexto de origen reciente (ventana de hasta 5 frases).
- Reutilización de caché KV (`cache_prompt`) para reducir latencia entre actualizaciones.
- Compatibilidad con endpoints `/completion` y `/v1/chat/completions` de `llama-server`.
- Decodificación greedy determinista recomendada para evitar parpadeo en subtítulos.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Subtitulado en directo de retransmisiones: el modelo recibe cada actualización del ASR y devuelve un subtítulo que se estabiliza progresivamente, evitando el parpadeo típico de la retraducción completa.
- Traducción simultánea en videoconferencias: con contexto de las últimas frases y estado parcial/final, mantiene coherencia entre intervenciones y corrige cuando el reconocedor ajusta palabras.
- Accesibilidad para contenido audiovisual: generación de subtítulos en chino, inglés o japonés sobre emisiones en vivo con latencia baja gracias al modelo de 1,8 B y la cuantización Q4_K_M.
- Postproducción de transcripciones: uso en modo frase completa para traducir transcripciones ya finalizadas, aprovechando las anclas de traducción estándar conservadas en el entrenamiento.
- Despliegue en entornos sin GPU: al caber en 1,13 GB y ejecutarse con `-ngl 0`, puede correr en servidores CPU modestos para servicios de subtitulado internos.
- Integración en pipelines de streaming: el renderizador de prompt y el control de estado permiten encapsularlo como servicio que consume hipótesis ASR y emite revisiones incrementales.
- Traducción de documentación técnica bilingüe zh/en/ja: el modo de frase completa cubre traducción convencional dentro de esos tres idiomas.

## Benchmarks y rendimiento

Evaluación con decodificación greedy (`temperature=0`, `top_k=1`) sobre esta build Q4_K_M concreta.

FLORES-200 devtest (traducción de frase completa nativa), 1.012 ejemplos por dirección, chrF de corpus con `word_order=0`:

| Direccion | chrF |
|---|---:|
| Japonés → Chino | 26,408 |
| Chino → Japonés | 32,231 |
| Inglés → Chino | 36,794 |
| Chino → Inglés | 57,770 |
| Japonés → Inglés | 55,341 |
| Inglés → Japonés | 39,364 |
| Media 6 direcciones | 41,318 |
| Corpus combinado | 46,194 |

Benchmark de flujo en bucle cerrado (254 cadenas / 1.041 pasos):

| Metrica | Valor |
|---|---:|
| Violación de puntuación final en estado parcial | 0,25 % |
| Tasa de completado de puntuación en estado final | 90,55 % |
| Retención de prefijo parcial a parcial (LCP) | 0,813 |
| Retención de prefijo final (LCP) | 0,916 |
| Tasa de salida en idioma incorrecto | 0,00 % |

No se dispone del resto de resultados de la comparación con el adaptador BF16 en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2-1,5 GB para el modelo Q4_K_M más la caché KV con contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas y holgadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 2 GB o más.
- Ejecución en CPU: viable con `-ngl 0`; el tamaño de 1,13 GB lo hace apto para servidores sin acelerador.
- Opciones de despliegue: `llama.cpp` (`llama-server`), con endpoints `/completion` y `/v1/chat/completions`; el adaptador original puede ejecutarse con `transformers` + `peft`.
- Latencia y throughput: no se publican cifras concretas; el uso de `cache_prompt: true` reutiliza aproximadamente el 60 % de la caché KV entre actualizaciones consecutivas de la misma frase, lo que reduce el coste por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-StreamRevise-GGUF | 1,79 B | 2048 | zh, en, ja | Apache 2.0 | GGUF Q4_K_M |
| tencent/Hy-MT3-1.8B (base) | 1,79 B | no disponible | zh, en, ja | no disponible | safetensors |
| febilly/Hy-MT3-1.8B-StreamRevise-LoRA | 1,79 B | no disponible | zh, en, ja | Apache 2.0 | LoRA (PEFT) |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Cobertura lingüística limitada a chino, inglés y japonés; no se documentan otros idiomas.
- El modelo es sin estado: la cadena de revisión y la ventana de historial (máximo 5 frases) las gestiona el llamador.
- Requiere el formato de prompt exacto; un prompt fuera de formato no activa el control de puntuación parcial/final ni la conservación de prefijos.
- La decodificación con muestreo introduce variaciones aleatorias entre actualizaciones casi idénticas y provoca parpadeo; se recomienda greedy.
- Los resultados FLORES en direcciones chino↔japonés incluyen divergencia de referencia por el pivote en inglés, por lo que los valores absolutos son bajos.
- Riesgo de alucinación inherente a modelos generativos, especialmente en hipótesis ASR muy ruidosas o ambiguas.
- Algunas builds de `llama.cpp` pueden registrar un aviso benigno de tokenizer (`special_eos_id is not in special_eog_ids`); conviene verificar que las respuestas terminan antes de `n_predict`.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `tencent/Hy-MT3-1.8B`.

## Enlaces

- Modelo GGUF: https://huggingface.co/febilly/Hy-MT3-1.8B-StreamRevise-GGUF
- Adaptador LoRA y detalles de entrenamiento: https://huggingface.co/febilly/Hy-MT3-1.8B-StreamRevise-LoRA
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- README en chino: https://huggingface.co/febilly/Hy-MT3-1.8B-StreamRevise-GGUF/blob/main/README_CN.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
