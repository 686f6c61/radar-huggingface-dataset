# DeVilDoNia/HaDeS-MOSS-Detailer

## Resumen

HaDeS MOSS Detailer v0.1 es un LoRA de 28,3 MB desarrollado por DeVilDoNia para los modelos de generacion de imagen MOSS-Image Base y MOSS-Image SFT del equipo OpenMOSS. Su funcion es anadir textura y detalle fino (poros y lineas de piel, tejidos, fibras de cuerda, pelaje, piedra) sobre imagenes generadas con estos modelos, manteniendo la composicion y los colores originales. Se trata de un adaptador pequeno, de rango 16, aplicado sobre las capas 24 a 41 del modelo base, entrenado en fp16.

El modelo resuelve un problema concreto en el flujo de trabajo de text-to-image: las imagenes generadas por MOSS-Image pueden carecer de microdetalle realista en superficies cercanas. El Detailer actua como un paso de refinado que incrementa la nitidez de bordes finos sin reestilizar la imagen, lo que lo hace util en pipelines de produccion donde se busca un acabado fotografico sin alterar el resultado compositivo.

Es relevante porque demuestra un uso practico de la tecnica de consistency models por fases (PCM) adaptada a flow matching, aplicada como LoRA sobre un modelo de difusion de imagen. El autor lo publica como primer checkpoint de un entrenamiento piloto, y lo distribuye con licencia Apache 2.0, lo que facilita su integracion en flujos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image (modelo de difusion text-to-image con flow matching) |
| Parametros totales | no disponible (fichero de 28,3 MB en fp16, rango 16, capas 24-41) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 (pesos del LoRA); el modelo base admite bf16 (moss_image_base_bf16 / moss_image_sft_bf16) |
| Idiomas soportados | no disponible (el prompt depende del text encoder Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (HaDeS-MOSS-Detailer-v0.1.safetensors) |

## Arquitectura y entrenamiento

El Detailer es un LoRA de rango 16 aplicado sobre las capas 24 a 41 de MOSS-Image Base. Se entreno como primer checkpoint de un entrenamiento de consistency models por fases (PCM, variante PCD*) adaptado a flow matching, usando MOSS-Image Base como profesor y alumno. Se tomaron 8 fases del schedule stock euler/simple de 8 pasos, con el paso del profesor sin CFG y un 10 % de condicion drop, de modo que el CFG real sigue funcionando en inferencia.

Los hiperparametros de entrenamiento fueron: learning rate 2e-5, batch de 16, resolucion de 512 px y 2.048 imagenes renderizadas por Base a 25 pasos (procedentes del entrenamiento de Turbo v2.0). El fichero publicado corresponde a la actualizacion 1.000 (4,3 s por actualizacion en una RTX 5090); checkpoints posteriores no resultaron mejores. Se guardo en fp16 porque ComfyUI en esa GPU aplica los LoRA en fp16, de modo que la exportacion fp32 del entrenamiento produce el mismo calculo. El metodo sigue Phased Consistency Models (Wang et al., 2024), sin reutilizar sus pesos.

## Capacidades

- Anade microdetalle y textura a imagenes generadas: poros y lineas de piel, tejido, fibras de cuerda, pelaje y piedra.
- Mantiene la composicion y los colores de la imagen original (cambio de saturacion dentro de aproximadamente el 1 % en los sets medidos).
- Funciona sobre MOSS-Image Base y MOSS-Image SFT, respetando el estilo propio de cada uno (SFT sigue siendo mas nitido y saturado que Base).
- Se integra en ComfyUI con nodos stock (`LoraLoaderModelOnly` seguido de `KSampler`) o con los cargadores de LoRA de HaDeS MOSS Suite.
- Ajuste de intensidad mediante strength: 0.3 para un toque ligero, 0.5 por defecto, 0.7 para textura claramente mayor.
- No es un filtro de imagen: es un LoRA sobre el modelo, por lo que puede introducir pequenos cambios de contenido (objetos, marcas, fechas) en algunos casos.

## Casos de uso

- Retoque de retratos generados: aplicar el Detailer a 0.5 sobre imagenes de MOSS-Image para recuperar poros y lineas de piel en primeros planos, manteniendo la identidad y la composicion del retrato original.
- Renderizado de producto y materiales: en imagenes de tejidos, cuero o piedra, el LoRA incrementa la nitidez de las tramas y las fibras sin alterar el color del producto, util para catalogos generados.
- Ilustracion de escenas naturales: pelaje de animales y fibras vegetales ganan detalle con strength 0.5-0.7, lo que mejora la percepcion de realismo en imagenes de 1024x1024 o 1344x1792.
- Pipeline de produccion en ComfyUI: insertar `LoraLoaderModelOnly` antes del `KSampler` en flujos existentes para anadir un paso de detalle sin cambiar el sampler ni los pasos (medido a 25 pasos, CFG 2.5, er_sde/simple, shift 5.0).
- Comparacion de variantes Base frente a SFT: usar el Detailer como capa comun para igualar el nivel de microdetalle entre ambas variantes y evaluar cual encaja mejor en un proyecto.
- Experimentacion con PCM y flow matching: servir como referencia practica de LoRA entrenado con consistency models por fases sobre un modelo de difusion de imagen, reutilizable como base para nuevos adaptadores.

## Benchmarks y rendimiento

Datos medidos por el autor comparando cada imagen con y sin Detailer, mismo modelo, prompt y semilla. La nitidez es el cociente de la dispersion del laplaciano (bordes finos); MAE es el cambio medio de pixel a 512 px (escala 0-255).

| Set | Modelo | Strength | Cambio (MAE) | Nitidez | Saturacion |
|---|---|---:|---:|---:|---:|
| 12 prompts, semilla 1001, 1024x1024 | Base | 0.3 / 0.5 / 0.7 | 4.4 / 5.2 / 7.2 | x1.05 / x1.10 / x1.21 | x0.99 / x0.99 / x1.01 |
| | SFT | 0.3 / 0.5 / 0.7 | 4.4 / 6.3 / 8.1 | x1.02 / x1.06 / x1.11 | x0.99 / x1.01 / x1.01 |
| 8 escenas, semilla 1200, 1344x1792 | Base | 0.5 | 6.3 | x1.08 | x1.01 |
| | SFT | 0.5 | 6.7 | x1.11 | x1.01 |

Como referencia de escala, MOSS-Image Base a 25 y a 50 pasos difiere en 10.5 de MAE con los mismos prompts. En las dos escenas de la escalera de intensidad, a 0.3 / 0.7: Base nitidez x0.98 / x1.12 (saturacion x1.05 / x1.08), SFT x1.03 / x1.18 (x1.00 / x1.00). Con un LoRA turbo (8 pasos, CFG 1) el efecto es minimo: aproximadamente un 3 % mas de nitidez a 0.5. No medidos: otros samplers y recuentos de pasos, tamanos superiores a 1344x1792, finetunes y merges, img2img, edicion y MOSS Control.

## Requisitos de hardware

- VRAM: no disponible de forma especifica para el LoRA; depende del modelo base MOSS-Image (bf16) y del text encoder Qwen3.5-9B y el VAE FLUX.2.
- GPU recomendadas: el autor midio el entrenamiento en una RTX 5090; para inferencia se requiere una GPU capaz de ejecutar MOSS-Image en bf16 con el text encoder de 9B.
- Cabe en GPU consumer: si, en funcion del modelo base y su cuantizacion; el LoRA en si ocupa 28,3 MB.
- Despliegue: ComfyUI con nodos stock (`LoraLoaderModelOnly` + `KSampler`) o HaDeS MOSS Suite; modelos `moss_image_base_bf16` / `moss_image_sft_bf16` de Comfy-Org/MOSS-Image.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 4,3 s por actualizacion en una RTX 5090.
- Ajustes medidos: 25 pasos, CFG 2.5, sampler `er_sde / simple`, shift 5.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HaDeS MOSS Detailer v0.1 | LoRA de detalle sobre MOSS-Image | 28,3 MB (rango 16) | no aplica | Apache 2.0 | Hugging Face |
| MOSS-Image Base (OpenMOSS-Team) | Modelo base text-to-image | no disponible | no aplica | Apache 2.0 | Hugging Face / Comfy-Org |
| MOSS-Image SFT (OpenMOSS-Team) | Modelo base afinado | no disponible | no aplica | Apache 2.0 | Hugging Face / Comfy-Org |
| LoRA turbo v2.0 del mismo autor | LoRA de aceleracion (8 pasos) | no disponible | no aplica | no disponible | HaDeS MOSS Suite |

No se dispone de datos de benchmarks comparativos con otros LoRA de detalle en la informacion proporcionada.

## Limitaciones y advertencias

- No es un filtro de imagen: al ser un LoRA sobre el modelo, puede introducir cambios de contenido. En la escena del pescador de SFT aparecio un par de tijeras a 0.5, y cambiaron una marca de reloj inventada y la ventana de fecha.
- Una escena (el pan) se movio mas en Base: MAE 23.4 y algo menos de saturacion.
- Con LoRA turbo (8 pasos, CFG 1) el efecto es muy reducido (aproximadamente 3 % mas de nitidez a 0.5); esta pensado para renders de pasos completos.
- No medido en otros samplers, recuentos de pasos, tamanos superiores a 1344x1792, finetunes, merges, img2img, edicion ni MOSS Control.
- El modelo base y el text encoder condicionan los idiomas soportados; no se detallan en la informacion disponible.
- Riesgo de alucinacion de detalles finos (marcas, objetos pequenos) derivado del propio proceso de difusion.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image (tambien Apache 2.0) y del text encoder Qwen3.5-9B.
- Es un checkpoint piloto (v0.1, actualizacion 1.000); checkpoints posteriores no resultaron mejores segun el autor.

## Enlaces

- Hugging Face: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Detailer
- Modelo base MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelos MOSS-Image en Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Resultados y scripts: https://github.com/Devildonia/HaDeS-MOSS-Suite/blob/main/tools/RESULTS.md
- Paper Phased Consistency Models: https://arxiv.org/abs/2405.18407
