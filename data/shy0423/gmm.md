# shy0423/GMM

## Resumen

GMM (shy0423/GMM) no es un modelo de lenguaje ni un generador de imagenes: es un repositorio de activos estadisticos de referencia (mezclas gaussianas, de ahi las siglas) y de pesos congelados de codificadores de representacion, pensados para la evaluacion offline de modelos generativos de imagen. En concreto, publica ficheros `SigLIP_K1.npz`, `MAE_K1.npz`, `Inception_K1.npz` y sus equivalentes `_K4.npz`, junto con `Stats.tar` (momentos de referencia congelados) y `Encoders.tar` (pesos congelados de los codificadores).

El material encaja en la linea de trabajo de FD-Loss (Jiawei-Yang) y `torch-fidelity`: en lugar de calcular distancias tipo FID contra un unico Gaussiano ajustado a las caracteristicas de un modelo de referencia, se ofrecen variantes con distinto numero de componentes (K1 y K4) para medir de forma mas fina la cobertura de modos de un generador. El repositorio ocupa 6,7 GB y fue creado el 15 de septiembre de 2026 por el usuario shy0423, con 0 descargas y 0 likes en el momento de la consulta.

Es relevante unicamente para investigadores que trabajen en metricas de evaluacion de generacion de imagenes y quieran reproducir o auditar resultados de FD-Loss. No contiene checkpoints de generadores ni de entrenamiento, por lo que no se puede usar para inferencia generativa. La model card es muy escueta: no incluye licencia, idiomas, pipeline ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo generativo. Conjunto de mezclas gaussianas de referencia ajustadas sobre caracteristicas y de codificadores de representacion congelados: ViT-SO400M/16 SigLIP 256 (webli), ViT-L/16 MAE, ViT-L/14 DINOv2 (lvd142m), ViT-L/14 CLIP (openai) y ConvNeXtV2-Base (fcmae_ft_in22k_in1k) |
| Parametros totales | no disponible (no se publica recuento; el repositorio ocupa 6,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni int8; los NPZ almacenan covarianzas crudas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible. El autor indica explicitamente que no relicencia los pesos upstream, que conservan sus licencias originales |
| Formato de pesos | NPZ (NumPy) para las mezclas gaussianas y TAR (`Stats.tar`, `Encoders.tar`) para momentos de referencia y pesos de codificadores |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de red neuronal propia. Los artefactos `*_K1.npz` y `*_K4.npz` contienen parametros de mezclas gaussianas (medias y covarianzas) ajustadas sobre las caracteristicas extraidas por cada codificador de referencia. La model card no explicita el significado exacto de K1 y K4; la lectura mas plausible es el numero de componentes gaussianas de la mezcla (1 frente a 4), pero no se confirma en la documentacion. Para la variante K4 se indica semilla 3407 y un jitter de ajuste absoluto de 1e-5, con la advertencia de que el NPZ almacena la covarianza cruda y no debe volverse a sumar el jitter.

`Stats.tar` contiene los momentos de referencia congelados y `Encoders.tar` los pesos congelados de los codificadores. Los pesos proceden de modelos timm publicos (SigLIP, MAE, DINOv2, CLIP y ConvNeXtV2) y no se han reentrenado ni ajustado segun la informacion disponible. La implementacion de referencia y las estadisticas provienen del proyecto FD-Loss y de `torch-fidelity`. No hay informacion sobre volumen de datos, composicion del dataset, regimen de entrenamiento ni tecnicas de alineacion (RLHF, DPO), porque no existe un entrenamiento de modelo generativo asociado a este repositorio.

## Capacidades

- Extraccion de caracteristicas de imagen con cinco codificadores congelados: SigLIP ViT-SO400M/16 a 256 px, MAE ViT-L/16 a 224 px, DINOv2 ViT-L/14, CLIP ViT-L/14 y ConvNeXtV2-Base.
- Calculo de distancias entre distribuciones de caracteristicas (estilo FID/FD) usando mezclas gaussianas de referencia con 1 o 4 componentes.
- Evaluacion offline de modelos generativos de imagen: comparacion de un conjunto de imagenes generadas contra los momentos de referencia congelados.
- Soporte de reproducibilidad: semilla fijada (3407) y jitter de ajuste documentado (1e-5) para la variante K4.
- Uso de la perdida asociada como objetivo diferenciable para ajuste fino de generadores, segun el proyecto upstream FD-Loss.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-generativa, tool calling, capacidades de agente, modo thinking, audio ni capacidades multilingues. No es un modelo conversacional ni un modelo de lenguaje.

## Casos de uso

- Evaluacion de modelos de difusion o GAN: cargar `SigLIP_K4.npz` o `Inception_K4.npz` y calcular la distancia entre las caracteristicas de las imagenes generadas y los momentos de referencia, obteniendo una metrica alternativa a FID mas sensible a la cobertura de modos.
- Reproduccion de resultados publicados con FD-Loss: al fijar semilla 3407 y el jitter de 1e-5, dos equipos pueden obtener valores comparables sin reajustar las gaussianas sobre su propio conjunto de datos.
- Auditoria de modelos de terceros: evaluar un checkpoint ajeno contra estadisticas de referencia congeladas, evitando que el evaluador reajuste la referencia y sesgue la comparacion.
- Diagnostico de colapso de modos: comparar la metrica K1 frente a la K4 sobre el mismo conjunto generado; una divergencia grande entre ambas suele indicar que el generador cubre mal la distribucion de referencia.
- Analisis de sensibilidad al espacio de representacion: repetir la evaluacion con SigLIP, MAE, DINOv2, CLIP y ConvNeXtV2 para comprobar si las conclusiones sobre calidad se mantienen entre codificadores.
- Ajuste fino de generadores con perdida de distribucion de caracteristicas: usar los codificadores congelados de `Encoders.tar` como extractor fijo y optimizar el generador contra la perdida FD, sin necesidad de entrenar el evaluador.
- Investigacion en metricas: estudiar el efecto del numero de componentes gaussianos (K) en la correlacion con juicios humanos, usando estos activos como linea base reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de metricas, comparaciones con FID/KID ni valores numericos de ningun conjunto de evaluacion.

## Requisitos de hardware

- Naturaleza de la carga: no es una carga de inferencia generativa, sino de extraccion de caracteristicas y ajuste/evaluacion de gaussianas. El cuello de botella es el forward pass del codificador sobre el conjunto de imagenes evaluado.
- VRAM estimada (orientativa, no publicada por el autor): los codificadores congelados son ViT-L/14 o ViT-L/16 (aproximadamente 300 millones de parametros) y ViT-SO400M/16 (aproximadamente 400 millones), que en precision fp16 ocupan del orden de 0,6 a 0,9 GB de pesos, mas activaciones y lote. ConvNeXtV2-Base es mas ligero. Estas cifras son estimaciones a partir de las arquitecturas nombradas y no datos publicados en la model card.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM permite ejecutar los codificadores con lotes moderados; una RTX 4090, A100 o H100 reduce el tiempo de evaluacion de conjuntos grandes. El proceso cabe en GPU de consumo si se reduce el tamano de lote.
- Almacenamiento: el repositorio completo ocupa 6,7 GB, mayoritariamente por `Encoders.tar` y los ficheros NPZ.
- Opciones de despliegue: no aplican servidores de inferencia de texto (vLLM, TGI, Ollama, llama.cpp). El uso previsto es Python con NumPy para los NPZ y PyTorch/timm para los codificadores, en linea con `torch-fidelity` y FD-Loss.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Alternativa | Que aporta | Parametros / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| shy0423/GMM (este repositorio) | Mezclas gaussianas de referencia K1 y K4 sobre cinco codificadores, mas pesos congelados de codificadores | NPZ + TAR, 6,7 GB | no disponible | HuggingFace, 0 descargas |
| torch-fidelity | Implementacion de referencia de FID, IS y KID con Inception | Codigo Python mas pesos Inception | licencia del proyecto torch-fidelity | GitHub publico |
| FD-Loss (Jiawei-Yang) | Metodo y estadisticas de referencia; incluye checkpoints base de generadores | Codigo mas checkpoints | no disponible en la informacion consultada | GitHub y HuggingFace (`jjiaweiyang/FD-Loss`) |
| FID / KID clasicos con Inception | Metrica estandar de la literatura, ampliamente comparable | Un unico Gaussiano (FID) o kernel (KID) | depende de la implementacion | multiples implementaciones |

## Limitaciones y advertencias

- No es un modelo utilizable para generacion, razonamiento ni conversacion: no contiene checkpoints de generador ni de entrenamiento.
- Licencia no disponible. El autor declara que no relicencia los pesos upstream, por lo que el uso comercial depende de las licencias de los modelos timm de origen (SigLIP, MAE, DINOv2, CLIP, ConvNeXtV2) y de la licencia del propio repositorio, que no se especifica. Verificar antes de cualquier uso en produccion.
- Advertencia tecnica explicita del autor: en K4 los NPZ almacenan la covarianza cruda; sumar de nuevo el jitter de 1e-5 produce un ajuste incorrecto.
- La model card no documenta el significado de K1/K4, el procedimiento de ajuste, el conjunto de datos usado para las estadisticas de referencia ni el numero de muestras. La reproducibilidad externa es limitada.
- Ausencia total de benchmarks publicados: no hay evidencia numerica de que la metrica correlacione mejor con juicios humanos que FID u otras alternativas.
- Riesgo de sesgo heredado de los codificadores upstream y de las estadisticas de referencia: si el conjunto de referencia no representa la distribucion objetivo, las distancias resultantes estaran sesgadas.
- La evaluacion con mezclas gaussianas sobre caracteristicas de modelos preentrenados puede no capturar diferencias perceptuales finas ni sesgos sociodemograficos.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin historial de mantenimiento.
- Los resultados de busqueda web obtenidos no contienen informacion relevante sobre este modelo: todas las referencias recuperadas tratan sobre Anna's Archive y no guardan relacion con el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/shy0423/GMM
- Codificador SigLIP: https://huggingface.co/timm/vit_so400m_patch16_siglip_256.v2_webli
- Codificador MAE: https://huggingface.co/timm/vit_large_patch16_224.mae
- Codificador DINOv2: https://huggingface.co/timm/vit_large_patch14_dinov2.lvd142m
- Codificador CLIP: https://huggingface.co/timm/vit_large_patch14_clip_224.openai
- Codificador ConvNeXtV2: https://huggingface.co/timm/convnextv2_base.fcmae_ft_in22k_in1k
- torch-fidelity: https://github.com/toshas/torch-fidelity
- FD-Loss (implementacion y estadisticas de referencia): https://github.com/Jiawei-Yang/FD-Loss
- Checkpoints base de generadores de FD-Loss: https://huggingface.co/jjiaweiyang/FD-Loss/tree/main/checkpoints/base
