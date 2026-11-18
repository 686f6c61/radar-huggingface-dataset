# briaai/Fibo-2.0-dev

## Resumen

Fibo-2.0-dev es un modelo de difusion para generacion y edicion de imagenes desarrollado por Bria AI, disenado especificamente para flujos de trabajo de edicion estructurada con multiples referencias. A diferencia de los modelos text-to-image convencionales, Fibo-2.0 incorpora soporte nativo para *structured prompts* (prompts en formato JSON con control explicito de sujetos, escenas y atributos) y para *multi-reference* (hasta varias imagenes de referencia simultaneas), lo que permite mantener consistencia de identidad y estilo a lo largo de una sesion de edicion.

El modelo se distribuye con aproximadamente 8.127 millones de parametros en pesos safetensors (25,5 GB de repositorio) y esta integrado en la libreria `diffusers` mediante el pipeline `BriaFibo2Pipeline`. Cubre las tareas de text-to-image, image-to-image, inpainting y edicion multi-referencia, y se publica bajo la licencia propietaria `bria-fibo` con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de su descarga.

Su relevancia actual radica en que cubre un hueco practico: la mayoria de modelos de edicion open weight no ofrecen control estructurado ni consistencia multi-referencia de forma nativa, y Fibo-2.0 lo plantea como capacidad de primera clase, orientada a pipelines de produccion donde la reproducibilidad y el control fino del resultado son requisitos. La version `-dev` indica que se trata de un checkpoint de desarrollo, no de una version final estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (pipeline `BriaFibo2Pipeline` en diffusers); detalles internos no disponibles |
| Parametros totales | 8.127.342.213 (~8,13 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se especifica limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | `bria-fibo` (licencia propietaria de Bria AI, acceso gated) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

Fibo-2.0-dev se publica como un modelo de difusion integrado en `diffusers` a traves del pipeline `BriaFibo2Pipeline`. La informacion disponible no detalla la columna vertebral concreta (UNet, DiT u otra variante), el esquema de atencion ni la composicion del dataset de entrenamiento. Si se indica que el modelo esta disenado en torno a dos innovaciones funcionales: la interpretacion de *structured prompts* (representaciones JSON que describen sujetos, escenas y atributos de forma jerarquica) y el uso de *multi-reference* (varias imagenes de referencia combinadas en una misma generacion), lo que sugiere un mecanismo de condicionamiento cruzado entre referencias visuales y estructura textual.

No se han publicado en la informacion disponible datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni detalles de decodificacion especulativa. Existe un identificador arXiv asociado (arXiv:2511.06876) que presumiblemente contiene la descripcion tecnica completa, pero su contenido no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image).
- Edicion de imagenes existentes (image-to-image).
- Inpainting: relleno de regiones enmascaradas dentro de una imagen.
- Edicion multi-referencia: combinacion de varias imagenes de referencia para mantener identidad, estilo o composicion.
- Soporte de *structured prompts*: control explicito de sujetos, escenas y atributos mediante prompts estructurados (JSON).
- Integracion con `diffusers` mediante el pipeline `BriaFibo2Pipeline`.
- Ajuste fino (*fine-tuning*) contemplado como caso de uso en los tags del modelo.
- Capacidades de *visual grounding* (tag `vgl`) asociadas al modelo.
- Idioma de prompt: ingles.
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- **Edicion de producto en e-commerce**: dado un catalogo de imagenes de producto, usar image-to-image e inpainting para cambiar fondos, iluminacion o entorno manteniendo la identidad del articulo gracias a la consistencia multi-referencia.
- **Generacion de material de marketing con identidad consistente**: emplear varias imagenes de referencia de un mismo personaje o marca para producir variaciones de campana sin perder rasgos faciales ni paleta cromatica.
- **Iteracion controlada con structured prompts**: definir en JSON los sujetos, atributos y relaciones de una escena y regenerar variaciones modificando solo los campos necesarios, lo que facilita la reproducibilidad en pipelines automatizados.
- **Retoque y extension de imagenes (inpainting)**: eliminar objetos no deseados, rellenar zonas o ampliar encuadres en flujos de postproduccion, con mascaras generadas por el propio pipeline.
- **Prototipado rapido de concept art**: generar bocetos a partir de descripciones textuales y refinarlos con referencias visuales antes de pasarlos a un artista humano.
- **Ajuste fino sobre dominios verticales**: reentrenar el modelo sobre un dataset propio (moda, inmobiliaria, ilustracion editorial) para especializarlo en un estilo o categoria concreta, aprovechando que el modelo se distribuye en formato compatible con `diffusers`.
- **Automatizacion de variantes creativas**: generar multiples versiones de una misma escena cambiando atributos estructurados (hora del dia, vestuario, angulo de camara) para test A/B de creatividades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con ~8,13 mil millones de parametros y pesos en safetensors (25,5 GB de repositorio, lo que sugiere pesos en fp16/bf16 junto con componentes auxiliares), se requiere como minimo una GPU con 24 GB de VRAM para inferencia en precision nativa; con cuantizacion (si esta disponible) podria reducirse, pero no se documenta.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para ejecucion en fp16. GPUs consumer de 16 GB o menos probablemente requieran cuantizacion u offloading a CPU.
- **Cabida en GPU consumer**: previsiblemente si en RTX 4090 / RTX 5090 (24-32 GB); en GPUs de 12-16 GB solo con cuantizacion u offloading, no confirmado.
- **Opciones de despliegue**: `diffusers` (pipeline `BriaFibo2Pipeline`). No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI (no aplican a modelos de difusion).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / referencias | Licencia | Acceso |
|---|---|---|---|---|---|
| Fibo-2.0-dev (Bria AI) | ~8,13 B | Difusion, edicion multi-referencia y structured prompts | Multi-referencia y structured prompts documentados | `bria-fibo` (propietaria) | Gated en HF |
| FLUX.1 Kontext (Black Forest Labs) | no disponible | Difusion, edicion por instrucciones | Edicion contextual | no disponible en esta ficha | no disponible en esta ficha |
| Qwen-Image-Edit | no disponible | Difusion, edicion | Edicion por instrucciones | no disponible en esta ficha | no disponible en esta ficha |
| Stable Diffusion 3.5 Large | no disponible | Difusion, text-to-image | Sin multi-referencia nativa | no disponible en esta ficha | no disponible en esta ficha |

Nota: los datos de los modelos comparados no forman parte de la informacion proporcionada y se incluyen solo como referencia de categoria; no se dispone de cifras verificadas para una comparacion cuantitativa.

## Limitaciones y advertencias

- **Version de desarrollo**: el sufijo `-dev` indica un checkpoint no final; puede presentar inestabilidades, artefactos o cambios incompatibles en versiones posteriores.
- **Licencia propietaria**: la licencia `bria-fibo` es distinta de las licencias open source permisivas; es imprescindible revisar los terminos antes de cualquier uso comercial. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.
- **Idioma**: solo se declara soporte de ingles; los prompts en castellano pueden degradar la calidad del resultado.
- **Riesgo de sesgo y alucinacion visual**: como todo modelo de difusion, puede generar contenido estereotipado, atributos incorrectos o elementos no solicitados; no se documentan mitigaciones en la informacion disponible.
- **Datos de entrenamiento no publicos**: no se detalla la composicion del dataset, lo que dificulta evaluar sesgos y riesgos de memorizacion.
- **Sin benchmarks publicos**: no hay cifras verificables de rendimiento frente a alternativas, lo que complica la seleccion objetiva en produccion.
- **Requisitos de hardware elevados**: ~8,13 mil millones de parametros y 25,5 GB de repositorio implican GPUs de gama alta para inferencia en precision nativa.
- **Dependencia de `diffusers`**: el pipeline `BriaFibo2Pipeline` requiere una version de la libreria que lo incluya; versiones antiguas no son compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/briaai/Fibo-2.0-dev
- Paper asociado (referenciado en los tags): arXiv:2511.06876
- Bria AI: https://bria.ai
- Documentacion de `diffusers`: https://huggingface.co/docs/diffusers
