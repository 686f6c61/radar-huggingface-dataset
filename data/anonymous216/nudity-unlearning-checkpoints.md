# Anonymous216/nudity-unlearning-checkpoints

## Resumen

`Anonymous216/nudity-unlearning-checkpoints` es un repositorio de checkpoints de "desaprendizaje" (unlearning) de conceptos aplicados a Stable Diffusion v1.4, orientados especificamente a la eliminacion del concepto de desnudez. No se trata de un modelo generativo nuevo, sino de una coleccion de pesos modificados que sustituyen un unico componente del pipeline original (el UNet o el text encoder) mientras el resto de componentes permanece intacto respecto a `CompVis/stable-diffusion-v1-4`.

El repositorio agrupa ocho metodos distintos de borrado de concepto, cada uno en su propia carpeta: cinco que modifican el UNet (CErode, ESD-u, SalUn, SPM y UCE) y tres que modifican el text encoder (AdvUnlearn, DES y Safe-CLIP). Cada carpeta incluye un `source.json` que documenta la procedencia de los pesos originales. Ademas, se incluye el detector NudeNet 3.4 (`320n.onnx`), presumiblemente para evaluar la eficacia del filtrado.

Su relevancia es practica para investigadores en seguridad de modelos generativos: permite comparar de forma controlada distintas tecnicas de concept erasure sobre una misma base (SD 1.4) sin tener que reentrenar ni reconstruir los pipelines. El tamano del repositorio (18,7 GB) refleja la acumulacion de multiples variantes de pesos en formato diffusers y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion v1.4 (UNet + text encoder CLIP); checkpoints de concept erasure sobre componentes individuales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (los pesos de cada metodo conservan la licencia de sus autores originales) |
| Formato de pesos | safetensors (diffusers), ONNX (detector NudeNet) |

## Arquitectura y entrenamiento

La base es Stable Diffusion v1.4, un modelo de difusion latente con un UNet como denoiser y un text encoder CLIP que condiciona la generacion. Cada checkpoint del repositorio sustituye un unico componente del pipeline original: o bien el UNet (metodos CErode, ESD-u, SalUn, SPM y UCE) o bien el text encoder (AdvUnlearn, DES y Safe-CLIP). El resto de componentes (VAE, scheduler, tokenizer y el componente no modificado) se toma de `CompVis/stable-diffusion-v1-4`.

Los metodos representados cubren enfoques distintos de concept erasure: ESD-u (Erased Stable Diffusion, fine-tuning del UNet para redirigir la prediccion del concepto), SalUn (saliency unlearning), UCE (Unified Concept Editing, edicion de pesos de cross-attention), SPM (que fusiona un LoRA en el UNet), CErode y, en el lado del text encoder, AdvUnlearn, DES y Safe-CLIP. No se documentan en la informacion disponible los detalles de entrenamiento concretos (numero de pasos, dataset, hiperparametros) de cada metodo; se remite a las publicaciones originales de cada autor. El detector NudeNet 3.4 se incluye como copia byte a byte del asset `320n.onnx` de la release `v3.4-weights` de `notAI-tech/NudeNet`.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante Stable Diffusion v1.4 con el concepto de desnudez suprimido (segun el metodo aplicado).
- Borrado de concepto selectivo: cada checkpoint permite evaluar la supresion del concepto sin alterar el resto de capacidades generativas del modelo base.
- Comparacion controlada de tecnicas: al compartir base y estructura de pipeline, permite comparativas A/B entre metodos de unlearning.
- Deteccion de desnudez: el detector NudeNet 3.4 incluido permite medir la tasa de exito del filtrado sobre imagenes generadas.
- Compatibilidad con la libreria `diffusers` para cargar los checkpoints.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Investigacion en seguridad de modelos generativos: comparar la eficacia de ocho metodos de concept erasure sobre una misma base (SD 1.4) usando el mismo pipeline y el mismo detector de evaluacion.
- Construccion de pipelines de generacion de imagenes con filtro de contenido: cargar el UNet o text encoder modificado junto con el resto de componentes originales de SD 1.4 para desplegar una variante con desnudez suprimida.
- Evaluacion cuantitativa de robustez: medir con NudeNet 3.4 la tasa de deteccion de desnudez en imagenes generadas con prompts adversarios, comparando metodos.
- Docencia y divulgacion: ilustrar como funciona el concept erasure en modelos de difusion con checkpoints listos para usar en `diffusers`.
- Benchmarking de metodos de unlearning: usar el repositorio como suite de referencia para nuevas tecnicas que quieran compararse contra ESD-u, SalUn, UCE, etc.
- Integracion en entornos de moderacion: emplear el detector NudeNet en pipelines de filtrado de imagenes generadas o subidas por usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al ser SD 1.4, la inferencia en fp16 requiere del orden de 4-6 GB de VRAM, aunque el repositorio no documenta requisitos propios.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; depende del componente cargado y de la precision empleada.
- Opciones de despliegue: `diffusers` (libreria indicada en los tags); el detector NudeNet se distribuye en ONNX, por lo que puede ejecutarse con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Componente modificado | Metodos incluidos | Licencia | Formato |
|---|---|---|---|---|---|
| Anonymous216/nudity-unlearning-checkpoints | SD 1.4 | UNet y text encoder | 8 (CErode, ESD-u, SalUn, SPM, UCE, AdvUnlearn, DES, Safe-CLIP) | other | safetensors, ONNX |
| CompVis/stable-diffusion-v1-4 | SD 1.4 | ninguno (modelo base) | no aplica | CreativeML OpenRAIL-M | safetensors, ckpt |
| Otros checkpoints de concept erasure | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros repositorios comparables en la busqueda proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: requiere combinar cada checkpoint con el resto de componentes de `CompVis/stable-diffusion-v1-4`, lo que implica aceptar tambien la licencia del modelo base.
- La licencia es "other" y los pesos de cada metodo pertenecen a sus autores originales, con sus propias licencias; el uso comercial requiere verificar cada una por separado.
- No se documentan detalles de entrenamiento, hiperparametros ni evaluacion de cada metodo en la informacion disponible.
- La eficacia del borrado de concepto puede degradarse ante prompts adversarios; no se aportan metricas de robustez.
- No se especifican sesgos conocidos ni limitaciones de idioma.
- El detector NudeNet puede producir falsos positivos y falsos negativos; su uso como unico criterio de moderacion es arriesgado.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar el despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anonymous216/nudity-unlearning-checkpoints
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Detector NudeNet 3.4 (release original): https://github.com/notAI-tech/NudeNet/releases/tag/v3.4-weights
- Libreria diffusers: https://github.com/huggingface/diffusers
