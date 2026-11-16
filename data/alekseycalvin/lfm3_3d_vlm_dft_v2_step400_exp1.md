# AlekseyCalvin/LFM3_3d_vlm_dft_v2_step400_exp1

## Resumen

LFM3_3d_vlm_dft_v2_step400_exp1 es un fine-tuning experimental del modelo vision-lenguaje LFM3-VL-2B de Liquid AI, publicado por el usuario AlekseyCalvin en Hugging Face. Se trata de un checkpoint intermedio (paso 400 de entrenamiento) de un ajuste fino orientado a tareas de vision 3D, construido sobre el modelo base LiquidAI/LFM3-1.7B-Base y el pipeline image-text-to-text. El modelo combina un decodificador de lenguaje LFM3 de 1,73 mil millones de parametros con un codificador visual de 164 millones y un proyector de 25 millones, sumando 1.918.181.888 parametros totales segun los pesos en safetensors.

La relevancia de este checkpoint es doble. Por un lado, hereda las capacidades del LFM3-VL-2B original: comprension de video, razonamiento paso a paso (thinking) y razonamiento espacial y encarnado, lo que lo hace adecuado para robótica y analisis visual en el borde. Por otro, al ser un ajuste fino experimental sobre datos 3D, su interes es principalmente de investigacion: permite evaluar como responde la arquitectura hibrida de Liquid AI a un dominio especializado, aunque carece de validacion publica y de benchmarks propios.

El modelo se distribuye bajo licencia lfm1.0, con soporte para 16 idiomas, y esta pensado para despliegue en dispositivos de borde gracias al diseno eficiente de la familia LFM3. No obstante, al tratarse de un checkpoint de investigacion con cero descargas y sin evaluaciones publicadas, debe tratarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (convoluciones con compuerta + atencion de ventana deslizante + atencion global) con codificador visual |
| Parametros totales | 1.918.181.888 (1,73B LM + 164M vision encoder + 25M proyector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, un transformer hibrido que combina 24 capas distribuidas en 13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta mezcla busca reducir el coste computacional frente a un transformer de atencion completa, manteniendo capacidad de modelado de dependencias largas. El componente visual consta de un codificador de 14 capas (con 8 capas de convolucion con compuerta, segun la model card truncada) y un proyector de 25 millones de parametros que alinea las representaciones visuales con el espacio del lenguaje.

El checkpoint es un ajuste fino del LFM3-VL-2B original sobre un dataset de vision 3D, identificado por el nombre "3d_vlm_dft_v2_step400_exp1", que sugiere una segunda version de un dataset de ajuste fino (DFT) y el paso 400 de entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en esta fase. La model card heredada menciona que el modelo original incorpora razonamiento paso a paso (thinking), comprension de video y razonamiento espacial, capacidades que presumiblemente se conservan o adaptan en este ajuste.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa entradas de texto, imagen y video para responder preguntas y generar descripciones.
- Razonamiento paso a paso (thinking mode): el modelo razona antes de responder, lo que mejora tareas visuales complejas como matematicas, graficos y problemas de varios pasos.
- Comprension de video: primera generacion de modelos de vision de LFM que acepta video como entrada (conferencias grabadas, recorridos filmados, clips de camara).
- Razonamiento espacial y encarnado: localizacion de objetos y razonamiento sobre su disposicion relativa, orientado a robotica.
- Capacidades multilingues: soporte declarado para 16 idiomas, incluido el espanol.
- Conversacion multi-turno: etiquetado como "conversational" en los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo thinking sugiere capacidad de razonamiento multi-paso, aunque no se detalla soporte de agentes.

## Casos de uso

- Analisis de video para documentacion tecnica: el modelo puede procesar un recorrido filmado con el movil y responder preguntas sobre los elementos visibles, util para inventariar equipos o documentar procesos de mantenimiento.
- Robotica de manipulacion: gracias al razonamiento espacial, puede localizar objetos y estimar su disposicion relativa para alimentar planificadores de agarre o navegacion en entornos controlados.
- Asistencia educativa sobre grabaciones: transcripcion y comprension de conferencias en video para generar resumenes o responder dudas de los estudiantes, aprovechando el modo thinking para preguntas complejas.
- Inspeccion visual en el borde: al ser un modelo de 1,92B parametros disenado para edge, puede desplegarse en dispositivos con recursos limitados para inspeccion de calidad en linea de produccion.
- Investigacion en vision 3D: como checkpoint experimental sobre datos 3D, sirve para estudiar la adaptacion de arquitecturas hibridas a dominios especializados y comparar con el modelo base.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno donde el usuario adjunta imagenes o capturas, con soporte para 16 idiomas incluido el espanol.
- Accesibilidad: descripcion de imagenes y videos para personas con discapacidad visual, con razonamiento espacial para describir la disposicion de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de ~3,9 GB en el repositorio, la inferencia en precision completa (bf16/fp16) requiere aproximadamente 4 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits podria reducirse a ~2 GB y en 4 bits a ~1,2 GB, aunque no se confirman formatos GGUF en el repositorio.
- GPU recomendadas: para precision completa, una RTX 4090 (24 GB) o A100/H100 ofrecen margen sobrado; para despliegue en borde, GPUs integradas o aceleradores de baja potencia podrian ser suficientes dada la orientacion edge del modelo.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas en precision completa, y potencialmente en GPUs integradas con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada, con custom_code); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3_3d_vlm_dft_v2_step400_exp1 | 1,92B | no disponible | lfm1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-VL-2B (modelo base) | 1,92B | no disponible | lfm1.0 | Hugging Face (oficial) |
| LiquidAI/LFM3-1.7B-Base | 1,73B | no disponible | lfm1.0 | Hugging Face (oficial) |
| Alternativas de vision-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Checkpoint experimental: se trata del paso 400 de un ajuste fino de investigacion, sin validacion publica ni benchmarks; no se recomienda su uso en produccion sin evaluacion propia.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el modelo base, podria arrastrar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo thinking puede reducir errores en tareas visuales complejas pero no los elimina.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; el soporte de 16 idiomas no garantiza calidad uniforme en todos ellos.
- Restricciones de licencia: la licencia lfm1.0 ("other") puede imponer condiciones para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de cualquier despliegue comercial.
- Caveat de produccion: el repositorio tiene cero descargas y cero likes, lo que indica ausencia de validacion por la comunidad; ademas, el uso de custom_code en transformers puede requerir confiar en codigo remoto.
- Datos de entrenamiento no documentados: se desconoce la composicion del dataset 3D, lo que dificulta evaluar su cobertura y posibles sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_vlm_dft_v2_step400_exp1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
