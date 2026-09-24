# Plana-Chan/sdxl-vae-fp16-fix

## Resumen

SDXL-VAE-FP16-Fix es una versión modificada del VAE (autoencoder variacional) de SDXL, diseñada para poder ejecutarse en precisión fp16 sin generar valores NaN. El modelo original, `stabilityai/sdxl-vae`, produce NaN durante la decodificación en fp16 porque las magnitudes de sus activaciones internas son demasiado grandes. Este checkpoint soluciona el problema reentrenando (finetune) el VAE para reducir esas magnitudes internas, manteniendo la salida final prácticamente idéntica.

El repositorio `Plana-Chan/sdxl-vae-fp16-fix` es una reproducción alojada por el usuario Plana-Chan del trabajo original `madebyollin/sdxl-vae-fp16-fix`. Se publica con la librería diffusers, formato safetensors y licencia MIT. Cuenta con 83.653.863 parámetros (~83,65 M) y un tamano de repositorio de 1,0 GB. No registra descargas ni likes en el momento de la consulta.

Se trata de un componente auxiliar, no de un modelo generativo completo: se usa junto a los pipelines de difusión de SDXL (base y refiner) o como VAE externo en interfaces compatibles. Su relevancia es práctica, ya que permite operar todo el pipeline SDXL en fp16 sin recurrir al flag `--no-half-vae` ni a decodificar en fp32, lo que reduce consumo de memoria y tiempo de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) para espacio latente de difusión, con bloques de atención; implementado como `AutoencoderKL` en diffusers |
| Parametros totales | 83.653.863 (~83,65 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; codifica/decodifica latentes, no secuencias de texto) |
| Tipos de cuantizacion | fp16 (objetivo del fix), fp32 y bfloat16 para decodificacion |
| Idiomas soportados | no aplica (no procesa texto; el idioma depende del modelo de difusion asociado) |
| Licencia | MIT |
| Formato de pesos | safetensors (distribucion diffusers; tambien exportado como `sdxl.vae.safetensors` para AUTOMATIC1111) |

## Arquitectura y entrenamiento

El modelo es un VAE convolucional con bloques de atención, el mismo componente que emplea SDXL para comprimir imágenes al espacio latente (codificación) y reconstruirlas desde él (decodificación). Conserva la arquitectura y el número de parámetros del VAE original de SDXL; el cambio introducido no es estructural, sino de escala de los pesos.

El proceso de creación consistió en un finetune del SDXL-VAE con tres objetivos declarados por el autor: (1) mantener la salida final igual, (2) reducir las magnitudes de las activaciones internas y (3) para ello, escalar a la baja los pesos y los sesgos de la red. El resultado es un modelo que decodifica correctamente tanto en fp32/bfloat16 como en fp16, mientras que el VAE original falla en fp16 por desbordamiento de las activaciones. El autor advierte de discrepancias leves entre la salida de esta versión y la del SDXL-VAE original, consideradas "suficientemente cercanas para la mayoría de propósitos". El checkpoint se basa específicamente en SDXL-VAE (0.9), aunque el autor indica que funciona también con SDXL 1.0.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación adicionales (RLHF/DPO), que en cualquier caso no aplican a un VAE de imagen.

## Capacidades

- Codificación de imágenes al espacio latente de SDXL y decodificación de latentes a imagen RGB.
- Decodificación en fp16 sin generar NaN, que es la innovación central frente al VAE original.
- Compatibilidad con decodificación en fp32 y bfloat16, manteniendo el comportamiento esperado en esas precisiones.
- Integración directa con la librería diffusers mediante `AutoencoderKL.from_pretrained(...)` con `torch_dtype=torch.float16`.
- Uso como VAE externo en AUTOMATIC1111 (instalación de `sdxl.vae.safetensors` en `models/VAE`), lo que permite eliminar el flag `--no-half-vae`.
- Funcionamiento conjunto con los pipelines de SDXL base y SDXL refiner, con `output_type="latent"` en el base y `denoising_start` en el refiner.
- No dispone de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de visión de alto nivel (captioning, VQA, OCR); su función es exclusivamente la reconstrucción de latentes.

## Casos de uso

- Generación de imágenes SDXL en fp16 con VRAM ajustada: al eliminar los NaN, el pipeline completo (base + refiner) puede ejecutarse íntegramente en fp16, reduciendo el consumo de memoria frente a decodificar el VAE en fp32.
- Sustitución del VAE por defecto en AUTOMATIC1111: el procedimiento documentado consiste en descargar `sdxl.vae.safetensors`, colocarlo en `stable-diffusion-webui/models/VAE`, seleccionarlo en los ajustes y retirar el flag `--no-half-vae`.
- Pipelines de producción con SDXL base + refiner: el ejemplo del autor usa 40 pasos de inferencia y `high_noise_frac = 0.7`, delegando la fase inicial al base y el refinado al refiner, con este VAE compartido entre ambos.
- Entrenamiento de LoRA o fine-tuning de SDXL: disponer de un VAE estable en fp16 evita tener que forzar fp32 en el decodificador durante las fases de validación y muestreo.
- Flujos de img2img e inpainting: el VAE realiza tanto la codificación de la imagen de entrada al latente como la decodificación final, por lo que un VAE estable en fp16 beneficia a estos pipelines de dos etapas.
- Decodificación por lotes en servidores de inferencia: al no requerir fp32, se reduce el pico de memoria y se permite mayor concurrencia por GPU, aunque no se han publicado cifras de throughput.
- Reproducción de recetas de la comunidad: sirve como sustituto directo del VAE original en configuraciones ya documentadas, sin cambios en el prompt ni en el scheduler.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, PSNR, SSIM, CLIP score, etc.) en la informacion disponible. El autor solo aporta una comparacion cualitativa de comportamiento en fp16 frente a fp32/bfloat16:

| VAE | Decodificacion en float32 / bfloat16 | Decodificacion en float16 |
|---|---|---|
| SDXL-VAE | Correcta | Genera NaN (fallo) |
| SDXL-VAE-FP16-Fix | Correcta | Correcta (sin NaN) |

El autor reconoce "ligeras discrepancias" entre la salida de esta version y la del SDXL-VAE original, sin cuantificarlas. No se dispone de medidas de latencia ni de calidad de imagen en la informacion proporcionada.

## Requisitos de hardware

- VRAM de los pesos: en fp16, aproximadamente 167 MB (83,65 M parametros x 2 bytes); en fp32, aproximadamente 335 MB (x 4 bytes). El repositorio completo ocupa 1,0 GB.
- La VRAM total necesaria depende del pipeline que lo acompaña: el VAE coexiste con el UNet y los codificadores de texto de SDXL, que dominan el consumo.
- GPU compatibles: cualquier GPU con soporte de fp16, que es justamente el escenario que el modelo habilita. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, es un componente pequeno; su proposito declarado es precisamente permitir fp16 en equipos donde antes se requeria fp32 o el flag `--no-half-vae`. No se concreta una lista de GPU soportadas.
- Opciones de despliegue: diffusers (`AutoencoderKL`), AUTOMATIC1111 como VAE externo, y cualquier interfaz que admita cargar un VAE externo en formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | fp16 sin NaN | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Plana-Chan/sdxl-vae-fp16-fix (este repo) | 83,65 M | Si | MIT (segun este repositorio) | safetensors (diffusers) | Replica alojada por un tercero; 0 descargas y 0 likes |
| madebyollin/sdxl-vae-fp16-fix | 83,65 M (misma arquitectura) | Si | no disponible en la informacion proporcionada | safetensors | Repositorio original citado por el autor del fix |
| stabilityai/sdxl-vae | 83,65 M (misma arquitectura) | No: genera NaN | no disponible en la informacion proporcionada | safetensors | VAE original de SDXL (version 0.9), base del finetune |

El modelo card menciona la existencia de un fix oficial bajo el identificador `stabilityai/sdxl-vae-fp16-fix` en el ejemplo de uso, pero no se aportan sus especificaciones, por lo que no se incluye una comparacion detallada.

## Limitaciones y advertencias

- Este repositorio es una reproduccion de terceros (`Plana-Chan`) del trabajo original de `madebyollin`; no hay confirmacion en la informacion disponible de que el contenido sea identico bit a bit al original. Para uso en produccion conviene verificar el hash de los pesos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-09-24).
- Introduce discrepancias leves respecto al VAE original de SDXL. El propio autor las describe como aceptables "para la mayoria de propositos", lo que implica que no es una sustitucion exacta.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de artefactos de reconstruccion y de diferencias de color o detalle frente al decodificador original.
- No es un modelo de lenguaje: no acepta prompts de texto, no soporta tool calling, agentes ni razonamiento, y no tiene capacidades multilingues.
- Limitacion de precision intrinseca: el objetivo es fp16; no se documenta comportamiento en int8, int4 u otras cuantizaciones.
- Restricciones de licencia: se declara MIT, lo que en principio permite uso comercial, pero la informacion disponible no incluye el texto de licencia ni aclaraciones sobre los terminos heredados del modelo base de SDXL. Conviene revisar las condiciones de `stabilityai/stable-diffusion-xl-base-1.0` antes de un despliegue comercial.
- Al no publicarse benchmarks, no hay evidencia cuantitativa de calidad de imagen (FID, PSNR) que respalde el uso en produccion frente a alternativas.
- No se especifican requisitos minimos de hardware ni cifras de latencia, por lo que el dimensionamiento debe hacerse por prueba directa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Plana-Chan/sdxl-vae-fp16-fix
- Repositorio original del fix: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- VAE original de SDXL: https://huggingface.co/stabilityai/sdxl-vae
- Hilo sobre la version base (0.9): https://huggingface.co/stabilityai/sdxl-vae/discussions/6
- Discusion sobre las diferencias de salida del fix: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/discussions/7
- Pesos en formato safetensors para AUTOMATIC1111: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/resolve/main/sdxl.vae.safetensors
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Refiner SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
