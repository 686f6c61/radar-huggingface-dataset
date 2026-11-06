# Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-20261106

## Resumen

ImageFusion-Show es un ajuste fino supervisado (SFT) del modelo multimodal Show-o2 de 1.5B parametros (showlab/show-o2-1.5B-HQ), orientado a la fusion de imagenes infrarrojas (IR) y visibles (VIS). El autor, identificado como Nonbiuld, lo presenta como el checkpoint final de una campana de entrenamiento sobre el dataset MSRS tras 30 epocas: 15 de entrenamiento con todos los parametros y 15 adicionales con los modulos autorregresivos y compartidos congelados, entrenando solo los modulos de difusion.

El modelo hereda la arquitectura hibrida de Show-o2, que combina un transformer autorregresivo con un cabezal de difusion para generacion de imagenes, apoyado en el VAE de Wan2.1 (congelado durante todo el proceso). El objetivo es restaurar y fusionar pares IR/VIS degradados en una unica imagen fusionada de referencia, supervisada con referencias de LRRNet y descripciones de cadena de pensamiento (CoT) sobre las modalidades.

Es relevante como ejemplo de adaptacion de un modelo fundacional multimodal generativo a una tarea de vision de bajo nivel mediante SFT, pero conviene subrayar que es un checkpoint de proyecto, no un modelo listo para produccion: el propio autor advierte que no se ha evaluado la calidad de generacion libre de imagen y texto, y que el fichero debe cargarse con el loader especifico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido autorregresivo + difusion (Show-o2), con VAE de Wan2.1 congelado |
| Parametros totales | 1.5B (heredados de showlab/show-o2-1.5B-HQ) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint no esta cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (`checkpoint-final.pt`, 18.330.548.256 bytes) con estado de optimizador y scheduler incluido |

## Arquitectura y entrenamiento

El modelo parte de Show-o2 1.5B en su variante HQ, fijada a la revision `d3a220ec55feaacbdfcb053847edee14edd4e69a`, y del commit upstream oficial `45a5a2de01d1ebd10cd5864d29310a76476cdf23`. La arquitectura combina un backbone autorregresivo (AR) con modulos de difusion (`backbone.diff_proj`, `backbone.diffusion_head_a`, `backbone.diffusion_head_b`) que generan imagenes a traves del VAE de Wan2.1, mantenido congelado. El entrenamiento se realizo en dos fases: la primera (`sft_full15`) optimizo la entropia cruzada autorregresiva y el flow matching de difusion con todos los parametros; la segunda (`sft_diffusion15`) congelo los modulos AR y compartidos y entreno unicamente los modulos de difusion, inicializandose desde el modelo completo de la primera fase, incluidos los pesos AR aprendidos.

Cada fase completo 5.625 pasos de optimizador en cuatro GPU sobre 6.000 episodios reales de MSRS. La supervision incluyo entradas IR/VIS degradadas a tamano nativo, restauracion limpia IR/VIS, referencias de fusion de LRRNet y supervision CoT sobre las tres modalidades (IR, VIS y fusion). La verificacion de integridad confirma que 771 tensores de parametros y buffers permanecen identicos respecto al checkpoint full15 y que los 139 tensores de parametros de difusion cambiaron; los 910 tensores finales se comprobaron con valores finitos. No se aplico RL en este checkpoint.

## Capacidades

- Fusion de imagenes infrarrojas y visibles: genera una imagen fusionada a partir de un par IR/VIS degradado, con supervision de restauracion limpia.
- Restauracion de imagenes: el entrenamiento incluye supervision sobre IR y VIS limpios, por lo que el modelo aprende implicitamente tareas de restauracion.
- Generacion de imagenes mediante difusion: hereda el cabezal de difusion de Show-o2 sobre el VAE de Wan2.1.
- Razonamiento multimodal con cadena de pensamiento: entrenado con supervision CoT especifica de IR, VIS y fusion.
- Generacion de texto autorregresiva: conserva los pesos AR del modelo base, aunque su calidad tras el ajuste no ha sido evaluada.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Fusion IR/VIS en vigilancia nocturna: el modelo puede combinar el detalle termico de la camara infrarroja con la textura visible para producir una imagen fusionada util en sistemas de videovigilancia con poca luz, aprovechando el entrenamiento especifico sobre MSRS.
- Restauracion previa a la fusion en pipelines de percepcion: al haberse entrenado con supervision de restauracion limpia de IR y VIS, puede integrarse como etapa de preprocesado que recupera senal antes de la fusion.
- Investigacion en fusion de imagenes: sirve como punto de partida reproducible (checkpoint con SHA256, manifiesto y estado de optimizador) para experimentos academicos sobre MSRS y comparaciones con metodos clasicos como LRRNet.
- Prototipado de modelos generativos multimodales para vision de bajo nivel: util para estudiar como un modelo fundacional generativo se adapta mediante SFT a tareas de mejora de imagen.
- Generacion de descripciones CoT de escenas IR/VIS: el modelo fue entrenado con supervision de cadena de pensamiento sobre las modalidades, lo que permite explorar la generacion de explicaciones textuales de la escena fusionada.
- Reentrenamiento y ablaciones: al incluir estado de optimizador, scheduler y RNG de cuatro rangos, permite reanudar la misma fase de entrenamiento o inicializar nuevas fases desde el modelo completo segun el proyecto.
- Docencia y divulgacion: ejemplo practico de flujo de SFT en dos etapas con congelacion selectiva de modulos en un modelo hibrido AR + difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la calidad de inferencia de generacion libre de imagen y texto no se ha evaluado y que la finalizacion del entrenamiento, las perdidas finitas y la integridad del checkpoint no establecen calidad de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 18,3 GB e incluye estado de optimizador, por lo que el modelo en si es menor, pero no se proporcionan cifras de memoria de inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizo en cuatro GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es un directorio Transformers autonomo; debe cargarse con el loader de checkpoint del proyecto (https://github.com/Reborn986/ImageFusion-Show) usando `configs/msrs/sft_diffusion.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageFusion-Show (este) | 1.5B | no disponible | Fusion IR/VIS + generacion multimodal | no disponible | Checkpoint de proyecto en HuggingFace |
| showlab/show-o2-1.5B-HQ (base) | 1.5B | no disponible | Generacion multimodal AR + difusion | no disponible | HuggingFace |
| LRRNet | no disponible | no disponible | Fusion de imagenes IR/VIS | no disponible | Referencia usada como supervision |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de generacion no evaluada: el autor advierte que la inferencia de generacion libre de imagen y texto no se ha validado; la integridad del checkpoint no implica calidad.
- Checkpoint de proyecto, no autónomo: `checkpoint-final.pt` incluye estado de optimizador, scheduler y RNG, y debe cargarse con el loader del proyecto; no funciona con `from_pretrained` de Transformers.
- Activos externos no incluidos: el VAE de Wan2.1 congelado y los activos de configuracion base estan separados y no se empaquetan con el checkpoint.
- Sin validacion independiente: no se designo un manifiesto de validacion independiente.
- Inconsistencias en los datos CoT: algunas descripciones fuente mencionan rayas horizontales mientras que el algoritmo de degradacion produce rayas verticales; esos textos se conservaron marcados para revision.
- Imagenes degradadas no identicas a las originales: se regeneraron con semillas deterministas y el autor no reclama igualdad pixel a pixel con las observadas al redactar el CoT.
- Sin RL: no se ha aplicado aprendizaje por refuerzo, por lo que no hay alineacion adicional mas alla del SFT.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con el autor y con la licencia del modelo base.
- Metadatos con rutas locales: el checkpoint incluye rutas de entrenamiento locales originales, lo que conviene revisar antes de publicar derivados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-diffusion15-20261106
- Checkpoint de la primera fase: https://huggingface.co/Nonbiuld/ImageFusion-Show-MSRS-SFT-full15-20261105
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ
- Codigo del proyecto: https://github.com/Reborn986/ImageFusion-Show
