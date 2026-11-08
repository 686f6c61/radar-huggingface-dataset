# ayanoby/hexanima-moss-packs

## Resumen

HexAnima: MOSS-Image pack es un paquete de pesos convertidos para la NPU Hexagon de Qualcomm, orientado a la generación de imágenes de estilo anime en dispositivos Android con Snapdragon 8 Gen 1 y 8+ Gen 1. Lo publica el desarrollador independiente ayanoby dentro del proyecto HexAnima, una aplicación de generación de imágenes totalmente offline. No se trata de un modelo entrenado desde cero, sino de una conversión y empaquetado de MOSS-Image 5B (variante SFT, cuantización Q5_K_XL, adaptador de 4 pasos rapid-moss) junto con el codificador de texto Qwen3.5-9B y el decodificador VAE pequeño de FLUX.2.

El paquete resuelve un problema muy concreto: llevar un pipeline text-to-image de varios miles de millones de parámetros a la NPU de un teléfono móvil, con un tamaño total de unos 14 GB repartidos entre codificador de texto (6,2 GB), DiT (5,7 GB), embeddings de tokens (0,6 GB), glue (0,2 GB), refinador (0,4 GB) y contextos VAE (unos 70 MB por tamaño de imagen). Los archivos se descargan uno a uno mediante un manifest.json con reanudación y verificación sha256 desde la propia app.

Es relevante porque ejemplifica una tendencia práctica: la distribución de modelos generativos en formatos específicos de acelerador, no reutilizables por otras herramientas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y todos los componentes declaran licencia Apache-2.0. El proyecto es independiente y no está afiliado a los autores de los modelos base ni a Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: DiT (MOSS-Image 5B) + codificador de texto Qwen3.5-9B + decodificador VAE FLUX.2 small; pesos convertidos para NPU Hexagon |
| Parametros totales | No disponible de forma agregada; el componente DiT corresponde a MOSS-Image 5B y el codificador de texto a Qwen3.5-9B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_XL (DiT); el resto de componentes sin cuantizacion detallada en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete propietario para la app HexAnima (manifest.json + archivos verificados por sha256); no compatible con otras herramientas |

## Arquitectura y entrenamiento

El paquete no documenta un entrenamiento propio. Se compone de artefactos derivados de cuatro modelos base: OpenMOSS-Team/MOSS-Image-SFT (modelo de difusion con transformer, en variante SFT), darask0/MOSS-Image_4-step_adapter_lora (adaptador LoRA para generacion en 4 pasos), Qwen/Qwen3.5-9B (codificador de texto) y black-forest-labs/FLUX.2-small-decoder (decodificador VAE). Sobre esta combinacion se aplica una cuantizacion Q5_K_XL al DiT y una conversion especifica para la NPU Hexagon de Qualcomm.

La innovacion tecnica principal no esta en el entrenamiento sino en el despliegue: los pesos se empaquetan para ejecutarse en la NPU de telefonos Snapdragon 8 Gen 1 / 8+ Gen 1, con un adaptador de 4 pasos que reduce el numero de iteraciones de muestreo. El paquete incluye un refinador y contextos VAE precalculados por tamano de imagen. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en los modelos base.

## Capacidades

- Generacion de imagenes text-to-image con estetica anime; la propia documentacion indica que los prompts con estilo Danbooru (tags) funcionan mejor.
- Generacion en 4 pasos gracias al adaptador rapid-moss, lo que reduce el coste computacional en NPU.
- Ejecucion totalmente offline en el dispositivo, sin llamadas a servicios externos.
- Descarga gestionada por la app con reanudacion y verificacion de integridad sha256 mediante manifest.json.
- Soporte de multiples tamanos de imagen a traves de contextos VAE precalculados (unos 70 MB por tamano).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Generacion de ilustraciones anime en el propio telefono: la app HexAnima usa el paquete para producir imagenes a partir de tags Danbooru sin conexion, adecuado para usuarios que quieren privacidad y no depender de la nube.
- Prototipado de personajes y fan art: el adaptador de 4 pasos permite iterar prompts rapidamente en un Snapdragon 8 Gen 1, con un coste de inferencia bajo para el dispositivo.
- Demostracion de inferencia en NPU para investigacion de eficiencia: util para estudiar como se comporta un pipeline DiT de 5B cuantizado a Q5_K_XL en Hexagon.
- Aplicaciones de escritorio o moviles sin conectividad: al ser offline, encaja en entornos con red limitada o requisitos de confidencialidad.
- Evaluacion de conversiones de modelos: sirve como referencia de como empaquetar codificador de texto, DiT y VAE en un formato verificado por sha256 para distribucion movil.
- Generacion de contenido visual para juegos o prototipos indie: permite crear assets de estilo anime en el dispositivo antes de pasarlos a un pipeline de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: unos 14 GB para el paquete completo (codificador de texto 6,2 GB, DiT 5,7 GB, embeddings 0,6 GB, glue 0,2 GB, refinador 0,4 GB y contextos VAE de unos 70 MB por tamano de imagen).
- NPU: Qualcomm Hexagon de Snapdragon 8 Gen 1 y 8+ Gen 1, segun la model card.
- GPU de escritorio: no aplica; los pesos no son utilizables con otras herramientas.
- VRAM estimada: no disponible; el destino es memoria unificada del SoC movil, no VRAM dedicada.
- Despliegue: exclusivamente mediante la app HexAnima (APK desde GitHub Releases); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima: MOSS-Image pack | DiT 5B + codificador Qwen3.5-9B | No disponible | Paquete propietario para NPU Hexagon | Apache-2.0 | Hugging Face (ayanoby/hexanima-moss-packs) |
| OpenMOSS-Team/MOSS-Image-SFT | 5B (DiT) | No disponible | Pesos originales (no detallado) | No disponible en la informacion | Hugging Face |
| black-forest-labs/FLUX.2-small-decoder | No disponible | No disponible | No disponible | No disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-9B | 9B | No disponible | No disponible | No disponible en la informacion | Hugging Face |

La comparativa directa no es posible en terminos de rendimiento porque no hay benchmarks publicados. La diferencia clave frente a los modelos base es el formato: HexAnima solo funciona con su app y su NPU objetivo, mientras que los originales estan pensados para GPUs convencionales.

## Limitaciones y advertencias

- Los archivos no son utilizables con otras herramientas; solo funcionan con la app HexAnima.
- El soporte de hardware esta limitado a Snapdragon 8 Gen 1 y 8+ Gen 1; no se documentan otros SoC.
- No hay informacion sobre sesgos del modelo base ni sobre calidad o fidelidad de las imagenes generadas.
- Riesgo de alucinacion visual y de prompts mal interpretados inherente a los modelos de difusion; no cuantificado.
- Idiomas soportados no disponibles; la documentacion sugiere prompts en estilo Danbooru, habitualmente en ingles y con tags.
- Licencia Apache-2.0 declarada para todos los componentes, pero conviene revisar NOTICE.md y LICENSE para obligaciones de atribucion y cambios.
- Proyecto no oficial y no afiliado a Qualcomm, Alibaba, Black Forest Labs ni a los autores de los modelos base; el soporte depende de un unico desarrollador.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- Incluye librerias de runtime de Qualcomm AI Engine Direct bajo la Qualcomm AI Stack License, con terminos adicionales que deben revisarse.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-moss-packs
- Repositorio GitHub: https://github.com/ayanoby/hexanima/tree/main/
- Releases (APK): https://github.com/ayanoby/hexanima/releases
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Adaptador LoRA de 4 pasos: https://huggingface.co/darask0/MOSS-Image_4-step_adapter_lora
- Codificador de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- Decodificador VAE: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
