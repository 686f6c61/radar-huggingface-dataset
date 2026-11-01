# Pablo2815/Moss-image-nsfw-uncensored-lora-GGUF

## Resumen

MOSS-Image NSFW Uncensored LoRA GGUF es un adaptador LoRA en formato GGUF para generación de imágenes de texto a imagen, publicado por el usuario Pablo2815 en HuggingFace. Se trata de una conversión a GGUF de los adaptadores LoRA de fotografía adulta del repositorio `axiomofmind/Moss-image-nsfw-uncensored-lora`, pensados para aplicarse en tiempo de inferencia sobre el modelo base `axiomofmind/Moss-Image-SFT-GGUF` sin necesidad de fusionar los pesos para cada cuantización o escala.

El adaptador tiene 37.158.912 parámetros y un tamaño de repositorio de 0,2 GB, con dos ficheros GGUF de 70,9 MiB cada uno que contienen 504 tensores LoRA en F16, con rango 16 y alpha 16. Su función es modificar el comportamiento del modelo base MOSS-Image (un diffusion transformer con codificador de texto Qwen3.5-9B y VAE oficial MOSS/FLUX.2) para especializarlo en fotografía adulta, manteniendo la fuerza del adaptador ajustable en el momento de la inferencia.

La relevancia de este adaptador es acotada: no es un modelo autónomo, sino un componente que requiere el transformer base, el codificador de texto, el tokenizer y el VAE del ecosistema MOSS-Image, además de una compilación de stable-diffusion.cpp con soporte MOSS. Está licenciado bajo Apache 2.0 y marcado como contenido no apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre diffusion transformer MOSS-Image |
| Parametros totales | 37.158.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 con 504 tensores en F16, diseñado para inyectarse en las capas del diffusion transformer del modelo base MOSS-Image. No contiene el transformer de difusión, el codificador de texto Qwen3.5-9B, el tokenizer ni el VAE; todos ellos deben obtenerse por separado del repositorio base. La aplicación se realiza en tiempo de ejecución mediante stable-diffusion.cpp, que en las pruebas reportó la aplicación de los 504 tensores LoRA en cada ejecución.

Se publican dos checkpoints. El primero, `MOSS-Image-NSFW-Uncensored-LoRA-F16.gguf`, preserva el checkpoint original de 2.000 pasos entrenado sobre 221 imágenes, con escala recomendada de 0,7. El segundo, `MOSS-Image-NSFW-Uncensored-LoRA-Alternative-1750-F16.gguf`, corresponde al checkpoint de 1.750 pasos de una ejecución enfocada de 130 imágenes, con escalas sugeridas de 0,7, 0,8 o 0,9 (0,8 como punto de partida). Ambos emplean la frase disparadora `moss_xvstyle`, que debe colocarse al inicio del prompt. No se detalla la composición del dataset de entrenamiento más allá del número de imágenes, ni se indica si hubo RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de imágenes de texto a imagen mediante el modelo base MOSS-Image, con el adaptador aplicado en tiempo de inferencia.
- Especialización en fotografía adulta y contenido explícito, incluyendo composiciones editoriales de cuerpo completo, iluminación lateral y retratos.
- Control de la intensidad del adaptador mediante el parámetro de escala en la etiqueta `<lora:...>`, sin necesidad de fusionar pesos.
- Compatibilidad con cuantizaciones del modelo base (Q8_0 validada; Q4_K_S comparte arquitectura y objetivos LoRA).
- Aplicación en tiempo de ejecución con stable-diffusion.cpp, con modo `at_runtime` explícito.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generación de imágenes, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles; el prompt se procesa mediante el codificador Qwen3.5-9B del modelo base.

## Casos de uso

- Generación de fotografía adulta editorial: el adaptador permite producir composiciones de cuerpo completo con iluminación lateral y estética de revista, usando la frase `moss_xvstyle` al inicio del prompt y una escala de 0,7 a 0,9 según el checkpoint.
- Pruebas de concepto en pipelines de difusión con GGUF: sirve para validar la aplicación de LoRA en tiempo de ejecución sobre cuantizaciones Q8_0 o Q4_K_S sin generar un modelo fusionado por cada escala.
- Investigación sobre control de estilo en diffusion transformers: permite estudiar cómo varía la salida al ajustar la escala del adaptador (0,7 frente a 0,8 o 0,9) manteniendo fijo el resto de parámetros de muestreo.
- Evaluación comparativa de checkpoints: los dos ficheros publicados (2.000 pasos sobre 221 imágenes y 1.750 pasos sobre 130 imágenes) permiten comparar el efecto de distintos regímenes de entrenamiento con el mismo seed y configuración.
- Despliegue local en entornos con stable-diffusion.cpp: útil para equipos que ya trabajan con el ecosistema GGUF y quieren añadir el adaptador a un flujo existente con el modelo base MOSS-Image.
- Reproducción de experimentos documentados: los ejemplos en PowerShell y Bash incluidos en `examples/` permiten replicar las configuraciones validadas (1024×1024, 30 pasos, CFG 3, Euler/discrete, flow shift 5, seed 42).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La model card incluye únicamente una validación cualitativa con siete prompts explícitos para adultos, comparando el modelo base sin adaptador frente a los dos checkpoints del LoRA, con idénticos parámetros de muestreo (1024×1024, 30 pasos, CFG 3, Euler/discrete, flow shift 5, seed 42). En todas las ejecuciones con adaptador, stable-diffusion.cpp reportó la aplicación de 504 de 504 tensores LoRA.

## Requisitos de hardware

- El adaptador por sí solo ocupa 70,9 MiB por fichero GGUF; el requisito real de VRAM lo determina el modelo base MOSS-Image junto con el codificador de texto Qwen3.5-9B y el VAE.
- No se dispone de estimaciones de VRAM para el conjunto completo en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende de la cuantización del transformer base (Q8_0 validada, Q4_K_S compatible) y del codificador Qwen3.5-9B.
- Opciones de despliegue: stable-diffusion.cpp con soporte MOSS (compilación específica), usando `sd-cli` y los modos `--lora-apply-mode at_runtime`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pablo2815/Moss-image-nsfw-uncensored-lora-GGUF | LoRA GGUF sobre MOSS-Image | 37.158.912 | no disponible | Apache 2.0 | HuggingFace |
| axiomofmind/Moss-image-nsfw-uncensored-lora | LoRA original (formato fuente) | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| axiomofmind/Moss-Image-SFT-GGUF | Modelo base MOSS-Image en GGUF | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito para adultos: el adaptador puede generar imágenes sexuales explícitas y está restringido a adultos en jurisdicciones donde ese contenido sea legal.
- Prohibición de uso con menores o sujetos de edad ambigua, abuso, explotación, coerción, imágenes no consentidas o representaciones sexualizadas de personas reales identificables sin consentimiento explícito.
- No es un modelo autónomo: requiere el transformer base MOSS-Image, el codificador Qwen3.5-9B, el tokenizer oficial y el VAE oficial MOSS/FLUX.2, además de una compilación de stable-diffusion.cpp con soporte MOSS.
- Solo se valida Q8_0 del modelo base; Q4_K_S se considera compatible por arquitectura pero no está validado explícitamente.
- Ajustes de guidance distintos de CFG 3 no fueron probados para esta conversión GGUF.
- Riesgo de alucinación y artefactos visuales inherente a los modelos de difusión; no se documentan sesgos específicos en la información disponible.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de la legislación aplicable sobre contenido adulto ni de las condiciones del modelo base.
- El repositorio está marcado como `not-for-all-audiences`; su uso en productos comerciales requiere revisión legal específica por la naturaleza del contenido.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Pablo2815/Moss-image-nsfw-uncensored-lora-GGUF
- LoRA original: https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- Modelo base GGUF: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
