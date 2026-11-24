# Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-4bit

## Resumen

SenseNova-SI-1.5-InternVL3-8B es un modelo de lenguaje y visión (VLM) de 8.000 millones de parámetros desarrollado por SenseNova, construido sobre la arquitectura InternVL3 y especializado en inteligencia espacial: geometría de sólidos en 3D, rotación mental y planificación espacial. El modelo original se distribuye bajo licencia Apache 2.0 y soporta inglés y chino. La ficha que nos ocupa documenta una conversión comunitaria a 4 bits en formato MLX, publicada por el usuario Melkor01, pensada para inferencia multimodal local nativa en Apple Silicon.

La relevancia de esta variante concreta reside en su formato: MLX con cuantización afín de 4 bits (4,941 bits por peso, group_size=64, 200 matrices cuantizadas) y codificador visual conservado en BF16 sin cuantizar (340 tensores de visión, 0 NaN). El repositorio ocupa 4,58 GB y está pensado para ejecutarse con mlx-vlm 0.8.0 o superior en Macs con chip M1 a M5.

Se trata de una conversión de comunidad, no de un modelo entrenado desde cero: hereda las capacidades del checkpoint base `sensenova/SenseNova-SI-1.5-InternVL3-8B` (commit `b17da87f5b2175057e64ce85d4f4981ebd192536`) y añade el empaquetado MLX. El modelo base cuenta con 7.944.373.760 parámetros según los safetensors publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `internvl_chat`, VLM multimodal (InternVL3), transformer con codificador visual |
| Parametros totales | 7.944.373.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX afín, group_size=64, 4,941 bpw; codificador visual en BF16 sin cuantizar |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx`, `custom_code` (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `internvl_chat` de InternVL3: un codificador visual (InternViT, con archivos `configuration_intern_vit.py` en el repositorio) acoplado a un modelo de lenguaje para tareas image-text-to-text. La conversión MLX cuantiza 200 matrices del componente de lenguaje a 4 bits con tamaño de grupo 64, mientras que preserva los 340 tensores del codificador visual en BF16 para no degradar la percepción. El total de tensores del checkpoint es 1085.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base. La model card de esta conversión no documenta el proceso de entrenamiento original, solo el pipeline de conversión: `python -m mlx_vlm convert --quantize --q-bits 4 --q-group-size 64`, con stack mlx 0.32.4, mlx-vlm 0.8.1 y transformers 5.22.1.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`), con foco en razonamiento espacial.
- Razonamiento sobre geometría de sólidos en 3D, rotación mental y planificación espacial.
- Descripción de posiciones relativas de objetos en una escena (izquierda-derecha, proximidad a cámara).
- Percepción orientada a IA encarnada (embodied AI) y comprensión de escenas.
- Conversación multi-turno multimodal (etiqueta `conversational`).
- Soporte multilingüe limitado a inglés y chino.
- Servidor local compatible con API OpenAI mediante `mlx_vlm.server`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- QA espacial sobre imágenes: el modelo responde a preguntas como qué objeto está más cerca de la cámara o qué hay a su derecha, usando el codificador visual sin cuantizar para preservar la precisión en la localización de objetos.
- Robótica y agentes encarnados en prototipado: planificación espacial y comprensión de escenas en entornos simulados, ejecutando el modelo localmente en un Mac para iterar rápido sin depender de la nube.
- Análisis de geometría 3D en educación: interpretación de figuras y sólidos para asistir en ejercicios de rotación mental y visión espacial.
- Descripción automática de escenas para accesibilidad: generación de descripciones ordenadas espacialmente (de izquierda a derecha) de fotografías.
- Desarrollo y depuración local en Apple Silicon: gracias a los 4,58 GB del repositorio y los 8-16 GB de memoria unificada recomendados, permite probar pipelines multimodales en un portátil M1-M5 con mlx-vlm.
- Servicio multimodal interno: despliegue con `mlx_vlm.server` en un Mac para ofrecer un endpoint compatible con la API de OpenAI a herramientas internas que necesiten visión.
- Evaluación de cuantización: útil como referencia para medir la degradación de un VLM de 8B al pasar a 4 bits MLX frente al checkpoint BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card sí documenta verificaciones funcionales ejecutadas en Linux MLX CUDA sobre una NVIDIA A100-SXM4-80GB (80 GB de VRAM), no en Apple Silicon:

| Prueba | Estado | Resultado |
|---|---|---|
| Integridad de tensores y visión | PASS | 1085 tensores totales, 340 de visión en BF16, 0 NaN |
| Razonamiento espacial textual (temp=0.0) | PASS | 0,6 s, 115,3 tok/s |
| Imagen-a-texto con escena sintética de 3 formas | PASS | 23,7 s, 112,6 tok/s, 8,38 GB de memoria GPU pico |

El throughput en Metal (Apple Silicon) no ha sido medido en dispositivo según el autor.

## Requisitos de hardware

- Memoria unificada recomendada: 8-16 GB para texto e imágenes; 24 GB o más para alta resolución o múltiples imágenes.
- Tamaño del repositorio: 4,58 GB (pesos cuantizados a 4 bits).
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon (M1 a M5) con al menos 8 GB de memoria unificada.
- GPU dedicadas: la validación se realizó en una NVIDIA A100-SXM4-80GB mediante MLX CUDA; no se documentan requisitos para otras GPU NVIDIA.
- Despliegue: mlx-vlm 0.8.0 o superior (CLI `mlx_vlm.generate` y servidor `mlx_vlm.server`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Requisitos de software: Python 3.11 o superior, `pillow`, `huggingface_hub[hf_xet]`, `trust_remote_code=True`.
- Latencia y throughput: 115,3 tok/s en texto y 112,6 tok/s en imagen-a-texto sobre A100 con MLX CUDA; sin datos en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-SI-1.5-InternVL3-8B-MLX-4bit (esta ficha) | 7,94 B | no disponible | MLX 4 bits (4,941 bpw), visión BF16 | Apache 2.0 | Hugging Face, comunidad |
| sensenova/SenseNova-SI-1.5-InternVL3-8B (base) | 7,94 B | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face, oficial |
| Otros VLM de ~8B sobre InternVL3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión de comunidad: no es un artefacto oficial de SenseNova; la calidad depende del pipeline de cuantización de Melkor01.
- Cuantización a 4 bits: puede degradar el razonamiento espacial fino respecto al checkpoint BF16, especialmente en tareas de geometría compleja.
- Idiomas: solo inglés y chino; no hay soporte documentado de castellano.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar cargas de trabajo con entradas largas o múltiples imágenes.
- Riesgo de alucinación: inherente a los VLM; en tareas espaciales puede describir relaciones de posición incorrectas con alta confianza.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del repositorio.
- Rendimiento en Apple Silicon no verificado: las cifras publicadas corresponden a MLX CUDA sobre A100; el throughput real en Metal puede diferir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-4bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-SI-1.5-InternVL3-8B
- README en chino: https://huggingface.co/Melkor01/SenseNova-SI-1.5-InternVL3-8B-MLX-4bit/blob/main/README_CN.md
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
