# pfnet/plamo-3-translate-2b-W4A16

## Resumen

PLaMo 3 Translate 2B W4A16 es la variante cuantizada a INT4 de PLaMo 3 Translate 2B, un modelo de lenguaje especializado en traduccion desarrollado por Preferred Networks (PFN). Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigacion conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japon, y se afina posteriormente con decenas de miles de millones de tokens de datos orientados a traduccion.

El modelo cubre traduccion entre 53 idiomas, admite contexto adicional y glosarios, y permite elegir entre estilo llano y cortes para la salida en japones. La longitud maxima empleada durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que el total no supere ese limite.

Esta version W4A16 aplica cuantizacion de pesos a INT4 manteniendo activaciones en BF16, con el objetivo de reducir el consumo de memoria en GPU y facilitar el despliegue en vLLM sobre hardware NVIDIA Ampere o posterior. El repositorio ocupa 2,3 GB y declara 859.923.136 parametros en sus pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `plamo3`, requiere `trust_remote_code`) |
| Parametros totales | 859.923.136 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante entrenamiento) |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas, entre ellos es, en, ja, zh, ko, de, fr, it, pt, ru, ar, hi, vi, th, id, tr, nl, pl, uk, etc. |
| Licencia | PLaMo Community License (uso no comercial gratuito; uso comercial sujeto a condiciones) |
| Formato de pesos | safetensors con `compressed-tensors` (INT4), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only identificada con la etiqueta `plamo3` y requiere cargar codigo personalizado (`custom_code`). La variante W4A16 conserva la estructura del modelo base PLaMo 3 Translate 2B, pero almacena los pesos en INT4 mediante `compressed-tensors`, manteniendo las activaciones en BF16. En vLLM es necesario lanzar el modelo con `--dtype bfloat16` para reproducir la configuracion de evaluacion del autor.

El entrenamiento parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y se continua con decenas de miles de millones de tokens de datos centrados en traduccion. No se detalla en la informacion disponible la composicion exacta del dataset, el numero total de tokens de preentrenamiento ni si se aplicaron fases de RLHF o DPO. La longitud maxima de 32.768 tokens se aplica a la suma de entrada y salida, lo que condiciona el diseno de los pipelines de traduccion de documentos largos.

## Capacidades

- Traduccion multilingue entre 53 idiomas, incluyendo pares que no involucran al japones ni al ingles.
- Traduccion bidireccional con japones e ingles como ejes principales, evaluada en 15 idiomas en FLORES+.
- Uso de contexto circundante para desambiguar terminos y mantener coherencia en parrafos y documentos.
- Soporte de glosarios para forzar terminologia concreta (nombres propios, terminos tecnicos, marcas).
- Control de estilo en la salida japonesa: estilo llano o cortes.
- Traduccion de pasajes largos en una sola pasada hasta 32.768 tokens combinados de entrada y salida.
- Generacion de texto condicionada a instrucciones de traduccion (pipeline `translation`).
- No se documenta soporte de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede procesar secciones completas de manuales dentro de la ventana de 32.768 tokens, manteniendo terminologia consistente mediante glosarios y contexto previo.
- Localizacion de interfaz de usuario y marketing: con 53 idiomas cubiertos, un mismo modelo puede alimentar pipelines de localizacion multiidioma sin cambiar de checkpoint por par de idiomas.
- Traduccion jurada o corporativa japones-ingles: el control de estilo llano/cortes permite adaptar el registro de la salida al destinatario, algo relevante en comunicaciones internas y externas en japones.
- Atencion al cliente multilingue: integrado en un backend de traduccion en tiempo casi real, permite responder en el idioma del usuario a partir de respuestas generadas en un idioma base, con contexto conversacional dentro de la ventana.
- Subtitulado y transcripcion: al aceptar contexto adicional, puede traducir segmentos cortos manteniendo coherencia con las lineas previas, util para series y videos tecnicos.
- Procesamiento por lotes en GPU de gama media: la cuantizacion W4A16 reduce la huella de memoria, lo que permite desplegar el modelo en tarjetas con 8-16 GB y procesar volumenes altos de documentos.
- Investigacion en traduccion automatica: sirve como linea base cuantizada para comparar calidad con modelos especializados y para estudiar el impacto de la cuantizacion INT4 en tareas de traduccion.

## Benchmarks y rendimiento

El autor publica graficas de calidad de traduccion (PFTB, SaaS y WMT24++ COMET-22 para japones-ingles; FLORES+ chrF++ para pares con japones e ingles frente a 14 idiomas) en las que el modelo 2B supera a los LLM especializados en traduccion comparados (TranslateGemma y HY-MT2) en todas las metricas mostradas. Sin embargo, la informacion disponible no incluye los valores numericos de esas graficas ni tablas con cifras concretas por benchmark.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,3 GB en INT4; en inferencia con vLLM y activaciones BF16 se recomienda reservar al menos 4-6 GB de VRAM para pesos, cache KV y overhead del runtime, dependiendo de la longitud de contexto utilizada.
- GPU recomendadas: NVIDIA Ampere o posterior (A100, A10, L4, RTX 30xx/40xx). La variante W4A16 esta pensada para vLLM en estas arquitecturas; para Hopper existe la variante W4AFP8 con computo FP8.
- GPU de consumo: si, cabe en tarjetas consumer con 8 GB o mas (RTX 3060 8 GB, RTX 4060, RTX 4070 y superiores), siempre que se limite la longitud de contexto para controlar la cache KV.
- Despliegue: vLLM es la opcion documentada por el autor (con `--dtype bfloat16`). El modelo base y otras variantes cubren transformers, GGUF (llama.cpp/Ollama) y MLX-4bit para Apple Silicon; esta variante W4A16 esta orientada a vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de menos de 1.000 millones de parametros, se espera un throughput alto en GPU modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B W4A16 | 859,9 M | 32.768 (entrada + salida) | 53 | PLaMo Community License | safetensors INT4 (vLLM) |
| PLaMo 3 Translate 2B (BF16) | no disponible en la informacion | 32.768 (entrada + salida) | 53 | PLaMo Community License | safetensors BF16 |
| PLaMo 3 Translate 0.8B | no disponible | no disponible | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| PLaMo 3 Translate 8B | no disponible | no disponible | 53 | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor situa a PLaMo 3 Translate 2B por delante de TranslateGemma y HY-MT2 en las metricas evaluadas, pero no se aportan en la informacion disponible los parametros, contextos ni licencias de esos modelos comparables.

## Limitaciones y advertencias

- La cuantizacion INT4 puede introducir degradacion de calidad respecto al modelo BF16; el autor publica tablas comparativas de precision por formato, pero sus cifras no estan en la informacion disponible.
- El limite de 32.768 tokens es la suma de entrada y salida: documentos largos deben dividirse, lo que puede romper la coherencia entre fragmentos si no se aporta contexto adicional.
- El modelo esta especializado en traduccion; su uso como LLM generalista (razonamiento, codigo, agentes) no esta documentado ni validado.
- No se documentan mecanismos de tool calling, function calling ni modo de razonamiento explicito.
- La licencia PLaMo Community License permite uso personal, academico y no comercial sin registro previo, pero el uso comercial esta sujeto a condiciones adicionales que deben revisarse antes de desplegar en produccion.
- Riesgo de sesgos y alucinaciones inherente a los modelos de lenguaje: puede inventar terminologia o alterar nombres propios, especialmente en pares de idiomas con pocos recursos.
- El soporte de los 53 idiomas no implica calidad homogenea; la evaluacion publica se centra en 15 idiomas y en pares con japones e ingles.
- Requiere `trust_remote_code` y el codigo personalizado `plamo3`, lo que anade una dependencia de mantenimiento y superficie de riesgo en entornos auditados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-2b-W4A16
- Modelo base (BF16): https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-2b-W4AFP8
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-2b-MLX-4bit
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Blog tecnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (ingles): https://plamo.preferredai.jp/info/plamo-community-license-en
