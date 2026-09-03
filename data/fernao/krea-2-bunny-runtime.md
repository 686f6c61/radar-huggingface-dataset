# fernao/Krea-2-Bunny-Runtime

## Resumen

Krea 2 Bunny Runtime es un subconjunto del checkpoint de `krea/Krea-2-Raw`, publicado por el usuario `fernao` en HuggingFace. No es un producto oficial de Krea AI, sino una extracción del modelo base diseñada específicamente para la infraestructura de entrenamiento de Bunny, un framework de fine-tuning. El repositorio conserva únicamente el checkpoint crudo y los componentes necesarios para que el cargador de Krea2 de ai-toolkit funcione correctamente.

El modelo base, Krea 2, es una familia de modelos de difusión texto-imagen de código abierto desarrollada por Krea AI, con versiones RAW (para fine-tuning) y Turbo (para inferencia rápida). Según los resultados de búsqueda, Krea 2 es un modelo de difusión de 12 mil millones de parámetros entrenado desde cero, enfocado en exploración creativa y control de estilo. Este runtime subset es relevante para desarrolladores que necesitan integrar Krea 2 Raw en pipelines de entrenamiento personalizados sin descargar el repositorio completo.

El acceso al repositorio está restringido manualmente (gated) y requiere aceptar la Krea 2 Community License. El tamaño del repositorio es de 35.7 GB, con pesos en formato safetensors y la librería diffusers como pipeline de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-imagen (basado en Krea 2 Raw) |
| Parametros totales | 12 mil millones (segun informacion publica de Krea 2) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Krea 2 es un modelo de difusion de 12 mil millones de parametros entrenado desde cero por Krea AI. La arquitectura exacta no se detalla en la informacion proporcionada, pero se trata de un modelo de difusion para generacion de imagenes a partir de descripciones en lenguaje natural. El modelo base Krea 2 Raw esta disenado para fine-tuning, mientras que la variante Turbo optimiza la inferencia.

Este repositorio concreto, Krea 2 Bunny Runtime, no contiene informacion sobre el entrenamiento del modelo. Es una extraccion del checkpoint de Krea 2 Raw que preserva unicamente los componentes necesarios para el cargador de Krea2 en ai-toolkit, la infraestructura de entrenamiento de Bunny. No se dispone de datos sobre la composicion del dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante difusion.
- Control de estilo y exploracion creativa, segun la descripcion oficial de Krea 2.
- Soporte para fine-tuning: el checkpoint RAW esta disenado para ser adaptado a tareas especificas.
- Integracion con la infraestructura de entrenamiento de Bunny (ai-toolkit) para pipelines de fine-tuning personalizados.
- Compatibilidad con la libreria diffusers de HuggingFace para carga y uso del modelo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Fine-tuning de modelos de imagen para estilos artisticos especificos: el checkpoint RAW permite adaptar el modelo a un estilo visual concreto mediante entrenamiento adicional con datasets propios.
- Integracion en pipelines de entrenamiento con ai-toolkit: el runtime subset esta optimizado para funcionar con el cargador de Krea2 de esta herramienta, facilitando la automatizacion de flujos de fine-tuning.
- Investigacion en generacion de imagenes: los investigadores pueden utilizar este checkpoint como base para experimentos de adaptacion y estudio del comportamiento del modelo.
- Desarrollo de herramientas de diseno asistido por IA: el modelo puede integrarse en aplicaciones de generacion de imagenes para flujos de trabajo creativos.
- Creacion de datasets sinteticos: el modelo puede generar imagenes para aumentar datasets de entrenamiento en tareas de vision por computador.
- Prototipado rapido de aplicaciones de generacion de imagenes: al ser un checkpoint crudo, permite a los desarrolladores construir demos y prototipos sin depender de la API comercial de Krea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento como FID, CLIP score u otras evaluaciones estandar de modelos de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente, pero un modelo de 12 mil millones de parametros en precision BF16 requiere aproximadamente 24 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits, se podria reducir a unos 12 GB.
- GPU recomendadas: para inferencia con el modelo completo se recomiendan GPUs con al menos 24 GB de VRAM, como RTX 3090, RTX 4090, A100 o H100. Para fine-tuning se necesitarian GPUs con mayor capacidad, como A100 de 40 GB o 80 GB.
- Compatibilidad con GPU de consumo: el modelo completo no cabe en GPUs de consumo con menos de 24 GB de VRAM sin cuantizacion. Con cuantizacion a 8 bits o 4 bits, podria ejecutarse en GPUs de 12-16 GB, aunque con posibles perdidas de calidad.
- Opciones de despliegue: al ser un checkpoint para fine-tuning, el despliegue tipico seria mediante diffusers o el codigo de inferencia oficial de Krea 2 disponible en GitHub. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Uso principal |
|---|---|---|---|---|
| Krea 2 Raw (base) | 12B | Difusion texto-imagen | krea-2-community-license | Fine-tuning y generacion creativa |
| Krea 2 Turbo | 12B | Difusion texto-imagen | krea-2-community-license | Inferencia rapida |
| SDXL | 3.5B | Difusion texto-imagen | OpenRAIL++ | Generacion de imagenes generalista |
| FLUX.1 | 12B | Difusion texto-imagen | FLUX.1-dev Non-Commercial License | Generacion de imagenes de alta calidad |

La comparativa se basa en informacion publica de Krea 2 y modelos similares del ecosistema de difusion. Krea 2 Bunny Runtime es un subconjunto de Krea 2 Raw, por lo que sus capacidades son identicas al modelo base, pero empaquetado para un caso de uso especifico.

## Limitaciones y advertencias

- Este repositorio no es un producto oficial de Krea AI y no esta respaldado por la compania.
- El acceso esta restringido manualmente y requiere aceptar la Krea 2 Community License, que puede imponer restricciones al uso comercial.
- Al ser un subconjunto del checkpoint original, puede carecer de componentes necesarios para ciertos casos de uso fuera del entrenamiento con ai-toolkit.
- No se dispone de informacion sobre sesgos del modelo, riesgos de alucinacion o limitaciones de idioma en la informacion proporcionada.
- El modelo puede generar imagenes con sesgos presentes en los datos de entrenamiento, aunque no se han documentado explicitamente.
- Para uso en produccion, se recomienda utilizar la version oficial de Krea 2 Raw o Turbo en lugar de este runtime subset.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fernao/Krea-2-Bunny-Runtime
- Codigo de inferencia oficial de Krea 2: https://github.com/krea-ai/krea-2
- Pagina de Krea 2 Open-Source: https://www.krea.ai/krea-2-open-source
- Pagina oficial de Krea 2: https://www.krea.ai/krea-2
- Licencia Krea 2 Community: https://www.krea.ai/krea-2-licensing
- Guia de Krea 2 en Stable Diffusion Tutorials: https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html
- Krea 2 en Civitai: https://civitai.com/ecosystems/krea2
