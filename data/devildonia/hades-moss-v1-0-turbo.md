# DeVilDoNia/HaDeS-MOSS-v1.0-Turbo

## Resumen

HaDeS MOSS v1.0 Turbo es un checkpoint de difusion texto-a-imagen de un solo archivo para ComfyUI, publicado por el usuario DeVilDoNia. Se construye a partir de MOSS-Image-Base (OpenMOSS-Team) incorporando directamente en los pesos de difusion dos LoRAs: el LoRA DMD de ocho pasos HaDeS MOSS Turbo 8-steps v1.0 y el LoRA propio QwenLook Base. El resultado es un modelo que genera imagenes en ocho pasos de muestreo sin necesidad de cargar LoRAs adicionales en el grafo de ComfyUI.

El modelo se distribuye en dos precisiones: BF16 (10,16 GB) e int8 con rotacion Hadamard ConvRot (5,41 GB). Solo contiene el modelo de difusion; requiere por separado el codificador de texto Qwen 3.5 9B en int8 y el VAE Flux2 publicados por Comfy-Org en el repositorio MOSS-Image. La licencia es Apache 2.0.

Es relevante por su enfoque de empaquetado: convierte un flujo de trabajo con multiples LoRAs en un unico archivo reproducible con ajustes fijos (8 pasos, CFG 1,0, shift 5), lo que simplifica el despliegue y reduce la variabilidad entre entornos. Su antecesor, v0.9.4 Turbo, sigue disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (MOSS-Image-Base); 42 bloques con atencion; no se detalla el tipo exacto de backbone |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | BF16 e int8 ConvRot (rotacion Hadamard en capas lineales y atencion int8) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo parte de MOSS-Image-Base en BF16 y aplica dos LoRAs con fuerza 1,00 antes de guardar el resultado con MOSS Model Saver en BF16 con redondeo estocastico. La receta queda escrita en la cabecera del archivo bajo la clave `hades/recipe`. El primer LoRA es HaDeS MOSS Turbo 8-steps v1.0, un DMD de ocho pasos entrenado sobre Base. El segundo es QwenLook Base, un LoRA texto-a-imagen de rango 32 entrenado durante 1000 pasos a 1024 px sobre 1833 imagenes generadas por Qwen-Image-Edit 2509 (con el LoRA Qwen-Image-Lightning) a partir de escenas de MOSS-Image-SFT, cada una con su prompt de escena como caption. Este segundo LoRA no se publica por separado.

La version int8 se obtiene convirtiendo el BF16 con el mismo guardador, en el formato de los archivos `*_int8_convrot` de Comfy-Org: capas lineales de los 42 bloques en int8 con ConvRot y atencion int8, el resto en BF16, con las mismas claves, dtypes y formas que `moss_image_sft_int8_convrot`. Comparado con aplicar los dos LoRAs en vivo en ComfyUI (20 prompts, mismas semillas), el archivo empaquetado produce las mismas composiciones y nitidez similar (varianza laplaciana media 77,7 frente a 77,1), con diferencias en detalles pequenos atribuibles al redondeo amplificado por los ocho pasos. La version int8 frente a BF16 (10 prompts, semilla 1001, 1344x1792, 8 pasos, CFG 1) mantiene las composiciones con una diferencia absoluta media del 2,9 % en miniatura de 64 px, conserva el texto rotulado y una nitidez comparable (varianza laplaciana media 862 frente a 918).

## Capacidades

- Generacion texto-a-imagen con muestreo en ocho pasos y CFG 1,0.
- Composicion de escenas detalladas a partir de prompts largos y descriptivos (fotografia, retrato, paisaje, poster de viaje, anime, clave visual, blanco y negro).
- Renderizado de texto dentro de la imagen (rotulos como "OPEN" o "VISIT THE FJORDS" se mantienen legibles en las pruebas).
- Estilos variados: fotografia realista, pintura al oleo, anime, pagina de manga, still de animacion 3D, pixel art, claymation, tinta aguada, cyberpunk, libro infantil, poster de viaje.
- Integracion directa en ComfyUI mediante Load Diffusion Model o el cargador del HaDeS MOSS Suite.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de difusion para imagen.
- No se documentan capacidades multilingues explicitas; el comportamiento depende del codificador de texto Qwen 3.5 9B.

## Casos de uso

- Ilustracion editorial y conceptual: generar composiciones detalladas a 1344x1792 con prompts largos para articulos, portadas o material divulgativo, aprovechando la fidelidad a descripciones extensas observada en las muestras.
- Creacion de posters con texto integrado: producir carteles de viaje o promocionales donde el rotulo debe quedar legible, dado que el modelo conserva el texto en las pruebas documentadas.
- Prototipado rapido de estilos visuales: iterar sobre estetica fotografica, anime, manga, pixel art o claymation con un unico checkpoint y sin cambiar de LoRA entre generaciones.
- Produccion de arte de concepto para videojuegos o animacion: generar claves visuales y stills 3D coherentes con una direccion de arte descrita en el prompt.
- Automatizacion de pipelines en ComfyUI: al ser un solo archivo con ajustes fijos (8 pasos, CFG 1), reduce la configuracion del grafo y facilita la reproducibilidad en entornos de CI o produccion por lotes.
- Despliegue con restricciones de VRAM: la variante int8 de 5,41 GB permite ejecutar el modelo de difusion en GPU con menos memoria, manteniendo composiciones equivalentes al BF16.
- Generacion de material grafico para publicaciones seriadas (libros infantiles, tiras de manga, infografias) gracias a la variedad de estilos cubiertos en la evaluacion del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la informacion disponible. El autor aporta comparaciones internas cualitativas y metricas de similitud:

| Comparacion | Metrica | Resultado |
|---|---|---|
| Empaquetado frente a LoRAs en vivo (20 prompts) | Varianza laplaciana media | 77,7 frente a 77,1 |
| int8 frente a BF16 (10 prompts) | Diferencia absoluta media en miniatura 64 px | 2,9 % (rango 1,3-4,2 %) |
| int8 frente a BF16 | Varianza laplaciana media | 862 frente a 918 |
| Reproducibilidad | Re-render con misma semilla | Pixel-identico en el mismo setup |

No se midio velocidad ni throughput como benchmark para esta model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el archivo BF16 pesa 10,16 GB y el int8 5,41 GB, a lo que hay que sumar el codificador de texto Qwen 3.5 9B int8 y el VAE Flux2, que se cargan por separado.
- GPU recomendadas: no especificadas por el autor. Por tamano, el BF16 encaja en GPU de 24 GB o mas (RTX 4090, A100, H100); el int8 facilita su uso en GPU de 16 GB o menos, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: previsiblemente si, en RTX 4090 con BF16 y en GPU de gama media-alta con int8, sujeto a la memoria adicional del codificador y el VAE.
- Opciones de despliegue: ComfyUI (Load Diffusion Model o MOSS Loader del HaDeS MOSS Suite). La version int8 requiere una build de ComfyUI reciente capaz de cargar archivos `*_int8_convrot`. No se documentan otros runners (vLLM, llama.cpp, TGI no aplican a difusion).
- Latencia y throughput: no medidos como benchmark en la model card; dependen de la version de ComfyUI y de la configuracion de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaDeS MOSS v1.0 Turbo | no disponible | no aplica | 8 pasos, CFG 1; sin benchmarks publicos | Apache 2.0 | Hugging Face, single-file ComfyUI |
| MOSS-Image-Base (OpenMOSS-Team) | no disponible | no aplica | modelo base sin destilacion turbo | no disponible | Hugging Face |
| HaDeS MOSS v0.9.4 Turbo (mismo autor) | no disponible | no aplica | version previa, 8 pasos | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar cuantitativamente con alternativas de la misma categoria; la comparacion disponible es cualitativa y se limita a las variantes del propio linaje MOSS-Image.

## Limitaciones y advertencias

- Solo contiene el modelo de difusion: no incluye el codificador de texto ni el VAE, que deben descargarse por separado desde Comfy-Org/MOSS-Image.
- Los ajustes de referencia (8 pasos, CFG 1,0, shift 5, 1344x1792) son los unicos medidos; otros conteos de pasos, CFG superior a 1 y otros tamanos no se han evaluado en esta model card.
- El autor observa, sin medicion formal, que rinde mejor por encima de 1,5 MP y que CFG entre 1,2 y 1,5 puede convenir.
- El redondeo amplificado por los ocho pasos puede alterar detalles pequenos (en una prueba desaparecio una pistola en una mano; en otra un pastor gano un baston).
- Riesgo de alucinacion visual: textos inventados pueden leerse de forma distinta entre variantes BF16 e int8.
- No hay datos publicados sobre sesgos demograficos, culturales o de representacion.
- No se documenta el soporte multilingue de los prompts; depende del codificador Qwen 3.5 9B.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base MOSS-Image-Base y de los componentes auxiliares (codificador y VAE) antes de produccion.
- El LoRA QwenLook Base no se publica por separado y su receta de entrenamiento solo se describe de forma resumida.
- La version int8 exige una build reciente de ComfyUI; en versiones antiguas puede no cargar.
- El rendimiento y la latencia no se han medido como benchmark, por lo que las estimaciones de produccion son inciertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v1.0-Turbo
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA HaDeS MOSS Turbo 8-steps v1.0: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Version previa HaDeS MOSS v0.9.4 Turbo: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo
- Componentes de Comfy-Org (codificador de texto y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Manifiesto de muestras y ajustes: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v1.0-Turbo/blob/main/assets/manifest.json
