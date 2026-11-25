# Pixfanthav/SDXL-1.0-Kroma

## Resumen

SDXL-1.0-Kroma es una conversion del modelo de difusion Stable Diffusion XL 1.0 (SDXL) de Stability AI, empaquetada por el desarrollador independiente Pixfanthav para su aplicacion Kroma. Kroma ejecuta modelos de imagen en la NPU de telefonos con chip Snapdragon, y este repositorio contiene los pesos reordenados y recuantizados en el formato interno que espera dicho motor. No se trata de un modelo nuevo ni de un fine-tune: es el mismo SDXL 1.0 con los pesos transformados y divididos en ficheros por bloques.

La relevancia de la ficha es acotada: los ficheros estan pensados para ser descargados y consumidos exclusivamente por la app Kroma, no para cargarse en otros entornos como diffusers, ComfyUI o Automatic1111. El repositorio ocupa 8,3 GB e incluye el transformer en fp16 junto con variantes cuantizadas a 8 y 4 bits (transformer_q8, transformer_q4), el text encoder y su version q8, el VAE y una carpeta extra. La licencia es CreativeML Open RAIL++-M, heredada del modelo base.

Al no existir model card tecnica con datos de entrenamiento, benchmarks ni parametros detallados, esta ficha se limita a documentar lo que el autor declara: origen, formato, estructura de carpetas y restricciones de uso. Cualquier dato sobre calidad, contexto o rendimiento de SDXL debe consultarse en la ficha oficial del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + VAE + doble text encoder), heredada de SDXL 1.0; no se detalla en la model card |
| Parametros totales | No disponible (el repo ocupa 8,3 GB en fp16 y variantes cuantizadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; el prompt de texto no se mide en tokens de contexto de LLM) |
| Tipos de cuantizacion | fp16, q8 (8 bits), q4 (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | ONNX y ficheros por bloques en el layout propio del motor Kroma (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion XL 1.0, un modelo de difusion latente compuesto por una UNet, un VAE y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). Pixfanthav no aporta informacion sobre el entrenamiento original ni sobre un reentrenamiento propio: la model card indica explicitamente que los pesos se han almacenado "en otro formato numerico y reorganizado en el layout del motor", y que el transformer se incluye "fp16 tal como se fabrico". Por tanto, no hay datos de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO en la informacion disponible.

La innovacion tecnica del repositorio no esta en el modelo sino en el empaquetado: los bloques del transformer se ofrecen en fp16, 8 bits y 4 bits para que la app elija el formato en su pantalla de descarga, y el resto de componentes (text encoder, VAE, extra) se comparten entre variantes. El objetivo declarado es la ejecucion en la NPU de telefonos Snapdragon, lo que implica un motor de inferencia propio (Kroma) y no los runners habituales de difusion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con las capacidades propias de SDXL 1.0.
- Ejecucion en la NPU de telefonos con chip Snapdragon mediante la app Kroma.
- Seleccion de formato de pesos (fp16, q8, q4) en la pantalla de descarga de la app.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.
- No se documentan capacidades multilingues especificas; los idiomas figuran como no disponibles.
- No se documenta modo thinking ni ninguna capacidad especial adicional.

## Casos de uso

- Generacion de imagenes en movil sin conexion: la app Kroma descarga los bloques del transformer y ejecuta la inferencia en la NPU del Snapdragon, lo que permite crear imagenes en el propio telefono sin depender de servicios en la nube.
- Prototipado de experiencias creativas en dispositivos de gama alta: al ofrecer variantes q4 y q8, el modelo permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware del telefono.
- Demostraciones de inferencia on-device para investigacion: util para estudiar el rendimiento de SDXL sobre NPU moviles y comparar los formatos fp16, q8 y q4 en condiciones reales.
- Integracion en flujos de trabajo de la app Kroma: los ficheros estan disenados para ser consumidos por el motor de la aplicacion, de modo que sirven como contenido listo para usar dentro de ese ecosistema.
- Evaluacion del impacto de la cuantizacion en difusion: al publicar el mismo transformer en tres precisiones, permite medir la perdida de calidad visual frente al ahorro de memoria en un dispositivo movil.
- Distribucion de modelos de imagen para aplicaciones moviles: el formato por bloques y la descarga gestionada por la app simplifican el reparto de pesos de gran tamano a terminales con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta orientado a la NPU de telefonos Snapdragon, no a GPU de escritorio; el repo ocupa 8,3 GB e incluye variantes q8 y q4 para reducir el espacio y la memoria necesarios.
- GPU recomendadas: no aplica segun la model card; el destino declarado es la NPU de Snapdragon.
- Compatibilidad con GPU de consumo: no documentada. Los ficheros no estan pensados para cargarse en otros programas, por lo que no se garantiza su uso en RTX 4090 u otras GPU.
- Opciones de despliegue: exclusivamente la app Kroma (https://github.com/Pixfanthav/Kroma). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son runners de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-1.0-Kroma | No disponible | No aplica | ONNX y bloques en layout Kroma | CreativeML Open RAIL++-M | Hugging Face, 25 descargas |
| stabilityai/stable-diffusion-xl-base-1.0 | No disponible en esta ficha | No aplica | Safetensors/diffusers | CreativeML Open RAIL++-M | Hugging Face, modelo base oficial |
| Otras conversiones moviles de SDXL | No disponible | No aplica | Variable segun motor | Heredada del base | No disponible |

La comparacion relevante es con el modelo base oficial: misma licencia y mismos pesos de origen, pero distinto empaquetado. SDXL-1.0-Kroma no es intercambiable con el base en herramientas estandar, mientras que el base si lo es. No se dispone de datos de benchmarks para comparar calidad entre ambos.

## Limitaciones y advertencias

- Los ficheros estan en el layout del motor Kroma y no estan pensados para cargarse en otros programas; usarlos fuera de la app puede fallar.
- No hay model card tecnica con datos de entrenamiento, parametros, benchmarks ni evaluacion de sesgos.
- Riesgo de alucinacion visual y de artefactos propio de los modelos de difusion; no se documenta ninguna mitigacion especifica.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso (uso prohibido para ciertos fines) que se aplican a todo lo generado con el modelo.
- El proyecto Kroma es independiente y no esta respaldado por los creadores del modelo base.
- El repositorio tiene un uso muy bajo (25 descargas, 0 likes), lo que limita la validacion por parte de la comunidad.
- No se documentan idiomas soportados ni limitaciones de contexto.
- Al ser una conversion no oficial, no hay garantia de mantenimiento ni de actualizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pixfanthav/SDXL-1.0-Kroma
- Repositorio de la app Kroma: https://github.com/Pixfanthav/Kroma
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
