# AEUPH/illustrious-xl-unet-gguf

## Resumen

`AEUPH/illustrious-xl-unet-gguf` es una reempaquetación en formato GGUF del UNet del modelo de difusión Illustrious XL v0.1 (línea `illustriousXL_v01`), cuyo base_model declarado es `OnomaAIResearch/Illustrious-xl-early-release-v0`. No es un modelo de lenguaje ni un modelo completo de generación de imágenes: contiene exclusivamente los pesos del UNet (2.567.463.684 parámetros, 1680 tensores) en tres niveles de precisión (Q4_0, Q8_0 y F16). Los dos codificadores de texto (CLIP-L y OpenCLIP-G) y el VAE no están incluidos y deben tomarse de un checkpoint SDXL o Illustrious XL que el usuario ya tenga.

El objetivo del autor es reducir el componente más pesado del pipeline SDXL —el UNet, unos 4,78 GiB en F16— a 1,79 GiB (Q4_0) o 2,83 GiB (Q8_0), manteniendo los codificadores de texto a precisión completa. Esto permite ejecutar generación de imágenes 1024x1024 en GPUs con poca VRAM mediante ComfyUI y la extensión ComfyUI-GGUF.

Su relevancia es de nicho pero concreta: es una cuantización verificada de un modelo anime muy utilizado (Illustrious XL), publicada con hashes MD5, con registro de la comprobación de carga en una GTX 1050 Ti (sm_61) y con una licencia derivada restrictiva (Fair AI Public License 1.0-SD) que conviene leer antes de cualquier uso en producción. La adopción es mínima: 1 descarga y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion SDXL (`stable-diffusion-xl-v1-base`); `model_channels` 320, `context_dim` 2048, `in_channels` 4 |
| Parametros totales | 2.567.463.684 (1680 tensores, solo UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica al modelo en si; el condicionamiento lo aportan los codificadores de texto externos (CLIP-L + OpenCLIP-G, hasta 77 tokens cada uno) |
| Tipos de cuantizacion | Q4_0, Q8_0 y F16. Layouts mixtos: Q4_0 = 743 tensores Q4_0 + 937 F16; Q8_0 = 743 Q8_0 + 937 F16; F16 = 1680 F16 |
| Idiomas soportados | no disponible (el UNet no procesa texto; los codificadores de texto no se incluyen) |
| Licencia | Fair AI Public License 1.0-SD (`license: other`), texto completo en `LICENSE` del repositorio |
| Formato de pesos | GGUF (un unico fichero UNet por cuantizacion) |
| Tamano de los ficheros | Q4_0: 1.79 GiB (1.925.642.304 B); Q8_0: 2.83 GiB (3.041.966.144 B); F16: 4.78 GiB (5.135.073.344 B) |
| Componentes incluidos | solo UNet; CLIP-L, OpenCLIP-G y VAE quedan fuera |
| Modelo base | `OnomaAIResearch/Illustrious-xl-early-release-v0` (Illustrious XL v0.1) |
| Tamano total del repositorio | 10.1 GB |
| Libreria declarada | diffusers (con `pipeline_tag: text-to-image`) |

## Arquitectura y entrenamiento

La arquitectura es la del UNet de SDXL: una red convolucional con bloques residuales, mecanismos de atencion cruzada con `context_dim` 2048 y condicionamiento temporal, con 4 canales de entrada (latentes) y 320 canales base. El autor no ha entrenado, fusionado ni modificado ningún peso: únicamente ha reducido su precisión numérica, por lo que no hay dataset de entrenamiento ni proceso de ajuste que describir en esta ficha más allá del entrenamiento original de Illustrious XL por parte de OnomaAI, no detallado en la información disponible.

El detalle técnico reseñable es la conversión. Se realizó con un extractor en streaming que lee los tensores `model.diffusion_model.*` desde un `mmap` de uno en uno (pico de RAM de un tensor, no del checkpoint completo de ~7 GB), los escribe con `raw_dtype=` para que el escritor GGUF acepte la carga cuantizada y elimina el prefijo `model.diffusion_model.` porque el cuantizador de llama.cpp rechaza nombres de más de 64 caracteres. Los 937 tensores que permanecen en F16 incluso en las builds cuantizadas son los sesgos 1-D y las 51 convoluciones 4-D (`(320, 4, 3, 3)` o similares), que no cumplen el requisito de longitud de fila divisible por 32 de los bloques Q4_0/Q8_0. La verificación de carga se hizo con `gguf_sd_loader` de ComfyUI-GGUF y `model_config_from_unet` de ComfyUI, detectando correctamente arquitectura SDXL y 1680 claves.

## Capacidades

- Generación de imágenes texto-a-imagen de estilo anime/ilustración, heredadas de Illustrious XL v0.1, trabajando con latentes de 4 canales y resolución nativa de 1024x1024 en el pipeline SDXL.
- Funciona como sustituto directo del UNet en cualquier grafo SDXL estándar (`UnetLoaderGGUF` → `DualCLIPLoader` → `VAELoader` → `EmptyLatentImage` → `KSampler` → `VAEDecode`).
- Compatibilidad con LoRA cuando se usa la variante Q8_0, que el autor describe como «LoRA-safe» por su error de peso de aproximadamente el 0,5 %.
- Cuantización mixta con convoluciones y sesgos en F16: preserva exactitud en las capas más sensibles al redondeo.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni soporte de agentes: es exclusivamente un UNet de difusión.
- No incluye capacidades multilingües propias; la interpretación del prompt depende íntegramente de los codificadores de texto que aporte el usuario.

## Casos de uso

- Generación de ilustración anime en equipos con poca VRAM: con la variante Q4_0 (1,79 GiB) más codificadores y VAE externos, el pipeline completo cabe en GPUs de 4-6 GB, como la GTX 1050 Ti en la que el autor verificó la carga.
- Integración en ComfyUI como reemplazo del cargador de UNet: útil para flujos de trabajo ya construidos sobre SDXL/Illustrious, donde solo cambia el nodo `UnetLoaderGGUF` y se mantiene el resto del grafo intacto.
- Ajuste fino con LoRA sobre un UNet cuantizado en Q8_0, aprovechando que el error de peso declarado (~0,5 %) se considera tolerable para entrenamiento de adaptadores de bajo rango.
- Prototipado rápido de pipelines de generación de personajes consistentes: la combinación de UNet cuantizado y LoRA permite iterar estilos y personajes en hardware de gama media sin reentrenar el modelo base.
- Producción de assets para videojuegos o cómics de bajo presupuesto: generación por lotes en 1024x1024 con un coste de VRAM reducido, siempre que se respeten las condiciones de la licencia.
- Despliegue en servidores modestos o estaciones de trabajo sin GPU de datacenter, donde el ahorro de 3 GiB de VRAM (Q4_0 frente a F16) permite mantener más procesos en paralelo o aumentar el tamaño de lote.
- Archivado y distribución eficiente del modelo: los ficheros GGUF reducen el peso descargable de 4,78 GiB a 1,79-2,83 GiB, con hashes MD5 publicados para verificar la integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, evaluaciones estéticas ni comparativas numéricas de calidad frente a otros modelos o cuantizaciones. Tampoco se aportan datos de latencia (iteraciones por segundo) ni de throughput; la única verificación reportada es funcional (carga correcta del GGUF y detección de arquitectura SDXL en una GTX 1050 Ti).

## Requisitos de hardware

- VRAM del UNet sola (dato declarado): Q4_0 1,79 GiB, Q8_0 2,83 GiB, F16 4,78 GiB.
- VRAM del pipeline completo (estimación propia sumando codificadores de texto CLIP-L y OpenCLIP-G en FP16 y el VAE, más activaciones a 1024x1024 y lote 1; estos componentes no se declaran en la model card y se asumen los tamaños estándar de SDXL): aproximadamente 4,5-5 GB en Q4_0, 5,5-6 GB en Q8_0 y 7,5-8 GB en F16.
- GPU verificada por el autor: GTX 1050 Ti (sm_61), suficiente para cargar los ficheros.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 8 GB o superiores para Q8_0; tarjetas de 4-6 GB (GTX 1650, GTX 1050 Ti, RTX 3050) para Q4_0 con margen muy ajustado.
- GPU de datacenter (A100, H100) no son necesarias: el modelo es pequeño (2,57 B parámetros en el UNet) y el cuello de botella es la VRAM, no el cómputo.
- Opciones de despliegue: ComfyUI con la extensión ComfyUI-GGUF (la ruta indicada por el autor); stable-diffusion.cpp admite GGUF para difusión y es una alternativa razonable, aunque no está citada en la model card. vLLM y TGI no son aplicables.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros (UNet) | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|
| Este repositorio (Q4_0) | 2,567 B | GGUF, 1,79 GiB | FAIPL 1.0-SD | UNet sola; codificadores y VAE externos |
| Este repositorio (Q8_0) | 2,567 B | GGUF, 2,83 GiB | FAIPL 1.0-SD | Opcion recomendada por el autor; «LoRA-safe» |
| Este repositorio (F16) | 2,567 B | GGUF, 4,78 GiB | FAIPL 1.0-SD | Practicamente equivalente al checkpoint de origen |
| `OnomaAIResearch/Illustrious-xl-early-release-v0` (original) | no disponible en la informacion | safetensors, pipeline SDXL completo | no disponible | Modelo fuente; incluye codificadores y VAE |
| Otras cuantizaciones GGUF de UNet SDXL (por ejemplo las de city96) | ~2,567 B (UNet SDXL estandar) | GGUF | depende del modelo de origen | Misma estrategia de cuantizacion del UNet |
| `Pony Diffusion V6 XL` (alternativa de la misma categoria) | no disponible en la informacion | safetensors / GGUF de terceros | no disponible | Especializado en anime/ilustracion, pero con licencia y resultados no verificados aqui |

Los datos de los modelos de comparacion que no aparecen en la model card se marcan como «no disponible» para no introducir cifras sin respaldo.

## Limitaciones y advertencias

- No es un modelo autónomo: sin codificadores de texto (CLIP-L, OpenCLIP-G) y VAE externos, los ficheros GGUF no generan nada por si solos.
- Requiere ComfyUI-GGUF; no se indica compatibilidad con otras herramientas y la model card solo documenta el flujo de ComfyUI.
- Adopcion practicamente nula (1 descarga, 0 likes), por lo que no existe validacion por parte de la comunidad ni reportes de fallos más alla de los del propio autor.
- Riesgo de sesgos y de contenido inapropiado heredado del modelo base anime; no se documenta ningún mecanismo de filtrado ni de moderación.
- Riesgo de alucinacion visual (artefactos, anatomia incorrecta, perdida de detalle) inherente a la cuantizacion Q4_0, que el autor sitúa como opción solo cuando la VRAM es la restricción.
- Licencia: Fair AI Public License 1.0-SD, que el propio autor describe explicitamente como no equivalente a una licencia de software libre. Incluye una sección de usos prohibidos (uso ilegal, dano o explotacion de menores, desinformacion, doxxing, acoso, decisiones automatizadas que afecten a derechos legales, discriminacion, consejo medico, apoyo a decisiones de aplicacion de la ley, inmigracion o asilo).
- Los terminos concretos de uso comercial no se detallan en la model card; deben consultarse en el fichero `LICENSE` del repositorio. Se marcan como «no disponible» a efectos de esta ficha.
- Redistribucion permitida solo si el texto de la licencia acompaña al modelo derivado y se mantiene la misma licencia.
- Es una cuantizacion no oficial: no esta respaldada ni afiliada a OnomaAI, segun declara el autor.
- No se documentan idiomas de prompt soportados ni calidad comparativa frente al checkpoint original en F16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AEUPH/illustrious-xl-unet-gguf
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Licencia Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
- Extension necesaria para ComfyUI: https://github.com/city96/ComfyUI-GGUF
- Hashes MD5 declarados: `984ddebd09ab809fdf88704b323766be` (F16), `3b7a379bbec8abce279c54ac257f0886` (Q8_0), `aab1e568070f113647aa4c4725278d97` (Q4_0)
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente sitios de contenido para adultos sin relacion alguna con el repositorio, por lo que no se incluyen como enlaces.
