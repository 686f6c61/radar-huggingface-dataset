# colia-labs/Sibundoy-Translate-1.7B

## Resumen

Sibundoy-Translate-1.7B es un modelo de traduccion ingles-castellano desarrollado por ColIA, un laboratorio colombiano. Se trata de un ajuste fino (finetune) del modelo base LiquidAI/LFM3-1.7B-Base, con 1.728.801.536 parametros totales y una arquitectura LFM3 heredada de Liquid AI. Su proposito es la traduccion directa de un parrafo por peticion, preservando el formato HTML y Markdown del texto original, con un enfoque en castellano neutro (evitando formas regionales de un solo pais y con solo un 0,4% de formas propias de Espana).

El modelo resuelve un problema concreto: la traduccion local en equipos de gama baja. Con cuantizacion GGUF Q4_K_M ocupa aproximadamente 1,3 GB de memoria, lo que permite ejecutarlo tanto en GPU consumer (RTX 3050 de 6 GB) como en CPU de portatil. Traduce un articulo de 923 palabras en 15,5 segundos en una RTX 3050 y en 57 segundos en CPU, procesando parrafo a parrafo.

Es relevante porque demuestra que un modelo de 1,7B puede superar a su modelo base en todas las pruebas de traduccion evaluadas (hasta +5,8 puntos COMET en medicina) y mantener el formato HTML/Markdown en 210 de 213 textos, el mejor resultado entre los modelos comparados. Sin embargo, no supera a modelos de 2 a 4B parametros en calidad general de traduccion, quedando entre 0,1 y 2,5 puntos COMET por detras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (hereda la de LiquidAI/LFM3-1.7B-Base) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (mencionado); otros no disponibles |
| Idiomas soportados | en (ingles), es (castellano) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo base LiquidAI/LFM3-1.7B-Base, que emplea la arquitectura LFM3 de Liquid AI. El codigo de la arquitectura se distribuye junto con el modelo y se carga mediante `trust_remote_code=True`, sin modificaciones respecto a la version original de Liquid AI. No se especifica en la informacion disponible si la arquitectura es transformer denso, MoE, SSM o hibrida; solo se indica la etiqueta `lfm3`.

Respecto al entrenamiento, la model card menciona que el autor publica los scripts de datos, entrenamiento y evaluacion en el repositorio de GitHub `colia-labs/sibundoy-translate`, pero no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Se indica que los textos cientificos y medicos son comunes en sus datos de entrenamiento, aunque el modelo no logra ventaja en ese dominio frente a los competidores. La innovacion tecnica destacable es la preservacion de formato HTML y Markdown (210 de 213 textos conservaron el formato) y el sesgo hacia castellano neutro.

## Capacidades

- Traduccion directa de ingles a castellano, un parrafo por peticion.
- Preservacion de etiquetas HTML y formato Markdown en el texto traducido.
- Generacion de texto con plantilla de chat (`apply_chat_template`).
- Instruccion fija de traduccion con salida de solo traduccion.
- Castellano neutro: 0,4% de formas propias de Espana, sin palabras regionales de un solo pais.
- Inferencia local en CPU y GPU.
- Compatible con endpoints (`endpoints_compatible`).
- No dispone de modo de razonamiento (reasoning): con llama.cpp debe iniciarse con `--reasoning off` o la traduccion se desvia al campo de razonamiento y la respuesta llega vacia.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Traduccion local de articulos y noticias: el modelo procesa parrafo a parrafo con una instruccion fija, adecuado para articulos de unas 900 palabras (15,5 s en RTX 3050, 57 s en CPU), lo que permite traducir contenido en equipos sin GPU dedicada.
- Traduccion de documentacion tecnica con formato: al mantener HTML y Markdown en 210 de 213 textos, es util para traducir READMEs, documentacion web y articulos con enlaces, negritas y listas sin romper el marcado.
- Traduccion de contenido web y blogs: la preservacion de etiquetas HTML permite integrarlo en pipelines de publicacion que reciben HTML y necesitan la version en castellano con el marcado intacto.
- Traduccion de textos cientificos y medicos: obtiene 86,9 COMET en Medline (abstracts biomedicos), su mayor ganancia frente al modelo base (+5,8), por lo que sirve para pre-traducir resumenes medicos antes de revision humana.
- Traduccion de noticias y textos periodisticos: con 86,1 COMET en NTREX y 88,1 en TICO-19, es adecuado para flujos de traduccion de noticias y contenido sanitario con referencia en castellano latinoamericano.
- Prototipado y experimentacion en traduccion automatica: al ser un modelo pequeno con scripts de entrenamiento y evaluacion publicos en GitHub, sirve como base para experimentos de finetune y evaluacion con COMET en entornos con recursos limitados.
- Despliegue en entornos con restricciones de memoria: con 1,3 GB en Q4_K_M, cabe en portatiles y equipos de gama baja para traduccion por lotes de parrafos.

## Benchmarks y rendimiento

Resultados COMET (`Unbabel/wmt22-comet-da`, escala 0-100) frente al modelo base LFM3-1.7B:

| Test | LFM3-1.7B | Sibundoy-Translate-1.7B | Ganancia |
|---|---|---|---|
| WMT24++ | 74,9 | 80,4 | +5,5 |
| ColIA-213 | 84,8 | 87,6 | +2,8 |
| Medline | 81,1 | 86,9 | +5,8 |
| NTREX | 81,4 | 86,1 | +4,6 |
| FLORES+ | 82,9 | 86,0 | +3,2 |
| TICO-19 | 85,2 | 88,1 | +2,9 |

Comparativa con modelos pequenos:

| Modelo | WMT24++ | Medline | FLORES+ | NTREX | TICO-19 |
|---|---|---|---|---|---|
| Sibundoy-Translate-1.7B | 80,4 | 86,9 | 86,0 | 86,1 | 88,1 |
| Tower+ 2B | 81,7 | 87,2 | 86,8 | 86,8 | 88,9 |
| Gemma 4 E2B | 82,4 | 87,2 | 86,6 | 86,2 | 88,4 |
| TranslateGemma 4B | 82,8 | 87,5 | 87,3 | 86,6 | 88,2 |
| Gemma 4 E4B | 82,9 | 87,4 | 87,1 | 87,0 | 88,7 |

Preservacion de formato en ColIA-213: 210 de 213 textos conservaron HTML y Markdown (los otros modelos, entre 189 y 208).

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB de memoria con el archivo GGUF Q4_K_M, con o sin GPU.
- GPU recomendadas: RTX 3050 de 6 GB (medido: 15,5 s para un articulo de 923 palabras). No se detallan otras GPU en la informacion disponible.
- Cabe en GPU consumer: si, segun el dato de la RTX 3050 6 GB y el consumo de 1,3 GB en Q4_K_M.
- CPU: funciona en CPU de portatil (57 s para el mismo articulo de 923 palabras).
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`, `AutoTokenizer`), llama.cpp (via GGUF, con `--reasoning off`), endpoints compatibles. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 15,5 s en RTX 3050 6 GB y 57 s en CPU de portatil para un articulo de 923 palabras traducido parrafo a parrafo. No se dispone de mas datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | COMET (FLORES+) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sibundoy-Translate-1.7B | 1,7B | no disponible | 86,0 | lfm1.0 | Hugging Face (safetensors y GGUF) |
| Tower+ 2B | 2B | no disponible | 86,8 | no disponible | no disponible |
| Gemma 4 E2B | 2B (aprox.) | no disponible | 86,6 | no disponible | no disponible |
| TranslateGemma 4B | 4B | no disponible | 87,3 | no disponible | no disponible |
| Gemma 4 E4B | 4B (aprox.) | no disponible | 87,1 | no disponible | no disponible |

Sibundoy-Translate-1.7B queda 0,1 a 2,5 puntos COMET por detras de los modelos de 2 a 4B en las pruebas publicas, aunque gana en preservacion de formato (210 de 213 textos).

## Limitaciones y advertencias

- Calidad general de traduccion inferior a modelos de 2 a 4B parametros (0,1 a 2,5 puntos COMET por detras), incluido el dominio cientifico y medico donde se esperaba ventaja.
- Requiere enviar un solo parrafo por peticion: con varios bloques separados por lineas en blanco suele traducir el primero y detenerse, o repetir un bloque en bucle.
- Necesita repetition penalty de 1,1; sin ella, un texto de prueba entro en bucle.
- Es un traductor puro sin razonamiento: con llama.cpp hay que iniciar el servidor con `--reasoning off` o la traduccion se dirige al campo de razonamiento y la respuesta vuelve vacia.
- Solo soporta ingles y castellano; no se documentan otros pares de idiomas.
- El castellano es neutro con solo 0,4% de formas de Espana, lo que puede no ajustarse a convenciones editoriales que exijan castellano de Espana.
- Licencia lfm1.0 (license: other): deben revisarse las condiciones de uso comercial en el archivo LICENSE antes de desplegarlo en produccion.
- No se documentan sesgos especificos, riesgo de alucinacion en traduccion ni longitud de contexto; no disponible.
- Modelo con muy poca adopcion (2 descargas, 0 likes en el momento de la consulta), lo que limita la validacion por terceros.
- Requiere `trust_remote_code=True` para cargar el codigo de la arquitectura LFM3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/colia-labs/Sibundoy-Translate-1.7B
- GGUF para llama.cpp: https://huggingface.co/colia-labs/Sibundoy-Translate-1.7B-GGUF
- Codigo (datos, entrenamiento y evaluacion): https://github.com/colia-labs/sibundoy-translate
- Laboratorio ColIA: https://colia.org
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Metrica COMET: https://huggingface.co/Unbabel/wmt22-comet-da
- Dataset WMT24++: https://huggingface.co/datasets/google/wmt24pp
