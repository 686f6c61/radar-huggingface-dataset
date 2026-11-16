# leventkoldas/botpsy-0.8b-webgpu

## Resumen

BotPsy 0.8B WebGPU es un paquete de distribucion del modelo `qvac/BotPsy-0.8B` preparado por el usuario `leventkoldas` para su ejecucion en navegador mediante WebGPU. No se trata de un modelo nuevo ni de un fine-tune adicional: el autor ha recompilado los pesos del modelo base en un formato propietario de manifiesto y fragmentos (manifest-and-shard) que consume un runtime especifico de navegador, con verificacion de integridad SHA-256 e instalacion en OPFS (Origin Private File System). El repositorio incluye cuatro paquetes: pesos en Q8_0, pesos en Q4_K_M, una variante mixta y una torre de vision separada en bf16/f32.

El modelo base es un transformer de aproximadamente 0,8 mil millones de parametros, con etiqueta `qwen3_5` en los metadatos, lo que sugiere una arquitectura derivada de la familia Qwen 3.5. La relevancia de este repositorio es practica: demuestra un patron de despliegue de LLM pequenos directamente en el cliente, sin backend, con cuantizacion agresiva y soporte de vision, lo que habilita aplicaciones de privacidad estricta y coste de inferencia nulo en servidor.

No obstante, la informacion publicada es muy limitada: no hay datos de entrenamiento, benchmarks, idiomas soportados ni detalles de la arquitectura mas alla de la etiqueta. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y su formato no es compatible con Transformers, llama.cpp ni vLLM, lo que restringe su uso al runtime propietario del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en metadatos; detalles no disponibles) |
| Parametros totales | ~0,8 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, mixta (Q8 en proyecciones de atencion + Q4_K_M en el resto), vision en bf16/f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquetes propietarios manifest-and-shard para runtime de navegador (no Transformers, no GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base `qvac/BotPsy-0.8B` es, segun los metadatos, un transformer de ~0,8B de parametros con etiqueta de arquitectura `qwen3_5`. El repositorio de distribucion anade una torre de vision separada de 12 capas, empaquetada de forma independiente en bf16/f32, lo que indica que el modelo base incorpora capacidades multimodales (vision-lenguaje) aunque la model card no detalla como se integra esa torre en el transformer principal.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otras etapas de alineamiento, ni sobre innovaciones tecnicas del modelo base. La contribucion tecnica de este repositorio concreto es el empaquetado: cada directorio contiene un `manifest.json` que el runtime del navegador consume para verificar fragmentos mediante SHA-256 e instalarlos de forma inmutable en OPFS, lo que permite cachear los pesos en el cliente y evitar descargas repetidas.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Capacidades de vision: el repositorio incluye una torre de vision de 12 capas empaquetada aparte, lo que sugiere entrada de imagenes ademas de texto.
- Ejecucion en navegador mediante WebGPU, sin backend de servidor.
- Verificacion de integridad de pesos en cliente (SHA-256 por fragmento).
- Almacenamiento persistente en OPFS para evitar recarga de pesos.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Aplicaciones web de chat con privacidad estricta: el modelo se ejecuta integramente en el navegador del usuario mediante WebGPU, de modo que ninguna conversacion ni imagen sale del dispositivo; adecuado para sectores con requisitos de RGPD estrictos o datos sensibles.
- Asistentes integrados en paginas estaticas: al no requerir backend, se puede desplegar en CDN o GitHub Pages y el runtime descarga los pesos bajo demanda desde el repositorio de Hugging Face, eliminando coste de inferencia en servidor.
- Demo de vision en navegador: la torre de vision separada permite experimentar con tareas de descripcion de imagenes o VQA sin subir ficheros a un servidor, util para prototipos de accesibilidad (por ejemplo, describir imagenes a usuarios con discapacidad visual).
- Procesamiento de documentos locales: con la variante Q4_K_M (menor huella), se puede usar para resumir o clasificar texto introducido por el usuario en una aplicacion de escritorio web (PWA) sin conexion.
- Educacion y experimentacion: sirve como referencia para desarrolladores que quieran estudiar el patron manifest-and-shard, la verificacion SHA-256 y la instalacion en OPFS para distribuir modelos en el cliente.
- Filtrado y moderacion en el borde: un modelo pequeno en el navegador puede prefiltrar contenido antes de enviarlo a un servicio remoto, reduciendo coste y latencia en pipelines de moderacion.
- Prototipado offline-first: aplicaciones PWA que necesitan funcionar sin red tras la primera carga, aprovechando la cache persistente en OPFS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~0,8B en Q8_0 ocupa aproximadamente 0,8-0,9 GB y en Q4_K_M alrededor de 0,5 GB, pero estas cifras no las proporciona el autor.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (Chrome/Edge en Windows, macOS con Metal, Android con Vulkan). No hay lista oficial.
- Compatibilidad con GPU de consumo: previsiblemente si en GPUs integradas y dedicadas modernas con WebGPU, pero no confirmado por el autor.
- Opciones de despliegue: exclusivamente el runtime de navegador del autor que consume `manifest.json`; no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BotPsy 0.8B WebGPU (este) | ~0,8B | no disponible | manifest-and-shard para navegador | Apache-2.0 | Vision incluida, runtime propietario |
| Qwen2.5-0.5B / 1.5B Instruct | 0,5B / 1,5B | 32K (tipico en la familia) | safetensors, GGUF | Apache-2.0 | Estandar, amplio ecosistema de despliegue |
| Llama 3.2 1B Instruct | 1,2B | 128K | safetensors, GGUF | Llama 3.2 Community License | Ecosistema amplio, licencia con restricciones |
| SmolLM2-1.7B Instruct | 1,7B | 8K | safetensors, GGUF | Apache-2.0 | Orientado a dispositivo, sin vision |

La comparacion con Qwen2.5, Llama 3.2 y SmolLM2 se ofrece como referencia de categoria (modelos pequenos para dispositivo); los datos de contexto y licencia de esos modelos provienen del conocimiento general y no de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formato estandar: no se puede cargar con Transformers, llama.cpp, Ollama ni vLLM. Solo funciona con el runtime de navegador del autor.
- No se documentan idiomas soportados, contexto maximo, datos de entrenamiento ni etapas de alineamiento; evaluar su calidad en produccion requiere pruebas propias.
- Riesgo de alucinacion inherente a un modelo de ~0,8B: esperable una fiabilidad limitada en razonamiento complejo, matematicas y codigo.
- Sesgos desconocidos: al no publicarse la composicion del dataset, no es posible evaluar sesgos de genero, raza o idioma.
- La torre de vision esta empaquetada por separado y en bf16/f32; su integracion y calidad no estan documentadas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion comunitaria.
- Aunque la licencia es Apache-2.0, conviene verificar los ficheros de atribucion en `assets/` de cada paquete para confirmar las condiciones del modelo base.
- El formato de paquete propietario implica dependencia del runtime del autor; si ese runtime deja de mantenerse, los pesos quedan inutilizables sin conversion manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leventkoldas/botpsy-0.8b-webgpu
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Revision del modelo base referenciada: `24561e9681643eaf807fc28b0875210cb17f89c1`
- Manifiesto del paquete Q8_0: https://huggingface.co/leventkoldas/botpsy-0.8b-webgpu/resolve/main/botpsy-0.8b-q8_0/manifest.json
- Manifiesto del paquete Q4_K_M: https://huggingface.co/leventkoldas/botpsy-0.8b-webgpu/resolve/main/botpsy-0.8b-q4_k_m/manifest.json
- Manifiesto del paquete mixto: https://huggingface.co/leventkoldas/botpsy-0.8b-webgpu/resolve/main/botpsy-0.8b-mixed/manifest.json
- Manifiesto de la torre de vision: https://huggingface.co/leventkoldas/botpsy-0.8b-webgpu/resolve/main/botpsy-vision-bf16-f32/manifest.json
