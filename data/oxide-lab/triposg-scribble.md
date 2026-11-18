# oxide-lab/TripoSG-scribble

## Resumen

TripoSG-scribble es un modelo de generación de mallas 3D a partir de una imagen de boceto (scribble) y un prompt de texto, desarrollado originalmente por VAST-AI y redistribuido aquí por oxide-lab como un paquete de pesos canónicos para el runtime Lux3D. El modelo es una variante de doble condicionamiento de TripoSG: combina un codificador de imagen DINOv2-large, un transformer de difusión (DiT) con flujo rectificado y dos ramas de atención cruzada (texto CLIP e imagen de boceto), y un decodificador VAE basado en campos de distancia con signo (SDF) que produce la geometría final.

La relevancia de esta ficha concreta no está en el modelo en sí, sino en el formato de empaquetado: oxide-lab ha fusionado los cuatro shards originales (transformer, VAE, image encoder y text encoder) en un único `model.safetensors` de 4,38 GiB con 1.735 tensores, y ha embebido la configuración y el tokenizador CLIP en `resolved_config.json`, de modo que el runtime no necesita ficheros diffusers ni tokenizadores externos. El resultado son 2.352.592.577 parámetros almacenados en F16, con verificación byte a byte contra el checkpoint original en CPU.

El modelo genera mallas densas o jerárquicas (octree de profundidad 8) en 512 tokens latentes y 16 pasos de muestreo, con CFG destilado (`guidance_scale=0`), lo que reduce el coste de inferencia al eliminar la doble pasada habitual del classifier-free guidance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT con flujo rectificado (21 bloques) + VAE SDF + codificador DINOv2-large + codificador de texto CLIP |
| Parametros totales | 2.352.592.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por prompt de texto e imagen) |
| Tipos de cuantizacion | F16 en el paquete canónico; existe una distribución GGUF separada (`TripoSG-scribble-GGUF`) |
| Idiomas soportados | no disponible (el prompt de texto pasa por el tokenizador BPE de CLIP) |
| Licencia | MIT (componentes CLIP, DINOv2 y VAE sujetos a sus términos upstream) |
| Formato de pesos | safetensors (fichero único `model.safetensors`, 4.705.388.818 bytes, 1.735 tensores); GGUF opcional |

## Arquitectura y entrenamiento

El pipeline tiene cuatro componentes encadenados. Primero, un codificador de imagen DINOv2-large (24 capas, anchura 1024, parche 14) procesa la imagen de boceto. Segundo, un transformer de difusión de 21 bloques con flujo rectificado (rectified flow) que dispone de dos ramas de atención cruzada: una para el texto CLIP (`cross_attention_dim=768`) y otra para la imagen de boceto (`cross_attention_2_dim=1024`). Tercero, un decodificador VAE que convierte el latente en un campo de distancia con signo (SDF), del que se extrae la malla. Cuarto, un codificador de texto CLIP con su tokenizador BPE a nivel de byte.

La generación usa 512 tokens latentes y 16 pasos de muestreo. El modelo está destilado para CFG (`guidance_scale=0`), lo que significa que no requiere la segunda pasada de classifier-free guidance en inferencia. La salida puede ser malla densa o jerárquica mediante octree de profundidad 8. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card del paquete canónico no los detalla.

La aportación técnica de esta distribución es la canonicalización: los shards originales (`transformer/`, `vae/`, `image_encoder_dinov2/`, `text_encoder/`, `tokenizer/`) se fusionan en un solo safetensors sin modificar ningún valor de tensor, se registran los checksums de origen en `manifest.json` y se embebe el vocabulario y las fusiones del tokenizador CLIP en `resolved_config.json`. La validación en CPU produjo un OBJ byte-idéntico al del checkpoint original con la misma entrada, prompt y número de pasos.

## Capacidades

- Generación de mallas 3D texturizadas/geométricas a partir de una imagen de boceto y un prompt de texto (image-to-3D con doble condicionamiento).
- Control fino de la forma mediante el boceto, complementado por el prompt para el estilo y el contenido semántico.
- Generación de malla densa o jerárquica con octree de profundidad 8.
- Inferencia en 16 pasos con CFG destilado, sin segunda pasada de guidance.
- Exportación a GLB (y validación interna en OBJ).
- Ejecución nativa desde el runtime Lux3D (Rust, con feature `cuda`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking) ni de entrada de audio.
- Capacidades multilingües: no disponibles; el condicionamiento textual depende del tokenizador CLIP.

## Casos de uso

- Prototipado rápido de assets 3D en videojuegos: a partir de un boceto a lápiz del artista conceptual y un prompt descriptivo, el modelo genera una malla base en 16 pasos que se puede retocar posteriormente en Blender. La doble condicionamiento permite fijar la silueta con el boceto y el material o temática con el texto.
- Iteración de diseño industrial: un diseñador dibuja una silueta y prueba variaciones de prompt ("a cat with wings") para explorar formas sin modelar manualmente; el octree de profundidad 8 permite elegir entre malla densa (detalle) y jerárquica (rendimiento).
- Generación de contenido para impresión 3D: el decodificador SDF produce geometría cerrada y coherente, adecuada como punto de partida para reparación y laminado en herramientas de slicer.
- Poblar escenas de realidad aumentada: integración en un pipeline que recibe un boceto desde una tableta y devuelve un GLB listo para visores WebXR, aprovechando que el paquete canónico no requiere dependencias diffusers en tiempo de ejecución.
- Automatización de pipelines de assets en estudios pequeños: el runtime Lux3D permite invocar la generación desde CLI (`cargo run -p lux3d-cli --features cuda -- run triposg --mode scribble`) dentro de scripts de build, con pesos verificados por SHA-256.
- Reproducibilidad en investigación: el paquete incluye `manifest.json` y `checksums.json` con el SHA-256 de cada fichero, lo que facilita la replicación de experimentos y la auditoría de la procedencia de los pesos.
- Despliegue en entornos con requisitos de licencia permisiva: al ser MIT (con las salvedades de los componentes upstream), se puede integrar en productos comerciales sin las restricciones de licencias copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de validación reportada es la equivalencia byte a byte del OBJ generado por el paquete canónico frente al checkpoint original en CPU, con la misma entrada, prompt y número de pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete canónico en F16 ocupa 4,38 GiB de pesos; con activaciones y buffers del DiT, el VAE y los codificadores, se debe prever un margen adicional. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles en la información proporcionada. El runtime Lux3D se compila con la feature `cuda`, por lo que requiere GPU NVIDIA con CUDA.
- ¿Cabe en GPU de consumo? No confirmado. Los 4,38 GiB de pesos en F16 sugieren que una GPU con 8 GB o más podría alojarlos, pero sin datos de activaciones no se puede afirmar.
- Opciones de despliegue: runtime Lux3D (Rust, CLI `lux3d-cli`); existe una distribución GGUF separada (`TripoSG-scribble-GGUF`) que el cargador canónico prefiere sobre el safetensors si está presente en el paquete. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se conoce el número de pasos de muestreo (16) y el tamaño del latente (512 tokens), pero no se publican tiempos por paso ni mallas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Pasos | Licencia | Formato |
|---|---|---|---|---|---|
| TripoSG-scribble (esta ficha) | 2.352.592.577 | Texto + imagen de boceto | 16 (CFG destilado) | MIT | safetensors único + GGUF opcional |
| TripoSG (upstream base) | no disponible | Texto (y variantes) | no disponible | MIT | shards diffusers |
| VAST-AI/TripoSG-scribble (upstream) | no disponible | Texto + boceto | 16 | MIT | shards diffusers (`transformer/`, `vae/`, `image_encoder_dinov2/`, `text_encoder/`, `tokenizer/`) |
| TripoSG-scribble-GGUF | no disponible | Texto + boceto | 16 | MIT | GGUF cuantizado |

La diferencia principal frente al checkpoint upstream es operativa, no de capacidad: el paquete canónico elimina la dependencia de la estructura diffusers y del tokenizador externo, y añade verificación de integridad por checksum. No se dispone de datos de benchmarks que permitan comparar calidad de malla con alternativas de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al condicionarse por texto CLIP, hereda los sesgos del corpus de entrenamiento de CLIP.
- Riesgo de alucinación geométrica: como modelo generativo, puede producir mallas con topología incorrecta, partes flotantes o artefactos, especialmente con bocetos ambiguos o prompts contradictorios.
- Dependencia del boceto: la calidad de la salida está fuertemente ligada a la legibilidad y el encuadre de la imagen de entrada; no se documentan límites de resolución o formato.
- Idiomas: no se especifican; el condicionamiento textual depende del tokenizador BPE de CLIP, con cobertura limitada fuera del inglés.
- Licencia: el modelo y el código son MIT, pero el codificador CLIP, DINOv2 y el VAE conservan sus términos upstream; es necesario revisarlos antes de un uso comercial.
- Madurez del paquete: 0 descargas y 0 likes en el momento de la consulta; es una redistribución reciente (noviembre de 2026) sin adopción verificada por la comunidad.
- Dependencia del runtime: el uso documentado requiere Lux3D (Rust + CUDA); no se describe una ruta de inferencia con PyTorch o diffusers a partir de este paquete canónico.
- No apto para tareas de texto, código, razonamiento o agentes: es exclusivamente un modelo image-to-3D.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxide-lab/TripoSG-scribble
- Modelo upstream: https://huggingface.co/VAST-AI/TripoSG-scribble
- Código upstream (MIT): https://github.com/VAST-AI-Research/TripoSG
- Distribución GGUF mencionada: `TripoSG-scribble-GGUF` (referenciada en la model card, sin URL directa en la información disponible)
