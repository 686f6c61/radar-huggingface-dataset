# mashbox-labs/Z-Image-Turbo-TPU

## Resumen

Z-Image-Turbo-TPU es una redistribución de los pesos del modelo de generación de imágenes texto-a-imagen Z-Image-Turbo de Tongyi-MAI (Alibaba), empaquetados en el formato propietario BSHJ que consume el motor de inferencia sobre TPU `mashbox`. No se trata de un modelo nuevo ni de un fine-tuning: el repositorio contiene exclusivamente los pesos convertidos, a precisión original, del transformer de difusión, el codificador de texto y el VAE del modelo original.

El interés del repositorio es operativo: permite ejecutar Z-Image-Turbo en hardware TPU a través del motor mashbox, evitando la conversión manual desde safetensors. Cada artefacto BSHJ conserva los nombres, formas y dtypes de los tensores originales, y su cabecera documenta los shards de origen, lo que facilita la trazabilidad y la verificación frente al repositorio upstream.

La relevancia es acotada: el paquete `mashbox` en su versión 0.1.10 no incluye un comando `mashbox run` para este modelo, por lo que el repositorio es útil principalmente como fuente de pesos para integraciones propias mediante el lector BSHJ, no como una solución lista para usar. El modelo subyacente es un transformer de difusión para síntesis de imágenes, con licencia Apache-2.0 heredada del upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) con codificador de texto y VAE |
| Parametros totales | no disponible (el repositorio no publica el recuento agregado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen a precision upstream (float32 en el transformer, bfloat16 en text encoder y VAE) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | BSHJ (tres ficheros: `transformer.bshj`, `text_encoder.bshj`, `vae.bshj`) |

Detalle de los ficheros incluidos:

| Fichero | Componente | Tamano (GB) | Tensores | Precision | Origen upstream |
|---|---|---|---|---|---|
| `transformer.bshj` | Diffusion transformer | 24,62 | 521 | float32 | `transformer/diffusion_pytorch_model-0000{1,2,3}-of-00003.safetensors` |
| `text_encoder.bshj` | Codificador de texto | 8,05 | 398 | bfloat16 | `text_encoder/model-0000{1,2,3}-of-00003.safetensors` |
| `vae.bshj` | VAE (encoder y decoder) | 0,17 | 244 | bfloat16 | `vae/diffusion_pytorch_model.safetensors` |

El repositorio completo ocupa 32,8 GB.

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo upstream Tongyi-MAI/Z-Image-Turbo: un pipeline de difusión texto-a-imagen compuesto por un transformer de difusión, un codificador de texto y un VAE. El repositorio no aporta información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos deben consultarse en la model card del repositorio original.

La única innovación técnica atribuible a este repositorio es el formato BSHJ: un contenedor que preserva nombres de tensor al estilo PyTorch (`layers.0.attention.to_q.weight` en el transformer, `model.layers.0.self_attn.q_proj.weight` en el codificador de texto), formas y dtypes originales, y que se abre mediante memory map como arrays de NumPy sin copia en memoria. Cada fichero incluye en su cabecera los shards upstream de procedencia. El tokenizer, la configuración del scheduler y las configuraciones del modelo no se incluyen y permanecen en el repositorio original, en la revisión `f332072aa78be7aecdf3ee76d5c247082da564a6`.

## Capacidades

- Generación de imágenes a partir de descripciones en lenguaje natural (pipeline `text-to-image`).
- Decodificación de latentes a imagen mediante el VAE incluido (encoder y decoder en un único fichero).
- Codificación de prompts de texto mediante el codificador de texto empaquetado en bfloat16.
- Ejecución sobre TPU a través del motor mashbox, con lectura de pesos por memory map y sin copia intermedia.
- Acceso programático a tensores individuales por nombre, útil para inspección, verificación o extracción parcial de pesos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Despliegue de generación de imágenes en infraestructura TPU: el formato BSHJ evita la conversión desde safetensors y permite cargar los tres componentes directamente en el motor mashbox, siempre que se construya el pipeline alrededor del lector.
- Integración en pipelines propios de inferencia: mediante `bshj.File` y `hf_hub_download` se pueden cargar tensores concretos como arrays de NumPy, lo que facilita orquestar el pipeline de difusión con código propio cuando no existe comando de ejecución en la CLI.
- Verificación y auditoría de pesos: la cabecera de cada fichero documenta los shards upstream de origen, lo que permite comprobar la correspondencia tensor a tensor frente a los safetensors originales antes de desplegar en producción.
- Extracción selectiva de componentes: por ejemplo, reutilizar únicamente el VAE (0,17 GB) para decodificar latentes generados por otro modelo, o el codificador de texto para experimentos de embeddings de prompt.
- Investigación sobre formatos de pesos y portabilidad: el repositorio sirve como caso de estudio de un formato alternativo a safetensors y GGUF orientado a motores sobre aceleradores no GPU.
- Archivado reproducible de pesos: al fijar la revisión upstream y conservar precisión original, el repositorio actúa como snapshot verificable para reproducir resultados experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad de imagen (FID, CLIP score), latencia ni throughput, ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio está orientado a TPU: el motor mashbox es el consumidor previsto de los ficheros BSHJ y no se documenta soporte para GPU en esta distribución.
- VRAM estimada para GPU: no disponible. A modo de referencia de tamaño, los pesos suman aproximadamente 32,8 GB, de los cuales 24,62 GB corresponden al transformer en float32; una carga completa en GPU requeriría al menos esa magnitud de memoria, sin contar activaciones.
- GPU recomendadas: no disponible para esta distribución. Para el modelo upstream habría que consultar su model card.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del transformer en float32 excede la memoria de las GPU de consumo habituales, aunque no se documenta ninguna cuantización para este repositorio.
- Opciones de despliegue: motor mashbox (paquete `mashbox`, versión 0.1.10) sobre TPU, con lectura de BSHJ vía memory map. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Z-Image-Turbo-TPU (este) | Difusión text-to-image, pesos en BSHJ | no disponible | no disponible | BSHJ | Apache-2.0 | Solo pesos; sin comando de ejecución en mashbox 0.1.10; orientado a TPU |
| Tongyi-MAI/Z-Image-Turbo | Difusión text-to-image (upstream) | no disponible | no disponible | safetensors | Apache-2.0 | Incluye tokenizer, scheduler y configs; es la referencia para el pipeline completo |
| Otros modelos text-to-image de la misma categoría | Difusión text-to-image | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación numérica fiable.

## Limitaciones y advertencias

- El repositorio contiene solo pesos: no incluye tokenizer, scheduler ni configuraciones del modelo, que deben obtenerse del repositorio upstream en la revisión indicada.
- El paquete `mashbox` 0.1.10 no ofrece un comando `mashbox run` para este modelo, por lo que no hay una vía de ejecución documentada de extremo a extremo; la integración corre a cargo del usuario.
- El formato BSHJ es propietario y solo lo lee el motor mashbox; no es interoperable con ecosistemas estándar como safetensors, GGUF, Diffusers o ComfyUI sin conversión.
- El transformer se distribuye en float32 (24,62 GB), lo que encarece memoria y ancho de banda; no se documentan variantes cuantizadas.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones idiomáticas específicas de esta distribución; deben evaluarse sobre el modelo upstream.
- La licencia Apache-2.0 se hereda del repositorio original, que no incluye un fichero de licencia separado; conviene verificar los términos en la model card upstream antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se documenta soporte de GPU para esta distribución; asumir que funciona en CUDA o ROCm sin verificación previa es un riesgo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mashbox-labs/Z-Image-Turbo-TPU
- Modelo original: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/tree/f332072aa78be7aecdf3ee76d5c247082da564a6
- Lector BSHJ (código fuente): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/src/mashbox/bshj.py
- Repositorio GitHub del motor: https://github.com/mashbox-labs/mashbox
- Paquete en PyPI: https://pypi.org/project/mashbox/0.1.10/
- Perfil en X: https://x.com/mashboxgg
- Contacto: hello@mashbox.gg
