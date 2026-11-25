# localdadmin/MOSS-Image-SFT-SM

## Resumen

MOSS-Image-SFT-SM es un empaquetado (repack) en formato GGUF del modelo de generación de imágenes MOSS-Image-SFT, desarrollado originalmente por OpenMOSS-Team. El repositorio, publicado por el usuario localdadmin bajo el tag `model-cacher-ng`, no introduce un modelo nuevo sino que reorganiza los pesos del modelo original en una estructura de directorios orientada a pipelines de difusión (modelos de difusión, codificadores de texto, tokenizadores y VAE) y aplica cuantizaciones agresivas para reducir el tamaño en disco.

El paquete combina tres componentes: un modelo de difusión MOSS-Image-SFT cuantizado a UD-Q3_K_XL, un codificador de texto derivado de Qwen3.5-9B cuantizado a Q2_K_S y un VAE `flux2-vae_small.safetensors`. Los pesos en safetensors declarados suman 5.082.308.624 parámetros, aunque esa cifra corresponde al conjunto del repositorio y no necesariamente a un único componente. El tamaño total del repo es de 28,4 GB.

Su relevancia es práctica: permite ejecutar un pipeline de generación de imágenes MOSS en entornos con recursos limitados usando cuantizaciones GGUF de baja precisión, algo que el repositorio original en BF16 no facilita. No obstante, la información publicada por el autor es mínima (la model card es un simple listado de ficheros), por lo que muchos detalles técnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pipeline de difusion (modelo de difusion + codificador de texto Qwen3.5-9B + VAE flux2-vae_small); detalles internos no disponibles |
| Parametros totales | 5.082.308.624 (safetensors declarados en el repo; desglose por componente no disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q3_K_XL (modelo de difusion), Q2_K_S (codificador de texto Qwen3.5-9B), safetensors sin cuantizar (VAE) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de difusion y text encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo de difusion MOSS-Image-SFT; la model card se limita a listar los ficheros empaquetados. Por la estructura del directorio se deduce un pipeline de difusion texto-a-imagen compuesto por un modelo de difusion principal, un codificador de texto basado en Qwen3.5-9B y un VAE (`flux2-vae_small.safetensors`), un esquema habitual en los pipelines de difusion modernos. El modelo base declarado es OpenMOSS-Team/MOSS-Image-Base, con un ajuste posterior (SFT) que da lugar a MOSS-Image-SFT.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas del entrenamiento original. Tampoco se documenta el proceso de cuantizacion aplicado por el autor del repack mas alla de los nombres de fichero (UD-Q3_K_XL y Q2_K_S). Todo ello debe considerarse no disponible en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (texto-a-imagen), segun la naturaleza del pipeline MOSS-Image y el tag `image` del repositorio.
- Codificacion de prompts mediante un codificador de texto basado en Qwen3.5-9B, lo que sugiere comprension de instrucciones textuales complejas en la fase de condicionamiento.
- Decodificacion de latentes a imagen mediante el VAE incluido (`flux2-vae_small.safetensors`).
- Ejecucion en entornos con recursos limitados gracias a las cuantizaciones GGUF de baja precision incluidas.
- Capacidades adicionales (edicion de imagen, inpainting, control por imagen, tool calling, agentes, multilingueismo) no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de generacion de imagenes en estaciones de trabajo con VRAM limitada: las cuantizaciones Q3_K_XL y Q2_K_S reducen el peso del pipeline y permiten probar el modelo MOSS-Image sin disponer de GPUs de gran memoria.
- Integracion en pipelines de difusion basados en ComfyUI u otras herramientas que consumen GGUF: la estructura de directorios (diffusion_models, text_encoders, tokenizers, vae) esta pensada para este tipo de cargadores.
- Generacion de ilustraciones conceptuales y bocetos para equipos de diseno que necesitan iterar rapido con prompts de texto, aprovechando el codificador Qwen3.5-9B para instrucciones detalladas.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad entre el modelo original en BF16 y las versiones Q2/Q3 empaquetadas aqui.
- Despliegue en entornos de investigacion con presupuesto de hardware ajustado, donde el objetivo es reproducir el pipeline MOSS-Image con el menor coste de memoria posible.
- Creacion de datasets sinteticos de imagenes para tareas de aumento de datos, siempre que la licencia Apache 2.0 del modelo base lo permita y se respeten las condiciones de los componentes derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repo completo ocupa 28,4 GB en disco; el modelo de difusion en Q3_K_XL y el text encoder en Q2_K_S reducen notablemente el peso respecto a BF16, pero no se documenta la VRAM exacta necesaria.
- GPU recomendadas: no disponible. Por el tamano del pipeline, se espera que requiera GPUs con memoria suficiente para cargar el modelo de difusion cuantizado, el text encoder de 9B en Q2 y el VAE; GPUs de clase profesional (A100, H100) o consumer de gama alta (RTX 4090, RTX 3090) son candidatas razonables, pero no hay confirmacion en la informacion proporcionada.
- Compatibilidad con GPU consumer: probable en GPUs de 24 GB o mas segun las cuantizaciones, aunque no confirmado oficialmente.
- Opciones de despliegue: al tratarse de GGUF, los cargadores compatibles con GGUF para pipelines de difusion (por ejemplo ComfyUI con nodos GGUF) son la via natural; vLLM, llama.cpp u Ollama no aplican a un modelo de difusion de imagen. No se documentan opciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-SM (este repo) | 5.082.308.624 (total repo) | no disponible | Apache 2.0 | GGUF + safetensors | Repack cuantizado de MOSS-Image-SFT |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | no disponible en la informacion | safetensors (original) | Modelo original sin cuantizar |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | no disponible en la informacion | safetensors | Modelo base antes del SFT |
| Qwen/Qwen3.5-9B | 9B (aproximado por nombre) | no disponible | no disponible en la informacion | safetensors | Codificador de texto usado en el pipeline |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es meramente descriptiva (listado de ficheros) y no documenta arquitectura, entrenamiento, sesgos ni evaluacion; la trazabilidad tecnica es muy baja.
- Al ser un repack de terceros, no hay garantia de que las cuantizaciones hayan sido validadas frente al modelo original; la calidad de imagen puede degradarse respecto a BF16, especialmente en Q2_K_S para el text encoder.
- Riesgo de alucinacion visual y de artefactos propios de modelos de difusion cuantizados; no se documenta ningun mecanismo de mitigacion.
- Idiomas soportados no declarados; el comportamiento multilingue del codificador Qwen3.5-9B en este pipeline no esta verificado.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones de los componentes derivados (MOSS-Image-SFT, Qwen3.5-9B y el VAE) antes de uso comercial, ya que el repack no aclara la licencia efectiva de cada pieza.
- El tag `model-cacher-ng` y la naturaleza del repositorio sugieren un uso como cache/espejo; no hay soporte oficial ni mantenimiento garantizado por parte del autor original.
- No se documentan requisitos de hardware ni rendimiento, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localdadmin/MOSS-Image-SFT-SM
- Modelo original SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Codificador de texto: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizacion GGUF mencionada por el autor: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
