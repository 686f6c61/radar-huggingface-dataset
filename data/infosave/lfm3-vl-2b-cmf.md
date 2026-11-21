# infosave/LFM3-VL-2B-cmf

## Resumen

LFM3-VL-2B-cmf es una distribucion cuantizada del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, publicada por el usuario infosave en formato CMF (Cortiq Model File). El modelo original lo desarrolla Liquid AI y combina un codificador visual de 14 capas (convoluciones y atencion) que procesa imagenes a resolucion nativa en parches de 16x16 (cada bloque 2x2 equivale a un token de lenguaje) con el modelo de texto LFM3-1.7B, que usa convoluciones cortas y atencion completa y de ventana deslizante. El total ronda los 2.000 millones de parametros.

La aportacion de esta ficha no es el modelo en si, sino el empaquetado: dos ficheros unicos (q8_2f de 2,14 GB y q4tp de 1,31 GB) que se ejecutan con `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de machine learning, con soporte para GPU NVIDIA, AMD e Intel via Vulkan/DX12, backend Metal en Apple Silicon y CPU pura. Esto lo hace relevante para despliegues en el borde (edge) y entornos donde instalar PyTorch o CUDA resulta inviable.

El modelo esta pensado para tareas image-text-to-text con modo de razonamiento activado por defecto, soporte de video (muestreo a 2 fps) y 16 idiomas declarados, entre ellos el espanol. La licencia es lfm1.0, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder de 14 capas (convolucion + atencion) sobre modelo de texto LFM3-1.7B (convoluciones cortas, atencion completa y sliding-window); pipeline image-text-to-text |
| Parametros totales | Aproximadamente 2.000 millones (modelo base LFM3-VL-2B); fichero q8_2f de 2.135.818.786 bytes, q4tp de 1.306.104.354 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; se documentan pruebas con prompts de 4.000 tokens |
| Tipos de cuantizacion | q8_2f (lenguaje 8 bits, vision 16 bits), q4tp (lenguaje 4 bits, vision 16 bits); encoder visual y proyector siempre en 16 bits, ejecutados en float32 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | CMF (Cortiq Model File), ejecutable con `cortiq`; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un vision-lenguaje de Liquid AI que empareja un codificador visual de 14 capas con el modelo de texto LFM3-1.7B. El encoder procesa imagenes a resolucion nativa mediante parches de 16x16, donde cada bloque 2x2 se mapea a un unico token de lenguaje; una imagen de 640x480 produce 300 tokens y una de 1296x864 produce 1080. El modelo de texto emplea una mezcla de convoluciones cortas, atencion completa y atencion de ventana deslizante, y tiene el modo de razonamiento (thinking) activado por defecto.

Esta distribucion no reentrena el modelo: cuantiza los pesos del checkpoint original. El encoder visual y el proyector se mantienen en 16 bits y se ejecutan en float32 para preservar la fidelidad numerica; en imagenes PNG el preprocesado reproduce exactamente el de Transformers y las filas entregadas al modelo de lenguaje coinciden con el checkpoint bf16 ejecutado en float32 (coseno superior a 0,9999 en todas las filas). En JPEG la decodificacion difiere ligeramente de PIL (unos pocos niveles por pixel), lo que desplaza filas individuales. La comparacion de 48 tokens greedy sobre cuatro imagenes de prueba da coincidencia identica en 3 de 4 imagenes para q8_2f y 0 de 4 para q4tp (mismo contenido, otras palabras). No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

La innovacion tecnica destacable es el formato CMF y el motor `cortiq`: inferencia sin Python ni framework de ML, con backend Vulkan/DX12, Metal y CPU, y un servidor compatible con la API de OpenAI. El procesado de video sigue el esquema del processor de Liquid: frames a 2 por segundo (entre 4 y 768), dos frames consecutivos por paso visual, cada paso precedido por su marca temporal y un presupuesto de pixeles comun a todos los frames.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; `--no-think` solicita respuesta directa.
- Comprension de imagenes a resolucion nativa: descripcion, lectura de graficos, comparacion entre varias imagenes (se admite `--image` repetido).
- Procesamiento de video: ficheros Y4M locales o directorios de frames con `--video-fps`, muestreo a 2 fps y marcas temporales por paso.
- Entrada image-text-to-text y texto puro (el mismo fichero funciona sin imagen).
- Tool calling / function calling en peticiones de solo texto, heredado de LFM3-1.7B.
- Multilingue en 16 idiomas, incluido el espanol.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con partes de imagen por URL HTTP(S), data URL o ruta local, y partes de video por ruta local.
- Control de resolucion mediante `--image-max-pixels` para reducir tokens y acelerar el encoder.

## Casos de uso

- Descripcion y etiquetado de imagenes en el borde: con 1,31 GB en q4tp cabe en cualquier GPU con 2 GB libres o en CPU, lo que permite clasificar y describir fotos en dispositivos sin Python ni stack de ML.
- Lectura de graficos y tablas en informes: el ejemplo de la model card (`--image chart.png --prompt "Read the values of the chart." --no-think`) muestra el uso para extraer valores de figuras, adecuado por el encoder a resolucion nativa y el modo directo sin thinking.
- Comparacion de imagenes antes/despues: con multiples `--image` en una sola peticion se pueden detectar cambios entre dos capturas, util en control de calidad visual o monitorizacion.
- Analisis de video ligero: conteo de personas o descripcion de eventos en clips cortos mediante `--video` con muestreo a 2 fps y marcas temporales, apropiado para tareas de vigilancia sencilla o resumen de grabaciones.
- Asistente multimodal en servidor local: `cortiq serve` expone una API compatible con OpenAI, de modo que aplicaciones existentes pueden enviar imagenes por URL o data URL sin cambiar de cliente.
- Procesamiento por lotes en CPU: con `CMF_GPU=0` el modelo corre sin GPU, lo que sirve para pipelines de enriquecimiento de imagenes en servidores sin acelerador.
- Transcripcion descriptiva multilingue: al cubrir 16 idiomas, permite generar descripciones de imagenes en espanol, arabe, chino o japones desde el mismo fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente aporta mediciones de inferencia con `cortiq`:

| Escenario | q8_2f | q4tp |
|---|---:|---:|
| Decodificacion, tok/s (A40, Vulkan) | 167 | 213 |
| Decodificacion a 4k, tok/s (A40, Vulkan) | 127 | 162 |
| Prompt de 4k tokens, tok/s (A40, Vulkan) | 670 | 598 |
| Encoder visual 640x480 / 1296x864 (A40) | 3,0 s / 7,0 s | 3,2 s / 6,6 s |
| Decodificacion, tok/s (Apple M4, Metal) | no disponible | 82 |
| Encoder visual 640x480 / 1296x864 (M4) | no disponible | 0,46 s / 1,6 s |
| Decodificacion, tok/s (RTX A5000, CUDA) | no disponible | 278,4-280,1 |
| Decodificacion, tok/s (RTX A5000, Vulkan) | no disponible | 263,0-273,3 |

## Requisitos de hardware

- VRAM: ambos ficheros caben en cualquier tarjeta con 2 GB de memoria libre; el q8_2f ocupa 2,14 GB y el q4tp 1,31 GB en disco.
- GPU recomendadas: NVIDIA A40 (48 GB) y RTX A5000 (24 GB) con resultados medidos; cualquier GPU NVIDIA, AMD o Intel con Vulkan o DX12.
- Apple Silicon: backend Metal por defecto; medido en Apple M4 con q4tp a 82 tok/s.
- CPU: `CMF_GPU=0` fuerza ejecucion en CPU; el encoder visual ya corre en CPU en float32 (la atencion va a GPU) para mantener la exactitud.
- Cabe en GPU de consumo: si, cualquier tarjeta con 2 GB libres, incluidas gamas de entrada.
- Despliegue: `cortiq` (Rust, sin Python), instalable con `cargo install cortiq-cli`; binarios precompilados para Linux, macOS y Windows; backend CUDA compilado con `--features cuda`; servidor compatible con OpenAI con `cortiq serve`.
- Latencia: el encoder visual tarda 3,0-3,2 s para 640x480 y 6,6-7,0 s para 1296x864 en A40; 0,46 s y 1,6 s respectivamente en M4 con q4tp. En Linux headless hay que instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| LFM3-VL-2B-cmf (q4tp) | ~2B | no disponible | CMF (cortiq) | lfm1.0 | 1,31 GB; vision 16 bits; motor Rust sin Python |
| LFM3-VL-2B-cmf (q8_2f) | ~2B | no disponible | CMF (cortiq) | lfm1.0 | 2,14 GB; casi sin perdida (3 de 4 imagenes identicas) |
| LiquidAI/LFM3-VL-2B (original) | ~2B | no disponible | safetensors (bf16) | lfm1.0 | Checkpoint de referencia; requiere Transformers/PyTorch |
| LFM3-1.7B-cmf | ~1,7B | no disponible | CMF (cortiq) | lfm1.0 | Solo texto; misma familia y motor, sin vision |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other": hay que revisar sus terminos antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- El modo thinking esta activado por defecto y sus tokens consumen el presupuesto de `--max-tokens` (256 por defecto), lo que puede truncar respuestas si no se ajusta.
- La cuantizacion q4tp altera la salida: en la prueba de 48 tokens greedy sobre cuatro imagenes no coincidio con el original en ninguna, aunque el contenido era equivalente.
- La decodificacion de JPEG difiere de PIL en unos pocos niveles por pixel, lo que puede desplazar filas del encoder respecto al checkpoint de referencia.
- El encoder visual corre en CPU en float32, lo que anade latencia perceptible (varios segundos por imagen en A40) frente a un encoder totalmente en GPU.
- No se han publicado resultados de benchmarks estandar, por lo que no hay evidencia publica de calidad en MMLU, HumanEval o GSM8K para este empaquetado.
- El repositorio es una distribucion de terceros (infosave), no oficial de Liquid AI; la trazabilidad y el mantenimiento dependen de ese autor y del proyecto cortiq.
- Riesgo de alucinacion inherente a un modelo de 2B en tareas de lectura precisa de graficos o texto en imagen; conviene validar las salidas.
- Requiere `cortiq` 0.8.49 o superior y, en Linux headless, dependencias Vulkan adicionales; no es compatible con vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/LFM3-VL-2B-cmf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Version solo texto empaquetada: https://huggingface.co/infosave/LFM3-1.7B-cmf
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
