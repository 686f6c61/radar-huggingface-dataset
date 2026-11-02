# AI-KSK/qwen21-controlnet-turbo-fix-316

## Resumen

AI-KSK/qwen21-controlnet-turbo-fix-316 es un repositorio de HuggingFace publicado por el usuario AI-KSK que no contiene pesos de modelo, sino cuatro exportaciones JSON de flujos de trabajo (workflows) para ComfyUI orientadas a Qwen Image 2.1. Concretamente, distribuye una rejilla de parametros de Depth con 75 recetas de ControlNet Union mas una linea base, un grafo de ControlNet Union con ocho rutas estructurales y una ruta de Mask independiente, una comparativa Turbo (8 pasos frente a 25 pasos del modelo base) y una comparativa de Detail-Fix. El paquete esta pensado como material de referencia reproducible para quienes experimentan con control estructural en generacion de imagen.

El repositorio no incluye pesos, imagenes de entrada ni resultados verificados; las portadas son activos promocionales y no salidas confirmadas. Los JSON distribuidos son identicos byte a byte a los originales y a los alojados en las entradas de Civitai del mismo episodio (la variante Turbo publicada es la exportacion de 291 nodos, mientras que la de 290 nodos permanece en la carpeta de origen sin realojarse). El autor declara explicitamente que no se ha realizado ninguna prueba nueva de inferencia, GPU, tiempos, calidad, compatibilidad o licencia.

Se trata, por tanto, de un artefacto de configuracion y no de un modelo entrenado: no hay arquitectura propia, parametros, contexto ni licencia definidos en la informacion disponible. Su relevancia es practica para desarrolladores que ya trabajan con el ecosistema Qwen Image 2.1 en ComfyUI y quieren inspeccionar o adaptar recetas de control estructural, comparativas de muestreo acelerado y tecnicas de correccion de detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows JSON, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los workflows referencian activos externos como `qwen3vl_8b_int8_convrot.safetensors` y `qwen3vl_8b_fp8_scaled.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica; el repositorio distribuye archivos JSON de workflow para ComfyUI |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo ni proceso de entrenamiento en la informacion proporcionada. El repositorio es un contenedor de cuatro exportaciones JSON de ComfyUI que orquestan nodos sobre activos externos de Qwen Image 2.1: `Qwen-Image_2.1.safetensors`, `qwen_image_2.1_bf16.safetensors`, el VAE `qwen_image_2.1_vae_bf16.safetensors`, el ControlNet `Qwen-Image-2.1-Fun-Controlnet-Union-ComfyUI.safetensors`, el LoRA Turbo `qwen_image_2.1_turbo_lora_avg_rank_178_bf16.safetensors` y el extractor de profundidad `depth_anything_v2_vitb.pth`. Ninguno de estos pesos se incluye en el paquete.

Los flujos documentan configuraciones concretas: la rejilla de Depth enumera START {0, 0.25, 0.5}, END {0.6, 0.7, 0.8, 0.9, 1} y WEIGHT {0.2, 0.4, 0.6, 0.8, 1}, con 76 samplers/decoders y 78 previews, sin SaveImage ni compositor de rejilla. El grafo Union + Mask guarda las ramas Canny, Depth, HED y Lineart en mode=4, y MLSD, Pose, Scribble, Grayscale y Mask en mode=0. La comparativa Turbo usa LoRA con strength 1, CFG 1 y nueve entradas sigma frente a la linea base de 25 pasos y CFG 3.5. No hay innovaciones de decodificacion especulativa ni atencion lineal descritas.

## Capacidades

- Distribucion de cuatro flujos de trabajo JSON para ComfyUI centrados en Qwen Image 2.1.
- Rejilla de parametros de Depth con 75 recetas de ControlNet Union mas una linea base.
- Grafo de ControlNet Union con ocho rutas estructurales (Canny, Depth, HED, Lineart, MLSD, Pose, Scribble, Grayscale) y una ruta de Mask independiente.
- Comparativa de muestreo Turbo a 8 pasos frente al modelo base a 25 pasos, con once pares de ejemplos (cinco solo texto, tres con dos referencias y tres con tres referencias).
- Comparativa de Detail-Fix orientada a correccion de calidad y supresion de pseudo-detalle de alta frecuencia.
- No incluye capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues propias; depende enteramente de los modelos externos referenciados.

## Casos de uso

- Exploracion de control estructural por profundidad: la rejilla de 75 recetas permite barrer combinaciones de START, END y WEIGHT sobre una misma imagen de entrada y latent compartido, util para calibrar la intensidad de ControlNet Union Depth antes de fijar una configuracion en produccion.
- Construccion de pipelines de inpainting con mascara: el grafo Union + Mask emplea las entradas inpaint_image/mask del ControlNet Union con latent de sampler vacio y composicion posterior al decodificado sobre la fuente redimensionada, adecuado para probar flujos de retoque localizado.
- Evaluacion de muestreo acelerado: los once pares base/Turbo permiten comparar visualmente 25 pasos con CFG 3.5 frente a 8 pasos con CFG 1 y LoRA Turbo, util para decidir umbrales de calidad/velocidad en entornos con GPU limitada.
- Correccion de detalle en postproceso: el flujo Detail-Fix sirve para estudiar tecnicas de reparacion de calidad y reduccion de artefactos de alta frecuencia en imagenes generadas.
- Reutilizacion de plantillas en ComfyUI: los JSON son byte-identicos a los originales y a los de Civitai, lo que facilita la verificacion por hash y la integracion en repositorios de workflows versionados.
- Formacion y documentacion interna: los grafos documentan decisiones de configuracion (modos de rama, arrays posicionales, expresiones de dimension) que pueden servir como referencia didactica para equipos que adopten Qwen Image 2.1.
- Auditoria de reproducibilidad: al no incluir pesos ni resultados, el paquete permite aislar la logica de configuracion y comprobar que los parametros declarados coinciden con los ejecutados en un entorno propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se incluye ninguna prueba nueva de inferencia, GPU, tiempos, calidad, compatibilidad o licencia, y que las portadas son activos promocionales no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende de los activos externos de Qwen Image 2.1 referenciados (modelo base, VAE, ControlNet Union, LoRA Turbo y extractor Depth Anything V2 ViT-B), no incluidos en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el entorno implicito de los workflows; no se documentan alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor senala que ocho intervalos sigma no constituyen una medicion de velocidad.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con parametros, contexto o licencia comparables, sino una coleccion de workflows JSON; no se identifican en la informacion proporcionada alternativas equivalentes de paquetes de configuracion para Qwen Image 2.1.

## Limitaciones y advertencias

- No contiene pesos de modelo, imagenes de entrada ni resultados verificados; las portadas son material promocional.
- Ausencia total de pruebas de inferencia, GPU, tiempos, calidad, compatibilidad o licencia en este paquete.
- Licencia no disponible: no puede asumirse uso comercial sin verificar las condiciones de los activos externos de Qwen Image 2.1 referenciados.
- La rejilla de Depth no genera hoja de contactos automatica y carece de SaveImage o compositor de rejilla; requiere revision manual en copia de trabajo separada.
- Las etiquetas de eje desconectadas no modifican parametros; cambiar texto de etiqueta no altera la configuracion real.
- En Union + Mask, los arrays reales de Depth/MLSD/Pose contienen 0.8/0/0.8 pese a que los titulos indican 0.4/0.25/0.8; las expresiones de dimension enlazadas sobrescriben los valores por defecto de 2048x2048.
- La ruta de Mask no demuestra una ruta convencional de latent enmascarado codificado desde la fuente ni garantia de preservacion de pixeles.
- Los dos archivos Turbo (290 y 291 nodos) no son identicos byte a byte y no deben empalmarse por numero de nodo; el SaveImage 291 solo guarda la salida del decoder 106.
- La comparativa Turbo no es un benchmark de una sola variable: procesamiento de modelo, guidance y muestreo difieren entre ramas.
- Riesgo de alucinacion y sesgos: no aplica directamente al paquete, pero si a los modelos externos que orquestan, cuyas caracteristicas no se documentan aqui.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AI-KSK/qwen21-controlnet-turbo-fix-316
- Entrada de Civitai 2998097 (referenciada como origen de la variante Turbo de 291 nodos): no disponible como URL en la informacion proporcionada
- Activos externos referenciados (no incluidos en el repositorio): `Qwen-Image_2.1.safetensors`, `qwen_image_2.1_bf16.safetensors`, `qwen3vl_8b_int8_convrot.safetensors`, `qwen3vl_8b_fp8_scaled.safetensors`, `qwen_image_2.1_vae_bf16.safetensors`, `Qwen-Image-2.1-Fun-Controlnet-Union-ComfyUI.safetensors`, `qwen_image_2.1_turbo_lora_avg_rank_178_bf16.safetensors`, `depth_anything_v2_vitb.pth`
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada
