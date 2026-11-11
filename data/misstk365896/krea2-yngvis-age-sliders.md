# MissTK365896/Krea2-yngvis-Age-Sliders

## Resumen

Krea2-yngvis-Age-Sliders es una familia de cinco adaptadores LoRA para el modelo de generacion de imagen Krea 2 (base Krea 2 Raw), desarrollada por el usuario MissTK365896 y publicada en Hugging Face. Cada adaptador actua como un "slider" de edad: desplaza la edad aparente de sujetos adultos en generaciones fotorrealistas, hacia una apariencia mas joven o mas madura, segun la version. La familia se divide en cinco pesos: V1 (original NSFW, femenino), V2 (juventud, femenino), V3 (madurez, femenino), V4 (juventud, masculino) y V5 (madurez, masculino), con los cuatro ultimos dentro del conjunto seguro para el trabajo (SFW).

Tecnicamente son LoRA de rango 32/32, entrenados a 1024 px con Musubi Tuner sobre Krea 2 Raw y con datasets privados. El repositorio ocupa 1,1 GB y los pesos se distribuyen en formato `.safetensors`. El modelo esta pensado exclusivamente para sujetos adultos (18+) y su uso esta restringido por la Krea 2 Community License, ademas de la politica de uso aceptable de Krea.

Es relevante ahora porque los sliders de atributos son una de las aplicaciones practicas mas demandadas de los LoRA en pipelines de generacion de imagen: permiten controlar de forma continua un atributo (en este caso la edad) sin reentrenar el modelo base ni recurrir a prompts largos y fragiles. No obstante, se trata de un artefacto de nicho, sin descargas ni likes en el momento de la consulta y con implicaciones eticas y legales que exigen revision previa a cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Krea 2 Raw |
| Parametros totales | no disponible (rango 32/32; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos `.safetensors`; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | krea-2-community-license (Krea 2 Community License Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los cinco pesos son adaptadores LoRA de rango 32/32 entrenados sobre el modelo base Krea 2 Raw mediante Musubi Tuner, a una resolucion de 1024 px. El autor declara el uso de datasets privados, sin especificar composicion, numero de imagenes ni numero de pasos de entrenamiento. No se documenta si hubo etapas de RLHF, DPO ni tecnicas de refinamiento posteriores; en el contexto de un LoRA de difusion, el entrenamiento se limita al ajuste supervisado del adaptador sobre pares imagen-texto.

La innovacion funcional no esta en la arquitectura, sino en el diseno del adaptador como "slider": cada version empuja la representacion latente del sujeto hacia un extremo del eje de edad (juventud o madurez) manteniendo la identidad adulta. La familia se separa por genero (femenino en V1-V3, masculino en V4-V5) y por direccion del slider. El autor indica que los pesos derivan de Krea 2 Raw y que los pesos originales fueron modificados por fine-tuning.

## Capacidades

- Generacion de imagen fotorrealista de sujetos adultos con control de edad aparente mediante un unico trigger word.
- Desplazamiento bidireccional de la edad: versiones "Youth" suavizan marcadores de edad y versiones "Mature" los acentuan.
- Control por genero: adaptadores especificos para sujetos femeninos (V1-V3) y masculinos (V4-V5).
- Ajuste fino de intensidad mediante la fuerza del LoRA (rangos documentados de 0,4 a 1,2 segun version).
- Compatibilidad con los modos base Krea 2 Raw y Turbo, con parametros recomendados de 12 pasos, cfg 1.0 y sampler er_sde + simple.
- Capacidad NSFW limitada a la version V1, sujeta a la politica de uso aceptable de Krea y a la legislacion aplicable.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio: es exclusivamente texto a imagen.

## Casos de uso

- Ilustracion editorial y retrato fotorrealista: usar V2 o V4 con fuerza 0,4-0,8 para representar sujetos adultos con apariencia mas joven sin perder realismo, util en revistas, webs y material de marketing.
- Caracterizacion de personajes en narrativa visual: combinar V3 o V5 con prompts detallados para envejecer de forma controlada a un personaje adulto y mantener coherencia entre escenas de una misma historia.
- Pruebas de envejecimiento en diseno de producto (cosmetica, dermatologia): generar variantes de un mismo sujeto adulto con distintos marcadores de edad para maquetas y presentaciones, siempre con consentimiento y sin uso clinico.
- Prototipado rapido en estudios de creacion de imagen: integrar los LoRA en ComfyUI (`models/loras/`) para iterar sobre el eje de edad sin reentrenar el modelo base, reduciendo coste de experimentacion.
- Investigacion sobre sesgos y control de atributos en difusion: comparar V2 frente a V4 y V3 frente a V5 para estudiar como responde el modelo a instrucciones de edad segun genero, con fines academicos.
- Formacion y divulgacion tecnica: usar los sliders como ejemplo didactico de LoRA de atributo unico, rango 32 y trigger word, en talleres sobre fine-tuning de modelos de difusion.
- Uso personal en la categoria NSFW (V1): exclusivamente para adultos y dentro de los limites de la politica de Krea; no apto para produccion comercial sin revision legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Krea 2 Raw y de la resolucion (896x1216 o 1024x1024 recomendadas). El repositorio del LoRA ocupa 1,1 GB, pero la VRAM la determina el modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor no indica GPU de referencia.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de un LoRA sobre un modelo de difusion de 1024 px, el requisito real es el del modelo base.
- Opciones de despliegue: ComfyUI (ruta `models/loras/`), con los modos Krea 2 Raw o Turbo y sampler er_sde + simple; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea2-yngvis-Age-Sliders | LoRA de edad sobre Krea 2 Raw | no disponible (rango 32/32) | no aplica | sin benchmarks publicados | krea-2-community-license | Hugging Face, 0 descargas |
| Krea 2 Raw (base) | Modelo de difusion texto a imagen | no disponible | no aplica | no disponible en esta ficha | krea-2-community-license | Hugging Face (krea/Krea-2-Raw) |
| Otros LoRA de atributos para Krea 2 | LoRA de atributo | no disponible | no aplica | no disponible | variable | no disponible |
| Alternativas de la misma categoria (sliders de edad en otros modelos de difusion) | LoRA de atributo | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa se limita a situar el adaptador frente a su modelo base y a la categoria generica de LoRA de atributos.

## Limitaciones y advertencias

- Restriccion de edad estricta: todos los sliders son para sujetos adultos (18+); generar, implicar o simular a menores, o contenido sexual con menores, viola la politica de uso aceptable de Krea (clausulas 1-2) y la ley aplicable, y termina la licencia.
- La version V1 contiene pesos NSFW; debe mantenerse en uso personal o de trabajo y no mezclarse con pipelines publicos.
- El trigger word es obligatorio (`yngvis` en V1-V4, `mature` en V5); sin el, el efecto es marginal.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir artefactos, manos deformes, incoherencias anatomicas o atributos de edad no deseados, especialmente fuera del rango de fuerza recomendado.
- Sesgos conocidos: el adaptador esta entrenado por genero (femenino/masculino) y sobre datasets privados no documentados; puede reproducir sesgos de representacion de edad, etnia y cuerpo.
- Cobertura limitada a ingles; no se documenta soporte multilingue.
- Licencia: es una derivada de Krea 2 sujeta a la Krea 2 Community License; no es un producto oficial de Krea.ai ni esta respaldada por la empresa. El uso comercial requiere revisar los terminos de la licencia y la politica de uso aceptable.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad ni de reproducibilidad.
- No apto para produccion sin auditoria legal y etica previa, especialmente por la combinacion de control de edad y contenido NSFW.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MissTK365896/Krea2-yngvis-Age-Sliders
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Krea (sitio oficial): https://krea.ai
- Musubi Tuner (herramienta de entrenamiento citada): no disponible enlace en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
