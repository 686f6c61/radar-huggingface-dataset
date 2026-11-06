# daniel042310/Moss-image-nsfw-uncensored-lora-GGUF

## Resumen

Moss-image-nsfw-uncensored-lora-GGUF es un adaptador LoRA en formato GGUF, publicado por el usuario daniel042310, que añade capacidades de generación de fotografía adulta explícita al modelo base MOSS-Image-SFT (un modelo de difusión text-to-image). No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (37.158.912 parámetros en F16, 504 tensores LoRA), diseñados para aplicarse en tiempo de ejecución sobre el transformador de difusión de axiomofmind/Moss-Image-SFT-GGUF mediante stable-diffusion.cpp.

Su razón de ser es práctica: en lugar de fusionar el LoRA con cada cuantización del modelo base (Q8_0, Q4_K_S, etc.), ofrece conversiones GGUF independientes del adaptador cuya intensidad (scale) es ajustable en inferencia. Incluye dos checkpoints: el original de 2.000 pasos entrenado con 221 imágenes y una variante alternativa de 1.750 pasos entrenada con un conjunto más reducido de 130 imágenes.

Es relevante como ejemplo del ecosistema MOSS-Image, una arquitectura de difusión que emplea un codificador de texto Qwen3.5-9B y un VAE compatible con FLUX.2, y que se ejecuta de forma eficiente en hardware de consumo gracias a stable-diffusion.cpp. El contenido que genera es explícito y está restringido a adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image (MOSS-Image, transformador de difusión) |
| Parametros totales | 37.158.912 (504 tensores LoRA) |
| Parametros activos | no disponible (no aplica; no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del codificador de texto Qwen3.5-9B del modelo base) |
| Tipos de cuantizacion | F16 (ambos ficheros del adaptador) |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador Qwen3.5-9B del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16) |

Datos adicionales del adaptador:

| Fichero | Tamano | Checkpoint | Escala recomendada |
|---|---|---|---|
| MOSS-Image-NSFW-Uncensored-LoRA-F16.gguf | 70,9 MiB | Original, 2.000 pasos, 221 imagenes | 0,7 |
| MOSS-Image-NSFW-Uncensored-LoRA-Alternative-1750-F16.gguf | 70,9 MiB | Alternativo, 1.750 pasos, 130 imagenes | 0,8 |

Ambos adaptadores usan rank 16 y alpha 16, con la frase disparadora `moss_xvstyle`, que debe colocarse al inicio del prompt.

## Arquitectura y entrenamiento

El adaptador sigue la tecnica LoRA (Low-Rank Adaptation): en lugar de reentrenar el transformador de difusion completo, se entrenan matrices de bajo rango (rank 16, alpha 16) que se inyectan sobre los pesos del modelo base en tiempo de inferencia. Esto reduce el tamano del artefacto a unos 71 MiB frente a los gigabytes del modelo base, y permite ajustar la intensidad del efecto (scale) sin regenerar el fichero.

El entrenamiento se realizo en dos configuraciones: un checkpoint original de 2.000 pasos sobre 221 imagenes de fotografia adulta, y un checkpoint posterior de 1.750 pasos sobre un conjunto mas enfocado de 130 imagenes (el que actualmente es el adaptador por defecto en el repositorio origen). Los datos de entrenamiento concretos, el hardware empleado y el optimizador no estan disponibles.

La inferencia se apoya en el ecosistema MOSS: un transformador de difusion cuantizado en GGUF, un codificador de texto Qwen3.5-9B, el tokenizador oficial de MOSS y el VAE oficial de MOSS/FLUX.2, todo orquestado por stable-diffusion.cpp con muestreo Euler, scheduler discreto, flow-shift 5 y CFG 3 en las configuraciones validadas.

## Capacidades

- Generacion de imagenes text-to-image con estilo fotografico adulto, activada mediante la frase disparadora `moss_xvstyle`.
- Aplicacion del adaptador en tiempo de ejecucion (runtime LoRA application) sobre transformadores base cuantizados, con intensidad ajustable (escalas probadas: 0,7 a 0,9).
- Compatibilidad con dos checkpoints de estilo distintos: el original (2.000 pasos) y el enfocado (1.750 pasos).
- Integracion con stable-diffusion.cpp mediante la etiqueta `<lora:nombre:escala>` en el prompt.
- Verificacion de aplicacion completa: stable-diffusion.cpp confirma la aplicacion de los 504/504 tensores LoRA en cada ejecucion.
- No incluye modelo base, codificador de texto, tokenizador ni VAE: todos deben obtenerse del repositorio del modelo base.

## Casos de uso

- Generacion de fotografia editorial adulta de ficcion: el adaptador aplica un estilo fotografico adulto consistente sobre el modelo base MOSS-Image-SFT usando el trigger `moss_xvstyle` en prompts de composicion editorial o boudoir.
- Ajuste fino de intensidad estetica: al ser un LoRA aplicable en runtime, el usuario puede probar escalas 0,7, 0,8 o 0,9 para calibrar cuanto estilo adulto se aplica sin regenerar pesos fusionados.
- Experimentacion con checkpoints: se pueden comparar los dos adaptadores incluidos (original y alternativo) con la misma seed y configuracion para elegir el estilo preferido.
- Inferencia local en GPU de consumo: combinado con el modelo base en GGUF (Q8_0 o Q4_K_S) y stable-diffusion.cpp, permite generar imagenes 1024x1024 sin depender de servicios en la nube.
- Automatizacion por lotes: los wrappers de PowerShell y Bash incluidos en `examples/` facilitan la integracion en scripts de generacion por lotes con seed y parametros fijos.
- Reproducibilidad de resultados: la validacion controlada del repositorio usa seed 42, 30 pasos, CFG 3 y muestreo Euler/discrete, configuracion replicable para comparaciones A/B entre modelo base y modelo con adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (FID, CLIP score, etc.) en la informacion disponible. El repositorio incluye una validacion controlada cualitativa: siete prompts de contenido adulto comparados entre el modelo base SFT Q8_0 sin adaptador y con cada uno de los dos adaptadores, manteniendo fijos modelo base, codificador, VAE, resolucion 1024x1024, 30 pasos, CFG 3, Euler/discrete, flow-shift 5 y seed 42. stable-diffusion.cpp reporto la aplicacion completa de 504/504 tensores LoRA en todas las ejecuciones con adaptador.

## Requisitos de hardware

- El propio adaptador ocupa solo 70,9 MiB; el requisito de VRAM lo determina el modelo base MOSS-Image-SFT-GGUF, el codificador de texto Qwen3.5-9B y el VAE (requisitos exactos no disponibles en la informacion proporcionada).
- GPU recomendadas: no disponible; dado el uso de stable-diffusion.cpp con cuantizaciones GGUF (Q8_0 validado, Q4_K_S compatible), es razonable asumir compatibilidad con GPUs de consumo, pero no hay cifras oficiales de VRAM.
- Cabe en GPU de consumo: probable, al tratarse del ecosistema stable-diffusion.cpp con pesos cuantizados; sin datos concretos publicados.
- Despliegue: stable-diffusion.cpp (build con soporte MOSS) mediante `sd-cli`, con `--lora-apply-mode at_runtime` como ruta validada. No hay soporte documentado para ComfyUI, diffusers ni A1111.
- Latencia y throughput: no disponibles; la configuracion validada usa 30 pasos a 1024x1024 con muestreo Euler.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Moss-image-nsfw-uncensored-lora-GGUF | LoRA (adaptador) | 37,2 M | GGUF F16 | Apache 2.0 | Requiere modelo base MOSS-Image-SFT-GGUF y stable-diffusion.cpp |
| MOSS-Image-SFT-GGUF (axiomofmind) | Modelo base text-to-image | no disponible | GGUF (Q8_0, Q4_K_S) | no disponible | Transformador de difusion con codificador Qwen3.5-9B y VAE FLUX.2 |
| Moss-image-nsfw-uncensored-lora (axiomofmind) | LoRA (adaptador origen) | no disponible | no disponible | no disponible | Repositorio fuente del que derivan estas conversiones GGUF |

No se han incluido otras alternativas del ecosistema FLUX/SDXL porque no constan en la informacion disponible y cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Contenido adulto explicito: el adaptador esta pensado unicamente para adultos y solo en jurisdicciones donde dicho contenido es legal. Esta prohibido su uso con menores o sujetos de edad ambigua, abuso, explotacion, coaccion, imagenes no consentidas o representaciones sexualizadas de personas reales identificables sin consentimiento explicito.
- No es un modelo completo: sin el modelo base MOSS-Image-SFT-GGUF, el codificador Qwen3.5-9B, el tokenizador y el VAE, el adaptador no produce nada.
- Configuracion limitada: solo se ha validado CFG 3; otros valores de guidance no han sido probados en esta conversion GGUF.
- Escalas recomendadas acotadas: 0,7 para el checkpoint original y 0,8 (probando 0,7-0,9) para el alternativo; otras escalas no estan documentadas.
- Riesgo de alucinacion visual: al tratarse de un LoRA entrenado con 130-221 imagenes, el estilo puede degradarse en prompts muy alejados del dominio de entrenamiento; no hay datos cuantitativos al respecto.
- Sesgos: el conjunto de entrenamiento es pequeño y tematicamente especifico, por lo que probablemente herede y amplifique sus sesgos esteticos y demograficos; no hay analisis de sesgos publicado.
- Licencia: Apache 2.0 sobre el adaptador, pero la licencia efectiva del resultado depende tambien de la licencia del modelo base, el codificador Qwen3.5-9B y el VAE, que deben revisarse por separado.
- Marcado `not-for-all-audiences` en Hugging Face: el repositorio esta restringido a publico adulto.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/daniel042310/Moss-image-nsfw-uncensored-lora-GGUF
- Repositorio fuente del LoRA (axiomofmind): https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- Modelo base (MOSS-Image-SFT-GGUF): https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
