# Qarvexium/Qanvas

## Resumen

Qanvas es un modelo de generacion de texto a imagen desarrollado por Qarvexium con el objetivo especifico de funcionar en dispositivos moviles, reduciendo el consumo de memoria y la potencia de calculo necesaria frente a modelos de escritorio. El proyecto se encuentra en una fase temprana de desarrollo: el tokenizador QED-Base-V1, el codificador de texto QLIP y el autoencoder Q-VAE estan completados, pero el generador principal de latentes esta en fase de reentrenamiento. La propuesta tecnica busca que el modelo comprenda el significado de los prompts mediante representaciones basadas en conocimiento, en lugar de memorizar plantillas, lo que lo diferencia de enfoques puramente estadisticos. Su relevancia actual radica en la creciente demanda de generacion de imagenes eficiente en entornos con recursos limitados, como telefonos y tablets, donde los modelos convencionales no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion con codificador de texto QLIP (estilo CLIP) y VAE personalizado Q-VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura de Qanvas se compone de tres modulos diferenciados. El tokenizador QED-Base-V1, reutilizado de un proyecto previo, se encarga de convertir texto en tokens. El codificador QLIP es un codificador de texto ligero de estilo CLIP, entrenado desde cero, que busca alinear semanticamente textos e imagenes de forma eficiente en recursos. El Q-VAE es un autoencoder variacional personalizado, tambien entrenado desde cero, que comprime y reconstruye latentes de imagen. El generador principal, denominado Qanvas Generator, es un modelo de difusion latente que condiciona la generacion de imagenes a partir de las embeddings de QLIP. Actualmente este generador esta en fase de reentrenamiento, lo que indica que la arquitectura final aun no esta consolidada. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, con el objetivo declarado de comprender el significado del prompt en lugar de memorizar plantillas.
- Compresion y reconstruccion de latentes de imagen mediante el Q-VAE, lo que permite reducir la carga computacional en la generacion.
- Alineacion semantica texto-imagen a traves del codificador QLIP, disenado para ser ligero y eficiente.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, vision adicional, audio u otras capacidades mas alla de la generacion de imagenes.

## Casos de uso

- Generacion de imagenes en dispositivos moviles: el modelo esta disenado para ejecutarse en telefonos y tablets, permitiendo crear ilustraciones, bocetos o conceptos visuales sin necesidad de hardware de escritorio.
- Prototipado rapido de diseno: un disenador puede generar variaciones de una idea a partir de descripciones textuales directamente en su tablet, acelerando la exploracion de conceptos.
- Creacion de contenido para redes sociales: usuarios pueden producir imagenes personalizadas para publicaciones sin depender de servicios en la nube, reduciendo latencia y costes.
- Asistencia educativa: generar diagramas o visualizaciones simples a partir de descripciones de texto en entornos con recursos limitados, como aulas con dispositivos de gama baja.
- Accesibilidad: permitir a personas con discapacidad visual crear imagenes descriptivas a partir de texto, usando un modelo que cabe en un dispositivo personal.
- Desarrollo de aplicaciones offline: integrar Qanvas en apps que necesiten generacion de imagenes sin conexion, como juegos o herramientas de creatividad, gracias a su bajo consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto esta en fase de desarrollo y no se han reportado metricas como FID, CLIP score, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos de VRAM, GPU recomendadas ni opciones de despliegue.
- Dado el objetivo de funcionar en dispositivos moviles, se espera que el modelo sea ejecutable en hardware de gama media-baja, pero no hay datos concretos.
- No se dispone de informacion sobre latencia, throughput ni frameworks de inferencia compatibles (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos de generacion de texto a imagen, como Stable Diffusion, FLUX o SDXL-Turbo, ni datos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo esta en fase de desarrollo: el generador principal esta en reentrenamiento, por lo que no es apto para uso en produccion.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia MIT permite uso comercial, pero al no haber version estable ni documentacion de rendimiento, su adopcion en entornos productivos es arriesgada.
- No se especifican los idiomas soportados, lo que limita su uso en aplicaciones multilingues.
- La ausencia de benchmarks y de especificaciones tecnicas detalladas impide evaluar su calidad real frente a alternativas consolidadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qarvexium/Qanvas
- No se han encontrado papers, repositorios adicionales, blogs o demos en la informacion proporcionada.
