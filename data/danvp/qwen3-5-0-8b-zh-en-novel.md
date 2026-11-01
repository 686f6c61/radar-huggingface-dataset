# DanVP/Qwen3.5-0.8B-zh-en-novel

## Resumen

Qwen3.5-0.8B-zh-en-novel es un modelo de traduccion chino → ingles especializado en novelas web, desarrollado por DanVP a partir de [Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B). El autor aplico una epoca de fine-tuning supervisado sobre traducciones generadas por dos modelos mayores del equipo Index (Index-Translate-9B para lineas sueltas e Index-Translate-35B-A3B para ventanas de 3-5 lineas), destilando su calidad en un modelo de solo 853 millones de parametros.

Su valor diferencial es la especializacion en un nicho concreto: la traduccion de novelas web chinas linea a linea, respetando el numero de lineas de cada ventana, un glosario de terminos (`中文 → English`) y notas de genero para los personajes. El modelo se distribuye en safetensors (bf16) y en varios GGUF cuantizados para llama.cpp, e incluye un fichero `banned_token_ids.json` con 103.492 ids de tokens que deben prohibirse durante la decodificacion para eliminar caracteres Han sin traducir en la salida.

Es relevante para quien necesite traducir grandes volumenes de texto narrativo chino con hardware modesto: se ejecuta por completo en la CPU de un portatil o en una GPU de consumo, y el autor publica benchmarks detallados con juez LLM comparandolo con Index-Translate-2B, junto con un Space de demostracion que funciona en el navegador via WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (image-text-to-text; torre de vision heredada del modelo base, no evaluada) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso sugiere 4096 tokens en llama.cpp) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF) |
| Idiomas soportados | Chino (entrada), ingles (salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,75 GB) y GGUF (1,52 / 0,81 / 0,63 / 0,53 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal (image-text-to-text) de la familia Qwen. La torre de vision se conserva intacta respecto al modelo base, pero no ha sido evaluada ni modificada; el fine-tuning se centra en la capacidad de traduccion de texto. El modelo base incluye una cabecera MTP (multi-token prediction), que se excluye al convertir a GGUF (`--no-mtp`) pero se mantiene en el fichero `model-extra.safetensors` para uso con transformers/vLLM.

El entrenamiento consistio en una epoca de SFT (supervised fine-tuning) sobre traducciones chino → ingles generadas por Index-Translate-9B (lineas individuales) e Index-Translate-35B-A3B-preview-FP8 (ventanas de 3-5 lineas), ambos del equipo IndexTeam. Es decir, una destilacion de modelos especializados de traduccion hacia un modelo pequeño. El formato de prompt de entrenamiento sigue el esquema de Index: sin system prompt, con el bloque de thinking vacio del template de Qwen3.5 (`enable_thinking=False`), instrucciones de mantener el numero de lineas, narracion en pasado, glosario de terminos propios y notas de genero de personajes. La decodificacion recomendada es greedy con parada en `<|im_end|>` (id 248046) o `<|endoftext|>` (id 248044), maximo 512 tokens nuevos por linea o 3 × tokens de fuente + 64 por ventana.

## Capacidades

- Traduccion chino → ingles de texto narrativo (novelas web), linea a linea.
- Traduccion por ventanas de 2-5 lineas manteniendo exactamente el numero de lineas de origen (100 % en el test de capítulos).
- Seguimiento de glosarios de terminos y nombres propios en formato `中文 → English`.
- Seguimiento de notas de genero de personajes: 90,0 % / 87,0 % de acierto en el glossary probe para he/she, por encima de Index-Translate-2B.
- Uso narrativo correcto de tiempos verbales (pasado para narracion, natural en dialogos).
- Ejecucion local via llama.cpp y en el navegador via WebGPU (wllama).
- Multimodalidad de entrada heredada del modelo base (torre de vision), aunque no evaluada ni adaptada.

## Casos de uso

- **Traduccion masiva de novelas web chinas:** el modelo procesa capitulos divididos en ventanas de hasta 5 lineas (`prompts.split_windows`), manteniendo la estructura linea a linea, lo que facilita la postedicion y el alineado de subtitulos o paralelos.
- **Traduccion en hardware modesto o sin GPU:** con 0,63 GB en Q6_K y ~68 tokens/s en CPU (16 hilos, un stream), permite traducir en local sin tarjeta grafica dedicada.
- **Traduccion en el navegador:** el Space oficial ejecuta el GGUF Q6_K via WebGPU en la GPU del usuario, util para demos o herramientas web sin backend.
- **Pipelines de traduccion con glosario:** el formato de prompt acepta un glosario de terminos y notas de genero, integrable en flujos de traduccion de series literarias con terminologia consistente entre capitulos.
- **Servidor de traduccion de bajo coste:** con `llama-server -m ... -c 4096` se despliega una API local; en CPU alcanza 115 tokens/s agregados con 8 slots concurrentes (Q6_K).
- **Preprocesado de corpus para modelos mayores:** como modelo de primera pasada barato, genera borradores que un modelo mayor revisa solo en las lineas marcadas como problematicas.
- **Investigacion sobre destilacion de traduccion:** el autor publica prompts de entrenamiento, datos de evaluacion y metodologia de juez LLM, util como referencia reproducible.

## Benchmarks y rendimiento

Juez: Claude Haiku 5.5, a ciegas, todas las salidas en un lote barajado, 3 juicios por salida con etiqueta por mayoria; diferencias emparejadas con bootstrap de 10.000 y IC del 95 %. P-600: 600 lineas retenidas del pool de entrenamiento; G2-J300: 300 lineas del test GuoFeng contra referencia humana.

| Metrica | Este modelo (bf16, vLLM, ban) | Index-Translate-2B | Diferencia |
|---|---:|---:|---|
| P-600 bad | 9,67 % | 6,00 % | +3,67 [+1,00; +6,33] |
| G2-J300 wrong | 16,33 % | 11,33 % | +5,00 [+0,67; +9,33] |
| G2-J300 correct | 48,33 % | 56,33 % | −8,00 [−13,67; −2,33] |
| Ventanas con numero de lineas correcto | 100 % | 97,2 % | — |
| Lineas con caracteres Han (1.816 lineas) | 0 % | 0,72 % | — |
| Glossary probe: genero he / she | 90,0 % / 87,0 % | 85,0 % / 84,0 % | — |

Impacto del token ban en decodificacion: sin ban, el 3,5 % de las lineas conserva palabras en chino; con ban, 0 %, sin cambio de calidad juzgada (P-600 bad +0,5, IC [−0,7; +1,7]; G2 wrong −2,3, IC [−5,0; +0,3]).

Cuantizacion GGUF (CPU llama.cpp, greedy, ban; diferencia respecto al GGUF BF16):

| Fichero | P-600 bad | G2-J300 wrong | Lineas por ventana | CPU tok/s (1 stream / 8 slots) |
|---|---|---|---:|---:|
| BF16 | 11,33 % | 16,00 % | 100 % | 38,8 / 86 |
| Q8_0 | −0,33 [−1,83; +1,17] | +1,33 [+0,33; +2,67] | 100 % | 61,5 / 105 |
| Q6_K | +0,33 [−1,33; +2,17] | −0,67 [−3,00; +1,67] | 100 % | 68,3 / 115 |
| Q4_K_M | +1,17 [−0,83; +3,00] | +4,33 [+0,67; +7,67] | 100 % | 74,9 / 122 |

CPU de referencia: Intel Core Ultra 9 275HX, 16 hilos. Q6_K no muestra perdida medible; Q4_K_M pierde unos 4 puntos en la tasa de errores de G2. En GPU: ~13 tokens/s en la grafica integrada Intel Xe-LPG de un Core Ultra 9 275HX y ~70 tokens/s en una RTX 5070 Ti Laptop (Space con WebGPU, GGUF Q6_K).

## Requisitos de hardware

- VRAM / memoria para inferencia: 0,53 GB (Q4_K_M), 0,63 GB (Q6_K), 0,81 GB (Q8_0), 1,52 GB (BF16 GGUF) o 1,75 GB (safetensors bf16), mas el contexto (el ejemplo usa 4096 tokens).
- Cabe con holgura en cualquier GPU de consumo: funciona incluso en graficas integradas (13 tokens/s en Intel Xe-LPG) y alcanza ~70 tokens/s en una RTX 5070 Ti Laptop.
- En CPU pura (Core Ultra 9 275HX, 16 hilos): 38,8-74,9 tokens/s en solitario y 86-122 tokens/s con 8 slots concurrentes segun cuantizacion.
- Despliegue: llama.cpp (`llama-server`), transformers y vLLM (safetensors bf16), wllama en navegador (WebGPU), y el Space de demostracion de HuggingFace.
- Requisito critico: aplicar el ban de los 103.492 token ids de `banned_token_ids.json` durante la decodificacion; sin el, un 3,5 % de las lineas sale con fragmentos en chino.
- Usar los prompts exactos de `prompts.py` (`build_prompt`, `render`, `split_windows`) y decodificacion greedy.

## Comparativa con modelos similares

| | Qwen3.5-0.8B-zh-en-novel | Index-Translate-2B | Index-Translate-9B |
|---|---|---|---|
| Parametros | 0,85 B | 2 B | 9 B |
| Tarea | Traduccion zh→en, novelas web | Traduccion zh→en | Traduccion zh→en |
| Calidad juzgada (G2-J300 wrong) | 16,33 % | 11,33 % | no disponible |
| Lineas con caracteres Han | 0 % (con ban) | 0,72 % | no disponible |
| Genero (he/she) | 90,0 % / 87,0 % | 85,0 % / 84,0 % | no disponible |
| Contexto | no disponible (4096 en ejemplo) | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |

El modelo queda por detras de Index-Translate-2B en calidad de traduccion (3-4 puntos mas de lineas "bad" y 5 puntos mas de "wrong"), pero lo supera en conservacion del numero de lineas y en seguimiento de notas de genero, con menos de la mitad de parametros. Es la opcion cuando el tamano por debajo de 2B pesa mas que los ultimos puntos de calidad.

## Limitaciones y advertencias

- Calidad inferior a Index-Translate-2B: los errores residuales se concentran en la comprension del chino (modismos y jerga, preguntas retoricas leidas como preguntas reales, ambiguedades de quien hace que a quien, caracteres raros y frases largas).
- Obligatorio usar el token ban (`banned_token_ids.json`); sin el, la salida contiene caracteres chinos sin traducir en el 3,5 % de las lineas.
- Q4_K_M degrada la calidad de forma medible (+4,33 puntos en G2-J300 wrong); se recomienda Q6_K o superior.
- La torre de vision heredada del modelo base no ha sido evaluada ni adaptada: no debe asumirse capacidad visual funcional.
- Todas las metricas provienen de un juez LLM (Claude Haiku 5.5), no de revision humana; los numeros absolutos pueden no reflejar fielmente la calidad percibida.
- Es un modelo de tarea unica: solo traduce chino → ingles en el formato de prompt entrenado; no es un chatbot de proposito general.
- La longitud de contexto exacta del modelo base no esta documentada en la ficha; el ejemplo de despliegue usa 4096 tokens.
- Apache 2.0 no impone restricciones de uso comercial, pero las traducciones de novelas web pueden estar sujetas a derechos de autor de las obras originales.

## Enlaces

- Modelo: https://huggingface.co/DanVP/Qwen3.5-0.8B-zh-en-novel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo (Space, WebGPU): https://huggingface.co/spaces/DanVP/Qwen3.5-0.8B-zh-en-novel-demo
- Modelo profesor Index-Translate-9B: https://huggingface.co/IndexTeam/Index-Translate-9B
- Modelo profesor Index-Translate-35B-A3B: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-FP8
- Modelo de referencia Index-Translate-2B: https://huggingface.co/IndexTeam/Index-Translate-2B
- wllama (llama.cpp en navegador): https://github.com/ngxson/wllama
