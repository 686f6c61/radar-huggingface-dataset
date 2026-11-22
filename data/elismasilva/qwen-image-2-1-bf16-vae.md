# elismasilva/qwen-image-2.1-bf16-vae

## Resumen

`elismasilva/qwen-image-2.1-bf16-vae` es una conversion a BF16 del VAE (autoencoder variacional) que forma parte del pipeline de generacion de imagenes Qwen-Image-2.1, desarrollado originalmente por Qwen (Alibaba). No se trata de un modelo generativo completo ni de un modelo de lenguaje: es unicamente el componente de codificacion/decodificacion latente del pipeline de difusion, empaquetado en formato `diffusers` y `safetensors`.

El repositorio contiene exclusivamente el VAE extraido de la revision `d26bb61231c349cf6b7896fa83353113880e1ba3` del checkpoint original, con los 238 tensores originales en FP32 convertidos a BF16. El autor de la conversion es elismasilva, que verifica la equivalencia exacta frente al cast BF16 de la fuente y documenta la identidad de los pesos mediante `conversion_summary.json` y `SHA256SUMS`.

Su relevancia es practica: permite sustituir el VAE original por una version de menor huella de memoria en flujos de inferencia que usan el runner Qwen VMM de `ddo-examples`, manteniendo el resto de componentes (transformer, encoder de texto) del checkpoint original. Con 337,7 millones de parametros y un repo de 0,7 GB, es un artefacto de infraestructura mas que un modelo autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) para pipeline de difusion Qwen-Image |
| Parametros totales | 337.740.404 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible (componente no linguistico) |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El artefacto es la componente VAE del pipeline Qwen-Image-2.1, es decir, la red convolucional que proyecta imagenes al espacio latente y las reconstruye a pixeles. No se dispone de informacion sobre la arquitectura interna detallada (numero de bloques, canales, factor de compresion espacial) ni sobre los datos de entrenamiento originales, que corresponden al modelo base Qwen/Qwen-Image-2.1 y no se documentan en esta model card.

La unica intervencion tecnica documentada es la conversion de precision: los 238 tensores originales en FP32 se convierten a BF16, con verificacion de igualdad exacta contra el cast BF16 de la fuente. Los pesos guardados ocupan 675.508.632 bytes. No hay entrenamiento adicional, fine-tuning ni destilacion: es una conversion de formato y precision con preservacion de identidad numerica respecto al cast de referencia.

## Capacidades

- Decodificacion latente a imagen y codificacion imagen a latente dentro del pipeline Qwen-Image-2.1.
- Integracion con el runner Qwen VMM de `ddo-examples` mediante los flags `--vae-vmm-offload` y `--vae-model-path`.
- Compatibilidad con el resto de componentes del checkpoint original (transformer y encoder de texto), que deben obtenerse por separado.
- Validacion realizada en configuracion DDO Qwen Base 1024x1024, 20 pasos, seed 42, en Windows y Linux nativo.
- No soporta generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente: no es un modelo de lenguaje.
- No soporta vision en sentido de comprension de imagenes; opera como autoencoder, no como modelo multimodal.

## Casos de uso

- Sustitucion del VAE en pipelines de generacion de imagenes Qwen-Image-2.1: se descarga el repo y se apunta `--vae-model-path` al directorio local, reduciendo la huella de memoria del decodificador frente al VAE en FP32.
- Inferencia con offload de VAE en GPUs con VRAM limitada: el flag `--vae-vmm-offload` permite descargar el VAE a memoria del sistema y mantener el transformer en GPU, util en tarjetas de gama media.
- Reproduccion de estudios de features y comparativas de decodificador: el autor documento combinaciones de opciones de decodificador con comprobaciones de salida en 1024x1024, 20 pasos y seed 42.
- Despliegue en entornos Windows nativos: la validacion cubre Windows y Linux nativo, lo que facilita pipelines de escritorio o estaciones de trabajo sin contenedores.
- Auditoria de pesos: los ficheros `conversion_summary.json` y `SHA256SUMS` permiten verificar la integridad y la equivalencia numerica de la conversion en pipelines de CI.
- Experimentacion en investigacion no comercial: bajo la Qwen Research License se puede evaluar y comparar el comportamiento del decodificador en estudios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones cualitativas de runtime (DDO Qwen Base 1024x1024, 20 pasos, seed 42) sin metricas numericas como FID, PSNR o LPIPS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos BF16 ocupan aproximadamente 0,68 GB, por lo que el VAE cabe holgadamente en cualquier GPU moderna, aunque el pico de activaciones durante la decodificacion a 1024x1024 puede elevarlo.
- GPU recomendadas: no especificadas por el autor; el pipeline completo Qwen-Image-2.1 requiere ademas el transformer y el encoder, que dominan el consumo de VRAM.
- Cabe en GPU consumer: si, el VAE por si solo cabe en cualquier GPU con 4 GB o mas; el pipeline completo depende de los demas componentes.
- Opciones de despliegue: libreria `diffusers` y runner Qwen VMM de `ddo-examples`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VAE de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|
| elismasilva/qwen-image-2.1-bf16-vae | 337,7 M | safetensors BF16 | qwen-research | Requiere licencia aparte | Hugging Face |
| Qwen/Qwen-Image-2.1 (VAE original) | no disponible | safetensors FP32 | qwen-research | Requiere licencia aparte | Hugging Face |
| Otros VAE de pipelines de difusion (p. ej. SDXL VAE) | no disponible en la informacion | safetensors | variable | variable | Hugging Face |

La comparativa con VAEs de otros pipelines no puede completarse con datos verificados en la informacion proporcionada; los parametros y licencias de alternativas concretas no estan disponibles.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Research License permite investigacion y evaluacion no comercial; el uso comercial exige una licencia separada del titular original de los derechos. Esta conversion no concede derechos adicionales.
- No es un modelo autonomo: sin el transformer y el encoder del checkpoint original no genera imagenes.
- Sesgos: no documentados; al ser un componente de reconstruccion, los sesgos del pipeline dependen del modelo generativo completo.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero las opciones de decodificador pueden alterar los pixeles de salida, como advierte el autor.
- Cobertura de validacion limitada: las observaciones del autor no cubren todas las resoluciones, GPUs ni configuraciones de decodificador.
- Sin datos de benchmarks: no hay metricas objetivas de calidad de reconstruccion publicadas en este repo.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/elismasilva/qwen-image-2.1-bf16-vae
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia original: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Runner Qwen VMM (ddo-examples): https://github.com/DEVAIEXP/ddo-examples
