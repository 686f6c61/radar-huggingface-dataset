# creative-graphic-design/tkg-dm

## Resumen

TKG-DM es un paquete de código para diffusers que implementa una tecnica de generacion de imagenes texto-a-imagen orientada a producir activos de primer plano sobre un fondo verde de chroma-key, de modo que el fondo pueda recortarse y el sujeto componerse en otro diseno. Lo desarrollan Ryugo Morita, Stanislav Frolov, Brian Bernhard Moser, Takahiro Shirakawa, Ko Watanabe, Andreas Dengel y Jinjia Zhou, y el repositorio de Hugging Face lo publica la organizacion creative-graphic-design. El trabajo se presento en CVPR 2025 y esta documentado en el paper arXiv:2411.15580.

El paquete no contiene pesos propios de TKG-DM: carga checkpoints publicos de Stable Diffusion 1.5 o SDXL y aplica una modificacion sobre el ruido latente inicial. En concreto, desplaza la proporcion de valores positivos de dos canales latentes y mezcla el resultado con el ruido original mediante una mascara gaussiana centrada antes del proceso de denoising. El paquete fija los desplazamientos positivos en los canales latentes 2 y 3, lo que produce el color verde; el paper describe como cambiar canales y direcciones de desplazamiento para otros colores, opcion que este paquete no expone.

Es relevante ahora porque ofrece una via sencilla para generar assets con fondo removible directamente en el pipeline de difusion, sin necesidad de segmentacion posterior, manteniendo las interfaces estandar de carga y generacion de diffusers y soporte para schedulers DDIM. La licencia del codigo es Apache-2.0, mientras que los checkpoints base conservan sus licencias y terminos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion sobre checkpoints Stable Diffusion 1.5 o SDXL (no incluye pesos propios) |
| Parametros totales | Depende del checkpoint base; no disponible para TKG-DM (sin pesos publicados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-a-imagen; condicionamiento por prompt de texto) |
| Tipos de cuantizacion | No disponible (heredados del checkpoint base y de diffusers) |
| Idiomas soportados | Ingles (prompts en ingles) |
| Licencia | Codigo Apache-2.0; checkpoints base sujetos a sus licencias upstream |
| Formato de pesos | No disponible (el paquete es code-only; los pesos se cargan desde SD 1.5 / SDXL) |

## Arquitectura y entrenamiento

TKG-DM no es un modelo entrenado de novo, sino una modificacion del proceso de generacion de modelos de difusion latente existentes. El pipeline altera el ruido latente inicial: incrementa la proporcion de valores positivos en dos canales latentes (fijados en los canales 2 y 3 para obtener verde) y combina ese ruido modificado con el original mediante una mascara gaussiana centrada. El parametro `target_shift` controla cuanto aumenta esa proporcion de valores positivos; el pipeline usa 0.07 para SD 1.5 y 0.11 para SDXL. El paper reporta 0.07 para ambas familias, donde 0.07 eleva la proporcion de valores positivos en siete puntos porcentuales; la implementacion del autor para SDXL usa 0.11, que es el valor por defecto del pipeline SDXL y la referencia de paridad end-to-end.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni sobre fases de RLHF o DPO, ya que el paquete no entrena pesos. La innovacion tecnica destacable es el control del color de fondo mediante el desplazamiento del ruido latente, validado con una reejecucion independiente de la comparacion SDXL fijada frente a la implementacion del autor, que confirmo error de imagen medido cero (PSNR infinito dB, MAE 0). El paquete mantiene las interfaces estandar de diffusers y soporta schedulers DDIM.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en ingles.
- Produccion de activos de primer plano sobre fondo verde de chroma-key, listos para recorte y composicion.
- Control del color de fondo limitado al verde: los canales latentes 2 y 3 y la direccion de desplazamiento estan fijados en el paquete.
- Ajuste fino del efecto mediante el parametro `target_shift` (0.07 para SD 1.5, 0.11 para SDXL).
- Compatibilidad con dos checkpoints base: Stable Diffusion 1.5 y SDXL.
- Integracion con la libreria diffusers: carga y generacion mediante las interfaces habituales.
- Soporte de schedulers DDIM.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modos de razonamiento multi-paso; es exclusivamente un pipeline de generacion de imagen.

## Casos de uso

- Generacion de assets para diseno grafico: crear sujetos sobre fondo verde para recortarlos y componerlos en carteles, banners o maquetas, aprovechando que el fondo es uniforme y removible.
- Prototipado rapido de composiciones: generar borradores de primer plano con SD 1.5 o SDXL y evaluar variantes de encuadre antes de producir el diseno final.
- Produccion de material para catalogo o e-commerce: generar productos o figuras sobre chroma-key para insertarlas despues en plantillas de ficha de producto.
- Creacion de elementos para videojuegos o ilustracion: obtener sprites o personajes con fondo recortable que se integren en escenas 2D.
- Automatizacion de pipelines de diseno: integrar el paquete en flujos que encadenan generacion, recorte de fondo y composicion, gracias a las interfaces estandar de diffusers y al soporte de DDIM.
- Experimentacion academica: reproducir y comparar el metodo TKG-DM frente a la implementacion del autor, usando la paridad verificada con SDXL (PSNR infinito dB, MAE 0) como referencia.
- Generacion de material de marketing con fondo controlado: producir figuras sobre verde para montajes rapidos en herramientas de edicion, inspeccionando cada salida antes de componer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la verificacion de paridad con la implementacion del autor para SDXL: PSNR infinito dB y MAE 0 en la comparacion fijada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del checkpoint base; no disponible en la informacion proporcionada para valores concretos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: libreria diffusers con los pipelines del paquete; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TKG-DM (este paquete) | Sin pesos propios; depende del checkpoint base | No aplica (texto-a-imagen) | Paridad verificada con SDXL (PSNR infinito dB, MAE 0) | Codigo Apache-2.0 | Hugging Face, code-only |
| Stable Diffusion 1.5 | No disponible en la informacion | No aplica (texto-a-imagen) | No disponible | Licencia upstream | Checkpoint publico upstream |
| SDXL base | No disponible en la informacion | No aplica (texto-a-imagen) | No disponible | Licencia upstream | Checkpoint publico upstream |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no garantiza que todas las salidas tengan un fondo uniformemente removible.
- No ofrece garantia de seguridad ni establece derechos sobre el contenido generado.
- El comportamiento de generacion hereda los datos de entrenamiento, sesgos, licencia y terminos de acceso del checkpoint base seleccionado.
- El repositorio del autor no declara licencia; el paquete no redistribuye su codigo fuente.
- Las salidas varian segun el checkpoint, scheduler, dispositivo, precision y versiones de libreria.
- Solo admite prompts en ingles.
- El control de color de fondo esta limitado al verde en este paquete; no expone el cambio de canales y direcciones descrito en el paper.
- Se recomienda inspeccionar cada imagen generada antes de componerla.
- Riesgo de alucinacion y sesgos especificos: no disponible en la informacion proporcionada.
- Restricciones de licencia para uso comercial: el codigo es Apache-2.0, pero los checkpoints base (SD 1.5 y SDXL) conservan sus propias licencias y terminos, que deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/creative-graphic-design/tkg-dm
- Paper: https://arxiv.org/abs/2411.15580
- Implementacion del autor: https://github.com/ryugo417/TKG-DM
- Pesos base SD 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Pesos base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Documentacion de diffusers: https://huggingface.co/docs/diffusers/index
