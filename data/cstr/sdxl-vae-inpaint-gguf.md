# cstr/SDXL-VAE-inpaint-GGUF

## Resumen

SDXL-VAE-inpaint-GGUF es una redistribucion en formato GGUF del VAE de SDXL (stabilityai/sdxl-vae) empaquetada como componente auxiliar para el motor de inpainting nativo de CrispEmbed. No es un modelo generativo autonomo ni un modelo de lenguaje: es el autoencoder variacional que codifica y decodifica entre espacio de pixeles y espacio latente, y que en este caso se emplea como pieza del pipeline de inpainting de CrispEmbed junto con los pesos de PixelHacker. El autor, cstr, publica copias exactas de los ficheros ya cualificados en su repositorio privado, sin recuantizar para la publicacion.

El artefacto es marcadamente experimental: segun la propia model card, los ficheros solo se ejecutan dentro del motor de inpainting nativo de CrispEmbed y detras de flags desactivados por defecto. Su interes practico es limitado fuera de ese ecosistema, pero resulta util para quien quiera inspeccionar o reproducir el componente VAE del pipeline PixelHacker/Moebius en formato GGUF con distintos niveles de precision.

El modelo tiene 83.653.863 parametros (unos 83,7 M) y el repositorio ocupa 0,6 GB, repartidos en cuatro variantes de precision: F32, F16, Q8_0 y Q4_K. La licencia es MIT, heredada del VAE original de SDXL. No hay informacion sobre idiomas, pipeline estandar ni resultados de benchmarks generativos, dado que no es un modelo de texto ni de difusion completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) de SDXL, componente latente de difusion; no disponible el detalle de capas |
| Parametros totales | 83.653.863 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/latentes, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | GGUF (variantes `sdxl-vae-f32.gguf`, `sdxl-vae-f16.gguf`, `sdxl-vae-q8_0.gguf`, `sdxl-vae-q4_k.gguf`) |

## Arquitectura y entrenamiento

Se trata del VAE de SDXL, es decir, el autoencoder que SDXL utiliza para comprimir imagenes al espacio latente y reconstruirlas. El autor no entrena ni ajusta el modelo: redistribuye los pesos originales de stabilityai/sdxl-vae tal como aparecen en el repositorio de pesos de PixelHacker, con checkpoint sha256 `a59d7ea697f2942d22002dc3469e8c53db807a6b78f7f5ec03bd4c1f70f98efe`. La conversion a GGUF se realiza con el script `models/convert-latent-inpaint-to-gguf.py` y la herramienta `crispembed-quantize` bajo la politica `inpaint-v1`.

La model card indica explicitamente que los ficheros son copias exactas de los ya cualificados y que nada se recuantizo para la publicacion. Se documentan umbrales de aceptacion medidos como coseno de la salida final (minimo sobre casos): F32 > 0,99, F16 > 0,98, Q8_0 > 0,97 y Q4_K > 0,94. Para paneles sinteticos la comparacion se hace contra el modelo original de PyTorch; para fotos reales, la region enmascarada se compara con la salida nativa en F32. La variante Q4_K solo esta cualificada emparejada con PixelHacker Q4_K. Los ficheros F32/F16/Q8_0 se comparten con Moebius y PixelHacker, con emparejamientos definidos (Moebius usa VAE F32/F16/Q8_0/Q8_0 segun su variante; PixelHacker usa F32/F16/Q8_0/Q4_K).

## Capacidades

- Codificacion y decodificacion de imagenes entre espacio de pixeles y espacio latente, como VAE de SDXL.
- Soporte de inpainting dentro del motor nativo de CrispEmbed, en combinacion con los pesos de PixelHacker.
- Cuatro niveles de precision con umbrales de fidelidad documentados (F32, F16, Q8_0, Q4_K).
- Compatibilidad con los pipelines Moebius y PixelHacker segun los emparejamientos indicados en la model card.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni agentes.
- No dispone de capacidades multilingues, vision semantica ni modo de razonamiento.

## Casos de uso

- Inpainting dentro de CrispEmbed: el VAE actua como codificador/decodificador del pipeline cuando se ejecuta el motor de inpainting nativo con los flags correspondientes; es su unico uso soportado segun la model card.
- Reproduccion del pipeline PixelHacker: permite reconstruir el componente VAE del repositorio de pesos de PixelHacker en formato GGUF para auditar o replicar resultados.
- Auditoria de precision: las variantes F32, F16, Q8_0 y Q4_K permiten comparar la fidelidad de salida frente al modelo PyTorch original usando los umbrales de coseno documentados.
- Despliegue con restricciones de memoria: la variante Q4_K ocupa 47.516.096 bytes (unos 47,5 MB), adecuada para entornos con poca memoria cuando se empareja con PixelHacker Q4_K.
- Integracion en el ecosistema Moebius: los ficheros F32/F16/Q8_0 son byte-identicos a los del repositorio privado de Moebius, lo que facilita reutilizar el mismo VAE en ambos pipelines.
- Verificacion de integridad: los hashes SHA-256 publicados por variante permiten comprobar que los pesos descargados coinciden con los cualificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta metricas de fidelidad de reconstruccion (coseno minimo de la salida final) por variante:

| Variante | Bytes | Coseno minimo | Umbral |
|---|---|---|---|
| F32 | 334.636.224 | emparejado (ver notas) | > 0,99 |
| F16 | 167.584.192 | emparejado (ver notas) | > 0,98 |
| Q8_0 | 89.278.912 | emparejado (ver notas) | > 0,97 |
| Q4_K | 47.516.096 | emparejado (ver notas) | > 0,94 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tamano de fichero, la variante Q4_K ronda los 47,5 MB y la F32 los 334,6 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer, si bien el consumo real depende del pipeline de CrispEmbed.
- GPU recomendadas: no disponible; al ser un componente auxiliar de un pipeline de difusion, la GPU debe dimensionarse para el modelo de difusion acompanante (PixelHacker o Moebius), no para el VAE.
- Cabe en GPU consumer: si, por tamano de pesos; la viabilidad practica depende del resto del pipeline.
- Opciones de despliegue: exclusivamente el motor de inpainting nativo de CrispEmbed; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Los ficheros no F32 requieren ademas la variable `CRISPEMBED_INPAINT_QUANT=1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso |
|---|---|---|---|---|
| SDXL-VAE-inpaint-GGUF (este) | 83,7 M | GGUF (F32/F16/Q8_0/Q4_K) | MIT | Componente VAE para inpainting en CrispEmbed |
| stabilityai/sdxl-vae | 83,7 M | PyTorch (diffusion_pytorch_model.bin) | MIT | VAE original de SDXL |
| VAE incluido en PixelHacker | 83,7 M | PyTorch | MIT (SDXL VAE) | Pipeline de inpainting PixelHacker |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de los umbrales de coseno documentados para las cuantizaciones GGUF.

## Limitaciones y advertencias

- Modelo experimental: segun la model card, solo funciona dentro del motor de inpainting nativo de CrispEmbed y detras de flags desactivados por defecto.
- No es un modelo de texto ni de difusion completo; no puede usarse para generacion de imagenes por si solo.
- La variante Q4_K solo esta cualificada emparejada con PixelHacker Q4_K; su uso con otros pesos no esta validado.
- Los ficheros no F32 requieren `CRISPEMBED_INPAINT_QUANT=1`, lo que anade una dependencia de configuracion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion de la comunidad.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no opera sobre texto; los riesgos se limitan a artefactos de reconstruccion en la region enmascarada.
- Licencia MIT, que permite uso comercial, pero la responsabilidad sobre los pesos originales de SDXL VAE recae en su licencia de origen (MIT) y en la redistribucion de PixelHacker.
- La fecha de creacion y actualizacion del repositorio (2026-11-02) figura en los metadatos; conviene verificar la vigencia de los hashes antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/SDXL-VAE-inpaint-GGUF
- Pesos de origen (PixelHacker): https://huggingface.co/hustvl/PixelHacker/resolve/012fd343158936a265b8a0ee38a791a7a2841f45/vae/diffusion_pytorch_model.bin
- SDXL VAE original: https://huggingface.co/stabilityai/sdxl-vae
- Documentacion de CrispEmbed citada: `docs/inpainting-cli.md` y `docs/inpainting-precision.md` (no se proporciona URL publica)
