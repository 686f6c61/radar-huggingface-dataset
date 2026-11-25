# openbmb/MiniCPM-V-4-int4

## Resumen

MiniCPM-V 4.0 es un modelo multimodal de lenguaje y visión (MLLM) desarrollado por OpenBMB, el equipo de investigación de la Universidad de Tsinghua y ModelBest. Esta ficha corresponde a la variante cuantizada a 4 bits (`openbmb/MiniCPM-V-4-int4`), que reduce el peso del repositorio a 2,8 GB frente a los aproximadamente 8 GB de la versión en precisión completa. El modelo combina un codificador visual SigLIP2-400M con un modelo de lenguaje MiniCPM4-3B, sumando 4.059.533.040 parámetros totales según los safetensors publicados.

El modelo está diseñado para despliegue en dispositivo (on-device): según la model card, alcanza menos de 2 segundos de latencia hasta el primer token y más de 17 tokens por segundo en decodificación sobre un iPhone 16 Pro Max sin problemas de calentamiento. A pesar de su tamaño reducido, declara un rendimiento en OpenCompass (69,0 de media en 8 benchmarks) superior al de GPT-4.1-mini-20250414, MiniCPM-V 2.6 (8,1B) y Qwen2.5-VL-3B-Instruct (3,8B).

Es relevante ahora porque demuestra que un modelo multimodal de 4B parámetros puede cubrir comprensión de imagen única, multi-imagen y vídeo con una licencia Apache 2.0 permisiva, integrándose en ecosistemas de despliegue habituales (llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM: codificador visual SigLIP2-400M + LLM MiniCPM4-3B (transformer) |
| Parametros totales | 4.059.533.040 (~4,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (bitsandbytes); el repo se distribuye ya cuantizado a int4 |
| Idiomas soportados | multilingue (sin listado detallado en la informacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 sigue el patron de MLLM con proyector visual: un codificador SigLIP2-400M procesa las imagenes y sus representaciones se proyectan al espacio del modelo de lenguaje MiniCPM4-3B, que genera la respuesta. El conjunto suma 4,1B parametros. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque lista `openbmb/RLAIF-V-Dataset` como dataset asociado, lo que sugiere el uso de datos de ajuste fino con retroalimentacion de IA (RLAIF) para reducir alucinaciones visuales.

La innovacion principal es la eficiencia: hereda las capacidades de imagen unica, multi-imagen y video de MiniCPM-V 2.6 (8,1B) con un coste computacional aproximadamente la mitad. La model card no especifica detalles sobre decodificacion especulativa, atencion lineal ni otras tecnicas internas del LLM base. El repositorio incluye `custom_code`, por lo que requiere `trust_remote_code=True` en transformers.

## Capacidades

- Comprension de imagen unica: descripcion, VQA, razonamiento visual y matematicas sobre figuras (MathVista).
- OCR: reconocimiento de texto en imagenes, con 852 puntos declarados en OCRBench para la version 4.0.
- Comprension multi-imagen: comparacion y razonamiento sobre varias imagenes en una misma conversacion.
- Comprension de video: analisis de secuencias de video.
- Conversacion multimodal multi-turno (pipeline `image-text-to-text`).
- Capacidades multilingues declaradas (tag `multilingual`), sin desglose por idioma en la informacion disponible.
- Extraccion de caracteristicas (`feature-extraction` como tag secundario).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, audio o agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- OCR en movil o edge: digitalizar facturas, tickets o documentos capturados con la camara del telefono. El modelo corre en un iPhone 16 Pro Max con latencia inferior a 2 s al primer token, lo que permite integracion en apps nativas.
- Asistencia a personas con discapacidad visual: descripcion en tiempo real de escenas capturadas por la camara, con respuestas rapidas y despliegue local que evita enviar imagenes a la nube.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios en plataformas, ejecutandose en servidores modestos gracias a los 4,1B parametros.
- Analisis de documentos multi-pagina: procesamiento de varias imagenes (paginas escaneadas) en una sola conversacion para extraer y resumir informacion.
- Inspeccion visual en industria: analisis de fotos de producto o de linea de produccion para detectar defectos, con despliegue on-premise por la licencia Apache 2.0.
- Analisis de video corto: resumen o respuesta a preguntas sobre grabaciones, util en monitorizacion o revision de contenido.
- Prototipado rapido de aplicaciones multimodales: al estar disponible en Ollama, llama.cpp y vLLM, sirve para validar ideas con un coste de hardware bajo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados de imagen unica declarados en la model card (version 4.0 completa; la variante int4 puede degradar ligeramente):

| Modelo | Tamano | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
|---|---|---|---|---|---|---|---|---|---|---|
| GPT-4.1-mini-20250414 | - | 68,9 | 840 | 70,9 | 49,3 | 55,0 | 74,3 | 80,9 | 60,9 | 76,0 |
| Claude 3.5 Sonnet-20241022 | - | 70,6 | 798 | 65,3 | 55,5 | 66,4 | 70,1 | 81,7 | 65,1 | 81,2 |
| Qwen2.5-VL-3B-Instruct | 3,8B | 64,5 | 828 | 61,2 | 46,6 | 51,2 | 60,0 | 76,8 | 56,3 | 81,4 |
| InternVL2.5-4B | 3,7B | 65,1 | 820 | 60,8 | 46,6 | 51,8 | 61,5 | 78,2 | 58,7 | 81,4 |
| Qwen2.5-VL-7B-Instruct | 8,3B | 70,9 | 888 | 68,1 | 51,9 | 58,0 | 69,7 | 82,2 | 64,1 | 84,3 |
| InternVL2.5-8B | 8,1B | 68,1 | 821 | 64,5 | 49,0 | 56,2 | 62,8 | 82,5 | 63,2 | 84,6 |
| MiniCPM-V-2.6 | 8,1B | 65,2 | 852 | 60,8 | 48,1 | 49,8 | 60,0 | 78,0 | 57,5 | 82,1 |
| MiniCPM-V 4.0 | 4,1B | 69,0 | 852 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo ofrece la media agregada de OpenCompass (69,0) para MiniCPM-V 4.0; el desglose por benchmark no aparece completo en la informacion disponible. No se han publicado resultados especificos de la variante int4.

## Requisitos de hardware

- VRAM estimada: el repositorio int4 ocupa 2,8 GB, por lo que la inferencia cabe en aproximadamente 3-4 GB de VRAM contando cache de atencion y overhead del runtime.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.).
- GPU profesionales: A100, H100, L40S y similares para despliegues con alta concurrencia.
- Despliegue en movil: la model card cita ejecucion en iPhone 16 Pro Max con menos de 2 s al primer token y mas de 17 token/s.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory y demo web local; existe una app iOS de codigo abierto.
- Throughput: la model card menciona "superior throughput bajo peticiones concurrentes" sin cifras concretas; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | OpenCompass | Licencia | Despliegue edge |
|---|---|---|---|---|
| MiniCPM-V 4.0 (int4) | 4,1B | 69,0 | Apache 2.0 | Si (movil, llama.cpp) |
| Qwen2.5-VL-3B-Instruct | 3,8B | 64,5 | Apache 2.0 | Si |
| InternVL2.5-4B | 3,7B | 65,1 | no disponible en la informacion | Si |
| MiniCPM-V 2.6 | 8,1B | 65,2 | Apache 2.0 | Si, con mayor coste |

MiniCPM-V 4.0 ofrece la mejor media de OpenCompass del grupo con el segundo menor numero de parametros, y la licencia Apache 2.0 facilita su uso comercial. La longitud de contexto no se detalla en la informacion disponible para ninguno de los modelos comparados.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la precision respecto a la version completa, especialmente en tareas de OCR fino y matematicas visuales; no hay benchmarks publicados de esta variante.
- Riesgo de alucinacion visual: aunque el entrenamiento con RLAIF-V busca mitigarlo (HallusionBench aparece en la evaluacion), persiste en imagenes ambiguas o de baja calidad.
- La longitud de contexto no esta documentada en la informacion disponible; conviene validarla antes de usarla con muchas imagenes o videos largos.
- El soporte multilingue esta declarado de forma generica; el rendimiento por idioma (incluido el castellano) no esta cuantificado.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica ejecutar codigo del autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes base (SigLIP2 y MiniCPM4) por si imponen condiciones adicionales.
- Para produccion con alta concurrencia, validar el throughput real en el hardware objetivo; no hay cifras publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4-int4
- GitHub: https://github.com/OpenBMB/MiniCPM-o
- Cookbook: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Wiki (chino): https://openbmb.cn/docs/
- Web de OpenBMB: https://openbmb.cn/en/
- Perfil de OpenBMB en Hugging Face: https://huggingface.co/openbmb
- Perfil de OpenBMB en Ollama: https://ollama.com/openbmb
- Demo: http://211.93.21.133:8889/
