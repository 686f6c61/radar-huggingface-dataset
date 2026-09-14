# koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned

## Resumen

MiniMax H3 int4 W4A8 ConvRot Pruned es un paquete de pesos cuantizados y componentes auxiliares derivados de MiniMax H3, un modelo omni-modal de generacion de video con audio estereo sincronizado publicado originalmente por MiniMaxAI. El repositorio lo mantiene el usuario koongrizzly y no es un modelo entrenado desde cero, sino una redistribucion optimizada para memoria: transformers de difusion podados y cuantizados en formato W4A8 (pesos INT4, activaciones INT8) con ConvRot, un text encoder tambien en W4A8, una VAE de video en precision mixta FP16/FP32 y una VAE de audio en FP32.

El objetivo declarado es hacer viable la inferencia local de MiniMax H3 en GPU de consumo, donde los componentes en precision completa requieren una cantidad muy elevada de VRAM y memoria de sistema. Las conversiones INT4/W4A8 proceden del trabajo de Winnougan, la version hibrida de berryber09 y el Turbo LoRA de larryvrh; koongrizzly aporta el empaquetado, la conversion de la VAE de video a precision mixta y la integracion con su aplicacion standalone.

La relevancia actual del repositorio es practica mas que cientifica: agrupa en un unico paquete (60,5 GB) los componentes necesarios para ejecutar generacion text-to-audio-video, first/last-frame-to-audio-video y reference-to-audio-video con requisitos de memoria reducidos. No se dispone de informacion sobre numero de parametros, longitud de contexto ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video omni-modal, con text encoder y VAEs separadas de video y audio; no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 / INT4 con ConvRot (transformers FL2VA y Ref2VA, y text encoder); VAE de video en precision mixta FP16/FP32; VAE de audio en FP32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada por el autor del repositorio; los componentes derivados quedan sujetos a los terminos de MiniMax H3 original y de las conversiones de terceros |
| Formato de pesos | safetensors |
| Tamano del repositorio | 60,5 GB |
| Pipeline declarado | no disponible |
| Libreria | minimax-h3 |
| Descargas / likes | 17.555 / 6 |
| Fecha de creacion / actualizacion | 2026-08-09 / 2026-09-13 |

## Arquitectura y entrenamiento

MiniMax H3 es un modelo generativo omni-modal que produce video y audio estereo sincronizados. La arquitectura no se detalla en la informacion disponible; por la composicion del repositorio se deduce un esquema de difusion con transformers independientes para cada variante de condicionamiento (FL2VA para first/last-frame, Ref2VA para referencias multimodales, y una version hibrida que unifica ambos), un text encoder para el prompt, una VAE de video/visual y una VAE de audio. El autor no publica numero de parametros, tokens de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO.

Este repositorio no entrena ni hace fine-tuning del modelo base. Las modificaciones aplicadas son de compresion: poda de los checkpoints FL2VA y Ref2VA, cuantizacion W4A8 con ConvRot en los tres safetensors principales (`minimax_h3_fl2va_pruned-w4a8_convrot_pruned.safetensors`, `minimax_h3_ref2va_pruned-w4a8_convrot_pruned.safetensors` y `minimax_h3_te_w4a8_convrot.safetensors`), y conversion de la mayor parte de los tensores de la VAE de video de FP32 a FP16 conservando en FP32 bloques pequenos y sensibles a la precision. La actualizacion del 17 de agosto de 2026 incorpora la version hibrida, que sustituye a los modelos rf2va y ref2va y permite usar imagen inicial y referencia en un mismo trabajo. Se incluye ademas el Turbo LoRA step600, que habilita generacion en 4 pasos.

## Capacidades

- Generacion de video con audio estereo sincronizado a partir de texto (text-to-audio-video).
- Generacion condicionada por primer y ultimo fotograma (first/last-frame-to-audio-video).
- Generacion condicionada por referencias multimodales (multimodal reference-to-audio-video), segun la variante seleccionada.
- Version hibrida que permite combinar imagen inicial y referencia en una misma ejecucion.
- Inferencia acelerada mediante Turbo LoRA (step600) con muestreo en 4 pasos.
- Ejecucion local en memoria reducida gracias a la cuantizacion INT4/W4A8 y a la VAE de video en precision mixta.
- Carga de algunos modelos en int8 a traves de la aplicacion standalone del autor.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingue del prompt.

## Casos de uso

- Generacion de video musical o de clips cortos con audio sincronizado: el modelo produce pista de audio estereo y video en una sola pasada, por lo que evita el flujo habitual de generar video y audio por separado y alinearlos despues.
- Prototipado de anuncios en equipos de una sola GPU: la cuantizacion W4A8 y la VAE en precision mixta reducen el consumo de memoria frente al modelo original en FP32, lo que permite iterar variaciones de un anuncio en hardware de consumo.
- Animacion de imagenes fijas (image-to-video con audio): la variante FL2VA acepta primer y ultimo fotograma, util para convertir ilustraciones o fotografias en planos animados con sonido.
- Transferencia de estilo o identidad mediante referencias: la variante Ref2VA y la version hibrida permiten condicionar el resultado con imagenes de referencia, adecuado para mantener coherencia visual entre planos de una misma pieza.
- Creacion de contenido para redes sociales en local: con el Turbo LoRA de 4 pasos y pesos INT4, un estudio pequeno puede generar borradores sin depender de APIs en la nube ni de GPUs de datacenter.
- Previsualizacion en pipelines de produccion de animacion: uso del modelo cuantizado como generador de animaticos y previsiones, reservando el modelo en precision completa para el render final.
- Experimentacion academica en generacion audio-visual: el paquete permite reproducir y auditar un modelo omni-modal de gran tamano en laboratorios con presupuesto de hardware limitado.
- Integracion en flujos ComfyUI: al estar pensado para ComfyUI y para una aplicacion standalone, se puede insertar como nodo dentro de pipelines de generacion ya existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de FVD, FAD, CLIP-score, calidad de reconstruccion de la VAE ni comparativas numericas frente al modelo original en FP32 o frente a las conversiones de Winnougan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras minimas ni recomendadas.
- Tamano del repositorio completo: 60,5 GB, aunque no todos los componentes se cargan simultaneamente (los transformers FL2VA y Ref2VA son alternativos).
- No cabe esperar que el paquete completo resida en VRAM de una GPU de consumo; el objetivo declarado es ejecutarlo en GPU de consumo con carga selectiva de componentes y uso de memoria de sistema.
- Perfil de computo: pesos en INT4 y activaciones en INT8 (W4A8) en los tres safetensors principales, lo que reduce el ancho de banda de memoria respecto a FP16.
- El text encoder se entrega en W4A8, pero su componente visual permanece a mayor precision, tal como en la conversion de origen.
- VAE de video en precision mixta FP16/FP32 y VAE de audio en FP32: ambos componentes mantienen requisitos de memoria no despreciables.
- GPU recomendadas: no disponible como lista oficial. El repositorio esta orientado explicitamente a GPU de consumo.
- Opciones de despliegue: ComfyUI (entorno para el que fue creado oficialmente) y aplicacion standalone del autor en https://github.com/Koongrizzly/MiniMax_H3_Standalone_app, que tambien permite cargar algunos modelos en int8. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un transformer de difusion de video con VAEs.
- Latencia y throughput: no disponible. El Turbo LoRA step600 reduce el numero de pasos de muestreo a 4, lo que disminuye proporcionalmente el coste de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada. La comparacion viable es entre variantes del mismo ecosistema MiniMax H3:

| Variante | Naturaleza | Precision | Estado |
|---|---|---|---|
| MiniMaxAI/MiniMax-H3 | Modelo oficial de referencia | Precision completa (FP32/FP16 no detallado) | Publicado por MiniMaxAI |
| Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI | Cuantizacion INT4 ConvRot W4A8 | INT4 pesos / INT8 activaciones | Origen de los tres safetensors principales de este repositorio |
| berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8 | Version hibrida que unifica Ref2VA y FL2VA | W4A8 | Integrada en este repositorio desde el 17 de agosto de 2026 |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA de aceleracion (step600) | No aplica | Incluida en este repositorio |
| koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned | Paquete integrado con VAE de video en precision mixta y VAE de audio en FP32 | W4A8 + FP16/FP32 mixto | Este repositorio |

No se dispone de comparativas de parametros, contexto, rendimiento ni licencia frente a otros modelos de generacion de video con audio de la competencia.

## Limitaciones y advertencias

- La cuantizacion W4A8 y la poda implican una perdida de precision numerica frente al modelo original; el autor la describe como un intercambio por menor consumo de memoria, sin cuantificar el impacto en calidad.
- La conversion de la VAE de video a FP16 afecta a la mayor parte de sus tensores; aunque se conservan bloques sensibles en FP32, puede haber diferencias de reconstruccion respecto a la VAE original.
- No hay datos publicos de evaluacion (FVD, FAD, similitud de audio, coherencia temporal) que permitan estimar la degradacion real.
- No se especifican parametros, contexto, idiomas soportados ni pipeline, lo que dificulta planificar integraciones.
- Licencia: el repositorio declara apache-2.0, pero el propio autor advierte de que contiene componentes derivados o redistribuidos de otros proyectos y que el usuario debe revisar y cumplir los terminos del modelo MiniMax H3 original y de los componentes convertidos. La ausencia de una licencia explicita y verificada del modelo base es un riesgo para uso comercial.
- El repositorio no esta afiliado ni respaldado por MiniMaxAI.
- El soporte oficial es para ComfyUI; el uso standalone requiere el loader adecuado y puede presentar incompatibilidades.
- El uso de la funcion de carga de modelos int8 en la aplicacion standalone se menciona sin detallar limitaciones.
- Riesgo de sesgos y alucinacion visual: no se documenta ninguna evaluacion de sesgos ni de fidelidad del contenido generado; se aplican los sesgos inherentes al dataset de entrenamiento del modelo original, que no se detalla.
- Las fechas del repositorio (creacion en 2026) y el tamano de 60,5 GB implican requisitos de almacenamiento y de ancho de banda de descarga considerables.
- No se documenta compatibilidad con aceleradores distintos de GPU NVIDIA ni con backends alternativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Aplicacion standalone: https://github.com/Koongrizzly/MiniMax_H3_Standalone_app
- Discord de soporte del autor: https://discord.gg/kWxAJwjSY
- Conversion INT4 ConvRot de Winnougan: https://huggingface.co/Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI
- Version hibrida de berryber09: https://huggingface.co/berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8
- Turbo LoRA de larryvrh: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
