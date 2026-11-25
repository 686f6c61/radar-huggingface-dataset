# sebekblessing/wan22-gpu

## Resumen

Wan 2.2 TI2V-5B Turbo para chips gráficos de teléfono es un empaquetado especializado del modelo de generación de vídeo a partir de imagen (image-to-video) Wan 2.2 TI2V-5B, en su variante Turbo destilada a 4 pasos. Lo desarrolla el usuario sebekblessing a partir del trabajo original de Wan-AI (Alibaba) y de la destilación de quanhaol, y su propósito no es servir como modelo de propósito general, sino como artefacto de despliegue para el motor Anima GPU Engine, que ejecuta la inferencia sobre la GPU integrada de un teléfono mediante OpenCL estándar.

El repositorio no contiene pesos en formato convencional (safetensors o GGUF de llama.cpp), sino ficheros GGUF con un diseño propio del motor: el modelo de difusión de 30 bloques cuantizado a 8 bits, el codificador VAE de Wan 2.2, un decodificador ligero LightTAE y el codificador de texto umT5-XXL en 4 bits (Q4_K_M de city96). El pipeline declarado es image-to-video y el tamaño total del repositorio es de 14,3 GB.

Es relevante ahora porque demuestra una vía para llevar generación de vídeo de 5B parámetros a hardware móvil sin depender de un acelerador neuronal propietario, usando solo OpenCL. La ficha debe leerse con cautela: la información pública es escasa, no hay benchmarks ni especificaciones formales de contexto o idiomas, y la licencia del modelo base Turbo no está declarada explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (Wan 2.2 TI2V-5B) con backbone de 30 bloques; empaquetado para Anima GPU Engine |
| Parametros totales | 9.923.532 (dato del safetensors del repo; el modelo base se denomina 5B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Modelo de difusion a 8 bits (`wan_q8.gguf`); codificador de texto umT5-XXL a 4 bits (Q4_K_M de city96); VAE y decodificador LightTAE en el layout del motor |
| Idiomas soportados | no disponible (el codificador de texto es umT5-XXL, multilingue, pero no se declaran idiomas) |
| Licencia | other / see-notice (Wan 2.2 TI2V-5B es Apache 2.0; la version Turbo no declara licencia) |
| Formato de pesos | GGUF con layout propio del motor Anima (no compatible con llama.cpp ni ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es Wan 2.2 TI2V-5B, un modelo de difusion para generacion de video a partir de imagen. La variante Turbo es una destilacion a 4 pasos de muestreo: cada paso predice el clip limpio y lo vuelve a ruidificar, segun los 4 niveles de ruido definidos en `sigmas.txt`. El empaquetado de sebekblessing trocea el backbone en 30 bloques de 8 bits que el motor lee uno a uno durante el dibujado, lo que reduce el pico de memoria en el dispositivo.

El pipeline descrito en la model card es: el lector de prompts (umT5-XXL en 4 bits) se ejecuta en el procesador con llama.cpp; la imagen inicial pasa por el codificador VAE completo de Wan 2.2 (cada filtro causal 3D recortado a su ultima rebanada temporal); se realizan 4 pasos de dibujado manteniendo la imagen como primer fotograma; y cada fotograma se decodifica con el decodificador pequeno LightTAE para Wan 2.2 (`lighttaew2_2`). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de una imagen inicial (image-to-video) con 4 pasos de muestreo.
- Ejecucion sobre GPU integrada de telefono mediante OpenCL estandar, sin requerir acelerador neuronal propietario.
- Codificacion de prompts de texto mediante umT5-XXL cuantizado a 4 bits, ejecutado en CPU con llama.cpp.
- Decodificacion rapida de fotogramas mediante LightTAE, orientada a reducir el coste de decodificacion en movil.
- Compatibilidad declarada con la app Anima y su gestion de modelos; en Snapdragon 8 Elite se recomienda la variante `wan22-qnn-8elite`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni vision general; es un modelo generativo de video, no un LLM.

## Casos de uso

- Generacion de clips cortos en el propio telefono: el modelo permite crear video a partir de una foto sin subirla a la nube, usando la GPU del dispositivo y los 4 pasos de la destilacion Turbo.
- Prototipado de animaciones para redes sociales: a partir de una imagen fija se obtiene un clip animado en el dispositivo, adecuado para iterar rapidamente sobre ideas antes de renderizar en servidor.
- Demos y aplicaciones educativas de difusion en movil: sirve para mostrar el funcionamiento de un pipeline image-to-video completo (texto, VAE, difusion, decodificacion) sobre OpenCL.
- Integracion en la app Anima: el manifest y los ficheros estan pensados para que la aplicacion los descargue y ejecute cuando el usuario selecciona la GPU para Wan.
- Investigacion sobre cuantizacion y empaquetado de modelos de difusion: los scripts `build/pack_wan.py`, `build/pack_wanenc.py` y `build/pack_taehv.py` documentan el proceso de conversion a layout propio.
- Evaluacion de motores de inferencia movil: permite comparar el rendimiento de OpenCL frente a aceleradores neuronales en tareas de generacion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo: telefonos con GPU integrada compatible con OpenCL estandar; la app Anima da soporte a telefonos sin chip Snapdragon AI.
- En Snapdragon 8 Elite se recomienda la variante `wan22-qnn-8elite` en lugar de este empaquetado.
- VRAM estimada: no disponible de forma explicita; el diseno lee un bloque de 8 bits a la vez para limitar el pico de memoria, y el repo completo ocupa 14,3 GB.
- GPU de escritorio recomendadas: no disponible (el empaquetado esta orientado a movil, no a A100, H100 o RTX 4090).
- Despliegue: Anima GPU Engine con OpenCL; el lector de prompts usa llama.cpp en CPU. No es compatible con vLLM, TGI, Ollama ni ComfyUI segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wan22-gpu (este) | 9.923.532 segun safetensors; base denominada 5B | no aplica | Image-to-video empaquetado para movil (OpenCL) | other / see-notice | Hugging Face, 1325 descargas |
| quanhaol/Wan2.2-TI2V-5B-Turbo | 5B (denominacion) | no aplica | Destilacion a 4 pasos del base | no declarada en su pagina | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | 5B (denominacion) | no aplica | Image-to-video original | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia ambigua: el modelo base Wan 2.2 TI2V-5B es Apache 2.0, pero la version Turbo no declara licencia y este empaquetado usa `other` con un NOTICE; verificar antes de cualquier uso comercial.
- Los ficheros GGUF usan un layout propio del motor Anima y no son cargables en llama.cpp ni ComfyUI.
- No hay informacion sobre sesgos, alucinacion visual ni calidad de los clips generados.
- El rendimiento depende del soporte OpenCL del telefono; en dispositivos con chip Snapdragon AI se recomienda otra variante.
- No se declaran idiomas soportados ni evaluacion multilingue del codificador de texto.
- La discrepancia entre el dato de parametros del safetensors (9,9 millones) y la denominacion 5B del modelo base no esta aclarada en la informacion disponible.
- Uso previsto limitado a movil; no hay garantias de funcionamiento en GPU de escritorio ni en servidores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/wan22-gpu
- Aviso de licencia: https://huggingface.co/sebekblessing/wan22-gpu/blob/main/NOTICE
- Modelo base Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- Modelo original Wan 2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine
