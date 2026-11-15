# catsaiagency/Serval-1.8B-GGUF

## Resumen

Serval-1.8B-GGUF es la distribucion cuantizada en formato GGUF del modelo de traduccion Serval-1.8B, desarrollado por CatsAI Agency. Se trata de un modelo especializado en traduccion multilingue entre 10 idiomas (japones, ingles, chino, coreano, espanol, frances, aleman, portugues, polaco y croata) en las 90 direcciones posibles. El modelo parte de Hy-MT2-1.8B de Tencent (licencia Apache-2.0) y ha sido sometido a un ajuste fino adicional, incluyendo la incorporacion del croata, idioma no cubierto por el modelo base.

La relevancia de esta publicacion radica en su enfoque de eficiencia: con 1.791 millones de parametros y una cuantizacion Q4_K_M de 1,1 GB, el modelo funciona en CPU sin necesidad de GPU, procesando una frase en aproximadamente un segundo en un Intel Core i7-11800H con 6 hilos. Esto lo posiciona como una alternativa de traduccion local y privada, sin dependencia de servicios en la nube.

El repositorio incluye no solo los pesos, sino tambien codigo de ejemplo en Python (`serval.py`), scripts de arranque para `llama-server` en Linux, macOS y Windows, textos de muestra y un glosario de ejemplo. La licencia es la CatsAI Model License, que permite probar el modelo de forma gratuita pero exige pago por maquina para uso productivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Hy-MT2-1.8B de Tencent) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuracion del servidor) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repo) |
| Idiomas soportados | ja, en, zh, ko, es, fr, de, pt, pl, hr (10 idiomas, 90 direcciones) |
| Licencia | CatsAI Model License (gratis para probar; pago por maquina para trabajo real) |
| Formato de pesos | GGUF (safetensors en el repo base catsaiagency/Serval-1.8B) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 1.791 millones de parametros derivado de Hy-MT2-1.8B de Tencent, publicado bajo Apache-2.0. Sobre esa base, CatsAI Agency realizo un ajuste fino adicional orientado a traduccion y anadio soporte para croata, idioma ausente en el modelo original. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal del artefacto no reside en la arquitectura sino en el empaquetado: se distribuye como GGUF Q4_K_M con un kit de herramientas que incluye un cliente Python (`serval.py`) y scripts de servidor (`start-server.sh` / `start-server.ps1`) para `llama-server`. El modelo acepta como entrada el texto fuente y un par de idiomas, y devuelve unicamente la traduccion. La cuantizacion Q4_K_M reduce el peso a 1,1 GB con un coste de calidad medido de 0,3 puntos COMET frente a los pesos sin cuantizar (86,7 frente a 87,0).

## Capacidades

- Traduccion directa entre 10 idiomas en las 90 direcciones posibles (ja, en, zh, ko, es, fr, de, pt, pl, hr).
- Entrada de texto y par de idiomas, salida solo de la traduccion (sin texto explicativo adicional).
- Soporte de glosarios mediante archivo TSV con pares `nombre origen<TAB>nombre destino` para fijar terminologia (nombres propios, toponimos, terminos tecnicos).
- Traduccion de archivos completos linea a linea, manteniendo los saltos de linea y dividiendo lineas largas en fragmentos de varias frases.
- Funcionamiento en CPU sin GPU, con aproximadamente 2,5 GB de RAM en ejecucion.
- Interfaz HTTP compatible con el endpoint `/v1/chat/completions` de `llama-server`, lo que permite integrarlo desde cualquier lenguaje.
- Capacidad conversacional basica segun los tags del repositorio, aunque el pipeline declarado es translation.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo procesa archivos linea a linea manteniendo la estructura, adecuado para equipos que no pueden enviar contenido propietario a APIs externas en la nube.
- Atencion al cliente multilingue en entornos con requisitos de privacidad: al ejecutarse en CPU y no requerir GPU, puede desplegarse en el mismo servidor de la aplicacion para traducir mensajes entrantes y salientes entre los 10 idiomas soportados sin que el texto abandone la infraestructura.
- Localizacion de contenido editorial con terminologia controlada: el soporte de glosarios TSV permite fijar la traduccion de nombres propios y terminos de marca, como demuestra el ejemplo de Fushimi Inari y el torii de Senbon.
- Traduccion de correspondencia y textos administrativos entre japones y las lenguas europeas del conjunto (es, fr, de, pt, pl, hr), con un rendimiento medido en FLORES-200 de 86,7 COMET de media en las 90 direcciones.
- Preprocesamiento en pipelines de datos multilingues: con 32 tokens/s de generacion y 210 tokens/s de lectura de prompt en CPU de 6 hilos, puede traducir lotes de frases para normalizar corpus antes de tareas de analisis o entrenamiento.
- Herramienta de escritorio o CLI para usuarios finales: el kit incluye `serval.py` como herramienta de linea de comandos y funcion importable, lo que permite empaquetar un traductor offline en una aplicacion local.
- Traduccion de soporte en videojuegos o aplicaciones con textos cortos: la latencia de aproximadamente un segundo por frase encaja en flujos interactivos donde no se requiere traduccion de documentos extensos en una sola peticion.

## Benchmarks y rendimiento

| Benchmark | Serval-1.8B Q4_K_M | Serval-1.8B sin cuantizar | Modelo base (Hy-MT2-1.8B) |
|---|---|---|---|
| FLORES-200 devtest, COMET (x100), media de 90 direcciones | 86,7 | 87,0 | 86,0 |
| Croata (hacia hr), COMET | 86,5 | no disponible | 81,4 |
| Croata (desde hr), COMET | 85,1 | no disponible | 82,5 |

Datos de velocidad en CPU (Intel Core i7-11800H, 6 hilos): aproximadamente 32 tokens/s de generacion y 210 tokens/s de lectura de prompt, lo que equivale a cerca de un segundo por frase. En el ejemplo de traduccion de un texto largo, el kit proceso el archivo en 3 peticiones y 8,3 segundos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU.
- RAM: aproximadamente 2,5 GB durante la ejecucion con el archivo Q4_K_M de 1,1 GB.
- CPU: el rendimiento medido corresponde a un Intel Core i7-11800H con 6 hilos; el numero de hilos es configurable mediante la variable de entorno `THREADS` (por defecto 4).
- GPU: no se documentan requisitos ni beneficios de GPU en la informacion disponible.
- Despliegue: `llama-server` de llama.cpp (probado con la version b11829), con scripts de arranque para Linux, macOS y Windows PowerShell. El puerto es configurable mediante `PORT` (por defecto 8080) y el archivo de modelo mediante `MODEL`.
- Latencia y throughput: aproximadamente 32 tokens/s de generacion y 210 tokens/s de lectura de prompt en la CPU de referencia; alrededor de un segundo por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Serval-1.8B-GGUF | 1,79 B | 4.096 tokens | Traduccion 10 idiomas, 90 direcciones | CatsAI Model License (pago por maquina) | GGUF en Hugging Face |
| Hy-MT2-1.8B (Tencent) | 1,8 B (aproximado, segun model card) | no disponible | Traduccion multilingue (modelo base) | Apache-2.0 | Pesos originales en Hugging Face |
| Modelos de traduccion neuronal dedicados de gran tamano (tipo NLLB o similares) | no disponible | no disponible | Traduccion multilingue | variable | no disponible |

La comparacion directa mas relevante es con el modelo base Hy-MT2-1.8B: Serval mejora la media COMET de 86,0 a 87,0 (sin cuantizar) y anade croata con una mejora notable (de 81,4 a 86,5 hacia hr y de 82,5 a 85,1 desde hr). No se dispone en la informacion proporcionada de comparaciones con otros modelos de traduccion del mismo tamano.

## Limitaciones y advertencias

- La licencia CatsAI Model License no es de codigo abierto: permite probar el modelo gratuitamente pero exige pago por maquina para trabajo real. Es imprescindible revisar `MODEL-LICENSE.md` antes de cualquier uso comercial.
- El contexto del servidor arranca en 4.096 tokens y el modelo esta disenado para traducir de una frase a un parrafo por peticion; no es adecuado para documentos completos en una sola llamada.
- Se documentan errores de traduccion reales en los ejemplos del autor: "2 p.m." traducido como "noon" (正午) y "cloakroom" como "locker" (ロッカー), lo que indica riesgo de imprecision en detalles facticos y terminologia.
- El modelo devuelve solo la traduccion, sin explicaciones ni control de calidad; no hay mecanismo integrado de verificacion.
- Solo se publica la cuantizacion Q4_K_M en este repositorio; otras cuantizaciones no estan disponibles aqui (los pesos sin cuantizar estan en el repo base).
- No se documentan sesgos especificos, pero al ser un modelo de traduccion entrenado sobre corpus no detallados, puede heredar sesgos de genero, culturales o regionales de dichos datos.
- La fecha de creacion del repositorio (2026-11-15) y el hecho de tener 0 descargas y 1 like en el momento de la consulta implican una validacion externa practicamente nula por parte de la comunidad.
- No se especifican datos de entrenamiento, por lo que no es posible evaluar la cobertura dialectal ni el comportamiento en dominios especializados mas alla de los ejemplos proporcionados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/catsaiagency/Serval-1.8B-GGUF
- Modelo base sin cuantizar: https://huggingface.co/catsaiagency/Serval-1.8B
- Sitio web del proyecto: https://catsai.agency/en/serval
- Licencia del modelo: https://huggingface.co/catsaiagency/Serval-1.8B-GGUF/blob/main/MODEL-LICENSE.md
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
