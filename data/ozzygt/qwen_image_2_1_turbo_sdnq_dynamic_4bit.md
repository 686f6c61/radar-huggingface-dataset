# OzzyGT/Qwen_Image_2_1_Turbo_sdnq_dynamic_4bit

## Resumen

Qwen_Image_2_1_Turbo_sdnq_dynamic_4bit es una version cuantizada a INT4 del modelo de generacion de imagenes Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario OzzyGT. No es un modelo entrenado desde cero: se trata de un checkpoint de inferencia que aplica la tecnica SDNQ (SD.Next Quantization) en su variante dinamica, con rotacion de Hadamard, sobre el modelo base de Qwen. El objetivo es reducir el coste de VRAM y de almacenamiento del modelo original manteniendo la fidelidad visual, algo relevante para quienes quieren ejecutar un modelo de generacion de imagenes de la familia Qwen-Image en hardware mas modesto.

El checkpoint contiene 3.812.110.336 parametros (unos 3,81 mil millones) y ocupa 11,5 GB en el repositorio, publicado bajo licencia qwen-research y con soporte de prompts en ingles y chino. Se distribuye en formato safetensors para la libreria diffusers, usando el pipeline QwenImage21Pipeline, y esta pensado para generar imagenes con un esquema de muestreo corto (8 pasos) propio de la variante Turbo del modelo base.

Su relevancia actual radica en que demuestra una ruta practica de cuantizacion de 4 bits para modelos de difusion texto-a-imagen con calidad cercana al original bf16. Al ser una publicacion reciente (creada el 9 de octubre de 2026) con cero descargas y cero likes en el momento de redactar esta ficha, carece todavia de validacion comunitaria amplia y de benchmarks cuantitativos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (pipeline QwenImage21Pipeline); backbone no detallado en la informacion disponible |
| Parametros totales | 3.812.110.336 (≈3,81 mil millones) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | INT4 dinamica con SDNQ (SD.Next Quantization) y rotacion de Hadamard; requiere SDNQ >= 0.2.2 |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (campo license: other) |
| Formato de pesos | safetensors (diffusers) |

Nota: el repositorio incluye la etiqueta "8-bit", que no coincide con la denominacion 4 bits del nombre del modelo; la model card describe explicitamente una cuantizacion INT4. El tamano del repositorio (11,5 GB) es notablemente superior al que cabria esperar solo de los pesos del transformer en INT4, lo que sugiere que incluye otros componentes del pipeline (codificador de texto, VAE) y/o copias en mayor precision. Este desglose no esta detallado en la informacion disponible.

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base Qwen/Qwen-Image-2.1-Turbo ni su proceso de entrenamiento. Lo que si se especifica es que este checkpoint es el resultado de aplicar cuantizacion SDNQ sobre dicho modelo base, con la opcion dinamica y rotacion de Hadamard como tecnicas de compresion. No hubo, por tanto, un reentrenamiento del modelo: es una conversion de pesos con fines de inferencia.

El aspecto tecnico mas relevante es la dependencia de versiones concretas de software. Segun la model card, es necesario SDNQ v0.2.2 o superior para registrar el backend de cuantizacion antes de cargar el modelo, y una version de diffusers que incluya el PR #14950, necesaria para que se utilice el esquema de 8 pasos guardado en el checkpoint. La model card tambien menciona el uso de VAE tiling y de model CPU offload en el ejemplo de referencia, y la generacion de la imagen de muestra se hizo con altura 1696 y anchura 2528, true_cfg_scale=1.0 y semilla 42. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline QwenImage21Pipeline de diffusers.
- Comprension de prompts en ingles y chino.
- Generacion en resoluciones altas: el ejemplo de la model card emplea 1696x2528 pixeles.
- Muestreo con esquema Turbo de 8 pasos, guardado en el propio checkpoint.
- Compatibilidad con VAE tiling (para resoluciones grandes con memoria limitada).
- Compatibilidad con model CPU offload para repartir la carga entre CPU y GPU.
- Ejecucion de la cuantizacion INT4 en el backend SDNQ, que debe registrarse antes de cargar el modelo.
- No se documentan capacidades de tool calling, agentes, vision de entrada ni audio: es un modelo de generacion de imagenes, no un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de ilustraciones para entornos con VRAM limitada: gracias a la cuantizacion INT4, el modelo puede desplegarse en GPUs de gama de consumo, con VAE tiling y CPU offload para atenuar el consumo de memoria en resoluciones grandes.
- Prototipado rapido de conceptos visuales: con un esquema Turbo de 8 pasos, permite iterar prompts y semillas en menos pasos de inferencia que un modelo de difusion no destilado, util para explorar direcciones artisticas antes de producir una version final.
- Creacion de material grafico para productos en ingles y chino: al soportar ambos idiomas en los prompts, encaja en flujos de trabajo de equipos bilingues o para mercados de habla china e inglesa.
- Integracion en pipelines automatizados de generacion de imagenes con diffusers: al seguir la interfaz estandar de diffusers (DiffusionPipeline), puede insertarse en scripts y servicios existentes que ya usen esta libreria.
- Pruebas de cuantizacion y evaluacion de calidad: sirve como referencia para comparar la salida bf16 frente a INT4 en la misma semilla y prompt, un caso util para equipos que estudian el impacto de SDNQ en modelos de difusion.
- Despliegue en cuadernos y estaciones de trabajo de investigacion: el checkpoint se carga desde Hugging Face con pocas lineas y puede ejecutarse en CPU con offload si no hay GPU disponible, aunque a costa de mayor latencia.
- Generacion de imagenes en resoluciones altas para impresion o banners: el ejemplo a 2528x1696 sugiere uso en formatos panoramicos o de gran formato, siempre que la memoria lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La model card unicamente ofrece una comparacion visual cualitativa entre el modelo base en bf16 y la version SDNQ INT4, usando el mismo prompt y la semilla 42:

| Comparacion | Modelo bf16 | SDNQ INT4 |
|---|---|---|
| Prompt y semilla identicos | Si (seed 42) | Si (seed 42) |
| Metrica cuantitativa | no disponible | no disponible |
| Resultado | Imagen de referencia | Imagen comparable segun la model card (sin cifras) |

No se aportan valores de FID, CLIP score, SSIM ni de ningun otro indicador objetivo, por lo que no es posible cuantificar la perdida de calidad respecto al modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Dado el tamano del repositorio (11,5 GB) y la cuantizacion INT4, el requisito real dependera del desglose de componentes; el ejemplo oficial recurre a model CPU offload y VAE tiling, lo que indica que se concibio para entornos con memoria ajustada.
- GPUs recomendadas: no se especifican en la informacion disponible. Por el tipo de carga (difusion texto-a-imagen), el offload y el tiling apuntan a GPUs de consumo, aunque no hay confirmacion del autor.
- Viabilidad en GPU de consumo: probable con CPU offload y VAE tiling segun el ejemplo de la model card, pero sin cifras confirmadas de VRAM minima.
- Opciones de despliegue: diffusers mediante el pipeline QwenImage21Pipeline, con el backend SDNQ registrado previamente. Se requieren SDNQ v0.2.2 o superior y una version de diffusers con el PR #14950. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El modelo usa un esquema de 8 pasos, inferior al de un modelo de difusion convencional, lo que en principio reduce el numero de pasos de inferencia, pero no se publican tiempos medidos.
- Resolucion del ejemplo: 2528x1696 con true_cfg_scale=1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OzzyGT/Qwen_Image_2_1_Turbo_sdnq_dynamic_4bit | Difusion texto-a-imagen (cuantizado) | 3,81 mil millones | INT4 dinamica SDNQ | en, zh | qwen-research | Hugging Face (diffusers) |
| Qwen/Qwen-Image-2.1-Turbo (base) | Difusion texto-a-imagen | no disponible | bf16 | en, zh | qwen-research | Hugging Face |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa posible con la informacion aportada es frente al modelo base Qwen/Qwen-Image-2.1-Turbo, del que este checkpoint es una version cuantizada. No se dispone de datos de otros modelos comparables de la misma categoria en el material facilitado.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion, por lo que el uso comercial esta sujeto a las condiciones del titular (Qwen). Debe revisarse el texto completo antes de cualquier despliegue productivo.
- Al ser una cuantizacion INT4, puede existir una degradacion de calidad respecto al modelo base en bf16, aunque la model card no la cuantifica.
- Idiomas limitados a ingles y chino; un rendimiento optimo en otros idiomas no esta garantizado.
- Dependencias de software muy especificas: SDNQ v0.2.2 o superior y una version de diffusers con el PR #14950. Usar versiones distintas puede provocar que no se aplique el esquema de 8 pasos u otros fallos de carga.
- Validacion comunitaria inexistente en el momento de la ficha: cero descargas y cero likes, sin issues ni discusiones publicas sobre su correcto funcionamiento.
- Falta de benchmarks objetivos: no hay metricas de calidad que permitan comparar con el modelo base ni con alternativas.
- Posible riesgo de alucinacion visual y de artefactos propios de los modelos de difusion, mas probables en prompts ambiguos o resoluciones extremas.
- La discrepancia entre la etiqueta "8-bit" del repositorio y la denominacion 4 bits puede generar confusion al seleccionar el checkpoint.
- El autor no es Qwen, sino un tercero (OzzyGT), por lo que la conversion no esta respaldada oficialmente por el equipo del modelo base.
- No es un modelo de lenguaje: no realiza tool calling, razonamiento multi-paso ni gestion de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/Qwen_Image_2_1_Turbo_sdnq_dynamic_4bit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- SDNQ (SD.Next Quantization): https://github.com/Disty0/sdnq
- Pull request de diffusers necesario (PR #14950): https://github.com/huggingface/diffusers/pull/14950
- Scripts de ejemplo (diffusers-recipes): https://github.com/asomoza/diffusers-recipes/blob/main/models/qwen_image_2_1/README.md
