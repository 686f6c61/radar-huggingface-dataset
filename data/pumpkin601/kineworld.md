# pumpkin601/KineWorld

## Resumen

KineWorld es un modelo de mundo (world model) condicionado por acciones, construido sobre el backbone de video Wan2.2-TI2V-5B. Lo publica el usuario pumpkin601 en Hugging Face y esta vinculado al repositorio GitHub pumpkin601/KineWorld y a la iniciativa KineWorld, una iniciativa de investigacion con sede en Hefei (China) centrada en modelos de mundo compactos y no basados en LLM para planificacion y control. El objetivo es que un agente robotico pueda anticipar las consecuencias visuales de sus acciones antes de ejecutarlas.

El modelo combina un generador de doble flujo RGB/flujo optico, un modulo de prediccion de acciones y el backbone de difusion de video Wan2.2-TI2V-5B. Se entreno sobre datos de camara de cabeza de RoboTwin, con acciones de 14 dimensiones y flujo optico exclusivamente robotico, partiendo de un checkpoint previo de accion/modelo de mundo en lugar de desde cero. El repositorio publicado corresponde al checkpoint `step-500`, fruto de 500 pasos de optimizador sobre 24 aceleradores.

La relevancia actual del modelo radica en su enfoque de mundo fisico verificable: el autor publica hashes SHA-256, estadisticas de normalizacion de acciones y una configuracion parcial, aunque advierte que no hay puntuaciones de benchmark ni calidad de video generado establecidas, y que no se ha demostrado que reproduzca los resultados del manuscrito KineWorld V4. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de video Wan2.2-TI2V-5B con generador de doble flujo RGB/flujo optico y modulo de prediccion de acciones |
| Parametros totales | no disponible de forma explicita; el backbone base es Wan2.2-TI2V-5B (5 B segun nomenclatura) y el checkpoint contiene 2.019 tensores en 13,1 GB |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable / no disponible (modelo de difusion de video, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`step-500.safetensors`), mas `action_norm_stats.npz` |

## Arquitectura y entrenamiento

KineWorld no es un transformer de lenguaje, sino un modelo de mundo condicionado por acciones apoyado en el backbone de generacion de video Wan2.2-TI2V-5B. Sobre ese backbone se anaden dos componentes: un generador de doble flujo que procesa simultaneamente RGB y flujo optico, y un modulo de prediccion de acciones. El modulo de acciones opera con vectores de 14 dimensiones y el flujo optico se calcula exclusivamente sobre la parte robotica de la escena.

El entrenamiento abarco 500 pasos de optimizador distribuidos en 24 aceleradores, sobre datos de camara de cabeza de RoboTwin. El modelo se inicializo con warm-start desde un checkpoint anterior de accion/modelo de mundo (SHA-256 `21940bd45e95dc39bc3b166c6ecd2a777efa01c8068124958778173cd01ddf66`), no desde cero. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion. El codigo publico y la configuracion son un subconjunto de la implementacion de investigacion: algunos componentes y el dataset de entrenamiento no se han publicado, por lo que no se ofrece una reproduccion completa del entrenamiento.

## Capacidades

- Generacion de video condicionada por acciones: produce fotogramas futuros a partir del estado visual y de una accion de 14 dimensiones.
- Prediccion de flujo optico robotico como flujo auxiliar dentro del modelo de doble corriente.
- Prediccion de acciones mediante un modulo dedicado, integrable en una ruta de politica sobre RoboTwin.
- Modelado de mundo para robotica: anticipacion de consecuencias visuales de acciones antes de su ejecucion.
- Integracion con el pipeline de generacion de video de WorldArena2 Track 1.
- Soporte del flujo de politica RoboTwin con las estadisticas de normalizacion de acciones incluidas (`action_norm_stats.npz`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni razonamiento de texto.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles.
- No se documentan modos especiales como thinking mode, vision-language chat ni audio.

## Casos de uso

- Investigacion en modelos de mundo para robotica: usar KineWorld para anticipar el resultado visual de una accion antes de ejecutarla, comparando futuros imaginados en el espacio de video.
- Aprendizaje de politicas sobre RoboTwin: emplear el modulo de prediccion de acciones junto con `action_norm_stats.npz` para integrar el modelo en la ruta de politica del simulador, usando la normalizacion publicada para que las acciones sean consistentes.
- Evaluacion en WorldArena2 Track 1: encajar el modelo en el pipeline de generacion de video del track para generar trayectorias visuales condicionadas por acciones.
- Generacion de video condicionada por acciones para depuracion: producir secuencias sinteticas que ayuden a inspeccionar como responde un robot a distintos comandos de 14 dimensiones.
- Prediccion de flujo optico robotico: utilizar la corriente de flujo optico para analizar movimiento relativo de la escena robotica de forma aislada.
- Base para fine-tuning en nuevos dominios roboticos: partir del checkpoint `step-500` con warm-start para adaptar el modelo de mundo a otras plataformas o camaras, reutilizando el backbone Wan2.2-TI2V-5B.
- Reproduccion y auditoria de artefactos de investigacion: verificar los hashes SHA-256 publicados y comparar el subconjunto de configuracion frente a la implementacion completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se ha establecido ninguna puntuacion de benchmark ni calidad de video generado para este checkpoint, y que no se ha demostrado que reproduzca los resultados del manuscrito KineWorld V4.

## Requisitos de hardware

- Tamano del checkpoint: 13.113.498.528 bytes (aproximadamente 13,1 GB) en `step-500.safetensors`, con 2.019 tensores.
- VRAM estimada: a partir del tamano del checkpoint, los pesos en precision de 16 bits ocupan en torno a 13 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para una inferencia sin offloading. Es una estimacion derivada del tamano del fichero, no un dato publicado por el autor.
- GPU recomendadas: no disponibles de forma explicita; por el tamano del checkpoint y tratarse de un modelo de difusion de video, son razonables GPU de clase A100 o H100, aunque el autor no lo especifica.
- GPU de consumo: no confirmado. Una GPU de 24 GB (por ejemplo, RTX 4090) podria ser el minimo teorico segun el tamano de pesos, pero no hay confirmacion del autor.
- Opciones de despliegue: el autor remite al repositorio GitHub de KineWorld para la puesta en marcha del codigo fuente y los comandos de inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM y no aplicables a este modelo de video).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KineWorld (pumpkin601) | ~5 B en backbone Wan2.2-TI2V-5B; checkpoint de 13,1 GB | no aplicable | sin benchmarks publicados | apache-2.0 | checkpoint `step-500` en Hugging Face; repo GitHub con subconjunto de codigo |
| Wan2.2-TI2V-5B (modelo base) | 5 B segun nomenclatura | no aplicable | no disponible en esta informacion | no disponible en esta informacion | disponible como modelo base referenciado |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar KineWorld con modelos de mundo condicionados por acciones de terceros dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No se ha establecido ninguna puntuacion de benchmark ni calidad de video generado para este checkpoint.
- No se ha demostrado que reproduzca los resultados del manuscrito KineWorld V4.
- El codigo publico y la configuracion son un subconjunto de la implementacion de investigacion; algunos componentes y el dataset de entrenamiento no se publican, por lo que no hay reproduccion completa del entrenamiento.
- El archivo de checkpoint estaba en proceso de subida en el momento de la publicacion de la model card, por lo que la disponibilidad efectiva del peso puede no estar garantizada.
- Los pesos base de Wan, el tokenizer, los recursos de RoboTwin y los datos de entrenamiento son dependencias separadas que no se incluyen en el repositorio.
- El modelo esta etiquetado unicamente para ingles y no documenta capacidades multilingues.
- Se trata de un artefacto de investigacion en fase temprana (0 descargas y 0 likes en el momento del registro), sin senales de validacion por la comunidad.
- No se documentan sesgos conocidos, riesgos de alucinacion ni restricciones adicionales de uso comercial mas alla de la licencia apache-2.0.
- La licencia apache-2.0 permite uso comercial, pero el estado inmaduro del checkpoint y la falta de benchmarks desaconsejan su uso en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pumpkin601/KineWorld
- Repositorio GitHub: https://github.com/pumpkin601/KineWorld
- Organizacion KineWorld en GitHub: https://github.com/kineworld
- Ficha en StartupHub.ai: https://www.startuphub.ai/products/kineworld
- Perfil en StartupHub.ai: https://www.startuphub.ai/startups/kineworld
