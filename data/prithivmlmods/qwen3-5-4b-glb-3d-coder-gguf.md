# prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder-GGUF es la distribucion en formato GGUF del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un ajuste fino especializado del modelo base Qwen/Qwen3.5-4B. Lo publica el usuario prithivMLmods en Hugging Face bajo licencia Apache-2.0. El modelo resuelve un problema muy concreto: transformar descripciones en ingles de personajes, props, vehiculos, edificios o entornos en paginas HTML/JavaScript de Three.js completamente funcionales, con vista previa en navegador, animaciones opcionales y un boton de exportacion a `.glb` para motores como Godot.

Con 4.205.751.296 parametros totales, es un modelo compacto pensado para ejecutarse en hardware de consumo. El repositorio incluye cuantizaciones desde Q3_K_M (2,26 GB) hasta BF16 (8,42 GB), ademas de un proyector multimodal `mmproj-bf16` de 676 MB que habilita entrada de imagen y texto en runtimes GGUF compatibles con vision. La relevancia actual radica en que cubre un nicho poco atendido: generacion de codigo 3D procedimental listo para produccion en pipelines de videojuegos indie, con un tamano que permite inferencia local.

El modelo se evaluo con el modo thinking activado (`temperature=0.8`, `top_k=40`, `top_p=0.95`, `repeat_penalty=1.0`) y se comparo con DeepSeek V4.1 Flash 1017 en prompts complejos no vistos. Existe una version alternativa con decodificacion especulativa MTP publicada como prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B; no se detalla la variante exacta |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector mmproj en BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y Safetensors originales en 5 shards (~17,49 GB, texto FP32 y vision BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta de forma supervisada sobre un dataset especializado de pares prompt-codigo orientados a generacion de escenas Three.js y activos 3D low-poly exportables a GLB. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La pipeline declarada es `image-text-to-text`, lo que confirma que el modelo conserva la torre de vision del modelo base y puede recibir imagenes ademas de texto, aunque el caso de uso principal descrito es la generacion de codigo a partir de descripciones textuales.

La innovacion tecnica mas destacable es la integracion de un flujo completo de generacion de activos 3D dentro de una unica respuesta: el modelo produce una pagina HTML autonoma con Three.js, logica de escena, animaciones opcionales y un boton que serializa la geometria a `.glb`. El checkpoint `u008186` indica el paso de entrenamiento publicado. La variante MTP-Repacked anade decodificacion especulativa para acelerar la inferencia; la version estandar no la incorpora.

## Capacidades

- Generacion de codigo HTML/JavaScript con Three.js a partir de descripciones textuales de personajes, props, vehiculos, edificios y entornos.
- Creacion de escenas 3D procedimentales con geometria low-poly editable.
- Exportacion de activos a formato `.glb` listo para Godot y otros motores de juego.
- Generacion de animaciones opcionales dentro de la escena generada.
- Entrada multimodal imagen-texto: acepta imagenes como referencia ademas de texto (requiere el proyector `mmproj-bf16`).
- Modo thinking configurable, evaluado con `temperature=0.8`, `top_k=40`, `top_p=0.95`, `repeat_penalty=1.0`.
- Capacidades de codigo general heredadas del modelo base Qwen3.5-4B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Prototipado rapido de assets para videojuegos indie: el desarrollador describe un prop o personaje y obtiene una pagina Three.js con vista previa inmediata y boton de exportacion GLB, reduciendo el ciclo de iteracion de arte 3D.
- Generacion de escenas de entorno para Godot: el `.glb` exportado se importa directamente en el motor, lo que permite construir prototipos de niveles sin modelador humano en fases tempranas.
- Herramientas internas de diseno: integracion del modelo en un editor web que permita a disenadores no tecnicos describir activos y previsualizarlos en el navegador antes de exportarlos.
- Docencia y demostraciones de graficos 3D: generacion de ejemplos didacticos de Three.js con geometria low-poly y animaciones, utiles para explicar conceptos de renderizado y serializacion GLB.
- Generacion de variantes de assets: dado un prompt base, producir multiples versiones de un mismo objeto (distintos colores, proporciones o estilos) para poblar escenarios.
- Asistencia a artistas tecnicos: borradores de codigo Three.js que el artista tecnico refina y optimiza, aprovechando que el modelo entrega una base funcional completa en lugar de fragmentos.
- Despliegue local en estaciones de trabajo: al caber en cuantizaciones de 2,26 a 4,48 GB, puede ejecutarse con llama.cpp en portatiles con GPU modesta para generar assets sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona una evaluacion cualitativa contra DeepSeek V4.1 Flash 1017 sobre prompts complejos no vistos, pero no proporciona puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (2,71 GB de pesos mas overhead de contexto y KV cache); aproximadamente 4,5-5,5 GB con Q8_0 (4,48 GB); aproximadamente 8,5-10 GB con BF16 (8,42 GB).
- El proyector de vision `mmproj-bf16` anade 676 MB si se usa entrada de imagen.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia; cualquier GPU con 6 GB o mas es suficiente para Q4_K_M.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y del proyector mmproj), Ollama, text-generation-inference (tag declarado), transformers con los Safetensors originales.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante MTP-Repacked incorpora decodificacion especulativa, lo que sugiere una mejora de velocidad frente a esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-4B-GLB-3D-Coder (este) | 4,2 B | no disponible | GGUF, Safetensors | Apache-2.0 | Codigo Three.js y activos GLB |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Safetensors | no disponible en esta ficha | Modelo generalista multimodal |
| prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked | 4,2 B | no disponible | GGUF | Apache-2.0 | Misma tarea con decodificacion especulativa |
| DeepSeek V4.1 Flash 1017 | no disponible | no disponible | no disponible | no disponible | Referencia cualitativa usada por el autor |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun el campo `language`; los prompts en castellano pueden degradar la calidad del codigo generado.
- Es un ajuste fino muy especializado: fuera del dominio de Three.js, GLB y activos 3D su rendimiento como modelo de codigo general probablemente sea inferior al del Qwen3.5-4B base.
- Riesgo de alucinacion en APIs de Three.js y en la estructura del formato GLB; el codigo generado debe validarse antes de usarse en produccion.
- No se especifica la longitud de contexto, lo que impide planificar prompts largos con garantias.
- El repositorio ocupa 33,1 GB por acumular todas las cuantizaciones; conviene descargar solo el archivo necesario.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B, que deben verificarse por separado.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha, lo que indica ausencia de validacion por parte de la comunidad.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- El uso del modo thinking y de los parametros de muestreo recomendados es critico para reproducir la calidad reportada por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-GGUF
- Modelo base del ajuste fino: https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder
- Version con decodificacion especulativa MTP: https://huggingface.co/prithivMLmods/Qwen3.5-4B-GLB-3D-Coder-MTP-Repacked
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
