# infosave/SenseNova-Loop-9B-Preview-cmf

## Resumen

SenseNova-Loop-9B-Preview-cmf es la conversion al formato CMF del modelo multimodal SenseNova-Loop-9B-Preview, publicado por el usuario `infosave` y orientado al motor de inferencia `cortiq`, escrito en Rust sin dependencias de Python ni de frameworks de machine learning. El modelo original, de aproximadamente 9.000 millones de parametros, es un transformer con un bloque de decodificador "loopeado": 24 de sus 32 capas se ejecutan dos veces compartiendo pesos, lo que resulta en 56 ejecuciones de capa por token. Incorpora dos flujos residuales con manifold-constrained hyper-connections (mHC) dentro del bucle, atencion hibrida (lineal y completa) y un codificador de vision que procesa imagenes a resolucion nativa.

La relevancia de esta publicacion reside en el empaquetado: los pesos se distribuyen como ficheros CMF autocontenidos que incluyen el plan del bucle, los routers mHC en float32 y el procesador de imagenes, de modo que el modelo se ejecuta directamente con `cortiq` sobre GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12, sobre Apple Silicon mediante Metal y sobre CPU. Se ofrecen dos cuantizaciones: `q4tp` (4 bits en el modelo de lenguaje, 16 bits en el codificador visual, 5,62 GB) y `q8_2f` (8 bits, 9,92 GB), ambas bajo licencia Apache-2.0.

La ficha describe tanto el modelo base como el artefacto cuantizado, e indica explicitamente cuando un dato no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con bloque loopeado (24 de 32 capas ejecutadas dos veces con pesos compartidos; 56 ejecuciones de capa por token), dos flujos residuales con mHC en el bucle, atencion hibrida lineal/completa, codificador de vision a resolucion nativa |
| Parametros totales | ~9.000 millones (modelo base SenseNova-Loop-9B-Preview) |
| Parametros activos | no disponible (no es MoE; el bucle comparte pesos, no activa expertos) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | `q4tp` (4 bits en el LM, 16 bits en el codificador visual) y `q8_2f` (8 bits en el LM, 16 bits en el codificador visual) |
| Idiomas soportados | Ingles (en), chino (zh), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (contenedor propio del motor `cortiq`); el modelo base original se distribuye en formato no especificado en la informacion disponible |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con una innovacion estructural central: el decodificador consta de 32 capas, pero el bloque comprendido entre las capas 4 y 27 (24 capas) se ejecuta dos veces con los mismos pesos, de modo que cada token atraviesa 56 ejecuciones de capa. Dentro del bucle se mantienen dos flujos residuales conectados mediante manifold-constrained hyper-connections (mHC), lo que permite que la informacion circule por dos vias paralelas a lo largo de las pasadas repetidas. La atencion es hibrida, combinando mecanismos lineales y de atencion completa. El codificador de vision procesa imagenes a resolucion nativa con parches de 16x16 pixeles que se fusionan 2x2 en un unico token, admitiendo hasta 16,7 millones de pixeles.

En cuanto al entrenamiento, la informacion proporcionada no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del artefacto cuantizado describe el proceso de conversion: `cortiq convert` genera los ficheros CMF, cuantiza el modelo de lenguaje a `q4tp` o `q8_2f`, conserva los routers mHC en float32 tal como los publica el autor original y mantiene el codificador visual en 16 bits ejecutandose en float32. El plan del bucle (capas 4-27 dos veces, cada pasada con su propia cache) y el procesador de imagenes viajan dentro del fichero. La sampling por defecto del release (temperatura 1.0, top-p 0.95) se incluye como valor por defecto en `run` y `serve`.

## Capacidades

- Generacion de texto y razonamiento en ingles, chino y ruso.
- Comprension de imagenes a resolucion nativa, incluyendo capturas de pantalla, graficos y fotografias; soporta multiples imagenes en una misma peticion (por ejemplo, comparacion entre dos imagenes).
- Modo "thinking": el modelo razona antes de responder salvo que se use `--no-think`; los tokens de pensamiento cuentan para `--max-tokens`.
- Generacion de codigo (el ejemplo de la model card incluye la escritura de una funcion Python para fusionar dos listas ordenadas).
- Lectura de valores en graficos y extraccion de informacion visual estructurada.
- Servicio compatible con la API de OpenAI mediante `cortiq serve`, con soporte de partes `image_url`.
- Decodificacion greedy opcional (`--greedy`) ademas de la sampling por defecto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Descripcion y analisis de imagenes: el modelo acepta rutas locales, data URLs o URLs HTTP(S) mediante `--image` y describe el contenido; el codificador procesa una imagen de 512x512 en 1,2 s en Apple M4 y responde al primer token en 1,9 s con `cortiq serve` en una A40.
- Lectura de graficos y tablas en imagenes: con `--image chart.png --prompt "Read the values of the chart."` y `--no-think` se obtiene una extraccion directa de valores, adecuada para pipelines de digitalizacion de documentos.
- Comparacion de imagenes: el flag `--image` puede repetirse, lo que permite preguntar que ha cambiado entre dos capturas, util en control de calidad visual o seguimiento de cambios en interfaces.
- Procesamiento de capturas de pantalla de alta resolucion: el codificador admite hasta 16,7 millones de pixeles (una captura de 2206x1048 genera 9108 parches y 2277 tokens de lenguaje), lo que habilita la transcripcion y el analisis de interfaces complejas.
- Generacion de codigo en local: el ejemplo de la model card escribe una funcion Python para fusionar dos listas ordenadas; con `q4tp` y unos 8 GB de VRAM en Vulkan puede ejecutarse en estaciones de trabajo sin Python ni frameworks de ML.
- Despliegue en Apple Silicon: con Metal por defecto y 16 GB de memoria unificada, `q4tp` decodifica a 11,1 tok/s y lee un prompt de 512 tokens a 80 tok/s, apropiado para asistentes locales en portatiles Mac.
- Servicio OpenAI-compatible: `cortiq serve` expone el modelo en el puerto indicado con soporte de `image_url`, lo que permite integrarlo como backend en aplicaciones existentes que ya consumen la API de OpenAI.
- Ejecucion en CPU sin GPU: con `CMF_GPU=0` el modelo funciona en CPU, opcion util para entornos sin acelerador aunque con latencia no especificada.

## Benchmarks y rendimiento

La model card proporciona perplejidad sobre los primeros 2048 tokens de wikitext-2 y metricas de rendimiento medidas con `cortiq 0.8.51` en una NVIDIA A40 (48 GB, Vulkan):

| Metrica | q4tp | q8_2f |
|---|---:|---:|
| Perplejidad wikitext-2 (2048 tokens) | 13,20 | 13,44 |
| Decodificacion (tok/s) | 29,1 | 21,3 |
| Prompt de 2k tokens (tok/s) | 338 | 293 |
| Decodificacion con contexto de 2k (tok/s) | 27,8 | 20,8 |
| Tamano del fichero | 5.622.731.597 B (5,62 GB) | 9.919.558.477 B (9,92 GB) |

En Apple M4 (Metal), `q4tp` decodifica a 11,1 tok/s y lee un prompt de 512 tokens a 80 tok/s; el codificador visual tarda 1,2 s para una imagen de 512x512. En la A40, el codificador visual tarda 5,9 s para una captura de 2206x1048 (9108 parches, 2277 tokens de lenguaje) y `cortiq serve` responde a una imagen de 512x512 en 1,9 s hasta el primer token.

La model card indica que `q4tp` produce "el mismo contenido, otras palabras" en comparacion con Transformers float32 en decodificacion greedy (una descripcion de imagen de una frase y dos prompts de texto, 48 tokens greedy cada uno), mientras que `q8_2f` coincide exactamente en las tres pruebas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: `q4tp` requiere aproximadamente 8 GB de memoria de GPU; `q8_2f` aproximadamente 12 GB.
- GPUs recomendadas: NVIDIA A40 (48 GB) validada con Vulkan; el motor soporta NVIDIA, AMD e Intel mediante Vulkan/DX12. No se especifican otras GPU concretas en la informacion disponible.
- Apple Silicon: Metal es el modo por defecto; se necesitan 16 GB de memoria unificada para `q4tp`.
- CPU: ejecucion posible con `CMF_GPU=0`; latencia no disponible.
- Cabe en GPU de consumo: si, `q4tp` con ~8 GB encaja en GPUs de consumo con 8 GB o mas de VRAM, aunque la model card no enumera modelos concretos como RTX 4090 o similares.
- Despliegue: `cortiq` (CLI `cortiq run` y servidor `cortiq serve` compatible con OpenAI); se instala con `cargo install cortiq-cli` y requiere la version 0.8.51 o posterior; hay binarios precompilados para Linux, macOS y Windows.
- En Linux headless con Vulkan es necesario instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Latencia y throughput: 29,1 tok/s de decodificacion y 338 tok/s de prefill en A40 con `q4tp`; 11,1 tok/s de decodificacion en Apple M4. El codificador visual tarda 5,9 s en una captura de alta resolucion en A40 y 1,2 s en una imagen de 512x512 en M4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / motor |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview-cmf (q4tp) | ~9B | no disponible | 4 bits LM + 16 bits vision | Apache-2.0 | CMF / cortiq |
| SenseNova-Loop-9B-Preview-cmf (q8_2f) | ~9B | no disponible | 8 bits LM + 16 bits vision | Apache-2.0 | CMF / cortiq |
| SenseNova-Loop-9B-Preview (base) | ~9B | no disponible | pesos originales | Apache-2.0 | no disponible en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria (por ejemplo, otros modelos multimodales de ~9B) que permitan una comparacion cuantitativa. La comparacion se limita a las dos cuantizaciones del propio artefacto y al modelo base.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser un modelo entrenado con datos web, es previsible que herede sesgos de esos datos, aunque no se cuantifican en la informacion disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; la perplejidad de 13,20 en wikitext-2 con `q4tp` es un indicador agregado, no una garantia de fidelidad factual.
- Idiomas: solo se declaran ingles, chino y ruso; no hay soporte declarado de castellano.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con documentos largos.
- La cuantizacion `q4tp` no reproduce exactamente la salida float32 en decodificacion greedy (mismo contenido, distintas palabras); para paridad exacta debe usarse `q8_2f`, que ocupa 9,92 GB.
- El artefacto depende del motor `cortiq` (Rust) y del formato CMF; no es directamente cargable con Transformers, vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- En Linux headless con Vulkan se requieren paquetes del sistema y la variable `XDG_RUNTIME_DIR`; sin ellos el motor puede fallar.
- Los tokens de "thinking" cuentan para `--max-tokens`, lo que puede truncar respuestas si no se ajusta el limite.
- Licencia Apache-2.0 permite uso comercial, pero el autor del artefacto no ofrece garantias sobre el modelo base ni sobre el proceso de cuantizacion.

## Enlaces

- Repositorio del artefacto cuantizado: https://huggingface.co/infosave/SenseNova-Loop-9B-Preview-cmf
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Scripts de referencia y paridad: https://github.com/infosave2007/cmf/tree/master/scripts/four
